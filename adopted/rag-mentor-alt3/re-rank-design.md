# Deliverable 7 — Re-Rank Design

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-3 (top ~20 retrieved → re-rank → top ~3–5 to prompt); AC-12 (translation-sandwich — re-ranking is structural relevance scoring, not Stoic reasoning); R5 (cost guardrail — re-rank cost stays bounded against the per-request envelope).

**Cross-references:**
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — produces the top-K candidates this re-rank consumes)
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — the per-passage tags that inform heuristic re-rank)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose retrieval calls flow through this re-rank)
- `/drafts/rag-mentor-alt3/cost-model.md` (D20 — re-rank cost contributes to the per-request total)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1 (model selection — applies to LLM-as-reranker option), AC2 (latency budget — re-rank latency contributes), R5 (cost guardrail)
- `/operations/knowledge-gaps.md` KG2 (Sonnet/Haiku boundary — informs LLM-as-reranker model selection)

---

## Plain-language summary

Hybrid retrieval (D6) returns a ranked list of approximately 20 candidate passages. Per AC-3 the engine wants only the top 3–5 in the prompt — sending all 20 would dilute the signal and waste tokens. The re-rank step is the second pass that takes the 20 candidates and produces the final top 3–5 by **relevance to the specific query**.

The re-rank can be done three ways: (a) a **cross-encoder model** (a specialised neural model that scores each query-passage pair), (b) an **LLM-as-reranker** (call Claude/Haiku with the query and the 20 passages, ask for the top K with relevance scores), or (c) **heuristic re-rank** (deterministic rules that boost passages by structural-tag match).

This deliverable evaluates the three with a cost / quality table and **recommends a hybrid policy**: use heuristic re-rank as the default (deterministic, free, fast) with a cross-encoder upgrade path for the cases where heuristic falls short. LLM-as-reranker is named as the alternative if the cross-encoder upgrade is deferred. The architectural commitment is that re-ranking is **structural relevance scoring**, not Stoic reasoning — the engine decides what to do with the top 3–5 deterministically per AC-12.

## Glossary

- **Re-rank** — the second pass that reorders the top-K retrieved candidates by query-specific relevance. Distinct from retrieval (D6), which produces the candidates from the index.
- **Cross-encoder** — a neural model that takes a (query, passage) pair as input and outputs a relevance score. Distinct from a bi-encoder (which embeds query and passage separately and compares vectors). Cross-encoders are slower per pair but typically more accurate. Examples: `cross-encoder/ms-marco-MiniLM-L-6-v2`, Cohere Rerank API.
- **LLM-as-reranker** — using a generative LLM (Haiku, Sonnet) as the re-ranker by passing it the query and the candidates and asking for a JSON list of top-K with relevance scores.
- **Heuristic re-rank** — deterministic re-ranking rules based on structural tag match (e.g., a passage whose `canonical_mechanism` contains the requested mechanism ID is boosted; a passage whose `passion` matches the requested passion is boosted further).
- **Cosine similarity** — the similarity between two vectors normalised to [-1, 1]. The retrieval step (D6) already uses cosine similarity for vector retrieval; the re-rank uses additional signals.
- **Relevance score** — the re-rank's per-passage score. Used to order the top-K and (optionally) to surface a confidence threshold.
- **Per-mechanism re-rank policy** — the rule for which re-rank approach to use for which mechanism. Some mechanisms benefit from heuristic (where structural tags align tightly with the query); others benefit from cross-encoder (where semantic nuance matters).

## The three approaches

### Option A — Cross-encoder model

A specialised neural model (e.g., `cross-encoder/ms-marco-MiniLM-L-6-v2` self-hosted, or Cohere Rerank API) scores each (query, passage) pair. The model has been trained on relevance pairs and produces well-calibrated scores.

| Property | Value |
|---|---|
| Latency per (query, 20 candidates) batch | 50–200ms (self-hosted small model); ~400ms (Cohere Rerank API) |
| Cost per re-rank | $0.001 (Cohere Rerank API) per request; effectively $0 self-hosted (compute is amortised) |
| Quality | High — cross-encoders are designed for this task and consistently outperform alternative re-ranking approaches on benchmark sets |
| Operational complexity | Medium (self-hosted: container plus model weights ~80MB; Cohere: API key plus rate limits) |
| Phase-1 fit | Acceptable but adds a second model dependency (alongside OpenAI for embeddings + Anthropic for translations). Cross-vendor risk increases. |

**Pros:** Best quality; well-understood approach; bounded latency; deterministic given the model.

**Cons:** Adds infrastructure (self-hosting) or a third vendor (Cohere). Quality lift over heuristic+vector ranking on a structurally tagged corpus may not be large — the structural tags do most of the relevance work.

### Option B — LLM-as-reranker

Call an LLM (Haiku or Sonnet) with a system prompt naming the re-rank task, the query, and the 20 candidates. The LLM returns a JSON array of top-K passage IDs with relevance scores.

| Property | Value |
|---|---|
| Latency per re-rank | 800–1500ms (Haiku); 1500–3000ms (Sonnet) |
| Cost per re-rank | ~$0.001 (Haiku, ~5k input + 200 output tokens); ~$0.005 (Sonnet) |
| Quality | High to very high — depends on prompt engineering; LLM-as-reranker typically outperforms cross-encoders on tasks with semantic nuance |
| Operational complexity | Low (uses existing Anthropic SDK) |
| Phase-1 fit | Functional but breaks the AC-12 narrowness — Claude is now reasoning about passage relevance during retrieval, even if narrowly scoped |

**Pros:** Uses existing infrastructure (no new vendor / no self-hosting). Easy to implement. High quality with a careful prompt.

**Cons:** Latency is the main concern — adds 800–1500ms per request even on Haiku, on top of retrieval (200ms), Layer 1 (1000ms), engine logic (varies), Layer 3 (1500ms). The per-request budget gets tight. **AC-12 narrowness concern:** even narrowly-scoped, this re-introduces Claude to a reasoning-adjacent step that the architecture was designed to remove. The relevance scoring is structural, not Stoic — but the LLM is doing the structural scoring, which complicates the determinism story.

### Option C — Heuristic re-rank

Deterministic rules that re-score the 20 candidates based on structural tag match, plus the existing RRF score from D6.

The rules:

1. **Structural tag match boost.** If the passage's `canonical_mechanism` contains the requested mechanism ID, boost the score by a fixed multiplier (e.g., 1.5x). If the `passion` / `sub_passion` matches, additional boost (e.g., 1.3x). If the `passage_type` matches the requested type, additional boost (e.g., 1.2x).
2. **Audience-tier boost.** If the consumer surface is user-facing (R8c) and the passage is tagged R8c, slight boost (1.1x). Surfaces requiring strict glossary (R8a — agent-facing API responses) prefer R8a-tagged content.
3. **Recency / version preference.** If the corpus has multiple versions of a passage (rare; only post-D-A10 expansion or post-corpus revision), prefer the latest version.
4. **Trigger-code exact match.** For focus-question-stem retrieval, exact match on `trigger_condition` and `intake_tier` is required (already enforced by the retrieve function's filter); among matches, prefer the lowest `stem_id` (catalogue ordering preserved).

| Property | Value |
|---|---|
| Latency per re-rank | <5ms (in-memory scoring of 20 rows) |
| Cost per re-rank | $0 |
| Quality | Medium-to-high — depends on how well the structural tags capture the relevance dimensions |
| Operational complexity | Very low (deterministic code in the retrieval pipeline) |
| Phase-1 fit | Excellent — preserves AC-12 narrowness; deterministic; fast; free |

**Pros:** Free, fast, deterministic, no new infrastructure, preserves AC-12 narrowness exactly.

**Cons:** Quality ceiling depends on tag richness. For mechanisms where the structural tags map tightly to the query (e.g., Mechanism 5 false-judgement template lookup — query is the sub-species ID; passage is tagged with that ID), heuristic is essentially perfect. For mechanisms where the query is semantically nuanced (e.g., a Layer 1 narrative description that could match multiple example passages), heuristic may rank a less-relevant passage above a more-relevant one.

## The recommendation — heuristic default with per-mechanism upgrade path

**Recommendation: Option C (heuristic) as the Phase-1 default.** Phase-2 production observation determines whether per-mechanism upgrades to Option A (cross-encoder) are needed. Option B (LLM-as-reranker) is named as the fallback if Option A is operationally rejected.

Reasons:

1. **The structural tags do most of the relevance work.** The retrieval step (D6) already filters by `canonical_mechanism`, `passion`, `sub_passion`, `passage_type`, `trigger_condition`. The candidates returned to re-rank are already topically aligned. Heuristic re-rank's tag-match boosts apply where retrieval has done most of the filtering work.
2. **Phase-1 corpus is small.** ~500 passages at v1.0. Per-mechanism candidate counts are typically <30. Heuristic re-rank produces stable orderings on small candidate sets.
3. **AC-12 narrowness preserved.** Heuristic is deterministic; no LLM in the retrieval-then-rerank pipeline. The architecture's commitment that "no Stoic inference originates from Claude" is unambiguous when the retriever is fully deterministic.
4. **Cost stays at zero.** R5 cost-as-health-metric: the retrieve+rerank step is operationally free under heuristic. The per-request cost is dominated by Layer 1 + Layer 3 LLM calls, not by retrieval.
5. **Phase-2 observation is the right escalation trigger.** If Phase-2 production observation shows that heuristic ranks suboptimal passages on top for specific mechanisms, the per-mechanism upgrade path is well-defined: switch that mechanism's re-rank to Option A (cross-encoder) and measure the lift. The architecture supports the upgrade without restructuring; the re-rank step is internal to the retrieval pipeline.

## Heuristic re-rank scoring formula

The score for each candidate after heuristic re-rank:

```
heuristic_score(passage) =
  rrf_score(passage)                          // from D6 retrieval (RRF of BM25 + vector)
  * mechanism_match_multiplier(passage)        // 1.5 if canonical_mechanism contains requested ID; 1.0 otherwise
  * passion_match_multiplier(passage)          // 1.3 if passion matches requested filter; 1.1 if sub_passion matches; 1.0 otherwise
  * passage_type_match_multiplier(passage)     // 1.2 if passage_type matches requested filter; 1.0 otherwise
  * audience_tier_match_multiplier(passage)    // 1.1 if audience_tier matches consumer's tier; 1.0 otherwise
```

The multipliers compound. Phase-2 build tunes the specific values via observation; the architecture commits to the multiplicative-boost shape.

After scoring, sort by `heuristic_score` descending and take the top-K (per AC-3 default, K=3 to 5 for the prompt).

### Worked example — Rule 5 Pass-1 philodoxia false-judgement template lookup

**Retrieval input:**
```
{
  query: "philodoxia false judgement reputation",
  mechanism_filter: ['passion_false_judgement'],
  passion_filter: 'epithumia',
  sub_passion_filter: 'philodoxia',
  passage_type_filter: ['mechanism'],
  top_k: 20
}
```

**Retrieved candidates (post-RRF, top 5 of 20 shown):**

| passage_id | rrf_score | canonical_mechanism | passion | sub_passion | passage_type |
|---|---|---|---|---|---|
| `passions:epithumia:philodoxia:definition` | 0.034 | `[passion_root_detection, passion_sub_species, passion_false_judgement]` | epithumia | philodoxia | mechanism |
| `passions:epithumia:philodoxia:false_judgement_template` | 0.032 | `[passion_false_judgement]` | epithumia | philodoxia | mechanism |
| `passions:epithumia:definition` | 0.028 | `[passion_root_detection]` | epithumia | null | mechanism |
| `value:reputation:typical_passion` | 0.026 | `[value_indifferent]` | epithumia | philodoxia | mechanism |
| `passions:epithumia:philodoxia:example_a` | 0.022 | `[passion_root_detection, passion_sub_species]` | epithumia | philodoxia | example |

**Heuristic re-rank scoring (with default multipliers):**

| passage_id | rrf_score | mechanism boost | passion boost | passage_type boost | heuristic_score |
|---|---|---|---|---|---|
| `passions:epithumia:philodoxia:definition` | 0.034 | × 1.5 (mechanism match) | × 1.3 (sub-passion match) | × 1.2 (mechanism type match) | 0.080 |
| `passions:epithumia:philodoxia:false_judgement_template` | 0.032 | × 1.5 | × 1.3 | × 1.2 | 0.075 |
| `value:reputation:typical_passion` | 0.026 | × 1.0 (mechanism mismatch) | × 1.3 | × 1.2 | 0.041 |
| `passions:epithumia:definition` | 0.028 | × 1.0 (mechanism mismatch) | × 1.0 (sub-passion null, no match) | × 1.2 | 0.034 |
| `passions:epithumia:philodoxia:example_a` | 0.022 | × 1.0 | × 1.3 | × 1.0 (passage_type mismatch — example, not mechanism) | 0.029 |

**Top 3 returned to the prompt:** definition, false_judgement_template, value:reputation:typical_passion. The heuristic correctly ranks the philodoxia mechanism content above unrelated content even though the RRF scores were close.

## Per-mechanism re-rank policy

Different mechanisms benefit from different re-rank approaches. Phase-2 build implements heuristic as the universal default; the policy specifies where Phase-2 production observation should evaluate upgrades:

| Mechanism | Default | Rationale | Upgrade trigger |
|---|---|---|---|
| Rule 1 (`prohairesis_filter`) | Heuristic | Direct mechanism-tag match; the dichotomy-of-control list is highly tagged. | None expected. |
| Rule 2 (`passion_root_detection`) | Heuristic | Tag match on `passion` + mechanism. | Reconsider if Phase-2 observation shows ambiguous narrative-to-passion mappings. |
| Rule 3 (`passion_sub_species`) | Heuristic | Tag match on sub_passion + mechanism. | None expected. |
| Rule 4 (`passion_causal_stage`) | Heuristic | Tag match; per-passion stage signatures are well-tagged. | Consider cross-encoder if narratives often cross multiple stages. |
| Rule 5 Pass-1 / Pass-2 (`passion_false_judgement`) | Heuristic | Direct sub_passion + mechanism match (template lookup is essentially exact-match shaped). | None expected. |
| Rule 6 (`oikeiosis_stage`) | Heuristic | Mechanism match; circle classification is structural. | None expected. |
| Rule 7 Pass-1 / Pass-2 (`oikeiosis_obligation`) | Heuristic | Mechanism + canonical_line match (Cicero's deliberation framework). | None expected. |
| Rule 8 (`value_indifferent`) | Heuristic | Mechanism + indifferent-ID match in passion field. | Reconsider if `value_indifferent` retrieval surfaces cases where multiple indifferents share semantic territory. |
| Rule 9 (`virtue_domain_engaged`) | Heuristic | Mechanism + canonical_line on unity thesis. | None expected. |
| Rule 10 (`katorthoma_proximity`) | Heuristic | Mechanism match on Senecan grade content. | None expected. |
| Tier 1 / 2 / 3 trigger stems (focus_question_stem) | Heuristic | Exact match on `trigger_condition` + `intake_tier`. | None — exact-match shape; cross-encoder adds no signal. |

**The per-mechanism policy is uniform Phase-1 default.** Heuristic re-rank is the canonical choice; per-mechanism upgrades are Phase-2 production observation candidates. The architecture supports the upgrade without restructuring.

## Re-rank function signature

The single entry point that the retrieval pipeline calls after `retrievePassages`:

```typescript
async function reRank(
  candidates: RetrievedPassage[],            // from D6
  input: RetrieveInput,                      // the original retrieval input — informs heuristic boosts
  policy: ReRankPolicy = 'heuristic'         // 'heuristic' | 'cross_encoder' | 'llm'
): Promise<RetrievedPassage[]>;              // returns top_k_after_rerank, sorted by relevance score

type ReRankPolicy = 'heuristic' | 'cross_encoder' | 'llm';
```

The function returns the candidates ranked by re-rank score with their original retrieval metadata preserved. The number of returned candidates defaults to `Math.min(input.top_k_after_rerank ?? 5, candidates.length)` — typically 3–5 per AC-3.

The default policy is `'heuristic'`. Phase-2 build can override per-call (e.g., for an experimental cross-encoder run on Rule 4 content), and Phase-2 observation may flip the per-mechanism default if the upgrade-trigger conditions are met.

## When heuristic falls short

Three scenarios where heuristic re-rank may produce suboptimal orderings:

1. **Tag tie-breaking.** When multiple candidates have identical structural tags (e.g., several philodoxia example passages from `passions.json`'s sub-species block), heuristic falls back to the RRF score from D6. The RRF score is already a hybrid signal; tie-breaking via RRF is acceptable but not perfect.
2. **Semantic nuance within a sub-species.** When the query is a specific narrative (e.g., "rehearsing for a meeting tomorrow") and multiple philodoxia example passages exist (some about reputation-at-work, some about reputation-among-peers, some about reputation-in-public), heuristic alone cannot distinguish "narrative is at work" from "narrative is at peers". Vector search at retrieval time captures some of this, but the heuristic doesn't compound the signal.
3. **Cross-mechanism queries.** When the query touches multiple mechanisms (e.g., "philodoxia operative on reputation, leading to circle 3 contraction"), the structural-tag boosts are evenly distributed across candidates touching different combinations. Heuristic returns a reasonable but not ideal ordering.

For each of these, Option A (cross-encoder) provides a measurable lift. Phase-2 production observation evaluates: per-mechanism, is the heuristic-top-3 the best 3 of the 20? If the answer is consistently yes, no upgrade. If consistently no for a specific mechanism, that mechanism's policy upgrades to cross-encoder.

## Cross-encoder upgrade path (Option A details)

If Phase-2 production observation triggers the cross-encoder upgrade for a specific mechanism, the implementation path:

### Self-hosted option

Deploy a small cross-encoder model alongside the existing infrastructure. Recommended model: `cross-encoder/ms-marco-MiniLM-L-6-v2` (80MB, ~100ms latency per 20-pair batch on a small CPU). Phase-2 build adds a `/api/internal/rerank` endpoint that the retrieval pipeline calls:

```typescript
async function callCrossEncoder(
  query: string,
  candidates: RetrievedPassage[]
): Promise<{ passage_id: string; relevance_score: number }[]>;
```

Operational concern: the model is ~80MB and adds a cold-start cost on Vercel serverless if deployed there. Vercel's max function size is 250MB compressed; the model fits but pushes the deployment near the limit. Alternative: deploy the cross-encoder on a separate small VM (a Render or Fly.io instance) and call via HTTP. Phase-2 build resolves the deployment shape.

### Cohere Rerank API option

Use Cohere's hosted Rerank API (`/rerank` endpoint with the `rerank-english-v3.0` model). Pros: zero operational overhead; well-tested. Cons: third vendor; ~$0.001 per request adds up at scale; ~400ms latency.

**Recommendation if upgrade is triggered:** start with Cohere (zero ops); migrate to self-hosted if the cost or vendor concentration becomes operationally limiting.

## LLM-as-reranker fallback (Option B details)

If the cross-encoder upgrade is operationally rejected (e.g., the founder prefers no new vendor; self-hosting is too complex for the founder's solo operation), Option B is the fallback. Implementation:

```typescript
const RERANK_PROMPT = `
You are a structural relevance scorer. The query and candidates below are
retrieval results from a Stoic philosophy corpus index. Your task is to score
each candidate's relevance to the query and return the top K.

YOU DO:
- Score relevance based on structural match (mechanism tags, passion tags,
  passage type) AND on semantic alignment with the query.
- Return JSON only.

YOU DO NOT:
- Add Stoic inference.
- Re-write the candidates.
- Change the candidates' source citations.

Query: {query}

Candidates: {candidates_with_passage_id_and_text}

Return top {top_k} as JSON: [{ "passage_id": "...", "relevance_score": <0-1>, "rank": <1-K> }, ...]
`;
```

Model: Haiku (per AC1 / KG2 — single-mechanism scoring of 20 short candidates is within Haiku's reliability boundary). Latency: ~1000ms. Cost: ~$0.001 per request.

**The LLM-as-reranker is a fallback with a known AC-12 tension.** The narrowness commitment is preserved at the architectural level (Claude is doing structural scoring, not Stoic reasoning) but the line is thinner than with heuristic or cross-encoder. Phase-2 build documents the tension if Option B is engaged.

## Latency budget

Re-rank latency contributes to the per-request total. Per AC2, the overall safety budget is 500ms for borderline R20a inputs; the engine and Layer 1/3 add additional latency. The re-rank target:

| Approach | Target latency | Acceptable for Phase 1? |
|---|---|---|
| Heuristic | <5ms | Yes (effectively free) |
| Cross-encoder (self-hosted) | 50–200ms | Yes |
| Cross-encoder (Cohere) | ~400ms | Acceptable but tight |
| LLM-as-reranker (Haiku) | 800–1500ms | Tight; pushes per-request total toward the upper bound |

Heuristic-default keeps the per-request total comfortable. The cross-encoder upgrade adds 50–200ms on the affected mechanism's call; still within budget.

## Cleanliness rating

The re-rank design is **HIGH cleanliness**:

- The three approaches are named with cost / quality / operational tradeoffs.
- Heuristic re-rank is deterministic — given the candidates and the query, the output is fixed.
- The per-mechanism policy is uniform default with named upgrade triggers.
- The cross-encoder upgrade path is structurally bounded (named models, named operational shapes).

The Phase-2 production observation cycle (heuristic → measure → upgrade if needed) is **PARTIAL cleanliness** at the threshold definition — Phase-2 build chooses how to measure "consistently suboptimal" via empirical observation. The threshold is not specified in this design; it is a Phase-2 implementation choice grounded in observed retrieval quality.

## R5 cost compliance

- **Heuristic:** $0 per re-rank.
- **Cross-encoder self-hosted:** ~$0 marginal (compute amortised); fixed VM cost ~$5/month if separately deployed.
- **Cross-encoder Cohere:** ~$0.001 per request.
- **LLM-as-reranker:** ~$0.001 per request (Haiku) to ~$0.005 per request (Sonnet).

R5's free-tier ceiling (100 calls/month at the per-call cost) is well within budget for any approach. R5's paid-tier 2x revenue requirement is unaffected — re-rank is a small cost component compared to Layer 1 + Layer 3 LLM calls.

## Open questions

1. **The exact heuristic multiplier values.** Phase-2 build tunes via observation. The architecture commits to the multiplicative-boost shape; the specific values (1.5, 1.3, 1.2, 1.1) are working values.
2. **Cross-encoder upgrade evaluation cadence.** Phase-2 production observation produces retrieval-quality measurements; the founder reviews quarterly (or more frequently if a specific mechanism's quality is contested). The cadence is not fixed at design time.
3. **Should the re-rank step expose its reasoning (for D18 verification)?** Phase-2 build's verification (D18) reads the re-rank's chosen top-K and confirms that the chosen passages support the engine's downstream rule outputs. The re-rank's per-passage scores are visible in the diagnostics; the rationale for heuristic boosts is the multiplicative formula above. For LLM-as-reranker, the LLM's chosen rankings are returned with relevance scores but not with prose justifications (which would re-introduce LLM reasoning). The transparency is structural, not narrative.
4. **Per-call top-K-after-rerank parameter.** The architecture defaults to 3–5 per AC-3. Specific consumers may want fewer (e.g., focus-question-stem retrieval where exactly 1 stem is the canonical answer). The retrieve interface (D6) supports this via a per-call parameter.

## Honest disclosure

The recommendation is heuristic re-rank for Phase 1. The architectural argument is that the structural tags do most of the relevance work and the small Phase-1 corpus does not justify the operational complexity of a cross-encoder.

The Phase-2 upgrade path is named and bounded. Cross-encoder is the preferred upgrade; LLM-as-reranker is a fallback if cross-encoder is operationally rejected. The architecture supports either upgrade without restructuring.

The latency targets are working values. Phase-2 production observation will report measured latencies; the architecture supports per-mechanism tuning if specific patterns emerge.

## Approval gate

This deliverable is consumed by Phase-2 build (the re-rank implementation) and by D6 (the retrieval interface). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 7.*
