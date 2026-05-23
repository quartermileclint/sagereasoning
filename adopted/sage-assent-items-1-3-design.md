# Sage Assent Wrapper — Items 1, 2, 3 Design

**Status:** Adopted 2026-05-16 under `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16`. **Implementation status:** Designed (per 0a vocabulary) — the four decisions below are specified, not built; the items 1–3 build session is the next sub-session in the post-6b arc.
**Stream:** founder.
**Governs:** The build spec for the items 1–3 build session — `code-elevated` risk classification expected (additive `EvaluatedAction` / `BridgeContext` / `Layer1Schema` schema changes; new persistent slot on `CarriedProfile`; new helper file; spec section additions). The four decisions below MUST be implemented as specified; the build session has discretion on file paths, helper naming, and test structure within those constraints.
**Does not govern:** the kathekon-aligned alternative (steps 5–6 of the post-6b arc — separate design pass); the Layer 1 asked-question multiple-choice (own design pass, sequenced for the onboarding-framework); the write-path into `agent_accreditation` (step 7); A10 (per-agent credentials).
**Sequencing:** step 2 of 8 in the post-6b arc per `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md`. Predecessor: 6b (`D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16` — every Sage Assent Wrapper component Verified end-to-end). Successor: items 1–3 build session.

---

## Scope

**In scope (this design):** items 1, 2, 3 from the brainstorm enhancement arc. Four locked design decisions:
- **A** — `deliberation_breadth` signal (item 1)
- **B** — `carried_candidates` slot (item 2 — the live-candidates carry, the brainstorm-thread-5-finding-1B gap)
- **C** — tree-search composition deliverable (item 2 — the per-node evaluator contract)
- **D** — top-K retention pattern (item 3)

**Out of scope:** code; the kathekon-aligned alternative; Layer 1 multiple-choice; the write-path; A10; the trajectory-enriched hand-back report (the report consumes these decisions; the report itself is step 4 of the post-6b arc).

---

## Decision A — `deliberation_breadth`

### Why

The carried profile records the trajectory of an agent's committed reasoning over time, but it currently drops a meaningful R0-relevant signal: whether each committed action was reached by intuition (one substrate call), deliberation (the agent considered alternatives but committed to one), or multi-branch deliberation (the agent ran several substrate consultations and picked among them). An agent that habitually intuits is at a different developmental position than one that habitually deliberates — recovering this signal lets the trajectory be honest about deliberation quality, not just outcome quality.

### Structural constraint

`Layer2Assessment` is **idempotent by design** (per `atl-bridge.ts` module header — no clock, no identity, no signature inside; same `Layer1Schema` in → byte-identical assessment out). The substrate doesn't know whether the wrapper called it once or N times for the same decision; only the wrapper does. So `deliberation_breadth` cannot live on `Layer2Assessment` without breaking that property. It lives on `EvaluatedAction`, supplied via `BridgeContext` — which already carries the four wrapper-owned fields the substrate cannot supply (`agent_id`, `evaluated_at`, `skill_id`, `signature`). This becomes the fifth `BridgeContext` field.

### Field shape

```ts
// BridgeContext extension (atl-bridge.ts)
export interface BridgeContext {
  agent_id: string
  evaluated_at: string
  skill_id: string
  signature: string
  candidates_considered: number       // NEW — wrapper-supplied, gaming-resistant
}

// EvaluatedAction extension (trust-layer/types/evaluation.ts)
export type EvaluatedAction = {
  // … existing fields …
  readonly candidates_considered: number   // NEW
}

// New enum (trust-layer/types/evaluation.ts)
export type DeliberationBreadth =
  | 'intuited'
  | 'deliberated'
  | 'multi_branch_deliberated'

// Aggregation-time derivation (window-aggregator.ts or sibling)
// N=1 → intuited; N=2 → deliberated; N≥3 → multi_branch_deliberated
// Thresholds tunable later without data migration — the number is the source of truth.
```

### Wrapper supplier

- `runSequentialStep` (Pattern 1): supplies `candidates_considered: 1`.
- `accumulateChosen` (Pattern 2): supplies `candidates_considered: candidates.length`. The wrapper KNOWS the slate size of the parallel evaluation from which the chosen candidate was selected.
- `runOrchestrationStep` (Pattern 3): supplies `candidates_considered: 1` for the orchestrator's own step (its commitment is one decision); peer agents' breadths are carried as their `AccreditationPayload.typical_deliberation_breadth` via `peer_agent_assessments`.

No agent-declared fallback. The wrapper is the sole source.

### WindowSnapshot aggregation

`WindowSnapshot` (in `trust-layer/types/evaluation.ts`) gains two fields, mirroring the existing `proximity_distribution` / `typical_proximity` pattern:

```ts
readonly deliberation_breadth_distribution: Record<DeliberationBreadth, number>
readonly typical_deliberation_breadth: DeliberationBreadth
```

`typical_deliberation_breadth` follows the same `typical_proximity_threshold` convention (most common qualifying level). The window aggregator (`window-aggregator.ts`) derives the enum per-action from `candidates_considered`, accumulates the distribution, and computes `typical_*`.

### Badge persistence

`AccreditationRecord` (in `trust-layer/types/accreditation.ts`) gains `typical_deliberation_breadth: DeliberationBreadth`. `AccreditationPayload` (the R4-compliant public subset) gains the same field. The Supabase `agent_accreditation` table gains one column (`typical_deliberation_breadth text not null`) — additive schema migration, idempotent. Existing rows: the 6b deployment seeded none; the items 1–3 build session ships the column with a default and the migration is empty-table-safe.

R4 boundary: only `typical_deliberation_breadth` (the qualitative bucket) crosses to the payload. The raw `candidates_considered` counts stay internal to `EvaluatedAction`. The N-thresholds stay engine-private.

R18c interoperability: the payload version increments by one short field, additively. Third-party verifiers that don't parse the new field are unaffected.

---

## Decision B — `carried_candidates`

### Why

Pattern 2's founder-closed open question 4 (atl-iteration-patterns.ts) holds: "only the chosen candidate feeds the carried profile" — because the carried profile is the record of **committed** reasoning. But this leaves a real gap. When the agent committed to one of N candidates, the other N−1 disappear. Two use cases want them carried:

1. **Compare against new candidates in the next round.** The agent has already paid the substrate cost on some options; carrying them forward avoids re-paying it.
2. **Revisit if the chosen one fails downstream.** If execution shows the committed action was wrong, the agent can re-rank rejected siblings instead of restarting deliberation.

The cleanest model treats this as a separate working-set slot, distinct from the committed-action accumulation — preserving the founder-elected committed-record semantics while giving the wrapper somewhere to put the unchosen-but-still-live candidates.

### Field shape

```ts
// New type (atl-wrapper.ts or atl-iteration-patterns.ts — build-session decision)
export interface CarriedCandidate {
  readonly layer1_input: Layer1Schema       // the substrate input that produced the assessment
  readonly layer2_assessment: Layer2Assessment  // the substrate's response
  readonly rank: number                      // 1-based rank from the parallel evaluation that surfaced this candidate
  readonly considered_at: string             // ISO 8601 timestamp from the parallel evaluation
}

// CarriedProfile extension (atl-wrapper.ts)
export interface CarriedProfile {
  // … existing fields (agent_id, evaluated_actions, accreditation_record, window_config, etc.) …
  readonly carried_candidates: readonly CarriedCandidate[]   // NEW — persistent slot, top-K capped
}
```

Layer 3 rendering is omitted from the carry — `renderAgentMode(layer1_input + layer2_assessment)` re-derives it deterministically (pure function, no LLM call). Avoids bloat.

### Persistence + pruning

The slot is **persistent across iterations** on `CarriedProfile`. Top-K capped (K from Decision D). When `evaluateInParallel` surfaces N candidates and `accumulateChosen` selects one, the N−1 unchosen candidates are added to `carried_candidates`. If the slot then exceeds K, `pruneToTopK` (Decision D helper) reduces it.

The committed-action accumulation (`evaluated_actions[]`) is unaffected — `carried_candidates` is a separate slot. Grade transitions read `evaluated_actions[]`; `carried_candidates` does NOT feed grade.

### Layer 1 implication

`Layer1Schema` gains a fifth optional wrapper-populated field, alongside `carried_profile` / `peer_agent_assessments` / `objective_function_declaration` / `profile_provenance`:

```ts
readonly carried_candidates: CarriedCandidate[] | null   // NEW — the agent's working set
```

Optional (nullable) → additive + backward-compatible. **This is a versioned change to the open Layer 1 contract.** The items 1–3 build session bumps the Layer 1 schema version, records the bump in its session close, and Rule A (licensing gate) sees the bump before the open-source release of the Layer 1 reference distribution. No separate gate session needed.

---

## Decision C — Tree-search composition

### Why

An agent developer who wants to compose the substrate with a tree-search algorithm (MCTS, BFS, beam search, Tree-of-Thoughts) currently has no documented contract for what the per-node evaluation interface looks like or how to wire it. PR15 frames this: the Sage Assent is the per-node evaluator; tree search stays agent-side or framework-side; we do not reimplement tree search inside the substrate. With Decisions A + B applied, `Layer1Schema` already carries everything a node needs to pass through — what's missing is the doc + ergonomic surface.

### Helper

```ts
// atl-tree-search-adapter.ts (new file)

/**
 * Returns a per-node evaluator function suitable for handing to a tree-search
 * algorithm (MCTS / BFS / ToT / beam). The agent's framework drives the search;
 * the substrate evaluates each candidate node.
 *
 * The bridgeContextProvider is called once per node to supply the four wrapper-
 * owned fields Layer2Assessment cannot carry (per atl-bridge.ts). The provider
 * must also supply candidates_considered (Decision A) — typically `1` for a
 * single per-node call, or the total slate size when the tree-search algorithm
 * is treating sibling nodes as a parallel evaluation.
 */
export function createSubstrateEvaluator(
  callSubstrate: (input: Layer1Schema) => Promise<Layer2Assessment>,
  bridgeContextProvider: (nodeInput: Layer1Schema) => BridgeContext
): (nodeInput: Layer1Schema) => Promise<EvaluatedAction>
```

The helper is thin — most of the work is already in the substrate API. Its value is naming the contract and providing a stable entry point.

### Documentation

New section in `sage-assent-wrapper-spec.md`: "Tree-search composition." Contents:

1. **The per-node contract.** Existing substrate API `(Layer1Schema) => Layer2Assessment` is the per-node evaluator. With Decisions A + B, `Layer1Schema` carries everything a tree-search algorithm needs to thread (the parent's `carried_profile` for trajectory-aware assessment; sibling unchosen candidates via `carried_candidates`).
2. **Pseudocode — MCTS** (~12 lines). Selection / expansion / simulation / backpropagation; the substrate call sits at the simulation step.
3. **Pseudocode — BFS** (~8 lines). Per-level expansion; the substrate ranks expansions.
4. **Pseudocode — Tree-of-Thoughts** (~10 lines). LLM-driven branching with substrate at each thought-evaluation step.
5. **Composition with Anthropic multi-agent orchestration** (subsection). Distinguishes in-process tree search (substrate-as-per-node-evaluator; this section) from multi-agent tree-like behaviour (Anthropic multi-agent orchestration is the runtime substrate; the Sage Assent wraps the orchestrator per Pattern 3 — see `atl-iteration-patterns.ts` PR15 consult). Both legitimate; different mechanics. Developers should choose based on whether the candidate paths share a single agent's context (in-process tree) or run in independent agent contexts (multi-agent orchestration).

No reference implementations of any algorithm — pseudocode only. Reduces maintenance surface; the algorithms are well-known.

---

## Decision D — Top-K retention

### Why

Decision B elected `carried_candidates` as a persistent top-K-capped slot. Decision D names the K, the ranking criterion, and the helper.

### Helper

```ts
// atl-iteration-patterns.ts (or sibling — build-session decision)

/**
 * Prune a list of candidates to the top K by a ranking comparator. Stable for
 * tied scores — input order survives where the comparator returns 0.
 */
export function pruneToTopK<T>(
  candidates: readonly T[],
  k: number,
  comparator?: (a: T, b: T) => number   // optional — default uses the D1 hybrid
): T[]

/**
 * The default comparator for carried_candidates. Hybrid criterion:
 *   1. If the agent's objective_function_declaration is present, rank by it.
 *   2. Otherwise rank by katorthoma_proximity (sage_like > principled >
 *      deliberate > habitual > reflexive).
 */
export function defaultCarriedCandidateComparator(
  objectiveFunctionDeclaration: ObjectiveFunctionDeclaration | null
): (a: CarriedCandidate, b: CarriedCandidate) => number
```

### Defaults

- **K default:** 5. Useful working-set size (the brainstorm reference). Agent can override per wrapper instance or per pruning call.
- **Ranking criterion default:** the D1 hybrid above — agent's declared objective function if present, else proximity rank.

### Application

`accumulateChosen` (in `atl-iteration-patterns.ts`) adds the N−1 unchosen candidates to `carried_candidates`, then calls `pruneToTopK(carried_candidates, K, comparator)` and writes the result back. Existing test coverage for `accumulateChosen` extends to cover the carry + prune.

---

## Cross-references

- `/operations/decision-log.md` — `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16` (this design's adoption record).
- `/operations/handoffs/founder/2026-05-16-sage-assent-items-1-3-design-pass-close.md` — this session's close.
- `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — sequencing source; the brainstorm that confirmed items 1, 2, 3 + the four open design questions per item.
- `/operations/handoffs/founder/2026-05-16-atl-public-accreditation-endpoint-close.md` — 6b close (every Sage Assent Wrapper component Verified end-to-end).
- `/adopted/substrate-modes/sage-assent-wrapper-spec.md` — the Wrapper spec; especially §"Component 1 — The Wrapper / carried-profile mechanism" + §"Component 4 — Trajectory awareness" + §"Component 5 — The three iteration patterns" + §"Layer 1 implications" + §"Open questions deferred to build."
- `/website/src/lib/substrate/atl-bridge.ts` — `BridgeContext` (extended for Decision A) + the idempotence rationale forcing Decision A onto `EvaluatedAction`.
- `/website/src/lib/substrate/atl-iteration-patterns.ts` — Pattern 2's open-question-4 closure (Decision B's separate-slot framing) + the Anthropic multi-agent-orchestration PR15 consult (retained for Decision C).
- `/website/src/lib/substrate/atl-wrapper.ts` — `CarriedProfile` (extended for Decision B's new slot).
- `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction` + `WindowSnapshot` shapes (extended for Decision A).
- `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — `AccreditationRecord` + `AccreditationPayload` shapes (extended for Decision A badge persistence).
- `/manifest.md` — R0 (oikeiosis trajectory honesty), R4 (IP boundary on the badge), R18a (Character Kernel honest credential), R18c (interoperability), AC8 (translation-sandwich substrate), PR1, PR7, PR10, PR11, PR15.

---

*End of design document. Status: Adopted 2026-05-16 (decision); Designed (implementation). The items 1–3 build session opens against this document + `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16` as the spec.*
