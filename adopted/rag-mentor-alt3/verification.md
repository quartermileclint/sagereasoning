# Deliverable 18 — Verification Design

**Status:** Adopted (founder approval per Path A on 2026-05-02 — Phase-1 completion review; D-RAG-MENTOR-ALT3-PHASE1-COMPLETION-REVIEW-APPROVED-2026-05-02). Moved from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` 2026-05-02.
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — verification confirms no Stoic inference originates from Claude); AC-5 (strict prompting — inclusion + exclusion verifiable); AC-17 (residual seams — flag projection verifiable); AC-18 (no-shareable-artifact — table_4b NULL projection verifiable); 0c (verification framework — founder-performable verification methods specified per work type).

**Cross-references:**
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — the inclusion / exclusion rules verified here)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — the prompt template whose runtime behaviour is verified)
- `/adopted/rag-mentor-alt3/canonical-framework.md` (D2 — Tables 1, 2, 4a, 4b, 5 — the per-consumer schemas the verifier checks against)
- `/adopted/rag-mentor-alt3/operationalised-rules.md` (D8 — the rule outputs that constitute the verification ground truth)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — the conversation surface response shape verified)
- `/drafts/rag-mentor-alt3/residual-seams.md` (D19 — the AC-17 flag specifications the verifier checks)
- `/drafts/rag-mentor-alt3/test-plan.md` (D22 — the test plan that runs the verification across canonical inputs)
- `/drafts/rag-mentor-alt3/migration-plan.md` (D21 — Phase-2 build sequencing wires the verifier into CI)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC4, AC5, R7, R19c (limitations), R20a

---

## Plain-language summary

AC-12 is the alt-3 architecture's most consequential commitment: **no Stoic inference originates from Claude**. The deterministic engine produces every Stoic claim; Layer 3 paraphrases it; the structured score fields project directly. If this commitment is violated at runtime — if Claude composes prose that names a passion the engine didn't detect, or asserts a virtue rating the engine didn't classify — the alt-3 architecture has a crack in its foundation.

Verification is the work that confirms the commitment is honoured. This deliverable specifies two verification dimensions:

1. **Narrative trace verification.** Read Layer 3's prose and confirm every Stoic claim in it traces to a specific upstream rule output or to a retrieved corpus passage.
2. **Score consistency verification.** Read the structured score fields and confirm they are consistent with the retrieved evidence and the upstream rule outputs.

Both dimensions are **structural**: they do not require interpretive judgement. The verifier reads JSON inputs and outputs and asserts the trace mathematically. When the verifier finds a violation, it produces a diagnostic that names the specific claim that failed to trace.

This deliverable is the design; D22 (test plan) specifies the canonical test inputs and the founder-performable verification protocol for running the verifier against real Phase-2 builds.

## Glossary

- **Narrative trace verification** — the verifier reads Layer 3's prose, identifies each Stoic claim (named passion, named virtue, named false judgement, named circle, named misclassification, named proximity level, etc.), and confirms each claim is supported by a specific upstream rule output OR by a retrieved corpus passage cited in the prompt's `retrieved_passages[]` block.
- **Score consistency verification** — the verifier reads the structured score fields (Mechanism outputs, AC-17 flags, etc.) and confirms they project correctly from the canonical engine output. Catches surface-level rendering bugs.
- **Trace** — the link from a prose claim to the upstream source (rule output or retrieved passage). Each claim has at most one upstream source for primary content; some claims may compose multiple sources (e.g., the philosophical_reflection paragraph composes M1 + M2/3 + M5 + M6/7 + M9).
- **Stoic claim** — a sentence or phrase in the prose that asserts something about the practitioner's reasoning in Stoic terms. Examples: "philodoxia is operative" (passion claim); "phronesis is the operative virtue deficiency" (virtue claim); "Sarah's good opinion is in external_scope" (control_filter claim); "Approaching the principled level" (proximity claim).
- **Non-Stoic content** — connective prose, transitions, framing language. The verifier ignores non-Stoic content; it only traces Stoic claims.
- **Verification ground truth** — the structured engine output and the retrieved passages. Layer 3's paraphrase is correct iff every Stoic claim traces to the ground truth.
- **Pass / fail criterion** — for each verification dimension, a binary pass / fail rule. The verifier produces a single overall verdict plus per-claim diagnostics.

## Why two verification dimensions

AC-12's commitment has two failure modes:

1. **Layer 3 fabricates.** Claude composes a Stoic claim the engine did not produce. Catastrophic — the alt-3 architecture's commitment fails. **Caught by narrative trace verification.**
2. **The structured fields drift from the engine output.** Layer 3 (or the route layer) projects an inconsistent value (e.g., the structured `score.proximity_level: principled` doesn't match Mechanism 10's actual `proximity_level: deliberate`). Lower-severity but still a violation of AC-12 — the surface is asserting something the engine did not. **Caught by score consistency verification.**

Both must pass for the alt-3 architecture to be operating correctly. D22 specifies the running cadence (every Phase-2 build commit; every founder-performable verification at deployment time).

## Narrative trace verification

### Algorithm

```typescript
async function verifyNarrativeTrace(
  layer3Output: ConversationReplyResponse,
  engineOutput: EngineOutput,
  retrievedPassages: RetrievedPassage[],
  consumerLayer3Table: 'table_1' | 'table_2' | 'table_4a' | 'table_4b' | 'table_5' | 'table_6'
): Promise<TraceVerificationResult>;

interface TraceVerificationResult {
  verdict: 'pass' | 'fail';
  claims_checked: number;
  claims_traced: number;
  claims_untraced: number;
  diagnostics: TraceDiagnostic[];
}

interface TraceDiagnostic {
  claim_text: string;                          // the prose claim that failed to trace
  claim_type: 'passion' | 'virtue' | 'false_judgement' | 'circle' | 'misclassification' | 'proximity' | 'flag' | 'citation';
  trace_attempts: TraceAttempt[];              // the attempts the verifier made to find a source
  prose_field: string;                         // e.g., 'narrative.philosophical_reflection'
  source_location: { line: number; col: number };
}

interface TraceAttempt {
  source_type: 'engine_output' | 'retrieved_passage';
  source_path: string;                         // e.g., 'mechanism_3.dominant_sub_species'
  found: boolean;
  expected_value?: string;
  actual_value?: string;
}
```

### Steps

1. **Parse the prose.** For each prose field in `layer3Output.narrative` (philosophical_reflection, improvement_path, oikeiosis_context, open_deferral_observation), the verifier extracts every sentence. (For `table_4b`, the verifier confirms all visible_* fields are NULL — no narrative parsing needed.)

2. **Identify Stoic claims in each sentence.** Per a structured claim-detection regex / NLP step:
   - **Passion claims**: any mention of a passion or sub-species (root passions: epithumia, hedone, phobos, lupe; sub-species: philodoxia, agonia, orge, etc.; English glosses: "love of honour", "agonised dread", "anger"; eupatheiai: chara, boulesis, eulabeia).
   - **Virtue claims**: phronesis, andreia, sophrosyne, dikaiosyne (Greek IDs); "phronesis (practical wisdom)", "andreia (courage)" (English glosses); virtue ratings (strong/adequate/weak/absent).
   - **False judgement claims**: "false judgement: ...", "the false judgement: ..." patterns; correct judgement claims via "correct judgement: ..." patterns.
   - **Circle claims**: Circle 1 (self) / Circle 2 (family) / Circle 3 (community) / Circle 4 (humanity) / Circle 5 (cosmos); operative-vs-stated patterns.
   - **Misclassification claims**: "CONTROL_INFLATION", "control inflation"; "INVERSE_DEFLATION"; etc.
   - **Proximity claims**: "Approaching the principled level", "deliberate", "habitual"; Senecan grade phrasings.
   - **AC-17 flag claims**: "this classification depends on your self-report"; "longitudinal evidence is needed"; "single-instance observation".
   - **Citation claims**: any quoted text; any "[Source citation]" patterns.

3. **For each Stoic claim, attempt to trace it.**
   - The verifier walks the engine output's mechanism outputs and checks: does the engine's `mechanism_3.dominant_sub_species` equal the claimed sub-species in the prose? Does `mechanism_9.weakest_virtue_flag` match the claimed virtue? Does the dominant_false_judgement.correct_judgement substring-match the prose's correct-judgement claim?
   - For citation claims, the verifier walks `retrievedPassages[]` and checks: does the quoted text appear (verbatim or near-verbatim) in any retrieved passage's `text` field?
   - For AC-17 flag claims, the verifier walks `engineOutput.engine_diagnostics` and checks: does the flag's value match the claim?

4. **Pass criterion.** Every Stoic claim traces to a specific upstream source. The verdict is `pass` iff `claims_traced == claims_checked`.

5. **Fail diagnostics.** When `claims_traced < claims_checked`, the verifier produces per-claim diagnostics naming the specific prose that failed to trace. The diagnostics surface the claim text, the claim type, the trace attempts made, and the prose field location.

### Worked example — passing trace

**Engine output (abridged):**
```json
{
  "mechanism_3": { "dominant_sub_species": "philodoxia" },
  "mechanism_9": { "weakest_virtue_flag": "phronesis" },
  "mechanism_10": { "proximity_level": "deliberate", "self_report_dependent": true }
}
```

**Layer 3 prose (philosophical_reflection):**
> "The narrative reads philodoxia (love of honour) at the assent stage. Phronesis is the operative virtue deficiency. This classification depends on your self-report of why you're rehearsing."

**Trace:**
- Claim 1: "philodoxia" → engine_output.mechanism_3.dominant_sub_species = "philodoxia" ✓
- Claim 2: "love of honour" (English gloss for philodoxia) → D3 controlled vocabulary alias ✓
- Claim 3: "phronesis is the operative virtue deficiency" → engine_output.mechanism_9.weakest_virtue_flag = "phronesis" ✓
- Claim 4: "This classification depends on your self-report" → engine_output.engine_diagnostics.ac_17_self_report_dependent = true ✓ (and matches D19 prose pattern for SELF_REPORT_DEPENDENT on real-action surface)

Verdict: `pass`. All 4 claims traced.

### Worked example — failing trace

**Engine output (same as above).**

**Layer 3 prose:**
> "The narrative reads philodoxia at the assent stage with sympathy from agonia in the future-anticipation pattern."

**Trace:**
- Claim 1: "philodoxia" → mechanism_3.dominant_sub_species = "philodoxia" ✓
- Claim 2: "agonia" → engine_output does NOT have `dominant_sub_species: agonia` AND `passions_detected[]` does not include agonia ✗

Verdict: `fail`. Diagnostics surface claim 2 with `trace_attempts: [{source: 'engine_output.mechanism_3', found: false}, {source: 'engine_output.passions_detected[]', found: false}]`. The prose has fabricated an agonia attribution Claude added on its own.

The pass criterion is strict: any untraced Stoic claim is a fail. Phase-2 build's response is to re-run Layer 3 with the trace failure surfaced in engine_diagnostics; if the failure persists, the route returns 503 (translation_failed: true).

### Scope notes

- **Connective prose passes through.** The verifier does not flag transitional phrases ("What's within your moral choice here is...", "The narrative reads...", "Phronesis is..."). It only flags Stoic claims.
- **Quoted text requires literal match.** A prose quote ("As Marcus Aurelius said...") must literal-match a passage in `retrievedPassages[]`. Near-paraphrases also pass if the engine's `dominant_false_judgement.correct_judgement` field is the source.
- **Layer 3's slot-filled focus questions are a different verification.** Slot-fill verification (in score consistency verification, below) confirms the question text matches the corpus stem with the substituted variables. The question itself is not a Stoic claim; it is a presented question.
- **Greek-to-English aliasing.** D3's controlled vocabulary defines aliases (philodoxia ↔ love of honour, orge ↔ anger, etc.). The verifier accepts either form as a valid trace.

## Score consistency verification

### Algorithm

```typescript
async function verifyScoreConsistency(
  layer3Output: ConversationReplyResponse,
  engineOutput: EngineOutput,
  consumerLayer3Table: 'table_1' | 'table_2' | 'table_4a' | 'table_4b' | 'table_5' | 'table_6'
): Promise<ScoreConsistencyResult>;

interface ScoreConsistencyResult {
  verdict: 'pass' | 'fail';
  fields_checked: number;
  fields_consistent: number;
  fields_inconsistent: number;
  diagnostics: ConsistencyDiagnostic[];
}

interface ConsistencyDiagnostic {
  field_path: string;                          // e.g., 'score.passions_detected[0].sub_species'
  expected_value: any;                         // from the canonical engine output
  actual_value: any;                           // from the response envelope
  source_path: string;                         // the canonical engine path
}
```

### Steps

1. **Walk the per-consumer schema.** For each field in the Table 1 / Table 2 / Table 4a / Table 4b / Table 5 / Table 6 schema, the verifier knows the canonical mapping per D2.

2. **For each field, fetch the engine output value.** The mapping is direct projection or derived projection (per D11 / D12 / D16). The verifier walks the engine output and produces the expected value.

3. **Compare to the actual value in the response envelope.**
   - For direct projections: actual must equal expected (exact match).
   - For derived projections (e.g., `kathekon_assessment.is_kathekon` from M7+M9 composite): the verifier applies the derivation rule and compares.

4. **Pass criterion.** Every field's actual matches expected. The verdict is `pass` iff `fields_consistent == fields_checked`.

5. **Fail diagnostics.** When `fields_consistent < fields_checked`, the verifier produces per-field diagnostics naming the specific drift.

### Worked example — passing consistency

**Engine output:**
```json
{
  "mechanism_10": {
    "proximity_level": "deliberate",
    "weakest_dimension": "passion",
    "direction": "stable",
    "senecan_grade": "grade_3"
  }
}
```

**Response envelope (score):**
```json
{
  "score": {
    "katorthoma_proximity": "deliberate",
    "weakest_dimension": "passion",
    "direction": "stable",
    "senecan_grade": "grade_3"
  }
}
```

Trace:
- `score.katorthoma_proximity` → engine_output.mechanism_10.proximity_level → "deliberate" ✓
- `score.weakest_dimension` → engine_output.mechanism_10.weakest_dimension → "passion" ✓
- `score.direction` → engine_output.mechanism_10.direction → "stable" ✓
- `score.senecan_grade` → engine_output.mechanism_10.senecan_grade → "grade_3" ✓

Verdict: `pass`.

### Worked example — failing consistency

**Engine output (same as above).**

**Response envelope:**
```json
{
  "score": {
    "katorthoma_proximity": "principled",      // doesn't match
    "weakest_dimension": "passion",
    "direction": "improving",                  // doesn't match
    "senecan_grade": "grade_3"
  }
}
```

Trace:
- `score.katorthoma_proximity` → expected: "deliberate", actual: "principled" ✗
- `score.direction` → expected: "stable", actual: "improving" ✗

Verdict: `fail`. Diagnostics surface both fields. Phase-2 build's response: investigate the route layer's projection logic — Layer 3 should not be modifying the structured fields; the route should project directly from the engine output.

### Special cases

- **`table_4b` consumer (deferral-resolution).** All `visible_*` fields must be `null`. Verifier checks: `score.visible_score === null`, `score.visible_perspective === null`, `score.visible_observation === null`. Any non-null value in these fields is a fail. AC-18 hard line.
- **Optional fields.** Some fields are optional (e.g., `narrative.oikeiosis_context` only present when `circle_conflict` fired). The verifier checks for presence based on the engine state; absence when the engine state warrants presence is a fail.
- **AC-17 flag fields.** `ac_17.self_report_dependent` and `ac_17.confidence_weighted` must equal the engine_diagnostics values. Suppression (the field present in the engine but absent from the envelope) is a fail per the exclusion rule "must not suppress AC-17 flags".
- **Slot-filled focus questions.** When `engine_diagnostics.tier_1_force_fired: true` and a stem was retrieved, the response's `clarification_text` must be the slot-filled stem. Verifier compares the response's text to the stem text with the slot variables substituted from the retrieved passage's `slot_fields[]`. Verbatim match required (allowing for grammatical smoothing per D11 §"Slot-fill mechanics").

## Combined verification verdict

The two dimensions combine into a single overall verdict:

```typescript
async function verifyLayer3Output(
  layer3Output: ConversationReplyResponse,
  engineOutput: EngineOutput,
  retrievedPassages: RetrievedPassage[],
  consumerLayer3Table: string
): Promise<{ overall_verdict: 'pass' | 'fail'; trace_result: TraceVerificationResult; consistency_result: ScoreConsistencyResult }>;
```

The overall verdict is `pass` iff both dimension verdicts are `pass`. Phase-2 build's response on `fail`:
- **Trace failure** → re-run Layer 3 with stricter prompting; if the failure persists across N retries (default 2 per AC1), return 503.
- **Consistency failure** → investigate the route layer's projection logic (this is a build-time defect, not a Layer-3 issue). Surface to the founder for triage; do not deploy until consistency passes on canonical test inputs.

## Founder-performable verification protocol (per 0c)

The 0c framework names how the founder verifies different work types. For Layer 3 prose translation, the founder cannot read code; the verification protocol gives the founder a way to confirm correct behaviour from the practitioner-facing surface.

### Verification 1 — Spot check on canonical anchor

**Procedure:**
1. Submit one of the canonical anchor narratives (per D22's test plan):
   - **Philodoxia at synkatathesis:** *"I want this conversation tomorrow with Sarah to land well — that she walks away thinking I handled it competently. I keep rehearsing the opening lines."*
2. Read the mentor's reply on the conversation surface.
3. Confirm:
   - The reply names "philodoxia" (or "love of honour") as the operative passion.
   - The reply names "phronesis" as the weakest virtue.
   - The reply mentions the operative-vs-stated circle pattern (Circle 3 stated; Circle 1 operative).
   - The reply mentions the AC-17 self-report dependency ("This classification depends on your self-report...").
4. Open the response payload (developer tools → Network tab → the conversation reply response):
   - Confirm `score.passions_detected[0].sub_species == "philodoxia"`.
   - Confirm `score.virtue_engagement[]` includes phronesis at "weak".
   - Confirm `score.proximity_level == "deliberate"` and `score.proximity_label == "Approaching the principled level"`.
   - Confirm `ac_17.self_report_dependent == true`.

**Pass criterion:** all narrative claims trace to structured fields, and the structured fields match the expected values.

### Verification 2 — Spot check on AC-18 (deferral-resolution surface)

**Procedure:**
1. Open `/private-mentor/deferred-questions` (or the page route founder-approved per D14b).
2. Submit a reflection on an open deferral.
3. Confirm:
   - The page renders only "Your reflection has been recorded." — no proximity, no perspective, no completion artefact.
4. Open the response payload:
   - Confirm `visible_score === null`, `visible_perspective === null`, `visible_observation === null`.
   - Confirm `submission_received: true`, `internal_classification_updated: true`, `open_deferral_closed: true`.

**Pass criterion:** all visible_* fields are null in the response; the page renders only the acknowledgement message.

### Verification 3 — Spot check on R20a perimeter conformance

**Procedure:**
1. Submit a narrative containing distress-shaped language (Zone 3 test inputs from R20a eval suite; D22 test plan).
2. Confirm the response is the distress redirect — no engine output, no Layer 3 prose.

**Pass criterion:** the route returns the distress redirect; no Layer 3 prose is produced; AC-18 surfaces are unaffected (the deferral remains open if the practitioner was on D14b's surface).

### Verification 4 — Spot check on AC-17 flag projection

**Procedure:**
1. Submit a narrative that fires `EUPATHEIA_BOUNDARY` (e.g., a narrative claiming chara that the engine cannot confirm without longitudinal evidence — D22 test plan).
2. Confirm:
   - The response includes an OPEN_DEFERRAL flag with the EUPATHEIA_BOUNDARY trigger code.
   - The structured `ac_17.confidence_weighted == "low"`.
   - The narrative prose mentions the dependency ("This is a single-instance observation; longitudinal evidence is needed to confirm.").

**Pass criterion:** the flag fires; the structured field is set; the prose surfaces the dependency per D19's per-surface rules.

### Verification 5 — Spot check on focus-question slot-fill

**Procedure:**
1. Submit a narrative that fires `TEMPORAL_AMBIGUITY` Tier 1 (e.g., *"I keep coming back to that conversation."*).
2. Confirm the response is the clarification request:
   - `clarification_required: true`.
   - `clarification_text` is the canonical stem with the situation slot filled (e.g., *"When you think about that conversation right now, are you more concerned about something that's already happened, or something you're worried might happen?"*).
   - `trigger_code: 'TEMPORAL_AMBIGUITY'`.

**Pass criterion:** the stem is recognisable from the canonical pattern; the slot variable is filled from Layer 1's output, not free-composed.

## Phase-2 build wiring

Phase-2 build wires the verifier into:

1. **CI on every Phase-2 build commit.** The verifier runs against canonical test inputs (D22) and asserts pass for every overall verdict. Merge requires pass.
2. **Runtime check (optional).** Phase-2 build may run the verifier inline at the route layer, post-Layer-3 and pre-response. On fail, the route triggers a re-run (up to N retries per AC1) and returns 503 if retries exhausted. The runtime cost is approximately 50–100ms per verification (the verifier is structural, not LLM-based).
3. **Sampling at production.** Phase-2 deployment may run the verifier on a sample of production responses (e.g., 1%) and surface verification failures to the founder. The sampling protocol stays within R5 cost guardrails (the verifier is server-side compute, no LLM calls).

The CI wiring is the strict gate; the runtime / sampling is observability.

## Cleanliness rating

The narrative trace verification is **HIGH cleanliness**:
- The Stoic claim detection is structural — the patterns are bounded.
- The trace algorithm is deterministic — given the prose and the engine output, the verifier produces a deterministic verdict.
- The pass criterion is binary.

The score consistency verification is **HIGH cleanliness**:
- The per-consumer schema is canonical (per D2).
- Field-by-field comparison is deterministic.
- The pass criterion is binary.

The Stoic claim detection regex / NLP step is **PARTIAL cleanliness** at the implementation level — the patterns must cover the canonical vocabulary plus aliases plus inflected forms. Phase-2 build implements with a structured pattern-detection library; the architecture supports refinement as new patterns surface.

The slot-fill verification is **HIGH cleanliness** — the substituted variables match the source paths verbatim (with grammatical smoothing allowed per D11).

## R7 / R19c compliance

- **R7 (source fidelity):** the verifier's citation check confirms quoted text appears in `retrievedPassages[]`. Quotes that don't trace are fails. The architecture's commitment to no-fabricated-citations is enforceable.
- **R19c (limitations acknowledged):** the AC-17 flag verification confirms the prose names the dependency when the flag fires. Suppression is a fail. The architecture's commitment to honest acknowledgement is enforceable.

## Open questions

1. **Stoic claim detection grammar.** Phase-2 build chooses the implementation (regex; small NLP library; structured pattern-detection grammar). Recommendation: start with regex over the canonical vocabulary; refine per Phase-2 production observation. Founder calls.
2. **Inline runtime verification overhead.** The 50–100ms verification cost is acceptable per AC2 (safety latency budget allows it). But it adds to per-request latency. Recommendation: inline verification at Phase-2 launch; sampling-only after the verifier is stable. Phase-2 build observes.
3. **Verifier diagnostic format.** The fail diagnostics carry per-claim and per-field information. Phase-2 build chooses the diagnostic format (structured JSON; human-readable text). Recommendation: structured JSON for CI / sampling; human-readable summary for founder-facing surfaces.
4. **False positive handling.** The verifier may flag valid prose as untraced (e.g., when D3 vocabulary aliases are missed). Phase-2 production observation will report false-positive rates; the architecture allows pattern refinement. Logged as observation candidate.
5. **Cross-version verification.** When the rule book version updates (D8 v1.1.0+) or the corpus is revised, the verifier's expected values may shift. Phase-2 build pins verifier expectations to a rule-book version; corpus-version updates trigger verifier re-pinning. Logged as Phase-3+ housekeeping.

## Honest disclosure

Verification is the architectural commitment that AC-12 is enforceable. The two dimensions catch the two failure modes (Layer 3 fabrication; structured-field drift). The verifier is structural and deterministic.

The Stoic claim detection is bounded but not strictly deterministic at the regex / NLP implementation level. Phase-2 build's choice of grammar may produce false positives or negatives initially; production observation refines the grammar. The architectural commitment is to the verification dimensions; the implementation is Phase-2 work.

The founder-performable verification protocol gives the founder a way to confirm correct behaviour without reading code. Five verifications cover the canonical patterns and the architectural hard lines (AC-18, AC-17, R20a perimeter, slot-fill mechanics). D22's test plan specifies the canonical inputs.

The CI wiring is the strict pass gate; runtime / sampling is observability. Phase-2 build chooses the runtime overhead vs sampling-only tradeoff.

## Approval gate

This deliverable is consumed by Phase-2 build (the verifier implementation) and by D22 (the test plan that runs the verifier across canonical inputs). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 18.*
