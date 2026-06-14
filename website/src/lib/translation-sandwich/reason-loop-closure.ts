/**
 * reason-loop-closure.ts — the CI-4 reason-route half (mechanism-correction M5,
 * 2026-06-13). Companion to the M3 write-boundary gate
 * (src/app/api/accreditation/[agent_id]/loop-closure-gate.ts).
 *
 * STATUS: Wired (ships DARK — SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED unset in
 * every environment; behaviour byte-identical to pre-M5). Reaches Verified at
 * its own founder-elected 0c-ii activation step.
 *
 * GOVERNING DOCUMENTS:
 *   - The Q4 mentor verdict, ADOPTED 2026-06-12 under
 *     D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12 (dossier row
 *     B6, amended): "a correction is a new phantasia owed a new synkatathesis"
 *     — re-examination after an adopted redirection is a REQUIRED step, AT THE
 *     SAME depth tier as the original examination.
 *   - Build plan CI-4 (D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12).
 *
 * THE TWO HALVES.
 *   - M3 (already shipped, dark): loop-closure-gate.ts — the credential write
 *     boundary that reads the closure markers and flags/rejects an unclosed
 *     chain. The bite point ("the stateless API cannot compel the return
 *     call; the credential is where the requirement bites").
 *   - M5 (this module): the consult surface (/api/reason) gains the
 *     re-examination affordance — a `prior_feedback` input + the examination
 *     markers placed INSIDE the signed assessment so the gate can trust them.
 *
 * THE CONTRACT (defined by the M3 gate; produced here). The gate reads, from
 * each signed assessment's payload (inside the signature, so closure cannot be
 * forged post-hoc):
 *
 *   assessment.examination?: {
 *     ref?: string                 — unique id for this examination (loop id;
 *                                    the route uses the consult's correlationId)
 *     depth_tier?: 'quick' | 'standard' | 'deep'
 *     prior_feedback_ref?: string  — the `ref` of the redirection-bearing
 *                                    examination this one re-examines
 *   }
 *
 * VOCABULARY NOTE (the Note-A reconciliation). `prior_feedback` originates as a
 * Layer-1 input shape on /api/score's iterative-refinement variant
 * (canonical-framework.md:132, Note A — "prior evaluation findings are passed
 * back into the next evaluation as deliberation context"). That score-route
 * shape (previous_action / previous_proximity / passions_identified /
 * false_judgements / sage_reflection) does not fit /api/reason's raw-input
 * contract. CI-4 keeps the Note-A INTENT (prior findings carried back as
 * deliberation context) but shapes the field for the reason route + the M3
 * gate's composition: the prior loop id (→ prior_feedback_ref), the original
 * depth (→ the same-depth rule), and the adopted correction (→ deliberation
 * context folded into the re-examination's `context`).
 *
 * SAME-DEPTH RULE. A re-submission with `prior_feedback` runs the examination
 * at the ORIGINAL examination's depth tier (prior_depth_tier), NOT quick-by-
 * default. The route carries this depth; it is asserted in the M5 tests. (On
 * the sandwich path Layer 1 is always Sonnet, so this is not a model-downgrade
 * guard as it is on the bundled engine — it is the honest record of depth that
 * the M3 gate's same-depth closure check reads, and it keeps RAG retrieval
 * scope consistent across the loop.)
 *
 * PURE + SYNCHRONOUS (env reads only; no I/O, no DB, no self-calls). Response-
 * shape only: no new DB write on the reason route (KG1 not engaged).
 */

// ============================================================================
// ENV FLAG
// ============================================================================

export const REASON_LOOP_CLOSURE_ENV_VAR = 'SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → the route
 *  ignores `prior_feedback` entirely and emits no markers / no examination_open
 *  (byte-identical to pre-M5). */
export function isReasonLoopClosureEnabled(): boolean {
  return process.env[REASON_LOOP_CLOSURE_ENV_VAR] === 'true'
}

// ============================================================================
// DEPTH TIERS (mirrors the route's VALID_DEPTHS + the gate's DEPTH_RANK)
// ============================================================================

export type LoopDepthTier = 'quick' | 'standard' | 'deep'
const VALID_LOOP_DEPTHS: readonly LoopDepthTier[] = ['quick', 'standard', 'deep']

// ============================================================================
// prior_feedback INPUT
// ============================================================================

/** The reason-route `prior_feedback` input (Note-A intent, reason-route shape). */
export interface PriorFeedback {
  /** The `ref` of the redirection-bearing examination being re-examined. */
  readonly prior_loop_id: string
  /** The original examination's depth tier — the re-examination runs here. */
  readonly prior_depth_tier: LoopDepthTier
  /** The correction adopted from the prior redirection (deliberation context). */
  readonly adopted_correction?: string
}

export type ParsePriorFeedbackResult =
  | { ok: true; value: PriorFeedback | null } // null = absent (a fresh examination)
  | { ok: false; error: string }

/**
 * Parse + validate the `prior_feedback` request field. Absent/null → a fresh
 * examination (value: null). Present-but-malformed → ok:false (the route 400s).
 * Never throws.
 */
export function parsePriorFeedback(raw: unknown): ParsePriorFeedbackResult {
  if (raw === undefined || raw === null) {
    return { ok: true, value: null }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      error:
        'prior_feedback must be an object carrying prior_loop_id and prior_depth_tier.',
    }
  }
  const o = raw as Record<string, unknown>

  if (typeof o.prior_loop_id !== 'string' || o.prior_loop_id.trim() === '') {
    return {
      ok: false,
      error:
        'prior_feedback.prior_loop_id must be a non-empty string (the ref of the examination being re-examined — see assessment.examination.ref / the X-Loop-Id of the prior consult).',
    }
  }
  if (
    typeof o.prior_depth_tier !== 'string' ||
    !VALID_LOOP_DEPTHS.includes(o.prior_depth_tier as LoopDepthTier)
  ) {
    return {
      ok: false,
      error: `prior_feedback.prior_depth_tier must be one of: ${VALID_LOOP_DEPTHS.join(', ')} (the original examination's depth — the re-examination runs at the same depth).`,
    }
  }
  if (o.adopted_correction !== undefined && typeof o.adopted_correction !== 'string') {
    return {
      ok: false,
      error: 'prior_feedback.adopted_correction, when present, must be a string.',
    }
  }

  return {
    ok: true,
    value: {
      prior_loop_id: o.prior_loop_id,
      prior_depth_tier: o.prior_depth_tier as LoopDepthTier,
      ...(typeof o.adopted_correction === 'string' &&
        o.adopted_correction.trim() !== '' && {
          adopted_correction: o.adopted_correction,
        }),
    },
  }
}

// ============================================================================
// EXAMINATION MARKERS (placed INSIDE the signed assessment)
// ============================================================================

/** The markers the M3 gate reads. prior_feedback_ref is OMITTED when absent —
 *  the Layer-2 canonicaliser throws on undefined values, so an absent marker
 *  must not appear as a key at all. */
export interface ExaminationMarkers {
  readonly ref: string
  readonly depth_tier: LoopDepthTier
  readonly prior_feedback_ref?: string
}

/**
 * Build the examination markers for this consult. Every examination (when the
 * flag is on) carries ref + depth_tier so a redirection is closeable; a
 * re-examination additionally carries prior_feedback_ref.
 */
export function buildExaminationMarkers(args: {
  ref: string
  depthTier: LoopDepthTier
  priorFeedback: PriorFeedback | null
}): ExaminationMarkers {
  return {
    ref: args.ref,
    depth_tier: args.depthTier,
    ...(args.priorFeedback !== null && {
      prior_feedback_ref: args.priorFeedback.prior_loop_id,
    }),
  }
}

/**
 * The `examination_open` response signal: a completed examination owes a
 * re-examination iff it issued a redirection. Mirrors the M3 gate's
 * "redirection issued" definition (improvement_path_structured non-null) so the
 * caller-facing open/closed signal and the credential-boundary closure check
 * agree on what a redirection is.
 */
export function examinationOpen(assessment: {
  improvement_path_structured?: unknown
}): boolean {
  return (
    assessment.improvement_path_structured !== null &&
    assessment.improvement_path_structured !== undefined
  )
}

// ============================================================================
// RE-EXAMINATION CONTEXT (Note-A: the adopted correction is deliberation context)
// ============================================================================

/**
 * Fold the adopted correction into the examination context so the
 * re-examination is genuinely informed by the prior redirection (the Note-A
 * intent). Returns the base context unchanged when there is no prior_feedback
 * or no adopted_correction — so the flag-off / fresh-examination path is
 * byte-identical.
 */
export function composeReExaminationContext(
  baseContext: string | undefined,
  priorFeedback: PriorFeedback | null,
): string | undefined {
  if (priorFeedback === null || priorFeedback.adopted_correction === undefined) {
    return baseContext
  }
  const note = `Re-examination after correction (prior examination ${priorFeedback.prior_loop_id}). Adopted correction: ${priorFeedback.adopted_correction}`
  return baseContext !== undefined && baseContext.trim() !== ''
    ? `${baseContext}\n\n${note}`
    : note
}
