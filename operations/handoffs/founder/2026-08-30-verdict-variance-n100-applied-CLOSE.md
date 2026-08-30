# Close — the signed n=100 verdict-variance wording is applied

**Date:** 2026-08-30. **Tier:** `code-elevated`. **AC7 not engaged.**
**Decision:** `D-VERDICT-VARIANCE-N100-APPLIED`.
**Commits:** `2630ced` (envelope + ADR-013 §8 amendment + pins) → `cb8bd1c` (the six R18 places) →
`f8752c5` (records). **Nothing is deployed until you push.**

## Done

Seven places, four files, in the ruled order. Rate unchanged at 12%; interval **7.0–19.8%** on
**n=100 / 12 disagreements**; per-input crossings **0, 0, 2, 2, 8**; the force-push input published as
**indeterminate**; **no directional decomposition anywhere**; class limit at **K=20**.

- **S2-51 retired as a decision** (not left as a broken test); **S2-58/59/60/61 added**, all four
  mutation-verified — including a deliberate typographic-apostrophe mutation on S2-59, which reds it,
  exactly as PR19 P2 predicted.
- **S2-54 untouched.** The Q4a falsification record stands as ruled.
- Battery **149/0** · `tsc` 0 · `npm run build` 0, `/api-docs` registered · `agent-card.json` parses ·
  **extension count re-derived from the file: 25**, unchanged.
- All four files sweep clean of every superseded string. The one remaining `5.6–23.8%` is inside a
  maintainer comment recording the retirement — intended, and not a live claim.

**Every figure was re-derived from the raw probe records**, not from the wording. All agreed.

## What the review found — the reason this session was not mechanical

Three coverage defects in the signed wording, each folded and each disclosed in the decision log:

1. **A truncated sentence** in the envelope block — a fold had eaten the opening of *"This disclosure
   states the best available evidence…"*, leaving a subjectless fragment and an unopened bold marker.
2. **A section mislabel.** The ranges note assigns two stale items to **(b)**; both live in **(g)**.
   Following the label would have left the epistemic-status map stale at 10/10 and still pointing at
   "the single-input demonstration."
3. **A silently dropped live claim** — the sentence defining what makes the borderline class
   borderline sits inside the replacement range and is not restated. No ruling removes it and
   `primary_claim` still carries it, so it was **retained**. This is text added to a signed wording;
   it changes no figure, but it is your call to keep or cut.

## Honest limits

You signed on a summary. The PR19 fold was self-verified. **This review was also first-hand**, so it
shares the applying author's blind spots. Against this arc's record that fold rounds introduce
defects, an independent pass over `2630ced..cb8bd1c` is the stronger check and was not run.

## Yours

| # | Item |
|---|---|
| 1 | **Push**, then **live-verify by `curl`** — llms.txt (three places), agent-card (two extensions), api-docs |
| 2 | **Restore the quota:** `UPDATE api_keys SET daily_limit = 200 WHERE id = '4d96307f-2c19-4c82-a1fe-bd901c3bee4d';` |
| 3 | The **date correction** — 17 commits, 4 documents filed as 2026-08-31 |
| 4 | The **`p5-force` class-composition question** — still live, unreached by any ruling |
| 5 | Whether to keep coverage fold **3** above |

**Rollback:** `git revert cb8bd1c` then `2630ced`, in that order.

Weights-BLOCKED, Q1 and the §A boundary unchanged. **Nothing here bears on the 0h call.**
