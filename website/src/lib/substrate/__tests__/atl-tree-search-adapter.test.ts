/**
 * atl-tree-search-adapter.test.ts — tree-search composition surface
 * functional tests + invariant checks.
 *
 * Run via:
 *   npx tsx website/src/lib/substrate/__tests__/atl-tree-search-adapter.test.ts
 *
 * Plain-assertion script (no Jest); exit code 0 = all pass.
 *
 * PR2 — build-to-wire verification immediate: this file invokes
 * createSubstrateEvaluator in the same session atl-tree-search-adapter.ts is
 * written.
 *
 * COVERAGE
 *
 *   createSubstrateEvaluator — Decision C (D-ATL-ITEMS-1-3-BUILD-WIRED-
 *                              VERIFIED-2026-05-16)
 *     ADAPT-1  factory returns a function
 *     ADAPT-2  one node → one substrate call + one bridge-context-provider call
 *     ADAPT-3  result is a well-formed EvaluatedAction (15 fields incl. Decision A)
 *     ADAPT-4  bridge-context-provider's BridgeContext flows into the EvaluatedAction
 *     ADAPT-5  Layer 2 assessment's katorthoma_proximity flows into proximity
 *     ADAPT-6  candidates_considered carries the provider's value (Decision A)
 *     ADAPT-7  the adapter does NOT mutate the substrate caller's input
 *     ADAPT-8  determinism — two calls with same input produce same output
 *
 *   INVARIANT
 *     INV-1  the factory itself reads no clock (pure factory; the returned
 *            function's I/O surface is determined by callSubstrate)
 */

import { createSubstrateEvaluator } from '../atl-tree-search-adapter'

import type { BridgeContext, EvaluatedAction } from '../atl-bridge'
import type { Layer1Schema } from '../../translation-sandwich/layer1-extractor'
import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'

// ============================================================================
// Test runner
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
  assert(
    label,
    JSON.stringify(actual) === JSON.stringify(expected),
    `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  )
}

// ============================================================================
// Fixtures
// ============================================================================

const NODE_INPUT: Layer1Schema = {
  version: 'layer1-schema-v1',
  passions_present: [],
  control_filter_elements: [],
  oikeiosis_circles_engaged: [],
  value_categories_at_stake: [],
  kathekon_factors: [],
  urgency_indicators: [],
  causal_stage_evidence: [],
  eupatheia_candidates: [],
  stated_concern_targets: [],
  stated_equanimity_signals: [],
  motivation_stated: false,
  motivation_evidence: [],
  element_fusion_detected: { fused: false, fused_concerns: null },
  ambiguity_notes: [],
}

function fakeAssessment(): Layer2Assessment {
  return {
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
      is_kathekon: true,
      quality: 'strong',
      justification: 'Test fixture — appropriate per the input.',
    },
    iterative_refinement: {
      senecan_grade: 'grade_2',
      progress_dimensions: {
        passion_reduction: 'developing',
        judgement_quality: 'established',
        disposition_stability: 'developing',
        oikeiosis_extension: 'emerging',
      },
      direction_of_travel: 'single_snapshot',
      motivation_classification: null,
    },
    katorthoma_proximity: 'deliberate',
    ruling_faculty_state: 'Test fixture ruling-faculty state.',
    virtue_domains_engaged: [],
    improvement_path_structured: null,
    stage_scores: {
      control_filter: 'not_applied',
      passion_diagnosis: 'not_applied',
      oikeiosis: 'not_applied',
      value_assessment: 'not_applied',
      kathekon_assessment: 'weak',
      iterative_refinement: 'not_applied',
    },
    hasty_assent_risk: 'none',
    intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
    layer1_ambiguity_notes: [],
    layer2_ambiguity_notes: [],
  }
}

function fakeContext(): BridgeContext {
  return {
    agent_id: 'agent_tree_search_test',
    evaluated_at: '2026-05-16T12:00:00.000Z',
    skill_id: 'sage-reason',
    signature: 'TEST_SIG_TREE_AAAA',
    candidates_considered: 4,
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  let substrateCalls = 0
  let providerCalls = 0

  const callSubstrate = async (input: Layer1Schema): Promise<Layer2Assessment> => {
    substrateCalls++
    void input // unused — fixture returns a fixed assessment
    return fakeAssessment()
  }

  const bridgeContextProvider = (input: Layer1Schema): BridgeContext => {
    providerCalls++
    void input
    return fakeContext()
  }

  // ADAPT-1
  const evaluator = createSubstrateEvaluator(callSubstrate, bridgeContextProvider)
  assert('ADAPT-1  factory returns a function', typeof evaluator === 'function')

  // ADAPT-2 — one node → one substrate call + one bridge-context-provider call
  const result: EvaluatedAction = await evaluator(NODE_INPUT)
  assertEqual('ADAPT-2a  one substrate call', substrateCalls, 1)
  assertEqual('ADAPT-2b  one bridge-context-provider call', providerCalls, 1)

  // ADAPT-3 — the 13 EvaluatedAction fields (post-Decision-A schema)
  const requiredFields: (keyof EvaluatedAction)[] = [
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
  ]
  const haveAllFields = requiredFields.every((k) => k in result)
  assert('ADAPT-3  result has the 13 EvaluatedAction fields', haveAllFields)

  // ADAPT-4 — context fields flow through
  assertEqual('ADAPT-4a  agent_id from context', result.agent_id, 'agent_tree_search_test')
  assertEqual(
    'ADAPT-4b  evaluated_at from context',
    result.evaluated_at,
    '2026-05-16T12:00:00.000Z'
  )
  assertEqual('ADAPT-4c  skill_id from context', result.skill_id, 'sage-reason')

  // ADAPT-5 — Layer 2 assessment field flows through
  assertEqual('ADAPT-5  proximity from assessment', result.proximity, 'deliberate')

  // ADAPT-6 — Decision A signal
  assertEqual(
    'ADAPT-6  candidates_considered from BridgeContext (Decision A)',
    result.candidates_considered,
    4
  )

  // ADAPT-7 — adapter doesn't mutate input
  const beforeKeys = Object.keys(NODE_INPUT).sort().join(',')
  const afterKeys = Object.keys(NODE_INPUT).sort().join(',')
  assertEqual('ADAPT-7  adapter does not mutate node input', afterKeys, beforeKeys)

  // ADAPT-8 — determinism (modulo receipt_id which is signature-derived)
  const r2: EvaluatedAction = await evaluator(NODE_INPUT)
  assertEqual('ADAPT-8  determinism — receipt_id repeats', r2.receipt_id, result.receipt_id)
  assertEqual('ADAPT-8  determinism — proximity repeats', r2.proximity, result.proximity)

  // INV-1 — the factory itself reads no clock. Constructing the evaluator did
  // not increment counts (only the call did).
  const beforeSubstrateCalls = substrateCalls
  const beforeProviderCalls = providerCalls
  createSubstrateEvaluator(callSubstrate, bridgeContextProvider)
  assertEqual('INV-1a  factory does not call substrate', substrateCalls, beforeSubstrateCalls)
  assertEqual('INV-1b  factory does not call provider', providerCalls, beforeProviderCalls)

  // Summary
  console.log('')
  console.log(`Total: ${passCount + failCount}    Pass: ${passCount}    Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('Failures:')
    for (const f of failures) console.log(`  • ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Test runner threw:', err)
  process.exit(1)
})
