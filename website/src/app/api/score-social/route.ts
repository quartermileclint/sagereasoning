import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { V3_SOCIAL_MEDIA_PROMPT, PROXIMITY_ENGLISH } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// V3 Social Media Evaluation Response Type
interface V3SocialMediaScore {
  poster_passions: Array<{
    root_passion: string
    sub_species: string
    evidence: string
    false_judgement: string
  }>
  reader_triggered_passions: Array<{
    root_passion: string
    sub_species: string
    evidence: string
    false_judgement: string
  }>
  false_judgements: string[]
  corrections: string[]
  katorthoma_proximity: KatorthomaProximityLevel
  disclaimer: string
}

// Determine publish recommendation based on proximity level
function getPublishRecommendation(proximity: KatorthomaProximityLevel): 'publish' | 'revise' | 'reconsider' {
  if (proximity === 'sage_like' || proximity === 'principled') {
    return 'publish'
  } else if (proximity === 'deliberate') {
    return 'revise'
  } else {
    // habitual or reflexive
    return 'reconsider'
  }
}

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

    // Check cache first
    const ck = cacheKey('/api/score-social', { text: trimmed, platform, context })
    const cached = cacheGet(ck) as V3SocialMediaScore | undefined
    if (cached) {
      const publish_recommendation = getPublishRecommendation(cached.katorthoma_proximity)
      const proximity_label = PROXIMITY_ENGLISH[cached.katorthoma_proximity]
      return NextResponse.json({
        poster_passions: cached.poster_passions,
        reader_triggered_passions: cached.reader_triggered_passions,
        false_judgements: cached.false_judgements,
        corrections: cached.corrections,
        katorthoma_proximity: cached.katorthoma_proximity,
        proximity_label,
        publish_recommendation,
        character_count: trimmed.length,
        platform: platform || null,
        scored_at: new Date().toISOString(),
        disclaimer: cached.disclaimer,
        ai_generated: true,
        ai_model: MODEL_FAST,
      }, { headers: corsHeaders() })
    }

    const message = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 768,
      temperature: 0.2,
      system: [{ type: 'text', text: V3_SOCIAL_MEDIA_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scoreData: V3SocialMediaScore
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

    // Derive publish recommendation from proximity level
    const publish_recommendation = getPublishRecommendation(scoreData.katorthoma_proximity)

    // Format proximity level for display
    const proximity_label = PROXIMITY_ENGLISH[scoreData.katorthoma_proximity]

    const result = {
      poster_passions: scoreData.poster_passions,
      reader_triggered_passions: scoreData.reader_triggered_passions,
      false_judgements: scoreData.false_judgements,
      corrections: scoreData.corrections,
      katorthoma_proximity: scoreData.katorthoma_proximity,
      proximity_label,
      publish_recommendation,
      character_count: trimmed.length,
      platform: platform || null,
      scored_at: new Date().toISOString(),
      disclaimer: scoreData.disclaimer,
    }

    // Cache the result
    cacheSet(ck, scoreData)

    // Analytics — event_type is now 'social_score_v3'
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'social_score_v3',
        metadata: {
          katorthoma_proximity: scoreData.katorthoma_proximity,
          proximity_label,
          platform: platform || 'unknown',
          recommendation: publish_recommendation,
          poster_passions_count: scoreData.poster_passions.length,
          reader_passions_count: scoreData.reader_triggered_passions.length,
        },
      })
      .then(() => {})

    // Add AI transparency metadata (NAIC guidance; OECD principles)
    return NextResponse.json(
      {
        ...result,
        ai_generated: true,
        ai_model: MODEL_FAST,
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
