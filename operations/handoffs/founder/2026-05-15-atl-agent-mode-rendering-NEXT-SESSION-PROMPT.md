# Next-Session Prompt — ATL Wrapper Session 2: The Substrate Score Architecture + the Layer 3 Agent-Mode Rendering (Component 2)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk expected under 0d-ii. The build session confirms at the Step 2 design gate and reclassifies upward if (a) the build touches the live `/api/reason` path, (b) it exposes a new API surface, or (c) it modifies the open `Layer1Schema` contract. None of those are in this session's scope (see "does NOT do"). Critical Change Protocol NOT engaged at open. AC7 not engaged. PR6 not engaged (the score is a deterministic projection of `Layer2Assessment` — it does not touch the R20a distress classifier, Zone 2 / Zone 3 logic, or their wrappers). PR1 engaged — the score-computation module is the single-endpoint proof of the score pattern.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 2" **plus** `/archive/2026-05-14_agent-mode-response-spec-superseded.md` read **in full** — see the pre-condition note on why both are needed.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-15-atl-bridge-close.md`.
**Predecessor decision-log entry:** `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15` (confirm at session open).
**Risk classification:** **Standard** under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged. PR6 not engaged. PR1 engaged — the score module is the single-endpoint proof of the score pattern; PR10 PEV loop applies.

---

## Why this session matters

ATL Wrapper spec sequencing **step 3** — the Layer 3 **agent-mode rendering** (Component 2). The agent-mode rendering is **dual-audience**: an in-loop machine-readable JSON the wrapped agent consumes to make its next decision, and a hand-back human-readable report the agent gives its developer. But Component 2's load-bearing dependency is the **substrate score architecture** — the kathekon gate, component score, quality multiplier, precision band, score-validity flag, and cap rules — which **does not exist yet**. It was specified only in the now-superseded agent-mode spec, with formulas explicitly left "build session computes."

This session builds that score architecture. It is the natural home for it, and building it here closes two carried-forward deferrals at once (see "The score-architecture carry-forward" below). The score-computation module is the PR1 single-endpoint proof of the score pattern — a pure, deterministic projection of `Layer2Assessment`, the same session shape as the bridge and the philosophical-mode renderer: survey the surface, write one pure deterministic module + its test, verify. The agent-mode rendering itself (which consumes the score) is the second half of the work — the founder elects at Step 0 whether it lands this session or the next.

It builds as new code (plus, if scoped in, an edit to the not-yet-wired `philosophical-mode-service.ts`); no route imports it; no production exposure this session.

## The score-architecture carry-forward

Two prior sessions deferred their score-dependent work pending exactly this build:

- **Philosophical mode** (`D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`, PR7) — its spec §§4–5 (Score vector + Scalar score) and the Verdict's `justification_source` line are deferred; `philosophical-mode-service.ts` carries an explicit `{ deferred: true, deferral_reason }` stub where the score sits. The revisit condition recorded in that entry is *"the substrate score architecture reaches Scaffolded"* — this session is that.
- **Standard mode** — its spec §"Score handling" references the *same* score architecture (`/adopted/substrate-modes/standard-mode-response-spec.md` §"Score handling": "Same score architecture as agent mode and philosophical mode … See `/archive/2026-05-14_agent-mode-response-spec-superseded.md` §'Component score'"). Standard mode's score sections are blocked on this build too.

Build the score module once; it is shared by philosophical / standard / agent modes. Whether this session also *wires* the score into `philosophical-mode-service.ts` (resolving that deferral in-session) is a Step 0 / Step 2 scope decision — flagged below.

## Pre-conditions

1. **Predecessor session committed.** `git log --oneline -3 origin/main` shows the ATL bridge commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock` — per the predecessor close ("I caused this"). No `_capture-tmp.ts` was created this time.
2. **The predecessor decision-log entry** (`D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`) is in `/operations/decision-log.md`. Confirm at session open.
3. **`atl-bridge.ts` is Verified** — `website/src/lib/substrate/atl-bridge.ts` exists with `mapLayer2AssessmentToEvaluatedAction`, `deriveReceiptId`, `BridgeContext`, and the mirrored `EvaluatedAction` types. This session does not modify the bridge; it confirms `atl-bridge.test.ts` still passes 31/0 as a regression.
4. **Deliverable-of-the-day spans two files.** The ATL Wrapper spec's §"Component 2" says the superseded agent-mode spec's rendering content "should be reproduced inline here when this spec moves Draft → Adopted" — but the ATL Wrapper spec is Adopted and the reproduction was **not** done. So the score architecture, gaming defences, and caveats live **only** in `/archive/2026-05-14_agent-mode-response-spec-superseded.md` (277 lines). Both documents are required reading. The build session may surface a spec-hygiene finding here (the inline reproduction is still owed) — capture it in the close; do not edit the Adopted spec without founder approval + a preserve-prior-versions snapshot.
5. **The `Layer3RenderMode` dispatch pattern exists.** `philosophical-mode-service.ts` declares `Layer3RenderMode = 'philosophical'` with `'standard' | 'private' | 'atl_wrapper'` reserved. The agent-mode rendering extends `renderLayer3Mode` with a new case — confirm the mode name against the spec at Step 2.
6. **Founder commits to a ~3.5–4 hr bounded build session.**

## What this session does — and does NOT do

**Does:**
- Read `/archive/2026-05-14_agent-mode-response-spec-superseded.md` **in full** — §"Kathekon as gate, not component", §"Component score (kathekon-confirmed path; baseline 55)", §"Out of the score; in the response shape", §"Gaming defences (three forms; three defences)", §"Receiving-agent caveats", §"Score-validity flag rules", §"Reflection component" — and the ATL Wrapper spec §"Component 2".
- Survey the score-relevant `Layer2Assessment` surface (`kathekon_assessment`, `stage_scores`, `hasty_assent_risk`, `iterative_refinement.motivation_classification` as the PROVISIONAL-gate input, `improvement_path_structured`) and the philosophical-mode `PhilosophicalModeScore` deferral stub.
- Run a **consolidated design-decision gate** (Step 2) on the score-formula details the superseded spec leaves to the build session (see Step 2).
- Build and verify the **substrate score-computation module** — a pure, synchronous, deterministic projection of `Layer2Assessment` → a score structure (kathekon gate; component score; quality multiplier; precision band; validity flag; cap rules; `justification_source`). PR1 single-endpoint proof of the score pattern; PR2 build-to-wire-verification immediate (a test invokes it in the same session).
- **Scope-dependent (founder elects at Step 0):** build the Layer 3 **agent-mode rendering** (Component 2 — the dual-audience in-loop JSON + hand-back report, the gaming defences, the receiving-agent caveats, the PROVISIONAL flag rendering) as a new case in `renderLayer3Mode`; and/or wire the new score module into `philosophical-mode-service.ts`, resolving the philosophical-mode score deferral.

**Does NOT:**
- Build **the wrapper itself** (Components 1, 4, 5 — carriage, trajectory, iteration patterns) or **the badge** (Component 3) — spec steps 5 and 6.
- Build **standard mode** or **private mode** — separate mode-build sessions. (This session *unblocks* standard mode's score sections; it does not build standard mode.)
- **Touch Layer 1** — the carried-context fields are spec step 4.
- **Expose any API surface.** The public accreditation endpoint is spec step 6 (Critical — auth surface). If a new surface seems needed, stop and re-scope.
- **Touch `/api/reason`**, env vars, schema, or the R20a perimeter. (The agent-mode rendering *renders* the R20a passthrough by consuming the existing injection layer — as philosophical mode does — it does not modify R20a logic. PR6 not engaged.)
- Resolve the standard-mode spec's flagged grounding-validator manifest constraint — that is a separate governance-session item.
- Resolve all the spec's open questions — only the ones that block the score module + the rendering (Step 2).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, lean templates, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the seven decisions; open-questions parking lot.
3. `/operations/handoffs/founder/2026-05-15-atl-bridge-close.md` (~3 min) — predecessor close; note the survey-then-build session shape and the `/trust-layer/` survey carry-forward findings.
4. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 2", §"R-rule engagement", §"Build sequencing" (~5 min).
5. `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — **in full** (~12 min). The score architecture, gaming defences, caveats, validity-flag rules, reflection component. This is the substantive deliverable-of-the-day.
6. `/adopted/substrate-modes/philosophical-mode-response-spec.md` §"Score handling for human consumers" + `/adopted/substrate-modes/standard-mode-response-spec.md` §"Score handling" (~4 min) — confirms the score is shared across modes and how each renders it.
7. `/website/src/lib/substrate/philosophical-mode-service.ts` — the `PhilosophicalModeScore` deferral stub + the `renderLayer3Mode` dispatch pattern the agent-mode rendering extends.
8. `/operations/decision-log.md` — last 3 entries.
9. **PR15 consult — before electing the bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching deterministic structured-data projection; `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session. State whether an Anthropic-canonical primitive could deliver the score-computation or rendering outcome before electing bespoke; record the justification in the decision-log entry. PR11 inbox scan: `/inbox/` for files dated since the predecessor session — summarise inline or state none.

**Confirm at session open:** tier (`code-standard`, Standard risk expected); hold-point status (P0 0h active); **model selection — N/A for the score module** (a deterministic pure projection — no LLM call); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`); signals + risk classification; PR11 inbox scan result.

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)

Recommend: **the substrate score-computation module only** this session — build + verify the deterministic score projection, the PR1 single-endpoint proof of the score pattern and the unblocking dependency for all three score-bearing modes. The agent-mode rendering (Component 2 proper) and the philosophical-mode score-wiring then follow in the next session against a Verified score module. The fuller alternative — score module **+** the agent-mode rendering **+** wiring the score into philosophical mode, all in one session — is larger (~5+ hr) and risks overrun; offered if the founder prefers it. Founder elects. **Note:** like the philosophical-mode and bridge surveys before it, reading the superseded agent-mode spec may surface findings that reshape the score formulas or the rendering scope — that is expected and useful in the P0 R&D phase.

### Step 1 — Survey the score surface + read the superseded spec (~35–50 min)

Read the superseded agent-mode spec's score sections in full. Survey, on the substrate side, the `Layer2Assessment` fields the score draws on. Output (~12–15 lines in-chat): the exact score structure the module must produce (component vector + scalar + validity flag + precision band + `justification_source` + cap rules); which inputs are cleanly sourced from `Layer2Assessment` and which need a derivation decision; the kathekon-gate logic (true / false / null × engine_constructed / agent_asserted / absent); and any score formula the superseded spec leaves unspecified (the "build session computes" gaps).

### Step 2 — Design-decision gate (consolidated; founder approval; ~15–20 min)

Surface as one consolidated change set per Rule B(iv). The decisions likely to block the build:
- **Unspecified score-formula details** — any "build session computes" gap in the superseded spec's §"Component score" (baseline 55, quality multiplier, precision-band width, cap arithmetic). Recommend values with reasoning; the founder confirms.
- **Where the score module lives** — recommend a new file `website/src/lib/substrate/score-architecture.ts` (+ test), mirroring the bridge / philosophical-mode file shape.
- **The agent-mode `Layer3RenderMode` name** — confirm against the spec (the reserved value is `'atl_wrapper'`; the spec may name the rendering mode differently).
- **Philosophical-mode score-wiring this session?** — whether to edit `philosophical-mode-service.ts` to consume the new score module in-session (resolving the PR7 deferral) or defer that to a follow-up. Editing a not-yet-wired module is still Standard risk, but it is a change to an existing file — surface it explicitly.

### Step 3 — Build (PR1 + PR2; ~60–90 min)

Build the score-computation module per the superseded spec's §"Component score" and the Step 2 decisions. A pure, synchronous, deterministic projection — same `Layer2Assessment` in, same score out. PR1: this is the single-endpoint proof of the score pattern. PR2: wire + verify in the same session — a test invokes the module (grep for invocation, not just definition). If the founder scoped in the agent-mode rendering and/or the philosophical-mode wiring, build those against the Verified score module.

### Step 4 — Verify

Test fixtures: the score is correct for a kathekon-confirmed assessment, a contrary-kathekon assessment (cap → 35), a PROVISIONAL assessment (cap → 50), and a kathekon-null assessment; deterministic (same input → byte-identical score); the cap rules and validity flag behave as decided at Step 2. `tsc --noEmit` clean. Run the regressions: `atl-bridge.test.ts` (31/0), `philosophical-mode-service.test.ts` (37/0, or its updated count if the score was wired in this session), `layer3-service.test.ts` (28/0), `r20a-gate.test.ts` (33/33). PR10 PEV Verify step — classify any diagnostic finding's certainty. Note the sandbox env-var caveat from the predecessor close: the philosophical-mode regression needs the `.env.local` Supabase vars resolvable on import.

### Step 5 — Append decision-log entry (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-ATL-SCORE-ARCHITECTURE-WIRED-VERIFIED-YYYY-MM-DD` (and, if the rendering / philosophical-mode wiring is scoped in, name those in the same entry or a companion entry). Rules served expected: 0a, 0c, 0d-ii, 0f, R4 (IP boundary — the score exposes a result, not the engine's internal thresholds), R6c (qualitative-levels discipline — confirm how the numeric score reconciles with R6c; the superseded spec addresses this), AC8, PR1, PR2, PR10, PR11, PR15. Record the Step 2 score-formula decisions and their reasoning. If the philosophical-mode score deferral is resolved this session, cross-reference `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14` and note the PR7 deferral closed.

### Step 6 — Session close (lean form)

`/operations/handoffs/founder/YYYY-MM-DD-atl-score-architecture-close.md` per the lean session-close template. "Next Session Should" names the remaining Component 2 work (if the rendering was not built this session) and then spec sequencing step 4 (Layer 1 schema additions) / step 5 (the wrapper itself). Carry forward: the spec-hygiene finding (the superseded spec's content still owed inline in the Adopted ATL Wrapper spec §Component 2), and whether standard mode's score sections are now unblocked.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ATL Wrapper §C2 + superseded spec + PR15 consult (Part A) | 30–40 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey the score surface + superseded spec | 35–50 min |
| Step 2 — design-decision gate (score formulas) | 15–20 min |
| Step 3 — build the score module (+ rendering, if scoped in) | 60–90 min |
| Step 4 — verify | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4 hr** (score-module-only scope; longer if the rendering is scoped in) |

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The score module is new code, imported by no route — reverting removes it; `/api/reason`, `/api/substrate/layer3`, and the existing `/trust-layer/` codebase are unaffected either way. If `philosophical-mode-service.ts` is edited this session to consume the score module, the revert also restores its `{ deferred: true }` stub — still no production behaviour change (the module is behind `SUBSTRATE_LAYER3_ENABLED`, UNSET in Vercel). No data loss; no user impact.

## Forecast

A successful session produces the substrate score-computation module — Verified, with the Step 2 score-formula decisions recorded — the PR1 single-endpoint proof of the score pattern. That unblocks the philosophical-mode score deferral (PR7) and standard mode's score sections, and gives the agent-mode rendering (Component 2 proper) its load-bearing dependency. Next after this: the rest of Component 2 (the dual-audience agent-mode rendering — in-loop JSON + hand-back report, gaming defences, caveats), then spec step 4 (Layer 1 schema additions) and step 5 (the wrapper itself). Reading the superseded agent-mode spec may surface findings that reshape the score formulas or the arc's remaining steps — captured in the close. Proceed accepting the recommended options.

End of prompt.
