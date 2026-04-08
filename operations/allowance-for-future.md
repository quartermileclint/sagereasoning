# Allowance for Future — External Intelligence Integration

**Created:** 2026-04-08
**Source articles:** `inbox/glass.txt` (Glasswing / Mythos Preview), `inbox/arbitrages.txt` (AI arbitrage taxonomy)
**Purpose:** Stage-triggered checklists drawn from external research that should inform decisions at each priority stage. Review this file when initiating any new priority stage.

---

## How to Use This File

Each section below is tagged with a priority stage (P1, P2, P3, etc.). When you begin work on that stage, review the corresponding section and decide whether each item changes what you build, how you build it, or what you budget for. Items marked **ACTION** require a decision or task. Items marked **MONITOR** require checking for updated information before proceeding.

---

## P1 — Business Plan Review

### Cost Modelling (from Glasswing analysis)

Mythos Preview pricing for partners is **$25 input / $125 output per million tokens** — roughly 10× current Sonnet pricing. Even if SageReasoning never uses Mythos directly, this signals where frontier model pricing is heading.

- **ACTION:** Model break-even under three token-cost scenarios:
  - **Baseline (current):** Sonnet 4.x at current rates (~$3/$15 per million tokens)
  - **2× scenario:** Costs double within 12 months (new model tier or usage growth)
  - **5× scenario:** Frontier reasoning models become necessary for competitive quality
  - **10× scenario:** Mythos-class models become table stakes for the agent market
- **ACTION:** Determine at what cost multiple the current pricing strategy breaks. Document the threshold in the investment case.
- **ACTION:** Evaluate whether Haiku-for-routine / Sonnet-for-critical tiering (already implemented in ring-wrapper.ts) provides sufficient cost insulation. Calculate the ratio of Haiku vs Sonnet calls from any test data available at hold point.
- **MONITOR:** Check current Anthropic API pricing at time of P1 review — pricing may have changed since April 2026.

### Intelligence Arbitrage Framing (from arbitrage analysis)

The arbitrage taxonomy provides a lens for evaluating the business case:

- **ACTION:** In the investment case, explicitly name which arbitrage gap SageReasoning exploits:
  - **Reasoning gap** — LLMs process Stoic frameworks faster and more consistently than human study
  - **Discipline gap** — Agents enforce principled reasoning without fatigue or emotional drift
  - **Fragmentation gap** — SageReasoning synthesises scattered Stoic scholarship into actionable infrastructure
- **ACTION:** Assess durability: Can competitors close this gap on a model-release cadence? The answer should inform how much of the moat is in the reasoning framework (durable) vs the model quality (commoditisable).
- **ACTION:** Consider the "process transformation not tool access" finding: 95% of tool users fail because they bolt AI onto old processes. Frame SageReasoning as process transformation infrastructure, not a chatbot wrapper.

### Startup Preparation Toolkit (from both articles)

- **ACTION:** When defining the startup preparation toolkit (0h Assessment 5), include "intelligence arbitrage audit" as a capability — helping founders identify which gaps their AI collaboration exploits and whether those gaps are durable.

---

## P2 — Ethical Safeguards

### Security Urgency (from Glasswing analysis)

Mythos Preview autonomously finds zero-days, 16–27-year-old hidden bugs, and full exploit chains. SageReasoning's API endpoints will be scanned by similar AI systems in the near future.

- **ACTION:** Before starting P2 implementation, run the full codebase through Claude with aggressive security prompts. Specifically target:
  - Authentication and session management (`/api/auth/`, middleware, JWT handling)
  - Input validation on all API routes (especially user-supplied JSON parsed in route handlers)
  - Supabase RLS policies — verify row-level security is enforced, not just assumed
  - Dynamic imports and cross-boundary module access (the bridge pattern)
  - Any hardcoded secrets, API keys, or environment variable leakage
- **ACTION:** Add automated dependency scanning to the build pipeline (or at minimum, run `npm audit` and review before each deployment).
- **ACTION:** Evaluate sandboxing for sage-reason-engine LLM calls — currently the engine constructs prompts from user input. Ensure output sanitisation prevents prompt injection from persisted data (e.g., a malicious journal entry that tries to manipulate the reasoning engine).
- **MONITOR:** Check whether Glasswing findings have been published or whether Anthropic has released security tooling based on Mythos by the time P2 begins. If defensive scanning tools exist, use them.

### Vulnerable User Detection Enhancement

- **ACTION:** The Glasswing article highlights AI systems operating at "superhuman levels." When implementing R20a (vulnerable user detection), consider that users in distress may interact with the Mentor in ways that exploit the system's analytical power against themselves. The detection system should flag not just distress language but also obsessive self-analysis patterns (framework dependence — already scoped in R20b/2g).

---

## P3 — Agent Trust Layer

### Multi-Platform Compatibility (from Glasswing analysis)

Anthropic is routing access through Claude API, Amazon Bedrock, Google Vertex, and Microsoft Foundry. Agent developers — SageReasoning's primary API audience — will be building on all of these.

- **ACTION:** When designing ATL interoperability (3c), document and test that:
  - sage-reason API works when called from agents running on Bedrock, Vertex, and Foundry (not just direct Anthropic API)
  - Authentication accepts standard bearer tokens without platform-specific dependencies
  - Response format (the envelope pattern) is platform-agnostic
- **ACTION:** Add platform compatibility to the ATL documentation and agent-card.json.
- **MONITOR:** Check whether Anthropic has released new tool-use schemas, Tool Search, or dynamic tool discovery APIs by the time P3 begins. If so, ensure sage-reason is discoverable through these mechanisms.

### sage-guard as Security Layer

- **ACTION:** The Glasswing findings suggest sage-guard's role should expand beyond virtue evaluation. Currently it evaluates whether an action is virtuous. Consider adding a "security sense" dimension: does this action expose the agent or its principal to technical risk? This aligns with the Stoic concept of appropriate action (kathekon) — an action that harms the agent's system integrity is not appropriate regardless of its moral intent.
- **ACTION:** When implementing adversarial evaluation (3d), use the Glasswing threat model: assume an attacker with Mythos-class capabilities probing the ATL for certification bypass, data exfiltration, or trust escalation.

---

## P4 — Stripe Integration

### Cost-as-Health-Metric Enhancement (from both articles)

- **ACTION:** When wiring R5 cost health alerts, include a "cost compression rate" metric: how fast are per-transaction costs declining as models improve? If costs are dropping faster than pricing, margins improve. If usage growth outpaces cost reduction, margins erode.
- **MONITOR:** Check whether Anthropic has changed pricing tiers or introduced new cost-optimised models by the time P4 begins.

---

## P6 — MVP Launch

### Marketing Language (from arbitrage analysis)

The arbitrage taxonomy provides concrete, non-academic language for explaining SageReasoning's value:

- **ACTION:** When writing launch copy, use the taxonomy to explain what SageReasoning does:
  - "Closes the **discipline gap** in your reasoning — AI enforces principled examination without fatigue"
  - "Addresses **reasoning gaps** — processes Stoic frameworks consistently where human study is sporadic"
  - "Synthesises **fragmented** philosophical scholarship into actionable infrastructure"
- **ACTION:** Use the Polymarket case study as an analogy (not literally): "95% of people who access reasoning tools fail because they bolt them onto old habits. SageReasoning rebuilds your reasoning process, not just your reading list."
- **ACTION:** The "process transformation not tool access" finding should be central to positioning. SageReasoning is not a Stoicism chatbot — it's reasoning infrastructure.

### Competitive Positioning

- **ACTION:** The CNC lathe parallel from the arbitrage article applies directly: early adopters of principled reasoning infrastructure will have an advantage that commoditises once competitors replicate. Frame SageReasoning as enabling that early-adopter advantage for agent developers.

---

## P7 — Sage Ops Activation

### Agentic Architecture Alignment (from Glasswing analysis)

The winning pattern described in the Glasswing article — hierarchical orchestration, persistent memory, reflection loops, success criteria — is exactly what Sage Ops implements.

- **ACTION:** When activating Sage Ops (7a), verify alignment with the described pattern:
  - Hierarchical orchestration: ring wrapper (BEFORE → agent → AFTER) ✓
  - Persistent memory: Mentor profile + reasoning receipts ✓
  - Reflection loops: sage-reflect → profile update → ring enrichment ✓
  - Success criteria: sage-guard + proximity scoring ✓
- **ACTION:** Document this alignment in the Sage Ops activation plan — it validates the architecture against industry direction.
- **MONITOR:** Check whether Anthropic has released official multi-agent orchestration tools or SDKs by the time P7 begins. If so, evaluate whether Sage Ops should integrate with them rather than running independently.

---

## General — Applies Across All Stages

### Token Efficiency

- **MONITOR:** At each stage, check current model pricing and available models. The Haiku-for-routine / Sonnet-for-critical pattern in ring-wrapper.ts is a deliberate cost control. If new cost-optimised models appear (e.g., a model between Haiku and Sonnet), evaluate whether to add a third tier.

### Supply Chain Hygiene

- **ACTION (recurring):** Before each deployment, run `npm audit` and review dependency updates. The Glasswing article specifically warns about supply-chain risks in AI agent frameworks.

### Architecture Validation

The Glasswing article describes the "winning pattern" for agentic AI. SageReasoning's existing architecture already implements this pattern. This is validation, not a change request. But it means the architecture should be maintained as-is through future development — resist pressure to simplify it into "just a chatbot."

---

## File Locations for Referenced Articles

| Article | Current location | Recommended archive |
|---|---|---|
| Glasswing / Mythos Preview | `inbox/glass.txt` | `reference/2026-04-glasswing-mythos-analysis.txt` |
| AI Arbitrage Taxonomy | `inbox/arbitrages.txt` | `reference/2026-04-ai-arbitrage-taxonomy.txt` |

**Note:** Move to `/reference/` with annotations when inbox is next cleaned.

---

*This file is append-only. New external intelligence should be added as new sections with date stamps, not by editing existing sections. Superseded items should be marked [SUPERSEDED — date — reason] rather than deleted.*
