# Knowledge Gaps — Concepts Requiring Repeated Re-Explanation

**Created:** 18 April 2026
**Source:** Build Knowledge Extraction Section 7 (17 April 2026)
**Purpose:** Session-opening reference. Before beginning work, check whether any of these concepts are relevant to today's tasks. If they are, read the resolution here first — don't re-derive it.

**Protocol:**
- At session open: scan this file for concepts touching today's scope.
- During session: if any concept requires re-explanation, flag it in the handoff note with a cumulative count.
- At 3 re-explanations: add the concept to this file (or update the existing entry) with the resolution that finally stuck.

---

## KG1 — Vercel Serverless Execution Model

**Re-explanations:** 4 (Sessions: 9 Apr redirect header stripping, 12 Apr fire-and-forget writes, 9 Apr Session 4 Fetch API behaviour, 17 Apr execution termination)

**Why it caused confusion:** Platform constraints were discovered one at a time through incidents rather than being documented as a set. Each session treated its discovery as a new fact rather than a known constraint.

**Plain-language resolution:** Vercel serverless functions have four rules that affect everything we build:

1. **No self-calls.** An API route cannot call another API route on the same deployment using fetch/HTTP. The www/non-www redirect strips Authorization headers. Use direct function imports instead.
2. **Await all database writes.** Vercel terminates execution after the response is sent. Any Supabase write that isn't awaited before the response may never complete. No fire-and-forget.
3. **Headers can be stripped on redirects.** If Vercel redirects a request (e.g., www → non-www), custom headers including Authorization may be lost.
4. **Execution terminates after response.** Background processing does not work. If the function returns a response, anything still running is killed.

**When this matters:** Any time a new endpoint is designed, any time database writes are added, any time one endpoint needs to call another.

---

## KG2 — Haiku Model Reliability Boundary

**Re-explanations:** 5 (Sessions: 8 Apr testing, 11 Apr Session 13, 11 Apr Session 14, 11 Apr Session 15, 17 Apr b)

**Why it caused confusion:** No documented model selection criteria existed. Haiku was the default for all depths until failures forced per-session rediscovery that it can't handle complex structured output.

**Plain-language resolution:** Haiku is fast and cheap but it can only produce reliable structured JSON for simple, single-mechanism queries (quick depth). For anything that requires multi-mechanism analysis, longer outputs, or structurally complex JSON — use Sonnet.

| Depth | Model | Why |
|---|---|---|
| Quick | Haiku | Single mechanism, short output, simple JSON structure |
| Standard | Sonnet | Multi-mechanism, longer output, complex JSON |
| Deep | Sonnet | Full analysis, comprehensive JSON |

The R20a distress classifier uses Haiku because its output is a single small JSON object (3 fields). This is within Haiku's reliability boundary.

**When this matters:** Any time a new endpoint is designed or an existing endpoint's depth is changed.

---

## KG3 — Build-to-Wire Gap (detectDistress History)

**Re-explanations:** 5 (Sessions: 6 Apr C, 11 Apr Session 13, 11 Apr Session 14, 11 Apr Session 15, 17 Apr b)

**Why it caused confusion:** A function can exist in the codebase (defined, exported, even imported) and still never be called in the execution path. TypeScript won't flag this because exported functions are assumed to be consumed externally. Each session that touched safety code had to independently discover whether wiring was complete.

**Plain-language resolution:** "Built" does not mean "wired." After implementing any safety-critical function:

1. Grep the codebase for actual **calls** to the function (not just imports or definitions).
2. Confirm at least one route file calls it in the request-response path.
3. If no route calls it, it is dead code — status is Scaffolded, not Wired.

The automated invocation test (when built) will catch this at CI time.

**When this matters:** Any time a safety function is created, modified, or routes are refactored.

---

## KG4 — Layer 2 Applicability vs Wiring

**Re-explanations:** 3 (Sessions: 7d, 15 Apr hold point, 15 Apr correction)

**Why it caused confusion:** The capability inventory used a binary framework: either an endpoint has Layer 2 (practitioner context) or it doesn't. But some endpoints *can't* have Layer 2 because they authenticate via API key, not user session. "Not wired" and "not applicable" look the same in a checklist.

**Plain-language resolution:** The context matrix must distinguish three states:

- **Wired** — endpoint has this layer, it's working
- **Not wired** — endpoint should have this layer but doesn't yet (this is a gap)
- **Not applicable** — endpoint can't have this layer (e.g., API-key auth endpoints have no user identity to load a profile for)

**When this matters:** Any capability audit or context layer review.

---

## KG5 — Token Budgets and Measurement

**Re-explanations:** 5 (Sessions: 7d, 7e, 14 Apr V2 verification, 15 Apr naming inversion, 17 Apr cost monitoring)

**Why it caused confusion:** Different sessions used different methods to count tokens — character count divided by 4, Anthropic API `usage.input_tokens`, offline estimation tools. Results didn't match, leading to conflicting claims about token usage.

**Plain-language resolution:** Use Anthropic API `usage.input_tokens` as the ground truth. The chars/4 estimate is a rough guide, not a measurement. When reporting token counts:

- Always state which method was used
- Label chars/4 estimates as "approximate"
- Use API measurements for any decision that involves money or context window limits

The naming inversion: "minimal" context level produces ~222 tokens; "condensed" produces ~139 tokens. The names suggest the opposite. This is a known quirk, not a bug — documented, accepted, will revisit at P3.

**When this matters:** Any cost analysis, context window budgeting, or comparison between context levels.

---

## KG6 — Composition Order Constraint

**Re-explanations:** 3 (Sessions: 7, 7g, 15 Apr Layer 3 wiring)

**Why it caused confusion:** The order in which context layers are injected into the LLM prompt matters for how the model treats the content, but this was only documented in code comments. New sessions didn't discover the constraint until implementation forced it.

**Plain-language resolution:** Two injection zones, each with a specific purpose:

- **System message blocks** (L1 Stoic Brain, L3 Agent Brains): Persistent expertise. The LLM treats these as foundational instructions. Cached by the provider.
- **User message** (L2b Practitioner, L4 Environmental, L5 Mentor KB): Per-request context. The LLM treats these as variable input.

Never put per-request context in system blocks (wastes cache, wrong authority level). Never put foundational expertise in user message (LLM gives it less weight).

**When this matters:** Any time context layers are added, modified, or wired to new endpoints.

---

## KG7 — Build-to-Wire Gap Pattern (Systemic)

**Re-explanations:** 5 (Sessions: 6 Apr C, 11 Apr Session 13, 14, 15, 17 Apr)

**Why it caused confusion:** This is the same root cause as KG3 but elevated to a pattern. It's not just detectDistress — it's a systemic tendency to believe that writing a function and updating its status constitutes wiring. The status vocabulary (0a) says "Wired" means "connects to live systems and functions end-to-end." But status was being updated based on code existing, not on invocation being verified.

**Plain-language resolution:** After implementing ANY function that must be in the execution path:

1. Write the function → status: **Scaffolded**
2. Import and call it from at least one route → status: still Scaffolded until verified
3. Grep the codebase and confirm the call exists in the route → status: **Wired**
4. Test the end-to-end path with a real input → status: **Verified**

Status advances only when the verification method for that step has been performed. "I wrote it" is not verification.

**When this matters:** Every status update on any module.

---

## KG8 — Hub-Label Consistency Across Writer, Reader, and Client

**Re-explanations:** 3 (Sessions: 9 (original), 10 (session-10 close noted second observation), 11 (R3 implementation))

**Why it caused confusion:** Hub labels (`'founder-mentor'`, `'private-mentor'`, `'founder-hub'`) appear in multiple places: the request body sent by `/private-mentor`, the writer's INSERT into `mentor_interactions.hub_id`, the reader's SQL `.eq('hub_id', ...)`, and the `logMentorObservation` writer. If any one of these uses a different label, rows get written under one hub and read from another, and the feature silently breaks (no error — just an empty result).

**Plain-language resolution:** Treat hub labels as end-to-end contracts. For any new endpoint that reads or writes `mentor_interactions` or `mentor_observations_structured`:

1. Does the client pass `hub_id` in the request body? If yes, use `mapRequestHubToContextHub(effectiveHubId)` in `/api/founder/hub` (and equivalent elsewhere) to map the request label to the context-reader label.
2. If the endpoint hardcodes a hub label (e.g., `/api/mentor/private/reflect` hardcodes `'private-mentor'`), verify that hardcode matches the reader's expected value. Document the hardcode in a comment so drift is visible.
3. Run one end-to-end probe: write a row via the new endpoint, then read via the mentor context, confirm the row appears.

**When this matters:** Any new endpoint touching `mentor_interactions` or any reader of hub-scoped mentor data. Any refactor of the hub label taxonomy.

---

## KG9 — The /private-mentor Page Is a Façade Over /api/founder/hub

**Re-explanations:** 3 (Sessions: 9 (original observation), 10 (session-10 close noted second observation), 11 (R3 design had to distinguish chat path from reflection path))

**Why it caused confusion:** The `/private-mentor` page has two user actions with completely different routing:
- **Chat messages** → POST to `/api/founder/hub` with `hub_id: 'private-mentor'`. Writes `mentor_interactions` rows with `interaction_type: 'conversation'`.
- **Evening reflections** → POST to `/api/mentor/private/reflect`. Writes a `reflections` row directly, then calls `updateProfileFromReflection` which writes a `mentor_interactions` row with `interaction_type: 'evening_reflection'`.

The page name suggests a single backend (`/api/mentor/private/*`), but chat traffic actually goes through the generic `/api/founder/hub` endpoint scoped to the private hub. This matters because bug fixes that target "the private mentor" often need to be applied at two different files.

**Plain-language resolution:** When investigating a `/private-mentor` issue:

1. Is the symptom about a **chat message** or an **evening reflection**? They go through different endpoints.
2. Chat message bugs → fix in `website/src/app/api/founder/hub/route.ts`.
3. Evening reflection bugs → fix in `website/src/app/api/mentor/private/reflect/route.ts`, or upstream in `sage-mentor/profile-store.ts` if the bug is in `updateProfileFromReflection`.
4. If a fix applies to both (e.g., R3 populating `mentor_observation`), plan for two edits in different files. Apply PR1: prove on one path first, verify live, then extend.

**When this matters:** Any feature that touches the private mentor's data-writing paths. Any verification probe must specify which path it's testing — chat vs evening reflection — and the verification prompt must filter accordingly (e.g., "most recent evening reflection entry" rather than just "most recent entry", since chat messages accumulate as most-recent between test reflections).

---

*This is a living document. When a concept hits 3 re-explanations across sessions, add it here with the resolution that worked. Check this file at the start of every session.*
