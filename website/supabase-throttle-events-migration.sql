-- ============================================================================
-- Migration: throttle_events — rate-limit / throttle visibility (#8, P-GL)
-- Run in: Supabase Dashboard → SQL Editor (production project)
--
-- Purpose: rate limiting exists (IP in-memory + API-key quota) but throttle
--   events were never persisted, so a production 429 could not be told from a
--   bug. lib/security.ts writes one row here at each 429 return point via
--   lib/observability-store.ts recordThrottleEvent().
--
-- Related rules: R5 (observability), R17 (retention — 90-day retain_until).
-- Risk classification: Elevated (new table). Founder-walked apply.
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Append-only + service-role-only. The
-- writer is missing-table-benign, so applying this migration is the ONLY step
-- to activate it (no flag).
--
-- PII: the client IP is stored as a SHA-256 hash (ip_hash), never raw; the
-- quota limiters store a credential id (not the raw key). 90-day retention.
-- ============================================================================

-- §1 — Table
CREATE TABLE IF NOT EXISTS public.throttle_events (
  throttle_id    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  category       text        NOT NULL,
  limiter        text        NOT NULL,
  ip_hash        text,
  credential_ref text,
  endpoint       text,
  limit_value    integer,
  window_seconds integer,
  retain_until   timestamptz NOT NULL DEFAULT (now() + interval '90 days')
);

-- limiter is a small controlled vocabulary — guard it (idempotent add).
DO $$ BEGIN
  ALTER TABLE public.throttle_events
    ADD CONSTRAINT throttle_events_limiter_check
    CHECK (limiter IN ('ip', 'api_key_monthly', 'api_key_daily'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- §2 — Indexes
CREATE INDEX IF NOT EXISTS idx_throttle_events_occurred_at ON public.throttle_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_throttle_events_category    ON public.throttle_events (category);
CREATE INDEX IF NOT EXISTS idx_throttle_events_limiter     ON public.throttle_events (limiter);
CREATE INDEX IF NOT EXISTS idx_throttle_events_retain_until ON public.throttle_events (retain_until);

-- §3 — RLS: service-role only (RLS enabled, NO policy → locked to service role)
ALTER TABLE public.throttle_events ENABLE ROW LEVEL SECURITY;

-- §4 — Append-only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.throttle_events FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.throttle_events FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.throttle_events FROM authenticated;

CREATE OR REPLACE FUNCTION public.throttle_events_forbid_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'throttle_events is append-only; % is forbidden', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS trg_throttle_events_forbid_mutation ON public.throttle_events;
CREATE TRIGGER trg_throttle_events_forbid_mutation
  BEFORE UPDATE OR DELETE ON public.throttle_events
  FOR EACH ROW EXECUTE FUNCTION public.throttle_events_forbid_mutation();

-- §5 — Comments
COMMENT ON TABLE public.throttle_events IS
  'P-GL #8 — append-only rate-limit/throttle log. Written by lib/security.ts at each 429 return point via lib/observability-store.ts recordThrottleEvent(). IP stored as a SHA-256 hash; service-role-only; 90-day retain_until.';

-- ============================================================================
-- VERIFY (run after apply)
-- ============================================================================
-- 1. Table exists:
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'throttle_events';
-- 2. Columns (expect 10):
SELECT column_name, data_type, is_nullable FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'throttle_events' ORDER BY ordinal_position;
-- 3. limiter CHECK present:
SELECT conname FROM pg_constraint WHERE conname = 'throttle_events_limiter_check';
-- 4. Indexes (expect 4 idx_throttle_events_* + the PK):
SELECT indexname FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'throttle_events';
-- 5. RLS enabled + trigger present:
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'throttle_events';
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.throttle_events'::regclass AND NOT tgisinternal;

-- ============================================================================
-- ROLLBACK (only if the migration itself is faulty)
-- ============================================================================
-- BEGIN;
--   DROP TRIGGER IF EXISTS trg_throttle_events_forbid_mutation ON public.throttle_events;
--   DROP FUNCTION IF EXISTS public.throttle_events_forbid_mutation();
--   DROP TABLE IF EXISTS public.throttle_events;
-- COMMIT;
