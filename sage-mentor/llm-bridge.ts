/**
 * llm-bridge.ts — Anthropic API Bridge for the Ring
 *
 * Connects the ring's BEFORE/AFTER prompt builders to live Claude
 * API calls. This is the missing piece (Step 4.1 of the implementation
 * plan) that makes the ring evaluate reasoning in real time.
 *
 * Architecture:
 *   The ring-wrapper.ts builds prompts and selects model tiers.
 *   This module takes those prompts and sends them to Anthropic's
 *   Messages API, returning structured results the ring can use.
 *
 * The bridge handles:
 *   1. BEFORE check LLM calls (governance, passion pattern evaluation)
 *   2. AFTER check LLM calls (draft quality evaluation)
 *   3. Draft generation LLM calls (support agent writing responses)
 *   4. Proactive output LLM calls (morning/evening/weekly)
 *
 * All calls route through a single callAnthropic() function for
 * consistent error handling, token tracking, and cost measurement.
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
  ModelTier,
  TokenUsage,
  BeforeResult,
  AfterResult,
  RingTask,
  InnerAgent,
  RingSession,
} from './ring-wrapper'

import {
  MODEL_IDS,
  recordTokenUsage,
  executeBefore,
  executeAfter,
  startRingSession,
  addSessionTokenUsage,
  completeRingSession,
  getInnerAgent,
} from './ring-wrapper'

import type { MentorProfile } from './persona'
import type { ProactiveResult } from './proactive-scheduler'
import { sanitise } from './sanitise'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuration for the Anthropic API bridge.
 */
export type LLMBridgeConfig = {
  /** Anthropic API key */
  readonly api_key: string
  /** API base URL (default: https://api.anthropic.com) */
  readonly base_url: string
  /** API version header */
  readonly api_version: string
  /** Temperature for scoring calls (R: 0.2 for consistency) */
  readonly scoring_temperature: number
  /** Temperature for draft generation (slightly higher for natural tone) */
  readonly drafting_temperature: number
  /** Maximum tokens for ring check responses */
  readonly max_ring_tokens: number
  /** Maximum tokens for draft generation responses */
  readonly max_draft_tokens: number
}

/** Default configuration */
export const DEFAULT_LLM_CONFIG: Omit<LLMBridgeConfig, 'api_key'> = {
  base_url: 'https://api.anthropic.com',
  api_version: '2023-06-01',
  scoring_temperature: 0.2,
  drafting_temperature: 0.4,
  max_ring_tokens: 1024,
  max_draft_tokens: 2048,
}

/**
 * Raw response from the Anthropic Messages API.
 */
type AnthropicResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string }>
  model: string
  stop_reason: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Result of a single LLM call through the bridge.
 */
export type LLMCallResult = {
  readonly success: boolean
  readonly text: string
  readonly token_usage: TokenUsage | null
  readonly error: string | null
  readonly latency_ms: number
}

/**
 * Result of running a full ring cycle (BEFORE → agent → AFTER) with live LLM.
 */
export type LiveRingResult = {
  readonly task_id: string
  readonly before: BeforeResult
  readonly draft: string
  readonly after: AfterResult
  readonly token_usage: TokenUsage[]
  readonly total_cost_usd: number
  readonly latency_ms: number
}

// ============================================================================
// CORE API CALL
// ============================================================================

/**
 * Call the Anthropic Messages API.
 *
 * This is the single point of contact with Anthropic's API.
 * All ring checks, draft generation, and proactive outputs flow
 * through this function.
 *
 * Endpoint: POST https://api.anthropic.com/v1/messages
 */
export async function callAnthropic(
  config: LLMBridgeConfig,
  modelTier: ModelTier,
  systemPrompt: string,
  userMessage: string,
  options: {
    temperature?: number
    max_tokens?: number
    /** Optional persona prompt for Anthropic's cache_control */
    persona_prompt?: string
  } = {}
): Promise<LLMCallResult> {
  const startTime = Date.now()
  const modelId = MODEL_IDS[modelTier]
  const temperature = options.temperature ?? config.scoring_temperature
  const maxTokens = options.max_tokens ?? config.max_ring_tokens

  // Build the messages array
  // If persona_prompt is provided, use it as a separate system block
  // for Anthropic's prompt caching (the persona rarely changes)
  const systemBlocks: Array<{ type: 'text'; text: string; cache_control?: { type: string } }> = []

  if (options.persona_prompt) {
    systemBlocks.push({
      type: 'text',
      text: options.persona_prompt,
      cache_control: { type: 'ephemeral' },
    })
  }

  systemBlocks.push({
    type: 'text',
    text: systemPrompt,
  })

  try {
    const response = await fetch(`${config.base_url}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.api_key,
        'anthropic-version': config.api_version,
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: maxTokens,
        temperature,
        system: systemBlocks,
        messages: [
          { role: 'user', content: userMessage },
        ],
      }),
    })

    const latencyMs = Date.now() - startTime

    if (!response.ok) {
      const errBody = await response.text()
      return {
        success: false,
        text: '',
        token_usage: null,
        error: `Anthropic API error (${response.status}): ${errBody}`,
        latency_ms: latencyMs,
      }
    }

    const data = await response.json() as AnthropicResponse

    // Extract text from response
    const text = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('')

    // Record token usage
    const phase: TokenUsage['phase'] = systemPrompt.includes('BEFORE')
      ? 'before'
      : systemPrompt.includes('AFTER')
        ? 'after'
        : 'before' // default

    const tokenUsage = recordTokenUsage(
      data.usage.input_tokens,
      data.usage.output_tokens,
      modelTier,
      phase
    )

    return {
      success: true,
      text,
      token_usage: tokenUsage,
      error: null,
      latency_ms: latencyMs,
    }
  } catch (err) {
    return {
      success: false,
      text: '',
      token_usage: null,
      error: `Failed to call Anthropic API: ${err instanceof Error ? err.message : String(err)}`,
      latency_ms: Date.now() - startTime,
    }
  }
}

// ============================================================================
// RING BEFORE CHECK (Live LLM)
// ============================================================================

/**
 * Run the ring's BEFORE check with a live LLM call.
 *
 * Takes the output from ring-wrapper's executeBefore() and, if an
 * LLM check is needed, sends the prompt to Claude for evaluation.
 *
 * Returns the enriched BeforeResult with any LLM-provided insights.
 */
export async function liveBeforeCheck(
  config: LLMBridgeConfig,
  profile: MentorProfile,
  task: RingTask,
  agent: InnerAgent
): Promise<{
  result: BeforeResult
  tokenUsage: TokenUsage | null
  latencyMs: number
}> {
  // 1. Run the local heuristic checks first
  const beforeOutput = executeBefore(profile, task, agent)

  // 2. If no LLM check needed, return the local result
  if (!beforeOutput.needsLlmCheck || !beforeOutput.llmPrompt) {
    return {
      result: beforeOutput.result,
      tokenUsage: null,
      latencyMs: 0,
    }
  }

  // 3. Call the LLM for a deeper evaluation
  const llmResult = await callAnthropic(
    config,
    beforeOutput.modelTier,
    beforeOutput.llmPrompt,
    `Task: ${task.task_description}\n\nContext: ${task.task_context || 'None provided'}`,
    {
      temperature: config.scoring_temperature,
      max_tokens: config.max_ring_tokens,
    }
  )

  if (!llmResult.success) {
    // LLM call failed — return the local result with a warning
    console.warn(`[RING] BEFORE LLM check failed: ${llmResult.error}`)
    return {
      result: {
        ...beforeOutput.result,
        mentor_note: beforeOutput.result.mentor_note
          ? `${beforeOutput.result.mentor_note} (Note: deeper evaluation unavailable)`
          : null,
      },
      tokenUsage: null,
      latencyMs: llmResult.latency_ms,
    }
  }

  // 4. Parse the LLM response to enrich the BeforeResult
  const enrichedResult = parseBeforeLLMResponse(beforeOutput.result, llmResult.text)

  return {
    result: enrichedResult,
    tokenUsage: llmResult.token_usage,
    latencyMs: llmResult.latency_ms,
  }
}

/**
 * Parse the LLM's BEFORE check response and merge with local result.
 */
function parseBeforeLLMResponse(localResult: BeforeResult, llmText: string): BeforeResult {
  // The LLM response is expected to be a brief evaluation.
  // We extract any concerns or enrichment suggestions.
  const sanitised = sanitise(llmText, 'inner_agent_output')
  const text = sanitised.text

  // Look for concern indicators
  const additionalConcerns: string[] = []
  if (text.toLowerCase().includes('concern') || text.toLowerCase().includes('caution')) {
    additionalConcerns.push(text.slice(0, 200))
  }

  // Look for enrichment suggestions
  let enrichment: string | null = null
  if (text.toLowerCase().includes('context') || text.toLowerCase().includes('consider')) {
    enrichment = text.slice(0, 300)
  }

  return {
    ...localResult,
    concerns: [...localResult.concerns, ...additionalConcerns],
    enrichment_suggestion: enrichment || localResult.enrichment_suggestion,
    mentor_note: text.length > 0 ? text.slice(0, 200) : localResult.mentor_note,
  }
}

// ============================================================================
// RING AFTER CHECK (Live LLM)
// ============================================================================

/**
 * Run the ring's AFTER check with a live LLM call.
 *
 * Evaluates the support agent's draft output against R1/R3/R9.
 * Returns a structured AfterResult.
 */
export async function liveAfterCheck(
  config: LLMBridgeConfig,
  profile: MentorProfile,
  task: RingTask,
  agentOutput: string,
  agent: InnerAgent,
  beforeHadConcerns: boolean
): Promise<{
  result: AfterResult
  tokenUsage: TokenUsage | null
  latencyMs: number
}> {
  // 1. Run the local after-check (increments action count, checks authority)
  const afterOutput = executeAfter(profile, task, agentOutput, agent, beforeHadConcerns)

  // 2. If no LLM check needed, return a default result
  if (!afterOutput.needsLlmCheck || !afterOutput.llmPrompt) {
    const defaultResult: AfterResult = {
      reasoning_quality: 'deliberate',
      passions_detected: [],
      pattern_note: null,
      journal_reference: null,
      mentor_observation: null,
      record_to_profile: false,
      mechanisms_applied: ['control_filter', 'value_assessment'],
    }
    return { result: defaultResult, tokenUsage: null, latencyMs: 0 }
  }

  // 3. Call the LLM for evaluation
  const llmResult = await callAnthropic(
    config,
    afterOutput.modelTier,
    afterOutput.llmPrompt,
    `Agent output to evaluate:\n\n${agentOutput}`,
    {
      temperature: config.scoring_temperature,
      max_tokens: config.max_ring_tokens,
    }
  )

  if (!llmResult.success) {
    console.warn(`[RING] AFTER LLM check failed: ${llmResult.error}`)
    const fallbackResult: AfterResult = {
      reasoning_quality: 'deliberate',
      passions_detected: [],
      pattern_note: null,
      journal_reference: null,
      mentor_observation: '(Deeper evaluation unavailable — LLM call failed)',
      record_to_profile: false,
      mechanisms_applied: ['control_filter', 'value_assessment'],
    }
    return { result: fallbackResult, tokenUsage: null, latencyMs: llmResult.latency_ms }
  }

  // 4. Parse the LLM response into a structured AfterResult
  const afterResult = parseAfterLLMResponse(llmResult.text, profile, task)

  return {
    result: afterResult,
    tokenUsage: llmResult.token_usage,
    latencyMs: llmResult.latency_ms,
  }
}

/**
 * Parse the LLM's AFTER evaluation into a structured AfterResult.
 *
 * The LLM is prompted (via buildAfterPrompt in persona.ts) to return
 * JSON. This parser handles both clean JSON and fallback text parsing.
 */
function parseAfterLLMResponse(
  llmText: string,
  profile: MentorProfile,
  task: RingTask
): AfterResult {
  const sanitised = sanitise(llmText, 'inner_agent_output')
  const text = sanitised.text

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(text)
    return {
      reasoning_quality: parsed.reasoning_quality || parsed.proximity || 'deliberate',
      passions_detected: (parsed.passions_detected || parsed.passions || []).map(
        (p: { passion?: string; false_judgement?: string } | string) =>
          typeof p === 'string'
            ? { passion: p, false_judgement: 'unspecified' }
            : { passion: p.passion || 'unknown', false_judgement: p.false_judgement || 'unspecified' }
      ),
      pattern_note: parsed.pattern_note || null,
      journal_reference: null,
      mentor_observation: parsed.mentor_observation || parsed.observation || null,
      record_to_profile: parsed.record_to_profile ?? true,
      mechanisms_applied: parsed.mechanisms_applied || ['control_filter', 'passion_diagnosis'],
    }
  } catch {
    // Fallback: text-based parsing
  }

  // Text-based fallback parsing
  const lowerText = text.toLowerCase()

  // Detect proximity level from text
  let reasoningQuality: AfterResult['reasoning_quality'] = 'deliberate'
  if (lowerText.includes('sage_like') || lowerText.includes('sage-like')) reasoningQuality = 'sage_like'
  else if (lowerText.includes('principled')) reasoningQuality = 'principled'
  else if (lowerText.includes('deliberate')) reasoningQuality = 'deliberate'
  else if (lowerText.includes('habitual')) reasoningQuality = 'habitual'
  else if (lowerText.includes('reflexive')) reasoningQuality = 'reflexive'

  // Detect passions from text
  const passionsDetected: { passion: string; false_judgement: string }[] = []
  const passionKeywords = ['epithumia', 'hedone', 'phobos', 'lupe', 'anger', 'fear', 'craving']
  for (const kw of passionKeywords) {
    if (lowerText.includes(kw)) {
      passionsDetected.push({ passion: kw, false_judgement: `Detected in evaluation text` })
    }
  }

  // Check for governance issues in the evaluated text
  if (lowerText.includes('therapeutic') || lowerText.includes('r1')) {
    passionsDetected.push({ passion: 'governance', false_judgement: 'Possible R1 therapeutic implication' })
  }
  if (lowerText.includes('promise') || lowerText.includes('guarantee') || lowerText.includes('r9')) {
    passionsDetected.push({ passion: 'governance', false_judgement: 'Possible R9 outcome promise' })
  }

  return {
    reasoning_quality: reasoningQuality,
    passions_detected: passionsDetected,
    pattern_note: null,
    journal_reference: null,
    mentor_observation: text.slice(0, 300),
    record_to_profile: true,
    mechanisms_applied: ['control_filter', 'passion_diagnosis'],
  }
}

// ============================================================================
// DRAFT GENERATION (Live LLM)
// ============================================================================

/**
 * Generate a support draft using the Claude API.
 *
 * Takes the draft prompt built by support-agent.ts and sends it
 * to Claude for response generation.
 */
export async function generateDraft(
  config: LLMBridgeConfig,
  draftPrompt: string,
  modelTier: ModelTier = 'fast'
): Promise<LLMCallResult> {
  return callAnthropic(
    config,
    modelTier,
    'You are a professional support agent for SageReasoning.com, a Stoic reasoning evaluation API. Write clear, accurate, warm customer responses.',
    draftPrompt,
    {
      temperature: config.drafting_temperature,
      max_tokens: config.max_draft_tokens,
    }
  )
}

// ============================================================================
// PROACTIVE OUTPUT (Live LLM)
// ============================================================================

/**
 * Execute a proactive output with a live LLM call.
 *
 * Takes a ProactiveResult from the proactive-scheduler and sends
 * its prompts to the Anthropic API. Returns the LLM's response
 * and token usage.
 */
export async function executeProactiveWithLLM(
  config: LLMBridgeConfig,
  proactiveResult: ProactiveResult
): Promise<{
  response: string
  tokenUsage: TokenUsage | null
  latencyMs: number
  error: string | null
}> {
  const llmResult = await callAnthropic(
    config,
    proactiveResult.model_tier,
    proactiveResult.system_prompt,
    'Please proceed with this proactive output.',
    {
      temperature: config.scoring_temperature,
      max_tokens: config.max_draft_tokens,
      persona_prompt: proactiveResult.persona_prompt,
    }
  )

  if (!llmResult.success) {
    return {
      response: '',
      tokenUsage: null,
      latencyMs: llmResult.latency_ms,
      error: llmResult.error,
    }
  }

  return {
    response: llmResult.text,
    tokenUsage: llmResult.token_usage,
    latencyMs: llmResult.latency_ms,
    error: null,
  }
}

// ============================================================================
// FULL RING CYCLE (BEFORE → Draft → AFTER) with Live LLM
// ============================================================================

/**
 * Run a complete ring cycle for a support interaction with live LLM.
 *
 * This is the top-level function that ties everything together:
 * 1. Ring BEFORE check (with LLM if needed)
 * 2. Generate draft response (via LLM)
 * 3. Ring AFTER check (with LLM if needed)
 *
 * Returns the complete result including all token usage and costs.
 */
export async function runLiveRingCycle(
  config: LLMBridgeConfig,
  profile: MentorProfile,
  task: RingTask,
  draftPrompt: string,
  agentId: string = 'sage-support'
): Promise<LiveRingResult | { error: string }> {
  const agent = getInnerAgent(agentId)
  if (!agent) {
    return { error: `Agent '${agentId}' not registered. Call initialiseSupportAgent() first.` }
  }

  const allTokenUsage: TokenUsage[] = []
  const startTime = Date.now()

  // ── Step 1: BEFORE check ────────────────────────────────────────
  const beforeCheck = await liveBeforeCheck(config, profile, task, agent)
  if (beforeCheck.tokenUsage) allTokenUsage.push(beforeCheck.tokenUsage)

  // ── Step 2: Generate draft ──────────────────────────────────────
  const draftResult = await generateDraft(config, draftPrompt)
  if (!draftResult.success) {
    return { error: `Draft generation failed: ${draftResult.error}` }
  }
  if (draftResult.token_usage) allTokenUsage.push(draftResult.token_usage)

  // ── Step 3: AFTER check ─────────────────────────────────────────
  const afterCheck = await liveAfterCheck(
    config,
    profile,
    task,
    draftResult.text,
    agent,
    beforeCheck.result.concerns.length > 0
  )
  if (afterCheck.tokenUsage) allTokenUsage.push(afterCheck.tokenUsage)

  // ── Calculate total cost ────────────────────────────────────────
  const totalCost = allTokenUsage.reduce((sum, t) => sum + t.estimated_cost_usd, 0)

  return {
    task_id: task.task_id,
    before: beforeCheck.result,
    draft: draftResult.text,
    after: afterCheck.result,
    token_usage: allTokenUsage,
    total_cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
    latency_ms: Date.now() - startTime,
  }
}
