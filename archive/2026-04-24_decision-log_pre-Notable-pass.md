# SageReasoning — Decision Log

Append-only record of consequential decisions. Becomes the R0 oikeiosis audit trail when operationalised in P5.

Format: Date, Decision, Reasoning, Rules Served, Impact, Status.

---

## 21 March 2026 — Brand Identity Selection

**Decision:** Adopted Stoic-themed brand identity with sage/owl/lion/lotus/scales logo concepts and gold/navy colour palette.

**Reasoning:** The visual identity needed to convey wisdom, balance, and principled reasoning without appearing religious or pseudoscientific. Classical Stoic symbols (owl for wisdom, lion for courage, scales for justice, lotus for temperance) communicate the philosophical foundation immediately. Gold/navy conveys authority and trust.

**Rules served:** R19 (honest positioning — visual identity should not overclaim)

**Impact:** Brand guidelines document created. Logo concepts generated. Colour palette and typography established.

**Status:** Adopted

---

## 22 March 2026 — Marketing Strategy Initial Draft

**Decision:** Produced initial marketing strategy targeting two audiences: human practitioners and agent developers.

**Reasoning:** SageReasoning serves both audiences with different value propositions. Human practitioners need accessible Stoic tools. Agent developers need evaluation infrastructure. Marketing needed to address both without conflating them.

**Rules served:** R0 (community flourishing), R19 (honest positioning)

**Impact:** Strategy document created (now archived — superseded by later market research).

**Status:** Superseded by Deep Market Research v2

---

## 23 March 2026 — Baseline Assessment Specification

**Decision:** Designed a 4-5 question fixed decision tree for baseline Stoic assessment, using cardinal virtue weighting (Wisdom 30%, Justice 25%, Courage 25%, Temperance 20%).

**Reasoning:** Users need a quick, structured entry point to understand their current Stoic proximity. The weighting reflects the classical hierarchy where wisdom (the architectonic virtue) carries the most weight. Fixed decision tree ensures reproducibility.

**Rules served:** R19 (honest positioning — limited assessment scope), R20 (vulnerable user consideration — keep it brief and non-invasive)

**Impact:** Specification produced. Filed to /product/. Not yet built.

**Status:** Adopted (spec) — implementation scoped but not started

---

## 25 March 2026 — Sage Ops Operational Architecture

**Decision:** Designed Sage Ops as a multi-agent operational intelligence pipeline with ring pattern (BEFORE → inner agent → AFTER) and authority level progression (supervised → guided → spot_checked → autonomous → full_authority).

**Reasoning:** The founder needs operational intelligence but cannot grant AI autonomy without trust mechanisms. The ring pattern ensures every agent action passes through safety layers. Authority progression mirrors the Stoic developmental sequence — trust is earned through demonstrated virtue.

**Rules served:** R15 (Sage Ops boundaries), R16 (intelligence pipeline data governance)

**Impact:** Sage Ops architecture documented. Persona system designed. Initial assessments produced (v1, v2). Launched at supervised level (recommend-only).

**Status:** Adopted — operating at supervised level

---

## 5 April 2026 — Manifest Expansion R0–R20

**Decision:** Expanded governance manifest from R1–R14 to R0–R20, adding the Oikeiosis Principle (R0), Sage Ops boundaries (R15), intelligence pipeline governance (R16), intimate data protections (R17), honest certification (R18), positioning honesty (R19), and vulnerable user safeguards (R20).

**Reasoning:** The ethical analysis revealed that the original manifest did not address several critical areas: how to handle intimate psychological data, how to prevent the trust layer from being used as a surveillance tool, how to protect vulnerable users, and how to ensure honest positioning. These are described as "not optional" in the ethical analysis.

**Rules served:** R0 (all decisions evaluated against oikeiosis), R17–R20 (newly created)

**Impact:** Manifest now governs all aspects of the build. Priority sequence revised to place ethical safeguards (P2) ahead of the Agent Trust Layer (P3). Draft amendments adopted into project instructions.

**Status:** Adopted

---

## 5 April 2026 — Revised Build Priority Sequence (P0–P7)

**Decision:** Replaced the original 5-priority sequence with an 8-priority sequence (P0–P7), inserting P0 (Foundations/R&D Phase) and P2 (Ethical Safeguards) into the sequence. Added hold point (0h) as a hard gate before P1.

**Reasoning:** The original sequence assumed the founder and AI could already work together effectively. P0 addresses this. The ethical analysis showed safeguards must precede broad deployment — hence P2 before P3. The hold point forces evidence-based assessment before committing to the business plan.

**Rules served:** R0 (deliberate choice), R17–R20 (ethical obligations sequenced before launch)

**Impact:** All work now governed by P0–P7 sequence. P0 items 0a–0h defined. Hold point criteria established. Business plan review (P1) cannot begin until hold point is complete.

**Status:** Adopted — currently executing P0

---

## 6 April 2026 — Agent-Native Taxonomy (9 Categories, 23 Subtypes)

**Decision:** Adopted a 9-category taxonomy for classifying all SageReasoning components: Products (human-facing), Tools (agent functions), Agents (decision makers), Engines (runtime systems), Reasoning (internal strategy), Data, Infrastructure, Governance, Documents. Each category has typed subtypes.

**Reasoning:** The original classification used "tools" for human-facing features, which would confuse the agent developer audience. Agent developers have specific expectations: "tools" means functions with inputs/outputs, "agents" means decision makers, "engines" means runtime systems. Adopting their native nomenclature ensures marketing resonates with the target audience.

**Rules served:** R19 (honest positioning — using industry-standard terminology), R0 (serving the agent developer community)

**Impact:** Ecosystem map rebuilt with new taxonomy (132 components). All future documentation and marketing will use this nomenclature.

**Status:** Adopted

---

## 6 April 2026 — P0 File Organisation with Inbox/Outbox/Backup Protocol

**Decision:** Reorganised all project files into 15+ purpose-specific folders with inbox/outbox workflow and backup subfolders in strategic directories. Created INDEX.md as the project navigator.

**Reasoning:** 80+ files at root with no organisation made it impossible to reliably find current versions. The inbox/outbox pattern establishes a clear workflow: founder drops files in inbox for AI review; AI puts deliverables in outbox for founder approval. Backup subfolders prevent silent version loss when strategic files are updated.

**Rules served:** P0 item 0e (file organisation and navigation)

**Impact:** 95 files reorganised. INDEX.md created. All ecosystem map paths updated. Old duplicate directories (sagereasoningtemplates, version-history) cleaned up after confirming contents copied.

**Status:** Adopted — verified working

---

## 6 April 2026 — Session Continuity Protocol (Manual)

**Decision:** Adopted structured session handoff notes with sections for Decisions Made, Status Changes, Next Session Should, Blocked On, and Open Questions. Manual process first; automate after 3-5 sessions prove the pattern.

**Reasoning:** Every new session starts cold. Structured handoff notes ensure the next session can begin with context rather than re-reading everything. Manual-first approach follows the P0 principle: prove the pattern before automating.

**Rules served:** P0 item 0b (session continuity), P0 item 0g (workflow skills earn their place)

**Impact:** First handoff note produced. Stored in /operations/session-handoffs/. Will be tested over coming sessions before building sage-stenographer skill.

**Status:** Adopted — wired (first instance produced, pattern not yet proven over multiple sessions)

---

## 6 April 2026 — Outdated Drafts Archived, Inbox Processed

**Decision:** Archived three superseded draft documents (Manifest Amendments, Project Instructions, Revised Build Priority Sequence) from /drafts/ to /archive/. Filed inbox items: Marketing Strategy to /marketing/, Baseline Assessment Spec to /product/.

**Reasoning:** All three drafts had been adopted into the current project instructions and manifest. Keeping them in /drafts/ implied they were still pending review. Inbox items from March were pre-P0 deliverables that needed proper filing.

**Rules served:** P0 item 0e (file organisation), 0a (clear status — these are no longer "drafts")

**Impact:** /drafts/ is now empty and ready for actual pending work. /inbox/ is empty. Archive preserves the historical record.

**Status:** Adopted

---

## 6 April 2026 — Flow Path Efficiency Audit: Brain-Derived Tools Should Wrap sage-reason

**Decision:** Audit identified that 7 brain-derived tools independently re-implement sage-reason's 4-stage logic instead of calling it. Recommended refactoring sage-score, sage-filter, and sage-guard to wrap sage-reason (Phase 2), preceded by infrastructure standardisation (Phase 1: shared Claude client, response envelope on all routes, receipts on all reasoning routes). Tools with architectural requirements (sage-iterate, sage-audit, sage-profile, sage-diagnose, sage-scenario, sage-reflect) remain independent.

**Reasoning:** The flow tracer revealed that brain-derived tools duplicate the exact same reasoning chain that sage-reason centralises. The wrapped skills already follow the correct pattern. Consolidation means improvements to 4-stage reasoning propagate to all 28 tools from one file instead of 8. Also identified that only 36% of routes use the response envelope, only 14% generate reasoning receipts, and 24 routes create separate Claude API clients.

**Rules served:** R4 (IP protection — centralised reasoning reduces exposure), R5 (cost — shared client enables connection pooling), R12 (2+ mechanisms — easier to enforce from one place), R14 (audit trail — receipts on all routes)

**Impact:** Audit document placed in /outbox/ for founder review. Refactoring sequence defined (3 phases). No code changes yet — this is an architectural decision pending approval.

**Status:** Adopted — Phase 1 (shared engine) and Phase 2 (tool refactoring) complete

---

## 6 April 2026 — sage-reason-engine Shared Module Created + 5 Tools Refactored

**Decision:** Created `/website/src/lib/sage-reason-engine.ts` (395 LOC) as the single source of truth for all Stoic reasoning. Refactored 5 brain-derived tools (sage-score, sage-guard, sage-decide, sage-filter, sage-converse) to call `runSageReason()` instead of independently implementing the 4-stage sequence. Founder overruled AI pushback to defer refactoring to post-hold-point: "this is too big of an oversight to not address immediately."

**Reasoning:** The flow tracer revealed that 7 brain-derived tools duplicated sage-reason's exact logic independently. The wrapped skills (15 tools) already followed the correct pattern — calling sage-reason with domain_context. Refactoring the core tools to match means improvements to 4-stage reasoning propagate from 1 file instead of 8. The shared engine also provides: singleton Anthropic client (replacing 24 separate instances), automatic receipt generation, consistent caching, and standardised response validation.

**Rules served:** R4 (IP protection — centralised reasoning), R5 (cost — shared client, connection pooling), R12 (2+ mechanisms from one place), R14 (receipts now generated on all refactored routes)

**Impact:** sage-score: 238→104 LOC. sage-guard: 231→219 LOC. sage-decide: 260→192 LOC. sage-filter: 186→173 LOC (now generates receipts — was missing). sage-converse: 216→149 LOC. Flow tracer and ecosystem map updated. 2 tools remain independent by architectural necessity (sage-iterate: stateful chains; sage-audit: document persistence + badges). 4 tools remain independent by design incompatibility (sage-profile, sage-diagnose, sage-scenario, sage-reflect).

**Status:** Adopted

---

## 8 April 2026 — Post-Incident Protocol Additions (Auth Middleware Debrief)

**Decision:** Following a structured debrief of the 7–8 April auth middleware incident, adopted changes across four governance layers: (1) new manifest clause R17f requiring Critical Change Protocol for intimate data protection implementations, (2) updated Task Protocol from 6 to 7 steps adding risk classification, (3) new verification framework section for authentication and access control changes, (4) revised mentor profile appendix grounded in 42-session review with founder corrections. Additionally, project instructions updated with Critical Change Protocol (0c-ii), Change Risk Classification (0d-ii), Session Debrief Protocol (0b-ii), and expanded communication signals. About Me user preferences updated with Decision Authority, Risk and Side Effects, and Working Pace sections.

**Reasoning:** The auth middleware session on 7 April exposed a recurring pattern: the AI skipping the verify-decide-execute loop under urgency, particularly for changes affecting authentication. A review of 42 sessions confirmed this was not isolated — milder instances included git lock files, strategic documents edited without backup, and over-building before scope confirmation. The protocols address the gap between existing governance (which was sound) and compliance with that governance under pressure. The founder's corrections ensured the mentor profile appendix was accurate rather than dramatised.

**Rules served:** R0 (oikeiosis — examining our reasoning and improving), R17 (intimate data protection — implementation safety), P0 items 0b (session continuity), 0c (verification framework), 0d (communication signals)

**Impact:** Manifest now includes R17f and 7-step Task Protocol. Verification framework includes auth-specific checks. Project instructions include risk classification system and Critical Change Protocol. About Me preferences encode decision authority and working pace patterns. Debrief stored at `/operations/session-debriefs/2026-04-08_auth-middleware-debrief.md`. Full proposals at `/operations/session-debriefs/2026-04-08_implementation-proposals-v2.md`.

**Status:** Adopted

---

## 8 April 2026 — First Implementation Batch: Debrief Automation, Risk-Aware Guardrails, Self-Improving Feedback Loop

**Decision:** Implemented three changes from the reconciled implementation plan (merging the product line applications and research gap analysis documents):

1. **Batch 1B — sage-stenographer debrief mode** (Standard risk). Added a third trigger mode to the sage-stenographer SKILL.md: "debrief." When invoked, it reads session records, cross-references the decision log and handoff notes, and produces a structured debrief following the 0b-ii protocol format. This automates the manual debrief process used on 8 April.

2. **Batch 1C — sage-guard risk_class** (Elevated risk). Added an optional `risk_class` parameter (standard/elevated/critical) to the guardrail API. Risk class auto-selects evaluation depth: standard→quick (3 mechanisms), elevated→standard (5 mechanisms), critical→deep (6 mechanisms). Critical responses include a `rollback_path` field. This formalises the 0d-ii Change Risk Classification protocol into the product.

3. **Batch 1A — sage-reflect → Mentor profile wiring** (Elevated risk). Wired the /api/reflect endpoint to feed reflection findings back into the Mentor profile. After each reflection, detected passions are upserted into the passion map, the reflection is recorded as an interaction in the rolling window, and the rolling window recomputes the core profile summary. Uses the dynamic import bridge pattern established by sage-mentor-bridge.ts. This creates the self-improving feedback loop identified as Gap 3 in the research analysis.

**Reasoning:** Prioritised by two criteria: (1) Circle 1 first — all three changes serve our own development during P0; (2) wiring before extension before new build — Batch 1A connects existing components, Batches 1B and 1C extend existing components. The full reconciled plan identified 20 items across 4 priority tiers; this batch covers the top 3 items. Remaining items are documented in `/operations/implementation-plan_2026-04-08.md`.

**Rules served:** R0 (oikeiosis — Circle 1 improvements first), R4 (no new IP exposure), R5 (cost increase only for Critical-classified actions in sage-guard, which is appropriate), R12 (all changes route through sage-reason-engine.ts), R14 (reflect→profile updates captured in mentor ledger), R17f (sage-guard risk_class implements the principle that action category determines scrutiny)

**Impact:** sage-stenographer gains debrief capability (Scoped → Scaffolded for debrief mode). sage-guard now supports risk-aware evaluation depth (Wired, extended). sage-reflect now feeds back into the Mentor profile, creating the self-improving loop (Wired, newly connected). The sage-mentor-bridge.ts gains profile-store access functions.

**Status:** Adopted

---

## 8 April 2026 — Second Implementation Batch: Remaining Tier 2 + Tier 3 Items from Reconciled Plan

**Decision:** Implemented all remaining actionable items from the reconciled implementation plan (items 3, 5, 6, 8, 9, 10, 11, 12, 13, 14). Only Tier 4 new builds (sage-challenge, sage-curriculum, sage-reason-trace, sage-context-rag) and Trust Layer extensions (items 15-16) deferred to P3+.

Changes implemented:

1. **sage-reason-engine.ts — Per-stage quality scoring (Item 5)** + **urgency_context / hasty_assent_risk (Item 6).** The engine now requests per-stage quality ratings (strong/adequate/weak) for each mechanism applied, returned in `meta.stage_scores`. A new `urgency_context` parameter triggers extra scrutiny for hasty assent patterns, with results in `meta.hasty_assent_risk`. ReasonInput and ReasonResult types extended.

2. **sage-guard guardrail/route.ts — deliberation_quality (Item 8) + considered_alternatives (Item 9).** The guardrail response now includes a `deliberation_quality` field (thorough/adequate/hasty/impulsive) derived from stage scores and hasty assent risk. For Critical actions under urgency, a `considered_alternatives` array is accepted; if none provided, the guardrail forces `pause_for_review` and adds an `alternatives_warning`. Accepts `urgency_context` and passes it through to the engine.

3. **sage-decide score-decision/route.ts — process parameter (Item 10).** Accepts an optional `process` description of how options were identified and narrowed. When provided, the domain context instructs the engine to assess process quality (thorough/adequate/hasty). Response includes `process_quality` and `process_described` fields.

4. **Mentor persona.ts — confidence signalling (Item 11).** Added a new CONFIDENCE SIGNALLING section to the core persona, requiring the Mentor to distinguish between confident observations (grounded in data), assumptions (limited data), and limitations (framework doesn't apply). Non-negotiable in all assessments.

5. **ring-wrapper.ts — category escalation (Item 12) + side-effect detection (Item 13).** Added `isCriticalActionCategory()` that checks task descriptions for Critical keywords (auth, delete, access control, deploy, etc.). When detected, the BEFORE phase always selects Sonnet (deep) regardless of agent authority — the ring-wrapper equivalent of R17f. The AFTER phase now runs `detectSideEffects()` that checks output for lock files, temp files, rate limits, broken sessions, etc. Side effects trigger LLM evaluation and append remediation instructions.

6. **sage-retro route.ts — debrief structure (Item 14).** Expanded the domain context to request structured debrief analysis across 5 dimensions: what happened, communication quality, assumption errors, verification gaps, and passion diagnosis. Each dimension gets a quality rating. Added `communication_context` and `urgency_context` input fields.

7. **patterns/route.ts — feedback pipeline extension (Item 3).** Added two new pattern types: `stage_score_trend` (detects consistently weak or strong reasoning stages from per-stage scores) and `hasty_assent_frequency` (detects how often urgency leads to hasty assent). This closes the feedback loop: sage skills generate receipts with stage_scores → patterns endpoint detects trends → composability recommends next steps.

**Reasoning:** Founder approved implementing all remaining items. These complete the Tier 2 (P0-serving extensions) and Tier 3 (Circle 3 extensions to ring wrapper and sage-retro) items from the reconciled plan. Trust Layer items (15-16) correctly deferred because the Trust Layer is only Scaffolded. New builds (17-20) deferred to P3+.

**Rules served:** R0 (all items serve Circle 1 development or extend Circle 3 reach), R4 (no new IP exposure — all changes add fields to existing responses), R5 (cost increases are proportional — deeper evaluation only for Critical actions or urgency), R6b (per-stage scoring evaluates mechanism quality, not individual virtues — R6b compliance maintained), R12 (all changes route through sage-reason-engine), R17f (ring wrapper category escalation formalises R17f into the agent evaluation layer)

**Impact:** 8 files modified. sage-reason-engine.ts gains per-stage scoring and urgency awareness. sage-guard gains deliberation quality assessment and alternatives checking. sage-decide gains process evaluation. Mentor persona gains confidence signalling. Ring wrapper gains Critical category escalation and side-effect detection. sage-retro gains structured debrief analysis. Patterns endpoint gains stage score trends and hasty assent frequency detection.

**Status:** Adopted

---

## 8 April 2026 — External Intelligence Allowances and Reminder Protocol

**Decision:** Created `operations/allowance-for-future.md` containing stage-triggered checklists drawn from two external research articles (Glasswing/Mythos Preview analysis and AI arbitrage taxonomy). Integrated an automatic reminder mechanism into the sage-stenographer session-open protocol: when a session indicates work is starting on a new priority stage, the AI checks the allowances file and presents relevant ACTION and MONITOR items before work begins.

**Reasoning:** External research raised specific concerns that map to future priority stages — cost modelling scenarios for P1, security urgency for P2, multi-platform compatibility for P3, marketing language for P6, architecture validation for P7. Without a structured mechanism, these insights would be forgotten by the time the relevant stages begin. The sage-stenographer integration was chosen over a scheduled task because priority stages are condition-bounded, not calendar-dated — a cron job wouldn't know when P1 starts, but the session-open protocol naturally fires at the right time. The next-session-prompt template also includes a stage-change reminder line.

**Rules served:** R0 (examined reasoning about external context, not reactive adoption), 0b (extends session continuity protocol with forward-looking intelligence), 0f (decision captured here)

**Impact:** New file: `operations/allowance-for-future.md`. Modified file: `.claude/skills/sage-stenographer/SKILL.md` (added Step 4 to session-open protocol, added allowances file to file locations table, added reminder line to next-session-prompt template). Source articles recommended for archival to `/reference/`.

**Status:** Adopted

---

## 10 April 2026 — Session 9 Decisions: Unified Agent Orchestration Architecture

**Decision:** Five architectural decisions made in Session 9, implemented in Session 10:

1. **Unified agent pipeline.** All 4 internal Sage agents follow an identical 7-step workflow: trigger → context load → internal reasoning → Stoic evaluation → output routing (5A saged passthrough / 5B non-saged Stoic review) → decision authority gate → handoff. The only thing that varies per agent is which brain is loaded. One orchestration pattern, "which brain" as a parameter.

2. **ATL authority levels apply to external agents only.** Internal agents do not need authority progression because the Stoic Brain is applied to every action through the pipeline. The decision authority gate exists because the founder makes irreplaceable decisions (spending, publishing, external comms, irreversible changes, security changes), not because the agents are untrusted.

3. **Private/public mentor separation.** Route-level split: private mentor endpoints at `/api/mentor/private/*` (founder-only, gated by `FOUNDER_USER_ID` env var) receive full context (L1 + L2 + L2b full profile + L5 + mentor observations + journal references + profile snapshots). Public mentor endpoints at original paths receive only L1 + L2b condensed.

4. **Support Brain removal from mentor endpoints.** Support Brain removed from all 4 mentor endpoints (reflect, mentor-baseline, mentor-baseline-response, mentor-journal-week). All four agent brains are now in identical positions: session-level context for their respective internal agent only, never injected into any endpoint.

5. **Five growth accumulation gaps fixed for private mentor.** (a) Full practitioner profile (~7,500 chars) instead of condensed (~300-500 tokens). (b) Mentor observation persistence — LLM outputs `mentor_observation` field, stored in mentor_interactions. (c) Journal reference recall — topic-tagged cross-references via mentor_journal_refs table. (d) Temporal profile snapshots — new `mentor_profile_snapshots` table stores profile state at key moments. (e) Baseline auto-save — baseline-response endpoint records the interaction and creates a snapshot automatically.

**Reasoning:** The context layer cleaning (Sessions 8-9) revealed that agent brains had no business being in product endpoints. The separation principle — brains define what agents ARE, product endpoints serve any consumer — required a clean orchestration pattern. The private/public mentor split addresses the growth problem: the founder's mentor needs continuity, memory, and full context, while public users get clean Stoic reasoning without project internals.

**Rules served:** R0 (each circle of concern gets appropriate context), R4 (IP protection — project context not exposed to external users), R15 (Sage Ops architecture), R17 (intimate data — private routes founder-only)

**Impact:** 4 public mentor endpoints cleaned. 4 private mentor endpoints created. `mentor-context-private.ts` module created with observation, journal ref, and snapshot functions. `sage-orchestrator/` standalone module created (types.ts, pipeline.ts, presets.ts, index.ts). New Supabase table needed: `mentor_profile_snapshots`. New env var needed: `FOUNDER_USER_ID`. Context layer summary and org chart updated.

**Status:** Adopted

---

## 10 April 2026 — Sage Orchestrator Built as Standalone Module

**Decision:** Built the sage-orchestrator as a standalone module at project root (`/sage-orchestrator/`) rather than inside the website's lib directory. The module exports `runAgentPipeline()`, preset factories for all 4 agents, and `createBrainLoader()` adapter. Reasoning function is injected (not imported) to decouple from the specific LLM caller.

**Reasoning:** Standalone placement means: (a) customer agents in the startup package can import it without pulling in the website; (b) internal agents import it the same way customers do; (c) the orchestration IS the product — keeping it separate from the website reinforces this. The `ReasonFunction` injection pattern means internal agents use `runSageReason` while customers can use any compatible function.

**Rules served:** R0 (the orchestration pattern extends to all rational agents), R4 (clean API boundary for IP), R5 (cost tracking built into pipeline)

**Impact:** 4 new files in `/sage-orchestrator/`. Module ready for internal agent wiring (P7) and customer packaging. All presets use identical governance structure with domain-specific decision gate configurations.

**Status:** Adopted

---

## 11 April 2026 — Analytics Platform: Plausible, Install After P2

**Decision:** Selected Plausible Analytics as the website analytics platform. Installation deferred until P2 ethical safeguards are in place.

**Reasoning:** Plausible was chosen over Fathom for three reasons: lower entry cost at pre-launch scale ($9/month vs $14), self-hosting option preserving future data sovereignty, and open-source codebase (AGPL-3.0) consistent with SageReasoning's transparency values. EU-hosting available if data residency becomes a requirement. Both platforms are fully R17-compliant (cookie-free, no personal data). Installation deferred to post-P2 to batch infrastructure decisions with the ethical safeguards work — analytics does not block P2 but the founder chose to sequence it after.

**Rules served:** R17 (privacy-respecting infrastructure), R5 (cost-appropriate tooling at current scale)

**Impact:** No installation yet. When ready: one script tag in `website/src/app/layout.tsx`, domain configured in Plausible dashboard. UTM parameter conventions documented in `operations/analytics-decision-memo.md`. `PLAUSIBLE_API_KEY` env var to be added to Vercel at install time.

**Status:** Adopted — installation pending P2 completion

---

## 11 April 2026 — Support Agent Profile Access Deferred Until R17b Wired

**Decision:** The Support agent will not receive practitioner profile summary data (proximity estimate, dominant passions) at query entry until application-level encryption for `mentor_profiles` is implemented (P2 item 2c).

**Reasoning:** The privacy architecture assessment confirmed that surfacing condensed profile data (not journal content) to the Support agent is architecturally permissible within R17's intent — it is the user's own data, used to serve that user, processed locally. The limiting factor is ADR-007: `encryption.ts` exists but is not yet wired to the `mentor_profiles` storage pipeline. Adding profile access to the Support agent before the encryption gap is closed would increase the exposure surface of unencrypted intimate data. The correct sequencing is: implement R17b (P2 item 2c) → then wire profile summary to Support agent context.

**Rules served:** R17 (intimate data protection), R17b (application-level encryption), R20a (vulnerable user detection — profile data improves Support's triage accuracy, but not at the cost of R17b)

**Impact:** Support agent implementation plan (Part A, Step 1) should note that profile context injection is not available at first build. The agent will triage without profile context initially. When R17b is wired, the Support agent session-open can be extended to load `proximity_level` + `dominant_passions` + `profile_summary` from `mentor_profiles` via service role. No code changes needed now.

**Status:** Adopted — profile access deferred to post-R17b implementation

---

## 15 April 2026 — R20a Detection Model: Asynchronous Queue with Persistent Footer

**Decision:** Vulnerability detection for mentor sessions will use an asynchronous moderation queue (not real-time blocking). Mentor responses are served normally; a classifier runs off-path and writes flags to a queue reviewed during declared support hours of **09:00–17:00 AEST, Monday–Friday** (excl. Australian public holidays). A persistent, non-dismissible footer on the mentor and journal UIs displays 000, Lifeline 13 11 14, and lifeline.org.au at all times. Clinical and legal review of the R20a threshold language is scoped into Priority 3; R20a may be adopted on founder reasoning ahead of that review, with any amendments following the Critical Change Protocol.

**Reasoning:** Synchronous blocking detection requires near-real-time human backup that a solo founder cannot staff reliably. Asynchronous review is the honest match for the operating capacity. The persistent footer narrows the acute-crisis gap at near-zero operational cost: a user in immediate danger has a visible self-route independent of the queue. Business-hours weekdays is the widest window the founder can commit to without degrading SLA reliability. The clinical and legal reviews are treated as P3 gating work rather than blockers on adoption, because the threshold language is principled on Stoic framing and amendments can follow.

**Rules served:** R20a (vulnerable user protections), R19c (honest limitations disclosure), R17a (intimate data tiering — for the flag record itself at Tier C), R0 (operating within honestly declared capacity).

**Impact:** R20a draft (`/drafts/R20a-vulnerable-user-protections-DRAFT.md`) updated to reflect the four decisions. Mentor stays stateless about flags (locked as a design constraint). No "paused session" state needed. Persistent footer is a new UI build item. Public holiday calendar source required as operational placeholder. Clinical and legal review added to P3 scope.

**Status:** Adopted as design direction. R20a remains in `/drafts/` pending final founder read-through and move to `/compliance/`.

---

## 15 April 2026 — ADR-R20a-01 Classifier Pipeline: Recommended Defaults Accepted

**Decision:** Seven implementation choices adopted for the R20a detection classifier: (D1-c) two-stage classifier combining rule-based detectors and a small-LLM evaluator for borderline inputs; (D2-a) Anthropic small model (Haiku) as the LLM; (D3-a) YAML file in the repository for rule storage; (D4-a) Supabase table `vulnerability_flag` with R17a Tier C RLS for queue storage; (D5-a) Supabase Studio with saved query as the reviewer interface; (D6-c) fail-open-with-alerting on classifier outage, plus classifier-down marker rows for post-hoc rescoring; (D7-b) variable cost budget via two-stage economics, tightened after the P0 hold point gives real data.

**Reasoning:** The combination matches a solo-founder operating reality: lowest build cost consistent with R20a's detection quality threshold, single vendor to simplify privacy review, versioned rule changes via pull request, single source of truth for flag records, zero-build reviewer UI, and a failure mode that preserves user-facing reliability without hiding safety outages. All seven choices are reversible within one to three days of work if evidence from the hold point points elsewhere.

**Rules served:** R20a (vulnerable user protections — implementation path), R17a (intimate data — classifier operates within the trust boundary on Tier B content), R5 (cost health — classifier cost bounded and separately tracked), R18 (honest certification — asynchronous nature to be disclosed on the limitations page), R0 (reversibility preserves the capacity to learn from evidence).

**Impact:** Build artefacts required: `vulnerability_flag` Supabase table with RLS matching R17a Tier C; `/website/src/lib/r20a-rules.yml` initial rule set derived from R20a §2 indicators; `/website/src/lib/r20a-classifier.ts` two-stage evaluator; worker process running classifier off the mentor response path; persistent footer component on mentor and journal UIs; Studio saved query for the reviewer queue; alert hook for classifier-down events. Monthly Ops cost review tracks classifier as a separate line. If classifier cost exceeds 20% of total mentor-turn cost, the ADR is reopened.

**Status:** Accepted — ADR adopted and moved to `/compliance/` same day. Implementation plan at `/compliance/R20a-implementation-plan.md`.

---

## 15 April 2026 — CCP-R17a-01: Support Access Audit Schema Approved

**Decision:** Critical Change Protocol session approved. Adds two tables (`support_decrypt_request` workflow gate, `support_access_log` append-only audit trail) and one enum type (`support_access_type` with values `flag_review`, `field_decrypt`, `support_request`) to the production Supabase database. `support_access_log` is enforced as append-only via both RLS grant revocation (`REVOKE UPDATE, DELETE` from `authenticated`, `anon`, `PUBLIC`) and a defence-in-depth trigger that raises an exception on any UPDATE or DELETE regardless of role. Foreign keys on `user_id` use `ON DELETE RESTRICT` — once audit history exists for a user, plain deletion is blocked. R17c (genuine deletion, P2 item 2d) will need an anonymise-then-delete path to satisfy its own commitment without destroying audit trail.

**Reasoning:** R17a §4 and §5 promise audit infrastructure that does not exist in any migration. The schema audit (15 April 2026) confirmed neither `support_access_log` nor `support_decrypt_request` was implemented. Without these tables, R20a Phase B (the `vulnerability_flag` RLS that depends on R17a Tier C support-with-audit policy) cannot be built, and R17a itself does not meet its own stated controls. Building the destination first, then wiring Tier C fields to it in a second CCP session, keeps each Critical change bounded and verifiable. `ON DELETE RESTRICT` is the honest position: an audit trail that can be erased alongside its subject is not an audit trail. The coupling with R17c is accepted and documented.

**Rules served:** R17a (intimate data tiering — §4 audit trail and §5 access gate), R20a (vulnerable user protections — unblocks Phase B), R17c (genuine deletion — coupling surfaced so R17c design can accommodate), R0 (honest capacity — builds the control R17a has always claimed).

**Impact:** Migration file created at `/supabase/migrations/20260415_r17a_audit_schema.sql`. Six verification queries (Q1–Q6) specified in the CCP output are the pass/fail gate for deployment. A second CCP session (still to come) is required to rewrite Tier C RLS policies on existing R17a fields to use these tables — today's change builds the destination only; wiring is the next Critical step. R20a implementation plan §12 prerequisite "confirm `support_access_log` table from R17a is in place" is satisfied by this migration's successful deployment. R17c (P2 item 2d) must include anonymise-then-delete path; recorded here so the R17c build does not encounter this as a surprise.

**Status:** Schema approved by founder. Migration file produced. Deployment pending founder execution of the migration in Supabase Studio; verification Q1–Q6 pending post-deployment.

---

## 15 April 2026 — CCP-R17a-01 Verified and Closed

**Decision:** Migration `20260415_r17a_audit_schema.sql` deployed to production Supabase via Studio SQL Editor. All six verification checks pass: Q1 (two tables present), Q2 (enum has three correct values in declaration order), Q3 (support_access_log has 10 columns matching design), Q4 (support_decrypt_request has 12 columns matching design), Q5 (six RLS policies — two on support_access_log, four on support_decrypt_request), Q6a (both append-only triggers live — trg_sal_no_update and trg_sal_no_delete, BEFORE triggers), Q6b (zero UPDATE/DELETE grants to authenticated, anon, or PUBLIC on support_access_log). Append-only is enforced at two layers — revocation of grants and BEFORE-trigger exception.

**Reasoning:** Closing the CCP required independent verification, not just absence of error on deploy. The original Q6 design was flawed — an UPDATE with `WHERE log_id = gen_random_uuid()` on an empty table matches zero rows and the per-row trigger never fires, so the test proved nothing. Replaced with Q6a (information_schema.triggers) and Q6b (information_schema.role_table_grants) which are static checks independent of table contents. Both passed. This is recorded as an improvement to the CCP verification pattern for future Critical sessions.

**Rules served:** R17a (audit destination now live), R20a (one Phase B blocker removed), §0c-ii (Critical Change Protocol followed end-to-end with documented verification).

**Impact:** R17a §4 audit trail and §5 workflow gate are now backed by live tables. The R17c coupling (audit blocks user deletion) is in effect and must be accommodated when R17c is built. R20a Phase B's prerequisite "confirm support_access_log exists" is now satisfied. Phase B still blocked on the second CCP session — rewriting Tier C RLS policies on existing R17a fields to actually reference these tables. The tables now exist; the wiring does not. CCP verification pattern improvement: future Critical sessions should use static schema/catalog queries for append-only and RLS enforcement checks, not data-dependent mutation tests on empty tables.

**Status:** Verified. CCP-R17a-01 closed.

---

## 16 April 2026 — Phase B Data Hygiene: Founder Recusal from Schema Design

**Decision:** Founder chose Option 1 (recuse from schema design visibility) for the Phase B CCP session. RLS policies and vulnerability_flag schema designed from first principles with zero individual profiles loaded. Founder reviews and approves finished SQL only.

**Reasoning:** Founder's practitioner profile (journal scope, passion map, virtue profile, causal tendencies, value hierarchy, oikeiosis map) was in scope during infrastructure design. Two risks: (1) design contamination — policies shaped by one user's data encode implicit assumptions, creating blind spots for other users' access needs; (2) R20b independence principle violation — founder simultaneously designing the system, being the sole user it protects, and having his profile shape the design. The CCP brief's Data hygiene flag (line 142) already anticipated this; this decision enforces it.

**Rules served:** R20b (independence principle), R17a (intimate data tiering), R20a (vulnerable user protections).

**Impact:** First-principles design document produced (`/compliance/Phase-B-first-principles-design.md`). Decision recorded in compliance_audit_log.json. Phase B proceeds with role-based design validated against 9+ synthetic user archetypes.

**Status:** Adopted

---

## 16 April 2026 — Phase B Schema Design Decisions (4a, 4b, 4c)

**Decision:** Three implementation decisions for the vulnerability_flag schema:
- 4a: Database view (`vulnerability_flag_owner_view`) for reviewer identity masking. Owner queries the view, which replaces `reviewer_id` with a role label and excludes `reviewer_notes`.
- 4b: Use existing `service_role` for classifier inserts. Insert-only constraint enforced at function code level. Code review required during Phase E.
- 4c: CASCADE delete for R17c genuine deletion. Flag rows are hard-deleted with the user account.

**Reasoning:** 4a — structural protection that cannot be bypassed by careless API changes. 4b — lower operational overhead; dedicated Postgres role deferred unless Phase E code review reveals risk. 4c — simplest and most GDPR-aligned; trade-off (lost aggregate audit data for deleted users) accepted and flagged for P3 legal review.

**Rules served:** R20a §5 (reviewer identity masking), R17a (access control), R17c (genuine deletion).

**Impact:** Design document updated with adopted decisions. SQL work proceeds. 4c noted for P3 legal review — if counsel recommends a different approach, change follows CCP.

**Status:** Adopted

---

## 16 April 2026 — Phase B CCP Session Verified and Closed

**Decision:** Migration `20260416_r20a_vulnerability_flag.sql` deployed to production Supabase via Studio SQL Editor. All seven verification queries pass: Q1 (12 columns correct), Q2 (3 RLS policies: vf_owner_select, vf_support_select, vf_support_update), Q3 (RLS enabled), Q4 (owner view has 11 columns, reviewer_notes excluded, reviewer_id masked to role label), Q5 (2 CHECK constraints: severity 1–3, resolution enum), Q6 (updated_at trigger active), Q7 (CASCADE FK on user_id confirmed).

**Reasoning:** Phase B is the foundation for R20a Phases C–H — the classifier, worker, reviewer queue, and alert hook all depend on this table. CCP followed end-to-end: brief produced, prerequisites resolved, data hygiene enforced (founder recused from design visibility), first-principles design reviewed, schema and RLS policy text explicitly approved as separate items, deployed, verified with seven static schema/catalog queries. Pattern improvement from CCP-R17a-01 applied: all verification queries are static catalog checks, not data-dependent mutation tests.

**Rules served:** R20a (Phase B complete), R17a (Tier C RLS aligned), R20b (independence principle — data hygiene enforced), §0c-ii (Critical Change Protocol followed).

**Impact:** R20a implementation plan updated: Phases A and B Verified. Phase C (rule file) is next — Standard risk, no CCP required. The vulnerability_flag table exists but is empty; nothing writes to it until Phase E wires the classifier pipeline. Rollback remains available: `DROP TABLE IF EXISTS vulnerability_flag CASCADE;`.

**Status:** Verified. CCP-R20a-Phase-B closed.

---

## 16 April 2026 — Skill Context Level Evaluation: sage-premortem and sage-negotiate Retain Condensed

**Decision:** Both `sage-premortem` and `sage-negotiate` remain at the factory default `condensed` project context level. No `projectContextLevel` config overrides added.

**Reasoning:** Evaluated whether these two skills needed `summary` (which adds identity + founder role) for richer situational awareness. Assessment: both skills get their Stoic grounding from Layer 1 (engine system prompt), their domain framing from the `domainContext` config string, and sufficient situational awareness from `condensed` (phase + 2 recent decisions). `summary` would add ~50 tokens per request for identity and founder role, which is informational but not decision-relevant for supplementary marketplace skills. If post-launch user feedback indicates skill outputs feel generic, this can be revisited per-skill via the existing `projectContextLevel` config override.

**Rules served:** R5 (cost awareness — avoiding unnecessary token spend), R12 (mechanism grounding comes from Layer 1, not Layer 3)

**Impact:** No code changes. Evaluation documented for hold point record.

**Status:** Adopted

---

## 16 April 2026 — Runtime Token Monitoring Deferred to P1

**Decision:** Runtime token monitoring (logging `response.usage` fields per skill per request) deferred to P1. Logged as a P1 task.

**Reasoning:** All depth levels have 27-62% headroom verified from source code analysis. `withUsageHeaders()` exposes rate limits only, not token counts. The implementation path is clear: log `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens` from the Anthropic response in `runSageReason()` using the existing `withUsageHeaders()` pattern, targeting Vercel log drain with no new infrastructure. This is useful for cost health alerts (P4) but not blocking for the hold point.

**Rules served:** R5 (cost monitoring — future capability), P0 scope governance (not needed for hold point)

**Impact:** No code changes. P1 task logged.

**Status:** Adopted — deferred to P1

---

## 16 April 2026 — score-document Engine Migration Deferred to P1

**Decision:** `/api/score-document` migration from direct `client.messages.create` to `runSageReason()` deferred to P1 as tech debt.

**Reasoning:** score-document is the only endpoint that bypasses the engine entirely — it has no Layer 1 (Stoic Brain), Layer 2 (practitioner context), or Layer 3 (project context). This is a significant gap but has no functional impact on the P0 hold point because score-document is an agent-facing utility endpoint, not a core evaluation tool. The current schema inconsistency between score and document models should be confirmed before P1 to ensure the current structure supports practitioner progress display at launch.

**Rules served:** P0 scope governance, R12 (mechanism grounding — score-document currently lacks it)

**Impact:** No code changes. Tech debt logged with note: 'Schema inconsistency between score and document models — no functional impact on P0 hold point, confirm before P1 that current structure supports practitioner progress display at launch.'

**Status:** Adopted — deferred to P1

---

## 16 April 2026 — Stoic-Brain IP Hashing Aligned with Analytics Route

**Decision:** Changed `/api/stoic-brain/route.ts` to hash the IP address before storing it in analytics metadata, using the same `hashIp()` function pattern as `/api/analytics/route.ts`.

**Reasoning:** The analytics bugfix session (earlier 16 April) moved tracking data into metadata and introduced IP hashing in the analytics route. The stoic-brain route was updated to use metadata but still stored the raw IP as `_ip`. This inconsistency meant one route hashed IPs and the other didn't. Aligning both routes ensures consistent privacy treatment across all analytics events.

**Rules served:** R17 (privacy — consistent IP hashing across all routes)

**Impact:** `_ip` field in stoic-brain metadata replaced with `_ip_hash` using SHA-256 + salt (same as analytics route). Existing raw IP rows in Supabase are historical — no backfill needed.

**Status:** Adopted

---

## 17 April 2026 — R20a Two-Stage Classifier: Inline Haiku Evaluation

**Decision:** Replaced regex-only distress detection (`detectDistress` in guardrails.ts) with a two-stage classifier (`detectDistressTwoStage` in r20a-classifier.ts). Stage 1: regex keyword/phrase matching (zero latency). Stage 2: Haiku LLM evaluation for borderline inputs only (~500ms). Haiku runs inline (synchronously before the main LLM call), not as a background job.

**Reasoning:** Regex-only detection produced false negatives on nuanced distress language and false positives on metaphorical language. The two-stage design keeps zero-latency performance for clear cases while adding LLM judgement only where it matters. Inline was chosen over background processing because the founder judged that a 500ms delay on borderline inputs is acceptable to avoid the complexity of asynchronous flag queuing and the risk of serving a full response before the classifier finishes. All 9 API routes updated. Eval suite confirmed: 5 must-block inputs blocked, 5 must-pass inputs passed, no false positives or negatives.

**Rules served:** R20a (vulnerable user detection), R5 (cost — Haiku only fires on borderline inputs, not every request)

**Impact:** New files: `r20a-classifier.ts`, `r20a-classifier-eval.ts`. 9 API routes modified. Old `detectDistress` function retained in guardrails.ts but no longer called by any route. Cost tracking via `classifier_cost_log` Supabase table and `r20a-cost-tracker.ts`.

**Status:** Adopted — Wired and verified

---

## 17 April 2026 — Unified Retry Wrapper Replacing Quick-Only Escalation

**Decision:** Replaced the quick-depth-only Haiku→Sonnet escalation pattern with a unified retry wrapper applying to all reasoning depths. Quick depth: 1 retry escalating Haiku to Sonnet. Standard/deep depth: 1 retry with same model. Second failure returns structured error JSON instead of throwing an unhandled exception.

**Reasoning:** The previous implementation only handled parse failures at quick depth (by escalating to Sonnet). Standard and deep depth parse failures threw unhandled exceptions that surfaced as 500 errors to the client. The unified wrapper ensures consistent failure handling across all depths. Returning structured error JSON (with `reasoning_failed: true`) allows client-side UI to display a meaningful message rather than crashing.

**Rules served:** R12 (consistent mechanism application across depths), R19c (honest error reporting to users)

**Impact:** `sage-reason-engine.ts` modified. No more unhandled 500s from parse failures at any depth level.

**Status:** Adopted — Wired

---

## 17 April 2026 — depth-constants.ts: Single Source of Truth for ReasonDepth

**Decision:** Created `depth-constants.ts` as the single authoritative location for the `ReasonDepth` type and `DEPTH_MECHANISMS` mapping. Both `sage-reason-engine.ts` and `stoic-brain-loader.ts` now re-export from this file instead of defining their own copies.

**Reasoning:** Session 7b identified a circular dependency between the engine and loader caused by both files defining and importing `ReasonDepth` from each other. This change breaks the cycle cleanly: a dedicated constants file that both modules import from, with no circular references. Type and constant synchronisation guaranteed at compile time.

**Rules served:** R4 (IP protection — single definition reduces drift risk), R12 (mechanism definitions consistent across all consumers)

**Impact:** New file: `depth-constants.ts`. Two files modified to re-export instead of define. Circular dependency eliminated.

**Status:** Adopted — Wired

---

## 17 April 2026 — Client-Side Distress Detection Handling on All 5 Pages

**Decision:** Added distress_detected response handling to all 5 client-facing pages (score, score-document, score-social, scenarios, private-mentor). When the API returns `{ distress_detected: true }`, pages display a redirect UI with crisis resources instead of attempting to render evaluation results.

**Reasoning:** The API routes correctly returned distress detection responses with HTTP 200, but no client page checked for this field. Pages attempted to destructure evaluation-specific properties from the response, causing undefined property access crashes. This was caused by the remediation session wiring two-stage detection on the API side without updating the client pages that consume those responses. All 5 pages now check for `distress_detected` before processing the response body.

**Rules served:** R20a (vulnerable users see crisis resources, not a crash), R19c (honest error handling)

**Impact:** 5 page files modified. Private mentor handles it as an insight message; the other 4 pages show a full-page redirect UI with crisis contact information.

**Status:** Adopted — Wired and verified

---

## 19 April 2026 — Option 2: Removed JSON.stringify Wrap on passions_detected Writer

**Decision:** Changed `sage-mentor/profile-store.ts:781` from `passions_detected: JSON.stringify(interaction.passions_detected || [])` to `passions_detected: interaction.passions_detected || []`. The Supabase client now receives the array directly and the JSONB column stores a proper JSON array rather than a JSON-encoded string scalar containing an array-shaped string.

**Reasoning:** Session-10 first-observation flagged that JSONB columns were holding string-encoded arrays, causing `Array.isArray()` false-negatives at reader sites and forcing defensive `JSON.parse` in three places. Session-12 reader audit confirmed a single writer (profile-store.ts:781) and four readers (two defensive by design as backstops for legacy rows, two pass-through API handlers with no current client consumer). PR1 trivially satisfied — single writer, prove-before-rollout unnecessary. Risk classified Elevated under 0d-ii: user-facing functionality affected (mentor context Recent Interaction Signals), rollback is a single-token revert, no auth/session/deploy touched. Defensive readers retained as backstops for mixed historical rows per the anticipatory comment at `mentor-context-private.ts:668–675`.

**Rules served:** R12 (mechanism grounding — passion taxonomy stored in the intended shape), R4 (IP protection — single writer, single shape, no drift), PR1 (single-endpoint proof — trivially satisfied).

**Impact:** One-line code change plus a five-line inline comment referencing the session-13 close handoff. Vercel Green. Live verification: fresh evening reflection (`id bd3d631c-…`, `sub_species: "agonia"`, `root_passion: "phobos"`) confirmed `jsonb_typeof = 'array'` at the database level; mentor chat probe returned `"agonia (phobos, freq 5)"` confirming the rolling-window aggregator parses and counts the new shape correctly. 0a status: Verified.

**Status:** Adopted — Verified

---

## 19 April 2026 — KG10 Promoted: JSONB Storage Format vs Payload Shape

**Decision:** Promoted the session-10 first-observation candidate "JSONB columns can hold a JSON-encoded string scalar that looks like an array but fails Array.isArray" to a permanent entry in the knowledge-gaps register as KG10. Added full entry with plain-language resolution, write-site rule, read-site defensive pattern, and a verification method using `jsonb_typeof()`.

**Reasoning:** PR5 trigger — this concept has now required re-explanation across three sessions: Session 10 (original `Array.isArray` false-negative investigation), Session 12 (reader audit confirmed the same pattern at the writer site), Session 13 (Option 2 fix and verification). Leaving it as tacit knowledge risks another session independently re-deriving the same lesson. Promoting it means any future endpoint touching a JSONB column will surface the rule at session-open when `knowledge-gaps.md` is scanned.

**Rules served:** PR5 (knowledge-gap carry-forward — third observation triggers promotion), R4 (IP protection — tacit knowledge formalised into discoverable documentation).

**Impact:** `operations/knowledge-gaps.md` updated with KG10 entry. Session-13 close handoff references KG10 in the Knowledge-Gap Carry-Forward section. No code impact.

**Status:** Adopted

---

## 20 April 2026 — Support Wiring Fix — Channel 1 Distress Pre-Processor Wired

**Decision:** Wired the proven mentor two-stage distress pattern onto the Support agent as a new pre-processor module `sage-mentor/support-distress-preprocessor.ts`. The preprocessor is synchronous w.r.t. the pipeline (PR3). It awaits the injected classifier and produces a branded `SupportSafetyGate` token. `processInboxItem` was breaking-changed from `sync(item, profile, kb)` to `async(item, profile, kb, deps, gate, config?)`; a `processInboxItemWithGuard` convenience wrapper was added so callers that don't already hold a gate cannot bypass the safety check. Founder approved the Critical Change Protocol with the three named failure modes (fail-closed on Haiku outage, mis-wired `SafetyGate`, cross-context `vulnerability_flag` match) at session open.

**Reasoning:** The mentor's distress pattern on `/api/mentor/private/reflect` has been live and stable since Session 7h (PR1 single-endpoint proof satisfied). Support was the second endpoint to need the same discipline. Channel 1 of the scoping handoff (`operations/handoffs/support-wiring-fix-handoff.md`) identified Support as processing inbox items raw with no distress check — a direct R20a violation on any user path that funnels a distressed message through a support inbox. The branded-gate type was chosen over a boolean flag because it makes bypass a compile error, not a convention (KG3/KG7 invocation guard).

**Rules served:** R20a (vulnerable user detection), PR1 (single-endpoint proof before rollout — Support is the second endpoint following the mentor proof), PR2 (build-to-wire verification immediate — single call site verified in-session), PR3 (safety-critical synchronous gate), PR6 (safety-critical changes always Critical — founder-approved protocol), 0a (status vocabulary — Channel 1 moved Scaffolded → Wired).

**Impact:** Three files created (`sage-mentor/support-distress-preprocessor.ts`, `sage-mentor/support-history-synthesis.ts`, `scripts/support-wiring-verification.mjs`). Two files modified (`sage-mentor/support-agent.ts`, `sage-mentor/index.ts`). Breaking change to `processInboxItem`'s signature — mitigated by the `WithGuard` wrapper and by the fact that the repo currently has zero external callers of `processInboxItem` (grep-verified; single internal call inside `WithGuard`). Verification harness runs 30 assertions against Channel 1 + Channel 2 and exits 0. Integration (real Vercel deploy + real Supabase + real `detectDistressTwoStage`) is the next session's work.

**Status:** Adopted — Wired (integration Verified pending next session).

---

## 20 April 2026 — Support Wiring Fix — Channel 2 History Synthesis Wired

**Decision:** Added a new module `sage-mentor/support-history-synthesis.ts` that reads up to 200 rows from `support_interactions` over a rolling 30-day window, derives category frequency (keyword-bucketed), classifies a `trend` (new / returning / frequent / escalating), surfaces open issues, and emits a `formatHistoryContextBlock` prose block for injection into `buildDraftPrompt`. `buildDraftPrompt` was extended to accept an optional `history: SupportInteractionHistory` parameter; when supplied, the history block is prepended to the drafter instructions. Risk classified Elevated under 0d-ii (new read path, non-safety-critical). Select list scoped to primitive columns only — `ring_evaluation` JSONB is explicitly not read, so KG10 does not apply.

**Reasoning:** Channel 2 of the scoping handoff identified Support as treating every inbox item as a first-time contact. No category frequency, no open-issue acknowledgement, no 30-day rolling window. The feedback loop's 20% category threshold was therefore blind downstream. The new module is read-only, fails soft on DB error (returns an empty history, not a 500), and is additive to the prompt — the drafter still runs if the history read fails. Founder approved the "proceed as designed" variant at the choice point — 90-day baseline uses all `vulnerability_flag` rows (mentor + Support), not a Support-only filter.

**Rules served:** R5 (cost awareness — category frequency informs the 20% feedback-loop threshold), R16 (pipeline data governance — read-only view, no writes), PR1 (additive change, no existing pattern to extend; harness provides the single-endpoint proof), 0a (status vocabulary — Channel 2 moved Scaffolded → Wired).

**Impact:** Same file set as the Channel 1 decision above. Open-issue surfacing and category frequency now available to the drafter whenever `processInboxItemWithGuard` is called. Index `idx_support_interactions_created(user_id, created_at DESC)` already exists (see `api/migrations/support-agent-schema.sql`) — elevated-risk slow-query worst case is pre-mitigated.

**Status:** Adopted — Wired (integration Verified pending next session).

---

## 20 April 2026 — Dependency Injection Adopted for sage-mentor ↔ website Classifier Access

**Decision:** Rather than import `detectDistressTwoStage` from `website/src/lib/r20a-classifier.ts` into `sage-mentor` (not possible — the `@/lib/*` path alias is website-only and there is no shared package), and rather than vendor the classifier into `sage-mentor` (would duplicate safety-critical code in two places and invite drift), the Support preprocessor accepts `classify` as a dependency-injected function. `SupportDistressDeps.classify` has signature `(text: string, sessionId?: string) => Promise<DistressDetectionResult>` — a structural match for `detectDistressTwoStage`. Production callers inject the real classifier; the verification harness injects a deterministic stub. PR6 respected — the classifier itself was not touched.

**Reasoning:** The two surfaces need to converge on the same proven function without either owning it. DI is the minimum-intrusion answer. It also preserves testability — the harness can exercise the full pipeline shape without an Anthropic call, making the single-endpoint unit proof (PR1) cheap to re-run on every change. The pattern is already used in `sage-mentor/sync-to-supabase.ts`, which declares a narrow structural `SupabaseClient` type locally rather than importing from `@supabase/supabase-js`. This decision extends the same discipline to the classifier.

**Rules served:** PR6 (no classifier touch — the proven code is unchanged and unmoved), PR7 (deferred-decision discipline — the alternative of publishing a shared `@sage/safety` package is deferred, not rejected; revisit condition: second cross-module safety function needs to be injected, at which point the shared package becomes worth the cost), R4 (IP protection — single definition of the classifier, no drift).

**Impact:** `SupportDistressDeps` exported from `sage-mentor/support-distress-preprocessor.ts`. Any consumer wiring the Support agent must supply `{ supabase, classify }`. `processInboxItemWithGuard` extends this to `ProcessInboxItemDeps` (adds `userId`, `sessionId`). No change to `r20a-classifier.ts` or `constraints.ts`.

**Status:** Adopted

---

## 20 April 2026 — Support Run-Loop Caller Deferred (Mount Session Closed Early)

**Decision:** The follow-on "mount session" framed by `operations/handoffs/support-wiring-mount-prompt.md` was stopped at Step A. No code was changed. No mount was attempted. The decision to scope and build the Support run-loop caller is deferred to a dedicated future session that is prompted for that work specifically.

**Reasoning:** The mount-session prompt's Step A explicitly anticipated this branch: *"If you find NO caller at all: the run-loop has not been wired yet, and this session's task becomes scoping + building the thinnest possible caller, not mounting. Flag this to the founder immediately with 'I'd push back on this' and wait before building anything new."* The repo grep was thorough (`processInboxItem`, `initialiseSupportAgent`, `parseInboxFile`, `searchKnowledgeBase`, `support_interactions`, `sage-mentor` cross-boundary imports, `vercel.json`, `api/functions/`, `scripts/`) and produced zero external callers. `processInboxItem` is called in exactly one place — `processInboxItemWithGuard` at `support-agent.ts:898` — and `processInboxItemWithGuard` has no callers at all. The `/support/inbox/` directory exists as a file drop but nothing reads it into the agent. Building a caller from scratch forces five decisions that the mount-session prompt does not scope (hosting surface, trigger model, inbox-item source shape, auth context, outbound surface) — these are design decisions with downstream consequences and belong in a dedicated scoping session, not in time pressure at the tail of a mount session. Founder chose option A (close to known-good; record PR7 deferral).

**Rules served:** PR1 (single-endpoint proof before rollout — the next caller surface is a new surface, not a rollout; it needs its own design pass), PR7 (decisions not made are documented — this is the deferred decision with its revisit condition), 0a (status vocabulary — Channels 1 and 2 remain at status **Wired**, they do NOT advance to Verified this session because integration was not possible), R0 (deliberate choice exercise — scope bounded by evidence, not by appetite).

**Impact:** No code change. No file touched. Channel 1 (support-distress-preprocessor) and Channel 2 (support-history-synthesis) remain at status **Wired** per the 20 April 2026 entries above. The 30-assertion unit harness at `scripts/support-wiring-verification.mjs` remains green. Close handoff produced at `operations/handoffs/support-wiring-mount-close.md` in the same format as the prior close handoff, documenting the scope finding, the option taken, and the revisit condition for the next session.

**Revisit condition:** A dedicated session prompt is drafted that scopes the five deferred design decisions (hosting surface, trigger model, inbox-item source shape, auth context, outbound surface). That session produces an ADR under `engineering:architecture`. A subsequent session implements the caller. A third session mounts and live-tests. Do not collapse these into one session — the mount-session prompt's failure mode demonstrates what happens when the scope covers more than one architectural choice at a time.

**Status:** Adopted

---

## 20 April 2026 — D-Tech-1: Known-Issues File Starts Empty with Dated Header

**Decision:** `operations/tech-known-issues.md` was scaffolded as an empty stub with a dated 20 April 2026 header, the maintenance contract, the PR9 severity-tier legend, and both sections (`## Current Issues` and `## Recently Resolved (last 30 days)`) present but carrying placeholder sentences ("No known issues at 20 April 2026." / "No recently-resolved issues at 20 April 2026.").

**Reasoning:** Option A (empty with dated header) was chosen over Option B (prefill with the 9-vs-10 endpoint drift as the first known issue) and Option C (prefill with broader observed items from prior sessions). The stub is the simplest honest answer to the question "what do we actually know about current issues?" — nothing as of this morning. Coupling Channel 1 and Channel 2 via a prefilled drift entry (Option B) was rejected because the drift is a Channel-2 detection signal, not an operator-observed live incident — recording it as a Channel-1 entry conflates two different signal types and trains the mentor agent on a false precedent. Option C was rejected as scope expansion.

**Alternatives considered:** Option B (drift prefilled), Option C (broader sweep).

**Revisit condition:** Any live incident the founder observes after 20 April 2026. First real entry is also the first evidence that the maintenance contract is being honoured.

**Rules served:** PR1 (single-persona proof — Tech before rollout), PR7 (deferred decisions documented — Options B and C are not rejected, they are deferred with the condition that Option A proves the pattern first), R19 (honest positioning — stub is honest about what the system knows).

**Impact:** File created. Channel 1 loader reads a valid empty file. Formatted context block produced at request time reports "none recorded" for both sections. No operational burden on the founder until an issue is observed.

**Status:** Adopted

---

## 20 April 2026 — D-Tech-2: TECHNICAL_STATE.md Reconciliation Deferred to a Follow-up Session

**Decision:** The drift between `/TECHNICAL_STATE.md` §2 (lists 9 `runSageReason` endpoints) and the actual codebase (10 route files call `runSageReason(`) is *not* reconciled in this session. Channel 2 is wired against the file as-is. The verification harness at `scripts/tech-wiring-verification.mjs` runs a grep of `website/src/app/api/**/route.ts` on every run and prints a DRIFT report when inventory and codebase diverge. First-run DRIFT is expected and is the evidence that Channel 2 is working as designed.

**Reasoning:** Option A (wire first, reconcile later) was chosen over Option B (reconcile inside this session before wiring) and Option C (freeze and ignore drift). Option B doubles session scope, risks a partial close if reconciliation turns up further drift across §3 and §5, and couples a bounded wiring change to an unbounded cleanup change. Option C discards the drift-detection benefit that is the single strongest argument for Channel 2 existing at all. Option A respects PR1 (bounded scope per session) and puts the drift signal in front of the founder *first*, so the reconciliation is done with evidence rather than memory.

**Alternatives considered:** Option B (reconcile inside this session), Option C (freeze and ignore drift).

**Revisit condition:** The next session's Next Session Should menu surfaces "Reconcile TECHNICAL_STATE.md §2 against the codebase" as the first queued task. Trigger is the harness's DRIFT output.

**Rules served:** PR1 (single-persona proof; bounded scope), PR7 (deferred-decision discipline — reconciliation is deferred with a named trigger, not silently dropped), R5 (cost-as-health-metric — a session-close at known-good beats a session overshoot).

**Impact:** Channel 2 wired against the current TECHNICAL_STATE.md. Inventory entries parsed from the file do not match the grep count. The harness reports DRIFT on first run with the set difference printed. Channel 1 loader returns the empty stub; Channel 2 loader returns the inventory as documented. No TECHNICAL_STATE.md edit this session.

**Status:** Adopted

---

## 20 April 2026 — D-Tech-3: Analytics-Events Error Signal Deferred from Channel 1

**Decision:** Channel 1 (Live System State / Known Issues) does *not* include a supplementary query of `analytics_events` for recent error markers in this session. The known-issues markdown file is the sole source of truth for Channel 1.

**Reasoning:** Option A (defer) was chosen over Option B (include a bounded 24h query now). The `analytics_events` table is a write-path event log for product events, not an error log; any error-signal semantics would require a classification layer (which event_types count as error markers?) with its own failure modes. Adding a Supabase read to the request path also introduces query-cost, RLS, and latency surfaces that are out of scope for a wiring fix. Deferring preserves the single-source-of-truth property of Channel 1 while the pattern is proven; a second signal can be designed later with its own ADR once Channel 1 is Verified in production.

**Alternatives considered:** Option B (bounded `analytics_events` query wired into Channel 1).

**Revisit condition:** Channel 1 reaches Verified status in production and the operator has visible evidence that manual upkeep of the known-issues file alone is insufficient (e.g., known issues observed in Vercel logs that never reach the file in time). Designed as a separate ADR, not a silent expansion of Channel 1.

**Rules served:** PR1 (single source of truth per channel until the pattern is proven), PR7 (deferred with trigger, not silently dropped), R5 (no added Supabase read cost in the request path without a named benefit).

**Impact:** Channel 1 loader reads one file. No Supabase calls in the Channel 1 request path. The known-issues file carries the full burden of Channel 1's signal. If the file is stale, Tech answers stale — the self-disclosing stub message does not apply here because the file *is* present, just empty.

**Status:** Adopted

---

## 20 April 2026 — D-Tech-4: Pattern Not Extended to Ops / Growth / Support Chat Personas This Session

**Decision:** The file-based context-loader pattern wired into the Tech chat persona this session is *not* extended to the Ops, Growth, or Support chat personas in the same session. Only the `case 'tech':` branch of `website/src/app/api/founder/hub/route.ts` is modified. The other three branches are untouched.

**Reasoning:** Option A (single-persona proof) was chosen over Option B (extend in the same session). PR1 is the direct rule — a new architectural pattern must be proven on a single endpoint and reach Verified status before rollout. The Tech persona has not yet reached Verified (live probe is pending at time of decision), so rollout to the other three personas would compound unverified work. The cost of waiting one session per persona is small; the cost of carrying a half-proven pattern across four personas is the Session 7b failure mode.

**Alternatives considered:** Option B (mechanical extension to all four chat personas in one session).

**Revisit condition:** Tech persona Channel 1 and Channel 2 reach Verified status (harness passes + live probe returns a structured reply demonstrably using the injected blocks). At that point the pattern is proven and rollout to Ops, Growth, and Support can begin — one persona per session, each with its own known-issues file and its own loader if the signal is persona-specific, or a shared loader if the signal is genuinely shared.

**Rules served:** PR1 (single-endpoint proof before surface rollout — named directly), PR7 (deferred with trigger).

**Impact:** Diff footprint this session is bounded. Ops, Growth, and Support chat personas continue to answer from their existing static brains + stoic context + project context. No new load on their request paths.

**Status:** Adopted

---

## 2026-04-20 — D-Tech-5: Tech Channel 1 + Channel 2 Verification Failed on Vercel; Stabilise Now, Fix Next Session

**Decision:** After in-session deploy and live probe at `/founder-hub` with the Tech persona, both Channel 1 (`tech-system-state.ts`) and Channel 2 (`tech-endpoint-inventory.ts`) returned the stub-fallback "unavailable" text on Vercel runtime. The persona disclosed honestly. No code changes were attempted at session tail. Founder selected Option A: stabilise here, log the failure, fix in the next session.

**Reasoning:** Production is in a known-good failure state — the stub-fallback design caused the persona to disclose blindness rather than hallucinate, so no user is being misled. Attempting a fix at session tail would be Elevated risk (touches deployment configuration or moves files referenced from multiple places) on a session that has already absorbed the verification surprise. A fresh session is better positioned to (1) diagnose the actual runtime cwd via a temporary diagnostic endpoint, (2) choose between the three fix approaches (path-fix, file-move, `outputFileTracingIncludes`) based on evidence, and (3) re-verify cleanly. The diagnosis is the Open Question I logged in the close handoff (`process.cwd()` on Vercel serverless probably resolves to the Next.js project root, not the repo root, and/or the bundler does not ship files from outside `website/`).

**Alternatives considered:**
- **Option B — investigate and fix now.** Would require diagnostic endpoint deploy → cwd readback → fix-path choice → fix implementation → re-deploy → re-probe. Elevated risk under 0d-ii. Realistic chance of needing two iterations. Deferred to next session.
- **Revert the changes.** Removing the wiring would return the Tech persona to its pre-session state. Rejected because the stub-fallback failure is recoverable (no silent breakage, no user-visible harm) and the Wired code is correct apart from the runtime path issue. Reverting would lose the parser, the harness, and the file-creation work, all of which still apply post-fix.

**Revisit condition:** First task of the next session. Diagnostic endpoint runs → cwd value confirmed → fix approach chosen → fix deployed → live probe at `/founder-hub` returns a reply that references actual endpoint inventory wording and current-issues state. At that point, Channel 1 and Channel 2 move from "Wired-but-stub-on-Vercel" to "Verified", and D-Tech-4 (rollout to other personas) becomes eligible for revisit.

**Rules served:** PR2 (acknowledges the discipline was partially violated when Wired status was applied before the production load path had been exercised; restoring it is the next session's first job), PR7 (deferral recorded with explicit revisit condition), PR9 (stewardship finding logged in addendum at Catastrophic-tier near-miss for the stub-fallback design that prevented silent failure, and Long-term-regression-tier for sandbox-vs-production runtime divergence).

**Impact:** No production code changed in this decision. The two loaders, the route modification, the known-issues file, the harness, and the close handoff remain on disk and committed. The Tech persona continues to answer with stub-disclosure on production until the next session's fix lands. Status of Channel 1 and Channel 2 corrected from "Wired" to "Wired-but-stub-on-Vercel" in the close-handoff addendum.

**Status:** Adopted

---

## 2026-04-20 — D-Growth-1: Growth Actions Log Starts with One Back-Dated Seeded Entry

**Decision:** `operations/growth-actions-log.md` was scaffolded with front-matter (`updated: 2026-04-20`, `maintainer: founder`), the maintenance contract, the valid-values lists for `domain` and `action_type`, and one back-dated entry recording this wiring session itself (domain `positioning`, action_type `decided`, dated 2026-04-20, reference `operations/handoffs/growth-wiring-fix-handoff.md`, outcome `awaiting_signal`). No other historical actions were back-filled.

**Reasoning:** Option A (one seeded entry describing this session) was chosen over Option B (empty file with placeholder) and Option C (broader back-fill of pre-session positioning/content/pricing decisions). Option A gives the parser a non-empty input on first run, exercises every required field (date, domain, action_type, outcome, reference) so the founder can see what a well-formed entry looks like, and documents the wiring session itself as a legitimate positioning decision. Option B was rejected because it would make the harness's "at least one action parsed" assertion impossible to pass on first run without weakening the assertion. Option C was rejected as scope expansion and as a retroactive-truth risk — the AI should not invent historical entries the founder never actually decided in this form.

**Alternatives considered:** Option B (empty file with placeholder), Option C (back-fill of prior positioning/content/pricing decisions).

**Revisit condition:** The seeded entry remains in place as the first real entry. It does not get removed after being verified — it is a legitimate decision record, not a test artefact. If over time the entry falls outside the 90-day rolling window (after 20 July 2026), it will stop appearing in the Growth persona's context but remains in the file for audit.

**Rules served:** PR1 (single-persona proof — Growth is the second persona to carry the Channel 1+2 pattern; Tech was the first), PR7 (deferred-decision discipline — Options B and C are not rejected silently, they are deferred with the condition that Option A proves the pattern first), R19 (honest positioning — the seeded entry describes a real decision, not an invented one).

**Impact:** File created. Channel 1 loader reads a valid file with one action. Harness CHECK 1 asserts the seeded entry parses with the correct domain and action_type (16/16 assertions pass in-session). Formatted context block produced at request time shows the entry to the Growth persona.

**Status:** Adopted

---

## 2026-04-20 — D-Growth-2: Growth Market Signals File Starts Empty with "No Signal Yet" Placeholders in All Four Sections

**Decision:** `operations/growth-market-signals.md` was scaffolded with front-matter, the maintenance contract, the entry-format spec, and four named sections (Content Performance, Developer Discovery, Community Feedback, Competitive / Market Observations) each carrying the dated placeholder `_no signal yet (as of 2026-04-20)_`. No signals were back-filled. Channel 2's loader is written to detect this sparse state and inject an explicit "Do NOT invent signals" disclosure block into the Growth persona's context.

**Reasoning:** Option A (empty with dated placeholders) was chosen over Option B (back-fill with observations the founder recalls) and Option C (pull observations from past session debriefs). The AI does not invent market signals — market observations are by definition the founder's observations, made at the time, with the reference material in hand. Retroactive reconstruction loses the signal quality that makes the signal worth having. Option B and Option C would both encode reconstructed-memory as equivalent to in-the-moment observation and train the Growth persona on a false precedent. The sparse-state disclosure pattern in the Channel 2 loader is the architectural response to this decision: rather than silently returning an empty block, the loader actively tells the persona "you have no data here; do not invent any."

**Alternatives considered:** Option B (founder back-fills observations from recall), Option C (AI extracts observations from prior session debriefs).

**Revisit condition:** First time the founder observes a signal (content that landed or didn't, developer reaching out, competitor moves, community feedback) and can record it in the dated bullet format with a reference. The Channel 2 loader will parse the entry; the harness needs a targeted re-run to confirm; the persona will start to carry one signal in its context.

**Rules served:** PR1 (single-persona proof — bounded scope), PR7 (deferred-decision discipline — back-fill is not rejected absolutely, it is deferred to legitimate in-the-moment observations), R19 (honest positioning — the sparse-state disclosure is the honest answer to "what do you know about market response?" at P0).

**Impact:** File created. Channel 2 loader reads a valid file with zero signals. `is_sparse` flag is true. Formatted context block carries the "Do NOT invent signals" disclosure. The Growth persona is expected to refuse to fabricate signals and to disclose the sparse state when asked about market response.

**Status:** Adopted

---

## 2026-04-20 — D-Growth-3: Analytics-Events / Agent-Discovery Signals Deferred from Channel 2

**Decision:** Channel 2 (Growth Observation Synthesis) does *not* include automatic signals from `analytics_events`, agent-card.json fetches, API-key sign-ups, or any other system-measured data source in this session. The hand-maintained `operations/growth-market-signals.md` file is the sole source for Channel 2.

**Reasoning:** Option A (defer) was chosen over Option B (wire one automatic signal now, e.g. a count of API key creation events in the last 120 days). Channel 2's current semantics are "signals the founder has observed with their own eyes." Wiring an automatic signal collapses that semantic into a mix of founder-observed and system-measured, which degrades the reasoning the persona can do: founder observations carry qualitative weight ("I noticed this") that system metrics do not, and the persona cannot distinguish them once they are injected into the same block. Wiring automatic signals requires a dedicated ADR — decisions about window alignment, unit normalisation, confidence weighting, and whether to keep founder-observed and system-measured in separate blocks or merged. Out of scope for a wiring fix.

**Alternatives considered:** Option B (wire bounded analytics-events / agent-discovery query into Channel 2 with a tag indicating source).

**Revisit condition:** First time the Growth persona is asked a question that needs engagement-metric or developer-discovery volume data (e.g., "which content has performed best" or "how many agent developers have looked at our card"), and the founder cannot answer from the hand-maintained file alone because observations of that kind have been happening but not being recorded. At that point an ADR is scoped to design the semantic extension.

**Rules served:** PR1 (single source of truth per channel until the pattern is proven), PR7 (deferred with trigger), R5 (no added Supabase read cost or analytics-events coupling in the request path without a named benefit and an ADR).

**Impact:** Channel 2 loader reads one file. No Supabase calls in the Channel 2 request path. The market-signals file carries the full burden of Channel 2's signal. If the file is sparse, the persona discloses sparsity — the disclosure path handles the honest answer.

**Status:** Adopted

---

## 2026-04-20 — D-Growth-4: Pattern Not Extended to Ops Chat Persona This Session

**Decision:** The file-based context-loader pattern wired into the Growth chat persona this session is *not* extended to the Ops chat persona in the same session. Only the `case 'growth':` branch of `website/src/app/api/founder/hub/route.ts` is modified. The `case 'ops':`, `case 'tech':`, `case 'support':`, `case 'mentor':`, and `default:` branches are untouched.

**Reasoning:** Option A (single-persona proof per session) was chosen over Option B (extend Growth's pattern to Ops in the same session). PR1 is the direct rule — a new architectural pattern must be proven on a single surface and reach Verified status before rollout. Tech's Channels 1+2 are still in Wired-but-stub-on-Vercel status pending the dedicated Vercel-path fix session; Growth's Channels 1+2 close this session at Wired + harness-Verified but production-unverified. Rolling out to Ops in the same session as Growth would compound three pieces of unverified work. Cost of waiting one session per persona: small. Cost of carrying a half-proven pattern across three personas: the Session 7b failure mode, this time with two downstream failure sites instead of one.

**Alternatives considered:** Option B (mechanical extension to Ops in the same session as Growth).

**Revisit condition:** Tech Channels 1+2 and Growth Channels 1+2 both reach Verified status after the Vercel-path fix lands, the harnesses both pass on the founder's machine, and both live probes return replies that ground in the injected context. At that point the pattern is proven across two personas and rollout to Ops can begin as its own bounded session — likely with a similar Scoped+Designed handoff scope and similar choice points (what does the Ops actions log contain, what does the Ops signals file contain, what's the rolling window for each).

**Rules served:** PR1 (single-endpoint proof before surface rollout — named directly), PR7 (deferred with trigger).

**Impact:** Diff footprint this session is bounded to the Growth branch. Ops, Tech (unchanged from its own session), Support, Mentor, and the default branch continue to answer from their existing static brains + stoic context + project context. No new load on their request paths.

**Status:** Adopted

---

## 2026-04-20 — D-Growth-5: Rolling Windows — 90 Days (Actions) / 120 Days (Signals), with Channel 2 Widening to All Entries When Sparse

**Decision:** Channel 1 (actions log) returns the last 90 days of actions by default. Channel 2 (market signals) returns the last 120 days of signals by default, and widens to all available entries when fewer than 5 signals parse within the 120-day window. Both windows are parameterisable on the loader options object but the defaults are as stated.

**Reasoning:** Option A (90/120 with widen-on-sparse for Channel 2) was chosen over Option B (same window for both, e.g. 60/60) and Option C (no rolling window — include everything the file contains). Actions accumulate fast relative to signals — pricing changes, content ships, and positioning decisions produce multiple entries per month — so a tight 90-day window keeps the Growth persona's context current and avoids drowning recent actions in old ones. Signals accumulate slowly relative to actions — a single competitor observation or community feedback item can still be reasoning-relevant months later — so Channel 2 defaults wider. The widen-on-sparse behaviour is designed for the bootstrap case: with zero or one signals in the file, a sharp window cutoff that excludes an old-but-existing entry would leave the persona with less information than the file actually contains. The 5-signal `SPARSE_THRESHOLD` is a judgement value, not a research-backed number.

**Alternatives considered:** Option B (unified window — simpler but ignores the different accumulation rates), Option C (no window — cheap now but unbounded as the files grow; would need a window eventually and better to set one at creation time than to retrofit).

**Revisit condition:** If the Growth persona's context starts to feel stale (persona citing 80-day-old actions as current) or irrelevant (persona citing a 115-day-old signal that has since been overtaken by new events), the 90/120 defaults are the first thing to tune. If the signals file grows past ~50 entries total, reconsider the `SPARSE_THRESHOLD` of 5 — at high signal density the widen-on-sparse behaviour never fires and becomes dead code.

**Rules served:** PR7 (deferred-decision discipline — Option B and C are not rejected absolutely, they are deferred to tuning based on evidence), R0 (deliberate choice exercise — window sizes are a principled choice about the persona's information horizon, not an arbitrary default).

**Impact:** Channel 1 loader applies `DEFAULT_WINDOW_DAYS = 90`. Channel 2 loader applies `DEFAULT_WINDOW_DAYS = 120` with `SPARSE_THRESHOLD = 5`. Both values are constants at the top of the respective loader files; tuning is a one-line change plus a re-test.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-0: Diagnostic outcome for Ops channel-gap hypothesis

**Decision:** Diagnostic probe against Ops persona on /founder-hub confirmed the channel-gap diagnosis from ops-wiring-fix-handoff.md §2. Ops reported no live cost-feed signal and no operational-continuity synthesis. Design adopted as scoped — no re-scope.

**Reasoning:** Handoff required diagnostic confirmation before code (Step B). Ops's reply aligned with the documented hypothesis. Neither a partial-confirm re-scope nor a corrected abandonment was warranted.

**Alternatives considered:** Partial confirm (one channel only) — rejected because Ops named both gaps. Corrected (stop and rewrite handoff) — rejected because Ops's self-report matched the diagnosis.

**Revisit condition:** If a future session's diagnostic reveals additional channels not covered by C1 or C2 (e.g. a Stripe live-signal channel, a pipeline-depth channel), log as a new candidate in the decision log and design in a separate session.

**Rules served:** PR1 (single-persona proof), the project's "diagnostic first" discipline documented in the handoff.

**Impact:** Unblocked scaffolding for both channels in the same session.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-1: Channel 1 data sources — Choice 2 Option A

**Decision:** Channel 1 (Live Cost / Spend Feed) wires `cost_health_snapshots` (latest row) and `get_classifier_cost_summary` (30-day aggregate). Per-endpoint concentration deferred — returns `status: 'unknown'` with reason. Runway deferred — returns `status: 'unknown'` with reason (see D-Ops-6).

**Reasoning:** The classifier_cost_log schema does not currently carry an `endpoint` column, so per-endpoint concentration cannot be computed without either a schema change or a separate per-endpoint spend log. Neither is in scope. The self-disclosing 'unknown' at field level is consistent with the Channel 2 sparse-state disclosure pattern adopted at Growth close.

**Alternatives considered:** Option B (full four-threshold wiring with concentration computed from whatever is available) — rejected; would produce a number that is not actually concentration and would mislead the persona. Option C (defer Channel 1 entirely until concentration is available) — rejected; the other three thresholds are valuable now.

**Revisit condition:** Classifier cost log gains endpoint attribution, or a separate per-endpoint spend log is built.

**Rules served:** PR1, PR2, the stub-fallback discipline from Tech/Growth.

**Impact:** Channel 1 ships with three out of four threshold readings live and one self-disclosed 'unknown'.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-2: Concentration reading returns 'unknown' by design

**Decision:** Concentration field in Channel 1 carries `status: 'unknown'` with inline note: *"Per-endpoint concentration not yet instrumented. Deferred under D-Ops-2."*

**Reasoning:** The self-disclosing stub pattern applied at field level (not just loader level) means the Ops persona cannot misread silence as green. Makes the deferral visible in every reply that surfaces the cost block.

**Alternatives considered:** Omit the field entirely — rejected; invisible deferrals drift. Guess a proxy metric — rejected; produces wrong confidence.

**Revisit condition:** Same as D-Ops-1.

**Rules served:** The stub-fallback discipline, PR7 (deferred decisions documented).

**Impact:** Field-level 'unknown' becomes an established pattern for future loaders.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-3: Channel 2 source filtering — Choice 3 Option A

**Decision:** All five Channel 2 sources wired (handoffs directory, decision log, knowledge gaps, compliance register, D-register). HANDOFF_CAP = 5 most recent closes. DECISION_CAP = 12 most recent entries. Per-source try/catch means one failing source does not break the loader.

**Reasoning:** The handoff §4.2 established the truncation order and per-source isolation. Narrowing the source list would leave operational-continuity gaps.

**Alternatives considered:** Option B (handoffs + decision log only) — rejected; loses compliance posture and D-register non-decisions. Option C (decision log only) — rejected; loses everything observational.

**Revisit condition:** If a source consistently fails or adds noise rather than signal, drop it.

**Rules served:** PR1, PR7.

**Impact:** Ops sees five signals on every request where the source files resolve.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-4: Snapshot freshness policy — Choice 4 Option A

**Decision:** `SNAPSHOT_STALE_AFTER_DAYS = 7`. Warning after 7 days. Do not block.

**Reasoning:** Blocking on stale snapshot would make the Ops persona silently unusable on any week the snapshot job fails. Warning preserves the signal and makes the staleness explicit to the persona.

**Alternatives considered:** Block after 7 days — rejected; worse failure mode. No warning — rejected; persona can't reason about staleness.

**Revisit condition:** If snapshot job frequency changes, update the constant.

**Rules served:** The stub-fallback discipline, PR7.

**Impact:** Stale-snapshot case is a warning, not a failure.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-5: Mentor persona extension — Choice 5 Option A

**Decision:** No. The Channel 1 + Channel 2 pattern is not extended to the mentor persona. Mentor uses a different architecture (memory-based, not session-state-synthesis-based) and is not a continuation of this chat-persona wiring series.

**Reasoning:** Ops is the final chat-persona wiring in the Support / Tech / Growth / Ops series. The mentor branch has its own open architecture question (memory ADR, carried forward across sessions). Reusing this pattern there would conflate two unlike designs.

**Alternatives considered:** Extend the pattern to mentor — rejected; premature without the memory ADR.

**Revisit condition:** Mentor memory architecture ADR adopted, and the ADR independently specifies a continuity-state channel.

**Rules served:** PR1, PR7.

**Impact:** Closes the chat-persona wiring series cleanly. Mentor remains on its own track.

**Status:** Adopted

---

## 2026-04-20 — D-Ops-6: Runway reading returns 'unknown' by design

**Decision:** Runway field in Channel 1 carries `status: 'unknown'` with inline note: *"Runway not in the snapshot schema. Deferred under D-Ops-6."*

**Reasoning:** The `cost_health_snapshots` schema as documented does not carry a runway field. Computing runway in the loader would require a revenue-projection model not in scope. Field-level 'unknown' with self-disclosure is the consistent discipline.

**Alternatives considered:** Compute runway from cash-in-bank and monthly-burn inside the loader — rejected; would require assumptions about revenue projection not in scope and not auditable. Add runway to the snapshot schema — rejected; schema change out of scope for this session.

**Revisit condition:** Snapshot schema gains a runway field, or a separate runway-projection loader is designed.

**Rules served:** PR7, the stub-fallback discipline.

**Impact:** Runway deferral is visible in every reply that surfaces the cost block.

**Status:** Adopted

---

## 2026-04-21 — D-Fix-1: Vercel path resolution — Option A (parent-directory traversal) chosen

**Decision:** Fix all five file-based context loaders by adding `const REPO_ROOT = path.join(process.cwd(), '..')` and resolving all source paths from REPO_ROOT. Option A chosen over Option B (file-move) and Option C (outputFileTracingIncludes).

**Reasoning:** Diagnostic endpoint confirmed `process.cwd()` = `/var/task/website` on Vercel runtime. All parent-traversal paths resolved successfully. All direct paths returned ENOENT. Option A is the smallest diff (one constant + path update per loader), requires no file moves or Next.js config changes, and the bundler already ships the source files at the repo root. Options B and C solve the same problem with more complexity and more rollback surface.

**Alternatives considered:** Option B (file-move) — rejected; unnecessary since files are already accessible via `..`. Introduces source-of-truth ambiguity for files referenced from outside the loaders. Option C (outputFileTracingIncludes) — rejected; unnecessary since the bundler already ships the files.

**Revisit condition:** If a future Vercel runtime change prevents parent-directory traversal (e.g., sandboxing the function to its project directory), revisit with Option C.

**Rules served:** KG1 resolution, PR2 (verified in same session), PR5/PR8 (KG1 promoted at third recurrence).

**Impact:** Five loaders move from Wired-but-stub-on-Vercel to Verified. Tech, Growth, and Ops file-based channels all reading live data on production.

**Status:** Adopted

---

## 2026-04-21 — D-Fix-2: Harness invocation pattern changed — run from website/ subdirectory

**Decision:** All three wiring verification harnesses must now be invoked from the `website/` subdirectory: `cd website && node ../scripts/<harness>.mjs`. This matches Vercel's runtime where `process.cwd()` = the Next.js project dir.

**Reasoning:** The path fix changes the directory contract. Loaders now expect `process.cwd()` to be the Next.js project dir (not the repo root). Running harnesses from the repo root would cause loaders to resolve paths incorrectly (one level too high). Running from `website/` matches Vercel's runtime and all three harnesses pass.

**Alternatives considered:** Modify harnesses to `cd` internally — rejected; harnesses are founder-verification tools and should match the production runtime faithfully. Add a `process.chdir()` to each harness — rejected; changes harness semantics and breaks other assertions that rely on repo-root paths.

**Revisit condition:** If harnesses are refactored for other reasons, consider embedding the directory contract.

**Rules served:** PR2 (build-to-wire verification is immediate).

**Impact:** Harness invocation command changes. Anyone running harnesses must use the new pattern.

**Status:** Adopted

---

## 2026-04-21 — D-B2-1: Cross-cut indices live on existing sections, not as new top-level keys

**Decision:** The three B2 computed indices (`by_journey`, `flow_tracer.items[].components`, `flow_tracer.by_component`) are added as fields on the existing `CapabilityInventorySection` and `FlowTracerSection` types — not as new top-level keys on `OpsContinuityBlock`. The seven-source shape of the continuity block is preserved.

**Reasoning:** The loader's external shape is consumed by `hub/route.ts:270`, which reads only `.formatted_context`. Keeping the seven-source structure intact means the hub route, ops prompt composition, and any future reader of the block see no structural change. Co-locating each cross-cut with its source data (`by_journey` with the capability inventory; `by_component` with the flow tracer) means a reader walking the block finds related views together. The alternative — new top-level keys like `opsContinuityBlock.by_journey` — would have broken the "seven sources" contract documented in the file's doc block and would have scattered related views across the block root.

**Alternatives considered:** New top-level keys on `OpsContinuityBlock` — rejected; breaks the seven-source contract and splits related views. Separate cross-cut file/module — rejected as overkill for three derived indices from two existing sources.

**Revisit condition:** If the number of cross-cut indices grows past ~5 per section and the section formatters become hard to read, consider factoring the cross-cuts into a dedicated module.

**Rules served:** PR1 (single-endpoint proof — index 1 was built and verified before indices 2 and 3 were implemented on the pattern).

**Impact:** `formatted_context` gains three new rendered subsections. The hub route and any other consumer of `formatted_context` sees longer text but no shape change. Internal types gain `by_journey`, `components`, and `by_component` fields; stub fallbacks updated symmetrically.

**Status:** Adopted

---

## 2026-04-21 — D-B2-2: Journey render order — paid_api → both → free_tier → internal → unknown

**Decision:** The `by_journey` subsection renders journey groups in the fixed order `paid_api → both → free_tier → internal → unknown`.

**Reasoning:** Ops' default job is to answer launch-readiness questions. Revenue-critical items need to be what Ops sees first when scanning the blocker list. Alphabetical order would bury `paid_api` below `both` and `free_tier`; insertion order from the registry is not stable. Fixing the order makes every Ops answer lead with the commercially meaningful items. `unknown` is last so components whose journey classification is missing don't displace classified ones.

**Alternatives considered:** Alphabetical — rejected; buries revenue-critical items. Registry insertion order — rejected; unstable and arbitrary. Render all journeys with equal weight, let Ops decide — rejected; defeats the purpose of having a grouped view and pushes ranking work into every response.

**Revisit condition:** If post-launch we add a new journey category (e.g., `internal_tooling` vs `internal_ops`), or if the balance of what's revenue-critical shifts materially, revisit the order.

**Rules served:** R0 (oikeiosis — the rendered order is a design choice that shapes which impressions Ops examines first). The choice to lead with paid_api is a stance on what's most-proximate for a launch-focused persona.

**Impact:** Ops' default answer to "what's blocking launch?" leads with the paid_api group. No code downstream relies on the order; this is purely a rendered artefact.

**Status:** Adopted

---

## 2026-04-21 — D-B2-3: B2 scope — cross-cut indices adopted; B1 rejected; B3 deferred; B4 deferred on budget grounds

**Decision:** Of the four Option-B candidates surfaced in the B2 prompt — B1 (SECTIONS taxonomy extraction), B2 (cross-cut indices), B3 (blocker-field classification), B4 (flow-step description surfacing) — B2 was adopted this session. B1 was rejected outright; B3 was deferred as a natural follow-on; B4 was deferred pending a budget decision.

**Reasoning:**
- **B2 adopted** — founder directive at session open ("B2 — cross-cut indices (Recommended)"). Highest value-per-effort of the four: three computed views derived from two already-wired sources, no new inputs, no route changes, additive to `formatted_context`.
- **B1 rejected** — SECTIONS taxonomy extraction was judged low-value: Ops already has the taxonomy implicitly via the rendered content; extracting it as a separate data view duplicates effort without giving Ops an answer it couldn't already give.
- **B3 deferred** — valuable but requires a judgement pass with the founder on borderline cases (some registry notes describe real blockers, others describe non-blocking status). Not urgent because the `by_journey` view still works with the current `notes`-based snippets; the deferral just leaves the signal-to-noise of the grouped view lower than it could be.
- **B4 deferred on budget grounds** — each step in `flows.json` carries a rich `description`. Surfacing them adds significant context volume (~10–15 KB more in `formatted_context`). Two implementation shapes exist (on-demand helper vs compact default-on truncation); neither should be chosen without first deciding how much budget headroom Ops can absorb.

**Alternatives considered:** Batch all four in one session — rejected; B1 has no positive case, B3 needs founder judgement, B4 needs a prior design call. Defer B2 with the others — rejected; B2 is fully self-contained and verifiable in one session.

**Revisit condition:** B3 — revisit next session (C1 candidate in the forward prompt). B4 — revisit after the budget headroom question is answered. B1 — not scheduled; revisit only if a future consumer asks for the taxonomy separately.

**Rules served:** PR1 (single-endpoint proof pattern applied to index 1 first, then indices 2+3). Manifest scope discipline (each rule changes one thing at a time).

**Impact:** B2 landed and verified (per B2 close note). B1 permanently off the Option B shortlist unless re-argued. B3 is the next candidate in the forward prompt. B4 is parked pending a budget decision.

**Status:** Adopted

---

## 2026-04-22 — D-B3-1: Loader filter on `by_journey` by blocker-field presence

**Decision:** The `by_journey` subsection of the Ops continuity block filters non-Ready components to those with an explicit `blocker` field. The main non-Ready `items` array is not filtered — it still enumerates all 65 partial+not-ready components with their `blocker`-or-`notes` text.

**Reasoning:** Ops' launch-readiness questions need focused signal. Before the filter, `by_journey` surfaced all 65 non-Ready items including every `tool-sage-*` factory wrapper. The filter reduces the grouped view to the 19 items that carry explicit launch-blocker text, while the main list keeps full coverage for any question that needs it. The `items` array was deliberately left untouched to preserve that fallback.

**Alternatives considered:** Filter both the main list and the grouped view — rejected; loses fallback signal when a question asks about partial components that don't carry blockers. Registry-only change (no loader edit) — rejected mid-session when re-reading the loader showed `by_journey` iterates `list` directly. Scope was widened from registry-only to registry + loader with founder approval.

**Revisit condition:** If non-Ready items without blockers become launch-relevant (e.g., a new "needs review" taxonomy), revisit whether the grouped view should use a different filter predicate.

**Rules served:** PR1 (single-endpoint change, no rollout pattern). PR2 (verification run in-session via Node probe, confirming by_journey count 65 → 19).

**Impact:** `by_journey` rendered count drops from 65 to 19. Per-journey distribution: paid_api=3, both=3, free_tier=9, internal=4, unknown=0. Main `items` list unchanged.

**Status:** Adopted

---

## 2026-04-22 — D-B3-2: Classification rubric for which components receive an explicit `blocker` field

**Decision:** Non-Ready components receive an explicit `blocker` field when the underlying status note describes a REAL launch blocker. Notes that describe STATUS only (e.g., "partial implementation, factory wrapper not yet promoted") or BORDERLINE cases where it's debatable are left without a blocker field and remain visible via the main non-Ready list.

**Reasoning:** The `by_journey` filter (D-B3-1) is only useful if the 19 items it surfaces are all genuine launch blockers. The REAL / STATUS / BORDERLINE rubric gives a repeatable basis for the decision and prevents status chatter from drowning out real signal.

**Alternatives considered:** Auto-derive blocker from `oldStatus`/`agentReady` alone — rejected; doesn't capture when a "not-ready" is a hard blocker versus a partial wrapper awaiting promotion. Mark all non-Ready items with synthesised blocker text — rejected; same problem as no filter, and adds invented content to the registry.

**Revisit condition:** If the 19-item list misses a real blocker that later surfaces in an Ops answer, revisit the rubric to see whether STATUS should promote to REAL in that case.

**Rules served:** R0 (oikeiosis — the rubric is a deliberate stance on what counts as a launch blocker).

**Impact:** 19 blocker fields set: 1 cleared (`agent-mentor`, which previously referenced a resolved fix), 1 rewritten (`agent-sage-ops`, stripped the stale C2 path-fix reference), 1 unchanged (`agent-support`), 16 new. Distribution: paid_api=3, both=3, free_tier=9, internal=4, unknown=0.

**Status:** Adopted

---

## 2026-04-22 — D-B3-3: Registry duplicate id `doc-journal-layers` deferred to a registry hygiene pass

**Decision:** The pre-existing duplicate id `doc-journal-layers` was discovered during B3 but left in place, with only the stray `blocker` field (accidentally applied during the first pass to the `type: document` / `agentReady: na` entry at index 27) cleaned up. Full resolution is deferred to a later registry hygiene session.

**Reasoning:** The loader's `agentReady` filter naturally excludes the `na` entry, so no consumer reads the duplicated id today. Fixing it in B3 would have expanded scope beyond the stated goal (blocker-field classification). The duplicate is logged in the Open Questions of the B3 close note so it's visible for a future hygiene pass.

**Alternatives considered:** Rename the duplicate in B3 — rejected; scope creep. Delete one entry outright — rejected; the two entries carry different information (spec document vs reasoning implementation wrapper) and reconciling them would need a design call.

**Revisit condition:** Registry hygiene session (the session now in progress as D3). Any future analysis keyed on `id` uniqueness before hygiene is run must be audited for this specific duplicate.

**Rules served:** PR1 (scope discipline — one thing at a time).

**Impact:** Latent data-integrity issue. No current consumer affected; loader reads only the `not-ready` entry at index 104.

**Status:** Adopted

---

## 2026-04-22 — D-D3-1: Rename `doc-journal-layers` (reasoning) → `reasoning-journal-layers` with path/desc/ext correction

**Decision:** Index 104 of the component registry, previously `id: doc-journal-layers` / `type: reasoning`, was renamed to `reasoning-journal-layers`. Its `path`, `ext`, and `desc` were updated to describe the implementation (`/sage-mentor/journal-interpreter.ts`, `.ts`, "Multi-layer interpretation pipeline implementation. Layers 1-8 wired; layers 9-10 stub only (25 TODOs)."). Index 27 (the spec document entry, still `doc-journal-layers` / `type: document`) and index 105 (`reasoning-journal-interp`) were left untouched.

**Reasoning:** The duplicate id `doc-journal-layers` was one facet of a three-entry naming overlap. Index 104 was a "Frankenstein" entry: the id, path, ext, and desc came from the spec-document entry (index 27) it was duplicated from, but the type, readiness status, journey, and blocker described the code implementation. Renaming and fixing the three surface fields aligns the entry with the registry's type-prefix naming invariant (`document` → `doc-*`, `reasoning` → `reasoning-*`) and with the semantic content of its readiness fields. Leaves the deeper overlap with index 105 (`reasoning-journal-interp`, which describes the same code at a different abstraction level) for a future design call.

**Alternatives considered:** Option A (rename only, leave path/desc mismatched) — rejected; leaves the Frankenstein shape visible in Ops' rendered context. Option C (merge index 104 into `reasoning-journal-interp`) — rejected; Elevated risk, shifts which entry carries the blocker in `by_journey`, and requires a readiness-status reconciliation (index 104 is `verified`, index 105 is `designed`). Option D (defer entirely) — rejected; the duplicate-id foot-gun was cheap to close and this was the explicit scope of the D3 session.

**Revisit condition:** If a future registry change creates semantic overlap between `reasoning-journal-layers` and `reasoning-journal-interp` that becomes hard to reason about, revisit whether they should be merged (Option C, re-examined with the readiness reconciliation explicit).

**Rules served:** PR1 (scope discipline — only index 104 touched). PR2 (verification immediate — JSON parse, duplicate-count, TypeScript clean, all in-session). Resolves D-B3-3 (which deferred this work to a registry hygiene pass).

**Impact:** Registry duplicate-id count drops 1 → 0. Ops' rendered `by_journey` internal group now shows `reasoning-journal-layers` instead of `doc-journal-layers` for the Journal Interpretation implementation entry. Total entries (163), blocker count (19), and per-journey distribution (paid_api=3, both=3, free_tier=9, internal=4, unknown=0) unchanged. Supersedes D-B3-3's "deferred" status on this specific item.

**Status:** Adopted

---

## 2026-04-23 — DD-2026-04-23-01: Session Opening Protocol — hybrid form adopted

**Decision:** The Session Opening Protocol (the mechanism that ensures discipline across the four persistence mechanisms, governance reads, closing obligations, and scope caps) will take a hybrid form: a single canonical file lives in `/adopted/`; a distilled extract is concatenated by code into the founder hub's `session_prompt`; the concatenated extract ends with a pointer to the full canonical file so an agent starting cold can read the full version on demand.

**Reasoning:** Three alternatives were considered. (a) Canonical file only — fails because the hub's session_prompt is the thing the founder pastes into a new session; if the protocol isn't in the session_prompt, it isn't applied. (b) Inline in hub only — fails because the hub's 3–8-sentence target squeezes the protocol into something too compressed, and because anything that lives only in code drifts from the governance corpus faster than anything that lives in `/adopted/`. (c) Hybrid (chosen) — keeps the canonical source in `/adopted/` where it can be governed, edits, archived like any other governance doc; the distilled code-concatenated extract is the "what every session starts with" minimum; the pointer closes the loop so an agent wanting more can read the full version.

**Alternatives considered:** Canonical-only (rejected — doesn't reach the hub's session_prompt). Inline-only (rejected — drifts, gets squeezed). No protocol at all / rely on project instructions alone (rejected — project instructions don't propagate into the hub's session_prompt, which is where the founder actually opens a session from).

**Revisit condition:** If the code-concatenated extract starts to drift from the canonical file (discovered via spot-check during a Sage Ops audit or when a founder notices a protocol step missing), the divergence is logged and the extract regenerated from the canonical file. If drift recurs, revisit whether the extract should be auto-generated from the canonical rather than maintained separately.

**Rules served:** R0 (oikeiosis — the protocol is the mechanism that ensures the opening of every session is a deliberate act, not habit). R1 (continuity across sessions). PR1 (pattern proven on a single surface — the hub — before any rollout).

**Impact:** The Session Opening Protocol becomes an adopted artefact with governance rhythm. The hub's `session_prompt` is augmented (next session's build). Scheduled for protocol drafting against the corpus reconciled by the resolutions recorded in this session's entries.

**Status:** Adopted

---

## 2026-04-23 — DD-2026-04-23-02: Discrepancy-sort pass adopted as Option 1

**Decision:** Before the Session Opening Protocol is drafted, a discrepancy-sort pass over the governance corpus is performed. Deliverable: `/operations/discrepancy-sort-2026-04-23.md`. 17 discrepancies surfaced (D1–D17), each with 2–3 options and a severity rating. No adopted-file changes made during the pass itself beyond what the founder explicitly authorises by picking resolutions.

**Reasoning:** The hybrid protocol (DD-2026-04-23-01) depends on a canonical file in `/adopted/` that the agent can reliably point to. If the governance corpus itself contains unresolved discrepancies (stale INDEX, superseded docs not archived, competing archive conventions, competing handoff paths), the protocol's canonical-source pointer becomes ambiguous. The discrepancy-sort produces a known baseline.

**Alternatives considered:** Draft the protocol first, resolve corpus discrepancies later (rejected — would lock the protocol against an unstable corpus). Resolve discrepancies implicitly during drafting (rejected — founder visibility into the alternatives is essential; non-technical founder cannot judge trade-offs hidden inside a draft).

**Revisit condition:** If the discrepancy-sort pattern proves useful, it becomes a reusable operational rhythm (candidate for PR8 promotion after third recurrence).

**Rules served:** R0, R5 (deliberate-choice exercise applied to the corpus itself before it is referenced by the protocol).

**Impact:** 17 discrepancies identified. D6 and D7 resolved in this session (see DD-2026-04-23-03, -04). D17 canonical approach decided in DD-2026-04-23-01 and scheduled for next session. D1, D3, D4 (Material) and D2, D5, D8, D10–D12, D14–D16 (Notable) carried forward. D9, D13 (Minor) carried forward for batch housekeeping.

**Status:** Adopted

---

## 2026-04-23 — DD-2026-04-23-03: Archive convention — /archive/ at root is canonical (D6-A)

**Decision:** `/archive/` at root is the single canonical archive location. Before any governing or strategic file is updated, the previous version is copied to `/archive/` with a date-prefixed descriptive name (e.g. `2026-04-23_INDEX.md`). Per-folder `/backup/` subfolders are retired as a protocol. Inline `.backup-YYYY-MM-DD` sibling files are retired as a protocol.

**Reasoning:** Three conventions were in active competing use: `/archive/` (tech guide, addendum, V3 Adoption Scope supersession header), `/backup/` subfolders (INDEX.md line 16), and inline `.backup-*` files (actual decision-log practice). Three conventions cannot all be canonical. `/archive/` at root was the most-used in practice for governance docs and matched the wording in two of three governance docs (tech guide, addendum). Simplest mental model. Easiest to reason about during session open.

**Alternatives considered:** Option B (backup subfolders canonical) — rejected; requires migrating `/archive/` content into per-folder `/backup/` directories, higher migration cost, disrupts existing usage. Option C (inline `.backup-*` canonical) — rejected; pollutes live folders, breaks browse-to-find-prior-versions pattern. Option D (hybrid with two purposes) — rejected by founder; adds rule complexity without enough benefit.

**Revisit condition:** If `/archive/` grows so large that browsing becomes unwieldy, revisit whether sub-categorisation inside `/archive/` (e.g., `/archive/governance/`, `/archive/operations/`) is warranted.

**Rules served:** R5 (cost-as-health — one convention reduces cognitive overhead). PR2 (verification immediate — executed in the same session as the decision).

**Impact:** Executed in this session. 8 inline `.backup-*` files migrated to `/archive/2026-04-21_inline-backups/` and `/archive/2026-04-22_inline-backups/`. 3 files in `/drafts/backup/` migrated to `/archive/2026-04-15_R20a-drafts-backup/`. INDEX.md "Backup Protocol" section rewritten to "Archive Protocol" naming `/archive/` as canonical; prior version preserved at `/archive/2026-04-11_INDEX.md`. Empty `/backup/` subfolders across 10 strategic folders left in place as harmless placeholders (sandbox directory-removal constraint).

**Status:** Adopted. Resolves D6 of discrepancy-sort-2026-04-23.

---

## 2026-04-23 — DD-2026-04-23-04: Handoff tree — single path, six role subfolders + manual rollup (D7-C + R1)

**Decision:** Single canonical handoff path: `/operations/handoffs/` with six role subfolders (`founder/`, `ops/`, `tech/`, `growth/`, `support/`, `mentor/`) plus `_rollup/` for milestone summaries. File-name convention per stream kept: `*-prompt.md`, `*-handoff.md`, `*-close.md`. Rollup mechanism is manual (R1): founder signals "rollup [milestone-name]"; AI consolidates relevant stream entries into a single file in `_rollup/` with date and milestone name; stream files remain in place; founder approves rollup before commit.

**Reasoning:** Three handoff paths were in use: `/operations/session-handoffs/` (date-named, 42 files), `/operations/handoffs/` (role/task-named, 46 files), and `/website/operations/session-handoffs/` (abandoned, 5 files). Option C (single path with role subfolders) preserves the emergent role/task structure already in use in `/operations/handoffs/` while giving each stream an explicit home and enabling independent stream cadences. Option B (two paths with explicit purposes) was rejected because it kept two "where does this go" decisions live. Option A (single path, no subfolders) was rejected because it loses the categorisation Clinton explicitly asked for. R1 (manual rollup) was chosen over R2 (automated) and R3 (hybrid) because PR8 requires manual pattern before automation, and because the founder's "rollup [milestone-name]" signal is a low-friction act that the session rhythm supports.

**Alternatives considered:** As above. Also considered: keeping `/operations/session-handoffs/` for date-based top-level and `/operations/handoffs/` for role/task — rejected; preserves the two-path ambiguity.

**Revisit condition:** If rollups become frequent (>3 per month) and the manual consolidation becomes a rhythm friction, revisit R2 or R3 (candidate skill for sage-stenographer-style automation once the pattern is observed per PR8).

**Rules served:** R0 (deliberate structure). R1 (continuity — each stream preserves its own history). PR8 (manual pattern first; promotion after third recurrence).

**Impact:** Executed in this session. 46 existing `/operations/handoffs/` files re-filed by role-prefix into subfolders (growth: 3, ops: 10, support: 5, tech: 16, founder: 12). 42 date-named files from `/operations/session-handoffs/` migrated to `/operations/handoffs/founder/` (founder subfolder now 55 files). `/operations/session-handoffs/` folder cannot be deleted by sandbox; left as empty stub with `MIGRATED.md` breadcrumb. `/website/operations/session-handoffs/` (abandoned, 5 files) archived to `/archive/2026-04-16_website-session-handoffs/`. INDEX.md updated with new handoff-tree documentation.

**Status:** Adopted. Resolves D7 of discrepancy-sort-2026-04-23.

---

## 2026-04-24 — DD-2026-04-24-01: `/drafts/` cleared of adopted-state snapshots (D1-A)

**Decision:** The two byte-identical drafts files are archived as snapshots; `/drafts/` is reserved for proposed-successor content only.

- `drafts/manifest-DRAFT-2026-04-18.md` → `/archive/2026-04-18_manifest_drafts-copy.md` (byte-identical to current `/manifest.md`, confirmed by `diff -q` this session)
- `drafts/2026-04-20_PROJECT_STATE_draft.md` → `/archive/2026-04-20_PROJECT_STATE_drafts-copy.md` (byte-identical to current `/PROJECT_STATE.md`)

**Reasoning:** Option A chosen from the four options in the discrepancy-sort (A move-to-archive, B delete, C rename-in-place, D replace-with-successor). A applies the D6-A archive protocol consistently and preserves any future ability to answer "what did the manifest look like on 18 April?" without leaving duplicates in `/drafts/`. B was equally defensible (content is preserved elsewhere) but A matches the canonical archive protocol more directly. C adds clutter without benefit. D requires knowledge neither party has about intended successor edits.

**Alternatives considered:** As above.

**Revisit condition:** If the drafts-copy archive naming pattern causes confusion against the already-archived `/archive/2026-04-18_manifest.md` (the 18,267-byte pre-resolution manifest), revisit naming. Not expected — the two files carry different content and different descriptive suffixes.

**Rules served:** R5 (cost-as-health — reduces corpus redundancy). D6-A (archive protocol applied consistently). PR2 (verification immediate — moves executed and verified in the same session).

**Impact:** `/drafts/` now contains only the empty `/drafts/backup/` placeholder (cosmetic residue from D6-A migration). The folder is now semantically accurate: contents match its stated purpose. Resolves D1 of the discrepancy-sort.

**Status:** Adopted. Resolves D1 of discrepancy-sort-2026-04-23.

---

## 2026-04-24 — DD-2026-04-24-02: `project-instructions-DRAFT-2026-04-18.md` archived as unadopted draft (D2-C)

**Decision:** `drafts/project-instructions-DRAFT-2026-04-18.md` is archived as `/archive/2026-04-18_project-instructions_unadopted-draft.md`. The `_unadopted-draft` suffix preserves the signal that this content was proposed but not adopted.

**Reasoning:** `diff -q` this session against `/archive/2026-04-18_Project-Instructions.md` (the archived adopted copy, 28,139 bytes) returned *differ*. The drafts copy is 34,536 bytes — approximately 6,400 bytes larger than what was adopted. Timestamps show the drafts copy (04:48) was saved 15 minutes before the archive copy (05:03), so the drafts copy is an earlier working state containing content that was cut before adoption. This is not a snapshot of adopted state (rules out D1-A treatment); it is a proposed-successor-that-was-not-adopted. Option C from the discrepancy-sort (raise for review) was applied in the form of archive-with-signalling-suffix rather than leaving in `/drafts/` indefinitely. The cut content is preserved in `/archive/` and remains diffable against the adopted copy if a future session needs to review what was considered.

**Alternatives considered:** Option A (treat as snapshot) — rejected; the file is not a snapshot of adopted state, and naming it as one would lose signal. Option B (diff against archive and delete if identical) — not applicable since the diff confirmed they are different. Option C preferred (raise-for-review-via-archive); no active review triggered now, but the content is discoverable if a future amendment cycle looks for "project-instructions changes considered on 18 April."

**Revisit condition:** If a project-instructions amendment cycle references "what was considered on 18 April," diff `/archive/2026-04-18_project-instructions_unadopted-draft.md` against `/archive/2026-04-18_Project-Instructions.md` to surface the cut content.

**Rules served:** D6-A (archive protocol). PR7 (deferred decisions documented — the cut-content review is documented as deferred with a revisit condition above).

**Impact:** Resolves D2 of the discrepancy-sort. `/drafts/` clean. The ~6,400 bytes of unadopted content is preserved and diffable rather than lost or buried in `/drafts/` under a misleading name.

**Status:** Adopted. Resolves D2 of discrepancy-sort-2026-04-23.

---

## 2026-04-24 — DD-2026-04-24-03: V3 Adoption Scope `.md` files archived as completion records (D3-E)

**Decision:** Both V3 Adoption Scope `.md` files move from `/adopted/` to `/archive/` as historical completion records. `/adopted/` is reserved for currently-governing documents only.

- `adopted/V3_Adoption_Scope.md` (34,502 bytes, Mar 30) → `/archive/2026-03-30_V3_Adoption_Scope_P1-P11_completed.md`
- `adopted/V3_Adoption_Scope_Revised_April.md` (19,371 bytes, Apr 2) → `/archive/2026-04-02_V3_Adoption_Scope_Revised_P12-P16_completed.md`

**Reasoning:** A scan of both files this session reframed D3's decision. The discrepancy-sort presumed one file might still be governing (Revised superseded Original; Original should be archived). Reality: the Revised file's own audit marked all 11 phases of the Original as COMPLETE, and the Revised itself marks its own 5 phases (P12–P16) as completed 3 April 2026. Neither file describes forward work. Both are historical completion records for work that is done.

This reframe generated a new option, E: archive BOTH as completion records. Option A (archive-original-only) would have left a completion record in `/adopted/` — the folder's stated purpose is "currently-governing," not "record of completed scopes," so that reading is inconsistent. Option B (rewrite rule references R1–R9 / R1–R13 to R0–R20) was rejected outright: rewriting historical scope documents retroactively would misrepresent what rules were in force when each scope was executed. Option E aligns folder semantics with canonical archive protocol (D6-A): `/archive/` is where historical and superseded content lives, with date-prefixed descriptive names.

**Alternatives considered:**
- Option A (archive original only) — rejected; leaves a completion record in `/adopted/`, muddies folder semantics.
- Option B (rewrite rule refs) — rejected; would retroactively falsify history.
- Option C (A + B) — rejected for both reasons above.
- Option D (audit whether Revised is still current) — executed as part of the reframe; found to be a completion record, feeding into Option E.
- Option F (new folder `/completed-scopes/`) — rejected; adds structural complexity for a small semantic gain over `/archive/` with `_completed` filename suffix.

**Cross-reference updates executed this session:**
- `/website/public/component-registry.json` entry `doc-v3-adoption`: path updated to new archive location; description amended to describe the file as a completion record; notes extended with pointer to the original P1–P11 scope archive entry. Pre-edit version preserved at `/archive/2026-04-24_component-registry_pre-D3-edit.json`.
- `/INDEX.md` `/adopted/` key-contents row updated to reflect `.md` files archived; `.docx` companions flagged as pending founder decision. Pre-edit version preserved at `/archive/2026-04-24_INDEX_pre-D3-edit.md`.

**Confirmed no code read of the registry `path` field** — the component-registry `path` is display metadata only (no `readFile` or equivalent consumer). The update is cosmetic to the Ops context render; no functional behaviour change.

**Revisit condition:** If a future scope document is produced that describes forward V3 work (not already covered by P1–P16), it lives in `/adopted/` as a new file. The archived `_completed` files serve as the audit trail of what was done.

**Rules served:** R5 (cost-as-health — corpus clarity reduces cognitive overhead at session open). D6-A (archive protocol applied consistently). PR2 (verification immediate — moves, registry update, and INDEX update executed in the same session, verified by file listing and grep).

**Impact:** `/adopted/` cleaner — no longer carries completion records. Resolves D3 of the discrepancy-sort. Two `.docx` companion files (`V3_Adoption_Scope.docx`, `V3_Adoption_Scope_Addendum_P12-P19.docx`) remain in `/adopted/` as an open question — same archive/retain decision pending founder input.

**Status:** Adopted. Resolves D3 of discrepancy-sort-2026-04-23. `.docx` companions resolved under DD-2026-04-24-04 (same session).

---

## 2026-04-24 — DD-2026-04-24-04: V3 Adoption Scope `.docx` companions — delete or archive (D3-E follow-through)

**Decision:** Founder directive: *"delete docx if md equivalent exists, proceed."*

- `adopted/V3_Adoption_Scope.docx` (20,462 bytes) — `.md` equivalent present in archive (`/archive/2026-03-30_V3_Adoption_Scope_P1-P11_completed.md`) → **deleted**.
- `adopted/V3_Adoption_Scope_Addendum_P12-P19.docx` (27,262 bytes) — NO `.md` equivalent (archive holds P12–P16 revised; addendum covers P12–P19, content differs) → **archived** to `/archive/2026-03-31_V3_Adoption_Scope_Addendum_P12-P19_completed.docx`. Delete rule only applied where an `.md` twin existed; where it did not, the .docx was preserved under Option E's archive logic so the only copy of the P17–P19 content is not lost.

**Reasoning:** The two `.docx` files were initially listed as an outstanding micro-item under DD-2026-04-24-03 pending founder input. The founder's directive resolved the principle (delete duplicates, keep unique content). The addendum's `.docx` was not a duplicate of any retained `.md`, so the literal "delete" instruction was narrowed to the duplicate case and the unique file was archived per the folder's new posture (governance in `/adopted/`, historical completion records in `/archive/`).

**Alternatives considered:**
- Delete both `.docx` files — rejected; addendum's P17–P19 content exists only in the `.docx` and was never migrated to `.md`.
- Archive both `.docx` files (no deletion) — rejected; contradicts the founder's directive for the duplicate case and retains a redundant `.docx` in the corpus.
- Retain both in `/adopted/` — rejected; `/adopted/` is now reserved for currently-governing documents (established in DD-2026-04-24-03).

**Sandbox observation (limitation):** The initial `rm` on `adopted/V3_Adoption_Scope.docx` failed with `Operation not permitted` from the FUSE virtiofs mount layer. `mv` to `/tmp` and `chmod 644 && rm` also failed. Resolution: called the `allow_cowork_file_delete` permission tool on the file's VM path, which enabled delete for the `sagereasoning` folder. `rm` then succeeded. This is a standing observation about the sandbox: deletions require an explicit permission grant per folder. First occurrence of this limitation in this project — **logged as candidate KG entry if it recurs** (PR5 — third recurrence triggers a knowledge-gaps.md entry).

**Cross-reference updates executed this session:**
- `/operations/discrepancy-sort-2026-04-23.md` D3 entry extended with execution notes for the `.docx` handling and the sandbox observation.
- `/INDEX.md` `/adopted/` key-contents row will be updated to reflect the now-empty state (deferred to the same task set).

**Revisit condition:** If a future `.docx` needs to be handled in `/adopted/` or elsewhere, prefer creating an `.md` twin first, then archiving/deleting per the same rule. If sandbox deletion permission is not carried forward across sessions, request `allow_cowork_file_delete` at the start of any session that needs a delete.

**Rules served:** D6-A (archive, don't silently lose; addendum archived under mtime date). PR2 (verification immediate — final `/adopted/` listing shows only the `backup/` placeholder remaining; both archive entries confirmed by `ls -la`). PR7 (deferred decision — outstanding micro-item from DD-2026-04-24-03 — now resolved and documented).

**Impact:** `/adopted/` is now empty of governing files. D3 of discrepancy-sort-2026-04-23 is fully closed (no remaining micro-items). Sandbox permission observation captured for future reference.

**Status:** Adopted. Closes out the `.docx` micro-item noted in DD-2026-04-24-03.

---

## 2026-04-24 — DD-2026-04-24-05: INDEX trimmed to governance-only scope (D4-D)

**Decision:** `/INDEX.md` is rewritten to a governance-navigator role: it tells you where governing documents, the archive protocol, and the handoff structure live. It no longer tracks project-state or code-directory status. Those live in `PROJECT_STATE.md`, `summary-tech-guide.md` + addendum, and the ecosystem map.

**Reasoning:** INDEX has drifted at least twice in recent weeks (Apr 11 → Apr 23 → Apr 24). The drift pattern is structural: INDEX was trying to carry project-state metadata (website status, code-directory status, operational-directory status) that changes faster than INDEX gets updated. A plain refresh (Option A) would have accepted the drift pattern and bought 2–3 weeks before the next stale-claims sort. Option D changes INDEX's scope so the drift surface is dramatically reduced — governance documents change much less often than project/technical state.

**Alternatives considered:**
- Option A (minimum-viable refresh — fix only the factually wrong claims, keep shape). Rejected because it addresses the symptom (stale claims) not the pattern (drift). Staleness would recur.
- Option B (trim to governance-only — same as D without the explicit backlog item). Equivalent in execution; D names the backlog explicitly.
- Option C (auto-generate INDEX from a file-tree scan). Deferred under PR7 as the structural long-term answer. Not chosen now because (a) descriptions would still need manual curation, making it a 70%-auto/30%-manual hybrid; (b) build cost is 1–2 sessions; (c) we don't yet know whether the trimmed INDEX itself will drift. Watch first, then build if needed.

**Revisit condition (PR7):** If the trimmed INDEX is found stale by more than one claim in any session opening during the next 4–6 weeks, build Option C (auto-generation). If no drift is observed over that period, the trim is the stable answer.

**Execution this session:**
- `/INDEX.md` rewritten. Kept sections: Inbox/Outbox, Governance Files, Governance Corpus Folders, Archive Protocol, Handoff Structure, Quick Reference.
- Removed sections: Root Files status table, detailed folder descriptions for business/marketing/product/engineering/prototypes/brand/templates/manuals, Code Directories status table, Operational Directories status table.
- Added "What moved out of INDEX in the D4-D trim" section so the next session can see the diff at a glance without opening the archive.
- Pre-edit version preserved at `/archive/2026-04-24_INDEX_pre-D4-trim.md` (prior pre-edit archives also retained: `2026-04-11_INDEX.md`, `2026-04-24_INDEX_pre-D3-edit.md`, `2026-04-24_INDEX_pre-D3-docx-followthrough.md`).
- `/operations/discrepancy-sort-2026-04-23.md` D4 entry updated with resolution marker and Summary-table status. Pre-edit archive at `/archive/2026-04-24_discrepancy-sort_pre-D4-resolution.md`.

**Rules served:** R5 (cost-as-health — reduces cognitive overhead and drift cost at every session opening). D6-A (archive protocol applied; pre-edit versions of INDEX and discrepancy-sort preserved). PR2 (verification immediate — new INDEX read-back, cross-reference updates executed in the same session). PR7 (deferred decision — Option C auto-generation documented as a backlog item with an explicit revisit condition).

**Impact:**
- INDEX is now ~3 KB lighter of status metadata that was drifting. Its surface area for drift is reduced to governance-corpus structure, which changes infrequently.
- Session Opening Protocol (Track B, drafted next this session) can now point at a stable INDEX for "where governance lives" and at `PROJECT_STATE.md` / tech-guide for "what's current."
- All Material discrepancies (D1, D3, D4, D6, D7) are now resolved. D17 (the protocol draft itself) remains as this session's Track B. Remaining open items are Notable (D5, D8, D10–D12, D14–D16) and Minor (D9, D13).

**Status:** Adopted. Resolves D4 of discrepancy-sort-2026-04-23.
