---
title: "The sage-reason Endpoint"
category: api
last_updated: 2026-04-04
source_files: [scoring.json]
governance_rules: [R3, R4, R6c, R12]
---

# The /api/reason Endpoint

## Overview

`POST /api/reason` is SageReasoning's universal reasoning evaluation layer. It accepts a decision or action being considered and returns a qualitative analysis of the reasoning quality through the lens of Stoic philosophy. Every response derives from at least 2 of the 6 Stoic Brain mechanisms (R12).

## Request Parameters

- **input** (required): The decision, action, or reasoning you want evaluated. Example: "Should I leave my job to start a business?"
- **context** (optional): Situational details that help frame the evaluation. Example: "I have 6 months savings and 2 dependents."
- **depth** (optional): Reasoning depth level. Options: `quick`, `standard`, `deep`. Defaults to `standard`.

## Depth Levels

### Quick
- **Evaluation**: Core Stoic triad analysis
- **Components**:
  - Control filter (dichotomy of control assessment)
  - Passion diagnosis (false judgements detected)
  - Oikeiosis (alignment with nature/role)
- **Latency**: ~1-2 seconds
- **Cost**: ~$0.06 per call

### Standard
- **Evaluation**: Complete diagnostic reasoning
- **Components**: All quick components, plus
  - Value assessment (virtue vs external goods)
  - Kathekon evaluation (duty and role-appropriate action)
- **Latency**: ~2-3 seconds
- **Cost**: ~$0.12 per call

### Deep
- **Evaluation**: Extended deliberation framework
- **Components**: All standard components, plus
  - Senecan progress tracking (direction of travel in virtue)
  - Extended mechanism integration (all 6 Stoic Brain patterns)
- **Latency**: ~3-4 seconds
- **Cost**: ~$0.18 per call

## Response Structure

All responses follow the standard SageReasoning envelope:

```json
{
  "result": {
    "proximity_level": "moderate",
    "passions_detected": [
      {
        "name": "fear of failure",
        "false_judgment": "I cannot survive loss of income",
        "source": "dichotomy violation"
      }
    ],
    "analysis": {
      "control_filter": "Mixed — some factors within control (preparation), many external (market reception)",
      "kathekon": "Decision aligns with role-appropriate prudence given dependents",
      "virtue_assessment": "Pursuing wisdom is virtuous; pursuing security alone is not"
    }
  },
  "meta": {
    "endpoint": "/api/reason",
    "ai_model": "stoic-v3",
    "latency_ms": 2847,
    "cost_usd": 0.12,
    "is_deterministic": false,
    "composability": ["score-iterate", "score-decision"],
    "usage": {
      "calls_this_month": 42,
      "calls_remaining": 58
    }
  }
}
```

## Output Explanation

- **proximity_level**: Qualitative rating (aligned, moderate, conflicted, resistant) indicating how closely the reasoning aligns with Stoic principles
- **passions_detected**: Array of cognitive errors (false judgements) identified, with their logical source
- **analysis**: Mechanism-specific breakdown including control assessment, duty evaluation, and virtue alignment
- **meta**: Usage, cost, and performance data

## Important Disclaimer

**Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.**

SageReasoning evaluates reasoning quality based on Stoic philosophy. This is not a decision-making system or recommendation engine. Following an evaluation does not guarantee any specific life outcome. Use evaluations as frameworks for reflection and deeper self-examination.

## Use Cases

- Personal decision reflection and philosophy practice
- Understanding reasoning patterns in deliberation
- Identifying cognitive errors in decision-making processes
- Exploring virtue-aligned decision frameworks
- Training AI agents on Stoic reasoning patterns

## Rate Limits and Costs

Standard free tier: 100 calls/month across all endpoints. Paid plans available for higher volumes. Each call costs between $0.06–$0.18 depending on depth level.
