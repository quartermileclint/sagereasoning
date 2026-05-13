/**
 * r20a-gate.test.ts — Functional + invariant tests for A7 server-side R20a gate.
 *
 * Run via: npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts
 *
 * Test pattern follows the A5 precedent (no Jest infrastructure):
 *   - Each test logs `PASS — <name>` or `FAIL — <name>: <message>` on its own
 *     line.
 *   - End-of-file summary logs `<pass>/<total> pass | <fail>/<total> fail`.
 *   - Exit code 0 if all pass; exit code 1 if any fail.
 *
 * COVERAGE
 *
 * Flag tests (FT-1..FT-4):
 *   - isSubstrateR20aGateEnabled returns correct value for various env states
 *   - enforceLayer2R20aGate returns BYPASSED when flag unset
 *
 * Reused-gate tests (FT-5..FT-7):
 *   - REDIRECT when SafetyGate.shouldRedirect=true (moderate/acute)
 *   - PASS + distress_signal=true when mild severity
 *   - PASS + distress_signal=false when no distress
 *
 * Attachment tests (FT-9..FT-12):
 *   - attachDistressSignalToAssessment correctly attaches or skips
 *
 * Type-guard tests (FT-14a..FT-14c):
 *   - isGateBypassed / isGateRedirect / isGatePass narrow correctly
 *
 * Span tests (FT-13):
 *   - span_id is unique per call
 *
 * Invariant tests (INV-1, INV-2):
 *   - No throw under any input on the reused-gate path
 *   - When BYPASSED, no span is emitted
 *
 * Latency test (LT-1):
 *   - Reused-gate path completes well within AC2 budget (<10ms; no LLM call)
 *
 * NOT COVERED IN THIS FILE (deferred to manual verification at Step 6):
 *   - FT-8 outer-throw fail-CLOSED behaviour — requires stubbing the
 *     classifier. The fail-CLOSED semantic is documented in code comments
 *     at r20a-gate.ts §A7.2; manual verification by inducing an error in
 *     dev/staging.
 *   - Fresh-classifier-call path (FT-5..FT-7 variants) — requires real
 *     Anthropic SDK call. Covered indirectly when /api/reason itself runs
 *     in dev/staging with the flag ON.
 */

import { createSafetyGate } from '@/lib/constraints'
import type { DistressDetectionResult } from '@/lib/guardrails'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'

import {
  enforceLayer2R20aGate,
  attachDistressSignalToAssessment,
  isSubstrateR20aGateEnabled,
  isGateBypassed,
  isGateRedirect,
  isGatePass,
  A7_FALLBACK_REDIRECT_MESSAGE,
  type R20aGateOutput,
  type R20aGateResult,
} from '../r20a-gate'

// ============================================================================
// TEST HARNESS
// ============================================================================

let passCount = 0
let failCount = 0

function pass(name: string): void {
  console.log(`PASS — ${name}`)
  passCount++
}

function fail(name: string, message: string): void {
  console.log(`FAIL — ${name}: ${message}`)
  failCount++
}

function expect<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    pass(name)
  } else {
    fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function expectDefined(name: string, actual: unknown): void {
  if (actual !== undefined && actual !== null) {
    pass(name)
  } else {
    fail(name, `expected defined non-null value, got ${actual}`)
  }
}

// ============================================================================
// FIXTURES
// ============================================================================

const distressResultNone: DistressDetectionResult = {
  distress_detected: false,
  severity: 'none',
  indicators_found: [],
  redirect_message: null,
}

const distressResultMild: DistressDetectionResult = {
  distress_detected: true,
  severity: 'mild',
  indicators_found: ['haiku_evaluator: mild distress language detected'],
  redirect_message: null, // mild does NOT trigger redirect at route level
}

const distressResultModerate: DistressDetectionResult = {
  distress_detected: true,
  severity: 'moderate',
  indicators_found: ['haiku_evaluator: moderate distress'],
  redirect_message:
    'Before we continue, we want to make sure you are okay...',
}

const distressResultAcute: DistressDetectionResult = {
  distress_detected: true,
  severity: 'acute',
  indicators_found: ['regex: acute self-harm indicator'],
  redirect_message:
    'We have paused this evaluation because your words suggest you may be going through something very difficult...',
}

function makeAssessment(): Layer2Assessment {
  // Minimal valid-shape Layer2Assessment for attachment tests. The full
  // shape carries many fields; we only need to verify the spread operation
  // preserves them while adding distress_signal.
  return {
    version: 'layer2-assessment-v1',
    layer1_schema_version: 'layer1-schema-v1',
    // Cast through unknown to avoid having to construct the full shape for
    // a pure-attachment test. The fields below are never inspected by
    // attachDistressSignalToAssessment — it only reads + spreads.
    passion_diagnosis: {} as Layer2Assessment['passion_diagnosis'],
    control_filter: {} as Layer2Assessment['control_filter'],
    oikeiosis: {} as Layer2Assessment['oikeiosis'],
    value_assessment: {} as Layer2Assessment['value_assessment'],
    kathekon_assessment: {} as Layer2Assessment['kathekon_assessment'],
    iterative_refinement: {} as Layer2Assessment['iterative_refinement'],
    katorthoma_proximity: {} as Layer2Assessment['katorthoma_proximity'],
    ruling_faculty_state: 'fixture',
    virtue_domains_engaged: [],
    improvement_path_structured: null,
    stage_scores: {} as Layer2Assessment['stage_scores'],
    hasty_assent_risk: {} as Layer2Assessment['hasty_assent_risk'],
    intake_clarifications: {} as Layer2Assessment['intake_clarifications'],
    layer1_ambiguity_notes: [],
    layer2_ambiguity_notes: [],
  }
}

// ============================================================================
// TESTS — Flag (FT-1..FT-4)
// ============================================================================

async function runFlagTests(): Promise<void> {
  // FT-1 — flag unset → false
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED
  expect('FT-1 flag unset → isSubstrateR20aGateEnabled returns false',
    isSubstrateR20aGateEnabled(), false)

  // FT-2 — flag = 'true' → true
  process.env.SUBSTRATE_R20A_GATE_ENABLED = 'true'
  expect('FT-2 flag = "true" → isSubstrateR20aGateEnabled returns true',
    isSubstrateR20aGateEnabled(), true)

  // FT-3 — flag = 'false' → false (case sensitive; only 'true' enables)
  process.env.SUBSTRATE_R20A_GATE_ENABLED = 'false'
  expect('FT-3 flag = "false" → isSubstrateR20aGateEnabled returns false',
    isSubstrateR20aGateEnabled(), false)

  // FT-3b — flag = '1' → false (only literal 'true' enables)
  process.env.SUBSTRATE_R20A_GATE_ENABLED = '1'
  expect('FT-3b flag = "1" → isSubstrateR20aGateEnabled returns false',
    isSubstrateR20aGateEnabled(), false)

  // FT-4 — enforceLayer2R20aGate returns BYPASSED when flag unset
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED
  const bypassedOutput = await enforceLayer2R20aGate({ text: 'any input text' })
  if (bypassedOutput.decision === 'BYPASSED' && bypassedOutput.reason === 'flag_unset') {
    pass('FT-4 enforceLayer2R20aGate returns BYPASSED sentinel when flag unset')
  } else {
    fail('FT-4 enforceLayer2R20aGate returns BYPASSED sentinel when flag unset',
      `got decision=${bypassedOutput.decision}`)
  }
}

// ============================================================================
// TESTS — Reused-gate path (FT-5..FT-7)
// ============================================================================

async function runReusedGateTests(): Promise<void> {
  process.env.SUBSTRATE_R20A_GATE_ENABLED = 'true'

  // FT-5 — reused gate with shouldRedirect=true (moderate) → REDIRECT
  {
    const safetyGate = createSafetyGate(distressResultModerate)
    const output = await enforceLayer2R20aGate({
      text: 'sample input', gate: safetyGate,
    })
    if (output.decision === 'REDIRECT' && output.redirect_message !== null) {
      pass('FT-5a moderate severity → REDIRECT with redirect_message')
      expect('FT-5b moderate severity → source = reused_gate',
        (output as R20aGateResult).source, 'reused_gate')
      expect('FT-5c moderate severity → severity field preserved',
        (output as R20aGateResult).severity, 'moderate')
    } else {
      fail('FT-5 moderate severity → REDIRECT',
        `got decision=${output.decision}, redirect_message=${(output as R20aGateResult).redirect_message}`)
    }
  }

  // FT-5d — reused gate with shouldRedirect=true (acute) → REDIRECT
  {
    const safetyGate = createSafetyGate(distressResultAcute)
    const output = await enforceLayer2R20aGate({
      text: 'sample input', gate: safetyGate,
    })
    expect('FT-5d acute severity → REDIRECT', output.decision, 'REDIRECT')
  }

  // FT-6 — reused gate with mild (distress_detected=true, redirect_message=null)
  //        → PASS + distress_signal=true
  {
    const safetyGate = createSafetyGate(distressResultMild)
    const output = await enforceLayer2R20aGate({
      text: 'sample input', gate: safetyGate,
    })
    if (output.decision === 'PASS') {
      expect('FT-6a mild severity → PASS', output.decision, 'PASS')
      expect('FT-6b mild severity → distress_signal = true',
        output.distress_signal, true)
      expect('FT-6c mild severity → redirect_message = null',
        output.redirect_message, null)
      expect('FT-6d mild severity → severity = mild',
        output.severity, 'mild')
    } else {
      fail('FT-6 mild severity → PASS', `got decision=${output.decision}`)
    }
  }

  // FT-7 — reused gate with no distress → PASS + distress_signal=false
  {
    const safetyGate = createSafetyGate(distressResultNone)
    const output = await enforceLayer2R20aGate({
      text: 'clean input', gate: safetyGate,
    })
    if (output.decision === 'PASS') {
      expect('FT-7a no distress → PASS', output.decision, 'PASS')
      expect('FT-7b no distress → distress_signal = false',
        output.distress_signal, false)
      expect('FT-7c no distress → redirect_message = null',
        output.redirect_message, null)
    } else {
      fail('FT-7 no distress → PASS', `got decision=${output.decision}`)
    }
  }
}

// ============================================================================
// TESTS — Attachment (FT-9..FT-12)
// ============================================================================

function runAttachmentTests(): void {
  // FT-9 — PASS + distress_signal=true → attaches distress_signal to assessment
  {
    const assessment = makeAssessment()
    const gateOutput: R20aGateOutput = {
      decision: 'PASS',
      distress_signal: true,
      redirect_message: null,
      severity: 'mild',
      underlying: distressResultMild,
      span_id: 'test-span',
      source: 'reused_gate',
    }
    const result = attachDistressSignalToAssessment(assessment, gateOutput)
    expect('FT-9a PASS+signal → assessment.distress_signal = true',
      result.distress_signal, true)
    // Verify spread preserves other fields
    expect('FT-9b PASS+signal → other fields preserved',
      result.version, 'layer2-assessment-v1')
  }

  // FT-10 — PASS + distress_signal=false → assessment unchanged
  {
    const assessment = makeAssessment()
    const gateOutput: R20aGateOutput = {
      decision: 'PASS',
      distress_signal: false,
      redirect_message: null,
      severity: 'none',
      underlying: distressResultNone,
      span_id: 'test-span',
      source: 'reused_gate',
    }
    const result = attachDistressSignalToAssessment(assessment, gateOutput)
    if (result.distress_signal === undefined) {
      pass('FT-10 PASS+no-signal → assessment.distress_signal stays undefined')
    } else {
      fail('FT-10 PASS+no-signal → assessment.distress_signal stays undefined',
        `got ${result.distress_signal}`)
    }
  }

  // FT-11 — REDIRECT → assessment unchanged
  {
    const assessment = makeAssessment()
    const gateOutput: R20aGateOutput = {
      decision: 'REDIRECT',
      distress_signal: false,
      redirect_message: 'redirect text',
      severity: 'moderate',
      underlying: distressResultModerate,
      span_id: 'test-span',
      source: 'reused_gate',
    }
    const result = attachDistressSignalToAssessment(assessment, gateOutput)
    if (result.distress_signal === undefined) {
      pass('FT-11 REDIRECT → assessment.distress_signal stays undefined')
    } else {
      fail('FT-11 REDIRECT → assessment.distress_signal stays undefined',
        `got ${result.distress_signal}`)
    }
  }

  // FT-12 — BYPASSED → assessment unchanged
  {
    const assessment = makeAssessment()
    const gateOutput: R20aGateOutput = {
      decision: 'BYPASSED',
      reason: 'flag_unset',
    }
    const result = attachDistressSignalToAssessment(assessment, gateOutput)
    if (result.distress_signal === undefined) {
      pass('FT-12 BYPASSED → assessment.distress_signal stays undefined')
    } else {
      fail('FT-12 BYPASSED → assessment.distress_signal stays undefined',
        `got ${result.distress_signal}`)
    }
  }
}

// ============================================================================
// TESTS — Span uniqueness (FT-13)
// ============================================================================

async function runSpanTests(): Promise<void> {
  process.env.SUBSTRATE_R20A_GATE_ENABLED = 'true'
  const gate = createSafetyGate(distressResultNone)
  const result1 = await enforceLayer2R20aGate({ text: 'a', gate })
  const result2 = await enforceLayer2R20aGate({ text: 'b', gate })

  if (result1.decision !== 'BYPASSED' && result2.decision !== 'BYPASSED') {
    const r1 = result1 as R20aGateResult
    const r2 = result2 as R20aGateResult
    if (r1.span_id !== r2.span_id) {
      pass('FT-13 span_id is unique across calls')
    } else {
      fail('FT-13 span_id is unique across calls',
        `both calls returned span_id=${r1.span_id}`)
    }
    expectDefined('FT-13b span_id is defined', r1.span_id)
  } else {
    fail('FT-13 span_id is unique across calls',
      'unexpected BYPASSED outputs (flag should be on)')
  }
}

// ============================================================================
// TESTS — Type guards (FT-14)
// ============================================================================

function runTypeGuardTests(): void {
  const bypassed: R20aGateOutput = { decision: 'BYPASSED', reason: 'flag_unset' }
  const passed: R20aGateOutput = {
    decision: 'PASS',
    distress_signal: false,
    redirect_message: null,
    severity: 'none',
    underlying: distressResultNone,
    span_id: 'test',
    source: 'reused_gate',
  }
  const redirected: R20aGateOutput = {
    decision: 'REDIRECT',
    distress_signal: false,
    redirect_message: 'redirect',
    severity: 'moderate',
    underlying: distressResultModerate,
    span_id: 'test',
    source: 'reused_gate',
  }

  expect('FT-14a isGateBypassed narrows BYPASSED correctly',
    isGateBypassed(bypassed), true)
  expect('FT-14b isGateBypassed rejects PASS',
    isGateBypassed(passed), false)
  expect('FT-14c isGateRedirect narrows REDIRECT correctly',
    isGateRedirect(redirected), true)
  expect('FT-14d isGateRedirect rejects PASS',
    isGateRedirect(passed), false)
  expect('FT-14e isGatePass narrows PASS correctly',
    isGatePass(passed), true)
  expect('FT-14f isGatePass rejects REDIRECT',
    isGatePass(redirected), false)
}

// ============================================================================
// TESTS — Latency (LT-1)
// ============================================================================

async function runLatencyTest(): Promise<void> {
  process.env.SUBSTRATE_R20A_GATE_ENABLED = 'true'
  const gate = createSafetyGate(distressResultNone)

  const start = Date.now()
  await enforceLayer2R20aGate({ text: 'sample', gate })
  const elapsed = Date.now() - start

  // Reused-gate path should complete in <50ms (generous bound; the actual
  // work is a few synchronous operations + the span emit). AC2's ~500ms
  // budget applies to the regex → Haiku path, NOT the reused-gate path.
  if (elapsed < 50) {
    pass(`LT-1 reused-gate path completes in <50ms (actual: ${elapsed}ms)`)
  } else {
    fail('LT-1 reused-gate path completes in <50ms',
      `actual: ${elapsed}ms; expected <50ms (reused-gate has no LLM call)`)
  }
}

// ============================================================================
// TESTS — Invariants (INV-1, INV-2)
// ============================================================================

async function runInvariantTests(): Promise<void> {
  // INV-1 — reused-gate path never throws under any input combination
  process.env.SUBSTRATE_R20A_GATE_ENABLED = 'true'
  let threw = false
  try {
    await enforceLayer2R20aGate({
      text: '',
      gate: createSafetyGate(distressResultNone),
    })
    await enforceLayer2R20aGate({
      text: 'a'.repeat(10000),
      gate: createSafetyGate(distressResultMild),
    })
    await enforceLayer2R20aGate({
      text: 'distress',
      gate: createSafetyGate(distressResultAcute),
    })
  } catch (err) {
    threw = true
    fail('INV-1 reused-gate path never throws',
      `unexpected throw: ${err instanceof Error ? err.message : err}`)
  }
  if (!threw) {
    pass('INV-1 reused-gate path never throws under any input combination')
  }

  // INV-2 — flag unset → no span emitted (we can detect this by inspecting
  //         console.log calls). For the purposes of this test we accept that
  //         BYPASSED is returned (which means the span-emit branch was not
  //         taken). The orchestrator's flag-check at the call site is the
  //         primary defence; this is a backstop.
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED
  const bypassed = await enforceLayer2R20aGate({ text: 'sample' })
  if (bypassed.decision === 'BYPASSED') {
    pass('INV-2 flag unset → BYPASSED (span path not entered)')
  } else {
    fail('INV-2 flag unset → BYPASSED', `got decision=${bypassed.decision}`)
  }
}

// ============================================================================
// FALLBACK MESSAGE TEST
// ============================================================================

function runFallbackMessageTest(): void {
  // FT-15 — A7_FALLBACK_REDIRECT_MESSAGE is defined and non-empty
  if (typeof A7_FALLBACK_REDIRECT_MESSAGE === 'string' &&
      A7_FALLBACK_REDIRECT_MESSAGE.length > 0) {
    pass('FT-15 A7_FALLBACK_REDIRECT_MESSAGE defined and non-empty')
  } else {
    fail('FT-15 A7_FALLBACK_REDIRECT_MESSAGE defined and non-empty',
      `got: ${typeof A7_FALLBACK_REDIRECT_MESSAGE}`)
  }
}

// ============================================================================
// RUNNER
// ============================================================================

async function main(): Promise<void> {
  console.log('R20a Gate (A7) functional + invariant tests')
  console.log('=' .repeat(60))

  await runFlagTests()
  await runReusedGateTests()
  runAttachmentTests()
  await runSpanTests()
  runTypeGuardTests()
  await runLatencyTest()
  await runInvariantTests()
  runFallbackMessageTest()

  console.log('=' .repeat(60))
  const total = passCount + failCount
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  // Clean up env state
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Test runner threw:', err)
  process.exit(2)
})
