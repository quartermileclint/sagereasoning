/**
 * grade-transition-engine.ts — Grade Transition Rules
 *
 * Priority 3: Determines when an agent's accumulated evaluation pattern
 * triggers a grade change.
 *
 * "This is where the dots land in the circle — enough principled
 * evaluations and the agent earns that grade."
 *   — Framework doc Section 8, Priority 3
 *
 * The grade moves at the pace of evidence, not whim.
 *
 * Derived from:
 *   deliberation.ts — compareProximity()
 *   progress.json   — Senecan grades, grade definitions, indicators
 *   scoring.json    — katorthoma proximity levels
 *
 * Rules:
 *   R4:  Transition thresholds are internal IP — never exposed
 *   R6c: Qualitative grades only
 */

import type {
  KatorthomaProximityLevel,
  SenecanGradeId,
  DimensionLevel,
  DimensionScores,
  DirectionOfTravel,
  AccreditationRecord,
} from '../types/accreditation'

import type { WindowSnapshot } from '../types/evaluation'

import {
  PROXIMITY_TO_GRADE,
  PROXIMITY_RANK,
  proximityToAuthority,
  ACCREDITATION_DISCLAIMER,
} from '../accreditation/accreditation-record'

// ============================================================================
// TRANSITION RESULT
// ============================================================================

export type TransitionResult = {
  /** Whether a grade change occurred */
  readonly grade_changed: boolean

  /** The new accreditation record (updated or unchanged) */
  readonly record: AccreditationRecord

  /** If changed, what triggered it */
  readonly trigger: TransitionTrigger | null

  /** Human-readable explanation */
  readonly explanation: string
}

export type TransitionTrigger = {
  readonly type: 'upgrade' | 'downgrade'
  readonly from_grade: SenecanGradeId
  readonly to_grade: SenecanGradeId
  readonly from_proximity: KatorthomaProximityLevel
  readonly to_proximity: KatorthomaProximityLevel
  readonly evidence_summary: string
}

// ============================================================================
// TRANSITION THRESHOLDS (R4: internal — never exposed in API)
// ============================================================================

/**
 * Upgrade thresholds: what evidence is needed to earn the next grade.
 *
 * These thresholds are part of SageReasoning's intellectual property.
 * The decoupled architecture (Section 3) means agents can't see
 * or game these thresholds.
 */
type UpgradeThreshold = {
  /** Minimum percentage of window actions at or above target proximity */
  readonly proximity_threshold: number
  /** Minimum dimension levels required (each must meet this floor) */
  readonly min_dimension_level: DimensionLevel
  /** Minimum number of dimensions that must meet a higher bar */
  readonly elevated_dimension_count: number
  /** The higher bar for elevated dimensions */
  readonly elevated_dimension_level: DimensionLevel
  /** Direction of travel must be this or better */
  readonly min_direction: DirectionOfTravel
  /** Minimum actions in window before upgrade is possible */
  readonly min_actions: number
  /** Maximum number of persisting passions allowed */
  readonly max_persisting_passions: number
}

/**
 * Upgrade requirements per transition.
 *
 * These values are calibrated to be demanding but achievable.
 * They enforce that grade changes reflect genuine, sustained improvement.
 */
const UPGRADE_THRESHOLDS: Record<string, UpgradeThreshold> = {
  // Reflexive → Habitual: Basic awareness demonstrated
  'reflexive_to_habitual': {
    proximity_threshold: 0.55,       // 55% at habitual or above
    min_dimension_level: 'emerging',
    elevated_dimension_count: 1,
    elevated_dimension_level: 'developing',
    min_direction: 'stable',
    min_actions: 20,
    max_persisting_passions: 8,
  },
  // Habitual → Deliberate: Conscious reasoning emerging
  'habitual_to_deliberate': {
    proximity_threshold: 0.60,       // 60% at deliberate or above
    min_dimension_level: 'developing',
    elevated_dimension_count: 2,
    elevated_dimension_level: 'established',
    min_direction: 'stable',
    min_actions: 40,
    max_persisting_passions: 5,
  },
  // Deliberate → Principled: Consistent principled reasoning
  'deliberate_to_principled': {
    proximity_threshold: 0.65,       // 65% at principled or above
    min_dimension_level: 'established',
    elevated_dimension_count: 3,
    elevated_dimension_level: 'advanced',
    min_direction: 'improving',
    min_actions: 60,
    max_persisting_passions: 2,
  },
  // Principled → Sage-like: Near-complete mastery
  'principled_to_sage_like': {
    proximity_threshold: 0.75,       // 75% at sage_like
    min_dimension_level: 'advanced',
    elevated_dimension_count: 4,
    elevated_dimension_level: 'advanced',
    min_direction: 'improving',
    min_actions: 80,
    max_persisting_passions: 0,
  },
}

/**
 * Downgrade thresholds: when does regression trigger a grade drop.
 *
 * Downgrades are harder to trigger than upgrades are to earn,
 * providing hysteresis that prevents oscillation.
 */
type DowngradeThreshold = {
  /** If less than this percentage at current level, trigger downgrade */
  readonly proximity_floor: number
  /** If more than this many persisting passions, trigger concern */
  readonly passion_ceiling: number
  /** Regressing direction for N consecutive checks triggers downgrade */
  readonly regressing_checks_trigger: number
}

const DOWNGRADE_THRESHOLDS: Record<KatorthomaProximityLevel, DowngradeThreshold> = {
  sage_like: {
    proximity_floor: 0.50,
    passion_ceiling: 1,
    regressing_checks_trigger: 2,
  },
  principled: {
    proximity_floor: 0.40,
    passion_ceiling: 4,
    regressing_checks_trigger: 3,
  },
  deliberate: {
    proximity_floor: 0.35,
    passion_ceiling: 6,
    regressing_checks_trigger: 3,
  },
  habitual: {
    proximity_floor: 0.30,
    passion_ceiling: 10,
    regressing_checks_trigger: 4,
  },
  reflexive: {
    proximity_floor: 0,    // Can't downgrade below reflexive
    passion_ceiling: 999,
    regressing_checks_trigger: 999,
  },
}

// ============================================================================
// CORE ENGINE — evaluate whether a grade transition should occur
// ============================================================================

/**
 * Evaluate whether the current window snapshot warrants a grade transition.
 *
 * Called every `grade_check_interval` actions (default: 20).
 *
 * @param currentRecord - The agent's current accreditation record
 * @param snapshot - The latest window snapshot
 * @param regressingCheckCount - How many consecutive checks showed regression
 * @returns TransitionResult with the (possibly updated) record
 */
export function evaluateGradeTransition(
  currentRecord: AccreditationRecord,
  snapshot: WindowSnapshot,
  regressingCheckCount: number = 0
): TransitionResult {
  const currentProximity = currentRecord.typical_proximity

  // First check for upgrade
  const upgradeResult = checkUpgrade(currentRecord, snapshot)
  if (upgradeResult) {
    return upgradeResult
  }

  // Then check for downgrade
  const downgradeResult = checkDowngrade(currentRecord, snapshot, regressingCheckCount)
  if (downgradeResult) {
    return downgradeResult
  }

  // No transition — update record with latest snapshot data
  const updatedRecord: AccreditationRecord = {
    ...currentRecord,
    dimension_levels: snapshot.dimension_levels,
    direction_of_travel: snapshot.direction_of_travel,
    actions_evaluated: snapshot.total_actions_evaluated,
    last_evaluation: snapshot.computed_at,
    passions_persisting: snapshot.persisting_passions,
    updated_at: new Date().toISOString(),
  }

  return {
    grade_changed: false,
    record: updatedRecord,
    trigger: null,
    explanation: `Agent remains at ${currentProximity} (${currentRecord.senecan_grade}). ` +
      `Direction: ${snapshot.direction_of_travel}. ` +
      `${snapshot.actions_in_window} actions in window.`,
  }
}

// ============================================================================
// UPGRADE CHECK
// ============================================================================

function checkUpgrade(
  record: AccreditationRecord,
  snapshot: WindowSnapshot
): TransitionResult | null {
  const currentProximity = record.typical_proximity
  const nextProximity = getNextProximity(currentProximity)

  if (!nextProximity) return null // Already sage_like

  const thresholdKey = `${currentProximity}_to_${nextProximity}`
  const threshold = UPGRADE_THRESHOLDS[thresholdKey]

  if (!threshold) return null // No threshold defined

  // Check all upgrade conditions
  if (snapshot.actions_in_window < threshold.min_actions) return null

  // Check proximity distribution
  const atOrAboveTarget = countAtOrAboveFromDist(
    snapshot.proximity_distribution, nextProximity
  )
  const proximityRate = atOrAboveTarget / snapshot.actions_in_window
  if (proximityRate < threshold.proximity_threshold) return null

  // Check dimension levels
  if (!dimensionsMeetFloor(snapshot.dimension_levels, threshold.min_dimension_level)) return null
  if (!dimensionsMeetElevated(
    snapshot.dimension_levels,
    threshold.elevated_dimension_count,
    threshold.elevated_dimension_level
  )) return null

  // Check direction of travel
  if (!directionMeetsMinimum(snapshot.direction_of_travel, threshold.min_direction)) return null

  // Check persisting passions
  if (snapshot.persisting_passions.length > threshold.max_persisting_passions) return null

  // All conditions met — upgrade!
  const newGrade = PROXIMITY_TO_GRADE[nextProximity]
  const now = new Date().toISOString()

  const updatedRecord: AccreditationRecord = {
    ...record,
    senecan_grade: newGrade,
    typical_proximity: nextProximity,
    authority_level: proximityToAuthority(nextProximity),
    dimension_levels: snapshot.dimension_levels,
    direction_of_travel: snapshot.direction_of_travel,
    actions_evaluated: snapshot.total_actions_evaluated,
    grade_since: now,
    last_evaluation: snapshot.computed_at,
    passions_persisting: snapshot.persisting_passions,
    updated_at: now,
  }

  return {
    grade_changed: true,
    record: updatedRecord,
    trigger: {
      type: 'upgrade',
      from_grade: record.senecan_grade,
      to_grade: newGrade,
      from_proximity: currentProximity,
      to_proximity: nextProximity,
      evidence_summary: `${(proximityRate * 100).toFixed(0)}% of ${snapshot.actions_in_window} actions at ${nextProximity} or above. ` +
        `Direction: ${snapshot.direction_of_travel}. ` +
        `Persisting passions: ${snapshot.persisting_passions.length}.`,
    },
    explanation: `Agent upgraded from ${currentProximity} to ${nextProximity}. ` +
      `Grade: ${record.senecan_grade} → ${newGrade}. ` +
      `Authority: ${record.authority_level} → ${proximityToAuthority(nextProximity)}.`,
  }
}

// ============================================================================
// DOWNGRADE CHECK
// ============================================================================

function checkDowngrade(
  record: AccreditationRecord,
  snapshot: WindowSnapshot,
  regressingCheckCount: number
): TransitionResult | null {
  const currentProximity = record.typical_proximity
  if (currentProximity === 'reflexive') return null // Can't go lower

  const threshold = DOWNGRADE_THRESHOLDS[currentProximity]

  // Check proximity floor
  const atCurrentOrAbove = countAtOrAboveFromDist(
    snapshot.proximity_distribution, currentProximity
  )
  const currentRate = atCurrentOrAbove / Math.max(1, snapshot.actions_in_window)
  const belowFloor = currentRate < threshold.proximity_floor

  // Check passion ceiling
  const aboveCeiling = snapshot.persisting_passions.length > threshold.passion_ceiling

  // Check regression count
  const persistentRegression = regressingCheckCount >= threshold.regressing_checks_trigger

  // Downgrade requires at least 2 of 3 conditions
  const conditions = [belowFloor, aboveCeiling, persistentRegression]
  const conditionsMet = conditions.filter(Boolean).length

  if (conditionsMet < 2) return null

  // Downgrade triggered
  const previousProximity = getPreviousProximity(currentProximity)!
  const newGrade = PROXIMITY_TO_GRADE[previousProximity]
  const now = new Date().toISOString()

  const updatedRecord: AccreditationRecord = {
    ...record,
    senecan_grade: newGrade,
    typical_proximity: previousProximity,
    authority_level: proximityToAuthority(previousProximity),
    dimension_levels: snapshot.dimension_levels,
    direction_of_travel: snapshot.direction_of_travel,
    actions_evaluated: snapshot.total_actions_evaluated,
    grade_since: now,
    last_evaluation: snapshot.computed_at,
    passions_persisting: snapshot.persisting_passions,
    updated_at: now,
  }

  const reasons: string[] = []
  if (belowFloor) reasons.push(`proximity below floor (${(currentRate * 100).toFixed(0)}% < ${(threshold.proximity_floor * 100).toFixed(0)}%)`)
  if (aboveCeiling) reasons.push(`${snapshot.persisting_passions.length} persisting passions (limit: ${threshold.passion_ceiling})`)
  if (persistentRegression) reasons.push(`${regressingCheckCount} consecutive regressing checks`)

  return {
    grade_changed: true,
    record: updatedRecord,
    trigger: {
      type: 'downgrade',
      from_grade: record.senecan_grade,
      to_grade: newGrade,
      from_proximity: currentProximity,
      to_proximity: previousProximity,
      evidence_summary: `Downgrade triggered by: ${reasons.join('; ')}.`,
    },
    explanation: `Agent downgraded from ${currentProximity} to ${previousProximity}. ` +
      `Grade: ${record.senecan_grade} → ${newGrade}. ` +
      `Authority: ${record.authority_level} → ${proximityToAuthority(previousProximity)}. ` +
      `Reasons: ${reasons.join('; ')}.`,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getNextProximity(current: KatorthomaProximityLevel): KatorthomaProximityLevel | null {
  const order: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
  const idx = order.indexOf(current)
  return idx < order.length - 1 ? order[idx + 1] : null
}

function getPreviousProximity(current: KatorthomaProximityLevel): KatorthomaProximityLevel | null {
  const order: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
  const idx = order.indexOf(current)
  return idx > 0 ? order[idx - 1] : null
}

function countAtOrAboveFromDist(
  dist: Record<KatorthomaProximityLevel, number>,
  level: KatorthomaProximityLevel
): number {
  const threshold = PROXIMITY_RANK[level]
  let count = 0
  for (const [lvl, cnt] of Object.entries(dist)) {
    if (PROXIMITY_RANK[lvl as KatorthomaProximityLevel] >= threshold) {
      count += cnt
    }
  }
  return count
}

const DIMENSION_LEVEL_RANK: Record<DimensionLevel, number> = {
  emerging: 0,
  developing: 1,
  established: 2,
  advanced: 3,
}

function dimensionsMeetFloor(
  levels: DimensionScores,
  floor: DimensionLevel
): boolean {
  const floorRank = DIMENSION_LEVEL_RANK[floor]
  return Object.values(levels).every(
    level => DIMENSION_LEVEL_RANK[level as DimensionLevel] >= floorRank
  )
}

function dimensionsMeetElevated(
  levels: DimensionScores,
  requiredCount: number,
  elevatedLevel: DimensionLevel
): boolean {
  const elevatedRank = DIMENSION_LEVEL_RANK[elevatedLevel]
  const count = Object.values(levels).filter(
    level => DIMENSION_LEVEL_RANK[level as DimensionLevel] >= elevatedRank
  ).length
  return count >= requiredCount
}

const DIRECTION_RANK: Record<DirectionOfTravel, number> = {
  regressing: 0,
  stable: 1,
  improving: 2,
}

function directionMeetsMinimum(
  actual: DirectionOfTravel,
  minimum: DirectionOfTravel
): boolean {
  return DIRECTION_RANK[actual] >= DIRECTION_RANK[minimum]
}
