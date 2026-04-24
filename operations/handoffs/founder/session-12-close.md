# Session Close — 19 April 2026 (Session 12 — R1 extension, line-445 review, R3 CHECK constraint, Option-2 reader audit)

## Decisions Made

- **R1 hub-label helper extended across the three remaining private-mentor write sites.** `/api/mentor/private/reflect` and `/api/mentor/private/baseline-response` both replaced six and four bare `'private-mentor'` literals (respectively) with a named `PRIVATE_MENTOR_HUB` constant carrying an R1-extension comment referencing KG8. Founder approved (b) — "route through a helper for consistency and to surface the hardcode via code review" — from session 12's prompt option list. Purely hygienic; no behaviour change on the reader-side post-R1.
- **Line 445 review (Option 3 from session-12 prompt) uncovered a real bug, not cosmetic drift.** `/api/founder/hub` was calling `getProfileSnapshots(userId, 'founder-mentor')` as a hardcoded literal, but the only writer of `mentor_profile_snapshots` is `/api/mentor/private/baseline-response`, which always writes `hub_id: 'private-mentor'`. Snapshot reads on the founder-mentor hub therefore always returned null. Fixed by replacing the literal with `contextHub` (the mapped value from `mapRequestHubToContextHub(effectiveHubId)`), so the reader now matches the writer when the request hub is private-mentor. Table is empty, so no data migration was needed — closed as Wired (Path A), to be Verified organically once the first real baseline snapshot is written.
- **R3 CHECK constraint backstop built and applied.** Migration `20260419_r3_mentor_observation_check.sql` created and applied via Supabase SQL editor. Idempotent DO-block adds `CHECK (mentor_observation IS NULL OR char_length(mentor_observation) <= 500)` to `mentor_interactions`. Column comment added documenting the R3 contract. Catches any future writer that bypasses the R3 code-comment guardrail and attempts to store raw LLM text.
- **Option 2 (remove JSON.stringify at profile-store.ts:781) — reader audit completed, fix queued but not executed.** Founder chose to close session 12 and defer the actual code change to session 13. Audit confirmed the fix is safe: one writer, four reader sites (two defensive by design, two pass-through API endpoints with no current consumer). See the audit summary under "Next Session Should".

## Status Changes

- `/api/mentor/private/reflect` — six `'private-mentor'` literals: **hardcoded** → **named constant with R1-extension comment**. 0a status: Verified live (fresh evening reflection writes correct hub_id, mentor chat quotes observation as expected).
- `/api/mentor/private/baseline-response` — four `'private-mentor'` literals: **hardcoded** → **named constant**. 0a status: Wired (table paths exercised but not end-to-end verified via a fresh baseline run — low risk, purely hygienic change, no reader-side consequence).
- `/api/founder/hub` line 466 `getProfileSnapshots(userId, ...)`: **hardcoded `'founder-mentor'`** → **`contextHub` (mapped from request hub)**. 0a status: Wired (Path A — table empty, can't verify a live read until a baseline snapshot exists on either hub).
- `mentor_interactions.mentor_observation`: **code-comment guardrail only (R3)** → **code-comment guardrail + schema-level CHECK constraint (backstop)**. 0a status: Verified (pre-flight clean after one offender nulled, reject case confirmed at 600 chars with error 23514, accept case confirmed at 400 chars, live reflect-route write path re-verified inside backstop).
- Migration file `supabase/migrations/20260419_r3_mentor_observation_check.sql`: **did not exist** → **committed and pushed to GitHub**. Vercel Green.
- One pre-R3 contaminated row on private-mentor hub (`id 683889e1-8300-426e-92e3-9eff814232d8`, 525 chars, created 2026-04-12): **contaminated** → **`mentor_observation = NULL`** (pre-flight cleanup for the CHECK constraint).

## What Was Built

### Files Modified (3)

| File | Change |
|------|--------|
| `website/src/app/api/mentor/private/reflect/route.ts` | Added `const PRIVATE_MENTOR_HUB = 'private-mentor' as const` near top of file (~line 49) with R1-extension comment referencing KG8. Replaced six `'private-mentor'` literals at call sites: `getMentorObservationsWithParallelLog`, `getJournalReferences`, `getProfileSnapshots`, `getRecentInteractionsAsSignals`, `logMentorObservation`, `updateProfileFromReflection`. Behaviour unchanged. |
| `website/src/app/api/mentor/private/baseline-response/route.ts` | Added `const PRIVATE_MENTOR_HUB = 'private-mentor' as const` near top (~line 30) with R1-extension comment referencing KG8. Replaced four `'private-mentor'` literals at call sites: `getMentorObservationsWithParallelLog`, `getProfileSnapshots`, `recordInteraction` (hub_id field), `createProfileSnapshot`. Behaviour unchanged. |
| `website/src/app/api/founder/hub/route.ts` | Line 466 changed from `getProfileSnapshots(userId, 'founder-mentor')` to `getProfileSnapshots(userId, contextHub)` with a four-line explanatory comment referencing KG8 and noting that the only current writer (`baseline-response`) always writes `'private-mentor'`. Uses the existing `contextHub` variable returned by `mapRequestHubToContextHub(effectiveHubId)`. |

### Files Created (1)

| File | Purpose |
|------|---------|
| `supabase/migrations/20260419_r3_mentor_observation_check.sql` | Idempotent migration adding `mentor_observation_length_check` CHECK constraint (`mentor_observation IS NULL OR char_length(mentor_observation) <= 500`) on `mentor_interactions`. Includes a `COMMENT ON COLUMN` documenting the R3 contract. Rollback path documented in file header. |

### Supabase SQL Run in Session

1. Pre-flight audit query: `SELECT hub_id, COUNT(*) AS non_null_rows, COUNT(*) FILTER (WHERE char_length(mentor_observation) > 500) AS over_500_rows FROM mentor_interactions WHERE mentor_observation IS NOT NULL GROUP BY hub_id;` — returned 1 offender on private-mentor hub.
2. Offender identification: `SELECT id, char_length(mentor_observation) FROM mentor_interactions WHERE char_length(mentor_observation) > 500;` — returned `683889e1-8300-426e-92e3-9eff814232d8` at 525 chars, created 2026-04-12.
3. Cleanup: `UPDATE mentor_interactions SET mentor_observation = NULL WHERE id = '683889e1-8300-426e-92e3-9eff814232d8';` — re-verified count at 0.
4. Migration applied via Supabase SQL editor — `Success. No rows returned`.
5. Reject-case test (600 chars, direct INSERT) — rejected with `23514: violates check constraint "mentor_observation_length_check"`.
6. Accept-case test (400 chars, direct INSERT) — succeeded with `id 65b546cd-a638-4b33-ba7a-382150f0667e`.
7. Cleanup of accept-case test row: `DELETE FROM mentor_interactions WHERE id = '65b546cd-a638-4b33-ba7a-382150f0667e';`.
8. End-to-end live path verification: fresh evening reflection via `/private-mentor` produced a new row with `obs_length ≤ 500` and a correctly-shaped structured observation. Mentor quoted it correctly in chat.

### Files NOT Changed

- `sage-mentor/profile-store.ts:781` (the `JSON.stringify` site for `passions_detected`) — audit completed but fix deferred to session 13 by founder decision. Marked as Deferred with reasoning below.
- `sage-mentor/profile-store.ts:911–913` (`computeRollingWindow` defensive parse) — intentionally untouched. Remains a backstop for mixed historical rows.
- `website/src/lib/context/mentor-context-private.ts:679–686` (`rowToSignal` defensive parse) — intentionally untouched. The comment at lines 668–675 explicitly anticipates Option 2 and commits to keeping the parse as a backstop even after the writer fix lands.
- `website/src/app/api/mentor/founder/history/route.ts` and `.../private/history/route.ts` — pass-through select of `passions_detected`, no server-side parsing, no current client consumer. No change needed for Option 2.

## Verification Completed This Session

- **Option 1 (R1 extension to reflect)** — verified live. Founder submitted a fresh evening reflection via `/private-mentor`. SQL check confirmed the new row wrote `hub_id: 'private-mentor'` with `interaction_type: 'evening_reflection'`. Mentor quoted the Impression presented line from the new row: *"Practitioner interrupted oknos at the synkatathesis stage ..."* 0a status: **Verified**.
- **Option 1 (R1 extension to baseline-response)** — Wired (Path A). No fresh baseline run was executed (would have duplicated the reflect verification without adding information). All four call sites were replaced and Vercel Green. 0a status: **Wired**. Will be Verified organically next time a baseline is run.
- **Option 3 (line 445 review — now line 466 after the edit)** — Wired (Path A). Table is empty (zero snapshot rows on either hub). The fix was code-only; once the first baseline snapshot writes, the `contextHub` routing path will be exercised organically. 0a status: **Wired**.
- **Option 4 (R3 CHECK constraint backstop)** — Verified end-to-end. See the Supabase SQL list above: pre-flight clean, reject case (600 chars) rejected with the expected error code and constraint name, accept case (400 chars) succeeded, test row cleaned up, live reflect-route write path produced a valid structured observation well inside the backstop. 0a status: **Verified**.
- **Option 2 (remove JSON.stringify)** — reader audit completed, fix not executed this session. 0a status: **Designed** (audit complete, scope confirmed, verification method fixed).

## Next Session Should

**Execute Option 2** — remove `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781`. Reader audit already done; re-read the audit before executing.

### Reader audit — record of findings (for session 13 to rely on)

One writer:
- `sage-mentor/profile-store.ts:781` — `passions_detected: JSON.stringify(interaction.passions_detected || []),`.

Four reader sites:

1. `sage-mentor/profile-store.ts:911–913` — `computeRollingWindow`. Defensive: `typeof interaction.passions_detected === 'string' ? JSON.parse(…) : (… || [])`. Safe after writer fix — new rows hit else-branch, old rows hit JSON.parse branch.
2. `website/src/lib/context/mentor-context-private.ts:679–686` — `rowToSignal` "Likely assent" line. Defensive typeof/JSON.parse/try-catch. The comment at lines 668–675 explicitly states this reader **stays defensive even after Option 2 lands** as a backstop for mixed historical rows. Safe after writer fix.
3. `website/src/app/api/mentor/founder/history/route.ts:57` — raw select, pass-through to JSON response. No server-side parsing. No current client consumer (grep confirmed).
4. `website/src/app/api/mentor/private/history/route.ts:57` — same as above for private-mentor hub.

Conclusion: Safe. PR1 is trivially satisfied (single writer).

### Execution plan for Option 2

1. Change `sage-mentor/profile-store.ts:781` from `passions_detected: JSON.stringify(interaction.passions_detected || []),` to `passions_detected: interaction.passions_detected || [],`. Leave the inline-comment convention intact; add a short comment referencing this handoff and Session 13 if founder wants the audit trail visible.
2. Risk classification: **Elevated** under 0d-ii (existing user-facing functionality — mentor context assembly — depends on this column). Rollback = revert the single-line change. Verification step below.
3. Push to GitHub Desktop → Vercel Green.
4. Live verification:
   - Submit a fresh evening reflection via `/private-mentor`.
   - Supabase SQL: `SELECT id, created_at, jsonb_typeof(passions_detected), passions_detected FROM mentor_interactions ORDER BY created_at DESC LIMIT 1;` — expected `jsonb_typeof = 'array'` (not `'string'`), column renders as a JSON array of passion objects.
   - Ask the mentor to quote the "Pattern match" line from the most recent Recent Interaction Signals entry — expected format `<sub_species> (<root_passion>, freq N)`. Confirms the rolling-window aggregator reads and counts correctly on the new row.
5. **Recommended post-fix disposition of the defensive readers**: keep both. They're zero-cost on the clean path and catch any mixed historical rows. The `mentor-context-private.ts` comment already commits to this posture. Do not remove them unless founder explicitly decides to.

## Blocked On

- Nothing for Option 2.
- Mentor memory architecture ADR — still unscoped. Blocks morning check-in / weekly mirror / journal-question surfacing work.
- Journal scoring page — still blocked on Option A/B/C decision (session 8 carry-over).

## Open Questions

- **Whether to remove the two defensive readers after Option 2 is Verified.** Current posture: keep both as backstops. The `mentor-context-private.ts` comment explicitly commits to this. Founder may revisit after Option 2 has been live for a while.
- **Whether `getProfileSnapshots` at `/api/founder/hub` line 466 should filter by both `'founder-mentor'` AND `'private-mentor'`** when the request hub is founder-mentor and no private snapshots exist. Currently the `contextHub` routing gives correct-hub filtering; the concern is only about what happens when a founder-mentor chat session wants visibility of private-mentor baseline snapshots. Not in scope this session. Logged as a follow-up.
- All session-11 open questions remain open:
  - `/private-mentor` page UI "Start new conversation" control.
  - Mentor "comments" / extra-instruction field not persisting on page reload.
  - Whether `recordInteraction` should accept `passions_detected` as an array directly at the type level (it already does via the TypeScript signature — the bug is purely the `JSON.stringify` wrap at the call site). Option 2 resolves this.

## Deferred (Known Gaps, Not This Session)

- **Option 2 — remove `JSON.stringify(...)` at `sage-mentor/profile-store.ts:781`.** Reader audit completed, fix queued for session 13. Elevated risk. Founder chose to close session 12 before executing. Trigger to revisit: session 13 opening.
- **Baseline-response full live verification.** The R1-extension edit to baseline-response was Wired (Path A) this session. Fully Verified status waits for the next time a baseline is run.
- **Line 466 (was 445) getProfileSnapshots full live verification.** Wired (Path A) — `mentor_profile_snapshots` table is currently empty. Verified status waits for the first real baseline snapshot to write.
- **Archival of pre-2026-04-13 contaminated rows.** One row (`683889e1-…`) was nulled this session for the CHECK pre-flight. Remaining contaminated rows on founder-mentor (~10) are now capped at 500 chars by the new constraint — but legacy rows created before the constraint are not retroactively validated. They remain in the table as-is (the CHECK only applies at write time, and the single offender was nulled, so the constraint accepted the migration). Tidy-up only. Less urgent post-R3.
- **`/private-mentor` "Start new conversation" UI control + comments-field persistence.** Unchanged.
- **Mentor memory architecture ADR.** Still no draft.
- **Journal scoring page** — Option A/B/C decision (session 8 carry-over).
- **Public `/api/reflect`, `/api/score`, baseline-assessment writer paths.** Silent-swallow pattern still unverified there.

## Process-Rule Citations

- **PR1 — respected.** R1 extension proven on `/api/mentor/private/reflect` first (via fresh evening reflection, Verified live), only then applied to `/api/mentor/private/baseline-response`. The line-466 fix and the CHECK constraint are single-change surfaces (PR1 trivially satisfied). Option 2 audit was the PR1 reader-enumeration step — the actual code change waits for session 13 and will verify on one write→read cycle before anything else.
- **PR2 — respected.** R1 extension on reflect verified in-session with a fresh evening reflection. CHECK constraint verified in-session with both reject and accept cases, plus an end-to-end live reflect-route write to confirm the normal path still works. Line 466 and baseline-response extension were Wired-only by founder decision (empty snapshot table, no baseline to verify against) — both explicitly logged as Wired, not claimed as Verified.
- **PR3 — N/A.** No safety-critical surface touched.
- **PR4 — N/A.** No new endpoint designed. Existing model selection unchanged.
- **PR5 — see Knowledge-Gap Carry-Forward below.**
- **PR6 — N/A.** No safety-critical function touched.
- **PR7 — applied.** Option 2 explicitly deferred with reasoning: audit complete, scope confirmed, fix out of scope for session 12 per founder's session-close signal. Trigger to revisit: session 13 opening. Also: defensive-reader disposition post-Option-2 explicitly deferred with reasoning (current posture = keep both as backstops; founder may revisit later).
- **PR8 — no candidates to promote this session.** The session-11 first-observation candidate "A function's parameter may already accept a value that's been deliberately omitted by callers" was not re-encountered. The session-10 first-observation candidate "JSONB columns can hold a JSON-encoded string scalar that looks like an array but fails Array.isArray" was confirmed via the Option 2 reader audit (this is the exact pattern being fixed), but counts as the second observation, not the third — no promotion yet.

## Knowledge-Gap Carry-Forward

- **KG8 (Hub-Label Consistency) — actively applied this session.** Used as the referenced rationale for (a) the R1 extension to reflect + baseline-response, (b) the line-466 fix, and (c) the named-constant pattern. No drift — stable at three observations, promoted in session 11.
- **KG9 (The /private-mentor Page Is a Façade) — stable.** Referenced in session-12 work planning but not directly triggered. Remains at three observations.
- **Carry-forward from session 10: "Storage format vs payload shape — JSONB columns can hold a JSON-encoded string scalar that looks like an array but fails Array.isArray."** Reinforced by the Option 2 reader audit — this is exactly the bug being fixed. Second observation. One more re-encounter triggers promotion per PR5.
- **Carry-forward from session 11: "A function's parameter may already accept a value that's been deliberately omitted by callers."** Not re-encountered this session. Stable at one observation.

## Stewardship / Tacit-Knowledge Findings

- **T-series: live verification is cleaner when the verification probe writes a row of a distinguishable type than when it relies on ordering.** Session 12's R3 end-to-end check filtered by `interaction_type = 'evening_reflection'` and still had to reason about an intermediate "refresh do-over" row. Noted but not promoted.
- **F-series (Efficiency tier): the `contextHub` variable was already present at /api/founder/hub when the line-466 hardcode was introduced.** This means the fix was a one-token change because the plumbing was already done. F-series lesson: when fixing a hardcode, check whether the correct variable is already in scope — it often is. Not promoted; steady-state awareness.
- **F-series (Efficiency tier): the CHECK-constraint migration flow revealed that Supabase SQL editor is the project's current migration runner.** Founder confirmed the flow in-session. This is the first migration exercised end-to-end in a session; documentation of "how to apply a migration" is now implicit in this handoff. Worth formalising into a short operational doc if another migration is queued soon.

## Handoff Notes

- **Option 2 is the single remaining task in this work group.** After Option 2 is Verified, the `JSON.stringify` / defensive-parse pair at `passions_detected` becomes the only remaining writer-side storage format issue on `mentor_interactions`. The table's schema-level contracts will then be: (1) R3 CHECK on mentor_observation length, (2) proper JSONB storage on passions_detected. Clean.
- **The session-12 work touched four distinct surfaces in one session** (R1 extension to two endpoints, line-466 review, CHECK constraint migration, Option 2 audit). Founder ran them in my recommended order with PR1 honoured at each transition. No surprises, no rollbacks, no failed deploys.
- **Vercel Green was reached three times this session**: once after the reflect R1 extension, once after the founder/hub + baseline-response batch, once after the CHECK migration commit. Each deploy was consequence-checked before the next change.
- **The intermediate "refresh do-over" row** on the private-mentor hub (35 mins before session close, between the R3 end-to-end test row and the earlier reflect test row) is harmless. Standard reflect write, passes the CHECK, no action needed.
- **One known-good rollback path exists for every item Verified this session**: R1 extension reverts cleanly (single commit), line 466 reverts cleanly (single token), CHECK constraint rollback is documented in the migration file header (`DROP CONSTRAINT IF EXISTS mentor_observation_length_check`).
