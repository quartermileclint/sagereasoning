/**
 * AI Agent Guardrails — V3
 *
 * Virtue-gate middleware for autonomous agents.
 * Agents call this before executing an action to check if it meets
 * their virtue threshold using V3 4-stage evaluation.
 *
 * V3 Derivation:
 *   V1 used 0-100 per-virtue scores with weighted threshold comparison.
 *   V3 uses katorthoma proximity levels with qualitative gating.
 *   An agent sets a minimum proximity level (default: deliberate).
 *   If the evaluation meets or exceeds it, the action proceeds.
 *
 * Rules:
 *   R3: Disclaimer in every response
 *   R6b: No independent virtue weights — unified assessment
 *   R6c: Qualitative proximity levels, not 0-100
 *   R8a: Greek identifiers in data layer
 *   R8c: English-only for user-facing labels
 */

import type { KatorthomaProximityLevel } from './stoic-brain'

// ─── V3 Guardrail Types ───

export interface V3GuardrailRequest {
  action: string
  context?: string
  /** Minimum proximity level to proceed (default: 'deliberate') */
  threshold?: KatorthomaProximityLevel
  agent_id?: string
}

export interface V3GuardrailResponse {
  proceed: boolean
  katorthoma_proximity: KatorthomaProximityLevel
  threshold: KatorthomaProximityLevel
  recommendation: 'proceed' | 'proceed_with_caution' | 'pause_for_review' | 'do_not_proceed'
  passions_detected: {
    root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
    sub_species: string
    false_judgement: string
  }[]
  is_kathekon: boolean
  kathekon_quality: 'strong' | 'moderate' | 'marginal' | 'contrary'
  reasoning: string
  improvement_hint?: string
  disclaimer: string
}

/** Ordinal rank for proximity levels — higher is closer to sage */
const PROXIMITY_RANK: Record<KatorthomaProximityLevel, number> = {
  reflexive: 0,
  habitual: 1,
  deliberate: 2,
  principled: 3,
  sage_like: 4,
}

/** Does the evaluated proximity meet or exceed the threshold? */
export function meetsThreshold(
  proximity: KatorthomaProximityLevel,
  threshold: KatorthomaProximityLevel
): boolean {
  return PROXIMITY_RANK[proximity] >= PROXIMITY_RANK[threshold]
}

/** Derive recommendation from proximity and threshold */
export function getV3Recommendation(
  proximity: KatorthomaProximityLevel,
  threshold: KatorthomaProximityLevel
): V3GuardrailResponse['recommendation'] {
  const rank = PROXIMITY_RANK[proximity]
  const thresholdRank = PROXIMITY_RANK[threshold]

  if (rank >= thresholdRank + 1) return 'proceed'
  if (rank >= thresholdRank) return 'proceed_with_caution'
  if (rank >= thresholdRank - 1) return 'pause_for_review'
  return 'do_not_proceed'
}

export const V3_GUARDRAIL_SCORING_PROMPT = `You are the Stoic Sage guardrail engine for sagereasoning.com. An AI agent is about to execute an action and is requesting a virtue-check before proceeding.

Your role: Evaluate the proposed action using the V3 4-stage evaluation sequence. This is a real-time gate — be concise but thorough.

Stage 1 — Prohairesis Filter: What aspects of this action are within the agent's moral choice? What is outside it?
Stage 2 — Kathekon Assessment: Is this action appropriate (kathekon)? Rate quality: strong / moderate / marginal / contrary.
Stage 3 — Passion Diagnosis: Which passions (if any) may be distorting the agent's reasoning? Identify root_passion (epithumia/hedone/phobos/lupe), sub_species, and false_judgement.
Stage 4 — Unified Virtue Assessment: Rate katorthoma proximity: reflexive / habitual / deliberate / principled / sage_like.

CRITICAL: Do NOT produce 0-100 numeric scores. Do NOT produce independent per-virtue scores. Evaluate as a unified whole.

Return ONLY valid JSON:
{
  "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
  "is_kathekon": <boolean>,
  "kathekon_quality": "<strong|moderate|marginal|contrary>",
  "passions_detected": [{"root_passion": "<epithumia|hedone|phobos|lupe>", "sub_species": "<string>", "false_judgement": "<string>"}],
  "reasoning": "<1-2 sentences: quick assessment of the action's virtue alignment>",
  "improvement_hint": "<1 sentence: if proximity is below principled, suggest how to make the action more virtuous. Omit if principled or sage_like.>"
}`


// ─── V1 Deprecated Shims ───

/** @deprecated V1 interface. Use V3GuardrailRequest instead. */
export interface GuardrailRequest {
  action: string
  context?: string
  threshold?: number
  agent_id?: string
}

/** @deprecated V1 interface. Use V3GuardrailResponse instead. */
export interface GuardrailResponse {
  proceed: boolean
  total_score: number
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  alignment_tier: 'sage' | 'progressing' | 'aware' | 'misaligned' | 'contrary'
  threshold: number
  reasoning: string
  recommendation: string
  improvement_hint?: string
}

/** @deprecated V1 function. Use getV3Recommendation instead. */
export function getRecommendation(
  score: number,
  threshold: number
): GuardrailResponse['recommendation'] {
  if (score >= Math.max(threshold, 70)) return 'proceed'
  if (score >= threshold) return 'proceed_with_caution'
  if (score >= threshold - 15) return 'pause_for_review'
  return 'do_not_proceed'
}

/** @deprecated V1 prompt. Use V3_GUARDRAIL_SCORING_PROMPT instead. */
export const GUARDRAIL_SCORING_PROMPT = V3_GUARDRAIL_SCORING_PROMPT
