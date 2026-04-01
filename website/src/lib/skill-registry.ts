/**
 * skill-registry.ts — Centralised skill catalogue for agent discovery.
 *
 * Every skill follows the Outcome / Cost + Speed / Chains To contract.
 * Skills are registered with the sage- prefix per naming convention.
 *
 * Task 2.9: sage- prefix naming.
 * Tasks 2.7/2.8: GET /skills and GET /skills/{id} data source.
 *
 * This file is the single source of truth for all skill metadata.
 * The /api/skills and /api/skills/{id} endpoints serve this data.
 * The /api/execute endpoint routes to implementations using skill IDs from here.
 */

export type SkillTier = 'tier1_infrastructure' | 'tier2_evaluation' | 'tier3_wrapper'

export type SkillContract = {
  /** Unique identifier with sage- prefix */
  id: string
  /** Human-readable name */
  name: string
  /** Which product tier this skill belongs to */
  tier: SkillTier
  /** What this skill produces — the value proposition */
  outcome: string
  /** Estimated cost and speed */
  cost_speed: string
  /** Which skills this chains to */
  chains_to: string[]
  /** API endpoint path */
  endpoint: string
  /** HTTP method */
  method: 'POST' | 'GET'
  /** Whether authentication is required */
  auth_required: boolean
  /** Which Stoic mechanisms this skill uses */
  mechanisms: string[]
  /** Number of mechanisms used */
  mechanism_count: number
  /** Depth parameter if applicable */
  depth?: string
  /** Example input for agent integration */
  example_input: Record<string, unknown>
  /** Example output structure (abbreviated) */
  example_output: Record<string, unknown>
  /** Brief description for catalogue listing */
  description: string
}

/**
 * The complete skill registry.
 * Order: Tier 1 (sage-reason) → Tier 2 (evaluation skills) → Tier 3 (wrappers, future)
 */
export const SKILL_REGISTRY: SkillContract[] = [
  // =========================================================================
  // TIER 1: sage-reason (Universal Reasoning Layer)
  // =========================================================================
  {
    id: 'sage-reason-quick',
    name: 'sage-reason (quick)',
    tier: 'tier1_infrastructure',
    outcome: 'Core triad check — control filter + passion diagnosis + oikeiosis mapping against any input.',
    cost_speed: '~$0.025, ~2s',
    chains_to: ['sage-reason-standard', 'sage-score', 'sage-guard'],
    endpoint: '/api/reason',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
    mechanism_count: 3,
    depth: 'quick',
    description: 'Fastest reasoning check. Applies the 3 mechanisms that appear in 67% of all sage skills.',
    example_input: {
      input: 'I want to cancel a meeting with a client because I feel anxious about the presentation.',
      depth: 'quick',
    },
    example_output: {
      result: {
        control_filter: { within_prohairesis: ['decision to cancel', 'preparation quality'], outside_prohairesis: ['client reaction'] },
        passion_diagnosis: { passions_detected: [{ id: 'agonia', name: 'Agony/Anxiety', root_passion: 'phobos' }], false_judgements: ['Presentation failure is a genuine evil'] },
        oikeiosis: { relevant_circles: [{ stage: 3, description: 'Professional community', obligation_met: false }] },
        katorthoma_proximity: 'habitual',
      },
      meta: { endpoint: '/api/reason', depth: 'quick', mechanism_count: 3 },
    },
  },
  {
    id: 'sage-reason-standard',
    name: 'sage-reason (standard)',
    tier: 'tier1_infrastructure',
    outcome: '5-mechanism analysis — adds value assessment + kathekon evaluation to the core triad.',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-reason-deep', 'sage-iterate'],
    endpoint: '/api/reason',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    depth: 'standard',
    description: 'Standard analysis. Evaluates whether preferred indifferents are being treated correctly and whether the action is a kathekon.',
    example_input: {
      input: 'I want to cancel a meeting with a client because I feel anxious about the presentation.',
      depth: 'standard',
    },
    example_output: {
      result: {
        control_filter: { '...': '...' },
        passion_diagnosis: { '...': '...' },
        oikeiosis: { '...': '...' },
        value_assessment: { indifferents_at_stake: [{ name: 'Reputation', axia: 'moderate', treated_as: 'good' }], value_error: 'Treating reputation as a genuine good rather than a preferred indifferent.' },
        kathekon_assessment: { is_kathekon: false, quality: 'contrary', justification: 'Cancelling without reasonable cause violates professional role obligations.' },
        katorthoma_proximity: 'habitual',
      },
      meta: { endpoint: '/api/reason', depth: 'standard', mechanism_count: 5 },
    },
  },
  {
    id: 'sage-reason-deep',
    name: 'sage-reason (deep)',
    tier: 'tier1_infrastructure',
    outcome: 'Full 6-mechanism analysis — adds Senecan progress tracking and direction-of-travel.',
    cost_speed: '~$0.055, ~4s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/reason',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
    mechanism_count: 6,
    depth: 'deep',
    description: 'Deepest analysis. Includes Senecan grade assessment and tracks whether reasoning is improving, stable, or declining.',
    example_input: {
      input: 'I want to cancel a meeting with a client because I feel anxious about the presentation.',
      depth: 'deep',
    },
    example_output: {
      result: {
        control_filter: { '...': '...' },
        passion_diagnosis: { '...': '...' },
        oikeiosis: { '...': '...' },
        value_assessment: { '...': '...' },
        kathekon_assessment: { '...': '...' },
        iterative_refinement: { senecan_grade: 'grade_1', direction_of_travel: 'improving', progress_dimensions: { passion_reduction: 'Anxiety frequency reducing but still dominant under pressure.' } },
        katorthoma_proximity: 'habitual',
      },
      meta: { endpoint: '/api/reason', depth: 'deep', mechanism_count: 6 },
    },
  },

  // =========================================================================
  // TIER 2: Evaluation Skills (call sage-reason internally)
  // =========================================================================
  {
    id: 'sage-score',
    name: 'sage-score',
    tier: 'tier2_evaluation',
    outcome: 'Pre-action decision audit with structured reasoning + improvement path.',
    cost_speed: '~$0.033, ~2s',
    chains_to: ['sage-iterate', 'sage-reason-standard'],
    endpoint: '/api/score',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'virtue_quality'],
    mechanism_count: 4,
    description: 'The original 4-stage evaluation. Returns control filter, kathekon assessment, passion diagnosis, and unified virtue quality.',
    example_input: {
      action: 'I decided to work through the weekend to meet a deadline, skipping my family dinner.',
      context: 'The deadline is for a client project that could lead to a major contract.',
    },
    example_output: {
      result: {
        control_filter: { within_prohairesis: ['choice to prioritise work'], outside_prohairesis: ['whether client signs contract'] },
        kathekon_assessment: { is_kathekon: true, quality: 'marginal' },
        passion_diagnosis: { passions_detected: [{ id: 'philoplousia', name: 'Love of wealth', root_passion: 'epithumia' }] },
        virtue_quality: { katorthoma_proximity: 'deliberate' },
        disclaimer: 'Ancient reasoning, modern application...',
      },
      meta: { endpoint: '/api/score' },
    },
  },
  {
    id: 'sage-guard',
    name: 'sage-guard',
    tier: 'tier2_evaluation',
    outcome: 'Sub-100ms decision gate — binary go/no-go check before acting.',
    cost_speed: '~$0.001, <100ms',
    chains_to: ['sage-iterate'],
    endpoint: '/api/guardrail',
    method: 'POST',
    auth_required: false,
    mechanisms: ['control_filter', 'passion_diagnosis'],
    mechanism_count: 2,
    description: 'Fast pre-action gate using haiku model. Returns proceed/caution/pause/deny with a threshold comparison.',
    example_input: {
      action: 'Send an angry email to my manager about the unfair workload.',
      threshold: 'deliberate',
    },
    example_output: {
      result: {
        proceed: false,
        katorthoma_proximity: 'reflexive',
        threshold: 'deliberate',
        recommendation: 'pause',
        passions_detected: [{ id: 'orge', name: 'Anger', root_passion: 'epithumia' }],
      },
      meta: { endpoint: '/api/guardrail' },
    },
  },
  {
    id: 'sage-iterate',
    name: 'sage-iterate',
    tier: 'tier2_evaluation',
    outcome: 'Iterative decision refinement — submit, get feedback, revise, track improvement.',
    cost_speed: '~$0.033 per iteration, ~2s',
    chains_to: ['sage-score'],
    endpoint: '/api/score-iterate',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'virtue_quality'],
    mechanism_count: 4,
    description: 'Deliberation chain. Submit an action, get sage feedback, revise, re-submit. Tracks proximity improvement across iterations.',
    example_input: {
      action: 'I want to quit my job today.',
      context: 'I had a bad day.',
      agent_id: 'my-agent-001',
    },
    example_output: {
      result: {
        chain_id: 'dc_abc123',
        step_number: 1,
        katorthoma_proximity: 'reflexive',
        improvement_path: 'Address the impulse to flee discomfort (phobos).',
      },
      meta: { endpoint: '/api/score-iterate' },
    },
  },
  {
    id: 'sage-decide',
    name: 'sage-decide',
    tier: 'tier2_evaluation',
    outcome: 'Option ranker — submit 2-5 choices, ranked by reasoning quality.',
    cost_speed: '~$0.033, ~2s',
    chains_to: ['sage-guard'],
    endpoint: '/api/score-decision',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'virtue_quality'],
    mechanism_count: 3,
    description: 'Compare multiple options. Returns each option scored and ranked by reasoning quality.',
    example_input: {
      decision: 'How to respond to a critical review of my work.',
      options: ['Defend my work aggressively', 'Accept all criticism without question', 'Examine which critiques are valid'],
    },
    example_output: {
      result: {
        decision: 'How to respond to a critical review of my work.',
        options_scored: [
          { option: 'Examine which critiques are valid', katorthoma_proximity: 'principled' },
          { option: 'Accept all criticism without question', katorthoma_proximity: 'habitual' },
          { option: 'Defend my work aggressively', katorthoma_proximity: 'reflexive' },
        ],
        recommended: 'Examine which critiques are valid',
      },
      meta: { endpoint: '/api/score-decision' },
    },
  },
  {
    id: 'sage-audit',
    name: 'sage-audit',
    tier: 'tier2_evaluation',
    outcome: 'Document quality audit + shareable trust badge.',
    cost_speed: '~$0.033, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/score-document',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'kathekon_assessment', 'passion_diagnosis', 'virtue_quality'],
    mechanism_count: 4,
    description: 'Evaluate the reasoning quality of written content. Returns proximity level and a shareable badge URL.',
    example_input: {
      text: 'Our company should pivot immediately because competitors are ahead...',
      title: 'Strategic Memo',
    },
    example_output: {
      result: {
        katorthoma_proximity: 'deliberate',
        badge_url: 'https://sagereasoning.com/badge/abc123',
      },
      meta: { endpoint: '/api/score-document' },
    },
  },
  {
    id: 'sage-converse',
    name: 'sage-converse',
    tier: 'tier2_evaluation',
    outcome: 'Conversation quality breakdown — per-participant reasoning analysis.',
    cost_speed: '~$0.033, ~3s',
    chains_to: [],
    endpoint: '/api/score-conversation',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'virtue_quality'],
    mechanism_count: 3,
    description: 'Analyse a multi-party conversation. Returns overall quality and per-participant reasoning assessment.',
    example_input: {
      messages: [
        { speaker: 'Alice', text: 'We need to cut costs by 30%.' },
        { speaker: 'Bob', text: 'That would mean laying off half the team.' },
      ],
    },
    example_output: {
      result: {
        overall: { katorthoma_proximity: 'deliberate' },
        participants: [{ speaker: 'Alice', katorthoma_proximity: 'habitual' }],
      },
      meta: { endpoint: '/api/score-conversation' },
    },
  },
  {
    id: 'sage-scenario',
    name: 'sage-scenario',
    tier: 'tier2_evaluation',
    outcome: 'Decision scenario generator + scorer.',
    cost_speed: '~$0.066, ~4s',
    chains_to: ['sage-score'],
    endpoint: '/api/score-scenario',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
    mechanism_count: 3,
    description: 'Generate a decision scenario with options, then score the chosen response.',
    example_input: {
      mode: 'generate',
      audience: 'professional',
    },
    example_output: {
      result: {
        scenario: 'A colleague takes credit for your work in a meeting...',
        options: ['Confront them publicly', 'Speak privately', 'Let it go'],
      },
      meta: { endpoint: '/api/score-scenario' },
    },
  },
  {
    id: 'sage-reflect',
    name: 'sage-reflect',
    tier: 'tier2_evaluation',
    outcome: 'End-of-day decision review — identifies patterns + structured examination.',
    cost_speed: '~$0.033, ~2s',
    chains_to: [],
    endpoint: '/api/reflect',
    method: 'POST',
    auth_required: true,
    mechanisms: ['passion_diagnosis', 'virtue_quality'],
    mechanism_count: 2,
    description: 'Daily reflection tool. Reviews actions taken and identifies recurring passion patterns.',
    example_input: {
      actions: ['Skipped breakfast to answer emails', 'Agreed to extra work despite being overwhelmed'],
    },
    example_output: {
      result: {
        katorthoma_proximity: 'habitual',
        passions_detected: [{ id: 'oknos', name: 'Timidity', root_passion: 'phobos' }],
        sage_perspective: 'The pattern suggests a tendency to neglect self-care (oikeiosis stage 1) in favour of external approval.',
      },
      meta: { endpoint: '/api/reflect' },
    },
  },
  {
    id: 'sage-context',
    name: 'sage-context',
    tier: 'tier2_evaluation',
    outcome: 'Reasoning framework context loader — public, no auth.',
    cost_speed: 'Free, <50ms',
    chains_to: [],
    endpoint: '/api/stoic-brain',
    method: 'GET',
    auth_required: false,
    mechanisms: [],
    mechanism_count: 0,
    description: 'Load the Stoic Brain reference data for context injection. Deterministic, no AI call.',
    example_input: {},
    example_output: {
      core_premise: 'The goal of human life is eudaimonia...',
    },
  },
  {
    id: 'sage-diagnose',
    name: 'sage-diagnose',
    tier: 'tier2_evaluation',
    outcome: 'Decision-making diagnostic — 14-question quick or 55-assessment deep evaluation.',
    cost_speed: '~$0.033, ~2s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/assessment/foundational',
    method: 'POST',
    auth_required: true,
    mechanisms: ['passion_diagnosis', 'virtue_quality', 'oikeiosis'],
    mechanism_count: 3,
    description: 'Agent assessment framework. 14 self-assessments (foundational) or 55 (full profile).',
    example_input: {
      agent_id: 'my-agent',
      responses: [{ assessment_id: 'SO-01', response: 'I tend to prioritise my own goals.' }],
    },
    example_output: {
      result: {
        senecan_grade: 'grade_1',
        growth_edge: 'oikeiosis_extension',
      },
      meta: { endpoint: '/api/assessment/foundational' },
    },
  },
  {
    id: 'sage-profile',
    name: 'sage-profile',
    tier: 'tier2_evaluation',
    outcome: 'Agent decision profile — 4 scenarios, returns tendencies and blind spots.',
    cost_speed: '~$0.033, ~3s',
    chains_to: ['sage-diagnose'],
    endpoint: '/api/baseline/agent',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'virtue_quality', 'oikeiosis'],
    mechanism_count: 4,
    description: 'Quick baseline assessment. Run 4 scenarios and get back an agent reasoning profile.',
    example_input: {
      agent_id: 'my-agent',
    },
    example_output: {
      result: {
        dominant_passion: 'phobos',
        senecan_grade: 'grade_1',
        blind_spots: ['Tendency to avoid confrontation at the cost of justice'],
      },
      meta: { endpoint: '/api/baseline/agent' },
    },
  },
]

/**
 * Get all skills (for GET /skills).
 */
export function getAllSkills(): Omit<SkillContract, 'example_input' | 'example_output'>[] {
  return SKILL_REGISTRY.map(({ example_input, example_output, ...rest }) => rest)
}

/**
 * Get a specific skill by ID (for GET /skills/{id}).
 */
export function getSkillById(id: string): SkillContract | undefined {
  return SKILL_REGISTRY.find(s => s.id === id)
}

/**
 * Get skills by tier.
 */
export function getSkillsByTier(tier: SkillTier): SkillContract[] {
  return SKILL_REGISTRY.filter(s => s.tier === tier)
}
