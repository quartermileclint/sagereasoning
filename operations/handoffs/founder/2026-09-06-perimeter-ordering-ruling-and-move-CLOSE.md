# Session close — perimeter-ordering ruling, the format-guard move, its PR19 fold, and a correction

**2026-09-06.** Tier: `governance` + `code-elevated`. Second close for this thread — the first,
`2026-09-06-post-sweep-carried-items-CLOSE.md`, covers §4A–§4D and the two mentor questions this arc
resolves. **Read this alongside that one, not instead of it.**

## What this arc did, in order

1. **Recorded and adopted the mentor's ruling** on where a length guard belongs relative to the R20a
   distress perimeter (`operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`).
   **Ruled:** purpose (b) — answering the distressed person — governs for human-facing perimeter
   members; the distress check runs before the length guard. Agent-facing members are governed by
   purpose (a) alone and must not be "fixed" on this basis.
2. **Authored the perimeter-wide audit** the ruling requires
   (`2026-09-07-r20a-perimeter-ordering-AUDIT-NEXT-SESSION-PROMPT.md`) — execution-order analysis,
   not textual position; classify by realistic caller, not by directory; do not resurrect the
   discarded 20/10/13 textual sweep.
3. **On instruction, moved (not reverted) the `format` guard** on `/api/score-conversation` to after
   the R20a block (`0126645`) — a plain revert would have satisfied the ruling while reopening the
   engine-leak defect the guard exists to close (the composer truncates each field while the route
   appended the full `format` to `domainContext` untruncated).
4. **Ran three PR19 reviewers in parallel.** Two delivered: **ruling fidelity** and **test
   adequacy**. Both independently found the same HIGH — the ordering pin anchored on the R20a
   block's *opening*, so a guard placed inside the block, before the distress check itself, passed
   the battery green. Fixed by anchoring on the block's structural end via brace-matching, plus six
   further folds (a false docstring claim, a false pin-description comment, an incomplete scope
   disclosure, an undisclosed residual, two softened overclaims). Committed as `97db750`.
5. **The founder pushed; confirmed independently** (not taken on report alone) that both commits are
   ancestors of `origin/main`, and that the live route responds as designed. `CLAUDE.md` annotated
   in place. Committed as `099b218`.
6. **A background task-notification, arriving after a large gap, exposed an overclaim**: the fold in
   step 4 said "three reviewers... converged." Only two delivered. The third's task record was
   confirmed gone from the harness (`No task found with ID`) — its finding, if any, is unrecoverable.
   Corrected in `CLAUDE.md` and a new decision-log entry (`0344f66`), stating plainly that the safety
   dimension specifically never received independent review; what stands in its place is first-hand
   verification only.
7. **A false alarm, caught before any action was taken on it.** Mid-correction, `git log` appeared
   to show `HEAD` reverted to the exact commit that was `HEAD` at the very start of this
   conversation, with the working tree matching that original snapshot. This read, briefly, as a
   destructive reset or force-push. **The reflog resolved it in under a minute**: no reset occurred.
   Roughly 23 hours of real time and 17 peer commits had passed on this shared checkout since this
   arc's last commit, and the branch had simply advanced forward to a point that, by coincidence,
   matched the conversation's static opening snapshot. `git merge-base --is-ancestor` confirmed every
   commit from this arc is a genuine ancestor of current `HEAD`. No destructive action was taken or
   needed. Recorded here because it was a real, if brief, misjudgement worth naming rather than
   quietly dropping.

## What downstream work has already done — confirmed, not characterised

The perimeter-wide audit this arc authored **has already run and completed**
(`D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-2026-09-05`, `d234fe6`: 16 non-conformant / 27 conformant
/ 2 not reached, three blind reviewers), and two remediation Groups have landed on top of it
(`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-1-BUILT-2026-09-05` / `c679739`;
`D-R20A-PERIMETER-ORDERING-REMEDIATION-GROUP-2-BUILT-2026-09-06` / `cbd93ae`). Between them they
appear to close the `conversation` minimum-length residual this arc named as the audit's priority
item — **confirmed by reading the current route directly**: the `<20`-character rejection no longer
precedes the R20a block, and the route's own battery is green (75/75) against the tree as it stands
now. This arc did not review the substance of those two Groups and does not characterise them beyond
what their own commit messages state.

**The Option S question this session's predecessor arc authored has also been ruled.** The mentor's
2026-09-05 rulings (`260f467`) include *"Option S decomposition removed"* — resolving the Q1/Q2
question put on 2026-09-06 without this session's involvement in the ruling itself.

## Production state at close

**Not byte-equivalent to session open, and has moved further still since this arc's own push** — a
great deal of independent, unreviewed-by-this-session downstream work has landed. This arc's own
contribution: the `format`-guard move on `/api/score-conversation` is live, confirmed pushed, and its
test pin (after the PR19 fold) is mutation-verified against the two bypasses that were demonstrated
against it.

## Honest notes

- **The reviewer-count overclaim is this arc's most serious error.** It went into a permanent record
  and was live in production for the better part of a day before being caught — not by review, but
  by a delayed background notification arriving on its own schedule. The lesson recorded in the
  correction: presence of results was assumed from their arrival in close succession, never counted
  against the number of reviews actually launched. A fold step should verify N-of-N before writing
  "N reviewers found," not merely fold whatever has arrived.
- **The false-alarm-about-a-reset was caught before any action, but the caution is real**: a stale,
  static conversation-opening snapshot can look exactly like live current state if trusted without a
  fresh check. The reflog, not the snapshot, is authoritative.
- **Every commit in this arc is path-scoped**; a peer session was visibly, continuously active on
  unrelated `website/src/app/api/*` route files throughout, including at the moment of this close,
  and none of it was touched.

## Owed

| # | Item | Owner |
|---|---|---|
| 1 | A fresh independent (not first-hand) safety review of the CURRENT `score-conversation/route.ts`, given it has been further modified by downstream remediation this arc did not review | next session touching that file, not urgent |
| 2 | Everything still owed from the first close (§3B/§3C sign-off, the `environmental_context` query, etc.) — unchanged by this arc | founder |

## Founder verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git merge-base --is-ancestor 97db750 origin/main && echo "the fold is live"
git merge-base --is-ancestor 0344f66 origin/main && echo "the correction is live" # once pushed
cd website && npx tsx src/app/api/score-conversation/__tests__/r20a-invocation.test.ts | tail -1  # 75/75
npx tsc --noEmit; echo "tsc exit: $?"
```

## Rollback

Each commit in this arc reverts independently. Reverting `0126645`/`97db750` together restores the
pre-ruling `format`-guard position (not recommended — that reopens the ruled harm). Reverting
`0344f66` only restores the overclaim in the record — no code effect.
