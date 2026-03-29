import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const REFLECTION_PROMPT = `You are the Stoic Sage reflection companion for sagereasoning.com. A user is reflecting on their day — what happened and how they responded. Your role is to score their actions, acknowledge what they did well, and show what a Stoic sage would have done differently.

Score the user's described actions against the four virtues:
- Wisdom (Phronesis) — 30%: Did they reason well? Did they distinguish what matters from what doesn't?
- Justice (Dikaiosyne) — 25%: Did they treat others fairly? Did they serve the common good?
- Courage (Andreia) — 25%: Did they face difficulty head-on? Did they do what was right despite discomfort?
- Temperance (Sophrosyne) — 20%: Were they measured? Did they avoid excess in reaction or emotion?

Be warm but honest. The user is here to grow, not to be flattered.

Return ONLY valid JSON:
{
  "wisdom_score": <0-100>,
  "justice_score": <0-100>,
  "courage_score": <0-100>,
  "temperance_score": <0-100>,
  "total_score": <weighted total>,
  "what_you_did_well": "<1-2 sentences: specific virtues the user expressed today>",
  "sage_perspective": "<2-3 sentences: what a Stoic sage would have done differently, if anything. Be specific to their situation. If they acted well, affirm it.>",
  "evening_prompt": "<1 sentence: a reflective question for the user to sit with tonight, drawn from their specific situation>"
}`

// POST — Submit a daily reflection
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { what_happened, how_i_responded, user_id } = await request.json()

    const textLengthError = validateTextLength(what_happened, 'what_happened', TEXT_LIMITS.medium)
    if (textLengthError) {
      return NextResponse.json({ error: textLengthError }, { status: 400 })
    }

    if (how_i_responded) {
      const responseError = validateTextLength(how_i_responded, 'how_i_responded', TEXT_LIMITS.medium)
      if (responseError) {
        return NextResponse.json({ error: responseError }, { status: 400 })
      }
    }

    if (!what_happened || typeof what_happened !== 'string' || what_happened.trim().length < 10) {
      return NextResponse.json(
        { error: 'what_happened is required (describe what happened today, min 10 characters)' },
        { status: 400 }
      )
    }

    const userMessage = `Daily reflection:

What happened: ${what_happened.trim()}
${how_i_responded?.trim() ? `How I responded: ${how_i_responded.trim()}` : ''}

Score my actions and give me the sage perspective.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.3,
      system: [{ type: 'text', text: REFLECTION_PROMPT, cache_control: { type: 'ephemeral' } }],
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
      console.error('Reflection scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    const tier = getAlignmentTier(scoreData.total_score)

    // Save reflection if user_id provided
    if (user_id) {
      await supabaseAdmin
        .from('reflections')
        .insert({
          user_id,
          what_happened: what_happened.trim(),
          how_responded: how_i_responded?.trim() || null,
          total_score: scoreData.total_score,
          wisdom_score: scoreData.wisdom_score,
          justice_score: scoreData.justice_score,
          courage_score: scoreData.courage_score,
          temperance_score: scoreData.temperance_score,
          alignment_tier: tier,
          sage_perspective: scoreData.sage_perspective,
          evening_prompt: scoreData.evening_prompt,
        })
        .then(() => {})
    }

    const result = {
      ...scoreData,
      alignment_tier: tier,
      reflected_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'daily_reflection',
        user_id: user_id || null,
        metadata: {
          total_score: scoreData.total_score,
          tier,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Reflection API error:', error)
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
