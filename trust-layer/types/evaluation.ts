/**
 * evaluation.ts — Types for the Rolling Evaluation Window
 *
 * The evaluation window aggregates the last N evaluated actions
 * into running proximity levels, dimension scores, and direction
 * of travel.
 *
 * Derived from:
 *   reasoning-receipt.ts — ReasoningReceipt (individual evaluation trace)
 *   deliberation.ts      — compareProximity(), calculateDirectionOfTravel()
 *   scoring.json         — 4-stage evaluation sequence
 *   progress.json        — 4 progress dimensions, Senecan grades
 *
 * Rules:
 *   R4:  Window aggregation is internal — only the 5 reported levels are exposed
 *   R6c: Qualitative levels only — no numeric averages
 */

import type {
  KatorthomaProximityLevel,
  DimensionLevel,
  DimensionScores,
  DirectionOfTravel,
  RootPassionId,
  PersistingPassion,
  ProgressDimensionId,
} from './accreditation'

// ============================================================================
// EVALUATED ACTION — a single entry in the rolling window
// ============================================================================

/**
 * A compact representation of a single evaluated action.
 * Derived from a ReasoningReceipt but stripped to what the
 * window aggregator needs.
 */
export type EvaluatedAction = {
  /** Receipt ID linking back to full reasoning trace */
  readonly receipt_id: string

  /** Agent that performed this action */
  readonly agent_id: string

  /** When this action was evaluated */
  readonly evaluated_at: string

  /** Proximity level from the 4-stage evaluation */
  readonly proximity: KatorthomaProximityLevel

  /** Whether the action was deemed appropriate */
  readonly is_kathekon: boolean

  /** Quality of the kathekon assessment */
  readonly kathekon_quality: 'strong' | 'moderate' | 'marginal' | 'contrary'

  /** Passions detected during evaluation */
  readonly passions_detected: {
    readonly root_passion: RootPassionId
    readonly sub_species: string
  }[]

  /** Virtue domains engaged in this action */
  readonly virtue_domains_engaged: string[]

  /** Whether oikeiosis obligations were met */
  readonly oikeiosis_met: boolean | null

  /** Which oikeiosis stage was relevant (if any) */
  readonly oikeiosis_stage: string | null

  /** Ruling faculty state description */
  readonly ruling_faculty_state: string

  /** Which skill produced this evaluation */
  readonly skill_id: string
}

// ============================================================================
// WINDOW CONFIGURATION
// ============================================================================

/**
 * Configuration for the rolling evaluation window.
 */
export type WindowConfig = {
  /** Number of recent actions in the window (default: 100) */
  readonly window_size: number

  /** How often to check for grade transitions (default: every 20 actions) */
  readonly grade_check_interval: number

  /** Minimum actions required before computing a grade */
  readonly minimum_actions_for_grade: number

  /** Threshold: what percentage of actions must be at a proximity level
   *  for the agent to be considered "typically" at that level */
  readonly typical_proximity_threshold: number

  /** Threshold: percentage of actions at a dimension level to earn it */
  readonly dimension_level_threshold: number
}

/** Default window configuration per framework doc */
export const DEFAULT_WINDOW_CONFIG: WindowConfig = {
  window_size: 100,
  grade_check_interval: 20,
  minimum_actions_for_grade: 20,
  typical_proximity_threshold: 0.6,   // 60% of actions at or above level
  dimension_level_threshold: 0.5,     // 50% of actions demonstrating this level
}

// ============================================================================
// WINDOW SNAPSHOT — the aggregated state at a point in time
// ============================================================================

/**
 * A snapshot of the rolling evaluation window at a point in time.
 * This is what the grade transition engine consumes.
 */
export type WindowSnapshot = {
  /** Agent this window belongs to */
  readonly agent_id: string

  /** When this snapshot was computed */
  readonly computed_at: string

  /** Number of actions currently in the window */
  readonly actions_in_window: number

  /** Total actions evaluated (lifetime) */
  readonly total_actions_evaluated: number

  /** Distribution of proximity levels across the window */
  readonly proximity_distribution: Record<KatorthomaProximityLevel, number>

  /** The typical (most common qualifying) proximity level */
  readonly typical_proximity: KatorthomaProximityLevel

  /** Dimension levels computed from the window */
  readonly dimension_levels: DimensionScores

  /** Direction of travel computed from recent trajectory */
  readonly direction_of_travel: DirectionOfTravel

  /** Passions that persist across the window */
  readonly persisting_passions: PersistingPassion[]

  /** Kathekon compliance rate (percentage of actions deemed appropriate) */
  readonly kathekon_compliance_rate: number

  /** Average virtue domain engagement breadth */
  readonly virtue_breadth: number

  /** The ordered proximity trajectory (last N actions) */
  readonly proximity_trajectory: KatorthomaProximityLevel[]

  /** Per-dimension detail for diagnostic purposes */
  readonly dimension_detail: Record<ProgressDimensionId, DimensionDetail>
}

/**
 * Detailed breakdown for a single progress dimension.
 * Used internally for grade transition decisions.
 */
export type DimensionDetail = {
  readonly dimension_id: ProgressDimensionId
  readonly level: DimensionLevel
  /** What percentage of window actions support this level */
  readonly confidence: number
  /** Trend within this dimension specifically */
  readonly trend: DirectionOfTravel
  /** Key indicators observed */
  readonly indicators: string[]
}
