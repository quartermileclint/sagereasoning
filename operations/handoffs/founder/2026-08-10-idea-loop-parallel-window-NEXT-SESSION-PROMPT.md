# Next-Session Prompt — The IDEA-loop parallel window (standing prompt, read at EVERY session that touches this thread)

**Stream:** founder.
**Tier:** **varies by what's found — do not assume a default.** A pure report-compilation read is
`code-standard`; a schema/route-contract change to unblock the runner is `code-elevated` at
minimum (mirrors the `not_selected` session — additive schema + a live-route validation change);
anything touching the runner's credential, auth, or a flag is `code-critical`. **Classify at the
start of each individual session**, not once for the whole window.

**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `operations/handoffs/founder/2026-08-10-runner-scoping-session-CLOSE.md`.
**Predecessor decision-log entries:** `D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10`; the
`not_selected` fix performed in-session directly after that close (records pending — see the open
item below).
**This is a STANDING prompt**, not a single linear session. It governs **every** session in this
repo, for roughly the next week, while the bounded validation run executes in parallel in a
separate scratch project. Re-read it fresh each time you open a session during this window — do
not assume you remember which mode applies from a prior read.

---

## Why this exists, and why it's shaped differently from a normal next-session prompt

The bounded validation run started 2026-08-10 in
`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run` — a founder-attended AI
agent session acting as the IDEA loop's runner, calling live production endpoints
(`/api/guardrail`, `/api/practice/fresh`, `/api/reason`, `/api/practice/watching`) on the credential
`sagereasoning:idea-loop@v1` (id `527cc86b-830b-4337-8fd7-ff28d9b0b5dc`), targeting **20–40
completed cycles**. At the ruled 4-hour minimum interval that's roughly **3.5 to 7 days** of real
elapsed time — the run is genuinely in flight for about a week, not a single sitting.

**Meanwhile, ordinary build work in `sagereasoning` continues.** That is the situation this prompt
exists for: **a live, in-flight production process now depends on surfaces this repo's own
sessions could otherwise touch without thinking twice.** Cycle 1 already found one such gap (a
missing candidate-outcome value) that blocked the run until a repo-side session fixed it live —
that is not a one-off; it is the expected shape of this window. Any session opened here during the
week should assume the runner might be mid-cycle right now, not "probably idle."

---

## Pre-conditions — run these FIRST, every time, before deciding what kind of session this is

1. **Check the scratch project for a blocking spec.** Look in
   `/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/` for any file matching
   `*-CHANGE-SPEC.md` or `*-BLOCKED.md` (the `not_selected` precedent's naming — the runner writes
   one when it hits something outside its own scope that blocks the record write, per its own
   session prompt's Part E: "does not write any code," so it stops and specifies rather than
   improvises). **If one exists → this is a Mode 1 session (below). Read it in full before
   anything else.**
2. **If no blocking spec exists, check whether the run has reached its target range.** Query
   production (read-only):
   ```sql
   SELECT count(*) AS completed_cycles,
          count(*) FILTER (WHERE cycle_outcome = 'winner') AS winner_cycles,
          count(*) FILTER (WHERE cycle_outcome = 'null_cycle') AS null_cycles,
          count(*) FILTER (WHERE cycle_outcome = 'terminated_by_timeout') AS timeout_cycles,
          min(created_at) AS first_cycle, max(created_at) AS latest_cycle
   FROM public.idea_loop_cycles
   WHERE loop_id = 'sagereasoning:idea-loop@v1#001';
   ```
   **If `completed_cycles` is in the 20–40 range AND the founder confirms the runner has reported
   back (per its own scope document §9/Part F) → this is a Mode 3 session (below).**
3. **Otherwise → this is a Mode 2 session (below):** the run is mid-flight, no gap is blocking it,
   ordinary build work continues, but with the guardrails in this prompt observed.
4. **Do not skip step 1.** A session that jumps straight to unrelated build work while a blocking
   spec sits unread leaves the runner stalled for the rest of its own session's lifetime, silently.

---

## Mode 1 — unblocking a spec the runner wrote

**This mirrors exactly what happened after cycle 1** (`NOT-SELECTED-CHANGE-SPEC.md`,
`D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10`'s immediate follow-on, records pending — see the
open item below). Treat that as the worked example, not merely a precedent to cite.

1. **Read the spec file in full.** It should already be scoped by the runner as a specification,
   not an authorization to act — the runner is explicitly barred from schema/code/deployment
   changes (its own session prompt's Part E). If a file claims to have already made a live change
   itself, stop and treat that as a boundary violation to investigate, not a fact to build on.
2. **Verify every claim in the spec against the actual live state before writing anything** — the
   database's current constraint definitions, the actual code, the actual current row data if the
   spec references specific rows. **Do not trust the spec's description of DB or code state as
   ground truth; the spec is the runner's honest read from outside, not a verified fact.** (The
   `not_selected` spec's claims all held on verification — but verify, don't assume that pattern
   repeats.)
3. **Classify the risk** per what's actually needed — a pure vocabulary/schema widening is
   Elevated; anything touching auth, the credential, or a flag is Critical.
4. **Execute with the same discipline as the `not_selected` fix:**
   - Schema changes: a **new**, separately-named migration file (mirroring the existing
     `supabase-idea-loop-candidate-outcome-not-selected-migration.sql` and
     `supabase-api-keys-watching-write-capability-migration.sql` pattern) with explicit
     `§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE` sections. **Migration before code, always** — a widened
     CHECK is a backward-compatible superset; shipping code that accepts a value the database still
     rejects converts a clean 400 into a 500.
   - Code changes: locate **every** site referencing the vocabulary being changed (grep first,
     don't assume you know the count — the `not_selected` fix touched exactly two: the route's
     validation array and one battery pin; a different gap might touch more).
   - **Mutation-verify any battery pin you add or rely on** — revert the code change alone,
     confirm the pin actually fails, then restore. A pin that was never proven to fail is not
     evidence of anything (the standing lesson from the `founder-watching` PostgREST embed
     defect earlier in this arc — every battery was green while the live route was broken).
   - **Live-verify, not battery-verify, the actual fix.** `tsc` + a green suite are necessary, not
     sufficient. The founder runs the migration on TEST then production (SQL Editor, pasted output
     confirmed by you before proceeding to the next step); you make the code edit and push; the
     founder confirms Vercel green; then a **live** probe against the real production endpoint (or
     a genuine data correction, verified before-and-after) is what actually proves it landed.
5. **If the spec names a data correction** (rows already written under the old, wrong shape): get
   the read-only confirmation of the affected rows' current state **first**, check it against what
   the spec claims, and only then run the write — exactly the `§2.PRE` → confirm → `§2.APPLY` →
   `§2.VERIFY` shape used for the `not_selected` cycle-1 correction.
6. **Close the loop with the runner, not just the repo.** The runner's own spec should describe
   how it will independently confirm the fix landed (the `not_selected` spec used a deliberately
   invalid `watching` body and read the 400's `details` — zero cost, zero risk). Tell the founder
   to relay "landed" back to the scratch project so the runner can resume; do not assume the fix
   being live in production means the runner already knows.
7. **Record it** — even a small fix like this gets a decision-log entry (Elevated risk gets the
   lean form per the standing cache; do not skip records because the change felt small — this one
   still touches a live production schema and a validated route).

---

## Mode 2 — ordinary build work, runner live in the background

**The guardrails below apply to any session in this window that is not itself working on the IDEA
loop.** They exist because a change made for unrelated reasons could silently break an in-flight
run that has no way to tell you it broke.

**Before touching any of the following, stop and think about the runner specifically — not just
"does this break an existing test":**

- `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`, `SUBSTRATE_LOOP_ID_FIELD_ENABLED` — do
  **not** deactivate any of these for unrelated reasons during the window. All three routes going
  dark mid-run would silently stall every subsequent cycle with a 503 the runner has no path to
  fix itself.
- `CANDIDATE_LEVEL_OUTCOMES` / `CYCLE_LEVEL_OUTCOMES` in
  `website/src/app/api/practice/watching/handler.ts`, and the matching database CHECKs — any
  further **widening** follows Mode 1's discipline exactly. Any **narrowing or renaming** of an
  existing value is far more dangerous mid-run than it would be otherwise (it could invalidate
  live rows or break the runner's own idempotency assumptions) — treat as Critical and confirm
  with the founder before touching, even if it looks like an unrelated cleanup.
- `credential 527cc86b-830b-4337-8fd7-ff28d9b0b5dc` (`sagereasoning:idea-loop@v1`) — do not revoke
  or modify its capabilities or limits without the founder's explicit direction. This is the real
  kill switch for the run; treat it with the same care as any other live credential.
- The request/response contracts of `/api/guardrail`, `/api/practice/fresh`, `/api/reason`,
  `/api/practice/watching` — a field rename, a stricter validation, or a response-shape change to
  any of these is a breaking change to a caller that cannot be patched mid-flight (the runner has
  no update mechanism; it is a fixed AI-agent session already running). If work in this window
  needs to touch one of these routes for unrelated reasons, **check first whether the change is
  additive-only** (the standing discipline this whole arc has followed) before proceeding, and name
  the runner explicitly as a live caller in the session's own risk assessment.
- `idea_loop_cycles` / `idea_loop_candidates` schema, RLS, or retention (`retain_until`) — the
  same additive-only discipline; a destructive migration here would be the worst possible timing.

**Everything else is ordinary build work — proceed normally.** The guardrails above are narrow and
specific, not a blanket freeze on this repo for a week.

---

## Mode 3 — the run has completed, compile the report

**Trigger:** the pre-conditions query above shows `completed_cycles` in the 20–40 range, and the
founder confirms the runner (from the scratch project) has handed back its own closing summary per
its session prompt's Part F — including its GS-ATRF-1/2 answer and any anomaly notes.

1. **Pull the real numbers from production — do not estimate or reconstruct from memory of this
   thread.** `GET /api/founder/watching?loop_id=sagereasoning:idea-loop@v1#001` (Bearer, founder
   JWT) already aggregates outcome and heuristic attribution per row; supplement with direct SQL
   for anything the dashboard doesn't surface (exact cost sums, timing distributions):
   ```sql
   SELECT cycle_outcome, count(*) FROM public.idea_loop_cycles
   WHERE loop_id = 'sagereasoning:idea-loop@v1#001' GROUP BY cycle_outcome;

   SELECT heuristic, cycle_outcome, count(*) FROM public.idea_loop_candidates c
   JOIN public.idea_loop_cycles y ON y.id = c.cycle_id
   WHERE y.loop_id = 'sagereasoning:idea-loop@v1#001'
   GROUP BY heuristic, cycle_outcome ORDER BY heuristic, cycle_outcome;

   SELECT sum(cost_cents), avg(cost_cents), avg(elapsed_ms) FROM public.idea_loop_cycles
   WHERE loop_id = 'sagereasoning:idea-loop@v1#001';
   ```
2. **Compile the brief §6 report shape, verbatim to the ruled text** (mentor-confirmed,
   `2026-08-09-mentor-consultation-generation-step-scope-rulings-verbatim.md` §2.9; also
   `2026-08-08-autonomous-loop-design-brief.md` line 156): *cycles run, outcome distribution,
   null-cycle rate, heuristic productivity (which heuristics' candidates ever win), cost per
   cycle, anomalies.*
3. **Fold in, not overwrite:** the runner's own anomaly notes and its GS-ATRF-1/2 answer (§D of the
   bounded-validation-run prompt) — these are the runner design's own account and belong in the
   report as such, not silently absorbed into the repo-side numbers.
4. **Name every deviation from the ruled shape honestly** — including the `not_selected` gap and
   fix itself (it is exactly the kind of "anomaly" the report format asks for), and including
   whether the client-timeout divergence on `ORIENTATION_DELIVERY_TIMEOUT_MS` (documented in
   `2026-08-10-runner-scoping.md` §3 — every winner consult classifies `observed`, not `examined`)
   showed up in the trust-event data as expected.
5. **File the report as a deliverable** in `operations/agent-circles-2026-08/`, append the
   decision-log entry, and **bring it to the mentor before any standing-runner design opens** —
   this is Q10/Q11's ruled gate, not a formality. Nothing in this session designs the standing
   runner; that is a later, separate, mentor-informed session.

### Mode 3.5 — a ruled-but-deferred fix, gated on cycle 4, not on the report

**Added 2026-08-11** (`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`): a production
contamination defect on `/api/reason` was found at the validation run's cycle 3, root-caused
(`getProjectContext('condensed')` called unconditionally at `route.ts:1409`, injecting unlabelled
`recent_decisions` content into every Layer 1 extraction), and fixed with a narrow, mentor-scoped
labelling change — live, verified, deployed. **The mentor separately RULED a larger architectural
fix: remove `projectContext` from API-key-authenticated `/api/reason` calls entirely** (an agent's
pure examination should rest on the proposal, the Stoic Brain, and the practitioner profile, not
the project's internal decision log). **This is adopted direction, not an open question — but it
is explicitly gated on cycle 4 completing cleanly under the labelling fix, not on the report
existing.** A session opening after cycle 4 is confirmed clean (not merely after the report is
filed) may pick this up as its own scoped build item. It should very likely also address
`practitionerContext`'s identical unlabelled defect (named, not fixed, at the labelling-fix
session) in the same change — that is that session's call, not pre-authorised here.

---

## What no session in this window does, regardless of mode

- **Does not design the standing runner.** The validation run's data is that design's input, and
  the report must reach the mentor first (Q10/Q11, ruled).
- **Does not fabricate report numbers or smooth over an anomaly** to make the run look cleaner
  than it was — an honest `terminated_by_timeout` or a higher-than-expected null-cycle rate is
  exactly the signal the report exists to surface.
- **Does not touch `target_circle`/blast-radius columns** — still named, not built (per
  `2026-08-10-runner-scoping.md` §5.4), unless the founder explicitly opens that as its own
  Critical migration session.
- **Does not treat "the runner hasn't written a blocking spec" as proof nothing is wrong.** The
  pre-conditions query is cheap; run it rather than assume silence means health.
- **The Q1 hard constraint holds throughout the whole window: the loop proposes; it never
  executes.** No session in this repo, in any mode, wires a proposal to an action-taking path.

---

## Open item carried into this prompt

**The `not_selected` fix performed in this session (2026-08-10, directly after the runner-scoping
close) has not yet had its own decision-log entry or been folded into a formal session close** —
it was executed inline, live-verified end-to-end (TEST + prod migration, code + battery pin,
mutation-verified, cycle-1 back-correction confirmed before and after), but the paperwork is owed.
**Whichever session opens next should append that record before doing anything else** — a short
Elevated-risk lean entry is sufficient (per the standing cache's lean template), citing this
prompt and the migration file `supabase-idea-loop-candidate-outcome-not-selected-migration.sql` as
the primary source.

## Rollback path

Nothing in this standing prompt itself is an action to roll back. Any Mode 1 fix carries its own
migration file with its own `§INVERSE` block — use that file's own rollback, not a generic one.
Mode 2's guardrails are advisory, not enforced by tooling — if something in this window is found to
have broken the runner despite them, the credential revoke
(`527cc86b-830b-4337-8fd7-ff28d9b0b5dc`) is the real stop, and the runner's own scratch-project
session should be told to halt.

## Forecast

Success across this window = the run reaches 20–40 completed cycles over its natural ~week course,
any blocking spec the runner writes gets resolved live (Mode 1) without the runner ever needing to
compromise its own scope boundary, ordinary build work in this repo proceeds without silently
breaking a live dependency (Mode 2), and the run closes with an honest, complete brief §6 report
reaching the mentor before any standing-runner design opens (Mode 3).

End of prompt.
