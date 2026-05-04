/**
 * helpers.ts — DEPRECATED re-export shim.
 *
 * The contents of this file were lifted to /website/src/lib/rag/helpers.ts in
 * Sub-session E3 (2026-05-04) per Pattern S2. Three+ Pattern A2 consumers
 * (/api/reason, /api/score, /api/score-conversation) now import directly from
 * the shared location.
 *
 * This shim re-exports the helpers from the new location so any stale import
 * path continues to work. New code should import from `@/lib/rag/helpers`.
 *
 * To-do: remove this shim in a future session once the codebase is confirmed
 * free of `@/app/api/reason/helpers` imports. Removing earlier is safe per the
 * E3 grep at session close, but the shim is retained as defensive cushioning.
 *
 * Cross-references:
 *   - /website/src/lib/rag/helpers.ts (canonical location after E3)
 *   - /operations/decision-log.md D-CONSUMER-WIRING-LIFT-2026-05-04
 */

export {
  getCorpusMechanismsForDepth,
  RETRIEVAL_TOP_K_BY_DEPTH,
  toBm25OrShape,
} from '@/lib/rag/helpers'
