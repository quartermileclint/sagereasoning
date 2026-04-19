# Session 11 — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/session-10-close.md` end to end.
That is the handoff. It tells you what was built, what was verified, what was deferred,
and what this session is expected to do. Do not skip it.

Then scan `operations/knowledge-gaps.md` if it exists, for any concept relevant to
this session's scope (PR5). Also note the two session-9 knowledge-gap candidates
that each earned a second observation in session 10 — one more re-encounter and
both promote:
  (a) hub-label inconsistency between conversation shell, mentor context, and logger writes
  (b) /private-mentor page is a façade over /api/founder/hub with hub_id: 'private-mentor',
      not over /api/mentor/private/reflect

---

## Direction decision (do this first, before any work)

Session 10 closed with R1 + R2 Verified on /api/founder/hub. Four plausible next
moves exist. Present them to the founder with trade-offs and wait for the
founder's choice. Do not prescribe.

**Option 1 — R3 (originally queued from session 9).**
Populate `mentor_interactions.mentor_observation` with validated structured
observation text at reflect-write time so the mentor's "Impression presented"
line stops showing the proximity fallback (`acted at <proximity> proximity`)
and instead shows the third-person observation. Detail in session-9 close,
lines 70–95. Risk under 0d-ii: Standard. Re-opens a previously-deprecated
column to writes — code-comment guardrail required.

**Option 2 — R1 extension.**
Apply the hub-id-from-request pattern to `/api/mentor/private/reflect` and
`/api/mentor/private/baseline-response`. Currently inert wrt the R1 bug
(both hardcode `'private-mentor'`, which matches the reader post-R1) —
extension is hygiene against future drift, not correction. Risk: Standard.
Small scope.

**Option 3 — Option A cleanup.**
Remove the `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781` so
arrays are passed to Supabase directly (JSONB accepts arrays natively). The
reader's defensive parse (added in session 10) stays in place as backstop
or is removed for tidiness. Risk: Elevated. Writer-side change, unknown
reader fan-out on `passions_detected`. Before proposing a fix, enumerate
every reader of that column.

**Option 4 — Open question on line 445.**
`/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')`
was deliberately left unchanged in session 10 per the prompt's exact-steps
list. Review whether it should also be mapped via `mapRequestHubToContextHub`
or whether profile snapshots are intentionally hub-scoped to 'founder-mentor'.
Probably 10-minute review + small fix if needed. Risk: Standard.

Present all four with scope, risk, PR1 consideration, and verification method.
Wait for the founder to choose. The founder decides direction and scope.

---

## Primary task (default if the founder says "proceed with the default")

If the founder expresses no preference: default to **Option 1 (R3)**. R3 is
the work that has been explicitly queued since session 8 and is the natural
sequel to R1 + R2. The session-9 close has detailed specification for R3 at
lines 70–95 — use it as the working brief.

If the founder picks a different option, follow the spec you laid out for it
in the direction-decision step above.

---

## Scope (bounded)

**In scope — whichever option is chosen:**
- Exactly the one option the founder picks.
- Live verification on `/private-mentor` chat after the fix deploys.
- Session close with a handoff note.

**Out of scope — do not expand:**
- The three options the founder did not pick (log them as Deferred in the
  close handoff if not yet deferred; carry the posture forward).
- Any auth / session / cookie / deploy-config change. If one appears, stop
  and apply 0c-ii Critical Change Protocol before touching it.
- Mentor memory architecture ADR. Still unscoped.
- Journal scoring page (session 8 carry-over, Option A/B/C decision).
- Archival of pre-2026-04-13 contaminated rows (inert after R1).
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
Read `operations/handoffs/session-10-close.md`. Note the 0a status vocabulary:
R1 and R2 are both Verified. The reader-side defensive parse in
`website/src/lib/context/mentor-context-private.ts` (~lines 666–708) is the
current line of defence for malformed storage of `passions_detected`.

**Step 2 — Direction decision.**
Present the four options with trade-offs to the founder. Wait for the choice.

**Step 3 — Apply PR1.**
Whichever option is chosen, prove it on a single endpoint / single write path
before extending anywhere else. Verify live before extending.

**Step 4 — Apply PR2.**
Verification in-session. Do not close the session with "it should work" — the
founder verifies by using `/private-mentor` chat with a specific prompt, and
the mentor's output is what counts.

**Step 5 — Apply 0c-ii if anything touches a Critical surface.**
No Critical change is expected for Options 1, 2, or 4. Option 3 is writer-side
only and does not touch auth/session/cookie/deploy — so Elevated, not Critical.
But flag immediately if the scope reveals a Critical touchpoint.

**Step 6 — Close the session.**
Handoff note at `operations/handoffs/session-11-close.md` in the same format
as session-10. Promote knowledge-gap candidates to `operations/knowledge-gaps.md`
per PR5 if a third re-encounter occurred.

---

## Option-specific implementation hints

### If Option 1 (R3) is chosen

- Session-9 close, lines 70–95, is the working spec. Two write paths affected:
  - `website/src/app/api/mentor/private/reflect/route.ts` — after
    `logMentorObservation` succeeds, UPDATE the most-recent `mentor_interactions`
    row for the same profile + evening_reflection type with
    `mentor_observation = structuredObs.observation`.
  - `website/src/app/api/founder/hub/route.ts` — same pattern for the
    `recordInteraction` call at ~line 1195: after the Haiku-extracted
    observation is logged to `mentor_observations_structured`, also patch it
    onto the matching `mentor_interactions` row.
- Cleaner approach: extend `recordInteraction` in `sage-mentor/profile-store.ts`
  to return the inserted row id so the caller can UPDATE by id (not by
  created_at DESC LIMIT 1).
- Required code comment at every write site:
  "mentor_observation is written only from validated mentor_observations_structured content —
   never raw LLM text. See R3, session 11."
- PR1: prove on the `/api/founder/hub` write path first (the endpoint already
  in place post-R1). Verify live before extending to the reflect endpoint.
- Verification method: open `/private-mentor` chat, ask
  "Quote the Impression presented line from the most recent Recent interaction
   signals entry." Expected: a third-person observation sentence matching the
  structured_observation content of that reflection (also visible on
  `/reflections` via the Copy-for-mentor export). If it reads
  `acted at <proximity> proximity` or `—`, R3 didn't land.
- Limitation flag: R3 re-opens the column that was the source of the April-12
  contamination. Code comments are the only guardrail. Consider a CHECK
  constraint (`char_length <= 500`) as a backstop.

### If Option 2 (R1 extension) is chosen

- Apply `mapRequestHubToContextHub` equivalent at:
  - `website/src/app/api/mentor/private/reflect/route.ts`
  - `website/src/app/api/mentor/private/baseline-response/route.ts`
- Since those endpoints don't currently accept `hub_id` from the request body,
  the "extension" may be structural: decide whether to (a) accept hub_id from
  the client, (b) keep hardcoded `'private-mentor'` but route through the same
  helper for consistency, or (c) leave alone and just document the pattern for
  future endpoints.
- PR1: prove on one endpoint first. Verify live before extending to the other.
- Verification method: post one evening reflection via `/private-mentor`,
  confirm on `/private-mentor` chat that the new row appears in Recent
  Interaction Signals with correct hub_id. SQL check for hub_id on the
  inserted row is cleanest.

### If Option 3 (Option A cleanup) is chosen

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
  forms, so this change should be backwards-compatible.
- Verification method: submit a fresh evening reflection via `/private-mentor`,
  then ask the mentor to quote the Pattern match line. Should read the same
  as session 10 (e.g. `agonia (phobos, freq 5)`). Also SQL check that
  `jsonb_typeof(passions_detected) = 'array'` on the newest row.
- After verification: the reader's defensive `typeof parsed === 'string'`
  branch can either stay (backstop) or be removed. Founder's call.

### If Option 4 (line-445 review) is chosen

- Read `website/src/app/api/founder/hub/route.ts` around line 445 and the
  `getProfileSnapshots` function it calls.
- Determine: does `getProfileSnapshots` look up records keyed by hub label,
  or is `'founder-mentor'` a different kind of scope (e.g. document type)?
- If it's a hub-label hardcode equivalent to the ones fixed in R1: map it via
  `mapRequestHubToContextHub(effectiveHubId)`.
- If it's a semantic scope (not a hub label): leave it, document why, close
  the question.
- Verification method: depends on what the review finds. If a change is made,
  use the same `/private-mentor` chat-probe technique as R1.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths, exact
  commands, exact copy-paste text.
- Founder decides scope. If the direction decision surfaces a bigger structural
  problem, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. Safety-critical
  changes (none expected here, but flag if one appears) are always Critical (PR6).
- Deferred decisions go in the close handoff's Deferred section with reasoning
  (PR7). Don't drop them silently.
- Manual verification method per work type (0c) — the founder verifies by using
  `/private-mentor`, not by reading TypeScript. Provide the exact chat prompt to
  use and the exact expected output pattern.
- Close the session with a handoff note at `operations/handoffs/session-11-close.md`
  in the same format as session 10.

---

## Success for this session

The option the founder picked is implemented, verified live, and the
verification step produced the expected output in `/private-mentor` chat.

If the option completes before session-end and time remains: ask the founder
whether to pick a second option for the same session (violates PR1 if
bundling, but fine sequentially after the first is Verified), or whether to
close early with the remaining options queued.

If only the diagnosis / scope exploration completes and the fix is queued
for session 12, that's acceptable — a clean scope with founder-approved
direction is worth more than a rushed fix.

Do not overstep.
```

---

## Why this prompt exists (not part of the paste)

Session 10 closed with R1 + R2 Verified and four plausible next moves. Rather
than picking for the founder, this prompt surfaces the four options with
trade-offs and asks the founder to decide first — consistent with the
founder's stated preference ("I decide direction and scope. You surface
options, constraints, and risks. Present choices with reasoning — not
prescriptions.").

Default is R3 because it was explicitly queued in session 9's close and is
the natural sequel to R1 + R2. But the other three options are each
self-contained, low-risk, and could reasonably go first.

PR1 remains the operative discipline: whichever option is chosen, prove on
a single path before extending.
