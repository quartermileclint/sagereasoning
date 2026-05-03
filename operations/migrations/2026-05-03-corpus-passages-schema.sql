-- ============================================================================
-- 2026-05-03 — corpus_passages schema (D5)
-- ============================================================================
--
-- Source: D5 Index Schema (Adopted 2026-05-02) §"The corpus_passages table — schema"
--         + AC-1 (passion-indexed retrieval), AC-2 (hybrid retrieval — BM25 + vector),
--           AC-4 (small chunks), AC-6 (Graph-RAG-extensible), AC-12 (translation sandwich)
--         + R7 (source fidelity), R8a (strict glossary), R17b (read-side index policy)
--         + KG7 (JSONB storage shape — canonical_mechanism + slot_fields passed as plain
--           arrays/objects, never JSON.stringify-ed)
--
-- This migration creates the single corpus_passages table per D5's single-table
-- design (pgvector + tsvector columns; one row per indexed passage). It is the
-- foundation of the alt-3 retrieval substrate. Phase-2 Sub-session A+B
-- (this session) creates the table + populates ~200-500 rows from
-- stoic-brain-compiled.ts + 27 D-A16 catalogue stems.
--
-- Idempotent: CREATE EXTENSION / CREATE TABLE / CREATE INDEX use IF NOT EXISTS.
-- DROP POLICY IF EXISTS + CREATE POLICY pattern for the 3 RLS policies.
-- CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS for the tsvector trigger.
--
-- Rollback (only if needed):
--   DROP TRIGGER IF EXISTS corpus_passages_tsvector_trigger ON corpus_passages;
--   DROP FUNCTION IF EXISTS corpus_passages_tsvector_update();
--   DROP TABLE IF EXISTS corpus_passages;
--   -- Do NOT drop the vector extension — other tables may depend on it.
--
-- DEVIATION FROM D5 VERBATIM (this session only):
--   The ivfflat embedding index (D5 line 121) is COMMENTED OUT in this
--   migration. Reason: the embedding column will be NULL across all rows
--   after this session's population (OpenAI text-embedding-3-small generation
--   is deferred to Sub-session C alongside D6 retrieval interface + D7
--   re-ranker wiring). An ivfflat index on a NULL column would be useless
--   and may emit warnings/errors at index-build time on some pgvector
--   versions. Sub-session C re-introduces the ivfflat CREATE INDEX after
--   embeddings are populated, alongside REINDEX if needed.
--   This deviation is logged in D-CORPUS-PASSAGES-SCHEMA-AND-POPULATION-2026-05-03
--   with revisit condition "Sub-session C commencement".
--
-- Apply via: Supabase Dashboard → sagereasoning-us → SQL Editor → New query
--            → paste → Run. Expected: "Success. No rows returned."
-- ============================================================================

-- ----------------------------------------------------------------------------
-- pgvector extension (already enabled per pre-check 1; idempotent)
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS vector;

-- ----------------------------------------------------------------------------
-- corpus_passages — the single table per D5 §"Storage decision"
-- ----------------------------------------------------------------------------
-- One row per indexed passage. Carries:
--   - Identity (id, passage_id)
--   - Provenance per R7 (source_file, source_citation)
--   - Structural classification per D4 (passage_type, canonical_mechanism JSONB,
--     passion, sub_passion, audience_tier)
--   - Trigger context for focus_question_stem rows only (trigger_condition,
--     intake_tier, slot_fields JSONB)
--   - Content (text, paragraph_text)
--   - Retrieval indexes (embedding VECTOR(1536) — populated at Sub-session C;
--     tsvector_en — auto-maintained via trigger below)
--   - Metadata (created_at, updated_at, version)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS corpus_passages (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id VARCHAR(256) NOT NULL UNIQUE,

  -- Provenance (R7)
  source_file VARCHAR(64) NOT NULL,
  source_citation TEXT NOT NULL,

  -- Structural classification (per D4 §"Tagging schema")
  passage_type VARCHAR(32) NOT NULL,
  canonical_mechanism JSONB NOT NULL,
  passion VARCHAR(32),
  sub_passion VARCHAR(64),
  audience_tier VARCHAR(8) NOT NULL,

  -- Trigger context (focus_question_stem only; NULL otherwise)
  trigger_condition VARCHAR(64),
  intake_tier SMALLINT,
  slot_fields JSONB,

  -- Content
  text TEXT NOT NULL,
  paragraph_text TEXT,

  -- Retrieval indexes
  embedding VECTOR(1536),
  tsvector_en TSVECTOR,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraints
  CONSTRAINT passage_type_valid CHECK (
    passage_type IN ('mechanism','canonical_line','example','focus_question_stem','scoring_rule')
  ),
  CONSTRAINT source_file_valid CHECK (
    source_file IN ('stoic-brain','psychology','passions','virtue','value','action','progress','scoring','focus-questions')
  ),
  CONSTRAINT audience_tier_valid CHECK (
    audience_tier IN ('R8a','R8b','R8c','R8d')
  ),
  CONSTRAINT intake_tier_valid CHECK (
    intake_tier IS NULL OR intake_tier IN (1,2,3)
  ),
  CONSTRAINT focus_question_completeness CHECK (
    (passage_type = 'focus_question_stem' AND trigger_condition IS NOT NULL AND intake_tier IS NOT NULL)
    OR (passage_type != 'focus_question_stem' AND trigger_condition IS NULL AND intake_tier IS NULL)
  )
);

-- ----------------------------------------------------------------------------
-- Retrieval indexes
-- ----------------------------------------------------------------------------
-- ivfflat embedding index — COMMENTED OUT per session deviation note in header.
-- Re-introduce at Sub-session C after embeddings are populated. The index
-- shape stays per D5: USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100).
--
-- CREATE INDEX IF NOT EXISTS idx_corpus_passages_embedding
--   ON corpus_passages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_corpus_passages_tsvector
  ON corpus_passages USING GIN (tsvector_en);

-- ----------------------------------------------------------------------------
-- Filter indexes (composite for the most common query shapes per D5)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_corpus_passages_mechanism_passion
  ON corpus_passages (passage_type, passion, sub_passion);

CREATE INDEX IF NOT EXISTS idx_corpus_passages_canonical_mechanism
  ON corpus_passages USING GIN (canonical_mechanism);

CREATE INDEX IF NOT EXISTS idx_corpus_passages_trigger
  ON corpus_passages (trigger_condition, intake_tier)
  WHERE passage_type = 'focus_question_stem';

CREATE INDEX IF NOT EXISTS idx_corpus_passages_source
  ON corpus_passages (source_file);

-- ----------------------------------------------------------------------------
-- tsvector_en auto-maintenance trigger
-- ----------------------------------------------------------------------------
-- Builds the English-language tsvector from text on every INSERT or UPDATE
-- of text. Also bumps updated_at on every UPDATE.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION corpus_passages_tsvector_update() RETURNS trigger AS $$
BEGIN
  NEW.tsvector_en := to_tsvector('english', NEW.text);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS corpus_passages_tsvector_trigger ON corpus_passages;

CREATE TRIGGER corpus_passages_tsvector_trigger
  BEFORE INSERT OR UPDATE OF text ON corpus_passages
  FOR EACH ROW EXECUTE FUNCTION corpus_passages_tsvector_update();

-- ----------------------------------------------------------------------------
-- Row Level Security per D5 §"RLS — read-only at request time"
-- ----------------------------------------------------------------------------
-- The corpus is shared philosophical content, not practitioner-private data.
-- R17b's intimate-data perimeter does not extend to the corpus index.
--
-- Read access: any authenticated user (the engine reads via the API route's
--              authenticated context; agent callers via their own service role).
-- Read access: service role (build-time embedding + index construction).
-- Write access: service role only (Phase-2 build-time index construction).
--
-- Anonymous read policy is INTENTIONALLY OMITTED per D5 §"RLS". When the
-- public /corpus reference page is built, a future migration adds:
--   CREATE POLICY corpus_passages_read_anonymous ON corpus_passages
--     FOR SELECT TO anon
--     USING (passage_type IN ('canonical_line', 'example') AND audience_tier = 'R8c');
-- ----------------------------------------------------------------------------

ALTER TABLE corpus_passages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS corpus_passages_read_authenticated ON corpus_passages;
CREATE POLICY corpus_passages_read_authenticated
  ON corpus_passages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS corpus_passages_read_service ON corpus_passages;
CREATE POLICY corpus_passages_read_service
  ON corpus_passages
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS corpus_passages_write_service ON corpus_passages;
CREATE POLICY corpus_passages_write_service
  ON corpus_passages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Post-apply verification queries (run separately after the above)
-- ============================================================================
-- V1 — Confirm table + extension:
--   SELECT table_name FROM information_schema.tables WHERE table_name = 'corpus_passages';
--   -- Expected: 1 row
--   SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
--   -- Expected: 1 row (vector 0.8.0 or higher)
--
-- V2 — Confirm 5 user-defined indexes (NOT 6 — the ivfflat embedding index
-- is intentionally deferred to Sub-session C per session deviation note):
--   SELECT indexname FROM pg_indexes
--   WHERE tablename = 'corpus_passages' AND indexname LIKE 'idx_%';
--   -- Expected: 5 rows
--   --   idx_corpus_passages_canonical_mechanism
--   --   idx_corpus_passages_mechanism_passion
--   --   idx_corpus_passages_source
--   --   idx_corpus_passages_trigger
--   --   idx_corpus_passages_tsvector
--
-- V3 — Confirm RLS enabled + 3 read/write policies present:
--   SELECT polname FROM pg_policy p
--   JOIN pg_class c ON p.polrelid = c.oid
--   WHERE c.relname = 'corpus_passages';
--   -- Expected: 3 rows
--   --   corpus_passages_read_authenticated
--   --   corpus_passages_read_service
--   --   corpus_passages_write_service
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'corpus_passages';
--   -- Expected: 1 row, relrowsecurity = true
--
-- V4 — Spot-check empty (sanity check on row count):
--   SELECT count(*) FROM corpus_passages;
--   -- Expected: 0 rows
-- ============================================================================
