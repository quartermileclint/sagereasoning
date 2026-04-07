# SageReasoning — 6-Layer Agent Infrastructure Mapping

> **Created:** 2026-04-07
> **Source research:** /inbox/6 layers of agent.txt, /inbox/stripe projects.txt, /inbox/native recommendations.txt
> **Status:** Reference document — strategic context for architecture decisions

## Overview

The 6-layer agent infrastructure stack model identifies the structural layers every production agent needs. This document maps where SageReasoning fits, what we address, and where opportunities exist.

## Layer-by-Layer Mapping

### Layer 1: Compute and Sandboxing

**What it is:** Isolated, secure execution environments for agents (ephemeral microVMs or persistent Docker-style containers).

**SageReasoning's role:** SageReasoning does not provide compute. We are a stateless API consumed by agents running in any compute layer. Our API is designed to be callable from any sandbox environment — no persistent connections, no session state required.

**Architectural alignment:** Our API's stateless, single-request design means we work equally well with ephemeral (E2B-style) and persistent (Daytona-style) sandboxes. No changes needed.

### Layer 2: Identity and Communication

**What it is:** Verifiable agent identity and native communication protocols (beyond email shims).

**SageReasoning's role:** Our Agent Trust Layer provides identity-adjacent capabilities. Agent accreditation records (Senecan grades, authority levels) function as verifiable reasoning-quality credentials. The accreditation card is a portable identity artefact an agent can present to other systems.

**Current status:** Trust Layer is scaffolded (TypeScript, offline). Not yet wired to Supabase or serving live accreditation endpoints.

**Opportunity:** When MCP or similar agent-native protocols mature, SageReasoning accreditation could become a standard credential in agent identity handshakes — "this agent has demonstrated principled reasoning as certified by SageReasoning."

### Layer 3: Memory and Statefulness

**What it is:** Cross-session, portable memory systems (graph, vector, key-value).

**SageReasoning's role:** We provide reasoning state, not general memory. Deliberation chains persist across interactions (up to 3 iterations). The Sage Mentor session bridge captures decision context. These are domain-specific memory patterns, not general agent memory.

**Architectural alignment:** Our deliberation chains and session decisions are stored in Supabase (PostgreSQL), portable via data export. We don't provide or require a general memory layer — agents bring their own (Mem0, etc.).

### Layer 4: Tools and Integration

**What it is:** Middleware for auth, connectors, observability, and rate-limit handling.

**SageReasoning's role:** We are a tool in this layer. Our API endpoints are designed as agent tools — function-callable, JSON-mode compatible, with structured response envelopes including cost, latency, and composability metadata.

**Current integration points:**
- OpenAPI 3.1.0 specification at /openapi.yaml
- MCP contract definitions in mcp-contracts.ts
- llms.txt for agent discovery
- agent-card.json for machine-readable capability description
- Skill registry with chaining hints (chains_to field)

**Status:** Live (endpoints serving, discovery files published).

### Layer 5: Provisioning and Billing

**What it is:** Agents discovering, provisioning, and paying for services on-the-fly via tokenized payments.

**SageReasoning's role:** This is where Stripe integration and Stripe Projects fit.

**Current status (April 2026):**
- Stripe payment processing: **Wired** (webhook handler, checkout, billing portal, tidings)
- API key metering: **Wired** (atomic usage counters, free/paid tier enforcement)
- Stripe Projects provider: **Designed** (placeholder code, awaiting GA)

**What Stripe Projects will enable:**
- `stripe projects add sagereasoning/sage-reason` — agent provisions API access from terminal
- Automatic credential vaulting — API key injected into .env
- Plan selection — free or paid tier via `stripe projects upgrade`
- llm-context generation — agent gets machine-readable SageReasoning capabilities

**Build timeline:** After Stripe Projects GA (expected late April 2026) and after Stripe payment processing is verified.

### Layer 6: Orchestration and Coordination

**What it is:** Lifecycle management, scheduling, supervision, failure recovery for multi-agent systems. Described as the "biggest gap and highest-leverage place to build."

**SageReasoning's role:** We provide governance and quality infrastructure for this layer — not orchestration itself. Our unique contribution is principled decision-making for agent coordination:

- **sage-guard** — Pre-action decision gate (should this agent proceed?)
- **Authority levels** — supervised, guided, spot_checked, autonomous, full_authority
- **Accreditation** — Agents earn higher authority through demonstrated reasoning quality
- **Deliberation chains** — Iterative refinement before consequential actions

**Opportunity:** As orchestration platforms emerge ("Kubernetes for agents"), SageReasoning's governance layer could become a standard integration — every orchestrated agent checks sage-guard before acting, every coordination decision passes through principled reasoning.

## Strategic Implications

### Where we are strong (Layers 4, 5, 6)

SageReasoning is naturally positioned as a Layer 4 tool (reasoning API), with Layer 5 billing integration (Stripe + Stripe Projects), and Layer 6 governance infrastructure (trust layer, authority levels, sage-guard).

### Where we should not build (Layers 1, 2, 3)

We don't need to provide compute, general identity, or general memory. These are infrastructure layers other providers handle. Our design is already compatible — stateless API, portable data, no platform lock-in.

### Highest-leverage next step

Becoming a Stripe Projects provider (Layer 5) makes SageReasoning discoverable and provisionable by any agent building a new app stack. Combined with our Layer 6 governance capabilities, we become the "principled reasoning layer" that gets added alongside databases, auth, and hosting.

## Three Builder Truisms Applied

1. **Reliability compounds negatively** — Our API is a single point in the reliability chain. Keep latency low (<4s), error rates minimal, and fail gracefully (sage-guard returns a clear yes/no even under degraded conditions).

2. **Avoid transitional lock-in** — Our API uses standard HTTP/JSON, OpenAPI spec, and MCP contracts. No proprietary protocols. Agent data exportable. No vendor lock-in by design.

3. **Prevent agent sprawl** — Our governance layer (trust layer, authority progression, sage-guard) is specifically designed to prevent the "microservices gone wrong" problem in multi-agent systems. This is our core value proposition for Layer 6.
