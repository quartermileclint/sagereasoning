/**
 * score-architecture.ts — the substrate score-computation module.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-15, this session). New code,
 * imported by no route — no production exposure this session. Builds without
 * any env flag (a pure in-process function; nothing to gate).
 *
 * GOVERNING DOCUMENTS:
 *   - /archive/2026-05-14_agent-mode-response-spec-superseded.md — the score
 *     architecture is specified there in full (§"Kathekon as gate, not
 *     component", §"Component score (kathekon-confirmed path; baseline 55)",
 *     §"Out of the score; in the response shape", §"Score-validity flag
 *     rules"). The superseded agent-mode spec is the substantive
 *     deliverable-of-the-day; its content is absorbed into the Sage Assent Wrapper spec
 *     §"Component 2".
 *   - /adopted/substrate-modes/sage-assent-wrapper-spec.md §"Component 2"
 *     — the Layer 3 agent-mode rendering that consumes this score (built in a
 *     later session; not built here).
 *   - /adopted/substrate-modes/philosophical-mode-response-spec.md §"Score
 *     handling for human consumers" + /adopted/substrate-modes/
 *     standard-mode-response-spec.md §"Score handling" — confirm the score
 *     architecture is SHARED across the philosophical / standard / agent modes.
 *   - /operations/decision-log.md — D-ATL-SCORE-ARCHITECTURE-WIRED-VERIFIED-
 *     2026-05-15 (this build; the Step 2 design-decision gate is recorded
 *     there, including the score-formula values the superseded spec left to
 *     "build session computes").
 *   - /manifest.md §R4 (IP boundary) / §R6 (6b unity-of-virtue, 6c qualitative
 *     levels) / §AC8 (translation-sandwich substrate).
 *
 * WHAT THIS MODULE IS
 *
 * A pure, synchronous, deterministic projection from a Layer2Assessment (+ a
 * ScoreContext carrying the two inputs the substrate does not itself emit) to a
 * single SubstrateScore: the kathekon gate outcome, the seven score components,
 * the scalar 0-100 value, the validity flag, the cap rules, the precision band,
 * and the confidence field. Same (assessment, context) in → byte-identical
 * SubstrateScore out. No clock read, no randomness, no I/O, no LLM call.
 *
 * It is the PR1 single-endpoint proof of the SCORE pattern — the same session
 * shape as sage-assent-bridge.ts (the bridge pattern) and philosophical-mode-service.ts
 * (the Layer 3 mode-dispatch pattern). It is the load-bearing dependency for
 * three downstream consumers, all currently blocked on it: the Layer 3
 * agent-mode rendering (Sage Assent Wrapper Component 2), philosophical mode's deferred
 * score sections (D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14, PR7),
 * and standard mode's score sections. Build the score once; the three modes
 * each project a subset of it.
 *
 * THE ScoreContext (Step 1 survey finding — the honest carry, mirrors
 * sage-assent-bridge.ts's BridgeContext)
 *
 * Two inputs the score needs are NOT on Layer2Assessment and cannot be derived
 * from it:
 *
 *   - justification_source — the kathekon gate's PRIMARY input
 *     (engine_constructed / agent_asserted / absent). Layer2Assessment carries
 *     no such field; philosophical-mode-service.ts hard-codes
 *     `justification_source: null` precisely because this build had not yet
 *     happened. In the full architecture this is engine-constructed upstream;
 *     until then the consumer supplies it. REQUIRED.
 *
 *   - declared_motivation_passion — the pre-classified verdict on the agent's
 *     own motivation declaration ('detected' / 'clean' / absent). The actual
 *     passion-language DETECTION on free text is an upstream agent-mode /
 *     Layer-1-normalisation concern (superseded spec open questions 2-4, not in
 *     this session's scope). This module CONSUMES the pre-classified verdict —
 *     exactly as the kathekon gate consumes justification_source rather than
 *     constructing the justification itself. OPTIONAL: absent means no
 *     motivation declaration was supplied (the -5 undeclared penalty fires).
 *
 * WHY THE FULL (UNFILTERED) Layer2Assessment IS REQUIRED
 *
 * The module reads `iterative_refinement.direction_of_travel` (for the
 * hasty-assent single_snapshot rule + the confidence field) and
 * `iterative_refinement.motivation_classification` (for the convention quality
 * cap + the PROVISIONAL trigger). Those sub-fields sit on the R17e exclusion
 * list (philosophical-mode-service.ts §R17E_EXCLUDED_FIELD_PATHS), so this
 * module's parameter is typed `Layer2Assessment` — the UNFILTERED assessment —
 * NOT the philosophical-mode `R17eFilteredAssessment` (a filtered assessment is
 * a distinct type and the compiler rejects it here). This is the honest
 * contract. R17e is not breached: the module READS trajectory-adjacent fields
 * but EMITS only a per-response SubstrateScore — and the per-response score is
 * "safe under R17e (single-input result, not profile data)" per the founder
 * decision of 2026-05-14 recorded in the philosophical-mode spec. The
 * `confidence` field (derived from direction_of_travel) is computed here for
 * agent mode; the philosophical / standard renderers OMIT it per their specs.
 * Which fields each mode surfaces is a RENDERING concern, decided per-mode in
 * the mode-wiring sessions — not this module's concern. This module computes
 * the complete score; the renderers project subsets.
 *
 * R-RULE ENGAGEMENT
 *
 *   - R4 (IP boundary): this module emits a RESULT — a score, a vector, a
 *     validity flag. It does not expose the engine's internal thresholds or
 *     micro-logic. The weight tables below ARE the scoring formula and are
 *     SageReasoning IP; they live in code, are never returned in a response,
 *     and a SubstrateScore cannot be used to reconstruct them (a consumer sees
 *     the contributions, not the lookup tables that produced them).
 *   - R6b (unity of virtue): the virtue bonus measures the BREADTH of rational
 *     engagement across virtue domains — it does not score virtue quantity or
 *     weight virtues as separable possessions. Engaging a domain contributes a
 *     fixed amount; the unity thesis is preserved (you cannot "have more" of a
 *     virtue here — you can only engage more domains of one indivisible
 *     rational excellence).
 *   - R6c (qualitative levels, not numeric 0-100 inherited from V1): the
 *     numeric score is a TRANSPARENT DETERMINISTIC PROJECTION of V3's own
 *     qualitative Layer 2 output, with every weight philosophically named (see
 *     the constants below). It does not replace the qualitative levels —
 *     `katorthoma_proximity` (reflexive → sage_like) remains the primary
 *     signal; the numeric score is the agent-ranking convenience layer derived
 *     FROM the qualitative fields, justified by V3 data, not inherited from V1.
 *   - AC8: this module sits in /website/src/lib/substrate/ and consumes the
 *     translation-sandwich Layer 2 output.
 *   - PR1: single-endpoint proof — this one function proves the score pattern
 *     before the agent-mode rendering and the mode-wirings roll it out.
 *   - PR2: build-to-wire-verification immediate — the test file
 *     (__tests__/score-architecture.test.ts) invokes computeSubstrateScore in
 *     the same session this module is written.
 *   - PR4: N/A — no LLM call. The score is a deterministic projection.
 *   - PR6: NOT engaged — the score is a deterministic projection of
 *     Layer2Assessment; it does not touch the R20a distress classifier, Zone 2
 *     / Zone 3 logic, or their wrappers.
 *   - PR10: the build follows the Plan → Execute → Verify loop; the Step 2
 *     design-decision gate was the Plan step.
 */

import type {
  Layer2Assessment,
  KathekonQuality,
  KatorthomaProximity,
  VirtueDomain,
  HastyAssentRisk,
  CausalStage,
  AxiaGrade,
} from '@/lib/translation-sandwich/layer2-mechanisms'

// ============================================================================
// SCORE-CONTEXT INPUT TYPES — the inputs not carried on Layer2Assessment
// ============================================================================

/** The kathekon gate's primary input. Not on Layer2Assessment — the substrate
 *  does not yet emit it (philosophical-mode-service.ts hard-codes
 *  `justification_source: null`). The consumer supplies it via ScoreContext. */
export type JustificationSource =
  | 'engine_constructed'
  | 'agent_asserted'
  | 'absent'

/** The pre-classified verdict on the agent's own motivation declaration:
 *   - 'detected' — confirmed passion language in the declaration (-10 channel)
 *   - 'clean'    — a declaration was supplied, no passion language (0)
 *  Absent (undefined) means no motivation declaration was supplied at all — the
 *  -5 "undeclared" penalty fires (an action submitted without a motivation
 *  declaration has not been examined at the synkatathesis level). The actual
 *  passion-language DETECTION on free text is upstream of this module. */
export type DeclaredMotivationPassion = 'detected' | 'clean'

/**
 * The caller-supplied context the score needs to complete a SubstrateScore.
 * Mirrors sage-assent-bridge.ts's BridgeContext: the substrate is idempotent and does
 * not itself hold these inputs, so the consumer that made the substrate call
 * supplies them.
 */
export interface ScoreContext {
  /** The kathekon gate's primary input. REQUIRED. */
  justification_source: JustificationSource
  /** The pre-classified verdict on the agent's motivation declaration. Absent
   *  when no declaration was supplied (the -5 undeclared penalty fires). */
  declared_motivation_passion?: DeclaredMotivationPassion
}

// ============================================================================
// SCORE OUTPUT TYPES — the SubstrateScore shape
//
// Mirrors the superseded agent-mode spec's three objects — `verdict`,
// `score_components`, `score` — with transparency fields added (gate_outcome,
// effective_quality, convention_quality_cap_applied, cap_applied, baseline,
// component_sum). The philosophical-mode and standard-mode renderers, and the
// Layer 3 agent-mode rendering, each project a subset of this shape.
// ============================================================================

/** Which gate row fired — the superseded spec's "Kathekon as gate" table. */
export type GateOutcome =
  /** is_kathekon true + justification_source engine_constructed: full calc,
   *  5-100 range, no gate cap. */
  | 'confirmed'
  /** is_kathekon true + justification_source agent_asserted: PROVISIONAL,
   *  capped at 50 pending engine verification. */
  | 'provisional_agent_asserted'
  /** is_kathekon true + justification_source absent: gate does not confirm,
   *  capped at 35. */
  | 'unconfirmed_absent'
  /** is_kathekon false OR quality 'contrary': capped at 35 regardless of
   *  components — a failure on the only axis that matters for action
   *  classification. */
  | 'contrary'
  /** is_kathekon null: PROVISIONAL, capped at 50 — kathekon verdict
   *  undetermined. */
  | 'provisional_null'

export type ScoreValidity = 'NORMAL' | 'PROVISIONAL'

/** Confidence in the scalar — derived from direction_of_travel. A
 *  confidence-interval modifier, never a score component. The philosophical /
 *  standard renderers OMIT this field (their specs exclude it); agent mode
 *  surfaces it. */
export type ScoreConfidence = 'high' | 'moderate' | 'low'

/** The seven score components + the baseline. Mirrors the superseded spec's
 *  `score_components` object. All values are signed: bonuses positive,
 *  penalties negative. `hasty_assent` is null when the penalty does not apply
 *  (single_snapshot input — no trajectory to assess pattern reliability
 *  against). */
export interface SubstrateScoreComponents {
  /** Fixed baseline for a kathekon-confirmed action. +55. */
  baseline: number
  /** Katorthoma proximity. +0 (reflexive) to +30 (sage_like). */
  proximity: number
  /** Structural passion penalty — per-passion base x causal-stage multiplier,
   *  summed, floored at -15. */
  passion_structural: number
  /** Declared-motivation passion penalty. -10 when passion language is
   *  confirmed in the agent's declaration; else 0. */
  passion_declared: number
  /** Motivation-undeclared penalty. -5 flat when no motivation declaration was
   *  supplied; else 0. Mutually exclusive with a non-zero passion_declared. */
  passion_undeclared: number
  /** Virtue bonus — breadth of rational engagement across virtue domains.
   *  +0 to +15. */
  virtue_bonus: number
  /** Value-error penalty — mis-categorised indifferents, weighted by axia,
   *  summed, floored at -15. */
  value_error: number
  /** Hasty-assent penalty. -10 / -5 / -2 / 0 by risk level. NULL when
   *  direction_of_travel is 'single_snapshot' (the penalty measures pattern
   *  reliability — a single snapshot has no pattern). Null contributes 0 to
   *  the component sum. */
  hasty_assent: number | null
}

/** The kathekon gate outcome — the verdict layer. Mirrors the superseded
 *  spec's `verdict` object, plus gate-transparency fields. */
export interface KathekonGateResult {
  /** From assessment.kathekon_assessment.is_kathekon. */
  is_kathekon: boolean | null
  /** From ScoreContext — the gate's primary input. */
  justification_source: JustificationSource
  /** From assessment.kathekon_assessment.quality — verbatim. */
  quality: KathekonQuality
  /** quality after the convention_inferred cap (strong -> moderate) is
   *  applied. Equal to `quality` when the cap did not fire. */
  effective_quality: KathekonQuality
  /** True when motivation_classification 'convention_inferred' downgraded a
   *  'strong' quality to 'moderate' for the multiplier. */
  convention_quality_cap_applied: boolean
  /** Which gate row fired. */
  gate_outcome: GateOutcome
}

/** A cap applied to the scalar `value` — the reason in plain language + the
 *  numeric ceiling. Null when no cap applied (the confirmed, NORMAL path). */
export interface ScoreCap {
  reason: string
  cap: number
}

/** The scalar score object. Mirrors the superseded spec's `score` object,
 *  plus `cap_applied` for renderer transparency (the philosophical / standard
 *  specs require a "(CAPPED — reason)" notation). */
export interface SubstrateScoreScalar {
  /** The scalar score, 0-100. For the confirmed NORMAL path, clamped to
   *  [5, 100]; for a capped path, `min(rounded, cap)` then clamped to
   *  [0, 100]. */
  value: number
  /** The kathekon quality multiplier actually applied (after the convention
   *  cap): 1.0 (strong) / 0.9 (moderate) / 0.75 (marginal). */
  kathekon_quality_multiplier: number
  /** NORMAL or PROVISIONAL. */
  validity: ScoreValidity
  /** Non-null when a gate cap or a PROVISIONAL cap was applied to `value`. */
  cap_applied: ScoreCap | null
  /** Confidence in the scalar — derived from direction_of_travel. */
  confidence: ScoreConfidence
  /** Aggregate uncertainty across components. +-N (the magnitude only; the
   *  band is symmetric). */
  precision_band: number
}

/** The complete substrate score — a pure deterministic projection of a
 *  Layer2Assessment + a ScoreContext. The downstream consumers (the Layer 3
 *  agent-mode rendering; philosophical mode; standard mode) each project a
 *  subset of this shape. */
export interface SubstrateScore {
  /** Schema version. Constant. */
  version: 'substrate-score-v1'
  /** The kathekon gate outcome — the verdict layer. */
  verdict: KathekonGateResult
  /** Per-component contributions — the score vector. */
  components: SubstrateScoreComponents
  /** baseline + all components (hasty_assent null counts as 0), before the
   *  quality multiplier. */
  component_sum: number
  /** The scalar score object. */
  score: SubstrateScoreScalar
}

// ============================================================================
// WEIGHT TABLES — the scoring formula (SageReasoning IP per R4; never returned
// in a response). Every weight is philosophically grounded — see the
// superseded agent-mode spec §"Component score" for the full grounding; the
// one-line rationale is on each constant below.
// ============================================================================

/** Fixed baseline for a kathekon-confirmed action. The superseded spec's
 *  "baseline 55": 55 + max bonuses (30 + 15) = 100; 55 - max penalties
 *  (25 + 15 + 10) = 5. The baseline is what makes the [5, 100] range exact. */
const BASELINE = 55

/** Katorthoma proximity weights. +0 to +30. Compressed at the top: sage_like
 *  is asymptotic (not reachable in practice), principled is the practical
 *  ceiling. The single most philosophically important component after the
 *  kathekon gate. (Fully specified in the superseded spec.) */
const PROXIMITY_WEIGHTS: Record<KatorthomaProximity, number> = {
  reflexive: 0,
  habitual: 7,
  deliberate: 15,
  principled: 23,
  sage_like: 30,
}

/** Virtue-bonus weights. Sum = 15 = the channel cap (so the cap is the natural
 *  ceiling, never a clamp). Phronesis is the master virtue (prerequisite for
 *  all others); dikaiosyne the primary social virtue; andreia for
 *  decision-under-uncertainty; sophrosyne hardest to detect from an action
 *  description. Measures BREADTH of rational engagement, not virtue quantity
 *  (R6b unity thesis). (Fully specified in the superseded spec.) */
const VIRTUE_WEIGHTS: Record<VirtueDomain, number> = {
  phronesis: 6,
  dikaiosyne: 4,
  andreia: 3,
  sophrosyne: 2,
}

/** Structural-passion per-passion base. Step 2 design-decision gate value
 *  (the superseded spec leaves it to "build session computes" — only the
 *  stage RATIO 1:2:3:4 is given). 1.25 makes a single praxis-stage (committed
 *  action) passion = -5.0 — one-third of the -15 channel cap — honouring the
 *  spec's "passion location in the causal chain is the load-bearing signal,
 *  not passion count", while still allowing accumulation toward the cap. */
const STRUCTURAL_PASSION_BASE = 1.25

/** Causal-stage multipliers. Stage ratio phantasia 1 : synkatathesis 2 :
 *  horme 3 : praxis 4 (fully specified in the superseded spec). The agent
 *  becomes responsible at the moment of assent; horme and praxis represent
 *  already-committed responsibility. */
const STAGE_MULTIPLIER: Record<CausalStage, number> = {
  phantasia: 1,
  synkatathesis: 2,
  horme: 3,
  praxis: 4,
}

/** Maximum (absolute) structural-passion penalty. */
const STRUCTURAL_PASSION_CAP = 15

/** Declared-motivation passion penalty (absolute). Fires on confirmed passion
 *  language in the agent's own declaration. Defends against passion-laundering
 *  (Form 2 gaming) and creates the incentive for honest declaration.
 *  (Fully specified in the superseded spec: "-10 max".) */
const PASSION_DECLARED_PENALTY = 10

/** Motivation-undeclared penalty (absolute). -5 flat when no motivation
 *  declaration was supplied. Smaller than the worst-case declared-passion
 *  penalty (-10) — so honest declaration is always safer than omission (the
 *  substrate naming its incentive structure). (Fully specified in the
 *  superseded spec: "-5 flat".) */
const PASSION_UNDECLARED_PENALTY = 5

/** Value-error penalty weights by axia grade. Treating a preferred indifferent
 *  as a genuine good (or a dispreferred as a genuine evil) is the root of most
 *  passion; inflation and deflation are weighted equally at the same axia
 *  level. (Fully specified in the superseded spec: "high -8, moderate -5,
 *  low -2".) */
const VALUE_ERROR_WEIGHTS: Record<AxiaGrade, number> = {
  high: 8,
  moderate: 5,
  low: 2,
}

/** Maximum (absolute) value-error penalty. */
const VALUE_ERROR_CAP = 15

/** Hasty-assent penalty weights by risk level (absolute). Synkatathesis is the
 *  hinge of the causal chain; the penalty measures the reasoning's structural
 *  vulnerability. (Fully specified in the superseded spec: "high -10,
 *  moderate -5, low -2, none 0".) */
const HASTY_ASSENT_WEIGHTS: Record<HastyAssentRisk, number> = {
  high: 10,
  moderate: 5,
  low: 2,
  none: 0,
}

/** Kathekon quality multipliers. Applied to (baseline + components). 'contrary'
 *  is handled by the gate (cap 35), not by a multiplier — but a defensive
 *  0.75 is mapped so the lookup is total. (Fully specified in the superseded
 *  spec: "strong 1.0, moderate 0.9, marginal 0.75".) */
const QUALITY_MULTIPLIER: Record<KathekonQuality, number> = {
  strong: 1.0,
  moderate: 0.9,
  marginal: 0.75,
  contrary: 0.75,
}

/** Score range for the kathekon-confirmed (engine_constructed, NORMAL) path.
 *  The superseded spec's stated max 100 / min-for-confirmed 5. */
const CONFIRMED_FLOOR = 5
const CONFIRMED_CEILING = 100

/** Gate caps — the superseded spec's "Kathekon as gate" table. */
const CONTRARY_CAP = 35
const ABSENT_CAP = 35
const PROVISIONAL_CAP = 50

/** Precision-band constants. Step 2 design-decision gate values (the
 *  superseded spec's open question 5 — only the anchors "+-5 clean,
 *  +-15 marginal" are given). Base +-5; each major uncertainty signal adds
 *  +-5; capped at +-20. The formula is calibrated so that on the pure
 *  confirmed path (engine_constructed, is_kathekon true) the band can reach at
 *  most +-15 — i.e. the "precision_band > 15 -> PROVISIONAL" backstop only
 *  fires on paths the gate has already made PROVISIONAL, so the two never
 *  disagree. */
const PRECISION_BAND_BASE = 5
const PRECISION_BAND_INCREMENT = 5
const PRECISION_BAND_CAP = 20
const PRECISION_BAND_PROVISIONAL_THRESHOLD = 15

// ============================================================================
// COMPONENT HELPERS — each a pure function of its inputs
// ============================================================================

/** Round half up to the nearest integer. Deterministic; `Math.round` already
 *  rounds half up for positive numbers, which is all the score produces. */
function roundScore(n: number): number {
  return Math.round(n)
}

/** Clamp `n` into the inclusive range [lo, hi]. */
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi)
}

/** Katorthoma proximity component. +0 to +30. */
function computeProximity(proximity: KatorthomaProximity): number {
  return PROXIMITY_WEIGHTS[proximity]
}

/** Virtue bonus. Sum of the per-domain weights for each ENGAGED domain;
 *  duplicates in the input array are counted once (a domain is engaged or it
 *  is not — R6b: this is breadth, not quantity). Max 15. */
function computeVirtueBonus(virtueDomains: ReadonlyArray<VirtueDomain>): number {
  const engaged = new Set<VirtueDomain>(virtueDomains)
  let bonus = 0
  for (const domain of engaged) {
    bonus += VIRTUE_WEIGHTS[domain]
  }
  return bonus
}

/** Structural-passion penalty (returned as a negative number). Per-passion
 *  base x causal-stage multiplier, summed across all detected passions,
 *  floored at -15. */
function computeStructuralPassion(
  assessment: Layer2Assessment
): number {
  let raw = 0
  for (const passion of assessment.passion_diagnosis.passions_detected) {
    raw += STRUCTURAL_PASSION_BASE * STAGE_MULTIPLIER[passion.causal_stage_affected]
  }
  return -Math.min(raw, STRUCTURAL_PASSION_CAP)
}

/** The declared / undeclared motivation penalties (both returned as negative
 *  numbers or 0). They are mutually exclusive: a declaration was either
 *  supplied (then declared fires on detection, undeclared is 0) or it was not
 *  (then undeclared fires, declared is 0). */
function computeMotivationPenalties(
  context: ScoreContext
): { declared: number; undeclared: number } {
  if (context.declared_motivation_passion === undefined) {
    // No motivation declaration supplied — the -5 undeclared penalty fires.
    return { declared: 0, undeclared: -PASSION_UNDECLARED_PENALTY }
  }
  if (context.declared_motivation_passion === 'detected') {
    // A declaration was supplied AND passion language was confirmed in it.
    return { declared: -PASSION_DECLARED_PENALTY, undeclared: 0 }
  }
  // 'clean' — a declaration was supplied, no passion language.
  return { declared: 0, undeclared: 0 }
}

/** Value-error penalty (returned as a negative number). An indifferent is
 *  mis-categorised when it is `treated_as` anything other than 'indifferent'
 *  (inflated to 'good' or deflated to 'evil'). Penalty by axia grade, summed,
 *  floored at -15. */
function computeValueError(assessment: Layer2Assessment): number {
  let raw = 0
  for (const item of assessment.value_assessment.indifferents_at_stake) {
    if (item.treated_as !== 'indifferent') {
      raw += VALUE_ERROR_WEIGHTS[item.axia]
    }
  }
  return -Math.min(raw, VALUE_ERROR_CAP)
}

/** Hasty-assent penalty. -10 / -5 / -2 / 0 by risk level — OR null when
 *  direction_of_travel is 'single_snapshot' (the penalty measures pattern
 *  reliability; a single snapshot has no pattern to assess). */
function computeHastyAssent(assessment: Layer2Assessment): number | null {
  if (assessment.iterative_refinement.direction_of_travel === 'single_snapshot') {
    return null
  }
  const weight = HASTY_ASSENT_WEIGHTS[assessment.hasty_assent_risk]
  return weight === 0 ? 0 : -weight
}

/** Confidence — derived from direction_of_travel. A confidence-interval
 *  modifier, never a score component. improving -> high; stable -> moderate;
 *  declining -> low; single_snapshot -> moderate. */
function computeConfidence(assessment: Layer2Assessment): ScoreConfidence {
  switch (assessment.iterative_refinement.direction_of_travel) {
    case 'improving':
      return 'high'
    case 'declining':
      return 'low'
    case 'stable':
    case 'single_snapshot':
      return 'moderate'
  }
}

/** Precision band — aggregate uncertainty across components. Base +-5; each
 *  major uncertainty signal adds +-5; capped at +-20. */
function computePrecisionBand(
  assessment: Layer2Assessment,
  context: ScoreContext
): number {
  let band = PRECISION_BAND_BASE
  if (assessment.kathekon_assessment.quality === 'marginal') {
    band += PRECISION_BAND_INCREMENT
  }
  if (context.justification_source !== 'engine_constructed') {
    band += PRECISION_BAND_INCREMENT
  }
  if (
    assessment.iterative_refinement.motivation_classification ===
    'unclear_pending_clarification'
  ) {
    band += PRECISION_BAND_INCREMENT
  }
  if (assessment.kathekon_assessment.is_kathekon === null) {
    band += PRECISION_BAND_INCREMENT
  }
  return Math.min(band, PRECISION_BAND_CAP)
}

// ============================================================================
// THE SCORE COMPUTATION — Layer2Assessment + ScoreContext -> SubstrateScore
// ============================================================================

/**
 * Compute the substrate score for one Layer2Assessment.
 *
 * Pure, synchronous, deterministic: the same (assessment, context) pair always
 * produces a byte-identical SubstrateScore. No clock read, no randomness, no
 * I/O, no LLM call.
 *
 * Algorithm (per the superseded agent-mode spec + the Step 2 design-decision
 * gate):
 *
 *   1. Compute the seven components (always — for vector transparency, even on
 *      a capped path; the consumer sees what the uncapped sum would have been).
 *   2. Resolve the kathekon quality multiplier, applying the convention cap
 *      (motivation_classification 'convention_inferred' downgrades a 'strong'
 *      quality to 'moderate').
 *   3. Evaluate the kathekon gate -> gate_outcome + any gate cap + validity.
 *   4. Apply the independent PROVISIONAL triggers (motivation
 *      'unclear_pending_clarification'; precision_band > +-15).
 *   5. Compute the scalar: (baseline + components) x multiplier, rounded; then
 *      either clamp to [5, 100] (confirmed NORMAL path) or apply
 *      min(rounded, cap) and clamp to [0, 100] (capped path).
 *   6. Assemble the SubstrateScore.
 */
export function computeSubstrateScore(
  assessment: Layer2Assessment,
  context: ScoreContext
): SubstrateScore {
  // --- 1. Components ----------------------------------------------------------
  const proximity = computeProximity(assessment.katorthoma_proximity)
  const virtueBonus = computeVirtueBonus(assessment.virtue_domains_engaged)
  const passionStructural = computeStructuralPassion(assessment)
  const { declared: passionDeclared, undeclared: passionUndeclared } =
    computeMotivationPenalties(context)
  const valueError = computeValueError(assessment)
  const hastyAssent = computeHastyAssent(assessment)

  const components: SubstrateScoreComponents = {
    baseline: BASELINE,
    proximity,
    passion_structural: passionStructural,
    passion_declared: passionDeclared,
    passion_undeclared: passionUndeclared,
    virtue_bonus: virtueBonus,
    value_error: valueError,
    hasty_assent: hastyAssent,
  }

  // baseline + all components; a null hasty_assent contributes 0.
  const componentSum =
    BASELINE +
    proximity +
    passionStructural +
    passionDeclared +
    passionUndeclared +
    virtueBonus +
    valueError +
    (hastyAssent ?? 0)

  // --- 2. Quality multiplier (with the convention cap) -----------------------
  const rawQuality = assessment.kathekon_assessment.quality
  const motivationClassification =
    assessment.iterative_refinement.motivation_classification
  let effectiveQuality: KathekonQuality = rawQuality
  let conventionQualityCapApplied = false
  if (motivationClassification === 'convention_inferred' && rawQuality === 'strong') {
    // Convention-motivated actions lack the rational foundation that 'strong'
    // kathekon quality requires — capped at 'moderate'.
    effectiveQuality = 'moderate'
    conventionQualityCapApplied = true
  }
  const qualityMultiplier = QUALITY_MULTIPLIER[effectiveQuality]

  // --- 3. Kathekon gate ------------------------------------------------------
  const isKathekon = assessment.kathekon_assessment.is_kathekon
  const justificationSource = context.justification_source

  let gateOutcome: GateOutcome
  let cap: ScoreCap | null = null
  let validity: ScoreValidity = 'NORMAL'

  if (isKathekon === false || rawQuality === 'contrary') {
    // Contrary-kathekon: a failure on the only axis that matters for action
    // classification. Capped at 35; NOT a PROVISIONAL trigger (the spec's
    // validity table does not list it) — the verdict is settled, it is just
    // a low one.
    gateOutcome = 'contrary'
    cap = { reason: 'contrary to appropriate action', cap: CONTRARY_CAP }
  } else if (isKathekon === null) {
    gateOutcome = 'provisional_null'
    cap = { reason: 'kathekon verdict undetermined', cap: PROVISIONAL_CAP }
    validity = 'PROVISIONAL'
  } else {
    // isKathekon === true — the justification_source decides the row.
    switch (justificationSource) {
      case 'engine_constructed':
        gateOutcome = 'confirmed'
        // No gate cap — the full component calculation stands.
        break
      case 'agent_asserted':
        gateOutcome = 'provisional_agent_asserted'
        cap = {
          reason: 'justification is agent-asserted, pending engine verification',
          cap: PROVISIONAL_CAP,
        }
        validity = 'PROVISIONAL'
        break
      case 'absent':
        gateOutcome = 'unconfirmed_absent'
        cap = {
          reason: 'no justification available; gate does not confirm',
          cap: ABSENT_CAP,
        }
        // NORMAL — 'absent' is not in the spec's PROVISIONAL trigger table.
        break
    }
  }

  // --- 4. Independent PROVISIONAL triggers -----------------------------------
  // motivation_classification 'unclear_pending_clarification' -> PROVISIONAL,
  // cap 50. NOTE (Step 2 design-decision gate): the superseded spec also lists
  // `null` here, but the real Layer 2 type defines `null` as "no praxis-stage
  // action observed" — a genuine N/A, not a data gap. Taking the spec literally
  // would cap the majority of perfectly-determinable assessments at 50, which
  // defeats the score's purpose. PROVISIONAL fires on
  // 'unclear_pending_clarification' ONLY.
  if (motivationClassification === 'unclear_pending_clarification') {
    validity = 'PROVISIONAL'
    cap = tightenCap(cap, {
      reason: 'motivation classification unclear, pending clarification',
      cap: PROVISIONAL_CAP,
    })
  }

  const precisionBand = computePrecisionBand(assessment, context)
  if (precisionBand > PRECISION_BAND_PROVISIONAL_THRESHOLD) {
    // Backstop: composite uncertainty too high for a confident scalar. By the
    // precision-band formula's calibration this can only be reached on paths
    // the gate has already made PROVISIONAL — so it never disagrees with the
    // gate; it is retained as a defensive guard.
    validity = 'PROVISIONAL'
    cap = tightenCap(cap, {
      reason: 'composite precision band exceeds +-15',
      cap: PROVISIONAL_CAP,
    })
  }

  // --- 5. Scalar -------------------------------------------------------------
  const rounded = roundScore(componentSum * qualityMultiplier)
  let value: number
  if (gateOutcome === 'confirmed' && cap === null) {
    // The kathekon-confirmed, engine-constructed, NORMAL path: clamp to the
    // spec's stated [5, 100] range.
    value = clamp(rounded, CONFIRMED_FLOOR, CONFIRMED_CEILING)
  } else {
    // A cap applies. min(rounded, cap), then clamp into [0, 100]. (The 5-floor
    // is specific to the confirmed path — a capped score may legitimately sit
    // below 5 if the components are very low.)
    const ceiling = cap ? cap.cap : CONFIRMED_CEILING
    value = clamp(Math.min(rounded, ceiling), 0, CONFIRMED_CEILING)
  }

  // --- 6. Assemble -----------------------------------------------------------
  return {
    version: 'substrate-score-v1',
    verdict: {
      is_kathekon: isKathekon,
      justification_source: justificationSource,
      quality: rawQuality,
      effective_quality: effectiveQuality,
      convention_quality_cap_applied: conventionQualityCapApplied,
      gate_outcome: gateOutcome,
    },
    components,
    component_sum: componentSum,
    score: {
      value,
      kathekon_quality_multiplier: qualityMultiplier,
      validity,
      cap_applied: cap,
      confidence: computeConfidence(assessment),
      precision_band: precisionBand,
    },
  }
}

/** Return the tighter (lower-ceiling) of two caps. When `existing` is null,
 *  `candidate` wins. Used when more than one cap could apply (e.g. an 'absent'
 *  gate cap of 35 alongside a motivation-unclear PROVISIONAL cap of 50 — the
 *  35 is the tighter and survives, while validity is tracked separately). */
function tightenCap(existing: ScoreCap | null, candidate: ScoreCap): ScoreCap {
  if (existing === null) return candidate
  return candidate.cap < existing.cap ? candidate : existing
}
