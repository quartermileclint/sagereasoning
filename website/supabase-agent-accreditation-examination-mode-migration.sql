-- ============================================================
-- SageReasoning — Gate-1 surface honesty (Arc 1): examination_mode column
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Adds the pre/post-decision TIMING distinction to the accreditation
-- credential, per the Option-2 honest-differentiation decision
-- (D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION, 2026-06-20)
-- and the Arc 1 build scope
-- (/drafts/sage-practice-examination-mode-credential-build-scope.md).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. The column is NULLABLE — existing rows
-- read back NULL (the honest "examination mode unstated" state) until their
-- next write sets an honest value. Rollback: DROP COLUMN (+ the CHECK).
--
-- SEPARATE AXIS from coverage_status (D3): coverage_status is coverage BREADTH
-- (was every consequential action examined over the window); examination_mode
-- is TIMING (was the examination fired before or after the agent's decision).
-- We do NOT repurpose coverage_status:'continuous' for timing.
--
-- examination_mode vocabulary:
--   pre_decision_harness — examined by an operator-issued Gate-1 harness BEFORE
--                          the agent reasoned. SERVER-COMPOSED; reachable ONLY
--                          when the writing credential carries the operator-set
--                          pre-decision marker (api_keys.credential_provenance,
--                          admin-mint only — a consumer cannot self-issue it).
--                          An ATTESTATION, not a cryptographic proof of timing.
--   post_decision_check  — examined AFTER the agent formed its judgement: an
--                          honest check. The honest label for today's
--                          discretionary API write paths (all of them).
--
-- DARK BUILD NOTE. The application gates this column behind
-- SUBSTRATE_EXAMINATION_MODE_ENABLED. With the flag OFF the column is never
-- written and never read, so applying this migration first (flag still off) is
-- safe and behaviour is byte-identical — apply the migration BEFORE flipping the
-- flag (the M1/M3 ordering lesson). The marker is issued to NO ONE in Arc 1, so
-- every write stamps 'post_decision_check' (honest for today's surfaces) until a
-- genuine pre-decision harness exists to earn 'pre_decision_harness'.
-- ============================================================

-- ------------------------------------------------------------
-- 0. PRE-FLIGHT — run this FIRST and eyeball the current column set so the
--    additive ALTER below introduces no surprises (idempotent regardless).
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
ORDER BY ordinal_position;

-- ------------------------------------------------------------
-- 1. examination_mode — the pre/post-decision timing value (nullable enum)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS examination_mode TEXT;

DO $$ BEGIN
  ALTER TABLE public.agent_accreditation
    ADD CONSTRAINT agent_accreditation_examination_mode_check
    CHECK (examination_mode IS NULL OR
           examination_mode IN ('pre_decision_harness', 'post_decision_check'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. VERIFY — paste the output back to confirm.
-- Expected: one column row (examination_mode text YES) + one constraint row.
-- ============================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
  AND column_name = 'examination_mode';

SELECT conname FROM pg_constraint
WHERE conrelid = 'public.agent_accreditation'::regclass
  AND conname = 'agent_accreditation_examination_mode_check';

-- ------------------------------------------------------------
-- ROLLBACK (if ever needed — note: only safe with the flag OFF):
--   ALTER TABLE public.agent_accreditation
--     DROP CONSTRAINT IF EXISTS agent_accreditation_examination_mode_check;
--   ALTER TABLE public.agent_accreditation
--     DROP COLUMN IF EXISTS examination_mode;
-- ------------------------------------------------------------
