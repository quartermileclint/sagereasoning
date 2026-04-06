# SageReasoning Flow Path Efficiency Audit

**Date:** 6 April 2026
**Status:** Adopted — Phase 1 and Phase 2 implemented (6 April 2026)
**Context:** With the flow tracer now showing every function's path, this audit examines whether tools developed earlier could be simplified now that the full architecture exists.

---

## The Core Problem

**sage-reason** was designed as the universal reasoning layer — one entry point, three depths (quick/standard/deep), centralised 4-stage sequence. But 7 brain-derived tools were built independently, each re-implementing the same Stoic Brain loading, 4-stage reasoning, and Claude API calls from scratch. They don't call sage-reason. They duplicate it.

This means:
- The 4-stage evaluation prompt exists in 8 separate places (sage-reason + 7 tools)
- If you improve the 4-stage reasoning, you'd need to update 8 files instead of 1
- Each tool creates its own Claude API connection instead of sharing one
- Model selection is hardcoded per tool instead of using the shared model-config
- Only 36% of routes use the standard response envelope
- Only 14% generate reasoning receipts (the audit trail)
- Only 1 route uses the guardrails safety module

---

## What Each Tool Actually Does

### Tools That Should Wrap sage-reason (Strong Candidates)

These tools re-implement the exact same reasoning logic. They could call sage-reason instead and just add their domain-specific layer on top — exactly like the wrapped skills already do.

**sage-score** — Currently: loads its own Stoic Brain prompt (64 lines), calls Claude directly, runs its own 4-stage. Could instead: call sage-reason with depth=standard, pass the action/context/relationships as domain context. Saves ~180 lines of duplicated code.

**sage-filter** — Currently: loads its own social media prompt, calls Claude directly. Unique feature is splitting poster vs reader passions. Could instead: call sage-reason, then add the passion-splitting logic on top. Also currently skips the response envelope AND reasoning receipts entirely.

**sage-guard** — Currently: loads its own guardrail prompt, calls Claude directly with only 2 mechanisms. Could instead: call sage-reason with depth=quick (which already uses 3 mechanisms), then apply its threshold for the binary go/no-go. Saves ~100 lines.

### Tools That Could Partially Wrap sage-reason

**sage-decide** — Scores 2-5 options independently then ranks them. Could call sage-reason once per option, then apply its ranking logic. Custom ranking is worth keeping.

**sage-converse** — Scores overall conversation plus per-participant breakdown. Could call sage-reason for the overall score, keep the participant analysis as custom.

### Tools That Should Stay Independent (Architecture Requires It)

**sage-iterate** — Manages deliberation chains across multiple turns. Tracks best_proximity, proximity_direction, passions_direction. Stateful — sage-reason is stateless. Can't wrap.

**sage-audit** — Generates badges, saves to database, handles both document and policy modes. Domain-specific persistence. Can't simplify.

**sage-profile** — 55 assessments across 8 phases in 3 parallel Claude calls. Proprietary assessment framework. Not evaluation-based.

**sage-diagnose** — 14 assessments with pedagogical structure and Senecan grading. Not compatible with sage-reason's format.

**sage-scenario** — Generates scenarios (creative) rather than evaluating them. Age-appropriate fallbacks. Educational, not reasoning.

**sage-reflect** — Narrative daily reflection. Warm, conversational tone that doesn't fit sage-reason's structured JSON output.

---

## Infrastructure Gaps Across All 56 Routes

| Issue | Current | What It Should Be |
|-------|---------|-------------------|
| Claude API client | 24 routes each create their own instance | 1 shared singleton |
| Response envelope | 20 of 56 routes use it (36%) | All routes use it |
| Reasoning receipts | 8 of 56 routes generate them (14%) | All reasoning routes generate them |
| Security middleware | Auth/rate-limit boilerplate repeated per route | Extracted to Next.js middleware |
| Guardrails | Only 1 route uses the guardrails module | All human-facing routes use it |
| Stoic Brain loading | 13 routes load JSON independently | All go through sage-context or sage-reason |
| Model selection | Hardcoded per route | All use model-config |
| Cross-route calls | Only 3 routes call other routes (HTTP-based) | Internal function calls (faster, cheaper) |

---

## Recommended Refactoring Sequence

### Phase 1: Quick Wins (No Architecture Change)

1. **Create a shared Claude API client** — One file, one connection, all routes import it. Reduces 24 separate instances to 1.

2. **Standardise response envelope on all routes** — 36 routes currently return raw JSON. Switch them to buildEnvelope().

3. **Add receipt generation to all reasoning routes** — 16 routes call Claude but skip receipts. The audit trail (R14) requires this.

### Phase 2: Simplify Brain-Derived Tools

4. **Refactor sage-score to wrap sage-reason** — The strongest candidate. Same 4-stage logic, just adds action/context parsing. Eliminates 180 lines of duplication.

5. **Refactor sage-filter to wrap sage-reason** — Add domain_context for social media, keep passion-splitting as a post-processing step.

6. **Refactor sage-guard to wrap sage-reason (quick depth)** — Add threshold comparison as a post-processing step.

7. **Refactor sage-decide to loop sage-reason** — Call sage-reason per option, keep custom ranking logic.

### Phase 3: Centralise Infrastructure

8. **Extract auth and rate-limiting to Next.js middleware** — Removes boilerplate from every route.

9. **Build a prompt registry** — System prompts in one place instead of hardcoded in 11 routes.

10. **Implement guardrails as middleware** — R20 (vulnerable user detection) should run before every human-facing Claude call.

11. **Internal function calls instead of HTTP** — Routes that call other routes (compose, execute) currently make HTTP calls to themselves. Direct function calls would be faster and cheaper.

---

## Impact on the Flow Tracer

If Phase 2 is implemented, the flow paths change:

**Before (current):**
sage-score: Human → /score → [own Stoic Brain load] → [own 4-stage] → [own envelope] → Response

**After (refactored):**
sage-score: Human → /score → sage-reason(standard) → Stoic Brain → 4-stage → envelope → receipt → Response

This means the wrapped flow paths and brain-derived flow paths would converge — both go through sage-reason, just with different domain context. The flow tracer would show this clearly.

---

## What This Means for Revenue

The wrapped skills (sage-coach, sage-invest, etc.) already follow the optimal pattern: they call sage-reason and add their domain layer. This is the correct architecture. The irony is that the "simpler" wrapped skills are better engineered than the "core" brain-derived tools.

When the brain-derived tools are refactored to also wrap sage-reason, every improvement to the 4-stage reasoning immediately benefits all 28 tools (13 brain-derived + 15 wrapped) instead of needing to be applied 8+ times manually.

---

## Estimated Savings

| Metric | Before | After |
|--------|--------|-------|
| Places to update 4-stage logic | 8 files | 1 file (sage-reason) |
| Duplicated prompt lines | ~680 LOC | ~140 LOC (only tools that must stay independent) |
| Claude API client instances | 24 | 1 |
| Routes missing response envelope | 36 | 0 |
| Routes missing reasoning receipts | 48 | ~10 (only non-reasoning routes) |
| Routes missing guardrails | 55 | 0 (human-facing routes all protected) |
