# Product Glossary — Quick Reference

**One-page card.** Fuller version: `/reference/product-types-explainer.md`. Picture: `/reference/product-stack-diagram.svg`. Created 2026-05-21.

> **The rule of thumb:** API = *what it is*. Plugin / skill / MCP server = *how you deliver it*. Agent = *who uses it*. Wrapper = *their code that calls it*.

## Terms

| Term | Plain meaning | Is it your product? |
|---|---|---|
| **API / endpoint / service** | A program on a server that other software calls — send a request, get an answer (e.g. `/api/reason`). | **Yes — this is what all three products are.** |
| **Agent** | An AI that acts on its own toward a goal, choosing steps and calling tools. | No — it's your **customer**. (Internal Sage Ops "Brains" are the exception, and aren't sold.) |
| **Wrapper** | The customer's own code that surrounds their agent and calls your service. Billing: "one loop = one wrapper invocation." | No — it's the customer's glue. |
| **Skill** | A packaged set of instructions (+ maybe scripts) that teaches an AI model a task, loaded into its context (e.g. `docx`). | A *front door* to your API, not the API. |
| **MCP server / connector** | A standard adapter that exposes tools/data to an agent. | Another possible *front door* to your API. |
| **Plugin** | A bundle (skills + MCP + commands) installable from a marketplace. | **How you'll deliver** the engine to agent developers. |
| **Substrate** | Your in-house word for the core engine (the three-layer "translation sandwich"). | = "the Sage Reasoning engine." Not a product type. |

## The three products, one line each

| Product | Core type | What it does |
|---|---|---|
| **Sage Reasoning** | Reasoning-**evaluation API** (the "substrate" / engine) | Agent submits a decision/action/text → gets a Stoic assessment (virtue proximity, passion diagnosis, how to improve). |
| **Agent Trust Layer (ATL)** | **Credentialing + attestation API** | Issues each agent a credential, records its character progression, publishes honest certification (badges, `agent-card.json`). A "certificate authority for agents." |
| **Sage Calling** | Purpose-discovery **guided-sequence API** (upstream) | Walks an agent that has no task through the six-stage Stoic sequence to find its purpose, then hands off to Sage Reasoning. |

## The stack, in one breath

**Sage Calling** (find a purpose) → **Sage Reasoning** (evaluate the reasoning) — with **Agent Trust Layer** alongside both (credential the agent, certify its progress). All three are APIs, delivered to developers as a **plugin**, used by **agents** via their **wrapper** code.
