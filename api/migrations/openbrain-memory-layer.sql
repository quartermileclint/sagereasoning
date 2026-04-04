-- ============================================================================
-- OPENBRAIN PERSISTENT MEMORY LAYER
-- Migration: openbrain-memory-layer.sql
-- Date: 2026-04-04
-- Purpose: Semantic memory for the mentor ring (Part C)
--   - pgvector extension for embeddings
--   - Immutable raw input log (append-only receipt)
--   - Semantic search function for the ring's BEFORE phase
-- ============================================================================

-- Addition 1: Enable pgvector
-- Run once. Supabase supports this extension natively.
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Addition 2: Immutable raw input log
-- ============================================================================
-- OpenBrain "receipt" — append-only, never deleted.
-- Every interaction from any source is logged verbatim with its embedding.
-- The ring's BEFORE phase queries this table for relevant past interactions.

CREATE TABLE IF NOT EXISTS mentor_raw_inputs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source          TEXT NOT NULL
    CHECK (source IN ('support', 'journal', 'proactive', 'decision_gate',
                      'reflection', 'lead', 'notification', 'workflow')),
  content         TEXT NOT NULL,
  content_hash    TEXT NOT NULL,
  embedding       vector(1536),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate entries (same content for same user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentor_raw_inputs_hash
  ON mentor_raw_inputs(user_id, content_hash);

-- Index for semantic search (cosine similarity via IVFFlat)
-- lists = 100 is appropriate for up to ~100k rows.
-- Rebuild with more lists as data grows.
CREATE INDEX IF NOT EXISTS idx_mentor_raw_inputs_embedding
  ON mentor_raw_inputs
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for source-filtered queries
CREATE INDEX IF NOT EXISTS idx_mentor_raw_inputs_source
  ON mentor_raw_inputs(user_id, source, created_at DESC);

-- RLS
ALTER TABLE mentor_raw_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor_raw_inputs_own_data" ON mentor_raw_inputs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Addition 3: Semantic search function
-- ============================================================================
-- Find similar past interactions by meaning.
-- Called by the ring's BEFORE phase to surface relevant history.
--
-- Usage:
--   SELECT * FROM search_mentor_memory(
--     query_embedding := <1536-dim vector>,
--     match_threshold := 0.7,
--     match_count := 5
--   );

CREATE OR REPLACE FUNCTION search_mentor_memory(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT auth.uid(),
  p_source text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source text,
  content text,
  metadata jsonb,
  similarity float,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mri.id,
    mri.source,
    mri.content,
    mri.metadata,
    1 - (mri.embedding <=> query_embedding) AS similarity,
    mri.created_at
  FROM mentor_raw_inputs mri
  WHERE mri.user_id = p_user_id
    AND 1 - (mri.embedding <=> query_embedding) > match_threshold
    AND (p_source IS NULL OR mri.source = p_source)
  ORDER BY mri.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- Helper: Insert raw input with deduplication
-- ============================================================================
-- Convenience function that computes content_hash and handles conflicts.

CREATE OR REPLACE FUNCTION insert_mentor_raw_input(
  p_user_id uuid,
  p_source text,
  p_content text,
  p_embedding vector(1536) DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_id uuid;
BEGIN
  v_hash := encode(sha256(p_content::bytea), 'hex');

  INSERT INTO mentor_raw_inputs (user_id, source, content, content_hash, embedding, metadata)
  VALUES (p_user_id, p_source, p_content, v_hash, p_embedding, p_metadata)
  ON CONFLICT (user_id, content_hash) DO UPDATE
    SET embedding = COALESCE(EXCLUDED.embedding, mentor_raw_inputs.embedding),
        metadata = mentor_raw_inputs.metadata || EXCLUDED.metadata
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
