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
