-- ============================================================================
-- 2026-05-03 — open_deferrals + deferral_resolutions schema
-- ============================================================================
--
-- Source: ADR-ENCRYPTION-WIRING-01 (Adopted 2026-05-02) §Decision 3
--         + D14b §"Schema additions" (queryable fields)
--         + KG7 (JSONB storage shape — meta passed as plain object)
--         + R17b (application-level encryption beyond database-level)
--         + R17c (genuine deletion via ON DELETE CASCADE)
--
-- This migration creates the two D14b tables that Phase-2 pass-1 will
-- populate. With MENTOR_RAG_V1=false (default), the new route does NOT
-- write to these tables — they sit dormant until pass-1 commencement.
--
-- Idempotent: CREATE ... IF NOT EXISTS guards make re-running safe.
--
-- Rollback: DROP TABLE deferral_resolutions; DROP TABLE open_deferrals;
--           (Order matters — deferral_resolutions has FK to open_deferrals.)
--
-- Apply via: Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- open_deferrals — Tier 3 OPEN_DEFERRAL flag table
-- ----------------------------------------------------------------------------
-- Queryable fields (status, trigger_code, instance_id, etc.) are stored in
-- the clear because the page-side flow filters by them at SELECT time.
-- Intimate content (the deferred question slot fills, the practitioner's
-- specific reasoning context) goes into encrypted_payload.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS open_deferrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL,
  trigger_code VARCHAR(64) NOT NULL,
  intake_tier INTEGER NOT NULL DEFAULT 3,
  withheld_classification JSONB NOT NULL,
  deferred_question JSONB NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_reflection_id UUID,
  retrospective_update JSONB,
  -- Application-level encryption per R17b (ADR-ENCRYPTION-WIRING-01 §Decision 3).
  -- TEXT for ciphertext (base64) + JSONB for meta — matches mentor_profiles pattern.
  -- Nullable at DDL level; the route layer enforces presence at INSERT time.
  encrypted_payload TEXT,
  encryption_meta JSONB
);

CREATE INDEX IF NOT EXISTS idx_open_deferrals_user_status ON open_deferrals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_open_deferrals_instance ON open_deferrals(instance_id);

ALTER TABLE open_deferrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_deferrals_user_own" ON open_deferrals;
CREATE POLICY "open_deferrals_user_own"
  ON open_deferrals
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- deferral_resolutions — practitioner submissions resolving open deferrals
-- ----------------------------------------------------------------------------
-- Two encrypted fields per row: reflection_content + engine_diagnostics.
-- Each follows the per-column ciphertext + companion JSONB meta pattern
-- per ADR-ENCRYPTION-WIRING-01 §Decision 3.
-- ON DELETE CASCADE on open_deferral_id provides R17c genuine cascade
-- deletion: if an open_deferral is deleted, its resolutions go with it.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS deferral_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  open_deferral_id UUID NOT NULL REFERENCES open_deferrals(id) ON DELETE CASCADE,
  -- Encrypted reflection_content (R17b) — TEXT ciphertext + JSONB meta.
  reflection_content TEXT NOT NULL,
  reflection_content_meta JSONB NOT NULL,
  -- Encrypted engine_diagnostics (R17b) — TEXT ciphertext + JSONB meta.
  engine_diagnostics_ciphertext TEXT NOT NULL,
  engine_diagnostics_meta JSONB NOT NULL,
  -- Non-sensitive queryable flag.
  tier_3_recascade_fired BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deferral_resolutions_user ON deferral_resolutions(user_id);
CREATE INDEX IF NOT EXISTS idx_deferral_resolutions_deferral ON deferral_resolutions(open_deferral_id);

ALTER TABLE deferral_resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deferral_resolutions_user_own" ON deferral_resolutions;
CREATE POLICY "deferral_resolutions_user_own"
  ON deferral_resolutions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Post-apply verification queries (run separately after the above)
-- ============================================================================
-- Confirm tables exist:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_name IN ('open_deferrals', 'deferral_resolutions');
--   Expected: 2 rows
--
-- Confirm RLS enabled:
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE relname IN ('open_deferrals', 'deferral_resolutions');
--   Expected: 2 rows, both with relrowsecurity = true
--
-- Confirm indexes:
--   SELECT indexname FROM pg_indexes
--   WHERE tablename IN ('open_deferrals', 'deferral_resolutions');
--   Expected: 4 user-defined indexes
--   (idx_open_deferrals_user_status, idx_open_deferrals_instance,
--    idx_deferral_resolutions_user, idx_deferral_resolutions_deferral)
--
-- Confirm policies:
--   SELECT polname, relname FROM pg_policy p
--   JOIN pg_class c ON p.polrelid = c.oid
--   WHERE c.relname IN ('open_deferrals', 'deferral_resolutions');
--   Expected: 2 rows (one policy per table)
-- ============================================================================
