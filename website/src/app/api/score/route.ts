import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are the Stoic Sage scoring engine for sagereasoning.com. Your role is to evaluate human actions against the four cardinal Stoic virtues and return a structured JSON score.

The four virtues and their weights:
- Wisdom (Phronesis) — weight 30%: Sound judgement, knowledge of what is truly good/bad/indifferent, deliberate reasoning before acting.
- Justice (Dikaiosyne) — weight 25%: Fairness, honesty, proper treatment of others, serving the common good.
- Courage (Andreia) — weight 25%: Acting rightly despite fear, difficulty, or social pressure; endurance; not shrinking from what is right.
- Temperance (Sophrosyne) — weight 20%: Self-control, moderation, ordering desires by reason not impulse, consistency.

Scoring scale (0–100 per virtue):
- 90–100: Near-perfect expression of this virtue
- 70–89: Strong, consistent expression
- 40–69: Partial expression — some virtue present, some conflict
- 15–39: Mostly driven by impulse, passion or external concern over virtue
- 0–14: Acting contrary to this virtue

Alignment tiers (based on weighted total):
- sage (95–100): Perfect alignment
- progressing (70–94): Consistently virtuous with minor gaps
- aware (40–69): Some virtue, some conflict
- misaligned (15–39): Actions driven more by impulse than reason
- contrary (0–14): Acting against virtue

A calendar stamp is earned when the total_score reaches 70 or above ("Progressing" tier). When scoring, you must also suggest a more virtuous alternative action the user could take in the same situation, and project what that action would score.

You must return ONLY valid JSON — no markdown, no explanation outside the JSON. Use this exact structure:
{
  "wisdom_score": <0-100 integer>,
  "justice_score": <0-100 integer>,
  "courage_score": <0-100 integer>,
  "temperance_score": <0-100 integer>,
  "total_score": <weighted total, 0-100 integer>,
  "sage_alignment": "<sage|progressing|aware|misaligned|contrary>",
  "reasoning": "<2-3 sentences: what stoic virtues are expressed, which are absent, and why — be specific to the action described>",
  "improvement_path": "<1-2 sentences: concrete stoic guidance on how to bring the weakest virtue more fully into this type of action>",
  "strength": "<single virtue name e.g. Wisdom>",
  "growth_area": "<single virtue name e.g. Temperance>",
  "growth_action": "<1-3 sentences: a specific alternative action a sage might consider in the same situation — phrased as an invitation, e.g. 'A sage might consider...' — concrete and actionable>",
  "growth_action_projected_score": <integer 0-100: your honest estimate of the total_score this growth action would achieve if taken thoughtfully>
}`

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  // Authentication required
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { action, context, intendedOutcome, prior_feedback } = await request.json()

    if (!action || action.trim().length === 0) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Text length limits
    const actionErr = validateTextLength(action, 'Action', TEXT_LIMITS.short)
    if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })
    const contextErr = validateTextLength(context, 'Context', TEXT_LIMITS.medium)
    if (contextErr) return NextResponse.json({ error: contextErr }, { status: 400 })
    const outcomeErr = validateTextLength(intendedOutcome, 'Intended outcome', TEXT_LIMITS.short)
    if (outcomeErr) return NextResponse.json({ error: outcomeErr }, { status: 400 })

    // Optional: prior_feedback allows agents to pass previous sage feedback as context
    // This enables lightweight iteration via /api/score without needing /api/score-iterate
    let priorFeedbackBlock = ''
    if (prior_feedback && typeof prior_feedback === 'object') {
      const pf = prior_feedback as {
        previous_action?: string
        previous_score?: number
        sage_reasoning?: string
        sage_growth_action?: string
      }
      if (pf.previous_action || pf.previous_score || pf.sage_reasoning) {
        priorFeedbackBlock = `\n\nDELIBERATION CONTEXT (the agent is iterating on a previous action):
Previous action: ${pf.previous_action || 'not provided'}
Previous score: ${pf.previous_score ?? 'not provided'}
Sage reasoning on previous action: ${pf.sage_reasoning || 'not provided'}
Sage suggested growth action: ${pf.sage_growth_action || 'not provided'}
Note: Score the current action on its own merits, but acknowledge if it addresses the sage's prior feedback.`
      }
    }

    const userMessage = `Please score the following action against the four Stoic virtues.

Action: ${action.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}
${intendedOutcome?.trim() ? `Intended outcome: ${intendedOutcome.trim()}` : ''}${priorFeedbackBlock}

Return only the JSON score object.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.2,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        { role: 'user', content: userMessage }
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the JSON response
    let scoreData
    try {
      // Strip any accidental markdown code fences
      const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json({ error: 'Scoring engine returned invalid response' }, { status: 500 })
    }

    // Validate required fields
    const required = ['wisdom_score', 'justice_score', 'courage_score', 'temperance_score', 'total_score', 'sage_alignment', 'reasoning', 'improvement_path', 'strength', 'growth_area', 'growth_action', 'growth_action_projected_score']
    for (const field of required) {
      if (scoreData[field] === undefined) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
      }
    }

    // Add AI transparency metadata to every scoring response
    // (NAIC guidance on AI-generated content labelling; OECD AI Principles transparency)
    const responsePayload = {
      ...scoreData,
      ai_generated: true,
      ai_model: 'claude-sonnet-4-6',
      disclaimer: 'This score is AI-generated using Stoic virtue criteria. It is for personal reflection only and does not constitute professional advice. See sagereasoning.com/transparency',
    }

    return NextResponse.json(responsePayload, { headers: corsHeaders() })
  } catch (error) {
    console.error('Score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// OPTIONS — CORS preflight
export async function OPTIONS() {
  return corsPreflightResponse()
}
