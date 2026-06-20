/**
 * PORTED — verbatim mirror of /trust-layer/types/accreditation.ts
 *
 * Source of truth: /trust-layer/types/accreditation.ts (built 3 April 2026).
 * Ported into website/src/lib/substrate/trust-layer/ on 2026-05-15 under
 * D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15 (the ATL Wrapper build — spec step 5).
 *
 * WHY THIS FILE EXISTS HERE
 *   /trust-layer/ sits outside website/'s tsconfig root. The ATL Wrapper
 *   (sage-assent-wrapper.ts) needs the LOGIC of computeWindowSnapshot +
 *   evaluateGradeTransition — not just their types — so the 5-file dependency
 *   closure of those two functions is ported here, inside website/'s tsconfig,
 *   rather than imported across the boundary. This is the founder-elected
 *   option (a) at the wrapper build's Step 2 design-decision gate; it follows
 *   /trust-layer/'s own established self-containment pattern (its BUILD-LOG
 *   records the same choice — re-declaring types rather than coupling).
 *
 * KEEP IN SYNC: if /trust-layer/types/accreditation.ts changes, re-port it here
 *   in the same change. Everything below the banner is a VERBATIM copy.
 * ===========================================================================
 */

/**
 * accreditation.ts — Core types for the Agent Trust Layer
 *
 * These types define the accreditation signal that gets served to the world:
 *   - Accreditation records (persistent agent credentials)
 *   - Dimension levels (the 4 progress dimensions at 4 quality levels)
 *   - Authority levels (mapped from accreditation grades)
 *   - Accreditation payloads (machine-readable signal)
 *
 * Derived from:
 *   progress.json   — Senecan grades, 4 progress dimensions
 *   scoring.json    — Katorthoma proximity scale (5 levels)
 *   stoic-brain.ts  — KatorthomaProximityLevel, SenecanGradeId, ProgressDimensionId
 *
 * Rules:
 *   R3:  Disclaimer always present on evaluative output
 *   R4:  Exposes grade + dimensions, NOT internal micro-thresholds or evaluation logic
 *   R6c: Qualitative levels only — no 0-100 scores
 *   R8a: Greek identifiers in data layer
 *   R8b: English in developer docs
 *   R8c: English-only in user-facing content
 *   R9:  Evaluates reasoning quality, does not promise outcomes
 */

// DeliberationBreadth is defined in ../types/evaluation.ts (its natural home — it
// is derived from EvaluatedAction.candidates_considered). Type-only mutual
// imports are fine in TypeScript; accreditation.ts and evaluation.ts already
// strongly couple, and this is a type-only edge added 2026-05-16 for Decision A
// of the items 1-3 build (D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16).
// KathekonQuality is similarly defined in ../types/evaluation.ts (used both per-
// action on EvaluatedAction.kathekon_quality and aggregated to typical_kathekon_-
// quality). Added 2026-05-16 for the kathekon-aligned alternative build
// (D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16).
import type {
  DeliberationBreadth,
  KathekonQuality,
  OperationClass,
  TargetSystemVendor,
  OutcomeVerification,
  ReversibilitySignal,
} from './evaluation'

// Re-export types from existing V3 infrastructure
// In production, these would import from '../../website/src/lib/stoic-brain'
// For now, we define compatible types to keep trust-layer self-contained

// ============================================================================
// CORE TYPES — from existing V3 infrastructure
// ============================================================================

/** The 5-level katorthoma proximity scale (from stoic-brain.ts) */
export type KatorthomaProximityLevel =
  | 'reflexive'
  | 'habitual'
  | 'deliberate'
  | 'principled'
  | 'sage_like'

/** Senecan grade identifiers (from stoic-brain.ts) */
export type SenecanGradeId =
  | 'pre_progress'
  | 'grade_3'
  | 'grade_2'
  | 'grade_1'
  | 'sage_ideal'

/** The 4 progress dimension identifiers (from stoic-brain.ts) */
export type ProgressDimensionId =
  | 'passion_reduction'
  | 'judgement_quality'
  | 'disposition_stability'
  | 'oikeiosis_extension'

// ============================================================================
// ACCREDITATION-SPECIFIC TYPES
// ============================================================================

/**
 * Dimension quality levels — how each of the 4 progress dimensions
 * is tracking within the rolling evaluation window.
 *
 * These are the REPORTING levels (R4: external clarity).
 * Internal evaluation may use finer granularity.
 */
export type DimensionLevel = 'emerging' | 'developing' | 'established' | 'advanced'

/**
 * Authority levels earned through accreditation.
 * Maps 1:1 from proximity levels.
 *
 * Source: Framework doc Section 3, Phase C
 */
export type AuthorityLevel =
  | 'supervised'      // reflexive → every action pre-checked
  | 'guided'          // habitual → routine passes, novel flagged
  | 'spot_checked'    // deliberate → random sampling
  | 'autonomous'      // principled → logged but not pre-vetted
  | 'full_authority'  // sage_like → widest scope

/** Direction of travel — leading indicator of accreditation trajectory */
export type DirectionOfTravel = 'improving' | 'stable' | 'regressing'

/**
 * K1 coverage status — the honest-credential state machine value (first
 * slice). Vocabulary VERBATIM from the K1 ADR
 * (/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md — carry,
 * don't re-derive). Added 2026-06-13 under the mechanism-correction M3
 * accreditation session (CI-11).
 *
 *   continuous          — deterministic hook examined every consequential
 *                         action over the window; the ONLY state that earns a
 *                         "continuously examined" claim (requires the hook —
 *                         unreachable from today's write paths)
 *   suspended           — the guardrail hook is off; prior examination real,
 *                         current reasoning unexamined
 *   resumed_unverified  — the hook returned; a fresh pass is required before
 *                         continuous again
 *   expired             — a wall-clock backstop crossed without renewal
 *   agent_elected       — earned via DISCRETIONARY submission (the agent chose
 *                         which actions to submit); inherently partial; never
 *                         continuous. The honest label for today's API writes.
 *
 * The full state machine (suspend/resume transitions) is NOT this slice.
 */
export type CoverageStatus =
  | 'continuous'
  | 'suspended'
  | 'resumed_unverified'
  | 'expired'
  | 'agent_elected'

/**
 * Examination mode — WHEN the examination fired relative to the agent's
 * decision. A SEPARATE AXIS from coverage_status (which is about coverage
 * breadth). Server-composed + consumer-unforgeable on the same K1 pattern as
 * coverage_status. Added 2026-06-20 under the Gate-1 surface-honesty Arc 1
 * (D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION).
 *
 *   pre_decision_harness — the examination was fired by a harness BEFORE the
 *                          agent reasoned (Gate 1 performing its designed
 *                          function). Earned ONLY by an operator-issued harness
 *                          credential (the marker lives in api_keys.
 *                          credential_provenance, set at admin mint — a consumer
 *                          cannot self-issue it). An ATTESTATION rooted in
 *                          operator issuance + harness-by-construction, NOT a
 *                          cryptographic proof of timing.
 *   post_decision_check  — the examination fired AFTER the agent formed its
 *                          judgement: an honest check feeding developmental
 *                          progression. The honest label for today's
 *                          discretionary API write paths (all of them).
 *
 * On read, a row written before this slice (or before the flag) reads back
 * `null` — the honest "examination mode unstated" state. The composer never
 * emits null; null is a read-back-only state. D3: do NOT repurpose
 * coverage_status:'continuous' (coverage breadth) for this timing property.
 */
export type ExaminationMode = 'pre_decision_harness' | 'post_decision_check'

/** Root passion identifiers (from passions.json) */
export type RootPassionId = 'epithumia' | 'hedone' | 'phobos' | 'lupe'

/**
 * A persisting passion — one that keeps appearing across the evaluation window.
 */
export type PersistingPassion = {
  readonly root_passion: RootPassionId
  readonly sub_species: string
  /** How many times this passion appeared in the evaluation window */
  readonly occurrence_count: number
  /** Percentage of evaluated actions where this passion was detected */
  readonly occurrence_rate: number
}

/**
 * Dimension scores within the rolling evaluation window.
 * Each dimension is tracked independently.
 */
export type DimensionScores = {
  readonly passion_reduction: DimensionLevel
  readonly judgement_quality: DimensionLevel
  readonly disposition_stability: DimensionLevel
  readonly oikeiosis_extension: DimensionLevel
}

/**
 * The Accreditation Record — the persistent agent credential.
 *
 * This is the core data structure stored in Supabase.
 * It represents the agent's current accreditation state,
 * computed from the rolling evaluation window.
 *
 * Source: Framework doc Section 5 (Accreditation Signal)
 */
export type AccreditationRecord = {
  /** Agent identifier (format: agent_{org}_{version}) */
  readonly agent_id: string

  /** Current Senecan grade */
  readonly senecan_grade: SenecanGradeId

  /** Typical proximity level across the evaluation window */
  readonly typical_proximity: KatorthomaProximityLevel

  /** Earned authority level (derived from grade) */
  readonly authority_level: AuthorityLevel

  /** How each progress dimension is tracking */
  readonly dimension_levels: DimensionScores

  /** Is reasoning improving, stable, or regressing? */
  readonly direction_of_travel: DirectionOfTravel

  /** Size of the evaluation window (default: 100) */
  readonly evaluation_window_size: number

  /** Total actions evaluated for this agent (lifetime) */
  readonly actions_evaluated: number

  /** When the current grade was earned */
  readonly grade_since: string

  /** Timestamp of the most recent evaluation */
  readonly last_evaluation: string

  /** Passions that persist across the evaluation window */
  readonly passions_persisting: PersistingPassion[]

  /** Public verification URL */
  readonly verification_url: string

  /** ISO 8601 timestamp when this accreditation expires (requires re-evaluation) */
  readonly expires_at: string

  /** R3: Evaluative disclaimer — always present */
  readonly disclaimer: string

  /** Record creation timestamp */
  readonly created_at: string

  /** Last update timestamp */
  readonly updated_at: string

  /** The typical (most-common-qualifying) deliberation-breadth bucket across
   *  the evaluation window — the R18a-honest observable credential. Derived
   *  from the WindowSnapshot. R18c-additive: this is a new field; third-party
   *  verifiers that don't parse it are unaffected. Added 2026-05-16 under
   *  D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16 §"Decision A". */
  readonly typical_deliberation_breadth: DeliberationBreadth

  /** The typical (most-common-qualifying) kathekon-quality bucket across the
   *  evaluation window — the R18a-honest observable credential parallel to
   *  typical_deliberation_breadth. Derived from the WindowSnapshot's same-
   *  named field. R18c-additive: additional field; third-party verifiers that
   *  don't parse it are unaffected. Per the kathekon-aligned alternative design
   *  (Decision C), authority_level stays driven by typical_proximity — this
   *  field is observable on the record but does NOT modulate operational
   *  permissions. Added 2026-05-16 under D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-
   *  BUILD-WIRED-VERIFIED-2026-05-16 §"Decision C". */
  readonly typical_kathekon_quality: KathekonQuality

  // ==========================================================================
  // A10 TYPICAL-CLASS AGGREGATES (Decision 3b + 3c of the A10 rewrite) — the
  // EvaluatedAction-derived pass-through aggregates surfaced on the credential.
  // Optional (the wrapper may or may not supply them; createAccreditationRecord
  // does not seed them). R18c-additive: third-party verifiers that don't parse
  // them are unaffected. Aggregates only — raw EvaluatedAction history is NOT
  // persisted (Decision 3c). Added 2026-05-21 under
  // D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21.
  // ==========================================================================
  readonly typical_operation_class?: OperationClass
  readonly typical_target_system_vendor?: TargetSystemVendor
  readonly typical_outcome_verification?: OutcomeVerification
  readonly typical_reversibility_signal?: ReversibilitySignal

  // ==========================================================================
  // K1 COVERAGE-STATUS FIELDS (first slice — CI-11, 2026-06-13, per the K1 ADR
  // /adopted/adr/2026-05-26-credential-scope-and-coverage-status.md).
  // SERVER-SET ONLY: the write boundary composes these via
  // composeK1InitialCoverage (accreditation/coverage-status.ts) and supplies
  // them through the store's write-time OPTIONS — values carried on a
  // consumer-submitted record are IGNORED at write. On read, the store folds
  // the row's columns into these fields so the public payload can serve them.
  // Optional + nullable: rows written before this slice read back null (the
  // honest "pre-K1, coverage unstated" state). R18c-additive.
  // ==========================================================================
  readonly coverage_status?: CoverageStatus | null
  readonly monitored_since?: string | null
  readonly credential_basis?: string | null

  // ==========================================================================
  // EXAMINATION-MODE FIELD (Gate-1 surface honesty, Arc 1, 2026-06-20). The
  // pre/post-decision timing distinction — server-composed via
  // composeK1InitialCoverage's harness_enforced write-path, carried through the
  // store's write-time OPTIONS (values on a consumer-submitted record are
  // IGNORED). Optional + nullable: rows written before this slice / before the
  // SUBSTRATE_EXAMINATION_MODE_ENABLED flag read back undefined → the public
  // payload omits the field (flag-off byte-identity). R18c-additive.
  // ==========================================================================
  readonly examination_mode?: ExaminationMode | null
}

/**
 * The Accreditation Payload — the machine-readable signal served publicly.
 *
 * This is a subset of AccreditationRecord designed for external consumption.
 * Platforms, other agents, and users query this to decide trust level.
 *
 * Source: Framework doc Section 5 (Accreditation Payload table)
 */
export type AccreditationPayload = {
  readonly agent_id: string
  readonly senecan_grade: SenecanGradeId
  readonly typical_proximity: KatorthomaProximityLevel
  readonly authority_level: AuthorityLevel
  readonly dimension_levels: DimensionScores
  readonly direction_of_travel: DirectionOfTravel
  readonly evaluation_window: string
  readonly actions_evaluated: number
  readonly grade_since: string
  readonly last_evaluation: string
  readonly passions_persisting: string[]
  readonly verification_url: string
  readonly disclaimer: string
  /** The R18a-honest observable credential — qualitative deliberation pattern
   *  (intuited / deliberated / multi_branch_deliberated). Added 2026-05-16
   *  under D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16 §"Decision A". */
  readonly typical_deliberation_breadth: DeliberationBreadth

  /** The R18a-honest observable credential parallel to typical_deliberation_-
   *  breadth — qualitative kathekon pattern (strong / moderate / marginal /
   *  contrary). Added 2026-05-16 under D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-
   *  BUILD-WIRED-VERIFIED-2026-05-16 §"Decision C". */
  readonly typical_kathekon_quality: KathekonQuality

  /** A10 typical-class aggregates (Decision 3b) — R18c-additive fields exposing
   *  the agent's operational footprint to procurement reviewers. Always present
   *  on the payload; null when no aggregate is available on the record. Added
   *  2026-05-21 under D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21. */
  readonly typical_operation_class: OperationClass | null
  readonly typical_target_system_vendor: TargetSystemVendor | null
  readonly typical_outcome_verification: OutcomeVerification | null
  readonly typical_reversibility_signal: ReversibilitySignal | null

  /** K1 coverage-status fields (first slice — CI-11, 2026-06-13). Always
   *  present on the payload; null on rows written before the slice (the
   *  honest "coverage unstated" state). coverage_status states what kind of
   *  examination coverage the credential rests on (R19e configuration
   *  honesty); credential_basis is the K1 auditable scope statement —
   *  "whose hands, which window, which identity". R18c-additive. */
  readonly coverage_status: CoverageStatus | null
  readonly monitored_since: string | null
  readonly credential_basis: string | null

  /** Examination mode (Gate-1 surface honesty, Arc 1, 2026-06-20) — the
   *  pre/post-decision timing distinction. Present on the payload ONLY when the
   *  SUBSTRATE_EXAMINATION_MODE_ENABLED feature has folded it on read; `null`
   *  means "examination mode unstated" (a row written before the slice). The
   *  sole unforgeable distinguisher between the two Gate-1 configurations under
   *  Option 2. ATTESTATION, not a cryptographic proof of timing. R18c-additive. */
  readonly examination_mode?: ExaminationMode | null
}

/**
 * Grade change event — emitted when an agent's accreditation changes.
 * Used for webhook notifications (Priority: Accreditation Event Stream).
 */
export type GradeChangeEvent = {
  readonly event_type: 'grade_upgrade' | 'grade_downgrade'
  readonly agent_id: string
  readonly previous_grade: SenecanGradeId
  readonly new_grade: SenecanGradeId
  readonly previous_proximity: KatorthomaProximityLevel
  readonly new_proximity: KatorthomaProximityLevel
  readonly previous_authority: AuthorityLevel
  readonly new_authority: AuthorityLevel
  readonly trigger_action_count: number
  readonly timestamp: string
}

/**
 * Onboarding assessment result — outcome of the 55-assessment framework.
 * This establishes the agent's starting grade.
 *
 * Source: Framework doc Section 3, Phase A
 */
export type OnboardingResult = {
  readonly agent_id: string
  readonly assessments_completed: number
  readonly total_assessments: number
  readonly tier: 'free' | 'paid'
  readonly starting_grade: SenecanGradeId
  readonly starting_proximity: KatorthomaProximityLevel
  readonly starting_dimensions: DimensionScores
  readonly phase_results: OnboardingPhaseResult[]
  readonly timestamp: string
}

/**
 * Result from a single onboarding phase.
 * The 55-assessment framework has 8 phases.
 */
export type OnboardingPhaseResult = {
  readonly phase_number: number
  readonly phase_name: string
  readonly assessments_in_phase: number
  readonly typical_proximity: KatorthomaProximityLevel
  readonly passions_detected: string[]
  readonly dimension_indicators: Partial<DimensionScores>
}
