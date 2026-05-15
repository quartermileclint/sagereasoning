# Next-Session Prompt — ATL Wrapper Session 6: Component 5 — The Three Iteration Patterns

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk expected under 0d-ii. This session builds new library code in `website/src/lib/substrate/` that orchestrates the now-Verified `atl-wrapper.ts` (Components 1 + 4), `agent-mode-service.ts` (Component 2 rendering), and `atl-bridge.ts`. Nothing is wired to a route; no env flag; no auth, encryption, R20a-perimeter, or deployment-configuration surface. AC7 not engaged. PR6 not engaged — Component 5 does not touch the R20a distress classifier, Zone 2 / Zone 3 logic, or their wrappers. PR1 engaged — `atl-wrapper.ts` was the single-endpoint proof of the carried-profile/trajectory pattern; this session is its next consumer.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — read **in full**, especially §"Component 5 — The three iteration patterns", §"Layer 1 implications" (the `peer_agent_assessments` field), §"Reconciliation table" (all three patterns are marked NEW), §"R-rule engagement" (the **PR15** row — multi-agent orchestration), and §"Open questions deferred to build" (4, 5, 6) — plus `/website/src/lib/substrate/atl-wrapper.ts` (the module Component 5 orchestrates) and `/website/src/lib/substrate/agent-mode-service.ts` (the Component 2 rendering parallel evaluation collects N of).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-15-atl-wrapper-build-close.md`.
**Predecessor decision-log entry:** `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15` (confirm at session open).

---

## Why this session matters

The ATL Wrapper spec names five components. Four are built and Verified: Component 1 (the carried-profile mechanism) and Component 4 (trajectory awareness) landed in Session 5; Component 2 (the Layer 3 agent-mode rendering) in Session 3. **Component 5 — the three iteration patterns — is the last component before the badge.** It is the structure that turns the wrapper from "a thing you call once per consultation" into "a thing that runs an agent's actual decision loop." After this session, all five components except the badge (Component 3) are real, and the only remaining ATL Wrapper build is step 6 — the badge.

This is mostly **orchestration of already-Verified pieces**, not net-new design — with one genuine exception: pattern 3 (multi-agent orchestration) carries a load-bearing PR15 consult (below).

## The three patterns (spec §"Component 5")

All three are marked **NEW** in the spec's reconciliation table — the existing `/trust-layer/` build has the window/grade infrastructure but not the explicit loop / parallel / orchestration patterns.

1. **Sequential loop** — the agent submits a decision, gets the assessment, decides, repeats. The wrapper accumulates each `EvaluatedAction` in sequence; the carried profile grows with each iteration. *Largely a thin orchestration around `accumulate` → `computeTrajectory` → `toCarriedProfilePayload` → feed back into the next Layer 1 input.*
2. **Parallel evaluation** — the agent evaluates several candidate decisions at once. The wrapper collects N agent-mode renderings (one per candidate, via `agent-mode-service.ts`), each with its own score; the agent ranks. **Open question 4:** do all N feed the carried profile, or only the chosen one? (Philosophically: did the agent reason N times, or once?) — a build-session decision.
3. **Multi-agent orchestration** — an agent that decides based on the *outcomes of other agents*; that orchestrator is itself wrapped. The orchestrator's Layer 1 input carries the peer agents' `AccreditationPayload`s and/or agent-mode renderings via the `peer_agent_assessments` field (already on `Layer1Schema`, Verified 2026-05-14). **Open question 5:** is there a depth limit (agents wrapping agents)? How does a grade transition in a peer propagate to the orchestrator's assessment? **Open question 6 — the load-bearing PR15 consult:** Anthropic's multi-agent-orchestration primitive (public beta) is a named PR15 primitive; the build session MUST evaluate whether it delivers pattern 3 before electing a bespoke build, and record the justification.

## The build state going in — a lot is already built

- `atl-wrapper.ts` — Verified. `createCarriedProfile`, `accumulate` (pure), `computeTrajectory`, `toCarriedProfilePayload`, `toProfileProvenancePayload`, the `CarriedProfile` / `TrajectoryResult` / payload types, and re-exports of the ported `/trust-layer/` types. Component 5 orchestrates these.
- `agent-mode-service.ts` — Verified. `renderAgentMode` + the `'atl_wrapper'` case in `renderLayer3Mode`. Parallel evaluation collects N of these renderings.
- `atl-bridge.ts` — Verified, repointed at the ported `/trust-layer/` types. `mapLayer2AssessmentToEvaluatedAction`.
- `score-architecture.ts` — Verified. The per-candidate score parallel evaluation surfaces.
- `website/src/lib/substrate/trust-layer/` — the 5-file ported `/trust-layer/` closure (window aggregator + grade engine + deps), in-tsconfig.
- `Layer1Schema.peer_agent_assessments` — the optional Layer 1 field pattern 3 populates. Verified 2026-05-14 (`D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14`).

## The genuine design problems — Step 2 gate

- **The PR15 multi-agent-orchestration consult (load-bearing).** Before electing a bespoke build for pattern 3, evaluate Anthropic's multi-agent-orchestration primitive (public beta). The likely framing — to be confirmed by the actual consult — is that Anthropic's primitive is the *substrate an orchestrator runs on*, while the ATL Wrapper *wraps* such an orchestrator (accumulates the orchestrator's own trajectory; carries the peers' assessments via `peer_agent_assessments`) — complementary, not competing. But the build session does the consult and records the justification per PR15.
- **Open question 4 — parallel evaluation profile accumulation.** All N candidates feed the carried profile, or only the chosen one?
- **Open question 5 — multi-agent orchestration depth + grade propagation.** Depth limit; how a peer's grade transition propagates to the orchestrator's assessment.
- **Module location + shape.** A new `website/src/lib/substrate/atl-iteration-patterns.ts` (+ test), or three small modules — mirroring the established `atl-wrapper.ts` / `atl-bridge.ts` file shape. Build-session decision.

The build session surfaces these with recommendations at Step 2; the founder elects.

## Pre-conditions

1. **The predecessor session is committed + pushed; Vercel green.** `git log --oneline -4 origin/main` shows the ATL Wrapper Session 5 commit AND the separate `tsx` devDependency commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock`.
2. **`D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15` is in `/operations/decision-log.md`.** Confirm at session open.
3. **The prior ATL build outputs are Verified** — `atl-wrapper.ts`, `agent-mode-service.ts`, `atl-bridge.ts`, `score-architecture.ts`, the ported `/trust-layer/` closure, the Layer 1 carried-context fields. Run the verification suite as a session-open regression check (see §"Verification commands" below — note the corrected `--env-file` form per `/CLAUDE.md` §"Running the substrate test suite").
4. **Production state unchanged** — substrate at A7 Verified; all substrate env flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503.
5. **Founder commits to a ~3–4 hr bounded build session.**

## What this session does — and does NOT do

**Does:** read the ATL Wrapper spec §"Component 5" + the relevant prior modules in full; run the PR15 multi-agent-orchestration consult; run the Step 2 design-decision gate (the PR15 result + open questions 4 and 5 + module shape); build the three iteration patterns as **library code** that orchestrates `atl-wrapper.ts` + `agent-mode-service.ts`; write a test suite (PR2 — invokes the new module in-session); run the prior-arc regressions; append a lean decision-log entry; write a lean session close.

**Does NOT:**
- Build **Component 3 — the badge** (`AccreditationRecord` / `public-endpoint.ts` / `accreditation-card.ts`, Supabase-integrated). That is ATL Wrapper step 6 — it adds a public verification endpoint (an auth + a route surface — higher-risk) and the existing build's pending Supabase integration. Its own next-session prompt is drafted when the founder elects that path.
- Build the **trajectory-enriched developer hand-back report** — it waits for the badge.
- **Expose any API surface.** Component 5 is library code this session. If a new surface seems needed, stop and re-scope.
- Touch the **progression toolkit** (spec open question 1, deferred), the **DRAFT 5-table schema** (spec open question 2 — no server persistence this session), `/api/reason`, env vars, the R20a perimeter, or any auth surface.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, lean templates, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context.
3. `/operations/handoffs/founder/2026-05-15-atl-wrapper-build-close.md` (~4 min) — predecessor close; note the carried-forward findings and the corrected verification-tooling form.
4. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — **in full** (~12 min). Especially §"Component 5", §"Layer 1 implications", §"Reconciliation table", §"R-rule engagement" (the PR15 row), §"Open questions deferred to build" (4, 5, 6).
5. `/website/src/lib/substrate/atl-wrapper.ts` (~6 min) — the module Component 5 orchestrates; re-read its header's PURITY PROFILE.
6. `/website/src/lib/substrate/agent-mode-service.ts` (~5 min, targeted) — `renderAgentMode` / the `'atl_wrapper'` dispatch; what parallel evaluation collects N of.
7. `/website/src/lib/substrate/atl-bridge.ts` + `/website/src/lib/substrate/score-architecture.ts` (~4 min, targeted) — the bridge + the per-candidate score.
8. `/operations/decision-log.md` — last 3 entries (`D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`, `D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15`, `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15`).
9. **PR15 consult — before electing any bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching multi-agent orchestration; `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session. **The multi-agent-orchestration consult for pattern 3 is load-bearing** — do it properly and record the finding. PR11 inbox scan: `/inbox/` for files dated since the predecessor session — summarise inline or state none.

**Confirm at session open:** tier (`code-standard`, Standard expected); hold-point status (P0 0h active); model selection — confirm N/A (Component 5 orchestrates deterministic modules; it makes no LLM call itself — the substrate's own Layer 1/2/3 LLM calls are outside the iteration-patterns module); status vocabulary; signals + risk classification; PR11 inbox scan result.

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)
Recommend: **all three iteration patterns.** Alternative, if the PR15 consult on pattern 3 proves large or surfaces a real dependency on Anthropic's primitive: **narrow to sequential + parallel (patterns 1–2), defer multi-agent orchestration (pattern 3) to a follow-on.** The badge (Component 3, step 6) remains the other path the founder may elect instead of Component 5 — but that needs its own next-session prompt. Founder elects.

### Step 1 — Survey the orchestration surface (~25–35 min)
Read `atl-wrapper.ts`'s exported surface + `agent-mode-service.ts`'s `renderAgentMode` / `renderLayer3Mode` + the `peer_agent_assessments` `Layer1Schema` field. Output (~12–15 lines in-chat): how each of the three patterns composes the existing pieces; the PR15 consult finding for pattern 3; the open-question-4 recommendation (parallel: all N or chosen); the open-question-5 recommendation (orchestration depth + grade propagation); the module shape.

### Step 2 — Design-decision gate (consolidated; founder approval; ~20 min)
Surface as one consolidated change set: the PR15 multi-agent-orchestration consult result + whether pattern 3 is bespoke or built on the Anthropic primitive; open question 4; open question 5; the module location/shape. Recommend each with reasoning; the founder elects.

### Step 3 — Build (PR1 next consumer; PR2; ~70–90 min)
Build the three iteration patterns per the Step 2 decisions. PR1: `atl-wrapper.ts` was the single-endpoint proof; Component 5 is its next consumer — keep the iteration patterns pure/deterministic orchestration (no I/O, no LLM call inside the module). PR2: the test invokes the new module in the same session.

### Step 4 — Verify
Write the Component 5 test suite. Run `tsc --noEmit` and the prior-arc regressions. **Use the corrected verification form per `/CLAUDE.md` §"Running the substrate test suite"** — plain `npx tsx` for the Supabase-free tests; `npx tsx --env-file=.env.local` for `agent-mode-service.test.ts` + `philosophical-mode-service.test.ts`; run one at a time. PR10 PEV Verify step — classify any diagnostic finding's certainty.

### Step 5 — Append decision-log entry (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-YYYY-MM-DD`. Record the Step 2 decisions — especially the PR15 multi-agent-orchestration consult result and the bespoke-vs-primitive election for pattern 3. Rules served expected: 0a, 0c, 0d-ii, 0f, R4, R18 (a–e), AC8, PR1, PR2, PR10, PR11, PR15.

### Step 6 — Session close (lean form)
`/operations/handoffs/founder/YYYY-MM-DD-atl-iteration-patterns-close.md` per the lean session-close template. **Use the corrected Founder Verification form** (per `/CLAUDE.md` §"Running the substrate test suite"). "Next Session Should" names **ATL Wrapper step 6 — the badge (Component 3)** — `AccreditationRecord` / `public-endpoint.ts` / `accreditation-card.ts`, Supabase-integrated; a public verification endpoint (auth + route surface — higher-risk; likely `code-elevated` or `code-critical`); it ports the remaining `/trust-layer/` files it needs. Carry forward: the trajectory-enriched developer hand-back report (buildable once the badge lands); the spec-hygiene finding (§Component 2 still owes the superseded agent-mode spec's content inline); the `trust-layer-bridge.ts` reconciliation; the progression-toolkit relationship (spec open question 1); the DRAFT 5-table schema (spec open question 2); agent-identity authentication (spec open question 8 → A10).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + ATL Wrapper spec + prior modules + decision log + PR15 consult (Part A) | 35–45 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey the orchestration surface | 25–35 min |
| Step 2 — design-decision gate | 20 min |
| Step 3 — build the three iteration patterns | 70–90 min |
| Step 4 — verify (incl. the new test suite) | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4 hr** |

If the time budget is tight, the Step 0 narrow scope (patterns 1–2, defer multi-agent orchestration) brings this to ~2.5–3 hr.

## Verification commands (session-open regression check + Step 4)

Run from `website/`, one line at a time (per `/CLAUDE.md` §"Running the substrate test suite"):

```
npx tsc --noEmit -p tsconfig.json                                               # clean, exit 0
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts                         # 55/0
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts                          # 31/0
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts                  # 69/0
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts                      # 28/0
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts                           # 33/33
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts  # 33/0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts          # 63/0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts  # 43/0
```

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The session adds new library module(s) in `website/src/lib/substrate/` (imported by no route) and a test. Reverting removes the iteration-patterns module; `atl-wrapper.ts`, `/api/reason`, `/api/substrate/layer3`, and the ported `/trust-layer/` closure are unaffected. No production behaviour change; no data loss; no user impact.

## Forecast

A successful session makes the **three iteration patterns real** — the wrapper can now run an agent's sequential loop, evaluate candidates in parallel, and wrap an orchestrator that decides on peers' outcomes — completing every ATL Wrapper component except the badge. The PR15 multi-agent-orchestration consult is recorded. After this, the only remaining ATL Wrapper build is step 6 — the badge (Component 3) — and once that lands, the trajectory-enriched developer hand-back report becomes buildable. Reading the spec + the prior modules in full may surface findings that reshape the pattern designs — captured in the close. Proceed accepting the recommended options. Verified and committed between sessions and Vercel green.

End of prompt.
