# Session Close — 10 April 2026 (Session 7h)

## Decisions Made

- **Three agent brains built and wired.** Sage-Tech, Sage-Growth, and Sage-Support Brains follow the exact Ops Brain pattern: compiled TS constants (6 domains + foundations with Stoic virtue parallels) → domain-specific loaders → composite builder with 3 depth levels.
- **Multi-brain injection pattern confirmed working.** Block 1 (endpoint prompt, cached) → Block 2 (Stoic Brain) → Block 3 (agent brain). Environmental context in user message. No changes to Stoic Brain.
- **sage-reason-engine extended.** New `agentBrainContext` and `environmentalContext` parameters added to `ReasonInput` interface. Injected as Block 3 system message and user message appendage respectively. All 3 mentor endpoints (mentor-baseline, mentor-baseline-response, mentor-journal-week) use this path.
- **Environmental context wired to all 11 new endpoints.** Tech domain for agent-facing endpoints, Growth domain for public-facing endpoints, Support domain for human-facing endpoints.

## Status Changes

- Sage-Tech Brain: **Did not exist** → **Wired (4 endpoints)**
- Sage-Growth Brain: **Did not exist** → **Wired (3 endpoints)**
- Sage-Support Brain: **Did not exist** → **Wired (4 endpoints)**
- sage-reason-engine.ts: **2-block system** → **3-block system (agentBrainContext param)**
- 11 endpoints: **Stoic Brain only** → **Stoic Brain + Agent Brain + Environmental Context**

## What Was Built

### New Files (6)

| File | Purpose | Lines |
|------|---------|-------|
| `website/src/data/tech-brain-compiled.ts` | Tech Brain data — 6 domains + foundations | ~250 |
| `website/src/lib/context/tech-brain-loader.ts` | Tech Brain loader — domain builders + depth composite | ~240 |
| `website/src/data/growth-brain-compiled.ts` | Growth Brain data — 6 domains + foundations | ~250 |
| `website/src/lib/context/growth-brain-loader.ts` | Growth Brain loader — domain builders + depth composite | ~240 |
| `website/src/data/support-brain-compiled.ts` | Support Brain data — 6 domains + foundations | ~280 |
| `website/src/lib/context/support-brain-loader.ts` | Support Brain loader — domain builders + depth composite | ~240 |

### Modified Files (12)

| File | Change |
|------|--------|
| `website/src/lib/sage-reason-engine.ts` | +agentBrainContext (Block 3) + environmentalContext (user message) params |
| `website/src/app/api/assessment/foundational/route.ts` | +Tech Brain (standard) + environmental context (tech) |
| `website/src/app/api/assessment/full/route.ts` | +Tech Brain (deep) + environmental context (tech) — all 4 LLM calls |
| `website/src/app/api/baseline/agent/route.ts` | +Tech Brain (standard) + environmental context (tech) |
| `website/src/app/api/score-iterate/route.ts` | +Tech Brain (quick) + environmental context (tech) — both modes |
| `website/src/app/api/evaluate/route.ts` | +Growth Brain (quick) + environmental context (growth) |
| `website/src/app/api/score-scenario/route.ts` | +Growth Brain (quick) + environmental context (growth) — GET and POST |
| `website/src/app/api/score-document/route.ts` | +Growth Brain (quick) + environmental context (growth) |
| `website/src/app/api/reflect/route.ts` | +Support Brain (standard) + environmental context (support) |
| `website/src/app/api/mentor-baseline/route.ts` | +Support Brain (quick) via runSageReason + environmental context (support) |
| `website/src/app/api/mentor-baseline-response/route.ts` | +Support Brain (quick) via runSageReason + environmental context (support) |
| `website/src/app/api/mentor-journal-week/route.ts` | +Support Brain (quick) via runSageReason + environmental context (support) |

### Brain Domain Structure

| Brain | quick (2) | standard (+2) | deep (+2) |
|-------|-----------|---------------|-----------|
| **Tech** | architecture, security | +devops, ai_ml_ops | +code_quality, tooling |
| **Growth** | positioning, audience | +content, developer_relations | +community, metrics |
| **Support** | triage, vulnerable_users | +philosophical_sensitivity, escalation | +knowledge_base, feedback_loop |

### Brain-to-Virtue Parallels

| Brain | Wisdom (phronesis) | Courage (andreia) | Justice (dikaiosyne) | Temperance (sophrosyne) |
|-------|-------------------|-------------------|---------------------|------------------------|
| **Ops** | Efficiency Judgement | (in Fair Scaling) | Fair Scaling | Resource Control |
| **Tech** | Architectural Clarity | Security Discipline | Operational Reliability | Technical Restraint |
| **Growth** | Honest Positioning | Visible Courage | Audience Empathy | Patient Growth |
| **Support** | Philosophical Care | Emotional Steadiness | User Safety | Measured Response |

## Updated Context Matrix (all 19 endpoints)

| Endpoint | Stoic Brain | Ops Brain | Tech Brain | Growth Brain | Support Brain | Env Domain |
|----------|-------------|-----------|------------|--------------|---------------|------------|
| sage-classify | Quick | Quick | — | — | — | ops |
| sage-prioritise | Quick | Quick | — | — | — | ops |
| assessment/foundational (POST) | Standard | — | **Standard** | — | — | **tech** |
| assessment/full (POST) | Deep | — | **Deep** | — | — | **tech** |
| baseline/agent (POST) | Standard | — | **Standard** | — | — | **tech** |
| score-iterate (POST) | Standard | — | **Quick** | — | — | **tech** |
| evaluate (POST) | Quick | — | — | **Quick** | — | **growth** |
| score-scenario (GET+POST) | Quick | — | — | **Quick** | — | **growth** |
| score-document (POST) | Deep | — | — | **Quick** | — | **growth** |
| reflect (POST) | Mechanisms | — | — | — | **Standard** | **support** |
| mentor-baseline (POST) | Deep | — | — | — | **Quick** | **support** |
| mentor-baseline-response (POST) | Deep | — | — | — | **Quick** | **support** |
| mentor-journal-week (POST) | Deep | — | — | — | **Quick** | **support** |
| reason (POST) | Per-depth | — | — | — | — | — |
| score (POST) | Quick | — | — | — | — | — |
| deliberation-chain (GET) | — | — | — | — | — | — |
| badge (GET) | — | — | — | — | — | — |
| agent-assessment framework | — | — | — | — | — | — |
| mentor-profile | — | — | — | — | — | — |

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compile (`npx tsc --noEmit`) | ✅ Clean — exit code 0, zero errors |
| Stoic Brain untouched | ✅ No changes to stoic-brain-compiled.ts or stoic-brain-loader.ts |
| Brain export pattern matches Ops Brain | ✅ All 3 follow identical structure |
| Environmental context in user message only | ✅ Confirmed in all 11 endpoints |
| Agent brain in system Block 3 only | ✅ Confirmed — never concatenated with Stoic Brain |
| Git commit | ✅ 9c9f03e — 18 files, 1853 insertions, 9 deletions |
| Git push | ⏳ Needs manual push from local machine (auth not available in session) |

## Next Session Should

1. **Push the commit** — `git push` from local machine. Verify Vercel deploys green.
2. **Live-test one endpoint per brain** — e.g., hit /api/evaluate and confirm Growth Brain context appears in reasoning, hit /api/reflect and confirm Support Brain awareness.
3. **Monitor token usage** — the additional Block 3 adds ~400-1500 tokens per call depending on depth. Check that latency and costs remain acceptable.
4. **Consider brain router (future).** When endpoints need multiple brains dynamically, a routing layer will be needed. Not needed now — static assignment works.

## Blocked On

- Git push (needs GitHub auth from local machine)

## Open Questions

1. **Token budget impact at scale.** Adding a third system block increases input tokens. At quick depth (~400-800 tokens per brain), the impact is modest. At deep depth (~5000 tokens), it's more significant. Monitor during testing.
2. **Should /api/reason get a brain?** Currently it has no agent brain — only Stoic Brain. It's the general-purpose reasoning engine. May benefit from Tech Brain for technical inputs or Growth Brain for positioning inputs. Needs a routing decision.
3. **Brain overlap.** Some endpoints could arguably benefit from multiple brains (e.g., /api/reflect benefits from Support Brain AND could benefit from Growth Brain for tone awareness). Current architecture supports one brain per endpoint. Multi-brain per endpoint is possible but increases token cost.

## Architecture Reference — Full Context Stack (Updated)

```
For a triple-context endpoint (e.g., reflect):

SYSTEM MESSAGES (expertise — how to reason):
  Block 1: Endpoint-specific prompt          [cached, per-endpoint]
  Block 2: Stoic Brain (quick/standard/deep) [SACRED — ancient texts only]
  Block 3: Agent Brain (quick/standard/deep) [domain expertise — tech/growth/support/ops]

USER MESSAGE (information — what to reason about):
  + Input/action being evaluated
  + Practitioner context                     [Layer 2 — from Supabase, authed endpoints only]
  + Project context                          [Layer 3 — from Supabase, current phase/decisions]
  + Environmental context                    [Layer 4 — from Supabase, weekly scan data, non-doctrinal]
```
