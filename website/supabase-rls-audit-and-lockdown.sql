-- ============================================================================
-- RLS audit inventory + lockdown of the 3 no-RLS telemetry tables (#9, P-GL)
-- Run in: Supabase Dashboard → SQL Editor (production project)
--
-- FOUNDER-WALKED, code-critical sub-step. Discipline: QUERY prod FIRST (§A/§B),
-- then LOCK (§C), then RE-VERIFY (§D). NEVER a blind REVOKE.
--
-- Context: RLS is broadly + soundly applied (97 policies; every PII/security-
-- critical table protected). A CREATE-TABLE-vs-RLS cross-check surfaced THREE
-- data-bearing tables with no RLS and no REVOKE:
--   • cost_health_snapshots
--   • translation_sandwich_comparisons
--   • translation_sandwich_cost_tracker
-- All three are PII-FREE internal cost/telemetry. The residual concern the
-- audit flagged (unverifiable from the repo) is the DEFAULT PostgREST
-- anon/authenticated grants — §B measures that on prod.
--
-- CODE-SIDE SAFETY (verified 2026-07-20): every read/write of these three
-- tables in the codebase goes through the SERVICE-ROLE client (supabaseAdmin /
-- getAdminClient), which BYPASSES RLS. So enabling RLS + REVOKE closes only the
-- (currently open) anon/authenticated direct access; the app is unaffected.
-- Call sites confirmed: api/billing/usage-summary, api/billing/cost-alerts/
-- evaluate, lib/context/ops-cost-state, lib/translation-sandwich/parallel-run.
-- ============================================================================


-- ============================================================================
-- §A — RLS + POLICY INVENTORY (the audit deliverable — run + save the output)
-- ============================================================================
-- A1. Every base table: does it have RLS enabled? (the positive per-table map)
SELECT n.nspname            AS schema,
       c.relname            AS table,
       c.relrowsecurity     AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname = 'public'
ORDER BY c.relrowsecurity ASC, c.relname;   -- rls_enabled = false floats to top

-- A2. Every policy, per table (which tables have policies, and how many):
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- A3. Tables with RLS DISABLED (the exception list — should be only telemetry):
SELECT c.relname AS table_without_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname = 'public' AND c.relrowsecurity = false
ORDER BY c.relname;


-- ============================================================================
-- §B — PRE-CHECK the 3 tables (current RLS + the anon/authenticated grants)
-- ============================================================================
-- B1. Confirm current RLS state of the 3 (expect rowsecurity = false pre-lock):
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('cost_health_snapshots', 'translation_sandwich_comparisons', 'translation_sandwich_cost_tracker');

-- B2. What can anon / authenticated actually do on them right now? (the residual
--     concern — if these return rows, PostgREST exposes the table to those roles):
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('cost_health_snapshots', 'translation_sandwich_comparisons', 'translation_sandwich_cost_tracker')
  AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY table_name, grantee, privilege_type;


-- ============================================================================
-- §C — LOCKDOWN (idempotent — run ONLY after reviewing §A/§B output)
--      Enable RLS (no policy → service-role-only) + REVOKE the anon/authenticated
--      grants. Safe per the code-side clearance above.
-- ============================================================================
ALTER TABLE public.cost_health_snapshots            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_sandwich_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_sandwich_cost_tracker ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cost_health_snapshots            FROM anon, authenticated;
REVOKE ALL ON public.translation_sandwich_comparisons FROM anon, authenticated;
REVOKE ALL ON public.translation_sandwich_cost_tracker FROM anon, authenticated;


-- ============================================================================
-- §D — RE-VERIFY (after §C — RLS true + no anon/authenticated grants remain)
-- ============================================================================
-- D1. RLS now enabled on all three (expect three rows, rowsecurity = true):
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('cost_health_snapshots', 'translation_sandwich_comparisons', 'translation_sandwich_cost_tracker');

-- D2. No anon/authenticated grants remain (expect ZERO rows):
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('cost_health_snapshots', 'translation_sandwich_comparisons', 'translation_sandwich_cost_tracker')
  AND grantee IN ('anon', 'authenticated', 'PUBLIC');

-- D3. Smoke: the app still works (service-role bypasses RLS). After apply, hit a
--     billing/cost surface (or wait for the daily observability cron) and confirm
--     cost snapshots still read/write. If ANY app read breaks, roll back (§E).


-- ============================================================================
-- §E — ROLLBACK (restore prior state if any app access breaks)
--      NOTE: record the §B2 grant output BEFORE §C so you can restore the exact
--      prior grants. The generic restore below re-opens the default grants.
-- ============================================================================
-- ALTER TABLE public.cost_health_snapshots            DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.translation_sandwich_comparisons DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.translation_sandwich_cost_tracker DISABLE ROW LEVEL SECURITY;
-- GRANT ALL ON public.cost_health_snapshots            TO anon, authenticated;  -- only if §B2 showed grants
-- GRANT ALL ON public.translation_sandwich_comparisons TO anon, authenticated;
-- GRANT ALL ON public.translation_sandwich_cost_tracker TO anon, authenticated;
