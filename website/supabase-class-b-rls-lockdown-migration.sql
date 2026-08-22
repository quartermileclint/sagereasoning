-- ============================================================================
-- Class B tables — RLS lockdown to service-role-only, NOW SAFE (route-change
-- done). action_evaluations_v3, journal_entries, reflections.
-- ============================================================================
-- Authored 2026-08-23, Class B route-change session (`code-standard` build;
-- the actual §APPLY on either environment is `code-critical`, its own
-- founder-walked session — AUTHORED ONLY here, per the item-4 precedent).
-- Survey: operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md
-- Pattern: website/supabase-practice-family-rls-lockdown-migration.sql (the
--          ten-table walk, 2026-08-22) — identical shape, applied here to the
--          three Class B tables now that their route-change dependency is gone.
--
-- WHY THIS IS SAFE NOW, WHERE IT WAS NOT BEFORE (verified first-hand,
-- 2026-08-23, PR19-reviewed — the review confirmed COMPLETE for all three
-- tables, zero remaining client-side/anon-key consumer, and no view/RPC with
-- a different privilege path):
--   - `action_evaluations_v3`: the browser's direct SELECT (dashboard) moved
--     to GET /api/action-evaluations; the browser's direct INSERT (score page)
--     moved to POST /api/score/save. Both server routes use supabaseAdmin
--     (service-role) with `requireAuth`-verified user_id — never from the
--     request, in either direction.
--   - `journal_entries`: the browser's three direct reads (returning-user
--     count, day-list progress, past-entry text) moved onto the EXISTING
--     GET /api/journal (no new route needed — it already returned everything
--     needed). Writes were already server-side (POST /api/journal) before
--     this session.
--   - `reflections`: its owner SELECT policy was the LAST legitimate
--     dependency (api/practice-calendar's user-JWT client) — see
--     supabase-open-insert-policies-lockdown-migration.sql's own §0 note,
--     which named this table's SELECT policy "GENUINELY LOAD-BEARING" and
--     deliberately did NOT touch it for exactly that reason. This session's
--     practice-calendar switch to supabaseAdmin removes that dependency, so
--     the previously-deferred half of that table's lockdown can now proceed.
--     Its INSERT policy is ALREADY closed (Class C row 25, 2026-08-16) — this
--     migration closes the remaining SELECT half only.
--
-- Every consumer of all three tables re-verified this session to be
-- service-role (`supabaseAdmin` from `@/lib/supabase-server`), zero anon-key/
-- client-side references remaining (re-confirmed by an independent PR19
-- review, not just the builder's own grep).
--
-- HOW TO WALK THIS (identical procedure to the practice-family migration —
-- §PRE/§APPLY/§VERIFY on TEST end-to-end for all three, THEN production;
-- see that migration's own header for the full step-by-step if a refresher
-- is needed):
--   1. §PRE  — policy/RLS state (P1/P2) + behavioural bypass proof (P3) via
--      `scripts/class-b-rls-bypass-proof.ts <table>` (or `--all`).
--   2. §APPLY — run all three sections (independently reorderable).
--   3. §VERIFY — re-run V1-V3, then the harness (V4, expect DENIED), then
--      `--legit <table>` (V5) with a dev server up.
--   4. Repeat on production; skip the harness's write-proof (P3/V4) there
--      per its own safety rail — read-only confirmation only.
--   5. PR19 review including a live behavioural check on production.
--
-- ============================================================================
-- §1 — action_evaluations_v3
-- ============================================================================
-- §PRE-P1 (expect 2 rows: 2 owner, NO service-role policy exists yet for
-- this table — the same asymmetry mentor_baseline_appendix had at item 4):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'action_evaluations_v3' ORDER BY policyname;
-- §PRE-P2 (expect rowsecurity = true):
--   SELECT relrowsecurity FROM pg_class WHERE oid = 'public.action_evaluations_v3'::regclass;
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts action_evaluations_v3

DROP POLICY IF EXISTS "Users can view own v3 evaluations"   ON public.action_evaluations_v3;
DROP POLICY IF EXISTS "Users can insert own v3 evaluations" ON public.action_evaluations_v3;
REVOKE ALL ON public.action_evaluations_v3 FROM anon;
REVOKE ALL ON public.action_evaluations_v3 FROM authenticated;
REVOKE ALL ON public.action_evaluations_v3 FROM PUBLIC;
GRANT  ALL ON public.action_evaluations_v3 TO   service_role;
-- The one NEW policy in this section — no service-role policy existed before.
DROP POLICY IF EXISTS "Service role full access to action evaluations v3" ON public.action_evaluations_v3;
CREATE POLICY "Service role full access to action evaluations v3"
  ON public.action_evaluations_v3 FOR ALL USING (auth.role() = 'service_role');
ALTER TABLE public.action_evaluations_v3 ENABLE ROW LEVEL SECURITY;

-- §VERIFY-V1 for THIS table (expect exactly 1 row — the new service-role policy).

-- §INVERSE:
--   GRANT ALL ON public.action_evaluations_v3 TO anon;
--   GRANT ALL ON public.action_evaluations_v3 TO authenticated;
--   DROP POLICY IF EXISTS "Service role full access to action evaluations v3" ON public.action_evaluations_v3;
--   CREATE POLICY "Users can view own v3 evaluations"
--     ON public.action_evaluations_v3 FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own v3 evaluations"
--     ON public.action_evaluations_v3 FOR INSERT WITH CHECK (auth.uid() = user_id);
--   -- (this restores the exact pre-migration 2-policy, no-service-role-policy state)

-- ============================================================================
-- §2 — journal_entries
-- ============================================================================
-- §PRE-P1 (expect 3 rows: 1 service-role ALL [already exists] + 2 owner
-- [SELECT, INSERT — no UPDATE/DELETE policy exists on this table at all]):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'journal_entries' ORDER BY policyname;
-- §PRE-P2: tablename = 'journal_entries'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts journal_entries

DROP POLICY IF EXISTS "Users can read own journal entries"   ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
REVOKE ALL ON public.journal_entries FROM anon;
REVOKE ALL ON public.journal_entries FROM authenticated;
REVOKE ALL ON public.journal_entries FROM PUBLIC;
GRANT  ALL ON public.journal_entries TO   service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- §VERIFY-V1 for THIS table (expect exactly 1 row — "Service role full access
-- to journal entries", which already existed and is untouched by this section).

-- §INVERSE:
--   GRANT ALL ON public.journal_entries TO anon;
--   GRANT ALL ON public.journal_entries TO authenticated;
--   CREATE POLICY "Users can read own journal entries"
--     ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own journal entries"
--     ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   -- (the pre-existing service-role policy is untouched either way)

-- ============================================================================
-- §3 — reflections (the SELECT half only — INSERT already closed 2026-08-16)
-- ============================================================================
-- §PRE-P1 (expect exactly 1 row going in: "Users can read own reflections"
-- [SELECT] only. Confirmed by re-reading supabase-open-insert-policies-lockdown-
-- migration.sql's own §1/§INVERSE — the row-25 fix DROPPED the old
-- "Service role insert for reflections" policy and relied on service_role's
-- BYPASSRLS rather than creating a new one, so no service-role policy exists
-- on this table today):
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'reflections' ORDER BY policyname;
-- §PRE-P2: tablename = 'reflections'.
-- §PRE-P3: npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts reflections
--   (this table's bypass proof is READ-only — a SELECT-bypass check, not an
--   INSERT-bypass one, since INSERT is already closed; see the harness script
--   for why this table's config differs in shape from the other two)

DROP POLICY IF EXISTS "Users can read own reflections" ON public.reflections;
-- SELECT was deliberately NOT revoked by the row-25 fix (it was still
-- load-bearing then). Revoking it now completes that migration's own
-- deferred half.
REVOKE SELECT ON public.reflections FROM anon;
REVOKE SELECT ON public.reflections FROM authenticated;
REVOKE SELECT ON public.reflections FROM PUBLIC;
-- GRANT ALL to service_role is idempotent — already granted by the row-25 fix;
-- re-asserted here for this migration's own completeness, not because it is
-- missing.
GRANT ALL ON public.reflections TO service_role;
-- The one NEW policy in this section — no service-role policy existed
-- before (the row-25 fix relied on BYPASSRLS rather than creating one).
-- Added here for the same reason every other locked-down table in this
-- codebase carries one: it documents intent even though BYPASSRLS makes it
-- non-load-bearing (the mentor_baseline_appendix precedent, item 4).
DROP POLICY IF EXISTS "Service role full access to reflections" ON public.reflections;
CREATE POLICY "Service role full access to reflections"
  ON public.reflections FOR ALL USING (auth.role() = 'service_role');
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- §VERIFY-V1 for THIS table (expect exactly 1 row — the new service-role policy).

-- §INVERSE:
--   GRANT SELECT ON public.reflections TO anon;
--   GRANT SELECT ON public.reflections TO authenticated;
--   DROP POLICY IF EXISTS "Service role full access to reflections" ON public.reflections;
--   CREATE POLICY "Users can read own reflections"
--     ON public.reflections FOR SELECT USING (auth.uid() = user_id);
--   -- (this restores ONLY the SELECT half this migration closes — it does
--   -- NOT restore the INSERT policy the row-25 fix already closed; that
--   -- fix's own §INVERSE is the correct rollback for that half)

-- ============================================================================
-- §VERIFY — shared template, run per table after §APPLY (identical to the
-- practice-family migration's own §VERIFY — substitute <table> for each of
-- the three)
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
-- V4. BEHAVIOURAL PROOF — bypass closed (TEST). Re-run the harness for
--     <table>; the direct anon-key attempt must now FAIL (RLS / 42501 / empty
--     result).
-- V5. BEHAVIOURAL PROOF — legitimate path unbroken (TEST). Re-run the harness
--     with `--legit <table>` against a running dev server; every route this
--     session's build touches (GET /api/action-evaluations,
--     POST /api/score/save, GET/POST /api/journal, GET /api/practice-calendar)
--     must still succeed unchanged.
