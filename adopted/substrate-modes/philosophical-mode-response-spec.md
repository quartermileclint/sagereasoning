# Philosophical-Mode Response Specification

**Status:** **Adopted 2026-05-14** under `D-FOUR-MODE-SPECS-ADOPTED-2026-05-14` — moved `/drafts/` → `/adopted/substrate-modes/`. **Implementation status:** Designed (per 0a vocabulary) — the mode is specified, not built; the build session is deferred. (Decision status `Adopted` and implementation status `Designed` are distinct 0a taxonomies, stated separately per the standing cache's Element 7.)
**Stream:** founder.
**Supersedes scope:** the "clinical" mode entry in the original A6 row of `/adopted/substrate-plugin-staging-plan.md` ("Enum of supported modes (clinical / terse / standard / educational); SageReasoning-authored, not community-extensible"). This specification re-scopes and **renames "clinical" to "philosophical"**, repositioning the mode from a tone variant (observational framing for therapists) to a **transparency surface** (the substrate's reasoning shown directly to the user, without narrative composition).
**Companion spec:** `/archive/2026-05-14_agent-mode-response-spec-superseded.md` (the "terse → agent" rename). Both modes share the mandatory wraps, the Layer 2 source, and the per-response-only discipline. They diverge in shape (agent mode is structured for software consumption; philosophical mode is structured for human inspection) and in source material (philosophical mode adds a retrieve-passages-driven Source Material section; agent mode does not).
**F3 fold-in (per `/operations/agentic-commerce-findings-downstream-order.md`):** The philosophical-mode response shape is the human-readable rendering of the Layer3Response substrate-consultation-mandate (R3 + R19c + R19d + R20a + R18a + R18e injections + AC9/AC10/AC11 projections + verdict + score + Layer 2 fields verbatim).

---

## Purpose

**Philosophical mode** is the substrate's transparency surface — the rendering most directly useful for a human who wants to **see how the engine reasoned**, not just what it concluded. Three primary consumer types:

1. **Founder dogfooding** — read what the engine actually produced before any prose composition softens or interprets it.
2. **Auditors and reviewers** — verify that the substrate's outputs match the manifest rules without LLM-mediated interpretation as an intermediate layer.
3. **Philosophical learners** — trace each assessment dimension back to its rule, understand how Stoic mechanism analysis lands on concrete inputs, and read the source material the engine drew from.

Secondary consumers: adversarial evaluators per R18d (probe specific fields for failure modes); K-category migration consumers who want the structured rendering as input to their own re-renderings; self-paced students of the framework.

**Defining property:** the output is **deterministic from Layer 2 alone** for the structured content, with **retrieved Stoic passages** appended at the closing. No LLM prose composition. Same input, same output, byte-stable for the structured sections.

---

## Output formats

Three renderings produced from one source-of-truth JSON payload:

| Format | Status | Consumer |
|---|---|---|
| **JSON** | v1 — first build | Machine consumers; canonical source-of-truth; renders into the text + HTML formats |
| **Markdown text** | v1 — first build | Human consumers reading the report directly (website, terminal, plain-text contexts); markdown renders beautifully on the website and degrades gracefully in plain-text clients |
| **HTML** | v2 — separate build effort, **website-only initially** | Eventual graphical representation with concentric-circle targets and per-passion / per-virtue / per-circle logos; visualises the same data the text rendering renders textually |

The JSON is the canonical source. Text and HTML are presentation layers on top of the JSON. The **source material** section appears in the text and HTML renderings only — **NOT in the JSON** (citations are presentation content for humans, not computation content for machines).

The mandatory wraps (R3 / R19c / R19d when mentor-flavoured / R20a when distress signalled / R18a when category-framing requested / R18e Article 50 transparency) appear in all three formats.

---

## Section ordering

The text and HTML renderings follow this order:

1. **Mandatory opening wrap (R3 disclaimer)** — always present
2. **Title + Input observed** — one-paragraph summary of what the substrate received and how it characterises the situation
3. **Verdict** — kathekon outcome, quality, justification source (engine-constructed / agent-asserted / absent); the principal conclusion stated plainly
4. **Score vector** — component-level breakdown table showing each component's contribution
5. **Scalar score** — the composite score with cap rules, validity flag, precision band
6. **Field-by-field rendering** — Layer 2 sections rendered in this order:
   a. Passion diagnosis
   b. Control filter
   c. Oikeiosis (appropriation)
   d. Value assessment
   e. Kathekon assessment (raw `quality` and `justification` fields; separate from Verdict per founder decision 2026-05-14)
   f. Katorthoma proximity
   g. Virtue domains engaged
   h. Improvement path (when `improvement_path_structured` non-null)
   i. Stage scores (only the stages with non-`not_applied` values)
   j. Hasty-assent risk
   k. Ambiguity notes (Layer 1 + Layer 2; only when non-empty)
7. **Source material** — three retrieved Stoic passages keyed to the principal findings
8. **Mandatory closing wraps** — R19c (limitations) + R19d (mirror principle, when mentor-flavoured) + R18e (Article 50 transparency)

R20a distress passthrough, when active, replaces section 6's content with the distress redirection text per the R20a perimeter discipline. R18a category framing, when requested, sits within the title block.

The JSON has the same structural sections (excluding source material) in the same conceptual order, but as JSON keys rather than markdown headers.

---

## Excluded fields (load-bearing)

The following Layer 2 fields **do not appear** in philosophical mode at all:

| Field | Reason |
|---|---|
| `iterative_refinement.direction_of_travel` | Cross-submission profile data per R17e — comparing this submission to prior submissions reveals trajectory information that is profile-level, not per-response. |
| `iterative_refinement.senecan_grade` | Trajectory grade across submissions; profile-level. |
| `iterative_refinement.progress_dimensions` (all four: passion_reduction, judgement_quality, disposition_stability, oikeiosis_extension) | Progress-over-time observations; profile-level. |
| `iterative_refinement.motivation_classification` | Score-validity flag retained for the score's PROVISIONAL gating logic, but its raw value does not render in the report. |
| `score_confidence` (the agent-mode field) | Derived from `direction_of_travel`; excluded by the same reasoning. |

**What stays:** the score's `precision_band` field (about internal component uncertainty, not trajectory data) remains in the report.

**What is also excluded — profile-derived data of any other kind:**

- "Your typical pattern is X" — never
- "You've had this false judgement detected N times" — never
- Comparisons to other users / other inputs — never
- Trigger maps, contradiction maps, developmental timelines — these are profile structures governed by R17b/c/d, not by philosophical mode

The discipline: each philosophical-mode response is about **one submission, in isolation**. The user's history is governed by the journal / dashboard surface, not by Layer 3's rendering modes.

---

## Empty-field omission

If a Layer 2 field is empty / null / not applied, **the corresponding section is omitted from the text and HTML renderings** rather than rendered as "Open deferrals: none". The JSON output preserves all fields (null / empty values explicit) for machine consumers; the presentation renderings omit them for cleaner reading.

Sections subject to this rule (omitted when empty):

- Soft clarifications (omitted when `intake_clarifications.soft_clarifications` empty)
- Open deferrals (omitted when `intake_clarifications.open_deferrals` empty)
- Improvement path (omitted when `improvement_path_structured` null)
- Distress signal (omitted when not signalled)
- Ambiguity notes (omitted when both `layer1_ambiguity_notes` and `layer2_ambiguity_notes` empty)
- Stages within stage scores (each stage with `not_applied` value omitted from the stage scores listing)

The Verdict, Score vector, Scalar score, Katorthoma proximity, Hasty-assent risk, and the principal Layer 2 fields (passion diagnosis, control filter, oikeiosis, value assessment, kathekon assessment) appear in every response — they're load-bearing for the report.

---

## Per-section Greek-term glossing

Per founder decision 2026-05-14: **each section glosses on first occurrence within that section**, not response-wide.

Rationale: a reader who jumps directly into a single section (the Value assessment section, the Improvement path section, etc.) sees Greek terms glossed in their context. The trade is a small amount of repetition for audit-friendly and excerpt-friendly readability.

Term list per R8a (manifest): every Greek / Stoic-technical term in the controlled-vocabulary list gets glossed on first occurrence per section. Includes:

- Causal-chain stages: phantasia, synkatathesis, horme, praxis
- Passions: epithumia, hedone, phobos, lupe + sub-species when named
- Eupatheiai: chara, boulesis, eulabeia, eupatheia
- Virtues: phronesis, dikaiosyne, andreia, sophrosyne
- Architecture terms: prohairesis, kathekon, katorthoma, oikeiosis, eudaimonia, axia
- Affect descriptors: ataraxia (when named)

---

## Score handling for human consumers

The full score architecture (gate, components, multiplier, precision band) is shared with agent mode. See `/archive/2026-05-14_agent-mode-response-spec-superseded.md` §"Component score" for the full specification.

Differences for philosophical-mode rendering:

| Item | Philosophical mode |
|---|---|
| Score scalar | Rendered. Per founder decision 2026-05-14, the per-response score is safe under R17e (single-input result, not profile data). |
| Score vector | Rendered as a markdown table showing each component's contribution. |
| Kathekon gate logic | Same as agent mode (true / false / null × engine_constructed / agent_asserted / absent). The Verdict section names which combination fired. |
| PROVISIONAL flag | Rendered when applicable; the cap (50 or 35) is named explicitly in the scalar score line. |
| Cap notation | When the score is capped (contrary kathekon → 35; PROVISIONAL → 50), the score line includes "(CAPPED — reason)" so the reader knows the unconfirmed component sum exists separately from the rendered score. |
| Confidence field | **Excluded** per founder decision (derived from `direction_of_travel`, which is excluded). |
| Precision band | Rendered. ±N. About internal score uncertainty, not trajectory data. |

---

## Source material section

**Mechanism (Option A — confirmed 2026-05-14):** After Layer 2 produces its assessment, the philosophical-mode service makes a targeted call to `/website/src/lib/rag/retrieve-passages.ts` using the assessment's principal findings as filters. The retrieved passages render as the closing weighty content of the report.

**Retrieve parameters per philosophical-mode call:**

| Parameter | Value |
|---|---|
| `query` | Composed from the assessment's principal findings — typically: principal-passion name + sub-species + causal-stage + principal-mechanism + principal-value-error name |
| `passion_filter` | The principal `passions_detected[0].root_passion` when non-empty |
| `sub_passion_filter` | The principal `passions_detected[0].sub_species` when non-empty |
| `mechanism_filter` | Drawn from `improvement_path_structured.mechanism_applies` when non-null; falls back to the mechanism(s) the engine consulted during assessment |
| `passage_type_filter` | `['mechanism', 'canonical_line', 'example']` — exclude `focus_question_stem` and `scoring_rule` for human-facing retrieval |
| `top_k` | **3** per founder decision 2026-05-14 |
| `trace_enabled` | false in production; true in development |

**Rendering shape:**

Each retrieved passage renders as a markdown blockquote with a contextual heading line above it (naming what the passage informs from the assessment) and a citation line below:

```
**On <contextual framing — drawn from the principal finding the passage informs>:**

> *"<passage.text>"*

— <passage.source_citation>
```

The three contextual framings, in order, are typically:

1. Principal-passion finding (e.g., "On phobos at the synkatathesis stage")
2. Principal-mechanism finding (e.g., "On the correction of false judgements at the moment of impression")
3. Principal-value-error finding (e.g., "On the indifferents and others' regard")

When the assessment has fewer principal findings than three retrieved passages, the framings adapt. When no principal findings are present (residual cases), the framings default to the agent's katorthoma_proximity and the named virtue domains engaged.

**JSON-excluded:** The source material section appears in the text and HTML renderings only. The JSON output does not carry retrieved passages — they're presentation content for humans, not computation content for machines. If a JSON consumer needs source material, it can make its own retrieve-passages call.

---

## Reflection component (principled withholding)

Layer 2 includes a principled-withholding mechanism. When the Layer 1 input does not include the practitioner's reflective self-report — their own account of what was operative for them — Layer 2 does not guess at the classifications that depend on that self-report. It withholds them deliberately and records the withholding in an `OpenDeferralEntry`.

Each `OpenDeferralEntry` carries a `withheld_classification` object:

- `field_path` — dot-path into the `Layer2Assessment` naming which classification was withheld
- `withheld_at_position` — where in the process the withholding happened
- `reason` — why the classification could not be determined from the input given

The two Tier 3 triggers are `PRAXIS_MOTIVATION_AMBIGUITY` (withholds the motivation classification — virtue vs convention) and `EUPATHEIA_BOUNDARY` (withholds the eupatheia classification — genuine rational affection vs polished surface over passion).

This is principled withholding, not failure: the engine declining to flatten what it genuinely cannot determine from the input it was given.

**Philosophical-mode rendering.** Open deferrals render deterministically as their own field section within the field-by-field rendering (omitted when empty per the empty-field omission rule). The full `withheld_classification` structure is shown — `field_path`, `withheld_at_position`, `reason`. This is consistent with philosophical mode's transparency purpose: the reader sees exactly what the engine declined to determine and the precise reason it could not, rather than a smoothed-over assessment that conceals its own gaps.

---

## Mandatory wraps

All six mandatory injection rules from `layer3-service.ts` apply identically in philosophical mode:

| Rule | Constant | Position |
|---|---|---|
| R3 disclaimer | `R3_DISCLAIMER` | Opening (above the Title + Input observed block) |
| R19c limitations | `R19C_LIMITATIONS_LINK` | Closing (after source material) |
| R19d mirror principle | `R19D_MIRROR_PRINCIPLE` | Closing, when `consumer_context.is_mentor_flavoured` |
| R20a distress passthrough | `R20A_DISTRESS_PASSTHROUGH` | Replaces the field-by-field content when distress signal active (R20a perimeter discipline preserved) |
| R18a Character Kernel category | `R18A_CHARACTER_KERNEL_CATEGORY` | Title block, when `consumer_context.include_category_framing` |
| R18e Article 50 transparency | `R18E_ARTICLE_50_TRANSPARENCY_NOTICE` | Closing (after R19c / R19d) |

These wrap every philosophical-mode response. They are non-negotiable per the manifest's R3 / R18e / R19c / R19d / R20a / R18a obligations.

---

## R17 compliance — what makes this safe

R17e (Intimate Data Protection — Passion taxonomy API restrictions): "The 25-species passion taxonomy is available as a philosophical reference via the API. However, passion *profiling results* (an individual's specific passion map, trigger conditions, and vulnerability patterns) must never be exposed via any API endpoint."

Philosophical mode is compliant because:

1. **Per-response only.** Each philosophical-mode response is the engine's assessment of one submitted input. The output describes findings about THAT submission, not patterns across the user's history. R17e's prohibited surface — the passion *profiling results* — is the aggregation; philosophical mode is the per-response rendering.
2. **No cross-submission aggregation appears in the rendering.** `iterative_refinement` fields are excluded. No "your typical pattern is X." No "you've had this detected N times." No comparisons to other users or to prior submissions.
3. **The user is the subject of the evaluation.** Per R17a (bulk profiling prevention), only the subject of the evaluation (or their authorised agent) submits content. Philosophical mode's API endpoint inherits the substrate's authentication discipline — third parties cannot submit content about user X.
4. **Public Stoic content is retrieval-safe.** Per R17e's express allowance, the Stoic corpus passages (retrieved via the Source Material section) are explicitly available as philosophical reference — they're framework content, not profile content.
5. **Aggregation surfaces are governed separately.** The user's journal dashboard, mentor profile hub, history page — those surfaces aggregate philosophical-mode responses into patterns. They are governed by R17a/b/c/d separately. Philosophical mode itself does not surface aggregations; it just produces one rendering per submission.

---

## Cross-mode relationships

| Concern | Agent mode | Philosophical mode | Standard mode (future) | Educational mode (future) |
|---|---|---|---|---|
| Primary consumer | Software agent | Human inspector (founder, auditor, learner) | Human practitioner (today's sagereasoning.com) | Human learner |
| Prose composition | None | None | LLM-authored with deterministic fallback | TBD |
| Source material | No | **Yes** (3 retrieved passages) | TBD | TBD |
| Score scalar | Yes | Yes (per-response only) | TBD | TBD |
| Score vector | Yes | Yes | TBD | TBD |
| iterative_refinement fields | Yes (as confidence + validity) | **No** (excluded) | TBD | TBD |
| Format | JSON (canonical) + compact prose | JSON + markdown text + HTML (v2) | Markdown text (current) | TBD |
| Mandatory wraps | All six | All six | All six | All six |
| Determinism | Fully deterministic | Structured content deterministic; retrieved passages deterministic given retrieval inputs (BM25 + vector + RRF are deterministic) | Currently LLM-authored (non-deterministic prose); deterministic fallback when LLM fails | TBD |

---

## Worked example

See the example rendered in chat 2026-05-14 during the scoping session — the team-channel-checking scenario rendered in full philosophical-mode format. The example demonstrates: per-section glossing, empty-field omission, the Verdict / Vector / Scalar / Fields / Source Material / Wraps ordering, the score vector as a markdown table, the source material section with three keyed passages, and all six mandatory wraps in position.

When this spec moves from Draft to Adopted, the worked example should be reproduced inline here (with the actual retrieve-passages output substituted for the illustrative quotes used in the chat example).

---

## Layer 1 input fields

Philosophical mode requires **no new Layer 1 input fields**. It is a per-response rendering on the standard Layer 1 input; the `prose_mode` parameter selects philosophical mode at Layer 3, with no Layer 1 change.

The four-mode work surfaced eight Layer 1 input field additions in total — none from philosophical mode, none from standard mode, four from private mode (`subject_identity_binding`, `reflective_self_report`, `history_window`, `topic_signal`), four from the Sage Assent Wrapper (`carried_profile`, `profile_provenance`, `peer_agent_assessments`, `objective_function_declaration`). The consolidated set and the build approach are carried in the Layer 1 code-changes next-session prompt (`/operations/handoffs/founder/2026-05-14-layer1-schema-additions-NEXT-SESSION-PROMPT.md`).

---

## Cross-references for the future build session

- `/manifest.md` §R3 / §R4 (IP boundary distinction from R17) / §R8a (controlled-vocabulary glossing) / §R17 (full intimate-data protection rules) / §R18a / §R18e / §R19c / §R19d / §R20a / §AC1 / §AC2 / §AC4 / §AC9 / §AC10 / §AC11
- `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — companion spec; shares mandatory wraps, Layer 2 source, score architecture
- `/adopted/substrate-plugin-staging-plan.md` §A6 row (currently scoped as "prose_mode parameter"; this spec re-scopes A6's "clinical" sub-mode and renames it "philosophical")
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — the existing per-consumer Layer 3 prose template; philosophical mode does NOT use this — it bypasses LLM composition entirely)
- `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (J1 ADR — Character Kernel category label injected via R18a wrap)
- `/website/src/lib/substrate/layer3-service.ts` (A5 service — philosophical mode would dispatch from `applyLayer3Injections` based on `prose_mode` value; build session decides whether to extend layer3-service.ts in place or introduce a dedicated `philosophical-mode-service.ts`)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` (existing prose generator; philosophical mode replaces this with deterministic field rendering rather than calling it)
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (source of `Layer2Assessment` shape — the structured data philosophical mode projects)
- `/website/src/lib/rag/retrieve-passages.ts` — the canonical source-material retrieval system; philosophical mode calls this directly per Option A
- `/website/src/app/dashboard/page.tsx` line 455 — the `widthMap` that translates qualitative dimension levels (`emerging / developing / established / advanced`) into bar widths (25/50/75/100%) for visual rendering in the private mentor hub; reference for the build session as the existing example of qualitative-to-visual translation
- `/operations/agentic-commerce-findings-downstream-order.md` §F3 (Layer3Response as substrate-consultation-mandate producer — philosophical mode is the human-readable rendering of the mandate projection)

---

## Open questions deferred to build

1. **Where does the dispatcher live?** Build session decides: extend `layer3-service.ts` in place with a mode-aware `proseTemplate(mode, fields)` function that branches between agent / philosophical / standard / educational modes, OR introduce dedicated mode services alongside the existing service. The mandatory-injection layer (R3 / R19c / R19d / R20a / R18a / R18e) is shared regardless. The companion agent-mode spec has the same open question.
2. **Retrieve-passages performance budget.** A retrieve-passages call adds latency. Hybrid BM25 + vector + RRF is fast (typically <200ms), but it's a database call. The build session decides whether retrieve-passages happens in the synchronous response path or whether the response can stream (retrieve-passages completing after the structured content has been delivered to the consumer). Per PR3 (Safety Systems Are Synchronous), the safety-classifier path is synchronous-only; the retrieve-passages call is NOT a safety-critical function, so a streaming option is permissible.
3. **Source material composition framing.** The three contextual framings ("On phobos at the synkatathesis stage", "On the correction of false judgements...", "On the indifferents and others' regard") are illustrative in the example. The build session designs the deterministic composition logic that selects framings from the assessment's principal findings. Options: keyed framing tables (similar to the existing `MECHANISM_LABELS` in `layer3-prose.ts`); rule-based selection from the assessment's content; or LLM-composed framings (which would make this mode partially LLM-dependent — a divergence from the determinism property).
4. **HTML v2 visual identity.** When the HTML rendering ships, the concentric-circle target visualisation needs a logo set (4 root passions + sub-species + 4 virtues + 5 oikeiosis circles + 4 causal stages + 5 proximity levels + 4 indifferent treated-as states + direction-of-travel arrows + eupatheiai when surfaced = roughly 50-60 distinct visual assets). Separate design effort, likely requiring a designer engagement before HTML build can ship.
5. **Iterative_refinement exclusion implementation.** The build session implements the exclusion of `direction_of_travel`, `senecan_grade`, `progress_dimensions`, `motivation_classification` as a filter at the rendering layer (the JSON still carries these fields from Layer 2; the rendering layer drops them). Alternative: render-time conditional that branches on prose_mode. Build session designs the filter discipline.
6. **Authentication discipline.** The build session confirms that philosophical-mode API calls inherit the substrate's existing authentication patterns (only the subject of the evaluation submits content). If philosophical mode is exposed via a new API surface, R17a (bulk profiling prevention) requires the build to follow the Critical Change Protocol per R17f.
7. **Worked-example regeneration.** When the build session lands, the worked example in this spec should be regenerated from the actual `retrieve-passages.ts` output rather than the illustrative quotes used in the chat example. The build session confirms the example renders as expected.
8. **Test fixture strategy.** Build session designs the test cases verifying: per-section glossing, empty-field omission, ordering, score-component-vector rendering, source material retrieval and rendering, mandatory wraps, R17e profile-data exclusion (test that direction_of_travel etc. never appear in output).

---

## Markdown formatting convention

**Confirmed 2026-05-14:** Markdown is the convention for the text rendering. Specifically:

- `#` / `##` / `###` for section headers
- `**bold**` for field labels and key terms
- Markdown tables for the Score vector breakdown
- `> blockquote` for source material passages
- `*italic*` for emphasis (Greek terms within prose; quoted passage text)
- `—` em-dash for citation lines
- `---` horizontal rules between major sections

Renders beautifully in markdown-aware consumers (the website, modern email clients, GitHub-flavoured renderers) and degrades gracefully to plain text in simple consumers (the markdown syntax remains readable even when un-rendered).

---

*End of spec. Status: Adopted 2026-05-14 (document); Designed (implementation). Build session deferred. Authored 2026-05-14 in scoping/exploration session; adopted 2026-05-14 under D-FOUR-MODE-SPECS-ADOPTED-2026-05-14. The four-mode taxonomy is agent (now the Sage Assent Wrapper) / philosophical / standard / private; the superseded agent-mode spec is preserved at `/archive/2026-05-14_agent-mode-response-spec-superseded.md`.*
