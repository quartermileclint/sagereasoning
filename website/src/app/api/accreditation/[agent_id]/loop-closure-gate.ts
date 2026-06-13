/**
 * loop-closure-gate.ts — the CI-4 write-boundary loop-closure gate
 * (mechanism-correction M3, 2026-06-13).
 *
 * STATUS: Wired (ships DARK — both env flags unset in every environment;
 * behaviour byte-identical to pre-gate). Reaches Verified at its own
 * founder-elected 0c-ii activation step, intended AFTER M5 lands the
 * closure markers on the consult path (see CONTRACT below).
 *
 * GOVERNING DOCUMENTS:
 *   - The Q4 mentor verdict, ADOPTED 2026-06-12 under
 *     D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12 (dossier row
 *     B6, amended): "a correction is a new phantasia owed a new
 *     synkatathesis" — re-examination after an adopted redirection is a
 *     REQUIRED step, at the SAME depth tier as the original examination.
 *   - Build plan CI-4 (D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12):
 *     "the stateless API cannot compel the return call; the credential is
 *     where the requirement bites." This module is that bite point.
 *   - Founder elections, M3 session 2026-06-13: CI-4 write-boundary half IN;
 *     shape = BOTH modes (flag + reject) behind separate envs, flag-first
 *     activation path mirroring the R18f provenance gate's dark-deploy →
 *     enable → enforce precedent.
 *
 * PLACEMENT. Invoked by the POST handler AFTER the R18f provenance gate
 * (enforceWriteProvenance — "was there an examination?") and BEFORE the
 * writer. This module answers the NEXT question: "did the examination loop
 * close?" The R18f gate's logic is NOT modified — this is a separate,
 * additive module (the M3 prompt's Critical-check: extension, not
 * modification; PR6 not engaged).
 *
 * THE TWO ENV FLAGS (exact-string 'true', read at call time):
 *   SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED — master switch. Unset/other → the
 *     gate returns ok immediately (enforced: false); behaviour byte-identical
 *     to pre-gate. 'true' → FLAG mode: the chain is analysed, the result is
 *     annotated on the write response + logged; the write PROCEEDS regardless.
 *   SUBSTRATE_LOOP_CLOSURE_GATE_REJECT — escalation. Only read when the
 *     master switch is on. 'true' → REJECT mode: a chain whose verdict is
 *     'unclosed' is REFUSED (422 at the route). Indeterminate redirections
 *     (no closure markers — every pre-M5 chain) COUNT AS UNCLOSED: closure
 *     that cannot be verified is not closure (the same honesty posture as
 *     R18f's no-credential-without-examination). Consequence, stated plainly:
 *     reject mode MUST NOT be activated before M5 ships the markers, or every
 *     redirection-bearing write is refused.
 *
 * THE CONTRACT (defined here, populated by M5 — the CI-4 reason-route half).
 * The gate reads OPTIONAL closure markers from each signed assessment's
 * payload (INSIDE the signature, so closure cannot be forged post-hoc):
 *
 *   assessment.examination?: {
 *     ref?: string                 — unique id for this examination (loop id)
 *     depth_tier?: 'quick' | 'standard' | 'deep'
 *     prior_feedback_ref?: string  — the `ref` of the redirection-bearing
 *                                    examination this one re-examines
 *   }
 *
 * Element classification:
 *   - REDIRECTION ISSUED: improvement_path_structured non-null on the
 *     assessment (the engine's Rule-5 correction carrier — present today).
 *   - RE-EXAMINATION: an element carrying examination.prior_feedback_ref.
 * Closure rule (the Q4 same-depth rule): a redirection with ref R at depth D
 * is CLOSED iff a LATER element in the chain carries
 * prior_feedback_ref === R at depth rank ≥ rank(D). A redirection without
 * ref or depth markers is INDETERMINATE (cannot be verified closed).
 *
 * SYNCHRONOUS + PURE-ish (env reads only; no I/O, no DB, no self-calls —
 * KG1/PR3 posture identical to the provenance gate). AC5 unaffected (no
 * distress surface); PR6 NOT engaged (no R20a / zone logic).
 */

// ============================================================================
// ENV FLAGS
// ============================================================================

export const LOOP_CLOSURE_GATE_ENV_VAR = 'SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED'
export const LOOP_CLOSURE_REJECT_ENV_VAR = 'SUBSTRATE_LOOP_CLOSURE_GATE_REJECT'

/** True only when the master switch is the exact string 'true'. */
export function isLoopClosureGateEnabled(): boolean {
  return process.env[LOOP_CLOSURE_GATE_ENV_VAR] === 'true'
}

/** True only when BOTH the master switch and the reject escalation are the
 *  exact string 'true'. */
export function isLoopClosureRejectEnabled(): boolean {
  return (
    isLoopClosureGateEnabled() &&
    process.env[LOOP_CLOSURE_REJECT_ENV_VAR] === 'true'
  )
}

// ============================================================================
// THE CONTRACT TYPES
// ============================================================================

/** The depth tiers, ranked for the Q4 same-depth rule. */
const DEPTH_RANK: Record<string, number> = {
  quick: 1,
  standard: 2,
  deep: 3,
}

/** The closure markers M5 adds inside the signed assessment payload. All
 *  optional — every pre-M5 assessment carries none. */
export interface LoopClosureMarkers {
  readonly ref?: string
  readonly depth_tier?: string
  readonly prior_feedback_ref?: string
}

/** The per-chain analysis, surfaced on the response (flag mode) and in the
 *  structured log line (both modes). */
export interface LoopClosureAnalysis {
  /** no_chain — no provenance assessments present to analyse (the provenance
   *  gate, when ON, is what mandates the block; this gate does not duplicate
   *  R18f). no_redirections — chain present, nothing to close. closed — every
   *  redirection verifiably re-examined at ≥ its depth. unclosed — at least
   *  one redirection open or indeterminate. */
  readonly verdict: 'no_chain' | 'no_redirections' | 'closed' | 'unclosed'
  readonly redirections: number
  /** Verifiably closed per the same-depth rule. */
  readonly closed: number
  /** Marker-bearing redirections with no qualifying later re-examination. */
  readonly open: number
  /** Redirections without closure markers (pre-M5 / legacy chains) — closure
   *  unverifiable, counted as unclosed under reject mode. */
  readonly indeterminate: number
}

/**
 * Gate result.
 *   ok:true, enforced:false — kill-switch off; behaviour byte-identical.
 *   ok:true, enforced:true  — gate ran; the write proceeds (flag mode, or
 *                             reject mode with a closed/no-redirection chain).
 *                             `analysis` is annotated on the response.
 *   ok:false                — reject mode refused an unclosed chain (422 at
 *                             the route).
 */
export type LoopClosureGateResult =
  | { ok: true; enforced: false }
  | { ok: true; enforced: true; analysis: LoopClosureAnalysis }
  | {
      ok: false
      status: 'loop_unclosed'
      analysis: LoopClosureAnalysis
      message: string
    }

// ============================================================================
// DEFENSIVE EXTRACTION (the chain may predate the contract)
// ============================================================================

/** Narrow an unknown signed-assessment element to its closure-relevant
 *  fields. Returns null markers for anything malformed — the gate never
 *  throws on a legacy shape. */
function extractElement(x: unknown): {
  redirection: boolean
  markers: LoopClosureMarkers
} {
  if (typeof x !== 'object' || x === null) {
    return { redirection: false, markers: {} }
  }
  const assessment = (x as Record<string, unknown>).assessment
  if (typeof assessment !== 'object' || assessment === null) {
    return { redirection: false, markers: {} }
  }
  const a = assessment as Record<string, unknown>

  // REDIRECTION ISSUED — the engine's Rule-5 correction carrier.
  const redirection =
    a.improvement_path_structured !== null &&
    a.improvement_path_structured !== undefined

  // M5 closure markers (optional; inside the signed payload).
  const exam = a.examination
  if (typeof exam !== 'object' || exam === null) {
    return { redirection, markers: {} }
  }
  const e = exam as Record<string, unknown>
  return {
    redirection,
    markers: {
      ref: typeof e.ref === 'string' ? e.ref : undefined,
      depth_tier: typeof e.depth_tier === 'string' ? e.depth_tier : undefined,
      prior_feedback_ref:
        typeof e.prior_feedback_ref === 'string'
          ? e.prior_feedback_ref
          : undefined,
    },
  }
}

// ============================================================================
// THE ANALYSIS (pure — exported for tests)
// ============================================================================

/**
 * Analyse a provenance chain for loop closure. PURE — no env, no I/O.
 *
 * @param signedAssessments - body.provenance.signed_assessments (unknown-
 *                            shaped; absent/malformed → 'no_chain').
 */
export function analyseLoopClosure(
  signedAssessments: unknown,
): LoopClosureAnalysis {
  if (!Array.isArray(signedAssessments) || signedAssessments.length === 0) {
    return {
      verdict: 'no_chain',
      redirections: 0,
      closed: 0,
      open: 0,
      indeterminate: 0,
    }
  }

  const elements = signedAssessments.map(extractElement)

  let redirections = 0
  let closed = 0
  let open = 0
  let indeterminate = 0

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    if (!el.redirection) continue
    redirections++

    const { ref, depth_tier } = el.markers
    const depthRank = depth_tier !== undefined ? DEPTH_RANK[depth_tier] : undefined
    if (ref === undefined || depthRank === undefined) {
      // No verifiable identity/depth for this redirection — closure cannot
      // be established (pre-M5 chains land here).
      indeterminate++
      continue
    }

    // The Q4 same-depth rule: a LATER element must re-examine THIS ref at
    // the same depth tier or deeper.
    let isClosed = false
    for (let j = i + 1; j < elements.length; j++) {
      const later = elements[j].markers
      if (later.prior_feedback_ref !== ref) continue
      const laterRank =
        later.depth_tier !== undefined ? DEPTH_RANK[later.depth_tier] : undefined
      if (laterRank !== undefined && laterRank >= depthRank) {
        isClosed = true
        break
      }
    }
    if (isClosed) closed++
    else open++
  }

  const verdict: LoopClosureAnalysis['verdict'] =
    redirections === 0
      ? 'no_redirections'
      : open === 0 && indeterminate === 0
        ? 'closed'
        : 'unclosed'

  return { verdict, redirections, closed, open, indeterminate }
}

// ============================================================================
// THE GATE
// ============================================================================

/**
 * Enforce the loop-closure gate against an already-parsed request body.
 *
 * Reads body.provenance.signed_assessments (the same block the R18f
 * provenance gate validates when it is on; this gate does not duplicate that
 * validation — an absent block analyses as 'no_chain' and is the provenance
 * gate's concern, not this one's).
 */
export function enforceLoopClosure(rawBody: unknown): LoopClosureGateResult {
  // 1. Master kill-switch. OFF → byte-identical to pre-gate behaviour.
  if (!isLoopClosureGateEnabled()) {
    return { ok: true, enforced: false }
  }

  // 2. Analyse the chain.
  const provenance =
    typeof rawBody === 'object' && rawBody !== null
      ? (rawBody as Record<string, unknown>).provenance
      : undefined
  const signedAssessments =
    typeof provenance === 'object' && provenance !== null
      ? (provenance as Record<string, unknown>).signed_assessments
      : undefined
  const analysis = analyseLoopClosure(signedAssessments)

  // 3. Reject escalation — refuse an unclosed chain. Indeterminate counts as
  //    unclosed: closure that cannot be verified is not closure.
  if (isLoopClosureRejectEnabled() && analysis.verdict === 'unclosed') {
    return {
      ok: false,
      status: 'loop_unclosed',
      analysis,
      message:
        'The assessment chain contains redirections without same-depth ' +
        're-examinations. A correction is a new impression owed a new ' +
        'examination: re-submit the corrected reasoning at the original ' +
        "examination's depth (prior_feedback), then write the credential.",
    }
  }

  // 4. Flag mode (or reject mode with a closed / no-redirection chain): the
  //    write proceeds; the analysis is annotated + logged by the route.
  return { ok: true, enforced: true, analysis }
}
