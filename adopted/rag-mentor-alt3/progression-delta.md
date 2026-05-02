# Deliverable 17 — Progression Delta Design

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — progression deltas are deterministic comparisons across the practitioner's longitudinal record); AC-17 (residual seams — `CONFIDENCE_WEIGHTED` interaction with single-instance vs multi-instance evidence); AC-18 (no shareable artefact — progression deltas are visible to the practitioner via the proximity ring and structured score fields, not as celebratory artefacts); R6c (qualitative proximity, not numeric); R6d (passions diagnostic, not punitive — deltas surface change without punishing regression); R0 (oikeiosis principle — progression-based assessment serves Circle 1 self-development).

**Cross-references:**
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — Mechanism 10's longitudinal projection produces the delta inputs; Rule 5's `refinement_source` informs profile-derived signals)
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — Mechanism 10 the composite that aggregates per-mechanism deltas)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15 — domain-matched deferrals are part of the progression context per Principle 3)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — the conversation surface response carries the delta signals)
- `/drafts/rag-mentor-alt3/residual-seams.md` (D19 — `CONFIDENCE_WEIGHTED` flag specification)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — `mentor_observation` consumes the delta as the longitudinal-pattern signal)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — retrospective score updates feed the delta history)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, R0 (oikeiosis), R6c, R6d, R20a (the delta surfaces don't engage R20a — the redirection runs at the route, before delta computation)

---

## Plain-language summary

The deterministic engine produces a structured evaluation **per instance** — for the action / reflection / decision the practitioner just submitted. But virtue is a longitudinal practice. The same practitioner's response to the same domain over weeks and months tells a different story than any single instance: are they getting more deliberate? Is the passion firing less often? Is a particular sub-species pattern fading? Or is the apparent improvement a polished surface that hasn't been tested under stress?

The progression delta is the **comparison logic across instances**. It reads the practitioner's recent record (the prior reflections, scores, deferral resolutions in the same domain), compares them to the current instance, and produces signals about how the reasoning is progressing: improving / stable / declining at the per-mechanism level and the composite level; per-passion frequency change; per-virtue rating trend; profile-tension flags when the current instance diverges sharply from the recent pattern.

This deliverable specifies the **prior-state read** (which historic instances inform the delta — the windowing per practitioner profile), the **signal definition** (which mechanisms' outputs change between instances and what change indicates progression), the **delta vocabulary** (improving / stable / declining; per-mechanism deltas where available), and the **AC-17 `CONFIDENCE_WEIGHTED` interaction** (single-instance deltas are low-confidence; multi-instance trends raise confidence).

The deliverable is **not** a new engine pass — Mechanism 10 (per D8) already produces directional, Senecan grade, and profile-tension outputs. D17 specifies how those signals compose into the practitioner-visible delta on the conversation surface and the daily-reflection ritual surface, and how the delta interacts with the AC-17 confidence weighting.

## Glossary

- **Progression delta** — the comparison output across the current instance and a window of prior instances. Distinct from the per-instance score, which evaluates only the current input.
- **Prior-state read** — the engine's query against the practitioner's longitudinal record to gather the comparison instances.
- **Windowing** — the rule for how many prior instances and how far back. Default: most recent 30 instances within 90 days.
- **Per-mechanism delta** — for each mechanism whose outputs are stable across instances (M2/M3 passion sub-species detection; M5 false-judgement repetition; M9 virtue rating trend; M10 proximity level), the change between current and prior.
- **Composite delta** — the aggregate signal across the four dimensions (control / passion / obligation / virtue) per Mechanism 10.
- **Profile-tension flag** — Mechanism 10 fires this when the current instance diverges sharply from the recent pattern. May indicate regression OR breakthrough; D17 specifies the disambiguation rules.
- **Confidence weighting** — the AC-17 flag levels: `low` (single instance / sparse evidence), `medium` (a small window of consistent instances), `high` (a larger window of consistent instances).
- **Domain-matched** — instances in the same conceptual territory as the current instance (per D15's domain-match algorithm).
- **Improving / stable / declining** — the canonical delta vocabulary per Mechanism 10's `direction` field. `improving` means the recent pattern shows movement toward better quality; `declining` means worse; `stable` means no clear trend.

## The architectural commitment

Per AC-12, **the engine produces every Stoic claim**. Claude does not assert "you're improving." The engine produces the `direction` field in M10's output; Layer 3 paraphrases it into prose. The delta is:

- **Deterministic.** Given the practitioner's longitudinal record and the current instance, the delta is computed by the engine's logic.
- **Structurally bounded.** Three values for `direction` (improving / stable / declining); five values for `senecan_grade`; four named confidence weights for the per-instance contribution.
- **Honest.** AC-17's `CONFIDENCE_WEIGHTED: low` flag fires when the delta is based on a single recent instance or sparse evidence. The architecture does not pretend to know more than the evidence supports.
- **Not punitive.** Per R6d, declining deltas are diagnostic — the prose names the pattern; it does not penalise the practitioner. R0 oikeiosis serves Circle 1 self-development, not external scoring.

## Prior-state read — what the engine queries

The engine's longitudinal projection (Mechanism 10 step 4 — directional modifier) reads the practitioner's prior instances. The query shape:

```typescript
interface PriorStateReadInput {
  // Current instance context (informs the windowing)
  current_instance_id: string;
  current_domain_classification: {
    domain_id: string;                       // e.g., 'work', 'family', 'creative'
    primary_circle: 1 | 2 | 3 | 4 | 5;       // from M6
    dominant_sub_species?: string;            // from M3 (when fired)
    dominant_indifferent?: string;            // from M8 (when fired)
  };

  // Window parameters (defaults)
  window_days?: number;                       // default 90
  max_instances?: number;                     // default 30
}

interface PriorStateReadResult {
  // Domain-matched instances (per D15 domain-match algorithm)
  domain_matched_instances: PriorInstance[];

  // All recent instances (for breadth signals — across domains)
  recent_instances: PriorInstance[];

  // Cross-instance aggregates
  aggregates: {
    domain_match_count: number;
    cross_domain_count: number;
    total_in_window: number;
    earliest_in_window: string;               // ISO 8601
  };
}

interface PriorInstance {
  instance_id: string;
  timestamp: string;                          // ISO 8601
  source_route: string;                       // '/api/score', '/api/mentor/private/reflect', etc.
  domain_id: string;
  domain_match_axes: ('sub_species' | 'indifferent' | 'oikeiosis_circle_role' | 'trigger_code')[];

  // The mechanism outputs from that instance
  mechanism_outputs: {
    m1_misclassification_severity?: string;
    m2_3_dominant_sub_species?: string;
    m3_compound_passion_flags?: string[];
    m4_primary_causal_breakdown?: { sub_species: string; stage: string };
    m5_dominant_false_judgement?: { sub_species: string; refinement_source: 'PROFILE' | 'DERIVED' };
    m6_oikeiosis_contraction?: boolean;
    m7_obligation_status?: any;
    m8_dominant_value_error?: { indifferent_id: string; judgement_type: string };
    m9_weakest_virtue_flag?: string;
    m9_unity_inconsistency?: boolean;
    m10_proximity_level?: string;
    m10_senecan_grade?: string;
    m10_proximity_risk_flag?: string;
    m10_direction_at_creation?: string;       // the direction signal as it stood at the original instance
    m10_self_report_dependent?: boolean;
    m10_confidence_weighted?: 'low' | 'medium' | 'high';
  };

  // Retrospective updates from D14b deferral resolution
  retrospective_updates: Array<{
    open_deferral_id: string;
    resolved_at: string;
    updated_classification: any;
  }>;
}
```

### Window parameters

- **`window_days: 90`** — default 90 days of historical context. Tunable per-practitioner if observation surfaces a need.
- **`max_instances: 30`** — caps the read at the 30 most recent instances regardless of window. Bounds the database query.
- **Domain-matched preferred.** When the current instance triggers a domain match (per D15's 4-axis algorithm), the engine prioritises domain-matched instances in the comparison. The query returns both the domain-matched subset and the full recent_instances set; the delta computation uses domain-matched preferentially when sufficient (≥3 domain-matched instances); falls back to recent_instances when not.

### Query shape (Phase-2 build implementation)

```sql
-- Domain-matched query
SELECT
  reflections.id,
  reflections.created_at,
  '/api/mentor/private/reflect' AS source_route,
  reflections.engine_diagnostics
FROM reflections
WHERE reflections.user_id = $1
  AND reflections.created_at >= NOW() - INTERVAL '90 days'
  AND (
    reflections.engine_diagnostics->>'dominant_sub_species' = $2  -- domain match axis 1
    OR reflections.engine_diagnostics->>'dominant_indifferent' = $3  -- axis 2
    OR (reflections.engine_diagnostics->>'primary_circle')::int = $4  -- axis 3
  )
ORDER BY reflections.created_at DESC
LIMIT 30;

-- Cross-route union for the conversation surface (also reads /api/score, /api/score-decision history)
-- ... unioned across the score-family tables
```

The query is awaited per KG1 rule 2; the result populates the `PriorStateReadResult`. The query runs at Mechanism 10's longitudinal projection step (per D9 Position 12).

## Signal definition — what changes between instances

The delta computation reads the prior_state and the current instance and produces signals. Per-mechanism signals:

| Signal | Source | Direction interpretation | Confidence factor |
|---|---|---|---|
| `proximity_level_delta` | M10 — current proximity_level vs prior_state's proximity_level histogram | `improving` if current is higher in the canonical sequence (reflexive < habitual < deliberate < principled < sage_like) than the recent average; `declining` if lower; `stable` if same | High when domain-match count ≥ 5 |
| `dominant_sub_species_frequency_delta` | M3 — frequency of `dominant_sub_species` in prior_state vs current presence | If the sub-species was dominant in 80%+ of prior_state and is not dominant in the current → `improving` (the pattern is fading). If the sub-species was rare in prior_state and dominant in current → `declining` (the pattern is recurring) | Medium-to-high depending on prior frequency |
| `causal_stage_progression` | M4 — stage of breakdown change | If prior_state's primary_causal_breakdown was at `synkatathesis` and current is at `phantasia` → `improving` (the practitioner caught the impression before assenting). If prior at `phantasia` and current at `praxis` → `declining` (the practitioner went further down the chain) | Medium |
| `weakest_virtue_trend` | M9 — `weakest_virtue_flag` over time | If the weakest virtue has improved one or more rating levels in the recent window → `improving` for that virtue. Aggregated across virtues for the composite | Medium-to-high |
| `senecan_grade_movement` | M10 — `senecan_grade` over time | Moving from grade_3 → grade_2 → grade_1 is `improving`. The grade is stable across many instances per AC-17 (longitudinal evidence required) | High when window ≥ 30 days with consistent grade |
| `proximity_risk_flag_pattern` | M10 — risk flags across instances | Recurring `THEORETICAL_ONLY` or `CONVENTION_SUBSTITUTION` flags → declining or stuck pattern. Recurring flag fading → improving | Medium |
| `unity_inconsistency_resolution` | M9 — Validation Addendum unstable vs false phronesis | Per Validation Addendum Adjustment 1: unstable phronesis with longitudinal evidence stabilising → `improving` (genuine phronesis becoming stable); false phronesis recurring → `declining` (the misidentification is deep) | Medium-to-high |
| `domain_breadth_change` | Aggregates across domains | If the practitioner's pattern in one domain has improved while another domain has new struggles, the composite delta is mixed; per-domain deltas surface separately | Medium |

### Composite delta (Mechanism 10's `direction` field)

The composite `direction` is Mechanism 10's aggregate read across the per-mechanism signals. The aggregation:

1. Count the per-mechanism signals that read `improving` vs `stable` vs `declining`.
2. Apply confidence weighting — high-confidence signals count more.
3. Apply the AC-17 `CONFIDENCE_WEIGHTED` flag:
   - `low` if the prior_state's domain_matched_instances count is < 3 OR the window's earliest instance is < 14 days ago.
   - `medium` if ≥ 3 and < 10 domain_matched_instances; window ≥ 14 and < 60 days.
   - `high` if ≥ 10 domain_matched_instances and window ≥ 60 days.
4. The `direction` output is the weighted aggregate, with the `confidence_weighted` flag named.

Special case — **insufficient evidence for direction**: if `confidence_weighted: low` and the per-mechanism signals are mixed, the `direction` defaults to `stable` with the AC-17 flag explicitly named. The architecture does not assign improving / declining without sufficient evidence.

## Delta vocabulary on the response envelope

Per D16, the conversation-surface response carries the structured score fields that include the delta signals:

```typescript
score: {
  ...,
  direction: 'improving' | 'stable' | 'declining';
  // Per-mechanism deltas — surfaced where available
  delta_signals?: {
    proximity_level_delta?: 'improving' | 'stable' | 'declining';
    dominant_sub_species_frequency_delta?: 'fading' | 'recurring' | 'new' | 'stable';
    causal_stage_progression?: 'earlier_stage' | 'same_stage' | 'later_stage';
    weakest_virtue_trend?: { virtue: string; trend: 'improving' | 'stable' | 'declining' };
    senecan_grade_movement?: 'grade_up' | 'grade_stable' | 'grade_down';
    proximity_risk_flag_pattern?: 'fading' | 'recurring' | 'new';
    unity_inconsistency_resolution?: 'stabilising' | 'recurring' | 'new';
  };
  domain_specific_deltas?: DomainDelta[];     // when the practitioner has multi-domain history
}

interface DomainDelta {
  domain_id: string;
  direction: 'improving' | 'stable' | 'declining';
  confidence_weighted: 'low' | 'medium' | 'high';
}
```

The `delta_signals` block is optional — it appears only when the prior_state contains sufficient evidence for at least one signal. The block is for consumers who want to surface specific patterns (the proximity ring widget renders per-mechanism deltas in tooltips; the practitioner profile updates per-mechanism trend records).

The composite `direction` field is always present — defaults to `stable` with `confidence_weighted: low` when no evidence supports a directional claim.

## Layer 3 prose surfacing

When the delta is non-trivial (the practitioner has non-empty domain_matched_instances and the direction is improving or declining), Layer 3 may surface the delta in prose. The prose patterns:

### Improving (with sufficient confidence)

When `direction: improving` and `confidence_weighted: medium` or `high`:

> "The recent pattern shows movement: [specific observation, e.g., 'philodoxia dominated the recent work-domain instances; this one detects philodoxia at moderate intensity rather than strong']. The change reads as movement toward [the canonical correct judgement]."

The prose names the specific signal that changed; it does not assert progress in general terms.

### Stable

When `direction: stable`:

> Layer 3 typically does not surface a prose delta when `stable`. The conversation surface's `philosophical_reflection` focuses on the current instance; the structured `direction: stable` field is available to the proximity ring widget for rendering but the prose does not embellish.

Exception: when the practitioner's narrative explicitly references progress (e.g., "I keep noticing it more, but I'm not sure I'm changing it"), Layer 3 may acknowledge the awareness vs change-in-action distinction. Per the alt-3 handoff's worked example: *"You're right that you're noticing it more. Awareness is the upstream shift. The change-in-action is downstream of the awareness. The Stoic commitment is to attend to the upstream work even when the downstream change does not yet show."*

### Declining (with sufficient confidence)

When `direction: declining` and `confidence_weighted: medium` or `high`:

> "Across recent instances, [specific observation, e.g., 'orge with your son has been firing more often than the prior month, with the breakdown moving from horme back toward synkatathesis']. The pattern reads as regression in this domain."

R6d compliance: the prose names the pattern as diagnostic, not punitive. No "you've been failing" or "you should be doing better." The Stoic commitment per R0 is the practitioner's own self-development; the engine reports honestly.

### Insufficient evidence (`confidence_weighted: low`)

When the prior_state is sparse:

> Layer 3 typically does not surface a prose delta. The structured `direction: stable, confidence_weighted: low` field is available; the proximity ring widget may render a tooltip explaining the low confidence ("based on a single recent instance — longitudinal evidence is needed to confirm a trend"). The prose does not embellish.

## Single-instance vs multi-instance evidence

Per AC-17, the architecture is honest about evidence levels:

| Scenario | confidence_weighted | direction default | Delta prose |
|---|---|---|---|
| First-ever instance (cold-start practitioner) | low | stable | None — Layer 3 produces only the per-instance evaluation |
| 1-2 recent instances in the domain | low | stable | None — same as above |
| 3-9 recent instances in the domain | medium | computed | Surfaced for non-stable deltas; per-mechanism signals shown |
| 10+ recent instances in the domain spanning ≥ 60 days | high | computed | Surfaced; senecan_grade_movement weighted heavily |

The bands are working values per Phase-2 production observation. The architecture commits to the four bands; the specific thresholds may shift.

## Profile-tension flag — improvement vs regression

Mechanism 10's `profile_tension_flag` fires when the current instance diverges sharply from the recent pattern. The flag is **ambiguous** by itself — it could mean:

- **Breakthrough.** The practitioner has had a major shift; the current instance reflects new behaviour the profile has not yet caught up to.
- **Regression.** The current instance shows worse quality than the recent pattern.
- **Atypical instance.** A one-off divergence (e.g., a uniquely stressful situation) that doesn't reflect a trend.

Per D8 Rule 10, the flag is surfaced for review. D17 specifies the disambiguation:

1. **If `current_proximity_level` is higher than the recent average** AND the divergence is large (e.g., recent average is `habitual` and current is `principled`): **breakthrough candidate**. Layer 3 surfaces with caution: *"The current instance reads at a higher proximity than recent; this may be a breakthrough or an atypical instance. Future instances will sharpen the picture."*
2. **If `current_proximity_level` is lower than the recent average**: **regression candidate**. Layer 3 surfaces honestly: *"The current instance reads at a lower proximity than recent; this divergence is worth attending to."*
3. **If lateral movement** (different mechanism's deficiency surfaced): the flag fires as informational. Layer 3 may name the new pattern.

The disambiguation is structurally bounded. Per AC-17, the `confidence_weighted` flag stays at `low` for the divergent instance — the engine does not pretend a single instance establishes a new pattern.

## Domain-matched vs cross-domain deltas

When the practitioner has multi-domain history (e.g., 30 instances across work, family, creative, public_discourse domains), the delta computation produces:

1. **Domain-matched delta.** Restricted to instances in the current domain. The primary signal — most relevant to the practitioner's reasoning in this specific area.
2. **Cross-domain breadth signal.** When patterns are improving in one domain but declining in another, this is meaningful. The structured `domain_specific_deltas[]` array surfaces per-domain directions; Layer 3 may surface in prose if the cross-domain pattern is salient.

Example: practitioner has been improving in the family domain (orge with children fading) but the work domain shows recurring philodoxia. The conversation surface response includes:

```typescript
domain_specific_deltas: [
  { domain_id: "work", direction: "stable", confidence_weighted: "high" },
  { domain_id: "family", direction: "improving", confidence_weighted: "medium" }
]
```

The cross-domain pattern can inform the practitioner's awareness without requiring narrative surfacing on every reply. The proximity ring widget's domain filter (per D16) lets the practitioner explore per-domain trajectories.

## D14a `mentor_observation` interaction

D14a's `mentor_observation` field (when founder direction is `visible`) draws from M10's `structured_observation`. The structured_observation is one-sentence prose informed by the longitudinal projection. Examples:

- *"Practitioner interrupted philodoxia at synkatathesis stage for the first time in this domain."* (improving signal)
- *"orge in family domain has been stable in frequency over the recent month; the breakdown stage hasn't moved."* (stable signal)
- *"Recurring agonia pattern with public-discourse domain; consider if catastrophising is being attended to."* (informational signal)

Layer 3 produces the structured_observation as part of M10's longitudinal projection; D14a's surface renders it (when founder direction is `visible`); D16's conversation surface includes it in the structured score fields and may surface in prose as the open_deferral_observation coda.

The architectural commitment: structured_observation is engine output, not Claude's longitudinal commentary. Per AC-12, the engine's longitudinal logic produces the observation; Layer 3 paraphrases it.

## D14b retrospective update interaction

When a deferred question resolves (D14b), the retrospective score update revises an instance from days or weeks prior. The progression delta computation reads the retrospective updates as part of the prior_state:

- The original instance's `mechanism_outputs` are updated with the resolved fields (e.g., `m5_dominant_false_judgement.correct_judgement` filled; `m10_direction` updated).
- The `retrospective_updates[]` array carries the change-in-state: `{ open_deferral_id, resolved_at, updated_classification }`.
- The delta computation reads both the original instance state at-creation time AND the retrospectively-updated state. The original `m10_direction_at_creation` is preserved for audit; the retrospective view reflects the resolved classification.

This means a deferral that closes 14 days post-creation can shift the prior_state's direction signal. Phase-2 build's delta computation reads the latest retrospective state; the original is preserved for audit.

Per AC-17, retrospectively-updated classifications carry `confidence_weighted: medium` post-resolution (per D14b §"Step 9"). The delta computation respects this — a retrospectively-resolved instance contributes `medium` confidence rather than the `low` it carried when first scored.

## Cleanliness rating

The prior-state read is **HIGH cleanliness** — fully specified query shape, deterministic windowing, explicit max-instances bound.

The signal definition table is **HIGH cleanliness** at the per-mechanism level — each signal has a defined source, direction interpretation, and confidence factor.

The composite delta aggregation is **PARTIAL cleanliness**:
- Per-mechanism signals aggregate via weighted count. The weights are working values; Phase-2 production observation may tune.
- The `confidence_weighted` thresholds are working values (3 / 10 instances; 14 / 60 days). Phase-2 production observation may refine.
- The breakthrough vs regression disambiguation for `profile_tension_flag` is structurally bounded but reads multiple signals; the disambiguation rules are explicit but not strictly deterministic.

The Layer 3 prose surfacing rules are **HIGH cleanliness** — the four scenarios (improving / stable / declining / insufficient evidence) have specified prose patterns; the prose does not assert beyond the structured signals.

The cross-domain delta is **PARTIAL cleanliness** — the per-domain delta is structurally clean; the cross-domain composite is informational and may not always surface in prose.

## R0 / R6c / R6d compliance

- **R0 (oikeiosis principle):** the delta serves Circle 1 (the practitioner's own development). The architecture does not externalise progress as a public record or share it without consent.
- **R6c (qualitative proximity):** the delta uses the canonical 5-level proximity_level scale, the 5-level Senecan grade, and the 4-virtue rating scale. No numeric scoring. Per-mechanism signals use named categories ('improving' / 'stable' / 'declining'; 'earlier_stage' / 'same_stage' / 'later_stage'; etc.).
- **R6d (passions diagnostic, not punitive):** declining deltas are diagnostic. The prose names the pattern; it does not punish. No "you've been failing"; only "this pattern is worth attending to."

## R20a interaction

R20a's distress redirect runs at the route, before any engine logic (per D14a / D14b / D16). When the route returns the distress redirect response, the engine does not run; the delta is not computed. The delta surfaces only on the post-R20a-clear engine path.

If the practitioner's narrative shows acute distress that fires R20a Zone 3, the delta computation does not run. Per AC3 (Zone 2 calibration not blockage; Zone 3 redirect), the practitioner is connected to professional support resources; longitudinal pattern observation is not the appropriate response in that moment.

## Open questions

1. **Per-practitioner threshold tuning.** The default thresholds (3/10 instances; 14/60 days) work for a practitioner who uses the system regularly. Phase-2 production observation may surface practitioners who use the system infrequently and need different thresholds. Recommendation: ship defaults; observe.
2. **Delta surfacing on score-family endpoints.** The conversation surface and the daily-reflection ritual surface project the delta. Score-family endpoints (`/api/score`, `/api/score-decision`, etc.) are single-instance scoring surfaces; they do not historically surface progression deltas. Recommendation: do not surface on Phase-1 score-family responses; the structured `delta_signals` field can be available for future surface design. Phase 3+ may revisit if specific score-family consumers want the data.
3. **Whether the proximity ring widget renders the per-mechanism delta tooltips at Phase-2 launch.** The data contract (D16's proximity_ring_data) supports the tooltips. Recommendation: ship without per-mechanism tooltips; add when production observation surfaces the need. Founder calls.
4. **Long-window observation (180+ days).** The 90-day default window captures recent patterns but misses long-term progression. Phase 3+ may add a 365-day or all-time window for the Senecan grade signal specifically. Recommendation: stay with 90 days at Phase 1.
5. **Cross-route history merging.** The conversation surface delta reads from the practitioner's reflections + score-family histories. The merging is per source_route. Phase-2 build implements the union query; Phase-2 observation reports whether cross-route alignment produces useful or noisy signals.

## Honest disclosure

The progression delta is the architectural commitment that virtue is longitudinal. The engine's per-instance evaluation is necessary but not sufficient for the practitioner's development; the comparison across instances is what gives meaning to the per-instance work.

Per AC-17, the architecture is honest about evidence levels. Single-instance deltas are explicitly low-confidence; multi-instance trends earn higher confidence with explicit thresholds. The architecture does not pretend to know the practitioner's trajectory from a single data point.

The thresholds (window_days; max_instances; confidence_weighted bands) are working values. Phase-2 production observation will refine them. The architectural commitment is to the structurally bounded delta vocabulary, not to the specific threshold values.

The `profile_tension_flag` disambiguation is the architectural acknowledgement that single-instance divergences are ambiguous — a sharp departure from the recent pattern could be breakthrough, regression, or atypical. The architecture surfaces the divergence honestly; Layer 3 surfaces with caution.

## Approval gate

This deliverable is consumed by Phase-2 build (the engine's longitudinal projection step within Mechanism 10) and by D16 (the conversation surface response shape). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 17.*
