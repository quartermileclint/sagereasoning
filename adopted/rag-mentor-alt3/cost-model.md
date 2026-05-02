# Deliverable 20 — Cost Model

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** R5 (free tier and cost guardrail — paid-tier revenue must cover at least 2x LLM API costs; Sage Ops $100/month cap; cost-as-health-metric alerts); AC-1 / AC-2 (retrieval cost components); AC-12 (translation-sandwich — cost broken down per-layer).

**Cross-references:**
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — embedding model selection; storage costs)
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — per-call retrieval cost)
- `/drafts/rag-mentor-alt3/re-rank-design.md` (D7 — heuristic re-rank cost; cross-encoder upgrade cost)
- `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10 — Layer 1 Sonnet cost)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — Layer 3 Sonnet cost)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — Layer 3 prompt template token budget)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — ritual surface cost)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — deferral-resolution surface cost)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — conversation surface cost)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — observed costs across the perimeter routes)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC2, R5

---

## Plain-language summary

Every alt-3 request costs money to run: LLM API calls at Layer 1 (input translation) and Layer 3 (output translation), retrieval calls (BM25 + vector + RRF), embedding service calls (one query embed per request), database queries (Supabase pgvector + RLS-enforced selects), and Vercel function execution time. This deliverable counts the cost per request across the three Phase-2 surfaces (deferral-resolution, daily-reflection ritual, conversation), aggregates against R5's 100-call free-tier ceiling, and surfaces the implications for the paid tier's 2x revenue requirement.

The cost model uses **conservative working values** for Phase 1 — the model is built from token estimates, listed API rates, and Phase-1's expected corpus size. Phase-2 production observation will replace estimates with measurements; the architecture commits to the breakdown structure rather than to specific numeric values.

The deliverable also names the **R5 cost-as-health-metric** alerts (cost trends that should trigger founder review) and surfaces the **R5 amendment** that paid-tier revenue must cover at least 2x LLM API costs incurred by that tier.

## Glossary

- **Per-request cost** — the marginal cost of one alt-3 request, broken down by layer.
- **Free-tier ceiling** — R5's 100-call/month free-tier allowance. The cost model confirms each request stays within a per-call budget that keeps 100 calls/month operationally cheap.
- **Paid-tier 2x ratio** — R5's commitment that paid-tier revenue covers at least 2x the LLM API costs incurred by paid users.
- **Build-time cost** — one-time costs (corpus embedding; index construction). Negligible at Phase-1 scale.
- **Operational cost** — recurring infrastructure (Supabase, Vercel) costs. Mostly fixed; per-request marginal.
- **Cost-as-health-metric** — R5's commitment to monitor cost trends and trigger alerts. The alert thresholds: cost spikes to 2x rolling 7-day average; total spend exceeding $100/month for Sage Ops.

## Per-request cost — three Phase-2 surfaces

The three surfaces in Phase-2 build (per AC-19 sequencing):

1. **Pass 1 — Deferral-resolution surface (D14b — `/api/mentor/private/deferral-resolve`).**
2. **Pass 2 — Daily-reflection ritual surface (D14a — `/api/mentor/private/reflect` ritual flow).**
3. **Pass 3 — Conversation surface (`/api/founder/hub` migration to alt-3 engine).**

For each, the per-request cost composes:

### Layer 1 — input translation (Sonnet)

Sonnet at temperature 0.2; prompt template per D10:

| Component | Estimate | Cost (Sonnet at $3/M input + $15/M output) |
|---|---|---|
| System block (cached after first call) | ~3,000 tokens (one-time per consumer cache key; subsequent requests are cache-hit) | $0.0001 amortised post-cache (cached at 90% discount) |
| User message (per-request) | ~800–1,500 tokens (practitioner narrative + auxiliary context) | ~$0.003 |
| Output (structured JSON) | ~500–1,000 tokens | ~$0.011 |
| **Per-call total (Sonnet, post-cache)** | | **~$0.014** |

For the `/api/score-decision` consumer (which runs Layer 1 N times — once per option, where N is 2-5), the cost scales linearly: ~$0.028–$0.070 for Layer 1 alone.

### Engine — deterministic execution

The engine runs Rules 1–10 in canonical sequence per D9. No LLM calls; pure deterministic logic with retrieval calls.

| Component | Estimate | Cost |
|---|---|---|
| Vercel function execution (engine logic, ~500ms) | included in Vercel Pro tier ($20/month flat) | ~$0 marginal |
| Retrieval calls (BM25 + vector + RRF, per D6 — typically 5-10 per request across rules) | per-call ~50ms each; pgvector + tsvector queries are sub-millisecond at Phase-1 corpus size | ~$0 marginal (Supabase free tier covers compute) |
| Query embeddings (per D5 §"Per-request embedding cost" — 1 per unique query, cached per-request) | ~$0.000003 × 5–10 unique queries = **~$0.00003** | ~$0 |
| Re-rank (heuristic per D7) | <5ms in-memory scoring | ~$0 |
| **Per-call engine total** | | **~$0.0001** |

### Layer 3 — output translation (Sonnet)

Sonnet at temperature 0.2; prompt template per D11 / D12:

| Component | Estimate | Cost (Sonnet) |
|---|---|---|
| System block (cached per-consumer; D12 §"Cache discipline") | ~5,000–8,000 tokens (one-time per consumer cache key; subsequent requests are cache-hit) | $0.0002 amortised post-cache |
| User message (per-request — engine output + diagnostics + Layer 1 features + retrieved passages summary) | ~2,000–3,500 tokens | ~$0.008 |
| Output (consumer-specific JSON) | ~500–2,000 tokens (varies by consumer — Tables 1, 2 are ~2,000 tokens; Table 4a is ~1,500; Table 4b is ~200; Table 5 is ~800) | ~$0.008–$0.030 |
| **Per-call total (Sonnet, post-cache)** | | **~$0.016–$0.038** |

### Per-request totals — by surface

| Surface | Layer 1 cost | Engine cost | Layer 3 cost | Total per request |
|---|---|---|---|---|
| **D14b deferral-resolution** (Table 4b — minimal Layer 3 output) | ~$0.014 | ~$0.0001 | ~$0.016 (Table 4b is shortest output) | **~$0.030** |
| **D14a daily-reflection ritual** (Table 4a — preserves visible output) | ~$0.014 | ~$0.0001 | ~$0.022 | **~$0.036** |
| **Conversation surface** (Tables 1+2 — full philosophical_reflection + improvement_path + oikeiosis_context) | ~$0.014 | ~$0.0001 | ~$0.032 | **~$0.046** |

### Cross-comparison with current baseline

The current baseline (today's pipeline) on `/api/mentor/private/reflect`:

- Single LLM call (Sonnet) with `REFLECTION_PROMPT` directly: ~3,000 input + ~800 output = ~$0.022 per request.

Alt-3's daily-reflection ritual (D14a Phase-2 pass 2) runs Layer 1 + engine + Layer 3:

- ~$0.014 (Layer 1) + ~$0.0001 (engine) + ~$0.022 (Layer 3) = **~$0.036**.

**Net cost increase per ritual call: ~$0.014 (~64%).** The increase is the cost of the deterministic-engine architecture: one extra Sonnet call (Layer 1) per request. The architecture's value tradeoff is the AC-12 commitment that no Stoic inference originates from Claude — the architecture pays approximately $0.014 per call for that commitment.

The conversation surface (today: `/api/founder/hub` direct LLM call ~$0.025–$0.040) similarly increases by ~$0.020 per call to ~$0.046.

## Free-tier R5 budget

R5 specifies 100 calls/month free tier. Translating to monthly cost per practitioner:

| Surface | Per-call cost | 100 calls/month cost |
|---|---|---|
| D14b deferral-resolution | $0.030 | $3.00 |
| D14a daily-reflection ritual | $0.036 | $3.60 |
| Conversation surface | $0.046 | $4.60 |
| Mixed usage (assume 50% conversation, 30% ritual, 20% deferral) | ~$0.040 average | $4.00 |

A free-tier practitioner using ~100 calls/month costs SageReasoning approximately **$4.00 in LLM costs**. Plus negligible infrastructure costs (Supabase free tier for the practitioner's data; Vercel function execution amortised across the company). Per practitioner per month: **~$4.50** including infrastructure overhead.

This is well within budget for the free tier. Even at 10x growth (1,000 practitioners on free tier), monthly LLM costs are ~$4,000 — sustainable as long as the company has revenue.

## Paid-tier R5 commitment — 2x revenue

R5 specifies: "Paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier." At ~$0.040 per call average:

| Paid tier monthly volume | LLM cost | Required minimum revenue (2x) |
|---|---|---|
| 500 calls/month | $20.00 | $40.00/month |
| 1,000 calls/month | $40.00 | $80.00/month |
| 5,000 calls/month | $200.00 | $400.00/month |

Phase-2 Stripe integration (per project instructions Priority 4) wires up paid-tier billing. The metered-billing model should reflect the per-call cost trend; pricing should ensure the 2x ratio is met across the volume tiers.

## Storage costs

Per D5 §"R5 cost compliance":

- **Phase-1 corpus index size:** ~500 passages × 1536-dim float32 vector = ~3 MB. Plus per-passage metadata (text, tags, indexes) = ~5 MB total. **Trivial at Supabase free tier (500 MB included).**
- **Per-practitioner data (reflections, profile, deferrals, deferral_resolutions):** ~10–50 MB per practitioner over a year of regular use. Encrypted at-rest per R17b for the deferral content.
- **At 100 practitioners over a year:** ~1–5 GB total. Within Supabase Pro tier ($25/month) capacity.

Storage is not the binding cost. LLM API calls dominate.

## Build-time costs (one-time)

| Activity | Cost | Frequency |
|---|---|---|
| Initial corpus embedding (~500 passages × ~50 tokens average × $0.02/M) | $0.0005 | One-time per corpus version |
| D-A16 catalogue promotion embedding (~50 stems × ~80 tokens average) | $0.00008 | One-time at promotion |
| Re-embedding on model upgrade (e.g., text-embedding-3-large evaluation) | $0.005 | At model-evaluation time |
| Schema migrations (creating tables, indexes) | $0 | One-time per migration |

Build-time costs are negligible.

## Operational costs (recurring)

| Component | Cost | Notes |
|---|---|---|
| **Vercel Pro** | $20/month | Flat rate; covers function execution |
| **Supabase Pro** | $25/month | Covers Postgres + storage at Phase-1 scale |
| **OpenAI embeddings** | ~$0.50/month | Per-request query embeddings + corpus rebuild |
| **Anthropic API** | variable per call | The dominant cost per practitioner |
| **Cohere Rerank API (if upgraded per D7)** | $0.001/call | Only when cross-encoder upgrade triggers |
| **Total fixed monthly** | ~$45/month | Excluding Anthropic per-call |

R5's $100/month Sage Ops cap applies separately to the Sage Ops pipeline (per project instructions Priority 7). The alt-3 mentor pipeline's operational costs are ~$45/month fixed plus Anthropic per-call.

## Cost-as-health-metric alerts (R5)

R5: "Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend."

The alert protocol:

1. **Baseline establishment.** Phase-2 production observation produces a 7-day rolling average daily spend per category (Anthropic API; OpenAI embeddings; Supabase queries; Vercel functions).
2. **Alert threshold.** Daily spend > 2x the 7-day rolling average for any category triggers an alert.
3. **Alert routing.** Phase-2 build implements alert delivery (email to founder; future: Slack / Sage Ops dashboard). Phase 1 design only.
4. **Founder review.** Each alert requires founder review per R5. The review identifies the cause (volume spike; per-call cost spike; integration error producing duplicate calls) and decides response (rate limit; investigate; accept).

The alerts are observability scope. Phase-2 implements; Phase-2 production tunes thresholds against observed spend.

## R5 amendment — paid-tier 2x revenue

The R5 amendment commits paid-tier revenue to cover at least 2x LLM API costs incurred by that tier. Implications for pricing:

| Per-call cost | Paid tier price (per 100 calls/month) | Margin (revenue - 2x cost) |
|---|---|---|
| $0.040 average | $8.00/month per 100 calls | $4.00/month margin |

A paid-tier practitioner at 500 calls/month at the $8/100-call rate generates $40 in revenue against $20 LLM costs ($40 in 2x cost target) — exactly at the 2x ratio. The architecture is sustainable at this pricing tier; higher-volume practitioners cross-subsidise the free tier.

The competitor-anchored pricing recommended in the project instructions Priority 4 (Stripe integration) should reflect this architecture. Phase-1 cost-model recommendation: paid tier starts at $8–$15 per 100 calls/month with metered billing for higher volumes.

## Cost trajectories — Phase 1 vs Phase 3+

The cost model is calibrated for Phase 1 (conversation surface + ritual surface + deferral-resolution surface). Phase 3+ extends to score-family endpoint migrations:

- **Per-route migration adds Layer 1 + engine + Layer 3 cost** to the score-family routes. Each migrated route adds ~$0.020–$0.040 per call vs the current direct-LLM-call cost.
- **Cumulative cost increase post-Phase-3+:** roughly +50–80% per call across the migrated routes. The architecture's value remains the AC-12 commitment; the cost is the price.

The architecture's long-term cost optimisation paths:

1. **Cache Layer 1 / Layer 3 system blocks more aggressively** (per D12 §"Cache discipline"). Already accounted for in the post-cache cost estimates.
2. **Replace Layer 1 / Layer 3 with smaller / fine-tuned models** (Phase-3+ question per the alt-3 handoff §"What Phase 1 (Alt 3) Does Not Decide"). A fine-tuned smaller model could reduce Layer 1+Layer 3 cost from ~$0.030 per call to ~$0.005 per call. The architecture is translator-agnostic.
3. **Reduce engine retrieval calls** if Phase-2 production observation surfaces redundancy. Per-request caching (D6) already reduces in-request duplicates; Phase-3+ may add server-side cross-request caching for common queries.

## Cost observations from D24

Per D24's audit, observed-state cost data is limited (no production benchmarks were taken during the audit). The audit identified per-route latency observations (Routes 1-8) without explicit cost measurements. Phase-2 production observation will:

- Measure per-route LLM token consumption against this model's estimates.
- Surface deviations (above or below) for refinement.
- Identify cost-relevant patterns (e.g., one-shot vs cached system block hit rates).

The cost model's Phase-1 estimates are working values. Phase-2 production observation refines them.

## Cleanliness rating

The per-request cost decomposition is **HIGH cleanliness** at the structural level — three layers, named components, deterministic aggregation. The numeric values are **PARTIAL cleanliness** — they are estimates from listed API rates and token counts. Phase-2 production observation produces measurements.

The free-tier and paid-tier ratios are **HIGH cleanliness** at the calculation level — the math is direct against the per-call cost.

The R5 alert specification is **HIGH cleanliness** at the threshold definition (2x rolling 7-day average) and **PARTIAL cleanliness** at the implementation (Phase-2 build chooses alert delivery and routing; the alert thresholds may tune per category).

## R5 compliance summary

- **Free tier 100 calls/month operationally cheap?** Yes — $4.50/practitioner/month all-in. Sustainable at 1000+ free-tier practitioners.
- **Paid tier 2x revenue?** Yes — pricing recommendation $8–$15 per 100 calls/month meets 2x target.
- **Sage Ops $100/month cap?** Separate scope — applies to Sage Ops pipeline (Priority 7), not alt-3 mentor.
- **Cost-as-health-metric alerts?** Specified at threshold level (2x rolling 7-day average); Phase-2 build implements.

## Open questions

1. **Embedding cost trend.** OpenAI embedding pricing has been stable; if pricing shifts, the cost model rebases. Phase-2 production observation includes vendor-pricing trend monitoring.
2. **Smaller model substitution for Layer 1 / Layer 3.** The architecture is translator-agnostic; Phase-3+ may evaluate fine-tuned smaller models. Cost evaluation is downstream of model evaluation.
3. **Cross-encoder upgrade cost (per D7).** If triggered, adds ~$0.001/call (Cohere) or ~$5/month fixed (self-hosted VM). Within budget.
4. **Per-domain pricing.** Whether different surfaces have different per-call rates (e.g., the conversation surface at premium; the score-scenario practice surface at cheap rate). Phase-1 design recommends uniform per-call pricing for simplicity; Phase 3+ may segment if observed usage patterns warrant.
5. **Revenue model granularity.** Whether paid-tier billing is per-call (metered) or per-tier (subscription with included calls). Stripe integration (Priority 4) decides; cost model supports both.

## Honest disclosure

The cost model uses estimates from listed API rates and reasonable token counts. Phase-2 production observation will produce measurements; the architecture commits to the breakdown structure rather than to specific numeric values. Observed costs may deviate ±50% from the estimates without invalidating the architecture's commitments.

R5's free-tier ceiling and 2x paid-tier ratio are met under the current cost model. If costs drift upward beyond the working estimates, the founder reviews per the cost-as-health-metric alerts; pricing adjustment is a Phase-3+ housekeeping action.

The Phase-1 surfaces' per-call costs are higher than the current baseline by ~64% on the ritual surface and ~80% on the conversation surface. The increase is the cost of the AC-12 commitment. The architectural value is the deterministic engine; the financial value is operational sustainability under R5's free-tier 100-call ceiling and paid-tier 2x ratio. Both budgets are met.

## Approval gate

This deliverable is consumed by Phase-2 build (cost-as-health-metric alert implementation), by Stripe integration (Priority 4 — paid-tier pricing), and by R5 compliance review. Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 20.*
