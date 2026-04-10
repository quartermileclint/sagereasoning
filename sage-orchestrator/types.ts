/**
 * sage-orchestrator/types.ts — Type definitions for the unified agent orchestration pattern.
 *
 * This module defines the interfaces that all Sage agents (Ops, Tech, Growth, Support)
 * and customer agents (via startup package) use to interact with the orchestration pipeline.
 *
 * The orchestrator implements the 7-step workflow decided in Session 9:
 *   1. Agent triggered
 *   2. Session context loaded (brain + project instructions + manifest)
 *   3. Internal reasoning (domain-specific work)
 *   4. Stoic evaluation (call clean product endpoint)
 *   5. Output routing (5A: saged output passes through; 5B: non-saged → Stoic review)
 *   6. Decision authority gate (flag actions needing founder/owner approval)
 *   7. Handoff (deliver result with metadata)
 */

// ── Agent Types ──────────────────────────────────────────────────────

/**
 * Internal Sage agent types. Each corresponds to a brain context loader.
 * Customer agents (startup package) extend this with custom brain IDs.
 */
export type SageAgentType = 'ops' | 'tech' | 'growth' | 'support'

/**
 * Brain loader interface. Internal agents use the compiled brain loaders.
 * Customers implement this interface with their own domain expertise.
 */
export interface BrainLoader {
  /** Get brain context at the specified depth */
  getContext(depth: BrainDepth): string
  /** Get brain context for specific domains only */
  getContextForDomains(domains: string[]): string
  /** Available domain IDs */
  availableDomains: string[]
}

export type BrainDepth = 'quick' | 'standard' | 'deep'

// ── Pipeline Configuration ───────────────────────────────────────────

/**
 * Configuration for an agent pipeline instance.
 * This is what varies per agent — everything else is the orchestration pattern.
 */
export interface AgentPipelineConfig {
  /** Which agent type this pipeline serves */
  agentType: SageAgentType | string
  /** The brain loader for this agent's domain expertise */
  brain: BrainLoader
  /** Default brain depth for reasoning steps */
  defaultBrainDepth: BrainDepth
  /**
   * Which product endpoint to use for Stoic evaluation (step 4).
   * The orchestrator calls this endpoint when the agent needs Stoic reasoning.
   * Default: 'reason' (maps to /api/reason)
   */
  stoicEvaluationEndpoint: StoicEndpoint
  /**
   * Which product endpoint to use for 5B Stoic review of non-saged output.
   * Default: 'guardrail' (maps to /api/guardrail)
   */
  stoicReviewEndpoint: StoicEndpoint
  /**
   * Decision authority gate configuration.
   * Defines which action categories require owner/founder approval.
   */
  decisionGate: DecisionGateConfig
  /**
   * Cost alert threshold in USD. When cumulative LLM costs for this agent
   * exceed this value in a session, R5 alerts fire.
   * Default: 5.00 (for internal agents), configurable for customer agents.
   */
  costAlertThreshold: number
}

/**
 * Product endpoints available for Stoic evaluation and review.
 * These are the clean endpoints that any external customer would use —
 * internal agents use the same endpoints, maintaining the product boundary.
 */
export type StoicEndpoint =
  | 'reason'       // General Stoic reasoning
  | 'score'        // Action scoring
  | 'guardrail'    // Guardrail check (pass/flag/block)
  | 'evaluate'     // Quick evaluation
  | 'score-decision'   // Decision evaluation
  | 'score-document'   // Document evaluation
  | 'score-scenario'   // Scenario evaluation

// ── Decision Authority Gate ──────────────────────────────────────────

/**
 * Categories of actions that may require owner/founder approval.
 * The gate doesn't block — it flags.
 */
export type ActionCategory =
  | 'spending'              // Any action that costs money
  | 'publishing'            // Making content publicly visible
  | 'external_comms'        // Sending messages to people outside the org
  | 'irreversible_change'   // Database deletions, config changes, deployments
  | 'data_access'           // Accessing sensitive user data
  | 'security_change'       // Modifying auth, encryption, access controls

/**
 * Configuration for the decision authority gate.
 * Specifies which action categories require approval and the approval mode.
 */
export interface DecisionGateConfig {
  /** Action categories that always require approval */
  requiresApproval: ActionCategory[]
  /**
   * Action categories that are auto-approved but logged.
   * The agent can proceed, but the action is recorded for audit.
   */
  autoApprovedButLogged: ActionCategory[]
  /**
   * Whether R5 cost alerts should fire regardless of action category.
   * Default: true (always fires for internal agents)
   */
  r5CostAlerts: boolean
}

// ── Pipeline Steps ───────────────────────────────────────────────────

/**
 * Input to the orchestration pipeline.
 */
export interface PipelineInput {
  /** The task or question for the agent */
  task: string
  /** Optional additional context (e.g., recent conversation, document content) */
  context?: string
  /** Optional urgency flag — triggers additional scrutiny per Item 6 */
  urgent?: boolean
  /** Whether this task involves an external (non-saged) tool */
  usesExternalTool?: boolean
  /** The external tool's output, if usesExternalTool is true */
  externalToolOutput?: string
  /** Suggested action categories for the decision gate to evaluate */
  actionCategories?: ActionCategory[]
}

/**
 * Output from the orchestration pipeline.
 */
export interface PipelineOutput {
  /** The agent's reasoning result */
  result: string | Record<string, unknown>
  /** Whether the output passed through Stoic evaluation */
  stoicEvaluated: boolean
  /** Whether the output was routed through 5B Stoic review (non-saged tool) */
  stoicReviewed: boolean
  /** Stoic review result, if 5B was triggered */
  stoicReview?: StoicReviewResult
  /** Decision gate assessment */
  decisionGate: DecisionGateResult
  /** Pipeline execution metadata */
  meta: PipelineMeta
}

/**
 * Result of the 5B Stoic review for non-saged output.
 */
export interface StoicReviewResult {
  /** Whether the output passes the Stoic guardrail */
  verdict: 'pass' | 'flag' | 'block'
  /** Reasoning for the verdict */
  reasoning: string
  /** Specific concerns, if any */
  concerns?: string[]
  /** The endpoint used for the review */
  reviewEndpoint: StoicEndpoint
}

/**
 * Result of the decision authority gate evaluation.
 */
export interface DecisionGateResult {
  /** Whether this output requires owner/founder approval */
  requiresApproval: boolean
  /** Which action categories triggered the approval requirement */
  triggeredCategories: ActionCategory[]
  /** Reasoning for the gate decision */
  reasoning: string
  /** Whether R5 cost alert was triggered */
  r5Alert: boolean
  /** Cumulative session cost so far */
  sessionCostUsd: number
}

/**
 * Metadata about the pipeline execution.
 */
export interface PipelineMeta {
  /** Which agent type ran */
  agentType: string
  /** Brain depth used */
  brainDepth: BrainDepth
  /** Which steps executed */
  stepsExecuted: PipelineStep[]
  /** Total LLM tokens consumed in this pipeline run */
  totalTokens: number
  /** Estimated cost of this pipeline run in USD */
  estimatedCostUsd: number
  /** Wall-clock time for the pipeline in ms */
  durationMs: number
  /** Timestamp of pipeline completion */
  completedAt: string
}

export type PipelineStep =
  | 'context_loaded'      // Step 2
  | 'internal_reasoning'  // Step 3
  | 'stoic_evaluation'    // Step 4
  | 'output_passthrough'  // Step 5A
  | 'stoic_review'        // Step 5B
  | 'decision_gate'       // Step 6
  | 'handoff'             // Step 7
