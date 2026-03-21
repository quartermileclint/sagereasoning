import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

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
  "growth_area": "<single virtue name e.g. Temperance>"
}`

export async function POST(request: NextRequest) {
  try {
    const { action, context, intendedOutcome } = await request.json()

    if (!action || action.trim().length === 0) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const userMessage = `Please score the following action against the four Stoic virtues.

Action: ${action.trim()}
${context?.trim() ? `Context: ${context.trim()}` : ''}
${intendedOutcome?.trim() ? `Intended outcome: ${intendedOutcome.trim()}` : ''}

Return only the JSON score object.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
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
    const required = ['wisdom_score', 'justice_score', 'courage_score', 'temperance_score', 'total_score', 'sage_alignment', 'reasoning', 'improvement_path', 'strength', 'growth_area']
    for (const field of required) {
      if (scoreData[field] === undefined) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 500 })
      }
    }

    return NextResponse.json(scoreData)
  } catch (error) {
    console.error('Score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
