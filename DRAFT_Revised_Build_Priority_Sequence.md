# SageReasoning — Revised Build Priority Sequence

**Draft Date:** 6 April 2026 (v4 — Final)
**Status:** For founder review and adoption
**Supersedes:** Build Priority Sequence in DRAFT_Project_Instructions.md (5 April 2026)
**Governing Document:** manifest.md (CR-2026-Q2-v4, reviewed 5 April 2026)

---

## Why This Revision

The manifest expanded from R1–R14 to R0–R20. The original five-step priority sequence did not account for these new obligations, and it also lacked something more fundamental: it assumed the founder and AI collaborator could already work together effectively, and that the product set was finalised. Neither is true.

R0's exemption clause — "This rule does not apply to the time or iterations it takes during the pre-launch period of the project given the lack of experience of the founder and the complexity of the undertaking" — defines a distinct phase. Priority 0 is that phase: the R&D period where the founder and AI collaborator build shared infrastructure, communication patterns, and product artefacts, then test everything on themselves before committing to the business plan and launch sequence.

There is a wider context. Cowork launched in January 2026. A non-technical founder is using an AI collaboration tool that didn't exist six months ago to build a startup from scratch. The challenges encountered in P0 — session continuity, shared vocabulary, verification without code literacy, scope management — are not unique to SageReasoning. They are the challenges any regular person faces when using AI collaboration to build something complex. The tools and workflows that emerge from P0 should reflect this: what does a non-technical founder actually need to reach a solid foundation? That question shapes both the P0 hold point and the product scope that follows it.

---

## Current State Summary

| Original Priority | Status |
|---|---|
| 1. Business plan review and investment case validation | In progress — ethical analysis complete, pricing deployed, break-even analysis built, business plan rebuilt. Investment case review still pending. |
| 2. Agent Trust Layer — Supabase integration, batch assessment endpoint, LLM wiring | Designed — schema exists, types defined, authority manager coded. Core endpoints and LLM evaluation wiring not yet built. |
| 3. Stripe integration and metered billing | Not started. |
| 4. MVP launch | Blocked by items 1–3 plus new manifest obligations. |
| 5. Sage Ops pipeline activation | Designed — R15/R16 boundaries defined, persona architecture exists. Post-launch. |

| New Manifest Rule | Status |
|---|---|
| R0 (Oikeiosis Principle) | Not operationalised. Data extraction exists in journal pipeline but not integrated into decision-making or mentor prompts. |
| R5 amendment (cost-as-health alerts, Ops cap) | API tier enforcement built. Cost health alerts and $100/month Ops cap not enforced in code. |
| R14 amendment (Layer 0 context sync) | Described in manifest. Not implemented as a scheduled process. |
| R17 (Intimate Data Protection) | Designed. Encryption utility built but not wired into profile storage. Genuine deletion placeholder (503). No API-level bulk profiling prevention. |
| R18 (Honest Certification Limits) | Designed. Methodology and transparency pages exist. No badge component, no adversarial testing, no interoperability review. |
| R19 (Honest Positioning) | Partially implemented. Website language is qualified. No dedicated limitations page. Mirror principle not in mentor prompts. |
| R20 (Active Protection) | Designed. Authority manager enforces override supremacy structurally. No vulnerable user detection, no dependence detection, no relationship asymmetry guidance in prompts. |

---

## Revised Build Priority Sequence

---

### Priority 0: Foundations (R&D Phase)

**Governing principle:** R0 exemption — the pre-launch period exists because the founder has no coding experience and the undertaking is complex. P0 is not preparation instead of action. P0 is the work of learning to work together, building what's needed, and testing what we've got — so that everything from P1 onward is grounded in evidence, not assumption.

**P0 does not prohibit product building.** If the right solution to a P0 problem is a product artefact (a skill, a tool, an endpoint), build it. The test is: does this make what follows simpler for both of us? The founder manages scope; the AI trusts that judgement.

**P0 has two phases:** establishing how we work (0a–0g), and testing what we've built (0h — the hold point). Both are necessary before P1.

---

#### 0a. Shared Status Vocabulary

**The problem:** "Built" and "designed" mean different things to each party. This misalignment multiplied across 20+ rules and dozens of modules generates confusion that scales with the project.

**The fix:** A small set of status terms with clear definitions:

| Status | Meaning |
|---|---|
| **Scoped** | Requirements defined, no architecture or code yet |
| **Designed** | Architecture decided, schema/types may exist, no functional code |
| **Scaffolded** | Structural code exists (files, interfaces, placeholders) but doesn't do anything yet |
| **Wired** | Code connects to live systems (database, API, LLM) and functions end-to-end |
| **Verified** | Tested and confirmed working by both parties |
| **Live** | Deployed to production and serving real users/agents |

**Deliverable:** Adopted vocabulary added to project instructions.

---

#### 0b. Session Continuity Protocol

**The problem:** Every new session starts cold. The AI re-reads thousands of lines; the founder re-explains context. This wastes the opening of every session.

**The fix:** A lightweight session close/open protocol. At the end of each session, produce a structured handoff note. At the start of the next, the AI reads the handoff first and full reference documents only when needed.

**Format:**

```
# Session Close — [Date]
## Decisions Made
- [Decision]: [Reasoning] → [Impact on build]
## Status Changes
- [Module/Rule]: [Old status] → [New status]
## Next Session Should
- [First thing to do]
- [Second thing to do]
## Blocked On
- [What's waiting for what]
## Open Questions
- [Unresolved items needing founder input]
```

**This could become a product artefact.** A sage-stenographer skill that automates session capture would serve any AI-assisted R&D workflow, not just this project. Build as a skill after the manual version proves the pattern over 3–5 sessions.

**Deliverable:** First handoff note produced at the end of this session. Manual process tested before automating.

---

#### 0c. Verification Framework

**The problem:** The founder can't read TypeScript. The AI can't persist between sessions. Neither can confirm the other's work without a shared method.

**The fix:** For each type of work, define what "verified" looks like in terms the founder can perform:

| Work Type | Founder Verification Method |
|---|---|
| Website page | Open the URL, check content matches specification |
| API endpoint | AI provides a test command with expected output; founder runs it |
| Database change | AI queries and shows result; founder confirms |
| Governance implementation | AI produces checklist of requirements vs what's in place; founder reviews |
| Business document | Founder reads directly |
| Manifest change | Founder reads and approves rule text |

For the AI: at the start of any session continuing previous work, run a verification check rather than trusting prior output.

**Deliverable:** Verification methods documented. First use on a real build item during P0.

---

#### 0d. Communication Signals

**The problem:** "Build X" might mean design, code, explore, or execute. The AI's recommendations don't signal confidence level.

**The fix:** Lightweight signals both parties use:

**Founder signals:**

| Signal | Meaning |
|---|---|
| "Explore this" | Think about it, present options, don't build yet |
| "Design this" | Produce architecture/specification, don't write code yet |
| "Build this" | Write functional code, wire it up, make it work |
| "Ship this" | Deploy to production |
| "I've decided" | Decision is final, execute without re-debating |
| "I'm thinking out loud" | Don't act on this; I'm processing |

**AI signals:**

| Signal | Meaning |
|---|---|
| "I'm confident" | Verified and reliable |
| "I'm making an assumption" | Proceeding on incomplete information — correct me if wrong |
| "I need your input" | Can't proceed without a decision from you |
| "I'd push back on this" | I think there's a better approach and want to explain why |
| "This is a limitation" | I can't do this / outside what I can verify |

**Deliverable:** Signals adopted by both parties. Tested during P0 sessions.

---

#### 0e. File Organisation and Navigation

**The problem:** 50+ files across multiple directories. Some superseded but not marked. Neither party can reliably find the current version of a document.

**The fix:** Clear folder structure with a simple index:

- `/adopted/` — Current, governing documents (manifest, project instructions, adopted strategies)
- `/drafts/` — Documents under review
- `/archive/` — Superseded versions (moved here, not deleted)
- `/business/` — Business plan, break-even, investment case, pricing, growth strategy
- `/compliance/` — Register, audit log, compliance reviews
- `/reference/` — Knowledge Context Summary, ethical analysis, journal interpretations
- `/website/` — Remains as is
- `/out/` — Remains as is

Plus `INDEX.md` at root: one line per key document with location, status, and date.

**Deliverable:** Folder restructure and INDEX.md created.

---

#### 0f. Decision Log

**The problem:** Consequential decisions are scattered across conversations, documents, and memory. Reconstructing why a decision was made requires searching multiple files.

**The fix:** A single, append-only decision log:

```
## [Date] — [Decision Title]
**Decision:** [What was decided]
**Reasoning:** [Why — including alternatives considered]
**Rules served:** [R#, R#]
**Impact:** [What changes as a result]
**Status:** [Adopted / Under review / Superseded by [ref]]
```

This becomes the R0 oikeiosis audit trail when R0 is operationalised in P5.

**Deliverable:** Decision log created. Backdated with key decisions already made. Updated at each session close.

---

#### 0g. Workflow Skills (Build When They Earn Their Place)

**The principle:** Some P0 problems are best solved by building a tool. The test: does building this now save more time than it costs, and does it have value beyond P0?

**First candidate:** sage-stenographer — automates session capture into structured handoff notes. Build after the manual protocol from 0b proves its pattern.

**Other candidates will emerge during P0.** The founder decides which get built and when. The AI flags when a recurring manual process could be automated and estimates the cost vs time saved.

**Limitation:** Manual process first, prove the pattern, then build. Automating an unproven process locks in the wrong pattern.

---

#### 0h. Hold Point — Startup Preparation Assessment

**Why this exists:** Everything from P1 onward depends on assumptions about what we've built, what it can do, and what value it delivers. Those assumptions have not been tested. The hold point is where we stop, examine the project's actual capabilities, and arrive at P1 with evidence instead of projections.

**The wider frame:** A non-technical founder using AI collaboration to build a startup needs specific capabilities to reach a solid foundation. Those capabilities are not all product features — some are workflows, communication patterns, decision-making tools, and operational infrastructure. The hold point assesses what a regular person actually needs in this situation and whether we have it.

**What happens at the hold point:**

**Assessment 1: What works?**
Test every component by using it on ourselves with real data — not test data. The founder's own journal, decisions, and workflow.

- Run journal ingestion against the founder's actual external journal. Does it produce a useful MentorProfile?
- Use the session bridge in a real working session. Does observer mode capture value? Does sage-consult give useful feedback?
- Run the evaluation sequence against real decisions from the decision log. Do proximity assessments feel accurate? Are passion diagnoses recognisable?
- Use the support agent pipeline with realistic enquiries. Does the ring pattern add value or just overhead?
- Test human-facing tools on sagereasoning.com as a real user would. Score an action. Complete a journal day. Run a scenario.

**Assessment 2: What's missing?**
After testing, identify practical gaps — not from reading the manifest, but from trying to use the thing. What did we need that didn't exist? What existed but didn't work? What worked but wasn't useful?

Critically, assess from the perspective of a non-technical startup founder: what capabilities does a regular person need to go from "I have an idea and an AI collaborator" to "I have a solid foundation for a business"? This includes capabilities that may not be in the current product scope at all — things we discovered we needed during P0 that other founders would need too.

**Assessment 3: What value can we demonstrate?**
Can we show, concretely, what SageReasoning does for a human practitioner and what it does for an agent developer? Not in a pitch deck — in a live demonstration using real data. If we can't demonstrate the value proposition to ourselves, we can't demonstrate it to anyone.

**Assessment 4: Capability inventory**
Produce a clear-eyed catalogue of every component, its true status (using the 0a vocabulary), and its readiness for each audience (human users, agent developers, startup founders using AI collaboration). This is the factual foundation for the business plan review.

**Assessment 5: Startup foundation toolkit**
Based on Assessments 1–4, identify the minimum set of tools and workflows that would give a non-technical founder a solid foundation. This is where P0's wider relevance becomes concrete: the challenges we solved for ourselves — session continuity, verification, decision tracking, status alignment, scope governance — are challenges every AI-assisted startup faces. The tools and skills that emerged from P0 (sage-stenographer and whatever else earned its place) form a startup preparation group.

At this point, determine: what's missing from that group? What needs to be added to make the toolkit genuinely useful for a founder who is not us? Build what's needed — P0 does not prohibit product building — and then design the simplest possible human interface to make it accessible. Not a feature-rich platform. The most simple interface that lets a regular person use these capabilities without needing to understand what's behind them.

**What this changes about P1:**
The business plan review becomes evidence-based. The investment case is grounded in demonstrated capabilities, observed costs, identified gaps, and a tested value proposition — not architectural projections. The startup preparation toolkit also becomes part of the product offering: SageReasoning doesn't just serve human practitioners and agent developers, it serves the process of building something principled from nothing.

**Hold point exit criteria:**

1. Every component claimed as "wired" or above has been tested by the founder using real data
2. A capability inventory exists with honest status assessments
3. Gaps identified during testing are documented with severity (blocker / significant / minor / cosmetic)
4. The value proposition has been demonstrated end-to-end on at least one real use case per audience
5. The startup preparation toolkit is defined: what a non-technical founder needs, what we have, what we need to add
6. Any additions identified in criterion 5 are built and given the simplest viable human interface
7. The founder has a clear view of what the business plan review is evaluating — a tested product group, not a projected one

**Hold point limitations:**

1. **This is not a launch readiness review.** The product is not expected to be launch-ready. The purpose is to assess what we have, not certify it as complete. Gaps are expected and useful.

2. **Testing may reveal that P1–P7 need reordering.** If the hold point shows a capability is broken or something unplanned is essential, the sequence should be revised. The sequence serves the project.

3. **Testing may reveal product scope changes.** P0 is the R&D phase — this is when scope should be informed by evidence. The hold point is the structured moment for that.

4. **"Simplest possible interface" means simplest possible.** The startup preparation toolkit should not become a platform build. The interface should be the minimum needed for a regular person to use the capabilities. If that's a single page with clear labels, that's enough. Complexity is added post-launch based on real user feedback, not pre-launch based on imagination.

5. **The hold point is not a gate the AI controls.** The founder decides when the criteria are met and when to proceed to P1. The AI facilitates the assessments honestly, including surfacing findings the founder might not want to hear.

---

#### P0 Exit Criteria

P0 is complete when:

1. Both parties can name the status of any module or rule using the shared vocabulary, and agree
2. Session handoff notes are being produced and used
3. The founder can verify a build item without reading code
4. Communication signals are in use and reducing misunderstandings
5. Files are organised and the INDEX.md is current
6. The decision log exists and is being maintained
7. The hold point assessment is complete: capabilities tested, gaps documented, value demonstrated, startup preparation toolkit defined and built with its simplest viable interface

P0 is not time-bounded by a calendar date — it's bounded by these conditions.

---

#### P0 Limitations

1. **P0 is not a permission to delay indefinitely.** The R0 exemption covers the learning curve, not permanent preparation. Items 0a–0g should be adopted as fast as they can be tested. The hold point should happen as soon as the working protocols are functional enough to conduct it.

2. **Workflow skills must earn their place.** Manual process first, prove the pattern, then build.

3. **P0 does not replace the manifest.** P0 protocols govern how we work together. The manifest governs what we build and how it behaves.

4. **The hold point may change the plan.** That's the point.

---

### Priority 1: Business Plan Review Completion

**Inputs from P0:**
- Capability inventory (0h, Assessment 4) — what we actually have vs what we projected
- Gap analysis (0h, Assessment 2) — what's missing and how significant
- Value demonstration (0h, Assessment 3) — proven, not hypothetical
- Startup preparation toolkit (0h, Assessment 5) — an additional product dimension grounded in our own experience
- Decision log (0f) — the reasoning trail for every major decision to date
- Cost data from testing — actual LLM costs observed during P0, not projections

**What remains:** Integrate P0 evidence into the break-even analysis and investment case. Complete the founder's deliberate choice exercise: which assumptions are principled analysis, which are appetite or fear. Evaluate whether the startup preparation toolkit represents an additional market or a distraction.

**Manifest rules served:** R0 (deliberate choice exercise), R5 (cost projections grounded in observed costs).

**Limitation:** This step cannot be delegated. The founder makes the final judgement on the investment case.

**Exit criterion:** Founder affirms or rejects the investment case with documented reasoning in the decision log.

---

### Priority 2: Ethical Safeguards (R17, R19, R20)

**Why this moves ahead of the Agent Trust Layer:** The ethical analysis states these protections "are not optional" and must be in place before broad deployment. The hold point may refine which items are most urgent based on testing.

**Build items:**

**2a. Vulnerable user detection and redirection (R20a) — CRITICAL**
Implement language pattern detection in all human-facing tools for indicators of acute psychological distress. Build a redirection protocol to appropriate professional support resources.

**2b. Bulk profiling prevention (R17a) — CRITICAL**
Add technical measures at the API layer that distinguish self-evaluation from third-party evaluation.

**2c. Wire application-level encryption for intimate data (R17b)**
Connect encryption.ts to mentor profile storage pipeline.

**2d. Genuine deletion endpoint (R17c)**
Replace the 503 placeholder at /api/user/delete with working implementation.

**2e. Honest positioning — limitations page and mirror principle (R19c, R19d)**
Create user-facing limitations page. Add mirror principle to mentor prompts. Audit website copy for universality claims.

**2f. Relationship asymmetry guidance (R20d)**
Add guidance to mentor persona discouraging interpersonal application of the passion taxonomy.

**2g. Independence encouragement (R20b)**
Implement usage pattern detection for framework dependence with mentor coaching response.

**Limitation:** 2a and 2b require architecture decisions before coding. Produce ADRs before implementation. Also produce an ADR for the local-first storage question (R17d) before building 2c and 2d.

**Exit criterion:** All human-facing tools include distress detection. API enforces profiling prevention. Intimate data encrypted. Users can delete complete profiles. Limitations page live. Mentor prompts include mirror principle and relationship asymmetry guidance.

---

### Priority 3: Agent Trust Layer — Honest Certification (R18 + existing ATL build)

**3a.** Certification scope language and badge component (R18a, R18b).
**3b.** Supabase integration, assessment endpoints, LLM wiring (existing ATL scope).
**3c.** Interoperability architecture (R18c).
**3d.** Adversarial evaluation protocol (R18d).

**Limitation:** 3d requires 3b running first. Sequence: 3a → 3b → 3c → 3d. Batch assessment endpoint must comply with R17a. Adversarial testing should ideally involve external review.

**Exit criterion:** Badge deployed with scope language. ATL endpoints live with honest disclosures. Schema documented as interoperable. Adversarial evaluation completed with findings incorporated.

---

### Priority 4: Stripe Integration and Metered Billing

Competitor-anchored pricing deployed; this wires up payment processing. Implement R5 cost-as-health-metric alerts alongside Stripe.

**Exit criterion:** Stripe handles paid-tier billing. Cost health alerts operational. Revenue-to-cost ratio tracked against 2x threshold.

---

### Priority 5: R0 Operationalisation

The oikeiosis sequence becomes a live decision-making tool. The P0 decision log transitions into a permanent audit trail.

**5a.** Integrate oikeiosis sequence into mentor daily reflection prompts.
**5b.** Formalise the decision log into the oikeiosis audit trail.
**5c.** Wire journal pipeline oikeiosis data into progression assessment.

**Exit criterion:** Mentor prompts include oikeiosis reflection. Audit trail active. Journal oikeiosis data feeding progression.

---

### Priority 6: MVP Launch

**Launch criteria (original 6 + 5 from manifest amendments):**

1. sage-reason API accepts external calls with metering
2. Stripe integration handles paid-tier billing
3. At least 3 human-facing tools live on sagereasoning.com
4. llms.txt and agent-card.json serving agent discovery
5. Privacy policy and terms of service lawyer-reviewed
6. Business plan review complete, investment case affirmed
7. R17 intimate data protections operational
8. R18 honest certification language on all public-facing materials
9. R19 limitations page live, mirror principle in mentor prompts
10. R20 vulnerable user detection and redirection operational
11. R5 cost health alerts active

**Limitation:** Legal review (criterion 5) is critical path. Begin lawyer engagement during P2 or P3.

---

### Priority 7: Sage Ops Pipeline Activation (Post-Launch)

**Governed by R15 and R16.**

**7a.** Activate Sage Ops at supervised level.
**7b.** Enforce R5 $100/month Ops cost cap.
**7c.** Implement Layer 0 context sync (R14 amendment, next due 6 July 2026).
**7d.** Intelligence pipeline data governance (R16).

**Exit criterion:** Sage Ops operational at supervised level. Cost cap enforced. First Layer 0 sync completed. Pipeline compliant with R16.

---

## Summary

| # | Priority | Purpose |
|---|---|---|
| **0** | **Foundations (R&D Phase)** | **Communication, continuity, verification, product testing — build what's needed, test what we've got** |
| **0h** | **Hold Point — Startup Preparation** | **Test everything on ourselves. What works? What's missing? What value can we demonstrate? Define the startup preparation toolkit and build its simplest interface.** |
| 1 | Business plan review | Evidence-based deliberate choice exercise, informed by P0 testing |
| 2 | Ethical safeguards (R17, R19, R20) | Protections the ethical analysis says are not optional |
| 3 | Agent Trust Layer + honest certification (R18) | SageReasoning's unique contribution, built with honesty baked in |
| 4 | Stripe integration + cost health alerts (R5) | Revenue infrastructure and cost monitoring |
| 5 | R0 operationalisation | Oikeiosis becomes a live decision tool |
| 6 | MVP launch (expanded criteria) | 11 criteria: original 6 + 5 from manifest amendments |
| 7 | Sage Ops activation (R15, R16, R14 amendment) | Post-launch operational intelligence |

---

## Cross-Cutting Limitations

1. **P0 overlaps internally but 0h is a hard hold.** Items 0a–0g can be worked progressively. The hold point (0h) is a deliberate pause. P1 does not begin until 0h is complete.

2. **The hold point may change everything after it.** That's the point.

3. **Architecture decisions before code for R17a and R20a.** These require design decisions with significant downstream consequences.

4. **Legal review on the critical path.** Begin lawyer engagement no later than P3.

5. **Adversarial testing ideally needs external review.** If not feasible pre-launch, document as known limitation.

6. **R0 exemption is not a blank cheque.** The exemption covers learning-curve iterations, not indefinite delay.

7. **Workflow skills must earn their place through manual testing first.**

8. **The startup preparation toolkit interface must be the simplest viable.** Complexity is added post-launch based on real feedback, not pre-launch based on imagination.

---

*This draft is for founder review. Adopt by copying the revised sequence into project instructions and updating the manifest's build priority reference.*
