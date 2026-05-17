-- =============================================================================
-- Option D Billing Model Schema — Per-Loop Base Rate + LLM-Token-Cost Overage
-- Created: 2026-05-17 (predecessor design); applied at Option D build session.
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Purpose: Replace per-API-call (count-based) billing with per-loop billing.
--          A loop = one wrapper invocation identified by (api_key_id, loop_id);
--          loop_id is a UUIDv4 propagated via X-Loop-Id request header (server
--          auto-generates if absent). Base rate ($0.02) covers ~80% of usage
--          cleanly; Anthropic-cost overage (>50% of base rate × 2 multiplier)
--          fires only on heavy deliberation chains. R5's 2x ratio enforced
--          prospectively at the loop level by construction.
--
-- Compliance: CR-2026-Q2-v4
-- Rules served: R0 (oikeiosis — substrate revenue sustainability), R5 (cost
--               guardrails — prospective 2x ratio at loop level by construction;
--               cost_health_snapshots retained as retrospective sanity check
--               per Decision G), R9 (no outcome promises in billing — bills work
--               attempted, not work completed), R10 (marketplace pricing
--               compliance — consistent language across api-docs + marketplace
--               + invoice surfaces), R18a (no category-language change —
--               billing is commercial, not credential), AC7 (engaged via
--               deployment-config + access-control schema changes; full
--               Critical Change Protocol applied at build session), AC8
--               (translation-sandwich substrate — no Layer 1 contract change),
--               AC10 (loop_billing_events is upstream provenance surface F4
--               in /operations/agentic-commerce-findings-downstream-order.md
--               names for A12 OpenTelemetry integration post-launch), KG1
--               (transactional aggregate + ledger writes; no fire-and-forget;
--               every metering write awaited).
--
-- Idempotent: every DDL statement uses IF NOT EXISTS / IF EXISTS clauses so
-- this migration can be safely re-applied. The CHECK constraint on
-- billing_model allows future expansion ('per_call' value retained for
-- rollback safety per Decision F + Step 1(c) election).
--
-- Source design: /adopted/billing-model-design.md (D-BILLING-MODEL-LOCKED-2026-05-17)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. api_keys.billing_model — discriminator column
--    All existing rows default to 'per_loop' at column-add time.
--    CHECK constraint allows 'per_call' as a value for rollback safety
--    (per Decision F + Step 1(c) — dead per-call paths retained one cycle).
-- ---------------------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS billing_model TEXT NOT NULL DEFAULT 'per_loop'
    CHECK (billing_model IN ('per_call', 'per_loop'));


-- ---------------------------------------------------------------------------
-- 2. api_key_usage — loop-level aggregate columns
--    The existing per-call counters (total_calls, guardrail_calls, etc.) are
--    retained for rollback safety; their meaning under Option D is "raw HTTP
--    call counters" while loop_count is "billable loop counter". Quota checks
--    under Option D read loop_count + the existing monthly_limit/daily_limit
--    columns (which now mean "loops per month/day" per Decision F).
-- ---------------------------------------------------------------------------
ALTER TABLE public.api_key_usage
  ADD COLUMN IF NOT EXISTS loop_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS anthropic_cost_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billed_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overage_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overage_cents INTEGER NOT NULL DEFAULT 0;


-- ---------------------------------------------------------------------------
-- 3. loop_billing_events — append-only ledger for per-loop forensic detail
--    One row per (api_key_id, loop_id) — enforced by UNIQUE constraint.
--    Step 1(e) election: hard error on second insert with same (api_key_id,
--    loop_id) — wrappers learn to issue fresh loop_ids per HTTP request; the
--    'one loop = one HTTP request' framing is enforced. Multi-HTTP-request
--    loops with shared loop_id are explicitly deferred under Decision A's PR7.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loop_billing_events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id              UUID NOT NULL,
  api_key_id           UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  agent_id             TEXT,                                  -- wrapper-supplied (may be null)
  surface              TEXT NOT NULL CHECK (surface IN ('api_reason', 'api_score_iterate', 'wrapper_internal')),
  base_cents           INTEGER NOT NULL,                      -- LOOP_BASE_RATE_CENTS at time of bill
  threshold_cents      INTEGER NOT NULL,                      -- base_cents * OVERAGE_TRIGGER_RATIO at time of bill
  anthropic_cost_cents INTEGER NOT NULL,                      -- sum across all internal API calls in the loop
  overage_fired        BOOLEAN NOT NULL DEFAULT false,
  overage_cents        INTEGER NOT NULL DEFAULT 0,
  total_cents          INTEGER NOT NULL,                      -- base_cents + overage_cents
  internal_calls       INTEGER NOT NULL,                      -- count of internal API calls within the loop
  models_used          TEXT[],                                -- e.g., {'haiku-4-5','sonnet-4-6'}
  total_input_tokens   INTEGER NOT NULL DEFAULT 0,
  total_output_tokens  INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforces the 'one loop = one HTTP request' framing per Decision A.
  -- Wrappers attempting to reuse loop_id across HTTP requests hit this
  -- constraint and receive a 400 error from the application layer.
  CONSTRAINT unique_api_key_loop UNIQUE (api_key_id, loop_id)
);

-- Index for monthly invoice rendering (Stripe webhook reads loop_billing_events
-- for a customer's api_key_ids in a period; per-day-aggregate per Step 1(b)).
CREATE INDEX IF NOT EXISTS idx_loop_billing_events_key_month
  ON public.loop_billing_events(api_key_id, created_at DESC);

-- Index for forensic lookup by loop_id (customer queries "why was loop X billed?").
CREATE INDEX IF NOT EXISTS idx_loop_billing_events_loop_id
  ON public.loop_billing_events(loop_id);


-- ---------------------------------------------------------------------------
-- 4. classifier_cost_log — loop attribution column
--    Per Decision E + Step 6 integration: when the R20a distress classifier
--    runs INSIDE a wrapper's loop, the classifier's cost can later be
--    attributed to the parent loop. This session adds the column; live
--    classifier→loop attribution at the TypeScript layer is deferred under
--    PR7 (avoids touching r20a-classifier.ts surface — Critical under PR6).
--    The column is populated by logClassifierRun when its optional loop_id
--    param is provided; absent loop_id leaves it null.
-- ---------------------------------------------------------------------------
ALTER TABLE public.classifier_cost_log
  ADD COLUMN IF NOT EXISTS loop_id UUID;

-- Index for forensic queries joining classifier_cost_log to loop_billing_events
-- (e.g., "show me total LLM cost for loop X including its classifier run").
CREATE INDEX IF NOT EXISTS idx_classifier_cost_log_loop_id
  ON public.classifier_cost_log(loop_id) WHERE loop_id IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
--    loop_billing_events is admin-only at the RLS level (per Decision E's
--    deferred items — loop-level RLS policies deferred under PR7).
--    All access via service role server-side, matching api_key_usage pattern.
-- ---------------------------------------------------------------------------
ALTER TABLE public.loop_billing_events ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS policies — all access via service role server-side.
-- Customer-facing usage dashboards would need a dedicated read endpoint
-- (deferred under PR7 per Decision E's "Customer-facing usage dashboard").


-- ---------------------------------------------------------------------------
-- 7. VERIFY — read these queries after running the migration to confirm
--    the column adds + table create + indexes + RLS landed correctly.
-- ---------------------------------------------------------------------------

-- Check api_keys.billing_model exists with CHECK constraint
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'api_keys'
  AND column_name = 'billing_model';
-- Expected: one row — billing_model | text | 'per_loop'::text | NO

-- Check api_key_usage gained the five new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'api_key_usage'
  AND column_name IN ('loop_count', 'anthropic_cost_cents', 'billed_cents',
                      'overage_count', 'overage_cents')
ORDER BY column_name;
-- Expected: five rows — all integer, all default 0

-- Check loop_billing_events table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'loop_billing_events';
-- Expected: one row — loop_billing_events

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'loop_billing_events'
ORDER BY indexname;
-- Expected: idx_loop_billing_events_key_month, idx_loop_billing_events_loop_id,
--           loop_billing_events_pkey, unique_api_key_loop

-- Check RLS enabled on loop_billing_events
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'loop_billing_events';
-- Expected: loop_billing_events | t

-- Check classifier_cost_log gained the loop_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'classifier_cost_log'
  AND column_name = 'loop_id';
-- Expected: one row — loop_id | uuid | YES
