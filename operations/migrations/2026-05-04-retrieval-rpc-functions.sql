-- Migration: 2026-05-04 — Retrieval RPC functions for D6 (retrieve-passages) + D7 (rerank)
--
-- Purpose: pgvector and BM25/ts_rank_cd queries cannot be expressed through
-- Supabase JS's standard query builder. The canonical Supabase + pgvector
-- pattern is to wrap the queries in Postgres functions and call them from
-- JS via supabase.rpc(...). This migration creates the two functions D6's
-- internal pipeline (Steps 3 + 5) calls.
--
-- Both functions:
--   - Are SQL/STABLE (deterministic given inputs; cacheable by Postgres planner)
--   - Honour the structural filters from D6 §"Step 2 — Build the SQL filter clause"
--   - Over-fetch by match_count (D6 calls with top_k * 2 for RRF over-fetch)
--   - Return only id + passage_id + score(s); D6's hydration (Step 7) does the
--     full row read once the post-RRF top_k is known
--
-- Risk classification: Standard under 0d-ii. CREATE OR REPLACE is idempotent;
-- DROP FUNCTION is the rollback path; no data touched.
--
-- AC7 NOT engaged. PR6 NOT engaged. Critical Change Protocol NOT engaged.
--
-- Run order: founder pastes the entire file into Supabase SQL Editor and runs
-- once. Functions are then callable via supabaseAdmin.rpc(...).
--
-- Cross-references:
--   - /adopted/rag-mentor-alt3/index-schema.md (D5) — the corpus_passages table
--   - /adopted/rag-mentor-alt3/retrieval-interface.md (D6) — Steps 3 + 5 wrapped here
--   - D-CORPUS-PASSAGES-SCHEMA-2026-05-03 (table creation)
--   - D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04 (embedding column populated)


-- =============================================================================
-- match_passages_bm25
-- =============================================================================
-- Wraps D6 §"Step 3 — BM25 query".
--
-- Performs websearch_to_tsquery against tsvector_en, ranks by ts_rank_cd
-- (BM25-shape ranking), applies the same structural filters used by the
-- vector search, and returns the top match_count results ordered by
-- bm25_score descending.

CREATE OR REPLACE FUNCTION match_passages_bm25(
  query_text text,
  match_count int,
  mechanism_filter text[] DEFAULT NULL,
  passion_filter text DEFAULT NULL,
  sub_passion_filter text DEFAULT NULL,
  passage_type_filter text[] DEFAULT NULL,
  trigger_condition_filter text DEFAULT NULL,
  intake_tier_filter int DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  passage_id varchar,
  bm25_score float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cp.id,
    cp.passage_id,
    ts_rank_cd(cp.tsvector_en, websearch_to_tsquery('english', query_text))::float AS bm25_score
  FROM corpus_passages cp
  WHERE cp.tsvector_en @@ websearch_to_tsquery('english', query_text)
    AND (mechanism_filter IS NULL OR cp.canonical_mechanism ?| mechanism_filter)
    AND (passion_filter IS NULL OR cp.passion = passion_filter)
    AND (sub_passion_filter IS NULL OR cp.sub_passion = sub_passion_filter)
    AND (passage_type_filter IS NULL OR cp.passage_type = ANY(passage_type_filter))
    AND (trigger_condition_filter IS NULL OR cp.trigger_condition = trigger_condition_filter)
    AND (intake_tier_filter IS NULL OR cp.intake_tier = intake_tier_filter)
  ORDER BY bm25_score DESC
  LIMIT match_count;
$$;


-- =============================================================================
-- match_passages_vector
-- =============================================================================
-- Wraps D6 §"Step 5 — Vector query".
--
-- Performs cosine-distance search via pgvector's <=> operator using the
-- ivfflat index (idx_corpus_passages_embedding, lists=100). Applies the
-- structural filters and returns the top match_count results ordered by
-- cosine_distance ascending (smallest distance = most similar).
--
-- Returns both cosine_distance (raw) and cosine_similarity (1 - distance,
-- in [0, 1] for normalised inputs) so the application layer can reason
-- about either signal without recomputing.

CREATE OR REPLACE FUNCTION match_passages_vector(
  query_embedding vector(1536),
  match_count int,
  mechanism_filter text[] DEFAULT NULL,
  passion_filter text DEFAULT NULL,
  sub_passion_filter text DEFAULT NULL,
  passage_type_filter text[] DEFAULT NULL,
  trigger_condition_filter text DEFAULT NULL,
  intake_tier_filter int DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  passage_id varchar,
  cosine_distance float,
  cosine_similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cp.id,
    cp.passage_id,
    (cp.embedding <=> query_embedding)::float AS cosine_distance,
    (1 - (cp.embedding <=> query_embedding))::float AS cosine_similarity
  FROM corpus_passages cp
  WHERE cp.embedding IS NOT NULL
    AND (mechanism_filter IS NULL OR cp.canonical_mechanism ?| mechanism_filter)
    AND (passion_filter IS NULL OR cp.passion = passion_filter)
    AND (sub_passion_filter IS NULL OR cp.sub_passion = sub_passion_filter)
    AND (passage_type_filter IS NULL OR cp.passage_type = ANY(passage_type_filter))
    AND (trigger_condition_filter IS NULL OR cp.trigger_condition = trigger_condition_filter)
    AND (intake_tier_filter IS NULL OR cp.intake_tier = intake_tier_filter)
  ORDER BY cosine_distance ASC
  LIMIT match_count;
$$;


-- =============================================================================
-- Permissions
-- =============================================================================
-- Both authenticated (engine via API route) and service_role (server-side
-- supabaseAdmin client; D6's path) need EXECUTE on these functions.
-- Anonymous access NOT granted — corpus retrieval is server-side only.

GRANT EXECUTE ON FUNCTION match_passages_bm25 TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_passages_vector TO authenticated, service_role;


-- =============================================================================
-- Verification queries (founder runs these after CREATE statements)
-- =============================================================================
-- V1: BM25 search for "philodoxia" — should return philodoxia-tagged passages.
-- SELECT * FROM match_passages_bm25(
--   'philodoxia false judgement reputation',
--   5,
--   ARRAY['passion_false_judgement']::text[],
--   'epithumia',
--   'philodoxia',
--   ARRAY['mechanism']::text[]
-- );
--
-- V2: Functions exist and have correct signatures
-- SELECT proname, pg_get_function_arguments(oid)
-- FROM pg_proc
-- WHERE proname IN ('match_passages_bm25', 'match_passages_vector');
--
-- Expected V2 output: 2 rows, with the argument lists matching the CREATE statements above.


-- =============================================================================
-- Rollback path
-- =============================================================================
-- DROP FUNCTION IF EXISTS match_passages_bm25(text, int, text[], text, text, text[], text, int);
-- DROP FUNCTION IF EXISTS match_passages_vector(vector, int, text[], text, text, text[], text, int);

-- End of migration.
