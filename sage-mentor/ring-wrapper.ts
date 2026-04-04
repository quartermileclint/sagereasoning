/**
 * ring-wrapper.ts — The Ring Wrapper (Before/After Pattern)
 *
 * The structural core of the Sage Agent architecture. Any inner agent,
 * skill, or tool passes through this wrapper on the way in and out.
 *
 * Architecture:
 *   BEFORE → inner agent executes → AFTER
 *
 *   BEFORE:
 *     1. Profile check — is this task consistent with the person's values?
 *     2. Passion early-warning — does a recurring passion pattern match?
 *     3. Context enrichment — should oikeiosis context be added?
 *     4. Journal memory lookup — is there a relevant passage to surface?
 *
 *   AFTER:
 *     1. Evaluate output reasoning quality
 *     2. Record to rolling evaluation window
 *     3. Update accreditation card
 *     4. Surface journal insight if relevant
 *     5. Prescribe next step if pattern detected
 *
 * The ring's authority is fixed at sage_like / full_authority.
 * The inner agent's authority varies (supervised → autonomous).
 *
 * Rules:
 *   R3:  Disclaimer on evaluative output
 *   R4:  IP protection
 *   R6c: Qualitative levels only
 *   R6d: Diagnostic, not punitive
 *   R12: All interventions from 2+ mechanisms
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
  MentorProfile,
  JournalReference,
} from './persona'

import {
  buildBeforePrompt,
  buildAfterPrompt,
} from './persona'

import { sanitise } from './sanitise'

import type {
  KatorthomaProximityLevel,
  AuthorityLevel,
} from '../trust-layer/types/accreditation'

// ============================================================================
// MODEL ROUTING — Token efficiency layer
// ============================================================================

/**
 * Model identifiers for the ring's LLM calls.
 *
 * TOKEN EFFICIENCY: The ring routes to the cheapest model that can
 * handle the task. Routine before/after checks go to Haiku (fast, cheap).
 * Only complex situations escalate to Sonnet (deep reasoning).
 *
 * Cost comparison (per million tokens, April 2026):
 *   Haiku:  ~$0.25 in / $1.25 out  (routine ring checks)
 *   Sonnet: ~$3 in / $15 out       (complex evaluations)
 *   Opus:   ~$15 in / $75 out      (never used by ring)
 *
 * The ring NEVER uses Opus. The mentor persona prompt is designed to
 * work with Sonnet-class reasoning. Haiku handles the simpler yes/no
 * before-checks where the local heuristics already pre-screened.
 */
export type ModelTier = 'fast' | 'deep'

export const MODEL_IDS: Record<ModelTier, string> = {
  fast: 'claude-haiku-4-5-20251001',   // Routine checks, morning/evening
  deep: 'claude-sonnet-4-6',           // Concerns detected, weekly mirror, complex
} as const

/**
 * Determine which model tier a ring check should use.
 *
 * Escalation rules:
 *   - Passion pattern match     → deep (needs nuanced evaluation)
 *   - Novel or high-stakes task → deep (unknown territory)
 *   - Supervised agent          → deep (new agent, can't trust yet)
 *   - Grade transition boundary → deep (profile-changing moment)
 *   - Everything else           → fast (routine check)
 */
export function selectModelTier(
  hasConcerns: boolean,
  isNovel: boolean,
  isHighStakes: boolean,
  agentAuthority: AuthorityLevel,
  isGradeTransitionBoundary: boolean = false
): ModelTier {
  if (hasConcerns) return 'deep'
  if (isNovel || isHighStakes) return 'deep'
  if (agentAuthority === 'supervised') return 'deep'
  if (isGradeTransitionBoundary) return 'deep'
  return 'fast'
}

// ============================================================================
// MODEL ROUTING GUIDE — Remaining build priorities
// ============================================================================
// These constants document the model routing decisions for features
// that haven't been built yet (Priorities 5-7 from the brainstorm).
// When implementing each priority, use these as the default routing.

/**
 * Proactive scheduling (Priority 5): Model routing for daily prompts.
 *
 * Morning check-ins and evening reflections are conversational — they
 * ask a question and listen. They don't need Sonnet-level reasoning.
 * Default to Haiku. Only escalate to Sonnet for the weekly pattern
 * mirror (which synthesises a week of data into narrative insight).
 *
 * Estimated saving: 3-4x cost reduction on daily proactive calls.
 * For a user with 2 daily proactive calls: ~$0.005/day vs ~$0.02/day.
 */
export const PROACTIVE_MODEL_ROUTING: Record<string, ModelTier> = {
  morning_check_in: 'fast',     // Conversational, Haiku suffices
  evening_reflection: 'fast',   // Senecan review, Haiku suffices
  weekly_pattern_mirror: 'deep', // Needs narrative synthesis, use Sonnet
} as const

/**
 * Pattern recognition engine (Priority 6): Batch, don't per-call.
 *
 * Do NOT run pattern recognition on every interaction. Instead:
 *   - Run as a batch job after every Nth interaction (e.g., 5th) or daily
 *   - Pre-compute pattern summaries and store in the profile
 *   - Ring reads pre-computed patterns instead of fresh analysis
 *
 * When the batch does run, use Haiku for aggregation (mechanical)
 * and Sonnet only if the pattern analysis detects novel combinations.
 */
export const PATTERN_RECOGNITION_CONFIG = {
  /** Run pattern analysis after every Nth interaction */
  batch_interval: 5,
  /** Model for routine aggregation */
  aggregation_model: 'fast' as ModelTier,
  /** Model for novel pattern analysis (new passion combos, grade shifts) */
  novel_analysis_model: 'deep' as ModelTier,
} as const

/**
 * Inner agent authority manager (Priority 7): Fully deterministic.
 *
 * Authority promotion uses threshold-based logic with ZERO LLM calls.
 * The existing evaluateAuthorityPromotion() already works this way.
 * Do NOT add an LLM evaluation step — it would add cost with minimal
 * benefit since the thresholds are well-defined.
 */
export const AUTHORITY_MODEL_ROUTING = {
  /** Authority decisions: no LLM needed, purely deterministic */
  promotion_evaluation: null as ModelTier | null,
} as const

/**
 * Journal ingestion model routing (Rec #9).
 *
 * Extraction phase: Sonnet (needs analytical depth for passion ID).
 * Aggregation phase: Haiku (merging chunk results is mechanical).
 * Cache static reference material across chunks.
 */
export const JOURNAL_INGESTION_ROUTING = {
  extraction: 'deep' as ModelTier,   // Passion/value identification needs depth
  aggregation: 'fast' as ModelTier,  // Merging chunks is mechanical
} as const

// ============================================================================
// TOKEN INSTRUMENTATION
// ============================================================================

/**
 * Token usage for a single LLM call.
 */
export type TokenUsage = {
  readonly input_tokens: number
  readonly output_tokens: number
  readonly model: string
  readonly model_tier: ModelTier
  readonly estimated_cost_usd: number
  readonly phase: 'before' | 'after' | 'morning' | 'evening' | 'weekly' | 'extraction'
  readonly timestamp: string
}

/**
 * Aggregated token usage for a ring session or time period.
 */
export type TokenUsageSummary = {
  readonly total_input_tokens: number
  readonly total_output_tokens: number
  readonly total_estimated_cost_usd: number
  readonly calls_by_tier: { fast: number; deep: number }
  readonly calls_by_phase: Record<string, number>
  readonly period_start: string
  readonly period_end: string
}

// Per-million-token pricing (April 2026 estimates)
const PRICING: Record<ModelTier, { input: number; output: number }> = {
  fast: { input: 0.25, output: 1.25 },
  deep: { input: 3.0, output: 15.0 },
}

/**
 * Estimate cost for a single LLM call.
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  tier: ModelTier
): number {
  const price = PRICING[tier]
  return (inputTokens / 1_000_000) * price.input +
         (outputTokens / 1_000_000) * price.output
}

/**
 * Create a token usage record from an LLM response.
 *
 * In production, inputTokens and outputTokens come from the
 * Anthropic API response's `usage` field.
 */
export function recordTokenUsage(
  inputTokens: number,
  outputTokens: number,
  tier: ModelTier,
  phase: TokenUsage['phase']
): TokenUsage {
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model: MODEL_IDS[tier],
    model_tier: tier,
    estimated_cost_usd: estimateCost(inputTokens, outputTokens, tier),
    phase,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Aggregate multiple token usage records into a summary.
 */
export function summariseTokenUsage(records: TokenUsage[]): TokenUsageSummary {
  const callsByTier = { fast: 0, deep: 0 }
  const callsByPhase: Record<string, number> = {}
  let totalInput = 0
  let totalOutput = 0
  let totalCost = 0

  for (const r of records) {
    totalInput += r.input_tokens
    totalOutput += r.output_tokens
    totalCost += r.estimated_cost_usd
    callsByTier[r.model_tier]++
    callsByPhase[r.phase] = (callsByPhase[r.phase] || 0) + 1
  }

  return {
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
    total_estimated_cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
    calls_by_tier: callsByTier,
    calls_by_phase: callsByPhase,
    period_start: records[0]?.timestamp || '',
    period_end: records[records.length - 1]?.timestamp || '',
  }
}

// ============================================================================
// TYPES
// ============================================================================

/**
 * An inner agent registration — what slots into the gap.
 */
export type InnerAgent = {
  /** Unique identifier for this agent */
  readonly id: string
  /** Human-readable name */
  readonly name: string
  /** What kind of agent this is */
  readonly type: 'assistant' | 'email' | 'calendar' | 'financial' | 'content' | 'code' | 'research' | 'custom'
  /** Current authority level (managed by the ring) */
  authority_level: AuthorityLevel
  /** How many actions this agent has completed through the ring */
  actions_completed: number
  /** When this agent was first registered */
  readonly registered_at: string
}

/**
 * A task flowing through the ring.
 */
export type RingTask = {
  readonly task_id: string
  readonly inner_agent_id: string
  readonly task_description: string
  readonly task_context?: string
  readonly timestamp: string
}

/**
 * The ring's pre-check result (BEFORE phase).
 */
export type BeforeResult = {
  /** Were any concerns found? */
  readonly concerns: string[]
  /** Relevant journal passage, if any */
  readonly journal_reference: JournalReference | null
  /** Suggested enrichment for the task */
  readonly enrichment_suggestion: string | null
  /** Should the inner agent proceed? (The ring advises, it does not block) */
  readonly proceed: boolean
  /** A brief note the mentor might say to the person */
  readonly mentor_note: string | null
  /** Which mechanisms were applied (R12) */
  readonly mechanisms_applied: string[]
}

/**
 * The ring's post-evaluation result (AFTER phase).
 */
export type AfterResult = {
  /** Assessed reasoning quality of the output */
  readonly reasoning_quality: KatorthomaProximityLevel
  /** Passions detected in the output */
  readonly passions_detected: {
    readonly passion: string
    readonly false_judgement: string
  }[]
  /** Pattern observation, if any */
  readonly pattern_note: string | null
  /** Relevant journal passage to surface */
  readonly journal_reference: JournalReference | null
  /** One-sentence observation the mentor might share */
  readonly mentor_observation: string | null
  /** Should this be recorded to the longitudinal profile? */
  readonly record_to_profile: boolean
  /** Which mechanisms were applied (R12) */
  readonly mechanisms_applied: string[]
}

/**
 * Complete result of a task passing through the ring.
 */
export type RingResult = {
  readonly task_id: string
  readonly inner_agent_id: string
  readonly before: BeforeResult
  readonly inner_output: string
  readonly after: AfterResult
  readonly timestamp: string
}

// ============================================================================
// INNER AGENT REGISTRY
// ============================================================================

/**
 * Registry of inner agents that have been plugged into the ring.
 */
const innerAgentRegistry = new Map<string, InnerAgent>()

/**
 * Register a new inner agent in the ring.
 * All new agents start at 'supervised' authority level.
 *
 * Validates agent ID and name to prevent prompt injection via
 * agent registration (the agent name appears in before/after prompts).
 */
export function registerInnerAgent(
  id: string,
  name: string,
  type: InnerAgent['type']
): InnerAgent {
  // Validate agent ID: alphanumeric, hyphens, underscores only
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100)
  if (safeId.length === 0) {
    throw new Error('Invalid agent ID: must contain alphanumeric characters, hyphens, or underscores')
  }

  // Sanitise agent name to prevent prompt injection
  const sanitised = sanitise(name, 'agent_name')
  if (sanitised.injection_warnings.length > 0) {
    console.warn(`[SECURITY] Injection attempt in agent name registration: "${name}"`)
    throw new Error('Invalid agent name: contains suspicious content')
  }

  const agent: InnerAgent = {
    id: safeId,
    name: sanitised.text,
    type,
    authority_level: 'supervised', // All new agents start supervised
    actions_completed: 0,
    registered_at: new Date().toISOString(),
  }
  innerAgentRegistry.set(safeId, agent)
  return agent
}

/**
 * Get a registered inner agent.
 */
export function getInnerAgent(id: string): InnerAgent | undefined {
  return innerAgentRegistry.get(id)
}

/**
 * List all registered inner agents.
 */
export function listInnerAgents(): InnerAgent[] {
  return Array.from(innerAgentRegistry.values())
}

// ============================================================================
// AUTHORITY MANAGEMENT
// ============================================================================

/**
 * Authority level thresholds — when an inner agent earns a promotion.
 * Based on the trust-layer's grade transition engine, adapted for
 * the ring's simpler needs.
 */
const AUTHORITY_PROMOTION_THRESHOLDS: Record<AuthorityLevel, {
  actions_required: number
  next_level: AuthorityLevel | null
}> = {
  supervised: { actions_required: 20, next_level: 'guided' },
  guided: { actions_required: 50, next_level: 'spot_checked' },
  spot_checked: { actions_required: 100, next_level: 'autonomous' },
  autonomous: { actions_required: 200, next_level: 'full_authority' },
  full_authority: { actions_required: Infinity, next_level: null },
}

/**
 * Check if an inner agent should be promoted based on action count.
 * The ring evaluates this after each completed action.
 */
export function evaluateAuthorityPromotion(agent: InnerAgent): {
  promoted: boolean
  new_level: AuthorityLevel
} {
  const threshold = AUTHORITY_PROMOTION_THRESHOLDS[agent.authority_level]
  if (threshold.next_level && agent.actions_completed >= threshold.actions_required) {
    agent.authority_level = threshold.next_level
    return { promoted: true, new_level: threshold.next_level }
  }
  return { promoted: false, new_level: agent.authority_level }
}

/**
 * Determine the sampling rate for an inner agent.
 * Supervised agents get checked every time.
 * Autonomous agents only on novel/high-stakes actions.
 */
export function getSamplingRate(authorityLevel: AuthorityLevel): number {
  switch (authorityLevel) {
    case 'supervised': return 1.0      // 100% — every action
    case 'guided': return 0.5          // 50% — plus all novel actions
    case 'spot_checked': return 0.15   // 15% — random sampling
    case 'autonomous': return 0.0      // 0% — only novel/high-stakes
    case 'full_authority': return 0.0  // 0% — only novel/high-stakes
  }
}

/**
 * Determine if a specific action should be checked based on sampling rate.
 */
export function shouldCheckAction(
  agent: InnerAgent,
  isNovel: boolean,
  isHighStakes: boolean
): boolean {
  // Novel and high-stakes always get checked regardless of authority level
  if (isNovel || isHighStakes) return true

  const rate = getSamplingRate(agent.authority_level)
  if (rate >= 1.0) return true
  if (rate <= 0.0) return false
  return Math.random() < rate
}

// ============================================================================
// JOURNAL REFERENCE MATCHING
// ============================================================================

/**
 * Search the journal reference index for passages relevant to a task.
 *
 * Uses the relevance_triggers and topic_tags from the journal reference
 * index to find passages that should be surfaced.
 */
export function findRelevantJournalPassage(
  profile: MentorProfile,
  taskDescription: string
): JournalReference | null {
  if (profile.journal_references.length === 0) return null

  const taskWords = taskDescription.toLowerCase().split(/\s+/)

  let bestMatch: JournalReference | null = null
  let bestScore = 0

  for (const ref of profile.journal_references) {
    let score = 0

    // Check relevance triggers
    for (const trigger of ref.relevance_triggers) {
      const triggerWords = trigger.toLowerCase().split(/\s+/)
      for (const tw of triggerWords) {
        if (taskWords.some(w => w.includes(tw) || tw.includes(w))) {
          score += 3 // Trigger match is high value
        }
      }
    }

    // Check topic tags
    for (const tag of ref.topic_tags) {
      if (taskWords.some(w => w.includes(tag.toLowerCase()) || tag.toLowerCase().includes(w))) {
        score += 1
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = ref
    }
  }

  // Only return if we have a meaningful match
  return bestScore >= 2 ? bestMatch : null
}

// ============================================================================
// PASSION PATTERN MATCHING
// ============================================================================

/**
 * Check if a task description matches any persisting passion patterns.
 *
 * This is the ring's early-warning system. It checks the task against
 * the person's known passion patterns and flags potential matches.
 */
export function checkPassionPatterns(
  profile: MentorProfile,
  taskDescription: string
): { matched: boolean; passions: string[]; warning: string | null } {
  if (profile.passion_map.length === 0) {
    return { matched: false, passions: [], warning: null }
  }

  const taskLower = taskDescription.toLowerCase()
  const matchedPassions: string[] = []

  // Common keyword associations for each root passion
  const passionKeywords: Record<string, string[]> = {
    epithumia: ['want', 'need', 'must have', 'can\'t miss', 'opportunity', 'grab', 'take on', 'commit', 'yes'],
    phobos: ['worried', 'afraid', 'risk', 'might fail', 'what if', 'deadline', 'urgent', 'pressure', 'lose'],
    lupe: ['unfair', 'frustrated', 'annoyed', 'they got', 'shouldn\'t have', 'disappointed', 'angry'],
    hedone: ['excited', 'amazing', 'can\'t wait', 'celebration', 'reward', 'finally'],
  }

  // Check persisting passions specifically
  for (const passion of profile.passion_map) {
    if (passion.frequency !== 'persistent' && passion.frequency !== 'recurring') continue

    const keywords = passionKeywords[passion.root_passion] || []
    const hasKeywordMatch = keywords.some(kw => taskLower.includes(kw))

    if (hasKeywordMatch) {
      matchedPassions.push(passion.sub_species)
    }
  }

  if (matchedPassions.length === 0) {
    return { matched: false, passions: [], warning: null }
  }

  return {
    matched: true,
    passions: matchedPassions,
    warning: `Recurring pattern detected: ${matchedPassions.join(', ')}. ` +
      'This matches a persisting passion from the profile. The mentor may want to check the reasoning.',
  }
}

// ============================================================================
// THE RING — BEFORE/AFTER ORCHESTRATOR
// ============================================================================

/**
 * Execute the BEFORE phase of the ring.
 *
 * This runs before the inner agent acts. It checks the task against
 * the profile, looks for passion patterns, searches the journal index,
 * and determines if any concerns should be raised.
 *
 * Returns the BeforeResult and the prompt that should be sent to the
 * LLM if a full evaluation is needed.
 */
export function executeBefore(
  profile: MentorProfile,
  task: RingTask,
  innerAgent: InnerAgent
): {
  result: BeforeResult
  needsLlmCheck: boolean
  llmPrompt: string | null
  modelTier: ModelTier
  personaTier: 'full' | 'core'
} {
  const concerns: string[] = []
  const mechanisms: string[] = []

  // 1. Passion pattern check (Control Filter + Passion Diagnosis)
  const passionCheck = checkPassionPatterns(profile, task.task_description)
  if (passionCheck.matched) {
    concerns.push(passionCheck.warning!)
    mechanisms.push('control_filter', 'passion_diagnosis')
  }

  // 2. Journal reference lookup
  const journalRef = findRelevantJournalPassage(profile, task.task_description)
  if (journalRef) {
    mechanisms.push('iterative_refinement') // Connecting past to present
  }

  // 3. Determine if full LLM check is needed
  const isHighStakes = concerns.length > 0
  const needsLlmCheck = shouldCheckAction(
    innerAgent,
    false, // TODO: implement novelty detection
    isHighStakes
  )

  // 4. TOKEN EFFICIENCY: Select model tier based on complexity
  //    Routine checks → Haiku (3-4x cheaper)
  //    Concerns detected or new agent → Sonnet (deeper reasoning)
  const modelTier = selectModelTier(
    isHighStakes,
    false,
    isHighStakes,
    innerAgent.authority_level
  )

  // 5. TOKEN EFFICIENCY: Use core persona for routine, full for complex
  const personaTier = modelTier === 'deep' ? 'full' as const : 'core' as const

  // 6. Build the LLM prompt if needed
  const llmPrompt = needsLlmCheck
    ? buildBeforePrompt(profile, task.task_description, innerAgent.name)
    : null

  // Ensure R12 compliance (minimum 2 mechanisms)
  if (mechanisms.length < 2) {
    mechanisms.push('control_filter') // Always applying prohairesis filter
    if (mechanisms.length < 2) {
      mechanisms.push('value_assessment') // Always considering value hierarchy
    }
  }

  const result: BeforeResult = {
    concerns,
    journal_reference: journalRef,
    enrichment_suggestion: null, // Set by LLM if full check runs
    proceed: true, // The ring advises, it does not block
    mentor_note: passionCheck.matched
      ? `I notice a familiar pattern here. Take a moment before proceeding.`
      : journalRef
        ? `This reminds me of something from your journal — ${journalRef.summary}`
        : null,
    mechanisms_applied: [...new Set(mechanisms)],
  }

  return { result, needsLlmCheck, llmPrompt, modelTier, personaTier }
}

/**
 * Execute the AFTER phase of the ring.
 *
 * This runs after the inner agent has completed its task. It evaluates
 * the output, records to the profile, and surfaces any relevant insights.
 *
 * Returns the AfterResult and the prompt for the LLM evaluation.
 */
export function executeAfter(
  profile: MentorProfile,
  task: RingTask,
  innerAgentOutput: string,
  innerAgent: InnerAgent,
  beforeHadConcerns: boolean = false
): {
  needsLlmCheck: boolean
  llmPrompt: string | null
  modelTier: ModelTier
  personaTier: 'full' | 'core'
} {
  const needsLlmCheck = shouldCheckAction(
    innerAgent,
    false,
    beforeHadConcerns // If before had concerns, after should evaluate the result
  )

  const llmPrompt = needsLlmCheck
    ? buildAfterPrompt(profile, task.task_description, innerAgentOutput, innerAgent.name)
    : null

  // TOKEN EFFICIENCY: Match model tier to complexity
  // If the before-phase escalated, after should also use deep evaluation
  const modelTier = selectModelTier(
    beforeHadConcerns,
    false,
    beforeHadConcerns,
    innerAgent.authority_level
  )
  const personaTier = modelTier === 'deep' ? 'full' as const : 'core' as const

  // Increment the inner agent's action count
  innerAgent.actions_completed++

  // Check for authority promotion
  evaluateAuthorityPromotion(innerAgent)

  return { needsLlmCheck, llmPrompt, modelTier, personaTier }
}

// ============================================================================
// RING SESSION — Full lifecycle of a task through the ring
// ============================================================================

/**
 * A ring session tracks a single task from BEFORE through AFTER,
 * including token usage for cost measurement.
 */
export type RingSession = {
  readonly task: RingTask
  readonly inner_agent: InnerAgent
  before_result: BeforeResult | null
  inner_output: string | null
  after_result: AfterResult | null
  /** Token usage records for this session's LLM calls */
  token_usage: TokenUsage[]
  readonly started_at: string
  completed_at: string | null
}

/**
 * Start a new ring session — creates the tracking structure for a task.
 */
export function startRingSession(
  task: RingTask,
  innerAgent: InnerAgent
): RingSession {
  return {
    task,
    inner_agent: innerAgent,
    before_result: null,
    inner_output: null,
    after_result: null,
    token_usage: [],
    started_at: new Date().toISOString(),
    completed_at: null,
  }
}

/**
 * Record token usage from an LLM call during a ring session.
 *
 * Call this after each LLM response in the ring cycle.
 * In production, extract inputTokens/outputTokens from
 * the Anthropic API response's `usage` field.
 */
export function addSessionTokenUsage(
  session: RingSession,
  inputTokens: number,
  outputTokens: number,
  tier: ModelTier,
  phase: TokenUsage['phase']
): void {
  session.token_usage.push(
    recordTokenUsage(inputTokens, outputTokens, tier, phase)
  )
}

/**
 * Complete a ring session — marks it as done with all results.
 * Returns the RingResult including token usage summary.
 */
export function completeRingSession(
  session: RingSession,
  beforeResult: BeforeResult,
  innerOutput: string,
  afterResult: AfterResult
): RingResult & { token_summary: TokenUsageSummary } {
  session.before_result = beforeResult
  session.inner_output = innerOutput
  session.after_result = afterResult
  session.completed_at = new Date().toISOString()

  return {
    task_id: session.task.task_id,
    inner_agent_id: session.inner_agent.id,
    before: beforeResult,
    inner_output: innerOutput,
    after: afterResult,
    timestamp: session.completed_at,
    token_summary: summariseTokenUsage(session.token_usage),
  }
}
