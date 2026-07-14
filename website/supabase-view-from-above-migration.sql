-- =====================================================================
-- View from above (the cosmopolitan perspective) — human-practitioner tool
-- Remaining Principles #9 (view from above) + #13 (fate-acceptance reframe, folded in)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot.
-- Creates the user-scoped table behind the /view-from-above practitioner tool: a
-- Zone-2 grief/catastrophising calibration exercise. The practitioner names a
-- concern that feels overwhelming, walks through three temporal expansions (one
-- year, ten years, the whole of their life) and one spatial expansion (the widest
-- circle they can genuinely inhabit), meets it with the fate-acceptance reframe
-- (#13 — the event is part of the order of things; acceptance is rational, not
-- resigned), and writes a recalibrated reading of the concern's actual magnitude.
-- The tool does not minimise. It calibrates.
--
-- Human-only. This table + its /api/mentor/view-from-above route never touch
-- /api/reason, the signed assessment, or the substrate engine. It is NOT in the
-- /api/reason import graph or the frozen capture set, so it leaves the 7-day
-- false-hold measurement untouched.
--
-- Mirrors the reserve_clause_entries / premeditatio_entries user-scoped pattern:
-- uuid PK, user_id FK → auth.users ON DELETE CASCADE, per-verb RLS on
-- auth.uid() = user_id + a service_role FOR ALL policy (the route uses the
-- service-role key and scopes every query with .eq('user_id', userId)).
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.view_from_above_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concern text NOT NULL,                    -- the concern that feels overwhelming
  expansion_one_year text,                  -- optional: how it looks in one year
  expansion_ten_years text,                 -- optional: how it looks in ten years
  expansion_whole_life text,                -- optional: in the context of your whole life
  expansion_widest_circle text,             -- optional: from the widest circle you can genuinely inhabit
  fate_acceptance text,                     -- optional (#13): what accepting rather than resisting it looks like
  recalibrated_reading text NOT NULL,       -- the concern read at its actual size
  -- quality-gate classification (NULL if the gate could not run). The LLM is
  -- restricted to classification only; the tailored messages are deterministic.
  calibration_quality text
    CHECK (calibration_quality IN ('calibrated', 'minimised', 'unchanged')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_view_from_above_user_created
  ON public.view_from_above_entries(user_id, created_at DESC);

ALTER TABLE public.view_from_above_entries ENABLE ROW LEVEL SECURITY;

-- Per-verb owner policies + a service-role bypass (matches reserve_clause_entries).
DO $$ BEGIN
  CREATE POLICY "Users can view own view from above entries"
    ON public.view_from_above_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own view from above entries"
    ON public.view_from_above_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own view from above entries"
    ON public.view_from_above_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own view from above entries"
    ON public.view_from_above_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to view from above"
    ON public.view_from_above_entries FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying)
-- =====================================================================
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'view_from_above_entries'
--   ORDER BY ordinal_position;
--   Expect: id, user_id, concern, expansion_one_year, expansion_ten_years,
--           expansion_whole_life, expansion_widest_circle, fate_acceptance,
--           recalibrated_reading, calibration_quality, created_at.
--
-- SELECT relrowsecurity FROM pg_class WHERE oid = 'public.view_from_above_entries'::regclass;
--   Expect: true (RLS enabled).
--
-- SELECT policyname FROM pg_policies WHERE tablename = 'view_from_above_entries';
--   Expect: the 5 policies above.
--
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.view_from_above_entries'::regclass AND contype = 'c';
--   Expect: a CHECK constraint on calibration_quality.

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- DROP TABLE IF EXISTS public.view_from_above_entries;  -- drops its policies + index too
