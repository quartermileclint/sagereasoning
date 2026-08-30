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
-- APPLIED looks like: exactly 1 policy per table, roles = {service_role}.
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
