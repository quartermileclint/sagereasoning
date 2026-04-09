# Handoff: Context Architecture Build

**Created:** 9 April 2026 (Session 6 close)
**Purpose:** Wire project context, Stoic Brain knowledge, and practitioner profile data into every LLM-calling endpoint in the SageReasoning ecosystem.
**Priority:** This is foundational P0 work. Every LLM call currently operates context-blind.

---

## The Problem

23 API endpoints call the LLM. None of them receive:

1. **Stoic Brain data** — 8 JSON files (83K total) contain the structured taxonomy: passions, virtues, psychology, values, actions, progress, scoring. The LLM calls paraphrase these concepts in hardcoded system prompts instead of using the actual data.
2. **Practitioner profile** — Only `/api/mentor-baseline` receives a text summary. All other endpoints (reflect, score-decision, guardrail, etc.) have zero awareness of who the practitioner is.
3. **Project context** — No endpoint knows what SageReasoning is, what phase it's in, what the manifest says, or what decisions have been made.
4. **Session continuity** — Each call is stateless. The decision log, session notes, and prior evaluations are invisible.

The sage-mentor persona (`sage-mentor/persona.ts`) has a rich `buildMentorPersona()` function that was designed to inject profile context — but no website API endpoint calls it.

---

## What Needs to Be Built — Three Layers

### Layer 1: Stoic Brain Injection

**What:** Load the relevant Stoic Brain JSON sections and inject them into LLM calls based on which mechanisms are being invoked.

**Why:** The system prompts currently describe passion taxonomy, virtue domains, and causal stages in plain English. The actual structured data (passions.json, virtue.json, etc.) is never loaded. This means the LLM is reasoning from a summary of the knowledge base, not the knowledge base itself.

**Architecture:**

Create `website/src/lib/context/stoic-brain-loader.ts`:
- Loads Stoic Brain JSON files at build time or on first call (cached in memory)
- Exports mechanism-specific context builders:
  - `getControlFilterContext()` → relevant sections from psychology.json (prohairesis, eph'hemin)
  - `getPassionDiagnosisContext()` → passions.json (full taxonomy: 4 root passions, sub-species, false judgements)
  - `getOikeioisContext()` → progress.json (oikeiosis circles, proximity scale)
  - `getValueAssessmentContext()` → value.json (preferred/dispreferred indifferents, value classification)
  - `getKathekonContext()` → action.json (appropriate actions, role-based duties)
  - `getIterativeRefinementContext()` → scoring.json + progress.json

**Integration point:** `sage-reason-engine.ts` line 371 — the `system` array in the Claude API call. Add Stoic Brain context as a second system message block after the main prompt. The engine already accepts `systemPromptOverride` (line 375), so the injection should work alongside both built-in and override prompts.

**File paths (Stoic Brain JSON — all under `stoic-brain/`):**

| File | Size | Content |
|------|------|---------|
| psychology.json | 8.8K | Cognitive model: impressions, assent, prohairesis, hegemonikon |
| passions.json | 11K | 4 root passions, sub-species, false judgements, diagnostic criteria |
| virtue.json | 11K | 4 cardinal virtues, sub-virtues, developmental indicators |
| value.json | 11K | Preferred/dispreferred indifferents, value hierarchy, classification |
| action.json | 11K | Kathekon framework, role-based duties, appropriate action criteria |
| progress.json | 9.0K | Proximity scale, oikeiosis circles, Senecan grades, progression markers |
| scoring.json | 9.1K | Evaluation criteria, katorthoma proximity, mechanism scoring |
| stoic-brain.json | 13K | Master file — overview, mechanism relationships, cross-references |

**Total: ~83K.** Too large to inject all at once. The loader must select sections relevant to the depth/mechanisms being applied. For `quick` depth (3 mechanisms), inject only psychology, passions, and progress sections. For `deep` (6 mechanisms), inject all relevant sections but use condensed versions.

**Token budget guidance:** Each mechanism's context injection should target 500-1000 tokens of structured data. Total injection ceiling: 3000 tokens for quick, 6000 for deep. This leaves room in the context window for the system prompt, user input, and response.

**Critical constraint:** The Stoic Brain files are in the repo root (`stoic-brain/`), not in the website directory. At Vercel build time, only `website/` is deployed. The build step must either:
- Copy relevant JSON into `website/src/data/stoic-brain/` at build time, OR
- Inline the data as TypeScript constants (like mentor-profile.json is currently handled)

The second approach (TypeScript constants) is more reliable for Vercel serverless. Create `website/src/data/stoic-brain-compiled.ts` that exports typed objects from each JSON file.

---

### Layer 2: Practitioner Context Injection

**What:** For any authenticated endpoint, pull the practitioner's profile from Supabase and inject relevant sections into the LLM call.

**Why:** When someone uses `/api/reflect` or `/api/score-decision`, the LLM has no idea who they are. A practitioner whose dominant passion is anger and whose weakest virtue is temperance should get fundamentally different guidance than one struggling with fear and lacking courage. The profile data exists in encrypted Supabase storage — it just isn't read by these endpoints.

**Architecture:**

Create `website/src/lib/context/practitioner-context.ts`:
- Exports `getPractitionerContext(userId: string): Promise<string | null>`
- Calls `loadMentorProfile(userId)` from `mentor-profile-store.ts` (already wired with encryption)
- If profile exists, returns a condensed context block containing:
  - Proximity level and Senecan grade
  - Top 3 passions (sorted by frequency)
  - Weakest virtue
  - Primary causal breakdown stage
  - Top value conflicts
- If no profile exists, returns null (endpoint operates without personalisation — graceful degradation)
- Target: 300-500 tokens. This is injected alongside the Stoic Brain context.

**Integration points:** Every authenticated endpoint that calls `runSageReason()` or makes a direct Anthropic call. Specifically:

Endpoints via `runSageReason()` (9):
- `/api/reason` (website/src/app/api/reason/route.ts)
- `/api/guardrail` (website/src/app/api/guardrail/route.ts)
- `/api/mentor-baseline` (website/src/app/api/mentor-baseline/route.ts)
- `/api/mentor-baseline-response` (website/src/app/api/mentor-baseline-response/route.ts)
- `/api/mentor-journal-week` (website/src/app/api/mentor-journal-week/route.ts)
- `/api/score` (website/src/app/api/score/route.ts)
- `/api/score-decision` (website/src/app/api/score-decision/route.ts)
- `/api/score-conversation` (website/src/app/api/score-conversation/route.ts)
- `/api/score-iterate` (website/src/app/api/score-iterate/route.ts)

Direct Anthropic calls (5):
- `/api/reflect` (website/src/app/api/reflect/route.ts)
- `/api/score-document` (website/src/app/api/score-document/route.ts)
- `/api/assessment/foundational` (website/src/app/api/assessment/foundational/route.ts)
- `/api/skill/sage-classify` (website/src/app/api/skill/sage-classify/route.ts)
- `/api/skill/sage-prioritise` (website/src/app/api/skill/sage-prioritise/route.ts)

Additional skill endpoints (using skill-handler-map):
- `/api/score-scenario` (website/src/app/api/score-scenario/route.ts)
- `/api/score-social` (website/src/app/api/score-social/route.ts)
- `/api/evaluate` (website/src/app/api/evaluate/route.ts)
- `/api/baseline/agent` (website/src/app/api/baseline/agent/route.ts)
- `/api/assessment/full` (website/src/app/api/assessment/full/route.ts)

**For `runSageReason()` endpoints:** Modify the engine to accept an optional `practitionerContext` parameter in `ReasonInput`. The engine injects it as part of the user message (after domain_context, before the JSON return instruction). This keeps the change centralised — one modification to the engine, all 9 endpoints benefit.

**For direct Anthropic call endpoints:** Each needs individual modification to call `getPractitionerContext()` and include the result in its system or user message. These are 5 separate edits.

**Mentor endpoints get the full profile summary** (already wired via `buildProfileSummary()`). Non-mentor endpoints get the condensed version from `getPractitionerContext()`.

**Existing infrastructure this builds on:**
- `mentor-profile-store.ts` — `loadMentorProfile(userId)` with AES-256-GCM decryption
- `mentor-profile-summary.ts` — `buildProfileSummary(profile)` for full text summary
- `server-encryption.ts` — `decryptProfileData()` for at-rest decryption
- `supabase-server.ts` — `supabaseAdmin` for service-role Supabase access
- `security.ts` — `requireAuth()` returns `{ user: { id: string; email?: string } }`

---

### Layer 3: Project Context Sync

**What:** A structured, auto-updating summary of the SageReasoning project state that gets injected into mentor and operational endpoints.

**Why:** The mentor needs to know it's talking to a founder in P0 who is building this system, not an abstract practitioner. When Clinton reports impatience, the mentor should know whether that impatience arose while debugging authentication or while dealing with a personal relationship — these require fundamentally different Stoic diagnoses. The operational tools (guardrail, score-decision, reason) similarly benefit from knowing the project's current phase, active tensions, and recent decisions.

**Architecture:**

Create `website/src/lib/context/project-context.ts`:
- Exports `getProjectContext(): string` — returns a structured text block
- The context block contains:
  - **Identity:** What SageReasoning is, its mission (2-3 sentences)
  - **Current phase:** P0 hold point testing — what this means
  - **Founder context:** Sole founder, non-technical, learning to build with AI
  - **Active tensions:** Scope governance, the deliberate choice exercise ahead, the relationship between builder and product
  - **Recent decisions:** Last 3-5 from the decision log (summary only)
  - **Ethical commitments:** R17 (privacy), R18 (honest certification), R19 (limitations), R20 (vulnerable users)
- Target: 400-600 tokens

**Storage and update mechanism:**

Option A — **Supabase table + scheduled update:**
- Create `project_context` table with a single row containing the structured summary
- A scheduled task (sage-ops or manual) updates this row when the project state changes
- `getProjectContext()` reads from Supabase (cached for 1 hour in memory)
- Pro: Live updates without redeployment. Con: Adds a Supabase read to every LLM call.

Option B — **Static file + CI/CD update:**
- Create `website/src/data/project-context.json` containing the structured summary
- Updated manually or via a script at session close
- `getProjectContext()` imports it at build time (zero runtime cost)
- Pro: No runtime overhead. Con: Requires redeployment to update.

Option C — **Hybrid (recommended):**
- Static `project-context.json` for baseline (identity, mission, ethical commitments — things that rarely change)
- Supabase `project_context` table for dynamic state (current phase, recent decisions, active tensions)
- `getProjectContext()` merges both: static baseline + dynamic overlay
- Runtime cost: One Supabase read per hour (cached). Redeployment only needed for baseline changes.

**Integration points — five endpoint groups with distinct context profiles:**

| Endpoint Group | Stoic Brain | Practitioner Profile | Project Context |
|---|---|---|---|
| **Mentor** (mentor-baseline, mentor-baseline-response, mentor-journal-week) | Yes — full for invoked mechanisms | Yes — **full** profile summary (~7,500 chars) | Yes — **summary** (phase, recent decisions, founder role) |
| **Sage Ops** (future — operational intelligence, P7) | No — not a reasoning engine | No — not a personal mentor | Yes — **full** (identity, mission, phase, all recent decisions, active tensions, ethical commitments, component status, blockers) |
| **Operational** (guardrail, reason, score-decision, score-iterate) | Yes — mechanism-specific | Yes — **condensed** (top passions, weakest virtue, proximity, causal breakdown) | Yes — **condensed** (current phase + recent decisions) |
| **Human-facing tools** (reflect, score-document, score-conversation) | Yes — mechanism-specific | Yes — **condensed** | Minimal — identity and ethical commitments only |
| **Agent-facing** (assessment/foundational, assessment/full, baseline/agent) | Yes — mechanism-specific | No — agents evaluate against the framework | No — agents don't get internal project state |

**Sage Ops distinction:** Sage Ops is an "Ops mentor" — it knows the project inside out but has no access to the practitioner's personal Stoic profile. It answers operational questions, flags project risks, and supports build decisions. The Sage Mentor is the inverse — it knows the practitioner deeply and has summary project context so it can interpret personal development in the right situational frame. They serve different functions and receive different context.

**The scheduled update (for Option C dynamic component):**
- At each session close, the handoff note already captures decisions made and status changes
- A script or skill extracts the relevant fields from the latest handoff note and updates the `project_context` row in Supabase
- This is the "sage-stenographer" pattern from P0 item 0g — it earns its place here

---

## Integration Architecture Summary

The three layers compose into the sage-reason-engine call like this:

```
System message array:
  [0] Main system prompt (existing — depth-based or override)
  [1] Stoic Brain context (NEW — mechanism-specific JSON data)

User message:
  [existing] Input + Context + Domain context + Urgency context
  [NEW]      Practitioner context (condensed or full profile, if authenticated)
  [NEW]      Project context (level depends on endpoint group — see matrix above)
  [existing] Stage scoring instruction
  [existing] "Return only the JSON evaluation object."
```

For direct Anthropic calls (non-engine endpoints), the same pattern applies but is assembled per-endpoint.

**Sage Ops is architecturally separate** — it does not use sage-reason-engine. When wired (P7), it will import `getProjectContext()` directly with the `full` flag and use its own ops-specific system prompt. It receives no Stoic Brain data and no practitioner profile. It is a project operations advisor, not a reasoning engine.

### Context Matrix (reference)

| | Stoic Brain | Practitioner Profile | Project Context |
|---|---|---|---|
| **Mentor** | Full (per mechanism) | Full summary | Summary |
| **Sage Ops** | None | None | Full |
| **Operational** | Per mechanism | Condensed | Condensed |
| **Human-facing** | Per mechanism | Condensed | Minimal |
| **Agent-facing** | Per mechanism | None | None |

---

## File Changes Summary

**New files to create:**
1. `website/src/lib/context/stoic-brain-loader.ts` — Mechanism-specific Stoic Brain context builder
2. `website/src/lib/context/practitioner-context.ts` — Authenticated practitioner profile injector
3. `website/src/lib/context/project-context.ts` — Project state context builder
4. `website/src/data/stoic-brain-compiled.ts` — Stoic Brain JSON compiled as TypeScript constants
5. `website/src/data/project-context.json` — Static project baseline context
6. `supabase-project-context-migration.sql` — Migration for project_context table (if Option C)

**Files to modify:**
1. `website/src/lib/sage-reason-engine.ts` — Add `practitionerContext`, `projectContext`, and `stoicBrainContext` to ReasonInput; inject into API call
2. All 20 route.ts files listed above — Wire context injection (9 via engine parameter, 11 individually)

**Files to read (not modify):**
- All 8 Stoic Brain JSON files (to compile into TypeScript)
- `sage-mentor/persona.ts` (reference for how buildMentorPersona builds context — pattern to follow)
- `website/src/lib/mentor-profile-store.ts` (existing profile loader to reuse)
- `website/src/lib/mentor-profile-summary.ts` (existing summary builder to reuse)

---

## Sequencing

**Build order matters — each layer depends on the previous:**

1. **Layer 1 first** (Stoic Brain) — This is a compile-time change with no runtime dependencies. Every endpoint benefits immediately. No Supabase reads. No auth required.

2. **Layer 2 second** (Practitioner Context) — Depends on existing Supabase infrastructure (mentor_profiles table, encryption). Requires authenticated sessions. Graceful fallback if no profile exists.

3. **Layer 3 third** (Project Context) — Depends on Supabase for dynamic state. Requires the static baseline file to be authored. The scheduled update mechanism can be added after manual testing proves the pattern.

**Within each layer:**
- Modify `sage-reason-engine.ts` first (centralised change)
- Then modify the 9 `runSageReason()` endpoints (they get context via engine params)
- Then modify the 11 direct-call endpoints (individual changes)
- Test after each batch

---

## Verification Plan

**Layer 1 verification:** Call `/api/reason` with a decision involving a passion (e.g., anger at an unfair situation). Compare the response with and without Stoic Brain injection. The injected version should reference specific sub-species from passions.json rather than generic passion categories.

**Layer 2 verification:** Call `/api/reflect` while authenticated as Clinton. The reflection should reference Clinton's specific dominant passions and weakest virtue, not give generic Stoic advice. Compare with an unauthenticated call — the unauthenticated version should still work but be generic.

**Layer 3 verification:** Call `/api/mentor-baseline-response` with a gap question answer that references the project (e.g., "I noticed impatience when debugging with my AI collaborator"). The response should interpret this in the context of P0 and the founder role, not as a generic anger management issue.

---

## Risks and Constraints

1. **Token budget:** Stoic Brain JSON (83K) cannot be injected wholesale. The loader must select and condense. If condensed context still exceeds budget, fall back to the current approach (hardcoded summaries) for quick-depth calls and inject full data only for deep-depth.

2. **Latency:** Adding a Supabase read (Layer 2) adds ~100-200ms per call. For quick-depth calls that should be fast, consider making practitioner context opt-in via a query parameter.

3. **Vercel build:** Stoic Brain files must be available at build time. The compiled TypeScript approach (`stoic-brain-compiled.ts`) handles this but adds a manual sync step when Stoic Brain files change.

4. **Cache invalidation:** If a practitioner's profile updates mid-session, subsequent calls should reflect the new profile. Use a short TTL (5 minutes) on the practitioner context cache, not the 1-hour cache proposed for project context.

5. **Agent endpoints:** Agent-facing endpoints (assessment, trust-layer) should NOT receive project context. Agents evaluate against the framework, not the founder's situation.

---

## Decision Points for Founder

1. **Layer 3 storage:** Option A (Supabase only), B (static only), or C (hybrid)? Recommendation: C.
2. **Should the scheduled update be a skill (sage-stenographer) or a simpler script?** The skill has reuse value; the script is faster to build.
3. **Agent endpoints:** Confirm they should remain project-context-free.
4. **Token budget priority:** If we hit the ceiling, which layer gets cut first? Recommendation: Condense Layer 1 before cutting Layer 2 or 3.
