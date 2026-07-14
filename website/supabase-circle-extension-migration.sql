-- =====================================================================
-- Circle-extension practice — human-practitioner tool
-- Remaining Principles #6 (oikeiosis circle-extension exercise)
--   + #15 (cosmopolitan obligation check, folded in as a component)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot.
-- Creates the user-scoped table behind the circle-extension PRACTICE added to the
-- live /oikeiosis surface (alongside — never replacing — the quarterly
-- oikeiosis_reflections diagnostic + its oikeiosis_stage_progression view, which
-- this migration DOES NOT touch).
--
-- The mentor's exercise (#6, verbatim): "presents a current decision or situation
-- and asks the practitioner to identify which circle they are currently reasoning
-- from, then to explicitly reason from the next circle outward, and to notice what
-- changes in the action assessment when the circle expands." It is "not a
-- diagnostic — it does not produce a verdict. It is a practice that builds the
-- disposition the diagnostic then measures." The #15 cosmopolitan obligation check
-- is folded in as a component (NOT a standalone tool): after the extension reaches
-- the fourth circle (all rational beings / humanity), it asks which obligations of
-- citizenship — justice, mutual aid, honest dealing — that circle generates and
-- whether the current action engages any of them.
--
-- Human-only. This table + its /api/mentor/oikeiosis/extension route never touch
-- /api/reason, the signed assessment, or the substrate engine. It is NOT in the
-- /api/reason import graph or the frozen capture set, so it leaves the 7-day
-- false-hold measurement untouched.
--
-- Mirrors the view_from_above_entries / morning_preparation_entries user-scoped
-- pattern: uuid PK, user_id FK → auth.users ON DELETE CASCADE, per-verb RLS on
-- auth.uid() = user_id + a service_role FOR ALL policy (the route uses the
-- service-role key and scopes every query with .eq('user_id', userId)).
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.circle_extension_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  situation text NOT NULL,                  -- the current decision or situation
  -- the circle the practitioner is currently reasoning from
  current_circle text NOT NULL
    CHECK (current_circle IN ('self', 'household', 'community', 'humanity', 'cosmic')),
  -- the wider circle they extend their reasoning to (route enforces it is wider
  -- than current_circle; the DB records what was chosen)
  extended_circle text NOT NULL
    CHECK (extended_circle IN ('self', 'household', 'community', 'humanity', 'cosmic')),
  extended_reasoning text NOT NULL,         -- reasoning about the situation from the wider circle
  assessment_shift text NOT NULL,           -- what changes in the action assessment when the circle expands
  -- #15 cosmopolitan obligation check — practitioner-authored capture, shown when
  -- the extended circle reaches the fourth circle (humanity) or wider (cosmic).
  -- A subset of the citizenship obligations; NULL/empty when the check did not apply.
  cosmopolitan_obligations text[]
    CHECK (
      cosmopolitan_obligations IS NULL
      OR cosmopolitan_obligations <@ ARRAY['justice', 'mutual_aid', 'honest_dealing']::text[]
    ),
  cosmopolitan_note text,                   -- optional (#15): what is owed / which obligations the action engages
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circle_extension_user_created
  ON public.circle_extension_entries(user_id, created_at DESC);

ALTER TABLE public.circle_extension_entries ENABLE ROW LEVEL SECURITY;

-- Per-verb owner policies + a service-role bypass (matches view_from_above_entries).
DO $$ BEGIN
  CREATE POLICY "Users can view own circle extension entries"
    ON public.circle_extension_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own circle extension entries"
    ON public.circle_extension_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own circle extension entries"
    ON public.circle_extension_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own circle extension entries"
    ON public.circle_extension_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to circle extension"
    ON public.circle_extension_entries FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying)
-- =====================================================================
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'circle_extension_entries'
--   ORDER BY ordinal_position;
--   Expect: id, user_id, situation, current_circle, extended_circle,
--           extended_reasoning, assessment_shift, cosmopolitan_obligations,
--           cosmopolitan_note, created_at.
--
-- SELECT relrowsecurity FROM pg_class WHERE oid = 'public.circle_extension_entries'::regclass;
--   Expect: true (RLS enabled).
--
-- SELECT policyname FROM pg_policies WHERE tablename = 'circle_extension_entries';
--   Expect: the 5 policies above.
--
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.circle_extension_entries'::regclass AND contype = 'c';
--   Expect: CHECK constraints on current_circle, extended_circle, cosmopolitan_obligations.

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- DROP TABLE IF EXISTS public.circle_extension_entries;  -- drops its policies + index too
