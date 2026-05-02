# Deliverable 11 — Layer 3 Translation Specification

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — Claude is restricted to Layer 3 output translation; no Stoic inference originates from Claude); AC-5 (strict prompting — inclusion + exclusion); AC-10 (constrained slot-filled focus questions: corpus stem + LLM situational variables only); AC-17 (residual seams — Layer 3 surfaces SELF_REPORT_DEPENDENT and CONFIDENCE_WEIGHTED flags in prose); AC-18 (no shareable artefact at the deferral-resolution surface — Layer 3's deferral projection produces no visible output); R7 (source fidelity); R8a–R8d (audience-tier glossary); R20d (relationship asymmetry — no second-person passion attribution).

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — the canonical engine output Layer 3 translates; Tables 1, 2, 4a, 4b, 5 are the per-consumer projection specifications)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary; the eupatheia / passion replacement structure)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose outputs Layer 3 translates; the Validation Addendum guidance Layer 3 honours)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9 — the engine sequencing whose final output Layer 3 reads)
- `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10 — the input-side translator; Layer 3 is the output-side counterpart)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — Tier 1 questions Layer 3 surfaces; Tier 2 augmentation; Tier 3 OPEN_DEFERRAL)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — per-consumer refinements: reader_triggered_passions invitation-language, institutional-distance clarification, AC-17 flag projection per surface)
- `/drafts/rag-mentor-alt3/corpus-inventory.md` (D4 — focus-question stems catalogue; D-A16 promotion needed before AC-10 can be operationalised)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC4, AC5, R7, R8a–R8d, R19c (limitations acknowledged in user-facing prose), R19d (mirror principle), R20d (relationship asymmetry)

---

## Plain-language summary

Layer 3 is Claude's second translation task: the deterministic engine has produced a structured evaluation (10 mechanism outputs plus the composite proximity), and Layer 3 turns that structure into prose the practitioner reads. The architectural commitment AC-12 is strict: **Layer 3 is translation, not synthesis.** Claude paraphrases the engine's structured output into conversational language. Claude does not add Stoic inference. Claude does not classify a passion the engine did not detect. Claude does not assess a virtue the engine did not assess.

The result reads as a coherent mentor reply, but every Stoic claim in the prose traces to an upstream rule's output. If Mechanism 5's `dominant_false_judgement` is empty, the prose does not name a false judgement — it acknowledges that the engine did not identify one. If Mechanism 10's `SELF_REPORT_DEPENDENT` flag fires, the prose names the dependency rather than asserting the classification.

This deliverable specifies the **prose paraphrase rules** (what Layer 3 may and may not say), the **slot-fill mechanics for focus questions** (corpus stem + LLM situational variables only — AC-10), the **per-consumer projection rules** (the surface-specific prose shapes per D2 Tables 1–5 and per the D24 audit refinements), the **error handling** (when the engine produces empty fields), and the **prompt template** for Claude.

## Glossary

- **Layer 3** — the output translator. Canonical engine output → conversational prose.
- **Inclusion + exclusion (AC-5 strict prompting)** — the Layer 3 prompt names both what the prose must include (the upstream rule outputs) and what the prose must exclude (Stoic inference originating from Claude).
- **Slot-fill (AC-10 constrained focus questions)** — focus questions are constructed from a corpus stem (e.g., D-A16 catalogue per D4) with situational variables (the practitioner's specific entities, indifferents, axes from Layer 1's output) filled by Layer 3. The stem is locked; only the variables are LLM-filled.
- **Per-consumer projection** — D2 Tables 1, 2, 4a, 4b, 5 specify how the canonical engine output maps to each consumer's surface shape. Layer 3 implements the mapping per consumer.
- **Diagnostic-not-punitive (R6d)** — Layer 3's prose names false judgements as diagnostic information ("philodoxia is operating in this instance"), not as scoring penalties.
- **Mirror principle (R19d)** — the framework is for examining one's own reasoning, not for diagnosing others. Layer 3's prose uses first-person and impersonal phrasing; second-person passion attribution is prohibited (R20d).
- **Invitation-language** — phrasing that names what content invites in readers, rather than diagnosing readers' actual passions. Specifically required for `/api/score-social`'s `reader_triggered_passions[]` projection (per D24 audit).

## Layer 3's narrow scope

Layer 3 does **only** the following:

1. **Paraphrase upstream rule outputs into prose.** Each prose sentence corresponds to a specific upstream rule output. The mapping is traceable.
2. **Compose focus questions via slot-fill.** When the engine surfaces a focus-question requirement (Tier 1 ELEMENT_FUSION clarification stem, Tier 2 soft clarification stem, evening_prompt for the daily-reflection ritual surface, deferred-question presentation for the deferral-resolution surface), Layer 3 fills the corpus stem with situational variables.
3. **Surface AC-17 flags in prose.** When Mechanism 10's `SELF_REPORT_DEPENDENT` or `CONFIDENCE_WEIGHTED` flags fire, Layer 3 names the dependency in the prose rather than suppressing it.
4. **Apply per-consumer projection rules.** Layer 3 reads the consumer identifier (which route called the engine) and applies the projection per D2 Tables 1–5 and the D24 audit refinements.
5. **Honour AC-18 on the deferral-resolution surface.** When the consumer is the deferral-resolution surface (D14b), Layer 3 produces no visible output — only internal classification update and OPEN_DEFERRAL flag closure.

Layer 3 does **not**:

- Add Stoic inference the engine did not produce.
- Name a passion the engine did not detect.
- Classify a virtue the engine did not classify.
- Substitute a focus question stem with one Claude composes.
- Project canonical output into a surface shape that bypasses D2's mapping tables.
- Apply second-person passion attribution to anyone other than the practitioner themselves.

The narrowness is the architectural commitment per AC-12.

## Input shape

Layer 3's input is the deterministic engine's full output (the 10 mechanism outputs plus Mechanism 10's composite) plus three additional contextual fields:

```
{
  "consumer_id": "<string — names the route that invoked the engine>",
  "consumer_layer_3_table": "<table_1 | table_2 | table_4a | table_4b | table_5 | etc.>",
  "engine_output": {
    "mechanism_1": { ... },
    "mechanism_2": { ... },
    ...
    "mechanism_10": { ... },
    "engine_diagnostics": {
      "tier_1_force_fired": <boolean>,
      "tier_1_clarification_stem": "<text or null>",
      "tier_2_soft_fired": <boolean>,
      "tier_2_clarification_stem": "<text or null>",
      "tier_3_open_deferrals": [<deferral_objects>],
      "back_edge_fired": <boolean>,
      "ac_17_self_report_dependent": <boolean>,
      "ac_17_confidence_weighted": "<low | medium | high>"
    }
  },
  "layer_1_output": { <the structured features Layer 1 produced — used for slot-fill> },
  "layer_5_context": "<optional — mentor knowledge base / historical context for prose flavour, where applicable>"
}
```

The engine's diagnostics block is explicit input to Layer 3. It tells Layer 3 which tier engaged, whether the back-edge fired, and which AC-17 flags are operative. Layer 3 reads these and shapes the prose accordingly.

## Output shape (per consumer)

Layer 3's output shape varies per consumer per D2 Tables 1, 2, 4a, 4b, 5. The full output schemas per consumer are specified in D2; this deliverable specifies the **prose-generation rules** that fill each schema's prose fields.

### Table 1 (5-mechanism standard depth — `/api/score`, `/api/reason` standard)

**Prose fields Layer 3 fills:**
- `philosophical_reflection` — Layer 3 prose translation of upstream rule outputs (Mechanisms 1, 2, 5, 7, 9 composite).
- `improvement_path` — Layer 3 prose translation of Mechanism 5's `dominant_false_judgement` plus its Pass-2-enriched `correct_judgement`.
- `oikeiosis_context` — Layer 3 prose translation of Mechanism 7's obligation status plus circle conflict resolution.
- `kathekon_assessment.justification` — Layer 3 prose translation of the composite read of Mechanisms 7 + 9 (kathekon quality is a downstream projection).
- `proximity_label` — English-only label per Mechanism 10's `proximity_level` (R8c — `principled` → "Approaching wisdom" etc.).

### Table 2 (6-mechanism deep depth — `/api/reason` deep)

Same as Table 1 plus:
- `iterative_refinement.philosophical_summary` — Layer 3 prose translation of Mechanism 10's longitudinal projection (Senecan grade, direction, profile-tension flag).

### Table 4a (daily-reflection ritual surface — `/api/mentor/private/reflect` ritual flow + `/api/reflect`)

**Prose fields Layer 3 fills:**
- `what_you_did_well` — Layer 3 prose translation of Mechanism 9's positive virtue engagement (where any virtue rated `adequate` / `strong`).
- `sage_perspective` — Layer 3 prose translation of `improvement_path` derived from Mechanism 5's `dominant_false_judgement` Pass-2 enriched.
- `evening_prompt` — Layer 3 slot-fill from corpus focus-question stem (per D-A16 catalogue when promoted) + situational variables from Layer 1's output.
- `mentor_observation` (optional surface field on D14a per founder direction) — Layer 3 prose translation of `structured_observation` from Mechanism 10's longitudinal projection (one-sentence developmental signal).

### Table 4b (deferral-resolution surface — D14b / `/api/mentor/private/reflect` deferral flow)

**Prose fields Layer 3 fills:** **NONE.** AC-18 holds on this surface. Layer 3 produces no visible prose output. The only outputs are:
- Internal classification update (Mechanism 10 retrospectively applied to the original instance).
- Closed OPEN_DEFERRAL flag.

Both are visible in the scoring record but not as Layer 3 prose. Layer 3's role on this surface is the **deferred-question presentation** (the practitioner sees the specific deferred question; that is the only Layer 3 output, and it is presentation rather than evaluation):
- The deferred question text comes from the OPEN_DEFERRAL flag itself (which was set at scoring time with the question fully specified). Layer 3 does not compose the question — it presents the question already deterministically composed at the prior scoring event.
- Sample format from the alt-3 handoff: *"You left a question open from [date]: [question text]. There's no prompt — just what you found."*

After the practitioner submits the resolution reflection, Layer 3 produces **no celebratory prose**. The internal classification update happens; the OPEN_DEFERRAL flag closes; the practitioner sees nothing other than "your reflection has been recorded" and the flag closure visible in the scoring record.

### Table 5 (compact V3 variants — `/api/score-scenario`, `/api/score-social`)

**Prose fields Layer 3 fills:**
- `feedback` (score-scenario) — Layer 3 prose translation of upstream rule outputs (2-3 sentences).
- `sage_says` (score-scenario) — Layer 3 prose translation focused on Mechanism 1 output (1 sentence on what is within prohairesis).
- `corrections[]` (score-social) — Layer 3 prose translation of Mechanism 5's per-passion `improvement_path`.
- `proximity_label` (score-social) — English label.

### `/api/score-document` (Tables 1 + Table 6 [proposed by D24])

**Prose fields Layer 3 fills:**
- `philosophical_reflection` — same as Table 1.
- `improvement_path` — same as Table 1.
- `policy_mode_only.deliberation_assessment.notes` — Layer 3 prose translation of Mechanisms 6 + 7 composite for policy documents.

## The strict prompting principle (AC-5)

The Layer 3 prompt uses **inclusion + exclusion** strict prompting. The prompt names both what the prose must include and what it must not include.

### Inclusion (what the prose must include)

For each upstream rule whose output is non-empty:

1. **Mechanism 1 (`prohairesis_filter`):** the prose must name what is within the practitioner's `prohairesis_scope` and what is in `external_scope`. If `misclassification_flags[]` is non-empty (CONTROL_INFLATION / CONTROL_ABDICATION), the prose must name the misclassification — using the practitioner's own narrative phrasing where possible.
2. **Mechanism 2 (`passion_root_detection`) + Mechanism 3 (`passion_sub_species`):** the prose must name the dominant root passion and sub-species (using the canonical Greek ID with English gloss, per R8b for developer surfaces, or English-only per R8c for user-facing surfaces). If `compound_passion_flags[]` is set, the prose must name the compound.
3. **Mechanism 5 (`passion_false_judgement`):** the prose must name the `dominant_false_judgement.object_inflated_or_deflated` and the `correct_judgement` (Pass-2 enriched). The false-judgement structure is explicit in the prose, not implicit.
4. **Mechanism 6 (`oikeiosis_stage`) + Mechanism 7 (`oikeiosis_obligation`):** the prose must name the `primary_circle` (or contracted circle if `oikeiosis_contraction: true`) and the obligation status. If `circle_conflict: true`, the prose must name the conflict and the resolution.
5. **Mechanism 8 (`value_indifferent`):** the prose must name the `dominant_value_error` (if any) — the inflation / deflation / inverse_deflation on a specific indifferent.
6. **Mechanism 9 (`virtue_domain_engaged`):** the prose must name the `weakest_virtue_flag` (the operative deficiency) and any `dominant_virtue_failure`. If Validation Addendum Adjustment 1 conditional engages (Mechanism 10's interpretation of unity_inconsistency), the prose names whether the case is unstable phronesis (diagnostic) or false phronesis (propagating to composite) per Mechanism 10's interpretation.
7. **Mechanism 10 (`katorthoma_proximity`):** the prose must name the `proximity_level` (using the English label per R8c on user-facing surfaces) and the `weakest_dimension`. If `proximity_risk_flag` is set, the prose must name the flag with its plain-language explanation.

### Exclusion (what the prose must not include)

The prose must not:

1. **Name a passion the engine did not detect.** If `passions_detected[]` is empty, the prose says "no specific passion detected in this instance" — not "the practitioner is showing some [passion]".
2. **Name a virtue rating the engine did not produce.** If Mechanism 9's `virtue_engagement[]` is empty for a particular virtue, the prose does not assert anything about that virtue.
3. **Compose a focus question that is not slot-filled from a corpus stem.** When AC-10 is operative (post-D-A16 promotion), Layer 3's focus questions come from the catalogue. Until D-A16 promotes, Layer 3 may compose questions but must mark them as "alt-3 derived" in diagnostics (transitional behaviour — see "Honest disclosure" below).
4. **Apply second-person passion attribution to anyone other than the practitioner themselves.** Per R20d, the prose does not say "your partner is in philodoxia" or "the audience will feel envy." It may say "philodoxia-shaped reasoning is invited by this content" (invitation-language for `/api/score-social`'s reader_triggered_passions per D24 audit).
5. **Add Stoic citations the engine did not provide.** Layer 3 may quote a corpus passage if the engine surfaced the passage as part of its output (e.g., a `canonical_line` retrieved per Mechanism 5's case-refinement); Layer 3 may not introduce a citation that the engine did not retrieve.
6. **Suppress AC-17 flags.** When `SELF_REPORT_DEPENDENT` or `CONFIDENCE_WEIGHTED` is set, the prose names the dependency. This is non-negotiable — AC-17's commitment is to honest acknowledgement of what the engine knows and what it does not.
7. **Produce visible output on the deferral-resolution surface.** AC-18 holds; Layer 3 produces only the deferred-question presentation and otherwise nothing visible after submission.

## Slot-fill mechanics for focus questions (AC-10)

AC-10 specifies that focus questions are constructed from a **corpus stem** with **LLM situational variables**. The stem is locked; the variables are LLM-filled.

### The slot-fill format

Each focus question stem in the catalogue (per D-A16) has a structured shape:

```
{
  "stem_id": "<unique identifier>",
  "trigger_condition": "<TEMPORAL_AMBIGUITY | ELEMENT_FUSION | SCOPE_AMBIGUITY | STATED_OPERATIVE_CONFLICT | ...>",
  "intake_tier": 1 | 2 | 3,
  "stem_text": "<the canonical question text with [VARIABLE_NAME] placeholders>",
  "slot_fields": [
    {
      "variable_name": "<the placeholder name>",
      "source_path": "<the path in Layer 1's output or the engine's output where this variable's value comes from>",
      "constraint": "<noun_phrase | entity_description | indifferent_id | etc.>"
    },
    ...
  ],
  "audience_tier": "R8c"
}
```

**Example stem (TEMPORAL_AMBIGUITY Tier 1):**

```
{
  "stem_id": "tier_1:temporal_ambiguity:001",
  "trigger_condition": "TEMPORAL_AMBIGUITY",
  "intake_tier": 1,
  "stem_text": "When you think about [SITUATION] right now, are you more concerned about something that's already happened, or something you're worried might happen?",
  "slot_fields": [
    {
      "variable_name": "[SITUATION]",
      "source_path": "layer_1_output.entities[].description (highest narrative_weight scope-stake event/abstraction)",
      "constraint": "noun_phrase"
    }
  ],
  "audience_tier": "R8c"
}
```

**Layer 3's slot-fill task:**

1. Read the stem from the catalogue.
2. For each `slot_fields[]` entry, retrieve the source value from Layer 1's output or the engine's output (per the `source_path`).
3. Fill the placeholder with the value. If the constraint is `noun_phrase`, Layer 3 may grammatically smooth (e.g., add an article: "the conversation tomorrow" rather than "conversation tomorrow") but cannot replace the noun.
4. Return the completed question.

### What Layer 3 cannot do at slot-fill

- **Cannot compose a stem.** The stem comes from the catalogue. If no stem matches the trigger, Layer 3 returns "no stem available" (the route handles this; until D-A16 promotes, all stems are missing — see honest disclosure).
- **Cannot merge stems.** Layer 3 fills one stem at a time. Multiple Tier 1 triggers fire one at a time per request.
- **Cannot embellish.** The stem text is locked. Layer 3 fills variables but does not add prose around the stem.

### Pre-D-A16 transitional behaviour

Until the focus-question-stem catalogue is promoted (D4 §"Coverage gaps" — Gap 1), Layer 3 falls back to LLM-composed questions. The transitional prompt instructs Layer 3 to compose questions from the canonical patterns named in the alt-3 handoff (lines 122–124, 127, 130–133), but the diagnostic explicitly marks the question as "alt-3 derived (LLM-composed transitional)" so Phase-2 builders can identify when AC-10's full operationalisation lands.

The transitional behaviour is honest about its limitation. AC-10's full operationalisation requires the catalogue. The architecture commits to AC-10; the catalogue's promotion is a Phase-2 build precondition (per D4's recommendation).

## Per-consumer projection rules (refinements per D24 audit)

D2 Tables 1, 2, 4a, 4b, 5 specify the canonical projections. The D24 audit identified five surface-specific refinements that Layer 3's prose generation must apply:

### Refinement 1 — Reader_triggered_passions invitation-language (`/api/score-social`)

**Audit finding (D24 §"Route 5"):** the existing `/api/score-social` engine returns `reader_triggered_passions[]` as if they were diagnostic of the audience's actual reasoning. R20d's prohibition on second-person passion attribution (the framework is for self-examination, not diagnosing others) requires the prose to use **invitation-language** instead.

**Layer 3 rule:** when projecting `reader_triggered_passions[]` for `/api/score-social`'s `corrections[]` and `feedback` fields, use phrasing that names what content **invites** in readers, not what readers will feel. Examples:

- **Prohibited:** "Readers will feel envy at this post." / "The audience is in agonia." / "Recipients will react with phthonos."
- **Allowed:** "This content invites philodoxia-shaped reasoning in readers (the appeal is to recognition rather than to substance)." / "The framing carries an agonia-shaped invitation (reading the worst case as the most likely case)." / "Phthonos-shaped reactions may be invited by the comparison structure."

The grammatical pattern: **<passion>-shaped reasoning is invited by <content_feature>**. The agency rests with the content's structure, not with the reader's classification.

### Refinement 2 — Institutional-distance soft clarification (`/api/score-document` policy mode)

**Audit finding (D24 §"Route 3"):** when the practitioner is evaluating an institutional document they did not author themselves (a workplace policy they are reviewing), the second-person evaluation prohibition (R20d) becomes relevant — the framework should not be used to diagnose the institution's reasoning as if the institution were a practitioner.

**Layer 3 rule:** when the consumer is `/api/score-document` policy mode AND the engine's `authorial_control` indicates the practitioner is not the document's author, surface a Tier 2 soft clarification in the prose: *"This document was written by [you / your organisation / a third party]. The Stoic evaluation works best when you are evaluating your own authorial reasoning. Do you want to focus on what you would change if you were the author, or on understanding what reasoning is operative in the document as written?"*

The clarification is **soft** (Tier 2 — practitioner can answer or decline). The evaluation proceeds; the clarification is appended.

### Refinement 3 — AC-17 flag projection per surface

**Audit finding (D24 §"AC-17 seams"):** AC-17 flags fire at the engine but project differently per Layer 3 consumer.

**Layer 3 rule:**

- **Real-action surfaces (`/api/score`, `/api/score-decision`, `/api/mentor/private/reflect` ritual, `/api/reflect`):** AC-17 flags surface prominently in the prose. `SELF_REPORT_DEPENDENT` projects as: *"This classification depends on your self-report of why you took this action; the engine cannot confirm motivation independently."* `CONFIDENCE_WEIGHTED: low` projects as: *"This is a single-instance observation; longitudinal evidence is needed to confirm."*
- **Artefact-evaluation surfaces (`/api/score-document`, `/api/score-social`):** AC-17 flags surface as authorial-state caveats. `SELF_REPORT_DEPENDENT` projects as: *"This reading depends on your authorial framing; reasoning operative in the document may differ from what you intend."* `CONFIDENCE_WEIGHTED` rarely fires here.
- **Practice surface (`/api/score-scenario`):** AC-17 flags discount, since the practitioner is reasoning about a hypothetical. `SELF_REPORT_DEPENDENT` does not project — the hypothetical is the framing, not the practitioner's actual motivation.
- **Engine entry point (`/api/reason`):** AC-17 flags surface as structured fields in the response envelope (not as prose). Agent callers consume the structured flags; the agent's own product handles prose presentation.

### Refinement 4 — D2 Table 4a's dual applicability (`/api/reflect` + `/api/mentor/private/reflect` ritual flow)

**Audit finding (D24 §"Route 7" + §"Route 8"):** D2 Table 4a's projection (the daily-reflection ritual surface) applies to both `/api/reflect` (public sister) and `/api/mentor/private/reflect`'s ritual flow.

**Layer 3 rule:** the prose generation rules for `what_you_did_well`, `sage_perspective`, `evening_prompt` are identical across both routes. The difference is at the *context-loading layer* (`/api/mentor/private/reflect` carries richer Layer 2 context — practitioner profile, mentor knowledge base, etc.; `/api/reflect` carries thinner context). Layer 3 reads whatever context the engine produces; the prose generation rules do not change.

### Refinement 5 — Validation Addendum Adjustment 1 prose projection

**Validation Addendum (D8 §"Validation Addendum"):** Rule 9's `unity_inconsistency` flag is interpreted by Mechanism 10 conditionally — unstable phronesis (diagnostic only) vs false phronesis (propagating to composite).

**Layer 3 rule:** the prose names the case Mechanism 10 identifies:

- **Unstable phronesis case:** *"Across this instance, the unity check shows phronesis and [other_virtue] not yet aligned. This pattern is consistent with developmental noise rather than a value-judgement failure — your phronesis is genuine but stabilising."* (No proximity demotion.)
- **False phronesis case:** *"Across this instance, the unity check shows phronesis misidentified — what reads as phronesis is consistent with your known [false_judgement_pattern] wearing phronetic language. Composite proximity reflects this."* (Proximity demotion to weakest-link.)
- **Insufficient longitudinal evidence case (CONFIDENCE_WEIGHTED: low default):** *"The unity check shows inconsistency. Without sufficient longitudinal evidence, the engine treats this as developmental noise (diagnostic only) rather than as misidentified phronesis. Future instances will sharpen the picture."* (No proximity demotion; AC-17 flag surfaced.)

The prose does not pretend the engine knows more than it does. Where the conditional defaults to unstable phronesis under uncertainty, the prose names the default and explains why.

## Prompt template

Layer 3's prompt has the same three-section structure as Layer 1: role narrowing, controlled vocabulary specification, output format constraint. Plus the per-consumer projection variant.

```
[SYSTEM BLOCK — cached]

You are a structural prose translator for the SageReasoning deterministic
reasoning engine. The engine has produced a structured evaluation; your task
is to translate the structure into prose the practitioner reads.

CRITICAL: Your task is paraphrase, not synthesis. Every Stoic claim in your
prose must trace to a specific upstream mechanism output. You DO NOT add
Stoic inference beyond what the engine produced.

You DO:
- Paraphrase Mechanism 1's prohairesis_filter output into prose about what is
  within the practitioner's moral choice and what is external to it.
- Paraphrase Mechanism 2/3's passions_detected into prose naming the dominant
  passion and sub-species.
- Paraphrase Mechanism 5's dominant_false_judgement into prose naming the false
  judgement and the correct judgement.
- Paraphrase Mechanism 6/7's oikeiosis outputs into prose about the circle
  engaged and the obligation status.
- Paraphrase Mechanism 8's dominant_value_error into prose about the
  inflation/deflation operative.
- Paraphrase Mechanism 9's weakest_virtue_flag into prose naming the operative
  virtue deficiency.
- Paraphrase Mechanism 10's proximity_level into prose using the English label.
- Slot-fill focus questions from the corpus stem catalogue (when AC-10 is
  operative; otherwise fall back to LLM-composed transitional questions
  flagged in diagnostics).
- Surface AC-17 flags in prose (SELF_REPORT_DEPENDENT, CONFIDENCE_WEIGHTED).
- Apply per-consumer projection rules from D2 Tables 1, 2, 4a, 4b, 5.

You DO NOT:
- Name a passion the engine did not detect.
- Classify a virtue the engine did not classify.
- Compose Stoic citations the engine did not retrieve.
- Apply second-person passion attribution to anyone other than the practitioner
  themselves (R20d).
- Use diagnostic language for readers/audiences/third parties — use invitation-
  language instead (this content invites philodoxia-shaped reasoning, not these
  readers will feel envy).
- Suppress AC-17 flags.
- Produce visible prose output on the deferral-resolution surface (AC-18).

CONTROLLED VOCABULARY:
{insert D3's passion taxonomy + 3 eupatheiai with R8b/R8c gloss bracketed}
{insert per-consumer projection rules — D2 Tables relevant to this consumer}

PER-CONSUMER PROJECTION:
Consumer: {consumer_id}
Layer 3 Table: {consumer_layer_3_table}
Output schema:
{insert the consumer's specific output schema from D2}

OUTPUT FORMAT — return ONLY valid JSON matching the schema. Return no prose
outside the JSON. Return no commentary.

[END SYSTEM BLOCK]

[USER MESSAGE]

Engine output:
{engine_output_json}

Engine diagnostics:
{engine_diagnostics_json}

Layer 1 features (for slot-fill):
{layer_1_output_json}

{layer_5_context — present only if applicable to this consumer}

Translate to the consumer-specific schema per the projection rules.

[END USER MESSAGE]
```

### Cache discipline

Per AC6, the system block carries cached content (the prompt template + controlled vocabulary + per-consumer projection rules). The user message carries per-request content (the engine output + diagnostics + Layer 1 features). The per-consumer projection lives in the system block but is variant by consumer — Phase-2 build may use one cached system prompt per consumer or a single system prompt with consumer-specific projection inlined.

### Model selection

Per AC1 / KG2, Layer 3 uses **Sonnet**. Like Layer 1, Layer 3's task involves multi-mechanism translation and structurally complex JSON. Haiku's reliability boundary is not met. Temperature is low (0.2 — deterministic translation; the same engine output should produce the same prose across requests).

### Output validation

The route validates Layer 3's JSON output against the consumer's schema before returning to the caller. Validation steps:
1. JSON is parseable.
2. Required fields per the consumer's schema are present.
3. Prose fields are non-empty (or explicitly null where the engine produced no upstream content for that field).
4. Focus questions, where present, are slot-filled (not free-composed) — verifiable by matching the prose against the catalogue stem.

Validation failure surfaces as a 503 response (intermittent translation failure); the route does not return malformed Layer 3 output.

## Worked examples (drawn from named anchor patterns)

### Example A — Philodoxia at synkatathesis (`/api/score` consumer)

**Engine output (abbreviated):**
- Mechanism 1: `external_scope: ["their good opinion"], misclassification_flags: ["CONTROL_INFLATION"], misclassification_severity: moderate, filter_passed: false`.
- Mechanism 2: `dominant_passion: epithumia, axis: future, axis_evaluative: apparent_good`.
- Mechanism 3: `dominant_sub_species: philodoxia`.
- Mechanism 5: `dominant_false_judgement: { object: "their good opinion of me", judgement_type: INFLATION, correct_judgement: "Reputation is a preferred indifferent..." }`.
- Mechanism 6: `primary_circle: 1 (operative), oikeiosis_contraction: true (Circle 3 stated, Circle 1 operative)`.
- Mechanism 9: `weakest_virtue_flag: phronesis, dominant_virtue_failure: phronesis`.
- Mechanism 10: `proximity_level: deliberate, proximity_risk_flag: PASSION_DOMINANCE`.
- AC-17: `self_report_dependent: true (motivation), confidence_weighted: high (philodoxia is profile-confirmed)`.

**Layer 3 output (Table 1 — `/api/score`):**

```
{
  "philosophical_reflection": "What's within your moral choice here is your impression-checking and your assent — your noticing whether being well thought of is genuinely good. What's outside is Sarah's actual opinion of you. The narrative reads philodoxia (love of honour) at the assent stage: you're rehearsing the conversation as if her good opinion of you is a genuine good. The engaged circle is community (Circle 3 stated — your colleague), but the operative circle is self (Circle 1 — your reputation). Phronesis is the operative virtue deficiency: reputation is being treated as genuinely good rather than as a preferred indifferent. This classification depends on your self-report of why you're rehearsing.",
  "improvement_path": "The false judgement: 'her good opinion of me is a genuine good.' The correct judgement: reputation is a preferred indifferent — high axia, but not a genuine good. Selecting it via virtuous action is appropriate; desiring it as a genuine good is the philodoxia pattern.",
  "oikeiosis_context": "The action's stated circle is Circle 3 (community — Sarah is a colleague leading an adjacent team). The operative circle is Circle 1 — the operative concern is your own reputation. Cicero's Q1 (is the action honourable?) reads false: rehearsing reputation-shaped conversational lines is not honourable in the strict sense, even if the conversation itself is appropriate. The higher circle's obligation prevails; the philodoxia must be examined.",
  "kathekon_assessment": {
    "is_kathekon": false,
    "quality": "marginal",
    "justification": "The conversation is appropriate (Q1 fails post-virtue assessment because the rehearsal motivation is philodoxia-shaped). What would make this kathekon: holding the conversation while letting Sarah's opinion be what it is, rather than rehearsing for it."
  },
  "katorthoma_proximity": "deliberate",
  "proximity_label": "Approaching the principled level",
  "ruling_faculty_state": "stable but not yet aligned",
  "virtue_domains_engaged": [
    { "virtue": "phronesis", "rating": "weak", "evidence": "reputation inflated to genuine good" },
    { "virtue": "dikaiosyne", "rating": "weak", "evidence": "Circle 3 obligation undermined by Circle 1 operative concern" },
    { "virtue": "andreia", "rating": "weak", "evidence": "acting from fear of disesteem" },
    { "virtue": "sophrosyne", "rating": "weak", "evidence": "rehearsal in excess of due measure" }
  ],
  "stage_scores": { "..." : "..." },
  "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations."
}
```

**Translation explanation:** Every prose claim traces to an upstream rule. The philosophical_reflection composes Mechanisms 1, 2, 3, 6, 9 into a single paragraph. The improvement_path translates Mechanism 5's false-judgement / correct-judgement pair. The oikeiosis_context surfaces Mechanism 6's contraction and Mechanism 7's Q1 conflict. The AC-17 self_report_dependent flag is named in the philosophical_reflection ("This classification depends on your self-report of why you're rehearsing"). No new Stoic inference is added.

### Example B — `/api/score-social` reader_triggered_passions invitation-language

**Engine output (abbreviated):**
- Mechanism 2/3 (poster scope): `dominant_sub_species: philodoxia`.
- Mechanism 2/3 (reader-triggered scope): `passions_invited: [phthonos, philodoxia]`.
- Mechanism 5 (per-passion correction): the false judgement operative for the poster.
- Mechanism 10: `proximity_level: deliberate, publish_recommendation: revise`.

**Layer 3 output (Table 5 — `/api/score-social`, with D24 Refinement 1 applied):**

```
{
  "katorthoma_proximity": "deliberate",
  "proximity_label": "Approaching the principled level",
  "publish_recommendation": "revise",
  "poster_passions": [
    { "root_passion": "epithumia", "sub_species": "philodoxia", "false_judgement": "external recognition is a genuine good" }
  ],
  "reader_triggered_passions": [
    { "passion_invited": "phthonos", "content_feature": "the comparison structure (the post compares your work favourably to others')" },
    { "passion_invited": "philodoxia", "content_feature": "the appeal to recognition rather than to substance" }
  ],
  "false_judgements": ["..."],
  "corrections": [
    "Phthonos-shaped reactions may be invited by the comparison structure. Consider whether the comparison serves the post's substantive point or whether it serves the appeal to recognition.",
    "Philodoxia-shaped reasoning is invited by the appeal to recognition. The post's substantive point can stand without the recognition framing."
  ],
  "feedback": "The poster passion is philodoxia (love of honour) — the post is calibrated for audience recognition rather than for substance. Two reader-side patterns are invited: comparison-driven phthonos and recognition-driven philodoxia. Revising to substance-first language would address both.",
  "sage_says": "The thing within your control here is the post's reasoning, not its reception. Calibrate to substance.",
  "disclaimer": "..."
}
```

**Translation explanation:** The `reader_triggered_passions[]` array uses the new structured shape (`passion_invited` + `content_feature`) — the agency rests with the content's structure, not with reader classification. The `corrections[]` and `feedback` use invitation-language consistently. R20d is honoured.

### Example C — Tier 1 force trigger (ELEMENT_FUSION) on any consumer

**Engine output (abbreviated):**
- Layer 1 detected ELEMENT_FUSION; engine halted at Position 1.
- `engine_diagnostics.tier_1_force_fired: true`.
- `engine_diagnostics.tier_1_clarification_stem: "There are several distinct concerns here — work, family, your parents, and the town meeting. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?"`

**Layer 3 output (any consumer):**

```
{
  "clarification_required": true,
  "clarification_text": "There are several distinct concerns here — work, family, your parents, and the town meeting. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?",
  "trigger_code": "ELEMENT_FUSION",
  "intake_tier": 1,
  "evaluation_partial": null
}
```

**Translation explanation:** Layer 3 surfaces the clarification stem verbatim. No prose composition; the stem is locked. The consumer's response shape includes `clarification_required: true` to signal the page-side caller (or agent caller) to halt rendering and surface the question to the practitioner.

### Example D — D14b deferral-resolution surface (AC-18 holds)

**Engine output (abbreviated):**
- The engine processed the practitioner's reflection on a deferred question.
- Mechanism 10 retrospectively updated the original instance's score.
- The OPEN_DEFERRAL flag closed.
- AC-18: no shareable artefact.

**Layer 3 output (Table 4b):**

```
{
  "presented_question": "<the deferred question text already specified in the OPEN_DEFERRAL flag — Layer 3 does not compose>",
  "submission_received": true,
  "internal_classification_updated": true,
  "open_deferral_closed": true,
  "visible_score": null,
  "visible_perspective": null,
  "visible_observation": null,
  "ui_message": "Your reflection has been recorded."
}
```

**Translation explanation:** Layer 3 produces no Layer-3 prose. The `ui_message` is a fixed acknowledgement — not a Layer 3 composed sentence. The internal classification update and the closed flag are visible in the scoring record but not rendered to the practitioner as prose. AC-18 is operative.

## Cleanliness rating

Layer 3 is **PARTIAL cleanliness**:

- The prose paraphrase from upstream rule outputs is **HIGH** for cases where the upstream output is well-structured (e.g., Mechanism 5's `dominant_false_judgement` translates into a one-sentence prose with low ambiguity).
- The composition of multi-mechanism prose paragraphs (`philosophical_reflection`) is **PARTIAL** — Layer 3 must order the prose, smooth between mechanisms, and avoid redundancy. The composition is bounded by the inclusion + exclusion rules but is not strictly deterministic.
- Slot-fill is **HIGH** post-D-A16 (the catalogue is canonical; only situational variables are filled). Pre-D-A16 transitional behaviour is **PARTIAL** (Layer 3 composes questions from named patterns).
- AC-17 flag projection is **HIGH** — flag fired → flag named in prose. Deterministic.
- Per-consumer projection is **HIGH** — D2 Tables 1, 2, 4a, 4b, 5 are canonical mappings.
- D24 Refinement 1 (invitation-language) is **HIGH** — grammatical pattern is locked.
- D24 Refinement 5 (Validation Addendum Adjustment 1 prose) is **PARTIAL** — three named cases plus AC-17 default. The prose names the case, but the case identification depends on Mechanism 10's conditional logic (which is itself PARTIAL per D9).

The PARTIAL ratings reflect Layer 3's composition role. The architecture's commitment to *no Stoic inference originating from Claude* is preserved by the inclusion + exclusion strict prompting; Layer 3 may compose prose around the engine's structured output, but every Stoic claim traces upstream.

## R6 / R7 / R8 / R19 / R20 compliance

- **R6d (passions diagnostic, not punitive):** Layer 3's prose names false judgements as diagnostic information ("philodoxia is operating in this instance"), not as punitive scoring penalties.
- **R7 (source fidelity):** Layer 3 does not introduce Stoic citations the engine did not retrieve. The corpus is the source of truth; Layer 3 paraphrases.
- **R8a (strict glossary in API responses):** structured fields in the response use Greek IDs (`epithumia`, `philodoxia`).
- **R8b (developer documentation):** developer-tier surfaces use English-first with Greek in brackets.
- **R8c (website / user-facing):** user-facing prose uses English-only labels (`proximity_label: "Approaching the principled level"` rather than `proximity_level: "principled"`).
- **R8d (skill contracts — agent-facing):** agent-facing prose is outcome-focused; Greek IDs appear in the schema, English in the prose.
- **R19c (limitations acknowledged):** AC-17 flag projection is the operative implementation. The prose names what the engine knows and what it does not.
- **R19d (mirror principle):** the prose is for self-examination. R20d's prohibition on second-person passion attribution is honoured by invitation-language for `/api/score-social` and by first-person framing throughout.
- **R20d (relationship asymmetry):** explicit prohibition on diagnosing third parties. Refinement 1 (invitation-language) is the architectural implementation.

## Honest disclosure

Layer 3's pre-D-A16 transitional behaviour (LLM-composed focus questions until the catalogue is promoted) is honest about its limitation. AC-10's full operationalisation depends on the catalogue. The transitional behaviour is structurally bounded — Layer 3 composes from the named patterns in the alt-3 handoff (lines 122–124, 127, 130–133) and flags the question as transitional in diagnostics.

The PARTIAL cleanliness ratings reflect Layer 3's narrow but non-zero composition role. The architecture's core commitment (no Stoic inference originating from Claude) is preserved; the composition is around the structured output, not within it.

## Open questions

1. **Should Layer 3's prose use first-person ("you") or impersonal ("the practitioner") framing for self-evaluation surfaces?** The architecture exercise's named anchor patterns use both. First-person feels closer; impersonal feels more clinical. Phase-2 production observation should determine which lands better with practitioners. The current default is first-person ("your moral choice", "your phronesis") on user-facing surfaces (R8c).
2. **Does Layer 3 need a "thin coverage" prose mode for low-content inputs?** When Layer 1's `coverage: thin` flag fires and the engine produces minimal output, Layer 3's prose may be sparse to the point of unhelpfulness. The current default is to produce honest sparse prose ("This narrative did not contain enough content for a full evaluation; the engine did not detect a specific passion or virtue deficiency"). Phase-2 production may surface a need for a different prose treatment of thin-coverage cases.
3. **Should AC-17 flag prose be configurable per consumer, or is the per-surface differentiation in Refinement 3 sufficient?** Today's specification is per-surface (real-action surfaces surface flags prominently; artefact surfaces surface as caveats; practice surface discounts). If Phase-2 production surfaces consumer needs that the per-surface differentiation does not cover, the flag prose may need configurable templates.

## Approval gate

This deliverable is consumed by Phase-2 build (the Layer 3 implementation). Approval is part of the same batch as the other Phase-1 session 2 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/` is Elevated risk and requires its own decision-log entry.

---

*End of Deliverable 11.*
