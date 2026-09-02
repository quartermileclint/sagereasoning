# Next-session prompt — the silent 1,000-row cap on `/api/founder/hub` (and the codebase-wide sweep)

**Founder: paste this file as the first message of a new session.**

Open under the standing opener first —
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`. Where it conflicts
with this file, **this file wins for the defect described here only**; the opener still governs
everything else.

**Tier: `code-critical`.** A live founder-facing governance surface, a silent data-visibility
failure, and a sweep that may touch measurement tables. **PR19 independent adversarial review is
REQUIRED** and is not a formality on this one.

---

## §0 — Re-derive at open. Do not trust this document on faith.

```
git log origin/main..HEAD --oneline      # expect EMPTY (founder pushed 2026-09-02)
git log -1 --oneline                     # expect 3ef899e or later
grep -n "limit(\|range(" website/src/app/api/founder/hub/route.ts
```

The third command is the one that matters: **if it returns nothing for the two `select()` call sites
named in §2, the defect is still live.** If it returns limits there, someone has already fixed this —
stop and re-scope rather than proceeding.

If anything below disagrees with what the commands return, **trust the output, not this file.**

---

## §1 — The defect, and how it was confirmed

**PostgREST returns at most 1,000 rows by default. Neither of the two conversation queries sets a
limit, and both order ASCENDING — so the rows silently dropped are the NEWEST ones.**

Found 2026-09-02 while verifying an unrelated fix. The founder reported `/private-mentor` "not
retaining anything since 31 Aug" and the mentor repeating an old answer. Three plausible hypotheses
(stuck `updated_at`, non-active status, failed writes) were **all refuted by production data** before
this diagnosis was reached — the write path is healthy and yesterday's fail-loud fix works correctly.

**Confirmed behaviourally, not by reading a config setting.** The founder's private-mentor
conversation `8223090a-ee03-45cd-b622-96f11b2fce1b` held **1,013 messages**. A `row_number()` query
placed the boundary exactly where the symptom said it was:

- **row 1000** = `2026-08-31 09:15:49` — the last message visible at the bottom of the page.
- **rows 1001-1013** = everything after, invisible to the browser: the 31 Aug corrected ruling
  exchange, an entire 1 Sep session, and a 2026-09-02 test message that IS present in the database.

**The tell that removes all doubt:** the founder sent `Test message, please reply briefly.`
(row 1012). The mentor's reply (row 1013) opens *"Rulings on Question A, Question A2, and
Question B..."* — the same shape as row 1001, its answer to the 31 Aug ruling request at row 1000.
It re-answered row 1000 because row 1000 is the newest message it can see.

**Nothing is lost.** All 1,013 rows are intact in the database. This is a read-path visibility
failure, and it is silent: no error, no truncation flag, nothing in the logs.

---

## §2 — The two call sites

Both in `website/src/app/api/founder/hub/route.ts`:

1. **`route.ts:~1780` (GET, `?conversation_id=`)** — `select('*')`, ordered ascending, no limit. The
   browser receives only the oldest 1,000 messages. This is what makes the page appear to end on
   31 Aug.

2. **`route.ts:~1430` (POST, `debugStep = 'load_history'`)** — same shape. The result is then
   `.slice(-20)` at `route.ts:~524` ("last 20 messages for context window management"). Because the
   fetch is already truncated, `slice(-20)` takes rows 981-1000 — **the mentor's working memory is
   pinned to 31 August and cannot advance.** This is what causes the wrong answers.

Line numbers will drift. Locate by `debugStep = 'load_history'` and by the `conversationId` branch in
the GET handler, not by number.

---

## §3 — THE CONTAMINATION WINDOW (read this before deciding the fix is small)

**Every mentor reply generated from row 1001 onward — i.e. from 2026-08-31 09:16 to 2026-09-02 — was
produced against a context window ending at row 1000.** The current message is passed separately, so
the mentor always saw what was just sent; what it could not see was anything said between 31 Aug
09:16 and that message, **including its own prior replies.**

Two consequences the next session must surface rather than assume away:

- **Row 1003 is the corrected mentor ruling of 2026-08-31** (`Rulings on Question B (corrected),
  Question A2b, ...`) — captured at
  `operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-questionB-and-A2b-verbatim.md`
  and the operative ruling for the `/api/score/save` R20a perimeter work **that went live on
  2026-09-02**. It was generated without the mentor being able to see row 1001, its own ruling being
  corrected. Whether that mattered depends on how self-contained the founder's correction message
  (row 1002) was. **This is a question for the founder to settle by reading the verbatim, not for a
  session to decide unilaterally, and not a reason to assume the ruling is invalid.**
- **Rows 1004-1011 are a substantial 1 Sep mentor exchange** (a shared Grok conversation; row 1011
  reads `Rulings on Route A, Route A2, and Route B`). Only ONE 2026-09-01 verbatim exists in the repo
  (`2026-09-01-mentor-instruction-bidirectional-algorithm-verbatim.md`). Whether the rest were
  captured elsewhere, were superseded, or are uncaptured rulings is **unverified** — check before
  assuming either way.

---

## §4 — State at the time of writing

- **The affected conversation is ARCHIVED** (founder-run 2026-09-02):
  `UPDATE public.founder_conversations SET status = 'archived' WHERE id = '8223090a-...'`. This was
  an interim unblock — the page's list query filters `status = 'active'`, so `/private-mentor` now
  creates a fresh conversation and is usable again. **Fully reversible**
  (`SET status = 'active'`); no data was deleted.
- **Consequence for this session:** a NEW active private-mentor conversation now exists, and the old
  1,013-message thread is invisible to the page. Restoring it is part of the fix's acceptance
  criteria, not a separate task — a fix that works only because the thread is hidden has not been
  demonstrated.

---

## §5 — The work

### (a) The fix itself — small, but do not stop here

- **The history load should not depend on the cap at all.** Fetch the last N *descending with an
  explicit limit*, then reverse — rather than fetching everything and slicing. This is both correct
  and cheaper. Note `message_count` at `route.ts:~1712` is derived from `conversationHistory.length`
  and will need adjusting.
- **The GET needs real pagination** (`.range()` / an explicit limit, most-recent-first with a "load
  earlier" affordance), plus a client change in `website/src/app/private-mentor/page.tsx`. Note that
  page's scroll-to-bottom (`page.tsx:~107`, `behavior: 'smooth'`) over a very long list is a separate
  suspected weakness — **unverified, browser-side; do not conflate it with the cap.**

### (b) THE SWEEP — the part that matters more than the mentor page

**Find every unbounded `select()` in the codebase and determine which can cross 1,000 rows.** The
mentor thread is how this was found, not the extent of it. The tables of concern are the ledgers and
observation tables this project's measurement claims rest on — `agent_provenance_ledger`,
`agent_trust_events`, `agent_assessment_history`, `agent_hold_observations`,
`idea_loop_candidates`, `stoa_entries`, `action_evaluations_v3` and their siblings. **A silently
truncated read on a measurement table produces a confidently wrong number with no error** — the same
shape as "a verified arithmetic operating on an unverified set", which is already a named standing
constraint in this project.

Treat the sweep's output as a finding in its own right, whatever it returns, including if it returns
nothing.

### (c) The governance question — DO NOT decide this in a build session

**How much continuity should the mentor have?** The 20-message window is a constant someone chose for
context management. Widening it is a one-line change and therefore tempting; it is also a decision
about what the project's governing advisory surface is able to remember, on a surface whose outputs
bind. **Put it to the mentor. Do not widen the constant unilaterally as part of a bug fix.**

---

## §6 — Why this is `code-critical` and not a chore

The mentor is a governing surface — its rulings bind this project. The observed failure mode is that
it produced correctly-formatted, confident output in response to a question nobody asked, with no
error anywhere. A founder skimming that reply would have received a ruling on the wrong question.
That is a correctness hazard for governance, not a UX complaint, and the defect is self-worsening:
every message written widens the invisible tail.

It is also **the fourth instance of this codebase's recurring silent-failure class** — after
`action_evaluations_v3` (four months of silently failed writes), the Sage Reflect completion 503, and
the `/api/founder/hub` unchecked inserts fixed 2026-09-01. The first three were discarded *errors*;
this one is a silently discarded *remainder*. Worth naming as such in the close, because the pattern
is what keeps recurring, not the individual bug.

---

## §7 — Acceptance criteria

1. The 1,013-message thread is un-archived and `/private-mentor` displays messages through the most
   recent one, including rows 1001-1013.
2. A new message to that thread receives a reply that engages with the ACTUAL message, not row 1000.
3. Both call sites have explicit, tested bounds; a regression test proves the >1,000-row case
   (this is a fixture-constructible property — do not accept a source-pattern assertion alone where
   the behaviour can be executed).
4. The sweep is complete and its result recorded either way.
5. PR19 independent review, with the sweep as one of its dimensions.

---

## §8 — Not in scope

The §1(b) `/api/score` local-storage screening gap (its own open item); the missing storage-mode
switch on `/score`; anything in the standing opener's held list. The provenance-ledger C2 readiness
window is running — **do not perturb** `emission-hooks.ts`, `provenance-*.ts`, `/api/reason`'s write
block, or the sweep handler; if the codebase-wide sweep finds an unbounded read in those files,
**report it, do not fix it in this session.**

**End of prompt.**
