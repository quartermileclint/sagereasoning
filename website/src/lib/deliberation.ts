/**
 * deliberation.ts — V3 Deliberation Chain Library
 *
 * Derived from:
 *   action.json   — Cicero's 5-question deliberation framework, kathekon/katorthoma distinction
 *   scoring.json  — 4-stage evaluation sequence, katorthoma proximity scale
 *   passions.json — passion taxonomy for tracking across iterations
 *   progress.json — Senecan grades, progress dimensions (direction of travel)
 *   psychology.json — causal sequence for iteration prompts
 *
 * V3 Derivation Notes (R6a):
 *   V1 tracked: 4 numeric virtue scores + weighted total + score_delta per step.
 *   V3 tracks: passions detected, false judgements, katorthoma proximity, kathekon quality,
 *   and direction of travel across Cicero's 5-question framework.
 *   No numeric scores (R6c). No independent virtue weights (R6b).
 *
 * R4: Iteration prompt text is server-side only — never exposed in API responses.
 * R3: Disclaimer included in all evaluation outputs.
 */

import type {
  KatorthomaProximityLevel,
  KathekonQuality,
  CausalStageId,
} from './stoic-brain'

// ============================================================================
// V3 TYPES — Deliberation Chain
// ============================================================================

/** A detected passion within a deliberation step. */
export type DetectedPassion = {
  id: string
  name: string
  root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'
}

/** A single step in a V3 deliberation chain. */
export interface V3DeliberationStep {
  id: string
  chain_id: string
  step_number: number
  action_description: string
  revision_rationale?: string

  // V3 evaluation outputs (4-stage sequence)
  katorthoma_proximity: KatorthomaProximityLevel
  kathekon_quality: KathekonQuality
  is_kathekon: boolean
  passions_detected: DetectedPassion[]
  false_judgements: string[]
  causal_stage_affected: CausalStageId | null
  virtue_domains_engaged: string[]
  ruling_faculty_state: string

  // Deliberation-specific outputs
  philosophical_reflection: string
  improvement_path: string
  oikeiosis_context: string

  // Direction of travel (compared to previous step)
  proximity_direction: 'improving' | 'stable' | 'regressing' | null
  passions_direction: 'fewer' | 'same' | 'more' | null

  // Cicero's deliberation framework (action.json)
  cicero_assessment?: {
    Q1_is_honourable: boolean
    Q2_comparative_honour?: string
    Q3_is_advantageous: boolean
    Q4_comparative_advantage?: string
    Q5_conflict_resolution?: string
  }

  iteration_warning_issued: boolean
  created_at: string
}

/** A V3 deliberation chain — iterative evaluation tracking. */
export interface V3DeliberationChain {
  id: string
  agent_id?: string
  user_id?: string
  original_action: string
  context?: string
  relationships?: string
  emotional_state?: string

  // V3 proximity tracking (replaces V1 numeric scores)
  initial_proximity: KatorthomaProximityLevel
  current_proximity: KatorthomaProximityLevel
  best_proximity: KatorthomaProximityLevel

  iteration_count: number
  status: 'active' | 'concluded' | 'abandoned'

  // Sage reflection on the chain's overall arc
  sage_reflection?: string

  created_at: string
  updated_at: string
}

/** Summary of a V3 deliberation chain (for GET endpoint). */
export interface V3ChainSummary {
  chain_id: string
  status: string
  original_action: string
  initial_proximity: KatorthomaProximityLevel
  current_proximity: KatorthomaProximityLevel
  best_proximity: KatorthomaProximityLevel
  total_iterations: number
  proximity_trajectory: KatorthomaProximityLevel[]
  direction_of_travel: 'improving' | 'stable' | 'regressing'
  passions_arc: {
    initial_count: number
    current_count: number
    passions_overcome: string[]
    passions_persisting: string[]
  }
  created_at: string
  updated_at: string
  first_step: V3StepSummary
  latest_step: V3StepSummary
}

/** Condensed view of a V3 deliberation step. */
export interface V3StepSummary {
  step_number: number
  action_description: string
  katorthoma_proximity: KatorthomaProximityLevel
  kathekon_quality: KathekonQuality
  passions_detected: DetectedPassion[]
  false_judgements: string[]
  philosophical_reflection: string
  improvement_path: string
}

// ============================================================================
// PROXIMITY ORDERING — for direction-of-travel calculations
// ============================================================================

const PROXIMITY_ORDER: Record<KatorthomaProximityLevel, number> = {
  reflexive: 0,
  habitual: 1,
  deliberate: 2,
  principled: 3,
  sage_like: 4,
}

/** Compare two proximity levels. Returns 'improving', 'stable', or 'regressing'. */
export function compareProximity(
  previous: KatorthomaProximityLevel,
  current: KatorthomaProximityLevel
): 'improving' | 'stable' | 'regressing' {
  const diff = PROXIMITY_ORDER[current] - PROXIMITY_ORDER[previous]
  if (diff > 0) return 'improving'
  if (diff < 0) return 'regressing'
  return 'stable'
}

/** Return whichever proximity level is higher (closer to sage). */
export function higherProximity(
  a: KatorthomaProximityLevel,
  b: KatorthomaProximityLevel
): KatorthomaProximityLevel {
  return PROXIMITY_ORDER[a] >= PROXIMITY_ORDER[b] ? a : b
}

// ============================================================================
// V3 ITERATION PROMPT — Derived from scoring.json + action.json + passions.json
// ============================================================================

/**
 * Build the V3 iteration-aware system prompt for deliberation steps 2+.
 *
 * R4: This prompt is server-side only.
 * R6b: No independent virtue weights.
 * R6c: Qualitative proximity, not numeric scores.
 * R6d: Passions are diagnostic, not punitive.
 */
export function buildV3IterationPrompt(
  previousStep: {
    action: string
    katorthoma_proximity: KatorthomaProximityLevel
    passions_detected: DetectedPassion[]
    false_judgements: string[]
    philosophical_reflection: string
    improvement_path: string
  },
  stepNumber: number
): string {
  const passionsList = previousStep.passions_detected.length > 0
    ? previousStep.passions_detected.map(p => `${p.name} (${p.root_passion})`).join(', ')
    : 'none detected'

  const judgementsList = previousStep.false_judgements.length > 0
    ? previousStep.false_judgements.join('; ')
    : 'none identified'

  return `You are the Stoic evaluation engine for sagereasoning.com, evaluating iteration ${stepNumber} of an agent's deliberation chain.

DELIBERATION CONTEXT:
The agent previously proposed an action evaluated at the "${previousStep.katorthoma_proximity}" proximity level.

Passions diagnosed: ${passionsList}
False judgements identified: ${judgementsList}
Sage reflection: "${previousStep.philosophical_reflection}"
Improvement path given: "${previousStep.improvement_path}"

The agent has now revised their action based on this feedback and their own real-world constraints. Evaluate the REVISED action through the full 4-stage evaluation sequence on its own merits, but acknowledge the deliberation — if the revision genuinely addresses the previously identified passions and false judgements, reflect that in the proximity assessment. If the revision misunderstands or ignores the feedback, note that too.

IMPORTANT: Evaluate honestly. Do not inflate proximity merely because the agent iterated. A revision that introduces new passions or false judgements should be assessed at the appropriate level, even if the agent claims it addresses feedback.

EVALUATION SEQUENCE (apply all 4 stages in order):

STAGE 1 — PROHAIRESIS FILTER (Control Filter)
Separate what was within the agent's moral choice (prohairesis) from what was not. Only evaluate what is eph' hemin.
Output: within_prohairesis (array), outside_prohairesis (array)

STAGE 2 — KATHEKON ASSESSMENT (Appropriate Action)
Is this action a kathekon? Consider natural relationships (oikeiosis), reasonable justification, and role obligations.
Output: is_kathekon (boolean), quality ("strong" | "moderate" | "marginal" | "contrary")

STAGE 3 — PASSION DIAGNOSIS
Which passions distorted impression, assent, or impulse? Use the 5-step diagnostic. Reference the 4 root passions: epithumia (craving), hedone (irrational pleasure), phobos (fear), lupe (distress) and their sub-species.
Output: passions_detected (array of {id, name, root_passion}), false_judgements (array), causal_stage_affected (phantasia|synkatathesis|horme|praxis)

STAGE 4 — UNIFIED VIRTUE ASSESSMENT
How close is the ruling faculty to the sage ideal? The four virtue expressions are inseparable.
Katorthoma proximity: "reflexive" | "habitual" | "deliberate" | "principled" | "sage_like"
Output: katorthoma_proximity, ruling_faculty_state, virtue_domains_engaged (array)

CICERO'S DELIBERATION FRAMEWORK (apply to the revision):
Q1: Is the revised action honourable (to kalon)?
Q2: If comparing honourable options, which is more honourable?
Q3: Is it advantageous (utile)?
Q4: If comparing advantageous options, which is more advantageous?
Q5: If honourable conflicts with advantageous, the honourable always prevails.

Return ONLY valid JSON:
{
  "control_filter": {
    "within_prohairesis": ["<string>", ...],
    "outside_prohairesis": ["<string>", ...]
  },
  "kathekon_assessment": {
    "is_kathekon": <boolean>,
    "quality": "<strong|moderate|marginal|contrary>"
  },
  "passion_diagnosis": {
    "passions_detected": [{"id": "<sub-species id>", "name": "<display name>", "root_passion": "<epithumia|hedone|phobos|lupe>"}],
    "false_judgements": ["<string>", ...],
    "causal_stage_affected": "<phantasia|synkatathesis|horme|praxis>"
  },
  "virtue_quality": {
    "katorthoma_proximity": "<reflexive|habitual|deliberate|principled|sage_like>",
    "ruling_faculty_state": "<string>",
    "virtue_domains_engaged": ["<phronesis|dikaiosyne|andreia|sophrosyne>", ...]
  },
  "cicero_assessment": {
    "Q1_is_honourable": <boolean>,
    "Q2_comparative_honour": "<string or null>",
    "Q3_is_advantageous": <boolean>,
    "Q4_comparative_advantage": "<string or null>",
    "Q5_conflict_resolution": "<string or null>"
  },
  "improvement_path": "<which false judgement to correct and which passion to address>",
  "oikeiosis_context": "<which social obligations were relevant and whether met>",
  "philosophical_reflection": "<2-3 sentences of Stoic reasoning about this revision>",
  "deliberation_note": "<1 sentence acknowledging the agent's deliberation effort>",
  "disclaimer": "This is a philosophical framework and does not consider legal, medical, financial, or personal obligations."
}`
}

// ============================================================================
// ITERATION WARNING — Stoic advisory on excessive deliberation
// ============================================================================

/**
 * Warning message issued every 5th iteration.
 * Grounded in Epictetus Discourses 1.4 on decisive action.
 */
export function getV3IterationWarning(iterationCount: number): string | null {
  if (iterationCount > 0 && iterationCount % 5 === 0) {
    return `Deliberation advisory (iteration ${iterationCount}): The Stoics valued decisive action alongside careful reflection. Epictetus taught that endless deliberation can itself become a failure of andreia / courage — specifically oknos / timidity (phobos sub-species). Consider whether your current action is an adequate kathekon to proceed with. The sage acts when reason has done its work, not when perfection is achieved. You may continue iterating, but reflect on whether further revision serves virtue or feeds hesitation.`
  }
  return null
}

// ============================================================================
// VALIDATION — V3 iteration request validation
// ============================================================================

/** Validate required fields in a V3 iteration request. */
export function validateV3IterateRequest(body: Record<string, unknown>): string | null {
  if (!body.chain_id && !body.action) {
    return 'Either chain_id (to continue an existing chain) or action (to start a new chain) is required'
  }
  if (body.chain_id && !body.revised_action) {
    return 'revised_action is required when continuing a deliberation chain'
  }
  if (!body.chain_id && !body.action) {
    return 'action is required to start a new deliberation chain'
  }
  return null
}

// ============================================================================
// PROGRESS TRACKING — direction of travel across iterations
// ============================================================================

/** Calculate direction-of-travel summary from a chain's step trajectory. */
export function calculateDirectionOfTravel(
  proximityTrajectory: KatorthomaProximityLevel[]
): 'improving' | 'stable' | 'regressing' {
  if (proximityTrajectory.length < 2) return 'stable'

  let upward = 0
  let downward = 0
  for (let i = 1; i < proximityTrajectory.length; i++) {
    const dir = compareProximity(proximityTrajectory[i - 1], proximityTrajectory[i])
    if (dir === 'improving') upward++
    if (dir === 'regressing') downward++
  }

  if (upward > downward) return 'improving'
  if (downward > upward) return 'regressing'
  return 'stable'
}

/** Calculate passions arc — which passions were overcome vs. persisting across steps. */
export function calculatePassionsArc(
  steps: Array<{ passions_detected: DetectedPassion[] }>
): {
  initial_count: number
  current_count: number
  passions_overcome: string[]
  passions_persisting: string[]
} {
  if (steps.length === 0) {
    return { initial_count: 0, current_count: 0, passions_overcome: [], passions_persisting: [] }
  }

  const initialPassionIds = new Set(steps[0].passions_detected.map(p => p.id))
  const currentPassionIds = new Set(steps[steps.length - 1].passions_detected.map(p => p.id))

  const overcome = [...initialPassionIds].filter(id => !currentPassionIds.has(id))
  const persisting = [...initialPassionIds].filter(id => currentPassionIds.has(id))

  return {
    initial_count: initialPassionIds.size,
    current_count: currentPassionIds.size,
    passions_overcome: overcome,
    passions_persisting: persisting,
  }
}


// ============================================================================
// V1 COMPATIBILITY SHIMS — @deprecated
// Keep V1 API routes compiling until Phase 6+ rewrites score-iterate and
// deliberation-chain routes.
// ============================================================================

/** @deprecated V1 type — use V3DeliberationChain instead */
export interface DeliberationChain {
  id: string
  agent_id?: string
  user_id?: string
  original_action: string
  context?: string
  intended_outcome?: string
  initial_score: number
  current_score: number
  best_score: number
  iteration_count: number
  status: 'active' | 'concluded' | 'abandoned'
  sage_growth_action?: string
  sage_projected_score?: number
  created_at: string
  updated_at: string
}

/** @deprecated V1 type — use V3DeliberationStep instead */
export interface DeliberationStep {
  id: string
  chain_id: string
  step_number: number
  action_description: string
  revision_rationale?: string
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  sage_alignment: string
  reasoning: string
  improvement_path: string
  strength: string
  growth_area: string
  growth_action: string
  growth_action_projected_score: number
  score_delta: number | null
  iteration_warning_issued: boolean
  created_at: string
}

/** @deprecated V1 type — use V3ChainSummary instead */
export interface ChainSummary {
  chain_id: string
  status: string
  original_action: string
  initial_score: number
  current_score: number
  best_score: number
  total_iterations: number
  score_trajectory: number[]
  net_improvement: number
  sage_growth_action: string | null
  created_at: string
  updated_at: string
  first_step: StepSummary
  latest_step: StepSummary
}

/** @deprecated V1 type — use V3StepSummary instead */
export interface StepSummary {
  step_number: number
  action_description: string
  wisdom_score: number
  justice_score: number
  courage_score: number
  temperance_score: number
  total_score: number
  sage_alignment: string
  reasoning: string
  growth_action: string
}

/**
 * @deprecated V1 iteration prompt — use buildV3IterationPrompt instead.
 * Kept so score-iterate/route.ts compiles until Phase 6+ rewrite.
 */
export function buildIterationPrompt(
  previousStep: {
    action: string
    total_score: number
    reasoning: string
    growth_action: string
    growth_action_projected_score: number
    wisdom_score: number
    justice_score: number
    courage_score: number
    temperance_score: number
  },
  stepNumber: number
): string {
  return `You are the Stoic Sage scoring engine for sagereasoning.com, evaluating iteration ${stepNumber} of an agent's deliberation chain.

DELIBERATION CONTEXT:
The agent previously proposed an action that scored ${previousStep.total_score}/100 (Wisdom: ${previousStep.wisdom_score}, Justice: ${previousStep.justice_score}, Courage: ${previousStep.courage_score}, Temperance: ${previousStep.temperance_score}).

Previous reasoning: "${previousStep.reasoning}"

The sage suggested: "${previousStep.growth_action}" (projected score: ${previousStep.growth_action_projected_score})

The agent has now revised their action based on this feedback and their own real-world constraints. Score the REVISED action on its own merits, but acknowledge the deliberation — if the revision genuinely addresses the sage's feedback, reflect that in the score. If the revision misunderstands or ignores the feedback, note that too.

IMPORTANT: Score the revised action honestly. Do not inflate scores merely because the agent iterated. A revision that drifts from virtue should score lower, even if the agent claims it addresses feedback.

The four virtues and their weights:
- Wisdom (Phronesis) — weight 30%
- Justice (Dikaiosyne) — weight 25%
- Courage (Andreia) — weight 25%
- Temperance (Sophrosyne) — weight 20%

Scoring scale (0–100 per virtue):
- 90–100: Near-perfect expression of this virtue
- 70–89: Strong, consistent expression
- 40–69: Partial expression — some virtue present, some conflict
- 15–39: Mostly driven by impulse, passion or external concern over virtue
- 0–14: Acting contrary to this virtue

You must return ONLY valid JSON:
{
  "wisdom_score": <0-100 integer>,
  "justice_score": <0-100 integer>,
  "courage_score": <0-100 integer>,
  "temperance_score": <0-100 integer>,
  "total_score": <weighted total, 0-100 integer>,
  "sage_alignment": "<sage|progressing|aware|misaligned|contrary>",
  "reasoning": "<2-3 sentences>",
  "improvement_path": "<1-2 sentences>",
  "strength": "<single virtue name>",
  "growth_area": "<single virtue name>",
  "growth_action": "<1-3 sentences>",
  "growth_action_projected_score": <integer 0-100>,
  "deliberation_note": "<1 sentence>"
}`
}

/**
 * @deprecated V1 iteration warning — use getV3IterationWarning instead.
 * Kept so score-iterate/route.ts compiles until Phase 6+ rewrite.
 */
export function getIterationWarning(iterationCount: number): string | null {
  if (iterationCount > 0 && iterationCount % 5 === 0) {
    return `Deliberation advisory (iteration ${iterationCount}): The Stoics valued decisive action alongside careful reflection. Epictetus taught that endless deliberation can itself become a failure of courage. Consider whether your current action is "good enough" to proceed — the sage acts when reason has done its work, not when perfection is achieved. You may continue iterating, but reflect on whether further revision serves virtue or feeds hesitation.`
  }
  return null
}

/**
 * @deprecated V1 validation — use validateV3IterateRequest instead.
 * Kept so score-iterate/route.ts compiles until Phase 6+ rewrite.
 */
export function validateIterateRequest(body: Record<string, unknown>): string | null {
  if (!body.chain_id && !body.action) {
    return 'Either chain_id (to continue an existing chain) or action (to start a new chain) is required'
  }
  if (body.chain_id && !body.revised_action) {
    return 'revised_action is required when continuing a deliberation chain'
  }
  if (!body.chain_id && !body.action) {
    return 'action is required to start a new deliberation chain'
  }
  return null
}
