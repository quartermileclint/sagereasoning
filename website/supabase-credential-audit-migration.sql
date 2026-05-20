-- ============================================================
-- SageReasoning — A10 Per-Agent Credentials: credential_audit table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Implements Decision H of /adopted/atl-a10-design.md
-- (Adopted under D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17).
-- Executed at the A10 build session (D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run.
--
-- The append-only audit trail for credential lifecycle events (issue +
-- revoke). actor_user_id references public.profiles(id) (Finding 1 — matches
-- the owner_user_id reference target). Verification-path events go to Vercel
-- structured logs, not this table (asymmetric audit; Decision H).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.credential_audit (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      text        NOT NULL,                              -- 'issue' | 'revoke'
  credential_id   uuid        NOT NULL REFERENCES public.api_keys(id),
  actor_user_id   uuid        REFERENCES public.profiles(id),        -- admin/owner who triggered it; NULL for system events
  agent_id        text        NOT NULL,
  details         jsonb,                                             -- { reason?, label?, tier?, scope_* } — free-form context (KG7 not engaged)
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- House-style enum guard on event_type (additive hardening over the design's
-- free-text DDL; the application only ever writes 'issue' or 'revoke').
DO $$ BEGIN
  ALTER TABLE public.credential_audit
    ADD CONSTRAINT credential_audit_event_type_check
    CHECK (event_type IN ('issue', 'revoke'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS credential_audit_credential_id_idx
  ON public.credential_audit (credential_id);
CREATE INDEX IF NOT EXISTS credential_audit_agent_id_idx
  ON public.credential_audit (agent_id);
CREATE INDEX IF NOT EXISTS credential_audit_actor_user_id_idx
  ON public.credential_audit (actor_user_id);

-- RLS: admin-only via service role, mirroring api_keys (all access server-side
-- through supabaseAdmin). No user-facing policies — RLS on with no policy
-- locks the table to the service role.
ALTER TABLE public.credential_audit ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY — paste the output back to confirm.
-- ============================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'credential_audit';

SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'credential_audit'
ORDER BY indexname;

SELECT conname FROM pg_constraint
WHERE conrelid = 'public.credential_audit'::regclass
  AND conname = 'credential_audit_event_type_check';
