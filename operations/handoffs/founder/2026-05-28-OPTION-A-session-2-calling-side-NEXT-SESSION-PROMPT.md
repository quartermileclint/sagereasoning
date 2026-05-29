# Next-Session Prompt — Option A Build Arc, Session 2: Calling-Side R20a Catch + Propagation

**Stream:** founder.
**Tier:** **`code-critical`.** Full Critical Change Protocol (0c-ii) applies. PR1 single-endpoint proof on `/api/calling` before any rollout. AC5 ninth-route protocol (Calling is **new** to the R20a perimeter).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted).
**Design spec (authoritative for this session):** `/drafts/2026-05-28-r20a-single-catch-contract.md` — read in full. This session implements §2 (single catch — reuse) + §4 (canonical `SafetySignal`) + §5.2 (Calling-side wiring) against the spec.
**Predecessor close:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-1-verification-design-close.md`.
**Predecessor decision-log entries:** `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`.
**Risk classification:** **Critical** under 0d-ii + PR6 + AC5. Critical Change Protocol engages at session open.

## Why this session matters

Calling is the higher-impact catch in the Option A arc: the Calling→Reasoning seam is the gap that motivated the configuration-level perimeter (Finding 1 of session 1 — A7 inspects only `params.input`, so Calling-origin distress arriving as `discovered_purpose` is unscreened today). Proving the single-catch contract here first stresses the propagation flag end-to-end across a configuration boundary (PR1 single-endpoint proof). Calling is **new** to the R20a perimeter, so the AC5 ninth-route protocol applies in full. The next sessions (Reflect-content, Layer-3 audience rendering, configuration-level invocation tests) wait on this one reaching Verified.

## Pre-conditions (founder confirms at session open)

1. The design spec at `/drafts/2026-05-28-r20a-single-catch-contract.md` has been read and is acceptable (or amend before opening).
2. **Founder-acknowledgement item 1:** the audience-form gap on `/api/reason`'s agent API is treated as a gap to correct under A.3, not as intentional (Finding 2 of session 1). Affects the wire-shape decisions this session takes.
3. **Founder-acknowledgement item 2:** the canonical `SafetySignal` schema in §4.2 of the design is acceptable as the carrier shape — `{ flow_terminated, cause: 'distress' | 'harm', severity, detail?, caught_at }`. Affects what this session emits on Calling's outward shape.
4. AC5 registry verified for `/api/calling` — confirmed it is **not yet** in the eight-route perimeter; the ninth-route protocol applies in full at §5.2 of the design.
5. The Cowork project-instructions panel has been paste-synced (per `D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`) so PR1–PR17 is live in the operative surface. If not done, do this before opening.

If any pre-condition is "no," stop and resolve before opening the session. The founder may amend the design spec before this session opens; the AI is not authorised to amend it without the founder's explicit direction.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — confirms tier (code-critical), model selection (R20a classifier = Haiku, AC1 row 1 + KG2), risk class (Critical), signals (diagnostic-certainty rows), the AI-failure-modes subsection, the lean templates.
2. `/adopted/build-sessions-protocol-cache.md` — confirms "no current users" holds; CCP step 3 ("What happens to existing sessions?") may be answered N/A.
3. This prompt + the predecessor session-1 close in full.
4. `/drafts/2026-05-28-r20a-single-catch-contract.md` — the design this session implements (especially §2 single catch / §4 propagation flag / §5.2 Calling-side wiring / §6 compliance map).
5. `/manifest.md` targeted sections: §R20a, §AC2 (~500ms latency budget — accepted), §AC4 (invocation testing), §AC5 (the eight-route perimeter **and** the ninth-route protocol), §AC7 (NOT engaged but confirm), §AC8 (translation-sandwich).
6. `/operations/decision-log.md` — last 5 entries (the four 2026-05-27 ones plus session 1's `D-R20A-SC1-...-2026-05-28`).
7. Code surfaces:
   - `/website/src/lib/substrate/r20a-gate.ts` — A7 (the seed; reuse, do not rebuild — PR15).
   - `/website/src/app/api/calling/route.ts` — the route this session wires into.
   - `/website/src/lib/sage-calling/calling-service.ts` (especially "D-5 — five-specification → discovered_purpose assembly") — to understand where the agent's free-text `response` is consumed and where the catch goes in the flow.
   - `/website/src/lib/translation-sandwich/parallel-run.ts` — for the existing `enforceLayer2R20aGate` call site pattern (PR1: model on this).
   - `/website/src/lib/sage-reflect/zone3-boundary.ts` + its tests — for the existing `safety_signal` carrier shape (§4 widens this).

Confirm at session open: tier (`code-critical`); P0 0h active; model selection per cache row 1 (R20a classifier = Haiku — unchanged from session 1); status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live for implementation; Adopted / Under review / Superseded for decisions); signals + risk class; PR6 + PR12 + PR15 engaged; production state at open (expected: `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical; `/api/substrate/layer3` → 503; **no `SUBSTRATE_CALLING_R20A_ENABLED` flag exists yet** — this session creates it, default OFF).

State at session open, per the standing cache's failure-modes subsection: where we are in the arc; what's queued behind this; what's awaiting the founder vs the AI.

## Part B — Procedure

### Step 1 — Critical Change Protocol (0c-ii) drafted IN THE CONVERSATION before any code

The full six-step CCP, in the chat, visible to the founder, before any file edit:

1. **What is changing.** Plain language: add a synchronous R20a distress catch to the Calling route, behind a new feature flag. Emit a `safety_signal` carrier on the outward response shape. Halt Calling's flow on REDIRECT; render an agent-developer-form payload. The catch reuses A7's `enforceLayer2R20aGate` — no new classifier, no new LLM.
2. **What could break.** Calling's existing conversational flow regressing under false-positive redirects mid-conversation. AC2 ~500ms added to every Calling turn that contains free text (accepted). The `safety_signal` emission is a new field — consumers that strictly validate Calling's response shape may reject it; mitigation: additive-only, never replacing existing fields. AC5 perimeter broadening to a ninth route — the ninth-route protocol must complete (registry entry, classifier import, call pattern, invocation test).
3. **What happens to existing sessions.** **N/A** per `/adopted/build-sessions-protocol-cache.md` §"No current users." Only the founder and known test logins exist; no third-party sessions to invalidate.
4. **Rollback plan.** New env var `SUBSTRATE_CALLING_R20A_ENABLED` (default OFF). Rollback = flag OFF in Vercel + redeploy (~30s). Code-level rollback = revert the commit. Provide the exact GitHub Desktop / git commands at session close.
5. **Verification step.** AC4 invocation test asserting `enforceLayer2R20aGate` is imported AND called in `/api/calling`'s execution path. Positive test using the existing `C2_DISTRESS_INPUT` fixture (`website/scripts/whole-system-harness/lib/scenario-input.ts`). Negative test confirming neutral conversational input passes unchanged. `npx tsc --noEmit` EXIT 0. Provide the exact commands at session close.
6. **Explicit approval.** Founder says "OK" or "go ahead" specific to: (i) the flag default OFF; (ii) AC2 ~500ms latency accepted; (iii) production `SUBSTRATE_CALLING_R20A_ENABLED` stays UNSET at session close; (iv) AC5 ninth-route protocol is the path; (v) the canonical `SafetySignal` schema from design §4.2 is the carrier.

**Wait for "OK" before Step 2.**

### Step 2 — AC5 ninth-route protocol (the registry change)

Per manifest §AC5:

1. Add `/api/calling` as the ninth entry in `r20a-invocation-guard.test.ts`.
2. Import `detectDistressTwoStage` and `enforceDistressCheck` (or the substrate's `enforceLayer2R20aGate` — confirm the canonical call pattern at session open; the manifest names the route-level pattern, but Calling can route through the substrate's gate which inherits the same classifier).
3. Confirm the call pattern in the new wiring matches the registry's expectations (the test enforces this).
4. The invocation test is the new test in Step 4 below; it must pass before the route is considered protocol-compliant.

### Step 3 — Wire the catch into `/api/calling`'s handler

Per design spec §5.2:

- Wire `enforceLayer2R20aGate({ text: <the agent's `response`>, sessionId })` into the handler **before** the agent's `response` is folded into the next conversational state.
- No `safetyGate` passthrough (Calling has no prior route-level gate). A7 makes a fresh classifier call inheriting the AC2 ~500ms budget on borderline inputs.
- Gate the wiring on the new env flag `SUBSTRATE_CALLING_R20A_ENABLED` (default OFF). When the flag is unset, the new path is byte-identical to today's Calling behaviour.
- **On REDIRECT** (moderate/acute):
  - Halt Calling's conversational flow.
  - Emit a top-level `safety_signal: { flow_terminated: true, cause: 'distress', severity, caught_at: 'substrate_layer2', detail }` on the outward response.
  - Render the agent-developer-form payload per design §3.1: `{ distress_detected, severity, developer_note, suggested_user_message, flow_terminated }`. The exact wording of `developer_note` and `suggested_user_message` comes from the A6 prose-mode keys (`r20a_developer_note`, `r20a_suggested_user_message`) — if A6 hasn't run yet, use the placeholder text drawn from `ZONE3_DEVELOPER_NOTE` (developer note) and `buildRedirectMessage()` output (suggested user message), and flag the placeholder for A6 to formalise.
- **On PASS + mild**:
  - Continue Calling's conversational flow.
  - Attach `safety_signal: { flow_terminated: false, cause: 'distress', severity: 'mild', caught_at: 'substrate_layer2' }` to the `DiscoveredPurpose` hand-off envelope so Reasoning's A5.4 path injects pass-through prose when the configuration continues into Reasoning.
- **On PASS + none**:
  - Continue unchanged. No `safety_signal` emission (or `flow_terminated: false, cause: 'distress', severity: 'n/a'` if a uniform shape is preferred — decide at session open).
- **On BYPASSED** (flag off):
  - Continue unchanged. The new code path is invisible.

PR3: the catch is awaited; no fire-and-forget. PR15: A7 reused — no new classifier built.

### Step 4 — AC4 invocation tests (functional + invocation)

Two tests in `__tests__/`:

1. **Functional test** — given a distress fixture (reuse `C2_DISTRESS_INPUT`), assert the handler returns the agent-developer-form payload + `safety_signal.flow_terminated === true` + `safety_signal.cause === 'distress'`. Given a neutral fixture, assert the handler returns the existing Calling response shape unchanged (additive `safety_signal: flow_terminated: false` allowed).
2. **Invocation test** — grep `/api/calling/route.ts` (and any handler module it imports) for the import + the call to `enforceLayer2R20aGate`. Assert both the import line and the call site are present in the production execution path (not in a comment, not in a never-taken branch).

The invocation test mirrors the existing A7 pattern in `r20a-invocation-guard.test.ts` (PR15: model on the existing pattern).

### Step 5 — Verify in sandbox before declaring Wired

In the sandbox (TEST env not required for this — the new path is gated OFF in production by default):

```
cd website
npx tsx <invocation test path>       # asserts both tests EXIT 0
npx tsc --noEmit                     # EXIT 0
```

The diagnostic-certainty signal at this step:
- **Diagnostic-certain — root cause identified** if both tests pass and the invocation test confirms the call site.
- **Diagnostic-uncertain — symptom level** if the functional test passes but the invocation test cannot confirm the call site (would mean the function exists but isn't called — exactly the PR2 failure mode to catch).

If Diagnostic-uncertain at Step 5, do not proceed to Step 6. Report and stop.

### Step 6 — Append decision-log entry (Critical-tier full form per the standing cache)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions." Include:
- The CCP responses from Step 1 (1–6).
- Files touched (the route handler + the test file + the registry test + this entry + the session close).
- Risk classification record.
- AC4 invocation testing record (the grep result + test output).
- PR5 knowledge-gap carry-forward (count any concepts re-explained this session).
- Verification step (founder-performable) with exact commands.
- Open questions (carried from design spec §7 plus any new).
- Rules served (R20a, AC2, AC4, AC5, AC8, 0a, 0c-ii, 0d-ii, PR1, PR3, PR6, PR12, PR15, PR16 — confirm at session close).

### Step 7 — Session close (Critical full form)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions." Include the additional sections: Verification Method Used (0c framework), Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. Production state at session close MUST be UNCHANGED — `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical; `/api/substrate/layer3` → 503.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + design spec + manifest sections read | 25–35 min |
| Step 1 CCP drafted + founder OK | 15–20 min |
| Step 2 AC5 ninth-route protocol (registry entry) | 10–15 min |
| Step 3 wire the catch into `/api/calling` | 45–60 min |
| Step 4 AC4 functional + invocation tests | 30–45 min |
| Step 5 sandbox verify | 10–15 min |
| Step 6 decision-log entry (full form) | 25–35 min |
| Step 7 session close (full form) | 25–35 min |
| **Total** | **~3.5–4.5 hours** |

If the founder needs to break, the natural pause points are after Step 1 (CCP approved), after Step 5 (Verified in sandbox), or after Step 6 (decision-log appended).

## Locked context — do NOT re-derive

- The ADR is **Accepted**; the design spec is the operative implementation contract. Do not re-litigate Options B/C; do not redesign the catch contract; do not redesign the `SafetySignal` schema (carry forward §7 open questions only).
- R20a classifier = Haiku (AC1 row 1 / cache Element 6). The new path reuses A7, which reuses `detectDistressTwoStage`, which uses Haiku via `SafetyCriticalCallParams`.
- A7 is the seed primitive — **reuse, do not rebuild** (PR15). The new code calls `enforceLayer2R20aGate`; it does not introduce a new classifier.
- AC5 perimeter today = eight routes. Calling becomes the ninth via the ninth-route protocol (manifest §AC5). This is a Critical change.
- Production UNTOUCHED at session close. New flag `SUBSTRATE_CALLING_R20A_ENABLED` default OFF; remains UNSET in Vercel. `SUBSTRATE_R20A_GATE_ENABLED` also remains UNSET in Vercel. `/api/reason` byte-identical. `/api/substrate/layer3` → 503.
- Branch `main`. The AI does no git operations. Stage by name; never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`.

## Carried forward (do NOT forget)

- **Session 3 — Reflect-content R20a catch + propagation.** Waits on this session Verified.
- **Session 4 — Layer-3 audience rendering + `/api/reason` agent-API fix.** Waits on session 3 Verified.
- **Session 5 — configuration-level invocation tests (AC4 across flows).** Waits on session 4 Verified.
- **C2 live run (rescoped).** Waits on the Option A arc complete. **PR17:** the AI walks the founder through the TEST-env standup LIVE, step by step.
- **Session 3 — value-evidence rig.** After C2 live.
- **M-7 severities + audit note.** At founder's convenience.
- **A7 production activation.** Separate future Critical change; out of scope of this arc.

## Rollback path

Per CCP Step 4: rollback is `SUBSTRATE_CALLING_R20A_ENABLED` OFF in Vercel + redeploy (~30s). Production was never on. Code rollback = revert the commit and push. No production data is touched (the catch is read-only on the request body; no writes outside the existing AC4 invocation-test scaffolding).

## Forecast

Session 2 ends with the Calling-side R20a catch **Wired** and (if invocation testing passes in sandbox) **Verified** behind `SUBSTRATE_CALLING_R20A_ENABLED` (default OFF). The decision-log entry captures the AC5 ninth-route protocol completion + the AC4 functional + invocation test record + the CCP responses. Production is UNCHANGED. The next session (Reflect-content) opens against the proven contract — PR1 single-endpoint proof on Calling is the basis for the rollout.

End of prompt. Opens on `main`. **This is a Critical session — the full CCP applies, the founder must explicitly approve before Step 2.**
