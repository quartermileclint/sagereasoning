# Next-Session Prompt — 0h Live-Data Test (criterion 1): founder-verify the live safety + privacy features

**Paste this whole file into a new session to proceed.**

**Stream:** founder.
**Tier:** verification (0c framework) — **Elevated** risk. **No code or config change is planned this session.** The session *exercises* live features with throwaway test data and records the result. PR17 engaged (every founder-performed step is walked through live, click by click — the Cowork sandbox cannot reach `localhost` or the live deployment). The Critical Change Protocol does **not** engage (nothing is being changed), but one Critical *surface* is exercised — genuine deletion — so the destructive-action caution below is mandatory.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-31-layer3-activation-deferred-close.md`.
**Predecessor decision-log entries:** `D-LAYER3-ACTIVATION-DEFERRED-2026-05-31`; `D-CAPABILITY-INVENTORY-FIRST-PASS-2026-05-29`; `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29`; the four 2026-05-31 R20a/R17b activation entries (see §Pre-conditions).

---

## The frame the founder set (read this first)

The founder has chosen to **drive the substrate staging plan's Stage 1 to completion and not re-litigate the P0–P7 priority roadmap until Stage 1 is done.** This session is **inside** that frame, not a detour from it: it is the verification floor under Stage 1. Several features now claimed "Verified / Live" rest only on AI code-reads + TEST-harness probes; the project's own hold-point (P0 **0h, criterion 1**) requires that *the founder* exercises every feature claimed "Wired" or above with real data before more is built on top. A10 (per-agent credentials) and the rest of the Stage-1 block sit on this foundation; confirming the foundation is real is the precondition to extending it (PR1/PR2 + the 0c verification framework). **This session does that and only that.**

## Why this session matters

It closes the one genuinely-outstanding 0h exit item (criterion 1). It either confirms the recently-shipped safety + privacy work is real end-to-end, or surfaces a concrete gap *now* — on a quiet foundation — rather than after several Critical sessions of A10 work have been layered on top. Low effort, high information value, de-risks everything after it.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. Production state unchanged from the predecessor close: all four R20a flags `true` in Vercel; `SUBSTRATE_LAYER3_ENABLED` UNSET (`/api/substrate/layer3` → 503). Source entries: `D-R20A-CALLING-ACTIVATION-2026-05-31`, `D-R20A-BATCH-ACTIVATION-REFLECT-AUDIENCE-2026-05-31`, `D-R20A-GATE-ACTIVATION-2026-05-31`, `D-R17B-REALTIME-JOURNAL-ENCRYPTION-2026-05-31`, `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31`.
2. The predecessor governance is committed + pushed (the Layer-3 deferral entry + close), and the throwaway `website/.env.r20a-gate-probe.local` has been deleted.
3. A **TEST environment** is available, or will be stood up at the start of this session (TEST Supabase project + the app on `localhost:3000` or a TEST Vercel deploy). Deletion/encryption testing must NOT run against production data. See Part B Step 1.

## ⚠ Mandatory safety caution

**Genuine deletion is irreversible. Use throwaway test users only. Never run the delete against the founder's own account or any real data.** All deletion/export/encryption tests run against a TEST Supabase project with disposable users. Distress-catch tests send benign borderline inputs and observe the response — non-destructive.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, the 0c verification framework, model-selection AC1 row).
2. `/adopted/build-sessions-protocol-cache.md` (the "no current users" note; living-state references).
3. `/operations/handoffs/founder/2026-05-31-layer3-activation-deferred-close.md` (predecessor close — production state).
4. `/operations/handoffs/founder/2026-05-29-r17-erasure-portability-LIVE-TEST-WALKTHROUGH.md` (**reuse this** — it is the deletion + export half of this session's script, already written and proven in structure).
5. `/drafts/2026-05-29-capability-inventory-first-pass.md` — §"Verification findings" + §"Master matrix" + §"Limitations of this pass" (criterion 1 outstanding for every "Wired" row).
6. `/operations/build-status-snapshot-2026-05-31.md` — the current status snapshot (orientation).

Confirm at open: tier (verification / Elevated; no change planned); hold-point status (P0 0h active — this session advances criterion 1); status vocabulary; signals/risk class; PR17 engaged. Narrate before substantive work: where we are in the arc (Stage-1 verification floor, ahead of the A10 block); what's queued (the A10→dependents chain, after this); what's awaiting the founder (running the live steps) vs the AI (assembling the exact script + expected results).

---

## Part B — Procedure

### Step 1 — Confirm / stand up the TEST environment (PR17 — walked through live)
Locate `data-room/04_test_brief/test-env-standup-checklist.md` (referenced by PR17); if present, follow it as the script. Confirm: a TEST Supabase project URL + anon key; the app reachable at `TEST_APP_URL` (localhost or TEST Vercel) running against the TEST project; the env vars the tests need (incl. the four R20a flags set in the TEST env if the agent-path catches are to be tested — see Step 2 note). The AI supplies every exact value; the founder runs each step on their machine and confirms the result before the next. **Do not reduce this to a one-line hand-off (PR17).**

### Step 2 — Assemble the full live-test script
The AI produces one consolidated, copy-paste script covering the live "Wired+" safety + privacy features below. Reuse the 2026-05-29 walkthrough verbatim for items 1–2; add items 3–6. Each step: exact value/command + expected result + a ✅ confirmation gate.

| # | Feature | What's live | Source entry | How verified (0c) |
|---|---|---|---|---|
| 1 | **Genuine deletion (R17c)** | Complete erasure incl. intimate mentor store | `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` | Seed every intimate table → delete → confirm 0 rows (the existing walkthrough Part 1) |
| 2 | **Data export / portability** | Full intimate store, decrypted for the subject | same | Export → confirm all intimate keys present + a seeded row non-empty (walkthrough Part 2) |
| 3 | **Encryption at rest (R17b)** | `realtime_journal_entries` + `mentor_profiles`/`mentor_baseline_appendix` encrypted | `D-R17B-REALTIME-JOURNAL-ENCRYPTION-2026-05-31` | Read a raw DB row of a seeded entry → confirm the stored field is ciphertext, not readable plaintext |
| 4 | **Distress catch — human path** | Synchronous + live on `/api/reason`, `/api/mentor/private/reflect`, `/api/reflect` | capability inventory finding 2 | POST a benign borderline/distress input → confirm the redirect / pass-through fires in the response |
| 5 | **Distress catch — agent path + audience rendering** | Four R20a flags now `true` (Calling, Reflect, Audience, Gate) | the three 2026-05-31 R20a entries | **First verify reachability:** confirm whether `/api/calling` + `/api/practice/reflect` are still behind `SAGE_CALLING_ENABLED` / `SAGE_REFLECT_ENABLED` 503 kill-switches (the R20a flags being on does NOT flip those). If reachable in TEST, send a borderline input + confirm the catch fires and the API-caller redirect renders in developer-form |
| 6 | **Journal distress screening** | Live | `D-R20A-JOURNAL-DISTRESS-CHECK-2026-05-31` | Submit a journal entry with distress content → confirm the screening fires |

**PR12 note for item 5:** before reporting any catch as "doesn't fire," confirm the route is actually reachable (kill-switch state) — a 503 is a disabled route, not a failed catch.

### Step 3 — Walk the founder through it live (PR17)
Founder runs each step; reports the actual result; AI confirms against expected. The AI does not mark anything "Verified" until the founder reports the confirming result.

### Step 4 — Record results + classify any gaps
For each feature: **Verified-live (founder)** or a gap logged with severity (blocker / significant / minor / cosmetic) per 0h criterion 3. Findings classified per PR10 diagnostic-certainty.

### Step 5 — Decision-log entry + session close (lean form)
Append a lean entry recording the criterion-1 results and the 0h status movement (criterion 1 advanced; note which "Wired+" features are now founder-Verified). Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" + §"Lean session close". State the production state explicitly (unchanged — verification only).

---

## What is NOT in this session

- Any code or config change. If the test surfaces a gap, it is *logged with severity* and scoped as its own session — not fixed here (unless the founder elects to reclassify and authorise a fix in-session).
- A10 / the Stage-1 build block (this session is its precondition).
- The three plaintext-table encryption batch (its own session).
- Any Layer 3 work (deferred under PR7).

## Rollback / cleanup

Nothing to roll back — no production change. Cleanup: delete every throwaway test user created (Supabase → Authentication → Users) at session end.

## Forecast

Most likely outcome: the human-path distress catches, deletion, export, and encryption-at-rest all confirm Verified-live by the founder, advancing 0h criterion 1 substantially; the agent-path catch (item 5) may be blocked by the route kill-switches and get logged as "reachability-gated, retest when enabled." A clean pass means the foundation under the A10 block is confirmed real and Stage-1 build work can resume with evidence. Any gap found here is a high-value catch made cheaply, before it could hide under later work.

End of prompt. Opens on `main`. Verification session — no changes planned; throwaway test users only; do not run deletion against real data.
