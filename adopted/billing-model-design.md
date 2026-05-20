# Option D Billing Model Design — Per-Loop Base + LLM-Token-Cost Overage

**Status:** Adopted 2026-05-17 under `D-BILLING-MODEL-LOCKED-2026-05-17`. **Implementation status:** Designed (per 0a vocabulary) — the eight decisions below are specified, not built; the Option D build session (session #2 of the new post-6b arc tail) is the next sub-session.
**Stream:** founder.
**Governs:** The build spec for the Option D build session — `code-critical` risk classification expected under 0d-ii (schema migrations affecting `api_keys` + `api_key_usage`; new `loop_billing_events` ledger; Stripe webhook integration; response-header emission on the loop-producing surfaces; engages AC7 via deployment-config + access-control changes; full Critical Change Protocol applies). The eight decisions below MUST be implemented as specified; the build session has discretion on file paths, helper naming, schema-level idioms (CHECK constraints, indexes), and test structure within those constraints.
**Does not govern:** The write-path build (already Live; the write surface's metering is a downstream concern of Option D, addressed where Decision E names `loop_billing_events`'s columns). The A10 design (Adopted; will be Superseded at session #5 of the new post-6b arc tail). The six wrapped-agent pass-through fields (session #3 design pass). The K-category migration (the bundled-prose consumer migration sequencing is independent of billing). Future outcome-aligned billing variants (deferred under PR7). Future tiered-per-action billing variants (deferred under PR7).
**Sequencing:** session #1 of 6 in the new post-6b arc tail per `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2. Predecessor: the A10 design pass + post-session brainstorm (`D-ATL-A10-DESIGN-LOCKED-2026-05-16`). Successor: the Option D build session (session #2 of the new ordering).

---

## Scope

**In scope (this design):** Eight locked design decisions defining Option D's surface. Option D = per-loop base rate + LLM-token-cost overage. Replaces the current per-call (count-based) billing model — `monthly_limit=30` free / `monthly_limit=10,000` paid; ~$0.0025/call — with a billing model that meters the agent's actual unit of work (the wrapper invocation / loop) and protects the founder against LLM-cost variance by passing through Anthropic-cost overages above a base-rate-relative trigger.

- **Decision A** — Loop definition (Q1)
- **Decision B** — Base rate per loop (Q2)
- **Decision C** — Overage trigger threshold (Q3)
- **Decision D** — Overage rate (Q4)
- **Decision E** — Cost tracking surface (Q5)
- **Decision F** — Migration path for existing tier keys (Q6)
- **Decision G** — R5 enforcement transition (Q7)
- **Decision H** — Communication surface (Q8)

**Out of scope:** code (build session); schema migrations DDL text (build session writes the SQL within the columns + indexes named here); Stripe Price ID generation in the Stripe Dashboard (the build session names the new Price IDs once they exist; founder generates them in the Dashboard before deploy); the A10 credential layer (separate design; A10 supersession at session #5 of the new ordering); the six wrapped-agent pass-through fields (separate design at session #3); changes to `r20a-cost-tracker.ts` (the existing module pattern is preserved; Option D extends the pattern to cover Sonnet calls under a sibling tracker — see Decision E's structural constraint); changes to `cost_health_snapshots`'s schema (Decision G keeps its retrospective role unchanged; only its position in the R5 enforcement chain shifts from primary to secondary); changes to manifest §R5 text (Decision G keeps R5's text as-written); future outcome-aligned billing (Option B from the brainstorm) and tiered-per-action billing (Option C from the brainstorm), both deferred under PR7 with revisit conditions.

---

## The underlying motivation

The current per-API-call (count-based) billing model has two structural flaws the brainstorm surfaced (per the predecessor close's Part 2):

**Flaw 1 — The founder absorbs LLM-cost variance.** A wrapper invocation with 5 chain iterations costs the same to bill as one with 1 iteration but consumes 5x the Anthropic tokens. The price-per-call doesn't track the cost-per-call. Manifest §R5's 2x ratio ("paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier") is enforced retrospectively via `cost_health_snapshots` alerts, not built into the pricing formula. If the ratio slips below 2x, the alert fires — but the bill is already out.

**Flaw 2 — The billed unit doesn't match the value unit.** Wrappers consume 2–3 API calls per invocation (guard + score + optional iterate). The agent's *loop* — input → substrate consult → action chosen — is the actual unit of work; the API-call count is a technical artefact of how the loop is implemented. The Nate B Jones essay's CFO question — "what is the cost per completed unit of work?" — does not map cleanly to "cost per API call." Enterprise procurement reviews ask "cost per resolved support case", "cost per qualified lead", "cost per reconciled account" — the *outcome* or *task* level. Per-call billing forces customers to do that translation themselves; per-loop billing surfaces it directly.

Option D addresses both:

- **Per-loop base rate** (Decision A + B) — predictable headline price; covers ~80% of usage cleanly; matches the value-unit framing in the fair-license essay ("the meter is visible and the unit makes sense"; "the model aligns with the value created").
- **LLM-token-cost overage above a base-rate-relative trigger** (Decision C + D) — fires only on long deliberation chains; founder is protected against Anthropic-cost variance; customers absorb only the variance they cause.
- **R5's 2x ratio becomes a prospective formula** (Decision D + G) — every loop's bill is constructed such that revenue covers 2x the loop's LLM cost. `cost_health_snapshots` retains its role as a retrospective sanity check (Decision G).

A non-design note: the existing `/website/src/lib/r20a-cost-tracker.ts` already carries a working pattern for Haiku cost estimation (token counts × per-million pricing → cents → log-to-table). Option D extends this pattern to cover Sonnet calls under a sibling module and adds the per-loop aggregation surface (Decision E). The existing `/api/migrations/stripe-billing-schema.sql` already carries `stripe_customers` + `stripe_subscriptions` + `payment_events` + `cost_health_snapshots`; Option D adds `loop_billing_events` alongside these (Decision E) and reuses the existing webhook infrastructure (Decision H).

---

## Decision A — Loop definition

### Why

The model's foundation is what counts as one billable unit. Wrappers can invoke the substrate in patterns ranging from a single `/api/reason` call to multi-step orchestrations bridging `/api/reason` + `/api/score-iterate` + downstream actions. The cost-per-call meter mis-attributes work; a value-aligned meter must name a boundary that matches the agent's actual decision-making unit.

### Elected position

**One loop = one wrapper invocation.** The billable unit is the wrapper's invocation cycle (guard + score + optional iterate), regardless of how many internal API calls it bridges. The substrate names this unit explicitly via the wrapper's existing `CarriedProfile` arc — the wrapper consults the substrate, the substrate returns evaluated actions, the wrapper writes the resulting credential to `agent_accreditation` (when the write surface is enabled). The loop boundary is the wrapper's *transaction* with the substrate.

Operationally, the build session implements loop identification via a per-request `loop_id` (UUIDv4 generated at the wrapper's entry point and propagated through internal API calls via a request header). The metering layer aggregates by `loop_id`; calls sharing a `loop_id` count as one loop. Callers not setting a `loop_id` (direct `/api/reason` users not going through a wrapper) get an auto-generated `loop_id` per call — those callers' loops are 1:1 with API calls, which is the legacy behaviour and remains correct.

### Why this and not the alternatives

- **(a) `CarriedProfile` lifecycle.** Clean correspondence with the substrate's data model — consult → action → write-to-`agent_accreditation`. *Rejected* because the lifecycle ties billing to a code path that is currently inert (`SUBSTRATE_WRITE_PATH_ENABLED` UNSET; the write surface gated until A10 lands) and because callers that consult-without-persisting (read-only wrappers, evaluation-mode integrations) would not be billed at all under this definition.
- **(b) Single `/api/reason` call.** Cleanest possible meter — one route, one count. *Rejected* because wrappers spanning guard + score + iterate sequences end up billed as 2–3 loops, defeating the value-unit framing; doesn't match the agent-side notion of "one decision."
- **(c) Wrapper invocation.** *Adopted.* Matches the substrate's actual value-unit and the founder's brainstorm framing ("the agent's loop — input → substrate consult → action chosen — is the actual unit of work"). The wrapper holds the natural loop boundary; the substrate already produces a `CarriedProfile` spanning the wrapper's consult-to-action arc. The `loop_id` propagation pattern is well-precedented (HTTP request correlation IDs are a standard observability technique).
- **(d) Caller-asserted via header without auto-generation.** Maximum caller flexibility. *Rejected* because callers under-report to reduce bills; creates a meter-trust gap that no internal validation can fully close. The adopted shape uses caller-asserted `loop_id` with server-side fallback to auto-generation — same flexibility, no trust gap.

### Structural constraint

The build session adds an `X-Loop-Id` request header (optional) to `/api/reason` and `/api/score-iterate`. When present, the server validates it as a UUIDv4 and uses it as the loop key; when absent, the server generates one. The header is echoed in response headers (Decision H — `X-Loop-Id: <uuid>`) so wrappers can correlate their requests with the billing surface.

The loop is identified by `(api_key_id, loop_id)` (tuple). Two different API keys using the same UUIDv4 are billed as two separate loops (cryptographically near-impossible by accident; protected against by the api_key_id being part of the key).

### R-rule engagement

R0 (the billed unit corresponds to the agent's value-creating action — the loop — which is what makes the bill itself an honest measure of value exchanged; not a technical artefact); R5 (the loop-level boundary is what enables the prospective 2x ratio enforcement — the formula needs a "loop's LLM cost" to compute against, which requires the loop boundary to be well-defined); R9 (no outcome promises in pricing — the loop is the *work attempted*, not the *outcome delivered*; outcome-aligned billing is Option B from the brainstorm, deferred under PR7); R10 (marketplace compliance — the loop unit is consistent with the fair-license essay's "the unit makes sense" criterion); R18a (no category-language change — billing is commercial, not credential); AC7 (NOT engaged this session; engages at the build session because the metering layer touches the request-handling path of the loop-producing surfaces); AC8 (translation-sandwich substrate — the loop boundary respects the substrate's existing layer separation; metering is a Layer 4 / HTTP-transport concern, not a Layer 1 contract concern); KG1 (engaged at the build session — the metering layer's writes must be awaited; no fire-and-forget).

### Layer 1 implication

None. The loop concept is an HTTP-transport / billing-domain concern, not a Layer 1 (text → structured features) contract concern. Layer 1's input/output shapes are unchanged.

### Deferred under PR7

- **Outcome-aligned billing variant (Option B from the brainstorm).** Per-verified-outcome billing — bill on the *result* of the loop (kathekon signal? agent's downstream action acceptance?). The substrate captures a kathekon signal but it is not wired to billing. Revisit condition: real customer data on what loop-outcomes correlate with what business value (post-launch, after first paying customer engagement).
- **Tiered-per-action billing variant (Option C from the brainstorm).** Different rates for different operation classes (read vs draft vs execute, per the Nate B Jones essay's taxonomy). Revisit condition: the pass-through fields design (session #3) lands `operation_class` on `EvaluatedAction`; once the field exists and is populated, tiered-per-action billing becomes implementable. The pass-through fields session is not blocked by this; the billing implication is.
- **Wrapper-internal call orchestration that spans long-running async operations.** Current shape assumes loops complete in one HTTP request lifecycle. Revisit condition: a wrapper pattern emerges where the loop spans multiple async API calls separated by external waits (e.g., human-approval gates) — the `loop_id` then needs to persist across HTTP boundaries.

---

## Decision B — Base rate per loop

### Why

The base rate is the headline price — the number customers see in marketing copy, the number CFOs evaluate against alternatives, the number that goes into Stripe's Product/Price configuration. It must (i) be R5-compliant by construction (revenue covers at least 2x the loop's LLM cost on typical loops), (ii) be defensible against competitor benchmarks, (iii) leave operational headroom for Vercel + Supabase + monitoring + Anthropic price drift, and (iv) be presentable in a single sentence ("two cents per task").

### Elected position

**$0.02 per loop** as the base rate, applied uniformly across all surfaces (not tiered). The number was elected against a cost-per-loop estimate produced in-session (see "Cost-per-loop estimate" appendix below) and against the comparison table comparing $0.01 / $0.02 / $0.05 / tiered options.

At $0.02/loop:
- Typical loop (Anthropic cost ~$0.005): R5 ratio = 4.0x — comfortable; overage doesn't fire ($0.005 < $0.01 overage trigger per Decision C); customer bill = $0.02.
- Heavy loop (Anthropic cost ~$0.030): R5 ratio = 0.67x on the base alone — overage fires (Anthropic cost > $0.01 trigger); customer bill = $0.02 base + $0.040 overage = $0.060 (revenue/cost = 2.0x; R5 floor satisfied by construction).

The number is re-tunable pre-Stripe based on real cost distribution from the first 2–4 weeks of live operation after the Option D build deploys. Re-tuning before Stripe goes live is an Elevated edit to this design document (per 0d-ii's "Changes to existing user-facing functionality" tier — though the surface is inert pre-Stripe, the formula is governance and an Elevated edit is the right discipline). Pre-Stripe re-tuning is well within the R0 exemption window.

### Why this and not the alternatives

- **$0.01 / loop.** More aggressive pricing; closer to the current per-call rate; lower entry barrier. *Rejected* because the R5 ratio on typical loops would be 2.0x exactly — no headroom for variance, Vercel cost, Supabase cost, or Anthropic price drift. Overage would fire on most non-quick-depth loops, producing noise in invoices and an unpredictable customer experience.
- **$0.05 / loop.** Comfortable margin (10x R5 ratio on typical loops); overage almost never fires. *Rejected* because the headline number is 20x the current per-call paid-tier rate; presentation risk (sounds expensive vs competitors); may constrain adoption; pushes customers to optimise away from Sage.
- **Tiered by surface.** Different rates for `/api/reason` quick-depth ($0.01) vs standard ($0.02) vs `/api/score-iterate` chain ($0.05). *Rejected* because tiered rates violate the fair-license criterion "the unit makes sense" — customer can't forecast usage cleanly across mixed-surface workloads; presentation complexity; and the underlying LLM-cost variance is already addressed by the overage mechanism (Decisions C + D), making per-surface base-rate variation redundant.
- **$0.02 / loop.** *Adopted.* ~4x R5 ratio on typical loops; overage fires only on the heavy chains the customer is actually causing; comfortable margin for operational overhead; presentable as "two cents per task"; consistent with the fair-license essay's "model aligns with the value created" framing.

### Structural constraint

The base rate is stored as a single constant in the codebase — `LOOP_BASE_RATE_CENTS = 2` — in `/website/src/lib/stripe.ts` alongside the existing `COST_HEALTH` constants. The constant is the single source of truth; metering reads from it; Stripe Price ID configuration mirrors it; response headers (Decision H) report it. Changing the rate is a single-line edit + a Stripe Price ID regeneration + a deploy (the build session's deploy includes the initial Stripe Price ID; subsequent rate changes are Elevated under 0d-ii because they affect existing user-facing functionality post-launch).

The cents-based representation (integer; no decimals) avoids floating-point arithmetic on currency. The cents-to-dollars conversion happens at the presentation layer (response header emission; invoice rendering).

### R-rule engagement

R0 (revenue sustains the substrate — the base rate is the load-bearing input to oikeiosis-as-financial-sustainability); R5 (primary engagement — the 4x R5 ratio on typical loops is what makes the base rate R5-compliant by construction); R9 (no outcome promises in the pricing — the price is for the loop attempted, not the loop's downstream effect); R10 (marketplace compliance — pricing language is consistent across the marketplace page + api-docs + invoice rendering — the build session enforces this); R18a (no category-language change); AC7 (NOT engaged this session); KG1 (engaged at the build session — the constant must be read transactionally with metering writes; no race between rate-read and bill-construction).

### Layer 1 implication

None.

### Deferred under PR7

- **Real-cost-distribution-based re-tuning.** First 2–4 weeks of live operation produce per-loop cost distributions; the base rate may be re-tuned (up or down) based on what the typical-loop cost actually proves to be. Revisit condition: 2 weeks post Option D build deploy + Stripe activation. Re-tuning is Elevated under 0d-ii.
- **Per-customer pricing (negotiated rates).** Enterprise customers may request per-customer base rates as part of negotiated contracts. Current shape assumes one global rate. Revisit condition: first enterprise contract negotiation (post-launch).
- **Volume discounts.** Tiered base rates for high-volume customers. Revisit condition: customer-segment data on volume distribution (post-launch).
- **Marketplace-specific pricing.** Different rates per marketplace (Cowork vs anthropics/skills vs Claude Code Plugins). Revisit condition: first marketplace listing requires it.

---

## Decision C — Overage trigger threshold

### Why

The overage mechanism fires only when a loop's Anthropic cost exceeds a threshold. Without a threshold, every loop's bill is constructed from Anthropic cost + margin (which is functionally a cost-plus model, not a per-loop model — defeats Decision B's predictability). With a threshold, the base rate covers typical loops cleanly and only the heavy-deliberation outliers trigger pass-through. The threshold's *shape* — fixed token count vs fixed USD cost vs base-rate-relative — determines the model's stability against Anthropic price drift.

### Elected position

**The threshold is 50% of the base rate.** Overage fires when a loop's Anthropic cost exceeds `LOOP_BASE_RATE_CENTS × 0.5` cents. At the Decision B base rate of $0.02, the threshold is $0.01 of Anthropic cost per loop.

Self-balancing property: if Anthropic prices shift (up or down), the threshold relative to the base rate stays put — `OVERAGE_TRIGGER_RATIO = 0.5` is the structural relationship; the absolute USD threshold tracks the base rate. If the founder raises the base rate to $0.03/loop, the threshold automatically becomes $0.015. This avoids the periodic re-tuning that fixed-cost or fixed-token thresholds would require.

### Why this and not the alternatives

- **(a) Fixed Anthropic-token count per loop.** Overage fires above e.g. 50,000 combined input + output tokens. *Rejected* because token-cost-per-million varies between Haiku and Sonnet (current ratio ~5x); a token-count trigger fires at different USD-cost-per-loop depending on model mix; less stable than a USD-relative or base-rate-relative trigger. Also: Anthropic could change token-count-to-cost ratios independently of headline price (input-vs-output ratio shifts), further detaching the trigger from economic reality.
- **(b) Fixed USD-cost per loop.** Overage fires when Anthropic cost > a fixed cents value (e.g., $0.01). *Rejected* because the threshold needs explicit re-tuning every time Anthropic changes pricing or the founder changes the base rate; couples to a price point not a structural relationship. The build session would need to ship with a re-tuning runbook; not great.
- **(c) Multiple of the base rate.** *Adopted.* Self-balancing if Anthropic prices shift; the multiplier (`OVERAGE_TRIGGER_RATIO`) stays put. Preserves the headroom math at Decision B's chosen base rate. The structural relationship is "overage kicks in when the LLM cost approaches half of what we're charging" — a natural defence of the base rate's headroom.

### Structural constraint

The trigger ratio is stored as `OVERAGE_TRIGGER_RATIO = 0.5` in `/website/src/lib/stripe.ts` alongside `LOOP_BASE_RATE_CENTS`. The overage check at billing-time is: `if (anthropic_cost_cents > LOOP_BASE_RATE_CENTS * OVERAGE_TRIGGER_RATIO) { overage_fired = true; overage_cents = (anthropic_cost_cents - LOOP_BASE_RATE_CENTS * OVERAGE_TRIGGER_RATIO) * 2; }` — where the `* 2` comes from Decision D. The threshold cost itself is *kept* by the base rate (not refunded if the loop is cheaper than the threshold); only the *excess* triggers the overage.

The ratio is a floating-point constant but the threshold arithmetic happens in integer cents to avoid floating-point rounding errors. The build session implements the threshold check carefully: `LOOP_BASE_RATE_CENTS * OVERAGE_TRIGGER_RATIO` is computed once at module load and stored as an integer cents value rounded down (`Math.floor`).

### R-rule engagement

R0 (the threshold's self-balancing property is what makes the formula durable against external price changes — operational sustainability); R5 (primary engagement — the threshold + Decision D's overage rate together ensure the prospective 2x ratio holds in the worst case); R9 (no outcome promises); R10 (marketplace compliance — the threshold formula is explainable in plain language); R18a (no category-language change); AC7 (NOT engaged this session); KG1 (engaged at the build session — the threshold-check arithmetic is part of the metering write path; must be deterministic and well-tested).

### Layer 1 implication

None.

### Deferred under PR7

- **Per-model trigger ratios.** Different ratios for Haiku-heavy loops vs Sonnet-heavy loops. Current shape uses one global ratio. Revisit condition: real cost data shows the global ratio mis-calibrates against the actual model mix in practice.
- **Time-varying trigger ratios.** Ratio that adjusts based on rolling cost averages. Current shape uses a fixed ratio. Revisit condition: a multi-month cost trend pattern emerges (e.g., post-launch growth in chain-iteration usage) that warrants dynamic adjustment.
- **Per-customer trigger ratios.** Negotiated thresholds in enterprise contracts. Revisit condition: first enterprise negotiation requests it.

---

## Decision D — Overage rate

### Why

When the overage fires, the customer's bill increases by the overage amount. The *rate* — how much per unit of Anthropic cost above the threshold — determines whether R5's 2x ratio holds prospectively on heavy loops (the loops the overage exists to address).

### Elected position

**Overage rate = Anthropic cost above threshold × 2.** The overage is computed as `(anthropic_cost_cents - threshold_cents) * 2`. R5's 2x ratio is instantiated *at the loop level* by construction — every overage loop satisfies R5 because the overage adds exactly 100% margin on the excess Anthropic cost. The base rate covers up to the threshold (at the R5-comfortable 4x ratio per Decision B); the overage covers the excess at the R5-floor 2x ratio.

Worked example at base rate = $0.02, threshold = $0.01, overage rate = ×2:
- Loop with Anthropic cost = $0.005 → no overage; customer bill = $0.02; revenue/cost ratio = 4.0x.
- Loop with Anthropic cost = $0.01 → overage fires at threshold; overage = ($0.01 - $0.01) × 2 = $0; customer bill = $0.02; revenue/cost = 2.0x (at R5 floor).
- Loop with Anthropic cost = $0.02 → overage = ($0.02 - $0.01) × 2 = $0.02; customer bill = $0.04; revenue/cost = 2.0x.
- Loop with Anthropic cost = $0.03 → overage = ($0.03 - $0.01) × 2 = $0.04; customer bill = $0.06; revenue/cost = 2.0x.

The pattern is: as Anthropic cost rises above the threshold, the customer's bill rises 2x as fast as the Anthropic cost; revenue/cost asymptotes to 2.0x from above (never goes below). R5's floor is satisfied by construction at every loop, regardless of how heavy the deliberation gets.

### Why this and not the alternatives

- **(b) Anthropic cost × 2.5 (fixed multiplier).** Adds headroom for operational overhead beyond raw LLM cost (Vercel function-time, network, retry cost). *Rejected* because the base rate already covers operational overhead via the 4x R5 ratio on typical loops; the overage's job is the *variance protection*, not double-charging for overhead the base rate already covered. Presentation risk — customers may read 2.5x as opportunistic margin.
- **(c) Tiered multiplier.** More margin on bigger overages (e.g., 2x for 1.5–2x base; 2.5x for 2–3x; 3x above). *Rejected* because complexity violates "the unit makes sense"; tiered curves match the rent-seeking pattern the fair-license essay specifically warns against ("credits expire unused while overages bill immediately"); over-architected for pre-launch.
- **(a) Anthropic cost × 2 (margin).** *Adopted.* Directly instantiates R5's 2x ratio at the loop level; predictable formula; explainable to customers ("we pass through Anthropic cost plus a margin that matches our minimum cost ratio"); honest — not punitive. Simplest possible shape that satisfies R5 by construction.

### Structural constraint

The overage multiplier is stored as `OVERAGE_RATE_MULTIPLIER = 2.0` in `/website/src/lib/stripe.ts`. The overage computation at billing-time is:
```
overage_cents = max(0, (anthropic_cost_cents - threshold_cents) * OVERAGE_RATE_MULTIPLIER)
overage_fired = overage_cents > 0
total_loop_cents = LOOP_BASE_RATE_CENTS + overage_cents
```

All arithmetic in integer cents. `OVERAGE_RATE_MULTIPLIER` is a float, but the `*` operation rounds to integer cents (`Math.round`) — the build session standardises this in a helper (`computeLoopBill(anthropic_cost_cents) -> { base_cents, overage_cents, total_cents, overage_fired }`).

### R-rule engagement

R0 (the formula's R5-by-construction property is what makes the substrate's revenue model financially sustainable in the steady state); R5 (PRIMARY engagement — the prospective 2x ratio holds on every loop because of this decision); R9; R10; R18a; AC7 (NOT engaged this session); KG1.

### Layer 1 implication

None.

### Deferred under PR7

- **Asymmetric overage multipliers (input vs output token cost).** Anthropic prices input tokens lower than output tokens (~5x ratio); the overage could weight them asymmetrically. Current shape treats them as one summed cost. Revisit condition: real data shows the output-heavy loops mis-bill.
- **Customer-side overage caps.** Stripe Project quotas or per-key monthly maximums on overage spend (the fair-license criterion "the buyer can set caps"). Current shape has no per-customer cap — the bill just keeps adding overages. Revisit condition: enterprise customer requests it OR a customer racks up a surprisingly high bill that warrants a post-hoc credit. *Control-layer mapping (added 2026-05-20, from `/inbox/AI Agent Shipping readiness.rtfd`): this is the configuration half of the **payment-layer (Layer 4) kill switch** the control-layer essay names — "the payment system can freeze the instrument or spending limit independently of the agent's logic." Together with Decision H's budget-cap enforcement (the enforcement half), it is currently a deferred gap. The essay elevates this for any money-touching agent: a runaway agent's spend must be freezable without the agent cooperating. The revisit condition is strengthened — this is the Layer 4 kill switch, not merely a fairness nicety.*
- **Configurable per-customer multipliers.** Negotiated lower multipliers for volume customers. Revisit condition: first enterprise contract negotiation.

---

## Decision E — Cost tracking surface

### Why

Option D requires per-loop cost data to be persisted somewhere — to compute bills, render invoices, audit the R5 ratio, and answer customer queries. The shape of this surface determines (i) write-path performance on `/api/reason` and `/api/score-iterate`, (ii) the cost of monthly invoice rendering, (iii) the cost of R5 retrospective sanity checks (Decision G), and (iv) the cost of customer-facing forensic queries ("why was this loop billed at $0.06?").

### Elected position

**Both — extend `api_key_usage` for aggregates + new `loop_billing_events` append-only ledger for forensic granularity.**

(i) `api_key_usage` extensions (additive — existing columns preserved):
```
ALTER TABLE public.api_key_usage
  ADD COLUMN IF NOT EXISTS loop_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS anthropic_cost_cents INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS billed_cents INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS overage_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS overage_cents INTEGER DEFAULT 0 NOT NULL;
```
These columns are the monthly bucket aggregate; the existing atomic-increment RPC (`increment_api_usage`) is extended to also increment loop-level fields when a loop boundary is detected. The build session updates the RPC signature and the call site.

(ii) `loop_billing_events` new table (append-only ledger):
```
CREATE TABLE IF NOT EXISTS public.loop_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id UUID NOT NULL,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  agent_id TEXT,
  surface TEXT NOT NULL,                  -- 'api_reason' | 'api_score_iterate' | 'wrapper_internal'
  base_cents INTEGER NOT NULL,
  threshold_cents INTEGER NOT NULL,
  anthropic_cost_cents INTEGER NOT NULL,  -- sum across all calls in the loop
  overage_fired BOOLEAN NOT NULL DEFAULT false,
  overage_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,           -- base_cents + overage_cents
  internal_calls INTEGER NOT NULL,        -- count of internal API calls within the loop
  models_used TEXT[],                     -- e.g., {'haiku-4-5','sonnet-4-6'}
  total_input_tokens INTEGER NOT NULL DEFAULT 0,
  total_output_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (api_key_id, loop_id)
);
CREATE INDEX IF NOT EXISTS idx_loop_billing_events_key_month
  ON public.loop_billing_events(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loop_billing_events_loop_id
  ON public.loop_billing_events(loop_id);
```

The two surfaces serve different consumers cleanly: `api_key_usage` is the fast-aggregate quota-check surface (existing pattern — millisecond-scale lookups on a single row per key per month); `loop_billing_events` is the forensic / invoice / R5-audit surface (full granularity; queried at month-end for Stripe invoice rendering and at any time for customer forensic queries).

The build session ports the existing `r20a-cost-tracker.ts` pattern to a sibling `loop-cost-tracker.ts` module that handles Sonnet pricing (input + output token rates per model) alongside Haiku, with per-call cost estimation that aggregates by `loop_id` into a single `loop_billing_events` row at the loop's terminal call. The aggregation happens server-side at the response-construction point — *not* fire-and-forget (KG1 compliance).

### Why this and not the alternatives

- **(a) Extend `api_key_usage` alone.** Adds the loop-level fields to the monthly bucket; reuses the existing RPC; no new table. *Rejected* because it loses per-loop forensic granularity — the fair-license criterion "usage data exports cleanly" is hard to satisfy if invoices have to be reconstructed from aggregates; no audit-trail for individual overage events; customer forensic queries ("why was this loop billed at $0.06?") have no per-loop surface to query.
- **(b) `loop_billing_events` alone.** Single append-only ledger. *Rejected* because quota checks on `/api/reason` would need to aggregate this table per-call (slow at scale); would break the existing atomic-increment RPC pattern that supports today's per-call quotas; either we keep `api_key_usage` for quotas and add `loop_billing_events` for forensic (= option c, adopted), or we re-design quotas around aggregates of `loop_billing_events` (much bigger surgery; not appropriate for this session's scope).
- **(c) Both.** *Adopted.* Each table serves its consumer optimally. `api_key_usage` keeps the existing quota path fast; `loop_billing_events` is the forensic surface. The two are reconciled at month-end via a single aggregate query — the invoice generator reads `loop_billing_events`, the quota checker reads `api_key_usage`, and a periodic consistency check verifies that `api_key_usage.billed_cents` for a month equals `sum(loop_billing_events.total_cents)` for the same key + month.

### Structural constraint

The build session adds:

(i) **Schema migration** in a new file `/api/migrations/option-d-billing-schema.sql` (idempotent — `IF NOT EXISTS` clauses; the SQL above is the canonical DDL).
(ii) **Updated RPC** — `increment_api_usage` extended to optionally take `loop_id`, `anthropic_cost_cents`, `billed_cents`, `overage_fired` params; if `loop_id` is provided, the RPC also writes a `loop_billing_events` row in the same transaction. The transactional posture is load-bearing — both the aggregate increment and the ledger insert must succeed or fail together; failure between them leaves the data inconsistent (KG1 rule 2 + the fair-license criterion "the meter is visible" both engaged here).
(iii) **New module** `/website/src/lib/loop-cost-tracker.ts` — sibling to `r20a-cost-tracker.ts`. Exports `estimateCallCostCents(model, input_tokens, output_tokens)`, `aggregateLoopCost(loop_id)`, `recordLoopBilling(api_key_id, loop_id, anthropic_cost_cents, surface, ...)`. Per-model pricing constants for Haiku-4-5 + Sonnet-4-6 (the two models the substrate uses per AC1); pricing constants live in this module, not duplicated in `r20a-cost-tracker.ts`. If Anthropic pricing changes, this is the single file to edit.
(iv) **Modified `r20a-cost-tracker.ts`** — minimal change. The R20a classifier-cost tracking continues to use its existing path (no schema change to `classifier_cost_log`). However, when the classifier runs *inside a loop* (e.g., the wrapper's guard call is a R20a classifier invocation), the classifier's cost is *also* added to the loop's `anthropic_cost_cents`. The two trackers share the per-call cost estimation primitive (re-exported from `loop-cost-tracker.ts`) but write to separate tables.
(v) **Integration points** at `/api/reason` and `/api/score-iterate` — at the response-construction point of every call, the metering layer (a) computes the call's Anthropic cost, (b) accumulates into the loop's aggregate, (c) at the terminal call of a loop, computes the bill via `computeLoopBill` and writes the `loop_billing_events` row, (d) increments `api_key_usage` aggregates via the extended RPC.

The build session must instrument the existing `score-iterate` chain-iteration enforcement so that all iterations in a chain share the same `loop_id` and aggregate into one billing event.

### R-rule engagement

R0 (the persistent cost record is what makes the R5 ratio auditable across time — the long-term oikeiosis audit trail of the substrate's financial sustainability); R3 (no PII in billing events — `agent_id` is the wrapper-supplied identifier; no end-user personal information); R4 (no engine internals in billing events — `models_used`, token counts, and surface names are all R4-compliant operational fields); R5 (PRIMARY engagement — the cost surface is what makes R5 enforcement implementable); R9 (no outcome data in billing events — `total_cents` is the bill, not the outcome); R10 (marketplace compliance — the billing events are the canonical audit surface for any marketplace billing reconciliation); R18a (no category-language change); AC7 (NOT engaged this session; engages at the build session — new table, modified RPC); AC8 (substrate-internal change; no Layer 1 contract change); AC10 (provenance — `loop_billing_events` is the upstream surface F4 in `agentic-commerce-findings-downstream-order.md` names; A12's OpenTelemetry integration links to it post-launch); KG1 (engaged at the build session — every write awaited; no fire-and-forget; transactional RPC for aggregate + ledger consistency); KG7 (NOT engaged — `models_used` is a text array, not JSONB).

### Layer 1 implication

None.

### Deferred under PR7

- **`loop_billing_events` partitioning + retention policy.** Table will grow large at scale. Current shape has no partitioning. Revisit condition: 1M+ rows OR a query-performance issue surfaces.
- **Loop-level RLS policies.** Currently `api_key_usage` has no user-facing RLS (admin-only via service role). `loop_billing_events` will follow the same pattern. Revisit condition: customer-facing dashboards need direct RLS-gated access (vs API-mediated).
- **A12 OpenTelemetry integration over `loop_billing_events`.** Real-time observability surface for distributed tracing. Per F4 in the agentic-commerce findings tracker. Revisit condition: A12 scheduled.
- **Customer-facing usage dashboard.** A read-only UI surface over `loop_billing_events` for customers to inspect their own loops. Revisit condition: post-launch — first customer requests it.
- **Webhook emission on loop-billing events.** Real-time webhook to customer endpoints when overages fire. Revisit condition: customer requests it OR a billing-anomaly use case surfaces.

---

## Decision F — Migration path for existing tier keys

### Why

The current `api_keys` table holds existing ecosystem keys (`sr_live_<32 hex>`) with `tier='free'` or `tier='paid'`, `monthly_limit`/`daily_limit`/`max_chain_iterations` set per the existing per-call model. The Option D model uses different concepts (loops, base rate, overage). Existing keys must land in the new model somehow. The migration shape determines whether the per-call rate config continues to coexist with per-loop, and whether existing customers need to take any action.

### Elected position

**Full cutover — existing keys auto-convert; per-call rates retired.** At Option D build deploy:
(i) all existing `api_keys` rows are tagged as `billing_model='per_loop'` (a new column added in the build session's schema migration);
(ii) the existing `monthly_limit` / `daily_limit` / `max_chain_iterations` columns are *kept* (they retain meaning as anti-abuse caps — a free-tier key still gets 30 loops/month and 1 loop/day, not 30 calls/month);
(iii) `tier='free'` keys are auto-converted such that `monthly_limit=30` now means "30 loops/month" (still 1/day effective);
(iv) `tier='paid'` keys are auto-converted such that `monthly_limit=10,000` now means "10,000 loops/month", `daily_limit=500` means "500 loops/day", `max_chain_iterations=3` is *kept* as a per-loop constraint (a loop can have up to 3 internal chain iterations within `/api/score-iterate`);
(v) the per-call rate configuration retires — the existing competitor-anchored per-call pricing (the ~$0.0025/call paid-tier rate) is removed from any pricing documentation, marketplace pages, and api-docs; the build session updates `STATUS-REVENUE-MODEL.md` to mark Task 4 + Task 5's per-call pricing rationales as Superseded by this design.

The "no current users" governing note (build-arc cache 2026-05-10) is the load-bearing premise: only founder + test logins exist; there is no third-party customer to coordinate with, grandfather, or notify. The migration is internal-only. When real customers exist post-launch, the cutover-as-policy ends; future model changes will follow contracted-renewal rules (the fair-license criterion "the rate card holds for the term without quiet changes after adoption").

### Why this and not the alternatives

- **(a) Grandfather existing keys at current per-call rates.** *Rejected* because there are no third-party keys to grandfather; over-engineering for a non-state.
- **(b) Mandatory migration at a flag-day with customer re-issuance.** *Rejected* because there are no customers to coordinate with; punitive shape for a problem that doesn't exist.
- **(c) Opt-in V2 — `billing_model` column; existing keys default to `per_call`; new keys default to `per_loop`.** Future-proofs for the post-launch state where real customers exist. *Rejected* because it builds for a state that doesn't exist; adds schema + code complexity now to serve future flexibility that may be designed differently when real customers exist. The post-launch evolution path (when it matters) may not be the V2-column shape anyway — it may be an entirely different model.
- **(d) Full cutover — existing keys auto-convert; per-call rates retired.** *Adopted.* Operationally clean; "no current users" simplification applies; the existing schema's `monthly_limit`/`daily_limit`/`max_chain_iterations` retain meaning as anti-abuse caps (just over loops instead of calls); per-call rate documentation retires cleanly.

### Structural constraint

The build session adds:
(i) **Schema migration** — adds `billing_model` column to `api_keys`:
```
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS billing_model TEXT NOT NULL DEFAULT 'per_loop'
    CHECK (billing_model IN ('per_call', 'per_loop'));
```
The CHECK constraint allows `per_call` as a value to support future-state opt-in if needed (deferred under PR7). All existing rows default to `per_loop` at column-add time. New rows default to `per_loop`.

(ii) **No code path branches on `billing_model`** at deploy — all keys are `per_loop`; the per-call code paths (existing `increment_api_usage` increments without `loop_id` argument) become unreachable in production. The build session may choose to retain them as dead code for one release cycle (for rollback safety) or remove them. Recommendation: retain for one release cycle, then a follow-on Standard-risk session removes them.

(iii) **`STATUS-REVENUE-MODEL.md`** — the build session appends a header note: "**Superseded by `/adopted/billing-model-design.md` (D-BILLING-MODEL-LOCKED-2026-05-17)** for Tasks 4 + 5 (free/paid tier pricing rationales). Tasks 1, 2, 3, 6, 7, 8 (IP protection, JSON file stripping, server-side asset protection, baseline retake limits, discovery files, consistency verification) remain in force." The supersession edit is Elevated under 0d-ii.

(iv) **Marketplace + api-docs pages** — the build session edits `/website/public/llms.txt`, `/website/public/.well-known/agent-card.json`, and `/AGENTS.md` to remove per-call rate references and replace with per-loop language. Specific edits per the build session's discretion within the constraint "consistent language across all three surfaces."

(v) **Stripe Price ID** — the founder generates a new Price ID in the Stripe Dashboard for the per-loop billing (the existing per-call Price IDs retire or are repurposed). The build session names the env var (`STRIPE_PER_LOOP_PRICE_ID`) and the founder fills it in pre-deploy. The existing `STRIPE_DEVELOPER_PRICE_ID` is renamed or retained per the build session's discretion within the constraint "the per-call Price IDs are not in production use post-deploy."

### R-rule engagement

R0 (the migration is itself an act of stewardship — the substrate's financial sustainability is improved by retiring a flawed model); R5 (the cutover is what makes the prospective formula operative in production); R9 (no outcome promises in the migration mechanics); R10 (marketplace compliance — the consistent language across marketplace + api-docs + invoice surfaces is preserved); R18a (no category-language change); AC7 (engaged at the build session via the schema change to `api_keys`); KG1 (the migration is a single transactional schema change; reversible via ALTER TABLE DROP COLUMN); PR7 (existing-customer migration deferred until customers exist).

### Layer 1 implication

None.

### Deferred under PR7

- **Multi-model billing coexistence.** Post-launch, customers may negotiate per-call OR per-outcome OR per-action OR per-loop. The `billing_model` column supports two values today; the CHECK constraint allows future expansion. Revisit condition: first enterprise customer negotiates non-per-loop billing.
- **Per-customer rate cards.** Negotiated rates that override the global `LOOP_BASE_RATE_CENTS`. Current shape uses one global rate. Revisit condition: first enterprise contract.
- **Grandfathering policy.** When real customers exist, model changes will follow contracted-renewal rules (fair-license criterion). The current cutover policy applies only pre-launch. Revisit condition: first paying customer is signed.
- **Removal of the dead per-call code paths.** Retain for one release cycle for rollback safety; then remove. Revisit condition: 2 weeks of stable Option D operation in production OR the founder elects earlier removal.

---

## Decision G — R5 enforcement transition

### Why

Manifest §R5 currently reads: "Paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier. ... Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend." The rule is enforced *retrospectively* — `cost_health_snapshots` records period-level revenue + LLM cost; if the ratio slips below 2x, an alert fires. Option D's formula (Decisions B + C + D) enforces the same 2x ratio *prospectively* — every loop's bill is constructed such that revenue covers 2x the loop's LLM cost. The question is what happens to the retrospective surface.

### Elected position

**Keep `cost_health_snapshots` as a sanity check on the formula; R5 manifest text stays as-written.** Option D's formula becomes the *primary* R5 enforcement (every loop is R5-compliant by construction); `cost_health_snapshots` becomes the *secondary* enforcement (aggregates the same data retrospectively; fires an alert if the ratio nevertheless slips — which would indicate a bug in the formula, an accounting error, a new-feature surprise cost, or a misattribution between billing and Anthropic invoicing). The two are complementary; defence-in-depth.

The R5 manifest text already supports both interpretations — "Paid-tier revenue must cover at least 2x" is satisfied prospectively *and* retrospectively. No manifest amendment needed (the cache-update discipline is avoided; this session stays governance-Standard). The retrospective alert continues to fire if the ratio slips; the prospective formula is what makes slipping rare in the steady state.

The `cost_health_snapshots` table schema is unchanged. The existing aggregation queries continue to run. The only operational change is that the founder reading the cost-health dashboard post-launch sees consistent 2x+ ratios (because the formula enforces it) — the alert is now an *exception* signal, not a *normal-state* signal. If the alert fires post-launch, it triggers a formula audit, not a price hike.

### Why this and not the alternatives

- **(b) Replace retrospective entirely.** Option D formula is the only enforcement; `cost_health_snapshots` retired or repurposed. *Rejected* because (i) no independent verification — if the formula has a bug, R5 violations could persist undetected; (ii) loses the ability to audit revenue:cost across periods independent of the per-loop billing path; (iii) removes a working safety net for marginal effort savings.
- **(c) Rewrite R5 manifest rule.** Amend R5 to name the prospective formula as primary + retrospective as secondary. *Rejected* because (i) the existing text already accommodates both interpretations; (ii) amending a manifest rule is Elevated under 0d-ii and engages the cache-update discipline — unnecessary work this session; (iii) future operational changes to the enforcement mechanism (e.g., different formula structure) would force successive R5 amendments — better to keep R5's text high-level and let the operational details live in this design + the cache.
- **(a) Keep `cost_health_snapshots` as sanity check.** *Adopted.* Defence-in-depth; no manifest change; minimal build-session work (zero schema change on the cost-health side); preserves the independent retrospective audit trail.

### Structural constraint

The build session ensures:
(i) The existing `cost_health_snapshots` aggregation queries continue to read from `api_key_usage` + `payment_events` as today; the new columns added to `api_key_usage` (Decision E) integrate cleanly — the aggregation may optionally use the new `billed_cents` and `anthropic_cost_cents` columns for more precise ratios (the build session has discretion on whether to update the aggregation query in this build or in a follow-on Standard-risk session).
(ii) The alert-firing logic (R5 alerts at 2x rolling 7-day average daily spend, per the manifest) is unchanged.
(iii) The build session's session-close documents that the cost-health alert is now an *exception* signal; the founder's mental model post-launch should be "if the cost-health alert ever fires under Option D, that indicates a formula bug or accounting error — escalate immediately."

### R-rule engagement

R0 (the retrospective surface is part of the long-term oikeiosis audit trail — what makes the substrate's financial sustainability verifiable independent of the billing path); R5 (PRIMARY engagement — the rule's enforcement mechanism shifts from retrospective to prospective+retrospective; manifest text unchanged); R9; R10; R18a; AC7 (NOT engaged this session); KG1 (the alert-firing path's writes continue to be awaited; no change).

### Layer 1 implication

None.

### Deferred under PR7

- **R5 manifest amendment to formalise the prospective/retrospective split.** Revisit condition: real operational experience shows the manifest text needs disambiguation OR a future formula change creates ambiguity about R5's primary enforcement mechanism.
- **`cost_health_snapshots` schema extension.** Could add a `prospective_ratio_at_period_end` column to record what the formula said the ratio should be (vs the retrospective actual). Revisit condition: a divergence between prospective and retrospective is observed and warrants forensic tracking.
- **Alert escalation paths.** Currently an alert fires; the founder reviews. Post-launch with paying customers, the alert may need automatic escalation (Sage Ops integration; SMS notification). Revisit condition: customer-facing operations require it.

---

## Decision H — Communication surface

### Why

How per-loop billing is surfaced to the caller determines (i) whether wrappers can be "cost-aware" (the Nate B Jones essay's builder section: "the agent surfaces cost per task and lets the customer cap usage before it becomes a budget incident"), (ii) whether customers can reconcile against accounting (invoices are the canonical billing surface for that), and (iii) whether the meter satisfies the fair-license criterion "the meter is visible and the unit makes sense."

### Elected position

**Both — response headers + invoices.** Every `/api/reason` and `/api/score-iterate` response (when invoked under per-loop billing) carries response headers:
```
X-Loop-Id: <uuid>                       -- the loop this call belongs to (Decision A)
X-Loop-Cost-Cents: <integer>            -- total bill for this loop (cumulative if mid-loop; final at terminal call)
X-Anthropic-Cost-Cents: <integer>       -- cumulative Anthropic cost for the loop
X-Overage-Fired: <true|false>           -- whether overage has fired at this point
X-Overage-Cents: <integer>              -- overage component of the bill (0 if not fired)
X-Loop-Internal-Calls: <integer>        -- how many internal API calls this loop has consumed (cumulative)
```

The headers are observability-only — the actual bill is invoiced via Stripe at month-end. The headers let wrappers implement cost-aware logic (e.g., "if `X-Overage-Fired: true`, log a warning and consider a cheaper code path next loop"; "if `X-Loop-Cost-Cents > customer_budget`, alert the customer").

Stripe webhook + monthly invoice rendering: at month-end, the invoice generator reads `loop_billing_events` for the customer's `api_key_id`s and produces a per-loop line-item invoice (or aggregated invoice depending on customer preference — invoice rendering shape is a build-session detail). The webhook flow uses existing Stripe infrastructure (`payment_events` table; `getOrCreateStripeCustomer` helper; etc.).

### Why this and not the alternatives

- **(a) Response headers only.** Maximum real-time visibility. *Rejected* because no canonical billing surface; customers can't reconcile against accounting; bypasses Stripe's invoice rendering and audit-trail discipline.
- **(b) Invoices only.** Simplest implementation — cost data lives only in monthly statements. *Rejected* because "the meter is hidden until renewal" — the rent-seeking pattern the fair-license essay specifically warns against; agents cannot be cost-aware in real time.
- **(c) Both.** *Adopted.* Directly addresses fair-license criteria "the meter is visible", "usage data exports cleanly", "cost-aware agents", "the buyer can set caps" (with the headers feeding a cap-enforcement loop on the wrapper side). Caveats: headers are observability-only (the actual bill is invoiced); `X-Overage-Fired` distinguishes typical loops from outliers.

### Structural constraint

The build session adds:
(i) **Response-header emission** at `/api/reason` and `/api/score-iterate` — the metering layer (Decision E's integration points) accumulates per-loop state and emits the six headers at every response in the loop. The header values reflect *cumulative* state at the point of the response, not just the current call. The cumulative state is read from the loop's in-flight aggregation (held in-memory if the loop spans one HTTP request; persisted to `loop_billing_events` at the terminal call).
(ii) **`CORS_RESPONSE_HEADERS`** — the existing CORS configuration must include the new `X-Loop-*` headers in `Access-Control-Expose-Headers` so browser-side wrappers can read them. Same-origin callers (current default) are unaffected.
(iii) **Stripe webhook integration** — the build session reuses the existing `constructWebhookEvent` + `logPaymentEvent` pattern from `/website/src/lib/stripe.ts`. The new webhook handler responds to `invoice.created` / `invoice.finalized` events, queries `loop_billing_events` for the customer's loops in the period, and renders the line-items (or summary) on the invoice. The build session has discretion on whether line-items are per-loop (granular) or per-day-aggregate (compact); recommendation is per-day-aggregate with a per-loop detail downloadable as CSV (matches "usage data exports cleanly").
(iv) **API-docs page** — the build session updates `/AGENTS.md` and `/website/public/llms.txt` and `/website/public/.well-known/agent-card.json` to document the per-loop billing model and the response headers. Specific copy per the build session's discretion within the constraint "consistent language across all surfaces."

The build session's verification step (per `0c`) is the founder running a `curl -i` against `/api/reason` with a paid-tier key and confirming the response headers carry the expected fields with sensible values.

### R-rule engagement

R0 (the visible-meter discipline is part of the substrate's R0-oikeiosis-as-financial-honesty — telling customers what they're being charged in real-time is a relational integrity act); R3 (no PII in response headers — `X-Loop-Id` is a UUID; the other fields are integer cents); R4 (no engine internals in response headers — the fields are billing-domain, not engine-domain); R5 (the secondary R5 engagement — the headers let customers verify the 2x ratio holds on their own loops); R9 (no outcome promises in headers — the fields are work-attempted billing, not work-completed); R10 (marketplace compliance — the headers + invoice surfaces are the canonical billing-data surfaces for any marketplace's reconciliation needs); R18a (no category-language change); AC7 (engaged at the build session — modifies the request-response cycle of the loop-producing surfaces); AC8 (substrate-internal; no Layer 1 contract change); KG1 (engaged — every write awaited; no fire-and-forget on the cumulative-state aggregation; the response-header emission is synchronous with the response construction).

### Layer 1 implication

None.

### Deferred under PR7

- **Webhook emission on overage-fired events.** Real-time webhook to customer endpoints (instead of just response headers) when overages fire. Revisit condition: customer requests it OR a billing-anomaly use case surfaces.
- **Customer-facing usage dashboard.** A read-only UI surface for customers to inspect their own loops. Revisit condition: post-launch — first customer requests it.
- **Budget-cap enforcement.** When a customer's monthly bill crosses a configurable threshold, future loops 429 with "budget cap reached". Current shape has no enforcement — the customer absorbs the bill. Revisit condition: enterprise customer requests it OR a customer racks up a surprisingly high bill that warrants post-hoc caps. *Control-layer mapping (added 2026-05-20, from `/inbox/AI Agent Shipping readiness.rtfd`): this 429-the-next-loop mechanism IS the active form of the **payment-layer (Layer 4) kill switch** — it freezes spend independently of the agent's logic, satisfying the essay's "doesn't depend on the agent cooperating" requirement. The essay flags Layer 4 as a critical (not yellow) gap for any agent that can spend money. Because the substrate's loops bill through Option D, this is the substrate-wide payment kill switch: A10 (`/adopted/atl-a10-design.md` §Control-layer alignment) covers Layers 1/2/3; the purpose-discovery product (`/drafts/purpose-discovery-product-design.md` Q-OPEN-14) covers Layer 5; this deferred item is Layer 4. A future session could close all of Row 5 / Layer 4 by electing the enforcement mechanism here.*
- **OpenTelemetry trace fields in response headers.** A12 will integrate `loop_billing_events` with OpenTelemetry; the response headers may eventually include trace IDs. Revisit condition: A12 scheduled.
- **GraphQL / JSON-RPC billing query surface.** Programmatic access to per-loop billing data. Revisit condition: customer use case surfaces.

---

## Cost-per-loop estimate (appendix)

Reproduced from the in-session Step 2 Round 1 estimate (the basis for Decision B's elected base rate).

The substrate doesn't have precise per-call cost telemetry on `/api/reason` yet — that wiring lands at the Option D build session. The numbers below are based on the `r20a-cost-tracker.ts` pricing model (Haiku) extended to Sonnet via standard Anthropic per-million pricing, plus typical token volumes per call observed in development.

**Anthropic cost per loop (approximate)**

| Loop type | Calls in loop | Approx Anthropic cost |
|---|---|---|
| `/api/reason` quick-depth (Haiku) | 1 | ~$0.001–$0.002 |
| `/api/reason` standard (Sonnet) | 1 | ~$0.005–$0.010 |
| Wrapper: guard + score | 2 | ~$0.005–$0.010 |
| Wrapper: guard + score + 1 iterate | 3 | ~$0.010–$0.020 |
| Wrapper: guard + score + 3 iterates (paid-tier max) | 5 | ~$0.020–$0.040 |

**Customer-side bill at the elected formula ($0.02 base + $0.01 threshold + ×2 overage)**

| Scenario | Anthropic cost | Base | Overage | Total bill | R5 ratio |
|---|---|---|---|---|---|
| Typical (no iterate) | $0.005 | $0.02 | $0 | $0.020 | 4.0x |
| One iterate | $0.012 | $0.02 | $0.004 | $0.024 | 2.0x |
| Three iterates (paid-tier max) | $0.030 | $0.02 | $0.040 | $0.060 | 2.0x |
| Quick-depth | $0.002 | $0.02 | $0 | $0.020 | 10.0x |

The formula's asymptotic behaviour: as Anthropic cost rises above the threshold, the customer bill rises ×2 as fast; R5 ratio asymptotes to 2.0x from above; never goes below.

**Re-tuning note:** these estimates will be re-tuned against real cost distributions from the first 2–4 weeks of live operation post Option D build deploy. Re-tuning is an Elevated edit to this design document; well within the R0 exemption window pre-launch.

---

## Build-session implementation summary table

Expected file changes for the Option D build session (session #2 of the new post-6b arc tail):

| File | Change | Rationale |
|---|---|---|
| `/api/migrations/option-d-billing-schema.sql` | NEW — idempotent SQL for the `api_keys.billing_model` column, the five `api_key_usage` extensions, the `loop_billing_events` table + indexes | Decision E + F schema work |
| `/api/migrations/stripe-billing-schema.sql` | MODIFIED — add `loop_billing_events` to the schema description; reference Decision E | Cross-reference + documentation |
| `/website/src/lib/stripe.ts` | MODIFIED — add `LOOP_BASE_RATE_CENTS`, `OVERAGE_TRIGGER_RATIO`, `OVERAGE_RATE_MULTIPLIER` constants; add `computeLoopBill(anthropic_cost_cents)` helper; document the new constants in the file-header `Rules served` block | Decision B + C + D constants |
| `/website/src/lib/loop-cost-tracker.ts` | NEW — sibling to `r20a-cost-tracker.ts`; per-model pricing constants (Haiku-4-5 + Sonnet-4-6); `estimateCallCostCents`, `aggregateLoopCost`, `recordLoopBilling` functions | Decision E new module |
| `/website/src/lib/r20a-cost-tracker.ts` | MODIFIED — minor — re-export `estimateCallCostCents` from `loop-cost-tracker.ts` to share the primitive (or vice versa, build-session discretion); add an integration point so classifier costs also accumulate into the parent loop's `anthropic_cost_cents` when inside a wrapper invocation | Decision E integration |
| `/api/api-keys-schema.sql` | MODIFIED — extend the file-header documentation of `api_key_usage` to describe the new loop-level columns; the `increment_api_usage` RPC's signature extends with optional `loop_id`, `anthropic_cost_cents`, `billed_cents`, `overage_fired` params | Decision E RPC extension |
| `/website/src/app/api/reason/route.ts` | MODIFIED — wire the metering layer at request entry (generate-or-extract `loop_id`) and at response construction (compute call cost; accumulate into loop aggregate; write `loop_billing_events` at terminal call; emit response headers) | Decision A + E + H integration |
| `/website/src/app/api/score-iterate/route.ts` | MODIFIED — same as `/api/reason` plus: ensure all chain iterations within one `score-iterate` invocation share the same `loop_id` and aggregate into one billing event; the existing `max_chain_iterations` enforcement is preserved | Decision A + E + H integration |
| `/website/src/app/api/stripe/webhook/route.ts` (or sibling) | MODIFIED OR NEW — add invoice-rendering handler that reads `loop_billing_events` and renders per-day or per-loop line items | Decision H Stripe integration |
| `/website/src/lib/security.ts` | MODIFIED — minor — update file-header comments to reflect per-loop billing instead of per-call (where the comments describe the tier system) | Decision F documentation alignment |
| `/AGENTS.md` | MODIFIED — replace per-call rate references with per-loop language; document the response headers | Decision F + H discovery files |
| `/website/public/llms.txt` | MODIFIED — same as AGENTS.md | Decision F + H discovery files |
| `/website/public/.well-known/agent-card.json` | MODIFIED — same as AGENTS.md | Decision F + H discovery files |
| `/business/STATUS-REVENUE-MODEL.md` | MODIFIED — add header note marking Tasks 4 + 5 as Superseded by this design | Decision F supersession |
| Test files | NEW — `loop-cost-tracker.test.ts`; modifications to `route.test.ts` for `/api/reason` and `/api/score-iterate` exercising the metering layer + response headers + the `X-Loop-Id` propagation | PR2 build-to-wire verification |
| Environment | NEW env var `STRIPE_PER_LOOP_PRICE_ID` — founder generates the Stripe Price ID in the Dashboard pre-deploy; build session names the env var | Decision F Stripe integration |
| `/operations/decision-log.md` | NEW entry — `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-YYYY-MM-DD` (full form per Critical risk) | Decision-log discipline |
| Session close | NEW — `/operations/handoffs/founder/YYYY-MM-DD-billing-model-build-close.md` (full form per Critical) | Session-close discipline |

Expected Option D build session: ~3–4 hr; **Critical** risk under 0d-ii; full Critical Change Protocol applies (per 0c-ii).

---

## Cross-references

- `/operations/decision-log.md` — `D-BILLING-MODEL-LOCKED-2026-05-17` (this design's adoption entry)
- `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` — Part 2 — the predecessor scoping source (post-brainstorm Option D election + new sequencing)
- `/adopted/atl-a10-design.md` — structural template for this design's nine-decision-shape (extended here to eight decisions); A10 design Adopted, will be Superseded at session #5 of the new post-6b arc tail
- `/api/api-keys-schema.sql` — the existing per-call schema this design extends (Decisions E + F)
- `/api/migrations/stripe-billing-schema.sql` — the existing Stripe + cost-health schema this design extends (Decisions E + G + H)
- `/website/src/lib/stripe.ts` — the existing Stripe helpers + `COST_HEALTH` constants; Option D's constants land here (Decision B + C + D)
- `/website/src/lib/r20a-cost-tracker.ts` — pattern source for `loop-cost-tracker.ts` (Decision E)
- `/business/STATUS-REVENUE-MODEL.md` — Task 4 + Task 5 of which this design supersedes (Decision F)
- `/inbox/Related to agent API billing.rtf` — the Nate B Jones companion essay; "What a fair SaaS agent license looks like" section is the external benchmark this design cites (per the predecessor close's Part 2)
- `/inbox/20260508-262-promptkit-1.md` — the Nate B Jones prompt kit (Agent System Touch Map; Renewal Interrogation) — relevant to session #3's pass-through fields design, not Option D's billing scope
- `/manifest.md` §R5 — the rule Option D operationalises as a prospective formula (Decision G keeps R5's text as-written)
- `/manifest.md` AC7 — engaged at the Option D build session (deployment-config + access-control changes)
- `/manifest.md` AC8 — substrate translation-sandwich respected; Layer 1 contract unchanged across all decisions
- `/operations/agentic-commerce-findings-downstream-order.md` F4 — `loop_billing_events` is the upstream provenance surface F4 names for A12's AC10 implementation
- `/adopted/standing-protocol-cache.md` — governing frame (Lean template; governance row; Standard risk default)
- `/adopted/build-sessions-protocol-cache.md` — "no current users" governing note (Decision F load-bearing premise)

*End of design document.*
