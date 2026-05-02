# Deliverable 6 — Retrieval Interface

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-1 (passion-indexed retrieval); AC-2 (hybrid retrieval — BM25 + vector via Reciprocal Rank Fusion); AC-3 (top ~20 retrieved → re-rank → top ~3–5 to prompt); AC-4 (small chunks); AC-12 (translation-sandwich — the retriever serves the engine's deterministic rules and does no Stoic reasoning itself); R7 (source fidelity — retrieved passages carry their source_citation through to Layer 3).

**Cross-references:**
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — the storage shape this interface queries)
- `/drafts/rag-mentor-alt3/re-rank-design.md` (D7 — consumes this interface's output as the re-ranker's input)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose source-passage references this interface fetches)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9 — engine sequencing names where retrieval calls fire)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — the focus-question-stem retrieval shape the interface supports)
- `/drafts/rag-mentor-alt3/cost-model.md` (D20 — per-call cost of this interface)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC2, AC4 (PR3 — safety synchronous; the retriever is not a safety surface but its latency contributes to the AC2 budget)
- `/operations/knowledge-gaps.md` KG6 (composition order — the retriever's output flows to system block where cached or to user message where dynamic, per the consumer's calling pattern)

---

## Plain-language summary

The retrieval interface is the function the deterministic engine calls when it needs to read corpus passages. Today the engine reads from condensed context constants in `stoic-brain-compiled.ts` — every request loads the same blob of philosophical content. Under alt-3, the engine instead asks for the specific passages that match the current request's structural features (which mechanism is firing, which passion is detected, what trigger condition is operative). The retriever serves those targeted requests against the indexed corpus (D5).

This deliverable specifies the **function signature** (what the engine passes in; what it gets back), the **internal pipeline** (BM25 query, vector query, Reciprocal Rank Fusion of the two ranked lists), the **error modes** (empty result, retrieval timeout, embedding failure), and the **cache strategy** (per-query short-lived cache for repeated retrievals within a single request).

The retriever is **deterministic given its inputs**. It does no Stoic reasoning. It does not reorder passages by philosophical relevance — that's the re-ranker's job (D7). It returns a ranked list of passages with provenance preserved, and the rest of the pipeline reads that list.

## Glossary

- **Hybrid retrieval** — combining two retrieval channels (sparse / BM25 and dense / vector) and merging their results. Per AC-2.
- **Sparse retrieval (BM25)** — matches on the literal tokens in the query against the indexed text. Strong on exact-term queries (e.g., a query for "philodoxia" returns passages that contain that token). Weak on paraphrase (a query for "love of honour" might miss a passage that uses only "philodoxia" without the English gloss).
- **Dense retrieval (vector)** — matches on semantic similarity via embeddings. Strong on paraphrase (a query for "love of honour" finds passages about philodoxia even if they don't use the gloss). Weaker than BM25 on exact-term queries when the corpus uses Greek IDs and the query uses English (or vice versa).
- **Reciprocal Rank Fusion (RRF)** — the algorithm that combines two ranked lists. For each result, the score is `1 / (k + rank)` summed across the two lists, where `k` is a constant (typically 60). The result is a single ranked list that benefits from both retrieval signals.
- **Top-K** — the K most relevant passages returned. Per AC-3, the retriever returns top ~20 to the re-ranker.
- **Mechanism filter** — restricts the retrieval to passages whose `canonical_mechanism` array contains the requested mechanism ID. Cuts the search space dramatically (a query for Mechanism 5's content searches only the ~30 passages tagged with `passion_false_judgement`, not the whole corpus).
- **Passion filter** — restricts the retrieval to passages whose `passion` or `sub_passion` matches the requested ID. Combines with mechanism filter for tight scoping.
- **Per-request cache** — a small in-memory cache that lasts the lifetime of a single API request, keyed on the retrieval query parameters. If the engine asks for the same passages twice (e.g., Rule 5 Pass-1 and Rule 5 Pass-2 both retrieve the philodoxia false-judgement template), the second call hits the cache.

## The retrieve function — signature

The single entry point the engine calls. Implemented as an async TypeScript function in the eventual Phase-2 build:

```typescript
async function retrievePassages(input: RetrieveInput): Promise<RetrieveResult>;

interface RetrieveInput {
  // Required — what the engine is asking for
  query: string;                              // free-text query (paraphrase or exact terms)

  // Optional — structural filters (cut the search space)
  mechanism_filter?: string[];                // e.g., ["passion_false_judgement"] — array because some queries cross mechanisms
  passion_filter?: string;                    // e.g., "epithumia" (root) — restricts to passages tagged with this passion
  sub_passion_filter?: string;                // e.g., "philodoxia" — restricts to passages tagged with this sub-species
  passage_type_filter?: PassageType[];        // e.g., ["mechanism", "canonical_line"] — restricts to specific passage types
  trigger_condition_filter?: string;          // e.g., "TEMPORAL_AMBIGUITY" — for focus-question-stem retrieval (D13)
  intake_tier_filter?: 1 | 2 | 3;             // for focus-question-stem retrieval

  // Optional — retrieval parameters
  top_k?: number;                             // default 20 (per AC-3)
  bm25_weight?: number;                       // default 0.5 — weight applied to BM25 ranks in RRF
  vector_weight?: number;                     // default 0.5 — weight applied to vector ranks in RRF
  rrf_k?: number;                             // default 60 — RRF smoothing constant

  // Optional — diagnostic
  trace_enabled?: boolean;                    // when true, returns per-channel ranks alongside the final order (for D22 verification)
}

type PassageType = 'mechanism' | 'canonical_line' | 'example' | 'focus_question_stem' | 'scoring_rule';

interface RetrieveResult {
  passages: RetrievedPassage[];               // ordered by RRF score, length up to top_k
  retrieval_diagnostics: {
    bm25_count: number;                       // how many passages BM25 returned before fusion
    vector_count: number;                     // how many passages vector returned before fusion
    fusion_count: number;                     // how many distinct passages after RRF (≤ bm25_count + vector_count)
    cache_hit: boolean;                       // true if the result came from per-request cache
    elapsed_ms: number;                       // total elapsed time for this retrieval (target: under 200ms warm; under 500ms cold)
  };
  trace?: RetrieveTrace;                      // present only if trace_enabled: true
}

interface RetrievedPassage {
  passage_id: string;                         // stable identifier from D5
  source_file: string;                        // 'stoic-brain' | 'psychology' | 'passions' | etc.
  source_citation: string;                    // R7 — e.g., 'Stobaeus Eclogae 2.86'
  passage_type: PassageType;
  canonical_mechanism: string[];              // mechanism IDs this passage serves
  passion: string | null;
  sub_passion: string | null;
  audience_tier: string;                      // 'R8a' | 'R8b' | 'R8c' | 'R8d'
  text: string;                               // the chunk text
  paragraph_text: string | null;              // parent paragraph for paraphrase expansion
  rrf_score: number;                          // the fused score (higher = better)
  bm25_rank: number | null;                   // null if the passage didn't appear in BM25 results
  vector_rank: number | null;                 // null if the passage didn't appear in vector results

  // Focus-question-stem fields (present only when passage_type: focus_question_stem)
  trigger_condition?: string;
  intake_tier?: 1 | 2 | 3;
  slot_fields?: SlotField[];                  // per D13 — array of {variable_name, source_path, constraint}
}

interface RetrieveTrace {
  bm25_results: Array<{ passage_id: string; rank: number; score: number }>;
  vector_results: Array<{ passage_id: string; rank: number; cosine_similarity: number }>;
  query_embedding: number[] | null;           // null if vector retrieval was skipped (e.g., embedding service unavailable)
  filters_applied: Record<string, unknown>;
}

interface SlotField {
  variable_name: string;
  source_path: string;
  constraint: string;
}
```

### Field-by-field rationale

- **`query`** — the free-text query. The engine constructs this from the rule's input (e.g., for Mechanism 5 Pass-1 retrieving the philodoxia false-judgement template, the query might be `"philodoxia false judgement reputation"` — Greek ID + English context terms).
- **`mechanism_filter`** — an array because some queries cross multiple mechanisms (e.g., Mechanism 5 and Mechanism 8 both consume `value_indifferent` data; a retrieval that supports Pass-2 enrichment may filter for both). Empty / undefined means no mechanism filter.
- **`passion_filter`** / **`sub_passion_filter`** — the controlled vocabulary IDs from D3. The retriever applies a SQL `WHERE` clause; the index supports this efficiently via the composite index in D5.
- **`passage_type_filter`** — restricts to specific passage types. For Rule 5 Pass-1, the engine wants `passage_type: 'mechanism'` passages from `passions.json` (the false-judgement templates) — so the call passes `passage_type_filter: ['mechanism']` and `passion_filter: 'epithumia'` and `sub_passion_filter: 'philodoxia'`.
- **`trigger_condition_filter`** / **`intake_tier_filter`** — for focus-question-stem retrieval (D13). When the engine fires a Tier 1 trigger, Layer 3 calls `retrievePassages({ passage_type_filter: ['focus_question_stem'], trigger_condition_filter: 'TEMPORAL_AMBIGUITY', intake_tier_filter: 1 })` to get the canonical stem.
- **`top_k`** — per AC-3, the default is 20 (the re-ranker takes the top 20 and produces top 3–5 for the prompt). Specific consumers may request smaller top-K when only a single canonical passage is expected (e.g., the philodoxia false-judgement template lookup may set `top_k: 3` because the catalogue has only one canonical entry per sub-species).
- **`bm25_weight`** / **`vector_weight`** / **`rrf_k`** — RRF tuning parameters. Defaults work for most queries; per-mechanism tuning (e.g., higher BM25 weight for queries that are exact-term-shaped) may be added in Phase-2 production observation.
- **`trace_enabled`** — when true, the retriever returns per-channel diagnostics. For D22's structural tests; production calls leave it false.

### Error modes returned by `retrievePassages`

| Error mode | Returned shape | Engine response |
|---|---|---|
| **Empty result.** No passages match the filters; both channels return empty. | `{ passages: [], retrieval_diagnostics: { bm25_count: 0, vector_count: 0, fusion_count: 0, ... } }` | Engine logs the empty result; rule's logic decides whether the empty result is a Tier 1 trigger (e.g., Rule 5 Pass-1 fails to find the philodoxia template because the catalogue is incomplete) or a deterministic-empty case (e.g., Mechanism 6 finds no oikeiosis passage because the narrative has no targets). |
| **Retrieval timeout.** Either BM25 or vector retrieval exceeded the per-channel timeout (default 5s). | Throws `RetrievalTimeoutError` with the channel that timed out. | Engine catches; falls back to a single-channel retrieval (the channel that succeeded); marks the response with `degraded_retrieval: true` in engine diagnostics. |
| **Embedding service failure.** The query embedding call to OpenAI failed (network, rate-limit, etc.). | Throws `EmbeddingFailureError`. | Engine catches; falls back to BM25-only retrieval; marks `degraded_retrieval: true`; logs the failure. |
| **Both channels failed.** Catastrophic — can't return any passages. | Throws `RetrievalUnavailableError`. | Engine produces the canonical output without retrieved passages where possible (e.g., Mechanism 1's dichotomy-of-control is in `stoic-brain-compiled.ts` as fallback); rules that strictly require retrieved content surface as Tier 3 OPEN_DEFERRAL with a specific deferred question. |

The fallback path (BM25-only when vector fails; or both-channels-failed → engine output with degraded retrieval) preserves AC-12's commitment that the engine produces a deterministic output even under retrieval-channel failure. The honest-disclosure pattern: the response carries `degraded_retrieval: true` so the consumer sees the failure mode.

## The internal pipeline

The retrieve function executes the following sequence:

### Step 1 — Per-request cache lookup

The cache key is a deterministic hash of all RetrieveInput parameters. If a request earlier in the same API call invoked `retrievePassages` with identical parameters, the cache hit returns the cached result. The cache is per-request only; it expires when the API call ends. KG1 rule 4 honoured: the cache is in-memory per request; no cross-request state.

### Step 2 — Build the SQL filter clause

Translate the structural filters (`mechanism_filter`, `passion_filter`, `sub_passion_filter`, `passage_type_filter`, `trigger_condition_filter`, `intake_tier_filter`) into a SQL `WHERE` clause. Example for the philodoxia false-judgement template lookup:

```sql
WHERE passage_type = 'mechanism'
  AND passion = 'epithumia'
  AND sub_passion = 'philodoxia'
  AND canonical_mechanism @> '["passion_false_judgement"]'
```

The clause cuts the search space before BM25 / vector search. With a small Phase-1 corpus (~500 passages), the post-filter set may have <10 candidates; both channels run quickly.

### Step 3 — BM25 query

Run the BM25 search over the post-filter candidates:

```sql
SELECT id, passage_id, ts_rank_cd(tsvector_en, websearch_to_tsquery('english', $1)) AS bm25_score
FROM corpus_passages
WHERE [filter clause]
  AND tsvector_en @@ websearch_to_tsquery('english', $1)
ORDER BY bm25_score DESC
LIMIT $top_k_bm25;
```

`$top_k_bm25` is `top_k * 2` (e.g., 40 if `top_k: 20`) — over-fetch from BM25 because RRF will merge with vector results. `websearch_to_tsquery` handles natural-language queries with quoted phrases and negation gracefully (e.g., `"philodoxia" -hubris` excludes hubris-tagged content if the query uses negation).

### Step 4 — Embed the query

Call the embedding service (OpenAI `text-embedding-3-small` per D5) with the query text. Returns a 1536-dimension vector. Cache the embedding for the duration of the request (subsequent retrievals with the same query reuse the embedding).

### Step 5 — Vector query

Run the vector search over the post-filter candidates:

```sql
SELECT id, passage_id, embedding <=> $query_embedding::vector AS cosine_distance
FROM corpus_passages
WHERE [filter clause]
ORDER BY cosine_distance ASC
LIMIT $top_k_vector;
```

`<=>` is pgvector's cosine distance operator. `$top_k_vector` is `top_k * 2` — same over-fetch logic as BM25.

### Step 6 — Reciprocal Rank Fusion

Merge the two ranked lists. For each unique `passage_id` that appeared in either list:

```
rrf_score(passage_id) =
  bm25_weight * (1 / (rrf_k + bm25_rank(passage_id)))
  + vector_weight * (1 / (rrf_k + vector_rank(passage_id)))
```

Where:
- `bm25_rank(passage_id)` is 1-indexed (the top BM25 result has rank 1); falls back to `Infinity` if the passage didn't appear in BM25 (i.e., its `bm25_rank` term contributes 0).
- `vector_rank(passage_id)` similarly.
- `bm25_weight + vector_weight = 1.0` (defaults: 0.5 each).
- `rrf_k` defaults to 60 (smoothing constant).

Sort by `rrf_score` descending; truncate to `top_k`.

### Step 7 — Hydrate passage rows

Fetch the full row data for each top-K `passage_id`:

```sql
SELECT * FROM corpus_passages WHERE id IN ($top_k_ids);
```

This is one round-trip; the post-filter SELECTs in Steps 3 and 5 returned only `id` and rank scores. The hydration step loads the text, source_citation, and the structural fields the consumer needs.

### Step 8 — Build the result

Assemble `RetrievedPassage` objects with the RRF score, per-channel ranks, and (if `trace_enabled`) the trace block. Return.

### Step 9 — Cache write

Store the result under the cache key from Step 1.

## Cache strategy — per-request only

The cache is **per-request only**. It does not persist across requests. Reasons:

1. **Corpus is stable per request.** The retriever's results depend only on the input parameters and the index state. The index is read-only at request time (per D5 RLS). Within a single request, identical input parameters produce identical output — caching is safe.
2. **Across requests, the cache may stale.** If the corpus is rebuilt (e.g., a new D-A16 catalogue version lands), cached results from the previous version would be incorrect. Per-request scope avoids this risk.
3. **In-memory simplicity.** A simple `Map<cache_key, RetrieveResult>` lives in the request's lexical scope. No external cache infrastructure (Redis, Memcached) needed. KG1 rule 4 (Vercel terminates execution after response) makes the per-request scope natural — the cache disappears when the function returns.
4. **Hit rate is meaningful.** Within a single request, the engine runs Rules 1 → 12 in canonical sequence. Several rules retrieve overlapping content (e.g., Rule 5 Pass-1 and Rule 5 Pass-2 both retrieve the philodoxia false-judgement template). Per-request caching catches these duplicate calls.

The cache implementation:

```typescript
// Per-request scope — declared inside the route handler
const retrievalCache = new Map<string, RetrieveResult>();

function makeCacheKey(input: RetrieveInput): string {
  // Deterministic hash of all input parameters
  return JSON.stringify({
    query: input.query,
    mechanism_filter: input.mechanism_filter?.sort(),
    passion_filter: input.passion_filter,
    sub_passion_filter: input.sub_passion_filter,
    passage_type_filter: input.passage_type_filter?.sort(),
    trigger_condition_filter: input.trigger_condition_filter,
    intake_tier_filter: input.intake_tier_filter,
    top_k: input.top_k,
    bm25_weight: input.bm25_weight,
    vector_weight: input.vector_weight,
    rrf_k: input.rrf_k,
    // trace_enabled is intentionally NOT in the key — same retrieval, just verbose output
  });
}
```

The cache key includes all retrieval parameters (sorted arrays for stable hashing). `trace_enabled` is excluded because it doesn't change the retrieval — only the output's verbosity.

## Per-mechanism call patterns

The engine's main loop (per D9) calls `retrievePassages` at specific positions for specific mechanisms. Common patterns:

| Mechanism | Call shape | Purpose |
|---|---|---|
| Rule 1 (`prohairesis_filter`) | `retrievePassages({ query: "<entity description>", mechanism_filter: ['prohairesis_filter'], passage_type_filter: ['mechanism'] })` | Retrieve the dichotomy-of-control list for entity classification. |
| Rule 2 (`passion_root_detection`) | `retrievePassages({ query: "<feeling description>", mechanism_filter: ['passion_root_detection'], passage_type_filter: ['mechanism'] })` | Retrieve root passion definitions. |
| Rule 3 (`passion_sub_species`) | `retrievePassages({ query: "<feeling + entity>", mechanism_filter: ['passion_sub_species'], passion_filter: '<root from Rule 2>' })` | Retrieve sub-species entries scoped to the detected root. |
| Rule 5 Pass-1 (`passion_false_judgement` placeholder) | `retrievePassages({ query: "<sub_species ID>", mechanism_filter: ['passion_false_judgement'], passion_filter: '<root>', sub_passion_filter: '<sub_species>' })` | Retrieve the canonical false-judgement template. |
| Rule 5 Pass-2 (enrichment) | Per-request cached from Pass-1 — no new call (cache hit). | Same passages as Pass-1; the enrichment uses upstream rule outputs (Rules 8, 9), not new retrieval. |
| Rule 6 (`oikeiosis_stage`) | `retrievePassages({ query: "<target description>", mechanism_filter: ['oikeiosis_stage'], passage_type_filter: ['mechanism'] })` | Retrieve oikeiosis sequence definitions. |
| Rule 7 Pass-1 + Pass-2 (`oikeiosis_obligation`) | `retrievePassages({ query: "<action description>", mechanism_filter: ['oikeiosis_obligation'], passage_type_filter: ['mechanism', 'canonical_line'] })` | Retrieve Cicero's deliberation framework. Both passes cache-hit. |
| Rule 8 (`value_indifferent`) | `retrievePassages({ query: "<indifferent_id>", mechanism_filter: ['value_indifferent'], passage_type_filter: ['mechanism'] })` | Retrieve indifferent definitions (axia, treatment, typical-firing passion). |
| Rule 9 (`virtue_domain_engaged`) | `retrievePassages({ query: "virtue domain unity", mechanism_filter: ['virtue_domain_engaged'], passage_type_filter: ['mechanism'] })` | Retrieve unity thesis + four expressions. |
| Rule 10 (`katorthoma_proximity`) | `retrievePassages({ query: "Senecan grade <grade_id>", mechanism_filter: ['katorthoma_proximity'], passage_type_filter: ['mechanism'] })` | Retrieve Senecan grade signatures. |
| Tier 1 trigger fire (Layer 3) | `retrievePassages({ passage_type_filter: ['focus_question_stem'], trigger_condition_filter: '<code>', intake_tier_filter: 1 })` | Retrieve the canonical stem for the trigger. |

Phase-2 build implements these call patterns as part of each rule's logic. The patterns above are the common cases; specific rules may make additional calls (e.g., Rule 8 may retrieve `INFLATION` / `DEFLATION` example passages for case refinement).

## Retrieval target latency

The retriever's elapsed_ms target:

- **Warm path** (cached embeddings; warm pgvector / GIN indexes): under 200ms total (BM25 + vector + RRF + hydration).
- **Cold path** (first request after cold-start; embedding service round-trip; cold indexes): under 500ms total.

Per AC2 (safety system latency budget), the 500ms cold-path budget is comfortable — the R20a distress check runs in ~500ms for borderline inputs and the architecture accepts this. The retriever runs after R20a (per D14b §"Step 5" / D14a §"R20a perimeter conformance"), so retrieval latency adds to the post-safety latency budget. Phase-2 production observation will report measured latencies.

If the warm-path target is consistently missed, optimisation options include: precomputed query embeddings for common rule patterns (cached server-side, not per-request); pgvector index tuning (`lists` parameter for `ivfflat`); BM25 query simplification (the `websearch_to_tsquery` parser handles most patterns but specific rules may use simpler `plainto_tsquery` variants for speed).

## Cleanliness rating

The retrieve function signature is **HIGH cleanliness** — the input parameters and output shape are fully specified and structurally bounded.

The internal pipeline is **HIGH cleanliness** — each step is deterministic given its inputs. RRF is canonical; the SQL queries are standard PostgreSQL patterns; the cache strategy is per-request scoped and reversible.

The error modes are **HIGH cleanliness** — three named modes plus a catastrophic fallback, with engine-side response patterns specified.

The per-mechanism call patterns are **PARTIAL cleanliness** — the table above lists the common cases, but specific rules may make additional retrievals (e.g., Rule 8's case-refinement may retrieve example passages by passion). The Phase-2 build will surface the full per-rule call set as part of the engine implementation.

## R7 / R8a / KG6 compliance

- **R7 (source fidelity):** the `source_citation` field is preserved through every retrieval. Layer 3 prose translation may quote a passage (per the inclusion + exclusion rules in D11 / D12); the citation is available for attribution.
- **R8a (strict glossary):** the `passion` / `sub_passion` / `canonical_mechanism` filters use Greek/canonical IDs throughout. Layer 1's output (D10) supplies the IDs; the retriever consumes them directly.
- **KG6 (composition order):** the retriever's output flows to the consumer (the engine, or Layer 3 for focus-question stems). The consumer decides whether the retrieved content lands in a system block (cached) or user message (per-request). The retriever does not impose a placement; the consumer's prompt-composition step handles it. Common patterns: corpus content for engine rules typically goes into the rule's deterministic logic (no LLM; no system/user distinction); focus-question stems for Layer 3 land in the user message (per-request stem); D5's controlled-vocabulary lists (passion taxonomy, indifferents) are typically system-block-cached at Layer 1's prompt composition (per D10 §"Cache discipline").

## Open questions

1. **Per-mechanism RRF weight tuning.** Default is 0.5 / 0.5 (equal weight). Specific mechanisms may benefit from different weights — e.g., focus-question-stem retrieval is exact-match-shaped (the `trigger_condition_filter` constrains tightly) and may set `bm25_weight: 0.7` to emphasise token matching. Logged for Phase-2 production observation.
2. **Embedding cache across requests.** Today the per-request cache only catches in-request duplicates. Common queries (e.g., the dichotomy-of-control retrieval that fires on every request) might benefit from a server-side embedding cache. Trade-off: cross-request cache adds infrastructure (Redis/Memcached); current corpus-and-query patterns may not justify it. Logged for Phase-2 production observation.
3. **Retrieval observability.** Phase-2 production should log retrieval diagnostics (latencies, cache hit rates, channel-failure rates) so the cost model (D20) can be revised against observed reality. This is a Phase-2 observability scope; logged for that work.
4. **Reranking integration.** This deliverable specifies the retrieve function. The re-rank step (D7) consumes its output. The integration shape: Phase-2 build runs `retrievePassages → reRank → top-3-5 to prompt`. Whether the re-rank step calls back into `retrievePassages` for adjacent context is a Phase-2 implementation choice.

## Honest disclosure

The retrieve function is the storage-level interface. It does no Stoic reasoning. It produces ranked passages with provenance preserved; the engine's rules consume the rankings deterministically.

The default RRF weights (0.5 / 0.5) are working values. Phase-2 production observation may reveal per-mechanism tuning that improves recall@K. The architecture supports per-call weight overrides via the input parameters.

The error modes (timeout, embedding failure, both-channels-failed) are named with engine-side response patterns. The fallback paths preserve AC-12's commitment that the engine produces a deterministic output even under degraded retrieval, with honest disclosure (`degraded_retrieval: true` in engine diagnostics).

## Approval gate

This deliverable is consumed by Phase-2 build (the retriever implementation) and by D7 (the re-rank design that consumes this interface's output). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk and requires its own decision-log entry.

---

*End of Deliverable 6.*
