-- ============================================================
-- PRIORITY 6: User Location for Community Map
-- Run this migration in your Supabase SQL editor
-- ============================================================

-- Add location columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN DEFAULT FALSE;

-- Create a public view that only returns opted-in users
-- This is what the community map API reads — NO personal info, just location + score tier
CREATE OR REPLACE VIEW public.community_map_pins AS
SELECT
  p.id,
  p.display_name,
  p.city,
  p.country,
  p.latitude,
  p.longitude,
  COALESCE(sp.sage_alignment, 'Aware') AS sage_alignment,
  COALESCE(sp.avg_total, 0) AS avg_total
FROM public.profiles p
LEFT JOIN public.user_stoic_profiles sp ON sp.user_id = p.id
WHERE p.show_on_map = TRUE
  AND p.latitude IS NOT NULL
  AND p.longitude IS NOT NULL;

-- Grant public read access to this view only
GRANT SELECT ON public.community_map_pins TO anon, authenticated;

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
