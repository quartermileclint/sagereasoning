/**
 * sage-orchestrator/presets.ts — Preset configurations for the 4 internal Sage agents.
 *
 * Each preset defines:
 *   - Which brain to load (via a BrainLoader adapter)
 *   - Which product endpoints to use for Stoic evaluation and review
 *   - Decision authority gate rules specific to the agent's domain
 *   - Cost thresholds
 *
 * Session 9 Decision: "The only thing that varies per agent is which brain
 * is loaded and which product endpoints it typically calls. The governance
 * structure is identical across all four."
 *
 * These presets are designed for SageReasoning's internal use. Customer
 * agents (startup package) create their own configs using the same
 * AgentPipelineConfig interface.
 */

import type { AgentPipelineConfig, BrainLoader, BrainDepth, SageAgentType } from './types'

// ── Brain Loader Adapters ────────────────────────────────────────────

/**
 * Create a BrainLoader adapter from the existing brain loader functions.
 * This bridges the orchestrator's interface with the website's brain loaders.
 *
 * @param getContext - The brain's depth-based getter (e.g., getOpsBrainContext)
 * @param getContextForDomains - The brain's domain-specific getter
 * @param domains - Available domain IDs for this brain
 */
export function createBrainLoader(
  getContext: (depth: BrainDepth) => string,
  getContextForDomains: (domains: string[]) => string,
  domains: string[],
): BrainLoader {
  return {
    getContext,
    getContextForDomains,
    availableDomains: domains,
  }
}

// ── Preset Configs ───────────────────────────────────────────────────

/**
 * Sage-Ops preset. Handles process, financial, compliance, product, people, analytics.
 *
 * Decision gate: Spending always requires approval (the founder decides budgets).
 * Irreversible changes flagged. External comms flagged (Ops might draft updates).
 */
export function createOpsPreset(brain: BrainLoader): AgentPipelineConfig {
  return {
    agentType: 'ops',
    brain,
    defaultBrainDepth: 'standard',
    stoicEvaluationEndpoint: 'reason',
    stoicReviewEndpoint: 'guardrail',
    costAlertThreshold: 5.00,
    decisionGate: {
      requiresApproval: ['spending', 'irreversible_change', 'external_comms', 'security_change'],
      autoApprovedButLogged: ['data_access'],
      r5CostAlerts: true,
    },
  }
}

/**
 * Sage-Tech preset. Handles architecture, security, devops, AI/ML, code quality, tooling.
 *
 * Decision gate: Security changes and irreversible changes always require approval.
 * Deployments (publishing) flagged. Spending flagged for infrastructure costs.
 */
export function createTechPreset(brain: BrainLoader): AgentPipelineConfig {
  return {
    agentType: 'tech',
    brain,
    defaultBrainDepth: 'standard',
    stoicEvaluationEndpoint: 'reason',
    stoicReviewEndpoint: 'guardrail',
    costAlertThreshold: 5.00,
    decisionGate: {
      requiresApproval: ['security_change', 'irreversible_change', 'publishing', 'spending'],
      autoApprovedButLogged: ['data_access'],
      r5CostAlerts: true,
    },
  }
}

/**
 * Sage-Growth preset. Handles positioning, audience, content, devrel, community, metrics.
 *
 * Decision gate: Publishing and external comms always require approval (the founder
 * controls the brand voice and public presence). Spending flagged for ad budgets.
 */
export function createGrowthPreset(brain: BrainLoader): AgentPipelineConfig {
  return {
    agentType: 'growth',
    brain,
    defaultBrainDepth: 'standard',
    stoicEvaluationEndpoint: 'score-document',
    stoicReviewEndpoint: 'guardrail',
    costAlertThreshold: 5.00,
    decisionGate: {
      requiresApproval: ['publishing', 'external_comms', 'spending'],
      autoApprovedButLogged: ['data_access'],
      r5CostAlerts: true,
    },
  }
}

/**
 * Sage-Support preset. Handles triage, vulnerable users, philosophical sensitivity,
 * escalation, knowledge base, feedback loop.
 *
 * Decision gate: External comms (responding to users) always requires approval.
 * Data access flagged (support may need to view user profiles). Security changes flagged.
 */
export function createSupportPreset(brain: BrainLoader): AgentPipelineConfig {
  return {
    agentType: 'support',
    brain,
    defaultBrainDepth: 'standard',
    stoicEvaluationEndpoint: 'reason',
    stoicReviewEndpoint: 'guardrail',
    costAlertThreshold: 5.00,
    decisionGate: {
      requiresApproval: ['external_comms', 'security_change', 'data_access'],
      autoApprovedButLogged: ['publishing'],
      r5CostAlerts: true,
    },
  }
}

/**
 * Get a preset factory by agent type.
 */
export function getPresetFactory(
  agentType: SageAgentType
): (brain: BrainLoader) => AgentPipelineConfig {
  const factories: Record<SageAgentType, (brain: BrainLoader) => AgentPipelineConfig> = {
    ops: createOpsPreset,
    tech: createTechPreset,
    growth: createGrowthPreset,
    support: createSupportPreset,
  }
  return factories[agentType]
}
