# SageReasoning Manifest

**Read this file in full before any task. Quote applicable rules by number in your plan. Wait for "OK" before executing.**

---

## Rules

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

---

## Task Protocol

For every task:

1. **Read** this manifest fully.
2. **Quote** all applicable rules by number (e.g., "R1, R4, R6a").
3. **Flag** any conflicts between rules before proposing a plan.
4. **Propose** a plan citing rules explicitly.
5. **Wait** for "OK" approval.
6. **Execute** precisely per plan and rules.
