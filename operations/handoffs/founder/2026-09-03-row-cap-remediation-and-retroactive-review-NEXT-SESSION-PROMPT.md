# Next-session prompt — record the row-cap fix LIVE, retroactive PR19 review, then the sweep's remediation

**Founder: paste this file as the first message of a new session.**

Open under the standing opener first —
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`. Where it conflicts
with this file, **this file wins for the work described here only**; the opener governs everything
else. Read the predecessor close in full:
`operations/founder-hub-2026-09/2026-09-02-postgrest-row-cap-fix-CLOSE.md`, and the sweep report it
points at: `operations/founder-hub-2026-09/2026-09-02-unbounded-select-sweep-REPORT.md`.

**Tier: `code-critical`.** Part C touches data-rights export/delete code (PR19's widened scope, 0d-ii
"data deletion functionality") and several cron/admin routes whose numbers go to the founder daily.
**PR19 independent adversarial review is REQUIRED for Parts B and C** — and Part A IS a PR19 task.

---

## §0 — Re-derive at open. Do not trust this document on faith.

```
git log -1 --oneline                     # expect a70c467 or later
git log origin/main..HEAD --oneline      # expect EMPTY (founder pushed 2026-09-03)
grep -n "loadRecentHistory\|loadConversationPage" website/src/app/api/founder/hub/route.ts
cd website && npx tsx src/app/api/founder/hub/__tests__/conversation-history-row-cap.test.ts | tail -2
cd website && npx tsx scripts/unbounded-select-sweep.ts | head -12
```

Expect: both helpers called in the route; the test **74 passed, 0 failed**; the sweep reporting
**85 unbounded-read** candidates (if that number has dropped, someone has already remediated part of
the sweep — read the decision log tail before assuming which part). If anything disagrees with this
file, **trust the output, not this file.**

Note the standing untracked stray
`operations/handoffs/founder/2026-09-01-score-save-perimeter-activation-NEXT-SESSION-PROMPT.md` —
not yours; do not stage it (the founder's disposition).

---

## §1 — State at the time of writing (2026-09-03)

- **The fix is pushed and LIVE.** Commit `a70c467` on `origin/main`; Vercel green. **The founder walk
  (`2026-09-02-founder-hub-row-cap-FOUNDER-WALK.md`) was completed and reported successful** — the
  1,013-message thread un-archived, `/private-mentor` displays through the newest message, and a
  new message received a reply engaging with what was actually sent. **No session has yet recorded
  this activation in the decision log — that is Part A's first act.** The AI did not observe the walk;
  the record must say so and rest on the founder's report against the expectations the walk fixed in
  advance (the 2026-09-02 score/save precedent).
- **What the record does not yet hold** (ask the founder at open, record verbatim): which of the
  walk's two options was taken for the interim conversation created during the archive period —
  (a) old thread brought to the front, interim left active-but-behind, or (b) interim also archived.
- **The independent review of the fix is incomplete.** Three launches, three session-limit deaths.
  Four dimensions returned findings (all sixteen re-adjudicated first-hand in the close; three
  fixed); **three dimensions never ran at all**: `fake-fidelity-and-test-adequacy`,
  `sweep-tool-correctness`, `claims-vs-code`. The sweep REPORT itself is single-perspective. PR19 §4
  makes the independent re-run **required** before either artifact is treated as verified for any
  downstream activation — the fix is already live, so this is a **retroactive** review in the
  2026-07-29 precedent (`D-INDEPENDENT-REVIEW-RERUNS-AE1-S11B-PHASE0-PHASE1-FOLDED-2026-07-29`).
- **`MENTOR_HISTORY_WINDOW` is still 20, test-pinned.** The mentor question
  (`2026-09-02-mentor-question-continuity-window-FOR-RULING.md`) is drafted, NOT relayed — it waits
  on the founder's own reading of the contamination-window verbatim first (the close, §4). If a
  ruling has since been relayed, it is the input; if not, do not decide the number.
- **The one time-sensitive finding:** the provenance-ledger C2 discharge tally
  (`website/scripts/provenance-c2-discharge-tally.ts:170`) reads the whole ledger unbounded and, at
  ~47 rows/day since 2026-08-26, **crosses the 1,000-row cap around 2026-09-17 — inside the
  two-week readiness window it measures** (nominal eligibility ~2026-09-09). It sits in the watched
  `provenance-*.ts` glob. See Part D.

---

## §2 — The session-limit lesson (read before launching any workflow)

Every review workflow this thread launched died on the account session limit: 14/15, 11/12, then
34/40 agents. Each subagent carries the full project context (~220k+ tokens — memory
`subagent-context-carries-claudemd`), so a seven-dimension review with per-finding refuters is
~3M tokens and does not survive. **Launch small and sequential:** one workflow at a time, **≤4
agents per launch**, refuters only for findings graded medium or above, and read `journal.jsonl`
before trusting any summary. And **fix the aggregation before reuse**: the review script's
post-processing marked a finding REFUTED when both its refuters DIED (`votes.length === 0` fell
through the same branch as "zero refutations") — a finding with no surviving votes is
**UNREVIEWED**, never refuted. Any script you write must carry a distinct `UNREVIEWED` status.

---

## Part A — Record the activation, then the retroactive PR19 review (do this first)

1. **Decision-log entry** at the physical tail:
   `D-FOUNDER-HUB-POSTGREST-ROW-CAP-FIX-LIVE-2026-09-03` — the push (`a70c467`), Vercel green, the
   founder's walk report against the walk's pre-fixed expectations (criterion 1: the thread shows
   through the newest message with a working "Load earlier messages"; criterion 2: a new message
   drew a reply to what was sent), the (a)/(b) election, and the honest limit that the AI observed
   none of it. AC7 engaged and discharged by the founder. Rollback unchanged (`git revert a70c467`
   + push; re-archive SQL in the walk §4).
2. **The retroactive independent review** — the artifact is the diff of `a70c467` (get it with
   `git show a70c467 -- website/`) plus the sweep REPORT. Dimensions, run as **separate small
   launches**, ≤4 agents each:
   - `fake-fidelity-and-test-adequacy`: does the test's cap-modelling fake diverge from real
     PostgREST/postgrest-js in any way that lets the test pass while production fails (string vs
     timestamptz comparison; `.or()` value quoting; `count` with `.limit`; the thenable shape); is
     any assertion vacuous; what single case is missing.
   - `sweep-tool-correctness`: the tool's FALSE NEGATIVES — a bound applied on one branch only; a
     bound applied via a helper; `.from(` inside comments; `.range()` above the cap; the 4,000-char
     continuation cut-off; files outside the four walked roots. Run it; spot-check three
     classifications against the code.
   - `claims-vs-code` (PR20/PR25): every present-tense claim in `conversation-history.ts`'s header,
     the test header, the mentor-question document, the founder walk, and the sweep REPORT — against
     source. The REPORT's `none`/`low` rows are the ones to attack (a false `none` is the dangerous
     direction).
   - `sweep-report-adjudication`: for each HIGH row in the REPORT §2.1, try to REFUTE the
     cardinality claim from the code and migrations; for each `none` row in §2.4, try to show the set
     CAN exceed 1,000.
   Fold confirmed findings at the root; record confirmed/refuted/unreviewed counts explicitly.

## Part B — The three SQL counts that settle the REPORT's unknowns (founder-run, then record)

Pure ASCII, production project (check the dashboard header), read-only:

```sql
select count(*) from translation_sandwich_comparisons where created_at >= date_trunc('month', now());
select count(*) from analytics_events where created_at > now() - interval '7 days';
select proname from pg_proc where proname = 'get_event_counts';   -- exists in production or not
select count(*) from agent_provenance_ledger;                      -- the tally's denominator today
select count(*) from mentor_interactions;                          -- H9's table, 485 on 2026-08-18
```

These decide whether H8 (`translation_sandwich_comparisons` monthly sums) and M3/M4
(`analytics_events`; the `get_event_counts` fallback) are **now** or **plausible**, and how close H1
and H9 are. Record the numbers with their date.

## Part C — Remediation, in the REPORT's §6 order (Parts C1–C3 may fit one session; C4 its own)

Every fix has the same shape — **stop fetching rows to aggregate them**: `count`/`sum`/`max`/
`distinct`/percentiles in SQL via an RPC or a view, or a time-windowed read with an explicit
`.limit()` and a disclosed `capped` flag. Each route below has a test file to extend; every fix
gets an executed regression pin against a cap-modelling fake (copy the pattern from
`conversation-history-row-cap.test.ts` — negative control first, then the fix, then mutation-verify).

- **C1 — the numbers people act on, non-watched (HIGH, `code-elevated`):**
  `website/src/app/api/billing/cost-alerts/evaluate/route.ts:131/:173/:246`,
  `website/src/lib/substrate/substrate-identity-baseline.ts:70` (the A13 cost-health detectors);
  `website/src/app/api/abuse/evaluate/route.ts:134/:187` (A19 identity enumeration + per-agent
  detectors); `website/src/app/api/admin/slo-health/route.ts:54` (A14). New SQL functions/views
  are a founder-walked migration step (TEST then production) — author them idempotent with
  `§PRE/§APPLY/§VERIFY/§INVERSE`, pure ASCII.
- **C2 — conditional on Part B:** `usage-summary/route.ts:109/:180`,
  `cost-alerts/evaluate/route.ts:285/:328` (monthly + 7-day LLM cost), `admin/metrics/route.ts:42/:46/:83`.
- **C3 — the governing surface:** `sage-mentor/profile-store.ts:876` `computeRollingWindow` — filter
  by `profile_id`, window by date, order desc, limit `HUMAN_ROLLING_WINDOW.max_interactions`. This
  also closes the read of every practitioner's rows to find one. Live via
  `updateProfileFromReflection` from both reflect routes — measurement-neutral (no `/api/reason`
  import graph file), but PR19 on the mentor-profile path.
- **C4 — the data-rights class (`code-critical`, PR19 REQUIRED, its own session):** one shared paging
  helper (loop `.range()` or keyset until the exact count is reached; an honest `incomplete: true`
  marker if a page ever comes back capped) used by every export/access read in
  `user/export/route.ts`, `user-data-gathering.ts`, and the store `…ForOwner` functions, **and by the
  two key-list reads in `user/delete/route.ts:217/:239` that DRIVE deletions**. The deletion sites
  first — an incomplete deletion reported as success is the class that matters most.
- **C5 — before Stripe activation, not before:** `webhooks/stripe/route.ts:315` invoice aggregation.

## Part D — The provenance tally (report-only surface; founder election, not a build decision)

The tally is a **measurement script**, not the live provenance pipeline — but the handoff prompt's
watched-surface list names `provenance-*.ts` by glob, and this file will not re-litigate that. Put
to the founder at open, before the ~09-09 eligibility read: **(i)** leave the script untouched and
run the two-week resolution figure in SQL instead (`select layer1_source, count(*) from
agent_provenance_ledger group by 1` + the classify log counts), disclosing the script's own ceiling
in the readiness record; or **(ii)** elect a minimal fix to the script's three whole-table reads
(`:132/:141/:170` — keyset page or SQL aggregate) as a scoped exception to the watch, recorded as
such. **Neither happens without the founder's stated election.**

## §3 — Not in scope

Widening `MENTOR_HISTORY_WINDOW` (mentor ruling first); the `/api/score` local-storage gap; the
ask-org mode's four unchecked inserts (named at 2026-09-01, still open); the founder-hub scroll-
position restoration and the button's accessibility affordances (named nits in the close);
anything in the standing opener's held list; `emission-hooks.ts`, `provenance-*.ts` (beyond Part
D's election), `/api/reason`'s write block, the sweep handler.

## §4 — Acceptance for this session

1. The activation is recorded (Part A.1) with the founder's (a)/(b) election.
2. The three dead review dimensions + the sweep-report adjudication have RUN independently (small
   launches), with confirmed/refuted/**unreviewed** counts stated — no finding marked refuted for
   want of a surviving refuter.
3. Part B's counts are in the record with their date.
4. Whatever of Part C was built carries an executed, mutation-verified regression pin, and the
   sweep tool re-run shows the candidate count reduced by exactly the sites fixed.
5. The Part D election is recorded verbatim, whichever way it went.

**End of prompt.**
