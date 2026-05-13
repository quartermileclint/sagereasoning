# R5 Cost-Shape Impact Assessment (J6)

**Status:** Adopted as a governance input — not a binding decision. **Revisable** in place via dated follow-up edits when cost shape changes materially (e.g. Stage 3 plugin migration; pricing changes; new substrate consumers).
**Date:** 2026-05-14.
**Author session:** A9 + J6 cost-monitoring session.
**Governing rule:** `/manifest.md` §R5 — "Paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier. … Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend."
**Cross-references:** `/adopted/substrate-plugin-staging-plan.md` §A9 + §J6; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`; `/website/src/lib/translation-sandwich/parallel-run.ts` §"COST CALCULATION"; `/website/src/app/api/billing/usage-summary/route.ts`.

---

## 1. Current cost shape (pre-substrate baseline)

Pre-M1-CP6 the bundled-engine `/api/reason` path made one Sonnet call per request: the engine ran multi-mechanism reasoning end-to-end inside a single prompt. Per-request cost was the Sonnet input + output token cost for that one call. Cost capture was implicit — no per-request column on a dedicated row; aggregate inference came from Anthropic billing.

R5's alert design ("2x the rolling 7-day average daily spend") was authored against this shape. The alert assumed a single-call cost profile per request and a per-day aggregate that would scale linearly with traffic.

---

## 2. Substrate path cost shape (post-M1-CP6, current state on 2026-05-14)

The translation-sandwich engine replaces the bundled engine on `/api/reason` post-M1-CP6 cutover (D-PARALLEL-RUN-CUTOVER-2026-05-08).

Per request:
- **Layer 1 — extractFeatures.** One Sonnet call. Multi-step structured feature extraction. Cost = `sonnetCostMicrocents(layer1.input_tokens, layer1.output_tokens)`. Captured in `translation_sandwich_comparisons.layer1_cost_usd_microcents` (column added M1-CP4f, 2026-05-07).
- **Layer 2 — deterministic mechanism evaluation.** Zero LLM cost. Mechanisms run on TypeScript code (cost is CPU time on Vercel serverless, captured as latency, not LLM spend).
- **Layer 3 — generateProse.** One Sonnet call. Per-consumer prose generation. Cost captured in `translation_sandwich_comparisons.layer3_cost_usd_microcents`.

**Total per-request LLM cost (current production):** `layer1_cost + layer3_cost`, both captured on the same comparison row at request close. Both fields are nullable; nulls occur when either layer threw before usage was recorded.

**Cost data freshness:** every successful `/api/reason` request writes a comparison row. The row is the authoritative per-request cost record. The legacy `translation_sandwich_cost_tracker` singleton counter is NOT updated in the production `runSandwich` path (the increment is wired only in the deprecated `runParallelSandwich`).

**A7 production state at this assessment:** `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; A7 adds no LLM call (it reuses the route-level Safety Gate's classifier result). A7 has no direct impact on cost shape. When the flag flips ON, A7 reuses the existing classifier call — no new spend.

**A5 production state at this assessment:** `SUBSTRATE_LAYER3_ENABLED` UNSET; the standalone Layer 3 service returns 503. Cost on the substrate path today is purely the `/api/reason` two-call shape above.

---

## 3. Future cost shape (plugin paradigm, Stage 3 onward)

Per the staging plan §Stage 3 and the J1 ADR (Character Kernel category): the plugin runs Layer 1 locally on the agent developer's substrate. Plugin-originated requests arrive at SageReasoning's Layer 2 API already pre-extracted.

For plugin-originated traffic (Stage 3+):
- **Layer 1 cost** shifts to the plugin operator. SageReasoning pays $0.
- **Layer 2 cost** remains near-zero (deterministic).
- **Layer 3 cost** remains a Sonnet call SageReasoning pays for.

**Total per-request LLM cost (plugin path, future):** `layer3_cost` only.

For human-facing `/api/reason` traffic (the website surface), cost shape is unchanged from §2: `layer1_cost + layer3_cost`. The two cost shapes coexist post-Stage-3; they do not replace each other.

**Layer 1 cost migration timing:** this cost shift is gated on Stage 3 plugin-tools work (per the staging plan dependency map). Until Stage 3, all `/api/reason` traffic — including any plugin-originated traffic that exists in interim — pays Layer 1 cost server-side. This assessment treats the §3 shape as a forward-looking expectation, not current state. **Operational implication:** for the period between today and Stage 3 close, cost monitoring should treat the §2 shape as the live one; the §3 shape becomes live only when plugin migration completes.

---

## 4. R5 2x revenue:cost ratio implications

R5 requires paid-tier revenue to cover at least 2x the LLM API costs incurred by that tier.

**Current state (§2 shape):** ratio is `paid_tier_revenue / (sum_of_layer1_costs + sum_of_layer3_costs across paid-tier requests)`. The denominator is captured per-row in `translation_sandwich_comparisons`. The ratio is computable directly from existing data. Today's implementation in `/api/billing/usage-summary/route.ts` uses a heuristic `totalApiCalls × $0.005` instead — closing that gap is A9 Option B's first deliverable.

**Future state (§3 plugin shape):** for plugin-originated traffic, the denominator drops by the Layer 1 share. For SageReasoning's bottom line, this is favourable (cost per plugin-call lower); for R5's 2x threshold, the math is self-adjusting (revenue:cost ratio improves all else equal, so the threshold becomes easier to satisfy). No change to the 2.0x multiplier is recommended on this basis.

**Mixed-traffic implication:** if human-facing and plugin-originated traffic are aggregated into a single ratio, plugin growth could mask human-facing cost regression (or vice versa). The metric remains compliant in aggregate while one path silently breaks the ratio.

**Recommendation (informs A9 Option B):** when plugin-originated traffic becomes non-trivial (Stage 3 onward), split the revenue:cost metric into per-path components alongside the aggregate. Today the substrate is the sole path for `/api/reason`, so the aggregate is sufficient. Add the per-path split at Stage 3 kickoff, not earlier — premature complexity.

---

## 5. Alert threshold recommendations

**The "2x rolling 7-day average daily spend" alert (R5 second sentence).** This alert is currently NOT WIRED in code. The constant `ROLLING_AVERAGE_ALERT_MULTIPLIER: 2.0` exists in `/website/src/lib/stripe.ts` but no code path reads it. A9 Option B scaffolds the alert by computing the 7-day rolling average from `translation_sandwich_comparisons` and comparing today's total against `2.0 × average`.

- **Multiplier (2.0x):** keep as-is. The R5 rule's intent is to flag spikes that are clearly outside normal variance. 2.0x is a conservative floor; finer tuning is a steady-state ops question, not an A9 question.
- **Window (7 days):** keep as-is. R5 names it explicitly.
- **Aggregation grain:** by calendar UTC day (matches `cost_health_snapshots.period_start` discipline; matches how Sage Ops costs are tracked).
- **Cold-start behaviour:** alert should not fire when the rolling window has fewer than 3 days of data (insufficient signal). A9 Option B implements this as a "minimum days observed" precondition.

**The 2x revenue:cost ratio alert (R5 first sentence).** Already wired in `/api/billing/usage-summary/route.ts`. Threshold `MIN_REVENUE_TO_COST_RATIO: 2.0` is correctly named. A9 Option B re-points the cost source from heuristic to substrate data — threshold itself unchanged.

**Per-path alert split (forward-looking, Stage 3 trigger).** Recommended posture: keep alerts on the aggregate today; add per-path metrics (human-facing vs plugin-originated) when plugin traffic becomes non-trivial. The split protects against the §4 masking risk. Revisit at Stage 3 kickoff.

**Cap-per-period alerts (cost guardrail backup).** The legacy `translation_sandwich_cost_tracker` was an M1-CP4 device for the parallel-run testing window — a hard cost cap that short-circuits the sandwich when reached. The cap is NOT incremented in the production `runSandwich` path today. Re-activating it carries the risk of accidentally short-circuiting live `/api/reason` traffic (the M1-CP4 defaults are $50 / 1000 requests / 14 days — those values were never updated for the sole-engine state). **Recommendation: do NOT re-activate the cost-tracker increment in production until the cap defaults are reviewed against the substrate path's expected traffic and cost shape.** This is the explicit gap A9 Option B does not close.

---

## 6. Layer 1 cost migration timing — operational expectation

| Period | Cost shape | Alert posture |
|---|---|---|
| **Today → Stage 3 close** | Substrate sole engine; Layer 1 + Layer 3 both server-side; cost per request = `layer1_cost + layer3_cost` | Aggregate alerts on `translation_sandwich_comparisons`. A9 Option B's wiring is sufficient. |
| **Stage 3 close → steady state** | Mixed traffic: human-facing (§2) + plugin-originated (§3) | Per-path split alongside aggregate; ratio threshold unchanged (2.0x); rolling-7-day multiplier unchanged (2.0x). |
| **Plugin-only future (if it ever happens)** | All Layer 1 shifts off SageReasoning's books | Threshold math self-adjusts; revisit "what does 2x mean" if revenue and cost both drop proportionally. |

The transition is not flag-flipped — it's gradual, traffic-mix driven. The metric should evolve as the traffic does, not pre-empt it.

---

## Open questions

1. **Cap defaults review.** The `translation_sandwich_cost_tracker` cap defaults ($50 / 1000 req / 14 days) were authored for M1-CP4 parallel-run testing. If we ever wire the increment into production (deferred from today's A9 scope per Option B vs Option C election), the defaults need a deliberate review. Revisit condition: explicit founder direction to activate production cost-cap short-circuiting.

2. **Per-path metric split trigger.** §4 and §5 recommend the split at "Stage 3 kickoff" or "when plugin-originated traffic becomes non-trivial." Non-trivial is undefined. Working definition: 10% or more of `/api/reason` traffic over a 7-day window is plugin-originated, OR Stage 3 close is reached, whichever comes first.

3. **Alert delivery surface.** R5 names the alert but does not name where it fires. Today the alerts surface as a `health: warning` field on the admin `/api/billing/usage-summary` response. This is pull-not-push — only fires when the admin visits the endpoint. Push-style alert delivery (email, webhook, scheduled task that triggers a notification) is out of scope for A9 Option B. Revisit condition: founder direction OR Sage Ops activation (P7).

---

## Cross-references

- `/manifest.md` §R5 (Free Tier and Cost Guardrail)
- `/manifest.md` §R15 (Sage Ops Operational Boundaries — out of scope for A9 but cited by R5)
- `/adopted/substrate-plugin-staging-plan.md` §Stage 1 A9; §Stage 1 J6; §Stage 3 plugin migration
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (J1 ADR)
- `/website/src/lib/translation-sandwich/parallel-run.ts` — `sonnetCostMicrocents`, `readCostTracker`, `incrementCostTracker`, comparison-row cost capture
- `/website/src/app/api/billing/usage-summary/route.ts` — current R5 alert mechanism
- `/website/src/lib/stripe.ts` `COST_HEALTH` constants
- `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` — schema reference
- `/website/migrations/2026-05-04-translation-sandwich-cost-tracker.sql` — schema reference; cap-period device

*End of assessment. Inputs to A9 Option B threshold decisions: keep 2.0x multipliers, keep 7-day window, aggregate-only for now, defer per-path split + cap-tracker re-activation.*
