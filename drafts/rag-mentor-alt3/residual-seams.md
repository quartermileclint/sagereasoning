# Deliverable 19 — Residual Seams Handling

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-17 (two residual seams acknowledged as philosophical residues — `SELF_REPORT_DEPENDENT` and `CONFIDENCE_WEIGHTED`); AC-12 (translation-sandwich — flags surface honestly in prose where they fire); AC-18 (no shareable artefact — flag projection on table_4b is structured-only, not visible prose); R19c (limitations acknowledged in user-facing prose); R6d (passions diagnostic, not punitive — flags name what the engine does and does not know rather than penalising the practitioner).

**Cross-references:**
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — Rule 5's `refinement_source` (PROFILE / DERIVED) interacts with the `SELF_REPORT_DEPENDENT` flag; Rule 10's two AC-17 outputs are the canonical sources)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — Refinement 3 specifies per-surface flag projection; Refinement 5 specifies the Validation Addendum Adjustment 1 prose projection that depends on AC-17 flags)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — the prompt template's exclusion rules forbid AC-17 flag suppression)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15 — Principle 3 observation language depends on AC-17 flag context)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — `ac_17.self_report_dependent` and `ac_17.confidence_weighted` surface as structured fields)
- `/drafts/rag-mentor-alt3/progression-delta.md` (D17 — `CONFIDENCE_WEIGHTED` interacts with the multi-instance evidence threshold)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — flag prose surfaces in `sage_perspective`)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — flag projection on the deferral-resolution surface is suppressed per AC-18)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — `EUPATHEIA_BOUNDARY` Tier 3 trigger fires when `CONFIDENCE_WEIGHTED: low` insufficient)
- `/drafts/rag-mentor-alt3/verification.md` (D18 — the verifier confirms flags are surfaced in prose where they fired)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture; AC-17 source)
- `/manifest.md` AC1, R6d, R19c, R20d

---

## Plain-language summary

Two architectural commitments in alt-3 acknowledge what the deterministic engine cannot fully resolve:

1. **`SELF_REPORT_DEPENDENT`** — some classifications depend on the practitioner's self-report of their own motivation. The engine reads the narrative; it cannot independently confirm what the practitioner was reasoning toward. When a Mechanism's output rests on this self-report, the flag fires.
2. **`CONFIDENCE_WEIGHTED`** — some classifications need longitudinal evidence to confirm. A single instance's data may suggest chara (rational joy) or polished surface over passion; only multiple instances over time can disambiguate. The flag's three levels (`low` / `medium` / `high`) name how much evidence supports the classification.

Both flags are **philosophical residues, not engineering gaps** — the Stoic tradition itself acknowledges that motivation is private and that long-term character change is what tests claims of equanimity. The architecture surfaces the residues honestly rather than papering them over.

This deliverable specifies how each flag fires (the engine logic that sets it), how it projects per surface (the prose patterns Layer 3 produces per consumer), and how the flags interact with each other (e.g., `EUPATHEIA_BOUNDARY` Tier 3 triggers when `CONFIDENCE_WEIGHTED: low` is the determining factor).

The deliverable cross-references D11 Refinement 3 (per-surface projection rules), D11 Refinement 5 (Validation Addendum Adjustment 1 prose projection), D15 Principle 3 (long-deferred observation language), and D17 (progression delta confidence interaction). Each of those deliverables names where flag specifications interact; D19 is the single source of truth for the flag specifications themselves.

## Glossary

- **`SELF_REPORT_DEPENDENT`** — boolean flag set by Mechanism 10. True when the directional modifier or the proximity_risk_flag depends on practitioner self-report data the engine cannot independently confirm.
- **`CONFIDENCE_WEIGHTED`** — three-level enum set by Mechanism 10: `low`, `medium`, `high`. Names how much longitudinal evidence supports the classification.
- **Refinement_source (PROFILE / DERIVED)** — Rule 5's flag from D8. Distinct from but related to `SELF_REPORT_DEPENDENT`. PROFILE means the practitioner's profile already records this false judgement at recurrent intensity (high confidence). DERIVED means the false judgement is inferred from the current narrative only (lower confidence).
- **Eupatheia boundary** — the architectural region where the engine cannot confirm whether a narrative shows chara (rational joy), boulesis (rational willing), or eulabeia (rational caution) versus polished surface over the passion counterpart (hedone, epithumia, phobos). Per `EUPATHEIA_BOUNDARY` Tier 3 trigger.
- **Senecan grade** — Rule 10's output: pre_progress / grade_3 / grade_2 / grade_1 / sage. Senecan grade requires longitudinal evidence per AC-17.
- **Real-action surfaces / artefact-evaluation surfaces / practice surface / engine-level** — D11 Refinement 3's four surface categories. Each projects flag prose differently.

## `SELF_REPORT_DEPENDENT` — full specification

### When it fires

`SELF_REPORT_DEPENDENT: true` is set by Mechanism 10 (per D8 Rule 10 §"Logic step 4 — directional modifier") in any of these scenarios:

1. **Directional modifier dependency.** Mechanism 10's `direction` (improving / stable / declining) reads the practitioner's profile record of how this instance compares to prior instances. The comparison logic (per D17) reads the practitioner's self-report at the time of each prior instance — the engine cannot independently confirm motivation across instances. **Default: fires whenever Mechanism 10 produces a non-stable direction value.**

2. **Praxis-level motivation classification.** Mechanism 10's `proximity_risk_flag: CONVENTION_SUBSTITUTION` requires the engine to know whether the practitioner acted from convention rather than understanding. The narrative may not reveal motivation directly; the practitioner's self-report is the only confirmation. **Fires whenever `CONVENTION_SUBSTITUTION` is set.**

3. **`proximity_risk_flag: STABILITY_TEST`.** The engine knows the practitioner has improved but cannot confirm the improvement is stable under stress without the practitioner's report of how the improvement holds. **Fires whenever `STABILITY_TEST` is set.**

4. **Mechanism 5's `refinement_source: DERIVED`.** When Rule 5 produces a false-judgement entry whose `refinement_source: DERIVED` (no profile prior; inferred from current narrative only), and that false judgement is the dominant input to Mechanism 9's virtue classification, the downstream classification depends on the practitioner's framing of the current narrative. **Fires when DERIVED false judgements drive the proximity composite.**

The flag is a **boolean per request** — it fires (true) or does not (false). The narrative may have multiple potential triggers; if any of them fires, the flag is true. The engine_diagnostics field carries the specific reason:

```typescript
engine_diagnostics: {
  ac_17_self_report_dependent: boolean;
  ac_17_self_report_dependent_reason: string;  // 'directional_modifier' | 'convention_substitution' | 'stability_test' | 'derived_false_judgement_dominant' | 'multiple'
  ...
}
```

When multiple reasons apply, the reason is `'multiple'` and a diagnostic sub-block lists the specific scenarios.

### Per-surface projection

Per D11 Refinement 3, the flag projects differently per Layer 3 consumer:

#### Real-action surfaces (Tables 1, 4a — `/api/score`, `/api/score-decision`, `/api/mentor/private/reflect` ritual, `/api/reflect`)

The flag surfaces prominently in the philosophical_reflection or sage_perspective prose:

> "This classification depends on your self-report of why you took this action; the engine cannot confirm motivation independently."

Or for ritual surfaces:

> "The reading depends on your self-report of what was operative for you in that moment."

The placement: at the end of the relevant prose paragraph, naming the dependency before the practitioner moves on. The architectural commitment per R19c (limitations acknowledged): the practitioner sees what the engine knows and does not know.

#### Artefact-evaluation surfaces (Table 1 for `/api/score-document`, Table 5 for `/api/score-social`)

The flag surfaces as authorial-state caveats:

> "This reading depends on your authorial framing; reasoning operative in the document may differ from what you intend."

Or for `/api/score-social`:

> "The poster-passion reading depends on your authorial intent; the post may invite different reactions in readers than you intended (reader_triggered_passions[] surfaces those separately)."

The placement: in the Layer 3 prose's `feedback` or `corrections[]` section. The flag distinguishes authorial intention from operative reasoning.

#### Practice surface (Table 5 entry for `/api/score-scenario`)

AC-17 flags **discount** on the practice surface. The practitioner is reasoning about a hypothetical, not their own action; self-report is the framing, not the practitioner's actual motivation. The flag does not project in prose. The structured field is set in the engine_diagnostics for completeness but does not surface to the practitioner.

#### Engine entry point (`/api/reason` — Tables 1, 2, 6 for the three depths)

The flag surfaces as a **structured field in the response envelope**, not as prose. Agent callers consume the structured flag; the agent's own product handles prose presentation (per R8d skill contracts — agent-facing).

#### Deferral-resolution surface (Table 4b — D14b)

Per AC-18, the flag does NOT surface in prose. The structured `ac_17.self_report_dependent` field is populated for engine_diagnostics observability but the response's narrative fields are NULL per Table 4b. The internal classification update reflects the resolved state; the practitioner sees only "Your reflection has been recorded."

### Layer 3 prose patterns — canonical templates

The exact prose surfaced by Layer 3 (per D12's strict prompt template). When `ac_17_self_report_dependent: true` and the surface is a real-action surface:

```
Pattern A — direct self-report dependency (default):
  "This classification depends on your self-report of why you took this action; the engine cannot confirm motivation independently."

Pattern B — convention substitution:
  "The action looked like [proximity_label] in form. The engine cannot tell from this instance alone whether you acted from understanding or from convention; your self-report is the disambiguator."

Pattern C — stability test:
  "Recent instances show movement toward [direction]. The engine cannot confirm the improvement is stable under stress without longitudinal evidence; your reports of how the improvement holds will sharpen the picture."

Pattern D — derived false judgement dominant:
  "The false judgement detected is inferred from the current narrative; it is not yet a profile-confirmed pattern. Future instances will sharpen the picture."
```

Pre-D-A16 promotion, the patterns are alt-3-derived (the canonical alt-3 architecture handoff names the patterns in lines 175–177 and the Validation Addendum). Post-promotion, the patterns are corpus passages with `passage_type: focus_question_stem` (or a related `passage_type: ac_17_prose_template` if Phase-2 build separates the catalogue's prose-template content from the question-stem content).

## `CONFIDENCE_WEIGHTED` — full specification

### When it fires

`CONFIDENCE_WEIGHTED: low | medium | high` is set by Mechanism 10 (per D8 Rule 10 §"Logic step 5 — Senecan grade overlay"). The level reflects the longitudinal evidence supporting the classification:

| Level | Condition | Effect |
|---|---|---|
| `low` | Single recent instance OR domain-matched prior_state with < 3 instances within 14 days OR `EUPATHEIA_BOUNDARY` Tier 3 deferred | Conservative defaults: Senecan grade defaults to grade_3 (or below); direction defaults to stable; eupatheia classifications cannot be confirmed |
| `medium` | 3–9 domain-matched prior instances within 14–60 days OR retrospectively-resolved deferral OR `STATED_OPERATIVE_CONFLICT` resolved consistently across recent instances | Senecan grade and direction can move from defaults; eupatheia classifications can be tentatively confirmed |
| `high` | 10+ domain-matched prior instances spanning ≥ 60 days with consistent pattern OR profile-confirmed false judgement (Rule 5 `refinement_source: PROFILE`) | Senecan grade and direction read with full confidence; eupatheia classifications confirmed; cross-domain patterns surface |

The level is determined per the windowing thresholds in D17 §"Single-instance vs multi-instance evidence". Phase-2 production observation may refine the thresholds.

### Engine state propagation

The flag is set at Mechanism 10 (Position 12 per D9). It propagates to:

- The response envelope's `ac_17.confidence_weighted` field.
- The structured score fields' downstream consumers (proximity ring widget reads it for tooltip rendering).
- D17's progression delta computation (the `direction` field's confidence is gated by this flag).
- D14b's retrospective update (post-resolution, the resolved classification carries `confidence_weighted: medium` per D14b §"Step 9").
- D15 Principle 3's domain-match observation (the observation's prose acknowledges the confidence level when surfacing).

### Per-surface projection

#### Real-action surfaces (Tables 1, 4a)

When `confidence_weighted: low`:

> "This is a single-instance observation; longitudinal evidence is needed to confirm a pattern."

When `confidence_weighted: medium`:

> Layer 3 typically does not surface the medium level in prose — the level is structurally available; the prose's main content carries the evaluation. Exception: when the practitioner's narrative explicitly references progression, the prose may acknowledge the medium-confidence state (per D17's Layer 3 prose patterns).

When `confidence_weighted: high`:

> Layer 3 does not surface the high level in prose — confidence at high is the engine's default state when evidence is sufficient; no caveat is needed.

#### Artefact-evaluation surfaces (Tables 5, partial Table 1)

`CONFIDENCE_WEIGHTED` rarely fires here. Artefact evaluation is per-instance; longitudinal evidence is less directly relevant. When it fires (e.g., recurring authorial pattern across multiple submitted documents from the same practitioner), the prose surfaces:

> "This authorial pattern reads as [observation], confirmed across recent submissions."

The pattern name traces to the practitioner's authorial-pattern record (Phase 3+ — not Phase 1).

#### Practice surface (Table 5 for `/api/score-scenario`)

`CONFIDENCE_WEIGHTED` does not fire on the practice surface — the hypothetical doesn't have longitudinal evidence to weight. The engine_diagnostics field is set to `not_applicable`; the structured response envelope's `ac_17.confidence_weighted` is `not_applicable`.

#### Engine entry point (`/api/reason`)

The flag surfaces as a structured field; agent callers consume directly.

#### Deferral-resolution surface (Table 4b — D14b)

Per AC-18, the flag does NOT surface in prose. The structured field is populated for engine_diagnostics; the response's narrative fields are NULL.

### Layer 3 prose patterns — canonical templates

For `confidence_weighted: low`:

```
Pattern A — single-instance default:
  "This is a single-instance observation; longitudinal evidence is needed to confirm a pattern."

Pattern B — eupatheia boundary deferred:
  "[Engine has produced a Tier 3 OPEN_DEFERRAL on this point. The deferred question is in the scoring record; the architecture does not assert until you've sat with the question.]"

Pattern C — sparse window:
  "Recent instances are sparse in this domain; the trajectory will sharpen as the record grows."
```

For `confidence_weighted: medium`:

```
Pattern A — recent improvement:
  "Recent instances show [signal]. The pattern is confirmed across the recent window but a longer trajectory is needed for higher confidence."

Pattern B — retrospective resolution:
  "The retrospective update on the [date] instance reflects your reflection; the classification is now confirmed at medium confidence."
```

For `confidence_weighted: high`:

> Typically silent. The engine's evaluation is at full confidence; no caveat needed.

## Interaction between the two flags

The two flags interact in specific cases:

### Case 1 — Single new instance, philodoxia profile-confirmed (`SELF_REPORT_DEPENDENT: true, CONFIDENCE_WEIGHTED: high`)

The practitioner has a profile-confirmed philodoxia pattern (Rule 5 `refinement_source: PROFILE` for ten+ recent instances). The current instance fires philodoxia again. Mechanism 10 produces `direction: stable` (the pattern is recurring) with `confidence_weighted: high` (10+ domain-matched instances). But the action's directional component (was it the same kind of philodoxia, or has the practitioner shifted) requires self-report.

Layer 3 surfaces: `confidence_weighted: high` is silent in prose; `self_report_dependent: true` surfaces with Pattern A — *"This classification depends on your self-report of why you took this action..."*

### Case 2 — Cold-start practitioner (`SELF_REPORT_DEPENDENT: false, CONFIDENCE_WEIGHTED: low`)

First-ever instance. No prior_state. Mechanism 10 cannot compute direction; defaults to stable. The directional modifier dependency does not fire (no comparison happened). `SELF_REPORT_DEPENDENT: false`.

Layer 3 surfaces: `confidence_weighted: low` with Pattern A — *"This is a single-instance observation; longitudinal evidence is needed to confirm a pattern."*

### Case 3 — Eupatheia boundary on chara (`SELF_REPORT_DEPENDENT: true, CONFIDENCE_WEIGHTED: low`)

The narrative shows a chara-shape pattern (rational joy at a present good). Mechanism 2's `eupatheia_candidate: chara` fires. Mechanism 5 Pass-2 cannot fill `correct_judgement` because Mechanism 2's candidate is unconfirmed without longitudinal evidence. The Tier 3 trigger `EUPATHEIA_BOUNDARY` fires; an OPEN_DEFERRAL is added.

Both flags fire: `SELF_REPORT_DEPENDENT: true` (the eupatheia confirmation depends on the practitioner's reflection on prior similar instances); `CONFIDENCE_WEIGHTED: low` (single-instance evidence).

Layer 3 surfaces (the response is mainly the OPEN_DEFERRAL surfacing per D13):

> "You described responding with chara (rational joy at this outcome). The engine cannot confirm from this instance alone whether the response was genuinely chara or polished surface over hedone (irrational pleasure). The deferred question is in your scoring record — sit with it when you're ready."

The prose names both flags in context. The OPEN_DEFERRAL flag surfaces with the canonical question.

### Case 4 — Validation Addendum Adjustment 1 unstable phronesis (`CONFIDENCE_WEIGHTED: low` default)

Per D8 Validation Addendum + D11 Refinement 5: Rule 9 produces `unity_inconsistency: true`. Rule 10 interprets conditionally. Without sufficient longitudinal evidence to disambiguate (Rule 5's `refinement_source: DERIVED` and no profile-confirmed false-judgement pattern):

> "Across this instance, the unity check shows inconsistency. Without sufficient longitudinal evidence, the engine treats this as developmental noise (diagnostic only) rather than as misidentified phronesis. Future instances will sharpen the picture."

The `CONFIDENCE_WEIGHTED: low` flag's prose is integrated into the per-Adjustment prose (per D11 Refinement 5). The unstable-vs-false phronesis disambiguation defaults conservatively to unstable phronesis under uncertainty.

## Flag suppression — what is non-negotiable

Per D11 §"Exclusion (what the prose must not include)":

1. **The exclusion rule is hard.** Layer 3 must not suppress AC-17 flags in the prose where they fire. The strict prompt template (D12) names this rule in the system block.
2. **The verifier (D18) catches suppression.** Score consistency verification compares `ac_17.self_report_dependent` and `ac_17.confidence_weighted` in the structured fields against the engine's `engine_diagnostics` values. Suppression (the field absent or set to `false` / `high` when the engine produced `true` / `low`) is a fail.
3. **Per AC-18, the deferral-resolution surface is the one place where prose suppression is correct** — not because the flags are suppressed, but because the entire visible prose output is NULL on table_4b. The structured fields are still populated for engine_diagnostics observability.

The flags are honest acknowledgements of what the engine knows and does not know. Suppression is a violation of the architectural commitment.

## Interaction with Mechanism 5's `refinement_source` (PROFILE / DERIVED)

Per D8 Rule 5 §"Logic Pass 1 step 1.5":

- **PROFILE-derived false judgement:** the practitioner's profile already records this false judgement at recurrent intensity. High confidence; the engine's classification is well-supported.
- **DERIVED false judgement:** the false judgement is inferred from the current narrative only. Lower confidence; the engine's classification is single-instance.

The interaction with `SELF_REPORT_DEPENDENT`:

- PROFILE-derived false judgements rest on the cumulative practitioner record. The engine has aggregated prior self-reports across many instances. Per D17, this gives `confidence_weighted: high` for the directional comparison. `SELF_REPORT_DEPENDENT` may still fire (the action's direction depends on motivation), but the comparison's evidence is stronger.
- DERIVED false judgements rest on a single instance's narrative. The engine's classification carries inherent self-report dependency — the practitioner's framing of the current narrative is the only data. `SELF_REPORT_DEPENDENT: true` fires reliably; `CONFIDENCE_WEIGHTED: low` is the default.

The two flags compose to express the engine's epistemic state. Phase-2 production observation will refine the interaction patterns; the architecture commits to surfacing both flags honestly.

## Worked examples — full scenarios

### Example A — Philodoxia with profile prior, recent stable pattern

**Engine state:**
- M2: dominant_passion: epithumia; M3: dominant_sub_species: philodoxia
- M5: dominant_false_judgement.refinement_source: PROFILE
- M10: proximity_level: deliberate, direction: stable, senecan_grade: grade_3
- AC-17: self_report_dependent: true, confidence_weighted: high

**Layer 3 prose (philosophical_reflection — abridged):**

> "Philodoxia is operating in this instance with the inflation of reputation to genuine-good status — the recurring profile pattern. Phronesis is the operative virtue deficiency. *This classification depends on your self-report of why you're rehearsing.*"

The `SELF_REPORT_DEPENDENT` flag's Pattern A is appended; `CONFIDENCE_WEIGHTED: high` is silent (no caveat needed).

### Example B — Philodoxia first-ever instance

**Engine state:**
- M2: dominant_passion: epithumia; M3: dominant_sub_species: philodoxia
- M5: dominant_false_judgement.refinement_source: DERIVED
- M10: proximity_level: deliberate, direction: stable (default — no prior_state), senecan_grade: grade_3 (default)
- AC-17: self_report_dependent: true (DERIVED false judgement dominant), confidence_weighted: low

**Layer 3 prose (philosophical_reflection — abridged):**

> "The narrative reads philodoxia (love of honour) at the assent stage. The false judgement detected is inferred from this instance; it is not yet a profile-confirmed pattern. Phronesis is the operative virtue deficiency. *This is a single-instance observation; longitudinal evidence is needed to confirm a pattern.*"

Both flags surface. Pattern D for `SELF_REPORT_DEPENDENT` (DERIVED dominant) and Pattern A for `CONFIDENCE_WEIGHTED: low`.

### Example C — Validation Addendum unstable phronesis

**Engine state:**
- M9: unity_inconsistency: true; mixed virtue ratings (phronesis adequate; sophrosyne weak)
- M5: refinement_source: DERIVED (no profile prior)
- M10: applies Adjustment 1 conditional → defaults to unstable phronesis under uncertainty
- AC-17: self_report_dependent: false (the unstable-phronesis interpretation is diagnostic-not-punitive); confidence_weighted: low

**Layer 3 prose (per D11 Refinement 5 — Adjustment 1 insufficient longitudinal evidence case):**

> "Across this instance, the unity check shows inconsistency. Without sufficient longitudinal evidence, the engine treats this as developmental noise (diagnostic only) rather than as misidentified phronesis. Future instances will sharpen the picture."

The prose names the Adjustment 1 case (insufficient longitudinal evidence) and the `CONFIDENCE_WEIGHTED: low` flag in a single integrated paragraph.

### Example D — Eupatheia boundary on chara

**Engine state:**
- M2: eupatheia_candidate: chara
- M5 Pass-2: cannot fill correct_judgement (eupatheia unconfirmed)
- M10: proximity_level: deliberate; EUPATHEIA_BOUNDARY Tier 3 fires; OPEN_DEFERRAL added
- AC-17: self_report_dependent: true, confidence_weighted: low

**Layer 3 prose:**

> "You described responding with chara (rational joy at this outcome). The engine cannot confirm from this instance alone whether the response was genuinely chara or polished surface over hedone (irrational pleasure). The deferred question is in your scoring record — sit with it when you're ready. *This is a single-instance observation; longitudinal evidence is needed to confirm.*"

The OPEN_DEFERRAL surfacing carries the integrated AC-17 prose. The deferred question lives at the deferral-resolution surface (D14b); resolution updates the original instance to `confidence_weighted: medium` per D14b §"Step 9".

### Example E — D14b deferral resolution (AC-18 holds; flags suppressed in prose)

**Engine state at deferral resolution:**
- M5: dominant_false_judgement.correct_judgement filled (eupatheia confirmed → chara)
- M10: retrospectively updated proximity (no deferral remains)
- AC-17: self_report_dependent: true (the practitioner's reflection is the self-report); confidence_weighted: medium (post-resolution)

**Layer 3 output (Table 4b NULL projection):**

```json
{
  "presented_question": "<original deferred question>",
  "submission_received": true,
  "internal_classification_updated": true,
  "open_deferral_closed": true,
  "visible_score": null,
  "visible_perspective": null,
  "visible_observation": null,
  "ui_message": "Your reflection has been recorded."
}
```

The structured `ac_17.self_report_dependent` and `ac_17.confidence_weighted` fields are populated in `engine_diagnostics` for observability but the response's narrative fields are NULL per AC-18.

## Cleanliness rating

The `SELF_REPORT_DEPENDENT` specification is **HIGH cleanliness** at the trigger conditions (four named scenarios; deterministic OR composition) and **HIGH cleanliness** at per-surface projection rules (four surface categories; canonical prose templates per category).

The `CONFIDENCE_WEIGHTED` specification is **HIGH cleanliness** at the level definitions (three named levels with windowing thresholds) and **HIGH cleanliness** at per-surface projection.

The interaction cases (4 named cases with worked examples) are **HIGH cleanliness** — each case is structurally bounded and produces a deterministic prose output.

The `confidence_weighted` thresholds (3 / 10 instances; 14 / 60 days) are **PARTIAL cleanliness** — they are working values per Phase-2 production observation. The architecture commits to the level structure; specific thresholds may shift.

## R6d / R19c / R20a compliance

- **R6d (passions diagnostic, not punitive):** the flags name what the engine knows and does not know. Declining direction with `SELF_REPORT_DEPENDENT: true` is diagnostic — the engine names the dependency rather than asserting motivation. The architecture honours R6d by surfacing the flags as honest acknowledgements.
- **R19c (limitations acknowledged in user-facing prose):** AC-17 flag projection is the operational implementation of R19c. The prose names the engine's limits where they apply.
- **R20a (vulnerable user detection):** R20a runs at the route, before the engine. AC-17 flags do not interact with R20a — the redirection runs before the engine's classification. AC-17's commitments are post-clear-of-distress acknowledgements.

## Open questions

1. **Whether `SELF_REPORT_DEPENDENT` should be split into two flags** — one for directional modifier and one for praxis motivation. Today the architecture aggregates them; the diagnostic field carries the specific reason. Phase-2 production observation may surface a need for finer-grained flag exposure on the response envelope. Logged for future revisit.
2. **Whether `CONFIDENCE_WEIGHTED` thresholds are per-practitioner or global.** Default is global (3/10 instances; 14/60 days). Some practitioners may have profile records from migration (high baseline confidence); others are cold-start. Per-practitioner threshold tuning is a Phase 3+ enhancement. Logged for future revisit.
3. **Whether the prose patterns are alt-3-derived or D-A16-promoted.** Today's specification treats them as alt-3-derived. D-A16 catalogue promotion will move them into corpus content with explicit `passage_type: focus_question_stem` (or `passage_type: ac_17_prose_template`) entries. Phase-2 build coordinates with D-A16.
4. **Whether `CONFIDENCE_WEIGHTED: medium` should ever surface in prose by default.** Today the architecture says no; the level is silent in prose. Phase-2 production observation may surface practitioner feedback that medium-confidence acknowledgements are useful (e.g., "this finding is at medium confidence — your recent record confirms but a longer window would solidify"). Logged for revisit.
5. **Phase-3+ extension to artefact-evaluation surfaces.** Currently `CONFIDENCE_WEIGHTED` rarely fires on artefact-evaluation surfaces. If multi-instance authorial-pattern detection is added (Phase 3+), the flag will fire there. The architectural specification supports this without restructuring.

## Honest disclosure

The two flags are the architectural acknowledgement that determinism in Stoic reasoning has limits. Motivation is private; longitudinal evidence is needed to disambiguate eupatheia from polished surface. The architecture surfaces these residues honestly rather than papering them over.

Per AC-12, the engine names the limits — Layer 3 does not produce caveats that aren't grounded in the engine's flag output. Per D11 / D12, suppression is forbidden. Per D18, the verifier catches suppression. The chain is enforced at multiple levels.

The thresholds for `CONFIDENCE_WEIGHTED` levels are working values per Phase-2 production observation. The architecture commits to the level structure; specific thresholds will refine.

## Approval gate

This deliverable is consumed by Phase-2 build (the engine's flag-firing logic and Layer 3's per-surface prose projection) and by D18 (the verifier that confirms flags surface in prose where they fire). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 19.*
