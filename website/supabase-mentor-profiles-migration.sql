-- ============================================================================
-- MENTOR PROFILES — Encrypted profile storage (R17b)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
-- ============================================================================

-- Non-sensitive metadata in queryable columns; full profile encrypted at rest.
-- The encrypted_profile column holds AES-256-GCM encrypted JSON.
-- Decryption happens server-side in API routes using MENTOR_ENCRYPTION_KEY.

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name      TEXT NOT NULL DEFAULT 'Practitioner',

  -- Queryable metadata (non-sensitive summary)
  senecan_grade     TEXT NOT NULL DEFAULT 'pre_progress',
  proximity_level   TEXT NOT NULL DEFAULT 'reflexive',
  passions_count    INTEGER NOT NULL DEFAULT 0,
  weakest_virtue    TEXT NOT NULL DEFAULT 'unknown',

  -- Encrypted profile blob (R17b: application-level encryption)
  encrypted_profile TEXT NOT NULL,
  encryption_meta   JSONB NOT NULL,

  -- Versioning
  profile_version   INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One profile per user
  UNIQUE(user_id)
);

-- RLS: Users can only access their own profile
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_mentor_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentor_profiles_updated_at
  BEFORE UPDATE ON mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_profile_timestamp();
