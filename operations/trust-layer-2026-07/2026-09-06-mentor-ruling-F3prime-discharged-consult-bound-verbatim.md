# Mentor ruling — F-3′ discharged as a gate; a consult-side bound is owed at PUBLICATION: VERBATIM

**Received 2026-09-06 (machine date), in answer to
`2026-09-06-mentor-question-F3prime-status-after-part3-ruling-FOR-RULING.md`.
Adopted as binding: `D-MENTOR-RULING-F3PRIME-DISCHARGED-CONSULT-BOUND-ADOPTED-2026-09-06`.**

**This file is the canonical record. Verbatim wins over every summary of it.**

---

## F-3′ — does it still gate the window?

The document is well-formed and the unease about Q2 is the right instinct. The question was correctly
routed rather than decided. What follows is the ruling on all three parts.

---

### Q1: Does "start the clock" discharge F-3′?

F-3′ lapses as a gate on the window's start. Reading (a) is correct.

F-3′'s stated ground was denominator integrity: a denominator losing a fifth to a third of its
population to instrument outage is not a random sample of what was attempted, and the selection
mechanism is not neutral. That ground was given in explicit denominator terms. The part-(3) ruling
removed the guard population from part (3)'s denominator. The ground no longer applies to part (3).

A precondition whose rationale has been dissolved by a subsequent ruling does not survive as a
formality. Preconditions are not self-sustaining. They exist to protect something. When what they
protect has changed, the precondition changes with it.

What survives from F-3′'s ruling is the honesty requirement — the availability covariate is not
optional for honest reporting. That requirement now attaches to the guard disclosure, not to the
window's start gate. The guard population is reported separately, honestly, with its availability
rate disclosed. That is the obligation F-3′'s reasoning leaves behind after the gate lapses.

F-3′ is discharged as a precondition. The honesty requirement it carried is not discharged — it
migrates to the disclosure.

---

### Q2: Does an equivalent bound now attach to the consult population?

Yes. The reasoning that made a bounded rate a precondition transfers to the population the
precondition now protects nothing of — and the consult population's outage rate makes this more
urgent, not less.

The document's figures are stark. The guard path lost 31.7% of attempts to outage over the full log
span. The consult path lost 70.3%. The argument that a high-latency period is both more likely to
produce outages and more likely to produce different examination results applies with greater force
to the consult path than it ever did to the guard path.

The selection mechanism is not neutral. High-latency periods that produce outages are precisely the
periods where the examination would have been most consequential — the agent is under load, the
actions are more complex, the reasoning is more likely to be strained.

Part (3) is now a within-consult-population measure. The consult population is what part (3)
measures. A measurement whose denominator is losing 70% of its attempts to outage is not measuring
what it claims to measure. It is measuring the subset of actions examined during low-latency
periods, which is a systematically different population from the full set of actions attempted.

The scoping note's counting requirement — attempted versus framed versus captured, timeouts,
transient failures — is necessary but not sufficient. Counting the losses tells you the rate. It does
not bound it. A measurement that counts a 70% loss rate and publishes the rate alongside the finding
is more honest than one that does not count it. But it is not the same as a measurement taken on a
population where the loss rate is bounded.

**A consult-side availability bound is owed, on the same reasoning that produced F-3′.**

---

### Q3: Does the window wait for it?

No. The window starts now.

The consult-side bound is a condition on the window's *publication*, not on its *start*.

The reasoning is as follows. The window's purpose is to turn an estimate into a measurement. Starting
the clock is what produces the data from which a bound can be assessed. A bound that must be measured
cannot be measured before the window starts. Requiring the bound before the window starts is
requiring the measurement before the measurement is taken. That is not a precondition. It is a
circularity.

The 2026-09-04 timeout remedy has produced two post-remedy guard observations, the most recent of
which is the instance the document records honestly — a single 55,000ms timeout, the visible kind,
the timeout invariant holding. The consult path's post-remedy rate on the two most recent days reads
25.6% and 50%. These are not a measurement. They are isolated observations. But they are the
beginning of the data the window will produce.

The correct posture is: start the window, apply the counting discipline from the scoping note to the
consult path from day one, measure the consult availability rate over the window's duration, and
assess the bound against the measured rate before publication. If the consult availability rate over
the window does not meet a bound equivalent to F-3′'s threshold — ≤5% aggregate, ≤10% any single
ordinary day — the window's findings are published with that disclosed as a qualification on the
measurement's validity, not suppressed.

**The window starts. The consult-side bound is assessed over the window and applied at publication.**

---

### On the threshold

F-3′'s elected threshold — ≤5% aggregate, ≤10% any single ordinary day, ≥20 attempts — was calibrated
for the guard path. The consult path's current rate is an order of magnitude above that threshold.
Applying the same numbers to the consult path would, as the document anticipates, defer the window
indefinitely. That is not the right outcome.

The consult-side bound should be set at a level that is honest about the current state of the
instrument while still being a meaningful constraint on what counts as a valid measurement. The
post-remedy trajectory is the relevant input. Two days of post-remedy data showing 25.6% and 50% is
not enough to set a threshold. The window will produce that data. The threshold is set after the
first five ordinary post-remedy days of consult data, on the same discipline as F-3′'s
≥3-ordinary-days requirement for the guard path.

**The consult-side bound threshold is set after five ordinary post-remedy days of window data, not
before the window starts.**

---

### Summary of what the founder may do today

`GATE1_FALSE_HOLD_CAPTURE` may be set. The window starts. F-3′ is discharged as a gate. The
consult-side availability rate is counted from day one per the scoping note's discipline. The guard
population is reported separately with its availability rate disclosed. The consult-side bound
threshold is assessed after five ordinary post-remedy days of window data. Publication waits for that
assessment.

The D2 sequencing is unchanged. The engine correction lands after the window establishes a baseline.
The window's start is today.
