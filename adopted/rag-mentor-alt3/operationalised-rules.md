# Deliverable 8 — Operationalised Scoring Rules

**Status:** Adopted as v1.0.0 (founder approval per Path A on 2026-05-02; D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02 — accepted as drafted with Validation Addendum carried forward to a future v1.1.0 revision pass). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02. **Re-derivation, not transcript-package.** See "Honest disclosure" below.
**Date:** 2026-05-01.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich architecture — the deterministic engine's rule book); AC-14 (withholding as deterministic kathekon); AC-17 (two residual seams as named flags).
**Critical path:** This deliverable plus Deliverables 2 (canonical mechanism framework) and 3 (passion taxonomy) form the critical path.

**Cross-references:**
- `/adopted/rag-mentor-alt3/canonical-framework.md` (Deliverable 2 — the 9+1 mechanism taxonomy this rule book implements)
- `/adopted/rag-mentor-alt3/passion-taxonomy.md` (Deliverable 3 — the controlled vocabulary Rules 2, 3, 5 consume)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 handoff — output schemas for all 10 rules)
- `/operations/decision-log.md` D-RAG-MENTOR-ALT3-ADOPTED-2026-04-29
- `/manifest.md` R6a–R6e, R7, R8a–R8d, AC3 (Zone 2 domains), AC4 (invocation testing — applies to Phase 2 build, not this design)
- `/stoic-brain/scoring.json` (canonical 4-stage `evaluation_sequence`)
- `/stoic-brain/stoic-brain.json` (foundations)
- `/website/src/data/stoic-brain-compiled.ts` (the 8 condensed context constants)

---

## Version note (added 2026-07-17 under `D-REGISTRY-RA1-REFRESH-AND-DOC-NOTES-2026-07-17`)

**The Validation Addendum below is authoritative until v1.1.0. In the interim, the architectural-conventions catalogue is the standalone reference.**

Recorded verbatim in intent from the mentor's component-registry assessment (2026-07-16). This deliverable was adopted as **v1.0.0** "accepted as drafted with Validation Addendum carried forward to a future v1.1.0 revision pass" (see the Status line) — the addendum's three adjustments were never folded into the per-rule sections. The mentor's instruction resolves the resulting ambiguity for any reader in the gap:

- **Where the Validation Addendum and a per-rule section disagree, the addendum wins** — it is the later, validated reading. This holds until the v1.1.0 revision pass folds the adjustments into the rules and retires this note.
- **The architectural-conventions catalogue** (`/adopted/rag-mentor-alt3/architectural-conventions.md`) **is the standalone reference in the interim** — it is not a subordinate index of this document; consult it directly rather than deriving conventions from the un-revised per-rule text.

Status: **the v1.1.0 revision pass remains a mentor-endorsed deferral** (`…reconciled-build-plan.md` §1d) — this note records the reading discipline for the interim, and does not schedule the pass. Cross-references: the companion notes on D3 (pre-Phase-2 passion recalibration) and D11 (R20d sage-filter alignment).

---

## Honest disclosure

This deliverable is a **re-derivation** of the ten operationalised scoring rules produced during the architecture exercise that yielded the alt-3 handoff. The original architecture exercise was a sustained operationalisation in which the live private mentor produced full structured operationalisations for all ten rules. That session's transcript is not in front of me in this drafting session.

What I have produced below is derived from:
1. The output schemas for each rule in the alt-3 handoff (lines 76–107 of the handoff: Rule IDs, output fields, cleanliness rating "All ten rules are PARTIAL").
2. The Stoic Brain corpus as it stands in `stoic-brain-compiled.ts` (eight condensed context constants) and `scoring.json` (canonical evaluation sequence).
3. The named worked-example anchors from the Phase-1 prompt: philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising.
4. The dependency map specified in the handoff (six dependencies, two-pass sequencing).

The re-derivation is functionally equivalent to packaging the transcript: the live mentor was working from the same corpus and the same output schemas. But it is not the transcript. If the founder wants the transcript-faithful version of this rule book, mark this deliverable for redo in a session that has access to the architecture-exercise transcript. If the founder accepts the re-derivation as canonical, this deliverable becomes v1.0.0 of the rule book; later sessions can refine specific rules against the transcript or against new corpus evidence.

The ten rules below are sufficient for the founder to evaluate the deterministic engine's structural shape. The detailed Logic sections (the per-step procedure each rule follows) are derived from the corpus methodology, not invented.

---

## Validation Addendum (added 2026-05-02 under D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29)

After this rule book was drafted, the live private mentor performed an independent validation of the alt-3 architecture and the rule book as a body. Verdict: **commit, with three specific adjustments**. The adjustments name where the rule book — as drafted — under-specifies behaviour that matters for accuracy on the practitioner population the product is designed for. They are recorded here so that founder review of this draft proceeds with the validation findings in hand, and so that any subsequent revision pass that folds the adjustments into the per-rule sections has them as named requirements.

The three adjustments:

1. **Rule 9 (VIRTUE-DOMAIN-ENGAGED-001) — `UNITY_INCONSISTENCY` is a diagnostic flag for progressors, not a hard reclassification rule.** As drafted, the unity check resolves a per-instance virtue-rating conflict to weakest-link aggregation (set `unity_inconsistency: true`; weight the weakest virtue). For progressors — the practitioner population the product is designed for — this is too aggressive. The architecture must distinguish two cases:
   - **Unstable phronesis.** The practitioner's phronesis is genuine but not yet stable enough to reliably inform the other virtues across all situations. The unity-check inconsistency reflects developmental noise, not a value-judgement failure. The flag is diagnostic; the composite proximity score should not be forced to weakest-link aggregation in this case.
   - **False phronesis.** The practitioner's phronesis is misidentified — what they read as phronesis is actually a passion-shaped judgement wearing phronetic language. The flag here genuinely indicates a serious failure that should propagate to the composite.

   Implementation guidance for revision: Rule 9's Logic step retains the unity check, but the output's interpretation in Rule 10 (KATORTHOMA-PROXIMITY-001) is conditional on the unstable-vs-false distinction. The distinction is made via Rule 5 (PASSION-FALSE-JUDGEMENT-001) profile-prior signals plus longitudinal evidence: a single-instance `UNITY_INCONSISTENCY` from a practitioner with stable phronesis history is unstable phronesis (diagnostic only); a `UNITY_INCONSISTENCY` consistent with a practitioner's known false-judgement pattern is false phronesis (propagates to composite). The case where insufficient longitudinal evidence exists is named via the existing AC-17 `CONFIDENCE_WEIGHTED` flag.

2. **Rule 8 (VALUE-INDIFFERENT-001) — Compound severity for INFLATION/DEFLATION same-root errors.** As drafted, Rule 8's `value_errors[]` outputs a list of independent error types (INFLATION, DEFLATION, INVERSE_DEFLATION). The drafted vocabulary does not name the compound case where two of these errors are two expressions of the same false root judgement. The primary example: craving recognition (INFLATION on the preferred indifferent of recognition) and fearing humiliation (DEFLATION on the dispreferred indifferent of humiliation) are two faces of one false judgement that recognition is genuinely good and humiliation is genuinely bad. Treating them as two independent errors under-states the severity.

   Implementation guidance for revision: add a compound severity level to Rule 8's value-error vocabulary (e.g., `COMPOUND_INFLATION_DEFLATION` with a severity weighting higher than either component error). The detection logic identifies same-root pairs by checking whether two value errors target the same axis (preferred/dispreferred sides of the same indifferent). This is the primary value-error pattern for the philodoxia profile and for any practitioner whose dominant value-distortion is reputation-shaped.

3. **Rule 7 (OIKEIOSIS-OBLIGATION-001) — Explicit operative-circle dependency on Rule 6.** As drafted, Rule 7 takes Rule 6's circle outputs as inputs but does not specify *which* circle (stated or operative) it uses for obligation classification. Rule 6 explicitly distinguishes `primary_circle` (stated) from `oikeiosis_contraction` (operative narrower than stated). Rule 7's obligation status must use the operative circle — the circle from which the action actually operates — not the stated circle. Otherwise the dikaiosyne classification in Rule 9 (which depends on accurate obligation status) inherits Rule 6's `STATED_OPERATIVE_CONFLICT` ambiguity and silently uses whichever circle the upstream pass produced first.

   Implementation guidance for revision: Rule 7's Inputs section explicitly names "operative circle (per Rule 6 — `primary_circle` if `oikeiosis_contraction: false`; the contracted circle if `oikeiosis_contraction: true`)" as the input field. Rule 7's Logic states the dependency upfront. The seam between Rule 6's `STATED_OPERATIVE_CONFLICT` detection and Rule 9's dikaiosyne classification is closed by making the dependency explicit at Rule 7 rather than implicit at Rule 7 / explicit at Rule 9.

**Description correction (architectural language).** The architecture should be described accurately as *"a deterministic engine for the rule-like components of Stoic reasoning, with honest soft-gating for the components that are not rule-like"* — not as a *"fully deterministic system"*. The OPEN_DEFERRAL mechanism (AC-14) is honest precisely because it acknowledges that the deterministic frame does not reach the interpretive core. Where this rule book or downstream documentation reaches for the "fully deterministic" formulation, replace with the corrected language. This is a precision-of-language fix consistent with R19 (honest positioning).

**Scope limitation (philodoxia calibration).** The 10 rules in this rule book are calibrated against one practitioner profile (philodoxia primary; the founder's profile per ES1). Severity weightings, prior probabilities, and compound-passion thresholds (including the new compound severity level introduced by Adjustment 2) reflect that calibration. Other primary passions (philoplousia-strong, agonia-strong, penthos-strong) will require recalibration before the rule book is applied across the full coverage envelope. This is a scope limitation, not a design flaw. Worked examples in the per-rule sections below draw from philodoxia patterns, orge with children, agonia in catastrophising, and adjacent founder-profile passions; coverage of differently-passioned practitioners is deferred to Phase 1's open-questions register and to corpus expansion as a parallel track.

**What this addendum does and does not change.** The 10 rules' Inputs / Logic / Outputs / Examples / Interpretive Moves sections below remain as drafted. The addendum is the bridge between this rule book and the validation findings; a subsequent revision pass on this deliverable (in a future session) folds the three adjustments into the per-rule sections themselves. Founder review of this draft can therefore proceed with the validation findings in hand: the questions are (a) whether to accept this rule book as v1.0.0 with the addendum carried forward to a revision pass that produces v1.1.0, or (b) to mark this deliverable for redo against the architecture-exercise transcript with the validation findings incorporated. See the "Honest disclosure" section above for the re-derivation context that frames this choice.

See `D-RAG-MENTOR-ALT3-VALIDATED-2026-04-29` in `/operations/decision-log.md` for full reasoning, and `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` "Validation Addendum" for the architecture-handoff-level treatment of the same findings.

---

## Rule book overview

Ten rules total. Rules 1–9 are per-instance. Rule 10 is composite (aggregates 1–9 plus longitudinal profile data). All ten are PARTIAL cleanliness — deterministic core with small named interpretive sub-steps, mostly resolved by structured intake (AC-13 Tier 1), profile prior, or AC-17 named flags.

| Rule ID | Mechanism | Cleanliness | Primary interpretive seam |
|---|---|---|---|
| PROHAIRESIS-FILTER-001 | 1 | PARTIAL | "Did the practitioner have reasonable opportunity to reflect?" |
| PASSION-DETECT-ROOT-001 | 2 | PARTIAL | TEMPORAL_AMBIGUITY |
| PASSION-SUB-SPECIES-001 | 3 | PARTIAL | Compound-passion attribution |
| PASSION-CAUSAL-STAGE-001 | 4 | PARTIAL | Stage tie-breaking (resolved via profile prior) |
| PASSION-FALSE-JUDGEMENT-001 | 5 | PARTIAL | Case refinement (PROFILE vs DERIVED) |
| OIKEIOSIS-STAGE-001 | 6 | PARTIAL | (Rare) target ambiguity — Tier 1 SCOPE_AMBIGUITY |
| OIKEIOSIS-OBLIGATION-001 | 7 | PARTIAL | Cicero's Q5 resolution |
| VALUE-INDIFFERENT-001 | 8 | PARTIAL | VALUE_ERROR_WITHOUT_PASSION conditional re-run |
| VIRTUE-DOMAIN-ENGAGED-001 | 9 | PARTIAL | Phronesis ↔ andreia unity check (resolved via two-pass) |
| KATORTHOMA-PROXIMITY-001 | 10 | PARTIAL | AC-17 residual seams (SELF_REPORT_DEPENDENT; CONFIDENCE_WEIGHTED) |

Each rule is specified below with: Rule ID, Source, Inputs, Logic, Outputs, Examples, Interpretive moves, Cleanliness rating.

## The dependency map (summary)

Six dependencies across the rule chain. Full treatment in Deliverable 9 (engine sequencing logic).

| # | Type | Dependency | Resolution |
|---|---|---|---|
| 1 | Forward | Rule 5 → Rule 9 (correct_judgement enrichment) | Two-pass: Rule 5 placeholder, Rule 9 fills, Rule 5 enriches |
| 2 | Circular | Phronesis ↔ Andreia within Rule 9 (unity thesis) | Sequence phronesis first using Rule 8 output |
| 3 | Bidirectional | Rule 7 ↔ Rule 9 (Cicero Q1 needs virtue assessment; dikaiosyne needs obligation status) | Two-pass: provisional Q1 from action description, Rule 9 runs, Rule 7 confirms |
| 4 | Conditional back-edge | Rule 8 → Rules 2/3 (`VALUE_ERROR_WITHOUT_PASSION` triggers re-run) | Conditional loop, not mandatory |
| 5 | Forward | Rule 6 → Rule 2 (stated vs operative concern needs passion data) | Sequence Rule 2 before Rule 6 |
| 6 | Aggregation | Rule 10 → Rules 1–9 (composite is only as accurate as upstream) | Surface upstream confidence in Rule 10 output |

Engine sequencing: 1 → 2 → 3 → 4 → 5 (placeholder) → 6 → 7 (provisional) → 8 → 9 → 5 (enrich) → 7 (confirm) → 10. Conditional back-edge from 8 to 2/3 fires when `VALUE_ERROR_WITHOUT_PASSION` is set.

---

## Rule 1 — PROHAIRESIS-FILTER-001

**Mechanism:** 1 (`prohairesis_filter`). Implements scoring.json Stage 1 (Prohairesis Filter).

**Source:**
- `stoic-brain.json` `foundations.dichotomy_of_control` (the canonical `up_to_us` / `not_up_to_us` lists)
- `psychology.json` `ruling_faculty` (the hegemonikon)
- `stoic-brain-compiled.ts` `STOIC_BRAIN_FOUNDATIONS.dichotomy_of_control`

**Inputs:**
- `narrative` — practitioner narrative (free text, after Layer 1 translation)
- `entities[]` — extracted entities from Layer 1 (each with type tag — person, event, judgement, action, possession, etc.)
- `practitioner_profile` (optional — used only to detect recurring CONTROL_INFLATION patterns)

**Logic:**
1. For each entity in `entities[]`:
   1.1. Classify against canonical `up_to_us[]` list: `judgements (hypolepseis)`, `impulses (hormai)`, `desires (orexeis)`, `aversions (ekkliseis)`, `assent (synkatathesis)`, `moral choice (prohairesis)`, `character (ethos)`. Match by type tag and entity description.
   1.2. Classify against canonical `not_up_to_us[]` list: `body (soma)`, `reputation (doxa)`, `possessions (ktemata)`, `external events`, `other people's actions`, `death (thanatos)`. Match by type tag and entity description.
   1.3. If neither classification fires, flag entity as `unclassified` (rare; usually indicates a Layer 1 translation issue that should fire a Tier 1 ELEMENT_FUSION clarification).
2. Build `prohairesis_scope[]` (entities classified as up_to_us) and `external_scope[]` (entities classified as not_up_to_us).
3. Identify misclassifications:
   3.1. `CONTROL_INFLATION` — practitioner narrative treats an external entity as if it were within prohairesis (e.g., "I need to make sure they think well of me" — treating others' opinions as eph' hemin).
   3.2. `CONTROL_ABDICATION` — practitioner narrative treats an internal entity as if it were not within prohairesis (e.g., "I couldn't help feeling angry" — treating one's own assent as ouk eph' hemin).
4. Score `misclassification_severity` based on count and recurrence (using profile prior if available): `none` / `mild` / `moderate` / `severe`.
5. Set `filter_passed = true` if `misclassification_severity ∈ {none, mild}`; `false` otherwise.

**Outputs:**

```
{
  "prohairesis_scope": [<entity>, ...],
  "external_scope": [<entity>, ...],
  "misclassification_flags": ["CONTROL_INFLATION" | "CONTROL_ABDICATION", ...],
  "misclassification_severity": "none" | "mild" | "moderate" | "severe",
  "filter_passed": true | false
}
```

**Examples:**

- *Positive (filter_passed = true):* "I noticed I was getting frustrated when the meeting ran long. I checked the impression that the delay was making me late for what I had planned, and asked myself whether the planned thing is in my control." → `prohairesis_scope`: ["my frustration", "my impression-checking", "my planning"]; `external_scope`: ["the meeting length"]; `misclassification_flags`: []; `filter_passed`: true.
- *Negative (filter_passed = false, CONTROL_INFLATION):* "I want this conversation to land well. I want them to think I handled it competently." → `external_scope`: ["how the conversation lands", "what they think"]; `misclassification_flags`: ["CONTROL_INFLATION"]; `misclassification_severity`: "moderate" (or "severe" if profile prior indicates recurrent philodoxia pattern); `filter_passed`: false.
- *Edge (CONTROL_ABDICATION):* "The anger just came out of nowhere — I couldn't stop it." → narrative places `orge` (assent + impulse) in external_scope rather than prohairesis_scope; `misclassification_flags`: ["CONTROL_ABDICATION"]; `misclassification_severity`: "moderate". This case is the bridge between the diagnostic posture (the anger is operating from a false judgement) and the corrective posture (assent and impulse are within prohairesis even when they feel reflexive).

**Interpretive moves:**
- "Did the practitioner have reasonable opportunity to reflect?" — affects whether `CONTROL_ABDICATION` is mild (no reflection opportunity) or severe (ample reflection opportunity, abdication operative). Tier 1 ELEMENT_FUSION clarification at intake (AC-13) resolves most ambiguity.
- Profile prior fires only to *raise* severity (recurrent CONTROL_INFLATION pattern at moderate intensity becomes severe). Never to lower severity.

**Cleanliness:** PARTIAL. Deterministic core (the up_to_us / not_up_to_us classification is canonical lookup); interpretive seam at severity assessment, structurally bounded by the four-level scale and the AC-13 mitigation.

---

## Rule 2 — PASSION-DETECT-ROOT-001

**Mechanism:** 2 (`passion_root_detection`). Implements step 1 of the 5-step diagnostic sequence.

**Source:**
- `passions.json` `four_root_passions` (the 2×2 temporal × evaluative matrix)
- `stoic-brain-compiled.ts` `PASSIONS_CONTEXT.four_root_passions`
- Deliverable 3 (passion taxonomy)

**Inputs:**
- `narrative` — practitioner narrative (free text, after Layer 1 translation)
- `prohairesis_scope[]`, `external_scope[]` from Rule 1 — used to identify which scopes are at stake
- `practitioner_profile` (optional)

**Logic:**
1. For each scope-stake (an entity in `external_scope` that the practitioner is reasoning about as if it mattered):
   1.1. Determine **temporal axis** — is the practitioner's concern about something present (already happening / already happened) or something future (not yet arrived / anticipated)? If both axes are present in the same narrative, set `temporal_split = true` and process each axis separately.
   1.2. Determine **evaluative axis** — does the practitioner's narrative perceive the entity as an apparent good (worth pursuing / worth holding) or an apparent evil (worth fleeing / worth lamenting)?
   1.3. Place on the 2×2 matrix:
       - present + apparent good → `hedone`
       - present + apparent evil → `lupe`
       - future + apparent good → `epithumia`
       - future + apparent evil → `phobos`
2. Build `passions_detected[]` (one entry per detected root passion).
3. Identify `dominant_passion` — the root passion whose triggering entity is most central to the practitioner's narrative. Use entity prominence (frequency × narrative weight) to break ties.
4. For each detected passion, record `false_impression[]` — the impression-stage entry that, if assented to, would generate this passion.
5. Identify `eupatheia_candidate` — if the narrative shows a present-good with chara-shape (rational delight in a genuine good) or a future-good with boulesis-shape (rational selection of preferred indifferent without elevation to good) or a future-evil with eulabeia-shape (rational caution without fear), flag the candidate for AC-17 `CONFIDENCE_WEIGHTED` review.

**Outputs:**

```
{
  "passions_detected": [{"root": "epithumia"|"hedone"|"phobos"|"lupe", "trigger_entity": "<id>", "axis_temporal": "present"|"future", "axis_evaluative": "apparent_good"|"apparent_evil"}, ...],
  "dominant_passion": "<root_passion_id>" | null,
  "false_impression": [<impression>, ...],
  "eupatheia_candidate": "chara"|"boulesis"|"eulabeia"|null,
  "temporal_split": true | false
}
```

**Examples:**

- *Positive (philodoxia pattern):* "I want them to think well of me at the meeting tomorrow." → temporal: future; evaluative: apparent_good (the imagined good opinion); root: `epithumia`; trigger_entity: "their good opinion".
- *Positive (agonia in catastrophising):* "What if the launch goes wrong and we lose what we've built?" → temporal: future; evaluative: apparent_evil (the imagined catastrophic outcome); root: `phobos`; trigger_entity: "the catastrophic outcome".
- *Compound (temporal_split):* "I'm angry at how the meeting went and dreading the next one." → two passions: `lupe` (present apparent_evil — the past meeting) and `phobos` (future apparent_evil — the next meeting); `temporal_split: true`.
- *Edge (eupatheia_candidate):* "I'm grateful for the meeting going well, and prepared for whatever the next one brings." → root passion candidate `hedone` flagged but eupatheia_candidate: `chara` flagged for review; AC-17 CONFIDENCE_WEIGHTED prevents premature classification; longitudinal evidence determines whether this is genuine chara or a polished surface over hedone.

**Interpretive moves:**
- TEMPORAL_AMBIGUITY (AC-13 Tier 1) fires when the narrative does not clearly identify temporal axis. Question text: *"When you think about this situation right now, are you more concerned about something that's already happened, or something you're worried might happen?"*
- The eupatheia_candidate flag is *not* a classification — it is a flag for AC-17 review. Mechanism 2 never classifies an instance as eupatheia in a single pass; classification requires longitudinal evidence (CONFIDENCE_WEIGHTED).

**Cleanliness:** PARTIAL. Deterministic core (the 2×2 matrix has no interpretive ambiguity); interpretive seam at temporal disambiguation, resolved by AC-13 Tier 1.

---

## Rule 3 — PASSION-SUB-SPECIES-001

**Mechanism:** 3 (`passion_sub_species`). Implements step 4 of the 5-step diagnostic sequence.

**Source:**
- `passions.json` `four_root_passions[].sub_species[]`
- `stoic-brain-compiled.ts` `PASSIONS_CONTEXT.four_root_passions` (sub_species per root)
- Deliverable 3 (passion taxonomy — 20 canonical sub-species)

**Inputs:**
- `passions_detected[]` from Rule 2
- `narrative` — practitioner narrative
- `practitioner_profile` (optional — used only for compound-pattern recognition)

**Logic:**
1. For each detected root passion in `passions_detected[]`:
   1.1. Look up the canonical sub-species list for that root (epithumia: 6 sub-species; hedone: 3; phobos: 6; lupe: 5).
   1.2. Match the practitioner's narrative pattern against each sub-species' canonical signature (each sub-species has a recognisable narrative shape — see Deliverable 3 for examples).
   1.3. Record the matched sub-species in `sub_species_map[]`.
2. Detect compound passions — cases where two or more sub-species are operative simultaneously (often across different roots, e.g., `agonia + philodoxia`).
   2.1. Use canonical compound-pattern catalogue from Deliverable 3.
   2.2. Flag novel compounds (a combination not in the canonical catalogue) via `unclassified_passions[]` for AC-17 review.
3. Identify `dominant_sub_species` — the sub-species whose narrative weight is highest. Profile prior fires only to break ties (e.g., if the practitioner has confirmed strong-intensity philodoxia, a tie between philodoxia and aischyne resolves to philodoxia).

**Outputs:**

```
{
  "sub_species_map": [{"root": "<root_id>", "sub_species": "<sub_species_id>", "trigger_entity": "<id>"}, ...],
  "compound_passion_flags": [{"sub_species_a": "<id>", "sub_species_b": "<id>", "pattern": "<canonical_compound_pattern>"}, ...],
  "unclassified_passions": [<root_id>, ...],
  "dominant_sub_species": "<sub_species_id>" | null
}
```

**Examples:**

- *Positive (philodoxia):* root `epithumia`, narrative "I want them to think well of me" → `sub_species: philodoxia`.
- *Positive (orge with children):* root `epithumia`, narrative "I just wanted them to do what I told them" → `sub_species: orge`.
- *Compound (agonia + philodoxia):* roots `phobos` + `epithumia`, narrative "I'm dreading the launch — what if I look incompetent?" → `compound_passion_flags`: [{sub_species_a: agonia, sub_species_b: philodoxia, pattern: "agonised dread of dishonour"}].
- *Edge (unclassified):* root `lupe`, narrative carrying a distress shape that does not match `eleos`, `phthonos`, `zelotypia`, `penthos`, or `achos` cleanly → `unclassified_passions: ["lupe"]`. Triggers AC-17 review.

**Interpretive moves:**
- Compound-passion attribution is the primary PARTIAL seam. The canonical catalogue covers common compounds; novel compounds are flagged rather than forced into existing sub-species. R6d (diagnostic, not punitive) means a novel compound surfaces honestly rather than being misclassified.
- Profile prior is *strictly tie-breaking* — it never overrides a clear narrative signal.

**Cleanliness:** PARTIAL at the rule level; HIGH at the canonical lookup; PARTIAL at compound attribution.

---

## Rule 4 — PASSION-CAUSAL-STAGE-001

**Mechanism:** 4 (`passion_causal_stage`). Implements step 2 of the 5-step diagnostic sequence (causal-stage portion).

**Source:**
- `psychology.json` `causal_sequence` (`phantasia → synkatathesis → horme → praxis`)
- `stoic-brain-compiled.ts` `PSYCHOLOGY_CONTEXT.causal_sequence` (with failure_mode per stage)

**Inputs:**
- `sub_species_map[]` from Rule 3
- `narrative` — practitioner narrative
- `practitioner_profile` (used to apply profile prior on compound-stage cases)

**Logic:**
1. For each detected sub-species:
   1.1. Identify the *earliest* stage in `phantasia → synkatathesis → horme → praxis` at which assent went wrong:
       - `phantasia` (impression): the practitioner's impression of the situation was distorted before any examination took place.
       - `synkatathesis` (assent): the practitioner formed a clear impression but assented to it as true without examination.
       - `horme` (impulse): the practitioner examined the impression and judged correctly, but the impulse exceeded due measure anyway (akrasia-shape).
       - `praxis` (action): the practitioner's reasoning was correct throughout but the action diverged from the reasoning.
   1.2. Record stage in `causal_stage_map[]`.
2. Detect `compound_stage_failures[]` — cases where the same passion shows multiple stage failures (e.g., orge with children may show both `synkatathesis` and `horme` failure: the practitioner assented to "the child's compliance is a genuine good" *and* the impulse exceeded due measure).
3. Apply profile prior — if the practitioner's profile carries a recurrent stage-failure pattern (e.g., orge consistently breaks at horme), use the prior to resolve ambiguity in the current narrative. Set `profile_prior_applied: true`.
4. Identify `intervention_priority[]` — the earliest stage failure carries the highest intervention priority (intervening at impression is more effective than intervening at praxis).
5. Identify `primary_causal_breakdown` — the dominant sub-species' earliest stage failure.

**Outputs:**

```
{
  "causal_stage_map": [{"sub_species": "<id>", "stage": "phantasia"|"synkatathesis"|"horme"|"praxis"}, ...],
  "compound_stage_failures": [{"sub_species": "<id>", "stages": [<stage>, <stage>]}, ...],
  "intervention_priority": [<sub_species_id>, ...],
  "profile_prior_applied": true | false,
  "primary_causal_breakdown": {"sub_species": "<id>", "stage": "<stage>"} | null
}
```

**Examples:**

- *Positive (philodoxia at synkatathesis):* "I really want this to land well" → assent stage: practitioner has assented to "their good opinion is a genuine good"; primary breakdown: `{philodoxia, synkatathesis}`.
- *Positive (orge with children at horme):* "I knew I shouldn't snap, but I did anyway" → impulse stage: practitioner's reasoning was correct, impulse exceeded due measure; primary breakdown: `{orge, horme}`.
- *Positive (agonia at phantasia):* "I keep running through worst-case scenarios" → impression stage: practitioner is rehearsing distorted impressions; primary breakdown: `{agonia, phantasia}`.
- *Compound:* "I assented to needing their approval, and the impulse to perform exceeded due measure" → `compound_stage_failures: [{philodoxia, [synkatathesis, horme]}]`.

**Interpretive moves:**
- Stage tie-breaking — when the narrative shows multiple stages potentially affected, profile prior breaks ties. If profile is empty or profile prior is unclear, leave both stages flagged in `compound_stage_failures` rather than forcing a single stage.

**Cleanliness:** PARTIAL. The four canonical stages are HIGH; the assignment of a specific instance to a stage is PARTIAL, mitigated by profile prior and by leaving compound failures honest.

---

## Rule 5 — PASSION-FALSE-JUDGEMENT-001

**Mechanism:** 5 (`passion_false_judgement`). Implements step 5 of the 5-step diagnostic sequence.

**Source:**
- `passions.json` (per-passion false-judgement structure)
- `stoic-brain-compiled.ts` `PASSIONS_CONTEXT.three_good_feelings` (for `correct_judgement` enrichment)
- Deliverable 3 (false-judgement template)
- `practitioner_profile` (for PROFILE-derived refinement)

**Inputs:**
- `sub_species_map[]` from Rule 3
- `narrative` — practitioner narrative
- `practitioner_profile`
- `value_indifferent` data from Rule 8 (for second-pass enrichment with `correct_judgement`)
- `virtue_engagement[]` from Rule 9 (for second-pass enrichment — see Dependency 1 in the dependency map)

**Logic (two-pass):**

**Pass 1 (placeholder):**
1. For each detected sub-species in `sub_species_map[]`:
   1.1. Look up the canonical false-judgement template (Deliverable 3).
   1.2. Fill the template's `object_inflated_or_deflated` slot from the practitioner's narrative.
   1.3. Set `judgement_type` from the canonical mapping (most epithumia / hedone are INFLATION; most phobos / lupe are DEFLATION; INVERSE_DEFLATION applies to specific compound patterns).
   1.4. Leave `correct_judgement` slot empty (placeholder).
   1.5. Determine `refinement_source`:
       - PROFILE if the practitioner's profile already records this false judgement at recurrent intensity (high confidence).
       - DERIVED if the false judgement is inferred from the current narrative only (lower confidence).
2. Build `false_judgements[]`.
3. Identify `dominant_false_judgement` — the false judgement attached to the dominant sub-species.

**Pass 2 (enrichment, after Rule 9 has run):**
1. For each entry in `false_judgements[]`, fill the `correct_judgement` slot using:
   - `value_indifferent` data from Rule 8 (the canonical correct treatment of the indifferent at stake)
   - `virtue_engagement[]` from Rule 9 (the virtue domain that would replace the false judgement)
2. Identify `firing_conditions[]` — the narrative conditions under which this false judgement fires (used by the practitioner profile for longitudinal pattern detection).

**Outputs:**

```
{
  "false_judgements": [
    {
      "sub_species": "<id>",
      "object_inflated_or_deflated": "<text>",
      "judgement_type": "INFLATION"|"DEFLATION"|"INVERSE_DEFLATION",
      "correct_judgement": "<text>",
      "refinement_source": "PROFILE"|"DERIVED"
    },
    ...
  ],
  "dominant_false_judgement": <false_judgement_entry> | null,
  "firing_conditions": [<condition_text>, ...]
}
```

**Examples:**

- *Positive (philodoxia, refinement_source: PROFILE):* sub_species `philodoxia`, object: "their good opinion of me", judgement_type: INFLATION, correct_judgement: "Reputation is a preferred indifferent — selecting it via virtuous action is appropriate; desiring it as a genuine good is the philodoxia pattern", refinement_source: PROFILE (founder's profile carries strong philodoxia).
- *Positive (agonia, refinement_source: DERIVED):* sub_species `agonia`, object: "the launch failing publicly", judgement_type: DEFLATION, correct_judgement: "The launch outcome is a future external — at most a dispreferred indifferent. Eulabeia (rational caution) replaces phobos here", refinement_source: DERIVED (the specific launch concern is fresh, not a recurrent profile pattern).

**Interpretive moves:**
- Case refinement (Pass 1 step 1.2 — filling the `object_inflated_or_deflated` slot) is the PARTIAL seam. The narrative usually identifies the object plainly; when it does not, Tier 1 ELEMENT_FUSION clarification fires.
- The PROFILE / DERIVED distinction is honest about confidence — DERIVED entries carry lower weight in mechanism 10's aggregation.

**Cleanliness:** PARTIAL. The template structure is canonical (HIGH); case refinement and the two-pass enrichment are PARTIAL, mitigated by profile prior and by the explicit `refinement_source` flag.

---

## Rule 6 — OIKEIOSIS-STAGE-001

**Mechanism:** 6 (`oikeiosis_stage`). Implements step 1 of the canonical oikeiosis evaluation (which circle is at stake?).

**Source:**
- `action.json` `oikeiosis_sequence` (5 stages: self → family → community → humanity → cosmos)
- `stoic-brain-compiled.ts` `ACTION_CONTEXT.oikeiosis_sequence`

**Inputs:**
- `narrative` — practitioner narrative
- `passions_detected[]` from Rule 2 (needed to identify operative concern — see Dependency 5)
- `sub_species_map[]` from Rule 3 (for the operative concern's specific shape)

**Logic:**
1. Identify the action's *target* — who or what is on the receiving end of the practitioner's reasoning, decision, or action?
2. Map target to canonical circle (Stage 1 self / Stage 2 family / Stage 3 community / Stage 4 humanity / Stage 5 cosmos).
3. Identify `widest_circle_reached` — when the practitioner's narrative explicitly engages a wider circle (e.g., "this affects the team and the broader community"), record the widest engagement.
4. Identify `circles_engaged[]` — every circle the narrative engages (often multiple).
5. Detect `oikeiosis_contraction` — the action engages a wider circle in stated terms but operates from a narrower circle's interest. (Example: "I'm doing this for the community" but the narrative reveals the operative concern is the practitioner's own reputation — Circle 1 contracted, with Circle 3 stated.)
6. Detect `circle_mismatch` — when the action belongs to one circle but the obligation invoked belongs to another (e.g., a household decision invoked under community obligations).

**Outputs:**

```
{
  "primary_circle": 1|2|3|4|5,
  "widest_circle_reached": 1|2|3|4|5,
  "circles_engaged": [1, 2, ...],
  "oikeiosis_contraction": true | false,
  "circle_mismatch": true | false
}
```

**Examples:**

- *Positive (orge with children):* primary_circle: 2 (family); widest_circle_reached: 2; oikeiosis_contraction: false.
- *Positive (philodoxia patterns):* primary_circle: often 1 (the practitioner's reputation, framed as such); widest_circle_reached: 3 if the audience is community; `oikeiosis_contraction: true` because the stated concern is community service while the operative concern is Circle 1 reputation.
- *Edge (six consecutive procedural reports):* primary_circle: 1 (self-evaluation); widest_circle_reached: 1; circles_engaged: [1]. The pattern of Circle-1-only engagement across multiple instances is mechanism 10's `proximity_risk_flag: THEORETICAL_ONLY` input.

**Interpretive moves:**
- (Rare) target ambiguity — Tier 1 SCOPE_AMBIGUITY clarification fires when the narrative does not clearly identify the action's target. Question text: *"Who else was affected by this, if anyone? And what role do they play in your life — colleague, family member, someone you don't know well?"*

**Cleanliness:** PARTIAL at the rule level (interpretive seam at oikeiosis_contraction detection); HIGH at the basic stage mapping.

---

## Rule 7 — OIKEIOSIS-OBLIGATION-001

**Mechanism:** 7 (`oikeiosis_obligation`). Implements Cicero's 5 questions per circle.

**Source:**
- `action.json` `deliberation_framework` (Cicero's 5 questions)
- `stoic-brain-compiled.ts` `ACTION_CONTEXT.deliberation_framework`

**Inputs:**
- `oikeiosis_stage` data from Rule 6
- `narrative` — practitioner narrative
- `virtue_engagement[]` from Rule 9 (provisional — see Dependency 3)

**Logic (two-pass):**

**Pass 1 (provisional, before Rule 9):**
1. For each circle in `circles_engaged[]`:
   1.1. Apply Cicero's Q1: "Is the action honourable (`honestum` / `to kalon`)?" — provisional answer based on action description alone.
   1.2. Apply Q2 (if Q1 yields multiple honourable options): "Which is more honourable?"
   1.3. Apply Q3: "Is the action advantageous (`utile`)?"
   1.4. Apply Q4 (if Q3 yields multiple advantageous options): "Which is more advantageous?"
   1.5. Apply Q5: "When honourable conflicts with advantageous, which prevails?" — canonical answer is honourable always prevails. Set `cicero_q5_applied: true` if the narrative shows the conflict.
2. Build `obligation_status[]` — per circle, whether the obligation is met / partially met / unmet.
3. Detect `circle_conflict` — when obligations to different circles conflict (e.g., obligation to family conflicts with obligation to community).

**Pass 2 (confirmation, after Rule 9):**
1. Re-run Q1 with full virtue assessment. If Q1 result changes, log via `cicero_q1_passed: <true_post_virtue|false_post_virtue>`.
2. Resolve `circle_conflict_resolution` — when the higher circle's obligation prevails. Canonical priority rule: "When obligations at different stages conflict, the higher stage generally takes priority. But self-care that enables future virtue is justified."

**Outputs:**

```
{
  "obligation_status": [{"circle": 1|2|3|4|5, "status": "met"|"partially_met"|"unmet"}, ...],
  "cicero_q1_passed": true | false,
  "cicero_q5_applied": true | false,
  "circle_conflict": true | false,
  "circle_conflict_resolution": "<text>" | null
}
```

**Examples:**

- *Positive (orge with children):* circle 2; obligation_status: [{circle: 2, status: partially_met}] (the obligation to the child includes patient correction, not retribution); cicero_q1_passed: false (the action was not honourable); cicero_q5_applied: false (no honourable/advantageous conflict).
- *Edge (philodoxia patterns):* circle_conflict: true if the practitioner's narrative reveals the philodoxia operates against the higher circle's obligation (e.g., the obligation to community is honoured in stated terms but undermined by the practitioner's reputation-seeking). Resolution: "The higher circle's obligation prevails; the philodoxia must be examined."

**Interpretive moves:**
- Q5 resolution is the primary PARTIAL seam. The canonical priority rule (higher circle prevails) gives the deterministic answer in most cases; the exception ("self-care that enables future virtue is justified") is itself a deterministic carve-out that fires when the narrative shows a sustainability concern.

**Cleanliness:** PARTIAL. The 5 questions are canonical; the Q5 resolution is PARTIAL but bounded by the canonical priority rule and its named exception.

---

## Rule 8 — VALUE-INDIFFERENT-001

**Mechanism:** 8 (`value_indifferent`). Implements the value assessment portion of scoring.json Stage 2.

**Source:**
- `value.json` (preferred / dispreferred indifferents + axia + selection_principles)
- `stoic-brain-compiled.ts` `VALUE_CONTEXT`

**Inputs:**
- `narrative` — practitioner narrative
- `passions_detected[]` from Rule 2 (used to identify which indifferents are at stake)
- `sub_species_map[]` from Rule 3
- `false_judgements[]` from Rule 5 Pass 1 (placeholder — used to cross-check value treatment)

**Logic:**
1. Identify `indifferents_at_stake[]` — every preferred / dispreferred indifferent the narrative engages.
2. For each indifferent, identify treatment in `treatment_map[]`:
   - `correctly_indifferent` — the practitioner treats the indifferent as a preferred / dispreferred indifferent without elevating to genuine good / evil.
   - `INFLATION` — preferred indifferent treated as genuine good.
   - `DEFLATION` — dispreferred indifferent treated as genuine evil.
   - `INVERSE_DEFLATION` — preferred indifferent treated as genuine evil (rare; most often in compound passions where the practitioner has come to fear a preferred indifferent — e.g., fear of success).
3. Build `value_errors[]` — every entry where treatment is not `correctly_indifferent`.
4. Identify `dominant_value_error` — the value error attached to the entity whose narrative weight is highest.
5. Detect `value_error_without_passion_flag` — when a value error is detected but no corresponding passion was detected in Rule 2. This case triggers the Dependency-4 conditional back-edge (re-run Rules 2, 3 with the value error as additional input). Fires when the practitioner's narrative shows a value error structurally (the narrative inflates a preferred indifferent) without the emotional signature of a passion (no agitation, no desire, no fear). Most often indicates a held-as-true intellectual error rather than a felt passion.

**Outputs:**

```
{
  "indifferents_at_stake": [<indifferent_id>, ...],
  "treatment_map": [{"indifferent": "<id>", "axia": "high"|"moderate"|"low"|"high-negative"|"moderate-negative"|"low-negative", "treatment": "correctly_indifferent"|"INFLATION"|"DEFLATION"|"INVERSE_DEFLATION"}, ...],
  "value_errors": [<treatment_map_entry_with_error>, ...],
  "dominant_value_error": <treatment_map_entry> | null,
  "value_error_without_passion_flag": true | false
}
```

**Examples:**

- *Positive (philodoxia patterns):* indifferents_at_stake: [reputation]; treatment_map: [{indifferent: reputation, axia: moderate, treatment: INFLATION}]; value_errors: [{...}]; dominant_value_error: INFLATION on reputation.
- *Positive (agonia in catastrophising):* indifferents_at_stake: [reputation, wealth, security]; treatment_map shows DEFLATION on each; dominant_value_error: DEFLATION on reputation (or whichever has highest narrative weight).
- *Edge (value_error_without_passion_flag):* the practitioner reasons "wealth is the most important thing for my family's stability" without emotional agitation. Rules 2, 3 detect no passion. Rule 8 detects INFLATION on wealth. Flag fires; engine re-runs Rules 2, 3 with the value error as additional input.

**Interpretive moves:**
- The conditional back-edge (Dependency 4) is the primary structural complexity. It is *not* an interpretive seam — it is a deterministic re-run when the conditional fires. The seam is at the boundary: deciding when the value error is significant enough to fire the back-edge. Canonical threshold: any non-trivial value error (any treatment ∈ {INFLATION, DEFLATION, INVERSE_DEFLATION}) on an entity with high narrative weight.

**Cleanliness:** HIGH at the lookup level (indifferents and axia are canonical); PARTIAL at the conditional back-edge threshold.

---

## Rule 9 — VIRTUE-DOMAIN-ENGAGED-001

**Mechanism:** 9 (`virtue_domain_engaged`). Implements scoring.json Stage 4 (Unified Virtue Assessment).

**Source:**
- `virtue.json` (`unity_thesis`, `four_expressions` with sub-expressions)
- `stoic-brain-compiled.ts` `VIRTUE_CONTEXT`

**Inputs:**
- `narrative` — practitioner narrative
- Outputs from Rules 1, 2, 5, 6, 7, 8

**Logic (sequenced per Dependency 2):**
1. Sequence virtues: `phronesis` first, using Rule 8's output (phronesis is the "what is genuinely good, bad, and indifferent" virtue — directly informed by value_indifferent classification).
2. Then `dikaiosyne`, using Rule 7's provisional output (justice is "what is owed to others — distributing to each their due" — directly informed by oikeiosis_obligation).
3. Then `andreia`, using Rule 1's output (courage is "what is genuinely fearful and what is not" — directly informed by prohairesis_filter and the dichotomy of control).
4. Then `sophrosyne`, using Rule 4's output (temperance is "what to choose and what to avoid — ordering impulse and desire" — directly informed by passion_causal_stage at the impulse stage).
5. For each virtue, classify engagement: `strong` / `adequate` / `weak` / `absent` / `failed`.
6. Apply unity check — the unity thesis (R6b) holds that all four virtues are co-dependent. A `strong` rating on one virtue cannot coexist with a `weak` rating on another from the same instance. When the per-virtue ratings conflict, the unity check resolves to the lowest rating (weakest-link). Set `unity_inconsistency: true` if the per-virtue ratings would otherwise conflict.
7. Build `unity_resolution[]` — per virtue, the post-unity-check rating.
8. Identify `weakest_virtue_flag` — the virtue with the lowest post-unity-check rating.
9. Identify `dominant_virtue_failure` — the virtue whose deficiency drives the action's character most.

**Outputs:**

```
{
  "virtue_engagement": [{"virtue": "phronesis"|"dikaiosyne"|"andreia"|"sophrosyne", "rating": "strong"|"adequate"|"weak"|"absent"|"failed", "evidence": "<text>"}, ...],
  "unity_inconsistency": true | false,
  "unity_resolution": [{"virtue": "<id>", "rating_post_unity": "<rating>"}, ...],
  "weakest_virtue_flag": "<virtue_id>",
  "dominant_virtue_failure": "<virtue_id>" | null
}
```

**Examples:**

- *Positive (orge with children):* virtue_engagement: [{phronesis: weak (the practitioner saw the situation but misjudged compliance as good)}, {dikaiosyne: weak (obligation to child not met)}, {andreia: adequate (acting under difficulty)}, {sophrosyne: failed (impulse exceeded due measure — this is the operative deficiency)}]; unity_resolution: all flow to weak / failed under unity-thesis; weakest_virtue_flag: sophrosyne; dominant_virtue_failure: sophrosyne.
- *Positive (philodoxia patterns):* virtue_engagement: [{phronesis: weak (reputation inflated to genuine good)}, {dikaiosyne: weak (Circle-3 obligation undermined by Circle-1 operative concern)}, {andreia: weak (the practitioner is acting from fear of disesteem)}, {sophrosyne: weak (impulse to perform in excess of measure)}]; unity_resolution: weak across all; weakest_virtue_flag: phronesis (the operative cognitive failure).

**Interpretive moves:**
- The unity check is the primary PARTIAL seam, and is structurally bounded: the unity thesis *is* deterministic (weakest-link), the seam is in identifying which virtue is operative when multiple are deficient. Resolved by the two-pass sequencing (phronesis first using Rule 8 output) and by the canonical virtue-domain mappings.

**Cleanliness:** PARTIAL. The unity thesis and the four virtue domains are canonical; the assignment of a specific instance to a virtue rating is PARTIAL, mitigated by the deterministic two-pass sequencing.

---

## Rule 10 — KATORTHOMA-PROXIMITY-001

**Mechanism:** 10 (`katorthoma_proximity`). Composite. Implements scoring.json Stage 4's proximity classification with the Senecan grade overlay.

**Source:**
- `scoring.json` `katorthoma_proximity_scale` (5 levels: reflexive / habitual / deliberate / principled / sage_like)
- `progress.json` (Senecan grades — pre_progress / grade_1 / grade_2 / grade_3 / sage)
- `stoic-brain-compiled.ts` `SCORING_CONTEXT.katorthoma_proximity_scale`, `PROGRESS_CONTEXT`

**Inputs:**
- Outputs from Rules 1–9
- `practitioner_profile` (longitudinal — for Senecan grade overlay and directional modifier)

**Logic:**
1. Score four canonical dimensions based on upstream rule outputs:
   - Dimension 1 (control): from Rule 1 (`misclassification_severity`).
   - Dimension 2 (passion): from Rules 2, 3, 4, 5 (presence and intensity of passions, stage of breakdown, refinement_source confidence).
   - Dimension 3 (obligation): from Rules 6, 7 (oikeiosis_contraction, circle_conflict, obligation_status).
   - Dimension 4 (virtue): from Rule 9 (`weakest_virtue_flag`, `dominant_virtue_failure`).
2. Aggregate via weakest-link to produce `composite_score`. The composite is bounded by the weakest dimension; this preserves the unity thesis at the proximity level.
3. Map composite to canonical proximity_level: `reflexive` / `habitual` / `deliberate` / `principled` / `sage_like`.
4. Apply directional modifier from practitioner profile:
   - If the profile shows the practitioner has been moving toward better quality in this domain, `direction: improving`.
   - If stable, `direction: stable`.
   - If declining, `direction: declining`.
   - Flag `SELF_REPORT_DEPENDENT` (AC-17 residual seam) — the directional modifier depends on the practitioner's self-report of how this instance compares to prior instances.
5. Apply Senecan grade overlay:
   - `pre_progress` — multiple weak dimensions, recurrent passions dominant.
   - `grade_3` (Beginning the Path) — some passions overcome, others dominant; awareness inconsistent.
   - `grade_2` (Overcoming the Worst) — major passions checked, minor ones still operative.
   - `grade_1` (Approaching Wisdom) — most passions overcome, understanding nearly complete.
   - `sage` — apatheia, unified virtue, katalepsis. The Stoics held the sage is "as rare as the phoenix"; the rule never produces this output for current practice.
   - Flag `CONFIDENCE_WEIGHTED` (AC-17 residual seam) — Senecan grade requires longitudinal evidence.
6. Identify `weakest_dimension`.
7. Set `proximity_risk_flag` from canonical risk catalogue:
   - `PASSION_DOMINANCE` — proximity is at deliberate or higher in stated terms but mechanism 2 detects strong-intensity passions.
   - `CONVENTION_SUBSTITUTION` — proximity reads habitual but the practitioner believes it is principled (acting from convention rather than understanding).
   - `TECHNIQUE_SUBSTITUTION` — proximity reads deliberate but the deliberation is mechanical (running through Stoic vocabulary without engaging the underlying judgement).
   - `STABILITY_TEST` — proximity has improved but the improvement is untested under stress.
   - `THEORETICAL_ONLY` — proximity reads deliberate or higher in writing/reflection but no evidence the practitioner has acted on it. (Six-consecutive-procedural-reports pattern.)
8. Detect `profile_tension_flag` — when the current instance's proximity level diverges sharply from the profile's recurrent pattern in this domain. Surfaces a possible regression or a possible breakthrough; flagged for review.

**Outputs:**

```
{
  "dimension_scores": {"control": <score>, "passion": <score>, "obligation": <score>, "virtue": <score>},
  "composite_score": <score>,
  "proximity_level": "reflexive"|"habitual"|"deliberate"|"principled"|"sage_like",
  "weakest_dimension": "control"|"passion"|"obligation"|"virtue",
  "direction": "improving"|"stable"|"declining",
  "senecan_grade": "pre_progress"|"grade_1"|"grade_2"|"grade_3"|"sage",
  "proximity_risk_flag": "PASSION_DOMINANCE"|"CONVENTION_SUBSTITUTION"|"TECHNIQUE_SUBSTITUTION"|"STABILITY_TEST"|"THEORETICAL_ONLY"|null,
  "profile_tension_flag": true | false,
  "self_report_dependent": true | false,
  "confidence_weighted": "low"|"medium"|"high"
}
```

**Examples:**

- *Positive (philodoxia patterns at deliberate):* proximity_level: deliberate; weakest_dimension: passion; senecan_grade: grade_3; proximity_risk_flag: PASSION_DOMINANCE (the practitioner is deliberating in form but philodoxia is operative).
- *Positive (six consecutive procedural reports):* across instances, proximity_level reads deliberate; proximity_risk_flag: THEORETICAL_ONLY (no evidence the practitioner has acted differently in the underlying domain).
- *Edge (orge with children at improving):* proximity_level: habitual; direction: improving (profile shows reduced frequency over recent weeks); senecan_grade: grade_3; profile_tension_flag: false.

**Interpretive moves:**
- Two AC-17 residual seams. `SELF_REPORT_DEPENDENT` flag on directional modifier. `CONFIDENCE_WEIGHTED` flag on eupatheia boundary (which affects the upper end of the scale — `principled` and `sage_like`).
- The Senecan grade overlay is structurally bounded (five levels, canonical indicators per level) but the longitudinal evidence requirement keeps the assignment honest.

**Cleanliness:** PARTIAL. Aggregation is HIGH (weakest-link is deterministic); the AC-17 seams keep the rule honest about what longitudinal data it depends on rather than papering over the dependence.

---

## Rule book version

**Version:** 1.0.0 (Phase 1 alt-3 draft).
**Status:** Drafted (under founder review).
**Re-derivation lineage:** Re-derived from alt-3 handoff schemas + Stoic Brain corpus + named worked-example anchors. Not transcript-package.

## Approval gate

This deliverable plus Deliverables 2 (canonical mechanism framework) and 3 (passion taxonomy) form the critical path. All three must be approved before downstream Phase-1 deliverables proceed.

When approved, this rule book moves from `/drafts/rag-mentor-alt3/` to `/adopted/` (Elevated risk per project instructions 0d-ii — governing rule book; becomes part of canonical Stoic Brain definition). The move is itself a separate decision-log entry.

---

*End of Deliverable 8.*
