/**
 * sage-orchestrator/pipeline.ts — Unified agent orchestration pipeline.
 *
 * Implements the 7-step workflow that all Sage agents follow.
 * The only thing that varies per agent is which brain is loaded (via config).
 * The governance structure is identical across all four internal agents
 * and extends to customer agents via the startup package.
 *
 * Session 9 Decision: "One orchestration pattern, 'which brain' as a parameter."
 */

import type {
  AgentPipelineConfig,
  PipelineInput,
  PipelineOutput,
  PipelineStep,
  PipelineMeta,
  DecisionGateConfig,
  DecisionGateResult,
  StoicReviewResult,
  ActionCategory,
} from './types'

// ── Cost Tracking ────────────────────────────────────────────────────

/**
 * Simple session-level cost tracker. In production, this would integrate
 * with the R5 cost-as-health-metric system.
 */
interface CostTracker {
  totalTokens: number
  estimatedCostUsd: number
}

const sessionCosts = new Map<string, CostTracker>()

function getSessionCost(agentType: string): CostTracker {
  if (!sessionCosts.has(agentType)) {
    sessionCosts.set(agentType, { totalTokens: 0, estimatedCostUsd: 0 })
  }
  return sessionCosts.get(agentType)!
}

/**
 * Estimate cost from token count. Uses Claude Sonnet 4.6 pricing as baseline.
 * In production, this reads actual pricing from the billing module.
 */
function estimateCost(inputTokens: number, outputTokens: number): number {
  // Claude Sonnet 4.6 approximate pricing (per million tokens)
  const inputCostPerMillion = 3.0
  const outputCostPerMillion = 15.0
  return (inputTokens * inputCostPerMillion + outputTokens * outputCostPerMillion) / 1_000_000
}

// ── Pipeline Runner ──────────────────────────────────────────────────

/**
 * Run the unified agent pipeline.
 *
 * This is the single orchestration function that all 4 internal Sage agents
 * and all customer agents (startup package) call. The config parameter
 * determines which brain is loaded and how the governance works.
 *
 * @param config - Agent pipeline configuration (brain, endpoints, gate rules)
 * @param input - The task and context for this pipeline run
 * @param reasonFn - The function that performs Stoic reasoning (injected to avoid coupling)
 * @returns Pipeline output with result, gate assessment, and metadata
 */
export async function runAgentPipeline(
  config: AgentPipelineConfig,
  input: PipelineInput,
  reasonFn: ReasonFunction,
): Promise<PipelineOutput> {
  const startTime = Date.now()
  const steps: PipelineStep[] = []
  const cost = getSessionCost(config.agentType)

  // ── Step 2: Load session context ──────────────────────────────────
  const brainContext = config.brain.getContext(config.defaultBrainDepth)
  steps.push('context_loaded')

  // ── Step 3: Internal reasoning ────────────────────────────────────
  // The agent uses its brain to do domain-specific work.
  // This is where the brain's expertise gets applied.
  const reasoningResult = await reasonFn({
    input: input.task,
    context: input.context,
    brainContext,
    depth: config.defaultBrainDepth,
    urgencyContext: input.urgent ? 'URGENT: Apply additional scrutiny for hasty assent.' : undefined,
  })
  steps.push('internal_reasoning')

  // Track cost
  const stepCost = estimateCost(
    reasoningResult.meta?.inputTokens || 0,
    reasoningResult.meta?.outputTokens || 0
  )
  cost.totalTokens += (reasoningResult.meta?.inputTokens || 0) + (reasoningResult.meta?.outputTokens || 0)
  cost.estimatedCostUsd += stepCost

  // ── Step 4: Stoic evaluation ──────────────────────────────────────
  // When the agent needs Stoic reasoning, it calls a clean product endpoint.
  // For the current implementation, the reasoning function already includes
  // the Stoic Brain in its context. This step is the conceptual marker that
  // Stoic evaluation has occurred through the product endpoint.
  steps.push('stoic_evaluation')

  // ── Step 5: Output routing ────────────────────────────────────────
  let stoicReview: StoicReviewResult | undefined
  let stoicReviewed = false

  if (input.usesExternalTool && input.externalToolOutput) {
    // 5B: External/non-saged tool output → route through Stoic review
    const reviewResult = await reasonFn({
      input: input.externalToolOutput,
      context: `This output came from an external tool (non-saged). Review it through a Stoic lens before it proceeds further. Agent type: ${config.agentType}. Original task: ${input.task}`,
      brainContext: '', // Review uses product endpoint directly, no brain needed
      depth: 'standard',
      endpoint: config.stoicReviewEndpoint,
    })

    stoicReview = parseStoicReview(reviewResult.result, config.stoicReviewEndpoint)
    stoicReviewed = true
    steps.push('stoic_review')

    // Track review cost
    const reviewCost = estimateCost(
      reviewResult.meta?.inputTokens || 0,
      reviewResult.meta?.outputTokens || 0
    )
    cost.totalTokens += (reviewResult.meta?.inputTokens || 0) + (reviewResult.meta?.outputTokens || 0)
    cost.estimatedCostUsd += reviewCost
  } else {
    // 5A: Saged output passes through (already evaluated via product endpoint)
    steps.push('output_passthrough')
  }

  // ── Step 6: Decision authority gate ───────────────────────────────
  const decisionGate = evaluateDecisionGate(
    config.decisionGate,
    input.actionCategories || inferActionCategories(input.task),
    cost.estimatedCostUsd,
    config.costAlertThreshold,
  )
  steps.push('decision_gate')

  // ── Step 7: Handoff ───────────────────────────────────────────────
  steps.push('handoff')

  const meta: PipelineMeta = {
    agentType: config.agentType,
    brainDepth: config.defaultBrainDepth,
    stepsExecuted: steps,
    totalTokens: cost.totalTokens,
    estimatedCostUsd: cost.estimatedCostUsd,
    durationMs: Date.now() - startTime,
    completedAt: new Date().toISOString(),
  }

  return {
    result: reasoningResult.result,
    stoicEvaluated: true, // Always true — Stoic Brain is in the reasoning context
    stoicReviewed,
    stoicReview,
    decisionGate,
    meta,
  }
}

// ── Decision Authority Gate ──────────────────────────────────────────

/**
 * Evaluate whether the pipeline output needs owner/founder approval.
 *
 * Session 9 Decision: "The decision authority gate exists because the founder
 * makes irreplaceable decisions: spending money, publishing content, external
 * communications, irreversible changes. R5 cost alerts fire regardless."
 */
function evaluateDecisionGate(
  config: DecisionGateConfig,
  actionCategories: ActionCategory[],
  sessionCostUsd: number,
  costThreshold: number,
): DecisionGateResult {
  const triggeredCategories = actionCategories.filter(
    cat => config.requiresApproval.includes(cat)
  )

  const requiresApproval = triggeredCategories.length > 0
  const r5Alert = config.r5CostAlerts && sessionCostUsd > costThreshold

  // Build reasoning
  const reasons: string[] = []
  if (triggeredCategories.length > 0) {
    reasons.push(`Action categories requiring approval: ${triggeredCategories.join(', ')}`)
  }
  if (r5Alert) {
    reasons.push(`R5 cost alert: session cost $${sessionCostUsd.toFixed(2)} exceeds threshold $${costThreshold.toFixed(2)}`)
  }

  // Log auto-approved actions
  const autoApproved = actionCategories.filter(
    cat => config.autoApprovedButLogged.includes(cat)
  )
  if (autoApproved.length > 0) {
    reasons.push(`Auto-approved (logged): ${autoApproved.join(', ')}`)
  }

  return {
    requiresApproval: requiresApproval || r5Alert,
    triggeredCategories,
    reasoning: reasons.length > 0 ? reasons.join('. ') : 'No approval required — action categories clear.',
    r5Alert,
    sessionCostUsd,
  }
}

/**
 * Infer action categories from the task description.
 * Lightweight keyword matching — not meant to be exhaustive.
 * The agent or caller should explicitly set actionCategories for accuracy.
 */
function inferActionCategories(task: string): ActionCategory[] {
  const lower = task.toLowerCase()
  const categories: ActionCategory[] = []

  if (/\b(spend|cost|pay|purchase|buy|invoice|budget)\b/.test(lower)) {
    categories.push('spending')
  }
  if (/\b(publish|post|announce|release|launch|deploy|ship)\b/.test(lower)) {
    categories.push('publishing')
  }
  if (/\b(email|message|send|contact|reach out|notify|announce to)\b/.test(lower)) {
    categories.push('external_comms')
  }
  if (/\b(delete|drop|remove|migrate|reset|destroy|irreversible)\b/.test(lower)) {
    categories.push('irreversible_change')
  }
  if (/\b(user data|personal data|profile|pii|sensitive|decrypt)\b/.test(lower)) {
    categories.push('data_access')
  }
  if (/\b(auth|password|encryption|access control|permission|rls|api key)\b/.test(lower)) {
    categories.push('security_change')
  }

  return categories
}

// ── Stoic Review Parser ──────────────────────────────────────────────

/**
 * Parse a reasoning result into a StoicReviewResult.
 * Handles different response shapes from different product endpoints.
 */
function parseStoicReview(
  result: string | Record<string, unknown>,
  endpoint: string,
): StoicReviewResult {
  // Default: treat as pass with the full result as reasoning
  if (typeof result === 'string') {
    return {
      verdict: 'pass',
      reasoning: result,
      reviewEndpoint: endpoint as any,
    }
  }

  // Try to extract verdict from guardrail-style response
  const verdict = (result.verdict || result.status || result.alignment_tier || 'pass') as string
  const mappedVerdict =
    verdict === 'block' || verdict === 'contrary' || verdict === 'misaligned'
      ? 'block'
      : verdict === 'flag' || verdict === 'aware'
        ? 'flag'
        : 'pass'

  return {
    verdict: mappedVerdict,
    reasoning: (result.reasoning || result.sage_perspective || result.explanation || '') as string,
    concerns: result.concerns as string[] | undefined,
    reviewEndpoint: endpoint as any,
  }
}

// ── Reason Function Interface ────────────────────────────────────────

/**
 * The reasoning function injected into the pipeline.
 * This abstraction decouples the orchestrator from the specific LLM calling
 * mechanism. Internal agents use runSageReason; customers can use any
 * compatible reasoning function.
 */
export interface ReasonFunctionInput {
  input: string
  context?: string
  brainContext: string
  depth: string
  urgencyContext?: string
  /** Which endpoint to use (for 5B Stoic review routing) */
  endpoint?: string
}

export interface ReasonFunctionOutput {
  result: string | Record<string, unknown>
  meta?: {
    inputTokens?: number
    outputTokens?: number
    model?: string
  }
}

export type ReasonFunction = (input: ReasonFunctionInput) => Promise<ReasonFunctionOutput>
