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
