/**
 * reason-loop-closure.test.ts — CI-4 reason-route half (mechanism-correction
 * M5, 2026-06-13).
 *
 * Plain-assertion script run with: npx tsx <this file>   (no Supabase chain —
 * reason-loop-closure, layer2-canonical-json, and the M3 loop-closure-gate are
 * all env-only / pure; runs bare, no --env-file needed).
 *
 * What it proves:
 *   1. FLAG UNSET (the deployed default): the flag reader is false, so the
 *      route skips the affordance entirely → no markers, byte-identical.
 *   2. prior_feedback ACCEPTED + validated: absent → fresh; valid → carried;
 *      malformed → an honest error the route turns into a 400.
 *   3. SAME-DEPTH CARRY + markers: a fresh examination carries ref + depth_tier
 *      (and OMITS prior_feedback_ref — the canonicaliser throws on undefined);
 *      a re-examination carries prior_feedback_ref.
 *   4. examination_open mirrors the gate's "redirection issued" definition.
 *   5. SIGNING-SAFETY: the markers are covered by the canonical signing bytes
 *      (so the M3 gate can trust them), and the fresh-marker shape never feeds
 *      an undefined value to the canonicaliser.
 *   6. TWO-HALVES COMPOSITION: the markers this module produces, fed to the M3
 *      write-boundary gate, close a loop only on a SAME-depth-or-deeper
 *      re-examination; an open chain (redirection, no return) is what the gate
 *      flags as unclosed.
 */

import {
  isReasonLoopClosureEnabled,
  parsePriorFeedback,
  buildExaminationMarkers,
  examinationOpen,
  composeReExaminationContext,
  REASON_LOOP_CLOSURE_ENV_VAR,
} from '../reason-loop-closure'
import {
  canonicaliseLayer2Assessment,
  Layer2CanonicalisationError,
} from '../layer2-canonical-json'
import type { Layer2Assessment } from '../layer2-mechanisms'
// The M3 write-boundary gate (the OTHER half) — imported to prove composition.
import { analyseLoopClosure } from '../../../app/api/accreditation/[agent_id]/loop-closure-gate'

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
// 1. FLAG READER — unset is the deployed default (byte-identity path)
// ============================================================================

delete process.env[REASON_LOOP_CLOSURE_ENV_VAR]
assert(isReasonLoopClosureEnabled() === false, 'flag unset: reader false (route skips affordance → no markers)')
process.env[REASON_LOOP_CLOSURE_ENV_VAR] = 'false'
assert(isReasonLoopClosureEnabled() === false, "flag 'false': reader false")
process.env[REASON_LOOP_CLOSURE_ENV_VAR] = 'true'
assert(isReasonLoopClosureEnabled() === true, "flag 'true': reader true")
delete process.env[REASON_LOOP_CLOSURE_ENV_VAR]

// ============================================================================
// 2. parsePriorFeedback — accept / validate
// ============================================================================

assert(
  parsePriorFeedback(undefined).ok === true &&
    (parsePriorFeedback(undefined) as { value: unknown }).value === null,
  'prior_feedback absent → ok, value null (fresh examination)',
)
assert(
  parsePriorFeedback(null).ok === true &&
    (parsePriorFeedback(null) as { value: unknown }).value === null,
  'prior_feedback null → ok, value null',
)

const validPf = parsePriorFeedback({
  prior_loop_id: 'loop-001',
  prior_depth_tier: 'standard',
  adopted_correction: 'guard against oknos',
})
assert(validPf.ok === true, 'valid prior_feedback → ok')
assert(
  validPf.ok === true &&
    validPf.value !== null &&
    validPf.value.prior_loop_id === 'loop-001' &&
    validPf.value.prior_depth_tier === 'standard' &&
    validPf.value.adopted_correction === 'guard against oknos',
  'valid prior_feedback → carries prior_loop_id + depth + correction',
)

// adopted_correction is optional
const noCorrection = parsePriorFeedback({ prior_loop_id: 'loop-001', prior_depth_tier: 'deep' })
assert(
  noCorrection.ok === true &&
    noCorrection.value !== null &&
    noCorrection.value.adopted_correction === undefined,
  'prior_feedback without adopted_correction → ok (correction omitted)',
)

// malformed → error (the route 400s)
assert(parsePriorFeedback({ prior_depth_tier: 'standard' }).ok === false, 'missing prior_loop_id → error')
assert(parsePriorFeedback({ prior_loop_id: '', prior_depth_tier: 'standard' }).ok === false, 'empty prior_loop_id → error')
assert(parsePriorFeedback({ prior_loop_id: 'x' }).ok === false, 'missing prior_depth_tier → error')
assert(parsePriorFeedback({ prior_loop_id: 'x', prior_depth_tier: 'shallow' }).ok === false, 'invalid depth tier → error')
assert(
  parsePriorFeedback({ prior_loop_id: 'x', prior_depth_tier: 'standard', adopted_correction: 42 }).ok === false,
  'non-string adopted_correction → error',
)
assert(parsePriorFeedback(['x']).ok === false, 'array → error')
assert(parsePriorFeedback('loop-001').ok === false, 'string → error')

// ============================================================================
// 3. buildExaminationMarkers — same-depth + undefined-omission
// ============================================================================

const freshMarkers = buildExaminationMarkers({ ref: 'L1', depthTier: 'standard', priorFeedback: null })
assert(freshMarkers.ref === 'L1' && freshMarkers.depth_tier === 'standard', 'fresh markers carry ref + depth_tier')
assert(
  !('prior_feedback_ref' in freshMarkers),
  'fresh markers OMIT prior_feedback_ref (no undefined key — canonicaliser-safe)',
)

const reExamMarkers = buildExaminationMarkers({
  ref: 'L2',
  depthTier: 'standard',
  priorFeedback: { prior_loop_id: 'L1', prior_depth_tier: 'standard' },
})
assert(
  reExamMarkers.prior_feedback_ref === 'L1' && reExamMarkers.depth_tier === 'standard',
  're-examination markers carry prior_feedback_ref + the carried depth',
)

// ============================================================================
// 4. examinationOpen — mirrors the gate's "redirection issued" definition
// ============================================================================

assert(examinationOpen({ improvement_path_structured: { false_judgement_to_correct: 'x' } }) === true, 'redirection → examination_open true')
assert(examinationOpen({ improvement_path_structured: null }) === false, 'no redirection (null) → examination_open false')
assert(examinationOpen({}) === false, 'no redirection (undefined) → examination_open false')

// ============================================================================
// 5. composeReExaminationContext — Note-A correction folding (byte-identity off)
// ============================================================================

assert(composeReExaminationContext('base', null) === 'base', 'no prior_feedback → context unchanged')
assert(
  composeReExaminationContext('base', { prior_loop_id: 'L1', prior_depth_tier: 'standard' }) === 'base',
  'prior_feedback without correction → context unchanged',
)
const folded = composeReExaminationContext('base', {
  prior_loop_id: 'L1',
  prior_depth_tier: 'standard',
  adopted_correction: 'guard against oknos',
})
assert(
  folded !== undefined && folded.includes('base') && folded.includes('L1') && folded.includes('guard against oknos'),
  'prior_feedback with correction → folded into context',
)
const foldedNoBase = composeReExaminationContext(undefined, {
  prior_loop_id: 'L1',
  prior_depth_tier: 'standard',
  adopted_correction: 'guard against oknos',
})
assert(
  foldedNoBase !== undefined && foldedNoBase.includes('guard against oknos'),
  'no base context + correction → note only',
)

// ============================================================================
// 6. SIGNING-SAFETY — markers covered by the canonical bytes; no undefined feed
// ============================================================================

const baseAssessment = {
  improvement_path_structured: null,
  katorthoma_proximity: 'deliberate',
} as unknown as Layer2Assessment

const canonicalWithout = canonicaliseLayer2Assessment(baseAssessment)
const canonicalWith = canonicaliseLayer2Assessment({
  ...baseAssessment,
  examination: freshMarkers,
} as unknown as Layer2Assessment)

assert(canonicalWithout !== canonicalWith, 'examination markers CHANGE the canonical bytes (covered by the signature)')
assert(!canonicalWith.includes('prior_feedback_ref'), 'fresh-marker canonical bytes contain no prior_feedback_ref key')

let freshThrew = false
try {
  canonicaliseLayer2Assessment({ ...baseAssessment, examination: freshMarkers } as unknown as Layer2Assessment)
} catch {
  freshThrew = true
}
assert(!freshThrew, 'fresh markers canonicalise WITHOUT throwing (undefined-omission works)')

let trapThrew = false
try {
  canonicaliseLayer2Assessment({
    ...baseAssessment,
    examination: { ref: 'L1', depth_tier: 'standard', prior_feedback_ref: undefined },
  } as unknown as Layer2Assessment)
} catch (e) {
  trapThrew = e instanceof Layer2CanonicalisationError
}
assert(trapThrew, 'an explicit undefined prior_feedback_ref WOULD throw — buildExaminationMarkers is what avoids it')

// ============================================================================
// 7. TWO-HALVES COMPOSITION — CI-4 markers feed the M3 gate
// ============================================================================

// Chain element shapes mirror SignedLayer2Assessment; only the gate-relevant
// fields matter. The examination field is produced by buildExaminationMarkers.
function redirectionElement(markers: object) {
  return {
    assessment: {
      improvement_path_structured: { false_judgement_to_correct: 'x' },
      examination: markers,
    },
  }
}
function cleanElement(markers: object) {
  return { assessment: { improvement_path_structured: null, examination: markers } }
}

// (a) Redirection at standard, closed by a same-depth re-examination → closed.
const closedChain = analyseLoopClosure([
  redirectionElement(buildExaminationMarkers({ ref: 'L1', depthTier: 'standard', priorFeedback: null })),
  cleanElement(
    buildExaminationMarkers({
      ref: 'L2',
      depthTier: 'standard',
      priorFeedback: { prior_loop_id: 'L1', prior_depth_tier: 'standard' },
    }),
  ),
])
assert(closedChain.verdict === 'closed' && closedChain.closed === 1, 'same-depth re-examination CLOSES the loop')

// (b) Same redirection, re-examined at a LOWER depth (quick) → unclosed (Q4).
const downgradedChain = analyseLoopClosure([
  redirectionElement(buildExaminationMarkers({ ref: 'L1', depthTier: 'standard', priorFeedback: null })),
  cleanElement(
    buildExaminationMarkers({
      ref: 'L3',
      depthTier: 'quick',
      priorFeedback: { prior_loop_id: 'L1', prior_depth_tier: 'quick' },
    }),
  ),
])
assert(downgradedChain.verdict === 'unclosed' && downgradedChain.open === 1, 'lower-depth re-examination does NOT close (same-depth rule)')

// (c) Re-examined DEEPER than the original → closed (rank ≥ original).
const deeperChain = analyseLoopClosure([
  redirectionElement(buildExaminationMarkers({ ref: 'L1', depthTier: 'standard', priorFeedback: null })),
  cleanElement(
    buildExaminationMarkers({
      ref: 'L4',
      depthTier: 'deep',
      priorFeedback: { prior_loop_id: 'L1', prior_depth_tier: 'deep' },
    }),
  ),
])
assert(deeperChain.verdict === 'closed', 'deeper re-examination closes the loop (rank ≥ original)')

// (d) An OPEN chain — redirection with markers, no return → unclosed (what the
//     M3 boundary flags).
const openChain = analyseLoopClosure([
  redirectionElement(buildExaminationMarkers({ ref: 'L1', depthTier: 'standard', priorFeedback: null })),
])
assert(openChain.verdict === 'unclosed' && openChain.open === 1, 'open chain (no return) → unclosed (the bite point)')

// ============================================================================
// RESULT
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
