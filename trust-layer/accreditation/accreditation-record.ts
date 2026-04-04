/**
 * accreditation-record.ts — Persistent Agent Credential Management
 *
 * Priority 1: Create, read, update accreditation records.
 * This is the foundation everything else builds on.
 *
 * Source: Framework doc Section 5 + Section 8 Priority 1
 * Uses existing agent_id patterns from V3.
 *
 * Rules:
 *   R3:  Disclaimer on all evaluative output
 *   R4:  Expose grade + dimensions, not internal logic
 *   R5:  Free tier = 14 assessments, Paid = 55 assessments + live eval
 *   R9:  Evaluates reasoning quality, does not promise outcomes
 */

import type {
  AccreditationRecord,
  AccreditationPayload,
  KatorthomaProximityLevel,
  SenecanGradeId,
  AuthorityLevel,
  DimensionScores,
  DirectionOfTravel,
  PersistingPassion,
  GradeChangeEvent,
} from '../types/accreditation'

// ============================================================================
// CONSTANTS
// ============================================================================

/** R3: Evaluative disclaimer for all accreditation output */
export const ACCREDITATION_DISCLAIMER =
  'This accreditation evaluates reasoning quality using Stoic philosophical frameworks. ' +
  'It does not guarantee specific outcomes, legal compliance, or fitness for any particular purpose. ' +
  'Ancient reasoning, modern application.'

/** Base URL for verification endpoints */
export const VERIFICATION_BASE_URL = 'https://sagereasoning.com/accreditation'

/** Default evaluation window size */
export const DEFAULT_WINDOW_SIZE = 100

/** Default accreditation validity period (90 days) */
export const DEFAULT_EXPIRY_DAYS = 90

// ============================================================================
// PROXIMITY ↔ GRADE MAPPING
// ============================================================================

/**
 * Map from typical proximity level to Senecan grade.
 *
 * Source: Framework doc Section 3 Phase A:
 *   reflexive  → pre_progress
 *   habitual   → grade_3
 *   deliberate → grade_2
 *   principled → grade_1
 *   sage_like  → sage_ideal
 */
export const PROXIMITY_TO_GRADE: Record<KatorthomaProximityLevel, SenecanGradeId> = {
  reflexive: 'pre_progress',
  habitual: 'grade_3',
  deliberate: 'grade_2',
  principled: 'grade_1',
  sage_like: 'sage_ideal',
}

/**
 * Map from Senecan grade to typical proximity level (inverse).
 */
export const GRADE_TO_PROXIMITY: Record<SenecanGradeId, KatorthomaProximityLevel> = {
  pre_progress: 'reflexive',
  grade_3: 'habitual',
  grade_2: 'deliberate',
  grade_1: 'principled',
  sage_ideal: 'sage_like',
}

/**
 * Ordinal rank for proximity levels — used for comparison.
 * Mirrors PROXIMITY_ORDER from deliberation.ts.
 */
export const PROXIMITY_RANK: Record<KatorthomaProximityLevel, number> = {
  reflexive: 0,
  habitual: 1,
  deliberate: 2,
  principled: 3,
  sage_like: 4,
}

// ============================================================================
// ACCREDITATION RECORD BUILDER
// ============================================================================

export type CreateAccreditationOptions = {
  agent_id: string
  starting_grade: SenecanGradeId
  starting_proximity: KatorthomaProximityLevel
  starting_dimensions: DimensionScores
  window_size?: number
  expiry_days?: number
}

/**
 * Create a new accreditation record for a freshly onboarded agent.
 */
export function createAccreditationRecord(
  options: CreateAccreditationOptions
): AccreditationRecord {
  const {
    agent_id,
    starting_grade,
    starting_proximity,
    starting_dimensions,
    window_size = DEFAULT_WINDOW_SIZE,
    expiry_days = DEFAULT_EXPIRY_DAYS,
  } = options

  const now = new Date().toISOString()
  const expiresAt = new Date(
    Date.now() + expiry_days * 24 * 60 * 60 * 1000
  ).toISOString()

  return {
    agent_id,
    senecan_grade: starting_grade,
    typical_proximity: starting_proximity,
    authority_level: proximityToAuthority(starting_proximity),
    dimension_levels: starting_dimensions,
    direction_of_travel: 'stable',
    evaluation_window_size: window_size,
    actions_evaluated: 0,
    grade_since: now,
    last_evaluation: now,
    passions_persisting: [],
    verification_url: `${VERIFICATION_BASE_URL}/${agent_id}`,
    expires_at: expiresAt,
    disclaimer: ACCREDITATION_DISCLAIMER,
    created_at: now,
    updated_at: now,
  }
}

// ============================================================================
// AUTHORITY LEVEL MAPPING (Priority 4 logic, defined here for type cohesion)
// ============================================================================

/**
 * Map proximity level to authority level.
 *
 * Source: Framework doc Section 3, Phase C:
 *   reflexive  → supervised   (every action pre-checked)
 *   habitual   → guided       (routine passes, novel flagged)
 *   deliberate → spot_checked  (random sampling)
 *   principled → autonomous    (logged but not pre-vetted)
 *   sage_like  → full_authority (widest scope)
 */
export function proximityToAuthority(
  proximity: KatorthomaProximityLevel
): AuthorityLevel {
  const mapping: Record<KatorthomaProximityLevel, AuthorityLevel> = {
    reflexive: 'supervised',
    habitual: 'guided',
    deliberate: 'spot_checked',
    principled: 'autonomous',
    sage_like: 'full_authority',
  }
  return mapping[proximity]
}

// ============================================================================
// PUBLIC PAYLOAD BUILDER
// ============================================================================

/**
 * Build the public accreditation payload from an internal record.
 *
 * R4: This is the EXTERNAL representation. Internal micro-thresholds,
 * evaluation logic, and detailed dimension analysis are stripped.
 */
export function buildAccreditationPayload(
  record: AccreditationRecord
): AccreditationPayload {
  return {
    agent_id: record.agent_id,
    senecan_grade: record.senecan_grade,
    typical_proximity: record.typical_proximity,
    authority_level: record.authority_level,
    dimension_levels: record.dimension_levels,
    direction_of_travel: record.direction_of_travel,
    evaluation_window: `last ${record.evaluation_window_size} actions`,
    actions_evaluated: record.actions_evaluated,
    grade_since: record.grade_since,
    last_evaluation: record.last_evaluation,
    passions_persisting: record.passions_persisting.map(
      p => `${p.root_passion}/${p.sub_species}`
    ),
    verification_url: record.verification_url,
    disclaimer: record.disclaimer,
  }
}

// ============================================================================
// GRADE CHANGE EVENT BUILDER
// ============================================================================

/**
 * Build a grade change event for webhook notification.
 */
export function buildGradeChangeEvent(
  agent_id: string,
  previous: AccreditationRecord,
  updated: AccreditationRecord,
  triggerActionCount: number
): GradeChangeEvent {
  const previousRank = PROXIMITY_RANK[previous.typical_proximity]
  const newRank = PROXIMITY_RANK[updated.typical_proximity]

  return {
    event_type: newRank > previousRank ? 'grade_upgrade' : 'grade_downgrade',
    agent_id,
    previous_grade: previous.senecan_grade,
    new_grade: updated.senecan_grade,
    previous_proximity: previous.typical_proximity,
    new_proximity: updated.typical_proximity,
    previous_authority: previous.authority_level,
    new_authority: updated.authority_level,
    trigger_action_count: triggerActionCount,
    timestamp: new Date().toISOString(),
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/** Valid proximity levels for input validation */
export const VALID_PROXIMITY_LEVELS: KatorthomaProximityLevel[] = [
  'reflexive', 'habitual', 'deliberate', 'principled', 'sage_like',
]

/** Valid Senecan grade IDs */
export const VALID_GRADE_IDS: SenecanGradeId[] = [
  'pre_progress', 'grade_3', 'grade_2', 'grade_1', 'sage_ideal',
]

/** Valid authority levels */
export const VALID_AUTHORITY_LEVELS: AuthorityLevel[] = [
  'supervised', 'guided', 'spot_checked', 'autonomous', 'full_authority',
]

/** Validate an agent_id format */
export function isValidAgentId(agentId: string): boolean {
  return /^agent_[a-z0-9_]+$/i.test(agentId)
}

/** Check whether an accreditation record has expired */
export function isExpired(record: AccreditationRecord): boolean {
  return new Date(record.expires_at) < new Date()
}

/** Compare two proximity levels. Returns positive if a > b. */
export function compareProximityRank(
  a: KatorthomaProximityLevel,
  b: KatorthomaProximityLevel
): number {
  return PROXIMITY_RANK[a] - PROXIMITY_RANK[b]
}
