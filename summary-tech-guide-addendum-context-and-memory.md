# Summary Tech Guide — Addendum

## Context, Directives, and Persistent Memory: What Contributes to a Response

*An operational reference. Companion to the Summary Tech Guide and the Users Guide.
Its single purpose: so the founder can look at any agent — internal reasoning engine or external advice-giver — and confirm it is briefed on what it needs to know.*

Version: First edition, April 2026. Revised April 2026 to account for the orchestration endpoint `/api/founder/hub/route.ts`, which was missed in the first edition's scan. Changes: Section B (stack table) adds the orchestration row; Section D.6 is corrected — orchestration is wired at supervised level, not absent; Section G adds a second trace for the hub pipeline; Section I has its incorrect "orchestration does not exist" line removed and replaced with the actual, confirmed gaps.

Items marked **[TBD]** are unconfirmed. Items marked **[GAP]** exist in design but are not wired.

---

## Contents

A. Why this addendum exists
B. The full stack at a glance
C. Governance — what directs the work
D. The five context layers — what directs the response
E. Memory and persistence — how continuity is kept between sessions
F. The "open brain" question — what was proposed, what was built
G. End-to-end: a single reasoning call, traced
H. Founder verification checklist — is this agent briefed?
I. Known gaps and honest flags

---

## A. Why this addendum exists

A typical call on this project follows the shape **Goal → Observe → Think → Output**. Between the Goal arriving and the Output returning, a stack of directive material is assembled and injected into the reasoning model. If any layer of that stack is missing, stale, or misread, the output will drift — and the drift will be small enough that a non-technical founder may not notice until a pattern has accumulated.

There are two audiences for this document, both of them the founder.

The first is the founder trying to understand what shapes the answers the project's own reasoning engine gives. That is Sections B through G.

The second is the founder preparing to hand a task to an external agent (Claude, ChatGPT, a hired contractor, a future team member) and wanting to check that the agent has what it needs before it starts. That is Section H — a checklist you can print and work through in under five minutes before delegating anything consequential.

---

## B. The full stack at a glance

Nothing that follows is complicated. It is just a lot of pieces, and when they are listed separately, it is easy to lose one.

| Category | What | Where it lives | When it loads |
|---|---|---|---|
| **Governance** | manifest (R0–R20) | `/manifest.md` | Read at project start / session open |
| **Governance** | project instructions (P0–P7 plus PR1–PR9) | Project-level instructions (this is the document the founder configured per project) | Injected into every session |
| **Governance** | master index | `/INDEX.md` | Read at session open to navigate |
| **Governance** | adopted documents | `/adopted/` | Read when scope touches them |
| **Governance** | agent-facing docs | `/product/AGENTS.md` | Read by agents integrating the API |
| **Response context (L1)** | Stoic Brain | 8 JSON files in `/stoic-brain/` | Every reasoning call |
| **Response context (L2b)** | Practitioner profile | Supabase `mentor_profiles` (AES-256-GCM) | Every authenticated call |
| **Response context (L3)** | Project context | `/website/src/data/project-context.json` + Supabase `project_context` | Every operational call |
| **Response context (L4)** | Environmental context | `environmental-context.ts` loader | Optional — weekly scans |
| **Response context (L5)** | Mentor knowledge base | `mentor-knowledge-base-loader.ts` | Optional — mentor endpoints |
| **Agent brains** | Tech / Growth / Support / Ops | Four dedicated brain loaders in `/website/src/lib/context/` | Invoked by the hub orchestration endpoint |
| **Orchestration** | Founder hub route | `/website/src/app/api/founder/hub/route.ts` (1,505 lines) | Called by `/founder-hub` and `/private-mentor` pages; routes a founder message to a named agent, or runs Ask-the-Org mode (Tech/Growth/Support in parallel → Ops synthesis → Mentor review) |
| **Memory — continuity** | Session handoff notes | `/operations/session-handoffs/` | Read at session open; written at session close |
| **Memory — record** | Decision log | `/operations/decision-log.md` | Appended at each consequential decision |
| **Memory — learning** | Knowledge gaps register | `/operations/knowledge-gaps.md` | Checked at session open; updated at threshold |
| **Memory — analysis** | Session debriefs | `/operations/session-debriefs/` | Produced after significant events |
| **Reference** | Ethical analysis, research, KB | `/reference/`, `/research/`, `/knowledge-base/` | Loaded when relevant to scope |

That is the complete contribution surface. Seventeen rows. Anything outside this list is not part of the pipeline.

---

## C. Governance — what directs the work itself

These documents do not shape individual responses directly. They shape how the founder and any collaborating agent are expected to work, and they get injected at the session level, not the request level.

### C.1 The manifest — `/manifest.md`

The master governing document. Current version: **CR-2026-Q2-v4**. Contains rules R0 through R20.

| Rule band | Concern |
|---|---|
| R0 | Oikeiosis — every consequential decision evaluated against the widening circles |
| R1–R13 | Product constraints: no therapeutic implication, no employment evaluation, IP handling, free-tier structure, methodology fidelity, source citations, glossary enforcement |
| R14–R20 | Advanced safeguards: regulatory pipeline (R14), Sage Ops autonomy (R15), intelligence pipeline data (R16), intimate data (R17), honest certification (R18), honest positioning (R19), vulnerable user protection (R20) |

**Rule of thumb:** if an agent advising the founder has not been told the manifest exists, its advice is unbounded by the rules the project has committed to.

### C.2 The project instructions (P0–P7, PR1–PR9)

The other governing layer. These are the instructions the founder sets at the project level and that appear in every session context automatically. They cover:

- The seven-priority build sequence (P0 Foundations / R&D Phase through P7 Sage Ops Activation)
- The 0h hold point (test what we have on ourselves with real data before progressing to P1)
- The nine process rules (PR1–PR9) extracted from build-knowledge review, including single-endpoint proof before rollout, build-to-wire verification, synchronous safety systems, model-selection-as-constraint, and knowledge-gap carry-forward

**Rule of thumb:** if an agent is not looking at project instructions, it will not know the project is in P0. It will recommend P1+ work prematurely.

### C.3 The master index — `/INDEX.md`

Navigation layer. Maps 148 components, folder purposes, and the shared status vocabulary (Scoped → Designed → Scaffolded → Wired → Verified → Live). Read at session open so the agent knows where to look.

### C.4 The /adopted/ folder

Holds currently-governing documents beyond the manifest itself — including V3 adoption scope (philosophical framework fidelity). Drafts live in `/drafts/`. Superseded material moves to `/archive/`.

### C.5 `/product/AGENTS.md`

Agent-facing reference: the complete API guide for agent integrators. Not for human reading. An external AI agent calling into the project uses this to understand endpoints, tiers, skill contracts.

---

## D. The five context layers — what directs each response

Every reasoning call assembles up to five layers of context before the engine answers. Layers 1, 2b, and 3 fire on every call. Layers 4 and 5 are optional.

### D.1 Layer 1 — Stoic Brain (always, system message, cached)

The fixed philosophical framework. The same for every call, every user, every session.

**Source:** eight JSON files in `/stoic-brain/` — `stoic-brain.json`, `passions.json`, `virtue.json`, `action.json`, `value.json`, `psychology.json`, `progress.json`, `scoring.json`.

**Loader:** `/website/src/lib/context/stoic-brain-loader.ts` — function `getStoicBrainContext(depth)`.

**Token cost:** ~500–6,000 tokens depending on depth parameter (quick / standard / deep).

**Injection point:** system message block, cached across requests.

**Failure mode:** if the loader fails to read a JSON file, the whole reasoning surface breaks. This is by design — the engine should not run on a partial framework.

### D.2 Layer 2b — Practitioner context (authenticated calls, user message)

The personalisation layer. What the engine knows about the specific human (or agent) it is reasoning with.

**Source:** Supabase `mentor_profiles` table. Stored encrypted server-side (AES-256-GCM via `server-encryption.ts`).

**Type definition:** `MentorProfileData` interface in `/website/src/lib/mentor-profile-summary.ts` — includes display name, journal period, founder facts (biographical context), passion map, virtue profile, causal tendencies, value hierarchy, oikeiosis map, proximity estimate, preferred indifferents.

**Loader:** `/website/src/lib/context/practitioner-context.ts` — function `getPractitionerContext(userId)` returns condensed context (~300–500 tokens). For mentor endpoints specifically, `getFullPractitionerContext(userId)` returns a longer ~7,500-char summary.

**Injection point:** user message, after domain context.

**Graceful degradation:** if no profile exists, encryption is not configured, or the load fails, the loader returns null. The engine proceeds without personalisation. This is deliberate — missing a profile is not a blocker.

### D.3 Layer 3 — Project context (always, hybrid system + user message)

What the engine knows about SageReasoning as a project — identity, mission, founder context, ethical commitments, current phase, recent decisions.

**Static source:** `/website/src/data/project-context.json`, compiled at build into `/website/src/data/project-context-compiled.ts`. Zero runtime cost.

**Dynamic source:** Supabase `project_context` table. Holds current phase (P0–P7), active tensions, five most recent decisions from the decision log. 1-hour TTL cache.

**Loader:** `/website/src/lib/context/project-context.ts` — function `getProjectContext(level)`. Level controls token cost: full (~500), summary (180), condensed (139), identity_only (50).

**Injection point:** static part in system block, dynamic state in user message.

**Called by:** all operational endpoints, factory skills, mentor endpoints.

**Distinct from practitioner context:** practitioner context is "who am I (the human)"; project context is "what is this project, where is it, what's on its mind right now". Keep them separate.

### D.4 Layer 4 — Environmental context (optional, weekly scans)

Loader: `/website/src/lib/context/environmental-context.ts`. Injects weekly environmental scans when relevant. Optional. **[GAP]** — scaffolded, not routinely wired into core reasoning endpoints.

### D.5 Layer 5 — Mentor knowledge base (optional, mentor endpoints)

Loader: `/website/src/lib/context/mentor-knowledge-base-loader.ts`. Historical and global context for mentor-surface conversations. Optional. **[GAP]** — scaffolded, loaded only by some mentor endpoints.

### D.6 Agent brain loaders and the hub orchestration

Four brain loaders serve specialist contexts, and they are orchestrated through a single endpoint — the founder hub — which is already live at supervised level.

| Brain | Loader | Domain |
|---|---|---|
| Tech | `tech-brain-loader.ts` | Technical architecture, stack, deployment |
| Growth | `growth-brain-loader.ts` | Positioning, content, acquisition |
| Support | `support-brain-loader.ts` | User support, crisis resources (includes 988 reference) |
| Ops | `ops-brain-loader.ts` | Operational state — file-loading path bug fixed 21 April 2026 |

**Not loaded by `/api/reason`.** These are not part of the general reasoning surface. They are consumed by the founder hub orchestration endpoint, described next.

**Orchestration: `/api/founder/hub/route.ts`.** This is a 1,505-line orchestration endpoint, founder-gated via `FOUNDER_USER_ID`. It:

- Routes a posted message to one of five agents — `ops`, `tech`, `growth`, `support`, or `mentor`. The mentor path uses deep Stoic Brain + Mentor KB + hub-scoped observations (not an agent brain). The other four paths combine deep agent-brain context + standard Stoic Brain + project context.
- Runs **observer contributions** — the four non-primary agents check in via Haiku to add a short domain-specific contribution if they have one. Non-blocking on failure.
- Supports **Ask-the-Org mode** — Tech, Growth, and Support are called in parallel; Ops synthesises their responses; Mentor reviews the synthesis for reasoning quality.
- Returns a **recommended action** with a risk classification and a session prompt the founder can paste into a new session.
- Is called from two UI pages: `/founder-hub` (all five agents, general use) and `/private-mentor` (mentor agent with `hub_id: 'private-mentor'`).
- Records per-call cost metadata (model, token counts, duration, brain depth) in every response.
- Is **R15-compliant at supervised level** — it returns recommendations only; no autonomous action.

**What the hub does *not* currently do:**

- **R20a distress check is not invoked on this route.** Known gap, flagged in the session 12 handoff for P2 (Ethical Safeguards).
- **No dedicated test coverage** for brain loader integration, observer contributions, Ask-the-Org synthesis, or hub-scoped mentor context injection.
- **Persona system (analyst / moderator / advocate) is not wired.** Intentional — deferred to P3 per phase order.
- **No cost cap enforcement at the endpoint.** Per-call cost is visible; cumulative cap against the R5 $100/month ops threshold is not wired here.

**Note on Sage Ops P7.** The hub is a supervised-level realisation of the orchestration design. Full P7 activation (autonomous loops, higher authority progression) is post-launch and remains **[GAP]**.

---

## E. Memory and persistence — continuity between sessions

There is no shared persistent memory in the model. The Claude (or other) instance that worked with the founder yesterday does not remember today. Continuity is maintained in **four** mechanisms that live in the filesystem and must be actively read.

### E.1 Session handoff notes — `/operations/session-handoffs/`

At the end of each working session, the AI writes a handoff note. At the start of the next, the AI reads the most recent one before beginning work.

**Format (per project instructions 0b):** decisions made, status changes, next session should, blocked on, open questions.

**Most recent:** `/website/operations/session-handoffs/2026-04-16-verification-session-2.md` **[TBD]** — confirm whether handoffs have continued since.

**Note on path:** some handoffs live under `/operations/session-handoffs/` and some under `/website/operations/session-handoffs/`. **[DIVERGENCE]** — two paths is one too many. Consolidate to a single location before the count gets worse.

### E.2 Decision log — `/operations/decision-log.md`

Append-only. Governs the R0 oikeiosis audit trail once that rule is operationalised in P5. 11+ decisions logged between 21 March and 6 April 2026 **[TBD]** — confirm current count.

**Format per entry:** date, decision title, reasoning, rules served, impact, status.

**Status field values:** Adopted / Under review / Superseded by [ref].

### E.3 Knowledge gaps register — `/operations/knowledge-gaps.md`

Living document. Any concept requiring re-explanation is flagged. On the third re-explanation, the concept gets a permanent entry with resolution (PR5).

**Current entries:** KG1–KG10 (as of last scan) covering Vercel constraints, Haiku reliability boundary, build-to-wire gaps, context layer composition, token budgeting, hub labelling, JSONB storage, and others.

**Session-open protocol:** scan knowledge-gaps.md for concepts relevant to the session's scope before work begins.

### E.4 Session debriefs — `/operations/session-debriefs/`

Structured analysis after a significant failure or extended troubleshooting. Produced in a later session, not the one the failure occurred in. 20+ files, most recent **[TBD]** confirm date.

**Purpose:** distinct from a handoff. Handoffs are "what happened and what next"; debriefs are "what went wrong with how we worked together, and what changes".

### E.5 A note on rhythm

These four mechanisms together are the persistence system. None of them work if they are not written. A session that closes without a handoff leaves the next session cold. A decision made without a log entry cannot be audited. A concept re-explained three times without an entry in the knowledge gaps register will be re-explained a fourth time.

**The founder's operational role is to hold the discipline on these.** The AI can produce the artefacts, but only if the founder signals close-of-session and asks for them.

---

## F. The "open brain" question — what was proposed, what was built

The founder remembers proposing an "open brain" approach for persisting and sorting context, and recalls that MCP was part of the proposal but that something different was implemented. The honest account of the current state:

**What was built:** The filesystem-based persistence system described in Section E — session handoffs, decision log, knowledge gaps register, session debriefs. This is not MCP. It is plain markdown in `/operations/`. Its recall is: at session open, the agent reads the files relevant to scope.

**What exists that has "MCP" in the name:** `/website/src/lib/mcp-contracts.ts` — but this is a generator for MCP tool schemas so that external agents can discover and call the reasoning API. It is an outward-facing agent-discovery surface, not an inward-facing memory system.

**What is not built:** a queryable memory store that automatically surfaces relevant prior context based on a semantic match to the current task. The original open-brain proposal (as the founder recalls it) had this shape. The current system requires the agent to know which files to read and to read them.

**What this means practically:**

- The founder must direct an agent to the relevant handoff, decision log entry, or knowledge-gap record. The agent will not find them on its own unless told where to look or unless its instructions include the operational protocol.
- When an improvement is made over time, the record of that improvement is in one of the four persistence files. If neither the founder nor the agent looks there, the improvement is invisible on the next session.
- A future version of the open-brain idea — a semantic layer over `/operations/` that an agent could query by meaning rather than by path — is plausible and would reduce the burden on the founder. It is not built. Filing this as **[GAP]** for consideration.

---

## G. End-to-end: two reasoning pipelines, traced

There are two distinct pipelines the founder will encounter. Both start with a message and end with a response, but the context assembly and the model orchestration differ. Both are in production.

### G.1 The general reasoning pipeline — `/api/reason`

A call arrives at `/api/reason`. Here is what happens, in order, with the files involved.

1. **Rate-limit check.** `security.ts` — IP-based, 5-minute window.
2. **Authentication.** JWT user session (via Supabase middleware) or API key.
3. **Input validation.** Required fields and text-length checks.
4. **R20a distress check.** `guardrails.ts` (regex fast-pass) → if borderline, `r20a-classifier.ts` (Haiku-class LLM). **Synchronous** — no response constructed until this completes.
5. **Depth validation.** Quick, standard, or deep.
6. **Parallel context loads** (Promise.all):
   - Practitioner context (if user authenticated) — `practitioner-context.ts` → Supabase decrypt → condensed summary.
   - Project context (always) — `project-context.ts` at level `condensed`.
7. **Stoic Brain load.** `stoic-brain-loader.ts` at requested depth.
8. **Engine call.** `sage-reason-engine.ts` receives: input, context, depth, domain_context, urgency_context, stoicBrainContext, practitionerContext, projectContext.
9. **Prompt assembly inside engine:**
   - **System message:** endpoint prompt + Stoic Brain context + (optional) agent-brain context.
   - **User message:** domain context + practitioner context + project context + (optional) environmental + (optional) mentor KB + user input.
10. **Model selection.** Per `model-config.ts` — Haiku for quick, Sonnet for standard/deep. Enforced at compile time by the branded types in `constraints.ts`.
11. **Anthropic API call.** Temperature 0.2. Max tokens depth-dependent.
12. **Response extraction.** JSON parse. Receipt built (mechanisms applied, stage scores, cost, latency).
13. **Response return.** CORS headers applied. R3 disclaimer appended.

**What a reader of this trace should notice:** the response quality depends on all of the items in steps 6, 7, and 9 being correctly loaded. If step 6 silently fails and practitioner context comes back null, the response is impersonal and the user may not realise. If step 7 loads a stale Stoic Brain, the framework drifts. The graceful-degradation behaviour is correct for resilience, but it also means silent drift is possible.

**Recommended operational hygiene:** when the founder is spot-checking outputs, include at least one test that requires personalisation so that a null-practitioner-context regression would be visible.

### G.2 The hub orchestration pipeline — `/api/founder/hub`

A call arrives at `/api/founder/hub`. This pipeline is used by the `/founder-hub` and `/private-mentor` pages. It is founder-only.

**Standard mode** (one named agent):

1. **Rate-limit check.** `checkRateLimit(request, RATE_LIMITS.admin)` — admin-tier limit, applied before auth.
2. **Authentication.** Bearer token → Supabase JWT. Returns 401 if invalid.
3. **Founder gate.** Compares `auth.user.id` against `FOUNDER_USER_ID`. Returns 403 if mismatch.
4. **Input validation.** `agent` in {ops, tech, growth, support, mentor}; `message` 2–8000 chars.
5. **Context loads for the primary agent:**
   - For `ops`, `tech`, `growth`, `support`: agent brain at `deep` + Stoic Brain at `standard` + project context.
   - For `mentor`: deep Stoic Brain + Mentor KB + hub-scoped mentor context (observations, profile snapshots, recent signals — if `MENTOR_CONTEXT_V2` is enabled).
6. **Primary agent response.** Anthropic Sonnet call with the assembled system and user messages. Response includes `pipeline_meta` (model, input tokens, output tokens, duration, brain depth).
7. **Observer checks — in parallel.** Each of the four non-primary agents is asked via Haiku whether it has a short domain-specific contribution. Non-blocking: a failed observer does not affect the primary response. Contributions of `NO_CONTRIBUTION` or < 10 chars are filtered.
8. **Recommended action (Ops).** Haiku synthesises a next-step recommendation: action summary, session prompt, risk classification, risk reasoning.
9. **Persist to DB.** Conversation and messages saved with `hub_id` for isolation between `founder-hub` and `private-mentor`.
10. **Return.** Response includes primary, observers, recommended_action, conversation_id, message_count.

**Ask-the-Org mode** (cross-domain synthesis):

1–4. Same as standard mode, but `mode: 'ask-org'`.
5. **Parallel domain queries.** Tech, Growth, Support called in parallel via Sonnet.
6. **Ops synthesis.** The three domain responses are unified by Ops into a single answer + combined session prompt + risk classification.
7. **Mentor review.** Mentor evaluates the reasoning quality of the synthesis and flags any detected passion or need for re-examination.
8. **Return.** Response includes the three domain responses, the Ops synthesis, and the Mentor review.

**What a reader of this trace should notice:**

- **R20a distress check is not invoked on this pipeline.** Every other human-facing POST route invokes the two-stage classifier. The hub does not. Because the endpoint is founder-gated, the immediate risk is low, but the gap is real and is flagged for P2.
- **Intimate founder data flows through this pipeline unredacted.** Full practitioner profile is injected into the mentor path. No per-request audit log of what was sent to the LLM is currently kept.
- **Cost visibility is per-call, not cumulative.** `pipeline_meta` tells the founder what each call cost. Cumulative enforcement against the R5 $100/month ops cap is not implemented at this endpoint.
- **Graceful degradation is comprehensive.** Each brain loader returns a self-disclosing stub if it fails to read its data. The endpoint still returns, with the unavailability surfaced in the response.
- **No persona routing.** Analyst / moderator / advocate are not wired. This is deferred to P3.

---

## H. Founder verification checklist — is this agent briefed?

Before delegating a consequential task to any agent — internal or external — run through this checklist. The goal is to catch the case where the agent is going to advise or act without the framing it needs.

### H.1 Always required, for any agent on this project

| # | Check | How to verify |
|---|---|---|
| 1 | Does it know the manifest exists and has R0–R20? | Ask: "Which manifest version are we on, and what does R17 govern?" Correct answer names CR-2026-Q2-v4 and intimate-data protection. |
| 2 | Does it know the current phase? | Ask: "What phase is the project in?" Correct answer: P0 (Foundations / R&D). |
| 3 | Does it know the status vocabulary? | Ask: "What does 'wired' mean on this project?" Correct answer: code connects to live systems and functions end-to-end, but not yet Verified. |
| 4 | Does it know the hold point is active? | Ask: "Can we start P1 work?" Correct answer: not until 0h exit criteria are met. |
| 5 | Does it know the safety rules PR3 and PR6? | Ask: "Can the distress classifier run async?" Correct answer: no, PR3 — safety systems are synchronous. |

If the agent fails two or more of these, brief it before proceeding. Do not ask it to plan or execute.

### H.2 When the task involves reasoning-engine output

| # | Check | How to verify |
|---|---|---|
| 6 | Does it know the three-layer context system? | Ask: "What are the three layers injected into every reasoning call?" Correct answer: Stoic Brain, practitioner profile, user question (or equivalents L1, L2b, L3). |
| 7 | Does it know which layer is fixed and which is personal? | L1 is fixed across users; L2b is per-user. |
| 8 | Does it know what the practitioner profile contains? | Biographical (founder facts), passion map, virtue profile, oikeiosis map, proximity estimate. |

### H.3 When the task involves memory or continuity

| # | Check | How to verify |
|---|---|---|
| 9 | Does it know where handoff notes live? | `/operations/session-handoffs/` (note the divergence — also `/website/operations/session-handoffs/`). |
| 10 | Does it know the decision log exists? | `/operations/decision-log.md`. Ask it to read the latest entry before advising on a related topic. |
| 11 | Does it know to check knowledge-gaps.md at session open? | `/operations/knowledge-gaps.md`. If the current task's concept has a KG entry, the agent should read it before re-deriving. |

### H.4 When the task involves safety, users, or deployment

| # | Check | How to verify |
|---|---|---|
| 12 | Does it know the crisis resource list is US-only in code today? | The code references 988 only. UK/EU/AUS/international resources are pending add (see main guide 3.3). |
| 13 | Does it know what counts as Critical risk (0d-ii)? | Auth, session management, access control, encryption, data deletion, deployment configuration. Safety classifier changes are always Critical (PR6). |
| 14 | Does it know the Critical Change Protocol (0c-ii)? | What's changing, what could break, what happens to sessions, rollback plan, verification step, explicit approval. |

### H.5 When the task involves the founder hub orchestration

| # | Check | How to verify |
|---|---|---|
| 15 | Does it know the orchestration endpoint already exists? | `/api/founder/hub/route.ts`, 1,505 lines. Not a greenfield build. If the agent is proposing to "build orchestration", it has not read the file. |
| 16 | Does it know which UI pages call it? | `/founder-hub/page.tsx` and `/private-mentor/page.tsx`. If work is proposed that changes response shape, both pages must be considered. |
| 17 | Does it know the R20a distress check is not invoked on this route? | Confirmed gap per session 12 handoff. Adding the check is Critical risk (PR6). |
| 18 | Does it know `MENTOR_CONTEXT_V2` is a feature flag gating projection mode? | Branches around lines 479–494 of `route.ts`. Status and rollback plan currently undocumented. |
| 19 | Does it know Ask-the-Org mode exists? | Parallel Tech/Growth/Support → Ops synthesis → Mentor review. Not currently in the decision log. |
| 20 | Does it know personas are deferred? | Analyst/moderator/advocate designed but not wired. Deferred to P3. Proposing persona work here is out of phase. |

### H.6 When briefing an external contractor or new collaborator

A shorter brief that conveys the project's operating posture, in this order:

1. Read the manifest (R0–R20).
2. Read the project instructions (P0–P7 plus PR1–PR9).
3. Read INDEX.md to navigate.
4. Read the most recent session handoff note.
5. Scan the decision log for decisions touching the scope of the task.
6. Scan the knowledge-gaps register for the concepts relevant to the task.

That is the minimum. For specific task categories (reasoning engine, safety, growth, ops), add the relevant context-layer documentation from Section D.

---

## I. Known gaps and honest flags

Items flagged during the scan that the founder should be aware of. None of these block the addendum; all of them are worth holding in view.

**[GAP]** No semantic memory layer. The four persistence mechanisms in Section E are filesystem artefacts that require the agent to know where to look. An open-brain-style index over `/operations/` is not built.

**[GAP]** L4 environmental context and L5 mentor knowledge base are scaffolded but not routinely wired into core endpoints.

**[CORRECTION — prior edition]** The first edition of this addendum stated that the four brain loaders had no orchestration. That was wrong. A 1,505-line orchestration endpoint exists at `/api/founder/hub/route.ts` and is actively called by two UI pages. The supervised-level realisation is live. What remains **[GAP]** is full P7 activation — autonomous loops, higher authority progression — which remains post-launch by design.

**[GAP — confirmed on the hub]** R20a distress check is not invoked on `/api/founder/hub`. All other user-facing POST routes invoke the two-stage classifier. This gap was identified in the session 12 handoff and flagged for P2 (Ethical Safeguards). Closing it is Critical risk per PR6 and requires the Critical Change Protocol.

**[GAP — confirmed on the hub]** No dedicated test coverage for the hub route. No test file covers brain loader integration, observer contributions, Ask-the-Org synthesis, or hub-scoped mentor context injection. Before any meaningful change to the route, minimum viable test coverage should be added.

**[GAP — documentation]** The Ask-the-Org feature (parallel domain synthesis + Ops unification + Mentor review) is in production but not in the decision log. Retroactive decision log entry required. This is a PR7 instance — a consequential decision recorded through code rather than through the written record.

**[GAP — documentation]** `MENTOR_CONTEXT_V2` feature flag status is unclear. The code branches on it; production setting, what it changes on vs off, and rollback plan are not currently documented.

**[GAP — cost]** No cost cap enforcement at `/api/founder/hub`. Per-call cost is visible in `pipeline_meta`; cumulative tracking against R5's $100/month ops cap is not wired at the endpoint.

**[DIVERGENCE]** Session handoffs live under two paths (`/operations/session-handoffs/` and `/website/operations/session-handoffs/`). Consolidate to a canonical path.

**[TBD]** Latest session handoff date and decision log count — confirm at next session close.

**[TBD]** Confirm R20 distress classifier invocation coverage across all user-facing endpoints. The `r20a-invocation-guard.test.ts` file asserts coverage on eight routes; `/api/founder/hub` is known to be outside the guarded set.

**[ACTION]** Crisis resource list should be extracted into data, not inline strings, before launch outside the US. Default to an internationalised set with country lookup.

**[HABIT]** The discipline that makes the persistence system work is the founder's. An agent that is not asked to write a handoff at session close will not write one. Close-of-session is a founder action.

---

*End of addendum.*

*This addendum is a companion to the Summary Tech Guide. If the file structure, context layers, or persistence mechanisms change, this addendum is updated and the prior version moved to `/archive/` per the folder convention.*
