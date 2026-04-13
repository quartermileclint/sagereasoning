-- Add activation tracking columns for structured observation pipeline
-- These let us quickly see which users have activated the new pipeline
-- and how many structured observations they have accumulated.
--
-- first_structured_observation_at: When the user's first validated
--   structured observation was logged (NULL = not yet activated)
-- structured_observation_count: Running count of validated observations
--   (used for threshold checks without querying mentor_observations_structured)

ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS first_structured_observation_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS structured_observation_count INTEGER NOT NULL DEFAULT 0;

-- Index for quickly finding users who have/haven't activated
CREATE INDEX IF NOT EXISTS idx_profiles_structured_activation
  ON mentor_profiles (structured_observation_count)
  WHERE structured_observation_count > 0;

-- RPC function to atomically increment the counter and set first timestamp
-- Called by logMentorObservation() after each successful structured observation insert.
CREATE OR REPLACE FUNCTION increment_structured_observation_count(p_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE mentor_profiles
  SET
    structured_observation_count = structured_observation_count + 1,
    first_structured_observation_at = COALESCE(first_structured_observation_at, now()),
    updated_at = now()
  WHERE id = p_profile_id;
END;
$$;
