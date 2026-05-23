/**
 * sage-assent-tree-search-adapter.ts — composition surface for tree-search algorithms
 * (MCTS / BFS / Tree-of-Thoughts / beam search) over the substrate.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-16, this session). New code,
 * imported by no route — no production exposure this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/sage-assent-items-1-3-design.md §"Decision C — Tree-search composition"
 *     (Adopted 2026-05-16; the spec this module implements).
 *   - /adopted/substrate-modes/sage-assent-wrapper-spec.md
 *     §"Tree-search composition" (added 2026-05-16 in the same build — the
 *     developer-facing documentation surface).
 *   - /operations/decision-log.md — D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16
 *     (the design lock); D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16
 *     (this build).
 *   - /manifest.md §R4 (IP boundary) / §AC8 (translation-sandwich substrate) /
 *     §PR15 (Anthropic-canonical-primitive consult).
 *
 * WHAT THIS MODULE IS
 *
 * Tree-search algorithms (MCTS, BFS, beam search, Tree-of-Thoughts) need a
 * PER-NODE EVALUATOR — a function that takes a candidate node's substrate
 * input and returns an EvaluatedAction. The substrate already provides this
 * contract via:
 *
 *   callSubstrate(layer1Input) → Layer2Assessment
 *   bridge(layer2Assessment, bridgeContext) → EvaluatedAction
 *
 * This module's job is one thin convenience: combine the two so the agent's
 * tree-search framework can hand a single function to its search loop. It is
 * NOT a tree-search implementation — the search algorithm stays AGENT-SIDE or
 * FRAMEWORK-SIDE (PR15: we do not reimplement what's already available).
 *
 * PR15 — Anthropic-canonical-primitive consult.
 *   Multi-agent orchestration (Anthropic Managed Agents, Multiagent sessions —
 *   public beta) is the runtime substrate for tree-LIKE behaviour over multiple
 *   agent contexts. This module is for IN-PROCESS tree search (one agent's
 *   context exploring siblings). The Wrapper spec's §"Tree-search composition"
 *   section spells out which to use when. The two are complementary, not
 *   competing. See D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15 for the
 *   prior PR15 consult outcome (retained).
 *
 * PURITY
 *
 *   createSubstrateEvaluator — pure factory. Returns an async function whose
 *   I/O surface is determined by the caller's callSubstrate (typically an LLM
 *   call). The factory itself reads no clock and performs no I/O.
 *
 * COMPLIANCE
 *
 *   - R4: this module emits EvaluatedActions — already an R4-respecting shape.
 *     The bridge stays the single source of EvaluatedAction; this module just
 *     composes it with the substrate call.
 *   - AC8: sits in /website/src/lib/substrate/.
 *   - PR1: PR1 is satisfied by the bridge + wrapper + iteration patterns,
 *     which are the foundations this builds on. The adapter is a thin
 *     composition surface.
 *   - PR2: __tests__/sage-assent-tree-search-adapter.test.ts invokes
 *     createSubstrateEvaluator in the same session this module is written.
 *   - PR4: N/A — no LLM call inside the module. The caller's callSubstrate
 *     may make one; that selection is the caller's concern (constraints.ts
 *     enforces model selection at the substrate call site).
 *   - PR6: NOT engaged — no distress-classifier / Zone 2 / Zone 3 surface.
 *   - PR15: justified above.
 */

import {
  mapLayer2AssessmentToEvaluatedAction,
  type BridgeContext,
  type EvaluatedAction,
} from './sage-assent-bridge'

import type { Layer1Schema } from '../translation-sandwich/layer1-extractor'
import type { Layer2Assessment } from '../translation-sandwich/layer2-mechanisms'

/**
 * A per-node substrate caller — the agent supplies this. Typically performs
 * the Layer 1 → Layer 2 substrate call (one LLM call inside Layer 2's
 * mechanism application, plus any agent-side framing).
 */
export type SubstrateCaller = (input: Layer1Schema) => Promise<Layer2Assessment>

/**
 * A per-node BridgeContext provider — the agent supplies this. Called once
 * per node to supply the four wrapper-owned fields Layer2Assessment cannot
 * carry (agent_id / evaluated_at / skill_id / signature) plus Decision A's
 * candidates_considered. The provider can encode the search algorithm's
 * understanding of the slate size (e.g., for BFS / beam, it can use the
 * level's expansion count; for MCTS, the simulation's branching factor).
 */
export type BridgeContextProvider = (nodeInput: Layer1Schema) => BridgeContext

/**
 * A per-node evaluator suitable for handing to a tree-search algorithm.
 * Returns the EvaluatedAction the algorithm's node-comparator should consume.
 */
export type SubstrateEvaluator = (
  nodeInput: Layer1Schema
) => Promise<EvaluatedAction>

/**
 * Returns a per-node evaluator function suitable for handing to a tree-search
 * algorithm (MCTS / BFS / Tree-of-Thoughts / beam search).
 *
 * The agent's framework drives the search; the substrate evaluates each
 * candidate node via this returned function. The framework decides:
 *   - the node-comparator (which EvaluatedAction field(s) to rank by)
 *   - the branching strategy (which siblings to expand)
 *   - the termination condition (depth / time / score plateau)
 *
 * This module decides nothing about search policy.
 *
 * Per node, the returned evaluator:
 *   1. Calls callSubstrate(nodeInput) to obtain the Layer2Assessment
 *   2. Calls bridgeContextProvider(nodeInput) to build the BridgeContext
 *   3. Maps via mapLayer2AssessmentToEvaluatedAction
 *
 * The bridge is the only place EvaluatedAction is constructed in the wrapper
 * (PR1's single source of truth); this module preserves that invariant.
 *
 * @param callSubstrate          The agent's substrate caller.
 * @param bridgeContextProvider  The per-node BridgeContext supplier.
 * @returns                      A function the tree-search algorithm calls per node.
 */
export function createSubstrateEvaluator(
  callSubstrate: SubstrateCaller,
  bridgeContextProvider: BridgeContextProvider
): SubstrateEvaluator {
  return async (nodeInput: Layer1Schema): Promise<EvaluatedAction> => {
    const assessment = await callSubstrate(nodeInput)
    const context = bridgeContextProvider(nodeInput)
    return mapLayer2AssessmentToEvaluatedAction(assessment, context)
  }
}
