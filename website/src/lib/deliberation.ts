// Deliberation Chain — Iterative action scoring for AI agents
// Agents score an action, receive feedback, revise, and re-score in a tracked chain

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

export interface ChainSummary {
  chain_id: string
  status: string
  original_action: string
  initial_score: number
  current_score: number
  best_score: number
  total_iterations: number
  score_trajectory: number[]  // total_score at each step
  net_improvement: number
  sage_growth_action: string | null
  created_at: string
  updated_at: string
  // Condensed view: first and last steps with virtue breakdowns
  first_step: StepSummary
  latest_step: StepSummary
}

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

// The iteration-aware system prompt adds deliberation context
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
- Wisdom (Phronesis) — weight 30%: Sound judgement, knowledge of what is truly good/bad/indifferent, deliberate reasoning before acting.
- Justice (Dikaiosyne) — weight 25%: Fairness, honesty, proper treatment of others, serving the common good.
- Courage (Andreia) — weight 25%: Acting rightly despite fear, difficulty, or social pressure; endurance; not shrinking from what is right.
- Temperance (Sophrosyne) — weight 20%: Self-control, moderation, ordering desires by reason not impulse, consistency.

Scoring scale (0–100 per virtue):
- 90–100: Near-perfect expression of this virtue
- 70–89: Strong, consistent expression
- 40–69: Partial expression — some virtue present, some conflict
- 15–39: Mostly driven by impulse, passion or external concern over virtue
- 0–14: Acting contrary to this virtue

Alignment tiers (based on weighted total):
- sage (95–100): Perfect alignment
- progressing (70–94): Consistently virtuous with minor gaps
- aware (40–69): Some virtue, some conflict
- misaligned (15–39): Actions driven more by impulse than reason
- contrary (0–14): Acting against virtue

You must return ONLY valid JSON — no markdown, no explanation outside the JSON. Use this exact structure:
{
  "wisdom_score": <0-100 integer>,
  "justice_score": <0-100 integer>,
  "courage_score": <0-100 integer>,
  "temperance_score": <0-100 integer>,
  "total_score": <weighted total, 0-100 integer>,
  "sage_alignment": "<sage|progressing|aware|misaligned|contrary>",
  "reasoning": "<2-3 sentences: assess the revised action. Note what improved from the previous iteration, what still needs work, and whether the revision genuinely addresses the sage's feedback>",
  "improvement_path": "<1-2 sentences: concrete stoic guidance for the next iteration if the agent wishes to continue deliberating>",
  "strength": "<single virtue name e.g. Wisdom>",
  "growth_area": "<single virtue name e.g. Temperance>",
  "growth_action": "<1-3 sentences: a further refined sage suggestion that accounts for what the agent has shown it can and cannot change about the situation>",
  "growth_action_projected_score": <integer 0-100>,
  "deliberation_note": "<1 sentence: acknowledge the agent's deliberation effort — e.g. 'This revision shows genuine engagement with the sage's counsel on justice' or 'The revision addresses courage but introduced a temperance concern'>"
}`
}

// Warning message issued every 5th iteration
export function getIterationWarning(iterationCount: number): string | null {
  if (iterationCount > 0 && iterationCount % 5 === 0) {
    return `Deliberation advisory (iteration ${iterationCount}): The Stoics valued decisive action alongside careful reflection. Epictetus taught that endless deliberation can itself become a failure of courage. Consider whether your current action is "good enough" to proceed — the sage acts when reason has done its work, not when perfection is achieved. You may continue iterating, but reflect on whether further revision serves virtue or feeds hesitation.`
  }
  return null
}

// Validate required fields in iteration request
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
