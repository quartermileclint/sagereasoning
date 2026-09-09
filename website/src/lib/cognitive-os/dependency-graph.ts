/**
 * dependency-graph.ts — which claims and decisions depend on which other claims
 * (spec §4.1, Phase-1 component 5). Pure, deterministic, cycle-safe.
 *
 * Tracks dependencies between evidence, claims, assumptions, derived claims,
 * decisions and actions, and answers the question the TruthMaintenanceSystem
 * needs: if THIS is invalidated, what downstream of it is affected?
 *
 * ⚠ C7 (Q10) — THE PHASE-6 COLLISION, DESIGNED AGAINST HERE RATHER THAN LATER.
 *
 * Phase 6 would route environments dynamically on `epistemic_debt_score` and
 * siblings. If an agent could influence the score that routes it, that is a
 * gameable scorer inside an optimisation loop — GS-CYB-1 arriving from the other
 * end, while weights are BLOCKED.
 *
 * This graph therefore holds NO score field of any kind, and exposes NO setter
 * for one. Routing-relevant figures are DERIVED from graph structure on demand
 * (see `unresolvedDependents`), so there is nothing for an agent to write. Paired
 * with `permissions.ts`, where `routing_score` carries no write verb for any
 * scope, an agent's write permissions cannot include the scores that govern its
 * own routing. "This is a Phase-1 design constraint, not a Phase-6 problem."
 */

import { type NodeId } from './types'

export const NODE_KINDS = [
  'evidence',
  'claim',
  'assumption',
  'derived_claim',
  'decision',
  'action',
] as const

export type NodeKind = (typeof NODE_KINDS)[number]

export interface DependencyNode {
  readonly node_id: NodeId
  readonly kind: NodeKind
  /** The claim/decision/evidence this node stands for, when it has one. */
  readonly ref_id?: string
}

/**
 * An edge means: `from` SUPPORTS `to`. Invalidating `from` therefore threatens
 * `to`. Traversal for impact analysis follows edges FORWARD (support → supported).
 */
export interface DependencyEdge {
  readonly from: NodeId
  readonly to: NodeId
}

export class DependencyGraph {
  private readonly nodes = new Map<NodeId, DependencyNode>()
  /** from → set of `to` (what this node supports). */
  private readonly forward = new Map<NodeId, Set<NodeId>>()
  /** to → set of `from` (what supports this node). */
  private readonly backward = new Map<NodeId, Set<NodeId>>()

  addNode(node: DependencyNode): void {
    this.nodes.set(node.node_id, Object.freeze({ ...node }))
    if (!this.forward.has(node.node_id)) this.forward.set(node.node_id, new Set())
    if (!this.backward.has(node.node_id)) this.backward.set(node.node_id, new Set())
  }

  /** Record that `from` supports `to`. Both nodes must already exist — a
   *  dependency on an unknown node would make impact analysis silently
   *  incomplete, which is the failure mode this whole component exists to
   *  prevent ("must not silently retain downstream conclusions"). */
  addEdge(from: NodeId, to: NodeId): void {
    if (!this.nodes.has(from)) throw new Error(`dependency graph: unknown node ${from}`)
    if (!this.nodes.has(to)) throw new Error(`dependency graph: unknown node ${to}`)
    this.forward.get(from)!.add(to)
    this.backward.get(to)!.add(from)
  }

  getNode(id: NodeId): DependencyNode | undefined {
    return this.nodes.get(id)
  }

  /** Node ids in insertion order. */
  allNodes(): readonly DependencyNode[] {
    return Object.freeze([...this.nodes.values()])
  }

  /** Direct dependents: what `id` immediately supports. */
  directDependents(id: NodeId): readonly NodeId[] {
    return Object.freeze([...(this.forward.get(id) ?? [])])
  }

  /** Direct supports: what immediately supports `id`. */
  directSupports(id: NodeId): readonly NodeId[] {
    return Object.freeze([...(this.backward.get(id) ?? [])])
  }

  /**
   * TRANSITIVE dependents of `id`, breadth-first, EXCLUDING `id` itself.
   *
   * Cycle-safe via a visited set: a dependency cycle yields each node once rather
   * than looping. Deterministic order (insertion order of edges), so the critical
   * test's expectations are stable.
   */
  transitiveDependents(id: NodeId): readonly NodeId[] {
    const out: NodeId[] = []
    const seen = new Set<NodeId>([id])
    const queue: NodeId[] = [...(this.forward.get(id) ?? [])]
    while (queue.length > 0) {
      const next = queue.shift()!
      if (seen.has(next)) continue
      seen.add(next)
      out.push(next)
      for (const child of this.forward.get(next) ?? []) {
        if (!seen.has(child)) queue.push(child)
      }
    }
    return Object.freeze(out)
  }

  /** TRANSITIVE supports of `id` — the full evidential basis beneath it. */
  transitiveSupports(id: NodeId): readonly NodeId[] {
    const out: NodeId[] = []
    const seen = new Set<NodeId>([id])
    const queue: NodeId[] = [...(this.backward.get(id) ?? [])]
    while (queue.length > 0) {
      const next = queue.shift()!
      if (seen.has(next)) continue
      seen.add(next)
      out.push(next)
      for (const parent of this.backward.get(next) ?? []) {
        if (!seen.has(parent)) queue.push(parent)
      }
    }
    return Object.freeze(out)
  }

  /**
   * Dependents of `id` that are still UNRESOLVED, given a caller-supplied
   * resolution predicate.
   *
   * DERIVED, never stored — this is the C7 shape: a routing-relevant figure is
   * computed from structure at read time, so there is no field an agent could
   * write to influence its own routing.
   */
  unresolvedDependents(
    id: NodeId,
    isResolved: (nodeId: NodeId) => boolean,
  ): readonly NodeId[] {
    return Object.freeze(this.transitiveDependents(id).filter((n) => !isResolved(n)))
  }

  /** Nodes of a given kind, insertion order. */
  nodesOfKind(kind: NodeKind): readonly DependencyNode[] {
    return Object.freeze([...this.nodes.values()].filter((n) => n.kind === kind))
  }
}
