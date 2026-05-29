# Next-Session Prompt — Option A Build Arc, Session 4: Layer-3 Audience Rendering + `/api/reason` Agent-API Fix
**Stream:** founder.
**Tier:** **`code-critical`.** Full Critical Change Protocol (0c-ii) applies. PR1 single-endpoint discipline now satisfied by S2 (Calling Verified) + S3 (Reflect-content Verified); the audience contract rolls out across both surfaces + the existing `/api/reason` redirect branches. AC5 perimeter unchanged (no new routes; existing surfaces modified). **PR6 + R19 + R20a engage at high stakes** — this session changes user-facing distress text on the agent-API path of `/api/reason` (closes Finding 2 from session 1 verification — the human-framed `redirect_message` is currently returned over the agent API today).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted).
**Design spec (authoritative for this session):** `/drafts/2026-05-28-r20a-single-catch-contract.md` — re-read §3 (per-consumer Layer-3 rendering — the A.3 audience contract) + §3.5 (the A6 dependency — `prose_mode` standing text) + §5.4 (Session C scope). This session implements §3 + §3.4 + §3.5 + §5.4 against the spec.
**Predecessor close:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-3-reflect-wired-close.md`.
**Predecessor decision-log entries:** `D-R20A-OPTIONA-S3-REFLECT-WIRED-2026-05-28`; `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`; `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`.
**Risk classification:** **Critical** under 0d-ii + PR6 + AC5 + R19 (honest positioning — agent-API distress text). Critical Change Protocol engages at session open. The flag posture follows S2 + S3 — new env flag `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (default OFF; UNSET in Vercel at session close) gates the `/api/reason` behaviour change so production remains byte-identical at session close.

## Why this session matters

S2 wired the Calling-side catch + emitted a developer-form payload behind a placeholder `developer_note`. S3 wired the Reflect-content-side catch + emitted a developer-form payload behind a *different* placeholder `developer_note` (Reflect's is distinct from Calling's — both honest per R19c). Today the two placeholders are intentionally provisional pending A6 formalisation; meanwhile `/api/reason`'s two redirect branches still emit a **human-framed** crisis pass-through over the **agent-API** path — the Finding 2 gap from session 1 verification. Three problems converge:

1. **Audience selector missing.** Today every consumer of A5 receives the same prose-mode posture regardless of whether the reader is a person in distress (a human web user on sagereasoning.com) or a developer operator (an API client / plugin / agent). The substrate cannot yet route the audience-correct form.
2. **`/api/reason`'s agent-API gap (Finding 2).** Today an API caller hitting `/api/reason` with distressing text gets the SAME crisis pass-through (`buildRedirectMessage()`) that a human web caller gets — addressed to the person in distress, not to the agent operator. The developer-form payload Calling + Reflect emit does not exist on `/api/reason` yet. **This is live production behaviour today.**
3. **Two placeholder `developer_note` strings + zero formalised `suggested_user_message`.** Calling and Reflect-content each ship their own placeholder text; A6 hasn't run.

Session 4 closes all three with one mechanism — one render helper + the `audience` field on `ConsumerContext` + the two new `prose_mode` keys per design §3.5 — and lands the `/api/reason` fix as the surface change that ratifies the audience contract end-to-end. **It is the Critical session that operationalises the configuration-level R20a perimeter on every existing R20a-emitting surface.**

Two reused primitives from S2 + S3 are the basis (PR15):
1. **The canonical `SafetySignal` schema** exported from `r20a-gate.ts` (S2-added; S3-reused). Session 4 does not change the schema.
2. **The developer-form payload shape** Calling + Reflect already emit (`{ distress_detected, severity, developer_note, suggested_user_message, flow_terminated, safety_signal }`). Session 4 generalises this into a render helper called by the route, and adopts it as the wire shape for the agent-developer audience on `/api/reason` as well.

After session 4, three consumers all emit the audience-correct form: `/api/reason` (web vs API auth-routed), `/api/calling` (agent_developer), `/api/practice/reflect` (agent_developer). Session 5 (configuration-level invocation tests) then proves end-to-end propagation across L1–L7 flows.

## Pre-conditions (founder confirms at session open)

1. The design spec at `/drafts/2026-05-28-r20a-single-catch-contract.md` has been re-read (or remains acceptable as written; founder may amend before this session opens).
2. **Founder-acknowledgement item 1 (carried from S3 close):** the Diagnostic-uncertain — pattern level signal on the Jest registry execution remains carried forward as pre-existing F-series Jest-config debt (AC12), NOT a session-4 blocker. Session 4 does not touch the Jest registry; no structural Jest edits expected.
3. **AI-verified at session open by code-read of `/api/reason/route.ts`:** what is the actual mechanism by which the route distinguishes web vs API traffic today? The design spec §3.2 names "the same auth signal already used to distinguish web vs API traffic (cookie/session vs API key vs plugin token)." Session 4 must identify the concrete signal (the route's existing branching logic, header check, auth helper, or whatever it actually is) and use it as the determinant for `audience`. If the signal does NOT exist as a clean determinant (e.g. the route does not branch web vs API today), session 4 surfaces this as a Diagnostic-uncertain finding and the design spec §3.2 revisits.
4. **AI-verified at session open by code-read of `layer3-service.ts`:** confirm the existing `ConsumerContext` shape — the design spec §3.2 says the shape is `{ consumer, is_mentor_flavoured, include_category_framing }` and proposes adding `audience`. Session 4 adds the field; the field is consumed by the new render helper.
5. **Decision on A6 wording posture:** session 4 formalises the two new `prose_mode` keys per design §3.5. Founder elects at session open between (a) drafting initial wording in-session for both keys, drawing from `ZONE3_DEVELOPER_NOTE` + `buildRedirectMessage()` as the spec suggests; or (b) keeping placeholder text in code and deferring final wording to a separate A6-only session (rationale: founder may want final wording reviewed before any production activation). Recommendation at this stage: (a) — initial wording in-session; revision after the C2 live run if needed. The placeholders Calling + Reflect ship today are intentionally honest per R19c, so revising them in-session is a forward step regardless of the C2 live run.
6. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` so PR1–PR17 is live in the operative surface. (Carried forward from S2 + S3 closes; confirm whether re-sync needed if any governance amendment happened between sessions.)

If any pre-condition is "no," stop and resolve before opening the session. The founder may amend the design spec before this session opens; the AI is not authorised to amend it without the founder's explicit direction.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — confirms tier (code-critical), model selection (Layer-3 LLM = Sonnet, AC1 row 4; R20a classifier reused = Haiku, but no new classifier call in session 4 — the render helper takes the existing `R20aGateOutput`), risk class (Critical), signals (diagnostic-certainty rows), the AI-failure-modes subsection, the lean templates.
2. `/adopted/build-sessions-protocol-cache.md` — confirms "no current users" holds; CCP step 3 ("What happens to existing sessions?") may be answered N/A.
3. This prompt + the predecessor session-3 close in full.
4. `/drafts/2026-05-28-r20a-single-catch-contract.md` — the design this session implements (especially §3 audience contract / §3.4 the `/api/reason` fix / §3.5 the A6 dependency / §5.4 Session C scope / §6 compliance map). Re-read in full.
5. `/manifest.md` targeted sections: §R20a, §R19, §R19c (honest positioning), §AC1 (Sonnet for Layer-3 translation — design §3.3's render helper sits at Layer 3), §AC2 (~500ms latency budget — accepted; render helper adds zero new latency — pure-sync over an existing verdict object), §AC4 (invocation testing), §AC5 (perimeter unchanged this session; existing surfaces modified), §AC7 (NOT engaged — no auth/cookie/session change), §AC8 (translation-sandwich), §AC9 (Layer2Decision four-outcome envelope — informational), §AC10 (provenance + use-policy tags — `audience` is metadata flowing through `ConsumerContext`), §AC11 (OpenTelemetry; the render helper emits no new spans — A7's span emit on the catch covers the path), §AC12 (Jest-config debt acknowledged carry-forward; no structural Jest edits this session).
6. `/operations/decision-log.md` — last 3 entries (the session-3 entry `D-R20A-OPTIONA-S3-REFLECT-WIRED-2026-05-28` + the session-2 + design-spec entries).
7. Code surfaces — read **before** any code edit:
   - `/website/src/lib/substrate/r20a-gate.ts` — A7 + S2 + S3 additions (canonical `SafetySignal` type; `isCallingR20aEnabled`; `isReflectR20aEnabled`; `overrideFlag` parameter). Session 4 does NOT modify this file.
   - `/website/src/lib/substrate/layer3-service.ts` — the home for `ConsumerContext` + (per design §3.3) the home for the new render helper. The new `audience` field is added here; the helper is a sibling export.
   - `/website/src/app/api/reason/route.ts` — the route this session modifies. **Identify the existing web-vs-API auth signal at session open.** Identify the two redirect branches the design spec §3.4 names: the route-guard branch around line ~625 and Branch 1.7 around line ~846. **These are the two surface changes this session lands.**
   - `/website/src/lib/r20a-classifier.ts` — `buildRedirectMessage()` is here (the existing human-framed crisis pass-through). This is the source text for the new `r20a_suggested_user_message` prose-mode key (per design §3.5).
   - `/website/src/lib/sage-reflect/zone3-boundary.ts` — `ZONE3_DEVELOPER_NOTE` is here (the existing developer-framed standing text). This is the source text posture for the new `r20a_developer_note` prose-mode key (per design §3.5).
   - `/website/src/app/api/calling/response-builders.ts` + `/website/src/app/api/practice/reflect/response-builders.ts` — the two placeholder `developer_note` constants (`CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER`, `REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER`). Session 4 either (a) replaces them with the new prose-mode-sourced text directly, or (b) refactors the two builders to call the new render helper. **Recommendation: (b) refactor** — the render helper is the audience-correct surface for any `R20aGateOutput`, and using it from Calling + Reflect ratifies the contract on both surfaces. Single mechanism, three call sites.
   - `/website/src/app/api/calling/route.ts` + `/website/src/app/api/practice/reflect/route.ts` — confirm the `consumer_context` is passed through (or needs adding) so `audience: 'agent_developer'` reaches the render helper.

Confirm at session open: tier (`code-critical`); P0 0h active; model selection per cache row 4 (Layer-3 = Sonnet — unchanged from existing Layer-3 work; render helper is pure-sync TS over `R20aGateOutput`, no new LLM call); status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live for implementation; Adopted / Under review / Superseded for decisions); signals + risk class; PR6 + PR12 + PR15 engaged; production state at open (expected: `SUBSTRATE_REFLECT_R20A_ENABLED` UNSET in Vercel; `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; **`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` does not exist yet** — this session creates it, default OFF).

State at session open, per the standing cache's failure-modes subsection: where we are in the arc; what's queued behind this; what's awaiting the founder vs the AI.

## Part B — Procedure

### Step 1 — Critical Change Protocol (0c-ii) drafted IN THE CONVERSATION before any code

The full six-step CCP, in the chat, visible to the founder, before any file edit:

1. **What is changing.** Plain language: add an `audience: 'human_user' | 'agent_developer'` field to `ConsumerContext`. Build a render helper in `layer3-service.ts` that converts an `R20aGateOutput` + an `audience` into the wire shape (human form = the existing crisis pass-through `redirect_message`; agent_developer form = the developer-form payload Calling + Reflect already emit). Define two new `prose_mode` keys (`r20a_developer_note`, `r20a_suggested_user_message`) with formalised wording per design §3.5. Wire `audience` setting at three routes: `/api/reason` (web vs API determined from auth signal — see Pre-condition 3); `/api/calling` (`agent_developer`); `/api/practice/reflect` (`agent_developer`). Fix `/api/reason`'s two redirect branches (route-guard ~line 625; Branch 1.7 ~line 846) to call the render helper with the route's `audience` — closes Finding 2. Refactor `buildCallingDistressRedirectResponse` + `buildReflectDistressRedirectResponse` to call the render helper (single source of truth for the agent-developer wire shape; the two route-specific builders become thin wrappers). Gate the `/api/reason` behaviour change behind new flag `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (default OFF; when UNSET, `/api/reason` returns byte-identical text to today — the bug is preserved until activation, but the fix is in code).
2. **What could break.** (a) **`/api/reason` regression on web path** — the route may not currently have a clean web-vs-API auth signal; if the determination point is ambiguous, the render helper could emit the wrong form. Mitigated by Pre-condition 3 (verify at session open) + flag default OFF + invocation testing on both branches with both audience settings. (b) **Calling + Reflect refactor regression** — refactoring the two existing placeholder builders to call the render helper changes their internals; the wire shape MUST remain byte-identical to S2 + S3 verified output when the flag-gated audience-routing is inactive on `/api/reason` (Calling + Reflect already emit the agent_developer form unconditionally — their flag posture is separate). Mitigated by re-running the S2 + S3 invocation tests as regression checks at Step 5. (c) **Prose-mode keys collision** — adding two new `prose_mode` keys to whatever existing prose-mode system the substrate uses; need to confirm the existing key namespace + serialisation pattern at session open (read of layer3-service.ts). (d) **AC11 OpenTelemetry coverage** — the render helper sits inside Layer 3; A7's existing span emit covers the catch decision, but the render-helper invocation may benefit from its own span (informational; not blocker). (e) **Live production change at activation** — when `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` is flipped ON in a future session, agent-API callers of `/api/reason` start receiving a structurally different response body (object with `distress_detected` etc. instead of the current crisis pass-through string). Strict-validating consumers may reject. Mitigated by "no current users" (build-arc cache) + activation gated behind its own future Critical session. (f) **A6 wording quality** — the new prose-mode strings are user-visible; founder reviews wording at session open per Pre-condition 5.
3. **What happens to existing sessions.** **N/A** per `/adopted/build-sessions-protocol-cache.md` "no current users." Only the founder and known test logins exist; no third-party sessions to invalidate.
4. **Rollback plan.** New env var `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (default OFF). Rollback of activation = flag OFF in Vercel + redeploy (~30s). Code-level rollback = revert the commit. Provide exact GitHub Desktop / git commands at session close. The Calling + Reflect refactor is internal — rollback restores the two placeholder constants. The new `audience` field on `ConsumerContext` is additive; rollback removes it.
5. **Verification step.** AC4 invocation test mirroring the S2 + S3 tsx pattern (PR15 — reuse). The test exercises the render helper's audience-routing logic (no live Haiku; reused-gate fixtures). Plus invocation grep on `/api/reason/route.ts`: render helper imported + called in both redirect branches; `audience` setting in the route. Plus invocation grep on Calling + Reflect routes: existing wiring unchanged. Plus regression test: run the S2 Calling test + S3 Reflect test post-refactor — expect 44/44 + 55/55. Plus `npx tsc --noEmit` whole-project. **No Jest registry change** this session — AC5 perimeter is unchanged.
6. **Explicit approval.** Founder says "OK" or "go ahead" specific to: (i) flag default OFF + name (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`); (ii) production stays UNSET at session close; (iii) `/api/reason` web-vs-API auth signal — the AI presents the actual signal found at session open + the determination point chosen; founder confirms it's correct; (iv) the audience assignment per surface (initial set: `/api/reason` audience-routed; `/api/calling` agent_developer; `/api/practice/reflect` agent_developer; founder web tools `human_user`); (v) the two new `prose_mode` keys + their initial wording — founder reviews the draft text in-session; (vi) refactor posture for the Calling + Reflect distress-redirect builders — recommendation: thin-wrapper over the render helper (single source of truth); (vii) flag-coupling posture — the new flag is independent of A7's flag, Calling's flag, Reflect's flag (four independent activations; per design §5.6); (viii) regression-check posture — re-run S2 + S3 tests in-session as regression checks at Step 5.

**Wait for "OK" before Step 2.**

### Step 2 — Build the render helper + add `audience` to `ConsumerContext`

Per design spec §3.3 + §3.5:
- In `layer3-service.ts`: add `audience: 'human_user' | 'agent_developer'` to the `ConsumerContext` interface.
- Add the two new `prose_mode` keys with initial wording (`r20a_developer_note`, `r20a_suggested_user_message`). Source the wording from `ZONE3_DEVELOPER_NOTE` (developer note posture) + `buildRedirectMessage()` (suggested user message). Surface the draft text in the chat for founder review per CCP item (v) before committing.
- Add the render helper: a single function `renderR20aRedirectResponse(gateOutput: R20aGateOutput, audience: 'human_user' | 'agent_developer', context: {...}): WireShape`. The helper is pure-sync TS; no I/O; no new LLM call.
- On `audience === 'human_user'`: returns the existing `redirect_message` crisis pass-through string (status quo for sagereasoning.com web).
- On `audience === 'agent_developer'`: returns the developer-form payload `{ distress_detected, severity, developer_note, suggested_user_message, flow_terminated, safety_signal }` — the same shape Calling + Reflect emit today, now sourced from the new `prose_mode` keys instead of route-local placeholder constants.

PR15: reuse the existing `R20aGateOutput` shape, `SafetySignal` schema, `prose_mode` mechanism — no primitives rebuilt.

### Step 3 — Wire `audience` setting at the three routes + fix `/api/reason`

- **`/api/calling/route.ts`** — set `audience: 'agent_developer'` on the path that calls Layer 3 / emits the redirect. (Calling's existing emission point is `buildCallingDistressRedirectResponse`; refactor it to call the render helper per Step 4 below — the route-level change here is small.)
- **`/api/practice/reflect/route.ts`** — same as Calling: `audience: 'agent_developer'`; route-level change small (refactor lands in the builder per Step 4).
- **`/api/reason/route.ts`** — the surface change. At session open, identify the existing web-vs-API auth signal (Pre-condition 3). Set `audience: 'human_user'` when the call is web-cookie-authenticated; `audience: 'agent_developer'` when it's API-key-authenticated. The two redirect branches (route-guard ~line 625; Branch 1.7 ~line 846) call the render helper with the route's `audience`. **Gate the agent_developer branch behind `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`** so the production human path is unchanged and the production API path is unchanged until activation. When the flag is UNSET, the agent_developer branch falls through to the existing human-form emission (the bug is preserved; the fix lives in the code; activation is a separate future Critical session).
  - PR17 caveat: if the web-vs-API determination at the route is more complex than the design spec assumed, surface it as a Diagnostic-uncertain finding (symptom-level or pattern-level) before proceeding. The design spec §3.2 revisit condition fires.

### Step 4 — Refactor Calling + Reflect distress-redirect builders to use the render helper

Per CCP item (vi) approval — recommendation: thin-wrapper.
- `buildCallingDistressRedirectResponse` becomes a thin wrapper that calls `renderR20aRedirectResponse(gateOutput, 'agent_developer', {...})` and wraps the result in a `NextResponse.json(...)` with Calling's standing headers + disclaimer. The Calling-specific placeholder constant (`CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER`) is retired.
- `buildReflectDistressRedirectResponse` becomes the parallel thin wrapper for Reflect. The Reflect-specific placeholder constant (`REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER`) is retired.
- The wire shape stays byte-identical between S3's verified output and post-refactor output (the response-builder tests in S2 + S3 tsx tests cover this; re-run at Step 5).

### Step 5 — Sandbox verify before declaring Wired

In the sandbox (TEST env not required — the new path is gated OFF on `/api/reason`; Calling + Reflect refactor preserves verified shape):
```
cd website
npx tsx src/app/api/calling/__tests__/r20a-invocation.test.ts    # regression — expect 44/44
npx tsx src/app/api/practice/reflect/__tests__/r20a-invocation.test.ts    # regression — expect 55/55
npx tsx src/app/api/reason/__tests__/r20a-audience-rendering.test.ts    # NEW — invocation + functional + audience-routing
npx tsc --noEmit                     # whole-project; expect EXIT 0
```

The new `/api/reason/__tests__/r20a-audience-rendering.test.ts` covers:
- **INV-1..N** — invocation grep over `/api/reason/route.ts` source: renders the render helper in both redirect branches; sets `audience` from the auth signal.
- **VH-1..N** — verdict-handling via reused-gate (no live Haiku): render helper produces human-form for `audience: 'human_user'` (existing redirect_message preserved); render helper produces agent-developer-form for `audience: 'agent_developer'` (new wire shape with prose-mode-sourced strings).
- **PR-1..N** — `prose_mode` lookup: `r20a_developer_note` + `r20a_suggested_user_message` resolve to the new initial wording.
- **FT-1..N** — flag semantics: `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` unset → `/api/reason` falls through to existing human-form (bug preserved); `'true'` → audience-routing engages.
- **RB-Calling-1..N + RB-Reflect-1..N** — refactor regression: thin-wrapper Calling + Reflect builders produce byte-identical wire shape to S2/S3 verified output (re-asserting the RB-1 assertions from S2 + S3 over the new render helper path).
- **AR-1..N** — audience-routing tests: a route-guard branch on `/api/reason` with `audience: 'human_user'` emits the existing crisis pass-through; with `audience: 'agent_developer'` (when flag ON) emits the developer-form payload.

The diagnostic-certainty signal at this step:
- **Diagnostic-certain — root cause identified** if all assertions pass + the invocation grep confirms the call sites + regression checks pass + `tsc --noEmit` EXIT 0.
- **Diagnostic-uncertain — symptom level** if the render helper passes functional tests but the auth-signal determination at `/api/reason` is not what the design spec assumed.
- **Diagnostic-uncertain — pattern level** carried forward on the Jest registry execution (same as S2 + S3; pre-existing F-series; no new structural Jest edits this session).

If Diagnostic-uncertain at Step 5, do not proceed to Step 6. Report and stop.

### Step 6 — Append decision-log entry (Critical-tier full form)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions." Include the same sections as S2 + S3 entries: CCP responses from Step 1; files touched; risk classification record; AC4 invocation-testing record (test output + regression check output); PR5 carry-forward (whether the S2 + S3 candidate observations recur; the new candidate observation from this session, if any); founder-performable verification commands; open questions (the audience selector for plugin-internal calls + future `audience` values + interaction with R18 honest certification on the agent-developer form, deferred per design §7); rules served (R20a, R19, R19c, AC1, AC2, AC4, AC5, AC8, AC10, AC11, AC12, 0a, 0c-ii, 0d-ii, PR1, PR3, PR6, PR10, PR12, PR15, PR16 — confirm at session close).

### Step 7 — Session close (Critical full form)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions." Include: Verification Method Used (0c framework); Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; Founder Verification (Between Sessions) — provide the four sandbox commands; Orchestration Reminder. **Production state at session close MUST be UNCHANGED** — `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` UNSET in Vercel (new flag); `SUBSTRATE_REFLECT_R20A_ENABLED` UNSET in Vercel (unchanged from S3); `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel (unchanged from S2); `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical to today (the bug is preserved until activation; the fix lives in code); `/api/substrate/layer3` → 503.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + design spec + manifest sections + code surfaces read | 30–40 min |
| Step 1 CCP drafted + founder OK (eight approval items) | 20–30 min |
| Step 2 build render helper + `ConsumerContext.audience` + prose-mode keys + initial wording review | 45–60 min |
| Step 3 wire `audience` at three routes + `/api/reason` redirect branches | 45–60 min |
| Step 4 refactor Calling + Reflect builders to thin wrappers | 25–35 min |
| Step 5 sandbox verify (new test + two regression tests + tsc) | 15–25 min |
| Step 6 decision-log entry (full form) | 25–35 min |
| Step 7 session close (full form) | 25–35 min |
| **Total** | **~4.5–5.5 hours** |

If the founder needs to break, the natural pause points are after Step 1 (CCP approved), after Step 2 (helper + prose-mode keys Wired + initial wording founder-reviewed), after Step 5 (Verified in sandbox), or after Step 6 (decision-log appended).

## Locked context — do NOT re-derive

- The ADR is **Accepted**; the design spec is the operative implementation contract. Do not re-litigate Options B/C; do not redesign the audience contract; do not redesign the `SafetySignal` schema (carry forward §7 open questions only).
- R20a classifier = Haiku (AC1 row 1 / cache Element 6). **No new classifier call in session 4** — the render helper takes the existing `R20aGateOutput` produced by A7 (or by the route's existing classifier on `/api/reason` today) and converts it to the wire shape. Layer-3 LLM = Sonnet (AC1 row 4), but session 4 does not call Layer 3 LLM — the render helper is pure-sync TS over the verdict object.
- A7 + canonical `SafetySignal` schema + `overrideFlag` + the Calling-form payload + the Reflect-form payload are the seed primitives — **reuse, do not rebuild** (PR15). The new render helper generalises the existing developer-form payload shape; the new `audience` field generalises the existing per-consumer routing; the two new `prose_mode` keys formalise the wording the placeholder constants already approximate.
- The S2 Calling test + S3 Reflect test are the PR15 model for the new test. The S3 close + decision-log entry is the PR15 model for the close + decision-log entry.
- AC5 perimeter today = 8 route-level + 2 substrate-gate = 10 routes. **Session 4 does NOT add an eleventh route** — existing surfaces modified; no new routes added. The Jest registry is structurally unchanged.
- Production UNTOUCHED at session close. New flag `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` default OFF; remains UNSET in Vercel. All other R20a flags remain UNSET in Vercel. `/api/reason` byte-identical to today (the Finding 2 bug is preserved until activation). `/api/substrate/layer3` → 503.
- F-series Jest-config debt remains acknowledged carry-forward (AC12). Session 4 does not touch the Jest registry.
- Branch `main`. The AI does no git operations. Stage by name; never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`.

## Carried forward (do NOT forget)

- **Session 5 — configuration-level invocation tests (AC4 across flows).** Opens after this session Verified. Tests `safety_signal` propagation end-to-end across L1–L7. The Option A build arc is then complete; the C2 live run verifies the new coverage.
- **C2 live run (rescoped).** Waits on the Option A arc complete. **PR17:** the AI walks the founder through the TEST-env standup LIVE, step by step.
- **Session 3 value-evidence rig.** After C2 live (name-collision with this session — value-evidence rig is the FUTURE session-3-equivalent in the post-Option-A sequence; named separately by the founder).
- **M-7 severities + audit note.** At founder's convenience. The four M-7 finding rows (Calling, Reflect-content, audience contract, propagation flag) all close after session 4 Verified.
- **A7 production activation.** Separate future Critical change; out of scope of this arc.
- **`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` production activation.** Separate future Critical change; out of scope of this session. The activation is the moment the Finding 2 bug is actually fixed in live traffic.
- **A6 wording revision.** The initial wording drafted in session 4 may be revised after the C2 live run or after operational data; the `prose_mode` mechanism supports later revision without code change.
- **PR5 candidate observations (1st recurrence each, carried from S2 + S3):**
  - "design-spec-vs-implementation flag-coupling tension surfaces only when the design spec is implemented end-to-end" (S2) — watch for a 2nd recurrence in session 4 (e.g., between `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` and the other three R20a flags).
  - "design-spec wording at the route ('X first, Y second') admits conservative-vs-closes-silent-gap interpretations" (S3) — watch for a 2nd recurrence in session 4 (e.g., on `/api/reason`'s redirect branches if the design spec wording admits a similar dual interpretation).
- **F-series Jest-config debt.** Acknowledged carry-forward (AC12). Not session-4 work.

## Rollback path

Per CCP Step 4: rollback of activation is `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` OFF in Vercel + redeploy (~30s). Production was never on. Code rollback = revert the commit and push. The Calling + Reflect builder refactor is internal — rollback restores the two placeholder constants and the byte-identical wire shape. The new `audience` field on `ConsumerContext` is additive; rollback removes it without affecting existing callers (all current call sites get a default `audience: 'agent_developer'` on rollback, matching today's behaviour since the placeholder text is already developer-framed on Calling + Reflect — only the `/api/reason` human-form path changes posture, and only when the flag is ON).

## Forecast

Session 4 ends with the Layer-3 audience-rendering surface **Wired** and (if invocation testing + regression checks pass in sandbox) **Verified at the substantive level** behind `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (default OFF). The decision-log entry captures the render-helper Wired + the two new `prose_mode` keys initial wording founder-reviewed + the `/api/reason` two-redirect-branch fix + the Calling + Reflect refactor regression-verified + the audience selector at three routes + the CCP responses + any Diagnostic-uncertain findings on the auth-signal determination. Production is UNCHANGED. The next session (session 5 — configuration-level invocation tests across L1–L7 flows) opens against the now-proven audience contract on every R20a-emitting surface. The Option A build arc completes at session 5 Verified; the C2 live run then verifies the new coverage end-to-end (PR17 live walkthrough); the four M-7 finding rows transition from "documented gaps" to "remediated via Option A."

End of prompt. Opens on `main`. **This is a Critical session — the full CCP applies, the founder must explicitly approve before Step 2.**
