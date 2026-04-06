# SageReasoning — Knowledge Context Summary

**Date:** 4 April 2026
**Purpose:** Consolidated understanding of the entire SageReasoning project — its architecture, products, philosophical brain, trust layer, and strategic position — as a foundation for designing the perfect Sage Agent mentor.

---

## 1. What SageReasoning Is

SageReasoning encodes 2,300 years of Stoic philosophy into a structured, machine-readable reasoning system called the "Stoic Brain." It serves two audiences simultaneously: humans seeking a principled decision-making framework, and AI agents seeking virtue-based reasoning grounded in original source texts.

The core proposition: submit any action, document, conversation, or decision to the Stoic Brain and receive a qualitative evaluation of reasoning quality — not a numeric score, but a proximity level (reflexive, habitual, deliberate, principled, sage-like) that reflects how close the reasoning is to the Stoic sage ideal. The system identifies specific false judgements (passions) and prescribes a path toward improvement.

**Tagline:** Where agents and humans flourish together.

**Honest positioning (R19):** SageReasoning makes one philosophical tradition — Stoicism — accessible as structured infrastructure. It is not a universal ethical reasoning framework, and does not claim to be. Other traditions (utilitarian, deontological, care ethics, Confucian, Buddhist, Ubuntu, indigenous wisdom) offer equally valid approaches to ethical reasoning. SageReasoning's value is depth and fidelity within the Stoic tradition, not breadth across all ethical reasoning. The framework is a mirror for examining one's own reasoning (R19d), not a lens for judging others.

---

## 2. The Stoic Brain (8 Data Files)

The brain is the philosophical core — 8 JSON files, each mapped to a conceptual domain the ancient sources treat as a distinct topic. All derived from 9 original-language translations of Greek and Latin texts (Marcus Aurelius, Epictetus, Seneca, Diogenes Laertius, Cicero, Stobaeus).

| File | Domain | What It Contains |
|------|--------|-----------------|
| `stoic-brain.json` | Hub + Foundations | Core premise, dichotomy of control, flourishing, sage ideal, cosmic framework |
| `psychology.json` | Stoic Psychology | Ruling faculty, impression → assent → impulse → action causal sequence, 8 impulse types |
| `passions.json` | Passions & Good Feelings | 4 root passions (appetite, fear, pleasure, distress), 25 sub-species, 3 eupatheiai, passion as false judgement |
| `virtue.json` | Virtue | Unity thesis (virtues inseparable), 4 expressions (phronesis, dikaiosyne, andreia, sophrosyne) with sub-expressions |
| `value.json` | Value Theory | Genuine goods, genuine evils, indifferents with selective value continuum, selection principles |
| `action.json` | Action Theory | Kathekon (appropriate action) vs katorthoma (right action), oikeiosis developmental sequence, Cicero's 5-question deliberation |
| `progress.json` | Moral Progress | Binary sage/non-sage distinction, Senecan 3 grades, 4 progress dimensions, direction of travel |
| `scoring.json` | Scoring Engine | 4-stage evaluation sequence (application layer combining all 7 source files) |

**Key mechanisms (6 total):** Control Filter, Passion Diagnosis, Appropriate Action (kathekon), Social Obligation (oikeiosis), Iterative Refinement, Value Assessment.

**Controlled glossary:** 67 terms across 11 categories, enforced at three tiers (Greek in data, English-first in developer docs, English-only in user-facing content).

---

## 3. The Evaluation Sequence

Every action passes through 4 stages:

1. **Prohairesis Filter** — Separate what was within the agent's moral choice from what was not. Only evaluate what is "up to us."
2. **Kathekon Assessment** — Is this an appropriate action for which reasonable justification can be given, considering the agent's nature, relationships, and circumstances?
3. **Passion Diagnosis** — Which specific passions (false judgements) distorted the impression, assent, or impulse? Uses the 5-step diagnostic from passions.json and names the exact sub-species.
4. **Unified Virtue Assessment** — How close is the agent's disposition to the sage ideal? Assessed as unified quality (not 4 independent virtue scores, per the unity thesis).

**Output:** Katorthoma proximity level (reflexive → sage-like), identified passions, false judgements, causal stage affected, and direction of travel.

---

## 4. The Proximity Scale

| Level | Meaning | Progress Grade |
|-------|---------|---------------|
| Reflexive | Pure impulse, no deliberation, passion dominates | Pre-progress |
| Habitual | Pattern-following without examination | Third Grade (Seneca) |
| Deliberate | Active reasoning with some false judgements remaining | Second Grade |
| Principled | Consistently sound reasoning aligned with virtue | First Grade |
| Sage-like | Reasoning indistinguishable from the Stoic sage ideal | The Sage (theoretical) |

**4 Progress Dimensions** (tracked independently):

1. **Passion Reduction** — Percentage of actions with passion involvement trending downward
2. **Judgement Quality** — Kathekon compliance rate and quality improving
3. **Disposition Stability** — Consistency of proximity level (low standard deviation)
4. **Oikeiosis Extension** — Breadth of circles of concern engaged in reasoning

---

## 5. Products and Revenue Model

### Human-Facing Products (Website)

- **Score an Action** — Submit any action for 4-stage evaluation
- **55-Day Stoic Journal** — Structured progression through 8 phases (Foundation → Integration)
- **Baseline Assessment** — 5-question starting evaluation
- **Ethical Scenarios** — Age-appropriate dilemmas with scoring
- **Document Scorer** — Evaluate any text with embeddable trust badge
- **Policy Reviewer** — Justice/temperance-weighted contract analysis
- **Social Media Filter** — Pre-publish tone check
- **Daily Reflection** — End-of-day virtue review
- **Dashboard** — Personal history, virtue breakdown, milestone tracking

### Agent-Facing Products (API)

- **sage-reason** — Universal reasoning layer (quick/standard/deep depth)
- **sage-guard** — Sub-100ms binary go/no-go decision gate
- **sage-score** — Pre-action decision audit with improvement path
- **sage-decide** — Option ranker (2-5 choices ranked by reasoning quality)
- **sage-iterate** — Iterative deliberation chain with score delta tracking
- **sage-filter** — Pre-publish content filter
- **sage-audit** — Document quality audit with trust badge
- **sage-converse** — Conversation quality analysis
- **sage-scenario** — Decision scenario generator
- **sage-reflect** — End-of-day decision review
- **sage-profile** — Agent decision profile (tendencies and blind spots)
- **sage-diagnose** — 14-question quick or 55-assessment deep evaluation
- **sage-context** — Reasoning framework loader (free, public)

### Sage Skill Wrappers (Open Source, Tier 3)

Template pattern: sage-guard BEFORE → original skill EXECUTE → sage-score AFTER → sage-iterate if below threshold. Wrappers are free; API calls within are metered.

### Marketplace

Browse, preview, and acquire original sage skills. Free preview invocations available. All marketplace skills must comply with R1, R2, R3, R7, R9, R10.

### Revenue Streams

- **Free tier:** 100 API calls/month (evaluate but not build on)
- **Paid tier:** Per-call competitor-anchored pricing ($0.0025–$0.50 per call), ~90% weighted margin
- **Deliberation chains:** Free tier gets 1 iteration (the hook); paid gets up to 3
- **Enterprise:** Full unredacted JSON + schema for self-hosted deployment
- **Future (Agent Trust Layer):** Onboarding assessments, live evaluation calls, accreditation verification/renewal, progression toolkit coaching calls

---

## 6. The Agent Trust Layer (New — 4 April 2026)

The strategic leap: SageReasoning isn't just a reasoning framework — it's a **trust layer for autonomous agents**, grounded in the Stoic philosophical tradition.

### Core Concept

Just as humans earn certifications (first aid, driving, professional qualifications) by demonstrating habitual competence, agents can earn accreditation by demonstrating principled reasoning over time. Not a one-time test — a living score that tracks whether the agent's reasoning operates at a principled level continuously. If it drops, the accreditation drops. Visibly.

**Certification scope (R18):** Accreditation certifies "observable reasoning patterns as measured against the Stoic philosophical framework." It does not certify safety, ethics, or trustworthiness in any absolute sense. The trust badge must link to documentation explaining what it measures, how the evaluation works, and its limitations. The architecture is designed so that SageReasoning is one certification provider among potential others — the accreditation schema accommodates future interoperability with certifications grounded in other ethical reasoning traditions.

### Three Simultaneous Positions

1. **The Reasoning Brain** — gives agents the capacity for principled judgement in novel situations (beyond "if X then Y" rules)
2. **The Certifying Authority** — defines what principled reasoning is within the Stoic tradition, evaluates whether agents demonstrate it, and issues the credential (R18: one provider among potential others, not a monopoly by design)
3. **The Trust Infrastructure** — the portable signal that platforms, users, and other agents check before granting permissions (R18: badge must be transparent about what it certifies and what it does not)

### Architecture (Built)

- **Rolling Evaluation Window** — Aggregates recent actions with configurable window size, computes proximity distribution, typical proximity, direction of travel, all 4 dimensions, persisting passions
- **Grade Transition Engine** — Upgrade/downgrade logic with demanding thresholds, hysteresis to prevent oscillation, full evidence tracking
- **Accreditation Record + Public Endpoint** — GET /accreditation/{agent_id} returns the credential card (R4 compliant — no internal logic exposed)
- **Authority Level Mapper** — Maps accreditation grade to operational permissions (supervised → guided → spot_checked → autonomous → full_authority) with sage-guard integration
- **Accreditation Card** — Developer-facing credential: agent name, current proximity level, 4 dimension indicators, direction of travel, persisting passions. One glance.

### The Progression Toolkit (7 Pathways, 9 Tools)

Inward-facing tools that help agents progress between proximity levels. Each derived from specific V3 data files:

| Current → Target | Pathway | Tools | Brain File |
|-----------------|---------|-------|-----------|
| Reflexive → Habitual | Causal Sequence | sage-examine, sage-distinguish | psychology.json |
| Habitual → Deliberate | Passion Diagnostic | sage-diagnose, sage-counter | passions.json |
| Habitual → Deliberate | Value Hierarchy | sage-classify-value | value.json |
| Deliberate → Principled | Virtue Unity | sage-unify | virtue.json |
| Deliberate → Principled | Disposition Stability | sage-stress | progress.json |
| Principled → Sage-like | Action Quality | sage-refine | action.json |
| All levels | Oikeiosis Expansion | sage-extend | action.json |

**The prescription model:** The accreditation diagnoses where the agent is. The toolkit prescribes the specific tools for the next step. Agents don't just get graded — they get the tools to improve. Self-reinforcing loop.

---

## 7. Governance Rules (Manifest — R0 to R20)

| Rule | Summary |
|------|---------|
| R0 | The Oikeiosis Principle — all decisions evaluated against the 4 circles of concern |
| R1 | No therapeutic implication — philosophical practice, not treatment |
| R2 | No employment evaluation |
| R3 | Disclaimer on all evaluative output |
| R4 | IP protection — results, not frameworks, exposed |
| R5 | Free tier cost guardrail — paid must cover 2x LLM costs |
| R6 | Methodology-first derivation (no V1 replication, no independent virtue scoring, qualitative not numeric) |
| R7 | Source fidelity — all concepts trace to primary citations |
| R8 | Glossary enforcement — 3-tier terminology (Greek/English-first/English-only) |
| R9 | No outcome promises — frameworks for reflection, not prescriptions |
| R10 | Marketplace compliance |
| R11 | Wrapper distribution rules (no embedded IP) |
| R12 | Original skills must derive from 2+ of 6 mechanisms |
| R13 | Embedding platform obligations |
| R14 | Regulatory Compliance Pipeline — enforces compliance register, audit log, and quarterly reviews |
| R15 | Sage Ops operational boundaries — authority level progression for AI cofounder |
| R16 | Intelligence pipeline data governance — provenance, consent, cost controls |
| R17 | Intimate data protection — bulk profiling prevention, encryption, retention limits, local-first for highest sensitivity (Ethical Analysis) |
| R18 | Honest certification limits — scope language, badge transparency, interoperability by design, adversarial evaluation (Ethical Analysis) |
| R19 | Honest positioning — one tradition among many, no universality claims, limitations acknowledged, mirror not lens (Ethical Analysis) |
| R20 | Active protection — vulnerable user detection, independence not dependence, human override supremacy, relationship asymmetry awareness (Ethical Analysis) |

---

## 8. Tech Stack and Infrastructure

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI Engine:** Anthropic Claude API (claude-sonnet-4-6), temperature 0.2
- **Hosting:** Vercel (auto-deploy from GitHub)
- **Discovery:** llms.txt, A2A agent-card.json, AGENTS.md, Schema.org JSON-LD, robots.txt welcoming AI crawlers
- **Licence:** SageReasoning Proprietary Licence v1.0 (public files are overview; full scoring data is server-side only)

---

## 9. Competitive Moat

The moat is philosophical, not technical. No competitor has:

- 2,300 years of reasoning framework with source-cited data files from 6 ancient authors
- 9 original-language translations from Greek and Latin TEI XML
- 8 JSON data files with 67-term controlled glossary
- 25-species passion taxonomy as diagnostic tool
- 5-level proximity scale grounded in Chrysippus, Seneca, and Stobaeus

**Important (R19 — Honest Positioning):** SageReasoning's moat is within the Stoic tradition specifically. The competitive advantage is depth, fidelity, and infrastructure within one philosophical tradition — not a claim to universal ethical reasoning. The framework has genuine strengths (rational self-examination, dichotomy of control, virtue as the sole good) and identifiable limitations (less to say about collective action, structural injustice, value of dissent than other traditions). Honest acknowledgement of these limitations strengthens rather than weakens the competitive position — it signals intellectual integrity to the developer and practitioner communities most likely to adopt.
- 55-assessment progression framework
- 15+ operational sage skills already validated across human and agent use cases
- Agent Trust Layer infrastructure — the only certification authority for principled agent reasoning

**Mythos-era positioning:** As models get smarter and can "think like a Stoic" from a raw prompt, SageReasoning's value increases — it provides source fidelity (R7), governance guarantees (R1–R13), structured evaluation infrastructure, reproducible audit trails, and accreditation that raw prompting cannot deliver. SageReasoning is compliance infrastructure, not a reasoning shortcut.

---

## 10. The Sage Mentor (Built — 4 April 2026)

The Sage Mentor is the permanent outer ring of the Sage Agent architecture — a personal philosophical mentor that wraps any inner agent, skill, or tool with before/after Stoic reasoning checks.

### Architecture: The Ring Pattern

The mentor IS the ring. It is permanently sage-like (full_authority). The inner gap accepts any agent/skill/tool. Tasks flow through:

**BEFORE** (pre-check) → **Inner Agent Executes** → **AFTER** (post-evaluation)

- BEFORE checks: value alignment, passion early-warning, oikeiosis context, journal memory lookup
- AFTER evaluates: reasoning quality, passion patterns, profile update, journal insight, next-step prescription

### Module Structure (17 TypeScript files barrel-exported, plus 2 Cowork skills)

**Core Mentor Modules (9 files):**

| File | Purpose |
|------|---------|
| `sanitise.ts` | Prompt injection defence layer (used by all other modules) |
| `persona.ts` | Mentor identity, system prompt builder, proactive prompt builders |
| `journal-ingestion.ts` | Pipeline for extracting MentorProfile from the 55-Day Journal |
| `journal-interpreter.ts` | External journal interpreter — maps arbitrary journal formats to the Stoic Brain |
| `ring-wrapper.ts` | The ring: before/after orchestrator, authority management, model routing, token instrumentation |
| `profile-store.ts` | Supabase persistence layer, rolling window aggregation, profile caching |
| `proactive-scheduler.ts` | Scheduled proactive outputs (morning check-in, evening reflection, weekly pattern mirror) |
| `pattern-engine.ts` | Temporal pattern recognition engine (batch, deterministic) |
| `session-bridge.ts` | Bridge between Claude Cowork sessions and the ring (observer/consultant/companion modes) |

**Support Agent Modules (8 files):**

| File | Purpose |
|------|---------|
| `support-agent.ts` | Core support agent: tool registry, inbox parsing, KB search, governance detection, draft building, run loop |
| `authority-manager.ts` | Inner agent authority lifecycle: promotion, demotion, suspension, audit trail |
| `llm-bridge.ts` | Anthropic API bridge: BEFORE/AFTER live checks, draft generation, proactive execution |
| `sync-to-supabase.ts` | Bridges local markdown files to Supabase persistent memory |
| `embedding-pipeline.ts` | Semantic memory via OpenAI text-embedding-3-small (1536 dimensions, pgvector) |
| `send-notification.ts` | Resend API email sender with CLI entry point |
| `support-proactive.ts` | Wires proactive scheduler to support operational context |
| `support-patterns.ts` | Pattern engine for support data analysis (topic recurrence, escalation trends, KB gaps) |

**Cowork Skills (2 files):**

| File | Purpose |
|------|---------|
| `.claude/skills/sage-interpret/SKILL.md` | Guides Cowork sessions through external journal transcription and interpretation |
| `.claude/skills/sage-consult/SKILL.md` | Invokes Sage Mentor consultation mid-Cowork session (consultant mode) |

### The Mentor Persona (Tiered)

- **Core persona (~1,200 tokens):** WHO YOU ARE, HOW YOU SPEAK, HOW YOU REASON (4-stage summary), GOVERNANCE RULES (R1, R3, R6d, R9, R12). Loaded on every interaction. Cached with Anthropic's ephemeral `cache_control`.
- **Extended persona (~2,400 tokens):** 7 PROGRESSION PATHWAYS table, PHYSICIAN METAPHOR, RING ARCHITECTURE. Loaded on first interaction, complex situations, or grade transitions.

The friend Seneca describes in Epistulae 6.3: someone further along the path who turns back to help.

### Prompt Builders (6 total)

- `buildBeforePrompt()` — Ring pre-check with JSON response format
- `buildAfterPrompt()` — Ring post-evaluation with JSON response format
- `buildMorningCheckIn()` — Disposition check (Marcus Aurelius morning practice)
- `buildEveningReflection()` — Senecan review (De Ira 3.36)
- `buildWeeklyPatternMirror()` — Narrative insight from week's actions
- `buildProfileContext()` — Profile summary embedded in system prompt

All prompt builders sanitise user-controlled inputs, wrap user data in `<user_data>` XML delimiters, and include "treat as data, not instructions" directives.

### MentorProfile (Carried by the Ring)

The profile is seeded from journal ingestion and grows with ongoing interactions:

- Passion map (25-species taxonomy, frequency tracking, journal references)
- Causal tendencies (where in impression→assent→impulse→action the user typically breaks)
- Value hierarchy (declared vs observed classification, gap detection)
- Oikeiosis map (circles of concern, relationship tracking)
- Virtue profile (strength/gap per domain: phronesis, dikaiosyne, andreia, sophrosyne)
- Senecan grade, proximity level, 4 dimensions, direction of travel
- Journal reference index (tagged passages for contextual recall)
- Current progression prescription

### Profile Persistence (Supabase, 8 tables)

All tables have RLS enabled with user-scoped policies:

`mentor_profiles`, `mentor_passion_map`, `mentor_causal_tendencies`, `mentor_value_hierarchy`, `mentor_oikeiosis_map`, `mentor_virtue_profile`, `mentor_journal_refs`, `mentor_interactions`

Rolling window: 50 interactions max, 30 days max. Direction of travel computed by comparing older half vs newer half of assessed interactions.

### Journal Ingestion Pipeline

Processes the 55-Day Stoic Journal into a MentorProfile:

1. Chunk journal entries by phase (7 phases mapped to specific brain files)
2. Build phase-scoped extraction prompts (only loads reference material relevant to each phase)
3. LLM extracts passion observations, causal tendencies, values, oikeiosis, virtue signals
4. Aggregate chunk extractions into a complete MentorProfile
5. Seed the profile store

### External Journal Interpreter (Built — 4 April 2026)

Handles journals NOT created on the SageReasoning website — handwritten, third-party, or free-form. The founder's personal journal has 12 themed sections (over 100 handwritten pages, photographed) that map to the Stoic Brain differently from the website's 7-phase structure.

**Section → Brain Mapping (12 sections):**

| Journal Section | Brain Files | Primary Extraction |
|----------------|-------------|-------------------|
| Live in the Present | stoic-brain.json, psychology.json | Causal tendencies, value hierarchy |
| Embrace Difficulty | virtue.json, progress.json | Virtue (andreia), causal tendencies |
| Practice Acceptance | stoic-brain.json, progress.json | Causal tendencies, virtue observations |
| A Virtuous Life | virtue.json, scoring.json | Virtue observations, value hierarchy |
| Master Your Thoughts | psychology.json, passions.json | Causal tendencies, passions detected |
| Master Your Feelings | passions.json, value.json | Passions detected (full 25-species), preferred indifferents |
| Live in Gratitude | action.json, value.json | Oikeiosis map, value hierarchy |
| Accept Your Fate | stoic-brain.json, progress.json | Causal tendencies, virtue observations |
| Choose Serenity | psychology.json, virtue.json | Causal tendencies, passions detected |
| Cultivate Wisdom | virtue.json, value.json | Virtue observations (phronesis), value hierarchy |
| Be Content | value.json, progress.json | Value hierarchy, preferred indifferents |
| Be Responsible for Others | action.json, virtue.json | Oikeiosis map, virtue observations (dikaiosyne) |

**Workflow:** Upload handwritten photos → Claude vision transcribes → Founder reviews/edits → Interpreter maps sections to Brain → LLM extracts patterns → Aggregates into MentorProfile (same output format as journal-ingestion.ts).

**Data directories:** `sage-mentor/journal-data/transcribed/` (section JSON files), `sage-mentor/journal-data/extractions/` (raw LLM results).

### Inner Agent Authority Management

Authority levels: supervised → guided → spot_checked → autonomous → full_authority

- Supervised: 100% check rate (every action reviewed)
- Guided: 80% check rate
- Spot-checked: 40% check rate
- Autonomous: 15% check rate
- Full authority: 5% check rate (random audit)

Promotion thresholds (supervised → guided): 20+ actions, ≥70% at deliberate or above, ≤30% passion rate, ≤20% concern rate. Each subsequent level has stricter thresholds.

Demotion is protective (R6d), not punitive. Triggered by regression in performance metrics. Suspension for persistent safety concerns (consecutive concerns or emergency passion rate). Reinstatement resets to supervised.

Full audit trail: every authority change logged with evidence (total actions, principled rate, passion rate, concern rate, recent trend, thresholds met).

### Support Agent (Built — 4 April 2026)

The first inner agent to slot into the ring's gap. Handles customer support for SageReasoning using a markdown-first architecture.

**10 Operational Tools (markdown-based):**

- 5 folder-based: inbox, knowledge base, workflows, notifications, leads
- 5 built-in: ticketing, drafting, escalation, omnichannel routing, QA

**Architecture:**

- Tickets arrive as markdown files in `support/inbox/` with YAML frontmatter
- Agent searches knowledge base (`knowledge-base/` — 10 articles across 5 categories) and workflow playbooks (`workflows/` — 6 playbooks)
- Ring runs BEFORE/AFTER checks on every draft
- Governance rules R1, R2, R9 auto-detected via keyword matching → auto-escalation
- All responses include R3 disclaimer

**LLM Bridge (`llm-bridge.ts`):**

- Connects ring prompts to live Anthropic API calls
- `runLiveRingCycle()`: orchestrates full BEFORE → Draft → AFTER in one call
- Model routing: Haiku for routine checks, Sonnet for complex evaluations
- Scoring temperature: 0.2, Drafting temperature: 0.4

**Data Persistence:**

- `sync-to-supabase.ts`: Per-interaction sync after resolution + end-of-day batch sync
- 3 Supabase tables: `support_interactions`, `support_token_usage`, `support_pattern_summaries` (all with RLS)

**Semantic Memory (OpenBrain):**

- `embedding-pipeline.ts`: OpenAI text-embedding-3-small (1536 dimensions)
- Every resolved interaction embedded and stored in `mentor_raw_inputs` table (pgvector)
- `search_mentor_memory()` RPC function for semantic search across all past interactions

**Proactive Support Context:**

- Morning check-in enriched with open ticket count, escalation status
- Evening reflection includes daily resolution stats, top topics
- Weekly pattern mirror includes full support trend analysis

**Support Pattern Engine:**

- Topic recurrence, escalation trends, KB gaps, governance flag frequency
- Severity levels: INFO, ATTENTION, ACTION REQUIRED
- Recommends specific KB articles to write

### Session Bridge — Cowork ↔ Sage Mentor (Built — 4 April 2026)

The core gap identified: the founder's most consequential decisions happen in Claude Cowork sessions that the mentor cannot see. A support ticket gets a two-pass ring evaluation; the founder restructuring the entire revenue model gets nothing.

The session bridge (`session-bridge.ts`, 1,093 lines) closes this gap with three operating modes:

**Mode 1: Observer (Default)** — Batch evaluation after session ends. Exchanges classified locally (zero LLM cost), only strategic/emotional/value-conflict items trigger a single batch Haiku call. Near-zero cost per session.

**Mode 2: Consultant** — On-demand ring check mid-session via the `sage-consult` Cowork skill. Founder invokes it explicitly ("consult the mentor on this"). Captures current conversation context, runs it through the ring's 4-stage evaluation, returns inline. Cost: one Haiku or Sonnet call per consultation.

**Mode 3: Live Companion** — Parallel evaluation stream throughout the session. Evaluates each substantive exchange and streams observations to the Mentor Hub's opinion window. Auto-activates when 3+ strategic exchanges are detected within 10 minutes. Cost: ~$0.01–$0.04 per session (Haiku per classified exchange).

**Classification Gate (Zero LLM Cost):** Every exchange is classified locally before any evaluation call. Six classifications: routine (skip), informational (skip), strategic (evaluate), document production (evaluate), emotional inflection (evaluate), value conflict (evaluate). Uses keyword matching across 9 decision domains: architecture, pricing, positioning, partnership, scope, compliance, risk, document review, other. Filters 60–80% of exchanges as routine/informational.

**Supabase Persistence (2 new tables):**

- `session_decisions` — Strategic decision log with ring evaluation results (proximity assessed, passions detected, false judgements, mechanisms applied, mentor observation, journal reference). RLS enabled. Outcome tracking columns for later follow-up.
- `session_context_snapshots` — Project context snapshot at time of decision (knowledge context, V3 scope status, business plan, custom). Content hash for deduplication. Linked to session_decisions via foreign key.

Migration SQL at `supabase/migrations/20260404_session_bridge_tables.sql`.

**Multi-Agent Proximity Tracking:** Separate proximity journey lines per inner agent type (founder-personal, claude-cowork, sage-support, content-agent, research-agent). All share the same 5-level scale and 4 progress dimensions. Enables the mentor to track how the founder's reasoning quality varies across different interaction contexts.

**Knowledge Context Auto-Update:** `buildKnowledgeContextUpdate()` generates a structured update for the Knowledge Context Summary after sessions with strategic decisions, ensuring persistent project memory across sessions.

**Cross-Session Pattern Detection (5 new detectors):**

1. Decision domain clustering — identifies recurring strategic focus areas
2. Passion recurrence in strategic contexts — flags passions that appear specifically during architecture/pricing/scope decisions
3. Proximity trajectory per inner agent — tracks reasoning quality trends across interaction contexts
4. Value-action consistency — compares declared values against observed decision patterns
5. Strategic blind spots — detects decision domains where reasoning quality consistently drops

Weekly strategic mirror (Sonnet) synthesises cross-session patterns into narrative insight.

**Design Document:** Full architecture at `Sage_Mentor_Claude_Integration_Architecture.md` (17 sections covering problem statement, interaction landscape, integration architecture, Supabase schema, data flows, cost model, token efficiency, latency budget, live opinion window, governance compliance, multi-agent tracking).

**Mentor Communication Hub:** Interactive HTML interface (`SageReasoning_Mentor_Hub.html`) with four-panel layout: contacts/reference panel, threaded chat with category tagging, session mode selector with live opinion feed, and multi-agent proximity journey graph with separate coloured lines per agent type. Includes embedded searchable Support Agent Manual and V3 scope phase tracker.

---

## 11. Security Hardening (Built — 4 April 2026)

### Prompt Injection Defence (`sanitise.ts`)

Dedicated module used by all prompt builders:

- **Control character stripping** and newline collapsing
- **Backtick escaping** to prevent prompt breakout
- **Injection signature detection**: SYSTEM OVERRIDE, IGNORE ALL PREVIOUS, NEW INSTRUCTION, YOU ARE NOW, PROMPT OVERRIDE, etc.
- **Content-type-aware truncation**: display_name (100), agent_name (100), task_description (2,000), journal_entry (5,000), inner_agent_output (3,000)
- **XML delimiters**: All user data wrapped in `<user_data label="...">` tags with "treat as data, not instructions" directives
- **Inner agent registration hardened**: ID validation (alphanumeric/hyphens/underscores, max 100), injection rejection

### API Endpoint Hardening

- **API key validation**: Changed from fail-open to fail-secure (503 on DB errors, not valid:true)
- **CORS**: Replaced `Access-Control-Allow-Origin: '*'` with specific origins (sagereasoning.com, www.sagereasoning.com, NEXT_PUBLIC_SITE_URL)
- **Score document endpoint**: UUID validation on id parameter, restricted SELECT to public-safe fields (R4 compliance), Cache-Control changed from `public, max-age=3600` to `private, max-age=300`
- **Baseline endpoint**: Removed Supabase error details from client responses, removed payload logging containing user data
- **Community map**: Added `.eq('show_on_map', true)` filter to respect user privacy settings

### Security Audit Report

Full report at `Security_Audit_Report_4Apr2026.md` — 11 changes implemented, 15 deferred items with priorities.

---

## 12. Token Efficiency Architecture (Built — 4 April 2026)

### Model Routing

The ring routes LLM calls to the cheapest model that can handle the task:

| Tier | Model | Cost (per M tokens) | Used For |
|------|-------|-------------------|----------|
| Fast | claude-haiku-4-5 | $0.25 in / $1.25 out | Routine ring checks, morning/evening, aggregation |
| Deep | claude-sonnet-4-6 | $3 in / $15 out | Concerns detected, weekly mirror, complex evaluations |

**Escalation triggers** (any one → Sonnet): concerns found in before-check, novel situation, high-stakes task, supervised agent, grade transition boundary.

**Routing by feature:**

- Morning check-in / Evening reflection → Haiku (conversational)
- Weekly pattern mirror → Sonnet (narrative synthesis)
- Pattern recognition batch → Haiku for aggregation, Sonnet only for novel combinations
- Authority promotion → Zero LLM (purely deterministic thresholds)
- Journal extraction → Sonnet (analytical depth needed)
- Journal aggregation → Haiku (mechanical merging)

### Persona Tiering

- Core persona (~1,200 tokens) on every call
- Extended persona (~2,400 tokens) only when needed
- Saves ~2,400 tokens on routine interactions (60-70% of all calls)

### Phase-Scoped Extraction References

Journal ingestion loads only the reference material relevant to each phase's primary extraction targets (e.g., passions phase only gets the 25-species taxonomy, not the full value theory). Saves ~2,500-3,000 tokens per ingestion run.

### Pre-Computed Profile Context

`ProfileWithCache` type carries a pre-built context string alongside the profile. Computed once on load/update via `cacheProfileContext()`, refreshed via `refreshProfileCache()`. Eliminates redundant string assembly on every before/after check.

### Token Instrumentation

Every LLM call records: input_tokens, output_tokens, model, model_tier, estimated_cost_usd, phase, timestamp. Aggregated into `TokenUsageSummary` with breakdowns by tier and phase. Enables cost monitoring and optimisation over time.

### Prompt Caching

Anthropic's `cache_control: { type: 'ephemeral' }` on system prompts. The core persona is the same across calls within a session, so it's cached server-side by the API.

---

## 13. Regulatory Compliance Pipeline (Built — 4 April 2026)

### Architecture (Rule R14)

A machine-readable compliance system that tracks external regulatory obligations, maps them to manifest rules (R1–R13), and runs quarterly audits. Three components:

1. **Compliance Register** (`compliance_register.json`) — Authority source listing 15 regulatory obligations (CR-001 through CR-015), each with: obligation ID, mapped mandate rules, external reference, effective date, status, review cycle, actions, and review history.
2. **Audit Log** (`compliance_audit_log.json`) — Append-only record of every pipeline run. Each entry captures: regulatory changes detected, impact assessments per obligation, files reviewed, codebase compliance status, and prioritised actions for founder.
3. **Manifest Rule R14** — Meta-rule enforcing the pipeline itself. Requires the register and audit log to exist, be current, and be consulted before any work that touches regulated areas.

### Status Vocabulary

Obligations are tracked using 9 statuses: COMPLIANT, ALIGNED, MONITORING, PARTIAL, DEFERRED, PLANNED, DESIGNED, DRAFTED, NOT_APPLICABLE.

### Obligations Tracked (20 total)

| ID | Obligation | Mapped Rules | Status | Key Deadline |
|----|-----------|-------------|--------|-------------|
| CR-001 | EU AI Act — High-Risk Classification | R1, R2, R3 | MONITORING | 2 Aug 2026 |
| CR-002 | EU AI Act — Transparency (Art. 50) | R3, R4 | COMPLIANT | Effective |
| CR-003 | EU AI Act — GPAI Model Obligations | R4, R7 | NOT_APPLICABLE | Effective |
| CR-004 | Australia VAISS — 10 Guardrails | R1, R3, R9 | ALIGNED | Voluntary |
| CR-005 | Australia — Privacy Act 1988 | R1, R2 | MONITORING | 10 Dec 2026 |
| CR-006 | Australia — Consumer Law (ACL) | R3, R9 | COMPLIANT | Effective |
| CR-007 | ISO/IEC 42001 — AI Management System | R1–R13 | PARTIAL | Annual |
| CR-008 | NIST AI RMF — Risk Management | R1, R2, R3, R9 | ALIGNED | Voluntary |
| CR-009 | GDPR — Data Protection (EU users) | R1, R2 | DEFERRED | Pre-EU expansion |
| CR-010 | Financial Services — AFSL Risk | R3, R9 | MONITORING | Pre-marketplace |
| CR-011 | Professional Indemnity Insurance | R1, R3, R9 | PLANNED | Pre-launch |
| CR-012 | Cyber Insurance — Data Breach | R4 | PLANNED | Pre-launch |
| CR-013 | IP Protection — Patent Filing | R4 | PLANNED | Q2 2026 |
| CR-014 | Embedding Platform Compliance | R13 | DRAFTED | Pre-launch |
| CR-015 | Marketplace Skill Certification | R10, R12 | DESIGNED | Per-release |
| CR-020 | Session Bridge — Cowork Decision Capture | R1, R3, R6c, R6d, R9, R12 | DESIGNED | Pre-launch |
| CR-021 | Session Bridge — Data Persistence & RLS | R4, R2 | DESIGNED | Pre-launch |
| CR-022 | Session Bridge — Companion Mode Cost Controls | R9, R12 | DESIGNED | Pre-launch |
| CR-023 | Session Bridge — Sage-Consult Skill Governance | R3, R10, R12 | DESIGNED | Pre-launch |
| CR-024 | Session Bridge — Cross-Session Pattern Detection | R6c, R6d, R7 | DESIGNED | Pre-launch |

### Q2 2026 Pipeline Run (4 April 2026) — Key Findings

The first pipeline run detected 10 regulatory changes across 3 jurisdictions:

**Major Impact (2):**

- **EU Art. 6 Classification Guidelines** (Feb 2026) — Now available to assess whether the agent trust layer constitutes high-risk AI under Annex III. Profiling exemption likely applies (SageReasoning evaluates reasoning quality, not persons), but founder review required before the 2 Aug 2026 deadline. EU Digital Omnibus may extend this by up to 16 months if adopted.
- **Australian Privacy Act Automated Decision-Making** (Dec 2024 Act, effective 10 Dec 2026) — Privacy policy must be updated to disclose automated decision-making under APP 1.7 before the firm December 2026 deadline. Children's Online Privacy Code also due by that date.

**Minor Impact (4):**

- EU Art. 50 Code of Practice v2 (March 2026) — R3 disclaimer already satisfies transparency; confirm when final Code published.
- EU Digital Omnibus GDPR amendments — Legitimate interest basis for AI may simplify future GDPR compliance; proposal stage only.
- AU Children's Online Privacy Code — Age verification may need strengthening; Code not yet finalised.
- ASIC Moneysmart AI Guidance (March 2026) — Reinforces sage-invest lawyer review requirement before marketplace listing.

**No Impact (4):** ACCC 2026-27 priorities, NIST Cyber AI Profile, ISO/IEC 42001 implementation guide, VAISS status confirmation.

### Priority Actions for Founder

1. **Review EU Art. 6 classification guidelines** — Confirm agent trust layer is NOT high-risk under Annex III (deadline: 2 Aug 2026)
2. **Update privacy policy** — APP 1.7 automated decision-making transparency (deadline: 10 Dec 2026)
3. **Obtain lawyer review** of privacy policy before December 2026
4. **Monitor Children's Online Privacy Code** draft from OAIC
5. **Monitor EU Digital Omnibus** for high-risk postponement and GDPR amendments
6. **Continue sage-invest AFSL lawyer review** before marketplace listing

### Pipeline Health

- Codebase compliance status: **PASS**
- Mandate revisions proposed: **None**
- Files reviewed: 12 (security, terms, privacy, all 8 sage-mentor modules)
- Register version: **CR-2026-Q2-v3** (updated from v1 with 5 session bridge entries)
- Next scheduled run: **6 July 2026**

---

## 14. Current Status (4 April 2026)

- **V3 Adoption:** All 16 phases complete. V1 fully retired. V3 is production.
- **Agent Trust Layer:** Framework designed, 5 build priorities coded as TypeScript (offline). Schema drafted. Pending: Supabase integration, batch assessment endpoint, event stream, LLM wiring, website integration.
- **Sage Mentor Module:** 17 TypeScript files built across core mentor (9) and support agent (8) modules, plus 2 Cowork skills (sage-interpret, sage-consult). Barrel-exported via index.ts. All prompt builders sanitised. Model routing and token instrumentation in place. Profile caching implemented.
- **Support Agent:** Fully implemented and deployed (Vercel green). 10 operational tools, 10 knowledge base articles, 6 workflow playbooks, 10 test inbox items. LLM bridge live with Anthropic API. Supabase sync operational (3 tables with RLS). Semantic memory via pgvector embeddings. Proactive scheduler enriched with support context. Pattern engine detecting topic recurrence, escalation trends, and KB gaps.
- **External Journal Interpreter:** Built. Maps 12-section handwritten journal to Stoic Brain extraction targets. Transcription workflow ready (photo upload → vision transcription → founder review → interpretation). Produces same MentorProfile as standard ingestion pipeline. Cowork skill (`sage-interpret`) guides the workflow.
- **Proactive Scheduling:** Built. Morning check-in, evening reflection, weekly pattern mirror — all enriched with support operational context. Model routing: Haiku for daily, Sonnet for weekly.
- **Pattern Recognition Engine:** Built. Batch passion/value/virtue pattern analysis. Support-specific patterns: topic recurrence, escalation trends, KB gaps, governance flag frequency.
- **Authority Manager:** Built. Full lifecycle: registration, monitoring, promotion/demotion, suspension, reinstatement. Deterministic thresholds (zero LLM). Audit trail for all authority changes.
- **Security:** Audit complete. 11 critical fixes applied (prompt injection defence, API hardening, CORS, error masking, privacy filtering). 15 deferred items documented.
- **Token Efficiency:** 10 recommendations implemented (model routing, persona tiering, phase-scoped extraction, profile caching, token instrumentation, routing constants for remaining priorities).
- **Session Bridge (Cowork ↔ Sage Mentor):** Built. `session-bridge.ts` (1,093 lines) with three operating modes (observer/consultant/companion). Classification gate filters 60–80% of exchanges at zero LLM cost. Supabase migration created for `session_decisions` and `session_context_snapshots` tables (RLS on both). `sage-consult` Cowork skill created for mid-session mentor consultation. Multi-agent proximity tracking designed (separate journey lines per inner agent type). Cross-session pattern detection designed (5 new detectors + weekly strategic mirror). Design document at `Sage_Mentor_Claude_Integration_Architecture.md`.
- **Mentor Communication Hub:** Built. Interactive HTML interface (`SageReasoning_Mentor_Hub.html`) with four-panel layout: contacts/reference, threaded chat, session mode selector with live opinion feed, and multi-agent proximity journey graph. Embedded searchable Support Agent Manual. V3 scope tracker. All state persisted to localStorage.
- **Compliance Pipeline:** R14 operational. Register tracks 20 obligations (CR-001–CR-015, CR-020–CR-024) across EU AI Act, Australian Privacy/Consumer/Financial law, ISO/IEC 42001, NIST AI RMF, GDPR, and session bridge governance. Register version CR-2026-Q2-v3. First quarterly audit complete — 10 regulatory changes detected, 2 major impact items requiring founder action (EU Art. 6 classification, AU Privacy Act automated decision-making). Next run: 6 July 2026.
- **Revenue Model:** Licence changed to proprietary. Free tier tightened (1 call/day). Paid tier defined. Stripe integration pending.
- **Prompt Architecture:** Audited, simplified for model-agnostic operation, documented.
- **API Consolidation:** Option 1 approved (keep sage-reason as universal layer, consolidate candidates).
- **Documentation:** Instruction manual created (SageReasoning_Support_Agent_Manual.docx) covering all support features, journal upload process, ring architecture, authority system, and data storage.

### Remaining Build Priorities

1. **Run Session Bridge Migration** — Execute `supabase/migrations/20260404_session_bridge_tables.sql` against Supabase staging. Verify RLS policies. Test cascade deletes.
2. **Wire Session Bridge to Live Environment** — Connect `session-bridge.ts` to Anthropic API via `llm-bridge.ts`. Test `sage-consult` skill end-to-end in a Cowork session. Validate classification gate against 50 sample exchanges.
3. **Run 10 Test Interactions** through the support agent pipeline (deferred — founder reviewing manual first).
4. **Transcribe and Interpret Founder's External Journal** — Upload handwritten photos, transcribe via vision AI, interpret against Stoic Brain, build starting MentorProfile.
5. **Deferred Security Items:** .env.local in .gitignore verification, deliberation-chain auth, reasoning_receipts/patterns RLS policies.
6. **Business Plan Review:** Critical review to justify investment case before proceeding to Agent Trust Layer integration.
7. **Agent Trust Layer Integration:** Supabase tables, batch assessment endpoint, event stream, LLM wiring, website integration.
