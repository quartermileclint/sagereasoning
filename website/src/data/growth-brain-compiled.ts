/**
 * growth-brain-compiled.ts — Sage-Growth Brain compiled as TypeScript constants.
 *
 * Structured knowledge fundamentals for startup growth and market positioning,
 * mirroring the Stoic Brain pattern. Organised into domains (analogous to Stoic
 * mechanisms) that can be loaded selectively based on the growth task at hand.
 *
 * Token budget: ~400-800 tokens per domain context block.
 * Total ceiling: 2000 tokens (quick), 4000 tokens (standard), 6000 tokens (deep).
 *
 * Sage-Growth Brain v1.0.0 (2026-04-10)
 */

// =============================================================================
// DOMAIN 1: POSITIONING
// =============================================================================

export const POSITIONING_CONTEXT = {
  core_principle: "Position on what you actually are, not what you wish you were. SageReasoning occupies a unique intersection: Stoic virtue ethics encoded as infrastructure for both human practitioners and AI agents. No competitor does this. Communicate the truth of that position clearly.",

  unique_position: {
    what_we_are: "Stoic virtue ethics encoded as API infrastructure and practitioner tools",
    dual_audience: "Human practitioners seeking examined reasoning + AI agent developers seeking virtue alignment assessment",
    why_unique: "No competitor combines ancient Stoic framework with modern agent assessment. Philosophy tools exist. AI ethics tools exist. The intersection is ours.",
  },

  competitor_differentiation: [
    {
      competitor_type: "Generic AI Ethics Platforms",
      their_strength: "Technical compliance, wide adoption",
      their_weakness: "No philosophical depth, treat ethics as checklist",
      our_advantage: "Grounded in 2000 years of tested virtue tradition, not compliance theatre",
    },
    {
      competitor_type: "Philosophy Apps & Courses",
      their_strength: "Deep philosophical content, engaging UX",
      their_weakness: "No agent assessment, no API, treats philosophy as personal enrichment only",
      our_advantage: "Philosophy becomes operational infrastructure. Virtue assessment serves agent developers.",
    },
    {
      competitor_type: "AI Safety & Alignment Tools",
      their_strength: "Technical sophistication, researcher credibility",
      their_weakness: "Compliance-focused, not virtue-focused. No developmental path for agents.",
      our_advantage: "Virtue gives agents a path to growth, not just constraints.",
    },
    {
      competitor_type: "Life Coaching & Wellness Apps",
      their_strength: "Accessible language, community engagement",
      their_weakness: "No rigorous framework, no standards for assessment, personalised but not scalable",
      our_advantage: "Rigorous Stoic framework meets scalable API assessment.",
    },
  ],

  value_propositions: {
    for_humans: "Daily practice tools grounded in 2000 years of tested philosophy. A structured pathway to examined reasoning, not just another wellness app.",
    for_agents: "Structured virtue assessment that gives agents a developmental path, not just a compliance checkbox. Shows agents where they reason well and where they struggle.",
  },
} as const;

// =============================================================================
// DOMAIN 2: AUDIENCE
// =============================================================================

export const AUDIENCE_CONTEXT = {
  core_principle: "Know who you're talking to. Human practitioners and agent developers have different needs, different language, and different buying journeys. Serve each audience's real needs — don't flatten them into one message.",

  human_practitioner_personas: [
    {
      id: "curious_explorer",
      name: "Curious Explorer",
      description: "Interested in Stoic philosophy, may have read popular books, looking for structured practice",
      motivation: "Wants to apply Stoic ideas to everyday decisions. Drawn to philosophy but needs scaffolding.",
      buying_signal: "Explores free content, comments thoughtfully, eventually wants something deeper.",
    },
    {
      id: "committed_practitioner",
      name: "Committed Practitioner",
      description: "Already practices some form of philosophical reflection, wants deeper framework and community",
      motivation: "Has tasted real philosophical practice, now seeking rigour and peer engagement.",
      buying_signal: "Willing to pay for depth, community, and structured progression.",
    },
    {
      id: "professional_seeker",
      name: "Professional Seeker",
      description: "Leader/manager looking for principled decision-making framework, values practical application",
      motivation: "Wants to make better decisions and model principled reasoning for their team.",
      buying_signal: "Sees direct professional value, may sponsor team access.",
    },
  ],

  agent_developer_personas: [
    {
      id: "alignment_researcher",
      name: "Alignment Researcher",
      description: "Working on AI alignment, interested in virtue-based assessment as complement to safety measures",
      motivation: "Studying alignment approaches, wants rigorous philosophical framework integrated with assessment.",
      buying_signal: "Wants API access for research, may propose collaboration.",
    },
    {
      id: "agent_builder",
      name: "Agent Builder",
      description: "Building AI agents for production use, needs trust signals and assessment infrastructure",
      motivation: "Building agents for clients or production, needs verifiable quality signals.",
      buying_signal: "Integrates assessment into agent pipeline, pays for per-agent assessment.",
    },
    {
      id: "enterprise_evaluator",
      name: "Enterprise Evaluator",
      description: "Evaluating agent quality at scale, needs standardised assessment framework with API access",
      motivation: "Responsible for vetting multiple agents, needs standardised, scalable assessment.",
      buying_signal: "Volume pricing, API integration, requires documentation and SLAs.",
    },
  ],

  buying_journey: {
    free_tier: "Try /api/evaluate, run free foundational assessment, explore website tools. Low commitment, high exploration.",
    conversion_trigger: "Sees value in deeper assessment. Needs iterate/full capabilities. Hits free-tier ceiling.",
    paid_commitment: "API key for full assessment. Iterative deliberation. Mentor features. Ongoing relationship.",
  },
} as const;

// =============================================================================
// DOMAIN 3: CONTENT
// =============================================================================

export const CONTENT_CONTEXT = {
  core_principle: "Content should teach, not sell. Every piece should leave the reader with a useful insight about reasoning — whether they buy or not. Content is the product's front door, and it should demonstrate what principled reasoning looks like in practice.",

  tone_of_voice: {
    primary: "Authoritative but accessible — like a wise friend who takes philosophy seriously but doesn't take themselves seriously",
    avoid: [
      "Academic jargon without explanation",
      "Marketing hype or manufactured urgency",
      "Claiming the framework is perfect or universally applicable",
      "Talking down to readers",
    ],
    embrace: [
      "Concrete examples over abstract principles",
      "Acknowledging limitations honestly",
      "Connecting ancient wisdom to modern situations",
      "Showing the reasoning process, not just conclusions",
    ],
  },

  seo_strategy: {
    primary_keywords: [
      "stoic reasoning",
      "AI agent assessment",
      "virtue ethics API",
      "philosophical reasoning tools",
      "stoic practice app",
    ],
    content_pillars: [
      "Stoic philosophy applied to modern decisions",
      "AI agent virtue alignment",
      "Daily reasoning practice",
      "Principled decision-making",
    ],
  },

  channel_guidance: [
    {
      channel: "Blog",
      purpose: "Deep dives on Stoic philosophy and modern application. Demonstrate reasoning in action. Drive SEO.",
      frequency: "2-3 posts per month",
      audience: "Curious explorers, SEO discovery",
    },
    {
      channel: "Social Media",
      purpose: "Short reflections, philosophical quotes applied to current events, community engagement. Social proof.",
      frequency: "3-5 posts per week",
      audience: "Current practitioners, broad reach",
    },
    {
      channel: "Email Newsletter",
      purpose: "Weekly reflection prompt or insight. Deep practitioner nurture. Keep engaged users connected.",
      frequency: "Weekly",
      audience: "Email subscribers, practitioner community",
    },
  ],
} as const;

// =============================================================================
// DOMAIN 4: DEVELOPER RELATIONS
// =============================================================================

export const DEVREL_CONTEXT = {
  core_principle: "For developers, documentation IS marketing. A well-documented API with clear examples converts better than any landing page. Treat agent-card.json and llms.txt as discovery mechanisms, not afterthoughts.",

  api_as_marketing: {
    principle: "Every endpoint's GET response is its own documentation. The /api/evaluate endpoint is a zero-friction demo. Developer experience is the growth engine for the agent audience.",
    discovery_mechanisms: [
      "llms.txt — machine-readable API description for LLM agents",
      "agent-card.json — standardised agent capability card",
      "GET endpoints return usage documentation",
      "/api/evaluate — no-auth instant demo",
    ],
  },

  developer_experience_standards: [
    "Clear error messages that explain what went wrong and how to fix it",
    "JSON envelope with composability hints (what this response includes, what else is available)",
    "Usage headers on every response (rate limit, quota, cost estimate)",
    "Rate limit headers clearly visible (X-RateLimit-Remaining, X-RateLimit-Reset)",
    "Versioned endpoints (/api/v1/) so breaking changes don't break existing integrations",
  ],

  community_building: {
    approach: "Lead with open standards and interoperability. Publish the assessment framework. Welcome competing implementations — a standard is stronger when multiple parties implement it.",
    contribution_pathways: [
      "API SDK contributions (reference implementations in Python, Node.js, Go)",
      "Assessment scenario submissions from developers",
      "Integration examples (agent frameworks, LLM platforms)",
      "Documentation improvements and translations",
    ],
  },
} as const;

// =============================================================================
// DOMAIN 5: COMMUNITY
// =============================================================================

export const COMMUNITY_CONTEXT = {
  core_principle: "Community grows from genuine value, not from growth hacking. Celebrate practitioner progress. Create pathways for contribution. Build a community that would exist even if the product disappeared, because the philosophy is what matters.",

  community_principles: [
    "Authentic engagement — we participate as practitioners, not just platform operators",
    "Progress celebration — recognize genuine growth without gamification gimmicks",
    "Contribution pathways — senior practitioners can lead reflections, mentor newcomers, develop content",
    "Philosophical discourse quality — high bar for discussion depth, low tolerance for marketing spam",
    "Privacy and dignity in community spaces — personal reflections are protected, sharing is always voluntary",
  ],

  practitioner_progression: {
    recognition: "Celebrate developmental milestones without gamification — recognition of genuine growth, not points. 'I completed my first 30-day reflection practice' matters; 'You earned a badge' does not.",
    sharing: "Enable practitioners to share insights with community while protecting personal reflection data. Public practice notes, private deliberations.",
    contribution: "Senior practitioners can contribute reflection scenarios, review community content, and mentor newcomers. A pathway from user to community member.",
  },

  open_source_engagement: {
    strategy: "The assessment framework (V3) is published openly. The Stoic Brain data structure is documented. Implementation is proprietary but the intellectual framework is shared.",
    why: "A standard adopted by multiple parties is stronger than a proprietary lock-in. If SageReasoning disappeared, practitioners and developers would still have the framework.",
  },
} as const;

// =============================================================================
// DOMAIN 6: METRICS
// =============================================================================

export const METRICS_CONTEXT = {
  core_principle: "Measure what matters for the current phase. In pre-launch, that's content reach and developer interest. At launch, it's activation and retention. Never optimise for a metric you don't yet have data for.",

  acquisition_metrics: [
    "Website unique visitors (monthly)",
    "API documentation page views (entry point for developer discovery)",
    "/api/evaluate demo calls (friction-free trial of core value)",
    "GitHub stars/forks (for open-source components and framework)",
  ],

  activation_metrics: [
    "Account signups (free tier",
    "First API key creation (developer activation)",
    "First paid assessment completed (human monetization)",
    "First reflection submitted to journal (practitioner activation)",
  ],

  retention_metrics: [
    "Weekly active practitioners (log in, submit reflections)",
    "Monthly API calls per developer (engagement depth)",
    "Deliberation chain completion rate (feature adoption)",
    "Journal streak length (habit formation)",
  ],

  revenue_metrics: [
    "MRR (monthly recurring revenue from paid practitioners and API subscription)",
    "Paid API key count (developer customer count)",
    "Average revenue per developer (ARPD)",
  ],

  content_performance: {
    primary: [
      "Blog post views",
      "Time on page (depth indicator)",
      "Social shares (organicreach)",
    ],
    conversion: [
      "Blog → signup rate (content to activation)",
      "Documentation → API key creation rate (discovery to developer monetization)",
    ],
  },
} as const;

// =============================================================================
// GROWTH BRAIN FOUNDATIONS — Analogous to OPS_BRAIN_FOUNDATIONS
// =============================================================================

export const GROWTH_BRAIN_FOUNDATIONS = {
  core_premise: "Growth serves the mission of making principled reasoning accessible. Every marketing decision, every content piece, every community interaction should be evaluated against this purpose. Growth that compromises the philosophy is not growth — it's decay.",

  four_growth_virtues: {
    honest_positioning: {
      id: "honest_positioning",
      name: "Honest Positioning",
      stoic_parallel: "Wisdom (phronesis)",
      description: "Knowing what you truly are and communicating it clearly. No claims the product cannot support. No positioning against problems we haven't verified exist.",
    },
    audience_empathy: {
      id: "audience_empathy",
      name: "Audience Empathy",
      stoic_parallel: "Justice (dikaiosyne)",
      description: "Serving each audience's real needs, not manipulating their desires. Understanding that human practitioners and agent developers need different things, said differently.",
    },
    patient_growth: {
      id: "patient_growth",
      name: "Patient Growth",
      stoic_parallel: "Temperance (sophrosyne)",
      description: "Growing sustainably, not chasing vanity metrics. Preferring 100 engaged practitioners over 10,000 bounced visitors. Building trust over time, not manufacturing urgency.",
    },
    visible_courage: {
      id: "visible_courage",
      name: "Visible Courage",
      stoic_parallel: "Courage (andreia)",
      description: "Standing for principled reasoning in a market that rewards hype. Publishing limitations honestly. Charging fairly. Saying 'this tool is not for everyone' when it's true.",
    },
  },

  operating_principle: "Sage-Growth builds awareness and trust through honest communication. Growth serves the mission of making principled reasoning accessible. No dark patterns, no manufactured urgency, no claims the product cannot support.",
} as const;
