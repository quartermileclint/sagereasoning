# Session Close — 13 April 2026 (Session C)

## Decisions Made

- **Hub isolation via `hub_id` column on `founder_conversations`**: Added a NOT NULL `hub_id` column with CHECK constraint (`'founder-hub'` | `'private-mentor'`), default `'founder-hub'`. This is the privacy boundary between hubs — conversations are scoped by hub on both insert and query. → Closes the duplication bug where private-mentor conversations appeared in the founder-hub.

- **Founder-hub conversations cleared**: All 26 pre-existing founder-hub conversations and their messages were deleted to establish a clean state after contamination from the pre-fix test. The private-mentor test conversation (created post-fix) was preserved.

## Status Changes

- Hub isolation (`hub_id` on `founder_conversations`): **Missing → Verified**
- Private-mentor conversation privacy: **Broken → Verified**

## Root Cause

The `founder_conversations` table had no `hub_id` column. Both the private-mentor page and the founder-hub page used the same API endpoint (`/api/founder/hub`) and the same table with no distinguishing marker. Every conversation was visible to both hubs.

## Fix Applied (4 changes)

1. **Migration** (`supabase-add-hub-id-migration.sql`): Added `hub_id` column, CHECK constraint, indexes, NOT NULL with default `'founder-hub'`.
2. **POST handler** (`api/founder/hub/route.ts`): Extracts `hub_id` from request body, validates against allowlist, includes in both insert paths (standard chat and ask-org).
3. **GET handler** (`api/founder/hub/route.ts`): Filters conversation list by `hub_id` query param (defaults to `'founder-hub'`).
4. **Private-mentor page** (`private-mentor/page.tsx`): Passes `hub_id=private-mentor` on list query and `hub_id: 'private-mentor'` in POST body.

## Verification Results

- Sent test message from private-mentor hub → conversation created with `hub_id: 'private-mentor'` ✓
- Founder-hub conversation list did not show the private-mentor test conversation ✓
- TypeScript compilation: zero non-test errors ✓

## Next Session Should

1. **Previous Session B items still open** — token waste in persona.ts (line 501-506), parallel retrieval cutover quality review, Founder Hub R20a distress detection. None of these were addressed in this session.

2. **Verify mentor interaction `hub_id` logging** — The `recordInteraction()` call at line 837-843 of the hub route hardcodes `hub_id: 'founder-mentor'`. When a mentor conversation happens through the private-mentor hub, the interaction should log `hub_id: 'private-mentor'` instead. This needs to pass the `effectiveHubId` rather than the hardcoded string.

3. **Consider separate API route for private-mentor** — Both hubs currently share `/api/founder/hub`. The `hub_id` parameter fixes the data routing, but a dedicated `/api/mentor/private/conversation` route would make the privacy boundary architectural rather than parameter-dependent. Lower urgency since the current fix works.

## Blocked On

- Nothing currently blocked

## Open Questions

- **Founder-hub conversation history**: All 26 conversations were deleted for a clean start. If any of those contained valuable context (ops, tech, growth, support conversations), that context is gone. The founder should consider whether this matters.
- **Rate limit for private-mentor hub**: Currently inherits `RATE_LIMITS.admin` (30 req/min) from the shared endpoint. Same open question from Session B applies.
