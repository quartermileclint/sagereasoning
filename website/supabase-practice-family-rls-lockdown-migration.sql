-- ============================================================================
-- Practice-family tables — RLS lockdown to service-role-only (the target
-- shape). Rows 2–11 of the survey's Class A backlog, batched.
-- ============================================================================
-- Mechanical item 4, 2026-08-22 session (`code-critical`, AC7 + PR19).
-- Survey:  operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md
-- Pattern: website/supabase-impulse-rls-lockdown-migration.sql (row 1, DONE
--          2026-08-16 — the mentor-ruled first fix; this migration applies the
--          IDENTICAL shape to the next ten rows in the survey's own
--          recommended backlog order).
--
-- TEN TABLES, ONE MIGRATION. Every table below shares the exact defect
-- impulse_entries had: per-verb owner policies (auth.uid() = user_id) that let
-- an AUTHENTICATED practitioner read/write the table directly via PostgREST,
-- bypassing its route entirely — field validation, rate limiting, and (for the
-- practice-family tables specifically) the R20a distress check wired at
-- mechanical item 1 / the 2026-08-17/18 gap-closure sessions, since the
-- perimeter check runs INSIDE the route, never at the database layer.
--
-- WHY IT IS SAFE, for every table below (verified first-hand this session):
--   - every consumer is `SUPABASE_SERVICE_ROLE_KEY` (createClient(url,
--     serviceKey)) or the shared `supabaseAdmin` from `@/lib/supabase-server`
--     (itself service-role — verified by reading the module), 0 anon-key
--     consumers, 0 client-side/browser references (grep of src/app, src/
--     components: zero hits for every table)
--   - service_role has BYPASSRLS, so RLS policies never gate the app's own
--     path (core Postgres semantics; the impulse migration's own reasoning)
--   - a `SECURITY DEFINER` cross-check (`grep -rn "SECURITY DEFINER"
--     supabase/migrations operations/migrations website/*.sql`, this session
--     — CORRECTED post-PR19: the grep returns FOUR function definitions, not
--     one, as an earlier draft of this header wrongly stated. All four
--     verified by reading their bodies: `increment_structured_observation_
--     count(p_profile_id)` writes `mentor_profiles`;
--     `revoke_atl_credentials_on_profile_delete` (declared twice, across the
--     a10 and phase3 api-keys migrations) writes `api_keys`;
--     `update_deliberation_chain_v3`'s trigger function writes
--     `deliberation_chains_v3`. NONE of the four writes any of the ten tables
--     this migration closes — the substantive conclusion holds, only the
--     earlier "exactly one hit" count was wrong. Re-derive this count from
--     the grep, not from this comment, per the standing "primary data beats
--     secondary characterisation" discipline.
--
-- THE OPERATIVE CONTROL is RLS-enabled + no anon/authenticated policy (the
-- impulse migration's own wording, repeated because it is the mechanism, not
-- a convenience note): "RLS on with no policy → PostgREST anon/authenticated
-- cannot read or write" on every verb, SELECT included. §2's REVOKE per table
-- is belt-and-braces on top of that, matching every sibling shape; it is not
-- what does the closing.
--
-- ⚠ A DISCLOSED, PRE-EXISTING GAP THIS MIGRATION DOES NOT CLOSE (PR19 finding,
-- 2026-08-22, downgraded LOW — pre-existing, not introduced here; aggregate-
-- only, not raw content): four of these ten tables (oikeiosis_reflections,
-- premeditatio_entries, passion_events, realtime_journal_entries) have
-- per-user AGGREGATE VIEWS built on them in
-- website/supabase-mentor-gaps-migration.sql (oikeiosis_stage_progression,
-- premeditatio_engagement, passion_weekly_catch_rate,
-- passion_classification_accuracy, passion_intensity_trends,
-- realtime_journal_lag_stats) and supabase/migrations/
-- 20260413_logging_refactor_gap4.sql (gap4_month3_review,
-- gap4_month6_review — over passion_events). None is declared
-- `WITH (security_invoker = true)`, and this migration REVOKEs grants on the
-- ten TABLES only, never on these VIEWS. A non-invoker Postgres view runs
-- with its OWNER's privileges, so a table-level REVOKE does not gate a
-- SELECT against the view — the same class this codebase has already found
-- and fixed twice (`founder_conversations`/`mentor_profiles`, see memory
-- "Supabase view default grants + auto-updatable"). If Supabase's default
-- public-schema grants are intact for these eight views (unverified by SQL
-- this session — the decisive check is a live anon-key GET against each
-- view, mirroring the table-level probes elsewhere in this file), an
-- unauthenticated anon-key holder can still read per-user counts, catch
-- rates, and averages (keyed by user_id) for these four tables AFTER this
-- migration runs. This is NOT closed here — closing it is its own
-- Critical/AC7 decision (REVOKE the eight views, or rebuild them
-- `security_invoker`, or confirm they are dead and drop them) and needs its
-- own founder-walked session. Named so it is not silently dropped from the
-- backlog: add to the RLS survey's open list before calling Class A "done".
--
-- ONE DELIBERATE ASYMMETRY, named so it is not read as an oversight:
-- `mentor_baseline_appendix` (§7 below) has NO service-role policy in its
-- original migration at all — only three owner policies (SELECT/INSERT/
-- DELETE, no UPDATE) and a comment noting service_role bypasses RLS
-- unconditionally regardless. This migration adds an explicit service-role
-- policy to that table anyway (matching the other nine, and every table this
-- codebase has already locked down), for symmetry and because an explicit
-- policy documents intent even though BYPASSRLS makes it non-load-bearing.
--
-- This migration alters ONLY the ten tables named in its ten sections. It
-- touches no other table, no schema, no flag, no code. RLS stays ENABLED
-- throughout on every table (never toggled off).
--
-- ============================================================================
-- HOW TO WALK THIS (mirrors the impulse precedent exactly; run per §PRE/
-- §APPLY/§VERIFY on TEST end-to-end for ALL TEN before touching production,
-- then repeat the whole sequence on production):
-- ============================================================================
--   1. §PRE  — confirm current policy state (P1–P2) for each table.
--   2. §PRE  — behavioural bypass proof (P3), TEST ONLY, via the generalised
--      harness: `scripts/practice-family-rls-bypass-proof.ts <table>` (see its
--      header — one script, ten table configs, mirrors
--      impulse-rls-bypass-proof.ts's sign-in/insert/select/cleanup shape).
--      Run it for EVERY table before applying ANY §APPLY block — the "before"
--      state must be captured for all ten, not table-by-table interleaved
--      with fixes, so the §PRE/§VERIFY diff is unambiguous per table.
--   3. §APPLY — run all ten sections (or a sub-batch; each section is
--      independent and safely reorderable).
--   4. §VERIFY — re-run V1–V3 (policy/RLS/grant state) for every table, then
--      re-run the harness (V4) for every table — expect DENIED now — then run
--      `--legit <table>` for every table with a dev server up (V5).
--   5. Only after ALL TEN show clean TEST verification, repeat on production
--      (skip the harness's write-proof P3/V4 write step on production per its
--      own safety rail — read-only confirmation only, as the founder-
--      conversations precedent did).

-- ============================================================================
-- §1 — sage_compass_entries
-- ============================================================================
-- §PRE-P1 (expect 5 rows: 4 owner + 1 service-role):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'sage_compass_entries' ORDER BY policyname;
-- §PRE-P2 (expect rowsecurity = true):
--   SELECT relrowsecurity FROM pg_class WHERE oid = 'public.sage_compass_entries'::regclass;
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts sage_compass_entries

DROP POLICY IF EXISTS "Users can view own sage compass entries"   ON public.sage_compass_entries;
DROP POLICY IF EXISTS "Users can insert own sage compass entries" ON public.sage_compass_entries;
DROP POLICY IF EXISTS "Users can update own sage compass entries" ON public.sage_compass_entries;
DROP POLICY IF EXISTS "Users can delete own sage compass entries" ON public.sage_compass_entries;
REVOKE ALL ON public.sage_compass_entries FROM anon;
REVOKE ALL ON public.sage_compass_entries FROM authenticated;
REVOKE ALL ON public.sage_compass_entries FROM PUBLIC;
GRANT  ALL ON public.sage_compass_entries TO   service_role;
ALTER TABLE public.sage_compass_entries ENABLE ROW LEVEL SECURITY;

-- §VERIFY-V1 (expect exactly 1 row, "Service role full access to sage compass"):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'sage_compass_entries' ORDER BY policyname;
-- §VERIFY-V2/V3/V4/V5: as in §PRE, expecting the closed/unbroken outcomes (see the
-- shared §VERIFY template at the impulse migration's own header for the exact wording).

-- §INVERSE:
--   GRANT ALL ON public.sage_compass_entries TO anon;
--   GRANT ALL ON public.sage_compass_entries TO authenticated;
--   CREATE POLICY "Users can view own sage compass entries"
--     ON public.sage_compass_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own sage compass entries"
--     ON public.sage_compass_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own sage compass entries"
--     ON public.sage_compass_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own sage compass entries"
--     ON public.sage_compass_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §2 — morning_preparation_entries
-- ============================================================================
-- §PRE-P1/P2: same shape as §1, tablename = 'morning_preparation_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts morning_preparation_entries

DROP POLICY IF EXISTS "Users can view own morning preparation entries"   ON public.morning_preparation_entries;
DROP POLICY IF EXISTS "Users can insert own morning preparation entries" ON public.morning_preparation_entries;
DROP POLICY IF EXISTS "Users can update own morning preparation entries" ON public.morning_preparation_entries;
DROP POLICY IF EXISTS "Users can delete own morning preparation entries" ON public.morning_preparation_entries;
REVOKE ALL ON public.morning_preparation_entries FROM anon;
REVOKE ALL ON public.morning_preparation_entries FROM authenticated;
REVOKE ALL ON public.morning_preparation_entries FROM PUBLIC;
GRANT  ALL ON public.morning_preparation_entries TO   service_role;
ALTER TABLE public.morning_preparation_entries ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.morning_preparation_entries TO anon;
--   GRANT ALL ON public.morning_preparation_entries TO authenticated;
--   CREATE POLICY "Users can view own morning preparation entries"
--     ON public.morning_preparation_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own morning preparation entries"
--     ON public.morning_preparation_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own morning preparation entries"
--     ON public.morning_preparation_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own morning preparation entries"
--     ON public.morning_preparation_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §3 — view_from_above_entries
-- ============================================================================
-- §PRE-P1/P2: same shape, tablename = 'view_from_above_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts view_from_above_entries
-- NOTE — grief/catastrophising content. The survey named this row "intimate";
-- no different handling is required (RLS closure is identical), but it is the
-- table where a bypass matters most, so verify it FIRST if batching.

DROP POLICY IF EXISTS "Users can view own view from above entries"   ON public.view_from_above_entries;
DROP POLICY IF EXISTS "Users can insert own view from above entries" ON public.view_from_above_entries;
DROP POLICY IF EXISTS "Users can update own view from above entries" ON public.view_from_above_entries;
DROP POLICY IF EXISTS "Users can delete own view from above entries" ON public.view_from_above_entries;
REVOKE ALL ON public.view_from_above_entries FROM anon;
REVOKE ALL ON public.view_from_above_entries FROM authenticated;
REVOKE ALL ON public.view_from_above_entries FROM PUBLIC;
GRANT  ALL ON public.view_from_above_entries TO   service_role;
ALTER TABLE public.view_from_above_entries ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.view_from_above_entries TO anon;
--   GRANT ALL ON public.view_from_above_entries TO authenticated;
--   CREATE POLICY "Users can view own view from above entries"
--     ON public.view_from_above_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own view from above entries"
--     ON public.view_from_above_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own view from above entries"
--     ON public.view_from_above_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own view from above entries"
--     ON public.view_from_above_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §4 — reserve_clause_entries
-- ============================================================================
-- §PRE-P1/P2: same shape, tablename = 'reserve_clause_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts reserve_clause_entries

DROP POLICY IF EXISTS "Users can view own reserve clause entries"   ON public.reserve_clause_entries;
DROP POLICY IF EXISTS "Users can insert own reserve clause entries" ON public.reserve_clause_entries;
DROP POLICY IF EXISTS "Users can update own reserve clause entries" ON public.reserve_clause_entries;
DROP POLICY IF EXISTS "Users can delete own reserve clause entries" ON public.reserve_clause_entries;
REVOKE ALL ON public.reserve_clause_entries FROM anon;
REVOKE ALL ON public.reserve_clause_entries FROM authenticated;
REVOKE ALL ON public.reserve_clause_entries FROM PUBLIC;
GRANT  ALL ON public.reserve_clause_entries TO   service_role;
ALTER TABLE public.reserve_clause_entries ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.reserve_clause_entries TO anon;
--   GRANT ALL ON public.reserve_clause_entries TO authenticated;
--   CREATE POLICY "Users can view own reserve clause entries"
--     ON public.reserve_clause_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own reserve clause entries"
--     ON public.reserve_clause_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own reserve clause entries"
--     ON public.reserve_clause_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own reserve clause entries"
--     ON public.reserve_clause_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §5 — circle_extension_entries
-- ============================================================================
-- §PRE-P1/P2: same shape, tablename = 'circle_extension_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts circle_extension_entries

DROP POLICY IF EXISTS "Users can view own circle extension entries"   ON public.circle_extension_entries;
DROP POLICY IF EXISTS "Users can insert own circle extension entries" ON public.circle_extension_entries;
DROP POLICY IF EXISTS "Users can update own circle extension entries" ON public.circle_extension_entries;
DROP POLICY IF EXISTS "Users can delete own circle extension entries" ON public.circle_extension_entries;
REVOKE ALL ON public.circle_extension_entries FROM anon;
REVOKE ALL ON public.circle_extension_entries FROM authenticated;
REVOKE ALL ON public.circle_extension_entries FROM PUBLIC;
GRANT  ALL ON public.circle_extension_entries TO   service_role;
ALTER TABLE public.circle_extension_entries ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.circle_extension_entries TO anon;
--   GRANT ALL ON public.circle_extension_entries TO authenticated;
--   CREATE POLICY "Users can view own circle extension entries"
--     ON public.circle_extension_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own circle extension entries"
--     ON public.circle_extension_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own circle extension entries"
--     ON public.circle_extension_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own circle extension entries"
--     ON public.circle_extension_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §6 — oikeiosis_reflections
-- ============================================================================
-- NOTE: this table (and §8, §9, §10 below) is unqualified in its own migration
-- (`ON oikeiosis_reflections`, not `public.oikeiosis_reflections`) — it lives in
-- the `public` schema (the default search_path), so `public.oikeiosis_reflections`
-- below refers to the SAME table; the qualification is added here for
-- consistency with the other six sections and is not a new table.
-- §PRE-P1/P2: tablename = 'oikeiosis_reflections'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts oikeiosis_reflections

DROP POLICY IF EXISTS "Users can view own oikeiosis reflections"   ON public.oikeiosis_reflections;
DROP POLICY IF EXISTS "Users can insert own oikeiosis reflections" ON public.oikeiosis_reflections;
DROP POLICY IF EXISTS "Users can update own oikeiosis reflections" ON public.oikeiosis_reflections;
DROP POLICY IF EXISTS "Users can delete own oikeiosis reflections" ON public.oikeiosis_reflections;
REVOKE ALL ON public.oikeiosis_reflections FROM anon;
REVOKE ALL ON public.oikeiosis_reflections FROM authenticated;
REVOKE ALL ON public.oikeiosis_reflections FROM PUBLIC;
GRANT  ALL ON public.oikeiosis_reflections TO   service_role;
ALTER TABLE public.oikeiosis_reflections ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.oikeiosis_reflections TO anon;
--   GRANT ALL ON public.oikeiosis_reflections TO authenticated;
--   CREATE POLICY "Users can view own oikeiosis reflections"
--     ON public.oikeiosis_reflections FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own oikeiosis reflections"
--     ON public.oikeiosis_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own oikeiosis reflections"
--     ON public.oikeiosis_reflections FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own oikeiosis reflections"
--     ON public.oikeiosis_reflections FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §7 — premeditatio_entries
-- ============================================================================
-- §PRE-P1/P2: tablename = 'premeditatio_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts premeditatio_entries

DROP POLICY IF EXISTS "Users can view own premeditatio entries"   ON public.premeditatio_entries;
DROP POLICY IF EXISTS "Users can insert own premeditatio entries" ON public.premeditatio_entries;
DROP POLICY IF EXISTS "Users can update own premeditatio entries" ON public.premeditatio_entries;
DROP POLICY IF EXISTS "Users can delete own premeditatio entries" ON public.premeditatio_entries;
REVOKE ALL ON public.premeditatio_entries FROM anon;
REVOKE ALL ON public.premeditatio_entries FROM authenticated;
REVOKE ALL ON public.premeditatio_entries FROM PUBLIC;
GRANT  ALL ON public.premeditatio_entries TO   service_role;
ALTER TABLE public.premeditatio_entries ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.premeditatio_entries TO anon;
--   GRANT ALL ON public.premeditatio_entries TO authenticated;
--   CREATE POLICY "Users can view own premeditatio entries"
--     ON public.premeditatio_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own premeditatio entries"
--     ON public.premeditatio_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own premeditatio entries"
--     ON public.premeditatio_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own premeditatio entries"
--     ON public.premeditatio_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §8 — passion_events
-- ============================================================================
-- Passion sub-species content — the survey named this row "intimate" alongside
-- view_from_above_entries. No different handling required; verify with the
-- same priority.
-- §PRE-P1/P2: tablename = 'passion_events'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts passion_events

DROP POLICY IF EXISTS "Users can view own passion events"   ON public.passion_events;
DROP POLICY IF EXISTS "Users can insert own passion events" ON public.passion_events;
DROP POLICY IF EXISTS "Users can update own passion events" ON public.passion_events;
DROP POLICY IF EXISTS "Users can delete own passion events" ON public.passion_events;
REVOKE ALL ON public.passion_events FROM anon;
REVOKE ALL ON public.passion_events FROM authenticated;
REVOKE ALL ON public.passion_events FROM PUBLIC;
GRANT  ALL ON public.passion_events TO   service_role;
ALTER TABLE public.passion_events ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.passion_events TO anon;
--   GRANT ALL ON public.passion_events TO authenticated;
--   CREATE POLICY "Users can view own passion events"
--     ON public.passion_events FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own passion events"
--     ON public.passion_events FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own passion events"
--     ON public.passion_events FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own passion events"
--     ON public.passion_events FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §9 — realtime_journal_entries
-- ============================================================================
-- R17b-encrypted prose columns live elsewhere for this table's SIBLING
-- (mentor_baseline_appendix, §7 of the appendix migration); this table itself
-- stores PLAINTEXT impression/assent/action columns. A direct anon-session
-- INSERT bypasses the route's own field validation but writes plaintext to the
-- same plaintext columns the legitimate path uses — no encryption bypass here,
-- unlike the survey's original note (which described the risk profile of the
-- write path generally, not a specific encryption defeat for THIS table).
-- §PRE-P1/P2: tablename = 'realtime_journal_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts realtime_journal_entries

DROP POLICY IF EXISTS "Users can view own realtime journal entries"   ON public.realtime_journal_entries;
DROP POLICY IF EXISTS "Users can insert own realtime journal entries" ON public.realtime_journal_entries;
DROP POLICY IF EXISTS "Users can update own realtime journal entries" ON public.realtime_journal_entries;
DROP POLICY IF EXISTS "Users can delete own realtime journal entries" ON public.realtime_journal_entries;
REVOKE ALL ON public.realtime_journal_entries FROM anon;
REVOKE ALL ON public.realtime_journal_entries FROM authenticated;
REVOKE ALL ON public.realtime_journal_entries FROM PUBLIC;
GRANT  ALL ON public.realtime_journal_entries TO   service_role;
ALTER TABLE public.realtime_journal_entries ENABLE ROW LEVEL SECURITY;

-- §INVERSE:
--   GRANT ALL ON public.realtime_journal_entries TO anon;
--   GRANT ALL ON public.realtime_journal_entries TO authenticated;
--   CREATE POLICY "Users can view own realtime journal entries"
--     ON public.realtime_journal_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own realtime journal entries"
--     ON public.realtime_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own realtime journal entries"
--     ON public.realtime_journal_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own realtime journal entries"
--     ON public.realtime_journal_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- §10 — mentor_baseline_appendix (the deliberate asymmetry — see the header)
-- ============================================================================
-- Only THREE owner policies exist (SELECT/INSERT/DELETE; no UPDATE — the
-- table's own comment: "users can have multiple rounds over time", never
-- revised in place), and NO service-role policy in the original migration —
-- BYPASSRLS makes service_role's access unconditional regardless, so its
-- absence was correct, not a gap. This section adds an explicit service-role
-- policy anyway, for symmetry with every other table in this codebase.
-- §PRE-P1 (expect 3 rows here, not 5 — the asymmetry named above):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'mentor_baseline_appendix' ORDER BY policyname;
-- §PRE-P2: tablename = 'mentor_baseline_appendix'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts mentor_baseline_appendix

DROP POLICY IF EXISTS "Users can read own appendix rounds"   ON public.mentor_baseline_appendix;
DROP POLICY IF EXISTS "Users can insert own appendix rounds" ON public.mentor_baseline_appendix;
DROP POLICY IF EXISTS "Users can delete own appendix rounds" ON public.mentor_baseline_appendix;
REVOKE ALL ON public.mentor_baseline_appendix FROM anon;
REVOKE ALL ON public.mentor_baseline_appendix FROM authenticated;
REVOKE ALL ON public.mentor_baseline_appendix FROM PUBLIC;
GRANT  ALL ON public.mentor_baseline_appendix TO   service_role;
-- The one NEW policy in this migration (every other section only drops +
-- revokes/grants, because a service-role policy already existed). Named to
-- match the sibling convention exactly.
DROP POLICY IF EXISTS "Service role full access to mentor baseline appendix" ON public.mentor_baseline_appendix;
CREATE POLICY "Service role full access to mentor baseline appendix"
  ON public.mentor_baseline_appendix FOR ALL USING (auth.role() = 'service_role');
ALTER TABLE public.mentor_baseline_appendix ENABLE ROW LEVEL SECURITY;

-- §VERIFY-V1 for THIS table (expect exactly 1 row — the new service-role
-- policy — where every other section's V1 also expects exactly 1 row, so the
-- assertion is the same; only the §PRE-P1 baseline count differed).

-- §INVERSE:
--   GRANT ALL ON public.mentor_baseline_appendix TO anon;
--   GRANT ALL ON public.mentor_baseline_appendix TO authenticated;
--   DROP POLICY IF EXISTS "Service role full access to mentor baseline appendix" ON public.mentor_baseline_appendix;
--   CREATE POLICY "Users can read own appendix rounds"
--     ON public.mentor_baseline_appendix FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own appendix rounds"
--     ON public.mentor_baseline_appendix FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own appendix rounds"
--     ON public.mentor_baseline_appendix FOR DELETE USING (auth.uid() = user_id);
--   -- (this restores the exact pre-migration 3-policy, no-service-role-policy state)

-- ============================================================================
-- §VERIFY — shared template, run per table after §APPLY (mirrors the impulse
-- migration's own §VERIFY exactly; substitute <table> for each of the ten)
-- ============================================================================
-- V1. Only the service-role policy remains (expect exactly 1 row):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = '<table>' ORDER BY policyname;
-- V2. RLS still enabled (expect true):
--   SELECT relrowsecurity FROM pg_class WHERE oid = 'public.<table>'::regclass;
-- V3. anon/authenticated hold no table grants (expect ZERO rows):
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND table_name = '<table>'
--     AND grantee IN ('anon', 'authenticated');
-- V4. BEHAVIOURAL PROOF — bypass closed (TEST). Re-run the harness for <table>;
--     the direct anon-key write must now FAIL (RLS / 42501 / empty result).
-- V5. BEHAVIOURAL PROOF — legitimate path unbroken (TEST). Re-run the harness
--     with `--legit <table>` against a running dev server; the route's own
--     POST/GET/PATCH-or-equivalent must still succeed unchanged.
