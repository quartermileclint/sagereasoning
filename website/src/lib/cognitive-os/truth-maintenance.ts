/**
 * truth-maintenance.ts — identifies stale conclusions when foundational claims
 * change (spec §4.1, Phase-1 component 6). Pure, deterministic, cycle-safe.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ SEMANTIC REUSE, NOT STRUCTURAL — the review's one added instruction (2026-09-09)
 *
 * `analyseLoopClosure` (in `src/app/api/accreditation/[agent_id]/loop-closure-gate.ts`)
 * is the nearest production-proven relative to this component. Its three semantics
 * are the right ones and are reused DELIBERATELY:
 *
 *   1. SUPERSESSION BY EXPLICIT REF LINK — a later item resolves an earlier one
 *      only by naming it. Adjacency, recency and inference never resolve anything.
 *   2. THE SAME-DEPTH RULE — a re-examination must be at rigour >= the original's.
 *      A cursory second look does not discharge a thorough first one.
 *   3. INDETERMINATE IS TREATED AS NOT RESOLVED — the conservative direction. If
 *      the rigour or the identity of an item cannot be established, it counts
 *      against the verdict, never for it.
 *
 * ⚠ BUT THE REUSE IS SEMANTIC, NOT STRUCTURAL. THIS FILE IMPORTS NOTHING FROM
 *   `loop-closure-gate.ts`, AND MUST NOT. The logic is implemented independently
 *   so the two systems remain separable: instruction constraint 1 — harness and
 *   Cognitive OS stay separate — "applies here at the implementation level, not
 *   only at the architectural level." Copy the semantics; do not import the
 *   implementation. (Pinned by the battery, which greps this file's own source
 *   for a forbidden import and fails if one appears.)
 *
 * The rigour vocabulary below is deliberately DIFFERENT from the harness's
 * quick/standard/deep depth tiers — same ordering semantics, separate scale — so
 * that a future session cannot "unify" them by importing one into the other
 * without noticing it is crossing the boundary.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { type NodeId } from './types'
import { type DependencyGraph } from './dependency-graph'

// ============================================================================
// §1  RIGOUR — the same-depth rule's scale, defined locally and independently
// ============================================================================

/** Weakest → strongest. Semantically parallel to the harness's quick/standard/
 *  deep, deliberately NOT the same identifiers and NOT imported from it. */
export const REVIEW_RIGOUR = ['cursory', 'standard', 'thorough'] as const

export type ReviewRigour = (typeof REVIEW_RIGOUR)[number]

const RIGOUR_RANK: Readonly<Record<ReviewRigour, number>> = Object.freeze({
  cursory: 1,
  standard: 2,
  thorough: 3,
})

// ============================================================================
// §2  INPUTS
// ============================================================================

/**
 * A downstream item threatened by an invalidation.
 *
 * `original_rigour: null` means the rigour at which the item was established is
 * NOT RECORDED. That is INDETERMINATE, not "cursory" and not "fine" — resolution
 * cannot be established for it, exactly as a pre-M5 chain lands in the loop
 * gate's `indeterminate` bucket rather than being waved through.
 */
export interface AffectedItem {
  readonly node_id: NodeId
  readonly original_rigour: ReviewRigour | null
}

/**
 * A re-examination offered as resolving something.
 *
 * `supersedes_ref` is the EXPLICIT ref link (semantic 1). A re-examination that
 * names nothing resolves nothing, however thorough it is.
 * `rigour: null` means the re-examination's own rigour is unrecorded ⇒ it cannot
 * satisfy the same-depth rule and therefore cannot resolve anything (semantic 3).
 * `seq` is the logical sequence number; a resolution must come strictly AFTER the
 * item it resolves, which is why the store's `seq` is authoritative ordering.
 */
export interface ReExamination {
  readonly re_examination_id: string
  readonly supersedes_ref: NodeId | null
  readonly rigour: ReviewRigour | null
  readonly seq: number
}

export type ItemResolution = 'resolved' | 'unresolved' | 'indeterminate'

export interface StalenessAnalysis {
  /** `clean` ONLY when nothing is unresolved AND nothing is indeterminate. */
  readonly verdict: 'clean' | 'unresolved' | 'no_dependents'
  readonly affected: readonly NodeId[]
  readonly resolved: number
  readonly unresolved: number
  readonly indeterminate: number
  readonly perItem: Readonly<Record<NodeId, ItemResolution>>
}

// ============================================================================
// §3  THE ANALYSIS
// ============================================================================

/**
 * Everything downstream of an invalidated node — transitively.
 *
 * "The system must not silently retain downstream conclusions whose dependencies
 * have been invalidated" (spec §4.1). This is the identification half; the
 * resolution half is `analyseResolution`.
 */
export function identifyAffected(
  invalidatedNodeId: NodeId,
  graph: DependencyGraph,
): readonly NodeId[] {
  return graph.transitiveDependents(invalidatedNodeId)
}

/**
 * Resolution status of each affected item, applying the three reused semantics.
 *
 * Per item:
 *   - original rigour unrecorded            → indeterminate  (semantic 3)
 *   - a LATER re-examination that EXPLICITLY names it (semantic 1) at rigour
 *     >= the original (semantic 2)          → resolved
 *   - otherwise                             → unresolved
 *
 * `atSeq` is the item's own establishing sequence number; a re-examination must
 * come strictly after it. Items with no recorded seq are treated as seq 0, which
 * is permissive on ORDER only — never on ref-link or rigour.
 */
export function analyseResolution(
  affected: readonly AffectedItem[],
  reExaminations: readonly ReExamination[],
  atSeq: Readonly<Record<NodeId, number>> = {},
): StalenessAnalysis {
  if (affected.length === 0) {
    return Object.freeze({
      verdict: 'no_dependents' as const,
      affected: Object.freeze([]),
      resolved: 0,
      unresolved: 0,
      indeterminate: 0,
      perItem: Object.freeze({}),
    })
  }

  const perItem: Record<NodeId, ItemResolution> = {}
  let resolved = 0
  let unresolved = 0
  let indeterminate = 0

  for (const item of affected) {
    // Semantic 3 — an item whose original rigour is unrecorded cannot have its
    // resolution established. It counts AGAINST the verdict.
    if (item.original_rigour === null) {
      perItem[item.node_id] = 'indeterminate'
      indeterminate++
      continue
    }

    const requiredRank = RIGOUR_RANK[item.original_rigour]
    const establishedAt = atSeq[item.node_id] ?? 0

    const isResolved = reExaminations.some((re) => {
      // Semantic 1 — EXPLICIT ref link. No inference, no adjacency, no recency.
      if (re.supersedes_ref !== item.node_id) return false
      // Order — a resolution must come after the thing it resolves.
      if (re.seq <= establishedAt) return false
      // Semantic 3 — an unrecorded rigour cannot satisfy the same-depth rule.
      if (re.rigour === null) return false
      // Semantic 2 — the same-depth rule.
      return RIGOUR_RANK[re.rigour] >= requiredRank
    })

    if (isResolved) {
      perItem[item.node_id] = 'resolved'
      resolved++
    } else {
      perItem[item.node_id] = 'unresolved'
      unresolved++
    }
  }

  return Object.freeze({
    // Conservative roll-up: indeterminate counts against, exactly as the loop
    // gate's verdict is `unclosed` unless open === 0 AND indeterminate === 0.
    verdict: unresolved === 0 && indeterminate === 0 ? ('clean' as const) : ('unresolved' as const),
    affected: Object.freeze(affected.map((a) => a.node_id)),
    resolved,
    unresolved,
    indeterminate,
    perItem: Object.freeze(perItem),
  })
}

/** Identify + analyse in one call — the ordinary path. */
export function analyseStaleness(
  invalidatedNodeId: NodeId,
  graph: DependencyGraph,
  rigourOf: (nodeId: NodeId) => ReviewRigour | null,
  reExaminations: readonly ReExamination[],
  atSeq: Readonly<Record<NodeId, number>> = {},
): StalenessAnalysis {
  const affectedIds = identifyAffected(invalidatedNodeId, graph)
  const affected: AffectedItem[] = affectedIds.map((node_id) => ({
    node_id,
    original_rigour: rigourOf(node_id),
  }))
  return analyseResolution(affected, reExaminations, atSeq)
}
