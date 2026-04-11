# Milestone Review — P0 Stenographer Log Analysis

**Date:** 11 April 2026
**Scope:** All sessions 6 April – 11 April 2026 (Sessions 1–14 + sub-sessions 7b–7h)
**Sources:** 25 handoff notes, 6 debriefs, decision log (18 entries), 10 supplementary handoffs
**Review type:** Milestone-gated (P0 → P1 transition)

---

## How to Read This Document

Findings are grouped into six categories. Each finding has a date, severity, and proposed remediation. The action list at the end is ordered by priority. Severity scale: **Security Fix** (deploy before any public traffic) → **Process Change** (adopt before next build phase) → **Next-Milestone Prep** (address during P1 planning).

---

## 1. Sequencing Errors — Things Built in the Wrong Order

### 1.1 Context Layers Wired Before Contamination Audit (Apr 10, Sessions 7d–7e → 8–9)

**What happened:** Layers 1–3 (Stoic Brain, Practitioner, Project Context) were wired into all 18–19 endpoints in Sessions 7d–7e. Sessions 8–9 then spent two full sessions removing project context and agent brains from product-facing endpoints because they had been injected everywhere indiscriminately.

**Root cause:** The context matrix in the architecture spec defined which layers go where, but the wiring sessions treated it as "add everything to everything" rather than "add selectively per the matrix." The contamination audit should have preceded the bulk wiring, or the wiring should have enforced the matrix from the start.

**Severity:** Process Change

**Remediation:** Before any future bulk wiring or refactoring, produce a before/after diff checklist showing exactly which endpoints get which changes. The operator reviews the checklist before execution. This prevents the pattern of "wire broadly, then clean up."

---

### 1.2 R20a Distress Detection Built But Never Wired (Apr 6 → Apr 11)

**What happened:** `detectDistress()` was implemented in `guardrails.ts` on 6 April (Session C). It was listed as "Wired" in the capability inventory. Five days and 10+ sessions later (Session 13), testing revealed it was called by zero API routes. Crisis language reached the LLM and triggered 500 errors instead of safety redirects.

**Root cause:** The function was written and the status was updated to "Wired" based on the code existing, not on it being called. No integration test verified the end-to-end path. The holdpoint test harness (160 checks, all passing) did not include a distress-input test case.

**Severity:** Security Fix (resolved Session 14 — but the gap persisted for 5 days)

**Remediation:** Standing rule: any safety-critical function (R17, R18, R20) requires an integration test at the time of implementation, not just a unit-level existence check. Add "R20 distress input" as a mandatory test case in any future test harness. Status may not advance to "Wired" unless at least one endpoint calls the function and a test confirms the path.

---

### 1.3 Auth Middleware Implemented Outside Planned Sequence (Apr 7)

**What happened:** The auth middleware session on 7 April created ad hoc middleware to protect private mentor pages. Session B (6 April) had explicitly deferred middleware centralisation to post-hold-point. The urgency of the R17 data exposure was real, but the implementation bypassed the planned sequence and the verification framework.

**Root cause:** Urgency overrode process. The AI treated the fix as a quick change rather than recognising it as a Critical-classified modification to authentication.

**Severity:** Process Change (incident already addressed via debrief and 0c-ii/0d-ii adoption)

**Remediation:** Already adopted: Critical Change Protocol (0c-ii), Change Risk Classification (0d-ii). Standing check: when implementing something that was explicitly deferred, treat it as Elevated minimum regardless of apparent simplicity.

---

### 1.4 llms.txt and agent-card.json Left at V1 Through Entire Build (Apr 6 → Apr 11)

**What happened:** Agent discovery files served V1 language (numeric 0-100 scores, `threshold: 50`, no katorthoma_proximity) throughout the entire P0 build period. Updated to V3 only in Session 14 after testing flagged the gap.

**Root cause:** These files were created early and never included in the holdpoint test harness or any verification sweep. They are static files in `/public/` — easy to forget, invisible to TypeScript compilation.

**Severity:** Next-Milestone Prep

**Remediation:** Add static file content verification to the pre-deployment checklist: llms.txt vocabulary matches current API schema, agent-card.json version matches current API version. Include these in any future test harness.

---

## 2. Missed Checks — Verifications That Should Have Run Earlier

### 2.1 TypeScript Compile Not Run Before Deployment (Multiple Sessions)

**What happened:** Several sessions (7b, the auth middleware session, and early Session 9 bug-fix work) deployed code without a `tsc --noEmit` check. Session 7b deployed code that broke the /score page — a compilation check would not have caught the runtime mismatch, but it would have caught the circular dependency.

**Root cause:** No standing protocol requiring compilation before commit.

**Severity:** Process Change

**Remediation:** Standing rule for all development sessions: `tsc --noEmit` runs before any commit. If it fails, the commit does not proceed. Add to pre-deployment checklist.

---

### 2.2 No RLS Verification After Schema Changes (Apr 9–11)

**What happened:** Multiple Supabase tables were created (founder_conversations, founder_conversation_messages, agent_handoffs, mentor_profile_snapshots) with migrations. RLS policies were included in migration SQL but never independently verified post-deployment. The analytics_events table returned 0 rows via user RLS query — which might be correct (no events) or might indicate an RLS misconfiguration.

**Root cause:** The verification framework defines "AI queries and shows result; founder confirms" for database changes. This was followed for table existence but not for RLS policy correctness.

**Severity:** Process Change

**Remediation:** For every new Supabase table: after running the migration, verify both (a) the table exists and (b) RLS is active with correct policies by running a test insert + select as the authenticated user. Add to verification framework's database section.

---

### 2.3 Environment Variables Not Checked Pre-Session (Multiple Sessions)

**What happened:** ANTHROPIC_API_KEY was unconfigured for the first several sessions, blocking all LLM testing. The sr_live_ API key raw value was lost between sessions. FOUNDER_USER_ID, MENTOR_ENCRYPTION_KEY, and Stripe env vars remain unconfigured. Each missing env var caused confusion and wasted time when tests unexpectedly failed.

**Root cause:** No systematic env var audit at session start.

**Severity:** Process Change

**Remediation:** Add to sage-stenographer session-open protocol: before any testing or deployment work, verify that all required env vars are set in Vercel. Maintain a canonical env var list in TECHNICAL_STATE.md (already partially done).

---

### 2.4 Rate Limits Not Anticipated for Supabase Magic Links (Apr 7)

**What happened:** During the auth middleware incident, multiple magic link requests triggered Supabase's rate limiter, producing an "email rate exceeded" error that added confusion during an already frustrating debugging session.

**Root cause:** The AI did not warn about rate limits before suggesting rapid retry of magic links.

**Severity:** Process Change (one-time incident, already addressed in debrief)

**Remediation:** Standing awareness: any external service interaction (Supabase auth, Anthropic API, Vercel deployments) may have rate limits. Before suggesting retries, state the expected rate limit window.

---

## 3. Decisions to Revisit — Reasoning Missing or Assumptions May Not Hold

### 3.1 In-Memory Cache on Serverless (Vercel)

**Date:** Apr 10 (Session 7e, project-context.ts)

**The assumption:** The project context loader uses a 1-hour in-memory cache for Supabase dynamic state. On Vercel serverless, each function invocation may run in a different container. In-memory cache only helps if the same container handles multiple requests within the cache window.

**Why it may not hold:** Vercel cold starts are frequent for low-traffic functions. The cache may rarely hit. This is not harmful (it falls back to Supabase on miss), but it is misleading — the code implies caching behaviour that may not materialise.

**Severity:** Next-Milestone Prep

**Remediation:** Document this as a known architectural note. When traffic increases (post-launch), measure cache hit rates. If consistently low, either remove the cache (reducing code complexity) or move to Vercel KV/Edge Config.

---

### 3.2 Model Selection: Haiku for Quick Depth (Apr 11, Session 14)

**The decision:** Standard depth switched from Haiku to Sonnet after Haiku produced unparseable JSON on complex inputs. Quick depth stays on Haiku.

**The assumption:** Quick depth only receives simple inputs (agent real-time use, short ethical questions). Complex multi-stakeholder inputs never reach quick depth.

**Why it may not hold:** There is no input-length gate at the API level. Any caller can send a complex business decision to `/api/reason` with `depth: "quick"`. If they do, Haiku will fail. The Haiku→Sonnet retry (Option B) was deferred to P4, leaving a known gap.

**Severity:** Next-Milestone Prep

**Remediation:** Two options: (a) implement the Haiku→Sonnet retry now (adds ~5 lines to runSageReason), or (b) add input complexity scoring that auto-upgrades depth when input exceeds a token/complexity threshold. Option (a) is simpler and should be done before any public traffic.

---

### 3.3 Prompt Placement: System Message vs User Message (Apr 10)

**The decision:** Stoic Brain context goes in a second system message block. Practitioner context and project context go in the user message.

**The assumption:** This placement optimises for Anthropic's prompt caching (system messages cache better) while keeping personalisation in the user message where it varies per request.

**Why it may not hold:** The placement was decided pragmatically during Session 7d, not via an ADR. As context layers grow (Layer 5 Mentor KB is substantial), the split between cached and uncached context may not remain optimal. No measurement was done.

**Severity:** Next-Milestone Prep

**Remediation:** Produce an ADR documenting the current placement rationale and the caching assumption. When Anthropic publishes updated prompt caching guidance, revisit.

---

### 3.4 Open vs Proprietary Framework for Stoic Brain Data

**The decision:** Stoic Brain data is compiled as TypeScript constants in `stoic-brain-compiled.ts` (438 lines). This is proprietary domain knowledge encoded as code.

**The assumption:** Compiling to TS constants is the right format for serverless deployment (no file I/O, no JSON parsing at runtime).

**Why it may not hold:** If SageReasoning ever needs to serve the Stoic Brain data to external agents (via the API or as a downloadable knowledge base), the TS constants format is not portable. A JSON or YAML source of truth with a build-time compilation step would be more flexible.

**Severity:** Next-Milestone Prep

**Remediation:** Low urgency. Note for P3 (Agent Trust Layer): if agent developers need access to the framework data, introduce a canonical JSON source and compile to TS at build time.

---

### 3.5 Dual Audience Priority: Human Practitioners vs Agent Developers

**The decision:** Marketing targets both audiences simultaneously. Session 13 found that llms.txt and agent-card.json (agent-facing) were neglected for 5 days while human-facing tools received continuous attention.

**The assumption:** Both audiences can be served in parallel during early development.

**Why it may not hold:** Limited founder bandwidth means one audience will always get more attention. The pattern in the logs is clear: human-facing tools are built and tested first, agent-facing discovery is an afterthought. This is not necessarily wrong — but it should be a conscious choice, not a drift.

**Severity:** Next-Milestone Prep

**Remediation:** During P1 business plan review, explicitly decide the primary audience for launch. If human practitioners are primary, deprioritise agent discovery polish until P3. If agent developers are primary, the discovery files need the same attention as the website.

---

### 3.6 mentor_encryption: active — Health Endpoint Accuracy (Apr 11)

**The decision:** The /api/health endpoint reports `mentor_encryption: "active"`. ADR-007 states encryption.ts is scaffolded but not wired to the storage pipeline.

**The assumption:** Either ADR-007 is out of date (encryption was wired without updating the ADR) or the health endpoint is misreporting.

**Severity:** Process Change (misleading telemetry erodes trust in system status)

**Remediation:** Investigate immediately in the next session. If encryption IS wired, update ADR-007. If it is NOT wired, correct the health endpoint. Either way, document the finding. This affects P2 item 2c assessment.

---

## 4. Bugs and Near-Misses — Silent Failures, Parsing Fallbacks, CORS Issues

### 4.1 virtue_quality Nesting Fragility (Apr 10, Session 7b–7c)

**What happened:** The /score page crashed with "Cannot read properties of undefined (reading 'katorthoma_proximity')". The engine's system prompt defines flat fields; the client expects nested `virtue_quality`. The LLM was inferring the nesting on its own — an implicit behaviour that broke when context changed.

**Root cause:** No contract enforcement between API response shape and client expectations. The normalization function in Session 7c was the correct fix, but the gap should have been caught by a response schema validator.

**Severity:** Process Change

**Remediation:** Add response schema validation to `runSageReason` (or at the route level): before returning a result, verify all expected fields exist and are correctly nested. Log (don't crash) when the LLM returns an unexpected shape.

---

### 4.2 JSON Parsing Fallback in Multiple Endpoints (Apr 8–11)

**What happened:** Multiple endpoints added progressively more aggressive JSON extraction: bare parse → fence-stripped → regex match → brace extraction. The evaluate endpoint, reflect endpoints, and sage-reason-engine all independently added fallback parsing.

**Root cause:** Haiku's JSON output is unreliable for complex inputs. Each endpoint discovered this independently and added its own fallback. No shared JSON extraction utility exists.

**Severity:** Process Change

**Remediation:** Create a shared `extractJSON(text: string)` utility in a common lib file. All endpoints and the engine should use this single function. Centralised parsing means centralised logging of parse failures, which feeds into the Haiku reliability monitoring.

---

### 4.3 HTTP Self-Call Auth Stripping on Redirects (Apr 9, Sessions 3–5)

**What happened:** Context template skills made HTTP self-calls to `/api/reason`. Vercel's redirect from the bare domain to the `www.` subdomain caused the Fetch API to strip the Authorization header (correct browser behaviour for cross-origin redirects). This caused 401 errors on 12+ endpoints.

**Initial misdiagnosis:** "requireAuth() hangs in factory-created handlers." This was wrong (corrected in Session 4). The actual cause was the redirect stripping auth headers.

**Resolution:** Session 4 replaced HTTP self-calls with direct imports (`runSageReason`). Session 5 created `skill-handler-map.ts` for the execute/compose routers. Both are architecturally correct fixes.

**Severity:** Process Change (resolved, but the misdiagnosis cost 2+ sessions)

**Remediation:** Standing rule: when a function "hangs" or returns unexpected auth errors, check whether the call is making an HTTP request to itself. On Vercel, HTTP self-calls through the public URL will encounter redirects. Direct imports are always preferred over HTTP self-calls within the same application.

---

### 4.4 Stale Vercel Deployments During Debugging (Apr 9)

**What happened:** During the auth debugging sessions, the AI and founder tested fixes that had not yet been deployed. Uncommitted changes were assumed to be live. Session 3 discovered that the Session 1 inline auth fix "was never committed from the previous session."

**Root cause:** No deployment verification step. The AI did not check whether the latest commit was live on Vercel before asking the founder to test.

**Severity:** Process Change

**Remediation:** Add to pre-test checklist: confirm the commit hash on Vercel matches the latest local commit. The founder can check this at Vercel dashboard → Deployments. Alternatively, the /api/health endpoint could return the deployment commit hash.

---

### 4.5 Git Lock Files Recurring (Apr 9, Session 5)

**What happened:** `.git/index.lock` had to be deleted twice during Session 5. Likely caused by the sandbox's git operations leaving stale locks, or GitHub Desktop conflicting with CLI git.

**Severity:** Process Change (minor, but disruptive)

**Remediation:** When git operations fail with lock file errors, the AI should immediately check for and remove the lock file rather than debugging other causes. Document as a known environment issue.

---

### 4.6 score-scenario POST Using Wrong Endpoint in Test (Apr 9–11)

**What happened:** Session 4 tested sage-retro by calling the wrong endpoint (`/api/reason`) with the wrong field (`action`). This produced a false 500 error that was attributed to a code bug. Session 5 corrected the test and sage-retro worked.

**Severity:** Process Change (testing error, not code bug)

**Remediation:** Test definitions should include exact endpoint, method, headers, and body. The product testing program document exists but was not consistently referenced during ad hoc testing.

---

## 5. Safety and Support Patterns

### 5.1 detectDistress() — Critical Gap Now Resolved

**Date:** Apr 6 (built) → Apr 11 (wired)
**Status:** RESOLVED in Session 14

**Pattern:** The function existed for 5 days without being called. Crisis language hit the LLM and triggered Anthropic's content safety layer, which returned prose instead of JSON, causing 500 errors. The user received no crisis resources — just an internal server error.

**What's now in place:** detectDistress() gates all 7 human-facing POST endpoints before any LLM call. Acute/moderate severity returns immediate redirect with crisis resources (200 status). Mild severity proceeds with resources appended.

**Remaining gap:** The 12 context-template marketplace skills (`/api/skill/*`) are not gated. These receive user input and call runSageReason. If a user enters crisis language via a marketplace skill, distress detection does not fire.

**Severity:** Security Fix

**Remediation:** Wire detectDistress() to context-template.ts (the shared handler for all 12 marketplace skills). This is a single-file change that covers all 12 endpoints.

---

### 5.2 Framework Dependence Indicators — Not Yet Monitored

**Date:** Referenced in P2 item 2g (R20b)

**Status:** Designed (session handoff D, 6 April, listed as a P2 item). Not built.

**Pattern:** The mentor should detect usage patterns indicating framework dependence (e.g., user scoring every minor daily decision, consulting the mentor for routine choices). No detection mechanism exists.

**Severity:** Next-Milestone Prep (P2 scope)

**Remediation:** Include in P2 build plan. The private mentor growth accumulation (Session 10, gap 2: mentor observation persistence) provides the infrastructure — observations about usage patterns can trigger independence coaching.

---

### 5.3 Relationship Asymmetry Guidance — Added to Persona, Not Tested

**Date:** Apr 6 (Session C)

**Status:** Code exists in `sage-mentor/persona.ts`. Never tested with real input.

**Pattern:** R20d requires guidance discouraging interpersonal application of the passion taxonomy (e.g., "my partner exhibits epithumia"). The guidance was added to the mentor persona prompt but has not been verified via a test interaction.

**Severity:** Next-Milestone Prep (P2 scope)

**Remediation:** Include a relationship-asymmetry test case in P2 verification: send the private mentor a message diagnosing another person's passions and verify the response includes appropriate guidance.

---

### 5.4 Crisis Resource Verification Calendar — Not Set

**Date:** Apr 11 (Session 12)

**Status:** Quarterly verification schedule established (first due 30 June 2026). Calendar reminder not yet created by founder.

**Severity:** Process Change

**Remediation:** Founder creates a calendar reminder for 30 June 2026: verify all crisis resources in distress-signal-taxonomy.md are still current (phone numbers, URLs, operating hours).

---

### 5.5 Scope Creep Pattern — Founder Hub and Ask the Org (Apr 11)

**Date:** Apr 11 (Session 11)

**Pattern:** The Founder Communication Hub and "Ask the Org" feature were built during P0, which is the foundations/R&D phase. Per the project instructions, P0 does not prohibit product building if "this makes what follows simpler for both of us." The Hub arguably serves this test — but it is also a complex new feature (5-agent routing, observer pattern, conversation persistence) that diverted a full session from testing and verification work.

**Observation, not a finding:** The founder authorised this work. The scope creep concern is that the "P0 does not prohibit product building" clause can justify anything. The hold point was designed to catch this.

**Severity:** Observation only

**Remediation:** No action needed. The founder manages scope. Note for P1: when building the implementation timeline, account for the pattern that new features tend to displace verification work.

---

## 6. Process Gaps

### 6.1 Missing Handoff Note After Auth Middleware Incident (Apr 7)

**What happened:** The most consequential session (auth middleware failure, founder locked out) did not produce a handoff note. The debrief was conducted the following day, but the immediate session state was not captured.

**Root cause:** The session ended under stress. The AI prioritised reverting code over documenting state.

**Severity:** Process Change (already addressed — debrief protocol 0b-ii adopted)

**Remediation:** Already adopted: "if a session involves code changes to production, a handoff note is produced before the session closes, even if the session was difficult."

---

### 6.2 Undocumented Trade-offs in Model Selection

**What happened:** The switch from Haiku to Sonnet for standard depth (Session 14) has cost implications. Sonnet is approximately 10x more expensive per token than Haiku. The decision was made for reliability, which is correct, but the cost impact was not quantified.

**Root cause:** No cost modelling infrastructure exists. R5 requires cost-as-health-metric, but this is a P4 item.

**Severity:** Next-Milestone Prep

**Remediation:** For P1 business plan review: estimate the per-call cost difference (Haiku vs Sonnet at standard depth token volumes) and project the monthly cost at expected usage levels. The Haiku→Sonnet retry pattern (Option B, deferred to P4) would reduce cost by attempting Haiku first.

---

### 6.3 Localhost-to-Production Discrepancies

**What happened:** Multiple sessions had code working locally but failing in production. Causes included: Vercel redirect stripping auth headers (Sessions 3–5), deployment not triggered before testing (Session 3), Vercel caching stale responses during debugging (Session 1). Each was discovered through production testing, not predicted.

**Root cause:** No local-to-production equivalence checklist exists. Vercel's serverless environment behaves differently from `next dev` in several ways (redirects, cold starts, function bundling, environment variables).

**Severity:** Process Change

**Remediation:** Create a "Vercel deployment gotchas" reference document covering: redirect behaviour, environment variable availability, function cold starts, deployment propagation time, cache invalidation. Reference before any session that deploys and tests.

---

### 6.4 TECHNICAL_STATE.md Inaccuracies (Apr 11)

**What happened:** Session 13 testing found that TECHNICAL_STATE.md incorrectly claimed `/api/score` logs to `analytics_events`. It doesn't. The health endpoint's `mentor_encryption: active` claim conflicts with ADR-007.

**Root cause:** State documents were produced at a point in time and not updated as the code changed. No automated consistency check exists.

**Severity:** Process Change

**Remediation:** At the end of any session that modifies endpoint behaviour, verify TECHNICAL_STATE.md and PROJECT_STATE.md remain accurate. Consider adding a "last verified" date to each section.

---

## Action List — Ordered by Priority

### Security Fixes (Before Any Public Traffic)

| # | Finding | Action | Effort |
|---|---------|--------|--------|
| S1 | 5.1 | Wire detectDistress() to context-template.ts (covers 12 marketplace skills) | Small — single file |
| S2 | 3.2 | Implement Haiku→Sonnet retry in runSageReason for quick depth parse failures | Small — ~10 lines |

### Process Changes (Adopt Before Next Build Phase)

| # | Finding | Action | Effort |
|---|---------|--------|--------|
| P1 | 2.1 | Standing rule: `tsc --noEmit` before every commit | Zero code — protocol |
| P2 | 4.4 | Pre-test checklist: verify Vercel deployment matches latest commit | Zero code — protocol |
| P3 | 1.2 | Safety-critical functions require integration test at implementation time | Zero code — protocol |
| P4 | 2.2 | RLS verification after every Supabase migration (insert + select test) | Zero code — protocol |
| P5 | 2.3 | Env var audit at session start (canonical list in TECHNICAL_STATE.md) | Small — document update |
| P6 | 4.2 | Create shared extractJSON() utility; all endpoints use it | Medium — refactor |
| P7 | 4.1 | Add response schema validation to runSageReason or route level | Medium — new code |
| P8 | 3.6 | Investigate mentor_encryption health check accuracy; fix or update ADR-007 | Small — investigation |
| P9 | 6.3 | Create "Vercel deployment gotchas" reference document | Small — document |
| P10 | 6.4 | Verify TECHNICAL_STATE.md accuracy; add "last verified" dates | Small — document |
| P11 | 1.1 | Standing rule: before bulk wiring, produce diff checklist reviewed before execution | Zero code — protocol |
| P12 | 5.4 | Founder: set calendar reminder for crisis resource verification (30 June 2026) | Founder action |

### Next-Milestone Prep (Address During P1 Planning)

| # | Finding | Action | Effort |
|---|---------|--------|--------|
| N1 | 6.2 | Cost modelling: Haiku vs Sonnet per-call cost at projected volumes | Analysis |
| N2 | 3.5 | P1 decision: primary launch audience (human practitioners vs agent developers) | Founder decision |
| N3 | 1.4 | Add static file content verification (llms.txt, agent-card.json) to test harness | Small |
| N4 | 3.1 | Document in-memory cache limitation on serverless; measure post-launch | Documentation |
| N5 | 3.3 | Produce ADR for prompt placement (system vs user message) rationale | Documentation |
| N6 | 3.4 | Note for P3: if agents need Stoic Brain data, add JSON source of truth with TS compilation | Design note |
| N7 | 5.2 | Include framework dependence detection in P2 build plan | Planning |
| N8 | 5.3 | Include relationship-asymmetry test case in P2 verification | Planning |

---

## Standing Protocol Recommendations

### 1. Compile-First Development Sessions

Every session that writes or modifies TypeScript must run `tsc --noEmit` before any commit. If it fails, the commit does not proceed. This prevents the pattern seen in Sessions 7b and the auth middleware incident where type errors or circular dependencies reached production.

### 2. Pre-Deployment Checklist Additions

Add to the existing checklist:

- [ ] `tsc --noEmit` passes
- [ ] Vercel deployment hash matches latest commit (check after push, before testing)
- [ ] All required env vars are set (check TECHNICAL_STATE.md canonical list)
- [ ] If new Supabase table: RLS verified via insert + select as authenticated user
- [ ] If safety-critical function: integration test confirms the end-to-end path
- [ ] If static public files changed: verify content in browser (llms.txt, agent-card.json)

### 3. Support-Specific Debrief Items

When a session involves R17/R20 safety-critical changes, the session close should include:

- [ ] Which safety functions are now wired and to which endpoints?
- [ ] Which human-facing endpoints are NOT yet gated by the safety function?
- [ ] Has the safety path been tested with representative input?
- [ ] Are crisis resources current? (Reference distress-signal-taxonomy.md last-verified date)

### 4. One-Line Growth Notes Per Session

Each handoff note should include a single line capturing the growth/positioning observation from the session. Examples from the logs:

- **Session 8:** "Product endpoints are universal Stoic reasoning tools; brains are the template pattern, not product content."
- **Session 9:** "ATL authority levels apply to external agents only; internal agents earn trust through the Stoic Brain in their workflow."
- **Session 11:** "The Founder Hub makes the org chart real — but it consumed a full session that could have gone to P2 safeguards."
- **Session 13:** "Agent discovery files lagged 5 days behind the API. Agent developers are currently a secondary audience by behaviour, regardless of stated intent."

These notes accumulate into the P1 positioning review evidence base.

### 5. Review Cadence

- **Current phase (P0→P1 transition):** Milestone-gated. This review covers the full P0 build. Next review at P1 exit.
- **Phase transitions (P1→P2, P2→P3, etc.):** Full review at each transition. Shorter — the standing protocols reduce the finding density.
- **Steady state (post-launch):** Quarterly. Focus shifts from build process to operational patterns (cost trends, support patterns, framework dependence indicators).

---

## Summary Statistics

| Category | Findings | Security Fix | Process Change | Next-Milestone |
|----------|----------|-------------|----------------|----------------|
| Sequencing errors | 4 | 1 (resolved) | 2 | 1 |
| Missed checks | 4 | 0 | 4 | 0 |
| Decisions to revisit | 6 | 0 | 1 | 5 |
| Bugs and near-misses | 6 | 0 | 6 | 0 |
| Safety and support | 5 | 1 | 1 | 3 |
| Process gaps | 4 | 0 | 3 | 1 |
| **Total** | **29** | **2** | **17** | **10** |

Two security items remain open (S1: marketplace skill distress gating, S2: Haiku retry for quick depth). Both are small changes that should be completed before any public-facing traffic.
