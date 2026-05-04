import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, getAuthenticatedUser } from '@/lib/security'
import {
  retrievePassages,
  reRank,
  RetrievalTimeoutError,
  EmbeddingFailureError,
  RetrievalUnavailableError,
  NotImplementedError,
} from '@/lib/rag'
import type { RetrieveResult, RetrievedPassage, RetrieveTrace } from '@/lib/rag'
import {
  toBm25OrShape,
  validateRequest,
  type ExposedReRankPolicy,
} from './helpers'

// =============================================================================
// internal/retrieve — D6 + D7 PR1 single-endpoint proof
//
// POST /api/internal/retrieve
//
// Outcome: Expose D6 retrievePassages + D7 reRank over HTTP for the PR1
//          single-endpoint proof. Internal route — admin auth only; no
//          user-facing surface; no LLM call (pure deterministic retrieval).
// Cost + Speed: 1 OpenAI embedding call (~$0.000002) + 2 Supabase RPC calls.
//               Cold ~700-3700ms; warm cache hit ~0ms.
// Chains To: Future consumers (Sub-sessions E1-E4) wire D6/D7 into their
//            own routes using the pattern proven here.
//
// AUTH: Admin-only (existing /api/admin/* pattern). Caller passes their
//       Supabase JWT as Authorization: Bearer <token>. The route checks
//       that user.id === ADMIN_USER_ID env var.
// RATE LIMIT: RATE_LIMITS.admin (30 / minute).
// CORS: None (internal route; same-origin only).
//
// AC-12 narrowness: NO LLM call in this route. D6 retrieval and D7 heuristic
// re-rank are deterministic. The route does no Stoic reasoning.
//
// KG1 rule 4: Per-request cache (Map) is declared INSIDE the POST handler.
// Never module-level.
// KG1 rule 2: All async DB reads are awaited.
// KG6: The response IS the placement. No prompt composition here. Future
// consumers decide where the passages land.
// R7: source_citation flows through every returned passage.
// R8a: controlled vocabulary IDs (mechanism / passion / sub-passion) preserved.
//
// PR1: This is the single-endpoint proof. Sub-session E1+ generalises the
// pattern to additional consumers.
//
// DESIGN DECISIONS DOCUMENTED IN:
//   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
//   - /adopted/rag-mentor-alt3/retrieval-interface.md (D6 spec)
//   - /adopted/rag-mentor-alt3/re-rank-design.md (D7 spec)
//   - /operations/decision-log.md D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04
//
// PURE FUNCTIONS extracted to ./helpers.ts so the verification harness
// at /website/scripts/verify-internal-retrieve.ts can import them.
// =============================================================================

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

// =============================================================================
// RESPONSE SHAPE
// =============================================================================

interface RetrieveRouteResponse {
  passages: RetrievedPassage[]
  retrieval_diagnostics: RetrieveResult['retrieval_diagnostics']
  rerank_diagnostics: {
    policy: ExposedReRankPolicy
    candidates_in: number
    candidates_out: number
    elapsed_ms: number
  }
  trace?: RetrieveTrace
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Verify admin access. Mirrors the pattern in /api/admin/api-keys/route.ts.
 * Returns { error: NextResponse } on failure or { user } on success.
 */
async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || !ADMIN_USER_ID || user.id !== ADMIN_USER_ID) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    }
  }
  return { user, error: null }
}

/**
 * Map a known D6/D7 error class to its HTTP response per ADR-001 §"Error
 * handling". Unknown errors get logged and return 500.
 */
function mapError(err: unknown): NextResponse {
  if (err instanceof RetrievalTimeoutError) {
    return NextResponse.json(
      { error: 'Retrieval timed out', channel: err.channel },
      { status: 504 }
    )
  }
  if (err instanceof EmbeddingFailureError) {
    return NextResponse.json(
      { error: 'Embedding service unavailable' },
      { status: 502 }
    )
  }
  if (err instanceof RetrievalUnavailableError) {
    return NextResponse.json(
      { error: 'Both retrieval channels failed' },
      { status: 503 }
    )
  }
  if (err instanceof NotImplementedError) {
    return NextResponse.json(
      { error: `Re-rank policy '${err.policy}' is not implemented` },
      { status: 501 }
    )
  }
  console.error('Internal retrieve route error:', err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

// =============================================================================
// POST handler
// =============================================================================

export async function POST(request: NextRequest) {
  // -- 1. Rate limit
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  // -- 2. Auth (admin only)
  const { error: authError } = await requireAdmin(request)
  if (authError) return authError

  // -- 3. Parse + validate body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const validation = validateRequest(rawBody)
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, details: validation.details },
      { status: 400 }
    )
  }
  const data = validation.data

  // -- 4. Per-request cache (KG1 rule 4 — declared inside handler)
  const cache = new Map<string, RetrieveResult>()

  // -- 5. BM25 query reformulation (per ADR-001).
  //       Per the post-Sub-session-D refinement: the OR-shape is passed to
  //       D6's bm25_query so only the BM25 channel sees it; the vector
  //       channel uses the raw query verbatim for embedding.
  const bm25Query = toBm25OrShape(data.query)

  // -- 6. Retrieve (D6) — KG1 rule 2 (await all DB calls)
  let retrieved: RetrieveResult
  try {
    retrieved = await retrievePassages(
      {
        ...data,
        query: data.query,
        bm25_query: bm25Query,
      },
      cache
    )
  } catch (err) {
    return mapError(err)
  }

  // -- 7. Re-rank (D7) — heuristic default; original query for tag-context
  const rerankBegin = performance.now()
  let topK: RetrievedPassage[]
  try {
    topK = await reRank(
      retrieved.passages,
      { ...data, query: data.query },
      data.rerank_policy ?? 'heuristic',
      { top_k_after_rerank: data.top_k_after_rerank ?? 5 }
    )
  } catch (err) {
    return mapError(err)
  }
  const rerankElapsed = Math.round(performance.now() - rerankBegin)

  // -- 8. Build response
  const response: RetrieveRouteResponse = {
    passages: topK,
    retrieval_diagnostics: retrieved.retrieval_diagnostics,
    rerank_diagnostics: {
      policy: data.rerank_policy ?? 'heuristic',
      candidates_in: retrieved.passages.length,
      candidates_out: topK.length,
      elapsed_ms: rerankElapsed,
    },
    ...(retrieved.trace ? { trace: retrieved.trace } : {}),
  }

  return NextResponse.json(response)
}
