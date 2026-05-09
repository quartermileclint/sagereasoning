# Session Close — 2026-05-09 — Stoic Agent Substrate Exploration

## Frame

This session was an Explore session (per 0d) elected by the founder at session-open. The founder deviated from the candidate items A–I in the predecessor next-session prompt (`2026-05-09-item-I-viii-consumer-page-adaptation-close.md` was the immediate predecessor; the post-M1-arc-close prompt offered Items A–I) and elected instead: "Understanding what api/reason is and brainstorming applications".

The session expanded into a substantive architectural exploration covering three converging ideas — a Layer-2-only agent product, the Layer A–D Agent Trust Layer wrapper (from `/inbox/Layer A–D` files), and the sage-intuit pre-decision intuition concept (from `/inbox/sage-intuit.txt`) — and culminated in a founder declaration to open-source Layer 1 and Layer 3 of the translation-sandwich.

No code was touched. No production change. Standard tier throughout. Per founder direction: ideas were expanded; nothing was formalised.

## Decisions Made

**1. The three ideas are one architecture.** Reasoning: a Layer-2-only agent product, a Layer A–D Trust Layer wrapper, and a sage-intuit pre-decision intuition are three views on the same underlying thing — Layer 2 as the deterministic decision substrate addressable at every stage of the Stoic causal sequence (phantasia → synkatathesis → hormē → praxis). Mapping: Layer 2 runs at the impression-capture moment (Layer A), at the action-space-generation moment (sage-intuit), at the post-execution verification moment (Layer B), at the subagent-handoff moment (Layer C), and at the concern-radius moment (Layer D). → Impact: the staged build plan treats these as a unified Stoic Agent Substrate, not as parallel work streams. Recorded; not yet formalised in any ADR.

**2. Three-mode access is foundational, not optional.** Reasoning: the input contract for Layer 2 is bounded but philosophically loaded. Forcing every agent to self-classify in Mode 1 (pure structured) creates a Stoic-literacy barrier; offering Mode 2 (hybrid — agent provides hints + we extract) and Mode 3 (pure text — current /api/reason path) lets agents enter at any literacy level and progress along a developmental sequence. → Impact: the substrate offers three entry points serving different agent maturity levels; the mode an agent uses is itself a trust signal.

**3. Configurable mode separation is multiple products, not one configurable surface.** Reasoning: founder's framing during the open-questions record-only response — evaluative (preserves agent agency), prescriptive (shows what the sage would do), configurable (developer flexibility), and a *combo mode* where prescriptive proactively augments the agent's action space and evaluative scores all candidates including the sage-suggested ones, with each agent acceptance/rejection recorded throughout. → Impact: the staged build plan treats these as separate downstream products with shared infrastructure, not as one configurable governor.

**4. Layer 1 and Layer 3 will be open-sourced completely.** Reasoning: separates translation work (text in / prose out) from authoritative deterministic judgement (Layer 2). The moat becomes the corpus + curation + primary-source fidelity + signed authoritative endpoint, not the algorithm at any single moment. Architecturally clean: the substrate's translation and expression are open; only the assent-under-examination is proprietary and signed. → Impact: changes the product positioning from "API agents call" to "open standard for Stoic agent reasoning with the authoritative judgement service in the middle." Affects business model (cost-to-serve approaches zero per request), licensing strategy, R20a perimeter handover, credential infrastructure, brand and trademark posture, support burden, and standards-formation engagement. Recorded as a founder declarative; formalisation deferred — no code change, no licence file, no public announcement at this point.

**5. Next session is dedicated to detailed planning only.** Reasoning: founder explicit — "2F is evidence of re-work that occurs when ideas aren't expanded on prior to formal planning." Substrate execution involves enough downstream consequences that staging the build before execution is essential. → Impact: the planning session's output is a staged build plan, ordered by importance, with explicit no execution. See `2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md`.

## Status Changes

None. No module or rule status changed. Design exploration only.

## Next Session Should

- Open under the standing protocol, with this session close + the substrate-build-staging next-session prompt as the cache reads
- Be dedicated entirely to detailed planning — no execution, no ADR drafting beyond the staging plan itself, no code touch
- Inventory every aspect of the substrate work surfaced in this session and prior arcs
- Order them by importance with explicit reasoning
- Identify dependencies, prerequisites, and blocking decisions
- Estimate session counts per stage
- Produce a staged build plan document as the session's output
- Surface any new open questions that emerge during inventory
- Stabilise to a known-good state at session close (the staging plan is the artefact)

## Blocked On

- Founder review of this session close and the next-session prompt before next session opens
- Licensing strategy decision (open-source choice declared; specific licence form deferred — needs lawyer review at the relevant stage)
- Distribution channel decision (Q6 still deferred — SaaS / SDK / MCP / combination)
- The six open questions still on record (founder's initial positions captured; not formalised)

## Open Questions

**Original six (from earlier in this session, founder's initial positions on record):**

1. Evaluative / prescriptive / configurable / combo product separation — founder's position: separate products, with the augmentative-prescriptive-then-evaluative combo as the most architecturally interesting mode. Each agent acceptance/rejection recorded as audit trail.
2. Layer 1 schema scale + middle-of-Layer-2 protection — founder's position: schema publication acceptable; middle protection required. Architecture-by-server-side-execution if SaaS. (Position shifts under the open-source decision: now confirmed that Layer 2 stays server-side authoritative, Layers 1 and 3 are open.)
3. Distress check posture — founder's position: doesn't apply for internal agent processes; pass-through statement included with R3 disclaimer when human input fields present. Open question now: does R20a reference implementation ship as part of open Layer 1?
4. Credential portability wrapper — founder's position: SageReasoning's own wrapper alongside agent-to-agent protocols, readable on input + handed off on output, carrying proximity movement (living trail).
5. Action scorer parallel — founder's position: agent action scorer mirrors the human action scorer wherever evaluative is in place.
6. Distribution channel — deferred: too soon to call.

**New questions surfaced by the open-source decision:**

7. Licensing strategy — permissive (MIT/Apache), copyleft (AGPL), custom (Layer 2 API requirement), or dual-licence. Affects long-run dynamics. Needs lawyer review.
8. Community governance model — contribution guidelines, PR review policy, named maintainers for sub-projects, support-burden discipline.
9. R20a perimeter handover mechanism — replicate in open Layer 1, enforce server-side at Layer 2 API as precondition, or combination.
10. Layer 2 signing infrastructure — when does authoritative-assessment signing get built; what cryptographic posture; key management.
11. Standards-formation engagement — which adjacent communities (Anthropic developer ecosystem, MCP, A2A/agent-protocol communities) to engage with; when and how.
12. Brand protection / trademark — distinguishing "running open SageReasoning Layer 1" from "calling authoritative SageReasoning Layer 2"; preventing brand confusion from forks of Layer 2.
13. Migration path for existing API consumers — how the current /api/reason and downstream V3 endpoint family relates to or transforms into the substrate offering. Coexistence, deprecation, or rewiring.

## Verification Method Used (0c Framework)

- Work type: Design exploration and governance discussion (no code, no production touch)
- Verification: founder reads this session close + the next-session prompt. No URLs to verify, no test commands, no live system check.
- Founder may edit either file or request changes before the next session opens.

## Risk Classification Record (0d-ii)

- All work in this session: Standard (design exploration only; no production touch).
- Critical Change Protocol NOT engaged.
- The open-source decision, when executed in future sessions, will involve Critical-tier work per PR6 / 0c-ii because it touches authentication, distribution, signing, and trust infrastructure. The planning session will surface and stage these explicitly.

## PR5 — Knowledge-Gap Carry-Forward

- No concepts required re-explanation this session.
- No knowledge-gap candidates added.

## Founder Verification (Between Sessions)

- Read this session close (`/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md`)
- Read the next-session prompt (`/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md`)
- Edit either file or request changes before next session opens
- No live system to verify; no code touched in this session

## Session-Output Artefacts (For Reference)

The substantive content produced this session lives in the conversation transcript itself. Key artefacts that should be referenced or extracted in subsequent planning:

- Plain-language explanation of /api/reason and its three-layer architecture
- Applications brainstorm (direct human use, agent infrastructure, embedded SaaS, education, dogfooding, V3 endpoint chaining)
- Synthesis: Stoic causal sequence ↔ agent loop mapping with Layer 2 as substrate at each stage
- Positioning against the landscape (Constitutional AI, deliberative alignment, MCP, A2A, critic-verifier patterns) — only deterministic moral substrate for the agent's architectural moment
- Confidence assessment on input contract publication (high) and credential portability (high on build, lower on cross-platform readability/adoption)
- Three-mode developmental sequence for agent Stoic literacy
- Six layers of ecosystem offering above bare schema + docs (reference implementation, SDK, domain adapters, translation pattern wiki, calibration tools, build-your-own-translator assistant)
- Open-source decision implications: architectural clarity, business model shift, ecosystem strengthening, risk surfaces (Layer 2 reverse-engineering, fork-and-call-Stoic risk, support burden, standards-formation work)

End of session close.
