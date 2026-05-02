# Deliverable 5 — Index Schema

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-1 (passion-indexed retrieval); AC-2 (hybrid retrieval — BM25 + vector via Reciprocal Rank Fusion); AC-4 (small chunks); AC-6 (index designed to be Graph-RAG-extensible); AC-12 (translation-sandwich — the corpus is the rule book the engine reads); R7 (source fidelity); R8a (strict glossary in data files); R17b (application-level encryption — read-side index policy).

**Cross-references:**
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — the 9+1 mechanism taxonomy whose IDs become structural fields in the index)
- `/adopted/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary the `passion` / `sub_passion` fields draw from)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose `Source:` fields name the corpus passages indexed here)
- `/drafts/rag-mentor-alt3/corpus-inventory.md` (D4 — the tagging schema this deliverable materialises into storage)
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — consumes this index via the hybrid retrieve function)
- `/drafts/rag-mentor-alt3/re-rank-design.md` (D7 — re-ranks the retrieve results from this index)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — the focus-question-stem catalogue that this index hosts under `passage_type: focus_question_stem`)
- `/drafts/rag-mentor-alt3/migration-plan.md` (D21 — the Phase-2 build sequence for index construction)
- `/drafts/rag-mentor-alt3/cost-model.md` (D20 — the storage and embedding costs this schema implies)
- `/drafts/rag-mentor-alt3/test-plan.md` (D22 — the structural tests that verify this schema's integrity)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/operations/knowledge-gaps.md` KG2 (Sonnet/Haiku boundary — informs the embedding-model selection); KG6 (composition order — informs how this index's outputs flow to system vs user blocks); KG7 (JSONB storage format — informs the `slot_fields` JSONB column's `jsonb_typeof` discipline)
- `/manifest.md` AC1, AC2, AC4, AC5, AC6, R7, R8a, R17b
- `/website/src/data/stoic-brain-compiled.ts` (the 8 condensed context constants — the migration source)
- `/website/src/lib/context/stoic-brain-loader.ts` (the current per-mechanism loader — superseded by the indexed retriever per Phase 2)

---

## Plain-language summary

The deterministic engine cannot reason from the raw 8 source files of the Stoic Brain corpus on every request — that would be slow and expensive. It needs a **searchable index**: a database of every retrievable passage from the corpus, tagged with structured fields (which canonical mechanism the passage serves, which passion it touches, what type of passage it is) and equipped with two kinds of search support — a BM25 token index (a classic full-text search over the words in the passage) and a vector embedding (a numeric fingerprint that captures the passage's meaning so semantically similar passages can be found even when the words differ).

This deliverable specifies the **shape of that index**. It names the storage technology (one Supabase table using two PostgreSQL features — pgvector for the vector embedding and tsvector for the BM25 token index), the columns and constraints on the table, the indexes that make retrieval fast, the embedding model to use, the chunk-size policy (per AC-4 small chunks), the row-level security policy (the index is read-only at request time; only Phase-2 build operators can write), and the migration path from today's `stoic-brain-compiled.ts` constants to the indexed table.

The deliverable does not perform per-passage tagging. Per-passage tagging is a Phase-2 build task: this deliverable is the storage contract; the Phase-2 build executes against it.

## Glossary

- **BM25** — a classic full-text search algorithm that ranks documents by how well their tokens (words) match a query, with adjustments for term frequency and document length. PostgreSQL implements BM25-shape ranking via the `tsvector` (token vector) and `tsquery` (token query) types.
- **Vector embedding** — a numeric fingerprint of a passage's meaning, produced by an embedding model. Two passages with similar meanings produce similar fingerprints (their cosine similarity is high) even if they share few words. The fingerprint is a vector of fixed length (1536 dimensions for OpenAI's text-embedding-3-small; 768 for many open models).
- **pgvector** — a PostgreSQL extension that stores vector embeddings and supports nearest-neighbour search over them. Supabase ships with pgvector available.
- **tsvector** — a built-in PostgreSQL type that stores tokens for BM25-shape full-text search. Built into Postgres; no extension required.
- **Reciprocal Rank Fusion (RRF)** — a method for combining two ranked lists (e.g., the top-K from BM25 and the top-K from vector search) into a single ranked list. The score for each result is `1 / (k + rank)` summed across the two lists, where `k` is a constant (typically 60). Produces a hybrid result that benefits from both retrieval signals.
- **Top-K** — the K most relevant passages returned by a retrieval call. Per AC-3, the retriever returns top ~20 to the re-ranker; the re-ranker returns top ~3–5 to the prompt.
- **RLS (Row Level Security)** — a PostgreSQL feature that filters rows visible to an authenticated user based on policy. The index is read-only at request time, so the RLS policy permits reads for any authenticated user but write operations only for the build-time operator.
- **Sparse vs dense retrieval** — sparse retrieval (BM25) matches on the literal tokens in the query; dense retrieval (vector search) matches on the semantic meaning regardless of tokens. Hybrid retrieval combines both.
- **Graph RAG** — an extension to retrieval where passages link to each other (one passage cites another; one mechanism's input is another mechanism's output). AC-6 specifies that Phase 1 does not commit to Graph RAG but the index must be designed to be Graph-RAG-extensible — i.e., the schema supports adding edge tables later without restructuring the existing schema.
- **Chunk** — the unit of indexed text. Per AC-4, chunks are sentence-level / sub-sentence with paragraph expansion for paraphrase retrieval (the chunk that the BM25/vector search returns is short; the paragraph it belongs to is also retrievable for richer context when needed).

## Storage decision — single table or separate stores

Two structural options the deliverable resolves:

- **Option A — Single Supabase table with pgvector + tsvector columns.** One row per passage. The row carries the structural tags (mechanism IDs, passion IDs, passage type, etc.), the embedding vector (pgvector column), and the BM25 token vector (tsvector column). One read at retrieval time; one write at build time. Pros: minimum infrastructure complexity; one source of truth for retrieval; Supabase's existing RLS policies cover both retrieval channels. Cons: the table can grow large (estimated 5–10k rows post-promotion of D-A16 catalogue and D-A10 expansion); BM25 and vector indexes both attach to the same table and may compete for I/O at write time.
- **Option B — Separate vector store + full-text-search store.** pgvector in Supabase for vector search; a separate Postgres table (or external service like Elasticsearch) for full-text search. Pros: each store can scale independently; specialised tuning per channel. Cons: two writes per passage at build time; two reads at retrieval time; RRF fusion happens at the application layer; consistency between stores is a separate concern.

**Recommendation: Option A — single table with pgvector + tsvector columns.**

Reasons:

1. **Phase-1 corpus is small.** The 8 condensed context constants in `stoic-brain-compiled.ts` total approximately 2–3k tokens of structured content. Per AC-4 small chunks (sentence-level), the indexed corpus is approximately 200–500 passages at v1.0. Post-D-A16 promotion (focus-question-stem catalogue), approximately 50–100 additional passages. Post-D-A10 expansion (which is parallel-track and not Phase-1), the corpus may grow to several thousand passages. Even at the upper bound, the table fits comfortably in a single Supabase instance.
2. **One source of truth.** The structural tags (`canonical_mechanism`, `passion`, `sub_passion`, `passage_type`) drive both retrieval channels — the same `WHERE passion = 'philodoxia'` filter applies to BM25 retrieval and to vector retrieval. Two stores would require duplicating the structural tags.
3. **Supabase RLS covers both channels.** The same RLS policy applies whether the retrieval is BM25-shaped or vector-shaped. R17b's intimate-data perimeter (which does not extend to the corpus index — the corpus is shared philosophical content, not practitioner data) is honoured by the RLS policy structure.
4. **Phase-2 build simplicity.** One INSERT per passage at build time; one SELECT per query at request time. The RRF fusion happens in the retrieval layer (D6), not at the storage layer.
5. **Graph RAG extensibility (AC-6).** Adding a passage-edges table later does not require restructuring the existing storage. Option A's single-table-per-passage design is the natural foundation for an edges-on-top extension.

The single-table design is the canonical choice. Phase 2's eventual scale problems (if they arise) can be addressed by partitioning the passage table by `source_file` or by promoting BM25 to a separate store — both are reversible refinements to the architecture.

## The `corpus_passages` table — schema

The single table that holds the indexed corpus. Phase-2 build creates this table as a separate Standard-risk schema migration with its own decision-log entry. Schema:

```sql
CREATE EXTENSION IF NOT EXISTS vector;       -- pgvector

CREATE TABLE corpus_passages (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id VARCHAR(256) NOT NULL UNIQUE,    -- stable identifier — e.g., 'passions:epithumia:philodoxia:definition'

  -- Provenance (R7 source fidelity)
  source_file VARCHAR(64) NOT NULL,           -- 'stoic-brain' | 'psychology' | 'passions' | 'virtue' | 'value' | 'action' | 'progress' | 'scoring' | 'focus-questions'
  source_citation TEXT NOT NULL,              -- 'Stobaeus Eclogae 2.86' | 'DL Lives 7.110' | 'alt-3 handoff 2026-04-29 (alt-3 derived)' | etc.

  -- Structural classification (per D4 §"Tagging schema")
  passage_type VARCHAR(32) NOT NULL,          -- 'mechanism' | 'canonical_line' | 'example' | 'focus_question_stem' | 'scoring_rule'
  canonical_mechanism JSONB NOT NULL,         -- array of mechanism IDs — e.g., ["passion_root_detection","passion_sub_species","passion_false_judgement"]
  passion VARCHAR(32),                        -- 'epithumia' | 'hedone' | 'phobos' | 'lupe' | NULL
  sub_passion VARCHAR(64),                    -- 'philodoxia' | 'orge' | 'agonia' | ... | 'chara' | 'boulesis' | 'eulabeia' | NULL
  audience_tier VARCHAR(8) NOT NULL,          -- 'R8a' | 'R8b' | 'R8c' | 'R8d'

  -- Trigger context (for passage_type = 'focus_question_stem' only; NULL otherwise)
  trigger_condition VARCHAR(64),              -- 'TEMPORAL_AMBIGUITY' | 'SCOPE_AMBIGUITY' | 'ELEMENT_FUSION' | 'STATED_OPERATIVE_CONFLICT' | 'STATED_EQUANIMITY_UNVERIFIED' | 'EUPATHEIA_BOUNDARY' | 'PRAXIS_MOTIVATION_AMBIGUITY' | surface-level codes per D13
  intake_tier SMALLINT,                       -- 1 | 2 | 3 | NULL
  slot_fields JSONB,                          -- per D13 §"slot_fields" — array of {variable_name, source_path, constraint}; NULL if no slots

  -- Content
  text TEXT NOT NULL,                         -- the passage text
  paragraph_text TEXT,                        -- the parent paragraph (per AC-4 paragraph expansion); NULL if the chunk is a paragraph itself

  -- Retrieval indexes
  embedding VECTOR(1536),                     -- text-embedding-3-small (1536 dims) — see §"Embedding model selection" below
  tsvector_en TSVECTOR,                       -- tsvector built from text using English language config

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,         -- bumped when the passage's text is rewritten (corpus revision)

  -- Constraints
  CONSTRAINT passage_type_valid CHECK (passage_type IN ('mechanism','canonical_line','example','focus_question_stem','scoring_rule')),
  CONSTRAINT source_file_valid CHECK (source_file IN ('stoic-brain','psychology','passions','virtue','value','action','progress','scoring','focus-questions')),
  CONSTRAINT audience_tier_valid CHECK (audience_tier IN ('R8a','R8b','R8c','R8d')),
  CONSTRAINT intake_tier_valid CHECK (intake_tier IS NULL OR intake_tier IN (1,2,3)),
  CONSTRAINT focus_question_completeness CHECK (
    (passage_type = 'focus_question_stem' AND trigger_condition IS NOT NULL AND intake_tier IS NOT NULL)
    OR (passage_type != 'focus_question_stem' AND trigger_condition IS NULL AND intake_tier IS NULL)
  )
);

-- Retrieval indexes
CREATE INDEX idx_corpus_passages_embedding ON corpus_passages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_corpus_passages_tsvector ON corpus_passages USING GIN (tsvector_en);

-- Filter indexes (composite for the most common query shapes)
CREATE INDEX idx_corpus_passages_mechanism_passion ON corpus_passages (passage_type, passion, sub_passion);
CREATE INDEX idx_corpus_passages_canonical_mechanism ON corpus_passages USING GIN (canonical_mechanism);
CREATE INDEX idx_corpus_passages_trigger ON corpus_passages (trigger_condition, intake_tier) WHERE passage_type = 'focus_question_stem';
CREATE INDEX idx_corpus_passages_source ON corpus_passages (source_file);

-- Trigger to maintain tsvector_en automatically
CREATE FUNCTION corpus_passages_tsvector_update() RETURNS trigger AS $$
BEGIN
  NEW.tsvector_en := to_tsvector('english', NEW.text);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER corpus_passages_tsvector_trigger
  BEFORE INSERT OR UPDATE OF text ON corpus_passages
  FOR EACH ROW EXECUTE FUNCTION corpus_passages_tsvector_update();
```

### Field semantics

Field-by-field rationale:

- **`id`** — internal UUID, used by foreign keys (e.g., a future passage-edges table for AC-6 Graph RAG extension).
- **`passage_id`** — stable string identifier readable by humans (e.g., `passions:epithumia:philodoxia:definition`). The format is `<source_file>:<section>:<offset_or_label>`. UNIQUE — no two passages share the same passage_id. The format is the canonical reference used in D8's `Source:` fields and in Layer 3 prose citations.
- **`source_file`** — one of the 8 corpus source files plus `focus-questions` for the D-A16 catalogue. Constrained via CHECK.
- **`source_citation`** — the human-readable citation. R7 source fidelity: every passage cites a specific corpus origin; alt-3-derived stems honestly cite their alt-3-handoff origin.
- **`passage_type`** — one of the 5 canonical types per D4 §"`passage_type` values". Constrained via CHECK.
- **`canonical_mechanism`** — JSONB array of mechanism IDs the passage serves. JSONB rather than text array because PostgreSQL's GIN index on JSONB handles array containment queries (`canonical_mechanism @> '["passion_root_detection"]'`) efficiently. Per D4 §"`canonical_mechanism` mapping rules", a passage may serve multiple mechanisms.
- **`passion`** / **`sub_passion`** — controlled vocabulary IDs from D3. NULL when the passage is passion-agnostic (foundations, virtue, action, progress, scoring). The 4 root passions plus 3 eupatheiai populate `sub_passion` when applicable (e.g., `chara`, `boulesis`, `eulabeia` go in `sub_passion`).
- **`audience_tier`** — one of R8a/R8b/R8c/R8d. Determines how Layer 3 may render the passage in user-facing prose.
- **`trigger_condition`** / **`intake_tier`** / **`slot_fields`** — populated only for `passage_type: focus_question_stem`. The CHECK constraint enforces this. `slot_fields` is JSONB per D13's `slot_fields[]` shape — KG7 discipline applies (pass arrays directly to the Supabase client; do not `JSON.stringify`).
- **`text`** — the passage text per AC-4 small chunk. Sentence-level or sub-sentence; the parent paragraph is in `paragraph_text` for paraphrase expansion when the retriever needs richer context.
- **`paragraph_text`** — the parent paragraph (NULL if the chunk is a paragraph). Per AC-4: small chunks for retrieval precision, paragraph expansion for paraphrase context.
- **`embedding`** — pgvector column; 1536 dimensions for `text-embedding-3-small` (see §"Embedding model selection" below).
- **`tsvector_en`** — auto-maintained via the trigger. English language stemming and stop-word removal applied. Phase 2 may add per-language tsvector columns if the corpus expands to multilingual content.
- **`created_at`** / **`updated_at`** / **`version`** — operational metadata. `version` increments when a passage's `text` is rewritten as part of a corpus revision (e.g., a corrected translation). Rewrites trigger re-embedding.

### `canonical_mechanism` query patterns

Three common query shapes the index supports:

1. **By single mechanism:** `WHERE canonical_mechanism @> '["passion_root_detection"]'` — returns passages whose canonical_mechanism array contains the given mechanism ID. The GIN index on `canonical_mechanism` makes this query fast.
2. **By mechanism + passion:** `WHERE canonical_mechanism @> '["passion_sub_species"]' AND passion = 'epithumia'` — returns passages serving Mechanism 3 and touching epithumia (philodoxia / philargyria / epithumia-specific entries). The composite index `idx_corpus_passages_mechanism_passion` supports this; the GIN index on canonical_mechanism filters first.
3. **By trigger code:** `WHERE passage_type = 'focus_question_stem' AND trigger_condition = 'TEMPORAL_AMBIGUITY'` — returns the question stems for a specific Tier 1 trigger. The partial index `idx_corpus_passages_trigger` (predicate `WHERE passage_type = 'focus_question_stem'`) keeps this query fast.

### Why `canonical_mechanism` is JSONB (not a junction table)

A passage may serve multiple mechanisms (per D4 §"`canonical_mechanism` mapping rules" — e.g., the dichotomy-of-control passage serves Mechanism 1 and Mechanism 8). Two storage options:

- **Option (i) — Junction table.** A separate `passage_mechanisms` table with `(passage_id, mechanism_id)` rows. Pros: relational normalisation; foreign-key integrity. Cons: every retrieve query joins; index size doubles.
- **Option (ii) — JSONB array column.** The `canonical_mechanism` JSONB column holds the array. Pros: single-row reads; GIN index on JSONB supports array containment; no join. Cons: less normalised; mechanism IDs are strings rather than foreign keys.

**Recommendation: Option (ii) — JSONB array.** The mechanism IDs are a closed, small set (10 mechanisms) and changes are rare (adding a new mechanism would be a major architectural revision). The cost of a junction table's join on every retrieve outweighs the relational-integrity benefit. PR4-shaped reasoning: small fixed vocabularies live in code/JSONB; joins are reserved for genuinely many-to-many relationships with cardinality drift.

## Embedding model selection

The embedding model determines vector dimension, semantic quality, and per-passage embedding cost. Three candidates evaluated:

| Model | Dimensions | Cost per 1M tokens | Quality (Phase-1 corpus) | Notes |
|---|---|---|---|---|
| OpenAI `text-embedding-3-small` | 1536 | $0.02 | High | Industry-standard; well-tested on philosophical content; OpenAI-hosted. |
| OpenAI `text-embedding-3-large` | 3072 | $0.13 | Highest | 2x dimension cost; ~10–15% quality lift on benchmark. |
| Anthropic Voyage / open-model alternatives | 1024–768 | varies | Untested in our context | No production data on Stoic Brain content. |

**Recommendation: `text-embedding-3-small` (1536 dimensions, $0.02 per 1M tokens).**

Reasons:

1. **Quality is sufficient for Phase 1.** The Phase-1 corpus is approximately 200–500 passages at v1.0 (post-D-A16 promotion approximately 250–600 passages). Even at recall@10 of 90% (a reasonable lower bound for `text-embedding-3-small`), the re-rank step (D7) recovers most missed passages. The `text-embedding-3-large` quality lift is real but does not justify the 6.5x cost increase at this corpus size.
2. **Cost stays within the R5 free-tier ceiling.** At 1M tokens of corpus (an order of magnitude over the actual Phase-1 corpus size), the embedding cost is $0.02 — negligible. Even at full D-A10 corpus expansion (~10x), the embedding cost stays under $0.50 for the entire corpus index. The cost is a one-time build-time charge, not a per-request charge.
3. **Cross-vendor risk acceptable.** Using OpenAI for embeddings while using Anthropic for Layer 1/Layer 3 translations is a deliberate mixed-vendor posture. The embedding model is replaceable: re-embedding the corpus with a different model takes minutes at this size and produces a versioned `embedding` column that retrieval queries can switch to without schema changes.

**Per-request embedding cost (at retrieval time).** The retriever must embed the query at request time to do vector search. Per request, the embedding cost is approximately 50–150 tokens × $0.02 / 1M = ~$0.000003 per request. Negligible — the cost model (D20) treats this as effectively zero against the much larger LLM costs.

**Versioning.** When the embedding model is changed (e.g., upgrading to `text-embedding-3-large` post-launch based on observed retrieval quality), Phase 2's re-build runs the new model against every passage, populates a new `embedding_v2` column, switches retrieve queries to the new column, and drops the old column once verification passes. The schema's existing `embedding` column is named without versioning suffix; the schema migration adds versioned columns when needed.

## Chunk-size policy (per AC-4)

Per AC-4, chunks are sentence-level / sub-sentence with paragraph expansion for paraphrase. The chunk-size policy resolves how passages are decomposed at index-construction time:

- **Sentence-level by default.** Each sentence in the corpus becomes a separate row in `corpus_passages`. Sentence boundaries detected by a punctuation-aware sentence-splitter (e.g., the `Intl.Segmenter` API or a simple regex with handling for abbreviations; Phase 2 build chooses the implementation).
- **Sub-sentence for list items.** When a sentence is a list (e.g., the `up_to_us[]` list in `stoic-brain.json`'s dichotomy of control), each list item is its own row. The list item's `passage_id` reflects the position (e.g., `stoic-brain:foundations:dichotomy_of_control:up_to_us:0` for the first item).
- **Paragraph as parent context.** The `paragraph_text` column carries the parent paragraph. The retriever (D6) can choose whether to return the chunk text alone, the paragraph text alone, or both — depending on the consumer's needs.
- **No multi-paragraph chunks.** Per AC-4, no chunk spans multiple paragraphs. The architectural argument: small chunks make BM25 precision higher and vector embeddings tighter. Multi-paragraph chunks dilute both signals.

Worked example — D4 Example A (the dichotomy of control list):

| Source content | Chunks produced | passage_id format |
|---|---|---|
| `up_to_us[]` list with 7 items (judgements, impulses, desires, aversions, assent, moral choice, character) | 7 separate rows + 1 row for the parent passage (the whole list as one chunk) | `stoic-brain:foundations:dichotomy_of_control:up_to_us:N` for items; `stoic-brain:foundations:dichotomy_of_control:up_to_us:list` for the whole-list chunk |

Each item's `paragraph_text` is the whole-list text, so a query that retrieves a single item can also see the list's surrounding context.

## RLS — read-only at request time

The corpus is shared philosophical content, not practitioner-private data. R17b's intimate-data perimeter does not extend to the corpus index. The RLS policy:

```sql
ALTER TABLE corpus_passages ENABLE ROW LEVEL SECURITY;

-- Read access: any authenticated user (the engine reads via the API route's authenticated context; agent callers via their own service role).
CREATE POLICY corpus_passages_read_authenticated ON corpus_passages
  FOR SELECT
  TO authenticated
  USING (true);

-- Read access: service role (build-time embedding + index construction).
CREATE POLICY corpus_passages_read_service ON corpus_passages
  FOR SELECT
  TO service_role
  USING (true);

-- Write access: service role only (Phase-2 build-time index construction).
CREATE POLICY corpus_passages_write_service ON corpus_passages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anonymous read access for the public corpus reference page (R8c — surface where the practitioner can browse the corpus).
-- Phase-2 build decides whether to enable this. Default: anonymous reads disabled until the public corpus reference page is wired.
-- CREATE POLICY corpus_passages_read_anonymous ON corpus_passages
--   FOR SELECT
--   TO anon
--   USING (passage_type IN ('canonical_line', 'example') AND audience_tier = 'R8c');
```

The anonymous-read policy is commented out by default. Phase 2 decides whether the public-facing corpus reference page exposes the index (e.g., a /corpus page that lets readers browse). If exposed, the policy filters to `canonical_line` and `example` passages at R8c (no `mechanism` or `scoring_rule` passages exposed — those would expose the engine's reasoning machinery per R4 IP protection).

**R17b note:** The corpus index is not subject to R17b's application-level encryption requirement. R17b applies to intimate practitioner data (passion maps, trigger maps, contradiction maps, developmental timelines). The corpus is shared philosophical content with no per-practitioner specifics.

## Migration shape — from `stoic-brain-compiled.ts` to `corpus_passages`

Today's engine reads the corpus via 8 condensed context constants in `stoic-brain-compiled.ts`. Phase-2 build replaces this read pattern with the indexed retriever (D6 hybrid retrieve function). The migration shape:

### Step 1 — Build-time decomposition

A Phase-2 build script reads each of the 8 source files (`stoic-brain.json`, `psychology.json`, `passions.json`, `virtue.json`, `value.json`, `action.json`, `progress.json`, `scoring.json`) and decomposes each into per-passage rows per the chunk-size policy above. The decomposition produces:

- For each `mechanism`-type passage: a row with the passage's text, the parent paragraph as `paragraph_text`, the canonical_mechanism array based on D4's per-file mapping rules, the passion / sub_passion tags where applicable.
- For each `canonical_line`-type passage: similarly decomposed; passages tagged with the source citation (e.g., Stobaeus Eclogae 2.86).
- For each `example`-type passage: similarly decomposed.
- For each `scoring_rule`-type passage: from `scoring.json`, with `source_file: 'scoring'`.

For each passage, the build script also embeds the text via the OpenAI embedding API and stores the resulting 1536-dimension vector in the `embedding` column. The build-time cost of embedding the entire corpus is approximately $0.001–0.005 (tens of thousands of tokens at $0.02 per 1M tokens).

### Step 2 — D-A16 catalogue promotion

The D-A16 focus-question stems catalogue is the new corpus content named in D4 Coverage Gap 1. Phase-2 build assembles the catalogue by:

1. Extracting current `mentor-knowledge-base.ts` question patterns and `REFLECTION_PROMPT` evening-prompt patterns.
2. For each pattern, decomposing into a stem with `[VARIABLE]` placeholders and a `slot_fields[]` JSONB structure.
3. Tagging each stem with `passage_type: focus_question_stem`, `trigger_condition`, `intake_tier`, `slot_fields`.
4. Storing in `corpus_passages` with `source_file: 'focus-questions'` (or `source_file: 'scoring'` if the founder prefers the catalogue lives within `scoring.json`'s domain — Phase-2 build decides the storage location; the schema accepts either).
5. The `source_citation` field carries `alt-3 handoff 2026-04-29 (alt-3 derived)` for stems without a Stoic primary source.

Per D14b §"Phase-2 pass 1 build readiness", the catalogue can be partially populated for the EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger codes specifically (the two Tier 3 triggers — Phase-2 pass 1's minimum requirement). Other trigger code stems land at later passes.

### Step 3 — Phase-2 retriever wiring

Once the table is populated, Phase-2 build wires the retrieval interface (D6) to query `corpus_passages` instead of reading from `stoic-brain-compiled.ts`. The existing `stoic-brain-loader.ts` per-mechanism context builders become deprecated; their callers migrate to the retriever. The migration is route-by-route per D21 Phase-2 sequencing.

### Step 4 — Deprecation of `stoic-brain-compiled.ts`

Once all routes that read from `stoic-brain-compiled.ts` have migrated to the indexed retriever, the constants file is removed from the codebase. This is a Phase-3+ cleanup; not Phase-2 scope.

## Storage decision implications for D-A10 corpus expansion

The schema is forward-compatible with D-A10 corpus expansion (parallel-track per D4 Gap 2). Future corpus content (e.g., additional sub-species worked examples, additional canonical lines, domain-specific scoring rules) lands as new rows in `corpus_passages` with appropriate tags. No schema migration required. The expansion's effect on retrieval quality is measurable per-query (the retriever's recall@K increases with corpus density per mechanism).

## Graph RAG extensibility (per AC-6)

Phase 1 does not commit to Graph RAG (per AC-6 — outline only). The schema is designed to be Graph-RAG-extensible by adding a separate edges table without altering `corpus_passages`:

```sql
-- Future Phase 3+ — not Phase-1 scope
CREATE TABLE corpus_passage_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_passage_id UUID NOT NULL REFERENCES corpus_passages(id) ON DELETE CASCADE,
  target_passage_id UUID NOT NULL REFERENCES corpus_passages(id) ON DELETE CASCADE,
  edge_type VARCHAR(64) NOT NULL,             -- 'cites' | 'implements' | 'enriches' | 'contradicts' | 'is_example_of' | 'is_eupatheia_counterpart_of'
  weight FLOAT,                               -- optional — for weighted edges
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corpus_passage_edges_source ON corpus_passage_edges (source_passage_id, edge_type);
CREATE INDEX idx_corpus_passage_edges_target ON corpus_passage_edges (target_passage_id, edge_type);
```

The edges table supports Graph RAG queries like "find all passages that implement Mechanism 5's false-judgement template AND are example-of philodoxia." Phase 3+ build adds this if production observation surfaces a need that hybrid retrieval (D6) does not meet.

## Cleanliness rating

The schema design is **HIGH cleanliness**:

- The single-table design with pgvector + tsvector is canonical and well-supported by Supabase.
- The structural fields are derived directly from D4's tagging schema; no interpretive judgement at the schema level.
- The constraints (CHECK on enums, CHECK on focus_question_completeness) are deterministic.
- The retrieval indexes are standard PostgreSQL patterns.

The migration shape is **PARTIAL cleanliness** at the build-time decomposition step (per AC-4 chunk-size policy):

- Sentence-level decomposition is structurally bounded but the sentence boundaries themselves require a tokenizer choice. Phase-2 build chooses the implementation; the schema accepts the result.
- Mechanism-tagging decisions (which canonical_mechanism array each passage carries) follow D4's per-file rules but require per-passage interpretation in cases where the rules name multiple candidates. The interpretation is bounded by the per-file mapping rules and is auditable at the row level.

The embedding model selection is **HIGH cleanliness** at the architectural level (the cost-quality tradeoff is named; the choice is canonical for Phase 1) but the per-passage embedding quality is empirical (Phase 2 measures retrieval quality and adjusts).

## R7 / R8a / R17b compliance

- **R7 (source fidelity):** every passage carries `source_citation`. Application-derived passages (focus-question stems pre-D-A16 promotion; scoring rules) honestly cite their non-Stoic origin (e.g., `alt-3 handoff 2026-04-29 (alt-3 derived)`).
- **R8a (strict glossary):** the schema's controlled-vocabulary fields use Greek/canonical IDs (`passion: epithumia`, `sub_passion: philodoxia`, `canonical_mechanism: ['passion_root_detection']`).
- **R17b (application-level encryption — read-side):** N/A. The corpus is not intimate practitioner data. RLS covers the read perimeter; encryption is not required.

## R5 cost compliance

- **Build-time embedding cost:** $0.02 per 1M tokens; Phase-1 corpus is ~50k tokens; total $0.001 build-time.
- **Per-request embedding cost:** ~$0.000003 per query embed; negligible.
- **Storage cost:** 1536-dim float32 vector per row × 200–500 rows = ~3 MB at v1.0; trivial.
- **Operational cost:** Supabase row count is well within the free tier; no Vercel-side function execution overhead beyond the retrieval call (D6).

The R5 free-tier ceiling (100 calls/month at the per-call cost) is not threatened by the index itself. The cost model (D20) consolidates this with the engine's per-request LLM costs.

## Open questions

1. **Embedding model upgrade trigger.** Recommendation: re-evaluate `text-embedding-3-large` if Phase-2 production retrieval recall@10 falls below 85%. Phase-2 build observes retrieval quality and reports.
2. **Anonymous read policy on `/corpus` reference page.** The schema's RLS policy supports this but the anonymous policy is commented out by default. Founder calls when the public reference page is built.
3. **`focus-questions` source_file vs `scoring` source_file for D-A16 catalogue.** The schema accepts either. Phase-2 build decides during catalogue assembly. Recommendation: separate `focus-questions` source for clean separation; alternative: fold into `scoring.json`'s domain.
4. **Per-language tsvector columns.** Today: English only. If the corpus expands to multilingual content (Phase 3+), the schema adds `tsvector_es`, `tsvector_fr`, etc. The migration is non-destructive (new columns added; old column unchanged).
5. **Passage versioning strategy.** Today: integer version field bumped on text rewrites. If full passage history becomes operationally useful (e.g., for translation-quality observation), Phase 3+ adds a `corpus_passage_history` table.

## Honest disclosure

The schema is the storage contract. Per-passage tagging is Phase-2 build work — the build-time decomposition, embedding, and tagging operations execute against this schema; this deliverable does not perform the tagging itself.

The single-table design is canonical for Phase 1; the alternative (separate vector store + full-text store) is named and rejected with reasoning. Phase 2 production observation may reveal scale problems that motivate splitting; the architecture supports the split as a reversible refinement.

The embedding model selection (`text-embedding-3-small`) is canonical for Phase 1 with cost and quality tradeoff named. Re-evaluation is logged as Phase-2 production observation candidate.

The Graph RAG extension is named with the eventual edges-table schema sketched. Phase 1 does not commit to Graph RAG per AC-6; Phase 3+ adds if observation surfaces a need.

## Approval gate

This deliverable is consumed by Phase-2 build (the schema migration and per-passage indexing). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii — design only; no live-system effect). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk and requires its own decision-log entry.

The Phase-2 schema migration (the actual `CREATE TABLE corpus_passages ...` execution against Supabase) is a separate Standard-risk decision-log entry at Phase-2 build time.

---

*End of Deliverable 5.*
