# Mentor question — the `caller_class` schema boundary: retroactive classification, or post-boundary only?

**Raised at session S7, 2026-09-07 AEST (= 2026-09-07 UTC), while executing ruling 3 of the
2026-09-07 rulings** (`2026-09-07-mentor-rulings-S6b-three-questions-verbatim.md`).
**Status: OPEN. Not decided in-session, deliberately.**

**This document argues both answers at full strength and chooses neither.** It exists because ruling 3
settled *what* to exclude but not *what to do about the records already captured*.

---

## 1. The question

Ruling 3 excludes review-fleet subagent records from the guard population, and specifies the
mechanism: *"if the session ID alone is insufficient, a `caller_class` field on the record is the
right addition — added before publication, not after."* Session ID **is** insufficient (established
at S6b, and independently reconfirmed here under controlled conditions — §3).

Adding `caller_class` therefore creates a **schema boundary**: `false-hold-record-v4` → `v5`. Records
captured before that boundary carry no such field.

> **Is a retroactive `actionPreview`-based classification acceptable for the pre-boundary records, or
> does the guard rate report only over post-boundary records?**

The AE-1/S11b segmentation precedent is the obvious model — a dated boundary, distinguishable fields,
two regimes reported separately — and the report already implements exactly that machinery for the
extraction-regime boundary. Whether it transfers here is the question.

---

## 2. Why this is not merely bookkeeping

The pre-boundary pool is **not static, and the project's own process requirements are enlarging it.**

PR19 requires independent review. Independent review is run by a subagent fleet. That fleet fires the
same hooks and writes records under the parent session id. So **every PR19 review conducted before
`caller_class` lands adds to the very pool whose classifiability is in question** — including the
review of the change that introduces `caller_class`.

This session is an instance of it: the fleet reviewing ruling 3's design contributed 11 records to the
window while that review ran.

---

## 3. New evidence — a controlled experiment, first-hand

Previous sessions inferred subagent provenance by hand from `actionPreview`. S6b identified 10 of 48
that way. **That was possible because that fleet's commands happened to be distinctive**
(`cd /tmp && cat > test_e.sh …`), not because a method existed.

This session had **ground truth**: the parent session knew exactly which of its own records were its
own tool calls and which were its review fleet's.

**Finding 1 — session ID is confirmed insufficient, under controlled conditions.**
All 11 fleet records carried the **parent** session id. Of 15 records under that session id, **11 were
the fleet's and 4 were the live agent's** — 73% of the session's recorded "actions" were not the live
agent acting at all.

**Finding 2 — the `actionPreview` heuristic was validated against ground truth, and it fails.**
Every heuristic that suggests itself was scored against the known labels:

| heuristic | catches (of 11 subagent) | misflags (of 4 parent) |
|---|---|---|
| mentions `/tmp` | 9 | 2 |
| has an output redirect | 8 | 1 |
| runs a test battery | 5 | 0 |
| cites a repo source path | 5 | 0 |

**No tested heuristic is both complete and clean.** The most sensitive one still misses subagent
records *and* misflags live-agent ones. The precise ones catch under half.

The reason is visible in the records themselves: the fleet's commands read as **ordinary repo work** —
`node harness/…/negative-battery.mjs > /tmp/x`, `cd website && npx tsx …test.ts`, python heredocs
reading the buffer. There is nothing categorically "review-shaped" about them. A live agent doing the
same verification produces the same text.

**Finding 3 — a positional rule failed within minutes, on its author.**
This session formed the rule "records from #224 onward are the fleet's", which was true when formed
and false as soon as the parent ran another command. It mislabelled a record. This is recorded rather
than quietly corrected because it is evidence about the fragility of after-the-fact classification:
even with full knowledge of its own session, the classifier drifted inside one sitting.

**Finding 4 — the guard population systematically over-samples review traffic.**
The guard record fires on irreversible actions, and an output redirect (`> file`) is on that
allowlist. A review fleet that redirects each check's output to a file therefore generates a record
for **every check it runs**, while the live agent's read-only verification generates none. Review
traffic is not merely present in the guard population — it is **structurally over-represented**
relative to how much of the actual work it constitutes.

---

## 4. The argument for RETROACTIVE CLASSIFICATION

**(a) The AE-1/S11b precedent transfers on its own stated terms.** The D2 window-sequencing ruling
established that read-side segmentation transfers to a write-side change *"under one condition: the
boundary is dated, recorded, and the fields that change are distinguishable in the recorded data."*
The boundary here is dated and recorded. If the pre-boundary records can be classified at all, the
condition is met and two segments may be reported separately.

**(b) Discarding the pre-boundary records discards most of the window.** The overwhelming majority of
guard records captured so far are pre-boundary. Reporting only over post-boundary records restarts the
guard-side denominator from near zero, in a population already described as thin (~0.6 events/week on
the deny path). The disclosure ruling 3 is meant to improve would be built on almost nothing.

**(c) Exclusion is the conservative direction.** A retroactive classification that is *imperfect but
biased toward exclusion* removes contamination without inventing data. Flagging a record as
review-fleet when it is uncertain shrinks the population; it does not manufacture an examination that
never happened. On a measurement whose purpose is to avoid over-claiming, erring toward exclusion is
the safe error.

**(d) The alternative is not clean either.** Reporting only over post-boundary records does not make
the pre-boundary records disappear — it makes them *unreported*, which is its own form of silence
about data the instrument holds.

---

## 5. The argument for POST-BOUNDARY ONLY

**(a) §3's evidence is directly against the heuristic's reliability.** The precedent's condition is
that the changed field be *"distinguishable in the recorded data"* — and the measurement above shows
it is **not**. For the extraction-regime boundary the distinguishing fields (`circles`,
`virtue_domains_engaged`, the `is_kathekon` trigger) are *present in every record* and the boundary
*"does not need to be inferred. It is legible in the data."* Here the field is absent by construction
and the boundary must be inferred from free text. **The precedent's condition is not met, so the
precedent does not transfer.** This is the strongest argument on either side.

**(b) A classified-by-guess record presented as a measurement is the exact defect this project
forbids.** The distinction the ruling draws is causal — *"the live agent was the actor at the moment
the hook fired"*. `actionPreview` records what was run, never who ran it. A retroactive label
substitutes a proxy for the causal fact and then reports the result as a rate.

**(c) Ruling 3's own words point this way.** *"Added before publication, not after."* The natural
reading is that the field exists so that the published population is constituted correctly from the
field — not so that the field's absence is patched by inference.

**(d) The bias direction is not actually controlled.** §4(c) assumes the heuristic can be tuned toward
exclusion. The validation shows the sensitive heuristic **misflags live-agent records** (2 of 4) —
which excludes genuine live-agent actions from the population. That is not conservative; it removes
exactly the observations the measurement exists to capture, and it does so invisibly.

**(e) The denominator loss is real but bounded and self-correcting.** The window continues to run. A
post-boundary-only guard rate starts small and grows honestly. A retroactively-classified rate starts
larger and is wrong in an unknown direction, permanently.

---

## 6. A middle position, named but not advocated

Report **both segments separately and label them for what they are**: a post-boundary segment whose
`caller_class` is recorded at capture, and a pre-boundary segment reported with **no** caller
classification at all — its size stated, its composition explicitly declared unknown, and no rate
computed over it. This publishes the pre-boundary data without either discarding it or claiming a
classification for it.

Whether that is honest reporting or an evasion that lets a reader draw the inference anyway is
precisely the kind of judgement this document does not make.

---

## 7. What is NOT in question

- **The consult population is unaffected.** Verified at source this session: a consult outage
  `process.exit(0)`s before the capture call, and no subagent has produced a consult record. The gated
  within-consult measure — part (3)'s actual denominator — carries none of this.
- **Ruling 3 itself is settled.** Review-fleet records are excluded. Only the treatment of the
  already-captured records is open.
- **Nothing here bears on the S11 flip, the weights, or the 0h call.**

---

## 8. What the answer decides

1. Whether the guard disclosure reports one segment or two.
2. Whether the ~90 pre-boundary records enter any published guard figure.
3. Whether a retroactive classification pass is owed as work at all.
4. Whether PR19 review fleets must be run differently before the boundary lands (the pool is being
   enlarged by the project's own process — §2).
