# Next-Session Prompt — R20a Distress Check on the Journal Routes (gap #4)

Paste this whole file into a new session to proceed.

**Stream:** founder. **Tier:** `code-critical` — **Critical** risk. The Critical Change Protocol (0c-ii) **APPLIES** — see Part B Step 1. **PR6 engaged** (this touches the R20a distress-detection perimeter — safety-critical, therefore always Critical regardless of apparent scope). **AC5 engaged** (perimeter addition — the ninth/tenth-route protocol). **PR3 engaged** (the safety check must be synchronous — awaited before the response is constructed). **PR17 engaged** (any TEST-env standup / live run is walked through live, step by step).

**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-31-r17b-realtime-journal-encryption-close.md`.
**Predecessor decision-log entry:** `D-R17B-REALTIME-JOURNAL-ENCRYPTION-2026-05-31`.
**Source of this gap framing:** the gap-#4 distress-coverage map in `D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30` (the two journal routes have NO distress check; LC#10 — "all human-facing tools include distress detection" — unmet for the journal; severity significant, Diagnostic-certain).

---

## ⚠️ Before you start — this is one of the open Critical follow-ups

The 2026-05-30 assessment surfaced three Critical follow-ups. The first (R17b encryption-at-write for `realtime_journal_entries`) shipped 2026-05-31 and is Verified-live. This prompt is **gap #4** (the journal distress check). If you'd rather take a different one, say so at open and the AI repoints — do **NOT** run two at once.

1. **(THIS PROMPT) R20a distress check on `/api/journal` and `/api/mentor/journal-feed`.** Both journal routes accept human free-text and write it with no distress detection. LC#10 is unmet for the journal. This is an AC5 perimeter addition (ninth/tenth route-level member).
2. **First of the four R20a production activations** — flip one R20a flag ON in Vercel (each its own Critical session with CCP + PR17).
3. **Batch-encrypt the three lower-severity plaintext tables** (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — now batchable since the single-table encryption proof landed (PR1).

---

## Carry-forward state (do NOT re-derive)

- **Production now (as of 2026-05-31):** the R17b `realtime_journal_entries` prose encryption is **LIVE and Verified-live** (`entry_ciphertext` + `entry_meta`; readers decrypt; leave-and-tolerate for legacy rows). All four R20a flags remain **UNSET** in Vercel; `/api/reason` byte-identical for all caller types; `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). The R17 `/api/user/*` erasure+export changes (2026-05-29) are LIVE.
- **Why this fix is well-grounded:** the distress-detection pattern is already proven on **eight** route-level members. The canonical pattern (see `/website/src/app/api/score/route.ts`):
  - `import { detectDistressTwoStage } from '@/lib/r20a-classifier'`
  - `import { enforceDistressCheck } from '@/lib/constraints'`
  - then, **before any store/LLM call:** `const gate = await enforceDistressCheck(detectDistressTwoStage(<user text>))` and `if (gate.shouldRedirect) return NextResponse.json({ distress_detected: true, severity: gate.result.severity, redirect_message: gate.result.redirect_message }, { status: 200, headers: corsHeaders() })`.
  - The authoritative perimeter registry is the `ROUTES` list in `/website/src/lib/__tests__/r20a-invocation-guard.test.ts` (currently 8 route-level + substrate-gate entries). Adding the two journal routes is the **AC5 ninth/tenth-route protocol**.
- **This is NOT a new architectural pattern (PR1 nuance):** the gate pattern is established. PR1's single-endpoint-proof intent is satisfied by the eight existing proofs; nonetheless, wire and verify one journal route first, then the second, rather than both blind.
- **This is always-on route-level enforcement, independent of the four UNSET R20a flags.** The score-family routes call `detectDistressTwoStage` directly (not flag-gated). The four UNSET flags govern the *substrate-side* gate on the Option-A perimeter routes (calling/reflect) — a separate matter. Adding the journal gate does not touch those flags and does not require activating them.
- **Model selection:** the distress classifier runs on **Haiku (FastModel)** per cache AC1 + KG2 (single 3-field JSON within Haiku's reliability boundary; type-enforced via `constraints.ts` `SafetyCriticalCallParams`). Confirm at open; this session names a model.

---

## Pre-conditions (founder confirms at open; AI verifies by code-read)

1. Production green and untouched since the 2026-05-31 R17b ship (four R20a flags still UNSET; R17b journal encryption live).
2. The 2026-05-31 R17b commits are pushed and Vercel is green.
3. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17).

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, **model selection AC1 row for the safety classifier**).
2. `/operations/handoffs/founder/2026-05-31-r17b-realtime-journal-encryption-close.md` (~5 min — the predecessor close).
3. `D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30` in `/operations/decision-log.md` (the gap-#4 distress-coverage map — the named follow-up this session executes).
4. `/manifest.md` targeted sections only: **§R20a** (vulnerable-user detection + redirection), **§AC5** (the R20a invocation perimeter + the ninth/tenth-route protocol), **§AC2** (synchronous safety check / latency budget), **§AC4** (invocation testing for safety functions).
5. Code-of-the-day, in full:
   - `website/src/lib/r20a-classifier.ts` (`detectDistressTwoStage`) and the `enforceDistressCheck` / `SafetyGate` definition in `website/src/lib/constraints.ts`.
   - `website/src/app/api/score/route.ts` — the canonical always-on route-level pattern to copy.
   - `website/src/lib/__tests__/r20a-invocation-guard.test.ts` — the authoritative registry + the AC5 ninth/tenth-route protocol notes.
   - `website/src/app/api/score/__tests__/` (or `api/calling/__tests__/r20a-invocation.test.ts`) — a per-route functional test to mirror.
   - The two target routes in full: `website/src/app/api/journal/route.ts` (note the `__local__` sentinel for local-storage users) and `website/src/app/api/mentor/journal-feed/route.ts` (now R17b-encrypted — the gate must run BEFORE encryption/insert).

Confirm at open: tier (`code-critical`, Critical); hold-point status (P0 0h active); **model selection (Haiku for the distress classifier; cite AC1)**; status vocabulary; signals/risk class. Narrate before substantive work: where we are in the arc (R17b shipped; this is the gap-#4 remediation); what's queued (R20a production activations; the three plaintext tables); what's awaiting the founder vs the AI.

---

## Part B — Procedure (PEV loop; PR10)

### Step 1 — Critical Change Protocol (0c-ii), in chat, BEFORE any code

Complete all six visibly and get founder approval specific to the named risks:

1. **What changes** — both journal routes screen the user's free text through the two-stage distress classifier before storing; on a Zone-2/Zone-3 detection they return a redirect-to-support response instead of storing. Plain language.
2. **What could break** — (a) a false positive could block a legitimate journal entry — name the severity tiers the classifier uses and what gets blocked; (b) added ~latency on submit (the synchronous Haiku call — AC2 budget, accepted per PR3); (c) the `__local__` sentinel on `/api/journal` must be **excluded** from screening (no server-side text exists) or it errors/wastes a call; (d) the `/api/mentor/journal-feed` gate must run **before** the R17b encryption step (don't encrypt then try to screen ciphertext). Name each.
3. **What happens to existing rows / sessions** — none affected (additive request-path check; founder + test only).
4. **Rollback** — `git revert <sha>` + push + Vercel redeploy. Additive; no schema change.
5. **Verification** — the guard test + per-route functional tests + `tsc` (Step 4 below); optional TEST live run walked through per PR17.
6. **Explicit approval** — founder says "go ahead" specific to the named risks (especially the false-positive-blocks-a-journal-entry tradeoff and which text fields are screened).

### Step 2 — Design the screening points (Diagnostic-certain before code)

- **Which text to screen, per route** — decide and state:
  - `/api/journal`: screen `reflection_text`, but **skip when `reflection_text === '__local__'`** (the local-storage sentinel — no real text server-side).
  - `/api/mentor/journal-feed`: the entry is `impression` / `assent` / `action`. Decide whether to screen the concatenation or the most acute field(s); the classifier takes a string. State the choice and why. The gate runs **after validation, before `encryptJournalProse(...)` and the insert**.
- **Response on redirect** — mirror the score-route 200 shape: `{ distress_detected: true, severity, redirect_message }`. Do **not** store the entry when redirecting (these are store-only routes; the right action is redirect, not persist).
- **Registry + tests** — add both route source paths to the `ROUTES` list in `r20a-invocation-guard.test.ts` (the AC5 ninth/tenth-route protocol); add a per-route functional test under each route's `__tests__/` mirroring an existing one (AC4 invocation testing — confirm the function is on the execution path, not just imported).
- **Model** — confirm Haiku via `SafetyCriticalCallParams` (no change; reuse the classifier as-is).

### Step 3 — Execute (PR1 nuance + PR2 + PR3)

- Wire `/api/mentor/journal-feed` first (single-route proof), verify, then `/api/journal`.
- PR3: the `await enforceDistressCheck(...)` completes **before** the response/store is constructed — synchronous, never fire-and-forget.
- PR2: confirm `detectDistressTwoStage` is on the execution path of each route (the guard test enforces this once the routes are added to `ROUTES`; the per-route functional test exercises the redirect branch).
- In-sandbox: `npx tsc --noEmit` (EXIT 0) + run the guard test + the per-route tests with the working `npx tsx` form (per `/CLAUDE.md` "Running the substrate test suite"; use `--env-file=.env.local` only for tests that transitively import `supabase-server.ts`).

### Step 4 — Verify (founder-performable; PR17 if a live run is needed)

- Static: `tsc` EXIT 0; guard test passes (both journal routes now required + present); per-route functional tests pass (clean input → stores; distress input → 200 redirect, no store).
- If a live run is elected: walk the TEST-env standup live, step by step (PR17 — reuse the `.env.development.local` → TEST pattern + the live-test script approach from 2026-05-31; do not hand it off as a one-liner). Submit a benign entry (stores) and a distress-phrasing entry (redirects, not stored).
- Classify the diagnostic certainty (PR10) on the result.

### Step 5 — Append decision-log entry (full Critical form)

Per the Critical-session template (not lean). Name the CCP record, the screened-fields decision, the `__local__` exclusion, the gate-before-encryption ordering on journal-feed, the registry addition, the verification, the rollback.

### Step 6 — Session close (full Critical form)

Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (Verification Method Used, Risk Classification Record, PR5 carry-forward, Founder Verification, Orchestration Reminder). State the Vercel/Supabase disposition explicitly (no schema change this session; whether the code shipped or staged for founder deploy).

---

## What is NOT in this session

- The four R20a production activations (the UNSET flags) — separate Critical sessions; this session does not touch them.
- The three lower-severity plaintext tables (encryption batch) — a later scoped session (PR1).
- The `/api/score` single-field distress coverage (minor — `action` only, other fields unscreened); the carried-forward manifest R17c "503 stub" drift and `mentor_profiles` schema-drift (governance pass).

---

## Forecast

The session ends with both journal routes screening human free-text through the two-stage distress classifier before storing — closing the LC#10 gap for the journal (gap #4), with the AC5 perimeter registry updated to nine/ten route-level members and per-route invocation tests proving the call path. No schema change; additive request-path enforcement. The next session is then an R20a production activation or the plaintext-table encryption batch — founder's pick.

End of prompt. Opens on `main`. Critical-tier — the full CCP runs in chat before any code is written.
