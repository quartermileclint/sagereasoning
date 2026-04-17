/**
 * project-context-compiled.ts — Project context compiled as TypeScript constants.
 *
 * Follows the same pattern as stoic-brain-compiled.ts: immutable `as const` exports
 * optimised for LLM context injection. These are STATIC baselines — dynamic state
 * (current phase, recent decisions) is layered on by project-context.ts at runtime.
 *
 * Five context levels for different endpoint groups (ordered by token size):
 *   - 'full':          All fields — for Sage Ops (P7) and founder-only endpoints
 *   - 'summary':       Identity + phase + recent context — for Mentor endpoints
 *   - 'minimal':       Identity + ethical commitments — for Human-facing tools
 *   - 'condensed':     Phase + decisions only — for Operational endpoints
 *   - 'identity_only': Identity string only — true minimum
 *
 * Token budget targets (measured):
 *   - identity_only: ~50 tokens
 *   - condensed:  ~139 tokens
 *   - minimal:    ~222 tokens (⚠️ F13: name inverted — larger than condensed)
 *   - summary:    ~180 tokens
 *   - full:       ~500+ tokens
 *
 * Last updated: 2026-04-16
 */

// =============================================================================
// IDENTITY — Who SageReasoning is and what it does
// =============================================================================

export const PROJECT_IDENTITY = {
  name: "SageReasoning",
  tagline: "Principled reasoning for every rational agent",
  identity: "SageReasoning encodes Stoic wisdom into infrastructure that helps any rational agent — human or artificial — examine impressions, diagnose false judgements, and progress toward virtue.",
  mission: "That principled reasoning becomes a standard capability of every AI agent and a daily practice for every human who encounters it.",
  audiences: {
    human_practitioners: "The website serves human practitioners with daily Stoic practice tools.",
    agent_developers: "The API and skill contracts serve agent developers integrating virtue-based reasoning.",
    agent_trust_layer: "The Agent Trust Layer extends the moral community to include artificial agents.",
  },
  positioning: "The only reasoning API grounded in 2,300 years of Stoic philosophy. Not sentiment analysis. Not ethics scoring. Principled reasoning from primary sources — Marcus Aurelius, Epictetus, Seneca, Cicero.",
} as const;

// =============================================================================
// FOUNDER CONTEXT — The builder must embody what they build
// =============================================================================

export const FOUNDER_CONTEXT = {
  role: "Sole founder, non-technical, building a startup with AI collaboration.",
  principle: "The builder must embody what they build — personal virtue practice grounds the product.",
  developmental_sequence: "Cultivate personal virtue → test in relationships → serve the community → extend to all rational agents.",
} as const;

// =============================================================================
// ETHICAL COMMITMENTS — Non-negotiable constraints from the manifest
// =============================================================================

export const ETHICAL_COMMITMENTS = {
  R17_privacy: {
    id: "R17",
    name: "Intimate Data Protection",
    commitment: "Intimate data encrypted at rest (AES-256-GCM). Genuine deletion endpoint. No bulk profiling. Local-first storage under evaluation.",
  },
  R18_honest_certification: {
    id: "R18",
    name: "Honest Certification",
    commitment: "Certification badges carry explicit scope language. No claim of moral authority. Adversarial evaluation protocol required.",
  },
  R19_limitations: {
    id: "R19",
    name: "Honest Positioning",
    commitment: "Limitations page required before launch. Mirror principle in mentor prompts. No universality claims.",
  },
  R20_vulnerable_users: {
    id: "R20",
    name: "Vulnerable User Protection",
    commitment: "Vulnerable user detection and redirection to professional support. Independence encouragement. Relationship asymmetry guidance.",
  },
} as const;

// =============================================================================
// PRODUCT ARCHITECTURE — What exists and how it's structured
// =============================================================================

export const PRODUCT_ARCHITECTURE = {
  stoic_brain: {
    description: "Compiled Stoic philosophical data (psychology, passions, virtue, value, action, progress, scoring) injected as system message context.",
    mechanisms: [
      "control_filter (prohairesis / dichotomy of control)",
      "passion_diagnosis (4 root passions, 23 sub-species, causal stage mapping)",
      "oikeiosis (5 expanding circles of concern, Cicero's deliberation framework)",
      "value_assessment (preferred/dispreferred indifferents, selection principles)",
      "kathekon_assessment (appropriate action, two layers of quality)",
      "iterative_refinement (Senecan progress grades, 4 progress dimensions)",
    ],
    depth_levels: {
      quick: "3 mechanisms — control_filter, passion_diagnosis, oikeiosis",
      standard: "5 mechanisms — adds value_assessment, kathekon_assessment",
      deep: "6 mechanisms — adds iterative_refinement",
    },
  },
  context_layers: {
    layer_1: "Stoic Brain — compiled philosophical data (system message, cache_control: ephemeral)",
    layer_2: "Practitioner Context — condensed profile: dominant passions, weakest virtue, causal breakdown, proximity level (user message)",
    layer_3: "Project Context — project state: identity, phase, decisions, ethical commitments (user message, cache_control: ephemeral)",
    layer_4: "Environmental Context — non-doctrinal background from weekly scans (user message, future)",
    layer_5: "Mentor Knowledge Base — historical/global context, never modifies Stoic Brain (user message, future)",
  },
} as const;

// =============================================================================
// PHASE STATUS — Current state of the project
// =============================================================================

export const PHASE_STATUS = {
  current_phase: "P0",
  phase_name: "Foundations (R&D Phase)",
  description: "Context architecture build. Layer 1 (Stoic Brain), Layer 2 (Practitioner Context), and Layer 3 (Project Context) wired across all endpoints including context-template factory skills. Demo analytics tracking active. Hold point assessment ahead.",
  completed: [
    "0a: Shared status vocabulary adopted",
    "0b: Session continuity protocol in use",
    "0c: Verification framework documented",
    "0d: Communication signals adopted",
    "0e: File organisation and INDEX.md created",
    "0f: Decision log established",
    "Layer 3 context injection — all endpoints wired (compiled TS baseline + JSON dynamic merge)",
    "Demo analytics — evaluate_demo_started/completed/error events live",
  ],
  in_progress: [
    "Hold point preparation (0h)",
  ],
  ahead: [
    "0h: Hold point — startup preparation assessment",
    "P1: Business plan review (evidence-based)",
    "P2: Ethical safeguards (R17, R19, R20)",
  ],
} as const;

// =============================================================================
// ACTIVE TENSIONS — Known tensions the reasoning should be aware of
// =============================================================================

export const ACTIVE_TENSIONS = [
  "Scope governance: P0 permits product building when it simplifies what follows, but must not become indefinite preparation.",
  "The deliberate choice exercise (P1) depends on evidence from P0 hold point testing, not projections.",
  "Builder-product relationship: the founder's own practice is the first test case for every tool.",
] as const;

// =============================================================================
// CONTEXT LEVEL DEFINITIONS — Which constants each level includes
// =============================================================================

/**
 * Maps context levels to the fields they include.
 * Used by project-context.ts to build the appropriate context string.
 */
export const CONTEXT_LEVEL_MAP = {
  minimal: ["identity", "ethical_commitments"],
  condensed: ["phase_status", "recent_decisions"],
  summary: ["identity", "founder", "phase_status", "recent_decisions"],
  full: ["identity", "mission", "founder", "phase_status", "active_tensions", "recent_decisions", "ethical_commitments", "product_architecture"],
} as const;
