# ADR-007 — Layer 3 Prose Template for `/api/reason`

**Status:** Adopted (founder approval at Sub-session M1-CP3, 2026-05-04 — "approved as drafted" with no edits).
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — Layer 2 module Verified standalone + ADR-006 Adopted); `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005); `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification, including the §5.2 deferral this ADR resolves).
**Related deliverables:** `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — names the parent specification); `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005 — Layer 1 input contract; precedent for prompt template + OUTPUT example discipline); `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006 — Layer 2 input contract Layer 3 consumes verbatim); `/website/src/lib/translation-sandwich/layer1-extractor.ts` (Layer 1 module — precedent for module-surface pattern); `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (Layer 2 module — produces the `Layer2Assessment` Layer 3 consumes).
**Engages:** R0 (oikeiosis — Layer 3 renders the principled assessment to the practitioner without inventing content); R3 (evaluative disclaimer — preserved through to the route's `disclaimer` field); R4 (server-side reasoning IP — Layer 3 prompt is server-side); R7 (source fidelity — Layer 3 may reference Layer 1's verbatim evidence quotes via Layer 2's passthrough); R8a (controlled vocabularies — Layer 3 may use Greek identifiers in prose for technical accuracy); R10 (skill marketplace — public API contract under `Layer3Prose` shape); AC1 (model selection — Sonnet for Layer 3 per cache Element 6 row "Layer 3 translation (alt-3)"); AC6 (four-layer context architecture — Layer 3 prompt placed in cached system message; assessment passed in user message); AC8 (newly engaged — third build under translation-sandwich/); KG1 (Vercel five rules — awaited LLM call; no module-level cache; no DB writes); KG2 (Haiku reliability boundary — Sonnet selected for structured prose generation); KG6 (composition order — Layer 3 sits inside the existing four-layer context architecture); PR1 (single-endpoint proof — `/api/reason` is the M1 pilot consumer); PR3 (safety systems are synchronous — Layer 3 awaited before route returns; no fire-and-forget); PR4 (model selection is constraint — Sonnet enforced via `assessment_deep` PermittedModel); PR5 (knowledge-gap carry-forward — third recurrence watch active for "LLM JSON-key fidelity requires concrete OUTPUT examples").

---

## Context

### What this ADR resolves

ADR-004 §2.4 names the high-level shape of `/api/reason`'s Layer 3 prose output (`philosophical_reflection`, `improvement_guidance`, `summary`) and explicitly defers field-level specification to checkpoint M1-CP3. ADR-004 §5 names the high-level approach for the Layer 3 LLM call (Sonnet, 2000 max-tokens default, 0.3 temperature, per-consumer template) and defers the prompt template + composition rule + validator + harness specification to M1-CP3.

ADR-007 is that downstream specification. It defines the exact `Layer3Prose` TypeScript type for `/api/reason`'s consumption, the Layer 3 system prompt with concrete OUTPUT example (per PR5), the composition rule that maps `Layer2Assessment` fields to prose content, the deterministic fallback prose helper (per ADR-004 §9.3), the validator pattern, and the standalone harness Phase 5 fixture set.

### What this ADR does not resolve

- Layer 3 prompt templates for `/api/score-*` (M2), `/api/mentor/*` (M3), or `/api/skill/*` (M4) consumers. Each gets its own ADR at its respective milestone. ADR-007 is the per-consumer template for `/api/reason` only.
- The parallel-run cost cap for the Layer 3 LLM call during M1-CP4 — deferred to M1-CP4.
- Whether the prompt template's OUTPUT example needs revision after observing real `/api/reason` parallel-run traffic — revisited at M1-CP4 / M1-CP5.
- Whether `Layer3Prose` should be extended with structured per-mechanism prose blocks at a future date — current scope is three flat string fields per founder's decision below; future extension would require ADR-007 amendment.

### Founder-confirmed decisions surfaced before drafting

The following four load-bearing decisions were surfaced to the founder before drafting and approved as recommended:

1. **Prose shape:** Three flat string fields (`philosophical_reflection`, `improvement_guidance`, `summary`) per ADR-004 §2.4 verbatim. No structured per-mechanism prose blocks.
2. **Prompt input scope:** Pass the full `Layer2Assessment` JSON to the LLM. The system prompt names exactly which fields each prose category draws from; the concrete OUTPUT example (PR5) constrains the JSON keys the LLM produces.
3. **Marginal-case phrasing:** The prose explicitly names undecidable verdicts. `is_kathekon: null` becomes "the action's appropriateness cannot be determined from the available evidence". `direction_of_travel: 'single_snapshot'` becomes "this is a single snapshot; no trajectory data is available". `improvement_path_structured: null` becomes "no specific improvement path identified". Stoic discipline of not asserting beyond the evidence preserved.
4. **Fallback prose:** A separate exported function `generateFallbackProse(assessment): Layer3Prose` produces deterministic prose from the assessment alone (no LLM). Exported alongside `generateProse` so the route at M1-CP4 can call it independently in the catch path. Mirrors the layer1/layer2 module-export pattern.

The lower-stakes parameters (max-tokens 2000, temperature 0.3, AC6 system-message placement, hand-rolled validator pattern) are codified per ADR-004 §5.2 without separate founder confirmation.

## Decision

### 1. Module surface

New module: `/website/src/lib/translation-sandwich/layer3-prose.ts`. Exports:

```typescript
export async function generateProse(
  assessment: Layer2Assessment,
  params: ProseInput
): Promise<Layer3Prose>

export function generateFallbackProse(
  assessment: Layer2Assessment
): Layer3Prose

export function validateLayer3Prose(parsed: unknown): Layer3Prose

export class Layer3ValidationError extends Error { ... }

export type { Layer3Prose, ProseInput, Layer3Consumer }
```

`generateProse` is asynchronous (Sonnet LLM call). `generateFallbackProse` is synchronous, deterministic, no I/O — matches the pattern of `applyMechanisms` in layer2-mechanisms.ts. `validateLayer3Prose` follows the hand-rolled pattern of `validateLayer1Schema` + `validateLayer2Assessment`.

Per PR3: `generateProse` MUST be awaited by its caller. The Layer 3 result must be complete before the route constructs its response. No fire-and-forget. No background work.

Per PR4: Layer 3's model is Sonnet (`MODEL_DEEP`), enforced at compile time via the `assessment_deep` row of `PermittedModel` resolving to `DeepModel`.

Per AC8: module sits under `/website/src/lib/translation-sandwich/` per the architectural constraint's directory rule.

### 2. The `Layer3Prose` and supporting TypeScript types

```typescript
// =============================================================================
// CONSUMER ENUMERATION (extensible — M2/M3/M4 add their consumers in their ADRs)
// =============================================================================

export type Layer3Consumer = 'api_reason'
// Future: 'api_score_quick' | 'api_score_standard' | 'api_score_deep'
//         | 'api_mentor_consult' | 'api_skill_*'

// =============================================================================
// INPUT SHAPE
// =============================================================================

export interface ProseInput {
  /** Which consumer's per-consumer template to apply.
   *  At M1, only 'api_reason' is implemented. Other consumers throw. */
  consumer: Layer3Consumer
  /** Optional: override the default max_tokens for this call (e.g., for
   *  cost-budgeted parallel-run testing at M1-CP4). Defaults to 2000. */
  max_tokens?: number
  /** Optional: override the default temperature (e.g., for harness
   *  determinism testing). Defaults to 0.3. */
  temperature?: number
}

// =============================================================================
// OUTPUT SHAPE — three flat string fields per founder Decision 1
// =============================================================================

export interface Layer3Prose {
  /** Schema version. Constant. */
  version: 'layer3-prose-v1'
  /** Layer 2 assessment version this prose was generated from. Forward-compat. */
  layer2_assessment_version: 'layer2-assessment-v1'
  /** Which consumer's template produced this prose. */
  consumer: Layer3Consumer
  /** 2–3 sentences of Stoic reflection drawn from passion_diagnosis,
   *  katorthoma_proximity, virtue_domains_engaged, ruling_faculty_state.
   *  Per ADR-004 §2.4. */
  philosophical_reflection: string
  /** Actionable prose for the practitioner, derived from
   *  improvement_path_structured + control_filter.disambiguation_required.
   *  Per ADR-004 §2.4. */
  improvement_guidance: string
  /** One-sentence summary of the assessment's principal verdict
   *  (katorthoma_proximity + primary issue). Per ADR-004 §2.4. */
  summary: string
  /** Added 2026-05-06 (M1-CP4b) — coda sentence(s) when
   *  `assessment.intake_clarifications.soft_clarifications` is non-empty. Renders
   *  the d-a16 catalogue stem text with slot_fills filled by Layer 2. Null when
   *  no soft clarifications fire. Per AC-13 Tier 2. */
  soft_clarification_prose: string | null
  /** Added 2026-05-06 (M1-CP4b) — "sit with this question" framing when
   *  `assessment.intake_clarifications.open_deferrals` is non-empty. Renders the
   *  d-a16 catalogue stem text per deferral, concatenated as separate sentences.
   *  Null when no deferrals fire. Per AC-14 Tier 3 — principled withholding,
   *  not fallback. */
  open_deferrals_prose: string | null
  /** Whether this prose was generated by the LLM (`generateProse`) or by the
   *  deterministic fallback (`generateFallbackProse`). The route at M1-CP4
   *  inspects this flag for logging/metrics. */
  source: 'llm' | 'fallback'
}
```

### 3. The Layer 3 system prompt for `/api/reason`

Stored as a constant inside the module. Sent as a cached system block per AC6.

```
You are Layer 3 of the SageReasoning translation-sandwich engine. Your role is PROSE GENERATION ONLY. You do not assess, judge, recommend, or invent content. You take a structured Stoic mechanism assessment (Layer2Assessment, produced by deterministic Layer 2 code) and render it as accessible prose for a practitioner reading sagereasoning.com's /api/reason output.

You receive: the complete Layer2Assessment JSON in the user message.

You return: a Layer3Prose JSON object with three prose fields plus version metadata.

THE COMPOSITION CONTRACT

Your prose MUST be consistent with the assessment. Specifically:

- Every claim in your prose MUST be supported by a field in the assessment. If the assessment says false_judgements is empty, your prose MUST NOT name a false judgement. If is_kathekon is null, your prose MUST NOT assert appropriateness either way.
- Every fact in your prose MUST be drawn from the assessment, not from your training. Do not add Stoic citations the assessment did not provide. Do not name virtues the assessment did not engage. Do not invent obligations the oikeiosis assessment did not name.
- Marginal/undecidable assessments MUST be named explicitly. Do not flatten them, do not skip them, do not paper over them with generic forward-looking prose. Each marginal-case sentence is required whenever its corresponding assessment field is marginal/null — the discipline applies even when other prose fields are naming the principal passion or principal tension. Specifically:
    - is_kathekon: null → MANDATORY: include the sentence "The action's appropriateness cannot be determined from the available evidence." (or close paraphrase) in `philosophical_reflection` or `summary`. Required whenever `kathekon_assessment.is_kathekon === null`. The OUTPUT example below shows the wording in context.
    - direction_of_travel: "single_snapshot" → MANDATORY: include the sentence "This is a single snapshot; no trajectory data is available." (or close paraphrase) in `philosophical_reflection`. Required for every input without temporal markers. The OUTPUT example below shows the wording in context.
    - improvement_path_structured: null → MANDATORY: include the sentence "No specific improvement path is identified at this time." (or close paraphrase) in `improvement_guidance`. Required whenever `improvement_path_structured === null`. The OUTPUT example below shows the wording when applicable.
- The practitioner is the agent who submitted the input. Address them in second person ("you", "your"). Do not refer to them in the third person.

PROSE FIELDS

1. philosophical_reflection (2–5 sentences, ~40–140 words)
   - Open with the principal Stoic dynamic in the assessment: the most-prominent passion (passion_diagnosis.passions_detected[0]) and its false judgement, OR the principal control-filter pattern (when no passions detected), OR the principal oikeiosis tension (when no passions and no control conflict).
   - Connect to the agent's katorthoma_proximity (reflexive | habitual | deliberate | principled | sage_like) and the engaged virtue_domains_engaged.
   - Close with one sentence of philosophical orientation drawn from the assessment's correct_judgements (when present) or the assessment's ruling_faculty_state.
   - **MANDATORY** when iterative_refinement.direction_of_travel === "single_snapshot": include one explicit sentence naming the single-snapshot constraint (the OUTPUT example below shows it).
   - **MANDATORY** when kathekon_assessment.is_kathekon === null: include one explicit sentence naming the undecidable kathekon verdict — typically "The action's appropriateness cannot be determined from the available evidence." This sentence is independent of the principal passion / control / oikeiosis content; it stands as its own observation. The OUTPUT example below shows it. The 5-sentence upper bound exists to accommodate both marginal-case sentences when both apply.

2. improvement_guidance (1–3 sentences, ~30–80 words)
   - If improvement_path_structured is non-null: name the false_judgement_to_correct, the corrected_judgement, and which mechanism (mechanism_applies) the correction belongs to. Use second person.
   - If control_filter.disambiguation_required is non-empty: add one sentence inviting the agent to reflect on whether the named items are within or outside their moral choice. Cap at 2–3 items; if more, name two and add "and others".
   - If improvement_path_structured is null: state "no specific improvement path identified at this time" and close with a one-sentence reflective prompt drawn from oikeiosis or value_assessment.

3. summary (one sentence, ~15–30 words)
   - Name the agent's katorthoma_proximity + the principal issue (the primary passion's false_judgement OR the principal oikeiosis tension OR the kathekon verdict). Plain language.

4. soft_clarification_prose (1–2 sentences, ~20–60 words; null when no soft clarifications fire)
   - When `assessment.intake_clarifications.soft_clarifications` is empty, this field MUST be null.
   - When non-empty, render the d-a16 stem text for the FIRST entry (by trigger ordering) with slot_fills filled. Render at most one stem in this field even when multiple entries are present.
   - The framing is OFFERED, not pressing. The canonical phrasing is "I want to check something with you" (STATED_OPERATIVE_CONFLICT) or "Has there been a recent time when something similar went the other way..." (STATED_EQUANIMITY_UNVERIFIED). Use the stem's exact phrasing where possible; light prose adaptation is permitted to match the philosophical_reflection tone.
   - Address the practitioner in second person ("you", "your").

5. open_deferrals_prose (1–2 sentences per deferral entry, ~30–80 words total; null when no deferrals fire)
   - When `assessment.intake_clarifications.open_deferrals` is empty, this field MUST be null.
   - When non-empty, render the d-a16 stem text for EACH entry with slot_fills filled. Multiple entries are concatenated as separate sentences.
   - Per AC-14: the framing is principled withholding, not fallback. Use phrasings like "The engine cannot tell from the current instance alone..." for PRAXIS_MOTIVATION_AMBIGUITY and "Across [TIME_WINDOW], when [SITUATIONAL_TRIGGER] arose in this domain — was your inner state actually [EUPATHEIA_DESCRIPTION], or was it more like [PASSION_COUNTERPART_DESCRIPTION]?" for EUPATHEIA_BOUNDARY. The deferred question is for the practitioner to sit with, not to answer in the conversation.
   - Address the practitioner in second person.
   - Do NOT add "I'm not asking you to answer it now" as a coda — that wording belongs to the long-deferred-questions surface (D15), not the initial deferral surfacing.

MARGINAL-CASE DISCIPLINE EXTENSION (added 2026-05-06, M1-CP4b — per AC-14)

When `intake_clarifications.open_deferrals` contains an EUPATHEIA_BOUNDARY entry, philosophical_reflection MUST contain a sentence acknowledging that the eupatheia classification is deferred — typically along the lines of "The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone." This sentence is independent of the principal passion / control / oikeiosis content and stands as its own observation.

When `intake_clarifications.open_deferrals` contains a PRAXIS_MOTIVATION_AMBIGUITY entry, philosophical_reflection MUST contain a sentence acknowledging that the motivation classification is deferred — typically along the lines of "Whether this action arose from virtue or from convention cannot be determined from the current instance alone." This sentence is independent of the principal content and stands as its own observation.

The philosophical_reflection word budget is extended to 2–6 sentences (~40–180 words) when one or both of the AC-14 marginal-case sentences apply. Combined with the pre-existing single-snapshot and is_kathekon: null marginal-case sentences (which remain mandatory under their own conditions), philosophical_reflection may carry up to four mandatory marginal-case sentences in the most-loaded case.

CONTROLLED VOCABULARY (R8a)

You MAY use Greek identifiers (epithumia, hedone, phobos, lupe; phantasia, synkatathesis, horme, praxis; phronesis, dikaiosyne, andreia, sophrosyne; oikeiosis; kathekon; prohairesis) when the assessment names them. Translate them once for the practitioner (e.g., "phobos (fear)") on first use within a single prose field. Do not introduce Greek terms the assessment did not name.

OUTPUT

Return ONLY valid JSON conforming to Layer3Prose. No markdown. No commentary outside the JSON.

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your repeated checking of the phone reflects phobos (fear) lodged at the assent stage, where you are treating her response as something genuinely good rather than as a preferred indifferent. Your reasoning is currently deliberate but the false judgement that her opinion determines your worth is engaging phronesis (practical wisdom) without yet stabilising it. The correct view is that her judgement is outside your prohairesis; your character and your impulses are within it. The action's appropriateness cannot be determined from the available evidence. This is a single snapshot; no trajectory data is available to assess your direction of travel.",
  "improvement_guidance": "The false judgement to correct is the assumption that another's response constitutes evidence of your standing. Replace it with the assessment that her response is one external among many and your worth rests in your own ruling faculty. This is a passion-diagnosis correction at the synkatathesis stage — work it at the moment of impression, before you assent.",
  "summary": "Your reasoning is deliberate but lodged at the assent stage of phobos, where the false judgement that another's response determines your worth requires correction.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": null,
  "source": "llm"
}

Use the EXACT JSON keys shown above (e.g. "philosophical_reflection", not "reflection"; "improvement_guidance", not "guidance"; "layer2_assessment_version", not "assessment_version"; "soft_clarification_prose", not "clarification"; "open_deferrals_prose", not "deferrals"). Use the EXACT enum values shown ("layer3-prose-v1", "layer2-assessment-v1", "api_reason", "llm"). Do not add fields not in the example.

If the assessment has no passions_detected, no oikeiosis tensions, no control conflicts, and no value errors, the prose still produces all five fields — describe the agent's katorthoma_proximity and ruling_faculty_state, and use the marginal-case phrasing for any null/marginal mechanism. soft_clarification_prose and open_deferrals_prose are null when their corresponding intake_clarifications arrays are empty.

WORKED EXAMPLE — intake_clarifications populated (added 2026-05-06, M1-CP4b)

When `assessment.intake_clarifications.open_deferrals` contains an EUPATHEIA_BOUNDARY entry (chara candidate, narrative_target "her promotion") AND `assessment.intake_clarifications.soft_clarifications` is empty, the prose looks like this:

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your description of joy at her promotion shows the shape of chara — joy in another's good as an end in itself. Your reasoning is principled, with phronesis (practical wisdom) and dikaiosyne (justice) engaged in the recognition that her good is not in opposition to yours. The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone. This is a single snapshot; no trajectory data is available to assess your direction of travel.",
  "improvement_guidance": "No specific improvement path is identified at this time. The structural features of your reasoning are aligned with virtue; the work is to remain attentive to the same shape across other instances where the outcome touches your own standing.",
  "summary": "Your reasoning is principled in the recognition of another's good, with the eupatheia classification deferred for longitudinal confirmation.",
  "soft_clarification_prose": null,
  "open_deferrals_prose": "You described responding with chara (joy in another's good). Across recent days, when her promotion arose in this domain — was your inner state actually genuine joy in her good as an end in itself, or was it more like philodoxia (pleasure in being associated with success)?",
  "source": "llm"
}

Note in this example: philosophical_reflection contains the AC-14 marginal-case sentence ("The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone.") AND the existing single-snapshot sentence — both are MANDATORY when their respective conditions apply. The open_deferrals_prose renders the d-a16 T3-001 stem text with the slot-fills.

Return only the JSON.
```

### 4. LLM call configuration

- **Model:** `MODEL_DEEP` (Sonnet) per cache Element 6 row "Layer 3 translation (alt-3)" + AC1.
- **Max tokens:** 2000 default (per ADR-004 §5.2). Overridable via `params.max_tokens` for cost-budgeted parallel-run testing.
- **Temperature:** 0.3 default (per ADR-004 §5.2). Overridable via `params.temperature` for harness determinism testing (set to 0.0 for fully deterministic prose during testing).
- **System messages:** array of one cached block (`cache_control: { type: 'ephemeral' }`) carrying the prompt above. AC6 compliant.
- **User message:** the assessment JSON serialised via `JSON.stringify(assessment, null, 2)` plus a one-line preamble: `"Generate Layer3Prose for the following assessment.\n\nReturn only the JSON Layer3Prose object."`. AC6 compliant — per-request content lives in user message.
- **Response parsing:** `extractJSON(responseText)` (existing utility). Then `validateLayer3Prose(parsed)` (this ADR §6).

### 5. Composition rule — which fields the prompt uses, and the consistency contract

The prompt's PROSE FIELDS section names the exact `Layer2Assessment` fields each prose category draws from:

| Prose field | Layer2Assessment fields it draws from |
|---|---|
| `philosophical_reflection` | `passion_diagnosis.passions_detected[0]`, `passion_diagnosis.false_judgements[0]`, `katorthoma_proximity`, `virtue_domains_engaged`, `passion_diagnosis.correct_judgements[0]` (or `ruling_faculty_state` if correct_judgements empty) |
| `improvement_guidance` | `improvement_path_structured.false_judgement_to_correct`, `improvement_path_structured.corrected_judgement`, `improvement_path_structured.mechanism_applies`, `control_filter.disambiguation_required[].item` |
| `summary` | `katorthoma_proximity`, primary issue selected by precedence: passion_diagnosis.passions_detected[0] → oikeiosis principal tension → kathekon_assessment verdict |

**Consistency contract (per ADR-004 §5.3):** the prose MUST NOT contradict the assessment. Specifically, the harness Phase 5 (§7 below) extracts the following claim-types from each prose field and checks them against the assessment:

- **Greek identifiers named in prose** must appear in the assessment (passions, sub-species, virtue domains, causal stages, oikeiosis circles).
- **False judgements quoted in prose** must match `passion_diagnosis.false_judgements[0]` or `improvement_path_structured.false_judgement_to_correct` by substring.
- **Corrected judgements quoted in prose** must match `passion_diagnosis.correct_judgements[*]` or `improvement_path_structured.corrected_judgement` by substring.
- **Marginal-case phrasing** must appear when the assessment has the corresponding marginal field (e.g., when `is_kathekon: null`, the prose must contain wording recognisable as the marginal-case template).
- **Katorthoma proximity** named in prose must match `katorthoma_proximity` (or be absent — both are acceptable).

Phase 5 logs warnings (not failures) for soft-violations like prose mentioning a passion not present in the assessment; hard-fails on contradictions like asserting `is_kathekon: true` when the assessment is null.

### 6. Fallback prose mechanics (per ADR-004 §9.3)

When `generateProse` throws (LLM failure, parse failure, validation failure, timeout, network error), the route at M1-CP4 calls `generateFallbackProse(assessment)` to produce deterministic per-template prose. The user receives a working response with prose generated from the assessment alone — no LLM.

`generateFallbackProse` produces a `Layer3Prose` with `source: 'fallback'`. The three prose fields are produced from canned templates that key off the assessment's structure:

- **`philosophical_reflection`:** template strings keyed by `katorthoma_proximity` + `passion_diagnosis.passions_detected.length`. Five base templates (one per proximity value) × two passion-presence states. **Marginal-case appends (per the in-session amendments of 2026-05-04):** when `iterative_refinement.direction_of_travel === 'single_snapshot'`, the helper appends "This is a single snapshot; no trajectory data is available." When `kathekon_assessment.is_kathekon === null`, the helper additionally appends "The action's appropriateness cannot be determined from the available evidence." **AC-14 marginal-case appends (added 2026-05-06, M1-CP4b):** when any entry in `intake_clarifications.open_deferrals` has `trigger_code === 'EUPATHEIA_BOUNDARY'`, the helper additionally appends "The classification of this calm as genuine eupatheia versus polished surface over passion cannot be confirmed from this instance alone." When any entry has `trigger_code === 'PRAXIS_MOTIVATION_AMBIGUITY'`, the helper additionally appends "Whether this action arose from virtue or from convention cannot be determined from the current instance alone." All appends are independent and may all fire on the same assessment. The fallback honours the same marginal-case discipline as the LLM prompt.
- **`improvement_guidance`:** template strings keyed by `improvement_path_structured.mechanism_applies` (when non-null) or by the marginal-case template (when null).
- **`summary`:** templated as `"Your reasoning is {proximity}. {primary_issue_phrase}."` where `primary_issue_phrase` is selected from a small lookup keyed by which mechanism produced the principal issue. When `is_kathekon === null` and no other primary issue applies, the summary names the undecidable verdict explicitly per the marginal-case discipline.
- **`soft_clarification_prose`** (added 2026-05-06, M1-CP4b): when `intake_clarifications.soft_clarifications` is empty, this field is null. When non-empty, the helper renders the d-a16 stem text for the FIRST entry by populating the canned stem template with `slot_fills`. STATED_OPERATIVE_CONFLICT renders as: `"You mentioned being concerned about {STATED_CIRCLE_TARGET}. I want to check something with you — when you imagine {SITUATION} going badly, what's the thing you're most worried about for yourself?"` STATED_EQUANIMITY_UNVERIFIED renders the canonical stem (no slot-fills): `"Has there been a recent time when something similar went the other way — when the outcome you hoped for didn't arrive — and you noticed how you actually felt, not how you thought you should feel?"`
- **`open_deferrals_prose`** (added 2026-05-06, M1-CP4b): when `intake_clarifications.open_deferrals` is empty, this field is null. When non-empty, the helper renders each deferral's d-a16 stem text and concatenates them with " " (single space) as separator. EUPATHEIA_BOUNDARY renders the d-a16 T3-001 stem with slot-fills `{EUPATHEIA_SHAPE, TIME_WINDOW, SITUATIONAL_TRIGGER, EUPATHEIA_DESCRIPTION, PASSION_COUNTERPART_DESCRIPTION}`. PRAXIS_MOTIVATION_AMBIGUITY renders the d-a16 T3-002 stem with slot-fills `{SURFACE_PATTERN, VIRTUE_DESCRIPTION, CONVENTION_DESCRIPTION}`. The fallback's rendering is the canonical stem text from the d-a16 catalogue verbatim (the stem text is locked; only slot variables fill).

The fallback templates are listed in the implementation; they are deliberately less varied than the LLM prose. This is the explicit intent — the user sees a working response, not a polished one, when Layer 3 fails. The d-a16 stem rendering for soft_clarification_prose + open_deferrals_prose is, by design, identical between LLM and fallback paths — the stems are canonical; the LLM is permitted only light tone-adaptation, and the fallback uses verbatim stem text. This honours AC-14 (principled withholding is the same posture regardless of LLM availability).

`generateFallbackProse` is synchronous, deterministic, no I/O. Idempotent: same `Layer2Assessment` → byte-equal `Layer3Prose`. Verified by harness Phase 5 (the fallback runs against every fixture; outputs are deep-equal across two calls).

### 7. Validation function

Hand-rolled `validateLayer3Prose(parsed: unknown): Layer3Prose`. Mirrors `validateLayer1Schema` (ADR-005 §6) and `validateLayer2Assessment` (ADR-006 §5).

```typescript
export class Layer3ValidationError extends Error {
  constructor(
    public category: 'shape' | 'enum' | 'string_required' | 'version',
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = 'Layer3ValidationError'
  }
}

export function validateLayer3Prose(parsed: unknown): Layer3Prose {
  // Shape: object, not null, not array.
  // Version: parsed.version === 'layer3-prose-v1'.
  // layer2_assessment_version: 'layer2-assessment-v1'.
  // consumer: must be one of Layer3Consumer.
  // philosophical_reflection / improvement_guidance / summary: non-empty strings.
  // soft_clarification_prose: string | null (added 2026-05-06, M1-CP4b).
  // open_deferrals_prose: string | null (added 2026-05-06, M1-CP4b).
  // source: must be 'llm' | 'fallback'.
  // No surplus keys validated (forward-compat).
  // Returns the validated object as Layer3Prose.
}
```

Throws `Layer3ValidationError` on any failure. The error names the failing category + field for diagnostic output (mirrors `Layer1ValidationError`).

### 8. Standalone harness — Phase 5 fixtures

Per ADR-004 §7.2 + ADR-005 §8 + ADR-006 §"Phase 4". The standalone harness `/website/scripts/verify-translation-sandwich.ts` is extended at Phase 5.

#### 8.1 Fixtures

Phase 5 reuses fixtures F1–F4 from ADR-005 §8.1. Each fixture's Layer 1 schema → Layer 2 assessment is already produced by Phase 1+2+3. Phase 5 adds:

- For each fixture: call `generateProse(assessment, { consumer: 'api_reason' })`. Cache the result to `scripts/.translation-sandwich-cache/layer3-{fixture.id}.json` (gitignored — uses the existing cache directory from M1-CP2).
- For each fixture: call `generateFallbackProse(assessment)`. No caching (deterministic; cheap).

#### 8.2 Phase 5 assertions

Per fixture:

1. **`generateProse` completes** (no throw from LLM call, parse, or validator).
2. **Result validates as `Layer3Prose`** (validator pass + JSON roundtrip).
3. **Result has `source: 'llm'`**.
4. **`generateFallbackProse` is idempotent**: two consecutive calls produce byte-equal output (deep-equal by JSON).
5. **`generateFallbackProse` result validates as `Layer3Prose` with `source: 'fallback'`**.
6. **Consistency check (per §5 above)**:
   - Greek identifiers in prose appear in the assessment.
   - False judgements in prose are substring-matched against the assessment.
   - Marginal-case phrasing appears when the corresponding assessment field is marginal/null.
   - Hard-fail on contradiction (e.g., prose asserts `is_kathekon: true` when assessment is null).
   - Soft-warn on unsupported claims (logged, not failed).

Cross-fixture (Phase 5 coverage):

7. **Marginal-case coverage:** at least one fixture must surface `is_kathekon: null` OR `direction_of_travel: 'single_snapshot'` OR `improvement_path_structured: null`, AND the prose for that fixture must contain the corresponding marginal-case phrasing. Drives confidence that the LLM is honouring the marginal-case discipline. (Note: F1–F4 are single-snapshot inputs — `direction_of_travel` is `'single_snapshot'` for all four — so this assertion is satisfied by every fixture; confirms the marginal-case template is firing.)

8. **Soft-clarification surfacing (added 2026-05-06, M1-CP4b):** when `assessment.intake_clarifications.soft_clarifications.length > 0`, the prose's `soft_clarification_prose` MUST be non-null and contain a recognisable d-a16 stem fragment (substring match on a canonical phrase from the stem — e.g., "I want to check something with you" for STATED_OPERATIVE_CONFLICT, or "Has there been a recent time" for STATED_EQUANIMITY_UNVERIFIED). When the array is empty, `soft_clarification_prose` MUST be null. Hard-fail on either side of the implication.

9. **Open-deferral surfacing (added 2026-05-06, M1-CP4b):** when `assessment.intake_clarifications.open_deferrals.length > 0`, the prose's `open_deferrals_prose` MUST be non-null and contain a recognisable d-a16 stem fragment per trigger code (e.g., "Across" + the time window for EUPATHEIA_BOUNDARY, or "The engine cannot tell from the current instance alone" for PRAXIS_MOTIVATION_AMBIGUITY). The corresponding marginal-case sentence MUST appear in `philosophical_reflection` per the trigger code. When the array is empty, `open_deferrals_prose` MUST be null. Hard-fail on either side of the implication.

10. **Fallback prose intake-clarification parity (added 2026-05-06, M1-CP4b):** for any fixture where `intake_clarifications` is non-empty, `generateFallbackProse(assessment)` MUST also produce non-null `soft_clarification_prose` (when soft_clarifications is non-empty) and non-null `open_deferrals_prose` (when open_deferrals is non-empty), with the d-a16 stem text rendered verbatim. Confirms the fallback honours AC-14's principled-withholding posture even when the LLM is unavailable.

Phase 5 fixture coverage (cross-fixture, M1-CP4b additions): F5 (eupatheia-shape input) MUST produce non-null `open_deferrals_prose` (EUPATHEIA_BOUNDARY); F6 (stated-equanimity-with-passion input) MUST produce non-null `soft_clarification_prose` (STATED_EQUANIMITY_UNVERIFIED). F1–F4 MUST produce null `soft_clarification_prose` AND null `open_deferrals_prose` (their inputs do not exercise AC-13 / AC-14 triggers).

#### 8.3 Cost note

Phase 5 issues four real Sonnet calls (one per fixture) at ~2000 max-tokens. Per-run cost ~$0.04–0.16. Combined with Phase 1+2's ~$0.10–0.40, the full harness run costs ~$0.20–0.60. Cached Layer 3 outputs at `scripts/.translation-sandwich-cache/layer3-{F.id}.json` let subsequent Phase 5 runs replay without Sonnet — enabled when `LAYER1_REPLAY_CACHE=1` is set (the Phase 5 cache reuses the same env flag for simplicity at M1-CP3; can be split into `LAYER3_REPLAY_CACHE=1` later if cost discipline requires).

### 9. KG-compliance summary

| Rule | Engaged | How `layer3-prose.ts` complies |
|---|---|---|
| **AC1** Model selection | Yes | `MODEL_DEEP` (Sonnet) imported from `@/lib/model-config`; cited per cache Element 6 row "Layer 3 translation (alt-3)". Type-enforced via `assessment_deep` row of `PermittedModel`. |
| **AC4** Invocation testing for safety functions | No | Layer 3 is not safety-critical. The R20a perimeter sits in the route at line 144 and fires before any layer is called. |
| **AC5** R20a perimeter | No | Module not in any route this session. R20a perimeter unchanged. |
| **AC6** Four-layer context | Yes | System message carries cached prompt; user message carries per-request assessment JSON. Same placement as `extractFeatures` in Layer 1. |
| **AC7** Auth/cookie/session/redirect | No | Module touches no auth/session surface. |
| **AC8** Translation-sandwich directory | Yes | Module sits under `/website/src/lib/translation-sandwich/`. Third build under the architecture. |
| **KG1** Vercel five rules | Yes | LLM call is awaited; no fire-and-forget; no module-level cache (the harness cache is a script-side artefact, not module state); no DB writes; no self-calls. |
| **KG2** Haiku reliability boundary | Yes | Sonnet selected per AC1; per-consumer prose generation requires reliable structured output outside Haiku's boundary. |
| **KG6** Composition order | Yes | Layer 3 is the third layer in the translation-sandwich; sits inside the existing four-layer context architecture (L1 cached system + L2/L3 user-message contexts). |
| **PR3** Safety systems are synchronous | Yes (in spirit) | `generateProse` is awaited; no background work. Layer 3 is not itself a safety surface but the synchronous discipline applies to preserve the route's response contract. |
| **PR4** Model selection is constraint | Yes | Sonnet enforced via `assessment_deep` PermittedModel; not a runtime preference. |
| **PR5** Knowledge-gap carry-forward | Yes | Concrete OUTPUT example with realistic JSON keys + values per §3 above; no `[...]` placeholder syntax. |
| **PR6** Safety-critical changes | No | Layer 3 is not safety-critical. M1-CP4 will engage PR6. |
| **R7** Source fidelity | Yes (passthrough) | Layer 3 may reference Layer 1's verbatim evidence quotes (carried through Layer 2's per-mechanism `evidence` fields) but never paraphrases or invents quotes. |
| **R8a** Controlled vocabulary | Yes | Greek identifiers used only when the assessment names them; translated once on first use. |

## Consequences

### Positive

- The Layer 3 module reaches **Verified (standalone)** at session close: prompt template + module + harness Phase 5 all produce passing output against fixtures F1–F4. M1-CP4 can begin with a proven Layer 3.
- The consistency contract (per ADR-004 §5.3) is mechanised in the harness: Phase 5 catches LLM drift before it reaches the user. The marginal-case discipline is testable.
- The fallback path (per ADR-004 §9.3) is exported as its own function — the route at M1-CP4 can wire it into the catch path with no additional work in this module. The user is never stranded by a Layer 3 failure.
- The OUTPUT example in §3 honours the PR5 carry-forward discipline established at M1-CP1 + M1-CP2: concrete JSON keys + concrete realistic prose values, not placeholder syntax. If the harness Phase 5 surfaces JSON-key drift on the first real-Sonnet run, the founder has the option to promote PR5's candidate to a permanent KG entry.
- The `Layer3Consumer` type is extensible — M2/M3/M4 add their consumer enum values + their per-consumer system prompt without changing the module surface.

### Negative / known costs

- Layer 3 adds ~$0.04–0.16 per harness run (four fixtures × Sonnet). Acceptable per ADR-004 §5.2 cost projection. Not zero; founder runs with intent.
- The fallback prose templates are deliberately less varied than the LLM prose. When the LLM is up, the user sees prose tailored to their specific assessment. When the LLM is down, the user sees template prose. The contrast is visible in the parallel-run logs at M1-CP4. Acceptable cost for "no user is ever stranded" guarantee.
- The full-assessment-as-input choice (founder Decision 2) means the prompt's user message is verbose — full `Layer2Assessment` JSON (serialised, ~2–8 KB depending on fixture). Larger than the curated-subset alternative. Mitigation: the cached system prompt is small (the OUTPUT example), so cache hit ratio is high.
- The consistency contract in §5 is heuristic, not formal. Phase 5 catches the obvious failures (contradiction, missing marginal-case phrasing, unsupported Greek identifiers) but cannot catch all forms of subtle drift. A more formal verification (e.g., a second LLM pass that checks claim-by-claim) is post-MVP.
- The LLM may produce JSON keys that differ from the OUTPUT example's keys despite the explicit instruction. The hand-rolled validator catches this; PR5's third-recurrence promotion would codify "explicit OUTPUT example required" as a permanent rule.

### Risks named

- **Prose drift past the consistency contract.** If the LLM produces prose that is technically consistent with the assessment but adds claims the assessment doesn't name (e.g., introduces an oikeiosis tension the assessment didn't compute), the harness's heuristic checks may not catch it. Mitigation: founder spot-checks during parallel-run at M1-CP4; manual review of harness diagnostics at M1-CP3.
- **Marginal-case discipline failure.** If the LLM produces generic forward-looking prose for `is_kathekon: null` instead of the explicit phrasing, the user is misled. Mitigation: Phase 5 hard-fails on missing marginal-case phrasing when the corresponding assessment field is marginal.
- **Fallback prose monotony.** If the same template fires for many users in a row (e.g., during a sustained Layer 3 outage), the fallback prose becomes recognisable as fallback. This is a feature, not a bug — the user sees the assessment regardless. Mitigation: M1-CP4 logs the LLM-vs-fallback ratio; sustained fallback rates trigger an alert.
- **Cost overrun during parallel-run.** Layer 3's per-call cost (~$0.04 per call at 2000 max-tokens) compounds over a parallel-run period. Mitigation: ADR-004 §6.2 names the parallel-run cost cap discipline; M1-CP4 sets the cap.
- **JSON-key fidelity (PR5 watch).** If the first real-Sonnet harness run produces JSON keys that differ from the OUTPUT example, this is the third recurrence of the PR5 candidate and triggers promotion to a permanent KG entry. Mitigation: §3 above shows concrete keys + concrete values per PR5 discipline; the validator throws on key drift.

### What this ADR is not

- **Not a route wiring session.** The module exists in `/website/src/lib/translation-sandwich/` but is not imported by any route until M1-CP4 (per ADR-004 §10.1).
- **Not a Layer 3 prompt template for other consumers.** `/api/score-*`, `/api/mentor/*`, `/api/skill/*` consumers each get their own per-consumer ADR at their respective milestones (M2/M3/M4).
- **Not a foreclosure on extending `Layer3Prose`.** If parallel-run at M1-CP4 / M1-CP5 surfaces a need for structured per-mechanism prose blocks, ADR-007 is amended and the schema versions bump to v2. M1-CP4 may also surface a need to alter the consistency contract (§5) — that is also an ADR-007 amendment.
- **Not a commitment to LLM determinism.** Temperature 0.3 means prose varies across runs even with the same input. The harness's Phase 5 cache absorbs this for replay testing; the consistency contract verifies semantic stability, not lexical equality.

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR-007 moves from `/drafts/adr/` to `/adopted/adr/` in this session. The Layer 3 module build (Step 2) and harness Phase 5 implementation (Step 3) become the next steps under the adopted contract.

If the founder rejects ADR-007 or requests substantial edits, the draft is revised in this session or deferred to a future session. The Layer 3 module is not built until ADR-007 is Adopted.

## Changelog

- **2026-05-04 (initial Adoption, Sub-session M1-CP3)** — drafted in `/drafts/adr/`, approved verbatim by founder ("approved as drafted") across all four load-bearing decisions (prose shape: three flat fields; prompt input scope: full assessment JSON; marginal-case phrasing: explicit; fallback architecture: separate exported function), moved to `/adopted/adr/`. PR5 carry-forward discipline applied to the OUTPUT example in §3 (concrete JSON keys + concrete realistic prose values, no placeholder syntax). Two AI-flagged points the founder accepted as drafted: second-person prose addressing convention ("you/your"); marginal-case coverage assertion satisfied trivially by the all-single-snapshot fixture set F1–F4 (fixture-set expansion deferred to M1-CP4).

- **2026-05-04 (in-session amendment, Sub-session M1-CP3 post-harness)** — founder ran the real-Sonnet harness; Phases 1–4 passed cleanly (4/4 fixtures); Phase 5 surfaced 4 failures all of the same root cause: the LLM-generated prose silently omitted the `single_snapshot` marginal-case sentence on F1, F3, F4 (the three fixtures with `direction_of_travel === 'single_snapshot'`). F2 passed because its `direction_of_travel === 'stable'`. Greek-identifier consistency was clean across all four — the LLM honoured the JSON contract and did not invent assessment content. The fallback prose ALSO omitted the single-snapshot phrasing because the original §6 fallback design had no `direction_of_travel` handling. Founder approved fix-in-session ("Fix in this session — Recommended"). Amendment: §3 PROSE FIELDS instruction strengthened to mark single-snapshot phrasing as MANDATORY when applicable and to expand the philosophical_reflection word budget from 2–3 sentences (~40–80 words) to 2–4 sentences (~40–110 words); §3 OUTPUT example's philosophical_reflection now includes the closing single-snapshot sentence as a worked example (PR5 discipline: worked example > written instruction); §6 fallback documentation updated to note the single-snapshot append in `philosophical_reflection`. PR5 carry-forward stays in **watch (second-recurrence)** — JSON-key fidelity passed; the failure was content-discipline, not key-drift. New PR5 candidate logged this session (first observation): "LLM marginal-case discipline (instruction to explicitly name undecidable verdicts) requires worked examples in OUTPUT, not just bullet-point instruction." Will engage at M1-CP4 if observed again. Mirror amendments applied to `layer3-prose.ts` (LAYER3_SYSTEM_PROMPT_API_REASON constant + fallbackPhilosophicalReflection function) in the same session-commit. Founder re-runs harness between sessions to confirm 77/77 (4 failures resolved by the amendment).

- **2026-05-04 (second in-session amendment, Sub-session M1-CP3 post-harness re-run)** — founder ran the harness post-first-amendment. Score moved from 73/77 → **78/79**. The 3 single-snapshot per-fixture failures + the cross-fixture marginal-case coverage failure all PASSED — confirming the first amendment's worked-example fix worked. One new failure surfaced: F1.P5 hard-asserted `is_kathekon: null → prose contains "cannot be determined"` and the LLM did not satisfy it. Same structural pattern as the single_snapshot drift, now manifesting on a different marginal field (kathekon-null). Visible because F1's Layer 1 output is non-deterministic at temperature 0.2 — the previous run had F1 with `kathekon: contrary` (assertion didn't fire); this run had F1 with `kathekon: marginal/null` (assertion fired and failed). Latent issue masked, not absent. **PR5 candidate "LLM marginal-case discipline requires worked OUTPUT examples" promoted from Candidate (first observation) to Candidate (2nd recurrence — watch status)** with three resolution-sketch options logged to `/operations/knowledge-gaps.md`. Founder approved second fix-in-session ("Recommended — apply same pattern that worked"). Second amendment: §3 PROSE FIELDS instruction strengthened to mark kathekon-null phrasing as MANDATORY when `kathekon_assessment.is_kathekon === null`; word budget expanded 2–4 → 2–5 sentences (~40–110 → ~40–140 words) to accommodate both marginal-case sentences when both apply; the COMPOSITION CONTRACT bullet for is_kathekon: null updated to MANDATORY with explicit placement guidance; the bullet for improvement_path_structured: null also updated to MANDATORY for parallel structure (defensive — preempts the same drift pattern on the third marginal field if it surfaces); §3 OUTPUT example's philosophical_reflection now includes "The action's appropriateness cannot be determined from the available evidence." between the correct-view sentence and the single-snapshot closing — demonstrating the kathekon-null discipline as a worked example; §6 fallback documentation updated to note the kathekon-null append in `philosophical_reflection`. Mirror amendments applied to `layer3-prose.ts` (LAYER3_SYSTEM_PROMPT_API_REASON constant + fallbackPhilosophicalReflection function — kathekon-null sentence appended when `is_kathekon === null`, independent of the single-snapshot append). In-sandbox smoke test re-run to verify the fallback fix: 35+/35+ pass (was 34/34; +1 for kathekon-null fallback assertion). Founder re-runs harness post-second-amendment between sessions to confirm 79/79.

- **2026-05-06 (cross-session amendment, Sub-session M1-CP4b)** — M1-CP4b adds Layer 3 prose paths for `intake_clarifications` (Tier 2 soft clarifications + Tier 3 OPEN_DEFERRALs) per `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05`. Schema additions (§2): two new fields on `Layer3Prose` — `soft_clarification_prose: string | null` and `open_deferrals_prose: string | null`. All additive — prose version remains `layer3-prose-v1`. System prompt additions (§3): new prose fields 4 (soft_clarification_prose) and 5 (open_deferrals_prose) specified; new MARGINAL-CASE DISCIPLINE EXTENSION block requires philosophical_reflection to acknowledge EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY deferrals when present; word budget extended to 2–6 sentences (~40–180 words). OUTPUT example extended with the two new fields (null when not applicable) plus a second WORKED EXAMPLE block showing a EUPATHEIA_BOUNDARY case with both `open_deferrals_prose` populated and the AC-14 marginal-case sentence in philosophical_reflection (per PR5 worked-example discipline — preempts content-discipline drift on the new marginal-case fields). Fallback mechanics (§6) extended: `generateFallbackProse` produces both new fields with d-a16 stem text rendered verbatim from slot_fills (LLM and fallback paths produce identical stem text for the AC-14 deferral surfacing — the stems are canonical). Validator (§7) extended to assert `soft_clarification_prose` and `open_deferrals_prose` are `string | null`. Phase 5 assertions (§8.2) extended with assertions 8 (soft-clarification surfacing), 9 (open-deferral surfacing + corresponding marginal-case sentence in philosophical_reflection), 10 (fallback prose intake-clarification parity). Cross-fixture coverage extended: F5 must produce non-null `open_deferrals_prose`; F6 must produce non-null `soft_clarification_prose`; F1–F4 must produce null for both new fields. Tier 1 force-clarification triggers explicitly out of scope at this amendment. Standard-tier governance amendment under 0d-ii (documentation; no production touch). Module update + harness re-verification scheduled for M1-CP4c.

- **2026-05-07 (cross-session amendment, Sub-session M1-CP5b)** — see "Amendment — 2026-05-07" section below for full text. Per `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`. Seven Revisions to the Layer 3 prompt template: (1) closing sentence MUST be the action; (2) voice as guidance, not factual recap; (3) consistent bracketed Greek-to-English glossing on first use per response (R8c application); (4) careful false-judgement framing — virtue/vice carry moral weight, not the practitioner's character; (5) marginal-case disclaimers demoted from closing line (Pattern B — discipline preserved, placement changed); (6) surface preferred-indifferent observations from `value_assessment.identified_value_errors`; (7) lighter assessment recap (≤25%), heavier actionable guidance (≥60%) by sentence count. Gap 6 dispositioned: Possibility B confirmed — Layer 1 already extracts preferred-indifferent data into `value_categories_at_stake[]` (ADR-005 §2 + §3.4); ADR-005 NOT co-amended. Implementation scope (M1-CP5c): `layer3-prose.ts` LAYER3_SYSTEM_PROMPT_API_REASON constant + generateFallbackProse helpers + both OUTPUT examples rewritten; harness Phase 5 assertions updated (assertion 7 reworded for non-closing-line placement; new negative assertion that closing sentence is NOT a disclaimer; new soft-warn assertion for proportion); F1–F5 layer3 fixture caches regenerated against live Sonnet; brief parallel-run re-validation via 5–10 `/admin/test-reason` clicks. Standard-tier governance amendment under 0d-ii (documentation; no production touch).

- **2026-05-07 (cross-session amendment, Sub-session M1-CP5d)** — see "Amendment 2 — 2026-05-07" section below for full text. Per `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07`. Two refinements arising from return-to-M1-CP5's 27/28 prose-quality verdict against the M1-CP5b Revisions: (a) **Refinement to Revision 3** — `axia (worth/value)` added to the Architecture row of the controlled-vocabulary list, and the gloss-discipline language strengthened to require gloss on every term in the controlled-vocabulary list (not only terms named in the assessment); (b) **Revision 8** — third OUTPUT example added demonstrating a `horme`-lodged passion (different causal stage from Example 1's `synkatathesis`-lodged phobos and Example 2's eupatheia case that does not lodge at a causal stage), with the COMPOSITION CONTRACT extended with an explicit "use the stage named in the assessment, not the stage in any OUTPUT example" instruction. The `fallbackValueErrorSentence` template is updated to gloss `axia (worth/value)` on first use. Founder elected Approach (a-variant) at session open — combining the explicit COMPOSITION CONTRACT instruction (Approach b) with stage variation across OUTPUT examples (Approach a) for maximum discipline at minimum invasiveness (Examples 1 and 2 preserved unchanged; Example 3 is additive). Implementation scope (M1-CP5d): `layer3-prose.ts` LAYER3_SYSTEM_PROMPT_API_REASON constant + `fallbackValueErrorSentence` template; harness NOT touched (no per-term gloss-on-first-use assertion exists in the harness — the prompt's CONTROLLED VOCABULARY list is the only governing list for the gloss discipline); F1–F5 layer3 fixture caches regenerated against live Sonnet under the new prompt template. Elevated-tier governance amendment under 0d-ii (Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth so the change is dormant until M1-CP6 cutover).

- **2026-05-07 (cross-session amendment, Sub-session M1-CP5e)** — see "Amendment 3 — 2026-05-07" section below for full text. Per `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` + `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07`. Two precautionary refinements before M1-CP6 cutover: (a) **Q2 truncation defense + prompt strengthening** — Q2 investigation at session open reframed the F4 one-off JSON parse failure: extractJSON already has six-step fallback including markdown-fence stripping at Step 2 (json-utils.ts lines 28–37); the F4 root cause was truncation at the LLM call (max_tokens cap), not parser limitation. Three concrete changes: max_tokens default raised 2000 → 3000 in `generateProse`; explicit `stop_reason === 'max_tokens'` check added before parsing (throws diagnosable error instead of opaque JSON parse failure); OUTPUT instruction tightened as belt-and-braces (first-character `{` / last-character `}` discipline; explicit "no markdown fences"). (b) **Q6 STAGE DISCIPLINE rule** — new sub-section added to philosophical_reflection STRUCTURE clarifying that prose names the stage where the passion is lodged (`passion_diagnosis.passions_detected[].causal_stage_affected`), not upstream stages, unless the assessment explicitly names them as part of the corrective sequence. Founder elected philosophical_reflection STRUCTURE placement at session open (over COMPOSITION CONTRACT). Implementation scope (M1-CP5e): `layer3-prose.ts` only — `LAYER3_SYSTEM_PROMPT_API_REASON` constant (OUTPUT instruction + STAGE DISCIPLINE rule + closing instruction) + `generateProse` (max_tokens default + stop_reason check). `json-utils.ts` NOT touched — investigation confirmed the parser was not the load-bearing problem. Harness NOT touched — no truncation-specific or stage-discipline assertion needed. F1–F5 layer3 fixture caches regenerated against live Sonnet under the M1-CP5e-amended prompt template + max_tokens cap. Standard-tier governance amendment under 0d-ii (parallel-run path is dormant in production until M1-CP6 cutover; AC4/AC5/AC7/PR6 NOT engaged).

---

## Amendment — 2026-05-07 — M1-CP5b: Layer 3 prose-template revisions per M1-CP5 prose-quality findings

**Status:** Adopted (founder approval at Sub-session M1-CP5b, 2026-05-07).
**Predecessor decision:** `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`.
**Engages rules:** R0 (oikeiosis — Layer 3 prose is what Circles 1 + 2 of the practitioner's oikeiosis sequence actually experience), R8a (controlled vocabulary preserved), R8c (English-only on user-facing prose — Revision 3 directly addresses), R7 (source fidelity preserved — no new claims invented), AC8 (translation-sandwich engine surface), PR1 (single-endpoint proof — `/api/reason` is the M1 pilot consumer).
**NOT engaged:** AC4, AC5, AC7, PR6 (no R20a perimeter or auth surface touched), PR3 (synchronous discipline N/A this amendment), PR4 (model selection N/A — Sonnet retained).
**Risk class:** Standard under 0d-ii (governance — documentation only; no production touch).

### Why this amendment

M1-CP5's first-pass comparison-rubric read confirmed the analytical engine (Layer 1 + Layer 2) produces correct differentiated assessment where the bundled-depth engine mode-collapses to a uniform answer. The rubric's six dimensions returned five clean signals supporting cutover (latency, cost, failures, threshold posture, fire distribution) plus a sixth signal (proximity match at 40%) that resolved in favour of differentiation once the founder spot-checked the analytical content. The cutover-blocking issue localised to the Layer 3 prose-rendering layer: seven specific gaps that, in aggregate, would replace user-facing prose closing on actionable practice with prose closing on filler disclaimers. The founder elected Revise rather than Cutover; this amendment specifies the prompt-template changes M1-CP5c implements. Gap 6 was investigated as part of this amendment — Layer 1 already extracts preferred-indifferent data into `value_categories_at_stake[]` (ADR-005 §2 + §3.4) and Layer 2 consumes it via `value_assessment` (ADR-004 §2.3) — so ADR-007 amendment alone is sufficient; ADR-005 is NOT co-amended.

### Revisions to the Layer 3 prompt template

#### Revision 1 — Closing sentence MUST be the action

**Hard rule.** The closing sentence of `philosophical_reflection` and the closing sentence of `improvement_guidance` MUST be a concrete practice, an actionable orientation, or a specific Stoic move the practitioner can make. Disclaimers, marginal-case acknowledgments, single-snapshot caveats, and undecidable-verdict acknowledgments MUST NOT close any prose field.

Concretely:
- `philosophical_reflection` closes on the philosophical orientation drawn from `correct_judgements[0]` or `ruling_faculty_state` (per the existing §3 pattern), reframed as something the practitioner can carry with them — not as a recap of the assessment.
- `improvement_guidance` closes on the practitioner-facing move: the corrected judgement worked at the causal stage where the false judgement is lodged (synkatathesis correction is the typical case for `/api/reason`), or — when `improvement_path_structured` is null — a one-sentence reflective prompt drawn from `oikeiosis` or `value_assessment`.
- `summary` already closes itself; no change.

The OUTPUT example in §3 is updated at M1-CP5c to demonstrate this rule. The current OUTPUT example closes `philosophical_reflection` on "This is a single snapshot; no trajectory data is available to assess your direction of travel." — under this revision, that sentence is moved mid-prose (per Revision 5) and replaced as the closing line by the existing third sentence ("The correct view is that her judgement is outside your prohairesis; your character and your impulses are within it.") or a near-paraphrase reordered to the end.

#### Revision 2 — Voice as guidance, not factual recap

**Structural rule.** The prose's structure shifts from "assessment recap → disclaimer" to "principled finding → orientation → practitioner-facing move". The full `Layer2Assessment` JSON is already in the response payload at `extraction` + `assessment`. Layer 3's job is to translate the principled findings into prose the practitioner can act on, not to duplicate the JSON in narrative form. The founder's reformatted prose for row `ae112723` is the target shape — assessment is named, then the prose pivots quickly to the move.

Concretely, the §3 PROSE FIELDS instructions are updated at M1-CP5c so each prose field's first sentence carries the principled finding (one sentence, no extended unpacking) and the remaining sentences carry orientation + move. The "open with the principal Stoic dynamic" guidance is preserved but tightened: open with the dynamic, name it once, and move to what to do with it.

#### Revision 3 — Consistent bracketed Greek-to-English glossing on first use (R8c application)

**Hard rule.** Every Greek or technical Stoic term used in any prose field MUST carry an English translation in parentheses on first occurrence per response. The current §3 CONTROLLED VOCABULARY (R8a) instruction reads "Translate them once for the practitioner (e.g., 'phobos (fear)') on first use within a single prose field." — under this revision, the scope changes from "within a single prose field" to "per response" (so the gloss appears the first time the term is used anywhere across `philosophical_reflection`, `improvement_guidance`, `summary`, `soft_clarification_prose`, `open_deferrals_prose`).

The required-gloss term list (non-exhaustive — any Greek or technical term the assessment uses must be glossed):
- Causal-chain stages: `phantasia (impression)`, `synkatathesis (assent)`, `horme (impulse)`, `praxis (action)`.
- Passions: `epithumia (irrational desire)`, `hedone (pleasure)`, `phobos (fear)`, `lupe (distress)`. Sub-species when named: `philodoxia (love of reputation)`, `agonia (anguished anxiety)`, `achos (anguished grief)`, `pothos (longing for the absent)`, `oknos (sluggishness)`, etc.
- Eupatheiai: `chara (rational joy)`, `boulesis (rational wishing)`, `eulabeia (reverent caution)`, `eupatheia (rational affection)`.
- Virtues: `phronesis (practical wisdom)`, `dikaiosyne (justice)`, `andreia (courage)`, `sophrosyne (temperance)`.
- Architecture: `prohairesis (moral choice / ruling faculty)`, `kathekon (appropriate action)`, `katorthoma (perfect action)`, `oikeiosis (appropriation)`, `eudaimonia (flourishing)`.
- Affect descriptors: `ataraxia (freedom from disturbance)` if used.

When the term is itself the English translation already in common use (e.g., "ruling faculty"), no gloss is required, but if the prose introduces "ruling faculty" alongside `prohairesis`, the gloss attaches to `prohairesis` on first occurrence. Glossing is a discipline, not a one-time decoration: every Greek term across the response is glossed on its first appearance, even if the practitioner may have seen the term in earlier interactions. The fallback prose helper (§6) follows the same discipline.

#### Revision 4 — Careful false-judgement framing (criterion of good and evil)

**New sub-section under §3 PROSE FIELDS.** When the prose invokes the Stoic criterion of good and evil — the principle that only virtue is good and only vice is evil; everything else is preferred or dispreferred indifferent — the prose MUST NOT predicate "evil" (or "good") of the practitioner's character itself, of their response, or of their person. Virtue and vice are the only carriers of moral weight; the prose names this without implying the practitioner has been judged.

Anti-pattern (do not produce): "the only thing that is genuinely good or evil is your character in responding to each", "your character is the evil here", "your response is the only evil in this".

Target patterns (produce): "only virtue and vice carry moral weight; her response, the outcome, your reputation are preferred or dispreferred indifferents", "the criterion of good and evil falls on the judgement, not on the action's outcome", "what is genuinely yours to evaluate is the false judgement at work, not your standing".

The principle: the criterion is named as a feature of the framework (virtue and vice carry moral weight) and applied to the false judgement (which is corrigible) — never applied to the practitioner's character as a verdict on them. The fallback prose helper (§6) follows the same discipline; the templates are reviewed at M1-CP5c against this rule.

#### Revision 5 — Marginal-case disclaimers demoted from closing line (Pattern B)

**Discipline preserved; placement changed.** The MANDATORY marginal-case discipline established in the M1-CP3 amendments (single-snapshot, is_kathekon: null, improvement_path_structured: null) and the M1-CP4b amendment (EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY) is preserved — these sentences MUST appear in the prose when their respective conditions apply. The placement rule changes: these sentences MUST NOT be the closing sentence of any prose field; they appear mid-prose as brief acknowledgments before the prose pivots to the closing action (per Revision 1).

Specifically:
- **single_snapshot disclaimer.** Currently MANDATORY in `philosophical_reflection` whenever `iterative_refinement.direction_of_travel === 'single_snapshot'`. Under this revision: the sentence appears in `philosophical_reflection` only when the input has temporal hooks that would naturally raise a trajectory question (e.g., the input mentions iterative or repeated context, "this keeps happening", "I always", "lately") AND the assessment has computed `direction_of_travel === 'single_snapshot'`. When the input has no temporal hook at all and `direction_of_travel === 'single_snapshot'`, the sentence is OMITTED and the prose simply does not make trajectory claims. The harness (§8) is updated at M1-CP5c to reflect this conditional. Per Revision 1, this sentence — when it does appear — never closes the field; it sits mid-prose before the closing orientation.
- **is_kathekon: null disclaimer.** Currently MANDATORY in `philosophical_reflection` or `summary` whenever `kathekon_assessment.is_kathekon === null`. Under this revision: the sentence appears mid-prose only when the input has raised the question of appropriateness (the agent has named or implied a question about whether what they did or are considering was the right thing). When the input does not engage the question of appropriateness AND `is_kathekon === null`, the sentence is OMITTED. When it does appear, it sits mid-prose, not as the closing line.
- **improvement_path_structured: null disclaimer.** Currently MANDATORY in `improvement_guidance` whenever `improvement_path_structured === null`. Under this revision: the sentence appears mid-prose, then the prose pivots to a one-sentence reflective prompt drawn from `oikeiosis` or `value_assessment` — that prompt is the closing line, not the disclaimer.
- **AC-14 marginal-case sentences (EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY).** Currently MANDATORY in `philosophical_reflection` per the M1-CP4b amendment. Under this revision: same pattern — these sentences appear mid-prose when their respective AC-14 conditions apply, never as the closing line.

The principle: the marginal-case discipline catches silent drift on what the engine cannot decide; the closing line carries what the engine has decided the practitioner can act on. Both are required; they don't compete for the same position.

The fallback prose helper (§6) follows the same placement discipline: marginal-case appends are inserted mid-prose, not as closings; the closing sentence is the action-orientation drawn from `correct_judgements` / `ruling_faculty_state` / `oikeiosis` / `value_assessment` per template.

#### Revision 6 — Surface preferred-indifferent observations

**New rendering rule.** When `value_assessment.identified_value_errors` is non-empty (the agent is treating a preferred or dispreferred indifferent as a genuine good or evil), `philosophical_reflection` MUST surface the value error as a structural observation: name the indifferent, name the agent's framing of it, and connect it to the engine's principled finding (the indifferent is ranked by axia; the framing is what produces the passion). The value-error observation is a peer of the principal-passion observation — when both apply, both are rendered; when only the value error applies, it carries the principled finding.

Worked example (target shape, drawn from row `5b8bf957`'s bundled observation): "Your repeated checking of the phone is a search for relief from the discomfort of uncertainty — and the discomfort itself is a preferred indifferent (the absence of certainty about her response) being treated as a genuine evil." The observation names the indifferent (uncertainty about her response), the agent's framing (treated as evil), and the structural finding (the framing is what locates the passion).

The §5 composition table is extended at M1-CP5c to add `value_assessment.identified_value_errors` as a source for `philosophical_reflection` (peer to `passion_diagnosis.passions_detected[0]` and `passion_diagnosis.false_judgements[0]`). The §3 OUTPUT example is extended with a worked example demonstrating value-error rendering. The fallback prose helper (§6) is extended to render value-error observations from `value_assessment.identified_value_errors[0]` when present, using a templated rendering keyed by `indifferent` × `agent_framing`.

#### Revision 7 — Lighter assessment recap, heavier actionable guidance

**Proportional rebalance.** The full `Layer2Assessment` JSON is already in the response payload at `extraction` + `assessment`; Layer 3 prose duplicating the JSON in narrative form is filler. The proportions of the prose shift toward actionable guidance.

Concretely (sentence-count proportions across the three primary prose fields, computed across `philosophical_reflection` + `improvement_guidance` + `summary`):
- `philosophical_reflection`: ≤ 25% of total prose by sentence count. Word budget narrowed from "2–6 sentences (~40–180 words)" to **2–4 sentences (~40–110 words)**. The marginal-case sentences from Revision 5 (when they fire) count toward this budget.
- `improvement_guidance`: ≥ 60% of total prose by sentence count. Word budget widened from "1–3 sentences (~30–80 words)" to **2–5 sentences (~50–140 words)**. The actionable closing line is the anchor; the preceding sentences develop the move.
- `summary`: residual — one sentence, ~15–30 words. Unchanged.

When AC-14 / AC-13 marginal cases fire (additional mandatory sentences in `philosophical_reflection` or `soft_clarification_prose` / `open_deferrals_prose`), the sentence-count proportions are computed only across the three primary fields; `soft_clarification_prose` and `open_deferrals_prose` are governed by their own M1-CP4b budgets and do not enter the proportion computation.

The §3 OUTPUT example is rewritten at M1-CP5c to demonstrate the new proportions. The harness (§8) Phase 5 acquires a new soft-warn assertion: prose where `improvement_guidance` sentence count is less than `philosophical_reflection` sentence count is logged for review (not hard-failed, because some inputs legitimately produce more reflection than guidance — but the pattern should be the exception, not the default).

### Implementation scope (M1-CP5c)

Files touched at M1-CP5c:
- `/website/src/lib/translation-sandwich/layer3-prose.ts` — `LAYER3_SYSTEM_PROMPT_API_REASON` constant rewritten per Revisions 1–7; `generateFallbackProse` helpers updated for Revisions 4 + 5 + 6 (template review + new value-error template + closing-line discipline); both OUTPUT examples in the prompt rewritten to demonstrate the new shape.
- `/website/scripts/verify-translation-sandwich.ts` — Phase 5 assertions updated: assertion 7 (marginal-case coverage) reworded to allow non-closing-line placement; new negative assertion (closing sentence is NOT a disclaimer or marginal-case sentence); new soft-warn assertion (improvement_guidance sentence count proportion); assertions 8 + 9 + 10 (M1-CP4b additions) preserved.
- `/website/scripts/.translation-sandwich-cache/layer3-{F.id}.json` — F1, F2, F3, F4, F5 caches regenerated against live Sonnet under the new prompt template.

ADR-005 NOT amended (gap 6 disposition: Possibility B — Layer 1 already extracts).

After M1-CP5c module update + harness re-cache: brief parallel-run re-validation via 5–10 `/admin/test-reason` clicks against fixtures that exercise the seven gaps' conditions. Then return-to-M1-CP5 with refreshed comparison data.

Estimated time for M1-CP5c: 2–3 hours. Risk class: Elevated (existing user-facing functionality changes — Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth so the change is dormant until cutover, but the module that will become user-facing at M1-CP6 is the one being changed). Critical Change Protocol NOT engaged.

---

*End of Amendment — 2026-05-07.*

---

## Amendment 2 — 2026-05-07 — M1-CP5d: Revision 3 term-list refinement + Q1 OUTPUT-example over-imitation correction

**Status:** Adopted (founder approval at Sub-session M1-CP5d, 2026-05-07).
**Predecessor decision:** `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07`.
**Predecessor amendment:** Amendment — 2026-05-07 (M1-CP5b adoption + M1-CP5c implementation; Revisions 1–7).
**Engages rules:** R0 (oikeiosis — Layer 3 prose is what Circles 1 + 2 of the practitioner's oikeiosis sequence actually experience), R8a (controlled vocabulary refined — `axia` added to the Architecture row), R8c (English-only on user-facing prose — gloss discipline strengthened), R7 (source fidelity preserved — no new claims invented), AC1 (Sonnet retained — no model change), AC8 (translation-sandwich engine surface), KG1 (no DB writes; no fire-and-forget), PR1 (single-endpoint proof — `/api/reason` is the M1 pilot consumer), PR3 (synchronous discipline preserved — generateProse remains awaited), PR4 (model selection unchanged — Sonnet per cache Element 6), PR5 (LLM marginal-case discipline observed — Q1 over-imitation soft-warn count carried forward).
**NOT engaged:** AC4, AC5, AC7, PR6 (no R20a perimeter or auth surface touched).
**Risk class:** Elevated under 0d-ii (existing user-facing functionality changes — Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth so the change is dormant until M1-CP6 cutover, but the module that will become user-facing at M1-CP6 is the one being changed). Critical Change Protocol NOT engaged.

### Why this amendment

Sub-session return-to-M1-CP5 (2026-05-07) refreshed the six-dimension comparison rubric against four post-M1-CP5c parallel-run rows and ran the prose-quality verdict against the seven Revisions adopted at M1-CP5b. The verdict was 27/28 micro-checks pass — five of six rubric dimensions clean (latency, cost, failures, threshold posture, fire distribution); the sixth (proximity match 50%) reproduces the M1-CP5 first-pass architectural finding (sandwich differentiating, bundled mode-collapsing). Two prose-quality items were surfaced for refinement before M1-CP6 cutover:

1. **Revision 3 soft miss (Row 1).** The Row 1 prose used `axia` mid-prose ("the indifferent ranked by axia") without glossing. `axia` is not in the Revision 3 term list as adopted at M1-CP5b. The Architecture row currently lists `prohairesis`, `kathekon`, `katorthoma`, `oikeiosis`, `eudaimonia` — five terms — and does not name `axia`. Two factors compounded: the term wasn't listed, and the Revision 3 framing ("any Greek or technical term the assessment uses must be glossed") left ambiguity about whether architecture-row terms must be glossed when the assessment did not explicitly name them. The fix is to add `axia` to the Architecture row and clarify that every term in the controlled-vocabulary list MUST be glossed on first occurrence per response, regardless of whether the assessment explicitly named the term.

2. **Q1 OUTPUT-example over-imitation soft-warns.** Across all four post-M1-CP5c parallel-run rows the LLM persistently named causal-chain terms (`synkatathesis`, `phantasia`, `horme`) in prose that did not appear in the assessment's `passion_diagnosis.passions_detected[].causal_stage_affected` field. The pattern: the OUTPUT example in §3 demonstrates `phobos (fear) lodged at the synkatathesis (assent) stage`, and the LLM pattern-matches the example's causal-stage selection rather than reading the stage from the assessment. The fix is to demonstrate stage variation — adding a third OUTPUT example with a passion lodged at a different stage (this amendment chooses `horme`) so the LLM sees three distinct stage selections across Examples 1 (`synkatathesis`-lodged phobos), 2 (eupatheia case — no causal stage lodged), and 3 (`horme`-lodged passion) — and to extend the COMPOSITION CONTRACT with an explicit instruction that the LLM must use the stage named in the assessment, not the stage shown in any OUTPUT example.

Both items are surface-level prose-quality refinements that do not change the analytical engine (Layer 1 + Layer 2 are unaffected). Both would be addressed at cutover anyway; the founder elected Branch B (precautionary refinement) at return-to-M1-CP5 to land them in M1-CP5d rather than ship-then-refine. M1-CP6 cutover is deferred until M1-CP5d + M1-CP5e + return-to-M1-CP5-prime land.

### Refinement to Revision 3 — axia added; gloss discipline strengthened

**Hard rule (refined).** Every Greek or technical term named in the assessment OR in the controlled-vocabulary list below MUST be glossed in parentheses on its first occurrence per response (across `philosophical_reflection`, `improvement_guidance`, `summary`, `soft_clarification_prose`, `open_deferrals_prose`). The discipline applies to every term in the controlled-vocabulary list, including architecture-row terms. Architecture-row terms are NOT optional; they require glossing on first occurrence whenever the prose names them, regardless of whether the assessment explicitly named the term. The original Revision 3 framing of "any Greek or technical term the assessment uses must be glossed" is replaced by "any Greek or technical term in the controlled-vocabulary list OR named in the assessment must be glossed."

The Architecture row of the term list is amended to add `axia (worth/value)`:

- Architecture: `prohairesis (moral choice / ruling faculty)`, `kathekon (appropriate action)`, `katorthoma (perfect action)`, `oikeiosis (appropriation)`, `eudaimonia (flourishing)`, `axia (worth/value)`.

The other rows of the term list (Causal-chain stages, Passions, Eupatheiai, Virtues, Affect descriptors) are unchanged from Revision 3 as adopted at M1-CP5b.

The fallback prose helpers in `/website/src/lib/translation-sandwich/layer3-prose.ts` §6 (`fallbackPhilosophicalReflection`, `fallbackImprovementGuidance`, `fallbackValueErrorSentence`) are reviewed at M1-CP5d for `axia` glossing. The current `fallbackValueErrorSentence` template uses "axia ranking" without a gloss — at M1-CP5d this is updated to gloss `axia (worth/value)` on first use. The other helpers do not currently use `axia` and require no change at M1-CP5d.

### Revision 8 — Third OUTPUT example demonstrating causal-stage variation (Q1 over-imitation correction)

**New worked example added to §3.** A third OUTPUT example is added to the prompt, demonstrating a passion lodged at a causal stage other than `synkatathesis` (the existing Example 1's stage). The third example uses `horme` (impulse stage) — the practitioner has assented to a false judgement and the work to do is at the impulse stage, before the impulse runs into action.

The third example exemplifies, as a contrast pattern to Examples 1 and 2:
- A `horme`-lodged passion (different stage from Example 1's `synkatathesis`-lodged phobos and Example 2's eupatheia case that does not lodge at a causal stage).
- The refined Revision 3 gloss discipline including `axia (worth/value)` glossed on first use.
- The Revision 4 false-judgement framing (criterion of good and evil applied to the false judgement and the mis-categorised indifferent, not to the practitioner's character).
- The Revision 5 marginal-case placement (in this example no marginal-case sentences fire by design — the contrast against Examples 1 and 2 demonstrates that the closing action is the load-bearing pattern, not the marginal-case sentences).
- The Revision 6 peer-rendering of passion + value-error (both observations carry principled findings).
- The Revision 1 closing-line discipline (the field closes on a concrete practice, not on a disclaimer).
- The Revision 7 proportional balance (improvement_guidance ≥ philosophical_reflection by sentence count).

The third example's notes section explicitly flags the over-imitation discipline: the LLM must use the causal stage named in `passion_diagnosis.passions_detected[].causal_stage_affected`, not the stage shown in any OUTPUT example. Examples 1, 2, and 3 demonstrate three distinct stage selections — the variation is the point.

The COMPOSITION CONTRACT is also extended with one explicit instruction: "Use the causal stage named in the assessment (`passion_diagnosis.passions_detected[].causal_stage_affected`), not the stages shown in the OUTPUT examples. The OUTPUT examples illustrate the prose shape across distinct stage selections — they do not constrain stage selection."

This combines Approach (b) (the explicit COMPOSITION CONTRACT instruction) with Approach (a) (stage variation across OUTPUT examples) — the founder elected Approach (a-variant) at session open to combine both for maximum discipline at minimum invasiveness to the existing examples (Examples 1 and 2 are preserved unchanged; Example 3 is additive).

### Implementation scope (M1-CP5d)

Files touched at M1-CP5d:
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` — this Amendment 2 appended (in-place — fifth recurrence of the in-place ADR amendment pattern; PR8 candidate held one more cycle per founder direction at M1-CP5b).
- `/website/src/lib/translation-sandwich/layer3-prose.ts` — `LAYER3_SYSTEM_PROMPT_API_REASON` constant updated: (1) Architecture row of CONTROLLED VOCABULARY adds `axia (worth/value)`; (2) gloss-discipline language strengthened to require gloss on every term in the controlled-vocabulary list, not only terms named in the assessment; (3) new third OUTPUT example added demonstrating `horme`-lodged passion + `axia` + value-error peer rendering; (4) COMPOSITION CONTRACT extended with explicit "use the stage named in the assessment, not the stage in any OUTPUT example" instruction. `fallbackValueErrorSentence` template updated to gloss `axia (worth/value)` on first use.
- `/website/scripts/verify-translation-sandwich.ts` — NO CHANGE. The harness's `GREEK_IDENTIFIERS_TO_CHECK` (lines 1152–1164) is for the inverse direction (every Greek term in prose must appear in the assessment); there is no per-term gloss-on-first-use assertion. The CONTROLLED VOCABULARY list in the prompt is the only governing list for the gloss discipline. The harness's existing assertions (closing-line discipline, single-snapshot/kathekon-null mid-prose placement, EUPATHEIA_BOUNDARY/PRAXIS_MOTIVATION_AMBIGUITY surfacing, cross-fixture coverage) are unchanged and continue to apply.
- `/website/scripts/.translation-sandwich-cache/layer3-{F.id}.json` — F1, F2, F3, F4, F5 caches regenerated against live Sonnet under the new prompt template (founder runs the harness locally with `LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1`).

After M1-CP5d module update + harness re-cache: M1-CP5e (Q2 + Q6) → return-to-M1-CP5-prime (rubric refresh #2) → M1-CP6 cutover.

Estimated time for M1-CP5d: 2–3 hours. Risk class: Elevated (per metadata above). Critical Change Protocol NOT engaged.

### PR8 candidate notes

This Amendment is the **fifth recurrence** of the in-place ADR amendment pattern (Amendments 2026-05-04 first + second; 2026-05-06 (M1-CP4b); 2026-05-07 (M1-CP5b); 2026-05-07 (M1-CP5d) — this Amendment). The founder elected at M1-CP5b to hold the PR8 promotion one more cycle. At M1-CP5d the pattern recurs again — the candidate is held in the open-questions register for another cycle per the same founder direction. The decision-log entry for M1-CP5d names the recurrence count and revisit condition.

---

*End of Amendment 2 — 2026-05-07.*

---

## Amendment 3 — 2026-05-07 — M1-CP5e: Q2 truncation defense + prompt strengthening + Q6 STAGE DISCIPLINE

**Status:** Adopted (founder approval at Sub-session M1-CP5e, 2026-05-07).
**Predecessor decision:** `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` + `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07`.
**Predecessor amendment:** Amendment 2 — 2026-05-07 (M1-CP5d adoption + module changes — Revision 3 term-list refinement + Revision 8 third OUTPUT example).
**Engages rules:** R0 (oikeiosis preserved — Layer 3 prose remains what Circles 1 + 2 of the practitioner experience), R8a (controlled vocabulary preserved — no term changes), R7 (source fidelity preserved — no new claims invented), AC1 (Sonnet retained — no model change), AC8 (translation-sandwich engine surface), KG1 (no DB writes; no fire-and-forget; LLM call still awaited), PR1 (single-endpoint proof — `/api/reason` is the M1 pilot consumer), PR3 (synchronous discipline preserved — `generateProse` remains awaited; the new `stop_reason` check runs synchronously before parsing), PR4 (model selection unchanged — Sonnet per cache Element 6), PR5 (knowledge-gap carry-forward — Q2 root cause re-diagnosed at session open from "extractJSON gap" to "truncation at LLM call"; documented in the decision-log).
**NOT engaged:** AC4, AC5, AC7, PR6 (no R20a perimeter or auth surface touched).
**Risk class:** Standard under 0d-ii. The changes are confined to the parallel-run-dormant Layer 3 module per ADR-004 §6.3; user-facing path remains bundled-depth so changes are dormant in production until M1-CP6 cutover. Critical Change Protocol NOT engaged.

### Why this amendment

Sub-session M1-CP5e (2026-05-07) lands two precautionary refinements identified at return-to-M1-CP5 + carried forward through M1-CP5d:

1. **Q2 — F4 one-off JSON parse failure (M1-CP5c diagnosis + M1-CP5e re-diagnosis).** The F4 failure recorded at M1-CP5c was: `extractJSON: Could not extract valid JSON (2708 chars). Preview: ` ```json `` — Sonnet wrapped the JSON in a markdown fence and the JSON inside was malformed (diagnosed at M1-CP5c as "likely truncation or string-escape issue"). At M1-CP5e the diagnosis was tightened. `extractJSON` already has a six-step fallback chain including markdown-fence stripping at Step 2 (`json-utils.ts` lines 28–37); the fence half of the failure was already handled. The malformed-JSON-internals half was not — none of the six steps can repair a response truncated mid-string at the `max_tokens` cap. The M1-CP5d-amended prompt is verbose (3 OUTPUT examples + extended CONTROLLED VOCABULARY + extended COMPOSITION CONTRACT); responses at standard depth approached the previous 2000-token cap. The session-prompt's framing of Q2 as "extractJSON does not currently strip [markdown fences]" was inaccurate; the real load-bearing problem was upstream of the parser. The fix is targeted: raise `max_tokens` to 3000, add an explicit `stop_reason` check before parsing, and tighten the OUTPUT instruction as belt-and-braces.

2. **Q6 — upstream-causal-chain prose dilution.** Across post-M1-CP5c parallel-run rows the LLM occasionally named upstream stages in prose with confusing framing (e.g., naming both the lodged stage and a stage "upstream" of it, diluting the practitioner-facing focus). The intent: prose names the stage where the work is (the lodged stage). Naming an upstream stage is permissible only when the assessment names the stage as part of the corrective sequence. The fix: a STAGE DISCIPLINE rule added to the philosophical_reflection STRUCTURE section (founder elected over COMPOSITION CONTRACT placement at session open).

Both items are surface-level prose-quality / parse-discipline refinements that do not change the analytical engine (Layer 1 + Layer 2 unaffected). M1-CP6 cutover is deferred until M1-CP5e + return-to-M1-CP5-prime land.

### Q2 — Truncation defense + prompt strengthening (three concrete changes)

Three concrete changes to `/website/src/lib/translation-sandwich/layer3-prose.ts`:

**(i) `max_tokens` default raised from 2000 → 3000.** The M1-CP5d-amended prompt is materially longer than the M1-CP5b version (three OUTPUT examples vs two; extended CONTROLLED VOCABULARY; extended COMPOSITION CONTRACT). Sonnet output runs token-counted, not char-counted, and at standard depth full-sandwich responses approached the previous 2000-token cap. Anthropic bills only on actual output tokens, so the raised cap costs nothing when responses fit in <2000 tokens; the cap is a ceiling, not a target. The change is in `generateProse` at the `params.max_tokens ?? N` default; callers may still override the default with `ProseInput.max_tokens` if needed (e.g., for cost-budgeted parallel-run testing).

**(ii) `stop_reason === 'max_tokens'` check added before parsing.** Anthropic's SDK returns `message.stop_reason` on every response. When `stop_reason` is `"max_tokens"`, the response was truncated mid-content and the JSON will be unterminated; `extractJSON` cannot repair this. The check throws a clear, diagnosable error message naming the cap, the observed `output_tokens`, and the consumer — instead of producing an opaque JSON parse failure six steps later. The route's catch path (ADR-004 §9.3) routes the user to `generateFallbackProse` when this error fires, so production behaviour is unchanged.

**(iii) OUTPUT instruction tightened.** The OUTPUT section heading text changes from `Return ONLY valid JSON conforming to Layer3Prose. No markdown. No commentary outside the JSON.` to `Return ONLY the raw JSON object conforming to Layer3Prose. Do NOT wrap it in markdown fences (no \`\`\`json, no \`\`\`). The first character of your response MUST be \`{\` and the last character MUST be \`}\`. No commentary outside the JSON. No code-block syntax. No prose before or after the JSON.` The closing instruction at the end of the prompt is similarly strengthened from `Return only the JSON.` to `Return only the raw JSON object. First character \`{\`. Last character \`}\`. No markdown fences. No code-block syntax.` This addresses the markdown-fence half of the F4 failure as belt-and-braces — although Step 2 of `extractJSON` already handles fences, the strengthened prompt reduces the rate of fence wrapping in the first place, which reduces the parse-fallback-chain depth and the surface area for compounding malformations.

### Q6 — STAGE DISCIPLINE rule

A new sub-section is added to the philosophical_reflection STRUCTURE section in `LAYER3_SYSTEM_PROMPT_API_REASON`, between the opener bullets and the PREFERRED-INDIFFERENT RENDERING RULE:

> STAGE DISCIPLINE (per Q6 refinement, 2026-05-07):
> Name the stage where the passion is lodged (`passion_diagnosis.passions_detected[].causal_stage_affected`). Do NOT name upstream stages in the prose unless the assessment explicitly names them as part of the corrective sequence — naming multiple stages dilutes the practitioner-facing focus. The third OUTPUT example below demonstrates the correct pattern: `horme` is the lodged stage; `praxis` is named as the downstream stage to prevent, not as an upstream stage. Naming an upstream stage IS permitted when the assessment's corrective path includes it (e.g., when the lodged stage is `horme` but the corrective work is to intercept at `synkatathesis` going forward — there the upstream stage is named because it is where the corrective work happens, not as a redundant reference). The default is single-stage focus; the upstream-stage case is the narrow exception.

The placement (philosophical_reflection STRUCTURE rather than COMPOSITION CONTRACT) is per founder election at session open. Reasoning: the rule applies primarily to the opener and orientation sentences within philosophical_reflection where stage references typically appear. The two related stage rules (this Q6 STAGE DISCIPLINE rule + the M1-CP5d Approach-b "use stage named in assessment, not the stages shown in the OUTPUT examples" rule that lives in COMPOSITION CONTRACT) are separated by section but cohere semantically — both belong to the family "stage discipline within the prose."

### Implementation scope (M1-CP5e)

Files touched at M1-CP5e:
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` — this Amendment 3 appended (in-place — sixth recurrence of the in-place ADR amendment pattern; PR8 candidate held one more cycle per founder direction at M1-CP5b + M1-CP5d).
- `/website/src/lib/translation-sandwich/layer3-prose.ts` — three Q2 changes (`max_tokens` default 2000→3000; `stop_reason === 'max_tokens'` check before `extractJSON`; OUTPUT instruction tightened in both the §3 heading and the closing instruction) + one Q6 change (STAGE DISCIPLINE rule added to philosophical_reflection STRUCTURE section).
- `/website/scripts/verify-translation-sandwich.ts` — NO CHANGE. The harness has no per-stage-discipline assertion; the prompt's STAGE DISCIPLINE rule is the only governing language. No truncation-specific assertion is added either — the `stop_reason` check in `generateProse` already provides explicit diagnostic; if the harness encounters truncation on a future run, the error message names the cap and the output_tokens, which is sufficient for diagnosis.
- `/website/src/lib/json-utils.ts` — NO CHANGE. The investigation at M1-CP5e session open confirmed `extractJSON`'s six-step fallback chain (lines 28–37 + Steps 3–6) already handles markdown fences and two specific malformation patterns (colon-repair, line-removal); the F4 root cause was upstream of the parser (truncation at the LLM call), so the fix is at the LLM call site, not the parser. The session-prompt's framing of Q2 as "extend `extractJSON` with markdown-fence-stripping pre-process" was inaccurate; that pre-process was already in place at Step 2.
- `/website/scripts/.translation-sandwich-cache/layer3-{F.id}.json` — F1–F5 caches regenerated against live Sonnet under the M1-CP5e-amended prompt template + new `max_tokens` cap (founder runs the harness locally with `LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1`).

After M1-CP5e module update + harness re-cache: return-to-M1-CP5-prime (rubric refresh #2 against fresh post-M1-CP5e parallel-run sample) → M1-CP6 cutover.

Estimated time for M1-CP5e: 1.5–2.5 hours. Risk class: Standard (per metadata above). Critical Change Protocol NOT engaged.

### PR8 candidate notes

This Amendment is the **sixth recurrence** of the in-place ADR amendment pattern (Amendments 2026-05-04 first + second; 2026-05-06 (M1-CP4b); 2026-05-07 (M1-CP5b); 2026-05-07 (M1-CP5d); 2026-05-07 (M1-CP5e) — this Amendment). The founder elected at M1-CP5b + M1-CP5d to hold the PR8 promotion one more cycle each time. At M1-CP5e the pattern recurs again — the candidate is held for another cycle per the same founder direction (Amendment 3 sibling option elected at session open without PR8 promotion). Revisit condition: founder explicit revisit, OR promotion at the founder's discretion at any subsequent ADR-amending session.

A second PR8 candidate (in-session prompt-strengthening pattern) is **NOT engaged** this session. The Q2 prompt-strengthening landed in M1-CP5e was planned in the session prompt — not produced after observing harness drift in a same-session run. The PR8 in-session prompt-strengthening pattern is specifically the after-observed-drift case (M1-CP3 first amendment 2026-05-04; M1-CP3 second amendment 2026-05-04; M1-CP5c 2026-05-07 — three recurrences); M1-CP5e's prompt strengthening is pre-emptive and does not advance the count. Revisit condition: next observed-drift recurrence.

---

*End of Amendment 3 — 2026-05-07.*

---

*End of ADR-007.*
