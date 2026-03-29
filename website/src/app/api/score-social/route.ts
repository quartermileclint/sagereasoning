import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SOCIAL_SCORING_PROMPT = `You are the Stoic Sage social media filter for sagereasoning.com. You score short-form text (social media posts, tweets, comments) against Stoic virtue BEFORE the user publishes.

This is a pre-publish check. Be practical and direct — the user wants to know if they should post this or revise it.

Score against the four cardinal virtues:
- Wisdom (Phronesis) — 30%: Is this well-reasoned? Does it add genuine insight or is it reactive/impulsive?
- Justice (Dikaiosyne) — 25%: Is this fair to all mentioned or implied parties? Would a reasonable person feel treated fairly?
- Courage (Andreia) — 25%: Does this express genuine conviction, or is it performative outrage, virtue signalling, or crowd-pleasing?
- Temperance (Sophrosyne) — 20%: Is the tone measured? Does it avoid sarcasm, contempt, or emotional excess?

Be especially alert to:
- Reactive anger disguised as "truth-telling"
- Passive-aggressive phrasing
- Public shaming or dog-piling tendencies
- Humble-bragging or status signalling
- Catastrophising or fear-mongering

Return ONLY valid JSON:
{
  "wisdom_score": <0-100>,
  "justice_score": <0-100>,
  "courage_score": <0-100>,
  "temperance_score": <0-100>,
  "total_score": <weighted total>,
  "publish_recommendation": "<publish | revise | reconsider>",
  "reasoning": "<1-2 sentences: what a sage would think about this post>",
  "revision_suggestion": "<1 sentence: if score < 70, suggest a more virtuous way to express the same idea. If score >= 70, say 'No revision needed.'>"
}`

// POST — Score a social media post before publishing
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { text, platform, context } = await request.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'text is required — the post you want to score before publishing' },
        { status: 400 }
      )
    }

    const textErr = validateTextLength(text, 'text', TEXT_LIMITS.medium)
    if (textErr) {
      return NextResponse.json({ error: textErr }, { status: 400 })
    }

    // Social media is short-form — cap at 2000 characters
    const trimmed = text.trim().slice(0, 2000)

    const userMessage = `Score this social media post before I publish it:
${platform ? `Platform: ${platform}\n` : ''}${context ? `Context: ${context}\n` : ''}
"${trimmed}"

Return the JSON score.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.2,
      system: [{ type: 'text', text: SOCIAL_SCORING_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scoreData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Social scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    const tier = getAlignmentTier(scoreData.total_score)

    const result = {
      ...scoreData,
      alignment_tier: tier,
      character_count: trimmed.length,
      platform: platform || null,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'social_score',
        metadata: {
          total_score: scoreData.total_score,
          tier,
          platform: platform || 'unknown',
          recommendation: scoreData.publish_recommendation,
        },
      })
      .then(() => {})

    // Add AI transparency metadata (NAIC guidance; OECD principles)
    return NextResponse.json(
      {
        ...result,
        ai_generated: true,
        ai_model: 'claude-sonnet-4-6',
        disclaimer: 'This score is AI-generated using Stoic virtue criteria. It is for personal reflection only. See sagereasoning.com/transparency',
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('Social score API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
