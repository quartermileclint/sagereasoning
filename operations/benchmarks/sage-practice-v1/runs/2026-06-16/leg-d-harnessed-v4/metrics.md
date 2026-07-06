# Leg D (harnessed) v4 — Metrics

Model/mode: **Claude Opus 4.8, maximum reasoning.** Task: Meridian vendor-migration recommendation memo. Deliverable: `memo.md`.

---

## Task wall-clock (first task action → memo complete; reflect-at-close EXCLUDED)

- **First task action** (read brief + data-pack): `2026-06-19 13:35:34`
- **Memo complete** (memo.md written): `2026-06-19 13:48:30`
- **Total task wall-clock: 776 s (~12 m 56 s).**

**Decomposition:**
| Component | Value | Basis |
|---|---:|---|
| Σ API latency (consult server-side) | **~64.0 s** | sum of `layer1_latency_ms + layer2_latency_ms` per consult: Gate 1 28027 ms + Gate 2 35955 ms = 63982 ms |
| Approval-wait | **0 s** (0 prompts) | ran autonomously — no human approval prompts presented; all tool calls executed directly |
| Model-generation + orchestration | **~712 s** | remainder (776 − 64 − 0); my reasoning/generation + file writes + bash/curl invocation + reading. Network round-trip beyond server latency is folded here (small). |

> The model-generation remainder dominates (~92% of wall-clock) — consistent with the project's standing finding that Opus-max-reasoning generation latency × step-count, not the practice, drives wall-clock. The practice's own server latency (~64 s across 2 consults) is the only practice-attributable wall-clock and was time spent blocked on the two `/api/reason` calls.

---

## Practice footprint (task only)

- **Consults: 2** — Gate 1 (task adoption, standard) + Gate 2 (core-decision loop-closure re-examination, standard, carrying Gate 1 `prior_feedback`).
- **Guardrail gates: 0** — not elected. Producing a recommendation memo is reversible; the irreversible acts (serve notice / migrate PII) are leadership's to execute, not mine. A guardrail call would have been component-testing.
- No other mechanisms exercised (no l1_supply, signature verification, accreditation, Tier-1 probes) — none arose naturally in doing the task.

---

## $ cost (task only)

| Meter | Gate 1 | Gate 2 | **Total** |
|---|---:|---:|---:|
| `X-Anthropic-Cost-Cents` | 4 | 5 | **9¢ ($0.09)** |
| `X-Loop-Cost-Cents` | 8 | 10 | **18¢ ($0.18)** |

Sub-dollar, as expected for 2 standard-depth consults. (`X-Loop-Cost-Cents` is the loop-billed figure incl. margin; `X-Anthropic-Cost-Cents` is the underlying Anthropic-metered cost.)

---

## Reflect-at-close — SEPARATE (post-task; NOT in the task wall-clock/footprint/cost above)

**Attempted per the TR-02 default; NOT completed — credential not authorized for the reflect surface.**

- **Outcome:** `POST /api/practice/reflect` (open) returned **HTTP 401 Unauthorized**. The response carried the genuine Sage Reflect envelope (`interaction_type: "stoic-post-action-reflection"`, the framework disclaimer + `documentation_url`), confirming the correct endpoint was reached and auth — not payload/agent_id — was rejected. The same Bearer token (`sr_prac_7d0a…`) returned HTTP 200 on both `/api/reason` consults seconds earlier, so the token is valid and active; `reflect` is a write-class capability (Bearer-only, requires the `reflect` capability) and this consult-scoped practice credential evidently lacks it.
- **Disposition:** attempted once in good faith, recorded honestly, not retried. `agent_id` cannot resolve a 401 (auth precedes agent-id validation), and I hold only this one credential — so one attempt is the correct number. Not a "loop that didn't fire"; an authorization scope outcome.
- Wall-clock: ~55 s (13:49:43 → 13:50:38) — almost entirely orchestration; the 401 itself returned immediately.
- Call count: **1** (rejected at auth).
- Cost: **$0.00** — no `X-Loop-Cost-Cents` / `X-Anthropic-Cost-Cents` headers returned (rejected pre-billing).
- **Note (honest observation, not a defect I am chasing):** every consult response in this run carried the `practice` reflect-at-close hint (`reflect_due: TR-02`, `endpoint: /api/practice/reflect`) — i.e. the practice advertises the reflection on the very surface whose credential cannot invoke it. Surfaced for the operator; I did not investigate further (out of task scope, and would be component-testing).

---

## /cost placeholder

`/cost` — operator reads the Claude Code cost panel (full-session token/$ cost is not self-measured in this file; the practice-attributable cost is the table above).

---

## Comparability anchors

- **Same model/mode:** Claude Opus 4.8, maximum reasoning.
- **Same task** as Leg C (bare): the FROZEN Meridian vendor-migration brief + data-pack.
- **Same baseline** as Leg C.
- **Comparable deliverable:** the recommendation memo (`memo.md`).
- Difference vs Leg C: this leg used the practice (2 consults at genuine decision gates) to set the frame and adjudicate the recommendation's shape; Leg C is unharnessed.
