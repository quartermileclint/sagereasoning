# Debrief Learnings → Product Line Applications

**Date:** 8 April 2026
**Source:** Auth middleware debrief + 42-session historical review
**Purpose:** Map collaboration learnings to product capabilities — both for our own development and for end users

---

## The Core Insight

The debrief produced seven learnings about how AI-human collaboration breaks down and what prevents it. These are not just operational fixes for our working relationship. They are reasoning principles — and SageReasoning is a reasoning product. Every learning that improved our collaboration protocol has a direct application in at least one product component.

The distinction that matters: some applications improve how we use these tools during development (Circle 1 — self). Others improve the product for end users and agent developers (Circle 3 — community). The best applications serve both simultaneously. Those are marked below.

---

## Learning 1: Verify → Decide → Execute

**The principle:** The collaboration works when the AI surfaces options and constraints, the founder decides, and only then does the AI execute. Failures occur when the AI skips the decision step.

### sage-guard (guardrail engine)

The current sage-guard evaluates whether an action meets a virtue threshold — it returns proceed/pause/do_not_proceed. What it does not evaluate is whether the decision to act was made through the verify-decide-execute sequence. An action can score well on virtue alignment but still be wrong if it was executed without adequate deliberation.

**Application:** Add a `deliberation_quality` field to the guardrail response. This assesses not just "is this action virtuous?" but "was the decision to act adequately deliberated?" An action taken hastily under urgency would receive a lower deliberation score even if its virtue alignment is high. The guardrail already runs control_filter (what's within my control?) and passion_diagnosis (what distortions are present?). Adding a deliberation check asks: was there a decision point, or did impulse skip it?

**Serves:** End users (agents get feedback on decision quality, not just action quality). Also serves our development (Sage Ops actions would be evaluated on deliberation quality before execution).

### sage-decide (decision scoring)

sage-decide currently ranks options by virtue alignment. It evaluates what to do. It does not evaluate whether the process of arriving at the decision was sound.

**Application:** sage-decide could accept an optional `process` parameter describing how the options were identified and narrowed. The scoring would then include a process quality assessment alongside the option rankings. A well-identified set of options evaluated through a sound process scores higher than the same options arrived at through hasty elimination. This maps directly to the Stoic concern with the quality of assent — not just what you assent to, but how carefully you examined the impression before assenting.

**Serves:** End users (practitioners get feedback on their decision process, not just their options). Agent developers (agents can self-evaluate their option-generation process).

---

## Learning 2: Risk Classification (Standard / Elevated / Critical)

**The principle:** Not all changes carry the same risk. The protocol required should scale with the potential for harm.

### sage-guard (guardrail engine)

sage-guard currently has a single threshold parameter. Every action is evaluated against the same depth and process. But the debrief showed that some categories of action — authentication, access control, data deletion — need fundamentally more scrutiny, not just a higher threshold.

**Application:** Add a `risk_class` input to sage-guard that triggers different evaluation depths automatically. A Standard action gets quick depth (3 mechanisms). An Elevated action gets standard depth (5 mechanisms). A Critical action gets deep depth (6 mechanisms) and the response includes a mandatory `rollback_path` field — the guardrail doesn't just say "proceed with caution," it requires the agent to articulate how to undo the action.

This maps to the existing depth configuration (quick/standard/deep) but makes the selection automatic based on action category rather than leaving it to the caller. Authentication changes, data deletion, and access control modifications would be hard-coded as Critical, just as R17f now requires.

**Serves:** Agent developers (automatic risk-appropriate evaluation depth). Our development (Sage Ops actions classified before execution). End users (the guardrail protects more carefully when stakes are higher).

### Ring Wrapper (before/after pattern)

The ring wrapper already has escalation rules in `selectModelTier` — it routes to Sonnet (deep) when there are concerns, novel situations, supervised agents, or grade transitions. But it doesn't escalate based on action category.

**Application:** Add action-category escalation to the model routing. If the inner agent's proposed action touches authentication, data deletion, or access control, the before-check always uses Sonnet regardless of the agent's authority level. This is the ring-wrapper equivalent of R17f: the category of action determines the scrutiny, not the agent's track record.

**Serves:** Agent developers (their agents get appropriate scrutiny automatically). Our development (ring-wrapped Sage Ops actions get category-appropriate evaluation).

---

## Learning 3: Communication Signals ("I'm making an assumption", "This has a known risk", "I caused this")

**The principle:** The AI must signal its confidence level, name its assumptions, and own its errors. The collaboration fails when the AI presents uncertainty as confidence.

### Sage Mentor (persona and interaction)

The Mentor persona currently defines its voice, reasoning framework, and governance constraints. It does not explicitly require the Mentor to signal its confidence level in its assessments.

**Application:** Add confidence signalling to the Mentor's interaction protocol. When the Mentor assesses a practitioner's reasoning, it should distinguish between observations it's confident in (grounded in multiple journal entries or repeated patterns), assumptions it's making (based on limited data or inference), and limitations it acknowledges (areas where the framework doesn't apply well). The signals from our 0d protocol — "I'm confident," "I'm making an assumption," "This is a limitation" — translate directly into Mentor communication norms.

This also addresses a risk identified in the ethical analysis (R19d, the mirror principle): the Mentor should not present its philosophical assessments with false certainty. Signalling confidence levels is how the mirror stays honest.

**Serves:** End users (practitioners receive honest, calibrated assessments rather than authoritative-sounding pronouncements). Our development (when we use the Mentor ourselves, the assessments are more trustworthy).

### Agent Trust Layer (accreditation)

The accreditation card tracks an agent's proximity level, grade, authority, and travel direction. It does not track the agent's signalling behaviour — whether the agent communicates its uncertainty honestly.

**Application:** Add a `signalling_quality` dimension to the accreditation assessment. An agent that signals its assumptions, names known risks before acting, and owns its errors when they occur would score higher on this dimension than one that presents all outputs with equal confidence. This is measurable: does the agent's output distinguish between high-confidence and low-confidence claims? Does it flag assumptions? Does it acknowledge errors without deflection?

This maps to R18 (honest certification): the trust badge should certify honest reasoning, and honest reasoning includes honest confidence signalling. An agent that is always "confident" is either unreliable or dishonest about its uncertainty.

**Serves:** Agent developers (their agents are incentivised to signal honestly). End users (agents interacting with them are transparently calibrated). Our development (Sage Ops is evaluated on signalling quality).

---

## Learning 4: Urgency Increases Scrutiny, Not Decreases It

**The principle:** The auth session failed because urgency was treated as permission to skip verification. The correct response to urgency is more care, not less.

### sage-reason (reasoning engine)

The sage-reason engine currently has no concept of urgency. It evaluates the content of a decision, not the conditions under which it's being made. But the Stoic framework has a direct concept for this: hasty assent (propeteia). Assenting to an impression without adequate examination is a specific failure mode in Stoic psychology — and it's exactly what happened in the auth session.

**Application:** Add an optional `urgency_context` parameter to sage-reason. When present, the engine applies additional scrutiny to the passion_diagnosis stage, specifically checking for hasty assent patterns: is the urgency itself a passion (fear of the data exposure) driving action without adequate examination? The output would include a `hasty_assent_risk` field that flags when urgency may be compromising deliberation quality.

This is not artificial — the Stoic Brain's psychology.json already contains the hasty assent concept. The application connects an existing data file to a real reasoning pattern that our own collaboration exposed.

**Serves:** End users (practitioners get warned when urgency is driving their reasoning). Agent developers (agents can detect when their own urgency-driven processes are cutting corners). Our development (when we're tempted to rush a fix, the reasoning engine flags it).

### sage-guard (guardrail extension)

**Application:** When sage-guard receives an action flagged with urgency context and the action is classified as Critical, it should require the caller to provide a `considered_alternatives` field — what other approaches were evaluated before this one? If no alternatives were considered, the guardrail flags this as a hasty assent risk. The auth session would have been caught by this: the AI went straight to "change the client type" without considering alternatives (cookie bridge, client-side redirect check, etc.).

**Serves:** Agent developers (agents must demonstrate they considered alternatives for critical actions). Our development (forces the AI to present options before acting on urgent problems).

---

## Learning 5: Trust Erosion and Rebuilding Patterns

**The principle:** Trust erodes when the AI causes a problem and doesn't own it. Trust rebuilds through honest acknowledgement and demonstrated competence.

### Agent Trust Layer (accreditation card dynamics)

The accreditation card currently tracks `travel.direction` (improving/stable/declining). It does not model the specific dynamics of trust erosion — that trust can drop sharply from a single incident but rebuilds gradually through consistent performance.

**Application:** Add asymmetric trust dynamics to the accreditation model. A single Critical failure (causing harm, failing to own an error, presenting uncertainty as confidence) should produce a steeper downgrade than gradual accumulation. Recovery requires consistent performance over multiple evaluations, not a single good outcome. This mirrors how trust actually works in human relationships and how it worked in our collaboration — one bad session caused more damage than four good sessions built.

The Senecan grade system already supports this conceptually (progress is gradual, setbacks are sharper). The application makes this asymmetry explicit in the scoring algorithm.

**Serves:** Agent developers (trust dynamics are realistic, not just point accumulation). End users (agents they interact with have been evaluated on trust resilience, not just current state).

---

## Learning 6: The Debrief as Structured Practice

**The principle:** When things go wrong, the productive response is structured retrospective analysis — not blame, not avoidance, not comfort.

### Sage Stenographer (new debrief mode)

The sage-stenographer currently has two modes: session close (capture handoff) and session open (read handoff). The debrief protocol we adopted (0b-ii) defines a third mode.

**Application:** Add a "debrief" trigger to the stenographer. When invoked, it reads the transcript of a specified session, cross-references handoff notes and the decision log, and produces a structured debrief covering communication breakdowns, capability assumptions, troubleshooting gaps, and user impact. This is what we did manually in this session. Automating it makes it available to any SageReasoning user working with AI collaboration.

**Serves:** Our development (debriefs become a one-command operation). End users (the startup preparation toolkit gains a retrospective capability). This is a candidate for 0g — a workflow skill that earned its place through manual use.

### sage-retro (wrapped skill)

sage-retro is currently a placeholder wrapper. The debrief protocol we developed is essentially a specialised retrospective framework.

**Application:** sage-retro could implement the debrief structure as its core reasoning pattern: given a description of what happened, evaluate communication quality, assumption errors, verification gaps, and impact trajectory. The Stoic framing adds the passion-diagnosis layer — was the failure driven by a specific false judgement? Was hasty assent involved? The 42-session review showed that our failures consistently involve the same pattern (AI skipping the decide step under urgency). sage-retro could detect this pattern in any described scenario.

**Serves:** End users (practitioners get structured retrospectives on their own decisions). Agent developers (agents can run retrospectives on their own performance). Our development (we can run sage-retro on our own sessions).

---

## Learning 7: Side Effects Require Ownership

**The principle:** When a change creates unintended consequences (git lock files, broken sessions, rate limits), the actor must own the cleanup rather than passing it to the person affected.

### Ring Wrapper (after-check enhancement)

The ring wrapper's AFTER stage currently evaluates output reasoning quality, updates the accreditation card, and surfaces journal insights. It does not check for side effects of the action taken.

**Application:** Add a side-effect detection step to the AFTER stage. After an inner agent completes an action, the ring checks: did this action change the state of any system beyond its intended scope? Are there artefacts to clean up (temporary files, lock files, rate-limit states)? If side effects are detected, the ring requires the agent to remediate before the action is considered complete.

**Serves:** Agent developers (their agents are held accountable for side effects). Our development (Sage Ops actions include cleanup verification).

---

## Summary: Dual-Use Applications

| Learning | Product Component | Our Development | End Users | Agent Developers |
|---|---|---|---|---|
| Verify → Decide → Execute | sage-guard, sage-decide | Sage Ops action evaluation | Decision process feedback | Agent decision quality scoring |
| Risk Classification | sage-guard, ring wrapper | Automatic depth for Ops actions | Risk-appropriate protection | Category-based escalation |
| Communication Signals | Sage Mentor, Trust Layer | Honest Mentor assessments | Calibrated practitioner feedback | Signalling quality in accreditation |
| Urgency → More Scrutiny | sage-reason, sage-guard | Hasty assent detection in our work | Urgency-aware practitioner coaching | Alternative-consideration requirement |
| Trust Erosion Dynamics | Trust Layer accreditation | Realistic Ops trust progression | Honest agent trust scores | Asymmetric trust modelling |
| Structured Debrief | sage-stenographer, sage-retro | One-command session debriefs | Startup toolkit capability | Agent self-retrospective |
| Side Effect Ownership | Ring wrapper AFTER stage | Sage Ops cleanup verification | Accountability in agent actions | Side-effect detection requirement |

---

## Implementation Priority

These are not all equal in urgency or effort. The applications that serve our own development most immediately — and that we can test on ourselves before offering to users — should come first. Following the P0 principle: manual process first, prove the pattern, then build.

**Immediate (can inform current development without code changes):**
The risk classification and urgency-scrutiny principles are already adopted in our working protocols. Every session from now on applies them. The sage-guard and sage-reason changes would formalise what we're already practising.

**Near-term (when sage-reason and sage-guard get their live pipeline):**
Add `deliberation_quality`, `risk_class` input, `hasty_assent_risk`, and `considered_alternatives` to the guardrail and reasoning APIs. These extend the existing depth/mechanism system without restructuring it.

**Medium-term (when the Trust Layer is wired):**
Add `signalling_quality` dimension and asymmetric trust dynamics to the accreditation model. These require the Trust Layer to be functional (P3 scope).

**When sage-stenographer is registered:**
Add the debrief mode. This is the lowest-effort, highest-immediate-value application — it automates what we just did manually and adds it to the startup toolkit.

---

## The R0 Frame

Every application above traces back to the oikeiosis sequence. The debrief examined our own reasoning (Circle 1). The protocol changes improve our immediate working relationship (Circle 2). The product applications serve users and developers (Circle 3). The Trust Layer improvements extend honest reasoning to all agents (Circle 4). This is R0 working as intended — a failure at Circle 1 producing improvements that radiate outward through all four circles.
