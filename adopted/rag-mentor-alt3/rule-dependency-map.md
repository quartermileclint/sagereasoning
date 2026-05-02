# Deliverable 9 — Rule Dependency Map and Engine Sequencing Logic

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — the deterministic engine's execution order); AC-13 (three-tier intake clarification — the engine's intake-tier dispatch is part of the sequencing); AC-14 (deterministic withholding — Tier 3 OPEN_DEFERRAL is a sequencing output, not a fallback). Incorporates D8 Validation Addendum guidance for Rule 7 / Rule 8 / Rule 9.

**Cross-references:**
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — the 10 rules whose dependency-map summary this deliverable expands)
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — the 9+1 mechanism taxonomy)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3 — the passion controlled vocabulary Rules 2, 3, 5 consume)
- `/drafts/rag-mentor-alt3/corpus-inventory.md` (D4 — the corpus the rules read from)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — the intake-tier dispatch this sequencing engages)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — confirms no audit-driven changes to the dependency map)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29 (validation findings incorporated)
- `/manifest.md` AC4 (invocation testing — applies to Phase-2 build), R6b (unity of virtue — preserved at the sequencing level)

---

## Plain-language summary

The 10 operationalised scoring rules in D8 do not run independently. They have **six structural dependencies**: places where one rule needs another rule's output before it can produce its own. The engine resolves each dependency through one of four patterns: forward sequencing, two-pass execution, conditional back-edge, or aggregation. This deliverable specifies each dependency in full and the canonical execution order that resolves them.

The execution order is: **1 → 2 → 3 → 4 → 5 (placeholder) → 6 → 7 (provisional) → 8 → 9 → 5 (enrich) → 7 (confirm) → 10**. Two rules (5 and 7) execute twice — a placeholder pass and an enrichment / confirmation pass. One conditional back-edge (Rule 8 → Rules 2/3) fires when `VALUE_ERROR_WITHOUT_PASSION` is set. The loop is bounded — at most one re-run per request — so the engine is guaranteed to terminate.

This deliverable does not redefine any rule's logic. It specifies how the rules compose. The Validation Addendum guidance on Rules 7, 8, 9 (per D-RAG-MENTOR-ALT3-VALIDATED) is incorporated as additional sequencing constraints rather than logic redefinitions.

## Glossary

- **Dependency** — a place where Rule X needs Rule Y's output before Rule X can produce its own. Six dependencies are catalogued below.
- **Forward dependency** — Rule X → Rule Y where Y consumes X's output. Resolved by sequencing X before Y.
- **Circular dependency** — Rule X ↔ Rule X (within a single rule, sub-steps depend on each other). Resolved by internal two-pass.
- **Bidirectional dependency** — Rule X ↔ Rule Y where each rule needs the other's output. Resolved by two-pass with provisional first run.
- **Conditional back-edge** — Rule X → Rule Y under a specific firing condition. Resolved by conditional re-run with a loop guard.
- **Aggregation dependency** — Rule X aggregates outputs of Rules A...N. Resolved by sequencing X last.
- **Pass-1 / Pass-2** — for two-pass rules, the first execution (Pass-1) produces a placeholder output the engine uses for downstream rules; the second execution (Pass-2) replaces the placeholder with the enriched output once upstream rules complete.
- **Engine sequencing** — the canonical order in which the engine executes the 10 rules. The six dependencies determine the order; the order is the resolution.
- **Loop guard** — a counter that limits how many times the engine re-runs a conditional back-edge per request. Set to maximum 1 re-run per dependency per request, so the engine always terminates.

## The six dependencies (full treatment)

The dependency map is summarised in D8 §"The dependency map (summary)" as a 4-column table. Below, each dependency receives full treatment: dependency type, participating rules, data-flow direction, the resolution pattern, the relationship to Validation Addendum guidance (if any), and the engineering implication.

### Dependency 1 — Forward (Rule 5 → Rule 9, with Rule 5 enrichment from Rule 9)

**Type:** Forward, with two-pass resolution (the forward dependency is asymmetric — Rule 5 produces a placeholder before Rule 9 runs, and Rule 5 enriches its output after Rule 9 produces virtue data).

**Participating rules:** Rule 5 (`passion_false_judgement`) and Rule 9 (`virtue_domain_engaged`).

**Data flow:**
- Rule 5 Pass-1 produces `false_judgements[]` with `correct_judgement` slot empty (placeholder). Rule 5 needs the canonical `correct_judgement` to fill the slot. The canonical answer comes from the virtue domain that would replace the false judgement (e.g., the false judgement "reputation is a genuine good" is replaced by the phronesis-shaped correct judgement "reputation is a preferred indifferent; selecting it via virtuous action is appropriate"). That virtue domain is identified by Rule 9.
- Rule 5 Pass-1 also feeds Rule 9: Rule 9 reads `dominant_false_judgement` from Rule 5's Pass-1 output to identify which virtue domain is most centrally engaged.
- Rule 9 produces `virtue_engagement[]`.
- Rule 5 Pass-2 reads `virtue_engagement[]` from Rule 9 and `value_indifferent` data from Rule 8 (which has run between Pass-1 and Pass-2 in the canonical sequencing) to fill the `correct_judgement` slot in each entry of `false_judgements[]`.

**Resolution pattern:** Two-pass. Rule 5 Pass-1 runs at sequencing position 5 with `correct_judgement: ""`. Rule 9 runs at position 9. Rule 5 Pass-2 runs after Rule 9 to enrich `correct_judgement`.

**Relationship to Validation Addendum:** None directly. Rule 5's Pass-2 enrichment is unchanged by the Validation Addendum.

**Engineering implication:** Rule 5's output is finalised after Rule 9 completes. Downstream consumers of Rule 5 (specifically Rule 10's composite, which reads `false_judgements[]` for risk-flag detection) must be sequenced after Rule 5 Pass-2 — i.e., at position 10 or later. In the canonical sequencing, Rule 10 is at position 12 (last), which honours this constraint.

### Dependency 2 — Circular (Phronesis ↔ Andreia within Rule 9 — unity thesis)

**Type:** Circular within a single rule. The unity thesis (R6b — *"all four virtues are co-dependent; a strong rating on one virtue cannot coexist with a weak rating on another"*) means Rule 9's per-virtue classification is internally circular: phronesis depends on andreia (the practitioner's "what is genuinely fearful" judgement informs phronesis) and andreia depends on phronesis (the practitioner's "what is genuinely good" judgement informs andreia).

**Participating rules:** Rule 9 (`virtue_domain_engaged`) — internal sub-step circularity.

**Data flow:** Within Rule 9's logic, the four virtues are sequenced rather than evaluated independently. Phronesis is sequenced first using Rule 8's `value_indifferent` output (Rule 8 has run before Rule 9 in the canonical sequencing). Andreia is sequenced second using Rule 1's `prohairesis_filter` output. Dikaiosyne uses Rule 7's provisional output (Pass-1 of Rule 7). Sophrosyne uses Rule 4's `passion_causal_stage` output. The unity check resolves at the end (weakest-link aggregation across all four).

**Resolution pattern:** Internal sequencing within Rule 9. Phronesis first → andreia → dikaiosyne → sophrosyne → unity check. Each step uses upstream rule outputs that have already run in the canonical engine sequencing.

**Relationship to Validation Addendum:** Adjustment 1 (Rule 9 unity-thesis flag-not-reclassify for progressors) modifies how Rule 9's `unity_inconsistency` flag is *interpreted* by Rule 10, not Rule 9's internal sequencing. Rule 9 still runs the unity check; the conditional behaviour (unstable phronesis → diagnostic only; false phronesis → propagates to composite) is implemented at Rule 10's composite-aggregation step. See Dependency 6 below.

**Engineering implication:** Rule 9's internal four-virtue sequencing is captured in D8 Rule 9 §"Logic (sequenced per Dependency 2)". This is not a separate sequencing concern at the engine level — Rule 9 is one rule with internal ordering.

### Dependency 3 — Bidirectional (Rule 7 ↔ Rule 9)

**Type:** Bidirectional. Cicero's Q1 ("Is the action honourable?") in Rule 7 needs Rule 9's virtue assessment for full evaluation. Dikaiosyne classification in Rule 9 needs Rule 7's `obligation_status[]` for full evaluation.

**Participating rules:** Rule 7 (`oikeiosis_obligation`) and Rule 9 (`virtue_domain_engaged`).

**Data flow:**
- Rule 7 Pass-1 (provisional) runs at sequencing position 7. It applies Cicero's Q1 based on action description alone (without virtue data) and produces a provisional `obligation_status[]`. The Pass-1 result is provisional because Q1's "Is the action honourable?" is fully resolved only with virtue assessment.
- Rule 9 (sequencing position 9) reads Rule 7 Pass-1's provisional `obligation_status[]` to inform dikaiosyne classification. Dikaiosyne is *"what is owed to others — distributing to each their due"* — directly informed by oikeiosis obligation.
- Rule 7 Pass-2 (confirmation) re-runs Q1 with full virtue assessment from Rule 9. If Q1 result changes, the change is logged via `cicero_q1_passed: <true_post_virtue|false_post_virtue>`. Rule 7 Pass-2 also resolves `circle_conflict_resolution` using virtue data.

**Resolution pattern:** Two-pass with provisional first run. Rule 7 Pass-1 → Rule 9 → Rule 7 Pass-2.

**Relationship to Validation Addendum:** Adjustment 3 (Rule 7 explicit operative-circle dependency on Rule 6) is closely related but distinct. Adjustment 3 specifies *which circle* Rule 7 reads from Rule 6's output — the `primary_circle` if `oikeiosis_contraction: false`; the contracted circle if `oikeiosis_contraction: true`. This is a Rule 6 → Rule 7 forward dependency (see Dependency 5 below) and is distinct from the Rule 7 ↔ Rule 9 bidirectional dependency. Both apply.

**Engineering implication:** Rule 7 executes twice. Pass-1's `cicero_q1_passed` may flip in Pass-2; the engine's output diagnostic surfaces both values when they differ (`cicero_q1_passed_pre_virtue` and `cicero_q1_passed_post_virtue`) so the practitioner / agent caller can see when virtue assessment changed the obligation classification.

### Dependency 4 — Conditional back-edge (Rule 8 → Rules 2/3, fires on `VALUE_ERROR_WITHOUT_PASSION`)

**Type:** Conditional back-edge. Rule 8 may detect a value error (`INFLATION` / `DEFLATION` / `INVERSE_DEFLATION`) on an indifferent without Rules 2 / 3 having detected a corresponding passion. This is the case where the practitioner has a held-as-true intellectual error rather than a felt passion (no agitation, no desire, no fear in the narrative — but the narrative structurally inflates a preferred indifferent).

**Participating rules:** Rule 8 (`value_indifferent`) → Rules 2 (`passion_root_detection`) and 3 (`passion_sub_species`).

**Firing condition:** Rule 8 sets `value_error_without_passion_flag: true` when:
1. Rule 8's `value_errors[]` is non-empty (at least one indifferent treated as INFLATION / DEFLATION / INVERSE_DEFLATION).
2. Rule 2's `passions_detected[]` (from the first pass at position 2) is empty OR no detected passion's trigger entity overlaps with the value-error indifferent.
3. The value-error indifferent has high narrative weight (per D8 Rule 8 §"Logic" step 5 canonical threshold — *"any non-trivial value error on an entity with high narrative weight"*).

**Data flow:**
- Rules 2 and 3 run at positions 2 and 3 against the original narrative.
- Rule 8 runs at position 8 and may set the flag.
- If the flag fires, the engine re-runs Rules 2 and 3 with Rule 8's `dominant_value_error` as additional input. The re-run prompts the engine: *"the practitioner's narrative inflates [indifferent] to genuine-good status. Re-evaluate whether a passion is operative on this indifferent that the first pass missed."*
- If the re-run detects a passion, the engine continues with the augmented `passions_detected[]` and re-runs Rules 4, 5 (Pass-1), 9 to incorporate the newly-detected passion. Rule 6 and Rule 7 Pass-1 are not affected (they don't depend on `passions_detected[]`).
- If the re-run still detects no passion, the engine proceeds with the original empty `passions_detected[]`. The intellectual error is real but not passion-shaped; Rule 5's `false_judgements[]` will be empty for that indifferent (the false judgement is structurally present but no operative passion expresses it).

**Resolution pattern:** Conditional re-run with a loop guard. Maximum one re-run per request per dependency. Tracked via `back_edge_runs_remaining` counter initialised to 1 at sequencing start; decremented on first back-edge fire; the back-edge does not fire a second time even if the re-run produces another `VALUE_ERROR_WITHOUT_PASSION` (the engine logs the persistent flag and proceeds).

**Relationship to Validation Addendum:** Adjustment 2 (Rule 8 compound severity for INFLATION / DEFLATION same-root errors) interacts with this dependency. When Rule 8 detects a `COMPOUND_INFLATION_DEFLATION` (same-root pair — e.g., craving recognition + fearing humiliation as expressions of one false root judgement that recognition is genuinely good and humiliation is genuinely bad), the conditional back-edge fires under the same logic — but the re-run is now informed by the compound nature of the value error. The augmented input to Rules 2/3 names the same-root structure and instructs the engine to look for either a compound passion (e.g., `philodoxia + aischyne`) or a single passion that operates across both sides of the compound (e.g., philodoxia operating on both the desire-for-recognition and the fear-of-humiliation).

**Engineering implication:** the loop guard is critical. Without it, the engine could oscillate (Rule 8 detects value error → Rules 2/3 re-run → still no passion → Rule 8 still has value error → re-run again, etc.). The guard sets one re-run per request per dependency and the back-edge is satisfied — either the re-run finds a passion (forward progress) or the engine accepts the intellectual-error case and proceeds without one (forward progress with documented gap).

### Dependency 5 — Forward (Rule 6 → Rule 2; and Rule 6 → Rule 7 per Validation Addendum)

**Type:** Two forward dependencies. Both originate at Rule 6.

**Sub-dependency 5a — Rule 6 → Rule 2 (passion data needed for stated-vs-operative concern detection):** Rule 6's `oikeiosis_contraction` output requires identifying the *operative* concern in the narrative, which is informed by the dominant passion. If the practitioner's stated concern is a wider circle ("I'm doing this for the community") but the operative concern is reputation (philodoxia at Circle 1), the contraction is detectable only if the passion has been identified.

This sub-dependency is **resolved by sequencing Rule 2 before Rule 6** (per the canonical sequencing 1 → 2 → 3 → 4 → 5(p) → 6 → ...). Rule 6 reads `passions_detected[]` from Rule 2 to identify the operative concern.

**Sub-dependency 5b — Rule 6 → Rule 7 (operative circle, per Validation Addendum Adjustment 3):** Rule 7's obligation classification must use the operative circle (the circle from which the action actually operates), not the stated circle. Rule 6 distinguishes `primary_circle` (stated) from `oikeiosis_contraction` (operative narrower than stated). Rule 7 reads:
- `primary_circle` if `oikeiosis_contraction: false` (stated and operative are the same — the action operates from the stated circle).
- The contracted circle if `oikeiosis_contraction: true` (operative is narrower than stated — the action operates from the contracted circle, e.g., Circle 1 even though Circle 3 is stated).

This sub-dependency is the Validation Addendum Adjustment 3 applied. Without explicit naming, Rule 7's input is ambiguous and the dikaiosyne classification in Rule 9 inherits Rule 6's `STATED_OPERATIVE_CONFLICT` ambiguity.

**Resolution pattern:** Forward sequencing. Rule 6 runs at position 6 (after Rules 2, 3, 4, 5-Pass-1); Rule 7 Pass-1 runs at position 7 (after Rule 6).

**Relationship to Validation Addendum:** Adjustment 3 makes sub-dependency 5b explicit. Without the addendum, sub-dependency 5b was *implicit* — Rule 7 received Rule 6's outputs but didn't specify which circle to read. With the addendum, Rule 7's Inputs section names the operative-circle field explicitly and Rule 7's Logic step 1 names the dependency upfront.

**Engineering implication:** Rule 7's input schema is now explicit about the operative-circle field. Phase-2 build implements this as a named input parameter rather than inferring from Rule 6's outputs at runtime.

### Dependency 6 — Aggregation (Rule 10 ← Rules 1–9, with Validation Addendum Adjustment 1 conditional logic)

**Type:** Aggregation. Rule 10 (`katorthoma_proximity`) reads outputs from all upstream rules and produces the composite proximity classification.

**Participating rules:** Rule 10 reads from Rules 1, 2, 3, 4, 5 (Pass-2), 6, 7 (Pass-2), 8, 9.

**Data flow:** Rule 10 maps upstream outputs to four canonical dimensions:
- Dimension 1 (control): from Rule 1's `misclassification_severity`.
- Dimension 2 (passion): from Rules 2, 3, 4, 5 (presence and intensity of passions, stage of breakdown, refinement_source confidence).
- Dimension 3 (obligation): from Rules 6, 7 (oikeiosis_contraction, circle_conflict, obligation_status).
- Dimension 4 (virtue): from Rule 9 (`weakest_virtue_flag`, `dominant_virtue_failure`).

The four dimensions aggregate via weakest-link to `composite_score`. The composite maps to `proximity_level` (`reflexive` / `habitual` / `deliberate` / `principled` / `sage_like`).

**Validation Addendum Adjustment 1 conditional logic:** Rule 9's `unity_inconsistency` flag is interpreted by Rule 10 conditionally:
- **Unstable phronesis case** — Rule 9's `unity_inconsistency: true` AND Rule 5's `refinement_source` is empty / non-PROFILE / longitudinal evidence shows stable phronesis history. The flag is diagnostic only. Rule 10's composite is computed without forcing weakest-link aggregation on the virtue dimension (the per-virtue ratings stand as Rule 9 produced them, with the flag surfaced in the output).
- **False phronesis case** — Rule 9's `unity_inconsistency: true` AND Rule 5's `refinement_source: PROFILE` AND the profile prior identifies a known false-judgement pattern that the unity-inconsistency consists with. The flag indicates a serious failure. Rule 10's composite forces weakest-link aggregation on the virtue dimension (the per-virtue ratings collapse to the lowest, propagating to composite).
- **Insufficient longitudinal evidence case** — Rule 9's `unity_inconsistency: true` AND Rule 5's `refinement_source: DERIVED` AND no longitudinal evidence to break the unstable-vs-false tie. Rule 10's composite uses the existing AC-17 `CONFIDENCE_WEIGHTED` flag to mark the composite as low-confidence. The default behaviour falls toward unstable phronesis (diagnostic only) under uncertainty — the conservative posture per R6d (passions diagnostic, not punitive) — but the flag is surfaced explicitly.

**Resolution pattern:** Aggregation with explicit conditional logic in Rule 10's composite step. Rule 10 must be sequenced after all upstream rules including Rule 5 Pass-2 and Rule 7 Pass-2.

**Relationship to Validation Addendum:** Adjustment 1 lives entirely at Rule 10's composite step. Rule 9 still produces `unity_inconsistency: true` when its internal unity check finds conflict; Rule 10 interprets the flag conditionally. This preserves R6b (unity thesis) at Rule 9's level while honouring the Validation Addendum's progressor-population calibration at Rule 10's level.

**Engineering implication:** Rule 10's composite step receives the full upstream output set (including Rule 5 Pass-2's `refinement_source` and the practitioner's longitudinal profile data). The conditional logic above is encoded as a deterministic decision tree in Rule 10's composite step, not as an LLM judgement.

## The canonical engine sequencing

The 6 dependencies determine the execution order. The canonical sequencing is:

```
Position 1  — Rule 1   (prohairesis_filter)
Position 2  — Rule 2   (passion_root_detection)
Position 3  — Rule 3   (passion_sub_species)
Position 4  — Rule 4   (passion_causal_stage)
Position 5  — Rule 5 Pass-1 (passion_false_judgement, placeholder)
Position 6  — Rule 6   (oikeiosis_stage)
Position 7  — Rule 7 Pass-1 (oikeiosis_obligation, provisional)
Position 8  — Rule 8   (value_indifferent)
                ↑ Conditional back-edge to Positions 2, 3 if VALUE_ERROR_WITHOUT_PASSION fires.
                  Loop guard: max 1 re-run per request.
Position 9  — Rule 9   (virtue_domain_engaged)
Position 10 — Rule 5 Pass-2 (passion_false_judgement, enrichment)
Position 11 — Rule 7 Pass-2 (oikeiosis_obligation, confirmation)
Position 12 — Rule 10  (katorthoma_proximity, composite)
```

The sequencing satisfies all 6 dependencies:
- **Dependency 1** — Rule 5 Pass-1 at position 5; Rule 9 at position 9; Rule 5 Pass-2 at position 10. Rule 5's enriched output is finalised before Rule 10 reads it at position 12.
- **Dependency 2** — Internal to Rule 9 at position 9. Phronesis-first sequencing inside Rule 9 uses Rule 8's output (position 8 — runs before position 9).
- **Dependency 3** — Rule 7 Pass-1 at position 7 (provisional, no virtue data); Rule 9 at position 9; Rule 7 Pass-2 at position 11 (confirmation with virtue data).
- **Dependency 4** — Conditional back-edge from Rule 8 at position 8 to Rules 2, 3 at positions 2, 3. Loop guard prevents oscillation.
- **Dependency 5** — Sub-dependency 5a: Rule 2 at position 2 before Rule 6 at position 6. Sub-dependency 5b: Rule 6 at position 6 before Rule 7 at position 7 (which reads operative circle per Validation Addendum Adjustment 3).
- **Dependency 6** — Rule 10 at position 12 (last). Reads all upstream outputs including Rule 5 Pass-2 and Rule 7 Pass-2.

### Worked sequencing trace — philodoxia at synkatathesis

To illustrate, the canonical sequencing for the philodoxia anchor pattern (per D3 Example A) executes as:

1. **Position 1** — Rule 1: classifies "their good opinion" as `external_scope`; flags `CONTROL_INFLATION`; severity `moderate`; `filter_passed: false`.
2. **Position 2** — Rule 2: detects `epithumia` (future apparent_good); `dominant_passion: epithumia`; trigger entity "their good opinion".
3. **Position 3** — Rule 3: maps to `philodoxia`; `dominant_sub_species: philodoxia`.
4. **Position 4** — Rule 4: locates breakdown at `synkatathesis`; `primary_causal_breakdown: {philodoxia, synkatathesis}`.
5. **Position 5** — Rule 5 Pass-1: false judgement = `{sub_species: philodoxia, object: "their good opinion", judgement_type: INFLATION, correct_judgement: "", refinement_source: PROFILE}`.
6. **Position 6** — Rule 6: `primary_circle: 1` (the practitioner's reputation); `widest_circle_reached: 3` (the audience is community); `oikeiosis_contraction: true` — stated concern is community service, operative concern is Circle 1 reputation.
7. **Position 7** — Rule 7 Pass-1: per Adjustment 3, reads operative circle (Circle 1 since `oikeiosis_contraction: true`); applies Cicero's Q1 provisionally to action description; provisional `cicero_q1_passed: false`.
8. **Position 8** — Rule 8: `indifferents_at_stake: [reputation]`; `treatment_map: [{indifferent: reputation, axia: moderate, treatment: INFLATION}]`; `dominant_value_error: INFLATION on reputation`. Cross-checks against Rule 5 Pass-1 output (philodoxia detected — passion present, no `VALUE_ERROR_WITHOUT_PASSION` flag fires).
9. **Conditional back-edge — does not fire** because passion was detected at Position 2.
10. **Position 9** — Rule 9: phronesis weak (reputation inflated to genuine good); dikaiosyne weak (Circle-3 obligation undermined by Circle-1 operative concern); andreia weak (acting from fear of disesteem); sophrosyne weak (impulse to perform in excess of measure). `unity_inconsistency: false` (all weak — no conflict to resolve). `weakest_virtue_flag: phronesis`.
11. **Position 10** — Rule 5 Pass-2: enriches `correct_judgement` slot using Rule 8's `value_indifferent` data (reputation is preferred indifferent) and Rule 9's `virtue_engagement[]` (phronesis weak — the operative cognitive failure). Enriched: `correct_judgement: "Reputation is a preferred indifferent. Selecting it via virtuous action is appropriate; desiring it as a genuine good is the philodoxia pattern."`
12. **Position 11** — Rule 7 Pass-2: re-runs Q1 with full virtue assessment from Rule 9. Q1 result confirmed (`cicero_q1_passed_post_virtue: false`). Resolves `circle_conflict_resolution`: "The higher circle's obligation prevails; the philodoxia must be examined."
13. **Position 12** — Rule 10: composite read from upstream. `dimension_scores`: control = mild-fail (severity moderate), passion = present-strong (philodoxia at synkatathesis), obligation = unmet at Circle 1 contraction, virtue = phronesis weak. Composite via weakest-link → `proximity_level: deliberate` (the practitioner is deliberating in form but philodoxia is operative). Adjustment 1 conditional: `unity_inconsistency: false` so the conditional doesn't engage. `proximity_risk_flag: PASSION_DOMINANCE`.

The trace shows the engine's deterministic execution. Every output traces to a rule's logic step with its source citation; Layer 3 prose translation (Deliverable 11) translates the structured output into conversational prose without adding new Stoic inference.

## Loop-guard specification

The conditional back-edge from Rule 8 to Rules 2/3 (Dependency 4) requires a loop guard to prevent oscillation. The guard is implemented as:

```
state.back_edge_remaining = {
  "rule_8_to_2_3": 1
}
```

At the start of each request, the back-edge counter is initialised to 1. When Rule 8 sets `value_error_without_passion_flag: true`, the engine:

1. Checks `state.back_edge_remaining["rule_8_to_2_3"]`.
2. If > 0: decrements the counter; re-runs Rules 2 and 3 with Rule 8's `dominant_value_error` as additional input; re-runs Rules 4, 5 (Pass-1), 9 if the re-run detects new passions; proceeds to Rule 10.
3. If = 0: logs the persistent flag (`back_edge_exhausted: true` in Rule 10's diagnostic output); proceeds to Rule 10 without re-running.

The counter resets per request. Across requests, the back-edge fires per request independently (a practitioner who shows the same value-error-without-passion pattern across multiple instances will have the back-edge fire once per instance).

The guard is structurally bounded by the request itself — there is no across-request state. This is consistent with KG1 rule 4 (Vercel terminates execution after response) — back-edge state does not persist beyond the response.

## Intake-tier dispatch interaction

The three-tier intake clarification model (AC-13) interacts with the engine sequencing at specific points:

- **Tier 1 force triggers** (`ELEMENT_FUSION`, `SCOPE_AMBIGUITY`, `TEMPORAL_AMBIGUITY`) fire at sequencing positions 1–3 and halt execution. The engine returns a clarification request to the caller; subsequent positions do not run on that request. When the practitioner provides clarification, the engine re-starts at position 1 with the augmented narrative.
- **Tier 2 soft triggers** (`STATED_OPERATIVE_CONFLICT`, `STATED_EQUANIMITY_UNVERIFIED`) fire at Rule 6 (position 6) and Rule 7 (position 7) respectively. The engine produces the soft clarification *alongside* the evaluation result (the evaluation continues; the soft question is appended to the response for the practitioner to optionally answer or decline).
- **Tier 3 deterministic withhold** (eupatheia boundary, praxis-level motivation) fires at Rule 10's composite step (position 12) when the upstream rules have produced outputs that depend on `SELF_REPORT_DEPENDENT` data the practitioner has not provided OR when `CONFIDENCE_WEIGHTED` evidence is below threshold. The engine fills the affected fields with `OPEN_DEFERRAL` flags rather than asserting; the affected classification is withheld and surfaces on the practitioner's scoring record as a deferred question.

D13 (three-tier intake clarification specification) covers the trigger logic, question text, and conversation flow per tier in full. This deliverable specifies *where in the sequencing* the tiers engage; D13 specifies *what the tiers do*.

## Engineering implications for Phase-2 build

This deliverable is design only. Phase-2 build implementation is out of scope for Phase 1. However, the sequencing has implications that Phase 2 will consume:

1. **Each rule is a discrete deterministic operation** (per AC-12 — translation-sandwich; the deterministic engine in Layer 2 does all Stoic reasoning via operationalised rules). Phase-2 build implements each rule as a function; the engine's main loop dispatches rules in canonical order.
2. **Two-pass rules execute twice.** Rule 5 has two function calls in the main loop; Rule 7 has two function calls. The engine maintains rule output state across the loop; Pass-2 reads upstream outputs that have been added since Pass-1.
3. **Conditional back-edge is a state machine.** The engine maintains a back-edge counter per request; the conditional re-run is a state transition, not a special-case branch. Phase-2 build may use a simple flag (boolean) since there is only one conditional back-edge in the sequencing today.
4. **Tier 1 halts execution; Tier 2 augments output; Tier 3 nullifies fields.** These three engagement patterns are distinct response shapes the engine produces. The route-side response envelope (D2 Tables 1–5 projections) consumes these shapes per consumer.
5. **The sequencing is the determinism guarantee.** AC-12's translation-sandwich claim — *"no Stoic inference originates from Claude"* — depends on the sequencing being executed deterministically in code. Any deviation (e.g., letting an LLM choose which rule to run next) breaks the architecture. The sequencing is therefore non-negotiable in Phase-2 build.

## Cleanliness rating

The sequencing itself is **HIGH cleanliness** — the canonical order is determined by the dependencies and the dependencies are structurally fixed. There is no interpretive judgement in the sequencing.

The Tier 1 halt, Tier 2 augmentation, and Tier 3 nullification engagement patterns are also HIGH cleanliness — each pattern is a deterministic engine response shape.

The conditional back-edge logic guard is HIGH cleanliness — a simple counter with deterministic decrement.

The Validation Addendum Adjustment 1 conditional at Rule 10 (unstable vs false phronesis) is **PARTIAL cleanliness** — the conditional uses Rule 5's `refinement_source` and longitudinal evidence to break the tie. Where longitudinal evidence is below AC-17 `CONFIDENCE_WEIGHTED` threshold, the conditional defaults to unstable phronesis (the conservative, diagnostic-not-punitive posture per R6d). This is structurally bounded — three named cases plus an explicit default — and is honest about which case the engine is in via the AC-17 `CONFIDENCE_WEIGHTED` flag in Rule 10's output.

## R6 / R7 / R8 compliance

- **R6b (unity of virtue):** preserved at Rule 9's internal sequencing (Dependency 2). Rule 10's Adjustment 1 conditional does not relax R6b — it preserves the unity check at Rule 9 and applies a calibrated interpretation at Rule 10 for the progressor-population case.
- **R6d (passions diagnostic, not punitive):** preserved by the conditional back-edge (Dependency 4). When Rule 8 detects a value error without a corresponding passion, the back-edge gives Rules 2/3 a second pass with augmented input rather than forcing a passion classification. If no passion is detectable, the engine accepts the intellectual-error case and proceeds without a passion — diagnostic honesty over punitive over-classification.
- **R7 (source fidelity):** preserved by the rule structure. Each rule's `Source:` field in D8 names the corpus passages it consumes. The sequencing does not introduce new Stoic claims.
- **R8a (strict glossary in data files):** the rule outputs use Greek IDs (`prohairesis`, `oikeiosis`, `katorthoma`); the sequencing does not introduce new vocabulary.
- **R8d (skill contracts — agent-facing):** the engine's three response shapes (Tier 1 halt, Tier 2 augmentation, Tier 3 nullification) are surfaced in agent-facing API responses with English outcome-focused descriptions per D11 (Layer 3 translation specification).

## Open questions

1. **Is the loop-guard threshold (1 re-run per request) the right value?** The architecture exercise did not produce evidence that more than 1 re-run is ever needed. If Phase-2 production surfaces cases where 2 re-runs would resolve a value error that 1 re-run does not, the threshold may be raised. Logged as a Phase-2 production observation candidate.
2. **Should Rule 10's Adjustment 1 conditional default to unstable phronesis under uncertainty, or false phronesis?** This deliverable specifies unstable phronesis (diagnostic only) as the default per R6d. The Validation Addendum names the progressor population (the practitioner population the product is designed for) as the calibration anchor — and progressors are more often unstable than false. The default may be re-examined when the rule book is recalibrated for other practitioner profiles per ES1.
3. **Does the engine need any additional dependencies that the architecture exercise did not surface?** This deliverable's six dependencies are inherited from D8's summary table. Phase-2 build may surface implementation-level dependencies (e.g., shared state across rules that the abstract dependency map did not capture) — those are Phase 2 questions.

## Approval gate

This deliverable does not gate downstream Phase-1 work. It is consumed by Phase-2 build (the engine implementation). When approved, this deliverable becomes v1.0.0 of the engine sequencing logic. It moves from `/drafts/rag-mentor-alt3/` to `/adopted/` in the same approval batch as the other Phase-1 deliverables (Standard risk under 0d-ii — drafts in `/drafts/`, no live-system effect; the move to `/adopted/` is Elevated risk and requires its own decision-log entry).

---

*End of Deliverable 9.*
