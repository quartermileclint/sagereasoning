# Next-Session Prompt — Pre-Launch Bring-Forward S1: Data-rights endpoints go-live

**Paste this whole file into a new session to proceed.**

This is **Session 1 of the pre-launch bring-forward plan** (`/operations/pre-launch-bring-forward-plan-2026-06-07.md`). It turns on the two GDPR data-rights endpoints that are already built, Verified-on-TEST, and deployed — but inert in production because their two audit tables were never created there ("deferred until there were users"). This session runs those two migrations in the production database and verifies the endpoints work, so users have working access + rectification rights from day one.

**Stream:** founder.
**Tier:** `schema` (additive production migration) + production verification → **Elevated** risk. Run with **Critical-Change-Protocol care** (it touches the production database the live system depends on; founder may say "treat this as critical" to formalise).
**Governing frame:** `/adopted/standing-protocol-cache.md` (lean + Elevated additions; PR17 — founder-performed steps walked through live, not handed off).
**Predecessor sessions:** `/operations/handoffs/founder/2026-06-07-A15b-sar-access-endpoint-close.md`, `2026-06-07-A15c-rectification-endpoint-close.md` (both built + Verified-on-TEST), and `2026-06-07-A16-A17-followup-queued-edits-close.md` (most recent).
**Predecessor decision-log entries:** `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07`, `D-A15C-RECTIFICATION-ENDPOINT-BUILT-2026-06-07`, `D-PROFILE-EXPORT-ACCESS-KEYING-FIX-2026-06-07`.
**Risk classification:** Elevated under 0d-ii (additive, idempotent, append-only new tables in production; reversible by `DROP TABLE`). The endpoint code is **already deployed** — this session adds no code. Critical Change Protocol is applied as a courtesy because it's the production DB; **PR6 not engaged** (no distress-classifier / Zone logic); **AC7 not engaged**; no auth/session/encryption/access-control/env-flag/deploy-config change.

---

## Why this session matters

Two endpoints are live in production already: `/api/user/access` (GDPR Article 15 — a user gets a full copy of their data + how it's processed) and `/api/user/rectify` (GDPR Article 16 — a user corrects their own name/city/country). Both were committed and pushed (commits `344c310`, `b0279e4`), so Vercel is serving them. What's missing is the two **audit-log tables** in the production Supabase project — they were created on TEST (where both endpoints passed end-to-end) but deliberately not in production "until there were users." Consequence today in production: `/api/user/access` works but silently fails to log the request; `/api/user/rectify` returns **HTTP 207** (the correction is applied but the before/after audit isn't recorded). Running the two migrations fixes both. This is the cheapest, lowest-uncertainty pre-launch readiness win, and it's independent of every other bring-forward item.

---

## Pre-conditions (AI verifies by read at open; founder confirms)

1. Working tree clean enough to add a docs commit at the end; no `.git/index.lock` (if present: `rm -f .git/index.lock` first).
2. `main` is up to date with `origin/main` and Vercel is green (founder confirmed at the A16/A17 follow-up close).
3. The two migration files exist and are committed: `supabase/migrations/20260607_a15b_compliance_access_log.sql`, `supabase/migrations/20260607_a15c_compliance_rectification_log.sql`. The AI confirms by read at open.
4. The AI does **no** git operations and **no** Supabase operations — the founder runs the production SQL in the Supabase dashboard and commits/pushes the docs via GitHub Desktop. The AI walks every step live (PR17).
5. The migrations are run against the **production** Supabase project, **not** TEST. Production ref: **`jdbefwkonfbhjquozgxr`** (US East / North Virginia). TEST ref (do **not** use here): `iwdtrvuphogkwmovhnvz` (`sagereasoning-test`). The AI re-confirms the production ref at open against `/compliance/sub-processor-register.md`.

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — Elevated risk; lean + Elevated additions; signals; AI-failure-modes table incl. prescribe-before-grounding + PR17).
2. This prompt's two predecessor closes (the A15b + A15c closes) — the "Founder Verification" + "Important — production deploy" sections in each carry the exact migration SQL, the column-check queries, and the production caveats.
3. The two migration files in full.
4. `/compliance/sub-processor-register.md` — confirm the production Supabase region/ref before directing any production SQL.
5. `/operations/decision-log.md` last 2 entries.

Confirm at open (narrate before any action, per the AI-failure-modes table): where we are in the arc (Session 1 of the pre-launch bring-forward plan; the endpoints are deployed + Verified-on-TEST; only the two production audit tables are missing); tier = Elevated, run with Critical-Change-Protocol care; PR17 engaged (founder runs the production SQL — AI walks it live, does not hand off); status vocabulary; model selection N/A (no LLM call); PR15 (no Anthropic primitive substitutes for running a Supabase migration — state explicitly).

---

## Part B — Procedure

**Ground each surface before acting (prescribe-before-grounding). Do the access table first, then the rectification table.**

### Step 0 — Confirm what's already live (AI, read-only)
- Confirm both route files are on `main` and pushed (`git ls-files` + `git log -1` per route) → endpoints are deployed.
- Confirm the two migration files' contents are the additive `create table if not exists … enable row level security` shape (no change to existing tables).
- State to the founder, in plain language: "The endpoints are already live. We are only adding two empty audit tables to the production database. This cannot affect sign-in or data access; the worst realistic case is a paste typo that fails cleanly and creates nothing."

### Step 1 — Critical Change Protocol brief (AI completes visibly before the founder runs anything) — 0c-ii
1. **What is changing:** two new, empty audit-log tables (`compliance_access_log`, `compliance_rectification_log`) are created in the production Supabase project. No existing table, policy, or auth setting is touched.
2. **What could break:** essentially nothing user-facing. The tables are new and additive. A paste error fails the SQL cleanly (nothing created). Sign-in, data access, `/api/reason`, and the live `/export` and `/delete` are unaffected. The only behavioural change is the intended one: `/api/user/access` starts logging requests, and `/api/user/rectify` starts returning a clean HTTP 200 (with audit) instead of 207.
3. **What happens to existing sessions:** nothing — no auth/session change. (No real users yet, so N/A in practice.)
4. **Rollback plan (founder-runnable):** in the production SQL editor, run `drop table if exists public.compliance_access_log;` and `drop table if exists public.compliance_rectification_log;`. Endpoints return to their current pre-migration behaviour. No data loss (the tables are new/empty).
5. **Verification step:** Step 4 below (column-check queries + endpoint live-check).
6. **Explicit approval:** founder says "OK / go ahead" specific to running the two production migrations before Step 2 proceeds.

### Step 2 — Run the `compliance_access_log` migration in PRODUCTION (founder, walked live)
1. Open **dashboard.supabase.com** → select the **production** project — ref **`jdbefwkonfbhjquozgxr`** (US East / North Virginia). **Confirm it is NOT the `sagereasoning-test` project** before continuing.
2. Left sidebar → **SQL Editor** → **+ New query**.
3. Open `supabase/migrations/20260607_a15b_compliance_access_log.sql`, copy its **entire** contents, paste into the editor, **Run**.
4. **Expected:** "Success. No rows returned."
5. **Confirm the table + columns** — new query:
   ```sql
   select column_name, data_type
   from information_schema.columns
   where table_schema = 'public' and table_name = 'compliance_access_log'
   order by ordinal_position;
   ```
   **Expected: 4 rows** — `id` (uuid), `event` (text), `subject_hash` (text), `requested_at` (timestamp with time zone). ✅ before continuing.

### Step 3 — Run the `compliance_rectification_log` migration in PRODUCTION (founder, walked live)
1. Same production project, SQL Editor → **+ New query**.
2. Open `supabase/migrations/20260607_a15c_compliance_rectification_log.sql`, copy its **entire** contents, paste, **Run**.
3. **Expected:** "Success. No rows returned."
4. **Confirm the table + columns** — new query:
   ```sql
   select column_name, data_type
   from information_schema.columns
   where table_schema = 'public' and table_name = 'compliance_rectification_log'
   order by ordinal_position;
   ```
   **Expected: 7 rows** — `id` (uuid), `event` (text), `subject_hash` (text), `field` (text), `old_value` (text), `new_value` (text), `rectified_at` (timestamp with time zone). ✅

### Step 4 — Verify (Elevated)
1. **Tables exist in production:** the two column-check queries above each returned the expected rows.
2. **Endpoints are live in production (read-only, creates no data):** in Terminal,
   ```
   curl -s -o /dev/null -w "%{http_code}\n" https://sagereasoning.com/api/user/access
   curl -s -o /dev/null -w "%{http_code}\n" -X POST https://sagereasoning.com/api/user/rectify
   ```
   **Expected:** `401` (or `405`) for each — **anything other than `404`** proves the route is deployed and live. (Unauthenticated calls are correctly rejected; nothing is written.)
3. **State the disposition:** access-request logging is now active; a successful rectification now returns 200 with audit (no more 207).

### Step 5 — Optional end-to-end production proof (founder elects)
Only if the founder wants live end-to-end confirmation in production: repoint a copy of `operations/handoffs/founder/access-test.py` / `rectify-test.py` at `https://sagereasoning.com` and log in with the founder's **own** production account, then confirm a row appears in each table (`select * from compliance_access_log;` / `… rectification_log;`). This writes a couple of hash-only rows to production, which can be cleared with `delete from …` afterwards (no append-only trigger). The AI walks this live. **Default: skip** — the TEST end-to-end run already passed (Verified-on-TEST), and Step 4 proves deployment + tables.

### Step 6 — Decision-log entry (lean form)
Append `D-PRELAUNCH-S1-DATA-RIGHTS-GO-LIVE-2026-06-DD` per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry": the two A15b/A15c audit tables created in production (`jdbefwkonfbhjquozgxr`); endpoints confirmed live; access-logging active and rectify returns clean 200. Note this closes the "two pending production migrations" item carried in every 06-07 close. Risk Elevated; rollback = `DROP TABLE`. Status changes: `compliance_access_log` / `compliance_rectification_log` → **Live (production)**; A15b → **Verified-live**; A15c → **Verified-live**.

### Step 7 — Session close (lean form) + commit
Per `/adopted/standing-protocol-cache.md` §"Lean session close". The only files to commit are docs (the decision-log entry + this session's close) — **no code change this session**. Provide the exact `rm -f .git/index.lock` + `git add`/commit block for the founder to push via GitHub Desktop. Vercel note: docs-only commit → no rebuild needed; the production change was the Supabase migration, already applied by hand.

---

## What is NOT in this session
- No code change, no env-flag change, no deploy-config change. (The endpoints are already deployed.)
- No CR-register posture upgrade — `CR-GDPR-A15-ACCESS` / `CR-GDPR-A16-RECTIFICATION` postures stay as-is (their upgrade is gated on lawyer review per the posture-upgrade table; do not overclaim — R19).
- No OTel / abuse-detection / R20b activation (those are Sessions 2–3 of the plan).
- No housekeeping edits (the pending governance edits + stale `CLAUDE.md` block are a separate item).

## Rollback path
In the production SQL editor: `drop table if exists public.compliance_access_log;` and `drop table if exists public.compliance_rectification_log;`. Endpoints revert to their current behaviour (access logging no-ops; rectify returns 207). No code to revert, no deploy to undo, no data lost.

## Forecast
Most likely shape: two additive migrations run cleanly in production; both tables confirmed (4 cols / 7 cols); both endpoints confirmed live (401/405); one Elevated docs commit. After it, the GDPR access + rectification rights are fully working in production, and the "two pending production migrations" line drops out of every future close. Next in the plan: Session 2 — turn on A12 OpenTelemetry (the observability keystone). One short session, ~45–60 min.

End of prompt. Opens on `main`. Elevated, run with Critical-Change-Protocol care; founder runs the production SQL in the Supabase dashboard (walked live, PR17); founder commits/pushes the docs via GitHub Desktop.
