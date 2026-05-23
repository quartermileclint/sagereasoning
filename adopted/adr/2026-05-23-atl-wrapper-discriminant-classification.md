# ADR — `mode:'atl_wrapper'` Render-Mode Discriminant: Internal-Dispatch Classification

**Status:** Adopted 2026-05-23 under `D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23`.
**Decision ID:** Parked-1 ADR (agent-mode render-mode discriminant classification).
**Scope:** Classifies the Layer 3 render-mode discriminant value `'atl_wrapper'` (the `Layer3RenderMode` union member; the constant `mode` tag on `AgentModeResponse` / `AgentModeRenderResult`) as **internal-dispatch** rather than **wire-contract**, in order to set the risk tier of a *future* rename of that value. This ADR does **not** rename anything.
**Authoritative cross-references:** `/operations/decision-log.md` §`D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23` (this classification); `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23` (parent — the Phase-3 close that parked this item); `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15` + `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15` (provenance of the discriminant); `/drafts/2026-05-23-track-followons-design-pack.md` §C (the rename impact-map).

---

## Decision

The Layer 3 render-mode discriminant value `'atl_wrapper'` is classified **internal-dispatch**: it never crosses a wire boundary to an external agent and is not persisted. Consequently, **a future rename of `'atl_wrapper'` is Standard/Elevated risk under 0d-ii** — a mechanical internal rename (the Track C Phase 1 pattern), **not** the Track C Phase 3 Critical precedent.

This classification holds *as of the current production state* and carries an explicit revisit-condition (below): the value re-classifies to **wire-contract → Critical** if and when any route serializes `AgentModeResponse` to an external agent.

## Context

Across Track C Phases 1–3 the name "ATL" / "Agent Trust Layer" was retired from internal, governance, and external/wire/public surfaces. Two internals were deliberately parked: the `trust-layer/` directory rename and the `mode:'atl_wrapper'` render-mode discriminant. The Phase-3 close (`D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`, Open Question 2) carried a standing instruction: **classify the discriminant as internal-dispatch or wire-contract before anyone attempts to rename it**, so the rename opens at the correct risk tier instead of guessing.

The crux: `'atl_wrapper'` is not only a `switch` discriminant — it is also written into a versioned JSON object (`version: 'agent-mode-response-v1', mode: 'atl_wrapper'`). Whether that JSON crosses a wire boundary to an external agent is the whole question. A value that turns out to be wire-format would make a future rename Critical (coordinated change + version handling, per the Phase-3 prefix/scope/URI precedent).

## Evidence (boundary trace — `Diagnostic-certain`)

**Where the value lives (code only; zero in `website/public/`, zero in any `.sql`):**

- `philosophical-mode-service.ts:210` — the `Layer3RenderMode` union member.
- `philosophical-mode-service.ts:1524` — the dispatch `switch (input.mode) { case 'atl_wrapper': … }` in `renderLayer3Mode` (**the only place the value is read/matched**, not merely produced or typed).
- `agent-mode-service.ts:315` (`AgentModeResponse.mode`), `:353` (`AgentModeRenderResult.mode`), `:566` (the JSON payload construction), `:913` (the dispatch return). The module header (`:37`) calls this "the **IN-LOOP** machine-readable JSON."
- `sage-assent-iteration-patterns.ts:364` — `Layer3ModeRenderInput & { mode: 'atl_wrapper' }`, an in-process input type for parallel evaluation.

**Why it is internal-dispatch:**

1. The dispatch `switch` input (`Layer3ModeRenderInput`) is constructed **in-process** by internal callers (the dispatch overloads, the parallel-evaluation helper `evaluateInParallel`, and tests). It is never parsed from an HTTP request body.
2. `renderLayer3Mode(` / `renderAgentMode(` are *called* only inside substrate lib modules and the two test files — **no `/api` route calls either**.
3. `/api/substrate/layer3` serializes `generateLayer3Response` from `layer3-service.ts`, which has **zero** references to the agent-mode dispatch — and the route is `SUBSTRATE_LAYER3_ENABLED`-gated (503 / OFF in production) regardless.
4. `/api/accreditation/[agent_id]` imports only the wrapper's `CarriedProfile` / `TransitionResult` *types* and emits an R4-compliant `AccreditationPayload`; it does not serialize the discriminant.
5. The one external-facing shape that mentions `AgentModeResponse` is `latest_rendering` inside `PeerAgent` / `PeerAgentAssessmentPayload` (`sage-assent-iteration-patterns.ts:573, :596`) — but those are **Layer-1 *input* builders** that round-trip through a *permissive* `Record<string, unknown>[]` Layer1Schema field; the substrate never validates or dispatches on `mode` from input, and that builder's output reaches **no route** (`app/` grep: no matches).

**Negative findings (PR12 — multiple queries):** no occurrence of `atl_wrapper` / `agent-mode-response` under `website/public/` (no agent-card.json / llms.txt / api-docs reference); no occurrence in any `.sql` migration or persisted DB value; no `/api` route serializes the value directly or transitively.

## Consequences

- **A future rename of `'atl_wrapper'` opens at Standard/Elevated risk** (mechanical internal rename: union member + dispatch case + the const tags + the in-process input type + comments + tests; `tsc` exhaustiveness guard at `philosophical-mode-service.ts:1530` catches an incomplete union edit). Full Critical Change Protocol is **not** required *under the current production state*.
- The classification removes the need to re-investigate the boundary when the discriminant rename (and, after it, the `trust-layer/` directory rename) is next scoped.
- The `version: 'agent-mode-response-v1'` schema tag travels with the discriminant; both are in-loop today. A rename that also touches the version tag is still internal under current conditions.

## Revisit conditions

Re-classify to **wire-contract → Critical** (and re-open the Critical Change Protocol) before any rename if **any** of the following becomes true:

1. **A route serializes `AgentModeResponse` to an external agent** — most plausibly when Stage-3 plugin-originated traffic lights up `/api/substrate/layer3` (today 503-gated), or a new agent-mode endpoint is added that returns the in-loop JSON across the wire.
2. **The value is persisted** — written into any DB column / constraint / migration as a stored discriminant.
3. **The value is published into a contract** — appears in `website/public/.well-known/agent-card.json`, `llms.txt`, or API documentation as a value external consumers key on.

Each revisit produces a new decision-log entry (and, if the tier changes, supersedes this ADR's risk-tier conclusion). The original is preserved.

## Cross-references

- `/operations/decision-log.md` — `D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23` (this classification); `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23` (parent / parking entry); `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`; `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15` (discriminant provenance)
- `/drafts/2026-05-23-track-followons-design-pack.md` §C (ATL→Sage Assent rename impact-map; the (A)/(B)/(C)/(D) categories)
- `/operations/handoffs/founder/2026-05-23-C-phase3-external-wire-close.md` (Phase-3 close that parked this item)
- `website/src/lib/substrate/philosophical-mode-service.ts` (`Layer3RenderMode` union; `renderLayer3Mode` dispatch)
- `website/src/lib/substrate/agent-mode-service.ts` (`AgentModeResponse`; `renderAgentMode`)
- `website/src/lib/substrate/sage-assent-iteration-patterns.ts` (`ParallelCandidate`; `PeerAgent` / `PeerAgentAssessmentPayload` Layer-1 input builders)

---

*End of Parked-1 ADR. `mode:'atl_wrapper'` classified internal-dispatch 2026-05-23; a future rename is Standard/Elevated until a revisit condition fires. No code was renamed by this ADR.*
