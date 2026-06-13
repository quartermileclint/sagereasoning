/**
 * loop-closure-gate.test.ts — CI-4 write-boundary half (mechanism-correction
 * M3, 2026-06-13).
 *
 * Plain-assertion script run with: npx tsx <this file>   (gate module has no
 * Supabase chain — runs bare, no --env-file needed).
 *
 * What it proves:
 *   1. FLAGS UNSET (the deployed default): enforceLoopClosure returns
 *      enforced:false for every body shape — behaviour byte-identical; the
 *      success response body is byte-identical to the pre-gate shape.
 *   2. The pure analysis implements the Q4 mentor verdict: a redirection is
 *      closed only by a LATER re-examination referencing it at the SAME
 *      depth tier or deeper; marker-less redirections are indeterminate
 *      (closure unverifiable — every pre-M5 chain).
 *   3. FLAG mode: unclosed chains pass with the analysis annotated.
 *   4. REJECT mode: unclosed chains are refused (loop_unclosed); closed and
 *      redirection-free chains pass.
 */

import {
  analyseLoopClosure,
  enforceLoopClosure,
  LOOP_CLOSURE_GATE_ENV_VAR,
  LOOP_CLOSURE_REJECT_ENV_VAR,
} from '../loop-closure-gate'
import { buildWriteSuccessResponse } from '../response-builders'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

// ============================================================================
// CHAIN-ELEMENT FIXTURES (shape mirrors SignedLayer2Assessment; only the
// closure-relevant fields matter to the gate)
// ============================================================================

/** A signed assessment that issued NO redirection. */
function cleanElement(exam?: object) {
  return {
    assessment: { improvement_path_structured: null, ...(exam ? { examination: exam } : {}) },
    signature: 'sig',
    key_id: 'key-1',
  }
}

/** A signed assessment that ISSUED a redirection (Rule-5 correction carrier). */
function redirectionElement(exam?: object) {
  return {
    assessment: {
      improvement_path_structured: {
        false_judgement_to_correct: 'x',
        mechanism_applies: 'passion_diagnosis',
        corrected_judgement: 'y',
      },
      ...(exam ? { examination: exam } : {}),
    },
    signature: 'sig',
    key_id: 'key-1',
  }
}

function body(elements: unknown[]) {
  return { kind: 'seed', profile: {}, provenance: { signed_assessments: elements } }
}

// ============================================================================
// 1. FLAGS UNSET — byte-identical behaviour
// ============================================================================

delete process.env[LOOP_CLOSURE_GATE_ENV_VAR]
delete process.env[LOOP_CLOSURE_REJECT_ENV_VAR]

const offResult = enforceLoopClosure(body([redirectionElement()]))
assert(offResult.ok === true, 'flags unset: gate passes')
assert(
  offResult.ok === true && offResult.enforced === false,
  'flags unset: gate did not enforce (dark)',
)

// The success response without annotation is byte-identical to the pre-gate
// body shape.
async function assertResponseShapes(): Promise<void> {
  const plain = await buildWriteSuccessResponse().json()
  assert(
    JSON.stringify(plain) ===
      JSON.stringify({
        status: 'ok',
        documentation_url: 'https://sagereasoning.com/limitations',
      }),
    'flags unset: write success body byte-identical to pre-gate shape',
  )

  const annotated = await buildWriteSuccessResponse({
    verdict: 'unclosed',
    redirections: 1,
    closed: 0,
    open: 0,
    indeterminate: 1,
  }).json()
  assert(
    annotated.loop_closure !== undefined &&
      annotated.loop_closure.verdict === 'unclosed',
    'flag mode: write success body carries the loop_closure annotation',
  )
}

// ============================================================================
// 2. THE PURE ANALYSIS — the Q4 same-depth rule
// ============================================================================

// No chain at all.
assert(analyseLoopClosure(undefined).verdict === 'no_chain', 'no provenance → no_chain')
assert(analyseLoopClosure([]).verdict === 'no_chain', 'empty chain → no_chain')

// Chain with no redirections.
const clean = analyseLoopClosure([cleanElement(), cleanElement()])
assert(clean.verdict === 'no_redirections', 'redirection-free chain → no_redirections')
assert(clean.redirections === 0, 'redirection-free chain counts 0 redirections')

// Marker-less redirection (every pre-M5 chain) → indeterminate → unclosed.
const preM5 = analyseLoopClosure([cleanElement(), redirectionElement()])
assert(preM5.verdict === 'unclosed', 'marker-less redirection → unclosed')
assert(preM5.indeterminate === 1, 'marker-less redirection counted indeterminate')
assert(preM5.open === 0 && preM5.closed === 0, 'marker-less redirection neither open nor closed')

// Closed loop: redirection at standard, re-examined LATER at standard.
const closedChain = analyseLoopClosure([
  redirectionElement({ ref: 'ex-1', depth_tier: 'standard' }),
  cleanElement({ ref: 'ex-2', depth_tier: 'standard', prior_feedback_ref: 'ex-1' }),
])
assert(closedChain.verdict === 'closed', 'same-depth later re-examination → closed')
assert(closedChain.closed === 1, 'closed count 1')

// Deeper re-examination also closes (rank ≥).
const deeper = analyseLoopClosure([
  redirectionElement({ ref: 'ex-1', depth_tier: 'quick' }),
  cleanElement({ ref: 'ex-2', depth_tier: 'deep', prior_feedback_ref: 'ex-1' }),
])
assert(deeper.verdict === 'closed', 'deeper re-examination closes')

// SHALLOWER re-examination does NOT close (the Q4 same-depth rule).
const shallower = analyseLoopClosure([
  redirectionElement({ ref: 'ex-1', depth_tier: 'deep' }),
  cleanElement({ ref: 'ex-2', depth_tier: 'quick', prior_feedback_ref: 'ex-1' }),
])
assert(shallower.verdict === 'unclosed', 'shallower re-examination does not close')
assert(shallower.open === 1, 'shallower re-examination leaves the loop open')

// An EARLIER element cannot close a later redirection (the correction is a
// NEW phantasia — the return must follow it).
const earlier = analyseLoopClosure([
  cleanElement({ ref: 'ex-0', depth_tier: 'standard', prior_feedback_ref: 'ex-1' }),
  redirectionElement({ ref: 'ex-1', depth_tier: 'standard' }),
])
assert(earlier.verdict === 'unclosed', 'earlier element does not close a later redirection')

// A re-examination that ITSELF issues a redirection opens a new loop.
const chained = analyseLoopClosure([
  redirectionElement({ ref: 'ex-1', depth_tier: 'standard' }),
  redirectionElement({ ref: 'ex-2', depth_tier: 'standard', prior_feedback_ref: 'ex-1' }),
])
assert(chained.verdict === 'unclosed', 're-examination issuing a new redirection leaves its own loop open')
assert(chained.closed === 1 && chained.open === 1, 'chained loops: first closed, second open')

// Mixed: one closed, one marker-less.
const mixed = analyseLoopClosure([
  redirectionElement({ ref: 'ex-1', depth_tier: 'standard' }),
  cleanElement({ ref: 'ex-2', depth_tier: 'standard', prior_feedback_ref: 'ex-1' }),
  redirectionElement(),
])
assert(mixed.verdict === 'unclosed', 'mixed chain with an indeterminate redirection → unclosed')
assert(mixed.closed === 1 && mixed.indeterminate === 1, 'mixed chain counts')

// Malformed elements never throw.
const malformed = analyseLoopClosure([null, 42, 'x', { assessment: null }, {}])
assert(malformed.verdict === 'no_redirections', 'malformed elements analyse safely')

// ============================================================================
// 3. FLAG mode — unclosed chains pass, annotated
// ============================================================================

process.env[LOOP_CLOSURE_GATE_ENV_VAR] = 'true'
delete process.env[LOOP_CLOSURE_REJECT_ENV_VAR]

const flagResult = enforceLoopClosure(body([redirectionElement()]))
assert(flagResult.ok === true, 'flag mode: unclosed chain passes')
assert(
  flagResult.ok === true &&
    flagResult.enforced === true &&
    flagResult.analysis.verdict === 'unclosed',
  'flag mode: analysis annotated (unclosed)',
)

// ============================================================================
// 4. REJECT mode
// ============================================================================

process.env[LOOP_CLOSURE_GATE_ENV_VAR] = 'true'
process.env[LOOP_CLOSURE_REJECT_ENV_VAR] = 'true'

const rejectUnclosed = enforceLoopClosure(body([redirectionElement()]))
assert(rejectUnclosed.ok === false, 'reject mode: unclosed chain refused')
assert(
  rejectUnclosed.ok === false && rejectUnclosed.status === 'loop_unclosed',
  'reject mode: refusal status loop_unclosed',
)

const rejectClosed = enforceLoopClosure(
  body([
    redirectionElement({ ref: 'ex-1', depth_tier: 'standard' }),
    cleanElement({ ref: 'ex-2', depth_tier: 'standard', prior_feedback_ref: 'ex-1' }),
  ]),
)
assert(rejectClosed.ok === true, 'reject mode: closed chain passes')

const rejectClean = enforceLoopClosure(body([cleanElement()]))
assert(rejectClean.ok === true, 'reject mode: redirection-free chain passes')

// Reject without the master switch does nothing (escalation requires both).
delete process.env[LOOP_CLOSURE_GATE_ENV_VAR]
process.env[LOOP_CLOSURE_REJECT_ENV_VAR] = 'true'
const rejectOnly = enforceLoopClosure(body([redirectionElement()]))
assert(
  rejectOnly.ok === true && rejectOnly.enforced === false,
  'reject flag without master switch: gate stays dark',
)

// Clean up env.
delete process.env[LOOP_CLOSURE_GATE_ENV_VAR]
delete process.env[LOOP_CLOSURE_REJECT_ENV_VAR]

// ============================================================================
// RESULT (async leg awaited first)
// ============================================================================

assertResponseShapes().then(() => {
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
})
