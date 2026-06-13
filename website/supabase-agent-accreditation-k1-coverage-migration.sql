-- ============================================================
-- SageReasoning — CI-11: K1 coverage-status fields (first slice)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Implements the first slice of the K1 ADR
-- (/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md, Accepted
-- under D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-2026-05-26) per the
-- approved mechanism-correction build plan item CI-11
-- (D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12). Built at the M3
-- accreditation session, 2026-06-13.
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. All three columns NULLABLE — existing
-- rows read back NULL (the honest "pre-K1, coverage unstated" state) until
-- their next write sets honest values. Rollback: DROP COLUMN ×3.
--
-- FIRST SLICE ONLY: the columns + honest initial values. The full K1 state
-- machine (suspend/resume on guardrail toggling) is NOT this migration — it
-- needs the hook/plugin surface and stays in the Sage Practice spec track.
--
-- coverage_status vocabulary is VERBATIM from the K1 ADR's state machine:
--   continuous          — deterministic hook examined every consequential
--                         action over the window (the ONLY state that earns a
--                         "continuously examined" claim; requires the hook —
--                         unreachable from today's write paths)
--   suspended           — guardrail hook off; prior examination real, current
--                         reasoning unexamined (state-machine slice, later)
--   resumed_unverified  — hook returned; fresh pass required before
--                         continuous again (state-machine slice, later)
--   expired             — wall-clock backstop crossed without renewal
--   agent_elected       — earned via DISCRETIONARY submission (the agent chose
--                         which actions to submit); inherently partial; never
--                         continuous. The honest label for today's API write
--                         paths (the wrapper POST and the Sage Reflect feed).
-- ============================================================

-- ------------------------------------------------------------
-- 0. PRE-FLIGHT — run this FIRST and eyeball the current column set so the
--    additive ALTERs below introduce no surprises (the migration is idempotent
--    regardless, but this confirms the live shape).
-- ------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
ORDER BY ordinal_position;

-- ------------------------------------------------------------
-- 1. coverage_status — the K1 state-machine value (nullable enum)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS coverage_status TEXT;

DO $$ BEGIN
  ALTER TABLE public.agent_accreditation
    ADD CONSTRAINT agent_accreditation_coverage_status_check
    CHECK (coverage_status IS NULL OR
           coverage_status IN
           ('continuous', 'suspended', 'resumed_unverified',
            'expired', 'agent_elected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 2. monitored_since — when the examined window began (nullable)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS monitored_since TIMESTAMPTZ;

-- ------------------------------------------------------------
-- 3. credential_basis — the K1 auditable scope statement (nullable free text;
--    composed SERVER-SIDE by composeK1InitialCoverage — never accepted from
--    the writing consumer)
-- ------------------------------------------------------------
ALTER TABLE public.agent_accreditation
  ADD COLUMN IF NOT EXISTS credential_basis TEXT;

-- ============================================================
-- 4. VERIFY — paste the output back to confirm.
-- Expected: three rows (coverage_status text YES; credential_basis text YES;
-- monitored_since timestamp with time zone YES) + one constraint row.
-- ============================================================

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agent_accreditation'
  AND column_name IN ('coverage_status', 'monitored_since', 'credential_basis')
ORDER BY column_name;

SELECT conname FROM pg_constraint
WHERE conrelid = 'public.agent_accreditation'::regclass
  AND conname = 'agent_accreditation_coverage_status_check';
