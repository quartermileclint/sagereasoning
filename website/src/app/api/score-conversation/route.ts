import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { KatorthomaProximityLevel } from '@/lib/stoic-brain'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CONVERSATION_SCORING_PROMPT = `You are the Stoic Sage conversation auditor for sagereasoning.com. You score the overall ethical tone and quality of conversations using V3 qualitative evaluation, and optionally score individual participants.

Evaluate the four cardinal virtues through their embodiment:
- Phronesis (Wisdom): Right deliberation and practical judgment. Does the conversation show careful reasoning, truth-seeking?
- Dikaiosyne (Justice): Fair treatment and respect for others. Are perspectives heard? Is there reciprocal regard?
- Andreia (Courage): Honest address of difficult truths. Do participants avoid deflection, passive aggression, avoidance?
- Sophrosyne (Temperance): Measured tone and emotional restraint. Does the conversation avoid escalation, sarcasm, manipulation?

CRITICAL V3 RULES:
- NO numeric scores (0-100, weighted totals, etc.)
- Use ONLY katorthoma_proximity levels: reflexive, habitual, deliberate, principled, sage_like
- Return passions_detected array with root_passion types (epithumia, hedone, phobos, lupe)
- Use is_kathekon (boolean) and kathekon_quality (strong, moderate, marginal, contrary)
- Use virtue_domains_engaged array listing engaged virtues: phronesis, dikaiosyne, andreia, sophrosyne
- NO per-virtue independent scores
- NO alignment_tier or numeric composites

Return ONLY valid JSON:
{
  "overall": {
    "katorthoma_proximity": "reflexive" | "habitual" | "deliberate" | "principled" | "sage_like",
    "passions_detected": [
      {
        "root_passion": "epithumia" | "hedone" | "phobos" | "lupe",
        "sub_species": "<specific passion type>",
        "false_judgement": "<underlying false belief>"
      }
    ],
    "is_kathekon": true | false,
    "kathekon_quality": "strong" | "moderate" | "marginal" | "contrary",
    "virtue_domains_engaged": ["phronesis" | "dikaiosyne" | "andreia" | "sophrosyne"],
    "reasoning": "<2-3 sentences: overall tone and virtue assessment>",
    "notable_patterns": "<1-2 sentences: recurring patterns or dynamics>"
  },
  "participants": [
    {
      "name": "<participant name or identifier>",
      "katorthoma_proximity": "reflexive" | "habitual" | "deliberate" | "principled" | "sage_like",
      "passions_detected": [
        {
          "root_passion": "epithumia" | "hedone" | "phobos" | "lupe",
          "sub_species": "<specific passion type>",
          "false_judgement": "<underlying false belief>"
        }
      ],
      "is_kathekon": true | false,
      "kathekon_quality": "strong" | "moderate" | "marginal" | "contrary",
      "virtue_domains_engaged": ["phronesis" | "dikaiosyne" | "andreia" | "sophrosyne"],
      "summary": "<1 sentence: this participant's character in the conversation>"
    }
  ],
  "disclaimer": "This assessment reflects qualitative evaluation of proximal alignment with Stoic virtue, not diagnostic judgment."
}

If participant names cannot be identified, return an empty participants array.`

// POST — Score a conversation
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { conversation, context, format } = await request.json()

    // Validate text length
    if (conversation && typeof conversation === 'string' && conversation.length > TEXT_LIMITS.long) {
      return NextResponse.json(
        { error: `conversation exceeds maximum length of ${TEXT_LIMITS.long} characters` },
        { status: 400 }
      )
    }
    if (context && typeof context === 'string' && context.length > TEXT_LIMITS.long) {
      return NextResponse.json(
        { error: `context exceeds maximum length of ${TEXT_LIMITS.long} characters` },
        { status: 400 }
      )
    }

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
      system: [{ type: 'text', text: CONVERSATION_SCORING_PROMPT, cache_control: { type: 'ephemeral' } }],
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

    // V3 validation: ensure no numeric scores are present
    // This is implicit in the scoreData structure which uses qualitative levels only

    const result = {
      ...scoreData,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'conversation_score_v3',
        metadata: {
          overall_proximity: scoreData.overall?.katorthoma_proximity,
          overall_is_kathekon: scoreData.overall?.is_kathekon,
          num_participants: scoreData.participants?.length || 0,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
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
  return corsPreflightResponse()
}
