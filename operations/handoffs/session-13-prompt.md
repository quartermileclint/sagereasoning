# Session 13 — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/session-12-close.md` end to end.
That is the handoff. It tells you what was built, what was Verified, what was Wired
(Path A), what was Deferred, and what this session is expected to do. Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to this session's
scope (PR5). The relevant entries are:
  (a) KG8 — Hub-Label Consistency Across Writer, Reader, and Client
  (b) KG9 — The /private-mentor Page Is a Façade Over /api/founder/hub
Session 10's first-observation candidate about JSONB storage format is also
directly relevant to this session — it is the bug being fixed. A third
re-encounter in session 13 promotes it to a KG per PR5.

---

## Primary task for this session

**Option 2 — remove the JSON.stringify wrap on passions_detected at
`sage-mentor/profile-store.ts:781`.**

This is the only task queued for session 13. The reader audit was completed at
the end of session 12 and is recorded in `session-12-close.md` under
"Next Session Should → Reader audit — record of findings". Re-read that
section before executing. Do not re-run the audit — it's done.

**Audit conclusion (copied forward so you don't have to hunt for it):**

One writer:
- `sage-mentor/profile-store.ts:781` — `passions_detected: JSON.stringify(interaction.passions_detected || []),`

Four reader sites:
1. `sage-mentor/profile-store.ts:911–913` — `computeRollingWindow`.
   Defensive typeof/JSON.parse. Safe after writer fix.
2. `website/src/lib/context/mentor-context-private.ts:679–686` —
   `rowToSignal` "Likely assent" line. Defensive typeof/JSON.parse with
   try/catch. The comment at lines 668–675 explicitly commits to keeping
   this defensive parse as a backstop even after the writer fix lands.
3. `website/src/app/api/mentor/founder/history/route.ts:57` — raw select,
   pass-through to JSON response. No server-side parsing. No current client
   consumer.
4. `website/src/app/api/mentor/private/history/route.ts:57` — same as
   above, private-mentor hub.

**Conclusion: safe to remove.** PR1 trivially satisfied (single writer).

---

## Risk classification

Option 2 is **Elevated** under 0d-ii:
- It changes existing user-facing functionality (mentor context assembly reads
  this column, Recent Interaction Signals renders from it).
- Rollback is a single-token revert.
- No auth / session / cookie / deploy-config touched.

Apply the Elevated protocol: name what could break (reader parses a malformed
array and returns empty, causing the "Pattern match" line to show "—"),
provide rollback plan (revert the single line in profile-store.ts, push, Vercel
Green), provide verification step (below). Approval from founder before
deployment.

---

## Execution plan

**Step 1 — Read and align.**
Read `operations/handoffs/session-12-close.md`. Note the 0a statuses at session
end: Option 1 reflect = Verified; Option 1 baseline-response = Wired (Path A);
Option 3 line 466 = Wired (Path A); Option 4 CHECK constraint = Verified.
Option 2 reader audit = Designed.

**Step 2 — Confirm scope with founder.**
Restate the plan: one-line change at `sage-mentor/profile-store.ts:781`, push,
Vercel Green, live verification via fresh evening reflection + Supabase SQL
check on the latest row. Ask for founder approval before editing. Classify as
Elevated per 0d-ii.

**Step 3 — Apply the fix.**
Change line 781 from:
  `passions_detected: JSON.stringify(interaction.passions_detected || []),`
to:
  `passions_detected: interaction.passions_detected || [],`

If founder wants audit trail in-line, add a short comment above the line
referencing session-13-close.md and KG8/KG9 (the session-12 close mentions this
as optional — founder's call).

**Step 4 — Push and deploy.**
Founder commits and pushes via GitHub Desktop. Suggested commit message:
  "Option 2: stop JSON.stringify-wrapping passions_detected at write site"
Wait for Vercel Green.

**Step 5 — Live verification (per PR2, in-session).**

5a. Founder submits a fresh evening reflection via `/private-mentor`. Provide
    exact verbatim wording so the reflect pipeline produces a structured
    observation with at least one detected passion. Example (adapt for
    novelty vs session-12 test rows):

    > "Today I found myself drafting a long reply to an email that had mildly
    > annoyed me. I noticed the irritation, named it as proto-passion, and
    > deleted the draft. I replied an hour later with three sentences. The
    > original grievance had dissolved; the rehearsal had been doing the
    > work of keeping it alive."

    Give the founder the exact text to paste. Do not improvise.

5b. Supabase SQL editor, run:
    ```sql
    SELECT
      id,
      created_at,
      jsonb_typeof(passions_detected) AS passions_type,
      passions_detected
    FROM mentor_interactions
    WHERE hub_id = 'private-mentor'
      AND interaction_type = 'evening_reflection'
    ORDER BY created_at DESC
    LIMIT 1;
    ```

    Expected:
    - `passions_type = 'array'` (not `'string'`).
    - `passions_detected` renders as a JSON array of passion objects with
      `root_passion` / `sub_species` / `false_judgement` keys, NOT as a
      quoted string.

5c. Chat probe. Founder asks the mentor:
    > "Quote the Pattern match line from the most recent evening reflection
    > entry in Recent interaction signals."

    Expected response format: `<sub_species> (<root_passion>, freq N)` or
    `<root_passion> (not in profile passion map yet)`. Either format
    confirms the rolling-window aggregator parsed the new JSONB array
    successfully.

**Step 6 — Mark Verified.**
If 5b and 5c both pass, mark Option 2 as Verified under 0a. If either fails,
revert the single line change, push, re-verify to known-good state, classify
the session close.

---

## Post-fix defensive-reader disposition

**Recommended posture: keep both defensive readers.**
- `sage-mentor/profile-store.ts:911–913`
- `website/src/lib/context/mentor-context-private.ts:679–686`

Reasoning: zero cost on the clean path, catches mixed historical rows
(there are contaminated rows dating back to 2026-04-12 that will stay in the
table until naturally aged out of the rolling window). The comment at
mentor-context-private.ts:668–675 already commits to this.

Do not remove the defensive readers unless the founder explicitly decides to.
The session-12-close handoff flagged this as an Open Question — confirm with
founder post-Verified, but default to "keep".

---

## Scope (bounded)

**In scope:**
- One-line change at `sage-mentor/profile-store.ts:781`.
- Commit, push, Vercel Green.
- Live verification per Step 5.
- Session close at `operations/handoffs/session-13-close.md`.

**Out of scope — do not expand:**
- Any auth / session / cookie / deploy-config change. If one appears, stop
  and apply 0c-ii Critical Change Protocol.
- Removing the defensive readers (defer to Open Question in session 13 close).
- Retroactive migration of contaminated pre-2026-04-13 rows (logged in session
  10 and 12 close handoffs; let them age out).
- Mentor memory architecture ADR. Still unscoped.
- Journal scoring page (session 8 carry-over, Option A/B/C decision).
- UX work on /private-mentor ("Start new conversation" control;
  comments-field persistence).
- Morning check-in / weekly mirror / weekly questions / daily reflections /
  action scoring surfacing into mentor context. Blocked on memory ADR.
- Full live verification of Session 12's Wired (Path A) items
  (baseline-response R1 extension; line 466 fix). These are zero-risk hygiene
  edits and will be Verified organically.

If you notice something else that should change, flag it with "I'd push back
on this" or "this is a limitation" — don't silently expand the work.

---

## How to proceed

**Step A — Read session-12-close.md in full.** Pay attention to:
- What was Verified vs Wired (Path A).
- The reader-audit record (copied above for convenience, but the canonical
  version is in session-12-close).
- The knowledge-gap carry-forward list (Session 10's JSONB-storage-format
  candidate is about to hit its third observation — promote if triggered).

**Step B — Confirm scope with founder.** Restate Option 2 plan. Wait.

**Step C — Apply fix, push, Vercel Green.**

**Step D — Live verification per Step 5 above.** Provide exact verbatim test
reflection text. Provide exact SQL. Provide exact chat probe.

**Step E — Mark Verified under 0a.** Update task list. Update status.

**Step F — Ask founder whether to continue with follow-ups** (there are none
queued; options include: start the mentor memory architecture ADR, drafting
something on journal scoring page decision, doing light operational maintenance
like reviewing the knowledge-gap register, or closing early).

**Step G — Close the session.** Handoff note at
`operations/handoffs/session-13-close.md` in the same format as session-12.
Promote any knowledge-gap candidate that hit three observations (likely
candidate: JSONB storage format / Array.isArray).

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths, exact
  commands, exact copy-paste text. "Vercel Green" is the type-check — say
  "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If Step 5 reveals a bigger structural problem, say so
  once clearly, then wait.
- Classify every code change under 0d-ii before execution. Option 2 is
  Elevated. State that, name rollback, get approval before deploy.
- Deferred decisions go in the close handoff's Deferred section with
  reasoning (PR7). Don't drop them silently.
- Manual verification method per work type (0c) — founder verifies by using
  /private-mentor and Supabase SQL editor, not by reading TypeScript.
- Always give the exact wording of reflection tests (founder preference,
  restated multiple times across sessions 10–12). Never say "post a test
  reflection" — give verbatim copy-paste text.

---

## Success for this session

Option 2 is Verified. The single-line change at
`sage-mentor/profile-store.ts:781` is live, Vercel Green, and the latest
evening reflection row has `jsonb_typeof(passions_detected) = 'array'` (not
`'string'`). The mentor correctly quotes the Pattern match line from the
Recent Interaction Signals entry.

If verification fails: revert cleanly, document what broke, close the session.
Do not iterate under time pressure.

If verification succeeds before session end and time remains: ask the founder
whether to continue or close. Do not prescribe additional work.
```
