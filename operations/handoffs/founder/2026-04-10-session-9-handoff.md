# Session Close — 10 April 2026 (Session 9)

## Decisions Made

### 1. Internal Agent Workflow — Unified Pipeline for All 4 Brains

All internal Sage agents (Ops, Tech, Growth, Support) follow the same 7-step workflow. The Stoic Brain is excluded because it is the philosophical layer applied by product endpoints, not an operational agent.

**The workflow:**

1. **Agent triggered** — Sage-Ops, Sage-Tech, Sage-Growth, or Sage-Support activates
2. **Session context loaded** — the agent already carries its brain + project instructions + manifest + about me
3. **Internal reasoning** — the agent uses its brain and internal context to do domain-specific work
4. **Stoic evaluation** — when the agent needs Stoic reasoning, it calls a clean product endpoint (`/api/reason`, `/api/score`, `/api/guardrail`, etc.) — the same endpoint any external customer would use
5. **Output routing:**
   - **5A** — If the tool used was a saged product (our own Stoic endpoints): output passes through, already evaluated
   - **5B** — If the tool was external/non-saged: output is routed through a Stoic review (e.g. `/api/reason` or `/api/guardrail`) before proceeding
6. **Decision authority gate** — the founder reviews and approves actions. This is not a trust gate (the agent has proven values via the Stoic Brain in its workflow). It exists because certain actions are founder responsibilities: spending money, publishing content, external communications, irreversible changes. R5 cost alerts fire regardless. R20c guarantees human override is always available.
7. **Handoff** — deliver to founder for decision, or to the next step in the pipeline

**Key principle:** The only thing that varies per agent is which brain is loaded and which product endpoints it typically calls. The governance structure is identical across all four. One orchestration pattern, "which brain" as a parameter.

**Product implication:** When a customer adopts the startup package, they create their own brains (e.g. "Legal Brain", "Sales Brain") and plug them into this same orchestration pattern. The workflow, the decision authority gate, the 5B Stoic review — all of that is the product. The brain content is theirs.

### 2. ATL Authority Levels Apply Only to External Agents

The ATL accreditation progression (supervised → guided → spot_checked → autonomous → full_authority) applies exclusively to **external agents** whose values and reasoning quality are unknown. Internal Sage agents do not need authority levels because the Stoic Brain is already applied to every action through the workflow. The decision authority gate (step 6) exists because the founder makes irreplaceable decisions (vision, relationships, ethical judgement), not because the agent is untrusted.

### 3. Mentor Endpoint Separation — Private vs Public

**Private Mentor** (founder only):
- Stoic Brain + Layer 5 (Stoic Historical Context + Global State of Humanity)
- Full practitioner profile (not the condensed ~300-500 token version — the complete passion map, virtue profile with evidence, causal tendencies in detail, oikeiosis map, value hierarchy with conflicts)
- Accumulates knowledge of founder's growth over time via interaction history, rolling window, and temporal snapshots
- No agent brain needed — the Stoic Brain IS the mentor's expertise

**Public Mentor** (external human users, external agents, journal interactions):
- Stoic Brain only
- Regular spoken-word output pitched for the audience
- Clean, portable, universal — same architectural principle as every other product endpoint

### 4. Support Brain Removed from Mentor Endpoints

The Support Brain was compensating for infrastructure that didn't exist yet (vulnerable user detection, triage, escalation). With the decision authority gate now in the workflow:
- Vulnerable user detection (R20a) is a system-level safeguard at the endpoint level — it doesn't need a brain
- Escalation and triage are operational decisions that go through the decision authority gate
- The Support Brain joins the same pattern as the other three: session-level context for the Sage-Support agent, never injected into product endpoints

All four brains are now in identical positions: session-level context for internal agents only.

### 5. Private Mentor Growth Accumulation — Gaps Identified

The core feedback loop already works: reflections → passion map update → rolling window → profile dimension update. Five gaps need to be addressed for the private mentor to truly accumulate knowledge of the founder's growth:

| Gap | What's Missing | Impact |
|---|---|---|
| **Full profile access** | Private mentor gets the same condensed practitioner context (~300-500 tokens) as every other endpoint | Mentor can't see the full picture — misses evidence summaries, detailed causal tendencies, full oikeiosis map |
| **Mentor observation persistence** | No mechanism for the mentor to record qualitative observations back to the profile (e.g. "founder consistently avoids andreia scenarios") | Insights evaporate between sessions — the mentor relationship stays episodic, not accumulative |
| **Journal reference recall** | Journal references are indexed during ingestion but never surfaced during interactions | Mentor can't say "three weeks ago you wrote about this same tension" — loses the personal depth |
| **Temporal snapshots** | Profile tracks direction_of_travel but doesn't store timestamped trajectory | Mentor can't show growth curves or identify plateaus — no "your proximity has been steady for six weeks" |
| **Baseline auto-save** | `/api/mentor-baseline-response` doesn't auto-save refined profile after processing answers | Gap-detection insights require manual POST to persist — breaks the accumulation loop |

## Status Changes

### Contamination Removal — COMPLETE (all 13 product-facing endpoints)

| Endpoint | Session Cleaned | What Was Removed | Status |
|---|---|---|---|
| score | Session 8 | projectContext param | **Verified** |
| score-conversation | Session 8 | projectContext param | **Verified** |
| score-decision | Session 8 | projectContext param | **Verified** |
| score-social | Session 8 | projectContext param | **Verified** |
| reason | Session 8 | projectContext param | **Verified** |
| guardrail | Session 8 | projectContext param | **Verified** |
| evaluate | Session 8 | projectContext, growthBrainContext, environmentalContext | **Verified** |
| score-document | Session 9 | projectContext, growthBrainContext, environmentalContext | **Verified** |
| score-scenario | Session 9 | projectContext, growthBrainContext, environmentalContext (GET + POST) | **Verified** |
| score-iterate | Session 9 | techBrainContext, environmentalContext (initial + continue modes) | **Verified** |
| assessment/foundational | Session 9 | techBrainContext, environmentalContext | **Verified** |
| assessment/full | Session 9 | techBrainContext, environmentalContext (4 batch calls + aggregate) | **Verified** |
| baseline/agent | Session 9 | techBrainContext, environmentalContext | **Verified** |

### Documentation Updated
- `context-layer-summary.md` — endpoint matrix rewritten to show all product endpoints under one table (Stoic Brain + Practitioner only), Layer 3 and Layer 4 wiring counts corrected to reflect internal-only status

### Commit
- `d9b71ce` — Remove agent brains and environmental context from all product-facing endpoints (7 endpoint files + context-layer-summary + Session 8 handoff)

## Next Session Should

### Phase A: Support Brain Removal from Mentor Endpoints

1. **Remove Support Brain** from the 4 mentor endpoints: `reflect`, `mentor-baseline`, `mentor-baseline-response`, `mentor-journal-week`
   - Remove `getSupportBrainContext` import
   - Remove context variable declaration
   - Remove from system message array
   - Remove environmental context (support domain) import, call, and user message injection
   
2. **Update `context-layer-summary.md`** — mentor endpoints move from "all layers" to:
   - Private mentor: L1 Stoic Brain + L2b full Practitioner + L5 Mentor Knowledge Base
   - Public mentor: L1 Stoic Brain + L2b condensed Practitioner only

3. **Compile check and commit**

### Phase B: Private vs Public Mentor Separation

4. **Design the separation.** Two approaches to evaluate:
   - **Route-level split:** Separate endpoints for private (`/api/mentor/private/*`) and public (`/api/mentor/public/*`) with different context assembly
   - **Auth-gated context:** Same endpoints but context assembly checks if the authenticated user is the founder, and loads full profile + L5 if so
   
   The auth-gated approach is simpler but couples "who you are" to "what context you get." The route-level split is cleaner architecturally but means duplicating or abstracting endpoint logic. Explore both, present to founder.

5. **Implement full profile access for private mentor.** The `getPractitionerContext` function currently returns a condensed ~300-500 token summary. The private mentor needs a `getFullPractitionerContext` variant that returns the complete MentorProfileData — full passion map, virtue profile with evidence, causal tendencies, oikeiosis map, value hierarchy.

### Phase C: Private Mentor Growth Accumulation

6. **Mentor observation persistence.** Design and build a mechanism for the mentor to record qualitative observations back to the profile after each interaction. This could be:
   - A structured `mentor_observations` table with timestamped entries
   - An async post-interaction step (similar to how reflections already trigger profile updates)
   - Observations surfaced to the mentor in subsequent sessions as part of the full practitioner context

7. **Journal reference recall.** The ingestion pipeline already indexes key passages. Wire these into the private mentor's context so it can reference the founder's own words during interactions.

8. **Temporal snapshots.** Add timestamped profile snapshots (weekly or on significant change) to enable growth trajectory analysis. The mentor should be able to say "your proximity to principled action has been steady for six weeks."

9. **Baseline auto-save.** Fix `/api/mentor-baseline-response` to auto-save the refined profile after processing answers, closing the accumulation loop.

### Phase D: Internal Agent Orchestration Pattern

10. **Design the orchestration layer.** This is the unified pipeline (steps 1-7) that all four internal agents use. Key design questions:
    - Where does the orchestrator live? (Sage Ops skill? Shared library function? Middleware?)
    - How does it select which product endpoint to call for Stoic evaluation?
    - How does 5B (Stoic review of non-saged output) get triggered and which endpoint does it use?
    - How does the decision authority gate determine what needs founder approval vs what passes through?

11. **Build the orchestration pattern** as a reusable module that takes "which brain" as a parameter.

12. **Update `context-layer-summary.md`** and `startup_org_chart.html` to reflect the complete architecture: product surface (clean endpoints), internal surface (orchestration pattern with brains), private mentor (dedicated context), public mentor (clean).

### Phase E: Verification

13. **Compile check across all changes**
14. **Review the full endpoint matrix** to confirm every endpoint has exactly the context layers it should — no more, no less
15. **Document the architectural decisions** in the decision log: unified agent workflow, ATL for external only, mentor separation, Support Brain removal rationale

## Blocked On
- Nothing blocked. All decisions are made. Implementation is straightforward.

## Open Questions
- None outstanding. The brainstorming in Session 9 resolved all architectural questions. The only decisions remaining are implementation choices (route-split vs auth-gated for mentor separation, orchestrator location) — these should be explored and presented in the next session.
