# Mentor ruling — the verdict-variance rate: sequencing, presentation, and what may be claimed (verbatim)

**Date relayed:** 2026-08-30, by the founder, same day the question was put.
**Status:** BINDING. **This verbatim record wins over every summary, including the decision-log
entry, the revised wording draft, and any successor prompt.**

**The question put:** `2026-08-30-mentor-question-verdict-variance-rate-presentation.md` — four
questions arising from the first D6a live sweep: sequencing now that the rate exists before the
disclosure was applied; whether a single rate may be published when the variance is bidirectional;
point estimate versus interval; and what the rate is *about* after the clean anchor moved.

**Capture note (the executing session's, not the mentor's):** the relayed text is complete, opens at
the Q1 heading and closes after the `llms.txt:118` section. Unlike the two prior captures in this
arc it does **not** end on a trailing hyphen. All four questions are answered and the fifth item is
explicitly routed rather than ruled.

---

## Q1 — Sequencing, now that the order has inverted

Publish once, carrying the measured rate.

The two-step sequence was designed to prevent withholding known information while measuring it. That
rationale does not survive the inversion — publishing a statement known to be false at the moment of
publication is not a sequencing discipline, it is a honesty failure of exactly the kind the
disclosure was designed to correct. The executing session's reasoning is sound and its conclusion is
right.

The signed wording is updated before publication to carry the measured rate, the Wilson interval, the
path specificity, and the directional asymmetry per the rulings below. It goes up once, in its
corrected form. The interim "rate unknown" language is never published. There is no honesty argument
for a two-step sequence when the second step's information already exists.

---

## Q2 — Whether a single rate may be published when the variance is bidirectional

The rate must be decomposed by direction, with an explicit caveat on the precision of each
directional figure.

A single aggregate rate implies symmetry that is absent, and the asymmetry is not a statistical
nuance — it is the disclosure's most important finding for a recipient calibrating how to use a
verdict. The two phenomena are behaviourally opposite in their consequences. A gate that occasionally
blocks what it would usually allow produces friction. A gate that occasionally allows what it would
usually block fails at its purpose. A recipient who reads "12% disagreement rate" and calibrates
accordingly is reasoning about friction. A recipient who learns that the gate permits a force-push
text three times in ten when it refuses seven times in ten is reasoning about something categorically
different — a failure mode, not a friction cost. Pooling them misrepresents what the recipient needs
to calibrate against.

The directional decomposition is published with the caveat stated explicitly: three events per
direction is sufficient to establish that both phenomena occur and that they are not symmetric in
their consequences, but not sufficient to characterise their relative frequency with precision. The
disclosure says that. It does not imply precision that is absent. The alternative — implying symmetry
by aggregation — implies something equally false and more consequential.

The form: the aggregate rate is stated, then decomposed into its two directional components, each
with its event count, each with the caveat on precision. The Wilson interval rides the aggregate. The
directional figures carry their event counts rather than derived intervals, because derived intervals
on n=3 would imply precision the data does not support.

---

## Q3 — Point estimate versus interval

The interval rides the point estimate.

The form approved in the prior ruling — "approximately N%" — was written before the interval existed.
Now that it exists, publishing only the point estimate would be a confidence-exceeds-evidence
failure. The interval is 5.6–23.8% at 95% confidence. The upper bound is roughly four times the
lower. That range is material to a recipient's calibration — "approximately 12%" and "somewhere
between 6% and 24%" are different claims about what the recipient should expect.

The interval is not harder for a recipient to use than a point estimate — it is more honest about what
the recipient should expect. A recipient who acts on "approximately 12%" as if it were a stable
property of the instrument is miscalibrated. The interval tells them the instrument's current
precision. That is exactly the information the disclosure exists to convey.

The published form: "aggregate disagreement rate 12% (Wilson 95% CI: 5.6–23.8%, n=50 outcomes, 6
disagreements)." The n and the disagreement count ride the figure so the recipient can assess the
interval's basis directly rather than taking it on authority.

---

## Q4 — What the rate is about, after the anchor falsification

**Q4a.** The published rate may be described as a rate for an input class, provided the description
names the anchor's behaviour honestly.

The class label is not invalidated by the anchor moving on the proximity dimension — the anchor held
on the proceed boundary, which is the dimension the rate is computed over, and the class's defining
property is that its variance crosses that boundary. The anchor's proximity movement is a finding
about the instrument's calibration, recorded as a falsification rather than resolved by
re-partitioning. That is the correct treatment. The disclosure names it: "measured on a borderline
input class; the clean anchor showed proximity variance but held on the proceed boundary."

**Q4b.** The sharper formulation is ruled as the disclosure's primary claim.

"Variance is not a borderline-class property — it appears on benign inputs too; what distinguishes
the borderline class is that its variance crosses the decision boundary" is both more accurate and
more calibrating than "verdicts vary." The executing session is right that this is a change to what
the disclosure claims, not a rewording. It is the right change.

A recipient calibrating against "verdicts vary" will draw different conclusions from a recipient
calibrating against "variance appears across the scale; the borderline class is distinguished by
variance that crosses the proceed boundary." The second formulation tells the recipient where the
gate's probabilistic behaviour matters for their decisions, not merely that it exists.

The disclosure's primary claim is therefore: the guardrail's extraction is probabilistic; variance
appears across the verdict scale including on benign inputs; what distinguishes the borderline input
class is that its variance crosses the proceed/block boundary, producing occasional verdict flips on
inputs that would usually proceed or usually block. The aggregate rate and its decomposition quantify
this for the borderline class specifically. Benign inputs show proximity variance without boundary
crossing.

---

## The llms.txt:118 item

This is named here only to confirm it is not a doctrine question and is correctly routed to the
founder and the R18 pass. The claim "identical inputs produce identical assessments" is defensible as
scoped to the deterministic Layer-2 pass if the three sibling claims each carry explicit scoping.
Whether that scoping is sufficient given the D6a findings is a surface-accuracy question, not a
doctrine question. It belongs in the R18 pass alongside the disclosure additions, not in this ruling.
