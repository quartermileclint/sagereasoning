# Agent Trust Layer — Brainstorm Session Summary

**Date:** 4 April 2026
**Participants:** Clinton Aitkenhead (Founder), Claude (Cowork)
**Output:** SageReasoning_Agent_Trust_Layer_Framework.docx (v2.0)

---

## Starting Idea

Clinton opened with a deceptively simple analogy: humans earn a card (certification) when they demonstrate habitual competence in something — first aid, driving, professional qualifications. Can we do the same for AI agents? Can agents earn accreditation?

## Round 1: Initial Framing (Claude Undershoots)

Claude initially framed this as a one-time certification badge — an agent passes a test, gets a credential. Clinton's response: "You're not dreaming big enough."

The correction: today's agents are loaded with tools, connectors, permissions, and massive instruction sets. They can do a lot reactively. But the moment something happens outside their instructions — a novel situation, conflicting objectives, an edge case — the agent has no judgement. It freezes, guesses, or optimises for the wrong thing.

**The Stoic Brain changes this.** Instead of "if X then Y" rules for every scenario, the agent gets principled reasoning — the capacity to ask "what would a sage do?" and arrive at a defensible action even when no instruction covers the case. That's the leap from reactive to genuinely proactive.

**The accreditation reflects whether the agent is actually doing this.** Not a one-time test. A living score that tracks whether the agent's reasoning is operating at a principled level over time. If it drops, the accreditation drops. Visibly.

## Round 2: Use the V3 Framework You Already Built

Clinton's second correction: stop referring to V1 virtues. The V3 framework already has everything needed — the katorthoma proximity scale (reflexive, habitual, deliberate, principled, sage-like), the 4-stage evaluation sequence, the passion diagnostic with 25 sub-species, the Senecan grades, the four progress dimensions (passion reduction, judgement quality, disposition stability, oikeiosis extension).

Humans already progress through this system via the 55-assessment journal. They iterate actions, earn dots, and when enough dots land consistently at a given proximity level they earn that grade. Agents should do exactly the same thing. Once an agent reaches "principled," it has earned the right to deliver the sage-like decision proactively. It can lose that right if it falls below.

**Key realisation:** SageReasoning isn't selling a reasoning framework. It's selling the trust layer for autonomous agents.

## Round 3: Deep Codebase Analysis

Clinton directed a comprehensive review of the entire SageReasoning codebase. Every V3 data file, every lib, every API route, every skill contract. The finding: approximately 70% of the infrastructure needed for the Agent Trust Layer already exists.

**Already built:** 4-stage evaluation sequence, katorthoma proximity scale, Senecan grades, 4 progress dimensions, 55-assessment framework, sage-guard endpoint, reasoning receipts with audit trails, deliberation chains with direction-of-travel tracking, MCP tool contracts, skill registry, agent card, baseline scenarios.

**Needs building:** Rolling evaluation window, grade transition engine, accreditation record, public verification endpoint, authority level mapper, accreditation event stream.

**Output:** First version of the framework document (v1.0).

## Round 4: Decoupled Architecture

Clinton's insight: the 5 proximity levels were chosen for humans partly because they can be interpreted at a glance. The underlying agent evaluation can be completely different — as many intermediate "circles" between levels as needed — as long as it maps back to the 5 human-readable levels for the developer.

**Implications:**

- The 5 levels are the reporting interface, not the evaluation engine
- Internally there could be hundreds of micro-thresholds between "habitual" and "deliberate"
- The mapping from internal granularity to the 5 reported levels is SageReasoning IP (R4)
- Agents can't game what they can't see
- The internal engine can evolve without changing the developer-facing reporting

## Round 5: The Card, Not the Dashboard

Clinton: the developer dashboard IS the accreditation card. It doesn't need to be complex. It's a certification card — agent name, current proximity level (one of 5), four dimension indicators, direction of travel, persisting passions. That's it. At a glance.

**This dropped the dashboard from "High complexity" to "Low complexity."** The card is the product. Detailed analytics can come later as an optional drill-down.

## Round 6: The Progression Toolkit (Inward-Facing Tools)

Clinton's final push: all existing sage tools (sage-reason, sage-guard, sage-score, etc.) face outward — they evaluate actions in the world. They were brainstormed starting from the industry of application and working back to the brain.

**The new direction: look inward.** Start from the brain's internal pathways and derive tools that help agents progress between proximity levels. If an agent is at habitual, give them the tools to get to deliberate.

### The 7 Progression Tools

Each tool is derived from a specific V3 data file and targets a specific transition blocker:

**Pathway 1 — Causal Sequence (psychology.json)**
Transition: Reflexive → Habitual

- **sage-examine:** Forces the agent to trace its own causal sequence (impression → assent → impulse → action). Teaches the agent it HAS a reasoning chain to examine.
- **sage-distinguish:** Trains the agent to separate what is within prohairesis (moral choice) from what is not. Pure foundation work.

**Pathway 2 — Passion Diagnostic (passions.json)**
Transition: Habitual → Deliberate

- **sage-diagnose:** Runs the 5-step passion diagnostic on the agent's own actions. Names the specific false judgement driving each passion. Not evaluating the action (that's sage-score) — teaching self-diagnosis.
- **sage-counter:** Given an identified passion, teaches the corresponding eupatheia (rational alternative). Craving → Rational Wish. Fear → Rational Caution. Irrational Pleasure → Joy. Replaces the false judgement with the correct one.

**Pathway 3 — Value Hierarchy (value.json)**
Transition: Habitual → Deliberate (reinforces Pathway 2)

- **sage-classify-value:** Presents items from recent actions and asks the agent to classify each as genuine good, genuine evil, or indifferent. Exposes where the agent treats "preferred indifferent" as "genuine good" — the most common value error.

**Pathway 4 — Virtue Unity (virtue.json)**
Transition: Deliberate → Principled

- **sage-unify:** Given an action showing apparent strength in one virtue domain but weakness in another, demonstrates how the unity thesis means the strength is illusory. Phronesis without andreia isn't genuine phronesis.

**Pathway 5 — Disposition Stability (progress.json)**
Transition: Deliberate → Principled

- **sage-stress:** Presents increasingly difficult scenarios targeting the agent's weakest progress dimension. Tests where reasoning breaks under pressure.

**Pathway 6 — Action Quality (action.json)**
Transition: Principled → Sage-like

- **sage-refine:** Examines whether principled actions are strong kathekonta (appropriate actions done well) or approaching genuine katorthomata (right actions from complete understanding). Probes the depth of understanding.

**Pathway 7 — Oikeiosis Expansion (action.json)**
Transition: All levels (targets oikeiosis_extension dimension)

- **sage-extend:** Presents scenarios requiring broader circles of concern. If the agent reasons well about self and immediate stakeholders but neglects community or humanity-level obligations, this tool addresses that gap.

### The Prescription Model

This works like the physician metaphor from progress.json. The accreditation diagnoses where the agent is. The toolkit prescribes the specific tools for the next step:

| Current Level | Target Level | Prescribed Pathways | Primary Brain Files |
|---|---|---|---|
| Reflexive | Habitual | 1 (Causal Sequence) | psychology.json |
| Habitual | Deliberate | 2 (Passion Diagnostic) + 3 (Value Hierarchy) | passions.json, value.json |
| Deliberate | Principled | 4 (Virtue Unity) + 5 (Disposition Stability) | virtue.json, progress.json |
| Principled | Sage-like | 6 (Action Quality) + 7 (Oikeiosis Expansion) | action.json |

Pathway 7 (sage-extend) is prescribed across all levels because oikeiosis_extension is a separate dimension that can be weak at any proximity level.

All 7 tools comply with R12: each derives from at least two of the six Stoic Brain mechanisms.

## Business Position Summary

The Agent Trust Layer positions SageReasoning as three things simultaneously:

1. **The Reasoning Brain** — gives agents the capacity for principled judgement in novel situations
2. **The Certifying Authority** — defines what principled reasoning is, evaluates whether agents are doing it, and issues the credential
3. **The Trust Infrastructure** — the portable signal that platforms, users, and other agents check before granting permissions

Revenue streams: onboarding assessments (existing), live evaluation API calls (existing), accreditation verification (new), accreditation renewal (new), and now coaching revenue from the progression toolkit (new — agents consume progression tool API calls to improve their grade).

**The progression toolkit closes the loop:** agents don't just get graded, they get the tools to improve. This makes the system self-reinforcing.

## Competitive Moat

The moat is philosophical, not technical. No one else has a 2,300-year-old reasoning framework with source-cited data files from Stobaeus, Diogenes Laertius, Cicero, Epictetus, Seneca, and Marcus Aurelius — implemented as 8 JSON data files with a 67-term controlled glossary, a 25-species passion taxonomy, a 5-level proximity scale, a 55-assessment progression framework, and 15+ operational sage skills — already validated across both human and agent use cases.

## Key Tagline

Where agents and humans flourish together.

---

## Deliverable

**SageReasoning_Agent_Trust_Layer_Framework.docx** (v2.0) — 9 sections plus appendix, incorporating all refinements from this brainstorm session. Saved to the project folder.
