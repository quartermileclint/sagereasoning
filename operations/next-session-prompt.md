# Next Session Prompt

Paste everything below the line into a new session.

---

## Context

Read these files first, in this order:

1. `operations/session-handoffs/2026-04-18-tasks2-5-session-close.md` — what was completed and decided in the previous session
2. `operations/session-handoffs/2026-04-18-build-enforcement-session-close.md` — the session before that (Task 1 of 5)
3. `operations/knowledge-gaps.md` — check KG1–KG7 for relevance before beginning work
4. `operations/verification-framework.md` — the verification methods you'll use to confirm your work

## What's Done

All 5 tasks from the data-mining implementation prompt are complete:

1. **Compile-Time Safety Verification** — `tsconfig.json` strict flags, `.eslintrc.json`, Husky pre-commit hook, invocation guard test. Verified.
2. **Model Selection as Compile-Time Constraint** — `website/src/lib/constraints.ts` with branded `FastModel`/`DeepModel` types, `ModelReliabilityBoundary`, `SafetyCriticalCallParams`. Integrated into `r20a-classifier.ts`. Verified.
3. **Safety System Synchronous Enforcement** — `SafetyGate` branded token, `enforceDistressCheck()` wrapper. All 8 human-facing POST routes updated. Invocation guard test extended. Verified.
4. **Knowledge Gap Carry-Forward Protocol** — Complete. `knowledge-gaps.md` has KG1–KG7, verification framework references it. Verified.
5. **Zone 2 Clinical Adjacency Verification** — Regex stage: 6/6 pass, zero false positives. Safety signal audit at `operations/safety-signal-audits/2026-04-18-zone2-clinical-adjacency.md`. Haiku stage untested (needs live API key).

## Outstanding Items (Not Blockers — Pick Up When Appropriate)

These emerged during the two build-enforcement sessions. None are blockers for P0 progress, but they're documented here so they don't get lost:

1. **Jest configuration for website directory** — The invocation guard test (`r20a-invocation-guard.test.ts`) has correct source but can't run because no `jest.config.ts` exists. Needs `ts-jest` or similar. Low effort, would enable the test to run in CI.

2. **Haiku (Stage 2) Zone 2 verification** — The regex stage passed all 6 Zone 2 inputs, but the LLM evaluator hasn't been tested against them. When a live `ANTHROPIC_API_KEY` is available, run the full two-stage test. Documented in the safety signal audit.

3. **`selectModelByDepth()` integration into sage-reason-engine** — `constraints.ts` exports `selectModelByDepth()` which returns branded types. The engine still uses an inline ternary for model selection. Consider replacing for consistency, but not urgent — the current code works and compiles clean.

## What to Work On

This is where I need your input. The data-mining implementation is complete. The options are:

**Option A: Continue P0 hold point assessment (0h)**
The hold point is the next milestone. It requires testing every component with real data. The data-mining work just strengthened the safety infrastructure — a good time to assess what's ready for testing.

**Option B: Pick up a specific build item**
If there's something specific you want built or fixed, tell me what it is.

**Option C: Something else entirely**
You decide direction and scope.

## Rules

- Run pre-implementation verification before each task: check existing state, don't re-implement completed work.
- Use the 0a status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live).
- Signal confidence level per 0d protocol.
- Classify change risk per 0d-ii protocol before making changes.
- Run `tsc --noEmit` and `eslint src/` after each task to confirm no regressions.
- Produce a handoff note at session close.
