# Relay to the mentor — the pooled false-hold rate mixes two instrument regimes

**Sent Fri Sep 11 2026 (from `date`).** Session continuing `8fe3a6ae-dcb1-4324-846d-631d51336dc4`.
Read-only observation on data already computed; nothing built or changed to produce this finding —
it surfaced from running `false-hold-observation-report.ts --dry-run` against the current buffer
after a founder-waived build session added the pre-flip disclosures (Q-G6A-QUALIFICATION,
Q-PREFLIP-REPORTS) the S8/Q1 rulings required.

## What this is

The observation report has always computed a false-hold rate (Part 3) as its core output. Running it
today, for what appears to be the first time against the buffer's full current composition, surfaced
something the report's own machinery flags but does not act on.

## The finding, stated with the exact numbers

**Pooled (what the report's headline "READINESS SUMMARY" currently prints):**

```
at-action examinations: 461
holds: 198 (43.0% of examinations)
  false-positive holds: 137
  correct holds: 61
false-positive rate among holds: 69.2%
mentor's target (false ≤ correct): NOT MET (137 > 61)
```

**But the SAME run, one screen below, prints its own regime-split warning (a pre-existing feature,
per ADR-014's "never present mixed regimes as one distribution" rule) — and the split tells a
completely different story:**

```
⚠ MIXED EXTRACTION REGIMES — the tallies above span an instrument change and must NOT be
  read as one distribution (ADR-014). Per-regime split:
    regime at-action-v1-lean (pre-mark):   n=138  false_positive=137  correct=0
    regime at-action-v2-composed:          n=323  false_positive=0    correct=61
```

**Every single false positive (all 137) comes from `at-action-v1-lean` — the retired, pre-mark
instrument that predates the current composed extraction regime entirely, and whose 138 records
match the buffer's pre-window `v1` population exactly.** Under the current instrument alone — the
`at-action-v2-composed` regime, the only one the observation window has ever measured — the reading
is **0 false-positive holds against 61 correct holds: the mentor's target is MET, cleanly.**

The report computes the regime split, prints the ADR-014 warning correctly, and then **still uses
the pooled figure to answer the headline "(3) false ≤ correct holds" line in the READINESS
SUMMARY** — the same line the S11 four-part readiness standard's part (3) is checked against. Nobody
appears to have noticed this before, because this may be the first time the rate has actually been
run against live data rich enough for the split to diverge this sharply.

## Why this session did not just fix it

Two reasons. First, this is a reading/interpretation question, not (only) a code defect — whether the
regime-scoped figure is the legitimate one to use for readiness purposes, or whether some other
combination (e.g. the pooled figure with the pre-mark regime *disclosed* rather than *excluded*) is
what the standard actually requires, is a judgement this session should not make unilaterally.
Second, `false-hold-observation-report.ts` matches `GUARD_RE` and the observation window is armed —
any further edit needs its own recorded waiver, which this session has not asked for.

## Q1 — Is the regime-scoped reading the legitimate one for assessing readiness standard part (3)?

ADR-014 already rules that mixed regimes must never be presented as one distribution. On its face
this should mean the pooled 69.2%/NOT MET figure is not a legitimate answer to "is the false-hold
rate at target" at all — it is exactly the presentation ADR-014 forbids. If that reading is right,
the regime-scoped figure (0 false ≤ 61 correct, MET) is the one that should govern part (3), and the
pooled figure should never have been treated as authoritative to begin with. Is that reading correct,
or is there a reason the pooled figure remains the relevant one for this specific readiness question
even though ADR-014 forbids it as a general presentation rule?

## Q2 — Should the script be corrected, and does that need its own waiver?

If Q1's answer is that the regime-scoped figure governs, the READINESS SUMMARY's headline line
should say so directly rather than quoting the pooled figure and leaving the reader to notice the
warning underneath. Is fixing this licensed as a natural extension of the founder waiver already
granted for the pre-flip disclosures build (same file, same session, PR19 already run once today), or
does correcting the rate computation itself need its own separate, freshly-recorded waiver?

## Q3 — Given the corrected reading, does part (3) of the S11 four-part standard read MET, with any qualification?

Taking 0 false ≤ 61 correct at face value: is that a clean MET, or does a caveat belong beside it —
for instance, the `at-action-v2-composed` regime has only existed since roughly 2026-09-06 (per the
window's own start date), so 61 correct holds and zero false positives is a genuinely small, recent
sample compared to the ≥7-day representative-distribution bar part (1) already separately requires.
Should a small-sample caveat ride this reading the way it already rides elsewhere in the report (the
existing `[small sample]` qualifier at holds < 5), or is 61 holds enough that no such qualification is
needed?

---

**Nothing built, activated, or committed to produce this relay. The observation window is unchanged.
D2 remains blocked (the separate Q1 "ordinary" condition from the 2026-09-10 ruling). The S11 flip
remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
