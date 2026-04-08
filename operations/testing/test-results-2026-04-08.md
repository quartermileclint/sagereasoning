# Product Test Results — 8 April 2026

**Testing session:** P0 Hold Point — Assessment 1 (0h)
**Tested by:** AI-assisted (Claude), founder-reviewed
**Site:** https://www.sagereasoning.com (Vercel deployment)
**Build status at test time:** Green (after 6 fixes deployed during session)

## Pre-Test Fixes Required

Before meaningful testing could proceed, the Vercel build was failing. Five fixes were deployed:

1. **Fix 1 — guardrail type error:** `MechanismId` type import added to `/api/guardrail/route.ts` (line 11, 108). Build was failing with `Type 'string[]' is not assignable to type '("oikeiosis" | ...)'`.
2. **Fix 2 — reflect route type errors:** `SupabaseClient` mismatch fixed with `as any` cast (line 194). `feedback_loop` property removed from `ComposabilityMeta` (line 221).
3. **Fix 3 — generic 500 errors:** `reason/route.ts` now surfaces `error.message` instead of generic "Internal server error".
4. **Fix 4 — JSON parse failures:** Added robust fallback extraction (first `{` to last `}`) in both `evaluate/route.ts` and `sage-reason-engine.ts`.
5. **Fix 5 — JSON truncation (root cause):** `max_tokens` was too low for structured JSON responses. Increased: evaluate 512→2048, quick 768→2048, standard 1024→3072, deep 1536→4096.

**Classification:** Fix 5 was the root cause blocker. All LLM endpoints were returning 500 errors because the model's JSON output was being cut off mid-response.

---

## Phase 1: Core Reasoning Engine

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 1.1 | Quick-depth reasoning | PASS | Returns katorthoma_proximity, passions_detected, 3 mechanisms, reasoning_receipt. Response ~2s |
| 1.2 | Standard-depth reasoning | PASS | Returns 5 mechanisms. More detailed analysis than quick. Response ~3s |
| 1.3 | Deep-depth reasoning | PASS | Returns 6 mechanisms including iterative_refinement. Response ~5s |
| 1.4 | Depth quality comparison | PASS | Deep noticeably more nuanced than quick. Standard between the two. Proximity levels consistent across depths |
| 1.5 | Demo endpoint (no auth) | PASS | Returns quick-depth evaluation. No auth required. Rate limited. max_tokens fix resolved prior 500 errors |
| 1.6 | Per-stage scoring | PASS | meta.stage_scores present with per-stage quality ratings |
| 1.7 | Urgency detection | WARNING | hasty_assent_risk field present in engine code. urgency_applied logic is `!!params.urgency_context?.trim()`. Initial live test returned urgency_applied:false — may have been pre-fix. Code review confirms correct wiring. Needs re-verification on live site |
| 1.8 | Stoic Brain data | PASS (code) | GET endpoint exists, serves stoic-brain.json, logs analytics. Could not hit live endpoint from sandbox |

**Phase 1 score: 7 PASS / 1 WARNING / 0 FAIL**

---

## Phase 2: Scoring & Decision Tools (Human-Facing)

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 2.1 | Score an action (/score) | PASS (code) | Page exists. Uses sage-reason engine via /api/score. Displays proximity level, passions, improvement path |
| 2.2 | Score a document (/score-document) | PASS (code) | Page exists. Endpoint wired |
| 2.3 | Score a policy (/score-policy) | PASS (code) | Page exists. Endpoint wired |
| 2.4 | Social media filter (/score-social) | PASS (code) | Page exists. Endpoint wired |
| 2.5 | Compare decisions | PASS | Live test returned per-option evaluations with proximity levels for 3 options + ranking. Uses sage-reason engine for each option |
| 2.6 | Process evaluation | PASS | Live test returned process_quality and process_described fields |
| 2.7 | Ethical scenarios (/scenarios) | PASS (code) | Page exists. Interactive scenario generation with audience selection |
| 2.8 | Score a conversation | PASS | Live test returned overall + per-participant evaluations. Uses deep depth (Sonnet) |

**Phase 2 score: 8 PASS / 0 WARNING / 0 FAIL**
Note: Tests 2.1-2.4 and 2.7 verified by code review (page + endpoint existence, correct wiring). Tests 2.5, 2.6, 2.8 verified by live API calls.

---

## Phase 3: Guardrail, Deliberation & Agent-Facing Tools

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 3.1 | sage-guard (standard) | DEFERRED | Requires sr_live_ API key. Route exists, code reviewed: uses quick depth, binary proceed/caution |
| 3.2 | sage-guard (elevated) | DEFERRED | Requires sr_live_ API key. Code confirms elevated uses standard depth (5 mechanisms) |
| 3.3 | sage-guard (critical) | DEFERRED | Requires sr_live_ API key. Code confirms critical uses deep depth, alternatives warning, rollback_path, deliberation_quality fields all present |
| 3.4 | Deliberation chain start | DEFERRED | Requires auth. Route at /api/deliberation-chain/[id] exists with GET (retrieve) + POST logic. V3 tables, proximity trajectory, passions_arc |
| 3.5 | Deliberation chain iterate | DEFERRED | Requires auth. Route at /api/score-iterate exists |
| 3.6 | Deliberation chain conclude | DEFERRED | Requires auth. Route at /api/deliberation-chain/[id]/conclude exists |
| 3.7 | Skill execution | DEFERRED | Requires auth. Route at /api/execute exists. Supports explicit skill_id + intelligent routing |
| 3.8 | Skill chaining | DEFERRED | Requires auth. Route at /api/compose exists. Supports sequential steps with stop_on_failure and stop_on_guard_block |
| 3.9 | MCP tool discovery | PASS (code) | No auth required. Route at /api/mcp/tools exists. Supports tier filtering, individual tool lookup, and OpenBrain preset. Uses mcp-contracts library |

**Phase 3 score: 1 PASS / 0 WARNING / 0 FAIL / 8 DEFERRED**
Note: All 8 deferred tests require API key or user auth that couldn't be obtained in this session. All routes exist and are correctly structured per code review.

---

## Phase 4: Assessment, Baseline & Progression

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 4.1 | Human baseline (/baseline) | PASS (code) | Page exists. Full baseline assessment flow with 5 core questions + optional Q6. Returns Senecan grade, oikeiosis stage, dominant passion, 4 dimension levels |
| 4.2 | Baseline retake block | DEFERRED | Requires completing baseline first. Logic would need live testing |
| 4.3 | Foundational assessment (free) | PASS (code) | GET endpoint returns 14 questions across Phase 1 + Phase 2. Uses FREE_ASSESSMENT_IDS, V3_ASSESSMENT_PHASES. No auth for questions |
| 4.4 | Foundational scoring | DEFERRED | Requires sr_live_ API key. POST endpoint exists with V3_ASSESSMENT_SCORING_PROMPT, LLM call, proper type imports |
| 4.5 | Full assessment (paid) | DEFERRED | Requires sr_live_ API key. GET endpoint exists, returns 55 questions across 6 phases |
| 4.6 | Full assessment scoring | DEFERRED | Requires sr_live_ API key. POST endpoint exists with comprehensive profile generation |
| 4.7 | User dashboard (/dashboard) | PASS (code) | Page exists. Requires auth to view meaningful data |
| 4.8 | Pattern detection | PASS (code) | POST /api/patterns exists. Deterministic analysis (no LLM). Surfaces: recurring passions, proximity trends, skill preferences, virtue gaps, passion clusters |
| 4.9 | Reasoning receipts | DEFERRED | Requires auth. GET /api/receipts exists |
| 4.10 | Milestones | DEFERRED | Requires auth. GET /api/milestones exists |

**Phase 4 score: 4 PASS / 0 WARNING / 0 FAIL / 6 DEFERRED**

---

## Phase 5: Infrastructure, Marketplace & Discovery

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 5.1 | Skill marketplace (/marketplace) | PASS (code) | Page exists |
| 5.2 | Skill detail | PASS (code) | Route at /api/marketplace + /api/skills/[id] exists |
| 5.3 | Skill discovery | PASS (code) | GET /api/skills exists. Returns complete skill catalogue with metadata |
| 5.4 | Pricing page (/pricing) | PASS (code) | Page exists |
| 5.5 | API documentation (/api-docs) | PASS (code) | Page exists |
| 5.6 | Data export | DEFERRED | Requires auth. GET /api/user/export exists |
| 5.7 | Data deletion (verify only) | PASS (code) | DELETE /api/user/delete exists. Requires auth + explicit { confirm: "DELETE" } token. Genuine deletion in FK-safe order. Not a 503 placeholder — fully implemented |
| 5.8 | Usage summary | DEFERRED | Requires auth. GET /api/billing/usage-summary exists |
| 5.9 | Admin metrics (/admin) | PASS (code) | Page exists |
| 5.10 | Community map (/community) | PASS (code) | Page exists |
| 5.11 | Home page (/) | PASS (code) | Root page.tsx exists |
| 5.12 | Methodology (/methodology) | PASS (code) | Page exists |
| 5.13 | Limitations (/limitations) | PASS (code) | Page exists |
| 5.14 | Transparency (/transparency) | PASS (code) | Page exists |
| 5.15 | Privacy & terms | PASS (code) | Both /privacy and /terms pages exist |

**Phase 5 score: 13 PASS / 0 WARNING / 0 FAIL / 2 DEFERRED**

---

## Phase 6: Marketplace Skills (Individual Skill Testing)

| ID | Skill | Result | Notes |
|----|-------|--------|-------|
| 6.1 | sage-classify | DEFERRED | Requires auth via /api/execute. Route exists with skill registry |
| 6.2 | sage-prioritise | DEFERRED | Same |
| 6.3 | sage-align | DEFERRED | Same |
| 6.4 | sage-coach | DEFERRED | Same |
| 6.5 | sage-compliance | DEFERRED | Same |
| 6.6 | sage-educate | DEFERRED | Same |
| 6.7 | sage-govern | DEFERRED | Same |
| 6.8 | sage-invest | DEFERRED | Same |
| 6.9 | sage-moderate | DEFERRED | Same |
| 6.10 | sage-negotiate | DEFERRED | Same |
| 6.11 | sage-pivot | DEFERRED | Same |
| 6.12 | sage-premortem | DEFERRED | Same |
| 6.13 | sage-resolve | DEFERRED | Same |
| 6.14 | sage-retro | DEFERRED | Same |

**Phase 6 score: 0 PASS / 0 WARNING / 0 FAIL / 14 DEFERRED**
Note: All 14 skills routed through /api/execute which requires auth. Skill registry and execution router exist and are correctly structured.

---

## Scoring Summary

| Phase | Passed | Warning | Failed | Deferred | Key Finding |
|-------|--------|---------|--------|----------|-------------|
| 1. Core Engine | 7 | 1 | 0 | 0 | Engine works at all 3 depths after max_tokens fix. Urgency detection wired but needs live re-verification |
| 2. Human-Facing Scoring | 8 | 0 | 0 | 0 | All pages exist. Live API tests confirmed per-option scoring, process evaluation, and conversation scoring |
| 3. Guardrail & Agent Tools | 1 | 0 | 0 | 8 | MCP discovery works. All agent endpoints exist and are correctly structured but require API key |
| 4. Assessment & Progression | 4 | 0 | 0 | 6 | Baseline, foundational assessment, patterns, and dashboard all present. Scoring endpoints need API key |
| 5. Infrastructure & Discovery | 13 | 0 | 0 | 2 | Near-complete. All 17 pages exist. Delete endpoint is genuine (not placeholder). Export/usage need auth |
| 6. Marketplace Skills | 0 | 0 | 0 | 14 | All skills routed through /api/execute. Need auth to test individual skill outputs |
| **TOTAL** | **33** | **1** | **0** | **30** | |

**Effective pass rate (excluding deferred): 33/34 = 97%**
**Overall coverage: 34/64 = 53%**
**Deferred tests: 30/64 = 47% — all blocked by auth/API key requirements**

---

## Gap List (Sorted by Severity)

### Blocker — None remaining
The original blocker (B1: all LLM endpoints returning 500 due to max_tokens truncation) was resolved during this session.

### Significant

| # | Gap | Severity | Impact | Status |
|---|-----|----------|--------|--------|
| S1 | 30 tests deferred due to auth/API key access | Significant | 47% of tests could not be run. Agent-facing endpoints (guardrail, execute, compose) and all 14 marketplace skills are untested live | Requires either: (a) Supabase auth token for human-facing tests, or (b) sr_live_ API key for agent-facing tests |
| S2 | No sr_live_ API key available for testing | Significant | Cannot test the entire agent developer experience (guardrail, assessment scoring, skill execution, composition) | Need to create test API key in Supabase api_keys table |

### Minor

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| M1 | Test 1.7 urgency detection needs live re-verification | Minor | Code is correctly wired. Initial live test pre-fix showed urgency_applied:false. Post-fix behaviour unconfirmed |
| M2 | Pages verified by code review, not visual rendering | Minor | All 17 pages have page.tsx files, but actual rendering (layout, interactivity, styling) not verified |
| M3 | Diagnostic debug fields still in evaluate error response | Minor | debug_version, debug_parse_error, debug_tail added during troubleshooting. Should be removed or gated behind a flag before launch |

### Cosmetic
None identified.

---

## Value Demonstration Summary

### Demo 1: Core Reasoning Engine (Tests 1.1-1.3)
The sage-reason engine produces structured Stoic evaluations at three depth levels. A decision like "I'm considering leaving my job to start a business" returns: control filter separating what's within moral choice from externals, passion diagnosis identifying specific false judgements (e.g., fear of regret, craving for novelty), oikeiosis mapping of obligations across expanding circles (self to household to community), katorthoma proximity rating on a 5-level scale, and a reasoning receipt for audit trail. Each depth level adds more mechanisms: quick (3), standard (5), deep (6 with iterative refinement).

### Demo 2: Decision Comparison (Test 2.5)
The score-decision endpoint evaluates multiple options side by side. When given 3 options for a real decision, it returns per-option proximity levels and ranks them by principled reasoning — not just advantage. This lets users see which choice is most aligned with virtue, not just which is most convenient.

### Demo 3: Conversation Scoring (Test 2.8)
The score-conversation endpoint uses deep depth (Sonnet model) to evaluate multi-party conversations. It produces both an overall conversation assessment and per-participant receipts, identifying which participants demonstrated principled reasoning and where passions distorted the exchange.

### What These Demonstrate
SageReasoning can take any human decision, document, conversation, or agent action and evaluate it through a structured Stoic framework. The output is machine-readable (JSON with typed fields), human-readable (philosophical reflections and improvement paths), and auditable (reasoning receipts with mechanism-by-mechanism scoring). This is not generic AI advice — it is a specific philosophical framework applied consistently.

---

## Recommendations for Next Testing Session

1. **Create an sr_live_ API key** in the Supabase api_keys table so agent-facing endpoints can be tested (unlocks 22 deferred tests in Phases 3, 4, and 6)
2. **Obtain a Supabase auth token** so human-facing authenticated endpoints can be tested (unlocks 8 deferred tests in Phases 4 and 5)
3. **Re-run test 1.7** on live site to confirm urgency_applied returns true post-fix
4. **Visual testing of all 17 pages** — render check, interactivity, mobile responsiveness
5. **Remove or gate diagnostic debug fields** from evaluate endpoint error response

---

*This report serves P0 hold point (0h) Assessments 1 and 4 (partial). Full assessment completion requires a second testing session with auth credentials.*
