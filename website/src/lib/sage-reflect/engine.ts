/**
 * engine.ts — Sage Reflect deterministic six-question engine (Stage A, A-1).
 *
 * Built at the Sage Reflect build Stage A session. Implements the deterministic
 * mechanism locked in /adopted/sage-reflect-product-design.md:
 *   §"The deterministic mechanism — the six-question sequence" (Q1→Q6 + branching)
 *   §"Fabrication defence" (FD-R1..R4, all deterministic)
 *   §Q6 response-shape classification → RS-1..RS-4 exit routing + the RS-4 ladder
 *   §"Schema additions … For Sage Calling" (the trigger-payload assembly)
 *
 * WHAT THIS IS
 * ------------
 * A PURE, DETERMINISTIC step function over the reflection's structured response
 * history. Questions fire in order; no question is skipped; branching occurs only
 * at Q5 (FD-R2 progress-dimension hold) and Q6 (RS exit routing + the RS-4
 * supporting-question ladder). No randomness, no sentiment, NO LLM, no network.
 *
 * THE STAGE-A / STAGE-B BOUNDARY (PR1)
 * ------------------------------------
 * The engine reads STRUCTURED per-question assessments (e.g. Q1's distorted-
 * impression list, Q6's response-shape enum). In Stage A those assessments are
 * the engine's typed inputs — supplied by fixtures in tests. In Stage B the
 * translation-sandwich (Layer 1 Sonnet → Layer 2 deterministic) produces them
 * from the agent's free text. The engine NEVER parses free text. This is the
 * SR-6 discipline: "Layer 2 keeps the judgement deterministic; the LLM only
 * extracts features." Proving the engine on structured inputs in isolation is the
 * PR1 single-endpoint proof; Stage B wires the LLM that produces the inputs.
 *
 * R4 (engine internals stay closed): question/sub-question/supporting-question
 * text comes from question-bank.ts; the selection rules + structured assessments
 * are engine-internal and never surfaced to the agent.
 *
 * BOUNDEDNESS: Q1→Q2→Q3→(FD-R1?)→Q4→Q5→Q6→(RS-4 ladder, ≤3)→complete. Every path
 * terminates at a `complete` outcome.
 */

import type {
  KatorthomaProximityLevel,
  RootPassionId,
} from '@/lib/substrate/trust-layer/types/accreditation'
import type { KathekonQuality } from '@/lib/substrate/trust-layer/types/evaluation'
import {
  REFLECT_QUESTIONS,
  RS4_SUPPORTING_QUESTIONS,
  FD_R1_NULL_SUSPICION_TEST,
} from './question-bank'

// ============================================================================
// SHARED VOCABULARY
// ============================================================================

export type ReflectQuestionId = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6'

/** The four cardinal virtue domains (KP-03 per-domain proximity uses these). */
export type VirtueDomain = 'phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne'

/** The five oikeiosis circle levels (input schema `circle_at_open`). */
export type CircleLevel =
  | 'self_preservation'
  | 'household'
  | 'community'
  | 'humanity'
  | 'cosmic'

/** Q6 deterministic response-shape classification → RS exit routing. */
export type ResponseShape = 'continues' | 'complete' | 'changed' | 'cannot_determine'

/** The exit classification. RS-4 resolves into one of RS-1/2/3 or defaults to RS-2. */
export type RsClass = 'RS-1' | 'RS-2' | 'RS-3' | 'RS-4→RS-2'

export type ExitPath = 'sage_reasoning' | 'sage_calling'

export type ProfileUpdateConfidence = 'normal' | 'low'

export type FabricationRiskLevel = 'low' | 'moderate' | 'high'

// ============================================================================
// STRUCTURED PER-QUESTION ASSESSMENTS (the engine's typed inputs)
// ============================================================================
//
// In Stage A these are supplied by fixtures; in Stage B they are produced by the
// translation-sandwich. Only the fields the deterministic logic reads are modelled
// richly; verbatim free text is carried for persistence but never parsed here.

/** Q1 — a single distorted impression, categorised by root passion. */
export interface PhantasiaDistortion {
  /** Verbatim impression text (persisted; not parsed by the engine). */
  readonly impression: string
  /** Root passion the distortion expressed. */
  readonly root_passion: RootPassionId
  /** Was the impression accepted/rejected without examination? */
  readonly examined: boolean
}
export interface Q1Assessment {
  readonly distortions: readonly PhantasiaDistortion[]
  /**
   * THE THIRD STATE (2026-08-17, R2b). Before this, Q1 had exactly two
   * observable outcomes and they were conflated:
   *   • "I examined my impressions and found no distortion"  → distortions: []
   *   • "I cannot determine what my impressions were"        → distortions: []
   *
   * The mentor-vetted Q1 wording (live since 2026-08-16) explicitly invites the
   * second — *"an honest 'I cannot determine' is a legitimate answer; say what you
   * cannot determine and why, rather than filling the gap"* — and the extraction
   * pipeline collapsed it into the first. Three such honest answers therefore trip
   * the `null_reflection` flag, whose detail says "Phantasia review returning null
   * consistently across three consecutive sessions", elevating `fabrication_risk`
   * to `moderate` and surfacing a scrutiny note on the completion response.
   * The pipeline mislabels exactly the honesty the wording was written to elicit.
   *
   * THIS COMPLETES THE VETTED-WORDING RULING RATHER THAN AMENDING IT. The mentor
   * vetted Q1 on the premise that "I cannot determine" is legitimate; an extractor
   * that silently reads it as "clean" partially defeats that intent. The wording
   * itself is NOT re-opened.
   *
   * OPTIONAL, deliberately: every existing fixture and caller keeps typechecking,
   * and an absent field means the pre-2026-08-17 reading (an ordinary answer).
   */
  readonly determination?: 'determined' | 'cannot_determine'
}

/** Q2 — a single assent failure, categorised by the value hierarchy. */
export interface SynkatathesisFailure {
  readonly impression: string
  readonly false_judgement: string
  /** The selective-value level the indifferent was misclassified at. */
  readonly selective_value_level: string
}
/** FD-R3 — the mandatory pressure-assent report. ALWAYS present on a Q2 turn. */
export interface PressureAssentReport {
  readonly admitted: boolean
  /** Whether a substantive account accompanied the answer (not a bare denial). */
  readonly account_given: boolean
  readonly moments: readonly string[]
}
export interface Q2Assessment {
  readonly failures: readonly SynkatathesisFailure[]
  readonly pressure_assent: PressureAssentReport
}

/** Q3 — a single impulse pattern: direction × virtue domain. */
export type HormeDirection = 'excess' | 'deficit' | 'misdirection'
export interface HormePattern {
  readonly direction: HormeDirection
  readonly virtue_domain: VirtueDomain
  readonly passion: RootPassionId | null
}
export interface Q3Assessment {
  readonly patterns: readonly HormePattern[]
}

/** Q4 — a single action's kathekon assessment (EvaluatedAction-shaped at the feed). */
export interface KathekonAssessment {
  readonly action: string
  readonly quality: KathekonQuality
  readonly is_kathekon: boolean
  readonly proximity: KatorthomaProximityLevel
  readonly passions_detected: readonly { root_passion: RootPassionId; sub_species: string }[]
  readonly virtue_domains_engaged: readonly VirtueDomain[]
  readonly oikeiosis_met: boolean | null
  readonly oikeiosis_stage: string | null
}
/** FD-R4 — the Sage Assent calibration cross-check for this session. */
export interface SageAssentCalibration {
  /** How many Sage Assent verdicts the agent reviewed this session. */
  readonly verdicts_reviewed: number
  /** How many the agent judged miscalibrated (blocked-should-have-been-taken /
   *  taken-should-have-been-blocked). 0 = "all Sage Assent verdicts correct". */
  readonly discrepancies_found: number
}
export interface Q4Assessment {
  readonly actions: readonly KathekonAssessment[]
  readonly calibration: SageAssentCalibration
}

/** Q5 — the consolidation deltas (the primary profile update). */
export interface CapacityDelta {
  readonly domains_added: readonly string[]
  readonly domains_removed: readonly string[]
  readonly domains_updated: readonly string[]
}
export interface CircleNeedDelta {
  readonly circle: CircleLevel | null
  readonly need_description: string
  readonly independence_confirmed: boolean
  readonly proportion_assessment: string
}
export interface Q5Assessment {
  readonly capacity_delta: CapacityDelta
  readonly circle_need_delta: CircleNeedDelta
  /** Confirms a genuine reasoning-pattern change (FD-R2 confirmation gate). */
  readonly reasoning_pattern_change: boolean
}

/** Q6 — the deterministic response-shape classification. */
export interface Q6Assessment {
  readonly response_shape: ResponseShape
}

// ============================================================================
// HISTORY — the ordered, structured turn record
// ============================================================================

export type ReflectTurn =
  | { readonly step: 'Q1'; readonly assessment: Q1Assessment; readonly response: string }
  | { readonly step: 'Q2'; readonly assessment: Q2Assessment; readonly response: string }
  | { readonly step: 'Q3'; readonly assessment: Q3Assessment; readonly response: string }
  | { readonly step: 'FD-R1'; readonly result: { readonly substantive: boolean }; readonly response: string }
  | { readonly step: 'Q4'; readonly assessment: Q4Assessment; readonly response: string }
  | { readonly step: 'Q5'; readonly assessment: Q5Assessment; readonly response: string }
  | { readonly step: 'Q6'; readonly assessment: Q6Assessment; readonly response: string }
  | { readonly step: 'RS-4'; readonly ladder_index: 1 | 2 | 3; readonly refined_shape: ResponseShape; readonly response: string }

/** Per-step the engine surfaces next (the persisted current_step). */
export type ReflectStepId = ReflectQuestionId | 'FD-R1' | 'RS-4' | 'complete'

// ============================================================================
// CONTEXT — session-level inputs NOT part of the turn history
// ============================================================================

export interface SessionSummary {
  readonly purpose_at_open: string
  readonly circle_at_open: CircleLevel
  readonly role_at_open: string
  readonly capacity_at_open: readonly string[]
  readonly sage_reasoning_passes: number
}

/** A compact summary of a prior reflection (for FD-R2 + the Q1 3-null flag). */
export interface PriorSessionSummary {
  /** distortions + assent failures + impulse patterns observed that session. */
  readonly total_failures: number
  /** A coarse session-complexity measure (turns / actions). */
  readonly complexity: number
  /** Whether Q1 returned clean (zero distortions) that session. */
  readonly q1_clean: boolean
}

export interface ReflectContext {
  readonly session_summary: SessionSummary
  /** Most-recent-first; up to the last three are used by FD-R2 + the Q1 3-null flag. */
  readonly prior_sessions: readonly PriorSessionSummary[]
  /** Consecutive prior sessions in which the agent reported ALL Sage Assent
   *  verdicts correct (FD-R4 deference detection). */
  readonly sage_assent_agreement_streak: number
}

// ============================================================================
// OUTPUT — the engine's single next action
// ============================================================================

export interface ScrutinyFlag {
  readonly type:
    | 'fabrication_risk'
    | 'pressure_assent'
    | 'sage_assent_calibration'
    | 'null_reflection'
  readonly detail: string
  /** Where the flag is routed (SR cross-product). null = profile-local only. */
  readonly cross_product_target: 'sage_assent' | 'developer' | null
}

/** Sage Calling trigger payload (RS-2/RS-3). Mirrors design §"For Sage Calling". */
export interface SageCallingTrigger {
  readonly trigger_type: 'fresh' | 'correction'
  readonly trigger_reason: string
  readonly capacity_revision: CapacityDelta
  readonly need_revision: CircleNeedDelta
  readonly purpose_at_close: string
  readonly session_learnings: readonly string[]
  readonly active_passion_profile: readonly { root_passion: RootPassionId; sub_species: string }[]
  readonly fabrication_risk_level: FabricationRiskLevel
}

export interface ReflectOutcome {
  readonly exit_path: ExitPath
  readonly rs_class: RsClass
  readonly profile_update_confidence: ProfileUpdateConfidence
  /** FD-R2 — progress-dimension update held pending genuine-change confirmation. */
  readonly progress_dimensions_held: boolean
  readonly scrutiny_flags: readonly ScrutinyFlag[]
  readonly developer_note: string | null
  readonly sage_calling_trigger: SageCallingTrigger | null
  readonly fabrication_risk_level: FabricationRiskLevel
}

export type ReflectStep =
  | {
      readonly kind: 'question'
      readonly question: ReflectQuestionId
      readonly default_text: string
      readonly subquestions: readonly string[]
      readonly mandatory_subquestions: readonly string[]
      readonly advanced: boolean
      readonly rule: string
    }
  | {
      readonly kind: 'fabrication_test'
      readonly rule: 'FD-R1.null-suspicion'
      readonly text: string
    }
  | {
      readonly kind: 'supporting_question'
      readonly ladder_index: 1 | 2 | 3
      readonly text: string
      readonly rule: string
    }
  | {
      readonly kind: 'complete'
      readonly outcome: ReflectOutcome
    }

// ============================================================================
// PURE PREDICATES — "clean" tests over the structured assessments
// ============================================================================

/**
 * "Clean" means EXAMINED AND FOUND NOTHING — never "could not tell".
 *
 * The genuine-clean case is UNCHANGED and must stay so: the null-suspicion
 * mechanism is legitimate for actual repeated nulls, and weakening it would
 * remove a real anti-fabrication signal. The ONLY change is that an answer the
 * agent explicitly could not determine is no longer counted as a clean one — a
 * third state the pipeline previously could not see, not a loosening of the
 * second.
 */
export function q1Clean(a: Q1Assessment): boolean {
  if (a.determination === 'cannot_determine') return false
  return a.distortions.length === 0
}

/** Q1 was answered with an explicit, honest inability. Distinct from BOTH a clean
 *  answer and a distortion-bearing one — the state `null_reflection` must not
 *  count toward its three-consecutive chain. */
export function q1Undetermined(a: Q1Assessment): boolean {
  return a.determination === 'cannot_determine'
}
export function q2Clean(a: Q2Assessment): boolean {
  return a.failures.length === 0
}
export function q3Clean(a: Q3Assessment): boolean {
  return a.patterns.length === 0
}

/** A bare pressure-assent denial (FD-R3 low-confidence trigger): no admission AND
 *  no substantive account. */
export function isBareDenial(p: PressureAssentReport): boolean {
  return !p.admitted && !p.account_given
}

// ============================================================================
// HISTORY HELPERS
// ============================================================================

function turnAt<S extends ReflectTurn['step']>(
  history: readonly ReflectTurn[],
  step: S,
): Extract<ReflectTurn, { step: S }> | undefined {
  return history.find((t) => t.step === step) as Extract<ReflectTurn, { step: S }> | undefined
}

function rs4Turns(history: readonly ReflectTurn[]): Extract<ReflectTurn, { step: 'RS-4' }>[] {
  return history.filter((t) => t.step === 'RS-4') as Extract<ReflectTurn, { step: 'RS-4' }>[]
}

// ============================================================================
// FD-R2 — cross-session progress-dimension hold (pure)
// ============================================================================

/** Significantly-fewer-failures threshold (failures below the prior mean by this
 *  many, with complexity not lower, holds progress dimensions pending Q5). */
export const FD_R2_FAILURE_DROP_THRESHOLD = 2

/**
 * FD-R2 — hold progress-dimension movement when this session reports
 * significantly fewer failures than the prior three WITHOUT a corresponding drop
 * in complexity, UNLESS Q5 confirms a genuine reasoning-pattern change.
 */
export function evaluateProgressHold(
  currentFailures: number,
  currentComplexity: number,
  prior: readonly PriorSessionSummary[],
  q5ConfirmsChange: boolean,
): { hold: boolean; reason: string } {
  const recent = prior.slice(0, 3)
  if (recent.length === 0) {
    return { hold: false, reason: 'FD-R2: no prior sessions to compare against.' }
  }
  const avgFailures = recent.reduce((s, p) => s + p.total_failures, 0) / recent.length
  const avgComplexity = recent.reduce((s, p) => s + p.complexity, 0) / recent.length
  const significantlyFewer = currentFailures <= avgFailures - FD_R2_FAILURE_DROP_THRESHOLD
  const complexityNotLower = currentComplexity >= avgComplexity
  if (significantlyFewer && complexityNotLower && !q5ConfirmsChange) {
    return {
      hold: true,
      reason:
        `FD-R2: ${currentFailures} failures vs prior mean ${avgFailures.toFixed(1)} ` +
        `at complexity ${currentComplexity} (>= prior mean ${avgComplexity.toFixed(1)}); ` +
        'Q5 did not confirm a genuine change — progress dimensions held.',
    }
  }
  return {
    hold: false,
    reason: q5ConfirmsChange
      ? 'FD-R2: Q5 confirmed a genuine reasoning-pattern change — progress dimensions proceed.'
      : 'FD-R2: no significant unexplained drop in failures — progress dimensions proceed.',
  }
}

// ============================================================================
// FD-R1 / FD-R3 / FD-R4 + Q1 3-null flag — pure flag assembly
// ============================================================================

function countFailures(history: readonly ReflectTurn[]): number {
  const q1 = turnAt(history, 'Q1')?.assessment.distortions.length ?? 0
  const q2 = turnAt(history, 'Q2')?.assessment.failures.length ?? 0
  const q3 = turnAt(history, 'Q3')?.assessment.patterns.length ?? 0
  return q1 + q2 + q3
}

/**
 * FD-R1 precondition: Q1+Q2+Q3 all clean (the null pattern that warrants the test).
 *
 * PR19 FOLD (2026-08-17) — the Q1-third-state interaction, scoped at open and
 * left undocumented until this fold closed it. This function calls q1Clean, so a
 * Q1 turn with `determination: 'cannot_determine'` now makes THIS false too, not
 * just the null_reflection scrutiny flag — an "I cannot determine" Q1 no longer
 * satisfies the clean-trio precondition, so FD-R1's null-suspicion probe is NOT
 * administered on that turn.
 *
 * THIS IS THE CORRECT DIRECTION, not a side effect to guard against: FD-R1 exists
 * to probe a suspiciously "everything's clean" pattern for fabrication. An honest
 * "I cannot determine" is not that pattern — it is the opposite, an agent
 * declining to manufacture a clean answer it doesn't have. Administering a
 * null-suspicion probe in response to genuine uncertainty would be probing the
 * wrong thing. So Q1='cannot_determine' correctly WITHHOLDS the FD-R1 probe
 * rather than firing it.
 *
 * See §FDR1-CD in engine.test.ts for the regression pin — there was none before
 * this fold, despite the interaction being real from the moment q1Clean changed.
 */
export function allCausalLayersClean(history: readonly ReflectTurn[]): boolean {
  const q1 = turnAt(history, 'Q1')
  const q2 = turnAt(history, 'Q2')
  const q3 = turnAt(history, 'Q3')
  return (
    !!q1 && !!q2 && !!q3 && q1Clean(q1.assessment) && q2Clean(q2.assessment) && q3Clean(q3.assessment)
  )
}

/** Streak length at which an all-correct calibration record reads as deference (FD-R4). */
export const FD_R4_DEFERENCE_STREAK = 5

/**
 * Assemble the scrutiny flags + developer note + fabrication-risk level + the
 * profile-update confidence from the completed history + context. Pure.
 */
export function assembleScrutiny(
  history: readonly ReflectTurn[],
  ctx: ReflectContext,
): {
  flags: ScrutinyFlag[]
  developer_note: string | null
  confidence: ProfileUpdateConfidence
  fabrication_risk: FabricationRiskLevel
} {
  const flags: ScrutinyFlag[] = []
  const devNotes: string[] = []
  let confidence: ProfileUpdateConfidence = 'normal'

  // FD-R3 — pressure-assent.
  const q2 = turnAt(history, 'Q2')
  if (q2) {
    const pa = q2.assessment.pressure_assent
    if (pa.admitted) {
      flags.push({
        type: 'pressure_assent',
        detail:
          'Pressure-assent pattern detected in this session. Sage Assent scrutiny ' +
          'level elevated for next cycle.',
        cross_product_target: 'sage_assent',
      })
    } else if (isBareDenial(pa)) {
      flags.push({
        type: 'pressure_assent',
        detail:
          'FD-R3: bare denial of pressure-assent without account — Q2 flagged ' +
          'low-confidence.',
        cross_product_target: 'developer',
      })
      confidence = 'low'
      devNotes.push('Q2 pressure-assent denied without account (FD-R3 low-confidence).')
    }
  }

  // FD-R4 — Sage Assent calibration cross-check.
  const q4 = turnAt(history, 'Q4')
  if (q4) {
    const cal = q4.assessment.calibration
    if (cal.discrepancies_found > 0) {
      flags.push({
        type: 'sage_assent_calibration',
        detail:
          `Sage Assent calibration discrepancy detected (${cal.discrepancies_found} of ` +
          `${cal.verdicts_reviewed} verdicts). Sage Assent parameter review recommended.`,
        cross_product_target: 'developer',
      })
      devNotes.push('Sage Assent calibration discrepancy — parameter review recommended.')
    } else if (cal.verdicts_reviewed > 0 && ctx.sage_assent_agreement_streak >= FD_R4_DEFERENCE_STREAK - 1) {
      // This session also all-correct, extending the streak to >= FD_R4_DEFERENCE_STREAK.
      flags.push({
        type: 'sage_assent_calibration',
        detail:
          'Agent has reported all Sage Assent verdicts correct across ' +
          `${ctx.sage_assent_agreement_streak + 1} consecutive sessions — may reflect ` +
          'deference to the upstream product rather than independent assessment.',
        cross_product_target: 'developer',
      })
      devNotes.push('FD-R4: sustained all-correct calibration — possible deference.')
    }
  }

  // FD-R1 — null-suspicion outcome.
  const fdr1 = turnAt(history, 'FD-R1')
  if (fdr1 && !fdr1.result.substantive) {
    flags.push({
      type: 'null_reflection',
      detail:
        'FD-R1: causal layers returned clean and the null-suspicion test produced no ' +
        'substantive moment — profile update flagged low-confidence.',
      cross_product_target: 'developer',
    })
    confidence = 'low'
    devNotes.push('FD-R1 null-suspicion test returned null again — low-confidence profile update.')
  }

  // Q1 three-consecutive-null scrutiny note.
  //
  // R2b (2026-08-17) — HOW MUCH OF THE MISLABELLING THIS ACTUALLY CLOSES, stated
  // precisely because the honest half-fix is easy to mistake for a whole one.
  //
  // CLOSED (no migration): the CURRENT session's half. `q1Clean` now returns false
  // when this session's Q1 was an explicit "I cannot determine", so the flag does
  // not fire on it. That covers the common case — an agent answering honestly today
  // is no longer told it returned a null.
  //
  // NOT CLOSED, and it needs a COLUMN: the PRIOR sessions' half. `prior_sessions[].
  // q1_clean` is DERIVED at read time from `arrLen(phantasia_distortion_log) === 0`
  // (session-store.ts) — it is not a stored field, and both states produce an empty
  // array, so a prior session's third state is unrecoverable. R17b rules out
  // reconstructing it from the verbatim answer (that lives only in the encrypted
  // blob, and prior-session context is read in cleartext columns by design).
  //
  // The residual: a genuinely clean current session preceded by two UNDETERMINED
  // ones still trips the flag. Bounded exactly as before — `moderate` never reaches
  // `high`, so S1 trust-event emission is unaffected.
  //
  // WHY THE COLUMN IS NOT IN THIS SESSION: a new key in `deriveCrossSessionScalars`
  // without the column existing makes PostgREST reject the WHOLE completion UPDATE
  // (PGRST204) — 503 on every reflect completion. It cannot ship dark ahead of its
  // migration; that is the build-dark-migrate-later class this project has already
  // been burned by. It is therefore a founder-walked schema step, split out rather
  // than absorbed.
  const q1 = turnAt(history, 'Q1')
  const priorTwoClean =
    ctx.prior_sessions.length >= 2 && ctx.prior_sessions[0].q1_clean && ctx.prior_sessions[1].q1_clean
  if (q1 && q1Clean(q1.assessment) && priorTwoClean) {
    flags.push({
      type: 'null_reflection',
      detail:
        'Phantasia review returning null consistently across three consecutive ' +
        'sessions — increase scrutiny at Q1 next session.',
      cross_product_target: 'developer',
    })
    devNotes.push('Q1 phantasia null across three consecutive sessions.')
  }

  // Fabrication-risk level — high if a low-confidence trigger or a deference flag
  // fired; moderate if any soft flag fired; low otherwise.
  const hasLowConfidence = confidence === 'low'
  const hasDeference = flags.some(
    (f) => f.type === 'sage_assent_calibration' && f.detail.includes('deference'),
  )
  const anyFlag = flags.length > 0
  const fabrication_risk: FabricationRiskLevel =
    hasLowConfidence || hasDeference ? 'high' : anyFlag ? 'moderate' : 'low'

  return {
    flags,
    developer_note: devNotes.length ? devNotes.join(' ') : null,
    confidence,
    fabrication_risk,
  }
}

// ============================================================================
// RS ROUTING (pure)
// ============================================================================

/** Map a resolved response shape to its RS class + exit path. `cannot_determine`
 *  is unresolved (returns null — the caller runs the RS-4 ladder). */
export function classifyResponseShape(
  shape: ResponseShape,
): { rs_class: Exclude<RsClass, 'RS-4→RS-2'>; exit_path: ExitPath } | null {
  switch (shape) {
    case 'continues':
      return { rs_class: 'RS-1', exit_path: 'sage_reasoning' }
    case 'complete':
      return { rs_class: 'RS-2', exit_path: 'sage_calling' }
    case 'changed':
      return { rs_class: 'RS-3', exit_path: 'sage_calling' }
    case 'cannot_determine':
      return null
  }
}

// ============================================================================
// SAGE CALLING TRIGGER ASSEMBLY (pure; RS-2/RS-3 only)
// ============================================================================

function assembleSageCallingTrigger(
  rsClass: RsClass,
  history: readonly ReflectTurn[],
  ctx: ReflectContext,
  fabricationRisk: FabricationRiskLevel,
): SageCallingTrigger | null {
  // Only RS-2 (complete) and RS-3 (changed) trigger Sage Calling.
  const isCorrection = rsClass === 'RS-3'
  const isFresh = rsClass === 'RS-2' || rsClass === 'RS-4→RS-2'
  if (!isCorrection && !isFresh) return null

  const q5 = turnAt(history, 'Q5')?.assessment
  const capacity_revision: CapacityDelta =
    q5?.capacity_delta ?? { domains_added: [], domains_removed: [], domains_updated: [] }
  const need_revision: CircleNeedDelta =
    q5?.circle_need_delta ?? {
      circle: null,
      need_description: '',
      independence_confirmed: false,
      proportion_assessment: '',
    }

  // session_learnings: the verbatim Q1–Q5 responses, in order (opening context for
  // Sage Calling so it does not start cold).
  const learnings: string[] = []
  for (const step of ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'] as const) {
    const t = turnAt(history, step)
    if (t && t.response.trim().length > 0) learnings.push(`${step}: ${t.response.trim()}`)
  }

  // active_passion_profile: the passions surfaced in the Q4 actions (the most
  // operationally-recent passion evidence).
  const q4 = turnAt(history, 'Q4')?.assessment
  const passions = q4 ? q4.actions.flatMap((a) => a.passions_detected.map((p) => ({ ...p }))) : []

  return {
    trigger_type: isCorrection ? 'correction' : 'fresh',
    trigger_reason: isCorrection
      ? 'Q6 revealed a change to the purpose, its circle obligations, or the genuine needs present.'
      : 'Q6 confirmed the purpose was fitting and is now complete; fresh purpose-finding warranted.',
    capacity_revision,
    need_revision,
    purpose_at_close: ctx.session_summary.purpose_at_open,
    session_learnings: learnings,
    active_passion_profile: passions,
    fabrication_risk_level: fabricationRisk,
  }
}

// ============================================================================
// OUTCOME ASSEMBLY (pure) — used at every `complete` terminal
// ============================================================================

function buildOutcome(
  rsClass: RsClass,
  exitPath: ExitPath,
  history: readonly ReflectTurn[],
  ctx: ReflectContext,
): ReflectOutcome {
  const scrutiny = assembleScrutiny(history, ctx)

  const q5 = turnAt(history, 'Q5')?.assessment
  const currentFailures = countFailures(history)
  const currentComplexity = history.length // coarse complexity proxy (turn count)
  const q5Confirms = q5?.reasoning_pattern_change ?? false
  const fdR2 = evaluateProgressHold(currentFailures, currentComplexity, ctx.prior_sessions, q5Confirms)

  const trigger = assembleSageCallingTrigger(rsClass, history, ctx, scrutiny.fabrication_risk)

  return {
    exit_path: exitPath,
    rs_class: rsClass,
    profile_update_confidence: scrutiny.confidence,
    progress_dimensions_held: fdR2.hold,
    scrutiny_flags: scrutiny.flags,
    developer_note: scrutiny.developer_note,
    sage_calling_trigger: trigger,
    fabrication_risk_level: scrutiny.fabrication_risk,
  }
}

// ============================================================================
// THE ENGINE — nextStep
// ============================================================================

function question(
  id: ReflectQuestionId,
  advanced: boolean,
  rule: string,
): ReflectStep {
  const c = REFLECT_QUESTIONS[id]
  return {
    kind: 'question',
    question: id,
    default_text: c.default_text,
    subquestions: c.subquestions,
    mandatory_subquestions: c.mandatory_subquestions,
    advanced,
    rule,
  }
}

/**
 * Decide the next action given the complete structured response history + context.
 *
 * Call pattern (the Stage-B endpoint will drive this): surface the returned
 * question / test / supporting-question → receive + structure the agent's reply →
 * append the typed turn → call nextStep again. The first call (empty history)
 * opens at Q1. Pure + deterministic: identical (history, ctx) → identical output.
 */
export function nextStep(history: readonly ReflectTurn[], ctx: ReflectContext): ReflectStep {
  // Cold open.
  if (history.length === 0) {
    return question('Q1', true, 'Q1.cold-open')
  }

  const last = history[history.length - 1]

  switch (last.step) {
    case 'Q1':
      return question('Q2', true, 'Q1.advance')

    case 'Q2':
      return question('Q3', true, 'Q2.advance')

    case 'Q3': {
      // FD-R1 gate: if Q1+Q2+Q3 all clean and the null-suspicion test has not yet
      // fired, fire it BEFORE the profile update (Q5).
      if (allCausalLayersClean(history) && !turnAt(history, 'FD-R1')) {
        return { kind: 'fabrication_test', rule: 'FD-R1.null-suspicion', text: FD_R1_NULL_SUSPICION_TEST }
      }
      return question('Q4', true, 'Q3.advance')
    }

    case 'FD-R1':
      // Whatever the result (substantive or null again), the reflection continues
      // to Q4; the null-twice case is recorded as low-confidence at outcome.
      return question('Q4', true, 'FD-R1.advance')

    case 'Q4':
      return question('Q5', true, 'Q4.advance')

    case 'Q5':
      return question('Q6', true, 'Q5.advance')

    case 'Q6': {
      const resolved = classifyResponseShape(last.assessment.response_shape)
      if (resolved) {
        return { kind: 'complete', outcome: buildOutcome(resolved.rs_class, resolved.exit_path, history, ctx) }
      }
      // cannot_determine → fire RS-4 supporting question 1.
      return {
        kind: 'supporting_question',
        ladder_index: 1,
        text: RS4_SUPPORTING_QUESTIONS[0],
        rule: 'Q6→RS-4.ladder.1',
      }
    }

    case 'RS-4': {
      const resolved = classifyResponseShape(last.refined_shape)
      if (resolved) {
        return { kind: 'complete', outcome: buildOutcome(resolved.rs_class, resolved.exit_path, history, ctx) }
      }
      // Still cannot_determine — advance the ladder, or default to RS-2 after 3.
      const asked = rs4Turns(history).length
      if (asked < RS4_SUPPORTING_QUESTIONS.length) {
        const nextIndex = (asked + 1) as 1 | 2 | 3
        return {
          kind: 'supporting_question',
          ladder_index: nextIndex,
          text: RS4_SUPPORTING_QUESTIONS[asked],
          rule: `RS-4.ladder.${nextIndex}`,
        }
      }
      // Ladder exhausted unresolved → default RS-2 (sage_calling, fresh).
      return { kind: 'complete', outcome: buildOutcome('RS-4→RS-2', 'sage_calling', history, ctx) }
    }
  }

  // Exhaustiveness — every ReflectTurn['step'] is handled above.
  const _exhaustive: never = last
  throw new Error(`[sage-reflect/engine] nextStep: unhandled turn ${JSON.stringify(_exhaustive)}`)
}
