/**
 * /lib/rag — RAG (retrieval + re-rank) module.
 *
 * Re-export surface for D6 retrieve-passages + D7 rerank.
 *
 * Consumer pattern:
 *
 *   import { retrievePassages, reRank } from '@/lib/rag';
 *
 *   // Per-request cache lives in the route handler's scope.
 *   const cache = new Map();
 *
 *   const candidates = await retrievePassages({
 *     query: 'philodoxia false judgement reputation',
 *     mechanism_filter: ['passion_false_judgement'],
 *     passion_filter: 'epithumia',
 *     sub_passion_filter: 'philodoxia',
 *     passage_type_filter: ['mechanism'],
 *   }, cache);
 *
 *   const top = await reRank(candidates.passages, {
 *     query: 'philodoxia false judgement reputation',
 *     mechanism_filter: ['passion_false_judgement'],
 *     passion_filter: 'epithumia',
 *     sub_passion_filter: 'philodoxia',
 *     passage_type_filter: ['mechanism'],
 *   }, 'heuristic', { top_k_after_rerank: 3 });
 */

export {
  retrievePassages,
  makeCacheKey,
  RetrievalTimeoutError,
  EmbeddingFailureError,
  RetrievalUnavailableError,
} from './retrieve-passages';

export type {
  PassageType,
  RetrieveInput,
  RetrieveResult,
  RetrievedPassage,
  RetrieveTrace,
  SlotField,
} from './retrieve-passages';

export { reRank, NotImplementedError, HEURISTIC_MULTIPLIERS } from './rerank';

export type { ReRankPolicy, ReRankOptions } from './rerank';
