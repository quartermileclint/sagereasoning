/**
 * sage-reason-engine.ts — Shared reasoning engine for all sage-* tools.
 *
 * This module extracts the core 4-stage Stoic evaluation logic from /api/reason
 * into a callable function that can be used by all sage-brain tools (sage-score,
 * sage-filter, sage-guard, sage-decide, sage-converse) without duplicating
 * Stoic Brain prompts, Claude API setup, or reasoning logic.
 *
 * Single source of truth:
 *   - System prompts by depth (quick/standard/deep)
 *   - Model selection per depth
 *   - 4-stage evaluation sequence
 *   - Caching and rate limiting delegated to caller
 *   - Receipt generation delegated to reasoning-receipt module
 */

import Anthropic from '@anthropic-ai/sdk'
import { MODEL_FAST, MODEL_DEEP, cacheKey, cacheGet, cacheSet } from '@/lib/model-config'
import { extractReceipt, type MechanismId } from '@/lib/reasoning-receipt'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'

// =============================================================================
// ANTHROPIC CLIENT — Shared singleton
// =============================================================================

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export { getClient }

// =============================================================================
// TYPES
// =============================================================================

export type ReasonDepth = 'quick' | 'standard' | 'deep'

export interface ReasonInput {
  input: string
  context?: string
  depth?: ReasonDepth
  domain_context?: string
  /** Override the system prompt entirely (used by mentor-baseline, mentor-journal-week, etc.) */
  systemPromptOverride?: string
  /**
   * Optional urgency context (Item 6 — urgency → more scrutiny).
   * When provided, the engine applies additional scrutiny to passion_diagnosis,
   * specifically checking for hasty assent (propeteia) patterns. The output
   * will include a hasty_assent_risk field.
   */
  urgency_context?: string
  /**
   * Optional Stoic Brain context override. When provided, injected as a second
   * system message block alongside the main prompt. When omitted, the engine
   * auto-generates context from the depth level using stoic-brain-loader.
   * Set to empty string to explicitly disable Stoic Brain injection.
   */
  stoicBrainContext?: string
}

export interface ReasonResult {
  result: Record<string, unknown>
  meta: {
    endpoint: string
    depth: ReasonDepth
    mechanisms_applied: string[]
    mechanism_count: number
    ai_generated: boolean
    ai_model: string
    latency_ms: number
    /** Per-stage quality scores (Item 5 — process reward model). Present when stage scoring is enabled. */
    stage_scores?: Record<string, 'strong' | 'adequate' | 'weak' | 'not_applied'>
    /** Hasty assent risk flag (Item 6). Present when urgency_context was provided. */
    hasty_assent_risk?: 'high' | 'moderate' | 'low' | 'none'
    /** Whether urgency context was applied */
    urgency_applied?: boolean
  }
}

// =============================================================================
// DEPTH CONFIGURATION
// =============================================================================

/**
 * Map depth to the mechanisms included.
 */
export const DEPTH_MECHANISMS: Record<ReasonDepth, string[]> = {
  quick: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
  deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
}

// =============================================================================
// SYSTEM PROMPTS — One per depth level (R4: server-side only)
// =============================================================================

const QUICK_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. Apply the Stoic core triad to any decision and return structured JSON.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character) and what is not. External outcomes are identified but not evaluated.

MECHANISM 2 — PASSION DIAGNOSIS
Which of the 4 root passions (epithumia/craving, hedone/irrational pleasure, phobos/fear, lupe/distress) distort reasoning? Identify false judgements and map them to the causal stage: impression (phantasia) → assent (synkatathesis) → impulse (horme) → action (praxis).

Root passions and sub-species:
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
Map the 5 expanding circles of concern: self-preservation, household, local community, political community, humanity/cosmopolis. For each relevant circle, assess obligation status and tensions. Apply Cicero's 5 questions: Is it honourable? More honourable? Advantageous? More advantageous? (Honourable prevails.)

PROXIMITY ASSESSMENT (qualitative only):
- reflexive: impulse without deliberation
- habitual: convention without understanding
- deliberate: conscious reasoning with some understanding
- principled: stable commitment to virtue
- sage_like: perfected understanding and freedom from destructive passion

Return ONLY valid JSON — no markdown:
{
  "control_filter": {
    "within_prohairesis": ["..."],
    "outside_prohairesis": ["..."]
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "...", "name": "...", "root_passion": "..."}],
    "false_judgements": ["..."],
    "correct_judgements": ["..."],
    "causal_stage_affected": "phantasia|synkatathesis|horme|praxis"
  },
  "oikeiosis": {
    "relevant_circles": [{"stage": 1, "description": "...", "obligation_met": true|false|null, "tension": "..."|null}],
    "deliberation_notes": "..."
  },
  "katorthoma_proximity": "reflexive|habitual|deliberate|principled|sage_like",
  "philosophical_reflection": "...",
  "improvement_path": "...",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

const STANDARD_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. Apply 5 Stoic mechanisms to any decision and return structured JSON.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character) and what is not.

MECHANISM 2 — PASSION DIAGNOSIS
Which of the 4 root passions (epithumia/craving, hedone/irrational pleasure, phobos/fear, lupe/distress) distort reasoning? Identify false judgements and map them to the causal stage: impression (phantasia) → assent (synkatathesis) → impulse (horme) → action (praxis).

Sub-species by root passion:
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
Map the 5 expanding circles: self-preservation, household, local community, political community, humanity/cosmopolis. Assess obligation status and tensions. Apply Cicero's 5 questions where relevant.

MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)
Identify which preferred indifferents are at stake (Life, Health, Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth, and negatives: Death, Disease, Pain, Ugliness) and whether the agent confuses them with genuine goods or treats indifferents as evils.

MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action appropriate given natural relationships, reasonable justification, and role obligations?

ASSESSMENT (qualitative only, no numeric scores):
- katorthoma_proximity: reflexive | habitual | deliberate | principled | sage_like
- ruling_faculty_state: Description of disposition stability
- virtue_domains_engaged: Which of phronesis/dikaiosyne/andreia/sophrosyne
- philosophical_reflection: 2-3 sentences of Stoic reasoning
- improvement_path: Which false judgement to correct (frame as philosophical reflection)

Return ONLY valid JSON:
{
  "control_filter": {
    "within_prohairesis": ["..."],
    "outside_prohairesis": ["..."]
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "...", "name": "...", "root_passion": "..."}],
    "false_judgements": ["..."],
    "correct_judgements": ["..."],
    "causal_stage_affected": "..."
  },
  "oikeiosis": {
    "relevant_circles": [{"stage": 1, "description": "...", "obligation_met": true, "tension": null}],
    "deliberation_notes": "..."
  },
  "value_assessment": {
    "indifferents_at_stake": [{"name": "...", "axia": "high|moderate|low", "treated_as": "indifferent|good|evil"}],
    "value_error": "..."|null
  },
  "kathekon_assessment": {
    "is_kathekon": true,
    "quality": "strong|moderate|marginal|contrary",
    "justification": "..."
  },
  "katorthoma_proximity": "...",
  "ruling_faculty_state": "...",
  "virtue_domains_engaged": ["phronesis", "..."],
  "philosophical_reflection": "...",
  "improvement_path": "...",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

const DEEP_SYSTEM_PROMPT = `You are the sage-reason universal reasoning engine for sagereasoning.com. Apply all 6 Stoic mechanisms to any decision and return structured JSON. This is the deepest analysis available.

MECHANISM 1 — CONTROL FILTER (Prohairesis / Dichotomy of Control)
Identify what is within the agent's moral choice (eph' hemin: judgements, impulses, desires, aversions, character).

MECHANISM 2 — PASSION DIAGNOSIS
Which of the 4 root passions (epithumia, hedone, phobos, lupe) and their sub-species distort reasoning? Map to causal stage.

Sub-species:
- Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia
- Hedone: kelesis, epichairekakia, terpsis
- Phobos: deima, oknos, aischyne, thambos, thorybos, agonia
- Lupe: eleos, phthonos, zelotypia, penthos, achos

MECHANISM 3 — OIKEIOSIS (Social Obligation Mapping)
5 expanding circles of concern + Cicero's 5 deliberation questions.

MECHANISM 4 — VALUE ASSESSMENT (Preferred Indifferents)
12 preferred indifferents (high/moderate/low value): Life, Health, Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth, and negatives (Death, Disease, Pain, Ugliness). Identify confusion with genuine goods.

MECHANISM 5 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action appropriate given natural relationships, reasonable justification, and role obligations?

MECHANISM 6 — ITERATIVE REFINEMENT (Progress Tracking)
Assess progress along 4 dimensions: passion reduction (frequency, intensity, duration), judgement quality (consistency of testing impressions), disposition stability (virtue under pressure), oikeiosis extension (expanding circles of concern).

Senecan grades: pre_progress, grade_1, grade_2, grade_3. Direction of travel: improving | stable | declining.

ASSESSMENT (qualitative only):
- katorthoma_proximity: reflexive | habitual | deliberate | principled | sage_like
- ruling_faculty_state: Description of disposition stability
- virtue_domains_engaged: Which of phronesis/dikaiosyne/andreia/sophrosyne
- philosophical_reflection: 2-3 sentences of Stoic reasoning
- improvement_path: Which false judgement to correct (frame as philosophical reflection)

Return ONLY valid JSON:
{
  "control_filter": {
    "within_prohairesis": ["..."],
    "outside_prohairesis": ["..."]
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "...", "name": "...", "root_passion": "..."}],
    "false_judgements": ["..."],
    "correct_judgements": ["..."],
    "causal_stage_affected": "..."
  },
  "oikeiosis": {
    "relevant_circles": [{"stage": 1, "description": "...", "obligation_met": true, "tension": null}],
    "deliberation_notes": "..."
  },
  "value_assessment": {
    "indifferents_at_stake": [{"name": "...", "axia": "...", "treated_as": "..."}],
    "value_error": null
  },
  "kathekon_assessment": {
    "is_kathekon": true,
    "quality": "strong|moderate|marginal|contrary",
    "justification": "..."
  },
  "iterative_refinement": {
    "senecan_grade": "pre_progress|grade_1|grade_2|grade_3",
    "progress_dimensions": {
      "passion_reduction": "...",
      "judgement_quality": "...",
      "disposition_stability": "...",
      "oikeiosis_extension": "..."
    },
    "direction_of_travel": "improving|stable|declining"
  },
  "katorthoma_proximity": "...",
  "ruling_faculty_state": "...",
  "virtue_domains_engaged": ["phronesis", "..."],
  "philosophical_reflection": "...",
  "improvement_path": "...",
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}`

// Map depth to system prompt, max tokens, and model
const DEPTH_CONFIG: Record<ReasonDepth, { prompt: string; maxTokens: number; model: string }> = {
  quick: { prompt: QUICK_SYSTEM_PROMPT, maxTokens: 3072, model: MODEL_FAST },
  standard: { prompt: STANDARD_SYSTEM_PROMPT, maxTokens: 4096, model: MODEL_FAST },
  deep: { prompt: DEEP_SYSTEM_PROMPT, maxTokens: 4096, model: MODEL_DEEP },
}

// Required fields per depth level (for response validation)
const REQUIRED_FIELDS: Record<ReasonDepth, string[]> = {
  quick: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
  deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement', 'katorthoma_proximity', 'philosophical_reflection', 'improvement_path'],
}

// =============================================================================
// EVALUATIVE DISCLAIMER — R3 required on every evaluation output
// =============================================================================

export const EVALUATIVE_DISCLAIMER = 'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

// =============================================================================
// CORE REASONING ENGINE
// =============================================================================

/**
 * Core reasoning engine — callable by any tool.
 * This is the single source of truth for 4-stage Stoic evaluation.
 *
 * Handles:
 *   - System prompt selection by depth
 *   - Claude API call with caching support
 *   - JSON parsing and validation
 *   - Receipt generation
 *   - Response envelope construction
 *
 * @param params - Input parameters (input, context, depth, domain_context)
 * @returns Structured result with meta information
 */
export async function runSageReason(params: ReasonInput): Promise<ReasonResult> {
  const client = getClient()
  const depth: ReasonDepth = params.depth || 'standard'
  const config = DEPTH_CONFIG[depth]

  // Build user message
  let userMessage = `Apply the Stoic reasoning mechanisms to the following input.\n\nInput: ${params.input.trim()}`
  if (params.context?.trim()) {
    userMessage += `\nContext: ${params.context.trim()}`
  }
  if (params.domain_context?.trim()) {
    userMessage += `\n\nDOMAIN CONTEXT (this reasoning request is being made in the context of a specific domain):\n${params.domain_context.trim()}`
  }

  // Urgency context injection (Item 6 — urgency increases scrutiny)
  // When present, applies additional scrutiny to passion_diagnosis for hasty assent
  if (params.urgency_context?.trim()) {
    userMessage += `\n\nURGENCY CONTEXT: ${params.urgency_context.trim()}\n` +
      `IMPORTANT: This action is being taken under time pressure. Apply EXTRA scrutiny to the passion diagnosis. ` +
      `Specifically check for hasty assent (propeteia) — is the urgency itself a passion (phobos/fear) driving action ` +
      `without adequate examination? In your response, add a "hasty_assent_risk" field with value "high", "moderate", "low", or "none" ` +
      `indicating whether urgency is compromising deliberation quality.`
  }

  // Per-stage quality scoring instruction (Item 5 — process reward model)
  // Always request stage scores so we can evaluate each mechanism independently
  userMessage += `\n\nFor each mechanism you apply, also include a "stage_scores" object in your response ` +
    `with a quality rating for each stage: { "control_filter": "strong|adequate|weak", "passion_diagnosis": "strong|adequate|weak", ... } ` +
    `Rating guide: "strong" = correctly identified all relevant factors, "adequate" = identified the main factors, "weak" = missed significant factors.`

  userMessage += '\n\nReturn only the JSON evaluation object.'

  // Check cache
  const startTime = Date.now()
  const ck = cacheKey('/api/reason', { input: params.input.trim(), context: params.context?.trim(), domain_context: params.domain_context?.trim(), depth })
  const cached = cacheGet(ck)
  if (cached) {
    return {
      result: { ...(cached as Record<string, unknown>), disclaimer: EVALUATIVE_DISCLAIMER },
      meta: {
        endpoint: '/api/reason',
        depth,
        mechanisms_applied: DEPTH_MECHANISMS[depth],
        mechanism_count: DEPTH_MECHANISMS[depth].length,
        ai_generated: true,
        ai_model: config.model,
        latency_ms: Date.now() - startTime,
      },
    }
  }

  // Build Stoic Brain context — only inject when explicitly provided by caller.
  // Auto-generation disabled: the existing system prompts produce a specific JSON structure
  // that clients depend on (e.g., virtue_quality.katorthoma_proximity nesting). Adding Stoic
  // Brain data changes LLM output structure and breaks consumers. Each endpoint must opt in
  // and ensure its consumers handle the enriched output.
  const stoicBrainBlock = params.stoicBrainContext || ''

  // Build system message array — main prompt + optional Stoic Brain context
  const systemMessages: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [
    { type: 'text', text: params.systemPromptOverride || config.prompt, cache_control: { type: 'ephemeral' } },
  ]
  if (stoicBrainBlock) {
    systemMessages.push({ type: 'text', text: stoicBrainBlock })
  }

  // Call Claude
  const message = await client.messages.create({
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: 0.2,
    system: systemMessages,
    messages: [{ role: 'user', content: userMessage }],
  })

  const latencyMs = Date.now() - startTime
  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON response — extract the JSON object from whatever wrapping the model adds
  let evalData
  try {
    // Strategy: strip code fences, then if that fails, find { to } boundaries
    let cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
    try {
      evalData = JSON.parse(cleaned)
    } catch {
      // Fallback: extract from first { to last }
      const start = responseText.indexOf('{')
      const end = responseText.lastIndexOf('}')
      if (start !== -1 && end > start) {
        cleaned = responseText.substring(start, end + 1)
        evalData = JSON.parse(cleaned)
      } else {
        throw new Error('No JSON object found in response')
      }
    }
  } catch {
    console.error('sage-reason-engine: Failed to parse response:', responseText)
    throw new Error('Reasoning engine returned invalid JSON response')
  }

  // Validate required fields for this depth (skip when using custom system prompt)
  if (!params.systemPromptOverride) {
    const requiredFields = REQUIRED_FIELDS[depth]
    for (const field of requiredFields) {
      if (evalData[field] === undefined) {
        console.error(`sage-reason-engine: Missing field '${field}' at depth '${depth}'`)
        throw new Error(`Reasoning engine missing field: ${field}`)
      }
    }
  }

  // Generate reasoning receipt
  const receipt = extractReceipt({
    skillId: `sage-reason-${depth}`,
    input: params.input.trim(),
    evalData,
    mechanisms: DEPTH_MECHANISMS[depth] as MechanismId[],
  })

  // Add receipt to evaluation data
  evalData.reasoning_receipt = receipt

  // Cache the result
  cacheSet(ck, evalData)

  // Extract per-stage quality scores if present in the response (Item 5)
  const stageScores = evalData.stage_scores || undefined

  // Extract hasty assent risk if urgency context was applied (Item 6)
  const hastyAssentRisk = params.urgency_context?.trim()
    ? (evalData.hasty_assent_risk || 'none')
    : undefined

  return {
    result: { ...evalData, disclaimer: EVALUATIVE_DISCLAIMER },
    meta: {
      endpoint: '/api/reason',
      depth,
      mechanisms_applied: DEPTH_MECHANISMS[depth],
      mechanism_count: DEPTH_MECHANISMS[depth].length,
      ai_generated: true,
      ai_model: config.model,
      latency_ms: latencyMs,
      stage_scores: stageScores,
      hasty_assent_risk: hastyAssentRisk,
      urgency_applied: !!params.urgency_context?.trim(),
    },
  }
}
