# Next-Session Prompt — Sub-session C-bis: D6 retrieval interface + D7 re-ranker implementation

**Stream:** founder.
**Tier:** code-standard.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-embeddings-and-ivfflat-close.md`.
**Predecessor decision-log entries:** `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04`; `D-CORPUS-PASSAGES-POPULATION-2026-05-03`; `D-CORPUS-PASSAGES-SCHEMA-2026-05-03`.
**Risk classification:** **Standard** under 0d-ii. New code modules (retrieval interface + re-ranker) consumed by future Phase-2 build sub-sessions; no surface activation this session; no auth/encryption/safety perimeter; no production deploy effect (modules created but not wired into any route). Critical Change Protocol NOT engaged. AC7 NOT engaged. PR6 NOT engaged.

## Why this session matters

Sub-session C (Option B) populated the embeddings and re-introduced the ivfflat index — the substrate is now queryable in principle. But there's no code yet that *uses* the queryability. D6 (retrieval interface) is the function the engine will call to fetch passages; D7 (re-ranker) is the deterministic re-scoring step that takes D6's top-20 and produces the top 3-5 for the eventual prompt. After this session, both modules exist as Verified TypeScript implementations that any later sub-session can wire into a route. The substrate becomes operationally meaningful.

## Pre-conditions

1. Founder pushed Sub-session C (Option B)'s six artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Production Supabase `supabase-us`: 186 `corpus_passages` rows with embeddings populated; 6 of 6 D5 indexes Live (verifiable via the SQL queries in `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04` §"Verification step").
3. `OPENAI_API_KEY` Live in `website/.env.local` + Vercel Production + Preview (from Sub-session C). The retrieval interface (D6) calls OpenAI at request time to embed queries for vector search; the env var is already in place.
4. Symlinks at `/node_modules/@supabase` + `/node_modules/openai` still in place (load-bearing for any test harness run from project root). If founder cleaned via Finder between sessions, recovery is `cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && ln -s ../website/node_modules/@supabase node_modules/@supabase && ln -s ../website/node_modules/openai node_modules/openai`.
5. Founder availability for a ~2.5-4 hour bounded block. The session can split at the D6/D7 boundary if needed (D6 implementation + verification is the natural early-stop point).

## Part A — Open under the protocol (cache-driven)

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-04-embeddings-and-ivfflat-close.md` (~5 min — predecessor close).
3. `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6 — the retrieval interface spec; **read in full** — this is the deliverable of the day for Steps 1+2).
4. `/adopted/rag-mentor-alt3/re-rank-design.md` (D7 — the re-rank design spec; **read in full** — this is the deliverable of the day for Steps 3+4).
5. `/operations/decision-log.md` last 2 entries (`D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04` + `D-CORPUS-PASSAGES-POPULATION-2026-05-03`).
6. `/adopted/rag-mentor-alt3/index-schema.md` (D5 — re-read §"The corpus_passages table — schema" as the type contract for D6's output rows; full re-read not required).

Confirm at open per cache:
- **Tier:** code-standard. Standard risk.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** OpenAI `text-embedding-3-small` for query-time embedding (per D5 + D6 §"Step 4 — Embed the query"). Heuristic re-rank is deterministic — no LLM in the re-rank path per D7 §"The recommendation". No Anthropic LLM calls this session unless implementation surfaces a need (in which case cite the cache PR4 row at the time).
- **Status vocabulary:** end-of-session targets — D6 retrieval interface implementation → **Verified** (implemented + tested with synthetic queries; not yet wired into any route — wiring is a later Phase-2 sub-session); D7 re-ranker implementation → **Verified** (heuristic policy implemented + tested).
- **Signals + risk class:** Standard at session open. Reclassify if any step touches authentication, deployment surface activation, or any safety-critical perimeter (none anticipated — D6 + D7 are pure read-side modules with no side effects on user data).
- **KGs engaged:** KG1 rule 2 (await all DB reads — D6 honours via standard Supabase JS client async patterns); KG1 rule 4 (Vercel terminates execution after response — engages with D6's per-request cache lifetime per D6 §"Cache strategy — per-request only"); KG6 (composition order — informs how D6's output flows to consumers; not directly engaged this session because D6/D7 are not yet wired into a route, but the implementation should preserve the option per D6 §"R7 / R8a / KG6 compliance"); KG7 N/A (this session writes no JSONB; reads `slot_fields` JSONB but pgvector + the Supabase JS client return JSONB columns as parsed JS objects).

## Part B — Procedure

### Step 1 — Decide implementation paths

Two natural path candidates:
- **Path A:** new directory `/website/src/lib/rag/` with `retrieve-passages.ts` + `rerank.ts` + `index.ts` (re-export). Cleanly groups the RAG feature.
- **Path B:** flat at `/website/src/lib/` — `retrieval.ts` + `rerank.ts`. Matches the existing flat structure of `sage-reason-engine.ts` and similar.

The AI proposes one path with reasoning; the founder confirms (or overrides) before code is written. The chosen paths are recorded in the decision-log entry at Step 7. Type definitions (`RetrieveInput`, `RetrieveResult`, `RetrievedPassage`, `ReRankPolicy`, etc., per D6 §"The retrieve function — signature" + D7 §"Re-rank function signature") may live alongside the implementation files or in a separate `types.ts` — the AI proposes one approach.

### Step 2 — Implement D6 retrieval interface

Implement the `retrievePassages` function per D6's full spec. Honour:
- D6 §"The retrieve function — signature" — type contracts exactly as named.
- D6 §"The internal pipeline" — Steps 1–9 (cache lookup → filter clause build → BM25 query → query embed → vector query → RRF fusion → hydrate rows → build result → cache write).
- D6 §"Error modes returned by retrievePassages" — three named error modes plus catastrophic fallback.
- D6 §"Cache strategy — per-request only" — `Map<string, RetrieveResult>` per request scope; cache key per the deterministic JSON.stringify pattern in §"The cache implementation".
- KG1 rule 2 — every Supabase call is awaited.
- R7 source fidelity — `source_citation` preserved in every returned row.
- R8a — controlled vocabulary IDs preserved.

Connection to Supabase: use the existing `supabaseAdmin` from `/website/src/lib/supabase-server.ts` (service role; bypasses RLS — appropriate for server-side reads).

OpenAI client: import from the `openai` npm package (added in Sub-session C). Read `OPENAI_API_KEY` from `process.env`. Throw `EmbeddingFailureError` (named class) if the call fails per D6 §"Error modes" row 3.

### Step 3 — Implement D7 re-ranker (heuristic policy)

Implement the `reRank` function per D7's full spec. Phase-1 default is heuristic per D7 §"The recommendation — heuristic default with per-mechanism upgrade path". Honour:
- D7 §"Re-rank function signature" — type contracts exactly as named.
- D7 §"Heuristic re-rank scoring formula" — multiplicative-boost compounding.
- D7 §"Worked example — Rule 5 Pass-1" — implementation should reproduce this example's expected ordering as a unit test (see Step 4 below).
- The `'cross_encoder'` and `'llm'` policy values in `ReRankPolicy` are accepted as type values but their handlers throw `NotImplementedError` (per Phase-1 default; named class). Phase-2 production observation may activate them per D7 §"Per-mechanism re-rank policy".
- AC-12 narrowness preserved — heuristic is deterministic, no LLM in this code path.

### Step 4 — Verify retrieval + re-rank end-to-end (founder-performable test harness)

The AI writes a small Node test harness at `/operations/migrations/2026-05-XX-retrieval-rerank-test.mjs` (or similar) that:
1. Loads creds from `website/.env.local`.
2. Imports the just-implemented retrieve + reRank functions (note: `.ts` files cannot be imported directly by Node without compilation; the AI either compiles via `npx tsc` against a temporary tsconfig or rewrites the test as a TypeScript file run via `tsx` — the AI proposes the simplest viable approach).
3. Runs 3–5 test queries with expected top-3 `passage_id` values. Examples (the AI may refine):
   - Query: `"philodoxia false judgement reputation"` with filters `mechanism_filter: ['passion_false_judgement'], passion_filter: 'epithumia', sub_passion_filter: 'philodoxia', passage_type_filter: ['mechanism']`. Expected top result includes a passage whose `passage_id` references the philodoxia false-judgement template.
   - Query: `"dichotomy of control"` with filters `mechanism_filter: ['prohairesis_filter']`. Expected top result references the up_to_us list from `stoic-brain.json`.
   - Query: `"oikeiosis circle 3"` with filters `mechanism_filter: ['oikeiosis_stage']`. Expected top result references the oikeiosis stage definitions.
   - Query: `"TEMPORAL_AMBIGUITY focus question"` with filter `passage_type_filter: ['focus_question_stem'], trigger_condition_filter: 'TEMPORAL_AMBIGUITY', intake_tier_filter: 1`. Expected top result is the canonical Tier 1 stem.
4. Prints retrieval diagnostics (BM25 count, vector count, RRF score, latencies) for each query. Founder reads the output and confirms the expected passages are at the top.
5. Reports total OpenAI cost (each query embeds ~50–150 tokens; total cost across 5 queries should be well under $0.001).

The AI may use `tsx` (a Node TypeScript runner — needs `npm install -g tsx` or similar; founder runs the install command if not already installed) or use `npx tsc --target esnext --module nodenext` to compile to .mjs first. Both paths are Standard risk.

### Step 5 — (Optional) Latency observation

If time permits, the AI extends the test harness to log per-query elapsed_ms for warm-path + cold-path. D6 names targets: <200ms warm / <500ms cold. Observation against real production data informs whether the targets are realistic for the current corpus (186 rows). If targets are missed, log as a Phase-2 production observation candidate per D6 §"Open questions" item 1; do not retune at this session.

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested entry name: `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-XX`. ~30 lines. Records: implementation paths chosen; the type-export approach; D6 + D7 reaching Verified; test queries + observed top results + observed latencies; OpenAI cost observed for the test pass.

### Step 7 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory: substrate piece 5 of 7 (D6 retrieval interface + D7 re-ranker) reaches Verified.

### Step 8 — Next-session prompt (Sub-session D)

Write `/operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md` for the next sub-session in the Phase-2 pass-1 sequence. Per D-CORPUS-PASSAGES-SCHEMA-2026-05-03, the sequence is C → D → E1–E4 → F → G → H. Sub-session D's exact scope per the live readiness inventory at session close (likely the wiring of D6/D7 into the first consumer route, which would be PR1's "single-endpoint proof" of the new retrieval pattern — confirm against the Phase-2 build plan at session open).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + D6 + D7 reads | 25–35 min |
| Step 1 path decision | 5–10 min |
| Step 2 D6 implementation | 60–90 min |
| Step 3 D7 implementation | 30–45 min |
| Step 4 verification test harness + run | 30–45 min |
| Step 5 latency observation (optional) | 15–20 min |
| Steps 6–8 (decision-log + close + Sub-session D prompt) | 30–40 min |
| **Total** | **~3–5 hours** |

If the session is too long for one sitting, Step 2/3 (D6 finished + D7 starting) is the natural split point — D6 alone with its own verification can finish a shorter session leaving D7 for a Sub-session C-bis-2.

## Rollback path

- D6/D7 implementation breaks something downstream: `git revert` of the implementation commits. No production data affected (the modules are read-side; no writes outside their own caches).
- Test harness fails or surfaces wrong rankings: that's a finding, not a break — log as an open question in the decision-log entry; D6/D7 status downgrades from Verified to Wired if the test reveals a structural issue. The founder calls whether to fix-forward this session or defer to a sub-session.
- Symlink failure surfaces at script run: recover via the recreate command in pre-condition 4.
- OpenAI API failure during test: D6's `EmbeddingFailureError` should be caught; the test harness should report the error and continue with BM25-only fallback per D6 §"Error modes" row 3.

## Forecast

**On clean completion:** D6 retrieval interface + D7 heuristic re-ranker implemented as TypeScript modules; tested against 3–5 synthetic queries with expected top-3 results confirmed; latency observations logged; decision-log entry + lean session close + Sub-session D prompt produced. Phase-2 pass-1 substrate piece 5 of 7 (D6 + D7 implementation) reaches Verified. The retrieval substrate is now operationally meaningful — any later sub-session can wire `retrievePassages → reRank` into the engine's rule logic.

**Next-next session:** Sub-session D — substrate piece 6 of 7 (likely the wiring of D6/D7 into the first consumer route per PR1's single-endpoint proof discipline; exact scope per Sub-session C-bis's session close readiness inventory).

End of prompt.
