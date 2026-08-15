-- ============================================================================
-- founder_conversations + founder_conversation_messages — RLS lockdown
-- ============================================================================
-- Concurrent-arc C4 follow-on — `code-critical` (AC7 + PR19).
-- Survey: operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md
--         (Class C, rows 23–24 — the role-unrestricted policy class)
-- Precedent: supabase-impulse-rls-lockdown-migration.sql (same shape, applied
--            and proven live on TEST + production 2026-08-16,
--            D-CONCURRENT-ARC-C4-IMPULSE-RLS-FIX-LIVE-2026-08-16).
--
-- ============================================================================
-- THE DEFECT, CONFIRMED LIVE BEFORE THIS MIGRATION WAS WRITTEN
-- ============================================================================
-- Both tables carry a policy of the form:
--
--   CREATE POLICY "Service role full access on conversations"
--     ON founder_conversations FOR ALL USING (true) WITH CHECK (true);
--
-- The NAME says service-role. The POLICY says everyone: there is no `TO`
-- clause, so it applies to `public` — every role, including `anon` and
-- `authenticated` — and `USING (true)` matches EVERY ROW, not merely the
-- caller's own. Combined with Supabase's default table grants (which this
-- table's original migration never revoked), the result is that the public
-- anon key alone permits SELECT/INSERT/UPDATE/DELETE on every row.
--
-- VERIFIED BEHAVIOURALLY, 2026-08-16, before writing this file: an
-- UNAUTHENTICATED request (public anon key, no JWT, no login) to
--   GET /rest/v1/founder_conversations?select=id&limit=1
-- returned HTTP 200 with a row on PRODUCTION, and HTTP 200 (empty — the table
-- is empty there) on TEST. Production holds ~70 conversations and ~2,131
-- messages of the founder's own private agent conversations.
--
-- This is a STRICTLY WIDER exposure than the impulse_entries case fixed
-- earlier the same day: that one required an authenticated session and its
-- `auth.uid() = user_id` policy scoped damage to the caller's own rows. This
-- one requires no login and scopes to everything.
--
-- The original migration's own comment reads: "Since these endpoints are
-- already gated by FOUNDER_USER_ID in the API routes, RLS here is
-- defense-in-depth." The intent was service-role-only. The SQL does not
-- express it, so the defence was never in place.
--
-- ============================================================================
-- WHY THIS FIX IS SAFE
-- ============================================================================
-- Verified first-hand 2026-08-16, not inherited from the survey:
--   * Both tables are referenced from exactly ONE file, `src/app/api/founder/
--     hub/route.ts` (16 call sites), and every one goes through `supabaseAdmin`
--     (`src/lib/supabase-server.ts` — constructed with SUPABASE_SERVICE_ROLE_KEY).
--   * That route file constructs no other Supabase client; there is no anon-key
--     client anywhere in it.
--   * The founder-hub UI (`src/app/founder-hub/page.tsx`) reaches the data only
--     via `fetch('/api/founder/hub', …)` — it never calls Supabase directly.
--   * `service_role` carries BYPASSRLS, and the GRANT below keeps its
--     object-level privilege, so the app's own path is untouched either way.
-- So the permissive policies are required by NOTHING legitimate.
--
-- The target shape is the one already proven live on this codebase's own
-- tables (route_errors, stoa_entries, collaboration_records, impulse_entries):
-- RLS enabled, NO policy for anon/authenticated, grants revoked, service_role
-- granted.
--
-- This migration alters ONLY these two tables. No schema, no flag, no code.

-- ============================================================================
-- §PRE — run BEFORE applying (TEST first, then production)
-- ============================================================================
-- P1. Confirm the two permissive policies exist (expect 2 rows, both cmd=ALL,
--     roles={public}, qual=true, with_check=true):
--
--   SELECT tablename, policyname, cmd, roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public'
--     AND tablename IN ('founder_conversations', 'founder_conversation_messages')
--   ORDER BY tablename;
--
-- P2. Confirm RLS is enabled on both (expect true, true):
--
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE oid IN ('public.founder_conversations'::regclass,
--                 'public.founder_conversation_messages'::regclass);
--
-- P3. Record the row counts, so §VERIFY can prove no data was harmed:
--
--   SELECT 'conversations' AS t, count(*) FROM public.founder_conversations
--   UNION ALL
--   SELECT 'messages',            count(*) FROM public.founder_conversation_messages;
--
-- P4. BEHAVIOURAL EXPOSURE PROOF (read-only, no login, writes nothing).
--     From a terminal, against the environment being changed:
--
--   curl -s -w "\nHTTP %{http_code}\n" \
--     "$URL/rest/v1/founder_conversations?select=id&limit=1" -H "apikey: $ANON"
--
--     BEFORE this migration: HTTP 200 (a row on production; [] on an empty
--     TEST). That 200 is the defect — the read is PERMITTED at the privilege
--     layer for an anonymous caller.

-- ============================================================================
-- §APPLY
-- ============================================================================
-- §1 — Drop the two role-unrestricted policies. Nothing legitimate uses them
--      (service_role bypasses RLS; see the safety note above).
DROP POLICY IF EXISTS "Service role full access on conversations"
  ON public.founder_conversations;
DROP POLICY IF EXISTS "Service role full access on messages"
  ON public.founder_conversation_messages;

-- §2 — Revoke the default grants the original migration never revoked, and
--      grant service_role explicitly. This is the layer that actually denies an
--      anonymous caller (RLS-with-no-policy denies too; both are wanted).
REVOKE ALL ON public.founder_conversations         FROM anon;
REVOKE ALL ON public.founder_conversations         FROM authenticated;
REVOKE ALL ON public.founder_conversations         FROM PUBLIC;
REVOKE ALL ON public.founder_conversation_messages FROM anon;
REVOKE ALL ON public.founder_conversation_messages FROM authenticated;
REVOKE ALL ON public.founder_conversation_messages FROM PUBLIC;

GRANT ALL ON public.founder_conversations         TO service_role;
GRANT ALL ON public.founder_conversation_messages TO service_role;

-- §3 — RLS stays ENABLED (already is on both; asserted, not toggled).
ALTER TABLE public.founder_conversations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_conversation_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- §VERIFY — run AFTER applying (TEST first; all green before production)
-- ============================================================================
-- V1. No policies remain on either table (expect ZERO rows — unlike the
--     impulse fix, which retained a service-role policy, there is nothing to
--     keep here: both policies WERE the defect, and service_role needs none):
--
--   SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname = 'public'
--     AND tablename IN ('founder_conversations', 'founder_conversation_messages');
--
-- V2. RLS still enabled on both (expect true, true):
--
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE oid IN ('public.founder_conversations'::regclass,
--                 'public.founder_conversation_messages'::regclass);
--
-- V3. anon/authenticated hold no grants on either (expect ZERO rows):
--
--   SELECT table_name, grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public'
--     AND table_name IN ('founder_conversations', 'founder_conversation_messages')
--     AND grantee IN ('anon', 'authenticated');
--
-- V4. Data intact — re-run §PRE-P3 and confirm the counts are UNCHANGED.
--
-- V5. BEHAVIOURAL PROOF — exposure closed. Re-run §PRE-P4's curl. It must now
--     return `42501 permission denied for table founder_conversations`
--     (HTTP 401/403), NOT HTTP 200. Repeat for founder_conversation_messages.
--
-- V6. LEGITIMATE PATH UNBROKEN — load the founder hub in the browser, signed in
--     as the founder, and confirm the conversation list loads and a message can
--     be sent. (The hub route uses supabaseAdmin, so this should be unchanged;
--     confirm rather than assume.)

-- ============================================================================
-- §INVERSE — full rollback (restores the pre-migration state exactly)
-- ============================================================================
-- Recreates both policies verbatim from supabase-founder-conversations-
-- migration.sql and restores the grants §2 revoked. After running this, §PRE-P1
-- returns the original 2 rows and the exposure is open again (the pre-fix
-- behaviour, including the anonymous read).
--
--   GRANT ALL ON public.founder_conversations         TO anon;
--   GRANT ALL ON public.founder_conversations         TO authenticated;
--   GRANT ALL ON public.founder_conversation_messages TO anon;
--   GRANT ALL ON public.founder_conversation_messages TO authenticated;
--
--   CREATE POLICY "Service role full access on conversations"
--     ON public.founder_conversations FOR ALL
--     USING (true)
--     WITH CHECK (true);
--
--   CREATE POLICY "Service role full access on messages"
--     ON public.founder_conversation_messages FOR ALL
--     USING (true)
--     WITH CHECK (true);
--
-- (RLS-enabled state is untouched by §APPLY, so the inverse does not restate it.)
