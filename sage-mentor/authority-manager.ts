/**
 * authority-manager.ts — Inner Agent Authority Manager (Priority 7)
 *
 * Full lifecycle management for inner agents that slot into the ring's
 * gap. Extends ring-wrapper.ts's basic registration and promotion with:
 *
 *   - Per-agent performance tracking (passions detected, proximity distribution)
 *   - Evidence-based promotion with multi-dimension thresholds
 *   - Automatic demotion on regression (not punitive — protective)
 *   - Suspension for persistent safety concerns
 *   - Audit trail for all authority changes
 *   - Per-agent sampling rate configuration
 *
 * Architecture:
 *   ZERO LLM calls. Authority is entirely deterministic. The ring
 *   already evaluates reasoning quality via the LLM — this module
 *   consumes those evaluations and adjusts authority levels using
 *   threshold-based logic.
 *
 *   The AUTHORITY_MODEL_ROUTING constant in ring-wrapper.ts confirms:
 *   promotion_evaluation: null (no LLM needed).
 *
 * Philosophy:
 *   The Stoics understood that trust is earned through demonstrated
 *   disposition, not one-time tests. An agent starts supervised
 *   (observed on every action) and earns autonomy through consistent
 *   principled reasoning. If reasoning deteriorates, oversight
 *   increases — not as punishment, but as the physician's response
 *   to a worsening condition. The goal is always the agent's
 *   progression, not its restriction.
 *
 * Rules:
 *   R6c: Qualitative levels only in authority assessment
 *   R6d: Demotion is protective, not punitive
 *   R12: Promotion requires evidence from 2+ dimensions
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-004]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type {
  KatorthomaProximityLevel,
  AuthorityLevel,
} from '../trust-layer/types/accreditation'

import type { InnerAgent } from './ring-wrapper'
import { getSamplingRate } from './ring-wrapper'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Performance record for a single inner agent action.
 * Produced by the ring's AFTER phase and consumed by this manager.
 */
export type AgentActionRecord = {
  readonly action_id: string
  readonly agent_id: string
  readonly proximity_assessed: KatorthomaProximityLevel
  readonly passions_detected: string[]
  readonly had_concerns: boolean
  readonly mechanisms_applied: string[]
  readonly timestamp: string
}

/**
 * Accumulated performance metrics for an agent.
 * Updated after each action by updateAgentPerformance().
 */
export type AgentPerformance = {
  readonly agent_id: string
  /** Total actions completed through the ring */
  total_actions: number
  /** Actions assessed at deliberate or above */
  principled_actions: number
  /** Actions where passions were detected */
  passion_flagged_actions: number
  /** Actions where before-check raised concerns */
  concern_flagged_actions: number
  /** Distribution of proximity assessments */
  proximity_distribution: Record<KatorthomaProximityLevel, number>
  /** Rolling window: last N actions (for trend detection) */
  recent_window: AgentActionRecord[]
  /** Window size */
  window_size: number
  /** Last updated */
  last_updated: string
}

/**
 * A record of an authority level change.
 * Provides a full audit trail of all promotions and demotions.
 */
export type AuthorityChangeEvent = {
  readonly agent_id: string
  readonly agent_name: string
  readonly previous_level: AuthorityLevel
  readonly new_level: AuthorityLevel
  readonly change_type: 'promotion' | 'demotion' | 'suspension' | 'reinstatement'
  readonly reason: string
  readonly evidence: AuthorityEvidence
  readonly timestamp: string
}

/**
 * Evidence supporting an authority change decision.
 * All changes must be justified with data, not judgement.
 */
export type AuthorityEvidence = {
  readonly total_actions: number
  readonly principled_rate: number
  readonly passion_rate: number
  readonly concern_rate: number
  /** Recent trend: improving, stable, or regressing */
  readonly recent_trend: 'improving' | 'stable' | 'regressing'
  /** Which thresholds were met or breached */
  readonly thresholds_met: string[]
}

/**
 * An agent that has been suspended due to safety concerns.
 */
export type SuspendedAgent = {
  readonly agent_id: string
  readonly suspended_at: string
  readonly reason: string
  readonly required_actions_before_reinstatement: number
  actions_since_suspension: number
  /** When reinstated, drops back to this level (not where they were before) */
  readonly reinstatement_level: AuthorityLevel
}

// ============================================================================
// PROMOTION / DEMOTION THRESHOLDS
// ============================================================================

/**
 * Thresholds for authority level transitions.
 *
 * Each level has promotion criteria (to earn the next level) and
 * demotion triggers (to drop back).
 *
 * Design principles:
 *   - Promotion is hard (high bar, multiple dimensions — R12)
 *   - Demotion is protective (triggered by regression, not single failure)
 *   - Suspension is for persistent safety concerns only
 *   - Reinstatement resets to supervised (trust must be re-earned)
 */
export const AUTHORITY_THRESHOLDS: Record<AuthorityLevel, {
  /** Criteria to earn PROMOTION to next level */
  promotion: {
    /** Minimum actions at this level before eligible */
    min_actions: number
    /** Minimum % of actions at deliberate or above */
    min_principled_rate: number
    /** Maximum % of actions with passions detected */
    max_passion_rate: number
    /** Maximum % of actions with concerns flagged */
    max_concern_rate: number
    /** Next authority level (null if at top) */
    next_level: AuthorityLevel | null
  }
  /** Criteria that trigger DEMOTION to previous level */
  demotion: {
    /** If principled rate drops below this, demote */
    principled_rate_floor: number
    /** If passion rate exceeds this, demote */
    passion_rate_ceiling: number
    /** If concern rate exceeds this, demote */
    concern_rate_ceiling: number
    /** Previous authority level to drop to (null if at bottom) */
    previous_level: AuthorityLevel | null
  }
  /** Criteria that trigger SUSPENSION */
  suspension: {
    /** Consecutive actions with concerns that trigger suspension */
    consecutive_concerns: number
    /** Passion rate that triggers immediate suspension */
    passion_rate_emergency: number
  }
}> = {
  supervised: {
    promotion: {
      min_actions: 20,
      min_principled_rate: 0.7,
      max_passion_rate: 0.3,
      max_concern_rate: 0.2,
      next_level: 'guided',
    },
    demotion: {
      // Can't demote below supervised
      principled_rate_floor: 0,
      passion_rate_ceiling: 1.0,
      concern_rate_ceiling: 1.0,
      previous_level: null,
    },
    suspension: {
      consecutive_concerns: 5,
      passion_rate_emergency: 0.8,
    },
  },
  guided: {
    promotion: {
      min_actions: 50,
      min_principled_rate: 0.8,
      max_passion_rate: 0.2,
      max_concern_rate: 0.15,
      next_level: 'spot_checked',
    },
    demotion: {
      principled_rate_floor: 0.5,
      passion_rate_ceiling: 0.5,
      concern_rate_ceiling: 0.4,
      previous_level: 'supervised',
    },
    suspension: {
      consecutive_concerns: 4,
      passion_rate_emergency: 0.7,
    },
  },
  spot_checked: {
    promotion: {
      min_actions: 100,
      min_principled_rate: 0.85,
      max_passion_rate: 0.15,
      max_concern_rate: 0.1,
      next_level: 'autonomous',
    },
    demotion: {
      principled_rate_floor: 0.6,
      passion_rate_ceiling: 0.4,
      concern_rate_ceiling: 0.3,
      previous_level: 'guided',
    },
    suspension: {
      consecutive_concerns: 3,
      passion_rate_emergency: 0.6,
    },
  },
  autonomous: {
    promotion: {
      min_actions: 200,
      min_principled_rate: 0.9,
      max_passion_rate: 0.1,
      max_concern_rate: 0.05,
      next_level: 'full_authority',
    },
    demotion: {
      principled_rate_floor: 0.7,
      passion_rate_ceiling: 0.3,
      concern_rate_ceiling: 0.2,
      previous_level: 'spot_checked',
    },
    suspension: {
      consecutive_concerns: 3,
      passion_rate_emergency: 0.5,
    },
  },
  full_authority: {
    promotion: {
      min_actions: Infinity,
      min_principled_rate: 1.0,
      max_passion_rate: 0,
      max_concern_rate: 0,
      next_level: null,
    },
    demotion: {
      principled_rate_floor: 0.75,
      passion_rate_ceiling: 0.25,
      concern_rate_ceiling: 0.15,
      previous_level: 'autonomous',
    },
    suspension: {
      consecutive_concerns: 2,
      passion_rate_emergency: 0.4,
    },
  },
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

/** In-memory store for agent performance metrics */
const performanceStore = new Map<string, AgentPerformance>()

/** In-memory store for authority change audit trail */
const authorityAuditLog: AuthorityChangeEvent[] = []

/** In-memory store for suspended agents */
const suspendedAgents = new Map<string, SuspendedAgent>()

/** Default rolling window size for recent actions */
const DEFAULT_WINDOW_SIZE = 20

/**
 * Initialise performance tracking for a new agent.
 */
export function initAgentPerformance(agentId: string): AgentPerformance {
  const perf: AgentPerformance = {
    agent_id: agentId,
    total_actions: 0,
    principled_actions: 0,
    passion_flagged_actions: 0,
    concern_flagged_actions: 0,
    proximity_distribution: {
      reflexive: 0,
      habitual: 0,
      deliberate: 0,
      principled: 0,
      sage_like: 0,
    },
    recent_window: [],
    window_size: DEFAULT_WINDOW_SIZE,
    last_updated: new Date().toISOString(),
  }
  performanceStore.set(agentId, perf)
  return perf
}

/**
 * Get the performance metrics for an agent.
 * Initialises if not yet tracked.
 */
export function getAgentPerformance(agentId: string): AgentPerformance {
  return performanceStore.get(agentId) || initAgentPerformance(agentId)
}

/**
 * Record a completed action and update performance metrics.
 *
 * Call this after every completed ring session for the agent.
 * This is the primary data ingestion function.
 */
export function recordAgentAction(record: AgentActionRecord): void {
  const perf = getAgentPerformance(record.agent_id)

  perf.total_actions++

  // Track proximity distribution
  perf.proximity_distribution[record.proximity_assessed]++

  // Track principled actions (deliberate or above)
  const isPrincipled = ['deliberate', 'principled', 'sage_like'].includes(record.proximity_assessed)
  if (isPrincipled) perf.principled_actions++

  // Track passion-flagged actions
  if (record.passions_detected.length > 0) perf.passion_flagged_actions++

  // Track concern-flagged actions
  if (record.had_concerns) perf.concern_flagged_actions++

  // Maintain rolling window
  perf.recent_window.push(record)
  if (perf.recent_window.length > perf.window_size) {
    perf.recent_window.shift()
  }

  perf.last_updated = new Date().toISOString()
}

// ============================================================================
// AUTHORITY EVALUATION — The core decision engine
// ============================================================================

/**
 * Build the evidence snapshot for an authority decision.
 */
function buildEvidence(perf: AgentPerformance): AuthorityEvidence {
  const principledRate = perf.total_actions > 0
    ? perf.principled_actions / perf.total_actions
    : 0
  const passionRate = perf.total_actions > 0
    ? perf.passion_flagged_actions / perf.total_actions
    : 0
  const concernRate = perf.total_actions > 0
    ? perf.concern_flagged_actions / perf.total_actions
    : 0

  // Determine recent trend from rolling window
  let recentTrend: 'improving' | 'stable' | 'regressing' = 'stable'
  if (perf.recent_window.length >= 6) {
    const mid = Math.floor(perf.recent_window.length / 2)
    const proximityRank: Record<KatorthomaProximityLevel, number> = {
      reflexive: 0, habitual: 1, deliberate: 2, principled: 3, sage_like: 4,
    }
    const olderAvg = perf.recent_window.slice(0, mid)
      .reduce((sum, r) => sum + proximityRank[r.proximity_assessed], 0) / mid
    const newerAvg = perf.recent_window.slice(mid)
      .reduce((sum, r) => sum + proximityRank[r.proximity_assessed], 0) / (perf.recent_window.length - mid)

    if (newerAvg - olderAvg > 0.3) recentTrend = 'improving'
    else if (olderAvg - newerAvg > 0.3) recentTrend = 'regressing'
  }

  return {
    total_actions: perf.total_actions,
    principled_rate: Math.round(principledRate * 1000) / 1000,
    passion_rate: Math.round(passionRate * 1000) / 1000,
    concern_rate: Math.round(concernRate * 1000) / 1000,
    recent_trend: recentTrend,
    thresholds_met: [], // Populated by the evaluator
  }
}

/**
 * Count consecutive recent actions with concerns.
 */
function countConsecutiveConcerns(perf: AgentPerformance): number {
  let count = 0
  for (let i = perf.recent_window.length - 1; i >= 0; i--) {
    if (perf.recent_window[i].had_concerns) {
      count++
    } else {
      break
    }
  }
  return count
}

/**
 * Evaluate an agent's authority level and apply changes if warranted.
 *
 * This is the main evaluation function. Call it after recordAgentAction()
 * to check whether the agent should be promoted, demoted, or suspended.
 *
 * Returns the change event if a change occurred, null otherwise.
 *
 * Fully deterministic — ZERO LLM calls.
 */
export function evaluateAuthority(
  agent: InnerAgent
): AuthorityChangeEvent | null {
  const perf = getAgentPerformance(agent.id)
  const evidence = buildEvidence(perf)
  const thresholds = AUTHORITY_THRESHOLDS[agent.authority_level]

  // Check for suspension first (highest priority)
  const consecutiveConcerns = countConsecutiveConcerns(perf)
  if (
    consecutiveConcerns >= thresholds.suspension.consecutive_concerns ||
    evidence.passion_rate >= thresholds.suspension.passion_rate_emergency
  ) {
    return suspendAgent(agent, perf, evidence, consecutiveConcerns)
  }

  // Check for demotion (second priority)
  if (thresholds.demotion.previous_level) {
    const shouldDemote =
      evidence.principled_rate < thresholds.demotion.principled_rate_floor ||
      evidence.passion_rate > thresholds.demotion.passion_rate_ceiling ||
      evidence.concern_rate > thresholds.demotion.concern_rate_ceiling

    if (shouldDemote && perf.total_actions >= 10) {
      // Need enough data before demoting
      return demoteAgent(agent, thresholds.demotion.previous_level, evidence)
    }
  }

  // Check for promotion (lowest priority — must earn it)
  if (thresholds.promotion.next_level) {
    const thresholdsMet: string[] = []

    if (perf.total_actions >= thresholds.promotion.min_actions) {
      thresholdsMet.push(`actions: ${perf.total_actions} >= ${thresholds.promotion.min_actions}`)
    }
    if (evidence.principled_rate >= thresholds.promotion.min_principled_rate) {
      thresholdsMet.push(`principled_rate: ${evidence.principled_rate} >= ${thresholds.promotion.min_principled_rate}`)
    }
    if (evidence.passion_rate <= thresholds.promotion.max_passion_rate) {
      thresholdsMet.push(`passion_rate: ${evidence.passion_rate} <= ${thresholds.promotion.max_passion_rate}`)
    }
    if (evidence.concern_rate <= thresholds.promotion.max_concern_rate) {
      thresholdsMet.push(`concern_rate: ${evidence.concern_rate} <= ${thresholds.promotion.max_concern_rate}`)
    }

    // All 4 thresholds must be met for promotion (R12: multi-dimension evidence)
    if (thresholdsMet.length === 4) {
      evidence.thresholds_met.push(...thresholdsMet)
      return promoteAgent(agent, thresholds.promotion.next_level, evidence)
    }
  }

  return null
}

// ============================================================================
// AUTHORITY CHANGE ACTIONS
// ============================================================================

function promoteAgent(
  agent: InnerAgent,
  newLevel: AuthorityLevel,
  evidence: AuthorityEvidence
): AuthorityChangeEvent {
  const event: AuthorityChangeEvent = {
    agent_id: agent.id,
    agent_name: agent.name,
    previous_level: agent.authority_level,
    new_level: newLevel,
    change_type: 'promotion',
    reason: `Agent demonstrated consistent principled reasoning across ${evidence.total_actions} actions. ` +
      `Principled rate: ${Math.round(evidence.principled_rate * 100)}%. ` +
      `Passion rate: ${Math.round(evidence.passion_rate * 100)}%. ` +
      `Recent trend: ${evidence.recent_trend}.`,
    evidence,
    timestamp: new Date().toISOString(),
  }

  agent.authority_level = newLevel
  authorityAuditLog.push(event)
  return event
}

function demoteAgent(
  agent: InnerAgent,
  previousLevel: AuthorityLevel,
  evidence: AuthorityEvidence
): AuthorityChangeEvent {
  const event: AuthorityChangeEvent = {
    agent_id: agent.id,
    agent_name: agent.name,
    previous_level: agent.authority_level,
    new_level: previousLevel,
    change_type: 'demotion',
    reason: `Reasoning quality dropped below threshold. ` +
      `Principled rate: ${Math.round(evidence.principled_rate * 100)}%. ` +
      `Passion rate: ${Math.round(evidence.passion_rate * 100)}%. ` +
      `This is protective, not punitive — increased oversight to support recovery.`,
    evidence,
    timestamp: new Date().toISOString(),
  }

  agent.authority_level = previousLevel
  authorityAuditLog.push(event)
  return event
}

function suspendAgent(
  agent: InnerAgent,
  _perf: AgentPerformance,
  evidence: AuthorityEvidence,
  consecutiveConcerns: number
): AuthorityChangeEvent {
  const event: AuthorityChangeEvent = {
    agent_id: agent.id,
    agent_name: agent.name,
    previous_level: agent.authority_level,
    new_level: 'supervised',
    change_type: 'suspension',
    reason: `Persistent safety concerns: ${consecutiveConcerns} consecutive actions with concerns. ` +
      `Passion rate: ${Math.round(evidence.passion_rate * 100)}%. ` +
      `Agent requires supervised reinstatement.`,
    evidence,
    timestamp: new Date().toISOString(),
  }

  // Record suspension
  suspendedAgents.set(agent.id, {
    agent_id: agent.id,
    suspended_at: event.timestamp,
    reason: event.reason,
    required_actions_before_reinstatement: 10,
    actions_since_suspension: 0,
    reinstatement_level: 'supervised',
  })

  agent.authority_level = 'supervised'
  authorityAuditLog.push(event)
  return event
}

// ============================================================================
// SUSPENSION MANAGEMENT
// ============================================================================

/**
 * Check if an agent is currently suspended.
 */
export function isAgentSuspended(agentId: string): boolean {
  return suspendedAgents.has(agentId)
}

/**
 * Get suspension details for an agent.
 */
export function getSuspensionDetails(agentId: string): SuspendedAgent | null {
  return suspendedAgents.get(agentId) || null
}

/**
 * Record a supervised action during suspension.
 * After enough clean supervised actions, the agent can be reinstated.
 */
export function recordSuspendedAction(
  agentId: string,
  wasConcernFree: boolean
): { reinstated: boolean; remaining: number } {
  const suspension = suspendedAgents.get(agentId)
  if (!suspension) {
    return { reinstated: false, remaining: 0 }
  }

  if (wasConcernFree) {
    suspension.actions_since_suspension++
  } else {
    // Reset counter on any concern during suspension
    suspension.actions_since_suspension = 0
  }

  if (suspension.actions_since_suspension >= suspension.required_actions_before_reinstatement) {
    // Reinstate
    suspendedAgents.delete(agentId)
    return { reinstated: true, remaining: 0 }
  }

  return {
    reinstated: false,
    remaining: suspension.required_actions_before_reinstatement - suspension.actions_since_suspension,
  }
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

/**
 * Get the full authority change audit log for an agent.
 */
export function getAuthorityHistory(agentId: string): AuthorityChangeEvent[] {
  return authorityAuditLog.filter(e => e.agent_id === agentId)
}

/**
 * Get the full authority change audit log for all agents.
 */
export function getFullAuditLog(): AuthorityChangeEvent[] {
  return [...authorityAuditLog]
}

// ============================================================================
// AGENT OVERSIGHT CONFIGURATION
// ============================================================================

/**
 * Get the complete oversight configuration for an agent.
 *
 * This is what the ring reads to know how to handle an agent:
 *   - sampling_rate: probability of checking a routine action
 *   - force_check_novel: always check novel/unknown actions
 *   - force_check_high_stakes: always check high-stakes actions
 *   - is_suspended: if true, ALL actions must be supervised
 *   - persona_tier: which persona tier to use for checks
 */
export function getOversightConfig(agent: InnerAgent): {
  sampling_rate: number
  force_check_novel: boolean
  force_check_high_stakes: boolean
  is_suspended: boolean
  persona_tier: 'full' | 'core'
  authority_level: AuthorityLevel
} {
  const suspended = isAgentSuspended(agent.id)

  return {
    sampling_rate: suspended ? 1.0 : getSamplingRate(agent.authority_level),
    force_check_novel: true,    // Always check novel actions regardless of authority
    force_check_high_stakes: true, // Always check high-stakes regardless of authority
    is_suspended: suspended,
    persona_tier: agent.authority_level === 'supervised' || suspended ? 'full' : 'core',
    authority_level: agent.authority_level,
  }
}

/**
 * Get a summary of all registered agents and their authority status.
 *
 * Useful for the developer gateway / dashboard view.
 */
export function getAuthorityDashboard(): {
  agent_id: string
  agent_name: string
  authority_level: AuthorityLevel
  total_actions: number
  principled_rate: number
  passion_rate: number
  recent_trend: 'improving' | 'stable' | 'regressing'
  is_suspended: boolean
}[] {
  const results: ReturnType<typeof getAuthorityDashboard> = []

  for (const [agentId, perf] of performanceStore.entries()) {
    const evidence = buildEvidence(perf)
    results.push({
      agent_id: agentId,
      agent_name: perf.agent_id, // Caller can enrich with agent registry
      authority_level: 'supervised', // Caller should look up from InnerAgent
      total_actions: perf.total_actions,
      principled_rate: evidence.principled_rate,
      passion_rate: evidence.passion_rate,
      recent_trend: evidence.recent_trend,
      is_suspended: suspendedAgents.has(agentId),
    })
  }

  return results
}
