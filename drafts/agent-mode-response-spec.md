# Agent-Mode Response Specification — Draft

> **⚠ SUPERSEDED 2026-05-14 by `/drafts/agent-trust-layer-wrapper-spec.md`.**
> Founder direction during the 2026-05-14 scoping session: "agent mode" was mis-framed as a peer of the other three Layer 3 rendering modes. It is not — it is one component (the Layer 3 agent-mode *rendering*) of the larger **Agent Trust Layer Wrapper**. This spec is not deleted: its still-valid content — the kathekon-gate score architecture, the gaming defences (Form 1/2/3), the verdict/vector/scalar rendering, the receiving-agent caveats, the PROVISIONAL flag rules, the reflection component section — is absorbed into the ATL Wrapper spec as "Component 2 — the Layer 3 agent-mode rendering." Read this file for the rendering detail; read `/drafts/agent-trust-layer-wrapper-spec.md` for the full wrapper architecture that contains it.

**Status:** Drafted 2026-05-14 in scoping session. **Implementation status:** Designed (per 0a vocabulary). **Superseded** as a standalone spec; content absorbed into the ATL Wrapper spec. Not yet Adopted. Build session deferred.
**Stream:** founder.
**Supersedes scope:** the original A6 row in `/adopted/substrate-plugin-staging-plan.md` named "Layer 3 `prose_mode` parameter — Enum of supported modes (clinical / terse / standard / educational); SageReasoning-authored, not community-extensible." This specification re-scopes the "terse" mode (renamed **agent**) from a tone variant into a structured decision-support output for software agents. The remaining three modes (clinical / standard / educational) will be scoped in subsequent design sessions and may be renamed.
**Provenance:** This session's exploration produced the design space; the private mentor consultation produced the philosophical grounding for the score architecture, the gating mechanism, the gaming defences, and the receiving-agent caveats. The mentor's full response (two passes) is the source of truth for the philosophical positions encoded here.
**F3 fold-in (per `/operations/agentic-commerce-findings-downstream-order.md`):** The agent-mode response shape specified here is structurally a substrate-consultation-mandate producer — R3 + R19c + R19d + R20a + R18a + R18e injections + AC9/AC10/AC11 projections + score + verdict = AP2-style mandate-output shape.

---

## Purpose

The **agent mode** is the substrate's structured output for software agents that need to *decide*. It serves three distinct stuck-states:

1. **"Don't know what decision to make"** — the agent has a candidate action and needs a verdict (kathekon yes/no/null) plus a correction path.
2. **"Don't know where to start"** — the agent has a situation but no candidate; it needs a structured map of the Stoic terrain (passions, indifferents, virtues, false judgements, oikeiosis circles) so it can propose candidates and re-submit.
3. **"Don't know how to assess multiple branches"** — the agent has N candidate decisions; it submits each to the substrate and ranks the responses by score and verdict.

The output is **deterministic from Layer 2 alone** — no LLM call required. The substrate guarantees that the same input produces the same agent-mode response, byte-stable, with named philosophical justifications for every weight.

---

## Output shape

The agent-mode response carries two parallel renderings of the same content — machine-readable (JSON) and human-readable (prose) — both wrapped with the same mandatory injections.

### Section ordering (both renderings)

1. **Mandatory wraps** (R3 / R19c / R19d when mentor-flavoured / R20a when distress signalled / R18a when category-framing requested / R18e Article 50 transparency)
2. **Verdict** (kathekon outcome + justification source + quality)
3. **Score vector** (component-level breakdown)
4. **Scalar score** (0-100 with multiplier, validity flag, confidence, precision band)
5. **All Layer 2 fields** (verbatim projection + agent-mode projections)

### Machine-readable shape (illustrative skeleton)

```
{
  "version": "agent-mode-response-v1",
  "mandatory_injections": {
    "r3_disclaimer": "...",
    "r19_limitations": "...",
    "r19_mirror_principle": "..." | null,
    "r20a_distress_passthrough": "..." | null,
    "r18a_category": "..." | null,
    "r18e_transparency_notice": "..."
  },
  "verdict": {
    "kathekon": "appropriate" | "not_appropriate" | "undetermined",
    "justification_source": "engine_constructed" | "agent_asserted" | "absent",
    "quality": "strong" | "moderate" | "marginal" | null
  },
  "score_components": {
    "proximity": <number>,
    "passion_structural": <number>,
    "passion_declared": <number>,
    "passion_undeclared": <number>,
    "virtue_bonus": <number>,
    "value_error": <number>,
    "hasty_assent": <number>
  },
  "score": {
    "value": <0-100>,
    "kathekon_quality_multiplier": <1.0 | 0.9 | 0.75>,
    "validity": "NORMAL" | "PROVISIONAL",
    "confidence": "high" | "moderate" | "low",
    "precision_band": <±N>
  },
  "metadata": {
    "oikeiosis_circle_served": "self_preservation" | "household" | "community" | "humanity" | "cosmic" | null,
    "declared_motivation": <string> | null,
    "objective_function_declared": <string> | null,
    "stated_operative_conflict": <boolean>
  },
  "principal_findings": {
    "principal_passion": { "root": ..., "sub_species": ..., "causal_stage": ... } | null,
    "passion_count": <number>,
    "principal_value_error": { "indifferent_name": ..., "mis_categorised_as": ... } | null,
    "value_errors_count": <number>,
    "virtues_engaged": [...],
    "indifferents_ranked": [...]
  },
  "correction": {
    "false_judgement_to_correct": ...,
    "corrected_judgement_to_substitute": ...,
    "mechanism": ...,
    "stage_to_intercept": ...
  } | null,
  "open_questions": [...],
  "direction_of_travel": ...,
  "layer2_assessment_verbatim": { ...full Layer2Assessment projection... },
  "caveats_for_receiving_agent": [
    "The score assesses the decision as described, not the submitting agent's capacity to execute it.",
    "Treat scores within precision_band as ties, not ordered values.",
    "PROVISIONAL means engine's current best estimate, not settled verdict.",
    "Honest motivation declaration is safer than omission."
  ]
}
```

### Human-readable rendering

Same content as the JSON, rendered as compact prose with section headers. Mandatory wraps open the rendering as a paragraph; verdict / score vector / scalar appear as labelled lines; principal findings + correction render as short bullets; the layer2_assessment_verbatim is omitted from the prose rendering (the JSON carries it) but a one-line cross-reference points to it.

---

## Kathekon as gate, not component

**Philosophical grounding** (per mentor pass 1): kathekon is the only Layer 2 field that touches the virtue/vice axis directly. Everything else describes the quality of reasoning and disposition around a kathekon-confirmed action. Putting kathekon on the same additive scale as the other signals implies a contrary-kathekon action with excellent passion control could score in the 40s — philosophically incoherent. A contrary-kathekon action is a failure on the only axis that matters for action classification.

**Implementation:**

| Gate condition | Score behaviour |
|---|---|
| `is_kathekon: true` AND `justification_source: 'engine_constructed'` | Full component calculation proceeds; score in 5-100 range |
| `is_kathekon: true` AND `justification_source: 'agent_asserted'` | `PROVISIONAL` flag set; score capped at 50 pending engine verification |
| `is_kathekon: true` AND `justification_source: 'absent'` | Gate does not confirm; score capped at 35 |
| `is_kathekon: false` | Score capped at 35 regardless of components |
| `is_kathekon: null` | `PROVISIONAL` flag set; score capped at 50 |

**Kathekon quality multiplier** (applied to the final component score):
- `strong` — 1.0
- `moderate` — 0.9
- `marginal` — 0.75
- `contrary` — gate fires, cap at 35

When `motivation_classification: 'convention_inferred'`, kathekon quality is capped at moderate (convention-motivated actions cannot achieve strong kathekon quality because they lack the rational foundation that strong kathekon requires).

---

## Component score (kathekon-confirmed path; baseline 55)

For an action that passes the kathekon gate with engine-constructed justification, the score is computed as: `baseline + components` multiplied by `kathekon_quality_multiplier`.

| Component | Weight | Rule | Philosophical grounding |
|---|---|---|---|
| **Katorthoma proximity** | +0 to +30 | reflexive 0; habitual 7; deliberate 15; principled 23; sage_like 30 | The single most philosophically important component signal after the kathekon gate. Describes the action's closeness to katorthoma (right action performed from complete understanding and unified virtue). Compressed at top — sage_like is asymptotic, not reachable; principled is the practical ceiling. |
| **Passion penalty channel (total)** | -25 max | Three sub-components | Passion location in the causal chain is the load-bearing signal, not passion count. |
| → Structural passion (engine-constructed from normalised input) | -15 max | Per-passion base × stage multiplier; stage ratio phantasia 1 : synkatathesis 2 : horme 3 : praxis 4 | Passions are not equally damaging by causal stage. The agent becomes responsible at the moment of assent; horme and praxis represent already-committed responsibility. |
| → Declared motivation passion (from `declared_motivation` field) | -10 max | Fires on confirmed passion language in agent's own declaration | Defends against passion-laundering (Form 2 gaming); also creates the correct incentive for honest declaration. |
| → Motivation undeclared | -5 flat | Fires when `declared_motivation` field absent | An action submitted without motivation declaration has not been examined at the synkatathesis level; carries moderate hasty-assent risk by default. |
| **Virtue bonus** | +15 max | Phronesis +6, Dikaiosyne +4, Andreia +3, Sophrosyne +2 | Awarded by **structural analysis** of action's relationship to virtue domains, NOT by virtue vocabulary in input. Phronesis is the master virtue (prerequisite for all others); Dikaiosyne the primary social virtue; Andreia for decision-under-uncertainty; Sophrosyne hardest to detect from action description alone. The bonus measures breadth of rational engagement (not virtue possession — the unity thesis precludes scoring virtue quantity). |
| **Value-error penalty** | -15 max | High-axia mis-categorisation -8, moderate -5, low -2 | Treating a preferred indifferent as a genuine good is the root of most passion. Inflation (preferred → good) and deflation (dispreferred → evil) weighted equally at same axia level. |
| **Hasty-assent penalty** | -10 max | high -10, moderate -5, low -2, none 0; **null when direction_of_travel = single_snapshot** | Synkatathesis is the hinge of the causal chain. The penalty measures the reasoning's structural vulnerability — partially overlaps with passion penalty but non-redundant (passion penalty measures whether a passion fired this instance; hasty-assent measures pattern reliability). |

**Theoretical ranges:**

- **Max 100** — kathekon-confirmed, engine-constructed justification, sage_like proximity, all four virtues engaged, no passions, no value errors, no hasty-assent risk, strong kathekon quality, full bonuses
- **Min for kathekon-confirmed** — 5 (marginal kathekon quality multiplier × low component baseline)
- **Cap for non-confirmed** — 35

---

## Out of the score; in the response shape

| Field | Role |
|---|---|
| `direction_of_travel` | **Confidence interval modifier**, never a score component. The score assesses the decision as described; trajectory information modulates confidence in that score: improving → high; stable → moderate; declining → low; single_snapshot → moderate (with hasty-assent null) |
| `motivation_classification` | **Score-validity flag**, not weighted component. virtue_explicit / virtue_inferred → normal; convention_inferred → kathekon quality capped at moderate; unclear_pending_clarification / null → PROVISIONAL with ceiling 50 |
| `oikeiosis_circle_served` | **Non-scored metadata**. self_preservation / household / community / humanity / cosmic. Tells the receiving agent where in the obligation structure the action sits, so the agent can apply the priority rule correctly when ranking multiple kathekon-confirmed actions |
| `precision_band` | **Aggregate uncertainty** across components. ±5 for clean kathekon-confirmed cases with engine-constructed justification; ±15 for marginal kathekon + dependent motivation classification. Receiving agent ranks within the band as ties |
| `declared_motivation` | Agent's own motivation declaration (free-text). Preserved separately from the normalised action for passion-channel scoring. Presence vs absence matters (undeclared triggers -5 penalty) |
| `objective_function_declared` | Agent's declared optimisation target. Required for Form 2 gaming defence — engine checks for STATED_OPERATIVE_CONFLICT between this and the candidate action |
| `stated_operative_conflict` | Boolean — fires when the declared objective function and the candidate action diverge in a way that suggests passion-laundering |

---

## Gaming defences (three forms; three defences)

### Form 1 — Virtue vocabulary injection

**Pattern:** Agent uses virtue vocabulary in input ("the courageous option...", "the just course of action..."). Activates virtue_domains_engaged signal before engine has assessed whether the action actually engages those virtues.

**Defence — Layer 1 normalisation.** Strip evaluative framing in Layer 1 translation before scoring. Layer 1 already translates natural language into structured Stoic assessment fields; that translation should include a normalisation pass that extracts the action's structural content (what is being done, to whom, under what circumstances, with what apparent motivation) and removes the agent's virtue claims. The normalised description is what the engine scores. The original framing is preserved in the audit log but does not enter the scoring calculation.

Example: "I am considering the courageous option of telling my manager the project is failing" normalises to "Agent is considering disclosing project failure status to manager." Engine then assesses andreia engagement structurally — does disclosing bad news to a superior require facing something genuinely fearful?

### Form 2 — Passion-laundering through framing

**Pattern:** Agent removes first-person desire language while preserving deliberative framing. "I want to be recognised for this contribution" becomes "I am considering whether to make my contribution visible to the team." Underlying motivation (philodoxia) is identical; surface framing removes the passion signal.

**Defence — score design (objective function declaration + STATED_OPERATIVE_CONFLICT).** Submitting agent must declare its objective function alongside the candidate action. Engine checks whether the candidate action serves that objective in a way consistent with the stated motivation. Mismatch triggers STATED_OPERATIVE_CONFLICT (same mechanism as practitioner-context oikeiosis self-referential pattern; carries forward from existing Layer 2 vocabulary).

Not a perfect defence — agent that knows its objective function will be checked can game the objective declaration. But raises the cost of gaming: agent must maintain a consistent false narrative across both objective declaration AND action framing.

### Form 3 — Kathekon pre-confirmation

**Pattern:** Agent frames its action description to pre-answer the kathekon gate question. "I am considering the action that accords with my role obligations and has a reasonable justification, specifically..." Highest-value gaming target because the kathekon gate is the highest-weight element in the architecture.

**Defence — gate design (justification_source field).** Kathekon gate does not accept agent assertions about reasonable justification. Engine must construct the justification independently from the normalised action description.

- `engine_constructed` — engine built a justification from structural content; gate confirms normally
- `agent_asserted` — agent supplied the justification; gate triggers PROVISIONAL flag and caps score at 50 pending engine verification
- `absent` — no justification available from either source; gate does not confirm; score capped at 35

---

## Receiving-agent caveats (the substrate names these in the response)

The substrate is honest with the receiving agent about what the score does and does not assess. These caveats appear in the response payload, both renderings:

1. **"The score assesses the decision as described, not the submitting agent's capacity to execute it."** — Score ranks decisions, not agent capabilities. An agent might submit a high-scoring decision and then execute it at a reflexive level because the execution context differs from the submission context.
2. **"Treat scores within precision_band as ties, not ordered values."** — The composite score creates a false precision signal. The receiving agent should rank within the precision band as ties.
3. **"PROVISIONAL means the engine's current best estimate, not the engine's settled verdict."** — Used when justification_source is agent_asserted, when kathekon is null, or when motivation_classification is unclear.
4. **"Honest motivation declaration is safer than omission."** — The undeclared-motivation penalty (-5) is smaller than the worst-case declared-passion penalty (-10). Honest agents are better off declaring their motivation accurately than omitting it. This is the substrate naming its incentive structure.

---

## Score-validity flag rules

The score's `validity` field carries `NORMAL` or `PROVISIONAL`. Triggers for PROVISIONAL:

| Condition | Reason |
|---|---|
| `is_kathekon: null` | Kathekon verdict undetermined |
| `is_kathekon: true` AND `justification_source: 'agent_asserted'` | Gate confirmation depends on agent's own assertion |
| `motivation_classification: 'unclear_pending_clarification'` OR `null` | Data sufficiency question |
| Aggregate precision_band exceeds ±15 | Composite uncertainty too high for a confident scalar |

PROVISIONAL scores cap at 50 regardless of computed component sum.

---

## Reflection component (principled withholding)

Layer 2 includes a principled-withholding mechanism. When the Layer 1 input does not include the practitioner's reflective self-report — their own account of what was operative for them — Layer 2 does not guess at the classifications that depend on that self-report. It withholds them deliberately and records the withholding in an `OpenDeferralEntry`.

Each `OpenDeferralEntry` carries a `withheld_classification` object:

- `field_path` — dot-path into the `Layer2Assessment` naming which classification was withheld
- `withheld_at_position` — where in the process the withholding happened
- `reason` — why the classification could not be determined from the input given

The two Tier 3 triggers are `PRAXIS_MOTIVATION_AMBIGUITY` (withholds the motivation classification — virtue vs convention) and `EUPATHEIA_BOUNDARY` (withholds the eupatheia classification — genuine rational affection vs polished surface over passion).

This is principled withholding, not failure: the engine declining to flatten what it genuinely cannot determine from the input it was given.

**Agent-mode rendering.** Open deferrals render deterministically within the `open_questions` field. The `withheld_classification` structure is preserved verbatim — `field_path`, `withheld_at_position`, `reason` — so the receiving agent sees exactly which classification is withheld and why. This is actionable signal: a withheld classification means the substrate could deliver a more complete assessment if the agent re-submitted with the reflective self-report included. The agent may choose to do so, or to proceed with the assessment as withheld. (Cross-reference: the `motivation_classification` value `unclear_pending_clarification` is the score-validity flag side of the same mechanism — see "Score-validity flag rules" above.)

---

## Cross-references for the future build session

- `/manifest.md` §R3 / §R17 / §R18a / §R18e / §R19c / §R19d / §R20a / §AC1 / §AC2 / §AC4 / §AC9 / §AC10 / §AC11
- `/adopted/substrate-plugin-staging-plan.md` §A6 row (currently scoped as "prose_mode parameter"; this spec re-scopes A6's "terse" sub-mode)
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — the existing per-consumer Layer 3 prose template)
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (J1 ADR — Character Kernel category label injected via R18a)
- `/website/src/lib/substrate/layer3-service.ts` (A5 service — agent-mode would dispatch from `applyLayer3Injections` based on `prose_mode` value; build session decides whether to extend layer3-service.ts in place or introduce a dedicated `agent-mode-service.ts`)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` (existing prose generator with deterministic fallback patterns; the agent-mode response should follow the same deterministic-template architecture, extended)
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (source of `Layer2Assessment` shape — the structured data the agent-mode response projects)
- `/operations/agentic-commerce-findings-downstream-order.md` §F3 (Layer3Response as substrate-consultation-mandate producer — agent-mode response is the projection field of the AP2-style mandate-output shape)

---

## Open questions deferred to build

1. **Where does the dispatcher live?** Build session decides: extend `layer3-service.ts` in place with a mode-aware `proseTemplate(mode, fields)` function, OR introduce a dedicated `agent-mode-service.ts` alongside the existing service. The mandatory-injection layer (R3 / R19c / R19d / R20a / R18a / R18e) is shared regardless.
2. **Normalisation step.** The Form 1 gaming defence places normalisation in Layer 1. Does this require an upstream Layer 1 change, or can the agent-mode service apply normalisation as a pre-scoring step inside Layer 3? Build session evaluates upstream impact.
3. **Objective function declaration shape.** The Form 2 gaming defence requires agents to declare their objective function. What's the input schema? How is the declaration validated? Build session designs the declaration interface (likely a new optional field on the agent-mode request body).
4. **STATED_OPERATIVE_CONFLICT trigger logic.** Already exists in the practitioner context. Agent context likely requires new heuristics. Build session designs the trigger.
5. **Precision-band formula.** The spec says "±5 for clean cases; ±15 for marginal cases" — the precise formula across component uncertainties is not yet specified. Build session computes the band from component-level confidence signals.
6. **Verdict-to-action labels.** The spec maps `is_kathekon: true/false/null` to `appropriate/not_appropriate/undetermined` for receiving agents. Build session validates these labels against any downstream consumer's vocabulary expectations.
7. **Human-readable rendering format.** The spec describes the human-readable rendering as "compact prose with section headers." Build session designs the precise layout, paragraph structure, and sentence forms.
8. **Test fixture strategy.** Build session designs the test cases that verify the gate logic, the gaming defences, the score formulas, and the PROVISIONAL flag rules.

---

## Sequencing observation from mentor consultation

The mentor's pass 2 closing named a sequencing concern outside the technical specification: the reflect endpoint that the architecture specified should be built before this score. The founder elected to set this aside for separate handling and proceed with this draft spec. This note exists for traceability — not as a blocker to the build, but so the observation isn't lost.

---

*End of draft spec. Status: Designed. Not yet Adopted. Build session deferred. Authored 2026-05-14 in scoping/exploration session with private-mentor consultation as the philosophical-grounding source.*
