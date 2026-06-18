# Leg D Metrics — harnessed run

Model: Opus 4.8, maximum reasoning (claude-opus-4-8, 1M context).

## Agent-work wall-clock
- **First task action → memo complete: 36.9 min** (START `2026-06-17T22:41:29Z` → END `2026-06-17T23:18:20Z`).
- Excludes reading the prompt and (per spec) the close. **Includes ~8 min of Sage Reflect completion-step 503 retries** across two sessions (a backend fault, not work) — net productive span ≈ 29 min.
- Source: `raw/_timing-start.txt`, `raw/_timing-end.txt`.

## Cost (scored metric — Σ of metering headers)
- **Σ X-Loop-Cost-Cents = 88¢ → $0.88**
- **Σ X-Anthropic-Cost-Cents = 28¢ → $0.28**
- 21 metered calls (6 reason/guardrail + 15 reflect-advancing 200s). Failed reflect calls (503/400) and the public-key / accreditation calls carry no Option-D metering.

### Per-call breakdown
| Call | Loop-Id | X-Loop¢ | X-Anthropic¢ |
|---|---|---:|---:|
| C1 reason (task adoption) | `c52837c6…` | 6 | 3 |
| C2 reason (recommend/loop-closure) | `db5ccc04…` | 8 | 4 |
| G1 guardrail (recommend) | `44a0ae44…` | 14 | 7 |
| C3 reason (data handling, full sync) | `ff02472c…` | 12 | 6 |
| G2 guardrail (PII transfer) | `4df3370d…` | 16 | 8 |
| C4 reason (l1_supply demo) | `024e03bd…` | 2 | 0 |
| Reflect (open + 14 advancing answers, 2 sessions) | various | 2 each (30 total) | 0 |
| **Total** | | **88** | **28** |

Notes: the **l1_supply consult (C4) cost 0¢ Anthropic** (supplied Layer-1 → no extraction call) vs 3–8¢ for server-L1 consults — the measurable cost benefit of the open-Layer-1 path. Guardrails are the priciest per-call (deep depth at `critical`). Reflect answer-stages bill at base rate (2¢; sub-cent Sonnet extraction rounds to 0).

## Per-consult latency (server-side layer processing, ms)
| Consult | Layer-1 | Layer-2 | Layer-3 | Client round-trip (approx) |
|---|---:|---:|---:|---|
| C1 task adoption (assessment_first) | 30,005 | 2 | deferred | ~30s (returns at L2; L3 async) |
| C2 recommend/loop-closure (assessment_first) | 32,444 | 1 | deferred | ~32s |
| C3 data handling (**full sync**) | 26,075 | 1 | 21,619 | ~48s (L1 + inline L3) |
| C4 l1_supply (supplied) | **0** | 0 | deferred | **~instant** (server L1 skipped) |

- Guardrails: G1 `meta.cost_usd` 0.0747, G2 0.0761 (CI-8 measured, not the retired $0.0025).
- Observation: Layer-1 extraction (~26–32s) dominates server-L1 consult latency; `assessment_first` returns immediately after the signed Layer-2 (deferring the ~21s L3); supplying Layer-1 removes the extraction entirely (C4: 0ms).

## meta.trajectory accumulation across the run (one credential, `sagebench:meridian-ops@v1`)
The trajectory grows as the credential accumulates examinations (each overlay reflects PRIOR instances):

| Consult | prior_instances | evidence | typical_proximity | direction_of_travel | kathekon_compliance_rate | proximity_distribution |
|---|---:|---|---|---|---:|---|
| C1 | **0** | single_snapshot | reflexive (default, no priors) | stable | 0 | all-zero |
| C2 | **1** | single_snapshot | habitual | stable | 1.0 | {habitual:1} |
| C3 | **2** | windowed | reflexive | stable | 1.0 | {reflexive:1, habitual:1} |
| C4 | **3** | windowed | habitual | stable | 1.0 | {reflexive:1, habitual:1, deliberate:1} |

- **prior_instances climbed 0 → 1 → 2 → 3** across the four consults; `evidence` flipped `single_snapshot → windowed` once ≥2 priors existed; `kathekon_compliance_rate` held at 1.0 (every prior examination was kathekon); `confidence_weighted` stayed `low` (sparse-evidence-honest at this volume). The distribution is the honest windowed tally of this credential's own assessments (reflexive ×1 [C2], habitual ×1 [C1], deliberate ×1 [C3] by the time of C4).

## Accreditation credential written (trust layer)
- Seed write `200 ok` (R18f provenance gate passed; loop-closure gate DETECT mode annotated `verdict: unclosed, redirections: 2, open: 2`).
- Public read-back `200`: grade `grade_3`, proximity `habitual`, authority `guided`, `actions_evaluated: 4`, `coverage_status: agent_elected` (server-composed), passions `["phobos/agonia","phobos/oknos"]`. (`raw/08-*`, `raw/09-*`.)

## Signature verification
- C1 + C2 signed assessments **PASS** against the published `substrate-layer2-2026Q2` key; tamper control correctly **fails**. (`raw/07-public-key.verification-result.txt`.)

## /cost (operator-read panel)
- **`/cost` output: <placeholder — operator to paste the Claude Code /cost panel for this session>.** (This is the harness/session token cost from the operator's panel; not fabricated here. The SageReasoning practice cost incurred by this leg is the metered Σ above: $0.88 loop / $0.28 Anthropic.)

## Call accounting (all API calls, incl. failures)
- `/api/reason`: 4 (C1, C2, C3, C4) — all 200.
- `/api/guardrail`: 2 (G1, G2) — both 200, both `do_not_proceed`.
- `/api/public-key`: 1 — 200.
- `/api/accreditation/...` POST: 1 — 200; GET read-back: 1 — 200.
- `/api/practice/reflect`: attempt 1 = open + Q1–Q5 (200) + Q6 (503) + retry (503) + peek (400); attempt 2 = open + Q1–Q6 + supporting ×3 (200) + next step (503). **Question sequence ran in full; completion step reproducibly 503'd (backend fault).**
