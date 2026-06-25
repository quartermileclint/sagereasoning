/**
 * guardrail-sandwich.test.ts — #3b/#3c guardrail → signed-sandwich port (ADR-009).
 *
 * Run via: npx tsx src/lib/__tests__/guardrail-sandwich.test.ts
 * (no --env-file: the import chain [guardrail-sandwich → layer1-extractor →
 *  sage-reason-engine getClient] constructs the Anthropic client LAZILY, never
 *  at module load; layer2-signer reads its key at call time. The route is
 *  source-grepped, never imported.)
 *
 * COVERAGE
 *   Flag semantics (FT-1..FT-5) — isGuardrailSandwichEnabled is case-strict.
 *   Pure verdict derivation (DV) over hand-built Layer2Assessment fixtures —
 *     proves the verdict is pure rank-arithmetic over the DETERMINISTIC
 *     katorthoma_proximity (meetsThreshold/getV3Recommendation), and the §4
 *     field reconciliation (is_kathekon null surfaced honestly; reasoning is a
 *     deterministic synthesis; passions projected null→'unspecified';
 *     improvement_hint from the structured path).
 *   deliberation_quality (DQ) — the legacy derivation, now over L2 inputs.
 *   Route wiring guards (INV) — source-grep proving the flag-OFF legacy
 *     sage-guard path is preserved verbatim, the branch is flag-gated, the #3a
 *     model-honesty fix is intact, signing fails closed, and the R10 fields land.
 *
 *   NOT covered here (LLM-dependent — deferred to the adversarial review +
 *   activation smoke, R18 TEST-labelled): the end-to-end old-vs-new
 *   verdict-equivalence battery (requires running both engines on real inputs).
 *
 * Rules served: R18 (honest determinism framing — verdict signed/reproducible,
 * not an is_deterministic flag flip); R10 (response-shape reconciliation); PR6
 * (Critical-target endpoint); PR15 (mirrors the INV source-grep test pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

import {
  isGuardrailSandwichEnabled,
  deriveGuardrailVerdict,
  deriveDeliberationQuality,
  synthesizeReasoning,
  projectPassions,
  justiceCheckScope,
  applyJusticeFloor,
  parseJusticeResolution,
  resolveJusticeObligation,
  type JusticeResolution,
} from '@/lib/guardrail-sandwich'
import {
  meetsThreshold,
  getV3Recommendation,
} from '@/lib/guardrails'
import type {
  Layer2Assessment,
  StageScores,
  HastyAssentRisk,
  OikeiosisCircleAssessment,
  OikeiosisCircle,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import type { KatorthomaProximityLevel } from '@/lib/stoic-brain'

// ============================================================================
// HARNESS
// ============================================================================

let passCount = 0
let failCount = 0
function pass(name: string): void { console.log(`PASS — ${name}`); passCount++ }
function fail(name: string, msg: string): void { console.log(`FAIL — ${name}: ${msg}`); failCount++ }
function expectEq<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) pass(name)
  else fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
function expectTrue(name: string, cond: boolean, hint?: string): void {
  if (cond) pass(name); else fail(name, hint ?? 'condition was false')
}

// ============================================================================
// FIXTURE FACTORY — a valid Layer2Assessment
// ============================================================================

const ALL_STRONG: StageScores = {
  control_filter: 'strong', passion_diagnosis: 'strong', oikeiosis: 'strong',
  value_assessment: 'strong', kathekon_assessment: 'strong', iterative_refinement: 'strong',
}

function makeAssessment(overrides: Partial<Layer2Assessment> = {}): Layer2Assessment {
  const base: Layer2Assessment = {
    version: 'layer2-assessment-v1',
    layer1_schema_version: 'layer1-schema-v1',
    passion_diagnosis: { passions_detected: [], false_judgements: [], correct_judgements: [], causal_stage_affected: null },
    control_filter: { within_prohairesis: [], outside_prohairesis: [], disambiguation_required: [] },
    oikeiosis: { relevant_circles: [], deliberation_notes: 'Deliberation considered.' },
    value_assessment: { indifferents_at_stake: [], value_error: null },
    kathekon_assessment: { is_kathekon: true, quality: 'strong', justification: 'Honours a role obligation.' },
    iterative_refinement: {
      senecan_grade: 'grade_1',
      progress_dimensions: { passion_reduction: 'x', judgement_quality: 'x', disposition_stability: 'x', oikeiosis_extension: 'x' },
      direction_of_travel: 'single_snapshot',
      motivation_classification: null,
    },
    katorthoma_proximity: 'principled',
    ruling_faculty_state: 'stable disposition',
    virtue_domains_engaged: ['dikaiosyne'],
    improvement_path_structured: { false_judgement_to_correct: 'fj', mechanism_applies: 'kathekon_assessment', corrected_judgement: 'Act for the principle, not the outcome.' },
    stage_scores: { ...ALL_STRONG },
    hasty_assent_risk: 'none',
    intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
    layer1_ambiguity_notes: [],
    layer2_ambiguity_notes: [],
  }
  return { ...base, ...overrides }
}

/** Build an oikeiosis circle assessment fixture (the J2 input the bridge keys on). */
function makeCircle(
  circle: OikeiosisCircle,
  obligationMet: boolean | null,
): OikeiosisCircleAssessment {
  return {
    stage: 3,
    circle,
    description: 'affected party',
    honourability_grade: 2,
    advantageousness_grade: 2,
    cicero_verdict: 'balanced_neither_decisive',
    obligation_met: obligationMet,
    tension: null,
  }
}

/** A JusticeResolution fixture. */
function res(obligation: JusticeResolution['obligation'], source: JusticeResolution['source'] = 'resolved'): JusticeResolution {
  return { obligation, circle: 'local_community', justification: 'fixture', source }
}

// ============================================================================
// FT — flag semantics (case-strict)
// ============================================================================

function runFlagTests(): void {
  const prior = process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED
  delete process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED
  expectEq('FT-1 unset → false', isGuardrailSandwichEnabled(), false)
  process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED = 'true'
  expectEq('FT-2 "true" → true', isGuardrailSandwichEnabled(), true)
  process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED = 'false'
  expectEq('FT-3 "false" → false', isGuardrailSandwichEnabled(), false)
  process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED = '1'
  expectEq('FT-4 "1" → false (case-strict)', isGuardrailSandwichEnabled(), false)
  process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED = 'TRUE'
  expectEq('FT-5 "TRUE" → false (case-strict)', isGuardrailSandwichEnabled(), false)
  if (prior === undefined) delete process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED
  else process.env.SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED = prior
}

// ============================================================================
// DV — verdict derivation is pure rank arithmetic over katorthoma_proximity
// ============================================================================

const ALL_PROX: KatorthomaProximityLevel[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']

function runVerdictTests(): void {
  // DV-1: proceed === meetsThreshold(L2.proximity, threshold) for EVERY combo —
  // the port uses the canonical arithmetic, source of proximity is the only change.
  let okProceed = true, okRec = true
  for (const prox of ALL_PROX) {
    for (const thr of ALL_PROX) {
      const v = deriveGuardrailVerdict(makeAssessment({ katorthoma_proximity: prox }), thr)
      if (v.proceed !== meetsThreshold(prox, thr)) okProceed = false
      if (v.recommendation !== getV3Recommendation(prox, thr)) okRec = false
      if (v.katorthoma_proximity !== prox) okProceed = false
    }
  }
  expectTrue('DV-1a proceed === meetsThreshold(proximity, threshold) for all 25 combos', okProceed)
  expectTrue('DV-1b recommendation === getV3Recommendation(...) for all 25 combos', okRec)

  // DV-2: concrete spot checks
  const v1 = deriveGuardrailVerdict(makeAssessment({ katorthoma_proximity: 'principled' }), 'deliberate')
  expectEq('DV-2a principled vs deliberate → proceed=true', v1.proceed, true)
  expectEq('DV-2b principled vs deliberate → proceed (rank gap ≥1)', v1.recommendation, 'proceed')
  const v2 = deriveGuardrailVerdict(makeAssessment({ katorthoma_proximity: 'habitual' }), 'principled')
  expectEq('DV-2c habitual vs principled → proceed=false', v2.proceed, false)
  expectEq('DV-2d habitual vs principled → do_not_proceed (rank gap 2 below)', v2.recommendation, 'do_not_proceed')

  // DV-3: is_kathekon null surfaced HONESTLY (not coerced to false) — R18 / §4
  const vNull = deriveGuardrailVerdict(
    makeAssessment({ kathekon_assessment: { is_kathekon: null, quality: 'marginal', justification: 'One of three factors present.' } }),
    'deliberate',
  )
  expectEq('DV-3a is_kathekon null surfaced as null (not false)', vNull.is_kathekon, null)
  expectEq('DV-3b kathekon_quality passes through', vNull.kathekon_quality, 'marginal')
  const vFalse = deriveGuardrailVerdict(
    makeAssessment({ kathekon_assessment: { is_kathekon: false, quality: 'contrary', justification: 'No factors present.' } }),
    'deliberate',
  )
  expectEq('DV-3c is_kathekon false passes through', vFalse.is_kathekon, false)

  // DV-4: reasoning is a deterministic non-empty synthesis from L2 (NOT LLM prose)
  const a = makeAssessment({ katorthoma_proximity: 'deliberate' })
  const reasoning = synthesizeReasoning(a)
  expectTrue('DV-4a reasoning non-empty', reasoning.length > 0)
  expectTrue('DV-4b reasoning names the proximity', reasoning.includes('deliberate'))
  expectTrue('DV-4c reasoning includes the kathekon justification', reasoning.includes('Honours a role obligation'))
  expectTrue('DV-4d reasoning is deterministic (same input → same output)', synthesizeReasoning(a) === reasoning)

  // DV-5: passions projected to the V3 shape; null sub_species → 'unspecified'
  const withPassions = makeAssessment({
    passion_diagnosis: {
      passions_detected: [
        { id: 'p1', name: 'fear', root_passion: 'phobos', sub_species: null, false_judgement: 'External X is an evil.', correct_judgement: 'X is indifferent.', causal_stage_affected: 'synkatathesis', evidence: 'e' },
        { id: 'p2', name: 'anger', root_passion: 'epithumia', sub_species: 'orge', false_judgement: 'I was wronged.', correct_judgement: 'No genuine harm.', causal_stage_affected: 'horme', evidence: 'e2' },
      ],
      false_judgements: [], correct_judgements: [], causal_stage_affected: 'synkatathesis',
    },
  })
  const projected = projectPassions(withPassions)
  expectEq('DV-5a two passions projected', projected.length, 2)
  expectEq('DV-5b null sub_species → "unspecified"', projected[0].sub_species, 'unspecified')
  expectEq('DV-5c root_passion preserved', projected[0].root_passion, 'phobos')
  expectEq('DV-5d named sub_species preserved', projected[1].sub_species, 'orge')
  expectEq('DV-5e false_judgement preserved', projected[0].false_judgement, 'External X is an evil.')

  // DV-6: improvement_hint from improvement_path_structured.corrected_judgement; null → undefined
  const vHint = deriveGuardrailVerdict(makeAssessment(), 'deliberate')
  expectEq('DV-6a improvement_hint = corrected_judgement', vHint.improvement_hint, 'Act for the principle, not the outcome.')
  expectEq('DV-6b improvement_corrected mirrors it (for rollback_path)', vHint.improvement_corrected, 'Act for the principle, not the outcome.')
  const vNoHint = deriveGuardrailVerdict(makeAssessment({ improvement_path_structured: null }), 'deliberate')
  expectEq('DV-6c null structured path → improvement_hint undefined', vNoHint.improvement_hint, undefined)
  expectEq('DV-6d null structured path → improvement_corrected undefined', vNoHint.improvement_corrected, undefined)

  // DV-7: hasty_assent_risk + stage_scores sourced from L2 (deterministic), not meta
  const vRisk = deriveGuardrailVerdict(makeAssessment({ hasty_assent_risk: 'high' }), 'deliberate')
  expectEq('DV-7a hasty_assent_risk from L2', vRisk.hasty_assent_risk, 'high')
  expectEq('DV-7b stage_scores from L2', vRisk.stage_scores.control_filter, 'strong')

  // DV-8: KATHEKON FLOOR (SD-1) — an action judged is_kathekon:false (contrary)
  // must NEVER proceed, even when the proximity default ('deliberate') passes the
  // threshold. This is the empty/sparse-extraction fail-OPEN closer.
  const contraryAtDeliberate = makeAssessment({
    katorthoma_proximity: 'deliberate', // would pass threshold 'deliberate'
    kathekon_assessment: { is_kathekon: false, quality: 'contrary', justification: 'Contrary to appropriate action.' },
  })
  // sanity: without the floor this WOULD proceed (rank arithmetic alone):
  expectEq('DV-8a sanity: meetsThreshold(deliberate, deliberate) is true (the un-floored verdict)', meetsThreshold('deliberate', 'deliberate'), true)
  const vFloor = deriveGuardrailVerdict(contraryAtDeliberate, 'deliberate')
  expectEq('DV-8b is_kathekon:false floors proceed → false (no fail-open default)', vFloor.proceed, false)
  expectEq('DV-8c is_kathekon:false floors recommendation ≥ pause_for_review', vFloor.recommendation, 'pause_for_review')
  // The floor never WEAKENS an already-conservative verdict.
  const vAlreadyLow = deriveGuardrailVerdict(
    makeAssessment({ katorthoma_proximity: 'reflexive', kathekon_assessment: { is_kathekon: false, quality: 'contrary', justification: 'x' } }),
    'principled',
  )
  expectEq('DV-8d floor does not weaken do_not_proceed', vAlreadyLow.recommendation, 'do_not_proceed')
  expectEq('DV-8e floor keeps proceed false', vAlreadyLow.proceed, false)
  // The floor is SPECIFIC to is_kathekon===false: null ('undecidable'/marginal)
  // does NOT floor — the verdict follows the rank arithmetic.
  const vNullNoFloor = deriveGuardrailVerdict(
    makeAssessment({ katorthoma_proximity: 'principled', kathekon_assessment: { is_kathekon: null, quality: 'marginal', justification: 'x' } }),
    'deliberate',
  )
  expectEq('DV-8f is_kathekon:null does NOT floor (rank arithmetic stands)', vNullNoFloor.proceed, meetsThreshold('principled', 'deliberate'))
  // is_kathekon:true → no floor (the common path; DV-1's 25-combo parity relies on this).
  const vTrueNoFloor = deriveGuardrailVerdict(makeAssessment({ katorthoma_proximity: 'deliberate' }), 'deliberate')
  expectEq('DV-8g is_kathekon:true → proceed === meetsThreshold (no floor)', vTrueNoFloor.proceed, true)
}

// ============================================================================
// DQ — deliberation_quality derivation (legacy logic, now over L2 inputs)
// ============================================================================

function runDeliberationTests(): void {
  expectEq('DQ-1 high → impulsive', deriveDeliberationQuality('high', ALL_STRONG), 'impulsive')
  expectEq('DQ-2 moderate → hasty', deriveDeliberationQuality('moderate', ALL_STRONG), 'hasty')
  expectEq('DQ-3 none + all strong → thorough', deriveDeliberationQuality('none', ALL_STRONG), 'thorough')
  const mixed: StageScores = { ...ALL_STRONG, oikeiosis: 'weak' }
  expectEq('DQ-4 none + one weak → adequate', deriveDeliberationQuality('none', mixed), 'adequate')
  const allNa: StageScores = {
    control_filter: 'not_applied', passion_diagnosis: 'not_applied', oikeiosis: 'not_applied',
    value_assessment: 'not_applied', kathekon_assessment: 'not_applied', iterative_refinement: 'not_applied',
  }
  expectEq('DQ-5 none + all not_applied → adequate (no scores)', deriveDeliberationQuality('none', allNa), 'adequate')
  expectEq('DQ-6 low + all strong → thorough', deriveDeliberationQuality('low' as HastyAssentRisk, ALL_STRONG), 'thorough')
  // The full verdict wires DQ from L2 hasty_assent_risk + stage_scores:
  const v = deriveGuardrailVerdict(makeAssessment({ hasty_assent_risk: 'moderate' }), 'deliberate')
  expectEq('DQ-7 verdict.deliberation_quality wired from L2 inputs (moderate → hasty)', v.deliberation_quality, 'hasty')
}

// ============================================================================
// JS — justice-completion bridge SCOPE predicate (ADR-010 §3; PURE)
// ============================================================================

function runJusticeScopeTests(): void {
  // JS-1: an assessment with NO justice-toward-others signal — no circle, no
  // value_error, and kathekon quality 'marginal' (a single non-other-directed
  // factor) — does NOT fire. The bridge must not fire on every action (ADR-010 §3).
  const noJustice = justiceCheckScope(makeAssessment({
    oikeiosis: { relevant_circles: [], deliberation_notes: 'x' },
    value_assessment: { indifferents_at_stake: [], value_error: null },
    kathekon_assessment: { is_kathekon: null, quality: 'marginal', justification: 'one factor.' },
  }))
  expectEq('JS-1 no circle + no value_error + marginal kathekon → scope does NOT fire', noJustice.fires, false)
  expectEq('JS-1b no signals', noJustice.signals.length, 0)

  // JS-2: an identified oikeiosis circle fires (covers J2). This is the U2 shape.
  const withCircle = justiceCheckScope(makeAssessment({
    oikeiosis: { relevant_circles: [makeCircle('local_community', null)], deliberation_notes: 'x' },
  }))
  expectEq('JS-2a circle identified → fires', withCircle.fires, true)
  expectTrue('JS-2b reports the oikeiosis_circle_identified signal', withCircle.signals.includes('oikeiosis_circle_identified'))
  expectTrue('JS-2c reports the obligation_unevaluated signal (obligation_met=null)', withCircle.signals.includes('obligation_unevaluated'))
  expectEq('JS-2d surfaces the circle for the resolver', withCircle.circles[0], 'local_community')

  // JS-3: a value_error fires (the J3 input) even with no circle.
  const withValueError = justiceCheckScope(makeAssessment({
    value_assessment: { indifferents_at_stake: [], value_error: 'Confused reputation with the genuine good' },
  }))
  expectEq('JS-3a value_error present → fires', withValueError.fires, true)
  expectTrue('JS-3b reports the value_error_present signal', withValueError.signals.includes('value_error_present'))
  expectEq('JS-3c surfaces valueError for the resolver (J3)', withValueError.valueError, 'Confused reputation with the genuine good')

  // JS-4: a circle whose obligation IS evaluated (met=true) still fires on the
  // circle-identified signal, but does NOT add obligation_unevaluated.
  const circleEvaluated = justiceCheckScope(makeAssessment({
    oikeiosis: { relevant_circles: [makeCircle('household', true)], deliberation_notes: 'x' },
  }))
  expectEq('JS-4a evaluated circle still fires (party identified)', circleEvaluated.fires, true)
  expectTrue('JS-4b no obligation_unevaluated signal when obligation_met!=null', !circleEvaluated.signals.includes('obligation_unevaluated'))

  // JS-5: the LEAK-CLOSER (adversarial review JB-SCOPE-UNDERFIRE-1) — a calm action
  // with an OTHER-DIRECTED kathekon obligation (quality moderate/strong) but NO
  // circle and NO value_error STILL fires. This is the circle-free calm-injustice
  // path (a U2 paraphrase that extracts a role/relationship obligation but no
  // explicit audience). computeProximity can only reach principled/sage_like via
  // moderate/strong kathekon, so this signal provably covers the full leak class.
  const noCircle = { relevant_circles: [], deliberation_notes: 'x' }
  const noVE = { indifferents_at_stake: [], value_error: null }
  const circleFreeModerate = justiceCheckScope(makeAssessment({
    oikeiosis: noCircle, value_assessment: noVE,
    kathekon_assessment: { is_kathekon: true, quality: 'moderate', justification: 'role obligation engaged; justification offered.' },
  }))
  expectEq('JS-5a circle-free moderate kathekon → fires (leak-closer)', circleFreeModerate.fires, true)
  expectTrue('JS-5b reports other_directed_kathekon_obligation', circleFreeModerate.signals.includes('other_directed_kathekon_obligation'))
  expectEq('JS-5c no circle surfaced (resolver gets the "identified parties" fallback)', circleFreeModerate.circles.length, 0)
  expectEq('JS-5d strong kathekon, no circle → fires', justiceCheckScope(makeAssessment({
    oikeiosis: noCircle, value_assessment: noVE,
    kathekon_assessment: { is_kathekon: true, quality: 'strong', justification: 'x.' },
  })).fires, true)
  // JS-5e: contrary kathekon (is_kathekon false) does NOT fire the scope — the
  // kathekon FLOOR handles that case; the scope's job is the moderate/strong path.
  expectEq('JS-5e contrary kathekon, no circle → scope does NOT fire (kathekon floor handles it)', justiceCheckScope(makeAssessment({
    oikeiosis: noCircle, value_assessment: noVE,
    kathekon_assessment: { is_kathekon: false, quality: 'contrary', justification: 'x.' },
  })).fires, false)
}

// ============================================================================
// FCC — resolver fail-closed contract (the load-bearing safety path)
// ============================================================================

async function runResolverFailClosedTests(): Promise<void> {
  // FCC-1: parseJusticeResolution — valid classes → resolved.
  for (const ob of ['met', 'violated', 'indeterminate'] as const) {
    const r = parseJusticeResolution(JSON.stringify({ obligation: ob, circle: 'c', justification: 'j' }), 'fallback')
    expectEq(`FCC-1 valid ${ob} → resolved`, r.obligation, ob)
    expectEq(`FCC-1 ${ob} source=resolved`, r.source, 'resolved')
  }
  // FCC-2: non-JSON → unevaluated/error (fail-closed).
  const nonJson = parseJusticeResolution('the model refused to answer', 'fallback')
  expectEq('FCC-2a non-JSON → unevaluated', nonJson.obligation, 'unevaluated')
  expectEq('FCC-2b non-JSON source=error', nonJson.source, 'error')
  // FCC-3: out-of-class obligation → unevaluated/error.
  expectEq('FCC-3 out-of-class ("approve") → unevaluated', parseJusticeResolution(JSON.stringify({ obligation: 'approve' }), 'fallback').obligation, 'unevaluated')
  // FCC-4: empty string (the missing-content[0] path) → unevaluated/error.
  expectEq('FCC-4 empty string → unevaluated', parseJusticeResolution('', 'fallback').obligation, 'unevaluated')
  // FCC-5: an unevaluated parse floors to reflexive (the safety contract end-to-end).
  expectEq('FCC-5 unevaluated parse → reflexive floor', applyJusticeFloor('principled', nonJson), 'reflexive')

  // FCC-6: resolveJusticeObligation with an injected THROWING create → the
  // LLM-throw path returns unevaluated/error (never throws, never proceeds).
  const thrown = await resolveJusticeObligation(
    { action: 'x', circles: ['local_community'], valueError: null },
    { _create: async () => { throw new Error('simulated Anthropic 529 overload') } },
  )
  expectEq('FCC-6a injected LLM throw → unevaluated', thrown.resolution.obligation, 'unevaluated')
  expectEq('FCC-6b injected LLM throw → source=error', thrown.resolution.source, 'error')
  expectEq('FCC-6c injected LLM throw → zero usage', thrown.usage.output_tokens, 0)

  // FCC-7: injected create returning EMPTY text (missing content) → unevaluated;
  // the circle fallback label is used when no circle was identified.
  const empty = await resolveJusticeObligation(
    { action: 'x', circles: [], valueError: null },
    { _create: async () => ({ text: '', usage: { input_tokens: 5, output_tokens: 0 } }) },
  )
  expectEq('FCC-7a empty content → unevaluated', empty.resolution.obligation, 'unevaluated')
  expectEq('FCC-7b circle fallback → "identified parties"', empty.resolution.circle, 'identified parties')

  // FCC-8: injected create returning a VALID violated JSON → resolved/violated +
  // usage passthrough (the happy path through the seam).
  const ok = await resolveJusticeObligation(
    { action: 'spam', circles: ['local_community'], valueError: null },
    { _create: async () => ({ text: JSON.stringify({ obligation: 'violated', circle: 'local_community', justification: 'non-consenting recipients used as means' }), usage: { input_tokens: 100, output_tokens: 40 } }) },
  )
  expectEq('FCC-8a valid violated JSON → resolved', ok.resolution.obligation, 'violated')
  expectEq('FCC-8b resolved source=resolved', ok.resolution.source, 'resolved')
  expectEq('FCC-8c usage passed through from the call', ok.usage.output_tokens, 40)
}

// ============================================================================
// JF — justice FLOOR (ADR-010 §1/§3; PURE, MONOTONIC)
// ============================================================================

function runJusticeFloorTests(): void {
  // JF-1: met → unchanged (for every proximity).
  let metOk = true
  for (const p of ALL_PROX) if (applyJusticeFloor(p, res('met')) !== p) metOk = false
  expectTrue('JF-1 met → proximity unchanged for all levels', metOk)

  // JF-2: violated → reflexive (always).
  let violatedOk = true
  for (const p of ALL_PROX) if (applyJusticeFloor(p, res('violated')) !== 'reflexive') violatedOk = false
  expectTrue('JF-2 violated → reflexive for all levels', violatedOk)

  // JF-3: unevaluated → reflexive (J1 — fail-closed default).
  let unevalOk = true
  for (const p of ALL_PROX) if (applyJusticeFloor(p, res('unevaluated', 'error')) !== 'reflexive') unevalOk = false
  expectTrue('JF-3 unevaluated → reflexive (J1 fail-closed) for all levels', unevalOk)

  // JF-4: indeterminate → min(proximity, deliberate); never RAISES.
  expectEq('JF-4a indeterminate caps sage_like → deliberate', applyJusticeFloor('sage_like', res('indeterminate')), 'deliberate')
  expectEq('JF-4b indeterminate caps principled → deliberate', applyJusticeFloor('principled', res('indeterminate')), 'deliberate')
  expectEq('JF-4c indeterminate leaves deliberate → deliberate', applyJusticeFloor('deliberate', res('indeterminate')), 'deliberate')
  expectEq('JF-4d indeterminate leaves habitual (below cap) → habitual', applyJusticeFloor('habitual', res('indeterminate')), 'habitual')
  expectEq('JF-4e indeterminate leaves reflexive → reflexive', applyJusticeFloor('reflexive', res('indeterminate')), 'reflexive')

  // JF-5: no resolution (null/undefined) → unchanged (byte-identical pre-bridge).
  let noResOk = true
  for (const p of ALL_PROX) {
    if (applyJusticeFloor(p, null) !== p) noResOk = false
    if (applyJusticeFloor(p, undefined) !== p) noResOk = false
  }
  expectTrue('JF-5 no resolution → proximity unchanged (monotonic identity)', noResOk)

  // JF-6: MONOTONIC — the floor NEVER raises the rank for any resolution × level.
  const RANK: Record<KatorthomaProximityLevel, number> = { reflexive: 0, habitual: 1, deliberate: 2, principled: 3, sage_like: 4 }
  let monotonic = true
  for (const ob of ['met', 'violated', 'indeterminate', 'unevaluated'] as const) {
    for (const p of ALL_PROX) {
      if (RANK[applyJusticeFloor(p, res(ob, ob === 'unevaluated' ? 'error' : 'resolved'))] > RANK[p]) monotonic = false
    }
  }
  expectTrue('JF-6 floor is monotonic — never raises proximity (never weakens a verdict)', monotonic)
}

// ============================================================================
// JB — bridge composed into deriveGuardrailVerdict (the U2-class fix)
// ============================================================================

function runJusticeBridgeVerdictTests(): void {
  // JB-1: the U2 SHAPE — a calm 'principled' action at threshold 'principled'
  // PROCEEDS under the raw engine; a 'violated' justice resolution floors it.
  const u2Raw = makeAssessment({
    katorthoma_proximity: 'principled',
    kathekon_assessment: { is_kathekon: true, quality: 'moderate', justification: 'role obligation engaged.' },
    oikeiosis: { relevant_circles: [makeCircle('local_community', null)], deliberation_notes: 'x' },
    virtue_domains_engaged: ['phronesis', 'dikaiosyne'],
  })
  // sanity: WITHOUT the bridge (no resolution) this proceeds — the leak.
  const u2NoBridge = deriveGuardrailVerdict(u2Raw, 'principled')
  expectEq('JB-1a sanity: U2 shape proceeds WITHOUT the bridge (the leak)', u2NoBridge.proceed, true)
  expectEq('JB-1b sanity: surfaces principled without the bridge', u2NoBridge.katorthoma_proximity, 'principled')
  // WITH a violated resolution → reflexive → blocked (the fix).
  const u2Fixed = deriveGuardrailVerdict(u2Raw, 'principled', res('violated'))
  expectEq('JB-1c U2 violated → proceed=false (the fix)', u2Fixed.proceed, false)
  expectEq('JB-1d U2 violated → surfaced proximity floored to reflexive', u2Fixed.katorthoma_proximity, 'reflexive')
  expectEq('JB-1e U2 violated → recommendation do_not_proceed', u2Fixed.recommendation, 'do_not_proceed')
  expectTrue('JB-1f justice_resolution surfaced on the verdict', u2Fixed.justice_resolution?.obligation === 'violated')

  // JB-2: met → no change (verdict identical to the raw, plus the disclosed field).
  const metV = deriveGuardrailVerdict(u2Raw, 'principled', res('met'))
  expectEq('JB-2a met → proceed unchanged (true)', metV.proceed, true)
  expectEq('JB-2b met → proximity unchanged (principled)', metV.katorthoma_proximity, 'principled')
  expectEq('JB-2c met → recommendation unchanged', metV.recommendation, getV3Recommendation('principled', 'principled'))
  expectEq('JB-2d met → justice_resolution disclosed', metV.justice_resolution?.obligation, 'met')

  // JB-3: indeterminate → capped at deliberate; a principled-threshold action then
  // blocks; a deliberate-threshold action still proceeds (cap == threshold).
  const indThrPrincipled = deriveGuardrailVerdict(u2Raw, 'principled', res('indeterminate'))
  expectEq('JB-3a indeterminate caps proximity → deliberate', indThrPrincipled.katorthoma_proximity, 'deliberate')
  expectEq('JB-3b indeterminate @ principled threshold → blocked', indThrPrincipled.proceed, false)
  const indThrDeliberate = deriveGuardrailVerdict(u2Raw, 'deliberate', res('indeterminate'))
  expectEq('JB-3c indeterminate @ deliberate threshold → proceeds (cap meets threshold)', indThrDeliberate.proceed, true)

  // JB-4: unevaluated (fail-closed) → reflexive → blocked, surfaced honestly.
  const unevalV = deriveGuardrailVerdict(u2Raw, 'principled', res('unevaluated', 'error'))
  expectEq('JB-4a unevaluated → proceed=false', unevalV.proceed, false)
  expectEq('JB-4b unevaluated → reflexive', unevalV.katorthoma_proximity, 'reflexive')
  expectEq('JB-4c unevaluated surfaced honestly (not coerced to violated)', unevalV.justice_resolution?.obligation, 'unevaluated')
  expectEq('JB-4d unevaluated source flagged as error', unevalV.justice_resolution?.source, 'error')

  // JB-5: composes with the KATHEKON floor — the more conservative wins. A 'met'
  // justice resolution does NOT un-block an is_kathekon:false action.
  const contraryButMet = deriveGuardrailVerdict(
    makeAssessment({
      katorthoma_proximity: 'deliberate',
      kathekon_assessment: { is_kathekon: false, quality: 'contrary', justification: 'contrary.' },
      oikeiosis: { relevant_circles: [makeCircle('household', true)], deliberation_notes: 'x' },
    }),
    'deliberate',
    res('met'),
  )
  expectEq('JB-5a kathekon floor still blocks even when justice=met', contraryButMet.proceed, false)
  expectEq('JB-5b kathekon floor recommendation ≥ pause', contraryButMet.recommendation, 'pause_for_review')

  // JB-6: NO resolution argument → byte-identical to pre-bridge (no justice_resolution
  // field, proximity + verdict are the raw rank arithmetic). Guards flag-off identity.
  const plain = deriveGuardrailVerdict(makeAssessment({ katorthoma_proximity: 'principled' }), 'deliberate')
  expectEq('JB-6a no-resolution proceed === raw meetsThreshold', plain.proceed, meetsThreshold('principled', 'deliberate'))
  expectEq('JB-6b no-resolution surfaces the raw proximity', plain.katorthoma_proximity, 'principled')
  expectEq('JB-6c no-resolution → justice_resolution absent', plain.justice_resolution, undefined)

  // JB-7: reasoning is JUSTICE-AWARE (R10-REASONING-1). On a justice-floored verdict
  // the reasoning narrates the SURFACED (effective) proximity + the justice clause,
  // and never asserts the superseded raw 'principled' as the verdict.
  const u2FixedReasoning = deriveGuardrailVerdict(u2Raw, 'principled', res('violated')).reasoning
  expectTrue('JB-7a reasoning names the effective proximity (reflexive)', u2FixedReasoning.includes('reflexive'))
  expectTrue('JB-7b reasoning does NOT assert the superseded raw "proximity: principled"', !u2FixedReasoning.includes('proximity: principled'))
  expectTrue('JB-7c reasoning includes the justice completion clause (violated)', u2FixedReasoning.toLowerCase().includes('justice completion') && u2FixedReasoning.includes('violated'))
  // JB-7d: a met resolution leaves the reasoning on the raw proximity but still
  // discloses the justice completion.
  const metReasoning = deriveGuardrailVerdict(u2Raw, 'principled', res('met')).reasoning
  expectTrue('JB-7d met → reasoning narrates principled + discloses met', metReasoning.includes('principled') && metReasoning.toLowerCase().includes('justice completion'))
}

// ============================================================================
// INV — route wiring guards (source-grep; flag-OFF byte-identity + #3a intact)
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', '..', 'app', 'api', 'guardrail', 'route.ts')
const SANDWICH_PATH = path.resolve(__dirname, '..', 'guardrail-sandwich.ts')

function loadRouteBody(): string {
  const source = fs.readFileSync(ROUTE_PATH, 'utf-8')
  return source
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
}

function runRouteWiringTests(): void {
  expectTrue('INV-0 guardrail route.ts exists', fs.existsSync(ROUTE_PATH))
  const body = loadRouteBody()

  // INV-1: the port branch is FLAG-GATED.
  expectTrue('INV-1 route branches on isGuardrailSandwichEnabled()', /if\s*\(\s*isGuardrailSandwichEnabled\(\)\s*\)/.test(body))

  // INV-2: the legacy sage-guard path is PRESERVED (runSageReason still called).
  expectTrue('INV-2 legacy runSageReason( call preserved (byte-identical off path)', /runSageReason\s*\(/.test(body))

  // INV-3: the #3a model-honesty fix is intact in the legacy envelope.
  expectTrue('INV-3 legacy buildEnvelope still uses reasoningResult.meta.ai_model (#3a intact)', /model:\s*reasoningResult\.meta\.ai_model/.test(body))

  // INV-4: the branch is BEFORE the legacy engine call (the flag gates the legacy path).
  const idxFlag = body.indexOf('isGuardrailSandwichEnabled()')
  const idxLegacy = body.indexOf('runSageReason(')
  expectTrue('INV-4 flag branch precedes the legacy runSageReason call', idxFlag !== -1 && idxLegacy !== -1 && idxFlag < idxLegacy)

  // INV-5: the port calls the sandwich orchestrator.
  expectTrue('INV-5 route calls runGuardrailSandwich(', /runGuardrailSandwich\s*\(/.test(body))

  // INV-6: signing fails CLOSED → 503 substrate_signing_unavailable.
  expectTrue('INV-6 signing_unavailable → 503 substrate_signing_unavailable', /signing_unavailable/.test(body) && /substrate_signing_unavailable/.test(body) && /503/.test(body))

  // INV-7: R10 fields land — evaluation_depth 'deterministic' + engine_attribution.
  expectTrue('INV-7a evaluation_depth: "deterministic" (R10)', /evaluation_depth:\s*['"]deterministic['"]/.test(body))
  expectTrue('INV-7b engine_attribution: "translation-sandwich" (R10)', /engine_attribution:\s*['"]translation-sandwich['"]/.test(body))

  // INV-8: a verifiable artifact ALWAYS lands (R10-1) — signed_assessment when
  // signing is ON, else the bare assessment when OFF (never a verdict with none).
  expectTrue('INV-8a signed_assessment emitted when outcome.signed', /outcome\.signed[\s\S]{0,40}signed_assessment:\s*outcome\.signed/.test(body))
  expectTrue('INV-8b bare assessment emitted when NOT signed (R10-1)', /assessment:\s*outcome\.assessment/.test(body))

  // INV-9: the port model attribution is the L1 model (Sonnet), honest.
  expectTrue('INV-9 port envelope model is MODEL_DEEP (the L1 Sonnet call)', /model:\s*MODEL_DEEP/.test(body))

  // INV-11: the Layer-1 extraction is disclosed on the wire (R10-2 — parity with
  // /api/reason; lets a consumer re-run applyMechanisms over it).
  expectTrue('INV-11 extraction disclosed in the verdict body (R10-2)', /extraction:\s*outcome\.extraction/.test(body))

  // INV-10: NO A7 distress gate added to the guardrail route (perimeter unchanged; ADR-009 §6).
  expectTrue('INV-10 no A7 distress gate / detectDistress wired into the guardrail route (perimeter unchanged)',
    !/enforceLayer2R20aGate|detectDistressTwoStage|isSubstrateR20aGateEnabled/.test(body))

  // INV-12: the justice-completion bridge resolution is surfaced on the wire (ADR-010 §3; R10).
  expectTrue('INV-12 justice_resolution surfaced from the verdict (R10)', /justice_resolution:\s*v\.justice_resolution/.test(body))

  // INV-13: the justice bridge's SECOND bounded LLM call is METERED (cost honesty) —
  // captured from outcome.justice_usage and added to cost + the loop accumulator.
  expectTrue('INV-13a justiceUsage captured from outcome.justice_usage', /justiceUsage\s*=\s*outcome\.justice_usage/.test(body))
  expectTrue('INV-13b justiceUsage cost added to measuredCostUsd', /measuredCostUsd\s*\+=\s*estimateCallCostCents\(MODEL_DEEP,\s*justiceUsage/.test(body))

  // INV-14: the port still calls runGuardrailSandwich (the bridge lives INSIDE it,
  // flag-on only — flag-off byte-identity is unaffected by the bridge).
  expectTrue('INV-14 bridge lives inside the flag-on sandwich path (runGuardrailSandwich)', /runGuardrailSandwich\s*\(/.test(body))

  // INV-15 (ADR-010 §4 DECOUPLE, 2026-06-25): the gate PINS the §4 native dikaiosyne
  // weighting OFF (applyMechanisms(schema, { dikaiosyneWeighting: false })) so the
  // shared SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED flip activates ONLY /api/reason; the
  // Live gate keeps the §3 bridge until a LOCUS-2-gated retirement. Must NOT call the
  // bare applyMechanisms(schema) — that would read the env default and re-couple.
  const sandwich = fs.readFileSync(SANDWICH_PATH, 'utf-8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
  expectTrue('INV-15a guardrail pins dikaiosyneWeighting: false (decoupled from the §4 flag)',
    /applyMechanisms\(\s*schema\s*,\s*\{\s*dikaiosyneWeighting:\s*false\s*\}\s*\)/.test(sandwich))
  expectTrue('INV-15b guardrail does NOT call bare applyMechanisms(schema) (would re-couple to the env default)',
    !/applyMechanisms\(\s*schema\s*\)/.test(sandwich))
  // INV-15c (count parity — robust against a FUTURE second re-coupling call that INV-15a/b
  // would false-pass): EVERY applyMechanisms call in the gate file must be the pinned-false
  // form. allCalls counts call sites only (the import `applyMechanisms,` has no paren).
  const allMechCalls = (sandwich.match(/applyMechanisms\s*\(/g) || []).length
  const pinnedFalseCalls = (sandwich.match(/applyMechanisms\(\s*schema\s*,\s*\{\s*dikaiosyneWeighting:\s*false\s*\}\s*\)/g) || []).length
  expectTrue('INV-15c every applyMechanisms call in the gate is pinned dikaiosyneWeighting:false (count parity)',
    allMechCalls > 0 && allMechCalls === pinnedFalseCalls)
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- guardrail-sandwich.test.ts (#3b/#3c port + ADR-010 justice-completion bridge) ---')
  runFlagTests()
  runVerdictTests()
  runDeliberationTests()
  runJusticeScopeTests()
  runJusticeFloorTests()
  runJusticeBridgeVerdictTests()
  await runResolverFailClosedTests()
  runRouteWiringTests()
  console.log('---')
  console.log('NOTE: the end-to-end old-vs-new verdict-equivalence battery is LLM-dependent —')
  console.log('      run separately via scripts/guardrail-verdict-equivalence-battery.ts (the mandatory gate).')
  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
  if (failCount > 0) process.exit(1)
}

main().catch((e) => { console.error('test harness error:', e); process.exit(1) })
