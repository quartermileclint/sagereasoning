/**
 * rerank.ts — D7 re-rank function (heuristic policy in Phase 1).
 *
 * PURPOSE: Take the top-K candidates from D6's retrievePassages and produce
 * the top-3-5 to send to the prompt (per AC-3). The re-rank is structural
 * relevance scoring, NOT Stoic reasoning (per AC-12 translation-sandwich).
 *
 * PHASE-1 POLICY: Heuristic re-rank is the canonical default. The formula
 * compounds multiplicative boosts on top of D6's RRF score for structural
 * tag matches (mechanism, passion / sub-passion, passage type, audience tier).
 *
 * The 'cross_encoder' and 'llm' policy values are accepted as type values
 * but their handlers throw NotImplementedError. They are reserved for
 * Phase-2 production observation per D7 §"Per-mechanism re-rank policy".
 *
 * IMPLEMENTATION NOTE — passion / sub-passion boost
 *   D7 §"Heuristic re-rank scoring formula" prose says
 *     "1.3 if passion matches; 1.1 if sub_passion matches; 1.0 otherwise".
 *   The worked example (Rule 5 Pass-1) is internally consistent with a
 *   different rule: × 1.3 when sub_passion_filter is provided AND matches;
 *   × 1.1 when only passion_filter is provided AND matches; otherwise × 1.0.
 *   This implementation follows the worked example. The discrepancy is
 *   logged as an open question in the decision-log entry; Phase-2 production
 *   observation can confirm or revise the multiplier values per D7 §"Open
 *   questions" item 1.
 *
 * Implements: AC-3, AC-12, R5.
 * Cross-references:
 *   - /adopted/rag-mentor-alt3/re-rank-design.md (D7 spec)
 *   - /website/src/lib/rag/retrieve-passages.ts (D6 — produces input)
 */

import type { RetrieveInput, RetrievedPassage } from './retrieve-passages';

// =============================================================================
// TYPES
// =============================================================================

export type ReRankPolicy = 'heuristic' | 'cross_encoder' | 'llm';

export interface ReRankOptions {
  /** Top-K to return after re-rank. Default 5 per AC-3. */
  top_k_after_rerank?: number;

  /** Audience tier of the consumer surface (R8a/R8b/R8c/R8d). Drives the
   *  audience-tier boost when set. */
  consumer_audience_tier?: string;
}

// =============================================================================
// ERRORS
// =============================================================================

export class NotImplementedError extends Error {
  policy: ReRankPolicy;
  constructor(policy: ReRankPolicy, message?: string) {
    super(message ?? `Re-rank policy '${policy}' is not implemented in Phase 1`);
    this.name = 'NotImplementedError';
    this.policy = policy;
  }
}

// =============================================================================
// HEURISTIC MULTIPLIERS (per D7 §"Heuristic re-rank scoring formula")
// =============================================================================

const MECHANISM_MATCH_BOOST = 1.5;
const SUB_PASSION_MATCH_BOOST = 1.3; // applied when sub_passion_filter matches
const PASSION_ONLY_MATCH_BOOST = 1.1; // applied when only passion_filter matches and no sub_passion_filter
const PASSAGE_TYPE_MATCH_BOOST = 1.2;
const AUDIENCE_TIER_MATCH_BOOST = 1.1;

// =============================================================================
// THE RE-RANK FUNCTION
// =============================================================================

/**
 * Re-rank D6's retrieval candidates by structural relevance.
 *
 * @param candidates Result of retrievePassages — array sorted by RRF score.
 * @param input      The original RetrieveInput — informs which structural
 *                   tags to boost (mechanism / passion / sub-passion / type).
 * @param policy     'heuristic' (default), 'cross_encoder' (NotImplemented),
 *                   or 'llm' (NotImplemented).
 * @param options    top_k_after_rerank (default 5); consumer_audience_tier.
 *
 * @returns          Top-K candidates sorted by re-rank score (highest first).
 *                   Each passage's `rerank_score` field is populated; the
 *                   original `rrf_score` is preserved unchanged.
 *
 * @throws           NotImplementedError when policy is 'cross_encoder' or 'llm'.
 */
export async function reRank(
  candidates: RetrievedPassage[],
  input: RetrieveInput,
  policy: ReRankPolicy = 'heuristic',
  options: ReRankOptions = {}
): Promise<RetrievedPassage[]> {
  switch (policy) {
    case 'heuristic':
      return heuristicReRank(candidates, input, options);
    case 'cross_encoder':
      throw new NotImplementedError(
        policy,
        'cross_encoder policy is reserved for Phase-2 production observation per D7 §"Cross-encoder upgrade path"'
      );
    case 'llm':
      throw new NotImplementedError(
        policy,
        'llm policy is reserved as a fallback if cross_encoder is operationally rejected per D7 §"LLM-as-reranker fallback"'
      );
    default: {
      // Exhaustiveness check
      const _exhaustive: never = policy;
      throw new NotImplementedError(_exhaustive as ReRankPolicy);
    }
  }
}

// =============================================================================
// INTERNAL — heuristic policy
// =============================================================================

function heuristicReRank(
  candidates: RetrievedPassage[],
  input: RetrieveInput,
  options: ReRankOptions
): RetrievedPassage[] {
  const top_k_after_rerank = options.top_k_after_rerank ?? 5;

  const scored = candidates.map((passage) => ({
    passage,
    rerank_score: computeHeuristicScore(passage, input, options),
  }));

  scored.sort((a, b) => b.rerank_score - a.rerank_score);

  return scored.slice(0, top_k_after_rerank).map(({ passage, rerank_score }) => ({
    ...passage,
    rerank_score,
  }));
}

/**
 * Compute the heuristic re-rank score for a single passage.
 * Multiplicative compounding per D7 §"Heuristic re-rank scoring formula".
 */
function computeHeuristicScore(
  passage: RetrievedPassage,
  input: RetrieveInput,
  options: ReRankOptions
): number {
  let score = passage.rrf_score;

  // -- Mechanism match: passage.canonical_mechanism contains any requested mechanism ID
  if (input.mechanism_filter && input.mechanism_filter.length > 0) {
    const matches = passage.canonical_mechanism.some((m) =>
      input.mechanism_filter!.includes(m)
    );
    if (matches) score *= MECHANISM_MATCH_BOOST;
  }

  // -- Passion / sub-passion match (most-specific wins; per worked example)
  if (input.sub_passion_filter !== undefined) {
    if (passage.sub_passion === input.sub_passion_filter) {
      score *= SUB_PASSION_MATCH_BOOST;
    }
    // If sub_passion_filter is set but passage.sub_passion doesn't match,
    // no passion-only boost — the more-specific filter has failed.
  } else if (input.passion_filter !== undefined) {
    if (passage.passion === input.passion_filter) {
      score *= PASSION_ONLY_MATCH_BOOST;
    }
  }

  // -- Passage-type match
  if (input.passage_type_filter && input.passage_type_filter.length > 0) {
    if (input.passage_type_filter.includes(passage.passage_type)) {
      score *= PASSAGE_TYPE_MATCH_BOOST;
    }
  }

  // -- Audience-tier match (only when consumer's tier is provided)
  if (
    options.consumer_audience_tier !== undefined &&
    passage.audience_tier === options.consumer_audience_tier
  ) {
    score *= AUDIENCE_TIER_MATCH_BOOST;
  }

  return score;
}

// =============================================================================
// EXPORTS for diagnostics / testing
// =============================================================================

export const HEURISTIC_MULTIPLIERS = Object.freeze({
  MECHANISM_MATCH_BOOST,
  SUB_PASSION_MATCH_BOOST,
  PASSION_ONLY_MATCH_BOOST,
  PASSAGE_TYPE_MATCH_BOOST,
  AUDIENCE_TIER_MATCH_BOOST,
});
