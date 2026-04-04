---
title: "Common Questions"
category: faq
last_updated: 2026-04-04
source_files: []
governance_rules: [R1, R3, R5, R9]
---

# Common Questions

## Is SageReasoning Therapy?

No. SageReasoning is a philosophical reasoning evaluation tool, not therapy or clinical psychology. You can use Stoic philosophy for meaningful personal reflection and self-improvement, but SageReasoning does not provide mental health treatment. If you're experiencing clinical anxiety, depression, or other mental health concerns, please consult a qualified therapist or physician. SageReasoning is a supplementary philosophical practice, not a substitute for professional care. See R1 for more details.

## Can I Use SageReasoning for Hiring or Employment Decisions?

No. SageReasoning is explicitly prohibited from use in hiring, firing, promotion, or other employment decisions about individuals. This restriction (R2) protects against algorithmic bias in high-stakes personnel decisions. You may use SageReasoning for your own reasoning about your career, but not to evaluate or make decisions about other people's employment. Violating this prohibition has legal and ethical consequences.

## Why Don't I Get a Numeric Score?

SageReasoning uses qualitative proximity levels (aligned, moderate, conflicted, resistant) rather than numeric scores because Stoic sources describe virtue and reasoning quality as a gradient or spectrum, not a quantified scale. Marcus Aurelius, Seneca, and Epictetus describe progress toward wisdom as directional and continuous, not measurable on a 0-100 axis. This design choice (R6c) honors the philosophical tradition while remaining honest about what can be measured. Numeric scores would be false precision.

## What Happens When My Free Calls Run Out?

Free tier accounts include 100 calls per month across all endpoints. When you reach this limit, further API calls will return a rate limiting error. You have two options: upgrade to a paid plan for higher monthly limits, or wait for your quota to reset on the first of the next month. Your usage is tracked in the `meta` object of every response, so you can monitor your remaining calls.

## Can I Use SageReasoning in My Own AI Agent?

Yes, absolutely. Integrating SageReasoning into your own AI agents or applications is a core use case. Every endpoint is composable—agents can chain `/api/reason` → `/api/score-iterate` → `/api/score-decision` to build multi-step reasoning flows. See the `composability` field in the meta object for supported patterns. Check out AGENTS.md in the SageReasoning GitHub repo for agent integration examples and the skill wrapper template for wrapping evaluations in your own tool definitions.

## Is My Data Private?

Yes. All data is scoped to your user account and protected by Row Level Security (RLS). SageReasoning does not share, sell, or use your evaluation data for training, marketing, or any other purpose. Data you submit is processed, stored under your account, and accessible only to you. We publish our data handling policies in the account settings dashboard. If you have specific data protection requirements, contact support for enterprise agreements.

## What's a "Passion" in This Context?

In SageReasoning, a "passion" is a cognitive error or false judgement in the technical Stoic sense—not an emotion. Stoic philosophers used "passion" to mean a mistaken belief about what is good or bad. For example, believing that external poverty is evil (when it's indifferent) is a passion. Believing that your reputation depends entirely on your control (when it doesn't) is a passion. Identifying passions is how Stoic reasoning works—you catch the false judgement and correct it. It's a philosophical diagnostic tool, not a clinical assessment.

## How Accurate Is SageReasoning?

SageReasoning evaluates reasoning quality based on Stoic philosophy. Accuracy depends on two factors: (1) the quality of input context you provide, and (2) alignment with Stoic principles. If you describe your decision clearly and provide relevant context, the evaluation will accurately reflect how well your reasoning aligns with virtue, the dichotomy of control, and other Stoic frameworks. The tool does not predict outcomes or guarantee results—it evaluates the quality of your thinking. See R9 for details.

## Do I Need an API Key to Try SageReasoning?

No. The `/api/evaluate` endpoint works without authentication and is designed for instant demos. You can explore how SageReasoning evaluates reasoning before committing to an API key or paid plan. Authenticated endpoints (requiring `sr_live_` or `sr_test_` keys) unlock higher volume limits, composability features, and full API access. Start with `/api/evaluate` to decide if SageReasoning fits your use case.

## What If I Have a Question Not Covered Here?

Check the full knowledge base articles for deeper explanations of API authentication, endpoint details, governance rules, and implementation patterns. For technical issues or account-specific questions, contact support at support@sagereasoning.com. For API integration questions, see the developer documentation at https://www.sagereasoning.com/api/ and check the GitHub repository for examples and templates.
