# Deliverable A16 — Focus-Question-Stem Catalogue

**Status:** Adopted (founder approval on 2026-05-02 — Path B equivalent: accept as drafted with the philodoxia-variant addition AND move to `/adopted/` this session; D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-10 (constrained slot-filled focus questions — corpus stem + LLM situational variables only); AC-13 (three-tier intake clarification); AC-14 (withholding as deterministic kathekon — Tier 3 OPEN_DEFERRAL questions); D5 §"Step 2 — D-A16 catalogue promotion" (the assembly procedure this deliverable executes); R7 (source fidelity); R8c (user-facing English); R20d (relationship asymmetry — no second-person passion attribution).

**Cross-references:**
- `/adopted/rag-mentor-alt3/index-schema.md` (D5 — the `corpus_passages` table schema this catalogue's entries materialise into at Phase-2 build).
- `/adopted/rag-mentor-alt3/three-tier-intake.md` (D13 — the canonical trigger code catalogue and the engine-level + surface-level stem text this document re-packages structurally).
- `/adopted/rag-mentor-alt3/layer-3-translation.md` (D11 — slot-fill mechanics; the prose surface that consumes catalogue stems).
- `/adopted/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — the ritual surface whose `evening_prompt` field consumes ritual catalogue stems).
- `/adopted/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — the deferral-resolution surface whose Tier 3 OPEN_DEFERRAL flags require the EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY stems for Phase-2 pass-1 unblock).
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose outputs Layer 3 reads to slot-fill stems; Validation Addendum awareness).
- `/adopted/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — surface-specific trigger codes per route; the source for surface-level Tier 1/2 stems below).
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture brief — lines 122-124, 127, 130-133 are the additional source for transitional patterns).
- `/operations/decision-log.md` `D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02` (the Phase-1 design batch this catalogue extends).
- `/manifest.md` R0, R6d, R7, R8a–R8d, R17, R20d, KG7 (JSONB array discipline applies to `slot_fields`).

---

## Plain-language summary

The deterministic engine produces structured outputs (the 10 mechanism results plus the composite proximity). Layer 3 turns those structured outputs into prose the practitioner reads. Where Layer 3 needs to compose a question — to resolve ambiguity at intake (Tier 1 / Tier 2), to surface a deferred classification at the deferral-resolution surface (Tier 3), or to give the practitioner something to sit with on the daily-reflection ritual surface — the question text is built from a **stem** in this catalogue plus **situational variables** filled from the engine's output.

This catalogue is the document that names the stems, their slot variables, the trigger conditions under which each stem fires, and the source provenance of each entry. At Phase-2 build time, the catalogue's entries become rows in the `corpus_passages` Supabase table per D5 §"Step 2 — D-A16 catalogue promotion". Until then, the catalogue is a documentation artefact under founder review.

The catalogue's most important entries for Phase-2 pass-1 unblock are the **two Tier 3 stems** for `EUPATHEIA_BOUNDARY` and `PRAXIS_MOTIVATION_AMBIGUITY`. These are the deferred-question text the practitioner sees at the deferral-resolution surface; without them, Phase-2 pass-1 cannot deploy. The catalogue includes additional stems for Tier 1, Tier 2, surface-specific consumers (per the D24 audit), and ritual `evening_prompt` projection — these land at later Phase-2 passes.

## Glossary

- **Stem.** A question template with `[VARIABLE_NAME]` placeholders. The stem's text is canonical (locked); the placeholders are filled at composition time.
- **Slot field.** A typed metadata entry naming one variable in the stem: its name, where its value is read from in the engine's output (`source_path`), and a constraint on the value (e.g., `noun_phrase`, `circle_name`). Stored as a JSONB array per row.
- **Trigger condition.** The canonical code identifying when the stem fires (e.g., `EUPATHEIA_BOUNDARY` for Tier 3 eupatheia withhold; `RITUAL_EVENING_PROMPT` for D14a evening reflection projection). Codes per D13 plus the ritual codes introduced in this catalogue.
- **Intake tier.** Tier 1 (force — engine halts; clarification required), Tier 2 (soft — clarification offered alongside output), Tier 3 (deterministic withhold — OPEN_DEFERRAL flag fires). Plus the surface-projection ritual-prompt category, which is not an intake tier in the canonical D13 sense — see "Schema seam — ritual stems" below.
- **Passage type.** `focus_question_stem` — the value that distinguishes a catalogue entry from other corpus content (mechanism / canonical_line / example / scoring_rule). Per D5.
- **Source citation.** Provenance for the stem text. Three categories: (a) D13 (the canonical engine-level catalogue text re-packaged); (b) alt-3 handoff (architecture-exercise transitional patterns); (c) alt-3 derived (this session — composed for catalogue completeness, no Stoic primary source).
- **alt-3 derived.** Stems composed during alt-3 architecture work (or this session) to fill catalogue coverage gaps. They follow the canonical patterns named in the alt-3 handoff and the D13 stem structure but trace to alt-3 documents rather than to a Stobaeus / DL / Cicero / Epictetus / Seneca / Marcus Aurelius citation. R7 (source fidelity) is preserved by the explicit citation field.
- **Validation Addendum awareness.** A stem flagged as `validation_addendum_aware: true` references one or more of the three Validation Addendum adjustments (Adjustment 1 — unstable vs false phronesis; Adjustment 2 — compound severity; Adjustment 3 — operative-circle dependency) per D8 §"Validation Addendum". Layer 3's prose projection (per D11 Refinement 5) honours the distinction; this catalogue flags stems whose composition references it.

---

## Catalogue body

Each entry below specifies the stem in the row-shape that becomes a `corpus_passages` row at Phase-2 build time. Order: Tier 3 first (Phase-2 pass-1 blocking minimum), then Tier 1 engine-level, Tier 2 engine-level, Tier 1 surface-level, Tier 2 surface-level, Ritual-projection stems.

Common fields on every entry:
- `passage_type: focus_question_stem`
- `source_file: focus-questions`
- `audience_tier: R8c` (user-facing prose)
- `passion`, `sub_passion`: NULL unless a stem is passion-specific
- `canonical_mechanism`: the mechanism IDs the stem's slot variables read from
- `eupatheia_boundary_relevant`, `praxis_motivation_relevant`, `validation_addendum_aware`: flags for catalogue analytics

### Section 1 — Tier 3 engine-level (Phase-2 pass-1 blocking minimum)

These stems are the deferred-question text presented at the deferral-resolution surface (D14b). Each fires when the engine deterministically withholds a classification (per AC-14). Without these stems, Phase-2 pass 1 cannot deploy.

#### Entry T3-001 — `EUPATHEIA_BOUNDARY`

```
id: tier_3:eupatheia_boundary:001
trigger_condition: EUPATHEIA_BOUNDARY
intake_tier: 3
canonical_mechanism: ["passion_root_detection", "passion_false_judgement", "katorthoma_proximity"]
passion: NULL
sub_passion: NULL  (the stem accepts any of chara | boulesis | eulabeia via slot fill)
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 3 triggers (full text) — EUPATHEIA_BOUNDARY"
eupatheia_boundary_relevant: true
praxis_motivation_relevant: false
validation_addendum_aware: false  (the stem itself does not reference the Validation Addendum; the stem fires independent of phronesis-stability)
```

**Stem text:**

> *"You described responding with [EUPATHEIA_SHAPE]. Across [TIME_WINDOW], when [SITUATIONAL_TRIGGER] arose in this domain — was your inner state actually [EUPATHEIA_DESCRIPTION], or was it more like [PASSION_COUNTERPART_DESCRIPTION]?"*

**slot_fields:**

```json
[
  {"variable_name": "EUPATHEIA_SHAPE", "source_path": "engine_output.mechanism_2.eupatheia_candidate", "constraint": "eupatheia_id (chara | boulesis | eulabeia)"},
  {"variable_name": "TIME_WINDOW", "source_path": "layer_5_context.longitudinal_window_label (default '30 days')", "constraint": "time_phrase"},
  {"variable_name": "SITUATIONAL_TRIGGER", "source_path": "layer_1_output.entities[].description (highest narrative_weight)", "constraint": "noun_phrase"},
  {"variable_name": "EUPATHEIA_DESCRIPTION", "source_path": "passion_taxonomy.eupatheiai[EUPATHEIA_SHAPE].description (per D3)", "constraint": "descriptive_phrase"},
  {"variable_name": "PASSION_COUNTERPART_DESCRIPTION", "source_path": "passion_taxonomy.passion_counterpart[EUPATHEIA_SHAPE].description (per D3)", "constraint": "descriptive_phrase"}
]
```

**Worked example (chara case):** Practitioner narrative names "felt joy at the team's win." Engine fires `eupatheia_candidate: chara` (joy-shape) with `confidence_weighted: low` (single-instance). EUPATHEIA_BOUNDARY fires; OPEN_DEFERRAL is created with the question filled as: *"You described responding with chara (joy in another's good). Across the last 30 days, when the team's wins arose — was your inner state actually genuine joy in their good as ends in themselves, or was it more like philodoxia (pleasure in being associated with success)?"*

#### Entry T3-002 — `PRAXIS_MOTIVATION_AMBIGUITY`

```
id: tier_3:praxis_motivation_ambiguity:001
trigger_condition: PRAXIS_MOTIVATION_AMBIGUITY
intake_tier: 3
canonical_mechanism: ["passion_false_judgement", "virtue_domain_engaged", "katorthoma_proximity"]
passion: NULL
sub_passion: NULL
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 3 triggers (full text) — PRAXIS_MOTIVATION_AMBIGUITY"
eupatheia_boundary_relevant: false
praxis_motivation_relevant: true
validation_addendum_aware: true  (the stem distinguishes virtue from convention — Validation Addendum Adjustment 1's unstable-vs-false phronesis bears on the Layer 3 prose projection of this stem's resolution)
```

**Stem text:**

> *"In this instance, the action looked like [SURFACE_PATTERN]. The engine cannot tell from the current instance alone whether you acted from [VIRTUE_DESCRIPTION] or from [CONVENTION_DESCRIPTION]. When you reflect on what was operative for you in that moment, what do you find?"*

**slot_fields:**

```json
[
  {"variable_name": "SURFACE_PATTERN", "source_path": "engine_output.mechanism_10.proximity_level + English label per R8c", "constraint": "proximity_phrase (e.g., 'an action approaching the principled level')"},
  {"variable_name": "VIRTUE_DESCRIPTION", "source_path": "engine_output.mechanism_9.virtue_engagement[].virtue (strongest rated; per D3 description)", "constraint": "virtue_phrase (e.g., 'phronesis — practical wisdom understanding the right action')"},
  {"variable_name": "CONVENTION_DESCRIPTION", "source_path": "operationalised_rules.rule_10.proximity_risk_flag.CONVENTION_SUBSTITUTION.description", "constraint": "convention_phrase (e.g., 'habit, social expectation, or what is conventionally praiseworthy')"}
]
```

**Worked example:** Practitioner narrative names "I gave the difficult feedback to my colleague." Engine output: `proximity_level: principled, weakest_dimension: phronesis_andreia, proximity_risk_flag: CONVENTION_SUBSTITUTION` because the engine cannot rule out the action being habitual professional practice. PRAXIS_MOTIVATION_AMBIGUITY fires; OPEN_DEFERRAL with: *"In this instance, the action looked like an action approaching the principled level. The engine cannot tell from the current instance alone whether you acted from phronesis (understanding the right action toward your colleague's good) or from habit and what is conventionally expected of a manager. When you reflect on what was operative for you in that moment, what do you find?"*

---

### Section 2 — Tier 1 engine-level (force clarification at intake)

These fire from Layer 1 or rule positions 1–6. Engine halts; clarification required before evaluation continues.

#### Entry T1E-001 — `ELEMENT_FUSION` (canonical D13 form)

```
id: tier_1:element_fusion:001
trigger_condition: ELEMENT_FUSION
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 1 triggers (full text) — ELEMENT_FUSION"
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"There are several distinct concerns here — [LIST_OF_FUSED_CONCERNS]. Before I work through this with you, can you tell me which one of these is most centrally on your mind right now?"*

**slot_fields:**

```json
[
  {"variable_name": "LIST_OF_FUSED_CONCERNS", "source_path": "layer_1_output.fused_concerns[] (comma-separated; ' and ' before final element)", "constraint": "noun_phrase_list"}
]
```

#### Entry T1E-002 — `ELEMENT_FUSION` (alt-3 handoff variant — open framing)

```
id: tier_1:element_fusion:002
trigger_condition: ELEMENT_FUSION
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: alt-3 handoff 2026-04-29 line 122 (alt-3 derived) — supplementary alternative formulation when Layer 1's fusion list is uncertain or thin
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Before I work through this with you — can you tell me in one sentence what you were most concerned about in that moment? Not what happened, but what mattered to you about it."*

**slot_fields:** none (the stem is fully canonical; no situational variables).

**Notes:** This stem is an alternative for ELEMENT_FUSION when Layer 1 cannot enumerate the fused concerns confidently (e.g., the narrative is short and the fusion is between unstated alternatives). Phase-2 build's Layer 3 prompt selects between T1E-001 (when `layer_1_output.fused_concerns[]` is well-populated) and T1E-002 (when Layer 1's fusion detection is high-confidence but enumeration is low-confidence). The selection mechanism is a Phase-2 build operational decision; this catalogue lists both stems to make the choice available.

#### Entry T1E-003 — `SCOPE_AMBIGUITY`

```
id: tier_1:scope_ambiguity:001
trigger_condition: SCOPE_AMBIGUITY
intake_tier: 1
canonical_mechanism: ["oikeiosis_stage"]
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 1 triggers (full text) — SCOPE_AMBIGUITY"; alt-3 handoff 2026-04-29 line 123 (canonical match)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?"*

**slot_fields:** none (the stem is fully canonical).

#### Entry T1E-004 — `TEMPORAL_AMBIGUITY`

```
id: tier_1:temporal_ambiguity:001
trigger_condition: TEMPORAL_AMBIGUITY
intake_tier: 1
canonical_mechanism: ["passion_root_detection"]
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 1 triggers (full text) — TEMPORAL_AMBIGUITY"; alt-3 handoff 2026-04-29 line 124 (canonical match); D11 §"Slot-fill format" example (canonical match)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text (D11 form with [SITUATION] slot):**

> *"When you think about [SITUATION] right now, are you more concerned about something that's already happened, or something you're worried might happen?"*

**slot_fields:**

```json
[
  {"variable_name": "SITUATION", "source_path": "layer_1_output.entities[].description (highest narrative_weight scope-stake event/abstraction)", "constraint": "noun_phrase"}
]
```

**Notes:** The D13 form omits the [SITUATION] slot ("...think about this situation right now..."); the D11 form (used here) carries the slot for situations where Layer 1 has identified a specific entity. Phase-2 build's Layer 3 prompt may use either; this catalogue carries the D11 form as canonical and notes the D13 form as a slotless alternative.

---

### Section 3 — Tier 2 engine-level (soft clarification alongside output)

These fire after the engine completes its sequencing. The evaluation runs to completion; the soft question is appended to the response.

#### Entry T2E-001 — `STATED_OPERATIVE_CONFLICT`

```
id: tier_2:stated_operative_conflict:001
trigger_condition: STATED_OPERATIVE_CONFLICT
intake_tier: 2
canonical_mechanism: ["oikeiosis_stage", "oikeiosis_obligation"]
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 2 triggers (full text) — STATED_OPERATIVE_CONFLICT"; alt-3 handoff 2026-04-29 line 127 (canonical match for the framing)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: true  (Validation Addendum Adjustment 3 — Rule 7's explicit operative-circle dependency on Rule 6 — is the architectural reason this stem fires)
```

**Stem text:**

> *"You mentioned being concerned about [STATED_CIRCLE_TARGET]. I want to check something with you — when you imagine [SITUATION] going badly, what's the thing you're most worried about for yourself?"*

**slot_fields:**

```json
[
  {"variable_name": "STATED_CIRCLE_TARGET", "source_path": "engine_output.mechanism_6.stated_circle_target", "constraint": "person_or_audience (per layer_1_output)"},
  {"variable_name": "SITUATION", "source_path": "layer_1_output.entities[].description (action's primary referent)", "constraint": "noun_phrase"}
]
```

#### Entry T2E-002 — `STATED_EQUANIMITY_UNVERIFIED`

```
id: tier_2:stated_equanimity_unverified:001
trigger_condition: STATED_EQUANIMITY_UNVERIFIED
intake_tier: 2
canonical_mechanism: ["passion_root_detection", "passion_sub_species", "virtue_domain_engaged"]
audience_tier: R8c
source_citation: D13 §"Engine-level Tier 2 triggers (full text) — STATED_EQUANIMITY_UNVERIFIED"; alt-3 handoff 2026-04-29 lines 130-133 (canonical match)
eupatheia_boundary_relevant: true  (the stem invites longitudinal evidence that bears on later EUPATHEIA_BOUNDARY classifications)
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Has there been a recent time when something similar went the other way — when the outcome you hoped for didn't arrive — and you noticed how you actually felt, not how you thought you should feel?"*

**slot_fields:** none (the stem is fully canonical; it asks the practitioner to recall their own historical pattern).

---

### Section 4 — Tier 1 surface-level (force; per consumer route)

These fire on specific consumer surfaces (the eight perimeter routes identified by D24) when input shape or content is too thin or ambiguous for evaluation. All entries are alt-3 derived per the D24 audit, named in D13 §"Surface-level Tier 1 triggers".

#### Entry T1S-001 — `OPTION_SCOPE_INCONSISTENCY` (`/api/score-decision`)

```
id: tier_1:option_scope_inconsistency:001
trigger_condition: OPTION_SCOPE_INCONSISTENCY
intake_tier: 1
canonical_mechanism: ["oikeiosis_stage"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — OPTION_SCOPE_INCONSISTENCY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"These two options affect different people in your life — option 1 is mostly about [CIRCLE_OPTION_1], and option 2 is mostly about [CIRCLE_OPTION_2]. Are you choosing between two genuinely different paths, or do you want to focus on one circle?"*

**slot_fields:**

```json
[
  {"variable_name": "CIRCLE_OPTION_1", "source_path": "engine_output.mechanism_6.per_option[0].primary_circle.english_label", "constraint": "circle_phrase"},
  {"variable_name": "CIRCLE_OPTION_2", "source_path": "engine_output.mechanism_6.per_option[1].primary_circle.english_label", "constraint": "circle_phrase"}
]
```

#### Entry T1S-002 — `OPTION_FALSE_ALTERNATIVE` (`/api/score-decision`)

```
id: tier_1:option_false_alternative:001
trigger_condition: OPTION_FALSE_ALTERNATIVE
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — OPTION_FALSE_ALTERNATIVE" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Option [A] and option [B] don't seem to be genuine alternatives — they could be combined (or one includes the other). Do you want me to evaluate them as written, or would you like to refine the option set first?"*

**slot_fields:**

```json
[
  {"variable_name": "A", "source_path": "layer_1_output.option_labels[0]", "constraint": "option_label (e.g., '1', 'A')"},
  {"variable_name": "B", "source_path": "layer_1_output.option_labels[1]", "constraint": "option_label"}
]
```

#### Entry T1S-003 — `DOCUMENT_OBJECT_AMBIGUITY` (`/api/score-document`)

```
id: tier_1:document_object_ambiguity:001
trigger_condition: DOCUMENT_OBJECT_AMBIGUITY
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — DOCUMENT_OBJECT_AMBIGUITY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Are you the sole author of this document, or is some of the content quoted or co-authored? If quoted, do you want the evaluation to focus on your authorial parts only?"*

**slot_fields:** none.

#### Entry T1S-004 — `DOCUMENT_PURPOSE_AMBIGUITY` (`/api/score-document`)

```
id: tier_1:document_purpose_ambiguity:001
trigger_condition: DOCUMENT_PURPOSE_AMBIGUITY
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — DOCUMENT_PURPOSE_AMBIGUITY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"What is this document for, and who is it written to?"*

**slot_fields:** none.

#### Entry T1S-005 — `RESPONSE_AMBIGUITY` (`/api/score-scenario`)

```
id: tier_1:response_ambiguity:001
trigger_condition: RESPONSE_AMBIGUITY
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — RESPONSE_AMBIGUITY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Can you say a bit more about how you would respond and why?"*

**slot_fields:** none.

#### Entry T1S-006 — `POST_ELEMENT_FUSION` (`/api/score-social`)

```
id: tier_1:post_element_fusion:001
trigger_condition: POST_ELEMENT_FUSION
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — POST_ELEMENT_FUSION" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"This post seems to mix several distinct points. Do you want me to evaluate it as a single artefact, or would you like to focus on one of the points first?"*

**slot_fields:** none.

#### Entry T1S-007 — `REFLECTION_NARRATIVE_THIN` (`/api/reflect`, `/api/mentor/private/reflect`)

```
id: tier_1:reflection_narrative_thin:001
trigger_condition: REFLECTION_NARRATIVE_THIN
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — REFLECTION_NARRATIVE_THIN" (alt-3 derived); applies to D14a Verification 6 (post-substitution Tier 1 force trigger surfacing)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Can you say a bit more about what happened, and what you noticed in your own response to it?"*

**slot_fields:** none.

#### Entry T1S-008 — `RESPONSE_FIELD_INCONSISTENCY` (`/api/reflect`, `/api/mentor/private/reflect` — evening flow)

```
id: tier_1:response_field_inconsistency:001
trigger_condition: RESPONSE_FIELD_INCONSISTENCY
intake_tier: 1
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 1 triggers — RESPONSE_FIELD_INCONSISTENCY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Your response describes [INFERRED_EVENT_FROM_RESPONSE], but the situation you described is [WHAT_HAPPENED_SUMMARY]. Can you tell me which one of these you want me to focus on?"*

**slot_fields:**

```json
[
  {"variable_name": "INFERRED_EVENT_FROM_RESPONSE", "source_path": "layer_1_output.inferred_event_from_response", "constraint": "noun_phrase"},
  {"variable_name": "WHAT_HAPPENED_SUMMARY", "source_path": "layer_1_output.what_happened_summary", "constraint": "noun_phrase"}
]
```

---

### Section 5 — Tier 2 surface-level (soft clarification per consumer route)

#### Entry T2S-001 — `STATED_PROCESS_INCONSISTENCY` (`/api/score-decision`)

```
id: tier_2:stated_process_inconsistency:001
trigger_condition: STATED_PROCESS_INCONSISTENCY
intake_tier: 2
canonical_mechanism: ["oikeiosis_obligation"]  (process_quality is part of Cicero Q3/Q4 territory)
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 2 triggers — STATED_PROCESS_INCONSISTENCY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"You described your process for arriving at these options, and the process sounds [PROCESS_QUALITY_ASSESSMENT] — but the option set itself feels [OBSERVATION]. Want to consider whether more options were available?"*

**slot_fields:**

```json
[
  {"variable_name": "PROCESS_QUALITY_ASSESSMENT", "source_path": "engine_output.mechanism_7.process_quality.english_label", "constraint": "quality_phrase"},
  {"variable_name": "OBSERVATION", "source_path": "engine_output.mechanism_7.process_inconsistency_observation (alt-3 derived prose by Layer 3)", "constraint": "observation_phrase"}
]
```

#### Entry T2S-002 — `POLICY_INSTITUTIONAL_DISTANCE` (`/api/score-document` policy mode)

```
id: tier_2:policy_institutional_distance:001
trigger_condition: POLICY_INSTITUTIONAL_DISTANCE
intake_tier: 2
canonical_mechanism: ["layer_1_translation", "oikeiosis_stage"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 2 triggers — POLICY_INSTITUTIONAL_DISTANCE" (alt-3 derived per D24 Refinement 2)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"This document was written by [AUTHORIAL_DISTANCE]. The Stoic evaluation works best when you are evaluating your own authorial reasoning. Do you want to focus on what you would change if you were the author, or on understanding what reasoning is operative in the document as written?"*

**slot_fields:**

```json
[
  {"variable_name": "AUTHORIAL_DISTANCE", "source_path": "layer_1_output.authorial_control (closed enum: 'you' | 'your organisation' | 'a third party')", "constraint": "authorial_phrase"}
]
```

#### Entry T2S-003 — `RESPONSE_SCENARIO_DRIFT` (`/api/score-scenario`)

```
id: tier_2:response_scenario_drift:001
trigger_condition: RESPONSE_SCENARIO_DRIFT
intake_tier: 2
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 2 triggers — RESPONSE_SCENARIO_DRIFT" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Your response touches on [ADJACENT_TOPIC] more than on [SCENARIO_CORE_QUESTION]. Do you want me to evaluate the response as written, or would you like to focus more directly on [SCENARIO_CORE_QUESTION]?"*

**slot_fields:**

```json
[
  {"variable_name": "ADJACENT_TOPIC", "source_path": "layer_1_output.adjacent_topic_summary", "constraint": "noun_phrase"},
  {"variable_name": "SCENARIO_CORE_QUESTION", "source_path": "request.scenario.core_question (canonical from scenario fixtures)", "constraint": "noun_phrase"}
]
```

#### Entry T2S-004 — `POST_PURPOSE_AMBIGUITY` (`/api/score-social`)

```
id: tier_2:post_purpose_ambiguity:001
trigger_condition: POST_PURPOSE_AMBIGUITY
intake_tier: 2
canonical_mechanism: ["layer_1_translation"]
audience_tier: R8c
source_citation: D13 §"Surface-level Tier 2 triggers — POST_PURPOSE_AMBIGUITY" (alt-3 derived)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"You picked 'general' as the platform. The post could fit a tweet, an email, or an internal Slack message. Do you want me to evaluate it generically, or for a specific platform?"*

**slot_fields:** none.

---

### Section 6 — Ritual evening_prompt stems (D14a; alt-3 derived this session)

These stems populate the `evening_prompt` field on the daily-reflection ritual surface (D14a Table 4a projection). They are alt-3 derived (composed this session) because no canonical stems exist in source files for ritual projection. Phase-2 pass 2 (D14a engine substitution) consumes these stems via Layer 3's slot-fill mechanics.

**Schema seam:** the D5 `corpus_passages` schema constrains `intake_tier ∈ {1, 2, 3}` and ritual stems are not intake-clarification stems. See §"Schema seam — ritual stems and D5 corpus_passages constraint" below for the open question on schema amendment vs synthetic intake_tier assignment.

**Coverage:** 3 morning stems (forward-looking) + 3 evening stems (backward-looking) = 6 stems total. Above the session prompt's 5+ minimum.

#### Entry RIT-M-001 — Morning indifferent-awareness

```
id: ritual:morning_indifferent_awareness:001
trigger_condition: RITUAL_MORNING_PROMPT  (proposed code; pending schema amendment per §"Schema seam")
intake_tier: 1  (synthetic — see §"Schema seam"; semantically: the ritual fires on every successful morning evaluation, not as intake clarification)
canonical_mechanism: ["value_indifferent", "passion_root_detection"]
audience_tier: R8c
source_citation: alt-3 derived (this session — composed for D14a coverage; no Stoic primary source)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"As [SITUATION] approaches today, what's the [INDIFFERENT_AT_STAKE] you're most aware of wanting? Notice it, then ask whether wanting it as a genuine good would change how you act."*

**slot_fields:**

```json
[
  {"variable_name": "SITUATION", "source_path": "layer_1_output.entities[].description (highest narrative_weight forward-looking event)", "constraint": "noun_phrase"},
  {"variable_name": "INDIFFERENT_AT_STAKE", "source_path": "engine_output.mechanism_8.indifferents_at_stake[0].english_label", "constraint": "indifferent_phrase"}
]
```

**Notes:** Forward-looking morning stem. Reads from Mechanism 8 (which surfaces indifferents at stake) and Mechanism 2 (passion detection — identifying what the practitioner is anticipating).

#### Entry RIT-M-002 — Morning circle-and-virtue

```
id: ritual:morning_circle_virtue:001
trigger_condition: RITUAL_MORNING_PROMPT
intake_tier: 1
canonical_mechanism: ["oikeiosis_stage", "virtue_domain_engaged"]
audience_tier: R8c
source_citation: alt-3 derived (this session)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: true  (the stem invites motivation reflection during the day, which feeds into Mechanism 10's praxis-motivation classification)
validation_addendum_aware: false
```

**Stem text:**

> *"[CIRCLE_TARGET] is the circle most operative in your morning so far. What would acting from [VIRTUE_TO_PRACTICE] toward them look like specifically today?"*

**slot_fields:**

```json
[
  {"variable_name": "CIRCLE_TARGET", "source_path": "engine_output.mechanism_6.primary_circle.english_label", "constraint": "circle_phrase"},
  {"variable_name": "VIRTUE_TO_PRACTICE", "source_path": "engine_output.mechanism_9.weakest_virtue_flag (or strongest if weakest is unclear) + English label per R8c", "constraint": "virtue_phrase"}
]
```

#### Entry RIT-M-003 — Morning passion-watchpoint

```
id: ritual:morning_passion_watchpoint:001
trigger_condition: RITUAL_MORNING_PROMPT
intake_tier: 1
canonical_mechanism: ["passion_root_detection", "passion_sub_species", "passion_causal_stage"]
audience_tier: R8c
source_citation: alt-3 derived (this session)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Your morning has named [DOMINANT_PASSION_DESCRIPTION]. What's one moment today where you'd notice if it surfaces — and what would noticing in time give you?"*

**slot_fields:**

```json
[
  {"variable_name": "DOMINANT_PASSION_DESCRIPTION", "source_path": "engine_output.mechanism_3.dominant_sub_species + D3 description", "constraint": "passion_phrase"}
]
```

**Notes:** Plays the role of a daily premeditatio. The practitioner is asked to identify a watchpoint, not to suppress the passion.

#### Entry RIT-E-001 — Evening flattering-story check

```
id: ritual:evening_flattering_story:001
trigger_condition: RITUAL_EVENING_PROMPT
intake_tier: 1
canonical_mechanism: ["passion_false_judgement", "passion_sub_species"]
audience_tier: R8c
source_citation: alt-3 derived (this session)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Of what happened today, what's the part you're tempted to tell yourself a flattering story about? Sit with the unflattering version overnight."*

**slot_fields:** none (the stem is fully canonical; the practitioner identifies the flattering content themselves).

**Notes:** Addresses self-flattering narratives generally. The stem invites the practitioner to surface their own flattering content without the engine pre-classifying it. Backward-looking; evening tone is unsentimental. The companion RIT-E-001b below sharpens this stem for the founder's philodoxia profile per ES1 (founder direction 2026-05-02 — Open Question 4 resolved).

#### Entry RIT-E-001b — Evening philodoxia-tuned story check (founder direction 2026-05-02)

```
id: ritual:evening_flattering_story:002_philodoxia
trigger_condition: RITUAL_EVENING_PROMPT
intake_tier: 1
canonical_mechanism: ["passion_root_detection", "passion_sub_species", "passion_false_judgement"]
audience_tier: R8c
passion: epithumia
sub_passion: philodoxia
source_citation: alt-3 derived (this session — composed for ES1 philodoxia coverage per founder direction 2026-05-02; no Stoic primary source)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"Of what happened today, what's the part you're tempted to tell a story about that earned you something — recognition, approval, a sense of standing? Sit with the version where you did the same action and no one noticed."*

**slot_fields:** none (the stem is fully canonical; the practitioner identifies the recognition-seeking content themselves).

**Selection rule (Phase-2 build operational decision):** Phase-2 build's Layer 3 prompt selects RIT-E-001b over RIT-E-001 when the engine has detected philodoxia in the day's evaluation (`engine_output.mechanism_3.dominant_sub_species: philodoxia` OR `engine_output.mechanism_3.sub_species_map[]` includes philodoxia at non-trivial weight). When philodoxia is not detected, the canonical RIT-E-001 is selected. Phase-2 build verifies the selection rule against observed dominant-sub-species patterns; the catalogue's stem is calibrated against ES1 (founder profile) and observation may surface additional refinement.

**Notes:** This stem is a passion-specific variant. Per ES1 (Eval Suite Requirement 1), philodoxia at strong intensity is in the founder's profile and benefits from sharpened ritual-projection. The stem isolates the recognition mechanism specifically — *"earned you something"* names the acquisitive shape; *"the version where you did the same action and no one noticed"* names the test that distinguishes virtue (the action stands without external witness, per AC-18's architectural commitment) from philodoxia (the action depends on being seen). R20d preserved — the stem is in first-person and asks the practitioner to examine their own reasoning, not to diagnose others.

#### Entry RIT-E-002 — Evening false-judgement-then-and-now

```
id: ritual:evening_false_judgement_history:001
trigger_condition: RITUAL_EVENING_PROMPT
intake_tier: 1
canonical_mechanism: ["passion_false_judgement", "katorthoma_proximity"]
audience_tier: R8c
source_citation: alt-3 derived (this session)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: false
```

**Stem text:**

> *"[FALSE_JUDGEMENT_OBJECT] looked like a genuine good in the moment. Tonight, ask yourself whether it would have looked the same to you a year ago — and what the difference tells you."*

**slot_fields:**

```json
[
  {"variable_name": "FALSE_JUDGEMENT_OBJECT", "source_path": "engine_output.mechanism_5.dominant_false_judgement.object_inflated_or_deflated", "constraint": "noun_phrase"}
]
```

**Notes:** Invites longitudinal reflection — feeds the practitioner's own self-knowledge of trajectory, which Mechanism 10's longitudinal projection also tracks.

#### Entry RIT-E-003 — Evening virtue-deficiency-pattern

```
id: ritual:evening_virtue_deficiency_pattern:001
trigger_condition: RITUAL_EVENING_PROMPT
intake_tier: 1
canonical_mechanism: ["virtue_domain_engaged", "katorthoma_proximity"]
audience_tier: R8c
source_citation: alt-3 derived (this session)
eupatheia_boundary_relevant: false
praxis_motivation_relevant: false
validation_addendum_aware: true  (Validation Addendum Adjustment 1 — unstable vs false phronesis — bears on whether the deficiency is a developmental signal or a value-judgement failure)
```

**Stem text:**

> *"[VIRTUE_DEFICIENCY] is the operative deficiency in today's reasoning. The small version of it: where else does this same shape show up in your week?"*

**slot_fields:**

```json
[
  {"variable_name": "VIRTUE_DEFICIENCY", "source_path": "engine_output.mechanism_9.weakest_virtue_flag + English label per R8c", "constraint": "virtue_phrase"}
]
```

**Notes:** Asks the practitioner to look for the same shape across the week — supports Mechanism 10's longitudinal classification by inviting the practitioner's own pattern recognition. Validation Addendum awareness applies because the practitioner's own answer bears on whether unity_inconsistency in this instance is unstable phronesis or false phronesis (per Adjustment 1).

---

## Coverage check

Per the session prompt's coverage requirements:

| Coverage area | Minimum stems required | Status this draft |
|---|---|---|
| `EUPATHEIA_BOUNDARY` (Tier 3) | At least 1 | ✅ T3-001 (1 stem) |
| `PRAXIS_MOTIVATION_AMBIGUITY` (Tier 3) | At least 1 | ✅ T3-002 (1 stem) |
| `ELEMENT_FUSION` (Tier 1) | At least 1 | ✅ T1E-001, T1E-002 (2 stems — canonical + alt-3 handoff variant) |
| `SCOPE_AMBIGUITY` (Tier 1) | At least 1 | ✅ T1E-003 (1 stem) |
| `TEMPORAL_AMBIGUITY` (Tier 1) | At least 1 | ✅ T1E-004 (1 stem) |
| `STATED_OPERATIVE_CONFLICT` (Tier 2) | At least 1 | ✅ T2E-001 (1 stem) |
| `STATED_EQUANIMITY_UNVERIFIED` (Tier 2) | At least 1 | ✅ T2E-002 (1 stem) |
| Surface-specific Tier 1 codes (D24) | Per route, at least 1 | ✅ T1S-001 through T1S-008 (8 stems across 5 consumer routes) |
| Surface-specific Tier 2 codes (D24) | Per route, at least 1 | ✅ T2S-001 through T2S-004 (4 stems across 4 consumer routes) |
| Ritual `evening_prompt` slot-fill (D14a) | At least 5 (morning + evening; varied tone) | ✅ 7 stems (3 morning + 3 evening + 1 philodoxia-tuned variant per founder direction 2026-05-02) |

**Total stem count:** 27 entries (2 Tier 3 engine + 4 Tier 1 engine + 2 Tier 2 engine + 8 Tier 1 surface + 4 Tier 2 surface + 7 Ritual = 27). Two of the Tier 1 engine stems (T1E-001 and T1E-002) are alternative formulations of ELEMENT_FUSION; two of the ritual evening stems (RIT-E-001 and RIT-E-001b) are alternative formulations of the flattering-story stem. Distinct trigger codes covered: 21 (19 from D13's catalogue + 2 ritual codes introduced by this catalogue).

### Stem-to-trigger-code mapping

| Trigger code | Stems |
|---|---|
| EUPATHEIA_BOUNDARY | T3-001 |
| PRAXIS_MOTIVATION_AMBIGUITY | T3-002 |
| ELEMENT_FUSION | T1E-001 (canonical), T1E-002 (alt-3 handoff variant) |
| SCOPE_AMBIGUITY | T1E-003 |
| TEMPORAL_AMBIGUITY | T1E-004 |
| STATED_OPERATIVE_CONFLICT | T2E-001 |
| STATED_EQUANIMITY_UNVERIFIED | T2E-002 |
| OPTION_SCOPE_INCONSISTENCY | T1S-001 |
| OPTION_FALSE_ALTERNATIVE | T1S-002 |
| DOCUMENT_OBJECT_AMBIGUITY | T1S-003 |
| DOCUMENT_PURPOSE_AMBIGUITY | T1S-004 |
| RESPONSE_AMBIGUITY | T1S-005 |
| POST_ELEMENT_FUSION | T1S-006 |
| REFLECTION_NARRATIVE_THIN | T1S-007 |
| RESPONSE_FIELD_INCONSISTENCY | T1S-008 |
| STATED_PROCESS_INCONSISTENCY | T2S-001 |
| POLICY_INSTITUTIONAL_DISTANCE | T2S-002 |
| RESPONSE_SCENARIO_DRIFT | T2S-003 |
| POST_PURPOSE_AMBIGUITY | T2S-004 |
| RITUAL_MORNING_PROMPT | RIT-M-001, RIT-M-002, RIT-M-003 |
| RITUAL_EVENING_PROMPT | RIT-E-001 (canonical), RIT-E-001b (philodoxia-tuned per founder direction 2026-05-02), RIT-E-002, RIT-E-003 |

**Trigger codes not covered (D13's seven Engine-level codes — all covered):** none. The two ritual codes are introduced by this catalogue.

**Phase-2 pass-1 blocking minimum:** ✅ met (T3-001 + T3-002).

---

## Phase-2 build readiness

### Pass-1 (D14b deferral-resolution surface — load-bearing per AC-19)

**Required catalogue content:** T3-001 (EUPATHEIA_BOUNDARY) + T3-002 (PRAXIS_MOTIVATION_AMBIGUITY).

**Status this draft:** Both stems present with full slot_fields specification. No Phase-2 pass-1 blocker remains in the catalogue.

### Pass-2 (D14a daily-reflection ritual surface)

**Required catalogue content:**
- All Tier 1 engine-level stems (T1E-001 through T1E-004) — for clarification surfacing per D14a Verification 6.
- All Tier 2 engine-level stems (T2E-001, T2E-002) — for soft clarifications during the ritual flow.
- The 7 ritual stems (RIT-M-001 through RIT-E-003 plus RIT-E-001b philodoxia variant) — for `evening_prompt` field projection per D14a Layer 3 Table 4a.
- `REFLECTION_NARRATIVE_THIN` (T1S-007) — surface-level Tier 1 specifically named in D14a Verification 6.
- `RESPONSE_FIELD_INCONSISTENCY` (T1S-008) — surface-level Tier 1 for evening-flow inconsistency.

**Status this draft:** All required entries present.

### Pass-3+ (conversation surface migration — `/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`, `/api/reason`, `/api/reflect`)

**Required catalogue content:** All 8 surface-level Tier 1 stems plus all 4 surface-level Tier 2 stems.

**Status this draft:** All required entries present per D24 audit's surface-specific trigger code catalogue.

---

## Schema seam — ritual stems and D5 corpus_passages constraint

The D5 `corpus_passages` table schema includes a CHECK constraint:

```sql
CONSTRAINT focus_question_completeness CHECK (
    (passage_type = 'focus_question_stem' AND trigger_condition IS NOT NULL AND intake_tier IS NOT NULL)
    OR (passage_type != 'focus_question_stem' AND trigger_condition IS NULL AND intake_tier IS NULL)
);
```

Plus:

```sql
CONSTRAINT intake_tier_valid CHECK (intake_tier IS NULL OR intake_tier IN (1,2,3))
```

The 6 ritual stems (RIT-M-001 through RIT-E-003) are `passage_type: focus_question_stem` (they consume the same slot-fill mechanics as intake-clarification stems) but they are not Tier 1 / Tier 2 / Tier 3 in the canonical D13 sense — they fire as a Layer 3 projection on every successful ritual evaluation, not as a clarification trigger.

Three resolution paths:

**Path A — D5 schema amendment.** Amend D5 to either (a) add new `passage_type` values (`ritual_morning_prompt`, `ritual_evening_prompt`) with their own CHECK constraint that does not require `intake_tier` / `trigger_condition`, or (b) extend `intake_tier` to allow value 0 (or 4) for ritual projection. **Risk: Elevated — D5 is in `/adopted/`; amendment requires re-approval per D5's approval-gate footer.**

**Path B — Synthetic intake_tier assignment.** Use `intake_tier: 1` for ritual stems with the understanding that the `trigger_condition` field's distinct value (`RITUAL_MORNING_PROMPT` / `RITUAL_EVENING_PROMPT`) carries the semantic distinction. The route's Layer 3 logic dispatches on the trigger_condition. **Risk: Standard — no schema change; the synthetic assignment is documented in the catalogue.** The catalogue's stems above use this approach (intake_tier: 1) with the documentation that the trigger_condition is the operative dispatch field.

**Path C — Defer to Phase-2 build.** The catalogue documents both approaches; Phase-2 build (when these stems are actually inserted into the corpus_passages table) decides which path to take based on the operational shape of Layer 3's lookup queries.

**Recommendation:** Path C — defer to Phase-2 build. The catalogue's entries above honour Path B (synthetic intake_tier: 1) as the documentation default; Phase-2 build can switch to Path A if the synthetic assignment causes issues at retrieval time. The D5 amendment, if needed, is a separate Elevated decision.

---

## Honest disclosure

**Source extraction premise revision.** The session prompt's source extraction premise (extract from `mentor-knowledge-base.ts` and `REFLECTION_PROMPT`) was revised at session open after Part A reads revealed that `mentor-knowledge-base.ts` carries informational background only (no question patterns) and `REFLECTION_PROMPT` is a meta-prompt instructing Claude to compose questions live (no canonical stems). The catalogue's actual source set, per founder direction (Path A — Use D13 + alt-3 handoff), is:

- **Primary source — D13 (three-tier intake specification):** all 17 engine-level + surface-level stems re-packaged structurally with explicit slot_fields metadata.
- **Supplementary source — alt-3 handoff lines 122-124, 127, 130-133:** one alternative ELEMENT_FUSION formulation (T1E-002) and confirmations of canonical patterns for SCOPE_AMBIGUITY, TEMPORAL_AMBIGUITY, STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED.
- **alt-3 derived this session — 6 ritual stems:** composed for D14a `evening_prompt` coverage. No Stoic primary source; honestly cited.

**No Stoic primary-source citations in this catalogue.** Per AC-10's design, focus-question stems are application-layer constructions. R7 source fidelity is preserved by the explicit `source_citation` field on every entry. Phase-2+ corpus expansion (D-A10, parallel track) may surface Stoic primary-source variants of some stems (e.g., Marcus Aurelius's Book IV.3 retreat-to-the-self has a stem-shape resonance with RIT-E-001); when those surface, the catalogue adds them as additional stems, not as replacements.

**Validation Addendum awareness.** Three stems carry `validation_addendum_aware: true` (T3-002, T2E-001, RIT-E-003) because the stem's composition or its Layer 3 prose projection references one of the three Validation Addendum adjustments. The flag is for catalogue analytics; it does not change the stem text. Layer 3's prose projection per D11 Refinement 5 carries the actual Addendum-aware prose at engine output time.

**Phase-2 build operational decisions intentionally not made in this catalogue:**
- The Layer 3 prompt's mechanism for selecting between alternative stems (T1E-001 vs T1E-002).
- The schema seam path (A / B / C) for ritual stems.
- The exact text of `[CIRCLE_OPTION_1]` / `[VIRTUE_TO_PRACTICE]` slot fills (these come from D2 / D3 vocabularies; the stems specify the source_path).
- The `corpus_passages` table's actual INSERT statements at Phase-2 build time (these are a separate Standard-risk decision-log entry per D5 Step 1).

---

## Open questions

1. **Schema seam path for ritual stems.** §"Schema seam — ritual stems and D5 corpus_passages constraint" recommends Path C (defer to Phase-2 build). Founder review may revisit. If Path A is preferred, D5 amendment is a separate Elevated decision-log entry.

2. **Canonical vs alt-3-handoff-variant stem selection at runtime.** T1E-001 (canonical D13) and T1E-002 (alt-3 handoff variant) are both ELEMENT_FUSION stems. Phase-2 build's Layer 3 prompt needs a selection rule. Recommendation in §"Notes" of T1E-002: select based on `layer_1_output.fused_concerns[]` confidence. Founder review may prefer a different rule.

3. **Whether to rename T2S-001's `OBSERVATION` slot or compose its prose differently.** The current slot reads from `engine_output.mechanism_7.process_inconsistency_observation`, which is itself an alt-3-derived field name. Phase-2 build of `/api/score-decision` may surface that the field shape is slightly different in practice; the slot's source_path may need adjustment.

4. **Whether ritual stems should carry passion-specific variants.** **Resolved 2026-05-02 → Yes.** Founder direction added the philodoxia-tuned variant RIT-E-001b. Phase-2 build's Layer 3 prompt selects between RIT-E-001 (canonical) and RIT-E-001b (philodoxia-detected) per the selection rule documented in RIT-E-001b's notes. The architecture supports adding additional passion-specific variants per ES1 coverage (philoplousia, agonia, penthos) when production observation surfaces a need; the precedent is set by RIT-E-001b.

5. **Whether to add per-passage `confidence_weighted` projection in stem text.** Per AC-17, `confidence_weighted: low` cases project to prose differently. T3-001 (EUPATHEIA_BOUNDARY) and RIT-E-003 (validation_addendum_aware) may surface as `confidence_weighted: low` cases more often than other stems. Layer 3's prose projection (D11) handles this; the catalogue's stems are confidence-agnostic. Logged for Phase-2 production observation.

6. **D-A10 corpus expansion interaction.** D-A10 (parallel track per D4 Gap 2) may surface canonical lines from Stoic primary sources that have stem-shape resonance with the alt-3-derived ritual stems. When those land, the catalogue adds them as additional entries (with proper Stoic citations). The architecture supports adding without replacing.

7. **Anonymous read access on a public corpus reference page.** D5 §"RLS — read-only at request time" notes the `/corpus` reference page question is open. If exposed, focus-question stems would be filtered out (they are application-layer rather than canonical_line / example). Logged for awareness; no action required this session.

---

## Founder direction — resolved 2026-05-02

The two founder direction questions for this deliverable were called at the catalogue assembly session on 2026-05-02 (per `D-A16-CATALOGUE-ASSEMBLED-AND-ADOPTED-2026-05-02`):

1. **Approval pathway — Path B equivalent ("Don't defer things, do them first") — confirmed.** The catalogue is accepted as drafted with the philodoxia-variant addition AND moved to `/adopted/rag-mentor-alt3/` in the same session, rather than staying in `/drafts/` for a subsequent promotion session. This is the same signal as Path B in the Phase-1 completion review — bias toward execution rather than deferral.

2. **RIT-E-001b philodoxia variant — Yes, add this session — confirmed.** The variant is included as a separate entry above (RIT-E-001b) with its own slot_fields specification, selection rule for Phase-2 build, and ES1 alignment notes. The variant's `passion: epithumia` / `sub_passion: philodoxia` tagging makes it filterable at retrieval time.

The above resolutions hold for the eventual Phase-2 build. The catalogue is now Adopted and consumed by Phase-2 build per D5 §"Step 2 — D-A16 catalogue promotion".

## Approval gate

This deliverable is consumed by Phase-2 build (per D5 §"Step 2 — D-A16 catalogue promotion" — the catalogue's entries become rows in the `corpus_passages` Supabase table at Phase-2 build time). The catalogue is documentation; the corpus_passages INSERTs are a separate Critical-risk decision-log entry per PR6 (Phase-2 pass 1 is Critical).

**Approval status:** Adopted 2026-05-02 (per founder direction call this session — Path B equivalent + RIT-E-001b inclusion). The catalogue moved to `/adopted/rag-mentor-alt3/d-a16-catalogue.md` in the same session. Phase-2 build commences against this catalogue.

This deliverable does not commit Phase-2 build to insert all 27 stems at pass 1. The minimum for pass 1 is T3-001 + T3-002 (per D14b §"Phase-2 pass 1 build readiness" — pass-1 minimum: EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY stems). Other stems land at the appropriate pass per the build sequencing in D21:
- Pass 2 (D14a — daily-reflection ritual): all 4 Tier 1 engine + 2 Tier 2 engine + 7 ritual stems + REFLECTION_NARRATIVE_THIN + RESPONSE_FIELD_INCONSISTENCY surface-level Tier 1 stems.
- Pass 3+ (conversation surface migration): all remaining 6 surface-specific Tier 1 + 4 surface-specific Tier 2 stems.

---

*End of Deliverable A16.*
