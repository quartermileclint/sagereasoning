# A13 — R5 Cost-as-Health-Metric Alerts — Design (DRAFT)

**Status:** Draft — implementation status **Designed**, pending founder approval to build. Not adopted.
**Date:** 2026-06-03.
**Stream:** founder. **Tier:** `code-elevated` → Elevated (0d-ii). PR6 not engaged (no R20a / classifier / Zone 2–3 / wrapper touch). AC7 not engaged.
**Rules served:** R5 (primary), R0 (cost weighed against circles of concern), AC10 (reads the F4 provenance surface), PR1, PR2, PR3, PR15, PR17, KG1, KG7.
**Channel elected by founder (2026-06-03):** scheduled check → persisted alert log → surfaced in Cowork. No new app email/notification dependency.
**Session mode elected:** design only; stop for approval before any code.

---

## 1. Plain-language summary (what this is)

R5 says cost is a health metric, not an afterthought. A9 (2026-05-14) already built the *detecting* half: an admin page (`/api/billing/usage-summary`) that, when you open it, computes whether spend has crossed an R5 line and records it. The problem: **it only fires when you go and look.** Nobody is watching for you.

A13 adds the *watching and telling* half. On a schedule, it runs the cost checks for you, writes any tripped alert into a record (so there's a history, not just a one-off message), and reports new alerts to you here in Cowork — without you opening anything, and without adding any new paid service to the app. It never sits on the path of a real `/api/reason` request, so it can never slow down or break the live product. If it ever misbehaves, switching it off returns everything to exactly how it is today.

---

## 2. The five detectors (R5 thresholds → checks)

R5's three sentences plus the two finer-grained checks the prompt names. "A9 already?" shows what exists versus what A13 adds.

| # | Detector | R5 anchor | Data source | A9 already? | A13 work |
|---|---|---|---|---|---|
| D1 | Revenue-to-cost ratio **< 2×** | "revenue must cover ≥ 2× the LLM costs" | `computeLoopBill` (revenue) vs `loop_billing_events.anthropic_cost_cents` (cost), summed over period | **Yes** (in usage-summary) | Move the check into the scheduled evaluator; persist + deliver. *Note: Option D billing enforces ≥2× prospectively by construction, so D1 is a defence-in-depth sanity check.* |
| D2 | Sage Ops monthly spend **> $100** | "Ops costs must not exceed $100/month" | `cost_health_snapshots` / ops cost state; `COST_HEALTH.SAGE_OPS_MONTHLY_CAP_CENTS` | **Yes** | Same — fold into scheduled evaluator |
| D3 | Daily spend **> 2× rolling-7-day average** | "alerts trigger at 2× the rolling 7-day average daily spend" | daily spend totals over a 7-day window; cold-start guard (≥3 days observed) | **Yes** | Same — fold into scheduled evaluator |
| D4 | Per-call cost **> 2× baseline** | R5 intent (catch a single runaway loop) | one loop's `total_cents` vs recent mean per-loop cost | **No** | **New detector** |
| D5 | Per-identity **> N× baseline** | R5 + A12 baseline ("identity X spending Nx its baseline") | `getIdentityCostBaseline(agentId)` (A12) vs the identity's recent spend | **No** | **New detector — the PR1 single-rule proof (see §6)** |

The thresholds themselves are **not new constants** — they already live in `COST_HEALTH` (`/website/src/lib/stripe.ts`): `MIN_REVENUE_TO_COST_RATIO: 2.0`, `SAGE_OPS_MONTHLY_CAP_CENTS: 10000`, `ROLLING_AVERAGE_ALERT_MULTIPLIER: 2.0`. A13 adds one for the per-identity multiple (proposed `PER_IDENTITY_ANOMALY_MULTIPLIER: 2.0`) and reuses the rest. Single source of truth preserved.

---

## 3. Architecture (three pieces, all off the request path)

Because the channel is "scheduled check," every detector runs in **one scheduled evaluator** rather than some on-write and some scheduled. This keeps all alerting logic in one place, entirely off the `/api/reason` hot path (PR3 is satisfied trivially — alerting is observability, never part of building a response).

**Piece 1 — Detector module** (`website/src/lib/cost-alerts/cost-alert-detector.ts`, new)
Pure functions: given cost data in, return a list of `CostAlert` objects out (type, scope, observed value, threshold, multiple, human message). No database, no I/O — so it is fully unit-testable without credentials. Reuses `COST_HEALTH` constants; does not duplicate them.

**Piece 2 — Evaluate-and-persist endpoint** (`website/src/app/api/billing/cost-alerts/evaluate/route.ts`, new; admin-authed; flag-gated)
Reads the cost surfaces (`loop_billing_events`, `cost_health_snapshots`, `getIdentityCostBaseline`), runs the detector module, writes any newly-tripped alert to the alert-state table (§4), and returns the alerts created this run. Mirrors the existing `/api/billing/usage-summary` pattern (admin endpoint, server-side near the data). Inert behind a flag (proposed `SUBSTRATE_COST_ALERTS_ENABLED`) until activated.

**Piece 3 — Scheduled trigger + delivery to Cowork**
A Cowork scheduled task (created at build time, with you, per PR17) runs daily: it calls the evaluate endpoint (admin-authed) and reports any new alerts to you in this project. "Delivery" = the scheduled task surfacing the new `cost_alerts` rows. No app email dependency; no Vercel cron needed.

```
  daily schedule ──▶ Cowork scheduled task ──▶ POST /api/billing/cost-alerts/evaluate (admin)
                                                      │
                          reads loop_billing_events,  │ runs detector module (D1–D5)
                          cost_health_snapshots,       ▼ writes tripped alerts ──▶ cost_alerts table
                          getIdentityCostBaseline      │
                                                      ▼
                          returns new alerts ──▶ scheduled task reports them to you in Cowork
```

`/api/reason` is **not touched** anywhere in this design.

---

## 4. Alert-state surface (a fired alert is recorded, not just sent)

**Recommendation: a new `cost_alerts` table** (rather than overloading `cost_health_snapshots`). Reason: the existing snapshots table is a per-period singleton (one health summary per period); the per-identity and per-call alerts are row-grained (one per identity or per loop). Mixing them muddies both. New table = additive, affects nothing existing.

Proposed columns:

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid pk | row id |
| `detector_type` | text | `revenue_cost_ratio` \| `ops_monthly_cap` \| `rolling_7day_spike` \| `per_call_spike` \| `per_identity_anomaly` |
| `scope` | text | `'global'` for D1–D4; the `agent_id` for D5 |
| `severity` | text | `warning` (R5 alerts are warnings; `critical` reserved) |
| `period_date` | date | UTC day the check covers |
| `observed_value` | numeric | the measured number (e.g. today's spend in cents) |
| `threshold_value` | numeric | the line it crossed |
| `multiple` | numeric | how far over (e.g. `3.2` for 3.2× baseline) |
| `message` | text | plain-language alert string |
| `details` | jsonb | structured extras (KG7 applies on write) |
| `created_at` | timestamptz default now() | when detected |
| `notified_at` | timestamptz null | set when surfaced to you (de-dup of delivery) |

**De-dup unique index** on `(detector_type, scope, period_date)` — a standing condition fires **once per scope per day**, not every run. The scheduled task reports only rows with `notified_at IS NULL`, then stamps them. KG1 (every write awaited; no fire-and-forget) and KG7 (JSONB shape) engage on this table at build.

---

## 5. False-positive guards (carried from A9 + added for the new detectors)

- **D3 rolling-7-day:** ≥3 days of data before it can fire (A9 already does this).
- **D5 per-identity:** `getIdentityCostBaseline` returns `null` when an identity has no history → no alert. Add a **minimum-history guard** (proposed ≥5 loops) so a 2nd loop can't trivially "spike," and a **minimum-absolute floor** (ignore identities whose spend is below a few cents) so near-zero baselines don't generate noise.
- **D4 per-call:** guard against tiny denominators (need a meaningful recent mean before flagging).

These guards are exactly what the verify step (§6) checks: a normal-spend identity must produce **no** alert.

---

## 6. PR1 single-rule proof — D5 (per-identity anomaly)

Per PR1, one rule is proven end-to-end to **Verified** before the others are wired. **D5 is the recommended proof rule** because (a) it's genuinely new — D1–D3 already exist, so proving them re-proves nothing; (b) it exercises the entire new path (A12 baseline helper → detector → `cost_alerts` write → scheduled delivery), so proving it proves the whole contract; (c) it uses A12's purpose-built `getIdentityCostBaseline`.

Build steps (executed **only** on your "build this"):
1. Migration for `cost_alerts` (TEST first) + the detector module (D5 only) + the evaluate endpoint (D5 only) behind `SUBSTRATE_COST_ALERTS_ENABLED`.
2. **PR2 build-to-wire:** grep the call path to confirm the scheduled task actually invokes the endpoint and a row is written + reported — not merely that the function compiles.
3. **Verify (founder-walked, PR17 — reaches `localhost`, which Cowork can't):** seed a TEST identity with ≥5 normal loops, then add one loop at ≥2× its baseline; run the evaluator; confirm a `cost_alerts` row is written and the scheduled task reports it; confirm a normal-spend identity produces **no** alert.
4. Only after D5 is Verified → add D4, then fold D1–D3 into the same scheduled evaluator (all five deliver through one path), then confirm de-dup across all five.

---

## 7. Risk + rollback

Elevated. Everything is additive and flag-gated. Rollback at any depth: disable `SUBSTRATE_COST_ALERTS_ENABLED` (or delete the scheduled task, or revert the commit) → the new endpoint goes inert and the cost surfaces return to read-only. **`/api/reason` is unaffected in every case** — alerting is observability, never on the request's critical path. (Exact rollback command specified in the build session's Plan step.)

**Data-surface note for build:** `loop_billing_events` exposes `agent_id`, `total_cents`, `anthropic_cost_cents` (confirmed in-repo). Its **timestamp column name is not yet confirmed in-repo** (A12 deferred this — the table was created via the Supabase SQL Editor). The all-time baseline (D5 proof) needs no timestamp, so the proof is unblocked; *windowed* per-identity baselines (a later refinement) will need the column confirmed first.

---

## 8. Not in this design / session

- No code (design only).
- Not wiring all five before D5 is Verified (PR1).
- No Slack / PagerDuty (email-or-existing-mechanism first; richer channels are a later follow-on).
- No production activation (flags stay unset; the scheduled task is created only at build, with you).
- Not the AC10 manifest cross-reference (F4) — separate governing-doc edit, pending your approval; not bundled.

---

## 9. Open questions for you (resolve at/after review)

1. **Cadence** — daily recommended (matches R5's "daily spend" + rolling-7-day). Confirm daily, or set another.
2. **Per-identity multiple (N)** — 2× proposed (consistent with R5's 2× motif). Confirm or set.
3. **Minimum-history guard** — ≥5 loops before D5 can flag. Confirm or set.
4. **Alert-state table** — new `cost_alerts` (recommended) vs extend `cost_health_snapshots`. Confirm.
5. **Where the scheduled task reports** — this Cowork project (recommended). Confirm.

---

## Cross-references

- `/manifest.md` §R5 (the three thresholds + R0 oikeiosis cost weighting)
- `/operations/r5-cost-shape-impact-assessment-2026-05-14.md` (J6 — A9's design basis; §5 names the push-delivery gap A13 fills)
- `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md` (A9 — the detection-and-persistence half already built)
- `/website/src/app/api/billing/usage-summary/route.ts` (A9 endpoint — the pull-only detectors D1–D3)
- `/website/src/lib/stripe.ts` (`COST_HEALTH` thresholds; `computeLoopBill` revenue side)
- `/website/src/lib/loop-cost-tracker.ts` (per-loop cost; `loop_billing_events`)
- `/website/src/lib/substrate/substrate-identity-baseline.ts` (A12 `getIdentityCostBaseline` — D5's input)
- `/adopted/substrate-plugin-staging-plan.md` §A13 (scope source)
- `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md` (predecessor)
- Decision log: `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03` (A12 met)

*End of A13 design draft. Designed, pending founder approval. No code written. Production byte-identical.*
