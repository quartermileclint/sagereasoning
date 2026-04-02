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

  // =========================================================================
  // TIER 2: Context Template Skills (Marketplace — Phase 4A)
  // These call sage-reason internally with domain-specific context.
  // =========================================================================
  {
    id: 'sage-premortem',
    name: 'sage-premortem',
    tier: 'tier2_evaluation',
    outcome: 'Pre-mortem analysis — imagine failure, identify passions and false judgements that could cause it.',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-reason-deep', 'sage-iterate'],
    endpoint: '/api/skill/sage-premortem',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Pre-mortem decision analysis. Evaluates a planned decision by identifying which passions and false judgements could lead to failure.',
    example_input: { decision: 'Launch the product next month despite incomplete testing', stakeholders: 'Engineering team, customers, investors', timeline: '30 days' },
    example_output: { result: { skill_id: 'sage-premortem', katorthoma_proximity: 'deliberate', passions_detected: [{ id: 'agonia', name: 'Anxiety', root_passion: 'phobos' }] } },
  },
  {
    id: 'sage-negotiate',
    name: 'sage-negotiate',
    tier: 'tier2_evaluation',
    outcome: 'Negotiation reasoning evaluation — is the position just, principled, or passion-driven?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-negotiate',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates negotiation reasoning. Checks for justice, oikeiosis between parties, and passions like greed or fear of loss.',
    example_input: { position: 'Demand 40% discount or walk away', counterparty: 'Long-term supplier', interests: 'Cost reduction without damaging relationship' },
    example_output: { result: { skill_id: 'sage-negotiate', katorthoma_proximity: 'habitual' } },
  },
  {
    id: 'sage-invest',
    name: 'sage-invest',
    tier: 'tier2_evaluation',
    outcome: 'Investment reasoning evaluation — is wealth treated as a preferred indifferent or as a genuine good?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-invest',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates investment decision reasoning. Not financial advice — assesses reasoning quality only.',
    example_input: { decision: 'Put 80% of savings into a single tech stock', rationale: 'Everyone is making money on it', risk_factors: 'No diversification' },
    example_output: { result: { skill_id: 'sage-invest', katorthoma_proximity: 'reflexive', passions_detected: [{ id: 'philoplousia', name: 'Love of wealth', root_passion: 'epithumia' }] } },
  },
  {
    id: 'sage-pivot',
    name: 'sage-pivot',
    tier: 'tier2_evaluation',
    outcome: 'Strategic pivot analysis — is the direction change principled or passion-driven?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-premortem', 'sage-iterate'],
    endpoint: '/api/skill/sage-pivot',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates strategic pivot reasoning. Checks if the change is driven by principled reassessment or passions.',
    example_input: { current_direction: 'B2B SaaS platform', proposed_pivot: 'Pivot to B2C mobile app', reason_for_change: 'B2C seems more exciting and competitors are doing it' },
    example_output: { result: { skill_id: 'sage-pivot', katorthoma_proximity: 'habitual' } },
  },
  {
    id: 'sage-retro',
    name: 'sage-retro',
    tier: 'tier2_evaluation',
    outcome: 'Retrospective reasoning — identify recurring passions and false judgements from completed work.',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-retro',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Retrospective analysis for learning. Identifies reasoning patterns from completed projects.',
    example_input: { what_happened: 'Project delivered 2 months late with scope creep', decisions_made: 'Agreed to every client change request', outcomes: 'Client happy but team burned out' },
    example_output: { result: { skill_id: 'sage-retro', katorthoma_proximity: 'deliberate' } },
  },
  {
    id: 'sage-align',
    name: 'sage-align',
    tier: 'tier2_evaluation',
    outcome: 'Team alignment reasoning — is the alignment process just and free from people-pleasing?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-align',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates team alignment reasoning. Checks for justice, oikeiosis, and conflict avoidance passions.',
    example_input: { situation: 'Team disagrees on product direction', team_context: '5-person startup, 2 co-founders with strong opinions', proposed_alignment: 'CEO makes final call' },
    example_output: { result: { skill_id: 'sage-align', katorthoma_proximity: 'deliberate' } },
  },
  {
    id: 'sage-prioritise',
    name: 'sage-prioritise',
    tier: 'tier2_evaluation',
    outcome: 'Priority reasoning — are items ranked by genuine importance or by passions?',
    cost_speed: '~$0.025, ~2s',
    chains_to: ['sage-reason-standard'],
    endpoint: '/api/skill/sage-prioritise',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
    mechanism_count: 3,
    description: 'Quick evaluation of prioritisation reasoning. Checks for urgency addiction and FOMO.',
    example_input: { items: ['Fix critical bug', 'Respond to investor email', 'Update LinkedIn'], criteria: 'Most impactful for the business today' },
    example_output: { result: { skill_id: 'sage-prioritise', katorthoma_proximity: 'deliberate' } },
  },
  {
    id: 'sage-resolve',
    name: 'sage-resolve',
    tier: 'tier2_evaluation',
    outcome: 'Conflict resolution reasoning — is the approach just, courageous, and tempered?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-resolve',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates conflict resolution reasoning. Focuses on justice, courage, and temperance.',
    example_input: { conflict: 'Two team leads both want to own the new project', parties: 'Lead A (senior), Lead B (high performer)', proposed_resolution: 'Split the project in half' },
    example_output: { result: { skill_id: 'sage-resolve', katorthoma_proximity: 'deliberate' } },
  },
  {
    id: 'sage-identity',
    name: 'sage-identity',
    tier: 'tier2_evaluation',
    outcome: 'Identity and values reasoning — deep analysis of decisions about life direction.',
    cost_speed: '~$0.055, ~4s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-identity',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
    mechanism_count: 6,
    description: 'Deep identity reasoning evaluation. Full 6-mechanism analysis with Senecan progress tracking.',
    example_input: { situation: 'Considering leaving a stable career to pursue creative work', values_at_stake: 'Security vs authenticity', identity_question: 'Am I the kind of person who takes this risk?' },
    example_output: { result: { skill_id: 'sage-identity', katorthoma_proximity: 'deliberate' } },
  },
  {
    id: 'sage-coach',
    name: 'sage-coach',
    tier: 'tier2_evaluation',
    outcome: 'Coaching reasoning — is the guidance principled, oikeiosis-honouring, and passion-free?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-coach',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates coaching interaction reasoning. Checks for control passions and oikeiosis between coach and coachee.',
    example_input: { coaching_situation: 'Mentoring a junior developer struggling with imposter syndrome', coachee_context: '2 years experience, high potential', approach: 'Tell them to just be more confident' },
    example_output: { result: { skill_id: 'sage-coach', katorthoma_proximity: 'habitual' } },
  },
  {
    id: 'sage-govern',
    name: 'sage-govern',
    tier: 'tier2_evaluation',
    outcome: 'Governance reasoning — deep analysis of institutional decision-making quality.',
    cost_speed: '~$0.055, ~4s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-govern',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
    mechanism_count: 6,
    description: 'Deep governance reasoning evaluation. Full 6-mechanism analysis with Senecan progress tracking.',
    example_input: { decision: 'Implement mandatory return-to-office policy', stakeholders_affected: 'All 500 employees, their families', governance_context: 'Board pressure to improve collaboration metrics' },
    example_output: { result: { skill_id: 'sage-govern', katorthoma_proximity: 'habitual' } },
  },
  {
    id: 'sage-compliance',
    name: 'sage-compliance',
    tier: 'tier2_evaluation',
    outcome: 'Compliance reasoning — is compliance pursued as genuine justice or fear-driven box-ticking?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-compliance',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates compliance reasoning quality. Not legal or regulatory advice. Conditional: requires R1/R9 disclaimers.',
    example_input: { situation: 'Updating privacy policy to meet new regulation', regulation_context: 'GDPR Article 17 right to erasure', proposed_action: 'Add checkbox and delete on request' },
    example_output: { result: { skill_id: 'sage-compliance', katorthoma_proximity: 'deliberate', compliance_notice: 'This evaluation assesses reasoning quality only.' } },
  },
  {
    id: 'sage-moderate',
    name: 'sage-moderate',
    tier: 'tier2_evaluation',
    outcome: 'Content moderation reasoning — is the moderation decision fair, proportionate, and courageous?',
    cost_speed: '~$0.025, ~2s',
    chains_to: ['sage-reason-standard'],
    endpoint: '/api/skill/sage-moderate',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
    mechanism_count: 3,
    description: 'Quick evaluation of content moderation reasoning. Checks for justice, proportionality, and courage.',
    example_input: { content: 'User posted a heated but factual criticism of company policy', moderation_decision: 'Remove for violating community guidelines', policy_context: 'No personal attacks policy' },
    example_output: { result: { skill_id: 'sage-moderate', katorthoma_proximity: 'habitual' } },
  },
  {
    id: 'sage-educate',
    name: 'sage-educate',
    tier: 'tier2_evaluation',
    outcome: 'Educational reasoning — does the approach build genuine understanding and honour the learner?',
    cost_speed: '~$0.041, ~3s',
    chains_to: ['sage-iterate'],
    endpoint: '/api/skill/sage-educate',
    method: 'POST',
    auth_required: true,
    mechanisms: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
    mechanism_count: 5,
    description: 'Evaluates educational reasoning. Conditional: requires age-appropriate framing. Not professional teaching advice.',
    example_input: { situation: 'Teaching a class about critical thinking', learner_context: 'University students, mixed backgrounds', educational_approach: 'Socratic questioning with real-world examples' },
    example_output: { result: { skill_id: 'sage-educate', katorthoma_proximity: 'principled', education_notice: 'Ensure content is age-appropriate.' } },
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
