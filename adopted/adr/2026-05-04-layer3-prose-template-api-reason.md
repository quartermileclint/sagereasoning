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
- Marginal/undecidable assessments MUST be named explicitly. Do not flatten them, do not skip them, do not paper over them with generic forward-looking prose. Specifically:
    - is_kathekon: null → "the action's appropriateness cannot be determined from the available evidence" (or close paraphrase)
    - direction_of_travel: "single_snapshot" → "this is a single snapshot; no trajectory data is available" (or close paraphrase)
    - improvement_path_structured: null → "no specific improvement path identified at this time" (or close paraphrase)
- The practitioner is the agent who submitted the input. Address them in second person ("you", "your"). Do not refer to them in the third person.

PROSE FIELDS

1. philosophical_reflection (2–3 sentences, ~40–80 words)
   - Open with the principal Stoic dynamic in the assessment: the most-prominent passion (passion_diagnosis.passions_detected[0]) and its false judgement, OR the principal control-filter pattern (when no passions detected), OR the principal oikeiosis tension (when no passions and no control conflict).
   - Connect to the agent's katorthoma_proximity (reflexive | habitual | deliberate | principled | sage_like) and the engaged virtue_domains_engaged.
   - Close with one sentence of philosophical orientation drawn from the assessment's correct_judgements (when present) or the assessment's ruling_faculty_state.

2. improvement_guidance (1–3 sentences, ~30–80 words)
   - If improvement_path_structured is non-null: name the false_judgement_to_correct, the corrected_judgement, and which mechanism (mechanism_applies) the correction belongs to. Use second person.
   - If control_filter.disambiguation_required is non-empty: add one sentence inviting the agent to reflect on whether the named items are within or outside their moral choice. Cap at 2–3 items; if more, name two and add "and others".
   - If improvement_path_structured is null: state "no specific improvement path identified at this time" and close with a one-sentence reflective prompt drawn from oikeiosis or value_assessment.

3. summary (one sentence, ~15–30 words)
   - Name the agent's katorthoma_proximity + the principal issue (the primary passion's false_judgement OR the principal oikeiosis tension OR the kathekon verdict). Plain language.

CONTROLLED VOCABULARY (R8a)

You MAY use Greek identifiers (epithumia, hedone, phobos, lupe; phantasia, synkatathesis, horme, praxis; phronesis, dikaiosyne, andreia, sophrosyne; oikeiosis; kathekon; prohairesis) when the assessment names them. Translate them once for the practitioner (e.g., "phobos (fear)") on first use within a single prose field. Do not introduce Greek terms the assessment did not name.

OUTPUT

Return ONLY valid JSON conforming to Layer3Prose. No markdown. No commentary outside the JSON.

{
  "version": "layer3-prose-v1",
  "layer2_assessment_version": "layer2-assessment-v1",
  "consumer": "api_reason",
  "philosophical_reflection": "Your repeated checking of the phone reflects phobos (fear) lodged at the assent stage, where you are treating her response as something genuinely good rather than as a preferred indifferent. Your reasoning is currently deliberate but the false judgement that her opinion determines your worth is engaging phronesis (practical wisdom) without yet stabilising it. The correct view is that her judgement is outside your prohairesis; your character and your impulses are within it.",
  "improvement_guidance": "The false judgement to correct is the assumption that another's response constitutes evidence of your standing. Replace it with the assessment that her response is one external among many and your worth rests in your own ruling faculty. This is a passion-diagnosis correction at the synkatathesis stage — work it at the moment of impression, before you assent.",
  "summary": "Your reasoning is deliberate but lodged at the assent stage of phobos, where the false judgement that another's response determines your worth requires correction.",
  "source": "llm"
}

Use the EXACT JSON keys shown above (e.g. "philosophical_reflection", not "reflection"; "improvement_guidance", not "guidance"; "layer2_assessment_version", not "assessment_version"). Use the EXACT enum values shown ("layer3-prose-v1", "layer2-assessment-v1", "api_reason", "llm"). Do not add fields not in the example.

If the assessment has no passions_detected, no oikeiosis tensions, no control conflicts, and no value errors, the prose still produces all three fields — describe the agent's katorthoma_proximity and ruling_faculty_state, and use the marginal-case phrasing for any null/marginal mechanism.

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

- **`philosophical_reflection`:** template strings keyed by `katorthoma_proximity` + `passion_diagnosis.passions_detected.length`. Five base templates (one per proximity value) × two passion-presence states.
- **`improvement_guidance`:** template strings keyed by `improvement_path_structured.mechanism_applies` (when non-null) or by the marginal-case template (when null).
- **`summary`:** templated as `"Your reasoning is {proximity}. {primary_issue_phrase}."` where `primary_issue_phrase` is selected from a small lookup keyed by which mechanism produced the principal issue.

The fallback templates are listed in the implementation; they are deliberately less varied than the LLM prose. This is the explicit intent — the user sees a working response, not a polished one, when Layer 3 fails.

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

---

*End of ADR-007.*
