# Session Close — 19 April 2026 (Session 10 — R1 + R2: Private Mentor Channel Wiring Fix)

## Decisions Made

- **R1 implemented and Verified.** `logMentorObservation` now requires a `hubId` parameter (no default). `/api/founder/hub` plumbs the request's `effectiveHubId` through `getPrimaryAgentResponse`, mapping `'founder-hub' → 'founder-mentor'` and `'private-mentor' → 'private-mentor'` via a small helper. Reader call sites for the two mentor-context functions, the `recordInteraction` write, and the Haiku-extracted observation write all use the mapped hub. Result: the 45 clean structured observations stored under `'private-mentor'` are now reachable by the `/private-mentor` page chat. Verified live — the mentor quoted a third-person observation about the founder's reflection from Observation History.
- **R2 implemented and Verified — but only after a reader-side defensive parse (Option B) was added.** The writer fix in `sage-mentor/profile-store.ts` (line 1138) now produces the `{ root_passion, sub_species, false_judgement }` shape the reader expects. However, the pre-existing `JSON.stringify(...)` at `profile-store.ts:781` inside `recordInteraction` was storing the array as a JSON string scalar in the `passions_detected` JSONB column. The reader's `Array.isArray` check fails on strings, so even with the correct shape, Pattern match still read "—". Patched the reader (`rowToSignal` in `mentor-context-private.ts`) to defensively `JSON.parse` if `passions_detected` is a string before iterating. Verified live — the mentor quoted `Pattern match: agonia (phobos, freq 5)` and a populated `Likely assent` from a fresh evening reflection.
- **Option A (remove the `JSON.stringify(...)` at `profile-store.ts:781`) deferred.** Reasoning: Option B unblocks the reader without touching the writer; removing the stringify is a writer-side change that could affect other readers of the same column. Founder's call: "B with A after these sessions." Logged as a follow-up under Deferred — Elevated risk (writer change, multiple potential readers).
- **PR1 honoured.** Only `/api/founder/hub` was wired and verified. The `/api/mentor/private/reflect` and `/api/mentor/private/baseline-response` callers were updated to pass the new required `hubId` argument so the codebase compiles, but their behaviour is unchanged. R1 is **not** rolled out to those endpoints — that extension is deferred to a subsequent session.

## Status Changes

- Diagnostic pre-processing channel (Recent Interaction Signals → Pattern match line): **Broken — root cause documented** → **Wired + Verified** (reading correct passions shape via reader-side defensive parse).
- Diagnostic pre-processing channel (Recent Interaction Signals → Likely assent line): **Broken** → **Wired + Verified**.
- Observational synthesis channel (Observation History): **Broken — 45 clean observations unreachable** → **Wired + Verified** (mentor quoted a stored observation in chat).
- `logMentorObservation` writer: **Hardcoded `hub_id: 'private-mentor'`** → **Required `hubId` parameter; caller decides**.
- `/api/founder/hub` reader/writer hub-label drift: **Reader hardcoded `'founder-mentor'`, writer hardcoded `'private-mentor'`** → **Both honour `effectiveHubId` via mapping helper**.
- `passions_detected` write shape (`updateProfileFromReflection`): **`{ passion, false_judgement }`** → **`{ root_passion, sub_species, false_judgement }`**.
- `passions_detected` reader (`rowToSignal`): **Strict `Array.isArray` check** → **Defensive: parses if string, iterates if array, returns empty otherwise**.

## What Was Built

### Files Modified (5)

| File | Change |
|------|--------|
| `website/src/lib/logging/mentor-observation-logger.ts` | `logMentorObservation` signature gains required `hubId: 'founder-mentor' \| 'private-mentor'` parameter; insert uses `hub_id: hubId` instead of hardcoded `'private-mentor'`. JSDoc updated to explain the R1 rationale. |
| `website/src/app/api/founder/hub/route.ts` | Added `mapRequestHubToContextHub` helper. Plumbed `effectiveHubId: string` through `getPrimaryAgentResponse`. Updated reader call sites (lines ~444, ~450) to use mapped hub for mentor-context functions. Updated `recordInteraction` (line ~1195) to use mapped `hub_id`. Updated `logMentorObservation` call (line ~1252) to pass mapped hub as new third arg. **Line 445 `getProfileSnapshots(userId, 'founder-mentor')` deliberately left unchanged** per session-10 prompt's exact-steps list — flagged as a candidate follow-up. |
| `website/src/app/api/mentor/private/reflect/route.ts` | Added `'private-mentor'` as third arg to `logMentorObservation` call (~line 395). No other behaviour change (PR1). |
| `sage-mentor/profile-store.ts` | (1) `updateProfileFromReflection` (~line 1138) now writes passions in `{ root_passion, sub_species, false_judgement }` shape with `rootPassionMap` lower-casing fallback to `'lupe'`. (2) `recordInteraction` type signature (~line 763) updated to match. **Line 781 `JSON.stringify(interaction.passions_detected || [])` deliberately left unchanged** — Option A queued under Deferred. |
| `website/src/lib/context/mentor-context-private.ts` | `rowToSignal` (~lines 666–708) now defensively parses `row.passions_detected` if it is a string (fallback to `[]` on parse error), then iterates only if the result is an array. Unblocks Pattern match and Likely assent without touching the writer. |

### Supabase SQL Run in Session

None. Code-only fix.

### No-op compiler updates

- `website/src/app/api/mentor/private/baseline-response/route.ts` — checked; only had a comment reference, no actual `logMentorObservation` call. No change required.

## Verification Completed This Session

- **R1 verified live.** Founder asked the `/private-mentor` chat to quote an observation from Observation History. Mentor returned a clean third-person observation drawn from `mentor_observations_structured` rows that were previously unreachable. Confirms reader and writer agree on the `'private-mentor'` hub label.
- **R2 (writer-only) failed verification.** Pattern match and Likely assent still both read "—" after deployment. Diagnostic SQL revealed `stored_as = string` for all `passions_detected` rows — the pre-existing `JSON.stringify` at `profile-store.ts:781` writes JSON-encoded scalars into the JSONB column. Reader's `Array.isArray` fails.
- **R2 (writer + reader-side defensive parse, Option B) verified live.** Founder submitted a fresh evening reflection containing a passion event and asked the mentor to quote a specific entry by Topic prefix. Mentor returned all four lines populated:
  - `Topic: Today I opened my laptop intending to work through the build plan for the private mentor channel...`
  - `Impression presented: acted at deliberate proximity`
  - `Likely assent: That the broken build was an injustice being done to me — that the system owed me forgiveness for a shortcut I knowingly took, and that i...`
  - `Pattern match: agonia (phobos, freq 5)`
- Mentor noted unprompted that the verified reflection was the only entry in the last seven interactions with all three diagnostic fields populated — the others (chat-message rows) were blank. Confirms the writer path lights up only on substantive `recordInteraction` calls (evening reflection), not on conversational chat turns.
- Type-check passed clean after every code change (founder-side lint).

## Next Session Should

**Decide direction.** With R1 + R2 Verified on `/api/founder/hub`, the founder has three plausible next moves and should choose:

1. **R3 (queued from session 9).** Populate `mentor_interactions.mentor_observation` with the validated `structured_observation` text at reflect-write time so the Impression line stops showing the proximity fallback (`acted at <proximity> proximity`) and shows the actual third-person observation. Detail in session-9 close, lines 70–95. Risk under 0d-ii: Standard. Re-opens a previously-deprecated column to writes — code-comment guardrail required.
2. **R1 extension to `/api/mentor/private/reflect` and `/api/mentor/private/baseline-response`.** Apply the hub-id-from-request pattern at those write paths so they too stop drifting from the reader. Currently those paths are inert wrt this bug (they hardcode `'private-mentor'` which matches the reader after R1) — extension is hygiene, not correction.
3. **Option A cleanup.** Remove the `JSON.stringify(...)` at `profile-store.ts:781` and any other readers that depend on the stringified form. Elevated risk — see Deferred.

Founder's call.

## Blocked On

- Nothing for R3, R1-extension, or Option A. All three are code-only and do not touch auth/session/cookie/deploy config.
- Mentor memory architecture ADR — still drafted nowhere. Blocks the morning check-in / weekly mirror / journal-question surfacing work.
- Journal scoring page — still blocked on Option A/B/C decision (from session 8).

## Open Questions

- **`/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')`.** The session-10 prompt's exact-steps list named lines 444 and 450 but not 445. I left line 445 unchanged. The reader is still pinned to `'founder-mentor'` regardless of incoming hub. Worth a follow-up in the next session to confirm whether profile snapshots are intentionally hub-scoped to `'founder-mentor'` or whether this is a third hardcode that should also be mapped.
- **The `/private-mentor` page UI does not allow starting a fresh conversation.** Chat messages keep accumulating in `mentor_interactions` as the most-recent rows, which polluted R2 verification more than once. UX gap worth logging for a future UI session — perhaps a "Start new conversation" control or session-id boundary.
- **Mentor "comments" / extra-instruction field on `/private-mentor` does not persist on page reload.** Surfaced during R2 verification. Same UX session as above.
- **Whether `recordInteraction` should accept `passions_detected` as an array directly (no JSON.stringify) and the column type check whether JSONB will store an array literal as JSON natively.** Foundation question for Option A.

## Deferred (Known Gaps, Not This Session)

- **Option A — remove `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781`.** Replace with passing the array directly to Supabase (JSONB will accept it natively). Elevated risk under 0d-ii: writer-side change, multiple potential readers of the same column. Trigger to revisit: founder explicitly requests, or a new reader is added that cannot defend itself with the same defensive parse trick. When done, the reader's defensive parse can stay in place as a backstop or be removed for tidiness.
- **R1 extension to `/api/mentor/private/reflect` and `/api/mentor/private/baseline-response`.** Currently inert (those endpoints hardcode `'private-mentor'` which matches reader). Extension would replace hardcode with hub-from-request to prevent future drift. Standard risk.
- **R3 — populate `mentor_interactions.mentor_observation` with validated observation at reflect-write time.** Detail in session-9 close lines 70–95. Standard risk (with code-comment guardrail).
- **`/api/founder/hub` line 445 `getProfileSnapshots(userId, 'founder-mentor')` review.** Open question above.
- **Archival of pre-2026-04-13 contaminated rows** (10 rows on founder-mentor hub, 1 on private-mentor hub). Inert after R1. Tidy-up only.
- **`/private-mentor` "Start new conversation" UI control + comments-field persistence.** UX gaps surfaced during verification.
- **Mentor memory architecture ADR.** Still no draft. Blocks the morning check-in / weekly mirror / journal-question surfacing channels.
- **Journal scoring page** — Option A/B/C decision (session 8 carry-over).
- **Public `/api/reflect`, `/api/score`, baseline-assessment writer paths.** Silent-swallow pattern still unverified there.

## Process-Rule Citations

- **PR1 — respected.** R1 proven on `/api/founder/hub` via live verification before any extension. R2 same. The `reflect` and `baseline-response` callers received only the compile-needed `hubId` argument; no behaviour change at those endpoints.
- **PR2 — respected.** Both R1 and R2 verified live in the same session they were wired. R2 failed first verification, the failure was diagnosed (SQL on `stored_as`), Option B was added in the same session, and R2 was re-verified live.
- **PR3 — N/A.** No safety-critical surface touched.
- **PR4 — N/A.** No new endpoint, no model change.
- **PR6 — N/A.** No safety-critical function (distress classifier, Zone 2/3 logic) touched.
- **PR7 — applied.** Option A explicitly deferred with: what was considered (drop `JSON.stringify` writer-side), why deferred (writer change with unknown reader fan-out, Option B already unblocks R2), trigger to revisit (founder request, or new reader added that cannot defend itself). Also: R1 extension and R3 deferred with reasoning.
- **PR8 — candidate logged below** (Knowledge-Gap Carry-Forward).

## Knowledge-Gap Carry-Forward

- **New candidate (first observation): "Storage format vs payload shape — JSONB columns can hold a JSON-encoded string scalar that looks like an array but fails `Array.isArray`."** Bit me during R2 verification: shape was correct, reader still saw nothing because the value arrived as a string. Diagnostic move was a SQL `jsonb_typeof(passions_detected)` query revealing `string` instead of `array`. If this concept needs re-explanation in a future session, promote to operations/knowledge-gaps.md per PR5.
- **Carry-forward from session 9: "hub-label inconsistency between conversation shell, mentor context, and logger writes."** Touched again this session via the `mapRequestHubToContextHub` helper. Second observation. One more re-encounter and it earns a permanent entry per PR5.
- **Carry-forward from session 9: "The `/private-mentor` page is a façade over `/api/founder/hub` with `hub_id: 'private-mentor'` — not over `/api/mentor/private/reflect`."** Bit me during R2 verification (I initially expected reflect-path writes to feed Recent Interaction Signals; they do, but `/private-mentor` chat messages route through `/api/founder/hub`). Second observation. One more and promote.

## Stewardship / Tacit-Knowledge Findings

- **T-series candidate: Live verification of context-injection fixes is fragile when the verification probe (a chat message) writes its own row to the same table being read.** Surfaced twice this session — once on R1 (chat-message rows have no proximity/passions data), once on R2 (chat messages accumulate as "most recent"). Mitigation used: pin the verification to a specific entry by Topic prefix. Process candidate for promotion if it recurs in session 11.
- **F-series candidate (Efficiency tier): the `effectiveHubId` plumbing now passes through `getPrimaryAgentResponse`. Three more functions in `/api/founder/hub` could plausibly want it (line 445 `getProfileSnapshots`, anywhere else `'founder-mentor'` is hardcoded).** Steady-state cleanup, not urgent.

## Handoff Notes

- The R2 verification path was longer than expected. The shape fix alone was insufficient because of a pre-existing `JSON.stringify` at `profile-store.ts:781`. Founder chose Option B (reader-side defensive parse) to ship now, with Option A (remove the stringify) queued. Both R1 and R2 are now Verified.
- The 45 structured observations are now reachable. The mentor channel surfaces them in chat. The Pattern match line is populated for substantive sessions (evening reflection writes), and remains blank for chat-only rows — which is the correct behaviour.
- The session-10 prompt explicitly listed lines 444 and 450 for reader updates but not line 445. I followed the prompt exactly and left line 445 unchanged. Open Question logged above.
- The founder ended the session with R2 confirmed working: "Pattern match: agonia (phobos, freq 5)" surfaced cleanly on the targeted reflection. No further fixes proposed.
- Both R1 and R2 are 0a status: **Verified** (deployed, tested live by founder, agreed).
