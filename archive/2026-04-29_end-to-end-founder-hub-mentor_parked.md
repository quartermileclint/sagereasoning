# End-to-End Founder-Hub Mentor Pipeline — Parked Reference

**Status:** Parked — independent reference for the founder-hub mentor conversation. To be tweaked later.
**Pending tweak (known, not actioned):** Distress detection (`enforceDistressCheck(detectDistressTwoStage(...))`) needs wiring per PR6 / R20a. The page-side `data.distress_detected` handler is present but currently inert because the route does not invoke detection. This tweak is held for a future session and is not part of this parked reference's scope.
**Date captured:** 2026-04-29.
**Captured under:** Session Opening Protocol (`/adopted/session-opening-protocol.md`).
**Decision-log reference:** `D-MENTOR-PIPELINE-SNAPSHOT-2026-04-29` in `/operations/decision-log.md`.
**Companion file:** `/archive/2026-04-29_end-to-end-mentor-pipeline_snapshot.md` (the shared rollback baseline; this file is the founder-hub-scoped duplicate with uniquely-named steps).

---

## Why this file exists

Today, the founder-hub mentor conversation surface (at `sagereasoning.com/founder-hub`) and the private mentor conversation surface (at `sagereasoning.com/private-mentor`) are served by the **same** backend pipeline (`/api/founder/hub`), distinguished only by the `hub_id` value on the request body (`'founder-hub'` vs `'private-mentor'`).

The founder-hub mentor conversation works as currently described in this file and should continue to work that way. Subsequent work to correct the private-mentor flow may diverge it from today's shared pipeline. This document captures the founder-hub-scoped view of the pipeline with **uniquely-named steps (`FH-01` through `FH-24`)** so that future changes to the private-mentor flow do not implicitly modify this reference.

The step content here is identical in behaviour to the snapshot's prose-only steps. Only the names are unique.

---

## Files referenced

- Page: the founder-hub mentor conversation surface posts to `/api/founder/hub` with `hub_id: 'founder-hub'`.
- Route: `/website/src/app/api/founder/hub/route.ts`.
- Context loaders: `/website/src/lib/context/mentor-context-private.ts`, `/website/src/lib/context/practitioner-context.ts`, `/website/src/lib/context/project-context.ts`, `/website/src/lib/context/mentor-knowledge-base-loader.ts`, `/website/src/lib/context/stoic-brain-loader.ts`.
- Profile + observation persistence: `/website/src/lib/mentor-profile-store.ts`, `/website/src/lib/logging/mentor-observation-logger.ts`, `/sage-mentor/profile-store` (`recordInteraction`).

---

## End-to-end steps (founder-hub mentor — `FH-01` to `FH-24`)

### On the browser (the founder-hub page)

**FH-01 — Capture and append.**
The page captures the founder's typed text. It appends a "human" bubble to the message list immediately. The compose input is cleared and a loading state is shown.

**FH-02 — Outbound POST.**
The page calls `authFetch('/api/founder/hub')` with body `{ agent: 'mentor', message, conversation_id, hub_id: 'founder-hub' }`. `conversation_id` is `null` for the first message of a new thread; otherwise the stored thread id.

### On the server (`/api/founder/hub`, POST handler)

**FH-03 — Rate-limit and authentication gate.**
The server applies the admin rate limit, then enforces `requireAuth`, then checks the request user id matches `FOUNDER_USER_ID`. Non-founder requests are rejected with 403.

**FH-04 — Body validation.**
The server validates that `hub_id` is one of `['founder-hub', 'private-mentor']`, that `message` is a string of at least two characters, and that the message length is within `TEXT_LIMITS.long`. For founder-hub, the effective hub id resolves to `'founder-hub'`.

**FH-05 — Conversation row.**
If `conversation_id` is null, a new row is inserted into `founder_conversations` with `primary_agent: 'mentor'`, `hub_id: 'founder-hub'`, and `title: <first 100 chars of message>`. If a `conversation_id` is provided, the existing row is reused.

**FH-06 — History load.**
The server reads all rows from `founder_conversation_messages` for this `conversation_id`, ordered oldest-first.

**FH-07 — Save founder message.**
The founder's message is inserted into `founder_conversation_messages` with `role: 'founder'`. This save is awaited before the LLM call.

**FH-08 — Build mentor system prompt.**
Two cached system blocks are constructed:
- Block 1: the Sage Mentor persona prompt (warm-but-honest mentor instructions, the eight April-2026 reasoning upgrades, mirror principle, R20d / R20b boundaries, Zone 3 deference) followed by the Mentor Knowledge Base loaded via `getMentorKnowledgeBase`.
- Block 2: the Stoic Brain context for six mechanisms — `passion_diagnosis`, `oikeiosis`, `value_assessment`, `kathekon_assessment`, `control_filter`, `iterative_refinement`.

Both blocks are marked with `cache_control: ephemeral` for the Anthropic prompt cache.

**FH-09 — Build conversation message list.**
The server walks the last 20 conversation history rows. Founder rows become `user` turns. Mentor agent rows become `assistant` turns. Observer rows are folded in as `user` turns prefixed with `[Observer — <agent>]: `.

**FH-10 — Layered context enrichment.**
The server loads in parallel:
- Practitioner context (Layer 2b) — projected if `MENTOR_CONTEXT_V2=true`, otherwise the full mentor profile.
- Project context (Layer 3) at summary depth.
- The canonical stored mentor profile via `loadMentorProfile(userId)`.
- Founder-hub-scoped mentor observations — `contextHub` resolves to `'founder-mentor'` via `mapRequestHubToContextHub('founder-hub')`.
- Founder-hub-scoped profile snapshots.
- Recent interaction signals (last 7) when projection is on.
- Persisted pattern analysis under `profile.pattern_analyses['founder-mentor']` (read-only on absence).

**FH-11 — Compose enriched user message.**
The server appends to the founder's raw message: practitioner context, project context, recent interaction signals (if any), mentor observations block, profile snapshots block, and the recurring-patterns block (only on cache hit).

**FH-12 — Pattern-analysis write-back.**
If a persisted pattern analysis was found at FH-10, the server performs a read-modify-write on the encrypted profile blob via `saveMentorProfile`, awaited (Vercel KG1 rule 2). Critical-class write under PR6.

**FH-13 — Audit row and token logging.**
The server logs a `[mentor-context-tokens]` line. If `MENTOR_CONTEXT_V2=true`, it awaits `recordSessionContextSnapshot(userId, summary, hash)`.

**FH-14 — Anthropic call (the mentor reply).**
The server calls `anthropic.messages.create` with model `claude-sonnet-4-6`, `max_tokens: 4000`, `temperature: 0.4`, the two cached system blocks from FH-08, and the message list assembled in FH-09 (with the enriched user message from FH-11 appended). The response text is the mentor's reply.

**FH-15 — Save mentor reply.**
The mentor reply is inserted into `founder_conversation_messages` with `role: 'agent'`, `agent_type: 'mentor'`, and `pipeline_meta` including model, token usage, duration, and (for mentor) `pattern_source` and `pattern_persistence`.

**FH-16 — Knowledge persistence.**
A second LLM call to `claude-haiku-4-5-20251001` extracts a third-person developmental observation from the exchange. On successful validation by `logMentorObservation`, the observation is written to `mentor_observations_structured` and `mentor_interactions.mentor_observation` is populated. The interaction row is then written via `recordInteraction` with `hub_id: 'founder-mentor'`.

**FH-17 — Observer agents in parallel.**
The four other agents (`ops`, `tech`, `growth`, `support`) each receive a brief observer-mode prompt and run via `getObserverContribution`. Each successful contribution is saved to `founder_conversation_messages` with `role: 'observer'`, `agent_type`, and `relevance_score`.

**FH-18 — Ops "recommended action" synthesis.**
A final Ops pass via `getOpsRecommendedAction` produces a recommended action, risk classification, risk reasoning, and session prompt. The Session Opening Protocol pointer is prepended to the session prompt at response-assembly time. The output is saved as another observer row.

**FH-19 — Conversation timestamp update.**
`founder_conversations.updated_at` is set to the current ISO timestamp.

**FH-20 — Response returned.**
The server returns JSON: `{ conversation_id, primary, observers[], recommended_action, message_count }`. CORS headers applied.

### Back on the browser

**FH-21 — Distress-detected branch (currently dead code; pending tweak).**
The page checks `data.distress_detected`. Today, the `/api/founder/hub` route does **not** invoke `enforceDistressCheck` / `detectDistressTwoStage`, so this flag is never set on responses from this route. The page-side handler is therefore dead code on the founder-hub side. This is the **known pending tweak** for the founder-hub flow: distress detection needs wiring per PR6 / R20a. Held for a future session.

**FH-22 — Conversation id capture.**
If `conversation_id` is returned and the page does not yet hold one in state, the returned id is stored.

**FH-23 — Render mentor reply.**
`data.primary.content` is appended to the message list as a "mentor" bubble. The founder-hub page may also render observer contributions (`observers[]`) and the recommended action (`recommended_action`) as separate UI elements.

**FH-24 — Proximity / state refresh.**
Any page-side state refresh (e.g., proximity ring, conversation list) is triggered after the response is processed. Specific refresh behaviour depends on the founder-hub page's local logic, not the route.

---

## What is parked

This file is the founder-hub-scoped reference at the moment the snapshot was taken. It will be tweaked later to reflect:

- **Distress detection** wired into `/api/founder/hub` so the founder-hub mentor conversation gates Zone 3 inputs ahead of the mentor reply (per PR6 / R20a). Adding this affects FH-08 through FH-15 in some form (specifically: a synchronous safety check between FH-07 and FH-14, with an early-return path that suppresses FH-14–FH-18 when the gate fires). The exact placement is a design choice for the future tweak session.
- Any divergence from the private-mentor flow that emerges when private-mentor corrections are applied (e.g., if the private-mentor flow drops observer agents on its surface, the founder-hub flow keeps them; if the private-mentor flow changes its persistence pattern, the founder-hub flow keeps the current `recordInteraction` shape).

Until the founder-hub tweak session, this file describes the founder-hub mentor conversation as it currently behaves, with uniquely-named steps so private-mentor changes do not bleed into it implicitly.

---

## Rollback

If a future founder-hub tweak goes wrong, this file is the behavioural baseline to restore against. The implementation rollback uses git history; this document is the behavioural reference.
