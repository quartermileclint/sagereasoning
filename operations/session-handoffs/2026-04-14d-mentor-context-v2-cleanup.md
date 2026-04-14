# Session Close — 14 April 2026 (Session D) — Mentor Context V2 Cleanup & Signal Distribution Check

**References:**
- session-handoffs/2026-04-14c-mentor-context-v2-verified.md (prior close — V2 verified)
- sage-mentor/persona.ts (file modified this session)

**Status entering this session:** V2 Verified ✓; two carry-overs open (hub_id distribution unknown; persona.ts NOTE block identified as token waste).

**Status leaving this session:** Both items resolved. V2 still Verified ✓. No behaviour change; one small ongoing cost reduction banked.

---

## Decisions Made

- **Accepted the hub_id distribution finding as informational, not actionable.** The Session C concern — that the hub mentor might have fewer signals than the reflect endpoint — is the reverse of reality. Hub has 28 of 39 interactions (71.8%); reflect has 11 (28.2%). No asymmetry to fix. → Future mentor tuning decisions should evaluate against hub behaviour first, since that is where the founder is reasoning most.

- **Removed the stale NOTE block from `buildAfterPrompt` in `sage-mentor/persona.ts`.** The six `// NOTE` lines sat inside a template literal (backtick opened line 465, closed line 506), meaning they were sent to the LLM verbatim on every ring post-check. The note itself was developer-facing history about the deprecated `mentor_observation` field — useless to the LLM. Removed per R5 (cost as health metric).

- **Corrected a file-path error in the Session C handoff for the record.** Session C referenced `website/src/lib/mentor/persona.ts`; the actual file is at `sage-mentor/persona.ts`. The website build imports sage-mentor via `website/src/lib/sage-mentor-bridge.ts` (dynamic imports). No fix needed to live code — just a note for future handoff accuracy.

- **Clarified the two-email situation — no mismatch to fix.** First Task 1 attempt used `clintonaitkenhead@hotmail.com` (Clinton's Claude profile email) and returned zero rows. Investigation confirmed the founder has two deliberately separate identities:
  - **Supabase admin / owner** = `clintonaitkenhead@hotmail.com` (dashboard login, project ownership). Confirmed in Supabase → Account preferences.
  - **sagereasoning.com app user** = `clintonaitkenhead@gmail.com` (row in `auth.users`). Gmail was used at app-user signup because hotmail was rejected during the US-region Supabase migration.
  - These do not need to match. The hotmail identity administers the infrastructure; the gmail identity is a regular practitioner on the platform.
  - **Operational takeaway:** any SQL that looks up the founder's *app-level* data (mentor interactions, profiles, journal, snapshots, etc.) must use `@gmail.com`, not `@hotmail.com`. Dashboard / billing / project-level queries use `@hotmail.com`.

---

## Status Changes

| Component | Before | After |
|---|---|---|
| hub_id distribution (Session C Open Question) | Unknown | **Known** — 28 founder-mentor / 11 private-mentor |
| `sage-mentor/persona.ts` `buildAfterPrompt` | 595 lines, NOTE block leaking into LLM prompt | **589 lines, prompt cleaned** |
| Session C carry-over: stale NOTE block | Open | **Closed** |
| Session C carry-over: hub_id distribution check | Open | **Closed** |

---

## Verification Record

```
TASK 1 — HUB_ID DISTRIBUTION
  Method:                    SQL query in Supabase SQL Editor (founder ran)
  Total interactions:        39 (up from 35 recorded in Session C)
  founder-mentor:            28 (71.8%)
  private-mentor:            11 (28.2%)
  Verdict:                   No asymmetry concern. Hub is the primary signal source.
  Action taken:              None — informational finding only.

TASK 2 — STALE NOTE BLOCK REMOVAL
  File:                      sage-mentor/persona.ts
  Lines removed:             501–506 (original), now empty
  Chars removed:             424
  Estimated tokens saved:    ~106 per buildAfterPrompt call (424 ÷ 4)
  Scope of saving:           every ring post-check call (llm-bridge, proactive-scheduler)
  Typecheck after change:    29 errors total — all pre-existing __tests__ errors
                             from missing @types/jest (unchanged from Session C).
                             Zero new errors from this edit.
  Behaviour change:          None. Pure comment-text removal from inside a
                             template literal that was leaking to the LLM.
  Rollback:                  git revert the commit. Single-file, 8-line diff.

OVERALL: BOTH TASKS COMPLETE ✓
```

**Honest note on verification:** the session prompt suggested comparing token count against the V2 baseline of 2,181 tokens. That baseline is from `/api/founder/hub`, which does not use `buildAfterPrompt`. The after-prompt is a separate LLM call with its own baseline (not measured today). The 424-char / ~106-token figure is the correct measurement for this edit; it is not comparable to the 2,181 total.

---

## Files Touched This Session

**Modified:**
- `sage-mentor/persona.ts` — removed lines 501–506 (stale NOTE block inside `buildAfterPrompt` template literal). File shrunk from 595 to 589 lines.

**No schema changes. No migrations. No env var changes. Not yet deployed** — waiting on founder's normal commit/push/Vercel flow.

---

## Next Session Should

1. **Deploy the persona.ts edit.** Commit, push, confirm Vercel build succeeds. This is a standard-risk change so normal flow applies; no Critical Change Protocol required.

2. **Carry-overs still open (re-stated for continuity):**
   - Topic-signal keyword matcher overshoot at 72.5% profile reduction (Session C). Deferred pending real-use data. Current recommendation: leave for a week of real use, revisit if mentor reasoning shows gaps.
   - Parallel-retrieval cutover quality review (carried from Session B).
   - Founder Hub R20a distress detection (low urgency, founder-only).
   - Cost of awaiting the snapshot write (~50–200ms per mentor request). Not urgent at single-user traffic.
   - Switch token logging from chars/4 approximation to real `usage.input_tokens` from Anthropic response (would improve R5 cost monitoring accuracy).

3. **New open item from this session:**
   - None. The "email mismatch" flagged earlier this session turned out to be two deliberately separate identities (Supabase admin = hotmail; app user = gmail). Recorded under Decisions for future reference — no fix needed.

4. **Consider measuring the real token delta on a ring post-check.** Today's 106-token estimate is chars ÷ 4. If the next session has a natural opportunity to compare a real ring post-check call's token count before/after, that would confirm the saving. Not worth a dedicated session.

---

## Blocked On

- Nothing currently blocked.

---

## Open Questions

- None new. Session C's profile-projection overshoot (72.5%) remains the sole open tuning question on the mentor context system.

---

## Rollback Plan

**persona.ts edit:** `git revert` the commit containing this change. Single file, 8-line diff. No schema, no env, no migration. Can be reverted after deploy with no cleanup.

---

## Decision Log Entry (for operations/decision-log.md if adopted)

```
## 14 April 2026 (Session D) — Stale NOTE block removed from buildAfterPrompt; hub_id asymmetry concern resolved

**Decision:** Remove developer-facing NOTE comment block (6 lines, 424 chars)
from inside the `buildAfterPrompt` template literal in sage-mentor/persona.ts.
Accept the hub_id distribution finding (28 founder-mentor / 11 private-mentor)
as informational — no action needed.

**Reasoning:** The NOTE block was inside a template literal, so its text was
sent verbatim to the LLM on every ring post-check call. Developer history about
a deprecated field serves no purpose in the prompt. Estimated ~106 tokens
saved per call against R5 (cost as health metric). Typecheck unchanged.

The hub_id distribution check was carried forward from Session C as a
potential asymmetry (hub starved, reflect abundant). Actual finding is the
reverse: hub has 2.5× more signals than reflect. No fix needed. Recorded so
future mentor tuning decisions prioritise hub behaviour.

**Rules served:** R5 (cost reduction on every post-check call).

**Impact:** One-file, 8-line diff in persona.ts pending deploy. hub_id
distribution documented for future reference.

**Status:** Adopted.
```

---

## Build Status Summary

| Component | Status |
|---|---|
| MENTOR_CONTEXT_V2 | **Live, Verified ✓** (unchanged from Session C) |
| Profile Projection Layer | Verified ✓ (overshoot still recorded as observation) |
| Recent Interaction Loader | Verified ✓ |
| `session_context_snapshots` writer | Verified ✓ |
| `snapshot_type = 'mentor_session'` | Live ✓ |
| Snapshot audit rows | 3 confirmed in Session C; accumulating in production |
| `buildAfterPrompt` prompt | **Cleaned** — 424 chars removed, pending deploy |
| Hub signal density | **71.8% of founder's 39 interactions** (confirmed this session) |
