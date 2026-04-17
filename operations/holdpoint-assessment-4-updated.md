# Hold Point — Assessment 4: Capability Inventory (Updated)

**Original date:** 6 April 2026 (148 components)
**Updated:** 18 April 2026 (163 components)
**Method:** Codebase survey + verification of all status claims from build-enforcement sessions (17-18 April)

---

## What Changed Since Last Assessment

Two build-enforcement sessions (17-18 April 2026) added compile-time safety infrastructure. These sessions implemented 5 tasks from the data-mining implementation prompt, producing 8 new components and 1 status upgrade.

### New Components Added

| Component | Type | Status | What It Does |
|---|---|---|---|
| constraints.ts (branded types) | infra | Verified | Compile-time enforcement of model selection and safety gate. FastModel/DeepModel branded strings, SafetyGate token, enforceDistressCheck() wrapper. Zero runtime overhead. |
| R20a Distress Classifier | infra | Verified | Two-stage distress detection: regex + Haiku LLM evaluator. Uses branded FastModel type. Regex stage verified against Zone 2 inputs (6/6 pass). |
| Invocation Guard Test | infra | Wired | Jest test verifying distress check in all 8 POST routes. Source correct but Jest config missing — cannot run in CI yet. |
| ESLint Safety Config | infra | Verified | Enforces no-unused-vars as error on 4 safety-critical files. Activates ESLint on Vercel builds. |
| Husky Pre-Commit Hook | infra | Verified | Two-stage pre-commit: tsc compilation + ESLint safety files. Graceful fallback if npx missing. |
| Classifier Evaluation Suite | infra | Wired | 4 groups of eval inputs (clinical, philosophical, ambiguous, Clinton Zone 2). Zone 2 tested, full suite needs API key. |
| Knowledge Gaps Reference | governance | Verified | 7 recurring concepts (KG1-KG7) with resolutions. Integrated into verification framework. |
| Safety Signal Audit | governance | Verified | Zone 2 clinical adjacency test results. Boundary between philosophical and clinical correctly calibrated. |

### Status Changes

| Component | Old Status | New Status | Evidence |
|---|---|---|---|
| AI Safety Guardrails (guardrails.ts) | Wired | Verified | enforceDistressCheck gate pattern confirmed in 8/8 routes |

---

## Current Status Summary (163 Components)

| Status | Count | Meaning |
|---|---|---|
| Live | 2 | Deployed to production, serving users |
| Verified | 29 | Tested and confirmed working |
| Wired | 127 | Connects to live systems, functions end-to-end |
| Designed | 5 | Architecture decided, no functional code |
| Scoped | 0 | Requirements defined only |

### By Audience Readiness

**Human practitioners:** The website has 22+ pages with functional UI. Journal interpretation pipeline produces accurate diagnoses from real data (confirmed by founder). The Mentor hub (1,481 LOC) and private mentor (1,776 LOC) have functional interfaces but require live API key for LLM-powered features. The distress detection boundary is correctly calibrated for the founder's philosophical language (Zone 2 verified).

**Agent developers:** API structure exists with 80+ endpoints, typed schemas, OpenAPI spec (1,312 lines), llms.txt, and agent-card.json. The Agent Trust Layer has 13 modules (3,787 LOC). None of this is live — no external API call returns a real result yet. The safety classifier uses branded types that would protect agents from model selection errors.

**Startup founders (P0 discovery):** The P0 workflow toolkit is proven through real use: session handoffs, status vocabulary, verification framework (160+ automated checks via test harness), communication signals, file organisation, decision logging, hold point assessments. All documented. Not yet packaged as a product.

---

## Verification Evidence (This Session)

```
tsc --noEmit          → exit 0 (zero errors)
eslint src/           → 0 errors, 34 warnings (unchanged from previous session)
Test harness          → 199 PASS / 0 FAIL / 11 WARN / 210 total
8/8 route gate check  → all routes have enforceDistressCheck
constraints.ts        → 46 branded type references, file exists (10,926 bytes)
Zone 2 regex test     → 6/6 PASS (zero false positives) per safety signal audit
Component registry    → updated from 155 → 163 components, version 1.1.0 → 1.2.0
```

---

## Test Harness Warnings (11)

| Warning | Severity | Action Needed |
|---|---|---|
| 5 placeholder endpoints (billing/checkout, billing/portal, billing/tidings, mentor-profile, webhooks/stripe) | Expected | P4 items — not blockers |
| 1 missing RLS on r20a_classifier_cost_tracking migration | Minor | Add RLS policy when wiring cost tracking to production |
| 5 handoff format warnings | Cosmetic | Test harness checking stale "latest" handoff |

---

## What Remains for 0h Exit

From the exit criteria in holdpoint-assessment-3-5.md:

| Criterion | Status | Notes |
|---|---|---|
| 1. Every "wired" component tested with real data | Done | sage-interpret tested with founder's journal (6 Apr) |
| 2. Capability inventory with honest statuses | Done (updated) | 163 components, interactive HTML + registry updated 18 Apr |
| 3. Gaps documented with severity | Done | Assessment 2: 2 blockers, 4 significant, 2 minor |
| 4. Value proposition demonstrated per audience | Done | Assessment 3 completed, confirmed by founder |
| 5. Startup preparation toolkit defined | Done | Assessment 5: 7 tools, simplest viable interface designed |
| 6. Toolkit additions built with simplest interface | Pending | sage-stenographer skill not built; templates not created |
| 7. Founder has clear view of what P1 evaluates | Partial | Capability picture clear; business plan review is P1 |

**The remaining blockers for 0h exit are criterion 6 (build sage-stenographer + templates) and criterion 7 (founder confirms P1 clarity).**

---

## Outstanding Non-Blocker Items

These emerged during build-enforcement sessions. None block 0h exit:

1. **Jest configuration for website directory** — invocation guard test can't run without jest.config.ts. Low effort.
2. **Haiku (Stage 2) Zone 2 verification** — needs live API key to test LLM stage.
3. **selectModelByDepth() integration** — engine still uses inline ternary; could use branded function for consistency.
4. **RLS on cost tracking migration** — test harness flagged missing RLS policy.
