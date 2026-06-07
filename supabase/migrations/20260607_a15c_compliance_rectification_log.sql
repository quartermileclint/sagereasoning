-- =============================================================================
-- A15c — compliance_rectification_log
-- GDPR Article 16 (Right to Rectification) before/after audit — R17h.
--
-- Records each field correction made via /api/user/rectify with its before and
-- after values, without storing a raw PII identifier: the subject is recorded as
-- a one-way SHA-256 hash of the user id. Written server-side only (via the
-- service-role client in /api/user/rectify). RLS is enabled with NO policies, so
-- the anon and authenticated roles cannot read or write it; only the service
-- role (which bypasses RLS) can insert. Mirrors compliance_access_log (A15b) and
-- compliance_deletion_log.
--
-- Immutable by intent (an Art 16 audit must not be altered after the fact). Hard
-- enforcement via a no-delete/no-update trigger is deliberately omitted to keep
-- TEST teardown simple (same decision as compliance_access_log); it can be added
-- later as a hardening step if wanted.
--
-- The /api/user/rectify allow-list is restricted to non-intimate factual profile
-- fields (display_name, city, country), so old_value / new_value here never
-- contain R17b intimate/encrypted data — this table therefore needs no field
-- encryption.
--
-- Idempotent: safe to run more than once. Run on TEST first, then production.
-- =============================================================================

create table if not exists public.compliance_rectification_log (
  id            uuid        primary key default gen_random_uuid(),
  event         text        not null default 'rectification',
  subject_hash  text        not null,
  field         text        not null,
  old_value     text,
  new_value     text        not null,
  rectified_at  timestamptz not null default now()
);

comment on table public.compliance_rectification_log is
  'GDPR Art 16 rectification before/after audit (R17h). Server-write only. No raw PII — subject stored as SHA-256 hash. Allow-list excludes intimate data, so values are non-intimate profile facts.';

-- Lookups / audit reporting by time.
create index if not exists idx_compliance_rectification_log_rectified_at
  on public.compliance_rectification_log (rectified_at);

-- Enable RLS with no policies: anon + authenticated are denied; service role
-- (used by the API route) bypasses RLS and can insert.
alter table public.compliance_rectification_log enable row level security;
