# Next-Session Prompt — The bounded validation run

**Stream:** founder.
**Tier:** `code-elevated` under 0d-ii — real production credential use, real spend, real data written
to production tables, founder-attended. **No code, schema, auth, or deployment-flag change is
expected**; if one becomes necessary mid-run, stop and treat it as its own Critical step, not
folded in here. Confirm this classification at open against the standing cache rather than
trusting this header.

**⚠ THIS SESSION MUST OPEN IN A FRESH, SEPARATE PROJECT — NOT THE `sagereasoning` REPO.**
This is a founder decision made explicitly at the close of the runner scoping session
(2026-08-10), not an oversight. Open this session in
**`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run`** — a sibling of
`Claude-work/PROJECTS/sagereasoning`, per the house convention for test-loop/scratch work (memory
`test-loop-dirs-under-claude-work-projects`); the folder is created empty by the Claude Code
"new project" flow, not pre-populated. **Do not open
it inside the `sagereasoning` repository.**

**Why:** a repo-rooted Claude Code session auto-loads the full `sagereasoning` `CLAUDE.md` +
memory index (~220k tokens, probe-proven at the 2026-07-25 P2 rerun,
`subagent-context-carries-claudemd`) — none of which has anything to do with generating IDEA-loop
candidates, and all of which risks biasing what the loop proposes toward this repo's own concerns.
The scratch project reads only the specific ruled documents this prompt cites, by absolute path,
and nothing else.

**Governing frame:** `/adopted/standing-protocol-cache.md` is the `sagereasoning` repo's own
protocol — it does not govern a session opened elsewhere. This session instead governs itself by
the ruled scope documents cited below, read by absolute path. Do not attempt to load
`/adopted/standing-protocol-cache.md` or `sagereasoning/CLAUDE.md` — that would defeat the whole
purpose of the fresh project.

**Predecessor session close:** `operations/handoffs/founder/2026-08-10-runner-scoping-session-CLOSE.md`
(in the `sagereasoning` repo).
**Predecessor decision-log entry:** `D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10`.
**This session's deliverable, once written, returns to the `sagereasoning` repo** — see Part D.

---

## Where this sits

> brief ruled → `fresh` ruled → `watching` ruled → generation-step ruled → first build gate (all
> three built dark) → runner scoping session (identity, capability, three flags, timeout,
> friction mapping — **done 2026-08-10**) → **bounded validation run ← THIS SESSION** →
> standing-runner design

This is a **founder-attended, AI-agent-driven** validation run — the mentor-ruled shape
(`2026-08-09-generation-step-scope.md` §2.9): *"the founder's own Claude Code session as runner
(`/loop`-paced or manually driven)."* **No standalone runner code is built.** This session's
agent reads the ruled heuristic templates, generates candidates by reasoning, and calls the four
live server endpoints directly — the same six-step cycle this repo's own smoke calls performed
manually, repeated with genuine generation instead of placeholder payloads.

**The founder made two decisions at the close of the predecessor session, both recorded here as
binding for this one:** (1) an AI agent performs the cycle directly, no standalone code; (2) that
agent runs in a fresh scratch project, not the `sagereasoning` repo.

---

## Pre-conditions

1. **Confirm you are in a fresh project, not `sagereasoning`.** If the working directory is
   `Claude-work/PROJECTS/sagereasoning`, stop and open a new project first.
2. Confirm the runner credential exists and is active — it was minted 2026-08-09
   (`sagereasoning:idea-loop@v1`, id `527cc86b-830b-4337-8fd7-ff28d9b0b5dc`) and its token is in
   the founder's password manager, not in any repo file or prior transcript. **The founder
   supplies the token to this session via an environment variable at the start — it must never be
   pasted into chat or written to a file this session creates.**
3. Confirm the smoke-test artifact was torn down: `idea_loop_cycles` /
   `idea_loop_candidates` rows with `loop_id = 'sagereasoning:idea-loop@v1#smoke'` were deleted
   2026-08-10 (`remaining: 0`, confirmed). This run's `loopId` must be
   `sagereasoning:idea-loop@v1#001` (the first real instance) — never reuse `#smoke`.
4. Confirm the three server flags are live in production (they should already be, from the
   predecessor session): `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`,
   `SUBSTRATE_LOOP_ID_FIELD_ENABLED`. A 503 from any of the three endpoints below means a flag
   regressed — stop and return to the `sagereasoning` repo to investigate; do not proceed.

---

## Part A — What to read, by absolute path (all inside `sagereasoning`, read individually — do NOT open that repo as a project)

Read these six documents in full before generating anything. Each is short; together they are the
complete, ruled specification of the cycle this session performs.

1. `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/2026-08-10-runner-scoping.md`
   — this session's own environment: the credential's capability surface, the five configuration
   defaults (§2), the resolved timeout position (§3 — **read this carefully, it changes your
   client timeout**), the `frictionAssessment` decision (§4), and GS-ATRF-1/2 as open questions
   this session must decide (§5).
2. `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md`
   — the seven heuristic templates verbatim, the friction-detection fallback rule, and the
   examination-cost design.
3. `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md`
   — §2.2 (candidate pool composition), §2.3 (friction-detection threshold), §2.4 (the
   `randomOffsetPercent` phantasia-variation mechanism — read carefully, it governs presentation
   order, never content), §2.6 (the null-cycle rule — **structural, not a policy you choose to
   honour**), §2.8 (the exact six-step cycle order), §2.10 (what this session must never do).
4. `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md`
   — the `POST /api/practice/fresh` request/response contract.
5. `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md`
   — the `POST /api/practice/watching` request/response contract (§2.3), and the enumerated
   outcome vocabularies.
6. `/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/2026-08-08-autonomous-loop-design-brief.md`
   — §1.1 (the architecture: this session holds all cycle state; the server is stateless and
   request-scoped) and the exact §6 report shape (quoted below, so this is confirmatory, not
   load-bearing).

**Do not read** `sagereasoning/CLAUDE.md`, `/adopted/standing-protocol-cache.md`, or any other
document not listed above. If you find yourself wanting to — that instinct is the thing this
session's isolation is designed against.

---

## Part B — The six-step cycle, exactly (§2.8, restated here for a self-contained reference)

Each cycle, in order:

1. **Generation** — up to seven candidates: one per heuristic (analogous_transfer,
   combinatorial_generation, synthesis_over_novelty, context_transfer, fifth_circle_weighting,
   anomaly_detection) plus one friction_detection candidate when the task list has a qualifying
   friction point (§2.3's three-slot test). Each of the six virtue-domain heuristics tags
   `targetCircle` (1–5) and `initialClassification: {kind: 'virtue_domain', domains: [...]}`; the
   friction candidate tags `initialClassification: {kind: 'preferred_indifferent'}` and carries no
   `targetCircle`.
2. **Guardrail filtering** — one `POST /api/guardrail` call per candidate (Bearer, the `consult`
   capability). A candidate whose call fails closed or never yields a verdict does **not** enter
   step 3 (the unexamined-candidate constraint — read §2.8's own text on this, it is load-bearing,
   not a convenience).
3. **Novelty** — **one batched** `POST /api/practice/fresh` call carrying every guardrail
   survivor as `{gapRef, targetCircle?, initialClassification}`. `gapRef` format:
   `{sessionId}:{cycleNumber}:{c}->{t}` (document §5's own convention — read the exact form from
   doc 3 above, §2.7's own text, not improvised).
4. **Winner selection** — a pure filter-then-compare: candidates with `passedNoveltyCheck !== true`
   are excluded from comparison entirely (never merely deprioritised); if none remain, the cycle
   outcome is `null_cycle`. Otherwise pick the highest-proximity survivor by the guardrail's own
   verdict.
5. **Winner's full examination** — **one** `POST /api/reason` call on the winning candidate's
   `proposed_action`, carrying `loop_id: "sagereasoning:idea-loop@v1#001"`. **Full synchronous
   shape — do NOT send `response_format: "assessment_first"`** (doc 6's own finding: no
   narrative-retrieval endpoint exists yet, so a deferred consult's prose would be permanently
   unrecoverable).
6. **The record write** — **one** `POST /api/practice/watching` per completed cycle, carrying the
   cycle row and every candidate row (including guardrail-rejected and novelty-rejected
   candidates — Q7 transparency, not optional). **This executes even if step 1–5 was cut short by
   `maximumDuration`** (the timeout's own record must never be suppressed by the timeout itself).

**Timing:** draw one random value `r ∈ [0, 20]` per cycle (the ruled `randomOffsetPercent`). Use
it twice: to stretch `minimumInterval` (additive-only:
`actualInterval = 14400000 × (1 + r/100)`), and to seed a deterministic permutation of
presentation order within generation (never content, never the gap, never any threshold — §2.4's
confinement list is a required review dimension, hold yourself to it even without a formal review).

**Never vary by construction:** the gap; the instruction stanzas; the output contract; any
threshold; anything examination-side.

---

## Part C — Credential, endpoints, and the timeout correction

**Auth:** every call is `Authorization: Bearer $SR_TOKEN`.

**⚠ CORRECTED 2026-08-10, after cycle 1 (this paragraph originally said "the founder sets
`SR_TOKEN` in this session's shell" — that instruction was wrong and cost a stopped session; do
not follow it as originally written).** The founder runs Claude Code as the **macOS desktop app**,
which does **not** inherit a terminal `export` (memory `claude-code-desktop-app-hook-env`) — a
plain shell export is invisible to this session. **The correct mechanism:** the founder puts the
token in this scratch project's own `.claude/settings.local.json`, under an `"env"` block:
```json
{ "env": { "SR_TOKEN": "sr_prac_…" } }
```
This is a **proven** pattern in the sibling `sagereasoning` repo's own harness (injects into every
session subprocess, not just hooks; hot-reloads on the next prompt, no restart needed) — use
`$SR_TOKEN` in every curl exactly as written throughout this document. **Before the founder does
this: confirm whether this scratch project has its own git repo at all** (`git status` — if it
says "not a git repository," there is no commit risk and nothing further is needed; if it is a
repo, confirm `.claude/settings.local.json` is gitignored before the token goes in — the
2026-07-17 public-credential-exposure incident on the sibling repo happened from exactly this file
type being tracked). **Do NOT** retrieve the token via macOS Keychain from inside this session —
a live secret-store read used to make billed external API calls is exactly the class of action a
safety classifier should and will block; if that happens, stop and report it (as cycle 1's session
correctly did) rather than finding another path to the same credential. It is never written to a
file this session creates, and never pasted into chat.

**Base URL:** `https://www.sagereasoning.com`

| Step | Endpoint | Capability | Notes |
|---|---|---|---|
| 2 | `POST /api/guardrail` | `consult` | Per candidate |
| 3 | `POST /api/practice/fresh` | `consult` | One batched call |
| 5 | `POST /api/reason` | `consult` | Full sync shape; carries `loop_id` |
| 6 | `POST /api/practice/watching` | `watching_write` | One per completed cycle |

**⚠ Client timeout — read `2026-08-10-runner-scoping.md` §3 before setting this.** The
predecessor session measured a genuine winner consult (step 5) at ~34.8 seconds. **Set your own
client-side timeout on step 5 to at least 60 seconds** — the ruled `ORIENTATION_DELIVERY_TIMEOUT_MS`
(28,000ms) is a server-side classification bound, not a caller timeout, and adopting it as your
own timeout would cause this session to abandon its own winner consults mid-flight. Every
orientation reading this session produces from a step-5 call completing after 28s will be
classified `observed`, not `examined` — this is expected, disclosed, and not a fault in your
setup.

**`maximumDuration` (the per-cycle hard ceiling):** 1,800,000ms (30 min). If steps 1–5 have not
completed by then, stop work, mark every not-yet-dispositioned candidate
`cycle_outcome: "terminated_by_timeout"`, set the cycle's own `cycle_outcome` to the same value,
and still execute step 6.

---

## Part D — GS-ATRF-1/2: decide, don't defer

The predecessor scope document (§5) carries these as **named inputs this session's design must
answer** — not build items, but real decisions this session cannot skip.

**GS-ATRF-1 (blast-radius indicator):** the mentor's answer is a four-dimension proxy from
`targetCircle` + `initialClassification` + the virtue domains engaged (see doc 1 §5.1 for the
full text). **You may compute this per-candidate as part of your own reasoning during generation
and selection** — nothing forbids using it to inform which candidate you judge highest-proximity.
**You may NOT persist it to any table column** — no `target_circle` or blast-radius column exists
on `idea_loop_candidates` (confirmed absent at the predecessor session), and adding one is a
founder-walked Critical migration, not something this session does.

**GS-ATRF-2 (proposal-shape extension):** the mentor's answer says the indicator "rides the
existing proposal shape" once the column exists. It doesn't yet. **This session's honest answer:**
the indicator, if you compute it, exists only in your own per-cycle reasoning and (optionally) as
free-text colour in the `watching` write's `proposed_action` or a candidate-level note field if
one is available in the request shape — **read doc 5's contract before assuming a field exists to
put it in; do not invent a request field the server does not accept.**

**Record what you actually did** (computed it and where it lived, or didn't compute it and why)
in the report — this is itself part of what the mentor needs to see before scoping the ATRF
session.

---

## Part E — What this session does NOT do

- **Does not execute any proposed action.** The Q1 hard constraint, restated at the point of
  temptation: a winner is surfaced in the record and, per the ruled architecture, in the shared
  task list — never acted on, never scheduled, by this session or any code it writes.
- **Does not write any code.** No heuristic implementation file, no runner script, no persisted
  automation. This is a human-attended reasoning-and-API-calling session, not a build session.
- **Does not add any column, table, or migration** — not `target_circle`, not a blast-radius
  field, nothing.
- **Does not touch `minimumInterval`/`maximumDuration`/`randomOffsetPercent`/
  `minimumIncubationInterval`** beyond using them exactly as ruled (§2.5's five values,
  reproduced in doc 1 §2).
- **Does not attempt to compile the brief §6 report itself as a polished deliverable** — that
  happens back in the `sagereasoning` repo (Part F). This session's job is to run cycles and leave
  a clean, honest trail.
- **Does not treat a guardrail CAUTION or an `is_kathekon: false` reading on its own actions
  (generation, API calls) as a reason to stop** — those readings are about the *candidates being
  generated*, not about this session's own conduct; the harness framing (if any fires in this
  scratch project — it likely won't, since the Gate-1 hooks are configured per-repo) is unrelated.

---

## Part F — Close, and what returns to `sagereasoning`

**Target: 20–40 completed cycles** (the ruled range — not open-ended; stop once you're in range
and have a genuine outcome distribution, even if under 40).

At close, from this scratch project:

1. **Do not delete or modify anything server-side.** The `idea_loop_cycles`/`idea_loop_candidates`
   rows this run wrote are the record; leave them.
2. Write a plain-text or markdown summary of what happened **in this scratch project**, including
   any anomaly, any cycle where something didn't match the ruled shape, any moment you deviated
   and why, and your GS-ATRF-1/2 answer (Part D).
3. **Hand that summary back to the founder**, who opens a **new session inside the `sagereasoning`
   repo** to: (a) pull the real numbers via `GET /api/founder/watching` (the dashboard already
   aggregates outcome, heuristic attribution, and cost per row — no separate bookkeeping is
   needed) and via a direct SQL read if finer detail is wanted; (b) compose the brief §6 report
   verbatim to shape — *cycles run, outcome distribution, null-cycle rate, heuristic productivity
   (which heuristics' candidates ever win), cost per cycle, anomalies*; (c) fold this scratch
   session's own anomaly notes and GS-ATRF-1/2 answer into that report; (d) bring the report to
   the mentor **before any standing-runner design opens** (Q10/Q11, ruled — this is not this
   session's or that session's call to skip).

That follow-up (repo-side) session is `code-standard` at most (read-only queries + a records
document) and does not need its own detailed next-session prompt — it is a straightforward
report-compilation session once this run's data exists.

---

## Rollback path

Nothing in this session is reversible in the usual sense (real API calls, real spend, real rows
written) — but nothing it does is destructive either. If something goes wrong mid-run: stop
calling, do not attempt to delete or "clean up" any written row (the record of what happened,
including an anomaly, is itself useful data — do not manufacture a false clean slate), and hand
back an honest partial summary. The credential can be revoked from the `sagereasoning` repo side
if runaway calls become a genuine concern (`527cc86b-830b-4337-8fd7-ff28d9b0b5dc`) — that is the
real kill switch, not anything reachable from this scratch session.

## Forecast

Success = 20–40 completed cycles, each following the exact six-step order, each honestly recorded
via `POST /api/practice/watching` regardless of outcome (including timeouts and null cycles), with
GS-ATRF-1/2 answered on the record and every deviation from the ruled shape disclosed rather than
smoothed over. **Next: the repo-side report-compilation session**, then the mentor review, then —
only after that — any standing-runner design opens.

End of prompt.
