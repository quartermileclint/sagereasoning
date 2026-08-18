# `/limitations` crisis-detection wording — APPLIED 2026-08-19

**Status: APPLIED.** The perimeter was confirmed LIVE (founder-run smoke, 2026-08-19) and the
preferred formulation below is now published verbatim in `website/src/app/limitations/page.tsx`'s
"We are not therapists" section, alongside the M-5 "nothing happens afterwards" disclosure kept
prominent. See `D-PERIMETER-LIVE-CONFIRMED-LIMITATIONS-PUBLISHED` in the decision log. This file is
retained as the record of the ruled wording, not as a pending-action document.

Two independent gates, both from binding rulings:
1. **2026-08-17** — "Nothing is published until the perimeter change is confirmed live and the
   filesystem sweep is complete." The sweep is complete (green, 2026-08-18). **The perimeter is BUILT,
   NOT ACTIVATED** — `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` covers the wired routes and was already
   live, but live confirmation of the completed perimeter has not been performed.
2. **2026-08-18 Q3** — the wording itself changed. See the supersession below.

---

## ⚠ SUPERSESSION — read this before using the 2026-08-17 ruling

The 2026-08-17 ruling instructed: *"Publish A3's original wording (the 'every time' clause becomes
true once 1–3 hold)."*

**That instruction is AMENDED by the 2026-08-18 Q3 ruling.** A bare "every time" now **over-promises**
and may not be published. A session that reads only the 2026-08-17 ruling and publishes A3's original
wording would publish a claim the mentor has since ruled dishonest.

The mentor's reasoning, verbatim: *"The sweep is now more robust than it was. It is not proven
exhaustive… the claim being published is 'every time' — a universal claim — and the verification
behind it is a mechanism that has demonstrated it can be structurally incomplete while running
green."*

Grounds: within 24 hours of the sweep being built, adversarial review found a structural blind spot
(the `route.ts`/`handler.ts` split — six live routes silently out of scope with the battery green),
reproduced with a synthetic unscreened route. Fixed and pinned, but *"discovered in practice, not
hypothetically."*

---

## The ruled wording — PREFERRED formulation (verbatim)

> "The distress check runs on every surface the sweep can see. The sweep is a mechanism: it has been
> found structurally incomplete once, corrected, and hardened with a regression pin. It is the
> strongest verification we can honestly offer, not a guarantee of exhaustiveness."

## The ruled FLOOR — if the page needs it shorter (verbatim)

> "The check runs on every surface the sweep can see — the sweep has been tested, found incomplete
> once, and corrected."

**"That is the floor. Anything shorter than that is over-promising."** Do not compress below it, do
not paraphrase it looser, and do not drop the "found incomplete once" clause — that clause is the
entire substance of the bound.

---

## Carried alongside, unchanged and still P0

The 2026-08-17 ruling's other half stands and is NOT discharged by any of this:

> "The M-5 obligation — building the write path for genuine distress detections — remains a P0
> obligation independent of this wording question… A practitioner caught by the perimeter still
> receives an in-session redirect and nothing afterwards. That is what the disclosure must say,
> clearly, once the perimeter is confirmed."

**"Nothing happens afterwards" must remain prominent** — the mentor named it "the more important
half" of the claim. The Q3 bound is about *coverage*; the M-5 disclosure is about *what the system
actually does when it catches something*. Both belong in the published wording; neither substitutes
for the other.

---

## Placement

`website/src/app/limitations/page.tsx` — the "We are not therapists" section (~line 36) is the
existing crisis-facing block and is the natural home. The page currently carries no coverage claim at
all, which is why it is honest today and why nothing is urgent about publishing.

## Sequence when it does publish

1. Confirm the completed perimeter LIVE (its own founder-walked step).
2. Apply the preferred formulation (or the floor, if length forces it).
3. Keep the M-5 "nothing afterwards" disclosure prominent alongside it.
4. R18 surfaces (`llms.txt` / `agent-card.json` / api-docs) carry no coverage claim today — check
   before publishing whether any needs the same bound, rather than assuming the page is the only
   surface.
