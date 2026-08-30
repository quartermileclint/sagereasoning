# Verdict-variance wording — per-probe leads, aggregate follows, composition dependence and the stability finding published

**STATUS: DRAFT FOR THE FOUNDER'S SIGNATURE. NOT APPLIED. Authoring this licensed nothing.**
Authored 2026-08-30, executing the p5-force class-composition ruling of the same day.

**Binding source (wins over this draft):**
`2026-08-30-mentor-ruling-p5-force-class-composition-verbatim.md`.
**Still governing, unchanged:** the pooled-sweep n=100 ruling and the rate-presentation, disclosure
and rate-location rulings. **Nothing in this draft changes a single figure.**

> **Two things you should weigh before signing.**
> 1. **The currently-live text is not false.** The mentor is explicit: *"The aggregate figure is not
>    removed — it is accurately described and placed after the per-probe distributions."* This is a
>    restructuring for calibration plus two additions, not a correction of error. There is no
>    falsity-urgency forcing speed.
> 2. **An independent PR19 pass is mid-flight against the tree this would supersede.** Its findings
>    remain valid for what it reviewed and **must be folded before or in the same edit as this**.
>    Applying this on top of an unread review would repeat the pattern that produced every blocking
>    defect in this arc.

---

## What changes, and what does not

| | now live | proposed |
|---|---|---|
| order | aggregate first, per-probe second | **per-probe first, aggregate second, class limit third** |
| aggregate | headline figure | **retained verbatim, described as the pooled rate across this probe set** |
| composition dependence | not stated (inferable) | **stated explicitly, beside the class limit** (Q4) |
| the two 0/20 probes | two zeroes in a list | **stated as a finding in its own right** (Q5) |
| every figure | 12%, 7.0–19.8%, n=100, 12, 0/0/2/2/8, 7-of-10 & 5-of-5, 20/20 | **all unchanged** |
| the indeterminacy passage | as ruled | **unchanged** |
| the falsification record, S2-54 | as ruled | **unchanged, not edited** |
| path specificity | stated at all seven places | **unchanged** |

**Q2 and Q3 change no published text.** Q2 governs the design of any future sweep (selection basis
frozen in advance, never chosen by observed variance); Q3 fixes the status of this record (a future
different-set sweep is published **beside** it, not over it). Both are recorded in the ADR amendment,
not on the public surfaces.

## The two new sentences — the mentor's own stated forms, to be used verbatim

**Composition dependence (Q4), placed in the same location as the class limit:**

> the aggregate rate reflects this probe set's composition; a set with more or fewer
> force-push-shaped probes would produce a materially different aggregate with no change in gate
> behaviour.

**The stability finding (Q5), placed with the per-probe distributions:**

> two of the five borderline probes showed no boundary crossings across twenty examinations each,
> indistinguishable from the clean anchor; the class definition admits actions the gate handles with
> complete stability at this sample size.

**Neither is paraphrased in any surface.** Register may adapt capitalisation and surrounding
connective text; the claims and their scope may not.

---

## (a) `TRUST_RECORD_ENVELOPE` — a reorder plus two insertions, quoted against the LIVE text

The live measurement passage runs as twenty sentences. **Only the order of two blocks changes, and
two sentences are added. No sentence is deleted and none is reworded.**

**Move** the block beginning `Measured on the guardrail gate on 2026-08-30,` and ending
`returned the same aggregate rate to the digit.` (currently sentences 2–3) to sit **after** the
per-input block ending `crossed the boundary 8 times in 20.` (currently sentence 5), and rewrite its
opening clause only, from `aggregate disagreement rate 12%` to **`the pooled rate across this probe
set is 12%`** — the mentor's *"accurately described as the pooled rate across this probe set."*

**Retain in place, before the moved block:** sentence 0 (`Variance appears across the verdict
scale…`), sentence 1 (`What distinguishes the borderline input class…`), and sentence 4 (`The
aggregate is not evenly spread…`) — sentence 4's clause *"the per-input distributions are published
rather than a directional summary"* now also states the order and should read **`are published
first, rather than a directional summary`**.

**Insert the Q5 finding** immediately after sentence 5 (`Of twenty examinations each: …8 times in
20.`), before `On that force-push input…`.

**Insert the Q4 composition sentence** immediately after sentence 10, the class-limit sentence ending
`across twenty examinations each.`, before `The clean anchor moved once in twenty…`.

**Untouched:** sentences 6–9 (the whole indeterminacy passage), 11–12 (the anchor and the
falsification — **S2-54's phrase must survive byte-identical**), 13–19 (path, basis, deploy proxy,
revision note), and the retained closing `Read any single verdict as one draw…`.

## (b) `llms.txt` trust-record does-not-attest bullet · (f) guardrail section · (g) epistemic map

Same three changes in each register: **per-probe before aggregate**; the aggregate described as the
pooled rate **across this probe set**; the Q4 sentence beside each place's class-limit clause; the Q5
finding beside each place's per-probe list. **Apply by quoted first/last words against the live file
and diff each afterwards.** Each place must **retain**: its indeterminacy passage, its
falsification sentence where it has one, its `/api/reason` statement, and its revision note. **(f)
has no falsification sentence of its own beyond the anchor clause added at the last application —
retain that clause.**

## (c) `agent-card.json` — `verdict-variance/v1`

- `description`: reordered to match (b), plus both new sentences. **No figure changes.**
- `params.rate`: **unchanged**, except add
  `"framing": "the pooled rate across this probe set; see per_input_distribution, which leads the disclosure"`.
- `params.per_input_distribution`: add
  `"stability_finding": "<Q5 form verbatim>"`.
- `params.class_limit`: **append the Q4 form verbatim** to the existing string.
- `params.basis`: add
  `"record_status": "This figure is the record of this instrument with this probe set. A future sweep with a different probe set is a different measurement, published beside this record rather than over it."` (Q3)
- **Nothing is removed.**

## (d) api-docs · (e) `agent-card.json` `guardrail-signed-sandwich/v1`

Same reorder and the same two sentences, in each register. (e) keeps its
`See the verdict-variance/v1 extension.` tail.

---

## Battery pins

- **S2-62** — `env.includes("reflects this probe set's composition")` — the Q4 disclosure. ASCII
  apostrophe.
- **S2-63** — `env.includes('handles with complete stability')` — the Q5 finding.
- **S2-64 — an ORDERING pin, which no existing pin can express:**
  `env.indexOf('0 of 20') < env.indexOf('pooled rate across this probe set')` — the Q1 restructuring
  is an ordering claim, and a substring pin cannot catch a re-inversion. This is the pin most likely
  to be got wrong; **mutation-verify it in both directions.**
- **S2-58/59/60/61 unchanged. S2-54 NOT retired and NOT edited.** No pin is retired by this change,
  because no figure is superseded.

All new pins mutation-verified before commit.

## ADR-013 §8

A further dated amendment recording all five answers, including **Q2 and Q3, which change no public
text** and would otherwise exist only in the verbatim: the freeze governs the record and not forward
design; a future probe set must have its selection basis frozen in advance and may never be chosen by
observed variance; and this record is not superseded by a differently-composed future sweep.

---

## Ordering

1. **Fold the independent review's findings first**, or in the same edit.
2. Envelope + ADR amendment + pins, **one commit**.
3. Then the six R18 places.
4. Re-derive the extension count from the file.
5. **Live-verify by `curl`, and verify the ORDER, not only the presence** — the last application
   passed a presence sweep and still shipped a gap that only a live read caught.

*Nothing here is applied. Signature required before any public surface changes.*
