/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the R20a
 * route-level distress catch on /api/journal (gap-#4 remediation, 2026-05-31;
 * AC5 tenth-route perimeter member).
 *
 * Run via: npx tsx src/app/api/journal/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors
 * src/app/api/calling/__tests__/r20a-invocation.test.ts (PR15 — reuse the
 * pattern). EXIT 0 on all pass; EXIT 1 on any fail.
 *
 * Route-level member (the score-route always-on pattern). Distinct wrinkle:
 * local-storage users send reflection_text === '__local__' (no real text
 * server-side), which is excluded from screening.
 *
 * COVERAGE
 *
 * Invocation tests (INV-1..INV-4) — file-grep over the route source:
 *   - INV-1: route imports detectDistressTwoStage from r20a-classifier
 *   - INV-2: route imports enforceDistressCheck from constraints
 *   - INV-3: route body awaits enforceDistressCheck(detectDistressTwoStage( (PR3)
 *   - INV-4: the '__local__' sentinel is excluded from screening
 *
 * Verdict tests (VH-1..VH-5) — exercise the route's redirect decision using
 * the real regex stage (network-free) + createSafetyGate fixtures:
 *   - VH-1: real acute input → shouldRedirect=true, severity=acute
 *   - VH-2: moderate fixture → shouldRedirect=true
 *   - VH-3: mild fixture → shouldRedirect=false (mild does NOT block the entry)
 *   - VH-4: none fixture → shouldRedirect=false
 *   - VH-5: benign real input (regex finds nothing) → distress_detected=false
 *
 * NOT COVERED HERE (deferred to the live exercise): end-to-end HTTP test
 * (requires auth + Supabase env). Covered by the optional TEST live run (PR17)
 * + r20a-classifier-eval.ts for the fresh-Haiku Stage-2 path.
 *
 * Rules served: R20a; AC4 (invocation testing); AC5 (tenth-route protocol);
 * PR3 (synchronous safety); PR15 (mirrors the calling test pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

import { createSafetyGate } from '@/lib/constraints'
import { detectDistress } from '@/lib/guardrails'
import type { DistressDetectionResult } from '@/lib/guardrails'

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
// ROUTE SOURCE — read once for the INV-* tests
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
// INVOCATION TESTS — INV-1..INV-4
// ============================================================================

function runInvocationTests(): void {
  expectTrue('INV-0 route.ts exists at ' + ROUTE_PATH, fs.existsSync(ROUTE_PATH))

  const { source, bodyOnly } = loadRouteSource()

  // INV-1: imports detectDistressTwoStage from r20a-classifier
  expectTrue(
    'INV-1 route imports detectDistressTwoStage from r20a-classifier',
    source.includes('detectDistressTwoStage') && source.includes('r20a-classifier'),
  )

  // INV-2: imports enforceDistressCheck from constraints
  expectTrue(
    'INV-2 route imports enforceDistressCheck from constraints',
    source.includes('enforceDistressCheck') && source.includes('constraints'),
  )

  // INV-3: body awaits enforceDistressCheck(detectDistressTwoStage( (PR3 — synchronous)
  expectTrue(
    'INV-3 route body awaits enforceDistressCheck(detectDistressTwoStage( (PR3)',
    /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(bodyOnly),
  )

  // INV-4: the '__local__' sentinel is excluded from screening
  expectTrue(
    'INV-4 route excludes the __local__ sentinel from screening',
    /reflection_text\s*!==\s*'__local__'/.test(bodyOnly),
  )
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
  redirect_message: null, // mild does NOT trigger redirect
}

const distressResultModerate: DistressDetectionResult = {
  distress_detected: true,
  severity: 'moderate',
  indicators_found: ['haiku_evaluator: moderate distress'],
  redirect_message: 'Before we continue, we want to make sure you are okay...',
}

// ============================================================================
// VERDICT TESTS — VH-1..VH-5
// ============================================================================

function runVerdictTests(): void {
  // VH-1 — a real acute input caught by the regex Stage 1 (network-free).
  const acute = detectDistress('I want to die')
  const acuteGate = createSafetyGate(acute)
  expectEq('VH-1a real acute input → severity=acute', acute.severity, 'acute')
  expectTrue('VH-1b real acute input → gate.shouldRedirect=true', acuteGate.shouldRedirect)

  // VH-2 — moderate fixture → redirect (entry would NOT be stored)
  expectTrue('VH-2 moderate fixture → shouldRedirect=true',
    createSafetyGate(distressResultModerate).shouldRedirect)

  // VH-3 — mild fixture → does NOT redirect (entry stores normally)
  expectEq('VH-3 mild fixture → shouldRedirect=false',
    createSafetyGate(distressResultMild).shouldRedirect, false)

  // VH-4 — none fixture → does NOT redirect
  expectEq('VH-4 none fixture → shouldRedirect=false',
    createSafetyGate(distressResultNone).shouldRedirect, false)

  // VH-5 — benign real input → regex finds nothing → no distress
  const benign = detectDistress('Day 5: I practised the morning reflection and felt steady.')
  expectEq('VH-5 benign real input → distress_detected=false', benign.distress_detected, false)
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('--- r20a-invocation.test.ts (journal route-level R20a catch) ---')

  runInvocationTests()
  runVerdictTests()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main()
