# Session Close — 2026-06-07 — A15c: GDPR Article 16 rectification endpoint built (`/api/user/rectify`)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Tier:** `code-critical` — **Critical** risk (R17 rectification surface; R17f + PR6). Full Critical Change Protocol completed visibly before any code; explicit founder approval recorded.
**Date:** 2026-06-07. **Branch:** `main`.
**Operative prompt:** `/operations/handoffs/founder/2026-06-07-post-A15b-NEXT-SESSION-PROMPT.md` (you elected **A15c**).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A15b-sar-access-endpoint-close.md`.

## What this session did

You elected A15c — the last genuine A15 build. I built `POST /api/user/rectify`: a signed-in user can correct a strict allow-list of three factual profile fields — **name (`display_name`), city, country** — on **their own** profile only. Every change is recorded with its before-and-after values in a new immutable, server-write-only audit table (`compliance_rectification_log`; no raw identifier — the subject is a SHA-256 hash). It's rate-limited (the existing 5/hour data-rights limit) and logs nothing on a no-op.

You chose to **exclude email** (it's auth-controlled — correcting it needs a re-verification flow, which would pull this Critical surface into authentication) and all derived/inferred data (you regenerate or delete that, you don't "rectify" it). A nice consequence: because the allow-list holds only non-intimate fields, the audit log never stores any of your encrypted/intimate data.

The code is built and passes a full TypeScript typecheck, lint, and a 10/10 logic check of the validator. The functional TEST run is yours to do between sessions (walkthrough below). **Nothing has deployed; production is byte-identical.** `security.ts` wasn't even edited — A15b's `RATE_LIMITS.dataRights` already named rectification, so it's reused as-is.

## Decisions Made
- `D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07` (Critical) — built `/api/user/rectify` with the `display_name`/`city`/`country` allow-list, the before/after audit table, request rate-limiting, and a self-restoring TEST script. Reuses the A15b harness; `/export`, `/access`, `/delete`, `/reason`, and `security.ts` byte-identical.

## Status Changes
| Item | Old | New |
|---|---|---|
| A15c (`/api/user/rectify`) | Scoped | **Verified-on-TEST** — founder TEST run 2026-06-07 passed (correction 200 + before/after + `audit_logged:true`; rejection 400; rate-limit 429) |
| `website/src/app/api/user/rectify/route.ts` | absent | **created (additive, uncommitted)** |
| `website/src/lib/rectifiable-fields.ts` | absent | **created (additive, uncommitted)** |
| `supabase/migrations/20260607_a15c_compliance_rectification_log.sql` | absent | **created (run on TEST, then prod)** |
| `operations/handoffs/founder/rectify-test.py` | absent | **created (additive, uncommitted)** |
| `security.ts`, `/api/user/export`, `/api/user/access`, `/api/user/delete`, `/api/reason` | — | **UNCHANGED / byte-identical** |

## Why "Wired" and not "Verified" — now resolved to Verified-on-TEST
**Update — TEST passed 2026-06-07:** the founder ran `rectify-test.py` end-to-end (correction 200 with before/after + `audit_logged:true`; non-allow-listed field 400; rate-limit 429). A15c is now **Verified-on-TEST**. The first run surfaced a TEST-data gap — the dashboard-created test user had no `public.profiles` row (404); resolved by seeding the row per the whole-system-harness pattern. The route was correct (it looks up `profiles.id`); real signups always have a profiles row. The pre-test reasoning below is retained for the record.

Per the status vocabulary (0a), an endpoint is **Verified** only once you've tested it with real/test data. I've verified it *compiles, lints, wires, and the validator logic is correct* (`tsc --noEmit` exit 0; `next lint` clean; every new function confirmed invoked in the route's execution path; 10/10 validator logic checks). The remaining step — a live run against the TEST database — is the founder-verification below. Until you run it, the honest status is **Wired**.

## Blocked On
**Files uncommitted (commit command in Founder Verification below):**
- `website/src/app/api/user/rectify/route.ts`
- `website/src/lib/rectifiable-fields.ts`
- `supabase/migrations/20260607_a15c_compliance_rectification_log.sql`
- `operations/handoffs/founder/rectify-test.py`
- `operations/decision-log.md` (one entry appended)
- `operations/handoffs/founder/2026-06-07-A15c-rectification-endpoint-close.md` (this close)

**Production state at session close:** **UNCHANGED from pre-session.** Nothing deployed. A13 cost-health detection remains Live; all four R20a flags `true`; OTel / injection-defence / Layer3 / plugin-install-auth / abuse-detection flags all UNSET; `/api/reason` byte-identical. No flags, schema, or deploys were touched in production this session. (The new migration runs on TEST first; production is your separate decision after TEST passes.)

---

## Founder Verification (Between Sessions)

This is the live functional test, all on **TEST** first — never production for the test run (standing TEST process). I'm available to walk any step with you live; here is the full script so you can also run it independently. **Do the steps in order.**

### Step 1 — Create the audit table in the TEST database (2 min)
1. Open **dashboard.supabase.com** → select the **`sagereasoning-test`** project (ref `iwdtrvuphogkwmovhnvz`).
2. Left sidebar → **SQL Editor** → **+ New query**.
3. Open the file `supabase/migrations/20260607_a15c_compliance_rectification_log.sql`, copy its entire contents, paste into the editor, and click **Run**.
4. **Expected:** "Success. No rows returned." (This is the healthy result for a successful `create table`.)
5. **Confirm the table exists with the right columns.** Note: a plain `select * from compliance_rectification_log;` on an empty table also returns **"Success. No rows returned"** with **no column display** — that is the *healthy* result (the table exists and is empty), not an error. To actually see the columns, run in a new query:
```
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'compliance_rectification_log'
order by ordinal_position;
```
**Expected:** **7 rows** — `id` (uuid), `event` (text), `subject_hash` (text), `field` (text), `old_value` (text), `new_value` (text), `rectified_at` (timestamp with time zone). ✅ before continuing.

### Step 2 — Start the local site against TEST (1 min)
In Terminal:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npm run dev
```
**Expected:** "Ready" on **http://localhost:3000**. (`.env.development.local` points dev at the TEST project — your production config is untouched.) Leave this window running.

> **Note (rate-limit):** the 5/hour data-rights limit is **shared** with `/api/user/access`. If you ran the A15b access-test recently in this same `npm run dev`, stop it (Ctrl+C) and run `npm run dev` again before the rectify test — restarting clears the in-memory rate-limit counter so the test's 429 check is clean.

### Step 3 — Run the rectify test (2 min)
Open a **second** Terminal window:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/handoffs/founder"
python3 rectify-test.py
```
**Expected output:**
- `1/5  ... Login OK.`
- `2/5  Valid correction ...` → `HTTP 200`, before/after printed, `audit_logged: True`, `Valid correction OK: YES ✓`.
- `3/5  Rejection ...` → `HTTP 400`, `Rejection works: YES ✓`.
- `4/5  Restoring display_name ...` → `HTTP 200 (restored)`.
- `5/5  Rate-limit check ...` → calls #4, #5 print, then `HTTP 429`, `Rate-limiting works: YES ✓ (got 429)`.
- Final line: `ALL CHECKS PASSED ✓`.

### Step 4 — Confirm the before/after was logged (1 min)
Back in the TEST SQL Editor:
```
select * from compliance_rectification_log order by rectified_at;
```
**Expected:** **≥ 2 rows**, each `event = rectification`, `field = display_name`, `subject_hash` a 64-character hex string, and `old_value`/`new_value` showing the change then the restore. ✅

### Step 5 — Teardown (1 min)
- In the first Terminal, press **Ctrl+C** to stop `npm run dev`.
- Optional, to leave TEST clean: in the SQL Editor run `delete from compliance_rectification_log;` (the table has no append-only trigger by design, so this is a clean delete). The test already restored `display_name`, so the test user is back to its starting state.

### If anything fails
- *Login failed* → use the stable read-endpoint TEST user `test-access-a15b@example.com` (password `testaccessa15b2026`); if it's missing, tell me and I'll walk you through reseeding it.
- *Could not reach the app* → `npm run dev` isn't running in the other window (Step 2).
- *No 429, or a check says NO ✗* → **stop and tell me** — that's a code issue I own, not something on your end. (If only the 429 fails: you likely didn't restart `npm run dev` after the access-test — see the Step 2 note.)

### Then commit + push (only after TEST passes)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/app/api/user/rectify/route.ts \
  website/src/lib/rectifiable-fields.ts \
  supabase/migrations/20260607_a15c_compliance_rectification_log.sql \
  operations/handoffs/founder/rectify-test.py \
  operations/decision-log.md \
  operations/handoffs/founder/2026-06-07-A15c-rectification-endpoint-close.md
git commit -m "A15c: GDPR Art 16 rectification endpoint /api/user/rectify — allow-list (display_name/city/country) + immutable before/after audit table + 5/hr rate-limit; reuses A15b harness; /export /access /delete /reason byte-identical. (D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07)"
```
Then push via GitHub Desktop. **Important — production deploy:** the new route will deploy, but rectification logging only works in production once you also run the `compliance_rectification_log` migration (Step 1 SQL) in the **production** Supabase project. Unlike A15b's access log (which silently no-ops if absent), here a missing table makes a *successful correction* return HTTP 207 (correction applied, audit not logged) — so run the production migration **before** relying on the endpoint in production. I can walk you through it.

---

## Next Session Should
You elect. The A15 picture after this session:
- **A15c is done** (pending your TEST run). The A15 build set is complete except the lawyer-coupled items.
- **FPE / legal track** — the long-pole gating A16/A17 and Stage-1 close; startable on wall-clock anytime; highest-leverage parallel move. (A16 = privacy governance pass; A17 = regulatory governance pass — both lawyer-coupled.)
- **A18** — onboarding + limitations governance pass (the remaining clean no-lawyer build item: R19c limitations page, R19d mirror principle, R20b framework-dependence detection — PR6 applies to A18c).
- **Governance housekeeping** — now 6 pending edits: the 5 carried (manifest A20 + A15-access postures; staging §A15 + §A14; stale `CLAUDE.md` block) **plus** the manifest `CR-GDPR-A16-RECTIFICATION` posture → "implementation built + TEST-verified; pending lawyer review"; and the A15b Wired→Verified-on-TEST status-confirm.
- **Production log-table migrations** — `compliance_access_log` (A15b) and now `compliance_rectification_log` (A15c) both need running in the production Supabase project before launch. Small founder-performed steps; walk live per PR17.
- **A19 surface rollout** / deferred Critical activations — unchanged.

## Open Questions
- **Confirmed finding (A15b/export — NOT A15c):** `profiles` has no `user_id` column (it's keyed by `id`). The shared `user-data-gathering.ts` helper (used by `/api/user/access`) and the inline copy in `/api/user/export` query `profiles` with `.eq('user_id', …)`, so the **profile section comes back empty** in both the Art 15 access response and the Art 20 export — a GDPR data-completeness gap on a Verified-live surface. Fix = query `profiles` by `id` in both places (a one-line change each). Significant severity (completeness); low live-impact (no real users). Recommended as a focused Elevated fix, or folded into the deferred `/export`→helper consolidation. **Founder to elect when.**
- `email` rectification deliberately out of scope for A15c (route email changes via the account/auth flow). Revisit only if a formal Art-16 email-correction path is wanted — it would be its own Critical session with auth/session handling.
- Audit-table exclusion from Art 15/16 (`substrate_audit_events`/`abuse_signals`/`cost_alerts` — masked, agent_id-keyed) — still a lawyer question; settle alongside A16/A17.
- The manifest `CR-GDPR-A16-RECTIFICATION` posture edit + the carried §8 governance edits remain pending your approval (not actioned this session).

## Cross-references
- Decision log: `D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07`; `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07`; `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07`.
- Disposition: `adopted/a15-sar-portability-disposition.md` §4 (Art 16) / §6 (remaining-build scope).
- Endpoint: `website/src/app/api/user/rectify/route.ts`. Allow-list + validator: `website/src/lib/rectifiable-fields.ts`. Migration: `supabase/migrations/20260607_a15c_compliance_rectification_log.sql`. Test: `rectify-test.py`.
- Rules: `manifest.md` R17h (Art 16 rectification surface), R17f + PR6 (Critical), R18/R19 (honest positioning).

*End of session close. Stabilised to known-good: production byte-identical and undeployed; the A15c endpoint built, typecheck + lint + validator-logic clean, and **TEST run passed (Verified-on-TEST 2026-06-07)**; six files uncommitted, awaiting commit; no flags, schema, or deploys touched in production.*
