---
title: "Free Tier Limits"
category: getting-started
last_updated: 2026-04-04
source_files: [tier-config-v3.json]
governance_rules: [R5]
---

# Free Tier Limits

SageReasoning offers a generous free tier designed to let you experience full evaluation output without hitting artificial capability restrictions. The distinction between tiers is **volume, not depth**.

## Monthly Allowance

The free tier provides **100 API calls per month** with automatic rate limiting to prevent abuse. This matches the needs of individual developers and small teams evaluating reasoning on a typical scale.

## Full Output on All Endpoints

A critical principle: free accounts receive the **complete evaluation output** on every endpoint. You're not blocked from specific analysis stages or given partial results. The sage-reason endpoint returns the same diagnostic depth whether you're on free or paid.

## API Call Consumption

API calls are consumed by different operations:

- **Single evaluation** (sage-reason) = 1 call
- **Guard + Score wrapper** (skill wrapper) = 2 calls
- **Guard + Score + Iterate** (deliberation cycle) = 3 calls per iteration

Free tier supports 1 deliberation iteration per chain. Paid accounts unlock 3 iterations, enabling deeper reasoning cycles when available reasoning suggests further examination.

## Phase Coverage

Free assessment covers all analysis in **Phases 1-2**, which includes 14 core assessment vectors across the control filter, appropriate action evaluation, and passion diagnosis stages. This represents a complete first-pass evaluation.

## Upgrading to Paid

The paid tier enables higher-volume usage (configurable plans starting at 500 calls/day) and extended deliberation cycles. Choose paid if you're building production integrations, evaluating high-frequency decisions, or need multiple reasoning iterations per chain.

For most use cases, the free tier provides sufficient monthly capacity to explore SageReasoning's diagnostic approach.
