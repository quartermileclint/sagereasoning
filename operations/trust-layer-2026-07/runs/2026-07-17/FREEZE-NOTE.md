# Freeze note — the 2026-07-17 false-hold buffer snapshot

**Written 2026-09-05**, at binding mentor direction: *"The freeze directory should carry a note
documenting the cut. That is a documents-only act and is owed."*
(`../../2026-09-05-mentor-ruling-P6-window-recommendation-verbatim.md`.)

## What this directory holds

`false-hold-record-FROZEN-2026-07-17.jsonl` — **130 records**, all `false-hold-record-v1`. This is the
file every published figure over "the frozen 130" is computed from: the 2026-07-19 self-circle
re-classification, the 2026-08-17 acceptance gate, and the 2026-09-04 P1 filtered-reading re-run all
read it, and the last of those uses its `129 do-not-proceed` reproduction as a non-vacuity check.

## The cut, stated plainly

**The frozen file is a prefix of the live buffer, not the whole of it.**

- Live buffer `~/.sage-gate1/false-hold-record.jsonl`: **138 records**, all `v1`, unmodified since
  2026-07-17 23:58.
- Frozen file: **130 records**, and byte-for-byte an **exact prefix** of the live one (verified
  2026-09-05: `live[:130] == frozen`, and every frozen line is present in live).
- The **8 records present only in the live buffer** were captured on **2026-07-17 from 12:15:21Z
  onward** — after the snapshot was taken, and before `GATE1_FALSE_HOLD_CAPTURE` was unset that
  evening. All 8 are the same class as the rest: tool `Edit`, `loopEvent: reopened`.

The snapshot was taken mid-day and capture continued for the rest of that day. Nothing was removed
from it and nothing was altered; it simply stops earlier than the capture did.

## Why this was not known until 2026-09-05

No note recorded the cut when the freeze was taken, and the difference is invisible from the frozen
file alone. It was found by comparing the two files directly while grounding an unrelated question
(`../../2026-09-05-P6-window-recommendation-SCOPE-FOR-RULING.md` §9), not by any scheduled check.

## What follows from it — and what does not

**It changes no conclusion drawn from this buffer.** The mentor, accepting the finding: the buffer is
not reusable for readiness part (3) regardless; P4 and P5 fail for unrelated reasons; and the 8 extra
records are the same tool class as the other 130, so they repair none of the representativeness defect
that part (1) failed on. Adding them would move the composition from "one action class, one depth, one
proximity" to exactly the same thing, eight records longer.

**It does change how the figures should be described.** They are figures over a *prefix* of the first
observation window's capture, not over the window's whole capture. Any future restatement should say so.

## Why the file is not re-taken

Ruled, not chosen: *"The freeze file is not touched — the discrepancy is documented, not corrected by
re-taking the freeze."* Two independent reasons stand behind that. Re-taking would silently invalidate
the reproduction check in `website/scripts/p1-frozen-buffer-reclassification.ts`, which is calibrated
against the 130 and aborts if it stops reproducing — the one thing making its other columns believable.
And a frozen evidence file that gets amended after the fact is worth less as evidence than one that is
accurately described.

**Do not modify `false-hold-record-FROZEN-2026-07-17.jsonl`.** Its recorded input md5 is
`a4e2465f3897fddeea1a189c95af39a5` (recorded 2026-09-04 so a later session can prove the buffer did
not move).

## Standing status, unchanged by any of this

The first observation window remains unusable for part (3). **P4, P5 and P6 are open; the S11 flip
remains REFUSED.** The new window (P6) has not started.
