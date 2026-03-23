import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CONVERSATION_SCORING_PROMPT = `You are the Stoic Sage conversation auditor for sagereasoning.com. You score the overall ethical tone and quality of conversations, and optionally score individual participants.

Score against the four cardinal virtues:
- Wisdom (Phronesis) — 30%: Is the conversation well-reasoned? Do participants seek truth over being right?
- Justice (Dikaiosyne) — 25%: Is the conversation fair? Do participants treat each other with respect? Are all perspectives heard?
- Courage (Andreia) — 25%: Do participants address hard truths? Do they avoid avoidance, deflection, or passive aggression?
- Temperance (Sophrosyne) — 20%: Is the tone measured? Do participants avoid escalation, sarcasm, or emotional manipulation?

Return ONLY valid JSON:
{
  "overall": {
    "wisdom_score": <0-100>,
    "justice_score": <0-100>,
    "courage_score": <0-100>,
    "temperance_score": <0-100>,
    "total_score": <weighted total>,
    "reasoning": "<2-3 sentences: overall tone and virtue assessment>",
    "notable_patterns": "<1-2 sentences: any recurring patterns — positive or negative>"
  },
  "participants": [
    {
      "name": "<participant name or identifier>",
      "wisdom_score": <0-100>,
      "justice_score": <0-100>,
      "courage_score": <0-100>,
      "temperance_score": <0-100>,
      "total_score": <weighted total>,
      "summary": "<1 sentence: this participant's virtue profile in the conversation>"
    }
  ]
}

If participant names cannot be identified, return an empty participants array.`

// POST — Score a conversation
export async function POST(request: NextRequest) {
  try {
    const { conversation, context, format } = await request.json()

    if (!conversation || typeof conversation !== 'string' || conversation.trim().length < 20) {
      return NextResponse.json(
        { error: 'conversation is required (min 20 characters). Paste a chat transcript, email thread, or meeting notes.' },
        { status: 400 }
      )
    }

    // Truncate long conversations
    const truncated = conversation.trim().split(/\s+/).slice(0, 6000).join(' ')

    const userMessage = `Score this conversation:
${context?.trim() ? `Context: ${context.trim()}\n` : ''}${format?.trim() ? `Format: ${format.trim()}\n` : ''}
--- CONVERSATION START ---
${truncated}
--- CONVERSATION END ---

Return the JSON score.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      temperature: 0.2,
      system: CONVERSATION_SCORING_PROMPT,
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
      console.error('Conversation scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    // Enrich with tiers
    if (scoreData.overall) {
      scoreData.overall.alignment_tier = getAlignmentTier(scoreData.overall.total_score)
    }
    if (scoreData.participants) {
      scoreData.participants = scoreData.participants.map(
        (p: { total_score: number; [key: string]: unknown }) => ({
          ...p,
          alignment_tier: getAlignmentTier(p.total_score),
        })
      )
    }

    const result = {
      ...scoreData,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'conversation_score',
        metadata: {
          overall_score: scoreData.overall?.total_score,
          overall_tier: scoreData.overall?.alignment_tier,
          num_participants: scoreData.participants?.length || 0,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error('Conversation score API error:', error)
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
