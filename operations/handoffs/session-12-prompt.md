# Session 12 — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/session-11-close.md` end to end.
That is the handoff. It tells you what was built, what was verified, what was deferred,
and what this session is expected to do. Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to this session's
scope (PR5). Two new entries were promoted at the end of session 11:
  (a) KG8 — Hub-Label Consistency Across Writer, Reader, and Client
  (b) KG9 — The /private-mentor Page Is a Façade Over /api/founder/hub

Both are relevant to every option below. Read them before designing any change.

---

## Direction decision (do this first, before any work)

Session 11 closed with R3 Verified on both write paths (/api/founder/hub and
/api/mentor/private/reflect). The Recent Interaction Signals "Impression
presented" line now shows a validated third-person observation on substantive
interactions — not the proximity fallback.

Four plausible next moves remain on the table. Three are carry-overs from
session 10's deferred list; one is new from session 11. Present them to the
founder with trade-offs and wait for the founder's choice. Do not prescribe.

**Option 1 — R1 extension (Option 2 from session 11 prompt).**
Apply the hub-id-from-request pattern to `/api/mentor/private/reflect` and
`/api/mentor/private/baseline-response`. Both currently hardcode
`'private-mentor'`, which matches the reader post-R1 — so this is hygiene
against future drift, not correction. Risk under 0d-ii: Standard. Small scope.
PR1 consideration: prove on one endpoint first. Verification method: post an
evening reflection via /private-mentor, SQL check hub_id on the inserted row.
Relevant knowledge gaps: KG8 (hub-label consistency).

**Option 2 — Option A cleanup (Option 3 from session 11 prompt).**
Remove the `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781` so
arrays pass to Supabase directly (JSONB accepts arrays natively). The
reader's defensive parse added in session 10 stays as backstop or is removed
for tidiness.

Risk under 0d-ii: Elevated. Writer-side change with unknown reader fan-out on
`passions_detected`. Before proposing a fix, enumerate every reader of that
column. PR1 consideration: prove one write → one read cycle before removing
anywhere else. Verification method: submit a fresh evening reflection via
/private-mentor, ask the mentor to quote the Pattern match line (expected:
same format as session 10, e.g. `agonia (phobos, freq 5)`). Also SQL check
that `jsonb_typeof(passions_detected) = 'array'` on the newest row.
Relevant knowledge gaps: session-10's first-observation candidate
("Storage format vs payload shape — JSONB columns can hold a JSON-encoded
string scalar that looks like an array but fails Array.isArray").

**Option 3 — Line 445 review (Option 4 from session 11 prompt).**
`/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')`
was deliberately left unchanged in session 10 per that prompt's exact-steps
list. Review whether it should also be mapped via `mapRequestHubToContextHub`
or whether profile snapshots are intentionally hub-scoped to 'founder-mentor'.
Probably ~10-minute review + small fix if needed. Risk under 0d-ii: Standard.
Relevant knowledge gaps: KG8 (hub-label consistency).

**Option 4 — R3 CHECK constraint backstop (NEW from session 11).**
Add a Postgres CHECK constraint to `mentor_interactions.mentor_observation`
enforcing `char_length <= 500`. Schema-level backstop against any future
regression that bypasses the R3 code-comment guardrail (i.e., any future
writer that puts raw LLM text into that column). Risk under 0d-ii: Standard.
Touches schema — requires a migration file and a Supabase run. PR1
consideration: single SQL statement, no surface to roll out. Verification
method: after migration, attempt an INSERT with a 1000-char observation
string via Supabase SQL editor — expected to fail with a CHECK violation.
Then confirm a valid 400-char string still inserts. Relevant knowledge gaps:
none specifically, but KG8 and KG9 apply to any mentor_interactions change.

Present all four with scope, risk, PR1 consideration, and verification
method. Wait for the founder to choose. The founder decides direction and scope.

---

## Primary task (default if the founder says "proceed with the default")

If the founder expresses no preference: default to **Option 1 (R1 extension)**.
Reasoning: it's the smallest-scope carry-over, it's the natural completion of
the R1 family from session 10, and Standard risk keeps momentum. Option 3
(line 445) is also small and Standard — a reasonable alternative default if
the founder prefers clearing an open question over extending a fix.

If the founder picks a different option, follow the spec laid out for it in
the direction-decision step above.

---

## Scope (bounded)

**In scope — whichever option is chosen:**
- Exactly the one option the founder picks.
- Live verification per the method listed for that option.
- Session close with a handoff note at `operations/handoffs/session-12-close.md`.

**Out of scope — do not expand:**
- The three options the founder did not pick (carry forward as Deferred in the
  close handoff if not yet deferred; carry the posture forward).
- Any auth / session / cookie / deploy-config change. If one appears, stop
  and apply 0c-ii Critical Change Protocol before touching it.
- Mentor memory architecture ADR. Still unscoped.
- Journal scoring page (session 8 carry-over, Option A/B/C decision).
- Archival of pre-2026-04-13 contaminated rows (inert after R1, less urgent
  post-R3 as they fall out of the recent window naturally).
- UX work on /private-mentor ("Start new conversation" control;
  comments-field persistence). Logged as observations in session 10.
- Surfacing morning check-in / weekly mirror / weekly questions /
  daily reflections / action scoring into mentor context. All blocked on
  the memory ADR.

If you notice something else that should change, flag it with "I'd push back
on this" or "this is a limitation" — don't silently expand the work.

---

## How to proceed

**Step 1 — Read and align.**
Read `operations/handoffs/session-11-close.md`. Note the 0a status vocabulary:
R1, R2, and R3 are all Verified. The reader-side defensive parse in
`website/src/lib/context/mentor-context-private.ts` (~lines 666–708) remains
as the current line of defence for malformed storage of `passions_detected`.
If Option 2 is chosen, that defensive parse stays or goes — founder's call
after the change is verified.

**Step 2 — Direction decision.**
Present the four options with trade-offs to the founder. Wait for the choice.

**Step 3 — Apply PR1.**
Whichever option is chosen, prove it on a single endpoint / single write path
before extending anywhere else. Verify live before extending. Option 3 (line
445) and Option 4 (CHECK constraint) are naturally single-change — PR1 is
trivially satisfied. Option 1 (R1 extension) has two endpoints — prove on
reflect first, then baseline-response. Option 2 (Option A cleanup) is a
single writer-side change but requires a reader-side audit first.

**Step 4 — Apply PR2.**
Verification in-session. Do not close the session with "it should work" — the
founder verifies live per the method listed for the chosen option.

**Step 5 — Apply 0c-ii if anything touches a Critical surface.**
No Critical change is expected for any of the four options. Option 4 touches
schema via a migration — still Standard under 0d-ii (not auth/session/cookie/
deploy). But flag immediately if the scope reveals a Critical touchpoint.

**Step 6 — Close the session.**
Handoff note at `operations/handoffs/session-12-close.md` in the same format
as session-11. Promote knowledge-gap candidates to `operations/knowledge-gaps.md`
per PR5 if a third re-encounter occurred. The two session-11 first-observation
candidates to watch for re-encounter:
  - "A function's parameter may already accept a value that's been
     deliberately omitted by callers. Before extending the function signature,
     check whether the parameter already exists." (session 11)
  - "Storage format vs payload shape — JSONB columns can hold a JSON-encoded
     string scalar that looks like an array but fails Array.isArray." (session 10)

---

## Option-specific implementation hints

### If Option 1 (R1 extension) is chosen

- Files:
  - `website/src/app/api/mentor/private/reflect/route.ts` — currently calls
    `logMentorObservation(..., 'private-mentor')` as a hardcoded third arg,
    and passes `'private-mentor'` as 5th arg to `updateProfileFromReflection`.
  - `website/src/app/api/mentor/private/baseline-response/route.ts` — check
    whether it writes to `mentor_interactions` at all. Session-10 close noted
    it only had a comment reference, no actual `logMentorObservation` call.
    May be inert wrt R1.
- Three structural choices for each endpoint:
  - (a) Accept `hub_id` from the client request body. Requires client update.
  - (b) Keep hardcoded `'private-mentor'` but route through a helper for
    consistency and to surface the hardcode via code review.
  - (c) Leave alone and just document the pattern for future endpoints.
- Recommendation: (b) — minimum surface change, preserves current behaviour,
  makes drift visible on future refactor.
- PR1: prove on `/api/mentor/private/reflect` first (more traffic via
  evening reflections). Verify live before extending to baseline-response.
- Verification method: post one evening reflection via /private-mentor.
  SQL check: `SELECT hub_id FROM mentor_interactions ORDER BY created_at
  DESC LIMIT 1;` — expected: `'private-mentor'`. Confirm mentor Recent
  Interaction Signals shows the new row.

### If Option 2 (Option A cleanup) is chosen

- Before any code change: run a codebase search for every reader of
  `mentor_interactions.passions_detected`. At minimum:
  - `website/src/lib/context/mentor-context-private.ts` (`rowToSignal`)
  - Any batch analytics jobs, exports, or data migration scripts
  - Any other mentor-context assembler
- For each reader: confirm it either handles both shapes (string-encoded and
  native array) or will continue to work after the stringify is removed.
- Then remove `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781`.
- PR1: prove one write → one read cycle succeeds before removing anywhere
  else. The session-10 reader-side defensive parse already handles both
  forms, so this change should be backwards-compatible — but that's what
  needs proving.
- Verification method: submit a fresh evening reflection via /private-mentor,
  then ask the mentor to quote the Pattern match line (expected format e.g.
  `agonia (phobos, freq 5)`). Also SQL check:
  `SELECT jsonb_typeof(passions_detected) FROM mentor_interactions ORDER BY
  created_at DESC LIMIT 1;` — expected: `'array'` (not `'string'`).
- After verification: the reader's defensive `typeof parsed === 'string'`
  branch can either stay (backstop) or be removed. Founder's call.

### If Option 3 (line 445 review) is chosen

- Read `website/src/app/api/founder/hub/route.ts` around line 445 and the
  `getProfileSnapshots` function it calls.
- Determine: does `getProfileSnapshots` look up records keyed by hub label,
  or is `'founder-mentor'` a different kind of scope (e.g. document type)?
- If it's a hub-label hardcode equivalent to the ones fixed in R1: map it
  via `mapRequestHubToContextHub(effectiveHubId)`.
- If it's a semantic scope (not a hub label): leave it, document why, close
  the question.
- Verification method: depends on what the review finds. If a change is
  made, use the same /private-mentor chat-probe technique as R1 — post one
  chat message, confirm profile snapshots section of mentor context updates
  for the correct hub.

### If Option 4 (R3 CHECK constraint backstop) is chosen

- Create a new migration file in `supabase/migrations/`, following the
  naming pattern of existing files (e.g.,
  `20260419_r3_mentor_observation_check.sql`).
- Migration content (approximate):
  ```sql
  ALTER TABLE mentor_interactions
    ADD CONSTRAINT mentor_observation_length_check
    CHECK (mentor_observation IS NULL OR char_length(mentor_observation) <= 500);
  ```
- Check that no pre-R3 contaminated rows exceed 500 chars — if any do, the
  migration will fail. Run this check first:
  `SELECT COUNT(*) FROM mentor_interactions WHERE char_length(mentor_observation) > 500;`
- If the count is >0: decide whether to truncate, null-out, or raise the
  limit. Session-10 close noted 10 contaminated rows on founder-mentor hub
  and 1 on private-mentor hub — check their lengths before running the
  migration.
- Apply the migration via Supabase SQL editor or the standard project
  migration flow (founder to confirm the flow — this hasn't been exercised
  this session).
- Verification method:
  1. After migration, run: `INSERT INTO mentor_interactions (profile_id,
     hub_id, interaction_type, description, mentor_observation) VALUES
     ('<any valid profile_id>', 'private-mentor', 'conversation', 'test',
     repeat('x', 600));` — expected: CHECK constraint violation error.
  2. Then: same INSERT with `repeat('x', 400)` — expected: success.
  3. Delete the test row.
  4. Submit a real evening reflection via /private-mentor to confirm the
     normal write path still works end-to-end.
- Limitation: any future writer that somehow bypasses the code-comment
  guardrail and attempts to write a raw 1000-char LLM response will now
  fail loudly (CHECK violation in server logs) rather than silently
  contaminate the column. This is the intended behaviour.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths, exact
  commands, exact copy-paste text. "Vercel Green" is the type-check — say
  "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If the direction decision surfaces a bigger
  structural problem, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. Safety-critical
  changes (none expected here, but flag if one appears) are always Critical
  (PR6).
- Deferred decisions go in the close handoff's Deferred section with
  reasoning (PR7). Don't drop them silently.
- Manual verification method per work type (0c) — the founder verifies by
  using /private-mentor (or Supabase SQL editor for Option 4), not by
  reading TypeScript. Provide the exact chat prompt or SQL to use and the
  exact expected output pattern.
- Close the session with a handoff note at
  `operations/handoffs/session-12-close.md` in the same format as session 11.

---

## Success for this session

The option the founder picked is implemented, verified live, and the
verification step produced the expected output.

If the option completes before session-end and time remains: ask the founder
whether to pick a second option for the same session (violates PR1 if
bundling, but fine sequentially after the first is Verified), or whether to
close early with the remaining options queued.

If only the diagnosis / scope exploration completes and the fix is queued
for session 13, that's acceptable — a clean scope with founder-approved
direction is worth more than a rushed fix.

Do not overstep.
```
