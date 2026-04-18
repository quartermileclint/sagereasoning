-- ============================================================================
-- MENTOR BASELINE APPENDIX — Encrypted refinement-round storage (R17b)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
-- ============================================================================

-- Stores one row per baseline refinement round as an APPENDIX to the mentor
-- profile. The profile itself (mentor_profiles table) is never modified by
-- this table; mentor endpoints may optionally read the latest appendix for
-- additional context in future (Stage 3 work).
--
-- Non-sensitive metadata in queryable columns; full payload (questions,
-- answers, refinement) encrypted at rest using MENTOR_ENCRYPTION_KEY
-- (AES-256-GCM). Same encryption pattern as mentor_profiles.

CREATE TABLE IF NOT EXISTS mentor_baseline_appendix (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Queryable metadata (non-sensitive)
  submitted_at          TIMESTAMPTZ NOT NULL,
  generated_at          TIMESTAMPTZ,
  responses_processed   INTEGER NOT NULL DEFAULT 0,
  ai_model              TEXT,
  receipt_id            TEXT,

  -- Encrypted payload (R17b: application-level encryption)
  -- Contains: { questions, answers, refinement }
  encrypted_payload     TEXT NOT NULL,
  encryption_meta       JSONB NOT NULL,

  -- Schema version for future changes to the encrypted payload shape
  schema_version        INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()

  -- NOTE: no UNIQUE(user_id) — users can have multiple rounds over time.
);

-- Index to make "latest round for user" queries fast
CREATE INDEX IF NOT EXISTS idx_mentor_baseline_appendix_user_submitted
  ON mentor_baseline_appendix(user_id, submitted_at DESC);

-- RLS: Users can only access their own rounds
ALTER TABLE mentor_baseline_appendix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own appendix rounds"
  ON mentor_baseline_appendix FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appendix rounds"
  ON mentor_baseline_appendix FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appendix rounds"
  ON mentor_baseline_appendix FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypasses RLS for API routes
-- (supabaseAdmin client uses service role key)

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_mentor_baseline_appendix_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentor_baseline_appendix_updated_at
  BEFORE UPDATE ON mentor_baseline_appendix
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_baseline_appendix_timestamp();
