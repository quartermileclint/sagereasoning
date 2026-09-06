# Mentor ruling — D2 follow-on: the natural-relationship disjunct (VERBATIM)

**Date relayed:** 2026-09-06 (machine date). **Relayed by:** the founder, from
`2026-09-06-mentor-question-D2-natural-relationship-disjunct-FOR-RULING.md`.
**Status: ADOPTED AS BINDING SPECIFICATION**
(`D-MENTOR-RULING-D2-NATURAL-RELATIONSHIP-DISJUNCT-ADOPTED-2026-09-06`).
**Verbatim wins over any paraphrase, including the itemisation below it.**

**Completes the D2 specification.** With the principal ruling
(`2026-09-06-mentor-ruling-D2-virtue-domain-tagging-verbatim.md`) this leaves **no open axis** on
what the corrected tag must say. **Binds** `computeVirtueDomains` (`layer2-mechanisms.ts`) and the
build session **S11-D2**.

---

## The ruling (verbatim)

## D2 follow-on — should the corrected tag inherit the natural relationship term?

The question is well-formed and the self-correction on the credit stake is the right move. Ruling on the inflated framing would have produced a narrower answer than the principle requires. The document corrected its own framing before asking. That is the discipline operating correctly.

---

### The ruling

**Term (b) — the natural relationship factor — should be retained in the corrected tag, on the same terms as the 2026-07-19 ruling stated: an action that foreseeably affects a third party, even anonymously, engages dikaiosyne.**

The reasoning follows directly from the ground the D2 ruling established. The ledger accumulates what happened. The question is whether dikaiosyne engaged.

The 2026-07-19 ruling set the boundary: dikaiosyne is other-directed, and the other party need not be named explicitly. An action that foreseeably affects a third party, even anonymously, engages dikaiosyne. That boundary was not drawn at identified parties. It was drawn at other parties — named or anonymous, identified or foreseeably present.

Term (b) — a natural relationship factor asserted in the agent's own narration — is evidence that an other party is foreseeably implicated. The agent's narration asserts a relationship of the kind that generates obligations. That assertion is not proof, but it is the same class of evidence the extraction uses for everything else at this layer. The engine does not require certainty; it requires a reasonable basis. An asserted natural relationship is a reasonable basis for inferring that dikaiosyne is in play, on the same terms as an anonymous but foreseeable third party.

Dropping term (b) would narrow the tag below the boundary the 2026-07-19 ruling set. It would create a second divergence between the verdict test and the corrected tag — the exact outcome the Q4 answer chose the engine location to avoid. The "one rule, seen identically by every consumer" aim is met by retaining (b) in both surfaces, not by removing it from one.

---

### On the self-only case with a natural relationship factor

The document raises a specific concern: an action whose only circle is `self_preservation` where the extraction also reports a natural relationship factor. On a corrected tag carrying both (a) and (b), the second term would still fire.

This is the right concern to raise, and the answer is that it does not defeat the ruling.

The natural relationship factor is evidence of an other party. If the extraction reports a natural relationship factor, the extraction is asserting that the agent's narration describes a relationship of the kind that generates obligations — which is, by definition, a relationship with another party. If that assertion is correct, dikaiosyne is engaged and the tag is correct. If the extraction is wrong — if the agent's narration asserted a relationship that does not exist or was self-regarding despite the surface language — that is an extraction error, not a tagging error. The correction belongs at the extraction layer, not by removing term (b) from the tag.

The self-only case that the D2 ruling addressed is the case where the self circle stands alone and no natural relationship factor is reported. That case is correctly handled by term (a) alone being false. The case where the self circle stands alone and a natural relationship factor is also reported is a case where the extraction found evidence of an other party despite the circle identification. That evidence should be credited, not suppressed.

---

### On the third possibility

The document raises a third possibility: that (b) is right for the verdict surface and wrong for the accumulation surface, so the two tests deliberately differ on this one term.

This possibility fails for the reason the document anticipates — it is the same shape as the accumulation/verdict distinction the D2 ruling said does not rescue an incorrect attribution. The accumulation/verdict distinction governs how evidence is treated once correctly attributed. It does not govern whether the attribution is correct.

If dikaiosyne engaged — because an other party was foreseeably implicated, named or anonymous — then both surfaces should record that engagement. The verdict surface may treat the engagement more harshly when the party is unidentified (flooring to reflexive). The accumulation surface records the engagement at the value the assessment carries. These are different treatments of the same underlying fact. They are not different facts.

Deliberately diverging on term (b) would mean the verdict surface says dikaiosyne engaged and the accumulation surface says it did not. That is not a difference in treatment. It is a contradiction. The one-rule aim forecloses it.

---

### On the zero-credit observation

The document's self-correction is accepted and noted for the record. Because (b)-without-(a) floors the assessment to reflexive, and the ledger event carries that floored value, and the level only rises when the carried value exceeds the current level, a dikaiosyne tag arising from (b) alone cannot raise the level. The credit concern was inflated.

The question survives on the correct ground: whether a ledger row asserting dikaiosyne engaged should exist at all for an input where only (b) fires. The ruling's answer is yes, it should — because dikaiosyne did engage, on the 2026-07-19 boundary. The row is accurate. Its existence is not the problem. The problem the D2 ruling addressed was rows asserting dikaiosyne engaged on self-only actions with no other-party evidence at all. Term (b) is other-party evidence. Its presence changes the case.

---

### Sequencing and scope

The sequencing is unchanged. The build lands after the observation window opens.

The kathekon trigger correction and the term (b) retention are decided together, as the document correctly identifies — the two corrections interact and should be built in the same pass. The kathekon trigger is corrected to remove the over-broad `is_kathekon !== null` firing. Term (b) is retained in the corrected tag. The self-only case without a natural relationship factor is handled by term (a) alone being false.

---

## The corrected tag, now fully specified (paraphrase — the verbatim above governs)

**Dikaiosyne is tagged engaged when EITHER:**
- **(a)** at least one oikeiosis circle beyond `self_preservation` is present; **OR**
- **(b)** a `natural_relationship` kathekon factor is reported.

**And NOT on the `is_kathekon !== null` trigger, which is removed as over-broad** (a non-null
kathekon result does not isolate dikaiosyne; appropriateness is assessed across all four virtues).

**That is exactly the existing `isDikaiosyneEngaged` predicate** — so the ruling's "one rule, seen
identically by every consumer" is satisfied **literally**, and Finding A's observation (that the
correctly narrowed test already existed in the same module) is what the remedy now adopts.

**Build note, from source and not from this ruling:** `isDikaiosyneEngaged` and
`computeVirtueDomains` are in the **same module**, so **no export is required** — the export cost
recorded against the boundary option does not apply at the engine. The call site already computes
`isDikaiosyneEngaged(oik.relevant_circles, hasNaturalRelationshipFactor(schema.kathekon_factors),
agentCircles)`; threading that boolean into `computeVirtueDomains` is a **signature change**, which
the build session must handle and PR19 must review.

## What this ruling settles, and what it leaves

**Settled:** term (b) retained; the self-only-plus-(b) case is other-party evidence and is credited,
**not** a defeat of the correction; a wrong extraction is an **extraction-layer** problem, not a
tagging problem; the third possibility (deliberate divergence) **fails** — it would be a
contradiction, not a difference in treatment; the zero-credit self-correction is **accepted and
noted for the record**.

**Unchanged:** the sequencing — **the build lands after the observation window opens**. The kathekon
trigger correction and the (b) retention are **built in the same pass**.

**Still open, and NOT touched by either ruling:** the exact mid-window tagging-regime boundary the
sequencing creates (AE-1's read-side S11b segmentation is the precedent), and everything downstream
of the build — the ~12 consumers, the live score bonus, the published `llms.txt:548` claim, and the
R18 decision a build carries. **Weights remain BLOCKED; the S11 flip remains REFUSED.**
