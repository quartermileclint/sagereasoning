# Next session — post-R1 arc continuation

**SUPERSEDED IN PART, same day as authoring (2026-08-16): R1 reached the mentor and was ACCEPTED
IN FULL before this prompt was ever used** (`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`).
**Step 1 below is therefore already answered — do not re-run it as an open question.** The rest of
this prompt (Step 2 onward) is updated to reflect that. Read this superseded-note before anything
else; it is the reason Step 1 now reads as resolved rather than as a live check.

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

The bounded validation run is **closed at 20 cycles** (mentor-ruled stop, not a technical limit).
**R1 — the §6 report — is compiled AND ruled on, accepted in full, same day it was written.** The
O-C per-consumer-rendering scoping session is now **OPEN**. One new fact the ruling introduced,
not previously stated anywhere in this arc: **the standing-runner design session (R8) now waits on
the O-C scoping session's own scope document being produced, not merely on R1** — see Step 2.

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

## Step 1 — Confirm current state (already resolved; a quick re-derivation, not an open question)

**R1 is closed.** The mentor accepted the §6 report in full (`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`).
Quickly re-confirm nothing has changed since (a two-minute check, not a re-litigation): read that
decision-log entry and the arc-plan's own R1/O-C/R8 entries (`2026-08-15-concurrent-arc-plan.md`)
to pick up any founder action taken between this prompt's authoring and this session's open.

## Step 2 — Route to the next work, per the arc plan's own structure

**Open now, no further gate:**

- **R2 — Agent build batch 1** (trust-core + harness, the guard bundle; `code-elevated`→
  `code-critical`, dark/additive). Eight items, one consolidated PR19 review — **remember the two
  model-setting pauses** (drop before launching the review, restore after).
- **R3 — Agent build batch 2** (`/api/reason` route work; dark/flag-gated). Three items, one
  consolidated PR19 review, same pause discipline.
- **R5 — the ATRF scoping session.** Both its gates (M5's doctrinal-blocker release, R1's ruling)
  are clear.
- **The O-C per-consumer-rendering scoping session.** Gate 1 (the §6 report compiled AND ruled on)
  discharged 2026-08-16. Produces a scope document for Gate 2/mentor ruling — does NOT license
  route activation at any stage.
- **R6** (the founder-walked migration batch) — confirm the priority-index citation that named it
  as blocked on the §6 report is now satisfied (should be, given R1's close; verify rather than
  assume).

**Still gated — do NOT open R8 yet:**

- **R8 — the standing-runner design session.** R1's own ruling introduced a NEW cross-gate not
  previously stated anywhere in this arc: R8 now waits on the **O-C scoping session's own scope
  document being produced** (its Gate 2), not merely on R1's clearance. Check whether that document
  exists before opening R8; if it doesn't yet, open the O-C scoping session first (above), or work
  on R2/R3/R5/R6 instead.
- **One named task, gating R8's CLOSE specifically, not its open, once R8 does open:** read the
  nine guardrail-rejected candidates from the bounded validation run (`operations/agent-circles-2026-08/
  2026-08-16-idea-loop-S6-report.md` §7 names this precisely — the run's own `idea_loop_candidates`
  table, `guardrail_proximity = 'reflexive'`), classify each remediation-shaped or not, report the
  distribution. This tests the guardrail-calibration hypothesis §7 explicitly left untested.

**Recommended default, if the founder has no preference:** the O-C scoping session or R2 — both are
pure builds/scoping with no founder-presence requirement mid-session beyond the PR19 pauses, and
opening O-C sooner is what actually unblocks R8.

## What NOT to do

- Do not open R4 (the founder-walked activation batch) until R2 AND R3 are both built, committed,
  and pushed — R4's own first step is "commit + push all R2/R3 builds FIRST; Vercel green."
- Do not open R7 (the permission-scrutiny build arc, items 14–17) or the guard-blocked edit bundle
  — both are explicitly named "all post-run" in the founder's own 2026-08-15 elections, and while
  the run is now closed, nothing in this prompt re-opens them; they wait for their own session.
- Do not open R8 before confirming the O-C scoping session's scope document actually exists — the
  new cross-gate is easy to miss since it wasn't stated anywhere before R1's own ruling introduced
  it, and this is exactly the kind of silent-drift this arc has repeatedly caught and corrected in
  itself (the C4 heading restoration, the standing-opener errata note, the h7 correction). Re-derive
  it from the arc plan's own R8 entry, don't assume from memory of this prompt.

## Rollback path

Nothing in this prompt itself is a live action. R2/R3's own builds carry their own rollback
(everything dark/flag-gated, unset-and-redeploy). Nothing here touches production directly.

## Forecast

Success = R1's status confirmed and, if needed, closed with a recorded mentor ruling; R2 and/or R3
built dark with a clean PR19 review each; R4 NOT opened until both are pushed and green; nothing
gated behind R1 opened before Step 1 confirms it's clear.

*End of prompt.*
