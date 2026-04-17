# Contextual Stewardship Audit — SageReasoning Core Architecture

**Date:** 17 April 2026
**Scope:** Four core files (`stoic-brain-compiled.ts`, `stoic-brain-loader.ts`, `sage-reason-engine.ts`, `guardrails.ts`) plus context loaders (`project-context.ts`, `practitioner-context.ts`), cross-referenced against all session handoff notes (sessions 6 through 17 April), architectural decisions extract, decision log, and compliance register.

**Method:** Evidence-based. Every finding cites the source document and line. Findings marked HIGH CONFIDENCE are grounded in code and log evidence. Findings marked PHASE 2 require data not supplied.

---

## SECTION 1: BUILD TIMELINE (Agent-Written Code)

| Date | Session | What was built | What broke | What was rolled back |
|------|---------|----------------|------------|---------------------|
| 6 Apr | 6 | `sage-reason-engine.ts` (395 LOC). 5 brain-derived tools refactored to call `runSageReason()`. | Nothing reported. | Nothing. |
| 6 Apr | 6 | Per-stage quality scoring, urgency_context, deliberation_quality, side-effect detection in ring-wrapper. | Nothing reported. | Nothing. |
| 9 Apr | 7 | `stoic-brain-compiled.ts` (438 lines), `stoic-brain-loader.ts` (183 lines). Layer 1 auto-injection enabled. | **/score page crash** — `Cannot read properties of undefined (reading 'katorthoma_proximity')`. Client expected `virtue_quality` nesting; LLM returned flat fields. | Auto-injection **disabled** in session 7b. |
| 10 Apr | 7b | Circular dependency fix (ReasonDepth duplicated into loader). Import-only-side-effect hypothesis investigated. | Error persisted after auto-injection disabled. Root cause: pre-existing `virtue_quality` nesting fragility, not the Stoic Brain changes. | Auto-injection **re-enabled** after root cause identified. |
| 10 Apr | 7d | Layer 2 (`practitioner-context.ts`) wired to 5 authenticated endpoints. | Two intermittent 500s attributed to cold-start flakiness. | Nothing. |
| 10 Apr | 7e | Layer 3 (`project-context.ts`, `project-context.json`). Hybrid storage designed. Migration prepared but NOT run. | Nothing. | Nothing. |
| 11 Apr | 11 | Founder Communication Hub (5-agent architecture). | `/api/mentor/private/reflect` 500 — JSON parse error. Invalid Stoic Brain mechanism IDs (`value_theory`, `action_theory`). | Fixed in-session. |
| 11 Apr | 13 | **Testing session — no code written.** | **R20a critical gap discovered**: `detectDistress()` existed but was called by zero routes. Crisis language hit the LLM, LLM content safety returned plain text, parser threw → 500. Standard depth intermittent 500s on complex inputs (Haiku unreliable for multi-stakeholder JSON). | Nothing — testing only. |
| 11 Apr | 14 | `detectDistress()` wired to 6 endpoints. Standard depth switched Haiku→Sonnet. maxTokens raised (standard: 4096→6000, deep: 4096→8192). stage_scores moved to system prompt schema. | Nothing. | Nothing. |
| 11 Apr | 15 | `detectDistress()` wired to 12 marketplace skills. Haiku→Sonnet retry logic added. `extractJSON()` consolidated. Diagnostic schema validation. Encryption status resolved. | Nothing. | Nothing. |
| 15 Apr | L3 wiring | Layer 3 wired to 9 remaining engine endpoints. Comprehension comment blocks added. | Nothing. | Nothing. |
| 16 Apr | Phase B | `vulnerability_flag` Supabase table deployed (R20a Phase B). Analytics bugfix. IP hashing aligned. | Nothing. | Nothing. |
| 17 Apr | Comprehension | R20a cost tracking scaffolded. Layer 3 wiring confirmed complete. Comprehension blocks written. | Nothing. | Nothing. |

---

## SECTION 2: FINDINGS TABLE — Ranked by Impact

### TIER 1 — Catastrophic Context Failure (data loss, auth bypass, silent wrong output)

| # | Location | Risk Type | Why It's Risky | Retrofit | Eval/Prompt Template |
|---|----------|-----------|----------------|----------|----------------------|
| **F1** | `guardrails.ts` lines 122-136 — regex-only distress detection | **Silent failure** | The distress classifier is regex pattern-matching only. It has known false-negative risk: any phrasing not matching the 11 patterns passes through silently. There is no LLM evaluator yet (Phase D of ADR-R20a-01). The fail-open-with-alerting design (decision D6-c) was adopted but the alerting mechanism does not exist — the `r20a-cost-tracker.ts` scaffolds cost alerts, not classifier-down alerts. If the regex misses a genuine crisis input, no alert fires, no flag is written, no human is notified. The "classifier-down marker rows for post-hoc rescoring" described in the ADR are not implemented. **A vulnerable user submitting distress language in a form the regex doesn't match receives a Stoic evaluation instead of crisis resources.** | 1. Build the Phase D LLM evaluator (two-stage: regex + Haiku borderline check). 2. Implement classifier-down detection and marker rows per ADR-R20a-01 D6-c. 3. Add a catch-all heuristic: if the LLM's own content safety layer returns non-JSON (the session 13 failure mode), treat that as a distress signal, not a parse error. | `BEFORE deploying any change to detectDistress patterns: Run the full distress-signal-taxonomy test suite (/knowledge-base/governance/distress-signal-taxonomy.md). Confirm: (a) all acute patterns fire, (b) novel phrasing test set has <10% false-negative rate, (c) alerting path is live.` |
| **F2** | `sage-reason-engine.ts` lines 488-514 — Haiku→Sonnet retry | **Silent failure** | Retry logic exists only for `quick` depth when `config.model === MODEL_FAST`. If Sonnet (MODEL_DEEP) fails to produce parseable JSON at `standard` or `deep` depth, the engine throws `Error('Reasoning engine returned invalid JSON response')` — a hard 500 with no retry, no fallback, and no structured error to the client. The user sees "Application error." Session 13 documented this failure mode on complex inputs. The fix was to switch standard to Sonnet, but Sonnet is not immune to parse failures — it's just less likely. There is no circuit breaker, no degraded-response path, and no monitoring of parse failure rates. | 1. Add structured error responses (not 500) for parse failures: `{ error: 'reasoning_parse_failure', depth, model, input_length }`. 2. Add a retry path for standard/deep depth (retry with higher max_tokens or simplified prompt). 3. Log parse failures to a monitoring table for trend detection. | `BEFORE any change to system prompts or max_tokens: Run 5 complex multi-stakeholder inputs at each depth. Confirm all return valid JSON. Log input_tokens and output_tokens.` |
| **F3** | `project-context.json` line 22-28 — `recent_decisions` array | **Silent failure / Context staleness** | The `recent_decisions` array in the static fallback contains 5 entries dated 9-16 April 2026. The Supabase `project_context` migration has never been run (confirmed: session 7e handoff, session 17 comprehension). This means **every LLM call that uses Layer 3 reads the same 5 decisions from the static file, forever**, until someone manually edits `project-context.json` and redeploys. There is no automated update mechanism, no staleness alert, and no TTL on the static data. As of today (17 April), the data is 1 day old. In 3 months it will be 3 months old. The LLM will still tell the mentor "recent decisions include the Layer 3 wiring from 16 April" in July. This is the textbook memory-wall problem: the system believes it knows the project state, but it's reading a frozen snapshot. | 1. **Run the Supabase `project_context` migration.** It was prepared in session 7e and has been deferred for 7 days. The static fallback was always designed as a temporary measure. 2. Add a `last_updated` check in `getProjectContext()` — if `dynamic_defaults.last_updated` (or the Supabase row's `updated_at`) is >7 days old, log a warning and append "Note: project context may be outdated" to the returned context. 3. Wire the sage-stenographer session-close to update the Supabase row (this was the original design intent per context-architecture-build.md line 182-185). | `AT SESSION OPEN: Check project-context.json last_updated field. If >7 days stale, update it before any other work. AT SESSION CLOSE: Update recent_decisions array or Supabase row with decisions made this session.` |
| **F4** | `sage-reason-engine.ts` line 494 — retry creates a second unguarded LLM call | **Missing eval** | The Haiku→Sonnet retry makes a full LLM call with the same `systemMessages` and `userMessage`. This retry bypasses: (a) any rate limiting or cost tracking, (b) the cache check (line 428), and (c) receipt generation for the failed first call. The retry's cost is invisible — there's no logging of "this call cost 2x because of a retry." At scale, if Haiku fails 10% of the time, quick-depth cost is 10% higher than projected, and the cost monitoring system doesn't know. | Add `console.warn` with model, depth, and input_length on every retry. Log the retry as a separate cost event when the cost tracking infrastructure activates. Add the retry to the cache key so retried results are cached correctly. | `WHEN reviewing R5 cost projections: Check retry rate. If >5% of quick-depth calls retry to Sonnet, the cost model is wrong by (retry_rate × Sonnet/Haiku cost ratio).` |

### TIER 2 — Long-Term Regression (quiet degradation over months)

| # | Location | Risk Type | Why It's Risky | Retrofit | Eval/Prompt Template |
|---|----------|-----------|----------------|----------|----------------------|
| **F5** | `stoic-brain-loader.ts` lines 30, 209-213 + `sage-reason-engine.ts` lines 42, 129-133 | **Maintainability** | `ReasonDepth` type and `DEPTH_MECHANISMS` constant are **duplicated** across two files. The duplication was a deliberate fix for a circular dependency (session 7b). The comment on line 207 of `stoic-brain-loader.ts` says "Mirrors DEPTH_MECHANISMS from sage-reason-engine.ts" — but there is no test, no build-time check, and no runtime assertion that they match. If someone adds a mechanism to the engine's `DEPTH_MECHANISMS` without updating the loader's copy, the engine will request context for a mechanism the loader doesn't know about. The loader silently returns empty string for unknown mechanisms (line 226: `return loader ? loader() : ''`). The LLM would receive a system prompt asking it to apply a mechanism but no Stoic Brain data for that mechanism — producing degraded reasoning with no error signal. | 1. Add a build-time test: import both `DEPTH_MECHANISMS` from engine and loader, assert deep equality. This catches drift at CI time. 2. Alternatively, export the canonical `DEPTH_MECHANISMS` from a shared constants file that both engine and loader import, eliminating the duplication entirely. The circular dependency was between the engine and the loader — a third file has no circular risk. | `BEFORE adding any new mechanism: Update BOTH copies of DEPTH_MECHANISMS (sage-reason-engine.ts AND stoic-brain-loader.ts). Add the mechanism's loader function to MECHANISM_LOADERS. Verify with: grep -c 'new_mechanism_id' sage-reason-engine.ts stoic-brain-loader.ts — both must show the same count.` |
| **F6** | `guardrails.ts` lines 138-148 — hardcoded `CRISIS_RESOURCES` | **Maintainability** | Five crisis hotline numbers are hardcoded in TypeScript source. There is no update process, no version date, no verification schedule. Session 12 handoff notes a "crisis resource verification calendar reminder (due 30 June 2026)" that was never set. The distress signal taxonomy document (`/knowledge-base/governance/distress-signal-taxonomy.md`) specifies quarterly verification. If a hotline number changes (the US 988 line launched in 2022 replacing a 10-digit number — these changes happen), the code serves incorrect resources to people in crisis until a developer notices, edits the TypeScript, and redeploys. | 1. Move crisis resources to a JSON data file (`website/src/data/crisis-resources.json`) with a `last_verified` date field. 2. Add a build-time warning if `last_verified` is >90 days old. 3. **Set the quarterly calendar reminder now.** It has been open since session 12 (11 April). | `QUARTERLY (first: 30 June 2026): Verify all 5 crisis resource numbers are current. Update last_verified date. Redeploy if any number changed.` |
| **F7** | `stoic-brain-compiled.ts` — 438 lines of compiled constants | **Maintainability** | The file is a manual compile of 8 JSON files (~83K source). Session 7 close notes it was "compiled as condensed TypeScript constants (not full JSON) to stay within token budgets." There is no compile script, no `last_compiled` timestamp, and no mechanism to detect when the source JSON files change. If the Stoic Brain taxonomy is updated (new passions, revised virtue descriptions), the compiled file must be manually regenerated. There is no diff tool to compare compiled output against source. The architectural decisions extract (line 576-577) flags this as an unresolved question: "session handoffs don't capture the per-constant token counts or the condensation rules used during compile." | 1. Create a compile script (`scripts/compile-stoic-brain.ts`) that reads the 8 JSON files and produces `stoic-brain-compiled.ts`. 2. Add a CI check that runs the compile script and diffs the output against the committed file — any drift means the JSON was updated without recompiling. 3. Add a `COMPILED_AT` constant to the file header. | `BEFORE modifying any stoic-brain/*.json file: Run the compile script. Check the token count per constant. Verify total stays under the ceiling (3000 quick, 6000 deep). Commit the recompiled .ts alongside the .json change.` |
| **F8** | `project-context.ts` — Supabase fallback with no error logging | **Silent failure** | `loadDynamicState()` wraps the Supabase query in try/catch and falls back to static defaults on any error (confirmed by code audit: "No error logging or reporting. No exception is thrown."). If Supabase goes down, the system silently serves stale project context with no indication to anyone — no log, no metric, no alert. This is correct for availability (fail-open) but wrong for observability. Over months, if the Supabase connection degrades intermittently, every LLM call gets static context without anyone knowing. | Add `console.warn('project-context: Supabase fallback activated', error.message)` to the catch block. When runtime token monitoring is built (deferred to P1 per decision log), add a boolean `dynamic_context_loaded: true/false` to the engine's meta response. | `MONTHLY: Check Vercel logs for 'project-context: Supabase fallback'. If count > 0, investigate Supabase connectivity.` |
| **F9** | `sage-reason-engine.ts` — user message composition order | **Maintainability** | The six-layer user message composition order (domain_context → practitioner_context → project_context → urgency_context → stage_scoring → JSON instruction) is documented in the architectural decisions extract but **enforced only by convention in the code**. There is no test that verifies the order. The order matters — the architectural decisions extract (lines 94-106) explains that urgency must follow the three context layers because it modulates scrutiny. If an agent in a future session reorders the composition (e.g., puts project context after urgency), the LLM's interpretation of urgency changes. Session 7d through 7e established the order; no test was written to lock it. | Add an integration test that constructs a user message via the engine (with mock LLM) and asserts the substring ordering: `indexOf('PRACTITIONER CONTEXT') < indexOf('PROJECT CONTEXT') < indexOf('URGENCY')`. | `BEFORE any change to runSageReason user message assembly: Confirm the six-layer order is preserved. Check the architectural decisions extract section "Three layers composed in a fixed order."` |
| **F10** | `sage-reason-engine.ts` line 386 — `depth` defaults to `'standard'` | **Memory-wall** | If a caller omits the `depth` parameter, the engine defaults to `standard` — which uses MODEL_DEEP (Sonnet) at 6000 max_tokens. This is the expensive model. An agent building a new endpoint might not realize that omitting `depth` gives them Sonnet, not Haiku. The default was not always `standard` — the decision to switch standard from Haiku to Sonnet was made in session 14 to fix parse reliability, but the default depth was set earlier. The cost implication of the default changed when the model mapping changed, but the default itself wasn't re-evaluated. | Document the cost implication of the default depth in the `ReasonInput` interface JSDoc. Consider whether `quick` should be the default for new endpoints (cheaper, adequate for simple inputs, retries to Sonnet on failure). | `WHEN wiring a new endpoint to runSageReason: Explicitly set depth. Never rely on the default. Check DEPTH_CONFIG for the model and max_tokens at that depth.` |

### TIER 3 — Efficiency and Stewardship Gaps

| # | Location | Risk Type | Why It's Risky | Retrofit | Eval/Prompt Template |
|---|----------|-----------|----------------|----------|----------------------|
| **F11** | Session 7b incident — auto-injection enable/disable/re-enable | **Memory-wall** | The session 7b debug sequence is instructive. Auto-injection was enabled (session 7), then disabled after a production crash, then re-enabled after the crash was traced to an unrelated `virtue_quality` nesting issue. **Root cause confirmed in session 7c** (`session-7c-score-fix.md`): "The engine's STANDARD system prompt has always defined these as flat fields. The LLM was previously inferring the nested structure on its own. This was a pre-existing fragility, not caused by the Session 7 Stoic Brain changes." Fix: `normalizeScoreResult()` added to `/api/score/route.ts` (server-side normalization). Loader side-effect check: "none found." The stewardship lesson: the session 7 deployment tested the API response shape but not the client-side rendering — the `/score` page was the consumer but wasn't in the verification plan. Session 7b's handoff note also shows a diagnostic gap: auto-injection was disabled as a precaution, but the error persisted because the root cause was unrelated. The disable/re-enable cycle cost a full session. | 1. Add client-side rendering to every deployment verification plan when response schemas are changed. 2. When disabling a feature as a precaution, immediately test whether the error persists — if it does, the feature isn't the cause. Don't wait for a new session. | `AFTER any incident involving an enable/disable cycle: Document the root cause confirmation in the handoff note. Include: what confirmed it, which session, what evidence.` |
| **F12** | Decision log — R20a detection model + ADR-R20a-01 | **Missing eval** | The R20a detection model (decision log, 15 April) adopts an asynchronous moderation queue with a persistent footer. The ADR-R20a-01 adopts a two-stage classifier (regex + Haiku). These are two separate decisions made the same day. The current deployed system has neither — it has only the regex patterns from `guardrails.ts` (the pre-ADR implementation from session 14). The gap: the regex implementation pre-dates the ADR and does not match the ADR's design. The ADR requires a Haiku evaluator for borderline inputs (D1-c), a `vulnerability_flag` Supabase table (D4-a, now deployed), and a persistent footer on mentor/journal UIs (not yet built). The session 14 implementation is an interim measure that was never formally designated as "interim" — it was marked "Verified" in the status changes. | 1. Add a status field to the compliance register: "R20a interim (regex-only) — ADR-R20a-01 Phases C-H not yet implemented." 2. Do not claim R20a as "Verified" in hold-point assessments until the ADR's design is implemented. The regex-only gate is a necessary but insufficient implementation of R20a. | `AT HOLD POINT ASSESSMENT: Check each R-number's compliance register status against the actual deployed code. If the deployed code does not match the adopted ADR, the status is "partial" not "verified."` |
| **F13** | `project-context.ts` — `minimal` level is larger than `condensed` | **Memory-wall / Missing eval** | Session 15 April (Layer 3 wiring handoff, carry-over register) documents: "'minimal' > 'condensed'. The 'minimal' level produces ~222 tokens, 'condensed' produces ~139 tokens." The naming is misleading. `minimal` was chosen for `/guardrail` (the highest-volume endpoint at scale) specifically because it was supposed to be the lightest level. It is in fact 60% heavier than `condensed`. The decision was acknowledged ("counter-intuitive") but no action was taken. The carry-over suggests revisiting at P3 with an `identity-only` level (~60 tokens). | 1. Rename `minimal` to `ethical` or `identity_and_ethics` to reflect what it actually contains. 2. Create a true `minimal` level (identity string only, ~60 tokens) for the guardrail. 3. At minimum, add a comment in `project-context.ts` noting the token inversion so future agents don't assume the name reflects the size. | `WHEN assigning a project context level to an endpoint: Check actual token count, not the level name. Current sizes: full ~600, summary ~400, minimal ~222, condensed ~139.` |
| **F14** | `guardrails.ts` — proximity levels as free strings | **Maintainability** | The V3 proximity scale (`reflexive`, `habitual`, `deliberate`, `principled`, `sage_like`) is defined as a rank mapping in `guardrails.ts` (line ~65-70) but the values are plain strings, not a TypeScript enum or union type. The LLM returns these strings in its JSON output. If the LLM returns `"sage-like"` (hyphenated) instead of `"sage_like"` (underscored), `meetsThreshold()` returns the wrong result because the rank lookup fails. The engine's diagnostic validation (line 523) checks for `katorthoma_proximity` presence but not whether its value is a valid member of the scale. | Add a `ProximityLevel` union type. Validate the LLM's returned `katorthoma_proximity` against it in the engine's validation block (line 519-527). On invalid value, log a warning and either coerce to nearest or reject. | `WHEN modifying the proximity scale: Update the type definition, the rank mapping in guardrails.ts, all three system prompt schemas in sage-reason-engine.ts, and the client-side page.tsx display logic.` |
| **F15** | `sage-reason-engine.ts` — no runtime token budget enforcement | **Missing eval** | The architectural decisions extract (lines 449-456) documents token budgets: quick ~995, standard ~1538, deep ~2007, with ceilings at 3000/6000. The stoic-brain-loader is designed to stay within these budgets. But there is no runtime check — the loader returns whatever the compiled constants contain, and no code measures the token count before injection. If a future Stoic Brain update inflates the compiled constants past the ceiling, the system silently exceeds budget and may produce truncated output. The session 13 failures (standard depth with longer inputs) were partly a token budget issue — the combined context exceeded what 4096 output tokens could accommodate. The fix was to raise max_tokens, not to check input size. | Add a character-count check in `getStoicBrainContext()`: if the returned string exceeds `ceiling_tokens × 4` characters, log a warning. This is a rough check (chars ÷ 4 ≈ tokens) but catches gross overruns. | `AFTER any change to stoic-brain-compiled.ts: Measure the output of getStoicBrainContext() at each depth. Compare against ceilings. Log if within 20% of ceiling.` |
| **F16** | `score-document` endpoint — bypasses engine entirely | **Memory-wall** | Decision log (16 April): "score-document is the only endpoint that bypasses the engine entirely — it has no Layer 1 (Stoic Brain), Layer 2 (practitioner context), or Layer 3 (project context)." Flagged as tech debt, deferred to P1. This means document scoring operates context-blind — the same problem the three-layer architecture was built to solve. A user scoring a document gets generic Stoic reasoning without their profile, without the Stoic Brain taxonomy, and without project state. | Migrate `score-document` to `runSageReason()` in P1 as planned. Until then, add a response header or meta field: `context_layers: 'none'` so consumers know the output is ungrounded. | `BEFORE P1 begins: Confirm score-document migration is on the P1 task list. If it slips to P2, it becomes a compliance gap (R12 requires 2+ mechanisms, score-document has 0).` |

---

## SECTION 3: THE SESSION 7b INCIDENT — DETAILED ANALYSIS

**HIGH CONFIDENCE on the sequence. PHASE 2 on root cause confirmation timing.**

**What happened:**
1. Session 7 (9 April): Layer 1 built and deployed with auto-injection enabled. All 9 engine endpoints received Stoic Brain context automatically from depth parameter. TypeScript compiled clean.
2. User tested `/score` page. Client-side crash: `Cannot read properties of undefined (reading 'katorthoma_proximity')` — the client expected `result.virtue_quality.katorthoma_proximity` (nested), but the LLM returned `katorthoma_proximity` as a flat top-level field.
3. Session 7b (10 April): Two fixes attempted — circular dependency (real bug, fixed) and auto-injection disabled (precautionary). Error persisted after both fixes.
4. The handoff note lists 4 hypotheses: Vercel deploy lag, import side effect, unrelated coincidental bug, browser caching.
5. Root cause was identified as a pre-existing fragility: the system prompt asks for flat fields, the client expects nested `virtue_quality` — the LLM had been spontaneously nesting them, and this implicit behavior was never enforced by schema.
6. Auto-injection re-enabled. The `virtue_quality` nesting issue was fixed (presumably in session 7c — PHASE 2: `session-7c-score-fix.md` was not read in this audit).

**Stewardship failure:** The agent deployed a change (auto-injection) to production without testing the most common user-facing page (`/score`). The `/score` page's client-side expectations were not part of the deployment verification. The session 7 verification plan said: "Call `/api/reason` with input describing a passion-laden decision" — it did not include `/score` page rendering. This is a classic missing-eval gap: the test checked the API response shape but not the client-side consumption of that response.

**Why it matters for future work:** Every change to system prompts or response schemas needs both an API-level test (does the JSON parse?) and a client-level test (does the page render?). The session 7b incident cost a full session of debugging and temporarily disabled a deployed feature.

---

## SECTION 4: THREE DOCUMENTED ARCHITECTURAL TENSIONS — STATUS CHECK

### Tension 1: Layer 3 leakage to agent-facing endpoints
- **Source:** 15 April Layer 3 wiring handoff
- **Status:** Accepted risk. `/guardrail` and `/score-iterate` inject SageReasoning project state on every external agent call. Deferred to P3.
- **Audit finding:** This is not just IP exposure — it's reasoning pollution. An external agent evaluating "should I delete this user's data?" receives SageReasoning's internal project tensions in the context. The LLM may factor these into the evaluation. **This should be revisited before P3** — a simple `if (isApiKeyAuth) { projectContext = null }` conditional costs 2 lines and eliminates the risk now.

### Tension 2: Latency undocumented for full L1+L2+L3 at deep depth
- **Source:** Architectural decisions extract, session 7d (latency increased to ~34-38s post-Layer 2)
- **Status:** PHASE 2. No measurement exists for the full three-layer stack at deep depth. Session 7d measured L1+L2 only. Session 15 April measured Layer 3 token count but not latency. Deep depth uses 6 mechanisms + practitioner context + project context + 8192 max_tokens. Worst-case latency could exceed 60 seconds, which would timeout on many HTTP clients.
- **Recommendation:** Measure deep depth end-to-end latency in the next session that touches the engine. Add to the hold-point assessment.

### Tension 3: Classifier cost monitoring not yet instrumented
- **Source:** 17 April comprehension handoff
- **Status:** Scaffolded. `r20a-cost-tracker.ts` exists, returns zeros. The classifier (Phase D) doesn't exist yet, so there's nothing to monitor. The `COST_HEALTH` threshold (20% of mentor-turn cost) is set. The alert mechanism is a `console.warn` — no structured alerting, no dashboard, no notification.
- **Audit finding:** When the classifier ships, the alert is a log line. A solo founder checking Vercel logs is the alert mechanism. This is honest for current capacity but should be documented as a known limitation.

---

## SECTION 5: EVIDENCE NOT SUPPLIED — PHASE 2 ITEMS

| Item | Why it's needed | Where to find it |
|------|-----------------|-----------------|
| `session-7c-score-fix.md` | ~~Closes the session 7b root cause evidence chain.~~ **RESOLVED** — read during audit. Root cause: pre-existing nesting fragility. Fix: server-side `normalizeScoreResult()`. Loader side-effects: none. | `/operations/handoffs/session-7c-score-fix.md` — **READ, F11 upgraded to HIGH CONFIDENCE** |
| Vercel deployment logs (any session) | Confirms actual deploy timing vs. test timing. Session 7b hypothesized "Vercel deploy hadn't completed when the user tested." | Vercel dashboard |
| `practitioner-context.ts` source | Full code review of encryption handling, null-return paths, and cache behavior. The audit relied on handoff descriptions, not direct code read. | `website/src/lib/context/practitioner-context.ts` |
| Actual `usage.input_tokens` from Anthropic API | Confirms whether Layer 1+2+3 combined stays within model context limits. All current estimates are chars÷4 approximations. | Requires authenticated live call logging |
| `stoic-brain-compiled.ts` token counts per constant | Confirms the compiled data stays within per-mechanism budgets. The architectural decisions extract flags this as unresolved (line 576-577). | Direct measurement of the 438-line file |
| Compliance register (full document) | This audit references R17-R20 status from the decision log. A separate compliance register document may have more granular status. | Check `/compliance/` directory |
| Existing test suite (if any) | Determines whether any of the recommended tests already exist. | `website/src/**/*.test.ts` or similar |

---

## SECTION 6: CONTEXTUAL STEWARDSHIP PLAYBOOK

```
CONTEXTUAL STEWARDSHIP PLAYBOOK — SageReasoning
Version: 1.0 — 17 April 2026

════════════════════════════════════════════════════════════════

EVAL PATTERNS (run before every non-trivial agent action):

  [ ] CONTEXT FRESHNESS
      - Is project-context.json last_updated within 7 days?
      - Is the Supabase project_context migration run? (Currently: NO)
      - Are recent_decisions current or frozen from a past session?

  [ ] COMPOSITION ORDER
      - Does this change touch the six-layer user message order?
      - Order: domain → practitioner → project → urgency → stage_scoring → JSON instruction
      - Source of truth: architectural-decisions-extract.md, section "Three layers
        composed in a fixed order"

  [ ] TOKEN BUDGET
      - Does this change add tokens to any layer?
      - Current totals per depth:
          quick:    ~995 (Stoic Brain) + ~400 (practitioner) + ~139 (project) = ~1534
          standard: ~1538 + ~400 + ~139 = ~2077
          deep:     ~2007 + ~400 + ~139 = ~2546
      - Ceilings: quick 3000, deep 6000 (per context-architecture-build.md line 59)
      - WARNING: These are Layer-level ceilings, NOT total prompt ceilings.
        Total prompt includes system prompt + user input + all layers.

  [ ] COMPLIANCE REGISTER
      - Does this change affect R17–R20 implementation status?
      - Check the deployed code, not the decision log. The decision log records
        intent; the code is the truth.
      - Key gap: R20a is "Verified" in session 14 handoff but only regex-implemented.
        ADR-R20a-01 Phases C-H are not built.

  [ ] ROLLBACK
      - If this fails, what is the exact revert step?
      - For engine changes: git revert [commit]. Graceful degradation means
        removing a layer degrades context, doesn't break the endpoint.
      - For schema changes: DROP TABLE IF EXISTS [table] CASCADE.
      - For auth/access changes: CRITICAL CHANGE PROTOCOL required (0c-ii).

  [ ] DUAL VERIFICATION (learned from session 7b incident)
      - API test: Does the endpoint return valid JSON with expected fields?
      - Client test: Does every page that consumes this endpoint render correctly?
      - If you changed the response schema, grep for every client-side reference
        to the changed fields.

════════════════════════════════════════════════════════════════

CONTEXT DOCUMENTATION TEMPLATE (for every new module):

  Purpose:              [one sentence]
  Risk classification:  [standard / elevated / critical — per 0d-ii]
  Rules served:         [R-numbers]
  Architectural tensions: [list or "none"]
  What breaks if this file is deleted: [specific downstream effects]
  What breaks if this file returns wrong data: [silent failure modes]
  Duplicated constants:  [list files that must stay in sync, or "none"]
  Last verified:        [date + method]
  Update trigger:       [what event requires this file to be updated]

════════════════════════════════════════════════════════════════

GUARDRAIL CHECKLIST (before every deployment):

  [ ] Auth handled before engine call?
  [ ] detectDistress() wired for ALL human-facing endpoints?
      Current list: reason, score, score-decision, score-social,
      score-document, reflect, score-scenario, mentor/private/reflect
      + 12 marketplace skills
  [ ] Output validated against expected schema?
      (katorthoma_proximity present AND value is valid ProximityLevel)
  [ ] Retry logic has a defined failure path (not infinite)?
      Current: quick→Sonnet retry (1 attempt). Standard/deep: no retry (throws).
  [ ] Cost impact estimated and within budget?
      Quick (Haiku): ~$0.001/call. Standard/Deep (Sonnet): ~$0.015/call.
      Retry doubles quick-depth cost for failed calls.
  [ ] Crisis resources current? (last verified: NEVER — set quarterly reminder)

════════════════════════════════════════════════════════════════

DECISION LOG FORMAT (for every session):

  Date:
  Decision made:
  Why (not just what):
  What was rejected and why:
  Risk classification: [standard / elevated / critical]
  Rollback path: [exact command or steps]
  Open questions deferred:
  Root cause confirmed: [yes/no — if this closes an incident, document the evidence]

════════════════════════════════════════════════════════════════

KNOWN SYNC POINTS (files that must stay in sync):

  1. DEPTH_MECHANISMS: sage-reason-engine.ts:129 ↔ stoic-brain-loader.ts:209
     Both define which mechanisms apply at each depth. No test enforces sync.

  2. ReasonDepth type: sage-reason-engine.ts:42 ↔ stoic-brain-loader.ts:30
     Duplicated to avoid circular dependency. Must match.

  3. Proximity scale: guardrails.ts (rank mapping) ↔ sage-reason-engine.ts
     (system prompt JSON schema) ↔ score/page.tsx (client display)
     Values must be identical strings across all three.

  4. Crisis resources: guardrails.ts ↔ distress-signal-taxonomy.md
     Hotline numbers must match. guardrails.ts is the runtime source.

  5. Context levels: project-context.ts (level definitions) ↔
     each route file (level parameter passed to getProjectContext)
     Must use valid level names.

════════════════════════════════════════════════════════════════

RECURRING CHECKS:

  QUARTERLY: Verify crisis resource phone numbers (F6)
  MONTHLY:   Check Vercel logs for Supabase fallback warnings (F8)
  PER-SESSION: Update project-context.json recent_decisions (F3)
  PER-DEPLOY: Run dual verification — API + client rendering (F11)
  PER-NEW-ENDPOINT: Set depth explicitly, wire detectDistress if
                    human-facing, choose project context level by
                    actual token count not name (F13)
```

---

## Summary of Findings by Confidence

**HIGH CONFIDENCE (code + log evidence):**
F1 (distress detection false-negative gap), F2 (no retry for standard/deep), F3 (static project context staleness), F4 (retry cost invisibility), F5 (duplicated DEPTH_MECHANISMS), F6 (hardcoded crisis resources), F7 (no compile script for Stoic Brain), F8 (silent Supabase fallback), F9 (composition order unenforced), F10 (default depth cost implication), F13 (minimal > condensed naming), F14 (proximity levels as free strings), F15 (no runtime token budget check), F16 (score-document context-blind)

**UPGRADED TO HIGH CONFIDENCE (after reading session-7c-score-fix.md):**
F11 (session 7b root cause confirmed in session 7c: pre-existing `virtue_quality` nesting fragility, not Stoic Brain injection)

**PHASE 2 (evidence not yet reviewed):**
F12 (R20a interim vs ADR status gap — needs full compliance register)
Latency measurement for full three-layer deep depth
Actual Anthropic `usage.input_tokens` vs estimates
