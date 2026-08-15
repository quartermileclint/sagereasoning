-- ============================================================================
-- impulse_entries — RLS lockdown to service-role-only (the target shape)
-- ============================================================================
-- Concurrent-arc C4, Step 2 Phase 2 — `code-critical` (AC7 + PR19).
-- Origin: D-S7-IMPULSE-PR19-INDEPENDENT-REVIEW-CLEAN (bypass confirmed reachable)
--         D-S7-IMPULSE-MENTOR-CLEARANCE-AND-FOLLOW-THROUGH (impulse_entries first)
-- Survey:  operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md
--
-- WHAT THIS CHANGES, in one sentence. `impulse_entries` currently carries four
-- per-verb owner policies (auth.uid() = user_id), which let ANY authenticated
-- practitioner INSERT/SELECT/UPDATE/DELETE directly via PostgREST with only the
-- public anon key and their own JWT — bypassing /api/mentor/impulse and with it
-- the R20a distress check, field validation, and rate limiting. This migration
-- removes those four policies so the table matches the proven service-role-only
-- shape already live on route_errors / collaboration_records / stoa_entries.
--
-- WHY IT IS SAFE. Every read and write of impulse_entries in the app goes
-- through /api/mentor/impulse, which constructs its client with
-- SUPABASE_SERVICE_ROLE_KEY (createClient(url, serviceKey), 3 sites, 0 anon —
-- verified 2026-08-16). service_role has BYPASSRLS, so RLS policies never gate
-- the app's own path. No client/browser code references impulse_entries
-- (grep of src/app, src/components — zero hits). So the four owner policies
-- are required by NOTHING legitimate; they are an unused, live attack surface.
--
-- THE OPERATIVE CONTROL is RLS-enabled + no anon/authenticated policy:
-- "RLS on with no policy → PostgREST anon/authenticated cannot read or write"
-- (the route_errors precedent's own comment; core Postgres RLS semantics — a
-- non-BYPASSRLS role with no applicable policy sees/writes no rows, on EVERY
-- verb, SELECT included). §2 REVOKE is belt-and-braces on top of that, matching
-- the sibling shape; it is not what does the closing.
--
-- This migration alters ONLY impulse_entries. It touches no other table, no
-- schema, no flag, no code. RLS stays ENABLED throughout (never toggled off).

-- ============================================================================
-- §PRE — run BEFORE applying, on TEST first, then (for the record) production
-- ============================================================================
-- P1. Confirm the four owner policies + the service-role policy currently exist
--     (expect 5 rows: four "Users can ..." + one "Service role full access ..."):
--
--   SELECT policyname, cmd, roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'impulse_entries'
--   ORDER BY policyname;
--
-- P2. Confirm RLS is enabled (expect rowsecurity = true):
--
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE oid = 'public.impulse_entries'::regclass;
--
-- P3. BEHAVIOURAL BYPASS PROOF (TEST ONLY — never production).
--     Run the harness: `scripts/impulse-rls-bypass-proof.ts` (see its header).
--     Before this migration it must report: direct anon-key INSERT by an
--     authenticated throwaway user SUCCEEDS (the bypass), and SELECT of that row
--     via the same anon-key session SUCCEEDS. That is the reachable defect.
--     Capture the output; it is the "before" half of the §VERIFY proof.

-- ============================================================================
-- §APPLY
-- ============================================================================
-- §1 — Drop the four per-verb owner policies. The service-role policy stays.
DROP POLICY IF EXISTS "Users can view own impulse entries"   ON public.impulse_entries;
DROP POLICY IF EXISTS "Users can insert own impulse entries" ON public.impulse_entries;
DROP POLICY IF EXISTS "Users can update own impulse entries" ON public.impulse_entries;
DROP POLICY IF EXISTS "Users can delete own impulse entries" ON public.impulse_entries;

-- §2 — Belt-and-braces: revoke default table grants from anon/authenticated so
--      that even a mistakenly-re-added permissive policy would still find no
--      table-level privilege. Mirrors stoa_entries (REVOKE ALL … / GRANT ALL to
--      service_role). RLS-on-no-policy already denies; this is defence in depth.
REVOKE ALL ON public.impulse_entries FROM anon;
REVOKE ALL ON public.impulse_entries FROM authenticated;
REVOKE ALL ON public.impulse_entries FROM PUBLIC;
GRANT  ALL ON public.impulse_entries TO   service_role;

-- RLS stays ENABLED (it already is; this is a no-op assertion, not a toggle).
ALTER TABLE public.impulse_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- §VERIFY — run AFTER applying, on TEST first (all green before any prod step)
-- ============================================================================
-- V1. Only the service-role policy remains (expect exactly 1 row,
--     "Service role full access to impulse entries", cmd = ALL):
--
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'impulse_entries'
--   ORDER BY policyname;
--
-- V2. RLS still enabled (expect true):
--
--   SELECT relrowsecurity FROM pg_class
--   WHERE oid = 'public.impulse_entries'::regclass;
--
-- V3. anon/authenticated hold no table grants (expect ZERO rows):
--
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND table_name = 'impulse_entries'
--     AND grantee IN ('anon', 'authenticated');
--
-- V4. BEHAVIOURAL PROOF — BYPASS NOW CLOSED (TEST). Re-run
--     `scripts/impulse-rls-bypass-proof.ts`. It must now report: the direct
--     anon-key INSERT by the authenticated throwaway user FAILS (RLS / 42501 /
--     empty result), and a SELECT via the same session returns no rows. This is
--     the "after" half; the diff between §PRE-P3 and this is the fix, proven.
--
-- V5. BEHAVIOURAL PROOF — LEGITIMATE PATH UNBROKEN (TEST). A real POST through
--     /api/mentor/impulse (service-role client) still succeeds unchanged: create
--     an entry, read it back, revise via PATCH — all 200. The harness's
--     `--legit` mode does this end-to-end against the running dev server.

-- ============================================================================
-- §INVERSE — full rollback (restores the pre-migration state exactly)
-- ============================================================================
-- Recreates the four owner policies verbatim and restores the grants §2 revoked.
-- After running this, §PRE-P1 returns the original 5 rows and the bypass is open
-- again (the pre-fix behaviour). Rollback is two-way and complete.
--
--   GRANT ALL ON public.impulse_entries TO anon;
--   GRANT ALL ON public.impulse_entries TO authenticated;
--
--   CREATE POLICY "Users can view own impulse entries"
--     ON public.impulse_entries FOR SELECT USING (auth.uid() = user_id);
--   CREATE POLICY "Users can insert own impulse entries"
--     ON public.impulse_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
--   CREATE POLICY "Users can update own impulse entries"
--     ON public.impulse_entries FOR UPDATE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own impulse entries"
--     ON public.impulse_entries FOR DELETE USING (auth.uid() = user_id);
--
-- (The service-role policy and RLS-enabled state are untouched by §APPLY, so the
--  inverse does not restate them.)
