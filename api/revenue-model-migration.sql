-- ============================================================
-- SageReasoning — Revenue Model Migration
-- Updates free tier defaults and prepares paid tier structure
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Date: 2026-03-29
-- ============================================================

-- ============================================================
-- 1. UPDATE DEFAULT VALUES for new API keys
-- New keys will be created with free tier limits:
--   monthly_limit: 30 (1/day with buffer)
--   daily_limit: 1 (evaluation only)
--   max_chain_iterations: 1 (see score, can't iterate)
-- ============================================================

ALTER TABLE public.api_keys
  ALTER COLUMN monthly_limit SET DEFAULT 30;

ALTER TABLE public.api_keys
  ALTER COLUMN daily_limit SET DEFAULT 1;

ALTER TABLE public.api_keys
  ALTER COLUMN max_chain_iterations SET DEFAULT 1;

-- ============================================================
-- 2. UPDATE EXISTING FREE-TIER KEYS to new limits
-- Any keys already issued at old defaults (667/50/20) get
-- reduced to new free tier limits.
-- ============================================================

UPDATE public.api_keys
SET
  monthly_limit = 30,
  daily_limit = 1,
  max_chain_iterations = 1
WHERE tier = 'free';

-- ============================================================
-- 3. PAID TIER REFERENCE DEFAULTS
-- When issuing a paid key (via admin panel or future Stripe webhook),
-- use these values:
--
--   tier: 'paid'
--   monthly_limit: 10000  (configurable per customer)
--   daily_limit: 500      (configurable per customer)
--   max_chain_iterations: 3
--
-- Pricing: 200% of Anthropic API cost per call
-- Billing: Monthly invoice based on api_key_usage.total_calls
-- ============================================================

-- No schema changes needed for paid tier — the existing columns
-- support configurable limits per key. The admin panel already
-- allows creating keys with custom values.

-- ============================================================
-- 4. VERIFY
-- ============================================================

SELECT id, key_prefix, label, tier, monthly_limit, daily_limit, max_chain_iterations, is_active
FROM public.api_keys
ORDER BY created_at DESC;
