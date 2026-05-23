# Standard-Mode Response Specification

**Status:** **Adopted 2026-05-14** under `D-FOUR-MODE-SPECS-ADOPTED-2026-05-14` — moved `/drafts/` → `/adopted/substrate-modes/`. **Implementation status:** Designed (per 0a vocabulary) — the mode is specified, not built; the build session is deferred. (Decision status `Adopted` and implementation status `Designed` are distinct 0a taxonomies, stated separately per the standing cache's Element 7.)
**Stream:** founder.
**Name:** "standard" — retained (founder decision 2026-05-14). The name signals the default mode for the default consumer.
**Supersedes scope:** the "standard" mode entry in the original A6 row of `/adopted/substrate-plugin-staging-plan.md`. The original A6 prompt framed standard mode as "keep byte-identical to today's `/api/reason` output" — a regression-guard. This specification **re-scopes** standard mode: it is no longer byte-identical to today's LLM-composed three-field prose. It adopts philosophical mode's structure (deterministic field rendering + source material + mandatory wraps), adds a Summary Response digest at the top, replaces Greek with plain English, and folds in the prose disciplines from today's `/api/reason`. This is a deliberate scope change made during the 2026-05-14 scoping session.
**Companion specs:** `/archive/2026-05-14_agent-mode-response-spec-superseded.md` ("terse → agent"), `/adopted/substrate-modes/philosophical-mode-response-spec.md` ("clinical → philosophical"). All three share the mandatory wraps, the Layer 2 source, the per-response-only discipline (R17e), and the reflection component handling. Standard mode is closest to philosophical mode structurally — it IS philosophical mode with Greek replaced by English, observational tone, and a Summary Response added on top.
**F3 fold-in (per `/operations/agentic-commerce-findings-downstream-order.md`):** The standard-mode response shape is the plain-English human-readable rendering of the Layer3Response substrate-consultation-mandate (R3 + R19c + R19d + R20a + R18a + R18e injections + AC9/AC10/AC11 projections + verdict + score + Layer 2 fields).

---

## Purpose

**Standard mode** is the substrate's output for the **human practitioner reading sagereasoning.com directly** — the default consumer, the only consumer operating today. The practitioner wants to understand their own reasoning, in plain language, without needing a background in Stoic philosophy or in the substrate's internal vocabulary.

The defining property: **the average standard user wants the digest, not the full assessment.** Standard mode opens with a four-sentence **Summary Response** that conveys the deterministic finding clearly and connects it to the raw input. Everything below the Summary is "additional detail" — the full field-by-field rendering, the score, the source material — there for the user who wants to go deeper, skippable for the user who does not.

Standard mode differs from its companions:

- **Agent mode** produces structured decision-support for software agents
- **Philosophical mode** produces a transparency surface for inspectors, in the framework's own (Greek) vocabulary
- **Standard mode** produces a plain-English digest-plus-detail for human practitioners — philosophical mode's structure, made accessible

---

## Output formats

Three renderings produced from one source-of-truth JSON payload:

| Format | Status | Consumer |
|---|---|---|
| **JSON** | v1 — first build | Machine consumers; canonical source-of-truth; renders into the text + HTML formats |
| **Markdown text** | v1 — first build | Human practitioners reading on sagereasoning.com (the default consumer) |
| **HTML** | v2 — separate build effort, website-only initially | Eventual graphical representation; same data the text rendering renders textually |

The JSON is canonical. Text and HTML are presentation layers. The **source material** section appears in the text and HTML renderings only — NOT in the JSON (per the same rule as philosophical mode). The mandatory wraps appear in all three formats.

---

## Section ordering

The text and HTML renderings follow this order:

1. **Mandatory opening wrap (R3 disclaimer)** — always present
2. **Title + Input observed** — one-paragraph summary of what the substrate received and how it characterises the situation
3. **Summary Response** — the four-sentence digest (see below). The part the average user reads.
4. **Verdict** — kathekon outcome, quality, justification source. The first section of "additional detail."
5. **Score breakdown** — component-level table (philosophical mode's "Score vector", de-jargoned label)
6. **Overall score** — the composite scalar (philosophical mode's "Scalar score", de-jargoned label)
7. **Field-by-field rendering** — Layer 2 sections, in this order:
   a. Passion diagnosis
   b. Control filter
   c. Circles of concern (the de-jargoned label for oikeiosis)
   d. Value assessment
   e. Appropriate-action assessment (the de-jargoned label for kathekon assessment; raw `quality` + `justification` fields, separate from the Verdict section per the philosophical-mode precedent)
   f. Proximity to right action (de-jargoned label for katorthoma proximity)
   g. Virtues engaged
   h. Improvement path (when `improvement_path_structured` non-null)
   i. Open deferrals (the reflection component — when any fired; see below)
   j. Stage scores (only non-`not_applied` stages)
   k. Hasty-assent risk
   l. Ambiguity notes (when non-empty)
8. **Source material** — three retrieved Stoic passages keyed to the principal findings
9. **Mandatory closing wraps** — R19c + R19d (when mentor-flavoured) + R18e

A horizontal rule + the line *"Everything below is additional detail. The average reader can stop here."* sits between the Summary Response and the Verdict, marking the digest/detail boundary.

The JSON has the same conceptual sections (excluding source material) as JSON keys.

---

## The Summary Response

A **four-sentence digest** sitting between Input observed and Verdict. It is the part the average standard user reads. Structure:

| Sentence | Carries | Deterministic source |
|---|---|---|
| 1 — **Finding** | The principal finding: what passion, where lodged, what false judgement | `passion_diagnosis` + `value_assessment` |
| 2 — **Orientation** | What falls within the submitter's control vs outside it | `control_filter` |
| 3 — **Correction** | The judgement to substitute | `improvement_path_structured` |
| 4 — **The work** | The specific, actionable closing move | `improvement_path_structured` + `MECHANISM_ACTION_CLOSING` template (deterministic base); raw input text (LLM rephraser) |

When an open deferral fired (reflection component — see below), an additional sentence appears mid-Summary, between the Correction and the work, naming the principled withholding. The Summary then runs five sentences. The "work" sentence always closes (closing-line discipline).

### The rephraser architecture (founder decision 2026-05-14)

The Summary Response is **LLM-rephrased from a deterministic base** — not LLM-composed from the assessment. This is the load-bearing design decision, made to satisfy the constraint: *the LLM must not introduce Stoic advice, and the guarantee must hold even if future models weaken or remove temperature controls.*

Four-step architecture:

1. **The deterministic engine produces all four (or five) Summary sentences first.** Composed from the structured Layer 2 fields using keyed templates — the same pattern as the existing `generateFallbackProse` in `layer3-prose.ts`. This deterministic Summary is complete and correct on its own. It is the source of truth.
2. **The LLM receives three inputs:** the raw user input text, the Layer 2 assessment, and the deterministic Summary sentences. Its only task is to rephrase the deterministic sentences into clearer, more natural prose that connects the finding to the user's actual words. It is explicitly forbidden from adding any claim, concept, or Stoic term not already present in its inputs.
3. **A grounding validator checks the LLM output** before it is used. The validator scans the rephrased text for Stoic vocabulary — every passion name, virtue name, mechanism term, concept — and confirms each appears in either the deterministic Summary sentences or the Layer 2 assessment. Any term the LLM introduced that is absent from both is a **contract violation**.
4. **Deterministic fallback fires on failure OR violation.** LLM call fails → deterministic Summary used. LLM call succeeds but the grounding validator catches ungrounded content → deterministic Summary used. The user always receives a correct Summary; the LLM only ever improves phrasing when it stays in bounds.

**Why this is robust to the founder's concern:** even if a future model ignores temperature settings entirely, it cannot introduce Stoic advice into the output, because (a) its input is a finished deterministic Summary, not free rein over the assessment, and (b) the grounding validator rejects any output containing concepts absent from its inputs. The determinism guarantee moves from "the model was instructed not to" to "the architecture forbids it." The temperature setting becomes a nice-to-have, not a load-bearing guardrail.

**No softening.** Because the LLM rephrases a *fixed* deterministic finding rather than composing freely, it cannot soften the finding — the finding is locked in its input. It can only make it clearer and more specific to the user's words. This satisfies the founder's requirement (2026-05-14): the Summary conveys the deterministic finding clearly as it relates to the raw text input, without softening of intent.

### Implications

- **Standard mode is not fully deterministic.** The Summary Response introduces one LLM touchpoint. This is a deliberate design choice — the LLM earns its place specifically for input-specific clarity and actionability. The field-by-field detail below the Summary IS fully deterministic.
- **Model selection (AC1 / PR4).** The rephraser call produces a short output (4-5 sentences) but reasons over three inputs (raw text + assessment + deterministic Summary). Whether this sits within Haiku's reliability boundary or requires Sonnet is a build-session decision per AC1. Today's `/api/reason` uses Sonnet for full composition; a rephrase-only call may be within Haiku's boundary, cutting cost.
- **Cost (R5).** Today's `/api/reason` = one full Sonnet composition per call. Standard mode = one bounded rephrase call (possibly Haiku). Likely cheaper per call. Confirm against R5 cost-as-health-metric at build.
- **Latency (AC2 / PR3).** The rephrase call is synchronous (it is in the Summary the user reads first). It is NOT a safety-critical function, so PR3 does not forbid streaming, but the Summary reads better delivered whole. One LLM round-trip added.

---

## Greek → English translation

Standard mode replaces Greek and Stoic-technical terms with plain English. Founder decision 2026-05-14: for the four terms with no clean single-word translation, use the best approximate English and accept the lost nuance.

| Greek / Stoic term | Standard-mode English | Notes |
|---|---|---|
| phantasia | impression | Clean |
| synkatathesis | assent | Clean; glossed on first use per section |
| horme | impulse | Clean |
| praxis | action | Clean |
| phobos | fear | Clean |
| epithumia | craving | Clean |
| hedone | pleasure | Clean |
| lupe | distress | Clean |
| philodoxia | desire for recognition | Paraphrase |
| agonia | anguished anxiety | Established gloss |
| chara | rational joy | Paraphrase |
| eupatheia | rational affection | Paraphrase |
| phronesis | practical wisdom | Clean |
| dikaiosyne | justice | Clean |
| andreia | courage | Clean |
| sophrosyne | self-control | "Self-control" reads more accessibly than "temperance" |
| axia | worth | Clean |
| **prohairesis** | **moral choice** | Approximate — loses "the faculty that chooses" nuance |
| **kathekon** | **appropriate action** | Approximate — loses "accords with nature with reasonable justification" nuance |
| **katorthoma** | **right action** | Approximate — "perfect action" would overpromise |
| **oikeiosis** | **circles of concern** | Approximate — loses "the natural extension of self-concern outward" nuance |

Section labels are de-jargoned to match: "oikeiosis" section → "Circles of concern"; "kathekon assessment" section → "Appropriate-action assessment"; "katorthoma proximity" section → "Proximity to right action"; "Score vector / Scalar score" → "Score breakdown / Overall score". The title is "Stoic Reasoning Assessment" (drops "Layer 2" and "Rendering").

---

## English-but-technical Stoic terms

A tier of terms are English words used in specific Stoic senses — *passion*, *assent*, *impression*, *impulse*, *indifferent*, *virtue*, *vice*, *honourability*, *advantageousness*. These differ from everyday usage (a "passion" is not just a strong feeling; an "indifferent" is not just something one does not care about).

Founder decision 2026-05-14: **keep these terms, gloss lightly on first use per section.** Example glosses from the worked example:

- "A *passion*, in the Stoic sense, is a disturbance arising from a false judgement — not simply a strong feeling."
- "An *indifferent*, in the Stoic sense, is something neither good nor evil in itself — it can be preferred or dispreferred, but it does not carry moral weight."

Glossing is per section (the same per-section rule philosophical mode uses for Greek terms): a reader who jumps into a single section sees the technical terms in that section glossed in context. The trade is small repetition for excerpt-friendly readability.

---

## Tone

Founder principle 2026-05-14: *no softening of intent; the rendering should convey clearly the deterministic finding as it relates to the raw text input.*

- **Field-by-field detail:** observational — "the submitter", "the assessment noted", "the principal finding is". Mirrors philosophical mode's structural tone. The detail shows the engine's working.
- **Summary Response:** because it is LLM-rephrased to connect the deterministic finding to the raw input, it leans second-person where it references the user's situation ("your own character", "when the pull to check arrives after the next post"). It states the finding without hedging. The fidelity guarantee (rephraser architecture) is what prevents softening — not the tone choice.

---

## `/api/reason` disciplines folded in

The existing `/api/reason` prose-composition disciplines that improve the rendering, carried forward and adapted to field-by-field rendering:

| Discipline | Carried forward as |
|---|---|
| **Closing-line action-orientation** | The Improvement Path section closes with "**The work:**" — the practitioner-facing move from `MECHANISM_ACTION_CLOSING`. The Summary Response's sentence 4 is also the action-oriented closing line. |
| **Value-error rendering rule** | The Value Assessment section renders the value error as a peer of the principal passion observation, with the criterion-of-good-and-evil framing. |
| **False-judgement framing — criterion of good and evil** | "Only virtue and vice carry moral weight; [the thing] is a preferred/dispreferred indifferent treated as more than it is" — applied in the Value Assessment and Passion Diagnosis renderings. Never applied to the submitter's character as a verdict. |
| **Stage discipline** | Name only the causal stage where the passion is lodged; do not name upstream stages unless the corrective sequence includes them. |
| **Marginal-case sentences** | When `single_snapshot` / `is_kathekon: null` / `EUPATHEIA_BOUNDARY` / `PRAXIS_MOTIVATION_AMBIGUITY` conditions fire, the corresponding sentence renders within the relevant field's section (and within the Summary Response when relevant), never as a closing line. |
| **Sentence-proportion rule** | Does not map directly to field-by-field rendering. Its spirit survives in the Summary Response: the "work" content (correction + action) outweighs the "finding" content (sentences 3+4 vs sentences 1+2). |
| **Greek glossing rules** | Transformed: Greek is replaced by English entirely; the glossing discipline becomes "keep the English plain; gloss English-but-technical terms lightly on first use per section." |

---

## Reflection component (principled withholding)

Layer 2 includes a principled-withholding mechanism. When the Layer 1 input does not include the practitioner's reflective self-report — their own account of what was operative for them — Layer 2 does not guess at the classifications that depend on that self-report. It withholds them deliberately and records the withholding in an `OpenDeferralEntry`.

Each `OpenDeferralEntry` carries a `withheld_classification` object:

- `field_path` — dot-path into the `Layer2Assessment` naming which classification was withheld
- `withheld_at_position` — where in the process the withholding happened
- `reason` — why the classification could not be determined from the input given

The two Tier 3 triggers are `PRAXIS_MOTIVATION_AMBIGUITY` (withholds the motivation classification — virtue vs convention) and `EUPATHEIA_BOUNDARY` (withholds the eupatheia classification — genuine rational affection vs polished surface over passion).

This is principled withholding, not failure: the engine declining to flatten what it genuinely cannot determine from the input it was given.

**Standard-mode rendering — two places:**

1. **In the Summary Response.** When an open deferral fired, the reflection observation appears as an additional sentence mid-Summary (between the Correction sentence and the "work" sentence — never as the closing line, preserving the closing-line discipline). Because the whole Summary Response is LLM-rephrased with the grounding validator and deterministic fallback, the reflection observation inherits that exact architecture — the deterministic engine composes the reflection sentence; the LLM may rephrase it; the grounding validator confirms it introduced nothing; the deterministic version is used on failure or violation. The reflection sentence is itself a Stoic-grounded statement of withholding, so the grounding validator treats its concepts as part of the deterministic base.
2. **In the field-by-field detail.** The "Open deferrals" section renders deterministically with the full `withheld_classification` structure shown — `field_path`, `withheld_at_position`, `reason`. The reader sees exactly what the engine declined to determine and the precise reason. Omitted entirely when no open deferral fired (empty-field omission rule).

---

## Excluded fields

Same as philosophical mode. The following Layer 2 fields do not appear in standard mode at all, per the R17e profile-data discipline:

| Field | Reason |
|---|---|
| `iterative_refinement.direction_of_travel` | Cross-submission profile data — comparing this submission to prior submissions is profile-level, not per-response |
| `iterative_refinement.senecan_grade` | Trajectory grade across submissions; profile-level |
| `iterative_refinement.progress_dimensions` | Progress-over-time observations; profile-level. (Note: these are the qualitative buckets — `emerging / developing / established / advanced` — that the private mentor hub renders as percentage bar-widths; they are not numeric in the Layer 2 output.) |
| `iterative_refinement.motivation_classification` | Score-validity flag retained for the score's PROVISIONAL gating; raw value does not render |
| `score_confidence` | Derived from `direction_of_travel`; excluded by the same reasoning |

`precision_band` stays (about internal score-component uncertainty, not trajectory). No cross-submission aggregation, profile-level metrics, trigger maps, contradiction maps, or developmental timelines appear — each standard-mode response is about one submission in isolation.

---

## Empty-field omission

Founder decision 2026-05-14: empty / null / not-applied fields are omitted entirely from the text and HTML renderings (no "Open deferrals: none" lines). The JSON preserves all fields with explicit null / empty values for machine consumers.

Sections subject to omission when empty: Soft clarifications, Open deferrals, Improvement path, Distress signal, Ambiguity notes, individual `not_applied` stages within Stage scores. The Summary Response, Verdict, Score breakdown, Overall score, and the principal Layer 2 fields appear in every response.

---

## Score handling

Same score architecture as agent mode and philosophical mode (kathekon as gate; component score; quality multiplier; precision band). See `/archive/2026-05-14_agent-mode-response-spec-superseded.md` §"Component score" for the full specification.

Standard-mode rendering specifics:

| Item | Standard mode |
|---|---|
| Score scalar | Rendered in the "Overall score" section. Safe under R17e (per-response result, not profile data). |
| Score vector | Rendered as a markdown table in the "Score breakdown" section. |
| Cap notation | When capped (contrary kathekon → 35; PROVISIONAL → 50), the score line includes "(CAPPED — reason)" in plain English ("contrary to appropriate action", not "contrary kathekon"). |
| Confidence field | Excluded (derived from `direction_of_travel`). |
| Precision band | Rendered. |

The score sits in the "additional detail" zone below the Summary Response. The average user reads the Summary; the user who wants the number scrolls to it.

---

## Source material

Same mechanism as philosophical mode (Option A — Layer 3 calls `retrieve-passages.ts` directly; `top_k: 3`; passages keyed to the principal findings; rendered at the closing of the report before the mandatory closing wraps; JSON-excluded). See `/adopted/substrate-modes/philosophical-mode-response-spec.md` §"Source material section" for the full retrieve parameters and rendering shape.

The one difference: the contextual framing lines above each passage use plain English ("On fear at the assent stage", not "On phobos at the synkatathesis stage").

---

## Mandatory wraps

All six mandatory injection rules from `layer3-service.ts` apply identically in standard mode, in the same positions as philosophical mode: R3 (opening), R19c + R19d-when-mentor-flavoured + R18e (closing), R20a (replaces the field-by-field content when distress signal active), R18a (title block when category-framing requested). Non-negotiable per the manifest.

---

## R17 compliance

Standard mode is compliant with R17e for the same reasons philosophical mode is — see `/adopted/substrate-modes/philosophical-mode-response-spec.md` §"R17 compliance". In brief: per-response only; no cross-submission aggregation; `iterative_refinement` excluded; the user is the subject of the evaluation; retrieved Stoic passages are public framework content; aggregation surfaces (journal dashboard, mentor hub) are governed separately by R17a/b/c/d.

One standard-mode-specific note: the Summary Response's LLM rephraser receives the raw input text. The raw input is the user's own submission — already known to the user. The rephraser does not retain it, aggregate it, or expose it beyond the single response. The grounding validator ensures the rephraser adds nothing; it does not cause the rephraser to leak anything. No new R17 surface is created by the rephraser.

---

## Cross-mode relationships

| Concern | Agent mode | Philosophical mode | Standard mode |
|---|---|---|---|
| Primary consumer | Software agent | Human inspector (founder, auditor, learner) | Human practitioner (sagereasoning.com default) |
| Vocabulary | Structured field names | Greek + Stoic-technical, glossed | Plain English; Greek replaced; technical-English glossed |
| Digest at top | No (structured throughout) | No | **Yes — the four-sentence Summary Response** |
| Prose composition | None | None | **LLM-rephrased Summary** (deterministic base + grounding validator + deterministic fallback); field detail deterministic |
| Source material | No | Yes (3 retrieved passages) | Yes (3 retrieved passages) |
| Score scalar + vector | Yes | Yes | Yes (in "additional detail" zone) |
| `iterative_refinement` fields | Yes (as confidence + validity) | No (excluded) | No (excluded) |
| Reflection component | `open_questions` field, `withheld_classification` verbatim | Own field section, full `withheld_classification` | Summary sentence (when fired) + own field section |
| Tone | N/A (structured) | Observational | Observational detail; second-person-leaning Summary |
| Determinism | Fully deterministic | Fully deterministic (structured content); retrieved passages deterministic given inputs | Field detail deterministic; Summary has one LLM touchpoint with deterministic fallback |
| Format | JSON + compact prose | JSON + markdown text + HTML (v2) | JSON + markdown text + HTML (v2) |
| Mandatory wraps | All six | All six | All six |

---

## Worked example

See `/adopted/substrate-modes/standard-mode-example.md` — the team-channel-checking scenario rendered in full standard-mode format, reviewed and approved during the 2026-05-14 scoping session. The example demonstrates: the Summary Response (LLM-rephrased version shown), the digest/detail boundary line, Greek replaced with English, technical-English terms glossed per section, observational field detail, the `/api/reason` disciplines folded in, de-jargoned section labels, the score in the additional-detail zone, source material at closing, all six mandatory wraps, `iterative_refinement` excluded, empty fields omitted.

The example's scenario does not fire an open deferral, so the reflection component is not shown in the rendered body — the example file's header notes what it would look like if `PRAXIS_MOTIVATION_AMBIGUITY` had fired.

When this spec moves from Draft to Adopted, the worked example should be reproduced inline here (with the actual `retrieve-passages.ts` output substituted for the illustrative quotes, and the deterministic-base version of the Summary shown alongside the LLM-rephrased version for contrast).

---

## Flagged manifest item

The **grounding validator** requirement is substantial enough to warrant its own manifest architectural constraint. Proposed language (for a governance session, not to be slipped in casually):

> *LLM rephrasing of deterministic substrate content must be grounding-validated. The LLM may not introduce concepts absent from the deterministic source. A grounding-validation failure triggers the deterministic fallback. This guarantee must not depend on temperature settings or prompt instructions alone.*

This would be an Elevated-risk manifest amendment. It is flagged here as a governance-session item. The standard-mode build can proceed with the grounding validator as a spec-level design requirement; promoting it to a manifest constraint is a separate founder decision. Recorded here so the requirement is not lost.

---

## Layer 1 input fields

Standard mode requires **no new Layer 1 input fields**. It is a per-response rendering on the standard Layer 1 input; the `prose_mode` parameter selects standard mode at Layer 3, with no Layer 1 change. (The Summary Response's LLM rephraser receives the raw input text — but that is the standard Layer 1 input, not a new field.)

The four-mode work surfaced eight Layer 1 input field additions in total — none from standard mode, none from philosophical mode, four from private mode (`subject_identity_binding`, `reflective_self_report`, `history_window`, `topic_signal`), four from the Sage Assent Wrapper (`carried_profile`, `profile_provenance`, `peer_agent_assessments`, `objective_function_declaration`). The consolidated set and the build approach are carried in the Layer 1 code-changes next-session prompt (`/operations/handoffs/founder/2026-05-14-layer1-schema-additions-NEXT-SESSION-PROMPT.md`).

---

## Cross-references for the future build session

- `/manifest.md` §R3 / §R4 (IP boundary) / §R5 (cost; free-tier full-output rule) / §R8a (controlled-vocabulary glossing — transformed for standard mode) / §R17 (intimate-data protection) / §R18a / §R18e / §R19c / §R19d / §R20a / §AC1 (model selection for the rephraser) / §AC2 (latency) / §AC4 / §AC9 / §AC10 / §AC11
- `/archive/2026-05-14_agent-mode-response-spec-superseded.md` — companion spec; shares the score architecture, mandatory wraps, Layer 2 source, reflection component
- `/adopted/substrate-modes/philosophical-mode-response-spec.md` — companion spec; standard mode IS this spec's structure with Greek replaced by English + a Summary Response added
- `/adopted/substrate-modes/standard-mode-example.md` — the reviewed worked example
- `/adopted/substrate-plugin-staging-plan.md` §A6 row — the original "standard" sub-mode entry this spec re-scopes
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — today's `/api/reason` prose template; standard mode adapts its disciplines but replaces its LLM-composition approach with field rendering + LLM-rephrased Summary)
- `/website/src/lib/substrate/layer3-service.ts` (A5 service — standard mode would dispatch from `applyLayer3Injections` based on `prose_mode` value)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` — the existing prose generator; standard mode reuses its deterministic-composition patterns (`generateFallbackProse`, `MECHANISM_ACTION_CLOSING`, `PROXIMITY_REFLECTION`, etc.) for the Summary Response's deterministic base, and reuses its `LAYER3_SYSTEM_PROMPT_API_REASON` disciplines (adapted) — but adds the LLM-rephraser-with-grounding-validator layer
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (source of `Layer2Assessment` shape, including `OpenDeferralEntry` + `withheld_classification` for the reflection component)
- `/website/src/lib/rag/retrieve-passages.ts` — the source-material retrieval system (Option A)
- `/operations/agentic-commerce-findings-downstream-order.md` §F3

---

## Open questions deferred to build

1. **Dispatcher location.** Same open question as the companion specs: extend `layer3-service.ts` in place with a mode-aware dispatcher, or introduce dedicated mode services. The mandatory-injection layer is shared regardless.
2. **Rephraser model selection.** Haiku or Sonnet for the Summary Response rephrase call. Per AC1: short output favours Haiku; three-input reasoning may require Sonnet. Build session decides and documents per PR4.
3. **Grounding validator implementation.** How does the validator scan for "Stoic vocabulary the LLM introduced"? Options: a controlled-vocabulary checklist (every term in the R8a list + every term in the assessment + every term in the deterministic Summary = the allowed set; anything else = violation); an LLM-based second-pass check; a hybrid. The controlled-vocabulary checklist is the most deterministic and the most robust to the founder's "temperature guardrails removed" concern. Build session designs it.
4. **Deterministic-base composition for the Summary.** The deterministic engine must compose the four (or five) Summary sentences from the Layer 2 fields. The existing `generateFallbackProse` composes the longer three-field prose; the Summary Response needs a tighter, four-sentence composition. Build session designs the keyed templates.
5. **Rephraser prompt design.** The system prompt for the rephrase call must be strict: rephrase only, introduce nothing, connect to the raw input, no softening. Build session writes it, building on the existing `LAYER3_SYSTEM_PROMPT_API_REASON` composition-contract language but adapted from "compose" to "rephrase".
6. **Reflection component in the Summary.** When an open deferral fired, the deterministic engine composes the reflection sentence; the rephraser may rephrase it. Build session confirms the grounding validator treats the reflection sentence's concepts as part of the deterministic base (so a faithful rephrase is not flagged as a violation).
7. **HTML v2.** Same as philosophical mode — concentric-circle target visualisation, logo set, separate design effort.
8. **Test fixture strategy.** Build session designs tests verifying: the rephraser architecture (deterministic base correct; LLM rephrase grounded; validator catches violations; fallback fires on failure and on violation); Greek-replacement completeness (no Greek term leaks into output); technical-English glossing per section; empty-field omission; the digest/detail boundary; `iterative_refinement` exclusion; the reflection component rendering in both places.

---

## Markdown formatting convention

Confirmed 2026-05-14: markdown for the text rendering — `#`/`##`/`###` headers, `**bold**` field labels, markdown tables for the Score breakdown, `> blockquote` for source passages, `*italic*` for emphasis and quoted text, `—` em-dash for citations, `---` horizontal rules between major sections (including the digest/detail boundary rule). Renders well in markdown-aware consumers; degrades gracefully to readable plain text.

---

*End of spec. Status: Adopted 2026-05-14 (document); Designed (implementation). Build session deferred. Authored 2026-05-14 in scoping/exploration session; adopted 2026-05-14 under D-FOUR-MODE-SPECS-ADOPTED-2026-05-14. All four modes of the taxonomy are now specified and adopted: philosophical / standard / private / the Sage Assent Wrapper.*
