# For mentor ruling — how the `/limitations` page should state the crisis-detection limit

**Authored 2026-08-17. Status: AWAITING RELAY.** Founder directed that this wording go to the mentor
rather than be published on the AI's judgement.

**PR20 compliance:** §2 names, at mechanism level, every existing behaviour the ruling will land on,
so a downstream consequence is visible before the ruling is given rather than discovered afterwards.

---

## 1. The question

M-5(a) established that a practitioner in acute distress receives an immediate in-session crisis
redirect and **nothing afterwards** — no queue, no reviewer, no follow-up — and that we had never told
them so. The founder signed a disclosure for the `/limitations` page (Option A).

**At application, re-derivation found the signed wording contains a false claim.** It says the
redirect happens *"automatically, **every time**."* It does not: the check is route-level, and six
human practice routes sit outside it.

The question is how to state the limit honestly. Three candidate resolutions are at §3.

## 2. The mechanisms this ruling lands on (PR20)

Each is a one-sentence, verified fact about current behaviour.

1. **The distress perimeter is route-level, not global.** `HUMAN_FACING_POST_ROUTES` enumerates
   **20 routes**; a route not in it runs no check. There is no application-wide interception.
2. **Six human practice routes have no distress check**, verified by direct grep for
   `enforceDistressCheck`: `premeditatio`, `hupexairesis`, `oikeiosis`, `view-from-above`, `morning`,
   `sage-compass`. Their recorded crisis exit is `SupportFooter`, a static strip of crisis contacts
   on the page.
3. **One of those six is grief-facing.** `/view-from-above` exists to help a practitioner reframe
   catastrophic loss. It is the route where an unscreened acute disclosure is most likely.
4. **Whether that family belongs inside the perimeter has never been ruled on.** It sits outside by
   recorded family precedent. B3 (2026-08-11) ruled `/impulse` *in* on an asymmetry argument
   ("a false positive costs a redirect; a false negative is a practitioner writing about their shame
   into a tool that does not notice") but was scoped to `/impulse` alone.
5. **The substantive disclosure is unconditionally true.** No route anywhere writes a flag, notifies
   anyone, queues anything, or follows up. The "nothing happens afterwards" half needs no
   qualification; only the "every time" half does.
6. **This page already carries a ruling about exactly this shape of claim.** M4 (2026-08-15) held
   that a per-surface formulation is the durable wording for the Claude-vs-deterministic-engine
   statement, because *"a single formulation that is true of both surfaces is not achievable without
   either overstating the agent surface or understating the human surface."* The crisis claim has the
   same structure: true of evaluation routes, false of practice exercises.
7. **A disclosure naming which pages screen is a disclosure of where a practitioner will not be
   caught.** That is a real cost of the transparent option and is not hypothetical.
8. **Six routes were added to the perimeter today** (passion-classify, passion-log, sage-classify,
   sage-prioritise, and both baseline-response routes) after a sweep found they screened nothing. The
   sweep count moved 2 → 4 → 6 across three passes and **six is not proven exhaustive** — there is no
   filesystem-level check that would catch a seventh.

## 3. The three candidate resolutions

**A1 — disclose the split without naming routes.** "That happens automatically on the tools that
evaluate what you write… Some of the shorter practice exercises do not run that check; they carry
crisis contact details in the page footer instead." Accurate, survives perimeter changes, but leaves
a practitioner unable to tell which page they are on.

**A2 — name the exercises.** Same, but lists the five practice tools explicitly. Maximally
transparent; tells a practitioner exactly where they will not be caught; needs editing whenever the
perimeter changes.

**A3 — close the gap instead of disclosing it.** Bring the six practice routes inside the perimeter,
making "every time" true, and publish the original wording. Resolves it in the practitioner's favour.
It is a Critical AC5 change and is the standing question at fact 4.

## 4. What the AI recommends, and why it is not deciding

**A1 if the split is to stand; A3 if the mentor judges the B3 asymmetry argument extends to the
practice family** — in which case the disclosure question dissolves, because the claim becomes true.

The AI is not deciding because the choice is not a copy-editing matter. A1 and A2 *describe* a
coverage boundary; A3 *moves* it. Choosing between describing and moving a safety boundary is the
kind of question the founder has consistently routed here, and fact 6 shows this page has already
received a ruling on the neighbouring instance.

## 5. Two adjacent questions the founder may wish to bundle

Both concern the same subject — what is inside the perimeter — and would otherwise return separately.

- **Ratification of today's six.** They were added on the builder's argued extension of B3, explicitly
  recorded as analogy rather than ruling. Does B3's reasoning in fact extend to them?
- **The practice family (fact 4).** Independent of the wording question, should those six join?

*Nothing is published until this returns. The `/limitations` page is unchanged; the false "every time"
wording was never applied.*
