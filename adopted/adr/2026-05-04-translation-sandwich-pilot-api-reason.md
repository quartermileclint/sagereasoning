# ADR-004 — Translation-Sandwich Engine Pilot on `/api/reason`

**Status:** Adopted (founder approval at Sub-session E10, 2026-05-04 — "Approve as drafted" with no edits).
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04` (E9 — codification of the migration); `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` (E8 — framing origin).
**Related deliverables:** `/adopted/adr/2026-05-04-depth-architecture-migration.md` (ADR-003 — names the migration); `/manifest.md` AC8 (binds the migration); `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — Pattern A1/A2); `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002 — α loop pattern); `/website/src/lib/sage-reason-engine.ts` (today's bundled-depth `runSageReason`); `/website/src/app/api/reason/route.ts` (the pilot consumer).
**Engages:** R0 (oikeiosis — the migration serves Circle 3 + 4 by aligning the engine with the project's design intent); R4 (server-side reasoning IP unchanged); R5 (cost guardrail — parallel-run doubles per-request cost during pilot); R7 (source fidelity — Layer 1 RAG retrieval unchanged); R10 (skill marketplace — public API contract changes at cutover); AC1 (model selection — Layer 1 + Layer 3 = Sonnet); AC4 (invocation testing — R20a perimeter must be Verified for the new engine); AC5 (R20a perimeter — `/api/reason` is one of the eight bound routes); AC6 (four-layer context architecture — translation-sandwich layers compose inside L1 + L3 placement rules); AC7 (NOT engaged — no auth/cookie/session/redirect surface touched at engine layer); AC8 (newly engaged — this is the first migration consumer); KG1 (Vercel five rules — per-request cache lifetime; await all calls; no fire-and-forget); KG2 (Haiku reliability boundary — Layer 1 + Layer 3 require Sonnet); KG6 (composition order — layers sit inside the existing L1/L2/L3 four-layer architecture); PR1 (single-endpoint proof — `/api/reason` is the pilot before generalising); PR4 (model selection unbundled from depth-tier); PR6 (safety-critical changes — R20a perimeter preservation is Critical at every checkpoint).

---

## Context

### What this ADR resolves

ADR-003 names the translation-sandwich as the target architecture and the migration sequence (M1 pilot on `/api/reason` → M2 score family → M3 mentor family → M4 skill family → M5 scaffolding retirement). ADR-003 explicitly defers to a downstream ADR for the pilot's exact wiring shape, schema decisions, fallback semantics, verification harness, cutover mechanics, and the multi-session checkpoint structure required by a Critical-tier multi-session arc.

ADR-004 is that downstream ADR. It specifies the M1 pilot in enough detail that subsequent build sessions can proceed under the Critical Change Protocol with a clear contract. It does not specify the deterministic mechanism algorithm at the level of pseudocode — that is the work of the Layer 2 build session, which produces its own per-mechanism ADR-005 (or equivalent number).

### What this ADR does not resolve

- Per-mechanism deterministic rules at Layer 2 (deferred to the Layer 2 build session — checkpoint M1-CP2).
- The exact verification harness fixture set (deferred to the harness build session — checkpoint M1-CP4).
- The cost budget for the parallel-run period (founder decides at checkpoint M1-CP4 based on observed parallel-run data).
- The cutover criteria (founder decides at checkpoint M1-CP5 based on comparison data; the criteria themselves are listed below as a default starting point).
- M2 (score family), M3 (mentor family), M4 (skill family) consumer wiring under the new engine. Each gets its own ADR.

## Decision

### 1. Pilot consumer

`/api/reason`. Per ADR-003 §"Migration sequence" M1. Single user-facing consumer; defaults to `'standard'` depth; the reference implementation that Pattern A1 + Pattern A2 (per ADR-001 + ADR-002) derive from. Already in the R20a perimeter (per AC5).

The route's existing wiring at `/website/src/app/api/reason/route.ts` is preserved through the parallel-run period: rate limiting, authentication, R20a distress check (line 144), text-length validation, depth-parameter validation, per-request RAG cache, and parallel L1 + L2 + L3 context loading (lines 162–170). The translation-sandwich engine sits inside the route's existing call to `runSageReason`; the route's outer behaviour is unchanged until cutover.

### 2. Schema redesign (Decision A — full redesign)

The translation-sandwich engine produces a redesigned output schema for `/api/reason`. The new schema is structurally distinct from today's bundled-depth output and exposes the three-layer architecture to the caller. Field-level specification is the work of the Layer 3 build session; the high-level shape is fixed here.

#### 2.1 Top-level shape

```
{
  "version": "translation-sandwich-v1",
  "extraction": { ... },        // Layer 1 output — feature schema
  "assessment": { ... },        // Layer 2 output — deterministic mechanism application
  "prose": { ... },             // Layer 3 output — per-consumer prose envelope
  "meta": { ... },              // engine metadata, model attribution, latency, cost
  "disclaimer": "..."           // R3 evaluative disclaimer (unchanged)
}
```

#### 2.2 `extraction` block — Layer 1 output

Field-level specification deferred to checkpoint M1-CP1. Required content categories:

- `passions_present` — list of passions detected in the input, mapped to root passion + sub-species per the existing taxonomy (epithumia / hedone / phobos / lupe).
- `control_filter_elements` — items the agent has named as within / outside their moral choice (eph' hemin).
- `oikeiosis_circles_engaged` — which of the 5 expanding circles the input touches.
- `value_categories_at_stake` — which preferred indifferents (Life, Health, Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth, and negatives).
- `kathekon_factors` — natural relationships, role obligations, justification quality named in the input.
- `urgency_indicators` — language patterns suggesting time pressure.
- `causal_stage_evidence` — textual evidence supporting placement at phantasia / synkatathesis / horme / praxis.

Layer 1 is extraction-only. It does not assess, judge, or recommend. It produces a deterministic-shape JSON schema.

#### 2.3 `assessment` block — Layer 2 output

Field-level specification deferred to checkpoint M1-CP2. Required content categories:

- `passion_diagnosis` — assessed false judgements per detected passion; causal-stage placement; correct judgements opposing the false ones.
- `control_filter` — partitioned within / outside prohairesis.
- `oikeiosis` — circle-by-circle obligation status, tension, deliberation notes; Cicero's five questions applied where relevant.
- `value_assessment` — per-indifferent: axia (high / moderate / low) and treated-as (indifferent / good / evil); identified value errors.
- `kathekon_assessment` — is_kathekon (boolean); quality (strong / moderate / marginal / contrary); justification.
- `iterative_refinement` — when applicable: Senecan grade (pre_progress / grade_1 / grade_2 / grade_3); progress dimensions (passion reduction, judgement quality, disposition stability, oikeiosis extension); direction of travel.
- `katorthoma_proximity` — reflexive / habitual / deliberate / principled / sage_like.
- `ruling_faculty_state` — disposition stability descriptor.
- `virtue_domains_engaged` — phronesis / dikaiosyne / andreia / sophrosyne.
- `improvement_path_structured` — structured form (not prose): which false judgement to correct, what mechanism applies, what the corrected judgement looks like.
- `stage_scores` — per-mechanism quality (strong / adequate / weak / not_applied).
- `hasty_assent_risk` — when urgency_context is present: high / moderate / low / none.

Layer 2 is deterministic code. No LLM. Given the same Layer 1 schema, Layer 2 produces the same `assessment` block — idempotency is part of the contract.

#### 2.4 `prose` block — Layer 3 output

Field-level specification deferred to checkpoint M1-CP3. Required content categories for `/api/reason`:

- `philosophical_reflection` — 2–3 sentences of Stoic prose drawn from the assessment block.
- `improvement_guidance` — actionable prose for the caller, derived from `improvement_path_structured`.
- `summary` — one-sentence summary of the assessment.

Layer 3 is per-consumer. `/api/reason`'s Layer 3 prompt template differs from `/api/score-*`'s Layer 3 prompt template (when those consumers migrate at M2). Each consumer's Layer 3 output is documented in its own migration ADR.

#### 2.5 `meta` block

Carries engine attribution: which engine version, which model for Layer 1, which model for Layer 3, latency for each layer, total latency, cost estimate (USD), retry counts, fallback flags. The route's existing `meta` shape is extended; existing fields preserved for parallel-run comparison.

### 3. Layer 1 specification

#### 3.1 Module surface

New module: `/website/src/lib/translation-sandwich/layer1-extractor.ts`. Exports:

```typescript
export async function extractFeatures(
  params: ExtractInput
): Promise<Layer1Schema>
```

Input shape `ExtractInput`: input text; optional context; optional domain_context; optional urgency_context; the route-supplied stoicBrainContext (Layer 1 RAG block from D6 + D7 — passed unchanged); the route-supplied practitionerContext + projectContext (Layers 2 + 3 of the four-layer context architecture).

Output shape `Layer1Schema`: the deterministic-shape JSON specified at §2.2 above.

#### 3.2 LLM call

Model: **Sonnet** (`MODEL_DEEP`) per AC1 row "Layer 1 translation (alt-3)". Multi-step structured feature extraction is outside Haiku's reliability boundary (KG2).

Max tokens: deferred to M1-CP1 (proposed default: 4000 — Layer 1's output is structured but smaller than today's bundled-depth output because there is no reasoning content).

Temperature: 0.2 (matches existing `runSageReason`).

System prompt: extraction-only. Names the schema fields and asks the LLM to populate them from the input. Does NOT ask the LLM to reason, assess, or recommend. The system prompt for Layer 1 is shorter than today's depth-tier prompts because it has no reasoning instructions.

#### 3.3 R7 + R8a + AC6 compliance

- R7 (source fidelity): Layer 1 receives the route's `stoicBrainContext` (the formatted RAG block from D6 + D7 — passages with `[source_citation]` headers per the existing `formatRetrievedPassagesAsBlock`). Citations are preserved through to Layer 3.
- R8a (controlled vocabulary): Layer 1's output uses the existing Greek identifiers (epithumia, hedone, phobos, lupe; phantasia, synkatathesis, horme, praxis; phronesis, dikaiosyne, andreia, sophrosyne).
- AC6 (four-layer context architecture): Layer 1's call places the RAG block in the system message (cached); the practitioner + project + environmental + mentor-knowledge-base contexts in the user message (per-request). Same placement as today's bundled engine.

### 4. Layer 2 specification

#### 4.1 Module surface

New module: `/website/src/lib/translation-sandwich/layer2-mechanisms.ts`. Exports:

```typescript
export function applyMechanisms(
  schema: Layer1Schema,
  options?: ApplyOptions
): Layer2Assessment
```

Input: the Layer 1 schema.
Output: the Layer 2 assessment block specified at §2.3.

Synchronous, deterministic, no I/O. Per PR3 (safety systems are synchronous) — Layer 2 must complete before Layer 3 is called; no background work; no fire-and-forget.

Per PR4 (model selection is a constraint): Layer 2 has no model. The "constraint" satisfied here is the absence of an LLM call.

#### 4.2 Per-mechanism approach

Detailed deterministic rules deferred to checkpoint M1-CP2. High-level approach per mechanism:

- **Control filter:** binary partition. Iterate over the input's named items (extracted at Layer 1); each is classified as within or outside prohairesis using a lookup table of categorical rules (judgements / impulses / desires / aversions / character → within; external outcomes → outside). When the Layer 1 extraction is ambiguous, default to "outside" with a flag in `assessment.control_filter.disambiguation_required`.

- **Passion diagnosis:** rule-based mapping. Each `passions_present[i]` from Layer 1 is associated with its root passion (per the taxonomy) and the false judgement it implies. The false judgement is matched against the input's `causal_stage_evidence` to place at phantasia / synkatathesis / horme / praxis. Correct judgements are derived from the canonical Stoic correction for each passion (lookup table).

- **Oikeiosis:** circle-by-circle assessment using Cicero's five questions (Is it honourable? More honourable? Advantageous? More advantageous? Honourable prevails?). For each circle in `oikeiosis_circles_engaged`, the rules engine applies the questions in order; obligations and tensions are computed from the answers.

- **Value assessment:** per-indifferent computation. For each item in `value_categories_at_stake`, axia (high / moderate / low) is fixed by the canonical Stoic ranking (Life, Health > Pleasure, Beauty, Strength, Wealth, Reputation, Noble birth > negatives). Treated-as is computed from the input's framing (good / evil / indifferent). Value error = treated-as confused with axia.

- **Kathekon assessment:** four-rule check. (1) Is there a natural relationship? (2) Is there reasonable justification in the input? (3) Are role obligations engaged? (4) Is the action proportionate? Quality (strong / moderate / marginal / contrary) is computed from the count and weight of satisfied rules.

- **Iterative refinement:** four-dimension assessment. Senecan grade is computed from the cumulative pattern across passion reduction, judgement quality, disposition stability, oikeiosis extension. Direction of travel is improving / stable / declining based on the input's temporal markers.

- **Derived fields:** katorthoma_proximity, ruling_faculty_state, virtue_domains_engaged are computed from the six mechanisms' results via lookup rules. Improvement_path_structured is computed by selecting the most prominent false judgement and naming the canonical correction.

#### 4.3 Determinism guarantee

Given the same `Layer1Schema` input, `applyMechanisms` produces the same `Layer2Assessment` output. Verified at checkpoint M1-CP2 by idempotency tests (run the function twice with the same input; outputs deep-equal).

### 5. Layer 3 specification

#### 5.1 Module surface

New module: `/website/src/lib/translation-sandwich/layer3-prose.ts`. Exports:

```typescript
export async function generateProse(
  assessment: Layer2Assessment,
  params: ProseInput
): Promise<Layer3Prose>
```

Input: the Layer 2 assessment + per-consumer parameters (consumer name, prose template variant).
Output: the prose block specified at §2.4 — `philosophical_reflection`, `improvement_guidance`, `summary` for `/api/reason`.

#### 5.2 LLM call

Model: **Sonnet** (`MODEL_DEEP`) per AC1 row "Layer 3 translation (alt-3)". Per-consumer prose generation requires reliable structured output; outside Haiku's reliability boundary (KG2).

Max tokens: deferred to M1-CP3 (proposed default: 2000 — Layer 3's output is short prose, not analysis).

Temperature: 0.3 (slightly higher than Layer 1 to allow prose variation).

System prompt: per-consumer template. For `/api/reason`, the prompt receives the assessment block as JSON and asks the LLM to produce the three prose fields. The prompt does NOT ask the LLM to reason, judge, or recommend — those are already in the assessment. The LLM's job is to render the assessment into accessible prose.

#### 5.3 Composition with assessment

Layer 3's prose must be consistent with Layer 2's assessment. Verified at checkpoint M1-CP3 by consistency tests: extract claims from the prose, check each claim against the assessment, fail the test if the prose contradicts or omits the canonical assessment.

### 6. Cutover mechanics — Decision B parallel-run

#### 6.1 Parallel-run shape

During the parallel-run period (between checkpoint M1-CP4 and M1-CP6), `/api/reason` calls both engines on every request:

```
1. Bundled-depth engine (today's runSageReason) — result returned to user.
2. Translation-sandwich engine (new layer-separated path) — result logged for offline comparison.
```

User receives the bundled-depth result. Translation-sandwich result is written to a comparison log (Supabase table `translation_sandwich_comparisons` — schema deferred to M1-CP4) for offline analysis.

#### 6.2 Cost discipline

Parallel-run doubles the per-request LLM cost for `/api/reason`. R5 cost-health alerts engage during the parallel-run period. The founder approves the parallel-run cost budget at checkpoint M1-CP4 with an explicit cap (proposed default: 14 days OR $50 OR 1000 requests, whichever first). When the cap is reached, parallel-run is paused; cutover or rollback is decided at M1-CP5.

#### 6.3 Failure isolation

A failure in the translation-sandwich engine during parallel-run does NOT affect the user's response. The route catches all translation-sandwich errors, logs them, and returns the bundled-depth result. This is the explicit guarantee of B-3: zero user impact during the proof.

#### 6.4 Comparison rubric

Under A-2 (full redesign), the translation-sandwich output schema is structurally different from the bundled-depth output. Comparison cannot be field-by-field equality. The comparison rubric:

- **Proximity match:** does Layer 2's `katorthoma_proximity` match the bundled-depth output's `katorthoma_proximity`? (categorical match — same value)
- **Virtue domains overlap:** Jaccard similarity between Layer 2's `virtue_domains_engaged` and bundled-depth's `virtue_domains_engaged`. Threshold deferred to M1-CP5.
- **Passions detected match:** sets of detected passions compared. Threshold deferred to M1-CP5.
- **Causal stage agreement:** Layer 2's causal stage placement vs bundled-depth's causal stage placement.
- **Stage scores agreement:** per-mechanism stage scores compared.
- **Prose quality:** independent — Layer 3's prose is not directly comparable to bundled-depth's prose; spot-checked by founder during the parallel-run period.

The comparison data informs the cutover decision at M1-CP5.

### 7. Verification harness — Decision C new harness

#### 7.1 Harness file

New file: `/website/scripts/verify-translation-sandwich.ts`. Sibling to `verify-reason-rag.ts` (which continues unchanged for the bundled engine until M5).

#### 7.2 Phases

Detailed fixture set deferred to M1-CP4. Required phases:

- **Phase 1 — Layer 1 extraction completeness.** For each fixture, Layer 1 produces a non-empty schema with all required content categories.
- **Phase 2 — Layer 1 schema fidelity.** Required-fields validation: every key in `Layer1Schema` is present (or explicitly marked absent).
- **Phase 3 — Layer 2 determinism.** For each fixture, run Layer 2 twice with the same Layer 1 input; outputs deep-equal.
- **Phase 4 — Layer 2 coverage.** Every mechanism produces output for at least one fixture; no mechanism silently absent.
- **Phase 5 — Layer 3 prose-assessment consistency.** Extract claims from prose; check each against Layer 2 assessment.
- **Phase 6 — End-to-end orchestration.** Layer 1 → Layer 2 → Layer 3 composes correctly; the route's response shape matches §2.1.
- **Phase 7 — R20a perimeter preservation.** The distress check at `/api/reason` line 144 fires once per request before any layer is called. Verified by AC4 invocation testing (grep + execution path proof).
- **Phase 8 — Fallback semantics.** Layer 1 throws → bundled-depth result returned. Layer 3 throws → bundled-depth result returned. User-visible behaviour unchanged on any failure path.
- **Phase 9 — Cost + latency reporting.** Each fixture reports per-layer latency, total latency, per-layer cost estimate, total cost estimate. Output is the data for the cutover decision at M1-CP5.

#### 7.3 Retirement

`verify-translation-sandwich.ts` is deleted at M5 alongside the bundled-depth scaffolding retirement. `verify-reason-rag.ts` (the existing bundled-engine harness) is also deleted at M5. A unified post-M5 harness is named in the M5 ADR.

### 8. R20a perimeter preservation

Per AC5: `/api/reason` is one of the eight bound R20a routes. Per PR6 + AC4: any change touching the R20a perimeter is Critical. The translation-sandwich engine MUST NOT bypass the existing distress check at `/api/reason` line 144.

Concretely:

- The route's existing `await enforceDistressCheck(detectDistressTwoStage(input))` at line 144 is unchanged.
- The translation-sandwich engine is called inside the route, AFTER the distress check passes.
- If the distress check returns `shouldRedirect: true`, the route returns the redirect response WITHOUT calling either engine.
- Phase 7 of the verification harness asserts this invocation path under both engines (parallel-run preserves the perimeter for both engines).

The R20a perimeter is engine-agnostic by design: the check fires before any reasoning, regardless of which engine processes the request.

### 9. Fallback semantics

#### 9.1 Layer 1 failure

If `extractFeatures` throws (LLM failure, parse failure, validation failure, timeout, network error):

- During parallel-run: the translation-sandwich path is abandoned for this request. The bundled-depth result is returned to the user. The failure is logged via `console.warn` with the route name (`/api/reason`) and the failure category.
- After cutover: the route returns the bundled-depth result as a fallback. The bundled engine remains operational throughout the migration until M5.

#### 9.2 Layer 2 failure

Layer 2 is deterministic code. It cannot throw under correct inputs. Defensive: if Layer 2 throws (programming error), the same fallback as Layer 1 applies. Phase 3 of the harness verifies determinism; Phase 4 verifies coverage. A Layer 2 throw in production indicates a regression and triggers immediate rollback.

#### 9.3 Layer 3 failure

If `generateProse` throws (LLM failure, parse failure, validation failure, timeout, network error):

- The Layer 1 + Layer 2 result is preserved (the assessment block is complete).
- During parallel-run: bundled-depth result returned; translation-sandwich failure logged.
- After cutover: the route returns a partial response — the assessment block + a fallback prose template generated deterministically from the assessment (canned per-consumer template). The user sees a working response with possibly less varied prose; Layer 3 failure does not strand the user.

### 10. Multi-session checkpoint structure

The M1 pilot is a multi-session arc. Each checkpoint is a self-contained session under the Critical Change Protocol (per PR6 + AC5). The checkpoints are sequential; the founder approves advancement between checkpoints.

| Checkpoint | Name | Deliverable | Risk class |
|---|---|---|---|
| **M1-CP1** | Layer 1 module Wired + standalone-verified | `layer1-extractor.ts` exists, exports `extractFeatures`, produces a non-empty `Layer1Schema` against fixtures. Standalone harness phase 1 + 2 pass. ADR-005 (or equivalent number) drafted naming the exact `Layer1Schema` field-level specification + Layer 1 system prompt. | Standard (new module; not yet wired into route). |
| **M1-CP2** | Layer 2 module Wired + standalone-verified | `layer2-mechanisms.ts` exists, exports `applyMechanisms`, produces a non-empty `Layer2Assessment`. Standalone harness phase 3 + 4 pass. ADR-006 (or equivalent number) drafted naming the per-mechanism deterministic algorithm. | Standard (new module; deterministic code). |
| **M1-CP3** | Layer 3 module Wired + standalone-verified | `layer3-prose.ts` exists, exports `generateProse`, produces a non-empty `Layer3Prose`. Standalone harness phase 5 pass. ADR-007 (or equivalent number) drafted naming the `/api/reason` Layer 3 prompt template. | Standard (new module; not yet wired into route). |
| **M1-CP4** | End-to-end orchestration + parallel-run wired | `/api/reason` route extended to call both engines. Comparison log table created in Supabase. Harness phases 6 + 7 + 8 + 9 pass. Founder approves parallel-run cost budget + duration cap. | **Critical** (R20a perimeter; deployment-config; user-facing route change). Critical Change Protocol applies. |
| **M1-CP4b** | ADR amendments for AC-14 + Tier 2 soft-clarification (added 2026-05-06) | ADR-005 + ADR-006 + ADR-007 amended for the four engine-level intake triggers: EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY (Tier 3 OPEN_DEFERRAL per AC-14) and STATED_OPERATIVE_CONFLICT + STATED_EQUANIMITY_UNVERIFIED (Tier 2 soft-clarification per AC-13). Tier 1 force-clarification triggers (ELEMENT_FUSION / SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY) explicitly out of scope here — they engage at M1-CP4d/4e. ADR-004 §10 amendment (this row's insertion). | Standard (governance — documentation only; no production touch). |
| **M1-CP4c** | Layer 1/2/3 module updates for AC-14 + Tier 2 (added 2026-05-06) | `layer1-extractor.ts` + `layer2-mechanisms.ts` + `layer3-prose.ts` updated to implement the M1-CP4b spec. Harness extended with F5 (eupatheia-shape) + F6 (stated-equanimity-with-passion) fixtures + Phase 5 assertions 8 + 9 + 10. Modules re-verified standalone. | Standard (code; modules; not yet wired into route's parallel-run orchestrator). |
| **M1-CP4d** | Multi-turn input flow design ADR for AC-13 Tier 1 (added 2026-05-06) | New ADR drafted naming the architecture for `/api/reason` Tier 1 force-clarification (ELEMENT_FUSION / SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY). Founder design call: server-side ephemeral session vs client-renders-form stateless protocol vs Tier 1 deferred to a later milestone. Companion ADR-005 + ADR-006 amendments for Tier 1 trigger fields (deferred to M1-CP4e if Tier 1 is in scope; collapsed into this checkpoint if Tier 1 is deferred). | Standard (governance). |
| **M1-CP4e** | Layer 1/2/3 module + route updates for AC-13 Tier 1 (added 2026-05-06) | Module + route updates per M1-CP4d's chosen path. Touches the R20a perimeter route; may touch auth/session if server-side flow is chosen. May be skipped entirely if M1-CP4d defers Tier 1 to a later milestone. | **Critical** (perimeter + possibly AC7 cookie/session surface). Critical Change Protocol applies. |
| **M1-CP4f** | parallel-run.ts orchestrator + comparison-table baseline reset + per-layer cost capture + admin/test-reason fixtures (added 2026-05-06) | `parallel-run.ts` updated to capture `intake_clarifications` outputs in comparison data; per-layer cost capture wired (`extractFeatures` + `generateProse` token-usage exposed; `incrementCostTracker` writes real Sonnet costs); `translation_sandwich_comparisons` truncated or filtered against a cutover timestamp so M1-CP5 rubric data is from the with-mechanism engine only; `/admin/test-reason` fixture set extended to exercise Tier 1/2/3 triggers per the d-a16 catalogue + JSON export button for offline analysis. | Elevated (orchestrator + DB DML + admin surface; user-facing parallel-run path remains dormant by default). |
| **M1-CP5** | Parallel-run observation + cutover decision | Parallel-run period concludes. Comparison data analysed against the with-mechanism engine only (post-M1-CP4f baseline reset). Cost + latency observed against R5 thresholds. Founder reviews data and decides: cutover (advance to CP6), revise (revisit Layer specifications), or rollback (revert parallel-run; revisit ADR-003). | Standard (analysis; no code change unless rollback). |
| **M1-CP6** | Cutover — `/api/reason` switches to translation-sandwich | The bundled-depth call is removed from `/api/reason`. The translation-sandwich engine is the sole user-facing path. Bundled engine remains in `/website/src/lib/sage-reason-engine.ts` as scaffolding for M2/M3/M4 consumers. | **Critical** (R20a perimeter; user-facing API shape change under A-2; agent developer breaking change). Critical Change Protocol applies. R10 announcement required. |

The founder may insert additional checkpoints, merge checkpoints, or revise the sequence at any session-open. The structure above is the proposed minimum; PR1 single-endpoint discipline favours more checkpoints, not fewer.

The M1-CP4b → M1-CP4f sub-session block was inserted on 2026-05-06 per `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05`. The architectural reasoning: cutover at M1-CP6 commits the translation-sandwich engine as the sole user-facing path on `/api/reason`; that engine must honour the architecturally adopted withholding-as-kathekon discipline (`/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-13 + AC-14) at cutover, not be patched after. The sub-session block adds the trigger detection + prose paths during the parallel-run period when the user-facing shape is still bundled-depth (per §6.3 failure-isolation guarantee), so the wiring carries no user-facing risk. M1-CP5 resumes against a comparison-table reset to the with-mechanism engine only (per M1-CP4f's baseline reset), so the cutover decision is informed by data from the engine that will actually ship.

#### 10.1 Inter-checkpoint state

Between checkpoints, the bundled-depth engine remains the user-facing path. No partial cutover; no production behaviour change before M1-CP4 (and after M1-CP4, the parallel-run path is env-flag-gated and dormant by default; the user-facing shape remains bundled-depth until M1-CP6 cutover per §6.3 failure-isolation guarantee). The translation-sandwich modules (`layer1-extractor.ts`, `layer2-mechanisms.ts`, `layer3-prose.ts`) exist in `/website/src/lib/translation-sandwich/` but are not imported by any route until M1-CP4. The M1-CP4b → M1-CP4f sub-session block (added 2026-05-06) preserves this posture: the parallel-run path remains dormant by default; the env flag `TRANSLATION_SANDWICH_PARALLEL_RUN` remains under founder control; module changes affect only the comparison log, not the user-facing response, until M1-CP6.

#### 10.2 Rollback at each checkpoint

- M1-CP1, CP2, CP3: `git revert` of the module commit. No production effect.
- M1-CP4: `git revert` of the parallel-run wiring commit. The route returns to bundled-depth-only. No data loss; the comparison log table is preserved for analysis.
- **M1-CP4b** (added 2026-05-06): `git revert` of the ADR-amendment commit. No production effect — documentation-only change.
- **M1-CP4c** (added 2026-05-06): `git revert` of the module-update commit. Standalone harness reverts to pre-amendment state. No production effect (parallel-run remains dormant by default; if active, the parallel path produces comparison data without the new `intake_clarifications` fields — preserves the M1-CP4 contract).
- **M1-CP4d** (added 2026-05-06): `git revert` of the design ADR commit. No production effect — documentation-only change.
- **M1-CP4e** (added 2026-05-06): `git revert` of the route + module commit. The route's parallel-run handling reverts to pre-Tier-1 behaviour. Critical Change Protocol applies — the perimeter route is touched (and possibly auth/session surface). Same rollback discipline as M1-CP4: explicit verification step + named-risk approval before deployment.
- **M1-CP4f** (added 2026-05-06): `git revert` of the orchestrator commit. Per-layer cost capture reverts; comparison-table truncation is not reversed (DB DML once committed; the data simply continues to accumulate post-rollback). The fixture-set + export-button reverts at the admin surface.
- M1-CP5: rollback is the decision itself (revert parallel-run wiring per CP4 rollback).
- M1-CP6: `git revert` of the cutover commit. The route returns to bundled-depth-only. Note: any external agent developers who consumed the new schema between cutover and rollback will see the schema revert to today's shape — public communication required.

## Pattern variant naming

For cross-reference in future sessions, the layer-separated engine wired through `/api/reason` is named the **translation-sandwich pilot wiring**. The new module triplet is named **the Layer 1/2/3 module triplet** or **the layer-separated module set**. The parallel-run mode is named **the M1 parallel-run period**.

## Consequences

### Positive

- The migration begins with a concrete, named multi-session structure. M1 is no longer "the pilot" in the abstract; it is six numbered checkpoints with risk classes, deliverables, and rollback paths.
- The translation-sandwich architecture is proven on the simplest user-facing consumer first (PR1 discipline). Subsequent migrations (M2/M3/M4) inherit a verified pattern.
- The parallel-run mode provides empirical data on schema fidelity, cost, and latency BEFORE the cutover commits to the new engine. R5's 2x revenue-to-cost threshold can be evaluated against measured costs, not projections.
- Layer 2's deterministic code makes the Stoic mechanism application visible, auditable, and revisable. The R0 oikeiosis intent — that the engine reasons by principled mechanism, not by LLM defaults — is realised at the canonical reasoning step.
- The verification harness (`verify-translation-sandwich.ts`) provides standalone proof for each layer plus end-to-end orchestration proof, with explicit R20a perimeter preservation per AC4.

### Negative / known costs

- Six-checkpoint multi-session arc. Each checkpoint is at least one session; M1-CP4 + CP6 are Critical-tier. Total session count for M1: minimum six, more likely eight to ten (founder revises checkpoints; some checkpoints may need multiple sessions).
- Parallel-run doubles per-request LLM cost during the observation period. R5 cost-health alerts will engage. Founder approves the budget cap explicitly at M1-CP4.
- Under A-2 full redesign: the cutover at M1-CP6 is a breaking change for `/api/reason`'s public API consumers. Every M2/M3/M4 migrated consumer also adopts the new shape — bigger migration sessions. External agent developers consuming `/api/reason` see breaking output-shape change at cutover.
- Bundled engine remains operational throughout M1–M4 (per ADR-003 + AC8). Two engine surfaces in the codebase during the migration: increased maintenance cost; risk of drift between bundled-depth defaults and translation-sandwich outputs.
- Layer 2's deterministic algorithm is the largest unknown in the M1 arc. Its specification (at M1-CP2) requires care; under-specified algorithms risk producing assessments that miss the input's nuance; over-specified algorithms risk locking in bias from today's LLM defaults.

### Risks named

- **Schema fidelity at Layer 1.** If Layer 1's extraction misses key features of the input (because the system prompt is too narrow, or the LLM under-attends to the schema), Layer 2 receives an impoverished schema and the assessment is impoverished. Mitigation: harness Phase 1 + 2; comparison rubric Phase 5 (passions detected match, causal stage agreement) at parallel-run.
- **Layer 2 algorithmic bias.** If Layer 2's per-mechanism rules are written from today's LLM defaults rather than from the canonical Stoic primary sources, the migration substitutes one set of biases for another. Mitigation: M1-CP2's ADR specifies the source documents for each rule (Stoic Brain passages, Cicero, Seneca, etc.) with explicit citations; founder reviews.
- **Layer 3 prose drift.** If Layer 3's prose template contradicts or invents content beyond the assessment, the API output misleads. Mitigation: harness Phase 5 (consistency tests).
- **Cost overrun during parallel-run.** Parallel-run doubles cost. If the observation period extends beyond the cap, R5 cost-health alerts engage and the founder must decide: extend (with explicit re-approval) or abort. Mitigation: explicit cap at M1-CP4.
- **R20a perimeter regression.** A wiring error could allow a layer to be called before the distress check fires. Mitigation: AC4 invocation test (grep + execution path proof) at every checkpoint that touches the route; PR6 Critical-tier classification at every R20a perimeter session.
- **Rollback complexity at M1-CP6.** Once cutover commits, the new schema is in external agent developers' parsers. A rollback after M1-CP6 is a breaking change going the other way. Mitigation: M1-CP5 must make the cutover decision with high confidence; rollback after CP6 is itself a Critical-tier session.
- **Public API breaking change without external developer warning.** Mitigation: at M1-CP6, the founder publishes a deprecation notice + migration guide for `/api/reason` API consumers (timing: at least 14 days before cutover; specific timing decided at M1-CP5).

### What this ADR is not

- **Not a build session.** This session drafts ADR-004 only. No `.ts` file is touched. M1-CP1 is the first build session.
- **Not a Layer 2 algorithm specification.** Layer 2's per-mechanism rules are deferred to M1-CP2's own ADR. ADR-004 specifies the high-level approach only.
- **Not a commitment to the proposed checkpoint count.** Six checkpoints is the proposed minimum. The founder may add or merge checkpoints at any session-open.
- **Not a foreclosure on revision.** If parallel-run data at M1-CP5 shows the migration is unviable per R5 or schema fidelity is insufficient, ADR-003 + ADR-004 are revisited and the founder decides whether to continue, revise, or abort.

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR-004 moves from `/drafts/adr/` to `/adopted/adr/` in this session. M1-CP1 becomes the next session's deliverable.

If the founder rejects ADR-004 or requests substantial edits, the draft is revised in this session or deferred to a future session. The M1 pilot does not begin until ADR-004 is Adopted.

## Changelog

- **2026-05-04 (initial Adoption, Sub-session E10)** — drafted in `/drafts/adr/`, approved verbatim by founder ("Approve as drafted"), moved to `/adopted/adr/`. Three load-bearing decisions surfaced and confirmed by founder before drafting: A-2 (full schema redesign); B-3 (parallel-run cutover mechanics); C-2 (new harness, retire existing at M5). AI flagged concern about A-2's downstream costs (M2/M3/M4 session size, fragmented output during migration, public API breaking change for external agent developers); founder confirmed A-2 with the costs accepted.

- **2026-05-06 (cross-session amendment, Sub-session M1-CP4b)** — §10 checkpoint table extended with five new rows (M1-CP4b, M1-CP4c, M1-CP4d, M1-CP4e, M1-CP4f) inserted between the existing M1-CP4 and M1-CP5 rows, per `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05`. The new rows specify the ADR amendments (M1-CP4b, this session), the module updates (M1-CP4c), the multi-turn input flow design ADR for Tier 1 (M1-CP4d), the route updates for Tier 1 (M1-CP4e — Critical-tier), and the parallel-run orchestrator update + comparison-table baseline reset + per-layer cost capture + admin/test-reason fixture-set + export-button (M1-CP4f). §10 prose extended with the architectural reasoning for the sub-session block (cutover at M1-CP6 commits the engine; the engine must honour the architecturally adopted withholding-as-kathekon discipline at cutover, not be patched after). §10.1 (inter-checkpoint state) extended to acknowledge the new sub-sessions preserve the dormant parallel-run posture. §10.2 (rollback) extended with rollback paths for the five new sub-sessions. Standard-tier governance amendment under 0d-ii (documentation; no production touch).

---

*End of ADR-004 (draft).*
