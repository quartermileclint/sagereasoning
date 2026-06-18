-- ============================================================
-- SageReasoning — sage_reflect_sessions A1 columns backfill (DRIFT FIX)
-- Run in: Supabase Dashboard → SQL Editor → New Query.  TEST first, then prod.
-- ============================================================
-- Adds the two A1 (PR7) cross-session-scalar columns that persistCompletion
-- writes on EVERY reflection completion but that the original
-- sage_reflect_sessions CREATE never included.
--
-- THE BUG (found by the Sage Practice Benchmark v1 Leg-D run, 2026-06-16):
--   session-store.ts deriveCrossSessionScalars() returns
--   { complexity: int, calibration_all_correct: bool }, and persistCompletion()
--   spreads it (`...cross`) into the UPDATE on sage_reflect_sessions. These two
--   columns exist in NO migration, so PostgREST rejects the completion UPDATE
--   (PGRST204 "could not find the 'complexity' column"), persistCompletion returns
--   ok:false, and the route maps it to 503 — on EVERY reflection completion, for
--   EVERY agent. The Q1–Q6 question sequence succeeds (progress-persist writes only
--   existing columns); only the terminal completion fails. Latent since the A1/PR7
--   change because reflect completion was never exercised in production until the
--   benchmark hit it. Same class as the M3-CI-11 K1-coverage drift.
--
-- THE FIX: add the two columns. Nullable (NULL until completion, like exit_path /
--   rs_class / completed_at). The application code is already correct — only the
--   schema drifted, so NO code deploy is needed; this ALTER alone restores
--   completion.
--
-- ADDITIVE + IDEMPOTENT + REVERSIBLE. Modifies no existing data. No RLS / auth /
--   perimeter / policy change. Safe to re-run.
-- ============================================================

ALTER TABLE public.sage_reflect_sessions
  ADD COLUMN IF NOT EXISTS complexity integer,
  ADD COLUMN IF NOT EXISTS calibration_all_correct boolean;

-- ============================================================
-- VERIFY — expect exactly 2 rows:
--   calibration_all_correct | boolean | YES
--   complexity              | integer | YES
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sage_reflect_sessions'
  AND column_name IN ('complexity', 'calibration_all_correct')
ORDER BY column_name;

-- ============================================================
-- ROLLBACK — DO NOT RUN unless reverting this fix.
-- ============================================================
--   ALTER TABLE public.sage_reflect_sessions
--     DROP COLUMN IF EXISTS complexity,
--     DROP COLUMN IF EXISTS calibration_all_correct;
