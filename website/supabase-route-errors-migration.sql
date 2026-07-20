-- ============================================================================
-- Migration: route_errors — queryable production error store (#5, P-GL)
-- Run in: Supabase Dashboard → SQL Editor (production project)
--
-- Purpose: a solo-founder error-monitoring MVP. Route catch blocks write here
--   via lib/observability-store.ts recordRouteError() so prod errors are
--   queryable/alertable instead of vanishing into ephemeral Vercel logs.
--
-- Related rules: R5 (observability), R17 (retention — 90-day retain_until).
-- Risk classification: Elevated (new table). Founder-walked apply.
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Append-only (service-role-only, no
-- UPDATE/DELETE by anyone; RLS on with no policy → PostgREST anon/authenticated
-- cannot read or write). The writer is missing-table-benign, so applying this
-- migration is the ONLY step to activate it (no flag).
--
-- PII: metadata only (route/method/type/message/stack/status) — never request
-- bodies or user content; no user_id column (operational telemetry, not a
-- user's personal data). 90-day retention.
-- ============================================================================

-- §1 — Table
CREATE TABLE IF NOT EXISTS public.route_errors (
  error_id      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  route         text        NOT NULL,
  method        text,
  error_type    text,
  message       text,
  stack         text,
  status_code   integer,
  is_llm_outage boolean     NOT NULL DEFAULT false,
  context       jsonb,
  retain_until  timestamptz NOT NULL DEFAULT (now() + interval '90 days')
);

-- §2 — Indexes
CREATE INDEX IF NOT EXISTS idx_route_errors_occurred_at ON public.route_errors (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_errors_route       ON public.route_errors (route);
CREATE INDEX IF NOT EXISTS idx_route_errors_llm_outage  ON public.route_errors (is_llm_outage) WHERE is_llm_outage;
CREATE INDEX IF NOT EXISTS idx_route_errors_retain_until ON public.route_errors (retain_until);

-- §3 — RLS: service-role only (RLS enabled, NO policy → locked to service role)
ALTER TABLE public.route_errors ENABLE ROW LEVEL SECURITY;

-- §4 — Append-only: no UPDATE/DELETE for anyone but the service role, enforced
--      by a trigger (belt-and-braces beyond the REVOKE).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.route_errors FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.route_errors FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.route_errors FROM authenticated;

CREATE OR REPLACE FUNCTION public.route_errors_forbid_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'route_errors is append-only; % is forbidden', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS trg_route_errors_forbid_mutation ON public.route_errors;
CREATE TRIGGER trg_route_errors_forbid_mutation
  BEFORE UPDATE OR DELETE ON public.route_errors
  FOR EACH ROW EXECUTE FUNCTION public.route_errors_forbid_mutation();

-- §5 — Comments
COMMENT ON TABLE public.route_errors IS
  'P-GL #5 — append-only production error store. Written by lib/observability-store.ts recordRouteError() from route catch blocks. Metadata only, no PII/user content; service-role-only; 90-day retain_until.';

-- ============================================================================
-- VERIFY (run after apply — all should return the expected rows)
-- ============================================================================
-- 1. Table exists:
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'route_errors';
-- 2. Columns (expect 10):
SELECT column_name, data_type, is_nullable FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'route_errors' ORDER BY ordinal_position;
-- 3. Indexes (expect 4 idx_route_errors_* + the PK):
SELECT indexname FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'route_errors';
-- 4. RLS enabled (expect rowsecurity = true):
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'route_errors';
-- 5. Append-only trigger present:
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.route_errors'::regclass AND NOT tgisinternal;

-- ============================================================================
-- ROLLBACK (only if the migration itself is faulty)
-- ============================================================================
-- BEGIN;
--   DROP TRIGGER IF EXISTS trg_route_errors_forbid_mutation ON public.route_errors;
--   DROP FUNCTION IF EXISTS public.route_errors_forbid_mutation();
--   DROP TABLE IF EXISTS public.route_errors;
-- COMMIT;
