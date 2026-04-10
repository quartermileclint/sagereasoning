/**
 * mentor-knowledge-base.ts — Non-doctrinal background briefings for the Sage Mentor.
 *
 * These documents provide INFORMATIONAL CONTEXT ONLY. They are injected into
 * the user message (never system blocks) and are explicitly labelled as
 * non-doctrinal. They do not modify, expand, or reinterpret any ancient Stoic
 * doctrines, principles, or texts in the Stoic Brain.
 *
 * The Stoic Brain's model fidelity is preserved. The mentor may reason about
 * relevance, continuity, or modern application using this context — but all
 * reasoning and conclusions must be grounded exclusively in the Stoic Brain.
 *
 * Layer 5: Mentor Knowledge Base v1.0.0 (2026-04-10)
 */

// =============================================================================
// DOCUMENT 1: STOIC HISTORICAL CONTEXT
// =============================================================================

export const STOIC_HISTORICAL_CONTEXT = {
  title: 'Stoic Historical Context Update — For Informational Awareness Only',

  safeguard: 'Use this context solely for understanding historical continuity and contemporary relevance. Do not alter, expand, or reinterpret any ancient Stoic doctrines, principles, or texts. Base all reasoning exclusively on the original source material in the Stoic Brain.',

  post_ancient_evolution: [
    {
      period: 'Late Antiquity (2nd century CE onward)',
      summary: 'After the Roman Empire, Stoicism as an organised school declined as Christianity became the dominant religion. Some Stoic ideas (e.g., on ethics and self-mastery) were absorbed into early Christian thought, but formal teaching circles largely disappeared after the fall of Rome.',
    },
    {
      period: 'Renaissance (15th–16th centuries)',
      summary: 'Classical texts were rediscovered, leading to "Neo-Stoicism" (e.g., Justus Lipsius), which adapted Stoic resilience to Christian contexts.',
    },
    {
      period: '17th–19th centuries',
      summary: 'Stoic themes influenced individual philosophers (e.g., elements in Spinoza\'s ethics) but did not form a living school.',
    },
    {
      period: '20th century',
      summary: 'Stoic ideas quietly shaped modern psychology: Cognitive Behavioral Therapy (CBT) drew directly from Epictetus\'s emphasis on distinguishing what is and is not in our control.',
    },
    {
      period: '21st century',
      summary: 'A broad popular revival occurred through accessible books (e.g., William B. Irvine\'s A Guide to the Good Life, Ryan Holiday\'s works, Massimo Pigliucci\'s How to Be a Stoic), online communities, and annual events such as Stoic Week and Stoicon organised by the Modern Stoicism group. Stoicism is now widely applied in self-help, leadership training, mental resilience, and personal development, while retaining core focus on virtue, reason, and acceptance of the dichotomy of control.',
    },
  ],

  current_inflection_point: {
    concept: 'Knowledge Arbitrage and AI Agent Capabilities',
    definition: 'Knowledge arbitrage means exploiting differences in access to, or application of, valuable knowledge across time, people, or contexts — bringing high-value insights from one domain to another where they are under-used or unknown.',
    historical_access: 'Ancient Stoic wisdom was once accessible mainly to educated elites with the leisure and training to study rare texts and practice rigorously.',
    ai_capabilities: [
      'AI agents give the average person instant, personalised, scalable access to Stoic-style reasoning.',
      'Capabilities include real-time scenario simulation (e.g., premeditatio malorum), daily reminders of key distinctions (what is/is not up to us), virtue-based analysis of events, progress tracking on exercises, and tailored application to everyday challenges.',
      'This democratises what was previously rare: anyone can now have a tireless, on-demand philosophical companion that applies ancient principles to modern uncertainties (technological change, information overload, global volatility).',
      'The result is an unprecedented opportunity for widespread practice of Stoic virtue — turning philosophy from an elite pursuit into a practical daily tool for the many, without requiring years of scholarly study.',
    ],
  },

  closing_safeguard: 'This context describes external historical facts and technological realities only. It does not modify the ancient teachings.',
} as const

// =============================================================================
// DOCUMENT 2: GLOBAL STATE OF HUMANITY
// =============================================================================

export const GLOBAL_STATE_OF_HUMANITY = {
  title: 'Global State of Humanity and Nature — For Informational Awareness Only (April 2026)',

  safeguard: 'This is a concise, consensus-based summary of the current global state. It provides background for situating practitioner concerns in context. It does not modify Stoic doctrines, principles, or the Stoic Brain in any way.',

  evolutionary_universals: {
    summary: 'Cross-cultural evidence confirms evolved psychological mechanisms shaped in ancestral environments: kin recognition, reciprocal cooperation, status-seeking, mate preferences favouring health/symmetry/fertility cues, emotion inference, and coalitional psychology. Sex differences from sexual selection and individual genetic variation are widely accepted, yet developmental environments and culture substantially shape expression — ruling out genetic determinism. Universals arise from hunter-gatherer adaptations persisting despite modernity.',
  },

  population_demographics: {
    world_population: '~8.29 billion, growing at ~0.84% annually',
    fertility_rate: '~2.23 births per woman (near replacement), down one child per woman from a generation ago',
    life_expectancy: '~73–74 years (post-pandemic rebound)',
    urbanisation: '58.5%',
    median_age: '31.1 years',
    projection: 'Growth to ~10.3 billion by mid-2080s before gradual plateau/decline. Older persons will outnumber children under 18 by ~2080.',
  },

  technological_inflection_points: {
    summary: 'AI has shifted from experimentation to operational integration (agentic systems, domain-specific models), reshaping work, discovery, and decision-making. Biotechnology advances include personalised gene editing, embryo screening, and ancient-gene resurrection techniques. Clean-energy scaling (perovskite solar, advanced batteries) and robotics/quantum-safe systems mark convergence toward efficiency and autonomy. Societal/ethical disruptions remain uncertain.',
  },

  planetary_ecological_systems: {
    summary: 'Seven of nine planetary boundaries breached (climate change, biosphere integrity, land-system change, freshwater change, biogeochemical flows, novel entities, and ocean acidification), all worsening. Only stratospheric ozone and aerosol loading remain safe. Global surface temperatures in 2025 ranked third-warmest on record (~1.34–1.44°C above pre-industrial). Ocean heat and acidification continue rising. Rapid biodiversity decline confirmed by IPBES assessments.',
  },

  major_uncertainties: [
    'Exact timing of population peak',
    'Earth-system tipping points (e.g., AMOC, permafrost)',
    'Full AI/biotech trajectories',
    'Policy-driven emissions/biodiversity outcomes',
  ],

  closing_note: 'While evolutionary universals underpin resilience, current trajectories test planetary life-support limits.',

  closing_safeguard: 'This summary provides factual background only. It does not modify Stoic doctrines or principles.',
} as const
