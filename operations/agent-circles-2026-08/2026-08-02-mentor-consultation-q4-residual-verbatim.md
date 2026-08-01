# Mentor consultation — Q4 residual: self-only violated obligation, proximity consequence or full routing — verbatim

**Date:** 2026-08-02 · **Session:** `claude-sonnet-5` finish-up session, continuing the same-day Q2/Q3/Q4 scoping session. **Status:** binding — verbatim wins over any summary or scope-document prose where they diverge.

**Context supplied to the mentor** (verbatim, as sent):

> **Consultation question — Q4 residual: does a self-only violated obligation carry any proximity consequence, or does Q2's routing fully replace it?**
>
> **Context.** The 2026-08-02 ruling on Q4 confirmed that the pre-existing `self_preservation`/`oikeiosis_circles_engaged` obligation-assessment channel (ADR-010 §4, live since 2026-06-25) already lets a first-circle-only signal floor `katorthoma_proximity` to `reflexive` and hard-deny via the live gate — a category-error violation of ruling L4, which C1a's narrowing makes fire more often, not less. Scoping that remediation found the exact fix location: `computeDikaiosyneFloor` in `layer2-mechanisms.ts`, which today folds every extracted circle — including a self-only `self_preservation` circle — into the dikaiosyne floor with no distinction. The mechanical fix mirrors the already-adjudicated 2026-07-19 self-circle narrowing in `kathekon-engagement.ts`'s Arm 1: exclude `self_preservation` from what counts as "an engaged circle" for dikaiosyne, so a self-only violated obligation no longer engages dikaiosyne at all.
>
> That narrowing composes with the separately-scoped Q2 fix: when no circle survives the narrowing (dikaiosyne not engaged, nothing else present), the assessment routes positively to phronesis and sophrosyne instead of going unrouted — a classification-only change that never touches `computeProximity` or any floor.
>
> **The open question.** `kathekon-engagement.ts`'s own Arm 1 narrowing preserved an asymmetry (its Arm 2): a violated obligation on the self circle alone still engages *something* — adverse justice evidence is never simply dropped, even though dikaiosyne itself does not engage. That precedent was adjudicated for a trust-ledger/measurement surface, where the cost of a miscount is low.
>
> `computeDikaiosyneFloor` is not a measurement surface — it feeds the live `katorthoma_proximity` verdict and the `/api/guardrail` gate. Two readings are both defensible from the existing rulings, and they diverge in consequence:
>
> 1. **The Arm-2 asymmetry carries over.** A self-only violated obligation should still produce *some* proximity consequence — not via dikaiosyne, but conservatively, through another domain or a distinct classification — so "adverse evidence is never dropped" holds at the verdict layer the way it already does at the trust-ledger layer.
> 2. **Q2's routing is the complete replacement.** A self-only reasoning-integrity failure is not a justice matter at all — it is a phronesis/sophrosyne matter, full stop, and once it is classified there, no proximity consequence should attach at all. This is the more literal reading of Q2's own language ("it has moved to the right one") but has not been explicitly ruled on for the verdict layer specifically.
>
> Which reading is correct — does a self-only violated obligation carry any residual `katorthoma_proximity`/gate consequence once it is excluded from the dikaiosyne floor, or does Q2's phronesis/sophrosyne routing fully discharge it with no proximity effect at all?

---

## The mentor's answer (verbatim)

> ## Q4 Residual — Self-Only Violated Obligation: Proximity Consequence or Full Routing?
>
> **Q2's routing is the complete replacement. A self-only violated obligation carries no residual katorthoma_proximity or gate consequence once excluded from the dikaiosyne floor.**
>
> ---
>
> ### Why the Arm-2 asymmetry does not carry over to the verdict layer
>
> The Arm-2 asymmetry in kathekon-engagement.ts was adjudicated for a trust-ledger surface where the governing principle is: adverse evidence is never silently dropped from the measurement record. That principle is epistemic — it concerns what the record honestly shows. A violated obligation on the self circle alone still enters the trust ledger as adverse phronesis/sophrosyne evidence, because the ledger's job is to accumulate what happened, not to produce a verdict.
>
> computeDikaiosyneFloor is not an accumulation surface. It is a verdict surface. Its job is to produce a proximity reading that accurately reflects the agent's reasoning quality, which then feeds the live guardrail gate. The governing principle here is not "never drop adverse evidence" — it is "the verdict must be grounded in the correct virtue domain for the failure being assessed." These are different principles serving different functions, and they produce different answers to the same question. The Arm-2 asymmetry was the right answer for the ledger. It is the wrong answer for the floor.
>
> ---
>
> ### The Stoic grounding for the divergence
>
> The four cardinal virtues are unified — you cannot possess one without all — but they are not interchangeable in their domains. Phronesis governs accurate judgement about what is genuinely good, bad, and indifferent. Sophrosyne governs the discipline of assent and the ordering of impulse. Dikaiosyne governs what is owed to others. A first-circle reasoning-integrity failure is a failure of examination or of the discipline of assent. It is not a failure of other-directedness, because no other is implicated.
>
> A proximity floor computed through dikaiosyne for a self-only failure is not a conservative reading — it is a misclassification. It produces a verdict that says: this agent failed in its obligations to others. That claim is false when the failure is self-regarding. A false verdict is not a conservative verdict. It is an inaccurate one, and inaccuracy at the verdict layer propagates into the guardrail gate, which acts on it.
>
> The phronesis/sophrosyne routing does carry proximity consequence — but through those domains' own assessment paths, not through computeDikaiosyneFloor. If the build's current architecture has no proximity path for phronesis and sophrosyne failures, that is a separate gap to scope. It does not justify routing self-only failures through dikaiosyne to produce a proximity effect by the wrong mechanism.
>
> ---
>
> ### The precise ruling
>
> Remove self_preservation from what counts as an engaged circle for dikaiosyne in computeDikaiosyneFloor, mirroring the kathekon-engagement.ts Arm-1 narrowing exactly. A self-only violated obligation produces no dikaiosyne floor and no proximity consequence through that path.
>
> The Q2 routing — phronesis and sophrosyne — is the complete replacement at the classification level. Whether those domains then produce a proximity consequence depends on their own assessment paths, which is a separate architectural question. That question should be scoped and answered on its own terms, not resolved by borrowing dikaiosyne's floor as a proxy.
>
> The Arm-2 asymmetry remains in place at the trust-ledger layer where it was adjudicated. It does not transfer to the verdict layer. The two surfaces have different governing principles, and the answer that is right for one is wrong for the other.

---

## What this settles, and what it newly opens

**Settled — Q4's open sub-question is closed.** Reading 2 (Q2's routing is the complete replacement) is the binding answer. `computeDikaiosyneFloor`'s narrowing (exclude `self_preservation` from the engaged-circle set) produces no proximity consequence for a self-only violated obligation, full stop — no compensating floor through another domain inside that function, no distinct classification standing in for it there.

**Newly opened, named but explicitly not resolved by this ruling:** whether `phronesis` and `sophrosyne` have their own proximity-assessment paths at all today (i.e., whether *any* failure classified into those domains currently produces a `katorthoma_proximity` consequence through some other mechanism, or whether they are purely descriptive/`virtue_domains_engaged`-only in the current engine). The mentor is explicit this is "a separate gap to scope" and "a separate architectural question" that "should be scoped and answered on its own terms" — not something this ruling answers, and not something to resolve by routing self-only failures through dikaiosyne as a workaround. **This is a new, distinct scoping item**, separate from Q2/Q3/Q4 as originally framed, and should not be silently folded into any of the three existing scope documents' build steps without being scoped on its own terms first, per the mentor's explicit instruction.

**Consequence for Q4's build:** the fix is now unambiguous — the mechanical Arm-1-style narrowing in `computeDikaiosyneFloor`, as already scoped in `2026-08-02-Q4-preexisting-channel-remediation-scope.md`, is confirmed correct with no further branch needed inside that function. The one earlier open sub-question no longer gates the build.
