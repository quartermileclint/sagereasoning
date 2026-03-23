-- Baseline Stoic Assessment table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS baseline_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  wisdom_score INTEGER NOT NULL CHECK (wisdom_score >= 0 AND wisdom_score <= 100),
  justice_score INTEGER NOT NULL CHECK (justice_score >= 0 AND justice_score <= 100),
  courage_score INTEGER NOT NULL CHECK (courage_score >= 0 AND courage_score <= 100),
  temperance_score INTEGER NOT NULL CHECK (temperance_score >= 0 AND temperance_score <= 100),
  alignment_tier TEXT NOT NULL CHECK (alignment_tier IN ('sage', 'progressing', 'aware', 'misaligned', 'contrary')),
  strongest_virtue TEXT NOT NULL,
  growth_area TEXT NOT NULL,
  interpretation TEXT,
  answers TEXT[] NOT NULL,
  q5_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_baseline_user_id ON baseline_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_baseline_created_at ON baseline_assessments(created_at DESC);

-- RLS: users can only read their own baseline assessments
ALTER TABLE baseline_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baselines"
  ON baseline_assessments FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (API) handles inserts — no insert policy needed for anon
-- The API route uses supabaseAdmin (service_role key) which bypasses RLS
