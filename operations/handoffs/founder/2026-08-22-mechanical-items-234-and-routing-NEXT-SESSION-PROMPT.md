# Next-Session Prompt — mechanical items 2/3/4, then the standing-runner routing question

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier: undetermined at open.** Item 2 (test-writing) is likely `code-standard`; item 3 (PR24 retention
parity) is `schema`+`code-elevated` at minimum, possibly `code-critical` if it needs a live cron/flag
activation; item 4 (RLS survey) could be anything from `governance` (if the survey shows nothing left)
to `code-critical` (if a table needs the same lockdown pattern as `impulse_entries`/`founder_conversations`
/`mentor_profiles`). Confirm against the standing-protocol-cache's work-category table once you know
what each item actually requires.

**Predecessor:** `2026-08-22-m5-m4-mechanical-item1-CLOSE.md` (commits `8b04e53`, `d6f5073`, `bbd89d1`,
all pushed, Vercel green). **Do not assume that close's HEAD — re-verify with `git log -1` before doing
anything.**

---

## Step 0 — Open

1. Read `/adopted/standing-protocol-cache.md` in full.
2. Read this file in full.
3. **Confirm concurrent-session status.** The predecessor session found and coordinated with a second
   Claude Code session active in this same working tree partway through. Check `ListAgents` (or
   equivalent) before doing anything with file-edit intent. If another session is active, coordinate
   before proceeding — do not assume you're alone just because the predecessor close doesn't mention one
   still running.
4. **Check HEAD, do not assume it.** Confirm `git log -1` matches `bbd89d1` (or later, if something
   landed since). Re-verify the byte-identity guard posture first-hand (`GATE1_FALSE_HOLD_CAPTURE` in
   the process env AND `.claude/settings.local.json`) — it has been OFF/absent across every session in
   this stream so far; confirm it still is, don't infer it from that history.
5. **Re-derive every count named in this prompt from source before acting on it.** The predecessor
   session found two separate carried counts in this exact task list were stale (both undercounted, by
   roughly a third to a half): "14 remaining routes" (real count: 22) and "no per-route runtime
   invocation tests for those 3 already-fixed routes" (real scope once re-derived: 15 files, not 3).
   **Treat every number in this document the same way — as a starting hypothesis to verify with a
   direct grep/read, not a fact to build from.**

---

## What just closed (do not re-litigate)

- **M-5(b)** (the `vulnerability_flag` write path for genuine R20a detections) is built, twice
  PR19-reviewed, committed (`8b04e53`), and live in production — but functionally **inert**: no caller
  passes a real `userId` yet, so no row is ever actually written, and the dedup mechanism does nothing
  for its own motivating scenario (the five routes it targets pass no `sessionId` either). The
  real-time Slack/Discord alert path IS live-reachable today, gated only on whether `ALERT_WEBHOOK_URL`
  is configured — **not verified last session whether it is; worth checking if this becomes relevant.**
  Identity-threading (both `userId`, for writes generally, and `sessionId`, narrower, for dedup at the
  five specific routes) is a named, unscoped follow-up — do not build it without a fresh scoping pass.
- **M-4 obligations 1 and 4** are built, PR19-reviewed, committed (`d6f5073`), and live: the top rung
  (`principled → sage_like`) is now structurally unreachable for every agent, and the public disclosure
  says so on all three R18 surfaces. This is a **ruled, intended, permanent state** — do not "fix" it by
  loosening `elevated_dimension_count`, and do not treat the unreachable top rung as a bug report if it
  surfaces again.
- **Mechanical item 1** (the empty-subject billed-call defect) is closed across all 22 affected routes,
  PR19-clean (zero findings), committed (`bbd89d1`), and live. Nothing further to do here.
- **M-4's own `KEEP IN SYNC` banner drift** (the repo-root `/trust-layer/grade-engine/` mirror, not
  imported by live code, already diverging from the website copy) is untouched — a standing, named,
  separate follow-up, not part of this prompt's scope.

---

## Confirmed order — pick up at mechanical item 2

### Item 2 — per-route runtime invocation tests (re-scoped last session)

**15 files**, not the originally-carried "3 already-fixed routes." Full list, taken from the
predecessor's own direct grep (re-verify it hasn't changed):
`mentor/passion-classify`, `mentor/oikeiosis/extension`, `mentor/private/founder-facts`,
`mentor/private/journal-week`, `mentor/private/baseline`, `mentor/private/baseline-response`,
`mentor/gap4`, `mentor-baseline`, `mentor-baseline-response`, `mentor-journal-week`, `compose`,
`evaluate`, `execute`, `skill/sage-classify`, `skill/sage-prioritise`.

Each currently has NO dedicated `__tests__/` file exercising the route's actual R20a invocation (the
guard battery, `r20a-invocation-guard.test.ts`, only asserts on the route's *source text* — it cannot
catch a check made unreachable by control flow). The 7 files that DO have a dedicated
`human-practitioner-boundary.test.ts` (`hupexairesis`, `oikeiosis`, `premeditatio`, `sage-compass`,
`view-from-above`, `morning`, `passion-log`) are the pattern to follow — read one of those first as the
template before writing new ones. Given 15 files, consider whether a shared/parameterised test harness
is warranted rather than 15 independent copy-pasted files — that's a judgement call for this session,
not decided here.

### Item 3 — PR24 retention parity for `agent_hold_observations`

Declares `retain_until`; nothing enforces it. Check the existing sweep pattern this codebase already
uses for the same problem (`route_errors`/`throttle_events`, closed under
`D-C1-OBSERVABILITY-RETENTION-SWEEP-ACTIVATION-LIVE-2026-08-12` — read that decision-log entry as the
precedent to follow, including its "found a real defect at first activation smoke" lesson: the fake
test client's `select(_cols)` in that precedent ignored its column argument, letting a hardcoded wrong
column name pass tests silently — check whether the same test-double weakness exists here before
trusting a green battery). PR24 itself requires the purge/sweep to ship in the SAME session as any new
`retain_until`-declaring change — but this table already declares it and predates PR24, so this is a
retrofit, not a fresh violation.

### Item 4 — the RLS survey remainder

Check `operations/primal-substrate-2026-08/2026-08-16-rls-route-enforcement-survey.md` — **verify this
path exists and re-read its actual current content first-hand; do not trust any summary of it in
CLAUDE.md or this prompt.** The survey found four table-classes to close, all now done
(`impulse_entries`; `founder_conversations`+`founder_conversation_messages`; three open-INSERT policies;
`mentor_profiles`). Determine what — if anything — remains in the survey's own list. A named,
standing lesson from that work: **a table-level RLS/grant fix is invisible to a `SECURITY DEFINER`
function writing the same table** — grep `SECURITY DEFINER` across `supabase/migrations/` and
`operations/migrations/` against every remaining table before calling any of it closed.

**Work these three items in order unless a real dependency surfaces** — if item 3 or item 4 turns out to
need a decision item 2 doesn't, or vice versa, name the dependency explicitly before reordering.

### Item 5 — route the standing-runner gate question to the mentor

**Not yet done in any session in this stream.** This is a routing act, not a build item: prepare a
scoped FOR-RULING question (PR20-disciplined — name the specific mechanism facts the ruling will land
on, timestamp-checked at drafting time per PR20's own amendment) asking whether the bounded validation
run's §6 report (`operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md`) needs its own
separate mentor review before the standing-runner design session opens, or whether the cycle-20-stop
ruling (`idea-loop-validation-run/MENTOR-RULING-cycle-20-stop-verbatim.md`) already discharges that
gate. **Do not assume the cycle-20-stop ruling satisfies the gate** — that assumption is exactly what
this routing step exists to test. Receive the ruling, record it verbatim, only then treat the
redirected conjectural-entry-type carry-forward (held at
`operations/agent-circles-2026-08/2026-08-19-DESIGN-THINKING-puzzle-taxonomy-entry-types-mathematical-
discovery-modes.md`) as available input to whatever session it unblocks.

### Item 6 — housekeeping, at the end, if time permits

1. `website/src/app/api/practice/watching/handler.ts:10-14` — the stale "DARK … unset everywhere" claim
   (same class as the one corrected in `fresh` two sessions ago; same activation date makes it false the
   same way — re-verify the line number, it may have moved).
2. Line-citation drift: `idea-loop-types.ts` — check whether the `:222`→`:241` drift named in a prior
   session's close has been corrected everywhere, or whether committed references still cite the stale
   line.
3. **`website/src/data/environmental-context.json` — still requires a DECISION, not an observation.**
   Now carried across at least four sessions. Commit it or discard it. Its origin (predates every
   session in this stream; flagged as unrelated by an independent PR19 review) is already established —
   the only remaining step is the founder's call and recording which was chosen and why.

---

## What does not move in this session

- **GS-ATRF-1 §(c-bis)** — owned by whichever session next touches GS-ATRF-1; not this one unless this
  session independently ends up there.
- **The puzzle-taxonomy entry-type design document** — stays held as pre-ruling design thinking; does
  not advance toward build scope regardless of what item 5's ruling says about the standing-runner gate
  (the ruling only decides whether the redirected carry-forward becomes *available input*, not whether
  it gets built).
- **M-5(b)'s identity-threading follow-up** (both the `userId` and the narrower `sessionId` threading) —
  named, not scoped, not touched here. If this session finds itself wanting to build it, stop and treat
  it as its own scoping question first, per the standing "method/test/frame before purpose" discipline —
  the same failure class that cost the predecessor session a redirect on M-5 itself.
- **M-4's `KEEP IN SYNC` banner drift** — named, standing, separate.

---

## Constraints that bind regardless, whichever item is worked

- **PR19 applies** to any live-surface code change — this covers item 3 (a retention sweep touches a
  live cron/DB surface) and possibly item 4 (RLS changes are always Critical per the standing-protocol
  table: "Auth, session, encryption, access-control changes → Critical"). Item 2 (writing tests) likely
  does NOT require PR19 on its own (no live-surface code changes), but confirm this against the actual
  diff before skipping it.
- **PR20** — timestamp-check every present-tense mechanism fact in this document against the current
  codebase before relying on it, and timestamp-check any carry-forward target at drafting time if this
  session produces one.
- **PR23** — consult the memory index before diagnosing or writing in a recurring problem class. The
  `shared-flag-dark-is-per-flag-not-per-feature` and `nextjs-route-export-validation` memories are both
  plausibly relevant to items 2 and 3.
- **The Q1 hard constraint** (from the standing agent-circles/idea-loop context, if item 5's routing
  touches it): the loop proposes; it never executes. Unrelated to items 2/3/4 directly, but bears on
  item 5's downstream consequence.
- Every commit this stream has made has been reviewed via `/code-review high` before committing, even
  when the change was purely mechanical (22 near-identical edits still got a full 3-batch review). Hold
  the same bar here — a genuinely mechanical change at scale is still where copy-paste errors hide.

---

*End of prompt. Three commits landed and shipped last session (`8b04e53`, `d6f5073`, `bbd89d1`), each
independently revertable. This session picks up at mechanical item 2, re-deriving every carried number
from source before acting on it — that discipline is what caught two stale counts last session and
should be treated as standing practice for this task list specifically, not a one-off.*
