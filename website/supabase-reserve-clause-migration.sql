-- =====================================================================
-- Reserve clause (hupexairesis) — human-practitioner tool (Remaining Principles #10-human)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot.
-- Creates the user-scoped table behind the /hupexairesis practitioner tool: a
-- single structured prompt at the action stage — "What is the outcome you are
-- pursuing, and what is your prepared response if that outcome does not occur?" —
-- surfacing the conflation of commitment-to-the-action (up to us) with
-- commitment-to-the-outcome (not up to us).
--
-- Human-only. This table + its /api/mentor/hupexairesis route never touch
-- /api/reason, the signed assessment, or the substrate engine. It is NOT in the
-- /api/reason import graph or the frozen capture set, so it leaves the 7-day
-- false-hold measurement untouched.
--
-- Mirrors the premeditatio_entries / oikeiosis_reflections user-scoped pattern:
-- uuid PK, user_id FK → auth.users ON DELETE CASCADE, per-verb RLS on
-- auth.uid() = user_id + a service_role FOR ALL policy (the route uses the
-- service-role key and scopes every query with .eq('user_id', userId)).
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.reserve_clause_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_context text,                          -- optional: the decision/action at hand
  outcome_pursued text NOT NULL,                -- the outcome you are pursuing
  prepared_response text NOT NULL,              -- your prepared response if the outcome does not occur
  separates_action_from_outcome boolean,        -- quality-gate result (NULL if the gate could not run)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reserve_clause_user_created
  ON public.reserve_clause_entries(user_id, created_at DESC);

ALTER TABLE public.reserve_clause_entries ENABLE ROW LEVEL SECURITY;

-- Per-verb owner policies + a service-role bypass (matches premeditatio_entries).
DO $$ BEGIN
  CREATE POLICY "Users can view own reserve clause entries"
    ON public.reserve_clause_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own reserve clause entries"
    ON public.reserve_clause_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own reserve clause entries"
    ON public.reserve_clause_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own reserve clause entries"
    ON public.reserve_clause_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to reserve clause"
    ON public.reserve_clause_entries FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying)
-- =====================================================================
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'reserve_clause_entries'
--   ORDER BY ordinal_position;
--   Expect: id, user_id, action_context, outcome_pursued, prepared_response,
--           separates_action_from_outcome, created_at.
--
-- SELECT relrowsecurity FROM pg_class WHERE oid = 'public.reserve_clause_entries'::regclass;
--   Expect: true (RLS enabled).
--
-- SELECT policyname FROM pg_policies WHERE tablename = 'reserve_clause_entries';
--   Expect: the 5 policies above.

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- DROP TABLE IF EXISTS public.reserve_clause_entries;  -- drops its policies + index too
