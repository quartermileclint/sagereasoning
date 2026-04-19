# Session 14 — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/session-13-close.md` end to end.
That is the handoff. It tells you what was Verified in Session 13 (Option 2 —
JSON.stringify wrap removed at sage-mentor/profile-store.ts:781), what was
promoted (KG10 — JSONB Storage Format vs Payload Shape), what is still Deferred,
what Open Questions remain, and what the menu of options is for this session.
Do not skip it.

Then scan `operations/knowledge-gaps.md` for any concept relevant to this
session's scope (PR5). Relevant entries by default:
  (a) KG8 — Hub-Label Consistency Across Writer, Reader, and Client (if touching
      any mentor_interactions read/write path).
  (b) KG9 — The /private-mentor Page Is a Façade Over /api/founder/hub (if
      touching any private-mentor surface).
  (c) KG10 — JSONB Storage Format vs Payload Shape (if touching any JSONB
      column write or read). Newly promoted at Session 13 close.

---

## Primary task for this session

**There is no single queued task.** Session 13 closed cleanly after Option 2
was Verified. Founder picks scope at session open.

The menu (from session-13-close Next Session Should), with reasoning — present
as options with constraints, not as prescriptions:

1. **Defensive-reader disposition follow-up.** Five-minute decision. Both
   defensive JSON.parse sites at sage-mentor/profile-store.ts:911–913 and
   website/src/lib/context/mentor-context-private.ts:679–686 were kept at
   Session 13 close as backstops for legacy stringified rows. Default
   recommendation is to leave them in place until contaminated pre-2026-04-13
   rows age out of the rolling window (estimated 4–8 weeks at current cadence).
   Closes one Open Question either way. Zero or one-line-per-file code change.

2. **Mentor memory architecture ADR (scoping conversation).** Highest unlock
   value. Currently blocks morning check-in, weekly mirror, journal-question
   surfacing into mentor context, and several P0 items. No draft exists yet.
   This is a scoping conversation, not a coding session. Cost: half a session
   or more, depending on depth.

3. **Journal scoring page — Option A/B/C decision (scoping conversation).**
   Session 8 carry-over. No progress since Session 8. Unblocks journal-scoring
   UI work. Scoping conversation, not coding.

4. **Public writer-path silent-swallow audit.** `/api/reflect`, `/api/score`,
   baseline-assessment writer paths still have the silent-swallow pattern
   unverified. Same shape as the Option 2 audit — a single-day-of-work item
   if scoped tightly. Good fit if founder has appetite for another clean
   hygiene sweep.

5. **Operational maintenance.** Supabase migration runner doc (F-series
   finding from Session 12), knowledge-gaps register review, decision-log
   audit. Low risk, low value-creation, tidy-up only.

6. **/private-mentor UX hygiene.** "Start new conversation" control and the
   comments-field persistence bug. Non-blocking UX, low risk.

7. **Something else.** Founder may have something in mind outside the
   deferred list.

**Recommended starting question:** open with option 1 (defensive-reader
disposition) as a five-minute decision to close one Open Question, then move
to whichever of 2, 3, 4, 5, 6 founder has appetite for. Option 2 (mentor
memory architecture ADR) is the single highest-leverage option available and
is the author's recommended follow-up if founder has a full session of
appetite for a scoping conversation.

Do not execute any option without explicit founder approval of scope and
classification. Restate the plan, classify under 0d-ii, and wait for "proceed".

---

## Open Questions brought forward from Session 13

- **Defensive-reader disposition.** Keep both (default) or remove now that
  Option 2 is Verified. Contaminated legacy rows would then surface as empty
  arrays at the reader — acceptable if founder decides legacy data is no
  longer worth preserving in the rolling window.
- **Mentor interpretive richness on chat probes.** During Session 13 Step 5c,
  the mentor went beyond the literal request and volunteered interpretation
  linking today's agonia detection to the TotalReasoning idea. This is a
  persona/UX choice point, not a bug. Gate to explicit invitation, or leave
  as default behaviour? Not in scope unless founder explicitly raises it.
- **`getProfileSnapshots` cross-hub filter at /api/founder/hub:466.** Whether
  founder-mentor chat sessions should have visibility of private-mentor
  baseline snapshots when no founder-mentor snapshot exists. Follow-up from
  Session 12.
- **All Session-11 carry-over open questions** remain open: "Start new
  conversation" control, mentor comments-field persistence.

---

## Risk classification — apply 0d-ii to whichever option founder picks

- Defensive-reader removal (option 1): **Elevated**. Touches user-facing
  mentor context assembly. Rollback is trivial. Verification is a live
  evening reflection + SQL + chat probe, same shape as Session 13.
- ADR scoping (options 2, 3): **Standard**. No code changes, documentation only.
- Silent-swallow audit (option 4): **Standard for the audit** (read-only),
  **Elevated for any resulting code fix** (same shape as Option 2).
- Operational maintenance (option 5): **Standard**. Documentation only.
- /private-mentor UX hygiene (option 6): **Elevated**. Touches live user-facing
  pages. Rollback per-change.

Classification is set by the AI before execution. Founder can reclassify
upward at any time per 0d-ii. Safety-critical surfaces are not in scope of
any option above.

---

## Scope (bounded)

**In scope (any one option from the menu):**
- A single option picked at session open, executed to a clean close, or
  acknowledged as out of scope if it turns out bigger than one session.
- Session close at `operations/handoffs/session-14-close.md` in the same
  format as session-13.
- Knowledge-gap promotions if any concept hits its third observation during
  the session (PR5). No current second-observation candidates queued; none
  expected unless a new surface is touched.
- Decision-log entries for any consequential decision taken.

**Out of scope — do not expand:**
- Any auth / session / cookie / deploy-config change. If one appears, stop
  and apply 0c-ii Critical Change Protocol.
- Any change to the distress classifier, Zone 2 classification, Zone 3
  redirection, or their wrappers (PR6 — always Critical, apply 0c-ii).
- Mentor memory architecture ADR implementation (scoping only, no code).
- Journal scoring page build (Option A/B/C decision only, no code).
- Retroactive migration of contaminated pre-2026-04-13 rows. Let them age out.
- Full live verification of Session 12's Wired (Path A) items
  (baseline-response R1 extension; line 466 fix). These verify organically
  when the first real baseline snapshot writes.
- Multiple options combined into one session. Pick one, land it, close.

If you notice something else that should change, flag it with "I'd push back
on this" or "this is a limitation" — don't silently expand the work.

---

## How to proceed

**Step A — Read session-13-close.md in full.** Pay attention to:
- The 0a status summary (Option 2 = Verified, KG10 = promoted).
- The Next Session Should menu (presented above for convenience, canonical
  version is in session-13-close).
- The Open Questions section.
- The Stewardship / Tacit-Knowledge Findings — the Session 13 F-series
  observation about audit-then-execute as the default for single-writer/
  multi-reader changes.

**Step B — Ask founder which option from the menu.** Present the menu with
reasoning, not a prescription. Wait for explicit scope choice before any
further work.

**Step C — Once scope is chosen, restate the plan and classify under 0d-ii.**
Wait for approval before execution. For any Elevated change, name rollback
and verification before asking for approval.

**Step D — Execute.** Follow the chosen option through to a clean close.
Respect PR1 (single-endpoint proof before rollout), PR2 (wire and verify in
the same session), PR6 (safety-critical is always Critical), PR7 (document
decisions not made).

**Step E — Close the session.** Handoff note at
`operations/handoffs/session-14-close.md` in the same format as session-13.
Update the decision log for any adopted decisions. Update knowledge-gaps.md
if any concept hit its third observation.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths, exact
  commands, exact copy-paste text. "Vercel Green" is the type-check — say
  "push and wait for Vercel Green", not "type-check on your side".
- Founder decides scope. If a chosen option reveals a bigger structural
  problem mid-session, say so once clearly, then wait.
- Classify every code change under 0d-ii before execution. State the risk
  level, name rollback, get approval before deploy.
- Deferred decisions go in the close handoff's Deferred section with
  reasoning (PR7). Don't drop them silently.
- Manual verification method per work type (0c) — founder verifies by using
  /private-mentor and Supabase SQL editor, not by reading TypeScript.
- Always give the exact wording of reflection tests (founder preference
  restated multiple times across Sessions 10–13). Never say "post a test
  reflection" — give verbatim copy-paste text.
- If founder signals "I'm done for now" or similar, stabilise to known-good
  state and close. Do not propose additional fixes.

---

## Success for this session

Depends on the option chosen. General shape:

- **Scope is explicitly chosen at session open** from the menu (or an
  alternative founder proposes).
- **Risk classification is applied under 0d-ii** before any code execution.
- **Any code change is Verified in-session** per PR2 (wire + verify same
  session, no build-to-wire gaps).
- **Session-14-close.md is written** in the same format as session-13-close.
- **Any third-observation knowledge-gap candidates are promoted** to
  permanent entries with decision-log records (PR5).

If the chosen option cannot be completed cleanly in one session, say so
clearly, stabilise to known-good, and close. Do not iterate under time
pressure.

If the session ends early with capacity remaining, ask the founder whether
to continue or close. Do not prescribe additional work.
```

---

## Notes for the human reading this file

- Session 13 was a single-fix session (Option 2) and closed cleanly with
  Verified status. Session 14 opens with no single queued task — the founder
  picks from a menu.
- The highest-leverage option on the menu is the mentor memory architecture
  ADR, which currently blocks multiple P0 items. It is a scoping conversation,
  not a coding session.
- The lowest-cost option is the defensive-reader disposition follow-up — a
  five-minute decision that closes one Open Question.
- KG10 is newly promoted at Session 13 close. Any future work touching a
  JSONB column (read or write) should surface KG10 at session open.
- No unresolved code issues, failed deploys, or rollbacks outstanding from
  Session 13. Clean starting state.
