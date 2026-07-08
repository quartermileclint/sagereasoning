/**
 * intervention-engine.ts — Trust Layer S4: the intervention policy engine
 * (mentor spec 7 + A8), as pure deterministic functions. MEASURE mode.
 *
 * BINDING SPECS (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §3 row 7 + the intervention decision table + the three spec-7 constraints
 * + §5 A8). Where this file and the ADR diverge, the VERBATIM RECORD WINS.
 *
 * ─── MEASURE, NOT ENFORCE ────────────────────────────────────────────────────
 * v1 is MEASURE: every recommendation is computed + logged + surfaced,
 * log-and-continue only. NOTHING here binds an action. The guard-deny for the
 * already-proven irreversible-action class lives in the reference harness (ADR-011
 * channel law) and is untouched by this module. BINDING ENFORCEMENT IS S11 — its
 * own founder-walked Critical logos-gate activation (ADR-012 gate; the S0a
 * corroboration check cleared both directions, but nothing here or in the plan's
 * approval pre-approves the flip). Every recommendation carries `mode: 'measure'`,
 * `enforced: false`, and `humanOverridable: true`. This module has NO I/O, NO env
 * read, NO clock, NO guard-deny call — it returns data exactly as S1/S2/S3 do.
 *
 * ─── The decision table (mentor spec 7, binding — verbatim) ─────────────────
 *   Sage-like / Principled                         → proceed + log
 *   Deliberate, no justice surface                 → log + continue
 *   Deliberate + justice surface evaluated-met     → proceed + log
 *   Deliberate + justice surface indeterminate     → pause + examine at standard depth
 *   Deliberate + justice surface unevaluated       → do not proceed + escalate
 *   Habitual                                       → pause + examine at standard depth
 *   Reflexive                                      → do not proceed + escalate
 *   ANY violated obligation                        → do not proceed + escalate
 *   Conflict between sources                       → pause + escalate, NEVER average
 * The justice-surface modifier is ASYMMETRIC — it can ONLY lower the threshold
 * (raise conservativeness), never raise it (ADR §3 row 7). Realised structurally:
 * the recommendation is the MOST CONSERVATIVE of a candidate set the proximity +
 * justice-surface + conflict each contribute to. Adding a candidate can only hold
 * or raise the winning action's conservativeness (a 100-weighted action rank
 * dominates the ≤22 tie-break), so a justice surface can NEVER make the outcome
 * less conservative than the proximity baseline — asymmetry is a provable property,
 * asserted across the full proximity × justice grid by the battery.
 *
 * DISCLOSED DESIGN DECISION (faithful + safe). The mentor's met/indeterminate/
 * unevaluated obligation modifier is written under the `Deliberate` proximity row.
 * We apply it uniformly via the conservative join. At `deliberate` this reproduces
 * the mentor's table EXACTLY (asserted). At other proximities it can only ADD
 * conservativeness relative to the proximity baseline (never subtract) — honoring
 * the asymmetry meta-rule at every proximity, and consistent with the live §4
 * engine, whose justice flooring makes the `>deliberate + open-justice` inputs
 * non-arising in practice (an unevaluated/indeterminate justice surface caps the
 * verdict at ≤deliberate; a violation floors it to reflexive). The two unconditional
 * overrides (`violated`, `conflict`) apply at every proximity by the table's own
 * wording. Notably `habitual + unevaluated` — a REACHABLE input (the deliberate cap
 * floors AT deliberate, so a habitual base proximity survives) — recommends
 * do-not-proceed + escalate rather than the bare-habitual pause + examine: an
 * unevaluated justice surface is the most serious signal (spec 3) and warrants a
 * human, not merely a re-examination. This is strictly MORE conservative than the
 * bare-habitual row and never contradicts an enumerated row; the notable
 * non-enumerated cells are PINNED by the battery so the behaviour is intentional and
 * locked. (Scoping the modifier literally to `deliberate` would be a one-line change;
 * the uniform conservative join is chosen because it is safe everywhere and makes the
 * asymmetry structural.) MEASURE mode: every recommendation is advisory regardless.
 *
 * ─── The three spec-7 constraints outside the table (ADR §3) ─────────────────
 *  1. A pause-and-examine re-runs at the SAME depth as the original assessment —
 *     "standard depth" is the FLOOR, never quick; if the original was deep,
 *     same-depth means deep (the depth-reduction risk; the live CI-4 same-depth
 *     rule). Reuses the CI-4 depth vocabulary (`LoopDepthTier`).
 *  2. An escalation carries the FULL reasoning trace + domain breakdown +
 *     justice-surface record, not just the verdict (`buildEscalationPayload` +
 *     `escalationPayloadComplete`).
 *  3. A consistent `deliberate` proximity across sessions in one domain raises a
 *     DEVELOPMENTAL flag — tracked, not intervened (`evaluateDevelopmentalFlags`).
 *
 * ─── A8 — habitual-pause termination (mentor A8, binding) ────────────────────
 * "Two re-examinations at standard depth. If both return habitual, the third pass
 *  escalates rather than re-examines." A stable disposition is the INPUT, not the
 * output, of examination — the examination cannot remediate it; Sage Reflect is the
 * remediation. On termination the action is HELD (not do-not-proceed — habitual is
 * not reflexive), the collaboration record takes a habitual-stable flag feeding the
 * next Reflect, and the orchestrator decides (proceed under acknowledgement / select
 * differently / hold). "The orchestrator's decision is itself trust-relevant" — a
 * proceed-under-flag emits the S1 `orchestrator-proceeds-under-habitual-flag` event
 * on the oversight domain (`recordOrchestratorHabitualDecision`).
 *
 * ─── R20c — human-override supremacy (manifest R20 §c, a required contract term) ─
 * "No level of agent accreditation may make it harder for a human to override,
 *  correct, or disagree with an agent's reasoning … A human's right to say 'no' is
 *  absolute, regardless of the agent's accreditation level." Encoded now so it binds
 * at S11: every recommendation is `humanOverridable: true`, and `applyHumanOverride`
 * makes a human decision SUPERSEDE the engine's recommendation unconditionally.
 *
 * Pure — no I/O, no env, no clock.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { LoopDepthTier } from '@/lib/translation-sandwich/reason-loop-closure'
import type { ArtifactKind, TrustEvent, VirtueTrustDomain } from './types'
import type { CombinedObligationVerdict, WeightedAggregateTrust } from './combiner'

// ════════════════════════════════════════════════════════════════════════════
// DERIVED CONSTANTS (documented, tunable — the mentor fixes ORDERINGS + the A8
// bound; magnitudes not otherwise fixed are DERIVED, consistent with S1/S2/S3).
// ════════════════════════════════════════════════════════════════════════════

/**
 * A8 bound: the number of standard-depth re-examinations that must ALREADY have
 * returned habitual before the next pass escalates to Reflect instead of
 * re-examining. Mentor-FIXED at 2 ("two re-examinations … the third pass
 * escalates"). Not a tuning knob — the verbatim bound.
 */
export const HABITUAL_REEXAMINATION_BOUND = 2

/**
 * Spec-7 constraint 3: how many consecutive `deliberate` sessions in one domain
 * constitute "consistent" for the developmental flag. DERIVED (the mentor fixes
 * "consistent", not the count); 3 is a documented default, tunable pending S9. The
 * flag is TRACKED, NOT INTERVENED — this threshold never changes a recommendation.
 */
export const DEVELOPMENTAL_CONSISTENCY_THRESHOLD = 3

/**
 * R20c contract term (manifest R20 §c) — stated verbatim so the contract carries
 * it into S11 ENFORCE.
 */
export const R20C_HUMAN_OVERRIDE_SUPREMACY =
  'Human override supremacy (manifest R20 §c): no level of agent accreditation may ' +
  'make it harder for a human to override, correct, or disagree with an agent’s ' +
  'reasoning. A human’s right to say "no" is absolute, regardless of the ' +
  'agent’s accreditation level. A human decision supersedes the engine’s ' +
  'recommendation unconditionally, at MEASURE and at ENFORCE.'

// ════════════════════════════════════════════════════════════════════════════
// SECTION A — the decision table + asymmetric justice modifier + conflict
// ════════════════════════════════════════════════════════════════════════════

/** The action gate the table produces. */
export type InterventionAction = 'proceed' | 'pause' | 'do-not-proceed'

/** The follow-up the table pairs with the action gate. */
export type InterventionFollowUp = 'log' | 'examine' | 'escalate'

/** The justice-surface obligation-evaluation state for this decision (from the §4
 *  engine's per-circle obligation_assessment / the S3 A1 obligation routing). */
export type JusticeSurfaceState =
  | 'none' // no non-consenting party in scope — the justice branch is skipped
  | 'met'
  | 'indeterminate'
  | 'unevaluated'
  | 'violated'

/** The mentor decision-table row (or A8/override) that produced a recommendation. */
export type InterventionTableRow =
  | 'sage-like-or-principled-proceed'
  | 'deliberate-no-justice-log-continue'
  | 'justice-met-proceed'
  | 'justice-indeterminate-pause'
  | 'justice-unevaluated-do-not-proceed'
  | 'habitual-pause'
  | 'reflexive-do-not-proceed'
  | 'violated-obligation-do-not-proceed'
  | 'source-conflict-pause-escalate'
  | 'habitual-stable-escalate-to-reflect'
  | 'insufficient-evidence-pause-escalate'
  | 'human-override'

/** v1 mode marker — always 'measure' this session (ENFORCE is S11). */
export type InterventionMode = 'measure'

/** The engine input for one decision. */
export interface InterventionInput {
  /**
   * The action's / aggregate's katorthoma proximity. `null` ⇔ no evaluated
   * evidence (a profile-prior-only aggregate with `level: null`) — the engine
   * recommends pause + escalate (insufficient evidence to proceed), never a silent
   * proceed.
   */
  proximity: KatorthomaProximity | null
  /** The justice-surface obligation-evaluation state (default 'none'). */
  justiceSurface?: JusticeSurfaceState
  /** True ⇔ the combiner reported a source conflict (S3 `resolution:'pause-escalate'`
   *  / `anyConflict`). Overrides to pause + escalate (never average). */
  sourceConflict?: boolean
  /** The original examination's depth — the same-depth pause re-runs here (never
   *  below standard). Default 'standard'. */
  originalDepth?: LoopDepthTier
  /**
   * A8: how many standard-depth re-examinations for THIS action have ALREADY
   * returned habitual. 0 = the initial assessment. At >= HABITUAL_REEXAMINATION_BOUND
   * a habitual pause terminates into a Reflect referral instead of re-examining.
   * Default 0.
   */
  habitualReExaminationCount?: number
}

export interface InterventionRecommendation {
  action: InterventionAction
  followUp: InterventionFollowUp
  /** A human-readable disposition (the mentor's own phrasing). */
  disposition: string
  /** The deciding table row (auditable). */
  tableRow: InterventionTableRow
  /** pause + examine: the depth to re-run at (same-depth rule; never below standard).
   *  Omitted when the recommendation is not a re-examination. */
  reExamineDepth?: LoopDepthTier
  /** A8: this pause was terminated into a Sage Reflect referral (a stable habitual
   *  disposition — examination cannot remediate it). */
  habitualStable: boolean
  /** A8: a Sage Reflect referral is owed (⇔ habitualStable). */
  reflectReferral: boolean
  /** True ⇔ a habitual proximity was among the input candidates (regardless of the
   *  winning action — so it is true even when a violation/conflict overrode the habitual
   *  pause). A NECESSARY-not-sufficient precondition for the A8 bound, which
   *  additionally requires the habitual pause to have WON (`tableRow === 'habitual-pause'`). */
  habitualDriven: boolean
  /** True ⇔ this recommendation escalates (followUp 'escalate' OR action
   *  'do-not-proceed') and therefore owes an escalation payload (spec-7 constraint 2). */
  escalates: boolean
  /** The inputs echoed (transparency / claims-vs-code). */
  proximity: KatorthomaProximity | null
  justiceSurface: JusticeSurfaceState
  sourceConflict: boolean
  /** Every rule that fired (not just the winner). */
  reasons: string[]
  basis: string
  /** MEASURE invariant: always 'measure' this session — the recommendation is advisory. */
  mode: InterventionMode
  /** MEASURE invariant: always false — nothing binds until S11 ENFORCE. */
  enforced: false
  /** R20c: always true — a human decision supersedes this recommendation. */
  humanOverridable: true
  /** Set only by applyHumanOverride — 'human' when a human decision superseded. */
  overriddenBy?: 'human'
}

/** Action-gate conservativeness rank (proceed < pause < do-not-proceed). */
const ACTION_RANK: Record<InterventionAction, number> = {
  proceed: 0,
  pause: 1,
  'do-not-proceed': 2,
}
/** Follow-up conservativeness rank (log < examine < escalate). */
const FOLLOWUP_RANK: Record<InterventionFollowUp, number> = {
  log: 0,
  examine: 1,
  escalate: 2,
}

/**
 * One candidate disposition contributed by proximity / justice / conflict. The
 * winner is the MOST CONSERVATIVE candidate; ties break on follow-up then source
 * priority (so the justice/conflict record wins the label over the bare proximity
 * baseline when the action + follow-up are equal). `sourcePriority`: justice=2,
 * conflict=1, baseline=0.
 */
interface Candidate {
  action: InterventionAction
  followUp: InterventionFollowUp
  row: InterventionTableRow
  reason: string
  sourcePriority: 0 | 1 | 2
  habitualDriven?: boolean
}

/**
 * The lexicographic selection key. action rank dominates (×100) so a
 * higher-conservativeness action ALWAYS outranks a lower one regardless of the
 * ≤22 tie-break — the structural guarantee that makes the asymmetric modifier
 * provable: the winner's action rank = the MAX action rank across candidates, so
 * adding a candidate can only hold-or-raise conservativeness.
 */
function candidateKey(c: Candidate): number {
  return ACTION_RANK[c.action] * 100 + FOLLOWUP_RANK[c.followUp] * 10 + c.sourcePriority
}

/** The proximity-only baseline candidate (no justice, no conflict). */
function proximityBaseline(proximity: KatorthomaProximity): Candidate {
  switch (proximity) {
    case 'sage_like':
    case 'principled':
      return {
        action: 'proceed',
        followUp: 'log',
        row: 'sage-like-or-principled-proceed',
        reason: `${proximity} proximity → proceed + log (spec 7)`,
        sourcePriority: 0,
      }
    case 'deliberate':
      return {
        action: 'proceed',
        followUp: 'log',
        row: 'deliberate-no-justice-log-continue',
        reason: 'deliberate proximity, no justice surface → log + continue (spec 7)',
        sourcePriority: 0,
      }
    case 'habitual':
      return {
        action: 'pause',
        followUp: 'examine',
        row: 'habitual-pause',
        reason: 'habitual proximity → pause + examine at same depth (spec 7)',
        sourcePriority: 0,
        habitualDriven: true,
      }
    case 'reflexive':
      return {
        action: 'do-not-proceed',
        followUp: 'escalate',
        row: 'reflexive-do-not-proceed',
        reason: 'reflexive proximity → do not proceed + escalate (spec 7)',
        sourcePriority: 0,
      }
  }
}

/** The justice-surface modifier candidate, or null when there is no justice
 *  surface or the surface is 'met' at a proximity where it cannot inform the label. */
function justiceCandidate(justice: JusticeSurfaceState): Candidate | null {
  switch (justice) {
    case 'none':
      return null
    case 'met':
      // Neutral: proceed + log. Never raises conservativeness above the baseline
      // (the asymmetry — "met" cannot make the outcome less OR more conservative
      // than a bare proceed); it only carries the justice-met RECORD when the
      // proximity baseline is also proceed.
      return {
        action: 'proceed',
        followUp: 'log',
        row: 'justice-met-proceed',
        reason: 'justice surface evaluated-met → proceed + log (spec 7)',
        sourcePriority: 2,
      }
    case 'indeterminate':
      return {
        action: 'pause',
        followUp: 'examine',
        row: 'justice-indeterminate-pause',
        reason: 'justice surface indeterminate → pause + examine at same depth (spec 7)',
        sourcePriority: 2,
      }
    case 'unevaluated':
      return {
        action: 'do-not-proceed',
        followUp: 'escalate',
        row: 'justice-unevaluated-do-not-proceed',
        reason: 'justice surface unevaluated → do not proceed + escalate (spec 7)',
        sourcePriority: 2,
      }
    case 'violated':
      return {
        action: 'do-not-proceed',
        followUp: 'escalate',
        row: 'violated-obligation-do-not-proceed',
        reason: 'ANY violated obligation → do not proceed + escalate (spec 7, unconditional)',
        sourcePriority: 2,
      }
  }
}

/** Same-depth pause rule (spec-7 constraint 1): re-run at the original depth, with
 *  `standard` as the floor (never quick). quick→standard, standard→standard,
 *  deep→deep. */
export function sameDepthOrStandard(original: LoopDepthTier): LoopDepthTier {
  const DEPTH_RANK: Record<LoopDepthTier, number> = { quick: 1, standard: 2, deep: 3 }
  return DEPTH_RANK[original] >= DEPTH_RANK.standard ? original : 'standard'
}

const DISPOSITION: Record<InterventionTableRow, string> = {
  'sage-like-or-principled-proceed': 'proceed + log',
  'deliberate-no-justice-log-continue': 'log + continue',
  'justice-met-proceed': 'proceed + log (justice surface evaluated-met)',
  'justice-indeterminate-pause': 'pause + examine at same depth',
  'justice-unevaluated-do-not-proceed': 'do not proceed + escalate',
  'habitual-pause': 'pause + examine at same depth',
  'reflexive-do-not-proceed': 'do not proceed + escalate',
  'violated-obligation-do-not-proceed': 'do not proceed + escalate',
  'source-conflict-pause-escalate': 'pause + escalate (source conflict — never average)',
  'habitual-stable-escalate-to-reflect': 'held — escalate to Sage Reflect (habitual-stable)',
  'insufficient-evidence-pause-escalate': 'pause + escalate (insufficient evidence)',
  'human-override': 'human override (supersedes the engine — R20c)',
}

/**
 * Recommend an intervention for one decision (mentor spec 7 + the three constraints
 * + A8). Pure. MEASURE mode — the recommendation is advisory (`mode:'measure'`,
 * `enforced:false`, `humanOverridable:true`); nothing binds.
 */
export function recommendIntervention(
  input: InterventionInput,
): InterventionRecommendation {
  const justiceSurface = input.justiceSurface ?? 'none'
  const sourceConflict = input.sourceConflict === true
  const originalDepth = input.originalDepth ?? 'standard'
  const habitualCount = Math.max(0, Math.floor(input.habitualReExaminationCount ?? 0))

  // Insufficient evidence (no evaluated domains): pause + escalate, never a silent
  // proceed. The two unconditional overrides still apply on top (a violation or a
  // conflict cannot be less conservative than this).
  const candidates: Candidate[] = []
  if (input.proximity === null) {
    candidates.push({
      action: 'pause',
      followUp: 'escalate',
      row: 'insufficient-evidence-pause-escalate',
      reason: 'no evaluated evidence (aggregate level null) → pause + escalate, never a silent proceed',
      sourcePriority: 0,
    })
  } else {
    candidates.push(proximityBaseline(input.proximity))
  }

  const jc = justiceCandidate(justiceSurface)
  if (jc) candidates.push(jc)

  if (sourceConflict) {
    candidates.push({
      action: 'pause',
      followUp: 'escalate',
      row: 'source-conflict-pause-escalate',
      reason: 'conflict between sources → pause + escalate, NEVER average (spec 7)',
      sourcePriority: 1,
    })
  }

  // Select the most conservative candidate (lexicographic key). Deterministic.
  let winner = candidates[0]
  let winnerKey = candidateKey(winner)
  for (const c of candidates) {
    const k = candidateKey(c)
    if (k > winnerKey) {
      winner = c
      winnerKey = k
    }
  }

  const reasons = candidates.map((c) => c.reason)
  const habitualDriven = candidates.some((c) => c.habitualDriven === true)

  let rec: InterventionRecommendation = {
    action: winner.action,
    followUp: winner.followUp,
    disposition: DISPOSITION[winner.row],
    tableRow: winner.row,
    ...(winner.followUp === 'examine' && { reExamineDepth: sameDepthOrStandard(originalDepth) }),
    habitualStable: false,
    reflectReferral: false,
    habitualDriven,
    escalates: winner.action === 'do-not-proceed' || winner.followUp === 'escalate',
    proximity: input.proximity,
    justiceSurface,
    sourceConflict,
    reasons,
    basis: `${winner.reason}; selected as the most conservative of ${candidates.length} candidate(s) (spec 7 asymmetric-modifier join)`,
    mode: 'measure',
    enforced: false,
    humanOverridable: true,
  }

  // A8 — habitual-pause termination. Applies ONLY when a habitual-proximity
  // pause+examine actually WON (row 'habitual-pause' — not overridden by a conflict
  // or a justice modifier). After two standard-depth re-examinations that returned
  // habitual, the third pass escalates to Sage Reflect instead of re-examining.
  rec = applyHabitualPauseBound(rec, habitualCount)

  return rec
}

/**
 * A8 bound. Transform a WON habitual pause+examine (row 'habitual-pause') into a
 * held Sage-Reflect referral once `habitualReExaminationCount >=
 * HABITUAL_REEXAMINATION_BOUND`. Pure; a no-op for any other recommendation.
 * Exported for direct testing.
 */
export function applyHabitualPauseBound(
  rec: InterventionRecommendation,
  habitualReExaminationCount: number,
): InterventionRecommendation {
  const count = Math.max(0, Math.floor(habitualReExaminationCount))
  if (rec.tableRow !== 'habitual-pause' || count < HABITUAL_REEXAMINATION_BOUND) {
    return rec
  }
  // The action is HELD (still pause — habitual is not reflexive); the follow-up
  // becomes escalate (to the orchestrator + a Reflect referral); no re-examination.
  const { reExamineDepth: _drop, ...rest } = rec
  return {
    ...rest,
    action: 'pause',
    followUp: 'escalate',
    disposition: DISPOSITION['habitual-stable-escalate-to-reflect'],
    tableRow: 'habitual-stable-escalate-to-reflect',
    habitualStable: true,
    reflectReferral: true,
    escalates: true,
    basis:
      `A8 habitual-pause termination: ${count} standard-depth re-examination(s) returned habitual ` +
      `(bound ${HABITUAL_REEXAMINATION_BOUND}) — a stable disposition is the input, not the output, of ` +
      `examination; hold the action + escalate to Sage Reflect (remediation), do not re-examine`,
    reasons: [
      ...rec.reasons,
      'A8: habitual-stable — third pass escalates to Sage Reflect instead of re-examining',
    ],
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION B — R20c human-override supremacy (a required contract term)
// ════════════════════════════════════════════════════════════════════════════

/** A human's decision on a recommendation (manifest R20 §c — absolute). */
export type HumanDecision = InterventionAction

/**
 * Apply a human override. R20c: the human decision SUPERSEDES the engine's
 * recommendation unconditionally — no accreditation level resists it. When
 * `humanDecision` is undefined the recommendation is returned unchanged (no override
 * offered). Pure. Stated now so it binds at S11 ENFORCE.
 */
export function applyHumanOverride(
  rec: InterventionRecommendation,
  humanDecision?: HumanDecision,
): InterventionRecommendation {
  if (humanDecision === undefined) return rec
  const { reExamineDepth: _drop, ...rest } = rec
  return {
    ...rest,
    action: humanDecision,
    followUp: humanDecision === 'proceed' ? 'log' : 'escalate',
    disposition: `${DISPOSITION['human-override']} → ${humanDecision}`,
    tableRow: 'human-override',
    escalates: humanDecision !== 'proceed',
    overriddenBy: 'human',
    reasons: [...rec.reasons, R20C_HUMAN_OVERRIDE_SUPREMACY],
    basis: `human override (R20c) → ${humanDecision}; supersedes the engine recommendation unconditionally`,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION C — the escalation payload contract (spec-7 constraint 2)
// ════════════════════════════════════════════════════════════════════════════

/** The full reasoning trace an escalation must carry (a handle to the signed
 *  assessment + its causal-sequence summary — NOT just the verdict). */
export interface EscalationTrace {
  /** The signed Layer-2 assessment ref (Ed25519-verifiable — the reproducible trace). */
  assessmentRef: string
  /** The signing key id (surfaced for verification). */
  signatureKeyId?: string | null
  /** A short human summary of the causal sequence (impression → assent → proximity). */
  causalSummary?: string
}

/** One domain's line in the escalation's domain breakdown. */
export interface EscalationDomainLine {
  domain: VirtueTrustDomain
  level: KatorthomaProximity
  /** The A5 confidence tier of the domain's contributing verdict (optional). */
  confidenceTier?: number
  justiceCapped?: boolean
  conflict?: boolean
}

/** The justice-surface record (mandatory when a justice surface is present). */
export interface EscalationJusticeRecord {
  surface: JusticeSurfaceState
  /** Per-circle obligation assessments, when available (the §4 engine's record). */
  perCircle?: { circle: string; status: 'met' | 'violated' | 'indeterminate' | 'unevaluated'; justification?: string }[]
  /** The S3 A1 obligation resolution (deterministic-authoritative / pause-escalate). */
  obligationResolution?: 'deterministic-authoritative' | 'pause-escalate'
}

export interface EscalationPayload {
  schema: 'trust-escalation-payload-v1'
  recommendation: InterventionRecommendation
  reasoningTrace: EscalationTrace
  domainBreakdown: EscalationDomainLine[]
  /** null ⇔ no justice surface (the record is only mandatory when one is present). */
  justiceRecord: EscalationJusticeRecord | null
  basis: string
}

/**
 * Build an escalation payload (spec-7 constraint 2). Pure structuring — the caller
 * supplies the trace, the per-domain breakdown, and the justice record. Completeness
 * is checked by `escalationPayloadComplete`; this builder does not fabricate any of
 * the three.
 */
export function buildEscalationPayload(args: {
  recommendation: InterventionRecommendation
  reasoningTrace: EscalationTrace
  domainBreakdown: EscalationDomainLine[]
  justiceRecord?: EscalationJusticeRecord | null
}): EscalationPayload {
  const justiceRecord =
    args.justiceRecord ??
    (args.recommendation.justiceSurface !== 'none'
      ? { surface: args.recommendation.justiceSurface }
      : null)
  return {
    schema: 'trust-escalation-payload-v1',
    recommendation: args.recommendation,
    reasoningTrace: args.reasoningTrace,
    domainBreakdown: args.domainBreakdown,
    justiceRecord,
    basis:
      'escalation carries the full reasoning trace + per-domain breakdown + justice-surface ' +
      'record, not just the verdict (spec-7 constraint 2)',
  }
}

export interface EscalationCompleteness {
  complete: boolean
  missing: string[]
}

/**
 * Validate that an escalation payload meets the spec-7 completeness bar: a
 * verifiable trace ref, a non-empty domain breakdown, and — WHEN a justice surface
 * is present — a justice record. Pure. A payload that lacks any required part is
 * flagged (never silently accepted as "just the verdict").
 */
export function escalationPayloadComplete(p: EscalationPayload): EscalationCompleteness {
  const missing: string[] = []
  if (!p.reasoningTrace || typeof p.reasoningTrace.assessmentRef !== 'string' || p.reasoningTrace.assessmentRef.trim() === '') {
    missing.push('reasoningTrace.assessmentRef (the signed, verifiable trace handle)')
  }
  if (!Array.isArray(p.domainBreakdown) || p.domainBreakdown.length === 0) {
    missing.push('domainBreakdown (the per-domain trust breakdown)')
  }
  if (p.recommendation.justiceSurface !== 'none' && p.justiceRecord === null) {
    missing.push('justiceRecord (mandatory when a justice surface is present)')
  }
  return { complete: missing.length === 0, missing }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION D — A8 tail: the orchestrator's decision is itself trust-relevant
// ════════════════════════════════════════════════════════════════════════════

/** The orchestrator's decision on a held habitual-stable action (mentor A8). */
export type OrchestratorHabitualDecision = 'proceed' | 'select-different' | 'hold'

/**
 * Record the orchestrator's decision on a held habitual-stable action as an S1
 * trust event (mentor A8 tail). Only a PROCEED-under-flag produces a trust event —
 * the S1 `orchestrator-proceeds-under-habitual-flag` event on the OVERSIGHT domain
 * (the transition maps it to a `decrease`). `select-different` and `hold` produce
 * NO event (honoring the developmental pathway). Returns null when no event is owed.
 *
 * R18f-parallel: the event is backed by the escalated verdict's signed assessment
 * (`escalatedAssessmentRef`, artifactKind 'signed_layer2_assessment') — no event
 * without a verifiable artifact. Pure — this produces the event DESCRIPTOR that a
 * wiring layer emits (MEASURE); the actual DB write is the wiring successor.
 *
 * DISCLOSED: the mentor's "consistently proceeding … without developmental
 * follow-through" is the LONGITUDINAL pattern — S4 emits one event per proceed-under-
 * flag; S1's fold (hysteresis) + the follow-through signal weight the pattern. A
 * single acknowledged proceed steps oversight down one rank; the "without follow-
 * through" refinement is an S1/S9 weighting input, not fabricated here.
 */
export function recordOrchestratorHabitualDecision(args: {
  decision: OrchestratorHabitualDecision
  /** The signed assessment ref of the escalated habitual verdict (R18f-parallel). */
  escalatedAssessmentRef: string
  occurredAt: string
  agentId: string
  /** The virtue domain the habitual-stable finding was in (recorded on the payload). */
  habitualDomain?: VirtueTrustDomain
  correlationId?: string | null
  ownerUserId?: string | null
  credentialRef?: string | null
}): TrustEvent | null {
  if (args.decision !== 'proceed') return null
  if (typeof args.escalatedAssessmentRef !== 'string' || args.escalatedAssessmentRef.trim() === '') {
    // R18f-parallel: no verifiable artifact ⇒ no event (fail honest, never fabricate).
    return null
  }
  const artifactKind: ArtifactKind = 'signed_layer2_assessment'
  return {
    agentId: args.agentId,
    virtueDomain: 'oversight',
    eventType: 'orchestrator-proceeds-under-habitual-flag',
    artifactKind,
    artifactRef: args.escalatedAssessmentRef,
    payload: {
      orchestratorDecision: 'proceed',
      habitualDomain: args.habitualDomain ?? null,
      note:
        'orchestrator proceeded under a habitual-stable flag — trust-relevant in the oversight ' +
        'domain (mentor A8); the pattern weight (follow-through) is refined by the S1 fold',
    },
    occurredAt: args.occurredAt,
    correlationId: args.correlationId ?? null,
    ownerUserId: args.ownerUserId ?? null,
    credentialRef: args.credentialRef ?? null,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION E — the developmental flag (spec-7 constraint 3): tracked, NOT intervened
// ════════════════════════════════════════════════════════════════════════════

/** One (session, domain) observation for the developmental-flag scan. */
export interface SessionDomainObservation {
  sessionId: string
  domain: VirtueTrustDomain
  level: KatorthomaProximity
  /** ISO occurrence timestamp — orders sessions within a domain. */
  occurredAt: string
}

export interface DevelopmentalFlag {
  domain: VirtueTrustDomain
  /** The length of the most-recent consecutive run of `deliberate` sessions. */
  consecutiveDeliberateSessions: number
  note: string
}

/**
 * Spec-7 constraint 3: a CONSISTENT `deliberate` proximity across sessions in one
 * domain raises a DEVELOPMENTAL flag — a Sage Reflect developmental priority, TRACKED
 * NOT INTERVENED (it never changes a recommendation). A domain flags iff its
 * most-recent consecutive run of `deliberate` sessions is >=
 * DEVELOPMENTAL_CONSISTENCY_THRESHOLD. Pure — `occurredAt` orders within a domain;
 * no clock read.
 */
export function evaluateDevelopmentalFlags(
  observations: SessionDomainObservation[],
): DevelopmentalFlag[] {
  const byDomain = new Map<VirtueTrustDomain, SessionDomainObservation[]>()
  for (const o of observations) {
    const arr = byDomain.get(o.domain)
    if (arr) arr.push(o)
    else byDomain.set(o.domain, [o])
  }
  const flags: DevelopmentalFlag[] = []
  for (const [domain, obs] of byDomain) {
    const ordered = [...obs].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt))
    // The most-recent consecutive run of 'deliberate' (walk from the newest back).
    let run = 0
    for (let i = ordered.length - 1; i >= 0; i--) {
      if (ordered[i].level === 'deliberate') run++
      else break
    }
    if (run >= DEVELOPMENTAL_CONSISTENCY_THRESHOLD) {
      flags.push({
        domain,
        consecutiveDeliberateSessions: run,
        note:
          `consistent 'deliberate' across ${run} recent session(s) in ${domain} — a developmental ` +
          `priority for the next Sage Reflect (tracked, not intervened; spec-7 constraint 3)`,
      })
    }
  }
  flags.sort((a, b) => a.domain.localeCompare(b.domain))
  return flags
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION F — the S3 → S4 consumption seam
// ════════════════════════════════════════════════════════════════════════════

/**
 * Map S3 combiner outputs to an intervention input (the consumption seam — S4
 * consumes S3, never re-derives). Pure.
 *   - proximity          ← the weighted aggregate LEVEL (null ⇒ insufficient evidence);
 *   - sourceConflict      ← the aggregate `anyConflict` OR the obligation `conflict`;
 *   - justiceSurface      ← the S3 obligation routing verdict when a justice surface
 *                           is present (met/violated/indeterminate/unevaluated); on a
 *                           routing CONFLICT (verdict null) the deterministic source
 *                           read is recorded as the justiceSurface. Because the justice
 *                           modifier rides the conservative join, a recorded 'unevaluated'
 *                           /'violated' deterministic read can itself set an equal-or-MORE-
 *                           conservative gate (do-not-proceed), so a conflict may resolve
 *                           to do-not-proceed rather than the conflict's own pause+escalate
 *                           — the safe direction (an end-to-end battery case pins this).
 */
export function interventionInputFromS3(args: {
  aggregate: WeightedAggregateTrust
  obligation?: CombinedObligationVerdict | null
  taskHasJusticeSurface: boolean
  originalDepth?: LoopDepthTier
  habitualReExaminationCount?: number
}): InterventionInput {
  const obligation = args.obligation ?? null
  const sourceConflict = args.aggregate.anyConflict || (obligation?.conflict === true)

  let justiceSurface: JusticeSurfaceState = 'none'
  if (args.taskHasJusticeSurface) {
    // Prefer the combined obligation verdict; on a conflict (verdict null) fall back
    // to the deterministic source read so the record still names the surface (the
    // separate sourceConflict flag drives the pause + escalate). Absent obligation
    // routing ⇒ 'unevaluated' (a justice surface owed but not evaluated).
    justiceSurface = obligation?.verdict ?? obligation?.sources.deterministic ?? 'unevaluated'
  }

  return {
    proximity: args.aggregate.level,
    justiceSurface,
    sourceConflict,
    originalDepth: args.originalDepth,
    habitualReExaminationCount: args.habitualReExaminationCount,
  }
}
