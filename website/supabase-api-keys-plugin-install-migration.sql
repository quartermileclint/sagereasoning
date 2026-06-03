-- ============================================================
-- SageReasoning — A10 Per-Install Plugin-Auth Credentials: api_keys migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Implements Surface 1 of the A10 Token-Format ADR
-- (/adopted/adr/2026-06-03-a10-token-format.md — Accepted 2026-06-03).
--
-- STATUS: AUTHORED, NOT YET RUN. This file is scaffolded at the A10 kickoff
-- session (2026-06-03) alongside the plugin-install-auth.ts library proof. It is
-- executed by the founder at the A10 Critical implementation session (staging-plan
-- session 12), under the full Critical Change Protocol, NOT this session.
--
-- ADDITIVE + IDEMPOTENT. Safe to re-run. Touches ONLY the new plugin_install
-- surface — it does not alter ecosystem (sr_live_) or sage_assent_write rows.
--
-- REUSE NOTE: key_hash, is_active, suspended_reason, revoked_at, owner_user_id
-- ALREADY EXIST on public.api_keys (added by prior migrations). They are reused,
-- not re-added. The universal revocation check is the existing is_active flag.
--
-- PURPOSE-VALUE NOTE: the live purpose CHECK currently admits
-- ('ecosystem','sage_assent_write') after the Track-C Phase-3 rename
-- (supabase-api-keys-phase3-scope-rename-migration.sql). This migration DROPS and
-- RE-ADDS the CHECK to additionally admit 'plugin_install'. Existing rows are
-- untouched (their purpose values remain valid members of the widened set).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Widen the purpose discriminator to admit 'plugin_install'.
--    Drop-and-re-add so the new value is accepted. Idempotent: the re-add is
--    guarded; re-running is a no-op once the widened CHECK is in place.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  DROP CONSTRAINT IF EXISTS api_keys_purpose_check;

DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_purpose_check
    CHECK (purpose IN ('ecosystem', 'sage_assent_write', 'plugin_install'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 2. identity_type — 'human' | 'agent' (A10 identity discrimination).
--    NULL allowed at column level; the load-bearing invariant in step 5 requires
--    it to be set on ACTIVE plugin_install rows.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS identity_type TEXT;

DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_identity_type_check
    CHECK (identity_type IS NULL OR identity_type IN ('human', 'agent'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 3. install_id — the per-install identifier (replaces the shared
--    PLUGIN_AUTH_SECRET). Free-form text; uniqueness is per-install, not global.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS install_id TEXT;

-- ------------------------------------------------------------
-- 4. install_scope — 'assessment-only' | 'mentor-also' | 'admin'.
-- ------------------------------------------------------------
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS install_scope TEXT;

DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_install_scope_check
    CHECK (install_scope IS NULL OR
           install_scope IN ('assessment-only', 'mentor-also', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 5. Load-bearing invariant for ACTIVE purpose='plugin_install' rows.
--    Mirrors the sage_assent_write invariant: a revoked tombstone (is_active=false)
--    is exempt so revocation / owner-deletion can complete, but an ACTIVE
--    plugin_install credential MUST carry identity_type + install_id + install_scope.
-- ------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_plugin_install_requires_identity
    CHECK (purpose != 'plugin_install'
           OR is_active = false
           OR (identity_type IS NOT NULL
               AND install_id IS NOT NULL
               AND install_scope IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- 6. Lookup index for the verification path (hash lookup is already covered by
--    the existing key_hash index; this supports admin per-install listing/revoke,
--    INCLUDING revoked tombstones).
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS api_keys_plugin_install_install_id_idx
  ON public.api_keys (install_id)
  WHERE purpose = 'plugin_install';

-- ------------------------------------------------------------
-- 6b. One-active-credential-per-install invariant (design decision, 2026-06-03
--     A10 Critical implementation; founder election "One active per install").
--     A PARTIAL UNIQUE index: at most one ACTIVE plugin_install credential may
--     exist for a given install_id at a time. Revoked tombstones (is_active=false)
--     are exempt, so an install can be RE-ISSUED after revoke (a new active row +
--     the old dead one). This gives the admin mint route a clean 409 ("a
--     credential already exists for this install — revoke it first"), mirroring
--     the accreditation path's (owner, agent_id) partial-unique-on-active index.
--     Idempotent via IF NOT EXISTS.
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_plugin_install_one_active_uniq_idx
  ON public.api_keys (install_id)
  WHERE purpose = 'plugin_install' AND is_active = true;

-- ============================================================
-- 7. VERIFY — paste the output of these back to confirm the migration.
-- ============================================================

-- 7a. New columns present
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'api_keys'
  AND column_name IN ('identity_type', 'install_id', 'install_scope', 'purpose')
ORDER BY column_name;

-- 7b. Constraints present (purpose widened + the three new checks)
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname IN
    ('api_keys_purpose_check', 'api_keys_identity_type_check',
     'api_keys_install_scope_check', 'api_keys_plugin_install_requires_identity')
ORDER BY conname;

-- 7c. Indexes present (the listing index AND the one-active-per-install unique
--     index from step 6b — expect BOTH rows)
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'api_keys'
  AND indexname IN
    ('api_keys_plugin_install_install_id_idx',
     'api_keys_plugin_install_one_active_uniq_idx')
ORDER BY indexname;

-- 7d. Purpose CHECK admits 'plugin_install' (expect the widened definition)
SELECT pg_get_constraintdef(oid) AS purpose_check_def
FROM pg_constraint
WHERE conrelid = 'public.api_keys'::regclass
  AND conname = 'api_keys_purpose_check';

-- 7e. Safety check — confirm NO active plugin_install rows would violate the
--     identity invariant (expect 0; there should be no such rows yet).
SELECT count(*) AS bad_active_plugin_install_rows
FROM public.api_keys
WHERE purpose = 'plugin_install'
  AND is_active = true
  AND (identity_type IS NULL OR install_id IS NULL OR install_scope IS NULL);
