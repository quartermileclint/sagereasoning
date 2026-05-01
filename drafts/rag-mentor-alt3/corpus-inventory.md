# Deliverable 4 — Corpus Inventory

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-1 (passion-indexed retrieval — every retrievable chunk carries `passion` and `sub_passion` fields); AC-2 (hybrid retrieval — every chunk carries the structural fields the BM25 + vector retriever consumes); AC-12 (translation-sandwich — the corpus is the rule book the deterministic engine reads, not a place where Claude reasons).

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — the 9+1 mechanism taxonomy this inventory tags against)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3 — the controlled vocabulary this inventory consumes)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8 — the rules whose `Source:` fields name corpus fragments per rule)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — surfaces where corpus passages are consumed)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` R6a–R6e (methodology), R7 (source fidelity), R8a–R8d (glossary tiers)
- `/stoic-brain/stoic-brain.json` (hub + foundations)
- `/website/src/data/stoic-brain-compiled.ts` (8 condensed context constants used by the engine today)
- `/website/src/lib/context/stoic-brain-loader.ts` (`getStoicBrainContext`, `getStoicBrainContextForMechanisms`)
- `/website/src/lib/context/mentor-knowledge-base-loader.ts` (Layer 5 — historical / global context, not corpus)

---

## Plain-language summary

The Stoic Brain corpus is the body of source-derived philosophical content that the deterministic engine reads from. Today the corpus exists as 8 JSON files plus the 8 condensed context constants in `stoic-brain-compiled.ts`. The engine uses these as one input among several (it also receives practitioner context, project context, mentor knowledge base, etc.). Under alt-3, the corpus becomes the canonical reference for every Stoic claim the engine asserts: every claim must trace to a corpus passage, and every retrievable chunk in the eventual index (Deliverable 5) carries tags pointing to its corpus origin and to the canonical mechanism(s) it contributes to.

This deliverable specifies the **tagging schema** (the structured fields per passage), the **per-file inventory** (which file contributes to which canonical mechanism, and at what density), the **coverage gaps** (what the corpus does not cover today), and the **focus-question-stem catalogue gap** (a specific sub-corpus that is operative in production but not formalised — flagged for promotion).

The deliverable does not perform per-passage tagging. Per-passage tagging is a Phase-2 build task (Deliverable 5 — index schema — defines the storage shape; the actual tagging happens during index construction). What this deliverable does is establish the schema and the per-file structural inventory so Phase 2 has a fixed contract to build against.

## Glossary

- **Corpus** — the 8 source files plus the 8 condensed context constants. The body of Stoic content the engine reads.
- **Passage** — an atomic addressable unit within the corpus. A passage is the smallest unit the retriever can fetch and the smallest unit the rule book can cite. Granularity is sentence-level / sub-sentence (per AC-4 small chunks) for retrieval; conceptual blocks for source citation.
- **Tag** — a structured field attached to a passage. Tags are how the deterministic engine, the retriever, and the rule book locate passages without semantic search alone.
- **Passage_type** — the function a passage serves. Five canonical types: `mechanism`, `canonical_line`, `example`, `focus_question_stem`, `scoring_rule`.
- **Canonical_mechanism** — which of the 9+1 mechanisms (D2) the passage contributes to. A passage may carry multiple mechanism tags if it spans (e.g., the dichotomy of control passage contributes to both Mechanism 1 prohairesis_filter and Mechanism 8 value_indifferent).
- **Passion / sub_passion** — the controlled vocabulary tags from D3 (per AC-1 — passion-indexed retrieval).
- **Coverage gap** — a place where the engine asserts behaviour but no corpus passage backs the assertion. Coverage gaps are not failures; they are honest acknowledgements of where the corpus needs expansion (D-A10 deferred) or where formalisation is needed (D-A16 — focus-question stems).

## The 8 source files (per `stoic-brain.json` `files` block)

| File | Conceptual domain | Primary canonical mechanisms served | Passion-tagging density | R7 source fidelity |
|---|---|---|---|---|
| `stoic-brain.json` (hub + foundations) | Core premise, dichotomy of control, flourishing, the sage ideal, cosmic framework | Mechanism 1 (`prohairesis_filter` — dichotomy of control); Mechanism 10 (`katorthoma_proximity` — sage ideal as Senecan grade ceiling) | Low — foundations don't index by passion | Direct — every foundation traces to DL, Stobaeus, Cicero, Seneca, Marcus Aurelius, Epictetus |
| `psychology.json` | Ruling faculty, impression-assent-impulse causal sequence, impulse taxonomy | Mechanism 4 (`passion_causal_stage` — `phantasia → synkatathesis → horme → praxis`); Mechanism 1 (ruling faculty as the seat of prohairesis) | Low — psychology indexes by causal stage, not by passion | Direct — Stobaeus Eclogae 2.86–97, DL Lives 7.40–43 |
| `passions.json` | 4 root passions with sub-species, 3 eupatheiai, passion as false judgement | Mechanism 2 (`passion_root_detection`); Mechanism 3 (`passion_sub_species`); Mechanism 5 (`passion_false_judgement`); Mechanism 4 (causal stage per passion) | **Highest** — every passage indexes by `passion` and (where applicable) `sub_passion` | Direct — Stobaeus Section 5, DL 7.110–116 |
| `virtue.json` | Unity thesis, nature of virtue as knowledge, 4 expressions with sub-expressions | Mechanism 9 (`virtue_domain_engaged`); Mechanism 10 (composite via virtue dimension) | Low — virtues don't index by passion | Direct — DL 7.92–93, 7.125; Stobaeus Eclogae 2.59–63; Cicero De Officiis 1.15–18 |
| `value.json` | Genuine goods, genuine evils, indifferents with axia continuum, selection principles | Mechanism 8 (`value_indifferent`); Mechanism 5 (`correct_judgement` enrichment per Pass-2 of D8 Rule 5) | Medium — value entries index by which passion(s) typically fire on the indifferent (e.g., reputation → philodoxia / aischyne) | Direct — Stobaeus Section 3, DL 7.101–107, Cicero De Finibus 3.50–57 |
| `action.json` | Kathekon / katorthoma distinction, oikeiosis developmental sequence, Cicero's deliberation framework | Mechanism 6 (`oikeiosis_stage`); Mechanism 7 (`oikeiosis_obligation` — Cicero's 5 questions); Mechanism 10 (kathekon / katorthoma boundary) | Low — action concepts don't index by passion | Direct — Stobaeus Section 4, Cicero De Officiis (whole), DL 7.36–40 |
| `progress.json` | Binary sage/non-sage distinction, Senecan 3 grades, progress metrics | Mechanism 10 (`katorthoma_proximity` — Senecan grade overlay) | Low — progress doesn't index by passion | Direct — Stobaeus Eclogae 2.66, Seneca Ep. 75, DL 7.71–80, Epictetus Disc. 1.4 |
| `scoring.json` | Application layer — 4-stage `evaluation_sequence`, `katorthoma_proximity_scale` | All mechanisms (scoring.json is the integration point); Mechanism 10 most directly | Low — scoring rules index by mechanism, not by passion | Application-derived (R7 carve-out — scoring.json is SageReasoning's design, separated from source content per the v3 methodology) |

The 8 condensed context constants in `stoic-brain-compiled.ts` (`STOIC_BRAIN_FOUNDATIONS`, `PSYCHOLOGY_CONTEXT`, `PASSIONS_CONTEXT`, `VIRTUE_CONTEXT`, `VALUE_CONTEXT`, `ACTION_CONTEXT`, `PROGRESS_CONTEXT`, `SCORING_CONTEXT`) are **derived projections** of the 8 source files into compact LLM-friendly shape. They are not separate corpus content. Under alt-3, the deterministic engine retrieves from the source files (at chunk granularity) rather than receiving the condensed context constants as a single block. The condensed constants remain available to surfaces that bypass the engine (today's score-document and reflect routes per D24).

## Tagging schema (per passage)

Each retrievable passage in the index (Deliverable 5) carries the following structured fields:

```
{
  "passage_id": "<stable identifier — corpus_file:section:offset or equivalent>",
  "source_file": "<one of: stoic-brain | psychology | passions | virtue | value | action | progress | scoring>",
  "source_citation": "<Stobaeus Eclogae 2.86 | DL Lives 7.110 | Cicero De Officiis 1.15 | etc.>",
  "passage_type": "<mechanism | canonical_line | example | focus_question_stem | scoring_rule>",
  "canonical_mechanism": ["<mechanism_id>", ...],
  "passion": "<root_passion_id>" | null,
  "sub_passion": "<sub_species_id>" | null,
  "audience_tier": "<R8a — strict glossary | R8b — developer | R8c — user-facing English | R8d — agent-facing>",
  "text": "<the passage text>",
  "embedding": "<vector — produced at index time>",
  "bm25_tokens": "<token list — produced at index time>"
}
```

### `passage_type` values

- **`mechanism`** — a passage that operationalises one of the 9+1 canonical mechanisms. Example: the dichotomy-of-control list (Epictetus Enchiridion 1) operationalises Mechanism 1's classification step. The deterministic engine reads `mechanism`-tagged passages directly when applying a rule.
- **`canonical_line`** — a passage that is the canonical Stoic articulation of a concept, used as Layer 3 prose translation source. Example: Marcus Aurelius 4.26 *"everything is interwoven, and the bond is sacred"* is canonical for cosmic-framework prose. Layer 3 may quote canonical lines verbatim (within R8 limits — single short quotation only, attributed) or paraphrase them.
- **`example`** — a passage that illustrates a concept with a worked instance. Example: Epictetus Discourses 1.1's fortune-teller example illustrates dichotomy of control. Examples support Mechanism 5's case-refinement (`refinement_source: DERIVED`) when no profile prior fires.
- **`focus_question_stem`** — a question template that the engine fills with situational variables to produce a focus question for the practitioner. Example: *"When you think about [trigger_entity] right now, are you more concerned about [present_axis] or [future_axis]?"* — a Tier 1 TEMPORAL_AMBIGUITY stem. **The corpus today does not formally separate focus-question stems from prose — see Coverage Gap section below.**
- **`scoring_rule`** — a passage from `scoring.json` that specifies an evaluation step. Example: the `evaluation_sequence` Stage 1 specification of the prohairesis filter. Scoring rules are application-derived (R7 carve-out) and are tagged with `source_file: scoring`.

### `canonical_mechanism` mapping rules

A passage may serve multiple mechanisms. The mapping is structurally bounded — a passage cannot serve every mechanism; the corpus methodology means each passage belongs to a primary domain (foundations / psychology / passions / virtue / value / action / progress / scoring) and serves the mechanism(s) that draw from that domain.

| Source file | Mechanisms a passage may be tagged with |
|---|---|
| `stoic-brain.json` | Mechanism 1 (dichotomy of control); Mechanism 10 (sage ideal as Senecan grade ceiling); Mechanisms 6, 7 (foundations on flourishing / cosmic framework inform oikeiosis) |
| `psychology.json` | Mechanism 4 (causal sequence — primary); Mechanism 1 (ruling faculty); Mechanism 2 (impression-stage diagnostic) |
| `passions.json` | Mechanisms 2, 3, 5 (primary); Mechanism 4 (per-passion causal-stage signatures) |
| `virtue.json` | Mechanism 9 (primary); Mechanism 10 (virtue dimension of composite) |
| `value.json` | Mechanism 8 (primary); Mechanism 5 (Pass-2 enrichment); Mechanism 1 (preferred / dispreferred indifferents are not eph' hemin) |
| `action.json` | Mechanisms 6, 7 (primary); Mechanism 10 (kathekon / katorthoma boundary) |
| `progress.json` | Mechanism 10 (Senecan grade overlay — primary) |
| `scoring.json` | All mechanisms (scoring.json is the integration point; `scoring_rule`-typed passages cite the mechanism(s) the rule operationalises) |

### `passion` / `sub_passion` indexing

Per AC-1 (passion-indexed retrieval), every retrievable chunk that touches a passion or eupatheia is tagged with the appropriate identifier from D3's controlled vocabulary. The 4 root passions and 20 sub-species form the closed list for Phase 1. The 3 eupatheiai (`chara`, `boulesis`, `eulabeia`) are tagged via the same field with the eupatheia identifier in the `sub_passion` slot when the passage describes a eupatheia rather than a passion.

Passages that do not touch a passion or eupatheia carry `passion: null` and `sub_passion: null`. This is the default for foundations, virtue, action, value (with named exceptions where a value entry describes the passion that typically fires on the indifferent), and progress passages.

## Per-file structural inventory

Each section below summarises the corpus file's contribution to the canonical mechanism set, identifies the primary `passage_type`s the file contributes, and notes any structural ambiguity that Phase 2 indexing needs to resolve. Per-passage tagging is operationalised at Phase-2 build time (Deliverable 5).

### `stoic-brain.json` (hub + foundations)

- **Primary mechanisms served:** 1 (dichotomy of control — load-bearing), 10 (sage ideal).
- **Primary passage_types:** `canonical_line` (foundations text), `mechanism` (dichotomy-of-control list).
- **Structural notes:** The `dichotomy_of_control.up_to_us[]` and `not_up_to_us[]` lists are the canonical input to Mechanism 1's classification step. Each list item is a separate passage at retrieval granularity. The `the_sage.characteristics[]` list is canonical input to Mechanism 10's Senecan grade `sage` upper-bound.
- **Passion-tagging density:** Low — foundations are pre-passion (the dichotomy of control underlies all passion analysis but does not itself describe a passion).
- **Phase-2 build implication:** the `up_to_us[]` and `not_up_to_us[]` lists may benefit from being indexed individually (each list item as its own passage) so Mechanism 1's classification can retrieve precise matches.

### `psychology.json`

- **Primary mechanisms served:** 4 (causal sequence — load-bearing), 1 (ruling faculty), 2 (impression stage signature).
- **Primary passage_types:** `mechanism` (causal sequence specification), `canonical_line` (Stobaeus / DL definitions).
- **Structural notes:** The `causal_sequence` (`phantasia → synkatathesis → horme → praxis`) with per-stage `failure_mode` is the direct input to Mechanism 4. Each stage is a separate addressable passage. The impulse taxonomy (8 types: `prothesis` through `thelesis`) per Stobaeus Eclogae 2.86–97 is currently uncategorised against the mechanisms but informs Mechanism 4's stage-level vocabulary; **flagged as Phase-2 indexing decision** (whether the impulse taxonomy gets its own mechanism slot or stays as enrichment for Mechanism 4).
- **Passion-tagging density:** Low; the causal sequence is passion-agnostic at the stage level. Per-passion stage signatures (e.g., orge typically breaks at horme; agonia typically breaks at phantasia) are described in `passions.json`, not here.

### `passions.json`

- **Primary mechanisms served:** 2, 3, 5 (load-bearing); 4 (per-passion stage signatures).
- **Primary passage_types:** `mechanism` (per-passion / per-eupatheia entries), `canonical_line` (Stobaeus Section 5 / DL 7.110–116 definitions), `example` (per-passion narrative shapes).
- **Structural notes:** This is the densest passion-indexed file. Each of the 4 root passions has its own block; each of the 20 sub-species has its own entry within its root. Each sub-species entry contains: name (Greek + English), canonical signature, false-judgement template, typical causal-stage breakdown, eupatheia counterpart (if any). Per-sub-species worked examples (where present in the corpus) are tagged `example`; per-sub-species canonical signatures are tagged `mechanism`.
- **Passion-tagging density:** Highest. Every passage carries `passion` and (where applicable) `sub_passion`.
- **Phase-2 build implication:** the false-judgement template structure formalised in D3 may require a structured field per sub-species in the index (separate from prose), so Mechanism 5's Pass-1 placeholder fill can be deterministic. Currently the templates are implicit in the sub-species prose; **flagged for Phase-2 build to materialise as structured field**.

### `virtue.json`

- **Primary mechanisms served:** 9 (load-bearing), 10 (virtue dimension).
- **Primary passage_types:** `mechanism` (unity thesis specification, four_expressions structure), `canonical_line` (DL 7.125 / Stobaeus / Cicero definitions).
- **Structural notes:** The `unity_thesis` block is the canonical input to Mechanism 9's unity check. The `four_expressions` block (each virtue with sub-expressions) is the canonical input to Mechanism 9's per-virtue classification. The Validation Addendum on D8 (Adjustment 1 — Rule 9 unity-thesis flag-not-reclassify) introduces a distinction (unstable phronesis vs false phronesis) that is not currently in `virtue.json`; **flagged as Phase-2 indexing decision** — whether to add structured fields for the unstable / false distinction in `virtue.json` itself or to keep it in D8's logic only.
- **Passion-tagging density:** Low. Virtues are not passion-indexed. The relationship between specific passions and the virtue they oppose (e.g., philodoxia corrupts dikaiosyne and andreia simultaneously) is implicit in the unity thesis but not structurally indexed here.

### `value.json`

- **Primary mechanisms served:** 8 (load-bearing), 5 (Pass-2 enrichment), 1 (preferred / dispreferred indifferents are external_scope).
- **Primary passage_types:** `mechanism` (preferred / dispreferred lists with axia, selection principles), `canonical_line` (Stobaeus Section 3 / DL 7.101–107 / Cicero De Finibus 3.50–57 definitions).
- **Structural notes:** Each indifferent entry has axia level (high / moderate / low / high-negative / moderate-negative / low-negative) and may name the typical passion(s) that fire on it (e.g., reputation → philodoxia / aischyne). The Validation Addendum on D8 (Adjustment 2 — Rule 8 compound severity for INFLATION/DEFLATION same-root errors) requires Mechanism 8's logic to identify same-root pairs; the indifferents themselves do not need new fields, but the same-root mapping (e.g., recognition + humiliation are the preferred + dispreferred sides of the same axis) may benefit from explicit structured representation in `value.json`. **Flagged as Phase-2 indexing decision**.
- **Passion-tagging density:** Medium. Indifferents that name their typical-firing passion are tagged with that passion; indifferents whose firing is passion-agnostic carry `passion: null`.

### `action.json`

- **Primary mechanisms served:** 6, 7 (load-bearing), 10 (kathekon / katorthoma boundary).
- **Primary passage_types:** `mechanism` (oikeiosis sequence, kathekon / katorthoma definitions, Cicero's deliberation framework), `canonical_line` (Stobaeus Section 4, Cicero De Officiis whole, DL 7.36–40), `example` (Cicero's worked deliberation cases).
- **Structural notes:** The `oikeiosis_sequence` (5 stages: self → family → community → humanity → cosmos) is the canonical input to Mechanism 6. The `deliberation_framework` (Cicero's 5 questions) is the canonical input to Mechanism 7. The Validation Addendum on D8 (Adjustment 3 — Rule 7 explicit operative-circle dependency on Rule 6) requires Mechanism 7's input field to name the operative circle (per Mechanism 6's `oikeiosis_contraction` flag); this is a logic-layer addition, not a corpus addition. `action.json` itself does not need new fields.
- **Passion-tagging density:** Low. Action concepts are passion-agnostic at the rule level. The relationship between specific passions and obligation failures (e.g., philodoxia operative on Circle 3 typically corresponds to dikaiosyne weak via Cicero Q1) is captured at Mechanism 9 in D8, not here.

### `progress.json`

- **Primary mechanisms served:** 10 (Senecan grade overlay — load-bearing).
- **Primary passage_types:** `mechanism` (Senecan 3 grades + sage, progress metrics), `canonical_line` (Stobaeus Eclogae 2.66, Seneca Ep. 75, DL 7.71–80, Epictetus Disc. 1.4).
- **Structural notes:** Each Senecan grade has canonical indicators (per-grade signatures of practitioner state). These are the input to Mechanism 10's Senecan grade overlay step. The grade signatures interact with AC-17's `CONFIDENCE_WEIGHTED` flag — single-instance assignment to a grade is `CONFIDENCE_WEIGHTED: low`; longitudinal evidence raises confidence.
- **Passion-tagging density:** Low. Progress is passion-agnostic.

### `scoring.json`

- **Primary mechanisms served:** All (integration point); Mechanism 10 most directly via `katorthoma_proximity_scale` (5 levels).
- **Primary passage_types:** `scoring_rule` (the application-layer rules — the `evaluation_sequence` 4 stages plus the `katorthoma_proximity_scale`).
- **Structural notes:** Per the v3 methodology, scoring.json is application-derived (not source-derived). Every `scoring_rule` passage cites the mechanism(s) it operationalises. The 4-stage `evaluation_sequence` is the conceptual sequence (control → kathekon → passion → virtue) that the 9+1 mechanism framework decomposes implementation-wise (per D2). Phase-2 indexing should preserve this conceptual / implementation distinction — `scoring_rule` passages live alongside `mechanism` passages in the index but are tagged with `source_file: scoring` rather than `source_file: action / passions / etc.`
- **Passion-tagging density:** Low.

## Coverage gaps

### Gap 1 — Focus-question stems (D-A16)

**Status:** Frequent in production, not formalised in the corpus.

The deterministic engine's three-tier intake clarification (AC-13) and the engine's at-end reflective questions (today's `evening_prompt` field on `/api/mentor/private/reflect`) both produce questions for the practitioner. Today these questions are **LLM-composed at runtime** — the prompt instructs the LLM to produce a question, and the LLM produces one. There is no canonical catalogue of question stems in the corpus.

Under alt-3 this is the primary `passage_type: focus_question_stem` content. The mentor knowledge base (`mentor-knowledge-base-loader.ts`) and the existing reflect endpoint's `REFLECTION_PROMPT` both contain ad-hoc question patterns, but these are not in the source corpus and are not indexable as a structured catalogue.

The Phase-1 prompt's deliverable description names this gap explicitly: *"Identify coverage gaps for D-A16 (focus-question stems — frequent in `mentor-knowledge-base.ts` and the existing reflect endpoint's LLM behaviour, but not formalised)."*

**What this gap means for alt-3:** AC-10 (constrained slot-filled focus questions: corpus stem + LLM situational variables only) cannot be operationalised on the daily-reflection ritual surface (D14a) or the conversation surface until the focus-question-stem catalogue exists. Today's LLM-composed questions are not source-derived and would need to be either formalised (promoted to corpus content with provenance) or explicitly named as Layer-3 LLM-composed-with-constraints (the alt-3 alternative).

**Recommendation:** flag D-A16 as a Phase-2 build precondition. The catalogue can be assembled by:
1. Extracting current `mentor-knowledge-base.ts` question patterns and `REFLECTION_PROMPT` evening-prompt patterns.
2. Tagging each pattern with: trigger condition (which mechanism / which intake tier the question fires on), slot fields (the situational variables Layer 3 fills), source provenance (Stoic source if any, "alt-3 derived" otherwise).
3. Storing as a new corpus addition under `stoic-brain/focus-questions.json` or as a structured field within `scoring.json` (Phase-2 build decides).

The catalogue is operationally needed before D14a's `evening_prompt` can be slot-filled deterministically and before D14b's deferred-question-presentation logic can cite the question that was deterministically withheld at scoring time.

### Gap 2 — Passion / sub-species coverage limitations (D-A10 — out of scope)

**Status:** D-A10 (corpus expansion) is explicitly deferred. This deliverable surfaces gaps without proposing fixes.

The 20 sub-species in D3 (6 epithumia, 3 hedone, 6 phobos, 5 lupe) are calibrated against the founder's profile (philodoxia primary; orge moderate; agonia in catastrophising). The corpus covers these well. Practitioners with different dominant passions (e.g., strong-intensity penthos primary; strong-intensity phthonos primary) are covered at the taxonomy level but not at the worked-example-density level.

The Validation Addendum on D8 also names this as a scope limitation: *"the 10 rules in this rule book are calibrated against one practitioner profile (philodoxia primary)."* The same calibration limit applies to the worked-example density across the corpus.

**Specific gaps surfaced (not exhaustive):**
- `penthos` (grief) sub-species — corpus covers the canonical Stoic position (no eupatheia counterpart; the wise person does not grieve at present loss because the false judgement is absent) but does not have many worked examples of penthos at strong intensity primary. The architecture preserves the canonical position rather than softening it (per D3 §"The three eupatheiai") — this is a deliberate architectural commitment, not a coverage gap to close.
- `phthonos` (envy) — corpus covers the definition; worked examples primarily describe phthonos as a compound (`phthonos + philodoxia` — envy of a peer's recognition where the underlying inflation is the practitioner's own philodoxia). Standalone-phthonos worked examples are sparse.
- `aischyne` (shame) — Zone 2 domain per AC3. Worked examples cover aischyne in compound contexts (`orge + aischyne` for example) but standalone aischyne at strong intensity primary has limited corpus coverage.

**Recommendation:** logged for D-A10. No Phase-1 action.

### Gap 3 — Compound-passion catalogue completeness (D-A10 — out of scope)

D3 lists four canonical compound patterns: `agonia + philodoxia`, `penthos + zelotypia`, `orge + aischyne`, `phthonos + philodoxia`. The architecture acknowledges that novel compounds may surface in production via Mechanism 3's `unclassified_passions[]` flag. The corpus today does not document the full space of common compounds, only the four named patterns.

**Recommendation:** the catalogue grows from production observation. Phase-2 build may surface novel compounds; D-A10 expansion incorporates them with provenance. No Phase-1 action.

### Gap 4 — Domain-specific scoring rule corpus

`scoring.json` contains the canonical 4-stage `evaluation_sequence` and the `katorthoma_proximity_scale`. It does not contain per-domain scoring rules (e.g., scoring rules tuned for the relationships domain vs the work domain vs the public-discourse domain). The deterministic engine today applies the same scoring logic across all domains; per-domain calibration (if any) lives in the practitioner profile, not in the corpus.

**Status:** Out of scope for Phase 1. May become a coverage gap if Phase-2 production surfaces domain-specific scoring needs that the practitioner profile cannot accommodate.

## Worked examples — corpus passage tagging

Three worked examples illustrate how the tagging schema applies. Each example shows a passage drawn from the corpus, the tags it would carry in the eventual index, and the canonical mechanism(s) it serves.

### Example A — The dichotomy of control list (Epictetus Enchiridion 1)

**Passage text** (paraphrased from `stoic-brain.json` `dichotomy_of_control.up_to_us[]`): *"What is up to us: judgements (hypolepseis), impulses (hormai), desires (orexeis), aversions (ekkliseis), assent (synkatathesis), moral choice (prohairesis), character (ethos)."*

**Tags:**
```
{
  "passage_id": "stoic-brain:foundations:dichotomy_of_control:up_to_us",
  "source_file": "stoic-brain",
  "source_citation": "Epictetus Enchiridion 1; Discourses 1.1",
  "passage_type": "mechanism",
  "canonical_mechanism": ["prohairesis_filter"],
  "passion": null,
  "sub_passion": null,
  "audience_tier": "R8a"
}
```

This passage is the direct input to Mechanism 1's classification step. Retrieved deterministically when Mechanism 1 fires.

### Example B — Philodoxia sub-species entry (Stobaeus Section 5)

**Passage text** (paraphrased from `passions.json` `four_root_passions.epithumia.sub_species.philodoxia`): *"Excessive desire for reputation, recognition, status, or external validation. The future-good is being well thought of by others. False judgement: reputation is a genuine good rather than a preferred indifferent."*

**Tags:**
```
{
  "passage_id": "passions:epithumia:philodoxia:definition",
  "source_file": "passions",
  "source_citation": "Stobaeus Section 5; DL 7.110-116",
  "passage_type": "mechanism",
  "canonical_mechanism": ["passion_root_detection", "passion_sub_species", "passion_false_judgement"],
  "passion": "epithumia",
  "sub_passion": "philodoxia",
  "audience_tier": "R8a"
}
```

This passage serves three mechanisms simultaneously (root detection, sub-species mapping, false-judgement template lookup). The retriever surfaces it on any of those three mechanism queries when the input narrative shape matches.

### Example C — Tier 1 TEMPORAL_AMBIGUITY question stem (D-A16 — currently informal)

**Passage text** (from the alt-3 handoff, lines 122–124): *"When you think about this situation right now, are you more concerned about something that's already happened, or something you're worried might happen?"*

**Tags (under D-A16 promotion):**
```
{
  "passage_id": "focus-questions:temporal_ambiguity:tier_1:001",
  "source_file": "focus-questions" or "scoring",
  "source_citation": "alt-3 handoff 2026-04-29 (alt-3 derived; no Stoic primary source)",
  "passage_type": "focus_question_stem",
  "canonical_mechanism": ["passion_root_detection"],
  "passion": null,
  "sub_passion": null,
  "audience_tier": "R8c",
  "trigger_condition": "TEMPORAL_AMBIGUITY",
  "intake_tier": 1,
  "slot_fields": []
}
```

This passage is currently not in the source corpus. Promotion under D-A16 would store it as a structured corpus passage with explicit provenance (alt-3 derived rather than Stoic primary source). The architecture's R7 source fidelity is preserved by naming the alt-3-derived provenance honestly rather than fabricating a Stoic primary source.

## R6 / R7 / R8 compliance

- **R6a (no V1 replication):** the inventory does not inherit V1's 4-file structure or its 4-virtue independent-scoring assumption. The 8-file v3 corpus is consumed at the per-passage / per-mechanism level.
- **R6d (passions diagnostic, not punitive):** `passion` / `sub_passion` tags are diagnostic identifiers, not score modifiers.
- **R7 (source fidelity):** every passage carries `source_citation`. Application-layer content (`scoring.json`, focus-question stems under D-A16) is honestly tagged as application-derived rather than fabricated as Stoic primary source.
- **R8a (data files / API responses):** the tagging schema uses Greek IDs as primary identifiers (`passion: epithumia`, `sub_passion: philodoxia`, `canonical_mechanism: prohairesis_filter`).
- **R8b (developer documentation):** this document uses English-first with Greek/technical terms in brackets.
- **R8c (website / user-facing):** retriever output that flows to user-facing surfaces (Layer 3 prose) projects into English-only labels per D2 Table 4a / 4b / 5 conventions.
- **R8d (skill contracts):** the schema's structured fields appear in agent-facing API responses where applicable; English outcome-focused descriptions appear in skill-contract prose.

## Honest disclosure

This deliverable specifies the inventory schema and the per-file structural inventory. It does not perform per-passage tagging — that is a Phase-2 build task (Deliverable 5 — index schema — defines the storage shape; index construction is the per-passage tagging step).

The per-file inventory is derived from `stoic-brain.json` (the corpus index file) and the `stoic-brain-compiled.ts` constant structure. The tagging schema is derived from the alt-3 architectural commitments (AC-1 passion-indexed retrieval; AC-2 hybrid retrieval — every chunk carries the structural fields the BM25 + vector retriever consumes; AC-12 translation-sandwich — the corpus is the rule book the deterministic engine reads).

The coverage gaps are surfaced honestly. Gap 1 (focus-question stems / D-A16) is operationally needed before AC-10 can be operationalised on D14a's `evening_prompt` and D14b's deferred-question presentation. Gaps 2, 3, 4 are deferred to D-A10 corpus expansion as a parallel track.

## Approval gate

This deliverable does not gate downstream Phase-1 work. It is consumed by Deliverable 5 (index schema — Phase-1 session 3) which materialises the tagging schema into a storage format. The tagging schema may be refined during Deliverable 5's drafting; this deliverable's commitment is to the schema's structure and the per-file inventory, not to the literal field names.

When approved, this deliverable becomes v1.0.0 of the corpus inventory. It moves from `/drafts/rag-mentor-alt3/` to `/adopted/` in the same approval batch as the other Phase-1 deliverables (Standard risk under 0d-ii — drafts in `/drafts/`, no live-system effect; the move to `/adopted/` is Elevated risk per project instructions and requires its own decision-log entry).

---

*End of Deliverable 4.*
