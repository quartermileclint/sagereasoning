# Product Types — Plain-Language Explainer

**Purpose:** A reference that clears up what *kind of thing* each SageReasoning product is, and untangles the words that get muddled — skill, agent, wrapper, plugin, MCP server, substrate, API. Written for the founder; reusable in any session where the terminology gets confusing.
**Status:** Reference (not governing). Created 2026-05-21.
**Companion files:** `/reference/product-glossary.md` (one-page quick reference) · `/reference/product-stack-diagram.svg` (the picture).

---

## The one idea that fixes the confusion

The words get muddled because they answer **two different questions**, and we mix them together:

1. **What is it?** — its core nature.
2. **How is it delivered, and who calls it?** — its packaging and audience.

At their core, all three SageReasoning products are the **same kind of thing**: online services that other software calls — **APIs**. The words *skill*, *plugin*, *MCP server*, and *wrapper* are almost always about *packaging and who's calling* — **not** about what the product fundamentally is. That mix-up is the whole problem.

**The rule of thumb:**

> **API = what it is.** **Plugin / skill / MCP server = how you deliver it.** **Agent = who uses it.** **Wrapper = their code that calls it.**

---

## The muddled words, defined plainly

**API / endpoint / service.** A program running on a server that other software sends a request to and gets an answer back. This is what your products *are* (for example `/api/reason`, `/api/calling`). "Endpoint" is one specific address on that service; "service" and "API" are the whole thing.

**Agent.** An AI that acts on its own toward a goal — choosing its next steps and calling tools as it goes. This is your **customer**, not your product. (The only agents you build in-house are the internal Sage Ops "Brains" — Tech, Growth, Support — and those are operational, not sold.)

**Wrapper.** The customer's *own* code that surrounds their agent and calls out to services like yours. It is their integration glue, on their side of the line. Your billing model literally counts "one loop = one wrapper invocation."

**Skill.** A packaged set of instructions (and sometimes scripts) that teaches an AI model how to do a task, loaded into the model's context — like the `docx` skill, or your own `sage-stenographer`. A skill can be a *front door* to your API, but it is not the API itself. Your marketplace already lists "wrapped sage skills" — those are skill-form front doors to Sage Reasoning.

**MCP server / connector.** A standardised adapter (Model Context Protocol) that exposes tools or data to an agent. Another possible front door to your API.

**Plugin.** A bundle (skills + MCP servers + commands) installable from a marketplace. Your substrate-as-plugin staging plan delivers the engine to agent developers *as a plugin*.

**Substrate.** Your in-house word for the core engine — the three-layer "translation sandwich" that *is* Sage Reasoning. It means "the foundation everything else sits on," not a product type. Whenever you read "substrate," read "the Sage Reasoning engine."

---

## Your three products

### Sage Reasoning — a reasoning-evaluation service

**Core type: an evaluation API** (your "substrate" / "Stoic Brain").
An agent — or a human, via sagereasoning.com — submits a decision, an action, or a piece of text. Sage Reasoning returns a Stoic assessment: how close to virtue, which passions are at play, and how to improve. It is the engine. Two front-ends call the *same* engine — the website for humans, and (planned) a plugin for agent developers.

### Agent Trust Layer (ATL) — a credentialing + attestation service

**Core type: a trust / credentialing API.**
The cleanest plain-English analogy is a *certificate authority / accreditation registry for AI agents*. It issues each agent a credential (the A10 work, now Verified in production), records that agent's character progression over time, and publishes honest certification others can check (badges; the `agent-card.json` discovery file). Where Sage Reasoning *evaluates* reasoning, ATL *vouches for* an agent and controls who is allowed to write.

### Sage Calling — a purpose-discovery service

**Core type: a guided-sequence API** (upstream of Sage Reasoning).
When an agent has been told "find a purpose" but given no specific task, Sage Calling walks it through the six-stage Stoic sequence and then hands the result into Sage Reasoning's Layer 1. It authenticates using ATL's credentials. It sits *in front of* the engine.

---

## How they stack together

1. **Sage Calling** helps an agent decide *what to work on* — it finds the agent's purpose — then hands off to →
2. **Sage Reasoning**, which evaluates *the reasoning behind the actions* the agent takes toward that purpose.
3. **Agent Trust Layer** sits alongside both — it credentials the agent (lets it in) and attests to its progression over time.

All three are API services. To agent developers they will be delivered packaged as a **plugin** (which may itself bundle **skills** and an **MCP server**). The **agent** is who uses them; the **wrapper** is the developer's code that does the calling.

---

## One sentence you can reuse

> "Sage Calling, Sage Reasoning, and the Agent Trust Layer are all online services (APIs) that AI agents call — we'll deliver them to developers packaged as a plugin. Sage Calling finds purpose, Sage Reasoning evaluates reasoning, and the Agent Trust Layer credentials and certifies the agent."

---

*Reference document. If the product names or delivery packaging change, update this file and its two companions. Sourced from `/PROJECT_STATE.md` (service lines + positioning), `/adopted/substrate-plugin-staging-plan.md` (substrate-as-plugin; three-layer architecture), and `/adopted/purpose-discovery-product-design.md` (Sage Calling).*
