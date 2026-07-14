import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// The five oikeiosis circles, self → outward. Reuses the live /oikeiosis
// vocabulary (oikeiosis_reflections.stage) so the diagnostic and the practice
// speak the same language.
const CIRCLES = ['self', 'household', 'community', 'humanity', 'cosmic'] as const
type Circle = (typeof CIRCLES)[number]
const CIRCLE_RANK: Record<Circle, number> = {
  self: 1,
  household: 2,
  community: 3,
  humanity: 4,
  cosmic: 5,
}

// #15 — the fourth circle (all rational beings / humanity) is where the
// cosmopolitan obligation check applies. At or beyond it the practitioner is
// reasoning about fellow citizens of the world city; below it the check does not
// yet apply, so its fields are recorded as null.
const COSMOPOLITAN_MIN_RANK = CIRCLE_RANK.humanity

// The Stoic obligations of world-citizenship (#15). Practitioner-selected — this
// is capture, never a computed verdict. NO substrate/justice-engine involvement.
const COSMOPOLITAN_OBLIGATIONS = ['justice', 'mutual_aid', 'honest_dealing'] as const
type CosmopolitanObligation = (typeof COSMOPOLITAN_OBLIGATIONS)[number]

type ParsedExtension =
  | { ok: false; error: string }
  | {
      ok: true
      situation: string
      current_circle: Circle
      extended_circle: Circle
      extended_reasoning: string
      assessment_shift: string
      cosmopolitan_obligations: CosmopolitanObligation[] | null
      cosmopolitan_note: string | null
    }

/**
 * Validate the circle-extension content fields (shared by POST and the PATCH
 * revise path, so the two never drift). Gate-free: this is a practice record, not
 * a diagnostic — nothing here produces a verdict (mentor #6).
 */
function parseExtensionContent(body: Record<string, unknown>): ParsedExtension {
  const situation = body.situation as string | undefined
  const current_circle = body.current_circle as string | undefined
  const extended_circle = body.extended_circle as string | undefined
  const extended_reasoning = body.extended_reasoning as string | undefined
  const assessment_shift = body.assessment_shift as string | undefined
  const cosmopolitan_note = body.cosmopolitan_note as string | undefined
  const rawObligations = body.cosmopolitan_obligations

  if (
    !situation?.trim() ||
    !current_circle ||
    !extended_circle ||
    !extended_reasoning?.trim() ||
    !assessment_shift?.trim()
  ) {
    return {
      ok: false,
      error:
        'Required fields: situation, current_circle, extended_circle, extended_reasoning, assessment_shift',
    }
  }

  if (!CIRCLES.includes(current_circle as Circle)) {
    return { ok: false, error: `current_circle must be one of: ${CIRCLES.join(', ')}` }
  }
  if (!CIRCLES.includes(extended_circle as Circle)) {
    return { ok: false, error: `extended_circle must be one of: ${CIRCLES.join(', ')}` }
  }

  // Any WIDER circle is a valid extension target — not only the immediately-next
  // one. The mentor's aim (#6/#15) is to bring a wider circle — up to the fourth
  // (all rational beings) — into felt proximity, and #15's cosmopolitan check must
  // be reachable in a single exercise from any starting circle. So we require
  // strictly-wider, not strict adjacency.
  const currentRank = CIRCLE_RANK[current_circle as Circle]
  const extendedRank = CIRCLE_RANK[extended_circle as Circle]
  if (extendedRank <= currentRank) {
    return {
      ok: false,
      error: 'The extended circle must be wider than the circle you are reasoning from',
    }
  }

  for (const [field, value] of [
    ['Situation', situation],
    ['Extended reasoning', extended_reasoning],
    ['Assessment shift', assessment_shift],
    ['Cosmopolitan note', cosmopolitan_note],
  ] as const) {
    const err = validateTextLength(value, field, TEXT_LIMITS.medium)
    if (err) return { ok: false, error: err }
  }

  // Cosmopolitan obligations (#15) — validate the vocabulary. Only meaningful once
  // the extension reaches the fourth circle; below it, coerce to null so the
  // record stays clean (the UI only surfaces the check at humanity/cosmic).
  let obligations: CosmopolitanObligation[] | null = null
  let note: string | null = null
  if (extendedRank >= COSMOPOLITAN_MIN_RANK) {
    if (rawObligations !== undefined && rawObligations !== null) {
      if (!Array.isArray(rawObligations)) {
        return { ok: false, error: 'cosmopolitan_obligations must be an array' }
      }
      for (const o of rawObligations) {
        if (!COSMOPOLITAN_OBLIGATIONS.includes(o as CosmopolitanObligation)) {
          return {
            ok: false,
            error: `cosmopolitan_obligations must each be one of: ${COSMOPOLITAN_OBLIGATIONS.join(', ')}`,
          }
        }
      }
      // De-duplicate; empty selection → null.
      const unique = [...new Set(rawObligations as CosmopolitanObligation[])]
      obligations = unique.length > 0 ? unique : null
    }
    note = cosmopolitan_note?.trim() || null
  }

  return {
    ok: true,
    situation: situation.trim(),
    current_circle: current_circle as Circle,
    extended_circle: extended_circle as Circle,
    extended_reasoning: extended_reasoning.trim(),
    assessment_shift: assessment_shift.trim(),
    cosmopolitan_obligations: obligations,
    cosmopolitan_note: note,
  }
}

/**
 * Read + shape the JSON request body. A non-JSON payload, or a body that is not a
 * plain object (null / array / primitive), is a client error → the caller returns
 * 400, rather than falling through to a generic 500.
 */
async function readJsonBody(
  request: NextRequest
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false }> {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false }
    return { ok: true, body: body as Record<string, unknown> }
  } catch {
    return { ok: false }
  }
}

/**
 * POST /api/mentor/oikeiosis/extension
 *
 * The circle-extension practice — Remaining Principles #6, with the cosmopolitan
 * obligation check (#15) folded in. An ACTIVE practice (not a diagnostic): the
 * practitioner names a current decision or situation, marks the circle they are
 * reasoning from, extends their reasoning to a wider circle, and notices what
 * changes in the action assessment when the circle expands. When the extension
 * reaches the fourth circle (all rational beings), the cosmopolitan obligation
 * check asks which obligations of world-citizenship — justice, mutual aid, honest
 * dealing — that circle generates and whether the current action engages any.
 *
 * The result is a PRACTICE RECORD, not a verdict (mentor #6: "not a diagnostic —
 * it does not produce a verdict"). Gate-free: no LLM, no substrate engine.
 *
 * Human-only. Never touches /api/reason, the signed assessment, or the substrate
 * engine. Additive to the live /oikeiosis surface; leaves the quarterly
 * oikeiosis_reflections diagnostic untouched.
 *
 * Body:
 *   situation                (required) — the current decision or situation
 *   current_circle           (required) — self | household | community | humanity | cosmic
 *   extended_circle          (required) — a wider circle than current_circle
 *   extended_reasoning       (required) — reasoning about the situation from the wider circle
 *   assessment_shift         (required) — what changes in the action assessment when the circle expands
 *   cosmopolitan_obligations (optional) — subset of justice | mutual_aid | honest_dealing (#15; humanity+ only)
 *   cosmopolitan_note        (optional) — what is owed / which obligations the action engages (#15)
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  try {
    const parsed = parseExtensionContent(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('circle_extension_entries')
      .insert({
        user_id: userId,
        situation: parsed.situation,
        current_circle: parsed.current_circle,
        extended_circle: parsed.extended_circle,
        extended_reasoning: parsed.extended_reasoning,
        assessment_shift: parsed.assessment_shift,
        cosmopolitan_obligations: parsed.cosmopolitan_obligations,
        cosmopolitan_note: parsed.cosmopolitan_note,
      })
      .select()
      .single()

    if (error) {
      console.error('Circle extension insert error:', error)
      return NextResponse.json({ error: 'Failed to save circle-extension entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true, entry: data })
  } catch (err) {
    console.error('Circle extension API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/oikeiosis/extension
 *
 * Revise an existing circle-extension entry in place (edit rather than create a
 * duplicate). Re-validates the same fields and updates the row. Scoped to the
 * authenticated user (matched on BOTH id AND user_id). Body: { id, ...content }.
 */
export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const id = typeof parsedBody.body.id === 'string' ? parsedBody.body.id : ''
  if (!id) {
    return NextResponse.json({ error: 'Entry id is required' }, { status: 400 })
  }

  try {
    const parsed = parseExtensionContent(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('circle_extension_entries')
      .update({
        situation: parsed.situation,
        current_circle: parsed.current_circle,
        extended_circle: parsed.extended_circle,
        extended_reasoning: parsed.extended_reasoning,
        assessment_shift: parsed.assessment_shift,
        cosmopolitan_obligations: parsed.cosmopolitan_obligations,
        cosmopolitan_note: parsed.cosmopolitan_note,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Circle extension update error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }
    // No row matched the (id, user_id) scope — the entry does not exist or is not
    // the caller's. Honest 404, not a misleading 500. The .eq('user_id') scope
    // guarantees no cross-user row is ever touched.
    if (!data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, entry: data })
  } catch (err) {
    console.error('Circle extension PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/oikeiosis/extension?view=feed&limit=50
 *
 * Retrieve the user's circle-extension practice entries.
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
    .from('circle_extension_entries')
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
