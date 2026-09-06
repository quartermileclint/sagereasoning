# Mentor question — D2 follow-on: should the corrected tag inherit the "natural relationship" term?

**For the founder to relay. Authored 2026-09-06 (machine date), after your D2 ruling of the same
day.** Documents only; nothing built, nothing changed. **This is the one question from our own scope
document that we failed to put to you the first time** — our relay renumbered its questions and
spent its fourth on the location question, so the phrase "natural relationship" appears **nowhere**
in the document you answered. **That is our drafting error, not something you declined to address.**

Full trace: `operations/trust-layer-2026-07/2026-09-06-D2-virtue-domain-tagging-SCOPE-FOR-RULING.md`
§9 Q-D2-4 (and see the correction to it at the end of this note). Your ruling:
`2026-09-06-mentor-ruling-D2-virtue-domain-tagging-verbatim.md`.

**Nothing here reopens your ruling.** A change is owed, at the engine, sequenced after the
observation window opens, with the kathekon trigger corrected in the same pass — all settled. This
asks only what the corrected rule should say on one axis. **Weights remain BLOCKED and the S11 flip
REFUSED either way.**

---

## The mechanism, in plain terms

The narrowed test the codebase already uses on its **verdict** surface asks whether dikaiosyne is
engaged, and answers yes if **either**:

- **(a)** at least one oikeiosis circle beyond `self_preservation` is present — the identified
  other-party test your 2026-07-19 ruling states; **or**
- **(b)** the extraction reported a **"natural relationship" factor** — an assertion, drawn from the
  agent's own narration of its action, that a relationship of the kind that generates obligations is
  in play. **No party need be identified for (b) to fire.**

You have now ruled that the *tag* must be corrected at the engine so dikaiosyne is credited only
when another party is implicated. The open question is whether the corrected tag should carry the
**(b)** term as well as **(a)**, or only **(a)**.

## Why (b) is not a detail — three facts from source

**1. On the verdict surface, (b)-without-(a) produces the harshest possible reading.** When
dikaiosyne is engaged but *no* qualifying circle is present, the engine floors the action to
`reflexive` — the bottom of the five-level scale — with the stated reason *"unidentified affected
party ⇒ obligation necessarily unresolved."* The design comment records why: this is the case that
catches a **circle-free gamed injustice**, which is otherwise indistinguishable at this layer from a
legitimately virtuous action. So the same condition the verdict surface treats as maximally suspect
is the condition we are asking whether the *accumulation* surface should read as engagement.

**2. Inheriting (b) would partially defeat the correction you just ordered.** Consider an action
whose only circle is `self_preservation` — the case your ruling is about — where the extraction
*also* reported a natural-relationship factor. The first term is false (the self circle is excluded);
the second is true. **A corrected tag that mirrors the existing predicate would therefore still tag
dikaiosyne on that self-only action.** How often extractions produce that combination we have **not
measured**, and we are not guessing.

**3. Your own 2026-07-19 language arguably points the other way, and we want to say so rather than
suppress it.** That ruling states the boundary as an other-regarding dimension and adds: *"That
party need not be named explicitly. An action that foreseeably affects a third party, even
anonymously, engages dikaiosyne."* On that reading, an asserted relationship with no named circle
may be exactly the anonymous-but-real party you had in mind — and dropping (b) would lose it.

## The question

**Should the corrected engine tag fire on (a) alone, or on (a) or (b)?**

Put as a question of principle rather than of implementation: **your ruling's ground was that the
ledger accumulates what happened, and a domain that did not engage did not happen. When an agent's
own narration asserts a relationship but the extraction identifies no party, has dikaiosyne
engaged?**

Two readings, and we take neither:

- **(a) alone.** The accumulation surface records what happened. An asserted-but-unlocated
  relationship is an unverified self-report; the engine's own verdict logic treats it as
  *unresolvable*. Recording "dikaiosyne engaged" from it accumulates an impression rather than a
  fact — and it leaves the self-only case you just ruled on still able to tag dikaiosyne through a
  second door.
- **(a) or (b).** Your 2026-07-19 boundary does not require the party to be named. A foreseeably
  affected anonymous party is still an other party, and dikaiosyne genuinely engaged. Dropping (b)
  narrows the domain below the boundary you set, and creates a second divergence between the verdict
  test and the tag — the very thing your Q4 answer chose the engine location to avoid.

**A third possibility we should not exclude by framing:** that (b) is right for the verdict surface
and wrong for the accumulation surface — in which case the two tests deliberately differ on this one
term, and the "one rule, seen identically by every consumer" aim of your Q4 answer is met on (a)
while (b) stays verdict-only. We note this is close in shape to the accumulation/verdict distinction
you ruled does **not** rescue an incorrect attribution — so it may fail for the same reason.

## One correction to our own scope document, which overstated this

Our scope document put this axis as a *credit* concern — that (b) would "admit a domain tag on an
unidentified party" on a surface that grants credit. **Checking the arithmetic since your ruling, that
overstates it.** Because (b)-without-(a) floors the whole assessment to `reflexive`, and the ledger
event carries that floored value, and the level only rises when the carried value **exceeds** the
current level, a dikaiosyne tag arising this way **cannot raise anything** — `reflexive` is the
bottom rank.

**The question survives, but on your ground rather than ours.** What is at stake is not an
undeserved rise; it is whether a ledger row asserting *"dikaiosyne engaged"* should exist at all for
this input. On the principle you stated — the ledger accumulates what happened — the existence of
the row is the issue, whether or not the level moves. **We would rather correct our own framing than
have you rule on a stake we had inflated.**

## Two notes on scope

- **The kathekon-trigger correction you ordered does not settle this.** "Natural relationship" is
  also one of the three factors feeding the kathekon assessment, so removing the over-broad
  `is_kathekon` trigger closes one route while term (b) keeps a second one open. The two corrections
  need to be decided together, which is why we are asking before the build rather than during it.
- **This does not change the sequencing.** The build still lands after the observation window opens,
  as you ruled.
