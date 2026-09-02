# Mentor question — how much continuity should the private mentor have? — FOR RULING

**Date drafted:** 2026-09-02. **Status:** DRAFT question, not yet relayed; **no ruling exists.**
**Origin:** `operations/handoffs/founder/2026-09-02-postgrest-row-cap-founder-hub-NEXT-SESSION-PROMPT.md` §5(c):
*"How much continuity should the mentor have? The 20-message window is a constant someone chose for
context management. Widening it is a one-line change and therefore tempting; it is also a decision
about what the project's governing advisory surface is able to remember, on a surface whose outputs
bind. Put it to the mentor. Do not widen the constant unilaterally as part of a bug fix."*
**PR20:** every present-tense mechanism fact below was read from the code in the session that
drafted this (HEAD `a32c4a2` plus that session's own fix); one fact is marked **unverified** because
it depends on a production environment variable a repo session cannot read. **The relaying session
must timestamp-check these facts again before relay** (PR20 as amended 2026-08-19).

---

## 1. The question

The private mentor (`/private-mentor`, served by `POST /api/founder/hub` with `agent: 'mentor'`)
answers each founder message with a fixed-size slice of the conversation as its working memory. The
size of that slice is a constant in code. The fix landed on 2026-09-02 made the slice CORRECT
(it had silently been pinned to a stale window for two days by the PostgREST row cap) but
deliberately left its SIZE exactly where it was.

**What the mentor is asked to rule on:** what continuity the mentor surface *should* have — not
which number is convenient. Concretely:

- (Q1) Is a fixed window of the most recent N raw messages the right *shape* of memory for a
  governing advisory surface whose rulings bind this project, or is the shape itself wrong
  (e.g. rulings should be re-supplied explicitly by the founder each time, as the verbatim records
  already do; or a running summary; or the profile/observation channels described in §3 should be
  the only long memory)?
- (Q2) If a fixed window is right, what should bound it — a message count, a token budget, a
  time span (e.g. the current session), or "everything since the last captured verbatim"?
- (Q3) Should the mentor be *told* what it cannot see? Today the mentor is not told that its
  history is windowed; it cannot distinguish "the founder never said that" from "that fell outside
  my window". The 2026-08-31 → 09-02 contamination (§4) happened precisely because it answered
  confidently from an incomplete window with no signal that it was incomplete.
- (Q4) Does a ruling produced while the mentor could not see its own immediately-preceding reply
  (the §4 case) require anything beyond the founder's reading of the verbatim — a re-affirmation, a
  note on the record, or nothing?

## 2. The mechanism the ruling will land on (one-sentence facts, PR20)

1. **The window is 20 RAW rows, of any role.** `MENTOR_HISTORY_WINDOW = 20` in
   `website/src/app/api/founder/hub/conversation-history.ts`; the route fetches the newest 20 rows
   of `founder_conversation_messages` for the conversation (descending, explicit limit, then
   reversed) and passes them to the model builder, which slices by the same constant.
2. **Not all 20 rows reach the model.** The builder (`route.ts`, `getPrimaryAgentResponse`) maps
   `role='founder'` → a user turn, `role='agent' AND agent_type === <this agent>` → an assistant
   turn, `role='observer'` → a user-side "[Observer — x]" note, and DROPS any agent row whose
   `agent_type` differs. On the private-mentor surface observer and other-agent rows are not written
   (the 2026-04-29 observer cull), so in practice the 20 rows are ~10 founder/mentor exchanges.
3. **The current message is passed separately and is never windowed** — it is appended after the
   history with the practitioner context and the project context (`getProjectContext('summary')`)
   attached to it.
4. **The mentor has OTHER memory channels that are independent of the window and were unaffected
   by the defect:** for `agent === 'mentor'` the route also injects (a) hub-scoped structured mentor
   observations (`getMentorObservationsWithParallelLog`), (b) profile snapshots
   (`getProfileSnapshots`), and (c) — only when the production env var `MENTOR_CONTEXT_V2` is
   `'true'` (**unverified from a repo session**) — recent-interaction signals over the last 7 days
   plus a persisted pattern-analysis block. Each of those loaders has its own `.limit()`. After
   every reply the route writes a `mentor_interactions` row whose `description` is the first 200
   characters of the founder's message, and may write one structured observation.
5. **Widening the window has a linear cost and no cache benefit.** The system prompt carries
   `cache_control: { type: 'ephemeral' }`; the history turns do not — every history message is
   re-sent as uncached input tokens on every reply (`model: 'claude-sonnet-4-6'`,
   `max_tokens: 4000`). A window of N rows costs roughly N × (mean message length) tokens per reply.
6. **The window is now correct for a thread of any length, and its size is test-pinned.** The
   regression test asserts `MENTOR_HISTORY_WINDOW === 20` so that any change appears as a deliberate
   test diff referencing a ruling, not as an incidental edit.
7. **The page shows the newest 200 messages with a "Load earlier messages" affordance** (keyset
   pagination); what the founder can *see* and what the mentor can *remember* are now two separate,
   both-explicit bounds.

## 3. What the mentor is NOT being asked

Not the row-cap defect (fixed, PR19-reviewed). Not the visible page size (a UI choice, the
founder's). Not whether to widen "a bit" — the prompt's instruction is that the number is downstream
of the shape, and the shape is the ruling.

## 4. The contamination window — a fact the ruling should know about, and a question for the founder

Every mentor reply from row 1001 of the founder's thread (2026-08-31 09:16) to 2026-09-02 was
generated against a window ending at row 1000 — so the mentor could not see anything said in between,
**including its own prior replies.** Two consequences, both recorded in
`D-FOUNDER-HUB-POSTGREST-ROW-CAP-FOUND-CONFIRMED-NOT-FIXED-2026-09-02` and flagged, not claimed:

- Row 1003 is the corrected ruling of 2026-08-31
  (`operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-questionB-and-A2b-verbatim.md`),
  generated without the mentor seeing row 1001 (its own ruling being corrected). Whether that
  mattered depends on how self-contained the founder's correction message (row 1002) was. **This is
  for the founder to settle from the verbatim; it is not a reason to presume the ruling invalid.**
- Rows 1004–1011 are a 2026-09-01 exchange of which the repo holds one verbatim
  (`2026-09-01-mentor-instruction-bidirectional-algorithm-verbatim.md`). A repo grep for the
  markers the prompt cites ("Rulings on Route A", "Route A2", "Grok") finds no other capture of that
  exchange — so the remainder is **uncaptured in the repo** as of 2026-09-02; whether it contained
  rulings is unknown from here and can only be read from the database rows themselves.

## 5. Options the ruling might land on (listed so their mechanism cost is visible; not a recommendation)

| Option | Mechanism change | Cost / risk |
|---|---|---|
| Keep 20 raw rows | none | the mentor keeps forgetting anything older than ~10 exchanges; no signal that it has |
| Widen to N (e.g. 60 / 100) | one constant + the test pin | linear uncached token cost; pushes the forgetting boundary, does not remove it |
| Token-budgeted window | fetch a larger bound, trim by tokens | same shape, better-behaved on long messages |
| Window + explicit disclosure to the mentor | a system-prompt line: "you see the last N of M messages" | cheap; addresses Q3 directly; the mentor can ask for what it lacks |
| Rely on the profile/observation channels + founder-supplied verbatims for anything binding | no window change; a practice rule | matches how binding rulings are already captured; makes the window's size less consequential |

**Nothing in this document changes code.** A ruling, once relayed and recorded verbatim, is the
input to whichever session then changes the constant or the shape.
