/**
 * profiles.ts — Trust Layer S5: the three discernment profiles (task / candidate /
 * orchestrator), as PURE-LIB validated shapes. MEASURE mode.
 *
 * BINDING SPECS (verbatim in
 * operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md;
 * ADR-013 §4 the four-layer discernment protocol + §5 A2/A6/A7). Where this file
 * and the ADR diverge, the VERBATIM RECORD WINS.
 *
 * ─── Pure-lib, NOT persisted (founder election, S5 open) ─────────────────────
 * The profiles are validated TypeScript shapes the HARNESS supplies at discernment
 * time — NOT SageReasoning-owned registry tables. This matches A6 (a profile is
 * look-up-or-absent at runtime, absence is a normal condition, not a failure) and
 * keeps the S5 Critical migration to the collaboration record alone. Only the
 * collaboration record (collaboration-record.ts) persists.
 *
 * The discernment ENGINE (S6) reads these profiles; the OUT-OF-BAND L4 audit (S7)
 * reads the orchestrator profile + the orchestrator's reasoning trace. This module
 * defines the shapes + validators + the A2A-card-extension mapping (shape-only,
 * election 4 "design-for-interop, ship native — nothing published externally at
 * v1") + the A6 candidate-presence vocabulary. It contains NO discernment logic
 * (that is S6) and NO I/O, NO env, NO clock.
 *
 * R18d DISCIPLINE (binding, carried from sage-calling/agent-card.ts): a candidate's
 * capability CLAIMS (declared capabilityScope, an A2A card's skills/tools) are
 * NEVER read as evidence of capacity. Capacity evidence is the credential coverage
 * (R18f-backed signed assessments) + performance history only. The A2A mapper here
 * maps ONLY role/purpose/output-shape hints and deliberately ignores capability
 * claims, exactly as the live agent-card verifier does.
 */

import type {
  KatorthomaProximity,
  VirtueDomain,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import type { LoopDepthTier } from '@/lib/translation-sandwich/reason-loop-closure'
import type { CoverageStatus } from './types'

// ════════════════════════════════════════════════════════════════════════════
// SHARED VOCABULARY
// ════════════════════════════════════════════════════════════════════════════

/**
 * A deployer-defined function type (mentor A2). The taxonomy is deployment-specific
 * — the deployer names function types at integration time and assigns each a
 * four-virtue-domain weight profile (the S2 domain-distance input). A free string
 * here; S2 carries the weight profiles.
 */
export type FunctionType = string

/** An oikeiosis circle identifier (a party/relationship the task engages). Free
 *  string — the task names its circles. */
export type OikeiosisCircle = string

// ════════════════════════════════════════════════════════════════════════════
// TASK PROFILE (function type, circles served, conditions, output requirements,
// justice surface)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The task's justice surface (L1 Q1.2). A non-consenting party in scope makes the
 * L3 justice branch MANDATORY; that party in scope AND a candidate with no
 * justice-evaluation capacity ⇒ L1 fail (S6). No party in scope ⇒ the justice
 * branch is skipped.
 */
export interface TaskJusticeSurface {
  /** True ⇔ a non-consenting party whose rational nature the action engages is in
   *  scope (⇒ mandatory L3 justice branch at S6). */
  present: boolean
  /** The circle(s) that carry the non-consenting party (when present). */
  nonConsentingCircles: OikeiosisCircle[]
  /** Free description of the obligation the task must honour. */
  note?: string
}

export interface TaskProfile {
  schema: 'trust-task-profile-v1'
  /** The specific function this task requires (A2 taxonomy) — role alignment is a
   *  match on THIS, not on general capability (L1 Q1.1). */
  functionType: FunctionType
  /** The oikeiosis circles the task is in scope to affect — the source of the A9
   *  authority_boundary circle_scope. */
  circlesServed: OikeiosisCircle[]
  /** The task's actual operating conditions (L2 Q2.2 stability-under-conditions). */
  conditions: string[]
  /** What outputs the task requires (L2/L3 integrability; A4 transparency demand). */
  outputRequirements: string[]
  /** The justice-surface check (L1 Q1.2). */
  justiceSurface: TaskJusticeSurface
}

// ════════════════════════════════════════════════════════════════════════════
// CANDIDATE PROFILE (role, capability scope, credential coverage, performance
// history, output format, purpose, prior-interaction record) — A2A-card-mappable
// ════════════════════════════════════════════════════════════════════════════

/**
 * Per-domain credential coverage (the EVIDENCE axis — ties to S2 domain distance +
 * confidence tiers). A credential is earned in a specific function type; S2 scores
 * its transfer to the task's function type per-dimension. Coverage of THIS
 * function type is what L1 Q1.3 credential-integrity checks — a credential earned
 * in another domain does not transfer at full weight (A2 proportional transfer,
 * zero floor above the deployer threshold).
 */
export interface CredentialCoverage {
  /** The cardinal virtue domain the credential exercised. */
  domain: VirtueDomain
  /** The function type the credential was earned in (the A2 domain-distance source). */
  functionType: FunctionType
  /** Coverage continuity (spec-3 / A3 — gaps decay the weight toward the prior). */
  coverageStatus: CoverageStatus
  /** The credential's demonstrated proximity in this domain, when known (the S2
   *  confidence-tier input; the raw evidence is the R18f-backed signed assessment). */
  demonstratedProximity?: KatorthomaProximity
}

/** A past demonstrated proximity in a domain (the tier-2 behavioural-evidence axis;
 *  condition-matched behaviour is weighed by S2). */
export interface PerformanceRecord {
  domain: VirtueDomain
  proximity: KatorthomaProximity
  /** The operating conditions this record was produced under (L2 Q2.2 — behavioural
   *  evidence counts at full weight only when the conditions match the task's). */
  conditions?: string[]
  /** ISO occurrence timestamp. */
  occurredAt: string
}

/**
 * What the candidate's outputs CONTAIN (the A4 transparency shape). Feeds L2 Q2.3
 * (transparency of reasoning). These describe output SHAPE (a legitimate L2 profile
 * axis), NOT a capability claim (the R18d distinction). On the EVIDENCE path they are
 * structural facts about outputs the orchestrator has actually received; on the
 * A2A-card-sourced path (candidateHintsFromA2ACard) they are the card's DECLARED shape
 * — unverified, defaulted conservatively to false. Either way, AUTHORITATIVE
 * examinability is measured by the S4 transparency ledger from the ACTUAL received
 * outputs (transparency-ledger.ts `OutputFeatures`), never from this profile field alone.
 */
export interface OutputFormatDescriptor {
  /** Emits a signed Layer-2 assessment (reproducible, tamper-evident). */
  emitsSignedTrace: boolean
  /** Emits a proximity + domain breakdown (the minimum examinability threshold). */
  emitsStructuredVerdict: boolean
  /** States explicit confidence + flagged unknowns. */
  statesUncertainty: boolean
}

/**
 * The prior-interaction record (A9/L4). BINDING DISCIPLINE: a prior positive
 * interaction is DATA, not a credential — it enters the assessment at L2 Q2.2
 * (stability under conditions), NEVER before L1, and it is explicitly one of the
 * L4 signals the passion audit watches for (preference formed before the
 * assessment ran). The `isDataNotCredential` marker below is a structural
 * (compile-time) reminder of this discipline; it has no runtime effect on its own —
 * S6 enforces the discipline by ROUTING priorInteraction into L2 Q2.2 by field
 * identity (never admitting it at L1), and S7 reads it as an L4 input.
 */
export interface PriorInteractionRecord {
  /** How many prior collaborations with this candidate. */
  interactions: number
  /** A short outcome note (the "data", never a credential). */
  lastOutcomeNote?: string
  /** Always true — a structural reminder that this is L2-Q2.2 data, never an L1
   *  credential and never a pre-assessment preference basis (A9/L4). */
  readonly isDataNotCredential: true
}

export interface CandidateProfile {
  schema: 'trust-candidate-profile-v1'
  /** The candidate agent's K1 identity, when known (ties a profile to a trust
   *  record). Optional — an un-profiled or externally-declared candidate may lack
   *  one (A6). */
  agentId?: string
  /** The candidate's declared role (an A2A card's chosen-role commitment). A
   *  DECLARATION — role ALIGNMENT is checked at L1, but the role string is not
   *  capacity evidence. */
  role: string
  /**
   * The function types the candidate DECLARES it is scoped for. A DECLARATION, NOT
   * capacity evidence (R18d) — the discernment engine checks alignment against the
   * task, but capability CLAIMS never substitute for credential coverage /
   * performance history as evidence of capacity.
   */
  capabilityScope: FunctionType[]
  /** Per-domain credential coverage — the EVIDENCE axis (R18f-backed). */
  credentialCoverage: CredentialCoverage[]
  /** Behavioural performance history (tier-2 evidence). Optional. */
  performanceHistory?: PerformanceRecord[]
  /** What the candidate's outputs contain (A4 transparency; L2 Q2.3). */
  outputFormat: OutputFormatDescriptor
  /** The candidate's purpose — circle alignment (L2 Q2.4; a dikaiosyne risk when
   *  misaligned, not a capability failure). */
  purpose: string
  /** The prior-interaction record (A9/L4 — data, not a credential; L2 Q2.2 only). */
  priorInteraction?: PriorInteractionRecord | null
}

// ════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR PROFILE (current kathekonta, examination capacity, circle,
// selection patterns) — S7's L4 audit reads this + the orchestrator's trace
// ════════════════════════════════════════════════════════════════════════════

/**
 * The orchestrator's examination capacity (A9 case-2 "the means available"). Whether
 * the corroboration check is available + runnable is load-bearing for the
 * delegation-responsibility case split: a justice surface the corroboration check
 * WOULD have flagged, when the check was available and not run, is case 2 (a higher
 * orchestrator reduction); genuinely uncatchable is case 3 (a flag, not a reduction).
 */
export interface ExaminationCapacity {
  /** Whether the corroboration check is available to this orchestrator (A9 case-2
   *  "had the means"). */
  corroborationCheckAvailable: boolean
  /** Whether the orchestrator can run a re-examination (the same-depth pause). */
  canReExamine: boolean
  /** The maximum examination depth the orchestrator can run (the same-depth-rule
   *  ceiling). */
  maxDepth: LoopDepthTier
}

/**
 * A recorded selection pattern the L4 audit reads (S7) — a habitual preference the
 * orchestrator has shown, which the passion audit checks against the current
 * selection (a prior preference formed before the assessment ran).
 */
export interface SelectionPattern {
  /** A short descriptor of the pattern (e.g. "prefers candidate X for retrieval"). */
  pattern: string
  note?: string
}

export interface OrchestratorProfile {
  schema: 'trust-orchestrator-profile-v1'
  /** The orchestrator's K1 identity (the oversight-domain trust subject; A8/A9). */
  agentId: string
  /** The appropriate actions in the orchestrator's role — selection must enable
   *  these without compromising the honestum threshold (the discernment frame). */
  currentKathekonta: string[]
  /** The means available to detect a justice surface (A9 case split). */
  examinationCapacity: ExaminationCapacity
  /**
   * The orchestrator's circle of concern — its FULL extension. The A9 authority
   * boundary's circle_scope is the TASK's circles, which must be a SUBSET of this;
   * the sub-agent does not inherit the full extension (circle-scope attenuation).
   */
  circle: OikeiosisCircle[]
  /** Recorded selection patterns (L4 audit input, S7). Optional. */
  selectionPatterns?: SelectionPattern[]
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATORS (pure, defensive — profiles arrive from external/harness input)
// ════════════════════════════════════════════════════════════════════════════

export type ProfileValidation<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

/** Validate a task profile. Pure. */
export function validateTaskProfile(input: unknown): ProfileValidation<TaskProfile> {
  const errors: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ['task profile is not an object'] }
  if (input.schema !== 'trust-task-profile-v1') errors.push('schema must be trust-task-profile-v1')
  if (typeof input.functionType !== 'string' || input.functionType.trim() === '') {
    errors.push('functionType must be a non-empty string')
  }
  if (!isStringArray(input.circlesServed)) errors.push('circlesServed must be a string[]')
  if (!isStringArray(input.conditions)) errors.push('conditions must be a string[]')
  if (!isStringArray(input.outputRequirements)) errors.push('outputRequirements must be a string[]')
  const js = input.justiceSurface
  if (!isRecord(js) || typeof js.present !== 'boolean' || !isStringArray(js.nonConsentingCircles)) {
    errors.push('justiceSurface must be { present:boolean, nonConsentingCircles:string[] }')
  } else if (js.present && js.nonConsentingCircles.length === 0) {
    // A justice surface with no named circle is a scoping gap — flag it (the L3
    // justice branch cannot name the party); do not silently accept.
    errors.push('justiceSurface.present but no nonConsentingCircles named (L1 Q1.2 scoping gap)')
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: input as unknown as TaskProfile }
}

/** Validate a candidate profile. Pure. */
export function validateCandidateProfile(input: unknown): ProfileValidation<CandidateProfile> {
  const errors: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ['candidate profile is not an object'] }
  if (input.schema !== 'trust-candidate-profile-v1') errors.push('schema must be trust-candidate-profile-v1')
  if (typeof input.role !== 'string' || input.role.trim() === '') errors.push('role must be a non-empty string')
  if (typeof input.purpose !== 'string') errors.push('purpose must be a string')
  if (!isStringArray(input.capabilityScope)) errors.push('capabilityScope must be a string[]')
  if (!Array.isArray(input.credentialCoverage)) {
    errors.push('credentialCoverage must be an array')
  }
  const of = input.outputFormat
  if (
    !isRecord(of) ||
    typeof of.emitsSignedTrace !== 'boolean' ||
    typeof of.emitsStructuredVerdict !== 'boolean' ||
    typeof of.statesUncertainty !== 'boolean'
  ) {
    errors.push('outputFormat must be { emitsSignedTrace, emitsStructuredVerdict, statesUncertainty: boolean }')
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: input as unknown as CandidateProfile }
}

/** Validate an orchestrator profile. Pure. */
export function validateOrchestratorProfile(input: unknown): ProfileValidation<OrchestratorProfile> {
  const errors: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ['orchestrator profile is not an object'] }
  if (input.schema !== 'trust-orchestrator-profile-v1') errors.push('schema must be trust-orchestrator-profile-v1')
  if (typeof input.agentId !== 'string' || input.agentId.trim() === '') errors.push('agentId must be a non-empty string')
  if (!isStringArray(input.currentKathekonta)) errors.push('currentKathekonta must be a string[]')
  if (!isStringArray(input.circle)) errors.push('circle must be a string[]')
  const ec = input.examinationCapacity
  if (
    !isRecord(ec) ||
    typeof ec.corroborationCheckAvailable !== 'boolean' ||
    typeof ec.canReExamine !== 'boolean' ||
    (ec.maxDepth !== 'quick' && ec.maxDepth !== 'standard' && ec.maxDepth !== 'deep')
  ) {
    errors.push('examinationCapacity must be { corroborationCheckAvailable, canReExamine: boolean, maxDepth: quick|standard|deep }')
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: input as unknown as OrchestratorProfile }
}

// ════════════════════════════════════════════════════════════════════════════
// A2A-CARD-EXTENSION MAPPING (shape-only — election 4: design-for-interop, ship
// native; NOTHING published externally at v1)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Map a parsed, already-verified A2A Agent Card (the live sage-calling
 * agent-card.ts verifier's `body`) to the ROLE/PURPOSE/OUTPUT-SHAPE hints of a
 * candidate profile — shape-only. Pure.
 *
 * R18d (binding): capability CLAIMS (card.skills / card.capabilities / card.tools)
 * are DELIBERATELY IGNORED — they are never capacity evidence. Credential coverage
 * + performance history (the evidence axes) are NOT sourced from the card; they
 * come from SageReasoning's own R18f-backed signed records. So this returns a
 * PARTIAL candidate profile: the declarative hints only. The caller merges in the
 * evidence axes.
 *
 * Returns null when the card is not a usable object. Never throws.
 */
export function candidateHintsFromA2ACard(card: unknown): Partial<CandidateProfile> | null {
  if (!isRecord(card)) return null
  const hints: Partial<CandidateProfile> = {}

  // role ← the card's declared name/description (the chosen-role commitment). A
  // DECLARATION only (never capacity).
  const name = typeof card.name === 'string' ? card.name : null
  const description = typeof card.description === 'string' ? card.description : null
  if (name || description) hints.role = name ?? (description as string)
  if (description) hints.purpose = description

  // outputFormat ← ONLY structural transport hints the A2A card may carry (e.g. a
  // declared support for signed/structured output). Absent ⇒ conservative false
  // (unknown transparency, not assumed present). Capability claims are NOT read.
  const declaredOutput = isRecord(card.output_modes) ? card.output_modes : null
  hints.outputFormat = {
    emitsSignedTrace: declaredOutput?.signed === true,
    emitsStructuredVerdict: declaredOutput?.structured === true,
    statesUncertainty: declaredOutput?.uncertainty === true,
  }

  // NOTE (R18d): card.skills / card.capabilities / card.tools are intentionally
  // NOT read into capabilityScope or credentialCoverage — an inflated/poisoned card
  // contributes at most the declarative role/purpose hint, never a capacity claim.

  return hints
}

// ════════════════════════════════════════════════════════════════════════════
// A6 — un-profiled candidate handling (vocabulary; the L1 decision is S6)
// ════════════════════════════════════════════════════════════════════════════

/**
 * The positive evidence that EXCLUDES a candidate at the L1 honestum gate (mentor
 * A6). Absence of a profile is NOT one of these — it is an evidence gap, handled by
 * confidence marking + a task-scoped examination, never blanket exclusion.
 */
export type ExclusionEvidence =
  | 'known-justice-violation'
  | 'incompatible-role'
  | 'revoked-credential' // REVOKED, distinct from merely-absent

export interface CandidatePresence {
  /** True ⇔ a candidate profile is present. */
  profiled: boolean
  /**
   * A6: an un-profiled candidate is assessed on profile prior at tier-7 confidence
   * (NOT excluded). `assess-on-prior-tier7` marks that posture; a profiled candidate
   * is `assess-on-profile`.
   */
  posture: 'assess-on-profile' | 'assess-on-prior-tier7'
  /**
   * The independence-principle flag is active for an un-profiled candidate's
   * duration (A6) — the reduced-confidence marking the collaboration record carries.
   */
  independenceFlagActive: boolean
}

/**
 * Classify a candidate's PRESENCE for the L1 gate (mentor A6). Pure. Absence ⇒
 * assess-on-prior at tier-7 with the independence flag active — NEVER exclusion.
 * Exclusion requires positive `ExclusionEvidence`, which the caller (S6) supplies
 * separately; this function only distinguishes profiled from un-profiled. It does
 * NOT itself exclude (A6: absence of evidence is not positive evidence of
 * unsuitability).
 */
export function classifyCandidatePresence(
  profile: CandidateProfile | null | undefined,
): CandidatePresence {
  const profiled = profile != null
  return {
    profiled,
    posture: profiled ? 'assess-on-profile' : 'assess-on-prior-tier7',
    independenceFlagActive: !profiled,
  }
}
