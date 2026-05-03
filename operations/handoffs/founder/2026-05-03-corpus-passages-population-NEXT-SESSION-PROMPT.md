# Next-Session Prompt — Sub-session B (resumption): corpus + D-A16 catalogue population

**Stream:** founder.
**Tier:** schema + code-standard.
**Governing frame:** `/adopted/standing-protocol-cache.md` (operative session-opening reference).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-03-corpus-passages-schema-close.md`.
**Predecessor decision-log entries:** `D-CORPUS-PASSAGES-SCHEMA-2026-05-03`; `D-PHASE-2-PASS-1-REPLAN-EFFICIENCY-REFINEMENT-2026-05-03`; `D-PHASE-2-PASS-1-SCOPE-BLOCK-AND-REPLAN-2026-05-03`.
**Risk classification:** **Standard** under 0d-ii. Idempotent script-based row inserts (Path 1) OR new dev endpoint that triggers same script logic (Path 2). Critical Change Protocol NOT engaged. AC7 NOT engaged. PR6 NOT engaged.

## Why this session matters

Sub-session A (predecessor) landed the `corpus_passages` schema as Live but left the population paused at script-ready state because the founder's Mac shell does not have `node` on PATH and the founder does not want to use Terminal. This session resumes the population. Two paths the founder selects between at session open via AskUserQuestion. Both produce the same end state: ~159 corpus rows + 27 D-A16 stems = ~186 corpus_passages rows, all with `embedding = NULL` (Sub-session C absorbs the embedding generation pass).

## Pre-conditions

1. Founder pushed the predecessor session's five artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder selects Node-or-endpoint path at session open (see Part B Step 1 below).
3. Founder has Supabase SQL Editor access (`sagereasoning-us`).

## Part A — Open under the protocol (cache-driven)

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `/operations/handoffs/founder/2026-05-03-corpus-passages-schema-close.md` (~5 min — predecessor close).
3. `/operations/migrations/2026-05-03-corpus-passages-population.mjs` (the existing script — read in full so it is fresh; ~768 lines).
4. `/operations/decision-log.md` last 1 entry (D-CORPUS-PASSAGES-SCHEMA-2026-05-03 — covers the schema apply + the embedding deferral + Path B for ritual stems).
5. `/adopted/rag-mentor-alt3/d-a16-catalogue.md` Sections 1–6 only (the 27 stem entries; ~700 lines but skim-friendly per stem).

Confirm at open per cache:
- **Tier:** schema + code-standard. Standard risk for both → session is Standard.
- **Hold-point:** P0 0h still active.
- **Model selection:** N/A — no LLM calls (embedding generation deferred to Sub-session C; the population script is pure DB writes).
- **Status vocabulary:** at end of session, `corpus_passages` table → still Live (already there); ~186 rows populated → Live; population script → Verified; D-A16 stems script (new, this session) → Verified.
- **Signals + risk class:** ready.
- **KGs engaged:** KG1 rule 2 (DB writes); KG7 (JSONB writes — `canonical_mechanism` + `slot_fields`).

## Part B — Procedure

### Step 1 — Founder selects path (AskUserQuestion at open)

Two paths:
- **Path 1 — Local Node installed.** Founder confirms they installed Node 22.x via the official installer at nodejs.org since last session. ~5 minutes once installed. Agent verifies via `node --version` (founder runs this single command in Terminal — only Terminal touch needed). Then proceed to Step 2.
- **Path 2 — Vercel ad-hoc endpoint.** Founder selects this if they have not installed Node. Agent writes a one-time `GET /api/dev/populate-corpus` route in Next.js (auth-gated to founder's user_id; env-flag-gated by `ALLOW_CORPUS_POPULATION=true`); founder commits + pushes; Vercel deploys; founder adds the env var in Vercel dashboard; founder triggers via browser; endpoint returns JSON success; founder removes the env var; agent writes a follow-up commit deleting the endpoint file. ~30 min added scope.

If Path 2: classify the new route + env-flag activation as Standard with reasoning surfaced (dev-only; founder-auth-gated; idempotent; touches only `corpus_passages` table; no user-facing surface). Founder may reclassify upward to Critical at any time per 0d-ii.

### Step 2 — Run the corpus population script (Path 1 OR adapted for Path 2)

**Path 1 (local Node):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node operations/migrations/2026-05-03-corpus-passages-population.mjs
```
Expected output: `Loaded 8 corpus constants from stoic-brain-compiled.ts` → `Decomposed into 159 corpus passages.` → `Upserted 159 rows. Errors 0.` → `Final corpus_passages count: 159 rows.` → `DONE — corpus population complete.`

**Path 2 (Vercel endpoint):** founder visits `https://sagereasoning.com/api/dev/populate-corpus` in browser while authenticated. Endpoint returns JSON `{ status: 'ok', upserted: 159, errors: 0, finalCount: 159 }`.

Either path leaves `corpus_passages` with 159 corpus rows + 0 D-A16 stems = 159 total. The script is idempotent; re-runs are safe.

### Step 3 — Produce + run D-A16 catalogue stems script

Agent writes `/operations/migrations/2026-05-03-d-a16-catalogue-population.mjs` (Path 1) or extends the Vercel endpoint (Path 2). Reads the 27 stems from `/adopted/rag-mentor-alt3/d-a16-catalogue.md` (parsing the structured entries). Inserts each as `passage_type: 'focus_question_stem'`, `source_file: 'focus-questions'`, with the catalogue's specified `canonical_mechanism`, `passion`, `sub_passion`, `audience_tier`, `trigger_condition`, `intake_tier`, `slot_fields`, `text` (stem text minus the markdown italics + quote marks), and `paragraph_text` (the entry's worked-example or notes block where present). Honours KG7 (slot_fields as plain JS array of objects). Honours Path B for ritual stems (synthetic `intake_tier: 1` per the D-A16 catalogue's documentation default).

Founder runs the script (Path 1) OR triggers the endpoint a second time (Path 2). Expected: 27 additional rows. Final `corpus_passages` count: **186 rows**.

### Step 4 — Verify population (4 spot-check queries)

```sql
-- P1: Total row count
SELECT count(*) FROM corpus_passages;
-- Expected: 186 rows (159 corpus + 27 D-A16 stems)

-- P2: Source distribution
SELECT source_file, count(*) FROM corpus_passages GROUP BY source_file ORDER BY source_file;
-- Expected: 9 source_file values:
--   action       (~12)
--   focus-questions (27)
--   passions     (~32)
--   progress     (~26)
--   psychology   (~14)
--   scoring      (~9)
--   stoic-brain  (~17)
--   value        (~28)
--   virtue       (~21)

-- P3: D-A16 stems present + KG7 shape correct
SELECT count(*), jsonb_typeof(slot_fields)
  FROM corpus_passages
  WHERE passage_type = 'focus_question_stem'
  GROUP BY jsonb_typeof(slot_fields);
-- Expected: rows where jsonb_typeof = 'array' (NOT 'string' — that would mean KG7 violation)
-- Some stems have slot_fields = NULL (e.g., T1E-002, T1E-003) which is fine; jsonb_typeof returns NULL for those.

-- P4: Pass-1 critical stems present
SELECT trigger_condition, count(*) FROM corpus_passages
  WHERE trigger_condition IN ('EUPATHEIA_BOUNDARY', 'PRAXIS_MOTIVATION_AMBIGUITY')
  GROUP BY trigger_condition;
-- Expected: 2 rows, each count = 1

-- P5: All embedding values NULL (deferred to Sub-session C)
SELECT count(*) FROM corpus_passages WHERE embedding IS NOT NULL;
-- Expected: 0 rows
```

All 5 must pass. P3 specifically validates KG7. P5 confirms the embedding deferral is honoured.

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry name: `D-CORPUS-PASSAGES-POPULATION-2026-05-XX` (XX = next-session date). Records: which path was selected; population executed; verification confirmed. ~25 lines.

### Step 6 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory: corpus_passages substrate (rows + D-A16 stems) reaches Verified. ~50 lines.

### Step 7 — Next-session prompt (Sub-session C)

Write `/operations/handoffs/founder/2026-05-XX-retrieval-and-rerank-NEXT-SESSION-PROMPT.md` for Sub-session C (D6 retrieval interface + D7 re-ranker + OpenAI key setup + embedding generation pass + ivfflat index re-introduction). ~100 lines per cache lean prompt template.

## Part C — Anticipated session shape

| Phase | Estimate (Path 1) | Estimate (Path 2) |
|---|---|---|
| Cache + predecessor close + script + d-a16 reads | 15–20 min | 15–20 min |
| Step 1 path selection | 5 min | 5 min |
| Step 2 corpus population (script) | 5 min | 30 min (build endpoint + deploy + trigger) |
| Step 3 D-A16 stems script + run | 25 min | 15 min (extend endpoint + trigger) |
| Step 4 verification | 10 min | 10 min |
| Steps 5–7 (decision-log + close + Sub-session C prompt) | 30 min | 30 min |
| **Total** | **~90 min** | **~110 min** |

If Path 2 is selected and the endpoint deletion follow-up commit is also produced this session, add ~5 min.

## Rollback path

If population introduces wrong data: schema is unchanged; re-run with `TRUNCATE corpus_passages;` in Supabase SQL Editor first, then re-populate.

If Path 2 endpoint causes issues post-run: delete `/website/src/app/api/dev/populate-corpus/route.ts`, remove `ALLOW_CORPUS_POPULATION` env var in Vercel, push.

Reversible at any time pre-Sub-session-C.

## Forecast

**On clean completion:** `corpus_passages` is populated with 186 rows (159 corpus + 27 D-A16 stems); embedding column NULL across all rows (deferred); KG7 validated; decision-log entry + lean session close + Sub-session C prompt produced. Phase-2 pass-1 substrate piece 2 of 7 (corpus + D-A16 population) reaches Verified.

**Next-next session:** Sub-session C — retrieval interface (D6) + re-ranker (D7) + OpenAI key setup + embedding generation pass + ivfflat index re-introduction. Pre-condition: this session reaches Verified.

End of prompt.
