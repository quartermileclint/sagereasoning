# S4 close — window-start readiness (2026-09-06)

**Model:** `claude-opus-5` for the session, `claude-sonnet-5` for the adversarial review (dropped by
the founder mid-session, per instruction, and restored after). **Tier:** read-only autonomous half;
the founder act NOT taken. `git status` clean at open and close except this session's own four
files. Records: `D-S4-WINDOW-START-READINESS-BLOCKED-DATE-GATE-2026-09-06`.

## Outcome

**The window did not open. Both preconditions fail — one date-blocked, one unelected.**

| Leg | Result |
|---|---|
| (a) B4 follow-up | **NOT run — `date -u` was 2026-09-06T04:11:54Z, gate is ≥2026-09-08 UTC.** Confirmed by direct command. |
| (b) F-3′ threshold | **Proposed.** `2026-09-06-F3prime-guard-availability-threshold-PROPOSAL.md`. PR19-reviewed: 1 HIGH + 2 MEDIUM confirmed and fixed in place. |
| (c) engine-edit question | Confirmed at source, unchanged from the ruling: window first, D2's engine edit after. |
| (c′) S9 landed | Confirmed built AND firing (`redacted=` observed 8× live in `gate1.log`), not merely inherited. |
| (d) founder act | **Not performed — correctly.** P8a still absent; F-3′ unelected; B4 not due regardless. |

## The one substantive finding this session added

The guard-**deny** population — the only class that sets `guardHold: true`, hence the sole source
of part (3)'s "correct holds" denominator once P8a activates — is thin: **15 events across 57
calendar days**, 45 of 50 active guard days at zero, **≈0.6/week excluding one outlier day**, every
one `tool=Bash`/`proximity=reflexive`. Verified genuine (default fail mode is `open`, so outages
allow rather than block) and the log is a sound upper-bound proxy for the capture that would have
been written. **P8a's activation will move this denominator from structurally-absent to
present-but-thin, not to populated — and F-3′, however set, does nothing for it, because the
constraint is volume, not selection.** Offered to the founder as a scoping question (§6 of the
proposal), not decided here.

## PR19 in this session, honestly

The adversarial review found real defects in this session's own first-cut work: a partial-day 60%
outage figure wrongly paired with a full-day attempt count (HIGH), an overstated "lean mode is
closed" (MEDIUM), and an unsourced concurrency figure being used backwards from its own source
document (MEDIUM). All three are fixed in place, narrated rather than silently smoothed over, per
this project's append-and-annotate convention. This is the fifth recorded instance of this project's
own standing lesson that self-checking catches some errors but not all of them — this session caught
two smaller arithmetic slips itself (median, calendar span) before the review ran, and still needed
the review to catch the three that mattered more.

## Records touched

- `operations/decision-log.md` — one entry at the physical tail.
- `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` — P5, P6/F-3′, and B4 rows
  annotated (append, not rewritten); one Change-log entry added.
- `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — the S4 row of the
  Standing queue table updated from "NEXT" to "done; window not started."
- `operations/trust-layer-2026-07/2026-09-06-F3prime-guard-availability-threshold-PROPOSAL.md` — new,
  the leg (b) deliverable, PR19-fixed.
- This file.

**No CLAUDE.md production-state block is due** — the founder act did not run, so nothing about the
founder's live loop changed. **No code, schema, flag, or credential was touched.** `GATE1_FALSE_HOLD_CAPTURE`
remains unset; `GATE1_STATE_DIR` remains the durable path, unconfirmed as a live requirement since
the flag has never been set.

## What the founder can do next, in either order

1. **Elect F-3′'s threshold** (the proposal's §7) — the number is real work product now, not an open
   question with nothing to react to.
2. **Wait for ≥2026-09-08 UTC**, then a fresh session runs B4's actual follow-up measurement (not
   done here, and must not be estimated from this session's isolated counts).

Both must land before (d) can run. **S7 and S6 remain window-neutral and may run in the meantime.**
Next row after both preconditions clear: **S11-D2** (fully specified, build owed, sequenced after
the window opens).

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
