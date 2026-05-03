# Next-Session Prompt — Sub-session C: D6 retrieval + D7 re-ranker + OpenAI key + embeddings + ivfflat index

**Stream:** founder.
**Tier:** code-standard + schema (mixed; highest-risk step is Standard).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-03-corpus-passages-population-close.md`.
**Predecessor decision-log entries:** `D-CORPUS-PASSAGES-POPULATION-2026-05-03`; `D-CORPUS-PASSAGES-SCHEMA-2026-05-03`.
**Risk classification:** **Standard** under 0d-ii. All four steps are Standard: D6/D7 are new module/route stubs; OpenAI env-var add is a single env var (not a surface activation); embedding generation is an idempotent batched upsert against an existing column; ivfflat index re-introduction is a single CREATE INDEX statement (idempotent via IF NOT EXISTS). Critical Change Protocol NOT engaged. AC7 NOT engaged. PR6 NOT engaged.

## Why this session matters

Sub-session B (predecessor) populated the `corpus_passages` table with 186 rows but left the `embedding` column NULL across all of them — the alt-3 retrieval substrate is shaped but cannot be queried by similarity until embeddings exist. This session generates the embeddings (one-shot OpenAI call per row), re-introduces the ivfflat index that was deliberately deferred from the schema migration, and stands up the D6 retrieval interface + D7 re-ranker so the substrate becomes queryable. After this session, the alt-3 retrieval substrate is end-to-end functional and Phase-2 pass-1 can advance to the next sub-session in the sequence.

## Pre-conditions

1. Founder pushed the predecessor session's four artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder has an OpenAI account (free to create at platform.openai.com) and is willing to generate an API key. Cost expectation for this session: well under $0.10 (186 rows × ~200 tokens average × $0.02 per 1M tokens for text-embedding-3-small = approximately $0.001 total). Cost is logged via R5.
3. Founder has Vercel dashboard access (to add the new `OPENAI_API_KEY` env var).
4. Founder has Supabase SQL Editor access (`supabase-us`) for the ivfflat CREATE INDEX statement and the post-session verification queries.
5. Symlink at `/node_modules/@supabase` is still in place (any migration script run from project root needs it). If founder cleaned it via Finder between sessions, the embedding generation script will fail at import; recovery is `cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npm install @supabase/supabase-js openai` (Standard risk; modifies website's package.json which already includes @supabase). Alternative recovery is to recreate the symlink.

## Part A — Open under the protocol (cache-driven)

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-03-corpus-passages-population-close.md` (~5 min — predecessor close).
3. `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6 — the retrieval interface spec; read in full).
4. `/adopted/rag-mentor-alt3/reranker.md` (D7 — the re-ranker spec; read in full).
5. `/operations/decision-log.md` last 2 entries (`D-CORPUS-PASSAGES-POPULATION-2026-05-03` + `D-CORPUS-PASSAGES-SCHEMA-2026-05-03`).
6. `/adopted/rag-mentor-alt3/index-schema.md` (D5) §"ivfflat embedding index" — confirm the index parameters (USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)).

Confirm at open per cache:
- **Tier:** code-standard + schema. All Standard → session is Standard.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** OpenAI text-embedding-3-small for embeddings (per D5); no Anthropic LLM calls this session unless D6/D7 implementation surfaces a need (in which case cite the cache PR4 row at the time).
- **Status vocabulary:** end-of-session targets — D6 retrieval interface → Live (or Verified if not yet wired into a route); D7 re-ranker → Live (or Verified); embeddings → all 186 populated → Live; ivfflat embedding index → Live.
- **Signals + risk class:** Standard at session open; reclassify if any step touches authentication, deployment surface activation, or any safety-critical perimeter (none anticipated).
- **KGs engaged:** KG1 rule 2 (await all DB writes — embedding generation script honours); KG7 N/A this session (embedding column is `vector` type, not JSONB).

## Part B — Procedure

### Step 1 — Founder generates OpenAI API key + adds to env

Sub-step 1a (one-time only — skip if you already have a key in your password manager):
1. Browser → `https://platform.openai.com/api-keys`
2. Sign in (or sign up if new account; free to create)
3. Click **"+ Create new secret key"** (top right)
4. Name: `sagereasoning-embeddings` (or your choice)
5. Click **Create secret key** → copy the key shown (starts with `sk-proj-...`). **You will not see this key again** — save it to your password manager immediately.

Sub-step 1b — add to your Mac's local env file (so the embedding generation script can use it):
1. Finder → navigate to `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/`
2. Right-click `.env.local` → Open With → TextEdit
3. Add a new line at the bottom: `OPENAI_API_KEY=sk-proj-...your-key-here...`
4. Cmd+S to save → close TextEdit

Sub-step 1c — add to Vercel env (so future routes that need it can use it):
1. `https://vercel.com/dashboard` → click sagereasoning project
2. **Settings** (top tab) → **Environment Variables** (left sidebar)
3. Click **Add New**
4. Name: `OPENAI_API_KEY` → Value: paste your key → Environment: select all three (Production, Preview, Development) → click **Save**
5. (No redeploy needed yet — Vercel uses the new value on the next deploy.)

### Step 2 — Agent writes embedding generation script

Agent writes `/operations/migrations/2026-05-XX-corpus-passages-embeddings.mjs`. Reads each `corpus_passages` row where `embedding IS NULL`; calls OpenAI text-embedding-3-small via the `openai` npm package; writes the 1536-dimension vector back to the `embedding` column. Idempotent (re-runs skip rows where embedding is already populated). Batches 100 rows per OpenAI request (the API supports batch input arrays — cheaper + faster than per-row calls).

The script needs the `openai` npm package. Sub-step 2a check: is it installed? If not, `cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npm install openai` (founder runs in Terminal; ~30 sec; modifies website's package-lock.json — Standard risk, additive dependency).

Founder runs the embedding generation script in Terminal:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node operations/migrations/2026-05-XX-corpus-passages-embeddings.mjs
```

Expected output: `Found 186 rows with NULL embedding. Generating in batches of 100…` → `Batch 1: 100 embeddings generated, written.` → `Batch 2: 86 embeddings generated, written.` → `DONE — all 186 embeddings populated.` Cost reported at end (well under $0.01).

### Step 3 — Re-introduce ivfflat embedding index (Supabase SQL Editor)

Per D5, the ivfflat index parameters: `USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`.

Founder runs in Supabase SQL Editor → New query → paste → Run:
```sql
CREATE INDEX IF NOT EXISTS idx_corpus_passages_embedding
  ON corpus_passages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Expected: `Success. No rows returned.` (~5–15 seconds for 186 rows.)

Verify with:
```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'corpus_passages' AND indexname LIKE 'idx_%'
ORDER BY indexname;
```
Expected: 6 rows (the 5 from D5 schema migration + the new `idx_corpus_passages_embedding`).

### Step 4 — Implement D6 retrieval interface

Agent implements the retrieval interface per D6 spec. The exact module path + signature comes from D6 (read in full at Part A). The implementation honours KG1 rule 2 (await all DB calls), KG7 N/A this session, R8a (strict glossary), and the D5-mandated hybrid retrieval shape (BM25 + vector + filter).

### Step 5 — Implement D7 re-ranker

Agent implements the re-ranker per D7 spec. The implementation reads from D6's output and applies the re-ranking logic D7 names. Tested against a small set of synthetic queries before declaring Verified.

### Step 6 — Verify retrieval end-to-end (founder-performable)

Agent provides 3–5 test queries (natural-language inputs the founder pastes into a script or test endpoint) and the expected top retrieved passage_ids. Founder runs and confirms.

### Step 7 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry name: `D-RETRIEVAL-RERANK-EMBEDDINGS-IVFFLAT-2026-05-XX`. ~30 lines. Records: OpenAI key added; embeddings populated (186 rows); ivfflat index Live; D6 + D7 implementation status; cost observed.

### Step 8 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory: substrate pieces 3 + 4 + 5 of 7 (embeddings + ivfflat + retrieval+rerank) reach Verified or Live.

### Step 9 — Next-session prompt (Sub-session D)

Write `/operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md` for the next sub-session in the Phase-2 pass-1 sequence (substrate piece 5 → 6 transition; exact scope per the live readiness inventory at session close).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + D6 + D7 reads | 25–35 min |
| Step 1 OpenAI key setup | 10 min |
| Step 2 embedding generation script + run | 30–45 min |
| Step 3 ivfflat index | 5 min |
| Step 4 D6 implementation | 45–75 min |
| Step 5 D7 implementation | 45–75 min |
| Step 6 retrieval verification | 20–30 min |
| Steps 7–9 (decision-log + close + Sub-session D prompt) | 30–40 min |
| **Total** | **~3.5–5 hours** |

If the session is too long for one sitting, Step 4/5 (D6 + D7 implementation) is the natural split point — Steps 1–3 can finish a shorter session leaving D6/D7 for a Sub-session C-bis.

## Rollback path

- If embeddings populated incorrectly: `UPDATE corpus_passages SET embedding = NULL;` returns to pre-step-2 state. Re-run script.
- If ivfflat index causes issues: `DROP INDEX IF EXISTS idx_corpus_passages_embedding;` reverts the schema. Embeddings stay; can recreate index with different `lists` parameter.
- If D6/D7 implementation breaks anything: code-only rollback via `git revert` (no production data affected; the implementations are read-side modules, no writes outside `corpus_passages`).
- OpenAI key compromise (unlikely): rotate via OpenAI dashboard, re-add to Vercel env + `.env.local`. The key only authorizes embedding generation, no other endpoints — blast radius minimal.

## Forecast

**On clean completion:** OpenAI API key Live across local + Vercel envs; 186 corpus_passages rows have populated embeddings (1536 dimensions each); ivfflat embedding index re-introduced and Live; D6 retrieval interface + D7 re-ranker implemented and Verified against test queries; decision-log entry + lean session close + Sub-session D prompt produced. Phase-2 pass-1 substrate pieces 3 + 4 + 5 of 7 (embeddings + ivfflat index + retrieval+rerank) reach Verified or Live. Alt-3 retrieval substrate is end-to-end functional.

**Next-next session:** Sub-session D — substrate piece 6 of 7 (the next D-deliverable in the sequence; exact scope per Sub-session C's session close readiness inventory).

End of prompt.
