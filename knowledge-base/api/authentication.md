---
title: "API Authentication"
category: api
last_updated: 2026-04-04
source_files: []
governance_rules: [R4, R5]
---

# API Authentication

## API Key Format

SageReasoning uses Bearer token authentication. API keys follow a consistent naming convention:

- **Production keys**: Begin with `sr_live_` prefix for use in production environments
- **Test keys**: Begin with `sr_test_` prefix for development and testing
- Keys are generated per account and are unique to each user or organization

## Authentication Header

Pass your API key in the Authorization header of every request:

```
Authorization: Bearer sr_live_YOUR_API_KEY_HERE
```

Replace `sr_live_YOUR_API_KEY_HERE` with your actual production or test key. All HTTP requests to authenticated endpoints must include this header.

## Free Tier and Rate Limits

The free tier includes **100 API calls per month**. Once you reach this limit, requests will return a rate limiting error. You can either upgrade to a paid plan for higher limits or wait for your monthly quota to reset.

Rate limiting is applied on a per-IP basis. Each account receives usage tracking through the response meta object, which includes your current call count and remaining quota.

## Public Demo Endpoint

The `/api/evaluate` endpoint operates without authentication, allowing instant demos and exploration without requiring an API key. This is ideal for evaluating whether SageReasoning's reasoning evaluation fits your use case before committing to a paid plan.

## Usage Tracking

Every API response includes a `meta` object containing:

- `endpoint`: The endpoint used
- `ai_model`: The reasoning model version
- `latency_ms`: Response time in milliseconds
- `cost_usd`: Cost of this individual call
- `is_deterministic`: Whether the reasoning was deterministic
- `composability`: Supported composition patterns
- `usage`: Your current usage within the billing period

This metadata helps you monitor costs and understand API performance across your integration.
