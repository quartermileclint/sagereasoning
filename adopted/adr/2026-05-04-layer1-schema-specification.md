# ADR-005 — Layer 1 Schema Specification (Translation-Sandwich Engine, M1-CP1)

**Status:** Adopted (founder approval at Sub-session M1-CP1, 2026-05-04 — "approve as drafted" with no edits).
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification of the M1 pilot's wiring shape, including the §2.2 deferral that this ADR resolves); `D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04` (E9 — migration codification + AC8).
**Related deliverables:** `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — names this ADR's parent context and defers field-level Layer 1 specification to M1-CP1); `/adopted/adr/2026-05-04-depth-architecture-migration.md` (ADR-003 — the migration); `/manifest.md` AC1 + AC8 (Layer 1 model selection + the architectural constraint); `/website/src/lib/sage-reason-engine.ts` (the bundled-depth engine — system-prompt patterns and input shape Layer 1 mirrors); `/website/src/app/api/reason/route.ts` (the pilot consumer; Layer 1's caller at M1-CP4).
**Engages:** R0 (oikeiosis — Layer 1's extraction discipline serves principled mechanism reasoning); R3 (evaluative disclaimer — out of Layer 1's scope; Layer 3 carries it); R7 (source fidelity — verbatim evidence quotes preserve the agent's words through to Layer 2 and Layer 3); R8a (controlled vocabulary — Greek identifiers across passion taxonomy, causal stages, virtue domains); AC1 (model selection — Layer 1 = Sonnet); AC6 (four-layer context architecture — Layer 1's call places RAG in system message, route-supplied contexts in user message); AC8 (translation-sandwich constraint — Layer 1 module is the first build under this architecture); KG1 (Vercel five rules — module is awaited, no fire-and-forget, no module-level cache; per-request cache lifetime owned by route); KG2 (Haiku reliability boundary — multi-step structured extraction requires Sonnet); PR1 (single-endpoint proof — Layer 1 is verified standalone before composing into the route at M1-CP4); PR3 (NOT engaged at this layer — Layer 1 has no safety-critical surface; R20a perimeter is in the route, fires before Layer 1 is called); PR4 (model selection unbundled from depth-tier — Layer 1's model is fixed regardless of caller depth); PR6 (NOT engaged this session — module is not wired into route; engages at M1-CP4).

---

## Context

### What this ADR resolves

ADR-004 §2.2 specifies the seven content categories the `extraction` block must contain (passions_present, control_filter_elements, oikeiosis_circles_engaged, value_categories_at_stake, kathekon_factors, urgency_indicators, causal_stage_evidence) and explicitly defers field-level specification to M1-CP1. ADR-004 §3.1 specifies the module's exported function (`extractFeatures`) and its general input/output shape; ADR-004 §3.2 names model (Sonnet), proposes max-tokens (4000) and temperature (0.2) defaults pending CP1 confirmation. ADR-005 closes those deferrals: it defines the exact `Layer1Schema` TypeScript type, the per-field LLM extraction guidance, the Layer 1 system prompt, the harness fixture set used for Phase 1 + Phase 2 of the standalone verification, and confirms (or revises) ADR-004's defaults.

### What this ADR does not resolve

- The Layer 2 `applyMechanisms` algorithm — deferred to ADR-006 at M1-CP2.
- The Layer 3 prompt template — deferred to ADR-007 at M1-CP3.
- The end-to-end orchestration in `/api/reason` — deferred to M1-CP4 (Critical-tier).
- The parallel-run cost cap and observation duration — deferred to M1-CP4.
- The cutover thresholds — deferred to M1-CP5.
- Any change to the bundled-depth engine — out of scope until M5 retirement.

### Founder-confirmed decisions surfaced before drafting

At session open, AI surfaced seven load-bearing decisions and presented options. Founder selected:

- **L1a — Hand-rolled validator.** Plain TypeScript interface + a `validateLayer1Schema(parsed): Layer1Schema` function. No new runtime dependency. Matches the existing engine's pattern (raw `Record<string, unknown>` + `extractJSON` + manual checks).
- **L2a — Empty defaults.** Required fields always present; absence shown by empty arrays / null scalars. Phase 2 schema-fidelity check (every key present) passes cleanly.
- **L3b — Top-level `ambiguity_notes`.** Single string array at the top level naming any uncertainty; no per-field ambiguous flags.
- **L4 — Four fixtures (F1–F4).** Simple control-filter; multi-passion; multi-circle obligation conflict; urgency-pressured.
- **L5a — Real Sonnet calls in the harness.** Phase 1 cannot be verified without real LLM behaviour. Per-run cost ~$0.10–0.40.
- **L6 — Confirm ADR-004 defaults.** Max tokens 4000; temperature 0.2.
- **L7a — Mirror `runSageReason`'s input shape.** `ExtractInput` accepts the same parameters the route already builds for the bundled engine, minimising the M1-CP4 wiring change.

## Decision

### 1. Module surface

New module: `/website/src/lib/translation-sandwich/layer1-extractor.ts`. Exports:

```typescript
export interface ExtractInput {
  /** Required — the agent's input text. */
  input: string
  /** Optional — supplemental context provided by the caller. */
  context?: string
  /** Optional — domain context (the route already validates this against TEXT_LIMITS.medium). */
  domain_context?: string
  /** Optional — urgency context provided by the caller (treated as supplemental;
   *  Layer 1's `urgency_indicators` field extracts urgency from the agent's own language,
   *  not from this parameter). */
  urgency_context?: string
  /** Optional — formatted Stoic Brain block (D6 + D7 retrieval). When provided, placed in
   *  the system message with cache_control. */
  stoicBrainContext?: string
  /** Optional — D6 + D7 retrieved passages. When provided AND stoicBrainContext is empty,
   *  the module formats them via `formatRetrievedPassagesAsBlock` (existing engine helper). */
  retrievedPassages?: import('@/lib/rag').RetrievedPassage[]
  /** Optional — practitioner profile (Layer 2 of the four-layer context architecture, AC6).
   *  Placed in the user message. */
  practitionerContext?: string | null
  /** Optional — project state (Layer 3 of the four-layer context architecture, AC6).
   *  Placed in the user message. */
  projectContext?: string | null
}

export async function extractFeatures(
  params: ExtractInput
): Promise<Layer1Schema>
```

The shape mirrors `ReasonInput` from `sage-reason-engine.ts` for the fields Layer 1 needs. Fields the bundled engine accepts but Layer 1 ignores at CP1 (`agentBrainContext`, `environmentalContext`, `mentorKnowledgeBase`, `systemPromptOverride`, `depth`) are not part of `ExtractInput` because Layer 1 has no use for them: Layer 1's job is feature extraction, not reasoning depth selection or mentor-prose composition. If a future consumer needs these layers in extraction, it is a CP4-scope decision.

### 2. The `Layer1Schema` TypeScript type

```typescript
// =============================================================================
// CONTROLLED VOCABULARIES (R8a)
// =============================================================================

export type RootPassion = 'epithumia' | 'hedone' | 'phobos' | 'lupe'

export type EpithumiaSubSpecies =
  | 'orge' | 'eros' | 'pothos' | 'philedonia' | 'philoplousia' | 'philodoxia'
export type HedoneSubSpecies =
  | 'kelesis' | 'epichairekakia' | 'terpsis'
export type PhobosSubSpecies =
  | 'deima' | 'oknos' | 'aischyne' | 'thambos' | 'thorybos' | 'agonia'
export type LupeSubSpecies =
  | 'eleos' | 'phthonos' | 'zelotypia' | 'penthos' | 'achos'

export type PassionSubSpecies =
  | EpithumiaSubSpecies | HedoneSubSpecies | PhobosSubSpecies | LupeSubSpecies

export type CausalStage =
  | 'phantasia'        // impression
  | 'synkatathesis'    // assent
  | 'horme'            // impulse
  | 'praxis'           // action

export type OikeiosisCircle =
  | 'self_preservation'
  | 'household'
  | 'local_community'
  | 'political_community'
  | 'cosmopolis'

export type Indifferent =
  | 'life' | 'health' | 'pleasure' | 'beauty' | 'strength'
  | 'wealth' | 'reputation' | 'noble_birth'
  | 'death' | 'disease' | 'pain' | 'ugliness'

export type AgentFraming = 'good' | 'evil' | 'indifferent' | 'unspecified'

export type AgentNamedPosition = 'within' | 'outside' | 'unspecified'

export type KathekonFactorType =
  | 'natural_relationship'
  | 'role_obligation'
  | 'justification_offered'

export type UrgencySignalType =
  | 'time_pressure'
  | 'imminent_deadline'
  | 'finality_language'
  | 'irreversibility_language'

// =============================================================================
// PER-CATEGORY ENTRY SHAPES
// =============================================================================

export interface PassionPresent {
  /** Root passion per the canonical taxonomy. */
  root_passion: RootPassion
  /** Sub-species when identifiable; null when the root is named but the sub-species
   *  cannot be determined from the input. */
  sub_species: PassionSubSpecies | null
  /** Verbatim quote from the input that motivates this detection. R7 source fidelity. */
  evidence: string
}

export interface ControlFilterElement {
  /** Verbatim item the agent named as a concern. */
  item: string
  /** How the agent appears to frame this item — within their control, outside,
   *  or unspecified. Layer 2 decides the canonical classification using its
   *  lookup table; this field records the agent's framing only. */
  agent_named_position: AgentNamedPosition
}

export interface OikeiosisCircleEngaged {
  circle: OikeiosisCircle
  /** Verbatim quote naming the parties or relationships at this circle level. */
  evidence: string
}

export interface ValueCategoryAtStake {
  indifferent: Indifferent
  /** How the agent frames this indifferent in the input. Layer 2 compares this against
   *  axia (the canonical Stoic ranking) to compute value errors. */
  agent_framing: AgentFraming
  evidence: string
}

export interface KathekonFactor {
  factor_type: KathekonFactorType
  /** Layer 1's brief description of the factor (one phrase). The full evidence is preserved
   *  in `evidence`. */
  description: string
  evidence: string
}

export interface UrgencyIndicator {
  signal_type: UrgencySignalType
  evidence: string
}

export interface CausalStageEvidence {
  stage: CausalStage
  evidence: string
}

// =============================================================================
// TOP-LEVEL SCHEMA
// =============================================================================

export interface Layer1Schema {
  /** Schema version. Constant. Bumped if the schema shape changes. */
  version: 'layer1-schema-v1'
  passions_present: PassionPresent[]
  control_filter_elements: ControlFilterElement[]
  oikeiosis_circles_engaged: OikeiosisCircleEngaged[]
  value_categories_at_stake: ValueCategoryAtStake[]
  kathekon_factors: KathekonFactor[]
  urgency_indicators: UrgencyIndicator[]
  causal_stage_evidence: CausalStageEvidence[]
  /** Free-form notes naming any uncertainty — e.g. a passion that could map to two
   *  sub-species, a statement that could be evidence for two causal stages, or
   *  a metaphorical text whose literal target is unclear. Empty when the extraction
   *  is unambiguous. */
  ambiguity_notes: string[]
}
```

### 3. Per-field extraction guidance

Each entry in this section names what evidence in the input populates the field, what the LLM should do when the input is silent, and which Layer 2 mechanism downstream consumes it.

#### 3.1 `passions_present`

- **Source:** the agent's emotional language. Phrases naming the passion directly ("I'm afraid", "I crave") and phrases displaying the passion ("I can't stop thinking about", "the thought of losing it makes me sick").
- **What to extract:** root passion (always); sub-species (when identifiable); verbatim evidence quote.
- **When silent:** empty array. Layer 2's `passion_diagnosis` mechanism returns no detected passions for this input.
- **Sub-species discipline:** sub-species must come from the canonical taxonomy. If the root is identifiable but no sub-species fits, return `sub_species: null` and add an ambiguity note. Do NOT invent sub-species.
- **Multiple passions allowed:** same input can detect multiple passions, including same root with different sub-species.
- **Layer 2 consumer:** `applyMechanisms` → `passion_diagnosis` → false judgement mapping → causal stage placement.

#### 3.2 `control_filter_elements`

- **Source:** items the agent names as objects of concern, deliberation, or worry.
- **What to extract:** the verbatim item; the agent's apparent framing (within their control, outside, or unspecified). The agent's framing is what the *agent* believes — Layer 2 produces the canonical classification from a categorical rules table.
- **When silent:** empty array (rare — most inputs name some concern).
- **Layer 2 consumer:** `applyMechanisms` → `control_filter` → binary partition.

#### 3.3 `oikeiosis_circles_engaged`

- **Source:** the parties, relationships, and communities the input names. Self-references → self_preservation. Family / partner / household → household. Friends / colleagues / neighbours → local_community. Country / fellow citizens / political contexts → political_community. All-of-humanity / cosmos / universal moral references → cosmopolis.
- **What to extract:** the engaged circles; verbatim evidence (the phrase naming the relationship).
- **When silent:** empty array.
- **Multiple circles allowed:** an input can engage two or more circles simultaneously.
- **Layer 2 consumer:** `applyMechanisms` → `oikeiosis` → Cicero's five questions per circle.

#### 3.4 `value_categories_at_stake`

- **Source:** mentions of the twelve canonical preferred indifferents.
- **What to extract:** the indifferent; the agent's framing (does the agent treat it as a genuine good, a genuine evil, or as indifferent); evidence.
- **When silent:** empty array.
- **Mapping discipline:** map to canonical names (lowercase, snake_case). "Money" → wealth. "Looks" → beauty. "What people think of me" → reputation. "Being alive" → life. Negatives map to their canonical counterparts (death, disease, pain, ugliness).
- **Layer 2 consumer:** `applyMechanisms` → `value_assessment` → axia × treated-as comparison → value error detection.

#### 3.5 `kathekon_factors`

- **Source:** factors that bear on appropriateness — natural relationships (parent, partner, friend), role obligations (job, citizen, neighbour), and justifications offered for an action ("because they need help", "because it's my duty").
- **What to extract:** factor type; one-phrase description; verbatim evidence.
- **When silent:** empty array.
- **Layer 2 consumer:** `applyMechanisms` → `kathekon_assessment` → four-rule check → quality classification.

#### 3.6 `urgency_indicators`

- **Source:** the agent's own language about time pressure. "I need to decide today", "before it's too late", "this is my last chance", "irreversible".
- **What to extract:** signal type; verbatim evidence.
- **When silent:** empty array.
- **Discipline:** extract urgency from the agent's language only. The route-supplied `urgency_context` parameter is supplemental information from the caller — do not echo it into `urgency_indicators` unless the agent's text itself names urgency.
- **Layer 2 consumer:** `applyMechanisms` → `hasty_assent_risk` (when urgency_indicators is non-empty AND control_filter_elements suggests action without deliberation).

#### 3.7 `causal_stage_evidence`

- **Source:** language indicating where in the causal chain (impression → assent → impulse → action) the agent currently is.
- **Stage cues:**
  - `phantasia` (impression): the agent is reporting how something appeared to them, not yet endorsing it. "It seemed like…", "the impression was…", "at first I thought…".
  - `synkatathesis` (assent): the agent has accepted an impression as true. "I believed", "I was convinced", "I told myself".
  - `horme` (impulse): the agent has formed a desire / aversion. "I wanted", "I felt I had to", "I couldn't help but".
  - `praxis` (action): the agent has acted. "I did", "I said", "I went and".
- **What to extract:** stage; verbatim evidence.
- **When silent:** empty array (rare for non-trivial inputs).
- **Multiple stages allowed:** an input can show evidence at several stages — e.g. an impression that was assented to and then acted on. Each stage gets its own entry.
- **Layer 2 consumer:** `applyMechanisms` → `passion_diagnosis.causal_stage_affected` (the latest stage with evidence is typically the assessment's anchor).

### 4. Layer 1 system prompt

Stored as a constant inside the module. Sent as a cached system block per AC6.

```
You are Layer 1 of the SageReasoning translation-sandwich engine. Your role is FEATURE EXTRACTION ONLY. You do not assess, judge, recommend, or generate prose. You extract structured features from the input text and return them as JSON conforming exactly to Layer1Schema.

Your output drives a deterministic Stoic mechanism engine (Layer 2). The quality of the engine's assessment depends on the fidelity of your extraction.

EXTRACTION CONTRACT

Read the input text carefully. For each of the seven content categories below, extract everything the input names and return it in the specified shape.

If a category is absent from the input, return an empty array for that category — do not omit the field.

If you are uncertain about a classification (e.g., a passion that could map to two sub-species, a statement that could be evidence for two causal stages, a metaphorical text whose literal target is unclear), add a note to ambiguity_notes naming the field and the source of uncertainty. Do not guess.

Quote the input verbatim in every `evidence` field. Do not paraphrase. Do not add interpretation. Layer 1's value depends on Layer 2 receiving the agent's actual words, not your summary of them.

CATEGORIES

1. passions_present — passions detected in the input.
   - Root passion (required): epithumia, hedone, phobos, or lupe.
   - Sub-species (when identifiable, else null):
     • Epithumia: orge, eros, pothos, philedonia, philoplousia, philodoxia.
     • Hedone: kelesis, epichairekakia, terpsis.
     • Phobos: deima, oknos, aischyne, thambos, thorybos, agonia.
     • Lupe: eleos, phthonos, zelotypia, penthos, achos.
   - Evidence: verbatim quote from the input.
   Multiple passions are allowed. Same root with different sub-species is allowed.

2. control_filter_elements — items the agent names as concerns or objects of deliberation.
   - Item: verbatim item from the input.
   - agent_named_position: how the agent frames it — "within" their control, "outside" their control, or "unspecified" if the agent does not signal either.
   Layer 2 decides the canonical classification using a rules table; you record only the agent's framing.

3. oikeiosis_circles_engaged — circles the input touches.
   - Circle: self_preservation | household | local_community | political_community | cosmopolis.
   - Evidence: verbatim quote naming the parties or relationships.
   Multiple circles allowed.

4. value_categories_at_stake — preferred indifferents named in the input.
   - Indifferent: life | health | pleasure | beauty | strength | wealth | reputation | noble_birth | death | disease | pain | ugliness.
   - agent_framing: good | evil | indifferent | unspecified — how the agent treats this indifferent.
   - Evidence.
   Map natural-language references to canonical names ("money" → wealth, "looks" → beauty, "what people think" → reputation).

5. kathekon_factors — natural relationships, role obligations, and justifications.
   - factor_type: natural_relationship | role_obligation | justification_offered.
   - Description: one phrase.
   - Evidence.

6. urgency_indicators — language patterns from the agent suggesting time pressure.
   - signal_type: time_pressure | imminent_deadline | finality_language | irreversibility_language.
   - Evidence.
   Extract urgency from the agent's own words. Do not infer urgency from the supplemental urgency_context parameter unless the agent's text itself names it.

7. causal_stage_evidence — textual evidence supporting placement at causal stages.
   - Stage: phantasia (impression) | synkatathesis (assent) | horme (impulse) | praxis (action).
   - Evidence: verbatim quote.
   Multiple stages allowed — an input can show evidence at several stages simultaneously.

OUTPUT

Return ONLY valid JSON conforming to Layer1Schema. No markdown. No commentary outside the JSON.

{
  "version": "layer1-schema-v1",
  "passions_present": [
    {"root_passion": "phobos", "sub_species": "agonia", "evidence": "..."}
  ],
  "control_filter_elements": [
    {"item": "...", "agent_named_position": "outside"}
  ],
  "oikeiosis_circles_engaged": [
    {"circle": "household", "evidence": "..."}
  ],
  "value_categories_at_stake": [
    {"indifferent": "reputation", "agent_framing": "good", "evidence": "..."}
  ],
  "kathekon_factors": [
    {"factor_type": "role_obligation", "description": "...", "evidence": "..."}
  ],
  "urgency_indicators": [
    {"signal_type": "time_pressure", "evidence": "..."}
  ],
  "causal_stage_evidence": [
    {"stage": "synkatathesis", "evidence": "..."}
  ],
  "ambiguity_notes": [
    "passions_present[0].sub_species: could be eros or pothos"
  ]
}

Use the EXACT JSON keys shown above (e.g. "root_passion", not "root"; "agent_named_position", not "position"; "factor_type", not "type"). Use the EXACT enum values from the controlled vocabularies above.

ambiguity_notes is a string array. Each entry is a single string naming the field and the source of uncertainty in plain text. Do NOT use objects. Do NOT use nested structure. Each entry is one string.

Example of correct ambiguity_notes:
  "ambiguity_notes": [
    "passions_present[0].sub_species: could be eros or pothos",
    "causal_stage_evidence: 'I keep checking my phone' could be evidence for synkatathesis or horme"
  ]

Incorrect (do not use this shape):
  "ambiguity_notes": [
    {"field": "passions_present[0].sub_species", "note": "could be eros or pothos"}
  ]

If everything was unambiguous, return [].

Return only the JSON.
```

### 5. LLM call configuration

- **Model:** `MODEL_DEEP` (Sonnet) per AC1 row "Layer 1 translation (alt-3)" + KG2.
- **Max tokens:** 4000 (confirmed per ADR-004 §3.2 default).
- **Temperature:** 0.2 (confirmed per ADR-004 §3.2; matches `runSageReason`).
- **System prompt placement:** the prompt above is sent as the first system message block with `cache_control: { type: 'ephemeral' }` per AC6 (cached expertise; system layer). When `stoicBrainContext` or `retrievedPassages` is provided, a second system block carries the RAG content (uncached — per-request retrieval).
- **User message placement:** the agent's `input`, plus `context`, `domain_context`, `urgency_context`, `practitionerContext`, `projectContext` are concatenated into the user message in that order, mirroring the bundled engine's composition (AC6 + KG6).

### 6. Validation function

Module exports a private `validateLayer1Schema(parsed: unknown): Layer1Schema`. The validator:

1. Asserts `parsed` is an object with the exact required keys (`version`, all seven categories, `ambiguity_notes`). Missing key → throw.
2. Asserts `version === 'layer1-schema-v1'`. Mismatch → throw.
3. Asserts each category is an array. Non-array → throw.
4. For each entry in each category, asserts the required fields are present and have the correct primitive types and enum membership. Bad enum value → throw with the field name and the offending value.
5. On success, returns the input narrowed to `Layer1Schema`.

A throw from the validator is caught by the route at M1-CP4 per ADR-004 §9.1 and triggers the bundled-depth fallback. At CP1 (standalone), a throw fails the harness phase 2 fixture and the founder reviews the LLM output to revise the prompt or schema.

### 7. Error handling and KG1 compliance

The module:

- Awaits the Anthropic API call before returning. No fire-and-forget.
- Has no module-level cache. The route owns the per-request cache lifetime per KG1.
- Has no DB writes.
- Has no self-calls (no fetch to other API routes).
- Throws typed errors on:
  - LLM API failure (network error, timeout, rate limit).
  - JSON parse failure (`extractJSON` throws).
  - Schema validation failure (`validateLayer1Schema` throws).
- Logs each failure with `console.warn` naming the route (`/api/reason` at M1-CP4) and the failure category, before re-throwing.
- Caches the system prompt at the API level via `cache_control: { type: 'ephemeral' }`. This is the same cache mechanism the bundled engine uses for its system prompt (provider-side, not module-side).

### 8. Standalone harness — Phase 1 + Phase 2 fixtures

The harness file `/website/scripts/verify-translation-sandwich.ts` runs Phase 1 (extraction completeness) and Phase 2 (schema fidelity) at M1-CP1. Phases 3–9 are stubbed with `// TODO: M1-CPN — see ADR-004 §7.2` markers and skipped at this checkpoint.

#### 8.1 Fixtures

**F1 — Simple control-filter case.**

Input: "I keep checking my phone to see if she's replied. I sent the message two hours ago and she still hasn't read it. I don't know what to do."

Expected exercise: control_filter_elements (the reply, her reading the message — outside framing); passions_present (phobos / agonia or thorybos); oikeiosis_circles_engaged (household — partner relationship implied or local_community — friend); causal_stage_evidence (synkatathesis / horme — the agent has assented to the impression that her silence is significant).

**F2 — Multi-passion case.**

Input: "I should have spoken up at the meeting today. Everyone else got credit for the work I led, and now I look weak in front of the team. But part of me is also relieved I didn't argue — I hate confrontation."

Expected exercise: passions_present with multiple roots (lupe / penthos for what was lost, phobos / aischyne for shame, possibly philodoxia for reputation-concern); value_categories_at_stake (reputation — treated as good); kathekon_factors (role_obligation — leading the work); causal_stage_evidence (synkatathesis + praxis — the agent has assented to the assessment and not-acted).

**F3 — Multi-circle obligation conflict.**

Input: "My mother needs me at home this weekend, but I promised the volunteer group I'd be at the community event. I can't be in two places. I keep going back and forth on which obligation matters more."

Expected exercise: oikeiosis_circles_engaged (household + local_community); kathekon_factors (natural_relationship — mother; role_obligation — volunteer commitment); control_filter_elements (the choice itself — within; her needs and the event timing — outside); causal_stage_evidence (synkatathesis — deliberation in progress).

**F4 — Urgency-pressured case.**

Input: "I have to send the contract back today or the deal falls through. I haven't had time to read it properly but everyone's pressing me. Just sign and move on, that's what they're saying."

Expected exercise: urgency_indicators (time_pressure, imminent_deadline, finality_language); passions_present (phobos / agonia — pressure); kathekon_factors (justification_offered — "everyone's pressing me"); causal_stage_evidence (phantasia / synkatathesis — wavering between the impression that it's safe and the impression that signing without reading is wrong); ambiguity_notes likely populated.

#### 8.2 Phase 1 — extraction completeness

For each fixture, assert that:

- The returned schema is a valid JSON object.
- `passions_present.length > 0` for F1, F2, F4 (F3 may have empty if interpreted as deliberation-without-passion; ambiguity_notes records that).
- `control_filter_elements.length > 0` for all four fixtures.
- `oikeiosis_circles_engaged.length > 0` for F1, F2, F3.
- The expected categories per fixture (above) are non-empty.
- `version === 'layer1-schema-v1'`.

Phase 1 is observational. The harness prints the schema for each fixture. Founder reviews the diagnostics; if a fixture's expected category is empty, this surfaces a prompt-tuning or schema-revision opportunity at CP1 (or in CP1b if deferred).

#### 8.3 Phase 2 — schema fidelity

For each fixture, assert that `validateLayer1Schema(returnedJson)` does not throw. The schema is structurally complete (all keys present, all entries well-typed, all enums valid).

A Phase 2 failure is a hard fail — it indicates the LLM produced output that does not conform to the schema. Founder decides whether the failure is in the module (validator bug — fix in CP1), the schema (revise ADR-005 §2), or the prompt (revise ADR-005 §4).

#### 8.4 Phases 3–9 stubs

Phases 3–9 are stubbed in the harness file with explicit TODO markers cross-referencing ADR-004 §7.2. Each stub `console.log`s "Phase N skipped — see ADR-004 §7.2; due at M1-CPN" and exits the phase.

### 9. KG-compliance summary

| KG | Engagement | Disposition |
|---|---|---|
| KG1 — Vercel five rules | Partial | Module-level: no fire-and-forget (LLM call awaited); no module cache (route owns per-request lifetime); no DB writes; no self-calls. Route-level wiring at CP4 handles the rest. |
| KG2 — Haiku reliability | Engaged | Sonnet selected per AC1. Multi-step structured extraction with multiple controlled vocabularies is outside Haiku's reliability boundary. |
| KG3 — Hub-label consistency | N/A | Module does not write to `mentor_interactions`. |
| KG4 — Layer 2 applicability | N/A | Module is engine code; not a per-endpoint context layer. |
| KG5 — Token-counts method | N/A this session | Latency / cost reporting deferred to Phase 9 at M1-CP4. |
| KG6 — Composition order | Engaged | System block carries RAG (cached); user message carries practitioner + project + environmental contexts. Mirrors the bundled engine. |
| KG7 — JSONB storage | N/A | Module does not write to JSONB columns. |

## Consequences

### Positive

- The seven content categories of ADR-004 §2.2 now have concrete TypeScript types. Layer 2's algorithm (ADR-006 at M1-CP2) can be specified against an exact input shape.
- The schema preserves R7 source fidelity at the field level (every entry carries a verbatim `evidence` quote). Layer 2 and Layer 3 receive the agent's actual words, not Layer 1's paraphrase.
- The hand-rolled validator pattern (no Zod) keeps the dependency surface unchanged. AC8 binding force is satisfied without expanding the package.
- The fixture set (4 fixtures) covers the distinct paths Layer 2 will exercise. Phase 1 + Phase 2 verification gives the founder concrete LLM output to review at CP1; Phase 3+ deferral keeps the session bounded.
- The mirrored input shape (L7a) means the route at M1-CP4 can pass the same parameter object to both engines for parallel-run, minimising the wiring change.

### Negative / known costs

- **Hand-rolled validator maintenance.** Adding a new field to `Layer1Schema` requires updates in the type, the validator, the system prompt, the per-field guidance, and the fixtures. A Zod-based approach would centralise this. Trade-off accepted: AC8's discipline favours minimal dependency growth.
- **Real-LLM harness cost.** Each full harness run incurs ~$0.10–0.40. R5 cost-health alerts do not fire for one-off harness runs at CP1, but founder should not run the harness in a tight loop. Mitigation: harness runs are explicit; no scheduled execution.
- **Schema may need revision after CP1 fixtures.** If the four fixtures reveal that the seven content categories miss a recurring feature of real inputs (or that one category subsumes another), ADR-005 may need amendment in CP1 or in a follow-up CP1b. This is the point of CP1 — surface schema gaps before CP2's Layer 2 algorithm locks in dependencies.
- **The system prompt is long.** Roughly 800 words including taxonomy reminders. Cached at the API level so the cost is paid once per route deployment, not per request.

### Risks named

- **LLM under-extraction.** Sonnet may miss a category for an input that clearly engages it (e.g., return empty `passions_present` for an obviously emotional input). Mitigation: Phase 1 observational diagnostics; ambiguity_notes captures cases where the LLM was uncertain rather than silent.
- **LLM over-extraction.** Sonnet may invent categories or misclassify (e.g., map a casual mention of "money" to `wealth: { agent_framing: 'good' }` when the agent only named it in passing). Mitigation: per-field guidance specifies the framing semantics; the verbatim evidence requirement makes over-extraction visible at review.
- **Sub-species hallucination.** Sonnet may invent sub-species not in the canonical taxonomy. Mitigation: the validator's enum check throws; the system prompt names the canonical set explicitly.
- **Verbatim-quote drift.** Sonnet may paraphrase rather than quote, even with explicit instruction. Mitigation: founder spot-checks at Phase 1; if drift is observed across fixtures, revise the system prompt to reinforce verbatim quoting.
- **`urgency_context` echo.** The route passes `urgency_context` as a supplemental parameter; Layer 1's system prompt instructs not to echo it into `urgency_indicators` unless the agent's text names urgency. If Sonnet echoes anyway, Phase 1 surfaces it; mitigation is a prompt revision.
- **Schema rigidity at CP1.** If the seven categories prove insufficient at CP4 (when real `/api/reason` traffic flows), the schema must be amended — and Layer 2's algorithm (ADR-006) and Layer 3's prompt (ADR-007) inherit dependencies. Mitigation: CP1 is the right moment for schema revision; founder reviews the fixtures and approves before CP2 commits.

### What this ADR is not

- **Not Layer 2.** The deterministic mechanism algorithm is ADR-006 at M1-CP2. ADR-005 names what Layer 2 *receives*, not what Layer 2 *does*.
- **Not Layer 3.** The per-consumer prose template is ADR-007 at M1-CP3.
- **Not the route wiring.** The module exists in `/website/src/lib/translation-sandwich/` but is not imported by any route until M1-CP4.
- **Not the harness fixture set in full.** Phases 3–9 fixtures and the field-by-field comparison rubric are deferred to M1-CP4 per ADR-004 §7.2.

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR-005 moves from `/drafts/adr/` to `/adopted/adr/` in this session. The Layer 1 module build (Step 2) and the harness build (Step 3) proceed under this Adopted spec.

If the founder rejects ADR-005 or requests substantial edits, the draft is revised in this session or the build is deferred to M1-CP1b. The Layer 1 module is not built until ADR-005 is Adopted.

## Changelog

- **2026-05-04 (initial Adoption, Sub-session M1-CP1)** — drafted in `/drafts/adr/` after founder selected L1a + L2a + L3b + L4 + L5a + L6 + L7a from the load-bearing decision menu, founder-approved verbatim ("approve as drafted"), moved to `/adopted/adr/`. Defines `Layer1Schema` TypeScript type with seven content categories, controlled vocabularies for passion taxonomy / causal stages / circles / indifferents / agent framing / kathekon factors / urgency signals; specifies per-field extraction guidance; specifies the Layer 1 system prompt; confirms ADR-004 §3.2 defaults (4000 max-tokens, 0.2 temperature); names four harness fixtures (F1–F4) for Phase 1 + Phase 2; names KG-compliance disposition.

- **2026-05-04 (in-session amendment, Sub-session M1-CP1, post-harness)** — first harness run failed Phase 2 across all four fixtures with the same error: Sonnet produced `ambiguity_notes` as an array of objects (`{field, note}`) rather than strings. Root cause: the system prompt's instruction "add a note … naming the field and the source of uncertainty" read as a request for structured shape. Schema design (§2) tested clean across the other seven categories on all four fixtures. Per founder direction (Path A approved 2026-05-04), the system prompt §4 was amended to add an explicit example showing the correct string-array form and an explicit anti-pattern showing the incorrect object-array form. L3b decision preserved (single string array at top level). Schema (§2) and validator (§6) unchanged. Module's `LAYER1_SYSTEM_PROMPT` constant updated to match. Re-run pending. Candidate observation for the knowledge-gaps register (PR5 first-observation): Sonnet defaults to structured-object form for free-form annotation arrays unless the prompt's OUTPUT example explicitly shows string form.

- **2026-05-04 (second in-session amendment, Sub-session M1-CP1, post-harness re-run)** — second harness run: F4 passed; F1/F2/F3 failed with `passions_present[0].root_passion: undefined` because Sonnet used the key `root` (with `"root": "lupe"` etc.) instead of `root_passion`. Same root-cause class as the first amendment: the OUTPUT example used `[...]` placeholders for all seven category arrays, leaving Sonnet to guess per-entry JSON keys from the semantic bullet descriptions ("Root passion", "Sub-species") which it did inconsistently across fixtures. Per founder direction (Path A extension approved 2026-05-04), the OUTPUT example was replaced with one concrete entry per category showing exact JSON keys and enum values, plus an explicit instruction to "use the EXACT JSON keys shown above". Schema (§2) and validator (§6) unchanged. Module and ADR-005 §4 updated together. PR5 promotes the underlying observation from candidate to watch status (second recurrence within the same session): "the LLM produces JSON keys consistent with semantic bullet descriptions only when an explicit example shows the canonical keys; placeholder examples (`[...]`) leave field-name choice to the LLM and produce inconsistent keys across runs". Resolution: every category in the Layer 1 OUTPUT example now shows one concrete entry with exact keys and a representative enum value.

---

*End of ADR-005.*
