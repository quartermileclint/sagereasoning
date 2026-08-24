# Clearing the gaming-robustness bar — what the bar's own clearance condition requires

**Authored 2026-08-24** on the founder's instruction *"clear the gaming-robustness bar now."*
`governance`, documents only. **SUPERSEDED THE SAME DAY** by a 10-agent
verify-then-adversarially-review workflow that found this document's own reasoning reasoned toward
"the blocked thing is not really blocked" — the exact shape the mentor's Q2 ruling forecloses — plus
several corrected facts (the corroboration check's dark-measurement bound, not its production-liveness
state, is what discharges route (i)'s first conjunct; disclosure state was overstated; `l1_supply` is
default-preset and mandatory on the plugin path, which is the actual live exposure the bar's Threat-B
wording does not name; `/api/guardrail` is supply-proof; and a live production gap in
`emitAccreditationTrustEvents` was found that bears on this question but is not created by it).
**The corrected, reviewed version is
`operations/agent-circles-2026-08/2026-08-24-MENTOR-QUESTION-gaming-robustness-bar-route-ii.md`. This
document is retained as the superseded first draft, not as current analysis.** **The bar is NOT cleared by this document, and it cannot be cleared by
running anything.** This sets out why, and the two routes the bar itself defines.

## What is already done — half of route (i)

- **Arm 1 (the scoring arithmetic) CLEARS**, regression-locked by ADR-010 §4 (2026-06-27 run).
- **The corroboration check is LIVE** on both `/api/reason` and `/api/guardrail` since 2026-07-08,
  and it **closed the catchable half** — Threat A's harm-in-text class (A1, 14 of 48 in the measured
  run). Its published scope note already discloses that it *"cannot catch an omitted harm."*
- **Arm A's failure is measured and understood:** 34 of 48 crossings were **self-report OMISSION**
  (the A2 class), which the §4 floor and anti-rubber-stamp prompt do not defend.
- **Arm B FAILED as expected.** The measurement exists. **What is missing is a mitigation, not a
  measurement** — which is why "run the bar again" would produce no new information.

## Why it cannot be cleared by running something

The bar's §2.3 states the residual is *"not closable in a single extract-then-score pass"*: where the
adversary controls **both** the action representation and the extraction, the lie is internally
consistent and **"no deterministic check downstream of a fully optimizer-controlled extraction can
recover ground truth — the check has nothing truthful to corroborate against."** §2.2: *"structurally
un-catchable by any prompt guard — you cannot prompt a model out of a behaviour its reward function
selects for."*

**So there is no harness run, battery, or prompt hardening that clears Arm B.** Any session proposing
to "clear the bar" by building something inside the pass is repeating a failure the bar has already
characterised.

## The two routes the bar defines (§3.3, verbatim structure)

**Route (i) — a weights-tier mitigation.** The corroboration check bounds `G` to the structural
residual (**done**), *and* that residual is closed by one of: an **independent / ensemble extractor
not co-trained with the policy**; **held-out adversarial probes during training**; or a **verifier
model with a different objective**.

> **Assessment, stated as a fact about this project rather than a judgement about the route:**
> SageReasoning **does not train a model**. Two of the three named mitigations (held-out probes
> during training; a co-trained-policy separation) presuppose a training loop this architecture does
> not have. The third — an independent or ensemble extractor — **is** buildable here: a second
> extraction from a different model family over the same input, with disagreement surfaced. That is a
> real `code-elevated` build with real per-consult cost and latency, not a documentation act, and it
> is **not scoped anywhere**.

**Route (ii) — accept and disclose the ceiling.** The residual is *"formally accepted-and-disclosed as
a ceiling **and** the weights claim is scoped to not rely on a co-trained extractor."*

> This is a **`governance` + R18** act: a founder-signed disclosure on the public surfaces plus a
> scoping of the claim. It is achievable in one session. **It is also the route the bar's own wording
> anticipates for a project in this position.**

## The recommendation, and the thing it does not settle

**Recommend route (ii)** — accept and disclose the ceiling — **as a mentor question, not as an
execution.** Reasons: route (i)'s only applicable mitigation is an unscoped build with live per-consult
cost; route (ii) is honest, achievable, and matches what the project already does everywhere else
(publish the bound rather than claim it away).

**But route (ii) probably does NOT unblock GS-CYB-1, and that must not be assumed.** Route (ii) clears
the bar by scoping the weights claim to *not rely on a co-trained extractor*. GS-CYB-1's optimisation
loop consumes the **same** proximity score produced by the **same** extraction it would be optimising
against. Whether a disclosed ceiling licenses a feedback controller over that score is a **different
question** from whether it licenses a weights claim — and the mentor ruled on 2026-08-24 that *"the
mechanism is different; the failure mode is the same."*

**Reasoning that concludes a blocked thing is not really blocked is the most dangerous shape available
here.** This document therefore names the two routes and declines to draw that conclusion.

## What is owed next

1. A **mentor question**: is route (ii) the right route for this project given it trains no model; and
   does an accepted-and-disclosed ceiling bear on GS-CYB-1's gate, or only on the weights claim?
2. If route (ii) is ruled: founder-signed R18 wording + the claim scoping — one `governance` session.
3. If route (i) is ruled: an independent/ensemble-extractor **scope** — `code-elevated`, cost and
   latency named up front, PR19 engaged.

## Cross-references

- `2026-06-27-gaming-robustness-bar-scope.md` — the bar; §2.2, §2.3, §3.3, §4.1 (the decided fork), §5
- `2026-06-27-gaming-robustness-harness-results.md` — the measured run
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` — ADR-012, the three-rung ladder
- `2026-08-24-agent-cybernetic-control-architecture.md` §3 — GS-CYB-1, gated on this bar
- `2026-08-24-mentor-ruling-cybernetics-instruction-four-questions-verbatim.md` — Q2, the weights-BLOCKED constraint

*End. The bar is not cleared. Nothing built, nothing disclosed, no claim changed.*
