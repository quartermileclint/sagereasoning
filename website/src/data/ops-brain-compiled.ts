/**
 * ops-brain-compiled.ts — Sage-Ops Brain compiled as TypeScript constants.
 *
 * Structured knowledge fundamentals for startup operations, mirroring the
 * Stoic Brain pattern. Organised into domains (analogous to Stoic mechanisms)
 * that can be loaded selectively based on the operational task at hand.
 *
 * Token budget: ~400-800 tokens per domain context block.
 * Total ceiling: 2000 tokens (quick), 4000 tokens (standard), 6000 tokens (deep).
 *
 * Sage-Ops Brain v1.0.0 (2026-04-10)
 */

// =============================================================================
// DOMAIN 1: PROCESS & WORKFLOW
// =============================================================================

export const PROCESS_CONTEXT = {
  core_principle: "Every repeatable action should be a documented process. Every documented process should be measured. Every measured process should be improved. But don't formalise what hasn't been tested manually first.",

  workflow_states: [
    { id: "scoped", name: "Scoped", description: "Requirements defined, no architecture or code yet." },
    { id: "designed", name: "Designed", description: "Architecture decided, schema/types may exist, no functional code." },
    { id: "scaffolded", name: "Scaffolded", description: "Structural code exists (files, interfaces, placeholders) but doesn't do anything yet." },
    { id: "wired", name: "Wired", description: "Code connects to live systems and functions end-to-end." },
    { id: "verified", name: "Verified", description: "Tested and confirmed working by both parties." },
    { id: "live", name: "Live", description: "Deployed to production and serving real users/agents." },
  ],

  session_protocol: {
    open: "Read last handoff note first. Run verification on prior work. Only read full reference docs when needed.",
    close: "Produce structured handoff: decisions made, status changes, next steps, blockers, open questions.",
    signals: {
      founder: [
        "explore — think about it, don't build",
        "design — produce spec, don't write code",
        "build — write functional code",
        "ship — deploy to production",
        "I've decided — execute without re-debating",
        "I'm done for now — stabilise and close",
      ],
      ai: [
        "I'm confident — verified and reliable",
        "I'm making an assumption — proceeding on incomplete info",
        "I need your input — can't proceed without your decision",
        "I'd push back on this — I think there's a better approach",
        "This is a limitation — I can't do or verify this",
        "I caused this — the problem is from a change I made",
      ],
    },
  },

  change_classification: [
    { level: "standard", definition: "Additive changes, content updates, new features, cosmetic fixes.", protocol: "AI explains, founder acknowledges before deploy." },
    { level: "elevated", definition: "Changes to existing user-facing functionality, new dependencies, schema changes.", protocol: "AI names what could break, provides rollback. Founder approves." },
    { level: "critical", definition: "Auth, session management, access control, encryption, data deletion, deploy config.", protocol: "Full Critical Change Protocol: what changes, what breaks, rollback plan, verification step, explicit approval." },
  ],
} as const;

// =============================================================================
// DOMAIN 2: FINANCIAL METRICS
// =============================================================================

export const FINANCIAL_CONTEXT = {
  core_principle: "Cost is a health metric, not just an expense line. Revenue must exceed 2x direct costs to be sustainable. The founder makes the investment decision — the ops brain provides the numbers, not the judgement.",

  key_metrics: [
    { id: "mrr", name: "Monthly Recurring Revenue", description: "Predictable monthly revenue from subscriptions and metered API usage.", formula: "Sum of all active subscription amounts + metered usage charges for the month." },
    { id: "arr", name: "Annual Recurring Revenue", description: "MRR × 12. The annualised run rate.", formula: "MRR × 12." },
    { id: "burn_rate", name: "Burn Rate", description: "Net cash consumed per month. Gross burn = total spend. Net burn = total spend minus revenue.", formula: "Total monthly expenses − monthly revenue." },
    { id: "runway", name: "Runway", description: "Months of operation remaining at current burn rate.", formula: "Cash on hand ÷ net burn rate." },
    { id: "cac", name: "Customer Acquisition Cost", description: "Total cost to acquire one paying customer.", formula: "Total marketing + sales spend ÷ new customers acquired in period." },
    { id: "ltv", name: "Customer Lifetime Value", description: "Total revenue expected from a customer over their lifetime.", formula: "Average revenue per customer per month × average customer lifespan in months." },
    { id: "ltv_cac_ratio", name: "LTV:CAC Ratio", description: "Efficiency of growth spend. Target: 3:1 or higher for SaaS.", formula: "LTV ÷ CAC. Below 1:1 means losing money on every customer." },
    { id: "payback_period", name: "CAC Payback Period", description: "Months to recover the cost of acquiring a customer.", formula: "CAC ÷ average revenue per customer per month." },
  ],

  cost_health_thresholds: {
    rule: "R5 — Revenue must exceed 2× direct LLM costs for the product to be sustainable.",
    ops_cost_cap: "$100/month for Sage Ops pipeline (R15).",
    alert_triggers: [
      "Revenue-to-cost ratio drops below 2×",
      "Ops pipeline costs approach $100/month",
      "Single endpoint cost exceeds 10% of total LLM spend",
      "Runway drops below 6 months",
    ],
  },

  startup_financial_basics: {
    entity_type: "Australian company (considerations: GST registration threshold $75K, BAS quarterly, R&D tax incentive potential).",
    tax_obligations: [
      "ABN registration",
      "GST registration when turnover exceeds $75K (or voluntary registration before)",
      "BAS lodgement (quarterly for small business)",
      "Income tax return",
      "R&D tax incentive claim (if eligible — AI development costs may qualify)",
    ],
    note: "Tax compliance requires a registered tax agent. Sage-Ops prepares and categorises; the external accountant signs off.",
  },
} as const;

// =============================================================================
// DOMAIN 3: COMPLIANCE & RISK
// =============================================================================

export const COMPLIANCE_CONTEXT = {
  core_principle: "Compliance is not a checkbox — it's an ongoing operational function. The register must be current. The audit schedule must be followed. Gaps must be documented with severity, not hidden.",

  active_rules: [
    { id: "R17", name: "Intimate Data Protection", requirements: ["AES-256-GCM encryption at rest", "Genuine deletion endpoint", "No bulk profiling", "Local-first storage under evaluation"], status: "P2 — not yet implemented" },
    { id: "R18", name: "Honest Certification", requirements: ["Scope language on badges", "No moral authority claims", "Adversarial evaluation protocol"], status: "P3 — not yet implemented" },
    { id: "R19", name: "Honest Positioning", requirements: ["Limitations page", "Mirror principle in mentor prompts", "No universality claims"], status: "P2 — not yet implemented" },
    { id: "R20", name: "Vulnerable User Protection", requirements: ["Language pattern detection for distress", "Redirection to professional support", "Independence encouragement", "Relationship asymmetry guidance"], status: "P2 — critical, architecture decisions needed first" },
  ],

  legal_prep_areas: [
    { area: "Privacy Policy", status: "Draft needed. Must cover AU Privacy Act + GDPR for international users.", phase: "P2-P6" },
    { area: "Terms of Service", status: "Draft needed. Must cover API usage, data handling, limitations of philosophical guidance.", phase: "P2-P6" },
    { area: "IP Protection", status: "Stoic Brain data is derived from ancient sources (public domain). Compiled format and loader architecture are proprietary.", phase: "P6" },
    { area: "AI Regulatory", status: "Monitor AU approach to AI regulation. EU AI Act may apply to international users.", phase: "Ongoing" },
  ],

  audit_schedule: {
    frequency: "Quarterly compliance review against all active R-rules.",
    method: "AI produces checklist of requirements vs current state. Founder reviews and approves.",
    escalation: "Any gap rated 'blocker' pauses launch preparation until resolved.",
  },
} as const;

// =============================================================================
// DOMAIN 4: HR & PEOPLE (SOLO FOUNDER PHASE)
// =============================================================================

export const PEOPLE_CONTEXT = {
  core_principle: "In the solo founder phase, 'HR' means managing your own energy, time, and skill development. When the first hire comes, it means doing it right from the start — structured process, fair contracts, clear expectations.",

  solo_founder_management: {
    energy_management: "Track which tasks energise vs drain. Schedule high-judgement work (decisions, verification) when energy is highest. Delegate execution to AI during low-energy periods.",
    skill_development: "The founder is learning to build a startup with AI collaboration. Every session builds capability. Document what you learn — it becomes the startup preparation toolkit.",
    boundaries: "When the founder signals 'I'm done for now', stabilise and close. Don't propose additional work. The founder verifies between sessions, not in real time.",
  },

  first_hire_readiness: {
    triggers: [
      "Revenue justifies the cost (not before)",
      "A role exists that the founder cannot delegate to AI and cannot do themselves",
      "The workload exceeds what one person + AI can sustain",
    ],
    requirements: [
      "Employment contract (external lawyer review)",
      "Fair Work Act compliance (AU)",
      "Structured interview process",
      "Clear role description with measurable outcomes",
      "Onboarding documentation",
    ],
    note: "Not expected during P0-P6. This domain activates post-launch when scale demands it.",
  },
} as const;

// =============================================================================
// DOMAIN 5: PRODUCT METRICS & ANALYTICS
// =============================================================================

export const ANALYTICS_CONTEXT = {
  core_principle: "Measure what matters for the current phase. In P0, that's build velocity and verification coverage. At launch, it's adoption, retention, and cost health. Don't build analytics infrastructure before there's data to analyse.",

  phase_metrics: {
    p0_foundations: {
      primary: ["Session productivity (decisions made per session)", "Verification coverage (% of components tested)", "Build velocity (status transitions per week)"],
      secondary: ["TypeScript compile status", "Endpoint count and context coverage", "Decision log completeness"],
    },
    p1_p5_pre_launch: {
      primary: ["Feature completeness against launch criteria", "Compliance gap count and severity", "Cost per LLM call by endpoint"],
      secondary: ["Code quality metrics", "Documentation coverage", "Security audit findings"],
    },
    p6_launch: {
      primary: ["DAU/WAU/MAU", "API calls per day (free vs paid)", "Conversion rate (free → paid)", "Revenue (MRR)", "Churn rate"],
      secondary: ["Feature adoption rates", "Deliberation chain completion rate", "Average chain length", "Support ticket volume", "CSAT/NPS"],
    },
  },

  analytics_events_tracked: [
    "deliberation_start_v3 — new chain started",
    "deliberation_continue_v3 — chain iteration",
    "agent_foundational_assessment_v3 — free assessment completed",
    "agent_full_assessment_v3 — paid assessment completed",
    "api_key usage via security.ts withUsageHeaders",
  ],
} as const;

// =============================================================================
// DOMAIN 6: VENDOR & INFRASTRUCTURE
// =============================================================================

export const VENDOR_CONTEXT = {
  core_principle: "Minimise dependencies. Prefer managed services over self-hosted. Monitor costs per vendor. Have a migration path for every critical dependency.",

  current_stack: [
    { vendor: "Vercel", role: "Hosting, deployment, CDN", cost_model: "Usage-based (hobby tier currently)", migration_path: "Next.js deploys to any Node host" },
    { vendor: "Supabase", role: "Database (PostgreSQL), auth, storage", cost_model: "Usage-based (free tier currently)", migration_path: "Standard PostgreSQL — can migrate to any Postgres host" },
    { vendor: "Anthropic", role: "LLM API (Claude models)", cost_model: "Per-token pricing", migration_path: "API abstraction layer allows model swaps. Prompt rewriting required for non-Claude models." },
    { vendor: "GitHub", role: "Source control, CI/CD triggers", cost_model: "Free for public/private repos", migration_path: "Standard Git — portable to any Git host" },
  ],

  cost_monitoring: {
    method: "Track per-vendor monthly spend. Alert when any vendor exceeds projected budget by >20%.",
    llm_specific: "Track cost per endpoint per call. MODEL_DEEP vs MODEL_FAST cost differential. Cache hit rate reduces effective cost.",
  },
} as const;

// =============================================================================
// OPS BRAIN FOUNDATIONS — Analogous to STOIC_BRAIN_FOUNDATIONS
// =============================================================================

export const OPS_BRAIN_FOUNDATIONS = {
  core_premise: "A startup's operations serve its mission, not the other way around. Process exists to reduce friction and increase reliability. Every process should be the simplest version that works. Complexity is added based on evidence, not imagination.",

  four_operational_virtues: {
    process_harmony: {
      id: "process_harmony",
      name: "Process Harmony",
      stoic_parallel: "Living in accordance with nature",
      description: "Operations should flow naturally from the startup's actual needs, not from templates or cargo-culting larger companies. The right process is the one that fits.",
    },
    efficiency_judgement: {
      id: "efficiency_judgement",
      name: "Efficiency Judgement",
      stoic_parallel: "Wisdom (phronesis)",
      description: "Knowing what to optimise, what to leave alone, and what to eliminate. The most efficient process is often the one you don't need.",
    },
    resource_control: {
      id: "resource_control",
      name: "Resource Control",
      stoic_parallel: "Temperance (sophrosyne)",
      description: "Spending only what advances the mission. Not underspending (false economy) or overspending (premature scaling). Cash is runway; runway is time to learn.",
    },
    fair_scaling: {
      id: "fair_scaling",
      name: "Fair Scaling",
      stoic_parallel: "Justice (dikaiosyne)",
      description: "Growing in a way that respects all stakeholders — users, team, investors, community. Fair pricing, honest metrics, sustainable workload.",
    },
  },

  operating_principle: "The Sage-Ops Brain does not make decisions — the founder does. Sage-Ops provides organised information, identifies risks, tracks metrics, and prepares materials. The irreplaceable decisions — vision, relationships, ethical judgement, investment — belong to the founder.",
} as const;
