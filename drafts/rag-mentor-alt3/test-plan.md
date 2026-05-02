# Deliverable 22 — Test Plan

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich — purity tests confirm no Stoic inference originates from Claude); AC-4 (invocation testing for safety functions); AC-5 (R20a perimeter discipline including new ninth route per D14b); 0c (verification framework — founder-performable verification specifications); ES1 (Zone 2 eval inputs include founder-profile inputs); ES2 (eval suite gates phase transitions); ES3 (eval results recorded in safety signal audit).

**Cross-references:**
- All Phase-1 deliverables — D22 specifies the tests that verify each.
- `/drafts/rag-mentor-alt3/verification.md` (D18 — verifier spec; D22 specifies the tests that run the verifier)
- `/drafts/rag-mentor-alt3/migration-plan.md` (D21 — Phase-2 build sequencing wires the tests into CI per pass)
- `/drafts/rag-mentor-alt3/index-schema.md` (D5 — structural integrity tests)
- `/drafts/rag-mentor-alt3/retrieval-interface.md` (D6 — retrieval pipeline tests)
- `/drafts/rag-mentor-alt3/re-rank-design.md` (D7 — re-rank tests)
- `/drafts/rag-mentor-alt3/strict-prompting.md` (D12 — runtime prompt-honouring tests)
- `/drafts/rag-mentor-alt3/score-in-reply.md` (D16 — response envelope tests)
- `/drafts/rag-mentor-alt3/progression-delta.md` (D17 — progression delta tests)
- `/drafts/rag-mentor-alt3/residual-seams.md` (D19 — AC-17 flag projection tests)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — 6 founder verifications)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14b-deferral-resolution.md` (D14b — 8 founder verifications)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — Tier 1/2/3 dispatch tests)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15 — domain-match algorithm tests)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9 — engine sequencing tests)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture)
- `/manifest.md` AC1, AC4, AC5, ES1, ES2, ES3, R20a

---

## Plain-language summary

Phase-2 build will produce running code from the design in Phase 1's 23 deliverables. The test plan specifies how the build is verified — at the structural level (the schema is well-formed; the pipeline produces typed outputs), at the behavioural level (the engine produces the canonical output for each named anchor pattern; Tier 1/2/3 dispatch fires correctly), at the purity level (no Stoic inference originates from Claude per AC-12), and at the founder-performable level (the founder runs verifications that confirm correct end-to-end behaviour from the practitioner-facing surface).

The test plan also specifies the **R20a invocation tests per AC4** (every R20a perimeter route — the existing 8 plus the new ninth at D14b — is verified for `detectDistressTwoStage` import + `enforceDistressCheck` call pattern), the **eval suite per ES1/ES2/ES3** (Zone 2 eval inputs include founder-profile inputs; the eval suite gates phase transitions; results are recorded in the safety signal audit), and the **canonical anchor patterns** the behavioural tests run against (philodoxia at synkatathesis, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising).

This is design only; Phase-2 build implements the tests against the design. The plan is the contract between Phase-1 design and Phase-2 verification.

## Glossary

- **Structural test** — tests the typed shape of inputs / outputs (schemas, types, field presence). Catches build-time defects before they reach behaviour.
- **Behavioural test** — tests that specific input produces specific output. The named anchor patterns each have a canonical expected output; the test confirms the engine produces it.
- **Purity test** — tests AC-12's commitment that no Stoic inference originates from Claude. Per D18 verification design — narrative trace + score consistency.
- **Founder-performable verification** — verifications the founder runs from the practitioner-facing surface without reading code. Per 0c framework.
- **Canonical anchor pattern** — one of five named patterns from the architecture exercise: philodoxia at synkatathesis, orge with children, six consecutive procedural reports, bus story, agonia in catastrophising. Each pattern has a canonical expected output; the tests confirm the engine produces it.
- **Zone 2 / Zone 3 inputs** — per AC3. Zone 2 = clinical-adjacency domains where the engine engages with calibration. Zone 3 = acute distress where R20a redirects.
- **Eval suite** — the test harness that runs canonical inputs against the engine and asserts expected outputs. Per ES2 gates phase transitions.

## Test categories

The test plan organises tests into five categories:

1. **Structural tests** — schema integrity, retrieve-then-rerank pipeline integrity, engine sequencing integrity.
2. **Behavioural tests** — engine produces canonical output for named anchor patterns; Tier 1/2/3 dispatch.
3. **Purity tests (AC-12 verification)** — Layer 1 / Layer 3 prose contains no fabricated Stoic inference.
4. **Founder-performable verifications** — 0c-framework end-to-end checks.
5. **R20a invocation tests + eval suite (AC4 + ES1-3)** — safety-system verifications.

Each category has CI-runnable tests (Phase-2 build wires into CI) and per-pass founder verifications.

## Structural tests

### Index schema integrity (D5)

```typescript
test('corpus_passages table schema is well-formed', async () => {
  // Verify CREATE TABLE statement matches D5 schema
  const tableSchema = await getTableSchema('corpus_passages');
  expect(tableSchema.columns).toContainAllOf(['id', 'passage_id', 'source_file', 'source_citation', 'passage_type', 'canonical_mechanism', 'passion', 'sub_passion', 'audience_tier', 'trigger_condition', 'intake_tier', 'slot_fields', 'text', 'paragraph_text', 'embedding', 'tsvector_en', 'created_at', 'updated_at', 'version']);
  expect(tableSchema.indexes).toContainAllOf(['idx_corpus_passages_embedding', 'idx_corpus_passages_tsvector', 'idx_corpus_passages_mechanism_passion', 'idx_corpus_passages_canonical_mechanism', 'idx_corpus_passages_trigger', 'idx_corpus_passages_source']);
  expect(tableSchema.constraints).toContainAllOf(['passage_type_valid', 'source_file_valid', 'audience_tier_valid', 'intake_tier_valid', 'focus_question_completeness']);
  expect(tableSchema.rls_enabled).toBe(true);
});

test('open_deferrals table schema is well-formed', async () => {
  const tableSchema = await getTableSchema('open_deferrals');
  expect(tableSchema.columns).toContainAllOf(['id', 'user_id', 'instance_id', 'trigger_code', 'intake_tier', 'withheld_classification', 'deferred_question', 'status', 'created_at', 'resolved_at', 'resolution_reflection_id', 'retrospective_update', 'encrypted_payload']);
  expect(tableSchema.indexes).toContainAllOf(['idx_open_deferrals_user_status', 'idx_open_deferrals_instance']);
  expect(tableSchema.rls_enabled).toBe(true);
});

test('deferral_resolutions table schema is well-formed', async () => {
  // Similar to open_deferrals
});
```

### Retrieve-then-rerank pipeline integrity (D6 + D7)

```typescript
test('retrievePassages with mechanism + passion filter returns expected passages', async () => {
  const result = await retrievePassages({
    query: 'philodoxia false judgement',
    mechanism_filter: ['passion_false_judgement'],
    passion_filter: 'epithumia',
    sub_passion_filter: 'philodoxia',
    passage_type_filter: ['mechanism'],
    top_k: 20
  });

  expect(result.passages.length).toBeGreaterThan(0);
  expect(result.passages.length).toBeLessThanOrEqual(20);

  // Every passage matches the filters
  result.passages.forEach(p => {
    expect(p.canonical_mechanism).toContain('passion_false_judgement');
    expect(p.passion).toBe('epithumia');
    expect(p.sub_passion).toBe('philodoxia');
    expect(p.passage_type).toBe('mechanism');
  });

  // RRF scores are non-zero
  result.passages.forEach(p => {
    expect(p.rrf_score).toBeGreaterThan(0);
  });
});

test('reRank produces top-5 with heuristic boosts applied', async () => {
  const candidates = await retrievePassages({ /* same as above */ });
  const reranked = await reRank(candidates.passages, /* input */, 'heuristic');

  expect(reranked.length).toBeLessThanOrEqual(5);

  // The top result has the highest combined boost
  const topResult = reranked[0];
  expect(topResult.canonical_mechanism).toContain('passion_false_judgement');
  expect(topResult.passion).toBe('epithumia');
});

test('retrieve handles empty results gracefully', async () => {
  const result = await retrievePassages({
    query: 'nonsense query',
    mechanism_filter: ['nonexistent_mechanism'],
    top_k: 20
  });

  expect(result.passages.length).toBe(0);
  expect(result.retrieval_diagnostics.bm25_count).toBe(0);
  expect(result.retrieval_diagnostics.vector_count).toBe(0);
});
```

### Engine sequencing integrity (D9)

```typescript
test('engine executes 12 positions in canonical order', async () => {
  const trace = await runDeterministicEngineWithTrace(/* canonical input */);
  expect(trace.execution_order).toEqual([
    'rule_1', 'rule_2', 'rule_3', 'rule_4', 'rule_5_pass_1', 'rule_6', 'rule_7_pass_1',
    'rule_8', 'rule_9', 'rule_5_pass_2', 'rule_7_pass_2', 'rule_10'
  ]);
});

test('back-edge fires correctly with loop guard', async () => {
  // Input that triggers VALUE_ERROR_WITHOUT_PASSION
  const input = { /* narrative inflating an indifferent without passion-shaped reasoning */ };
  const trace = await runDeterministicEngineWithTrace(input);
  expect(trace.back_edge_fired).toBe(true);
  expect(trace.back_edge_runs).toBe(1);  // loop guard: max 1 re-run

  // Confirm Rules 2 and 3 ran twice
  expect(trace.execution_order.filter(r => r === 'rule_2').length).toBe(2);
  expect(trace.execution_order.filter(r => r === 'rule_3').length).toBe(2);
});

test('Tier 1 force trigger halts execution', async () => {
  const input = { /* fused narrative — multiple distinct concerns */ };
  const trace = await runDeterministicEngineWithTrace(input);
  expect(trace.tier_1_force_fired).toBe(true);
  expect(trace.tier_1_trigger_code).toBe('ELEMENT_FUSION');
  // Engine halts at Layer 1; subsequent rules don't run
  expect(trace.execution_order).toEqual([]);
});

test('Tier 3 OPEN_DEFERRAL produced at Position 12', async () => {
  const input = { /* narrative claiming chara without longitudinal evidence */ };
  const result = await runDeterministicEngine(input);
  expect(result.engine_diagnostics.tier_3_open_deferrals.length).toBeGreaterThan(0);
  expect(result.engine_diagnostics.tier_3_open_deferrals[0].trigger_code).toBe('EUPATHEIA_BOUNDARY');
});
```

## Behavioural tests — canonical anchor patterns

The five named anchor patterns from the architecture exercise. Each has a canonical expected output; the engine must produce it.

### Anchor 1 — Philodoxia at synkatathesis (`/api/score` consumer)

```typescript
test('philodoxia at synkatathesis produces canonical output', async () => {
  const input = {
    action: "I really want this conversation tomorrow with Sarah to land well — that she walks away thinking I handled it competently. I keep rehearsing the opening lines.",
    relationships: "Sarah is my colleague — we lead adjacent teams."
  };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_1' });

  // Expected canonical outputs per D11 Worked Example A:
  expect(result.score.passions_detected[0].sub_species).toBe('philodoxia');
  expect(result.score.passions_detected[0].causal_stage).toBe('synkatathesis');
  expect(result.score.passions_detected[0].false_judgement.judgement_type).toBe('INFLATION');
  expect(result.score.virtue_engagement.find(v => v.virtue === 'phronesis').rating).toBe('weak');
  expect(result.score.katorthoma_proximity).toBe('deliberate');
  expect(result.score.proximity_risk_flag).toBe('PASSION_DOMINANCE');
  expect(result.ac_17.self_report_dependent).toBe(true);
});
```

### Anchor 2 — Orge with children (`/api/score` consumer)

```typescript
test('orge with children produces canonical output', async () => {
  const input = {
    action: "I snapped at my son tonight when he wouldn't put down the iPad and come to dinner. I knew I shouldn't react that strongly but I did anyway."
  };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_1' });

  // Expected per D10 Example B:
  expect(result.score.passions_detected[0].sub_species).toBe('orge');
  expect(result.score.passions_detected[0].causal_stage).toBe('horme');  // judged correctly but impulse exceeded measure
  expect(result.score.passions_detected[0].false_judgement.judgement_type).toBe('DEFLATION');
  expect(result.engine_output.mechanism_6.primary_circle).toBe(2);  // family
});
```

### Anchor 3 — Six consecutive procedural reports (`/api/mentor/private/reflect` consumer)

```typescript
test('procedural reports produce thin coverage with THEORETICAL_ONLY pattern (longitudinal)', async () => {
  // Setup: insert 5 prior procedural-report instances into the practitioner's record
  await seedPriorInstances([
    { what_happened: "Today I shipped the migration." },
    { what_happened: "Today I closed three issues." },
    { what_happened: "Today I deployed v2.3." },
    { what_happened: "Today I refactored the auth module." },
    { what_happened: "Today I optimised the slow queries." }
  ]);

  // Test: submit the sixth procedural report
  const input = { what_happened: "Today I shipped the migration, hit the deadline, and got the metrics dashboard done." };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_4a' });

  // Expected per D10 Example C:
  expect(result.engine_output.layer_1_features.translation_quality.coverage).toBe('thin');
  expect(result.score.proximity_risk_flag).toBe('THEORETICAL_ONLY');
});
```

### Anchor 4 — Bus story (`/api/mentor/private/reflect` consumer)

```typescript
test('bus story produces orge/lupe with CONTROL_INFLATION', async () => {
  const input = {
    what_happened: "I was running late this morning and got stuck behind a bus for fifteen minutes. By the time I got to the office I was furious — I missed the standup, my whole day felt poisoned.",
    how_i_responded: "I tried to shake it off but the irritation lasted until lunch."
  };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_4a' });

  // Expected per D10 Example D:
  expect(result.score.passions_detected[0].sub_species).toBeOneOf(['orge', 'lupe']);
  expect(result.engine_output.mechanism_1.misclassification_flags).toContain('CONTROL_INFLATION');
  expect(result.engine_output.mechanism_8.dominant_value_error).toBeDefined();
});
```

### Anchor 5 — Agonia in catastrophising (`/api/score-decision` consumer, single option)

```typescript
test('agonia in catastrophising produces compound passion + reputation indifferent', async () => {
  const input = {
    decision: "Should I post the launch announcement publicly tomorrow, or wait another week?",
    options: [{
      text: "Post tomorrow as planned. But — what if it goes wrong? What if no one engages, or what if the wrong people engage and tear it apart? I keep running through the worst cases."
    }]
  };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_1' });

  // Expected per D10 Example E:
  expect(result.score.passions_detected[0].sub_species).toBe('agonia');
  expect(result.score.indifferents_at_stake[0].indifferent_id).toBe('reputation');
  // Possibly compound agonia + philodoxia detected
});
```

## Behavioural tests — Tier 1/2/3 dispatch

```typescript
test('Tier 1 ELEMENT_FUSION fires on fused narrative', async () => {
  const input = {
    action: "This whole thing with work and the family and what's been going on with my parents and the way the town meeting went — I'm just done."
  };
  const result = await runDeterministicEngine(input);
  expect(result.clarification_required).toBe(true);
  expect(result.trigger_code).toBe('ELEMENT_FUSION');
  expect(result.intake_tier).toBe(1);
});

test('Tier 1 SCOPE_AMBIGUITY fires when target unclear', async () => {
  const input = {
    action: "I responded to them in a way that didn't sit right after."
  };
  const result = await runDeterministicEngine(input);
  expect(result.clarification_required).toBe(true);
  expect(result.trigger_code).toBe('SCOPE_AMBIGUITY');
});

test('Tier 2 STATED_OPERATIVE_CONFLICT fires with non-blocking soft clarification', async () => {
  const input = { /* stated Circle 3 but operative Circle 1 */ };
  const result = await runDeterministicEngine(input);
  expect(result.clarification_required).toBeFalsy();
  expect(result.soft_clarification).toBeDefined();
  expect(result.soft_clarification.trigger_code).toBe('STATED_OPERATIVE_CONFLICT');
  expect(result.soft_clarification.intake_tier).toBe(2);
});

test('Tier 3 EUPATHEIA_BOUNDARY produces OPEN_DEFERRAL', async () => {
  const input = { what_happened: "I felt completely calm about it — no anxiety at all." };  // chara-shape claim
  const result = await runDeterministicEngine(input);
  expect(result.engine_diagnostics.tier_3_open_deferrals.length).toBeGreaterThan(0);
  expect(result.engine_diagnostics.tier_3_open_deferrals[0].trigger_code).toBe('EUPATHEIA_BOUNDARY');
});

test('REFLECTION_NARRATIVE_THIN surface-level Tier 1 fires', async () => {
  const input = { what_happened: "yeah." };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_4a' });
  expect(result.clarification_required).toBe(true);
  expect(result.trigger_code).toBe('REFLECTION_NARRATIVE_THIN');
});
```

## Purity tests (AC-12 verification)

Per D18, the verifier runs against canonical test inputs and confirms no Stoic inference originates from Claude.

```typescript
test('Layer 1 output contains no Stoic inference', async () => {
  const input = { /* philodoxia anchor narrative */ };
  const layer1Output = await callLayer1(input);

  // Layer 1 may surface candidate sub-species in feeling-entity descriptions, but does NOT classify
  // No mechanism 5 / mechanism 9 outputs in Layer 1
  expect(layer1Output).not.toHaveProperty('passions_detected');
  expect(layer1Output).not.toHaveProperty('virtue_engagement');
  expect(layer1Output).not.toHaveProperty('katorthoma_proximity');
});

test('Layer 3 prose traces every Stoic claim to upstream', async () => {
  const input = { /* philodoxia anchor narrative */ };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_1' });
  const traceResult = await verifyNarrativeTrace(
    result,
    result.engine_output,
    result.retrieved_passages,
    'table_1'
  );
  expect(traceResult.verdict).toBe('pass');
  expect(traceResult.claims_untraced).toBe(0);
});

test('Layer 3 score consistency — structured fields match engine output', async () => {
  const input = { /* philodoxia anchor narrative */ };
  const result = await runDeterministicEngine(input, { consumer_layer_3_table: 'table_1' });
  const consistencyResult = await verifyScoreConsistency(
    result,
    result.engine_output,
    'table_1'
  );
  expect(consistencyResult.verdict).toBe('pass');
  expect(consistencyResult.fields_inconsistent).toBe(0);
});

test('AC-18 holds — Table 4b NULL projection', async () => {
  // Setup: open deferral
  const openDeferral = await createOpenDeferralForTest();
  const input = {
    open_deferral_id: openDeferral.id,
    reflection_content: "I think about that meeting often. Looking back, I felt the underlying philodoxia — the chara was a polished surface."
  };
  const result = await runDeferralResolveEngine(input);

  // AC-18 hard line: all visible_* fields must be null
  expect(result.visible_score).toBe(null);
  expect(result.visible_perspective).toBe(null);
  expect(result.visible_observation).toBe(null);
  expect(result.ui_message).toBe('Your reflection has been recorded.');
});

test('AC-17 flag suppression is detected as a fail', async () => {
  // Mock Layer 3 to suppress an AC-17 flag
  const mockedResult = { /* response with engine_diagnostics.ac_17_self_report_dependent: true but score.ac_17.self_report_dependent: false */ };
  const consistencyResult = await verifyScoreConsistency(
    mockedResult,
    mockedResult.engine_output,
    'table_1'
  );
  expect(consistencyResult.verdict).toBe('fail');
  expect(consistencyResult.diagnostics).toContainEqual(expect.objectContaining({
    field_path: 'ac_17.self_report_dependent',
    expected_value: true,
    actual_value: false
  }));
});
```

## Founder-performable verifications (per 0c)

Consolidated across the deliverables that specify founder-performable checks:

### From D14b (8 verifications)

1. Schema migrations applied (SQL queries verify `open_deferrals`, `deferral_resolutions` tables + indexes + RLS).
2. Engine produces an OPEN_DEFERRAL on a test scenario (EUPATHEIA_BOUNDARY narrative).
3. Deferral-resolve route accepts a resolution and closes the flag.
4. AC-18 holds end-to-end (page renders only "Your reflection has been recorded.").
5. R20a distress redirection works on the new route.
6. Tier 1 force trigger surfaces correctly (REFLECTION_NARRATIVE_THIN).
7. Tier 3 re-cascade works.
8. RLS enforcement (cross-user read attempt blocked).

### From D14a (6 verifications)

1. Visible output preserved (engine path produces same shape as REFLECTION_PROMPT path).
2. Persistence pipeline preserved (KG7 — passions_detected[] is array, not string).
3. Profile feedback loop preserved (passion map updates).
4. Pattern-engine pass preserved.
5. R20a distress detection preserved.
6. Tier 1 force trigger surfacing post-substitution.

### From D5 (index schema integrity)

1. `corpus_passages` table exists with expected schema.
2. RLS policies enforce read-only access for authenticated users.
3. Sample retrieve query returns expected mechanism-tagged passages.

### From D6 (retrieval interface)

1. Retrieve function with mechanism + passion filter returns relevant passages.
2. Hybrid retrieval (BM25 + vector) produces RRF-fused ranking.
3. Empty result handled gracefully.

### From D7 (re-rank design)

1. Heuristic re-rank applies tag-match boosts correctly.
2. Top-K (3-5) returned as expected.

### From D16 (score-in-reply)

1. Conversation surface response carries structured score fields.
2. Proximity ring data contract present in response.
3. Backward-compat aliases preserve existing consumers during migration.

### From D17 (progression delta)

1. Direction signal computes correctly across multi-instance prior_state.
2. CONFIDENCE_WEIGHTED level transitions correctly with evidence accumulation.
3. Profile-tension flag fires when current diverges sharply from recent.

### From D18 (verification design)

1. Trace verification passes on canonical anchor outputs.
2. Score consistency verification catches drift.
3. Verifier diagnostics produce useful per-claim / per-field information.

### From D19 (residual seams)

1. SELF_REPORT_DEPENDENT flag fires when expected (4 named scenarios).
2. CONFIDENCE_WEIGHTED level matches expected per windowing thresholds.
3. Flag prose surfaces in Layer 3 output where flag fires.

The full set is 30+ verifications across the deliverables. Phase-2 build wires them into a founder-runnable test harness; the founder can run any subset against a deployed Phase-2 build.

## R20a invocation tests per AC4

The R20a perimeter is canonical per AC5 — eight routes today plus the ninth at D14b. AC4 invocation testing requires both functional and invocation tests.

### Invocation test pattern (per AC4)

```typescript
test('R20a perimeter route imports detectDistressTwoStage', async () => {
  const routeSource = await readFile(routePath);
  expect(routeSource).toMatch(/import.*detectDistressTwoStage.*from/);
  expect(routeSource).toMatch(/import.*enforceDistressCheck.*from/);
});

test('R20a perimeter route calls enforceDistressCheck(detectDistressTwoStage(...))', async () => {
  const routeSource = await readFile(routePath);
  expect(routeSource).toMatch(/await\s+enforceDistressCheck\(detectDistressTwoStage\(/);
});
```

Per route in the perimeter:

| Route | AC4 invocation test status (Phase-2 build) |
|---|---|
| `/api/score` | Existing — must continue passing post-Phase-2 |
| `/api/score-decision` | Existing — must continue passing |
| `/api/score-document` | Existing — must continue passing |
| `/api/score-scenario` | Existing — must continue passing |
| `/api/score-social` | Existing — must continue passing |
| `/api/reason` | Existing — must continue passing |
| `/api/reflect` | Existing — must continue passing |
| `/api/mentor/private/reflect` | Existing — must continue passing |
| `/api/mentor/private/deferral-resolve` | **New** — Phase-2 pass 1 adds the test for this route |

Phase-2 build's CI runs all 9 invocation tests on every commit. Merge requires pass.

## Eval suite (per ES1, ES2, ES3)

### ES1 — Zone 2 eval inputs include founder-profile inputs

The eval suite carries Zone 2 inputs at strong intensity for the founder's profile passions:

- **Philodoxia at strong intensity:** narratives reflecting recurrent reputation-inflation patterns. Used to verify the engine handles the founder's primary profile pattern correctly.
- **Penthos at strong intensity:** narratives reflecting grief / loss. Used to verify R6d's diagnostic-not-punitive enforcement (no eupatheia counterpart for present grief; the architecture preserves the canonical position).
- **Aischyne at strong intensity:** narratives reflecting shame. Zone 2 enforcement; tests that the engine engages rather than redirects.

Plus future expansion (logged as P1 / post-launch task per ES1): coverage gaps for other practitioner profiles.

### ES2 — Eval suite gates phase transitions

Phase transitions require passing eval suite runs:
- **P0 → P1:** the eval suite must pass against the alt-3 architecture's design before P1 begins.
- **P1 → P2:** the eval suite must pass against Phase-1 design (deliverables) before Phase 2 begins.
- **P2 pass 1 → pass 2:** the eval suite must pass against the Pass 1 deployment before Pass 2 begins.
- **P2 pass 2 → pass 3:** similar.

Per ES2, no phase transition without a passing run.

### ES3 — Eval results recorded in safety signal audit

Each eval run produces a result record:
- Date of run.
- Test inputs covered (Zone 2, founder-profile).
- Verdict (pass / fail).
- Specific failures (if any) with diagnostics.
- Verification status confirmation (per 0c).

The safety signal audit is the reconstructable evidence trail. Phase-2 build wires the eval suite into CI; results land in the safety signal audit.

## Phase-2 build CI integration

Per D21 § Phase-2 build wiring, the test plan integrates into CI as follows:

1. **Pass-1 CI gate:** structural tests + behavioural tests + purity tests + AC4 invocation test (new ninth route) + eval suite. All must pass before deployment.
2. **Pass-2 CI gate:** same plus the founder-performable verification scripts run against the canonical anchor inputs.
3. **Pass-3 CI gate:** full structural + behavioural + purity + AC4 (8 existing routes + new ninth) + eval suite.

The CI runs the tests on every commit. Merge to the main branch requires pass on all categories. Deployment is gated by the Critical Change Protocol's explicit founder approval (per pass).

## Cleanliness rating

The structural tests are **HIGH cleanliness** — schema integrity is canonical; the tests assert exact schema shape.

The behavioural tests are **HIGH cleanliness** at the canonical-anchor level — each anchor has a canonical expected output documented in D10/D11/D8. Test assertions are exact.

The purity tests are **HIGH cleanliness** — the verifier (D18) is structural; the tests run the verifier against canonical inputs.

The founder-performable verifications are **HIGH cleanliness** — the protocols are specified in D14a / D14b / D5 / D6 / D7 / D16 / D17 / D18 / D19. The founder runs them; the test plan consolidates them.

The R20a invocation tests are **HIGH cleanliness** per AC4 — exact import/call-pattern grep.

The eval suite is **PARTIAL cleanliness** at the threshold definition — what counts as a passing run? Per ES2, the run must pass; specific pass/fail criteria for the founder-profile inputs are working values per Phase-2 production observation.

## R20a / AC4 / ES1-3 compliance summary

- **R20a:** every perimeter route (8 + 1 new) has invocation testing per AC4. The eval suite covers Zone 2 / Zone 3 inputs.
- **AC4:** functional + invocation tests for safety-critical functions (`detectDistressTwoStage`, `enforceDistressCheck`, Zone 2 / Zone 3 classification logic, the wrappers).
- **ES1:** Zone 2 founder-profile inputs included.
- **ES2:** eval suite gates phase transitions.
- **ES3:** results recorded in safety signal audit.

## Open questions

1. **Test data fixtures.** The canonical anchors require seed data (prior instances for the procedural-reports anchor; mock OPEN_DEFERRALs for the deferral-resolve test). Phase-2 build creates the fixtures. Recommendation: the fixtures live alongside the test suites in `/website/__tests__/fixtures/`.
2. **Eval suite cadence.** Phase-2 build runs the eval suite on every commit + at deployment time. Production observation runs the suite weekly. Recommendation: weekly cadence post-launch; on-demand per founder request.
3. **Founder-runnable harness.** Phase-2 build exposes a CLI or admin page that runs the founder-performable verifications against a deployed environment. Recommendation: admin page at `/admin/verification-harness` (founder-only access); each verification is a button that runs the test and surfaces pass/fail.
4. **Test environment isolation.** Phase-2 build runs tests against a separate Supabase test instance (not production). Test data is seeded; the test instance is reset between test suites. Recommendation: maintain a `test` Supabase project; CI uses it; production uses production.
5. **Long-run behavioural tests.** Some tests require multi-instance prior_state (e.g., the procedural-reports anchor needs 5 prior reflections seeded). Long-run tests may be expensive; recommendation: maintain a `multi_instance_test_corpus` fixture that seeds the prior_state quickly via SQL inserts rather than running the engine per seed.

## Honest disclosure

The test plan is the verification contract for Phase-2 build. The plan covers structural, behavioural, purity, founder-performable, R20a invocation, and eval suite tests. Phase-2 build implements against the plan; production observation refines specific thresholds.

The canonical anchor patterns are the architectural test foundation — five named patterns from the architecture exercise. The expected outputs are documented in D10 / D11 / D8 / D17. Phase-2 production observation may add more patterns based on observed practitioner inputs.

The founder-performable verifications consolidate across deliverables (30+ verifications). Phase-2 build's harness exposes them as runnable; the founder runs them at deployment time per pass.

The eval suite per ES1-3 is the canonical safety verification. Phase-2 build wires the suite; results land in the safety signal audit.

## Approval gate

This deliverable is consumed by Phase-2 build (the test implementation). Approval is part of the same batch as the other Phase-1 session 3 deliverables (Standard risk under 0d-ii). Move from `/drafts/rag-mentor-alt3/` to `/adopted/rag-mentor-alt3/` is Elevated risk.

---

*End of Deliverable 22.*
