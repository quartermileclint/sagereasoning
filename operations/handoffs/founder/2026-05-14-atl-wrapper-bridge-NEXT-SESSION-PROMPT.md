# Next-Session Prompt — ATL Wrapper Session 1: `/trust-layer/` Codebase Survey + the Substrate↔ATL Bridge

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk expected under 0d-ii. The build session confirms at the Step 2 design gate and reclassifies upward if (a) the build touches the live `/api/reason` path, (b) it exposes a new API surface — the public accreditation endpoint would reclassify to **Critical** (auth surface), or (c) it modifies the open `Layer1Schema` contract — **Elevated**. None of those are in this session's scope (see "does NOT do"). Critical Change Protocol NOT engaged at open. AC7 not engaged. PR6 not engaged (no R20a surface).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md`, read in full; plus the `/trust-layer/` codebase (the survey target).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-14-philosophical-mode-build-close.md`.
**Predecessor decision-log entry:** `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14` (confirm at session open).
**Risk classification:** **Standard** under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged. PR6 not engaged. PR1 engaged — the mapping function is the single-endpoint proof of the substrate↔ATL bridge pattern.

---

## Why this session matters

The ATL Wrapper is the structure that turns the substrate into a trust layer for *agents* — the agent equivalent of what the private mentor is for humans. Its spec (Adopted 2026-05-14) is explicit that it is **not a single build session**: it intersects the existing `/trust-layer/` codebase (a substantial 3 April 2026 offline framework — ~4,200 lines, "all 5 priorities complete"), the substrate build arc, and Priority 3 of the project instructions. The spec gives a recommended 7-step build sequence.

This session does the **first two steps**: read the full `/trust-layer/` codebase, then write the **`Layer2Assessment → EvaluatedAction` mapping function** — "the bridge." The bridge is the central reconciliation move of the whole ATL Wrapper: the existing `/trust-layer/` build was designed pre-substrate to consume "ReasoningReceipts" from the old bundled engine; the bridge makes the substrate's signed `Layer2Assessment` the source of `EvaluatedAction` instead, so the existing window-aggregator / grade-engine / badge infrastructure can run on substrate output. Everything else in the ATL arc depends on this bridge existing. It is the PR1 single-endpoint proof for the ATL arc, and it mirrors the philosophical-mode session shape exactly: survey the surface, write one pure deterministic function + its test, verify.

It builds entirely as new code, not wired to any route — no production exposure this session.

## Pre-conditions

1. **Predecessor session committed.** `git log --oneline -3 origin/main` shows the philosophical-mode build commit (`3e6c559` or later); `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock` — per the predecessor close. Also delete `website/_capture-tmp.ts` if it is still present (`rm -f website/_capture-tmp.ts`).
2. **The predecessor decision-log entry** (`D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`) is in `/operations/decision-log.md`. Confirm at session open.
3. **The four ATL Layer-1 carried-context fields already exist** as optional placeholders in `layer1-extractor.ts` (`carried_profile`, `profile_provenance`, `peer_agent_assessments`, `objective_function_declaration`) — added under `D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14`. This session does NOT modify Layer 1; it only confirms the field names against the ATL Wrapper spec.
4. **Founder commits to a ~3.5–4 hr bounded build session.**

## What this session does — and does NOT do

**Does:**
- Read the **full `/trust-layer/` codebase** — all 14 files (~4,200 lines), not just the types. The spec read "types + BUILD-LOG"; this session reads `accreditation-record.ts`, `public-endpoint.ts`, `window-aggregator.ts`, `grade-transition-engine.ts`, `authority-mapper.ts`, `accreditation-card.ts`, the progression files, and the DRAFT schema in full.
- Survey the substrate side — confirm the `Layer2Assessment` shape and the signature/`span_id` surface the mapping draws on.
- Run a **consolidated design-decision gate** (Step 2) on the questions that block the bridge — chiefly the **tsconfig-boundary problem** (see Step 2).
- Build and verify the **`Layer2Assessment → EvaluatedAction` mapping function** — the bridge — per the spec's mapping table. PR1 single-endpoint proof; PR2 build-to-wire-verification immediate (a test invokes it in the same session).

**Does NOT:**
- Build **Component 2** (the Layer 3 agent-mode rendering — the score architecture, gaming defences, caveats). That is the spec's sequencing step 3, and it is the natural home for the **score architecture philosophical mode deferred** — see "The score-architecture thread" below.
- Build **the wrapper itself** (Components 1, 4, 5 — carriage, trajectory, iteration patterns), **the badge** (Component 3), or **adversarial evaluation** (R18d) — spec steps 5, 6, 7.
- **Touch Layer 1.** The four carried-context placeholder fields already exist; wiring them is spec step 4 (Elevated — open-contract versioning).
- **Expose any API surface.** The public accreditation endpoint (`GET /accreditation/{agent_id}`) is spec step 6 and is an auth surface — Critical. If a new surface is genuinely needed for the bridge, stop and re-scope.
- **Touch `/api/reason`**, env vars, schema, or the R20a perimeter.
- Resolve all 9 of the spec's "open questions deferred to build" — only the ones that block the bridge (Step 2).

## The score-architecture thread (carry-forward from the philosophical-mode build)

Philosophical mode's build deferred its Score vector + Scalar score sections because the substrate score architecture does not exist (`D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`, PR7). That score architecture lives in **Component 2 of the ATL Wrapper spec** — spec sequencing **step 3**. So the ATL arc's step 3 is where the score architecture finally gets built, and building it there resolves the philosophical-mode deferral *and* unblocks standard mode's score sections. **This session (step 1–2, the bridge) does not touch the score** — the `EvaluatedAction` mapping needs no score (see the mapping table) — but the founder should hold this thread: when the ATL arc reaches step 3, flag the philosophical-mode and standard-mode deferrals for resolution in the same work.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, lean templates, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the seven decisions; open-questions parking lot.
3. `/operations/handoffs/founder/2026-05-14-philosophical-mode-build-close.md` (~3 min) — predecessor close; note the dispatch-pattern + survey-then-build session shape this session reuses.
4. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — **in full** (~15 min). The deliverable-of-the-day. Pay attention to: the five components, the `Layer2Assessment → EvaluatedAction` mapping table, the reconciliation table, the 7-step build sequencing, and the 9 open questions.
5. `/operations/decision-log.md` — last 3 entries.
6. **PR15 consult — before electing the bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching deterministic structured-data mapping; `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session (F4 — AC10/AP2 mandate alignment — names the carried profile as an AP2-style accumulated-mandate structure; relevant to the *wrapper*, spec step 5, not the bridge). State whether an Anthropic-canonical primitive could deliver the mapping outcome before electing bespoke; record the justification in the decision-log entry. (Note: the spec flags Anthropic's **multi-agent orchestration** primitive as load-bearing for Component 5 — that is spec step 5, not this session.)

**Confirm at session open:** tier (`code-standard`, Standard risk expected); hold-point status (P0 0h active); **model selection — N/A** (the mapping function is a deterministic pure projection, like the philosophical-mode renderer — no LLM call); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`); signals + risk classification; PR11 inbox scan (`/inbox/` for files dated since the predecessor session — summarise inline or state none).

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)

Recommend: spec sequencing steps 1–2 in one session — read the full `/trust-layer/` codebase, then build + verify the `Layer2Assessment → EvaluatedAction` mapping function. If the `/trust-layer/` survey runs long (it is ~4,200 lines), the natural sub-scope is: survey only this session, the bridge build next. Founder elects. **Note:** like the philosophical-mode survey (which surfaced the score-architecture gap), the `/trust-layer/` survey may surface findings that reshape the ATL arc's remaining steps — that is expected and useful in the P0 R&D phase.

### Step 1 — Survey the `/trust-layer/` codebase + the substrate side (~40–55 min)

Read in full: `/trust-layer/BUILD-LOG.md`, `/trust-layer/types/evaluation.ts` (the `EvaluatedAction` + `WindowSnapshot` shapes — the mapping *target*), `/trust-layer/types/accreditation.ts`, `/trust-layer/types/progression.ts`, `/trust-layer/evaluation-window/window-aggregator.ts` (what consumes `EvaluatedAction[]`), `/trust-layer/grade-engine/grade-transition-engine.ts`, `/trust-layer/accreditation/accreditation-record.ts`, `/trust-layer/accreditation/public-endpoint.ts`, `/trust-layer/card/accreditation-card.ts`, `/trust-layer/authority/authority-mapper.ts`, `/trust-layer/progression-toolkit/pathways.ts` + `sage-tools.ts`, `/trust-layer/schema/trust-layer-schema-REVIEW.sql`, `/trust-layer/index.ts`. On the substrate side, re-confirm the `Layer2Assessment` shape (`/website/src/lib/translation-sandwich/layer2-mechanisms.ts`) and the signature / `span_id` surface (`/website/src/lib/substrate/layer3-service.ts` `meta.span_id`; `/website/src/lib/translation-sandwich/layer2-signer.ts`).

Output (~12–15 lines in-chat): the exact `EvaluatedAction` field inventory; which fields the spec's mapping table covers cleanly and which need a derivation decision (`receipt_id`, `evaluated_at`, `skill_id`); what `window-aggregator.ts` requires of an `EvaluatedAction`; and — critically — the **module-boundary finding** (see Step 2).

### Step 2 — Design-decision gate (consolidated; founder approval; ~15–20 min)

Surface as one consolidated change set per Rule B(iv). The bridge-blocking decisions:

- **The tsconfig-boundary problem (load-bearing).** `/trust-layer/` sits **outside `website/`'s tsconfig root** — the `D-LAYER1-SCHEMA-ADDITIONS` entry already noted this ("`/trust-layer/` types … sit outside `website/`'s tsconfig root and would break the compile"). So a bridge function in `website/src/lib/substrate/` **cannot directly import `EvaluatedAction` from `/trust-layer/types/evaluation.ts`**. Options to put before the founder: (a) mirror the `EvaluatedAction` type into `website/src` as a local interface the bridge targets; (b) bring `/trust-layer/` under `website/`'s tsconfig; (c) relocate the shared ATL types into `website/src`; (d) a shared types package. Recommend an option with reasoning; the founder confirms. This decision shapes where the bridge lives and how the rest of the ATL arc imports across the boundary.
- **Where the bridge function lives** — follows from the boundary decision.
- **`receipt_id` / `evaluated_at` / `skill_id` derivation** — the spec's mapping table says `receipt_id` is "derived from the Layer 2 signature / `span_id`," `evaluated_at` from the "substrate response timestamp," `skill_id` from "the consumer context / `prose_mode`." Confirm the exact derivation from what the substrate actually exposes.
- **Unmapped / partially-mapped `EvaluatedAction` fields** — decide how the mapping handles any `EvaluatedAction` field the `Layer2Assessment` does not cleanly source (the philosophical-mode session's lesson: surface the gap, do not paper over it).

### Step 3 — Build the bridge (PR1 + PR2; ~50–75 min)

Build the `Layer2Assessment → EvaluatedAction` mapping function per the spec's mapping table and the Step 2 decisions. A pure, synchronous, deterministic projection — same `Layer2Assessment` in, same `EvaluatedAction` out. PR1: this is the single-endpoint proof of the substrate↔ATL bridge pattern. PR2: wire + verify in the same session — a test invokes the mapping function (grep for invocation, not just definition).

### Step 4 — Verify

Test fixtures: the mapping is correct for a fully-populated `Layer2Assessment`; correct for a minimal one; deterministic (same input → byte-identical `EvaluatedAction`); the produced `EvaluatedAction` is shape-valid for what `window-aggregator.ts` consumes; the `receipt_id` / `evaluated_at` / `skill_id` derivations behave as decided at Step 2. `tsc --noEmit` clean. Run the philosophical-mode + A5 + A7 regressions (expected: 37/0; 28/0; 33/0 — unchanged, since this session adds new code only). PR10 PEV Verify step — classify any diagnostic finding's certainty.

### Step 5 — Append decision-log entry (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-ATL-BRIDGE-WIRED-VERIFIED-YYYY-MM-DD`. Rules served expected: 0a, 0c, 0d-ii, 0f, R4 (IP boundary — the `AccreditationPayload` R4 discipline; the bridge maps to `EvaluatedAction`, no engine internals), AC8, PR1, PR2, PR10, PR11, PR15. Record the Step 2 tsconfig-boundary decision and its reasoning.

### Step 6 — Session close (lean form)

`/operations/handoffs/founder/YYYY-MM-DD-atl-bridge-close.md` per the lean session-close template (code-standard → lean). "Next Session Should" names the spec's sequencing step 3 — **the Layer 3 agent-mode rendering (Component 2)** — and flags that step 3 is where the score architecture gets built, resolving the philosophical-mode (and standard-mode) score deferrals. Carry forward any `/trust-layer/` survey findings that reshape the ATL arc's remaining steps.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ATL Wrapper spec + PR15 consult (Part A) | 30–35 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey `/trust-layer/` + the substrate side | 40–55 min |
| Step 2 — design-decision gate (tsconfig boundary + derivations) | 15–20 min |
| Step 3 — build the bridge | 50–75 min |
| Step 4 — verify | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4 hr** |

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The bridge is new code, imported by no route — reverting removes the mapping function; `/api/reason`, `/api/substrate/layer3`, and the existing `/trust-layer/` codebase are unaffected either way. No production behaviour change; no data loss; no user impact.

## Forecast

A successful session produces the `Layer2Assessment → EvaluatedAction` mapping function — the bridge — Verified, with the tsconfig-boundary decision made and recorded. The substrate↔ATL connection is proven on one mapping (PR1); the existing `/trust-layer/` window-aggregator / grade-engine / badge infrastructure now has a substrate-fed input path. Next after this: spec sequencing step 3 — the Layer 3 agent-mode rendering (Component 2), which is also where the deferred score architecture gets built. The `/trust-layer/` survey may surface findings that reshape the arc's remaining steps — captured in the close.

End of prompt.
