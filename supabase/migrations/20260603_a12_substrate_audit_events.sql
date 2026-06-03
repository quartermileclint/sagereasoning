-- Migration: 20260603_a12_substrate_audit_events
-- Purpose: A12 call-grain audit log. Creates substrate_audit_events — an
--   append-only, immutable per-call decision record for the translation-sandwich
--   substrate. One row per substrate run on an instrumented surface (proof
--   endpoint: /api/reason). The DPIA evidence surface (A16) + behavioural-baseline
--   source (A19) + AP2 provenance producer (F4 / AC10).
-- Related: AC10 (provenance + use_policies; AP2 mandate alignment — F4 fold-in),
--   R0 (oikeiosis audit trail), R3 (no PII / no raw user text), R4 (no engine
--   internals beyond operational fields), R17 (intimate data — masked, never raw),
--   R19c/R19d (limitations recorded in use_policies).
-- Decision log: 2026-06-03 — D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03.
-- Mirrors the append-only enforcement pattern of 20260415_r17a_audit_schema.sql
--   (REVOKE UPDATE/DELETE + raise-on-mutation trigger + service-role-only writes).
--
-- Risk classification: Elevated (new table; additive; reversible via the rollback
--   block below). NOT Critical — no auth/session/encryption/R20a-perimeter change.
-- Idempotent: safe to re-run (IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS).
-- KG1: written only by awaited service-role inserts from server code. KG7: JSONB
--   columns store objects (defaults '{}'::jsonb); arrays stored as text[].

-- ============================================================================
-- 1. substrate_audit_events — append-only call-grain audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.substrate_audit_events (
  event_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Correlation key shared with the OpenTelemetry trace + loop_billing_events.
  -- For /api/reason this is the loop_id (UUIDv4) when present, else a
  -- server-generated reason_id. Lets a trace, a bill row, and an audit row be
  -- joined without storing any user-identifying field.
  correlation_id    UUID NOT NULL,

  -- A10 per-install identity (text install id). NULL on the user-auth /
  -- cookie-session path (no agent identity). Never an end-user id (R3).
  agent_id          TEXT,

  -- Instrumented surface. 'api_reason' is the A12 proof endpoint.
  surface           TEXT NOT NULL,

  -- The substrate's terminal decision for this run. Read from the already-
  -- produced SandwichRunResult — the audit writer does NOT inspect the R20a
  -- classifier or its wrappers (PR6 boundary preserved).
  decision_event    TEXT NOT NULL,

  -- Distress severity band IF a redirect/passthrough decision was recorded by
  -- an upstream layer (read from result output, not from the classifier path).
  -- NULL when not applicable. One of none/mild/moderate/acute.
  severity_band     TEXT,

  -- Operational timing (R4 — operational fields, not engine internals).
  layer1_latency_ms INTEGER,
  layer2_latency_ms INTEGER,
  layer3_latency_ms INTEGER,

  -- Models touched in this run (e.g. {claude-sonnet-4-6}). Operational field.
  models_used       TEXT[] NOT NULL DEFAULT '{}',

  -- AC10 / F4: provenance of the produced judgement, emitted in a shape
  -- compatible with downstream AP2-mandate-consuming agents.
  --   { substrate_version, layer2_signature_present, models, produced_at }
  provenance        JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- AC10 / F4: how the produced output may be used — the AP2 "use_policies"
  -- analogue. Records the standing limitations (R19c/R19d), not-advice posture,
  -- and whether a distress redirect governs this output.
  --   { not_medical_or_legal_advice, mirror_principle, limitations_ref,
  --     distress_redirect_applies }
  use_policies      JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Masked context ONLY. Structural / categorical fields — never raw input
  -- text, never free-text findings, never intimate data (R3 + R17). The
  -- substrate-audit-writer is the single enforcement point; this column is the
  -- DPIA evidence surface (A16) and behavioural-baseline source (A19).
  masked_context    JSONB NOT NULL DEFAULT '{}'::jsonb,

  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT sae_surface_not_empty
    CHECK (length(trim(surface)) > 0),

  CONSTRAINT sae_decision_event_valid
    CHECK (decision_event IN (
      'assessment',          -- happy path: composed assessment returned
      'tier1_clarification', -- engine halted for a clarifying question
      'r20a_redirect',       -- a distress redirect governed the output
      'layer_throw',         -- a layer threw; minimal/deterministic fallback returned
      'signing_unavailable', -- Layer 2 signing fail-closed (503)
      'fallback'             -- Layer 3 LLM threw; deterministic fallback prose used
    )),

  CONSTRAINT sae_severity_band_valid
    CHECK (severity_band IS NULL OR severity_band IN ('none','mild','moderate','acute'))
);

CREATE INDEX IF NOT EXISTS idx_sae_correlation_id
  ON public.substrate_audit_events (correlation_id);

CREATE INDEX IF NOT EXISTS idx_sae_agent_id
  ON public.substrate_audit_events (agent_id)
  WHERE agent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sae_occurred_at
  ON public.substrate_audit_events (occurred_at DESC);

-- ============================================================================
-- 2. Row-Level Security
-- ============================================================================

ALTER TABLE public.substrate_audit_events ENABLE ROW LEVEL SECURITY;

-- No permissive policies are created. The Supabase service role bypasses RLS
-- and is the ONLY writer (server-side substrate-audit-writer.ts). No client
-- role (anon / authenticated) may read or write audit rows. This matches the
-- service-role-only posture of support_access_log inserts in
-- 20260415_r17a_audit_schema.sql §4.

-- ============================================================================
-- 3. Append-only / immutability enforcement
-- ============================================================================

REVOKE UPDATE, DELETE ON public.substrate_audit_events FROM PUBLIC;
REVOKE UPDATE, DELETE ON public.substrate_audit_events FROM authenticated;
REVOKE UPDATE, DELETE ON public.substrate_audit_events FROM anon;

-- Defence in depth: raise on any UPDATE/DELETE regardless of role (blocks
-- accidental service-role mutation too). Immutable storage requirement (A12).
CREATE OR REPLACE FUNCTION public.substrate_audit_events_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'substrate_audit_events is append-only; % not permitted', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS trg_sae_no_update ON public.substrate_audit_events;
CREATE TRIGGER trg_sae_no_update
  BEFORE UPDATE ON public.substrate_audit_events
  FOR EACH ROW EXECUTE FUNCTION public.substrate_audit_events_append_only();

DROP TRIGGER IF EXISTS trg_sae_no_delete ON public.substrate_audit_events;
CREATE TRIGGER trg_sae_no_delete
  BEFORE DELETE ON public.substrate_audit_events
  FOR EACH ROW EXECUTE FUNCTION public.substrate_audit_events_append_only();

-- ============================================================================
-- 4. In-schema documentation
-- ============================================================================

COMMENT ON TABLE public.substrate_audit_events IS
  'A12 call-grain audit log. Append-only, immutable per-call decision record '
  'for the translation-sandwich substrate. One row per run on an instrumented '
  'surface (proof: /api/reason). masked_context holds structural fields ONLY — '
  'never raw input, free-text findings, or intimate data (R3 + R17). '
  'provenance + use_policies are emitted in an AP2-mandate-compatible shape '
  '(AC10 / F4). DPIA evidence surface (A16); behavioural-baseline source (A19).';

COMMENT ON COLUMN public.substrate_audit_events.correlation_id IS
  'Shared join key with the OpenTelemetry trace + loop_billing_events. loop_id '
  'when present on /api/reason, else a server-generated reason_id. Not user-identifying.';

COMMENT ON COLUMN public.substrate_audit_events.masked_context IS
  'Structural / categorical fields only (depth tier, mechanism codes, severity '
  'band, counts). NEVER raw input text, free-text findings, or intimate data. '
  'Enforced by substrate-audit-writer.ts maskContext().';

-- ============================================================================
-- Rollback block (commented out — uncomment and run if verification fails)
-- ============================================================================
--
-- BEGIN;
--   DROP TRIGGER IF EXISTS trg_sae_no_delete ON public.substrate_audit_events;
--   DROP TRIGGER IF EXISTS trg_sae_no_update ON public.substrate_audit_events;
--   DROP FUNCTION IF EXISTS public.substrate_audit_events_append_only();
--   DROP TABLE IF EXISTS public.substrate_audit_events;
-- COMMIT;
