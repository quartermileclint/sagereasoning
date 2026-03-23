-- Reflections table — stores daily journal entries with scores
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  what_happened text NOT NULL,
  how_responded text,
  total_score integer NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  wisdom_score integer NOT NULL CHECK (wisdom_score >= 0 AND wisdom_score <= 100),
  justice_score integer NOT NULL CHECK (justice_score >= 0 AND justice_score <= 100),
  courage_score integer NOT NULL CHECK (courage_score >= 0 AND courage_score <= 100),
  temperance_score integer NOT NULL CHECK (temperance_score >= 0 AND temperance_score <= 100),
  alignment_tier text NOT NULL CHECK (alignment_tier IN ('sage', 'progressing', 'aware', 'misaligned', 'contrary')),
  sage_perspective text,
  evening_prompt text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at DESC);

-- RLS
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Users can only read their own reflections
CREATE POLICY "Users can read own reflections"
  ON reflections FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (API route uses supabaseAdmin)
CREATE POLICY "Service role insert for reflections"
  ON reflections FOR INSERT
  WITH CHECK (true);
