import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  buildMildSupportResources,
  composeDistressSubject,
  hasScreenableSubject,
  isR20aGapClosureEnabled,
} from '@/lib/r20a-gap-closure'

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
 * R20a PERIMETER MEMBER since 2026-08-31, by mentor ruling
 * (operations/agent-circles-2026-08/2026-08-31-mentor-consultation-r20a-two-
 * unclassified-routes-verbatim.md). The block that stood here disclosed that
 * no check ran; the ruling closed it. Three converging reasons, each held
 * sufficient alone: `emotional_state` is a field whose entire purpose is to
 * capture what the practitioner was feeling, and the 2026-08-17 family ruling
 * puts that material at the HIGHEST distress likelihood, not the lowest; an
 * authenticated caller can POST here directly with `/api/score` never
 * executing, so that route's check was never a gate on this one; and six of
 * the seven free-text fields were screened by nothing anywhere.
 *
 * SCREENED SUBJECT — all seven free-text fields composed, not `action` alone.
 * Ruled explicitly: screening `action` alone here "is not closing the gap — it
 * is relocating it." The check precedes field validation and every DB call.
 *
 * FLAG — the SHARED `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED`, not a new one. It is
 * already `true` in production, so this protection lands on deploy with no
 * separate activation step. Named as a deliberate trade: a safety advantage
 * bought at the cost of rollback granularity (reverting it reverts the other
 * gap-closure routes too). Flag-off, this route is byte-identical to its
 * pre-ruling self.
 *
 * ⚠ STANDING DISCLOSED LIMITATION (ruled, not closed): `/api/score` still
 * screens `action` ALONE. Its other fields are screened at persistence, here,
 * and nowhere earlier. The asymmetry — this persister screening MORE than the
 * member route that gates it — is the ruled-correct outcome: the persister is
 * the last line before persistence and should screen everything that reaches
 * it. `/api/score` is deliberately unchanged; it is engine-adjacent and
 * measurement-neutrality-protected, and the ruling does not require it to
 * change.
 *
 * Not screened, and deliberately so: `katorthoma_proximity`, `is_kathekon`,
 * `kathekon_quality`, `passions_detected`, `false_judgements`,
 * `ruling_faculty_state` — engine outputs echoed back by the client, not
 * practitioner-authored prose. The ruling names seven free-text fields; these
 * are the other six body fields and are recorded here as a considered
 * omission rather than an oversight.
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

  // ── R20a perimeter check ──────────────────────────────────────
  // BEFORE field validation and BEFORE any DB call, per the ruling and the
  // r20a-gap-closure pattern: distress in an otherwise-invalid body must still
  // catch. Field order is the body's own. Default field cap (5000) is correct
  // here and must NOT be raised — this is a MULTI-field route, where the cap
  // stops one oversized field pushing later fields out of the classifier
  // window (an input-inducible fail-open). See composeDistressSubject.
  let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
  if (isR20aGapClosureEnabled()) {
    const subject = composeDistressSubject([
      action,
      context,
      relationships,
      emotional_state,
      philosophical_reflection,
      improvement_path,
      oikeiosis_context,
    ])
    // Empty subject ⇒ skip. Not an optimisation: detectDistressTwoStage has no
    // empty short-circuit and would pay for a real billed Haiku call before
    // this route's own 400 fires (PR19 2026-08-18, CONFIRMED).
    if (hasScreenableSubject(subject)) {
      const gate = await enforceDistressCheck(detectDistressTwoStage(subject))
      if (gate.result.distress_detected && gate.result.severity !== 'mild') {
        return NextResponse.json({
          distress_detected: true,
          severity: gate.result.severity,
          redirect_message: gate.result.redirect_message,
        })
      }
      if (gate.result.severity === 'mild') {
        mildSupport = buildMildSupportResources('practice')
      }
    }
  }

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

  // Mild folds onto the success path — it never blocks the save.
  return NextResponse.json({
    success: true,
    id: data.id,
    ...(mildSupport ? { support_resources: mildSupport } : {}),
  })
}
