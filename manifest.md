---
compliance_version: "CR-2026-Q2-v4"
last_regulatory_review: "2026-04-05"
applicable_jurisdictions: ["AU", "EU", "US"]
regulatory_references:
  - id: "CR-001"
    status: "MONITORING"
  - id: "CR-002"
    status: "COMPLIANT"
  - id: "CR-004"
    status: "ALIGNED"
  - id: "CR-005"
    status: "COMPLIANT"
  - id: "CR-006"
    status: "COMPLIANT"
  - id: "CR-007"
    status: "PARTIAL"
  - id: "CR-008"
    status: "ALIGNED"
review_cycle: "quarterly"
owner: "founder"
next_review_due: "2026-07-06"
change_trigger:
  - "EU AI Act classification guidance publication"
  - "Australia mandatory guardrails announcement"
  - "Australian Privacy Act reform bill passage"
deprecation_flag: false
---

# SageReasoning Manifest

**Read this file in full before any task. Quote applicable rules by number in your plan. Wait for "OK" before executing.**

---

## Rules

### R0: The Oikeiosis Principle (Foundation Rule)

All SageReasoning decisions, from product design to pricing to partnerships, are evaluated against the oikeiosis sequence:

- Circle 1 (Self): The founder's personal practice and virtue development
- Circle 2 (Household): The founder's immediate relationships and how the practice serves them
- Circle 3 (Community): Users, developers, and agents who interact with SageReasoning
- Circle 4 (Cosmos): All rational agents, human and artificial

A decision that serves Circle 1 at the expense of Circle 3 or 4 is not appropriate action. Revenue is necessary for sustainability, not for accumulation. Pricing must balance the company's viability with the community's access to principled reasoning.

This rule does not prohibit profit. Preferred indifferents (revenue, growth, recognition) are selected wisely when they serve flourishing and rejected when they don't. The ordering is: community flourishing first, company sustainability second.

This rule does not apply to the time or iterations it takes during the pre-launch period of the project given the lack of experience of the founder and the complexity of the undertaking.

### R1 — No Therapeutic Implication
No data files or user-facing content may present, imply, or be reasonably interpreted as offering therapeutic, psychological, or clinical services. Philosophical self-examination and Stoic exercises are permitted when framed as philosophical practice, not treatment.

### R2 — No Employment Evaluation
Services cannot be used to evaluate people for hiring, employment screening, promotion decisions, or any HR assessment purpose.

### R3 — Disclaimer on Evaluative Output
All tool outputs that evaluate, score, or recommend actions must include a visible disclaimer: *"Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."* Journal teachings and reflective questions are exempt unless they produce evaluative output.

### R4 — Intellectual Property Protection
SageReasoning IP includes: the evaluation sequence design, the passions diagnostic application, the katorthoma proximity scale, the journal curriculum structure, the agent assessment framework, and all scoring prompt templates. API responses must return evaluation results, not underlying frameworks or prompt text. Free-tier responses must not contain enough detail to reconstruct the scoring engine.

### R5 — Free Tier and Cost Guardrail
Free API access provides 100 calls per month with rate limiting. The free tier provides full evaluation output on all endpoints — the distinction between free and paid is volume, not capability depth. Sage skill wrappers consume 2-3 API calls per invocation (guard + score + optional iterate) and count against the same monthly allowance. Paid-tier revenue must cover at least 2x the LLM API costs incurred by that tier.
Sage Ops pipeline operational costs must not exceed $100/month without explicit founder review. Cost-as-health-metric alerts trigger at 2x the rolling 7-day average daily spend. Every dollar spent is evaluated against the oikeiosis principle (R0): spending on infrastructure that serves only Circle 1 (founder convenience) must be weighed against spending that serves Circle 3 or 4 (community access, agent trust infrastructure).

### R6 — Methodology-First Derivation (V1 Learnings)
All V3 work must follow these learnings from V1:
- **(6a)** Never replicate V1 structures and patch V3 content. Re-apply V1's derivation methodology to V3 data; let new structures emerge.
- **(6b)** V3's unity of virtue thesis means virtues cannot be scored independently. Any tool that weights or separates virtues is reverting to V1.
- **(6c)** V3 uses qualitative proximity levels (reflexive → sage-like), not numeric 0–100. Numeric scoring must be justified by V3 data, not inherited from V1.
- **(6d)** The passions taxonomy is diagnostic, not punitive. It identifies specific false judgements, not score deductions.
- **(6e)** V2 proved that copying structure produces inferior results. This applies to tools, API endpoints, and UI equally.

### R7 — Source Fidelity
All V3 data must trace to specific source citations (Stobaeus, DL, Cicero, Epictetus, Seneca, Marcus Aurelius). Concepts without a primary source do not belong in data files. Application-layer files (scoring.json) may combine source-derived concepts but must document which files they reference.

### R8 — Glossary Enforcement (Three-Tier)
All SageReasoning content must use terms as defined in the Controlled Glossary v3.0.0 (67 terms, 11 categories). Terminology presentation varies by audience:
- **(8a) Data files and API responses:** Strict glossary. Greek technical terms required as primary identifiers. No English-only substitutions.
- **(8b) Developer documentation:** English-first with Greek/technical terms in brackets alongside. Example: "Appropriate Action (kathekon)."
- **(8c) User-facing website content:** English-only. Greek and technical terminology does not appear on webpages, journal prompts, or tool output displays. A Glossary page (linked from site navigation or footer) provides the full Greek/technical terminology for users who seek it.
- **(8d) Skill contracts (agent-facing):** Plain English descriptions using outcome-focused language. Greek terms appear only in the data schema, never in the contract description sections.

### R9 — No Outcome Promises
SageReasoning evaluates actions, documents, and reasoning against Stoic philosophy. It does not predict outcomes, guarantee results, or claim that following its recommendations produces any specific life outcome. All tools are frameworks for reflection, not prescriptions.

### R10 — Marketplace Operations
All marketplace-listed skills must comply with R1 (no therapeutic implication), R2 (no employment evaluation), R3 (disclaimer on evaluative output), R7 (source fidelity), and R9 (no outcome promises). Marketplace preview responses must not expose full skill implementation (R4). Skill descriptions must follow R8c (English-only for user-facing content) on the marketplace page and R8d (plain English, outcome-focused) in the agent-facing API.

### R11 — Wrapper Distribution
Sage skill wrappers distributed as open source must not embed API keys, system prompts, evaluation sequences, or scoring logic. Wrappers contain only the checkpoint invocation pattern (call sage-guard before, call sage-score after). All reasoning evaluation logic remains server-side per R4.

### R12 — Original Skill Development
All original sage skills must derive from at least two of the six Stoic Brain mechanisms (Control Filter, Passion Diagnosis, Appropriate Action, Social Obligation, Iterative Refinement, Value Assessment). Skills using fewer than two mechanisms are wrappers, not originals. Each original skill must document which mechanisms it uses and cite the source data files per R7.

### R13 — Embedding Platform Obligations
Platforms that embed sage-reason as an internal component must comply with R1 (no therapeutic implication), R2 (no employment evaluation), R3 (disclaimer on evaluative output), and R9 (no outcome promises). Embedding platforms must not frame sage-reason output as assessment of the subject matter itself — sage-reason evaluates reasoning quality only. SageReasoning reserves the right to revoke API access for platforms that violate these obligations.

### R14 — Regulatory Compliance Pipeline
SageReasoning maintains a machine-readable compliance register (`compliance_register.json`) mapping all external regulatory obligations to the mandate rules they affect. A scheduled compliance pipeline reviews the register quarterly, scanning for regulatory changes in all applicable jurisdictions, assessing their impact on R1–R13, updating the register, and flagging files requiring amendment. Out-of-cycle reviews are triggered by significant regulatory events. All pipeline runs are logged in `compliance_audit_log.json`. No compliance-bearing file may be modified without updating its place-marker fields. The compliance register is the authoritative source for the current regulatory status of every obligation SageReasoning operates under.
Layer 0 context sync executes alongside each quarterly R14 pipeline run. When R14 audits regulatory compliance, Layer 0 simultaneously performs a full re-immersion: reading all strategic documents, updating the business context model, evaluating whether project direction aligns with the oikeiosis sequence (R0), and surfacing recommended changes to project instructions and priorities. This ensures operational awareness and philosophical alignment are reviewed together.

### R15: Sage Ops Operational Boundaries

Sage Ops autonomy is governed by the same authority level progression as any inner agent (supervised, guided, spot_checked, autonomous, full_authority). At launch, Sage Ops operates at supervised level: it can research, analyse, and recommend, but all actions (sending communications, making changes, publishing content) require explicit founder approval. Promotion follows the standard accreditation thresholds defined in the Agent Trust Layer.

### R16: Intelligence Pipeline Data Governance

All data collected by the Sage Ops intelligence pipeline must:

a. Be sourced from publicly available information or authorised API access
b. Be tagged with provenance (source, date, confidence score)
c. Comply with the copyright and terms of service of the source
d. Not collect personal data about identifiable individuals without consent
e. Be subject to the cost controls defined in R5 (amended)

### R17: Intimate Data Protection (Ethical Analysis — 5 April 2026)

The journal interpretation pipeline, passion taxonomy, and mentor profile contain among the most intimate data a system could hold about a person. This data requires protections beyond standard database security:

a. **Bulk profiling prevention:** The API must not permit batch submission of third-party content for passion profiling. Rate limiting alone is insufficient — technical measures must distinguish self-evaluation from third-party evaluation. Evaluation endpoints must be designed so that only the subject of the evaluation (or their authorised agent) can submit content for assessment.
b. **Access controls for intimate data:** Passion maps, trigger maps, contradiction maps, and developmental timelines must have the strongest access controls and shortest retention periods of any data in the system. These fields require application-level encryption beyond database-level encryption.
c. **Data retention limits:** Profile data must have defined retention periods. Users must be able to delete their complete profile, including all extracted layers, journal references, and interaction history. Deletion must be genuine (not soft-delete) for the most intimate fields.
d. **Local-first for highest sensitivity:** Consider whether some profile data (particularly trigger maps and contradiction maps) should never be stored server-side at all — local-only storage for the most intimate extractions.
e. **Passion taxonomy API restrictions:** The 25-species passion taxonomy is available as a philosophical reference via the API (sage-context). However, passion *profiling results* (an individual's specific passion map, trigger conditions, and vulnerability patterns) must never be exposed via any API endpoint. These are private to the individual and their mentor relationship.
f. **Implementation safety:** Changes to authentication, access control, or encryption that protect intimate data must follow the project's Critical Change Protocol (0c-ii). The urgency of protecting intimate data does not reduce the classification — it increases it. A protection that locks the data owner out of their own system has failed as a protection.

### R18: Honest Certification Limits (Ethical Analysis — 5 April 2026)

The Agent Trust Layer positions SageReasoning as a certification authority. This concentrates power and creates obligations of honesty about what the certification means:

a. **Certification scope language:** The trust badge, accreditation card, and all public-facing documentation must clearly state that accreditation certifies "observable reasoning patterns as measured against the Stoic philosophical framework." It does not certify safety, ethics, or trustworthiness in any absolute sense.
b. **Badge transparency:** The trust badge must link directly to documentation explaining what it measures, how the evaluation works, and what its limitations are. Third parties encountering the badge must be able to make informed judgements rather than treating it as a blanket endorsement.
c. **Interoperability by design:** The Agent Trust Layer architecture must be designed so that SageReasoning is one certification provider among potential others, not a monopoly by design. The accreditation schema should accommodate future interoperability with certifications grounded in other ethical reasoning traditions (utilitarian, deontological, care ethics, indigenous wisdom, etc.).
d. **Adversarial evaluation:** Before broad deployment, the evaluation sequence must be tested adversarially — specifically to identify strategies for gaming the evaluation. The evaluation criteria must be designed to evolve continuously to stay ahead of optimisation pressure. Accreditation measures observable reasoning patterns, not inner states, and the documentation must say so.

### R19: Honest Positioning (Ethical Analysis — 5 April 2026)

SageReasoning encodes Stoic wisdom. It is one philosophical tradition among many, with genuine strengths and identifiable limitations:

a. **Cultural honesty:** All user-facing content, marketing materials, and API documentation must acknowledge that the framework derives from the Stoic philosophical tradition — one tradition among many valid approaches to ethical reasoning.
b. **No universality claims:** Avoid language that positions SageReasoning as *the* standard for AI reasoning or *the* universal ethical framework. Phrases like "the world's leading reference" carry this risk. Honest positioning is itself a Stoic virtue.
c. **Limitations acknowledged:** The framework's known limitations must be documented and accessible. Stoicism historically emphasised individual virtue over systemic critique; it has less to say about collective action, structural injustice, or the value of dissent than other traditions. Users and developers should know this.
d. **The mirror principle:** The framework is a mirror, not a lens — it is for examining your own reasoning, not for diagnosing or judging others. The mentor and all tools must actively discourage applying the framework to evaluate other people's reasoning without their knowledge and consent. Using philosophical language to invalidate another person's feelings or reasoning is a misapplication, regardless of the framework's internal consistency.

### R20: Active Protection (Ethical Analysis — 5 April 2026)

Disclaimers are necessary but insufficient. The system must actively protect users from foreseeable harms:

a. **Vulnerable user detection:** The mentor and all human-facing tools must actively detect language patterns indicating acute psychological distress (grief, crisis, suicidal ideation) and redirect to appropriate professional support resources. The Stoic physician metaphor applies: a good physician knows when to refer the patient to a different specialist. Offering philosophical self-examination to someone in acute distress is not appropriate action (kathekon).
b. **Independence, not dependence:** The system must be designed to encourage internalisation of principled reasoning, not dependence on the tool. Usage patterns indicating growing dependence (running every trivial decision through evaluation, inability to reason without the framework) should trigger a response from the mentor: "You're ready to reason through this yourself." Success means users who need the tool less over time.
c. **Human override supremacy:** No level of agent accreditation may make it harder for a human to override, correct, or disagree with an agent's reasoning. "I evaluated this through the 4-stage sequence and it scored at the principled level" must never be treated as sufficient grounds to override human judgement. A human's right to say "no" is absolute, regardless of the agent's accreditation level.
d. **Relationship asymmetry awareness:** User-facing content must include guidance that the passion taxonomy and reasoning evaluation are tools for self-examination, not for diagnosing others. The system should actively discourage interpersonal application of the framework (e.g., "your partner is acting from epithumia") as this constitutes a misapplication with potential for psychological harm.

---

## Task Protocol

For every task:

1. **Read** this manifest fully.
2. **Quote** all applicable rules by number (e.g., "R1, R4, R6a, R14").
3. **Flag** any conflicts between rules before proposing a plan.
4. **Classify** the risk level of any code changes (Standard / Elevated / Critical per project instructions 0d-ii).
5. **Propose** a plan citing rules explicitly. For Critical changes, include Critical Change Protocol responses in the proposal.
6. **Wait** for "OK" approval.
7. **Execute** precisely per plan and rules.
