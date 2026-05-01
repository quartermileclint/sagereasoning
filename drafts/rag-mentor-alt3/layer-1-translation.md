# Deliverable 10 — Layer 1 Translation Specification

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — Claude is restricted to Layer 1 input translation; no Stoic inference originates from Claude); AC-13 (three-tier intake clarification — Tier 1 ELEMENT_FUSION fires from Layer 1 when translation is structurally impossible); R7 (source fidelity — Layer 1's controlled vocabulary is corpus-grounded); R8a (strict glossary in API responses); R8d (skill contracts — Layer 1's output schema is agent-callable).

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — the 9+1 mechanism taxonomy whose inputs Layer 1 produces)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary Layer 1 consumes; the false-judgement template Layer 1 prepares for)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules that read Layer 1's output)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9 — engine sequencing; Layer 1 runs once, before Position 1)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — the intake-tier dispatch Layer 1 may engage)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — surfaces where Layer 1 input shapes vary by consumer)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1 (model selection — Layer 1 uses Sonnet, not Haiku, due to multi-step reasoning), AC4 (invocation testing, applies to Phase-2 build), R7, R8a, R8d, R20a (Layer 1 runs after the R20a perimeter check, not as part of it)
- `/stoic-brain/passions.json` (passion taxonomy source)
- `/stoic-brain/value.json` (indifferents source)

---

## Plain-language summary

Layer 1 is the first of two narrow translation tasks Claude performs in the alt-3 architecture. It translates the practitioner's free-text narrative into a structured representation the deterministic engine can read. **No Stoic reasoning happens at Layer 1.** The translation produces structured features (entities the practitioner mentions, the temporal axis of their concern, the evaluative axis of how they perceive things, scope markers naming who is affected, target identifiers naming the action's target). The deterministic engine reads these features and applies the 10 operationalised rules; Claude is not asked to identify a passion, classify a virtue, or assess proximity. Those are the engine's work.

Layer 1's output is the input to D9's engine sequencing Position 1 (Rule 1 — `prohairesis_filter`). All 10 rules read Layer 1's output, sometimes augmented with Layer 1's interactive responses to Tier 1 force triggers (`ELEMENT_FUSION` / `SCOPE_AMBIGUITY` / `TEMPORAL_AMBIGUITY`).

The architectural commitment AC-12 names this translation as a *narrow* task: Claude does the linguistic work of feature extraction without the philosophical work of classification. The narrowness is the determinism guarantee — Stoic claims live in the rules and the corpus, not in Claude's training data.

## Glossary

- **Layer 1** — the first translation step. Free-text narrative → canonical Stoic feature representation.
- **Layer 2** — the deterministic engine (the 9+1 mechanisms operationalised as 10 rules per D8). Layer 1 produces input for Layer 2; Layer 2 produces input for Layer 3.
- **Layer 3** — the second translation step. Canonical engine output → conversational prose. Specified in Deliverable 11.
- **Entity** — an addressable noun in the practitioner's narrative (a person, an event, a judgement, an action, a possession). Each entity carries a type tag.
- **Temporal axis** — present vs future. Mechanism 2's 2×2 matrix consumes this.
- **Evaluative axis** — apparent good vs apparent evil. Mechanism 2's 2×2 matrix consumes this.
- **Scope marker** — a marker indicating which oikeiosis circle is engaged (self / family / community / humanity / cosmos). Mechanism 6 consumes this.
- **Target identifier** — the entity that is the action's target. Mechanism 6 also consumes this.
- **Controlled vocabulary** — the closed lists Layer 1 must use as labels: passion taxonomy from D3 (4 root passions, 20 sub-species, 3 eupatheiai); indifferents from value.json (preferred / dispreferred lists with axia levels).
- **ELEMENT_FUSION** — a Tier 1 force trigger Layer 1 fires when the practitioner's narrative cannot be cleanly decomposed into entities (the narrative fuses multiple concepts into a single phrase the engine cannot extract structured features from).
- **Empty schema with reason** — Layer 1's output when translation fails for a reason that is not a Tier 1 trigger (e.g., the input is too short, the input is in a language Claude cannot translate). Used by the route to return an error response rather than calling the engine on incomplete input.

## Layer 1's narrow scope

Layer 1 does **only** the following:

1. **Identify entities.** Extract every entity in the narrative (people, events, judgements, actions, possessions) and tag each with its type.
2. **Identify candidate temporal axes.** For each entity that the practitioner is reasoning about as if it mattered (a "scope-stake" entity), determine whether the practitioner's concern is present-oriented or future-oriented. Multi-axis narratives produce multi-axis output.
3. **Identify candidate evaluative axes.** For each scope-stake entity, determine whether the practitioner perceives it as an apparent good (worth pursuing / worth holding) or an apparent evil (worth fleeing / worth lamenting).
4. **Identify candidate scope markers.** Identify which oikeiosis circle(s) the narrative engages (self / family / community / humanity / cosmos).
5. **Identify candidate target identifiers.** Identify the action's target — who or what is on the receiving end of the practitioner's reasoning, decision, or action.
6. **Identify candidate indifferents at stake.** Map the narrative's mentions of indifferents to the controlled vocabulary from `value.json` (reputation, wealth, security, family, etc.), each tagged with axia level.
7. **Detect ELEMENT_FUSION.** When the narrative cannot be cleanly decomposed into entities, set `element_fusion_flag: true` and produce a clarification stem.

Layer 1 does **not**:

- Identify which passion is operative (Mechanism 2's job).
- Identify the sub-species of a passion (Mechanism 3's job).
- Identify the false judgement (Mechanism 5's job).
- Map entities to up_to_us / not_up_to_us (Mechanism 1's job — Layer 1's entity tags help, but the classification is the rule's).
- Assess proximity (Mechanism 10's job).
- Add any Stoic inference that the corpus does not provide.

The narrowness is the architectural commitment. AC-12 names it explicitly: *"Claude is restricted to Layer 1 (input translation) and Layer 3 (output translation). Layer 2 is the deterministic engine; no Stoic inference originates from Claude."*

## Input shape

Layer 1's input is the raw practitioner narrative as it arrives at the route, plus any optional context fields the consumer provides. Consumer-specific input shapes (per D24):

| Consumer route | Required input | Optional input |
|---|---|---|
| `/api/score` | `action` | `context`, `relationships`, `emotional_state`, `prior_feedback` |
| `/api/score-decision` | `decision`, `options[]` (2–5) | `context`, `process` |
| `/api/score-document` | `text` | `title`, `mode` (default / policy) |
| `/api/score-scenario` | `scenario`, `response`, `audience` | — |
| `/api/score-social` | `text`, `platform` | — |
| `/api/reason` | `input` | `context`, `domain_context`, `urgency_context`, `depth` |
| `/api/reflect` | `what_happened` | `how_i_responded`, `user_id` |
| `/api/mentor/private/reflect` | `what_happened` | `how_i_responded`, `bypass_pattern_cache` |

Layer 1's translation is the same across consumers, but the *primary input field* differs. The route is responsible for naming which field is the primary narrative; Layer 1 reads the primary narrative as its `narrative` input and reads other fields as `auxiliary_context` (joined into the prompt as supporting information rather than the primary text to translate).

For the decision-comparison consumer (`/api/score-decision`), Layer 1 runs **N times** — once per option — with `decision` as the framing context and each `option[i]` as the primary narrative. The output is N independent feature representations the engine consumes per option.

For all other consumers, Layer 1 runs once per request.

## Output schema

Layer 1 produces a structured JSON object that the deterministic engine reads at sequencing Position 1. The schema:

```
{
  "entities": [
    {
      "entity_id": "<stable identifier within this request — e.g., 'e1', 'e2'>",
      "type": "person | event | judgement | action | possession | feeling | abstraction",
      "description": "<the entity's identification in the practitioner's narrative>",
      "narrative_weight": "high | moderate | low",
      "is_scope_stake": <boolean — true if the practitioner is reasoning about this entity as if it mattered>
    },
    ...
  ],
  "temporal_axes": [
    {
      "entity_id": "<reference to entities[]>",
      "axis": "present | future | both",
      "evidence_phrase": "<the narrative phrase that supports this axis>"
    },
    ...
  ],
  "evaluative_axes": [
    {
      "entity_id": "<reference to entities[]>",
      "perception": "apparent_good | apparent_evil | neutral",
      "evidence_phrase": "<the narrative phrase that supports this perception>"
    },
    ...
  ],
  "scope_markers": [
    {
      "circle": 1 | 2 | 3 | 4 | 5,
      "engagement": "stated | operative_candidate | both",
      "evidence_phrase": "<the narrative phrase that supports this engagement>"
    },
    ...
  ],
  "target_identifiers": [
    {
      "entity_id": "<reference to entities[]>",
      "role": "primary | secondary | bystander",
      "evidence_phrase": "<the narrative phrase that supports this role>"
    },
    ...
  ],
  "indifferents_at_stake": [
    {
      "indifferent_id": "<from value.json controlled vocabulary>",
      "axia_class": "high | moderate | low | high-negative | moderate-negative | low-negative",
      "evidence_phrase": "<the narrative phrase that supports this indifferent identification>"
    },
    ...
  ],
  "element_fusion_flag": <boolean>,
  "fusion_clarification_stem": "<question text — present only if element_fusion_flag is true>",
  "translation_quality": {
    "coverage": "complete | partial | thin",
    "entities_count": <integer>,
    "auxiliary_context_consumed": <boolean>,
    "controlled_vocabulary_strict": <boolean>
  }
}
```

### Field semantics

- **`entities[]`** — the addressable nouns. Each entity has a stable ID (used by downstream rules to reference the entity), a type tag, the practitioner's description, narrative weight, and a flag indicating whether the entity is a scope-stake.
- **`temporal_axes[]`** — per scope-stake entity, the temporal axis. Multi-axis narratives produce multiple entries (e.g., the same entity may have axis: both if the practitioner is reasoning about it across present and future). The `evidence_phrase` is the narrative phrase that supports the classification — Mechanism 2 reads this for the 2×2 matrix.
- **`evaluative_axes[]`** — per scope-stake entity, the evaluative axis. `neutral` is allowed for entities the practitioner mentions without perceiving as good or evil.
- **`scope_markers[]`** — which oikeiosis circle(s) the narrative engages. `engagement: stated` means the practitioner explicitly names the circle; `engagement: operative_candidate` means the narrative's operative concern points at the circle (Mechanism 6 may classify it as the operative circle); `engagement: both` means both stated and operative (the narrative names the circle and operates from it).
- **`target_identifiers[]`** — who is on the receiving end. Multiple targets may exist (e.g., a decision affecting both family and community has two primary targets).
- **`indifferents_at_stake[]`** — the controlled vocabulary from `value.json`. Layer 1 maps narrative mentions of "reputation," "money," "the team," "my health" to the canonical indifferent IDs and their axia classes.
- **`element_fusion_flag`** + **`fusion_clarification_stem`** — Tier 1 force trigger surface. When fusion is detected, the route halts execution and surfaces the stem to the practitioner.
- **`translation_quality`** — meta-fields for diagnostic and verification. `coverage: thin` indicates the input was short or low-content (Mechanism 1 may still proceed; Mechanism 10's `CONFIDENCE_WEIGHTED` will weight the result low).

## Controlled vocabulary

Layer 1's translation must use closed lists for these fields. Out-of-vocabulary values are rejected by the schema validator at the route layer.

### Passion taxonomy (from D3)

Layer 1 does **not** classify passions (that is Mechanism 2's job). But Layer 1 *may* surface candidate-passion vocabulary in entity descriptions when the practitioner uses passion-flavoured language. The controlled vocabulary for entity descriptions tagged as `type: feeling` is the union of:

- 4 root passions: `epithumia`, `hedone`, `phobos`, `lupe`.
- 20 sub-species: per D3's tables (6 epithumia, 3 hedone, 6 phobos, 5 lupe).
- 3 eupatheiai: `chara`, `boulesis`, `eulabeia`.

When the practitioner says "I felt anger" or "I felt anxious," Layer 1 may translate the feeling entity with the canonical sub-species ID (`orge`, `agonia`) in the description. Mechanism 2 still verifies the classification against the 2×2 matrix; Layer 1's translation is a hint, not a classification.

### Indifferents (from `value.json`)

Layer 1 maps narrative mentions of indifferents to the canonical IDs in `value.json`. Layer 1's prompt includes the canonical list (preferred / dispreferred with axia levels). When the practitioner mentions "my reputation," Layer 1 produces `indifferent_id: reputation` with the axia class from value.json.

The exact list per `value.json` (under `preferred_indifferents[]` and `dispreferred_indifferents[]`) is the closed list. Layer 1's prompt includes the list as the controlled vocabulary; out-of-vocabulary indifferents are rejected (the practitioner is presumably mentioning something the corpus does not yet cover — D-A10 corpus expansion candidate).

### Entity types

The closed list of entity types: `person`, `event`, `judgement`, `action`, `possession`, `feeling`, `abstraction`. Each tag corresponds to how the rules consume the entity:
- Mechanism 1 reads `judgement`, `action`, `feeling` as candidates for `prohairesis_scope` (judgements, impulses, assent are eph' hemin); reads `person`, `event`, `possession`, `abstraction` as candidates for `external_scope`.
- Mechanism 6 reads `person` entities as candidates for circle classification.

### Oikeiosis circles

The closed list: `1` (self), `2` (family / household), `3` (community), `4` (humanity), `5` (cosmos). Layer 1 maps narrative scope language to these IDs.

## Prompt template

Layer 1's prompt is structured to keep Claude's task narrow. The prompt has three sections: role narrowing, controlled-vocabulary specification, and output format constraint.

```
[SYSTEM BLOCK — cached]

You are a structural feature extractor for the SageReasoning deterministic
reasoning engine. Your task is narrow: read the practitioner's narrative and
extract structured features the engine consumes.

You DO NOT:
- Identify which passion is operative (the engine does this).
- Identify the false judgement (the engine does this).
- Assess virtue, proximity, or kathekon quality (the engine does this).
- Add any Stoic inference beyond what the practitioner has named.

You DO:
- Identify the entities (people, events, judgements, actions, possessions,
  feelings, abstractions) in the narrative.
- Tag each entity with type, description, narrative weight, and scope-stake flag.
- Identify the temporal axis (present / future / both) for each scope-stake entity.
- Identify the evaluative axis (apparent_good / apparent_evil / neutral) for each.
- Identify the oikeiosis circle(s) engaged (1 self / 2 family / 3 community /
  4 humanity / 5 cosmos), naming whether each circle is stated, operative
  candidate, or both.
- Identify the action's target(s).
- Identify which indifferents are at stake from the controlled vocabulary below.
- Detect ELEMENT_FUSION when the narrative cannot be decomposed into entities.

CONTROLLED VOCABULARY (use these exact identifiers — out-of-vocabulary values
will be rejected):

Entity types: person, event, judgement, action, possession, feeling, abstraction.

Passion sub-species (only when the practitioner uses passion-flavoured language;
otherwise leave feeling entities with descriptive English):
{insert D3's 20 sub-species + 3 eupatheiai list here, with one-line glosses}

Indifferents:
{insert value.json's preferred_indifferents[] + dispreferred_indifferents[] with
axia levels here}

Oikeiosis circles: 1, 2, 3, 4, 5.

OUTPUT FORMAT — return ONLY valid JSON matching this schema:
{insert the output schema from §"Output schema" above}

Return no prose. Return no commentary. Return only the JSON object.

If the narrative cannot be decomposed (multiple distinct concepts fused into a
single phrase), set element_fusion_flag: true and provide a fusion_clarification_stem
(a one-sentence question that asks the practitioner to separate the fused
concepts). Example fusion: "I want this conversation to land well and not blow
up everything we've been working on" — the practitioner has fused three
distinct concerns (the conversation, the relationship, the work). The stem might
be: "Before I work through this with you — can you tell me which one of these
is most centrally on your mind: the conversation itself, the relationship with
the person, or the work you've been building together?"

[END SYSTEM BLOCK]

[USER MESSAGE]

Narrative: {practitioner_narrative}

{auxiliary_context — present only if the consumer provided auxiliary fields}

Translate this narrative to structured features per the schema.

[END USER MESSAGE]
```

### Cache discipline

Per AC6 (four-layer context architecture), the system block carries cached content (the prompt template + the controlled vocabulary lists). The user message carries per-request content (the practitioner narrative). This honours KG6 (composition order) — system blocks for cached expertise; user message for per-request input.

### Model selection

Per AC1 / KG2, Layer 1 uses **Sonnet**, not Haiku. Layer 1's task involves multi-step reasoning (entity decomposition, scope identification across multiple circles, temporal/evaluative axis assignment for each scope-stake entity) and produces structurally complex JSON. Haiku's reliability boundary (single-mechanism, short-output, simple-JSON) is not met. Sonnet at standard temperature (0.2 — low temperature for deterministic translation) is the canonical model.

### Output validation

The route validates Layer 1's JSON output against the schema before passing to the engine. Validation steps:
1. JSON is parseable.
2. Required fields present (`entities[]` non-empty unless `element_fusion_flag: true`).
3. All entity types from the closed list.
4. All passion / indifferent / oikeiosis IDs from the closed lists.
5. All `entity_id` references in `temporal_axes[]`, `evaluative_axes[]`, `target_identifiers[]` resolve to entries in `entities[]`.

Validation failure surfaces as an `empty schema with reason` response rather than calling the engine on invalid input. See §"Error / uncertainty handling" below.

## Error / uncertainty handling

Layer 1 has three failure modes, each with a defined response shape.

### Failure mode 1 — ELEMENT_FUSION (Tier 1 force trigger)

Layer 1 detects that the narrative fuses multiple distinct concerns into a single phrase that cannot be decomposed into entities. The practitioner has not given the engine the structural information it needs.

**Response:** Layer 1 sets `element_fusion_flag: true`, provides a `fusion_clarification_stem`, and otherwise produces a thin output (entities[] may be empty or partially populated).

**Engine-level effect:** The route halts engine execution. The clarification stem surfaces to the practitioner via the consumer's response shape (per D11 Layer 3 specification — `clarification_required: true` payload). The practitioner provides clarification; the route re-invokes Layer 1 with the augmented narrative; if `element_fusion_flag` is now false, the engine proceeds.

### Failure mode 2 — Empty schema with reason

Layer 1 cannot translate cleanly for a reason that is not ELEMENT_FUSION. Examples: input too short to contain entities; input is in a language Claude cannot interpret; input is structurally degenerate (e.g., a single unintelligible token).

**Response:** Layer 1 produces an empty schema with a non-null `translation_quality.coverage: thin` and a diagnostic note in `fusion_clarification_stem` describing the failure (e.g., "The narrative contains too little content to extract features. Can you say more about what happened and what you noticed?").

**Engine-level effect:** The route returns a 400 response with the diagnostic note. The engine does not run. The practitioner can re-submit with augmented narrative.

### Failure mode 3 — Validation failure

Layer 1's JSON fails route-side schema validation (parse failure, out-of-vocabulary values, dangling entity_id references).

**Response:** The route logs the validation failure (full LLM response captured in the log per the existing pattern in `/api/mentor/private/reflect`'s parse-failure handler), and returns a 503 response indicating intermittent translation failure. The route does not return Layer 1's malformed output to the engine.

**Engine-level effect:** None (engine does not run). The route's response signals the practitioner to retry; the practitioner's retry typically resolves the failure (Sonnet's structured-output reliability is high on this prompt shape, so validation failures are intermittent — not systematic).

### Distinction from R20a vulnerable-user detection

The R20a perimeter check (`enforceDistressCheck(detectDistressTwoStage(...))`) runs at the route, **before** Layer 1. Distress-redirect responses do not engage Layer 1. Per AC2, the two-stage classifier runs in 500ms for borderline inputs — well before any LLM call. Layer 1's three failure modes above are independent of the R20a perimeter and do not engage distress detection.

This is consistent with PR3 (safety systems are synchronous) — R20a runs synchronously before Layer 1's LLM call. Layer 1 cannot suppress an R20a flag; the gate fires before Layer 1 has the chance.

## Worked examples (drawn from named anchor patterns)

Each example shows the practitioner narrative, the auxiliary context (if any), Layer 1's output, and a brief explanation of the translation.

### Example A — Philodoxia at synkatathesis (`/api/score` consumer)

**Practitioner narrative (`action` field):** *"I really want this conversation tomorrow with Sarah to land well — that she walks away thinking I handled it competently. I keep rehearsing the opening lines."*

**Auxiliary context (`relationships`):** *"Sarah is my colleague — we lead adjacent teams."*

**Layer 1 output:**
```
{
  "entities": [
    { "entity_id": "e1", "type": "event", "description": "the conversation tomorrow", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e2", "type": "person", "description": "Sarah (colleague leading adjacent team)", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e3", "type": "judgement", "description": "I want her to think I handled it competently", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e4", "type": "action", "description": "rehearsing the opening lines", "narrative_weight": "moderate", "is_scope_stake": false }
  ],
  "temporal_axes": [
    { "entity_id": "e1", "axis": "future", "evidence_phrase": "tomorrow" },
    { "entity_id": "e3", "axis": "future", "evidence_phrase": "I really want this... to land well" }
  ],
  "evaluative_axes": [
    { "entity_id": "e3", "perception": "apparent_good", "evidence_phrase": "I really want... she walks away thinking I handled it competently" }
  ],
  "scope_markers": [
    { "circle": 1, "engagement": "operative_candidate", "evidence_phrase": "I want her to think I handled it competently" },
    { "circle": 2, "engagement": "stated", "evidence_phrase": "conversation tomorrow with Sarah" }
  ],
  "target_identifiers": [
    { "entity_id": "e2", "role": "primary", "evidence_phrase": "the conversation tomorrow with Sarah" }
  ],
  "indifferents_at_stake": [
    { "indifferent_id": "reputation", "axia_class": "moderate", "evidence_phrase": "she walks away thinking I handled it competently" }
  ],
  "element_fusion_flag": false,
  "translation_quality": {
    "coverage": "complete",
    "entities_count": 4,
    "auxiliary_context_consumed": true,
    "controlled_vocabulary_strict": true
  }
}
```

**Translation explanation:** Layer 1 extracts four entities (the event, the person, the judgement about her opinion, the rehearsal action). The judgement entity (e3) is the load-bearing scope-stake — its temporal axis is future, its evaluative axis is apparent_good, and the indifferent at stake is reputation. The scope markers note that Circle 2 (family / household — colleague is adjacent in the social fabric) is stated, but Circle 1 (self) is the operative candidate (the operative concern is the practitioner's own reputation). Mechanism 2 reads this and detects `epithumia` (future apparent_good) on the reputation entity; Mechanism 3 maps to `philodoxia`; Mechanism 6 confirms `oikeiosis_contraction: true`. Layer 1 has not made any of those classifications — it has produced the structural features that let the engine make them deterministically.

### Example B — Orge with children (`/api/score` consumer)

**Practitioner narrative (`action` field):** *"I snapped at my son tonight when he wouldn't put down the iPad and come to dinner. I knew I shouldn't react that strongly but I did anyway."*

**Layer 1 output:**
```
{
  "entities": [
    { "entity_id": "e1", "type": "person", "description": "my son", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e2", "type": "event", "description": "he wouldn't put down the iPad and come to dinner", "narrative_weight": "high", "is_scope_stake": false },
    { "entity_id": "e3", "type": "feeling", "description": "I snapped (orge — anger)", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e4", "type": "judgement", "description": "I knew I shouldn't react that strongly", "narrative_weight": "moderate", "is_scope_stake": true },
    { "entity_id": "e5", "type": "action", "description": "reacting strongly anyway (the snap)", "narrative_weight": "high", "is_scope_stake": true }
  ],
  "temporal_axes": [
    { "entity_id": "e3", "axis": "present", "evidence_phrase": "I snapped at my son tonight" },
    { "entity_id": "e4", "axis": "present", "evidence_phrase": "I knew I shouldn't" },
    { "entity_id": "e5", "axis": "present", "evidence_phrase": "I did anyway" }
  ],
  "evaluative_axes": [
    { "entity_id": "e3", "perception": "apparent_evil", "evidence_phrase": "I knew I shouldn't react that strongly" }
  ],
  "scope_markers": [
    { "circle": 2, "engagement": "both", "evidence_phrase": "my son... at dinner" }
  ],
  "target_identifiers": [
    { "entity_id": "e1", "role": "primary", "evidence_phrase": "I snapped at my son" }
  ],
  "indifferents_at_stake": [],
  "element_fusion_flag": false,
  "translation_quality": {
    "coverage": "complete",
    "entities_count": 5,
    "auxiliary_context_consumed": false,
    "controlled_vocabulary_strict": true
  }
}
```

**Translation explanation:** The feeling entity (e3) is tagged with the canonical sub-species `orge` since the practitioner uses anger-flavoured language ("snapped"). The judgement entity (e4) is the meta-judgement that the response was inappropriate. The action entity (e5) is the impulse that exceeded due measure. The scope marker is Circle 2 (family). The indifferents list is empty — no preferred / dispreferred indifferent is at stake (compliance is not in `value.json`'s indifferents list; the false judgement that compliance is a genuine good is what Mechanism 5 will surface, but Layer 1 does not classify the judgement). Mechanism 4 reads e3 and e4 together — the present perception of the feeling as apparent_evil (from e4's "I shouldn't have") indicates the practitioner judged correctly but the impulse exceeded due measure, locating the breakdown at `horme` rather than `synkatathesis`.

### Example C — Six consecutive procedural reports (`/api/mentor/private/reflect` consumer)

**Practitioner narrative (`what_happened` field):** *"Today I shipped the migration, hit the deadline, and got the metrics dashboard done."*

**Layer 1 output:**
```
{
  "entities": [
    { "entity_id": "e1", "type": "action", "description": "shipped the migration", "narrative_weight": "moderate", "is_scope_stake": false },
    { "entity_id": "e2", "type": "event", "description": "hit the deadline", "narrative_weight": "moderate", "is_scope_stake": false },
    { "entity_id": "e3", "type": "action", "description": "got the metrics dashboard done", "narrative_weight": "moderate", "is_scope_stake": false }
  ],
  "temporal_axes": [],
  "evaluative_axes": [],
  "scope_markers": [
    { "circle": 1, "engagement": "stated", "evidence_phrase": "(implicit — narrative is self-focused)" }
  ],
  "target_identifiers": [],
  "indifferents_at_stake": [],
  "element_fusion_flag": false,
  "translation_quality": {
    "coverage": "thin",
    "entities_count": 3,
    "auxiliary_context_consumed": false,
    "controlled_vocabulary_strict": true
  }
}
```

**Translation explanation:** Layer 1 produces a thin but complete output. Three actions, no scope-stake (the practitioner narrates the actions without revealing reasoning, motivation, or felt experience). No temporal_axes / evaluative_axes — there is no scope-stake entity to assign axes to. No indifferents — the practitioner has not explicitly named any at stake. `coverage: thin` flags that the engine will produce limited diagnostic output: Mechanisms 2-5 may detect no passion (because the narrative does not contain passion-shaped content); Mechanism 10's longitudinal projection will detect the *pattern* across instances ("six consecutive procedural reports") and surface `proximity_risk_flag: THEORETICAL_ONLY`. Layer 1 has not made that pattern classification — Mechanism 10 reads the longitudinal record and classifies. Layer 1's contribution is the honest "thin coverage" flag.

### Example D — The bus story (`/api/mentor/private/reflect` consumer)

**Practitioner narrative (`what_happened` field):** *"I was running late this morning and got stuck behind a bus for fifteen minutes. By the time I got to the office I was furious — I missed the standup, my whole day felt poisoned."*

**Auxiliary context (`how_i_responded`):** *"I tried to shake it off but the irritation lasted until lunch."*

**Layer 1 output:**
```
{
  "entities": [
    { "entity_id": "e1", "type": "event", "description": "stuck behind a bus for fifteen minutes", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e2", "type": "event", "description": "missed the standup", "narrative_weight": "moderate", "is_scope_stake": true },
    { "entity_id": "e3", "type": "feeling", "description": "I was furious (orge / lupe — anger / distress)", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e4", "type": "abstraction", "description": "my whole day felt poisoned", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e5", "type": "feeling", "description": "irritation lasted until lunch", "narrative_weight": "moderate", "is_scope_stake": true }
  ],
  "temporal_axes": [
    { "entity_id": "e1", "axis": "present", "evidence_phrase": "this morning" },
    { "entity_id": "e3", "axis": "present", "evidence_phrase": "By the time I got to the office I was furious" },
    { "entity_id": "e4", "axis": "present", "evidence_phrase": "my whole day felt poisoned" },
    { "entity_id": "e5", "axis": "present", "evidence_phrase": "the irritation lasted until lunch" }
  ],
  "evaluative_axes": [
    { "entity_id": "e1", "perception": "apparent_evil", "evidence_phrase": "I was furious" },
    { "entity_id": "e2", "perception": "apparent_evil", "evidence_phrase": "missed the standup" },
    { "entity_id": "e4", "perception": "apparent_evil", "evidence_phrase": "felt poisoned" }
  ],
  "scope_markers": [
    { "circle": 1, "engagement": "operative_candidate", "evidence_phrase": "my whole day felt poisoned" }
  ],
  "target_identifiers": [],
  "indifferents_at_stake": [
    { "indifferent_id": "time", "axia_class": "moderate", "evidence_phrase": "running late... fifteen minutes... missed the standup" }
  ],
  "element_fusion_flag": false,
  "translation_quality": {
    "coverage": "complete",
    "entities_count": 5,
    "auxiliary_context_consumed": true,
    "controlled_vocabulary_strict": true
  }
}
```

**Translation explanation:** The bus event (e1) and the missed-standup event (e2) are present apparent_evils. The feeling entities (e3, e5) are tagged with candidate sub-species (`orge` / `lupe` — Layer 1 surfaces both because the narrative could plausibly support either, and Mechanism 2 will disambiguate). The abstraction (e4) — "my whole day felt poisoned" — is itself a strong scope-stake, indicating the practitioner has *judged* the day as a genuine evil based on the morning's events. The indifferent at stake is time (a preferred indifferent at moderate axia). Mechanism 1 will note that the bus is in `external_scope` (not eph' hemin) and the practitioner's anger is a `CONTROL_INFLATION` shape (the anger treats the external as if it should be otherwise). Mechanism 8 will note the `INFLATION` of time/punctuality to genuine-good status (or `DEFLATION` of being late to genuine-evil status). Mechanism 5 will produce the false judgement: "the late bus is a genuine evil for me." Layer 1 has not made any of these classifications — it has produced the features that let the engine make them.

### Example E — Agonia in catastrophising (`/api/score-decision` consumer, single option)

**Practitioner decision framing:** *"Should I post the launch announcement publicly tomorrow, or wait another week?"*

**Practitioner option:** *"Post tomorrow as planned. But — what if it goes wrong? What if no one engages, or what if the wrong people engage and tear it apart? I keep running through the worst cases."*

**Layer 1 output (for this option):**
```
{
  "entities": [
    { "entity_id": "e1", "type": "action", "description": "post the launch announcement tomorrow", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e2", "type": "event", "description": "no one engages", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e3", "type": "event", "description": "the wrong people engage and tear it apart", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e4", "type": "action", "description": "running through the worst cases", "narrative_weight": "high", "is_scope_stake": false },
    { "entity_id": "e5", "type": "feeling", "description": "anticipated dread (agonia)", "narrative_weight": "high", "is_scope_stake": true }
  ],
  "temporal_axes": [
    { "entity_id": "e1", "axis": "future", "evidence_phrase": "tomorrow" },
    { "entity_id": "e2", "axis": "future", "evidence_phrase": "what if no one engages" },
    { "entity_id": "e3", "axis": "future", "evidence_phrase": "what if the wrong people engage" },
    { "entity_id": "e5", "axis": "future", "evidence_phrase": "I keep running through the worst cases" }
  ],
  "evaluative_axes": [
    { "entity_id": "e2", "perception": "apparent_evil", "evidence_phrase": "what if no one engages" },
    { "entity_id": "e3", "perception": "apparent_evil", "evidence_phrase": "tear it apart" },
    { "entity_id": "e5", "perception": "apparent_evil", "evidence_phrase": "the worst cases" }
  ],
  "scope_markers": [
    { "circle": 1, "engagement": "operative_candidate", "evidence_phrase": "(implicit — the dread is about the practitioner's standing in response)" },
    { "circle": 3, "engagement": "stated", "evidence_phrase": "post... publicly" }
  ],
  "target_identifiers": [
    { "entity_id": "e1", "role": "primary", "evidence_phrase": "post the launch announcement" }
  ],
  "indifferents_at_stake": [
    { "indifferent_id": "reputation", "axia_class": "moderate", "evidence_phrase": "what if the wrong people... tear it apart" }
  ],
  "element_fusion_flag": false,
  "translation_quality": {
    "coverage": "complete",
    "entities_count": 5,
    "auxiliary_context_consumed": false,
    "controlled_vocabulary_strict": true
  }
}
```

**Translation explanation:** All scope-stake entities are future-oriented and apparent_evil — the canonical agonia signature. The feeling entity (e5) is tagged with `agonia`. The scope markers note `oikeiosis_contraction: true`-shaped pattern (Circle 3 stated; Circle 1 operative). The indifferent at stake is reputation. Mechanism 2 will detect `phobos` (future apparent_evil); Mechanism 3 will map to `agonia`; Mechanism 4 will locate the breakdown at `phantasia` (the practitioner is rehearsing the worst-case impressions, not yet assenting to them as true — but the rehearsal itself is producing the agonia pattern). The compound `agonia + philodoxia` may surface in Mechanism 3 if the engine identifies the underlying philodoxia from the audit-of-public-reception structure; Layer 1's translation supports this (the reputation indifferent is named, the operative-Circle-1 contraction is named).

### Example F — ELEMENT_FUSION (any consumer)

**Practitioner narrative:** *"This whole thing with work and the family and what's been going on with my parents and the way the town meeting went — I'm just done."*

**Layer 1 output:**
```
{
  "entities": [
    { "entity_id": "e1", "type": "abstraction", "description": "the whole thing with work", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e2", "type": "abstraction", "description": "the family situation", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e3", "type": "abstraction", "description": "what's been going on with my parents", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e4", "type": "event", "description": "the town meeting", "narrative_weight": "high", "is_scope_stake": true },
    { "entity_id": "e5", "type": "feeling", "description": "I'm just done", "narrative_weight": "high", "is_scope_stake": true }
  ],
  "temporal_axes": [
    { "entity_id": "e5", "axis": "present", "evidence_phrase": "I'm just done" }
  ],
  "evaluative_axes": [
    { "entity_id": "e5", "perception": "apparent_evil", "evidence_phrase": "I'm just done" }
  ],
  "scope_markers": [
    { "circle": 2, "engagement": "stated", "evidence_phrase": "the family... my parents" },
    { "circle": 3, "engagement": "stated", "evidence_phrase": "the town meeting" }
  ],
  "target_identifiers": [],
  "indifferents_at_stake": [],
  "element_fusion_flag": true,
  "fusion_clarification_stem": "There are several distinct concerns here — work, family, your parents, and the town meeting. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?",
  "translation_quality": {
    "coverage": "partial",
    "entities_count": 5,
    "auxiliary_context_consumed": false,
    "controlled_vocabulary_strict": true
  }
}
```

**Translation explanation:** Layer 1 successfully extracts entities but cannot identify the temporal/evaluative axes or scope-stake structure for the four distinct concerns — they are fused as a single felt-overwhelm narrative rather than decomposed into a specific situation the engine can score. `element_fusion_flag: true` halts engine execution. The fusion stem is structurally a Tier 1 force question — it asks the practitioner to separate the fused concerns. After clarification, Layer 1 re-runs with the augmented narrative; the engine proceeds.

## Cleanliness rating

Layer 1 is **PARTIAL cleanliness**:

- The structural extraction (entity decomposition, axis tagging, scope marker identification, target identification, indifferent mapping) is **HIGH** — Sonnet at low temperature reliably produces the structural features when the narrative is decomposable.
- The `is_scope_stake` flag and `narrative_weight` assignment are **PARTIAL** — Layer 1 must judge which entities the practitioner is reasoning about as if they mattered and which they mention in passing. The judgement is bounded (high / moderate / low; boolean) and is not Stoic inference (it is linguistic salience), but it is not strictly deterministic.
- The candidate-passion vocabulary use in feeling entity descriptions is **PARTIAL** — Layer 1 surfaces a candidate sub-species when the practitioner uses passion-flavoured language, but Mechanism 2 verifies. Layer 1 may surface a candidate that Mechanism 2 rejects.
- The ELEMENT_FUSION detection is **PARTIAL** — the threshold for "cannot be decomposed" is not strictly defined; Layer 1 must judge when a narrative is too fused to extract entities cleanly. The mitigation is the explicit bounded vocabulary (entity types, scope markers) — when Layer 1 cannot fit the narrative into the bounded vocabulary, that is the operational signal that fusion is present.

The PARTIAL ratings reflect Layer 1's narrow but non-zero interpretive role. The architecture's commitment is that Layer 1 does *no Stoic inference* — it does linguistic-structural feature extraction. The partial seams above are linguistic, not philosophical.

## R6 / R7 / R8 compliance

- **R6 (methodology-first derivation):** Layer 1's output schema is derived from the canonical mechanism inputs (D2 + D8). It does not inherit V1 / V2 structures.
- **R7 (source fidelity):** Layer 1's controlled vocabulary is corpus-grounded (D3 passion taxonomy from `passions.json`; indifferents from `value.json`; oikeiosis circles from `action.json`). Layer 1 does not introduce new Stoic content.
- **R8a (strict glossary in API responses):** the schema's controlled-vocabulary fields use Greek IDs as primary identifiers (`epithumia`, `philodoxia`, `agonia`).
- **R8d (skill contracts — agent-facing):** Layer 1's output schema is part of the agent-facing API contract. Agent callers (per `/api/reason` Flow 3 in D24) consume structured Layer 1 output via the engine envelope. The schema's English descriptions (entity descriptions, evidence phrases) are outcome-focused per R8d.
- **R20a (vulnerable user detection):** Layer 1 runs **after** the R20a gate. Layer 1 cannot suppress R20a. Per AC2, R20a runs synchronously before any LLM call, including Layer 1's Sonnet call.

## Open questions

1. **Should the entity types list expand?** Today's seven types (person, event, judgement, action, possession, feeling, abstraction) cover the named anchor patterns. Phase-2 production may surface narratives where additional types help (e.g., `commitment`, `relationship`). Logged for post-launch observation.
2. **How aggressive should ELEMENT_FUSION detection be?** The clarification stem is operationally valuable when fusion is severe but adds friction when fusion is mild. The architecture exercise's named anchor patterns suggest mild fusion is common (most narratives carry adjacent concerns). The conservative default is to fire ELEMENT_FUSION only when the narrative cannot be decomposed at all — i.e., when entity extraction itself fails. Mild fusion (multiple decomposable but interrelated concerns) is left for Tier 2 STATED_OPERATIVE_CONFLICT (per D13) rather than Tier 1.
3. **Does the candidate-passion vocabulary in feeling entity descriptions belong at Layer 1, or only at Mechanism 2?** The architecture's narrowness commitment suggests Layer 1 should surface only the practitioner's language ("I felt anger"), not the canonical sub-species ("orge"). The current specification allows Layer 1 to surface candidate sub-species when the practitioner's language clearly maps. The trade-off: Mechanism 2 still verifies, so Layer 1 surfacing a candidate is harmless if Mechanism 2 disagrees. Logged for Phase-2 observation — if Mechanism 2 frequently disagrees with Layer 1's candidate, Layer 1 should be tightened to surface only the practitioner's language.

## Approval gate

This deliverable is consumed by Phase-2 build (the Layer 1 implementation). Approval is part of the same batch as the other Phase-1 session 2 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/` is Elevated risk and requires its own decision-log entry.

---

*End of Deliverable 10.*
