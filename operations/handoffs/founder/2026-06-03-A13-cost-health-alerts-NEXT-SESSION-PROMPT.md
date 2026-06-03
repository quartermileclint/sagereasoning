# Next-Session Prompt — A13: R5 cost-as-health-metric alerts

Paste this whole file into a new session to proceed. This is the canonical prompt for the next build-arc session after **A12 reached Verified-live on `/api/reason`** (founder-walked flag-ON TEST probe; 2026-06-03).

**Stream:** founder. **Tier:** `code-elevated` — Elevated under 0d-ii (new alerting logic over existing cost data + likely a new notification dependency; lean templates + Elevated additions apply). **NOT Critical** — no auth / session / encryption / R20a-perimeter / deployment-config change. **PR6 trip-wire:** A13 does not touch the R20a classifier, Zone 2/3 logic, or their wrappers; if any step is found to, that step reclassifies Critical and the full Critical Change Protocol (0c-ii) applies. **Engaged process rules:** PR1 (single-rule proof — prove ONE alert rule end-to-end before wiring the rest), PR2 (build-to-wire — confirm an alert actually fires + delivers, grep the call path not the definition), PR10 (Plan→Execute→Verify with diagnostic-certainty signalling), PR15 (consult Anthropic-canonical primitives + `.claude/skills/anthropic/` + the agentic-commerce findings tracker, AND check for an EXISTING notification/email mechanism in the repo before adding a new dependency), PR17 (any founder-performed step — notification-channel config, env vars, a scheduled-job/cron setup, deploy — walked live, click-by-click, never a one-liner).

**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/substrate-plugin-staging-plan.md` §A13.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md`.
**Predecessor decision-log entries:** `D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03` (the build) + `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03` (the live verification — A12 Verified-live).

## Founder elects the item at open

A12 is Verified-live; the Stage-1 critical path now runs through A13. This prompt is scoped to A13 (the recommended next item). If you'd rather take a different item, say so at open and the AI re-scopes:

* **A13 — R5 cost-as-health-metric alerts** (Elevated; ~1 session) — this prompt's default. Depends on A12 (met).
* **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10 identity discrimination.
* **A19 — abuse-detection + rate-limiting** (Elevated; ~1 session) — depends on A10; consumes A12's per-identity baselines.

Recommendation: **A13 next** — it turns the A12 cost/identity telemetry into live guardrails (R5), and it is small and self-contained. Then Stage-1 close work; A15a/A19 available.

## Where this sits (one paragraph)

A10 (per-install identity) + A11b (injection defence) + A12 (OTel instrumentation + call-grain audit + per-identity cost baseline) are all Verified-live. A13 adds the **alerting layer** over the cost surfaces A12 instrumented: it evaluates spend against R5's thresholds and delivers an alert when a threshold trips. A13 depends on A12 (met) — specifically `loop_billing_events` (per-loop cost + `agent_id`), `substrate_audit_events` (per-call decisions), and the per-identity baseline helper `getIdentityCostBaseline` (`website/src/lib/substrate/substrate-identity-baseline.ts`).

## Why this session matters

R5 makes cost a health metric, not an afterthought: "Paid-tier revenue must cover at least 2x the LLM API costs"; "Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend"; "Sage Ops operational costs must not exceed $100/month without explicit founder review" (`/manifest.md` §R5). A12 produced the telemetry; A13 is the part that actually tells the founder when something is wrong. Building it now — while it only has to watch one consumer (`/api/reason`) — proves the alert contract before Stage 2 broadens exposure (PR1).

## Pre-conditions (founder confirms at open; AI verifies by read)

1. A12 committed + pushed; Vercel green. (Confirmed 2026-06-03.) Confirm both `D-A12-...-AUDIT-PROOF-2026-06-03` and `D-A12-...-VERIFIED-LIVE-2026-06-03` are in `/operations/decision-log.md`.
2. A12 Verified-live (met) — `loop_billing_events`, `substrate_audit_events`, and `getIdentityCostBaseline` available as the alert inputs.
3. Production unchanged: `SUBSTRATE_OTEL_ENABLED` UNSET; `substrate_audit_events` applied to TEST only; all four R20a flags `true`; `SUBSTRATE_INJECTION_DEFENCE_ENABLED` / `SUBSTRATE_LAYER3_ENABLED` / `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `/api/reason` byte-identical.
4. No work has begun after the A12 Verified-live entry — scan the decision log for any entry after `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03`.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table incl. the PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context; the "no current users" note).
3. `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md` (predecessor close — production state; what's Verified-live; the deferred items, incl. the AC10 manifest cross-reference still awaiting founder approval).
4. `/adopted/substrate-plugin-staging-plan.md` §A13 + the Stage-1 dependency lines.
5. **R5 in full:** `/manifest.md` §R5 (the three thresholds + the oikeiosis cost weighting).
6. **The cost surfaces A13 reads (read to design accurately):** `website/src/lib/loop-cost-tracker.ts` (per-loop cost + `agent_id`; `aggregateLoopCost`); `website/src/lib/substrate/substrate-identity-baseline.ts` (`getIdentityCostBaseline` — the per-identity baseline A13 consumes); `website/src/lib/stripe.ts` (`computeLoopBill` — the bill formula, the revenue side of the ratio); the A9 cost-monitoring deliverable `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md` + `/operations/r5-cost-shape-impact-assessment-2026-05-14.md` (so A13 extends A9, not duplicates it).
7. **PR15 consult (before any design):** scan `.claude/skills/anthropic/` for a relevant pattern; check `/operations/agentic-commerce-findings-downstream-order.md` for any finding targeting A13; check Anthropic dev docs for native usage/cost-alerting (Claude Code Analytics / usage API) — but note A13 alerts on SageReasoning's OWN substrate spend, not Anthropic-account billing. **Critically, before adding any email/notification dependency, grep the repo for an existing notification mechanism** (`/notifications`, `/outbox`, the support-agent path) and prefer it (PR15 bias toward existing infrastructure + PR12 negative-finding discipline if the search returns nothing).
8. `/operations/decision-log.md` last 2–3 entries.

Confirm at open: tier (`code-elevated`); hold-point status (P0 0h active); model selection (A13 makes no LLM call — N/A per cache AC1); status vocabulary; signals + risk class; KG scan — KG1 (Vercel five rules if A13 adds DB reads/writes or a scheduled function) and KG7 (JSONB if alert state is stored as JSONB) may engage. Narrate before substantive work: where we are in the arc (A10/A11b/A12 Verified-live; A13 adds R5 alerting on the proof surface); what's queued (Stage-1 close; A15a/A19); what's awaiting the founder vs the AI.

## Part B — Procedure (design-first; Elevated lean templates + additions)

### Step 1 — Plan + PR15 consult
State whether an Anthropic-canonical primitive or an EXISTING repo notification mechanism delivers the alert channel before electing any bespoke build; record any A13-targeting finding. Name the change, what could break, the rollback path, and the verification step (lean PEV per PR10). If bespoke is elected (e.g., a new email dependency), justify in the decision-log "Reasoning" naming the primitive/existing-mechanism considered.

### Step 2 — Design the alert contract (Design, not Build, unless the founder signals "Build this")
Map each R5 threshold to a detector + a trigger cadence:
- **Revenue-to-cost ratio < 2x** (R5) — paid-tier revenue (Stripe) vs LLM cost (`loop_billing_events`); periodic.
- **Daily spend > 2x rolling 7-day average** (R5 cost-as-health threshold) — scheduled daily evaluator over `loop_billing_events`.
- **Per-call cost > 2x baseline** — on-write check after a loop bills.
- **Daily total > budgeted cap** ($100/month Ops, R5) — scheduled.
- **Per-identity anomaly (identity X spending Nx its baseline)** — uses `getIdentityCostBaseline`; on-write or scheduled.
Decide the evaluation cadence (on-write hook vs a scheduled daily job — note the founder has a scheduled-task facility), the alert channel (existing mechanism preferred), de-duplication/throttling (don't alert every minute), and an alert-state surface (so a fired alert is recorded, not just sent). Flag the F4/AC10 tie-in if relevant.

### Step 3 — Single-rule proof (PR1)
Prove ONE rule end-to-end first (recommended: the per-identity anomaly or the daily-cost-cap), threshold → detection → delivery, flag-gated + additive. Reach Verified on that one rule before wiring the other four. PR2: confirm the alert actually fires + delivers on the live path (grep + a TEST trigger).

### Step 4 — Verify
Founder-performable (walked live, PR17 — likely a TEST run reaching `localhost` + the chosen channel): seed a cost condition that trips the chosen threshold; confirm the alert fires and is delivered; AI shows the alert-state row/record; founder confirms. Confirm no false-positive on normal spend.

### Step 5 — Decision-log entry (lean + Elevated additions)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry", plus the Elevated rollback-path + verification-step detail.

### Step 6 — Session close (lean + Elevated additions)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean session close". State production state explicitly (expected UNCHANGED — additive, flag-gated). Name the next session (Stage-1 close work; A15a/A19 available) + pre-conditions.

## What is NOT in this session
* Wiring all five thresholds before the single-rule proof reaches Verified (PR1).
* Slack / PagerDuty channels (email/existing-mechanism first; richer channels are a follow-on).
* Production activation of any alert flag or the OTel/audit production rollout (separate deploy decisions).
* A15a / A19 (queue behind A13 unless the founder elects one instead).
* The AC10 manifest cross-reference (F4) — a separate governing-doc edit awaiting founder approval; do not bundle.

## Rollback path
Alerting is additive and, where feasible, flag-gated. If a detector misbehaves (false alerts, a failing scheduled job), disable the alert flag (or revert the commit) and the cost surfaces return to read-only — `/api/reason` is unaffected either way (alerting is observability, never on the request's critical path). The exact path is specified in the session's Plan step (Step 1).

## Forecast
Most likely: the alert contract is designed against the R5 thresholds, one rule (per-identity anomaly or daily-cap) is proven end-to-end on the `/api/reason` cost surface — detection + delivery via the chosen channel, flag-gated + additive — taking A13 to Verified on that rule. Next: wire the remaining thresholds, then Stage-1 close work; A15a/A19 available. The parallel legal/insurance (FPE) track + lawyer engagement remain worth starting on wall-clock whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

End of prompt. Opens on `main`. Elevated-tier; PR1 single-rule proof; any step found to touch the R20a classifier or its wrappers reclassifies that step to Critical (PR6) and the full Critical Change Protocol applies.
