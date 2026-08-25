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

- `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md` — new
- `operations/decision-log.md` — entry appended at the physical tail
- this close — new

---

## What comes next — not chosen here

1. Relay §4's question to the mentor.
2. Decline and hold openings 2 and 3-phase-two indefinitely — a founder call.
3. Scope the heavier alternative (a genuine second extraction pass specifically on the kathekon
   dimension, or a new structured wire field) instead of the client-side proxy — named but not
   scoped in this document.

---

## Commit

Committed. **Not yet pushed** — the founder pushes.
`website/src/data/environmental-context.json` remains a pre-existing, unrelated modification and is
excluded from this session's commit.
