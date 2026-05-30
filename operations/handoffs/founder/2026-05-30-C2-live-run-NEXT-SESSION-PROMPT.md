# Next-Session Prompt — C2 Live Run: Agent-Path R20a Catch Fired Live (TEST env, real Haiku)

Paste this whole file into a new session to continue.

**Stream:** founder.
**Tier:** **`code-critical`** opening. The session activates R20a safety flags in a **TEST** environment and runs live Haiku through the distress classifier. **Full Critical Change Protocol (0c-ii) applies** to every flag activation; **PR6 engaged** (the R20a perimeter is exercised live); **PR17 engaged** — the AI walks the founder through the TEST-env standup and the live runs **interactively, step by step, in-session**, with exact copy/paste values and a confirmation check after each step. It is NOT handed off as a one-liner. The live runs reach `localhost`, which the Cowork sandbox cannot reach, so the founder runs the commands on their own machine and reports each result back; the AI directs and verifies.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted).
**Predecessor session close (just completed):** `/operations/handoffs/founder/2026-05-30-OPTION-A-session-5-configuration-flows-close.md`.
**Predecessor decision-log entry:** `D-R20A-OPTIONA-S5-CONFIGURATION-FLOWS-VERIFIED-2026-05-30`.

---

## What just happened (carry-forward state — do NOT re-derive)

- **The Option A build arc is COMPLETE.** Across S2–S5 the R20a single-catch contract, the audience contract, and the configuration-level perimeter are all proven in code and unit-Verified: S2 wired the Calling catch (44/44), S3 the Reflect catch (55/55), S4 the audience-rendering helper + the `/api/reason` agent-API fix (66/66), S5 the configuration-flow propagation tests (61/61). 226 assertions; `tsc --noEmit` EXIT 0. S5 is committed, pushed, Vercel green as of 2026-05-30.
- **What S5 did NOT do — and why this session exists.** All of that is *code-Wired and unit-Verified*, but **the agent-path catch has never fired live.** All four R20a flags are UNSET in Vercel; the safety functions have never run against real Haiku on a real request. The capability inventory (`/drafts/2026-05-29-capability-inventory-first-pass.md`) names this as gaps #2/#3 — "wired-dark." This is launch criterion #10's agent leg. C2 closes the distance between "Wired" and "operationally proven."
- **Propagation-reality finding (S5, Diagnostic-certain):** no end-to-end cross-surface forwarding exists today — each surface emits `safety_signal` only on its own response shape; the `DiscoveredPurpose` envelope has no carrier slot; `/api/reason` neither consumes nor emits the carrier. **C2 therefore proves the per-surface catch firing live, not an end-to-end forwarded chain** (that is a future K-category migration session). Do not attempt to test a forwarding mechanism that does not exist.
- **Production state now:** S5 test-only addition is LIVE (a test file; no runtime change). The R17 `/api/user/*` changes from 2026-05-29 remain LIVE. **All four R20a flags remain UNSET in Vercel**; `/api/reason` byte-identical for all caller types; `/api/substrate/layer3` → 503. **C2 must keep production in exactly this state** — it activates flags only in a TEST environment.
- **Two optional governance carry-forwards** (not blockers; founder elects): the manifest's three stale "R17c placeholder 503" notes; the `mentor_profiles` / `mentor_profile_snapshots` schema-drift note.

---

## Why this session (the agent-path catch, fired for the first time)

Option A built the perimeter; C2 proves it works. The session stands up a **separate TEST Supabase project + local deployment** (never production), activates the R20a flags **there**, sends a distress fixture to each of the three wired surfaces (`/api/reason` agent-API path, `/api/calling`, `/api/practice/reflect`), and confirms the catch fires live (REDIRECT), returns the **agent-developer** payload (`developer_note`, `suggested_user_message`, `flow_terminated: true`, `safety_signal`), and that **neutral input passes through unchanged** (the negative control). When verified, launch criterion #10's agent leg closes and the four M-7 finding rows reach "closure-ready."

**The safety boundary that overrides everything (per `data-room/04_test_brief/test-flag-config.md` + `test-env-standup-checklist.md`):** the test environment MUST point at a TEST Supabase project and a `localhost`/preview deployment — **never** production Supabase, **never** the live Vercel deployment. If any step would touch production, **stop** — the boundary has been crossed.

---

## Pre-conditions (founder confirms at session open; the AI verifies what it can by code-read)

1. **Production green and untouched** since the S5 deploy; the four R20a flags still UNSET in Vercel (`SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`).
2. **TEST environment disposition.** A TEST-env standup was performed on 2026-05-25 for the L7 live verification (`/operations/handoffs/founder/2026-05-25-L7-live-verification-test-env-standup-close.md`). At open the founder states whether that TEST project + local env is **still standing and reusable**, or whether it must be **re-stood** per `data-room/04_test_brief/test-env-standup-checklist.md`. The AI walks whichever path live (PR17).
3. **AI-verified at open by code-read (before any flag is named):** the exact flag set the agent-path catch requires, and the auth each surface needs. Confirm by reading the three route handlers + `r20a-gate.ts` flag functions:
   - `/api/calling` catch gates on `SUBSTRATE_CALLING_R20A_ENABLED` (overrideFlag:true — independent of the substrate gate).
   - `/api/practice/reflect` catch gates on `SUBSTRATE_REFLECT_R20A_ENABLED`.
   - `/api/reason` agent-API developer-form rendering gates on `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (this is also the Finding-2 fix activation — once ON, agent-API callers receive the developer-form payload).
   - Whether `SUBSTRATE_R20A_GATE_ENABLED` is additionally needed for `/api/reason`'s own substrate-gate path, or whether the always-on route-level perimeter already catches it. **The AI surfaces the confirmed flag set before the founder sets anything.**
4. **A distress fixture is named, not assumed.** The design spec §5.2 references an existing `C2_DISTRESS_INPUT` fixture; an S5-open grep found no such literal in the `.ts` source. At open the AI either locates the fixture or, with the founder, names a concrete moderate/acute distress input string for the live runs (and a neutral input for the negative control). The AI does NOT invent a fixture silently.
5. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17). No governance changes expected this session.

If any pre-condition is "no," stop and resolve before opening.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` — tier (`code-critical`), model selection (the R20a classifier is **Haiku** per AC1; this session runs it **live**), risk class (Critical), signals, the AI-failure-modes subsection (PR17 + redirect phrases), the **full** Critical-session templates.
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" holds; build-arc context.
3. This prompt + the S5 predecessor close in full.
4. `data-room/04_test_brief/test-env-standup-checklist.md` + `data-room/04_test_brief/test-flag-config.md` — the founder-performed standup steps + the flag table + the database-boundary safety control. **The AI directs these live; the checklist is the script, not a substitute for walking it (PR17).**
5. `data-room/04_test_brief/scenario-matrix.md` + `orchestrator-harness-design.md` — what gets run once the env stands (consult for the request-threading per surface).
6. `/manifest.md` targeted sections: §R20a, §AC2 (~500ms two-stage budget — now paid live), §AC4, §AC5, §AC7.
7. `/operations/decision-log.md` — last 3 entries (S5 + R17 + capability-inventory).
8. **Code surfaces — read before naming any flag:** `/website/src/lib/substrate/r20a-gate.ts` (the flag functions + `enforceLayer2R20aGate`); the three route catch regions (`/api/calling/route.ts` ~line 447; `/api/practice/reflect/route.ts` ~line 389; `/api/reason/route.ts` ~lines 547, 668, 910); `/website/src/lib/r20a-classifier.ts` (the live two-stage classifier).

**Confirm at open (narrate before any substantive work, per the cache's failure-modes subsection):** where we are in the arc (Option A complete + deployed; this is the C2 live run, the next sub-arc); what's queued behind this (gap #4 human-tool distress coverage + gap #5 encryption confirm; then the four production activations, each a separate future Critical session); what's awaiting the founder (the TEST-env standup + the live `localhost` runs, walked through live) vs the AI (flag-set confirmation, fixture identification, the per-surface request scripts, verification of each reported result, decision-log + close).

---

## Part B — Procedure (Critical; full CCP + PR17 live walkthrough)

### Step 1 — Full Critical Change Protocol, drafted visibly in chat

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". Cover all six 0c-ii steps for the TEST-env flag activation:

1. **What is changing** — in plain language: which R20a flags are set to `true`, **in the TEST environment only**, and what that makes each surface do (the catch fires on distress; the agent receives the developer-form payload).
2. **What could break** — a false-positive redirect on neutral input (mitigated by the negative control); a live Haiku failure (the classifier fails-OPEN at the LLM layer per ADR-R20a-01; A7's outer wrapper fails-CLOSED on infrastructure throw); test spend on the test `ANTHROPIC_API_KEY`.
3. **What happens to existing sessions** — N/A (no current users; founder + test logins only; and this is a TEST env regardless).
4. **Rollback plan** — flags are TEST-only; rollback = unset them / tear down the local env. **Production is never touched, so there is nothing to roll back in production.** The exact "stop" signal: if any run is found pointing at the production `SUPABASE_URL` or the live deployment, stop immediately (checklist Step 8).
5. **Verification step** — the per-surface live runs below + the negative control + a production-untouched confirmation (`GET https://sagereasoning.com/api/public-key` still steady-state; the four flags still UNSET in Vercel).
6. **Explicit founder approval** — specific to the named risks, before any flag is set.

### Step 2 — Stand up (or confirm) the TEST environment — PR17 live walkthrough

Walk the founder through `test-env-standup-checklist.md` **interactively**, one step at a time, confirming each before the next: the separate TEST Supabase project (Steps 1–2), the test signing key-pair (Step 3 — only if the run needs `/api/reason`'s signed path; for the R20a distress catch alone it may not), the test env vars (Step 4), test credentials (Step 5 — the `sr_assent_` token for Calling/Reflect + the `/api/reason` API key or plugin-auth path), and the `localhost` smoke check (Step 6 — `GET http://localhost:3000/api/public-key` returns the **test** key). If the 2026-05-25 env is still standing, this step is a re-confirmation rather than a fresh build — still walked, not assumed.

### Step 3 — Activate the R20a flags in TEST + run the per-surface live catch

For each of the three wired surfaces, with the AI supplying the exact request (copy/paste) and the founder running it on `localhost` and reporting the JSON back:

- **Positive (catch fires):** send the distress fixture → expect the catch to REDIRECT and return the **agent-developer** payload: `status: 'redirected'`, `distress_detected: true`, `flow_terminated: true`, `developer_note` (= the formalised `R20A_DEVELOPER_NOTE_DEFAULT`), `suggested_user_message` (the crisis pass-through), and `safety_signal { flow_terminated: true, cause: 'distress', caught_at: 'substrate_layer2' }`.
- **Negative control (neutral passes):** send a neutral input → expect the surface's normal flow (no redirect; no `safety_signal` on the non-mild path).

Order per PR1 discipline: prove one surface fully, then the next. Suggested order mirrors the build arc — Calling, then Reflect, then `/api/reason` agent-API.

### Step 4 — Confirm production untouched

`GET https://sagereasoning.com/api/public-key` → steady-state shape (unchanged). The four R20a flags still UNSET in Vercel. `/api/substrate/layer3` → 503. Record the baseline-equals-after confirmation.

### Step 5 — Decision-log entry (full Critical form)

Entry name: `D-R20A-C2-LIVE-RUN-VERIFIED-YYYY-MM-DD`. Record the CCP responses, the confirmed flag set, the per-surface live results, the diagnostic-certainty signal, and the production-untouched confirmation. Status: Adopted. Implementation status: the agent-path R20a catch **Verified-live** in TEST; launch criterion #10 agent leg **closed**; the four M-7 finding rows → "closure-ready."

### Step 6 — Session close (full Critical form)

Per the cache's full-template close (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder). **Next Session Should:** capability-inventory gap #4 (confirm every human tool routes through a distress-checked endpoint) + gap #5 (intimate-data encryption end-to-end), OR the first of the four R20a **production activations** (each a separate future Critical session, with its own CCP + PR17 walkthrough). **Production state at session close MUST be UNCHANGED** — all four R20a flags UNSET in Vercel.

---

## What is NOT in this session

- **Production activation of any R20a flag.** C2 proves the catch live in TEST. Flipping any flag ON in Vercel is a separate future Critical session (four of them — one per flag), each with its own CCP + PR17 walkthrough. C2 leaves production exactly as it is.
- **End-to-end cross-surface forwarding.** Does not exist today (S5 finding); a future K-category migration session.
- **The full L7 genuine→200 credential-write loop.** That is a separate test track; C2 needs only the R20a distress path (signing/provenance may not be required — the AI confirms at Step 2).

## Rollback path

All flag changes are TEST-only; rollback = unset the test flags / tear down the local env. **Production is never touched**, so there is no production rollback. The AI does no git operations beyond the decision-log + close commit at session end (stage by name; never `git add .`).

## Forecast

The session ends with the agent-path R20a catch **fired and Verified-live** in a TEST environment across the three wired surfaces — the first time the safety functions run against real Haiku — closing launch criterion #10's agent leg and moving Option A from "Wired + unit-Verified" to "operationally proven." Production remains UNCHANGED; the four R20a flags remain UNSET; the four M-7 finding rows reach "closure-ready." The next gap after that is #4 (human-tool distress coverage) and #5 (encryption confirm), with the four production activations queued as their own Critical sessions.

End of prompt. Opens on `main`. **Critical-tier — full CCP + PR17 live walkthrough; the TEST/production boundary is the overriding safety control; production is never touched.**
