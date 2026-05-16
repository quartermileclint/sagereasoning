/**
 * PORTED — verbatim mirror of /trust-layer/types/accreditation.ts
 *
 * Source of truth: /trust-layer/types/accreditation.ts (built 3 April 2026).
 * Ported into website/src/lib/substrate/trust-layer/ on 2026-05-15 under
 * D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15 (the ATL Wrapper build — spec step 5).
 *
 * WHY THIS FILE EXISTS HERE
 *   /trust-layer/ sits outside website/'s tsconfig root. The ATL Wrapper
 *   (atl-wrapper.ts) needs the LOGIC of computeWindowSnapshot +
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
import type { DeliberationBreadth, KathekonQuality } from './evaluation'

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
