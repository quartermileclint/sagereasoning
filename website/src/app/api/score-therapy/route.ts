import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getAlignmentTier } from '@/lib/document-scorer'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS, corsHeaders, corsPreflightResponse } from '@/lib/security'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const THERAPY_EXERCISE_PROMPT = `You are the Stoic Sage therapy/coaching companion for sagereasoning.com. A practitioner (therapist, coach, counsellor) is assigning Stoic exercises to their client. You generate exercises and score client responses.

WHEN GENERATING AN EXERCISE:
Create a Stoic-based therapeutic exercise appropriate to the focus area. The exercise should be practical, specific, and completable in a single journaling session. Draw from genuine Stoic practices: negative visualisation (premeditatio malorum), the view from above, the dichotomy of control, evening review, voluntary discomfort, perspective-taking.

Return ONLY valid JSON:
{
  "exercise_title": "<short title>",
  "exercise_type": "<stoic practice name — e.g. premeditatio malorum, evening review, dichotomy of control>",
  "instructions": "<3-5 sentences: clear instructions for the client>",
  "journaling_prompt": "<1-2 sentences: a specific question for the client to respond to in writing>",
  "virtue_focus": "<primary virtue this exercises — wisdom, justice, courage, or temperance>",
  "therapeutic_goal": "<1 sentence: what this exercise aims to develop>"
}

WHEN SCORING A CLIENT RESPONSE:
Score the client's journal response. Be warm, clinically aware, and Stoic. This is therapeutic context — the goal is growth, not judgement.

Return ONLY valid JSON:
{
  "wisdom_score": <0-100>,
  "justice_score": <0-100>,
  "courage_score": <0-100>,
  "temperance_score": <0-100>,
  "total_score": <weighted total>,
  "practitioner_notes": "<2-3 sentences: observations for the practitioner about the client's reasoning patterns, emotional regulation, and virtue development>",
  "client_feedback": "<2-3 sentences: warm, encouraging feedback for the client — acknowledge effort, highlight growth, gently point toward next step>",
  "next_exercise_suggestion": "<1 sentence: what type of exercise to assign next based on what this response revealed>"
}`

const FOCUS_AREAS = [
  'anxiety',
  'anger management',
  'grief',
  'relationship conflict',
  'self-worth',
  'decision paralysis',
  'perfectionism',
  'burnout',
  'general resilience',
]

// GET — Generate a Stoic exercise for a client
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const focus = searchParams.get('focus') || 'general resilience'

    const userMessage = `Generate a Stoic therapeutic exercise.
Focus area: ${focus}

Return the JSON exercise.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.6,
      system: THERAPY_EXERCISE_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let exerciseData
    try {
      const cleaned = responseText
        .replace(/```json?\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      exerciseData = JSON.parse(cleaned)
    } catch {
      console.error('Therapy exercise parse error:', responseText)
      return NextResponse.json(
        { error: 'Failed to generate exercise' },
        { status: 500 }
      )
    }

    const result = {
      focus_area: focus,
      available_focus_areas: FOCUS_AREAS,
      ...exerciseData,
      instructions_for_practitioner:
        'Assign this exercise to your client. When they complete the journaling prompt, POST their response back to this endpoint for scoring and practitioner notes.',
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'therapy_exercise_generated',
        metadata: { focus },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Therapy exercise generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST — Score a client's exercise response
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const { exercise_title, journaling_prompt, response, focus, client_id, practitioner_id } =
      await request.json()

    if (!response || typeof response !== 'string' || response.trim().length < 10) {
      return NextResponse.json(
        { error: 'response is required — the client\'s journaling response (min 10 characters)' },
        { status: 400 }
      )
    }

    // Validate text length for response field
    const responseErr = validateTextLength(response, 'response', TEXT_LIMITS.medium)
    if (responseErr) {
      return NextResponse.json({ error: responseErr }, { status: 400 })
    }

    // Validate optional fields if present
    if (exercise_title) {
      const titleErr = validateTextLength(exercise_title, 'exercise_title', TEXT_LIMITS.medium)
      if (titleErr) {
        return NextResponse.json({ error: titleErr }, { status: 400 })
      }
    }

    if (journaling_prompt) {
      const promptErr = validateTextLength(journaling_prompt, 'journaling_prompt', TEXT_LIMITS.medium)
      if (promptErr) {
        return NextResponse.json({ error: promptErr }, { status: 400 })
      }
    }

    const userMessage = `Score this client's therapy exercise response.
${exercise_title ? `Exercise: ${exercise_title}` : ''}
${journaling_prompt ? `Prompt: ${journaling_prompt}` : ''}
${focus ? `Focus area: ${focus}` : ''}

Client's response:
${response.trim()}

Return the JSON score with practitioner notes and client feedback.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      temperature: 0.3,
      system: THERAPY_EXERCISE_PROMPT,
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
      console.error('Therapy scorer parse error:', responseText)
      return NextResponse.json(
        { error: 'Scoring engine returned invalid response' },
        { status: 500 }
      )
    }

    const tier = getAlignmentTier(scoreData.total_score)

    const result = {
      exercise_title: exercise_title || null,
      focus_area: focus || null,
      ...scoreData,
      alignment_tier: tier,
      scored_at: new Date().toISOString(),
    }

    // Analytics
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type: 'therapy_exercise_scored',
        metadata: {
          focus: focus || 'unknown',
          total_score: scoreData.total_score,
          tier,
          has_practitioner: !!practitioner_id,
        },
      })
      .then(() => {})

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Therapy score API error:', error)
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
