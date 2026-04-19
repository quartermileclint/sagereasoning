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
