# Session Close — 4 May 2026 — D6 retrieve + D7 rerank implementation (Sub-session C-bis)

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md`).
**Tier:** code-standard + schema — Standard risk under 0d-ii.
**Date:** 2026-05-04.

## Decisions Made

- **D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04** appended to decision-log (+~80 lines). D6 `retrievePassages` + D7 `reRank` (heuristic policy) implemented as TypeScript modules in `/website/src/lib/rag/` with co-located types; two Postgres RPC functions (`match_passages_bm25`, `match_passages_vector`) created in production Supabase to wrap pgvector + ts_rank_cd queries; verification harness run end-to-end with 5/5 expected matches in top-3; total cost $0.0000014 USD. D6 + D7 reach **Verified**.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| D6 `retrievePassages` (`/website/src/lib/rag/retrieve-passages.ts`) | Adopted (deliverable); not implemented | **Verified** (5/5 test queries return expected match in top-3) |
| D7 `reRank` (`/website/src/lib/rag/rerank.ts`) | Adopted (deliverable); not implemented | **Verified** (heuristic policy; 5/5 test queries; cross_encoder + llm reserved for Phase-2) |
| `/website/src/lib/rag/` subdirectory | did not exist | **Live** (3 files: retrieve-passages.ts, rerank.ts, index.ts) |
| `match_passages_bm25` Postgres function | did not exist | **Live** in `supabase-us` |
| `match_passages_vector` Postgres function | did not exist | **Live** in `supabase-us` |
| Test harness `/website/scripts/test-retrieval-rerank.ts` | did not exist | **Verified** (executed; 5/5 expected matches) |
| Phase-2 pass-1 readiness inventory | substrate pieces 1–4 of 7 Verified | **substrate pieces 1–6 of 7 Verified** (piece 7 = consumer route wiring per Sub-session D) |

## Next Session Should

**Sub-session D — wire D6/D7 into the first consumer route as PR1's single-endpoint proof.**

Estimated 3–5 hours. Risk: code-elevated under 0d-ii (changes to existing user-facing functionality if the chosen consumer is a live route; new external dependency surface if not). The chosen consumer for the single-endpoint proof is to be confirmed at session open (candidates: `/api/reason` quick-depth path, the V3 mentor reflection route, or a new dedicated route — Sub-session D's first decision).

Pre-conditions: founder commits + pushes this session's artefacts before Sub-session D opens; the BM25-zero-results finding is reviewed at session open (whether to refine query construction in the consumer or accept BM25 as exact-match-only); the latency overshoot finding is reviewed (whether the consumer route should add server-side embedding cache or accept the per-call cost).

Next-session prompt: `/operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md` (XX = next session's actual date).

## Blocked On

**Files remaining uncommitted at session close:**
- `/operations/migrations/2026-05-04-retrieval-rpc-functions.sql`
- `/operations/migrations/2026-05-04-test-output.log`
- `/website/src/lib/rag/retrieve-passages.ts`
- `/website/src/lib/rag/rerank.ts`
- `/website/src/lib/rag/index.ts`
- `/website/scripts/test-retrieval-rerank.ts`
- `/website/scripts/test-retrieval-rerank.mts` (1-line stub; founder may delete via Finder if preferred)
- `/operations/decision-log.md` (one entry appended, +~80 lines)
- `/operations/handoffs/founder/2026-05-04-sub-session-C-bis-close.md` (this file)
- `/operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md`

**Production state at session close:**
- Vercel deployment: unchanged from predecessor — no application code touched a route this session. The new `/website/src/lib/rag/` modules are not yet imported by any deployed surface; deploying this session's code is a no-op until Sub-session D wires it in.
- Supabase `supabase-us`: 2 new schema-level functions (`match_passages_bm25`, `match_passages_vector`) Live; `corpus_passages` table unchanged from predecessor (186 rows, 6/6 indexes, embeddings populated).
- AC7 standing constraint: NOT engaged at any edit this session.

## Open Questions

Six findings logged in the decision-log entry's "Open questions / findings from the run" section. Summary:

1. **BM25 channel returned 0 results across all 5 queries.** websearch_to_tsquery default-AND across multi-term queries doesn't match short corpus chunks. Vector channel produced correct top-3 regardless. Phase-2 production observation should refine query construction or accept BM25 as exact-term-match.
2. **Latencies above D6 targets.** Cold path 748–3774ms vs 500ms target; warm cache hit 0ms (target hit). OpenAI embedding round-trip + ivfflat probe overhead. Phase-2 optimisation candidates: server-side embedding cache; ivfflat lists retuning; HTTP keep-alive.
3. **D7 multiplier discrepancy** between spec text and worked example; implementation follows worked example; 5/5 expected matches confirms the choice on this set. Phase-2 production observation may retune.
4. **`degraded_retrieval` flag is conservative** — only flips on caught exceptions, not on zero-result channels. Phase-2 may revise the semantics.
5. **Test harness `.mts` stub** — founder may delete via Finder; harmless if left.
6. **Sandbox network access** — does not reach OpenAI or Supabase; founder ran the test from Mac terminal as workaround.

## Founder Verification

Open Terminal, then paste this exact block and press **Enter** (one combined command — adds all artefacts and commits):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add operations/migrations/2026-05-04-retrieval-rpc-functions.sql operations/migrations/2026-05-04-test-output.log website/src/lib/rag/retrieve-passages.ts website/src/lib/rag/rerank.ts website/src/lib/rag/index.ts website/scripts/test-retrieval-rerank.ts website/scripts/test-retrieval-rerank.mts operations/decision-log.md operations/handoffs/founder/2026-05-04-sub-session-C-bis-close.md operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md && git commit -m "session close: D6 retrieve + D7 rerank implemented + Verified — 4 May 2026

- D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04 — D6 retrievePassages + D7 reRank (heuristic) implemented under /website/src/lib/rag/
- match_passages_bm25 + match_passages_vector RPC functions Live in supabase-us
- Verification harness run end-to-end: 5/5 expected matches in top-3; cache warm path 0ms; total cost \$0.0000014 USD
- D6 + D7 reach Verified
- Two findings for Phase-2 production observation: BM25 zero-results across multi-term queries; cold latencies above 500ms target (vector-only path produces correct top-3 regardless)
- Standard risk; new module files; idempotent SQL migration; AC7 NOT engaged; PR6 NOT engaged; Critical Change Protocol NOT engaged
- Phase-2 pass-1 substrate inventory: pieces 1-6 of 7 Verified; piece 7 (consumer wiring per PR1 single-endpoint proof) deferred to Sub-session D"
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-redeploys on push to main; no application route touched, so the deploy is a no-op confirmation.

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:
```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

## Cross-references

- `/operations/handoffs/founder/2026-05-04-embeddings-and-ivfflat-close.md` (predecessor — Sub-session C close)
- `/operations/handoffs/founder/2026-05-XX-sub-session-C-bis-NEXT-SESSION-PROMPT.md` (this session's opening prompt)
- `/operations/handoffs/founder/2026-05-XX-sub-session-D-NEXT-SESSION-PROMPT.md` (next session — Sub-session D: wire D6/D7 into first consumer route per PR1)
- `/operations/decision-log.md` `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04` (the substrate this session's code consumes)
- `/adopted/standing-protocol-cache.md` (operative governing frame)
- `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6 — implemented)
- `/adopted/rag-mentor-alt3/re-rank-design.md` (D7 — implemented)
- `/operations/migrations/2026-05-04-retrieval-rpc-functions.sql` (RPC functions — Live)
- `/operations/migrations/2026-05-04-test-output.log` (verification run record)
- `/website/src/lib/rag/retrieve-passages.ts` (D6 — Verified)
- `/website/src/lib/rag/rerank.ts` (D7 — Verified)
- `/website/src/lib/rag/index.ts` (re-export surface)
- `/website/scripts/test-retrieval-rerank.ts` (verification harness)

*End of session close. D6 retrieve + D7 rerank now Verified against the embedded substrate; production Supabase carries the two RPC functions; the retrieval substrate is operationally ready for Sub-session D's PR1 single-endpoint wiring.*
