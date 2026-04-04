---
title: "Disclaimers Explained"
category: governance
last_updated: 2026-04-04
source_files: [manifest.md]
governance_rules: [R3, R9]
---

# Disclaimers Explained

Two governance rules work together to define what SageReasoning can and cannot claim: **R3** and **R9**. Every support agent should understand what these disclaimers mean and why they appear on every evaluative output.

## R3: The Universal Disclaimer

**Every evaluative output must include this disclaimer:**

> "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."

This appears on all outputs from tools that evaluate, score, or recommend. It does NOT appear on:
- Journal prompts and reflective questions
- Educational content about Stoic philosophy
- Metadata or usage information

### What R3 Protects

The disclaimer clarifies that SageReasoning:

- **Does not give legal advice**: An evaluation of a contractual decision is philosophical reasoning, not legal counsel
- **Does not give medical advice**: An evaluation of a health-related decision is philosophical reflection, not medical guidance
- **Does not give financial advice**: An evaluation of an investment or spending decision is reasoning analysis, not financial planning
- **Does not consider personal obligations**: While your actual life involves legal duties, medical necessities, and financial constraints, SageReasoning evaluates pure reasoning quality without those real-world obligations in view

### Example

A user asks: *"Should I accept this settlement in my lawsuit?"*

SageReasoning might evaluate: *"Your reasoning shows a virtue-aligned focus on justice, but a false judgement about your control in the outcome. Here's the qualitative analysis..."*

The disclaimer clarifies: *This is a philosophical evaluation of your reasoning. It is NOT legal advice. You must consult an attorney before accepting any settlement.*

## R9: SageReasoning Does Not Predict Outcomes

**R9 states**: SageReasoning evaluates reasoning quality, not outcomes. Following a recommendation does not guarantee any specific life result.

### What R9 Protects

The rule clarifies that:

- **Good reasoning ≠ guaranteed good outcomes**: A decision can be excellently reasoned and still fail due to external circumstances
- **SageReasoning is not predictive**: We evaluate how well you're thinking, not what will happen if you act
- **Frameworks are for reflection, not prescription**: All tools are meant to deepen self-examination, not dictate action

### Example

A user's decision is evaluated as "aligned with virtue and control." They follow the reasoning and suffer a bad outcome anyway.

R9 ensures that SageReasoning has not promised success, only that their reasoning was sound. The evaluation was accurate. The outcome was not guaranteed.

## When Disclaimers Appear

### Tools That Include the Disclaimer
- `/api/reason` (all depth levels)
- `/api/score-iterate` (deliberation analysis)
- `/api/score-decision` (option ranking)
- Any custom endpoint that returns evaluative reasoning

### Tools That Exclude the Disclaimer
- `/api/evaluate` (demo endpoint—includes disclaimer in UI, not API response)
- `/api/guardrail` (binary gate—no evaluative reasoning, just pass/fail)
- Journal endpoints (reflective prompts, not evaluative)
- Educational endpoints (Stoic teachings, not evaluations)

## Why These Disclaimers Matter

1. **Legal liability**: Protects both SageReasoning and users from liability for following philosophical guidance in domains requiring professional expertise
2. **User expectations**: Users understand that they're getting philosophy, not professional services
3. **Philosophical integrity**: Keeps Stoic reasoning in its proper place—as a tool for reflection, not a replacement for expertise
4. **Ethical practice**: Ensures users make final decisions with full awareness of the evaluation's scope and limits

## What Should I Tell Customers?

### If They Ask Why the Disclaimer Exists

*"SageReasoning evaluates your reasoning quality using Stoic philosophy. We're not lawyers, doctors, or financial advisors. The disclaimer ensures you know that a good philosophical evaluation doesn't replace professional guidance in legal, medical, or financial matters. You should still consult relevant experts before making decisions in those domains."*

### If They Ask Whether They Can Ignore the Disclaimer

*"No. The disclaimer is part of the evaluation. It tells you what SageReasoning can and cannot do. If you're making a decision with legal, medical, or financial consequences, the disclaimer reminds you to seek appropriate professional advice alongside your philosophical reflection."*

### If They Ask Whether SageReasoning Guarantees Results

*"No. SageReasoning evaluates whether your reasoning is sound by Stoic standards. Sound reasoning is valuable, but outcomes depend on many factors outside your control. We evaluate the quality of your thinking, not predict what will happen."*

## Red Flags

If a customer:
- Treats SageReasoning evaluations as legal, medical, or financial advice → Remind them of R3
- Expects guaranteed outcomes from following an evaluation → Remind them of R9
- Uses the system to replace professional consultation → Encourage them to seek expert advice first
- Tries to remove or hide the disclaimers → Escalate (this violates R3 and R9)

The disclaimers are non-negotiable. They are core to how SageReasoning operates responsibly.
