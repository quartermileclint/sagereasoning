-- Migration: 20260415_r17a_audit_schema
-- Purpose: Build the audit destination promised by R17a §4 and §5.
--   Creates support_decrypt_request (workflow gate) and support_access_log
--   (append-only audit trail), plus the support_access_type enum.
-- Related: R17a (intimate data tiering), R20a (vulnerable user protections —
--   Phase B depends on this migration being live).
-- Decision log: 15 April 2026 — Critical Change Protocol CCP-R17a-01.
-- Rollback: see §4 of the CCP output or the rollback block at the end of
--   this file (commented out).
--
-- Risk classification: Critical (access control, audit trail, data governance).
-- Verified by: six queries Q1–Q6 per CCP §5.

-- ============================================================================
-- 1. Enum type
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_access_type') THEN
    CREATE TYPE support_access_type AS ENUM (
      'flag_review',
      'field_decrypt',
      'support_request'
    );
  END IF;
END
$$;

-- ============================================================================
-- 2. support_decrypt_request — workflow gate
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_decrypt_request (
  request_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  access_type    support_access_type NOT NULL,
  field_name     TEXT,
  reason         TEXT NOT NULL,
  session_id     UUID,
  requested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at    TIMESTAMPTZ,
  approved_by    UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  expires_at     TIMESTAMPTZ,
  revoked_at     TIMESTAMPTZ,

  CONSTRAINT sdr_reason_not_empty
    CHECK (length(trim(reason)) >= 10),

  CONSTRAINT sdr_field_name_required_for_decrypt
    CHECK (access_type <> 'field_decrypt' OR field_name IS NOT NULL),

  CONSTRAINT sdr_expiry_consistent
    CHECK (approved_at IS NULL OR expires_at IS NOT NULL),

  CONSTRAINT sdr_approved_by_consistent
    CHECK ((approved_at IS NULL AND approved_by IS NULL)
           OR (approved_at IS NOT NULL AND approved_by IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_sdr_user_id
  ON public.support_decrypt_request (user_id);

CREATE INDEX IF NOT EXISTS idx_sdr_reviewer_id
  ON public.support_decrypt_request (reviewer_id);

CREATE INDEX IF NOT EXISTS idx_sdr_unapproved
  ON public.support_decrypt_request (requested_at)
  WHERE approved_at IS NULL AND revoked_at IS NULL;

-- ============================================================================
-- 3. support_access_log — append-only audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.support_access_log (
  log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewer_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  access_type    support_access_type NOT NULL,
  field_name     TEXT,
  reason         TEXT NOT NULL,
  session_id     UUID,
  request_id     UUID REFERENCES public.support_decrypt_request(request_id) ON DELETE RESTRICT,
  outcome        TEXT NOT NULL,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT sal_reason_not_empty
    CHECK (length(trim(reason)) >= 10),

  CONSTRAINT sal_outcome_valid
    CHECK (outcome IN ('granted', 'denied', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_sal_user_id
  ON public.support_access_log (user_id);

CREATE INDEX IF NOT EXISTS idx_sal_reviewer_id
  ON public.support_access_log (reviewer_id);

CREATE INDEX IF NOT EXISTS idx_sal_occurred_at
  ON public.support_access_log (occurred_at DESC);

-- ============================================================================
-- 4. Row-Level Security
-- ============================================================================

ALTER TABLE public.support_decrypt_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_access_log ENABLE ROW LEVEL SECURITY;

-- support_decrypt_request: owner can read their own requests
DROP POLICY IF EXISTS sdr_owner_select ON public.support_decrypt_request;
CREATE POLICY sdr_owner_select
  ON public.support_decrypt_request
  FOR SELECT
  USING (auth.uid() = user_id);

-- support_decrypt_request: support role can read requests where they are the reviewer
DROP POLICY IF EXISTS sdr_reviewer_select ON public.support_decrypt_request;
CREATE POLICY sdr_reviewer_select
  ON public.support_decrypt_request
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'support'
    AND auth.uid() = reviewer_id
  );

-- support_decrypt_request: support role can insert new requests
DROP POLICY IF EXISTS sdr_reviewer_insert ON public.support_decrypt_request;
CREATE POLICY sdr_reviewer_insert
  ON public.support_decrypt_request
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'support'
    AND auth.uid() = reviewer_id
    AND approved_at IS NULL
    AND approved_by IS NULL
  );

-- support_decrypt_request: only admin can approve (set approved_at / approved_by / expires_at)
DROP POLICY IF EXISTS sdr_admin_approve ON public.support_decrypt_request;
CREATE POLICY sdr_admin_approve
  ON public.support_decrypt_request
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- support_access_log: owner can read their own audit rows
DROP POLICY IF EXISTS sal_owner_select ON public.support_access_log;
CREATE POLICY sal_owner_select
  ON public.support_access_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- support_access_log: support role can read rows where they are the reviewer
DROP POLICY IF EXISTS sal_reviewer_select ON public.support_access_log;
CREATE POLICY sal_reviewer_select
  ON public.support_access_log
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'support'
    AND auth.uid() = reviewer_id
  );

-- support_access_log: service role (application layer) can insert new rows.
-- Supabase service-role bypasses RLS, so no policy is needed for inserts from
-- the trusted server context. An explicit authenticated-role policy is NOT
-- created — this is intentional. Only server-side code with service role may
-- write audit entries.

-- ============================================================================
-- 5. Append-only enforcement on support_access_log
-- ============================================================================

-- Revoke mutation grants from any client-facing role.
-- Service role retains full access for application-layer insertion.
REVOKE UPDATE, DELETE ON public.support_access_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON public.support_access_log FROM authenticated;
REVOKE UPDATE, DELETE ON public.support_access_log FROM anon;

-- Defence in depth: a trigger that raises an exception on UPDATE or DELETE
-- regardless of role. Blocks accidental service-role mutations too.
CREATE OR REPLACE FUNCTION public.support_access_log_append_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'support_access_log is append-only; % not permitted', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS trg_sal_no_update ON public.support_access_log;
CREATE TRIGGER trg_sal_no_update
  BEFORE UPDATE ON public.support_access_log
  FOR EACH ROW EXECUTE FUNCTION public.support_access_log_append_only();

DROP TRIGGER IF EXISTS trg_sal_no_delete ON public.support_access_log;
CREATE TRIGGER trg_sal_no_delete
  BEFORE DELETE ON public.support_access_log
  FOR EACH ROW EXECUTE FUNCTION public.support_access_log_append_only();

-- ============================================================================
-- 6. Comments (documentation in-schema)
-- ============================================================================

COMMENT ON TABLE public.support_decrypt_request IS
  'R17a §5 workflow gate. A request to access another user''s Tier C data or '
  'perform a flag review. Must be approved by admin before access is granted. '
  'See /compliance/R17a-encrypted-fields.md and /compliance/R20a-*.md.';

COMMENT ON TABLE public.support_access_log IS
  'R17a §4 append-only audit trail. Every support-role access to another '
  'user''s encrypted data writes a row here. No updates or deletes are ever '
  'permitted. The user can view their own audit history.';

COMMENT ON TYPE support_access_type IS
  'Kind of support access: flag_review (R20a), field_decrypt (R17a Tier C), '
  'support_request (general support enquiry touching the user''s account).';

-- ============================================================================
-- Rollback block (commented out — uncomment and run if verification fails)
-- ============================================================================
--
-- BEGIN;
--   DROP TRIGGER IF EXISTS trg_sal_no_delete ON public.support_access_log;
--   DROP TRIGGER IF EXISTS trg_sal_no_update ON public.support_access_log;
--   DROP FUNCTION IF EXISTS public.support_access_log_append_only();
--   DROP TABLE IF EXISTS public.support_access_log;
--   DROP TABLE IF EXISTS public.support_decrypt_request;
--   DROP TYPE IF EXISTS support_access_type;
-- COMMIT;
