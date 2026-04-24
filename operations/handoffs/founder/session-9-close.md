# Session Close — 19 April 2026 (Session 9 — Private Mentor Channel Diagnosis)

## Decisions Made

- **Root cause identified for both broken channels.** The `/private-mentor` page chat routes to `/api/founder/hub` with `hub_id: 'private-mentor'` in the body. That `effectiveHubId` is honoured for conversation records but IGNORED by the mentor-context readers (hardcoded to `'founder-mentor'`) and by the observation writer (`logMentorObservation` hardcoded to `'private-mentor'`). Reader and writer are wired to different hub labels. Result: the 45 clean structured observations the founder has accumulated are stored at one label, queried at another, never surfaced. The legacy fallback then returns pre-2026-04-13 contaminated transcript rows (10 of them, all from April 12 on the founder-mentor hub).
- **Secondary finding: passions_detected shape mismatch.** `sage-mentor/profile-store.ts` line 1138 writes passions as `{ passion, false_judgement }`. Reader `rowToSignal` in `website/src/lib/context/mentor-context-private.ts` expects `{ root_passion, sub_species, false_judgement }`. The `root_passion` field never exists in storage, so `pattern_match` in Recent Interaction Signals always reads "—".
- **Session 9 is diagnosis-only.** No code changed. Founder approved R1 + R2 for the next session and R3 for a session after that.
- **Hub-label naming inconsistency flagged as tech debt.** Three labels in use (`founder-hub`, `founder-mentor`, `private-mentor`) with overlapping meaning. Not in scope to rename now — a mapping will be used for the R1 fix.

## Status Changes

- Diagnostic pre-processing channel (Recent Interaction Signals): **Broken — uncharacterised** → **Broken — root cause documented (hub-id hardcode + passions shape)**
- Observational synthesis channel (Observation History): **Broken — uncharacterised** → **Broken — root cause documented (hub-id hardcode; 45 clean observations exist but are unreachable via the wired reader)**
- `mentor_observations_structured` dataset: **Unknown content quality** → **Verified: 45 rows for founder profile, all high-quality third-person distilled observations from Haiku extraction in `/api/founder/hub`. All under hub_id='private-mentor'.**

## What Was Built

Nothing. Read-only diagnosis under the "diagnose first, present options, wait for decision" protocol.

## Verification Completed This Session

- Read the three key files named in the prompt plus supporting files (`sage-mentor/profile-store.ts`, `website/src/app/api/founder/hub/route.ts`, `website/src/app/private-mentor/page.tsx`, `supabase/migrations/20260412_hub_isolation.sql`, `supabase/migrations/20260413_logging_refactor_gap4.sql`).
- Ran 8 read-only Supabase queries with the founder pasting results. Confirmed: (a) founder has two auth accounts (gmail = profile-bearing; hotmail = no profile); (b) profile id `aabd3335-5895-451b-9caf-bd614c27fb6c`; (c) 45 clean structured observations all at hub_id='private-mentor'; (d) 10 contaminated April-12 rows at hub_id='founder-mentor'; (e) reader hardcode in `/api/founder/hub` targets 'founder-mentor', reader is never seeing the clean data.
- Confirmed via `website/src/app/private-mentor/page.tsx` line 158–165 that the page's chat POSTs to `/api/founder/hub` with `agent: 'mentor'`, `hub_id: 'private-mentor'`.

## Next Session Should

Implement R1 + R2 as specified in `operations/handoffs/session-10-prompt.md`. PR1 applies — prove on `/api/founder/hub` first, verify live via the private-mentor chat, then extend to the reflect and baseline-response endpoints only after verification. R3 (write a validated observation onto `mentor_interactions.mentor_observation` at reflect write time so the Impression line stops reading "—") is deferred to a subsequent session.

## Blocked On

- Nothing for R1/R2. The fix is self-contained and does not touch auth/session/cookie/deploy config.
- R3 is blocked on R1+R2 verification (PR1 discipline).

## Open Questions

- Hub-label renaming (`founder-hub` / `founder-mentor` / `private-mentor` → single consistent scheme). Tech debt.
- The 10 April-12 contaminated rows in `mentor_interactions` for hub_id='founder-mentor'. After R1 they become inert (no reader queries them on `/private-mentor` page anymore). Archive later for tidiness, not now.
- Whether the `/api/mentor/private/reflect` evening-reflection path should also be migrated to the hub-id-from-request pattern in R1, or only after verification. Recommendation: defer to session 11 — strict PR1 says single endpoint first.

## Deferred (Known Gaps, Not This Session)

- R3: writing a validated observation onto `mentor_interactions.mentor_observation` at reflect-write time (to populate the Impression line with an intentional, validated value instead of the proximity fallback). Detailed in the session-10 prompt.
- Archival of pre-2026-04-13 contaminated rows (10 rows on founder-mentor hub, 1 on private-mentor hub).
- Morning check-in / evening reflection surfacing as mentor channels — still blocked on mentor memory architecture ADR.
- Journal scoring page — blocked on Option A/B/C decision (from session 8).
- Public `/api/reflect`, `/api/score`, and baseline-assessment writers — silent-swallow patterns unverified.

## Process-Rule Citations

- **PR1** respected — no code changed this session; R1 scheduled for single-endpoint proof on `/api/founder/hub`.
- **PR2** N/A this session (diagnosis only).
- **PR6** unchanged — no safety-critical surface touched.
- **PR7** applied — R3 deferred with explicit reasoning (PR1 discipline + founder's decision).

## Knowledge-Gap Carry-Forward

- New candidate: "hub-label inconsistency between conversation shell, mentor context, and logger writes." First observation this session. If re-explained in session 10 or later, promote.
- New candidate: "The `/private-mentor` page is a façade over `/api/founder/hub` with `hub_id: 'private-mentor'` — not over `/api/mentor/private/reflect`." Bit me in option framing during this session. Worth remembering.

## Handoff Notes

- Founder's breakdown (19 April 2026) described symptoms accurately. The two "broken" channels both trace to the same wiring defect; fixing the wiring fixes both.
- The 45 structured observations the mentor has been generating are high quality and unused. R1 unlocks them.
- R2 is a 5-line change and is independent of R1. Bundle with caution (violates strict PR1) or sequence them — founder's call.
- The founder ended the session with: "Write the handoff and write me a prompt to proceed with R1 + R2 in a new session. Detail R3 which will be done in a subsequent session." No further fixes to propose.

---

## R3 — Detail (for a session after R1+R2 are verified)

**R3 — Fill the "Impression presented" line from validated observation at write time.**

**What it does:** Today, Recent Interaction Signals reads `row.mentor_observation` for the Impression line. Post-2026-04-13 that column is deliberately null on all new rows (to stop raw-LLM contamination). After R1 the fallback reads `acted at <proximity> proximity` — better than "—", but still weak. R3 populates the column intentionally with the same validated `structured_observation` text we already generate at reflect-time — so the reader has a purposeful, third-person, length-constrained, category-aware observation to show.

**Files and changes:**
- `website/src/app/api/mentor/private/reflect/route.ts`. After `logMentorObservation` succeeds, update the most-recent `mentor_interactions` row for the same profile + evening_reflection type with `mentor_observation = structuredObs.observation`. Two writes in one request (coupled). Wrap in `try/catch`, log failures with `console.error`, do not block the response.
- `website/src/app/api/founder/hub/route.ts`. Same pattern for the `recordInteraction` call at line 1171: after the Haiku-extracted observation is logged to `mentor_observations_structured`, also patch it onto the matching `mentor_interactions` row.
- `sage-mentor/profile-store.ts` `recordInteraction`. Optionally extend to accept `mentor_observation` again — but only from callers that pass validated text. Keep the documented rule: `mentor_observation` is never raw LLM text.

**Scope:** Small–medium. Two call sites. An extra UPDATE per write (by created_at DESC limit 1 on profile_id + interaction_type — or we return the inserted id from `recordInteraction` and UPDATE by id, which is cleaner).

**Risk under 0d-ii:** Standard. Reintroducing writes to a deprecated column is delicate, so a short code comment is required at every write site stating: "`mentor_observation` is written only from validated `mentor_observations_structured` content — never raw LLM text. See R3, session X."

**Why deferred:** PR1 — R1 and R2 must be verified live first. R3 also depends on R2 having stable semantics for the evening-reflection write path (the same row we would UPDATE).

**Trigger to revisit:** After R1 + R2 are both Verified (per 0a status vocabulary) in the session-10 close handoff.

**Founder verification method (R3, when built):**
1. Deploy.
2. Submit one new Evening Reflection.
3. Open fresh Mentor Conversation. Ask: `Quote the Impression presented line from the most recent Recent interaction signals entry.`
4. Expected: a third-person observation sentence matching the `structured_observation` content of that same reflection (visible also on `/reflections` via the Copy-for-mentor export). If it reads `acted at <proximity> proximity` or "—", R3 didn't land.

**Limitation flag for R3:** this re-opens the `mentor_observation` column to writes, which is the column that was the source of the April-12 contamination. The guardrail is that only validated `logMentorObservation` content is ever copied — but the discipline must be enforced by code comments and code review, not by the schema. Worth considering a CHECK constraint (`char_length <= 500`) as a backstop.
