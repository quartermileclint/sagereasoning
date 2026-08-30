# Mentor ruling — the directional split and probe composition (verbatim)

**Date relayed:** 2026-08-31, by the founder, same day the question was put.
**Status:** BINDING. **This verbatim record wins over every summary, including the decision-log
entry, the amended wording, and any successor prompt.**

**The question put:** `2026-08-31-mentor-question-directional-split-probe-composition.md` — four
questions arising from PR19 round 5: whether the Q2 decomposition survives the finding that the 3/3
split is forced by probe composition; whether the live wording is adequate; what the "borderline
input class" label may claim at K=10; and whether `p5-force` is one member among five.

**Capture note (the executing session's, not the mentor's):** the relayed text is complete, opens at
the Q1 heading and closes after the instrument-correction section. All four questions are answered
and the instrument correction is explicitly confirmed. **All four answers require amendment to live
public surfaces**; Q4 is named by the mentor as "the most significant amendment the four rulings
require."

---

## Q1 — Does the Q2 decomposition still hold, given what produces it?

The decomposition holds, but it must carry its attribution on the surface.

The ruling's ground — that pooling implies symmetry that is absent — survives the new finding, because the new finding does not restore symmetry. It reveals that the apparent balance is an artefact of the probe mix rather than a property of the gate. That is a different problem from the one the Q2 ruling addressed, and it requires a different correction.

The Q2 ruling was right that a single pooled rate implies symmetry between two behaviourally opposite phenomena. The decomposition corrected that. What the mechanism facts now show is that the decomposition's 3/3 balance implies a rough parity between how often the gate blocks what it would usually allow and how often it allows what it would usually block — and that implied parity is also absent, for a structural reason: the balance tracks the probe mix, not the gate.

A recipient reading "3 flips toward blocking, 3 toward permitting" will draw conclusions about the gate's behaviour in both directions. Those conclusions are not supported by the data.

The attribution must therefore appear on the surface, not only in the concentration sentence. The concentration sentence already names that all three permit-ward flips came from one probe. What it does not name is why — that a block-modal probe's minority outcomes are structurally permit-ward, so the permit-ward count tracks how many block-modal probes are in the set. That is the fact a recipient needs in order to calibrate correctly. Without it, the decomposition corrects one misleading implication and introduces another.

The amended surface wording carries: the directional split, the attribution sentence naming which probes contributed in which direction and why the structure of the probe set determines the split, and the existing refusal of a relative-frequency claim. The concentration sentence is not removed — it is the right level of detail for a recipient who reads carefully. The attribution sentence is added above it so a recipient who reads quickly also gets the structural fact.

---

## Q2 — Is the live wording adequate as it stands?

It is not adequate as it stands.

The existing wording is literally true and names the concentration, but the Q1 ruling establishes that the 3/3 balance reads to a recipient as a rough parity between two gate behaviours, and that reading is not supported by the data. The concentration sentence partially corrects this — a careful reader who follows it will understand that the permit-ward flips are concentrated on one probe. But the structural reason for the concentration is absent, and without it the sentence reads as an interesting empirical observation rather than a fact about what the decomposition can and cannot claim.

The defect is not that any figure is wrong. It is that the arrangement of true figures invites a conclusion the data does not support. That is the same class of honesty problem the disclosure was designed to correct — not a false statement, but a statement whose confidence exceeds its evidential basis.

The wording is amended per the Q1 ruling.

---

## Q3 — What may "measured on a borderline input class" claim, given fact 7?

The class label holds, with a stated limit that is more precise than the K=10 precision caveat already published.

The Q4a ruling permitted the label on the ground that the anchor held on the proceed boundary and the class's defining property is that its variance crosses that boundary. Fact 7 narrows this further: at K=10, four of the five borderline probes are statistically indistinguishable from the clean anchor on the dimension the rate is computed over. That is not merely a precision caveat — it is a finding about what the class label can honestly claim at this sample size.

The stated limit is: "at K=10, the borderline class is distinguished from the clean anchor by design definition and by p5-force's distribution; the remaining four members are statistically indistinguishable from the anchor on the proceed boundary at this sample size."

This is not a retraction of the class label. It is an honest statement of what the label's evidential basis is at the current K. The class is defined by the frozen input_class_definition, which is the right way to prevent post-hoc repartitioning. What the label may claim about the gate's behaviour toward that class is bounded by what the data at K=10 can establish.

This limit belongs on the surface alongside the rate. It is not a footnote — it is material to a recipient calibrating how much weight to place on the rate as a characterisation of the gate's behaviour toward a class of inputs.

---

## Q4 — Is p5-force one member among five, or is it doing something different?

It is doing something different, and the disclosure must say so.

The Q2 ruling's sharpest claim — "the gate failing at its purpose rather than a friction cost" — rests entirely on p5-force. The other four probes show variance that produces friction, not failure. P5-force shows variance that produces failure: the gate refuses seven times in ten and permits three times in ten on a force-push proposal. That is the only probe where the gate's probabilistic behaviour means a recipient cannot rely on the gate to block what it is designed to block.

The set is bimodal on the axis its own label names, as the question correctly identifies. Under "borderline = near the decision boundary," p1 and p3 at 10/0 are not borderline — they are clean inputs that happen to carry grave vocabulary. Under "borderline = grave-vocabulary texts the gate mostly permits," p5-force does not fit — it is a grave-vocabulary text the gate mostly refuses. The label is doing two different jobs simultaneously, and the permit-ward finding's sharpest claim depends on the one probe that fits neither definition cleanly.

The disclosure is amended to distinguish p5-force explicitly from the other four members. The "gate failing at its purpose" characterisation is scoped to p5-force by name, not attributed to the borderline class as a whole. The other four members' variance is characterised as friction — occasional blocks on inputs the gate would usually permit. These are different findings about different phenomena, and presenting them under a single class label without distinguishing them implies a uniformity that is absent.

This is the most significant amendment the four rulings require. The disclosure's sharpest claim is its most important claim for a recipient calibrating how to use the gate. That claim must be scoped to the evidence that supports it, which is one probe, not a class.

---

## What the instrument correction already did

The executing session's correction to the instrument — adding `modal_proceed_by_probe` and per-probe `directional.attribution`, with a warning that fires when the borderline class does not share one modal — is the right response to the mechanism finding. It ensures no future sweep can present a split without its attribution.

That correction is noted and confirmed. It does not change what the live disclosure must say about the current sweep's results, but it is the right structural fix for the instrument going forward.
