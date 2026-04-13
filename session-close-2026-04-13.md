# Session Close — 13 April 2026

## Decisions Made

- **Remove mentor_observation from persona.ts AFTER prompt**: All downstream consumers already set it to null. Removal confirmed safe after full audit of ring-wrapper.ts, llm-bridge.ts, proactive-scheduler.ts, support-agent.ts, and session-bridge.ts. The AfterResult type retains the field (always null) to avoid cascading type changes. → Reduces LLM prompt complexity and stops generating a deprecated field.

- **Add R20a distress detection to private reflect route**: Was entirely missing. Public reflect route had it; private did not. Both routes now scan `what_happened` and `how_i_responded` combined, and log detections to `analytics_events`. → Closes an R20a safety gap across all human-facing reflection endpoints.

- **Structured observation cutover activated**: After 5+ quality-reviewed observations passed three checks (third-person voice, correct category, specific/non-generic content), the retrieval path switched from `legacy_fallback` to `structured`. Confirmed live with `path=structured db_count=6` in Vercel logs. → The private mentor now uses validated, categorised observations for context instead of legacy raw text.

- **Use DB counter for cutover threshold**: Retrieval logic now reads `structured_observation_count` from `mentor_profiles` (accurate, atomic) instead of regex-counting text matches from the retrieved observations. → More reliable cutover decision.

## Status Changes

- `mentor_observation` field in persona.ts AFTER prompt: **Wired → Deprecated (removed from prompt)**
- R20a distress detection on private reflect: **Missing → Wired**
- R20a distress detection on public reflect: **Wired → Improved** (now scans both fields, logs to analytics)
- Structured observation retrieval path: **Scaffolded → Verified (cutover live)**
- Activation tracking columns (`first_structured_observation_at`, `structured_observation_count`): **Designed → Wired**
- `increment_structured_observation_count` RPC function: **Designed → Wired**
- Observation retrieval console logging: **Not started → Wired**

## Next Session Should

1. Check whether `db_count` continues incrementing correctly over the next few reflections (should match `mentor_observations_structured` row count)
2. Review whether the mentor's responses have noticeably improved now that structured observations are the active context path
3. Consider Task 5 from the original session plan: one-tap feedback signal after reflections ("did this feel accurate?") routing negative responses to a review queue, and subtle user-facing note when degraded mode fires
4. Address the founder hub route's missing R20a distress detection (same gap as private reflect had — flagged but not fixed this session)
5. Consider adding distress detection to other human-facing endpoints (score, evaluate, reason routes)

## Blocked On

- Nothing currently blocked

## Open Questions

- **Founder hub R20a gap**: The founder hub route (`/api/founder/hub`) has no distress detection. Same pattern as the private reflect route before this session's fix. Should this be next, or is the conversational nature of the hub a different case?
- **Legacy path retirement**: The legacy `mentor_observation` column in `mentor_interactions` still has old contaminated data. Once you're satisfied the structured path is performing well, we could stop querying it entirely. No rush — the parallel logging gives us comparison data.
- **Observation counter sync**: Observations logged before the migration didn't increment the counter. The sync query was provided and may have been run. If `db_count` doesn't match the actual row count, run the sync query again.
- **34-second reflection pipeline**: Six Vercel log rows spanning 14-48 seconds for a single reflection. Not urgent, but if response time becomes a UX concern, the post-response writes (observation log, counter increment, analytics) could be made fully non-blocking.
