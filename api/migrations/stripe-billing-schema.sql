-- =============================================================================
-- Stripe Billing Integration Schema
-- Created: 2026-04-07
-- Purpose: Link Supabase users to Stripe customers, track subscriptions,
--          log payment events for audit trail, and support R5 cost-health alerts.
--
-- Compliance: CR-2026-Q2-v4
-- Rules served: R0 (oikeiosis — revenue for sustainability), R5 (cost guardrails),
--               R9 (no outcome promises in billing), R10 (billing compliance)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. stripe_customers — Maps Supabase auth.users to Stripe customer IDs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email         TEXT,
  -- 'human' = voluntary tidings only; 'developer' = paid API tier
  customer_type TEXT NOT NULL DEFAULT 'developer' CHECK (customer_type IN ('human', 'developer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_stripe UNIQUE (user_id)
);

-- Index for fast lookups by Stripe customer ID (webhook handlers)
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id
  ON public.stripe_customers(stripe_customer_id);

-- Index for fast lookups by user_id (checkout session creation)
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id
  ON public.stripe_customers(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_stripe_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stripe_customers_updated_at
  BEFORE UPDATE ON public.stripe_customers
  FOR EACH ROW EXECUTE FUNCTION update_stripe_customers_updated_at();

-- RLS: Users can read their own Stripe link; admin can read all
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_customers_own_read ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

-- Service role bypasses RLS for webhook writes


-- ---------------------------------------------------------------------------
-- 2. stripe_subscriptions — Active subscriptions (developer paid tier + monthly tidings)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id    TEXT NOT NULL REFERENCES public.stripe_customers(stripe_customer_id),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id       TEXT NOT NULL,
  -- 'developer_paid' | 'monthly_tiding'
  subscription_type     TEXT NOT NULL CHECK (subscription_type IN ('developer_paid', 'monthly_tiding')),
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid', 'trialing', 'incomplete')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_subs_customer
  ON public.stripe_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subs_status
  ON public.stripe_subscriptions(status);

ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions via the stripe_customers join
CREATE POLICY stripe_subs_own_read ON public.stripe_subscriptions
  FOR SELECT USING (
    stripe_customer_id IN (
      SELECT stripe_customer_id FROM public.stripe_customers WHERE user_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------------------
-- 3. payment_events — Immutable audit log of all Stripe webhook events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,  -- Stripe event ID for idempotency
  event_type      TEXT NOT NULL,          -- e.g. 'checkout.session.completed'
  stripe_customer_id TEXT,
  user_id         UUID REFERENCES auth.users(id),
  amount_cents    INTEGER,                -- Amount in cents (null for non-payment events)
  currency        TEXT DEFAULT 'usd',
  status          TEXT,                   -- Payment status from Stripe
  metadata        JSONB DEFAULT '{}',     -- Full event payload (redacted of sensitive fields)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_customer
  ON public.payment_events(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_events_type
  ON public.payment_events(event_type);

CREATE INDEX IF NOT EXISTS idx_payment_events_created
  ON public.payment_events(created_at DESC);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own payment events
CREATE POLICY payment_events_own_read ON public.payment_events
  FOR SELECT USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- 4. cost_health_snapshots — R5 cost-as-health-metric tracking
--    Stores periodic snapshots of revenue vs LLM cost for the 2x threshold
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cost_health_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_revenue_cents   INTEGER NOT NULL DEFAULT 0,
  total_llm_cost_cents  INTEGER NOT NULL DEFAULT 0,
  total_api_calls       INTEGER NOT NULL DEFAULT 0,
  revenue_to_cost_ratio NUMERIC(8,2),      -- Must be >= 2.0 per R5
  -- Sage Ops monthly cap tracking (R5: $100/month)
  sage_ops_cost_cents   INTEGER NOT NULL DEFAULT 0,
  alert_triggered       BOOLEAN DEFAULT false,
  alert_reason          TEXT,               -- e.g. 'ratio_below_2x', 'ops_cap_exceeded'
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_period UNIQUE (period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_cost_health_period
  ON public.cost_health_snapshots(period_start DESC);

-- No RLS needed — admin-only table (service role access)
-- Do NOT enable RLS here; this is internal operational data


-- ---------------------------------------------------------------------------
-- 5. Helper function: Get or create a Stripe customer link
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_or_create_stripe_customer(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_email TEXT DEFAULT NULL,
  p_customer_type TEXT DEFAULT 'developer'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Try to find existing
  SELECT id INTO v_id FROM public.stripe_customers WHERE user_id = p_user_id;
  IF FOUND THEN
    -- Update Stripe ID if changed (rare but possible)
    UPDATE public.stripe_customers
      SET stripe_customer_id = p_stripe_customer_id,
          email = COALESCE(p_email, email)
      WHERE id = v_id;
    RETURN v_id;
  END IF;

  -- Create new
  INSERT INTO public.stripe_customers (user_id, stripe_customer_id, email, customer_type)
    VALUES (p_user_id, p_stripe_customer_id, p_email, p_customer_type)
    RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------------
-- 6. Helper function: Upgrade an API key to paid tier
--    Called by webhook handler when developer checkout completes
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION upgrade_api_key_to_paid(
  p_user_id UUID,
  p_monthly_limit INTEGER DEFAULT 10000,
  p_daily_limit INTEGER DEFAULT 500,
  p_max_iterations INTEGER DEFAULT 3
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.api_keys
    SET tier = 'paid',
        monthly_limit = p_monthly_limit,
        daily_limit = p_daily_limit,
        max_chain_iterations = p_max_iterations
    WHERE owner_user_id = p_user_id
      AND tier = 'free'
      AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ---------------------------------------------------------------------------
-- 7. Helper function: Downgrade an API key back to free tier
--    Called by webhook handler when subscription is canceled
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION downgrade_api_key_to_free(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.api_keys
    SET tier = 'free',
        monthly_limit = 30,
        daily_limit = 1,
        max_chain_iterations = 1
    WHERE owner_user_id = p_user_id
      AND tier = 'paid'
      AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
