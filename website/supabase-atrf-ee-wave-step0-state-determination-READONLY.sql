-- READ-ONLY. THIS FILE IS NOT A MIGRATION AND MUST NEVER BE "APPLIED".
-- It contains only SELECTs. It creates, alters and drops nothing.
-- Authored 2026-08-31. Paired with:
--   operations/handoffs/founder/2026-08-23-atrf-ee-production-wave-FOUNDER-WALK.md (Step 0)
-- ============================================================================
-- ATRF/EE WAVE -- STEP 0: READ-ONLY PRODUCTION STATE DETERMINATION
-- Run this FIRST, in each environment, BEFORE step 1. Changes nothing.
-- Resolves the open question: did any of the four migration steps already run?
-- Repo evidence is consistent with "unapplied" but CANNOT establish DB state
-- (the Q5c precedent: production was found already at target from an
-- unrecorded partial application).
-- Pure ASCII. No typography. Verdicts are computed, not eyeballed.
-- ============================================================================

-- Q1 -- STEP 1 (Class B RLS lockdown): the three tables' policy shape.
-- APPLIED looks like: exactly 1 policy per table, named
--   "Service role full access to <table>", AND Q5's grants clean.
-- CORRECTED 2026-08-31 (first production run). The prior text said
-- roles = {service_role}. THAT IS WRONG AND THE MIGRATION CAN NEVER
-- PRODUCE IT: the policies are created with no "TO" clause, so polroles
-- is {0} (PUBLIC), the rolname lookup returns an empty array, and the
-- roles column renders BLANK. A blank roles cell here is the CORRECT
-- applied state, not an anomaly -- the guard is the predicate
-- USING (auth.role() = 'service_role') plus the REVOKEs, not a TO clause.
-- Distinguish from the founder_conversations Class C defect, which was
-- USING (true) with no TO clause over un-revoked grants. Predicate differs.
-- Determine per table by NAME against the migration's documented pre-state:
--   action_evaluations_v3 unapplied = 2 owner policies present
--   journal_entries       unapplied = 3 (pre-existing service-role + 2 owner)
--   reflections           unapplied = exactly 1, "Users can read own reflections"
-- UNAPPLIED looks like: owner policies present, or (for reflections) zero.
SELECT
  c.relname                                  AS table_name,
  c.relrowsecurity                           AS rls_enabled,
  count(p.polname)                           AS policy_count,
  coalesce(string_agg(p.polname, ' | ' ORDER BY p.polname), '(none)') AS policies,
  coalesce(string_agg(DISTINCT array_to_string(
    ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(p.polroles)), ','), ' / '), '(none)')
                                             AS roles
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy p ON p.polrelid = c.oid
WHERE n.nspname = 'public'
  AND c.relname IN ('action_evaluations_v3','journal_entries','reflections')
GROUP BY c.relname, c.relrowsecurity
ORDER BY c.relname;

-- Q2 -- STEP 2 (idea_loop_candidates additive columns): expect 6 of 6 if applied.
SELECT
  count(*) FILTER (WHERE column_name IN (
    'blast_radius','agent_blast_radius','target_circle',
    'blast_radius_basis','traceability_check','extraction_evidence')) AS columns_present,
  6                                                                   AS columns_expected,
  CASE count(*) FILTER (WHERE column_name IN (
    'blast_radius','agent_blast_radius','target_circle',
    'blast_radius_basis','traceability_check','extraction_evidence'))
    WHEN 6 THEN 'APPLIED'
    WHEN 0 THEN 'NOT APPLIED'
    ELSE 'PARTIAL -- STOP AND INVESTIGATE'
  END                                                                 AS verdict
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'idea_loop_candidates';

-- Q3 -- STEP 3 (idea_loop_completion_signals table).
SELECT
  CASE WHEN to_regclass('public.idea_loop_completion_signals') IS NULL
       THEN 'NOT APPLIED' ELSE 'APPLIED' END AS verdict,
  (SELECT count(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='idea_loop_completion_signals') AS column_count,
  17                                          AS column_count_expected;

-- Q4 -- STEP 4 (api_keys capability widening). Re-derive the CHECK from the
-- catalogue, NEVER from the migration file's comments (standing lesson).
SELECT
  conname,
  position('completion_signal_write' in pg_get_constraintdef(oid)) > 0 AS has_capability,
  CASE WHEN position('completion_signal_write' in pg_get_constraintdef(oid)) > 0
       THEN 'APPLIED' ELSE 'NOT APPLIED' END                           AS verdict,
  pg_get_constraintdef(oid)                                            AS definition
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) ILIKE '%capabilit%'
ORDER BY conname;

-- Q5 -- STEP 1 GRANTS. ADDED 2026-08-31 after the first production run of this
-- file, which established that Q1 alone CANNOT determine step 1's state.
-- Q1 reads pg_policy only. The Class B policies are created with NO "TO"
-- clause -- they are guarded by the predicate USING (auth.role() =
-- 'service_role') and by the migration's REVOKEs. So the lockdown rests on the
-- grants as much as on the policies, and Q1 does not look at grants at all.
-- Run this WITH Q1; a policy-only reading is not a determination.
-- APPLIED looks like: service_role rows ONLY.
-- ANY anon / authenticated / PUBLIC row is a live hole (policies closed,
-- grants left open) -- the Class C shape already found twice in this project.
SELECT
  table_name,
  grantee,
  string_agg(privilege_type, ',' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('action_evaluations_v3','journal_entries','reflections')
  AND grantee IN ('anon','authenticated','PUBLIC','service_role')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
