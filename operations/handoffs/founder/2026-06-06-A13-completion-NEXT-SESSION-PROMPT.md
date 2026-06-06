# Next-Session Prompt — A13 completion: D4 + fold-in of D1–D3 (cost-health alerts)

Paste this whole file into a new session to proceed. Canonical prompt for the next build-arc session after **A13 D5 reached Verified-live** on the `/api/reason` cost surface (founder-walked service-token TEST run; 2026-06-06).

**Stream:** founder. **Tier:** `code-elevated` — Elevated under 0d-ii (new detector(s) + extending the evaluate endpoint + a likely refactor touching the existing A9 `usage-summary` detector logic). **NOT Critical** — no auth / session / encryption / R20a-perimeter / deployment-config change. The endpoint's service-token auth is already settled (`D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03`) and is not changed here. **PR6 trip-wire:** A13 does not touch the R20a classifier, Zone 2/3 logic, or their wrappers; if any step is found to, that step reclassifies Critical and the full Critical Change Protocol (0c-ii) applies.

**Engaged process rules:** PR1 (the single-rule proof is already met by D5 — this is the *surface rollout* of the remaining detectors over the proven pattern; each new detector is still build-to-wire verified), PR2 (confirm each detector actually fires + persists — grep the call path, not the definition), PR10 (Plan→Execute→Verify with diagnostic-certainty signalling), PR13 (consider-implications — especially the cost-vs-bill distinction: detectors trigger on `anthropic_cost_cents`, not `total_cents`), PR15 (consult the existing detector module + A9's existing logic + `COST_HEALTH` + `.claude/skills/anthropic/` before any bespoke build), PR17 (founder-walked live verification uses the **service-token + `.env.development.local`** TEST process — **never** the founder login; the corrected process is codified in the build cache).

**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds; see also the standing **TEST-run process** note) + `/adopted/substrate-plugin-staging-plan.md` §A13.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A13-cost-health-alerts-D5-proof-close.md` (marked Verified-live 2026-06-06).
**Predecessor decision-log entries:** `D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03` (the build); `D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03` (service-token auth + corrected TEST process); `D-BUILD-CACHE-DRIFT-RESOLVED-2026-06-03-TEST-PROCESS-NOTE` (standing TEST-process note); `D-A13-COST-HEALTH-ALERTS-D5-VERIFIED-LIVE-2026-06-06` (the live pass).

## Founder elects the item at open

A13 D5 is Verified-live; PR1 is satisfied. This prompt's default is **completing A13** (the remaining R5 detectors), but the founder may elect a different item — say so at open and the AI re-scopes:

* **A13 completion** — D4 (per-call spike) + fold D1–D3 into the scheduled evaluator + cross-detector dedup (Elevated; ~1 session). *This prompt's default.*
* **A13 production activation** — set `SUBSTRATE_COST_ALERTS_ENABLED` + `COST_ALERTS_EVAL_TOKEN` in Vercel and create the Cowork scheduled task against the production endpoint (Critical — env-flag activation + deployment config; full Critical Change Protocol). Available now for just-D5, or after completion.
* **A15a** — R17c genuine deletion endpoint (Critical; ~1 session) — replaces the 503 placeholder; depends on A10.
* **A19** — abuse-detection + rate-limiting (Elevated; ~1 session) — consumes A12 baselines + A13's per-identity detector.

**Recommendation:** A13 completion next — it finishes the alerting layer over the proven D5 pattern while it's fresh, before activation or moving on.

## Where this sits (one paragraph)

A10 (identity) + A11b (injection defence) + A12 (OTel + audit + per-identity baseline) + **A13 D5 (per-identity cost-anomaly alert)** are all Verified-live. A13 D5 is the proven single-rule pattern: pure detector → `cost_alerts` upsert (deduped per `detector_type` + `scope` + UTC day) → service-token GET evaluate endpoint → (future) scheduled delivery to Cowork. A9 already computes the other three R5 detectors — **D1** revenue:cost ratio, **D2** $100/mo Ops cap, **D3** rolling-7-day spike — but only as **pull-only** `alerts[]` strings on `/api/billing/usage-summary`, persisted to `cost_health_snapshots`; they do **not** yet flow through `cost_alerts` or the scheduled channel. A13 completion adds **D4** (per-call spike) and routes D1–D3 through the same evaluator so all five R5 detectors deliver through one path.

## Why this session matters

R5 makes cost a health metric. D5 proved the delivery contract on one rule; completion makes the contract cover all five R5 thresholds, so the founder is told when *any* cost line trips — not only per-identity anomalies. Doing it over the proven D5 pattern, before production activation, keeps the rollout cheap (PR1's surface-rollout discipline: the pattern is proven; each detector is additive).

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A13 build + the auth correction + the Verified-live record are committed + pushed; Vercel green. Confirm `D-A13-COST-HEALTH-ALERTS-D5-PROOF-2026-06-03`, `D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03`, and `D-A13-COST-HEALTH-ALERTS-D5-VERIFIED-LIVE-2026-06-06` are all in `/operations/decision-log.md`.
2. Production unchanged: `SUBSTRATE_COST_ALERTS_ENABLED` UNSET; `COST_ALERTS_EVAL_TOKEN` UNSET in production; `cost_alerts` applied to TEST only; `SUBSTRATE_OTEL_ENABLED` UNSET; all four R20a flags `true`; injection-defence / Layer3 / plugin-install-auth flags UNSET; `/api/reason` byte-identical.
3. No work begun after the Verified-live entry — scan the decision log for any entry after `D-A13-COST-HEALTH-ALERTS-D5-VERIFIED-LIVE-2026-06-06`.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table incl. the PR17 one-line-hand-off redirect).
2. `/adopted/build-sessions-protocol-cache.md` — incl. the standing **TEST-run process** note (TEST project `iwdtrvuphogkwmovhnvz` + `.env.development.local` + a throwaway test login / the endpoint service token — never `.env.local`, never the founder login).
3. `/operations/handoffs/founder/2026-06-03-A13-cost-health-alerts-D5-proof-close.md` (predecessor close — Verified-live; production state; what's queued).
4. `/adopted/substrate-plugin-staging-plan.md` §A13 (the five detectors) + `/manifest.md` §R5 (the three thresholds + R0 oikeiosis weighting).
5. The current A13 code: `website/src/lib/cost-alerts/cost-alert-detector.ts` (the pure D5 detector + the `CostAlertType` union, where `per_call_spike` / `revenue_cost_ratio` / `ops_monthly_cap` / `rolling_7day_spike` are declared-not-implemented); `website/src/app/api/billing/cost-alerts/evaluate/route.ts` (the evaluator — D5 only; service-token gated); `website/src/app/api/billing/usage-summary/route.ts` (A9's D1–D3 inline logic + `cost_health_snapshots` writes); `website/src/lib/stripe.ts` `COST_HEALTH` (thresholds — single source of truth).
6. PR15 consult (before any design): the existing detector module + A9's detector logic + `COST_HEALTH` are the things to extend/reuse (do NOT duplicate thresholds); scan `.claude/skills/anthropic/` for a relevant pattern; check `/operations/agentic-commerce-findings-downstream-order.md` for any A13-targeting finding (none expected — F4 was A12).
7. `/operations/decision-log.md` last 3–4 entries.

Confirm at open: tier (`code-elevated`); hold-point status (P0 0h active); model selection (**N/A — A13 makes no LLM call**); status vocabulary; signals + risk class; KG scan — **KG1** (Vercel five rules) + **KG7** (JSONB) engage on the `cost_alerts` writes. Narrate before substantive work: where we are in the arc (A10/A11b/A12/A13-D5 Verified-live; A13 completion adds D4 + folds D1–D3); what's queued (production activation; Stage-1 close; A15a/A19); what's awaiting the founder vs the AI.

## Part B — Procedure (D4 follows the proven D5 pattern; the D1–D3 fold-in is design-first)

### Step 1 — Plan + PR15 consult
State whether the existing detector module + A9 logic + `COST_HEALTH` deliver the outcome before any bespoke build. Name the change, what could break (especially the A9 `usage-summary` refactor — it touches existing admin functionality), the rollback path, the verification step (lean PEV per PR10).

### Step 2 — D4 (per-call spike) — additive, mirrors D5
Add `detectPerCallSpike` to `cost-alert-detector.ts` (pure: a single loop's `anthropic_cost_cents` ≥ 2× the recent/global mean per-loop cost, with min-history + absolute-floor guards mirroring D5). Add a `COST_HEALTH` constant for the multiplier if needed (don't hard-code). Unit-test it (plain `npx tsx`, no env). Wire it into the evaluate endpoint alongside D5. PR2: confirm it fires + persists on the live path.

### Step 3 — Design the D1–D3 fold-in (Design, not Build, unless the founder signals "Build this")
The decision: how do D1 (revenue:cost ratio), D2 (Ops $100/mo cap), D3 (rolling-7-day spike) — today computed inline in `usage-summary` and persisted to `cost_health_snapshots` — also flow through `cost_alerts` + the scheduled evaluator, without duplicating logic. Options to weigh and present with reasoning: **(a)** extract A9's threshold computations into pure functions in the detector module, called from both `usage-summary` (keep its pull behaviour) and the evaluate endpoint (persist to `cost_alerts`); **(b)** have the evaluate endpoint read the latest `cost_health_snapshots` row A9 already writes and emit `cost_alerts` rows from its `alert_triggered` / `alert_reason`; **(c)** other. These are `scope = 'global'` detectors — dedup per UTC day is natural. Founder elects.

### Step 4 — Build the elected fold-in (on "Build this") + cross-detector dedup
Implement the elected option; confirm all five `detector_type`s coexist in `cost_alerts` under the `(detector_type, scope, period_date)` dedup; grep the call path (PR2).

### Step 5 — Verify (founder-walked, PR17 — service-token TEST process, never the founder login)
Extend the D5 live test. Seed a single-loop spike to trip D4; confirm a `cost_alerts` row + the evaluator returns it. For D1–D3, condition each threshold (or confirm the fold-in emits them from the existing `cost_health_snapshots` computation) and confirm rows; confirm no false positives on normal data. **Use `.env.development.local` + the service token (`curl -H "x-cost-alerts-token: …"`), TEST project (`iwdtrvuphogkwmovhnvz`) only — never the founder login.** (The codified TEST-run process is in the build cache.)

### Step 6 — Decision-log entry (lean + Elevated additions)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" + the Elevated rollback-path + verification-step detail.

### Step 7 — Session close (lean + Elevated additions)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean session close". State production state explicitly (expected UNCHANGED — additive, flag-gated). Name the next session (production activation; Stage-1 close; A15a/A19) + pre-conditions.

## What is NOT in this session
* Production activation of any alert flag/token, or the OTel/audit production rollout (separate deploy decisions; Critical).
* Slack / PagerDuty channels (the scheduled→Cowork delivery first; richer channels are a later follow-on).
* A15a / A19 (queue behind A13 completion unless the founder elects one instead).
* The AC10 manifest cross-reference (F4) — a separate governing-doc edit awaiting founder approval; do not bundle.
* Changing the endpoint's service-token auth model (settled at `D-A13-AUTH-MODEL-SERVICE-TOKEN-CORRECTION-2026-06-03`).

## Rollback path
All additive + flag-gated. If a new detector misbehaves, disable `SUBSTRATE_COST_ALERTS_ENABLED` (endpoint → 503) or `git revert` the commit; the cost surfaces return to read-only and `/api/reason` is unaffected (alerting is observability, never on the request critical path). The A9 `usage-summary` refactor (if elected in Step 3) is the one piece touching existing functionality — its rollback is `git revert`, returning `usage-summary` to its current inline behaviour.

## Forecast
Most likely: D4 is added over the proven D5 pattern and verified; the D1–D3 fold-in is designed (founder elects the approach) and, on "Build this," implemented so all five R5 detectors deliver through `cost_alerts` + the evaluator — taking A13 to Verified across the detector set. Next: A13 production activation (a Critical deploy decision — flag/token in Vercel + the Cowork scheduled task), then Stage-1 close; A15a/A19 available. The parallel legal/insurance (FPE) track + lawyer engagement remain worth starting on wall-clock whenever you choose.

End of prompt. Opens on `main`. Elevated-tier; the D1–D3 fold-in is design-first; any step found to touch the R20a classifier or its wrappers reclassifies that step to Critical (PR6).
