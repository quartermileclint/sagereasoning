/**
 * load-layer1-with-fallback.ts — shared wrapper that loads Layer 1 (Stoic Brain)
 * content via D6 + D7 RAG retrieval, with graceful fallback to the compiled
 * `getStoicBrainContext(depth)` path on any retrieval error.
 *
 * Lifted to /lib/rag/ in Sub-session E3 (2026-05-04) per Pattern S3 (function
 * lift). Predecessor copies were duplicated in:
 *   - /website/src/app/api/reason/route.ts (E1 — quick depth)
 *   - /website/src/app/api/score/route.ts (E2 — standard depth)
 * After E3, both consumers (and the new /api/score-conversation consumer)
 * import this single shared module.
 *
 * The only behavioural difference vs the predecessor copies is the
 * `routeName` parameter — the console.warn message identifies the calling
 * route so Phase-2 production observation can attribute failures correctly.
 *
 * Returns a spreadable shape:
 *   - success path:  { retrievedPassages: RetrievedPassage[] }
 *   - fallback path: { stoicBrainContext: string }
 *
 * The engine prefers `stoicBrainContext` when both are present, so the
 * fallback shape is safe — callers can always do `...layer1` without
 * branching.
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001 — Pattern A2)
 *   - /website/src/lib/rag/helpers.ts (the shared mechanism-mapping helpers)
 *   - /website/src/lib/sage-reason-engine.ts (the engine that consumes the
 *     spread — prefers retrievedPassages, falls through to stoicBrainContext)
 *   - /operations/decision-log.md D-REASON-RAG-WIRED-2026-05-04 (E1 origin)
 *   - /operations/decision-log.md D-SCORE-RAG-WIRED-2026-05-04 (E2 origin)
 */

import { retrievePassages, reRank, type RetrievedPassage, type RetrieveInput, type RetrieveResult } from '@/lib/rag'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import type { ReasonDepth } from '@/lib/depth-constants'
import { getCorpusMechanismsForDepth, RETRIEVAL_TOP_K_BY_DEPTH, toBm25OrShape } from './helpers'

/**
 * Load Layer 1 Stoic Brain content via D6 + D7 RAG retrieval.
 *
 * Returns either `{ retrievedPassages }` (success path) or
 * `{ stoicBrainContext }` (fallback path), spreadable into the engine input.
 * The engine prefers `stoicBrainContext` when both are present, so the
 * fallback shape is safe.
 *
 * Graceful degradation: if retrieval fails (RetrievalUnavailableError,
 * EmbeddingFailureError, RetrievalTimeoutError, or any thrown error), we fall
 * back to the compiled-string path via getStoicBrainContext(depth). The user
 * sees a working response; the failure is observable via console.warn.
 *
 * @param input — the user-facing input string (verbatim for vector channel;
 *                reformulated to OR-shape for BM25 channel)
 * @param depth — engine depth ('quick' | 'standard' | 'deep') — controls the
 *                mechanism filter and top-k ceilings
 * @param cache — per-request RetrieveResult cache (KG1 rule 4 — never module-level;
 *                callers declare a fresh Map<string, RetrieveResult> inside POST)
 * @param routeName — identifier for the calling route (used in console.warn on
 *                    fallback so Phase-2 observation can attribute failures
 *                    correctly; e.g., '/api/reason', '/api/score',
 *                    '/api/score-conversation')
 */
export async function loadLayer1WithFallback(
  input: string,
  depth: ReasonDepth,
  cache: Map<string, RetrieveResult>,
  routeName: string,
): Promise<{ retrievedPassages?: RetrievedPassage[]; stoicBrainContext?: string }> {
  try {
    const corpusMechanisms = getCorpusMechanismsForDepth(depth)
    const { top_k, top_k_after_rerank } = RETRIEVAL_TOP_K_BY_DEPTH[depth]
    const retrieveInput: RetrieveInput = {
      query: input,
      bm25_query: toBm25OrShape(input),
      mechanism_filter: corpusMechanisms,
      passage_type_filter: ['mechanism'],
      top_k,
    }
    const result = await retrievePassages(retrieveInput, cache)
    const top = await reRank(result.passages, retrieveInput, 'heuristic', { top_k_after_rerank })
    return { retrievedPassages: top }
  } catch (err) {
    console.warn(
      `${routeName}: D6/D7 retrieval failed, falling back to compiled stoic-brain path. ` +
      `depth=${depth} error=${err instanceof Error ? err.message : String(err)}`,
    )
    return { stoicBrainContext: getStoicBrainContext(depth) }
  }
}
