-- Migration: 20260606_a19_abuse_signals
-- Purpose: A19 abuse-detection signal state. abuse_signals records each tripped
--   abuse/behavioural threshold (one row per signal_type + scope + UTC day,
--   deduped) so a fired signal is persisted, not just transiently logged. Read +
--   stamped by the evaluate endpoint (/api/abuse/evaluate). request_velocity_anomaly
--   (per-identity request burst) is the PR1 single-detector proof.
-- Related: R5 (operational health), R0 (oikeiosis audit trail), R3 (scope is an
--   A10 agent_id or 'global' — NEVER an end-user id). Reads substrate_audit_events
--   (the A12 timestamped behavioural-baseline surface: occurred_at + agent_id +
--   structural masked_context); NEVER on the /api/reason critical path — detection
--   is observability only.
-- Decision log: 2026-06-06 — D-A19-ABUSE-DETECTION-VELOCITY-PROOF-2026-06-06.
--
-- Deliberately mirrors cost_alerts (20260603_a13_cost_alerts.sql): same shape,
--   same dedup grain, same service-role-only RLS posture, same notified_at
--   delivery stamp. NOT append-only (notified_at is UPDATEd on delivery), so no
--   immutability trigger.
--
-- Risk classification: Elevated (new table; additive; reversible via the rollback
--   block below). NOT Critical — no auth/session/encryption/R20a-perimeter change.
--   PR6 not engaged (no distress-classifier / Zone 2/3 / wrapper touch).
-- Idempotent: safe to re-run (IF NOT EXISTS).
-- KG1: written only by awaited service-role upserts from server code. KG7: details
--   is JSONB storing an object (default '{}'::jsonb).

CREATE TABLE IF NOT EXISTS public.abuse_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which A19 detector tripped.
  signal_type     TEXT NOT NULL,

  -- 'global' for account-wide detectors; the agent_id (A10 install identity)
  -- for the per-identity detector. Never an end-user id (R3).
  scope           TEXT NOT NULL DEFAULT 'global',

  severity        TEXT NOT NULL DEFAULT 'warning',

  -- UTC calendar day the evaluation covers. Dedup grain: one signal per
  -- signal_type + scope + day.
  period_date     DATE NOT NULL,

  observed_value  NUMERIC NOT NULL,   -- the measured number that tripped the line (request count)
  threshold_value NUMERIC NOT NULL,   -- the line it crossed (request count)
  multiple        NUMERIC,            -- observed / baseline (display)

  message         TEXT NOT NULL,
  details         JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Set when surfaced to the founder (future scheduled delivery). NULL => undelivered.
  notified_at     TIMESTAMPTZ,

  CONSTRAINT abuse_signals_signal_type_valid
    CHECK (signal_type IN (
      'request_velocity_anomaly',  -- per-identity request burst (this PR1 proof)
      'systematic_enumeration',    -- structural enumeration pattern (future surface rollout)
      'rapid_input_variation'      -- rapid variation of same structural input (future)
    )),
  CONSTRAINT abuse_signals_severity_valid
    CHECK (severity IN ('info', 'warning', 'critical'))
);

-- Dedup: one signal per signal_type + scope + UTC day. Upserts target this key.
CREATE UNIQUE INDEX IF NOT EXISTS uq_abuse_signals_type_scope_day
  ON public.abuse_signals (signal_type, scope, period_date);

-- Delivery query: undelivered signals, newest first.
CREATE INDEX IF NOT EXISTS idx_abuse_signals_undelivered
  ON public.abuse_signals (created_at DESC)
  WHERE notified_at IS NULL;

-- ============================================================================
-- Row-Level Security
-- ============================================================================

ALTER TABLE public.abuse_signals ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created. The Supabase service role (the server-side
-- evaluate endpoint + any future scheduled delivery task) bypasses RLS and is the
-- only reader/writer. No anon / authenticated access. Matches the service-role-only
-- posture of cost_alerts (20260603_a13_cost_alerts.sql) and substrate_audit_events
-- (20260603_a12_substrate_audit_events.sql).

-- ============================================================================
-- In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.abuse_signals IS
  'A19 abuse-detection signal state. One row per (signal_type, scope, period_date) '
  '— a tripped behavioural threshold persisted, not just logged. notified_at stamps '
  'future scheduled delivery to the founder. Service-role-only (RLS, no policies). '
  'Reads substrate_audit_events (A12 occurred_at + agent_id); never on the '
  '/api/reason critical path. Mirrors cost_alerts (A13).';

COMMENT ON COLUMN public.abuse_signals.scope IS
  '''global'' for account-wide detectors; the agent_id (A10 install identity) for '
  'per-identity. Never an end-user id (R3).';

COMMENT ON COLUMN public.abuse_signals.notified_at IS
  'Set when the signal is surfaced to the founder by a future scheduled delivery '
  'task. NULL means undelivered; the delivery query selects WHERE notified_at IS NULL.';

-- ============================================================================
-- Rollback block (commented out — uncomment and run if verification fails)
-- ============================================================================
--
-- BEGIN;
--   DROP INDEX IF EXISTS public.idx_abuse_signals_undelivered;
--   DROP INDEX IF EXISTS public.uq_abuse_signals_type_scope_day;
--   DROP TABLE IF EXISTS public.abuse_signals;
-- COMMIT;
