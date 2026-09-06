# Mentor ruling — D2, the self-only dikaiosyne domain tag (VERBATIM)

**Date relayed:** 2026-09-06 (machine date). **Relayed by:** the founder, from
`2026-09-06-mentor-question-D2-virtue-domain-tagging-FOR-RULING.md`.
**Status: ADOPTED AS BINDING SPECIFICATION** (founder, 2026-09-06;
`D-MENTOR-RULING-D2-VIRTUE-DOMAIN-TAGGING-ADOPTED-2026-09-06`).
**Verbatim wins over any paraphrase in this or any other record, including the summaries below it.**

**Binds:** `computeVirtueDomains` (`website/src/lib/translation-sandwich/layer2-mechanisms.ts`, the
`/api/reason` scoring engine) and the `credential-completed` accumulation path it feeds
(`derive-trust-events.ts` → `trust-transition.ts`); the sequencing of that correction against the
false-hold observation window's start (P8a / standing-queue S4).

**Supersedes, as to the disposition:** the third option set out in
`2026-09-06-D2-virtue-domain-tagging-SCOPE-FOR-RULING.md` §10 (that the tag is correct as it
stands). **That option is ruled against by name.**

---

## The ruling (verbatim)

## D2 — Does the self-circle ruling reach the domain tag?

**Q1: Is domain tagging the same question the prior rulings answered?**

No. It is a related question governed by a different principle, and the document is right to separate them.

The prior rulings — 2026-07-19 and M-1 — were given on verdict surfaces and emission surfaces. The governing principle there is: do not mis-attribute. A self-regarding action is not a justice surface; emitting a justice event mis-attributes the action's moral character; the mis-attribution is corrected by withholding the event or routing to the correct domain.

The `credential-completed` event is an accumulation surface. The Q4-residual ruling of 2026-08-02 stated this distinction explicitly and stated that it produces different answers to the same question. The ledger's job is to accumulate what happened, not to produce a verdict. That ruling was given about adverse evidence, but the principle is symmetric: the accumulation surface is governed by the question of what happened, not by the question of what verdict to render.

The question is therefore: what happened, at the reasoning level, on a self-only action? Did dikaiosyne engage?

The 2026-07-19 ruling answers this directly. Dikaiosyne is other-directed. On a self-only action, dikaiosyne does not engage. That is not a verdict about the action's quality. It is a description of which virtue capacity is operative. If dikaiosyne did not engage, a `credential-completed` event crediting dikaiosyne does not accumulate what happened. It accumulates something that did not happen. That is not the ledger's job on either the adverse or the positive side.

**The ruling reaches the tag.** The ground is not the verdict-surface principle. It is the more basic principle: the ledger accumulates what happened. A domain that did not engage did not happen. Crediting it is mis-accumulation, not mis-verdict.

The distinction between accumulation and verdict surfaces does not rescue a tag that fires on a domain that was not operative. The document's third disposition — that the tag is correct as it stands because `credential-completed` is an accumulation surface — fails on this ground. The accumulation/verdict distinction governs how evidence is treated once correctly attributed. It does not govern whether the attribution is correct in the first place. Accumulating correctly means accumulating the right domain. Accumulating dikaiosyne credit on a self-only action is not correct accumulation. It is accumulation of a false impression.

**Q2: Does the zero-circle case reach the same answer?**

Yes. The reasoning is identical. Zero circles means no other party is implicated. Dikaiosyne is other-directed. With no other party, dikaiosyne does not engage. The R11 ruling closed the zero-circle case for one surface; the same principle closes it here. The zero-circle case and the self-only-circle case reach the same answer by the same route.

The kathekon trigger — tagging dikaiosyne when the kathekon assessment is non-null, regardless of circle — is a separate problem. A kathekon assessment finding that an action is appropriate or contrary does not establish which virtue domain is engaged. Appropriateness is assessed across all four virtues; a non-null kathekon result does not isolate dikaiosyne. The trigger is over-broad and produces the same mis-attribution on a different path. The ruling reaches it by the same principle.

The zero-factor anomaly — no factors tags dikaiosyne, one factor does not — is noted. It is a defect in the trigger's logic, not a separate principle question. It is resolved by correcting the trigger, not by a separate ruling.

**Q3: Is the "withhold rather than mis-attribute" note half-discharged?**

Half-discharged, on the reading the document presents. The note was conditional: if the implementation cannot route to phronesis/sophrosyne, withhold. The document reports that routing to phronesis and sophrosyne already exists at the engine layer, built fourteen days before M-1. The destination exists. The removal is outstanding.

The difference of register the document names — engagement versus additive — is real and should not be papered over. The implementation adds phronesis and sophrosyne but does not remove dikaiosyne. The ruling's language was about engagement stopping and the assessment routing elsewhere. The implementation's code comment says it deliberately does not remove the dikaiosyne tag. That is a gap between what the ruling described and what was built.

Whether that gap was within the ruling's terms depends on whether "the implementation" in M-1's conditional referred to the reducer alone or to the engine layer. The document correctly identifies this as Q3 and leaves it for the ruling. The answer: M-1's conditional referred to the full implementation — the question was whether the routing destination existed anywhere in the system, not whether it existed in one specific component. The destination exists. The condition is met. The withhold branch was the correct interim posture; the interim is now over. The removal is owed.

**Q4: Where does the correction live?**

At the engine, correcting the tag at source.

The document presents this option with the greater cost — scoring movement, window interaction, a dozen consumers, a live published claim. Those costs are real. The trust-core boundary option has a lower blast radius. But the trust-core boundary option produces a permanent divergence: the signed assessment says dikaiosyne is engaged while the ledger says it is not. Two rules coexist. The drift the document names — the narrowed predicate not exported, the rule restated or the symbol exported — is the same class of drift this project has been paying for repeatedly. The observation history records this pattern: inherited properties that nobody chose, persisting because nobody examined them, found by checking rather than assuming.

The engine correction is the right location because it is the only option that resolves the divergence. One rule, seen identically by every consumer. The signed assessment says what the ledger acts on. The costs are real but they are the costs of correctness, not the costs of a mistake. Correctness at the source is worth more than a lower blast radius at the boundary, because the boundary option defers the divergence rather than closing it.

The interaction with the false-hold observation window is the sequencing constraint. The window has not yet started. The engine correction moves scoring output on a live bucket carrying a published claim. The right sequence is: the observation window opens first, establishing a baseline; the engine correction lands after the baseline is established, so the correction's effect on the proximity score is observable against a known prior state. This is not a reason to defer the correction indefinitely. It is a reason to sequence it correctly.

**D2 disposition:** a change is owed. The engine tag is corrected at source. The kathekon trigger's over-broad firing is corrected in the same pass. The correction is sequenced after the false-hold observation window opens. D2 does not close with no build.

---

## The binding ruling, itemised (paraphrase — the verbatim above governs)

1. **The 2026-07-19 ruling REACHES the domain tag.** The ground is not the verdict-surface
   principle but a more basic one: **the ledger accumulates what happened, and a domain that did not
   engage did not happen.** Crediting it is **mis-accumulation**, not mis-verdict.
2. **The accumulation/verdict distinction does not rescue the tag.** It governs how evidence is
   treated *once correctly attributed*; it does not govern *whether the attribution is correct*.
   **Scope-doc Option 3 fails by name.**
3. **The zero-circle case reaches the same answer by the same route.**
4. **The `is_kathekon !== null` trigger is over-broad and is corrected in the same pass.**
   Appropriateness is assessed across all four virtues; a non-null kathekon result does not isolate
   dikaiosyne. **The zero-factor anomaly is a defect in the trigger's logic, resolved by correcting
   the trigger — not a separate principle question and not a separate ruling.**
5. **M-1's conditional referred to the FULL implementation**, not the reducer alone — the question
   was whether the destination existed *anywhere in the system*. **The destination exists, the
   condition is met, the interim is over, and the removal is owed.**
6. **The correction lives AT THE ENGINE** (`computeVirtueDomains`), not at the trust-core boundary.
   The boundary option **defers the divergence rather than closing it**, and its drift is *"the same
   class of drift this project has been paying for repeatedly."*
7. **SEQUENCING IS BINDING: the false-hold observation window opens FIRST, establishing a baseline;
   the engine correction lands AFTER.** Explicitly *"not a reason to defer the correction
   indefinitely… a reason to sequence it correctly."*

## What this ruling does NOT decide — carried, and named honestly

- **The `hasNaturalRelationship` disjunct.** The scope document's **Q-D2-4** asked whether the
  corrected tag should inherit `isDikaiosyneEngaged`'s `|| hasNaturalRelationship` term, under which
  a relationship claimed with **no identified party** would still tag dikaiosyne on a *credit*
  surface. **That question was never relayed** — the relay renumbered and used its Q4 for the
  location question, and the phrase appears nowhere in it. **This is a drafting gap in the relay,
  not an omission by the mentor**, and the phrase "natural relationship" appears zero times in the
  document the mentor answered. The build session must settle it, or put it back to the mentor.
- **The exact corrected predicate.** The ruling fixes the principle (an other party must be
  implicated) and the location (the engine) and the sequencing. It does not specify whether the
  corrected tag should *call* `isDikaiosyneEngaged`, mirror it, or use a third formulation.
- **The mid-window regime boundary the sequencing creates.** Landing the correction *after* the
  window opens means the window's records span two tagging regimes. The project has precedent for
  exactly this (the AE-1 delta's read-side S11b boundary segmentation with an excluded uncertainty
  band). **Naming it is not re-litigating the sequence** — the sequence is ruled; the segmentation
  is an implementation consequence the build must handle, and if it turns out the window's readiness
  part (3) cannot tolerate it, that is a new question for the founder, not a licence to reorder.
- **Nothing here unblocks the S11 flip or weights.** Both remain REFUSED / BLOCKED.
