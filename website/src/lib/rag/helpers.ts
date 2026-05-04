/**
 * helpers.ts — pure functions used by consumer routes that wire D6 + D7 RAG
 * retrieval into Layer 1 of the three-layer context architecture.
 *
 * Lifted to /lib/rag/ in Sub-session E3 (2026-05-04) per Pattern S2 (helper
 * lift) — predecessor location was /website/src/app/api/reason/helpers.ts
 * (route-local). With three+ consumers wiring D6 + D7, the cross-route import
 * pattern (Pattern S1, used in E2's /api/score wiring) becomes a maintenance
 * tax; lifting to a shared neutral location is the natural simplification.
 *
 * This file has no behavioural change relative to the predecessor — it is a
 * pure relocation. The verification harness (extended with the V2 phase helper
 * in E3) re-runs all existing checks to prove no regression.
 *
 * Consumers (after Sub-session E3 completes):
 *   - /api/reason/route.ts (E1 — quick depth)
 *   - /api/score/route.ts (E2 — standard depth)
 *   - /api/score-conversation/route.ts (E3 — deep depth)
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - /website/src/lib/rag/load-layer1-with-fallback.ts (the shared wrapper that
 *     uses these helpers)
 *   - /website/src/lib/depth-constants.ts (engine-depth mechanism mapping)
 *   - /adopted/rag-mentor-alt3/retrieval-interface.md §"Per-mechanism call patterns"
 *     (the corpus mechanism IDs this file maps to)
 *   - /website/src/app/api/internal/retrieve/helpers.ts (toBm25OrShape source —
 *     this file re-exports from there)
 */

import type { ReasonDepth } from '@/lib/depth-constants'

// =============================================================================
// ENGINE-DEPTH → CORPUS-MECHANISM MAPPING
// =============================================================================

/**
 * Maps each engine-depth mechanism (per /lib/depth-constants.ts DEPTH_MECHANISMS)
 * to the corpus mechanism IDs it covers.
 *
 * Engine-depth mechanisms are coarse names ('passion_diagnosis'); the corpus
 * tags passages with finer canonical IDs ('passion_root_detection',
 * 'passion_sub_species', 'passion_false_judgement') per D6
 * §"Per-mechanism call patterns".
 */
const ENGINE_TO_CORPUS_MECHANISMS: Record<string, string[]> = {
  control_filter: ['prohairesis_filter'],
  passion_diagnosis: ['passion_root_detection', 'passion_sub_species', 'passion_false_judgement'],
  oikeiosis: ['oikeiosis_stage', 'oikeiosis_obligation'],
  value_assessment: ['value_indifferent'],
  kathekon_assessment: ['virtue_domain_engaged'],
  iterative_refinement: ['katorthoma_proximity'],
}

/**
 * Returns the flat list of corpus mechanism IDs to filter by for a given
 * engine depth. Used as `mechanism_filter` in the D6 retrievePassages call.
 *
 * Examples:
 *   getCorpusMechanismsForDepth('quick')
 *   → ['prohairesis_filter', 'passion_root_detection', 'passion_sub_species',
 *      'passion_false_judgement', 'oikeiosis_stage', 'oikeiosis_obligation']
 *
 *   getCorpusMechanismsForDepth('standard')
 *   → quick + ['value_indifferent', 'virtue_domain_engaged']
 *
 *   getCorpusMechanismsForDepth('deep')
 *   → standard + ['katorthoma_proximity']
 */
export function getCorpusMechanismsForDepth(depth: ReasonDepth): string[] {
  // Engine-depth mechanisms are imported by the route; we re-derive the list
  // here to keep this helper file self-contained for testing.
  const engineMechanisms = DEPTH_MECHANISM_NAMES[depth]
  return engineMechanisms.flatMap((m) => ENGINE_TO_CORPUS_MECHANISMS[m] ?? [])
}

/**
 * Local copy of DEPTH_MECHANISMS (engine side) for self-contained testing.
 * Source of truth: /lib/depth-constants.ts. If that file changes, update here.
 */
const DEPTH_MECHANISM_NAMES: Record<ReasonDepth, string[]> = {
  quick: ['control_filter', 'passion_diagnosis', 'oikeiosis'],
  standard: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment'],
  deep: ['control_filter', 'passion_diagnosis', 'oikeiosis', 'value_assessment', 'kathekon_assessment', 'iterative_refinement'],
}

// =============================================================================
// TOP-K SELECTION PER DEPTH
// =============================================================================

/**
 * Per-depth retrieval ceiling parameters for the D6 + D7 wiring.
 *
 * - top_k: D6 retrieval ceiling (BM25 + vector candidates fused via RRF)
 * - top_k_after_rerank: D7 final passage count returned to engine
 *
 * Sized to roughly match the existing getStoicBrainContext(depth) token
 * budgets:
 *   quick   ~995 tokens  → 8 passages × ~125 tokens each = ~1000 tokens
 *   standard ~1538 tokens → 12 passages × ~125 tokens each = ~1500 tokens
 *   deep    ~2007 tokens → 15 passages × ~125 tokens each = ~1875 tokens
 *
 * These are starting values; Phase-2 production observation may refine.
 */
export const RETRIEVAL_TOP_K_BY_DEPTH: Record<ReasonDepth, { top_k: number; top_k_after_rerank: number }> = {
  quick:    { top_k: 20, top_k_after_rerank: 8 },
  standard: { top_k: 25, top_k_after_rerank: 12 },
  deep:     { top_k: 30, top_k_after_rerank: 15 },
}

// =============================================================================
// BM25 OR-SHAPE REFORMULATION (re-exported from /api/internal/retrieve/helpers)
// =============================================================================

/**
 * Re-exports `toBm25OrShape` from the internal retrieve helpers so consumers
 * of this file have a single import surface. The implementation lives at
 * /website/src/app/api/internal/retrieve/helpers.ts per ADR-001's
 * "Query construction discipline" section.
 */
export { toBm25OrShape } from '@/app/api/internal/retrieve/helpers'
