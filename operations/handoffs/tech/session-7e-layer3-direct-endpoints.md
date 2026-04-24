# Session Close — 10 April 2026 (Session 7e)

## Decisions Made

- **Layer 3 storage: Option C (hybrid):** Static JSON baseline for identity/mission/ethics + Supabase table for dynamic state (phase, decisions, tensions). Supabase table migration prepared but not yet run — loader falls back to static defaults gracefully.
- **All 9 direct-call endpoints wired at once:** No incremental rollout. Each endpoint gets the context layers appropriate to its group per the context matrix.
- **Agent-facing endpoints: Stoic Brain only:** Confirmed no practitioner profile and no project context for assessment/foundational, assessment/full, baseline/agent.
- **Layer 3 also added to the 9 existing `runSageReason` endpoints:** Engine now accepts a `projectContext` parameter. Operational endpoints get 'condensed', mentor endpoints get 'summary'.

## Status Changes

- Layer 3 (Project Context): **Not started** → **Built and wired to all 18 endpoints**
- Direct-call endpoint context injection: **Not started** → **Built, type-checked, ready to deploy**
- `website/src/data/project-context.json`: **NEW** — static project baseline
- `website/src/lib/context/project-context.ts`: **NEW** — hybrid context loader (4 levels)
- `website/supabase-project-context-migration.sql`: **NEW** — migration for future Supabase table
- `website/src/lib/sage-reason-engine.ts`: Modified — added `projectContext` param + injection

## What Was Built

### Layer 3 — Project Context (hybrid: static + Supabase)

**Static baseline** (`project-context.json`): Identity, mission, founder context, and 4 ethical commitments (R17/R18/R19/R20). These change rarely and are available at build time with zero runtime cost.

**Dynamic defaults** (in same file, used until Supabase table exists): Current phase description, 3 active tensions, 3 recent decisions. When the Supabase `project_context` table is created and populated, the loader will read from there instead (1-hour cache).

**Loader** (`project-context.ts`): Exports `getProjectContext(level)` with 4 levels:

| Level | Content | Token budget | Used by |
|-------|---------|-------------|---------|
| `full` | Everything: identity + mission + phase + all decisions + tensions + ethics | ~500 | Sage Ops (P7) |
| `summary` | Identity + phase + recent decisions + founder role | ~250 | Mentor endpoints |
| `condensed` | Phase + recent decisions only | ~150 | Operational endpoints |
| `minimal` | Identity + ethical commitments only | ~200 | Human-facing tools |

### Direct-Call Endpoint Wiring (9 endpoints)

Each endpoint now receives context layers according to the context matrix:

| Endpoint | Group | Stoic Brain | Practitioner | Project |
|----------|-------|-------------|-------------|---------|
| `/api/reflect` | Human-facing | passion_diagnosis + oikeiosis | Condensed | Minimal |
| `/api/score-document` | Human-facing | Deep | Condensed | Minimal |
| `/api/score-scenario` (GET) | Human-facing | Quick | — | — |
| `/api/score-scenario` (POST) | Human-facing | Quick | Condensed | Minimal |
| `/api/evaluate` | Human-facing (public) | Quick | None (no auth) | Minimal |
| `/api/skill/sage-classify` | Operational | Quick | Condensed | Condensed |
| `/api/skill/sage-prioritise` | Operational | Quick | Condensed | Condensed |
| `/api/assessment/foundational` | Agent-facing | Standard | None | None |
| `/api/baseline/agent` | Agent-facing | Standard | None | None |
| `/api/assessment/full` | Agent-facing | Deep (all 4 calls) | None | None |

### Engine Layer 3 Integration (9 existing endpoints)

`ReasonInput` now accepts optional `projectContext: string | null`. When present, injected into the user message after practitioner context and before urgency context.

| Endpoint | Project Context Level |
|----------|--------------------|
| `/api/reason` | condensed |
| `/api/score` | condensed |
| `/api/score-decision` | condensed |
| `/api/score-conversation` | condensed |
| `/api/score-social` | condensed |
| `/api/guardrail` | condensed |
| `/api/mentor-baseline` | summary |
| `/api/mentor-baseline-response` | summary |
| `/api/mentor-journal-week` | summary |

## Verification Results

- TypeScript: Clean compile (`tsc --noEmit` — zero errors)
- All imports resolve correctly
- Context matrix enforcement verified via grep: correct layers per endpoint group
- **Not yet deployed** — needs `git commit` + `git push` + Vercel build

## Next Session Should

1. **Commit and push all changes** — deploy to Vercel
2. **Verify live:** Call `/api/reflect` with a daily reflection — response should reference practitioner's specific passions AND include project-aware framing
3. **Verify live:** Call `/api/evaluate` (no auth) — response should still work but without personalisation
4. **Run Supabase migration** (optional now, required before dynamic updates): Execute `supabase-project-context-migration.sql` and uncomment the Supabase read in `project-context.ts`
5. **Monitor latency:** The additional context tokens will add processing time. Measure whether the increase is acceptable across all depth levels.
6. **Update project-context.json dynamic_defaults** as decisions are made — this is manual until the Supabase table is live

## Blocked On

- Nothing. Build compiles. Ready to deploy.

## Open Questions

1. **Supabase migration timing:** Run the migration now (enabling live dynamic updates) or defer until the sage-stenographer skill automates session-close updates?
2. **Latency monitoring:** Should we add instrumented timing to compare pre/post Layer 3 latency per endpoint?
3. **score-iterate endpoint:** Listed in the original spec as a `runSageReason` endpoint but not in the 7d handoff. Need to confirm whether it's already wired or missed.

## Files Changed This Session

### New files
| File | Purpose |
|------|---------|
| `website/src/data/project-context.json` | Static project context baseline |
| `website/src/lib/context/project-context.ts` | Hybrid project context loader |
| `website/supabase-project-context-migration.sql` | Supabase migration (not yet run) |

### Modified files — Direct-call endpoints (Layer 1+2+3 wired)
| File | Layers Added |
|------|-------------|
| `website/src/app/api/reflect/route.ts` | +L1 (passion_diagnosis, oikeiosis), +L2, +L3 minimal |
| `website/src/app/api/score-document/route.ts` | +L1 (deep), +L2, +L3 minimal |
| `website/src/app/api/skill/sage-classify/route.ts` | +L1 (quick), +L2, +L3 condensed |
| `website/src/app/api/skill/sage-prioritise/route.ts` | +L1 (quick), +L2, +L3 condensed |
| `website/src/app/api/assessment/foundational/route.ts` | +L1 (standard) only |
| `website/src/app/api/score-scenario/route.ts` | +L1 (quick), +L2 (POST only), +L3 minimal (POST only) |
| `website/src/app/api/evaluate/route.ts` | +L1 (quick), +L3 minimal |
| `website/src/app/api/baseline/agent/route.ts` | +L1 (standard) only |
| `website/src/app/api/assessment/full/route.ts` | +L1 (deep, all 4 calls) only |

### Modified files — Engine + existing endpoints (Layer 3 added)
| File | Change |
|------|--------|
| `website/src/lib/sage-reason-engine.ts` | +projectContext param + user message injection |
| `website/src/app/api/reason/route.ts` | +L3 condensed |
| `website/src/app/api/score/route.ts` | +L3 condensed |
| `website/src/app/api/score-decision/route.ts` | +L3 condensed |
| `website/src/app/api/score-conversation/route.ts` | +L3 condensed |
| `website/src/app/api/score-social/route.ts` | +L3 condensed |
| `website/src/app/api/guardrail/route.ts` | +L3 condensed |
| `website/src/app/api/mentor-baseline/route.ts` | +L3 summary |
| `website/src/app/api/mentor-baseline-response/route.ts` | +L3 summary |
| `website/src/app/api/mentor-journal-week/route.ts` | +L3 summary |
