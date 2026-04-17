-- =============================================================================
-- R20a Classifier Cost Tracking — Schema Extension
-- Created: 2026-04-17
-- Purpose: Add classifier cost columns to cost_health_snapshots and create
--          classifier_cost_log table for per-invocation tracking.
--
-- Risk classification: Elevated (schema changes to existing cost tracking)
-- Rollback: DROP TABLE classifier_cost_log; ALTER TABLE cost_health_snapshots
--           DROP COLUMN classifier_cost_cents, DROP COLUMN classifier_to_mentor_ratio;
--
-- Rules served: R5 (cost health), R20a (vulnerable user protections),
--               ADR-R20a-01 D7-b (20% threshold, reopen ADR if exceeded)
--
-- Compliance: CR-2026-Q2-v4
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Extend cost_health_snapshots with classifier cost tracking
-- ---------------------------------------------------------------------------

ALTER TABLE public.cost_health_snapshots
  ADD COLUMN IF NOT EXISTS classifier_cost_cents INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.cost_health_snapshots
  ADD COLUMN IF NOT EXISTS classifier_to_mentor_ratio NUMERIC(6,4);

COMMENT ON COLUMN public.cost_health_snapshots.classifier_cost_cents IS
  'Monthly R20a classifier spend (rule-based + Haiku LLM). ADR-R20a-01 D7-b: reopen ADR if > 20% of mentor-turn cost.';

COMMENT ON COLUMN public.cost_health_snapshots.classifier_to_mentor_ratio IS
  'classifier_cost_cents / mentor_turn_cost_cents. Alert threshold: 0.20 (20%).';


-- ---------------------------------------------------------------------------
-- 2. classifier_cost_log — Per-invocation cost tracking for the R20a pipeline
--    Each row records one classifier run (rule stage + optional LLM stage).
--    Aggregated monthly into cost_health_snapshots.classifier_cost_cents.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.classifier_cost_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which session triggered this classifier run
  session_id      UUID,                   -- mentor session ID (nullable for batch rescoring)

  -- Two-stage cost breakdown
  rule_stage_hit  BOOLEAN NOT NULL,       -- true if rules matched (no LLM needed)
  llm_stage_ran   BOOLEAN NOT NULL DEFAULT false,  -- true if borderline → Haiku called
  llm_input_tokens  INTEGER,              -- Haiku input tokens (null if LLM not called)
  llm_output_tokens INTEGER,              -- Haiku output tokens (null if LLM not called)
  estimated_cost_cents NUMERIC(8,4) NOT NULL DEFAULT 0,  -- total cost for this invocation

  -- Result
  severity_result INTEGER CHECK (severity_result BETWEEN 0 AND 3),  -- 0=clear, 1=mild, 2=moderate, 3=acute
  flag_written    BOOLEAN NOT NULL DEFAULT false,  -- true if a vulnerability_flag row was created

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for monthly aggregation queries
CREATE INDEX IF NOT EXISTS idx_classifier_cost_created
  ON public.classifier_cost_log(created_at DESC);

-- Index for session lookups (debugging individual sessions)
CREATE INDEX IF NOT EXISTS idx_classifier_cost_session
  ON public.classifier_cost_log(session_id)
  WHERE session_id IS NOT NULL;

-- No RLS — admin-only operational table (service role access only)
-- Matches cost_health_snapshots pattern: internal data, not user-facing


-- ---------------------------------------------------------------------------
-- 3. Aggregation function — Monthly classifier cost summary
--    Called by /api/billing/usage-summary to compute classifier metrics.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_classifier_cost_summary(
  p_period_start DATE,
  p_period_end DATE
)
RETURNS TABLE (
  total_invocations   BIGINT,
  rule_only_count     BIGINT,
  llm_invocations     BIGINT,
  total_cost_cents    NUMERIC,
  avg_cost_per_run    NUMERIC,
  flags_written       BIGINT,
  severity_3_count    BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT                                          AS total_invocations,
    COUNT(*) FILTER (WHERE rule_stage_hit AND NOT llm_stage_ran)::BIGINT AS rule_only_count,
    COUNT(*) FILTER (WHERE llm_stage_ran)::BIGINT             AS llm_invocations,
    COALESCE(SUM(estimated_cost_cents), 0)                    AS total_cost_cents,
    CASE WHEN COUNT(*) > 0
      THEN ROUND(SUM(estimated_cost_cents) / COUNT(*), 4)
      ELSE 0
    END                                                       AS avg_cost_per_run,
    COUNT(*) FILTER (WHERE flag_written)::BIGINT              AS flags_written,
    COUNT(*) FILTER (WHERE severity_result = 3)::BIGINT       AS severity_3_count
  FROM public.classifier_cost_log
  WHERE created_at >= p_period_start::TIMESTAMPTZ
    AND created_at < (p_period_end + INTERVAL '1 day')::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql STABLE;
