-- ============================================================
-- STOA ST1 — Community-map repair + Q6a de-grading (2026-08-02)
-- Run in the Supabase SQL editor. TEST first if the TEST project
-- mirrors the gap, then PRODUCTION.
--
-- What this does:
--   1. Ensures the profiles location columns exist (idempotent —
--      the original supabase-location-migration.sql may never have
--      been fully applied to production).
--   2. Rebuilds the community_map_pins view WITHOUT the alignment
--      fields (sage_alignment, avg_total) and WITHOUT the
--      user_stoic_profiles join, per the adopted mentor ruling
--      Q6a (D-CONNECTIVE-LAYER-STOA-MENTOR-VERDICTS-ADOPTED-PLAN-
--      AUTHORED-2026-08-02): no practice-derived data appears on
--      any human connective-layer entry. The opt-in gate
--      (show_on_map = TRUE) and the location-present gate are
--      preserved exactly; SELECT grants to anon/authenticated are
--      re-issued (a DROP VIEW discards grants).
--
-- Why DROP + CREATE rather than CREATE OR REPLACE:
--   Postgres does not allow CREATE OR REPLACE VIEW to remove
--   columns from an existing view. Removing sage_alignment and
--   avg_total therefore requires DROP VIEW first. Grants are
--   re-issued below.
--
-- NOTE (code-side root cause, for the record): the live 42703
-- ("community_map_pins.show_on_map does not exist") is caused by
-- the API route filtering .eq('show_on_map', true) against the
-- VIEW, which never exposed that column — the view filters on it
-- internally. The paired code change removes that filter. This
-- migration alone does not fix the 42703; the code deploy does.
-- ============================================================

-- ------------------------------------------------------------
-- §0 DIAGNOSTIC (read-only — run FIRST, record the output in the
--    session notes before applying §1+)
-- ------------------------------------------------------------
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles'
       AND column_name IN ('city','country','latitude','longitude','show_on_map'))
    AS profiles_location_columns_present_of_5,
  (SELECT count(*) FROM information_schema.views
     WHERE table_schema = 'public' AND table_name = 'community_map_pins')
    AS view_exists,
  (SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'community_map_pins')
    AS view_columns,
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'user_stoic_profiles')
    AS user_stoic_profiles_exists;

-- ------------------------------------------------------------
-- §1 Profiles location columns (idempotent; unchanged in meaning
--    from supabase-location-migration.sql)
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN DEFAULT FALSE;

-- Self-service location update policy (idempotent form — CREATE
-- POLICY has no IF NOT EXISTS; guarded via pg_policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Users can update own location'
  ) THEN
    CREATE POLICY "Users can update own location"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ------------------------------------------------------------
-- §2 The de-graded view (Q6a): location + display name ONLY.
--    No practice-derived field. No user_stoic_profiles join.
-- ------------------------------------------------------------
-- NOTE: if §0 showed view_exists = 0 but view_columns non-null,
-- community_map_pins exists as a TABLE or MATERIALIZED VIEW (a
-- hand-created remnant). DROP VIEW would then error
-- ('is not a view') and abort the paste — STOP and resolve that
-- state deliberately (DROP TABLE / DROP MATERIALIZED VIEW after
-- confirming it holds nothing of value) before re-running §2.
DROP VIEW IF EXISTS public.community_map_pins;

-- The raw auth-user id is deliberately NOT exposed (review fold
-- F2, 2026-08-03): it was an unnecessary stable correlator served
-- to anonymous callers on a leak-history surface. Nothing consumes
-- it — the page keys pins positionally.
CREATE VIEW public.community_map_pins AS
SELECT
  p.display_name,
  p.city,
  p.country,
  p.latitude,
  p.longitude
FROM public.profiles p
WHERE p.show_on_map = TRUE
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL;

-- ------------------------------------------------------------
-- §3 Grants — REVOKE-FIRST (TEST-walk finding, 2026-08-03).
-- Supabase's default privileges grant ALL on newly created
-- public views to anon/authenticated/service_role. The old view
-- had a JOIN (not writable), but this simplified single-table
-- view is AUTO-UPDATABLE, and the view owner bypasses profiles
-- RLS — so the default INSERT/UPDATE/DELETE grants would let an
-- anonymous PostgREST client write/delete opted-in practitioners'
-- profiles rows THROUGH the view. Revoke everything, then grant
-- SELECT only. service_role is granted explicitly (the API
-- route's read path — stated and verified, not assumed).
-- ------------------------------------------------------------
REVOKE ALL ON public.community_map_pins FROM anon, authenticated, service_role, PUBLIC;
GRANT SELECT ON public.community_map_pins TO anon, authenticated, service_role;

-- ------------------------------------------------------------
-- §VERIFY (run after §1–§3; every check must be green)
-- ------------------------------------------------------------
-- V1: view exists with EXACTLY these five columns, none evaluative
SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) AS view_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'community_map_pins';
-- Expected: display_name, city, country, latitude, longitude
-- (must NOT contain sage_alignment, avg_total, or id)

-- V2: grants are SELECT-ONLY (the revoke-first discipline held)
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'community_map_pins'
  AND grantee IN ('anon','authenticated','service_role');
-- Expected: EXACTLY three rows, all privilege_type = SELECT
-- (one each for anon, authenticated, service_role). ANY other
-- privilege row (INSERT/UPDATE/DELETE/...) is a FAIL — re-run §3.

-- V3: profiles columns present
SELECT count(*) AS profiles_location_columns_present_of_5
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('city','country','latitude','longitude','show_on_map');
-- Expected: 5

-- V4: the view returns only opted-in, located rows (count sanity)
SELECT count(*) AS opted_in_pins FROM public.community_map_pins;
-- Expected: >= 0 (0 is honest if no one has opted in)

-- ============================================================
-- ROLLBACK NOTES
--
-- Rolling back this migration restores either the REPAIRED,
-- DE-GRADED state (re-run §2–§3) or, at furthest, the broken
-- pre-session state (DROP VIEW IF EXISTS public.community_map_pins;
-- the paired code revert then errors against the missing view —
-- 42P01 relation-not-found; against a still-present de-graded view
-- the reverted code's alignment select errors 42703 — either way
-- the reverted route's legacy handling renders an empty map: broken
-- but safe, the pre-session state).
--
-- THE GRADED VIEW IS NEVER RESTORED. Re-adding sage_alignment /
-- avg_total to this view would contradict the adopted Q6a ruling
-- ("a broken surface that predates a ruling is not grandfathered
-- by its prior existence"). A future founder decision to reverse
-- that would require re-opening the mentor record, not a rollback.
-- The profiles columns in §1 are additive and may stay under any
-- rollback.
-- ============================================================
