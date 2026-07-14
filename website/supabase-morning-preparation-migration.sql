-- =====================================================================
-- Morning preparation (the morning examination) — human-practitioner tool
-- Remaining Principles #8 (evening→morning examination; the morning pole)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot.
-- Creates the user-scoped table behind the /morning practitioner tool: the Stoic
-- morning orientation of the ruling faculty (hegemonikon) BEFORE the day's
-- impressions arrive — the morning pole that completes the daily practice cycle
-- alongside the evening Sage Reflect. Distinct from the premeditatio of specific
-- adversities: this is Marcus Aurelius's daily preparation (what people will I
-- meet, what virtues will I need, what impressions should I expect and how should
-- I receive them), encoded as the mentor's three questions:
--   1. roles_active            — the roles active today + the kathekonta they generate
--   2. expected_impressions    — the impressions likely to arrive + which risk hasty assent
--   3. prepared_virtue_response— the virtue response to have prepared
-- The three answers together are the daily orientation record (the row).
--
-- Human-only. This table + its /api/mentor/morning route never touch /api/reason,
-- the signed assessment, or the substrate engine. It imports NO substrate /
-- trust-core / kathekon-engagement / Gate-1 / reflect / sage-reflect module, so it
-- is NOT in the /api/reason import graph or the frozen capture set and leaves the
-- 7-day false-hold measurement untouched. The "the evening assesses whether the
-- morning intention held" pairing is CONCEPTUAL only — there is no code coupling
-- to the reflect engine.
--
-- Mirrors the view_from_above_entries / reserve_clause_entries / premeditatio_entries
-- user-scoped pattern: uuid PK, user_id FK → auth.users ON DELETE CASCADE, per-verb
-- RLS on auth.uid() = user_id + a service_role FOR ALL policy (the route uses the
-- service-role key and scopes every query with .eq('user_id', userId)).
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.morning_preparation_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roles_active text NOT NULL,               -- the roles active today + the kathekonta they generate
  expected_impressions text NOT NULL,       -- the impressions likely to arrive + which risk hasty assent
  prepared_virtue_response text NOT NULL,   -- the virtue response to have prepared
  -- quality-gate classification (NULL if the gate could not run). The LLM is
  -- restricted to classification only; the tailored messages are deterministic.
  --   'prepared' — a concrete, situation-anchored disposition
  --   'vague'    — a generic aspiration, not anchored to today's roles/impressions
  preparation_quality text
    CHECK (preparation_quality IN ('prepared', 'vague')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_morning_preparation_user_created
  ON public.morning_preparation_entries(user_id, created_at DESC);

ALTER TABLE public.morning_preparation_entries ENABLE ROW LEVEL SECURITY;

-- Per-verb owner policies + a service-role bypass (matches view_from_above_entries).
DO $$ BEGIN
  CREATE POLICY "Users can view own morning preparation entries"
    ON public.morning_preparation_entries FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own morning preparation entries"
    ON public.morning_preparation_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own morning preparation entries"
    ON public.morning_preparation_entries FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own morning preparation entries"
    ON public.morning_preparation_entries FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access to morning preparation"
    ON public.morning_preparation_entries FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying)
-- =====================================================================
-- SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'morning_preparation_entries'
--   ORDER BY ordinal_position;
--   Expect: id, user_id, roles_active, expected_impressions,
--           prepared_virtue_response, preparation_quality, created_at.
--
-- SELECT relrowsecurity FROM pg_class WHERE oid = 'public.morning_preparation_entries'::regclass;
--   Expect: true (RLS enabled).
--
-- SELECT policyname FROM pg_policies WHERE tablename = 'morning_preparation_entries';
--   Expect: the 5 policies above.
--
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.morning_preparation_entries'::regclass AND contype = 'c';
--   Expect: a CHECK constraint on preparation_quality.

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- DROP TABLE IF EXISTS public.morning_preparation_entries;  -- drops its policies + index too
