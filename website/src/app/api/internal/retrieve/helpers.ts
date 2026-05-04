/**
 * helpers.ts — pure functions used by the /api/internal/retrieve route.
 *
 * Extracted to a sibling file so the verification harness at
 * /website/scripts/verify-internal-retrieve.ts can import + test them
 * independently of the Next.js HTTP layer.
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - /website/src/app/api/internal/retrieve/route.ts (the consumer)
 *   - /operations/decision-log.md D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04
 *     §"Open questions / findings from the run" item 1 (BM25 reformulation rationale)
 */

import type { PassageType } from '@/lib/rag'
import { validateTextLength, TEXT_LIMITS } from '@/lib/security'

// =============================================================================
// CONSTANTS
// =============================================================================

/** Allowed PassageType values (mirror of D6 PassageType union). */
export const VALID_PASSAGE_TYPES: PassageType[] = [
  'mechanism',
  'canonical_line',
  'example',
  'focus_question_stem',
  'scoring_rule',
]

/** Only 'heuristic' is exposed at the route layer. cross_encoder + llm are
 *  reserved per D7 §"Per-mechanism re-rank policy". */
export const VALID_RERANK_POLICIES = ['heuristic'] as const
export type ExposedReRankPolicy = (typeof VALID_RERANK_POLICIES)[number]

// =============================================================================
// REQUEST SHAPE
// =============================================================================

export interface RetrieveRouteRequest {
  query: string
  mechanism_filter?: string[]
  passion_filter?: string
  sub_passion_filter?: string
  passage_type_filter?: PassageType[]
  trigger_condition_filter?: string
  intake_tier_filter?: 1 | 2 | 3
  top_k?: number
  top_k_after_rerank?: number
  rerank_policy?: ExposedReRankPolicy
  trace_enabled?: boolean
}

export type ValidationResult =
  | { ok: true; data: RetrieveRouteRequest }
  | { ok: false; error: string; details?: string[] }

// =============================================================================
// BM25 QUERY REFORMULATION
// =============================================================================

/**
 * Rewrites "philodoxia false judgement reputation" as
 * "philodoxia OR false OR judgement OR reputation" so websearch_to_tsquery
 * (which defaults to AND across terms) returns matches against any single
 * term rather than requiring all of them.
 *
 * Per D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04 §"Open questions / findings"
 * item 1: BM25 returned 0 results across all 5 multi-term test queries
 * because short corpus chunks rarely contain ALL terms. This helper closes
 * that gap.
 *
 * Trade-off: the reformulated query is also passed to the vector channel
 * (D6's contract has a single `query` parameter). The embedding model treats
 * "OR" as a common stop-word; semantic similarity is not measurably affected.
 *
 * Tokens shorter than 2 chars are dropped. Punctuation is stripped (lowercased
 * letters, digits, underscore, and hyphen kept) to avoid websearch_to_tsquery
 * parser surprises.
 */
export function toBm25OrShape(query: string): string {
  const tokens = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2)
  if (tokens.length === 0) return query
  return tokens.join(' OR ')
}

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

/**
 * Validate the JSON request body. Returns a discriminated union so callers
 * can branch cleanly. Field-by-field checks; rejects unknown rerank_policy
 * values explicitly so the caller can't sneak in cross_encoder / llm and
 * hit a NotImplementedError downstream.
 */
export function validateRequest(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' }
  }
  const b = body as Record<string, unknown>
  const errors: string[] = []

  // query — required, non-empty string
  if (typeof b.query !== 'string') {
    errors.push('`query` must be a string')
  } else if (b.query.trim().length === 0) {
    errors.push('`query` must not be empty')
  } else {
    const lengthError = validateTextLength(b.query, 'query', TEXT_LIMITS.short)
    if (lengthError) errors.push(lengthError)
  }

  // mechanism_filter — optional array of strings
  if (b.mechanism_filter !== undefined) {
    if (
      !Array.isArray(b.mechanism_filter) ||
      !b.mechanism_filter.every((m) => typeof m === 'string')
    ) {
      errors.push('`mechanism_filter` must be an array of strings')
    }
  }

  // passion_filter — optional string
  if (b.passion_filter !== undefined && typeof b.passion_filter !== 'string') {
    errors.push('`passion_filter` must be a string')
  }

  // sub_passion_filter — optional string
  if (b.sub_passion_filter !== undefined && typeof b.sub_passion_filter !== 'string') {
    errors.push('`sub_passion_filter` must be a string')
  }

  // passage_type_filter — optional array of PassageType
  if (b.passage_type_filter !== undefined) {
    if (!Array.isArray(b.passage_type_filter)) {
      errors.push('`passage_type_filter` must be an array')
    } else {
      const invalid = b.passage_type_filter.filter(
        (t) => typeof t !== 'string' || !VALID_PASSAGE_TYPES.includes(t as PassageType)
      )
      if (invalid.length > 0) {
        errors.push(
          `\`passage_type_filter\` contains invalid values: ${invalid
            .map((x) => JSON.stringify(x))
            .join(', ')}. Allowed: ${VALID_PASSAGE_TYPES.join(', ')}`
        )
      }
    }
  }

  // trigger_condition_filter — optional string
  if (
    b.trigger_condition_filter !== undefined &&
    typeof b.trigger_condition_filter !== 'string'
  ) {
    errors.push('`trigger_condition_filter` must be a string')
  }

  // intake_tier_filter — optional 1 | 2 | 3
  if (b.intake_tier_filter !== undefined) {
    if (b.intake_tier_filter !== 1 && b.intake_tier_filter !== 2 && b.intake_tier_filter !== 3) {
      errors.push('`intake_tier_filter` must be 1, 2, or 3')
    }
  }

  // top_k — optional integer 1..100
  if (b.top_k !== undefined) {
    if (typeof b.top_k !== 'number' || !Number.isInteger(b.top_k) || b.top_k < 1 || b.top_k > 100) {
      errors.push('`top_k` must be an integer between 1 and 100')
    }
  }

  // top_k_after_rerank — optional integer 1..50
  if (b.top_k_after_rerank !== undefined) {
    if (
      typeof b.top_k_after_rerank !== 'number' ||
      !Number.isInteger(b.top_k_after_rerank) ||
      b.top_k_after_rerank < 1 ||
      b.top_k_after_rerank > 50
    ) {
      errors.push('`top_k_after_rerank` must be an integer between 1 and 50')
    }
  }

  // rerank_policy — optional 'heuristic' only
  if (b.rerank_policy !== undefined) {
    if (
      typeof b.rerank_policy !== 'string' ||
      !VALID_RERANK_POLICIES.includes(b.rerank_policy as ExposedReRankPolicy)
    ) {
      errors.push(
        `\`rerank_policy\` must be one of: ${VALID_RERANK_POLICIES.join(', ')}. ` +
          `cross_encoder + llm are reserved per D7 §"Per-mechanism re-rank policy".`
      )
    }
  }

  // trace_enabled — optional boolean
  if (b.trace_enabled !== undefined && typeof b.trace_enabled !== 'boolean') {
    errors.push('`trace_enabled` must be a boolean')
  }

  if (errors.length > 0) {
    return { ok: false, error: 'Invalid request', details: errors }
  }

  return { ok: true, data: b as unknown as RetrieveRouteRequest }
}
