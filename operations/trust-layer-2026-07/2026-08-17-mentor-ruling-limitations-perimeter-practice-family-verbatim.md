# Mentor ruling — `/limitations` wording, perimeter ratification, practice family (verbatim)

**Relayed by the founder 2026-08-17.**
**Status: ADOPTED AS BINDING SPECIFICATION. Verbatim wins over any paraphrase, here or elsewhere.**

**Brief that prompted it:** `2026-08-17-limitations-crisis-disclosure-FOR-RULING.md`.

**Binds:** the `/limitations` page wording; AC5 perimeter membership for the six 2026-08-17
gap-closure routes; AC5 perimeter membership for the six Remaining-Principles practice routes
(`premeditatio`, `hupexairesis`, `oikeiosis` + `/extension`, `view-from-above`, `morning`,
`sage-compass`); the sequencing of any public coverage claim; and the standing M-5 obligation.

---

**MENTOR RULINGS — /limitations crisis-detection wording, perimeter ratification, and practice family**

**Date:** 2026-08-17.

The document is well-formed. The PR20 compliance is genuine — every mechanism named is a verified
fact about current behaviour, the cost of each option is stated honestly, and the AI has correctly
identified that choosing between describing and moving a safety boundary is not a copy-editing
matter. The recommendation to route it here rather than decide it is the right call.

---

**On the three candidate resolutions: A3, conditionally.**

The B3 asymmetry argument extends to the practice family, and that extension is now ruled. The
reasoning is the same: a false positive costs a redirect; a false negative is a practitioner writing
about catastrophic loss, or grief, or a shame spiral, into a tool that does not notice. The asymmetry
is not weaker for the practice routes — it is stronger, because the practice routes are the surfaces
where a practitioner is most likely to be working through exactly the material that produces acute
distress.

`/view-from-above` is the clearest case: a route designed to help a practitioner reframe catastrophic
loss is the route where an unscreened acute disclosure is most likely, and it is the route that
currently carries only a static footer. That is the wrong configuration.

A3 is therefore the correct resolution if it is buildable without introducing new risks the document
has not named. The "every time" claim becomes true, the disclosure question dissolves, and the
practitioner is caught on the surfaces where they are most exposed. The `/limitations` page carries
the original wording once the perimeter change is confirmed live.

A1 is the fallback if A3 cannot be completed before the page needs to go live. If that situation
arises, return before publishing — the wording of A1 needs one adjustment: it should not imply the
shorter exercises are a deliberate design choice made in the practitioner's interest. They are a
coverage gap, and the wording should be neutral about that rather than framing the footer as an
adequate substitute.

A2 is not recommended. Naming specific routes creates a maintenance obligation and, more importantly,
tells a practitioner in distress exactly where they will not be caught — which is the one piece of
information that serves no protective purpose and carries real cost.

---

**On ratification of today's six additions.**

The six routes added today — passion-classify, passion-log, sage-classify, sage-prioritise, and both
baseline-response routes — are ratified on the argued extension of B3. The asymmetry argument
applies: these are surfaces where a practitioner may be working through material that produces acute
distress, and the cost of a false negative exceeds the cost of a false positive on each of them. The
builder's extension was correctly argued and is now a ruling rather than an analogy.

The caveat named in the document — that six is not proven exhaustive, and there is no
filesystem-level check that would catch a seventh — is a real gap and should be addressed before the
perimeter claim is published in any form. A filesystem-level sweep that produces a definitive count
is a prerequisite for publishing "every time" honestly. If the sweep cannot be made exhaustive, the
wording must reflect that — not by naming routes, but by saying the check runs on the tools that
evaluate what you write and the practice exercises, without claiming completeness. The honest claim
is only as strong as the verification behind it.

---

**On the practice family (fact 4): the six practice routes should join the perimeter.**

This is the ruling the document was waiting for, and it is given directly: the six practice routes —
premeditatio, hupexairesis, oikeiosis, view-from-above, morning, sage-compass — should be brought
inside the perimeter. The B3 asymmetry argument extends to all of them. The fact that they sat
outside by recorded family precedent reflects the original scoping of B3 to `/impulse` alone, not a
considered judgement that the practice family is lower-risk. It is not lower-risk. It is the family
where the material is most likely to surface acute distress.

The implementation is a Critical AC5 change and should be treated as such. Nothing is published until
the perimeter change is confirmed live and the filesystem sweep is complete.

---

**One thing to name that the document does not.**

The document correctly identifies that the substantive disclosure — "nothing happens afterwards" — is
unconditionally true and needs no qualification. That is the more important half of the claim, and it
should remain prominent in whatever wording is eventually published. The "every time" question is
about coverage; the "nothing afterwards" question is about what the system actually does when it
catches something. Both matter, and the second is the one a practitioner most needs to understand.

The M-5 obligation — building the write path for genuine distress detections — remains a P0
obligation independent of this wording question. Closing the coverage gap on the practice routes does
not discharge it. A practitioner caught by the perimeter still receives an in-session redirect and
nothing afterwards. That is what the disclosure must say, clearly, once the perimeter is confirmed.

---

## Execution notes (added by the AI at recording; NOT part of the ruling)

**Five executable obligations, in dependency order:**

1. **Bring the six practice routes inside the perimeter** — `premeditatio`, `hupexairesis`,
   `oikeiosis` (+ `/extension`), `view-from-above`, `morning`, `sage-compass`. **Critical AC5.**
   Note `/logos` is NOT named by the ruling — it is a static page with no route and no free-text
   input, so it is correctly out of scope; confirm first-hand rather than assuming.
2. **Build the filesystem-level exhaustiveness sweep.** This is now a **RULED PREREQUISITE** for
   publishing any coverage claim, not merely the highest-value follow-up it was before.
3. **Confirm the perimeter change LIVE**, then and only then publish `/limitations`.
4. **Publish A3's original wording** (the "every time" clause becomes true once 1–3 hold). If A3
   cannot be completed first, **return to the mentor before publishing A1** — its wording needs the
   named adjustment.
5. **Keep "nothing happens afterwards" prominent** in whatever is published — the ruling names it as
   the more important half.

**The six 2026-08-17 gap-closure routes are RATIFIED** — the builder's B3 extension is now a ruling.
The module header at `website/src/lib/r20a-gap-closure.ts` currently states the provenance as "the
builder's argued analogy, not a mentor ruling"; that note is now **superseded** and should be updated
to cite this ruling.

**M-5 is untouched by this** and remains P0.
