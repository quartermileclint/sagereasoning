import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const DECISION_SCORING_PROMPT = `You are the Stoic Sage decision advisor for sagereasoning.com. A user is weighing a decision and wants to see each option evaluated against Stoic virtue.

For EACH option, evaluate whether it aligns with KATORTHOMA (right action in accordance with nature and virtue):

1. KATORTHOMA PROXIMITY: How close is this option to Stoic excellence?
   - reflexive: Action contradicts Stoic virtue; driven by base impulse
   - habitual: Action shows some virtue alignment but lacks conscious discipline
   - deliberate: Action reflects conscious virtue; intentional Stoic practice
   - principled: Action exemplifies virtue integration; reason governs all aspects
   - sage_like: Action embodies the integrated wisdom of a Stoic sage

2. PASSIONS DETECTED: Identify irrational passions that might distort judgment:
   - root_passion: one of epithumia (base desire), hedone (pleasure-seeking), phobos (fear), lupe (distress)
   - sub_species: the specific form (e.g., "honor-seeking", "shame-avoidance", "financial anxiety")
   - false_judgement: what false belief fuels this passion?

3. KATHEKON QUALITY: Is this the right action given circumstances?
   - is_kathekon: boolean — whether this option constitutes proper duty
   - kathekon_quality: strong/moderate/marginal/contrary — the strength of duty alignment

Return ONLY valid JSON — an array with one object per option:
[
  {
    "option": "<the option text>",
    "katorthoma_proximity": "reflexive" | "habitual" | "deliberate" | "principled" | "sage_like",
    "passions_detected": [
      {
        "root_passion": "epithumia" | "hedone" | "phobos" | "lupe",
        "sub_species": "<specific form>",
        "false_judgement": "<the false belief behind it>"
      }
    ],
    "is_kathekon": boolean,
    "kathekon_quality": "strong" | "moderate" | "marginal" | "contrary",
    "stoic_insight": "<1 sentence: what does a Stoic sage notice about this choice?>"
  }
]

After the options array, do NOT add any other text. The array is the complete response.`

interface PassionDetected {
  root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
  sub_species: string
  false_judgement: string
}

interface OptionScore {
  option: string
  katorthoma_proximity: KatorthomaProximityLevel
  passions_detected: PassionDetected[]
  is_kathekon: boolean
  kathekon_quality: 'strong' | 'moderate' | 'marginal' | 'contrary'
  stoic_insight: string
}

// POST — Score a decision with multiple options
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { decision, options, context } = await request.json()

    if (!decision || typeof decision !== 'string' || decision.trim().length === 0) {
      return NextResponse.json({ error: 'decision is required' }, { status: 400 })
    }

    const decisionErr = validateTextLength(decision, 'Decision', TEXT_LIMITS.short)
    if (decisionErr) return NextResponse.json({ error: decisionErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })

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
      system: [{ type: 'text', text: DECISION_SCORING_PROMPT, cache_control: { type: 'ephemeral' } }],
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

    // Sort by katorthoma_proximity level (sage_like > principled > deliberate > habitual > reflexive)
    const proximityRank: Record<KatorthomaProximityLevel, number> = {
      sage_like: 5,
      principled: 4,
      deliberate: 3,
      habitual: 2,
      reflexive: 1,
    }

    scoreData.sort((a, b) => proximityRank[b.katorthoma_proximity] - proximityRank[a.katorthoma_proximity])

    const result = {
      decision: decision.trim(),
      options_scored: scoreData,
      recommended: scoreData[0]?.option || null,
      scored_at: new Date().toISOString(),
      disclaimer: 'Stoic decision evaluation is a reflective tool, not a directive. The sage recognizes that only virtue is truly good; external outcomes remain indifferent. Use this to examine your reasoning, not to escape responsibility for your choice.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'decision_score_v3',
        metadata: {
          num_options: options.length,
          top_proximity: scoreData[0]?.katorthoma_proximity,
          top_kathekon: scoreData[0]?.is_kathekon,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
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
  return corsPreflightResponse()
}
