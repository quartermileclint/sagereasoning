-- Migration: 20260603_a13_cost_alerts
-- Purpose: A13 R5 cost-as-health-metric alert state. cost_alerts records each
--   tripped cost threshold (one row per detector_type + scope + UTC day, deduped)
--   so a fired alert is persisted, not just transiently logged. Read + stamped by
--   the evaluate endpoint (/api/billing/cost-alerts/evaluate) and the scheduled
--   delivery task. D5 (per-identity anomaly) is the PR1 single-rule proof.
-- Related: R5 (cost-as-health), R0 (oikeiosis cost trail). Reads loop_billing_events
--   (the F4 / AC10 provenance + per-identity cost surface); NEVER on the /api/reason
--   critical path — alerting is observability only.
-- Decision log: 2026-06-03 — D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03.
--
-- NOT append-only (unlike substrate_audit_events): notified_at is UPDATEd on
--   delivery, so no immutability trigger. Service-role-only writer via RLS.
--
-- Risk classification: Elevated (new table; additive; reversible via the rollback
--   block below). NOT Critical — no auth/session/encryption/R20a-perimeter change.
-- Idempotent: safe to re-run (IF NOT EXISTS).
-- KG1: written only by awaited service-role upserts from server code. KG7: details
--   is JSONB storing an object (default '{}'::jsonb).

CREATE TABLE IF NOT EXISTS public.cost_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which R5 detector tripped.
  detector_type   TEXT NOT NULL,

  -- 'global' for account-wide detectors; the agent_id (A10 install identity)
  -- for the per-identity detector. Never an end-user id (R3).
  scope           TEXT NOT NULL DEFAULT 'global',

  severity        TEXT NOT NULL DEFAULT 'warning',

  -- UTC calendar day the evaluation covers. Dedup grain: one alert per
  -- detector_type + scope + day.
  period_date     DATE NOT NULL,

  observed_value  NUMERIC NOT NULL,   -- the measured number that tripped the line (cents)
  threshold_value NUMERIC NOT NULL,   -- the line it crossed (cents)
  multiple        NUMERIC,            -- observed / baseline (display)

  message         TEXT NOT NULL,
  details         JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Set when surfaced to the founder (scheduled delivery). NULL => undelivered.
  notified_at     TIMESTAMPTZ,

  CONSTRAINT cost_alerts_detector_type_valid
    CHECK (detector_type IN (
      'per_identity_anomaly',  -- D5 (this proof)
      'per_call_spike',        -- D4 (added after D5 Verified)
      'revenue_cost_ratio',    -- D1
      'ops_monthly_cap',       -- D2
      'rolling_7day_spike'     -- D3
    )),
  CONSTRAINT cost_alerts_severity_valid
    CHECK (severity IN ('info', 'warning', 'critical'))
);

-- Dedup: one alert per detector_type + scope + UTC day. Upserts target this key.
CREATE UNIQUE INDEX IF NOT EXISTS uq_cost_alerts_detector_scope_day
  ON public.cost_alerts (detector_type, scope, period_date);

-- Delivery query: undelivered alerts, newest first.
CREATE INDEX IF NOT EXISTS idx_cost_alerts_undelivered
  ON public.cost_alerts (created_at DESC)
  WHERE notified_at IS NULL;

-- ============================================================================
-- Row-Level Security
-- ============================================================================

ALTER TABLE public.cost_alerts ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created. The Supabase service role (the server-side
-- evaluate endpoint + the scheduled delivery task) bypasses RLS and is the only
-- reader/writer. No anon / authenticated access. Matches the service-role-only
-- posture of substrate_audit_events (20260603_a12_substrate_audit_events.sql).

-- ============================================================================
-- In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.cost_alerts IS
  'A13 R5 cost-as-health alert state. One row per (detector_type, scope, '
  'period_date) — a tripped threshold persisted, not just logged. notified_at '
  'stamps scheduled delivery to the founder. Service-role-only (RLS, no policies). '
  'Reads loop_billing_events; never on the /api/reason critical path.';

COMMENT ON COLUMN public.cost_alerts.scope IS
  '''global'' for account-wide detectors; the agent_id (A10 install identity) for '
  'per-identity. Never an end-user id (R3).';

COMMENT ON COLUMN public.cost_alerts.notified_at IS
  'Set when the alert is surfaced to the founder by the scheduled delivery task. '
  'NULL means undelivered; the delivery query selects WHERE notified_at IS NULL.';

-- ============================================================================
-- Rollback block (commented out — uncomment and run if verification fails)
-- ============================================================================
--
-- BEGIN;
--   DROP INDEX IF EXISTS public.idx_cost_alerts_undelivered;
--   DROP INDEX IF EXISTS public.uq_cost_alerts_detector_scope_day;
--   DROP TABLE IF EXISTS public.cost_alerts;
-- COMMIT;
