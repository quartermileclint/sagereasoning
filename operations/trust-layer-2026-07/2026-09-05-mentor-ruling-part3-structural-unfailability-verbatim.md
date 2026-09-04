# Mentor ruling — part (3)'s structural unfailability, the D4 contamination class, and guard availability as a window precondition (VERBATIM)

**Received:** 2026-09-05. **Status: BINDING. The verbatim text below wins over any restatement,
summary, or execution note anywhere in this repository, including this document's own framing.**

**READER'S NOTE — this is a RULING RECORD, not a question relay.** The three questions were raised in
conversation (not as a repo document) after the P6 recommendation-column build
(`D-S11-P6-RECOMMENDATION-COLUMN-BUILT-REVIEW-FOLDED-2026-09-04`, commits `dc100b4` + `064285d`) and
were **answered in the same exchange**. An earlier attempt to commit them as an open question was
**denied by the at-action guardrail** — correctly, as an unrequested commit — and that denial was
honored rather than routed around. The document is authored here as a deliberate founder act, after the
answers, so its value is a trace of the reasoning rather than a prompt for further ruling.

---

## PR20 — the mechanisms these rulings land on

Verified first-hand at the time of asking unless marked otherwise.

1. `interventionInputFromAtAction` hardcodes `sourceConflict: false` (at-action-seam.ts:129); the P1
   filter reports a justice surface **only** when Arm 1 or Arm 2 fired (at-action-seam.ts:121-122).
2. `recommendIntervention` reaches `do-not-proceed` only via reflexive proximity (itself firing Arm 3)
   or via `justiceSurface ∈ {unevaluated, violated}`. **Therefore `do-not-proceed ⟹ engaged`** —
   enumerated three times independently (2,560 / 46,080 / 335,160 seam inputs; **zero counterexamples**).
3. `habitualReExaminationCount` is supplied by no caller anywhere; the A8 row cannot fire
   (intervention-engine.ts:392).
4. `derive-trust-events.ts:125` reads `isJusticeSelfCircleNarrowingEnabled()` **at call time**, so the
   recommendation column depends on `SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED` — register D4's flag.
5. The guard's default fail mode is `open` (framing-core.mjs:111); in `strict` mode `guardOutage`
   captures `denied: true` with `assessment: null` (at-action-hook.mjs:600-606) ⇒ a genuine enforced
   hold carrying nothing the table can read.
6. **Recorded, NOT independently re-derived:** the chronic guard-outage measurement (register **B4**,
   ruling `agent-circles-2026-08/2026-09-05-mentor-ruling-guard-availability-and-lean-mode-doctrine-verbatim.md`).
7. `agent_hold_observations` is empty; `GATE1_FALSE_HOLD_CAPTURE` unset; **the window has not started.**

---

## Q1 — Part (3)'s target cannot fail. Is that the ruling working, or the measurement dissolving?

> **Q1 ruling: Reading (c) governs. The classification column is the live measurement that can fail and
> constitutes part (3)'s gate. The recommendation column is the disclosure that the filter catches what
> the predicate misclassifies. Part (3) is not discharged by the recommendation column alone. The report
> as shipped is correct.**

The mentor's reasoning, verbatim on the load-bearing points:

> "Reading (a) — the floor holding is the intended result, part (3) is genuinely discharged — cannot be
> right… A gate that cannot fail licenses nothing. Q2's zero-false-positive floor was restored by the P1
> ruling so that the measurement would be honest, not so that the measurement would be unnecessary."

> "Reading (b) — the measurement dissolved — is the honest alarm… But it is not quite right either,
> because it treats the recommendation column as the only thing part (3) could measure."

> "The recommendation column, derived at report time, shows that the filter works as designed: the 129
> false classifications do not propagate to holds. That is a real finding. It is just not a finding that
> can fail, because the filter's correctness is a logical consequence of the P1 ruling's own terms. What
> can fail — and what the classification column measures — is the predicate's false-positive rate
> upstream of the filter."

> "Part (3) is discharged when the classification column's false-positive rate, over the live
> distribution, meets the standard — and when the recommendation column confirms the filter is operating
> as designed on that same distribution… The classification column is the gate. The recommendation column
> is the disclosure."

**Consequence: no change to the shipped report.** Its build decision — computing no target verdict in the
recommendation column and deferring part (3) to the classification column — is confirmed as correct.

## Q2 — Is a mid-window change to `SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED` the same contamination class as mixing extraction regimes?

> **Q2 ruling: Different contamination class. D4's activation does not require the window to be wholly
> before or after it. Landing D4 before the window is cleaner and recommended. If D4 lands mid-window,
> report pre- and post-activation periods separately or confirm uniform re-derivation.**

> "§2.1's contamination rule forbids mixing extraction regimes because a regime change means the same
> record is classified differently depending on when it was extracted… The contamination is in the
> record, not in the derivation. D4's flag changes a derivation applied uniformly at report time. The
> underlying records are unchanged… The contamination §2.1 forbids is the kind where you cannot recover
> the clean signal. D4's flag change does not produce that kind."

## Q3 — Does a chronic guard-outage rate bound P5's denominator?

> **Q3 ruling: A bounded guard-outage rate is a further precondition on the window, in the same class as
> P8a. The window's preconditions are amended to include it. The threshold is a P6 design question.**

> "A denominator losing a fifth to a third of its population to instrument outage is not a random sample
> of what was attempted. The selection mechanism is not neutral… a rate over a selected sample with an
> unknown selection bias."

> "The guard-outage rate is the presence rate's complement. It belongs in the window's preconditions,
> not in a footnote on the published rate."

**Reconciliation with register B4, confirmed by the mentor:** B4 sits in **Section B** and is explicitly
*"NOT a new gate and does not reopen P4's four-part standard."* Q3 makes the bounded rate a precondition
of **the window** — the same class as P8a, which is likewise a window precondition and not a fifth part
of the standard. The two are compatible on that reading.

### Correction carried into this ruling

The Q3 answer as first given cited *"20–60% outage is the current baseline."* **Corrected by the mentor
on challenge:**

> "The measured baseline is 11–32% on ordinary days, with 60% recorded on 2026-09-04 as a named outlier.
> The ruling's substance is unaffected… The 60% figure should not be quoted forward as the baseline."

---

## Founder decisions and their dispositions

| # | Item | Disposition |
|---|---|---|
| **F-1** | Commit this document | **Done — as a ruling record**, per the mentor's instruction that it is *"a trace of the reasoning, not… a prompt for further ruling."* |
| **F-2** | D4 before the window | **Confirmed.** Q2 makes mid-window manageable; before is cleaner and carries no reporting complexity. |
| **F-3** | Add the guard-outage bound to the register | **WITHDRAWN — superseded by B4**, which a concurrent session had already recorded. Acting on it would have duplicated B4. |
| **F-3′** | Land the routed Q-G1(c) item: the bounded guard-availability rate as a **window precondition** in the scoping note and the P6 row, citing both rulings and **pointing at B4 rather than restating it** | **Adopted. Genuinely outstanding** — verified first-hand that neither the P6 register row nor the scoping note mentions availability at all (§2.4 covers *consult* timeout losses, a different quantity). Folds into the D4 session. |
| **F-4** | Chase the unreproducible 38/2 battery run | **No**, confirmed. |
| **F-5** | Correct this session's misdated artifacts | **Done** (`595af8d`, `2646879`). |

### One correction to the mentor's sequencing instruction

The sequencing note states the D4 session carries *"the register changelog entry for the 2026-08-17 P8a
build — which has been owed since the P5 correction was identified and should not be deferred further."*
**That entry was applied on 2026-09-04** and is present in `S11-FLIP-PREREQUISITES-REGISTER.md`
(verified by direct read), alongside the 2026-09-05 P6 ruling entry. It was the predecessor session's
carried item Q-A, guardrail-denied four times there and cleared on the first attempt here. **It should
not be re-queued for the D4 session**, which therefore carries **two** items: D4's activation walk and
F-3′.

---

## What this ruling does and does not license

**Ruled:** reading (c) on part (3); D4's flag change is a different contamination class from a regime
change; a bounded guard-availability rate is a window precondition.

**Not licensed:** any build, activation, schema change, or publication. **P4/P5/P6 are unmoved; the
window has not started; the S11 flip remains REFUSED; weights BLOCKED; the 0h call remains the
founder's.** Q1's practical effect is to make part (3) *harder* to discharge, not easier: the gate is
the classification column, which on the frozen 130 reads 129 false / 0 correct.
