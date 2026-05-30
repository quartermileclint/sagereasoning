# Next-Session Prompt — R17 Erasure + Portability Completeness (Gap #1)

**Stream:** founder.
**Tier:** `code-critical` (the session may modify the data-deletion endpoint). **Full templates + Critical Change Protocol apply.**
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — only founder + test logins).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-29-capability-inventory-first-pass-close.md`.
**Predecessor decision-log entries:** `D-CAPABILITY-INVENTORY-FIRST-PASS-2026-05-29`; `D-CONFIG-AUDIT-DIRECTION-CAPABILITY-INVENTORY-2026-05-29`.
**Risk classification:** **Critical** under 0d-ii (data deletion + service-role access control). Critical Change Protocol (0c-ii) applies in full to any change to `/api/user/delete`. **PR6 NOT engaged** (this is data deletion, not the distress classifier). AC7 not engaged. **KG1 engaged** (Supabase DB writes). **PR17 engaged** (the verification step runs against a TEST environment the Cowork sandbox cannot reach — it is walked through live, not handed off).
**Source of this prompt:** the first-pass capability inventory ranked this gap #1 (`/drafts/2026-05-29-capability-inventory-first-pass.md`, Ranked gap list).

---

## ⚠ Read this first — the gap is NOT yet confirmed (diagnostic-uncertain)

The inventory ranked this #1 on the belief that `/api/user/delete` leaves the R17b intimate mentor store behind. **That belief is unconfirmed and may be wrong.** While drafting this prompt the AI found that the intimate tables are declared with `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`. The delete route's step 4 calls `supabaseAdmin.auth.admin.deleteUser(userId)`, which removes the `auth.users` row — and Postgres **automatically cascade-deletes every row keyed to it.** So erasure of the intimate data may already happen via the database cascade, even though the route's explicit `tablesToDelete` array does not name those tables.

**Therefore this session is diagnosis-first.** Do NOT open by editing the delete route. Open by confirming whether the cascade already covers every personal-data table. Only the tables that are genuinely orphaned (no cascade, or keyed to a non-cascading parent) need code. **The one gap already confirmed** is the **export** route (`/api/user/export`): it lists 8 tables explicitly, no cascade assists it, and it omits the intimate store — so GDPR Art 15 (access) / Art 20 (portability) are incomplete regardless of how erasure resolves.

Signals in play: **"Diagnostic-uncertain — symptom level"** on the deletion gap; **"I'm confident"** on the export gap.

---

## Why this session matters

R17 erasure (R17c) and access/portability are launch criterion #7 ("R17 intimate data protections operational") and feed the lawyer-review critical path (#5). Unlike the Option A R20a work, this is not covered by the "no current users" simplification: the moment any real user exists, erasure and access must be complete and correct for *all* personal data, including the most intimate (journal interpretations, mentor profile, passion/oikeiosis reflections). Getting this provably right — or provably already-right — closes the top-ranked launch-blocking gap and de-risks the lawyer engagement.

## Pre-conditions (founder confirms at session open)

1. Production is green and untouched (verified between sessions). All four R20a flags remain UNSET — this session does not touch them.
2. The founder can stand up / reach a TEST environment for the verification step (a throwaway test user — **never the founder's own account; deletion is irreversible**). If the test runs on `localhost`, the Cowork sandbox cannot reach it, so the founder runs it live with the AI narrating each step (PR17).
3. Branch `main`; the AI does no git operations.

---

## Part A — Open under the protocol (code-critical reads)

Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, risk class, signals, KG register (KG1), AI-failure-modes, **full vs lean templates** (this is Critical → full).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" holds; component-registry is the migration source-of-truth.
3. This prompt + the predecessor close in full.
4. `/drafts/2026-05-29-capability-inventory-first-pass.md` — §"Verification findings" (#1) and the Ranked gap list (#1, #5).
5. `/manifest.md` — targeted: R17 (esp. R17b application-level encryption, R17c genuine deletion), R17f, KG1 (Vercel five rules), AC7 (auth/access disposition).
6. **Source, read-only:** `website/src/app/api/user/delete/route.ts`; `website/src/app/api/user/export/route.ts`; and every Supabase migration defining a per-user table — at least `supabase-mentor-appendix-migration.sql`, `supabase-mentor-profiles-migration.sql`, `supabase-mentor-gaps-migration.sql`, plus any other `supabase-*.sql` / migration files that `CREATE TABLE` with a `user_id` (grep the repo for `REFERENCES auth.users`).

Confirm at open (narrate before any work, per the cache's failure-modes subsection): where we are in the arc (post-inventory; gap #1 selected); what's queued (diagnosis → scope decision → CCP → optional code → live verification); what's awaiting the founder (the CCP approval + the live test); what's awaiting the AI (the diagnosis + any code). Model selection: **N/A** (no LLM calls). KG scan: **KG1 engaged** — read its resolution before touching DB-write code.

---

## Part B — Procedure

### Step 1 — DIAGNOSE cascade coverage (read-only; Standard)

Build a complete map of every table holding personal data:

| Table | User-scoping column | FK to `auth.users(id)`? | `ON DELETE` behaviour | Reached by current delete-array? | Reached by export-array? |
|---|---|---|---|---|---|

Populate it from the migration files. For each table classify erasure coverage as:
- **(A) Cascade-covered** — FK to `auth.users(id) ON DELETE CASCADE`: erased automatically when the auth user is deleted. No delete-code change needed.
- **(B) Transitively cascade-covered** — FK to a parent that itself cascades from `auth.users` (e.g. a `*_snapshots` table FK to `mentor_profiles`). Confirm the chain; no change needed if the chain is unbroken.
- **(C) Orphaned** — no cascade to auth.users, or keyed differently: **requires explicit deletion** in the route.

Also check tables named in the inventory but not yet schema-confirmed: `mentor_interactions`, `mentor_profile_snapshots`, `mentor_journal_refs`, `mentor_observations_structured`, `realtime_journal_lag_stats` (the last may be a VIEW, not a table — confirm; views need no deletion).

Output: the filled table, with each row classified A/B/C. **State a diagnostic-certainty signal** for the conclusion ("Diagnostic-certain — root cause identified" once the schema is fully mapped).

### Step 2 — Decide scope (founder decision)

Present, in chat, what the diagnosis implies:
- **Deletion route:** if all personal tables are class A/B → the route may need **no functional change** (optionally: add a defensive comment, or add the intimate tables to the explicit array as belt-and-braces + to keep the `compliance_deletion_log` `tables_cleared` field honest). If any class C → they must be added in FK-safe order.
- **Export route (confirmed gap):** add the intimate tables to the export `tables[]` list so Art 15/20 access/portability is complete. Decide whether intimate fields are exported in plaintext or noted as encrypted-at-rest (ties to R17b — confirm with the encryption modules before dumping `*`).

Founder elects the scope. If the answer is "deletion already complete via cascade; only export needs fixing," the deletion-route portion is **descoped** and the export change alone is **Elevated** (changes existing user-facing functionality), not Critical — but keep the session under the Critical template since deletion was in scope at open.

### Step 3 — Critical Change Protocol (visible in chat; only if the delete route is changed)

Complete all six steps before the founder deploys:
1. **What is changing** — plain language (e.g. "the delete endpoint will also explicitly remove these N intimate tables").
2. **What could break** — the specific worst case: a wrong user-scoping column or a wrong `.eq()` could delete the wrong rows. Name the mitigation (every intimate table is `user_id`-scoped per its RLS `auth.uid() = user_id` policy; each delete is `.eq('user_id', userId)`; deletes run independently and collect errors as the existing code does).
3. **What happens to existing sessions** — N/A (no current users; only founder + test logins) per the build cache; state it explicitly.
4. **Rollback plan** — exact command: `git revert <sha> && git push`, then redeploy via Vercel. The change is additive to an array, so revert is clean.
5. **Verification step** — Step 5 below.
6. **Explicit approval** — founder says "go ahead" specific to the named deletion risk.

### Step 4 — Implement (PR10 PEV; PR1 single-endpoint; PR2 wire-verify-immediate)

Make only the elected changes. Keep the existing fail-open-per-table pattern and the `compliance_deletion_log` insert (update its `tables_cleared` to reflect the new list). Mirror any encryption-aware handling in the export route.

### Step 5 — VERIFY live with a TEST account (PR17 — walked through, not handed off)

The AI directs this click-by-click; the founder runs it (the sandbox cannot reach `localhost` or the live test surface):
1. Create a **throwaway test user** (not the founder's account).
2. Populate intimate data: submit a journal entry, run a private-mentor reflect, trigger a passion-event / oikeiosis reflection — enough to write rows in each intimate table.
3. Confirm rows exist (a `select count(*)` per table via the Supabase SQL editor — AI supplies the exact SQL).
4. Call `DELETE /api/user/delete` with `{ "confirm": "DELETE" }` for the test user (AI supplies the exact `curl`).
5. Re-run the per-table `select count(*)` — **expected: 0 rows in every personal-data table, including the intimate ones.** AI supplies the exact SQL and the expected output.
6. Call `GET /api/user/export` for a second test user with intimate data — confirm the export JSON now includes the intimate tables.

Record the actual counts. If any intimate table still has rows after deletion, that is a class-C table that needs explicit handling — return to Step 4.

### Step 6 — Decision-log entry (full form for a Critical session)
Append `D-R17-ERASURE-PORTABILITY-COMPLETENESS-YYYY-MM-DD`. Record the diagnosis result (which tables were A/B/C), what changed (possibly "deletion unchanged — cascade confirmed complete; export extended"), the Critical Change Protocol record, and the live verification counts.

### Step 7 — Session close (full form for a Critical session)
Include the additional Critical sections: Verification Method Used (0c), Risk Classification Record (0d-ii), PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), and the production-state line.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + close + inventory finding + manifest R17/KG1 + read 2 routes & migrations | 30–45 min |
| Step 1 diagnosis (schema map + A/B/C classification) | 30–45 min |
| Step 2 scope decision + founder OK | 10–20 min |
| Step 3 Critical Change Protocol (if delete route changes) | 15–25 min |
| Step 4 implement | 20–40 min |
| Step 5 live verification with test account (founder-run, AI-narrated) | 30–50 min |
| Step 6 + 7 decision-log + close | 25–35 min |
| **Total** | **~2.5–4 hours** |

Natural pause points: after Step 1 (diagnosis — this alone may resolve the whole question), after Step 2 (scope), after Step 5 (verified).

## Locked context — do NOT re-derive
- Production is green; all four R20a flags UNSET; this session does not touch them or `/api/reason` behaviour.
- "No current users" holds — Critical Change Protocol step 3 answers "N/A (founder + test logins only)."
- The deletion gap is **diagnostic-uncertain** until Step 1 completes; the export gap is **confirmed**.
- Assessment of cascade behaviour is read-only and Standard; only edits to `/api/user/delete` are Critical.

## Rollback path
Any code change is additive (extra array entries / an extra export table). Rollback = `git revert <sha> && git push` + Vercel redeploy. The diagnosis (Step 1) and the live test (Step 5) change nothing in production. No production change exists to roll back until a code change is deployed.

## Forecast
The session ends with a confirmed map of how every personal-data table is erased (cascade vs explicit), the delete endpoint either proven-already-complete or extended to cover any orphaned tables, the export endpoint extended for Art 15/20 parity, and a **live test on a throwaway account showing zero intimate rows remain after deletion** — closing launch criterion #7's erasure/access leg and de-risking the lawyer review. Next gap from the inventory ranking: #2/#3 (finish Option A — R20a agent-path live proof).

End of prompt. Opens on `main`. **Critical-risk session — diagnosis first; any deletion-route change follows the full Critical Change Protocol; verification is a live test on a throwaway account, walked through with the founder.**
