-- Migration: Add journal_entries table for The Path of the Prokoptos
-- Run this in the Supabase SQL Editor

-- Create the journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 56),
  phase_number INTEGER NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  reflection_text TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One entry per day per user
  UNIQUE(user_id, day_number)
);

-- Index for fast user lookups
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Users can read their own entries
CREATE POLICY "Users can read own journal entries"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do anything (for API routes)
CREATE POLICY "Service role full access to journal entries"
  ON journal_entries
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant access
GRANT SELECT, INSERT ON journal_entries TO authenticated;
GRANT ALL ON journal_entries TO service_role;
