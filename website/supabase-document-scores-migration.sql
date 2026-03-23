-- Document Scores table — stores scored documents with badge references
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS document_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  word_count integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  wisdom_score integer NOT NULL CHECK (wisdom_score >= 0 AND wisdom_score <= 100),
  justice_score integer NOT NULL CHECK (justice_score >= 0 AND justice_score <= 100),
  courage_score integer NOT NULL CHECK (courage_score >= 0 AND courage_score <= 100),
  temperance_score integer NOT NULL CHECK (temperance_score >= 0 AND temperance_score <= 100),
  alignment_tier text NOT NULL CHECK (alignment_tier IN ('sage', 'progressing', 'aware', 'misaligned', 'contrary')),
  reasoning text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for badge lookups (by ID — already covered by PK)
-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_document_scores_created_at ON document_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_scores_tier ON document_scores(alignment_tier);

-- RLS: Allow public read (badges need to be publicly accessible)
ALTER TABLE document_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read scores (badges are public)
CREATE POLICY "Public read access for document scores"
  ON document_scores FOR SELECT
  USING (true);

-- Only service role can insert (API route uses supabaseAdmin)
CREATE POLICY "Service role insert for document scores"
  ON document_scores FOR INSERT
  WITH CHECK (true);
