# Research Gap Analysis — Reasoning Agent Training vs SageReasoning Product Line

**Date:** 8 April 2026
**Inputs:** 4 research summaries (Perplexity, Google AI, ChatGPT, Grok) from `/inbox/`
**Cross-referenced against:** 29 active sage-* skills, Stoic Brain v3, Sage Mentor, Agent Trust Layer, Ring Wrapper, Session Bridge

---

## What the research describes

All four sources converge on the same architecture for reasoning agents. The terminology varies but the structure is consistent:

A reasoning agent is a system that plans, acts, evaluates, and refines its own outputs. It combines a base model, tools it can call, memory (short-term and long-term), and a controller loop that decides what to do next. Training such an agent involves trajectory logging, feedback loops, evaluators that judge output quality, and progressive trust/autonomy.

The key concepts across the four sources are: the ReAct loop (Think → Act → Observe → Reflect), Process Reward Models (scoring each reasoning step, not just the final answer), evaluator agents (agents that judge other agents), feedback loops that create self-improving systems, memory layers (conversation context plus long-term knowledge), multi-agent coordination, and autonomy progression from supervised to autonomous.

---

## What SageReasoning already covers

The product line already addresses a substantial portion of what the research describes, though often using different terminology grounded in Stoic philosophy rather than ML conventions.

**Evaluator agents.** This is the core of the product. sage-guard (safety gate), sage-score (action quality), sage-decide (option ranking), sage-audit (document quality), sage-converse (conversation quality) — these are evaluators. The research describes "agents that judge agents" as a critical advanced capability. SageReasoning has 26 of them.

**The ReAct loop.** The ring wrapper implements this pattern: BEFORE (Think — check profile, detect passions, enrich context) → inner agent acts → AFTER (Observe and Reflect — evaluate output, update accreditation, surface insights). The research frames this as the industry-standard reasoning pattern. SageReasoning implements it with a Stoic lens.

**Autonomy progression.** The Agent Trust Layer's authority levels (supervised → guided → spot_checked → autonomous → full_authority) directly map to what the research calls progressive autonomy. The Senecan grade system tracks direction-of-travel.

**Memory.** The Mentor profile (passion_map, causal_tendencies, value_hierarchy, oikeiosis_map, virtue_profile) is long-term memory. The session bridge provides short-term context. The journal pipeline provides episodic memory.

**Multi-agent coordination.** The ring pattern with inner agents, Sage Ops' multi-agent pipeline, and the support agent's ring structure are all multi-agent systems.

**Safety filtering.** sage-guard and the guardrails.ts distress detection implement what the research calls the safety filter evaluator.

---

## What's missing or underdeveloped

The following capabilities appear consistently across the research but are either absent from or underdeveloped in the current product line.

### Gap 1: Feedback Loops — Receipts as Training Data

**What the research says:** Every reasoning agent run should be logged as a trajectory. These trajectories — including the reasoning steps, tool calls, and outcomes — become the training data for improving the agent over time. The ChatGPT research calls this "where real learning happens." The Perplexity research emphasises that training on actual trajectories produces better results than synthetic data.

**What we have:** Reasoning receipts exist on all refactored API routes. These receipts record which mechanisms were applied, the depth, the model used, and latency. But receipts are currently stored and forgotten. They are not fed back into anything.

**What's missing:** A feedback pipeline that aggregates receipts, identifies patterns (which actions consistently score low? which passions recur? where do agents fail?), and uses those patterns to improve the system. This is not a new skill — it's a pipeline that connects existing capabilities.

**Product opportunity:** sage-feedback (or an enhancement to sage-iterate). Takes a collection of reasoning receipts from an agent's history and produces a performance profile: where the agent's reasoning is strong, where it's weak, what passions recur, and what the improvement trajectory looks like. For agent developers, this is "how to make your agent reason better over time." For our own use, this is how Sage Ops improves.

**Stoic grounding:** This is the examined life applied to agent reasoning. Unexamined receipts are like unexamined impressions — present but not useful until they're reflected on.

### Gap 2: Process Reward — Step-Level Scoring

**What the research says:** Process Reward Models (PRMs) score each step in a reasoning chain, not just the final answer. This produces more reliable reasoning because it catches where the chain breaks down. The Google AI and Grok sources both highlight this as a key differentiator between strong and weak reasoning agents.

**What we have:** sage-reason produces a multi-stage output (control_filter → passion_diagnosis → oikeiosis → value_assessment → kathekon_assessment → iterative_refinement). But the proximity score is a single final assessment. The intermediate stages are reported but not individually scored.

**What's missing:** Per-stage quality scoring. Did the control_filter correctly distinguish within/outside prohairesis? Did the passion_diagnosis identify the right passions? Was the oikeiosis assessment accurate about which circles are affected? Each stage has its own success criteria that could be independently evaluated.

**Product opportunity:** sage-reason already returns structured output for each stage. Adding a per-stage quality score would make the output directly comparable to a PRM. Agent developers could see not just "this action scored at the deliberate level" but "the passion diagnosis was strong, but the oikeiosis assessment missed Circle 3 implications." This is more useful for improvement than a single score.

**Stoic grounding:** The Stoics distinguished between different types of cognitive failure — you might correctly identify what's within your control but still misjudge the passions driving your response. Per-stage scoring maps this distinction into the API.

### Gap 3: Self-Critique / Reflection as a Feedback Loop

**What the research says:** The best reasoning agents include a reflection step that feeds back into the next iteration. The Grok source calls this "Reflexion for self-critique." The ChatGPT source describes it as "agents that judge agents" as a distinct architectural layer.

**What we have:** sage-reflect exists but operates as a standalone end-of-day review. sage-iterate provides iterative refinement within a single chain. The ring wrapper has an AFTER stage that evaluates output. But none of these feed the reflection output back into the agent's next action in a continuous loop.

**What's missing:** A wired connection between sage-reflect's output and the Mentor profile. When sage-reflect identifies a pattern ("you consistently underweight oikeiosis Circle 3 in time-pressured decisions"), that pattern should update the Mentor profile's causal_tendencies and inform the ring wrapper's BEFORE check on the next interaction. Currently, reflection and profile are separate systems.

**Product opportunity:** Wire sage-reflect → Mentor profile update → ring wrapper BEFORE enrichment. This creates the self-improving feedback loop the research describes. The agent (or practitioner) reflects, the reflection updates the long-term memory, and the next interaction is informed by the reflection. For agent developers: "your agent learns from its own retrospectives."

**Stoic grounding:** This is the evening review Seneca describes — examining the day's actions and carrying the lessons forward. The architecture for it exists in pieces. Connecting them creates the examined life as infrastructure.

### Gap 4: Adversarial Self-Play for Evaluation

**What the research says:** Agents that generate increasingly sophisticated attempts to game the evaluation, then the evaluation evolves. The Grok source describes "self-play for autocurricula" where the model generates increasingly hard tasks.

**What we have:** R18d requires adversarial evaluation of the trust layer before broad deployment. sage-profile uses 4 fixed scenarios to assess an agent. But there's no system that generates novel evaluation scenarios based on observed weaknesses.

**What's missing:** A capability that takes an agent's profile (from sage-profile or accumulated receipts) and generates targeted evaluation scenarios designed to probe the agent's specific weaknesses. If an agent consistently handles justice-related decisions well but struggles with temperance under pressure, the evaluation should generate more temperance-under-pressure scenarios.

**Product opportunity:** sage-challenge (new skill). Takes an agent profile and generates adversarial scenarios targeting identified weaknesses. Uses the passion taxonomy to construct situations that trigger the agent's specific false judgements. This serves R18d directly (adversarial evaluation of the trust layer) and gives agent developers a tool for stress-testing their agents.

**Stoic grounding:** The Stoic practice of premeditatio malorum — rehearsing difficulties in advance. sage-challenge is premeditatio for agents.

### Gap 5: Reasoning Traces as a Service

**What the research says:** The most valuable training data for reasoning agents is expert demonstrations of correct multi-step behaviour. The Perplexity source says the best results come from "actual trajectories of thought, tool calls, and outcomes." The Grok source emphasises "collect or generate CoT data using a strong teacher model."

**What we have:** sage-reason produces detailed, structured reasoning traces with named stages, mechanism tracking, and philosophical grounding. These traces are returned to the caller and discarded.

**What's missing:** An explicit product offering where SageReasoning's reasoning traces become training data for agent developers. When sage-reason evaluates an action at deep depth, the 6-stage trace is a high-quality Chain-of-Thought demonstration grounded in a coherent philosophical framework. Agent developers building their own reasoning capabilities could use these traces as training data for fine-tuning.

**Product opportunity:** This could be a premium API feature: sage-reason-trace returns the full reasoning trajectory in a format compatible with standard fine-tuning pipelines (JSONL with input/reasoning/output structure). Agent developers pay for access to philosophically-grounded reasoning demonstrations they can use to fine-tune their own models. This is the distillation pattern the research describes — a strong teacher model (sage-reason) generating traces that smaller models learn from.

**Stoic grounding:** Teaching virtue by example. The traces are not just data — they're demonstrations of principled reasoning that other agents can learn to emulate.

### Gap 6: Curriculum / Progressive Difficulty

**What the research says:** Agents learn better when task difficulty increases progressively. The Grok source describes "self-evolving pipelines with hierarchical agents that create tasks, attempt them, verify, and refine." The Perplexity source emphasises diverse tasks so the model doesn't overfit.

**What we have:** The authority levels (supervised → full_authority) provide a progression framework. sage-diagnose offers quick (14 questions) and deep (55 assessments) evaluations. But there's no curriculum that progressively increases challenge as an agent develops.

**What's missing:** A structured developmental pathway where the evaluation scenarios an agent faces become more nuanced as its proximity level increases. A reflexive-level agent should face clear-cut control_filter tests. A principled-level agent should face situations where multiple virtues conflict and the passions are subtle.

**Product opportunity:** sage-curriculum (new skill or enhancement to sage-profile). Given an agent's current proximity level, generates an appropriate set of evaluation scenarios that test at and slightly above their current capability. When the agent passes, the curriculum advances. This maps the Stoic developmental sequence (prokoptōn stages) into a structured training pathway for agents.

**Stoic grounding:** The Stoics recognised that moral development is progressive — you don't start with the hardest cases. Epictetus taught beginners with simple exercises before advancing to complex situational ethics. sage-curriculum applies this pedagogy to agent training.

### Gap 7: RAG for Stoic Brain Knowledge Grounding

**What the research says:** RAG (retrieval-augmented generation) grounds reasoning in external knowledge. The Grok source recommends "combine with RAG for knowledge grounding." All four sources describe tools and knowledge access as fundamental to reasoning agents.

**What we have:** sage-context provides deterministic access to Stoic Brain reference data. The 8 JSON files (virtue, action, scoring, progress, psychology, passions, value, stoic-brain) total roughly 1,300 lines of structured Stoic knowledge. But sage-context returns complete files — there's no semantic search across the knowledge base.

**What's missing:** Embedded, semantically searchable Stoic Brain knowledge. An agent that encounters a specific situation (a negotiation involving competing obligations to different social circles) should be able to retrieve the specific Stoic concepts relevant to that situation (oikeiosis circles, kathekon in role-based obligations, the relevant passions) without loading the entire knowledge base.

**Product opportunity:** sage-context-rag (enhancement to sage-context). Embeds the Stoic Brain JSON files and provides semantic retrieval. Agents query with a natural-language description of their situation and receive the most relevant Stoic concepts, citations, and frameworks. This makes the Stoic Brain accessible to agents that want grounded reasoning without using the full sage-reason API. Lower cost, faster, and more targeted.

**Stoic grounding:** The Stoics organised their knowledge into interconnected domains (physics, logic, ethics) that informed each other. RAG-enabled access to the Stoic Brain mirrors this — you retrieve what's relevant to your situation, not the entire corpus.

---

## Summary Table

| Gap | Concept from Research | Current State | Proposed Capability | Priority |
|---|---|---|---|---|
| 1 | Feedback loops / trajectory logging | Receipts exist but aren't fed back | sage-feedback pipeline | High — connects existing systems |
| 2 | Process Reward Models | Single final score, stages reported but not scored | Per-stage quality scoring in sage-reason | High — enhances core product |
| 3 | Self-critique feedback loop | sage-reflect + Mentor profile exist separately | Wire reflect → profile → ring BEFORE | High — connects existing systems |
| 4 | Adversarial self-play | R18d requires it, not built | sage-challenge (new skill) | Medium — serves R18d |
| 5 | Reasoning traces as training data | Traces generated, discarded | sage-reason-trace (premium API) | Medium — new revenue stream |
| 6 | Progressive difficulty curriculum | Authority levels exist, no curriculum | sage-curriculum (new skill) | Medium — differentiator |
| 7 | RAG knowledge grounding | sage-context returns full files | sage-context-rag (semantic search) | Lower — optimisation |

---

## What We Got Right

The research confirms that SageReasoning's architecture is well-aligned with industry-standard reasoning agent design. The ring wrapper is the ReAct loop. The authority levels are progressive autonomy. The evaluator skills are the "agents that judge agents" layer. The Mentor profile is long-term memory. The skill registry is the tool catalogue. The Stoic Brain is the knowledge base.

The product line was designed from philosophical principles (the Stoic developmental sequence, the oikeiosis circles, the passion taxonomy). The research describes the same architecture from engineering principles (ReAct, PRM, feedback loops, autonomy progression). The convergence suggests the philosophical design was structurally sound — it arrived at the same patterns from a different direction.

The gaps are not in the architecture but in the connections between components. Receipts exist but don't feed back. Reflections exist but don't update profiles. Stages are reported but not scored. The most impactful improvements are wiring, not building.

---

## The R0 Frame

Gaps 1, 2, and 3 improve our own development immediately. If sage-reflect updates the Mentor profile, the Mentor's guidance to the founder becomes more accurate over time. If reasoning receipts feed back into the system, Sage Ops improves from its own experience. If per-stage scoring exists, our own debrief analysis becomes more precise.

Gaps 4, 5, and 6 serve the agent developer audience (Circle 3) and differentiate SageReasoning in the market. No other reasoning evaluation service offers adversarial scenario generation grounded in a philosophical framework, or philosophically-grounded reasoning traces as fine-tuning data, or a developmental curriculum that progresses with the agent.

Gap 7 is an optimisation that makes the knowledge base more accessible to agents (Circle 4) — extending principled reasoning to all rational agents by lowering the barrier to accessing Stoic wisdom.
