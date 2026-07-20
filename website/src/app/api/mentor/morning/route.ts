import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { isLlmOutage } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// The quality-gate classification. The LLM is restricted to producing one of
// these two values (a pure classification of the prepared virtue response's
// concreteness); the tailored message is produced deterministically below, so
// the LLM never authors any Stoic commentary.
type Preparation = 'prepared' | 'vague'

type ParsedPrep =
  | { ok: false; error: string }
  | {
      ok: true
      roles_active: string
      expected_impressions: string
      prepared_virtue_response: string
    }

/**
 * Validate the morning-preparation content fields (shared by POST and the PATCH
 * content-edit / revise path, so the two never drift). All three are the mentor's
 * three questions — the daily orientation record is incomplete without any of
 * them, so all three are required.
 */
function parseMorningContent(body: Record<string, unknown>): ParsedPrep {
  const roles_active = body.roles_active as string | undefined
  const expected_impressions = body.expected_impressions as string | undefined
  const prepared_virtue_response = body.prepared_virtue_response as string | undefined

  if (
    !roles_active?.trim() ||
    !expected_impressions?.trim() ||
    !prepared_virtue_response?.trim()
  ) {
    return {
      ok: false,
      error: 'Required fields: roles_active, expected_impressions, prepared_virtue_response',
    }
  }

  for (const [field, value] of [
    ['Roles active today', roles_active],
    ['Expected impressions', expected_impressions],
    ['Prepared virtue response', prepared_virtue_response],
  ] as const) {
    const err = validateTextLength(value, field, TEXT_LIMITS.medium)
    if (err) return { ok: false, error: err }
  }

  return {
    ok: true,
    roles_active: roles_active.trim(),
    expected_impressions: expected_impressions.trim(),
    prepared_virtue_response: prepared_virtue_response.trim(),
  }
}

/**
 * The tailored quality-gate message — authored deterministically (not by the
 * LLM), keyed off the classification. `prepared` is true only for a genuinely
 * concrete, situation-anchored disposition; a vague aspiration gets a distinct,
 * actionable message and is offered a Revise affordance in the UI.
 */
function preparationBlock(quality: Preparation) {
  const prepared = quality === 'prepared'
  const message = prepared
    ? 'This is a prepared disposition — anchored to today, ready to meet a named impression. The morning has declared the intention; the day will test whether it holds.'
    : "This reads as a general aspiration rather than a prepared disposition. The morning examination orients the ruling faculty for THIS day: not \"be virtuous\" but the specific stance you will hold when a named impression arrives — when the difficult colleague pushes back, when the setback lands. Anchor the response to one of today's actual roles or expected impressions, then set it again."
  return { preparation_quality: quality, prepared, message }
}

/**
 * POST /api/mentor/morning
 *
 * The morning examination (the morning pole of the daily practice) — Remaining
 * Principles #8. The Stoic orientation of the ruling faculty (hegemonikon) BEFORE
 * the day's impressions arrive — Marcus Aurelius's morning preparation, distinct
 * from the premeditatio of specific adversities and from the evening review. The
 * mentor's three questions:
 *   roles_active             (required) — the roles active today + the kathekonta they generate
 *   expected_impressions     (required) — the impressions likely to arrive + which risk hasty assent
 *   prepared_virtue_response (required) — the virtue response to have prepared
 * The three answers together are the daily orientation record.
 *
 * Human-only. Never touches /api/reason, the signed assessment, or the substrate
 * engine, and never imports the reflect engine — the "the evening assesses whether
 * the morning intention held" pairing is conceptual, not a code coupling.
 *
 * Quality gate: an LLM classifies the prepared virtue response as
 * prepared / vague (classification only); the message is deterministic.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()

    const parsed = parseMorningContent(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const quality = await classifyPreparation(
      parsed.roles_active,
      parsed.expected_impressions,
      parsed.prepared_virtue_response
    )

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('morning_preparation_entries')
      .insert({
        user_id: userId,
        roles_active: parsed.roles_active,
        expected_impressions: parsed.expected_impressions,
        prepared_virtue_response: parsed.prepared_virtue_response,
        preparation_quality: quality,
      })
      .select()
      .single()

    if (error) {
      console.error('Morning preparation insert error:', error)
      return NextResponse.json({ error: 'Failed to save morning preparation entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: preparationBlock(quality),
    })
  } catch (err) {
    console.error('Morning preparation API error:', err)
    logRouteError({ route: '/api/mentor/morning', method: 'POST', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/morning
 *
 * Content edit / revise an existing morning-preparation entry — re-validates +
 * re-runs the preparation gate and updates the row in place (used to revise an
 * entry the gate flagged as vague, without re-entering everything or creating a
 * duplicate). Body: { id, roles_active, expected_impressions, prepared_virtue_response }.
 * Scoped to the authenticated user.
 */
export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Entry id is required' }, { status: 400 })
    }

    const parsed = parseMorningContent(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const quality = await classifyPreparation(
      parsed.roles_active,
      parsed.expected_impressions,
      parsed.prepared_virtue_response
    )

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('morning_preparation_entries')
      .update({
        roles_active: parsed.roles_active,
        expected_impressions: parsed.expected_impressions,
        prepared_virtue_response: parsed.prepared_virtue_response,
        preparation_quality: quality,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Morning preparation update error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: preparationBlock(quality),
    })
  } catch (err) {
    console.error('Morning preparation PATCH error:', err)
    logRouteError({ route: '/api/mentor/morning', method: 'PATCH', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/morning?view=feed&limit=50
 *
 * Retrieve the user's morning-preparation entries (most recent first).
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
    .from('morning_preparation_entries')
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
 * Quality gate: uses an LLM to CLASSIFY the prepared virtue response — nothing
 * more. It returns one of 'prepared' | 'vague'. The LLM authors no message and no
 * Stoic commentary; the tailored message is produced by the deterministic
 * preparationBlock() above, keyed off this classification.
 *
 *   prepared — the response names a concrete disposition anchored to today's
 *              actual roles or expected impressions (a specific stance for a
 *              named situation).
 *   vague    — the response is a generic aspiration ("be virtuous", "stay calm",
 *              "do my best") not anchored to any particular role or impression.
 *
 * Fails OPEN (returns 'prepared') so a gate outage never blocks a genuine entry.
 */
async function classifyPreparation(
  rolesActive: string,
  expectedImpressions: string,
  preparedResponse: string
): Promise<Preparation> {
  try {
    const ck = cacheKey('/api/mentor/morning/preparation-gate', {
      roles_active: rolesActive.trim(),
      expected_impressions: expectedImpressions.trim(),
      prepared_virtue_response: preparedResponse.trim(),
    })
    const cached = cacheGet(ck) as { preparation: Preparation } | undefined
    if (cached !== undefined) return cached.preparation

    const client = getClient()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 128,
      system: `You are a classifier for a Stoic morning-preparation exercise. Each morning a practitioner orients the ruling faculty before the day begins: they name the ROLES active today, the IMPRESSIONS they expect to encounter (and which risk hasty assent), and the VIRTUE RESPONSE they want to have prepared.

Classify whether the PREPARED VIRTUE RESPONSE is a concrete, situation-anchored disposition or a vague/generic aspiration. Do not add commentary or advice.

"prepared": the response names a concrete disposition anchored to today's actual roles or expected impressions — a specific stance the practitioner will hold when a named situation arises (e.g. "when the reviewer pushes back on the plan, pause and examine before defending").

"vague": the response is a general aspiration not anchored to any particular role or impression (e.g. "be virtuous today", "stay calm", "do my best").

Respond ONLY with: {"preparation": "prepared"} or {"preparation": "vague"}`,
      messages: [
        {
          role: 'user',
          content: `Roles active today: ${rolesActive.trim()}
Expected impressions: ${expectedImpressions.trim()}
Prepared virtue response: ${preparedResponse.trim()}

Classify the prepared virtue response.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return 'prepared' // fail open

    const result = JSON.parse(jsonMatch[0])
    const preparation: Preparation = result.preparation === 'vague' ? 'vague' : 'prepared'
    cacheSet(ck, { preparation })
    return preparation
  } catch (err) {
    console.error('Morning preparation gate failed:', err)
    logRouteError({
      route: '/api/mentor/morning',
      method: 'POST',
      error: err,
      statusCode: 200,
      isLlmOutage: isLlmOutage(err),
      context: { gate: 'preparation-gate', fail_open: true },
    })
    // Fail open — don't block the entry if the gate itself fails
    return 'prepared'
  }
}
