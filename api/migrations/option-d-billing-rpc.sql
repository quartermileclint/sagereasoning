-- =============================================================================
-- Option D Billing Model — increment_api_usage RPC extension
-- Created: at Option D build session (paired with option-d-billing-schema.sql)
-- Run in: Supabase Dashboard → SQL Editor → New Query (AFTER applying
--         option-d-billing-schema.sql so loop_billing_events exists).
--
-- Purpose: Extend the existing 5-arg increment_api_usage RPC with optional
--          Option D billing params (loop_id, surface, anthropic_cost_cents,
--          base/threshold/overage/total cents, overage_fired, internal_calls,
--          models_used, token counts, agent_id). When p_loop_id is provided,
--          the RPC ALSO writes a loop_billing_events row + increments the
--          new api_key_usage aggregate columns (loop_count,
--          anthropic_cost_cents, billed_cents, overage_count, overage_cents)
--          in the SAME transaction. PL/pgSQL function = one implicit
--          transaction — both writes succeed or both fail together (KG1
--          rule 2 + Decision E's transactional posture).
--
-- Backward compatibility: all Option D params have DEFAULT values, so the
-- existing 5-arg callsite (validateApiKey in security.ts) continues to work
-- unchanged. Vercel deploy ordering: apply this SQL in Supabase BEFORE
-- pushing the new TypeScript code (the old code keeps using the 5-arg form
-- against the new function signature — works because of DEFAULTs).
--
-- Hard-error posture on duplicate (api_key_id, loop_id): the INSERT into
-- loop_billing_events will fail with UNIQUE constraint violation if a
-- wrapper attempts to bill the same loop_id twice. Application layer
-- (route.ts) catches the SQLSTATE 23505 and returns 400 with a clear error
-- message per Step 1(e) election (Decision A's PR7 deferral of multi-HTTP-
-- request loops is enforced by the constraint, not silently bypassed).
--
-- Compliance: CR-2026-Q2-v4
-- Rules served: R0, R5 (primary — prospective 2x ratio enforced by formula),
--               R9, R10, R18a, AC7 (RPC signature change), AC8, AC10, KG1
--               (transactional posture; no fire-and-forget).
--
-- Source design: /adopted/billing-model-design.md Decision E
-- =============================================================================

-- Drop the existing 5-arg function so we can recreate with extended params.
-- Idempotent — if the function doesn't exist (fresh DB), the DROP is a no-op.
DROP FUNCTION IF EXISTS public.increment_api_usage(UUID, INTEGER, INTEGER, INTEGER, TEXT);


CREATE OR REPLACE FUNCTION public.increment_api_usage(
  -- Existing params (backward-compatible — same names, same types, same order)
  p_api_key_id UUID,
  p_year INTEGER,
  p_month INTEGER,
  p_day INTEGER,
  p_endpoint TEXT,

  -- Option D params (all optional; old callers omit and get default behaviour)
  p_loop_id UUID DEFAULT NULL,
  p_surface TEXT DEFAULT NULL,                -- 'api_reason' | 'api_score_iterate' | 'wrapper_internal'
  p_anthropic_cost_cents INTEGER DEFAULT 0,
  p_base_cents INTEGER DEFAULT 0,
  p_threshold_cents INTEGER DEFAULT 0,
  p_overage_cents INTEGER DEFAULT 0,
  p_overage_fired BOOLEAN DEFAULT FALSE,
  p_total_cents INTEGER DEFAULT 0,
  p_internal_calls INTEGER DEFAULT 1,
  p_models_used TEXT[] DEFAULT NULL,
  p_total_input_tokens INTEGER DEFAULT 0,
  p_total_output_tokens INTEGER DEFAULT 0,
  p_agent_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  new_monthly_total INTEGER,
  new_daily_total INTEGER,
  monthly_limit INTEGER,
  daily_limit INTEGER,
  new_monthly_loops INTEGER       -- NEW: post-increment loop_count for the month bucket
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly INTEGER;
  v_daily INTEGER;
  v_m_limit INTEGER;
  v_d_limit INTEGER;
  v_monthly_loops INTEGER;
BEGIN
  -- Upsert usage row for this month (preserves existing behaviour).
  INSERT INTO public.api_key_usage (api_key_id, year, month, current_day)
  VALUES (p_api_key_id, p_year, p_month, p_day)
  ON CONFLICT (api_key_id, year, month) DO NOTHING;

  -- Atomic increment of the per-call aggregates (preserved for rollback
  -- safety per Decision F + Step 1(c)) AND the Option D loop-level aggregates
  -- (only incremented when p_loop_id is provided AND p_total_cents > 0).
  --
  -- When p_loop_id is NULL (legacy callers — pre-Option-D callsite shape),
  -- only the existing per-call counters increment. loop_count and the Option
  -- D money columns stay at zero. When p_loop_id is provided, both increment
  -- atomically.
  UPDATE public.api_key_usage SET
    -- Existing per-call counters (preserved per Step 1(c)).
    total_calls = total_calls + 1,
    guardrail_calls     = guardrail_calls     + CASE WHEN p_endpoint = 'guardrail'      THEN 1 ELSE 0 END,
    score_iterate_calls = score_iterate_calls + CASE WHEN p_endpoint = 'score_iterate'  THEN 1 ELSE 0 END,
    agent_baseline_calls = agent_baseline_calls + CASE WHEN p_endpoint = 'agent_baseline' THEN 1 ELSE 0 END,
    other_calls         = other_calls         + CASE WHEN p_endpoint = 'other'          THEN 1 ELSE 0 END,
    daily_calls = CASE
      WHEN current_day = p_day THEN daily_calls + 1
      ELSE 1
    END,
    current_day = p_day,

    -- Option D loop-level aggregates (per Decision E).
    loop_count           = loop_count           + CASE WHEN p_loop_id IS NOT NULL THEN 1 ELSE 0 END,
    anthropic_cost_cents = anthropic_cost_cents + COALESCE(p_anthropic_cost_cents, 0),
    billed_cents         = billed_cents         + COALESCE(p_total_cents, 0),
    overage_count        = overage_count        + CASE WHEN p_overage_fired = TRUE THEN 1 ELSE 0 END,
    overage_cents        = overage_cents        + COALESCE(p_overage_cents, 0),

    updated_at = NOW()
  WHERE api_key_id = p_api_key_id AND year = p_year AND month = p_month
  RETURNING total_calls, daily_calls, loop_count
  INTO v_monthly, v_daily, v_monthly_loops;

  -- Fetch limits from api_keys.
  SELECT k.monthly_limit, k.daily_limit
  INTO v_m_limit, v_d_limit
  FROM public.api_keys k
  WHERE k.id = p_api_key_id;

  -- Update last_used_at on the key (preserves existing behaviour).
  UPDATE public.api_keys SET last_used_at = NOW()
  WHERE id = p_api_key_id;

  -- Option D ledger write — only when p_loop_id provided.
  -- Same PL/pgSQL transaction as the aggregate increments above; the two
  -- writes succeed together or fail together (KG1 rule 2 + Decision E).
  -- If a wrapper attempts to bill the same (api_key_id, loop_id) twice,
  -- this INSERT raises SQLSTATE 23505 (unique_violation); the calling
  -- code catches it and returns HTTP 400 per Step 1(e) election.
  IF p_loop_id IS NOT NULL THEN
    INSERT INTO public.loop_billing_events (
      loop_id,
      api_key_id,
      agent_id,
      surface,
      base_cents,
      threshold_cents,
      anthropic_cost_cents,
      overage_fired,
      overage_cents,
      total_cents,
      internal_calls,
      models_used,
      total_input_tokens,
      total_output_tokens
    ) VALUES (
      p_loop_id,
      p_api_key_id,
      p_agent_id,
      COALESCE(p_surface, 'wrapper_internal'),
      p_base_cents,
      p_threshold_cents,
      p_anthropic_cost_cents,
      p_overage_fired,
      p_overage_cents,
      p_total_cents,
      p_internal_calls,
      p_models_used,
      p_total_input_tokens,
      p_total_output_tokens
    );
  END IF;

  RETURN QUERY SELECT v_monthly, v_daily, v_m_limit, v_d_limit, v_monthly_loops;
END;
$$;


-- ---------------------------------------------------------------------------
-- VERIFY — confirm the function exists with the extended signature.
-- ---------------------------------------------------------------------------

-- The function should report 18 parameters (5 existing + 13 Option D).
SELECT routine_name,
       (SELECT COUNT(*) FROM information_schema.parameters
        WHERE specific_schema = r.specific_schema
          AND specific_name = r.specific_name
          AND parameter_mode = 'IN') AS input_params
FROM information_schema.routines r
WHERE routine_schema = 'public'
  AND routine_name = 'increment_api_usage';
-- Expected: increment_api_usage | 18
