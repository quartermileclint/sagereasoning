# Deliverable 2 — Canonical Mechanism Framework

**Status:** Drafted (under founder review). Amended 2026-05-01 — Table 4 split into 4a (daily-reflection ritual surface, visible output preserved) and 4b (deferral-resolution surface, AC-18 holds) per Option 1 scoping correction. Pre-amendment version archived at `/archive/2026-05-01_canonical-framework_pre-option-1-table4-split.md`.
**Date:** 2026-05-01 (initial draft); 2026-05-01 (Option 1 amendment).
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-8 (single canonical mechanism framework, alt-3 architectural commitment); AC-18 scoping per Option 1 (2026-05-01 — daily-reflection ritual surface preserves visible output; deferral-resolution surface holds AC-18).
**Critical path:** This deliverable plus Deliverables 3 (passion taxonomy) and 8 (operationalised scoring rules) must be approved before downstream Phase-1 deliverables proceed.

**Cross-references:**
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture; AC-1 through AC-19)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29 (the architecture adoption)
- `/manifest.md` (R6a–R6e methodology rules; R7 source fidelity; R8a–R8d glossary tiers)
- `/stoic-brain/scoring.json` (canonical 4-stage evaluation_sequence + katorthoma_proximity_scale)
- `/stoic-brain/stoic-brain.json` (8-file corpus index)
- `/website/src/data/stoic-brain-compiled.ts` (the 8 condensed context constants)
- `/website/src/lib/sage-reason-engine.ts` (5-mechanism `STANDARD_SYSTEM_PROMPT`; 6-mechanism `DEEP_SYSTEM_PROMPT`)
- `/website/src/app/api/mentor/private/reflect/route.ts` (4-stage `REFLECTION_PROMPT`)
- `/website/src/app/api/score-scenario/route.ts` and `/api/score-social/route.ts` (compact V3 variants)

---

## Plain-language summary

The mentor pipeline today produces structured output in **four different shapes**, depending on which endpoint serves the request. The shapes overlap but are not subsets of each other — they have drifted apart through endpoint-by-endpoint specification. Today the divergence is mostly inert (each consumer reads only its own shape) but it blocks the alt-3 architecture, where the deterministic engine in the middle (Layer 2 of the translation sandwich) needs to produce one structured output that feeds many surfaces.

This document specifies one canonical taxonomy underneath all the surface presentations. It names **nine reasoning mechanisms** plus one composite mechanism (ten total). Each mechanism is a discrete deterministic operation with named inputs and named outputs. The ten operationalised scoring rules in Deliverable 8 are one-to-one with these ten mechanisms.

The taxonomy is not new Stoic content. Every mechanism traces to the existing Stoic Brain corpus (R7 source fidelity). The decomposition is a presentation choice, not a doctrinal one.

## Glossary (terms used in this document)

- **Mechanism** — a discrete deterministic operation in the engine. Inputs in, outputs out, no LLM reasoning inside.
- **Canonical** — the single agreed-upon shape that replaces the divergent shapes today. Adopted at this deliverable's approval; consumed by Phase-2 build.
- **Translation sandwich (AC-12)** — the alt-3 architecture: Claude restricted to Layer 1 (input translation) and Layer 3 (output translation); the deterministic engine in the middle (Layer 2) does all Stoic reasoning.
- **Surface** — a user-facing endpoint or page (private-mentor conversation, reflect endpoint, score-family endpoints, etc.).
- **Projection** — a mapping from canonical output to a surface-specific shape. The score-family endpoints stay on their existing surface shapes in Phase 1; their projections from the canonical framework are designed but not built.
- **R7 source fidelity** — every concept in the framework traces to a Stoic Brain source file (psychology, passions, virtue, value, action, progress, scoring, or stoic-brain.json).

## The problem

Four shapes in production today, none a subset of another:

**Shape 1 — 5-mechanism (`/api/reason` standard depth).** Used by `STANDARD_SYSTEM_PROMPT` in `sage-reason-engine.ts`. Mechanisms: `control_filter`, `passion_diagnosis`, `oikeiosis`, `value_assessment`, `kathekon_assessment`. Output is one nested JSON object per mechanism plus `katorthoma_proximity`, `ruling_faculty_state`, `virtue_domains_engaged`, `philosophical_reflection`, `improvement_path`, `stage_scores`, `disclaimer`.

**Shape 2 — 6-mechanism (`/api/reason` deep depth).** Same as shape 1 plus `iterative_refinement` (`senecan_grade`, `progress_dimensions`, `direction_of_travel`).

**Shape 3 — 4-stage (`/api/mentor/private/reflect`).** Used by `REFLECTION_PROMPT`. Output: `katorthoma_proximity`, `passions_detected[]`, `what_you_did_well`, `sage_perspective`, `evening_prompt`, `structured_observation`, `disclaimer`. Notably no separate `control_filter` field, no `oikeiosis` field, no `value_assessment` field.

**Shape 4 — Compact V3 variants.** `/api/score-scenario` returns `katorthoma_proximity`, `passions_detected[]` (with `root_passion`, `sub_species`, `false_judgement`), `kathekon_quality`, `feedback`, `sage_says`. `/api/score-social` returns `poster_passions[]`, `reader_triggered_passions[]`, `false_judgements[]`, `corrections[]`, `katorthoma_proximity`, `proximity_label`, `publish_recommendation`. Different fields again.

The four shapes are different *presentations* of the same underlying evaluation. The alt-3 deterministic engine needs to produce one underlying evaluation. That underlying evaluation needs a single canonical taxonomy.

## The canonical taxonomy

Nine mechanisms plus one composite mechanism. Sequenced per Deliverable 9's dependency map.

| # | Mechanism ID | Source | What it does (plain language) |
|---|---|---|---|
| 1 | `prohairesis_filter` | psychology.json (ruling_faculty); stoic-brain.json (dichotomy_of_control) | Identify what is `eph' hemin` (within the practitioner's moral choice) and what is not. Score only what is. |
| 2 | `passion_root_detection` | passions.json (four_root_passions; 2×2 matrix) | Identify which root passions are present. Four are possible: epithumia (craving), hedone (irrational pleasure), phobos (fear), lupe (distress). |
| 3 | `passion_sub_species` | passions.json (sub_species per root) | Map root passions to specific sub-species — orge (anger), philodoxia (love of honour), agonia (agonised dread), penthos (grief), and others. |
| 4 | `passion_causal_stage` | psychology.json (causal_sequence) | Identify the stage in `phantasia → synkatathesis → horme → praxis` where the practitioner's reasoning went wrong. |
| 5 | `passion_false_judgement` | passions.json + practitioner profile | Name the specific false belief operative in each detected passion. |
| 6 | `oikeiosis_stage` | action.json (oikeiosis_sequence) | Map the action to the most proximate engaged circle of concern (self → family → community → humanity → cosmos). |
| 7 | `oikeiosis_obligation` | action.json (deliberation_framework — Cicero's 5 questions) | Assess obligation status per circle using Cicero's 5 deliberation questions. |
| 8 | `value_indifferent` | value.json (preferred / dispreferred indifferents + axia) | Identify which preferred indifferents are at stake and how each is treated (correctly indifferent, inflated to good, deflated to evil). |
| 9 | `virtue_domain_engaged` | virtue.json (four_expressions + unity_thesis) | Classify cardinal virtue engagement (phronesis, dikaiosyne, andreia, sophrosyne) and apply the unity check. |
| 10 | `katorthoma_proximity` | scoring.json (4-stage evaluation_sequence + katorthoma_proximity_scale) | Composite proximity classification with directional modifier and Senecan grade overlay. Aggregates across mechanisms 1–9. |

Mechanisms 1–9 are **per-instance**: they evaluate the specific input the practitioner provided. Mechanism 10 is **composite**: it aggregates upstream outputs and reads from the practitioner's longitudinal record for the Senecan grade overlay.

## Why nine, not five or six or four

The 5-mechanism, 6-mechanism, 4-stage, and compact-variant shapes each compress different parts of the canonical taxonomy:

- **The 5-mechanism shape** collapses the four passion mechanisms (root detection / sub-species / causal stage / false judgement) into a single `passion_diagnosis` block. It also collapses the two oikeiosis mechanisms (stage / obligation) into a single `oikeiosis` block.
- **The 6-mechanism shape** does the same collapse and adds `iterative_refinement` for progress tracking. Iterative refinement is a meta-mechanism — it asks "where on the developmental gradient is this practitioner?" rather than asking about the action itself.
- **The 4-stage scoring.json shape** uses a different decomposition: `prohairesis_filter` (stage 1) → `kathekon_evaluation` (stage 2) → `passion_diagnosis` (stage 3) → `virtue_quality` (stage 4). This is the *conceptual* sequence and remains canonical at the conceptual level. The 9+1 mechanism framework is its implementation-level decomposition.
- **The 4-stage `REFLECTION_PROMPT` shape** is a surface presentation tuned for evening reflection — the prose fields (`what_you_did_well`, `sage_perspective`) are Layer 3 prose translations of the underlying canonical mechanisms, not separate mechanisms.
- **Compact V3 variants** are surface presentations: `feedback` and `sage_says` paraphrase upstream mechanisms; `publish_recommendation` is a downstream classification rule on top of mechanism 10.

The 9+1 framework is more granular than any of these because alt-3 requires per-mechanism deterministic rules. Collapsing four passion mechanisms into one means the engine cannot say "the passion is detected (mechanism 2 succeeded) but the sub-species is ambiguous (mechanism 3 failed)" — it can only say "passion_diagnosis succeeded or failed" as a unit. The granularity is required for AC-13 Tier 1 forced clarification, AC-14 deterministic withholding, and AC-17 residual seam flags. Without it, the engine cannot defer at the right place; it can only defer the whole evaluation or none of it.

## Mapping tables

The following tables specify how each existing endpoint shape projects onto the canonical framework. The projections are the basis for Phase 3+ migration of the score-family endpoints.

### Table 1 — 5-mechanism (`/api/reason` standard depth) → canonical

| Existing field | Canonical mechanism(s) | Notes |
|---|---|---|
| `control_filter.within_prohairesis` / `outside_prohairesis` | mechanism 1 | Direct projection. |
| `passion_diagnosis.passions_detected[]` | mechanisms 2 + 3 | Each entry's `id` field is the sub-species (mechanism 3); `root_passion` is mechanism 2. |
| `passion_diagnosis.false_judgements[]` | mechanism 5 | Direct projection. |
| `passion_diagnosis.correct_judgements[]` | derived from mechanism 5 + eupatheia data | Layer 3 derivation. |
| `passion_diagnosis.causal_stage_affected` | mechanism 4 | Direct projection. |
| `oikeiosis.relevant_circles[]` | mechanism 6 (with `obligation_met` from mechanism 7) | Two mechanisms folded. |
| `oikeiosis.deliberation_notes` | Layer 3 prose translation of mechanism 7 | Projection. |
| `value_assessment.indifferents_at_stake[]` | mechanism 8 | Direct projection. |
| `value_assessment.value_error` | mechanism 8 (`value_errors[]` aggregation) | Projection. |
| `kathekon_assessment.is_kathekon` / `quality` / `justification` | derived from mechanisms 7 + 9 | Composite projection. The existing `kathekon_assessment` is not a separate canonical mechanism; it is a composite read across mechanisms 7 and 9. |
| `katorthoma_proximity` | mechanism 10 | Direct projection. |
| `ruling_faculty_state` | derived from mechanism 10's directional modifier | Projection. |
| `virtue_domains_engaged[]` | mechanism 9 | Direct projection. |
| `philosophical_reflection` | Layer 3 prose | Translation of upstream rule outputs. |
| `improvement_path` | Layer 3 prose | Translation of mechanism 5's `dominant_false_judgement`. |
| `stage_scores` | per-mechanism quality flag | Currently subjective; under alt-3 it becomes a derived projection of cleanliness ratings + intake-clarification status. |

### Table 2 — 6-mechanism (`/api/reason` deep depth) → canonical

Same as Table 1 plus:

| Existing field | Canonical mechanism(s) | Notes |
|---|---|---|
| `iterative_refinement.senecan_grade` | mechanism 10 (Senecan grade overlay) | Iterative refinement is not a tenth instance-level mechanism. It is part of mechanism 10, reading from the practitioner's longitudinal record. |
| `iterative_refinement.progress_dimensions` | mechanism 10 (longitudinal projection) | Layer 3 projection of upstream mechanism aggregates over time. |
| `iterative_refinement.direction_of_travel` | mechanism 10 (directional modifier) | `improving` / `stable` / `declining` is the directional modifier output. |

### Table 3 — 4-stage scoring.json → canonical

| `scoring.json` stage | Canonical mechanism(s) |
|---|---|
| Stage 1 — Prohairesis Filter | mechanism 1 |
| Stage 2 — Kathekon Evaluation | mechanisms 6 + 7 + 8 + 9 |
| Stage 3 — Passion Diagnosis | mechanisms 2 + 3 + 4 + 5 |
| Stage 4 — Virtue Quality | mechanism 10 |

`scoring.json`'s 4-stage flow remains the canonical *conceptual* sequence (control → kathekon → passion → virtue). The 9+1 framework is the implementation-level decomposition.

### Table 4 — 4-stage `REFLECTION_PROMPT` → canonical

**AC-18 scoping correction (Option 1 adopted 2026-05-01).** The original alt-3 architecture treated `/api/mentor/private/reflect` as a single endpoint that would become the deferral-resolution surface. End-to-end workflow audit of the existing reflect-endpoint behaviour surfaced that the route serves *two distinct flows* on the same code path: the **daily-reflection ritual** (morning check-in + evening reflection rituals on the private-mentor page, called via `submitRitual('morning' | 'evening')`) and the **deferral-resolution surface** (alt-3's AC-15 sub-option 1b, presenting specific deferred questions from prior `OPEN_DEFERRAL` flags).

These two flows have different practitioner intentions and different architectural needs. Under Option 1, AC-18 is **scoped to the deferral-resolution surface only**. The daily-reflection ritual surface preserves its visible output. Tables 4a (ritual) and 4b (deferral) replace the prior single Table 4.

#### Table 4a — `REFLECTION_PROMPT` daily-reflection ritual surface → canonical (visible output preserved)

The morning check-in and evening reflection rituals on the private-mentor page. Practitioner submits `what_happened` (and optionally `how_i_responded`); response appears as a formatted message in the conversation surface (`**proximity** — sage_perspective`, italicised `evening_prompt`).

| `REFLECTION_PROMPT` field | Canonical mechanism(s) / source | Status under alt-3 (Option 1) |
|---|---|---|
| `katorthoma_proximity` | mechanism 10 | **Preserved as visible output** on the ritual surface. Layer 3 projects the canonical proximity to the practitioner. |
| `passions_detected[]` (root_passion, sub_species, false_judgement) | mechanisms 2 + 3 + 5 | **Preserved as visible output**. Layer 3 projection. |
| `what_you_did_well` | Layer 3 prose translation of mechanism 9 (positive virtue engagement) | **Preserved as visible output**. Layer 3 projection. |
| `sage_perspective` | Layer 3 prose translation of `improvement_path` | **Preserved as visible output**. Layer 3 projection. |
| `evening_prompt` | Today: LLM-composed reflective question | **Preserved as visible output**. Layer 3 projection. May be designated for own-page presentation under Deliverable 14a (TBD by founder during 14a design). |
| `structured_observation` | Mentor knowledge persistence pipeline | Continues as internal pipeline; under Deliverable 14a it MAY also become a visible output to the practitioner (founder direction in this session: "so the practitioner can see a completed reflection and the response" — design captures the four pieces explicitly). Founder decides at D14a review. |
| `disclaimer` | R3 disclaimer | Carried in API response envelope; no practitioner-facing change. |

Deliverable 14a specifies the daily-reflection ritual endpoint design in full. The endpoint may or may not migrate to its own page; that is a UX decision in 14a, not a constraint at the canonical-framework level.

#### Table 4b — Deferral-resolution surface → canonical (AC-18 holds)

The new alt-3 surface for resolving `OPEN_DEFERRAL` flags from prior instances per AC-15 sub-option 1b. Practitioner sees specific deferred question(s); submits reflection content addressing them; engine processes deterministically; updates the original instance score retrospectively; closes the `OPEN_DEFERRAL`.

| Surface output | Canonical mechanism(s) / source | Status under alt-3 (AC-18 holds) |
|---|---|---|
| Visible reflection score | n/a | **Removed at the deferral-resolution surface (AC-18).** No proximity, no perspective, no prompt visible to the practitioner. |
| Visible perspective / prose | n/a | **Removed (AC-18).** |
| Visible observation | n/a | **Removed (AC-18).** |
| Internal classification update | mechanism 10 retrospectively applied to the original instance | Visible in the scoring record but not as a celebratory artefact. |
| Closed `OPEN_DEFERRAL` flag | AC-15 sub-option 1b mechanism | Visible in the scoring record. The only evidence of completed examination. |

AC-18's architectural argument applies to the deferral-resolution surface specifically: the deferred question is the question the engine deterministically withheld at scoring time because the practitioner was best served by sitting with it. Producing visible output on resolution would re-introduce the reputation-generation mechanism the architecture was designed to remove. AC-18 is non-negotiable on this surface.

Deliverable 14b specifies the deferral-resolution surface design in full. The surface is a structured intake form that presents a deferred question and waits, producing only the internal classification update and the closed flag.

#### How the two surfaces relate

The two surfaces share the canonical engine output but project differently to the practitioner. Both run through the same Layer 1 → engine → Layer 3 sandwich (AC-12). The difference is at Layer 3:

- **Layer 3 ritual projection** (Table 4a): produces visible proximity, perspective, prompt, and (potentially) observation.
- **Layer 3 deferral projection** (Table 4b): produces no visible output. The internal classification update and closed flag are the only artefacts.

The surfaces may share a route or live on separate routes. That is an implementation question for Phase 2 build, not a canonical-framework question. What matters at the framework level is that one canonical engine output supports both projections, governed by which surface invoked it.

This Option 1 scoping correction does not relax the philosophical commitment behind AC-18; it correctly scopes it to the surface where the architectural argument applies.

### Table 5 — Compact V3 variants → canonical

`score-scenario` (`SCENARIO_PROMPT`):

| Existing field | Canonical mechanism(s) | Notes |
|---|---|---|
| `katorthoma_proximity` | mechanism 10 | Direct projection. |
| `passions_detected[]` (root_passion, sub_species, false_judgement) | mechanisms 2 + 3 + 5 | Three mechanisms folded. |
| `kathekon_quality` (`strong` / `moderate` / `marginal` / `contrary`) | derived from mechanisms 7 + 9 | Composite projection. The four-level quality scale is application-specific; it lives in the score-scenario projection, not in the canonical framework. |
| `feedback` (2-3 sentences) | Layer 3 prose | Translation of upstream rule outputs. |
| `sage_says` (1 sentence) | Layer 3 prose | Translation focused on mechanism 1 output (what is within prohairesis). |

`score-social`:

| Existing field | Canonical mechanism(s) | Notes |
|---|---|---|
| `poster_passions[]` | mechanisms 2 + 3 + 5 (scoped to the post author) | Domain-context split; not a separate canonical mechanism. |
| `reader_triggered_passions[]` | mechanisms 2 + 3 + 5 (scoped to the audience) | Domain-context split. |
| `false_judgements[]` | mechanism 5 | Direct projection. |
| `corrections[]` | derived from `improvement_path` | Layer 3 projection. |
| `katorthoma_proximity` | mechanism 10 | Direct projection. |
| `proximity_label` | mechanism 10 (English label for the proximity level) | R8c projection — English-only on the website surface. |
| `publish_recommendation` (`publish` / `revise` / `reconsider`) | downstream classification rule on top of mechanism 10 | Application-specific classification. Lives in the score-social projection, not in the canonical framework. The mapping is `principled` / `sage_like` → `publish`; `deliberate` → `revise`; `habitual` / `reflexive` → `reconsider`. |

The compact variants are honest projections. The fields that add information beyond the canonical framework (`kathekon_quality`, `publish_recommendation`) are application-specific downstream classifications, not new canonical content. They live in their respective endpoint projections.

## Cleanliness ratings per canonical mechanism

For each canonical mechanism, the cleanliness rating reflects how much of the mechanism is genuinely deterministic versus how much requires interpretive judgement. The rating uses three levels:

- **HIGH** — the mechanism is fully deterministic given the inputs. No interpretive sub-steps remain. Tier 1 forced clarification (AC-13) handles upstream ambiguity if any.
- **PARTIAL** — the mechanism has a deterministic core plus a small number of interpretive sub-steps. The interpretive seams are named, structurally bounded, and either resolved by AC-13 structured intake, AC-17 named flags, or AC-14 deterministic withholding (Tier 3 OPEN_DEFERRAL).
- **INTERPRETIVE** — the mechanism would require interpretive judgement throughout. **No mechanism in the canonical framework has this rating.** The architecture's design goal is that every mechanism has a deterministic core; mechanisms that would otherwise be INTERPRETIVE are restructured (split into smaller mechanisms, or have their interpretive seams hoisted to Tier 1 intake).

| # | Mechanism | Cleanliness | Interpretive seams (if any) | Mitigation |
|---|---|---|---|---|
| 1 | prohairesis_filter | PARTIAL | "Did the practitioner have a reasonable opportunity to reflect?" | Tier 1 ELEMENT_FUSION clarification at intake (AC-13). |
| 2 | passion_root_detection | PARTIAL | "Is this a present-state or future-state concern?" — affects 2×2 matrix axis. | Tier 1 TEMPORAL_AMBIGUITY clarification (AC-13). |
| 3 | passion_sub_species | HIGH | None at the mechanism level. Compound passions flagged via `compound_passion_flags[]`. | — |
| 4 | passion_causal_stage | PARTIAL | "Where exactly did assent go wrong?" | Practitioner narrative usually identifies stage; profile prior breaks ties. |
| 5 | passion_false_judgement | PARTIAL | Case-specific refinement of canonical lookup. | `refinement_source` flag distinguishes PROFILE-derived (high confidence) from DERIVED (lower confidence). |
| 6 | oikeiosis_stage | HIGH | None — deterministic mapping of action target to circle. | — |
| 7 | oikeiosis_obligation | PARTIAL | Cicero's Q5 (when honourable conflicts with advantageous). | Usually resolved by upstream virtue assessment; circle_conflict flag if not. |
| 8 | value_indifferent | HIGH | None — canonical lookup of indifferents and axia. Value error types (inflation / deflation / inverse) are deterministic. | — |
| 9 | virtue_domain_engaged | PARTIAL | Phronesis ↔ andreia circular dependency (unity thesis). | Two-pass sequencing (phronesis first, using mechanism 8 output). Deliverable 9. |
| 10 | katorthoma_proximity | PARTIAL | (a) Directional modifier requires `SELF_REPORT_DEPENDENT` data. (b) Eupatheia boundary in Senecan grade overlay requires `CONFIDENCE_WEIGHTED` longitudinal evidence. | AC-17 names both as residual philosophical seams, not engineering gaps. |

Three mechanisms (3, 6, 8) are HIGH; seven are PARTIAL; none is INTERPRETIVE. The PARTIAL ratings are not weaknesses — they are honest acknowledgements of where determinism relies on intake clarification or longitudinal evidence rather than on perfect raw input.

## What this canonical framework enables

1. **Index taxonomy (Deliverable 5).** Every chunk in the retrieval index carries a `canonical_mechanism` field tagged from this taxonomy. Retrieval can filter by mechanism, not only by semantic similarity. This is the foundation for AC-2 hybrid retrieval and AC-3 re-ranking on top of mechanism-tagged content.

2. **Score-family endpoint migration (Phase 3+).** Today's score-family endpoints (`/api/score`, `/api/score-document`, `/api/reflect`, `/api/score-scenario`, `/api/score-social`, `/api/mentor/private/reflect`) consume bespoke output shapes. With the canonical framework adopted, each can migrate to a single `runDeterministicEngine(input)` call that returns canonical output, projected by their existing surface code into their consumer-specific shape via the mapping tables above. Migration becomes mechanical, not redesign.

3. **Cross-surface consistency.** When the practitioner's profile says "philodoxia detected at strong intensity in this instance," the same finding appears identically across the conversation surface, the proximity ring, the founder-hub flow (when migrated), and any future surface. One fact in the system, not five drifted variants.

4. **Cleanliness audit trail.** The cleanliness ratings above are not invented. Each rating reflects a structural property of the mechanism — deterministic core, interpretive seam location, and the AC-13 / AC-17 mitigation if any. The ratings let the founder review where determinism is real and where it relies on intake clarification or longitudinal evidence.

## What this framework does not decide

- **Deterministic-engine implementation language** (Phase 2). The framework specifies what the engine does, not how it is built.
- **Per-mechanism rule storage format** (Deliverable 5). The rules are operationalised in Deliverable 8; storing them in code vs in a structured rules file is a Deliverable-5 question.
- **Migration order of score-family endpoints** (Phase 3+). The framework supports migration; the order is a future-phase question.
- **Whether `iterative_refinement` deserves its own canonical mechanism.** Currently folded into mechanism 10's Senecan grade overlay. If longitudinal-evaluation needs grow, it may earn its own slot. Logged as Phase 3+ open question.
- **Whether `kathekon_quality` in compact variants warrants a separate canonical mechanism.** Today it is a derived projection of mechanisms 7 + 9. If the projection rule becomes complex, promotion may be warranted.
- **Whether the mentor knowledge base (Layer 5 — non-doctrinal historical / global context) is part of the canonical framework.** It is not — Layer 5 is informational context for Layer 3 translation, not a reasoning mechanism. No canonical-framework slot.

## R6 / R7 / R8 compliance

- **R6a** (Never replicate V1 structures): the framework does not inherit V1's 4-virtue independent-scoring pattern. Mechanism 9 explicitly preserves the unity thesis via `unity_inconsistency` and `unity_resolution` outputs.
- **R6b** (Unity of virtue): mechanism 9 implements the unity check at the rule level. No virtue is scored independently.
- **R6c** (Qualitative proximity, not numeric): mechanism 10 preserves the five qualitative levels (reflexive / habitual / deliberate / principled / sage_like) without numeric scoring.
- **R6d** (Passions as diagnostic, not punitive): mechanisms 2–5 produce diagnostic outputs (`false_judgements[]`, `intervention_priority[]`) rather than score deductions.
- **R6e** (Copying structure produces inferior results): the framework is derived from the corpus methodology, not copied from existing endpoint shapes.
- **R7** (Source fidelity): every mechanism cites its Stoic Brain source. No mechanism originates from training data.
- **R8a** (Strict glossary in data files and API responses): canonical mechanism IDs use Greek technical terms as primary identifiers (`prohairesis_filter`, `oikeiosis_stage`, `katorthoma_proximity`).
- **R8b** (Developer documentation): this document uses English-first with Greek/technical terms in brackets (e.g., "moral choice (`prohairesis`)").
- **R8c** (Website / user-facing): user-facing surfaces project canonical mechanism IDs into English-only labels (e.g., "Approaching wisdom" rather than "katorthoma_proximity: principled"). The `proximity_label` field in `score-social` is the existing pattern.
- **R8d** (Skill contracts / agent-facing): agent-facing API responses use English outcome-focused descriptions; canonical Greek IDs appear in the schema only.

## Honest disclosure

This canonical framework is derived from:
- The output schemas in the alt-3 handoff covering all ten alt-3 rules.
- The Stoic Brain corpus as it stands in `stoic-brain-compiled.ts` (the 8 condensed context constants) and `scoring.json`.
- The endpoint shapes in `sage-reason-engine.ts`, `mentor/private/reflect/route.ts`, `score-scenario/route.ts`, and `score-social/route.ts` as of 2026-04-29 (the four divergent presentations).

The framework does not introduce new Stoic content. The decomposition into nine instance-level mechanisms plus one composite is a presentation choice, made to serve AC-12's translation-sandwich requirement that every Stoic inference originates from a deterministic rule and not from Claude.

## Approval gate

This deliverable plus Deliverables 3 (passion taxonomy) and 8 (operationalised scoring rules) form the critical path. All three must be approved before Phase-1 deliverables 4 (corpus inventory), 5 (index schema), 6 (retrieval interface), 9 (rule dependency map), and 10/11 (Layer 1 / Layer 3 translation specifications) proceed. The remaining Phase-1 deliverables can also be drafted in parallel but should not be approved before the critical path is set.

---

*End of Deliverable 2.*
