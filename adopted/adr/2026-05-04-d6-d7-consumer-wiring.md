# ADR-001 — D6 + D7 Consumer Wiring Pattern

**Status:** Adopted (founder approval at session-open of Sub-session D, 2026-05-04). Amended in-session 2026-05-04 — see changelog at end.
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04`; `D-CORPUS-EMBEDDINGS-IVFFLAT-2026-05-04`.
**Related deliverables:** `/adopted/rag-mentor-alt3/retrieval-interface.md` (D6); `/adopted/rag-mentor-alt3/re-rank-design.md` (D7).
**Engages:** PR1 (single-endpoint proof); KG1 rules 2 + 4 (per-request lifetime; await all DB reads); KG6 (composition order); AC-12 (translation-sandwich narrowness); R7 (source fidelity); R8a (controlled vocabulary); R5 (cost guardrail).

---

## Context

D6 (`retrievePassages`) and D7 (`reRank`) are Verified in isolation against a 5-query test harness. They are not yet imported by any deployed route. Sub-session D's purpose is the **PR1 single-endpoint proof**: prove the wiring pattern on one consumer route before generalising to additional consumers (Sub-sessions E1–E4).

The chosen consumer for the proof is **Candidate C — a new dedicated `/api/internal/retrieve` route**. The route exposes D6 + D7 over HTTP without serving any user-facing surface. This isolates the proof from production traffic, gives the modules a real entry point that subsequent consumers can be tested against, and keeps the rollback story trivial (delete the route file).

Two findings from `D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04` need to be addressed in this wiring:

1. **BM25 channel returned 0 results** across all 5 multi-term test queries. `websearch_to_tsquery` defaults to AND across query terms; multi-term queries don't match short corpus chunks. Founder direction (Sub-session D session-open): reformulate queries; do not add a server-side embedding cache.
2. **Cold latencies above D6 targets** (748–3774ms vs 500ms). Founder direction: accept per-call cost for the proof; no cross-request embedding cache.

## Decision

### Route

| Decision | Choice | Alternatives considered |
|---|---|---|
| **Path** | `/api/internal/retrieve` | `/api/rag/retrieve` (closer to module name); `/api/private/retrieve` (matches V3 mentor naming). `internal` chosen to signal "not user-facing"; reserves `private` namespace for future per-user data-bearing routes. |
| **HTTP method** | `POST` | `GET` (rejected — RetrieveInput's filter shape is too rich for query-string encoding). |
| **Auth model** | Admin-only via existing admin auth pattern (the Bearer token check used by `/api/admin/*` routes) | (a) Open: not appropriate for an internal route; (b) Signed-in user: doesn't add value when no user context is consumed; (c) Service-role only: too restrictive for founder testing via Mac terminal. Admin-only matches "internal route" semantics + lets the founder hit it directly. |
| **Rate limit** | `RATE_LIMITS.admin` (30 / minute) | The existing admin pattern; sufficient for founder testing + future internal callers. |
| **CORS** | Internal route; no CORS (omit `corsHeaders`) | All internal routes are same-origin; CORS would be cargo-culted. |

### Request shape

```typescript
// POST /api/internal/retrieve
// Request body:
interface RetrieveRouteRequest {
  query: string;                              // required — vector channel uses verbatim; BM25 gets reformulated
  mechanism_filter?: string[];
  passion_filter?: string;
  sub_passion_filter?: string;
  passage_type_filter?: PassageType[];
  trigger_condition_filter?: string;
  intake_tier_filter?: 1 | 2 | 3;
  top_k?: number;                             // D6 retrieval ceiling; default 20
  top_k_after_rerank?: number;                // D7 final cut; default 5
  rerank_policy?: 'heuristic';                // only heuristic exposed; cross_encoder + llm reserved
  trace_enabled?: boolean;                    // for diagnostics
}
```

The shape is a thin wrapper over `RetrieveInput` plus the `top_k_after_rerank` parameter D7 needs. The route does not expose `bm25_weight`, `vector_weight`, or `rrf_k` — those are D6 internals; if Phase-2 production observation justifies per-call tuning, the route adds them then.

### Response shape

```typescript
interface RetrieveRouteResponse {
  passages: Array<{                           // top_k_after_rerank, post-D7
    passage_id: string;
    source_file: string;
    source_citation: string;                  // R7
    passage_type: PassageType;
    canonical_mechanism: string[];
    passion: string | null;
    sub_passion: string | null;
    audience_tier: string;
    text: string;
    paragraph_text: string | null;
    rrf_score: number;
    rerank_score: number;
    bm25_rank: number | null;
    vector_rank: number | null;
    // focus-question-stem fields included only when present
    trigger_condition?: string;
    intake_tier?: 1 | 2 | 3;
    slot_fields?: SlotField[];
  }>;
  retrieval_diagnostics: {                    // verbatim from D6
    bm25_count: number;
    vector_count: number;
    fusion_count: number;
    cache_hit: boolean;
    elapsed_ms: number;
    degraded_retrieval?: boolean;             // surfaced if D6 fell back to single-channel
  };
  rerank_diagnostics: {
    policy: 'heuristic';
    candidates_in: number;
    candidates_out: number;
    elapsed_ms: number;
  };
  trace?: RetrieveTrace;                      // present only if trace_enabled: true
}
```

### Wiring shape

```typescript
export async function POST(request: NextRequest) {
  // 1. Auth (admin Bearer token) → 401 if missing/invalid
  // 2. Rate limit (admin) → 429 if exceeded
  // 3. Parse + validate body → 400 if malformed
  // 4. Per-request cache: const cache = new Map();        ← KG1 rule 4
  // 5. BM25 reformulation: const bm25Query = toBm25OrShape(body.query);
  //    (See "Query construction discipline" below.)
  // 6. const result = await retrievePassages(
  //      { ...body, query: bm25Query },                    ← passes OR-shaped to BM25 + vector
  //      cache,
  //    );                                                  ← KG1 rule 2 (await)
  // 7. const top = await reRank(
  //      result.passages,
  //      { ...body, query: body.query },                   ← original query for heuristic context
  //      body.rerank_policy ?? 'heuristic',
  //      { top_k_after_rerank: body.top_k_after_rerank ?? 5 },
  //    );                                                  ← KG1 rule 2 (await)
  // 8. Build response; return NextResponse.json
  // 9. Catch RetrievalUnavailableError → 503; other errors → 500
}
```

The cache is declared inside the handler (KG1 rule 4 — per-request lifetime; never module-level). All async DB reads are awaited (KG1 rule 2). No background work; no fire-and-forget.

### Query construction discipline (BM25 reformulation)

A small helper translates the raw query into BM25-friendly OR-shape:

```typescript
function toBm25OrShape(query: string): string {
  // "philodoxia false judgement reputation" → "philodoxia OR false OR judgement OR reputation"
  // Splits on whitespace; filters tokens shorter than 2 chars; joins with " OR ".
  // websearch_to_tsquery interprets " OR " as the | operator.
  // The vector channel tolerates "OR" tokens (embedding model treats them as common stop-words).
}
```

Trade-off recorded at draft time: the OR-shaped query was originally passed to both channels because D6's contract had a single `query` parameter. **Amended in-session (2026-05-04):** D6's contract was extended with an optional `bm25_query` parameter so the BM25 channel sees the OR-shape and the vector channel sees the raw query. The route now passes `query: data.query, bm25_query: toBm25OrShape(data.query)`. Backward-compatible (when `bm25_query` is omitted, BM25 falls back to `query`). See changelog at the end of this ADR.

For the heuristic re-ranker (D7), the `RetrieveInput` passed to `reRank` carries the **original** query — the heuristic boosts work on structural-tag matches, not on the query string, so the reformulation doesn't affect ranking quality.

### Error handling

| Error from D6/D7 | HTTP status | Response body |
|---|---|---|
| `RetrievalTimeoutError` | 504 (Gateway Timeout) | `{ error: 'Retrieval timed out' }` |
| `EmbeddingFailureError` | 502 (Bad Gateway) | `{ error: 'Embedding service unavailable' }` |
| `RetrievalUnavailableError` | 503 (Service Unavailable) | `{ error: 'Both retrieval channels failed' }` |
| Validation failure | 400 | `{ error: 'Invalid request', details: [...] }` |
| Auth failure | 401 | `{ error: 'Unauthorized' }` |
| Rate limit | 429 (handled by `checkRateLimit`) | per existing pattern |
| Unexpected | 500 | `{ error: 'Internal server error' }` (server logs the exception) |

### AC-12 narrowness preservation

The route makes **no LLM call**. D6's retrieval is deterministic (BM25 + vector + RRF). D7's heuristic re-rank is deterministic (multiplicative-tag boosts). The route produces ranked passages; it does not generate prose, score moral content, or perform Stoic reasoning. AC-12 commitment is preserved without compromise.

### KG6 compliance

The route's response **is** the placement — it returns ranked passages to its caller. No prompt composition happens here. Future consumers (E1–E4) are responsible for placing the response's `passages[]` into their own prompt's system block (cached) or user message (per-request) per their KG6 needs. This route honours KG6 by not imposing a placement.

## Consequences

### Positive

- D6 + D7 reach **Wired** (the modules now have a real HTTP entry point). After founder verification of the route, they reach **Verified-in-place** for this consumer.
- The wiring pattern (per-request cache; OR-shape BM25 reformulation; error-class-to-HTTP mapping; AC-12 narrowness) is documented and proven. Sub-session E1+ apply this pattern to the next consumer.
- Rollback is trivial — delete the route file and the type definition. The D6/D7 modules and the corpus_passages substrate remain untouched.
- Founder can hit the route from the Mac terminal with `curl` and verify retrieval shape end-to-end against any of the 5 test queries.

### Negative / known costs

- One more route to maintain. Standard cost; isolated to internal namespace.
- The BM25 reformulation discipline lives in the route file, not in D6. If multiple consumers want it, we'll extract to a shared helper or extend D6's contract (Phase-2 refinement).
- The route doesn't replace any user-facing functionality this session. PR1 is satisfied (proof complete) but operational rollout begins in E1+.

### Risks named

- **BM25 reformulation may not produce non-zero results either.** The OR-shape is a best-effort fix; if Q1–Q5 still return BM25=0 with reformulation, the finding is logged for Phase-2 production observation and the proof still passes (vector-only ranking demonstrated correct top-3 in C-bis).
- **Latency on cold path remains 700–3700ms.** Accepted per founder direction. The internal route is not on the user-facing latency budget; this is a tooling surface.
- **Admin auth pattern is the existing weakest link.** If `/api/admin/*` auth has any issue, this route inherits it. Documented; not in this session's scope to address.

### What this ADR does not decide

- The wiring of D6/D7 into the V3 mentor reflection route (Candidate B). That is a Critical-risk session deferred to a future Sub-session.
- The wiring into `/api/reason` quick-depth (Candidate A). Likely Sub-session E1.
- Cross-request embedding cache. Founder direction was "no cache for the proof"; future-session candidate.
- ~~D6 contract extension to accept separate `bm25_query`. Future-session candidate.~~ **Implemented in this session per the in-session refinement** (see changelog).

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR moves from `/drafts/adr/` to `/adopted/adr/` in this session, accompanies the wiring code. **Approved 2026-05-04 at Sub-session D Step 2 with no edits to the original draft.**

## Changelog

- **2026-05-04 (initial Adoption)** — drafted in /drafts/adr/, approved by founder, moved to /adopted/adr/.
- **2026-05-04 (in-session refinement)** — D6's `retrievePassages` contract extended with optional `bm25_query` parameter (additive; backward-compatible). Reason: first verification run (Sub-session D Step 4) surfaced Q3 ranking shift caused by the OR-shape contaminating the vector channel's embedding. The "cleaner separation" originally named as a Phase-2 / Sub-session E candidate was promoted to in-session implementation per founder direction ("fix it now"). Two passages in this ADR amended to reflect the new state. See `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` for the full reasoning.

---

*End of ADR-001.*
