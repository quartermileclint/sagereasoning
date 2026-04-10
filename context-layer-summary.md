# SageReasoning — What Everything Knows

**Date:** 10 April 2026 · Session 7h  
**Status:** All 5 context layers LIVE and wired

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
**Wired to:** 16 endpoints (mentor endpoints, evaluate, score-document, score-scenario, agent assessment, and skill handlers). Removed from the 6 product-facing scoring endpoints (score, score-conversation, score-decision, score-social, reason, guardrail) because external users should not receive SageReasoning's internal project state.

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
**Wired to:** 16 endpoints total:
- Tech Brain → assessment/foundational, assessment/full, baseline/agent, score-iterate (4 endpoints)
- Growth Brain → evaluate, score-scenario, score-document (3 endpoints)
- Support Brain → reflect, mentor-baseline, mentor-baseline-response, mentor-journal-week (4 endpoints)
- Ops Brain → reserved for P7 Sage Ops pipeline activation (not yet wired to endpoints)

### Layer 4 — Environmental Context (User Message)
**What it is:** Non-doctrinal background information about each agent domain's external environment. Scan topics like AI regulation trends, Stoic community activity, developer ecosystem changes.  
**Injection:** User message, appended after practitioner input.  
**Domains:** ops, tech, growth, support (each gets its own feed).  
**Update pattern:** Designed for weekly automated scans. Static defaults from `environmental-context.json` until first scan runs. Dynamic updates stored in Supabase `environmental_context` table (1-hour cache TTL). Returns null (no injection) until first scan has populated data.  
**Current state:** Static defaults in place. No scan has run yet — Layer 4 is effectively silent until first scan populates Supabase.  
**Wired to:** 14 endpoints (all endpoints that have an agent brain also get the matching environmental feed).

### Layer 5 — Mentor Knowledge Base (User Message)
**What it is:** Non-doctrinal background briefings for the Sage Mentor only. Two documents: (1) Stoic Historical Context — the evolution of Stoicism from ancient times to the current AI inflection point, (2) Global State of Humanity — consensus-based 2026 summary of demographics, technology, and planetary systems.  
**Injection:** User message, appended last (after all other context layers). Clearly labelled with safeguards that this does not modify the Stoic Brain.  
**Update pattern:** Manual only. Content lives in `mentor-knowledge-base.ts`. The Stoic Historical Context updates rarely (historical narrative). The Global State document should be refreshed annually or when significant global shifts occur.  
**Token budget:** ~800-1200 tokens total (both documents combined).  
**Wired to:** 4 private mentor endpoints only (reflect, mentor-baseline, mentor-baseline-response, mentor-journal-week).

---

## Endpoint Context Matrix

### Private Mentor Endpoints (all layers)

| Endpoint | L1 Stoic | L2 Project | L2b Practitioner | L3 Brain | L4 Env | L5 Mentor KB |
|---|---|---|---|---|---|---|
| reflect | deep | minimal | yes | Support (std) | support | yes |
| mentor-baseline | deep | summary | — | Support (quick) | support | yes |
| mentor-baseline-response | deep | summary | — | Support (quick) | support | yes |
| mentor-journal-week | deep | summary | — | Support (quick) | support | yes |

### Agent Assessment Endpoints (Tech Brain)

| Endpoint | L1 Stoic | L2 Project | L2b | L3 Brain | L4 Env | L5 |
|---|---|---|---|---|---|---|
| assessment/foundational | standard | — | — | Tech (std) | tech | — |
| assessment/full | deep | — | — | Tech (deep) | tech | — |
| baseline/agent | standard | — | — | Tech (std) | tech | — |
| score-iterate | standard | — | — | Tech (quick) | tech | — |

### Growth-Facing Endpoints (Growth Brain)

| Endpoint | L1 Stoic | L2 Project | L2b | L3 Brain | L4 Env | L5 |
|---|---|---|---|---|---|---|
| evaluate | quick | minimal | — | Growth (quick) | growth | — |
| score-scenario | quick | minimal | yes | Growth (quick) | growth | — |
| score-document | deep | minimal | yes | Growth (quick) | growth | — |

### Scoring Suite (Product-Facing — Stoic Brain + Practitioner only)

These are external product endpoints serving users and agent developers. They receive no internal project context — reasoning is grounded purely in the Stoic Brain and the user's own practitioner profile.

| Endpoint | L1 Stoic | L2 Project | L2b | L3 Brain | L4 Env | L5 |
|---|---|---|---|---|---|---|
| score | standard | — | yes | — | — | — |
| score-conversation | deep | — | yes | — | — | — |
| score-decision | standard | — | yes | — | — | — |
| score-social | standard | — | yes | — | — | — |
| reason | variable | — | yes | — | — | — |
| guardrail | variable | — | — | — | — | — |

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
- **Layer 5 is mentor-only**: The historical and global briefings are wired exclusively to the 4 private mentor endpoints. Public-facing tools never receive this context.
