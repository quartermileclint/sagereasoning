# Session Close — 18 April 2026
## Build Enforcement & Data-Mining Implementation (Task 1 of 5)

## Decisions Made

- **Project-wide noUnusedLocals enforcement (not scoped):** Chose Option A — enforce `noUnusedLocals` and `noUnusedParameters` across the entire codebase, not just safety-critical files. Reasoning: dead code anywhere can mask integration errors. Impact: ~126 errors cleaned across 40+ files.
- **Graceful pre-commit hook (not Node.js install):** Chose Option B — hook detects missing `npx` and warns-but-allows rather than requiring Node.js on the founder's Mac. Reasoning: founder works through Cowork sandbox; Vercel build provides the hard enforcement. Impact: commits succeed locally, enforcement happens on deploy.
- **ESLint plugin registration fix:** Added `"plugins": ["@typescript-eslint"]` to `.eslintrc.json`. Root cause: creating an explicit `.eslintrc.json` activated ESLint on Vercel for the first time (previously no config existed, so Vercel skipped ESLint). The `eslint-config-next` package makes `@typescript-eslint` resolvable but doesn't load its rules. Impact: inline `eslint-disable` comments for `@typescript-eslint/no-explicit-any` now resolve correctly.

## Status Changes

| Item | Old Status | New Status |
|---|---|---|
| tsconfig.json strict flags | Designed | Verified |
| .eslintrc.json safety-critical enforcement | Did not exist | Verified |
| Husky pre-commit hook | Did not exist | Verified |
| r20a-invocation-guard.test.ts | Did not exist | Wired |
| r20a-classifier-eval.ts Zone 2 inputs | Scoped | Wired |
| operations/knowledge-gaps.md | Did not exist | Verified |
| verification-framework.md carry-forward rule | Scoped | Verified |
| Vercel build | Broken (2 red deploys) | Green |

## What Was Completed

**Task 1: Compile-Time Safety Verification** — fully done:
1. `tsconfig.json` — `noUnusedLocals: true`, `noUnusedParameters: true` enabled
2. `.eslintrc.json` — created with `next/core-web-vitals` + `@typescript-eslint` plugin + `no-unused-vars` error override on 4 safety-critical files (`guardrails.ts`, `r20a-classifier.ts`, `r20a-cost-tracker.ts`, `practitioner-context.ts`)
3. Husky pre-commit hook — two-stage check (tsc → eslint on safety files), graceful npx-missing fallback
4. `r20a-invocation-guard.test.ts` — Jest test verifying `detectDistressTwoStage` is imported, called, and awaited in all 8 human-facing POST routes
5. `r20a-classifier-eval.ts` — Group D (`CLINTON_PROFILE_ZONE2`) added with 6 Zone 2 eval inputs (shame, grief, catastrophising, interpersonal diagnosis, framework dependency, self-worth)
6. `operations/knowledge-gaps.md` — 7 knowledge gaps documented (KG1–KG7)
7. `verification-framework.md` — Knowledge Gap Carry-Forward Rule added
8. ~126 unused-code errors cleaned across 40+ files
9. 4 unescaped JSX entities fixed (`react/no-unescaped-entities`)

**Pre-implementation gaps** — all 5 remediated before Task 1 began.

## What Was NOT Completed

**Task 2: Model Selection as Compile-Time Constraint** — not started. This creates `constraints.ts` with `ModelReliabilityBoundary` types that enforce model selection requirements at compile time.

**Task 3: Safety System Synchronous Enforcement** — not started. Type guard for distress classifier ensuring synchronous execution.

**Task 4: Knowledge Gap Carry-Forward Protocol** — largely done during gap remediation (knowledge-gaps.md + verification-framework.md updated). May need a session protocol checkpoint addition — verify during Task 4 execution.

**Task 5: Zone 2 Clinical Adjacency Verification** — eval inputs written (part of Task 1). Still needs: run the eval suite against Clinton-profile inputs, document results in a safety signal audit.

## Next Session Should

1. Read `operations/knowledge-gaps.md` — check if KG1–KG7 are relevant to Task 2
2. Read `website/src/lib/r20a-classifier.ts` and `website/src/lib/guardrails.ts` — Task 3 touches these
3. Execute Task 2: Model Selection as Compile-Time Constraint
4. Execute Task 3: Safety System Synchronous Enforcement
5. Execute Task 4: Knowledge Gap Carry-Forward Protocol (verify completeness)
6. Execute Task 5: Zone 2 Clinical Adjacency Verification (run eval suite, document results)

## Blocked On

- Nothing. All prerequisites for Tasks 2–5 are in place.

## Open Questions

- None outstanding. The founder verified all Task 1 deliverables and confirmed Vercel green.

## Knowledge Gaps Encountered This Session

- **KG (new, not yet in file):** ESLint config resolution in Next.js. When no `.eslintrc.json` exists, Next.js on Vercel skips ESLint during builds. Creating one activates ESLint and surfaces all pre-existing issues. The `eslint-config-next` package monkey-patches module resolution for `@typescript-eslint/eslint-plugin` but does NOT add it to the `plugins` array — you must do that explicitly if inline disable comments reference its rules. **Re-explanation count: 1.** Add to knowledge-gaps.md if it recurs.

## Verification Evidence

```
tsc --noEmit          → exit 0 (zero errors)
eslint src/           → 0 errors, 34 warnings (all non-blocking)
eslint safety files   → exit 0 (zero errors, zero warnings)
Vercel deployment     → green
```
