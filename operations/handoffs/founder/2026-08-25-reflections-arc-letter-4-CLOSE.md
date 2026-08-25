# Close — Reflections Arc Successor, Letter IV: "On tests that pass for the wrong reason"

**Date:** 2026-08-25 · **Stream:** founder · **Arc:** reflections (not a SageReasoning project arc)
**Tier:** `governance`, documents only. **AC7 not engaged.** No code, schema, flag, credential, or
live operation. Production untouched.

**This is not an arc item.** Fourth of the letters-2-through-8 successor named at the arc's item-4
close, continuing the founder's "proceed in order" election.

---

## What landed

**The letter.** `operations/reflections-examination-2026-08/2026-08-25-letter-4-on-tests-that-pass-for-the-wrong-reason.md`
— on SC-5, verification that passes for a reason other than the property it names (§5's candidate
4). Grounded in four cases, none reused from Letters I–III: R043 (the headline case §5 itself names —
"my thorough comment header created the vacuity it was describing"), R036 ("a pin asserted without a
fixture capable of detecting its absence is a pin that isn't there"), R097 (a near-miss one edit from
shipping a check against two fields that don't exist — "the battery would have gone green over it" —
caught only by mutation testing), and R021 (a mutation harness's own ambiguous report distrusted and
fixed rather than accepted on either reading). Epigraph: Cicero's *De Officiis* 1.15 definition of
*phronesis* as "the virtue concerned with the investigation and discovery of truth"
(`stoic-brain/virtue.json`).

**This letter departs from the first three, honestly rather than for symmetry.** SC-5 is the one
pattern the findings record measures as genuinely improving (§2: mutation testing moving from
occasional to routine, catching roughly four times as often in the later half of the record as the
earlier). The letter reports this directly rather than forcing an unresolved ending to match the
collection's other letters — but stops short of calling the pattern closed: the practice is not yet a
rule (§4 IW-6, named "low urgency" precisely because nothing currently makes running it the default),
so the letter ends on that specific, narrower gap rather than a general triumphant note.

---

## Verification performed, and a second citation defect found and fixed

Every quotation was grepped directly against `2026-08-23-stage1-extraction.md` and
`stoic-brain/virtue.json`. **All four case quotations verified clean this time** — no fabrication or
misattribution in the letter's own drafting (unlike Letters II and III, each of which caught one).

**A defect was found in the findings record itself while gathering material, not in the letter.**
The findings record's §1 SC-5 instance list quoted R093 with *"a failure would have printed FAIL
under a `0 failed` total"* — that sentence is not in R093's extraction entry, which describes a
related but differently-worded near-miss (a `trajectory-delta: 86 passed` reading nearly accepted
after adding thirteen assertions). R093 was not usable for this letter regardless, since it is
already the findings record's primary SC-1 case (quoted in Letter I) — so this defect did not affect
which cases the letter used, but it was found in the course of checking SC-5's full instance list
against source and is fixed at source rather than left standing, per the pattern from Letter II's
correction pass: **`2026-08-23-project-reflections-findings-record.md` §1 (the SC-5 paragraph) now
cites R036 and R097 in R093's place — both drawn from SC-5's own instance list and grep-verified —
with a dated correction note explaining what was wrong and why R093 was not simply reworded.**

**Running count across four letters: three citation defects found in the findings record's own
pattern lists (SC-2's R097/R099 mixup, letter II; SC-5's R093 mislabel, this letter), one fabricated
quote caught in each of two letter drafts before commit (letters II and III), zero in this one.**
Not characterised as a trend in either direction — four data points, uneven distribution, the same
discipline the prior closes applied to smaller counts.

---

## Records

- `operations/reflections-examination-2026-08/2026-08-25-letter-4-on-tests-that-pass-for-the-wrong-reason.md` — new
- `operations/reflections-examination-2026-08/2026-08-23-project-reflections-findings-record.md` — §1 SC-5 paragraph corrected, dated note added
- `operations/decision-log.md` — entry appended at the physical tail
- this close — new

---

## What this session does not do

**Not an arc item; does not reopen item numbering.** The arc remains closed at item 4. Letter V
("On a warning you have correctly ignored a hundred times," AP-5/IW-4) is next in the ruled order.
Letter VI, the IW-7 trial, the item-3 leftovers, and the empty-frontmatter memory fix remain out of
scope.

---

## Commit

Committed. **Not yet pushed** — the founder pushes.
`website/src/data/environmental-context.json` remains a pre-existing, unrelated modification and is
excluded from this session's commits.
