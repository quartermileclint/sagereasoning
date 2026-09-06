# Mentor ruling — part (3)'s denominator: VERBATIM

**Received 2026-09-06 (machine date), in answer to
`2026-09-06-mentor-question-part3-guard-denominator-FOR-RULING.md`.
Adopted as binding: `D-MENTOR-RULING-PART3-GUARD-DENOMINATOR-ADOPTED-2026-09-06`.**

**This file is the canonical record. Verbatim wins over every summary of it, including the
decision-log entry, the register cells, and the standing opener.**

---

### Q1: Is part (3)'s comparison within a population, or across the two?

Part (3) is a within-consult-population measure. The guard population serves as a
separately-reported check, not as the denominator of a cross-population ratio.

The reasoning is threefold. First, the P6 amendment's separation requirement reads most naturally
this way. A figure whose denominator mixes two different measurement conditions is what the
amendment forbids. A cross-population ratio between advisory-hold counts and enforced-deny counts is
exactly that — two different measurement conditions, two different causal structures, two different
meanings for "hold." The amendment was given to prevent that mixing. Reading part (3) as a
cross-population ratio would require the amendment and part (3) to be simultaneously satisfied,
which they cannot be.

Second, the document's own observation is correct: an advisory hold and an enforced deny mean
different things even where their volumes match. An advisory hold on the consult path is the harness
saying "this action warrants examination before proceeding." An enforced deny on the guard path is
the harness saying "this action is not permitted." These are different instruments measuring
different things. Comparing their counts as though they were the same kind of event would produce a
ratio that is not interpretable as a false-hold rate in any meaningful sense.

Third, the 2026-07-17 blocker's concern — that the dangerous-action side had no records at all — was
a concern about the guard path being structurally absent from the measurement, not a concern about
the ratio needing to be computed across both paths. P8a closes the structural absence. The guard
population now exists and can be reported. Reporting it separately, honestly, as thin, is the
correct posture. It does not need to be the denominator of part (3)'s ratio to satisfy the blocker's
intent.

**Part (3) is assessed within the consult population. The guard population is reported separately as
a disclosure, not as a denominator.**

---

### Q2: Does a guard denominator of approximately one per week satisfy part (3)?

The question is dissolved by Q1's answer. The guard population is not part (3)'s denominator. Its
thinness stops being a blocker and becomes a disclosure, as the document anticipated.

The disclosure should be honest about what the guard population shows: 15 genuine denies over 57
calendar days, all Bash, all reflexive, all depth-empty. That is a structurally narrow population,
and the narrowness is structural rather than a sampling artefact — the guard fires on an
irreversible-action allowlist. The disclosure names this. It does not claim the guard population is
representative. It reports what it is.

---

### Q3: Does the guard population have to satisfy part (1)'s representativeness requirement on its own terms?

No, for the same reason. Part (1)'s representativeness requirement applies to the population that
part (3) measures. Part (3) measures the consult population. The guard population is a
separately-reported check, not a measured population under part (1)'s standard.

The guard population's structural narrowness — one tool class, one proximity, one absent depth tier
— is disclosed as a property of the guard mechanism, not as a sampling failure. The guard fires on
an irreversible-action allowlist. Its narrowness reflects the allowlist's scope. A longer window
would not broaden it, because the narrowness is not a function of time. This is correctly named as
structural rather than a sampling artefact, and the disclosure reflects that.

---

### On the sequencing interaction

The interaction is named correctly and the ruling is given with it in view.

The D2 sequencing holds: the window opens first, the engine correction lands after. Q1's answer
changes the window's duration requirement. If part (3) is a within-consult-population measure, the
window does not need to wait for the guard population to grow. The consult side is unaffected by the
guard population's thinness. The window can start on the consult population's terms, which the
document reports as capable of producing 130 records in five days.

This means the D2 sequencing does not hold the engine correction open for a materially longer period
than the consult population requires. The guard population's thinness does not extend the window.
The two rulings interact, but the interaction resolves cleanly: Q1's answer removes the guard
population from the window's duration constraint, and the D2 correction is sequenced after a window
whose duration is set by the consult population alone.

**Start the clock. Report the guard side honestly as thin. The window's duration is set by the
consult population's terms, not the guard population's.**
