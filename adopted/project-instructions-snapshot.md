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

---

## Cross-references

- `/manifest.md` — full manifest (R0–R20, AC1–AC13, KG1–KG7)
- `/adopted/standing-protocol-cache.md` — general session protocol cache (references PR10-PR16 post-ST2)
- `/adopted/build-sessions-protocol-cache.md` — build-arc-specific cache
- `/adopted/substrate-plugin-staging-plan.md` — substrate-as-plugin staging plan (amended at ST2)
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category label)
- `/operations/decision-log.md` — append-only decision trail
- `/operations/knowledge-gaps.md` — full knowledge-gaps register (KG1–KG7 + pre-populated entries from extraction passes)
- `/archive/2026-05-12-project-instruction-amendments-source-of-amendment.md` — source draft for ST2 amendments preserved
- `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` — ST2 close (57-item triage record; Q8 election adopting SR1-SR5 as PR11-PR15)

---

*End of project-instructions snapshot. Adopted 2026-05-12 under D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12. Founder paste-syncs this content into the Cowork project-instructions panel between sessions. Any divergence between this file and the Cowork panel is resolved by re-syncing both to this snapshot's current content; log via D-PI-DRIFT or D-PI-SYNC entries as appropriate.*
