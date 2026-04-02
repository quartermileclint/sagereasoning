/**
 * sage-classify.ts — Reasoned classification for OpenBrain AI Sorter integration.
 *
 * Replaces raw LLM classification with Stoic-reasoned categorisation that
 * evaluates both WHAT the input is and the REASONING QUALITY of the input content.
 *
 * Designed for OpenBrain step 4 (AI Sorter): accepts raw input + category
 * definitions, returns classification + reasoning receipt.
 *
 * V3 Derivation:
 *   Uses 3 mechanisms (R12 compliant: ≥2 required):
 *     - control_filter (stoic-brain.json): What in this input is within prohairesis?
 *     - passion_diagnosis (passions.json): Is the input driven by passion?
 *     - oikeiosis (action.json): Which circle of concern does this affect?
 *
 * Rules:
 *   R1:  No therapeutic implication in classification output
 *   R3:  Disclaimer on evaluative output
 *   R4:  Classification logic server-side only
 *   R8d: Plain English in agent-facing descriptions
 *   R9:  Evaluates reasoning quality, does not predict outcomes
 *   R12: 3 mechanisms (control_filter, passion_diagnosis, oikeiosis)
 */

import type { KatorthomaProximityLevel } from './stoic-brain'
import { EVALUATIVE_DISCLAIMER } from './stoic-brain'
import type { ReasoningReceipt, PassionDetection, MechanismId } from './reasoning-receipt'
import { buildReceipt, STAGE_SOURCE_FILES } from './reasoning-receipt'

// =============================================================================
// TYPES
// =============================================================================

/** A category that input can be routed to (maps to an OpenBrain table). */
export type ClassifyCategory = {
  /** Category identifier — typically the OpenBrain table name */
  id: string
  /** Human-readable label */
  label: string
  /** What belongs in this category */
  description: string
}

/** Request to sage-classify. */
export type SageClassifyRequest = {
  /** The raw input to classify */
  input: string

  /** Available categories the input can be routed to */
  categories: ClassifyCategory[]

  /** Optional context about the user or system state */
  context?: string

  /**
   * Confidence threshold (0.0 - 1.0). Below this, input stays in inbox.
   * Default: 0.7
   */
  confidence_threshold?: number
}

/** What sage-classify recommends doing with the input. */
export type ClassifyAction = 'classify' | 'hold_for_review' | 'flag_urgent' | 'defer'

/** Response from sage-classify. */
export type SageClassifyResponse = {
  /** Assigned category ID (null if below confidence threshold) */
  category: string | null

  /** Category label for human readability */
  category_label: string | null

  /** Classification confidence (0.0 - 1.0) */
  confidence: number

  /** Why this category was chosen — includes Stoic reasoning */
  reasoning: string

  /** Reasoning quality of the input content itself */
  input_proximity: KatorthomaProximityLevel

  /** Passions detected in the input content */
  passions_detected: PassionDetection[]

  /** Whether the input describes appropriate action (kathekon) */
  is_kathekon: boolean | null

  /**
   * Oikeiosis stage (1-5) — which circle of concern this input affects.
   * 1=self, 2=family, 3=community, 4=humanity, 5=cosmos
   * Source: action.json → oikeiosis_stages
   */
  oikeiosis_stage: number

  /** Recommended handling action */
  action: ClassifyAction

  /** Structured reasoning receipt for audit trail */
  reasoning_receipt: ReasoningReceipt

  /** R3 disclaimer */
  disclaimer: string
}

// =============================================================================
// CLASSIFICATION PROMPT (R4: server-side only, never exposed to clients)
// =============================================================================

/**
 * Build the classification prompt for the LLM.
 *
 * This prompt is NEVER returned to clients (R4). It stays server-side
 * and produces structured JSON that the response parser handles.
 */
export function buildClassifyPrompt(request: SageClassifyRequest): string {
  const categoryList = request.categories
    .map(c => `  - ${c.id}: ${c.label} — ${c.description}`)
    .join('\n')

  return `You are the Sage classification engine for sagereasoning.com. Your task is to classify an input into one of the provided categories, while simultaneously evaluating the reasoning quality of the input content itself.

INPUT TO CLASSIFY:
"${request.input}"

${request.context ? `CONTEXT: ${request.context}` : ''}

AVAILABLE CATEGORIES:
${categoryList}

Apply the following V3 mechanisms:

1. CONTROL FILTER (prohairesis): What aspects of this input are within moral choice? What is external? This helps determine whether the input is about decisions (actionable) or events (informational).

2. PASSION DIAGNOSIS: Is the input content itself driven by passion? Identify any root passions (epithumia=craving, hedone=delight, phobos=fear, lupe=distress) and their sub-species. State the false judgement.

3. OIKEIOSIS MAPPING: Which circle of concern does this input affect?
   Stage 1: Self (self-preservation, personal wellbeing)
   Stage 2: Family/intimates
   Stage 3: Community/professional
   Stage 4: Humanity (all rational beings)
   Stage 5: Cosmos (universal order)

Based on these mechanisms:
- Classify the input into the most appropriate category
- Assess the reasoning quality of the input content (proximity level)
- Determine the recommended action

CRITICAL: Do NOT produce 0-100 numeric scores. Use qualitative proximity levels only.

Return ONLY valid JSON:
{
  "category": "<category_id or null if uncertain>",
  "confidence": <0.0-1.0>,
  "reasoning": "<2-3 sentences explaining the classification and reasoning assessment>",
  "input_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
  "passions_detected": [{"root_passion": "<epithumia|hedone|phobos|lupe>", "sub_species": "<string>", "false_judgement": "<string>"}],
  "is_kathekon": <true|false|null>,
  "oikeiosis_stage": <1-5>,
  "control_filter": {
    "within_prohairesis": ["<items within moral choice>"],
    "outside_prohairesis": ["<items outside moral choice>"]
  },
  "prohairesis_summary": "<1 sentence: what is and isn't within control here>"
}`
}

// =============================================================================
// RESPONSE PARSER
// =============================================================================

/**
 * Determine the classification action based on confidence, proximity, and passions.
 */
export function determineAction(
  confidence: number,
  threshold: number,
  proximity: KatorthomaProximityLevel,
  passionsCount: number
): ClassifyAction {
  // Below confidence threshold — hold for human review
  if (confidence < threshold) return 'hold_for_review'

  // Reflexive input with passions — flag as potentially urgent/reactive
  if (proximity === 'reflexive' && passionsCount > 0) return 'flag_urgent'

  // Low proximity but above confidence — defer for further evaluation
  if (proximity === 'reflexive' || proximity === 'habitual') return 'defer'

  // Confident classification with reasonable input quality
  return 'classify'
}

/**
 * Parse LLM output and build the full SageClassifyResponse.
 *
 * This function bridges the raw LLM JSON output to the typed response,
 * generates the reasoning receipt, and applies business logic for the
 * classification action.
 */
export function buildClassifyResponse(
  llmOutput: {
    category: string | null
    confidence: number
    reasoning: string
    input_proximity: KatorthomaProximityLevel
    passions_detected: Array<{
      root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
      sub_species: string
      false_judgement: string
    }>
    is_kathekon: boolean | null
    oikeiosis_stage: number
    control_filter?: {
      within_prohairesis: string[]
      outside_prohairesis: string[]
    }
    prohairesis_summary?: string
  },
  request: SageClassifyRequest
): SageClassifyResponse {
  const threshold = request.confidence_threshold ?? 0.7

  // Map passions to typed detections
  const passions: PassionDetection[] = llmOutput.passions_detected.map(p => ({
    root_passion: p.root_passion,
    sub_species: p.sub_species,
    false_judgement: p.false_judgement,
    detected_at_stage: 3, // Passion diagnosis is always stage 3
  }))

  // Determine recommended action
  const action = determineAction(
    llmOutput.confidence,
    threshold,
    llmOutput.input_proximity,
    passions.length
  )

  // If action is hold_for_review, nullify the category assignment
  const assignedCategory = action === 'hold_for_review' ? null : llmOutput.category
  const categoryLabel = assignedCategory
    ? request.categories.find(c => c.id === assignedCategory)?.label ?? null
    : null

  // Build the reasoning receipt
  const mechanisms: MechanismId[] = ['control_filter', 'passion_diagnosis', 'oikeiosis']

  const receipt = buildReceipt({
    skill_id: 'sage-classify',
    input: request.input,
    mechanisms,
    trace: [
      {
        stage: 1,
        stage_name: 'prohairesis_filter',
        determination: llmOutput.prohairesis_summary
          || 'Control filter applied to distinguish actionable from informational content.',
        source_files: STAGE_SOURCE_FILES[1],
      },
      {
        stage: 3,
        stage_name: 'passion_diagnosis',
        determination: passions.length > 0
          ? `Detected ${passions.length} passion(s): ${passions.map(p => p.sub_species).join(', ')}.`
          : 'No passions detected in the input content.',
        source_files: STAGE_SOURCE_FILES[3],
      },
    ],
    proximity: llmOutput.input_proximity,
    passions,
    is_kathekon: llmOutput.is_kathekon,
    recommended_next: action === 'classify'
      ? null
      : action === 'flag_urgent'
        ? 'Review this input before acting — passion-driven content detected.'
        : action === 'defer'
          ? 'Input routed but reasoning quality is low — consider deeper evaluation with sage-reason.'
          : 'Classification uncertain — human review recommended before routing.',
  })

  return {
    category: assignedCategory,
    category_label: categoryLabel,
    confidence: llmOutput.confidence,
    reasoning: llmOutput.reasoning,
    input_proximity: llmOutput.input_proximity,
    passions_detected: passions,
    is_kathekon: llmOutput.is_kathekon,
    oikeiosis_stage: llmOutput.oikeiosis_stage,
    action,
    reasoning_receipt: receipt,
    disclaimer: EVALUATIVE_DISCLAIMER,
  }
}

// =============================================================================
// DEFAULT CATEGORIES (for OpenBrain builders who don't define their own)
// =============================================================================

/**
 * Standard OpenBrain categories matching Nate's recommended table structure.
 * OpenBrain builders can override these with their own category definitions.
 */
export const OPENBRAIN_DEFAULT_CATEGORIES: ClassifyCategory[] = [
  {
    id: 'thought',
    label: 'Thought',
    description: 'A reflection, observation, or idea that doesn\'t require immediate action.',
  },
  {
    id: 'task',
    label: 'Task',
    description: 'An actionable item that needs to be completed. Has a clear done state.',
  },
  {
    id: 'person',
    label: 'Person',
    description: 'Information about a person — contact details, notes from interactions, relationship context.',
  },
  {
    id: 'project',
    label: 'Project',
    description: 'A multi-step initiative with a goal, timeline, and related tasks.',
  },
  {
    id: 'idea',
    label: 'Idea',
    description: 'A creative concept, business idea, or possibility worth exploring further.',
  },
  {
    id: 'decision',
    label: 'Decision',
    description: 'A choice that needs to be made or has been made. Includes rationale and alternatives.',
  },
]
