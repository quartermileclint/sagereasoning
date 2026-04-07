# SageReasoning — Stripe Projects Wrapper (PLACEHOLDER)

> **Status:** Designed — architecture decided, awaiting Stripe Projects GA.
> **Expected build date:** After Stripe Projects GA (late April 2026) and P4 completion.

## Overview

This document describes how AI agents will provision and manage SageReasoning
API access through Stripe Projects once SageReasoning becomes a listed provider.

## Planned Commands

```bash
# Discover SageReasoning in the catalog
stripe projects catalog | grep sagereasoning

# Add SageReasoning to your project (free tier)
stripe projects add sagereasoning/sage-reason

# Upgrade to paid tier
stripe projects upgrade sagereasoning/sage-reason --plan paid

# Pull credentials into your .env
stripe projects env --pull
# This will add:
#   SAGEREASONING_API_KEY=sr_live_<key>
#   SAGEREASONING_BASE_URL=https://api.sagereasoning.com

# Get LLM context for your agent
stripe projects llm-context
# Includes SageReasoning endpoint descriptions, auth method, and examples

# Check status
stripe projects status
```

## Credential Shape

When provisioned via Stripe Projects, the following environment variables
are injected into your `.env` via the Stripe vault:

| Variable | Description |
|---|---|
| `SAGEREASONING_API_KEY` | API key (`sr_live_<32 hex chars>`) |
| `SAGEREASONING_BASE_URL` | API base URL (`https://api.sagereasoning.com`) |

## Plans

| Plan | Tier | Monthly Limit | Daily Limit | Iterations | Price |
|---|---|---|---|---|---|
| `sagereasoning/sage-reason` | Free | 30 calls | 1/day | 1 | $0 |
| `sagereasoning/sage-reason --plan paid` | Paid | 10,000 calls | 500/day | 3 | ~$0.18/call |

## How to Become a Provider

SageReasoning will register as a provider by contacting `provider-request@stripe.com`
with the required details (category: AI/Reasoning, engineering contacts, etc.).

See `/inbox/native recommendations.txt` for the full provider requirements.

## Integration Architecture

Per the Stripe Projects native recommendations, SageReasoning will add:

1. **Engine** — Store `.projects/` state, handle vault rotation events
2. **Skills** — `sage-provision` skill for agent-driven provisioning
3. **Tools** — CLI wrapper with JSON output parsing
4. **Wrappers** — This document + future Node/Python SDKs

## References

- [Stripe Projects Docs](https://docs.stripe.com/projects)
- [SageReasoning API Docs](https://sagereasoning.com/api-docs)
- [OpenAPI Spec](https://sagereasoning.com/openapi.yaml)
