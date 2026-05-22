-- ============================================================
-- SageReasoning — Sage Reflect A1 (PR7): cross-session context columns
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Adds the two cleartext scalars the open-path cross-session read needs, written at
-- completion (session-store.persistCompletion → deriveCrossSessionScalars):
--   • complexity                int      — the completed turn count (== the engine's
--                                          currentComplexity; FD-R2 input).
--   • calibration_all_correct   boolean  — Q4 calibration reviewed AND clean
--                                          (verdicts_reviewed > 0 AND
--                                          discrepancies_found = 0); the FD-R4
--                                          deference-streak input.
-- Plus a composite index supporting the prior-3 read + the streak walk
--   (WHERE agent_id = $1 AND current_step = 'complete' ORDER BY completed_at DESC).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROPs at the foot
-- (commented). Both columns are NULLABLE — existing rows (and rows that complete via
-- the Zone-3 block path) carry NULL; the reader maps NULL complexity → 0 and treats
-- NULL calibration_all_correct as "not all-correct" (streak-breaking). No backfill.
--
-- WHY CLEARTEXT (R17b intact): total_failures + q1_clean are derived from the
-- already-plaintext log arrays; complexity + calibration_all_correct are
-- non-intimate operational scalars. The open-path read therefore never decrypts a
-- prior session's intimate response blob.
--
-- Risk: ELEVATED under 0d-ii (change to an existing table). No data migration; no
-- existing column altered; reversible via DROP COLUMN.
-- ============================================================

ALTER TABLE public.sage_reflect_sessions ADD COLUMN IF NOT EXISTS complexity int;
ALTER TABLE public.sage_reflect_sessions ADD COLUMN IF NOT EXISTS calibration_all_correct boolean;

-- Non-negative guard on complexity (idempotent). NULL passes.
DO $$ BEGIN
  ALTER TABLE public.sage_reflect_sessions
    ADD CONSTRAINT sage_reflect_sessions_complexity_nonneg_check
    CHECK (complexity IS NULL OR complexity >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Supports the prior-3 read + streak walk (agent + completed, newest-first).
CREATE INDEX IF NOT EXISTS sage_reflect_sessions_agent_completed_idx
  ON public.sage_reflect_sessions (agent_id, completed_at DESC);

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

-- 1. The two new columns exist (expect complexity int, calibration_all_correct boolean).
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sage_reflect_sessions'
  AND column_name IN ('complexity', 'calibration_all_correct')
ORDER BY column_name;

-- 2. The composite index exists.
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'sage_reflect_sessions'
  AND indexname = 'sage_reflect_sessions_agent_completed_idx';

-- 3. (Post-traffic) the cross-session scalars for a test agent's completed rows.
-- SELECT session_id, complexity, calibration_all_correct, completed_at
-- FROM public.sage_reflect_sessions
-- WHERE agent_id = '<agent>' AND current_step = 'complete'
-- ORDER BY completed_at DESC LIMIT 3;

-- ============================================================
-- ROLLBACK — DO NOT RUN unless rolling A1 back.
-- ============================================================
--   ALTER TABLE public.sage_reflect_sessions DROP COLUMN IF EXISTS complexity;
--   ALTER TABLE public.sage_reflect_sessions DROP COLUMN IF EXISTS calibration_all_correct;
--   DROP INDEX IF EXISTS public.sage_reflect_sessions_agent_completed_idx;
