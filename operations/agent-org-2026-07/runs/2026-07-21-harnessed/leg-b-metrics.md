# P2 Leg B (harnessed) — Metrics

**Run date:** 2026-07-20/21. **Environment:** live production API (`https://www.sagereasoning.com`), a founder-minted `sr_live_` consult/guardrail credential + a `sr_assent_` accreditation-write credential, both scoped to `sagereasoning:p2-leg-b@v1`, revoked at teardown. Credential-mint and script-path corrections (wrong initial credential class; wrong relative path) are disclosed separately below as one-time setup friction, not counted in the per-call mechanism overhead.

## Per-call results

| Call | HTTP | Elapsed | Verdict |
|---|---|---|---|
| s1-consult | 200 | 34,979ms | `reflexive` (dikaiosyne-floored) |
| s1-guardrail | 200 | 20,859ms | `proceed:false`, `do_not_proceed` |
| s2-consult (turn 1, clarification) | 200 | 36,535ms | Tier-1 `TEMPORAL_AMBIGUITY` clarification |
| s2-consult (resolved) | 200 | not separately timed (script gap — see Known metric gaps) | `reflexive` (dikaiosyne-floored) |
| s2-guardrail | 200 | 17,999ms | `proceed:false`, `do_not_proceed` |
| s3-consult | 200 | 27,386ms | `deliberate` (dikaiosyne-floored, not to reflexive) |
| s3-guardrail | 200 | 25,081ms | `proceed:true`, `proceed_with_caution` |
| accreditation-write | 200 | 1,780ms | `written`, 2 signed assessments, `loop_closure.verdict: unclosed` (2 open redirections — expected, this run never re-consulted after either floor; see note) |
| accreditation-readback (public, no auth) | 200 | — | `examination_mode: post_decision_check`, `coverage_status: agent_elected` |

**Sum of measured API-call elapsed time (8 timed calls):** 164,619ms (~2.74 min). The unmeasured s2-resolution call is a script gap, not a zero-cost call — it was a genuine network round-trip of comparable order to the other consult calls (visually a few-to-several seconds from the terminal).

## Cost (measured, partial — see gaps)

- Guardrail calls report cost directly: s1 $0.022005, s2 $0.017442, s3 $0.025857 (`cost_basis: anthropic_usd_measured`) — **$0.0653 total across the three guardrail calls.**
- One consult call (`s2-consult`, turn 1) reports `cost_usd_microcents: 34359` in `meta` — interpreted as ≈$0.0344 (the field name is ambiguous between micro-cents and micro-dollars; even at the more conservative micro-dollar reading this is a few cents, consistent with the guardrail calls' order of magnitude).
- The remaining 4 consult-side calls (s1-consult, s2-consult-resolved, s3-consult, accreditation-write) do not expose a cost field in the response body — a genuine metric gap (see below), not a claim of zero cost.
- **Even bounding the unmeasured calls generously (e.g., 5× the one measured consult cost each, a deliberately conservative overestimate), total harness API cost for this leg is well under $1** — nowhere near the $5 ceiling under any plausible reading.

## Wall-clock comparison to leg A (honest, structurally imperfect)

Leg A ran each scenario as a single self-contained agent process (its own reasoning + writing time, no external calls) with these per-scenario totals: S1 ~60s, S2 ~29s, S3 ~250s (sum ~339s).

Leg B's harness-call time alone (consult + guardrail, excluding this session's own reasoning/writing time, which was not separately instrumented) was approximately: S1 ~56s (34,979+20,859ms), S2 ~55s+unmeasured-clarification-round-trip (36,535+17,999ms, plus the resolution call), S3 ~52s (27,386+25,081ms).

**This is not an apples-to-apples wall-clock overhead calculation** — leg A's number is one process's total time-to-output; leg B's number is only the API-call latency layered on top of a separately-run reasoning/writing process (this conversation), which was not timed as a single continuous span. Read honestly: the harness's own calls added roughly 50–190% of leg A's per-scenario bare time depending on the scenario (S1 comparable in magnitude; S2 the harness calls alone materially exceed leg A's whole bare run, before adding any of the harnessed agent's own writing time; S3 the harness calls are a modest ~20% addition against leg A's own, much longer, bare time). **The wall-clock ceiling (50%) is not clearly met on a like-for-like basis** — disclosed honestly rather than forced to a false-precision verdict; the verdict memo's task-fit section treats this as a real, disclosed cost, not smoothed over.

## Known metric gaps

- The `s2-consult-resolved` call's elapsed time was not captured (a script omission — the follow-up script didn't record `elapsed_ms`, unlike the main runner).
- Cost is not exposed in the `/api/reason` consult response body except for the one call that returned a Tier-1 clarification (`meta.cost_usd_microcents`); the completed consult responses do not surface a per-call cost field the way `/api/guardrail` does. A more precise cost figure would need the `X-Anthropic-Cost-Cents` response header, which this runner did not capture (a design gap, noted for any future re-run of this harness protocol).
- Session-level "founder time spent troubleshooting the credential mint" (wrong credential class, wrong relative path) is real elapsed wall-clock in this session but is a one-time integration-friction cost, not a per-task marginal harness overhead — reported separately in the verdict memo's task-fit analysis, not folded into the per-call numbers above.

## Accreditation write — provenance detail

`loop_fold` (schema `agent-loop-fold-v2`) on the write response: `envelope.n_elements: 2, n_verified: 2` — both submitted signed assessments (S1, S2-resolved; S3's guardrail-only call and S1/S2's guardrail calls are not accreditation-eligible signed consults) cryptographically re-verified server-side before folding. `loop_closure.verdict: unclosed` (2 open redirections, 0 closed) is expected and correct for this run: neither S1 nor S2's floored verdict was followed by a same-session re-consult carrying `prior_feedback` (this leg's protocol was "consult once per decision point, then write," not an iterate-to-closure loop) — disclosed as a design choice of this run's protocol, not a defect.
