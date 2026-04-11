# SageReasoning — Project State
**Last updated:** 11 April 2026 · Session 11  
**Current phase:** P0 — Foundations (R&D Phase)  
**Hold point (0h) status:** Assessments 1–5 complete. Exit criteria partially met (see §4).  
**Purpose:** Shared context layer for Tech, Growth, and Support agents. Authoritative project state for any session that needs it without reading the full project instructions.

---

## 1. What SageReasoning Is

SageReasoning makes principled reasoning accessible to every rational agent — human and artificial. It encodes Stoic wisdom into infrastructure that helps any being examine its impressions, diagnose its false judgements, and progress toward virtue.

**Three service lines:**

1. **Human practitioners** — Tools for daily Stoic practice on sagereasoning.com. Action scoring, reflection, journal analysis, scenario evaluation.

2. **Agent developers** — API and skill contracts for integrating principled reasoning into AI agents. The Agent Trust Layer certifies agent virtue progression.

3. **AI-assisted startup founders** — The P0 workflow (session continuity, verification framework, status vocabulary, decision log) as a packaged toolkit for non-technical founders building with AI.

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
- **Wired** — Functional end-to-end in the codebase; not yet serving users or not yet connected to live LLM
- **Scaffolded** — Structure exists, doesn't do anything yet
- **Designed** — Architecture decided, schema may exist, no functional code
- **Scoped** — Requirements defined, no architecture yet

---

### Human-Facing Products (sagereasoning.com)

| Product | Status | Notes |
|---|---|---|
| Action scorer (/score) | Wired | Endpoint functional. UI exists. Not Live (no live ANTHROPIC_API_KEY connected to UI in prod) |
| Daily reflection (/reflect) | Wired | Uses own Anthropic client + mentor bridge for profile update |
| Decision scorer (/score-decision) | Wired | Ranks multiple options by Stoic alignment |
| Social filter (/score-social) | Wired | Evaluates communications before posting |
| Document evaluator (/score-document) | Wired | Deep analysis (6 mechanisms). Persistence via /score-document/{id} |
| Scenario evaluator (/score-scenario) | Wired | Pre-mortem / hypothetical analysis |
| Universal reasoner (/reason) | Wired | Caller-specified depth. Powers all sage skills |
| Guardrail (/guardrail) | Wired | Risk-classified action safety checkpoint |
| Agent baseline (/baseline/agent) | Wired | 4-scenario ethical evaluation for agents |
| Foundational assessment (/assessment/foundational) | Wired | 14-prompt free-tier self-assessment |
| Full assessment (/assessment/full) | Wired | 55-prompt paid-tier assessment |
| Deliberation engine (/score-iterate) | Wired | Stateful iterative deliberation chains |
| Sage Mentor (private) | Wired | Full-context mentor for founder. 4 private endpoints |
| Sage Mentor (public) | Wired | Condensed-context mentor for all users |
| Practice journal | Wired | Daily journal ingestion + interpretation |
| Community map | Scaffolded | Oikeiosis visualisation across practitioner community |
| Practice calendar | Scaffolded | Structured practice scheduling |

**Key gap (P2 blocker for Live):** `ANTHROPIC_API_KEY` is not yet connected to a live payment/metering system that allows public usage. Users cannot currently receive real LLM responses from the website without direct founder access.

---

### Agent Developer Infrastructure

| Component | Status | Notes |
|---|---|---|
| sage-reason API | Wired | Full endpoint suite. OpenAPI spec complete (api-spec.yaml) |
| API key system | Wired | SHA-256 hashed keys, free/paid tiers, monthly/daily limits |
| Agent Trust Layer (ATL) | Scaffolded | Authority level schema + certification contracts exist. LLM evaluation not wired |
| llms.txt | Scaffolded | Agent discovery document |
| agent-card.json | Scaffolded | OpenAI plugin-style discovery card |
| Skill marketplace (/marketplace) | Scaffolded | 15 wrapped sage skills registered; browseable |
| Deliberation chains | Wired | /score-iterate with Supabase persistence |
| Honest certification language (R18) | Designed | Scope language drafted; not yet on public materials |

---

### Sage Ops Pipeline (Internal Agents)

| Component | Status | Notes |
|---|---|---|
| sage-orchestrator module | Scaffolded | Standalone module: types, pipeline, presets, index. Ready for P7 wiring |
| Ring wrapper (ring-wrapper.ts) | Wired | BEFORE + AFTER checks, Critical category escalation, side-effect detection |
| Tech Brain | Scaffolded | Domain expertise compiled. Not wired to any endpoint — session-level context for Sage-Tech agent |
| Growth Brain | Scaffolded | Same |
| Support Brain | Scaffolded | Same |
| Ops Brain | Scaffolded | Same |
| Support agent | Designed | Implementation plan complete (Support_Agent_Implementation_Plan.md). Build not started |
| Support agent Supabase tables | Designed | Schema defined. Migration not yet run |
| Environmental context scans (Layer 4) | Designed | Table exists (environmental_context). No scan has run — Layer 4 is effectively silent |
| Sage Ops activation | Scoped | P7 item. Requires P6 (launch) first |

---

### Ethical Safeguards (P2 — critical path to launch)

| Safeguard | Rule | Status | Priority |
|---|---|---|---|
| Vulnerable user detection + redirection | R20a | Scoped | CRITICAL |
| Bulk profiling prevention | R17a | Scoped | CRITICAL |
| Application-level encryption for intimate data | R17b | Scaffolded (encryption.ts exists, not wired) | Elevated |
| Genuine deletion endpoint | R17c | Scoped (503 placeholder at /api/user/delete) | Elevated |
| Limitations page | R19c | Scoped | Standard |
| Mirror principle in mentor prompts | R19d | Scoped | Standard |
| Relationship asymmetry guidance | R20d | Scoped | Standard |
| Independence encouragement | R20b | Scoped | Standard |

---

### Startup Preparation Toolkit (P0 discovery)

| Component | Status | Notes |
|---|---|---|
| Session handoff notes | Wired | Manual process proven over multiple sessions |
| sage-stenographer skill | Wired | Session-open and session-close automation. Debrief mode added 8 April |
| Session debrief protocol | Wired | 0b-ii protocol. First debrief produced 8 April |
| Shared status vocabulary | Wired | Adopted by both parties. In active use |
| Verification framework | Wired | Non-technical verification methods documented and tested |
| Communication signals | Wired | 0d signals in active use both parties |
| Decision log | Wired | Append-only, backdated to March. Updated each session |
| File organisation + INDEX.md | Wired | 95+ files organised |
| Capability inventory (interactive HTML) | Verified | 148 components with honest status assessments |
| Simplest viable interface | Scoped | P0h exit criterion 6. Interface not yet designed |

---

## 4. P0 Hold Point Status

**Assessment 1 (What works):** Complete. Journal interpretation confirmed accurate from real founder data. Website tools functional but not connected to live LLM in production context. Agent Developer API structurally complete but no live calls possible without API key infrastructure being exposed.

**Assessment 2 (What's missing):** Complete. Key gaps documented: live LLM pipeline not wired end-to-end for human users, ATL certification logic not wired, Support agent not built, ethical safeguards (P2) not implemented.

**Assessment 3 (What value can we demonstrate):** Complete. Journal diagnosis demonstrable. Live API calls not demonstrable. P0 founder workflow demonstrable.

**Assessment 4 (Capability inventory):** Complete. Interactive HTML produced (`SageReasoning_Capability_Inventory.html`). 148 components assessed.

**Assessment 5 (Startup preparation toolkit):** Complete. Toolkit components identified. Simplest viable interface not yet built (P0h exit criterion 6 — open).

**P0 exit criteria status:**
1. ✅ Shared status vocabulary in use
2. ✅ Session handoff notes being produced and used
3. ✅ Founder can verify without reading code
4. ✅ Communication signals in use
5. ✅ Files organised, INDEX.md current
6. ✅ Decision log maintained
7. ⬜ Hold point complete — Assessments done; startup toolkit interface not built (criterion 6 open)

**Current state:** P0 is substantively complete. One exit criterion open (simplest viable interface for startup toolkit). P1 (business plan review) can begin with the evidence gathered. The open criterion does not block P1.

---

## 5. Priority Sequence Reminder

| Priority | Name | Gate | Status |
|---|---|---|---|
| P0 | Foundations + Hold Point | 7 exit criteria | Substantively complete; 1 criterion open |
| P1 | Business Plan Review | P0 complete + evidence-based | Can begin |
| P2 | Ethical Safeguards (R17, R19, R20) | "not optional" — before broad deployment | Not started |
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
| 8 Apr | Batch 1A-C implementations | reflect→profile feedback loop wired; guardrail extended with risk_class; sage-stenographer gains debrief mode |
| 8 Apr | Batch 2 implementations (Items 3–14) | Per-stage scoring, urgency scrutiny, ring wrapper Critical escalation, sage-retro debrief structure |
| 10 Apr | Unified agent orchestration architecture | sage-orchestrator module built; private/public mentor split; Support Brain removed from endpoints |
| 10 Apr | 5 growth accumulation gaps fixed for private mentor | Full profile, observation persistence, journal refs, snapshots, baseline auto-save |

---

## 7. Open Questions (Requiring Founder Decision)

1. **Analytics platform:** Plausible Analytics vs Fathom — choice pending (see P5 of this session's agenda)
2. **Support agent privacy:** Can practitioner profile summary (proximity estimate + dominant passions, not journal content) be surfaced to Support agent at query entry without violating R17? — assessment in progress (see §8 below)
3. **Startup toolkit interface:** When to design and build? P0 exit criterion 6 is open but not blocking P1.
4. **Legal review engagement:** Manifest says "begin no later than P3." P3 is not yet started. Has this been initiated?

---

## 8. Privacy Architecture Assessment — Support Agent Profile Access

**Question:** Can practitioner profile summary data (proximity estimate, dominant passions — not journal content) be surfaced to the Support agent at query entry?

**R17 inventory:**
- **R17a (bulk profiling prevention):** Designed to prevent third-party use of the framework to profile users without their knowledge or consent. The Support agent accessing the *user's own profile* to support *that user's enquiry* is not third-party profiling — it is the profile serving the user who created it. ✅ No R17a violation.
- **R17b (intimate data encryption):** The profile data is currently unencrypted at application level (P2 item 2c open). Surfacing it to the Support agent before encryption is implemented increases the exposure surface. **Recommended: defer Support agent profile access until R17b is wired.** 
- **R17c (genuine deletion):** Not relevant to read-access question.
- **R17d (local-first strategy):** The Support agent is a local markdown-based tool. Profile summary surfaced via a local read of `mentor_profiles` (via Supabase) to a local agent session. This aligns with R17d intent — data processed locally, not transmitted to external services.

**Architecture note:** The `mentor_profiles` table stores `profile_summary` (condensed text, ~300-500 tokens) and `proximity_level` / `dominant_passions` as separate columns. The Support agent could receive `profile_summary` + `proximity_level` + `dominant_passions` without accessing `passion_map`, `virtue_scores`, `oikeiosis_map`, or journal content. This is a materially lower exposure than the full profile.

**Conclusion:** Architecturally permissible within R17 intent (it's the user's own data, used to serve that user, processed locally). The limiting factor is R17b: application-level encryption should be implemented first. If the founder wants to enable this before R17b is wired, the risk should be documented as accepted and named in the decision log.

**Recommendation:** I'm making an assumption here — surfacing the condensed summary (not journal content) to the Support agent at query entry does not violate R17's intent, but I'd push back on doing it before R17b is wired. The encryption gap is real and named (ADR-007). Your call on the sequencing.

---

*Update this document at the close of each session. Core source of truth for agent context layers. Full decision reasoning lives in `operations/decision-log.md`.*
