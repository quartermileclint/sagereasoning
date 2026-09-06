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
// Group 2 (2026-09-05, Session 3B): the shared brace-matched structural-end
// helpers for the execution-order pins (memory guard-scope-must-cover-the-class).
import {
  loadCodeOnly,
  structuralBlock,
  codeIndex,
  codeIndexAfter,
  codeCount,
  readTextLimitsFromSource,
  QUOTED,
  BARE_LENGTH_GUARD_RE,
  VALIDATE_TEXT_LENGTH_CALL_RE,
  POST_HANDLER_RE,
} from '@/lib/__tests__/r20a-ordering-pin-helpers'

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
// EXECUTION-ORDER PINS (Group 2, 2026-09-05, Session 3B, audit §6 item 6)
// ============================================================================
//
// The `reflection_text` MAXIMUM guard (TEXT_LIMITS.medium) was MOVED after
// the distress check under the 2026-09-06 ruling. On this route the check
// lives INSIDE `if (reflection_text !== '__local__') { … }` (the local-storage
// sentinel skip), so the structural anchor is THAT enclosing block's
// brace-matched END — the block the check lives in, per the remediation
// prompt's constraint 8 — not merely the inner redirect `if`.
//
// MUTATION RECORD (2026-09-05, real file, hash-verified restore): the maximum
// placed BEFORE the sentinel block → MAX-1 fails; placed INSIDE it between
// the check and the redirect return → MAX-1 fails; deleted → MAX-3 fails; the
// cap removed (`detectDistressTwoStage(reflection_text)`) → CAP-1 fails.

function runOrderingPins(): void {
  const code = loadCodeOnly(ROUTE_PATH)
  const LIMITS = readTextLimitsFromSource()

  const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
  const SENTINEL_BLOCK_RE = new RegExp(`if\\s*\\(\\s*reflection_text\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
  const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
  const MAX_RE = new RegExp(`validateTextLength\\(\\s*reflection_text\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
  // PR19 fold 2026-09-06: String() coercion BEFORE the slice so an array
  // cannot bypass the bound (a typeof-ternary first cut let it through).
  const CAP_RE = /const\s+screenedReflectionText\s*=\s*String\(\s*reflection_text\s*\)\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
  const SUBJECT_RE = /detectDistressTwoStage\s*\(\s*screenedReflectionText\s*\)/
  const RAW_SUBJECT_RE = /detectDistressTwoStage\s*\(\s*reflection_text\s*\)/
  const STORE_RE = /createClient\s*\(\s*supabaseUrl\s*,\s*supabaseServiceKey\s*\)/

  const checkIdx = codeIndex(code, CHECK_RE)
  const sentinelBlock = structuralBlock(code, SENTINEL_BLOCK_RE)
  const redirectBlock = structuralBlock(code, REDIRECT_OPEN_RE)
  const maxIdx = codeIndex(code, MAX_RE)
  const capIdx = codeIndex(code, CAP_RE)
  const storeIdx = codeIndexAfter(code, STORE_RE, checkIdx)

  expectTrue(
    'MAX-1 the reflection_text MAXIMUM guard follows the structural END of the enclosing sentinel block ' +
      '(which contains the check AND its redirect return; anchored on that block\'s own closing brace, so ' +
      'drift to anywhere inside it — before OR after the check — is caught)',
    maxIdx > -1 && sentinelBlock.endIdx > -1 && maxIdx > sentinelBlock.endIdx,
    `max=${maxIdx} sentinelEnd=${sentinelBlock.endIdx}`,
  )
  expectTrue(
    'MAX-2 the maximum still precedes the first store touch (order, not existence)',
    maxIdx > -1 && storeIdx > -1 && maxIdx < storeIdx,
    `max=${maxIdx} store=${storeIdx}`,
  )
  expectTrue(
    'MAX-3 non-vacuity: the maximum appears exactly once; the sentinel block and the redirect block were each found exactly once, are non-degenerate, and nest correctly around the check',
    codeCount(code, MAX_RE) === 1 && sentinelBlock.matches === 1 && redirectBlock.matches === 1 &&
      sentinelBlock.openIdx > -1 && sentinelBlock.endIdx > sentinelBlock.openIdx &&
      checkIdx > sentinelBlock.openIdx && checkIdx < sentinelBlock.endIdx &&
      redirectBlock.openIdx > checkIdx && redirectBlock.endIdx < sentinelBlock.endIdx,
    `maxCount=${codeCount(code, MAX_RE)} sentinel=${sentinelBlock.openIdx}..${sentinelBlock.endIdx} (${sentinelBlock.matches}) redirect=${redirectBlock.openIdx}..${redirectBlock.endIdx} (${redirectBlock.matches}) check=${checkIdx}`,
  )
  expectTrue(
    'CAP-1 the classifier receives the screened local (String(reflection_text) sliced at TEXT_LIMITS.medium — coercion before the slice, so every value is bounded) — defined inside the sentinel block, before the check — and never the raw field',
    codeCount(code, CAP_RE) === 1 && capIdx > sentinelBlock.openIdx && capIdx < checkIdx &&
      codeCount(code, SUBJECT_RE) === 1 && codeCount(code, RAW_SUBJECT_RE) === 0,
    `cap=${capIdx} sentinelOpen=${sentinelBlock.openIdx} check=${checkIdx} subject=${codeCount(code, SUBJECT_RE)} raw=${codeCount(code, RAW_SUBJECT_RE)}`,
  )
  expectTrue(
    'CAP-2 the cap key (TEXT_LIMITS.medium) is the SAME key the moved guard enforces (the cap equals the bound)',
    MAX_RE.test(code) && CAP_RE.test(code),
  )
  {
    const postIdx = codeIndex(code, POST_HANDLER_RE)
    const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
    expectTrue(
      'NEG-1 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check (PR19 fold 2026-09-06 — the class fence)',
      postIdx > -1 && checkIdx > postIdx &&
        codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
      `post=${postIdx} check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
    )
  }
  expectTrue(
    'CAP-3 TEXT_LIMITS.medium is the audit\'s M bound (5,000) as read from security.ts source',
    LIMITS.medium === 5000,
    `medium=${LIMITS.medium}`,
  )

  // DAY-* / NEG-2 — Session 3C (Group 2b, 2026-09-06): the combined
  // `!day_number || !reflection_text` presence check was SPLIT — the
  // `reflection_text` half stays (the screened text itself), the
  // `day_number` half and the 1–56 RANGE 400 (audit §4.4 P′ and O; mentor
  // Part 5) moved after the sentinel block's END.
  {
    const TEXT_PRESENCE_RE = /if\s*\(\s*!reflection_text\s*\)\s*\{/
    const OLD_FUSED_RE = /!day_number\s*\|\|\s*!reflection_text/
    const DAY_PRESENCE_RE = /if\s*\(\s*!day_number\s*\)\s*\{/
    const DAY_RANGE_RE = /if\s*\(\s*day_number\s*<\s*1\s*\|\|\s*day_number\s*>\s*56\s*\)\s*\{/
    const textPresenceIdx = codeIndex(code, TEXT_PRESENCE_RE)
    const dayPresenceIdx = codeIndex(code, DAY_PRESENCE_RE)
    const dayRangeIdx = codeIndex(code, DAY_RANGE_RE)
    expectTrue(
      'DAY-1 the day_number PRESENCE half and the 1–56 RANGE 400 both follow the structural END of the enclosing sentinel block (which contains the check AND its redirect return), keep their order (presence then range), and follow the moved maximum',
      dayPresenceIdx > -1 && dayRangeIdx > -1 && sentinelBlock.endIdx > -1 &&
        dayPresenceIdx > sentinelBlock.endIdx && dayRangeIdx > dayPresenceIdx && dayPresenceIdx > maxIdx,
      `dayPresence=${dayPresenceIdx} dayRange=${dayRangeIdx} sentinelEnd=${sentinelBlock.endIdx} max=${maxIdx}`,
    )
    expectTrue(
      'DAY-2 both still precede the first store touch (order, not existence)',
      dayRangeIdx > -1 && storeIdx > -1 && dayRangeIdx < storeIdx,
      `dayRange=${dayRangeIdx} store=${storeIdx}`,
    )
    expectTrue(
      'DAY-3 non-vacuity: the reflection_text presence half exists exactly once BEFORE the check; the day_number presence half and the range check each exactly once; the old fused form is gone',
      codeCount(code, TEXT_PRESENCE_RE) === 1 && textPresenceIdx > -1 && textPresenceIdx < checkIdx &&
        codeCount(code, DAY_PRESENCE_RE) === 1 && codeCount(code, DAY_RANGE_RE) === 1 && codeCount(code, OLD_FUSED_RE) === 0,
      `textPresence=${codeCount(code, TEXT_PRESENCE_RE)}@${textPresenceIdx} check=${checkIdx} dayPresence=${codeCount(code, DAY_PRESENCE_RE)} range=${codeCount(code, DAY_RANGE_RE)} fused=${codeCount(code, OLD_FUSED_RE)}`,
    )
    const postIdx = codeIndex(code, POST_HANDLER_RE)
    const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
    expectTrue(
      'NEG-2 neither moved day_number 400 occurs before the distress check in any form (the range literal, the `!day_number` presence token and any `day_number <`/`>` comparison are all absent from the pre-check span)',
      postIdx > -1 && checkIdx > postIdx && !preSpan.includes('day_number must be between') &&
        codeCount(preSpan, /!day_number\b/) === 0 && codeCount(preSpan, /day_number\s*[<>]/) === 0,
      `literal=${preSpan.includes('day_number must be between')} presence=${codeCount(preSpan, /!day_number\b/)} cmp=${codeCount(preSpan, /day_number\s*[<>]/)}`,
    )
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('--- r20a-invocation.test.ts (journal route-level R20a catch) ---')

  runInvocationTests()
  runVerdictTests()
  runOrderingPins()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main()
