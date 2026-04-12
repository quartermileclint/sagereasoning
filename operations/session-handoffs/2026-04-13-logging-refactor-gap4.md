# Session Close — 13 April 2026 (Logging Refactor + Gap 4 Build)

## Decisions Made

- **Logging architecture split into two functions**: Raw LLM text was being dumped into `mentor_observation` on `mentor_interactions` — a pass-through, not a distilled observation. Replaced with two purpose-built functions: `logMentorObservation()` (structured, validated, third-person) for the private mentor hub, and `logFounderHubEntry()` (founder's own words, typed) for the founder hub. Reasoning: the mentor's conversational output is not the same as a developmental observation. The structured contract forces distillation before storage, which is the data quality standard the mentor needs for longitudinal tracking.

- **`mentor_observation` column on `mentor_interactions` deprecated for new writes**: All three API routes that previously wrote to this field (private reflect, founder hub, baseline-response) now omit it. The column remains for backward compatibility / reading old data, but no new writes target it. New observations go to `mentor_observations_structured` table.

- **Contaminated data recommendation — ARCHIVE, don't purge**: The existing rows in `mentor_interactions` with non-null `mentor_observation` contain raw LLM response text (first-person, conversational). Recommendation: keep them archived in place. Reasons: (a) there are very few rows (system has been live only during P0 testing), (b) the data has zero value for the structured observation pipeline but deleting it would lose the interaction metadata (proximity_assessed, passions_detected, timestamps) which is still useful for the rolling window, (c) the `getMentorObservations()` function in `mentor-context-private.ts` still reads the old column — it should be migrated to `getStructuredMentorObservations()` once the new table has data, at which point old observations will naturally fall out of the retrieval window.

- **Gap 4 built as a database table + API + review views**: `gap4_entries` table stores prompted and spontaneous entries with divergence tracking, philodoxia-in-product-decision flag, and auto-suspect flagging. Review views (`gap4_month3_review`, `gap4_month6_review`) cross-reference Gap 2 passion log for philodoxia trends. The mentor holds the review — the system provides data only.

- **Sunday prompting schedule implemented with tapering**: Month 1 weekly, months 2–4 first Sunday of the month, months 5–6 no automatic prompts (self-initiated only). Schedule state tracked in `gap4_prompt_schedule` table.

## Status Changes

- `logMentorObservation()`: **Designed → Scaffolded** (function written, validated, but no caller yet produces structured observations — needs the LLM extraction prompt to be built)
- `logFounderHubEntry()`: **Designed → Scaffolded** (function written, but no UI caller yet)
- `mentor_observations_structured` table: **Designed** (migration written, not yet run in Supabase)
- `founder_hub_entries` table: **Designed** (migration written, not yet run in Supabase)
- `gap4_entries` table: **Designed** (migration written, not yet run in Supabase)
- `gap4_prompt_schedule` table: **Designed** (migration written, not yet run in Supabase)
- Gap 4 API route (`/api/mentor/gap4`): **Scaffolded** (POST/GET/PATCH handlers written, not yet tested)
- `gap4_month3_review` view: **Designed** (SQL written, not yet run)
- `gap4_month6_review` view: **Designed** (SQL written, not yet run)
- Contaminated `mentor_observation` writes: **Fixed** in 3 routes (reflect, founder hub, baseline-response)
- `session-bridge.ts` mentor_observation writes: **Flagged** (writes to `session_decisions` table — secondary clean-up, not blocking)

## Files Changed This Session

| File | Change |
|---|---|
| `website/src/lib/logging/mentor-observation-logger.ts` | **Created**: `logMentorObservation()`, `logFounderHubEntry()`, `getStructuredMentorObservations()`, validation logic, types |
| `supabase/migrations/20260413_logging_refactor_gap4.sql` | **Created**: `mentor_observations_structured`, `founder_hub_entries`, `gap4_entries`, `gap4_prompt_schedule` tables + `gap4_month3_review`, `gap4_month6_review` views |
| `website/src/app/api/mentor/gap4/route.ts` | **Created**: POST/GET/PATCH handlers, Sunday schedule logic, auto-suspect flagging |
| `sage-mentor/profile-store.ts` | **Modified**: Removed contaminated `mentor_observation` pass-through from `updateProfileFromReflection()` |
| `website/src/app/api/founder/hub/route.ts` | **Modified**: Removed contaminated `mentor_observation` pass-through from mentor knowledge write |
| `website/src/app/api/mentor/private/baseline-response/route.ts` | **Modified**: Removed contaminated `mentor_observation` pass-through from baseline recording |

## Contaminated Data — Detailed Recommendation

**What's contaminated:** Any row in `mentor_interactions` where `mentor_observation IS NOT NULL`. These contain raw LLM response text (first-person mentor language like "You showed growing capacity..." or "Founder hub conversation: [response snippet]").

**Volume:** Low — P0 testing only. Likely <20 rows total.

**Recommendation: ARCHIVE IN PLACE**

1. Do NOT delete the rows. The interaction metadata (proximity_assessed, passions_detected, mechanisms_applied, timestamps) is useful for the rolling window aggregation.
2. The `mentor_observation` column values in these rows are noise, not signal. They will not be fed into `getStructuredMentorObservations()` which reads from the new `mentor_observations_structured` table.
3. The old `getMentorObservations()` function in `mentor-context-private.ts` still reads from the old column. Migration path: once `mentor_observations_structured` has real data, swap the context injection to use `getStructuredMentorObservations()` from `mentor-observation-logger.ts`. At that point, the contaminated column becomes a historical artifact.
4. Optional: run a one-time UPDATE to set `mentor_observation = NULL` on existing rows to prevent them from being injected into mentor context via the old retrieval path. Low urgency since there are very few rows.

## Next Session Should

1. **Run the migration** (`20260413_logging_refactor_gap4.sql`) in Supabase SQL Editor. This creates 4 new tables and 2 views. Risk: Standard (additive, no existing tables modified).
2. **Build the LLM extraction prompt** that produces structured observations from the mentor's response. This is the caller for `logMentorObservation()` — the function exists but nothing calls it yet because the LLM needs to be prompted to return structured observation data in the new format (date, observation, category, confidence, source_context).
3. **Wire `getStructuredMentorObservations()`** into the private reflect and founder hub context injection, replacing `getMentorObservations()`.
4. **Start a Gap 4 cycle** via `PATCH /api/mentor/gap4 { action: 'start_cycle' }` once the migration is run.
5. **Optional clean-up**: NULL out contaminated `mentor_observation` values on existing `mentor_interactions` rows.

## Blocked On

- **Migration must run before any new code can be tested.** All four new tables are referenced by the new functions and API routes.
- **LLM extraction prompt needed** before `logMentorObservation()` has a live caller. The function validates and stores, but something needs to produce the structured input.

## Open Questions

- **Session-bridge contamination**: `sage-mentor/session-bridge.ts` also writes `mentor_observation` to `session_decisions` table (different from `mentor_interactions`). Same raw-text pattern. Should this be fixed in the same refactor, or is it acceptable for session bridge records to contain raw LLM observations? Lower urgency since session_decisions is a different data path.
- **Old `getMentorObservations()` migration timing**: When should the context injection swap from old to new retrieval? After the first 5–10 structured observations exist? Or immediately (which would mean no observation context until structured data accumulates)?
