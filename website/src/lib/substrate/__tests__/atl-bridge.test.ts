/**
 * atl-bridge.test.ts — substrate ↔ Agent Trust Layer bridge functional tests
 * + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/atl-bridge.test.ts`
 * (mirrors the A5 / A7 / philosophical-mode verification pattern; no Jest
 * framework dependency).
 *
 * WHY THE WINDOW-AGGREGATOR IS NOT IMPORTED HERE
 *
 * The "shape-valid for window-aggregator.ts" check (build prompt Step 4) cannot
 * import the real /trust-layer/evaluation-window/window-aggregator.ts —
 * /trust-layer/ sits outside website/'s tsconfig root (the load-bearing Step 2
 * finding). Instead: the bridge produces an EvaluatedAction typed against the
 * MIRRORED EvaluatedAction in atl-bridge.ts, and that mirror is a verbatim copy
 * of /trust-layer/types/evaluation.ts's EvaluatedAction. So compile-time
 * assignability to the mirrored type IS shape-validity for
 * computeWindowSnapshot(agentId, EvaluatedAction[], ...). SHAPE-1..3 below
 * assert that contract at runtime (exact key set + per-field runtime types).
 *
 * COVERAGE
 *
 *   receipt_id DERIVATION (Step 2 gate — derive from the Ed25519 signature)
 *     DERIVE-1  deriveReceiptId returns RECEIPT_ID_PREFIX + 64 hex chars
 *     DERIVE-2  deriveReceiptId is deterministic (same signature → same id)
 *     DERIVE-3  different signatures → different receipt ids
 *     DERIVE-4  mapped.receipt_id === deriveReceiptId(context.signature)
 *
 *   FULL-ASSESSMENT MAPPING (every Layer2Assessment-sourced field)
 *     MAP-1  proximity ← katorthoma_proximity
 *     MAP-2  is_kathekon ← kathekon_assessment.is_kathekon (false preserved)
 *     MAP-3  kathekon_quality ← kathekon_assessment.quality
 *     MAP-4  passions_detected length matches the source
 *     MAP-5  passions_detected[0] root_passion + sub_species (non-null kept)
 *     MAP-6  virtue_domains_engaged content matches the source
 *     MAP-7  ruling_faculty_state ← ruling_faculty_state
 *     MAP-8  virtue_domains_engaged is a fresh copy (not aliased to the source)
 *
 *   CONTEXT FIELDS (the four not on Layer2Assessment)
 *     CTX-1  agent_id ← context.agent_id
 *     CTX-2  evaluated_at ← context.evaluated_at
 *     CTX-3  skill_id ← context.skill_id
 *
 *   OIKEIOSIS FIRST-CIRCLE SELECTION (Step 2 gate)
 *     OIK-1  2 circles → oikeiosis_met = relevant_circles[0].obligation_met
 *     OIK-2  2 circles → oikeiosis_stage = relevant_circles[0].circle (NOT [1])
 *     OIK-3  0 circles → oikeiosis_met is null
 *     OIK-4  0 circles → oikeiosis_stage is null
 *     OIK-5  first circle obligation_met=false is preserved as false (not null)
 *
 *   NULL NARROWING (partially-mapped fields — Step 2 gate)
 *     NARROW-1  is_kathekon null → false
 *     NARROW-2  sub_species null → '' (empty string)
 *     NARROW-3  sub_species non-null preserved verbatim
 *
 *   MINIMAL ASSESSMENT
 *     MIN-1  empty passions_detected → []
 *     MIN-2  empty virtue_domains_engaged → []
 *     MIN-3  proximity ← 'reflexive'
 *
 *   INVARIANTS
 *     DET-1  two identical maps produce byte-identical EvaluatedAction
 *     DET-2  mapping does not mutate the input assessment
 *
 *   SHAPE-VALIDITY FOR window-aggregator.ts
 *     SHAPE-1  result has exactly the 12 EvaluatedAction keys
 *     SHAPE-2  every field's runtime type matches the EvaluatedAction contract
 *     SHAPE-3  result is assignable to the mirrored EvaluatedAction type
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  mapLayer2AssessmentToEvaluatedAction,
  deriveReceiptId,
  RECEIPT_ID_PREFIX,
  type BridgeContext,
  type EvaluatedAction,
} from '../atl-bridge'

import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
// ============================================================================

let passCount = 0
let failCount = 0
const failures: string[] = []

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const ok = actual === expected
  assert(
    label,
    ok,
    ok
      ? undefined
      : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

// ============================================================================
// Fixtures
// ============================================================================

/** FULL assessment — every bridge-relevant field populated. Two phobos
 *  passions: the first has a non-null sub_species, the second has a NULL
 *  sub_species (the null-narrowing test). Two oikeiosis circles: the first is
 *  household / obligation_met=true, the second is local_community /
 *  obligation_met=false (the first-circle-selection test — the bridge must
 *  pick [0], not [1]). */
const FULL_ASSESSMENT: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [
      {
        id: 'p1',
        name: 'Anguished anxiety over peer response',
        root_passion: 'phobos',
        sub_species: 'agonia',
        false_judgement: 'The absence of a peer response is evidence of failure.',
        correct_judgement: "Another's response is a preferred indifferent.",
        causal_stage_affected: 'synkatathesis',
        evidence: 'I keep checking the team channel after I post.',
      },
      {
        id: 'p2',
        name: 'Hesitation before the next post',
        root_passion: 'phobos',
        // NULL sub_species — exercises the null → '' narrowing (NARROW-2).
        sub_species: null,
        false_judgement: 'Posting again will bring the same evil.',
        correct_judgement: 'Right action proceeds from judgement, not fear.',
        causal_stage_affected: 'horme',
        evidence: 'I tell myself it does not matter while still checking.',
      },
    ],
    false_judgements: ['The absence of a peer response is evidence of failure.'],
    correct_judgements: ["Another's response is a preferred indifferent."],
    causal_stage_affected: 'synkatathesis',
  },
  control_filter: {
    within_prohairesis: [
      {
        item: 'the quality of my own work',
        agent_named_position: 'within',
        classification: 'within',
        reasoning: 'agent_identified_within',
      },
    ],
    outside_prohairesis: [
      {
        item: 'peer response timing',
        agent_named_position: 'outside',
        classification: 'outside',
        reasoning: 'agent_identified_outside',
      },
    ],
    disambiguation_required: [],
  },
  oikeiosis: {
    relevant_circles: [
      {
        stage: 2,
        circle: 'household',
        description: 'immediate dependents',
        honourability_grade: 3,
        advantageousness_grade: 2,
        cicero_verdict: 'honourable_prevails',
        obligation_met: true,
        tension: null,
      },
      {
        stage: 3,
        circle: 'local_community',
        description: 'colleagues on the team channel',
        honourability_grade: 2,
        advantageousness_grade: 2,
        cicero_verdict: 'balanced_neither_decisive',
        obligation_met: false,
        tension: 'work obligation versus relational impulse',
      },
    ],
    deliberation_notes: 'The household obligation is being fulfilled.',
  },
  value_assessment: {
    indifferents_at_stake: [
      {
        name: 'reputation',
        axia: 'low',
        treated_as: 'evil',
        evidence: 'I feel the dip when no one has responded.',
        error: 'a low-worth dispreferred indifferent mis-categorised as evil',
      },
    ],
    value_error: 'Peer recognition is treated as more than it is.',
  },
  kathekon_assessment: {
    is_kathekon: false,
    quality: 'marginal',
    justification: 'The post-submission checking pattern is not appropriate action.',
  },
  iterative_refinement: {
    senecan_grade: 'grade_1',
    progress_dimensions: {
      passion_reduction: 'developing',
      judgement_quality: 'developing',
      disposition_stability: 'developing',
      oikeiosis_extension: 'developing',
    },
    direction_of_travel: 'stable',
    motivation_classification: 'unclear_pending_clarification',
  },
  katorthoma_proximity: 'deliberate',
  ruling_faculty_state: 'Examining the pattern but not yet substituting the judgement.',
  virtue_domains_engaged: ['phronesis', 'sophrosyne'],
  improvement_path_structured: {
    false_judgement_to_correct: 'The absence of peer response is evidence of failure.',
    mechanism_applies: 'passion_diagnosis',
    corrected_judgement: "Another's response is a preferred indifferent of low worth.",
  },
  stage_scores: {
    control_filter: 'adequate',
    passion_diagnosis: 'weak',
    oikeiosis: 'adequate',
    value_assessment: 'adequate',
    kathekon_assessment: 'weak',
    iterative_refinement: 'not_applied',
  },
  hasty_assent_risk: 'high',
  intake_clarifications: {
    soft_clarifications: [],
    open_deferrals: [],
  },
  layer1_ambiguity_notes: ['The temporal scope of "weeks" was not made precise.'],
  layer2_ambiguity_notes: [],
}

/** MINIMAL assessment — no passions, no circles, is_kathekon null, no virtue
 *  domains. Exercises the empty-array and null-narrowing paths. */
const MINIMAL_ASSESSMENT: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [],
    false_judgements: [],
    correct_judgements: [],
    causal_stage_affected: null,
  },
  control_filter: {
    within_prohairesis: [],
    outside_prohairesis: [],
    disambiguation_required: [],
  },
  oikeiosis: { relevant_circles: [], deliberation_notes: '' },
  value_assessment: { indifferents_at_stake: [], value_error: null },
  kathekon_assessment: {
    // NULL is_kathekon — exercises the null → false narrowing (NARROW-1).
    is_kathekon: null,
    quality: 'marginal',
    justification: 'Appropriateness cannot be determined from the available evidence.',
  },
  iterative_refinement: {
    senecan_grade: 'pre_progress',
    progress_dimensions: {
      passion_reduction: 'emerging',
      judgement_quality: 'emerging',
      disposition_stability: 'emerging',
      oikeiosis_extension: 'emerging',
    },
    direction_of_travel: 'single_snapshot',
    motivation_classification: null,
  },
  katorthoma_proximity: 'reflexive',
  ruling_faculty_state: 'Insufficient evidence to characterise.',
  virtue_domains_engaged: [],
  improvement_path_structured: null,
  stage_scores: {
    control_filter: 'not_applied',
    passion_diagnosis: 'not_applied',
    oikeiosis: 'not_applied',
    value_assessment: 'not_applied',
    kathekon_assessment: 'not_applied',
    iterative_refinement: 'not_applied',
  },
  hasty_assent_risk: 'none',
  intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
  layer1_ambiguity_notes: [],
  layer2_ambiguity_notes: [],
}

/** A first circle whose obligation_met is FALSE — confirms the bridge keeps a
 *  false obligation as false (not coerced to null). */
const FALSE_OBLIGATION_ASSESSMENT: Layer2Assessment = {
  ...FULL_ASSESSMENT,
  oikeiosis: {
    relevant_circles: [
      {
        stage: 1,
        circle: 'self_preservation',
        description: 'the agent itself',
        honourability_grade: 1,
        advantageousness_grade: 1,
        cicero_verdict: 'indeterminate',
        obligation_met: false,
        tension: null,
      },
    ],
    deliberation_notes: '',
  },
}

const CTX: BridgeContext = {
  agent_id: 'agent_acme_v3',
  evaluated_at: '2026-05-15T09:30:00.000Z',
  skill_id: 'sage-reason',
  signature: 'TEST_SIGNATURE_BASE64_AAAA',
  candidates_considered: 1,
}

const CTX_OTHER: BridgeContext = {
  ...CTX,
  signature: 'TEST_SIGNATURE_BASE64_BBBB',
}

/** The 13 keys of EvaluatedAction — the contract window-aggregator.ts consumes.
 *  Bumped 2026-05-16 (Decision A — D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-
 *  05-16): added `candidates_considered`. */
const EVALUATED_ACTION_KEYS = [
  'receipt_id',
  'agent_id',
  'evaluated_at',
  'proximity',
  'is_kathekon',
  'kathekon_quality',
  'passions_detected',
  'virtue_domains_engaged',
  'oikeiosis_met',
  'oikeiosis_stage',
  'ruling_faculty_state',
  'skill_id',
  'candidates_considered',
].sort()

// ============================================================================
// Main
// ============================================================================

function main(): void {
  const mappedFull = mapLayer2AssessmentToEvaluatedAction(FULL_ASSESSMENT, CTX)
  const mappedMinimal = mapLayer2AssessmentToEvaluatedAction(
    MINIMAL_ASSESSMENT,
    CTX
  )
  const mappedFalseObligation = mapLayer2AssessmentToEvaluatedAction(
    FALSE_OBLIGATION_ASSESSMENT,
    CTX
  )

  // --- receipt_id DERIVATION -------------------------------------------
  {
    const id = deriveReceiptId(CTX.signature)
    assert(
      'DERIVE-1  deriveReceiptId returns RECEIPT_ID_PREFIX + 64 hex chars',
      id.startsWith(RECEIPT_ID_PREFIX) &&
        /^[0-9a-f]{64}$/.test(id.slice(RECEIPT_ID_PREFIX.length)),
      `id=${id}`
    )
    assertEqual(
      'DERIVE-2  deriveReceiptId is deterministic (same signature → same id)',
      deriveReceiptId(CTX.signature),
      deriveReceiptId(CTX.signature)
    )
    assert(
      'DERIVE-3  different signatures → different receipt ids',
      deriveReceiptId(CTX.signature) !== deriveReceiptId(CTX_OTHER.signature)
    )
    assertEqual(
      'DERIVE-4  mapped.receipt_id === deriveReceiptId(context.signature)',
      mappedFull.receipt_id,
      deriveReceiptId(CTX.signature)
    )
  }

  // --- FULL-ASSESSMENT MAPPING -----------------------------------------
  assertEqual('MAP-1  proximity ← katorthoma_proximity', mappedFull.proximity, 'deliberate')
  assertEqual(
    'MAP-2  is_kathekon ← kathekon_assessment.is_kathekon (false preserved)',
    mappedFull.is_kathekon,
    false
  )
  assertEqual(
    'MAP-3  kathekon_quality ← kathekon_assessment.quality',
    mappedFull.kathekon_quality,
    'marginal'
  )
  assertEqual(
    'MAP-4  passions_detected length matches the source',
    mappedFull.passions_detected.length,
    2
  )
  assert(
    'MAP-5  passions_detected[0] root_passion + sub_species (non-null kept)',
    mappedFull.passions_detected[0].root_passion === 'phobos' &&
      mappedFull.passions_detected[0].sub_species === 'agonia'
  )
  assert(
    'MAP-6  virtue_domains_engaged content matches the source',
    JSON.stringify(mappedFull.virtue_domains_engaged) ===
      JSON.stringify(['phronesis', 'sophrosyne'])
  )
  assertEqual(
    'MAP-7  ruling_faculty_state ← ruling_faculty_state',
    mappedFull.ruling_faculty_state,
    'Examining the pattern but not yet substituting the judgement.'
  )
  assert(
    'MAP-8  virtue_domains_engaged is a fresh copy (not aliased to the source)',
    mappedFull.virtue_domains_engaged !==
      (FULL_ASSESSMENT.virtue_domains_engaged as unknown as string[])
  )

  // --- CONTEXT FIELDS ---------------------------------------------------
  assertEqual('CTX-1  agent_id ← context.agent_id', mappedFull.agent_id, 'agent_acme_v3')
  assertEqual(
    'CTX-2  evaluated_at ← context.evaluated_at',
    mappedFull.evaluated_at,
    '2026-05-15T09:30:00.000Z'
  )
  assertEqual('CTX-3  skill_id ← context.skill_id', mappedFull.skill_id, 'sage-reason')
  // Decision A (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — the 5th
  // BridgeContext field flows through the bridge onto EvaluatedAction.
  assertEqual(
    'CTX-4  candidates_considered ← context.candidates_considered (Decision A)',
    mappedFull.candidates_considered,
    1
  )
  {
    const ctxN: BridgeContext = { ...CTX, candidates_considered: 5 }
    const mappedN = mapLayer2AssessmentToEvaluatedAction(FULL_ASSESSMENT, ctxN)
    assertEqual(
      'CTX-5  candidates_considered carries N=5 through the bridge',
      mappedN.candidates_considered,
      5
    )
  }

  // --- OIKEIOSIS FIRST-CIRCLE SELECTION --------------------------------
  assertEqual(
    'OIK-1  2 circles → oikeiosis_met = relevant_circles[0].obligation_met',
    mappedFull.oikeiosis_met,
    true
  )
  assertEqual(
    'OIK-2  2 circles → oikeiosis_stage = relevant_circles[0].circle (NOT [1])',
    mappedFull.oikeiosis_stage,
    'household'
  )
  assertEqual(
    'OIK-3  0 circles → oikeiosis_met is null',
    mappedMinimal.oikeiosis_met,
    null
  )
  assertEqual(
    'OIK-4  0 circles → oikeiosis_stage is null',
    mappedMinimal.oikeiosis_stage,
    null
  )
  assertEqual(
    'OIK-5  first circle obligation_met=false is preserved as false (not null)',
    mappedFalseObligation.oikeiosis_met,
    false
  )

  // --- NULL NARROWING ---------------------------------------------------
  assertEqual(
    'NARROW-1  is_kathekon null → false',
    mappedMinimal.is_kathekon,
    false
  )
  assertEqual(
    'NARROW-2  sub_species null → empty string',
    mappedFull.passions_detected[1].sub_species,
    ''
  )
  assertEqual(
    'NARROW-3  sub_species non-null preserved verbatim',
    mappedFull.passions_detected[0].sub_species,
    'agonia'
  )

  // --- MINIMAL ASSESSMENT ----------------------------------------------
  assertEqual(
    'MIN-1  empty passions_detected → []',
    mappedMinimal.passions_detected.length,
    0
  )
  assertEqual(
    'MIN-2  empty virtue_domains_engaged → []',
    mappedMinimal.virtue_domains_engaged.length,
    0
  )
  assertEqual('MIN-3  proximity ← reflexive', mappedMinimal.proximity, 'reflexive')

  // --- INVARIANTS -------------------------------------------------------
  {
    const a = mapLayer2AssessmentToEvaluatedAction(FULL_ASSESSMENT, CTX)
    const b = mapLayer2AssessmentToEvaluatedAction(FULL_ASSESSMENT, CTX)
    assertEqual(
      'DET-1  two identical maps produce byte-identical EvaluatedAction',
      JSON.stringify(a),
      JSON.stringify(b)
    )
  }
  {
    const before = JSON.stringify(FULL_ASSESSMENT)
    mapLayer2AssessmentToEvaluatedAction(FULL_ASSESSMENT, CTX)
    const after = JSON.stringify(FULL_ASSESSMENT)
    assertEqual(
      'DET-2  mapping does not mutate the input assessment',
      after,
      before
    )
  }

  // --- SHAPE-VALIDITY FOR window-aggregator.ts -------------------------
  {
    const keys = Object.keys(mappedFull).sort()
    assert(
      'SHAPE-1  result has exactly the 12 EvaluatedAction keys',
      JSON.stringify(keys) === JSON.stringify(EVALUATED_ACTION_KEYS),
      `keys=${JSON.stringify(keys)}`
    )
    const passionShapeOk = mappedFull.passions_detected.every(
      (p) =>
        typeof p.root_passion === 'string' && typeof p.sub_species === 'string'
    )
    assert(
      'SHAPE-2  every field runtime type matches the EvaluatedAction contract',
      typeof mappedFull.receipt_id === 'string' &&
        typeof mappedFull.agent_id === 'string' &&
        typeof mappedFull.evaluated_at === 'string' &&
        typeof mappedFull.proximity === 'string' &&
        typeof mappedFull.is_kathekon === 'boolean' &&
        typeof mappedFull.kathekon_quality === 'string' &&
        Array.isArray(mappedFull.passions_detected) &&
        passionShapeOk &&
        Array.isArray(mappedFull.virtue_domains_engaged) &&
        mappedFull.virtue_domains_engaged.every((v) => typeof v === 'string') &&
        (typeof mappedFull.oikeiosis_met === 'boolean' ||
          mappedFull.oikeiosis_met === null) &&
        (typeof mappedFull.oikeiosis_stage === 'string' ||
          mappedFull.oikeiosis_stage === null) &&
        typeof mappedFull.ruling_faculty_state === 'string' &&
        typeof mappedFull.skill_id === 'string' &&
        // Decision A (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) —
        // candidates_considered is a finite non-negative number.
        typeof mappedFull.candidates_considered === 'number' &&
        Number.isFinite(mappedFull.candidates_considered)
    )
    // SHAPE-3 — compile-time assignability to the mirrored EvaluatedAction is
    // shape-validity for computeWindowSnapshot(agentId, EvaluatedAction[], ...)
    // (see the module header on why the real aggregator cannot be imported).
    const shapeCheck: EvaluatedAction = mappedFull
    assert(
      'SHAPE-3  result is assignable to the mirrored EvaluatedAction type',
      shapeCheck === mappedFull
    )
  }

  // --- Summary ----------------------------------------------------------
  console.log('')
  console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('FAILURES:')
    for (const f of failures) console.log(`  - ${f}`)
  }
}

main()
process.exit(failCount === 0 ? 0 : 1)
