# SageReasoning — Project State
**Last updated:** 20 April 2026 · Session 21
**Current phase:** P0 — Foundations (R&D Phase), preparing to close out for P1
**Hold point (0h) status:** Assessments 1–5 complete. Assessment 4 refreshed 18 April (163 components). Exit criteria substantively met; two items open (see §4).
**Purpose:** Shared context layer for Tech, Growth, and Support agents. Authoritative project state for any session that needs it without reading the full project instructions.

**Change notes (since 11 April update):**
- R20a vulnerable-user detection moved from Scoped → Verified (two-stage classifier live on all 8 human-facing POST routes, regex stage eval 6/6 pass, Haiku stage pending live API key test).
- R17b application-level encryption moved from Scaffolded → Wired (per TECHNICAL_STATE ADR-007 and `encryption.ts` integration).
- Layer 3 project context wired from 4 → 13 endpoints; MENTOR_CONTEXT_V2 feature flag live in production.
- Build enforcement instituted: tsconfig strict flags, ESLint safety-critical rules, Husky pre-commit, Vercel green.
- `constraints.ts` added with branded `FastModel`/`DeepModel` types and the `SafetyGate` pattern. Model selection and synchronous safety checks are now compile-time enforced.
- Knowledge-persistence pipeline (structured observations + parallel retrieval) wired across 5 mentor routes.
- Component registry refreshed: 148 → 163 components (v1.1.0 → v1.2.0).
- Nine new process rules (PR1–PR9) adopted as standing rules in the project instructions.

---

## 1. What SageReasoning Is

SageReasoning makes principled reasoning accessible to every rational agent — human and artificial. It encodes Stoic wisdom into infrastructure that helps any being examine its impressions, diagnose its false judgements, and progress toward virtue.

**Three service lines:**

1. **Human practitioners** — Tools for daily Stoic practice on sagereasoning.com. Action scoring, reflection, journal analysis, scenario evaluation.

2. **Agent developers** — API and skill contracts for integrating principled reasoning into AI agents. The Agent Trust Layer certifies agent virtue progression.

3. **AI-assisted startup founders** — The P0 workflow (session continuity, verification framework, status vocabulary, decision log, knowledge-gap register, critical-change protocol) as a packaged toolkit for non-technical founders building with AI.

**The measure of success is flourishing, not market share.**

---

## 2. Positioning Language

### Approved positioning (use these, in these words)

**Tagline options:**
- "Principled reasoning for every rational agent"
- "Ancient wisdom. Modern infrastructure."
- "The Stoic Brain for AI."

**What it does (one sentence):**
SageReasoning evaluates decisions, actions, and agent behaviour against the Stoic virtue framework — returning qualitative proximity assessments, passion diagnoses, and improvement paths.

**What it does not do (R19 — no overclaiming):**
- It is not therapy. It does not diagnose, treat, or prevent psychological conditions.
- It is not a moral arbiter. It surfaces patterns and prompts reflection — it does not judge the person.
- It does not guarantee virtue. Proximity assessments are qualitative estimates from limited data, not certified states.
- It does not replace professional advice (legal, medical, financial, psychological).

**Audience-specific:**

*For human practitioners:*
"A daily practice tool for people who take Stoicism seriously — not self-help repackaging, but the actual philosophical framework applied to your actual decisions."

*For agent developers:*
"Reasoning infrastructure for AI agents. A structured dataset, evaluation API, and trust layer that lets your agent examine its own impressions and progress toward principled decision-making."

*For startup founders:*
"A tested workflow for non-technical founders building with AI. Session continuity, verification without reading code, and a decision trail that survives context windows."

### Prohibited language (R19)
- "AI therapist" / "digital therapist" / "mental health tool"
- "Certified Stoic" / "certified virtue" (re: users — agents have a certification, users do not)
- "Proven to improve" / "scientifically validated"
- "Understand you better than you understand yourself"
- Claims that Stoic practice will resolve depression, anxiety, or other clinical conditions
- Universality claims ("for everyone") — SageReasoning is for people who engage seriously with philosophical frameworks

---

## 3. What's Live vs In-Progress vs Planned

### Status vocabulary
- **Live** — Deployed to production, serving users
- **Verified** — Tested and confirmed working end-to-end by both parties
- **Wired** — Functional end-to-end in the codebase; not yet verified or not yet connected to live LLM
- **Scaffolded** — Structure exists, doesn't do anything yet
- **Designed** — Architecture decided, schema may exist, no functional code
- **Scoped** — Requirements defined, no architecture yet

---

### Human-Facing Products (sagereasoning.com)

| Product | Status | Notes |
|---|---|---|
| Action scorer (/score) | Verified | Endpoint + distress gate + client-side redirect UI all confirmed. Not Live without paid-tier metering. |
| Daily reflection (/reflect) | Verified | Own Anthropic client + mentor bridge. SafetyGate pattern applied. |
| Decision scorer (/score-decision) | Verified | Ranks multiple options by Stoic alignment. Layer 3 condensed. |
| Social filter (/score-social) | Verified | Evaluates communications before posting. Distress gate + redirect UI. |
| Document evaluator (/score-document) | Verified | Deep analysis (6 mechanisms). Manual L3 injection. |
| Scenario evaluator (/score-scenario) | Verified | Pre-mortem / hypothetical analysis. L3 on scoring call. |
| Universal reasoner (/reason) | Verified | Caller-specified depth. Powers all sage skills. L3 condensed. |
| Guardrail (/guardrail) | Verified | Risk-classified checkpoint. L3 minimal (agent-facing). |
| Agent baseline (/baseline/agent) | Wired | 4-scenario ethical evaluation for agents. Live LLM path untested. |
| Foundational assessment (/assessment/foundational) | Wired | 14-prompt free-tier self-assessment. |
| Full assessment (/assessment/full) | Wired | 55-prompt paid-tier assessment. |
| Deliberation engine (/score-iterate) | Verified | Stateful chains with Supabase persistence. L3 on both call sites. |
| Sage Mentor (private) | Verified | Full-context mentor. MENTOR_CONTEXT_V2 flag live. Recent-interaction loader verified. |
| Sage Mentor (public) | Wired | Condensed-context mentor for all users. |
| Practice journal | Verified | Daily journal ingestion + interpretation validated against founder's real data. |
| Community map | Scaffolded | Oikeiosis visualisation across practitioner community. |
| Practice calendar | Scaffolded | Structured practice scheduling. |

**Key gap (P2/P4 blocker for Live):** `ANTHROPIC_API_KEY` is not yet connected to a live payment/metering system that allows public usage. Users cannot currently receive real LLM responses from the website without direct founder access. This is a P4 item (Stripe + metered billing), not a P2 item.

---

### Agent Developer Infrastructure

| Component | Status | Notes |
|---|---|---|
| sage-reason API | Verified | Full endpoint suite. OpenAPI spec complete (api-spec.yaml). L3 condensed injected. |
| API key system | Wired | SHA-256 hashed keys, free/paid tiers, monthly/daily limits. |
| Agent Trust Layer (ATL) | Scaffolded | Authority level schema + certification contracts exist. LLM evaluation not wired. |
| llms.txt | Scaffolded | Agent discovery document. |
| agent-card.json | Scaffolded | OpenAI plugin-style discovery card. |
| Skill marketplace (/marketplace) | Scaffolded | 15 wrapped sage skills registered; browseable. |
| Deliberation chains | Verified | /score-iterate with Supabase persistence. |
| Honest certification language (R18) | Designed | Scope language drafted; not yet on public materials. |

---

### Safety & Compliance Infrastructure (new section — reflects 17–18 April work)

| Component | Status | Notes |
|---|---|---|
| R20a two-stage distress classifier (`r20a-classifier.ts`) | Verified | Regex stage + Haiku stage. `detectDistressTwoStage()` used by all 8 human-facing POST routes. |
| SafetyGate pattern (`constraints.ts`) | Verified | Compile-time guarantee that distress check is awaited before response construction. |
| `enforceDistressCheck()` invocation | Verified | Applied to 8/8 human-facing POST routes (grep-confirmed). |
| R20a cost tracker (`r20a-cost-tracker.ts` + `classifier_cost_log`) | Wired | Supabase table created. Cost logging operational. |
| R20a invocation guard test | Wired | Jest test source correct. Jest config still pending for `website/`. |
| Branded model types (`FastModel` / `DeepModel`) | Verified | Passing the wrong model to a safety-critical call is a compile error. |
| `SafetyCriticalCallParams` type | Verified | Enforces `FastModel` + `temperature: 0` at compile time. |
| Zone 2 philosophical-language boundary (regex stage) | Verified | 6/6 Clinton-profile eval inputs pass. Audit filed 18 April. |
| Zone 2 Haiku stage | Untested | Needs live ANTHROPIC_API_KEY for end-to-end run. |
| Client-side distress redirect UI | Verified | 5 pages (score, score-document, score-social, scenarios, private-mentor) render redirect on `distress_detected: true`. |
| Crisis resource verification schedule | Verified | Next due 30 June 2026 (comment block in `guardrails.ts`). |
| Application-level encryption (`encryption.ts`, R17b) | Wired | Integrated per ADR-007. Per-field encryption for intimate profile data. |
| Husky pre-commit hook | Verified | Two-stage check (tsc → eslint on safety files), graceful npx-missing fallback. |
| `.eslintrc.json` with safety-critical rules | Verified | `no-unused-vars` as error on 4 safety-critical files. |
| tsconfig strict flags (`noUnusedLocals`, `noUnusedParameters`) | Verified | Project-wide enforcement. ~126 unused-code errors cleaned across 40+ files. |
| Vercel build status | Green | Build enforcement active on deploys. |

---

### Context & Knowledge Persistence (new section — reflects 13–15 April work)

| Component | Status | Notes |
|---|---|---|
| Layer 1 Stoic Brain (compiled) | Verified | Live on 23 endpoints. |
| Layer 2 Practitioner Context | Verified | Live on 12 user-authenticated endpoints. Not applicable to 2 API-key-only endpoints. |
| Layer 3 Project Context | Verified | Wired to 13 endpoints (4 prior + 9 in session 15). Condensed level, minimal on /guardrail. |
| Layer 4 Environmental Context | Designed | Table exists. No scan has run. Silent. |
| Layer 5 Mentor Knowledge Base | Scaffolded | Structure in place. Not wired. |
| MENTOR_CONTEXT_V2 feature flag | Live | `true` in Vercel production. 31.9% net token reduction; 12.0% signal addition. |
| Profile Projection Layer | Verified | Condensed profile summary writes verified. |
| Recent Interaction Loader | Verified | Mentor references prior patterns without being told (philodoxia callback confirmed). |
| `session_context_snapshots` writer | Verified | Await pattern adopted. 3 rows confirmed in table. |
| `snapshot_type = 'mentor_session'` constraint | Verified | Migration applied to live Supabase. |
| Structured mentor observations pipeline | Wired | LLM prompt validates against contract; dual-write to legacy + `mentor_observations_structured`. |
| Parallel retrieval wrapper | Wired | 5 mentor routes use `getMentorObservationsWithParallelLog()`. Analytics events logging both paths. |
| Cutover threshold (legacy → structured) | Scoped | Switch after 5–10 structured observations pass manual quality review. No calendar deadline. |

---

### Sage Ops Pipeline (Internal Agents)

| Component | Status | Notes |
|---|---|---|
| sage-orchestrator module | Scaffolded | Standalone module: types, pipeline, presets, index. Ready for P7 wiring. |
| Ring wrapper (ring-wrapper.ts) | Wired | BEFORE + AFTER checks, Critical category escalation, side-effect detection. |
| Tech Brain | Scaffolded | Domain expertise compiled. Not wired to any endpoint. |
| Growth Brain | Scaffolded | Same. |
| Support Brain | Scaffolded | Same. |
| Ops Brain | Scaffolded | Same. |
| Support agent | Designed | Implementation plan complete. Build not started. |
| Support agent Supabase tables | Designed | Schema defined. Migration not yet run. |
| Environmental context scans (Layer 4) | Designed | Table exists (environmental_context). No scan has run — Layer 4 silent. |
| Sage Ops activation | Scoped | P7 item. Requires P6 (launch) first. |

---

### Ethical Safeguards (P2 — critical path to launch)

| Safeguard | Rule | Status | Priority |
|---|---|---|---|
| Vulnerable user detection + redirection | R20a | Verified (regex) / Untested (Haiku stage, needs API key) | CRITICAL |
| Bulk profiling prevention | R17a | Scoped | CRITICAL |
| Application-level encryption for intimate data | R17b | Wired (per ADR-007, `encryption.ts`) | Elevated |
| Genuine deletion endpoint | R17c | Scoped (503 placeholder at /api/user/delete) | Elevated |
| Limitations page | R19c | Scoped | Standard |
| Mirror principle in mentor prompts | R19d | Scoped | Standard |
| Relationship asymmetry guidance | R20d | Scoped | Standard |
| Independence encouragement | R20b | Scoped | Standard |

---

### Startup Preparation Toolkit (P0 discovery)

| Component | Status | Notes |
|---|---|---|
| Session handoff notes | Wired | Manual process proven over 16+ sessions. |
| sage-stenographer skill | Wired | Session-open and session-close automation. Debrief mode added 8 April. |
| Session debrief protocol | Wired | 0b-ii protocol. First debrief produced 8 April. |
| Shared status vocabulary | Wired | Adopted by both parties. In active use. |
| Verification framework | Verified | Non-technical verification methods documented. Knowledge-Gap Carry-Forward Rule added 18 April. |
| Communication signals | Wired | 0d signals in active use both parties. |
| Decision log | Wired | Append-only, backdated to March. Updated each session. |
| Knowledge Gaps Register | Wired | KG1–KG7 documented in `operations/knowledge-gaps.md`. |
| File organisation + INDEX.md | Wired | 95+ files organised. |
| Capability inventory (interactive HTML) | Verified | 163 components (v1.2.0, refreshed 18 April). |
| Process Rules PR1–PR9 | Adopted | Standing rules encoded from build-knowledge-extraction cycle. |
| Simplest viable interface (for toolkit) | Scoped | P0h exit criterion 6. Interface not yet designed. |

---

## 4. P0 Hold Point Status

**Assessment 1 (What works):** Complete. Journal interpretation confirmed accurate from real founder data. Website tools functional and distress-gated; live LLM path for public users still gated on P4 billing. Agent Developer API structurally complete.

**Assessment 2 (What's missing):** Complete. Key gaps documented: live LLM pipeline not wired for public users (P4 blocker), ATL certification logic not wired, Support agent not built, remaining ethical safeguards (R17a, R17c, R19c/d, R20b/d) not implemented.

**Assessment 3 (What value can we demonstrate):** Complete. Journal diagnosis demonstrable. Distress detection demonstrable (11 test inputs, including 5 must-block and 5 must-pass). P0 founder workflow demonstrable.

**Assessment 4 (Capability inventory):** Complete and **refreshed 18 April 2026**. Interactive HTML refreshed to v1.2.0 (163 components). Component registry is the single source of truth.

**Assessment 5 (Startup preparation toolkit):** Complete. Toolkit components identified and mostly wired. Simplest viable interface not yet built (P0h exit criterion 6 — open).

**P0 exit criteria status:**
1. ✅ Shared status vocabulary in use
2. ✅ Session handoff notes being produced and used
3. ✅ Founder can verify without reading code
4. ✅ Communication signals in use
5. ✅ Files organised, INDEX.md current
6. ✅ Decision log maintained
7. ⬜ Hold point complete — Assessments 1–5 done; startup toolkit simplest-viable interface not built (criterion 6 open); sage-stenographer skill wired as manual automation (criterion 7 partially met)

**Current state:** P0 is substantively complete. One exit criterion open (simplest viable interface for startup toolkit). P1 (business plan review) can begin with evidence gathered. The open criterion does not block P1. Founder's call on whether to complete criterion 6 before P1 or carry it into P1.

---

## 5. Priority Sequence Reminder

| Priority | Name | Gate | Status |
|---|---|---|---|
| P0 | Foundations + Hold Point | 7 exit criteria | Substantively complete; 1 criterion open |
| P1 | Business Plan Review | P0 complete + evidence-based | Can begin |
| P2 | Ethical Safeguards (R17, R19, R20) | "not optional" — before broad deployment | Partially complete (R20a Verified, R17b Wired; others open) |
| P3 | Agent Trust Layer + Honest Certification (R18) | P2 complete | Not started |
| P4 | Stripe Integration + Cost Alerts (R5) | — | Not started |
| P5 | R0 Operationalisation | — | Not started |
| P6 | MVP Launch (11 criteria) | All P2–P5 + legal review | Not started |
| P7 | Sage Ops Activation | Post-launch | Not started |

---

## 6. Recent Decisions (Condensed — see decision-log.md for full reasoning)

| Date | Decision | Impact |
|---|---|---|
| 21 Mar | Brand identity: Stoic-themed, gold/navy | Brand guidelines established |
| 5 Apr | Manifest expanded R0–R20 | Ethical safeguards now governed |
| 5 Apr | Build sequence revised P0–P7 | P2 (ethics) before P3 (ATL) |
| 6 Apr | Agent-native taxonomy (9 categories, 23 subtypes) | All marketing uses agent developer nomenclature |
| 6 Apr | sage-reason-engine created as shared singleton | 5 tools refactored; 24 Anthropic clients → 1 |
| 8 Apr | Post-incident protocol additions | Risk classification, Critical Change Protocol, debrief protocol adopted |
| 10 Apr | Unified agent orchestration architecture | sage-orchestrator module; private/public mentor split |
| 13 Apr | Structured mentor observation pipeline + parallel retrieval | LLM prompt validates contract; dual-write; 5 routes use parallel wrapper |
| 14 Apr | MENTOR_CONTEXT_V2 adopted (await pattern, mentor_session snapshot type) | 31.9% token reduction; mentor references prior patterns without prompting |
| 15 Apr | Layer 3 wired to 9 additional public engine endpoints | L3 coverage 4 → 13. External agents receive SageReasoning project context (R4 risk accepted) |
| 17 Apr | Two-stage distress detection with inline Haiku (F1 remediation) | All 9 API routes use detectDistressTwoStage; ~500ms latency for borderline inputs |
| 17 Apr | Unified retry wrapper (F2 remediation) | No more 500s from parse failures |
| 17 Apr | Single source of truth for ReasonDepth via depth-constants.ts (F5) | Circular dependency removed; sync guaranteed at compile time |
| 18 Apr | Build enforcement: tsconfig strict + .eslintrc + Husky pre-commit | ~126 unused-code errors cleaned; Vercel green |
| 18 Apr | Branded types for model enforcement (FastModel/DeepModel) | Wrong-model-to-safety-call is a compile error |
| 18 Apr | SafetyGate pattern for synchronous safety enforcement | 8/8 human-facing POST routes use the gate |
| 18 Apr | Process rules PR1–PR9 adopted as standing rules | Codifies lessons from build-knowledge-extraction cycle |
| 18 Apr | Component registry refreshed to v1.2.0 (163 components) | Single source of truth for Capability Inventory + Ecosystem Map |

---

## 7. Open Questions (Requiring Founder Decision)

1. **Analytics platform:** Plausible Analytics vs Fathom — choice pending.
2. **Support agent privacy:** Surfacing profile summary at query entry — architecturally permissible; waiting on R17b confirmation-in-practice. See §8.
3. **Startup toolkit interface:** When to design and build? P0 exit criterion 6 is open but not blocking P1.
4. **Legal review engagement:** Manifest says "begin no later than P3." P3 is not yet started. Status unclear.
5. **Jest config for website directory:** Low effort, closes the r20a-invocation-guard test runner gap. Do this before or after P1?
6. **Haiku Zone 2 test:** Needs live API key. Run when convenient; document result in next safety signal audit.
7. **Cutover criteria for structured-observation pipeline:** Current threshold is 5–10 observations + manual quality review. Evidence-based switch — founder reviews when threshold met.

---

## 8. Privacy Architecture Assessment — Support Agent Profile Access

(Unchanged from 11 April update — with R17b status note below.)

**R17b note (updated 20 April):** Application-level encryption is now Wired per ADR-007. The earlier recommendation to "defer Support agent profile access until R17b is wired" is partially satisfied: encryption exists; what remains is verification of the encryption on the actual mentor profile read path. Until that verification is complete, the recommendation stands as "architecturally permissible, with remaining verification work before activation."

**R17 inventory:**
- **R17a (bulk profiling prevention):** The Support agent accessing the user's own profile to support that user's enquiry is not third-party profiling. No R17a violation.
- **R17b (intimate data encryption):** Wired. Verification of encrypted read path pending.
- **R17c (genuine deletion):** Not relevant to read-access question.
- **R17d (local-first strategy):** Profile summary surfaced via a local read of `mentor_profiles` to a local agent session. Aligns with R17d intent.

**Recommendation:** Architecturally permissible within R17 intent. With R17b now Wired, the remaining gate is verification that encrypted reads return the expected data shape. Founder decides when to verify and activate.

---

*Update this document at the close of each session. Core source of truth for agent context layers. Full decision reasoning lives in `operations/decision-log.md`.*
