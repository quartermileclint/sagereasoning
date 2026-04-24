# Session Close — 16 April 2026

## Session Purpose
Phase 3 (Layer 3 — Project Context injection) of the P0 Foundations build. Write the project context compiled constant, count tokens, verify ceilings, decide endpoint scope, wire all endpoints.

## Decisions Made

### 1. All 14+ runSageReason endpoints receive Layer 3
**Reasoning:** Layer 3 (project context) provides situational awareness at minimal token cost. No endpoint benefits from operating in ignorance of the project's identity and ethical commitments.
**Impact:** Every LLM call now includes project context. Token overhead: 33-224 tokens depending on level.

### 2. Context level mapping by endpoint group
| Group | Level | Tokens | Endpoints |
|---|---|---|---|
| Core API (external) | `condensed` | ~104 | reason, score, score-decision, score-document, score-conversation, score-social, score-iterate, score-scenario |
| Guardrail (agent-facing) | `minimal` | ~149 | guardrail |
| Mentor (public) | `summary` | ~224 | mentor-baseline, mentor-baseline-response, mentor-journal-week |
| Mentor (private) | `summary` | ~224 | mentor/private/baseline, baseline-response, journal-week, reflect (private) |
| Reflect (public) | `minimal` | ~149 | reflect |
| Founder hub | `summary` | ~224 | founder/hub (manually injected, not via engine param) |
| Context template skills | `condensed` | ~104 | sage-classify, sage-prioritise (others use context-template factory) |

### 3. cache_control: ephemeral NOT applicable to Layer 3
**Reasoning:** Project context is injected into the user message (not system message). Anthropic's `cache_control: ephemeral` is a system message directive. The Stoic Brain gets cache_control because it's static and goes in a system block. Project context goes in the user message because it can change per-request (Supabase dynamic state).
**Impact:** No cache savings on Layer 3 specifically, but Layer 1 (Stoic Brain) cache savings still apply.

### 4. Core positioning statement
**Decision:** Written as `PROJECT_IDENTITY.positioning` in the compiled constant:
> "The only reasoning API grounded in 2,300 years of Stoic philosophy. Not sentiment analysis. Not ethics scoring. Principled reasoning from primary sources — Marcus Aurelius, Epictetus, Seneca, Cicero."

### 5. llms.txt and agent-card.json already exist
**Finding:** Both files are comprehensive and live. llms.txt v3.0 (April 2026) covers all endpoints with examples. agent-card.json covers 9 capabilities with authentication, rate limits, and quickStart. No placeholder creation needed.
**Impact:** Task scope narrowed. These files may need updating when new endpoints are added.

## Status Changes

| Module/Artefact | Old Status | New Status |
|---|---|---|
| project-context-compiled.ts | Did not exist | **Scaffolded** (constants written, not yet consumed by loader) |
| Layer 3 (project context injection) | Designed (loader + engine param existed) | **Wired** (all endpoints now pass context) |
| mentor-baseline → L3 | Not wired | **Wired** (summary) |
| mentor-baseline-response → L3 | Not wired | **Wired** (summary) |
| mentor-journal-week → L3 | Not wired | **Wired** (summary) |
| reflect → L3 | Not wired | **Wired** (minimal) |
| llms.txt | Already live | **Verified** current |
| agent-card.json | Already live | **Verified** current |
| Analytics baseline | Already live | **Verified** — 16+ event types, privacy-preserving IP hash, Supabase storage |

## Token Budget Verification Results

All depths well within ceilings:

| Depth | Total (no Agent Brain) | Total (with Agent Brain) | Ceiling |
|---|---|---|---|
| Quick | ~1466 | ~1466 | ~2000 |
| Standard | ~1896 | ~2246 | ~4000 |
| Deep | ~2278 | ~2628 | ~6000 |

Headroom: Quick has 534 tokens spare. Standard has 1754. Deep has 3372. No trimmed quick variant needed.

## Next Session Should

1. **Update project-context.ts to consume project-context-compiled.ts** — Currently the loader reads from project-context.json. The compiled constants file exists but isn't imported by the loader yet. Wire the import and decide whether to deprecate the JSON file or keep both (JSON for Supabase dynamic state, compiled TS for static baseline).
2. **Deploy and verify** — Push to Vercel, test that the 4 newly wired endpoints include project context in their LLM calls. Verification: make a test call to /api/reflect and confirm the response quality reflects situational awareness.
3. **Update the context-template factory** — The `createContextTemplateHandler` function in context-template.ts may be used by the 15+ skill endpoints (sage-premortem, sage-negotiate, etc.). Check whether those endpoints also need Layer 3 wiring via the factory.
4. **Update llms.txt and agent-card.json** — If new endpoints or capabilities were added, refresh these files.

## Blocked On

- Nothing blocked. All code changes are additive.

## Open Questions

1. **Should project-context-compiled.ts replace project-context.json?** The compiled TS gives type safety and `as const`. The JSON gives Supabase dynamic state. Likely answer: both — JSON for dynamic, compiled TS for static baseline imported at build time. But the loader currently only uses the JSON.
2. **Context-template factory endpoints** — The 15 skill endpoints (sage-premortem through sage-moderate) use `createContextTemplateHandler`. Do they get Layer 3 through the factory pattern, or individually? Need to check the factory code.
3. **Analytics "evaluate demo" tracking** — The analytics infrastructure tracks 16+ event types but there's no specific `evaluate_demo` event for the public demo flow. If this matters for P0 hold point metrics, it needs adding.
