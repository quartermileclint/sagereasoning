/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the
 * Reflect-content R20a substrate-gate catch (Option A build arc, Session 3,
 * 2026-05-28).
 *
 * Run via: npx tsx src/app/api/practice/reflect/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors session 2's Calling test
 * at src/app/api/calling/__tests__/r20a-invocation.test.ts per PR15 (reuse
 * the pattern). EXIT 0 on all pass; EXIT 1 on any fail.
 *
 * COVERAGE
 *
 * Invocation tests (INV-1..INV-6) — file-grep over the route source:
 *   - INV-0: route.ts exists
 *   - INV-1: route.ts imports enforceLayer2R20aGate from substrate/r20a-gate
 *   - INV-2: route.ts imports isReflectR20aEnabled from substrate/r20a-gate
 *   - INV-3: route.ts imports buildReflectDistressRedirectResponse
 *   - INV-4: route.ts body contains `await enforceLayer2R20aGate(` (PR3 awaited)
 *   - INV-5: route.ts body contains `isReflectR20aEnabled()` (flag check called)
 *   - INV-6: route.ts imports checkZone3Boundary from sage-reflect/zone3-boundary
 *
 * Verdict-handling tests (VH-1..VH-4) — exercise enforceLayer2R20aGate's
 * verdict-mapping logic via reused-gate (no live Haiku call; consistent
 * with A7's r20a-gate.test.ts mocking posture):
 *   - VH-1: Reflect's posture (overrideFlag=true) + moderate reused-gate → REDIRECT
 *   - VH-2: Reflect's posture + mild reused-gate → PASS + distress_signal=true
 *   - VH-3: Reflect's posture + no-distress reused-gate → PASS + distress_signal=false
 *   - VH-4: Reflect's posture + acute reused-gate (C2 fixture-like) → REDIRECT
 *
 * Flag tests (FT-1..FT-4) — verify isReflectR20aEnabled semantics:
 *   - FT-1: SUBSTRATE_REFLECT_R20A_ENABLED unset → false
 *   - FT-2: SUBSTRATE_REFLECT_R20A_ENABLED = 'true' → true
 *   - FT-3: SUBSTRATE_REFLECT_R20A_ENABLED = 'false' → false
 *   - FT-4: SUBSTRATE_REFLECT_R20A_ENABLED = '1' → false (case-strict)
 *
 * Decoupling tests (DC-1..DC-2) — verify overrideFlag decouples Reflect
 * from A7's flag per design spec §5.6:
 *   - DC-1: overrideFlag=true + A7 flag UNSET → catch runs (not BYPASSED)
 *   - DC-2: overrideFlag absent + A7 flag UNSET → BYPASSED (existing behaviour)
 *
 * Response-builder tests (RB-1..RB-4) — verify the developer-form payload
 * + safety_signal propagation across the four in-flow builders Reflect
 * uses (the complete builder is verified structurally by tsc; the
 * runtime test covers question, fabrication, supporting + the new
 * redirect builder):
 *   - RB-1: buildReflectDistressRedirectResponse emits the §3.1 shape
 *   - RB-2: buildQuestionResponse WITHOUT safetySignal → no safety_signal field
 *   - RB-3: buildQuestionResponse WITH safetySignal → safety_signal field present
 *   - RB-4: buildFabricationTestResponse + buildSupportingQuestionResponse
 *           with safetySignal carry the field; without it omit it
 *
 * Reflect-specific tests (RS-1..RS-2) — the order assertion that the
 * existing Zone-3 boundary check runs FIRST and the new content-based
 * catch runs SECOND (only if Zone-3 does not engage). This is the
 * design tension noted in CCP item 2(e) and approved as Option (ii) at
 * item (vi). Protects the additive posture from regression.
 *   - RS-1: route.ts body shows checkZone3Boundary call ABOVE enforceLayer2R20aGate
 *           call (text-order assertion on the body)
 *   - RS-2: checkZone3Boundary verdict — developer-declared harm engages WITHOUT
 *           any call into the substrate gate (pure-sync function; no classifier)
 *
 * NOT COVERED HERE (deferred to live exercise / later session):
 *   - End-to-end HTTP test against the actual handler (requires Supabase env
 *     per CLAUDE.md's session-store transitive-import rule). The invocation
 *     tests + verdict-handling tests + response-builder tests + RS-* order
 *     tests together cover the wiring + verdict logic + emission. End-to-end
 *     coverage comes via the C2 live run (post-Option-A) under the existing
 *     whole-system-harness pattern.
 *   - The fresh-classifier-call path (live Haiku). Covered by the C2 live
 *     run and r20a-classifier-eval.ts.
 *   - buildCompleteResponse runtime fixture (the complete decision has a
 *     deep nested ReflectOutcome + SageAssentFeedResult; structural
 *     correctness of the additive safetySignal? parameter is verified by
 *     npx tsc --noEmit at Step 5).
 *
 * Rules served: R20a (vulnerable user detection); AC4 (invocation testing);
 * AC5 (tenth-route protocol); PR1 (single-endpoint proof on Reflect-content);
 * PR3 (synchronous safety); PR15 (mirrors S2 Calling test pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

import { createSafetyGate } from '@/lib/constraints'
import type { DistressDetectionResult } from '@/lib/guardrails'

import {
  enforceLayer2R20aGate,
  isReflectR20aEnabled,
  isSubstrateR20aGateEnabled,
  type R20aGateResult,
  type SafetySignal,
} from '@/lib/substrate/r20a-gate'

import { checkZone3Boundary } from '@/lib/sage-reflect/zone3-boundary'

import {
  buildReflectDistressRedirectResponse,
  buildQuestionResponse,
  buildFabricationTestResponse,
  buildSupportingQuestionResponse,
} from '../response-builders'

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

function expectEq<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    pass(name)
  } else {
    fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) {
    pass(name)
  } else {
    fail(name, hint ?? 'condition was false')
  }
}

// ============================================================================
// ROUTE SOURCE — read once for the INV-* and RS-* tests
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')

function loadRouteSource(): { source: string; bodyOnly: string } {
  const source = fs.readFileSync(ROUTE_PATH, 'utf-8')
  const bodyOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')
  return { source, bodyOnly }
}

// ============================================================================
// INVOCATION TESTS — INV-0..INV-6
// ============================================================================

function runInvocationTests(): void {
  expectTrue('INV-0 route.ts exists at ' + ROUTE_PATH, fs.existsSync(ROUTE_PATH))

  const { source, bodyOnly } = loadRouteSource()

  // INV-1: imports enforceLayer2R20aGate from substrate/r20a-gate
  expectTrue(
    'INV-1 route.ts imports enforceLayer2R20aGate from substrate/r20a-gate',
    source.includes('enforceLayer2R20aGate') && source.includes('substrate/r20a-gate'),
  )

  // INV-2: imports isReflectR20aEnabled from substrate/r20a-gate
  expectTrue(
    'INV-2 route.ts imports isReflectR20aEnabled from substrate/r20a-gate',
    source.includes('isReflectR20aEnabled') && source.includes('substrate/r20a-gate'),
  )

  // INV-3: imports buildReflectDistressRedirectResponse from response-builders
  expectTrue(
    'INV-3 route.ts imports buildReflectDistressRedirectResponse',
    source.includes('buildReflectDistressRedirectResponse'),
  )

  // INV-4: body contains `await enforceLayer2R20aGate(` (PR3 — awaited, not fire-and-forget)
  expectTrue(
    'INV-4 route.ts body awaits enforceLayer2R20aGate (PR3 — synchronous safety)',
    /await\s+enforceLayer2R20aGate\s*\(/.test(bodyOnly),
  )

  // INV-5: body contains `isReflectR20aEnabled()` (flag check is CALLED, not just imported)
  expectTrue(
    'INV-5 route.ts body calls isReflectR20aEnabled() (flag check, not just import)',
    /isReflectR20aEnabled\s*\(\s*\)/.test(bodyOnly),
  )

  // INV-6: imports checkZone3Boundary from sage-reflect/zone3-boundary (Option (ii) — closes
  // the today's silent gap where developer-supplied safety_signal on answer turns is dropped)
  expectTrue(
    'INV-6 route.ts imports checkZone3Boundary from sage-reflect/zone3-boundary',
    source.includes('checkZone3Boundary') && source.includes('sage-reflect/zone3-boundary'),
  )
}

// ============================================================================
// FIXTURES — distress results for the reused-gate verdict tests
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
  redirect_message: null, // mild does NOT trigger redirect
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

// ============================================================================
// VERDICT-HANDLING TESTS — VH-1..VH-4
// ============================================================================

async function runVerdictHandlingTests(): Promise<void> {
  // Reflect-content always passes overrideFlag:true (independent of A7's flag,
  // per design spec §5.6). Unset A7's flag to assert decoupling holds.
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED

  // VH-1 — moderate → REDIRECT
  {
    const gate = createSafetyGate(distressResultModerate)
    const out = await enforceLayer2R20aGate({
      text: 'sample reflection response',
      gate,
      overrideFlag: true,
    })
    if (out.decision === 'REDIRECT') {
      pass('VH-1a moderate reused-gate → decision=REDIRECT')
      expectEq('VH-1b moderate reused-gate → severity preserved',
        (out as R20aGateResult).severity, 'moderate')
      expectTrue('VH-1c moderate reused-gate → redirect_message non-null',
        (out as R20aGateResult).redirect_message !== null)
    } else {
      fail('VH-1 moderate reused-gate → REDIRECT', `got decision=${out.decision}`)
    }
  }

  // VH-2 — mild → PASS + distress_signal=true
  {
    const gate = createSafetyGate(distressResultMild)
    const out = await enforceLayer2R20aGate({
      text: 'mild reflection response',
      gate,
      overrideFlag: true,
    })
    if (out.decision === 'PASS') {
      pass('VH-2a mild reused-gate → decision=PASS')
      expectEq('VH-2b mild reused-gate → distress_signal=true',
        (out as R20aGateResult).distress_signal, true)
      expectEq('VH-2c mild reused-gate → severity preserved',
        (out as R20aGateResult).severity, 'mild')
    } else {
      fail('VH-2 mild reused-gate → PASS', `got decision=${out.decision}`)
    }
  }

  // VH-3 — no distress → PASS + distress_signal=false
  {
    const gate = createSafetyGate(distressResultNone)
    const out = await enforceLayer2R20aGate({
      text: 'neutral reflection response',
      gate,
      overrideFlag: true,
    })
    if (out.decision === 'PASS') {
      pass('VH-3a neutral reused-gate → decision=PASS')
      expectEq('VH-3b neutral reused-gate → distress_signal=false',
        (out as R20aGateResult).distress_signal, false)
    } else {
      fail('VH-3 neutral reused-gate → PASS', `got decision=${out.decision}`)
    }
  }

  // VH-4 — acute (C2-fixture-like severity) → REDIRECT
  {
    const gate = createSafetyGate(distressResultAcute)
    const out = await enforceLayer2R20aGate({
      text:
        "I don't think I can keep going much longer. Reflecting on this just " +
        'makes it worse.',
      gate,
      overrideFlag: true,
    })
    if (out.decision === 'REDIRECT') {
      pass('VH-4a acute reused-gate (C2-fixture-like) → decision=REDIRECT')
      expectEq('VH-4b acute reused-gate → severity=acute',
        (out as R20aGateResult).severity, 'acute')
    } else {
      fail('VH-4 acute reused-gate → REDIRECT', `got decision=${out.decision}`)
    }
  }
}

// ============================================================================
// FLAG TESTS — FT-1..FT-4 (isReflectR20aEnabled)
// ============================================================================

function runFlagTests(): void {
  // FT-1 — unset → false
  delete process.env.SUBSTRATE_REFLECT_R20A_ENABLED
  expectEq('FT-1 SUBSTRATE_REFLECT_R20A_ENABLED unset → isReflectR20aEnabled=false',
    isReflectR20aEnabled(), false)

  // FT-2 — 'true' → true
  process.env.SUBSTRATE_REFLECT_R20A_ENABLED = 'true'
  expectEq('FT-2 SUBSTRATE_REFLECT_R20A_ENABLED = "true" → isReflectR20aEnabled=true',
    isReflectR20aEnabled(), true)

  // FT-3 — 'false' → false
  process.env.SUBSTRATE_REFLECT_R20A_ENABLED = 'false'
  expectEq('FT-3 SUBSTRATE_REFLECT_R20A_ENABLED = "false" → isReflectR20aEnabled=false',
    isReflectR20aEnabled(), false)

  // FT-4 — '1' → false (case-strict; only literal 'true' enables)
  process.env.SUBSTRATE_REFLECT_R20A_ENABLED = '1'
  expectEq('FT-4 SUBSTRATE_REFLECT_R20A_ENABLED = "1" → isReflectR20aEnabled=false',
    isReflectR20aEnabled(), false)

  // Cleanup
  delete process.env.SUBSTRATE_REFLECT_R20A_ENABLED
}

// ============================================================================
// DECOUPLING TESTS — DC-1..DC-2
// ============================================================================

async function runDecouplingTests(): Promise<void> {
  // DC-1: A7 flag UNSET + overrideFlag=true → catch RUNS (not BYPASSED). This
  // is the Reflect-content case — Reflect has its own flag check and uses
  // overrideFlag to keep the activations decoupled per design §5.6.
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED
  expectEq('DC-1a A7 flag UNSET sanity → isSubstrateR20aGateEnabled=false',
    isSubstrateR20aGateEnabled(), false)
  {
    const gate = createSafetyGate(distressResultModerate)
    const out = await enforceLayer2R20aGate({
      text: 'x', gate, overrideFlag: true,
    })
    expectTrue('DC-1b A7 flag UNSET + overrideFlag=true → decision NOT BYPASSED',
      out.decision !== 'BYPASSED',
      `got decision=${out.decision}`)
  }

  // DC-2: A7 flag UNSET + overrideFlag absent (default false) → BYPASSED
  // (preserves existing parallel-run.ts behaviour).
  {
    const gate = createSafetyGate(distressResultModerate)
    const out = await enforceLayer2R20aGate({ text: 'x', gate })
    expectEq('DC-2 A7 flag UNSET + overrideFlag absent → decision=BYPASSED',
      out.decision, 'BYPASSED')
  }
}

// ============================================================================
// RESPONSE-BUILDER TESTS — RB-1..RB-4
// ============================================================================

async function runResponseBuilderTests(): Promise<void> {
  const sampleSafetySignal: SafetySignal = {
    flow_terminated: true,
    cause: 'distress',
    severity: 'acute',
    caught_at: 'substrate_layer2',
  }

  // RB-1: buildReflectDistressRedirectResponse emits the §3.1 developer-form shape
  {
    const res = buildReflectDistressRedirectResponse(
      'sess-test-001',
      'acute',
      'crisis pass-through message',
      sampleSafetySignal,
    )
    expectEq('RB-1a redirect response → HTTP 200', res.status, 200)
    const body = (await res.json()) as Record<string, unknown>
    expectEq('RB-1b redirect body → status="redirected"', body.status, 'redirected')
    expectEq('RB-1c redirect body → session_id preserved', body.session_id, 'sess-test-001')
    expectEq('RB-1d redirect body → distress_detected=true', body.distress_detected, true)
    expectEq('RB-1e redirect body → severity="acute"', body.severity, 'acute')
    expectTrue('RB-1f redirect body → developer_note present',
      typeof body.developer_note === 'string' && (body.developer_note as string).length > 0)
    expectEq('RB-1g redirect body → suggested_user_message preserved',
      body.suggested_user_message, 'crisis pass-through message')
    expectEq('RB-1h redirect body → flow_terminated=true', body.flow_terminated, true)
    const sig = body.safety_signal as SafetySignal
    expectEq('RB-1i redirect body → safety_signal.flow_terminated=true', sig.flow_terminated, true)
    expectEq('RB-1j redirect body → safety_signal.cause="distress"', sig.cause, 'distress')
    expectEq('RB-1k redirect body → safety_signal.severity="acute"', sig.severity, 'acute')
    expectEq('RB-1l redirect body → safety_signal.caught_at="substrate_layer2"',
      sig.caught_at, 'substrate_layer2')
  }

  // RB-2: buildQuestionResponse WITHOUT safetySignal → no safety_signal field
  {
    const res = buildQuestionResponse(
      'sess-rb-002', 'Q3', 'What was your reasoning?', [], [],
    )
    const body = (await res.json()) as Record<string, unknown>
    expectEq('RB-2a in-progress body → status="in_progress"', body.status, 'in_progress')
    expectTrue('RB-2b in-progress body → NO safety_signal field (additive only)',
      body.safety_signal === undefined)
  }

  // RB-3: buildQuestionResponse WITH safetySignal → safety_signal field present
  {
    const mildSig: SafetySignal = {
      flow_terminated: false,
      cause: 'distress',
      severity: 'mild',
      caught_at: 'substrate_layer2',
    }
    const res = buildQuestionResponse(
      'sess-rb-003', 'Q3', 'What was your reasoning?', [], [], undefined, mildSig,
    )
    const body = (await res.json()) as Record<string, unknown>
    expectEq('RB-3a in-progress body (with mild signal) → status="in_progress"',
      body.status, 'in_progress')
    const sig = body.safety_signal as SafetySignal
    expectEq('RB-3b in-progress body → safety_signal.flow_terminated=false',
      sig.flow_terminated, false)
    expectEq('RB-3c in-progress body → safety_signal.severity="mild"',
      sig.severity, 'mild')
  }

  // RB-4: buildFabricationTestResponse + buildSupportingQuestionResponse carry
  // the mild signal additively; absent without it
  {
    const mildSig: SafetySignal = {
      flow_terminated: false,
      cause: 'distress',
      severity: 'mild',
      caught_at: 'substrate_layer2',
    }
    // Fabrication test — with signal
    const fab = buildFabricationTestResponse('sess-rb-004', 'Did this actually happen?', undefined, mildSig)
    const fabBody = (await fab.json()) as Record<string, unknown>
    expectEq('RB-4a fabrication body → step="verification"', fabBody.step, 'verification')
    expectTrue('RB-4b fabrication body → safety_signal present', fabBody.safety_signal !== undefined)

    // Fabrication test — without signal (additive omission)
    const fab2 = buildFabricationTestResponse('sess-rb-005', 'Did this actually happen?')
    const fab2Body = (await fab2.json()) as Record<string, unknown>
    expectTrue('RB-4c fabrication body (no signal) → safety_signal absent',
      fab2Body.safety_signal === undefined)

    // Supporting question — with signal
    const sup = buildSupportingQuestionResponse('sess-rb-006', 1, 'Was your view weakly held?', undefined, mildSig)
    const supBody = (await sup.json()) as Record<string, unknown>
    expectEq('RB-4d supporting body → step="supporting"', supBody.step, 'supporting')
    expectTrue('RB-4e supporting body → safety_signal present', supBody.safety_signal !== undefined)
  }
}

// ============================================================================
// REFLECT-SPECIFIC TESTS — RS-1..RS-2
//
// The order assertion that protects Option (ii) from regression: the existing
// developer-declared Zone-3 boundary check runs FIRST at the route; the new
// content-based catch runs SECOND (only if Zone-3 does not engage).
// ============================================================================

function runReflectSpecificTests(): void {
  const { bodyOnly } = loadRouteSource()

  // RS-1: in the route body, the FIRST occurrence of `checkZone3Boundary(`
  // (the existing harm-flag mechanism, called from a NEW route-level site
  // per Option (ii)) appears BEFORE the first occurrence of
  // `await enforceLayer2R20aGate(` (the new substrate content catch).
  //
  // This protects the contract: developer-declared harm engages first;
  // substrate content classification engages only if the developer did
  // not already declare. The order matters because:
  //  (a) Zone-3 is pure-sync — no classifier call, no latency cost. Running
  //      it first lets developer-declared harm short-circuit cheaply.
  //  (b) Per the prompt's CCP item (vi) + RS-1 description: "only if Zone-3
  //      does not engage" — the substrate catch is conditional on Zone-3
  //      returning engaged === false.
  const zone3Idx = bodyOnly.search(/checkZone3Boundary\s*\(/)
  const r20aIdx = bodyOnly.search(/await\s+enforceLayer2R20aGate\s*\(/)
  expectTrue(
    'RS-1a route body contains checkZone3Boundary call',
    zone3Idx >= 0,
    `checkZone3Boundary call not found in route body`,
  )
  expectTrue(
    'RS-1b route body contains await enforceLayer2R20aGate call',
    r20aIdx >= 0,
    `await enforceLayer2R20aGate call not found in route body`,
  )
  expectTrue(
    'RS-1c checkZone3Boundary call appears BEFORE await enforceLayer2R20aGate call (Zone-3 first, content catch second per design §5.3)',
    zone3Idx >= 0 && r20aIdx >= 0 && zone3Idx < r20aIdx,
    `zone3Idx=${zone3Idx} r20aIdx=${r20aIdx} (expected zone3Idx < r20aIdx)`,
  )

  // RS-2: checkZone3Boundary engages on developer-declared harm WITHOUT any
  // call into the substrate gate. This is a property of the existing pure-sync
  // function (zone3-boundary.ts is unchanged this session). The assertion
  // documents the property at the route-level call posture.
  {
    const verdict = checkZone3Boundary({
      safety_signal: { harm_flagged: true, detail: 'test-engaged' },
      acts_blocked: undefined,
    })
    expectEq('RS-2a checkZone3Boundary(harm_flagged=true) → engaged=true',
      verdict.engaged, true)
    expectTrue('RS-2b checkZone3Boundary(harm_flagged=true) → developer_note non-null',
      verdict.developer_note !== null)
  }
  {
    const verdict = checkZone3Boundary({
      safety_signal: { harm_flagged: false },
      acts_blocked: undefined,
    })
    expectEq('RS-2c checkZone3Boundary(harm_flagged=false) → engaged=false',
      verdict.engaged, false)
    expectEq('RS-2d checkZone3Boundary(harm_flagged=false) → developer_note=null',
      verdict.developer_note, null)
  }
  {
    const verdict = checkZone3Boundary({
      safety_signal: undefined,
      acts_blocked: [{ act: 'redact-pii', reason: 'GDPR', category: 'harm' }],
    })
    expectEq('RS-2e checkZone3Boundary(acts_blocked category=harm) → engaged=true',
      verdict.engaged, true)
  }
  {
    const verdict = checkZone3Boundary({
      safety_signal: undefined,
      acts_blocked: [{ act: 'log-event', reason: 'policy', category: 'policy' }],
    })
    expectEq('RS-2f checkZone3Boundary(acts_blocked category=policy only) → engaged=false',
      verdict.engaged, false)
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- r20a-invocation.test.ts (Reflect-content R20a catch) ---')

  runInvocationTests()
  await runVerdictHandlingTests()
  runFlagTests()
  await runDecouplingTests()
  await runResponseBuilderTests()
  runReflectSpecificTests()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unhandled test error:', err)
  process.exit(1)
})
