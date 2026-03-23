import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const DECISION_SCORING_PROMPT = `You are the Stoic Sage decision advisor for sagereasoning.com. A user is weighing a decision and wants to see each option scored against Stoic virtue.

For EACH option provided, score it independently on the four cardinal virtues:
- Wisdom (Phronesis) — 30%: Is this option well-reasoned? Does it reflect understanding of what is truly good vs merely preferred?
- Justice (Dikaiosyne) — 25%: Is this option fair to all affected? Does it serve the common good?
- Courage (Andreia) — 25%: Does this option require the person to act rightly despite difficulty or fear?
- Temperance (Sophrosyne) — 20%: Is this option measured and moderate? Does it avoid excess?

Scoring scale: 0–100 per virtue.

Return ONLY valid JSON — an array with one object per option:
[
  {
    "option": "<the option text>",
    "wisdom_score": <0-100>,
    "justice_score": <0-100>,
    "courage_score": <0-100>,
    "temperance_score": <0-100>,
    "total_score": <weighted total>,
    "reasoning": "<2-3 sentences: virtue analysis specific to this option>",
    "stoic_insight": "<1 sentence: what would a Stoic sage say about this choice?>"
  }
]

After the options array, do NOT add any other text. The array is the complete response.`

interface OptionScore {
  option: string
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  alignment_tier: string
  reasoning: string
  stoic_insight: string
}

// POST — Score a decision with multiple options
export async function POST(request: NextRequest) {
  try {
    const { decision, options, context } = await request.json()

    if (!decision || typeof decision !== 'string' || decision.trim().length === 0) {
      return NextResponse.json({ error: 'decision is required' }, { status: 400 })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 options are required (array of strings)' },
        { status: 400 }
      )
    }

    if (options.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 options allowed' },
        { status: 400 }
      )
    }

    const optionsList = options
      .map((o: string, i: number) => `Option ${i + 1}: ${o.trim()}`)
      .join('\n')

    const userMessage = `Decision: ${decision.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}

Options to evaluate:
${optionsList}

Score each option. Return the JSON array.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      temperature: 0.2,
      system: DECISION_SCORING_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let scoreData: OptionScore[]
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Decision scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    // Add alignment tiers
    const enriched = scoreData.map((opt) => ({
      ...opt,
      alignment_tier: getAlignmentTier(opt.total_score),
    }))

    // Sort by total_score descending
    enriched.sort((a, b) => b.total_score - a.total_score)

    const result = {
      decision: decision.trim(),
      options_scored: enriched,
      recommended: enriched[0]?.option || null,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'decision_score',
        metadata: {
          num_options: options.length,
          top_score: enriched[0]?.total_score,
          top_tier: enriched[0]?.alignment_tier,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error('Decision score API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
