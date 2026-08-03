/**
 * stoa-shelf.ts — the passive shelf's pure matcher (ST3).
 *
 * Constraint #5 (Q2a, sharpened — binding): the shelf shows declarations
 * relevant to WHAT THE PRACTITIONER THEMSELVES DECLARED — "derived from the
 * practitioner's own declared content, not from their browsing behaviour,
 * engagement patterns, or anything the platform has observed about them. The
 * shelf shows what is relevant to what they said they are. It does not show
 * what the platform has inferred they might want."
 *
 * STRUCTURAL ENCODING of that ruling:
 *   - computeStoaShelf is PURE and takes ONLY declared entry content (the
 *     practitioner's own StoaEntry + the candidate StoaEntry list). No
 *     request, no session, no history, no analytics value can reach it — the
 *     signature admits none (boundary battery §H pins the inputs and
 *     mutation-verifies).
 *   - Matching is deterministic: shared domain tags, or term overlap between
 *     what one seeks and what the other brings (both directions). No LLM, no
 *     behavioural signal, no stored model.
 *   - The shelf FILTERS, it never RANKS: results preserve the candidates'
 *     given order (declaration recency, #8). Relevance is a yes/no door, not
 *     a score — scoring the shelf would re-introduce evaluative ordering
 *     (#20) by the side entrance.
 *   - Shown only in the practitioner's own view; no notification ever fires
 *     from a match (#7 — enforced by there being no side effect here at all).
 *
 * ZERO external imports (intra-stoa type import only).
 */

import type { StoaEntry } from './stoa-store'

/** Results cap — a shelf, not a feed. */
export const STOA_SHELF_MAX = 5

/** Minimum shared meaningful terms for a cross-field text match. */
const TERM_OVERLAP_MIN = 2

/** Minimum term length considered meaningful (after lowering + stripping). */
const TERM_MIN_LEN = 4

/** Common words excluded from term matching (English function words + the
 *  declaration form's own scaffolding vocabulary). */
const STOPWORDS = new Set([
  'that', 'this', 'with', 'from', 'have', 'what', 'when', 'where', 'their',
  'them', 'they', 'about', 'would', 'could', 'should', 'been', 'being',
  'other', 'others', 'into', 'more', 'some', 'such', 'than', 'then', 'there',
  'these', 'those', 'were', 'will', 'your', 'yours', 'looking', 'seeking',
  'seek', 'offer', 'offering', 'bring', 'bringing', 'help', 'want', 'like',
  'work', 'working', 'someone', 'anyone', 'people', 'practitioner',
  'practitioners', 'practice',
])

/** Tokenize a declared free-text field into meaningful lowercase terms. */
function terms(text: string | null): Set<string> {
  if (!text) return new Set()
  const out = new Set<string>()
  for (const raw of text.toLowerCase().split(/[^a-z0-9-]+/)) {
    const t = raw.replace(/^-+|-+$/g, '')
    if (t.length >= TERM_MIN_LEN && !STOPWORDS.has(t)) out.add(t)
  }
  return out
}

function overlapCount(a: Set<string>, b: Set<string>): number {
  let n = 0
  for (const t of a) if (b.has(t)) n++
  return n
}

/** Declared-content relevance: shared domain tag, OR ≥TERM_OVERLAP_MIN
 *  meaningful terms between one side's seek and the other's bring (either
 *  direction). Deterministic; yes/no only. */
export function isShelfRelevant(own: StoaEntry, candidate: StoaEntry): boolean {
  // Shared domain tag (#9/#10 vocabulary — exact tag match).
  const candidateTags = new Set(candidate.tags)
  if (own.tags.some((t) => candidateTags.has(t))) return true

  // Cross-field term overlap: what I seek ↔ what they bring, and inverse.
  const ownSeek = terms(own.whatISeek)
  const ownBring = terms(own.whatIBring)
  if (overlapCount(ownSeek, terms(candidate.whatIBring)) >= TERM_OVERLAP_MIN) return true
  if (overlapCount(ownBring, terms(candidate.whatISeek)) >= TERM_OVERLAP_MIN) return true
  return false
}

/**
 * Compute the passive shelf: the candidates (already in declaration-recency
 * order from the store, #8) filtered to declared-content relevance, own entry
 * excluded, capped. ORDER IS PRESERVED — never re-sorted, never scored.
 */
export function computeStoaShelf(own: StoaEntry, candidates: StoaEntry[]): StoaEntry[] {
  const shelf: StoaEntry[] = []
  for (const c of candidates) {
    if (c.id === own.id) continue
    if (isShelfRelevant(own, c)) {
      shelf.push(c)
      if (shelf.length >= STOA_SHELF_MAX) break
    }
  }
  return shelf
}
