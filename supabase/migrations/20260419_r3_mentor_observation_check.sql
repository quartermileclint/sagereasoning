-- =============================================================================
-- R3 mentor_observation length backstop — CHECK constraint
-- Created: 2026-04-19
-- Purpose: Schema-level enforcement that mentor_interactions.mentor_observation
--          is either NULL or <= 500 chars. Backstop against any future writer
--          that bypasses the R3 code-comment guardrail and attempts to store
--          raw LLM text (typically multi-hundred chars) in this column.
--
--          R3's validated-observation pass-through uses structured_observation
--          from the LLM, which the reflect prompt constrains to 50-250 chars.
--          500 is comfortable headroom (2x margin) while still catching the
--          pre-2026-04-13 contamination pattern (raw sage_perspective text,
--          typically 400-1000+ chars).
--
-- Risk classification: Standard (schema touch, not auth/session/cookie/deploy)
-- Rollback: ALTER TABLE public.mentor_interactions
--             DROP CONSTRAINT IF EXISTS mentor_observation_length_check;
--
-- Pre-flight required: zero rows where char_length(mentor_observation) > 500.
--   Verified 2026-04-19 session 12 after nulling one pre-R3 contaminated row
--   (id 683889e1-8300-426e-92e3-9eff814232d8, created 2026-04-12, 525 chars).
--
-- Rules served: R3 (validated pass-through guardrail, schema-level backstop),
--               KG8 (hub-label consistency — no direct relation, but any
--               mentor_interactions change touches the same table).
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Add the CHECK constraint (idempotent — skip if already present)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'mentor_interactions'
      AND constraint_name = 'mentor_observation_length_check'
  ) THEN
    ALTER TABLE public.mentor_interactions
      ADD CONSTRAINT mentor_observation_length_check
      CHECK (mentor_observation IS NULL OR char_length(mentor_observation) <= 500);
  END IF;
END
$$;


-- ---------------------------------------------------------------------------
-- 2. Document the constraint's purpose on the column
-- ---------------------------------------------------------------------------

COMMENT ON COLUMN public.mentor_interactions.mentor_observation IS
  'R3 (2026-04-19): structured observation text from mentor_observations_structured, '
  'validated by logMentorObservation() before write. Length backstop: CHECK constraint '
  'mentor_observation_length_check enforces <= 500 chars. NEVER write raw LLM text here.';
