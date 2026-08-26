-- ============================================================================
-- View-grants remediation — reflections-arc item-3 leftover #2
-- ============================================================================
-- Date: 2026-08-26. Memory: `supabase-view-default-grants-auto-updatable`.
--
-- THE PROPERTY. Supabase's default privileges grant ALL (SELECT, INSERT,
-- UPDATE, DELETE, TRUNCATE...) on a newly created public view to
-- anon/authenticated/service_role — invisibly to a migration whose text
-- never states a grant, or states only a SELECT grant additively (the grant
-- is additive on top of the default, not exclusive of it). A simple
-- single-table view is auto-updatable in Postgres and its owner bypasses the
-- base table's RLS, so the default write grants let an anonymous PostgREST
-- client write through the view; even a GROUP BY/JOIN view that is NOT
-- auto-updatable still leaks its SELECT to anon/authenticated by default.
--
-- THIS FILE fixes the 9 already-LIVE views across 4 already-applied
-- migrations that carried no grant statement at all (found during the
-- reflections-arc item-3 leftover remediation, 2026-08-26):
--   website/supabase-mentor-gaps-migration.sql        (6 views)
--   supabase/migrations/20260413_logging_refactor_gap4.sql  (2 views)
--   supabase/migrations/20260411_agent_handoffs.sql   (2 views)
--   api/api-keys-schema.sql                            (1 view)
-- Those source files were ALSO edited in place, this same session, to carry
-- the identical REVOKE/GRANT blocks — so a fresh environment created from
-- them going forward needs no separate remediation step. THIS file exists
-- only to retroactively apply the same fix to the environments where those
-- migrations already ran (TEST and production) before this fix existed.
--
-- A FIFTH file, `supabase/migrations/20260416_r20a_vulnerability_flag.sql`
-- (`vulnerability_flag_owner_view`), is DELIBERATELY EXCLUDED from this
-- remediation. That view was designed for authenticated-owner SELECT access
-- (not service_role-only, unlike every view here), and — unlike any view
-- fixed in this file — it has no `security_invoker` option set, which on
-- current Postgres/Supabase semantics means the view executes against its
-- base table as the VIEW'S OWNER, not the querying role; since the base
-- table's RLS is only ENABLEd (not FORCEd), its owner is exempt from RLS by
-- default. The migration's own comments assert "governed by RLS policies
-- above... auth.uid() = user_id (Policy 1 applies)" through the view — a
-- claim this session could not confirm and has reason to doubt. That table
-- (R20a Phase B vulnerable-user protection flags) is too safety-sensitive to
-- fix by the same default-grants pattern used here without first confirming,
-- live, whether RLS genuinely restricts rows read through this specific
-- view. See the session's close/decision-log entry for the full finding;
-- this is a NAMED, SEPARATE, HELD item — not silently rolled into this file
-- and not silently skipped either.
--
-- RISK: privilege-only (REVOKE/GRANT), no DDL, no data touched, trivially
-- reversible (re-run the original GRANT ALL to undo, though that would
-- restore the vulnerability). Idempotent — REVOKE/GRANT on a privilege
-- already absent/present is a no-op, not an error.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- §PRE — confirm the default-grant vulnerability is actually present before
-- touching anything. Every one of these 9 views should show MORE than a
-- single SELECT-to-service_role row (i.e., anon/authenticated also present,
-- and/or non-SELECT privileges present). If a row is already service_role/
-- SELECT-only for a given view, that view needs no further action — this is
-- diagnostic, not a hard gate.
-- ----------------------------------------------------------------------------
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'realtime_journal_lag_stats', 'passion_weekly_catch_rate',
    'passion_classification_accuracy', 'passion_intensity_trends',
    'premeditatio_engagement', 'oikeiosis_stage_progression',
    'gap4_month3_review', 'gap4_month6_review',
    'agent_handoffs_open', 'agent_handoffs_30d_categories',
    'api_key_usage_current'
  )
ORDER BY table_name, grantee, privilege_type;

-- ----------------------------------------------------------------------------
-- §APPLY
-- ----------------------------------------------------------------------------

-- mentor-gaps-migration.sql's 6 views
REVOKE ALL ON realtime_journal_lag_stats FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON passion_weekly_catch_rate FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON passion_classification_accuracy FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON passion_intensity_trends FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON premeditatio_engagement FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON oikeiosis_stage_progression FROM anon, authenticated, service_role, PUBLIC;
GRANT SELECT ON realtime_journal_lag_stats TO service_role;
GRANT SELECT ON passion_weekly_catch_rate TO service_role;
GRANT SELECT ON passion_classification_accuracy TO service_role;
GRANT SELECT ON passion_intensity_trends TO service_role;
GRANT SELECT ON premeditatio_engagement TO service_role;
GRANT SELECT ON oikeiosis_stage_progression TO service_role;

-- 20260413_logging_refactor_gap4.sql's 2 views
REVOKE ALL ON gap4_month3_review FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON gap4_month6_review FROM anon, authenticated, service_role, PUBLIC;
GRANT SELECT ON gap4_month3_review TO service_role;
GRANT SELECT ON gap4_month6_review TO service_role;

-- 20260411_agent_handoffs.sql's 2 views
REVOKE ALL ON public.agent_handoffs_open FROM anon, authenticated, service_role, PUBLIC;
REVOKE ALL ON public.agent_handoffs_30d_categories FROM anon, authenticated, service_role, PUBLIC;
GRANT SELECT ON public.agent_handoffs_open TO service_role;
GRANT SELECT ON public.agent_handoffs_30d_categories TO service_role;

-- api-keys-schema.sql's 1 view
REVOKE ALL ON public.api_key_usage_current FROM anon, authenticated, service_role, PUBLIC;
GRANT SELECT ON public.api_key_usage_current TO service_role;

-- ----------------------------------------------------------------------------
-- §VERIFY — every one of the 11 views must show EXACTLY ONE row:
-- (view_name, service_role, SELECT). Any other row (anon/authenticated
-- present, or a non-SELECT privilege present) = FAIL, a default grant
-- survived.
-- ----------------------------------------------------------------------------
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'realtime_journal_lag_stats', 'passion_weekly_catch_rate',
    'passion_classification_accuracy', 'passion_intensity_trends',
    'premeditatio_engagement', 'oikeiosis_stage_progression',
    'gap4_month3_review', 'gap4_month6_review',
    'agent_handoffs_open', 'agent_handoffs_30d_categories',
    'api_key_usage_current'
  )
ORDER BY table_name, grantee, privilege_type;

-- ----------------------------------------------------------------------------
-- §INVERSE (rollback — restores the pre-fix default-privileged state;
-- expected to be used only if this fix is found to break a legitimate,
-- currently-undiscovered anon/authenticated read path this session's
-- website/src grep missed)
-- ----------------------------------------------------------------------------
-- GRANT ALL ON realtime_journal_lag_stats TO anon, authenticated, service_role;
-- GRANT ALL ON passion_weekly_catch_rate TO anon, authenticated, service_role;
-- GRANT ALL ON passion_classification_accuracy TO anon, authenticated, service_role;
-- GRANT ALL ON passion_intensity_trends TO anon, authenticated, service_role;
-- GRANT ALL ON premeditatio_engagement TO anon, authenticated, service_role;
-- GRANT ALL ON oikeiosis_stage_progression TO anon, authenticated, service_role;
-- GRANT ALL ON gap4_month3_review TO anon, authenticated, service_role;
-- GRANT ALL ON gap4_month6_review TO anon, authenticated, service_role;
-- GRANT ALL ON public.agent_handoffs_open TO anon, authenticated, service_role;
-- GRANT ALL ON public.agent_handoffs_30d_categories TO anon, authenticated, service_role;
-- GRANT ALL ON public.api_key_usage_current TO anon, authenticated, service_role;
