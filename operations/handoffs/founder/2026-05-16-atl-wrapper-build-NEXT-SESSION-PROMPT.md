# Next-Session Prompt — ATL Wrapper Session 5: The Wrapper (Components 1 + 4 — carried-profile + trajectory awareness)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk expected under 0d-ii. This session builds new library modules in `website/src/lib/substrate/` that consume the now-Verified `atl-bridge.ts` and the existing `/trust-layer/` window/grade infrastructure. Nothing is wired to a route; no env flag; no auth, encryption, R20a-perimeter, or deployment-configuration surface. AC7 not engaged. PR6 not engaged — the wrapper does not touch the R20a distress classifier, Zone 2 / Zone 3 logic, or their wrappers. **One caveat surfaced explicitly below:** the `/trust-layer/` integration-boundary decision (Step 2) *could* resolve to a build-config change (bringing `/trust-layer/` under `website/`'s tsconfig) — if it does, that piece is **Elevated** and the founder reclassifies at Step 2. PR1 engaged — `atl-bridge.ts` was the single-endpoint proof of the substrate↔ATL bridge pattern; this session is the wrapper that consumes it.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — read **in full**, especially §"The existing ATL build", §"Component 1 — The Wrapper / carried-profile mechanism", §"Component 4 — Trajectory awareness", §"Reconciliation table", §"Build sequencing", §"Open questions deferred to build" — plus the `/trust-layer/` window/grade files named in Part A, and `/website/src/lib/substrate/atl-bridge.ts` (the bridge the wrapper consumes — re-read its header's tsconfig-boundary commentary).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-15-philosophical-mode-score-wiring-close.md`.
**Predecessor decision-log entry:** `D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15` (confirm at session open).

---

## Why this session matters

The ATL Wrapper spec's build-sequencing names seven steps. Four are done:

- **Step 2 — the bridge** (`Layer2Assessment → EvaluatedAction` mapping): `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15` — `atl-bridge.ts` Verified.
- **Step 3 — the Layer 3 agent-mode rendering** (Component 2, per-assessment level): `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15` — `agent-mode-service.ts` Verified. (The substrate score architecture it consumes — `score-architecture.ts` — is also Verified, and has a second wired consumer in philosophical mode as of `D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15`.)
- **Step 4 — the Layer 1 schema additions** (the four optional carried-context fields `carried_profile` / `profile_provenance` / `peer_agent_assessments` / `objective_function_declaration`, plus the four private-mode fields): `D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14` — all eight optional fields on `Layer1Schema`, shape-checked by `validateLayer1Schema`, `layer1-schema-additions.test.ts` at 33/0. **Note:** the predecessor handoffs (the agent-mode close, the ATL Wrapper Session 4 prompt) carried a stale "step 4 = next session" line — step 4 was already Verified on 2026-05-14, before the 2026-05-15 build arc. This is corrected in the predecessor close's "Next Session Should".

The genuine next step is **step 5 — the wrapper itself**: the structure that takes an agent's substrate consultations, maps each via the bridge, **accumulates them into a carried profile** (Component 1), and **aggregates that profile into trajectory awareness** — a `WindowSnapshot` plus a grade (Component 4). The wrapper is to an agent what the private mentor is to a human: the continuity-bearing relationship around the per-assessment substrate calls. After this session the carried-profile mechanism is real — which unblocks Component 5 (the three iteration patterns), Component 3 (the badge — step 6, which reads the `WindowSnapshot`), and the trajectory-enriched developer hand-back report (deferred since the agent-mode rendering session).

## The build state going in — a lot is already built

This session is mostly *wiring already-Verified pieces together*, not net-new design:

- `atl-bridge.ts` — `mapLayer2AssessmentToEvaluatedAction(assessment, bridgeContext) → EvaluatedAction`, Verified. The wrapper calls this once per substrate consultation. It already mirrors `EvaluatedAction` / `KatorthomaProximityLevel` / `RootPassionId` into `website/src` (the tsconfig-boundary workaround).
- `/trust-layer/evaluation-window/window-aggregator.ts` — `computeWindowSnapshot(...)` — aggregates `EvaluatedAction[]` into a `WindowSnapshot`. **Built 3 April 2026; not yet consumed from `website/src`.**
- `/trust-layer/grade-engine/grade-transition-engine.ts` — `evaluateGradeTransition(...)` — grade transitions with hysteresis. **Built; not yet consumed from `website/src`.**
- `Layer1Schema.carried_profile` (+ `profile_provenance`) — the optional Layer 1 field the wrapper populates when it carries the accumulated profile back into the agent's next Layer 1 input. Verified.
- `agent-mode-service.ts` — the Component 2 rendering. Not modified this session, but the wrapper's eventual hand-back report (a later session) consumes it.

## The one genuine design problem — the `/trust-layer/` integration boundary

`/trust-layer/` sits **outside `website/`'s tsconfig root** — there is no root-level or `/trust-layer/` tsconfig, and `website/tsconfig.json`'s `include` globs are rooted at `website/`. The bridge session (`D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`) hit this and resolved it for *one type* by **mirroring** `EvaluatedAction` (+ two dependency enums) into `atl-bridge.ts`. The bridge session explicitly rejected "bringing `/trust-layer/` under the tsconfig" as *"a structural change larger than the bridge"* — and logged, as a carried-forward open question, that *"a later ATL session (the wrapper build, spec step 5) consolidates the `/trust-layer/` ↔ `website` boundary."*

**That later session is this one.** The wrapper needs the *logic* of `computeWindowSnapshot` and `evaluateGradeTransition` — not just types. Mirroring two whole logic modules is materially more than mirroring a type. This is the **Step 2 design-decision gate**, and it must be resolved before any wrapper code is written. The options (the build session confirms the choice with the founder):

- **(a) Port the two functions into `website/src/lib/substrate/`** — consistent with the bridge's mirroring precedent; keeps everything inside one tsconfig; but it is logic, not types — a real port, and it creates a manual-sync point with `/trust-layer/`.
- **(b) Bring `/trust-layer/` under `website/`'s tsconfig** (an `include` addition, or a `/trust-layer/` tsconfig + project references) — the bridge session deferred exactly this decision to the wrapper build; it makes the existing `/trust-layer/` code directly importable and avoids ongoing mirror-sync, but it is a build-configuration change (**Elevated** under 0d-ii — the founder reclassifies the session if (b) is elected) and pulls `/trust-layer/`'s never-strict-compiled code under `tsc`.
- **(c) A shared package / a narrower `/trust-layer/` tsconfig that exposes only the window/grade modules** — a middle path.

The build session surfaces these with a recommendation and reasoning at Step 2; the founder elects. This decision shapes everything downstream — it is the session's load-bearing choice.

## Pre-conditions

1. **The predecessor session is committed + pushed; Vercel green.** `git log --oneline -3 origin/main` shows the score-wiring commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock` — per the predecessor closes ("I caused this").
2. **`D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15` is in `/operations/decision-log.md`.** Confirm at session open.
3. **The four prior ATL build outputs are Verified:** `atl-bridge.ts`, `score-architecture.ts`, `agent-mode-service.ts`, and the Layer 1 carried-context fields (`D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14`). Confirm `git status` clean and the test suites green as a session-open regression check.
4. **The `/trust-layer/` codebase is present and unchanged** — 14 files; `window-aggregator.ts` and `grade-transition-engine.ts` are the load-bearing ones for this session.
5. **Production state unchanged** — substrate at A7 Verified; all substrate env flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503.
6. **Founder commits to a ~3–4 hr bounded build session.**

## What this session does — and does NOT do

**Does:**
- Read the ATL Wrapper spec **in full**, the `/trust-layer/` window/grade files, `atl-bridge.ts` (re-read the tsconfig-boundary header), and the last three decision-log entries.
- Run the **Step 2 design-decision gate** — the `/trust-layer/` integration boundary (the load-bearing choice above), plus: the carried-profile data structure (the accumulating `EvaluatedAction[]` + provenance); whether the carried profile is server-side persisted or wrapper-side only (spec open question 2 — the spec recommends wrapper-side carriage, no server persistence for the carried profile this session; the badge's server persistence is step 6); how the wrapper holds `agent_id` (the bridge supplies it via `BridgeContext` — the wrapper can carry it as an opaque wrapper-supplied string; *authenticating* it is A10, deferred — spec open question 8).
- Build **Component 1 — the wrapper / carried-profile mechanism**: a module that, given an agent's substrate consultations, maps each `Layer2Assessment` via `atl-bridge.ts`, accumulates the `EvaluatedAction`s into a carried profile, and produces the `carried_profile` payload to attach to the agent's next `Layer1Schema` input.
- Build **Component 4 — trajectory awareness**: wire the accumulated `EvaluatedAction[]` through `computeWindowSnapshot` (→ `WindowSnapshot`) and `evaluateGradeTransition` (→ the grade + transition result), per whatever the Step 2 integration decision resolved.
- Write a test suite for the new module(s) — PR2 build-to-wire verification immediate (the test invokes the wrapper in the same session). Run the prior-arc regressions (`atl-bridge` 31/0, `score-architecture` 69/0, `agent-mode-service` 63/0, `philosophical-mode-service` 43/0, `layer3-service` 28/0, `r20a-gate` 33/33, `layer1-schema-additions` 33/0).
- Append a lean decision-log entry; write a lean session close.

**Does NOT:**
- Build **Component 5 — the three iteration patterns** (sequential loop / parallel evaluation / multi-agent orchestration). That is ATL Wrapper Session 6. Pattern 3 (multi-agent orchestration) carries a load-bearing **PR15 consult** — the spec flags Anthropic's multi-agent-orchestration primitive (public beta) as a named primitive the build session must evaluate before electing a bespoke build. Out of scope here; named in the close's "Next Session Should".
- Build **Component 3 — the badge** (`AccreditationRecord` / `AccreditationPayload` / `public-endpoint.ts` / `accreditation-card.ts`, Supabase-integrated). That is step 6 — it adds a public verification endpoint (an auth + a route surface — higher-risk) and the existing build's pending Supabase integration.
- Build the **trajectory-enriched developer hand-back report** — it draws on the now-buildable `WindowSnapshot` + the badge's `AccreditationRecord` / `AccreditationCard`; it waits for the badge (step 6).
- Touch the **progression toolkit** (`/trust-layer/progression-toolkit/`) — spec open question 1 ("part of the wrapper, or a separate ATL surface?") is unresolved and explicitly deferred.
- Approve or migrate the **DRAFT 5-table `/trust-layer/` schema** — schema disposition is spec open question 2; this session keeps the carried profile wrapper-side (no server persistence), so no schema work. If the Step 2 design surfaces a genuine need for server-side persistence, **stop and re-scope** — that engages a schema migration (Standard, but its own deliberate act).
- Touch **`/api/reason`**, env vars, the R20a perimeter, `agent-mode-service.ts`, `score-architecture.ts`, `philosophical-mode-service.ts`, or any auth surface. (PR6 not engaged.)
- **Expose any API surface.** The wrapper is library code this session. If a new surface seems needed, stop and re-scope.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, lean templates, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the seven decisions; Rule A (licensing gate) + Rule B (holistic second pass); the K-category.
3. `/operations/handoffs/founder/2026-05-15-philosophical-mode-score-wiring-close.md` (~4 min) — predecessor close; note the corrected "Next Session Should" (the stale step-4 framing) and the carried-forward findings.
4. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — **in full** (~12 min). The deliverable-of-the-day. Especially §"The existing ATL build", §"Component 1", §"Component 4", §"Component 5" (read for context — not built this session), §"Reconciliation table", §"Build sequencing", §"Open questions deferred to build".
5. `/trust-layer/BUILD-LOG.md` (~4 min) — the 3 April 2026 build record + the pending-items list.
6. `/trust-layer/types/evaluation.ts` (~5 min) — `EvaluatedAction`, `WindowConfig`, `WindowSnapshot`, `DimensionDetail` — the shapes the wrapper produces and consumes.
7. `/trust-layer/evaluation-window/window-aggregator.ts` (~6 min) — `computeWindowSnapshot` — the Component 4 aggregation logic the wrapper drives.
8. `/trust-layer/grade-engine/grade-transition-engine.ts` (~6 min) — `evaluateGradeTransition` + `TransitionResult` / `TransitionTrigger` — the Component 4 grade logic.
9. `/website/src/lib/substrate/atl-bridge.ts` (~5 min) — the bridge the wrapper consumes: `mapLayer2AssessmentToEvaluatedAction`, `BridgeContext`, the mirrored `EvaluatedAction`; **re-read the module header's tsconfig-boundary commentary** — it names the "wrapper build consolidates the `/trust-layer/` ↔ `website` boundary" open question this session resolves.
10. `/website/src/lib/substrate/agent-mode-service.ts` + `score-architecture.ts` (~5 min, targeted) — the worked deterministic-projection patterns; what's already available for the eventual hand-back report.
11. `/operations/decision-log.md` — last 3 entries (`D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15`, `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15`, `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15` — the bridge entry carries the `/trust-layer/` tsconfig-boundary open question this session closes).
12. **PR15 consult — before electing any bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching the session's scope (deterministic accumulation / aggregation plumbing — the same finding as the bridge / score / agent-mode builds is expected: no Anthropic primitive delivers an in-process TypeScript accumulator; bespoke is correct); `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session. **Note F4** — the ATL Wrapper spec's cross-references flag F4 (AC10 / AP2 mandate alignment) as contextually relevant ("the wrapper's carried profile is an AP2-style accumulated-mandate structure"), but F4's *target session* is A12 (OpenTelemetry instrumentation), not this one — a contextual note, not a fold-in. State whether an Anthropic-canonical primitive could deliver the outcome before stating the bespoke election; record the justification in the decision-log entry. PR11 inbox scan: `/inbox/` for files dated since the predecessor session — summarise inline or state none.

**Confirm at session open:** tier (`code-standard`, Standard risk expected — with the `/trust-layer`-tsconfig caveat); hold-point status (P0 0h active); model selection — **N/A** (the wrapper is deterministic plumbing — accumulate `EvaluatedAction[]`, drive `computeWindowSnapshot` / `evaluateGradeTransition`; no LLM call); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`); signals + risk classification; PR11 inbox scan result.

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)

Recommend: **Components 1 + 4 — the wrapper core + trajectory awareness.** Together they "make the carried profile real" (accumulate → aggregate → grade) and are tightly coupled. The alternative, if the Step 2 `/trust-layer/` integration decision proves large: **narrow to Component 1 + the integration decision only**, deferring Component 4's grade-engine wiring to a follow-on. Component 5 (the three iteration patterns) is ATL Wrapper Session 6 regardless. Founder elects. **Note:** reading the spec + the `/trust-layer/` window/grade files in full may surface findings that reshape the scope — that is expected and useful in the P0 R&D phase.

### Step 1 — Survey the integration surface (~30–40 min)

Read `window-aggregator.ts` + `grade-transition-engine.ts` + `types/evaluation.ts` with `atl-bridge.ts`'s mirrored `EvaluatedAction` in hand. Confirm: does the bridge's mirrored `EvaluatedAction` match `/trust-layer/`'s `EvaluatedAction` field-for-field (the bridge mirrored it — verify no drift)? What exactly does `computeWindowSnapshot` need as input (an `EvaluatedAction[]` + a `WindowConfig`?), and what does it return? What does `evaluateGradeTransition` need? Output (~12–15 lines in-chat): the integration-boundary options and a recommendation; the `EvaluatedAction[]` accumulation shape; the `carried_profile` payload shape the wrapper attaches to the next `Layer1Schema`; where `agent_id` / provenance come from; which spec open questions this session resolves vs defers.

### Step 2 — Design-decision gate (consolidated; founder approval; ~20 min)

Surface as one consolidated change set per Rule B(iv). The decisions likely to block the build:

- **The `/trust-layer/` integration boundary** — options (a) port the two functions / (b) bring `/trust-layer/` under tsconfig / (c) a middle path (see "The one genuine design problem" above). Recommend one with reasoning. **If (b) is elected, the session — or that piece of it — is reclassified Elevated** (a build-configuration change); the founder confirms the reclassification.
- **The carried-profile data structure** — the accumulating `EvaluatedAction[]` plus the provenance attestation (`profile_provenance`); the module location (a new `website/src/lib/substrate/atl-wrapper.ts` + test, mirroring the bridge / score / agent-mode file shape).
- **Storage** — wrapper-side carriage, no server-side persistence for the carried profile this session (spec open question 2; the badge's server persistence is step 6). Confirm explicitly.
- **`agent_id` holding** — the wrapper carries it as a wrapper-supplied opaque string; *authenticating* it is deferred to A10 (spec open question 8). Confirm explicitly.
- **The `carried_profile` ↔ `Layer1Schema` contract** — the shape the wrapper writes into `Layer1Schema.carried_profile` (the `WindowSnapshot`, or the raw `EvaluatedAction[]`, or both — the spec leaves this to the build session; `Layer1Schema.carried_profile` is typed permissively as `Record<string, unknown> | null`).

### Step 3 — Build (PR1 next consumer; PR2; ~70–90 min)

Build per the Step 2 decisions. PR1: `atl-bridge.ts` was the single-endpoint proof of the substrate↔ATL pattern; the wrapper is its next consumer — keep the wrapper a pure, synchronous, deterministic accumulator + aggregator (no clock read beyond what the bridge's `BridgeContext` already supplies; no I/O; no LLM call). PR2: the test invokes the wrapper in the same session — build-to-wire verification is immediate.

### Step 4 — Verify

Write `atl-wrapper.test.ts` (or per the Step 2 module decision): the wrapper accumulates `EvaluatedAction`s in sequence; `computeWindowSnapshot` is driven correctly off the accumulated profile; `evaluateGradeTransition` produces a grade; the `carried_profile` payload round-trips into a valid `Layer1Schema` (re-use `validateLayer1Schema`); determinism + no-mutation invariants. `tsc --noEmit` clean. Run the regressions: `atl-bridge.test.ts` (31/0), `score-architecture.test.ts` (69/0), `agent-mode-service.test.ts` (63/0), `philosophical-mode-service.test.ts` (43/0), `layer3-service.test.ts` (28/0), `r20a-gate.test.ts` (33/33), `layer1-schema-additions.test.ts` (33/0), and the new wrapper test at its count. PR10 PEV Verify step — classify any diagnostic finding's certainty. Note the sandbox env-var caveat from the predecessor closes: tests that transitively import `philosophical-mode-service.ts` / `retrieve-passages.ts` / `supabase-server.ts` need the `.env.local` Supabase vars resolvable on import (or dummy import-resolution vars supplied in-session).

### Step 5 — Append decision-log entry (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-ATL-WRAPPER-WIRED-VERIFIED-YYYY-MM-DD`. Record the Step 2 decisions and their reasoning — especially the `/trust-layer/` integration-boundary resolution (it closes the bridge session's carried-forward open question). Rules served expected: 0a, 0c, 0d-ii, 0f, R4, R18 (a–e — the wrapper is the carried-profile mechanism the badge certifies), R17e (named as NOT applying to agent profiles — the load-bearing distinction), AC8, PR1 (next consumer of the bridge), PR2, PR10, PR11, PR15. If the integration decision was (b), record the Elevated reclassification.

### Step 6 — Session close (lean form)

`/operations/handoffs/founder/YYYY-MM-DD-atl-wrapper-build-close.md` per the lean session-close template. "Next Session Should" names **ATL Wrapper Session 6 — Component 5 (the three iteration patterns)**, with the load-bearing **PR15 consult** on Anthropic's multi-agent-orchestration primitive for pattern 3; and **step 6 — the badge** (Component 3 — `AccreditationRecord` / `public-endpoint.ts` / `accreditation-card.ts`, Supabase-integrated; a public verification endpoint — higher-risk, an auth + route surface). Carry forward: the spec-hygiene finding (the Adopted ATL Wrapper spec §Component 2 still owes the superseded agent-mode spec's content inline + the accumulated rendering-detail decisions); the trajectory-enriched developer hand-back report (now buildable once the badge lands); the progression-toolkit relationship (spec open question 1); the DRAFT 5-table schema disposition (spec open question 2); the agent-identity authentication (spec open question 8 — connects to A10).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ATL Wrapper spec + `/trust-layer/` window/grade files + `atl-bridge.ts` + decision log + PR15 consult (Part A) | 40–50 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey the integration surface | 30–40 min |
| Step 2 — design-decision gate | 20 min |
| Step 3 — build the wrapper (Components 1 + 4) | 70–90 min |
| Step 4 — verify (incl. the new test suite) | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4.5 hr** |

If the time budget is tight, the Step 0 narrow scope (Component 1 + the integration decision only) brings this to ~2.5–3 hr.

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The session adds new library module(s) in `website/src/lib/substrate/` (imported by no route) and a test; if the Step 2 integration decision was (b), it also adds a tsconfig `include` entry or a `/trust-layer/` tsconfig. Reverting removes the wrapper module and the build-config change; `/api/reason`, `/api/substrate/layer3`, the Layer 3 dispatch, and the existing `/trust-layer/` codebase are unaffected. No production behaviour change either way; no data loss; no user impact.

## Forecast

A successful session makes the **carried-profile mechanism real**: `atl-wrapper.ts` accumulates an agent's substrate consultations into a carried profile and aggregates it into a `WindowSnapshot` + a grade — the wrapper's Components 1 + 4. The `/trust-layer/` ↔ `website` integration boundary is resolved (closing the bridge session's carried-forward open question). After this, Component 5 (the three iteration patterns — Session 6, with the PR15 multi-agent check) and Component 3 (the badge — step 6) are unblocked, and the trajectory-enriched developer hand-back report becomes buildable. Reading the `/trust-layer/` window/grade code in full may surface findings that reshape the integration approach or the remaining steps — captured in the close. Proceed accepting the recommended options. Verified and committed between sessions and Vercel green.

End of prompt.
