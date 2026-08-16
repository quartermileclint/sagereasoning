# Next session — post-R1 arc continuation

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

The bounded validation run is **closed at 20 cycles** (mentor-ruled stop, not a technical limit).
R1 — the §6 report — is **compiled** but, as of this prompt's authoring, **has not yet reached the
mentor for ruling**. This session's first job is finding out whether that's changed, then routing
to the right next work based on the answer.

**Tier: mixed — classify per item as you reach it.** Nothing in this prompt's Step 0/1 needs more
than `governance`. R2/R3 (if you reach them) are `code-elevated`→`code-critical`, dark/additive, no
PR19-pause-worthy live op until R4. Full tier table is in the arc plan itself.

---

## Step 0 — Open under the standing cache, not the full protocol

Read: `/adopted/standing-protocol-cache.md` (~3 min) → this prompt in full → the arc plan
(`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`, the whole document — it's short
and every item below is a heading in it) → the last 3 decision-log entries
(`grep -n "^## 2026-08-1[67]" operations/decision-log.md | tail -6`, then read those entries) to
confirm nothing changed underneath this prompt between authoring and open.

**The IDEA-loop parallel-window fences are LIFTED — the run is over.** You do not need to run the
2026-08-10 parallel-window pre-flight before ordinary build work anymore. **But the underlying
infrastructure is still live in production and still deserves care by default, not by rote
process:** the three flags (`SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`,
`SUBSTRATE_LOOP_ID_FIELD_ENABLED`), the runner credential (`527cc86b-830b-4337-8fd7-ff28d9b0b5dc`),
and the four route contracts (`/api/reason`, `/api/guardrail`, `/api/practice/fresh`,
`/api/practice/watching`) are all still real, live, production surfaces — nothing in this arc names
a reason to touch any of them, so don't, but the reason now is "no task calls for it," not "a
fenced window forbids it."

## Step 1 — Confirm R1's status, read-only, before anything else

**Ask the founder directly: did you bring `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md`
to the mentor since this prompt was written, and if so, what came back?**

Three outcomes, in order of likelihood:

**(a) Not yet brought to the mentor.** This is very likely if this is the founder's very next
session. **Do this now, before anything else in this prompt**, the same way every mentor
consultation in this arc has worked: relay the report's content (it's a normal-length document, the
founder can paste it or summarize-and-link it, whichever the mentor interface prefers), bring the
response back into this session, and record it exactly as the last several rulings in this arc were
recorded (a verbatim file if the mentor gives you exact text, a lean `governance` decision-log entry
either way, citing `D-IDEA-LOOP-R1-S6-REPORT-COMPILED-2026-08-16` as the report's own record).
**Then continue to Step 2.**

**(b) Already brought and ruled on, no material changes.** Record the ruling (same pattern as (a)),
then continue to Step 2 — R5/R6/R8 and the O-C scoping session are now unblocked.

**(c) Already brought and the mentor asked for revisions or found an error in the report itself.**
Treat this like every self-correction this arc has handled (the h7 win-record correction is the
freshest precedent, same day): fix the report in place, re-verify whatever claim was wrong against
the live data (do not trust the mentor's correction blind either — cross-check it against
`idea_loop_cycles`/`idea_loop_candidates` yourself, service-role read, the same discipline the
report itself was built with), and bring the corrected version back before treating R1 as closed.

## Step 2 — Route to the next work, per the arc plan's own structure

**Unblocked regardless of R1's ruling status** (the arc plan's own text — R2 only names the M1 guard
ruling as its prerequisite, already satisfied, not R1):

- **R2 — Agent build batch 1** (trust-core + harness, the guard bundle; `code-elevated`→
  `code-critical`, dark/additive). Eight items, one consolidated PR19 review — **remember the two
  model-setting pauses** (drop before launching the review, restore after).
- **R3 — Agent build batch 2** (`/api/reason` route work; dark/flag-gated). Three items, one
  consolidated PR19 review, same pause discipline.

**Gated on R1's ruling clearing** (do not open these until Step 1 confirms it has):

- **R5 — the ATRF scoping session.**
- **The O-C per-consumer-rendering scoping session** (licensed 2026-08-16, `D-MENTOR-RULING-OC-
  SCOPING-LICENSE-RECORDED-2026-08-16`, but explicitly gated behind "the §6 report compiled AND
  ruled on in mentor consultation" — Gate 1 of its own three-gate chain).
- **R8 — the standing-runner design session** (Q10/Q11's own ruled gate).
- **R6** (the founder-walked migration batch) is gated on R1 having discharged the priority-index
  rule that names it as blocked on the §6 report specifically — check that citation once R1 is
  ruled, don't assume it's automatically clear.

**Recommended default, if the founder has no preference:** if R1 clears in Step 1, do R5 (ATRF
scoping) or R2 first — both are pure builds/scoping with no founder-presence requirement mid-session
beyond the PR19 pauses. If R1 has NOT cleared and the founder can't get to the mentor this session,
default to **R2**, since it needs nothing from R1 at all.

## What NOT to do

- Do not open R4 (the founder-walked activation batch) until R2 AND R3 are both built, committed,
  and pushed — R4's own first step is "commit + push all R2/R3 builds FIRST; Vercel green."
- Do not open R7 (the permission-scrutiny build arc, items 14–17) or the guard-blocked edit bundle
  — both are explicitly named "all post-run" in the founder's own 2026-08-15 elections, and while
  the run is now closed, nothing in this prompt re-opens them; they wait for their own session.
- Do not skip Step 1. Proceeding straight to R2/R3 without checking R1's status is fine on the
  merits (R2/R3 don't need it) — but skipping the CHECK means a later session might discover R1 sat
  unrelayed for a week, which is exactly the kind of silent-drift this arc has repeatedly caught and
  corrected in itself (the C4 heading restoration, the standing-opener errata note, the h7
  correction). Ask, even if the answer turns out to be "not yet."

## Rollback path

Nothing in this prompt itself is a live action. R2/R3's own builds carry their own rollback
(everything dark/flag-gated, unset-and-redeploy). Nothing here touches production directly.

## Forecast

Success = R1's status confirmed and, if needed, closed with a recorded mentor ruling; R2 and/or R3
built dark with a clean PR19 review each; R4 NOT opened until both are pushed and green; nothing
gated behind R1 opened before Step 1 confirms it's clear.

*End of prompt.*
