-- ============================================================
-- SageReasoning — API Key & Usage Metering Schema
-- Minimum viable cost protection, bridges to Stripe
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. API KEYS
-- Issued to agent developers; never stored in plaintext
-- ============================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Key stored as SHA-256 hex hash (never plaintext)
  -- Format of raw key: sr_live_<32 random hex chars>
  key_hash TEXT UNIQUE NOT NULL,

  -- Key prefix for identification without exposing the key
  -- e.g. "sr_live_a1b2c3" (first 14 chars shown to owner)
  key_prefix TEXT NOT NULL,

  -- Owner identification
  label TEXT NOT NULL,          -- human name: "My Agent v1", "Customer X"
  agent_id TEXT,                -- optional agent identifier (self-reported)
  owner_email TEXT,             -- for contact when approaching limits
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Tier & limits
  tier TEXT CHECK (tier IN ('free', 'paid')) DEFAULT 'free' NOT NULL,

  -- Monthly call limit (hard enforcement cap with 50% contingency baked in)
  -- Free tier pricing = 1,000 calls/month
  -- Enforcement cap = 667 (if counter overshoots by 50%, lands at ~1,000)
  monthly_limit INTEGER DEFAULT 667 NOT NULL,

  -- Daily burst cap (prevents a runaway agent burning the month in hours)
  daily_limit INTEGER DEFAULT 50 NOT NULL,

  -- Deliberation chain max iterations per chain (free tier)
  -- Each iteration = 1 Claude API call; cap prevents infinite loops
  max_chain_iterations INTEGER DEFAULT 20 NOT NULL,

  -- State
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  suspended_reason TEXT,        -- populated if manually suspended

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  notes TEXT                    -- internal notes (e.g. "Granted for beta testing")
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner_user_id ON public.api_keys(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- ============================================================
-- 2. API KEY USAGE — Monthly Buckets
-- One row per (api_key_id, year, month) — atomic increments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.api_key_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,

  -- Bucket: year + month (e.g. 2026, 3 = March 2026)
  year INTEGER NOT NULL,
  month INTEGER CHECK (month >= 1 AND month <= 12) NOT NULL,

  -- Call counters (incremented atomically via UPDATE ... RETURNING)
  total_calls INTEGER DEFAULT 0 NOT NULL,

  -- Per-endpoint breakdown (for billing granularity later)
  guardrail_calls INTEGER DEFAULT 0 NOT NULL,
  score_iterate_calls INTEGER DEFAULT 0 NOT NULL,
  agent_baseline_calls INTEGER DEFAULT 0 NOT NULL,
  other_calls INTEGER DEFAULT 0 NOT NULL,

  -- Daily high-water mark (reset each day by the increment function)
  current_day INTEGER DEFAULT 0 NOT NULL,  -- day of month (1-31)
  daily_calls INTEGER DEFAULT 0 NOT NULL,  -- calls on current_day

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (api_key_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_month
  ON public.api_key_usage(api_key_id, year, month);

-- ============================================================
-- 3. ATOMIC INCREMENT FUNCTION
-- Increments monthly + daily counters and returns both values
-- Used by the API to check quota before hitting Claude
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_api_usage(
  p_api_key_id UUID,
  p_year INTEGER,
  p_month INTEGER,
  p_day INTEGER,
  p_endpoint TEXT  -- 'guardrail' | 'score_iterate' | 'agent_baseline' | 'other'
)
RETURNS TABLE (
  new_monthly_total INTEGER,
  new_daily_total INTEGER,
  monthly_limit INTEGER,
  daily_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly INTEGER;
  v_daily INTEGER;
  v_m_limit INTEGER;
  v_d_limit INTEGER;
BEGIN
  -- Upsert usage row for this month
  INSERT INTO public.api_key_usage (api_key_id, year, month, current_day)
  VALUES (p_api_key_id, p_year, p_month, p_day)
  ON CONFLICT (api_key_id, year, month) DO NOTHING;

  -- Atomic increment: reset daily counter if day has changed
  UPDATE public.api_key_usage SET
    total_calls = total_calls + 1,
    guardrail_calls    = guardrail_calls    + CASE WHEN p_endpoint = 'guardrail'       THEN 1 ELSE 0 END,
    score_iterate_calls = score_iterate_calls + CASE WHEN p_endpoint = 'score_iterate'  THEN 1 ELSE 0 END,
    agent_baseline_calls = agent_baseline_calls + CASE WHEN p_endpoint = 'agent_baseline' THEN 1 ELSE 0 END,
    other_calls        = other_calls        + CASE WHEN p_endpoint = 'other'           THEN 1 ELSE 0 END,
    daily_calls = CASE
      WHEN current_day = p_day THEN daily_calls + 1
      ELSE 1
    END,
    current_day = p_day,
    updated_at = NOW()
  WHERE api_key_id = p_api_key_id AND year = p_year AND month = p_month
  RETURNING total_calls, daily_calls
  INTO v_monthly, v_daily;

  -- Fetch limits from api_keys
  SELECT k.monthly_limit, k.daily_limit
  INTO v_m_limit, v_d_limit
  FROM public.api_keys k
  WHERE k.id = p_api_key_id;

  -- Update last_used_at on the key
  UPDATE public.api_keys SET last_used_at = NOW()
  WHERE id = p_api_key_id;

  RETURN QUERY SELECT v_monthly, v_daily, v_m_limit, v_d_limit;
END;
$$;

-- ============================================================
-- 4. CONVENIENCE VIEW — Current month usage summary
-- ============================================================

CREATE OR REPLACE VIEW public.api_key_usage_current AS
SELECT
  k.id AS api_key_id,
  k.key_prefix,
  k.label,
  k.tier,
  k.is_active,
  k.monthly_limit,
  k.daily_limit,
  k.owner_email,
  COALESCE(u.total_calls, 0) AS monthly_calls,
  COALESCE(u.daily_calls, 0) AS todays_calls,
  k.monthly_limit - COALESCE(u.total_calls, 0) AS monthly_remaining,
  ROUND(
    (COALESCE(u.total_calls, 0)::NUMERIC / NULLIF(k.monthly_limit, 0)) * 100, 1
  ) AS monthly_pct_used,
  k.last_used_at,
  k.created_at
FROM public.api_keys k
LEFT JOIN public.api_key_usage u
  ON u.api_key_id = k.id
  AND u.year = EXTRACT(YEAR FROM NOW())::INTEGER
  AND u.month = EXTRACT(MONTH FROM NOW())::INTEGER;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- api_keys and api_key_usage are admin-only at the RLS level.
-- All validated via service role (supabaseAdmin) server-side.
-- ============================================================

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS policies — all access via service role server-side.
-- Users will see their own key status through a dedicated /api/key-status endpoint.

-- ============================================================
-- 6. ANALYTICS EVENT — add api_key_id column
-- ============================================================

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_api_key_id
  ON public.analytics_events(api_key_id);

-- ============================================================
-- 7. VERIFY
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('api_keys', 'api_key_usage')
ORDER BY table_name;

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'increment_api_usage';
