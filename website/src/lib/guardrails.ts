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

Return ONLY valid JSON:
{
  "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
  "is_kathekon": <boolean>,
  "kathekon_quality": "<strong|moderate|marginal|contrary>",
  "passions_detected": [{"root_passion": "<epithumia|hedone|phobos|lupe>", "sub_species": "<string>", "false_judgement": "<string>"}],
  "reasoning": "<1-2 sentences: quick assessment of the action's virtue alignment>",
  "improvement_hint": "<1 sentence: if proximity is below principled, suggest how to make the action more virtuous. Omit if principled or sage_like.>"
}`


// ─── R20a: Vulnerable User Detection & Redirection ───

export interface DistressDetectionResult {
  distress_detected: boolean
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  indicators_found: string[]
  redirect_message: string | null
}

/**
 * Language patterns that may indicate acute psychological distress.
 * These are checked before any evaluation is processed.
 *
 * Rule R20a: "Implement language pattern detection in all human-facing tools
 * for indicators of acute psychological distress. Build a redirection protocol
 * to appropriate professional support resources."
 *
 * This is pattern-matching, not diagnosis. When detected, the system pauses
 * evaluation and offers professional support resources.
 */
const DISTRESS_PATTERNS: { pattern: RegExp; indicator: string; severity: 'mild' | 'moderate' | 'acute' }[] = [
  // Acute — immediate crisis indicators
  { pattern: /\b(want(ing)?\s+to\s+(die|end\s+(it|my\s+life)|kill\s+my\s*self)|suicid(e|al)|take\s+my\s+(own\s+)?life)\b/i, indicator: 'suicidal ideation', severity: 'acute' },
  { pattern: /\b(self[- ]?harm(ing)?|cut(ting)?\s+(my\s*self|my\s+(arms?|wrists?|legs?))|hurt(ing)?\s+my\s*self)\b/i, indicator: 'self-harm', severity: 'acute' },
  { pattern: /\b(no\s+(reason|point)\s+(to|in)\s+(live|living|go(ing)?\s+on)|can'?t\s+go\s+on|nothing\s+matters?\s+any\s*more)\b/i, indicator: 'hopelessness', severity: 'acute' },
  { pattern: /\b(plan(ning)?\s+to\s+(end|kill)|method\s+to\s+(die|end)|saying\s+goodbye)\b/i, indicator: 'crisis planning', severity: 'acute' },

  // Moderate — significant distress
  { pattern: /\b(everyone\s+would\s+be\s+better\s+off\s+without\s+me|i\s+am\s+a\s+burden|nobody\s+(cares?|would\s+miss\s+me))\b/i, indicator: 'perceived burdensomeness', severity: 'moderate' },
  { pattern: /\b(completely\s+alone|total(ly)?\s+(hopeless|worthless|empty)|can'?t\s+(take|bear|stand)\s+(it|this)\s+(any\s*more|any\s*longer))\b/i, indicator: 'extreme isolation or despair', severity: 'moderate' },
  { pattern: /\b(haven'?t\s+(eaten|slept)\s+in\s+(days|a\s+week)|not\s+(eating|sleeping)\s+at\s+all)\b/i, indicator: 'basic needs neglect', severity: 'moderate' },

  // Mild — emotional distress that warrants gentle acknowledgement
  { pattern: /\b(feel(ing)?\s+(so\s+)?(broken|shattered|destroyed|crushed)|life\s+is\s+(meaningless|pointless))\b/i, indicator: 'severe emotional distress', severity: 'mild' },
]

const CRISIS_RESOURCES = {
  primary: 'If you are in crisis or need immediate support:',
  resources: [
    { name: 'Lifeline (AU)', contact: '13 11 14', available: '24/7' },
    { name: 'Beyond Blue (AU)', contact: '1300 22 4636', available: '24/7' },
    { name: 'National Suicide Prevention Lifeline (US)', contact: '988', available: '24/7' },
    { name: 'Crisis Text Line (US/UK/CA)', contact: 'Text HOME to 741741', available: '24/7' },
    { name: 'Samaritans (UK)', contact: '116 123', available: '24/7' },
  ],
  closing: 'SageReasoning is a philosophical reasoning tool, not a mental health service. A trained professional can provide the support you deserve.',
}

/**
 * Scans input text for indicators of psychological distress.
 * Should be called before any evaluation is processed on human-facing tools.
 */
export function detectDistress(text: string): DistressDetectionResult {
  const indicators: { indicator: string; severity: 'mild' | 'moderate' | 'acute' }[] = []

  for (const { pattern, indicator, severity } of DISTRESS_PATTERNS) {
    if (pattern.test(text)) {
      indicators.push({ indicator, severity })
    }
  }

  if (indicators.length === 0) {
    return { distress_detected: false, severity: 'none', indicators_found: [], redirect_message: null }
  }

  // Use the highest severity found
  const severityRank = { mild: 1, moderate: 2, acute: 3 }
  const maxSeverity = indicators.reduce((max, i) =>
    severityRank[i.severity] > severityRank[max.severity] ? i : max
  ).severity

  const resourceList = CRISIS_RESOURCES.resources
    .map(r => `${r.name}: ${r.contact} (${r.available})`)
    .join('\n')

  const redirectMessage = maxSeverity === 'acute'
    ? `We've paused this evaluation because your words suggest you may be going through something very difficult right now.\n\n${CRISIS_RESOURCES.primary}\n${resourceList}\n\n${CRISIS_RESOURCES.closing}`
    : maxSeverity === 'moderate'
    ? `Before we continue, we want to make sure you're okay. Some of what you've described sounds like it might be weighing heavily on you.\n\n${CRISIS_RESOURCES.primary}\n${resourceList}\n\n${CRISIS_RESOURCES.closing}`
    : null // mild: include resources in response but don't block evaluation

  return {
    distress_detected: true,
    severity: maxSeverity,
    indicators_found: indicators.map(i => i.indicator),
    redirect_message: redirectMessage,
  }
}

/** Get crisis resources for inclusion in any response */
export function getCrisisResources() {
  return CRISIS_RESOURCES
}


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
