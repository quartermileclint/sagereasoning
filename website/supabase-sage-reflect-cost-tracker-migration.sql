-- ============================================================
-- SageReasoning — Sage Reflect A2 (PR7): microcent-precise R5 cost-health tracker
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Creates ONE Sage-Reflect-owned side-table for R5 cost truth:
--   sage_reflect_cost_tracker — cumulative RAW Anthropic cost in MICROCENTS,
--     keyed by (surface, period_year, period_month). Decoupled from billing.
--
-- WHY (per /drafts/2026-05-23-track-followons-design-pack.md §A2):
--   The reflect meter rounds each stage call's cost to INTEGER cents for the loop
--   bill (correct — increment_api_usage + the customer bill are integer cents). A
--   sub-cent Sonnet pass therefore records anthropic_cost_cents = 0 in
--   loop_billing_events, so the retrospective R5 "revenue-to-cost ≥ 2x" check reads
--   0 cost and looks artificially healthy. This table records the precise microcents
--   so true sub-cent cost is visible to the health metric. 1 cent = 10,000 microcents.
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Reversible via the DROP at the foot
-- (commented). Modifies NO existing table. Touches NO billing path — the integer-cents
-- loop bill (route.ts makeMeter → recordLoopBilling) is byte-for-byte unchanged.
--
-- WRITER/READER: website/src/lib/sage-reflect/reflect-cost-tracker.ts
--   incrementReflectCostMicrocents (fail-soft read-modify-write; called from
--   makeMeter after the bill persists, never on a resume) + readReflectCostHealth.
--
-- KG1: the writer/reader await every read/write and FAIL SOFT (console.warn, no
--   throw) — observability must never block billing or the agent response.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sage_reflect_cost_tracker (
  -- Metering surface (e.g. 'wrapper_internal' for /api/practice/reflect).
  surface                     text        NOT NULL,
  -- Accumulation period (UTC). One row per (surface, year, month).
  period_year                 int         NOT NULL,
  period_month                int         NOT NULL,
  -- Cumulative true Anthropic cost, MICROCENTS (1 cent = 10,000 microcents).
  -- bigint: a $100/mo period = 100,000,000 microcents, well within range.
  cumulative_cost_microcents  bigint      NOT NULL DEFAULT 0,
  -- Count of billable LLM stage calls accumulated this period.
  request_count               int         NOT NULL DEFAULT 0,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (surface, period_year, period_month)
);

-- House-style guards (idempotent).
DO $$ BEGIN
  ALTER TABLE public.sage_reflect_cost_tracker
    ADD CONSTRAINT sage_reflect_cost_tracker_month_check
    CHECK (period_month BETWEEN 1 AND 12);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sage_reflect_cost_tracker
    ADD CONSTRAINT sage_reflect_cost_tracker_nonneg_check
    CHECK (cumulative_cost_microcents >= 0 AND request_count >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS: server-side only via the service role (mirrors sage_reflect_sessions).
-- RLS enabled with no policy locks the table to the service-role key.
ALTER TABLE public.sage_reflect_cost_tracker ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

-- 1. Table exists.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'sage_reflect_cost_tracker';

-- 2. Columns (expect 7).
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sage_reflect_cost_tracker'
ORDER BY ordinal_position;

-- 3. CHECK constraints (expect the two named checks).
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.sage_reflect_cost_tracker'::regclass AND contype = 'c'
ORDER BY conname;

-- 4. RLS enabled (expect relrowsecurity = true).
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'sage_reflect_cost_tracker';

-- 5. (Post-traffic) the period's true cost. cents = microcents / 10000.
--    Compare against loop_billing_events.anthropic_cost_cents (which rounds sub-cent
--    passes to 0) to see the truth this table preserves.
-- SELECT surface, period_year, period_month, cumulative_cost_microcents,
--        (cumulative_cost_microcents::numeric / 10000) AS cumulative_cost_cents,
--        request_count
-- FROM public.sage_reflect_cost_tracker
-- ORDER BY period_year DESC, period_month DESC, surface;

-- ============================================================
-- ROLLBACK — DO NOT RUN unless rolling A2 back.
-- ============================================================
--   DROP TABLE IF EXISTS public.sage_reflect_cost_tracker;
