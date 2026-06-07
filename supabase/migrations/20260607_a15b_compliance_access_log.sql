-- =============================================================================
-- A15b — compliance_access_log
-- GDPR Article 15 (Right of Access / SAR) request logging — R17g procedural req.
--
-- Records that an access request occurred, without storing raw PII: the subject
-- is recorded as a one-way SHA-256 hash of the user id. Written server-side only
-- (via the service-role client in /api/user/access). RLS is enabled with NO
-- policies, so the anon and authenticated roles cannot read or write it; only
-- the service role (which bypasses RLS) can insert.
--
-- Append-only by intent (a compliance log should not be mutated). Hard
-- enforcement via a no-delete/no-update trigger is deliberately omitted to keep
-- TEST teardown simple (see PR5 carry-forward note re: substrate_audit_events
-- trigger friction); it can be added later as a hardening step if wanted.
--
-- Idempotent: safe to run more than once. Run on TEST first, then production.
-- =============================================================================

create table if not exists public.compliance_access_log (
  id            uuid        primary key default gen_random_uuid(),
  event         text        not null default 'access_request',
  subject_hash  text        not null,
  requested_at  timestamptz not null default now()
);

comment on table public.compliance_access_log is
  'GDPR Art 15 access-request audit log (R17g). Server-write only. No raw PII — subject stored as SHA-256 hash.';

-- Lookups / audit reporting by time.
create index if not exists idx_compliance_access_log_requested_at
  on public.compliance_access_log (requested_at);

-- Enable RLS with no policies: anon + authenticated are denied; service role
-- (used by the API route) bypasses RLS and can insert.
alter table public.compliance_access_log enable row level security;
