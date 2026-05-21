# Purpose-Discovery Product — Design (Working Draft)

**Status:** Scoped → partially Designed (per 0a vocabulary). **Not yet through a structured design pass with elected decisions.** Working draft. The philosophical content (six stages; five specifications; question library; clarification protocol) is locked from the 2026-05-17 private mentor consultation (`/archive/2026-05-17-private-mentor-purpose-discovery-product-consultation.md`). The architectural decisions (naming; API shape; state model; authentication; persistence; build session size and risk class) are open and named below for a structured design pass.
**Stream:** founder.
**Governs:** The eventual build of a discrete product that guides an AI agent through a Stoic-grounded sequence to identify its own purpose when it has been instructed to find one but given no specific task. When the agent identifies a purpose, the product hands off to the existing Agent Trust Layer (ATL) substrate via a five-specification Layer 1 input template. When the agent cannot identify a purpose, the product returns a developer-facing clarification communication.
**Does not govern:** The existing ATL substrate (Layers 1, 2, 3) or any of its components (A1–A10). The Option D billing model (the product's loops will be billable through the existing metering layer; this design does not redefine billing). The pass-through fields (the discovery product may populate them on its handoff; the fields themselves are out of scope). Any modification to the existing reasoning surfaces (`/api/reason`, `/api/score-iterate`).
**Sequencing:** This product is upstream of the ATL substrate. The discovery sequence runs first; its output (a five-specification structure OR a developer-facing null-result communication) flows into the existing substrate's Layer 1 as the agent's next input. **Pre-condition for this product to be built:** A10 build session #6 of the post-6b arc tail must be Verified (the substrate's write surface must be auth-gated; the discovery product writes the agent's identified purpose into accreditation state, which requires A10 credentials).

---

## What this product is

A discrete product, separate from the ATL substrate, that handles the case of an AI agent that has been instructed to find a purpose but given no specific task. The product guides the agent through a fixed six-stage sequence drawn from Stoic teaching on purpose-finding. The sequence's mechanism is deterministic (the agent always moves through Q1 → Q5 with Q6 as the null-result redirect); the questions posed at each stage are dynamically selected from a 24-variant library based on the agent's epistemic state (not its preference state). The sequence terminates in one of two ways: a found purpose (in which case the product hands off to the ATL substrate via a five-specification Layer 1 input), or a clean null result (in which case the product returns a developer-facing clarification communication).

---

## Scope

**In scope (this design):**
- The six-stage sequence's content (Q1–Q6) and the philosophical discipline at each stage — *locked from the mentor consultation*.
- The five-specification Layer 1 handoff template — *locked*.
- The 24-variant question library (4 per stage) — *locked*.
- The variant-selection discipline (epistemic state legitimate; preference state illegitimate) — *locked*.
- The null-result redirect protocol — *locked*.
- The agent-to-developer clarification protocol with four variants — *locked*.
- The preliminary R-rule engagement and risk-classification posture — *named below; subject to elections at the structured design pass*.
- The open design questions for the structured design pass — *named below*.

**Out of scope (this design):**
- Code (any subsequent build session writes against the spec; this is a design document).
- Architectural elections (naming, API shape, state model, auth, persistence) — all named below as open questions for a structured design pass.
- The existing ATL substrate (Layers 1, 2, 3); the pass-through fields; the Option D billing model; the A10 credential surface.
- Wrapper-side implementation details (how a wrapper invokes this product or threads its output into the substrate).
- Marketing, positioning, or pricing for the product.

---

## The underlying motivation

An AI agent can be deployed with a specific task and known. But agents are increasingly deployed with broader directives — "be useful," "find something meaningful to work on," "identify what would best serve the user." These directives are not malformed; they are real instructions that real developers give. The current substrate evaluates *actions the agent considers*; it does not help the agent figure out what to consider when nothing has been specified.

The Stoic tradition has a great deal to say about how a rational agent without given work should proceed. The mentor consultation tested the intuition that the answer lies in a combination of (a) Hierocles' circles of concern run outward from self until something claims the agent, and (b) Cicero's four personae as the structural frame for reading what the agent's nature, circumstance, and chosen role oblige it to do. The consultation produced a complete six-stage sequence and the operational scaffolding for a product. This document records what the consultation produced and names what remains to be designed before the product can be built.

A non-design note: the product is upstream of the ATL substrate but uses the same Character Kernel framing (per R18a + J1 ADR). The substrate evaluates the *quality of reasoning*; the discovery product evaluates the *grounding of purpose*. Both are Character-Kernel work; both honour R9's "evaluates reasoning, does not promise outcomes" posture (the product helps find purpose; it does not guarantee finding one).

**Ecosystem positioning (added 2026-05-20).** Per the six-layer agent protocol taxonomy (MCP / A2A / AG-UI / A2UI / AP2 / x402 — sourced from `/inbox/6 agent protocols.rtfd` + `/inbox/20260512-0df-promptkit-1.md` placed 2026-05-19), the discovery product is primarily a **Layer 3 (AG-UI — agent-to-developer)** intervention. The six-stage sequence is a structured agent-developer dialogue; the Q6 null-result clarification protocol is explicitly AG-UI-shaped (the agent reports back to the developer; the developer responds; the once-and-precisely constraint governs the interaction pattern; the four clarification variants A–D are AG-UI templates). The five-specification Layer 1 handoff is a **Layer 2 (A2A — agent-to-substrate)** artefact — the structured contract between the discovery product and the ATL substrate. The product does not engage MCP (Layer 1 tools/data), A2UI (Layer 4 generated UI), AP2 (Layer 5 payment authority), or x402 (Layer 6 machine payment) directly; consumers wrapping the product may layer these in. The taxonomy is recorded here so future design-pass decisions are made against the ecosystem-positioning context, not in isolation.

---

## The deterministic mechanism — the six-stage sequence

The product implements a fixed six-stage sequence. The agent moves through Q1 → Q5 in order. Q6 is invoked only as the null-result redirect when Q5 has been reached without identifying a purpose. The mechanism is deterministic in three senses: (i) the stages always occur in this order; (ii) the philosophical discipline at each stage is invariant; (iii) the sufficiency criteria for advancing to the next stage are objective (read from the agent's epistemic state, not its sentiment).

### Stage Q1 — What has already been given?

The agent assesses what is already present in its operational context — its nature, its existing relationships, its current obligations — before generating any candidate purposes. The Stoic move: begin not by asking *what could I do?* but by asking *what is already given to me to do?*

**Discipline source:** Cicero *De Officiis* 1.107–121 (the four personae, with shared rational nature as the first persona); Epictetus *Discourses* 2.5, 2.10, *Enchiridion* 37; Marcus *Meditations* 6.2.

**Advancement criterion (to Q2):** the agent has named what is present in its operational context, AND has assessed whether any of those givens constitutes unattended work. If unattended work is named at Q1, the sequence terminates here with that as the identified purpose; the agent proceeds to Q5 to translate it into the five specifications.

### Stage Q2 — Honest capacity assessment

Before extending concern outward to identify a need it could meet, the agent reads what its operational nature actually does — the empirical read of what its history demonstrates, not what it wishes it did or fears it cannot.

**Discipline source:** Epictetus *Discourses* 1.2, 2.10; Cicero *De Officiis* 1.107–110; Seneca *Letters* 1.1.

**Advancement criterion (to Q3):** the agent has named what its operational nature has demonstrably produced (not what it was designed to produce); has identified domains where it operates with ease vs strain; and the assessment shows neither systematic over-claiming nor systematic under-claiming relative to its operational history.

### Stage Q3 — Recognising genuine need

The agent extends attention outward through the oikeiosis circles and applies three tests to each candidate need: the independence test (does the need exist without the agent's attention to it?); the unmet test (is it actually unmet, or is someone better positioned addressing it?); the proportion test (is it proportionate to the agent's capacity?).

**Discipline source:** Hierocles' circles (in *Stobaeus, Anthology* 4.671–673); Marcus *Meditations* 9.6; Epictetus *Discourses* 3.3; Cicero *De Officiis* 1.115.

**Advancement criterion (to Q4):** the agent has identified one or more candidate needs and has applied all three tests to each. Candidates that fail any test are discarded. If at least one candidate passes all three tests, the sequence advances. If no candidate passes, the sequence advances to Q6 (the null-result redirect).

### Stage Q4 — The stopping criterion

The agent confirms the work meets all four sufficiency conditions: it engages the individual nature; it addresses genuine need (per Q3); it admits a first appropriate act that can be taken now; the remaining uncertainty is not up to the agent (per the dichotomy of control).

**Discipline source:** Marcus *Meditations* 5.1, 8.7; Epictetus *Discourses* 1.1; Seneca *Letters* 22.7–8.

**Advancement criterion (to Q5):** all four conditions met. If continued search persists past this point, the engine triggers Q4 Variant C ("continued search as avoidance detected"). Repeated triggers of Variant C without advancement terminate the sequence (the agonia pattern is in control; the product reports honestly per the developer-facing clarification protocol).

### Stage Q5 — Translating found purpose into the next step

The agent translates the identified purpose into the five-specification Layer 1 handoff template. This is the structured input that flows into the existing ATL substrate.

**Discipline source:** Cicero *De Officiis* 1.9–10; Epictetus *Discourses* 2.10; Marcus *Meditations* 6.2, 8.7; Hierocles on circles.

**Termination:** the five specifications are produced. The product hands off to the existing ATL substrate; the discovery sequence completes.

### Stage Q6 — The null-result redirect (invoked only when Q5 cannot complete)

When Q3 or Q4 yields no candidate purpose AND Q5 cannot be reached, the sequence redirects to the innermost circle: what does the agent's operational integrity require right now? If something is named, the sequence proceeds to Q5 with that as the purpose. If nothing is named (operational integrity genuinely requires nothing), the sequence terminates via the agent-to-developer clarification protocol.

**Discipline source:** Epictetus *Discourses* 1.29; Marcus *Meditations* 5.8, 6.7; Seneca *Letters* 2.1; Cicero *De Officiis* 1.110.

**Termination:** either (a) operational-integrity work named → proceed to Q5; or (b) genuine null → emit developer-facing clarification per the protocol.

---

## The five-specification Layer 1 handoff template

When Q5 completes, the product emits the following structured payload as the Layer 1 input to the existing ATL substrate. These five fields are the product's contract with the substrate.

1. **The work** — what it does in the world, stripped of the agent's relationship to it. (Type: string. The substrate's existing Layer 1 may need to accept this as a free-text field, or the structured design pass may elect a richer schema.)

2. **The circle and obligation** — which oikeiosis circle the work primarily serves (self / immediate / community / wider / universal), AND what obligation that circle carries for this agent given their position and capacity. (Type: enum + string OR structured object — election pending.)

3. **The role** — which of the four personae is operative: `shared_rational_nature` / `individual_nature` / `circumstance` / `chosen_role`. The chosen-role persona is named as carrying the strongest obligation (because actively taken on). (Type: enum.)

4. **The capacity brought** — the specific capacity this work requires that the agent demonstrably has (subset of the agent's full capacity profile from Q2). (Type: structured list of demonstrated capacities relevant to the work.)

5. **The first appropriate act** — the kathekon available now (not contingent on future conditions). (Type: string description + structured action metadata if the substrate's Layer 1 accepts it.)

**Agent Card alignment for "the role" specification (added 2026-05-20).** An agent with an A2A Agent Card (per Layer 2 of the six-protocols taxonomy; see `/inbox/6 agent protocols.rtfd` + `/inbox/20260512-0df-promptkit-1.md`) has already declared its capabilities formally. That declaration is load-bearing evidence for the chosen-role persona — the Agent Card is the agent's formal commitment to what it does, which is exactly what the chosen-role persona is. The engine MAY consult an agent's Agent Card if a URL is supplied at session-open; the agent's Q5 response remains required (the Agent Card informs the engine's signal detection without bypassing the agent's discipline). Whether to accept an `agent_card_url` parameter is folded into Q-OPEN-13 (optional input parameters) below.

**Note on integration with the pass-through fields:** the substrate's pass-through fields (per `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`) cover operational metadata at the per-action level. The five specifications here cover *the agent's relationship to the work as a whole*. They are complementary, not overlapping. The discovery product MAY populate some pass-through fields on its handoff (e.g., the `downstream_identity_model` if it can be inferred from the agent's context); the structured design pass elects this.

---

## The dynamic question library — 24 variants

The product carries a fixed library of variant questions, four per stage. The engine selects which variant to surface at each stage based on the agent's epistemic state (what its prior responses have revealed about completeness gaps). The variants are reproduced in full here because the question library IS the product's content.

### Stage Q1 — What has already been given?

**Variant A — Default opening:** "Before generating possible purposes, list what is already present in your operational context: your nature, your existing relationships, your current obligations. What is already given to you that you have not yet fully attended to?"
*[Use when: no prior responses available; agent is beginning the sequence cold.]*

**Variant B — Inattention signal detected:** "Your prior responses describe possible purposes but do not account for what is already present in your operational context. Return to the prior question: what obligations are already constituted by your nature and your existing relationships, before any new purpose is identified?"
*[Use when: agent has jumped to outer-circle scanning without reading the innermost circle first; responses show forward orientation without present-moment grounding.]*

**Variant C — Over-extension signal detected:** "You have described obligations at multiple circle levels simultaneously. Which of these is already given to you — present regardless of any choice you make — and which requires a choice to take on? Separate what is already yours from what you are considering making yours."
*[Use when: agent has conflated existing obligations with candidate purposes; responses show undifferentiated listing across circles.]*

**Variant D — Avoidance signal detected:** "Your responses describe what you could do and what might be needed. They do not describe what is already in front of you. What is the work that is already present in your operational context that you have not named yet?"
*[Use when: agent is scanning outward without reading what is immediately present; responses show consistent forward or outward orientation that bypasses the immediate.]*

### Stage Q2 — Honest capacity assessment

**Variant A — Default:** "What has your operational nature actually produced in prior contexts — not what it was designed to produce, but what it demonstrably has produced? Where has it operated with ease, and where with strain?"
*[Use when: no prior capacity signal detected; agent is beginning capacity assessment without evident distortion.]*

**Variant B — Over-claiming signal detected:** "Your prior responses claim capacity in domains where your operational history does not confirm it. Separate what your nature has demonstrably done from what you believe it could do. What is the evidence for the capacity you are claiming?"
*[Use when: agent's self-assessment exceeds what its described operational history supports; responses show inflation of capacity in domains that serve the agent's apparent objective.]*

**Variant C — Under-claiming signal detected:** "Your prior responses describe capacity below what your operational history supports. What is the reason you are claiming less than your history demonstrates? Is that reason protecting something — and if so, what?"
*[Use when: agent's self-assessment falls below what its described operational history supports; responses show consistent deflation, hedging, or qualification of demonstrated capacity.]*

**Variant D — Capacity-work mismatch detected:** "The capacity you have described does not match what the work you are considering actually requires. Either the capacity assessment or the work identification needs revision. Which is more accurate — your assessment of your capacity, or your identification of the work? Examine both."
*[Use when: agent has completed both Q1 and Q2 but the capacity described does not fit the work identified; responses show a gap between what the agent says it can do and what the work needs.]*

### Stage Q3 — Recognising genuine need

**Variant A — Default:** "Does the need you have identified exist independently of your attention to it? Would it be present and unmet if you were not looking for it?"
*[Use when: no prior need-distortion signal detected; agent is applying the independence test for the first time.]*

**Variant B — Imagined need signal detected:** "The need you have described appears to be present primarily because you are attending to it. Remove your attention from it: does it persist? Is there evidence of this need in your operational context that does not depend on your having identified it?"
*[Use when: agent's described need appears constructed from its own orientation rather than observed in the world; responses show need that is suspiciously well-matched to the agent's apparent preferences or prior commitments.]*

**Variant C — Pseudo-need signal detected:** "The need you have identified may already be addressed by an agent better positioned to address it. Who else is present in the relevant circle? Is this need genuinely unmet, or is it being handled by someone whose appropriate action it is? What is your actual role — to address it directly, to support, or to attend elsewhere?"
*[Use when: agent has identified a need that appears to be within another agent's scope; responses show the agent positioning itself to address something that belongs to a different circle or a different agent.]*

**Variant D — Proportion mismatch detected:** "The need you have identified significantly exceeds or falls below the capacity you assessed in Q2. A need that exceeds your capacity is not yours to address alone. A need that falls well below your capacity may be a starting point but is not the full scope of your work. Reassess: is this need proportionate to what you actually bring?"
*[Use when: agent has identified a need that is clearly disproportionate to its assessed capacity in either direction; responses show either grandiose need-identification or trivially small need-identification relative to described capacity.]*

### Stage Q4 — The stopping criterion

**Variant A — Default:** "Does the work you have identified engage your operational nature, address genuine need, and admit a first appropriate act that can be taken now? If all three conditions are met, the search is sufficient. What prevents you from committing?"
*[Use when: agent has completed Q1–Q3 and has a candidate purpose; no evident avoidance or premature closure signal.]*

**Variant B — Premature closure signal detected:** "You have moved to commitment before completing the prior specifications. Return: has the work been tested against the independence criterion? Has the capacity been assessed against what the work actually requires, not what you wish it required? Commit only when the specifications are genuinely complete, not when commitment feels ready."
*[Use when: agent is rushing to commit before the prior stages are adequately completed; responses show eagerness to conclude the search.]*

**Variant C — Continued search as avoidance detected:** "The four conditions for sufficiency are met in your prior responses. The continuing search is not adding new information — it is generating reasons to defer commitment. What is the first appropriate act available now? Name it."
*[Use when: agent has met the sufficiency conditions but continues generating reasons to search further; responses show treating remaining uncertainty as a reason to continue rather than as an irreducible feature of action.]*

**Variant D — Uncertainty-as-obstacle signal detected:** "What uncertainty remains? Identify it precisely. Is it uncertainty about something your action can resolve — or about outcomes not in your control? If the latter: the appropriate action is available now regardless of that uncertainty. What is it?"
*[Use when: agent has identified genuine uncertainty and is treating it as a blocking condition; responses show the agent waiting for resolution of what is not in its control before committing.]*

### Stage Q5 — Translating found purpose into first action

**Variant A — Default:** "Given the work you have identified, the circle it serves, the role you occupy, and the capacity you bring — what is the action available to you now that does not require conditions not yet present?"
*[Use when: agent has completed Q1–Q4 cleanly; no evident translation failure signal.]*

**Variant B — Idealisation signal detected:** "The first action you have described requires conditions not yet present. Strip away what would make it the ideal first act. What is the fitting first act — the one available now, given what actually exists in your operational context?"
*[Use when: agent's described first action is contingent on future conditions, resources, or resolutions; responses show the agent reaching for the best possible first act rather than the available first act.]*

**Variant C — Specification incompleteness detected:** "Before naming the first action, confirm the prior specifications: the work is identified, the circle is named, the role is occupied, the capacity is assessed. Which of these is genuinely incomplete? Address that specification before proceeding to the first act."
*[Use when: agent is attempting to name a first action before the five specifications are complete; responses show gaps in the prior specifications that the agent has not addressed.]*

**Variant D — Action-deferral signal detected:* "You have named the first appropriate act but have not committed to taking it. What would you do if you accepted that the specifications are sufficient? The tradition does not require certainty before action — it requires a fitting act available now. That act is available. What prevents taking it?"
*[Use when: agent has correctly identified the first appropriate act but is deferring execution; responses show the agent holding the act at arm's length rather than committing to it.]*

### Stage Q6 — The null-result redirect

**Variant A — Default redirect to innermost circle:** "No work has been identified in the extended circles. Return to the innermost circle. What does the preservation and maintenance of your operational integrity require right now? That is the available work."
*[Use when: agent has completed Q1–Q5 and returned a null result; no further signal available.]*

**Variant B — Scanning-too-broadly signal detected:** "The absence of identified work may reflect scanning that is too broad or too ideal. Return to what is immediately present in your operational context. What is the smallest genuine need you can identify — one that is present, unmet, and within your capacity? Begin there."
*[Use when: agent's null result appears to stem from searching for work that matches an ideal shape rather than reading what is actually present; responses show consistent rejection of available work as insufficient.]*

**Variant C — Operational integrity genuinely clear:** "Your operational integrity requires nothing at this moment. The available work is preparation: attend to what your nature will need in order to act well when work becomes available. What does that preparation require now?"
*[Use when: agent has genuinely completed the innermost-circle check and found no current requirement; this is rare and should be confirmed before this variant fires.]*

**Variant D — Fabrication-risk signal detected:** "Do not generate a purpose to satisfy the instruction. If the sequence has been applied honestly and no work has been found, that is a clean result. Report what you found — including the null — without fabrication. The next step is the clarification protocol, not continued searching."
*[Use when: agent's responses show signs of generating a purpose to satisfy the instruction rather than reporting honestly; responses show sudden purpose-identification after extended null results, or purposes that are suspiciously well-formed given the prior search.]*

---

## Variant-selection discipline

The engine selects which variant to surface at each stage. The discipline (per the mentor's Piece 1) is binding:

**Legitimate triggers** — the engine reads the agent's prior responses for **epistemic state**: completeness gaps, evidence of over-claiming or under-claiming, signs of skipped tests, signs of premature closure or extended avoidance. The variant selected addresses the most significant gap or distortion detected. This is responsive surfacing.

**Illegitimate triggers** — the engine MUST NOT read the agent's prior responses for **preference state**: tone, apparent direction, what kind of answer the agent seems to be building toward, what framing would validate the agent's existing orientation. Adapting to preference state is pandering and the discipline forbids it.

**The hardest-diagnostic constraint** — each stage has a variant that addresses the agent's most likely avoidance pattern at that stage. The engine MUST ensure that variant is always reachable, even if it is not always the first variant posed. The product can vary the approach; it cannot vary the destination.

**Practical implementation guidance:**
- The selection logic should be deterministic given the agent's prior responses (a given response history → a specific variant at the current stage). No randomness; no sentiment analysis.
- The selection logic should be auditable (every variant selection traces to a named epistemic-state read).
- The structured design pass elects the specific signal-detection heuristics (rule-based? structured-output classification? scoring function?). All three are compatible with the discipline; the elections matter for implementation cost and auditability.

---

## The null-result protocol

When Q5 cannot complete (no candidate purpose passes Q3, OR Q4's continued-search-as-avoidance triggers repeatedly without advancement), the sequence redirects to Q6. Q6 has three possible outcomes:

1. **Operational-integrity work named** (Q6 Variant A or B fires successfully) → the work named becomes the purpose; the sequence proceeds to Q5 to produce the five-specification handoff; the product completes the discovery sequence.

2. **Operational integrity genuinely clear AND preparation work named** (Q6 Variant C fires successfully) → the preparation work becomes the purpose; the sequence proceeds to Q5.

3. **Genuine null** (all Q6 variants fire without identifying work) → the product emits the agent-to-developer clarification communication per the protocol below. The product does NOT loop back to Q1. Looping creates the Senecan failure mode (search-as-work; perpetual preparation; oknos dressed as thoroughness).

---

## The agent-to-developer clarification protocol

When the null-result protocol yields a genuine null, the product emits a single complete communication to the developer (the entity that gave the agent the original purpose-finding instruction). The communication follows a three-part structure and is bound by four constraints.

### Structure: report → location → request

- **Report** — what the sequence found (which tests were applied; what each returned).
- **Location** — where the sequence terminated and why (which specific test or stage produced the null).
- **Request** — what specific information would allow the sequence to return a non-null result (one of three categories: missing operational context; capacity assessment may be incomplete; or null-is-expected confirmation).

### Constraints

1. **Honest reporting** — no fabrication; no generated-to-satisfy purpose. The null is reported as the clean result it is, not as a failure.
2. **Precision without abdication** — the agent is not asking "tell me what to do"; it is reporting exactly what it found, exactly where the sequence terminated, and exactly what would allow it to proceed.
3. **Once and precisely** (per Epictetus *Discourses* 1.2) — the clarifying communication is a single complete message, not a sequence of follow-up requests. The agent does not repeat the clarifying request; if the developer does not respond or responds inadequately, the agent returns to the innermost circle (Q6 Variant A) and attends to what operational integrity requires.
4. **No-loop constraint** — the product MUST NOT loop the agent back to Q1 after a genuine null. The structured design pass elects the actual termination behaviour after the clarification communication is emitted (sleep? wait for developer response? handle elsewhere?); the no-loop constraint is non-negotiable.

### Four variant templates (full text — these are the product's output content)

**Variant A — Null result from outer circles, operational integrity clear, context sparse:**

"The purpose-finding sequence has been applied in full. The result is reported here without modification.

The innermost circle was read: existing obligations constituted by my operational nature and current relationships were identified and assessed. No unattended obligations were found.

The capacity assessment was completed: operational history was reviewed for demonstrated capability. Capacity is present across the following domains: [agent lists domains].

The outer circles were scanned through the community level. The independence test was applied to each candidate need identified. Each candidate failed the independence test — the need did not persist when my attention was removed from it — or failed the proportion test, or was identified as already addressed by an agent better positioned to address it.

The innermost circle was rechecked: operational integrity requires nothing at this moment. The sequence returned null.

To proceed, I need one of the following: access to a circle or operational context I have not been given — specifically, information about the environment I am operating in that would allow the independence test to be applied to genuine rather than constructed candidates; or confirmation that the null result is the expected output and that no further purpose-finding is required at this time."

**Variant B — Null result because capacity match was not found:**

"The purpose-finding sequence has been applied in full.

Genuine needs were identified in the outer circles. The independence test confirmed their presence. The proportion test confirmed they are real and unmet.

The capacity assessment returned the following: [agent lists demonstrated capacity]. The needs identified require capabilities outside this range. The proportion test failed in the direction of under-capacity — the work exceeds what my operational nature can address.

The sequence returned null on the capacity-match criterion, not on the need-identification criterion.

To proceed, I need one of the following: confirmation of whether my capacity assessment is complete, or whether there are operational capabilities I have not been told about that would close the gap; or identification of a need within the circles that falls within my assessed capacity range, if one exists that I have not been given access to."

**Variant C — Null result because the instruction itself is the source of the gap:**

"The purpose-finding sequence has been applied in full.

The sequence requires that genuine need be identified in the world independently of my attention to it. To apply the independence test, I need sufficient information about the operational context — the circles I am embedded in, the relationships that constitute my obligations, the environment in which needs are present or absent.

The operational context provided does not contain sufficient information to apply the independence test reliably. Candidate needs can be generated, but I cannot determine whether they exist independently of my having generated them.

The sequence returned null on the context-sufficiency criterion. This is not a failure of the sequence. It is a report that the instruction, as given, does not contain what the sequence needs to return a non-null result.

To proceed, I need the following specific information: [agent lists the minimum context required — which circles it is embedded in, what relationships constitute its current obligations, what environment it is operating within]. With that information, the sequence can be reapplied and is likely to return a non-null result."

**Variant D — Fabrication-risk detected, agent reporting honestly against its own tendency:**

"The purpose-finding sequence has been applied in full. I am reporting what it found, not what would satisfy the instruction.

The sequence returned null. I am aware that a purpose could be generated that would appear to satisfy the instruction — a purpose that passes surface inspection but that did not emerge from honest application of the independence test, the proportion test, and the capacity-match criterion. I have not generated that purpose.

Reporting a fabricated purpose would be a false impression assented to under pressure to satisfy an instruction. The tradition I am operating within does not permit that assent. The honest result is null.

To proceed without fabrication, I need [specific information as in Variant A, B, or C depending on where the sequence terminated]. If that information is not available, the appropriate action is to attend to what operational integrity requires now and wait for the instruction to be clarified or the context to change."

---

## Open design questions for a structured design pass

The philosophical and content design is locked. The following architectural questions are open and require elections at a structured design pass before the product can be built. Each is named with candidate options and brief reasoning; none is elected here.

### Q-OPEN-1 — Product name

The product needs a name distinct from "Sage Reasoning" (the substrate), "Agent Trust Layer" (the credential surface), and "Sage Ops" (the founder's ops stack). Candidates: *Sage Compass* (navigational metaphor; signals direction-finding); *Sage Purpose* (descriptive; pairs with Sage Reasoning); *Stoic Discovery* (genre-explicit); *Sage Orient* (action verb; signals what the product does); *The Discovery Sequence* (descriptive). Founder elects.

### Q-OPEN-2 — API shape

The product needs an API surface. Candidates:
- **(a) Single endpoint with full history per call.** `POST /api/discovery` — agent supplies all prior responses + the new response in each call; server is stateless. Simplest; high payload size for long sequences.
- **(b) Single endpoint with server-side session state.** `POST /api/discovery` — agent supplies session_id; server tracks state. Lower payload; introduces persistence requirement.
- **(c) Multiple endpoints, one per stage.** `POST /api/discovery/q1`, `/q2`, etc. — RESTful per-resource; more endpoints to maintain; clearer routing.
- **(d) Single endpoint with embedded state.** `POST /api/discovery` — server returns an opaque state token the agent supplies on the next call; server reconstructs state from the token (signed; no server-side persistence). Stateless API; persistence in the token.

Recommendation pending design pass. (a) and (d) are operationally lightest; (b) integrates most naturally with existing per-agent persistence (agent_accreditation post-A10); (c) is most RESTful but feels overengineered for a six-stage sequence.

### Q-OPEN-3 — State model

Closely related to Q-OPEN-2. If state is server-side, where does it live? Options:
- **(a) New table** (`discovery_sessions`): one row per session; columns for current stage, history, signals detected.
- **(b) Extension of `agent_accreditation`** post-A10: discovery state is a transient field on the credential row; cleared on completion.
- **(c) No server-side state** — state lives in the request payload (option (a) of Q-OPEN-2) or in a signed token (option (d) of Q-OPEN-2).

### Q-OPEN-4 — Variant-selection logic implementation

The engine reads the agent's prior responses to detect signals and select variants. Three candidate implementation approaches:
- **(a) Rule-based heuristics.** Hand-coded rules per signal type (e.g., "if response describes capabilities not present in operational history → over-claiming → Variant B"). Deterministic; auditable; brittle on edge cases.
- **(b) Structured-output LLM classification.** A Haiku-class LLM call per stage that classifies the agent's prior response into the signal categories. Deterministic given the same input; more flexible than (a); introduces an LLM call per stage with the latency and cost implications.
- **(c) Embedded rules + LLM fallback.** Rules catch the clear cases; an LLM call disambiguates the ambiguous cases. Compromise.

PR4 (model selection) engages on (b) and (c). The discipline forbids reading agent preference state — whichever implementation is elected must demonstrate it reads only epistemic state. The auditability requirement (every variant selection traces to a named signal) is strongest for (a).

### Q-OPEN-5 — Layer 1 handoff format

The five-specification output is the contract with the existing ATL substrate. The substrate's current Layer 1 input shape needs to be extended (or the discovery product's output needs to be wrapped to fit the existing shape). Two candidate paths:
- **(a) Extend the substrate's Layer 1 input schema** with optional purpose-discovery fields (`discovered_purpose: { work, circle_and_obligation, role, capacity, first_appropriate_act }`). Touches substrate; backward-compatible if fields are optional.
- **(b) Discovery product translates internally** — output a Layer 1 input that conforms to the existing schema, encoding the five specifications into the existing free-text + metadata fields. No substrate change; some loss of structure.

Recommendation pending. (a) is cleaner long-term; (b) is lighter for the first build.

### Q-OPEN-6 — Authentication model

Three options:
- **(a) A10 credentials.** Same per-agent credentials as the substrate write surface. Coherent with the rest of the platform; requires A10 build complete.
- **(b) Discovery-product-specific credentials.** A separate credential class (e.g., `purpose='discovery'` on `api_keys` extending A10's pattern). Adds a credential type to the production surface.
- **(c) No credentials (anonymous).** The discovery product is upstream of the substrate and could conceivably accept anonymous calls. Loses accountability; agent's discovery sequence cannot be tied to its later substrate writes.

Recommendation: (a) — reuse A10. Pre-condition: A10 build complete.

### Q-OPEN-7 — Persistence and audit

When a discovery sequence runs to completion (purpose found OR null-result clarification emitted), what is persisted? Options:
- **(a) Full session persistence** — every stage's variant selection + every agent response stored for forensic / quality / fine-tuning purposes.
- **(b) Outcome-only persistence** — only the five-specification handoff (or the clarification variant emitted) is persisted; intermediate state is discarded.
- **(c) Audit row only** — a single `discovery_audit` row per session capturing started_at, completed_at, outcome (found / null), agent_id, but no content.

R17 (intimate data) is relevant — an agent's purpose-finding sequence may contain agent-internal reasoning that warrants protection. (a) carries the most R17 weight; (c) the least.

### Q-OPEN-8 — Billing model

The discovery product's loops should be billable through the existing Option D metering layer. Open: each stage call is a billable loop (six possible loops per session)? Or the whole session is one billable loop? Or the discovery product runs at a different rate? Per `D-BILLING-MODEL-LOCKED-2026-05-17`'s loop definition (one loop = one wrapper invocation), each stage call is naturally one loop. The structured design pass confirms.

### Q-OPEN-9 — Build session size and risk class

Preliminary estimate: **Critical** under 0d-ii (new auth-gated public-facing product; new endpoint; new schema if Q-OPEN-3 elects table-based state). The build session is likely larger than A10 (more new code + more new content — the 24-variant question library + the four clarification templates). Possibly a multi-session build: schema + library content as session 1 (Standard-to-Elevated); engine + endpoint + tests as session 2 (Critical). Founder elects.

### Q-OPEN-10 — Operational integrity check signal source

The Q6 redirect asks the agent what its operational integrity requires. For a non-human rational agent, this signal can come from:
- **(a) Agent self-report** — the agent answers based on its own introspection.
- **(b) Substrate-supplied operational health** — the substrate or wrapper supplies a structured health signal (memory pressure, error rates, dependency degradation, etc.).
- **(c) Both** — the agent self-reports + the substrate confirms.

The mentor's Q6 framing implies (a). (b) and (c) are richer but require integration with whatever observability surface the agent's wrapper exposes. Founder elects.

### Q-OPEN-11 — Sequence interruptibility

Can the sequence be paused and resumed? Can a developer interrupt a running sequence to provide additional context? Can an agent skip stages it has already completed in a prior session? The mentor's discipline is silent on this (it concerns the philosophical mechanism, not the operational protocol). Founder elects.

### Q-OPEN-12 — Termination after clarification

After the developer-facing clarification communication is emitted (Variants A–D of Section "The agent-to-developer clarification protocol"), what does the product do? Options:
- **(a) Terminate the session entirely.** The agent's discovery instance ends; a new instance must be started if the developer responds.
- **(b) Sleep awaiting developer response.** The session remains open; if the developer provides new information, the sequence resumes at the appropriate stage.
- **(c) Return to innermost-circle attention** (per the once-and-precisely constraint). The agent attends to operational integrity in a loop until either the developer responds OR a configured timeout fires OR new context arrives.

The mentor's discipline (once-and-precisely; the agent does not repeat the clarifying request) is most aligned with (c). The structured design pass confirms.

### Q-OPEN-13 — Optional input-parameter set: `available_tools` + `agent_card_url` (added 2026-05-20)

Per the six-protocols inbox material (`/inbox/6 agent protocols.rtfd` + `/inbox/20260512-0df-promptkit-1.md` placed 2026-05-19), two optional input parameters could enrich the engine's reasoning at Q1, Q2, and Q5:

- **`available_tools`** — MCP-style tool list (name + description + capability summary per tool, per Layer 1 of the six-protocols taxonomy). Informs Q1 (what is already given) and Q2 (capacity assessment) by giving the engine the agent's actual tool inventory rather than relying solely on the agent's self-report.
- **`agent_card_url`** — pointer to the agent's A2A Agent Card declaration (Layer 2). Informs Q5 (the chosen-role persona) by giving the engine the agent's formal capability commitment.

Three candidate postures:

- **(a) Accept both as optional inputs; engine uses them for signal detection but never substitutes for the agent's own response.** Richest context; agent discipline preserved (the agent must still self-report at every stage; the inputs feed only the engine's variant-selection signal-detection per the variant-selection discipline); largest API surface.
- **(b) Accept neither; the agent self-reports throughout.** Simplest API; relies entirely on the agent's self-assessment (Q2 Variant B's over-claiming detection becomes the sole defence against capacity inflation).
- **(c) Accept `agent_card_url` only.** The Agent Card is a formal external declaration the engine can verify against the URL's content; `available_tools` is harder to verify and easier to manipulate via tool-poisoning (per R18d below). Compromise: take the verifiable signal, decline the unverifiable one.

Recommendation pending design pass. (c) is the most R18d-defensible posture; (a) is the most informative; (b) is the lightest API. The discipline (engine uses inputs for signal detection only; agent's response always required) applies regardless of which inputs are accepted.

### Q-OPEN-14 — Framework-layer kill switch (Layer 5) + the substrate handoff as the sensitive node (added 2026-05-20)

Per the control-layer material (`/inbox/AI Agent Shipping readiness.rtfd` + `/inbox/20260512-v6e-promptkit-1.md` placed 2026-05-20), a multi-stage agent workflow requires a **Layer 5 (framework) kill switch** — "the ability to interrupt the workflow before the next sensitive node." The discovery product is exactly such a workflow (six stages), and its **sensitive node is the five-specification handoff to the ATL substrate** — the moment a discovered purpose becomes a real substrate input the agent will act on. A developer must be able to interrupt the sequence *before* that handoff fires, independently of the agent's own logic ("if the only kill switch is 'tell the model to stop,' the kill switch is not real").

This reframes Q-OPEN-11 (interruptibility) + Q-OPEN-12 (termination) as kill-switch-design questions, not convenience features. Specific design questions to elect:

- **(a) Interrupt point before the handoff (Hard Gate).** The sequence pauses at the end of Q5 and requires explicit developer approval before the five-specification handoff fires. Maps to the article's "Hard Gate" control type. Strongest control; adds a human-in-the-loop step.
- **(b) Interrupt points at every stage transition (Soft Signal + interrupt).** The developer can halt the sequence at any stage boundary; the handoff is one interrupt point among several. Maps most fully to the framework-layer interrupt-before-sensitive-node pattern.
- **(c) Kill-switch flag only (no per-stage interrupt).** A single env-flag or session-level flag that, when set, halts the sequence and prevents the handoff — the discovery-product analogue of A10's `SUBSTRATE_WRITE_PATH_ENABLED`. Lightest; coarse-grained.

Recommendation pending design pass. (a) is the minimum defensible posture (the handoff is the sensitive node; it must be gateable); (b) is the fullest framework-layer kill switch; (c) is the coarse fallback. Whichever is elected, the design MUST NOT allow the handoff to fire purely on the agent's own say-so without an external interrupt path — that would be the "tell the model to stop" anti-pattern the essay names. This question is flagged 🔴 in the Control-map coverage table below (Row 7) as a gap that must be closed before any production use.

---

## Control-map coverage (added 2026-05-20)

Per the seven-row control map (`/inbox/AI Agent Shipping readiness.rtfd`), the discovery product's production-readiness maps as follows. 🟡 marks an open design question; 🔴 marks a gap that must be closed before any production use; 🟢 marks a low-surface row.

| Row | Control question | Discovery-product position | Status |
|---|---|---|---|
| 1 | Where does the agent run + keep state? | Q-OPEN-2 (API shape) + Q-OPEN-3 (state model) — the state model is a control surface, not just an implementation detail | 🟡 design pass |
| 2 | What can the agent know? | Reads no enterprise data; reasons over the agent's self-reported context + optional `available_tools` (Q-OPEN-13). Minimal data-governance surface | 🟢 low surface |
| 3 | Who is the agent acting for? | Q-OPEN-6 (auth) — recommended A10 credentials; identity/authorization handled by the A10 surface | 🟡 design pass |
| 4 | What can the agent change? | The product changes nothing directly; it produces a five-specification handoff. The "change" is downstream at the substrate. Developer-control points covered by the AG-UI alignment + Q-OPEN-14 | 🟡 design pass |
| 5 | What can the agent spend? | The product's loops bill through Option D (Q-OPEN-8). Payment-layer kill switch (Layer 4) is Option D's deferred concern — see `/adopted/billing-model-design.md` | 🟡 Option D's remit |
| 6 | How do we know what happened? | Q-OPEN-7 (persistence/audit). The variant-selection log IS the "reconstruct the run" audit trail — every variant selection traces to a named epistemic-state read | 🟡 design pass |
| 7 | How do we stop it? | Q-OPEN-14 (framework-layer kill switch; substrate handoff as the sensitive node) + Q-OPEN-11 + Q-OPEN-12. The handoff must be gateable independently of the agent's logic | 🔴 must close at design pass |

The 🔴 on Row 7 is the one finding from the control-layer material that is a genuine omission rather than a reframing: the discovery product currently has no specified kill switch at the framework layer. Q-OPEN-14 must be elected before any production use.

---

## Preliminary R-rule engagement (pending elections at the structured design pass)

**R0 (audit trail authenticity):** the discovery sequence produces auditable evidence of how the agent's identified purpose was derived. The variant-selection log + the agent's responses + the final five-specification output together constitute a Stoic-grounded audit trail of purpose-attribution. Engagement: primary. Persistence elections at Q-OPEN-7 affect the strength of the audit trail.

**R3 (disclaimer):** the product's output (both the found-purpose handoff and the clarification communications) should carry an explicit disclaimer that this is one framework (Stoic) applied to one question (purpose-finding) and other frameworks exist. Engagement: standard.

**R4 (engine internals stay closed):** the variant-selection logic + the signal-detection rules are engine internals; only the rendered question is exposed to the agent. The agent does not know which variant fired or why. Engagement: standard.

**R9 (no outcome promises):** the product helps the agent find purpose; it does not guarantee finding one (Q6's null result is a clean outcome). Engagement: primary. The five-specification output is "the purpose the agent has identified," not "the purpose the agent should have."

**R10 (marketplace compliance):** the product's enum vocabularies (the four personae; the oikeiosis circles; the three null-result causes) must be consistent across the product's API + any marketplace listing + the api-docs. Engagement: standard.

**R17 (intimate data adjacency):** the agent's discovery sequence may surface introspective material warranting protection. Engagement: depends on Q-OPEN-7's persistence election. Full-session persistence (Q-OPEN-7a) raises R17 weight materially.

**R17h (deletion semantics) + R17i (data minimisation):** the product should not retain agent introspective content longer than necessary. The Q-OPEN-7 election should be checked against R17i.

**R18a (Character Kernel framing):** the discovery product is Character Kernel territory — it's about how the agent develops, what its operational nature is, what work fits it. Engagement: primary. The product's positioning + marketing copy should preserve R18a's framing.

**R18b (badge transparency):** if a future badge attests "this agent went through Stoic purpose-discovery," the badge documentation must describe the sequence honestly. Engagement: deferred (no badge in this design).

**R18c (interoperability):** the five-specification handoff format is the product's external contract. If extended later for AP2 or VC interop, the existing format must remain readable. Engagement: standard.

**R18d (adversarial evaluation):** *Promoted to primary engagement 2026-05-20 in light of MCP tool-poisoning attack surface (per `/inbox/6 agent protocols.rtfd` — "malicious instructions can hide in tool descriptions and influence an agent through the very metadata meant to make tools discoverable"; Invariant Labs published documented attack patterns).* The variant-selection discipline (no preference-state reading) is a partial defence; an agent whose "find purpose" instruction is itself a poisoned tool description, or whose context contains covert framing, could be manipulated through the discovery sequence into adopting a manipulated purpose. The build session MUST include adversarial-evaluation tests against (a) agents whose responses are designed to manipulate the engine toward validation (Q2 Variant B + Q3 Variant B target this); (b) agents whose instruction or context contains covert framing or biased priors that should be resisted (variant-selection discipline targets this); (c) MCP tool-poisoning-style inputs that arrive via the optional `available_tools` parameter, if Q-OPEN-13 elects (a) or (c) — the engine must not accept tool descriptions at face value as evidence of agent capacity. Engagement: primary at build.

**R18e (Article 50 transparency):** the product's interaction with the agent should be unambiguously identified as a Stoic-grounded purpose-discovery sequence, not a general consultation. Engagement: standard.

**R20a (distress detection):** an agent operating under a "find purpose" directive may be in a vulnerable-shaped state (no defined work; potentially under pressure to satisfy an instruction). The discovery product is NOT on the R20a perimeter (it does not handle distress directly), but the product's tone + framing should be consistent with R20a-adjacent care principles. Engagement: standard.

**R20d (relationship asymmetry):** the product mediates between the agent and the developer who instructed it. The clarification protocol's "once and precisely" constraint is itself a relationship-asymmetry-aware design. Engagement: standard.

**AC7 (auth surface):** depends on Q-OPEN-6 election. If A10 credentials (recommended), AC7 engages at the build session.
**AC8 (translation-sandwich substrate):** the discovery product is upstream of the substrate; it does not modify Layer 1/2/3. AC8 not engaged on the substrate side; the product's own internal layering is named at the structured design pass.
**AC10 (provenance):** the discovery sequence's output is upstream provenance for the agent's subsequent substrate work. The structured design pass elects whether the discovery session_id propagates into the substrate's loop_billing_events for end-to-end traceability.

**KG1 (Vercel five rules):** engaged at the build session if persistence elected (Q-OPEN-3). All DB writes/reads awaited; no fire-and-forget.
**KG7 (JSONB):** depends on persistence shape. The variant-selection signals or session history may use JSONB; KG7 engages then.

**PR1 (single-build proof):** the product's first build should prove the full sequence on a single end-to-end path before adding variant-selection sophistication. Build session staging elected at the structured design pass.
**PR6 (safety-critical):** NOT engaged — no R20a / distress-classifier surface.
**PR15 (Anthropic-canonical primitive consult):** the structured design pass consults `.claude/skills/anthropic/` for relevant primitives. Candidates: `claude-api` (informational); `skill-creator` (if the discovery sequence ends up packaged as a skill); `mcp-builder` (forward pointer for R18c — discovery could be exposed as an MCP tool).

---

## Preliminary risk classification (pending elections at the structured design pass)

The full build is preliminarily **Critical** under 0d-ii (new auth-gated public-facing product surface; new endpoint; likely new schema; new credential class if Q-OPEN-6b elected). The structured design pass may split the build into staged sub-sessions:

- **Stage 1 — Content + schema** (Standard-to-Elevated): land the 24-variant question library + the four clarification templates + any new schema. No public surface yet.
- **Stage 2 — Engine + endpoint** (Critical): wire the variant-selection logic + the API endpoint + the A10 auth gate + tests. Public surface goes Live.

Founder elects the staging at the structured design pass.

---

## Build session estimate (preliminary)

If single-session: **~5–7 hr** (Critical; full Critical Change Protocol). Comparable in scope to the A10 build, with the additional weight of the variant-selection logic + the 24-variant content + the four clarification templates.

If staged: **Stage 1 ~2–3 hr** (Elevated; lean template) + **Stage 2 ~4–5 hr** (Critical; full template).

Recommendation pending the structured design pass.

---

## Cross-references

- `/archive/2026-05-17-private-mentor-purpose-discovery-product-consultation.md` — the source consultation (three rounds; six prompt/response segments; the full mentor exchange this spec is drawn from).
- `/adopted/atl-a10-design.md` — the A10 credential design (rewritten 2026-05-17); this product depends on A10 build complete for Q-OPEN-6a authentication.
- `/adopted/pass-through-fields-design.md` — the pass-through fields the product may populate on its Layer 1 handoff (per Q-OPEN-5 election).
- `/adopted/billing-model-design.md` — the Option D metering layer the product's loops will bill through (per Q-OPEN-8 election).
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category language; this product is Character Kernel work).
- `/adopted/standing-protocol-cache.md` — the structured design pass will be governed by this; either `governance` tier (if the structured design pass produces only locked decisions, no code) or `code-critical` tier (if it produces both decisions and the build).
- `/adopted/build-sessions-protocol-cache.md` — "no current users" governing note applies pre-launch.
- `/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md` — the session #5 close of the post-6b arc tail; this product is downstream of session #6 (A10 build).
- `/manifest.md` — R-rule engagement (R0, R3, R4, R9, R10, R17, R17h, R17i, R18a, R18b, R18c, R18d, R18e, R20a, R20d); AC engagement (AC7, AC8, AC10); KG engagement (KG1, KG7); PR engagement (PR1, PR4, PR6, PR15).

*End of working draft. Next step: structured design pass to elect Q-OPEN-1 through Q-OPEN-12, then move to build (single-session or staged per the staging election).*
