# Next-Session Prompt — R17b Encryption-at-Write for `realtime_journal_entries`

Paste this whole file into a new session to proceed.

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk. The Critical Change Protocol (0c-ii) APPLIES — see Part B Step 1. R17f engaged (a change to the encryption surface). PR17 engaged (any TEST-env standup / live run is walked through live, step by step).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-30-capability-gaps-4-5-assessment-close.md`.
**Predecessor decision-log entry:** `D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30`.
**Source of this gap framing:** the gap-#5 map in `D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30` (the `realtime_journal_entries` plaintext row, severity significant, Diagnostic-certain).

---

## ⚠️ Before you start — this is one of three candidate next sessions

The 2026-05-30 assessment surfaced three Critical follow-ups. This prompt is written for **#1 (the highest-severity single fix)**. If you'd rather take a different one, say so at session open and the AI repoints — do NOT run two at once.

1. **(THIS PROMPT) Encrypt `realtime_journal_entries` at write (R17b).** Raw verbatim journal prose (impression / assent / action) is currently stored in plaintext — the clearest deviation from the R17b prose-encryption principle the profile / appendix / Reflect stores already follow.
2. **Distress check on `/api/journal` (+ `/api/mentor/journal-feed`) (R20a / PR6 / AC5).** The journal tools have no distress detection; LC#10 ("all human-facing tools") is unmet. This is an AC5 perimeter addition (ninth/tenth-route protocol).
3. **First of the four R20a production activations.** Flip one R20a flag ON in Vercel (each its own Critical session with CCP + PR17).

Lower-severity items also remain open and are NOT this session: the three distilled-but-intimate plaintext tables (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`); the `/api/score` single-field distress coverage (minor); the two R17 governance carry-forwards (stale manifest "R17c 503" notes; `mentor_profiles` schema-drift).

---

## Carry-forward state (do NOT re-derive)

- **Production now (UNCHANGED through the assessment):** all four R20a flags UNSET in Vercel; `/api/reason` byte-identical for all caller types; `/api/substrate/layer3` → 503; `/api/public-key` steady-state (`substrate-layer2-2026Q2`). The R17 `/api/user/*` erasure+export changes (2026-05-29) are LIVE. The capability-gaps-4-5 assessment (docs only) is **committed + deployed; Vercel green** (founder confirmed 2026-05-31).
- **Why this fix is well-grounded:** the encryption primitive already exists and is proven. `server-encryption.ts` (`encryptProfileData` / `decryptProfileData`, AES-256-GCM, 64-hex `MENTOR_ENCRYPTION_KEY`, fresh IV/call, authTag) and the storage-shaped wrappers in `encryption-helpers.ts` (`encryptForStorage` / `decryptFromStorage`, ciphertext-TEXT + meta-JSONB column pair, KG7-safe). The canonical write precedent is `mentor-profile-store.ts`; the closest precedent for THIS table's shape (verbatim prose → ciphertext column + meta column) is `sage-reflect/session-store.ts` (`response_history_ciphertext` + `response_history_meta`).
- **Gap #1 is already resolved** — `/api/user/delete` covers `realtime_journal_entries` (Class A) per `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` (verified-live, deployed). So the deletion path already clears this table; this session only changes how its prose is stored at rest. NB: `/api/user/export` decrypts intimate tables on access — if export currently reads `realtime_journal_entries` columns directly, it must be updated to decrypt the new ciphertext (check in Part B Step 2).

## Pre-conditions (founder confirms at open; AI verifies by code-read)

1. Production green and untouched since the 2026-05-30 assessment commit (four R20a flags still UNSET; nothing else deployed). Founder confirms no Vercel/deploy action since.
2. The assessment commit (decision-log entry + close) is pushed and Vercel is green (founder confirmed 2026-05-31).
3. The Cowork project-instructions panel remains paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, risk class, signals, status vocabulary, model selection).
2. `/operations/handoffs/founder/2026-05-30-capability-gaps-4-5-assessment-close.md` (~5 min — the predecessor close).
3. `D-CAPABILITY-GAPS-4-5-ASSESSED-2026-05-30` in `/operations/decision-log.md` (the gap-#5 map; the named follow-up this session executes).
4. `/manifest.md` targeted sections only: §R17b, §R17e, §R17f, §AC7 (and the KG7 JSONB-storage note).
5. Code-of-the-day, in full: `website/src/lib/server-encryption.ts`, `website/src/lib/encryption-helpers.ts`, `website/src/lib/sage-reflect/session-store.ts` (the closest precedent), `website/src/app/api/mentor/journal-feed/route.ts` (the write path), and every reader of `realtime_journal_entries` (`grep -rl "realtime_journal_entries" website/src`).

Confirm at open: tier (`code-critical`, Critical); hold-point status (P0 0h active); model selection (N/A — no LLM call in this change); status vocabulary; signals/risk class. Narrate before substantive work: where we are in the arc (assessment done; this is the first remediation); what's queued (the other two Critical follow-ups + the lower-severity items); what's awaiting the founder vs the AI.

## Part B — Procedure (PEV loop; PR10)

### Step 1 — Critical Change Protocol (0c-ii), in chat, BEFORE any code
Complete all six visibly and get founder approval specific to the named risks:
1. **What changes** — `realtime_journal_entries` write path encrypts the three verbatim fields (impression / assent / action) at rest; readers decrypt server-side. Plain language.
2. **What could break** — readers that expect plaintext columns (the GET feed; `realtime_journal_lag_stats` view; `/api/user/export`); any lag-stat aggregation that reads the prose columns; existing plaintext rows (founder + test only). Name each.
3. **What happens to existing rows** — there are only founder/test rows. Decide + state: leave-and-tolerate (reader handles both), or one-time migrate, or accept that pre-change rows stay plaintext. (No current users — low stakes, but state it.)
4. **Rollback** — exact `git revert <sha>` + push + Vercel redeploy; plus what happens to rows written while the change was live.
5. **Verification** — the founder-run check (Step 4 below).
6. **Explicit approval** — founder says "go ahead" specific to the named risks.

### Step 2 — Design the column shape + reader audit (Diagnostic-certain before code)
- Decide the at-rest shape using the Reflect precedent: replace the three plaintext columns with a ciphertext-TEXT column + a meta-JSONB column (e.g. `entry_ciphertext` + `entry_meta`), encrypting `{ impression, assent, action }` as one blob via `encryptForStorage` (KG7: meta is a plain object, never `JSON.stringify`-ed). Confirm whether the lag-stats view needs any of the prose columns (it should only need timestamps) — if it reads prose, redesign so the queryable signal stays plaintext and only prose is encrypted.
- Audit every reader (`grep`) and list each one's required change. Include `/api/user/export` (must decrypt) and the GET feed (must decrypt before returning to the authenticated owner).
- Migration: write the idempotent DDL (add new columns; keep/drop old per the Step-1 decision). Schema change to an existing table = Elevated on its own, Critical here because it's the encryption surface.

### Step 3 — Execute (single-endpoint proof; PR1 + PR2)
- Implement encrypt-at-write in `/api/mentor/journal-feed` POST and decrypt-at-read in its GET + any other reader + `/api/user/export`. Prove on this one table only.
- PR2: confirm the encrypt call is actually on the execution path (grep for the call, not just the import), and the decrypt is reached by each reader.
- In-sandbox: `npx tsc --noEmit` (EXIT 0) + any tsx round-trip test for the new column shape.

### Step 4 — Verify (founder-performable; PR17 if a live run is needed)
- Provide the exact founder-run check: write a journal entry on a TEST DB, then `SELECT` the row and confirm the prose columns are ciphertext (not readable) and `jsonb_typeof(entry_meta) = 'object'`; then GET the feed and confirm it round-trips to readable text for the owner; then run `/api/user/export` and confirm the entry decrypts. If a live run is needed, walk the TEST-env standup live, step by step (PR17) — do not hand it off as a one-liner.
- Classify the diagnostic certainty (PR10) on the result.

### Step 5 — Append decision-log entry (full Critical form)
Per the Critical-session template (not the lean form). Name the CCP record, the reader-audit results, the migration, the verification, the rollback.

### Step 6 — Session close (full Critical form)
Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (Verification Method Used, Risk Classification Record, PR5 carry-forward, Founder Verification, Orchestration Reminder). **Production state at close must state the Vercel/Supabase disposition explicitly** (whether the migration + code shipped, or staged for the founder to deploy).

## What is NOT in this session
- The other two Critical follow-ups (journal distress check; R20a production activations).
- The three lower-severity plaintext tables (`mentor_interactions`, `mentor_observations_structured`, `mentor_journal_refs`) — a later scoped session may batch them once this single-table proof lands (PR1).
- `mentor_profile_snapshots` (metadata tier — out of scope; design-consistent plaintext).

## Forecast
The session ends with `realtime_journal_entries` verbatim prose encrypted at rest (R17b), proven on the single table per PR1, with every reader + `/api/user/export` decrypting correctly — closing the clearest gap-#5 deviation. Whether it ships or stages for founder deploy is stated at close. The next session is then the journal distress check (gap #4) or the first R20a production activation — founder's pick.

End of prompt. Opens on `main`. Critical-tier — the full CCP runs in chat before any code is written.
