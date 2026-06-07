# SLO & Error-Budget Policy (A14)

**Status:** Adopted 2026-06-07 (pending founder commit) under `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07`. Satisfies staging-plan §A14 governance scope.
**Governs:** The reliability targets SageReasoning holds itself to per service surface, how much unreliability is tolerated before it becomes a problem (the "error budget"), and the discipline that engages when a surface burns through that budget.
**Does not govern:** *Measuring* live adherence to these targets. That is a separate, optional implementation follow-on (a flag-gated tracker reading the A12 `substrate_audit_events` latency columns), deferred until A12 observability is activated and real traffic exists — see §4.
**Source method:** Standard SLO / error-budget practice (Google SRE) applied to SageReasoning's own architecture. No external research was needed for this deliverable (PR11: no consultation performed — rests on the project's own rules AC2 + staging-plan §A14 + stable industry method).

---

## 0. Plain-language summary (read this first)

An **SLO** (Service Level Objective) is a promise about how reliable one part of the product should be — for example, "the public-key endpoint should answer within a tenth of a second 95% of the time" or "the reasoning endpoint should succeed 999 times out of every 1,000 calls."

An **error budget** is the flip side of that promise. If the target is 99.5% success, then 0.5% is the budget — the amount of failure we accept before we stop and fix things. It turns "be reliable" into a number we can actually track.

The **discipline** is what we do when a surface uses up too much of its budget: we stop adding new features to that surface and fix the reliability first. This stops a shaky surface from getting shakier while we pile more on top.

Two honest caveats up front, both important:

- **We have no production users or traffic yet.** Error budgets describe what *would* happen under real traffic. They cannot be "burned" until people are using the product. This policy defines the targets now so they are ready; the discipline formally switches on at launch (P6) / whenever real traffic begins.
- **We can only measure latency on one surface today** (`/api/reason`, and only when the A12 observability flag is turned on). Measuring the rest needs more instrumentation. §4 is honest about the gap between what we have *defined* and what we can currently *measure*.

---

## 1. Surface SLOs

Surfaces are grouped into four tiers by how much harm unreliability causes. The tier sets the success-rate target; latency targets are per surface.

### Tier 0 — Safety-critical (the R20a distress perimeter)

The two-stage distress classifier (regex → Haiku) that protects vulnerable users. This tier is special: it is governed by a **correctness invariant**, not just an availability number.

| Property | Target | Basis |
|---|---|---|
| Latency (the classifier step, borderline inputs) | **p95 ≤ 500 ms** | **AC2** — fixed and non-negotiable; not to be optimised away by backgrounding the check (PR3: safety checks are synchronous) |
| Behaviour on failure | **Fail closed** | If the safety check cannot complete, the request fails — it is never silently skipped |
| Availability of the safety path | **99.9%** | Tier-1 budget, with fail-closed behaviour so a failure is a refusal, never an unprotected response |
| Skipped safety checks | **Zero tolerance** | Any skipped check is an incident, not budget spend |

Surfaces in scope: every human-facing tool that runs the distress classifier, and the server-side R20a gate. Per PR6, any change touching this tier is **Critical** regardless of size.

### Tier 1 — Core reasoning, data-rights, financial (99.9% success)

High-stakes correctness; a failure here is costly (wrong reasoning output, a data-rights request that silently fails, a missed payment event).

| Surface | Latency target (p95) | Notes |
|---|---|---|
| `/api/reason` — quick depth (Haiku) | **< 3 s** | Per staging-plan §A14. Single-mechanism. |
| `/api/reason` — standard / deep (Sonnet) | **< 8 s** | Multi-mechanism reasoning; longer model calls expected. |
| `/api/evaluate`, `/api/execute`, `/api/compose` | < 8 s | Substrate / LLM-backed. |
| `/api/user/delete` (R17c) | < 2 s | Correctness matters far more than speed. |
| `/api/user/export` (R17i) | < 10 s | May aggregate across tables; latency is looser, success is not. |
| `/api/webhooks/stripe` | < 2 s | Financial correctness; success target is the binding constraint. |
| `/api/billing/checkout`, `/billing/portal` | < 3 s | Stripe-coupled. |

### Tier 2 — Mentor, practice, scoring, identity, discovery (99.5% success)

User-facing but individually recoverable (a retry or a refresh is acceptable).

| Surface group | Latency target (p95) | Notes |
|---|---|---|
| `/api/public-key` | **< 100 ms** | Per staging-plan §A14. Deterministic, no LLM. |
| `/api/keys`, `/api/accreditation/*`, `/api/badge/*`, `/api/marketplace*`, `/api/mcp/tools` | < 150 ms | Deterministic identity / discovery surfaces. |
| `/api/mentor/*`, `/api/journal`, `/api/practice/*`, `/api/reflect*` | < 5 s | Mixed LLM + DB. |
| `/api/score*`, `/api/assessment/*`, `/api/skill/sage-*` | < 5 s | LLM-backed assessment / skill surfaces. |

### Tier 3 — Internal, observability, admin (99% success, best-effort)

Off the end-user request path. Reliability matters operationally but a brief failure does not harm a user.

| Surface group | Latency target (p95) | Notes |
|---|---|---|
| `/api/health` | < 100 ms | Liveness probe. |
| `/api/abuse/evaluate`, `/api/billing/cost-alerts/evaluate` | < 5 s | On-demand evaluators; run by the founder / a scheduler, not users. |
| `/api/admin/*`, `/api/internal/*` | < 2 s | Founder / service-token only. |

*Surfaces not individually listed above inherit their tier-group target. New surfaces are assigned a tier at the time they are built and recorded against this policy.*

---

## 2. Error budgets

The error budget is `100% − success-rate target`, expressed two ways. For a low-volume / pre-launch product the **request-count** form is the meaningful one; the **time-equivalent** form (over a calendar quarter of ~2,190 hours) is shown for reference and only becomes meaningful under steady traffic.

| Success-rate SLO | Error budget (requests) | Error budget (time-equivalent / quarter) | Applies to |
|---|---|---|---|
| **99.9%** | 1 failure per 1,000 requests | ≈ 2 h 11 m | Tier 0 path, Tier 1 |
| **99.5%** | 1 failure per 200 requests | ≈ 10 h 57 m | Tier 2 |
| **99.0%** | 1 failure per 100 requests | ≈ 21 h 54 m | Tier 3 |

**Budget window:** one calendar quarter, resetting on the quarterly governance review (R14). A surface that has a bad week but recovers within its quarterly budget has not breached its SLO — that is exactly what the budget is for.

**What counts as a failure:** an HTTP 5xx, an unhandled exception, a timeout beyond the latency target by an order of magnitude, or (Tier 0 only) any skipped or failed safety check. Expected 4xx responses (a bad request, an unauthenticated call, a deliberate 503 from an inert flag-gated route) are **not** budget spend — they are the system working correctly.

---

## 3. The error-budget burn discipline

| Burn level (of the quarterly budget) | Posture |
|---|---|
| **≤ 50%** | Normal. New feature work on the surface proceeds. |
| **> 50%** | **Feature freeze** on that surface. New feature work stops; only reliability fixes ship to that surface until the budget is back on a healthy trajectory. |
| **100% (exhausted)** | The SLO is breached. Reliability work is the only work on that surface; the breach is recorded in the decision log and reviewed at the next governance review. |

**How the freeze lifts:** when either (a) the root cause is fixed and verified (PR10 PEV — diagnostic-certain), or (b) the surface's burn rate returns to a trajectory that lands inside budget for the quarter. The founder owns the call; it is recorded in the decision log.

**Scope of a freeze:** it is per surface, not project-wide. A burn on `/api/reason` does not freeze `/api/mentor/*`. This keeps the discipline proportionate.

**Interaction with safety (Tier 0):** a safety-path budget burn is treated as an incident immediately, not at the 50% line — the zero-tolerance invariant in §1 governs. PR6 (safety-critical changes are always Critical) applies to any fix.

---

## 4. What we can measure today (honest measurability)

This is the gap between what this policy *defines* and what the project can currently *observe*. Stating it plainly is required by R18 / R19 (honest positioning) — we do not claim to be measuring what we are not.

**Latency.** A12 observability (OTel) writes `layer1_latency_ms`, `layer2_latency_ms`, `layer3_latency_ms` and `occurred_at` per surface into `substrate_audit_events`. Today:

- Only **`/api/reason`** is instrumented (it is the A12 proof surface).
- The A12 flag (`SUBSTRATE_OTEL_ENABLED`) is **UNSET in production**, so even `/api/reason` is not currently emitting latency rows in production.
- Therefore latency-SLO adherence is measurable **only on `/api/reason`, and only once A12 is activated**. Every other surface needs instrumentation (an A12 surface rollout) before its latency target can be tracked rather than merely asserted.

**Success rate.** Measurable today from Vercel function logs / HTTP status codes by hand. A tracker would automate this; none is built (deferred — see below).

**Traffic.** There is **no production traffic yet**, so no budget is being burned and no freeze can trigger. This policy is pre-positioned, not yet load-bearing.

**The deferred implementation follow-on.** Computing live SLO adherence (rolling p95 latencies + success rates per surface, with burn alerts) off the `substrate_audit_events` latency columns is the optional A14 *implementation* — flag-gated and inert, proven on TEST per PR1, mirroring the A13 / A19 detection-before-activation pattern. It is **deferred** because (i) production has no traffic to measure and (ii) A12 OTel is not yet activated in production, so the tracker would have nothing to read. **Revisit condition:** when A12 OTel is activated in production and meaningful traffic exists (≈ around launch / P6), or whenever the founder elects the follow-on. The existing **Datadog** connector and the A12 OTel surface are the intended substrate for that tracker (PR15: reuse existing infrastructure before bespoke).

---

## 5. Requirements-vs-in-place checklist (0c governance verification)

Per the 0c verification framework, the founder verifies A14 by reading this checklist, not code.

| A14 requirement (staging-plan §A14) | In place? | Where |
|---|---|---|
| Per-surface SLOs documented (incl. `/api/reason` p95 < 3 s; `/api/public-key` p95 < 100 ms; R20a classifier p95 ≤ 500 ms per AC2) | ✅ Yes | §1 |
| Error budgets per surface defined | ✅ Yes | §2 |
| >50%-burn feature-freeze discipline defined | ✅ Yes | §3 |
| Honest statement of current measurability | ✅ Yes (beyond minimum scope) | §4 |
| Live-adherence measurement built | ⏸️ Deferred by design | §4 (revisit at A12 activation / launch) |

A14's *named governance scope* is the first three rows. They are complete on the founder's read → **A14 (governance) reaches Verified.** The deferred tracker is the *implementation* half, intentionally out of this session's elected scope.

---

## 6. Review cadence & ownership

- **Reviewed:** at each quarterly governance review (R14), alongside the AC1 model-selection table. Targets are adjusted against observed reality once traffic exists.
- **Owner:** the founder. SLO targets, freeze decisions, and freeze lifts are the founder's call, recorded in the decision log.
- **Update discipline:** when surfaces are added/removed or targets change, update this doc and append a `D-A14-…` decision-log entry. If this policy and the manifest's AC2 ever diverge on the safety-path latency budget, **AC2 is authoritative** (it is the governing rule; this is operational policy).

---

## 7. Cross-references

- `/manifest.md` AC2 — Safety System Latency Budget (the ≤500 ms classifier budget; authoritative for Tier 0)
- `/manifest.md` R5 — cost-as-health-metric (the sibling operational-health discipline; A13)
- `/manifest.md` R14 — quarterly governance review cadence
- `/adopted/substrate-plugin-staging-plan.md` §A14 — the scope this satisfies
- `supabase/migrations/20260603_a12_substrate_audit_events.sql` — the latency-measurement source (`layer1/2/3_latency_ms`, `occurred_at`, `surface`)
- `/operations/decision-log.md` — `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07` (this policy's adoption); `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03` (the observability surface); `D-A13-PRODUCTION-ACTIVATION-2026-06-06` (the detection-before-activation precedent this mirrors)

*End of policy. Defines the reliability targets and the discipline; live measurement is a deferred, flag-gated follow-on. Standard risk under 0d-ii (documentation; no code, schema, or production change).*
