# Close — The signal-quality gap, scoped

**Date:** 2026-08-25 · **Stream:** founder · **Arc:** reflections (not a SageReasoning project arc)
**Tier:** `governance`, scope + design proposal. **No build.** **AC7 not engaged.** No code, schema,
flag, credential, or live operation. Production untouched. No source file was edited — every
mechanism fact below was established by reading.

**This is not a letter and not an arc item.** It scopes the design gap the mentor's IW-7-openings
ruling named as blocking opening 2 and opening 3 phase two, at the founder's explicit election.

---

## What landed

**One document:** `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md`.

**The headline finding, from reading `layer2-mechanisms.ts`, `layer1-extractor.ts`, and
`parallel-run.ts` directly:** the sparse-extraction default is a fully deterministic function of one
count (`satisfiedCount === 0` → `quality: 'contrary'` → `is_kathekon: false` → the mentor-ruled,
test-pinned justification string), and the harness already reads the fields that identify it. **That
is not the gap.** The gap, restated precisely from the ruling: `quality === 'contrary'` cannot
distinguish "genuinely nothing kathekon-relevant here" from "the extractor missed something real" —
both produce byte-identical wire output, and no further signal on the kathekon dimension itself
exists to resolve which occurred.

**A derivable, not-yet-verified cross-check is proposed.** The full `Layer1Schema` object (all its
other arrays — `passions_present`, `oikeiosis_circles_engaged`, `value_categories_at_stake`,
`causal_stage_evidence`) is already returned on the wire and already received by the hook, unused for
this purpose. Whether those other arrays are also empty (general extraction failure, low confidence in
the null) or populated (the extractor engaged substantively, higher confidence the kathekon null is
genuine) is a derivable proxy — **disclosed explicitly as a heuristic, not a certainty**: a rich
extraction elsewhere does not prove the kathekon dimension specifically was examined correctly.

**Zero server change required for the proxy.** It is a pure client-side (harness) logic addition
reading data already in hand — a materially lighter lift than either a new wire field or a second
extraction pass would be.

---

## What this document explicitly does not do

**It does not clear opening 2 or opening 3 phase two.** It sharpens the mentor's own disclosed
uncertainty ("may not be derivable") into a specific, honest answer: a graded confidence proxy is
derivable; a certain answer is not, and per the document's own §2, may not be derivable from a single
consult's output at all. §4 names the actual question this now puts to the mentor, if the founder
elects to relay it — whether a disclosed heuristic is an acceptable basis to arm on, or whether the
residual false-negative risk means holding until a stronger check exists.

**No code was written.** The four files named above were read, not edited.

---

## Records

- `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md` — new, then folded with the ruling
- `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md` — new
- `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md` — §§2/3/6 updated to reflect opening 3 phase two's new status
- `operations/decision-log.md` — entry appended at the physical tail
- this close — new, then amended with the ruling fold

---

## Mentor ruling — RECEIVED and FOLDED, 2026-08-25

**Opening 2 stays HELD**, reconfirmed on sharper grounds than the original ruling: the proxy is real,
but at opening 2's firing rate it is *"a rate-limiter on false positives that still passes false
positives through"* — the wrong shape of signal for a gating use, not merely an imperfect one. The
condition the original ruling actually named (a genuine second-pass check on the kathekon dimension,
or a new wire field) is not satisfied by a proxy built from adjacent dimensions.

**Opening 3 phase two is UNBLOCKED**, because it uses the identical proxy at a fixed, once-per-session
frequency to vary *content* rather than to *gate a firing* — ruled acceptable there specifically,
on the constraint that the content variation carry the confidence level explicitly and disclose,
plainly, when a high-confidence reading is what's driving the content (never presented as a certainty).

Verbatim: `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`.
Folded into both scope documents (this session's own `2026-08-25-signal-quality-gap-scope.md` §§0/3/4,
and the master `2026-08-25-iw7-three-openings-scope.md` §§2/3/6, since the ruling changes opening 3
phase two's standing status there). Decision-log: `D-SIGNAL-QUALITY-GAP-RULED-2026-08-25`.

**No build in this session.** §3 (both phases now) is fully mentor-cleared, but this session's own
tier stays `governance` — building it is its own election into a code-tier session.

---

## What comes next — not chosen here

1. Elect §3 (both phases, now both ruled-for) into a code-tier session.
2. A genuine second-pass kathekon-dimension check or a new wire field, if opening 2 is ever to be
   reopened — a heavier, unscoped alternative.

---

## Commit

Committed and **pushed — founder-confirmed, Vercel green.** (Documents-only session; "Vercel green" is
expected, not evidence of anything this session changed at runtime.)
`website/src/data/environmental-context.json` remains a pre-existing, unrelated modification and is
excluded from this session's commit.
