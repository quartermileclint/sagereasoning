# Next-Session Prompt — Sub-session A+B (combined): `corpus_passages` schema + index population + D-A16 catalogue insertion

**Stream:** founder.
**Tier:** schema + code-standard.
**Governing frame:** `/adopted/standing-protocol-cache.md` (operative session-opening reference per `D-PHASE-2-PASS-1-REPLAN-EFFICIENCY-REFINEMENT-2026-05-03`). Full governance documents (`/manifest.md`, `/adopted/session-opening-protocol.md`, `/operations/knowledge-gaps.md`) are reference; the cache pre-resolves the standing answers.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-03-phase-2-pass-1-scope-block-and-replan-close.md`.
**Predecessor decision-log entries:** `D-PHASE-2-PASS-1-REPLAN-EFFICIENCY-REFINEMENT-2026-05-03`; `D-PHASE-2-PASS-1-SCOPE-BLOCK-AND-REPLAN-2026-05-03`; `D-ENCRYPTION-WIRING-IMPLEMENTED-2026-05-03`; `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`.
**Risk classification:** **Standard** under 0d-ii. Idempotent schema migration + script-based row inserts. Critical Change Protocol NOT engaged. AC7 NOT engaged. PR6 NOT engaged.

---

## Why this session matters

This is the first piece of the Phase-2 pass-1 actual build. `corpus_passages` is the foundation of the alt-3 retrieval layer — every subsequent sub-session (C onwards) depends on it. Combining A+B captures schema + initial population in a single bounded session because the population is structurally meaningless without the schema, and the schema is structurally idle without the population. Founder verifies via 4 SQL queries (schema shape — same pattern as predecessor encryption-wiring) plus row-count + spot-checks on the inserted corpus.

## Pre-conditions

1. Founder pushed this session's predecessor commit (cache + two decision-log entries + amended close + this prompt) via GitHub Desktop. Working tree clean at session open.
2. Vercel green confirmation post-push (paperwork-only commit; rebuild ~1 min).
3. Founder has Supabase SQL Editor access (`sagereasoning-us`).
4. Founder has Anthropic / OpenAI API key set in Vercel (the index-population script will use OpenAI `text-embedding-3-small` to embed corpus passages — confirm the env var name with the agent at session open if uncertain).

## Part A — Open under the protocol (cache-driven)

Read in this order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min). This pre-resolves Part A elements 2–8 for `schema` + `code-standard` work-categories.
2. **Predecessor session close** at `/operations/handoffs/founder/2026-05-03-phase-2-pass-1-scope-block-and-replan-close.md` (~5 min). Authoritative for the day's opening scope.
3. **Deliverable-of-the-day:** `/adopted/rag-mentor-alt3/index-schema.md` (D5) — **read in full**. This is the canonical schema spec the session applies. Particularly §"The `corpus_passages` table — schema" + §"Migration shape" + §"Embedding model selection" + §"Row-level security".
4. **D-A16 catalogue** at `/adopted/rag-mentor-alt3/d-a16-catalogue.md` (~10 min — skim header + the 20 stems). The Sub-session B half of this session inserts these 20 stems into `corpus_passages`.
5. **Decision-log last 3 entries:** D-PHASE-2-PASS-1-REPLAN-EFFICIENCY-REFINEMENT + D-PHASE-2-PASS-1-SCOPE-BLOCK-AND-REPLAN + D-ENCRYPTION-WIRING-IMPLEMENTED. Skim only.

Confirm at open per cache §"How to use this cache at session open":
- **Tier:** schema + code-standard (combined). Risk default Standard for both → session is Standard.
- **Hold-point:** P0 0h still active.
- **Model selection:** N/A for the schema migration; OpenAI `text-embedding-3-small` for index population (per D5 §"Embedding model selection" — not Anthropic).
- **Status vocabulary:** at end of session, `corpus_passages` table → Live; D-A16 stems → Live in `corpus_passages`.
- **Signals + risk class:** ready. No Critical Change Protocol surfacing this session.

## Part B — Procedure

### Step 1 — Pre-checks

Founder runs in Supabase SQL Editor, reports back results:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';        -- expect 0 or 1 row
SELECT table_name FROM information_schema.tables                  -- expect 0 rows
  WHERE table_name = 'corpus_passages';
```

If `corpus_passages` already exists, pause and investigate. Otherwise proceed.

### Step 2 — Produce schema migration SQL artefact

Agent writes `/operations/migrations/2026-05-03-corpus-passages-schema.sql` — verbatim from D5 §"The `corpus_passages` table — schema" with idempotent guards (`CREATE EXTENSION IF NOT EXISTS vector;` `CREATE TABLE IF NOT EXISTS …` `DROP POLICY IF EXISTS …` `CREATE POLICY …` `CREATE OR REPLACE FUNCTION …` `DROP TRIGGER IF EXISTS … CREATE TRIGGER …`). Header + footer per the predecessor pattern at `/operations/migrations/2026-05-03-encryption-wiring-schema.sql`.

Agent surfaces SQL in chat for founder review before apply. Founder confirms via in-chat affirmative.

### Step 3 — Founder applies schema

Supabase Dashboard → `sagereasoning-us` → SQL Editor → New query → paste full SQL → Run. Expected: `Success. No rows returned.`

### Step 4 — Verify schema (4 SQL queries)

```sql
-- V1: Confirm table + extension
SELECT table_name FROM information_schema.tables WHERE table_name = 'corpus_passages';
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- V2: Confirm 6 user-defined indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'corpus_passages' AND indexname LIKE 'idx_%';

-- V3: Confirm RLS enabled + read policy present
SELECT polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'corpus_passages';
SELECT relrowsecurity FROM pg_class WHERE relname = 'corpus_passages';

-- V4: Spot-check empty
SELECT count(*) FROM corpus_passages;  -- expect 0
```

Expected: V1 returns 1 + 1 row; V2 returns 6 rows; V3 returns 1 policy row + `relrowsecurity = true`; V4 returns 0.

### Step 5 — Produce index-population script

Agent writes `/operations/migrations/2026-05-03-corpus-passages-population.ts` (or equivalent path discussed at session) — Node-runnable script per D5 §"Migration shape". Reads `stoic-brain.ts` constants → decomposes per D5 (sentence-level chunks; paragraph-context preservation) → embeds via OpenAI `text-embedding-3-small` (1536 dims) → inserts into `corpus_passages` with full provenance per D5 schema. Confirms KG7 by passing `canonical_mechanism` JSONB and `slot_fields` JSONB as plain arrays/objects (not `JSON.stringify`-ed).

Founder reviews the script structure (not line-by-line — agent confirms key invariants in chat: provenance preserved; KG7 honoured; idempotent inserts via `passage_id` UNIQUE; embedding cost estimate per D20).

### Step 6 — Founder runs the index-population script

Two run options:
- **Local Node** (founder's machine): `cd website && node ../operations/migrations/2026-05-03-corpus-passages-population.ts` after setting `OPENAI_API_KEY` and Supabase service-role env vars locally.
- **Vercel ad-hoc endpoint** (one-off run via authenticated POST): out-of-scope for this session unless the local Node path is unavailable.

Recommendation: local Node. Cost per D20: ~$0.001 for the full corpus population.

If founder lacks local Node setup, agent surfaces the gap at Step 5 and proposes a one-off Vercel endpoint pattern as Step-6-alternate (Standard risk; idempotent; deletable post-population).

### Step 7 — Insert D-A16 catalogue stems

Agent writes `/operations/migrations/2026-05-03-d-a16-catalogue-population.ts` — reads `/adopted/rag-mentor-alt3/d-a16-catalogue.md`, parses the 20 stems, inserts into `corpus_passages` with `passage_type: 'focus_question_stem'` + `trigger_condition` + `intake_tier` + `slot_fields` per D13 + D-A16 source_citation per R7.

Founder runs (same pattern as Step 6).

### Step 8 — Verify population (4 spot-check queries)

```sql
-- P1: Total row count
SELECT count(*) FROM corpus_passages;
-- Expected: 200-500 corpus passages + 20 D-A16 stems = ~220-520 rows

-- P2: Source distribution
SELECT source_file, count(*) FROM corpus_passages GROUP BY source_file;
-- Expected: 8 stoic-brain source_file values + 'focus-questions' (20)

-- P3: D-A16 stems present + KG7 shape correct
SELECT count(*), jsonb_typeof(slot_fields)
  FROM corpus_passages
  WHERE passage_type = 'focus_question_stem'
  GROUP BY jsonb_typeof(slot_fields);
-- Expected: 20 rows total; jsonb_typeof = 'array' (NOT 'string' — that would mean KG7 violation)

-- P4: Pass-1 critical stems present
SELECT trigger_condition, count(*) FROM corpus_passages
  WHERE trigger_condition IN ('EUPATHEIA_BOUNDARY', 'PRAXIS_MOTIVATION_AMBIGUITY')
  GROUP BY trigger_condition;
-- Expected: 2 rows, each with count >= 1
```

All 4 must pass. P3 specifically validates KG7 (the JSONB shape lesson from prior incidents).

### Step 9 — Append decision-log entry (lean form)

Agent appends `D-CORPUS-PASSAGES-SCHEMA-AND-POPULATION-2026-05-03` (or appropriate date) to `/operations/decision-log.md` per cache §"Lean decision-log entry" template. ~25 lines.

### Step 10 — Session close (lean form)

Agent writes `/operations/handoffs/founder/2026-05-03-corpus-passages-schema-and-population-close.md` per cache §"Lean session close" template. ~50 lines.

### Step 11 — Next-session prompt for Sub-session C

Agent writes `/operations/handoffs/founder/2026-05-03-retrieval-and-rerank-NEXT-SESSION-PROMPT.md` for Sub-session C (retrieval interface D6 + re-ranker D7) per cache §"Lean next-session prompt" template. ~100 lines.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + D5 + D-A16 read | 25–35 min |
| Step 1 pre-checks | 5 min |
| Step 2 schema SQL artefact | 20 min |
| Step 3 founder apply | 2 min |
| Step 4 schema verification | 10 min |
| Step 5 population script | 30–45 min |
| Step 6 founder runs population | 10–15 min |
| Step 7 D-A16 stems script + run | 20–30 min |
| Step 8 population verification | 10 min |
| Steps 9–11 (lean decision-log + close + Sub-session C prompt) | 30–45 min |
| **Total** | **~3.0–3.5 hours** |

If any step takes materially longer than expected (especially Step 5 if D5's migration shape needs interpretation), the agent surfaces a scope-cap check and offers to pause the session at Step 4's schema-verified state and resume Sub-session B at next session.

## Rollback path

If schema causes downstream issues:

```sql
DROP TRIGGER IF EXISTS corpus_passages_tsvector_trigger ON corpus_passages;
DROP FUNCTION IF EXISTS corpus_passages_tsvector_update();
DROP TABLE IF EXISTS corpus_passages;
DROP EXTENSION IF EXISTS vector;  -- only if no other tables use it
```

If population introduces wrong data: schema is unchanged; re-run with `TRUNCATE corpus_passages;` first, then re-populate.

Reversible at any time pre-Sub-session-C.

## Forecast

**On clean completion:** `corpus_passages` is Live with ~220–520 rows; D-A16 stems present + KG7-validated; 4 schema queries + 4 population queries passed; decision-log entry + lean session close + Sub-session C prompt produced. Phase-2 pass-1's substrate has its first piece Verified.

**Next-next session:** Sub-session C — retrieval interface (D6) + re-ranker (D7). Pre-condition: this session reaches Verified.

End of prompt.
