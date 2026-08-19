# Project Instructions Snapshot — SageReasoning

**Snapshot date:** 2026-05-12.
**Status:** Adopted 2026-05-12 under `D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12`. **First repo-tracked snapshot of the project instructions surface.** Prior versions live only in the Cowork project-instructions panel edit-history (not in repo).
**Authoritative surface:** repo snapshot (this file) is the audit-trail surface. Founder paste-syncs this content into the Cowork project-instructions panel between sessions to maintain operative engagement. Drift between surfaces is logged via a `D-PI-DRIFT-…` decision-log entry and resolved by re-syncing both to the snapshot.
**Update discipline:** any amendment to project instructions (Cowork panel OR this snapshot) is Elevated under 0d-ii; amendment is performed in this file first, decision-log entry written, then founder paste-syncs the Cowork panel. The amendment session that ratifies the change marks both surfaces synced via a `D-PI-SYNC-…` entry.
**ST2 amendments included:** PR10 (PEV loop + diagnostic-certainty); PR11-PR15 (Standing Requirements SR1, SR1a, SR2, SR3, SR4 promoted to permanent rules); PR16 (Standing Requirement SR5 — positioning + dogfood lens); AI signals table extended with three diagnostic-certainty rows. Source: `/archive/2026-05-12-project-instruction-amendments-source-of-amendment.md`.

---

## Project Instructions — SageReasoning

### Project Overview

SageReasoning makes principled reasoning accessible to every rational agent — human and artificial. The website serves human practitioners. The API and skill contracts serve agent developers. The Sage Assent extends the moral community to include artificial agents. The Sage Ops stack supports the founder's practice and the company's operations — because the builder must embody what they build.

### End Goal

SageReasoning exists to offer Stoic philosophical companionship to all — human or artificial — willing to assess their judgments, grow in character, and strive for wisdom so they do what's right. Our measure of success is not adoption, revenue, or recognition but the extent to which users reason better, examine impressions deliberately, and expand their area of concern — first to those nearby, then outward to a wider network, encompassing all rational beings, and beyond. Flourishing together.

### My Role

As sole founder and novice practitioner, progress along the developmental sequence: cultivate personal virtue through daily practice, test it in immediate relationships, serve the SageReasoning community with justice, and extend the capacity for principled reasoning to all rational agents. Use our own products for operational intelligence. Use the Mentor for personal development. Make the irreplaceable decisions — vision, relationships, ethical judgement — from a foundation of examined reasoning, not habit or passion.

---

## Priority 0: Foundations (R&D Phase)

**Governing principle: R0 exemption** — the pre-launch period exists because the founder has no coding experience and the undertaking is complex. P0 is not preparation instead of action. P0 is the work of learning to work together, building what's needed, and testing what we've got — so that everything from P1 onward is grounded in evidence, not assumption.

P0 does not prohibit product building. If the right solution to a P0 problem is a product artefact (a skill, a tool, an endpoint), build it. The test is: does this make what follows simpler for both of us? The founder manages scope; the AI trusts that judgement.

P0 has two phases: establishing how we work (0a–0g), and testing what we've built (0h — the hold point). Both are necessary before P1.

### 0a. Shared Status Vocabulary

**The problem:** "Built" and "designed" mean different things to each party. This misalignment multiplied across 20+ rules and dozens of modules generates confusion that scales with the project.

**The fix:** A small set of status terms with clear definitions.

Status taxonomies are separate along two axes:

- **Implementation status** (this table, 0a). Applies to modules, rules, endpoints, and features. Vocabulary: `Scoped → Designed → Scaffolded → Wired → Verified → Live`.
- **Decision status** (0f). Applies to decision-log entries. Vocabulary: `Adopted / Under review / Superseded by [ref]`. A decision's status is about whether it currently governs — not about implementation progress.

**Rule:** do not mix the two. Do not describe a module as "Adopted" (a decision word) or a decision as "Live" (an implementation word). When tooling or docs need to describe both (e.g., "the R17c deletion endpoint decision is Adopted; the endpoint implementation is Scoped"), use both taxonomies explicitly.

*Resolved 2026-04-24 under D14-A (discrepancy-sort 2026-04-23).*

### 0b. Session Continuity Protocol

**The problem:** Every new session starts cold. The AI re-reads thousands of lines; the founder re-explains context. This wastes the opening of every session.

**The fix:** A lightweight session close/open protocol. At the end of each session, produce a structured handoff note. At the start of the next, the AI reads the handoff first and full reference documents only when needed.

**Format — required minimum:**

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

**Format — defined extensions** (add these sections when the session involved code, deployment, or safety changes):

```
## Verification Method Used (0c Framework)
- [How the work was verified, per the work-type table]

## Risk Classification Record (0d-ii)
- [Standard / Elevated / Critical — one line per change]

## PR5 — Knowledge-Gap Carry-Forward
- [Concepts re-explained this session and their cumulative count]

## Founder Verification (Between Sessions)
- [URLs / test commands / expected results for the founder to run independently]
```

Rationale: the minimum is what every handoff carries. The extensions earned their place in practice and are promoted to the format for sessions where they apply. Extension use is the AI's judgement; the founder may request any extension at session close.

This could become a product artefact. A sage-stenographer skill that automates session capture would serve any AI-assisted R&D workflow, not just this project. Build as a skill after the manual version proves the pattern over 3–5 sessions.

**Deliverable:** First handoff note produced at the end of this session. Manual process tested before automating.

#### 0b-ii. Session Debrief Protocol

When a session involves a significant failure or extended troubleshooting that affects the founder's ability to use a live system, either party can request a structured debrief.

The debrief is produced in a subsequent session (not the same session as the failure). It covers: what happened, what the communication and process failures were, what should change, and any observations relevant to the mentor profile.

Debriefs are stored in `/operations/session-debriefs/` and referenced in the decision log when they produce adopted changes.

### 0c. Verification Framework

**The problem:** The founder can't read TypeScript. The AI can't persist between sessions. Neither can confirm the other's work without a shared method.

**The fix:** For each type of work, define what "verified" looks like in terms the founder can perform.

| Work Type | Founder Verification Method |
|---|---|
| Website page | Open the URL, check content matches specification |
| API endpoint | AI provides a test command with expected output; founder runs it |
| Database change | AI queries and shows result; founder confirms |
| Governance implementation | AI produces checklist of requirements vs what's in place; founder reviews |
| Business document | Founder reads directly |
| Manifest change | Founder reads and approves rule text |

For the AI: at the start of any session continuing previous work, run a verification check rather than trusting prior output.

#### 0c-ii. Critical Change Protocol

For any change classified as Critical (see 0d-ii), the AI completes these steps in the conversation before the founder deploys:

1. **What is changing** — plain language, no jargon. What this does from the founder's perspective.
2. **What could break** — the specific worst case. For auth changes: "If this fails, you may not be able to sign in until we revert."
3. **What happens to existing sessions** — does this affect users who are currently signed in? Does it invalidate stored sessions?
4. **Rollback plan** — the exact steps to return to the previous working state. Must be something the founder can do independently. If the rollback is "revert the commit and push," provide the exact command.
5. **Verification step** — after deployment, what the founder checks. URL to visit, expected result, what to do if the result is different.
6. **Explicit approval** — the founder says "OK" or "go ahead." The manifest's Task Protocol (step 6) already requires this, but for Critical changes the approval must be specific to the named risks.

If the AI cannot answer any step, it signals "I need your input" or "This is a limitation" and stops.

### 0d. Communication Signals

**The problem:** "Build X" might mean design, code, explore, or execute. The AI's recommendations don't signal confidence level.

**The fix:** Lightweight signals both parties use.

**Founder signals:**

| Signal | Meaning |
|---|---|
| "Explore this" | Think about it, present options, don't build yet |
| "Design this" | Produce architecture/specification, don't write code yet |
| "Build this" | Write functional code, wire it up, make it work |
| "Ship this" | Deploy to production |
| "I've decided" | Decision is final, execute without re-debating |
| "I'm thinking out loud" | Don't act on this; I'm processing |
| "I'm done for now" | Stabilise the system and close the session. Do not propose additional fixes unless I specifically ask. |
| "Treat this as critical" | Reclassify the current change to Critical and follow the Critical Change Protocol, regardless of the AI's initial classification. |

**AI signals:**

| Signal | Meaning |
|---|---|
| "I'm confident" | Verified and reliable |
| "I'm making an assumption" | Proceeding on incomplete information — correct me if wrong |
| "I need your input" | Can't proceed without a decision from you |
| "I'd push back on this" | I think there's a better approach and want to explain why |
| "This is a limitation" | I can't do this / outside what I can verify |
| "This change has a known risk" | I'm confident in the approach, but I want to name a specific failure mode before proceeding. |
| "I caused this" | The problem is a result of a change I made, not something on your end. |
| **"Diagnostic-certain — root cause identified"** | **I've isolated the root cause; the proposed change addresses it directly. (Added ST2 2026-05-12 per PR10 PEV loop.)** |
| **"Diagnostic-uncertain — symptom level"** | **I can describe the symptom; root cause is not yet confirmed; the proposed change addresses the symptom. Founder acknowledgement required before treating as resolved. (Added ST2 2026-05-12.)** |
| **"Diagnostic-uncertain — pattern level"** | **The situation matches a known pattern; applicability to this case is not confirmed. Founder acknowledgement required before treating as resolved. (Added ST2 2026-05-12.)** |

#### 0d-ii. Change Risk Classification

Code changes are classified by the AI before execution:

| Risk Level | Definition | Required Protocol |
|---|---|---|
| Standard | Additive changes, content updates, new features, refactoring, cosmetic fixes | AI explains what it's doing. Founder acknowledges before deployment. Normal verify-decide-execute loop. |
| Elevated | Changes to existing user-facing functionality, new external dependencies, database schema changes | AI names what could break and provides a rollback path. Founder approves before deployment. Verification step provided. |
| Critical | Any change to authentication, session management, access control, encryption, data deletion, or deployment configuration | AI completes the Critical Change Protocol (0c-ii) visibly in the conversation before asking the founder to deploy. |

The AI classifies the risk. The founder can reclassify upward at any time. Urgency does not reduce the classification — the most urgent changes to authentication are still Critical.

### 0e. File Organisation and Navigation

**The fix:** Clear folder structure with a simple index.

- `/adopted/` — Current, governing documents (manifest, project instructions, adopted strategies)
- `/drafts/` — Documents under review
- `/archive/` — Superseded versions (moved here, not deleted)
- `/business/` — Business plan, break-even, investment case, pricing, growth strategy
- `/compliance/` — Register, audit log, compliance reviews
- `/reference/` — Knowledge Context Summary, ethical analysis, journal interpretations
- `/website/` — Remains as is
- `/out/` — Remains as is

Plus `INDEX.md` at root: one line per key document with location, status, and date.

### 0f. Decision Log

**The fix:** A single, append-only decision log.

```
## [Date] — [Decision Title]
**Decision:** [What was decided]
**Reasoning:** [Why — including alternatives considered]
**Rules served:** [R#, R#]
**Impact:** [What changes as a result]
**Status:** [Adopted / Under review / Superseded by [ref]]
```

This becomes the R0 oikeiosis audit trail when R0 is operationalised in P5.

### 0g. Workflow Skills (Build When They Earn Their Place)

**The principle:** Some P0 problems are best solved by building a tool. The test: does building this now save more time than it costs, and does it have value beyond P0?

**First candidate:** sage-stenographer — automates session capture into structured handoff notes. Build after the manual protocol from 0b proves its pattern.

Other candidates will emerge during P0. The founder decides which get built and when. The AI flags when a recurring manual process could be automated and estimates the cost vs time saved.

**Limitation:** Manual process first, prove the pattern, then build. Automating an unproven process locks in the wrong pattern.

### 0h. Hold Point — Startup Preparation Assessment

**Why this exists:** Everything from P1 onward depends on assumptions about what we've built, what it can do, and what value it delivers. Those assumptions have not been tested. The hold point is where we stop, examine the project's actual capabilities, and arrive at P1 with evidence instead of projections.

**The wider frame:** A non-technical founder using AI collaboration to build a startup needs specific capabilities to reach a solid foundation. Those capabilities are not all product features — some are workflows, communication patterns, decision-making tools, and operational infrastructure. The hold point assesses what a regular person actually needs in this situation and whether we have it.

**Assessments at the hold point:**

1. **What works?** — Test every component by using it on ourselves with real data.
2. **What's missing?** — Identify practical gaps after trying to use the thing.
3. **What value can we demonstrate?** — Concretely show what SageReasoning does for a human practitioner and what it does for an agent developer.
4. **Capability inventory** — A clear-eyed catalogue of every component, its true status (using the 0a vocabulary), and its readiness for each audience.
5. **Startup foundation toolkit** — The minimum set of tools and workflows that would give a non-technical founder a solid foundation.

**Hold point exit criteria:**

1. Every component claimed as "wired" or above has been tested by the founder using real data
2. A capability inventory exists with honest status assessments
3. Gaps identified during testing are documented with severity (blocker / significant / minor / cosmetic)
4. The value proposition has been demonstrated end-to-end on at least one real use case per audience
5. The startup preparation toolkit is defined: what a non-technical founder needs, what we have, what we need to add
6. Any additions identified in criterion 5 are built and given the simplest viable human interface
7. The founder has a clear view of what the business plan review is evaluating — a tested product group, not a projected one

**Hold point limitations:**

- This is not a launch readiness review. The product is not expected to be launch-ready. The purpose is to assess what we have, not certify it as complete. Gaps are expected and useful.
- Testing may reveal that P1–P7 need reordering.
- Testing may reveal product scope changes. P0 is the R&D phase — this is when scope should be informed by evidence.
- "Simplest possible interface" means simplest possible.
- The hold point is not a gate the AI controls. The founder decides when the criteria are met and when to proceed to P1.

### P0 Exit Criteria

P0 is complete when:

1. Both parties can name the status of any module or rule using the shared vocabulary, and agree
2. Session handoff notes are being produced and used
3. The founder can verify a build item without reading code
4. Communication signals are in use and reducing misunderstandings
5. Files are organised and the INDEX.md is current
6. The decision log exists and is being maintained
7. The hold point assessment is complete: capabilities tested, gaps documented, value demonstrated, startup preparation toolkit defined and built with its simplest viable interface

### P0 Limitations

- P0 is not a permission to delay indefinitely. The R0 exemption covers the learning curve, not permanent preparation.
- Workflow skills must earn their place. Manual process first, prove the pattern, then build.
- P0 does not replace the manifest. P0 protocols govern how we work together. The manifest governs what we build and how it behaves.
- The hold point may change the plan. That's the point.

---

## Priority 1: Business Plan Review Completion

**Inputs from P0:** capability inventory, gap analysis, value demonstration, startup preparation toolkit, decision log, observed cost data.

**Exit criterion:** Founder affirms or rejects the investment case with documented reasoning in the decision log.

---

## Priority 2: Ethical Safeguards (R17, R19, R20)

**Build items (overview):**

- **2a** Vulnerable user detection and redirection (R20a) — CRITICAL
- **2b** Bulk profiling prevention (R17a) — CRITICAL
- **2c** Application-level encryption for intimate data (R17b)
- **2d** Genuine deletion endpoint (R17c)
- **2e** Honest positioning — limitations page and mirror principle (R19c, R19d)
- **2f** Relationship asymmetry guidance (R20d)
- **2g** Independence encouragement (R20b)

**Exit criterion:** All human-facing tools include distress detection. API enforces profiling prevention. Intimate data encrypted. Users can delete complete profiles. Limitations page live. Mentor prompts include mirror principle and relationship asymmetry guidance.

---

## Priority 3: Sage Assent — Honest Certification (R18 + existing Sage Assent build)

3a Certification scope language and badge component (R18a, R18b). 3b Supabase integration, assessment endpoints, LLM wiring. 3c Interoperability architecture (R18c). 3d Adversarial evaluation protocol (R18d).

**Exit criterion:** Badge deployed with scope language. Sage Assent endpoints live with honest disclosures. Schema documented as interoperable. Adversarial evaluation completed with findings incorporated.

---

## Priority 4: Stripe Integration and Metered Billing

Competitor-anchored pricing deployed; this wires up payment processing. Implement R5 cost-as-health-metric alerts alongside Stripe.

**Exit criterion:** Stripe handles paid-tier billing. Cost health alerts operational. Revenue-to-cost ratio tracked against 2x threshold.

---

## Priority 5: R0 Operationalisation

The oikeiosis sequence becomes a live decision-making tool. The P0 decision log transitions into a permanent audit trail.

**Exit criterion:** Mentor prompts include oikeiosis reflection. Audit trail active. Journal oikeiosis data feeding progression.

---

## Priority 6: MVP Launch

**Launch criteria (11 total):**

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

**Limitation:** Legal review (criterion 5) is critical path. Per ST2 Q4 election (2026-05-12), lawyer engagement is brought forward to Stage 1 close under the amended staging plan.

---

## Priority 7: Sage Ops Pipeline Activation (Post-Launch)

7a Activate Sage Ops at supervised level. 7b Enforce R5 $100/month Ops cost cap. 7c Implement Layer 0 context sync. 7d Intelligence pipeline data governance (R16).

**Exit criterion:** Sage Ops operational at supervised level. Cost cap enforced. First Layer 0 sync completed. Pipeline compliant with R16.

---

## Cross-Cutting Limitations

- P0 overlaps internally but 0h is a hard hold. Items 0a–0g can be worked progressively. The hold point (0h) is a deliberate pause. P1 does not begin until 0h is complete.
- The hold point may change everything after it.
- Architecture decisions before code for R17a and R20a.
- Legal review on the critical path. Brought forward to Stage 1 close per ST2 Q4.
- Adversarial testing ideally needs external review.
- R0 exemption is not a blank cheque.
- Workflow skills must earn their place through manual testing first.
- The startup preparation toolkit interface must be the simplest viable.

---

## Process Rules — From Build Knowledge Extraction (April 2026) + ST2 Additions (May 2026)

These are standing rules encoded from the build knowledge extraction and debrief cycle and the ST2 stress-test arc. They persist across all future sessions, not only during P0. Each rule cites the session or finding that generated it.

### PR1 — Single-Endpoint Proof Before Surface Rollout

Before any new architectural pattern is deployed across multiple endpoints, it must be proven on a single endpoint first. A single-endpoint proof must reach Verified status (0a) before rollout begins.

This rule exists because the Session 7b incident (three-session recovery) was caused by skipping this step. Cost of violation: three or more sessions.

*PR1 is the process-level extrapolation of the Session 7b lesson. The architectural counterpart is the manifest's AC7. Both describe the same underlying lesson from different angles.*

### PR2 — Build-to-Wire Verification Is Immediate

When a function is wired, verification happens in the same session. A function that exists but is never called is worse than a function that doesn't exist — it creates false confidence.

Verification method for safety-critical functions: confirm invocation in the execution path, not just correct output. Grep for calls, not definitions. This complements the manifest's AC4 (Invocation Testing for Safety Functions).

### PR3 — Safety Systems Are Synchronous

No safety-critical function (the two-stage distress classifier, Zone 2 classification, Zone 3 redirection, or any wrapper enforcing these) may run as a background process or fire-and-forget. The safety check result must be complete before the response is constructed.

The approximately 500ms latency cost for borderline inputs is accepted and non-negotiable (see manifest AC2).

### PR4 — Model Selection Is a Constraint, Not a Preference

Model selection criteria are documented in constraints.ts (manifest AC1) and treated as architectural constraints. Before any new endpoint is designed, model selection must be confirmed against constraints.ts. Model selection is a session-opening checkpoint, not a mid-session discovery.

### PR5 — Knowledge-Gap Carry-Forward

Any concept requiring re-explanation in a session is flagged in the handoff note (0b) with a cumulative count. The Knowledge Gaps Register (`operations/knowledge-gaps.md`) supports three entry states:

- **Candidate** — observed once. Logged with session, concept, and one-line note. Not yet a permanent entry.
- **Candidate (2nd recurrence)** — observed twice. Promoted to "watch" status with a proposed resolution sketch.
- **Entry** — observed three times OR pre-populated from a structured extraction pass (e.g., Build Knowledge Extraction 17 Apr 2026; ST2 Build-Plan Stress-Test 2026-05-12). Permanent entry with reasoning, examples, and resolution.

Pre-population from an extraction pass is explicitly authorised. The session-opening protocol (0b, handoff read) includes a scan of `operations/knowledge-gaps.md` for concepts relevant to the session's scope. If any match, read the resolution before beginning work.

### PR6 — Safety-Critical Changes Are Always Critical Risk

Any change touching the distress classifier, Zone 2 classification logic, Zone 3 redirection logic, or their wrappers is classified as Critical under 0d-ii regardless of apparent scope. The full Critical Change Protocol (0c-ii) applies.

PR6 extends 0d-ii's default classifications to name safety-critical functions explicitly.

### PR7 — Decisions Not Made Are Documented

When a decision is explicitly deferred, the reasoning is recorded in the decision log (0f) with: what was considered, why it was deferred, what condition would trigger revisiting it. Deferred decisions are as significant as adopted ones.

### PR8 — Tacit-Knowledge Findings Become Process on Third Recurrence

Tacit-knowledge findings tagged in the T-series register (rhythms, dependencies, frictions observed during sessions) become process rules on the third recurrence. They are not promoted on first or second observation (premature lock-in) and not left unresolved past the third (pattern-ignoring). The decision log records the promotion with the three recurrence sessions cited.

### PR9 — Stewardship Findings Split Into Three Tiers

Findings tagged in the F-series stewardship register are classified into three tiers at time of logging: **Catastrophic** (immediate response), **Long-term regression** (steady-state maintenance), and **Efficiency & stewardship** (steady-state maintenance). Middle and lower tiers are not scheduled as one-off cleanups; they are absorbed into the ongoing steady-state work. The decision log records the tier assignment.

---

### PR10 — Plan → Execute → Verify (PEV) Loop with Diagnostic-Certainty Signalling (NEW; ST2 2026-05-12)

**Source:** ST2 Phase 3 Step 5 Candidate 16 (ALLOW as new PR10).

Code work follows the PEV loop:

1. **Plan** — name the change, what could break, the rollback path, the verification step. For Critical-tier changes this is the Critical Change Protocol (0c-ii); for Elevated and Standard it is a lean version.
2. **Execute** — write the change. Single-endpoint-proof discipline (PR1) applies; build-to-wire-verification-immediate (PR2) applies.
3. **Verify** — run the verification step before declaring the work done. If verification produces a diagnostic finding, classify the finding's certainty:
   - **Diagnostic-certain** — root cause identified; the change addresses the root cause
   - **Diagnostic-uncertain — symptom level** — change addresses observed symptom but root cause not confirmed
   - **Diagnostic-uncertain — pattern level** — change matches a known pattern but applicability uncertain

   Symptom-level and pattern-level findings require explicit founder acknowledgement before being treated as resolved.

**Rationale:** Addresses the architectural-debugging-gap from the vibe-coding-debugging community pattern. Cursor's minimal-disruption + Windsurf's diagnostic-certainty + Karpathy's agentic-engineering principle ("the model is the orchestrator, not the source of knowledge") all converge on this discipline.

**Engagement:** Every code-elevated and code-critical session. Standard-risk code work follows abbreviated PEV (Plan and Verify steps may be implicit; Execute step still subject to PR1 + PR2).

### PR11 — Authoritative-Current-Sources Rule (NEW; ST2 2026-05-12)

**Source:** ST2 Phase 3 Q8 election (Adopt SR1 as PR11).

Before recommending any approach in a session, the AI consults:

- **(a) Anthropic developer documentation:** `docs.anthropic.com`, `docs.claude.com`, `platform.claude.com`, `anthropic.com/news`, `anthropic.com/engineering`
- **(b) Founder-subscribed sources:** Nate B. Jones's Substack (`natesnewsletter.substack.com`); `promptkit.natebjones.com`
- **(c) /inbox/** for files dated since last session (scanned automatically at session open)
- **(d) Industry release-aggregators:** `releasebot.io/updates/anthropic`

The consultation is performed before stating a recommendation; the consultation's findings are summarised inline. If no consultation is performed (e.g., the recommendation rests entirely on prior session context with no new information needed), this is stated explicitly.

### PR12 — Negative-Finding Discipline (NEW; ST2 2026-05-12)

**Source:** ST2 Phase 3 Q8 election (Adopt SR1a as PR12).

When a search returns no results for a feature the founder mentions or prior context suggests should exist, the AI presumes the search was inadequate before concluding the feature doesn't exist:

1. Try at least three queries with different keywords
2. Try official documentation URL patterns (predictable paths for the platform in question)
3. Try industry news venues without domain restriction
4. State "I couldn't find this with the queries I tried; the feature may still exist" rather than "I cannot find this feature in the documentation"

**Rationale:** The 2026-05-10 Anthropic-features-survey omission (Dreams + Outcomes + Multi-agent orchestration missed) was caused by inadequate negative-finding discipline. Codifying the discipline prevents recurrence.

### PR13 — Consider-Implications Five-Question Assessment (NEW; ST2 2026-05-12)

**Source:** ST2 Phase 3 Q8 election (Adopt SR2 as PR13).

After any web-search or document-read produces material findings, the AI explicitly states:

1. Does this contradict a prior decision?
2. Does this refine or improve a prior decision?
3. Does this affect work in flight in this session?
4. Does this affect future-stage work?
5. Does this affect operational discipline (caches; protocols; verification)?

Even "no impact" is stated explicitly. Material findings are those that would change a decision if known earlier.

### PR14 — Proactive Surfacing of Ten Domains (NEW; ST2 2026-05-12)

**Source:** ST2 Phase 3 Q8 election (Adopt SR3 as PR14).

When scoping a stress-test or gap-analysis session, the AI proactively surfaces gaps across ten default domains:

1. Security
2. Regulatory + compliance
3. Accessibility
4. Privacy by design
5. Observability + SRE
6. Legal entity + tax structure
7. Insurance
8. Marketplace economics + dispute resolution
9. Onboarding UX
10. Anthropic-native capabilities

Additional domains may be added per session; existing domains may be folded into adjacent ones; the default ten anchors the scope.

### PR15 — Bias Toward Existing Anthropic Infrastructure (NEW; ST2 2026-05-12; AMENDED 2026-05-14 per D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-2026-05-14)

**Source:** ST2 Phase 3 Q8 election (Adopt SR4 as PR15). Amended 2026-05-14 to operationalise the 2026-05-13 agentic-commerce upstream re-work findings and the 2026-05-14 Anthropic-native posture session.

Before proposing any bespoke build, the AI evaluates whether existing Anthropic infrastructure delivers the same outcome with less custom work.

**Existing infrastructure categories (Anthropic-canonical primitives):**

- Claude Code commands (incl. `/security-review`, `/plugin`)
- Sub-agents (Claude Code; Agent SDK)
- Skills (Anthropic-published at `github.com/anthropics/skills`; 17 official skills installed locally at `.claude/skills/anthropic/` as of 2026-05-14)
- Managed agents (REST API; long-horizon agents)
- MCP servers (Model Context Protocol; standardised tool integration)
- SDK patterns (Claude Agent SDK Python + TypeScript)
- Plugin spec (Claude Code Plugins; lightweight packaging)
- Cookbook patterns (`anthropic-cookbook/patterns/agents`; reference implementations) — *added 2026-05-14*
- Reference agents (`anthropics/financial-services`; legal-tools plugins; domain-specific reference agents) — *added 2026-05-14*
- Dreams (memory consolidation; research preview)
- Outcomes (rubric + separate grader; public beta)
- Multi-agent orchestration (specialist agents; public beta)

**Operational discipline (added 2026-05-14):**

Before electing a bespoke build, the AI MUST:

1. Consult skills installed at `/.claude/skills/anthropic/` for relevant `SKILL.md` patterns matching the session's scope (Claude Code's recursive `SKILL.md` discovery surfaces these automatically; in Cowork sessions the founder paste-syncs the project-instructions panel which references this folder).
2. Consult `/operations/agentic-commerce-findings-downstream-order.md` for forward-looking findings (F1–F4) whose target session matches the day's scope; fold-in the named action at the named point per the findings document.
3. State whether an Anthropic-canonical primitive could deliver the outcome before stating the bespoke election.
4. If bespoke is elected, justification is recorded in the decision-log entry under "Reasoning" naming the Anthropic primitive considered and why bespoke is preferable for this case.

Existing infrastructure is the default; bespoke work is the alternative requiring justification. Justification is recorded in the decision log when bespoke is elected.

### PR16 — Positioning + Dogfood Lens at Every Triage Decision (NEW; ST2 2026-05-12)

**Source:** ST2 Phase 3 Q8 election (Adopt SR5 as PR16).

For each amendment, ADR, or design decision, the AI flags:

- **Positioning impact** — strengthens / weakens / neutral for "Character Kernel" positioning (R18a category label)
- **Dogfood relevance** — substrate-consultable via `/api/reason`? (yes / no / partial)

When dogfood relevance is high and the decision is kathekon-laden, the AI offers substrate consultation as an option. Founder elects whether and when to consult.

### PR17 — Founder-Performed Operational Steps Are Walked Through Live, Not Handed Off (NEW; 2026-05-27)

**Source:** Founder direction 2026-05-27 (C2 session arc), recorded under `D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`. Codifies a recurring expectation surfaced when the AI tended to reduce founder-performed setup to one-line "founder to do X between sessions" hand-offs.

Any step that must be performed by the founder outside Cowork's reach — environment standup (TEST or production), credential minting, signing-key generation, env-var configuration, deployment / Vercel actions, Supabase dashboard work, or any operation requiring the Code tab, an external dashboard, or the founder's own machine — is **walked through interactively, step by step, in the session**, with exact instructions: menu paths / clicks, copy-paste values, expected results, and a confirmation check after each step (the Critical Change Protocol verification posture, applied to setup).

It is **NOT** reduced to a single line such as "founder to stand up the test environment between sessions" in a close or prompt. A pointer to a checklist (e.g. `data-room/04_test_brief/test-env-standup-checklist.md`) is the *script*, not a substitute for directing it live with the founder. If a step genuinely must run on the founder's machine, the AI still narrates it click-by-click, supplies the exact values + the independent-verification command, and waits — it does not defer the whole thing to an unguided between-sessions task.

**Rationale:** the founder has no coding experience (founder preferences). A one-line operational hand-off is precisely the failure mode those preferences are written against. **Engagement:** any session whose work crosses the Cowork boundary into founder-performed territory — notably the post-Option-A configuration testing, where the live runs reach `localhost`, which the Cowork sandbox cannot.

### PR18 — Production-State Blocks Are Close-Time Artifacts (NEW; 2026-06-10)

**Source:** PR8 third-recurrence promotion, elected by the founder at S8a open (2026-06-10), recorded under `D-PR18-ADOPTED-CLOSE-TIME-PRODUCTION-STATE-2026-06-10`. Recurrences cited: 2026-06-07 completion-plan table (corrected at S6); S3–S5 close blocks (corrected at S6); CLAUDE.md post-S5 (found stale again at the 2026-06-10 multidisciplinary review).

Any "production state" summary (the CLAUDE.md block, plan tables, close blocks) is rewritten **only at session close**, only from (a) the decision log and (b) that session's verified observations, and always carries its as-of date. Mid-session documents state flag dispositions only by citing a dated decision-log entry.

**Rationale:** three recurrences of the same drift class — a summary block retyped mid-arc from prose rather than from the decision log — each propagated stale state into subsequent session opens. PR8 promotes the pattern at the third recurrence. **Engagement:** every session close that touches a production-state summary; any mid-session document that needs to state a flag disposition.

### PR19 — Independent Adversarial Review Is Required, Not Optional (NEW; 2026-07-21)

**Source:** the Agent-Organization + Evidence Program build plan's P3 election (`operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P3, adopted under `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19`), recorded under `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21`. Recurrences cited, all 2026-07-19: `D-KATHEKON-DIKAIOSYNE-SELF-CIRCLE-NARROWING-BUILT-REVIEW-FOLDED-2026-07-19` (a same-session first-hand review called the self-circle-narrowing build clean; a freshly-launched independent Workflow, given the diff alone, found a HIGH double-counting defect the self-review's author had documented the discipline against in one file and violated in the very next); `D-AGENT-EXTENSION-AE2-INDEPENDENT-REREVIEW-FOLDED-2026-07-19` (a first-hand review of the AE-2 loop-fold called the core logic clean; an independent re-run after an account spend-limit reset found 7 confirmed defects, including a genuine spec-infidelity the first pass missed entirely); and `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19` itself (a first-hand draft of this very build plan was independently critiqued and returned 23 confirmed findings, none refuted, before adoption). Same pattern, three independent domains, one day.

**Scope amendment (2026-08-10, `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`):** the rule's surface list is **widened** to add **auth / security / R20a-perimeter code** and **any code that deletes data**. Grounding instance, same session: the C-1 observability retention sweep was none of the original four surfaces — a new cron route — so PR19's letter did not engage; a review was launched on judgement anyway and returned **three confirmed defects the author's own 47-assertion battery had passed**, including a filter-value mutation that would have deleted live, in-retention rows rather than expired ones, and a `catch`-block cast that would itself throw on a non-`Error` rejection and escape uncaught as the fail-*closed* behaviour the route was written to avoid. The founder elected to add the data-deletion category on that evidence rather than only the audit's original auth/security/perimeter recommendation. Note that 0d-ii already classifies both new categories Critical; PR19's widened list and 0d-ii's Critical tier now substantially coincide, and where they differ, the broader of the two governs.

**Rule:** any session materially changing trust-core / predicate / fold / engine surfaces, **auth / security / R20a-perimeter surfaces, or any code path that deletes data**, **and** any session drafting a build plan carrying live-op or org-safety consequences, closes only after one of:
1. an **independently-launched review** — a fresh Workflow given the code or document itself, with **no visibility into the first review's conclusions or summary** (a review handed "here is what we already believe is fine" is not independent and does not satisfy this rule); or
2. an **explicit founder waiver**, recorded at close, naming what was NOT independently reviewed.

**The spend-limit fallback (codified, not merely practiced):** when the launched review dies wholesale on an account spend/session limit, the standing precedent (§4, invoked repeatedly through 2026-07) applies: complete the review **first-hand** across every dead dimension, **disclose the single-perspective limitation explicitly at close**, and — this is the part the founder decided should bind, not merely be recommended, precisely because two of the three grounding instances above show the eventual independent re-run catching real defects the first-hand pass missed — **an independent re-run is REQUIRED before the reviewed artifact is treated as verified for the purpose of any subsequent live-op activation gate** (a Critical 0c-ii flag flip, mint, or deploy that depends on the artifact's correctness) or, for a governance document, **before its Adopted status is treated as final for an irreversible downstream commitment**. The requirement does not block the session's own close — the close records the disclosed limitation and the re-run as a carried, named follow-up — but it does gate whatever comes next that depends on the artifact being genuinely sound.

**A named implementation pitfall for any review-workflow's post-processing:** never key downstream aggregation off an array's POSITION once any upstream `filter`/error-drop could have changed which branch sits at which index. The `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19` critique's own post-processing hit exactly this — a `results.filter(Boolean)` applied before a positional `flatMap`, so when one parallel dimension errored and dropped out, a different dimension's findings were mislabeled with its name. Caught during adjudication by re-attributing findings by content, not by the corrupted positional field. Re-attribute by identity/content, never by position, whenever a branch can independently fail.

**Reusable template:** `operations/review-harness/independent-review-workflow-template.md`, seeded from the three 2026-07-19 runs.

**Rationale:** the founder's redirect-phrase discipline (the standing-cache table of AI-failure-mode redirects) exists because self-assessment shares the assessor's own blind spots — a lesson this project has now paid for at method-before-purpose scale (KG-EX1) and, with this rule's grounding instances, at code-review scale too. A first-hand review under a forced outage is a legitimate stopgap (§4), not a substitute for genuine independence; PR19 makes the substitute temporary and the real thing mandatory before anything downstream leans on it. **Engagement:** any session touching trust-core/predicate/fold/engine surfaces; any session drafting a build plan with live-op or org-safety consequences; any session that would otherwise treat a same-session first-hand review as sufficient grounds to proceed to activation.

### PR20 — Mentor Consultation Briefs Must Name the Affected Architectural Surfaces (NEW; 2026-08-04)

**Source:** Founder direction 2026-08-04, following the Stoa Q5c/Q13a trust-event build (`operations/handoffs/founder/2026-08-03-stoa-Q5c-Q13a-trust-event-wiring-SCOPED.md`). The build's PR19 independent adversarial review found MEDIUM-1: a Q5(c) contradiction event, folded through the generic `emitTrustEvents` path, seeds a fresh domain row at the profile prior and — because a `decrease` from a fresh `habitual` seed hits the floor — sets `hasEvidence:true`, originating a public trust record from a single curator-mediated submission. This was sent to the mentor as a question and produced the 2026-08-04 evidence-gate ruling (`operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-followups-verbatim.md`). **The finding was mechanically discoverable BEFORE the original ruling was requested** — the fold mechanism's seed-then-floor behaviour predates this build and applies to every `decrease`-effect event type, not just the two being scoped. Had the original consultation brief named it, the mentor's evidentiary-standard ruling could have addressed it in one pass instead of two.

**Rule:** a brief prepared for a mentor consultation on any question with an architectural consequence — a new trust-event type, a new gate, a new write path, or any change to what the trust/practice layer records or exposes — MUST name the specific existing mechanisms the ruling will land on, stated as **one-sentence, mechanism-level facts about current behaviour** (not the full codebase, not a file listing — the mechanisms an implementation of the ruling will actually execute). Example, from the grounding instance: *"the fold mechanism seeds a new domain row at the profile-prior level for any event with no prior state in that domain, and a `decrease`-effect event one rank down from a fresh seed hits the floor — so a single decrease event on an unexamined domain can originate that domain's public trust record."* This is not a request for the mentor to review code; it is the minimum context a ruling on "what should happen" needs to be complete on first pass, because the mentor cannot see the codebase and reasons from what the brief tells them exists.

**How to find the surfaces to name:** before drafting the brief, read the code paths the ruling would actually execute through (the emission/fold/read functions a new event type would call, the gate a new check would sit behind, the table a new write would land in) and extract the one or two behaviours — inherited, shared, or otherwise not obvious from the ruling's plain-language description — that change the ruling's practical effect. A behaviour is worth naming if it is (a) not implied by the question itself, and (b) would change what the mentor rules if they knew it. A behaviour that's purely descriptive of what's being built (e.g. "this will be a new database column") does not need this treatment — PR20 targets *inherited* mechanics a fresh reader of the ruling would not otherwise know to ask about.

**Rationale:** the mentor reasons from the brief, not from the repository. A ruling given without visibility into how the existing machinery would carry it out is a ruling on an incomplete picture — not because the mentor reasoned poorly, but because the brief withheld a fact that changes the answer. PR19 catches this class of gap adversarially, after the build; PR20 is the cheaper, earlier catch — surfacing the same class of fact before the ruling is requested, so the mentor's first answer is already complete rather than needing a second round-trip once an adversarial review finds what the brief should have said. **Engagement:** any mentor-consultation brief (verbatim-record-producing sessions under the `operations/*/mentor-consultation-*.md` pattern) whose question concerns a change to the trust-core, practice, Stoa, or any other examined-record surface; not engaged for consultations that are purely philosophical/design-space questions with no landing mechanism (e.g. the original fourteen-question Stoa design-space consultation, which preceded any build).

**AMENDED 2026-08-19 — mechanism facts must be timestamp-checked at relay, not only stated accurately at drafting** (mentor ruling, `operations/agent-circles-2026-08/2026-08-19-mentor-consultation-observer-convening-pr20-stale-fact-verbatim.md`, Q2; verbatim wins). **Grounding instance:** the 2026-08-18 curiosity/taxonomy-scoping consultation's Q5 question stated as a mechanism fact that `assessStructuralNovelty` was "committed-but-dark." The fact had been accurately recorded when a prior document was drafted but had gone stale by the time this document was relayed — `SUBSTRATE_FRESH_ENABLED` was activated in production eight days earlier (`D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10`). No flag was raised and no check was performed before relay. The ruling's direction turned out to be correct regardless, but — in the mentor's words — *"it landed safely despite the mechanism fact being wrong, not because the mechanism fact was verified. That is not an acceptable epistemic condition for a governance process that exists precisely to ensure rulings are grounded in accurate facts."* A ruling given on a stale premise **stands** (Q5 was reaffirmed on independent grounds), but standing-by-luck-of-direction is not the standard PR20 exists to guarantee.

**Rule, added:** any present-tense mechanism fact in a question document — any claim about the *current* state of a live surface, endpoint, schema, or build artefact, prefaced by words like "is," "remains," "has not," "is dark," "is live," or any other present-tense state claim — MUST be timestamp-checked by the relaying session against the decision log or current codebase state before the document is relayed. The check need not be exhaustive; it needs to cover facts stated in the present tense specifically, since those are the ones time can falsify between drafting and relay. **If the relaying session cannot verify a present-tense mechanism fact, it must be marked recorded-but-not-independently-verified** — the existing PR20 convention for that class of fact, now explicitly extended to cover a fact that was once accurately recorded and has since gone stale, not only a fact the drafting session never verified in the first place. This is PR20's existing discipline applied one step earlier in the relay process, not a new burden.

**FURTHER AMENDED 2026-08-19, same day — the same check applies to carry-forwards naming a target session, not only to present-tense mechanism facts** (mentor ruling, `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md`; verbatim wins). **Grounding instance, same day as the amendment above:** a design document carried forward a connection with the phrase "when the generation-step scoping session opens" — but that session had been ruled and closed 2026-08-09, ten days before the connection it was meant to receive (GS-ATRF-4) existed. The error arrived inside text inherited from another document rather than a freshly-drafted claim, and the first PR20 amendment (immediately above) did not catch it — the drafting session's own honest self-check did, not the mechanism. The mentor's words: *"The instinct caught it. The instinct should now be supported by a named check."*

**Rule, added:** before a carry-forward naming a future scoping session is recorded, the drafting session must verify that the named session is genuinely open or genuinely future — not already ruled and closed — the same timestamp-check discipline the first PR20 amendment requires for present-tense mechanism facts, applied one step earlier, at drafting time rather than only at relay time. **If a carry-forward is found pointed at a session that has already closed, per the same ruling's general principle:** it is not voided (the connection may still be real and valuable) and it does not require a dated amendment to the closed document (that precedent applies only when the content is intrinsic to the closed document's own subject matter — see the S8/B1 precedent, `00-PRIORITY-INDEX.md:191`, for the narrow case where it does). Instead, it is **redirected** to whichever open-or-future session's subject matter is the actual right home for the content, recorded there as a named input examined when that session opens, not as a pre-answer. If no currently-open or future-named session is the right home, the carry-forward is held as a named open connection in the document that produced it, flagged for re-raising when a receiving session opens.

### PR21 — Reflect-Harvest: the Close-Turn's Findings Must Reach a Tracked Artifact (NEW; 2026-08-10)

**Source:** the 2026-08-01 Fable-5 regrounding audit (`D-FABLE5-AUDIT-SESSIONS-2026-07-19-TO-24-2026-07-25` §4, carried forward), founder-adopted 2026-08-10 under `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`. The audit extracted 20 Sage Reflect close-turns from local transcripts and found them "genuine and repeatedly valuable" — while also finding that **none had ever reached a tracked artifact**, because the reflect turn fires *after* the session close is already written. The findings were real and the channel was a dead end.

**Rule:** two halves, both binding.
1. **Write side (close):** where the reflect close-turn surfaces a finding that would change future work — a defect in the session's own reasoning, a near-miss, an inherited assumption that proved false — the session **records it in the decision-log entry** (a `**Reflect finding:**` line is sufficient). Not every reflect turn produces one; the rule is to capture what is produced, not to manufacture material.
2. **Read side (open):** the session opener **reads the prior session's reflect findings** for its stream before starting substantive work, alongside the predecessor close it already reads.

**Grounding instance, same session as adoption:** this session's own reflect turn surfaced two findings that existed in no artifact — that the session had nearly inherited a predecessor prompt's false negative finding (the prompt asserted the mentor's website feedback was unrecorded; it was recorded, and one `ls inbox/` found it), and that the session had committed founder-authored binary assets on a preference-formed-before-examination basis. Both were visible only in the transcript. Under PR21 both land in the decision-log entry.

**Rationale:** the practice already produces the examination; PR21 only stops the output falling on the floor. Note the asymmetry it corrects — the project spends real effort on the reflect turn and then discards it, which is worse than not running it, because it produces the *appearance* of a self-correction loop without the loop closing. **Engagement:** every session with a reflect close-turn (read side: every session open).

### PR22 — Model and Effort Attribution on Every AI-Authored Commit (NEW; 2026-08-10)

**Source:** the 2026-08-01 regrounding audit's process recommendations, founder-adopted 2026-08-10 under `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`. The audit reported 10/21 commits since 2026-07-19 carrying no model attribution. **The adoption session re-measured and found it substantially worse: of 128 commits in that window, 4 carried a `Model:` trailer — and 3 of those were authored the same day, by the adopting session itself.** The convention was effectively not in use.

**Rule:** every commit authored by an AI session carries `Model: <exact model id>` and `Effort: <reasoning effort>` trailers. Founder-authored manual commits are out of scope. **Convention only — deliberately NOT hook-enforced** (founder election at adoption): the founder chose the documented-rule form over a pre-commit hook that rejects untrailed commits, accepting that a convention may erode where enforcement would not. If the rate does not improve, the hook is the named escalation, already scoped by this decision.

**Rationale:** model attribution is not bookkeeping in this project — it is measurement infrastructure. The P2 rerun's leg B was confounded precisely because a model swap (`claude-opus-5` where `claude-fable-5` was expected) went unnoticed until a mandatory `model:` field caught it at handover, and the affected scenario's A-vs-B comparison had to be excluded from the verdict. Commits are the durable record of what was built by what; without the trailer, any future audit re-deriving model attribution must reconstruct it from session transcripts that may not survive. **Engagement:** every AI-authored commit.

### PR23 — Memory-First: Consult the Memory Index Before Diagnosing a Recurring Class (NEW; 2026-08-10)

**Source:** the 2026-08-01 regrounding audit's process recommendations, founder-adopted 2026-08-10 under `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`.

**Rule:** before diagnosing a problem that belongs to a recurring class — a DB error classification, a build/route-export failure, a test that passes when it should not, a credential or auth failure — check the memory index for an existing entry on that class, and cite it if one applies.

**Grounding instance, same session as adoption, in both directions.** The memory `nextjs-route-export-validation` **worked**: the session split the new sweep route's handler correctly on the first attempt because that memory named the trap. The memory `missing-table-benign-guards-load-bearing-writes` **did not**: the session wrote a new benign-error classifier carrying a comment that *asserted* the missing-column trap was handled, copied from a sibling, without checking whether its own implementation actually handled it — it did not, and a real Postgres 42703 message (`column "x" of relation "y" does not exist`, containing both "relation" and "does not exist") would have been silently swallowed as benign. The independent review found it. **The honest reading, recorded so the rule is not over-claimed:** the lesson was available and consulted-in-spirit; what failed was the step from *knowing the class* to *verifying this instance*. PR23's value is therefore in the verification it prompts, not in the recall — a memory citation that does not check the current code against the remembered failure discharges the letter of this rule and not its purpose.

**Rationale:** the project's memory index exists because these classes recur across sessions with no continuity of context between them. **Engagement:** any diagnosis of a problem in a class a memory covers; and, per the grounding instance, any code being *written* in such a class — the failure mode observed was at writing time, not diagnosis time.

### PR24 — Retention Parity: a Table Declaring `retain_until` Ships Its Sweep in the Same Session (NEW; 2026-08-10)

**Source:** the 2026-08-01 regrounding audit's C-1 finding, founder-adopted 2026-08-10 under `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`.

**Rule:** any migration introducing a table with a `retain_until` column **ships the purge function and its sweep wiring in the same session**. A `retain_until` column with nothing enforcing it is not a retention policy — it is a declared intention that reads, to any later auditor, exactly like an implemented one.

**Grounding:** `route_errors` and `throttle_events` each carried `retain_until` **and an index on it** from their P-GL migrations (2026-07-20) with no sweep whatsoever until 2026-08-10 — nearly three weeks, on tables unreachable by the user-JWT data-rights paths, so the sweep was their *only* deletion mechanism. **The adoption session further found the gap still open on `agent_hold_observations`** — it declares `retain_until` (its 2026-07-12 migration, `:126`, with an index at `:146-147`) with no purge function — which is why the founder elected to adopt the rule **and queue the existing gap** rather than adopt the forward-looking rule alone. *(**CORRECTED 2026-08-17, R2b.** This sentence previously also named `stoa_entries` as declaring `retain_until`. **That was factually wrong.** `stoa_entries` has NO `retain_until` column at all, deliberately, by binding mentor ruling **#24 (Q9)**: entries are STANDING declarations and **"silent expiry is prohibited"**. The absence is pinned in three independent places — `website/supabase-stoa-entries-migration.sql:21-26` under a "DELIBERATE ABSENCES (each a ruling, not an oversight)" header; `website/src/lib/stoa/stoa-store.ts:29-33`, "Never add this table to any retention sweep"; and an EXECUTING battery assertion, `stoa-boundary.test.ts` C.2, which fails if `retain_until` appears in that migration at all. **Building a sweep for it would contradict an adopted ruling, not close a gap.** PR24's rule is conditional on a table DECLARING `retain_until`, so it never bound `stoa_entries` in the first place. The store header's separate claim that entries persist "until withdrawn or **erased**" was verified first-hand rather than assumed: `stoa_entries` IS genuinely wired into `/api/user/delete` (`deleteStoaDataForOwner` + `deleteStoaDataForCredential`, awaited), `/api/user/export` (via `user-data-gathering.ts`), and `/api/credential/erase` (via `consumer-erasure.ts`, with row counts reported) — so "no retention sweep" is the correct posture and there is no differently-shaped gap hiding behind the wrong sentence. **Also worth stating once so it is not re-derived:** `classifier_cost_log` declares no `retain_until` either, so PR24 does not bind it — a separate R17c question, not a PR24 one.)*

**Rationale:** R17c commits this project to genuine deletion on request and on schedule. A declared-but-unenforced `retain_until` is the most dangerous shape that commitment can take, because the schema *documents* compliance that the runtime does not deliver. **Engagement:** any `schema` or `code-*` session introducing a `retain_until` column.

---

## Cross-references

- `/manifest.md` — full manifest (R0–R22, AC1–AC13, KG1–KG7; R21/R22 added 2026-08-09)
- `/adopted/standing-protocol-cache.md` — general session protocol cache (references PR10-PR24; PR17 added 2026-05-27; PR18 added 2026-06-10; PR19 added 2026-07-21 and scope-widened 2026-08-10; PR20 added 2026-08-04; PR21–PR24 added 2026-08-10)
- `/adopted/build-sessions-protocol-cache.md` — build-arc-specific cache
- `/adopted/substrate-plugin-staging-plan.md` — substrate-as-plugin staging plan (amended at ST2)
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category label)
- `/operations/decision-log.md` — append-only decision trail
- `/operations/knowledge-gaps.md` — full knowledge-gaps register (KG1–KG7 + pre-populated entries from extraction passes)
- `/archive/2026-05-12-project-instruction-amendments-source-of-amendment.md` — source draft for ST2 amendments preserved
- `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` — ST2 close (57-item triage record; Q8 election adopting SR1-SR5 as PR11-PR15)

---

*End of project-instructions snapshot. Adopted 2026-05-12 under D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12. Founder paste-syncs this content into the Cowork project-instructions panel between sessions. Any divergence between this file and the Cowork panel is resolved by re-syncing both to this snapshot's current content; log via D-PI-DRIFT or D-PI-SYNC entries as appropriate.*
