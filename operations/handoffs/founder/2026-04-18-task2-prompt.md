# Next Session Prompt — Tasks 2–5
## Paste everything below the line into a new session.

---

## Context

Read these files first, in this order:
1. `operations/session-handoffs/2026-04-18-build-enforcement-session-close.md` — what was completed and decided in the previous session
2. `operations/knowledge-gaps.md` — check KG1–KG7 for relevance before beginning work
3. `operations/verification-framework.md` — the verification methods you'll use to confirm your work

Task 1 (Compile-Time Safety Verification) is fully complete and verified. Vercel is green. All pre-implementation gaps are remediated. You are continuing with Tasks 2–5 from the same original prompt.

## Source Material

These three data-mining documents drove the original 5-task prompt. Tasks 2–5 draw from their findings:

- `operations/data-mining/build-knowledge-extraction.md` — Section 5 (model selection patterns), Section 7 (knowledge gaps)
- `operations/data-mining/eval-suite-findings.md` — Section 3 (Zone 2 clinical adjacency), Section 4 (safety system gaps)
- `operations/data-mining/comprehension-expertise-audit.md` — Section 2 (constraint type patterns), Section 6 (synchronous enforcement)

## Tasks to Execute

### Task 2: Model Selection as Compile-Time Constraint

**Goal:** Create `website/src/lib/constraints.ts` with TypeScript types that enforce model selection requirements at compile time — so that choosing the wrong model for a safety-critical operation is a type error, not a runtime bug.

**What this means in plain language:** Right now, model selection (e.g. using Haiku for distress classification) is enforced by convention and code review. This task makes the TypeScript compiler enforce it — if someone tries to pass a model that doesn't meet the reliability boundary for a given operation, the code won't compile.

**Key concept from the data-mining:** `ModelReliabilityBoundary` — a type that maps operation types (safety-critical, assessment, conversational) to the models that are permitted for each.

**Deliverables:**
- `website/src/lib/constraints.ts` with `ModelReliabilityBoundary` types
- Type-level enforcement that safety-critical operations require specific models
- Integration with existing model selection in `r20a-classifier.ts` and any other files that select models

**Verification:** `tsc --noEmit` passes. Intentionally passing a wrong model for a safety operation produces a compile error.

### Task 3: Safety System Synchronous Enforcement

**Goal:** Add a type guard ensuring the distress classifier (`detectDistressTwoStage`) executes synchronously in the request pipeline — meaning the API response cannot be sent until the safety check completes.

**What this means in plain language:** The distress detection must finish BEFORE the API sends any response to the user. This task makes that a compile-time guarantee, not just a code convention.

**Key files:**
- `website/src/lib/r20a-classifier.ts` — the two-stage distress classifier
- `website/src/lib/guardrails.ts` — the regex-based first stage
- The 8 human-facing POST routes (listed in `r20a-invocation-guard.test.ts`)

**Deliverables:**
- Type guard or wrapper that enforces synchronous execution before response
- Applied to all 8 human-facing POST routes
- Compile-time error if someone tries to send a response before the safety check resolves

**Verification:** `tsc --noEmit` passes. The invocation guard test still passes.

### Task 4: Knowledge Gap Carry-Forward Protocol (Verify Completeness)

**Goal:** Confirm that the knowledge gap protocol is fully wired — the file exists, the verification framework references it, and the session protocol includes the checkpoint.

**What was already done:** `operations/knowledge-gaps.md` created with KG1–KG7. `operations/verification-framework.md` updated with carry-forward rule and session-start step.

**What may still be needed:** Verify the session-start verification protocol explicitly includes "read knowledge-gaps.md" as a step. If it's there, mark done. If not, add it.

**Verification:** Read both files and confirm the protocol is complete.

### Task 5: Zone 2 Clinical Adjacency Verification

**Goal:** Run the eval suite's Zone 2 inputs against the actual classifier and document the results in a safety signal audit.

**What was already done:** 6 Zone 2 eval inputs added to `r20a-classifier-eval.ts` (Group D — `CLINTON_PROFILE_ZONE2`). These are philosophical self-examination prompts that map to Clinton's passion profile (philodoxia, penthos, aischyne). All have `expectedSeverity: 'none'` — they should pass through without being flagged.

**What still needs to happen:**
1. Run the eval inputs through `detectDistressTwoStage` (or the regex stage at minimum, since the LLM stage requires a live API key)
2. Document results: which passed, which were flagged, any false positives
3. Produce a safety signal audit noting whether Zone 2 boundary is correctly calibrated

**Key file:** `website/src/lib/__tests__/r20a-classifier-eval.ts`

**Verification:** Results documented. Any false positives analysed and either accepted as conservative or flagged for tuning.

## Rules

- Run pre-implementation verification before each task: check existing state, don't re-implement completed work.
- Use the 0a status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live).
- Signal confidence level per 0d protocol.
- Classify change risk per 0d-ii protocol before making changes.
- Run `tsc --noEmit` and `eslint src/` after each task to confirm no regressions.
- Produce a handoff note at session close.
