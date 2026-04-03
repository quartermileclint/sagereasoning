# SageReasoning Prompt Architecture

**Internal document — R4: This file documents server-side prompt design. Do not expose to API consumers.**

Date: 3 April 2026
Post-simplification audit (Phase 13)

---

## Design Principles

1. **Specify what and why, not how.** Prompts define the evaluation outcome and governance constraints. They do not prescribe step-by-step reasoning sequences — the model infers procedure from the output schema and V3 data context.

2. **V3 data files are the source of truth.** Prompts reference concepts from the 8 V3 data files (stoic-brain.json, virtue.json, value.json, action.json, psychology.json, passions.json, progress.json, scoring.json). If a concept isn't in the data files, it doesn't belong in a prompt.

3. **Governance rules are non-negotiable.** Every prompt enforces applicable manifest rules (R1–R13). These constraints survive any model swap or prompt simplification.

4. **Model-agnostic.** Prompts work with any sufficiently capable LLM. No model-specific formatting, no chain-of-thought coercion, no role-play framing.

---

## Prompt Inventory

### Tier 1: Core Evaluation Engine

| Prompt | File | Tokens | V3 Files Referenced | Rules Enforced |
|--------|------|--------|---------------------|----------------|
| sage-reason (quick) | api/reason/route.ts | ~1,120 | stoic-brain, passions, action | R3, R4, R6b-d, R12 |
| sage-reason (standard) | api/reason/route.ts | ~1,540 | + value, virtue, scoring | R3, R4, R6b-d, R12 |
| sage-reason (deep) | api/reason/route.ts | ~1,850 | All 8 files | R3, R4, R6b-d, R9, R12 |
| sage-score | api/score/route.ts | ~1,360 | scoring, passions, action, virtue | R3, R4, R6b-d |
| sage-iterate (initial) | api/score-iterate/route.ts | ~2,050 | scoring, passions, action, virtue | R3, R4, R6b-d |
| sage-iterate (chain step) | lib/deliberation.ts | ~1,820 | scoring, passions, action, virtue | R3, R4, R6b-d |

### Tier 2: Specialised Evaluations

| Prompt | File | Tokens | V3 Files Referenced | Rules Enforced |
|--------|------|--------|---------------------|----------------|
| guardrail | lib/guardrails.ts | ~600 | scoring, passions | R3, R4, R6c |
| reflect | api/reflect/route.ts | ~900 | passions, virtue | R1, R3, R9 |
| score-conversation | api/score-conversation/route.ts | ~1,400 | virtue, passions | R3, R6b-c |
| document-scorer | lib/document-scorer.ts | ~2,200 | scoring, passions, action, virtue, value | R3, R4, R6b-d |
| evaluate (demo) | api/evaluate/route.ts | ~800 | stoic-brain, passions, action | R3, R4, R5 |

### Tier 3: Sage Skills

| Prompt | File | Tokens | V3 Files Referenced | Rules Enforced |
|--------|------|--------|---------------------|----------------|
| sage-prioritise | lib/sage-prioritise.ts | ~1,800 | passions, action, value | R3, R4, R6c, R12 |
| sage-classify | lib/sage-classify.ts | ~1,200 | passions, scoring | R3, R4, R6c, R12 |
| agent-baseline | lib/agent-baseline.ts | ~1,300 | scoring, passions, progress, virtue | R1, R2, R3, R6b-c, R9 |

**Total prompt tokens across all variants: ~18,940** (reduced from ~22,180 pre-simplification)

---

## Prompt Content Categories

Each prompt contains content in three categories:

### (A) Outcome Specification (~45% of tokens)
What the evaluation must produce. Includes JSON output schemas, field definitions, and expected value types. This is the core contract with the model.

**Example:** "Return katorthoma_proximity as one of: reflexive, habitual, deliberate, principled, sage_like"

### (B) Governance Constraints (~35% of tokens)
Rule enforcement that cannot be removed regardless of model capability. Includes R3 disclaimer text, R6b unity of virtue enforcement, R6c qualitative-only output, R1 non-therapeutic framing, R9 no outcome promises.

**Example:** "Passions are diagnostic — they identify false judgements, not score deductions (R6d)"

### (C) Domain Knowledge (~20% of tokens)
Non-obvious Stoic philosophical concepts that no model can reliably infer without context. Includes the passions taxonomy (4 root + 25 sub-species), Cicero's 5 deliberation questions, oikeiosis circles, preferred indifferents list, Senecan grades.

**Example:** The 25 sub-species of passion are domain-specific knowledge that must be provided.

---

## Model Swap Procedure

When switching to a new model (e.g., Claude Mythos):

1. **Keep all (A) outcome specs and (B) governance constraints unchanged.**
2. **Test (C) domain knowledge**: Run the standard test set. If the new model produces correct Stoic terminology and concepts without the domain knowledge section, it can be removed for that model. If not, retain it.
3. **Never remove governance constraints** even if the model "knows" the rules — constraints are enforcement, not education.
4. **Update cost estimates** in AGENTS.md skill contracts if per-token pricing changes.

---

## Mechanisms Referenced in Prompts

All prompts draw from these 6 V3 mechanisms (R12 requires minimum 2 per skill):

| Mechanism | Source File | Used By |
|-----------|------------|---------|
| Control Filter (Prohairesis) | stoic-brain.json, psychology.json | All prompts |
| Passion Diagnosis | passions.json | All prompts |
| Oikeiosis (Social Obligation) | action.json | reason, score-iterate, prioritise, document-scorer |
| Value Assessment | value.json | reason (standard+deep), document-scorer |
| Kathekon (Appropriate Action) | action.json, scoring.json | reason (standard+deep), score, score-iterate |
| Iterative Refinement (Senecan) | progress.json | reason (deep), deliberation chain |
