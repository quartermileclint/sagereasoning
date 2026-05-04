/**
 * retrieve-passages.ts — D6 retrieval interface (hybrid BM25 + pgvector via RRF).
 *
 * PURPOSE: The single entry point the deterministic engine calls when it
 * needs to read corpus passages. Replaces the existing per-mechanism reads
 * from stoic-brain-compiled.ts with targeted retrieval against the indexed
 * corpus_passages table (D5).
 *
 * The function is deterministic given its inputs: BM25 + vector queries are
 * pure SQL; query embedding uses the documented OpenAI model
 * (text-embedding-3-small per D5 §"Embedding model selection"); RRF fusion
 * is canonical. The function does NO Stoic reasoning — that is the engine's
 * job (per AC-12 translation-sandwich).
 *
 * IMPLEMENTATION NOTES:
 *   - Steps 3 (BM25) and 5 (vector) run in parallel via Promise.all.
 *   - Per-request cache is opt-in: callers that want caching pass a Map
 *     whose lifetime is the API request's lexical scope (per D6 §"Cache
 *     strategy — per-request only" + KG1 rule 4).
 *   - Channel failures degrade the result rather than throwing, except
 *     when both channels fail (RetrievalUnavailableError).
 *   - All async DB reads are awaited (KG1 rule 2).
 *
 * Implements: AC-1, AC-2, AC-3, AC-4, AC-12, R7, R8a.
 * Cross-references:
 *   - /adopted/rag-mentor-alt3/retrieval-interface.md (D6 spec)
 *   - /adopted/rag-mentor-alt3/index-schema.md (D5 — table this queries)
 *   - /operations/migrations/2026-05-04-retrieval-rpc-functions.sql (RPCs)
 *   - /website/src/lib/rag/rerank.ts (D7 — consumes this output)
 */

import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase-server';

// =============================================================================
// TYPES
// =============================================================================

export type PassageType =
  | 'mechanism'
  | 'canonical_line'
  | 'example'
  | 'focus_question_stem'
  | 'scoring_rule';

export interface RetrieveInput {
  /** Free-text query (paraphrase or exact terms). Used for the vector channel
   *  embedding and (when bm25_query is not supplied) for the BM25 channel. */
  query: string;

  /** Optional separate BM25-channel query string. When provided, the BM25
   *  channel uses this instead of `query`; the vector channel always uses
   *  `query`. Lets a consumer reformulate the query for BM25 (e.g., OR-shape
   *  to defeat the websearch_to_tsquery default-AND behaviour) without
   *  affecting the vector channel's embedding.
   *  Per ADR-001 (2026-05-04 D6/D7 consumer wiring) §"Query construction
   *  discipline" + D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04 finding #1. */
  bm25_query?: string;

  /** Mechanism IDs — restricts to passages whose canonical_mechanism contains any of these. */
  mechanism_filter?: string[];

  /** Root passion ID (e.g., 'epithumia') — restricts to passages with matching passion. */
  passion_filter?: string;

  /** Sub-passion ID (e.g., 'philodoxia') — restricts to passages with matching sub_passion. */
  sub_passion_filter?: string;

  /** Passage type whitelist (e.g., ['mechanism', 'canonical_line']). */
  passage_type_filter?: PassageType[];

  /** For focus-question-stem retrieval — the trigger code to look up. */
  trigger_condition_filter?: string;

  /** For focus-question-stem retrieval — the intake tier (1 / 2 / 3). */
  intake_tier_filter?: 1 | 2 | 3;

  /** Top-K to return after RRF. Defaults to 20 per AC-3. */
  top_k?: number;

  /** RRF tuning — weight applied to BM25 ranks. Default 0.5. */
  bm25_weight?: number;

  /** RRF tuning — weight applied to vector ranks. Default 0.5. */
  vector_weight?: number;

  /** RRF tuning — smoothing constant. Default 60. */
  rrf_k?: number;

  /** When true, the result includes per-channel diagnostics in `trace`. */
  trace_enabled?: boolean;
}

export interface SlotField {
  variable_name: string;
  source_path: string;
  constraint: string;
}

export interface RetrievedPassage {
  passage_id: string;
  source_file: string;
  source_citation: string;
  passage_type: PassageType;
  canonical_mechanism: string[];
  passion: string | null;
  sub_passion: string | null;
  audience_tier: string;
  text: string;
  paragraph_text: string | null;

  /** Fused score from RRF (higher = better). */
  rrf_score: number;

  /** 1-indexed rank in BM25 channel; null if the passage didn't match BM25. */
  bm25_rank: number | null;

  /** 1-indexed rank in vector channel; null if the passage didn't match vector. */
  vector_rank: number | null;

  /** Re-rank score, populated by D7's reRank when called downstream. */
  rerank_score?: number;

  // Focus-question-stem fields (populated only when passage_type === 'focus_question_stem')
  trigger_condition?: string;
  intake_tier?: 1 | 2 | 3;
  slot_fields?: SlotField[];
}

export interface RetrieveTrace {
  bm25_results: Array<{ passage_id: string; rank: number; score: number }>;
  vector_results: Array<{ passage_id: string; rank: number; cosine_similarity: number }>;
  query_embedding: number[] | null;
  filters_applied: Record<string, unknown>;
}

export interface RetrieveResult {
  passages: RetrievedPassage[];
  retrieval_diagnostics: {
    bm25_count: number;
    vector_count: number;
    fusion_count: number;
    cache_hit: boolean;
    elapsed_ms: number;
    /** True if exactly one channel failed and the result reflects degraded retrieval. */
    degraded_retrieval?: boolean;
  };
  trace?: RetrieveTrace;
}

// =============================================================================
// ERRORS
// =============================================================================

export class RetrievalTimeoutError extends Error {
  channel: 'bm25' | 'vector';
  constructor(channel: 'bm25' | 'vector', message?: string) {
    super(message ?? `Retrieval timeout on ${channel} channel`);
    this.name = 'RetrievalTimeoutError';
    this.channel = channel;
  }
}

export class EmbeddingFailureError extends Error {
  cause: unknown;
  constructor(cause: unknown, message?: string) {
    super(message ?? 'OpenAI embedding call failed');
    this.name = 'EmbeddingFailureError';
    this.cause = cause;
  }
}

export class RetrievalUnavailableError extends Error {
  constructor(message?: string) {
    super(message ?? 'Both BM25 and vector retrieval channels failed');
    this.name = 'RetrievalUnavailableError';
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_TOP_K = 20;
const DEFAULT_BM25_WEIGHT = 0.5;
const DEFAULT_VECTOR_WEIGHT = 0.5;
const DEFAULT_RRF_K = 60;
const EMBEDDING_MODEL = 'text-embedding-3-small'; // per D5 §"Embedding model selection"

// =============================================================================
// CACHE KEY (per D6 §"The cache implementation")
// =============================================================================

export function makeCacheKey(input: RetrieveInput): string {
  // Deterministic JSON over all retrieval-affecting parameters.
  // trace_enabled intentionally excluded — same retrieval, different verbosity.
  const sortedMech = input.mechanism_filter ? [...input.mechanism_filter].sort() : undefined;
  const sortedTypes = input.passage_type_filter ? [...input.passage_type_filter].sort() : undefined;

  return JSON.stringify({
    query: input.query,
    bm25_query: input.bm25_query,
    mechanism_filter: sortedMech,
    passion_filter: input.passion_filter,
    sub_passion_filter: input.sub_passion_filter,
    passage_type_filter: sortedTypes,
    trigger_condition_filter: input.trigger_condition_filter,
    intake_tier_filter: input.intake_tier_filter,
    top_k: input.top_k,
    bm25_weight: input.bm25_weight,
    vector_weight: input.vector_weight,
    rrf_k: input.rrf_k,
  });
}

// =============================================================================
// OPENAI CLIENT (lazy init)
// =============================================================================

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is not set. ' +
          'Configure it in .env.local (local) and Vercel Production + Preview.'
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// =============================================================================
// THE RETRIEVE FUNCTION
// =============================================================================

interface BM25Row {
  id: string;
  passage_id: string;
  bm25_score: number;
}

interface VectorRow {
  id: string;
  passage_id: string;
  cosine_distance: number;
  cosine_similarity: number;
}

interface HydrationRow {
  passage_id: string;
  source_file: string;
  source_citation: string;
  passage_type: string;
  canonical_mechanism: unknown; // JSONB — pgsdriver returns parsed array
  passion: string | null;
  sub_passion: string | null;
  audience_tier: string;
  text: string;
  paragraph_text: string | null;
  trigger_condition: string | null;
  intake_tier: number | null;
  slot_fields: unknown; // JSONB
}

/**
 * Retrieve corpus passages matching the input query and filters.
 *
 * @param input  RetrieveInput with query + structural filters + tuning params.
 * @param cache  Optional per-request Map<cache_key, RetrieveResult>. The
 *               consumer creates this in the request's lexical scope; passing
 *               it on every call enables in-request cache hits.
 *
 * @returns      RetrieveResult with passages ranked by RRF score (truncated
 *               to top_k) and retrieval diagnostics.
 *
 * @throws       EmbeddingFailureError when OpenAI embedding fails AND BM25
 *               also returned no results (catastrophic vector path).
 *               Otherwise embedding failure degrades to BM25-only with
 *               degraded_retrieval: true in diagnostics.
 * @throws       RetrievalUnavailableError when both BM25 and vector channels
 *               fail.
 */
export async function retrievePassages(
  input: RetrieveInput,
  cache?: Map<string, RetrieveResult>
): Promise<RetrieveResult> {
  const start = Date.now();
  const top_k = input.top_k ?? DEFAULT_TOP_K;
  const bm25_weight = input.bm25_weight ?? DEFAULT_BM25_WEIGHT;
  const vector_weight = input.vector_weight ?? DEFAULT_VECTOR_WEIGHT;
  const rrf_k = input.rrf_k ?? DEFAULT_RRF_K;
  const top_k_per_channel = top_k * 2; // over-fetch; RRF will merge

  // -----------------------------------------------------------------------
  // Step 1 — Per-request cache lookup
  // -----------------------------------------------------------------------
  const cacheKey = makeCacheKey(input);
  if (cache) {
    const hit = cache.get(cacheKey);
    if (hit) {
      return {
        ...hit,
        retrieval_diagnostics: {
          ...hit.retrieval_diagnostics,
          cache_hit: true,
          elapsed_ms: Date.now() - start,
        },
      };
    }
  }

  // -----------------------------------------------------------------------
  // Steps 2 + 3 — BM25 query (filter clause is encoded in the RPC function)
  // -----------------------------------------------------------------------
  let bm25Failed = false;
  const bm25Promise = runBm25Query(input, top_k_per_channel).catch((err) => {
    // Log but don't throw — degrade to vector-only.
    console.warn('[retrievePassages] BM25 channel failed:', err);
    bm25Failed = true;
    return [] as BM25Row[];
  });

  // -----------------------------------------------------------------------
  // Steps 4 + 5 — Embed query, then run vector search
  // -----------------------------------------------------------------------
  let queryEmbedding: number[] | null = null;
  let vectorFailed = false;
  const vectorPromise = (async (): Promise<VectorRow[]> => {
    try {
      queryEmbedding = await embedQuery(input.query);
    } catch (err) {
      console.warn('[retrievePassages] embedding failed; vector channel disabled:', err);
      vectorFailed = true;
      return [];
    }
    try {
      return await runVectorQuery(queryEmbedding, input, top_k_per_channel);
    } catch (err) {
      console.warn('[retrievePassages] vector RPC failed:', err);
      vectorFailed = true;
      return [];
    }
  })();

  const [bm25Rows, vectorRows] = await Promise.all([bm25Promise, vectorPromise]);

  // Catastrophic — both channels failed.
  if (bm25Failed && vectorFailed) {
    throw new RetrievalUnavailableError();
  }

  // -----------------------------------------------------------------------
  // Step 6 — Reciprocal Rank Fusion
  // -----------------------------------------------------------------------
  const bm25RankByPassageId = new Map<string, number>();
  bm25Rows.forEach((row, idx) => bm25RankByPassageId.set(row.passage_id, idx + 1));

  const vectorRankByPassageId = new Map<string, number>();
  vectorRows.forEach((row, idx) => vectorRankByPassageId.set(row.passage_id, idx + 1));

  const allPassageIds = new Set<string>([
    ...bm25Rows.map((r) => r.passage_id),
    ...vectorRows.map((r) => r.passage_id),
  ]);

  const rrfRanked: Array<{
    passage_id: string;
    rrf_score: number;
    bm25_rank: number | null;
    vector_rank: number | null;
  }> = [];

  for (const passage_id of allPassageIds) {
    const bm25_rank = bm25RankByPassageId.get(passage_id) ?? null;
    const vector_rank = vectorRankByPassageId.get(passage_id) ?? null;
    const bm25_contrib =
      bm25_rank !== null ? bm25_weight * (1 / (rrf_k + bm25_rank)) : 0;
    const vector_contrib =
      vector_rank !== null ? vector_weight * (1 / (rrf_k + vector_rank)) : 0;
    rrfRanked.push({
      passage_id,
      rrf_score: bm25_contrib + vector_contrib,
      bm25_rank,
      vector_rank,
    });
  }
  rrfRanked.sort((a, b) => b.rrf_score - a.rrf_score);
  const topK = rrfRanked.slice(0, top_k);
  const fusion_count = rrfRanked.length;

  // -----------------------------------------------------------------------
  // Step 7 — Hydrate passage rows
  // -----------------------------------------------------------------------
  let passages: RetrievedPassage[] = [];
  if (topK.length > 0) {
    const ids = topK.map((r) => r.passage_id);
    const { data: rows, error } = await supabaseAdmin
      .from('corpus_passages')
      .select(
        'passage_id, source_file, source_citation, passage_type, canonical_mechanism, ' +
          'passion, sub_passion, audience_tier, text, paragraph_text, ' +
          'trigger_condition, intake_tier, slot_fields'
      )
      .in('passage_id', ids);

    if (error) {
      console.warn('[retrievePassages] hydration query failed:', error);
    } else if (rows) {
      const rowMap = new Map<string, HydrationRow>();
      (rows as unknown as HydrationRow[]).forEach((row) => rowMap.set(row.passage_id, row));

      passages = topK
        .map(({ passage_id, rrf_score, bm25_rank, vector_rank }) => {
          const row = rowMap.get(passage_id);
          if (!row) return null;
          const passage: RetrievedPassage = {
            passage_id: row.passage_id,
            source_file: row.source_file,
            source_citation: row.source_citation, // R7 source fidelity preserved
            passage_type: row.passage_type as PassageType,
            canonical_mechanism: Array.isArray(row.canonical_mechanism)
              ? (row.canonical_mechanism as string[])
              : [],
            passion: row.passion,
            sub_passion: row.sub_passion,
            audience_tier: row.audience_tier,
            text: row.text,
            paragraph_text: row.paragraph_text,
            rrf_score,
            bm25_rank,
            vector_rank,
          };
          if (row.passage_type === 'focus_question_stem') {
            if (row.trigger_condition) passage.trigger_condition = row.trigger_condition;
            if (row.intake_tier !== null && row.intake_tier !== undefined) {
              passage.intake_tier = row.intake_tier as 1 | 2 | 3;
            }
            if (row.slot_fields) {
              passage.slot_fields = row.slot_fields as SlotField[];
            }
          }
          return passage;
        })
        .filter((p): p is RetrievedPassage => p !== null);
    }
  }

  // -----------------------------------------------------------------------
  // Step 8 — Build the result
  // -----------------------------------------------------------------------
  const result: RetrieveResult = {
    passages,
    retrieval_diagnostics: {
      bm25_count: bm25Rows.length,
      vector_count: vectorRows.length,
      fusion_count,
      cache_hit: false,
      elapsed_ms: Date.now() - start,
    },
  };
  if (bm25Failed || vectorFailed) {
    result.retrieval_diagnostics.degraded_retrieval = true;
  }

  if (input.trace_enabled) {
    result.trace = {
      bm25_results: bm25Rows.map((r, idx) => ({
        passage_id: r.passage_id,
        rank: idx + 1,
        score: r.bm25_score,
      })),
      vector_results: vectorRows.map((r, idx) => ({
        passage_id: r.passage_id,
        rank: idx + 1,
        cosine_similarity: r.cosine_similarity,
      })),
      query_embedding: queryEmbedding,
      filters_applied: {
        mechanism_filter: input.mechanism_filter,
        passion_filter: input.passion_filter,
        sub_passion_filter: input.sub_passion_filter,
        passage_type_filter: input.passage_type_filter,
        trigger_condition_filter: input.trigger_condition_filter,
        intake_tier_filter: input.intake_tier_filter,
      },
    };
  }

  // -----------------------------------------------------------------------
  // Step 9 — Cache write
  // -----------------------------------------------------------------------
  if (cache) {
    cache.set(cacheKey, result);
  }

  return result;
}

// =============================================================================
// INTERNAL — channel queries
// =============================================================================

async function runBm25Query(
  input: RetrieveInput,
  match_count: number
): Promise<BM25Row[]> {
  // Per ADR-001: BM25 channel uses bm25_query when supplied, falling back to
  // query for backward compatibility. The vector channel always uses query.
  const { data, error } = await supabaseAdmin.rpc('match_passages_bm25', {
    query_text: input.bm25_query ?? input.query,
    match_count,
    mechanism_filter: input.mechanism_filter ?? null,
    passion_filter: input.passion_filter ?? null,
    sub_passion_filter: input.sub_passion_filter ?? null,
    passage_type_filter: input.passage_type_filter ?? null,
    trigger_condition_filter: input.trigger_condition_filter ?? null,
    intake_tier_filter: input.intake_tier_filter ?? null,
  });
  if (error) {
    throw new Error(`BM25 RPC failed: ${error.message}`);
  }
  return (data ?? []) as BM25Row[];
}

async function runVectorQuery(
  query_embedding: number[],
  input: RetrieveInput,
  match_count: number
): Promise<VectorRow[]> {
  const { data, error } = await supabaseAdmin.rpc('match_passages_vector', {
    query_embedding,
    match_count,
    mechanism_filter: input.mechanism_filter ?? null,
    passion_filter: input.passion_filter ?? null,
    sub_passion_filter: input.sub_passion_filter ?? null,
    passage_type_filter: input.passage_type_filter ?? null,
    trigger_condition_filter: input.trigger_condition_filter ?? null,
    intake_tier_filter: input.intake_tier_filter ?? null,
  });
  if (error) {
    throw new Error(`Vector RPC failed: ${error.message}`);
  }
  return (data ?? []) as VectorRow[];
}

async function embedQuery(query: string): Promise<number[]> {
  try {
    const openai = getOpenAI();
    const resp = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
    });
    const embedding = resp.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length !== 1536) {
      throw new EmbeddingFailureError(
        new Error(`Unexpected embedding shape: length=${embedding?.length ?? 'undefined'}`),
        'OpenAI returned an embedding of unexpected shape'
      );
    }
    return embedding;
  } catch (err) {
    if (err instanceof EmbeddingFailureError) throw err;
    throw new EmbeddingFailureError(err);
  }
}
