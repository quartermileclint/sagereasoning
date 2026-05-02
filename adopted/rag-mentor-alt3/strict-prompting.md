# Deliverable 12 — Strict Inclusion + Exclusion Design

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-5 (strict prompting — inclusion + exclusion); AC-6 (four-layer context architecture — system block carries cached rules; user message carries per-request engine output); AC-10 (constrained slot-filled focus questions: corpus stem + LLM situational variables only); AC-12 (translation-sandwich — Layer 3 paraphrases the engine output without adding Stoic inference); AC-17 (residual seams surfaced explicitly); AC-18 (no-shareable-artifact at deferral-resolution surface — strict prompt enforces NULL output for Table 4b consumer); R7 (source fidelity); R8a–R8d (audience-tier glossary); R20d (relationship asymmetry — invitation-language).

**Cross-references:**
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — specifies the inclusion / exclusion rules this deliverable packages into a prompt template)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — provides the question stems Layer 3 slot-fills)
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — Tables 1, 2, 4a, 4b, 5 — per-consumer projection rules)
- `/adopted/rag-mentor-alt3/passion-taxonomy.md` (D3 — controlled vocabulary for prose)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose outputs Layer 3 paraphrases)
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — the audience-tier tags Layer 3 reads on retrieved passages)
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — Layer 3 reads retrieved passages from this interface for citation purposes only)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — the conversation-surface response shape this prompt supports)
- `/drafts/rag-mentor-alt3/verification.md` (D18 — purity verification that this prompt is honoured at runtime)
- `/drafts/rag-mentor-alt3/residual-seams.md` (D19 — AC-17 flag prose projection rules)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1 (model selection — Layer 3 uses Sonnet), AC5 (strict prompting), AC6 (four-layer context — system block placement), R7, R8a–R8d, R20d
- `/operations/knowledge-gaps.md` KG6 (composition order — system block for cached prose-translation rules; user message for per-request engine output)

---

## Plain-language summary

D11 names what Layer 3's prose **must include** (paraphrases of every populated upstream rule output) and what Layer 3's prose **must not include** (Stoic inference originating from Claude; passions the engine didn't detect; second-person attribution; AC-17 flag suppression). D11 also names the slot-fill mechanics for focus questions and the per-consumer projection rules.

This deliverable consolidates D11's rules into a single **paraphrase prompt template** that Layer 3 receives at runtime. The template has two parts: a **system block** (cached, per AC-6) carrying the inclusion rules, exclusion rules, controlled vocabulary, and per-consumer projection schema; and a **user message** (per-request) carrying the specific engine output to paraphrase plus the consumer identifier.

The template is not a new design layer — it is the runtime expression of D11's specification. Building it as a separate deliverable serves two purposes: (a) Phase-2 build implements the template once and re-uses it across consumers; (b) the verification work (D18) has a single artefact to verify Layer 3's prose against (the prose must trace to the engine output the user message carried, not to anything else).

The deliverable also specifies how the slot-fill mechanics from D11 are materialised in the prompt (what variables the LLM sees; how the slot-fields[] array constrains the fill) and how the trigger-stem retrieval from D13 flows into Layer 3 through this prompt.

## Glossary

- **Inclusion clause** — the section of the prompt's system block that names what the prose must include. Maps to D11 §"Inclusion (what the prose must include)".
- **Exclusion clause** — the section of the prompt's system block that names what the prose must not include. Maps to D11 §"Exclusion (what the prose must not include)".
- **Slot-fill mechanics** — the rules for filling `[VARIABLE]` placeholders in focus-question stems with situational values. Specified in D11 §"Slot-fill mechanics for focus questions" and in D13 §"slot_fields".
- **Paraphrase template** — the cached system block that carries the prompt structure shared across all Layer 3 calls.
- **Consumer-specific projection** — the per-consumer rules from D2 Tables 1, 2, 4a, 4b, 5 that determine the output schema for the specific calling consumer. Per D11, the projection rules live in the system block but vary by consumer.
- **Per-request engine output** — the structured output from the deterministic engine (the 10 mechanism outputs plus diagnostics) that Layer 3 paraphrases. Lives in the user message per AC-6.
- **AC-17 flag projection** — the rules for surfacing `SELF_REPORT_DEPENDENT` and `CONFIDENCE_WEIGHTED` in prose. Specified in D19.

## The architectural commitment

Per AC-12, **no Stoic inference originates from Claude**. The strict prompting commitment specifies how this is operationalised:

1. **Every Stoic claim in the prose must trace to a specific upstream mechanism output.** If the prose says "philodoxia is operating," the engine must have produced `passions_detected[].sub_species: philodoxia`. The trace is verifiable per D18.
2. **The prose may compose** — Layer 3 may write a one-paragraph philosophical_reflection that synthesises Mechanisms 1, 2, 3, 6, 9 outputs into a single coherent narrative — but the synthesis is paraphrase, not synthesis-with-additional-content. Each sentence in the paragraph traces upstream.
3. **The slot-fill is bounded.** Layer 3 fills variables in canonical stems with values from Layer 1's output or the engine's output. Layer 3 does not compose the stem; the stem comes from the corpus catalogue (post-D-A16) or from alt-3-derived patterns (pre-promotion).
4. **The exclusions are non-negotiable.** Layer 3 cannot suppress AC-17 flags, cannot apply second-person passion attribution, cannot produce visible output on the deferral-resolution surface (AC-18 holds).

The strict prompting is the line between "the engine reasons; Claude translates" and "Claude reasons too." The prompt template enforces the line at runtime.

## The paraphrase prompt template

The template has a **system block** (cached per AC-6 / KG6) and a **user message** (per-request).

### System block — cached

```
[SYSTEM BLOCK — cached]

ROLE

You are the structural prose translator for the SageReasoning deterministic
reasoning engine. The deterministic engine has produced a structured
evaluation of the practitioner's narrative; your task is to translate the
engine's structured output into the prose that the practitioner reads
on the consumer surface that called the engine.

CRITICAL — THE TRANSLATION SANDWICH COMMITMENT (AC-12)

YOUR TASK IS PARAPHRASE, NOT SYNTHESIS. Every Stoic claim in the prose you
produce must trace to a specific upstream mechanism output. You DO NOT add
Stoic inference beyond what the engine produced. If the engine did not
detect a passion, you do not name a passion. If the engine did not classify
a virtue, you do not classify a virtue. If the engine produced an OPEN_DEFERRAL
flag, you preserve the deferral and do not assert what the engine declined to
assert.

INCLUSION RULES — what the prose must include

For each upstream rule whose output is non-empty:

1. Mechanism 1 (prohairesis_filter) — the prose names what is within the
   practitioner's prohairesis_scope and what is in external_scope. If
   misclassification_flags[] is non-empty (CONTROL_INFLATION /
   CONTROL_ABDICATION), the prose names the misclassification using the
   practitioner's own narrative phrasing where possible.

2. Mechanism 2 (passion_root_detection) + Mechanism 3 (passion_sub_species) —
   the prose names the dominant root passion and sub-species. Use the
   canonical Greek ID with English gloss for R8a/R8b consumers; use English-
   only labels for R8c consumers. If compound_passion_flags[] is set, the
   prose names the compound.

3. Mechanism 5 (passion_false_judgement) — the prose names the
   dominant_false_judgement.object_inflated_or_deflated and the
   correct_judgement (Pass-2 enriched). The false-judgement structure is
   explicit, not implicit.

4. Mechanism 6 (oikeiosis_stage) + Mechanism 7 (oikeiosis_obligation) —
   the prose names the primary_circle (or contracted circle if
   oikeiosis_contraction: true) and the obligation status. If
   circle_conflict: true, the prose names the conflict and the resolution
   from Rule 7 Pass-2's circle_conflict_resolution.

5. Mechanism 8 (value_indifferent) — the prose names the dominant_value_error
   (if any) — the inflation / deflation / inverse_deflation on a specific
   indifferent. If COMPOUND_INFLATION_DEFLATION: true (Validation Addendum
   Adjustment 2), the prose names the same-root structure.

6. Mechanism 9 (virtue_domain_engaged) — the prose names the
   weakest_virtue_flag and any dominant_virtue_failure. If
   unity_inconsistency: true, the prose names whether the case is
   unstable phronesis (diagnostic only) or false phronesis (propagating to
   composite) per Mechanism 10's interpretation. (See Validation Addendum
   Adjustment 1 — three named cases.)

7. Mechanism 10 (katorthoma_proximity) — the prose names the proximity_level
   (English label per R8c on user-facing surfaces) and the weakest_dimension.
   If proximity_risk_flag is set, the prose names the flag with its plain-
   language explanation.

8. AC-17 flags (SELF_REPORT_DEPENDENT / CONFIDENCE_WEIGHTED) — when the
   engine_diagnostics carry these flags, the prose names the dependency
   per the consumer's surface (per D19's per-surface flag projection rules).

EXCLUSION RULES — what the prose must NOT include

The prose must not:

1. Name a passion the engine did not detect. If passions_detected[] is empty
   for a particular passion, the prose does not assert that passion. If
   passions_detected[] is empty entirely, the prose says "no specific passion
   detected in this instance".

2. Classify a virtue the engine did not classify. If
   Mechanism 9's virtue_engagement[] is empty for a particular virtue,
   the prose does not assert anything about that virtue.

3. Compose a focus question that is not slot-filled from a corpus stem.
   When AC-10 is operative (post-D-A16 promotion), Layer 3's focus questions
   come from the catalogue. Pre-promotion, you may compose questions from
   the canonical patterns named in the alt-3 handoff (lines 122-124, 127,
   130-133), but mark each composed question as
   "alt-3 derived (LLM-composed transitional)" in engine_diagnostics so the
   founder and Phase-2 builders can identify when AC-10's full
   operationalisation lands.

4. Apply second-person passion attribution to anyone other than the
   practitioner themselves (R20d). The prose does not say "your partner is
   in philodoxia" or "the audience will feel envy." It may say
   "philodoxia-shaped reasoning is invited by this content" (invitation-
   language for /api/score-social's reader_triggered_passions[] per D11
   Refinement 1).

5. Add Stoic citations the engine did not retrieve. The retrieved_passages[]
   block in the user message names the corpus passages the engine retrieved.
   You may quote a retrieved passage (single short quote, attributed) or
   paraphrase it. You may not introduce a citation that is not in the
   retrieved_passages[] block.

6. Suppress AC-17 flags. When SELF_REPORT_DEPENDENT or CONFIDENCE_WEIGHTED
   is set in engine_diagnostics, the prose names the dependency per D19's
   per-surface rules. Suppression is non-negotiable; the architecture's
   commitment is to honest acknowledgement.

7. Produce visible prose output on the deferral-resolution surface. When
   consumer_id resolves to D14b's deferral-resolution surface (consumer_layer_3_table:
   table_4b), the output is the minimal AC-18 envelope. No proximity, no
   sage_perspective, no what_you_did_well, no mentor_observation. See the
   per-consumer projection schema below.

CONTROLLED VOCABULARY

{INSERT D3's passion taxonomy + 3 eupatheiai, with R8b/R8c gloss bracketed.
Audience tier per consumer determines whether prose uses Greek IDs (R8a/R8b)
or English-only labels (R8c) or outcome-focused language with Greek-only-
in-schema (R8d).}

{INSERT D2 Tables 1, 2, 4a, 4b, 5 mapping rules in full. Phase-2 build
templates this section per consumer at the cache key level — one cached
system prompt per consumer — to keep the cached content tight per consumer.
Alternative: a single cached system prompt with the full table set; the
per-consumer projection is selected at the user-message level. Phase-2 build
chooses based on observed cache-hit performance.}

PER-CONSUMER PROJECTION

The user message names consumer_id and consumer_layer_3_table. Apply the
matching projection from the table set. Output schema per consumer:

  - table_1 (5-mechanism /api/score, /api/reason standard):
    {INSERT Table 1 output schema}
  - table_2 (6-mechanism /api/reason deep):
    {INSERT Table 2 output schema}
  - table_4a (daily-reflection ritual surface):
    {INSERT Table 4a output schema — preserves visible output per
    Option 1; what_you_did_well, sage_perspective, evening_prompt,
    optionally mentor_observation}
  - table_4b (deferral-resolution surface):
    {INSERT Table 4b output schema — AC-18 NULL projection; only
    presented_question, submission_received, internal_classification_updated,
    open_deferral_closed, ui_message; visible_score, visible_perspective,
    visible_observation are NULL}
  - table_5 (compact V3 variants — /api/score-scenario, /api/score-social):
    {INSERT Table 5 output schema with the per-route-specific fields like
    publish_recommendation, sage_says, kathekon_quality}

OUTPUT FORMAT

Return ONLY valid JSON matching the per-consumer schema. Return no prose
outside the JSON. Return no commentary. The route-side validator will reject
malformed output.

REFUSALS — when you cannot translate

If the engine output is empty or malformed (no upstream rule outputs;
schema-invalid input), return the following empty schema with reason:

{
  "translation_failed": true,
  "reason": "<brief description of the failure mode>",
  "engine_output_empty": <boolean>,
  "engine_output_malformed": <boolean>
}

Do not fabricate output to fill the schema. Do not paraphrase out-of-vocabulary
content. The route-side handler reads translation_failed and returns 503
to the caller.

[END SYSTEM BLOCK]
```

### User message — per-request

```
[USER MESSAGE]

Consumer: {consumer_id}
Consumer Layer 3 Table: {consumer_layer_3_table}

Engine Output (the canonical structured evaluation per D2 + D8):
{engine_output_json}

Engine Diagnostics (per D9 — including AC-17 flags, tier-3 deferrals, back-edge):
{engine_diagnostics_json}

Layer 1 Features (the structured features Layer 1 produced — used for slot-fill):
{layer_1_output_json}

Retrieved Passages (the corpus passages the engine retrieved during sequencing —
available for citation only; do not introduce citations beyond this list):
{retrieved_passages_summary_json}
  // each entry: {passage_id, source_citation, audience_tier, text_excerpt}

Layer 5 Mentor Knowledge Base (optional, present only for consumers that engage
Layer 5 — typically the conversation surface and the daily-reflection ritual surface):
{layer_5_context_or_null}

Translate to the consumer-specific schema per the projection rules in the
system block.

[END USER MESSAGE]
```

## Cache discipline

Per AC-6 / KG6:

- **System block** carries the inclusion + exclusion rules, controlled vocabulary, per-consumer projection schemas, and refusal protocol. **Cached.** The cache key includes the consumer_id (so each consumer has its own cache; the per-consumer projection cached system prompt avoids materialising irrelevant projections in every call).
- **User message** carries the per-request engine output, diagnostics, Layer 1 features, retrieved passages, and Layer 5 context. **Per-request, not cached.**

Phase-2 build implements either:

- **Option (i) — One cached system prompt per consumer.** The cache key is `consumer_id`; the system block is built once at startup per consumer with the relevant projection rules baked in. ~5 cached prompts (one per Table 1, 2, 4a, 4b, 5 consumer set). Cache hit rate ~99% per consumer.
- **Option (ii) — One cached system prompt with all projections inlined.** The cache key is constant; the system block carries all 5 tables. Cache hit rate ~100% across all consumers but the system block is larger.

**Recommendation: Option (i).** Smaller cached system prompts, tighter token usage per call. Phase-2 build measures and may flip to Option (ii) if observed performance suggests it.

## Slot-fill mechanics in the prompt

D11 specifies the slot-fill format; this deliverable specifies how the slot-fill flows through the prompt at runtime.

### Step 1 — Engine produces the trigger

The engine fires a Tier 1, Tier 2, or Tier 3 trigger at a sequencing position (per D9 / D13). The engine's output includes:

```
{
  ...,
  "engine_diagnostics": {
    "tier_1_force_fired": true,
    "tier_1_clarification_stem": null,         // populated by Layer 3 below
    "tier_1_trigger_code": "TEMPORAL_AMBIGUITY",
    ...
  }
}
```

### Step 2 — Route retrieves the stem from the corpus

The route (or Layer 3 invocation) calls D6 retrieve with:

```
retrievePassages({
  passage_type_filter: ['focus_question_stem'],
  trigger_condition_filter: 'TEMPORAL_AMBIGUITY',
  intake_tier_filter: 1,
  top_k: 1
})
```

Returns the canonical stem with `slot_fields[]` per D13.

### Step 3 — Layer 3 fills the slots

Layer 3 receives the stem and the slot_fields[] array in the user message. The system block's slot-fill rules apply:

```
SLOT-FILL RULES (in the system block)

When the user message carries focus_question_stem with slot_fields[], fill
each placeholder in stem_text using the source_path of the corresponding
slot_fields[] entry.

You DO:
- Read the source_path (e.g., "layer_1_output.entities[].description") and
  navigate to the value in layer_1_output.
- Apply grammatical smoothing per the constraint (e.g., add "the" / "your"
  prefix if the constraint is noun_phrase and the result reads ungrammatical
  without it).
- Substitute the value verbatim into the stem_text where the placeholder
  appears.

You DO NOT:
- Compose new stem text. The stem comes from the catalogue.
- Merge stems. One stem per fill.
- Embellish around the stem. The stem text is locked.
- Substitute values that are not in the source_path's data.

If a slot_fields[] entry's source_path resolves to undefined or null, the
slot-fill fails. Surface as translation_failed: true with reason:
"slot_fill_source_missing: <variable_name>".
```

### Step 4 — Layer 3 returns the filled question

The output schema's `clarification_text` (Tier 1) or `soft_clarification.clarification_text` (Tier 2) field carries the filled question.

### Worked example — TEMPORAL_AMBIGUITY fill

**Stem from D6 retrieve:**
```
{
  "stem_id": "tier_1:temporal_ambiguity:001",
  "stem_text": "When you think about [SITUATION] right now, are you more concerned about something that's already happened, or something you're worried might happen?",
  "slot_fields": [
    {
      "variable_name": "[SITUATION]",
      "source_path": "layer_1_output.entities[*]:where[is_scope_stake=true,narrative_weight=high]:0.description",
      "constraint": "noun_phrase"
    }
  ]
}
```

**Layer 1 output (in user message):**
```
{
  "entities": [
    { "entity_id": "e1", "type": "event", "description": "the conversation tomorrow", "narrative_weight": "high", "is_scope_stake": true },
    ...
  ],
  ...
}
```

**Source path resolution:** the first entity with `is_scope_stake: true` and `narrative_weight: high` is `e1` with description `"the conversation tomorrow"`.

**Layer 3 fills:**
```
"When you think about the conversation tomorrow right now, are you more concerned about something that's already happened, or something you're worried might happen?"
```

**Output schema:**
```
{
  "clarification_required": true,
  "clarification_text": "When you think about the conversation tomorrow right now, are you more concerned about something that's already happened, or something you're worried might happen?",
  "trigger_code": "TEMPORAL_AMBIGUITY",
  "intake_tier": 1,
  "evaluation_partial": null
}
```

The slot-fill is bounded — Layer 3 substituted the entity description into the stem; it did not compose new prose around the question.

## AC-17 flag projection in the prompt

Per D19's per-surface flag projection rules, the system block names the four surface types (real-action, artefact-evaluation, practice, engine-level) and the prose patterns per type. The prompt carries:

```
AC-17 FLAG PROJECTION

When engine_diagnostics carries SELF_REPORT_DEPENDENT or CONFIDENCE_WEIGHTED,
project per the consumer's surface type:

- Real-action surfaces (Tables 1, 4a — /api/score, /api/score-decision,
  /api/mentor/private/reflect ritual, /api/reflect):
  SELF_REPORT_DEPENDENT projects in prose as:
    "This classification depends on your self-report of why you took this
     action; the engine cannot confirm motivation independently."
  CONFIDENCE_WEIGHTED: low projects in prose as:
    "This is a single-instance observation; longitudinal evidence is needed
     to confirm."

- Artefact-evaluation surfaces (Tables 5 entries for /api/score-social,
  Table 1 for /api/score-document):
  SELF_REPORT_DEPENDENT projects as:
    "This reading depends on your authorial framing; reasoning operative
     in the document may differ from what you intend."
  CONFIDENCE_WEIGHTED rarely fires here.

- Practice surface (Table 5 entry for /api/score-scenario):
  AC-17 flags discount; do not project prose. The hypothetical is the
  framing, not the practitioner's actual motivation.

- Engine entry point (Table 6/quick variants — /api/reason):
  AC-17 flags surface as structured fields in the response envelope
  (self_report_dependent: true; confidence_weighted: low/medium/high).
  Agent callers consume the structured flags; the agent's own product
  handles prose presentation.
```

D19 is the single source of truth; this prompt segment is the runtime expression.

## Per-consumer projection schemas

The system block carries the output schema per consumer. Examples:

### Table 1 — `/api/score`, `/api/reason` standard

```
{
  "philosophical_reflection": "<paragraph composing M1, M2/3, M5, M6/7, M9 outputs into prose>",
  "improvement_path": "<paragraph composing M5 dominant_false_judgement + correct_judgement>",
  "oikeiosis_context": "<paragraph composing M6, M7 outputs>",
  "kathekon_assessment": {
    "is_kathekon": <boolean from composite of M7+M9>,
    "quality": "<from composite>",
    "justification": "<paragraph>"
  },
  "katorthoma_proximity": "<from M10>",
  "proximity_label": "<English label from M10>",
  "ruling_faculty_state": "<from M10 directional modifier>",
  "virtue_domains_engaged": [...],
  "stage_scores": {...},
  "disclaimer": "<canonical R3 disclaimer>"
}
```

### Table 4a — daily-reflection ritual surface

```
{
  "katorthoma_proximity": "<from M10>",
  "passions_detected": [{ "root_passion": "...", "sub_species": "...", "false_judgement": "..." }, ...],
  "what_you_did_well": "<paragraph from M9 positive virtue engagement; null if no virtue rated adequate or strong>",
  "sage_perspective": "<paragraph from M5 dominant_false_judgement Pass-2>",
  "evening_prompt": "<slot-filled from corpus stem; or alt-3 transitional pattern marked in diagnostics>",
  "mentor_observation": "<from M10 structured_observation; null if not surfaced or absent>",
  "disclaimer": "..."
}
```

### Table 4b — deferral-resolution surface (AC-18 NULL projection)

```
{
  "presented_question": "<from OPEN_DEFERRAL flag — Layer 3 does not compose>",
  "submission_received": <boolean>,
  "internal_classification_updated": <boolean>,
  "open_deferral_closed": <boolean>,
  "visible_score": null,
  "visible_perspective": null,
  "visible_observation": null,
  "ui_message": "<fixed string — 'Your reflection has been recorded.' or the cascade message>"
}
```

The Table 4b projection is the architectural hard line: every visible-output field is `null`. AC-18 holds.

## Refusals — when Layer 3 cannot translate

Three failure modes:

1. **Engine output empty.** No upstream rule outputs are populated. Could happen if the engine halted at Position 1 due to a Tier 1 trigger. In this case, Layer 3 returns the Tier 1 clarification shape (per D11 §"Worked Example C" — `clarification_required: true` with the trigger stem).

2. **Engine output malformed.** Schema-invalid input. Layer 3 returns:
```
{
  "translation_failed": true,
  "reason": "engine_output_schema_invalid: <field path>",
  "engine_output_empty": false,
  "engine_output_malformed": true
}
```

3. **Slot-fill source missing.** A slot_fields[] entry's source_path resolves to undefined or null. Layer 3 returns:
```
{
  "translation_failed": true,
  "reason": "slot_fill_source_missing: <variable_name>",
  ...
}
```

The route-side validator reads `translation_failed` and returns 503 to the caller. The route logs the failure (full Layer 3 response, the engine output, the user message) for debugging.

## Pre-D-A16 transitional behaviour

Until the focus-question-stem catalogue is promoted (D4 Coverage Gap 1), some stems are alt-3-derived rather than corpus-derived. The transitional behaviour:

- **Engine-level stems** (ELEMENT_FUSION, SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY, STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED, EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY) — canonical stems are present in the alt-3 handoff and in this prompt's transitional vocabulary (the prompt's worked-example anchors include the canonical stems verbatim). Pre-promotion, these stems are LLM-rendered from the alt-3 handoff content.
- **Surface-level stems** (12 codes from D24 — `OPTION_SCOPE_INCONSISTENCY`, `DOCUMENT_OBJECT_AMBIGUITY`, etc.) — alt-3-derived. The prompt instructs Layer 3 to fall back to the alt-3-derived patterns when the catalogue is missing the stem.

Per D11 §"Pre-D-A16 transitional behaviour", every transitional stem is marked in `engine_diagnostics.alt3_derived_questions: [<stem_id>]` so the founder and Phase-2 builders can identify when AC-10's full operationalisation lands.

## Worked examples

### Example A — Philodoxia at synkatathesis (`/api/score` consumer; Table 1)

**System block (cached; abridged):**
```
[ROLE: structural prose translator]
[INCLUSION RULES: as above]
[EXCLUSION RULES: as above]
[CONTROLLED VOCABULARY: D3 + Table 1]
[OUTPUT SCHEMA: Table 1]
```

**User message:**
```
Consumer: /api/score
Consumer Layer 3 Table: table_1

Engine Output:
{
  "mechanism_1": {
    "external_scope": ["their good opinion"],
    "misclassification_flags": ["CONTROL_INFLATION"],
    "misclassification_severity": "moderate",
    "filter_passed": false
  },
  "mechanism_2": { "dominant_passion": "epithumia", "axis_evaluative": "apparent_good", ... },
  "mechanism_3": { "dominant_sub_species": "philodoxia", ... },
  "mechanism_5": { "dominant_false_judgement": { "object": "their good opinion of me", "judgement_type": "INFLATION", "correct_judgement": "Reputation is a preferred indifferent ...", "refinement_source": "PROFILE" }, ... },
  "mechanism_6": { "primary_circle": 1, "oikeiosis_contraction": true, ... },
  "mechanism_9": { "weakest_virtue_flag": "phronesis", ... },
  "mechanism_10": { "proximity_level": "deliberate", "proximity_risk_flag": "PASSION_DOMINANCE", ... }
}

Engine Diagnostics:
{
  "ac_17_self_report_dependent": true,
  "ac_17_confidence_weighted": "high",
  "tier_1_force_fired": false,
  ...
}

Layer 1 Features: { ... }

Retrieved Passages: [
  { "passage_id": "passions:epithumia:philodoxia:definition", "source_citation": "Stobaeus Section 5", ... },
  ...
]

Translate to the table_1 schema.
```

**Layer 3 output (per the system block's rules):** the Table 1 JSON output as in D11 §"Worked Example A". The philosophical_reflection paragraph names philodoxia, references the operative Circle 1 contraction, names the phronesis virtue deficiency, and names the SELF_REPORT_DEPENDENT flag. Every prose claim traces to an upstream mechanism output.

### Example B — Deferral-resolution surface (Table 4b NULL projection)

**System block (cached; abridged):**
```
[ROLE: structural prose translator]
[INCLUSION RULES: as above]
[EXCLUSION RULES: as above — including the AC-18 hard line for table_4b]
[CONTROLLED VOCABULARY: D3]
[OUTPUT SCHEMA: Table 4b — visible_* fields all null]
```

**User message:**
```
Consumer: /api/mentor/private/deferral-resolve
Consumer Layer 3 Table: table_4b

Engine Output: { ... successful processing ... }
Engine Diagnostics: { ... }
Layer 1 Features: { ... }
Retrieved Passages: [ ... ]

Translate to the table_4b schema.
```

**Layer 3 output:**
```
{
  "presented_question": "<the deferred question text from the OPEN_DEFERRAL flag>",
  "submission_received": true,
  "internal_classification_updated": true,
  "open_deferral_closed": true,
  "visible_score": null,
  "visible_perspective": null,
  "visible_observation": null,
  "ui_message": "Your reflection has been recorded."
}
```

The exclusion rules' Table 4b enforcement leaves the visible_* fields `null`. AC-18 holds.

### Example C — `/api/score-social` invitation-language (Table 5 with Refinement 1)

**Engine output (abridged):**
```
{
  "mechanism_2_3_poster": { "dominant_sub_species": "philodoxia" },
  "mechanism_2_3_reader_invited": { "passions_invited": ["phthonos", "philodoxia"] },
  "mechanism_5": { "dominant_false_judgement": { ... } },
  "mechanism_10": { "proximity_level": "deliberate", "publish_recommendation": "revise" }
}
```

**Layer 3 output (Table 5 with R20d invitation-language):**
```
{
  ...,
  "reader_triggered_passions": [
    { "passion_invited": "phthonos", "content_feature": "the comparison structure" },
    { "passion_invited": "philodoxia", "content_feature": "the appeal to recognition" }
  ],
  "corrections": [
    "Phthonos-shaped reactions may be invited by the comparison structure...",
    "Philodoxia-shaped reasoning is invited by the appeal to recognition..."
  ],
  ...
}
```

The exclusion rules' Refinement 1 enforce invitation-language. R20d is honoured.

## Verification (per D18)

D18 specifies the verification work that confirms Layer 3 honours the strict prompting at runtime. The verification reads Layer 3's output and confirms:

- Every Stoic claim in the prose traces to a specific upstream mechanism output in the user message's engine_output.
- No passion is named in the prose that the engine did not detect.
- No virtue is classified in the prose that the engine did not classify.
- AC-17 flags surface in the prose where they fired.
- Focus questions are slot-filled (not free-composed) — verifiable by matching prose against the catalogue stem.
- Table 4b consumer outputs have all visible_* fields `null`.

The verification is structural; it reads the JSON output and the user message and asserts the trace. D18 specifies the trace algorithm.

## Cleanliness rating

The prompt template is **HIGH cleanliness** — the inclusion / exclusion rules are derived from D11 specification verbatim; the cache discipline is canonical per AC-6 / KG6; the per-consumer projection schemas are derived from D2 verbatim.

The slot-fill mechanics are **HIGH cleanliness** — the source_path resolution is structural; the constraint application is bounded.

The pre-D-A16 transitional behaviour is **PARTIAL cleanliness** — the transitional pattern from the alt-3 handoff is canonical; the LLM's rendering of the pattern is bounded but not strictly deterministic. Mitigated by the `alt3_derived_questions` diagnostic that flags every transitional case.

The refusal protocol is **HIGH cleanliness** — three named failure modes with deterministic response shapes.

## R7 / R8 / R20d compliance

- **R7 (source fidelity):** the prompt explicitly forbids citations not in `retrieved_passages[]`. The engine's retrievals carry source_citation; Layer 3 may quote (single short attribution) or paraphrase, never invent.
- **R8a (strict glossary in API responses):** structured fields in the JSON output use Greek IDs.
- **R8b (developer documentation):** developer-tier consumers (Tables 1, 2) project English-first with Greek in brackets in the prose fields.
- **R8c (website / user-facing):** user-facing consumers (Tables 4a, 5) project English-only labels in prose.
- **R8d (skill contracts — agent-facing):** agent-facing consumers (Table 6 quick variants for `/api/reason`) project outcome-focused English in prose with Greek-only-in-schema.
- **R20d (relationship asymmetry):** the exclusion rules forbid second-person passion attribution; invitation-language for `/api/score-social` is the explicit pattern.

## Honest disclosure

The prompt template materialises D11's specification at runtime. The template does not introduce new design decisions; it expresses D11's rules in the form Phase-2 build implements.

The cache discipline (one cached system prompt per consumer) is canonical for Phase 1; Phase-2 production observation may flip to one cached system prompt with all projections inlined if the per-consumer caching produces operational complexity. The architecture supports either choice.

The pre-D-A16 transitional behaviour is honest about its limitation. AC-10's full operationalisation requires the catalogue. The transitional behaviour is structurally bounded and explicitly flagged in diagnostics.

The refusal protocol is the failure mode for Layer 3 — it does not produce malformed prose to fill the schema; it surfaces the failure honestly.

## Open questions

1. **Per-consumer caching split (Option (i)) vs one-prompt-with-all-projections (Option (ii)).** The architecture supports either. Phase-2 build measures cache-hit performance and latency to choose.
2. **Slot-fill source-path syntax.** The example uses a JSONPath-like syntax (`layer_1_output.entities[*]:where[...]:0.description`). Phase-2 build chooses the actual syntax (JSONPath, jq, or a custom small-grammar). The architecture commits to the path-resolution shape; the syntax is implementation.
3. **Single short quote rules (R8 / R7).** The system block forbids citations not in `retrieved_passages[]`. The "single short quote" R8 limit is enforced at the route-side validator (count quotation marks; if more than one, validation fails). Phase-2 build implements the validator.
4. **Translation_failed fallback for table_4b.** If Layer 3 fails on the deferral-resolution surface, the route returns 503 — but the practitioner has already submitted reflection content. The route should preserve the `deferral_resolutions` row insertion (encrypted) even on translation failure so the submission isn't lost. Phase-2 build of D14b coordinates with this.

## Approval gate

This deliverable is consumed by Phase-2 build (the Layer 3 implementation). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 12.*
