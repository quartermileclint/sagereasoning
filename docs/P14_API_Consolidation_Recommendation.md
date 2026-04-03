# P14: API Consolidation Recommendation

**Date:** 3 April 2026
**Status:** Recommendation — awaiting approval at P14.5 decision gate

---

## Summary

An analysis of all 14 evaluation API endpoints and sage skills found that sage-reason is already the canonical reasoning engine. Eight endpoints duplicate its LLM prompts independently rather than calling it. The recommendation is a phased consolidation that reduces the active endpoint count from 14 to 7, eliminates redundant prompts, and unifies the LLM engine without breaking existing integrations.

---

## Classification Results

| Classification | Count | Endpoints |
|----------------|-------|-----------|
| **(A) Keep Standalone** | 5 | sage-reason, score-iterate, score-document, score-scenario, patterns |
| **(B) Consolidate** | 8 | score, score-decision, score-conversation, score-social, reflect, guardrail, sage-prioritise, sage-classify |
| **(C) Deprecate** | 1 | evaluate (demo) |

---

## Recommended Consolidation Strategy

### Immediate (no breaking changes)

**Deprecate /api/evaluate.** This endpoint is an exact subset of sage-reason at quick depth with stricter rate limits. Replace by making sage-reason accessible without auth for unauthenticated demo calls, applying the current evaluate rate limits (5/min, 500 char max).

### Short-term (wrapper refactoring — existing contracts preserved)

Refactor these endpoints to **call sage-reason internally** rather than maintaining their own LLM prompts. The external API contract (inputs, outputs, pricing) stays identical — only the internal engine changes.

- **/api/guardrail** → thin wrapper: calls sage-reason quick, applies threshold comparison deterministically, returns proceed/recommendation envelope.
- **/api/reflect** → wrapper: calls sage-reason quick with developmental tone context, adds affirmation and evening_prompt post-processing.
- **/api/score** → deprecated alias: routes to sage-reason standard depth with relationship/emotional_state passed as domain_context.

### Medium-term (contract changes — requires migration path)

- **/api/score-decision** → replaced by batch sage-reason calls (one per option) with client-side sorting. Existing consumers get a 6-month deprecation window with redirect.
- **sage-prioritise** → retired. Functionality available via sage-reason quick per item + deterministic sorting by proximity and horizon.
- **sage-classify** → retired. Functionality available via sage-reason quick + lightweight category assignment.

### No change

- **/api/reason** — core engine, no change
- **/api/score-iterate** — unique stateful chain management, keep standalone but unify internal LLM prompts with sage-reason
- **/api/score-document** — unique authorial/reader distinction, keep standalone
- **/api/score-scenario** — unique educational context + scenario generation, keep standalone
- **/api/patterns** — deterministic (no LLM), keep standalone
- **/api/score-conversation** — keep as wrapper, unify engine later
- **/api/score-social** — keep as wrapper, unify engine later

---

## Revenue and Compatibility Impact (P14.3)

### Pricing (R5)

Current pricing per AGENTS.md skill contracts:

| Endpoint | Current Cost | Post-Consolidation Cost | Change |
|----------|-------------|------------------------|--------|
| sage-reason (quick) | ~$0.025 | ~$0.025 | None |
| sage-reason (standard) | ~$0.041 | ~$0.041 | None |
| sage-reason (deep) | ~$0.055 | ~$0.055 | None |
| sage-score | ~$0.033 | Retired → sage-reason standard ~$0.041 | +$0.008 |
| sage-guard | ~$0.001 | ~$0.001 (wrapper cost unchanged) | None |
| sage-iterate | ~$0.033 | ~$0.033 | None |
| sage-prioritise | ~$0.033 | Retired → N × sage-reason quick | Variable |
| sage-classify | ~$0.033 | Retired → sage-reason quick ~$0.025 | -$0.008 |

The R5 2x cost coverage rule is maintained. sage-reason pricing already includes margin.

### Existing Integrations

The AGENTS.md skill contracts and the OpenBrain integration spec (docs/openbrain-integration-spec.md) reference specific endpoint paths. Migration approach:

1. **Deprecated endpoints continue to function** for 6 months after announcement, returning a `Deprecation` header with migration guidance.
2. **AGENTS.md updated** to mark deprecated skills and point to sage-reason equivalents.
3. **OpenBrain spec unaffected** — it uses sage-reason and sage-classify. sage-classify wrapper can be maintained even after internal engine unification.

### Marketplace (R10)

Marketplace-listed sage skills (sage-prioritise, sage-classify) would be retired from the marketplace listing. Existing users of these skills would be migrated to sage-reason-based equivalents. The marketplace page itself continues to list sage-reason as the universal entry point.

### Embedding Platforms (R13)

No impact. R13 obligations apply to sage-reason, which is unchanged. Embedding platforms using deprecated endpoints receive migration guidance via the Deprecation header.

---

## Benefits

- **Prompt maintenance:** Eliminate 8 redundant LLM system prompts (~12,000 tokens of duplicated logic)
- **Consistency:** All evaluations flow through the same V3 engine
- **Model swaps:** When switching models (e.g., to Mythos), update one engine instead of 14
- **Cost reduction:** Fewer unique prompts = lower prompt caching miss rate
- **Developer experience:** Agents learn one endpoint (sage-reason) with depth/mode parameters

---

## Decision Gate (P14.5)

This recommendation requires approval before any endpoint changes are made. The consolidation work would be a separate implementation scope with its own phases and testing.

**Options:**

1. **Approve immediate + short-term** — deprecate /api/evaluate, refactor guardrail/reflect/score as wrappers. No breaking changes. Low risk.
2. **Approve all phases** — full consolidation including skill retirements and contract changes. Requires migration plan and deprecation timeline.
3. **Defer** — document the recommendation but take no action until post-Mythos release when the model swap makes unification urgent.
4. **Reject** — maintain current architecture.

**Recommendation:** Option 1 (approve immediate + short-term). This captures 80% of the maintenance benefit with zero breaking changes. Medium-term consolidation can be revisited after Mythos release when model capabilities may make further simplification natural.
