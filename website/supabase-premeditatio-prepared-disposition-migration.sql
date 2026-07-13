-- =====================================================================
-- Premeditatio — "prepared disposition" exercise (Remaining Principles #7-human)
-- =====================================================================
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROPs at the foot
-- (commented). Extends the LIVE premeditatio_entries table (Gap 3) with a second
-- exercise mode: the mentor's premeditatio-as-tool — name a future adversity,
-- apply the control filter (what IS / is NOT up to me), identify the virtue the
-- scenario calls for, and record a "prepared disposition" (not a plan; a
-- disposition the later reflection can reference).
--
-- All new columns are NULLABLE. No backfill. Existing weekly-reflection rows stay
-- valid (their new columns read NULL; the app treats a NULL entry_kind as the
-- original weekly reflection).
--
-- Two existing NOT NULL columns are relaxed to NULLABLE (false_impression,
-- correct_judgement) so a 'prepared_disposition' entry — which has no analogue
-- for those two weekly-specific fields — can omit them. This does NOT invalidate
-- any existing row (every existing row already has a value); the per-mode field
-- requirements are enforced at the application layer (route.ts). anticipated_event
-- stays NOT NULL — both modes name a specific scenario. DROP NOT NULL is reversible
-- via SET NOT NULL (see the foot).
--
-- Boundary note (Remaining Principles build plan §4/§5): premeditatio_entries is a
-- human-practitioner table. It is NOT in the /api/reason import graph or the frozen
-- capture set, so this migration leaves the 7-day false-hold measurement untouched.
--
-- Run in the Supabase SQL Editor (TEST first, then Production) — founder-walked
-- per PR17/AC7.
-- =====================================================================

-- --- New columns (all additive, nullable) ----------------------------

-- Discriminator: NULL or 'weekly_reflection' => the original Gap-3 exercise;
-- 'prepared_disposition' => the #7-human premeditatio-as-tool exercise.
ALTER TABLE public.premeditatio_entries
  ADD COLUMN IF NOT EXISTS entry_kind text;

-- The control filter (dichotomy of control).
ALTER TABLE public.premeditatio_entries
  ADD COLUMN IF NOT EXISTS within_control text;   -- what IS up to me in this scenario
ALTER TABLE public.premeditatio_entries
  ADD COLUMN IF NOT EXISTS outside_control text;  -- what is NOT up to me

-- The virtue the scenario calls for, and how to embody it.
ALTER TABLE public.premeditatio_entries
  ADD COLUMN IF NOT EXISTS virtue_domain text;    -- wisdom | justice | courage | temperance
ALTER TABLE public.premeditatio_entries
  ADD COLUMN IF NOT EXISTS virtue_response text;  -- how the virtue is embodied here

-- The prepared disposition itself — "not a plan; a disposition."
ALTER TABLE public.premeditatio_entries
  ADD COLUMN IF NOT EXISTS prepared_disposition text;

-- --- Relax the two weekly-only NOT NULL columns ----------------------
-- (Safe: no existing row is invalidated; per-mode requirements enforced in route.ts.)
ALTER TABLE public.premeditatio_entries
  ALTER COLUMN false_impression DROP NOT NULL;
ALTER TABLE public.premeditatio_entries
  ALTER COLUMN correct_judgement DROP NOT NULL;

-- --- Idempotent CHECK constraints (vocabulary guards) ----------------
-- ADD CONSTRAINT has no IF NOT EXISTS; wrap in a DO block that swallows the
-- duplicate_object error (house style — see supabase-sage-reflect-a1-*).

DO $$ BEGIN
  ALTER TABLE public.premeditatio_entries
    ADD CONSTRAINT premeditatio_entries_entry_kind_check
    CHECK (entry_kind IS NULL OR entry_kind IN ('weekly_reflection', 'prepared_disposition'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.premeditatio_entries
    ADD CONSTRAINT premeditatio_entries_virtue_domain_check
    CHECK (virtue_domain IS NULL OR virtue_domain IN ('wisdom', 'justice', 'courage', 'temperance'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- VERIFY (run after applying; expect the rows below)
-- =====================================================================
-- SELECT column_name, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'premeditatio_entries'
--     AND column_name IN ('entry_kind','within_control','outside_control',
--                         'virtue_domain','virtue_response','prepared_disposition',
--                         'false_impression','correct_judgement')
--   ORDER BY column_name;
--   Expect: the 6 new columns present + is_nullable = 'YES' for all 8 listed.
--
-- SELECT conname FROM pg_constraint
--   WHERE conrelid = 'public.premeditatio_entries'::regclass
--     AND conname IN ('premeditatio_entries_entry_kind_check',
--                     'premeditatio_entries_virtue_domain_check');
--   Expect: both constraint names present.

-- =====================================================================
-- ROLLBACK (reversible — run to undo this migration)
-- =====================================================================
-- ALTER TABLE public.premeditatio_entries DROP CONSTRAINT IF EXISTS premeditatio_entries_entry_kind_check;
-- ALTER TABLE public.premeditatio_entries DROP CONSTRAINT IF EXISTS premeditatio_entries_virtue_domain_check;
-- ALTER TABLE public.premeditatio_entries DROP COLUMN IF EXISTS prepared_disposition;
-- ALTER TABLE public.premeditatio_entries DROP COLUMN IF EXISTS virtue_response;
-- ALTER TABLE public.premeditatio_entries DROP COLUMN IF EXISTS virtue_domain;
-- ALTER TABLE public.premeditatio_entries DROP COLUMN IF EXISTS outside_control;
-- ALTER TABLE public.premeditatio_entries DROP COLUMN IF EXISTS within_control;
-- ALTER TABLE public.premeditatio_entries DROP COLUMN IF EXISTS entry_kind;
-- -- Re-assert the original NOT NULLs ONLY if no 'prepared_disposition' rows exist
-- -- (they legitimately carry NULL there); otherwise leave nullable.
-- -- ALTER TABLE public.premeditatio_entries ALTER COLUMN false_impression SET NOT NULL;
-- -- ALTER TABLE public.premeditatio_entries ALTER COLUMN correct_judgement SET NOT NULL;
