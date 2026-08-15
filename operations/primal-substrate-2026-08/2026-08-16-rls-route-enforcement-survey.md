# RLS-vs-route-enforcement gap — the app-wide survey (Phase 1)

**Date:** 2026-08-16. **Session:** concurrent-arc C4, Step 2 Phase 1 (`code-standard`, read-only).
**Governing procedure:** `operations/handoffs/founder/2026-08-12-rls-vs-route-enforcement-gap-NEXT-SESSION-PROMPT.md`.
**Origin:** `D-S7-IMPULSE-PR19-INDEPENDENT-REVIEW-CLEAN` (the PR19 medium finding — bypass confirmed
reachable) + `D-S7-IMPULSE-MENTOR-CLEARANCE-AND-FOLLOW-THROUGH` (the mentor's disposition: no
local-only patch; `impulse_entries` first).

## What this survey is

Every table whose RLS policies let an authenticated practitioner (public anon key + their own
session JWT, via direct PostgREST) bypass the Next.js route layer — and with it every server-side
check the route performs (field validation, rate limiting, gate classification, and for
`/impulse` the R20a distress check). One verdict per table:
`safe-to-fix-same-pattern` / `needs-route-change-first` / `needs-further-investigation`.

**Method.** (1) Re-derived the affected-file list from scratch: `grep -c "CREATE POLICY"` across
every `website/*.sql`, `website/supabase/migrations/*.sql`, `website/api/*.sql` — **22 files
carry policies** (the authoring prompt's list had 14; this survey supersedes it). Every
`CREATE POLICY` block was extracted and read verbatim. (2) Every consuming code site located by
`grep -rn "from('<table>')"` across `src/` (tests excluded). (3) Every consuming file classified
by client construction: `SUPABASE_SERVICE_ROLE_KEY` (service-role, bypasses RLS) vs
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (user-scoped, **relies** on RLS) vs `supabase-server` import
(= `supabaseAdmin`, service-role — verified by reading the module). (4) Client-side/browser usage
found by grepping `.from(` outside `src/app/api` and by locating every browser-client
construction (`src/lib/supabase.ts` is the sole browser client; `src/proxy.ts` is auth
middleware, no table access).

**Honest limits.** This is a **repo-derived** survey: migration files + code, plus read-only
production row counts where noted. Live database policy state was NOT enumerated per table
(`pg_policies` is not reachable through PostgREST; it needs the SQL editor) — and at least one
table (`journal_entries`) provably has live state the repo does not describe at all. Every
verdict below therefore carries an implicit rider: **re-confirm the live policy state (§PRE) at
fix time; the verdict orders the backlog, it does not replace the per-table pre-flight.**
Phase 2 of this session does exactly that for `impulse_entries`, with live behavioural proof.

**Why service-role routes make the fix safe.** In Supabase the `service_role` key bypasses RLS
entirely (`BYPASSRLS`); the "Service role full access" policies on these tables are
belt-and-braces, not load-bearing. Dropping the four owner policies from a table whose only
consumers are service-role routes changes nothing for the app's own legitimate path — it only
closes the direct-PostgREST door. That is the already-proven target shape: RLS on, no policy for
`anon`/`authenticated`, grants revoked (live precedent: `route_errors`, `throttle_events`,
`collaboration_records`, `agent_trust_events`/`_state`, `stoa_entries`, `idea_loop_*`,
`agent_hold_observations`, `cost_health_snapshots` — all verified carrying REVOKE-first blocks).

**A second defect class this survey found, worse than the one it went looking for (Class C
below):** several policies carry **no role restriction at all** — `WITH CHECK (true)` /
`USING (true)` with no `TO` clause — on tables whose migrations never REVOKE Supabase's default
grants (`anon` + `authenticated` get broad table privileges by default; the correct-pattern
tables all REVOKE them explicitly, these do not). Where the owner-policy class needs an
authenticated session and scopes damage to the caller's own rows, this class is open to **any
holder of the public anon key, for any row, no login required** (subject to live-grant
confirmation). The policy NAMES say "Service role …" — the intent was service-role-only; the
`TO service_role` clause is simply missing. These are listed with their own verdicts and flagged
for early scheduling.

---

## Class A — the surveyed gap class, fixable by the same pattern

Per-verb owner policies (`auth.uid() = user_id`), all consuming routes service-role, **zero**
client-side usage found. Verdict for all twelve: **`safe-to-fix-same-pattern`**
(drop the owner policies; keep RLS on; keep/tighten the service-role policy; REVOKE grants to
match the target shape; `§INVERSE` recreates the dropped policies verbatim).

| # | Table | Migration file | Owner policies | Route(s) — all service-role | Notes |
|---|---|---|---|---|---|
| 1 | ~~`impulse_entries`~~ **FIXED** | `supabase-impulse-migration.sql` | ~~SELECT/INSERT/UPDATE/DELETE~~ **dropped** | `api/mentor/impulse` | **CLOSED 2026-08-16** — locked down on TEST + production, bypass proven closed live both directions, legitimate path confirmed unbroken, PR19 clean, AC7 discharged (`D-CONCURRENT-ARC-C4-IMPULSE-RLS-FIX-LIVE-2026-08-16`; migration `website/supabase-impulse-rls-lockdown-migration.sql`). The mentor-mandated first fix. 1 real production row, untouched throughout. |
| 2 | `sage_compass_entries` | `supabase-sage-compass-migration.sql` | S/I/U/D | `api/mentor/sage-compass` | Named in the origin finding as the sibling shape. |
| 3 | `morning_preparation_entries` | `supabase-morning-preparation-migration.sql` | S/I/U/D | `api/mentor/morning` | |
| 4 | `view_from_above_entries` | `supabase-view-from-above-migration.sql` | S/I/U/D | `api/mentor/view-from-above` | Grief/catastrophising content — intimate. |
| 5 | `reserve_clause_entries` | `supabase-reserve-clause-migration.sql` | S/I/U/D | `api/mentor/hupexairesis` | |
| 6 | `circle_extension_entries` | `supabase-circle-extension-migration.sql` | S/I/U/D | `api/mentor/oikeiosis/extension` | |
| 7 | `oikeiosis_reflections` | `supabase-mentor-gaps-migration.sql` | S/I/U/D | `api/mentor/oikeiosis` | |
| 8 | `premeditatio_entries` | `supabase-mentor-gaps-migration.sql` | S/I/U/D | `api/mentor/premeditatio` | |
| 9 | `passion_events` | `supabase-mentor-gaps-migration.sql` | S/I/U/D | `api/mentor/passion-log`, `api/mentor/passion-classify` | Passion sub-species content — intimate. |
| 10 | `realtime_journal_entries` | `supabase-mentor-gaps-migration.sql` | S/I/U/D | `api/mentor/journal-feed`, `api/user/export`, `lib/user-data-gathering` | R17b-encrypted prose columns; a direct INSERT would also bypass encryption-at-write — plaintext rows. |
| 11 | `mentor_baseline_appendix` | `supabase-mentor-appendix-migration.sql` | SELECT/INSERT/DELETE (no UPDATE) | `lib/mentor-appendix-store`, `api/user/export` | Partial verb set; same fix shape. |
| 12 | `mentor_profiles` | `supabase-mentor-profiles-migration.sql` | SELECT/UPDATE/INSERT (no DELETE) | `api/founder/hub`, `api/mentor/private/*`, `api/mentor/founder/history`, `api/user/export` | The mentor profile — among the most intimate tables in the app. Recommended **second**, after `impulse_entries`. |

Also in this class, lower stakes:

| # | Table | Migration file | Owner policies | Route(s) | Notes |
|---|---|---|---|---|---|
| 13 | `document_evaluations_v3` | `supabase-v3-baseline-progress-migration.sql` | SELECT/INSERT | `api/score-document`, `api/badge/[id]` (both service-role) | Direct INSERT could forge a scored document behind a public badge — the badge endpoint serves derived data publicly by design. `safe-to-fix-same-pattern`. |
| 14 | `deliberation_chains_v3` | `supabase-v3-migration.sql` | SELECT/INSERT | `api/score-iterate`, `api/deliberation-chain/[id]` (service-role) | `safe-to-fix-same-pattern`. |
| 15 | `deliberation_steps_v3` | `supabase-v3-migration.sql` | SELECT/INSERT (via chain-ownership subquery) | same | `safe-to-fix-same-pattern`. |
| 16 | `baseline_assessments_v3` | `supabase-v3-baseline-progress-migration.sql` | SELECT only | `api/baseline`, `api/milestones` (service-role) | Read-exposure only (no owner write policies — direct writes already denied). `safe-to-fix-same-pattern`, lowest urgency. |
| 17 | `progress_snapshots_v3` | `supabase-v3-baseline-progress-migration.sql` | SELECT only | **none — zero code references** | Dead table. Safe to lock down; candidate for a separate disposal decision. |
| 18 | `baseline_assessments` (V1) | `supabase-baseline-migration.sql` | SELECT only | **none — zero code references** | Dead table (superseded by v3). Same as above. |

## Class B — user-scoped dependencies: `needs-route-change-first`

These tables have **legitimate consumers that rely on the owner policies** — dropping them
breaks a real, working feature. The remediation here is real additional work: move the consumer
onto a server route using the service-role client with a server-verified user id, THEN apply the
same lockdown. Do not batch these with Class A.

| # | Table | Who relies on the owner policies | Verdict |
|---|---|---|---|
| 19 | `action_evaluations_v3` | Browser INSERT at `src/app/score/page.tsx:190`; browser SELECT at `src/app/dashboard/page.tsx:143`; user-JWT server route `api/practice-calendar` (anon client + forwarded `Authorization`) SELECT. Service-role consumers too (`api/milestones`). | **`needs-route-change-first`** — the score page's direct insert is a live write feature. |
| 20 | `journal_entries` | Browser SELECT ×3 in `src/app/journal/page.tsx` (progress load, returning-user count, past-entry read); user-JWT route `api/practice-calendar` SELECT. Writes go through `/api/journal` (service-role). | **`needs-route-change-first` + `needs-further-investigation`** — see the standalone note below. |
| 21 | `reflections` | User-JWT route `api/practice-calendar` SELECT relies on the owner SELECT policy. Writes are all service-role (`api/reflect`, `api/reflections`, `api/mentor/private/reflect`). | **Split verdict:** the owner SELECT policy is load-bearing (route change first); the open INSERT policy (Class C row 25) is separately and immediately fixable. |
| 22 | `profiles` (location fields) | `api/update-location` is a user-JWT route (anon client) whose UPDATE relies on the owner UPDATE policy (`supabase-community-map-degrade-migration.sql` / `supabase-location-migration.sql`); browser SELECT of own profile at `src/app/community/page.tsx:91`. | **Intentional feature, scoped to own row** — not part of the gap class. Any future lockdown is a deliberate re-architecture, not this program. Recorded so no session "fixes" it by pattern-matching. |

**The `journal_entries` standalone note.** The 55-day journal table has **no migration file in
this repository at all** — it predates the migration discipline (every repo grep for its DDL
matches only `realtime_journal_entries` as a substring). Its live RLS/policy/grant state is
therefore unknowable from the repo and must be read in the SQL editor before ANY change. The
browser reads it directly today (which works — so live state permits it); whether its write
path is currently open via PostgREST is **unverified either way**. This is the one table where
the survey cannot even state which class it belongs to from the repo.

## Class C — role-unrestricted policies (the worse class, found in passing)

Policies with no role restriction on tables that never REVOKE default grants. Damage is NOT
scoped to the caller's own rows, and (subject to live-grant confirmation, below) does not
require a login at all — the public anon key suffices. The policy names all say "Service
role …"; the `TO service_role` clause is missing. **None of these is fixed in this session**
(the C4 scope boundary binds), but rows 23–24 should be treated as candidates for the earliest
following session.

| # | Table | Policy as written | Exposure if grants are live | Legitimate consumers | Verdict |
|---|---|---|---|---|---|
| 23 | `founder_conversations` | `"Service role full access on conversations" FOR ALL USING (true) WITH CHECK (true)` | Read/write/delete of the founder's private hub conversations by any anon-key holder. **70 real rows on production at survey time.** | `api/founder/hub` only (service-role) | **`safe-to-fix-same-pattern`** mechanically (no user-scoped consumer) — but behaviourally verify the exposure on TEST first, and treat as **urgent**, not as one of several equal items. |
| 24 | `founder_conversation_messages` | same shape | Same — **2,131 real rows on production.** | same | same |
| 25 | `reflections` (INSERT policy) | `"Service role insert for reflections" FOR INSERT WITH CHECK (true)` | Any anon-key holder can insert reflection rows **for any user_id** (forged practice history; feeds milestones/practice-calendar reads). | Writes are all service-role; the open policy serves nobody | **`safe-to-fix-same-pattern`** for this single policy (drop it; service-role writes bypass RLS regardless). The table's SELECT policy stays (Class B row 21). |
| 26 | `milestones` (INSERT policy) | `"Service role insert for milestones" FOR INSERT WITH CHECK (true)` | Any anon-key holder can award any milestone to any user. | Writes via `api/milestones` (service-role); owner SELECT is load-bearing for nothing user-scoped found (reads go through the route) | **`safe-to-fix-same-pattern`** for the INSERT policy; the owner SELECT policy can ride the same migration or stay — election at fix time. |
| 27 | `document_scores` (INSERT policy) | `"Service role insert for document scores" FOR INSERT WITH CHECK (true)` (public SELECT is deliberate — the badge surface) | Forged public document scores behind `/api/badge/[id]`. | Writes via `api/score-document/[id]` (service-role) | **`safe-to-fix-same-pattern`** for the INSERT policy; keep the public SELECT. |
| 28 | `environmental_context` | public SELECT `USING (true)`; writes service-role-only | Public read of the weekly environmental scan — low sensitivity, possibly intentional. | service routes | **`needs-further-investigation`** (intent question, not a mechanics question). |

**The live-grants caveat, stated once for the whole class:** whether `anon` actually holds
INSERT/SELECT privileges on these tables depends on Supabase's default grants being intact
(no repo migration revokes them for these tables, and the correct-pattern tables' migrations
revoke them explicitly — strong evidence the defaults stand). The decisive check is one
behavioural probe per table on TEST (anon-key request, no login), which the earliest follow-up
session should run as its own §PRE. This survey deliberately did not probe production.

## Already correct — not part of the gap (do not touch)

`route_errors`, `throttle_events`, `collaboration_records`, `agent_trust_events`,
`agent_trust_state`, `agent_hold_observations`, `stoa_entries`, `idea_loop_cycles`,
`idea_loop_candidates`, `cost_health_snapshots`, `project_context`, `evaluated_actions`,
`grade_history`, `substrate_audit_narratives` — RLS on, service-role-only, REVOKE-first where
applicable (each verified in its own migration this session). `community_map_pins` is
grants-managed (SELECT-only to anon/authenticated) by design. `agent_accreditation` has a
deliberate public SELECT (the public accreditation read surface). These are the target shape.

## The recommended backlog order (the founder elects; the mentor ruled only item 1)

1. ~~**`impulse_entries`**~~ — **DONE 2026-08-16**, live on production (mentor-ruled first). Everything below is the open backlog.
2. **`founder_conversations` + `founder_conversation_messages`** (Class C rows 23–24) — the
   widest exposure found; mechanically simple; 2,201 real rows.
3. **The three open-INSERT policies** (rows 25–27) — one small migration could close all three;
   forgery-class rather than disclosure-class.
4. **`mentor_profiles` + the remaining Class A intimate tables** (rows 2–12) — batched by
   sibling shape, a few per session.
5. **Class A lower-stakes** (rows 13–18).
6. **Class B** (`action_evaluations_v3`, `journal_entries`, `reflections` SELECT) — each needs
   its own route-change design first; `journal_entries` needs a live-state read before even
   that.

*End of survey. Phase 2 of this session fixes `impulse_entries` only.*
