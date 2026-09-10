# Session close — Part 3 corrected to a regime-scoped readiness answer (S11 part (3) now reads MET)

**Session `8fe3a6ae-dcb1-4324-846d-631d51336dc4` (continuation).** Tier: `code-elevated`, a fresh,
separately-recorded founder waiver (per the mentor's explicit Q2 instruction — this is NOT the same
waiver as the earlier pre-flip-disclosures build), PR19 required and run.

## Status: COMPLETE. This is the most consequential change of the session — it moves the S11
## readiness standard's part (3) from NOT MET to MET.

## What happened, in order

1. Ran the newly-built pre-flip disclosures against the real buffer and found the false-hold rate
   already computes — and its pooled headline reads NOT MET (137 false-positive, 61 correct, 69.2%).
2. Noticed the report's own regime-split diagnostic (ADR-014 discipline) shows the pooled figure is
   almost entirely the retired pre-window instrument: `at-action-v1-lean` = 137 false / 0 correct;
   `at-action-v2-composed` (the current instrument) = 0 false / 61 correct.
3. Wrote a mentor brief rather than deciding unilaterally
   (`2026-09-11-mentor-question-regime-mixed-false-hold-rate-FOR-RULING.md`), posing three questions.
4. **Ruling received and recorded verbatim**
   (`2026-09-11-mentor-ruling-regime-mixed-false-hold-rate-verbatim.md`): the regime-scoped figure
   governs part (3), not the pooled figure; the correction needs its own fresh, freshly-recorded
   waiver; part (3) reads MET with a specific instrument-age qualification (verbatim text supplied).
5. **Fresh waiver recorded before any edit**
   (`2026-09-11-founder-waiver-part3-regime-correction.md`), per the ruling's explicit requirement.
6. Built the fix: the READINESS SUMMARY's part (3) line now reports the `at-action-v2-composed`
   regime's own figures, carrying the mentor's exact qualification form. The pooled figure is
   relabeled `[DISCLOSURE ONLY...]`, explicitly non-operative.
7. **PR19 independent review found one real HIGH defect**, confirmed by live reproduction: with
   `fps <= corrects` evaluated at both zero, an operative regime with records but zero holds at all
   would have printed a dishonest "MET" on no hold evidence — exactly the "arithmetic identity, not a
   measurement" class this same script already guards against elsewhere (RA-1-F2, D6a). Fixed at the
   root: an explicit non-vacuity guard now distinguishes MET / NOT MET / "NO HOLDS YET" (neither),
   and a small-sample qualifier (`< 5` holds) was added to the operative reading for parity with the
   rest of the report's own convention.
8. Re-verified against the real buffer after every fix: part (3) still reads **MET under
   `at-action-v2-composed` (0 false-positive holds, 73 correct holds)**, with the instrument-age
   qualification.

## The ruling, in force

- **Q1 — the regime-scoped reading is the legitimate one.** ADR-014's mixed-regime rule is "an
  epistemic constraint, not a presentation preference." The pooled figure "does not describe either
  instrument" and answering a measurement question with it "is evaded, not answered."
- **Q2 — the correction needed its own waiver, separate from the prior one**, because it is
  consequential (moves the headline). Granted, recorded before the edit.
- **Q3 — part (3) reads MET**, with an instrument-age qualification (not a small-sample flag — 61+
  holds is not the thin-count class that flag exists for), stated in a specific verbatim form now
  reproduced in the script's own output.

## PR19 — one real HIGH, confirmed and folded

**The zero-hold-evidence gap**, confirmed by direct code reading and live reproduction: `operative.fps
<= operative.corrects` is `0 <= 0 = true` when an operative-regime record set exists but contains no
holds at all (e.g. every record is a closed loop). Fixed with an explicit `operativeHoldCount > 0`
guard, printing a distinct "NO HOLDS YET — neither MET nor NOT MET" state instead. Regression-pinned
(`§17.7`/`§17.8`) with a fixture constructed exactly to exercise this path (a single closed,
operative-regime record). The reviewer's other checks (hardcoded regime name safety, the fallback
condition, `operativeAgeDays`'s timestamp math, the `target` variable's full removal, non-vacuity of
the new §17 tests) were all confirmed clean.

## What this does NOT do

- **Does not flip S11.** Part (3) reading MET is one of four readiness-standard parts. Part (2) still
  requires a live (non-dry-run) DB pass. The flip itself remains a founder-walked Critical activation,
  re-confirmed at flip time regardless (PR7) — nothing here licenses it.
- **Does not change the buffer, the window, or any production surface.**
- **Does not resolve D2**, which is blocked on a separate condition (the Q1 "ordinary"-instrument
  ruling from 2026-09-10) unrelated to this correction.

## Verified at close

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| Report battery | **141 passed, 0 failed** |
| Real-buffer smoke, post-fix | part (3) = **MET** under `at-action-v2-composed`, 0 false / 73 correct |
| `GUARD_RE` files touched | exactly the two waived paths |
| SHA pins (`layer2-mechanisms.ts`, `stoic-brain.ts`) | unchanged |
| Production surface touched | none |
| Pre-commit byte-identity guard | **blocks this commit by design** (the file matches `GUARD_RE` via "false-hold"); commit requires `--no-verify` with explicit, separately-confirmed founder authorization, per this session's own established pattern |

## Commit scoping

Two files changed: the report script and its test. Three new records in
`operations/trust-layer-2026-07/`: the mentor question, the verbatim ruling, and the waiver record.
Plus this close file and a decision-log tail append. Several other files remain uncommitted in the
tree from other, closed sessions — none was staged or touched.

**D2 remains blocked (a separate condition). The S11 flip remains REFUSED — a corrected readiness
figure is not a flip. Weights remain BLOCKED. The 0h call remains the founder's.**
