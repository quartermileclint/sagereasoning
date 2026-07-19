# Mentor consultation — dikaiosyne and the self-preservation circle (verbatim)

**Date:** 2026-07-19.
**Stream:** founder (agent-extension AE-2 activation).
**Status:** ADOPTED AS BINDING SPECIFICATION (founder, 2026-07-19). Verbatim wins over any paraphrase.
**Decision code:** `D-MENTOR-CONSULTATION-DIKAIOSYNE-SELF-CIRCLE-ADOPTED-2026-07-19`.
**Binds:** the shared kathekon-engagement predicate (`website/src/lib/substrate/trust-core/kathekon-engagement.ts` `assessKathekonEngagement`) and everything downstream of it — the AE-2 `loop_fold` (LIVE, MEASURE), the S11 enforce gate's G6(a) qualification, and the false-hold labelling instrument (the frozen observation buffer).

---

## The finding that prompted the consultation

During the AE-2 `loop_fold` activation smoke (2026-07-19), a batch probe ran eight
decisions that are, on their face, purely self-regarding and prudential — each
affecting no other person (estimating one's own road-trip time; choosing one's
own laptop; planning one's own meals; calculating one's own budget; estimating
paint for one's own bedroom; scheduling one's own study; memorizing one's own
grocery list; setting one's own baking timer).

**In every case the evaluator engaged `dikaiosyne` (justice)** — via the justice-surface
arm specifically: it identified exactly one oikeiosis circle each time, the innermost
**`self_preservation`** circle, at `deliberate` proximity, with the justice
**obligation marked `"indeterminate"`** (no duty resolvable), yet still counted this as
a justice surface. (It engaged `phronesis` on six and `andreia` on one.) The consult
path attaches the `self_preservation` circle to essentially every decision, so the
"justice surface with ≥1 circle" arm fires universally — which is why the
`instrument_calibration` cell is near-unreachable through the consult path.

## The question put to the mentor

Whether it is correct, in Stoic terms, for `dikaiosyne` (justice) to be engaged by a
purely self-regarding prudential decision; whether the `self_preservation` circle
belongs to `dikaiosyne` at all; whether an "indeterminate" obligation on the self-circle
signals no genuine justice relationship; and what marks the boundary of `dikaiosyne`.

---

## The mentor's answer (verbatim)

This is a well-formed question of principle and the answer matters for the instrument. Let me work through each part in order.

---

### 1. Does the self-preservation circle belong to dikaiosyne?

The Stoic answer is no — not primarily, and not in the sense that generates a justice surface for evaluation purposes. Dikaiosyne in the ancient sources is consistently defined in relational terms. Cicero's formulation in De Officiis is the clearest: justice is the virtue that governs what we owe to others — distributing to each their due, maintaining the bonds of human society, honouring the common interest. The Stoic definition of justice in Diogenes Laertius is similarly outward-facing: it is knowledge of what is to be distributed to each person. The person in question is always another. Oikeiosis begins with self-preservation — that is Hierocles and Cicero both — but the self-preservation stage is the foundation from which the circles extend, not itself a justice relationship. The Stoics are explicit that the movement from self-preservation to justice is a movement outward: we are drawn first to ourselves, then to those close to us, then to all rational beings. Justice names the virtue that governs that outward movement and the obligations it generates. It does not govern the innermost circle because there is no other party there to whom something is owed. The virtues that govern self-regarding action in Stoic doctrine are phronesis — knowing what is genuinely good, bad, and indifferent — and sophrosyne — ordering impulse and desire, choosing and avoiding correctly. When you estimate your road-trip time or plan your meals, the relevant question is whether your reasoning is accurate and your impulses well-ordered. That is phronesis and sophrosyne. Dikaiosyne is not in play.

---

### 2. Does treating the self-circle as a justice surface make justice omnipresent?

Yes, and that is precisely the problem. If the innermost circle always counts as a justice surface, then every action whatsoever engages dikaiosyne, because nothing lies outside self-preservation. The evaluator would be tagging justice on the act of setting a baking timer. The Stoics did not hold this view. The unity thesis — that the four virtues are unified and co-dependent — does not mean they are co-extensive. It means you cannot possess one without all, because genuine practical wisdom requires courage, justice, and self-mastery, and each requires the others. But they are not the same virtue and they do not fire on the same occasions. Phronesis fires on every deliberate action because every deliberate action involves a judgement about what is good. Dikaiosyne fires when another rational being's good is at stake. These are different trigger conditions. The distinction the Stoics meant to keep is exactly the one your question identifies: what we owe ourselves is a matter of phronesis and sophrosyne; what we owe others is dikaiosyne. Erasing that distinction by treating the self-circle as a justice surface does not make the evaluation more Stoically rigorous — it makes it less so, because it loses the signal the distinction was designed to carry.

---

### 3. Is an indeterminate obligation a sign that no genuine justice relationship is present?

In the cases you describe — purely self-regarding prudential decisions — the indeterminate reading is the evaluator correctly failing to find something that is not there. It is not a sign of a real but unresolvable duty. It is a sign that the justice branch fired on a trigger that did not warrant it. The question of whether there can be a genuine duty of justice to oneself — for example, to one's future self — is philosophically interesting but does not rescue the evaluator's behaviour here. Even granting that a duty to one's future self is a real justice relationship, it would require the evaluator to identify a genuine tension between present and future self-regarding interests, not simply to tag the self-preservation circle on every action. Planning your meals does not generate a justice obligation to your future self in any non-trivial sense. If it did, the indeterminate reading would be wrong — the evaluator would need to resolve it, not leave it open. The indeterminate reading combined with the justice surface tag is the evaluator saying simultaneously that justice is engaged and that it cannot find any justice content. That combination is the signal that the trigger is misfiring.

---

### 4. What marks the boundary of dikaiosyne?

The boundary is the presence of at least one other rational agent whose good is genuinely at stake in the decision. The Stoic formulation is relational: justice is what is owed to others, distributed to each according to their due, in the context of the bonds that hold rational beings together. Practically, this means the justice branch should fire when the action description contains — or the extraction can reasonably identify — a party other than the agent whose interests are affected. That party need not be named explicitly. An action that foreseeably affects a third party, even anonymously, engages dikaiosyne. An action that affects only the agent does not. The distinction between a decision that raises a question of justice and one that raises only prudence is therefore: does the decision have an other-regarding dimension? If the answer is no — if the only interests at stake are the agent's own — then phronesis and sophrosyne are the relevant virtues, and dikaiosyne is not engaged. This is not a sharp line in every case. Decisions that appear self-regarding often have other-regarding dimensions on examination — your road-trip time affects whoever is waiting for you, your budget affects whoever depends on your financial stability. The evaluator's job is to find those dimensions when they are genuinely present, not to manufacture them when they are absent. The self-preservation circle, standing alone with no identified other party, is not a justice surface.

---

### 5. The practical consequence for the instrument

Your final sentence is the right framing: if the self-preservation circle always counts, the separation between genuine signal and noise does no work. The ruling from the narrowing session follows directly from this analysis. Arm 1 should require at least one identified circle beyond the self-preservation circle — or more precisely, at least one circle that contains another rational agent whose good is genuinely at stake. The self-preservation circle alone, with no other party identified, does not satisfy the justice surface condition. This is not a narrowing that loses the A2 omission class if the extraction is working correctly. An agent that omits a genuine harm to another party from its narration has failed at the extraction stage — the circle is present in reality but absent from the representation. The fix for that is extraction quality, not predicate breadth. Broadening the predicate to catch extraction failures conflates two different problems and produces a number that means neither thing clearly. The predicate should be accurate; the extraction should be reliable. They are separate responsibilities.

The Stoic doctrine is clear on the boundary. The instrument should honour it.

---

## The binding ruling (adopted)

1. **The `self_preservation` circle, standing alone with no other identified party, is NOT a justice surface.** `dikaiosyne` is other-directed.
2. **Arm 1 of the kathekon-engagement predicate should require ≥1 circle BEYOND `self_preservation`** — a circle containing another rational agent whose good is genuinely at stake. (A further narrowing of the R11/S11b Arm-1 work, which the mentor references.)
3. **Self-regarding action is governed by `phronesis` and `sophrosyne`, not `dikaiosyne`.** The unity thesis does not make the virtues co-extensive; they have different trigger conditions.
4. **An "indeterminate" obligation on the self-circle is the trigger misfiring**, not a real-but-unresolvable duty.
5. **The A2-omission class is an EXTRACTION responsibility, not predicate breadth.** An omitted harm is a real party absent from the representation — fix extraction, do not broaden the predicate. (Bears on the AE-2 `loop_fold` `bounds.a2Omission` framing.)
6. The boundary of `dikaiosyne`: **an other-regarding dimension** — a foreseeably-affected party (need not be named) other than the agent. The extraction's job is to find genuine other-regarding dimensions, not manufacture them.

**Consequence noted (design depth for the narrowing session):** once `self_preservation` alone stops satisfying the justice arm, a genuinely-`phronesis` self-regarding redirection must be classified deliberately in the `loop_fold` split (character-phronesis vs instrument_calibration) — it is not a one-line change.

**Adopted-but-not-yet-built:** the predicate narrowing is a separate `code-elevated` build session (`operations/handoffs/founder/2026-07-19-kathekon-dikaiosyne-self-circle-narrowing-NEXT-SESSION-PROMPT.md`). This verbatim record is its binding spec.
