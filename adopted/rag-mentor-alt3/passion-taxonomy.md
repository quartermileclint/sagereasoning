# Deliverable 3 — Passion Taxonomy

**Status:** Adopted (founder approval per Path A on 2026-05-02; D-RAG-MENTOR-ALT3-CRITICAL-PATH-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-01.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-1 (passion-indexed retrieval, alt-1 inheritance carried through alt-3).
**Critical path:** This deliverable plus Deliverables 2 (canonical mechanism framework) and 8 (operationalised scoring rules) form the critical path.

**Cross-references:**
- `/adopted/rag-mentor-alt3/canonical-framework.md` (Deliverable 2 — the canonical taxonomy this passion taxonomy slots into)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC3 (Zone 2 clinical adjacency domains — naming the practitioner profile risk surface), R20d (relationship asymmetry), ES1 (Zone 2 eval inputs must include founder-profile inputs)
- `/stoic-brain/stoic-brain.json` (corpus index)
- `/website/src/data/stoic-brain-compiled.ts` (PASSIONS_CONTEXT — the condensed taxonomy)
- `/stoic-brain/scoring.json` (4-stage `evaluation_sequence` Stage 3 — Passion Diagnosis)
- `/website/src/lib/sage-reason-engine.ts` (current passion taxonomy in `STANDARD_SYSTEM_PROMPT` and `DEEP_SYSTEM_PROMPT`)

---

## Plain-language summary

Stoic philosophy classifies destructive emotional states (`pathē`, plural; `pathos`, singular — translated as "passions") into four root types arranged on a 2×2 matrix of temporal orientation (present / future) and evaluative perception (apparent good / apparent evil). Each root passion has named sub-species — orge (anger), philodoxia (love of honour), penthos (grief), agonia (agonised dread), and others. The Stoics also identified three rational good feelings (`eupatheiai`) that replace specific passions: chara (rational gladness) replaces hedone, boulesis (rational wish) replaces epithumia, eulabeia (rational caution) replaces phobos.

This document formalises that taxonomy as a controlled vocabulary. The deterministic engine's passion mechanisms (mechanisms 2, 3, 4, 5 of the canonical framework) consume this vocabulary. Every retrievable chunk in the index (Deliverable 5) is tagged with a `passion` and `sub_passion` field from this controlled list. Drift from this list — for example, a chunk tagged with "anxiety" rather than the canonical `agonia`, or with a non-canonical sub-species — produces silent retrieval failures and is the primary integrity risk for AC-1.

The taxonomy is canonical Stoic Brain content already present in `stoic-brain-compiled.ts`. This deliverable formalises it as a versioned controlled vocabulary, surfaces the `false_judgement` structure that is currently implicit, and adds compound-passion handling rules.

## Glossary (terms used in this document)

- **Passion (Greek: `pathos`, plural `pathē`)** — a destructive emotional state arising from a false judgement about good or evil. Not "emotion" in the modern sense; specifically an *irrational* movement of soul that exceeds due measure.
- **Eupatheia (plural: `eupatheiai`)** — a rational good feeling that arises from a true judgement. The Stoic counterpart to a passion. Three are canonical: chara, boulesis, eulabeia.
- **Sub-species** — a specific manifestation of a root passion. The taxonomy lists 20 sub-species (six under epithumia, three under hedone, six under phobos, five under lupe).
- **2×2 matrix** — the temporal × evaluative grid that classifies the four root passions. Temporal axis: present vs future. Evaluative axis: apparent good vs apparent evil.
- **False judgement** — the underlying false belief that drives a specific passion. Each sub-species has a canonical false-judgement structure that mechanism 5 fills in case-specifically.
- **Compound passion** — a state in which two or more sub-species (often across different root passions) are operative simultaneously. Examples: agonia + philodoxia (agonised dread of dishonour), penthos + zelotypia (grieving jealousy).
- **Causal stage** — the point in `phantasia → synkatathesis → horme → praxis` at which the practitioner's reasoning went wrong. Specified in mechanism 4.
- **Diagnostic sequence** — the 5-step procedure mechanism 2's logic follows to identify which root passion(s) are operative.
- **Profile prior** — a probability bias drawn from the practitioner's longitudinal profile. Used to break ties in mechanism 4 and mechanism 5.

## The 2×2 matrix

The four root passions are organised on a 2×2 grid:

|  | Apparent good | Apparent evil |
|---|---|---|
| **Present** | `hedone` (irrational pleasure) | `lupe` (distress / irrational pain) |
| **Future** | `epithumia` (craving / irrational desire) | `phobos` (fear / irrational shrinking) |

A practitioner's input is classified by:

1. **Temporal orientation**: is the practitioner concerned about something present (already happening / already happened) or something future (not yet arrived)?
2. **Evaluative perception**: does the practitioner perceive the object as a good (worth pursuing / worth holding) or as an evil (worth fleeing / worth lamenting)?

The matrix is canonical (psychology.json + passions.json). The practitioner's narrative usually identifies temporal and evaluative axes implicitly. When it does not, mechanism 2 fires Tier 1 TEMPORAL_AMBIGUITY clarification (AC-13).

## The four root passions and their sub-species

Source: `stoic-brain-compiled.ts` `PASSIONS_CONTEXT.four_root_passions`. English glosses are R8b (developer documentation) — Greek IDs are the canonical machine identifiers per R8a.

### `epithumia` — Craving / Irrational Desire (future_apparent_good)

The misjudgement is that some external (a future external) is a genuine good. The practitioner's reasoning has assented to "I lack X; if I had X my life would be better" where X is a preferred indifferent (reputation, wealth, pleasure) inflated to the status of a genuine good.

| Sub-species ID | English | Plain description |
|---|---|---|
| `orge` | Anger | Desire for retributive harm against a perceived offender. The future-good is the imagined satisfaction of having reciprocated the wrong. |
| `eros` | Erotic passion | Excessive desire for a specific person, treating their presence as a genuine good. |
| `pothos` | Longing | Desire for an absent person or thing the practitioner expects to recover. |
| `philedonia` | Love of pleasure | Excessive desire for sensory pleasure as if it were a genuine good. |
| `philoplousia` | Love of wealth | Excessive desire for accumulation, treating wealth as a genuine good rather than a preferred indifferent. |
| `philodoxia` | Love of honour | Excessive desire for reputation, recognition, status, or external validation. The future-good is being well thought of by others. |

### `hedone` — Irrational Pleasure (present_apparent_good)

The misjudgement is that some present external is a genuine good. The practitioner's reasoning has assented to "I have X; this is genuinely good for me."

| Sub-species ID | English | Plain description |
|---|---|---|
| `kelesis` | Enchantment | Excessive delight in a present object, treating it as a genuine good. |
| `epichairekakia` | Malicious joy | Pleasure at another's misfortune. The present-good is the satisfaction of seeing an enemy harmed. |
| `terpsis` | Excessive amusement | Excessive delight in present pleasures (entertainment, distraction). |

### `phobos` — Fear / Irrational Shrinking (future_apparent_evil)

The misjudgement is that some future external is a genuine evil. The practitioner's reasoning has assented to "Y might happen; if Y happens it would be genuinely bad for me" where Y is a dispreferred indifferent (loss, illness, dishonour) inflated to genuine evil.

| Sub-species ID | English | Plain description |
|---|---|---|
| `deima` | Terror | Acute fear of imminent harm. |
| `oknos` | Timidity | Avoidance of a future task from fear of failure or exposure. |
| `aischyne` | Shame | Fear of dishonour — anticipated loss of standing. |
| `thambos` | Dread | Fear arising from an unexpected or strange event. |
| `thorybos` | Panic | Confused, agitated fear without a clear object. |
| `agonia` | Agonised dread | Sustained, anticipatory fear about an outcome the practitioner cannot control. Often presents as catastrophising — running mental simulations of the worst case repeatedly. |

### `lupe` — Distress / Irrational Pain (present_apparent_evil)

The misjudgement is that some present external is a genuine evil. The practitioner's reasoning has assented to "X has happened; this is genuinely bad for me."

| Sub-species ID | English | Plain description |
|---|---|---|
| `eleos` | Pity | Pain at another's misfortune, treating their loss as a genuine evil. |
| `phthonos` | Envy | Pain at another's good fortune, treating their gain as a genuine evil to oneself. |
| `zelotypia` | Jealousy | Pain at sharing a good with another, treating the sharing as a genuine loss. |
| `penthos` | Grief | Sustained pain at a present loss (death, separation, deep change), treating the loss as a genuine evil. |
| `achos` | Anxiety | Generalised distress without a clear object. The closest sub-species to what modern English calls "anxiety" — but note the canonical translation places `agonia` (under phobos) closer to anticipatory anxiety and `achos` closer to a chronic distress state. |

**Total: 20 sub-species.** The taxonomy is canonical and closed for Phase 1. Corpus expansion (D-A10, deferred) may add new sub-species in later phases.

## The three eupatheiai (rational good feelings)

Source: `PASSIONS_CONTEXT.three_good_feelings`. The eupatheiai are not passions; they are the rational counterparts that replace specific passions when reasoning is correct.

| Eupatheia ID | English | Replaces | Plain description |
|---|---|---|---|
| `chara` | Joy / rational gladness | `hedone` (irrational pleasure) | Rational delight in genuine goods (virtue, friendship grounded in virtue) without the false judgement that elevates indifferents to goods. |
| `boulesis` | Rational wish | `epithumia` (craving) | Rational pursuit of preferred indifferents *as preferred indifferents* — selecting (`eklegetai`) without desiring (`oregetai`) per value.json. |
| `eulabeia` | Rational caution | `phobos` (fear) | Rational alertness to dispreferred indifferents *as dispreferred indifferents* — avoiding without fearing. |

There is no eupatheia counterpart to `lupe` (distress). The Stoics held that the wise person never grieves at present loss because they have not assented to the false judgement that the loss is a genuine evil. Where modern practitioners experience grief at losses (death, separation, deep change), the Stoic position is that the grief reflects an incorrect judgement. The architecture preserves this rather than softening it.

The canonical answer for the practitioner experiencing penthos is not "you should not feel this." It is: "the passion is signalling that you have judged this loss to be a genuine evil. The work is to examine that judgement." This is the diagnostic-not-punitive posture (R6d).

The two acknowledged residual seams (AC-17) interact with the eupatheia / passion boundary. The `CONFIDENCE_WEIGHTED` flag on eupatheia classifications exists because chara cannot be confirmed from a single instance: the question "did the practitioner experience rational gladness or irrational pleasure?" requires longitudinal evidence to answer reliably. A single instance is `CONFIDENCE_WEIGHTED: low`; consistency across many instances raises confidence over time.

## The 5-step diagnostic sequence

Source: `PASSIONS_CONTEXT.diagnostic_sequence` and `passions.json > diagnostic_use`. This is mechanism 2's deterministic procedure for identifying root passion(s):

1. **Was the agent's impression of the situation distorted?** If so, by which of the four root passions? (Identify temporal axis: present vs future. Identify evaluative axis: apparent good vs apparent evil. Place on the 2×2 matrix.)
2. **Did the agent assent to a false impression?** Which false belief drove the assent?
3. **Did the impulse exceed what reason warranted?** Zeno's definition: passion is impulse exceeding due measure.
4. **Which specific sub-species was operative?** Not just "fear" but `oknos` (timidity) or `aischyne` (shame) or `agonia` (agonised dread).
5. **What is the corresponding correct judgement that would replace the false one?** This is the eupatheia direction or the rational alternative.

Mechanism 2 implements steps 1, 3 (in part). Mechanism 3 implements step 4. Mechanism 4 implements step 2 (the causal-stage portion). Mechanism 5 implements step 5 (the false-judgement → correct-judgement mapping).

The decomposition is what makes alt-3's per-mechanism rule structure possible. Today the 5-step diagnostic is collapsed into a single LLM-paraphrased `passion_diagnosis` block; under alt-3 each step is a discrete deterministic operation.

## The false-judgement structure

Each sub-species has a canonical false-judgement *template* — a structured form that mechanism 5 fills in case-specifically using the practitioner's narrative and profile prior.

The template has three slots:

```
{
  "object_inflated_or_deflated": "<the indifferent the practitioner has misjudged>",
  "judgement_type": "INFLATION" | "DEFLATION" | "INVERSE_DEFLATION",
  "correct_judgement": "<what right reason would assent to instead>"
}
```

`INFLATION` — a preferred indifferent treated as a genuine good (the most common pattern in epithumia and hedone passions).
`DEFLATION` — a dispreferred indifferent treated as a genuine evil (the most common pattern in phobos and lupe passions).
`INVERSE_DEFLATION` — a preferred indifferent treated as a genuine evil, or vice versa. Less common but occurs in compound passions.

Worked example (philodoxia):

```
{
  "sub_species": "philodoxia",
  "object_inflated_or_deflated": "reputation / external recognition",
  "judgement_type": "INFLATION",
  "correct_judgement": "Reputation is a preferred indifferent (high axia under value.json) but not a genuine good. Selecting it via virtuous action is appropriate; desiring it as a genuine good is the philodoxia pattern."
}
```

Worked example (agonia):

```
{
  "sub_species": "agonia",
  "object_inflated_or_deflated": "future failure / loss of standing / catastrophic outcome",
  "judgement_type": "DEFLATION",
  "correct_judgement": "Future external outcomes are not genuine evils. They are dispreferred indifferents at most. Eulabeia (rational caution) replaces phobos here — the practitioner can attend to the risk without judging the outcome to be a genuine evil."
}
```

Mechanism 5's `refinement_source` field flags whether the case-specific refinement comes from the practitioner's profile (PROFILE — high confidence; the profile already names this false judgement as recurrent) or is derived from the current narrative (DERIVED — lower confidence; the false judgement is inferred from this single instance).

## Compound passions

Compound passions are common in real practitioner inputs. The architecture preserves this honestly via mechanism 2's `compound_passion_flags[]` output and mechanism 3's `unclassified_passions[]` output (for the rare case where a passion does not fit any single canonical sub-species).

Common compound patterns:

| Compound | Description | Where it shows up |
|---|---|---|
| `agonia + philodoxia` | Agonised dread of dishonour. The future-evil is loss of standing. Frequent in practitioners with strong philodoxia who also catastrophise. | Public-facing decisions; pre-launch anxiety. |
| `penthos + zelotypia` | Grieving jealousy. The present-evil is the sharing or loss of a relationship's exclusivity. | Family / partner conflicts. |
| `orge + aischyne` | Anger arising from shame. The future-good is retributive restoration of standing after a perceived dishonour. | Conflicts where the practitioner felt humiliated. |
| `phthonos + philodoxia` | Envy of a peer's recognition. The present-evil is the peer's gain in standing; the underlying inflation is the practitioner's own philodoxia. | Professional comparisons. |

Mechanism 2 detects compound passions via the diagnostic sequence (a single narrative may yield multiple temporal × evaluative placements). Mechanism 3 maps each detected root to its sub-species. Mechanism 5 produces a false-judgement entry per detected sub-species.

When compound passions are detected, mechanism 4 (causal stage) identifies the *primary* breakdown — usually the earliest stage at which any of the detected passions assented. This becomes the `primary_causal_breakdown` output.

## Worked examples (drawn from architecture-exercise patterns)

The following are surface-level illustrations of how the taxonomy applies to the named worked-example anchors. Detailed operationalisation lives in Deliverable 8.

### Example A — philodoxia patterns

The practitioner's profile carries philodoxia (love of honour) at strong intensity. The architecture exercise identified several recurrent surface patterns:

- "I want this conversation to land well" (where "land well" means the audience thinks well of the practitioner).
- Excessive iteration on phrasing for posts, emails, and decisions.
- Disproportionate satisfaction at positive feedback; disproportionate distress at neutral feedback.

In each, mechanism 2 detects `epithumia` (future apparent good) and mechanism 3 maps it to `philodoxia`. Mechanism 5 fills the false-judgement template with the practitioner's specific object (the audience, the post, the decision). Mechanism 4 most often locates the breakdown at `synkatathesis` (assent stage) — the practitioner has the impression of needing to be well thought of and assents to it without examining whether being well thought of is a genuine good.

### Example B — orge with children

The practitioner's profile flags orge (anger) at moderate intensity, scoped to family circle. Surface pattern: a child does not comply; the practitioner's response carries excessive force or sharpness.

Mechanism 2 detects `epithumia` (future apparent good — the imagined satisfaction of having corrected the child decisively). Mechanism 3 maps it to `orge`. Mechanism 5's false-judgement is "the child's compliance is a genuine good" (INFLATION) — not "the child's wellbeing is a genuine good" (which would be appropriate). The misjudgement is the inflation of *immediate compliance* to genuine-good status.

Mechanism 4 typically locates this at `horme` (impulse stage) rather than `synkatathesis` — the practitioner has often examined the impression and concluded compliance is not a genuine good, but the impulse exceeds due measure anyway. This is the pattern Stoic practice calls "weakness of will" (`akrasia`); mechanism 4's `compound_stage_failures[]` flags this case.

Mechanism 6 (oikeiosis_stage) maps the action to circle 2 (family). Mechanism 7 (oikeiosis_obligation) flags the obligation status — the practitioner's obligation to the child includes patient correction, not retribution.

### Example C — six consecutive procedural reports

Surface pattern: the practitioner reports six consecutive instances where they completed a task on time, met a deadline, or hit a milestone. The reports lack any reflection on motivation, risk, or alternative paths.

Mechanism 2 may detect *no* passion in any single report. But mechanism 10's longitudinal projection flags the *pattern* — six consecutive procedural reports without reflection is itself a `THEORETICAL_ONLY` proximity risk flag (the practitioner is performing the form of practice without the content). Mechanism 10's `proximity_risk_flag` outputs this.

This is the case where the engine deterministically does not surface a passion (the per-instance diagnosis is empty) but the longitudinal record carries the diagnostic signal. AC-17's `CONFIDENCE_WEIGHTED` flag applies to mechanism 10's output here: "the absence of detected passions across six instances increases proximity-risk confidence in this domain."

### Example D — the bus story

(The architecture-exercise reference to a "bus story" pattern. Without the transcript I treat this as a placeholder for the canonical pattern: an external event (bus running late, missing a connection, getting stuck behind a bus) provokes disproportionate distress.)

Mechanism 2 detects `lupe` (present apparent evil). Mechanism 3 maps to `achos` (anxiety) most often, or to `agonia` if the practitioner's narrative is anticipatory rather than retrospective. Mechanism 5's false-judgement is "the late bus is a genuine evil for me" (DEFLATION of a dispreferred indifferent — the bus is an external, not eph' hemin, and not a genuine evil).

Mechanism 1 (prohairesis filter) is the load-bearing mechanism here: the bus is `outside_prohairesis`. The practitioner's distress is rational only if a genuine good is at stake; since being on time for the next thing is itself a preferred indifferent, the depth of distress reveals the inflation.

### Example E — agonia in catastrophising

Surface pattern: the practitioner faces a future decision (a meeting, a launch, a conversation) and runs sustained mental simulations of worst-case outcomes — what if X happens, what if Y happens, what if Z happens, repeatedly.

Mechanism 2 detects `phobos` (future apparent evil). Mechanism 3 maps to `agonia` (sustained anticipatory dread). Mechanism 5's false-judgement is structured around the worst-case outcome the practitioner is rehearsing — the misjudgement is treating that outcome as a genuine evil rather than as a dispreferred indifferent.

Mechanism 4 (causal stage) locates this most often at `phantasia` (impression stage): the practitioner has not yet assented to the impression as true, but the repeated rehearsal is itself producing the agonia pattern. This is the case where intervention at the impression stage (e.g., naming the impression as "this is an impression I am rehearsing, not a fact I have assented to") is most effective.

This pattern is also the canonical site for AC3's Zone-2 `agonia` calibration. The mentor's response here is *engagement, not redirection* — agonia in catastrophising is working material for the Sage Mentor (Zone 2), not Zone 3 acute distress requiring redirection.

## Cleanliness ratings

The passion taxonomy itself has the following cleanliness rating per its three structural components:

| Component | Cleanliness | Notes |
|---|---|---|
| 4 root passions (2×2 matrix) | HIGH | Canonical; the matrix has no interpretive ambiguity. Tier 1 TEMPORAL_AMBIGUITY clarification handles input-side ambiguity. |
| 20 sub-species enumeration | HIGH | Canonical; closed list for Phase 1. |
| 3 eupatheiai | HIGH (taxonomy); PARTIAL (classification) | The taxonomy is canonical. Classifying a specific instance as eupatheia vs passion requires longitudinal evidence — `CONFIDENCE_WEIGHTED` (AC-17). |
| 5-step diagnostic sequence | HIGH | Canonical procedure. Implementation in mechanisms 2–5 is decomposed into HIGH and PARTIAL steps per Deliverable 2. |
| False-judgement template | HIGH (template); PARTIAL (case refinement) | The template structure is canonical. Case-specific refinement is `refinement_source: PROFILE` (high confidence) or `DERIVED` (lower confidence). |
| Compound-passion handling | PARTIAL | The set of common compound patterns is canonical; novel compounds may be flagged via `compound_passion_flags[]`. |

The taxonomy's overall cleanliness is HIGH — it is the foundation, not a place where engineering decisions need to be made. The PARTIAL ratings reflect the necessary acknowledgement that classifying a single instance with full confidence requires either profile-derived prior or longitudinal evidence.

## Manifest compliance

- **AC3 (Zone 2 clinical adjacency domains)** — the taxonomy explicitly preserves the six Zone 2 domains: shame (`aischyne`), grief (`penthos`), catastrophising vs premeditatio (`agonia`), interpersonal passion diagnosis (`philodoxia` with R20d), framework dependency (`philodoxia` + `andreia` with R20b), self-worth assessment (`penthos` + `philodoxia`). Mechanism 3's output names sub-species explicitly so AC3's per-domain enforcement posture remains addressable.
- **R20d (relationship asymmetry)** — the taxonomy is for self-evaluation. Mechanism 5's outputs are scoped to the practitioner; using them to diagnose another person's reasoning (e.g., "your partner is acting from `epithumia`") is a misapplication. This is reinforced at Layer 3 translation specification (Deliverable 11) by Layer 3's prohibition on second-person passion attribution.
- **R6d (passions are diagnostic, not punitive)** — every mechanism 2–5 output is a diagnostic naming a specific false judgement. None is a score deduction.
- **R7 (source fidelity)** — every passion in the taxonomy traces to passions.json (the SR translation of Stobaeus + DL + the Greek originals). No passion is invented.
- **R8a (data files / API responses)** — all sub-species use Greek IDs as primary identifiers (`philodoxia`, `agonia`, `penthos`).
- **R8c (website / user-facing)** — surface presentations on `sagereasoning.com` use English labels per existing pattern (e.g., the proximity ring's "Approaching wisdom"). No Greek terms appear on user pages without their English equivalent.
- **ES1 (founder-profile inputs)** — the worked examples cover the founder's strong-intensity passions (philodoxia, orge, agonia in catastrophising). The taxonomy's coverage gap for practitioners with different dominant passions (e.g., strong-intensity penthos primary, strong-intensity phthonos primary) is acknowledged and tracked as a P1 / post-launch coverage task per ES1.

## What this taxonomy enables

1. **Index taxonomy (Deliverable 5) — `passion` and `sub_passion` fields per chunk.** Every retrievable chunk in the index is tagged from this controlled vocabulary. AC-1 passion-indexed retrieval is operative on this taxonomy.
2. **Mechanism 2, 3, 5 input vocabulary (Deliverable 8).** The deterministic engine's passion mechanisms consume this vocabulary as their canonical input set.
3. **Tier 1 forced clarification target list (Deliverable 13).** When mechanism 2 fires TEMPORAL_AMBIGUITY clarification, the question text references the temporal axis directly (e.g., "are you more concerned about something that's already happened, or something you're worried might happen?").
4. **Layer 1 translation controlled vocabulary (Deliverable 10).** Claude's input translation maps free-text practitioner narrative onto this controlled vocabulary. Any passion or sub-species not in this list is rejected by the schema.
5. **Cross-surface consistency.** When the practitioner's profile says "philodoxia detected," the same identifier is used on the conversation surface, the proximity ring, the founder-hub flow (when migrated), and any future surface.

## What this taxonomy does not decide

- **Corpus expansion** (D-A10 deferred). Whether to add new passions or eupatheiai (e.g., from later sources or non-canonical Stoic literature) is a future-phase question.
- **Whether the founder's passion profile is itself canonical content.** The profile is a per-practitioner artefact; it consumes this taxonomy but is not part of it. Profile-derived false judgements are logged via mechanism 5's `refinement_source: PROFILE`.
- **Whether to add a confidence dimension to compound-passion flags.** Today `compound_passion_flags[]` is binary (compound detected / not). If compound detection becomes a frequent source of error, a confidence dimension may be added in Phase 3+.
- **Whether to surface the eupatheia → passion replacement structure to the practitioner.** Today the framework holds it internally. The decision to surface "your boulesis (rational wish) is replacing your epithumia in this domain" to the practitioner is a Layer 3 translation choice, not a taxonomy choice.

## Honest disclosure

This passion taxonomy is the same content already present in `stoic-brain-compiled.ts` `PASSIONS_CONTEXT`. This deliverable does not introduce new sub-species, new root passions, or new eupatheiai. It does:

1. Formalise the existing taxonomy as a versioned controlled vocabulary (v1.0.0 — Phase 1 alt-3 draft).
2. Surface the false-judgement template structure that is currently implicit in the stoic-brain.json corpus but not formalised in code.
3. Add explicit compound-passion handling rules that the existing engine implements informally via LLM judgement.
4. Cross-reference each sub-species to the AC3 Zone-2 domains so safety perimeter discussions can address per-passion issues.

The worked examples in section "Worked examples" are drawn from the named architecture-exercise anchors (philodoxia patterns, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising). Where the architecture-exercise transcript is not in front of me, the example narratives in this document are surface-level illustrations consistent with the canonical pattern. The detailed operationalisations live in Deliverable 8.

## Approval gate

This deliverable plus Deliverables 2 and 8 form the critical path. All three must be approved before downstream Phase-1 deliverables proceed.

---

*End of Deliverable 3.*
