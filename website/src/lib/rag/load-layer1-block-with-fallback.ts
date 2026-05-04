/**
 * load-layer1-block-with-fallback.ts — sibling wrapper for Pattern A1 (Sub-session E5).
 *
 * Loads Layer 1 (Stoic Brain) content via D6 + D7 RAG retrieval and returns the
 * formatted block string ready for direct injection into a route's
 * `client.messages.create` system message array. Falls back gracefully to the
 * compiled `getStoicBrainContext(depth)` path on any retrieval error.
 *
 * SIBLING TO `load-layer1-with-fallback.ts`. Both wrappers share the same
 * helpers (`getCorpusMechanismsForDepth`, `RETRIEVAL_TOP_K_BY_DEPTH`,
 * `toBm25OrShape`) and the same fallback envelope. The difference is the
 * return type:
 *
 *   - `loadLayer1WithFallback`        → spreadable shape for the engine
 *                                      (`{ retrievedPassages? } | { stoicBrainContext? }`).
 *                                      Used by Pattern A2 (Group A) consumers
 *                                      that call `runSageReason`.
 *
 *   - `loadLayer1BlockWithFallback`   → `Promise<string>`. Always returns a
 *                                      string suitable for direct system-block
 *                                      injection. Used by Pattern A1 (Group B)
 *                                      consumers that call
 *                                      `client.messages.create` directly.
 *
 * On success, the string is the formatted passage block produced by the
 * engine's exported `formatRetrievedPassagesAsBlock` (so Pattern A1 and
 * Pattern A2 use identical block-formatting source-of-truth).
 *
 * On fallback (any thrown error from D6 + D7 + format), the string is
 * `getStoicBrainContext(depth)` — the compiled-string path. Failure is logged
 * via `console.warn` carrying the route name so Phase-2 production observation
 * can attribute failures correctly.
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001, amended at E5
 *     to specify Pattern A1; see §"Pattern variants (named retrospectively)")
 *   - /website/src/lib/rag/helpers.ts (shared mechanism-mapping + OR-shape helpers)
 *   - /website/src/lib/rag/load-layer1-with-fallback.ts (sibling wrapper for Pattern A2)
 *   - /website/src/lib/sage-reason-engine.ts §formatRetrievedPassagesAsBlock
 *   - /operations/decision-log.md D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04
 */

import { retrievePassages, reRank, type RetrieveInput, type RetrieveResult } from '@/lib/rag'
import { formatRetrievedPassagesAsBlock } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import type { ReasonDepth } from '@/lib/depth-constants'
import { getCorpusMechanismsForDepth, RETRIEVAL_TOP_K_BY_DEPTH, toBm25OrShape } from './helpers'

/**
 * Load Layer 1 Stoic Brain content via D6 + D7 RAG retrieval and return the
 * formatted block string ready for direct injection into a system message.
 *
 * Returns a non-empty string on success (the formatted passage block) or, on
 * any retrieval failure, the compiled-string path via
 * `getStoicBrainContext(depth)`. The user sees a working response either way;
 * the failure is observable via `console.warn`.
 *
 * @param input — the user-facing input string (verbatim for vector channel;
 *                reformulated to OR-shape for BM25 channel)
 * @param depth — engine depth ('quick' | 'standard' | 'deep') — controls the
 *                mechanism filter and top-k ceilings
 * @param cache — per-request `RetrieveResult` cache (KG1 rule 4 — never
 *                module-level; callers declare a fresh
 *                `Map<string, RetrieveResult>` inside POST)
 * @param routeName — identifier for the calling route (used in `console.warn`
 *                    on fallback so Phase-2 observation can attribute failures
 *                    correctly; e.g., `/api/score-document`,
 *                    `/api/score-scenario`)
 *
 * @returns A string suitable for direct injection into a system message block.
 *          Never empty — the fallback path always returns at least the
 *          compiled-string Stoic Brain context.
 */
export async function loadLayer1BlockWithFallback(
  input: string,
  depth: ReasonDepth,
  cache: Map<string, RetrieveResult>,
  routeName: string,
): Promise<string> {
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
    const block = formatRetrievedPassagesAsBlock(top)
    // Defensive: if format returns empty (no passages survived re-rank), fall
    // back to the compiled path. The user must always see a populated Layer 1.
    if (!block || block.length === 0) {
      console.warn(
        `${routeName}: D6/D7 returned no passages after re-rank, falling back to compiled stoic-brain path. ` +
        `depth=${depth}`,
      )
      return getStoicBrainContext(depth)
    }
    return block
  } catch (err) {
    console.warn(
      `${routeName}: D6/D7 retrieval failed, falling back to compiled stoic-brain path. ` +
      `depth=${depth} error=${err instanceof Error ? err.message : String(err)}`,
    )
    return getStoicBrainContext(depth)
  }
}
