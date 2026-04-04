# OpenBrain Research Summary

**Date:** 4 April 2026
**Source:** Nate B Jones's "OpenBrain" concept
**Relevance:** Layer 0 context infrastructure pattern — directly parallels SageReasoning's longitudinal profile store and Stoic Brain architecture.

---

## What OpenBrain Is

A persistent, agent-readable memory layer that all AI tools share. Instead of each chat session starting from zero, knowledge is stored once, AI can read and write to it, and context compounds over time. The core thesis: context is the competitive advantage, not model intelligence.

---

## The 10-Step Build Sequence

**1. Persistent database** — PostgreSQL with vector embeddings (commonly Supabase). Stores thoughts, people, projects, ideas, tasks. The principle: "Own your memory, not your model."

**2. Vector embeddings** — Every piece of data gets a semantic embedding, enabling search by meaning rather than keywords. A query like "career change" retrieves relevant notes, people, and ideas across all categories.

**3. Capture pipeline** — A single entry point (inbox/thoughts table) for notes, conversations, ideas, and meeting snippets. The rule: capture first, structure later.

**4. AI sorter** — An LLM reads each input, classifies it (idea, task, person, etc.), and routes it to the correct table. Uses a confidence threshold: high confidence goes to structured storage, low confidence stays in the inbox for manual review. This replaces manual organisation entirely.

**5. Immutable log** — Every input is logged permanently and traceably. Provides audit trail, reversibility, and trust in automation.

**6. Semantic retrieval** — Cross-category search that pulls relevant context automatically and feeds it into AI prompts. This is what turns a generic chatbot into a context-aware agent.

**7. Universal interface (MCP or API)** — Exposes the memory layer so any tool can use it: Claude, ChatGPT, custom agents, scripts. Common approaches: MCP (Model Context Protocol) or REST API. Result: all tools share one brain.

**8. Human dashboard** — A visual UI (typically a simple web app on Vercel) so humans can see the brain, not just query it.

**9. Agency layer** — The step most people skip. Requires three things: memory, tools, and proactivity (loops). Agents should revisit data, trigger actions, and update context continuously. "Memory + tools + proactivity = real agents."

**10. Applications on top** — Personal CRM, idea engine, sales pipeline, daily briefings, autonomous workflows. The brain itself is not the product — the applications built on it are.

---

## Architecture Pattern

```
Input Layer → Capture (inbox) → AI Sorter (classify + route) → Structured Tables → Vector Search → API / MCP Layer → Agents + Apps + UI
```

---

## Five Key Principles

1. **Context over intelligence** — Models are commodities; context is the moat.
2. **One brain, many tools** — Shared memory, not per-tool memory.
3. **Structure over notes** — Tables beat documents; systems beat pages.
4. **Automation over discipline** — The system maintains itself, not the user.
5. **Compounding advantage** — The longer it runs, the smarter it gets, the harder it is to replicate.

---

## Relevance to SageReasoning

The OpenBrain pattern maps directly onto several SageReasoning components already built or planned:

- **Persistent database** → Supabase with 8 mentor profile tables (already built)
- **Structured storage** → The 8 Stoic Brain JSON files + rolling evaluation window
- **AI sorter** → The ring wrapper's before/after classification (passion diagnosis, governance routing)
- **Immutable log** → Token instrumentation + compliance audit log (R14)
- **Semantic retrieval** → Journal ingestion pipeline extracting passion maps, causal tendencies, value hierarchies
- **Universal interface** → The sage-skill API layer (sage-reason, sage-guard, sage-score, etc.)
- **Agency layer** → Proactive scheduler (morning check-ins, evening reflections, weekly pattern mirrors)
- **Applications on top** → The website products, Agent Trust Layer, marketplace

The critical alignment: Jones's principle that "context is the moat" mirrors SageReasoning's longitudinal profile thesis — the mentor's value compounds over months of interaction history, making it irreplaceable regardless of which model powers the inner gap.
