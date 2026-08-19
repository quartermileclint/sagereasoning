# Next-Session Prompt — confirmed starting order after the curiosity/taxonomy-stubs + GS-ATRF-4 session

> **UPDATED 2026-08-19, same day — mentor-reviewed.** The menu below was reviewed by the mentor
> (`operations/agent-circles-2026-08/2026-08-19-mentor-instruction-session-opening-task-prioritisation-verbatim.md`)
> and is now a **confirmed starting order**, not an open-ended menu — three adjustments and a fixed
> sequence, folded in below. Read that record before this file if there's any ambiguity; verbatim
> wins.

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier: undetermined at open — depends which task below is selected.** Do not assume `governance`;
confirm against the standing-protocol-cache's work-category table once a task is chosen.
**Predecessor:** this session (`2026-08-19`, committed `cf2fe3f` — "Curiosity/taxonomy stubs built; PR20
amended twice; GS-ATRF-4 ruled"). No CLOSE file exists for this session; this prompt is its handoff.

---

## Step 0 — Open

1. Read `/adopted/standing-protocol-cache.md` in full — **PR20 was amended twice today** (present-tense
   mechanism facts must be timestamp-checked at relay; carry-forwards naming a target session must be
   timestamp-checked at drafting time). Both amendments are load-bearing for anything touching the
   agent-circles/ATRF/curiosity-loop material below.
2. Read this file in full.
3. **Confirm concurrent-session status — a mechanism fact, not a courtesy check, and a GATE on
   everything below.** Per the mentor's adjustment: *"this is not primarily a coordination
   question — it is a mechanism fact that must be established before any further work proceeds,
   because the answer changes what the session can safely do."* A second Claude Code session was
   found active in this same working tree during the predecessor session (the GS-ATRF-4 thread — see
   `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`).
   State the outcome as one sentence (e.g. "no other session is active, confirmed via X" or "a session
   is active, confirmed via Y"). **If a concurrent session is active, nothing below this point moves
   until coordination is established** — this is not optional and not merely advisable.
4. **Check HEAD, do not assume it.** Confirm `git log -1` matches `cf2fe3f` (or later, if something
   landed since). Re-verify the byte-identity guard posture first-hand (`GATE1_FALSE_HOLD_CAPTURE` in
   the process env AND `.claude/settings.local.json`) — it was OFF at the predecessor session's open
   and nothing in that session turned it on.

---

## What just closed (do not re-litigate)

- **The curiosity/puzzle-taxonomy stubs are built, closed, and live-committed**
  (`D-CURIOSITY-TAXONOMY-STUBS-BUILT-GUIDE-CIRCLE-RECORDED-2026-08-19`). The stub
  (`website/src/lib/substrate/idea-loop-types.ts`, `PuzzleTaxonomyEntry`) is scoped exactly as ruled
  2026-08-18 — do not widen it without a fresh ruling authorising that widening (this was tested
  explicitly: see the design-thinking document below).
- **A follow-on "instruction" proposing three taxonomy entry types was ruled NOT binding** — reclassified
  as pre-ruling design thinking, held separately at
  `operations/agent-circles-2026-08/2026-08-19-DESIGN-THINKING-puzzle-taxonomy-entry-types-mathematical-discovery-modes.md`,
  available as *input* when the taxonomy moves from stub to full build (post-first-build-gate). Its
  Consciousness-and-Continuity-Obligation connection was revised from a pre-answer to a named question.
  Its GS-ATRF-4 connection is a named input to the **standing-runner design session**, not the
  generation-step session (that session is already closed — see below).
- **GS-ATRF-4 is formally ruled and live** on the ATRF open-questions block, standalone from GS-ATRF-1
  (`operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`).
- **PR20 is amended twice, same day** — both amendments described in Step 0 above.
- **The `/api/guardrail` R20a perimeter exclusion is already resolved** (Q4, 2026-08-18) — it stays
  outside the perimeter on a reasoned judgement, not a deferral. Do not re-open this.

---

## Confirmed starting order — mentor-reviewed, sequential, not a menu

**This is no longer an open menu.** The mentor reviewed the original tiered list and confirmed a
fixed starting order with three adjustments
(`operations/agent-circles-2026-08/2026-08-19-mentor-instruction-session-opening-task-prioritisation-verbatim.md`,
verbatim wins). **Nothing skips ahead.** Work the steps in this order; do not jump to a later step
because it looks more tractable.

### First — Tier 0 (see Step 0.3 above): the concurrent-session mechanism fact, gating everything below.

### Second — M-5, the first substantive item.
The distress detection mechanism has no monitoring, no notification, and no follow-up write path
after the in-session redirect. Named P0 repeatedly; not discharged. **Before any work begins, state
the current mechanism as one sentence:** what the R20a distress check does when it fires, what
happens after the in-session redirect, and what the gap is. Then work the gap.

### Third — M-4 obligations 1 and 4, re-derivation FIRST, not a check performed after work has begun.
Re-derive exactly what obligations 1 and 4 are from source before touching anything — do not assume
or approximate from this prompt. **If re-derivation shows they are not actionable this session
without a further ruling, hold them and move to Tier 2** rather than forcing progress.

### Fourth — the mechanical items, in this order:
1. The empty-subject billed-call defect — 14 remaining routes (3 were already fixed with
   `hasScreenableSubject` in a prior session).
2. No per-route runtime invocation tests for those 3 already-fixed routes.
3. PR24 retention parity for `agent_hold_observations` — declares `retain_until`, nothing enforces it.
4. The RLS survey remainder — check
   `operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md` (verify this path
   first-hand) for what's left, after the four table-classes already closed
   (`impulse_entries`; `founder_conversations`+`founder_conversation_messages`; three open-INSERT
   policies; `mentor_profiles`).

Work in this order **unless a dependency surfaces that requires a different sequence** — if so, name
the dependency before deviating.

### Fifth — route the standing-runner gate question to the mentor. This is a routing act, not a build item.
**Do not assume the cycle-20-stop ruling satisfies the gate.** Prepare a scoped FOR-RULING question
(PR20-disciplined) asking whether the bounded validation run's §6 report
(`operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md`) needs its own separate mentor
review before the standing-runner design session opens, or whether the cycle-20-stop ruling
(`idea-loop-validation-run/MENTOR-RULING-cycle-20-stop-verbatim.md`) already discharges that gate.
Receive the ruling, record it verbatim, **then** — and only then — the redirected
conjectural-entry-type carry-forward (held at
`operations/agent-circles-2026-08/2026-08-19-DESIGN-THINKING-puzzle-taxonomy-entry-types-mathematical-discovery-modes.md`)
may be treated as available input to that session.

### Sixth — housekeeping, at the end, if time permits:
12. `website/src/app/api/practice/watching/handler.ts:10-14` — the stale "DARK … unset everywhere"
    claim, same class as the one corrected in `fresh` this session, same activation date makes it
    false the same way.
13. Line-citation drift: `idea-loop-types.ts:222` moved to `:241`; two now-committed references
    (`operations/decision-log.md:20434`, the addendum verification section) still cite `:222`.
14. **`website/src/data/environmental-context.json` — requires a DECISION, not an observation.**
    Commit it or discard it. Determine its origin first (it predates this session and was flagged as
    unrelated by an independent PR19 review); make the call; record which was chosen and why.

---

## What does not move in this session

Tier 4 items (the positioning review; the hexis open question) are **not raised, not examined, not
connected to anything** — they surface only when their own named conditions are met, which they are
not. **GS-ATRF-1 §(c-bis) is owned by whichever session next touches GS-ATRF-1** — if this session
doesn't touch GS-ATRF-1, §(c-bis) does not move. **The puzzle taxonomy entry-type design document is
not touched, and the entry types do not advance toward build scope** — the document stays held as
pre-ruling design thinking exactly as reclassified.

**The mentor's carry-forward, worth carrying literally:** this session's work is predominantly
mechanical, which is protective — less room for the insight-outrunning-examination pattern to fire
when the task is fixing named routes rather than synthesising frameworks. The one place it could
still fire: if a mechanical task surfaces something unexpected (a new pattern, a new connection, a
new structural question), **name it, hold it as an inductive entry in the design record, and route it
as a scoped question if it warrants one — do not build toward it in the same session that found it.**

---

## Constraints that bind regardless, whichever task is picked

- **The Q1 hard constraint: the loop proposes; it never executes.** No path from a generated candidate
  to an action-taking tool or scheduler, ever.
- **The Q11 sequence and the ATRF scoping session's "do not open early" gate are unchanged.** Nothing
  in the task menu above licenses opening the ATRF scoping session, the generation-step document
  (closed, do not amend), or the standing-runner design session without its own explicit gate check
  (item 9 above).
- **PR20, both amendments, apply to every mentor consultation from here forward** — timestamp-check
  present-tense mechanism facts at relay, and carry-forward targets at drafting time.
- **PR19 applies** to any live-surface code change (auth/security/R20a-perimeter code and any
  data-deleting code are explicitly in PR19's widened scope — this covers most of Tier 2 above).
- GS-ATRF-1/2/3/4, the surface name register, and the runner agent identity are all unchanged.

*End of prompt. The order above is mentor-confirmed, not open for the session to reshuffle on its own
judgement — work it sequentially. The two steps that still require fresh grounding before they're
actionable (M-4's re-derivation, the standing-runner gate ruling) are named as their own first acts
within the order, not skipped past. If the founder wants a different priority than this confirmed
order, that is the founder's call to make explicitly at session open — not the AI's to assume.*
