# Next-Session Prompt — Option A Build Arc, Session 5: Configuration-Level Invocation Tests Across L1–L7 Flows
**Stream:** founder.
**Tier:** **`code-elevated`** (test-additions exercising existing safety code; no modification to safety logic itself). **Lean CCP applies** (per `/adopted/standing-protocol-cache.md` §"Lean templates"). The founder may reclassify upward to `code-critical` at session open if any unexpected modification to safety logic is required mid-session — the full CCP would then engage on the modification, not on the test-additions themselves.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted) + `/drafts/2026-05-28-r20a-single-catch-contract.md` §5.5 (Session D scope — AC4 across flows).
**Design spec (authoritative for this session):** `/drafts/2026-05-28-r20a-single-catch-contract.md` — re-read §4 (canonical `SafetySignal` schema + producers/consumers), §4.4 (halt semantics), §4.5 (idempotency rule), §4.6 (seam mapping — the "today" vs "after build" table), §5.5 (Session D scope), §7 Q4 (retire-internal-`distress_signal`-on-`Layer2Assessment` — deferred but adjacent).
**Predecessor close:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md`.
**Predecessor decision-log entries:** `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28`; `D-R20A-OPTIONA-S3-REFLECT-WIRED-2026-05-28`; `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`; `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`.
**Risk classification:** **Elevated** under 0d-ii (additive tests against existing safety code; no modification to R20a safety functions, route handlers, or builders). PR6 NOT engaged (no safety-function change). AC5 perimeter unchanged at 10 routes (no eleventh route added). AC4 ENGAGED at the deliverable level (this session extends AC4 from per-route to per-configuration-flow).

## Why this session matters

S2 wired the Calling-side R20a catch. S3 wired the Reflect-content catch. S4 wired the audience-rendering helper + fixed `/api/reason`'s Finding-2 agent-API gap + refactored Calling/Reflect builders to thin wrappers + formalised the `R20A_DEVELOPER_NOTE_DEFAULT` prose-mode key. **The catch contract is proven on three surfaces; the audience contract is proven across both audiences; the canonical `SafetySignal` schema is exported and consumed.** S2 + S3 + S4 between them landed 165/165 assertions of per-route + per-surface coverage.

**What is NOT yet proven** is that the propagation works **end-to-end across L1–L7 configuration flows** — specifically:

- Distress entering at a configuration's entry point is caught at the substrate boundary (already proven per-surface; this session proves it at the configuration level).
- Downstream stages in the same configuration see `safety_signal.flow_terminated === true` and SKIP normal flow (per design §4.4 halt semantics).
- Downstream stages whose OWN R20a catch would have fired SKIP emission (per §4.5 idempotency rule — only the upstream catch emits per configuration flow).
- The audience-appropriate output is rendered at the configuration's terminal stage (using the S4 render helper).
- **No double-reporting across the configuration's seams.**

Session 5 closes that gap by extending AC4 invocation testing from per-route to per-configuration-flow. **This is the final session of the Option A build arc.** After S5 Verified, the Option A scope is complete; the C2 live run (rescoped per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`) verifies the new coverage end-to-end under PR17 live walkthrough discipline.

## Pre-conditions (founder confirms at session open)

1. The design spec at `/drafts/2026-05-28-r20a-single-catch-contract.md` §4 + §5.5 has been re-read (or remains acceptable as written; founder may amend before this session opens).
2. **L1–L7 configuration flow identification.** The design spec §5.5 names "L1–L7 configuration flows" without enumerating them. **At session open the founder names the seven (or fewer/more — the count is the founder's classification) flows.** The AI does not assume a flow set; it asks via AskUserQuestion at Step 2. Likely candidates pulled from project context: `/api/reason`, `/api/calling`, `/api/practice/reflect`, `/api/mentor/private/reflect`, Sage Assent surfaces, plugin-internal tool wrappers, future K-category-migrated consumers. **The actual set is founder-supplied — do NOT proceed with an assumed list.**
3. **AI-verified at session open by code-read:** what cross-seam carrier paths exist today that this session can exercise end-to-end? Specifically:
   - Does `/api/calling`'s `discovered_purpose` envelope already forward the canonical `safety_signal` to `/api/reason` (per design §4.6 seam map)? Code-read of `/api/calling/route.ts` + `discovered_purpose` consumers.
   - Or is the propagation today purely outward-on-response-shape (each surface emits `safety_signal` on its own response; no cross-surface forwarding wired yet)?
   - This determines whether S5 tests are TRUE end-to-end (one tsx test exercising the full flow) or PROPAGATION-SHAPED (per-stage tests asserting the shape consumed/produced at each boundary). **AI surfaces the finding at Step 2 before scoping the per-flow tests.**
4. **Diagnostic-uncertain — pattern level signal on Jest registry remains carried forward** as pre-existing F-series AC12 debt; NOT a session-5 blocker. S5 may add to the Jest registry OR write sibling tsx-only test files (founder elects at Step 1 CCP item (c)).
5. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17). No governance changes expected this session.

If any pre-condition is "no," stop and resolve before opening the session. The founder may amend the design spec before this session opens; the AI is not authorised to amend it without the founder's explicit direction.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — confirms tier (`code-elevated`), model selection (**no LLM call in tests** — tsx exercising existing code), risk class (Elevated), signals (diagnostic-certainty rows), the AI-failure-modes subsection (PR17 + KG-EX1 redirect phrases), the lean templates.
2. `/adopted/build-sessions-protocol-cache.md` — confirms "no current users" holds; build-arc context.
3. This prompt + the S4 predecessor close in full.
4. `/drafts/2026-05-28-r20a-single-catch-contract.md` §4 (canonical `SafetySignal` + producers/consumers), §4.4 (halt semantics — the three actions a halt-reader takes), §4.5 (idempotency rule — `caught_at` comparison; single-emission contract), §4.6 (seam mapping — the four-seam "today vs after build" table), §5.5 (Session D scope), §7 Q4 (retire internal `distress_signal: boolean` on `Layer2Assessment` — informational; carry-forward).
5. `/manifest.md` targeted sections: §R20a, §R19, §AC4 (the core AC for this session — invocation testing), §AC5 (perimeter unchanged at 10 routes), §AC8 (translation-sandwich), §AC11 (OpenTelemetry — span propagation across seams; relevant if S5 includes span-emission assertions), §AC12 (Jest-config debt acknowledged carry-forward).
6. `/operations/decision-log.md` — last 3 entries (S4 + S3 + S2; the design-spec draft entry just before them).
7. **Code surfaces — read before any test edit:**
   - `/website/src/lib/substrate/r20a-gate.ts` — canonical `SafetySignal` schema; `enforceLayer2R20aGate`; `isCallingR20aEnabled` + `isReflectR20aEnabled` + `isSubstrateR20aGateEnabled` flags. Session 5 EXERCISES this code; it does NOT modify it.
   - `/website/src/lib/substrate/r20a-audience-renderer.ts` — the S4 helper. `renderR20aRedirectResponse` + `R20A_DEVELOPER_NOTE_DEFAULT` + `isR20aAudienceRenderingEnabled`. Session 5 exercises this.
   - `/website/src/lib/substrate/layer3-service.ts` — `ConsumerContext.audience` (S4 additive). Informational.
   - `/website/src/app/api/reason/route.ts` — both redirect branches (route-guard ~line 626; Branch 1.7 ~line 854) + `r20aAudience` derivation from `auth.user?.id`. The S4 wiring. Session 5 exercises this.
   - `/website/src/app/api/calling/route.ts` + `/website/src/app/api/calling/response-builders.ts` — Calling catch (S2); thin-wrapper builder (S4).
   - `/website/src/app/api/practice/reflect/route.ts` + `/website/src/app/api/practice/reflect/response-builders.ts` — Reflect catch (S3 + route-level Zone-3 Option (ii)); thin-wrapper builder (S4).
   - `/website/src/lib/sage-reflect/zone3-boundary.ts` — Zone-3 boundary (unchanged since S3).
   - `/website/src/lib/__tests__/r20a-invocation-guard.test.ts` — the AC5 registry (S3-refactored to `{ route, flag }[]`; two substrate-gate entries; F-series Jest-config debt acknowledged).
   - **The three PR15-model tests** (most recent to oldest):
     - `/website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts` (S4 — 66 assertions; new PR15 model with INV/PR/FT/AR/RB-Calling/RB-Reflect/SH groups)
     - `/website/src/app/api/practice/reflect/__tests__/r20a-invocation.test.ts` (S3 — 55 assertions)
     - `/website/src/app/api/calling/__tests__/r20a-invocation.test.ts` (S2 — 44 assertions)

Confirm at session open per the cache's failure-modes subsection (**narrate before any substantive work**): where we are in the arc (final session of Option A); what's queued behind this (C2 live run + value-evidence rig + M-7 closure-ready); what's awaiting the founder (pre-condition confirmations + L1–L7 flow set + CCP approval items) vs the AI (test scaffolding + sandbox verification + decision-log + close).

## Part B — Procedure (Elevated; lean CCP)

### Step 1 — Lean CCP drafted in chat

Per the standing cache's "Lean templates" section for Elevated-risk sessions. **Visible in chat; founder OK before any code is touched.**

1. **What is changing.** New tsx test file(s) — either one per L1–L7 configuration flow OR a single multi-flow test file with grouped assertions (founder elects at item (b) below). **No modification to safety code; no modification to route handlers; no modification to builders.** The Jest registry MAY or MAY NOT be touched depending on the founder's election at item (c). All test additions are additive; rollback = `git rm`.
2. **What could break.** New tests could surface real bugs in the propagation paths (per design §4.4 + §4.5). If a propagation assertion fails (e.g., a downstream stage emits when upstream already did, contradicting the idempotency rule), the AI surfaces it as a Diagnostic-uncertain — symptom level finding, and **the session reclassifies to Critical for the fix** (full CCP engages mid-session on the safety-code modification, not on the test itself). Per design spec §8 revisit condition: "A per-endpoint build session reveals routing the consumer through A7 is infeasible without a larger refactor → reconsider Option B for that endpoint."
3. **Rollback path.** Test files are additive; rollback = `git rm` the new test file(s) and revert the commit. The Jest registry edits (if any) are reversible by reverting the same commit. No production change at session close (all four R20a flags remain UNSET in Vercel); no rollback action needed for production.
4. **Verification step.** New tsx test(s) run via `npx tsx`; expect PASS on all assertions. **Regression checks:** re-run S2 + S3 + S4 tests (44/44 + 55/55 + 66/66 expected — no test updates expected). **Whole-project type-check:** `npx tsc --noEmit` EXIT 0.
5. **Founder approval (three lean items).** OK on:
   - **(a) Flow set + count** — the L1–L7 enumeration (Step 2 work).
   - **(b) Test layout** — single multi-flow test file (e.g., `r20a-configuration-flows.test.ts`) vs per-flow test files (one per flow). Recommendation: single multi-flow file with grouped assertions per flow, mirroring the S4 test's group-organisation pattern (INV/AR/RB-Calling/RB-Reflect/SH). Single file is easier to maintain and matches PR15 reuse.
   - **(c) Jest registry posture** — extend `r20a-invocation-guard.test.ts` with per-flow registry entries vs leave the Jest registry untouched and rely on tsx tests only. Recommendation: tsx-only this session (defers F-series Jest-config debt remediation; preserves the carried-forward pattern from S2 + S3).

**Wait for "OK to (a), (b), (c)" before Step 2.**

### Step 2 — Identify the L1–L7 flow set + scope per flow

The AI asks the founder via AskUserQuestion to confirm:

- The seven (or N) flow identifiers — entry point, seams traversed, terminal stage.
- For each flow, the existing test posture (likely none — that's why S5 is scoped).
- **The propagation reality finding from Pre-condition 3** — does end-to-end cross-surface forwarding exist today, or are S5 tests propagation-shaped per-stage?

If the propagation finding is "no cross-surface forwarding exists today," S5 tests assert per-stage shape contracts (Stage A produces `safety_signal` on its outward shape; Stage B's consumer-side test asserts it READS the field IF supplied; the actual end-to-end forwarding is a future K-category migration session). This is the realistic posture; the AI should not invent a forwarding mechanism that doesn't exist.

### Step 3 — Write per-flow tests

For each flow identified at Step 2, the tsx test asserts (per design §4.4 + §4.5):

- **Catch assertion (PR1 + S2/S3/S4 already proven)** — distress at the entry point is caught at the substrate boundary; A7's `enforceLayer2R20aGate` returns `decision === 'REDIRECT'` (reused-gate; no live Haiku). **Reference, not novel** — covered per-surface in S2/S3/S4; S5 confirms it from the per-flow vantage point.
- **Halt assertion (§4.4)** — the catch's `R20aGateOutput` produces a `SafetySignal` with `flow_terminated: true`, `cause: 'distress'`, `caught_at: 'substrate_layer2'`, severity preserved.
- **Idempotency assertion (§4.5)** — given a `SafetySignal` with `caught_at: 'substrate_layer2'` (upstream), a downstream consumer that would normally emit its own R20a catch SKIPS emission. (Test by constructing the upstream-caught signal as an input fixture to a downstream stage's `respond()` path; assert no second emission.)
- **Audience-correct assertion (S4)** — the configuration's terminal stage emits via the `renderR20aRedirectResponse` helper; the wire shape matches the audience-appropriate form.
- **No-double-emit assertion (§4.5)** — for a configuration with multiple R20a-capable stages, only ONE redirect emission per flow (the upstream catch).

Assertion-group naming (mirroring S4 pattern): use `FL-<flow-id>-<assertion-id>` style (e.g., `FL-CALLING-1`, `FL-REASON-2`) so failure messages are unambiguous about which flow surfaced the failure.

**Per-flow effort estimate: 8–15 assertions × 7 flows ≈ 60–100 assertions total.** Single-file layout per CCP item (b) recommendation; expect ~600–900 lines.

### Step 4 — Sandbox verify

```
cd website
npx tsx <path-to-new-multi-flow-test>                         # NEW; expect all-pass
npx tsx src/app/api/calling/__tests__/r20a-invocation.test.ts    # regression; expect 44/44
npx tsx src/app/api/practice/reflect/__tests__/r20a-invocation.test.ts    # regression; expect 55/55
npx tsx src/app/api/reason/__tests__/r20a-audience-rendering.test.ts    # regression; expect 66/66
npx tsc --noEmit                                                # whole-project; expect EXIT 0
```

**Diagnostic-certainty signal at end of Step 4:**

- **Diagnostic-certain — root cause identified** if all assertions pass + regressions pass + tsc EXIT 0. The Option A build arc completes here.
- **Diagnostic-uncertain — symptom level** if a propagation assertion fails (a real bug found). Surface finding; founder reclassifies to Critical for the fix; full CCP engages mid-session.
- **Diagnostic-uncertain — pattern level** carried forward on Jest registry (same posture as S2 + S3 + S4; pre-existing F-series AC12 debt; not a S5 regression).

### Step 5 — Decision-log entry (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry name: `D-R20A-OPTIONA-S5-CONFIGURATION-FLOWS-VERIFIED-YYYY-MM-DD` (date of session). Status: Adopted. Implementation status: configuration-level invocation tests **Wired + Verified** across the L1–L7 flows; **the Option A build arc COMPLETE**.

### Step 6 — Session close (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean session close". **The session close marks the Option A arc's completion** if all assertions pass at Step 4. Include:

- Status Changes table (per-flow Verified rows; Option A arc → Complete).
- **Next Session Should:** C2 live run rescoped — PR17 live walkthrough (founder-performed TEST-env standup walked through interactively in-session, not handed off). The C2 live run is the next sub-arc, not part of Option A.
- Carried forward: value-evidence rig (post-C2-live); M-7 closure-ready (the four finding rows now ready for founder convenience review); A7 + Calling + Reflect + audience-rendering production activations (each a separate future Critical session); A6 wording revision opportunities; F-series Jest-config debt remediation.
- Founder Verification (Between Sessions): the four `npx tsx` commands + `tsc --noEmit` + grep on the decision-log entry + ls on the close file.
- **Production state at session close MUST be UNCHANGED** — all four R20a flags UNSET in Vercel; `/api/reason` byte-identical for ALL caller types; `/api/substrate/layer3` → 503.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + S4 predecessor close + design spec §4 + §5.5 + code surfaces read | 25–35 min |
| Step 1 lean CCP + founder OK on (a)(b)(c) | 10–15 min |
| Step 2 flow-set identification via AskUserQuestion + propagation finding | 15–25 min |
| Step 3 per-flow tests (~10–15 min per flow × N flows) | 70–120 min |
| Step 4 sandbox verify (new test + 3 regressions + tsc) | 15–20 min |
| Step 5 decision-log entry (lean form) | 15–25 min |
| Step 6 session close (lean form) | 15–25 min |
| **Total** | **~3–4 hours** (depends on flow count + propagation-reality scope) |

Natural pause points: after Step 1 (CCP approved), after Step 2 (flow set identified + propagation finding surfaced), after each per-flow group Verified, after Step 4 (sandbox verify complete).

## Locked context — do NOT re-derive

- The audience contract is **Wired + Verified** as of S4. Do not re-litigate the helper design, the prose-mode keys, the `/api/reason` two-branch fix, or the Calling/Reflect builder refactors.
- The canonical `SafetySignal` schema (`r20a-gate.ts` lines 339–350) is **stable** as of S2 + S3 + S4. Session 5 EXERCISES the propagation; it does not redesign the schema. Carry forward design §7 Q4 (retire-internal-`distress_signal`-on-`Layer2Assessment`) for a future session.
- A7 + canonical `SafetySignal` + `R20aGateOutput` + the audience-rendering helper are the seed primitives — **reuse, do not rebuild** (PR15). The S4 test is the most recent PR15 model.
- All four R20a flags remain UNSET in Vercel at S5 close (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`). Session 5 may toggle them in `process.env` within tsx tests; **production state UNCHANGED at session close.**
- AC5 perimeter = 10 routes. Session 5 does NOT add an eleventh route. Existing surfaces exercised; no new routes added.
- F-series Jest-config debt remains acknowledged carry-forward (AC12). Session 5 does NOT remediate the debt (F-series stewardship session does that); session 5 may write tsx-only tests per CCP item (c) recommendation.
- Branch `main`. The AI does no git operations. Stage by name; never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`.

## Carried forward (so nothing is forgotten)

- **C2 live run (rescoped per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`).** Waits on S5 Verified. **PR17:** the AI walks the founder through the TEST-env standup LIVE, step by step, in-session. Not handed off. Verifies end-to-end coverage with live Haiku.
- **Value-evidence rig (post-Option-A "session 3" — name-collision noted).** Post-C2-live. The "session 3 value-evidence rig" is the post-Option-A sequence's session-3-equivalent, distinct from the Option-A-arc Session 3 (Reflect-content) already complete.
- **M-7 severities + audit note.** At founder's convenience. The four M-7 finding rows (Calling, Reflect-content, audience-contract, propagation-flag) all transition to "closure-ready" after S5 Verified. Founder elects when to write the audit note.
- **A7 production activation.** Separate future Critical session. `SUBSTRATE_R20A_GATE_ENABLED` flip ON in Vercel.
- **`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` production activation.** Separate future Critical session. **The Finding 2 fix activation** — once flipped ON, `/api/reason` agent-API callers start receiving the developer-form payload.
- **`SUBSTRATE_CALLING_R20A_ENABLED` + `SUBSTRATE_REFLECT_R20A_ENABLED` production activation.** Each a separate future Critical session. The substrate-gate activations on Calling + Reflect.
- **A6 wording revision opportunities.** Per design §3.5 — `R20A_DEVELOPER_NOTE_DEFAULT` is the formalised initial wording (S4 founder-approved); revisable after the C2 live run or after operational data. Also `r20a_suggested_user_message` formalisation (per design §7 Q2) — a future A6 refinement could let prose-mode override the user-message phrasing.
- **F-series Jest-config debt remediation.** Pre-existing AC12 debt; carried forward from S2 + S3 + S4. Not S5 work.
- **R18 honest certification interaction with the new agent-developer wire shape.** Out of scope of Option A; carried forward per design §7. Revisit at R18 build session.
- **`/api/reason` agent-API metering posture under `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED=ON`.** Existing Option-D loop-billing path preserved unchanged through S4. Revisit at pre-activation review session.

- **PR5 candidate observations carried into S5 (1st recurrence each; promote on 2nd recurrence per PR5):**
  - "design-spec-vs-implementation flag-coupling tension surfaces only when the design spec is implemented end-to-end" (S2 origin; did NOT recur in S3 or S4).
  - "design-spec wording 'X first, Y second' admits dual interpretations" (S3 origin; did NOT recur in S4).
  - "regression-check assumptions can be over-cautious when assertions are structural rather than text-exact" (S4 origin; watch for recurrence in S5).

## Rollback path

Test files are additive. Rollback = `git rm` the new test file(s) and revert the commit. The Jest registry edits (if any per CCP item (c)) are reversible by reverting the same commit. **No production change at session close** — all four R20a flags remain UNSET in Vercel; no rollback action needed for production.

## Forecast

S5 ends with the configuration-level invocation tests **Wired + Verified** across the L1–L7 flows (60–100 new assertions across N flows). **The Option A build arc completes at S5 close** if all assertions pass at Step 4. The decision-log entry captures the per-flow assertion record + the propagation-reality finding from Step 2 (whether end-to-end cross-surface forwarding exists today or is propagation-shaped per-stage). The session close marks the arc's completion and queues the C2 live run (PR17 live walkthrough) as the next sub-arc. The four M-7 finding rows transition to "closure-ready." Production remains UNCHANGED at S5 close; the four R20a flags remain independent + UNSET; the Finding 2 fix lives in code as a deactivated remediation pending activation.

If a propagation assertion surfaces a real bug at Step 4, S5 reclassifies to Critical mid-session for the fix; full CCP engages on the safety-code modification. The session close then captures both the test additions AND the fix; the Option A arc still completes (the bug fix is part of "Verified end-to-end").

End of prompt. Opens on `main`. **This is an Elevated session — lean CCP applies; the founder reclassifies upward if mid-session work requires it.**
