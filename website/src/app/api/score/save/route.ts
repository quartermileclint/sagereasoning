import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

/**
 * POST /api/score/save
 *
 * Persists an already-computed /api/score evaluation result to
 * action_evaluations_v3, on behalf of the authenticated caller. Deliberately
 * separate from /api/score itself (which stays engine-adjacent and
 * measurement-neutral — this route never calls the engine, never touches
 * scoring, purely a store operation).
 *
 * Route-change-first for the RLS-vs-route-enforcement survey's Class B row
 * 19: `src/app/score/page.tsx` previously inserted into `action_evaluations_v3`
 * directly from the browser via the anon-key client for practitioners who
 * chose "cloud" storage, relying on the table's owner INSERT policy. This
 * route removes that dependency by moving the identical insert server-side,
 * `user_id` taken from the server-verified session (`requireAuth`), never
 * from the request body. Column set and validation mirror the client's
 * previous insert body exactly — see `supabase-v3-migration.sql` for the
 * schema this must stay in lockstep with (the 2026-07-26 schema-drift
 * incident this table already survived once).
 *
 * Body: { action, context?, relationships?, emotional_state?,
 *         katorthoma_proximity, is_kathekon, kathekon_quality,
 *         passions_detected?, false_judgements?, ruling_faculty_state?,
 *         philosophical_reflection?, improvement_path?, oikeiosis_context? }
 *
 * Bearer-JWT only — callers must use `authFetch`, never a bare `fetch`.
 *
 * ⚠ DISCLOSED, NOT INTRODUCED BY THIS ROUTE: no R20a distress check runs
 * here. `/api/score` (the caller of this route, one step earlier in the same
 * client flow) screens only the `action` field via `detectDistressTwoStage`
 * before this route is ever reached — `context`/`relationships`/
 * `emotional_state` are not screened by anything, in this route or its
 * caller. This is a PRE-EXISTING gap: the client's direct browser insert this
 * route replaces had ZERO distress screening on any field, so net exposure
 * is unchanged (arguably improved — this route is at least rate-limited and
 * auth-gated). Fixing /api/score's own field coverage is out of scope here
 * (an engine-adjacent, measurement-neutral-protected route this codebase is
 * deliberately careful about touching outside a dedicated session) — named
 * as its own follow-up, not silently absorbed into this refactor.
 */
export async function POST(request: NextRequest) {
  // Shares /api/score's own bucket — this fires once per cloud-mode
  // evaluation, the same cadence as the evaluation call itself, not an
  // independent read/browse action.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  const {
    action,
    context,
    relationships,
    emotional_state,
    katorthoma_proximity,
    is_kathekon,
    kathekon_quality,
    passions_detected,
    false_judgements,
    ruling_faculty_state,
    philosophical_reflection,
    improvement_path,
    oikeiosis_context,
  } = body

  if (typeof action !== 'string' || !action.trim()) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 })
  }
  if (typeof katorthoma_proximity !== 'string' || !katorthoma_proximity) {
    return NextResponse.json({ error: 'katorthoma_proximity is required' }, { status: 400 })
  }
  if (typeof is_kathekon !== 'boolean') {
    return NextResponse.json({ error: 'is_kathekon (boolean) is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('action_evaluations_v3')
    .insert({
      user_id: userId,
      action,
      context: context ?? null,
      relationships: relationships ?? null,
      emotional_state: emotional_state ?? null,
      katorthoma_proximity,
      is_kathekon,
      kathekon_quality: kathekon_quality ?? null,
      passions_detected: passions_detected ?? null,
      false_judgements: false_judgements ?? null,
      ruling_faculty_state: ruling_faculty_state ?? null,
      philosophical_reflection: philosophical_reflection ?? null,
      improvement_path: improvement_path ?? null,
      oikeiosis_context: oikeiosis_context ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('score/save insert error:', error)
    return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
