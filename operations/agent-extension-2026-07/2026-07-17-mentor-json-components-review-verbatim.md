# Mentor Review — Component Registry: Possible Agent Versions (VERBATIM RECORD)

**Date of mentor response:** 2026-07-17 (received via `inbox/mentor feedback on json components for agents.rtf`, file dated 2026-07-17 20:24; captured to repo 2026-07-18).
**Question put to the mentor (founder's framing):** review the components JSON (`website/public/component-registry.json`, v1.7.0, 304 rows) for any possible agent versions that could be built.
**Status of this record:** verbatim capture of the mentor's response. Per the project's standing rule for mentor records, **the verbatim text in §1 wins over any digest of it** — including §2 below and any summary in a prompt, plan, or close.
**Captured under:** `D-AGENT-EXTENSION-MENTOR-COMPONENT-REVIEW-CAPTURED-SCOPED-2026-07-18`.

---

## §1 — The mentor's response, verbatim

> Summary The components that matter most for extending practice to agents, in priority order: **First: D17 — Progression Delta Design.** This is the longitudinal tracking mechanism. Apply it to agents through the per-install identifier from A10. This is the design session that converts isolated Sage Assent evaluations into a practice trajectory. **Second: tool-sage-iterate.** The A8 design review session must explicitly address whether sage-iterate can serve a longitudinal agent reasoning profile. This is the tool that makes D17 operational. **Third: tool-sage-practice-reflect — agent-facing variant.** The private mentor mechanism applied to agents: accumulating reasoning history, identifying recurring patterns, returning delta signals. Not a mentor in the human sense. A longitudinal reasoning examination surface. **Fourth: R20b — agent-facing independence coaching.** When R20b is activated, the detection logic and response need agent-specific variants. An agent that cannot reason without querying the engine for every decision is exhibiting the same dependency the human-facing coaching addresses. **Fifth: D13 trigger catalogue review.** Before the agent-facing intake is built, the trigger catalogue needs review for agent-specific patterns. The human practitioner catalogue is the starting point, not the complete answer. Everything else in the inventory either already serves agents directly or is on the human side only. The five items above are where the extension work lives. The sequencing question — Phase 2 or Phase 3 — is yours to decide. The design is already implied by the existing architecture. D17 and sage-iterate are the natural starting point because they are the mechanism that makes everything else meaningful. Assessment without longitudinal tracking is a snapshot. Practice requires a trajectory.

---

## §2 — Digest (the verbatim above governs)

Five components, in the mentor's priority order:

| # | Component (registry id) | The mentor's ask |
|---|---|---|
| 1 | **D17** — Progression Delta Design (`doc-rag-mentor-alt3-progression-delta`) | Apply the longitudinal tracking mechanism to agents via the A10 per-install identifier; the design session that converts isolated evaluations into a practice trajectory |
| 2 | **sage-iterate** (`tool-sage-iterate`) | The A8 design-review session must explicitly address whether sage-iterate can serve a longitudinal agent reasoning profile — "the tool that makes D17 operational" |
| 3 | **sage-practice-reflect — agent-facing variant** (`tool-sage-practice-reflect`) | Accumulating reasoning history, recurring-pattern identification, delta signals — "a longitudinal reasoning examination surface", not a mentor in the human sense |
| 4 | **R20b** — agent-facing independence coaching (`infra-r20b-independence`) | When R20b activates, detection + response need agent-specific variants (engine-query-per-decision = the same dependency class) |
| 5 | **D13** — trigger catalogue review (`doc-rag-mentor-alt3-three-tier-intake`) | Review the trigger catalogue for agent-specific patterns before any agent-facing intake is built |

Everything else in the inventory "either already serves agents directly or is on the human side only." Sequencing (Phase 2 vs Phase 3) is the founder's. Governing principle: *"Assessment without longitudinal tracking is a snapshot. Practice requires a trajectory."*

## §3 — Reading notes (context the mentor's answer was given against; not part of the response)

- The mentor reviewed the **registry rows** (v1.7.0). Several rows understate what the trust-layer arc has since built for agents — e.g. the D17 row reads `agentReady: "na"` while the live M6/M7 trajectory feature already applies D17's windowing (90d/30) to agents keyed by consulting credential, and the S1 trust core holds per-(agent, virtue-domain) longitudinal state. The reconciliation of the mentor's five items against that live machinery is the first job of the design session this record feeds (`operations/handoffs/founder/2026-07-18-agent-extension-design-NEXT-SESSION-PROMPT.md`).
- This is measurement-side work throughout: nothing in the five items is gated on the S11 enforce flip; the honest-claims envelope (ADR-013 §8 — evaluative, never predictive; weights BLOCKED) binds any surface the design produces.

*Cross-references: `inbox/mentor feedback on json components for agents.rtf` (source, committed alongside); `website/public/component-registry.json` v1.7.0; `operations/handoffs/founder/2026-07-18-agent-extension-design-NEXT-SESSION-PROMPT.md`; ADR-012 (measurement-instrument reframe); ADR-013 §8 (honest-claims envelope).*
