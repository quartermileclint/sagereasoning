# Mentor question — should Option S's directional decomposition exist at all?

**Prepared 2026-09-06 for founder relay.** One question, arrived at from two directions.

**Status: blocking a spend, not a build.** Option S has **never made a call**; its `runs/` directory
is empty. A PR19 review found four pre-run blockers, and these two items were separated from them
because they are **not code fixes** — they are publication decisions. Fixing the blockers and then
running, only to be told the output should not exist, would waste the run (≈$1.24 as ruled, with
re-spend estimated at ≈$3.41–4.12 if the sweep is redone).

**PR20 provenance.** **[SOURCE]** = read from the file this session. **[RECORDED]** = taken from a
project record, re-read this session at the cited path. Both premises below were re-read at their cited
paths on 2026-09-06 rather than relayed on the reviewers' word. That describes what was done; the
reader should still check them.

---

## The question

**Should Option S publish a directional decomposition of its rate at all — or, as with D6a, should
the decomposition be removed in favour of per-probe distributions?**

Two independent lines both say it should not exist. If either holds, one of the four pre-run
blockers (B1, a swapped direction classifier) is **moot**, because the output it corrects would not
be published.

---

## Line 1 — the instrument may cite a ruling that was superseded the same day

1. **[SOURCE]** `operations/agent-circles-2026-08/option-s/option-s-runner.py:45` states:
   *"DIRECTIONAL DECOMPOSITION IS REQUIRED, NOT OPTIONAL"*, citing the 2026-08-30 rate-presentation
   ruling (the reasoning it quotes: a gate that occasionally blocks what it would usually permit
   produces friction; one that occasionally permits what it would usually block is a different
   matter).
2. **[SOURCE]** `operations/agent-circles-2026-08/2026-08-30-mentor-ruling-pooled-sweep-n100-verbatim.md`
   — **same date** — is titled *"publish n=100; the indeterminacy form; per-probe distributions
   replace the split"*, and its §Q3 answers *"What replaces the directional decomposition the Q2
   ruling required?"* with: **"The per-probe distributions replace it."** Its header line records
   that the ruling *"removes the directional decomposition from publication."*
3. **[RECORDED]** `/CLAUDE.md`'s 2026-09-03 block states the same outcome for the published D6a
   disclosure: *"no directional decomposition"*, per-probe distributions published instead.

So the instrument's stated requirement and the later ruling of the same day point opposite ways.
**Two blind PR19 reviewers reported this independently**; both premises above were then re-read at
their cited paths rather than accepted on their report.

**What we do not claim:** that the pooled-sweep ruling was *intended* to reach Option S. It was
given about the D6a sweep. Whether its reasoning governs a different instrument measuring a
different surface is precisely what we are asking, not assuming.

---

## Line 2 — the split may be arithmetically forced, as D6a's was

4. **[RECORDED]** In Option S's candidate set the 9 rejections are **all** `reflexive`, and 13 of 15
   winners are `principled` / `sage_like`. The strata were selected **on** the variable being
   re-measured.
5. **[RECORDED]** `direction` is a pure function of `floor_n*2` vs `n_v`. Combined with (4), the
   published split therefore tends toward the 15:9 role ratio **by construction**.
6. **[RECORDED]** This is the same class as D6a's round-5 finding — a directional split
   *"arithmetically forced by the probe composition, not a genuine finding"* — and **the ruled remedy
   there was to remove the decomposition.**

If (4)–(6) hold, the decomposition would report the candidate set's composition back as though it
were a measurement, which is the failure D6a's round 5 was ruled on.

---

## Why we have not decided this ourselves

The two lines converge on "remove it", and it would be easy to treat that convergence as settling the
matter. We have not, for three reasons.

- **Line 1 is an inference about a ruling's reach**, not a reading of its text. The pooled-sweep
  ruling does not mention Option S.
- **Line 2's remedy is a publication decision**, which the D6a arc established is yours, not the
  executing session's.
- The project has a standing caution against **manufacturing** a discrepancy question where readings
  converge. Here they converge on the *conclusion* but arrive by different routes, and one of them
  turns on whether a ruling transfers between instruments — which is a question only you can answer.

---

## What a ruling would settle

- **If the decomposition is removed:** B1 is moot; Option S publishes per-probe distributions; the
  runner's line 45 assertion is corrected before any spend.
- **If it is retained:** B1 must be fixed before the run, and Line 2 needs an answer on whether a
  composition-forced split is reportable when the composition is disclosed alongside it.
- **Either way:** whether the pooled-sweep ruling's reasoning transfers to instruments beyond D6a is
  worth stating, because Option S will not be the last one.

---

## What we have deliberately not done

Not run Option S. Not fixed B1. Not edited `option-s-runner.py:45`, though it is a one-line comment
and the correction looks obvious — the line records a ruling's requirement, and rewriting what a
ruling requires on our own reading is the thing to avoid.
