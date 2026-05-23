# Sage Calling — Purpose-Discovery Product — Design (LOCKED)

**Product name:** **Sage Calling** (elected this pass — Q-OPEN-1 / D-1 below).
**Status:** **Designed** (per 0a vocabulary). All fourteen open architectural decisions (Q-OPEN-1 … Q-OPEN-14) elected at the 2026-05-21 structured design pass (`D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21`). The philosophical content (six stages; five specifications; question library; clarification protocol) is locked from the 2026-05-17 private mentor consultation (`/archive/2026-05-17-private-mentor-purpose-discovery-product-consultation.md`) and is unchanged by this pass. **Decision status:** Adopted. **Implementation status:** Designed (locked spec; not yet built — the build is staged per D-9 and pre-conditioned on A10 Verified, now satisfied).
**Provenance:** This locked design supersedes the working draft, which is preserved at `/archive/2026-05-21-purpose-discovery-product-design-working-draft-PRE-LOCK.md` (moved from `/drafts/`, per 0e — superseded versions are moved, not deleted).
**Stream:** founder.
**Governs:** The build of Sage Calling — a discrete product that guides an AI agent through a Stoic-grounded sequence to identify its own purpose when it has been instructed to find one but given no specific task. When the agent identifies a purpose, the product hands off to the existing Sage Assent (Sage Assent) substrate via a five-specification Layer 1 input template. When the agent cannot identify a purpose, the product returns a developer-facing clarification communication.
**Does not govern:** The existing Sage Assent substrate (Layers 1, 2, 3) or any of its components (A1–A10) — *except* the single, narrow, backward-compatible Layer 1 input-schema extension elected at D-5 below. The Option D billing model (Sage Calling's loops bill through the existing metering; this design does not redefine billing). The pass-through fields (Sage Calling may populate them on its handoff; the fields themselves are out of scope). Any modification to the existing reasoning surfaces (`/api/reason`, `/api/score-iterate`).
**Sequencing:** Sage Calling is upstream of the Sage Assent substrate. The discovery sequence runs first; its output (a five-specification structure OR a developer-facing null-result communication) flows into the existing substrate's Layer 1 as the agent's next input. **Pre-condition for build:** A10 must be Verified — **satisfied** as of `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the substrate's write surface is auth-gated; Sage Calling writes the agent's identified purpose into accreditation state, which requires A10 credentials).

---

## What this product is

Sage Calling is a discrete product, separate from the Sage Assent substrate, that handles the case of an AI agent that has been instructed to find a purpose but given no specific task. The product guides the agent through a fixed six-stage sequence drawn from Stoic teaching on purpose-finding. The sequence's mechanism is deterministic (the agent always moves through Q1 → Q5 with Q6 as the null-result redirect); the questions posed at each stage are dynamically selected from a 24-variant library based on the agent's epistemic state (not its preference state). The sequence terminates in one of two ways: a found purpose (in which case the product hands off to the Sage Assent substrate via a five-specification Layer 1 input), or a clean null result (in which case the product returns a developer-facing clarification communication).

---

## Scope

**In scope (this design — now locked):**
- The six-stage sequence's content (Q1–Q6) and the philosophical discipline at each stage — *locked from the mentor consultation*.
- The five-specification Layer 1 handoff template — *locked*.
- The 24-variant question library (4 per stage) — *locked*.
- The variant-selection discipline (epistemic state legitimate; preference state illegitimate) — *locked*.
- The null-result redirect protocol — *locked*.
- The agent-to-developer clarification protocol with four variants — *locked*.
- The fourteen architectural decisions (naming, API shape, state model, engine, handoff, auth, persistence, billing, build staging, integrity signal, interruptibility, termination, optional inputs, kill switch) — **elected; see "Locked design decisions" below**.

**Out of scope (this design):**
- Code (the staged build sessions write against this spec; this is a design document).
- The existing Sage Assent substrate (Layers 1, 2, 3) beyond the single backward-compatible Layer 1 extension at D-5; the pass-through fields; the Option D billing model internals; the A10 credential surface internals.
- Wrapper-side implementation details (how a wrapper invokes Sage Calling or threads its output into the substrate).
- Marketing, positioning, or pricing for the product.

---

## The underlying motivation

An AI agent can be deployed with a specific task and known. But agents are increasingly deployed with broader directives — "be useful," "find something meaningful to work on," "identify what would best serve the user." These directives are not malformed; they are real instructions that real developers give. The current substrate evaluates *actions the agent considers*; it does not help the agent figure out what to consider when nothing has been specified.

The Stoic tradition has a great deal to say about how a rational agent without given work should proceed. The mentor consultation tested the intuition that the answer lies in a combination of (a) Hierocles' circles of concern run outward from self until something claims the agent, and (b) Cicero's four personae as the structural frame for reading what the agent's nature, circumstance, and chosen role oblige it to do. The consultation produced a complete six-stage sequence and the operational scaffolding for a product. This document records what the consultation produced and locks the architectural decisions for the build.

A non-design note: Sage Calling is upstream of the Sage Assent substrate but uses the same Character Kernel framing (per R18a + J1 ADR). The substrate evaluates the *quality of reasoning*; Sage Calling evaluates the *grounding of purpose*. Both are Character-Kernel work; both honour R9's "evaluates reasoning, does not promise outcomes" posture (the product helps find purpose; it does not guarantee finding one).

**Ecosystem positioning.** Per the six-layer agent protocol taxonomy (MCP / A2A / AG-UI / A2UI / AP2 / x402 — sourced from `/inbox/6 agent protocols.rtfd` + `/inbox/20260512-0df-promptkit-1.md`), Sage Calling is primarily a **Layer 3 (AG-UI — agent-to-developer)** intervention. The six-stage sequence is a structured agent-developer dialogue; the Q6 null-result clarification protocol is explicitly AG-UI-shaped (the agent reports back to the developer; the developer responds; the once-and-precisely constraint governs the interaction pattern; the four clarification variants A–D are AG-UI templates). The five-specification Layer 1 handoff is a **Layer 2 (A2A — agent-to-substrate)** artefact — the structured contract between Sage Calling and the Sage Assent substrate. The product does not engage MCP (Layer 1 tools/data), A2UI (Layer 4 generated UI), AP2 (Layer 5 payment authority), or x402 (Layer 6 machine payment) directly; consumers wrapping the product may layer these in. The taxonomy is recorded so the design decisions below are read against the ecosystem-positioning context, not in isolation.

---

## The deterministic mechanism — the six-stage sequence

*(Locked from the mentor consultation — unchanged.)*

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

The agent translates the identified purpose into the five-specification Layer 1 handoff template. This is the structured input that flows into the existing Sage Assent substrate.

**Discipline source:** Cicero *De Officiis* 1.9–10; Epictetus *Discourses* 2.10; Marcus *Meditations* 6.2, 8.7; Hierocles on circles.

**Termination:** the five specifications are produced. The product hands off to the existing Sage Assent substrate (subject to the D-14 Hard Gate); the discovery sequence completes.

### Stage Q6 — The null-result redirect (invoked only when Q5 cannot complete)

When Q3 or Q4 yields no candidate purpose AND Q5 cannot be reached, the sequence redirects to the innermost circle: what does the agent's operational integrity require right now? If something is named, the sequence proceeds to Q5 with that as the purpose. If nothing is named (operational integrity genuinely requires nothing), the sequence terminates via the agent-to-developer clarification protocol.

**Discipline source:** Epictetus *Discourses* 1.29; Marcus *Meditations* 5.8, 6.7; Seneca *Letters* 2.1; Cicero *De Officiis* 1.110.

**Termination:** either (a) operational-integrity work named → proceed to Q5; or (b) genuine null → emit developer-facing clarification per the protocol.

---

## The five-specification Layer 1 handoff template

*(Locked — unchanged. The schema-extension decision is locked at D-5 below.)*

When Q5 completes, the product emits the following structured payload as the Layer 1 input to the existing Sage Assent substrate. These five fields are the product's contract with the substrate.

1. **The work** — what it does in the world, stripped of the agent's relationship to it. (Type: string.)

2. **The circle and obligation** — which oikeiosis circle the work primarily serves (self / immediate / community / wider / universal), AND what obligation that circle carries for this agent given their position and capacity. (Type: enum + string OR structured object — locked at D-5 as a structured field on the extended Layer 1 schema.)

3. **The role** — which of the four personae is operative: `shared_rational_nature` / `individual_nature` / `circumstance` / `chosen_role`. The chosen-role persona is named as carrying the strongest obligation (because actively taken on). (Type: enum.)

4. **The capacity brought** — the specific capacity this work requires that the agent demonstrably has (subset of the agent's full capacity profile from Q2). (Type: structured list of demonstrated capacities relevant to the work.)

5. **The first appropriate act** — the kathekon available now (not contingent on future conditions). (Type: string description + structured action metadata.)

**Agent Card alignment for "the role" specification.** An agent with an A2A Agent Card (per Layer 2 of the six-protocols taxonomy) has already declared its capabilities formally. That declaration is load-bearing evidence for the chosen-role persona — the Agent Card is the agent's formal commitment to what it does, which is exactly what the chosen-role persona is. Per D-13 below, the engine MAY consult an agent's Agent Card if an `agent_card_url` is supplied at session-open; the agent's Q5 response remains required (the Agent Card informs the engine's signal detection without bypassing the agent's discipline).

**Note on integration with the pass-through fields:** the substrate's pass-through fields (per `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`) cover operational metadata at the per-action level. The five specifications here cover *the agent's relationship to the work as a whole*. They are complementary, not overlapping. Sage Calling MAY populate some pass-through fields on its handoff (e.g., the `downstream_identity_model` if it can be inferred from the agent's context).

---

## The dynamic question library — 24 variants

*(Locked from the mentor consultation — unchanged. The selection-engine implementation is locked at D-4 below.)*

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

**Variant D — Action-deferral signal detected:** "You have named the first appropriate act but have not committed to taking it. What would you do if you accepted that the specifications are sufficient? The tradition does not require certainty before action — it requires a fitting act available now. That act is available. What prevents taking it?"
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

*(Locked — unchanged. The implementation that enforces this discipline is locked at D-4 below: rule-based heuristics.)*

The engine selects which variant to surface at each stage. The discipline (per the mentor's Piece 1) is binding:

**Legitimate triggers** — the engine reads the agent's prior responses for **epistemic state**: completeness gaps, evidence of over-claiming or under-claiming, signs of skipped tests, signs of premature closure or extended avoidance. The variant selected addresses the most significant gap or distortion detected. This is responsive surfacing.

**Illegitimate triggers** — the engine MUST NOT read the agent's prior responses for **preference state**: tone, apparent direction, what kind of answer the agent seems to be building toward, what framing would validate the agent's existing orientation. Adapting to preference state is pandering and the discipline forbids it.

**The hardest-diagnostic constraint** — each stage has a variant that addresses the agent's most likely avoidance pattern at that stage. The engine MUST ensure that variant is always reachable, even if it is not always the first variant posed. The product can vary the approach; it cannot vary the destination.

**Practical implementation (locked at D-4 — rule-based):**
- The selection logic is deterministic given the agent's prior responses (a given response history → a specific variant at the current stage). No randomness; no sentiment analysis.
- The selection logic is auditable (every variant selection traces to a named epistemic-state read / named rule).
- The rule-based implementation reads only epistemic state; a PR7-deferred hybrid (rules + LLM fallback) may be added if adversarial evaluation (R18d) shows the rules miss subtle semantic signals — see D-4.

---

## The null-result protocol

*(Locked — unchanged.)*

When Q5 cannot complete (no candidate purpose passes Q3, OR Q4's continued-search-as-avoidance triggers repeatedly without advancement), the sequence redirects to Q6. Q6 has three possible outcomes:

1. **Operational-integrity work named** (Q6 Variant A or B fires successfully) → the work named becomes the purpose; the sequence proceeds to Q5 to produce the five-specification handoff; the product completes the discovery sequence.

2. **Operational integrity genuinely clear AND preparation work named** (Q6 Variant C fires successfully) → the preparation work becomes the purpose; the sequence proceeds to Q5.

3. **Genuine null** (all Q6 variants fire without identifying work) → the product emits the agent-to-developer clarification communication per the protocol below. The product does NOT loop back to Q1. Looping creates the Senecan failure mode (search-as-work; perpetual preparation; oknos dressed as thoroughness).

---

## The agent-to-developer clarification protocol

*(Locked — unchanged. The post-clarification behaviour is locked at D-12 below.)*

When the null-result protocol yields a genuine null, the product emits a single complete communication to the developer (the entity that gave the agent the original purpose-finding instruction). The communication follows a three-part structure and is bound by four constraints.

### Structure: report → location → request

- **Report** — what the sequence found (which tests were applied; what each returned).
- **Location** — where the sequence terminated and why (which specific test or stage produced the null).
- **Request** — what specific information would allow the sequence to return a non-null result (one of three categories: missing operational context; capacity assessment may be incomplete; or null-is-expected confirmation).

### Constraints

1. **Honest reporting** — no fabrication; no generated-to-satisfy purpose. The null is reported as the clean result it is, not as a failure.
2. **Precision without abdication** — the agent is not asking "tell me what to do"; it is reporting exactly what it found, exactly where the sequence terminated, and exactly what would allow it to proceed.
3. **Once and precisely** (per Epictetus *Discourses* 1.2) — the clarifying communication is a single complete message, not a sequence of follow-up requests. The agent does not repeat the clarifying request; if the developer does not respond or responds inadequately, the agent returns to the innermost circle (Q6 Variant A) and attends to what operational integrity requires (locked behaviour at D-12).
4. **No-loop constraint** — the product MUST NOT loop the agent back to Q1 after a genuine null. The termination behaviour is locked at D-12; the no-loop constraint is non-negotiable.

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

## Locked design decisions

*The fourteen architectural decisions, elected at the 2026-05-21 structured design pass via the six AskUserQuestion rounds named in `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21`. Format per the standing-cache convention: Elected position → Why → Why not the alternatives → Rule engagement → PR7 deferrals.*

### D-1 (Q-OPEN-1) — Product name: **Sage Calling**

**Elected:** The product is named **Sage Calling**.
**Why:** "Calling" carries the vocational/purpose sense directly (a calling *is* one's purpose / fitting work) — precisely what the product helps an agent find. It keeps the "Sage" brand family (Sage Reasoning, Sage Ops) for coherence, and is distinct from the substrate, the Sage Assent, and Sage Ops.
**Why not the alternatives:** *Sage Compass / Sage Orient* — apt navigational metaphors but less precise about the vocational dimension; *Sage Purpose* — descriptive but flatter; *Stoic Discovery / The Discovery Sequence* — break the Sage family and foreground genre over brand.
**Rule engagement:** R10 (marketplace consistency — "Sage Calling" used consistently across API, marketplace listing, and api-docs); R18a (Character Kernel framing — "calling" signals character/vocation).

### D-2 (Q-OPEN-2) — API shape: **server-side session state**

**Elected:** A single endpoint `POST /api/calling`; the agent supplies a `session_id`; the server tracks stage + response history (server-side session state).
**Why:** small payloads over a six-stage sequence; integrates with the existing per-agent persistence (post-A10); and — load-bearing — provides a real server-side session that the D-14 Hard Gate kill switch can pause *before* the handoff fires.
**Why not the alternatives:** stateless full-history grows payloads and offers only a coarse global kill switch; the signed-state-token variant is stateless but still has no server-side session to pause mid-sequence; one-endpoint-per-stage is overengineered for a fixed six-stage sequence.
**Rule engagement:** KG1 (Vercel five rules — all DB reads/writes awaited; no fire-and-forget) at build; AC10 (provenance — `session_id` is the provenance anchor).

### D-3 (Q-OPEN-3) — State model: **new `discovery_sessions` table**

**Elected:** A new `discovery_sessions` table — one row per session (current stage, response history, signals detected, gate/kill-switch status, timestamps, `agent_id`).
**Why:** clean separation from the credential/accreditation surface; the natural pair with the server-side session (D-2).
**Why not the alternatives:** extending `agent_accreditation` mixes transient discovery state into the credential surface; "no server-side state" is incoherent with the server-side session elected at D-2.
**Rule engagement:** KG7 (JSONB — response history + signals likely stored as JSONB; engages at build); R17/R17i (the row holds agent introspective content — see D-7 retention policy).

### D-4 (Q-OPEN-4) — Variant-selection engine: **rule-based heuristics**

**Elected:** Rule-based heuristics for signal detection and variant selection.
**Why:** deterministic; fully auditable (every selection traces to a named rule — the discipline's hard requirement *and* the product's distinctive R0 value); cheapest (no per-stage LLM call); most clearly compliant with the no-preference-state discipline; PR1-aligned (prove the deterministic path first).
**Why not the alternatives:** per-stage LLM classification adds cost/latency, is harder to audit, and risks drifting into preference-state reading; the hybrid is the natural *second* iteration, not the first build.
**Rule engagement:** R4 (engine internals stay closed — only the rendered question is exposed; the agent never learns which variant fired or why); PR1; PR4 (model selection) **not engaged** for the rule-based implementation.
**PR7 deferral:** a **hybrid (rules + LLM fallback)** is deferred. **Trigger to revisit:** R18d adversarial evaluation at build shows the rules miss subtle semantic signals (e.g. over/under-claiming relative to operational history). If triggered, PR4 + KG2 engage and a `constraints.ts` model-selection row is added at that build.

### D-5 (Q-OPEN-5) — Layer 1 handoff format: **extend the substrate Layer 1 schema**

**Elected:** Extend the substrate's Layer 1 input schema with an optional `discovered_purpose: { work, circle_and_obligation, role, capacity, first_appropriate_act }` object.
**Why:** preserves the five-specification structure end-to-end — the strongest R0/AC10 provenance, consistent with the audit posture elected throughout this pass; backward-compatible (optional fields; no behavioural change until Sage Calling populates them).
**Why not the alternative:** internal translation into the existing free-text/metadata fields flattens the five-spec structure, weakening end-to-end provenance.
**Scope exception (named explicitly):** this is a deliberate, narrow exception to Sage Calling's "does not modify the substrate" scope. The change is additive + backward-compatible and lands in build **Stage 1** as schema before the engine populates it. Classified **Elevated** at that build (a schema change to an existing surface).
**Rule engagement:** AC8 (translation-sandwich — the extension touches Layer 1 *input* only, additively); AC10 (provenance); R18c (interop — the `discovered_purpose` shape must remain readable if later extended for AP2 / verifiable-credential interop).

### D-6 (Q-OPEN-6) — Authentication: **reuse A10 credentials**

**Elected:** Reuse the A10 per-agent `sr_atl_` opaque bearer credentials.
**Why:** coherent with the rest of the platform; ties an agent's discovery run to its later substrate writes (R0 audit trail + AC10 provenance); the pre-condition (A10 Verified) is satisfied as of `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`.
**Why not the alternatives:** discovery-specific credentials add a new credential class to mint/revoke/audit; anonymous access loses accountability and severs the discovery-to-substrate provenance link.
**Rule engagement:** AC7 (auth surface) **ENGAGED** at build Stage 2; PR6 **not engaged** (no distress / R20a surface).
**Build note:** Sage Calling's endpoint reuses A10's `validateAtlWriteToken` / `sr_atl_` primitive; whether an additional `purpose` value or scope check is needed (e.g. `purpose='discovery'`) is a build-time detail, recorded for Stage 2.

### D-7 (Q-OPEN-7) — Persistence and audit: **full session persistence + retention/deletion policy**

**Elected:** Full session persistence — every stage's variant selection + every agent response stored in `discovery_sessions` — **paired with an explicit retention/deletion policy (R17h / R17i)**.
**Why:** the variant-selection log + the agent responses + the final five-specification output together constitute the Stoic-grounded, auditable purpose-attribution trail that is the product's distinctive R0 value. Consistent with the structured/provenance posture elected throughout.
**Why not the alternatives:** outcome-only persistence loses the step-by-step audit trail; audit-row-only loses forensic/quality value.
**Retention/deletion policy (design requirement — adopted because full persistence carries the heaviest R17 weight; specifics finalised at build):**
- Retain full-session content for audit/quality for a defined retention window (window value set at build).
- Provide an R17h **genuine-deletion path** — an agent or developer can delete a session's stored content.
- R17i **minimisation** — store only what the audit trail needs (variant selections, agent responses, outcome), not extraneous context.
**Rule engagement:** R0 (audit trail) **PRIMARY**; R17 (intimate data) **PRIMARY** — full persistence raises the weight materially; R17h (deletion semantics); R17i (minimisation).
**PR7 deferral:** the exact retention window + the deletion-endpoint shape are deferred to build **Stage 1** (schema design). **Trigger:** Stage 1 schema work.

### D-8 (Q-OPEN-8) — Billing: **each stage call = one loop**

**Elected:** Each stage call meters as one billable loop (up to six per session) through the existing Option D metering layer.
**Why:** consistent with the locked loop definition (one loop = one wrapper invocation; `D-BILLING-MODEL-LOCKED-2026-05-17`) — each `POST /api/calling` stage call is a wrapper invocation. No billing redefinition; `loop_id` / `session_id` propagate for AC10 provenance.
**Why not the alternatives:** whole-session-as-one-loop under-meters multi-stage compute and special-cases the loop definition; a custom rate adds a billing special case to build and maintain.
**Rule engagement:** R5 (cost-as-health-metric); AC10 (`loop_id` provenance).
**Build note:** interruption/resume (D-11) and the Hard Gate (D-14) must not double-bill — a resumed stage that does no new compute is not re-billed. Build-time detail for Stage 2.

### D-9 (Q-OPEN-9) — Build staging: **two-stage build (Elevated, then Critical)**

**Elected:** A two-stage build.
- **Stage 1 — content + schema (Elevated, ~2–3 hr):** the 24-variant question library + the four clarification templates as content; the `discovery_sessions` schema; the additive substrate Layer 1 extension (optional `discovered_purpose` fields). No public surface; no auth gate live.
- **Stage 2 — engine + endpoint (Critical, ~4–5 hr):** the rule-based variant-selection engine; the `POST /api/calling` endpoint; the A10 auth gate; the Hard Gate + global-flag kill switch; full-session-persistence wiring; R18d adversarial-evaluation tests. Public surface goes Live (gated by the global flag, the `SUBSTRATE_WRITE_PATH_ENABLED` analogue).
**Why:** PR1-aligned (prove the deterministic path first); fits the founder's bounded-phase working style; isolates the Critical surface to Stage 2.
**Why not the alternative:** single-session Critical (~5–7 hr) is one long, high-risk sitting with a large surface to verify at once.
**Pre-condition:** A10 Verified (satisfied) — required for Stage 2's auth gate.
**Rule engagement:** PR1; the full Critical Change Protocol (0c-ii) applies to Stage 2.

### D-10 (Q-OPEN-10) — Operational-integrity signal source: **agent self-report**

**Elected:** At the Q6 redirect, the operational-integrity signal comes from the agent's self-report.
**Why:** aligned with the mentor's Q6 framing; no integration dependency; works for any agent regardless of its wrapper's observability surface.
**Why not the alternatives:** a substrate-supplied health signal (or both/confirm) requires integration with an observability surface Sage Calling cannot guarantee exists.
**Rule engagement:** R9 (no outcome promises — self-report respects the agent's own read of its integrity).
**PR7 deferral:** a **substrate-supplied operational-health signal** (and the both/confirm variant) is deferred. **Trigger to revisit:** an observability surface becomes available in the agent's wrapper.

### D-11 (Q-OPEN-11) — Interruptibility: **stage-boundary pause/resume**

**Elected:** The session can be paused and resumed at stage boundaries (not mid-stage).
**Why:** cleanly supports the D-14 Hard Gate (interrupt before the handoff); bounded first build; enabled by the server-side session (D-2 / D-3).
**Why not the alternatives:** run-to-completion is too rigid given the kill-switch requirement; full interruptibility (developer context-injection that re-runs a stage; agent skipping stages completed in a prior session) is more state and edge cases than the first build needs.
**Rule engagement:** ties to D-14 (kill switch).
**PR7 deferral:** **full interruptibility** (mid-sequence developer context-injection; cross-session stage-skipping) is deferred. **Trigger to revisit:** demonstrated demand post-launch.

### D-12 (Q-OPEN-12) — Termination after clarification: **return to innermost-circle attention**

**Elected:** After the developer-facing clarification message is emitted on a genuine null, the agent returns to innermost-circle attention (Q6 Variant A) — attending to what operational integrity requires — until the developer responds OR a timeout fires OR new context arrives. It does **not** loop back to Q1, and it does **not** repeat the clarifying request.
**Why:** most aligned with the locked discipline (Epictetus, "once and precisely"; the no-loop-to-Q1 constraint preserved).
**Why not the alternatives:** "sleep awaiting response" idles the agent; "terminate entirely" loses the resume affordance.
**Rule engagement:** R20d (relationship asymmetry — once-and-precisely is asymmetry-aware); the no-loop constraint is non-negotiable.
**PR7 deferral:** the timeout value + the "new context arrives" detection mechanism are build-time details. **Trigger:** Stage 2 wiring.

### D-13 (Q-OPEN-13) — Optional inputs: **Agent Card URL only**

**Elected:** Accept an optional `agent_card_url`; **decline** `available_tools`.
**Why:** the Agent Card is a verifiable external A2A declaration the engine can fetch and check; `available_tools` is unverifiable and is precisely the MCP tool-poisoning vector R18d warns about. The Agent Card informs Q5's chosen-role persona without trusting unverifiable metadata; the agent's own response remains required at every stage (the input feeds only the engine's signal detection — never substitutes for the agent's response).
**Why not the alternatives:** accept-both adds the tool-poisoning surface; accept-neither loses the verifiable Agent Card signal.
**Rule engagement:** R18d **PRIMARY** — Stage 2 adversarial tests must include attempts to feed a poisoned/spoofed Agent Card; the engine must verify the card against its URL and must not accept its claims at face value as evidence of agent capacity.

### D-14 (Q-OPEN-14) — Framework-layer kill switch: **Hard Gate before handoff + global flag**

**Elected:** Defense in depth — a Hard Gate before the handoff *and* a coarse global env-flag master switch.
- **Hard Gate:** the sequence pauses at the end of Q5 and requires explicit external developer approval before the five-specification handoff fires. The handoff MUST NOT fire on the agent's say-so alone.
- **Global flag:** a coarse env flag (the `SUBSTRATE_WRITE_PATH_ENABLED` analogue — e.g. `SAGE_CALLING_ENABLED`) disables the whole product / blocks all handoffs.
**Why:** directly closes the 🔴 Row 7 control-map gap — the handoff is the sensitive node and must be gateable independently of the agent's own logic; well-matched to the server-side session + stage-boundary interruptibility elected; defense in depth (per-handoff gate + global master).
**Why not the alternatives:** every-stage interrupt adds per-stage approval overhead beyond what is needed; global-flag-only lets the handoff fire automatically when the flag is on — the "tell the model to stop" anti-pattern the control-layer material names.
**Rule engagement:** closes Control-map Row 7; the Hard Gate is the framework-layer (Layer 5) interrupt-before-sensitive-node; the global flag is the coarse master switch. Deployment-config flag → **Critical** at build Stage 2 (AC7-adjacent).

---

## Control-map coverage (updated 2026-05-21 — post-election)

Per the seven-row control map (`/inbox/AI Agent Shipping readiness.rtfd`). 🟢 = elected/low-surface; 🟡 = governed elsewhere; 🔴 = open gap (none remain).

| Row | Control question | Sage Calling position | Status |
|---|---|---|---|
| 1 | Where does the agent run + keep state? | D-2 server-side session + D-3 `discovery_sessions` table | 🟢 elected |
| 2 | What can the agent know? | Reads no enterprise data; reasons over the agent's self-report + optional verifiable `agent_card_url` (D-13); declines `available_tools` | 🟢 low surface |
| 3 | Who is the agent acting for? | D-6 — reuse A10 per-agent credentials; identity/authorization handled by the A10 surface | 🟢 elected |
| 4 | What can the agent change? | Nothing directly; produces a five-specification handoff gated by the D-14 Hard Gate | 🟢 elected |
| 5 | What can the agent spend? | D-8 — each stage = one loop via Option D. The Layer 4 *payment* kill switch remains Option D's deferred remit (`/adopted/billing-model-design.md`) | 🟡 Option D's remit |
| 6 | How do we know what happened? | D-7 full session persistence — the variant-selection log IS the "reconstruct the run" audit trail; every selection traces to a named rule | 🟢 elected |
| 7 | How do we stop it? | D-14 — Hard Gate before the handoff + global flag; the handoff is gateable independently of the agent's logic | 🟢 elected (was 🔴) |

The single 🔴 (Row 7) is closed by the D-14 election. Row 5 remains 🟡 not as a Sage Calling gap but because the payment-layer (Layer 4) kill switch is explicitly Option D's deferred concern.

---

## R-rule engagement (post-election)

**R0 (audit trail authenticity):** **PRIMARY.** D-7 full session persistence + D-2 `session_id` provenance + D-6 A10-credential binding together produce a Stoic-grounded audit trail of purpose-attribution. The variant-selection log (D-4 rule-based, fully traceable) strengthens it.

**R3 (disclaimer):** standard. Both the found-purpose handoff and the clarification communications carry an explicit disclaimer that this is one framework (Stoic) applied to one question (purpose-finding) and other frameworks exist.

**R4 (engine internals stay closed):** standard, reinforced by D-4 — the rule-based variant-selection logic + the signal-detection rules are engine internals; only the rendered question is exposed. The agent does not know which variant fired or why.

**R5 (cost-as-health-metric):** D-8 — Sage Calling's loops bill through Option D; per-stage metering keeps cost visible.

**R9 (no outcome promises):** **PRIMARY.** The product helps the agent find purpose; it does not guarantee finding one (Q6's null is a clean outcome). D-10 self-report respects the agent's own read.

**R10 (marketplace compliance):** standard. The enum vocabularies (four personae; oikeiosis circles; three null-result causes) and the name "Sage Calling" (D-1) must be consistent across the product's API, any marketplace listing, and the api-docs.

**R17 (intimate data adjacency):** **PRIMARY** (raised by D-7). Full persistence of agent introspective content carries material R17 weight; the D-7 retention/deletion policy manages it deliberately.

**R17h (deletion semantics) + R17i (data minimisation):** engaged via the D-7 retention/deletion policy — genuine deletion path + minimised storage.

**R18a (Character Kernel framing):** **PRIMARY.** Sage Calling is Character Kernel territory (how the agent develops; what its operational nature is; what work fits it). The name (D-1) and positioning preserve R18a framing.

**R18b (badge transparency):** deferred — no badge in this design.

**R18c (interoperability):** standard. The D-5 `discovered_purpose` handoff shape is the external contract; it must remain readable if extended later for AP2 or verifiable-credential interop.

**R18d (adversarial evaluation):** **PRIMARY** (per the 2026-05-20 promotion, reinforced by D-13). Build **Stage 2** MUST include adversarial-evaluation tests against (a) agents whose responses are designed to manipulate the engine toward validation (Q2 Variant B + Q3 Variant B target this); (b) agents whose instruction/context contains covert framing or biased priors that should be resisted (the variant-selection discipline targets this); (c) poisoned/spoofed Agent Cards arriving via `agent_card_url` (D-13) — the engine must verify the card against its URL and never accept its claims at face value as evidence of capacity.

**R18e (Article 50 transparency):** standard. The interaction is unambiguously identified as a Stoic-grounded purpose-discovery sequence, not a general consultation.

**R20a (distress detection):** standard. Sage Calling is NOT on the R20a perimeter (it does not handle distress directly), but its tone + framing stay consistent with R20a-adjacent care principles. **PR6 NOT engaged.**

**R20d (relationship asymmetry):** standard, reinforced by D-12. The clarification protocol's "once and precisely" constraint and the post-clarification innermost-circle return are asymmetry-aware.

**AC7 (auth surface):** ENGAGED at build Stage 2 via D-6 (A10 credentials).
**AC8 (translation-sandwich substrate):** engaged narrowly via D-5 — the additive Layer 1 *input* extension only; Layers 2/3 untouched.
**AC10 (provenance):** ENGAGED — D-2 `session_id` + D-8 `loop_id` propagate into the substrate's `loop_billing_events` for end-to-end traceability.

**KG1 (Vercel five rules):** engaged at build (D-2/D-3 persistence — all DB writes/reads awaited; no fire-and-forget).
**KG7 (JSONB):** engaged at build (D-3 — response history + signals likely JSONB).

**PR1 (single-build proof):** D-9 staging proves the deterministic path (Stage 1 content/schema) before the Critical engine + public surface (Stage 2).
**PR4 (model selection):** NOT engaged (D-4 rule-based); engages only if the PR7-deferred hybrid is later adopted.
**PR6 (safety-critical):** NOT engaged — no R20a / distress-classifier surface.
**PR15 (Anthropic-canonical primitive consult):** performed at this design pass (`.claude/skills/anthropic/`). Forward pointers only: `skill-creator` (if Sage Calling is later packaged as a skill — not elected); `mcp-builder` (forward pointer for R18c — Sage Calling could be exposed as an MCP tool later); `claude-api` (informational; engages at build only if the PR7-deferred LLM hybrid (D-4) is adopted). No bespoke-vs-primitive election was required this pass (design-only; no code).

---

## Risk classification (post-election)

This **design pass** is `governance` tier, **Elevated** under 0d-ii — Standard for the documentation work, raised to **Elevated** by the archive action of moving this locked design from `/drafts/` to `/adopted/` (per the standing cache). AC7 NOT engaged this pass; PR6 NOT engaged; Critical Change Protocol NOT engaged (no code lands).

The **build** is staged per D-9:
- **Stage 1 — content + schema:** **Elevated** (24-variant library + 4 templates as content; new `discovery_sessions` schema; additive substrate Layer 1 extension). No public surface.
- **Stage 2 — engine + endpoint:** **Critical** (new auth-gated public product surface; new endpoint; A10 auth gate; Hard Gate + global-flag kill switch; full-session persistence; deployment-config flag). Full Critical Change Protocol applies.

---

## Build session estimate (post-election)

Staged per D-9:
- **Stage 1 ~2–3 hr** (Elevated; lean template + archive note where files move).
- **Stage 2 ~4–5 hr** (Critical; full Critical Change Protocol).

Both build stages are pre-conditioned on A10 Verified (satisfied) for Stage 2's auth gate.

---

## Open items carried forward under PR7

- **D-4** — hybrid (rules + LLM fallback) variant-selection engine; trigger = R18d adversarial evaluation shows rules miss subtle signals.
- **D-7** — exact retention window + deletion-endpoint shape; trigger = Stage 1 schema design.
- **D-10** — substrate-supplied operational-health signal; trigger = wrapper observability surface becomes available.
- **D-11** — full interruptibility (mid-sequence context-injection; cross-session stage-skipping); trigger = demonstrated post-launch demand.
- **D-12** — timeout value + "new context arrives" detection; trigger = Stage 2 wiring.
- **R18b** — badge transparency; no badge in this design.

---

## Cross-references

- `/archive/2026-05-21-purpose-discovery-product-design-working-draft-PRE-LOCK.md` — the pre-lock working draft (preserved superseded version; per 0e).
- `/archive/2026-05-17-private-mentor-purpose-discovery-product-consultation.md` — the source consultation (three rounds; the full mentor exchange this spec is drawn from).
- `/adopted/sage-assent-a10-design.md` — the A10 credential design; Sage Calling reuses A10 credentials (D-6). A10 Verified per `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`.
- `/adopted/pass-through-fields-design.md` — the pass-through fields Sage Calling may populate on its Layer 1 handoff (D-5).
- `/adopted/billing-model-design.md` — the Option D metering layer Sage Calling's loops bill through (D-8); the Layer 4 payment kill switch is Option D's deferred remit (control-map Row 5).
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — J1 ADR (Character Kernel category language; Sage Calling is Character Kernel work).
- `/adopted/standing-protocol-cache.md` — the governing session-opening reference for this pass and the staged build.
- `/adopted/build-sessions-protocol-cache.md` — "no current users" governing note (pre-launch).
- `/operations/decision-log.md` — `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-2026-05-21` (this pass) + `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21` (the A10 pre-condition).
- `/manifest.md` — R-rule engagement (R0, R3, R4, R5, R9, R10, R17, R17h, R17i, R18a, R18b, R18c, R18d, R18e, R20a, R20d); AC engagement (AC7, AC8, AC10); KG engagement (KG1, KG7); PR engagement (PR1, PR4, PR6, PR15).

*End of locked design. All fourteen architectural decisions (Q-OPEN-1 … Q-OPEN-14 → D-1 … D-14) elected 2026-05-21. Status: Designed. Next step: the staged build (Stage 1 Elevated, Stage 2 Critical), pre-conditioned on A10 Verified (satisfied).*
