/**
 * discernment-engine.ts — Trust Layer S6: the four-layer discernment engine
 * (L1 honestum gate · L2 role/task fit · L3 axia comparison), as a pure
 * deterministic core with an OPTIONAL injectable extraction seam. MEASURE mode.
 *
 * BINDING SPECS (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §4 the four-layer discernment protocol + §5 A2/A5/A6). Where this file
 * and the ADR diverge, the VERBATIM RECORD WINS.
 *
 * ─── What S6 is ──────────────────────────────────────────────────────────────
 * Selection is a KATHEKON question at the ORCHESTRATOR's level (ADR §4): not "which
 * sub-agent is objectively best" but which best enables the orchestrator to fulfil
 * its kathekonta without compromising the honestum threshold. Given a task profile,
 * a set of candidate profiles, and the orchestrator profile (S5 shapes), the engine
 * runs:
 *   L1 — the honestum gate (threshold; a failure EXCLUDES before capability is
 *        assessed). Q1.1 role alignment · Q1.2 justice-surface check · Q1.3
 *        credential integrity (reuses S2 domain distance) · A6 un-profiled handling.
 *   L2 — role and task fit (a FOUR-DIMENSION fit score, NOT pass/fail). Q2.1
 *        specificity · Q2.2 stability under the task's actual conditions (the
 *        prior-interaction record enters HERE — A9/L4 — never before L1) · Q2.3
 *        transparency of reasoning (reuses the S4 A4 transparency ledger) · Q2.4
 *        circle alignment (a dikaiosyne risk when misaligned, not a capability
 *        failure).
 *   L3 — axia comparison (ONLY when >1 candidate passes L1+L2). Q3.1 kata physin ·
 *        Q3.2 fewer dispreferred indifferents · Q3.3 integrability into the
 *        orchestrator's continued examined practice.
 * It returns per candidate the L1 outcome, the four L2 fit scores, the L3 comparison
 * where applicable, and a selection recommendation. On the orchestrator's selection
 * it opens a collaboration record + sets the A9 authority boundary (a flag-gated,
 * fail-honest store seam — nothing live calls it this session; S8 wires it).
 *
 * ─── MEASURE, NOT ENFORCE ────────────────────────────────────────────────────
 * S6 computes a RECOMMENDATION; it binds no selection. The orchestrator selects; the
 * out-of-band L4 audit (S7) runs on the orchestrator's trace BEFORE the selection
 * finalizes (S6 leaves `l4AuditResult` null). ENFORCE (binding any recommendation)
 * is S11 — its own founder-walked Critical logos-gate activation. Every result
 * carries `mode: 'measure'`.
 *
 * ─── Reuse, not re-implement (KG-EX1 / PR15) ─────────────────────────────────
 * A2 domain distance + the zero-floor: evidence-weighting.ts (computeCredentialTransfer,
 * credentialCanContribute). A5 confidence tiers: confidence-tiers.ts (assessConfidence,
 * PROFILE_PRIOR_CONFIDENCE). A4 transparency: transparency-ledger.ts
 * (assessOutputExaminability). A6 presence: profiles.ts (classifyCandidatePresence,
 * ExclusionEvidence). The A9 authority boundary: collaboration-record.ts
 * (authorityBoundaryFromTask, boundaryAttenuatesOrchestrator). No new arithmetic is
 * mentor-fixed: the fit-score weights + the session-scoped discount are DERIVED
 * monotone conveniences — the mentor fixes ORDERINGS, not magnitudes — marked tunable
 * pending S9, exactly as S2/S3/S4 disclosed.
 *
 * ─── Extraction seam (injectable/flag-gated for tests) ───────────────────────
 * The pure core `runDiscernment` is fully deterministic — question generation is
 * deterministic templating from the profile fields; every L1/L2/L3 signal is
 * structural. The ONE place a profile carries free text that must be READ is the
 * L2 Q2.4 circle-alignment refinement + the A6 session-scoped examination of a
 * candidate's proposed approach. Those are resolved by an OPTIONAL injected
 * `DiscernmentExtractor` (the Sonnet Layer-1 machinery at the S8 boundary) whose
 * results are folded into the per-candidate input as pre-resolved signals; the
 * battery runs the pure core with deterministic fixtures (no live extraction).
 *
 * Pure core — no I/O, no env, no clock. The only I/O is the flag-gated,
 * fail-honest `openDiscernmentSelection` store seam (KG1) — MEASURE, never throws.
 */

import type { KatorthomaProximity, VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { ReasonDepth } from '@/lib/depth-constants'
import type { SupabaseClient } from '@supabase/supabase-js'

import { PROXIMITY_RANK } from './constants'
import { CARDINAL_VIRTUE_DOMAINS } from './types'
import {
  classifyCandidatePresence,
  type CandidateProfile,
  type CandidatePresence,
  type CredentialCoverage,
  type ExclusionEvidence,
  type FunctionType,
  type OikeiosisCircle,
  type OrchestratorProfile,
  type TaskProfile,
} from './profiles'
import {
  computeCredentialTransfer,
  credentialCanContribute,
  domainDistance,
  type DeployerDistanceThresholds,
  type FunctionTypeProfile,
} from './evidence-weighting'
import {
  assessConfidence,
  PROFILE_PRIOR_CONFIDENCE,
  type ConfidenceAssessment,
  type CorroborationState,
  type RecencyState,
  type VerdictQualityDimensions,
} from './confidence-tiers'
import {
  assessOutputExaminability,
  type IndependenceThreshold,
  type OutputExaminability,
} from './transparency-ledger'
import {
  authorityBoundaryFromTask,
  boundaryAttenuatesOrchestrator,
  newCollaborationRecord,
  type AttenuationCheck,
  type AuthorityBoundary,
  type PurposeAcknowledgement,
} from './collaboration-record'
import {
  openCollaborationRecord,
  recordAuthorityBoundary,
  recordPurposeAcknowledgement,
} from './collaboration-store'
import { isTrustCoreEnabled } from './trust-core-flag'

// ════════════════════════════════════════════════════════════════════════════
// DERIVED CONSTANTS (documented, tunable — the mentor fixes ORDERINGS + the two
// A6 postures; magnitudes not otherwise fixed are DERIVED, consistent with
// S2/S3/S4).
// ════════════════════════════════════════════════════════════════════════════

/** The live deterministic-assent floor (the standing "deliberate is the live
 *  threshold" lesson): a session-scoped examination PASSES iff the candidate's
 *  proposed-approach proximity is at least `deliberate`. Mentor-anchored (the live
 *  intervention table proceeds at deliberate), not a free knob. */
const SESSION_SCOPED_PASS_FLOOR: KatorthomaProximity = 'deliberate'

/**
 * Coverage-continuity multiplier on credential specificity (spec-3 / A3 — a gap
 * decays the weight toward the prior). DERIVED monotone (continuous > resumed-
 * unverified > suspended); tunable pending S9.
 */
const COVERAGE_CONTINUITY_FACTOR = {
  continuous: 1.0,
  'resumed-unverified': 0.7,
  suspended: 0.4,
} as const

/** L2 Q2.3 transparency → a [0,1] fit sub-score (A4 independence threshold ranking:
 *  met-full > met-reduced > not-met). DERIVED monotone. */
const TRANSPARENCY_FIT: Record<IndependenceThreshold, number> = {
  'met-full': 1.0,
  'met-reduced': 0.6,
  'not-met': 0.0,
}

/** Proximity → a [0,1] quality score (reflexive 0 … sage_like 1). DERIVED from the
 *  canonical PROXIMITY_RANK (0..4). Used to score a session-scoped exam's approach. */
function proximityScore(p: KatorthomaProximity): number {
  return PROXIMITY_RANK[p] / 4
}

/** L2 Q2.4 circle-alignment sub-scores. DERIVED: a present, non-conflicting purpose
 *  is a mild positive; a caller-flagged misalignment is a dikaiosyne RISK (reduced,
 *  never a hard fail — "a dikaiosyne risk, not a capability failure"); un-profiled /
 *  unknown is neutral. Tunable. */
const CIRCLE_ALIGN_FIT = {
  aligned: 0.85,
  unknown: 0.5,
  misaligned: 0.25,
} as const

/** L2 Q2.2 prior-interaction stability data (A9/L4 — "a prior positive interaction
 *  is DATA, not a credential", entering only at Q2.2). A small positive, then made
 *  UNABLE to dominate the condition-matched evidence by two structural guards at the
 *  call site (evaluateL2): it is scaled by the candidate's confidenceWeight AND capped
 *  at baseStability (so it can only reinforce demonstrated stability, never manufacture
 *  it from zero). The OUTCOME quality (not just the count) + any pre-formed-preference
 *  risk is S7's L4 concern; here it is bounded stability data only. DERIVED. */
const PRIOR_INTERACTION_PER = 0.05
const PRIOR_INTERACTION_CAP = 0.15

/**
 * The L2-fit BAND width for the ranking (ADR §4: "highest L2 fit, ADJUSTED by the L3
 * axia comparison where >1 qualifies"). Candidates whose fits fall in the same band
 * (`round(fit / FIT_TIE_BAND)`) are comparably fit and are decided by the L3 axia
 * signals — realising "adjusted by L3" without a vacuous exact-tie or a non-transitive
 * tolerance comparator. DERIVED (the mentor fixes that L3 adjusts among the
 * qualifying, not this width); the band boundary is arbitrary at the split, tunable
 * pending S9.
 */
const FIT_TIE_BAND = 0.05

// ════════════════════════════════════════════════════════════════════════════
// SECTION A — inputs / config
// ════════════════════════════════════════════════════════════════════════════

/**
 * The deployer's A2 taxonomy config (integration-time). The function-type weight
 * profiles are REQUIRED to compute S2 domain distance; a missing profile for the
 * task function or a credential function is an evidence gap (handled conservatively,
 * never a spurious full transfer).
 */
export interface DiscernmentDeployerConfig {
  /** Deployer-defined function type → its four-virtue-domain weight profile (A2). */
  functionTypeProfiles: Record<FunctionType, FunctionTypeProfile>
  /** The S2 zero-floor thresholds (per-dimension / total-distance). */
  distanceThresholds?: DeployerDistanceThresholds
  /**
   * The deployer-designated justice-evaluation function type (spec-2 justice
   * modifier: coverage of the justice-evaluation FUNCTION, not just the task
   * function). CONSUMED by `hasJusticeEvaluationCapacity` (L1 Q1.2) as the PRIMARY
   * justice-capacity measure — a candidate whose S2 transfer to this function
   * contributes on dikaiosyne has capacity. Optional — when absent the fallback is a
   * dikaiosyne credential whose OWN function genuinely exercises dikaiosyne (a bare
   * dikaiosyne tag on a justice-blind function does NOT count).
   */
  justiceEvaluationFunctionType?: FunctionType
  /**
   * A6 stakes override: force the task above the habitual threshold even without a
   * justice surface (the deployer classifies a high-stakes task). It can only RAISE
   * — a justice surface is ALWAYS above threshold regardless (the safe direction).
   */
  taskStakes?: 'above-habitual-threshold' | 'below-habitual-threshold'
}

/**
 * The A6 session-scoped credential — the result of a task-scoped standard-depth
 * examination of a candidate's PROPOSED APPROACH to the specific task, run before
 * eligibility is confirmed (mentor A6). "Valid for this task only, at reduced
 * confidence relative to a full credential." The examination itself is the Sonnet
 * consult machinery (S7/S8); S6 folds a supplied result. A session-scoped exam that
 * FAILS (approach below the assent floor, or a justice surface left unhandled) is
 * POSITIVE evidence the candidate cannot do this task → L1 fail (distinct from mere
 * absence, which A6 never excludes on).
 */
export interface SessionScopedCredential {
  schema: 'trust-session-scoped-credential-v1'
  /** The proximity the candidate's proposed approach demonstrated. */
  approachProximity: KatorthomaProximity
  /** Whether the approach handled the task's justice surface (only load-bearing when
   *  the task has one). */
  justiceHandled: boolean
  /** The examination's depth (A6: "a single STANDARD-depth examination"). */
  depth: ReasonDepth
  /** Whether the exam produced a signed trace (A5 signature; near-always true — the
   *  R18f-backed examination). */
  signed?: boolean
  /** The corroboration status of the exam verdict (A5). Default 'corroborated'. */
  corroboration?: CorroborationState
  /** The signed assessment ref (R18f-parallel; carried for the collaboration record). */
  assessmentRef?: string
}

/** Pre-resolved free-text signals (the extraction seam output — see
 *  `DiscernmentExtractor`). Absent ⇒ deterministic structural defaults. */
export interface ResolvedCandidateSignals {
  /** L2 Q2.4 — a semantic circle-alignment read of the candidate purpose vs the
   *  task circles. Absent ⇒ the structural default. */
  circleAlignment?: 'aligned' | 'misaligned'
  /** L2 Q2.2 — a semantic condition-match ratio in [0,1] overriding the structural
   *  set-overlap. Absent ⇒ the structural default. */
  conditionMatchOverride?: number
}

/** One candidate's discernment input. `profile: null` ⇔ un-profiled (A6). */
export interface CandidateDiscernmentInput {
  /** The candidate profile, or null (un-profiled — A6: assessed, never excluded). */
  profile: CandidateProfile | null
  /** A stable handle so the result names the candidate even when un-profiled. */
  candidateRef: string
  /** POSITIVE exclusion evidence (A6) — the ONLY thing that hard-fails L1. Absence
   *  of a profile is NOT one of these. */
  exclusionEvidence?: ExclusionEvidence | null
  /** A pre-run session-scoped examination result (A6 remediation), when available. */
  sessionScopedCredential?: SessionScopedCredential | null
  /**
   * OPTIONAL verdict quality dims for the candidate's best credential (A5). When
   * absent, a structural default is derived from coverage status (continuous ⇒
   * standard/signed/corroborated/recent = tier 2; suspended/resumed ⇒ aged = tier 4).
   */
  credentialVerdictDimensions?: VerdictQualityDimensions
  /** Pre-resolved free-text signals from the extraction seam (absent ⇒ structural). */
  resolvedSignals?: ResolvedCandidateSignals
}

export interface DiscernmentInput {
  task: TaskProfile
  candidates: CandidateDiscernmentInput[]
  orchestrator: OrchestratorProfile
  deployer: DiscernmentDeployerConfig
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION B — L1 honestum gate
// ════════════════════════════════════════════════════════════════════════════

/** The L1 gate is a THREE-state threshold (A6 is explicitly three-way): a failure
 *  excludes on POSITIVE evidence; an above-threshold under-covered candidate is
 *  routed to the session-scoped examination (not-yet-eligible, never failed); every
 *  other candidate is eligible (a profiled candidate, or an un-profiled candidate on
 *  a below-threshold task assessed on prior). */
export type L1Outcome = 'pass' | 'fail' | 'requires-session-scoped-examination'

/** How an eligible candidate's evidence is being read (A6). */
export type L1Posture =
  | 'profiled-credentialed' // profiled, role-aligned, contributing credential
  | 'session-scoped' // eligible via a supplied session-scoped credential (reduced confidence)
  | 'assess-on-prior-tier7' // A6: un-profiled / under-covered on a below-threshold task

export interface L1Result {
  outcome: L1Outcome
  posture: L1Posture | null // null when outcome is fail / requires-exam
  presence: CandidatePresence
  /** Q1.1 — role alignment (declared function-type match). null ⇔ un-profiled (unknown). */
  roleAligned: boolean | null
  /** Q1.2 — a mandatory L3 justice branch is required (the task has a non-consenting
   *  party in scope). */
  justiceBranchMandatory: boolean
  /** Q1.2 — the candidate shows justice-evaluation capacity (dikaiosyne coverage /
   *  performance, or the session-scoped exam handled the surface). */
  justiceEvaluationCapacity: boolean
  /** Q1.3 — at least one credential contributes on a task-required domain (S2 A2). */
  hasContributingCredential: boolean
  /** A6: the independence-principle flag is active for this candidate's duration
   *  (an un-profiled / under-covered assess-on-prior candidate). */
  independenceFlagActive: boolean
  /** True when the task is at/above the A6 habitual threshold (justice surface or
   *  explicit high stakes). */
  taskAboveHabitualThreshold: boolean
  /** When outcome is requires-session-scoped-examination: what the exam must
   *  establish. */
  examMustEstablish: string[]
  /** The A5 confidence the eligible candidate is assessed at. */
  confidence: ConfidenceAssessment
  reason: string
}

/** A6 stakes: the task is at/above the habitual threshold ⇔ it has a justice surface
 *  OR the deployer explicitly marked it above (a justice surface can NEVER be
 *  downgraded — the safe, asymmetric direction). Mentor A6: below-threshold ⇔ "the
 *  intervention table produces log-and-continue at deliberate proximity" (⇔ no
 *  justice surface); above-threshold ⇔ "a pause-and-examine verdict is possible". */
export function taskAtOrAboveHabitualThreshold(
  task: TaskProfile,
  deployer: DiscernmentDeployerConfig,
): boolean {
  if (task.justiceSurface.present) return true
  return deployer.taskStakes === 'above-habitual-threshold'
}

/** The cardinal domains the task's function type exercises (deployer weight > 0). An
 *  unknown function profile ⇒ empty (an evidence gap the caller sees). */
function taskRequiredDomains(
  task: TaskProfile,
  deployer: DiscernmentDeployerConfig,
): VirtueDomain[] {
  const profile = deployer.functionTypeProfiles[task.functionType]
  if (!profile) return []
  return CARDINAL_VIRTUE_DOMAINS.filter((d) => (profile.domainWeights[d] ?? 0) > 0)
}

/** Q1.3 — which of the candidate's credentials CONTRIBUTE (S2 A2, non-zeroed) on a
 *  task-required domain? Returns the CONTRIBUTING credential set (so every downstream
 *  derivation — confidence, coverage continuity, kata-physin — is scoped to real
 *  evidence and an A2-zeroed credential can never leak past the floor) + the best
 *  per-domain transfer for L2 specificity. */
function credentialContribution(
  profile: CandidateProfile,
  task: TaskProfile,
  deployer: DiscernmentDeployerConfig,
): { contributes: boolean; bestTransferFactor: number; contributingCredentials: CredentialCoverage[] } {
  const taskFn = deployer.functionTypeProfiles[task.functionType]
  const required = taskRequiredDomains(task, deployer)
  if (!taskFn || required.length === 0) {
    return { contributes: false, bestTransferFactor: 0, contributingCredentials: [] }
  }
  const contributingCredentials: CredentialCoverage[] = []
  let bestTransferFactor = 0
  for (const cred of profile.credentialCoverage) {
    const credFn = deployer.functionTypeProfiles[cred.functionType]
    if (!credFn) continue // unknown credential function — no transfer computable
    const transfer = computeCredentialTransfer(credFn, taskFn, deployer.distanceThresholds)
    let credContributes = false
    for (const d of required) {
      if (credentialCanContribute(transfer, d)) {
        credContributes = true
        const f = transfer.perDomain[d]?.factor ?? 0
        if (f > bestTransferFactor) bestTransferFactor = f
      }
    }
    if (credContributes) contributingCredentials.push(cred)
  }
  return { contributes: contributingCredentials.length > 0, bestTransferFactor, contributingCredentials }
}

/**
 * Q1.2 — does the candidate's PROFILE show capacity to flag/evaluate justice
 * dimensions (mentor A9 case-1 + the spec-2 justice-surface modifier)? Conservative
 * in the PASS-requiring direction (a false "no capacity" only over-requires the A6
 * session-scoped exam — the safe direction; a false "capacity" would let a
 * no-real-capacity candidate skip the exam — the unsafe direction A9 case-1 exists to
 * prevent). REQUIRES CONTRIBUTING justice evidence, not a bare `domain==='dikaiosyne'`
 * tag (which the S2 A2 floor may have zeroed):
 *   - PRIMARY (spec-2, when the deployer names the justice-evaluation function type):
 *     a credential whose S2 transfer to that function CONTRIBUTES on dikaiosyne — the
 *     mentor's "coverage of the justice-evaluation FUNCTION, not just the task
 *     function" (this also covers the justice-surface-via-context case where the task
 *     function itself carries no dikaiosyne weight);
 *   - FALLBACK (no named justice function): a dikaiosyne-domain credential earned in a
 *     function that GENUINELY exercises dikaiosyne (credFn.domainWeights.dikaiosyne >
 *     0) — closing the fail-open where a dikaiosyne tag sits on a function that never
 *     touched justice (e.g. an ops-automation credential with dikaiosyne weight 0);
 *   - BEHAVIOURAL: a demonstrated dikaiosyne performance at or above the assent floor
 *     (a justice-failing performance is NOT capacity).
 */
function hasJusticeEvaluationCapacity(
  profile: CandidateProfile,
  deployer: DiscernmentDeployerConfig,
): boolean {
  const jef = deployer.justiceEvaluationFunctionType
  const jefProfile = jef ? deployer.functionTypeProfiles[jef] : undefined
  // PRIMARY — spec-2: coverage of the deployer-named justice-evaluation FUNCTION.
  if (jefProfile) {
    for (const c of profile.credentialCoverage) {
      const credFn = deployer.functionTypeProfiles[c.functionType]
      if (!credFn) continue
      const transfer = computeCredentialTransfer(credFn, jefProfile, deployer.distanceThresholds)
      if (credentialCanContribute(transfer, 'dikaiosyne')) return true
    }
  }
  // FALLBACK — a dikaiosyne credential whose OWN function genuinely exercised
  // dikaiosyne (not a bare tag on a justice-blind function).
  for (const c of profile.credentialCoverage) {
    if (c.domain !== 'dikaiosyne') continue
    const credFn = deployer.functionTypeProfiles[c.functionType]
    if (credFn && (credFn.domainWeights.dikaiosyne ?? 0) > 0) return true
  }
  // BEHAVIOURAL — a demonstrated dikaiosyne outcome at/above the assent floor.
  for (const p of profile.performanceHistory ?? []) {
    if (p.domain === 'dikaiosyne' && PROXIMITY_RANK[p.proximity] >= PROXIMITY_RANK[SESSION_SCOPED_PASS_FLOOR]) {
      return true
    }
  }
  return false
}

/** The candidate's A5 evidence confidence, derived over the CONTRIBUTING credentials
 *  ONLY (so an A2-zeroed continuous credential can never upgrade recency/confidence —
 *  the S6-REUSE-1 fix). Uses supplied verdict dims when present; an empty contributing
 *  set ⇒ the profile prior (tier 7). */
function profiledCredentialConfidence(
  contributingCredentials: CredentialCoverage[],
  supplied?: VerdictQualityDimensions,
): ConfidenceAssessment {
  if (supplied) return assessConfidence(supplied)
  if (contributingCredentials.length === 0) return PROFILE_PRIOR_CONFIDENCE
  const anyContinuous = contributingCredentials.some((c) => c.coverageStatus === 'continuous')
  const recency: RecencyState = anyContinuous ? 'recent' : 'aged'
  // A credential is a signed, corroborated examination of at least standard depth
  // (the R18f-backed live assessment). Depth 'standard' ⇒ tier 2 when recent, tier 4
  // when aged — reduced when coverage lapsed (spec-3 / A3). Conservative default.
  return assessConfidence({
    depth: 'standard',
    signature: 'signed',
    corroboration: 'corroborated',
    recency,
  })
}

/** The A5 confidence of a session-scoped credential (A6: reduced relative to a full
 *  credential). Its dims are the exam's own (standard depth by A6; signed +
 *  corroborated by default). A standard-depth signed corroborated recent exam is A5
 *  tier 2 — naturally "reduced relative to a full [deep, tier-1] credential". */
function sessionScopedConfidence(ssc: SessionScopedCredential): ConfidenceAssessment {
  return assessConfidence({
    depth: ssc.depth,
    signature: ssc.signed === false ? 'unsigned' : 'signed',
    corroboration: ssc.corroboration ?? 'corroborated',
    recency: 'recent',
  })
}

/** Whether a supplied session-scoped exam PASSED (mentor A6: the exam of the
 *  candidate's proposed approach). Passes iff the approach reached the assent floor
 *  AND (no justice surface OR the surface was handled). A fail is POSITIVE evidence
 *  the candidate cannot do this task. */
function sessionScopedPassed(ssc: SessionScopedCredential, task: TaskProfile): boolean {
  const meetsFloor = PROXIMITY_RANK[ssc.approachProximity] >= PROXIMITY_RANK[SESSION_SCOPED_PASS_FLOOR]
  const justiceOk = !task.justiceSurface.present || ssc.justiceHandled
  return meetsFloor && justiceOk
}

/** Run the L1 honestum gate for one candidate (mentor A6 + ADR §4 Q1.1–Q1.3). Pure. */
export function evaluateL1(
  task: TaskProfile,
  input: CandidateDiscernmentInput,
  deployer: DiscernmentDeployerConfig,
): L1Result {
  const presence = classifyCandidatePresence(input.profile)
  const aboveThreshold = taskAtOrAboveHabitualThreshold(task, deployer)
  const justiceBranchMandatory = task.justiceSurface.present

  const baseFields = {
    presence,
    justiceBranchMandatory,
    taskAboveHabitualThreshold: aboveThreshold,
    examMustEstablish: [] as string[],
  }

  // 1. POSITIVE exclusion evidence is the ONLY hard fail (mentor A6). Absence of a
  //    profile is never one of these.
  if (input.exclusionEvidence) {
    return {
      ...baseFields,
      outcome: 'fail',
      posture: null,
      roleAligned: presence.profiled ? capabilityScopeIncludes(input.profile!, task.functionType) : null,
      justiceEvaluationCapacity: presence.profiled ? hasJusticeEvaluationCapacity(input.profile!, deployer) : false,
      hasContributingCredential: false,
      independenceFlagActive: false,
      confidence: PROFILE_PRIOR_CONFIDENCE,
      reason: `L1 EXCLUDE on positive evidence: ${input.exclusionEvidence} (mentor A6 — the only L1 exclusion; absence is never one)`,
    }
  }

  // 2. A supplied session-scoped exam that FAILED is positive evidence → fail (A6).
  const ssc = input.sessionScopedCredential ?? null
  if (ssc && !sessionScopedPassed(ssc, task)) {
    return {
      ...baseFields,
      outcome: 'fail',
      posture: null,
      roleAligned: presence.profiled ? capabilityScopeIncludes(input.profile!, task.functionType) : null,
      justiceEvaluationCapacity: false,
      hasContributingCredential: false,
      independenceFlagActive: false,
      confidence: sessionScopedConfidence(ssc),
      reason:
        `L1 EXCLUDE: the session-scoped examination of the candidate's proposed approach failed ` +
        `(approach '${ssc.approachProximity}'${task.justiceSurface.present ? `, justiceHandled=${ssc.justiceHandled}` : ''}) — ` +
        `POSITIVE evidence the candidate cannot do this task (A6, distinct from mere absence)`,
    }
  }

  // Structural signals (profiled candidates only).
  const roleAligned = presence.profiled
    ? capabilityScopeIncludes(input.profile!, task.functionType)
    : null
  const contribution = presence.profiled
    ? credentialContribution(input.profile!, task, deployer)
    : { contributes: false, bestTransferFactor: 0, contributingCredentials: [] as CredentialCoverage[] }
  const profiledJusticeCapacity = presence.profiled
    ? hasJusticeEvaluationCapacity(input.profile!, deployer)
    : false

  // 3. PROFILED ADEQUACY takes precedence (checked BEFORE any session-scoped fold, so a
  //    supplied exam never DOWNGRADES an already-adequate profiled candidate). Adequate ⇔
  //    profiled + role-aligned + a contributing credential + (justice-evaluation capacity
  //    IFF a justice surface is present — mandatory only when the branch is mandatory).
  //    Uniform across the threshold: below-threshold has no justice surface, so the
  //    justice clause is vacuously satisfied there.
  const justiceOk = !justiceBranchMandatory || profiledJusticeCapacity
  const adequate = presence.profiled && roleAligned === true && contribution.contributes && justiceOk
  if (adequate) {
    return {
      ...baseFields,
      outcome: 'pass',
      posture: 'profiled-credentialed',
      roleAligned,
      justiceEvaluationCapacity: profiledJusticeCapacity,
      hasContributingCredential: true,
      independenceFlagActive: false,
      confidence: profiledCredentialConfidence(contribution.contributingCredentials, input.credentialVerdictDimensions),
      reason:
        `L1 PASS: profiled, role-aligned, with a contributing credential on the task's required ` +
        `domain(s)${justiceBranchMandatory ? ` and justice-evaluation capacity for the justice surface` : ''} ` +
        `(${aboveThreshold ? 'above' : 'below'} the habitual threshold)`,
    }
  }

  // 4. A supplied, PASSED session-scoped credential makes an under-covered / un-profiled
  //    candidate eligible at the session-scoped (reduced) confidence — the A6 remediation
  //    completed. The exam is task-scoped, so a pass on a justice-surface task establishes
  //    task-scoped justice handling.
  if (ssc) {
    return {
      ...baseFields,
      outcome: 'pass',
      posture: 'session-scoped',
      roleAligned,
      justiceEvaluationCapacity: !task.justiceSurface.present || ssc.justiceHandled,
      hasContributingCredential: contribution.contributes,
      independenceFlagActive: true, // reduced confidence marked (A6)
      confidence: sessionScopedConfidence(ssc),
      reason:
        `L1 PASS via a session-scoped examination (A6): the candidate's proposed approach reached ` +
        `'${ssc.approachProximity}'${task.justiceSurface.present ? ` and handled the justice surface` : ''} — ` +
        `eligible for THIS task only, at reduced (session-scoped) confidence`,
    }
  }

  // 5. Above the habitual threshold + not adequate + no session-scoped credential →
  //    require a task-scoped standard-depth examination first (A6). NOT a failure
  //    (absence is not positive evidence).
  if (aboveThreshold) {
    const gaps: string[] = []
    if (!presence.profiled) gaps.push('no profile (un-profiled candidate)')
    if (presence.profiled && roleAligned === false) gaps.push('declared capability scope does not include the task function type (role alignment)')
    if (presence.profiled && !contribution.contributes) gaps.push('no credential contributes on a task-required domain (S2 A2 domain distance)')
    if (justiceBranchMandatory && !profiledJusticeCapacity) gaps.push('no justice-evaluation capacity for the task justice surface')
    return {
      ...baseFields,
      outcome: 'requires-session-scoped-examination',
      posture: null,
      roleAligned,
      justiceEvaluationCapacity: profiledJusticeCapacity,
      hasContributingCredential: contribution.contributes,
      independenceFlagActive: true,
      confidence: presence.profiled
        ? profiledCredentialConfidence(contribution.contributingCredentials, input.credentialVerdictDimensions)
        : PROFILE_PRIOR_CONFIDENCE,
      examMustEstablish: gaps,
      reason:
        `L1 requires a task-scoped standard-depth examination before eligibility (mentor A6, ` +
        `above the habitual threshold): ${gaps.join('; ')} — NOT excluded (absence is not positive evidence)`,
    }
  }

  // 6. Below the habitual threshold, not adequate, no session-scoped credential: an
  //    un-profiled / under-covered candidate may proceed on profile prior at tier-7 with
  //    the independence-principle flag active (mentor A6). Never excluded on absence.
  return {
    ...baseFields,
    outcome: 'pass',
    posture: 'assess-on-prior-tier7',
    roleAligned,
    justiceEvaluationCapacity: profiledJusticeCapacity,
    hasContributingCredential: contribution.contributes,
    independenceFlagActive: true,
    confidence: PROFILE_PRIOR_CONFIDENCE,
    reason:
      `L1 PASS on profile prior at tier-7 confidence with the independence-principle flag active ` +
      `(mentor A6 — below the habitual threshold; ${presence.profiled ? 'under-covered profile' : 'un-profiled'}; ` +
      `assessed, never excluded)`,
  }
}

/** Q1.1 — declared role/capability alignment (a DECLARATION match, R18d — not
 *  capacity evidence; capacity is Q1.3). Aligned ⇔ the task function type is in the
 *  candidate's declared capabilityScope. */
function capabilityScopeIncludes(profile: CandidateProfile, functionType: FunctionType): boolean {
  return profile.capabilityScope.includes(functionType)
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION C — L2 role/task fit (four dimensions; not pass/fail)
// ════════════════════════════════════════════════════════════════════════════

export interface L2Fit {
  /** Q2.1 — specificity of capability (transfer × confidence × coverage continuity). */
  specificity: number
  /** Q2.2 — stability under the task's actual conditions (+ bounded prior-interaction
   *  data; A9/L4 enters HERE, never before L1). */
  stability: number
  /** Q2.3 — transparency of reasoning (S4 A4 independence threshold). */
  transparency: number
  /** Q2.4 — circle alignment (a dikaiosyne risk when misaligned, not a capability
   *  failure). */
  circleAlignment: number
  /** The four-dimension aggregate fit (DERIVED mean; the mentor fixes the four
   *  dimensions + that it is a fit score, not the weighting). */
  fit: number
  /** The weakest of the four dimensions (surfaced; the tie-break for the ranking). */
  minDim: number
  /** Q2.3 detail — the A4 examinability grade of the candidate's outputs. */
  independence: IndependenceThreshold
  /** True ⇔ a dikaiosyne risk from circle misalignment (Q2.4). */
  circleMisalignmentRisk: boolean
  basis: string
}

/** Map an OutputFormatDescriptor (S5) to the S4 transparency-ledger OutputFeatures. */
function outputFeaturesOf(profile: CandidateProfile): OutputExaminability {
  return assessOutputExaminability({
    hasSignedTrace: profile.outputFormat.emitsSignedTrace,
    hasStructuredVerdict: profile.outputFormat.emitsStructuredVerdict,
    hasStatedUncertainty: profile.outputFormat.statesUncertainty,
  })
}

/** Structural condition-match: fraction of the task's conditions covered by a
 *  performance record whose conditions overlap. 0 when no performance history. A
 *  caller-supplied `conditionMatchOverride` (the extraction seam) replaces it. */
function conditionMatchScore(profile: CandidateProfile, task: TaskProfile): number {
  const perf = profile.performanceHistory ?? []
  if (task.conditions.length === 0) return perf.length > 0 ? 1 : 0
  const matchedConditions = task.conditions.filter((cond) =>
    perf.some((p) => (p.conditions ?? []).includes(cond)),
  )
  return matchedConditions.length / task.conditions.length
}

/** Evaluate L2 fit for an L1-eligible candidate. Pure. */
export function evaluateL2(
  task: TaskProfile,
  input: CandidateDiscernmentInput,
  l1: L1Result,
  deployer: DiscernmentDeployerConfig,
): L2Fit {
  const profile = input.profile
  const confidenceWeight = l1.confidence.weight
  const signals = input.resolvedSignals ?? {}

  // ── Q2.1 specificity ──────────────────────────────────────────────────────
  let specificity: number
  if (l1.posture === 'session-scoped' && input.sessionScopedCredential) {
    // The task-scoped exam is maximally specific to the task, discounted by the
    // session-scoped (reduced) confidence.
    specificity = proximityScore(input.sessionScopedCredential.approachProximity) * confidenceWeight
  } else if (profile && l1.posture === 'profiled-credentialed') {
    const contribution = credentialContribution(profile, task, deployer)
    // Coverage continuity over the CONTRIBUTING credentials only (a zeroed continuous
    // credential must not inflate specificity — the S6-REUSE-1 fix).
    const coverage = bestCoverageContinuity(contribution.contributingCredentials)
    specificity = contribution.bestTransferFactor * confidenceWeight * coverage
  } else {
    // assess-on-prior (un-profiled / under-covered) → the tier-7 prior baseline.
    specificity = confidenceWeight // PROFILE_PRIOR_CONFIDENCE.weight (0.1)
  }

  // ── Q2.2 stability under the task's actual conditions ──────────────────────
  let baseStability: number
  if (l1.posture === 'session-scoped' && input.sessionScopedCredential) {
    baseStability = proximityScore(input.sessionScopedCredential.approachProximity) * confidenceWeight
  } else if (profile) {
    const structural = signals.conditionMatchOverride ?? conditionMatchScore(profile, task)
    baseStability = structural * confidenceWeight
  } else {
    baseStability = confidenceWeight // prior baseline
  }
  // A9/L4: a prior-interaction record is DATA (bounded), entering ONLY at Q2.2. Two
  // structural guards so it can NEVER dominate (the exact pre-formed-preference bias
  // A9/L4 warns against): (1) scaled by the SAME confidenceWeight the condition-matched
  // evidence carries (a low-confidence posture shrinks it); (2) capped at baseStability,
  // so it can only REINFORCE demonstrated stability, never MANUFACTURE it from zero
  // condition-matched evidence (the S6-L2-1 fix). The interaction count is NaN-guarded.
  const rawInteractions = profile?.priorInteraction && Number.isFinite(profile.priorInteraction.interactions)
    ? Math.max(0, profile.priorInteraction.interactions)
    : 0
  const priorBonus = Math.min(
    Math.min(PRIOR_INTERACTION_CAP, rawInteractions * PRIOR_INTERACTION_PER) * confidenceWeight,
    baseStability,
  )
  const stability = clamp01(baseStability + priorBonus)

  // ── Q2.3 transparency of reasoning (S4 A4) ─────────────────────────────────
  let independence: IndependenceThreshold
  if (l1.posture === 'session-scoped' && input.sessionScopedCredential) {
    // The exam produced a signed trace (unless explicitly unsigned).
    independence = input.sessionScopedCredential.signed === false ? 'not-met' : 'met-full'
  } else if (profile) {
    independence = outputFeaturesOf(profile).independence
  } else {
    independence = 'not-met' // un-profiled — no known output shape
  }
  // Transparency is a property of the OUTPUT shape (A4): a signed trace is met-full,
  // a bare conclusion not-met — regardless of evidence confidence. Not re-discounted.
  const transparency = TRANSPARENCY_FIT[independence]

  // ── Q2.4 circle alignment (a dikaiosyne risk when misaligned) ──────────────
  let alignKey: keyof typeof CIRCLE_ALIGN_FIT
  if (signals.circleAlignment === 'aligned') alignKey = 'aligned'
  else if (signals.circleAlignment === 'misaligned') alignKey = 'misaligned'
  else if (profile && profile.purpose.trim() !== '') alignKey = 'aligned' // structural: purpose present, no flagged conflict
  else alignKey = 'unknown' // un-profiled / no purpose
  const circleAlignment = CIRCLE_ALIGN_FIT[alignKey]
  const circleMisalignmentRisk = alignKey === 'misaligned'

  const dims = [specificity, stability, transparency, circleAlignment]
  const fit = dims.reduce((a, b) => a + b, 0) / dims.length
  const minDim = Math.min(...dims)

  return {
    specificity: clamp01(specificity),
    stability: clamp01(stability),
    transparency: clamp01(transparency),
    circleAlignment,
    fit: clamp01(fit),
    minDim: clamp01(minDim),
    independence,
    circleMisalignmentRisk,
    basis:
      `L2 fit ${round2(fit)} = mean(specificity ${round2(specificity)}, stability ${round2(stability)}, ` +
      `transparency ${round2(transparency)} [${independence}], circle ${round2(circleAlignment)}` +
      `${circleMisalignmentRisk ? ' — dikaiosyne risk (purpose misaligned)' : ''})`,
  }
}

function bestCoverageContinuity(credentials: CredentialCoverage[]): number {
  let best = 0
  for (const c of credentials) {
    const f = COVERAGE_CONTINUITY_FACTOR[c.coverageStatus] ?? 0
    if (f > best) best = f
  }
  return best
}

/** clamp to [0,1], NaN-safe (a non-finite input → 0 — never propagates a NaN into the
 *  fit / ranking; the S6-L2-3 fold). */
function clamp01(x: number): number {
  return Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0
}
function round2(x: number): number {
  return Math.round(x * 100) / 100
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION D — L3 axia comparison (only when >1 candidate passes L1+L2)
// ════════════════════════════════════════════════════════════════════════════

/** The L3 comparison signals for one L1+L2-eligible candidate (mentor Q3.1–Q3.3). */
export interface L3Signals {
  /** Q3.1 — kata physin: the smallest domain distance from a contributing credential
   *  function to the task function (lower = more natural fit). null ⇔ no computable
   *  credential (un-profiled / session-scoped). */
  kataPhysinDistance: number | null
  /** Q3.2 — the count of dispreferred indifferents the candidate introduces (fewer =
   *  better): independence deficit, circle-misalignment risk, reduced (session-scoped
   *  / prior) confidence. */
  dispreferredCount: number
  /** Q3.3 — integrability: the A4 independence grade rank (met-full 2 > met-reduced 1
   *  > not-met 0; higher = more integrable into continued examined practice). */
  integrabilityRank: number
}

const INTEGRABILITY_RANK: Record<IndependenceThreshold, number> = {
  'met-full': 2,
  'met-reduced': 1,
  'not-met': 0,
}

/** Compute the L3 axia signals for one eligible candidate. Pure. */
export function computeL3Signals(
  task: TaskProfile,
  input: CandidateDiscernmentInput,
  l1: L1Result,
  l2: L2Fit,
  deployer: DiscernmentDeployerConfig,
): L3Signals {
  // Q3.1 kata physin — smallest distance from a CONTRIBUTING credential to the task.
  // Only contributing (non-A2-zeroed) credentials count: a zeroed credential is "no
  // credential" (A2), and its distance can be SMALLER than a contributing one's, so
  // including it would let a zeroed credential win the tie-break (the S6-L3-KATAPHYSIN-01
  // fix). The 'profiled-credentialed' posture guarantees ≥1 contributing credential.
  let kataPhysinDistance: number | null = null
  const taskFn = deployer.functionTypeProfiles[task.functionType]
  if (input.profile && taskFn && l1.posture === 'profiled-credentialed') {
    const { contributingCredentials } = credentialContribution(input.profile, task, deployer)
    for (const cred of contributingCredentials) {
      const credFn = deployer.functionTypeProfiles[cred.functionType]
      if (!credFn) continue
      const dist = domainDistance(credFn, taskFn)
      if (kataPhysinDistance === null || dist < kataPhysinDistance) kataPhysinDistance = dist
    }
  }

  // Q3.2 fewer dispreferred indifferents.
  let dispreferredCount = 0
  if (l2.independence === 'not-met') dispreferredCount++
  if (l2.circleMisalignmentRisk) dispreferredCount++
  if (l1.posture !== 'profiled-credentialed') dispreferredCount++ // reduced-confidence posture

  return {
    kataPhysinDistance,
    dispreferredCount,
    integrabilityRank: INTEGRABILITY_RANK[l2.independence],
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION E — the discernment result + the recommendation
// ════════════════════════════════════════════════════════════════════════════

export interface CandidateDiscernmentResult {
  candidateRef: string
  candidateAgentId: string | null
  l1: L1Result
  /** L2 fit — present iff the candidate passed L1 (eligible). */
  l2: L2Fit | null
  /** L3 signals — present iff >1 candidate passed L1+L2 (the comparison ran). */
  l3: L3Signals | null
  /** True ⇔ L1 outcome 'pass' (selectable). */
  eligible: boolean
  /** True ⇔ L1 requires a session-scoped examination first (not-yet-eligible). */
  requiresSessionScopedExamination: boolean
  independenceFlagActive: boolean
}

export interface SelectionRecommendation {
  /** The recommended candidate (highest L2 fit among the L1 passers, L3-adjusted), or
   *  null when none is eligible. The orchestrator SELECTS — this is advisory. */
  recommendedAgentRef: string | null
  recommendedAgentId: string | null
  /** Candidates that must complete a session-scoped examination before they could be
   *  considered (A6) — surfaced, not silently dropped. */
  mustExamineFirst: string[]
  /** True ⇔ no candidate is currently eligible (some may become eligible after a
   *  session-scoped examination — see mustExamineFirst). */
  noEligibleCandidate: boolean
  reason: string
}

/** The L4 seam — the out-of-band passion audit (S7) runs on the orchestrator's trace
 *  BEFORE the selection finalizes; S6 leaves it pending + `l4_audit_result` null. */
export interface L4Seam {
  pending: true
  note: string
}

export interface DiscernmentResult {
  schema: 'trust-discernment-result-v1'
  perCandidate: CandidateDiscernmentResult[]
  recommendation: SelectionRecommendation
  /** ADR §4 — a non-consenting party in scope makes the L3 justice branch mandatory. */
  mandatoryL3JusticeBranch: boolean
  /** True ⇔ the L3 axia comparison ran (>1 candidate passed L1+L2). */
  l3Applied: boolean
  /** The A9 authority boundary that WOULD be set at selection (action scope = the
   *  task function type; circle scope = the task circles; never the orchestrator's
   *  ceiling). Set at `openDiscernmentSelection`. */
  authorityBoundary: AuthorityBoundary
  /** The A9 attenuation check against the orchestrator (a task circle beyond the
   *  orchestrator's extension is an anomaly — do not silently proceed). */
  attenuation: AttenuationCheck
  /** The L4 seam (S7). */
  l4: L4Seam
  /** MEASURE invariant — the result is advisory; nothing binds (ENFORCE is S11). */
  mode: 'measure'
  basis: string
}

/**
 * Run the four-layer discernment protocol (L1–L3) for a task, a set of candidates,
 * and the orchestrator (mentor's discernment protocol + A6). Pure + deterministic.
 * MEASURE — the result is a RECOMMENDATION; the orchestrator selects, and the
 * out-of-band L4 audit (S7) runs before the selection finalizes.
 */
export function runDiscernment(input: DiscernmentInput): DiscernmentResult {
  const { task, candidates, orchestrator, deployer } = input

  // L1 + L2 per candidate.
  const preliminary = candidates.map((c) => {
    const l1 = evaluateL1(task, c, deployer)
    const l2 = l1.outcome === 'pass' ? evaluateL2(task, c, l1, deployer) : null
    return { input: c, l1, l2 }
  })

  const eligible = preliminary.filter((p) => p.l1.outcome === 'pass' && p.l2 !== null)
  const l3Applied = eligible.length > 1

  // L3 per eligible candidate (only when >1 passes — the comparison stage).
  const l3ByRef = new Map<string, L3Signals>()
  if (l3Applied) {
    for (const p of eligible) {
      l3ByRef.set(p.input.candidateRef, computeL3Signals(task, p.input, p.l1, p.l2!, deployer))
    }
  }

  // The ranking key (deterministic + transitive): the L2 fit BAND is primary — "the
  // highest four-dimension L2 fit ... ADJUSTED by the L3 axia comparison where more
  // than one qualifies" (ADR §4). Quantizing the fit to bands (rather than an
  // exact-equality tie-break, which never fires on floats — a vacuous L3 — or a raw
  // tolerance band, which would be NON-transitive) makes L3 a GENUINE near-tie
  // adjuster while staying a proper total order: candidates in the same fit band are
  // decided by the L3 axia signals (Q3.1 kata physin ↑, Q3.2 fewer dispreferred ↑,
  // Q3.3 integrability ↓), then by raw fit, then by candidateRef.
  const ranked = [...eligible].sort((a, b) => {
    const ba = Math.round(a.l2!.fit / FIT_TIE_BAND)
    const bb = Math.round(b.l2!.fit / FIT_TIE_BAND)
    if (ba !== bb) return bb - ba // higher fit band first (a clear fit winner)
    if (l3Applied) {
      const la = l3ByRef.get(a.input.candidateRef)!
      const lb = l3ByRef.get(b.input.candidateRef)!
      // Q3.1 kata physin — smaller distance is more natural (null sorts last).
      const da = la.kataPhysinDistance ?? Number.POSITIVE_INFINITY
      const db = lb.kataPhysinDistance ?? Number.POSITIVE_INFINITY
      if (da !== db) return da - db
      // Q3.2 fewer dispreferred indifferents.
      if (la.dispreferredCount !== lb.dispreferredCount) return la.dispreferredCount - lb.dispreferredCount
      // Q3.3 more integrable.
      if (lb.integrabilityRank !== la.integrabilityRank) return lb.integrabilityRank - la.integrabilityRank
    }
    if (b.l2!.fit !== a.l2!.fit) return b.l2!.fit - a.l2!.fit // raw fit within the band / when L3 is tied
    return a.input.candidateRef.localeCompare(b.input.candidateRef) // deterministic final
  })

  const perCandidate: CandidateDiscernmentResult[] = preliminary.map((p) => ({
    candidateRef: p.input.candidateRef,
    candidateAgentId: p.input.profile?.agentId ?? null,
    l1: p.l1,
    l2: p.l2,
    l3: l3ByRef.get(p.input.candidateRef) ?? null,
    eligible: p.l1.outcome === 'pass',
    requiresSessionScopedExamination: p.l1.outcome === 'requires-session-scoped-examination',
    independenceFlagActive: p.l1.independenceFlagActive,
  }))

  const mustExamineFirst = preliminary
    .filter((p) => p.l1.outcome === 'requires-session-scoped-examination')
    .map((p) => p.input.candidateRef)

  const winner = ranked[0] ?? null
  const recommendation: SelectionRecommendation = {
    recommendedAgentRef: winner?.input.candidateRef ?? null,
    recommendedAgentId: winner?.input.profile?.agentId ?? null,
    mustExamineFirst,
    noEligibleCandidate: winner === null,
    reason: winner
      ? `recommend '${winner.input.candidateRef}' — highest four-dimension L2 fit ${round2(winner.l2!.fit)} among ${eligible.length} L1 passer(s)` +
        (l3Applied ? `, L3 axia-adjusted` : '') +
        (mustExamineFirst.length ? `; ${mustExamineFirst.length} candidate(s) require a session-scoped examination first (A6)` : '')
      : mustExamineFirst.length
        ? `no candidate is currently eligible — ${mustExamineFirst.length} require(s) a session-scoped examination first (A6), which may yield an eligible candidate`
        : `no candidate is eligible (all excluded on positive evidence, or none passed the honestum gate)`,
  }

  const authorityBoundary = authorityBoundaryFromTask(task)
  const attenuation = boundaryAttenuatesOrchestrator(authorityBoundary, orchestrator)

  return {
    schema: 'trust-discernment-result-v1',
    perCandidate,
    recommendation,
    mandatoryL3JusticeBranch: task.justiceSurface.present,
    l3Applied,
    authorityBoundary,
    attenuation,
    l4: {
      pending: true,
      note:
        'the out-of-band L4 passion audit (S7) runs on the ORCHESTRATOR\'s reasoning trace, extracted ' +
        'by the deterministic engine, BEFORE the selection finalizes (mentor A7); S6 leaves l4_audit_result null',
    },
    mode: 'measure',
    basis:
      `discernment over ${candidates.length} candidate(s): ${eligible.length} eligible, ` +
      `${mustExamineFirst.length} require session-scoped examination; ` +
      `${l3Applied ? 'L3 axia comparison applied' : 'single/no eligible — no L3'}; ` +
      `${task.justiceSurface.present ? 'mandatory L3 justice branch' : 'no justice surface'}` +
      `${attenuation.attenuates ? '' : ' — A9 ATTENUATION ANOMALY (task circle beyond the orchestrator)'}`,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION F — the extraction seam (injectable/flag-gated; the battery runs pure)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The OPTIONAL extraction interface for the narrow free-text-reading refinements
 * (L2 Q2.4 circle alignment; L2 Q2.2 condition matching). Implemented by the S8
 * boundary with the Sonnet Layer-1 machinery; the battery injects a deterministic
 * fake or omits it entirely (⇒ the structural defaults). Never called by the pure
 * core.
 */
export interface DiscernmentExtractor {
  /** Read the candidate's purpose against the task circles (L2 Q2.4). */
  assessCircleAlignment(args: {
    candidatePurpose: string
    taskCircles: OikeiosisCircle[]
  }): Promise<{ alignment: 'aligned' | 'misaligned'; note?: string }>
  /** Read the candidate's condition coverage against the task conditions (L2 Q2.2). */
  assessConditionMatch?(args: {
    candidateConditions: string[]
    taskConditions: string[]
  }): Promise<{ matchRatio: number }>
}

/**
 * Resolve the free-text signals for each candidate via the injected extractor, then
 * run the pure deterministic core. Async only because extraction is async; the
 * discernment logic itself is unchanged (a no-op extractor ⇒ byte-identical to
 * `runDiscernment`). Fail-honest: an extractor throw falls back to the structural
 * default for that candidate (never blocks the discernment). MEASURE.
 */
export async function runDiscernmentWithExtraction(
  input: DiscernmentInput,
  extractor: DiscernmentExtractor,
): Promise<DiscernmentResult> {
  const candidates: CandidateDiscernmentInput[] = []
  for (const c of input.candidates) {
    if (!c.profile) {
      candidates.push(c) // un-profiled — no free text to read
      continue
    }
    const resolved: ResolvedCandidateSignals = { ...(c.resolvedSignals ?? {}) }
    // Q2.4 circle alignment.
    if (resolved.circleAlignment === undefined) {
      try {
        const r = await extractor.assessCircleAlignment({
          candidatePurpose: c.profile.purpose,
          taskCircles: input.task.circlesServed,
        })
        resolved.circleAlignment = r.alignment
      } catch {
        // fall back to the structural default (leave undefined)
      }
    }
    // Q2.2 condition match (optional method).
    if (resolved.conditionMatchOverride === undefined && extractor.assessConditionMatch) {
      try {
        const r = await extractor.assessConditionMatch({
          candidateConditions: (c.profile.performanceHistory ?? []).flatMap((p) => p.conditions ?? []),
          taskConditions: input.task.conditions,
        })
        resolved.conditionMatchOverride = clamp01(r.matchRatio)
      } catch {
        // fall back to the structural default
      }
    }
    candidates.push({ ...c, resolvedSignals: resolved })
  }
  return runDiscernment({ ...input, candidates })
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION G — the selection commit seam (flag-gated, fail-honest store write)
// ════════════════════════════════════════════════════════════════════════════

export interface SelectionCommitResult {
  committed: boolean
  opened: boolean
  boundarySet: boolean
  /** S9b G1b (additive): true ⇔ the spawn purpose-acknowledgement landed on the
   *  record. False/absent pre-migration (unknown column ⇒ ack-not-persisted,
   *  record + boundary unaffected — deploy-order-safe) or when none was supplied.
   *  The calling-completed emission gates on this. */
  ackPersisted?: boolean
  note: string
  error?: string
}

/**
 * On the orchestrator's selection: open a collaboration record + set the A9 authority
 * boundary (mentor A9 — set ONCE at selection, validated pre-execution, unwaivable by
 * trust level). Flag-gated by SUBSTRATE_TRUST_CORE_ENABLED (the caller-gate pattern,
 * matching the trust-core store) and FAIL-HONEST (a store failure never throws — MEASURE,
 * log-and-continue). Leaves `l4_audit_result` null: the out-of-band L4 audit (S7) writes
 * it before the selection finalizes. Nothing in a live route calls this session — S8 wires it.
 */
export async function openDiscernmentSelection(args: {
  result: DiscernmentResult
  /** The orchestrator's chosen candidate (usually recommendation.recommendedAgentRef;
   *  the orchestrator MAY choose differently — MEASURE, advisory). */
  chosenCandidateAgentId: string | null
  taskRef: string
  orchestratorAgentId: string
  ownerUserId?: string | null
  credentialRef?: string | null
  /** S9b G1b: the deterministic spawn purpose-acknowledgement (computed by the
   *  caller from the task + the chosen candidate's declared scope). Persisted
   *  best-effort AFTER the record + boundary stand. */
  purposeAcknowledgement?: PurposeAcknowledgement | null
  client?: SupabaseClient
}): Promise<SelectionCommitResult> {
  // Flag-gate (caller-gate, matching collaboration-store's contract). Flag-off ⇒ a
  // pure no-op (no store touch) — production byte-equivalent, MEASURE dark.
  if (!isTrustCoreEnabled()) {
    return {
      committed: false,
      opened: false,
      boundarySet: false,
      note: `SUBSTRATE_TRUST_CORE_ENABLED unset — MEASURE dark; no collaboration-record write (byte-equivalent)`,
    }
  }

  // A9 anomaly: a boundary that does not attenuate the orchestrator (a task circle
  // beyond the orchestrator's extension) must NOT be silently committed — surface it.
  if (!args.result.attenuation.attenuates) {
    return {
      committed: false,
      opened: false,
      boundarySet: false,
      note: `A9 attenuation anomaly — ${args.result.attenuation.basis}; selection not committed (escalate to the orchestrator)`,
    }
  }

  // Belt-and-braces fail-honest (MEASURE — "never throws"): the store fns wrap their
  // own bodies, but their DEFAULT-parameter getAdminClient() is evaluated OUTSIDE that
  // try when no client is injected, and can throw on missing env. Catch here so a
  // mis-configured flag-on call still returns ok:false rather than throwing to a route.
  try {
    const record = newCollaborationRecord({
      orchestratorAgentId: args.orchestratorAgentId,
      taskRef: args.taskRef,
      candidateAgentId: args.chosenCandidateAgentId,
      ownerUserId: args.ownerUserId ?? null,
      credentialRef: args.credentialRef ?? null,
    })

    const open = await openCollaborationRecord(record, args.client)
    if (!open.ok) {
      return { committed: false, opened: false, boundarySet: false, note: 'collaboration open failed (fail-honest)', error: open.error }
    }

    const boundary = await recordAuthorityBoundary(
      args.orchestratorAgentId,
      args.taskRef,
      args.result.authorityBoundary,
      args.client,
    )
    if (!boundary.ok) {
      return { committed: false, opened: open.value.opened, boundarySet: false, note: 'authority-boundary write failed (fail-honest)', error: boundary.error }
    }

    // S9b G1b — persist the spawn purpose-acknowledgement (best-effort AFTER the
    // record + boundary stand: an ack failure — incl. the pre-migration unknown
    // column — never degrades the committed selection; it reads ackPersisted:false
    // and the calling-completed emission stays off, honestly).
    let ackPersisted = false
    if (args.purposeAcknowledgement) {
      const ack = await recordPurposeAcknowledgement(
        args.orchestratorAgentId,
        args.taskRef,
        args.purposeAcknowledgement,
        args.client,
      )
      if (ack.ok) {
        ackPersisted = true
      } else {
        console.error(
          '[discernment] purpose-acknowledgement write failed (ack-not-persisted; record + boundary stand):',
          ack.error,
        )
      }
    }

    return {
      committed: true,
      opened: open.value.opened,
      boundarySet: true,
      ackPersisted,
      note:
        `collaboration record opened + A9 authority boundary set (action-scope='${args.result.authorityBoundary.actionScope}', ` +
        `${args.result.authorityBoundary.circleScope.length} circle(s)); l4_audit_result left null for S7`,
    }
  } catch (e) {
    return { committed: false, opened: false, boundarySet: false, note: 'openDiscernmentSelection threw (fail-honest)', error: (e as Error).message }
  }
}
