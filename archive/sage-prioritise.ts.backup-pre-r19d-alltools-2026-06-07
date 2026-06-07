/**
 * sage-prioritise.ts — Stoic-reasoned prioritisation framework.
 *
 * Extends the existing sage-prioritise skill contract into a full
 * prioritisation service. Ranks items by principled reasoning rather
 * than urgency or fear, using the control filter, passion diagnosis,
 * and oikeiosis mapping.
 *
 * Primary use cases:
 *   1. OpenBrain proactive agent loops (step 9) — principled task selection
 *   2. Zeus/CoLab daily briefing — cross-project priority ranking
 *   3. Any agent needing to decide what to work on next
 *
 * V3 Derivation:
 *   Uses 3 mechanisms (R12 compliant: ≥2 required):
 *     - control_filter (stoic-brain.json): Is this within my power to affect?
 *     - passion_diagnosis (passions.json): Am I prioritising out of fear/craving?
 *     - oikeiosis (action.json): Which circle of obligation does this serve?
 *
 *   Prioritisation philosophy (derived from V3 sources):
 *     - Value theory (value.json): Genuine goods > preferred indifferents > dispreferred
 *     - Kathekon (action.json): Appropriate actions take precedence
 *     - Oikeiosis (action.json): Expanding circles determine social obligation weight
 *     - Passions (passions.json): Urgency addiction (agonia), FOMO (epithumia),
 *       avoidance (phobos) are passion patterns that distort prioritisation
 *
 * Rules:
 *   R1:  No therapeutic implication
 *   R3:  Disclaimer on all evaluative output
 *   R4:  Prioritisation logic server-side only
 *   R6c: Qualitative proximity levels, not numeric scores
 *   R8d: Plain English in agent-facing descriptions
 *   R9:  Evaluates reasoning quality of prioritisation, does not guarantee outcomes
 */

import type { KatorthomaProximityLevel } from './stoic-brain'
import { EVALUATIVE_DISCLAIMER } from './stoic-brain'
import type { ReasoningReceipt, PassionDetection, MechanismId } from './reasoning-receipt'
import { buildReceipt, STAGE_SOURCE_FILES } from './reasoning-receipt'

// =============================================================================
// TYPES
// =============================================================================

/** A single item to be prioritised. */
export type PriorityItem = {
  /** Unique item identifier */
  id: string

  /** Item description */
  description: string

  /** Source project or category (e.g., "sagereasoning", "personal", "support") */
  source?: string

  /** Urgency signal from the source system (e.g., "overdue", "due today", "blocked") */
  urgency_signal?: string
}

/** Time horizon for prioritisation context. */
export type PriorityHorizon =
  | 'immediate'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'

/** Request to sage-prioritise. */
export type SagePrioritiseRequest = {
  /** Items to prioritise (2-20) */
  items: PriorityItem[]

  /** What the prioritisation serves — the overarching goal */
  objective?: string

  /** Who is affected by these priorities */
  stakeholders?: string

  /** Time horizon for the prioritisation */
  horizon?: PriorityHorizon

  /** Agent or user identifier for tracking */
  agent_id?: string
}

/** What the sage recommends doing with a specific item. */
export type ItemAction = 'do_now' | 'schedule' | 'delegate' | 'defer' | 'reconsider'

/** A single item with its priority ranking and reasoning. */
export type RankedItem = {
  /** Item ID from input */
  id: string

  /** Priority rank (1 = highest) */
  rank: number

  /** Why this item ranks here — Stoic reasoning in plain English */
  reasoning: string

  /** Is pursuing this item within prohairesis (moral choice)? */
  within_control: boolean

  /**
   * Oikeiosis stage (1-5) — which circle of concern this serves.
   * Higher stages indicate broader social obligation.
   * Source: action.json → oikeiosis_stages
   */
  oikeiosis_stage: number

  /** Passions that might be inflating or deflating this item's priority */
  passions_detected: PassionDetection[]

  /** Is pursuing this item an appropriate action (kathekon)? */
  is_kathekon: boolean

  /** Recommended action for this item */
  action: ItemAction
}

/** Response from sage-prioritise. */
export type SagePrioritiseResponse = {
  /** Items in priority order (highest first) */
  ranked_items: RankedItem[]

  /** Overall assessment of the priority list as a whole */
  overall_assessment: string

  /**
   * Patterns detected across the full list.
   * Examples: "urgency addiction", "avoidance of difficult tasks",
   * "over-indexing on self (oikeiosis stage 1)"
   */
  patterns_detected: string[]

  /** Reasoning receipt for audit trail */
  reasoning_receipt: ReasoningReceipt

  /** R3 disclaimer */
  disclaimer: string
}

// =============================================================================
// PRIORITISATION PROMPT (R4: server-side only)
// =============================================================================

/**
 * Build the prioritisation prompt for the LLM.
 * This is NEVER returned to clients (R4).
 */
export function buildPrioritisePrompt(request: SagePrioritiseRequest): string {
  const itemList = request.items
    .map((item, i) => {
      let line = `  ${i + 1}. [${item.id}] ${item.description}`
      if (item.source) line += ` (source: ${item.source})`
      if (item.urgency_signal) line += ` [urgency: ${item.urgency_signal}]`
      return line
    })
    .join('\n')

  return `You are the Sage prioritisation engine for sagereasoning.com. Your task is to rank a list of items by principled reasoning, not urgency or fear.

ITEMS TO PRIORITISE:
${itemList}

${request.objective ? `OBJECTIVE: ${request.objective}` : ''}
${request.stakeholders ? `STAKEHOLDERS: ${request.stakeholders}` : ''}
${request.horizon ? `TIME HORIZON: ${request.horizon}` : ''}

Apply the following V3 mechanisms to EACH item:

1. CONTROL FILTER (prohairesis): Is this item within the agent's power to affect? Items fully outside control rank lower unless they prepare for what IS within control.

2. PASSION DIAGNOSIS: Is this item's perceived priority inflated by passion?
   Common prioritisation passions:
   - Agonia (anxiety/dread): Makes things feel more urgent than they are
   - Epithumia (craving): FOMO, shiny object syndrome, excitement-driven priority
   - Phobos (fear): Avoidance of difficult tasks disguised as deprioritisation
   - Lupe (distress): Guilt-driven prioritisation without rational basis

3. OIKEIOSIS MAPPING: Which circle of concern does this item serve?
   Stage 1: Self (personal wellbeing, self-preservation)
   Stage 2: Family/intimates
   Stage 3: Community/professional obligations
   Stage 4: Humanity (broader impact)
   Stage 5: Cosmos (universal rational order)
   Items serving broader circles generally rank higher when the agent's self-needs are met.

RANKING PRINCIPLES (derived from V3 value theory):
- Items that are genuine goods (virtue-exercising) outrank preferred indifferents (useful but not essential)
- Appropriate actions (kathekonta) outrank inappropriate ones regardless of urgency
- Items within control outrank items outside control
- Items serving broader oikeiosis circles outrank self-focused items (assuming self-needs are met)
- Urgency signals should be evaluated, not blindly followed — urgency is often passion-driven

For each item, determine a recommended action:
- do_now: Within control, appropriate, serves obligations, high principled priority
- schedule: Appropriate but not immediate — plan for later in the time horizon
- delegate: Outside the agent's specific prohairesis but within someone else's
- defer: Low priority, no active obligation, can wait
- reconsider: Priority seems passion-driven — needs deeper evaluation before acting

Return ONLY valid JSON:
{
  "ranked_items": [
    {
      "id": "<item_id>",
      "rank": <1=highest>,
      "reasoning": "<2-3 sentences explaining the ranking>",
      "within_control": <true|false>,
      "oikeiosis_stage": <1-5>,
      "passions_detected": [{"root_passion": "<epithumia|hedone|phobos|lupe>", "sub_species": "<string>", "false_judgement": "<string>"}],
      "is_kathekon": <true|false>,
      "action": "<do_now|schedule|delegate|defer|reconsider>"
    }
  ],
  "overall_assessment": "<2-3 sentences: overall reasoning quality of the priority list, balance of obligations>",
  "patterns_detected": ["<pattern1>", "<pattern2>"]
}`
}

// =============================================================================
// RESPONSE BUILDER
// =============================================================================

/**
 * Parse LLM output and build the full SagePrioritiseResponse.
 */
export function buildPrioritiseResponse(
  llmOutput: {
    ranked_items: Array<{
      id: string
      rank: number
      reasoning: string
      within_control: boolean
      oikeiosis_stage: number
      passions_detected: Array<{
        root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
        sub_species: string
        false_judgement: string
      }>
      is_kathekon: boolean
      action: ItemAction
    }>
    overall_assessment: string
    patterns_detected: string[]
  },
  request: SagePrioritiseRequest
): SagePrioritiseResponse {
  // Convert LLM passion output to typed PassionDetections
  const rankedItems: RankedItem[] = llmOutput.ranked_items.map(item => ({
    id: item.id,
    rank: item.rank,
    reasoning: item.reasoning,
    within_control: item.within_control,
    oikeiosis_stage: item.oikeiosis_stage,
    passions_detected: item.passions_detected.map(p => ({
      root_passion: p.root_passion,
      sub_species: p.sub_species,
      false_judgement: p.false_judgement,
      detected_at_stage: 3,
    })),
    is_kathekon: item.is_kathekon,
    action: item.action,
  }))

  // Aggregate all passions across items for the receipt
  const allPassions: PassionDetection[] = rankedItems.flatMap(item => item.passions_detected)

  // Determine overall proximity based on pattern analysis
  const overallProximity = determineOverallProximity(rankedItems, llmOutput.patterns_detected)

  // Build the reasoning receipt
  const mechanisms: MechanismId[] = ['control_filter', 'passion_diagnosis', 'oikeiosis']

  const receipt = buildReceipt({
    skill_id: 'sage-prioritise',
    input: request.items.map(i => i.description).join(' | '),
    mechanisms,
    trace: [
      {
        stage: 1,
        stage_name: 'prohairesis_filter',
        determination: `Assessed ${request.items.length} items for controllability. ${rankedItems.filter(i => i.within_control).length} within prohairesis, ${rankedItems.filter(i => !i.within_control).length} outside.`,
        source_files: STAGE_SOURCE_FILES[1],
      },
      {
        stage: 3,
        stage_name: 'passion_diagnosis',
        determination: allPassions.length > 0
          ? `Detected ${allPassions.length} passion(s) across ${rankedItems.filter(i => i.passions_detected.length > 0).length} item(s). Patterns: ${llmOutput.patterns_detected.join(', ') || 'none'}.`
          : 'No passion-driven prioritisation detected.',
        source_files: STAGE_SOURCE_FILES[3],
      },
    ],
    proximity: overallProximity,
    passions: allPassions,
    is_kathekon: null, // Aggregate — individual items have kathekon assessments
    recommended_next: rankedItems.some(i => i.action === 'reconsider')
      ? 'Some items flagged for reconsideration — evaluate with sage-reason before acting.'
      : rankedItems.filter(i => i.action === 'do_now').length > 0
        ? `${rankedItems.filter(i => i.action === 'do_now').length} item(s) ready for immediate action.`
        : null,
  })

  return {
    ranked_items: rankedItems,
    overall_assessment: llmOutput.overall_assessment,
    patterns_detected: llmOutput.patterns_detected,
    reasoning_receipt: receipt,
    disclaimer: EVALUATIVE_DISCLAIMER,
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Determine overall prioritisation quality from ranked items.
 *
 * Logic:
 *   - If many items marked "reconsider" → habitual (passion-driven prioritisation)
 *   - If most items within control and kathekon → principled
 *   - Default: deliberate (reasonable but room for improvement)
 */
function determineOverallProximity(
  items: RankedItem[],
  patterns: string[]
): KatorthomaProximityLevel {
  const total = items.length
  if (total === 0) return 'deliberate'

  const reconsiderCount = items.filter(i => i.action === 'reconsider').length
  const passionCount = items.filter(i => i.passions_detected.length > 0).length
  const kathekonCount = items.filter(i => i.is_kathekon).length
  const controlCount = items.filter(i => i.within_control).length

  // More than half need reconsideration — prioritisation is passion-driven
  if (reconsiderCount > total / 2) return 'reflexive'

  // Significant passion influence
  if (passionCount > total / 2 || patterns.length >= 3) return 'habitual'

  // Most items are appropriate and within control
  if (kathekonCount >= total * 0.7 && controlCount >= total * 0.7) return 'principled'

  // Reasonable but imperfect
  return 'deliberate'
}

/**
 * Extract a daily briefing summary from a prioritise response.
 * Designed for the Zeus/CoLab use case.
 */
export function buildDailyBriefing(response: SagePrioritiseResponse): {
  do_now: RankedItem[]
  schedule: RankedItem[]
  delegate: RankedItem[]
  defer: RankedItem[]
  reconsider: RankedItem[]
  summary: string
} {
  const grouped = {
    do_now: response.ranked_items.filter(i => i.action === 'do_now'),
    schedule: response.ranked_items.filter(i => i.action === 'schedule'),
    delegate: response.ranked_items.filter(i => i.action === 'delegate'),
    defer: response.ranked_items.filter(i => i.action === 'defer'),
    reconsider: response.ranked_items.filter(i => i.action === 'reconsider'),
  }

  const summary = [
    `${grouped.do_now.length} item(s) for immediate action.`,
    grouped.schedule.length > 0 ? `${grouped.schedule.length} to schedule.` : null,
    grouped.delegate.length > 0 ? `${grouped.delegate.length} to delegate.` : null,
    grouped.reconsider.length > 0 ? `${grouped.reconsider.length} flagged — may be passion-driven.` : null,
    response.patterns_detected.length > 0
      ? `Watch for: ${response.patterns_detected.join(', ')}.`
      : null,
  ]
    .filter(Boolean)
    .join(' ')

  return { ...grouped, summary }
}

// =============================================================================
// VALIDATION
// =============================================================================

/** Validate a prioritise request before processing. */
export function validatePrioritiseRequest(
  request: SagePrioritiseRequest
): { valid: boolean; error?: string } {
  if (!request.items || request.items.length < 2) {
    return { valid: false, error: 'At least 2 items required for prioritisation.' }
  }
  if (request.items.length > 20) {
    return { valid: false, error: 'Maximum 20 items per prioritisation request.' }
  }

  const ids = request.items.map(i => i.id)
  const uniqueIds = new Set(ids)
  if (uniqueIds.size !== ids.length) {
    return { valid: false, error: 'All item IDs must be unique.' }
  }

  for (const item of request.items) {
    if (!item.id || !item.description) {
      return { valid: false, error: 'Each item must have an id and description.' }
    }
  }

  return { valid: true }
}
