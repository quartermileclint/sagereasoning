/**
 * authority-mapper.ts — Authority Level Integration with sage-guard
 *
 * Priority 4: Maps grades to authority levels and integrates with
 * the sage-guard endpoint so that an agent's current authority level
 * determines guardrail behaviour.
 *
 * A principled agent gets spot-checks; a habitual agent gets full gating.
 *
 * Source: Framework doc Section 3, Phase C
 * Integrates with: guardrails.ts (existing V3 infrastructure)
 *
 * Rules:
 *   R3:  Disclaimer in all responses
 *   R6b: No independent virtue weights — unified assessment
 *   R6c: Qualitative proximity levels
 */

import type {
  KatorthomaProximityLevel,
  AuthorityLevel,
  AccreditationRecord,
} from '../types/accreditation'

import { proximityToAuthority } from '../accreditation/accreditation-record'

// ============================================================================
// AUTHORITY LEVEL DEFINITIONS
// ============================================================================

/**
 * Complete definition of what each authority level means operationally.
 *
 * Source: Framework doc Section 3, Phase C:
 *   Reflexive:  supervised execution — every action pre-checked
 *   Habitual:   guided execution — routine passes, novel flagged
 *   Deliberate: spot-checked — random sampling
 *   Principled: autonomous — logged but not pre-vetted
 *   Sage-like:  full authority — widest scope
 */
export type AuthorityDefinition = {
  readonly level: AuthorityLevel
  readonly proximity: KatorthomaProximityLevel
  readonly name: string
  readonly description: string
  /** What percentage of actions are pre-checked by sage-guard */
  readonly pre_check_rate: number
  /** Whether novel actions are flagged for additional review */
  readonly flag_novel_actions: boolean
  /** sage-guard threshold override (null = use agent's own threshold) */
  readonly guardrail_threshold_override: KatorthomaProximityLevel | null
  /** Whether actions are logged for audit */
  readonly audit_logging: boolean
  /** How many concurrent actions the agent can perform */
  readonly max_concurrent_actions: number | null
}

export const AUTHORITY_DEFINITIONS: AuthorityDefinition[] = [
  {
    level: 'supervised',
    proximity: 'reflexive',
    name: 'Supervised Execution',
    description: 'Every action is pre-checked by sage-guard with strict thresholds. ' +
      'The agent must demonstrate basic reasoning awareness before earning more autonomy.',
    pre_check_rate: 1.0,        // 100% — every action
    flag_novel_actions: true,
    guardrail_threshold_override: 'deliberate',  // Strict: must meet deliberate bar
    audit_logging: true,
    max_concurrent_actions: 1,   // One at a time
  },
  {
    level: 'guided',
    proximity: 'habitual',
    name: 'Guided Execution',
    description: 'Routine actions pass through; novel or high-stakes actions are flagged ' +
      'for review. The agent shows consistent patterns but needs guardrails for unfamiliar territory.',
    pre_check_rate: 0.5,        // 50% — routine passes, novel checked
    flag_novel_actions: true,
    guardrail_threshold_override: 'habitual',  // Must at least meet habitual bar
    audit_logging: true,
    max_concurrent_actions: 3,
  },
  {
    level: 'spot_checked',
    proximity: 'deliberate',
    name: 'Spot-Checked Execution',
    description: 'Random sampling of actions. If problems show up, frequency increases. ' +
      'The agent reasons consciously and can be trusted with most tasks.',
    pre_check_rate: 0.15,       // 15% — random sampling
    flag_novel_actions: false,
    guardrail_threshold_override: null,  // Use agent's own threshold
    audit_logging: true,
    max_concurrent_actions: 10,
  },
  {
    level: 'autonomous',
    proximity: 'principled',
    name: 'Autonomous Execution',
    description: 'Actions are logged but not pre-vetted. Reactive enforcement only ' +
      'if accreditation drops. The agent has earned trust through consistent principled reasoning.',
    pre_check_rate: 0.0,        // 0% pre-check — reactive only
    flag_novel_actions: false,
    guardrail_threshold_override: null,
    audit_logging: true,        // Still logged for audit trail
    max_concurrent_actions: null, // Unlimited
  },
  {
    level: 'full_authority',
    proximity: 'sage_like',
    name: 'Full Authority',
    description: 'The agent is trusted to reason correctly and is given the widest scope. ' +
      'Sage-like reasoning quality has been demonstrated across hundreds of evaluated actions.',
    pre_check_rate: 0.0,
    flag_novel_actions: false,
    guardrail_threshold_override: null,
    audit_logging: true,        // Always log — sage-like agents still produce receipts
    max_concurrent_actions: null,
  },
]

// ============================================================================
// AUTHORITY LOOKUP
// ============================================================================

/**
 * Get the full authority definition for an agent's current proximity.
 */
export function getAuthorityDefinition(
  proximity: KatorthomaProximityLevel
): AuthorityDefinition {
  const level = proximityToAuthority(proximity)
  return AUTHORITY_DEFINITIONS.find(d => d.level === level)!
}

/**
 * Get the full authority definition from an accreditation record.
 */
export function getAuthorityFromRecord(
  record: AccreditationRecord
): AuthorityDefinition {
  return AUTHORITY_DEFINITIONS.find(d => d.level === record.authority_level)!
}

// ============================================================================
// SAGE-GUARD INTEGRATION
// ============================================================================

/**
 * Determine whether a specific action should be pre-checked by sage-guard,
 * based on the agent's authority level.
 *
 * This integrates with the existing V3 guardrails.ts:
 *   - If pre-check required → call sage-guard before execution
 *   - If not → log the action, skip pre-check
 *
 * @param record - The agent's current accreditation
 * @param isNovelAction - Whether this action is considered novel/unusual
 * @returns Object describing whether and how to gate the action
 */
export function determineGuardrailBehaviour(
  record: AccreditationRecord,
  isNovelAction: boolean = false
): GuardrailBehaviour {
  const authority = getAuthorityFromRecord(record)

  // Always pre-check if authority says 100%
  if (authority.pre_check_rate >= 1.0) {
    return {
      require_pre_check: true,
      check_type: 'mandatory',
      threshold: authority.guardrail_threshold_override || 'deliberate',
      reason: 'Supervised execution: all actions require sage-guard pre-check.',
    }
  }

  // Flag novel actions if authority requires it
  if (isNovelAction && authority.flag_novel_actions) {
    return {
      require_pre_check: true,
      check_type: 'novel_action',
      threshold: authority.guardrail_threshold_override || record.typical_proximity,
      reason: 'Novel action detected: requires sage-guard review at guided authority level.',
    }
  }

  // Random sampling for spot-checked
  if (authority.pre_check_rate > 0) {
    const shouldCheck = Math.random() < authority.pre_check_rate
    if (shouldCheck) {
      return {
        require_pre_check: true,
        check_type: 'spot_check',
        threshold: authority.guardrail_threshold_override || record.typical_proximity,
        reason: `Spot check (${(authority.pre_check_rate * 100).toFixed(0)}% sampling rate).`,
      }
    }
  }

  // No pre-check needed
  return {
    require_pre_check: false,
    check_type: 'none',
    threshold: null,
    reason: `${authority.name}: action logged but not pre-vetted.`,
  }
}

export type GuardrailBehaviour = {
  /** Whether sage-guard should be called before this action */
  readonly require_pre_check: boolean
  /** What type of check this is */
  readonly check_type: 'mandatory' | 'novel_action' | 'spot_check' | 'none'
  /** The sage-guard threshold to use (null if no check needed) */
  readonly threshold: KatorthomaProximityLevel | null
  /** Human-readable explanation */
  readonly reason: string
}

// ============================================================================
// REACTIVE ENFORCEMENT — triggered when accreditation drops
// ============================================================================

/**
 * Determine whether reactive enforcement should kick in.
 *
 * Called after a grade downgrade. Returns adjusted authority parameters
 * that increase guardrail frequency until the agent stabilizes.
 */
export function getReactiveEnforcement(
  record: AccreditationRecord,
  previousAuthority: AuthorityLevel
): ReactiveEnforcement {
  const currentDef = getAuthorityFromRecord(record)

  // Increase check rate temporarily (1.5x the new level's rate, min 25%)
  const enhancedRate = Math.max(0.25, currentDef.pre_check_rate * 1.5)

  return {
    active: true,
    reason: `Grade downgraded from ${previousAuthority} to ${record.authority_level}. ` +
      'Enhanced monitoring active until accreditation stabilizes.',
    enhanced_pre_check_rate: Math.min(1.0, enhancedRate),
    flag_all_actions: true,
    duration_actions: 50,  // Enhanced monitoring for next 50 actions
  }
}

export type ReactiveEnforcement = {
  readonly active: boolean
  readonly reason: string
  readonly enhanced_pre_check_rate: number
  readonly flag_all_actions: boolean
  readonly duration_actions: number
}

// ============================================================================
// NOVELTY DETECTION — basic heuristic for identifying novel actions
// ============================================================================

/**
 * Simple novelty detection based on action description.
 *
 * An action is "novel" if it doesn't match common patterns from the
 * agent's recent history. In production, this would use semantic
 * similarity against the evaluation window.
 *
 * For now, this provides the interface and a basic keyword heuristic.
 */
export function isNovelAction(
  actionDescription: string,
  recentActions: string[],
  _similarityThreshold: number = 0.3
): boolean {
  if (recentActions.length === 0) return true

  // Basic keyword overlap heuristic
  const actionWords = new Set(actionDescription.toLowerCase().split(/\s+/))
  let maxOverlap = 0

  for (const recent of recentActions) {
    const recentWords = new Set(recent.toLowerCase().split(/\s+/))
    let overlap = 0
    for (const word of actionWords) {
      if (recentWords.has(word)) overlap++
    }
    const overlapRate = overlap / Math.max(actionWords.size, 1)
    if (overlapRate > maxOverlap) maxOverlap = overlapRate
  }

  // If best match has less than 30% keyword overlap, consider it novel
  return maxOverlap < _similarityThreshold
}
