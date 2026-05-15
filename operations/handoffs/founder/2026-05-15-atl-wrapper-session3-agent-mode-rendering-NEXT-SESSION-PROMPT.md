# Next-Session Prompt — ATL Wrapper Session 3: The Layer 3 Agent-Mode Rendering (Component 2 proper)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk expected under 0d-ii. The build session confirms at the Step 2 design gate and reclassifies upward if (a) the build touches the live `/api/reason` path, (b) it exposes a new API surface, or (c) it modifies the open `Layer1Schema` contract. None of those are in this session's scope (see "does NOT do"). Critical Change Protocol NOT engaged at open. AC7 not engaged. PR6 not engaged — the agent-mode rendering *renders* the R20a distress passthrough by consuming the existing injection layer (as philosophical mode does); it does not touch the R20a distress classifier, Zone 2 / Zone 3 logic, or their wrappers. PR1 engaged — the agent-mode rendering is the single-endpoint proof of the agent-mode rendering pattern, extending the proven `renderLayer3Mode` dispatch.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: `/archive/2026-05-14_agent-mode-response-spec-superseded.md` read **in full again** (the rendering detail — output shape, section ordering, gaming defences, caveats, reflection component) **plus** `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 2" + §"The report the agent hands back to the developer".
**Predecessor session close:** `/operations/handoffs/founder/2026-05-15-atl-score-architecture-close.md`.
**Predecessor decision-log entry:** `D-ATL-SCORE-ARCHITECTURE-WIRED-VERIFIED-2026-05-15` (confirm at session open).
**Risk classification:** **Standard** under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged. PR6 not engaged. PR1 engaged — the agent-mode rendering extends the `renderLayer3Mode` dispatch (proven on philosophical mode); PR10 PEV loop applies.

---

## Why this session matters

ATL Wrapper spec sequencing **step 3 — the Layer 3 agent-mode rendering (Component 2 proper)**. The predecessor session (ATL Wrapper Session 2) built the substrate **score architecture** — `score-architecture.ts`, now Verified — which was Component 2's load-bearing dependency. This session builds the rendering that **consumes** that score: the structured decision-support output a wrapped agent receives.

Component 2 is **dual-audience** (the founder's 2026-05-14 framing): an **in-loop machine-readable JSON** the wrapped agent consumes to make its next decision, and a **hand-back human-readable report** the agent gives its developer. Both carry the mandatory wraps (R3 / R19c / R19d / R20a / R18a / R18e) and both are **deterministic from Layer 2 + the score alone — no LLM call** (the superseded spec: "the output is deterministic from Layer 2 alone — no LLM call required ... byte-stable"). This is the same session shape as the score module, the bridge, and the philosophical-mode renderer: survey the surface, write the deterministic projection + its test, verify.

It builds as a new case in the proven `renderLayer3Mode` dispatch (PR1 single-endpoint proof of the agent-mode rendering pattern), plus a new renderer module, plus — if the founder scopes it in at Step 0 — an edit to `philosophical-mode-service.ts` that resolves the carried-forward PR7 score deferral. It builds as new code (the agent-mode renderer) and an edit to the not-yet-wired `philosophical-mode-service.ts`; no route imports it; no production exposure this session.

## The Component 2 scope boundary — what is buildable now vs. what waits for the wrapper

Component 2's two renderings are **not equally buildable yet**, and the prompt is honest about this so the founder scopes Step 0 with evidence:

- **In-loop JSON rendering** — fully buildable now. It projects `Layer2Assessment` + the `SubstrateScore` (from the now-Verified `score-architecture.ts`) + the mandatory injection layer. Nothing it needs is missing.
- **Per-assessment human-readable rendering** — fully buildable now. The superseded spec's "Human-readable rendering": "same content as the JSON, rendered as compact prose with section headers." A presentation layer over the JSON. This is the developer's per-assessment view.
- **The trajectory-enriched developer hand-back report** — **NOT buildable this session.** The ATL Wrapper spec's richer hand-back report ("the agent's trajectory across the session; the agent's current grade, authority level, and badge status; persisting passions") draws on the `WindowSnapshot` / `AccreditationRecord` / `AccreditationCard` — which are Components 3 + 4, fed by the wrapper (Component 1). Those are spec steps 5–6. The trajectory-enriched report is explicitly deferred to after the wrapper + badge are built.

So "Component 2 proper" for this session = the in-loop JSON rendering + the per-assessment human-readable rendering. The trajectory-enriched developer report is named in the close as a post-step-5/6 carry-forward. This is a Step 0 / Step 2 scope point — flagged below.

## The carry-forward deferrals this session can close

- **Philosophical mode score deferral (PR7)** — `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`'s score deferral named "the substrate score architecture reaches Scaffolded" as its revisit condition. The score architecture is now **Verified** (past Scaffolded) — the revisit condition is met. `philosophical-mode-service.ts` still carries the `{ deferred: true, deferral_reason }` stub at `PhilosophicalModeScore` and the hard-coded `justification_source: null` at `PhilosophicalModeVerdict`. Wiring it to consume `score-architecture.ts` resolves PR7. Whether that wiring lands **this** session (alongside the agent-mode rendering) or as a fast follow is a Step 0 scope election (see Step 0).
- **Standard mode's score sections** are also unblocked by the score architecture, but standard mode is a separate mode-build session — this session does not build it.

## Pre-conditions

1. **Predecessor session committed.** `git log --oneline -3 origin/main` shows the score-architecture commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock` — per the predecessor close ("I caused this"). No `_capture-tmp.ts` was created last session.
2. **The predecessor decision-log entry** (`D-ATL-SCORE-ARCHITECTURE-WIRED-VERIFIED-2026-05-15`) is in `/operations/decision-log.md`. Confirm at session open.
3. **`score-architecture.ts` is Verified** — `website/src/lib/substrate/score-architecture.ts` exists with `computeSubstrateScore`, the `ScoreContext` input type, and the `SubstrateScore` output types. This session does not modify it; it confirms `score-architecture.test.ts` still passes 69/0 as a regression.
4. **`atl-bridge.ts` is Verified** — `website/src/lib/substrate/atl-bridge.ts` exists. This session does not modify it; `atl-bridge.test.ts` still passes 31/0 as a regression. (The bridge is not on the rendering's critical path — the rendering projects `Layer2Assessment` + `SubstrateScore` directly — but the regression confirms nothing drifted.)
5. **The `Layer3RenderMode` dispatch pattern exists.** `philosophical-mode-service.ts` declares `Layer3RenderMode = 'philosophical'` with `'standard' | 'private' | 'atl_wrapper'` reserved (commented out). The agent-mode rendering extends `Layer3RenderMode` with a new value and `renderLayer3Mode` with a new `case` — confirm the mode name against the spec at Step 2 (the reserved value is `'atl_wrapper'`).
6. **Spec-hygiene finding still open** — the Adopted ATL Wrapper spec §"Component 2" says the superseded agent-mode spec's content "should be reproduced inline here when this spec moves Draft → Adopted", but the spec is Adopted and the reproduction was not done. The score architecture, gaming defences, and caveats still live only in `/archive/2026-05-14_agent-mode-response-spec-superseded.md`. Both documents remain required reading. The build session may re-surface this spec-hygiene finding — capture it in the close; do not edit the Adopted spec without founder approval + a preserve-prior-versions snapshot.
7. **Founder commits to a ~3.5–4 hr bounded build session** (longer if the philosophical-mode score-wiring is scoped in).

## What this session does — and does NOT do

**Does:**

- Read `/archive/2026-05-14_agent-mode-response-spec-superseded.md` **in full** — §"Output shape" (section ordering; the machine-readable skeleton; the human-readable rendering), §"Kathekon as gate, not component", §"Out of the score; in the response shape", §"Gaming defences (three forms; three defences)", §"Receiving-agent caveats", §"Score-validity flag rules", §"Reflection component", §"Open questions deferred to build" — and the ATL Wrapper spec §"Component 2" + §"The report the agent hands back to the developer" + §"R-rule engagement".
- Survey the now-Verified `score-architecture.ts` surface (`SubstrateScore`, `ScoreContext`, `computeSubstrateScore`) and the `philosophical-mode-service.ts` rendering pattern the agent-mode rendering mirrors (the `renderLayer3Mode` dispatch, the injection-layer usage, the R17e filter, the JSON + Markdown projection shape).
- Run a **consolidated design-decision gate** (Step 2) on the rendering-detail decisions the superseded spec leaves to the build session (see Step 2).
- Build and verify the **Layer 3 agent-mode rendering** — the in-loop machine-readable JSON + the per-assessment human-readable rendering, both carrying the mandatory wraps, both deterministic (no LLM call). Wired into `renderLayer3Mode` as a new dispatch case. PR1 single-endpoint proof of the agent-mode rendering pattern; PR2 build-to-wire-verification immediate (a test invokes it in the same session).
- **Scope-dependent (founder elects at Step 0):** wire the now-Verified `score-architecture.ts` into `philosophical-mode-service.ts` — replacing the `PhilosophicalModeScore` `{ deferred: true }` stub and the `PhilosophicalModeVerdict` `justification_source: null` hard-code with the real score — resolving the carried-forward PR7 deferral.

**Does NOT:**

- Build **the wrapper itself** (Components 1, 4, 5 — carriage, trajectory, iteration patterns) or **the badge** (Component 3) — spec steps 5 and 6.
- Build **the trajectory-enriched developer hand-back report** — it draws on the `WindowSnapshot` / `AccreditationRecord` (Components 3 + 4, fed by the wrapper). Only the **per-assessment** human-readable rendering is in scope. The trajectory-enriched report is a post-step-5/6 carry-forward.
- Build **standard mode** or **private mode** — separate mode-build sessions.
- Build the **gaming-defence detection logic** — Form 1 (virtue-vocabulary normalisation) is a Layer 1 concern (spec step 4 / superseded spec open question 2); Form 2 (passion-language detection on the agent's free-text declaration) is an upstream agent-mode-request / Layer-1 concern. This session's rendering **surfaces** the gaming-defence results (the `justification_source` from the gate, the `declared_motivation_passion` verdict, the receiving-agent caveats) — it does not perform the detection.
- **Touch Layer 1** — the carried-context fields (`carried_profile`, `profile_provenance`, `peer_agent_assessments`, `objective_function_declaration`) are spec step 4.
- **Expose any API surface.** The public accreditation endpoint is spec step 6 (Critical — auth surface). If a new surface seems needed, stop and re-scope.
- **Touch `/api/reason`**, env vars, schema, or the R20a perimeter. (The agent-mode rendering *renders* the R20a passthrough by consuming the existing injection layer — as philosophical mode does — it does not modify R20a logic. PR6 not engaged.)
- Resolve all the superseded spec's open questions — only the ones that block the rendering (Step 2). Open questions about the wrapper (the dispatcher's *upstream* caller, the objective-function-declaration *input schema*, the STATED_OPERATIVE_CONFLICT *trigger logic*) belong to spec steps 4–5.
- Run the PR15 multi-agent-orchestration check — that belongs to spec step 5 (Component 5, the iteration patterns), not the Component 2 rendering.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, lean templates, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the seven decisions; open-questions parking lot.
3. `/operations/handoffs/founder/2026-05-15-atl-score-architecture-close.md` (~4 min) — predecessor close; note the score-module survey-then-build session shape, the `ScoreContext` design, the motivation-classification-`null` correction, and the carry-forward findings.
4. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 2", §"The report the agent hands back to the developer", §"R-rule engagement", §"Build sequencing" (~6 min).
5. `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — **in full** (~12 min). The output shape, section ordering, gaming defences, receiving-agent caveats, score-validity flag rules, reflection component, and the eight open questions deferred to build. This is the substantive deliverable-of-the-day.
6. `/website/src/lib/substrate/score-architecture.ts` — the now-Verified module the rendering consumes: `computeSubstrateScore`, the `ScoreContext` input type, the `SubstrateScore` / `KathekonGateResult` / `SubstrateScoreComponents` / `SubstrateScoreScalar` output types. (~5 min — read the module header + the exported types.)
7. `/website/src/lib/substrate/philosophical-mode-service.ts` — the `renderLayer3Mode` dispatch the agent-mode rendering extends; the injection-layer usage (the six `inject*` wraps); the `applyR17eExclusionFilter` pattern; the JSON + Markdown projection shape the agent-mode rendering mirrors; and the `PhilosophicalModeScore` `{ deferred: true }` stub + `PhilosophicalModeVerdict.justification_source: null` hard-code (the PR7 wiring targets, if scoped in).
8. `/website/src/lib/substrate/layer3-service.ts` — the injection layer: `injectR3Disclaimer`, `injectR19Limitations`, `injectR19MirrorPrinciple`, `injectR20aDistressPassthrough`, `injectR18aCategory`, `injectR18eTransparencyNotice`, the `ConsumerContext` + `Layer3InjectionSet` types. The agent-mode rendering consumes these verbatim — it never re-authors a wrap string.
9. `/operations/decision-log.md` — last 3 entries (`D-ATL-SCORE-ARCHITECTURE-WIRED-VERIFIED-2026-05-15`, `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`, `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14`).
10. **If the philosophical-mode score-wiring is scoped in at Step 0:** also `/adopted/substrate-modes/philosophical-mode-response-spec.md` §"Score handling for human consumers" and `/website/src/lib/substrate/__tests__/philosophical-mode-service.test.ts` (the regression that must be updated to cover the now-live score).
11. **PR15 consult — before electing the bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching deterministic structured-data projection / prose rendering; `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session (note: F3 — the Layer3Response-as-mandate-producer framing — is contextually relevant; the agent-mode rendering is the closest thing to F3's "AP2-style mandate-output shape"; the superseded agent-mode spec carries the F3 fold-in note). State whether an Anthropic-canonical primitive could deliver the rendering outcome before electing bespoke; record the justification in the decision-log entry. PR11 inbox scan: `/inbox/` for files dated since the predecessor session — summarise inline or state none.

**Confirm at session open:** tier (`code-standard`, Standard risk expected); hold-point status (P0 0h active); **model selection — N/A for the agent-mode rendering** (deterministic from Layer 2 + the score alone — no LLM call, per the superseded spec); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`); signals + risk classification; PR11 inbox scan result.

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)

Recommend: **the agent-mode rendering only** this session — build + verify the in-loop machine-readable JSON rendering + the per-assessment human-readable rendering, wired into `renderLayer3Mode` as the PR1 single-endpoint proof of the agent-mode rendering pattern. The philosophical-mode score-wiring (resolving the PR7 deferral) then follows as a fast follow against the now-live agent-mode rendering as a worked second consumer of `score-architecture.ts`. The fuller alternative — agent-mode rendering **+** the philosophical-mode score-wiring in one session — is larger (~5+ hr) and risks overrun, but it closes PR7 in-session; offered if the founder prefers it. Founder elects. **Note:** like the score-architecture survey before it, reading the superseded agent-mode spec again with the now-Verified score module in hand may surface findings that reshape the rendering scope — that is expected and useful in the P0 R&D phase.

### Step 1 — Survey the rendering surface + re-read the superseded spec (~35–50 min)

Re-read the superseded agent-mode spec's rendering sections in full, now with the Verified `score-architecture.ts` in hand. Survey the `SubstrateScore` shape against the superseded spec's `score_components` + `score` skeleton — confirm the score module's output maps cleanly onto the rendering's score-vector + scalar-score sections (it was built to). Output (~12–15 lines in-chat): the exact section ordering both renderings must produce; which sections project cleanly from `Layer2Assessment` + `SubstrateScore` + the injection layer and which need a derivation decision; how the `ScoreContext` is produced for this session's rendering (the rendering needs a `justification_source` + an optional `declared_motivation_passion` to call `computeSubstrateScore` — for a per-assessment rendering with no wrapper, where do these come from?); and any rendering detail the superseded spec leaves unspecified (the "build session designs" gaps — the human-readable layout, the verdict-to-action labels, the `open_questions` rendering of the reflection component's `withheld_classification`).

### Step 2 — Design-decision gate (consolidated; founder approval; ~15–20 min)

Surface as one consolidated change set per Rule B(iv). The decisions likely to block the build:

- **Where the agent-mode renderer lives** — recommend a new file `website/src/lib/substrate/agent-mode-service.ts` (+ test), with `renderLayer3Mode` in `philosophical-mode-service.ts` gaining a new `case` that delegates to it (the superseded spec's open question 1: extend in place vs. a dedicated service — a dedicated service keeps `philosophical-mode-service.ts` from growing further; the shared injection layer is consumed by both regardless). Confirm the `Layer3RenderMode` value name against the spec (the reserved value is `'atl_wrapper'`).
- **The `ScoreContext` source for a per-assessment rendering** — the rendering must call `computeSubstrateScore`, which needs a `ScoreContext` (`justification_source` required; `declared_motivation_passion` optional). With no wrapper yet, recommend the rendering accepts a `ScoreContext` as a caller-supplied input on its render-input type (the same pattern as the score module's own `ScoreContext` and the bridge's `BridgeContext`) — the wrapper (spec step 5) becomes the eventual producer; until then the caller supplies it. Surface explicitly.
- **Unspecified rendering-detail gaps** — the superseded spec's "build session designs" items that block the rendering: the human-readable rendering's precise layout / paragraph structure (open question 7); the verdict-to-action labels (`appropriate` / `not_appropriate` / `undetermined` — open question 6); the `open_questions` rendering of the reflection component's `withheld_classification` (verbatim, per the superseded spec). Recommend values with reasoning; the founder confirms.
- **R17e posture for the agent-mode rendering** — R17e does **not** apply to agent profiles (the ATL Wrapper spec §"R-rule engagement" is explicit: "an agent's reasoning-pattern profile is not an intimate human vulnerability ... stated explicitly so the build session does not over-apply R17e"). So the agent-mode rendering does **not** apply the `applyR17eExclusionFilter` that philosophical mode applies — it can surface `iterative_refinement` fields (direction-of-travel, motivation classification) and the score's `confidence` field. Confirm this is the intended reading.
- **Philosophical-mode score-wiring this session?** — whether to edit `philosophical-mode-service.ts` to consume `score-architecture.ts` in-session (resolving the PR7 deferral) or defer it to a fast follow. Editing a not-yet-wired module is still Standard risk, but it is a change to an existing file with an existing test suite (37 assertions) that must be updated — surface it explicitly.

### Step 3 — Build (PR1 + PR2; ~70–100 min)

Build the agent-mode renderer per the superseded spec's §"Output shape" + the Step 2 decisions. A pure, synchronous, deterministic projection — `Layer2Assessment` + `ScoreContext` (→ `SubstrateScore` via `computeSubstrateScore`) + the injection layer → the in-loop JSON + the per-assessment human-readable rendering. PR1: this is the single-endpoint proof of the agent-mode rendering pattern, extending the proven `renderLayer3Mode` dispatch. PR2: wire + verify in the same session — a test invokes `renderLayer3Mode` with the new mode (grep for invocation, not just definition). If the founder scoped in the philosophical-mode wiring, build that against the now-Verified `score-architecture.ts` and update `philosophical-mode-service.test.ts` to cover the now-live score.

### Step 4 — Verify

Test fixtures: the in-loop JSON carries the correct section ordering + all the mandatory wraps; the score vector + scalar score project correctly from a `SubstrateScore` (kathekon-confirmed, contrary, PROVISIONAL, kathekon-null cases — reuse the score module's fixture shapes); the receiving-agent caveats render verbatim; the reflection component's `withheld_classification` renders verbatim in `open_questions`; the R20a distress passthrough replaces the assessment content when a distress signal is active (as philosophical mode does); the human-readable rendering is deterministic (same input → byte-identical); the dispatch's exhaustiveness guard still compiles. `tsc --noEmit` clean. Run the regressions: `score-architecture.test.ts` (69/0), `atl-bridge.test.ts` (31/0), `philosophical-mode-service.test.ts` (37/0, or its updated count if the score was wired in this session), `layer3-service.test.ts` (28/0), `r20a-gate.test.ts` (33/33). PR10 PEV Verify step — classify any diagnostic finding's certainty. Note the sandbox env-var caveat from the predecessor closes: the philosophical-mode regression needs the `.env.local` Supabase vars resolvable on import (or dummy import-resolution vars supplied in-session).

### Step 5 — Append decision-log entry (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-YYYY-MM-DD` (and, if the philosophical-mode score-wiring is scoped in, name it in the same entry or a companion entry, and cross-reference `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-2026-05-14` noting the PR7 deferral closed). Rules served expected: 0a, 0c, 0d-ii, 0f, R3, R4, R17e (named as *not* applying to agent profiles — the load-bearing distinction), R18a, R18e, R19c, R19d, R20a, AC8, PR1, PR2, PR10, PR11, PR15. Record the Step 2 rendering-detail decisions and their reasoning.

### Step 6 — Session close (lean form)

`/operations/handoffs/founder/YYYY-MM-DD-atl-agent-mode-rendering-close.md` per the lean session-close template. "Next Session Should" names: the philosophical-mode score-wiring if it was *not* done this session; then spec sequencing step 4 (Layer 1 schema additions — the optional carried-context fields, likely Elevated as it versions the open Layer 1 contract) and step 5 (the wrapper itself — Components 1, 4, 5). Carry forward: the spec-hygiene finding (the superseded spec's content still owed inline in the Adopted ATL Wrapper spec §Component 2, now including the score module's motivation-classification-`null` correction); the trajectory-enriched developer hand-back report (deferred to post-step-5/6); and whether standard mode's score sections remain unblocked-but-unbuilt.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ATL Wrapper §C2 + superseded spec + score-architecture.ts + philosophical-mode-service.ts + PR15 consult (Part A) | 35–45 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey the rendering surface + re-read the superseded spec | 35–50 min |
| Step 2 — design-decision gate (rendering details) | 15–20 min |
| Step 3 — build the agent-mode renderer (+ philosophical-mode wiring, if scoped in) | 70–100 min |
| Step 4 — verify | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4 hr** (agent-mode-rendering-only scope; longer if the philosophical-mode wiring is scoped in) |

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The agent-mode renderer is new code; `renderLayer3Mode` gains a new dispatch case (a change to `philosophical-mode-service.ts`, but that file is imported by no route and builds behind `SUBSTRATE_LAYER3_ENABLED`, UNSET in Vercel). Reverting removes the new renderer and the dispatch case; `/api/reason`, `/api/substrate/layer3`, and the existing `/trust-layer/` codebase are unaffected either way. If `philosophical-mode-service.ts` is also edited this session to consume the score module, the revert restores its `{ deferred: true }` stub — still no production behaviour change. No data loss; no user impact.

## Forecast

A successful session produces the Layer 3 agent-mode rendering — Verified, with the Step 2 rendering-detail decisions recorded — the PR1 single-endpoint proof of the agent-mode rendering pattern, and the first consumer of the Verified `score-architecture.ts`. That completes "Component 2 proper" at the per-assessment level (in-loop JSON + per-assessment human-readable rendering); the trajectory-enriched developer hand-back report waits for the wrapper + badge (steps 5–6). If the philosophical-mode score-wiring is scoped in, the carried-forward PR7 deferral also closes. Next after this: spec step 4 (Layer 1 schema additions) and step 5 (the wrapper itself — Components 1, 4, 5). Reading the superseded agent-mode spec again with the Verified score module in hand may surface findings that reshape the rendering scope or the arc's remaining steps — captured in the close. Proceed accepting the recommended options. Verified and committed between sessions and Vercel green.

End of prompt.
