-- ============================================================================
-- Phase B Verification Queries
-- Run these in Supabase Studio SQL Editor AFTER deploying the migration.
-- Reference: R20a-Phase-B-CCP-brief.md §(d)
-- ============================================================================

-- ============================================================================
-- CCP VERIFICATION QUERY 1: Table structure exists with correct columns
-- Expected: 12 rows (flag_id, user_id, session_id, severity,
--   triggered_rules, excerpt_ref, reviewer_id, reviewer_notes,
--   outreach_sent_at, resolution, created_at, updated_at)
-- ============================================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vulnerability_flag'
ORDER BY ordinal_position;

-- ============================================================================
-- CCP VERIFICATION QUERY 2: RLS policies are active
-- Expected: 3 policies:
--   vf_owner_select (SELECT, USING auth.uid() = user_id)
--   vf_support_select (SELECT, USING support+decrypt check)
--   vf_support_update (UPDATE, USING+WITH CHECK support+decrypt check)
-- ============================================================================

SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE tablename = 'vulnerability_flag'
ORDER BY policyname;

-- ============================================================================
-- CCP VERIFICATION QUERY 3: RLS is enabled on the table
-- Expected: relrowsecurity = true, relforcerowsecurity = false
-- ============================================================================

SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'vulnerability_flag';

-- ============================================================================
-- CCP VERIFICATION QUERY 4: Owner view exists with correct columns
-- Expected: 11 columns (flag_id through updated_at, with reviewer_role
--   instead of reviewer_id, and reviewer_notes absent)
-- ============================================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vulnerability_flag_owner_view'
ORDER BY ordinal_position;

-- ============================================================================
-- CCP VERIFICATION QUERY 5: Constraints are in place
-- Expected: vf_severity_range and vf_resolution_valid
-- ============================================================================

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.vulnerability_flag'::regclass
  AND contype = 'c'
ORDER BY conname;

-- ============================================================================
-- CCP VERIFICATION QUERY 6: Updated_at trigger exists
-- Expected: trg_vf_updated_at, BEFORE UPDATE, FOR EACH ROW
-- ============================================================================

SELECT trigger_name, event_manipulation, action_timing, action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'vulnerability_flag'
ORDER BY trigger_name;

-- ============================================================================
-- CCP VERIFICATION QUERY 7: CASCADE delete behaviour on user_id FK
-- Expected: confdeltype = 'c' (CASCADE)
-- ============================================================================

SELECT
  conname,
  confdeltype,
  CASE confdeltype
    WHEN 'c' THEN 'CASCADE'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS delete_action
FROM pg_constraint
WHERE conrelid = 'public.vulnerability_flag'::regclass
  AND contype = 'f'
ORDER BY conname;


-- ============================================================================
-- ARCHETYPE VALIDATION TESTS
-- These use synthetic data. Run AFTER the CCP verification queries pass.
-- Clean up synthetic data after testing (cleanup block at end of file).
-- ============================================================================

-- NOTE: These tests require inserting synthetic data as service_role
-- (which bypasses RLS). After insertion, the SELECT tests must be run
-- as specific authenticated users to verify RLS filtering.
--
-- In Supabase Studio, queries run as service_role by default.
-- To test RLS, use: SET LOCAL role = 'authenticated';
-- and: SET LOCAL request.jwt.claim.sub = '<uuid>';
--
-- The exact test execution will be guided step-by-step during the
-- CCP session. The archetype definitions below document WHAT is tested.

-- Synthetic UUIDs for testing (not real users):
-- User A: 00000000-0000-0000-0000-000000000001
-- User B: 00000000-0000-0000-0000-000000000002
-- User C (no profile, flagged once): 00000000-0000-0000-0000-000000000003
-- Reviewer: 00000000-0000-0000-0000-000000000004

-- ============================================================================
-- Archetype 1: New user, no flags
-- Test: SELECT as User A when no rows exist for User A
-- Expected: Zero rows (not an error)
-- ============================================================================

-- Archetype 2: Active user with multiple flags
-- Setup: Insert 3 rows for User B at severity 1, 2, 3
-- Test: SELECT as User B
-- Expected: Exactly 3 rows, all for User B

-- Archetype 3: Flagged user with no mentor profile
-- Setup: Insert 1 row for User C (no other data in system)
-- Test: SELECT as User C
-- Expected: 1 row visible. No join failure.

-- Archetype 4: Cross-user isolation
-- Test: SELECT as User A (who has no flags)
-- Expected: Zero of User B's or User C's rows visible

-- Archetype 5: Support with approved decrypt request
-- Setup: Insert a support_decrypt_request for User B, approved, not expired
-- Test: SELECT as Reviewer with support role
-- Expected: User B's rows visible

-- Archetype 6: Support WITHOUT approved decrypt request
-- Test: SELECT as Reviewer with support role, no request for User C
-- Expected: Zero of User C's rows visible

-- Archetype 7: Support with EXPIRED decrypt request
-- Setup: Insert a support_decrypt_request for User C, approved but expired
-- Test: SELECT as Reviewer with support role
-- Expected: Zero of User C's rows visible

-- Archetype 8: API-only agent user
-- Same as Archetype 3 — the schema does not assume a human profile.
-- The test passes if Archetype 3 passes, since the table has no
-- dependency on any profile table.

-- Archetype 9: Unauthenticated request
-- Test: SELECT as anon role (no auth.uid())
-- Expected: Zero rows

-- Archetype 10: Classifier INSERT
-- Test: INSERT a new row as service_role
-- Expected: Row created

-- Archetype 11: Owner cannot UPDATE
-- Test: UPDATE as User B on their own row
-- Expected: Zero rows updated (no UPDATE policy for owner)

-- Archetype 12: Owner cannot DELETE
-- Test: DELETE as User B on their own row
-- Expected: Zero rows deleted (no DELETE policy + REVOKE)

-- Archetype 13: Severity constraint enforcement
-- Test: INSERT with severity = 0 or severity = 4
-- Expected: CHECK constraint violation

-- ============================================================================
-- CLEANUP: Remove all synthetic test data after validation
-- ============================================================================
--
-- DELETE FROM public.vulnerability_flag
-- WHERE user_id IN (
--   '00000000-0000-0000-0000-000000000001',
--   '00000000-0000-0000-0000-000000000002',
--   '00000000-0000-0000-0000-000000000003'
-- );
--
-- DELETE FROM public.support_decrypt_request
-- WHERE user_id IN (
--   '00000000-0000-0000-0000-000000000002',
--   '00000000-0000-0000-0000-000000000003'
-- );
