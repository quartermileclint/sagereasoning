-- ============================================================
-- PRIORITY 6: User Location for Community Map
-- ⚠ SUPERSEDED (2026-08-03, Stoa ST1 / Q6a): DO NOT RUN THIS FILE.
-- The view definition it carried included the practice-derived
-- sage_alignment / avg_total fields, which the adopted mentor
-- ruling Q6a (D-CONNECTIVE-LAYER-STOA-MENTOR-VERDICTS-ADOPTED-
-- PLAN-AUTHORED-2026-08-02) forbids on this surface. Re-running
-- that view block would silently re-grade the live view
-- (CREATE OR REPLACE VIEW appends columns). The current,
-- authoritative migration is:
--   website/supabase-community-map-degrade-migration.sql
-- The view block below has been neutralised to a comment; the
-- column/policy sections are retained for historical reference
-- only and are subsumed by the degrade migration's §1.
-- ============================================================

-- Add location columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN DEFAULT FALSE;

-- [NEUTRALISED 2026-08-03 — Q6a] The graded view definition that
-- stood here (profiles JOIN user_stoic_profiles, exposing
-- sage_alignment + avg_total) has been removed so this file can
-- never re-grade the live view. The current view definition and
-- grants live in supabase-community-map-degrade-migration.sql §2–§3.

-- RLS: users can update their own location fields
CREATE POLICY "Users can update own location"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- EXAMPLE: Manually add a location for testing
-- UPDATE public.profiles
--   SET city = 'Sydney', country = 'Australia',
--       latitude = -33.8688, longitude = 151.2093,
--       show_on_map = TRUE
-- WHERE id = '<your-user-id>';
-- ============================================================
