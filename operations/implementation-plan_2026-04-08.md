# Reconciled Implementation Plan

**Date:** 8 April 2026
**Sources:** Product Line Applications + Research Gap Analysis (both 8 April 2026)
**Purpose:** Single prioritised list merging both documents, classified by type, ready for batch approval

---

## How This Was Built

The product line applications document mapped 7 debrief learnings to improvements across 7 components. The research gap analysis identified 7 capability gaps by cross-referencing external research against our 29 active sage-* skills. I reconciled them by grouping overlapping items by component, removing duplicates, and sorting by two criteria:

1. **Circle 1 first** — items that improve how we work during P0 come before items that serve end users (Circle 3) or all agents (Circle 4).
2. **Wiring > Extension > New build** — connecting existing components unlocks the most value for the least effort.

---

## Reconciled List by Component

### Component: sage-reflect → Mentor Profile → Ring Wrapper BEFORE

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 1 | Wire sage-reflect output into Mentor profile updates (when reflect identifies a pattern like "underweights Circle 3 under pressure," that updates causal_tendencies in the profile) | Gap 3 | **Wiring** | Circle 1 — Mentor gets smarter from our reflections |
| 2 | Wire updated Mentor profile into ring wrapper BEFORE enrichment (next interaction is informed by the reflection) | Gap 3 | **Wiring** | Circle 1 — self-improving feedback loop |

**Current state:** sage-reflect is Wired (stores reflections in Supabase). Mentor profile is Wired (profile-store.ts loads/saves). Ring wrapper BEFORE reads the profile. The pieces exist — they just don't talk to each other.

---

### Component: Reasoning Receipts → Feedback Pipeline

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 3 | Build a feedback pipeline that aggregates receipts, identifies patterns (which actions score low? which passions recur?), and produces a performance profile | Gap 1 | **Wiring** (receipts + patterns API exist; the pipeline connecting them doesn't) | Circle 1 — Sage Ops improves from its own experience |

**Current state:** Receipts are Wired (stored in Supabase, queryable via GET /api/receipts with filtering and summary stats). A patterns endpoint exists (/api/patterns). What's missing is the pipeline that reads receipt patterns and feeds them back as improvement recommendations.

---

### Component: sage-stenographer

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 4 | Add debrief mode to sage-stenographer (reads session transcript, cross-references handoff notes and decision log, produces structured debrief per 0b-ii protocol) | Product Line L6 | **Extension** | Circle 1 — automates what we did manually on 8 April |

**Current state:** sage-stenographer has a SKILL.md definition with session-close and session-open modes. Scaffolded only (no TypeScript). Adding debrief mode extends the skill definition.

---

### Component: sage-reason

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 5 | Add per-stage quality scoring — each of the 6 mechanisms (control_filter, passion_diagnosis, oikeiosis, value_assessment, kathekon, iterative_refinement) gets an individual quality score alongside the final proximity score | Gap 2 | **Extension** | Circle 1 — our debrief analysis becomes more precise |
| 6 | Add `urgency_context` parameter — when present, applies additional scrutiny to passion_diagnosis for hasty assent patterns; outputs `hasty_assent_risk` field | Product Line L4 | **Extension** | Circle 1 — flags when urgency is compromising our reasoning |

**Current state:** sage-reason is Wired. The 6-stage pipeline exists in sage-reason-engine.ts. Stages are reported in output but not individually scored. No urgency awareness.

---

### Component: sage-guard

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 7 | Add `risk_class` input (Standard/Elevated/Critical) that auto-selects evaluation depth — Standard→quick(3), Elevated→standard(5), Critical→deep(6) — and requires `rollback_path` on Critical | Product Line L2 | **Extension** | Circle 1 — mirrors our adopted 0d-ii protocol |
| 8 | Add `deliberation_quality` field — assesses whether the decision was adequately deliberated, not just whether the action is virtuous | Product Line L1 | **Extension** | Circles 1+3 — decision process feedback |
| 9 | Add `considered_alternatives` requirement — when action is Critical + urgent, guardrail flags if no alternatives were evaluated | Product Line L4 | **Extension** | Circles 1+3 — prevents hasty assent on critical actions |

**Current state:** sage-guard is Wired. Uses sage-reason-engine.ts at quick depth. Single threshold parameter. No risk classification or deliberation assessment.

---

### Component: sage-decide

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 10 | Add optional `process` parameter — describes how options were identified and narrowed; scoring includes process quality alongside option rankings | Product Line L1 | **Extension** | Circles 1+3 — evaluates decision process, not just options |

**Current state:** sage-decide is Wired. Compares 2-5 options via sage-reason at standard depth. No process evaluation.

---

### Component: Sage Mentor

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 11 | Add confidence signalling to Mentor interaction protocol — distinguish observations (grounded in data), assumptions (limited data), and limitations (framework doesn't apply) | Product Line L3 | **Extension** | Circle 1 — our Mentor assessments become more trustworthy |

**Current state:** Mentor persona is Wired (persona.ts, 450+ lines). Profile persistence works. No confidence signalling in the interaction protocol.

---

### Component: Ring Wrapper

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 12 | Add action-category escalation to model routing — if proposed action touches auth/data deletion/access control, BEFORE always uses Sonnet regardless of agent authority | Product Line L2 | **Extension** | Circles 1+3 — mirrors R17f |
| 13 | Add side-effect detection to AFTER stage — checks if action changed state beyond intended scope, requires remediation before completion | Product Line L7 | **Extension** | Circles 1+3 — accountability for unintended consequences |

**Current state:** Ring wrapper is Wired (structure + token instrumentation). BEFORE has passion matching and model tier selection. AFTER evaluates output quality. Neither includes category escalation or side-effect detection.

---

### Component: sage-retro

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 14 | Implement debrief structure as core reasoning pattern — given a scenario, evaluate communication quality, assumption errors, verification gaps, and passion involvement | Product Line L6 | **Extension** | Circles 1+3 — structured retrospectives for any scenario |

**Current state:** sage-retro is Wired. Takes what_happened/decisions_made/outcomes and calls sage-reason. Adding the debrief structure extends its evaluation pattern.

---

### Component: Agent Trust Layer

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 15 | Add `signalling_quality` dimension to accreditation — measures whether agent communicates uncertainty honestly | Product Line L3 | **Extension** | Circle 3 — honest agents score higher |
| 16 | Add asymmetric trust dynamics — single Critical failure produces steeper downgrade than gradual accumulation; recovery requires consistent performance over multiple evaluations | Product Line L5 | **Extension** | Circle 3 — realistic trust modelling |

**Current state:** Agent Trust Layer is Scaffolded. Types defined, grade transition engine structured, but full evaluation integration pending. These items belong in P3 when the Trust Layer gets wired.

---

### Component: New Skills (don't exist yet)

| # | Item | Source | Type | Serves |
|---|---|---|---|---|
| 17 | sage-challenge — generates adversarial scenarios targeting an agent's specific weaknesses using the passion taxonomy | Gap 4 | **New build** | Circle 3 — serves R18d (adversarial evaluation) |
| 18 | sage-curriculum — given an agent's proximity level, generates evaluation scenarios at and slightly above their capability | Gap 6 | **New build** | Circle 3 — progressive training pathway |
| 19 | sage-reason-trace — returns full reasoning trajectories in fine-tuning-compatible format (JSONL) as a premium API feature | Gap 5 | **New build** | Circle 3 — new revenue stream |
| 20 | sage-context-rag — semantic search across Stoic Brain JSON files instead of returning complete files | Gap 7 | **Extension** (enhances existing sage-context) | Circle 4 — lowers barrier to Stoic knowledge |

---

## Priority Tiers

### Tier 1: Wiring (highest priority — connects what exists)

| # | Item | Type | Serves Now? |
|---|---|---|---|
| 1 | sage-reflect → Mentor profile update | Wiring | Yes — Circle 1 |
| 2 | Mentor profile → ring BEFORE enrichment | Wiring | Yes — Circle 1 |
| 3 | Receipts → feedback pipeline | Wiring | Yes — Circle 1 |

### Tier 2: Extensions serving P0 directly

| # | Item | Type | Serves Now? |
|---|---|---|---|
| 4 | sage-stenographer debrief mode | Extension | Yes — automates our 0b-ii |
| 5 | sage-reason per-stage scoring | Extension | Yes — sharper analysis |
| 6 | sage-reason urgency_context + hasty_assent_risk | Extension | Yes — our urgency protocol |
| 7 | sage-guard risk_class auto-depth | Extension | Yes — mirrors our 0d-ii |
| 8 | sage-guard deliberation_quality | Extension | Yes — verify-decide-execute |
| 9 | sage-guard considered_alternatives | Extension | Yes — Critical action check |
| 11 | Mentor confidence signalling | Extension | Yes — honest assessments |

### Tier 3: Extensions serving Circle 3 (defer to P3+)

| # | Item | Type | When |
|---|---|---|---|
| 10 | sage-decide process parameter | Extension | When sage-decide pipeline is being enhanced |
| 12 | Ring wrapper category escalation | Extension | When ring LLM integration is wired |
| 13 | Ring wrapper side-effect detection | Extension | When ring LLM integration is wired |
| 14 | sage-retro debrief structure | Extension | When sage-retro is being enhanced |
| 15 | Trust Layer signalling_quality | Extension | P3 — Trust Layer wiring |
| 16 | Trust Layer asymmetric dynamics | Extension | P3 — Trust Layer wiring |

### Tier 4: New builds (defer to P3+)

| # | Item | Type | When |
|---|---|---|---|
| 17 | sage-challenge | New build | P3 — serves R18d |
| 18 | sage-curriculum | New build | P3+ — differentiator |
| 19 | sage-reason-trace | New build | P4+ — revenue feature |
| 20 | sage-context-rag | Extension | P3+ — optimisation |

---

## Proposed First Batch (Tier 1 + highest-impact Tier 2)

### Batch 1A: The Self-Improving Loop (Wiring)

**Items 1 + 2: sage-reflect → Mentor profile → ring BEFORE**

- **What changes:** When sage-reflect identifies a reasoning pattern (e.g., "consistently underweights oikeiosis Circle 3 under time pressure"), it writes that finding to the Mentor profile's `causal_tendencies` and `passion_map`. The ring wrapper's BEFORE phase already reads the profile — so the next interaction automatically benefits from the reflection.
- **Files to modify:**
  - `/website/src/app/api/reflect/route.ts` — add profile update call after reflection is stored
  - `/sage-mentor/profile-store.ts` — add method to update causal_tendencies from reflection output
  - `/sage-mentor/ring-wrapper.ts` — verify BEFORE already reads updated profile fields (I'm confident it does based on the code structure, but need to confirm)
- **Risk level:** **Elevated** — changes existing user-facing functionality (reflect endpoint behaviour), adds a write path to the Mentor profile. No auth/session/deletion changes.
  - What could break: a malformed reflection could write bad data to the profile. Rollback: revert the reflect route to its current version; profile data is versioned in the ledger.
- **Verification:** After deployment, the founder runs a reflection via the API. Then checks the Mentor profile — the reflection's findings should appear in causal_tendencies. I'll provide the exact test command.

### Batch 1B: Debrief Automation (Extension)

**Item 4: sage-stenographer debrief mode**

- **What changes:** The SKILL.md definition gets a third trigger mode ("debrief") alongside "session close" and "session open." When triggered, it reads the session transcript, cross-references the decision log and recent handoff notes, and produces a structured debrief following the 0b-ii format.
- **Files to modify:**
  - `/.claude/skills/sage-stenographer/SKILL.md` — add debrief mode specification
- **Risk level:** **Standard** — additive change to a skill definition. No code, no API, no data changes.
- **Verification:** The founder triggers the skill in a session and checks that the output follows the 0b-ii debrief structure (what happened, communication failures, process failures, what changes, mentor observations).

### Batch 1C: Risk-Aware Guardrails (Extension)

**Item 7: sage-guard risk_class auto-depth**

- **What changes:** sage-guard accepts a new optional `risk_class` parameter (Standard/Elevated/Critical). When provided, it overrides the default quick depth: Standard→quick(3 mechanisms), Elevated→standard(5), Critical→deep(6). Critical responses also require a `rollback_path` field in the output.
- **Files to modify:**
  - `/website/src/app/api/guardrail/route.ts` — add risk_class to input validation, map to depth, add rollback_path to Critical responses
  - `/website/src/lib/sage-reason-engine.ts` — no changes needed (depth parameter already supported)
- **Risk level:** **Elevated** — modifies an existing API endpoint. The parameter is optional, so existing callers are unaffected. But sage-guard is a safety component, so changes need extra care.
  - What could break: if the depth mapping is wrong, Critical actions could get insufficient evaluation. Rollback: revert the guardrail route; the optional parameter means existing behaviour is unchanged.
- **Verification:** The founder sends three test requests (Standard, Elevated, Critical actions) and confirms: Standard returns quick-depth response, Elevated returns standard-depth, Critical returns deep-depth plus a rollback_path field. I'll provide exact curl commands.

---

## What's NOT in the First Batch (and why)

- **Per-stage scoring (item 5)** and **urgency_context (item 6)** — these modify sage-reason-engine.ts, which is the foundation of everything. I want to do the wiring batch first (items 1-2) and the guardrail extension (item 7) before touching the core engine. One batch at a time.
- **Feedback pipeline (item 3)** — this is wiring, but it's more complex than the reflect→profile connection. It needs a design decision about where aggregated patterns are stored and how they're surfaced. I'd propose designing this in the next batch.
- **Mentor confidence signalling (item 11)** — important, but it's a persona change, not a code change. It modifies how the Mentor communicates rather than what it can do. Can be done any time.

---

## Applicable Rules

- **R0:** This implementation follows the oikeiosis sequence — Circle 1 improvements first (our own reasoning and development), then Circle 3 (users and agent developers).
- **R4:** All changes stay within the existing API surface. No new IP exposure.
- **R5:** No new LLM costs from Batch 1A or 1B. Batch 1C increases cost only for Critical-classified actions (which switch from quick to deep depth). This is appropriate — Critical actions should cost more to evaluate.
- **R6b:** Per-stage scoring (deferred item 5) will need careful design to avoid scoring virtues independently. Flagging this now for when we reach it.
- **R12:** All changes route through sage-reason-engine.ts, which enforces 2+ mechanisms.
- **R14:** Reflect→profile updates will be captured in the mentor ledger (audit trail).
- **R17f:** The sage-guard risk_class extension directly implements R17f's principle that the category of action determines the scrutiny.

## Rule Conflicts

None identified. The changes are additive and route through existing infrastructure.

---

## Waiting for Approval

Clinton — this is the proposal. The three batches (1A, 1B, 1C) are independent of each other and can be done in any order. I recommend starting with 1B (sage-stenographer debrief mode) because it's the lowest risk and we can test it immediately in this session.

Your call. Which batches do you want to proceed with, and in what order?
