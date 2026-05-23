-- ============================================================
-- SageReasoning — A10 Per-Agent Credentials: api_keys migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Implements Decisions B + C + F + 3a of /adopted/sage-assent-a10-design.md
-- (Adopted under D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17).
-- Executed at the A10 build session (D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21).
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run.
--
-- NOTE (Finding 1): agent_id (api/api-keys-schema.sql line 75) and
-- owner_user_id (line 77, REFERENCES public.profiles(id) ON DELETE SET NULL)
-- ALREADY EXIST. They are NOT added here — only reused. The existing
-- idx_api_keys_owner_user_id index (line 105) is reused for owner lookups.
--
-- BUILD-SESSION REFINEMENT (2026-05-21): the founder elected immediate
-- orphaned-credential auto-revocation (AskUserQuestion, Step 1). That election
-- is incompatible with the design's literally-locked CHECK constraint:
-- ON DELETE SET NULL on owner_user_id would try to NULL the owner of an
-- atl_write credential when its owner profile is deleted, which the locked
-- CHECK (atl_write => owner_user_id NOT NULL) would REJECT — blocking the
-- profile deletion entirely. The minimal accommodation, within the design's
-- granted discretion ("orphaned atl_write rows cannot pass verification"), is
-- to exempt REVOKED tombstones (is_active = false) from the owner/agent NOT
-- NULL requirement. The load-bearing invariant is preserved exactly:
--   ACTIVE atl_write credentials MUST be owner- and agent-bound.
-- A revoked tombstone can never authenticate (verification filters
-- is_active = true), so the verification invariant the design names is intact.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Discriminator column — distinguishes legacy ecosystem keys from A10
--    write tokens. Existing rows default to 'ecosystem'.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'ecosystem';

DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_purpose_check
    CHECK (purpose IN ('ecosystem', 'atl_write'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 2. Revocation audit timestamp (Decision F). NULL for active credentials.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- ------------------------------------------------------------
-- 3. Per-credential scoping columns (Decision 3a).
--    NULL = no restriction; a set value scopes the credential so it only
--    matches a CarriedProfile with that exact value (enforced at verification
--    time in security.ts validateAtlWriteToken).
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS scope_downstream_identity_model TEXT;

DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_scope_identity_check
    CHECK (scope_downstream_identity_model IS NULL OR
           scope_downstream_identity_model IN
           ('delegated_user', 'service_account', 'vendor_framework',
            'api_key', 'browser_session', 'mcp_server', 'unknown'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS scope_path_posture TEXT;

DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_scope_path_check
    CHECK (scope_path_posture IS NULL OR
           scope_path_posture IN
           ('endorsed', 'open_api', 'ambiguous', 'unsanctioned'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 4. Load-bearing invariant for ACTIVE purpose='atl_write' rows.
--    REFINED 2026-05-21 (see header): is_active = false rows are exempt so
--    orphan auto-revocation + ON DELETE SET NULL can complete. Active
--    atl_write credentials are still required to carry both agent_id and
--    owner_user_id.
-- ------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_atl_write_requires_owner_and_agent
    CHECK (purpose != 'atl_write'
           OR is_active = false
           OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 5. Indexes for A10 lookup paths.
--    Unique index: one credential per (owner, agent_id) for atl_write rows
--    (per Decision B; matches the design's literal definition). Revoke +
--    reissue for the SAME (owner, agent) is a known limitation aligned with
--    the PR7 reactivation deferral; orphan tombstones go owner_user_id=NULL
--    so they never block a different owner re-claiming the agent_id.
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_atl_write_owner_agent_unique
  ON public.api_keys (owner_user_id, agent_id, purpose)
  WHERE purpose = 'atl_write';

CREATE INDEX IF NOT EXISTS api_keys_purpose_agent_id_idx
  ON public.api_keys (purpose, agent_id)
  WHERE purpose = 'atl_write';

-- ------------------------------------------------------------
-- 6. Orphaned-credential auto-revocation (founder election, Step 1).
--    BEFORE DELETE on profiles: revoke any ACTIVE atl_write credential the
--    deleted profile owns, BEFORE the FK's ON DELETE SET NULL fires. Net
--    effect: deleting a profile auto-revokes its atl_write credentials (which
--    then fail verification on is_active=false), and the refined CHECK in step
--    4 lets the subsequent owner_user_id=NULL update succeed. Self-contained —
--    does not write credential_audit (keeps migration ordering dependency-free;
--    the revocation reason is recorded on the row's suspended_reason).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_atl_credentials_on_profile_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.api_keys
    SET is_active = false,
        revoked_at = COALESCE(revoked_at, NOW()),
        suspended_reason = COALESCE(suspended_reason, 'owner_profile_deleted')
    WHERE owner_user_id = OLD.id
      AND purpose = 'atl_write'
      AND is_active = true;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS revoke_atl_credentials_before_profile_delete ON public.profiles;
CREATE TRIGGER revoke_atl_credentials_before_profile_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.revoke_atl_credentials_on_profile_delete();

-- ============================================================
-- 7. VERIFY — paste the output of these back to confirm the migration.
-- ============================================================

-- 7a. New + reused columns present
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'api_keys'
  AND column_name IN
    ('purpose', 'revoked_at', 'scope_downstream_identity_model',
     'scope_path_posture', 'agent_id', 'owner_user_id')
ORDER BY column_name;

-- 7b. Constraints present
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname IN
    ('api_keys_purpose_check', 'api_keys_scope_identity_check',
     'api_keys_scope_path_check', 'api_keys_atl_write_requires_owner_and_agent')
ORDER BY conname;

-- 7c. Indexes present
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'api_keys'
  AND indexname IN
    ('api_keys_atl_write_owner_agent_unique', 'api_keys_purpose_agent_id_idx')
ORDER BY indexname;

-- 7d. Orphan-revocation trigger present
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass
  AND tgname = 'revoke_atl_credentials_before_profile_delete';

-- 7e. Safety check — confirm NO pre-existing atl_write rows would violate the
--     active-row invariant (expect 0 rows).
SELECT count(*) AS bad_active_atl_write_rows
FROM public.api_keys
WHERE purpose = 'atl_write'
  AND is_active = true
  AND (agent_id IS NULL OR owner_user_id IS NULL);
