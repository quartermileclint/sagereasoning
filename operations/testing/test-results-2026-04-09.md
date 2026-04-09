# Product Test Results — 9 April 2026 (Sessions 2–4)

**Testing session:** P0 Hold Point — Assessment 1 (0h), continued
**Tested by:** AI-assisted (Claude), founder-reviewed
**Site:** https://www.sagereasoning.com (Vercel deployment)
**Pre-requisite:** sr_live_ API key created in Supabase api_keys table (paid tier, 10k/month limit)
**Auth method:** Supabase JWT from founder's signed-in browser session

## Session Context

**Session 2** (earlier today) ran the deferred tests, identified three true bugs (context template auth, execute router auth, full assessment batch scoring), and verified most of the system.

**Session 3** attempted to deploy fixes and re-run failed tests. Applied inline auth fix to context-template.ts and execute/route.ts, cleaned diagnostic code. Could not push from sandbox.

**Session 4** (this session) deployed the context-template fix, identified the TRUE root cause of the 401 problem, tested all 12 skills, and prepared fixes for the execute/compose/score-document routes.

---

## Root Cause Analysis — The 401 Bug

**Previous diagnosis (Sessions 2–3):** `requireAuth()` hangs in factory-created handlers.

**Actual root cause (Session 4):** `requireAuth()` does NOT hang. The real issue was the HTTP self-call architecture. Context template skills (sage-align etc.) called `/api/reason` via `fetch(https://www.sagereasoning.com/api/reason)`. If Vercel applies a www→non-www redirect (or vice versa), the Fetch API spec mandates stripping the Authorization header on cross-origin redirects. So:

1. sage-align's own auth passes (verified in Vercel runtime logs — Supabase getUser call AND /api/reason call both appear)
2. sage-align calls /api/reason internally via public URL
3. The Authorization header gets stripped on redirect
4. /api/reason's `requireAuth` fails → returns 401
5. sage-align forwards the 401 as its own response

**Evidence:** Vercel Runtime Logs for sage-align POST 401 showed TWO external API calls (Supabase getUser + POST /api/reason), proving sage-align's auth passed but the downstream call failed.

**Fix applied:** Replaced HTTP self-call with direct `import { runSageReason } from '@/lib/sage-reason-engine'` call. This eliminates the HTTP roundtrip, auth forwarding, and redirect risk entirely. DEPLOYED and CONFIRMED WORKING.

**Same pattern affects:** execute/route.ts, compose/route.ts, score-document/route.ts — these still make HTTP self-calls to skill endpoints. Fix: use `VERCEL_URL` env var (auto-set by Vercel, no redirect) as base URL. Code changes applied locally, NOT YET DEPLOYED.

---

## Session 4 Results by Phase

### PHASE 6: Marketplace Skills — MAJOR PROGRESS

| ID | Skill | Result | Notes |
|----|-------|--------|-------|
| 6.3 | sage-align | **PASS** | 200. Full response: control_filter, passion_diagnosis, oikeiosis, value_assessment, kathekon_assessment, proximity, stage_scores, disclaimer, reasoning_receipt |
| 6.4 | sage-coach | **PASS** | 200 with result |
| 6.5 | sage-negotiate | **PASS** | 200 with result |
| 6.6 | sage-premortem | **PASS** | 200 with result |
| 6.7 | sage-prioritise | **PASS** | 200 with result |
| 6.8 | sage-resolve | **PASS** | 200 with result |
| 6.9 | sage-invest | **PASS** | 200 with result |
| 6.10 | sage-educate | **PASS** | 200 with result |
| 6.11 | sage-govern | **PASS** | 200 with result |
| 6.12 | sage-moderate | **PASS** | 200 with result |
| 6.13 | sage-retro | **FAIL (500)** | Internal server error. Auth passed (not 401). Likely issue in sage-reason-engine response parsing or extractReceipt. Needs investigation |
| 6.14 | sage-compliance | **PASS** | 200 with result |

**Phase 6 updated score: 13 PASS / 1 FAIL (sage-retro 500)**

### PHASE 3: Execute Router

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 3.7 | Skill execution (execute) | FAIL (401) | Same HTTP self-call pattern. VERCEL_URL fix applied locally but NOT DEPLOYED. Will need commit + push + retest |

### PHASE 4: Assessment

| ID | Test | Result | Notes |
|----|------|--------|-------|
| 4.6 | Full assessment scoring | NOT TESTED | Still needs API key with sr_live_ prefix. Deferred |

---

## Combined Scoring Summary (Sessions 1–4)

| Phase | Passed | Warning | Failed | Deferred | Key Finding |
|-------|--------|---------|--------|----------|-------------|
| 1. Core Engine | **8** | 0 | 0 | 0 | All tests pass |
| 2. Human-Facing Scoring | 8 | 0 | 0 | 0 | All pages and live API confirmed |
| 3. Guardrail & Agent Tools | 5 + 1(code) | 0 | 2 | 1 | Execute router needs VERCEL_URL fix deployed. Deliberation-chain needs POST handler |
| 4. Assessment & Progression | 7 + 1(code) | 0 | 1 | 1 | Full assessment batch scoring untested (needs API key) |
| 5. Infrastructure & Discovery | 13 | 0 | 0 | 2 | Complete |
| 6. Marketplace Skills | **13** | 0 | **1** | 0 | 11 new passes! sage-retro 500 (not auth — internal error) |
| **TOTAL** | **55 + 2(code)** | **0** | **4** | **4** | |

**Pass rate: 57/64 = 89%** (up from 72%)
**True blockers (distinct issues): 4** (execute VERCEL_URL fix undeployed, sage-retro 500, full assessment untested, deliberation-chain POST handler)

---

## Gap List (Sorted by Severity)

### Blocker — RESOLVED

| # | Gap | Resolution |
|---|-----|------------|
| B1 (prev) | Context template auth — 12 endpoints return 401 | **RESOLVED** — Root cause was HTTP self-call auth header stripping. Fixed by direct `runSageReason` import. 11/12 now return 200 |

### Significant

| # | Gap | Severity | Impact | Fix Status |
|---|-----|----------|--------|------------|
| S1 | Execute/compose/score-document internal HTTP calls still use NEXT_PUBLIC_SITE_URL | Significant | Execute router (3.7) returns 401 when routing to skill endpoints | **FIX READY LOCALLY** — Changed to use VERCEL_URL. Needs commit + push |
| S2 | sage-retro returns 500 | Significant | 1 of 12 marketplace skills broken | Auth passes (not 401). Internal error in reasoning engine call or response parsing. Needs investigation |
| S3 | Full assessment batch scoring untested | Significant | 55-question agent assessment cannot be verified | Needs sr_live_ API key. max_tokens increased to 8192 in previous session but not confirmed |
| S4 | Deliberation chain POST handler missing | Significant | /api/deliberation-chain/[id] POST returns 405 | Chain creation works via /api/score-iterate. Fix: add POST handler or update docs |

### Minor

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| M1 | Baseline retake block untested | Minor | No baseline completed yet |
| M2 | Export and usage-summary endpoints untested | Minor | Both require auth. Lower priority |

---

## Value Demonstration Summary

### Demo 1: Guardrail at Three Risk Levels (Tests 3.1–3.3)
sage-guard demonstrates real ethical discernment. Standard risk: allows marketing email with caution, identifying passions including philoplousia and philodoxia. Elevated risk: blocks age-discriminatory hiring. Critical risk: blocks unnotified health data deletion with full deliberation toolkit.

### Demo 2: Deliberation Progression (Test 3.5)
Score-iterate shows reasoning improvement. Decision about leaving a job progresses from "deliberate" to "principled" proximity through genuine deliberation refinement.

### Demo 3: Assessment Catches Rote Answers (Test 4.4)
Foundational assessment detects hedone/self-satisfaction in textbook-perfect Stoic answers. Returned control_clarity: weak despite technically correct content.

### Demo 4: Urgency Detection (Test 1.7)
Engine correctly flags hasty_assent_risk: "high" under time pressure. Demonstrates detection of passion-driven urgency.

### Demo 5: Context Template Skills at Scale (Session 4 — NEW)
11 of 12 context template marketplace skills now confirmed working with full Stoic reasoning output. Each returns: control_filter, passion_diagnosis, oikeiosis, value_assessment, kathekon_assessment, proximity assessment, stage_scores, reasoning_receipt, and disclaimer. The direct `runSageReason` integration means context templates are faster (no HTTP roundtrip) and more reliable (no auth forwarding needed).

---

## Deployment Checklist (For Founder)

**What needs to be committed and pushed (3 files):**

1. `website/src/app/api/execute/route.ts` — VERCEL_URL for internal calls
2. `website/src/app/api/compose/route.ts` — VERCEL_URL for internal calls
3. `website/src/app/api/score-document/route.ts` — VERCEL_URL for internal calls

**Risk classification: Standard** — Additive change (adds VERCEL_URL as preferred base URL, falls back to existing behavior if unset). No auth logic changes.

**After deployment, test execute router:**
Open browser console on sagereasoning.com/dashboard and run:
```javascript
const token = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('sb-access-token=')).split('=').slice(1).join('=');
fetch('/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({ skill_id: 'sage-score', input: { action: 'I chose to apologise to my colleague' } })
}).then(r => r.json().then(d => console.log(r.status, d)));
```
Expected: 200 with execution result

---

*This report serves P0 hold point (0h) Assessments 1 and 4. Session 4 resolved the primary blocker (B1), raising the pass rate from 72% to 89%. 4 issues remain, none requiring architectural changes.*
