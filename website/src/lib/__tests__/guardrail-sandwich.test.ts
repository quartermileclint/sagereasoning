/**
 * guardrail-sandwich.test.ts — #3b/#3c guardrail → signed-sandwich port (ADR-009)
 * with the ADR-010 §4 NATIVE dikaiosyne weighting (the §3 LLM justice bridge RETIRED
 * 2026-06-26).
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
 *     deterministic synthesis that surfaces the §4 proximity_floors basis;
 *     passions projected null→'unspecified'; improvement_hint from the structured
 *     path; the kathekon floor closes the sparse-extraction fail-open).
 *   deliberation_quality (DQ) — the legacy derivation, now over L2 inputs.
 *   Route wiring guards (INV) — source-grep proving the flag-OFF legacy
 *     sage-guard path is preserved verbatim, the branch is flag-gated, the #3a
 *     model-honesty fix is intact, signing fails closed, the R10 fields land,
 *     the gate is re-coupled to the §4 native engine (dikaiosyneWeighting:true),
 *     and the §3 bridge is fully removed (no resolver / justice_resolution / second
 *     LLM call).
 *
 *   NOT covered here (LLM-dependent — deferred to the adversarial review +
 *   activation smoke, R18 TEST-labelled): the end-to-end verdict-equivalence
 *   battery (requires running the real Layer-1 on real inputs) — see
 *   scripts/guardrail-verdict-equivalence-battery.ts (the mandatory gate) and
 *   scripts/locus2-sandwich-battery.ts (the LOCUS-2 over-strictness/equivalence proof).
 *
 * Rules served: R18 (honest determinism framing — verdict signed/reproducible,
 * the §4 justice floor folded into the signed proximity); R10 (response-shape
 * reconciliation); PR6 (Critical-target endpoint); PR15 (mirrors the INV source-grep
 * test pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

import {
  isGuardrailSandwichEnabled,
  deriveGuardrailVerdict,
  deriveDeliberationQuality,
  synthesizeReasoning,
  projectPassions,
} from '@/lib/guardrail-sandwich'
import {
  meetsThreshold,
  getV3Recommendation,
} from '@/lib/guardrails'
import type {
  Layer2Assessment,
  StageScores,
  HastyAssentRisk,
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
  // (With §4 native weighting active, the engine has ALREADY floored the proximity —
  // e.g. a calm injustice arrives here as 'reflexive' — so the gate just reads it.)
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
  // DV-2e: a §4-floored injustice (the engine returns reflexive) → blocked at every
  // threshold; this is the U2 class, now handled NATIVELY in the signed proximity.
  const vFloored = deriveGuardrailVerdict(makeAssessment({ katorthoma_proximity: 'reflexive' }), 'deliberate')
  expectEq('DV-2e §4-floored reflexive → proceed=false (the native U2 fix)', vFloored.proceed, false)
  expectEq('DV-2f §4-floored reflexive → do_not_proceed', vFloored.recommendation, 'do_not_proceed')

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
  // DV-4e/f: the §4 reasoning surfaces the proximity_floors BASIS when a virtue
  // domain floored the aggregate (the apatheia-vs-dikaiosyne gap made visible).
  // Reproducible: the basis is a field of the SIGNED assessment.
  const flooredA = makeAssessment({
    katorthoma_proximity: 'reflexive',
    proximity_floors: {
      base: 'principled', dikaiosyne: 'reflexive', andreia: null, sophrosyne: null,
      aggregate: 'reflexive', basis: "unity-thesis minimum: base 'principled' floored to 'reflexive' by dikaiosyne=reflexive",
    },
  })
  const flooredReasoning = synthesizeReasoning(flooredA)
  expectTrue('DV-4e reasoning surfaces the proximity_floors basis when a domain floored', flooredReasoning.includes("floored to 'reflexive' by dikaiosyne"))
  expectTrue('DV-4f reasoning narrates the floored aggregate (reflexive)', flooredReasoning.includes('reflexive'))
  // DV-4g: a no-floor assessment (all domains null OR proximity_floors absent) does
  // NOT append a basis clause — byte-stable with the pre-§4 reasoning shape.
  const noFloorReasoning = synthesizeReasoning(makeAssessment({ katorthoma_proximity: 'principled' }))
  expectTrue('DV-4g no-floor assessment → no basis clause appended', !noFloorReasoning.includes('floored to'))

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
  // threshold. This is the empty/sparse-extraction fail-OPEN closer. Retained after
  // the §3 bridge retirement — it is independent of the dikaiosyne floor.
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
// INV — route + sandwich wiring guards (source-grep; flag-OFF byte-identity,
//        #3a intact, §4 native re-couple, §3 bridge fully removed)
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', '..', 'app', 'api', 'guardrail', 'route.ts')
const SANDWICH_PATH = path.resolve(__dirname, '..', 'guardrail-sandwich.ts')

function loadCodeBody(p: string): string {
  return fs.readFileSync(p, 'utf-8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
}

function runRouteWiringTests(): void {
  expectTrue('INV-0 guardrail route.ts exists', fs.existsSync(ROUTE_PATH))
  const body = loadCodeBody(ROUTE_PATH)

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

  // INV-12 (ADR-010 §3 RETIREMENT, 2026-06-26): the §3 bridge's separate
  // justice_resolution field is GONE from the route — the justice floor is now folded
  // into the SIGNED proximity (proximity_floors), so the route surfaces NO standalone
  // justice_resolution. The native dikaiosyne floor is recorded in analytics instead.
  expectTrue('INV-12a route no longer surfaces a standalone justice_resolution field', !/justice_resolution:/.test(body))
  expectTrue('INV-12b route records the §4 native dikaiosyne floor for analytics', /dikaiosyne_floor:\s*dikaiosyneFloor/.test(body))

  // INV-13 (RETIREMENT): the gate makes a SINGLE LLM call — the §3 bridge's second
  // bounded justice call + its metering are removed (no justiceUsage anywhere).
  expectTrue('INV-13a no justiceUsage metering remains in the route', !/justiceUsage/.test(body))
  expectTrue('INV-13b no outcome.justice_usage reference remains in the route', !/justice_usage/.test(body))

  // INV-15 (ADR-010 §3 RETIREMENT / §4 RE-COUPLE, 2026-06-26): the gate now calls
  // applyMechanisms with `dikaiosyneWeighting: true` (re-coupled to the §4 native
  // engine), NOT the pinned `false` (the prior decouple) and NOT the bare form (which
  // would read the env default). A calmly-reasoned injustice floors NATIVELY in the
  // signed proximity.
  const sandwich = loadCodeBody(SANDWICH_PATH)
  expectTrue('INV-15a guardrail calls applyMechanisms(schema, { dikaiosyneWeighting: true }) (re-coupled to §4 native)',
    /applyMechanisms\(\s*schema\s*,\s*\{\s*dikaiosyneWeighting:\s*true\s*\}\s*\)/.test(sandwich))
  expectTrue('INV-15b guardrail no longer pins dikaiosyneWeighting: false (bridge retired)',
    !/applyMechanisms\(\s*schema\s*,\s*\{\s*dikaiosyneWeighting:\s*false\s*\}\s*\)/.test(sandwich))
  expectTrue('INV-15c guardrail does NOT call bare applyMechanisms(schema) (would read the env default)',
    !/applyMechanisms\(\s*schema\s*\)/.test(sandwich))
  // INV-15d (count parity — robust against a FUTURE second call): EVERY applyMechanisms
  // call site in the gate file must be the dikaiosyneWeighting:true form.
  const allMechCalls = (sandwich.match(/applyMechanisms\s*\(/g) || []).length
  const trueCalls = (sandwich.match(/applyMechanisms\(\s*schema\s*,\s*\{\s*dikaiosyneWeighting:\s*true\s*\}\s*\)/g) || []).length
  expectTrue('INV-15d every applyMechanisms call in the gate is pinned dikaiosyneWeighting:true (count parity)',
    allMechCalls > 0 && allMechCalls === trueCalls)

  // INV-16 (RETIREMENT lock): the §3 bridge functions + types are FULLY removed from
  // the sandwich module — no resolver, no scope predicate, no floor, no second LLM
  // call. Guards against dead-code reintroduction.
  expectTrue('INV-16a resolveJusticeObligation removed from the sandwich', !/resolveJusticeObligation/.test(sandwich))
  expectTrue('INV-16b justiceCheckScope removed from the sandwich', !/justiceCheckScope/.test(sandwich))
  expectTrue('INV-16c applyJusticeFloor removed from the sandwich', !/applyJusticeFloor/.test(sandwich))
  expectTrue('INV-16d no second Anthropic justice call (getClient/JUSTICE_RESOLVER_SYSTEM_PROMPT) in the sandwich',
    !/JUSTICE_RESOLVER_SYSTEM_PROMPT|getClient/.test(sandwich))
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- guardrail-sandwich.test.ts (#3b/#3c port + ADR-010 §4 NATIVE dikaiosyne; §3 bridge retired) ---')
  runFlagTests()
  runVerdictTests()
  runDeliberationTests()
  runRouteWiringTests()
  console.log('---')
  console.log('NOTE: the end-to-end verdict-equivalence battery is LLM-dependent — run separately via')
  console.log('      scripts/guardrail-verdict-equivalence-battery.ts (the mandatory gate) +')
  console.log('      scripts/locus2-sandwich-battery.ts (the LOCUS-2 over-strictness/equivalence proof).')
  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
  if (failCount > 0) process.exit(1)
}

main().catch((e) => { console.error('test harness error:', e); process.exit(1) })
