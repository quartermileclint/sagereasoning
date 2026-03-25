-- Milestones table — stores earned virtue milestones per user
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_id text NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL,

  -- Snapshot of scores when milestone was earned
  wisdom_score integer,
  justice_score integer,
  courage_score integer,
  temperance_score integer,
  total_score integer,

  -- Prevent duplicate milestones
  UNIQUE(user_id, milestone_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_earned_at ON milestones(earned_at DESC);

-- RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Users can read their own milestones
CREATE POLICY "Users can read own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (API route uses supabaseAdmin)
CREATE POLICY "Service role insert for milestones"
  ON milestones FOR INSERT
  WITH CHECK (true);
