import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  validateTextLength,
  TEXT_LIMITS,
  corsHeaders,
} from '@/lib/security'
import { MODEL_FAST, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { getClient } from '@/lib/sage-reason-engine'
import { isLlmOutage } from '@/lib/llm-outage'
import { logRouteError } from '@/lib/observability-store'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import {
  isImpulseR20aEnabled,
  composeImpulseDistressSubject,
  escalateMildDistress,
  buildMildSupportResources,
  type MildSupportResources,
} from './r20a'
import {
  TRAIT_IDS,
  SUB_SPECIES_IDS,
  IMPULSE_EXCEEDED_VALUES,
  COOPERATION_GROUNDS,
  modeForTrait,
  traitName,
  type ExaminationMode,
  type ImpressionSpecificity,
} from './vocabulary'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * /api/mentor/impulse — the primal-impulse examination tool (S7).
 *
 * ===========================================================================
 * WHAT THIS IS
 * ===========================================================================
 *
 * The mentor's synthesis (2026-08-11, Heading 7) named a gap in the practice
 * architecture: the existing activities are *"oriented toward virtue
 * aspiration"* and are *"less well-developed for the examination of primal
 * substrate — surfacing the specific impulse, tracing it to its passion
 * sub-species, and examining the false judgement underneath it."*
 *
 * The reframe this tool makes usable, verbatim (synthesis Heading 1):
 *
 *   "The eleven traits in the research are not enemies of examined assent —
 *    they are its raw material. ... The examination is only possible if the
 *    impulse is present and visible. ... A practitioner who notices
 *    competitive anxiety, territorial defensiveness about their work, or
 *    status-seeking in how they present ideas to collaborators is not failing
 *    — they are generating examination material."
 *
 * So: the practitioner names which primal impulse is most active for them RIGHT
 * NOW (the trait — the entry point), and the tool runs the committed
 * examination from there.
 *
 * ===========================================================================
 * THE EXAMINATION IS THE COMMITTED SEQUENCE, NOT A NEW TAXONOMY (A1 / C1)
 * ===========================================================================
 *
 * Ruled: *"The DIAGNOSTIC_SEQUENCE is the committed examination pathway. S7
 * applies it rather than authoring a parallel taxonomy."* The five questions
 * ARE `DIAGNOSTIC_SEQUENCE` (`stoic-brain.ts:595-601`, from
 * passions.json > diagnostic_use), entered from a trait:
 *
 *   1. the specific impression        -> `impression`        (THE GATED FIELD)
 *   2. the false belief that drove assent -> `false_belief`
 *   3. did the impulse exceed reason? -> `impulse_exceeded` (+ optional note)
 *   4. which sub-species was operative-> `sub_species`       (trait-narrowed)
 *   5. the correct judgement          -> `correct_judgement`
 *
 * PR15 is satisfied by APPLYING the existing primitive rather than electing a
 * bespoke one; no bespoke justification is owed because none was elected.
 *
 * ===========================================================================
 * THE FOURTH PATHWAY IS A DISTINCT MODE (B4)
 * ===========================================================================
 *
 * Reciprocity / Conditional Cooperation is NOT a passion sub-species. Ruled:
 * *"distinct mode within the same tool, with its own question set, entered
 * from the reciprocity trait and framed around the praxis failure mode. Not
 * routed to /oikeiosis in v1 ... Not omitted."* Its two questions are the
 * mentor's own words, reproduced in `vocabulary.ts` and rendered verbatim;
 * the second is a COUNTERFACTUAL, not a diagnosis, which is exactly why the
 * mode's shape genuinely differs. Forcing it into the sub-species shape would
 * either invent a sub-species (an R7 source-fidelity violation) or drop the
 * pathway.
 *
 * `mode` is DERIVED SERVER-SIDE from the trait (`modeForTrait`) and is never
 * read from the request body — a client cannot submit a trait/mode pair the
 * vocabulary does not license.
 *
 * ===========================================================================
 * THE ONE GATE — AND WHAT IT MUST NEVER TOUCH
 * ===========================================================================
 *
 * Exactly one classification-only gate, on step 1's SPECIFICITY. The criterion
 * is the mentor's own (synthesis Heading 4): *"Not 'I felt competitive' but 'I
 * felt competitive when X said Y, because I interpreted it as a threat to Z.'
 * The specificity is the evidence of genuine examination rather than formulaic
 * self-report."*
 *
 * *** THE GATE MUST NEVER TOUCH STEPS 2-5. *** In particular it must never
 * classify, score, or grade the CORRECT JUDGEMENT (step 5) — that would make
 * this tool an assessor of the practitioner's philosophy, which no sibling
 * does and which `/sage-compass`'s binding not-a-verdict constraint rules out
 * by analogy. `classifyImpressionSpecificity` takes ONLY the trait and the
 * impression; the boundary test pins the signature AND both call sites'
 * argument lists (the `/sage-compass` lesson: a pin that checks only a
 * parameter NAME is defeated by a rename-and-pass-positionally).
 *
 * The LLM authors no message and no Stoic commentary; the tailored messages
 * are deterministic (`specificityBlock`), keyed off the classification. The
 * gate fails OPEN so an outage never blocks a genuine entry.
 *
 * ===========================================================================
 * *** INSIDE THE R20a DISTRESS PERIMETER — A RULED DEPARTURE (B3, AC5) ***
 * ===========================================================================
 *
 * Every sibling Remaining-Principles tool sits OUTSIDE the perimeter. This one
 * is INSIDE it, deliberately, by mentor ruling. The full reason is recorded at
 * the head of `./r20a.ts` and in the decision-log entry — AC5 requires it in
 * both, because every sibling records the opposite decision and a future
 * reader would otherwise read this as an error.
 *
 * In one line: this tool deliberately elicits shame (`aischyne`) and dread
 * (`agonia`) in the practitioner's own words, beside grief, envy and jealousy,
 * and its design premise is that the practitioner should NOT suppress that
 * material — *"which means the tool is doing exactly what the perimeter exists
 * to catch when it fires genuinely."*
 *
 * Wiring: `await enforceDistressCheck(detectDistressTwoStage(...))` over the
 * submitted free text, BEFORE the gate's LLM call AND before this route's own
 * field validation (a deliberate divergence from /api/score-conversation's
 * ordering — see the block comment at the call site). Flag-gated behind
 * SUBSTRATE_IMPULSE_R20A_ENABLED; flag-off is byte-identical.
 *
 * ===========================================================================
 * MEASUREMENT NEUTRALITY
 * ===========================================================================
 *
 * Human-only. This route never touches `/api/reason`, `/api/guardrail`, the
 * signed assessment, or the substrate engine, and imports NO substrate /
 * trust-core / kathekon-engagement / Gate-1 / reflect / proximity-domains
 * module. The passion vocabulary is defined LOCALLY (`./vocabulary.ts`) rather
 * than imported from `stoic-brain.ts`, which is imported directly by
 * `api/guardrail/route.ts` and `guardrail-sandwich.ts` — reading it is
 * permitted, EDITING it is forbidden. A drift pin in the boundary test reads
 * that file AS TEXT and asserts the local ids are a subset.
 *
 * The ONE exception to the no-substrate rule is
 * `@/lib/substrate/r20a-audience-renderer`, which the B3 perimeter ruling
 * REQUIRES — it is the shared crisis-rendering surface every perimeter route
 * uses, and its only import is a type-only import from `./r20a-gate`. The
 * boundary test permits that exact specifier and forbids every other
 * `/substrate` path.
 *
 * The link to `/passion-log` is PAGE PROSE ONLY — no code coupling (B2, the
 * `/sage-compass` precedent). `passion_events` is never read or written here.
 */

// ---------------------------------------------------------------------------
// Rate-limit bucket — a DELIBERATE choice, not an inherited one.
//
// Every sibling uses RATE_LIMITS.scoring for all three handlers. `scoring` is
// an IP-KEYED bucket SHARED WITH /api/reason, and the 2026-07-29 review moved
// /api/milestones and /api/baseline OFF it precisely to stop a human surface
// throttling the measured instrument from the same IP (memory:
// rate-limit-bucket-couples-to-measured-surface).
//
// Split adopted here, with the reason recorded rather than the precedent
// silently inherited:
//   - GET  -> analytics. The feed is the high-frequency, read-only path and
//             therefore the dominant source of shared-bucket consumption. It
//             makes no LLM call, so the looser 60/min ceiling costs nothing.
//   - POST/PATCH -> scoring. These make an LLM call and want the tighter
//             15/min throttle; they are inherently low-volume (one per
//             examination), so their residual coupling to /api/reason's bucket
//             is small and is named here rather than hidden.
// ---------------------------------------------------------------------------
const WRITE_RATE_LIMIT = RATE_LIMITS.scoring
const READ_RATE_LIMIT = RATE_LIMITS.analytics

type ParsedImpulse =
  | { ok: false; error: string }
  | {
      ok: true
      trait: string
      mode: ExaminationMode
      impression: string
      false_belief: string | null
      impulse_exceeded: string | null
      impulse_note: string | null
      sub_species: string | null
      correct_judgement: string | null
      cooperation_ground: string | null
      cooperation_ground_note: string | null
      counterfactual: string | null
    }

/**
 * Read + shape the JSON request body. A non-JSON payload, or a body that is
 * not a plain object (null / array / primitive), is a client error → 400
 * rather than a generic 500.
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
 * Validate the content fields, shared by POST and the PATCH revise path so the
 * two can never drift.
 *
 * The trait selects the mode; the mode selects which fields are required. The
 * migration carries the same invariant as a CHECK constraint, so a bug here
 * cannot write a half-shaped row.
 */
function parseImpulseContent(body: Record<string, unknown>): ParsedImpulse {
  // typeof-guarded, not a bare cast: a non-string value of the right key must
  // coerce to undefined here and fail the required-field check with a 400,
  // rather than reach .trim() on a non-string and throw a TypeError the
  // caller's try/catch reports as a generic 500.
  const asString = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
  const optional = (v: unknown): string | null => {
    const s = asString(v)
    return s && s.trim() ? s.trim() : null
  }

  const trait = asString(body.trait)
  const impression = asString(body.impression)

  if (!trait || !impression?.trim()) {
    return { ok: false, error: 'Required fields: trait, impression' }
  }
  if (!TRAIT_IDS.includes(trait)) {
    return { ok: false, error: `trait must be one of: ${TRAIT_IDS.join(', ')}` }
  }

  // The mode is DERIVED from the trait — never read from the body. A trait with
  // no v1 pathway is a real 400: the eleven-trait vocabulary is deliberately
  // wider than the wired set (C13 extensibility), so "known trait, no pathway
  // yet" is a distinct and honest rejection, not a silent fallthrough.
  const mode = modeForTrait(trait)
  if (mode === null) {
    return {
      ok: false,
      error: `The examination pathway for "${traitName(trait)}" is not built yet. Four pathways are available in this version.`,
    }
  }

  const errImpression = validateTextLength(impression, 'Impression', TEXT_LIMITS.medium)
  if (errImpression) return { ok: false, error: errImpression }

  if (mode === 'diagnostic_sequence') {
    const false_belief = asString(body.false_belief)
    const impulse_exceeded = asString(body.impulse_exceeded)
    const sub_species = asString(body.sub_species)
    const correct_judgement = asString(body.correct_judgement)

    if (!false_belief?.trim() || !impulse_exceeded || !sub_species || !correct_judgement?.trim()) {
      return {
        ok: false,
        error:
          'Required fields for this examination: false_belief, impulse_exceeded, sub_species, correct_judgement',
      }
    }
    if (!IMPULSE_EXCEEDED_VALUES.includes(impulse_exceeded as never)) {
      return {
        ok: false,
        error: `impulse_exceeded must be one of: ${IMPULSE_EXCEEDED_VALUES.join(', ')}`,
      }
    }
    if (!SUB_SPECIES_IDS.includes(sub_species)) {
      return { ok: false, error: 'sub_species must be one of the committed passion sub-species' }
    }

    const impulse_note = optional(body.impulse_note)
    for (const [field, value] of [
      ['False belief', false_belief],
      ['Correct judgement', correct_judgement],
      ...(impulse_note ? ([['Note', impulse_note]] as const) : []),
    ] as const) {
      const err = validateTextLength(value, field, TEXT_LIMITS.medium)
      if (err) return { ok: false, error: err }
    }

    return {
      ok: true,
      trait,
      mode,
      impression: impression.trim(),
      false_belief: false_belief.trim(),
      impulse_exceeded,
      impulse_note,
      sub_species,
      correct_judgement: correct_judgement.trim(),
      cooperation_ground: null,
      cooperation_ground_note: null,
      counterfactual: null,
    }
  }

  // mode === 'reciprocity' — the B4 question set. No sub-species, by ruling.
  const cooperation_ground = asString(body.cooperation_ground)
  const cooperation_ground_note = asString(body.cooperation_ground_note)
  const counterfactual = asString(body.counterfactual)

  if (!cooperation_ground || !cooperation_ground_note?.trim() || !counterfactual?.trim()) {
    return {
      ok: false,
      error:
        'Required fields for this examination: cooperation_ground, cooperation_ground_note, counterfactual',
    }
  }
  if (!COOPERATION_GROUNDS.includes(cooperation_ground as never)) {
    return {
      ok: false,
      error: `cooperation_ground must be one of: ${COOPERATION_GROUNDS.join(', ')}`,
    }
  }
  for (const [field, value] of [
    ['Answer', cooperation_ground_note],
    ['Counterfactual', counterfactual],
  ] as const) {
    const err = validateTextLength(value, field, TEXT_LIMITS.medium)
    if (err) return { ok: false, error: err }
  }

  return {
    ok: true,
    trait,
    mode,
    impression: impression.trim(),
    false_belief: null,
    impulse_exceeded: null,
    impulse_note: null,
    sub_species: null,
    correct_judgement: null,
    cooperation_ground,
    cooperation_ground_note: cooperation_ground_note.trim(),
    counterfactual: counterfactual.trim(),
  }
}

/**
 * The tailored gate message — authored DETERMINISTICALLY (never by the LLM),
 * keyed off the classification of the IMPRESSION.
 *
 * Note what it does and does not say. It speaks only to whether the impression
 * is anchored to a specific moment. It passes NO judgement on the impulse
 * itself, on the false belief, or on the correct judgement — and its
 * `specific` branch says so explicitly, because the whole reframe this tool
 * carries is that having the impulse is not the failure.
 */
function specificityBlock(quality: ImpressionSpecificity) {
  const specific = quality === 'specific'
  const message = specific
    ? 'That is a specific impression — a moment, not a mood. Noticing the impulse is not a failure; it is what makes the examination possible at all. Nothing here judges the impulse, the belief you found under it, or the judgement you would put in its place.'
    : 'This reads as a general description rather than a specific impression. The practice is not "I felt competitive" but "I felt competitive when X said Y, because I interpreted it as a threat to Z" — the moment, what was said or done, and what you took it to mean. Naming it that precisely is the evidence that this is genuine examination rather than formulaic self-report. Sharpen the impression and set it down again. (Nothing else you wrote is being marked — only whether the impression names a moment.)'
  return { impression_specificity: quality, specific, message }
}

/**
 * POST /api/mentor/impulse — record an impulse examination.
 *
 * Body (DIAGNOSTIC_SEQUENCE mode — competition, hierarchy/dominance,
 *       resource acquisition, threat avoidance):
 *   trait               (required) — one of the eleven trait ids
 *   impression          (required) — step 1; THE ONLY GATED FIELD
 *   false_belief        (required) — step 2
 *   impulse_exceeded    (required) — step 3: yes | no | uncertain
 *   impulse_note        (optional) — step 3, in your own words
 *   sub_species         (required) — step 4; one of the committed sub-species
 *   correct_judgement   (required) — step 5; NEVER classified
 *
 * Body (reciprocity mode):
 *   trait                    (required) — 'reciprocity'
 *   impression               (required) — THE ONLY GATED FIELD
 *   cooperation_ground       (required) — rational_being | expected_return | both | uncertain
 *   cooperation_ground_note  (required) — the mentor's Q1, in your own words
 *   counterfactual           (required) — the mentor's Q2 (the counterfactual)
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, WRITE_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const parsedBody = await readJsonBody(request)
  if (!parsedBody.ok) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  try {
    // ------------------------------------------------------------------
    // R20a — vulnerable-user detection, BEFORE the gate's LLM call and
    // before this route's own field validation.
    //
    // *** A RULED DEPARTURE FROM FAMILY PRECEDENT (mentor ruling B3, AC5). ***
    // Every sibling Remaining-Principles tool sits OUTSIDE this perimeter.
    // This one is inside it because it deliberately elicits shame (aischyne)
    // and dread (agonia) in the practitioner's own words, beside grief, envy
    // and jealousy — "which means the tool is doing exactly what the perimeter
    // exists to catch when it fires genuinely." The full ruling and reasoning
    // are recorded at the head of ./r20a.ts and in the decision-log entry.
    //
    // ORDERING — a deliberate divergence from /api/score-conversation, which
    // validates field lengths first: here the check runs before validation, so
    // distress written into an otherwise-malformed or oversized body still
    // catches rather than being answered with a 400. The subject composer is
    // total over unknown input (non-strings skipped) and caps every field, so
    // running first is safe and strictly more conservative.
    //
    // FLAG-GATED behind SUBSTRATE_IMPULSE_R20A_ENABLED (default OFF). When
    // UNSET this whole block is skipped and the route is byte-identical: no
    // classifier call, no added latency, no wire-shape change. Activation is a
    // founder-walked Critical step; rollback = unset the flag.
    //
    // Moderate/acute -> the HUMAN-audience crisis rendering (cookie-session
    // route; the developer-form payload is unreachable). Stage-1 'mild' -> the
    // mild-escalation check (stage 2 runs anyway, more severe wins, never a
    // downgrade — see ./r20a.ts for why THIS route needs it). Final mild ->
    // the entry is saved and the crisis resources ride along additively.
    //
    // Rules: R20a; AC2; AC4; AC5 (fourteenth route-level entry); PR3 (awaited,
    // never fire-and-forget); PR6; PR15 (shared classifier + renderer reused).
    // ------------------------------------------------------------------
    let mildSupportResources: MildSupportResources | undefined
    if (isImpulseR20aEnabled()) {
      const distressSubject = composeImpulseDistressSubject(parsedBody.body)
      const gate = await enforceDistressCheck(detectDistressTwoStage(distressSubject))
      let effectiveDistress = gate.result
      if (!gate.shouldRedirect && gate.result.severity === 'mild') {
        effectiveDistress = await escalateMildDistress(distressSubject, gate.result)
      }
      if (effectiveDistress.redirect_message !== null) {
        return NextResponse.json(
          renderR20aRedirectResponse({
            audience: 'human_user',
            severity: effectiveDistress.severity,
            redirect_message: effectiveDistress.redirect_message,
          }),
          { status: 200, headers: corsHeaders() }
        )
      }
      if (effectiveDistress.severity === 'mild') {
        mildSupportResources = buildMildSupportResources()
      }
    }

    const parsed = parseImpulseContent(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    // NOTE THE ARGUMENTS: the trait and the impression, and nothing else. The
    // false belief, the sub-species, the counterfactual and — above all — the
    // CORRECT JUDGEMENT are deliberately NOT passed. They are never classified.
    const quality = await classifyImpressionSpecificity(parsed.trait, parsed.impression)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('impulse_entries')
      .insert({
        user_id: userId,
        trait: parsed.trait,
        mode: parsed.mode,
        impression: parsed.impression,
        false_belief: parsed.false_belief,
        impulse_exceeded: parsed.impulse_exceeded,
        impulse_note: parsed.impulse_note,
        sub_species: parsed.sub_species,
        correct_judgement: parsed.correct_judgement,
        cooperation_ground: parsed.cooperation_ground,
        cooperation_ground_note: parsed.cooperation_ground_note,
        counterfactual: parsed.counterfactual,
        impression_specificity: quality,
      })
      .select()
      .single()

    if (error) {
      console.error('Impulse insert error:', error)
      return NextResponse.json({ error: 'Failed to save impulse examination' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: specificityBlock(quality),
      ...(mildSupportResources !== undefined ? { support_resources: mildSupportResources } : {}),
    })
  } catch (err) {
    console.error('Impulse API error:', err)
    logRouteError({ route: '/api/mentor/impulse', method: 'POST', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/mentor/impulse — revise an existing examination in place.
 *
 * The PR-3 affordance every sibling carries: used to sharpen an impression the
 * gate read as general, without re-entering everything or creating a
 * duplicate. Re-validates the same fields and re-runs the same single gate.
 * Scoped to the authenticated user (matched on BOTH id AND user_id).
 * Body: { id, ...content }.
 */
export async function PATCH(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, WRITE_RATE_LIMIT)
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
  // id is a uuid PRIMARY KEY. Reject a malformed id here — before the R20a
  // check and the classification call — rather than let Postgres reject it as
  // 22P02 and surface a generic 500 for what is a 400-grade client error.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Entry id must be a valid uuid' }, { status: 400 })
  }

  try {
    // R20a on the revise path too — a revision carries the same free text, and
    // a practitioner sharpening an impression is exactly as likely to write
    // something the perimeter exists to catch. Same flag, same ordering, same
    // ruling (B3). See the POST block comment for the full reasoning.
    let mildSupportResources: MildSupportResources | undefined
    if (isImpulseR20aEnabled()) {
      const distressSubject = composeImpulseDistressSubject(parsedBody.body)
      const gate = await enforceDistressCheck(detectDistressTwoStage(distressSubject))
      let effectiveDistress = gate.result
      if (!gate.shouldRedirect && gate.result.severity === 'mild') {
        effectiveDistress = await escalateMildDistress(distressSubject, gate.result)
      }
      if (effectiveDistress.redirect_message !== null) {
        return NextResponse.json(
          renderR20aRedirectResponse({
            audience: 'human_user',
            severity: effectiveDistress.severity,
            redirect_message: effectiveDistress.redirect_message,
          }),
          { status: 200, headers: corsHeaders() }
        )
      }
      if (effectiveDistress.severity === 'mild') {
        mildSupportResources = buildMildSupportResources()
      }
    }

    const parsed = parseImpulseContent(parsedBody.body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    // Same arguments as POST: trait + impression only. Never step 5.
    const quality = await classifyImpressionSpecificity(parsed.trait, parsed.impression)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('impulse_entries')
      .update({
        trait: parsed.trait,
        mode: parsed.mode,
        impression: parsed.impression,
        false_belief: parsed.false_belief,
        impulse_exceeded: parsed.impulse_exceeded,
        impulse_note: parsed.impulse_note,
        sub_species: parsed.sub_species,
        correct_judgement: parsed.correct_judgement,
        cooperation_ground: parsed.cooperation_ground,
        cooperation_ground_note: parsed.cooperation_ground_note,
        counterfactual: parsed.counterfactual,
        impression_specificity: quality,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Impulse update error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }
    // No row matched the (id, user_id) scope — the entry does not exist or is
    // not the caller's. Honest 404, not a misleading 500. The .eq('user_id')
    // scope guarantees no cross-user row is ever touched.
    if (!data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      quality_gate: specificityBlock(quality),
      ...(mildSupportResources !== undefined ? { support_resources: mildSupportResources } : {}),
    })
  } catch (err) {
    console.error('Impulse PATCH error:', err)
    logRouteError({ route: '/api/mentor/impulse', method: 'PATCH', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/impulse?view=feed&limit=50 — the practitioner's own
 * examinations, most recent first.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, READ_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  // Adversarial review, 2026-08-12: the sibling precedent
  // (Math.min(parseInt(...), 200)) passes NaN through to .limit() on a
  // non-numeric query param (e.g. ?limit=abc), which this route's own
  // discipline (an honest 400 over a generic 500 — see the PATCH id check and
  // readJsonBody above) argues against. parsedLimit falls back to 50 on
  // anything non-finite, then the existing floor/ceiling applies.
  const parsedLimit = parseInt(searchParams.get('limit') || '50', 10)
  const limit = Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 50, 200)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: entries, error } = await supabase
    .from('impulse_entries')
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
 * The single gate: an LLM CLASSIFIES the IMPRESSION — nothing more. It returns
 * one of 'specific' | 'general'. The LLM authors no message and no Stoic
 * commentary; the tailored message is produced by the deterministic
 * specificityBlock() above, keyed off this classification.
 *
 *   specific — the impression names a MOMENT: what happened, what was said or
 *              done, and what the practitioner took it to mean.
 *   general  — a mood, a disposition, or a summary ("I felt competitive",
 *              "I've been anxious about work") with no anchoring moment.
 *
 * *** SCOPE (binding). *** This function takes the TRAIT and the IMPRESSION.
 * It does NOT take, and must never be given, the false belief, the sub-species,
 * the counterfactual, the cooperation ground, or the CORRECT JUDGEMENT. The
 * correct judgement in particular is the practitioner's own philosophy, and
 * this tool does not assess it — no sibling assesses one, and /sage-compass's
 * binding not-a-verdict constraint rules it out by analogy. The boundary test
 * pins the signature AND both call sites' arguments, and both pins are
 * mutation-verified.
 *
 * The trait IS passed, and only because specificity is trait-relative: a
 * specific impression of a threat and a specific impression of a status slight
 * look different, and the classifier is told which is being examined so it
 * judges anchoring rather than subject matter. It is given no other field, and
 * is instructed to say nothing about the impulse itself.
 *
 * Fails OPEN (returns 'specific') so a gate outage never blocks a genuine
 * entry — the conservative direction for a tool whose whole premise is that
 * the practitioner should not be discouraged from writing honestly.
 */
async function classifyImpressionSpecificity(
  trait: string,
  impression: string
): Promise<ImpressionSpecificity> {
  try {
    const ck = cacheKey('/api/mentor/impulse/specificity-gate', {
      trait,
      impression: impression.trim(),
    })
    const cached = cacheGet(ck) as { specificity: ImpressionSpecificity } | undefined
    if (cached !== undefined) return cached.specificity

    const client = getClient()

    const response = await client.messages.create({
      model: MODEL_FAST,
      max_tokens: 128,
      system: `You are a classifier for a Stoic impulse-examination exercise. A practitioner names which primal impulse is most active for them right now, then describes the IMPRESSION that generated it — the field you are classifying.

Classify ONLY whether the impression names a SPECIFIC MOMENT or is a GENERAL description. Do not add commentary or advice. Do not evaluate the practitioner, the impulse, the belief underneath it, or what they propose to think instead — that is explicitly none of your concern. Noticing an impulse is not a failing in this framework, and you are not assessing whether they should have felt it.

"specific": the impression names an occasion — roughly what happened, what was said or done, and what the practitioner took it to mean (e.g. "I felt competitive when Dana presented the migration plan in standup, because I read the room agreeing with her as a judgement that my design was the weaker one").

"general": a mood, a disposition, a habit, or a summary with no anchoring moment (e.g. "I felt competitive", "I've been anxious about work lately", "I get defensive about my code").

Respond ONLY with: {"specificity": "specific"} or {"specificity": "general"}`,
      messages: [
        {
          role: 'user',
          content: `Primal impulse being examined: ${traitName(trait)}
Impression: ${impression.trim()}

Classify the impression.`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return 'specific' // fail open

    const result = JSON.parse(jsonMatch[0])
    const specificity: ImpressionSpecificity =
      result.specificity === 'general' ? 'general' : 'specific'
    cacheSet(ck, { specificity })
    return specificity
  } catch (err) {
    console.error('Impulse specificity gate failed:', err)
    logRouteError({
      route: '/api/mentor/impulse',
      method: 'POST',
      error: err,
      statusCode: 200,
      isLlmOutage: isLlmOutage(err),
      context: { gate: 'specificity-gate', fail_open: true },
    })
    // Fail open — never block a genuine entry because the gate itself failed.
    return 'specific'
  }
}
