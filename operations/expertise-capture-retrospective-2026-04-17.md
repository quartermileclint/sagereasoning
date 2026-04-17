# Expertise Capture Retrospective — SageReasoning P0 Build
**Date:** 17 April 2026
**Source:** 35 stenographer session handoffs (6–17 April), decision log (23 entries), architectural decisions extract, contextual stewardship audit
**Evaluation standard:** Expertise Capture Framework (five-category elicitation model)

---

## BLOCK 1: UNDOCUMENTED TACIT KNOWLEDGE MINED FROM STENOGRAPHER RECORDS

The following table records moments where the founder made a judgement call that was never formalised into a governing document — the "why" is missing from the project record, only the "what" was captured.

### Table 1: Tacit Knowledge Findings

| # | Session | What happened | What tacit knowledge it reveals | When it should have been captured |
|---|---------|--------------|----------------------------------|-----------------------------------|
| T1 | 6 Apr (Session B) | Founder overruled AI suggestion to defer engine refactoring to post-hold-point: "this is too big of an oversight to not address immediately." | **Scope override threshold.** The founder has an implicit rule: structural defects that undermine future work are not deferrable, regardless of where they fall in the priority sequence. The agent categorised the refactoring as "nice to have" — the founder categorised it as "foundational integrity." This standard was never written down. | Pre-project — this is a decision-making principle |
| T2 | 6 Apr (Session D) | Founder confirmed that prescription absence in the profile system is "by design, not a gap." | **Product philosophy boundary.** The system diagnoses but does not prescribe. The live Mentor provides exercises; the profile is diagnostic substrate. This is a product positioning decision disguised as a technical one — it determines what the system will never do. Never recorded in a product principles document. | Pre-project — core product philosophy |
| T3 | 6 Apr (Session D) | Session handoff notes were selected as "the most valuable P0 workflow" out of all 7 toolkit items. | **Founder's hierarchy of operational value.** Continuity between sessions matters more to this founder than any individual tool or verification method. This preference was demonstrated but never articulated as a principle. | Pre-project — working style preference |
| T4 | 8 Apr (Auth incident) | After the debrief, founder corrected overstatements in the mentor profile appendix and noted V1 proposals "only applied learnings from one session" when the full 42-session history should inform changes. | **Evidence breadth standard.** The founder requires that proposals draw from the full history, not just the most recent incident. The AI's pattern was to over-weight the latest session. This standard was formalised into the debrief protocol only after the friction. | Early build — should have been captured when collaboration began |
| T5 | 8 Apr | Founder reconciled two overlapping improvement lists into a prioritised implementation plan using two criteria: "serves our own development now" (Circle 1 first) and "wiring before extension before new build." | **Implementation prioritisation heuristic.** Three-tier: (1) self-serving before outward, (2) connect existing > extend existing > build new, (3) complexity as tiebreaker. The agent didn't have this mental model until the founder stated it — it was an implicit decision-making rule. | Pre-project — this is a general principle |
| T6 | 9 Apr (Session 4) | Founder's previous "requireAuth hangs" diagnosis was wrong — the actual cause was Fetch API stripping auth headers on cross-origin redirects. The founder (a non-coder) accepted the correction without resistance. | **Willingness to update beliefs on technical evidence.** The founder does not anchor on first explanations. This matters for AI collaboration because it means the agent can correct course without diplomatic overhead. Not a governance item, but a working-style trait the agent should know. | Pre-project — interpersonal style |
| T7 | 10 Apr (Session 8) | "Product endpoints = Stoic Brain + Practitioner Context only" emerged as an architectural principle: product endpoints must be portable, zero internal operational context. | **Product portability principle.** Agent brains are the template pattern, not product content. This distinction — which is really about what the company sells vs. what the company uses — was discovered during context contamination cleanup, not designed upfront. | Early build — when the three-layer architecture was specified |
| T8 | 10 Apr (Session 9) | "ATL authority levels apply to external agents only. Internal agents don't need authority progression because the Stoic Brain is applied to every action." | **Trust architecture principle.** Internal trust is earned through structural design (Stoic Brain in every workflow), not through progressive testing. External trust requires progressive testing because the values are unknown. This was a design decision that reveals a deeper philosophy about when surveillance vs. structure is appropriate. | Pre-project — ethical architecture principle |
| T9 | 11 Apr (Session 13) | Testing discovered that `detectDistress()` existed but was called by zero routes. Crisis language was reaching the LLM and causing 500 errors. The function had been built but never wired. | **Build-to-wire gap.** The founder's implicit standard: building a function is not building a feature. The function must be connected end-to-end and verified in the user's actual pathway. This was never stated but was the foundational lesson of session 13. | Pre-project — definition of "done" |
| T10 | 11 Apr (Session 15) | Founder discovered `mentor_encryption: active` in the health check contradicted ADR-007 which said encryption was scaffolded. Investigation revealed the health check was accurate and the ADR was stale. | **Documentation distrust default.** When documentation and code disagree, trust the code. The founder learned this during the build but it reveals a broader quality standard: status claims must be verified against reality, not against prior documentation. | Early build — verification framework |
| T11 | 12 Apr | Fire-and-forget promises in Vercel serverless were silently killing DB writes. The founder's response was immediate: "awaited writes, not fire-and-forget." | **Data integrity over latency.** The founder chose a few hundred milliseconds of added latency over any risk of lost writes. This trade-off was decided instantly and without deliberation — it's a pre-existing value, not a considered decision. | Pre-project — data integrity principle |
| T12 | 13 Apr | Contaminated `mentor_observation` data (raw LLM text instead of distilled observations) — founder chose "archive in place, don't purge" and established a structured observation contract. | **Data quality standard for persistent state.** Raw LLM output is not the same as a distilled observation. Storage-worthy data must be validated, categorised, and third-person. The founder didn't articulate this as a rule; it emerged from the specific problem. | Mid-build — when the mentor pipeline was first designed |
| T13 | 14 Apr (Session C) | Founder accepted the V2 token-reduction result and proceeded to functional verification based on a single conversation where the mentor referenced a prior pattern from the passion map without being prompted. | **"Does it feel right?" as verification.** For the mentor specifically, the founder's verification standard is experiential — does the mentor demonstrate awareness that feels real? Quantitative token targets were met, but the verification that mattered was qualitative. | Pre-project — verification philosophy for personalisation |
| T14 | 15 Apr | Layer 3 wiring session corrected two errors from the prior hold-point assessment: Layer 2 was "not missing, not applicable" on API-key endpoints, and the "9 engine endpoints" were actually two different architectural patterns. | **Assessment accuracy requires code-level inspection.** Capability inventories drawn from high-level greps produce false claims about gap shapes. The founder's implicit standard: don't claim to know the state of something you haven't opened and read. | Early build — verification framework should have included this |
| T15 | 16 Apr | Founder chose to recuse from schema design visibility for Phase B CCP (R20a vulnerability_flag), citing design contamination risk and R20b independence principle. | **Ethical self-removal.** The founder will remove himself from a design process when his own data could bias the outcome. This is an ethical judgement call that reveals a standard about role separation — the person whose data the system protects should not be the person designing the protection. | Pre-project — ethical principle |
| T16 | 17 Apr (Remediation) | After the two-stage classifier was wired, client pages crashed because they didn't handle `distress_detected` in the response. The AI said: "I caused this." | **Ownership of side effects.** When a change introduces downstream breakage, the agent should immediately claim it. This communication standard was established in the 0d signals but the specific obligation — "check every consumer of a changed response" — was learned from failure. | Pre-project — but the dual-verification requirement was only formalised after session 7b |

**Total tacit knowledge findings: 16**

---

## BLOCK 2: GAP ANALYSIS AGAINST THE EXPERTISE CAPTURE FRAMEWORK

### RHYTHMS: What cadences emerged that were not planned upfront?

**Session frequency:** No cadence was pre-defined. Sessions occurred in bursts (four sessions on 6 April, five sessions on 9 April, five on 11 April) followed by single-session days. The burst pattern correlates with debugging or build momentum — the founder works in intense sprints, not steady daily rhythms. This was never captured in a user profile. An expertise interview would have asked "how do you naturally work?" and captured the burst pattern before the first session.

**Handoff timing:** The session-close handoff protocol was defined in P0 item 0b but the timing — when to produce it — was never specified. In practice, the founder's signal "I'm done for now" triggers handoff production. The AI had to learn this signal from the 0d communication table, which was created on 6 April. Before that (sessions 1-5, not in the stenographer record), there was presumably no structured close.

**Verification timing:** Dual verification (API + client) was not established until the session 7b incident (10 April). Before that, API-only verification was the standard. This is a rhythm that should have been specified at project start: what does "verified" mean at each level?

**Decision log maintenance:** The decision log was created on 6 April with 11 backdated entries. Before that, decisions were scattered across conversations. The log is append-only but there is no defined cadence for review — it grows but is never pruned or summarised. The expertise interview should have asked: "how often do you want to review past decisions?"

**Friction that preceded these rhythms:** Sessions 1-5 (pre-stenographer) presumably had cold-start problems that motivated the handoff protocol. Session 7b's crash motivated the dual-verification rhythm. The auth middleware incident (7 April) motivated the debrief protocol and risk classification system. Every rhythm was reactive — established after friction, not before.

### DECISIONS: What decision-making criteria were discovered mid-build?

**Change risk classification (0d-ii):** Standard / Elevated / Critical was adopted on 8 April after the auth middleware incident. Before that, no change was risk-classified. The first seven sessions of the build operated without risk awareness. The auth incident wasn't a failure of the code — it was a failure to classify the risk of the change before making it.

**The compliance register (R0-R20):** Rules R15-R20 were added on 5 April. Rules R0-R14 existed before P0, but the expansion — particularly R17 (intimate data), R19 (honest positioning), R20 (vulnerable users) — was triggered by an ethical analysis. The ethical analysis itself was triggered by external reflection, not by a failure. This is the right way: principled analysis before failure. But the analysis happened after initial design, not before it. An expertise interview asking "what could go wrong for your users?" would have surfaced R17-R20 concerns at the start.

**Hold-point logic (0h):** The hold point was defined on 5 April as part of the revised priority sequence. But the five assessments within 0h were only specified when the hold point was reached (6 April, Session D). The assessments were designed in the moment, not planned in advance. The hold-point concept was proactive; its content was reactive.

**The "wiring before extension before new build" heuristic (T5):** This emerged on 8 April when the founder reconciled two overlapping improvement lists. It's a general prioritisation principle but was never extracted and documented as a standing rule. Every future session that faces a prioritisation question must re-derive it.

**Cost criteria:** R5 (cost as health metric) was a manifest rule, but the specific thresholds — MODEL_FAST vs MODEL_DEEP, the 20% classifier-to-mentor ratio, the $100/month Ops cap — crystallised across sessions 8-17. The founder's implicit cost standard: never spend more on machinery than on the work the machinery serves. This was applied intuitively multiple times (choosing Haiku for quick depth, accepting a 500ms Haiku check over a more expensive always-Sonnet approach) but never articulated.

### DEPENDENCIES: What did the build reveal about what the founder cannot delegate?

**Verification of "does it feel right?":** T13 shows the founder's verification of personalisation quality is experiential. The AI can measure token counts and test JSON schemas, but the question "does this mentor response feel like it knows me?" requires the founder at the keyboard. This dependency was discovered in session 14c. It will apply to every personalisation feature.

**Ethical judgement on role separation:** T15 shows the founder recusing himself from schema design when his own data was in scope. This kind of ethical self-awareness cannot be delegated — the AI can flag the conflict, but the founder must decide whether to act on it.

**Investment decisions:** The decision log entry for P1 explicitly states "this step cannot be delegated." The founder makes the final judgement on the investment case. This was clear from the start but is worth noting as a hard dependency.

**Quality standard for Stoic reasoning output:** Throughout sessions 13-15, the founder tested Stoic reasoning quality by reading responses and judging whether they felt philosophically sound. The AI can check for structural completeness (are all fields present?) but cannot assess philosophical quality. This dependency means every Stoic reasoning change requires founder review of actual output.

**Communication quality with the AI:** T4 shows the founder correcting overstatements in the AI's proposals. The founder is the quality gate on the AI's own communication. This is a meta-dependency that shapes every session.

### FRICTIONS: What recurring friction points appeared across sessions?

**Pattern 1 — Build-to-wire gap (sessions 6c, 13, 14, 17):** Functions exist but aren't connected to their consumers. `detectDistress()` built in session 6c, not wired until session 14. Client pages not updated when API response shapes change. Marketplace skills not gated by distress detection until session 15. **Root pattern:** the build step and the integration step are treated as the same task but they are actually two different tasks with different verification requirements.

**Pattern 2 — Documentation-reality drift (sessions 11, 13, 14d, 15, 17):** ADR-007 said encryption was scaffolded; it was wired. The health endpoint said encryption was active; the docs said it wasn't. TECHNICAL_STATE.md said `/api/score` logged analytics events; it didn't. Layer 2 was "claimed missing" on endpoints where it's not applicable. **Root pattern:** the documentation reflects the state at the time of writing, not the current state. There is no refresh mechanism.

**Pattern 3 — Haiku reliability boundary (sessions 8, 13, 14, 15, 17):** Haiku produces reliable JSON for simple inputs but fails on complex multi-stakeholder inputs. This was discovered empirically across five sessions before the pattern was formalised (standard depth switched to Sonnet, quick depth given a retry). **Root pattern:** the cost-performance boundary of a model was not known upfront and had to be mapped through failures.

**Pattern 4 — Vercel serverless assumptions (sessions 9, 12, 14c):** Fire-and-forget promises killed by function termination. Cross-origin redirects stripping auth headers. Factory-pattern exports interacting differently with Next.js bundling. **Root pattern:** the deployment platform's behaviour was discovered through debugging, not documented upfront. A "platform constraints" document would have saved multiple sessions.

**Pattern 5 — Assessment accuracy requires code-level inspection (sessions 13, 15):** High-level greps and handoff-note summaries produced incorrect capability claims. The "9 engine endpoints" turned out to be two different patterns. Layer 2 was "claimed missing" where it was not applicable. **Root pattern:** the agent assessed the system from documentation rather than from code, and the documentation was wrong.

**Shared root:** All five patterns share one structural cause — the gap between what was believed to be true and what was actually true. The expertise capture framework calls this "tacit judgement calls" but it's more specifically "tacit verification standards." The founder's implicit standard is: verify against reality, not against records. This standard was learned through friction and should have been stated upfront.

### TACIT JUDGEMENT CALLS: What "I just know" patterns were never written down?

1. **"This is too big to defer" (T1):** The founder has an instinct for structural defects that will compound. The AI doesn't share this instinct — it treated the engine refactoring as optional. The threshold is unstated: when does a defect cross from "address later" to "address now"?

2. **"Does it feel right?" for personalisation (T13):** The founder judges mentor quality experientially, not structurally. A response can be structurally complete and philosophically unsound. The AI can't assess this.

3. **Data integrity > latency, always (T11):** Instant decision with no deliberation. The founder treats lost data as categorically worse than slow responses. This is a value, not a calculation.

4. **"Don't prescribe, diagnose" (T2):** The product boundary — the system shows you what's happening in your reasoning, it doesn't tell you what to do about it. The mentor fills that role. This distinction shapes everything from API response design to marketing language, but it was never documented as a product principle.

5. **Trust through structure, not surveillance (T8):** Internal agents earn trust by having the Stoic Brain in every workflow. External agents earn trust through progressive testing. This is an ethical architecture principle that the founder applied but never articulated as a rule.

6. **Ethical self-removal (T15):** When the founder's own data could bias a design, he removes himself from the design process. This is a principle of intellectual honesty that extends from Stoic practice into product development.

---

## BLOCK 3: EXPERTISE CAPTURE INTERVIEW TEMPLATE

### Purpose
This is a structured 45-minute interview for use before any AI-assisted reasoning project begins. It extracts the tacit knowledge that, in SageReasoning's case, was discovered during 35 build sessions across 12 days.

### Interviewer instructions
- Ask each question as written. The founder's answer should be captured in the specified format.
- If the founder answers with "I don't know" or "it depends," probe with the follow-up in brackets.
- Questions marked **LEARNED IN BUILD** are the highest-value questions — they address gaps that caused real friction or rework in SageReasoning's build.

---

### SECTION 1 — RHYTHMS (8 minutes)

```
Q1: How do you naturally work — steady daily sessions, or intense bursts with breaks between them?
Capture format: Free text (1-2 sentences describing the pattern)
Feeds into: user.md
Why it matters: The AI needs to match its pacing to the founder's energy cycle.
LEARNED IN BUILD — SageReasoning had 4-5 session burst days alternating with single-session days; 
this was never captured and the agent treated every session as interchangeable.

Q2: When you finish a work session, what do you need to carry forward to the next one?
Capture format: List (ranked by importance)
Feeds into: heartbeat.md
Why it matters: Determines the handoff protocol structure.
LEARNED IN BUILD — session 6 Apr. Session handoffs were the single most valued P0 workflow; 
the founder selected them above all other tools.

Q3: How often do you want to step back and review what you've decided so far — every day, 
every week, or only at milestones?
Capture format: Decision table (frequency × what to review)
Feeds into: heartbeat.md
Why it matters: Determines whether the decision log has a review cadence or only an append cadence.
LEARNED IN BUILD — SageReasoning's decision log grew to 23 entries with no scheduled review. 
The hold point was the only forced review, and it surfaced multiple documentation-reality drifts.

Q4: What's your signal that a session is done? How should the AI recognise it?
Capture format: List of signals (phrases, patterns, energy shifts)
Feeds into: user.md
Why it matters: Prevents the AI from proposing additional work when the founder has signalled closure.
LEARNED IN BUILD — session signals (0d) were defined on 6 April after unstructured sessions prior.
```

### SECTION 2 — DECISIONS (10 minutes)

```
Q5: When you face a decision during a build, what criteria do you use to decide — even if they're 
instinctive? [Probe: Do you prioritise fixing existing things over building new ones? 
Cost over speed? Safety over features?]
Capture format: Decision table (criterion → weight → example)
Feeds into: soul.md
Why it matters: This is the founder's decision heuristic. Without it, the AI guesses.
LEARNED IN BUILD — session 8 Apr. The founder's heuristic (wiring > extension > new build; 
self-serving before outward) was discovered when he reconciled two overlapping lists. 
The AI didn't have this mental model before that moment.

Q6: What kinds of changes make you nervous? What kinds of changes feel routine?
Capture format: Two lists (nervous / routine) with reasoning
Feeds into: heartbeat.md (maps to risk classification)
Why it matters: Pre-populates the change risk classification so the AI classifies correctly from day one.
LEARNED IN BUILD — session 8 Apr debrief. The three-tier risk classification (standard / elevated / 
critical) was created after an auth change went wrong because no risk classification existed.

Q7: When you disagree with the AI's recommendation, how do you want to handle it? 
[Probe: State it once and move on? Hear the AI's pushback once? Never hear pushback?]
Capture format: Free text
Feeds into: identity.md
Why it matters: Shapes the communication signals protocol.
LEARNED IN BUILD — 0d communication signals created on 6 April. "I've decided" means execute 
without re-debating. The founder will override recommendations when his instinct says the defect 
is too big to defer. The AI needs to know this before the first override happens.

Q8: What's your threshold for "this is too important to defer"? When does something jump 
the priority queue?
Capture format: Example (describe 2-3 situations where you'd override the plan)
Feeds into: soul.md
Why it matters: The AI will encounter moments where the planned sequence is wrong. 
Without this threshold, it will follow the plan even when it shouldn't.
LEARNED IN BUILD — session 6 Apr (Session B). Founder overruled deferral of engine refactoring. 
The threshold was never formalised.

Q9: How do you feel about spending money on AI calls? Is there a cost level where you'd 
say "that's too much per interaction"?
Capture format: Decision table (acceptable / concerning / unacceptable cost per call)
Feeds into: heartbeat.md
Why it matters: Determines model selection and retry strategy from day one.
LEARNED IN BUILD — sessions 8-17. MODEL_FAST vs MODEL_DEEP decisions were made across multiple 
sessions. The 20% classifier-to-mentor ratio was set intuitively. A pre-project interview 
would have established the cost philosophy upfront.
```

### SECTION 3 — DEPENDENCIES (8 minutes)

```
Q10: What decisions can only you make? What can the AI decide on its own?
Capture format: Two lists with reasoning
Feeds into: soul.md (non-delegable items), heartbeat.md (delegable items)
Why it matters: Establishes the decision authority gate before the first session.
LEARNED IN BUILD — session 10 Apr. The decision authority gate was designed into the agent 
orchestration pipeline, but the specific list (spending, publishing, external comms, irreversible 
changes, security) was established mid-build.

Q11: Are there aspects of quality that only you can judge — things where "structurally correct" 
isn't the same as "actually good"?
Capture format: List with examples
Feeds into: soul.md
Why it matters: Identifies verification dependencies the AI cannot fulfil alone.
LEARNED IN BUILD — session 14c. The mentor's prior-context awareness was verified by whether 
it "felt real" to the founder, not by token counts. The AI cannot assess this.

Q12: If you have private data that the system will use (journals, profiles, personal reflections), 
do you want to be involved in designing how it's stored and protected, or would you prefer 
to review the design after it's built?
Capture format: Free text
Feeds into: user.md
Why it matters: Determines whether the founder sees schema designs or only reviews them.
LEARNED IN BUILD — session 16 Apr. The founder chose to recuse from schema design when his 
own profile data was in scope (R20b independence principle). This ethical boundary was 
discovered, not pre-declared.
```

### SECTION 4 — FRICTIONS (10 minutes)

```
Q13: Have you worked with AI tools before? What went wrong? [Probe: Did the AI do something 
you didn't expect? Did it miss something obvious? Did it move too fast or too slow?]
Capture format: Free text (list of past friction points)
Feeds into: memory.md
Why it matters: Every friction point from past AI work will recur unless explicitly addressed.

Q14: What does "done" mean to you? [Probe: Is a function "done" when it exists, when it's 
connected to everything that uses it, or when an end user has tested it?]
Capture format: Definition (1-2 sentences)
Feeds into: heartbeat.md
Why it matters: The build-to-wire gap was the single most recurring friction in SageReasoning.
LEARNED IN BUILD — sessions 6c, 13, 14, 15, 17. detectDistress() was built in session 6c and 
not wired until session 14. Client pages weren't updated when API responses changed. 
The definition of "done" was implicitly "end-to-end and verified by the user" but was never stated.

Q15: When something breaks after a change the AI made, what do you need from the AI?
[Probe: An immediate fix? An explanation first? An apology? Just tell you it happened?]
Capture format: Free text
Feeds into: identity.md
Why it matters: Shapes the AI's error communication pattern.
LEARNED IN BUILD — session 17 Apr. The AI said "I caused this" about the client-side crash. 
The 0d-ii signals included "I caused this" but the specific expectation — own it immediately, 
don't suggest the problem is on the founder's end — was established in the 8 April debrief.

Q16: What deployment platform are you using? What are its quirks? [Probe: Serverless? 
Edge functions? Does it terminate processes after response? Does it cache aggressively?]
Capture format: List of known platform behaviours
Feeds into: memory.md
Why it matters: Platform constraints caused multiple sessions of debugging in SageReasoning.
LEARNED IN BUILD — sessions 9, 12, 14c. Vercel serverless kills fire-and-forget promises, 
strips auth headers on cross-origin redirects, and handles factory-pattern exports differently. 
Each constraint was discovered through failure.

Q17: When documentation says one thing and the actual system does another, which do you trust?
Capture format: Free text (one sentence)
Feeds into: heartbeat.md (verification protocol)
Why it matters: Determines whether assessments should be drawn from docs or from code inspection.
LEARNED IN BUILD — sessions 13, 15. Multiple documentation-reality drifts were found. 
The founder's implicit standard: trust the code. This should be stated upfront.
```

### SECTION 5 — TACIT JUDGEMENT (9 minutes)

```
Q18: What does your product stand for? What will it never do, even if users ask for it?
Capture format: Two lists (stands for / will never do)
Feeds into: soul.md
Why it matters: Product boundaries are design decisions. "Diagnose, don't prescribe" was a 
SageReasoning boundary discovered mid-build.
LEARNED IN BUILD — session 6 Apr (Session D). The founder confirmed the system diagnoses 
passions and patterns but doesn't prescribe exercises. This was implicit product philosophy, 
not a documented rule.

Q19: How do you distinguish "good enough" from "not right yet" in the product's output? 
What makes you say "that's not quite what I meant"?
Capture format: Examples (2-3 recent moments where output fell short, and why)
Feeds into: soul.md
Why it matters: This is the quality standard the AI can't assess on its own.

Q20: If a user of your product is in distress — emotionally vulnerable, making decisions under 
pressure — what should the product do?
Capture format: Free text (describe the ideal response)
Feeds into: soul.md
Why it matters: R20a (vulnerable user protection) was the single most critical safety gap found 
during the build. It existed as a rule but wasn't implemented. The founder's answer to this question 
would have prioritised its implementation from day one.
LEARNED IN BUILD — session 13 (11 April). Crisis language hit the LLM and caused 500 errors. 
The detection function existed but was connected to nothing.

Q21: How do you think about trust in AI? When should an AI agent be allowed to act on its own, 
and when should it ask?
Capture format: Decision table (action type → trust level → approval required)
Feeds into: soul.md
Why it matters: Establishes the agent trust architecture before building it.
LEARNED IN BUILD — session 10 Apr. Internal trust through structure (Stoic Brain in every workflow) 
vs. external trust through progressive testing (ATL levels). This philosophy shaped the entire 
agent orchestration pattern but was articulated mid-build.

Q22: Is there anything about how you work, what you value, or what you're trying to build 
that you think would be hard for an AI to understand? Anything that's "just how I do things" 
that you've never had to explain?
Capture format: Free text (open-ended)
Feeds into: soul.md
Why it matters: This is the question that captures what every other question missed. 
The structural trap: the person with the most valuable knowledge is worst at articulating it.
```

---

## OUTPUT SUMMARY

### 1. Count of tacit knowledge gaps found (Block 1)
**16 findings.** Distributed as: 6 should have been captured pre-project, 4 at early build, 5 at mid-build, 1 cross-cutting. The pre-project findings are the most expensive — they represent knowledge the founder already had but that was never elicited.

### 2. Three highest-value interview questions

**Q14 — "What does 'done' mean to you?"** Would have prevented the build-to-wire gap that recurred across 5+ sessions. `detectDistress()` sat unwired for 8 days. Client pages weren't updated when APIs changed. An upfront definition of "done" as "end-to-end, verified by the consumer" would have saved the most sessions.

**Q6 — "What kinds of changes make you nervous?"** Would have prevented the auth middleware incident and the seven sessions before risk classification was adopted. The founder already knew that auth changes are dangerous — the AI didn't until a protocol was written after the incident.

**Q20 — "If a user is in distress, what should the product do?"** Would have prioritised R20a implementation from the start. The distress detection gap (session 13) was the single highest-severity finding in the entire build — crisis language caused 500 errors instead of safety redirects. The founder's answer to this question would have been immediate and unambiguous.

### 3. The single most expensive gap

**The build-to-wire gap (Pattern 1).** The definition of "done" was implicitly "built and connected to every consumer, verified end-to-end" but was never articulated. This caused:
- `detectDistress()` unwired for 8 days across sessions 6c to 14 (R20a — safety-critical)
- Client-side crash on session 17 because pages weren't updated when API response shapes changed
- Marketplace skills ungated until session 15
- Fire-and-forget promises silently dropping data across 4 routes

If a single question had been asked pre-project — "when is something done?" — and the answer captured in heartbeat.md as the verification checklist, these four issues would have been caught at build time, not discovered through failure.

### 4. Recommended additions to SageReasoning markdown OS files

Based on the findings, the following should be created:

**soul.md should contain:**
- Product philosophy: diagnose, don't prescribe (T2)
- Trust architecture: internal trust through structure, external trust through testing (T8)
- Ethical self-removal principle (T15)
- Data integrity > latency, always (T11)
- Scope override threshold: structural defects that compound are not deferrable (T1)

**identity.md should contain:**
- Communication signals (already in 0d, but should be restated as the agent's voice)
- Error ownership pattern: claim it immediately, rule out own changes first
- Confidence signalling: distinguish confident / assumption / limitation
- Override acceptance: when the founder says "I've decided," execute

**user.md should contain:**
- Working pattern: burst sessions, not steady daily (T3)
- Evidence breadth standard: proposals must draw from full history, not just latest session (T4)
- Willingness to update beliefs on technical evidence (T6)
- Two-email identity situation (gmail for app, hotmail for admin)
- Verification philosophy for personalisation: experiential, not just structural (T13)

**heartbeat.md should contain:**
- Definition of "done": end-to-end, connected to every consumer, verified in the user's pathway
- Risk classification defaults: standard / elevated / critical with trigger criteria
- Prioritisation heuristic: wiring > extension > new build; self-serving before outward
- Verification checklist: API test + client rendering test + consumer grep
- Per-session: update project-context.json recent_decisions
- Quarterly: verify crisis resource phone numbers
- Platform constraints: Vercel serverless behaviours (fire-and-forget, redirect auth stripping, factory exports)

**memory.md should contain:**
- Haiku reliability boundary: simple inputs only; complex multi-stakeholder inputs need Sonnet
- Documentation-reality drift is a recurring pattern: verify against code, not docs
- Session 7b lesson: when disabling a feature as a precaution, immediately test if the error persists
- Cost philosophy: never spend more on machinery than on the work it serves
- The six-layer composition order is load-bearing and unenforced by tests

---

*This document is the evidence base for Block 3. It is not the interview template — Block 3 is the interview template. This document explains why each question matters by pointing to the specific session where the gap was felt.*
