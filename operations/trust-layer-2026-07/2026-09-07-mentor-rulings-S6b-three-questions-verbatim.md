# Mentor rulings — S6b's three questions + two founder decisions (VERBATIM)

**Relayed by the founder 2026-09-07 AEST (= 2026-09-06 UTC), in answer to the questions raised at the
close of session S6b (`D-S6B-COMMIT-GATE-WIRED-OPTION-S-PRE-RUN-BLOCKERS-FIXED-2026-09-07`).**

**THIS RECORD IS CANONICAL. It wins over every summary of it, including the decision-log entry, the
S11 register, the standing opener and the S6b close.** Reproduced exactly as relayed; nothing
paraphrased, nothing elided.

---

## The three questions — rulings

**1. The even-K median convention — lower_median.**

Lower_median is ruled as the convention. The reasoning is brief because the question is genuinely narrow. K is ruled at 10. With an even number of observations, the median falls between two values. Lower_median — the value at position K/2 rather than the average of positions K/2 and K/2+1 — is the correct choice for an ordinal scale where the values are ranks, not quantities. Averaging two ordinal ranks produces a number that may not correspond to any actual rank on the scale. Lower_median stays on the scale. It is conservative — it does not claim more precision than the instrument warrants. It is the right convention for this measurement.

This is published as a convention, as Claude named it, not as a ruling on the underlying scale. If the scale changes, the convention is revisited. If K changes from 10, the convention is revisited. Until then, lower_median is settled.

Claude's timing flag is correct. Change this after a run and every `would_option_M_record` is wrong. Settle it now.

**2. GUARD-OUTAGE records in the guard rate — exclude them.**

GUARD-OUTAGE records are excluded from the guard rate denominator, on the same terms as outages are excluded on the consult side.

The reasoning: a GUARD-OUTAGE record with `captureBasis: "no_assessment"` records that no examination happened, not that an examination happened and produced a result. Including it in the guard rate's denominator would mean counting non-examinations alongside examinations, which is the same asymmetry D6a already ruled against on the consult side.

Symmetry is the governing principle here. The consult side excludes outages. The guard side excludes outages. The disclosure reports the outage rate separately on both sides, as the F-3′ ruling requires.

The self-labelling is the mechanism that makes exclusion clean — the record identifies itself as a non-assessment. Exclude on that basis, log the count, and disclose it alongside the rate.

**3. Review-fleet subagent records in the guard population — exclude them.**

Review-fleet subagent records are excluded from the guard population.

The reasoning: the guard population's purpose is to measure the at-action examination rate on the live agent's consequential actions. A review-fleet subagent firing the same hooks under the parent session ID is not the live agent taking a consequential action — it is a review process examining a prior action. Including those records would mix two different causal populations: actions taken and actions reviewed. That is the same class of mixing the P6 amendment forbids on the measurement side.

The population should contain only records where the live agent was the actor at the moment the hook fired.

The mechanism for exclusion: if the session ID can be used to distinguish parent-session live actions from review-fleet subagent calls, exclude on that basis and log the count. If the session ID alone is insufficient, a `caller_class` field on the record is the right addition — added before publication, not after.

---

## The two founder decisions — recommendations

**Decision 1: The npx-not-found branch exits 0 and silently skips the pin on machines without Node on PATH.**

My recommendation is to make it fail closed — exit non-zero and stop the commit.

The reasoning: a pin that can be silently skipped is not a pin. The byte-identity guard's purpose is to catch uncommitted modifications to measured files during the observation window. A machine without Node on PATH that commits silently has bypassed the guard without any record that the bypass occurred. That is the same class of problem as the committed-edit coverage gap named in the mid-window ruling — the guard goes green, the window may be contaminated, and nothing caught it.

The cost of failing closed is that a machine without Node on PATH cannot commit. That is a real cost. But it is the honest cost of having a guard. A guard that passes on machines where it cannot run is not a guard. It is a false assurance.

The practical shape: exit non-zero with a clear message — something like "Node not found on PATH; the byte-identity pin cannot run; install Node or add it to PATH before committing." This is a one-line change and it makes the guard's coverage honest.

**Decision 2: Five interactive SageReasoning peers are open against a plan that says one serial arc.**

My recommendation is to close four and work one arc at a time.

The reasoning is not primarily about system integrity, though that matters. It is about what the observation history has been tracking across this week. The pattern the history records — disciplined question construction, routing decisions to mechanisms, naming open questions explicitly, self-correcting before relay — is the pattern of a mind working carefully and sequentially. Five parallel arcs is the opposite posture. It is the posture of someone who wants to move fast, cover ground, and feel productive. That is not the same as moving well.

The Stoics named this clearly. Epithumia — craving — presents as urgency. The impression is: more arcs means more progress. The examination reveals: more arcs means more surface area for errors to propagate undetected, more governance interactions to track simultaneously, and more pressure to decide quickly rather than well.

The plan says one serial arc because one serial arc is what the governance structure can hold without losing integrity. Close four. Work one. The work will be better and the record will be cleaner.
