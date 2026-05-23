-- ============================================================
-- SageReasoning — Track C Phase 3: DB scope rename
--   purpose value  'atl_write'  ->  'sage_assent_write'
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Part of D-...-C-PHASE3-... (ATL → Sage Assent external/wire-format finish).
-- This migration transitions the LIVE DB objects that the A10 migration
-- (D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21) created on the old scope value.
--
-- It does NOT edit the historical file `supabase-api-keys-a10-migration.sql`
-- (that file is the record of what was already run; it is left intact, like the
-- immutable D-ATL-* decision IDs). This file is the forward migration.
--
-- ADDITIVE-SAFE + IDEMPOTENT. Safe to re-run.
--
-- ORDERING (corrected 2026-05-23 after a first run failed on the old CHECK):
-- the old discriminator CHECK `api_keys_purpose_check` admits only
-- ('ecosystem','atl_write'), so it MUST be dropped BEFORE the backfill writes
-- the new value, then re-added afterwards. The load-bearing invariant CHECK is
-- likewise dropped up front and re-added (under its new name) after the backfill.
--
-- CUTOVER POSTURE: CLEAN CUTOVER. Pre-condition (founder-verified): ZERO active
-- 'atl_write' credentials. (Revoked tombstones are renamed too and are harmless —
-- they can never authenticate and the invariant CHECK exempts is_active=false.)
--
-- MINIMAL-DISRUPTION NOTE (R17c deletion path): the profile-delete trigger
-- function `revoke_atl_credentials_on_profile_delete` is updated IN PLACE via
-- CREATE OR REPLACE (only its WHERE predicate changes to 'sage_assent_write').
-- Its NAME and the trigger NAME are intentionally retained — internal identifiers
-- (not external contract, not user-visible). Replacing in place means there is NO
-- window in which a profile deletion lacks credential auto-revocation.
-- ============================================================

-- ------------------------------------------------------------
-- 0. INFORMATIONAL pre-check — how many rows will be renamed.
--    Clean-cutover expectation: active count = 0.
-- ------------------------------------------------------------
SELECT
  count(*) FILTER (WHERE is_active = true)  AS active_atl_write_rows,
  count(*) FILTER (WHERE is_active = false) AS revoked_atl_write_rows
FROM public.api_keys
WHERE purpose = 'atl_write';

-- ------------------------------------------------------------
-- 1. Drop the constraints that reference the OLD value FIRST, so the backfill
--    can write the new value. (DROP IF EXISTS = idempotent.)
--    - api_keys_purpose_check: admits only ('ecosystem','atl_write') today.
--    - api_keys_atl_write_requires_owner_and_agent: the load-bearing invariant
--      (recreated under its new name in step 4).
--    - api_keys_sage_assent_write_requires_owner_and_agent: drop too, in case a
--      prior partial run created it (idempotency).
-- ------------------------------------------------------------
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_purpose_check;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_atl_write_requires_owner_and_agent;
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;

-- ------------------------------------------------------------
-- 2. Backfill — rename the scope value on any existing rows.
--    Idempotent: zero atl_write rows on re-run. Now permitted because the old
--    CHECK was dropped in step 1.
-- ------------------------------------------------------------
UPDATE public.api_keys
  SET purpose = 'sage_assent_write'
  WHERE purpose = 'atl_write';

-- ------------------------------------------------------------
-- 3. Re-add the discriminator CHECK with the new value set.
--    Old: ('ecosystem','atl_write')  →  New: ('ecosystem','sage_assent_write').
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_purpose_check
  CHECK (purpose IN ('ecosystem', 'sage_assent_write'));

-- ------------------------------------------------------------
-- 4. Re-add the load-bearing invariant for ACTIVE write rows, new name + value.
--    Invariant preserved exactly: ACTIVE write credentials are owner- and
--    agent-bound; revoked tombstones (is_active=false) are exempt.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_sage_assent_write_requires_owner_and_agent
  CHECK (purpose != 'sage_assent_write'
         OR is_active = false
         OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));

-- ------------------------------------------------------------
-- 5. Unique index — one credential per (owner, agent_id) for write rows.
--    Recreate with the new value + new name (partial-index predicate cannot be
--    altered in place).
-- ------------------------------------------------------------
DROP INDEX IF EXISTS public.api_keys_atl_write_owner_agent_unique;
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_sage_assent_write_owner_agent_unique
  ON public.api_keys (owner_user_id, agent_id, purpose)
  WHERE purpose = 'sage_assent_write';

-- ------------------------------------------------------------
-- 6. Lookup index — recreate with the new predicate. (Name is generic, retained.)
-- ------------------------------------------------------------
DROP INDEX IF EXISTS public.api_keys_purpose_agent_id_idx;
CREATE INDEX IF NOT EXISTS api_keys_purpose_agent_id_idx
  ON public.api_keys (purpose, agent_id)
  WHERE purpose = 'sage_assent_write';

-- ------------------------------------------------------------
-- 7. Profile-delete auto-revocation (R17c deletion path) — update the WHERE
--    predicate to the new value. CREATE OR REPLACE keeps the function/trigger
--    names and avoids any coverage gap (see header MINIMAL-DISRUPTION NOTE).
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
      AND purpose = 'sage_assent_write'
      AND is_active = true;
  RETURN OLD;
END;
$$;
-- Trigger `revoke_atl_credentials_before_profile_delete` already points at this
-- function and needs no change (the replaced body takes effect immediately).

-- ============================================================
-- 8. VERIFY — paste the output of these back to confirm the migration.
-- ============================================================

-- 8a. No 'atl_write' rows remain (expect 0); count of new-value rows.
SELECT
  count(*) FILTER (WHERE purpose = 'atl_write')        AS remaining_atl_write,
  count(*) FILTER (WHERE purpose = 'sage_assent_write') AS sage_assent_write_rows
FROM public.api_keys;

-- 8b. Discriminator CHECK now admits the new value set.
SELECT pg_get_constraintdef(oid) AS purpose_check_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_purpose_check';

-- 8c. New-named constraint + indexes present; old names absent.
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname IN ('api_keys_sage_assent_write_requires_owner_and_agent',
                  'api_keys_atl_write_requires_owner_and_agent')
ORDER BY conname;

SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'api_keys'
  AND indexname IN ('api_keys_sage_assent_write_owner_agent_unique',
                    'api_keys_atl_write_owner_agent_unique',
                    'api_keys_purpose_agent_id_idx')
ORDER BY indexname;
-- Expect: api_keys_sage_assent_write_requires_owner_and_agent present, the
-- atl_write-named constraint absent; the sage_assent_write unique index +
-- api_keys_purpose_agent_id_idx present, the atl_write unique index absent.

-- 8d. Trigger function predicate now filters the new value.
SELECT pg_get_functiondef('public.revoke_atl_credentials_on_profile_delete'::regproc) LIKE '%sage_assent_write%' AS predicate_uses_new_value;

-- 8e. Trigger still attached to profiles.
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass
  AND tgname = 'revoke_atl_credentials_before_profile_delete';

-- ============================================================
-- INVERSE ROLLBACK (commented) — restores the 'atl_write' scope value.
-- Same ordering discipline: drop the new CHECK before the reverse-backfill.
-- Run only to undo this migration.
-- ============================================================
-- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_purpose_check;
-- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_sage_assent_write_requires_owner_and_agent;
-- ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_atl_write_requires_owner_and_agent;
--
-- UPDATE public.api_keys SET purpose = 'atl_write' WHERE purpose = 'sage_assent_write';
--
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_purpose_check CHECK (purpose IN ('ecosystem', 'atl_write'));
-- ALTER TABLE public.api_keys
--   ADD CONSTRAINT api_keys_atl_write_requires_owner_and_agent
--   CHECK (purpose != 'atl_write' OR is_active = false
--          OR (agent_id IS NOT NULL AND owner_user_id IS NOT NULL));
--
-- DROP INDEX IF EXISTS public.api_keys_sage_assent_write_owner_agent_unique;
-- CREATE UNIQUE INDEX IF NOT EXISTS api_keys_atl_write_owner_agent_unique
--   ON public.api_keys (owner_user_id, agent_id, purpose) WHERE purpose = 'atl_write';
--
-- DROP INDEX IF EXISTS public.api_keys_purpose_agent_id_idx;
-- CREATE INDEX IF NOT EXISTS api_keys_purpose_agent_id_idx
--   ON public.api_keys (purpose, agent_id) WHERE purpose = 'atl_write';
--
-- CREATE OR REPLACE FUNCTION public.revoke_atl_credentials_on_profile_delete()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   UPDATE public.api_keys
--     SET is_active = false, revoked_at = COALESCE(revoked_at, NOW()),
--         suspended_reason = COALESCE(suspended_reason, 'owner_profile_deleted')
--     WHERE owner_user_id = OLD.id AND purpose = 'atl_write' AND is_active = true;
--   RETURN OLD;
-- END; $$;
-- ============================================================
