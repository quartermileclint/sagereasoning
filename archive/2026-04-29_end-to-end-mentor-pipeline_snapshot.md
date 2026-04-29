# End-to-End Mentor Pipeline — Snapshot

**Status:** Milestone — rollback target before private-mentor corrections.
**Date captured:** 2026-04-29.
**Captured under:** Session Opening Protocol (`/adopted/session-opening-protocol.md`).
**Decision-log reference:** `D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29` in `/operations/decision-log.md`.
**Companion file:** `/archive/2026-04-29_end-to-end-founder-hub-mentor_parked.md` (founder-hub-scoped duplicate with uniquely-named steps; parked).

---

## Purpose

This document is a faithful as-built record of what happens, end to end, when the founder enters a message into either:

- the **private mentor** conversation surface at `sagereasoning.com/private-mentor`, or
- the **founder-hub mentor** conversation surface at `sagereasoning.com/founder-hub`.

Today, both surfaces are served by the same backend pipeline (`/api/founder/hub`), distinguished only by a `hub_id` value on the request body (`'private-mentor'` or `'founder-hub'`). This snapshot captures that shared pipeline as the rollback baseline. Subsequent work to correct the private-mentor flow may diverge it from the shared pipeline; the founder-hub-scoped duplicate (companion file) preserves the founder-hub view of the pipeline so future private-mentor changes do not implicitly modify it.

KG3 (hub-label end-to-end contract) is the directly relevant knowledge-gap entry. The pipeline relies on a single mapper (`mapRequestHubToContextHub`) to translate request-side hub labels (`'founder-hub'`, `'private-mentor'`) into context-side labels (`'founder-mentor'`, `'private-mentor'`).

---

## Files referenced

- Page: `/website/src/app/private-mentor/page.tsx` (private mentor) — and the equivalent page wiring on `/founder-hub`, which posts to the same endpoint.
- Route: `/website/src/app/api/founder/hub/route.ts`.
- Context loaders: `/website/src/lib/context/mentor-context-private.ts`, `/website/src/lib/context/practitioner-context.ts`, `/website/src/lib/context/project-context.ts`, `/website/src/lib/context/mentor-knowledge-base-loader.ts`, `/website/src/lib/context/stoic-brain-loader.ts`.
- Profile + observation persistence: `/website/src/lib/mentor-profile-store.ts`, `/website/src/lib/logging/mentor-observation-logger.ts`, `/sage-mentor/profile-store` (`recordInteraction`).

---

## End-to-end steps

### On the browser (the page itself)

**Step 1 — Capture and append.**
The page captures the founder's typed text. It appends a "human" bubble to the message list immediately. The compose input is cleared and a loading state is shown. Reference: `sendMessage` in `/website/src/app/private-mentor/page.tsx`.

**Step 2 — Outbound POST.**
The page calls `authFetch('/api/founder/hub')` with body `{ agent: 'mentor', message, conversation_id, hub_id }`. The `hub_id` is `'private-mentor'` from the private-mentor page and `'founder-hub'` from the founder-hub page. `conversation_id` is `null` for the first message of a new thread; otherwise the stored thread id.

### On the server (`/api/founder/hub`, POST handler)

**Step 3 — Rate-limit and authentication gate.**
The server applies the admin rate limit, then enforces `requireAuth`, then checks the request user id matches `FOUNDER_USER_ID`. Non-founder requests are rejected with 403.

**Step 4 — Body validation.**
The server validates that `hub_id` is one of `['founder-hub', 'private-mentor']`, that `message` is a string of at least two characters, and that the message length is within `TEXT_LIMITS.long`.

**Step 5 — Conversation row.**
If `conversation_id` is null, a new row is inserted into `founder_conversations` with `primary_agent: 'mentor'`, `hub_id: <effectiveHubId>`, and `title: <first 100 chars of message>`. If a `conversation_id` is provided, the existing row is reused.

**Step 6 — History load.**
The server reads all rows from `founder_conversation_messages` for this `conversation_id`, ordered oldest-first.

**Step 7 — Save founder message.**
The founder's message is inserted into `founder_conversation_messages` with `role: 'founder'`. This save is awaited before the LLM call to ensure the message is persisted even if the LLM step fails.

**Step 8 — Build mentor system prompt.**
Two cached system blocks are constructed:
- Block 1: the Sage Mentor persona prompt (warm-but-honest mentor instructions, the eight April-2026 reasoning upgrades, mirror principle, R20d / R20b boundaries, Zone 3 deference) followed by the Mentor Knowledge Base loaded via `getMentorKnowledgeBase`.
- Block 2: the Stoic Brain context for six mechanisms — `passion_diagnosis`, `oikeiosis`, `value_assessment`, `kathekon_assessment`, `control_filter`, `iterative_refinement` — loaded via `getStoicBrainContextForMechanisms`.

Both blocks are marked with `cache_control: ephemeral` for the Anthropic prompt cache.

**Step 9 — Build conversation message list.**
The server walks the last 20 conversation history rows. Founder rows become `user` turns. Mentor agent rows become `assistant` turns. Observer rows are folded in as `user` turns prefixed with `[Observer — <agent>]: `.

**Step 10 — Layered context enrichment (mentor-only).**
The server loads in parallel:
- Practitioner context (Layer 2b) — projected (topic-relevant) if `MENTOR_CONTEXT_V2=true`, otherwise the full mentor profile.
- Project context (Layer 3) at summary depth via `getProjectContext('summary')`.
- The canonical stored mentor profile via `loadMentorProfile(userId)`.
- Hub-scoped mentor observations via `getMentorObservationsWithParallelLog(userId, contextHub, 'founder-hub')`.
- Hub-scoped profile snapshots via `getProfileSnapshots(userId, contextHub)`.
- Recent interaction signals (last 7) via `getRecentInteractionsAsSignals(userId, profile, contextHub, 7)` (only when projection is on).
- Persisted pattern analysis under `profile.pattern_analyses[contextHub]` (read-only on absence — no recompute on this consumer per ADR-PE-01 §1.2 (c)).

`contextHub` is derived once via `mapRequestHubToContextHub(effectiveHubId)`.

**Step 11 — Compose enriched user message.**
The server appends to the founder's raw message, in order: practitioner context, project context, recent interaction signals (if any), mentor observations block, profile snapshots block, and the recurring-patterns block (only on cache hit).

**Step 12 — Pattern-analysis write-back.**
If a persisted pattern analysis was found in step 10, the server performs a read-modify-write on the encrypted profile blob via `saveMentorProfile`: the profile object is spread, `pattern_analyses[contextHub]` is set to the cache-hit value, and the result is saved. This is awaited (Vercel KG1 rule 2). Critical-class write under PR6.

**Step 13 — Audit row and token logging.**
The server logs a `[mentor-context-tokens]` line covering profile/signals/observations/snapshots/enriched-message token counts. If `MENTOR_CONTEXT_V2=true`, it awaits `recordSessionContextSnapshot(userId, summary, hash)` which writes a row to `session_context_snapshots`.

**Step 14 — Anthropic call (the mentor reply).**
The server calls `anthropic.messages.create` with model `claude-sonnet-4-6`, `max_tokens: 4000`, `temperature: 0.4`, the two cached system blocks from step 8, and the message list assembled in step 9 (with the enriched user message from step 11 appended). The response text is the mentor's reply.

**Step 15 — Save mentor reply.**
The mentor reply is inserted into `founder_conversation_messages` with `role: 'agent'`, `agent_type: 'mentor'`, and `pipeline_meta` containing `model`, `inputTokens`, `outputTokens`, `durationMs`, and (for mentor) `pattern_source` and `pattern_persistence`.

**Step 16 — Knowledge persistence (mentor-only).**
A second LLM call to `claude-haiku-4-5-20251001` extracts a third-person developmental observation from the exchange (using `message.trim().substring(0, 500)` and `primaryResponse.content.substring(0, 1000)` as inputs). The Haiku output is parsed as JSON with fields `observation`, `category`, `confidence`. If all three are present, `logMentorObservation` validates (50–500 chars, valid category, valid confidence) and writes to `mentor_observations_structured`. Only on success is `mentor_interactions.mentor_observation` populated. Failure or skip leaves the column null and downstream readers degrade gracefully ("acted at <proximity> proximity"). The mentor interaction row itself is then written via `recordInteraction` with `type: 'conversation'`, `hub_id: <contextHub>`, the truncated message description, the three default mechanisms applied, and the validated observation (or null).

**Step 17 — Observer agents in parallel.**
The four other agents (`ops`, `tech`, `growth`, `support`) each receive a brief observer-mode prompt: "Founder asked mentor X. Mentor responded Y. Do you have a relevant observation from your domain?" Each runs via `getObserverContribution`. Failures are logged and non-blocking (the observer's slot returns null and is filtered out). Each successful contribution is saved to `founder_conversation_messages` with `role: 'observer'`, `agent_type`, and `relevance_score`.

**Step 18 — Ops "recommended action" synthesis.**
A final Ops pass via `getOpsRecommendedAction` produces a recommended action, risk classification, risk reasoning, and a session prompt. The output is saved as another observer row with `agent_type: 'ops'`, content formatted as "Recommended Action / Risk / Session Prompt", and `pipeline_meta.type: 'recommended_action'`. The Session Opening Protocol pointer (`Governing frame: /adopted/session-opening-protocol.md`) is prepended to the session prompt at response-assembly time.

**Step 19 — Conversation timestamp update.**
`founder_conversations.updated_at` is set to the current ISO timestamp via `supabaseAdmin.update(...).eq('id', convId)`.

**Step 20 — Response returned.**
The server returns JSON: `{ conversation_id, primary, observers[], recommended_action, message_count }`. CORS headers applied.

### Back on the browser

**Step 21 — Distress-detected branch (currently dead code).**
The page checks `data.distress_detected`. Today, the `/api/founder/hub` route does **not** invoke `enforceDistressCheck` / `detectDistressTwoStage`, so this flag is never set on responses from this route. The page-side handler is therefore dead code. The R20a perimeter is currently the eight named POST routes in `r20a-invocation-guard.test.ts`; `founder/hub` is not among them. *(Known-pending tweak for the founder-hub side; held for separate decision and out of scope for this snapshot.)*

**Step 22 — Conversation id capture.**
If `conversation_id` is returned and the page does not yet hold one in state, the returned id is stored in React state.

**Step 23 — Render mentor reply.**
`data.primary.content` is appended to the message list as a "mentor" bubble. This is the moment the mentor's answer arrives on the page.

**Step 24 — Proximity ring refresh.**
The page calls `/api/reason` with `depth: 'quick'`. The proximity ring widget then displays the values returned by that call — though the displayed values in the current build are partly hard-coded in `fetchProximityScore` rather than derived from the `/api/reason` response.

---

## What the page does *not* render

The route runs steps 17 (observer agents) and 18 (Ops recommended action) on every mentor turn and persists their outputs to `founder_conversation_messages`. The private-mentor page reads only `data.primary.content` from the response and never renders observer or recommended-action content. The founder-hub page may render those rows; the private-mentor page does not. Cost implication: each private-mentor turn includes four observer LLM calls plus one Ops synthesis call that the founder does not see on that surface.

---

## Notes for future work

The known divergences between the two surfaces under today's shared pipeline are:

- **Distress detection** is needed on the founder-hub side per PR6 / R20a but is not currently wired into `/api/founder/hub`. The page-side handler is present but inert.
- **Observer-pipeline visibility** differs by surface: the founder-hub page surfaces observer contributions; the private-mentor page does not.
- **Hub-scoped reads/writes** rely on the single `mapRequestHubToContextHub` mapper. KG3 documents the end-to-end contract.

These are observations recorded with this snapshot. They are not corrections; corrections will be discussed and applied separately.

---

## Rollback

To roll back to this baseline after subsequent corrections:

1. Identify the corrections applied since 2026-04-29 by scanning the decision log for entries newer than `D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29` that touch `/api/founder/hub` or the private-mentor page.
2. For each correction, follow its individual rollback plan (recorded in the relevant decision-log entry per 0c-ii).
3. Verify by walking each numbered step above against the live behaviour. Any step whose behaviour does not match this document is either still mid-correction or has a documented superseding entry.

This snapshot does not encode the implementation details (line numbers, exact code) — only the observable end-to-end behaviour. Implementation rollback uses git history; this document is the behavioural reference.
