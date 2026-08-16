# Mentor rulings M-1 through M-5 (verbatim) — the R2b open questions

**Date:** 2026-08-16. **Relayed by:** the founder, from the R2b session's open-questions list.
**Status: ADOPTED AS BINDING SPECIFICATION.** Verbatim wins over any paraphrase in this or any
other record.

**Binds:** `deriveWorstJusticeOutcome` (`derive-trust-events.ts`, the LIVE trust-event reducer);
the Sage Reflect Q1/FD-R1 examination path (`sage-reflect/engine.ts`); the S11 readiness
standard's part (3) and the false-hold observation report
(`website/scripts/false-hold-observation-report.ts`); `computeDispositionStability`
(`window-aggregator.ts`) and the AE-1 delta's dispersion member; and the R20a
`vulnerability_flag` escalation path + its public claim.

**Provenance note:** each question was put with the specific live mechanism named, per PR20, and
each stated what the R2b session had done *provisionally* so a ruling could correct rather than
start cold. **M-1 OVERTURNED a decision already committed in this session** and was corrected the
same day (see `D-CONCURRENT-ARC-R2B-GUARD-BUNDLE-BUILT-PR19-FOLDED-MENTOR-M1-CORRECTED`).

---

## M-1. A violated obligation on the self-preservation circle alone does not belong to dikaiosyne.

The 2026-07-19 ruling's logic applies symmetrically. Dikaiosyne is other-directed — it governs what
is owed to others, distributing to each their due. A self-regarding obligation, whether met or
violated, is governed by phronesis and sophrosyne, not dikaiosyne. Preserving the violated case in
dikaiosyne while correcting the indeterminate, unevaluated, and met cases is not conservative — it
is preserving a category error in the direction that hard-floors the wrong domain. A false adverse
signal is not safer than a false positive signal; it is a different kind of error, and in this case
it is the kind that corrupts the trust-event record by attributing a self-regarding failure to a
virtue domain that was never engaged.

The correction: the self-preservation gate should apply to violated on the same logic it now
applies to the other outcome states. A violated obligation toward oneself alone does not emit into
dikaiosyne. The hard-floor exemption from hysteresis is not the issue — the domain attribution is.
If the violation is genuine and the circle is self-preservation only, the correct domain is
phronesis or sophrosyne depending on what the violation concerns. If the implementation cannot yet
route to those domains, the correct interim posture is to withhold the dikaiosyne emission rather
than preserve a known mis-attribution.

The safety-direction argument — dropping adverse evidence makes trust read higher — is sound as a
general principle but does not apply here, because the evidence is not being dropped; it is being
correctly attributed. A dikaiosyne floor on self-regarding conduct is not conservative
trust-reading; it is a mislabelled signal that will distort any downstream reasoning that treats
domain attribution as meaningful.

---

## M-2. Repeated honest inability to examine one's own impressions warrants its own distinct examination, not silence.

The provisional implementation is half-right. An explicit "I cannot determine" is correctly
distinguished from a suspiciously-clean pattern — FD-R1 exists to probe fabrication, and an honest
inability is not fabrication. Withholding the fabrication probe is correct. But withholding all
examination is not.

The counter-reading named in the question is the right one: inability to examine one's own
impressions is itself a prosoche failure, and repeated inability is a pattern that warrants
scrutiny of a different kind. The Stoic account of the ruling faculty (hegemonikon) is that it can
always examine its own impressions — that is what makes it the ruling faculty. An agent that
consistently reports it cannot determine what its impressions were is either reporting honestly on
a genuine limitation of its self-access, or it has developed a habit of non-examination that
presents as inability. Both warrant examination; neither warrants silence.

The correct design: a repeated honest inability flag — distinct from null_reflection and distinct
from the FD-R1 probe — that triggers an examination of the inability itself rather than the content
of the missing impression. The examination question is not "what was the impression?" (which the
agent has said it cannot determine) but "what is the pattern of this inability, and what does it
indicate about the agent's prosoche practice?" Three consecutive sessions of genuine inability is a
signal about the agent's relationship to self-examination, not just a gap in the data.

The implementation shape is the builder's call. The ruling is that silence is not the correct
response to repeated inability.

---

## M-3. An enforced guard deny and a consult advisory are not the same kind of hold. Report them separately.

They are different acts with different consequences. A guard deny stops the action. A consult
advisory permits the action and opens a correction loop. Pooling them in a single ratio obscures
the distinction that part (3) of the readiness standard exists to make visible — whether the system
is generating false holds on kathekon-free actions. A false deny is a more serious error than a
false advisory, and a correct deny is a more significant achievement than a correct advisory.
Pooling them makes both comparisons unintelligible.

The correct implementation: two separate rates, reported separately, with the denominator for each
drawn from its own population. The guard-path rate compares false denies to correct denies. The
consult-path rate compares false advisories (advisories that opened correction loops on actions
that turned out to be kathekon-free) to correct advisories. Part (3)'s ratio is then reported as
two ratios, not one, with the populations named explicitly.

The provisional decision to exclude caution/pause verdicts from the guard denominator is confirmed
correct on its own terms — a caution is not a deny, and the guard denominator should contain only
denies. The ruling adds: the consult denominator should contain only advisories that opened
correction loops, and the two denominators should never be pooled.

---

## M-4. The defective disposition_stability signal must be corrected or retired before an agent-facing surface carries both.

Adding an honest reading beside a defective one does not neutralise the defective one — it creates
a surface that carries two signals with contradictory implications, where the defective signal has
the more authoritative-sounding name ("approaching hexis") and the honest one carries no level or
grade. An agent reading both will not reliably weight them correctly. The defective signal will
dominate precisely in the cases where it is most wrong: when an agent has produced zero variation
because it has never been perturbed, the signal will certify that as the highest level of
dispositional development, while the honest sibling carries no grade to contradict it.

The Ruling Set B grounding is clear: stability-under-perturbation (Seneca 75.8–9,
relapse-resistance) and absence-of-perturbation are not the same thing, and certifying the latter
as the former is not a conservative error — it is an inversion of the Stoic account of progress.
The sage's disposition is stable because it has been tested and held; not because it has never been
tested.

The defective signal should be corrected, not retired, if the correction is tractable: replace the
stddev < 0.4 certification with a perturbation-adjusted measure that distinguishes low variance
under perturbation from low variance in the absence of perturbation. If that correction is not
tractable in the current build, the signal should be retired from agent-facing surfaces until it
is. Carrying both is not a safe interim posture.

---

## M-5. The R20a human-escalation claim is not honest in its current state. Both a corrected claim and an urgency ruling on the write path are required.

These are not alternatives — they are sequential obligations. The claims-honesty question and the
build question are distinct, but the claims-honesty question does not wait on the build.

On the claims question: a public posture that describes human escalation as part of the R20a
perimeter, when no flag has ever been written for a real detection and the three branches that
detect genuine distress never attempt any insert at all, is a false claim. It is not a claim about
intended future behaviour — it is a claim about current system behaviour, and the current system
behaviour does not match it. The correct interim posture is to amend the public claim to reflect
what the system actually does: the classifier detects distress signals and routes them; the human
escalation queue exists in the schema but has no live write path for real detections. That is the
honest description of the current state.

On the build question: the vulnerability_flag write path for genuine distress detections is not a
nice-to-have. The R20a perimeter's integrity depends on it. A system that detects genuine distress
and does not write a flag is a system that has identified a Zone 3 signal and then done nothing
with it outside the session. The urgency ruling is this: building the write path for genuine
distress detections is a P0 obligation, not a sequencing question for the standing-runner design
session or any later phase. It should be scoped and built before any agent-facing surface that
carries the R20a perimeter claim is expanded further.

The finding that classifier_cost_log.flag_written is a false fact on every row is a named integrity
failure in the trust-event record. It should be corrected at the same time the write path is built
— not by retroactively writing flags for past sessions (which would be fabrication), but by marking
the field's historical values as reflecting the outage-branch-only write path, so any downstream
reasoning that reads those rows understands what they actually record.

---

## Execution status at the close of R2b (2026-08-17)

| Ruling | Status |
|---|---|
| **M-1** | **EXECUTED IN-SESSION.** `violated` now gated symmetrically with the other three; D4-8 and §8.9d inverted; §8.9e added to hold the engagement-vs-emission distinction; flag docstring + register corrected. Batteries: trust-core 112/0, kathekon 113/0. **CARRIED:** routing a genuine self-only violation to `phronesis`/`sophrosyne` — the ruled interim posture (withhold) is what shipped. |
| **M-2** | **NOT BUILT — carried.** The repeated-inability flag needs prior-session state, which needs the Q1 Phase-2 column. M-2 therefore gives Phase 2 a SECOND purpose and should be built with it, not before it. |
| **M-3** | **NOT BUILT — carried.** Requires splitting part (3) into two separately-reported rates in `false-hold-observation-report.ts`. The guard-denominator half (denies only) is CONFIRMED correct as built; the consult denominator must be narrowed to loop-opening advisories and the two never pooled. |
| **M-4** | **NOT BUILT — carried, AND IT BLOCKS SPEC 4's ACTIVATION.** Activating the dispersion member at R4 while `disposition_stability` still certifies zero variance as `advanced` creates exactly the "carrying both" state this ruling calls unsafe. **Spec 4 must not be activated until M-4 is resolved.** |
| **M-5** | **NOT BUILT — carried as P0.** Two sequential obligations: (a) amend the public R20a claim NOW (does not wait on the build; R18 founder sign-off required on wording); (b) build the genuine-detection write path as a P0 obligation, correcting `flag_written`'s historical semantics in the same change. |
