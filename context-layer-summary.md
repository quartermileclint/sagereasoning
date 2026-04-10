# SageReasoning — What Everything Knows

**Date:** 10 April 2026 · Session 10  
**Status:** All 5 context layers LIVE. Product endpoints cleaned — Stoic Brain + Practitioner only. Mentor endpoints cleaned — Support Brain + Environmental Context removed.

---

## The 5 Context Layers

### Layer 1 — Stoic Brain (System Block 2)
**What it is:** The ancient Stoic philosophical framework — psychology, passions, virtue, value, action, progress, scoring. Compiled from 8 JSON source files into condensed context strings.  
**Injection:** System message block 2 (cached). Never modified at runtime.  
**Depth levels:** Quick (3 mechanisms, ~3K tokens), Standard (5 mechanisms, ~5K tokens), Deep (6 mechanisms, ~6K tokens).  
**Update pattern:** Manual only. Changes require editing `stoic-brain-compiled.ts` and redeploying. This is the sacred layer — content comes exclusively from ancient Stoic sources.  
**Wired to:** Every LLM-calling endpoint (19 endpoints).

### Layer 2 — Project Context (System Block 1 / User Message)
**What it is:** SageReasoning's identity, mission, current development phase, recent decisions, active tensions, ethical commitments, and founder role.  
**Injection:** Varies — some endpoints pass via `runSageReason` params, some inject directly.  
**Context levels:** Full (Sage Ops), Summary (Mentor endpoints), Condensed (Scoring endpoints), Minimal (Human-facing tools).  
**Update pattern:** Hybrid. Static baseline from `project-context.json` (updated at deploy). Dynamic state from Supabase `project_context` table (1-hour cache TTL). Dynamic updates happen when decisions are logged or phase changes.  
**Wired to:** 4 private mentor endpoints only (`/api/mentor/private/*`) and Sage Ops skill handlers. Removed from public mentor endpoints and all product-facing endpoints (Sessions 8-10) because external users and agent developers should not receive SageReasoning's internal project state.

### Layer 2b — Practitioner Context (User Message)
**What it is:** The authenticated user's practitioner profile data — their virtue scores, passion patterns, causal tendencies, and oikeiosis map.  
**Injection:** User message, prepended to the practitioner's input.  
**Update pattern:** Updated when the user's MentorProfile changes (via journal ingestion, baseline responses, or direct profile edits).  
**Wired to:** 14 endpoints (score, score-conversation, score-decision, score-document, score-scenario, score-social, reflect, reason, and skill handlers when user-authenticated).

### Layer 3 — Agent Brains (System Block 3)
**What it is:** Domain-specific operational expertise for each of the 4 AI agents. Each brain has 6 knowledge domains compiled into typed constants.

| Brain | Domains | Depth Quick | Depth Standard | Depth Deep |
|---|---|---|---|---|
| **Ops Brain** | Process, Financial, Compliance, Product, People, Analytics | process, financial | +compliance, product | all 6 |
| **Tech Brain** | Architecture, Security, DevOps, AI/ML Ops, Code Quality, Tooling | architecture, security | +devops, ai_ml_ops | all 6 |
| **Growth Brain** | Positioning, Audience, Content, DevRel, Community, Metrics | positioning, audience | +content, developer_relations | all 6 |
| **Support Brain** | Triage, Vulnerable Users, Philosophical Sensitivity, Escalation, Knowledge Base, Feedback Loop | triage, vulnerable_users | +philosophical_sensitivity, escalation | all 6 |

**Injection:** System message block 3 (after Stoic Brain block).  
**Update pattern:** Manual only. Changes require editing the respective `*-brain-compiled.ts` file and redeploying.  
**Wired to:** Internal agent sessions only (not wired to any endpoints):
- Support Brain → removed from mentor endpoints (reflect, mentor-baseline, mentor-baseline-response, mentor-journal-week) in Session 10. Now session-level context for Sage-Support agent only.
- Ops Brain → reserved for P7 Sage Ops pipeline activation. Session-level context for Sage-Ops agent only.
- Tech Brain → removed from product endpoints (assessment/foundational, assessment/full, baseline/agent, score-iterate) in Session 9. Session-level context for Sage-Tech agent only.
- Growth Brain → removed from product endpoints (evaluate in Session 8, score-scenario and score-document in Session 9). Session-level context for Sage-Growth agent only.

All four brains are now in identical positions: session-level context for their respective internal agent, never injected into any endpoint.

### Layer 4 — Environmental Context (User Message)
**What it is:** Non-doctrinal background information about each agent domain's external environment. Scan topics like AI regulation trends, Stoic community activity, developer ecosystem changes.  
**Injection:** User message, appended after practitioner input.  
**Domains:** ops, tech, growth, support (each gets its own feed).  
**Update pattern:** Designed for weekly automated scans. Static defaults from `environmental-context.json` until first scan runs. Dynamic updates stored in Supabase `environmental_context` table (1-hour cache TTL). Returns null (no injection) until first scan has populated data.  
**Current state:** Static defaults in place. No scan has run yet — Layer 4 is effectively silent until first scan populates Supabase.  
**Wired to:** No endpoints. Removed from mentor endpoints in Session 10. Removed from all product-facing endpoints in Sessions 8-9. Now reserved for internal agent sessions only (when environmental scans are activated in P7).

### Layer 5 — Mentor Knowledge Base (User Message)
**What it is:** Non-doctrinal background briefings for the Sage Mentor only. Two documents: (1) Stoic Historical Context — the evolution of Stoicism from ancient times to the current AI inflection point, (2) Global State of Humanity — consensus-based 2026 summary of demographics, technology, and planetary systems.  
**Injection:** User message, appended last (after all other context layers). Clearly labelled with safeguards that this does not modify the Stoic Brain.  
**Update pattern:** Manual only. Content lives in `mentor-knowledge-base.ts`. The Stoic Historical Context updates rarely (historical narrative). The Global State document should be refreshed annually or when significant global shifts occur.  
**Token budget:** ~800-1200 tokens total (both documents combined).  
**Wired to:** 4 private mentor endpoints only (`/api/mentor/private/*`). Removed from public mentor endpoints in Session 10.

---

## Endpoint Context Matrix

### Private Mentor Endpoints (Founder Only — Full Context)

Route-level split implemented in Session 10. Private routes at `/api/mentor/private/*` are restricted to the founder (`FOUNDER_USER_ID` env var). They receive L1 Stoic Brain, L2 Project Context, L2b Full Practitioner Profile (~7,500 chars, not the condensed ~300-500 token version), and L5 Mentor Knowledge Base.

| Endpoint | L1 Stoic | L2 Project | L2b Practitioner | L5 Mentor KB |
|---|---|---|---|---|
| mentor/private/reflect | deep (mechanisms) | minimal | full | yes |
| mentor/private/baseline | deep | summary | (input) | yes |
| mentor/private/baseline-response | deep | summary | (loaded) | yes |
| mentor/private/journal-week | deep | summary | (input) | yes |

### Public Mentor Endpoints (All Users — Stoic Brain + Condensed Practitioner)

Public routes at the original paths (`/api/reflect`, `/api/mentor-baseline`, etc.) are available to any authenticated user. They receive L1 Stoic Brain and L2b Condensed Practitioner Context only. No project context, no L5, no agent brains, no environmental context.

| Endpoint | L1 Stoic | L2b Practitioner | Notes |
|---|---|---|---|
| reflect | deep (mechanisms) | condensed | |
| mentor-baseline | deep | (input) | Profile summary passed by caller |
| mentor-baseline-response | deep | (loaded) | Profile loaded from Supabase |
| mentor-journal-week | deep | (input) | Profile summary passed by caller |

### Product-Facing Endpoints (Stoic Brain + Practitioner only)

All product endpoints — human-facing and agent-facing — receive only L1 Stoic Brain and L2b Practitioner Context. No agent brains, no project context, no environmental context. This makes them portable for any customer's content.

| Endpoint | L1 Stoic | L2b Practitioner | Notes |
|---|---|---|---|
| score | standard | yes | |
| score-conversation | deep | yes | |
| score-decision | standard | yes | |
| score-social | standard | yes | |
| reason | variable | yes | |
| guardrail | variable | — | |
| evaluate | quick | — | Cleaned Session 8 |
| score-document | deep | yes | Cleaned Session 9 |
| score-scenario | quick | yes | Cleaned Session 9 |
| score-iterate | standard | — | Agent-facing. Cleaned Session 9 |
| assessment/foundational | standard | — | Agent-facing. Cleaned Session 9 |
| assessment/full | deep | — | Agent-facing. Cleaned Session 9 |
| baseline/agent | standard | — | Agent-facing. Cleaned Session 9 |

### Non-LLM Endpoints (no context layers)

32 endpoints handle data storage, retrieval, billing, admin, health checks, webhooks, and static discovery (stoic-brain JSON, skills registry, marketplace). These don't call LLMs and receive no context layers.

---

## When Data Updates

| Layer | Update Trigger | Frequency | Mechanism |
|---|---|---|---|
| **L1 Stoic Brain** | Manual edit + deploy | Rarely (content is ancient) | Edit `stoic-brain-compiled.ts` → Vercel deploy |
| **L2 Project Context** | Decision log + phase change | As needed | Static: edit JSON + deploy. Dynamic: write to Supabase `project_context` table |
| **L2b Practitioner** | Journal ingestion, baseline responses, profile edits | Per-user, ongoing | MentorProfile stored in Supabase (encrypted) |
| **L3 Agent Brains** | Manual edit + deploy | Infrequently (expertise evolves slowly) | Edit `*-brain-compiled.ts` → Vercel deploy |
| **L4 Environmental** | Scheduled weekly scan | Weekly (designed), currently inactive | Scan task writes to Supabase `environmental_context` table. 1-hour cache. |
| **L5 Mentor KB** | Manual edit + deploy | Annually or on significant shifts | Edit `mentor-knowledge-base.ts` → Vercel deploy |

---

## Safeguard Architecture

The layer system enforces strict contamination boundaries:

- **System message blocks** (L1 + L3): Stoic Brain and Agent Brains. These define what the agent IS. Cached by the LLM provider for efficiency.
- **User message** (L2b + L4 + L5): Practitioner data, environmental scans, and mentor briefings. These inform what the agent CONSIDERS. Never elevated to system-level authority.
- **Non-doctrinal labelling** (L4, L5): Every environmental and knowledge base injection includes explicit safeguard text stating it does not modify expertise, principles, or the Stoic Brain.
- **Layer 5 is private-mentor-only**: The historical and global briefings are wired exclusively to the 4 private mentor endpoints (`/api/mentor/private/*`). Public mentor endpoints and product-facing tools never receive this context.

---

## Internal Agent Orchestration (Session 10)

All 4 internal Sage agents (Ops, Tech, Growth, Support) follow a unified 7-step pipeline implemented in `sage-orchestrator/` (standalone module at project root).

**The pipeline:**

1. **Agent triggered** — with agent type ('ops' | 'tech' | 'growth' | 'support')
2. **Context loaded** — the agent's brain at the configured depth
3. **Internal reasoning** — domain-specific work using brain expertise
4. **Stoic evaluation** — calls a clean product endpoint (`/api/reason`, `/api/score`, etc.)
5. **Output routing** — 5A: saged output passes through; 5B: external tool output → Stoic review via `/api/guardrail`
6. **Decision authority gate** — flags actions needing founder approval (spending, publishing, external comms, irreversible changes, security changes). R5 cost alerts fire independently.
7. **Handoff** — deliver result with full pipeline metadata

**Key design principle:** The only thing that varies per agent is which brain is loaded and which product endpoints it typically calls. The governance structure is identical. One orchestration pattern, "which brain" as a parameter.

**Agent brains are session-level context only.** They are never injected into product endpoints (cleaned in Sessions 8-10). They load into the agent's session via the orchestrator's `BrainLoader` interface.

**ATL authority levels apply to external agents only.** Internal agents don't need authority progression because the Stoic Brain is applied to every action through the pipeline. The decision authority gate exists because the founder makes irreplaceable decisions, not because the agents are untrusted.

**Product implication:** Customer agents (startup package) use the same `runAgentPipeline()` function with their own brains, decision gate configs, and reasoning functions. The orchestration IS the product.

**Module structure:**

| File | Purpose |
|---|---|
| `sage-orchestrator/types.ts` | All type definitions (agent types, pipeline I/O, gate config) |
| `sage-orchestrator/pipeline.ts` | Pipeline runner, decision gate, 5B router, cost tracking |
| `sage-orchestrator/presets.ts` | Preset configs for the 4 internal agents + BrainLoader adapter |
| `sage-orchestrator/index.ts` | Public API exports |
