import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/mentor/hupexairesis
 *
 * The reserve clause (hupexairesis) — Remaining Principles #10-human.
 * A single structured prompt at the action stage: name the outcome you are
 * pursuing, and the response you have prepared if that outcome does not occur.
 * It surfaces the conflation of commitment-to-the-action (up to us) with
 * commitment-to-the-outcome (not up to us).
 *
 * Human-only. Never touches /api/reason, the signed assessment, or the substrate
 * engine.
 *
 * Body:
 *   outcome_pursued   (required) — the outcome you are pursuing
 *   prepared_response (required) — your prepared response if the outcome does not occur
 *   action_context    (optional) — the decision/action at hand
 *
 * Quality gate: an LLM check flags a prepared_response that does NOT genuinely
 * separate the action from the outcome (e.g. merely restates the desired outcome,
 * or gives a non-answer). "A practitioner who cannot answer the question has not
 * yet separated the action from the outcome."
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { outcome_pursued, prepared_response, action_context } = body

    // Validate required fields
    if (!outcome_pursued?.trim() || !prepared_response?.trim()) {
      return NextResponse.json(
        { error: 'Required fields: outcome_pursued, prepared_response' },
        { status: 400 }
      )
    }

    // Text length validation
    for (const [field, value] of [
      ['Outcome pursued', outcome_pursued],
      ['Prepared response', prepared_response],
      ['Action context', action_context],
    ] as const) {
      const err = validateTextLength(value, field, TEXT_LIMITS.medium)
      if (err) return NextResponse.json({ error: err }, { status: 400 })
    }

    // Quality gate: does the prepared response genuinely separate action from outcome?
    const separates = await checkSeparation(outcome_pursued, prepared_response)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('reserve_clause_entries')
      .insert({
        user_id: userId,
        action_context: action_context?.trim() || null,
        outcome_pursued: outcome_pursued.trim(),
        prepared_response: prepared_response.trim(),
        separates_action_from_outcome: separates,
      })
      .select()
      .single()

    if (error) {
      console.error('Reserve clause insert error:', error)
      return NextResponse.json({ error: 'Failed to save reserve clause entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: {
        separates_action_from_outcome: separates,
        message: separates
          ? 'Quality gate passed — your prepared response holds the outcome lightly and keeps your commitment on the action.'
          : 'Your prepared response does not yet separate the action from the outcome — it reads as another way of insisting on the outcome. A practitioner who cannot name a genuine response to the outcome NOT occurring has not yet made the reservation. Consider revising.',
      },
    })
  } catch (err) {
    console.error('Reserve clause API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/hupexairesis?view=feed&limit=50
 *
 * Retrieve the user's reserve-clause entries.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: entries, error } = await supabase
    .from('reserve_clause_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })

  return NextResponse.json({
    view: 'feed',
    entries: entries || [],
  })
}

/**
 * Quality gate: uses an LLM to detect whether a prepared response genuinely
 * separates the action (up to us) from the outcome (not up to us).
 *
 * Returns true when the response names a real disposition toward the outcome
 * NOT occurring; false when it merely restates the desired outcome, insists the
 * outcome must occur, or gives a non-answer.
 *
 * Fails OPEN (returns true) so a gate outage never blocks a genuine entry.
 */
async function checkSeparation(
  outcomePursued: string,
  preparedResponse: string
): Promise<boolean> {
  try {
    const ck = cacheKey('/api/mentor/hupexairesis/separation-gate', {
      outcome_pursued: outcomePursued.trim(),
      prepared_response: preparedResponse.trim(),
    })
    const cached = cacheGet(ck) as { separates: boolean } | undefined
    if (cached !== undefined) return cached.separates

    const client = getClient()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 128,
      system: `You are a quality gate for the Stoic reserve clause (hupexairesis). A practitioner names an OUTCOME they are pursuing and a PREPARED RESPONSE for if that outcome does not occur.

The reserve clause SEPARATES commitment-to-the-action (up to us) from commitment-to-the-outcome (not up to us). Judge whether the prepared response genuinely does this.

SEPARATES (true): the response names a real disposition toward the outcome not occurring — accepting it, continuing to act well regardless, holding the outcome lightly, adjusting, or learning. It does not depend on the outcome occurring.

DOES NOT SEPARATE (false): the response merely restates or insists on the desired outcome, says it "must" or "will" happen, gives a non-answer ("I don't know", "it will be fine"), or only describes trying harder to force the same outcome.

Respond ONLY with: {"separates": true} or {"separates": false}`,
      messages: [
        {
          role: 'user',
          content: `Outcome pursued: ${outcomePursued.trim()}
Prepared response if it does not occur: ${preparedResponse.trim()}

Does the prepared response separate the action from the outcome?`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return true // fail open

    const result = JSON.parse(jsonMatch[0])
    const separates = result.separates !== false
    cacheSet(ck, { separates })
    return separates
  } catch (err) {
    console.error('Reserve clause separation gate failed:', err)
    // Fail open — don't block the entry if the gate itself fails
    return true
  }
}
