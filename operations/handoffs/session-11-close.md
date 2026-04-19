# Session Close — 19 April 2026 (Session 11 — R3: Populate mentor_observation from validated structured observation)

## Decisions Made

- **R3 implemented and Verified on both write paths.** `mentor_interactions.mentor_observation` is now populated at write time from the validated observation text — but only after `logMentorObservation()` has accepted that text into `mentor_observations_structured`. The Recent Interaction Signals "Impression presented" line no longer degrades to the proximity fallback (`acted at <proximity> proximity`) on substantive interactions.
- **Approach chosen: "validated pass-through" (not session-9 spec's UPDATE-after-insert).** The session-9 spec envisaged writing the `mentor_interactions` row first and then running a second UPDATE to patch the observation in. Closer inspection showed `recordInteraction`'s signature **already accepted** `mentor_observation` as an optional parameter (line 767 in `profile-store.ts`) — the previous deprecation was a caller-side omission, not a signature restriction. The simpler fix was to reorder so extraction runs before the write, then pass the validated text through the existing parameter. Single INSERT, no extra DB round-trip, no signature change to `recordInteraction`. Founder approved the approach before coding.
- **PR1 honoured.** R3 proven on `/api/founder/hub` first (task #4) and Verified live with a chat-message probe. Only then extended to `/api/mentor/private/reflect` (task #6), Verified live with a fresh evening reflection.
- **Guardrail discipline: code comments at every write site.** Required comment pattern adopted per session-9 spec: "mentor_observation is written only from validated mentor_observations_structured content — never raw LLM text." Added at three locations: founder/hub write, updateProfileFromReflection signature, updateProfileFromReflection's internal recordInteraction call.
- **CHECK constraint backstop deferred.** A DB-level `char_length(mentor_observation) <= 500` CHECK constraint was considered as a schema-level backstop against future raw-LLM regressions. Not built this session — code comments are the guardrail per spec. Logged under Deferred.

## Status Changes

- Diagnostic pre-processing channel (Recent Interaction Signals → Impression presented line, evening_reflection rows): **Degraded to proximity fallback** → **Wired + Verified** (validated third-person observation from structured pipeline).
- Diagnostic pre-processing channel (Recent Interaction Signals → Impression presented line, conversation rows): **Hardcoded null, degraded to proximity fallback** → **Wired + Verified** (validated third-person observation from Haiku extraction + structured pipeline).
- `/api/founder/hub` chat-conversation write ordering: **recordInteraction → extraction → log** → **extraction → log → recordInteraction** (reorder for validated pass-through).
- `/api/mentor/private/reflect` evening-reflection write chain: **mentor_observation always null** → **mentor_observation populated from `obsLogStatus === 'logged'` validated text**.
- `updateProfileFromReflection` signature: 5 parameters → 6 parameters (optional `mentorObservation?: string`). Backwards-compatible — existing 5-arg callers (public `/api/reflect`) unchanged.

## What Was Built

### Files Modified (3)

| File | Change |
|------|--------|
| `website/src/app/api/founder/hub/route.ts` | Reordered the `if (profileRow)` block (~lines 1186–1280). Haiku extraction + `logMentorObservation` now run **before** `recordInteraction`. A local `validatedObservation: string \| undefined` captures the extracted text iff `logMentorObservation` returned `success: true`. That value is passed to `recordInteraction` via its existing `mentor_observation` parameter. Pre-R3 NOTE (2026-04-13) replaced with R3 rationale and guardrail. No change to `recordInteraction` call signature, no schema change, no auth/session/cookie touched. |
| `sage-mentor/profile-store.ts` | `updateProfileFromReflection` (~line 1067) gains optional `mentorObservation?: string` 6th parameter with R3 guardrail comment. Internal `recordInteraction` call (~line 1133) now passes `mentor_observation: mentorObservation`. Pre-R3 NOTE (2026-04-13) at the internal write site replaced with R3 rationale. |
| `website/src/app/api/mentor/private/reflect/route.ts` | Before the `updateProfileFromReflection` call (~line 460), computes `validatedObservation = obsLogStatus === 'logged' ? (structuredObs?.observation \|\| undefined) : undefined`. Passes it as 6th argument. R3 guardrail comment added. |

### Files NOT Changed

- `recordInteraction` signature (`sage-mentor/profile-store.ts:755`) — already accepted `mentor_observation?: string`. No change needed.
- `/api/reflect/route.ts` (public reflect endpoint) — passes 5 args; new optional 6th param defaults to undefined → stored as null → current behaviour preserved. Correct.
- `/api/mentor/private/baseline-response/route.ts` — does not call `logMentorObservation` and does not have a structured observation pipeline. No change needed. (Confirmed in session-10 close.)
- `website/src/lib/context/mentor-context-private.ts` — reader unchanged. The existing `rowToSignal` already reads `row.mentor_observation` and degrades to proximity fallback when null.

### Supabase SQL Run in Session

None. Code-only fix.

## Verification Completed This Session

- **R3 on `/api/founder/hub` verified live.** Founder sent a substantive test message on `/private-mentor` chat, then asked the mentor to quote the Impression presented line from the most recent Recent interaction signals entry. Mentor returned a third-person observation drawn from the Haiku extraction of that exchange. Vercel build went green. "Verified" per 0a.
- **R3 on `/api/mentor/private/reflect` verified live.** Founder submitted a fresh evening reflection (substantive "What happened" + substantive "How I responded"), then asked the mentor in chat: "Quote the Impression presented line from the most recent evening reflection entry in Recent interaction signals." Mentor returned:
  > "Practitioner interrupted oknos at the phantasia stage and self-interrogated before assent — upstream from the post-hoc diagnosis pattern ..."
- The quoted observation is third-person, category-appropriate (reasoning_pattern / oikeiosis_shift territory), length-constrained, and substantively matches the sage perspective of the reflection (which also named oknos). Confirms the entire chain: `logMentorObservation` accepted the observation, `mentor_observations_structured` stored it, AND the same validated text propagated through `updateProfileFromReflection` → `recordInteraction` to `mentor_interactions.mentor_observation`. Both write paths agree.

## Next Session Should

**Decide direction.** With R3 Verified on both write paths, three options from session 10 are still queued, plus one new item surfaced this session:

1. **Option 2 — R1 extension.** Apply the hub-id-from-request pattern to `/api/mentor/private/reflect` and `/api/mentor/private/baseline-response`. Those endpoints still hardcode `'private-mentor'`. Currently inert wrt bugs (hardcode matches the reader post-R1), but hygiene against future drift. Standard risk.
2. **Option 3 — Option A cleanup.** Remove `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781`. Elevated risk — writer-side change with unknown reader fan-out. Requires reader audit first.
3. **Option 4 — Line 445 review.** `/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')` — decide whether profile snapshots are intentionally hub-scoped to `'founder-mentor'` or whether this is a third hardcode that should be mapped. ~10-minute review. Standard risk.
4. **New from this session — R3 CHECK constraint backstop.** Add a Postgres CHECK constraint on `mentor_interactions.mentor_observation` to enforce `char_length <= 500`. Schema-level backstop against any future regression that bypasses the code-comment guardrail. Standard risk under 0d-ii but touches schema — would require migration discipline. Optional.

Founder's call.

## Blocked On

- Nothing for Options 2, 3, 4, or the CHECK constraint. All are code-only or migration-only and do not touch auth/session/cookie/deploy config.
- Mentor memory architecture ADR — still drafted nowhere. Blocks the morning check-in / weekly mirror / journal-question surfacing work.
- Journal scoring page — still blocked on Option A/B/C decision (from session 8).

## Open Questions

- **Whether to add a schema-level CHECK constraint on `mentor_observation` length as a backstop for R3.** Code comments + the `logMentorObservation` validator are the current guardrail. A CHECK constraint would catch any future regression that somehow wrote raw LLM text directly. Pro: defence in depth. Con: requires a migration and another thing to maintain. Logged under Deferred pending founder decision.
- **All session-10 open questions remain open:**
  - `/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')` — review (Option 4 above).
  - `/private-mentor` page UI "Start new conversation" control — chat messages still accumulate in `mentor_interactions` as most-recent rows. Not hit during R3 verification (evening reflection path was used), but the concern from session 10 stands.
  - Mentor "comments" / extra-instruction field on `/private-mentor` does not persist on page reload.
  - Whether `recordInteraction` should accept `passions_detected` as an array directly (Option A foundation question).

## Deferred (Known Gaps, Not This Session)

- **R3 CHECK constraint backstop** — new this session. Add `CHECK (char_length(mentor_observation) <= 500)` on `mentor_interactions.mentor_observation`. Trigger to revisit: a future raw-LLM regression would justify it immediately; otherwise, revisit at the next migration batch.
- **Option 2 — R1 extension to `/api/mentor/private/reflect` and `/api/mentor/private/baseline-response`.** Still queued. Standard risk.
- **Option 3 — remove `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781`.** Still queued. Elevated risk (writer-side change, multiple potential readers of the same column).
- **Option 4 — `/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')` review.** Still queued. Standard risk.
- **Archival of pre-2026-04-13 contaminated rows** (10 rows on founder-mentor hub, 1 on private-mentor hub). Inert after R1. Tidy-up only. Less urgent now that R3 writes clean data going forward — the old rows will gradually fall out of the 7-row recent window.
- **`/private-mentor` "Start new conversation" UI control + comments-field persistence.** UX gaps surfaced during session-10 verification. Unchanged.
- **Mentor memory architecture ADR.** Still no draft.
- **Journal scoring page** — Option A/B/C decision (session 8 carry-over).
- **Public `/api/reflect`, `/api/score`, baseline-assessment writer paths.** Silent-swallow pattern still unverified there.

## Process-Rule Citations

- **PR1 — respected.** R3 proven on `/api/founder/hub` first. Verified live. Only then extended to `/api/mentor/private/reflect`. Single-endpoint proof before surface rollout.
- **PR2 — respected.** Both extensions verified live in-session on real data (founder's own chat message, founder's own evening reflection). No "it should work" close.
- **PR3 — N/A.** No safety-critical surface touched (distress classifier, Zone 2/3 logic untouched).
- **PR4 — N/A.** No new endpoint designed. Haiku model selection at founder/hub extraction unchanged (remains within documented reliability boundary per KG2).
- **PR5 — see Knowledge-Gap Carry-Forward below.**
- **PR6 — N/A.** No safety-critical function touched.
- **PR7 — applied.** CHECK constraint backstop explicitly deferred with: what was considered (schema-level length check), why deferred (code comments are current guardrail, schema migration has overhead), trigger to revisit (future raw-LLM regression, or next migration batch).
- **PR8 — no candidates to promote this session.**

## Knowledge-Gap Carry-Forward

- **Carry-forward from session 9 + session 10: "hub-label inconsistency between conversation shell, mentor context, and logger writes."** Re-encountered in task #4 (R3 implementation at `/api/founder/hub` required routing through `mapRequestHubToContextHub(effectiveHubId)` twice — at `logMentorObservation` and `recordInteraction`) and task #6 (the reflect endpoint still hardcodes `'private-mentor'`, logged as Option 2 deferred work). **Third observation. PROMOTED per PR5 — entry added to `operations/knowledge-gaps.md` as KG8.**
- **Carry-forward from session 9 + session 10: "The `/private-mentor` page is a façade over `/api/founder/hub` with `hub_id: 'private-mentor'` — not over `/api/mentor/private/reflect`."** Re-encountered in task #6 design work — had to explicitly distinguish which of the two write paths handled evening reflections vs chat messages when designing the R3 pass-through. **Third observation. PROMOTED per PR5 — entry added to `operations/knowledge-gaps.md` as KG9.**
- **Carry-forward from session 10: "Storage format vs payload shape — JSONB columns can hold a JSON-encoded string scalar that looks like an array but fails `Array.isArray`."** Not re-encountered this session. Remains at one observation.
- **New candidate (first observation): "A function's parameter may already accept a value that's been deliberately omitted by callers. Before extending the function signature, check whether the parameter already exists."** Came up in R3 design — the session-9 spec assumed `recordInteraction` would need to be extended to return the inserted row id, but inspection showed the function already had an optional `mentor_observation` parameter. The simpler fix used the existing parameter. If this pattern recurs, promote.

## Stewardship / Tacit-Knowledge Findings

- **T-series carry-forward from session 10: live verification of context-injection fixes is fragile when the verification probe writes its own row to the same table being read.** Session 10 mitigation was "pin verification to a specific entry by Topic prefix". This session's R3 reflect-path verification used a different technique: "quote the Impression presented line from the most recent **evening reflection** entry" — which filters out chat-message rows by type. Worked cleanly. Two mitigations now known; no promotion to process rule yet.
- **F-series carry-forward from session 10 (Efficiency tier): `effectiveHubId` plumbing.** Session 10 identified line 445 `getProfileSnapshots` as a candidate. This session touched `/api/founder/hub` again without addressing line 445 (out of scope). The reflect endpoint's hardcoded `'private-mentor'` is also in this bucket (Option 2). Steady-state cleanup. Not urgent.
- **New F-series (Efficiency tier): R3's validated pass-through approach leaves a narrow crash window.** If the `/api/founder/hub` handler errors between the Haiku extraction completing and the `recordInteraction` call, no interaction row is written for that turn. Today's try/catch structure has equivalent exposure for `logMentorObservation`, so this doesn't worsen the failure mode — but the coupling is new information. Worth knowing. Not worth redesigning for. Steady-state awareness.

## Handoff Notes

- The R3 implementation diverged from the session-9 spec's UPDATE-after-insert approach. Founder approved the validated-pass-through alternative after a side-by-side comparison. Outcome: simpler code, no extra DB round-trip, no signature change to `recordInteraction`. The spec author's assumption that `recordInteraction` would need to be extended turned out to be unnecessary — the function already had the parameter.
- Verification on the reflect path used a substantive evening reflection (oknos / timidity, "I didn't force myself to start immediately" response). The LLM produced a clean structured observation, `logMentorObservation` accepted it, and the same text propagated to `mentor_interactions.mentor_observation`. The mentor quoted it correctly in chat. End-to-end working.
- The mentor's further comments during verification (beyond quoting the line) were its own observation of session behaviour, not a signal about R3. Noted and left with the founder.
- The "type-check on your side" phrase from earlier was unnecessary jargon on my part — for this project, "Vercel Green" is the type-check, since Next.js build runs `tsc` as part of `next build`. Recording this for future handoffs: say "push and wait for Vercel Green", not "type-check".
- Both R3 write paths are 0a status: **Verified** (deployed, tested live by founder, agreed).
