# Next-Session Prompt — Option A Build Arc, Session 3: Reflect-Content R20a Catch + Propagation
**Stream:** founder.
**Tier:** **`code-critical`.** Full Critical Change Protocol (0c-ii) applies. PR1 single-endpoint proof on the Reflect-content route before any rollout. AC5 ninth-route protocol (whether Reflect-content is **new** to the perimeter or **already covered** is a session-open verification — see Pre-condition 4).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted).
**Design spec (authoritative for this session):** `/drafts/2026-05-28-r20a-single-catch-contract.md` — read in full. This session implements §2 (single catch — reuse) + §4 (canonical `SafetySignal`) + §5.3 (Reflect-content-side wiring) against the spec.
**Predecessor close:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-2-calling-wired-close.md`.
**Predecessor decision-log entries:** `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`; `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`.
**Risk classification:** **Critical** under 0d-ii + PR6 + AC5. Critical Change Protocol engages at session open.

## Why this session matters

Reflect-content is the second of the two non-substrate consumers being routed through the substrate-gate catch per design §5.3. Session 2 proved the contract on Calling end-to-end (Calling now emits the canonical `safety_signal` on REDIRECT, with the developer-form payload, behind a per-route feature flag). Session 3 stresses the contract on Reflect-content — which has a different shape than Calling: Reflect already has a `safety_signal` carrier at its developer-input boundary AND a deterministic Zone-3 boundary check, so the new content-based catch must run **additively** alongside those existing mechanisms (not replace them). Proving the contract here closes the second of the four perimeter gaps named in M-7; sessions 4 (Layer-3 audience rendering) and 5 (configuration-level invocation tests) wait on this one reaching Verified.

Two new pieces of code from session 2 are now available for reuse (PR15):
1. **The additive `overrideFlag?: boolean` parameter on `enforceLayer2R20aGate`** — Reflect uses this exactly as Calling did, so Reflect's per-route flag (`SUBSTRATE_REFLECT_R20A_ENABLED`) is independent of A7's `SUBSTRATE_R20A_GATE_ENABLED` per design §5.6.
2. **The canonical `SafetySignal` type exported from `r20a-gate.ts`** — Reflect emits this exact shape on REDIRECT + PASS+mild. The existing Reflect input-boundary `SafetySignal { harm_flagged, detail? }` carrier already maps to the canonical schema per design §4.2; the substrate-emitted signal uses `caught_at: 'substrate_layer2'` (not `'reflect_input_boundary'`).

## Pre-conditions (founder confirms at session open)

1. The design spec at `/drafts/2026-05-28-r20a-single-catch-contract.md` has been re-read (or remains acceptable as written from session 1's adoption).
2. **Founder-acknowledgement item 1 (carried from session 2 close):** the Diagnostic-uncertain — pattern level signal on the Jest registry (`r20a-invocation-guard.test.ts` fails under Jest because of pre-existing F-series Jest-config debt, AC12) is acknowledged as a pre-existing infrastructure pattern, NOT a session-3 blocker. The session-3 substrate-gate registry entry follows the same option α pattern as Calling (add Reflect-content to `SUBSTRATE_GATE_ROUTES`); execution gated on F-series remediation.
3. **AC5 registry verification for Reflect-content's actual route path** — confirmed by code-read at session open whether the existing `/api/reflect` registry entry (in the AC5 eight) covers `/api/practice/reflect` (or whichever path Sage Reflect's content route actually lives at), or whether Reflect-content is a NEW perimeter route. Two cases:
   - **Case A — `/api/reflect` and Reflect-content are the same route:** session 3 augments the existing route-level registry entry with the substrate-gate pattern; no ninth/tenth-route protocol new addition. Calling remains the only `SUBSTRATE_GATE_ROUTES` entry from session 2; Reflect joins it as the second substrate-gate entry.
   - **Case B — Reflect-content is at a different path (e.g. `/api/practice/reflect`):** the tenth-route protocol applies (Calling was the ninth in session 2; Reflect becomes the tenth). The registry's `SUBSTRATE_GATE_ROUTES` gains a second entry.
   Either case is the same Critical-tier work; only the registry-extension surface changes.
4. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` so PR1–PR17 is live in the operative surface. (Carried forward from session 2 close; confirm whether re-sync needed if any governance amendment happened between sessions.)

If any pre-condition is "no," stop and resolve before opening the session. The founder may amend the design spec before this session opens; the AI is not authorised to amend it without the founder's explicit direction.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — confirms tier (code-critical), model selection (R20a classifier = Haiku, AC1 row 1 + KG2), risk class (Critical), signals (diagnostic-certainty rows), the AI-failure-modes subsection, the lean templates.
2. `/adopted/build-sessions-protocol-cache.md` — confirms "no current users" holds; CCP step 3 ("What happens to existing sessions?") may be answered N/A.
3. This prompt + the predecessor session-2 close in full.
4. `/drafts/2026-05-28-r20a-single-catch-contract.md` — the design this session implements (especially §2 single catch / §4 propagation flag / §5.3 Reflect-content-side wiring / §6 compliance map). Re-read in full.
5. `/manifest.md` targeted sections: §R20a, §AC2 (~500ms latency budget — accepted), §AC4 (invocation testing), §AC5 (the eight-route perimeter **and** the ninth-route protocol — confirm whether Reflect-content adds a tenth route), §AC7 (NOT engaged but confirm), §AC8 (translation-sandwich), §AC12 (Jest-config-debt acknowledgement carried forward).
6. `/operations/decision-log.md` — last 3 entries (the session-2 entry `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28` + the session-1 + ADR-adoption entries).
7. Code surfaces — read **before** any code edit:
   - `/website/src/lib/substrate/r20a-gate.ts` — A7 + the session-2 additions (`isCallingR20aEnabled`, `SafetySignal` type, `overrideFlag` parameter). Reflect reuses all three.
   - `/website/src/app/api/calling/route.ts` — session-2's wired pattern. **This is the PR15 model for Reflect's wiring** — Reflect follows the same shape (per-route flag check → `enforceLayer2R20aGate` with `overrideFlag: true` → REDIRECT branch + PASS+mild branch + PASS+none branch).
   - `/website/src/app/api/calling/response-builders.ts` — session-2's `buildCallingDistressRedirectResponse` + the additive `safetySignal?` parameters on the three in-flow builders. Reflect's response builders need the equivalent additions.
   - `/website/src/app/api/calling/__tests__/r20a-invocation.test.ts` — session-2's tsx test pattern. **This is the PR15 model for Reflect's test.**
   - The Reflect-content route handler (confirm exact path at session open via grep; design §5.3 names `/api/practice/reflect` — verify) + its response builders + any pre-reflection / six-question-sequence engine code.
   - `/website/src/lib/sage-reflect/zone3-boundary.ts` — the existing developer-input-boundary Zone-3 check. **The new content-based catch is ADDITIVE to this** — Zone-3 still engages on developer-supplied `safety_signal.harm_flagged === true` or `acts_blocked[category='harm']`; the new substrate-gate catch ADDS content-based distress detection on the agent's free-text `response`.
   - `/website/src/lib/__tests__/r20a-invocation-guard.test.ts` — session-2's extended registry with `SUBSTRATE_GATE_ROUTES`. Reflect adds itself here (Case A: augment the existing `/api/reflect` entry; Case B: add a second `SUBSTRATE_GATE_ROUTES` entry).

Confirm at session open: tier (`code-critical`); P0 0h active; model selection per cache row 1 (R20a classifier = Haiku — unchanged from sessions 1, 2); status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live for implementation; Adopted / Under review / Superseded for decisions); signals + risk class; PR6 + PR12 + PR15 engaged; production state at open (expected: `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical; `/api/substrate/layer3` → 503; **`SUBSTRATE_REFLECT_R20A_ENABLED` does not exist yet** — this session creates it, default OFF).

State at session open, per the standing cache's failure-modes subsection: where we are in the arc; what's queued behind this; what's awaiting the founder vs the AI.

## Part B — Procedure

### Step 1 — Critical Change Protocol (0c-ii) drafted IN THE CONVERSATION before any code

The full six-step CCP, in the chat, visible to the founder, before any file edit:

1. **What is changing.** Plain language: add a synchronous R20a distress catch to the Reflect-content route, behind a new feature flag `SUBSTRATE_REFLECT_R20A_ENABLED`. The catch runs ADDITIVELY to the existing developer-input-boundary Zone-3 check (which engages on developer-supplied `safety_signal.harm_flagged === true` or `acts_blocked[category='harm']`). The new catch inspects the agent's free-text `response` content. On REDIRECT: halt Reflect's six-question sequence; emit canonical `safety_signal { flow_terminated: true, cause: 'distress', ... }`; render an agent-developer-form payload. On PASS+mild: continue the sequence; emit additive `safety_signal { flow_terminated: false, severity: 'mild', ... }`. On PASS+none / BYPASSED: continue unchanged. The catch reuses A7's `enforceLayer2R20aGate` with `overrideFlag: true` (per session-2 decoupling pattern) — no new classifier, no new LLM, no rebuild of the verdict logic.

2. **What could break.** Reflect's six-question sequence regressing under false-positive redirects mid-session. AC2 ~500ms added to every Reflect turn that supplies free-text `response`. The new `safety_signal` shape on the outward response is additive — strict-validating consumers may reject. **Specific to Reflect (not Calling):** the new content-based catch interacts with the existing Zone-3 boundary — confirm the order at the route (typically: Zone-3 first → if engaged, no need for the content catch; if not engaged, the content catch runs on the `response` text). Document the order inline. The existing Reflect carrier-field at input boundary (`SafetySignal { harm_flagged, detail? }`) keeps its narrow shape — the canonical schema in `r20a-gate.ts` is a superset; developer-supplied old-shape inputs continue to work per design §4.2 mapping rule.

3. **What happens to existing sessions.** **N/A** per `/adopted/build-sessions-protocol-cache.md` "no current users." Only the founder and known test logins exist; no third-party sessions to invalidate.

4. **Rollback plan.** New env var `SUBSTRATE_REFLECT_R20A_ENABLED` (default OFF). Rollback = flag OFF in Vercel + redeploy (~30s). Code-level rollback = revert the commit. Provide the exact GitHub Desktop / git commands at session close. The existing Reflect Zone-3 boundary is **unchanged** — rollback of the new path does NOT touch the existing harm-flag mechanism.

5. **Verification step.** AC4 invocation test mirroring `website/src/app/api/calling/__tests__/r20a-invocation.test.ts` (PR15 — reuse the pattern). Functional test exercises the verdict-handling via reused-gate (no live Haiku); flag tests + decoupling tests confirm `SUBSTRATE_REFLECT_R20A_ENABLED` is independent of A7's flag; response-builder shape tests confirm canonical `safety_signal` is emitted. Plus `npx tsc --noEmit` whole-project. Plus the Jest registry extension (Case A: augment `/api/reflect` entry; Case B: add second `SUBSTRATE_GATE_ROUTES` entry) — execution remains gated on F-series Jest-config remediation (acknowledged carry-forward).

6. **Explicit approval.** Founder says "OK" or "go ahead" specific to: (i) flag default OFF; (ii) AC2 ~500ms latency accepted; (iii) production `SUBSTRATE_REFLECT_R20A_ENABLED` stays UNSET at session close; (iv) AC5 registry posture (Case A augment OR Case B tenth-route protocol — depends on Pre-condition 3 verification); (v) canonical `SafetySignal` schema from design §4.2 is the carrier (re-affirmed from session 2); (vi) the order at the route: existing Zone-3 boundary check FIRST, new content-based catch SECOND (only runs if Zone-3 does not engage); (vii) mocked-classifier posture for the functional test (consistent with session 2 + A7 pattern).

**Wait for "OK" before Step 2.**

### Step 2 — AC5 ninth/tenth-route protocol (the registry change)

Per the Pre-condition 3 verification outcome:

- **Case A** (Reflect-content is the same route as the existing `/api/reflect` entry): the existing entry is in `HUMAN_FACING_POST_ROUTES` (route-level pattern). Add the route's path to `SUBSTRATE_GATE_ROUTES` as well (a route can appear in both — it has the route-level pattern AND the substrate-gate pattern as defence in depth). The four new substrate-gate `test.each` blocks from session 2 will apply.
- **Case B** (Reflect-content is at `/api/practice/reflect` or another new path): apply the tenth-route protocol in full (it is genuinely new to the perimeter under the substrate-gate pattern). `SUBSTRATE_GATE_ROUTES` gains a second entry. The four substrate-gate `test.each` blocks from session 2 now run for both Calling and Reflect.

The session-2 commit already established the registry structure (`SUBSTRATE_GATE_ROUTES`, the four `test.each` blocks, the import-from-substrate/r20a-gate assertions). Session 3's registry change is therefore minimal — just the route path added to the array (the assertions auto-apply via `test.each`).

### Step 3 — Wire the catch into the Reflect-content route handler

Per design spec §5.3 + the PR15 model from session 2's `/api/calling/route.ts`:

- Import `enforceLayer2R20aGate`, `isReflectR20aEnabled` (new; add to `r20a-gate.ts` mirroring `isCallingR20aEnabled`), and `SafetySignal` from `@/lib/substrate/r20a-gate`.
- Wire `enforceLayer2R20aGate({ text: <the agent's free-text response>, sessionId, overrideFlag: true })` into the handler **AFTER** the existing Zone-3 boundary check (so developer-declared harm signals engage first) and **BEFORE** the six-question sequence advances.
- No `safetyGate` passthrough (Reflect has no prior route-level R20a gate). A7 makes a fresh classifier call inheriting the AC2 ~500ms budget on borderline inputs.
- Gate the new wiring on `SUBSTRATE_REFLECT_R20A_ENABLED` (default OFF). When the flag is unset, the new path is byte-identical to today's Reflect behaviour.
- **On REDIRECT** (moderate/acute):
  - Halt Reflect's six-question sequence.
  - Emit a top-level `safety_signal: { flow_terminated: true, cause: 'distress', severity, caught_at: 'substrate_layer2', detail }` on the outward response.
  - Render the agent-developer-form payload per design §3.1: `{ distress_detected, severity, developer_note, suggested_user_message, flow_terminated }`. The exact wording of `developer_note` for Reflect is drawn from `ZONE3_DEVELOPER_NOTE` (already in `zone3-boundary.ts`) — adapt for the content-based catch wording (the existing note is about a developer-declared harm; the new note is about content-based distress detection). Flag the placeholder for A6 to formalise (session 4's adjacent work).
- **On PASS + mild**:
  - Continue Reflect's six-question sequence.
  - Attach `safety_signal: { flow_terminated: false, cause: 'distress', severity: 'mild', caught_at: 'substrate_layer2' }` to the response shape (additive field), and to Reflect's exit routing (Seam 4) so any downstream Sage Assent feed sees the mild signal.
- **On PASS + none / BYPASSED**:
  - Continue unchanged. No `safety_signal` emission.

PR3: the catch is awaited; no fire-and-forget. PR15: A7 + canonical `SafetySignal` reused — no new classifier built; no new schema invented.

### Step 4 — AC4 invocation tests (functional + invocation)

Mirror `website/src/app/api/calling/__tests__/r20a-invocation.test.ts` (PR15). Create the equivalent file under Reflect's `__tests__/` directory:

1. **Invocation tests (INV-1..INV-5)** — file-grep over Reflect's route source:
   - imports `enforceLayer2R20aGate` from substrate/r20a-gate
   - imports `isReflectR20aEnabled` from substrate/r20a-gate
   - imports the new Reflect distress-redirect builder
   - body awaits `enforceLayer2R20aGate` (PR3)
   - body calls `isReflectR20aEnabled()` (flag check, not just import)

2. **Verdict-handling tests (VH-1..VH-4)** — via reused-gate (no live Haiku):
   - moderate → REDIRECT + severity preserved + redirect_message non-null
   - mild → PASS + distress_signal=true + severity preserved
   - no distress → PASS + distress_signal=false
   - acute → REDIRECT + severity=acute (C2-fixture-like input)

3. **Flag tests (FT-1..FT-4)** — verify `isReflectR20aEnabled` semantics:
   - unset → false; `'true'` → true; `'false'` → false; `'1'` → false

4. **Decoupling tests (DC-1..DC-2)**:
   - A7 flag UNSET + overrideFlag=true → catch runs (not BYPASSED)
   - A7 flag UNSET + overrideFlag absent → BYPASSED (existing parallel-run.ts behaviour preserved)

5. **Response-builder tests (RB-1..RB-N)** — the Reflect distress-redirect shape per design §3.1; the additive `safety_signal` field on Reflect's existing in-flow builders.

6. **Reflect-specific test (RS-1)** — order assertion: the existing Zone-3 boundary check runs FIRST; the new content-based catch runs SECOND (only if Zone-3 does not engage). This protects the additive posture from regression.

### Step 5 — Verify in sandbox before declaring Wired

In the sandbox (TEST env not required — the new path is gated OFF in production by default):

```
cd website
npx tsx <invocation test path>       # asserts all assertions EXIT 0
npx tsc --noEmit                     # EXIT 0
```

The diagnostic-certainty signal at this step:
- **Diagnostic-certain — root cause identified** if all assertions pass and the invocation grep confirms the call site.
- **Diagnostic-uncertain — symptom level** if the functional tests pass but the invocation grep cannot confirm the call site (would mean the function exists but isn't called — exactly the PR2 failure mode to catch).

If Diagnostic-uncertain at Step 5, do not proceed to Step 6. Report and stop.

The Jest registry extension (Case A or Case B) is structural only and remains gated on F-series Jest-config remediation; carry forward the acknowledged signal from session 2.

### Step 6 — Append decision-log entry (Critical-tier full form per the standing cache)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions." Include:
- The CCP responses from Step 1 (1–6).
- Files touched (the Reflect route handler + the Reflect response builders + the test file + the registry test + `r20a-gate.ts` for `isReflectR20aEnabled` + this entry + the session close).
- Risk classification record.
- AC4 invocation testing record (the grep result + test output).
- PR5 knowledge-gap carry-forward (count any concepts re-explained this session; the session-2 candidate pattern observation is incremented if the design-spec-vs-implementation flag-coupling tension re-surfaces).
- Verification step (founder-performable) with exact commands.
- Open questions (carried from design spec §7 + session-2 close + any new).
- Rules served (R20a, AC2, AC4, AC5, AC8, AC11, AC12, 0a, 0c-ii, 0d-ii, PR1, PR3, PR6, PR10, PR12, PR15, PR16 — confirm at session close).

### Step 7 — Session close (Critical full form)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions." Include the additional sections: Verification Method Used (0c framework), Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. Production state at session close MUST be UNCHANGED — `SUBSTRATE_REFLECT_R20A_ENABLED` UNSET in Vercel (new flag); `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel (unchanged); `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical; `/api/substrate/layer3` → 503.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + design spec + manifest sections read | 25–35 min |
| Step 1 CCP drafted + founder OK | 15–20 min |
| Step 2 AC5 ninth/tenth-route protocol (registry entry; Case A or Case B) | 10–15 min |
| Step 3 wire the catch into Reflect-content route | 45–60 min (Reflect has more existing structure than Calling — order with Zone-3 matters) |
| Step 4 AC4 functional + invocation tests | 30–45 min (mirror session-2 file; add the Reflect-specific RS-1 order test) |
| Step 5 sandbox verify | 10–15 min |
| Step 6 decision-log entry (full form) | 25–35 min |
| Step 7 session close (full form) | 25–35 min |
| **Total** | **~3.5–4.5 hours** |

If the founder needs to break, the natural pause points are after Step 1 (CCP approved), after Step 5 (Verified in sandbox), or after Step 6 (decision-log appended).

## Locked context — do NOT re-derive

- The ADR is **Accepted**; the design spec is the operative implementation contract. Do not re-litigate Options B/C; do not redesign the catch contract; do not redesign the `SafetySignal` schema (carry forward §7 open questions only).
- R20a classifier = Haiku (AC1 row 1 / cache Element 6). The new path reuses A7, which reuses `detectDistressTwoStage`, which uses Haiku via `SafetyCriticalCallParams`.
- A7 + the session-2 additions (`overrideFlag` parameter, canonical `SafetySignal` type) are the seed primitives — **reuse, do not rebuild** (PR15). The new code calls `enforceLayer2R20aGate` with `overrideFlag: true`; it does not introduce a new classifier or a new carrier schema.
- The session-2 Calling wiring is the PR15 model for Reflect's wiring. The session-2 tsx test is the PR15 model for Reflect's test. The session-2 registry extension (option α) is the PR15 model for Reflect's registry change.
- AC5 perimeter today = eight route-level routes + one substrate-gate route (Calling, added session 2). Reflect joins either by augmenting an existing entry (Case A) or as a tenth route (Case B) — confirmed at session open.
- Production UNTOUCHED at session close. New flag `SUBSTRATE_REFLECT_R20A_ENABLED` default OFF; remains UNSET in Vercel. All other R20a flags remain UNSET in Vercel. `/api/reason` byte-identical. `/api/substrate/layer3` → 503.
- F-series Jest-config debt is acknowledged carry-forward (AC12). Session 3's Jest registry change is structural; execution gates on a separate F-series remediation session.
- Branch `main`. The AI does no git operations. Stage by name; never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`.

## Carried forward (do NOT forget)

- **Session 4 — Layer-3 audience rendering + `/api/reason` agent-API fix.** Waits on this session Verified. **PR15 reuse note:** session 4 builds the audience selector + render helper + the two new `prose_mode` keys (`r20a_developer_note`, `r20a_suggested_user_message`); these formalise the placeholder wording in both Calling (session 2) and Reflect (this session) distress-redirect builders.
- **Session 5 — configuration-level invocation tests (AC4 across flows).** Waits on session 4 Verified. Tests `safety_signal` propagation end-to-end across L1–L7 (the Calling → Reasoning seam and the Reflect → Sage-Assent seam now both carry the canonical carrier).
- **C2 live run (rescoped).** Waits on the Option A arc complete. **PR17:** the AI walks the founder through the TEST-env standup LIVE, step by step.
- **Session 3 — value-evidence rig.** After C2 live (note: name collision with this session 3 — the value-evidence rig is the FUTURE session-3-equivalent in the post-Option-A sequence; named separately by the founder).
- **M-7 severities + audit note.** At founder's convenience. Reflect-content was one of the M-7 finding rows — this session closes that row by building coverage, so the disposition transitions from "documented gap" to "remediated via Option A."
- **A7 production activation.** Separate future Critical change; out of scope of this arc.
- **PR5 candidate pattern (1st recurrence from session 2):** "design-spec-vs-implementation flag-coupling tension surfaces only when the design spec is implemented end-to-end." If session 3 surfaces a second flag-coupling tension (e.g., between `SUBSTRATE_REFLECT_R20A_ENABLED` and another flag), the candidate promotes to "Candidate (2nd recurrence)" per PR5 promotion rules. If session 3 does not surface it, the candidate remains at 1st recurrence and is logged in `operations/knowledge-gaps.md` at session close.
- **F-series Jest-config debt.** Acknowledged carry-forward (AC12). Not session-3 work.

## Rollback path

Per CCP Step 4: rollback is `SUBSTRATE_REFLECT_R20A_ENABLED` OFF in Vercel + redeploy (~30s). Production was never on. Code rollback = revert the commit and push. No production data is touched (the catch is read-only on the request body; no writes outside the test scaffolding). The existing Reflect Zone-3 boundary is unchanged — rollback of the new path does not touch the existing harm-flag mechanism.

## Forecast

Session 3 ends with the Reflect-content R20a catch **Wired** and (if invocation testing passes in sandbox) **Verified at the substantive level** behind `SUBSTRATE_REFLECT_R20A_ENABLED` (default OFF). The decision-log entry captures the AC5 ninth/tenth-route protocol completion (Case A augment or Case B new entry) + the AC4 functional + invocation test record + the CCP responses + any Reflect-specific findings (e.g., the existing Zone-3 boundary's interaction with the new content-based catch). Production is UNCHANGED. The next session (session 4 — Layer-3 audience rendering + `/api/reason` agent-API fix) opens against the now-proven contract on BOTH non-substrate consumers — PR1 single-endpoint proof on Calling + Reflect is the basis for the rollout of the audience contract end-to-end.

End of prompt. Opens on `main`. **This is a Critical session — the full CCP applies, the founder must explicitly approve before Step 2.**
