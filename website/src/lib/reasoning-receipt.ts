/**
 * reasoning-receipt.ts — Structured reasoning trace for every sage evaluation.
 *
 * Extends the response envelope with an auditable reasoning receipt that
 * documents not just what was decided, but which frameworks were applied,
 * what the reasoning path was, and what passions were detected.
 *
 * Designed for OpenBrain compatibility: receipts can be stored directly
 * in an immutable log table with the receipt_id as primary key.
 *
 * Rules:
 *   R3:  Disclaimer always present
 *   R4:  Receipts expose reasoning traces but NOT prompt templates or scoring logic
 *   R7:  Each reasoning step traces to specific V3 source files
 *   R8a: Greek identifiers in data layer (passion IDs, stage names)
 *   R8d: Plain English descriptions in agent-facing fields
 *   R9:  Evaluates reasoning quality, does not promise outcomes
 */

import type { KatorthomaProximityLevel } from './stoic-brain'
import { EVALUATIVE_DISCLAIMER } from './stoic-brain'

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single step in the reasoning trace, corresponding to one stage
 * of the V3 4-stage evaluation sequence.
 *
 * Source: scoring.json → evaluation_sequence
 */
export type ReasoningStep = {
  /** Evaluation stage number (1-4) per V3 sequence */
  readonly stage: number

  /**
   * Stage identifier from V3 evaluation sequence.
   * Maps to scoring.json stages:
   *   1 = prohairesis_filter
   *   2 = kathekon_assessment
   *   3 = passion_diagnosis
   *   4 = virtue_assessment
   */
  readonly stage_name:
    | 'prohairesis_filter'
    | 'kathekon_assessment'
    | 'passion_diagnosis'
    | 'virtue_assessment'

  /** What this stage determined — plain English summary (R8d) */
  readonly determination: string

  /**
   * Which V3 data file(s) this determination traces to (R7).
   * Examples: ['stoic-brain.json'], ['passions.json', 'psychology.json']
   */
  readonly source_files: string[]
}

/**
 * A passion detected during evaluation.
 *
 * Source: passions.json → root_passions → sub_species
 */
export type PassionDetection = {
  /** Root passion identifier (R8a: Greek ID in data layer) */
  readonly root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'

  /** Specific sub-species from passions.json taxonomy */
  readonly sub_species: string

  /** The false judgement driving this passion — plain English (R8d) */
  readonly false_judgement: string

  /** Which evaluation stage caught it (typically stage 3) */
  readonly detected_at_stage: number
}

/**
 * The complete reasoning receipt — an auditable trace of a sage evaluation.
 *
 * Designed to be:
 *   - Stored in OpenBrain's immutable log (receipt_id as PK)
 *   - Semantically searchable (mechanisms_applied as vector-friendly metadata)
 *   - Chainable (chain_id links iterations in a deliberation sequence)
 *   - Compliant (disclaimer always present per R3)
 */
export type ReasoningReceipt = {
  /** Unique receipt identifier (format: sr_rcpt_{ulid}) */
  readonly receipt_id: string

  /** ISO 8601 timestamp of when this evaluation was produced */
  readonly timestamp: string

  /** Which sage skill produced this receipt */
  readonly skill_id: string

  /**
   * Truncated summary of the evaluated input (max 200 chars).
   * Full input is NOT stored in the receipt (R4: protect IP by not
   * returning enough to reconstruct scoring patterns).
   */
  readonly input_summary: string

  /**
   * Which of the 6 Stoic Brain mechanisms were applied.
   * Maps to scoring.json → mechanisms:
   *   control_filter, passion_diagnosis, oikeiosis,
   *   value_assessment, kathekon_assessment, iterative_refinement
   */
  readonly mechanisms_applied: string[]

  /** Ordered reasoning steps — the evaluation path */
  readonly reasoning_trace: ReasoningStep[]

  /** Final proximity determination from the unified virtue assessment */
  readonly proximity: KatorthomaProximityLevel

  /** Passions identified during evaluation (may be empty) */
  readonly passions_detected: PassionDetection[]

  /** Whether the evaluated action/input was deemed appropriate (kathekon) */
  readonly is_kathekon: boolean | null

  /** Sage's recommended next action — plain English (R8d) */
  readonly recommended_next: string | null

  /**
   * Deliberation chain reference. Non-null when this receipt is part
   * of an iterative refinement sequence (sage-iterate).
   */
  readonly chain_id: string | null

  /** Step number within a chain (null if not in a chain) */
  readonly chain_step: number | null

  /** R3 disclaimer — always present on evaluative output */
  readonly disclaimer: string
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Stage names indexed by stage number for quick lookup */
export const STAGE_NAMES: Record<number, ReasoningStep['stage_name']> = {
  1: 'prohairesis_filter',
  2: 'kathekon_assessment',
  3: 'passion_diagnosis',
  4: 'virtue_assessment',
}

/** Source files typically referenced by each stage */
export const STAGE_SOURCE_FILES: Record<number, string[]> = {
  1: ['stoic-brain.json', 'psychology.json'],
  2: ['action.json', 'value.json'],
  3: ['passions.json', 'psychology.json'],
  4: ['virtue.json', 'scoring.json', 'progress.json'],
}

/**
 * Valid mechanism identifiers from scoring.json.
 * Used for validation and as searchable metadata in OpenBrain.
 */
export const VALID_MECHANISMS = [
  'control_filter',
  'passion_diagnosis',
  'oikeiosis',
  'value_assessment',
  'kathekon_assessment',
  'iterative_refinement',
] as const

export type MechanismId = (typeof VALID_MECHANISMS)[number]

// =============================================================================
// RECEIPT BUILDER
// =============================================================================

export type BuildReceiptOptions = {
  /** Which skill produced this evaluation */
  skill_id: string

  /** The original input (will be truncated to 200 chars for the receipt) */
  input: string

  /** Mechanisms applied during this evaluation */
  mechanisms: MechanismId[]

  /** The reasoning trace steps */
  trace: ReasoningStep[]

  /** Final proximity level */
  proximity: KatorthomaProximityLevel

  /** Passions detected (default: empty array) */
  passions?: PassionDetection[]

  /** Kathekon assessment result (null if not assessed) */
  is_kathekon?: boolean | null

  /** Recommended next action */
  recommended_next?: string | null

  /** Chain ID if part of a deliberation */
  chain_id?: string | null

  /** Step number within chain */
  chain_step?: number | null
}

/**
 * Generate a unique receipt ID.
 * Format: sr_rcpt_{timestamp_hex}_{random_hex}
 *
 * Uses timestamp + random for sortability and uniqueness
 * without requiring a ULID library.
 */
function generateReceiptId(): string {
  const timestamp = Date.now().toString(16).padStart(12, '0')
  const random = Math.random().toString(16).slice(2, 10)
  return `sr_rcpt_${timestamp}_${random}`
}

/**
 * Truncate input to a safe summary length.
 * R4: Don't include full input in receipt to prevent pattern reconstruction.
 */
function truncateInput(input: string, maxLength: number = 200): string {
  if (input.length <= maxLength) return input
  return input.slice(0, maxLength - 3) + '...'
}

/**
 * Build a reasoning receipt from evaluation results.
 *
 * Usage:
 *   const receipt = buildReceipt({
 *     skill_id: 'sage-reason-quick',
 *     input: userInput,
 *     mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
 *     trace: [...],
 *     proximity: 'deliberate',
 *     passions: [...],
 *   })
 */
export function buildReceipt(options: BuildReceiptOptions): ReasoningReceipt {
  const {
    skill_id,
    input,
    mechanisms,
    trace,
    proximity,
    passions = [],
    is_kathekon = null,
    recommended_next = null,
    chain_id = null,
    chain_step = null,
  } = options

  return {
    receipt_id: generateReceiptId(),
    timestamp: new Date().toISOString(),
    skill_id,
    input_summary: truncateInput(input),
    mechanisms_applied: [...mechanisms],
    reasoning_trace: trace,
    proximity,
    passions_detected: passions,
    is_kathekon,
    recommended_next,
    chain_id,
    chain_step,
    disclaimer: EVALUATIVE_DISCLAIMER,
  }
}

// =============================================================================
// RECEIPT PARSING HELPERS (for OpenBrain consumers)
// =============================================================================

/**
 * Extract a flat list of all false judgements from a receipt.
 * Useful for OpenBrain semantic search indexing.
 */
export function extractFalseJudgements(receipt: ReasoningReceipt): string[] {
  return receipt.passions_detected.map(p => p.false_judgement)
}

/**
 * Check whether a receipt indicates the evaluated action needs revision.
 * Returns true if proximity is reflexive or habitual.
 */
export function needsRevision(receipt: ReasoningReceipt): boolean {
  return receipt.proximity === 'reflexive' || receipt.proximity === 'habitual'
}

/**
 * Get the dominant passion from a receipt (most commonly detected root).
 * Returns null if no passions detected.
 */
export function getDominantPassion(
  receipt: ReasoningReceipt
): 'epithumia' | 'hedone' | 'phobos' | 'lupe' | null {
  if (receipt.passions_detected.length === 0) return null

  const counts: Record<string, number> = {}
  for (const p of receipt.passions_detected) {
    counts[p.root_passion] = (counts[p.root_passion] || 0) + 1
  }

  let max = 0
  let dominant: string | null = null
  for (const [passion, count] of Object.entries(counts)) {
    if (count > max) {
      max = count
      dominant = passion
    }
  }

  return dominant as 'epithumia' | 'hedone' | 'phobos' | 'lupe' | null
}

/**
 * Produce a compact receipt summary suitable for OpenBrain table storage.
 * Strips the full reasoning trace and returns only key fields.
 */
export function compactReceipt(receipt: ReasoningReceipt): {
  receipt_id: string
  timestamp: string
  skill_id: string
  proximity: string
  passions: string[]
  is_kathekon: boolean | null
  mechanisms: string[]
  chain_id: string | null
} {
  return {
    receipt_id: receipt.receipt_id,
    timestamp: receipt.timestamp,
    skill_id: receipt.skill_id,
    proximity: receipt.proximity,
    passions: receipt.passions_detected.map(
      p => `${p.root_passion}/${p.sub_species}`
    ),
    is_kathekon: receipt.is_kathekon,
    mechanisms: receipt.mechanisms_applied,
    chain_id: receipt.chain_id,
  }
}

// =============================================================================
// UNIVERSAL RECEIPT EXTRACTOR — builds receipts from common LLM output shapes
// =============================================================================

/**
 * Common LLM output shape used by sage-score, sage-reason, sage-guard,
 * sage-decide, sage-reflect, sage-converse, and context template skills.
 *
 * This type captures the union of fields that any endpoint might return.
 * The extractor pulls whatever is available and builds a receipt.
 */
export type CommonEvalOutput = {
  control_filter?: {
    within_prohairesis?: string[]
    outside_prohairesis?: string[]
  }
  kathekon_assessment?: {
    is_kathekon?: boolean
    quality?: string
    justification?: string
  }
  passion_diagnosis?: {
    passions_detected?: Array<{
      id?: string
      name?: string
      root_passion?: string
      sub_species?: string
      false_judgement?: string
    }>
    false_judgements?: string[]
    causal_stage_affected?: string
  }
  virtue_quality?: {
    katorthoma_proximity?: string
    ruling_faculty_state?: string
    virtue_domains_engaged?: string[]
  }
  // sage-reason returns proximity at top level
  katorthoma_proximity?: string
  // sage-guard returns passions at top level
  passions_detected?: Array<{
    root_passion?: string
    sub_species?: string
    false_judgement?: string
  }>
  is_kathekon?: boolean
  kathekon_quality?: string
  improvement_path?: string
  philosophical_reflection?: string
  oikeiosis?: {
    relevant_circles?: Array<{
      stage?: number
      description?: string
      obligation_met?: boolean | null
      tension?: string | null
    }>
    deliberation_notes?: string
  }
  oikeiosis_context?: string
  // sage-reflect specific
  sage_perspective?: string
  what_you_did_well?: string
}

/**
 * Extract a reasoning receipt from a common LLM evaluation output.
 *
 * This is the universal adapter that allows any endpoint to produce
 * a receipt without duplicating extraction logic. It handles all the
 * variations in LLM output shapes across different endpoints.
 *
 * Usage:
 *   const receipt = extractReceipt({
 *     skillId: 'sage-score',
 *     input: action,
 *     evalData: parsedLlmOutput,
 *     mechanisms: ['control_filter', 'passion_diagnosis', 'kathekon_assessment', 'virtue_quality'],
 *   })
 */
export function extractReceipt(options: {
  skillId: string
  input: string
  evalData: CommonEvalOutput
  mechanisms: MechanismId[]
  chainId?: string | null
  chainStep?: number | null
  recommendedNext?: string | null
}): ReasoningReceipt {
  const { skillId, input, evalData, mechanisms, chainId, chainStep, recommendedNext } = options

  // Extract proximity — different endpoints put it in different places
  const proximity: KatorthomaProximityLevel =
    (evalData.virtue_quality?.katorthoma_proximity as KatorthomaProximityLevel)
    || (evalData.katorthoma_proximity as KatorthomaProximityLevel)
    || 'deliberate'

  // Extract passions — handle both nested and top-level formats
  const rawPassions = evalData.passion_diagnosis?.passions_detected
    || evalData.passions_detected
    || []

  const passions: PassionDetection[] = rawPassions.map(p => ({
    root_passion: (p.root_passion || 'epithumia') as PassionDetection['root_passion'],
    sub_species: p.sub_species || (p as any).name || (p as any).id || 'unspecified',
    false_judgement:
      p.false_judgement
      || evalData.passion_diagnosis?.false_judgements?.[0]
      || 'False judgement not specified',
    detected_at_stage: 3,
  }))

  // Extract kathekon
  const isKathekon = evalData.kathekon_assessment?.is_kathekon
    ?? evalData.is_kathekon
    ?? null

  // Build reasoning trace from available stages
  const trace: ReasoningStep[] = []

  if (evalData.control_filter) {
    const within = evalData.control_filter.within_prohairesis?.join(', ') || 'not specified'
    const outside = evalData.control_filter.outside_prohairesis?.join(', ') || 'not specified'
    trace.push({
      stage: 1,
      stage_name: 'prohairesis_filter',
      determination: `Within control: ${within}. Outside control: ${outside}.`,
      source_files: STAGE_SOURCE_FILES[1],
    })
  }

  if (evalData.kathekon_assessment || evalData.is_kathekon !== undefined) {
    const quality = evalData.kathekon_assessment?.quality || evalData.kathekon_quality || 'not assessed'
    const justification = evalData.kathekon_assessment?.justification || ''
    trace.push({
      stage: 2,
      stage_name: 'kathekon_assessment',
      determination: `Kathekon: ${isKathekon}, quality: ${quality}. ${justification}`.trim(),
      source_files: STAGE_SOURCE_FILES[2],
    })
  }

  if (passions.length > 0 || evalData.passion_diagnosis) {
    trace.push({
      stage: 3,
      stage_name: 'passion_diagnosis',
      determination: passions.length > 0
        ? `Detected ${passions.length} passion(s): ${passions.map(p => p.sub_species).join(', ')}.`
        : 'No passions detected.',
      source_files: STAGE_SOURCE_FILES[3],
    })
  }

  if (evalData.virtue_quality || evalData.katorthoma_proximity) {
    const reflection = evalData.philosophical_reflection || evalData.sage_perspective || ''
    trace.push({
      stage: 4,
      stage_name: 'virtue_assessment',
      determination: `Proximity: ${proximity}. ${reflection}`.trim(),
      source_files: STAGE_SOURCE_FILES[4],
    })
  }

  // Determine recommended next
  const next = recommendedNext
    || evalData.improvement_path
    || (needsRevision({ proximity } as ReasoningReceipt)
      ? 'Consider iterative refinement with sage-iterate.'
      : null)

  return buildReceipt({
    skill_id: skillId,
    input,
    mechanisms,
    trace,
    proximity,
    passions,
    is_kathekon: isKathekon,
    recommended_next: next,
    chain_id: chainId || null,
    chain_step: chainStep || null,
  })
}
