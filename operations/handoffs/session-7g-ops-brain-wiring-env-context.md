# Session Close — 10 April 2026 (Session 7g)

## Decisions Made

- **Stoic Brain is sacred ground.** The Stoic Brain must remain confined to ancient texts only. No environmental data, no industry trends, no project status may touch it. Everything else layers around it as clearly bounded meta. This is a permanent architectural constraint.
- **Ops Brain wired to sage-classify and sage-prioritise.** Injected as third system message block (after endpoint prompt and Stoic Brain). Quick depth. Stoic Brain untouched in its own block.
- **Layer 4 Environmental Context adopted.** New context layer providing non-doctrinal background information per agent domain. Clearly labelled: "does not modify expertise, principles, or project commitments." Injected in user message (not system blocks) — information to reason *about*, not expertise to reason *with*.
- **Environmental context built for all four agent domains from day one:** ops, tech, growth, support. Architecture is ready even though Tech, Growth, and Support brains don't exist yet.
- **Supabase migrations run for both Layer 3 and Layer 4.** Both loaders now read live from database with 1-hour cache and fallback to static defaults.
- **Weekly environmental scan scheduled.** Runs Monday 7:05 AM AEST. First scan completed — all four domains populated with real data.
- **Multi-brain injection pattern decided:** Separate system message blocks per brain. Block 1 = endpoint prompt (cached), Block 2 = Stoic Brain, Block 3 = agent-specific brain. Environmental context goes in user message alongside practitioner and project context.

## Status Changes

- Sage-Ops Brain: **Built (type-checked)** → **Wired (sage-classify, sage-prioritise)**
- Layer 4 Environmental Context: **Did not exist** → **Live (all 4 domains, Supabase-backed, weekly scan active)**
- Layer 3 Project Context: **Static JSON only** → **Live Supabase reads (with static fallback)**
- sage-classify: **Stoic Brain only** → **Stoic Brain + Ops Brain + Environmental Context**
- sage-prioritise: **Stoic Brain only** → **Stoic Brain + Ops Brain + Environmental Context**

## What Was Built

### Ops Brain Wiring (sage-classify, sage-prioritise)
Both endpoints now receive:
- System block 1: Endpoint-specific prompt (cached)
- System block 2: Stoic Brain (quick depth) — ancient texts only
- System block 3: Ops Brain (quick depth) — process + financial domains
- User message: practitioner context + project context + environmental context (ops domain)

### Layer 4 Environmental Context Architecture
- **Data file:** `website/src/data/environmental-context.json` — 4 domains with scan topics and current summaries
- **Loader:** `website/src/lib/context/environmental-context.ts` — per-domain loader, Supabase-backed, 1-hour cache, returns null until first scan
- **Migration:** `website/supabase-environmental-context-migration.sql` — RUN (table live in Supabase)
- **Scheduled task:** `weekly-environmental-scan` — Mondays 7:05 AM AEST, searches all 4 domains

### Supabase Activation
- `project-context.ts` — uncommented Supabase read block, import activated
- `environmental-context.ts` — uncommented Supabase read block, import activated
- Both migrations run successfully

### First Environmental Scan Data (populated 10 April 2026)
- **Ops:** $300B Q1 2026 funding, 42% AI valuation premium, solo founder economics ($3-12K/year AI stack), AU Privacy Act reforms Dec 2026
- **Tech:** Claude Managed Agents beta, 1M context window retirement April 30, Next.js security CVEs, LLM costs 1/100th of 2023
- **Growth:** Stoic content up 400%, no competitor in virtue ethics + agent assessment niche, AI agent ecosystem $600B+, A2A protocol maturity
- **Support:** Rising AI therapy regulation, WCAG 2.2 adoption, AI incident reporting landscape

## Live Verification Results

| Test | Endpoint | Result |
|------|----------|--------|
| Test 1: Public evaluation | `/api/evaluate` (POST) | ✅ Layer 1 confirmed — full Stoic reasoning with Greek terms, oikeiosis mapping, Cicero framework |
| Test 2: Agent-facing GET | `/api/assessment/foundational` (GET) | ✅ Live — returns 14-assessment framework across 2 phases |
| Test 3: Personalised reflect | `/api/reflect` (POST) | ⏭ Skipped — auth token extraction failed in browser console |

## Updated Context Matrix (operational endpoints)

| Endpoint | Stoic Brain | Ops Brain | Practitioner | Project | Environmental |
|----------|-------------|-----------|-------------|---------|---------------|
| sage-classify | Quick | **Quick (NEW)** | Condensed | Condensed | **Ops (NEW)** |
| sage-prioritise | Quick | **Quick (NEW)** | Condensed | Condensed | **Ops (NEW)** |

All other 17 endpoints unchanged from 7f matrix.

## Next Session Should

1. **Build Sage-Tech Brain** — compiled TS data + loader, following exact Ops Brain pattern. 6 domains: architecture, security, devops, ai_ml_ops, code_quality, tooling.
2. **Build Sage-Growth Brain** — compiled TS data + loader. 6 domains: positioning, audience, content, developer_relations, community, metrics.
3. **Build Sage-Support Brain** — compiled TS data + loader. 6 domains: triage, vulnerable_users, philosophical_sensitivity, escalation, knowledge_base, feedback_loop.
4. **Wire each brain to its relevant endpoints** — Tech Brain to assessment/full, baseline/agent, score-iterate. Growth Brain to evaluate (public-facing). Support Brain to reflect, mentor endpoints. The exact endpoint mapping should be decided during building based on what each endpoint does.
5. **TypeScript compile check + commit + push after each brain.**

## Blocked On

- Nothing. Ready to build.

## Open Questions

1. **Endpoint-to-brain mapping for new brains.** The Ops Brain maps cleanly to operational endpoints. The other three brains need endpoint assignments decided during building — which endpoints benefit from Tech expertise? Which from Growth? Which from Support? The context matrix from 7f (in the handoff) shows the endpoint classifications (engine, human-facing, operational, agent-facing) which should guide this.
2. **Token budget impact.** Adding a third system block per endpoint increases input tokens. At quick depth (~1500 tokens per brain), the impact is modest. Monitor during testing.
3. **Brain router (future).** When endpoints need to dynamically select which brain(s) to load based on request content, we'll need a routing layer. Not needed yet — current static assignment works for the brains we have.

## Files Changed This Session

### New files
| File | Purpose |
|------|---------|
| `website/src/data/environmental-context.json` | Layer 4 data — scan topics + summaries for 4 agent domains |
| `website/src/lib/context/environmental-context.ts` | Layer 4 loader — per-domain, Supabase-backed, 1-hour cache |
| `website/supabase-environmental-context-migration.sql` | Supabase table for environmental context |
| `operations/handoffs/session-7g-ops-brain-wiring-env-context.md` | This handoff |

### Modified files
| File | Change |
|------|--------|
| `website/src/app/api/skill/sage-classify/route.ts` | +Ops Brain (system block 3) + environmental context (user message) |
| `website/src/app/api/skill/sage-prioritise/route.ts` | +Ops Brain (system block 3) + environmental context (user message) |
| `website/src/lib/context/project-context.ts` | Activated Supabase import + uncommented live read block |
| `website/src/lib/context/environmental-context.ts` | Activated Supabase import + uncommented live read block |

## Architecture Reference — Full Context Stack

```
For a dual-brain endpoint (e.g., sage-classify):

SYSTEM MESSAGES (expertise — how to reason):
  Block 1: Endpoint-specific prompt          [cached, per-endpoint]
  Block 2: Stoic Brain (quick/standard/deep) [SACRED — ancient texts only, never contaminated]
  Block 3: Agent Brain (quick/standard/deep) [domain expertise — ops/tech/growth/support]

USER MESSAGE (information — what to reason about):
  + Practitioner context                     [Layer 2 — from Supabase, authed endpoints only]
  + Project context                          [Layer 3 — from Supabase, current phase/decisions]
  + Environmental context                    [Layer 4 — from Supabase, weekly scan data, non-doctrinal]
```

## Key Architectural Constraints (for next session)

1. **Stoic Brain is NEVER modified.** Ancient texts only. No environmental data, no industry trends, no project status.
2. **Each brain gets its own system message block.** Never concatenate brains. Never inject environmental data into system blocks.
3. **Environmental context is non-doctrinal.** Always labelled: "does not modify expertise, principles, or project commitments." Always in user message, never in system blocks.
4. **Follow the Ops Brain pattern exactly.** Compiled TS constants → domain-specific loaders → composite builder by depth (quick/standard/deep). Foundations section with Stoic parallels. Export `get[Brain]Context(depth)` and `get[Brain]ContextForDomains(domains)`.
5. **Each brain has 6 domains.** This matches the Ops Brain structure. Domains are loaded selectively by depth level: quick = 2 domains, standard = 4 domains, deep = 6 domains.
