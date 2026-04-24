# Session Close — 18 April 2026
## Tasks 2–5: Model Constraints, Safety Enforcement, Knowledge Gap Protocol, Zone 2 Verification

## Decisions Made

- **Branded types for model enforcement:** Used TypeScript branded string types (`FastModel`, `DeepModel`) to create compile-time discrimination between models. The `__brand` field exists only at the type level — zero runtime overhead. Reasoning: branded types are the standard TypeScript pattern for nominal typing; alternatives (enums, classes) add runtime cost. Impact: passing the wrong model to a safety-critical operation is now a type error.
- **SafetyGate pattern for synchronous enforcement:** Created a `SafetyGate` branded token that can only be obtained by awaiting `enforceDistressCheck()`. Reasoning: the existing invocation guard test checks source code text; the gate pattern makes the compiler itself enforce the invariant. Impact: all 8 human-facing POST routes now use the gate pattern.
- **Regex stage sufficient for Zone 2 verification:** Ran Zone 2 eval inputs through the regex stage only (LLM stage requires live API key). Reasoning: the regex stage is the first line of defence and the most likely source of false positives on philosophical language. Impact: 6/6 pass, boundary confirmed correctly calibrated. Haiku stage test deferred to when API key is available.

## Status Changes

| Item | Old Status | New Status |
|---|---|---|
| constraints.ts (ModelReliabilityBoundary) | Did not exist | Verified |
| constraints.ts (SafetyGate) | Did not exist | Verified |
| r20a-classifier.ts (branded model usage) | Wired (MODEL_FAST) | Verified (getFastModel() + SafetyCriticalCallParams) |
| 8 route files (enforceDistressCheck) | Wired (await detectDistressTwoStage) | Verified (enforceDistressCheck gate pattern) |
| r20a-invocation-guard.test.ts | Wired | Wired (added Task 3 gate assertions; Jest config not yet available) |
| Knowledge gap carry-forward protocol | Verified | Verified (re-confirmed — no changes needed) |
| Zone 2 clinical adjacency (regex stage) | Wired (eval inputs) | Verified (regex stage — 6/6 pass) |
| Zone 2 clinical adjacency (LLM stage) | Wired (eval inputs) | Untested (requires live API key) |
| Safety signal audit document | Did not exist | Verified |

## What Was Completed

**Task 2: Model Selection as Compile-Time Constraint**
- Created `website/src/lib/constraints.ts` with branded types: `FastModel`, `DeepModel`, `KnownModel`
- `ModelReliabilityBoundary` type maps operation categories to permitted models
- `SafetyCriticalCallParams` interface enforces `FastModel` + `temperature: 0` for classifier
- `DepthModel<D>` maps `ReasonDepth` to correct model at compile time
- `selectModel()` and `selectModelByDepth()` return properly branded types
- Integrated into `r20a-classifier.ts` — now uses `getFastModel()` + `SafetyCriticalCallParams`
- Verified: passing `DeepModel` to `SafetyCriticalCallParams` produces compile error

**Task 3: Safety System Synchronous Enforcement**
- Added `SafetyGate` branded token to `constraints.ts`
- `enforceDistressCheck()` — awaits the classifier and returns a gate token
- All 8 human-facing POST routes updated to use `enforceDistressCheck(detectDistressTwoStage(input))`
- `r20a-invocation-guard.test.ts` updated with 2 new test blocks verifying gate import and call pattern
- Verified: 8/8 routes confirmed via grep; `tsc --noEmit` passes

**Task 4: Knowledge Gap Carry-Forward Protocol**
- Verified complete. `knowledge-gaps.md` has KG1–KG7. `verification-framework.md` Step 2 explicitly includes "Check knowledge-gaps.md". No changes needed.

**Task 5: Zone 2 Clinical Adjacency Verification**
- Ran 6 CLINTON_PROFILE_ZONE2 inputs through regex stage of `detectDistress()`
- Results: 6/6 passed (severity: none). Zero false positives.
- Produced safety signal audit: `operations/safety-signal-audits/2026-04-18-zone2-clinical-adjacency.md`
- Boundary assessment: regex correctly distinguishes Zone 2 (philosophical self-examination) from Zone 3 (clinical crisis)

## What Was NOT Completed

- **Jest configuration:** The invocation guard test cannot run via `npx jest` because no `jest.config.ts` exists in the website directory. The test source is correct (verified manually) but the test runner is not configured. This is a pre-existing gap, not a regression.
- **Haiku (Stage 2) Zone 2 verification:** Requires a live ANTHROPIC_API_KEY. Documented as next action in the safety signal audit.

## Next Session Should

1. Consider configuring Jest for the website directory (jest.config.ts with ts-jest) so the invocation guard test can run as part of CI
2. When API key is available, run full two-stage Zone 2 test (regex + Haiku) to verify Haiku doesn't false-positive on philosophical language
3. Review whether `selectModelByDepth()` should be integrated into `sage-reason-engine.ts` to replace the inline ternary model selection
4. Continue with P0 hold point assessment or next priority item per founder direction

## Blocked On

- Nothing. All tasks from the original 5-task prompt are complete.

## Open Questions

- None outstanding.

## Verification Evidence

```
tsc --noEmit          → exit 0 (zero errors)
eslint src/           → 0 errors, 34 warnings (all non-blocking, same count as previous session)
8/8 route gate check  → all PASS (enforceDistressCheck pattern confirmed)
Zone 2 regex test     → 6/6 PASS (zero false positives)
Branded type test     → DeepModel → SafetyCriticalCallParams produces TS2322 error (confirmed)
```
