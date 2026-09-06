/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the R20a
 * route-level distress catch on /api/mentor/journal-feed (gap-#4 remediation,
 * 2026-05-31; AC5 ninth-route perimeter member).
 *
 * Run via: npx tsx src/app/api/mentor/journal-feed/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors
 * src/app/api/calling/__tests__/r20a-invocation.test.ts (PR15 — reuse the
 * pattern). EXIT 0 on all pass; EXIT 1 on any fail.
 *
 * This is a ROUTE-LEVEL member (the score-route always-on pattern:
 * `await enforceDistressCheck(detectDistressTwoStage(...))`), NOT a
 * substrate-gate member — so it has no feature flag; enforcement is always on.
 *
 * COVERAGE
 *
 * Invocation tests (INV-1..INV-4) — file-grep over the route source:
 *   - INV-1: route imports detectDistressTwoStage from r20a-classifier
 *   - INV-2: route imports enforceDistressCheck from constraints
 *   - INV-3: route body awaits enforceDistressCheck(detectDistressTwoStage( (PR3)
 *   - INV-4: the gate runs BEFORE encryptJournalProse (never screen ciphertext)
 *
 * Verdict tests (VH-1..VH-5) — exercise the route's redirect decision
 * (`if (gate.shouldRedirect)`) using the real regex stage (network-free) and
 * createSafetyGate fixtures (no live Haiku; consistent with the calling test):
 *   - VH-1: real acute regex input → shouldRedirect=true, severity=acute
 *   - VH-2: moderate fixture → shouldRedirect=true
 *   - VH-3: mild fixture → shouldRedirect=false (mild does NOT block the entry)
 *   - VH-4: none fixture → shouldRedirect=false
 *   - VH-5: benign real input (regex finds nothing) → distress_detected=false
 *
 * NOT COVERED HERE (deferred to the live exercise / later session):
 *   - End-to-end HTTP test against the actual handler (requires auth + Supabase
 *     env per CLAUDE.md). Covered by the optional TEST live run (PR17). The
 *     fresh-classifier-call path (live Haiku, Stage 2) is covered by the live
 *     run + r20a-classifier-eval.ts; the regex Stage 1 is exercised here.
 *
 * Rules served: R20a (vulnerable user detection); AC4 (invocation testing);
 * AC5 (ninth-route protocol); PR1 (single-route proof — wired first); PR3
 * (synchronous safety); PR15 (mirrors the calling test pattern).
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

  // INV-4: the gate runs BEFORE encryptJournalProse (never screen ciphertext)
  const gateIdx = bodyOnly.indexOf('enforceDistressCheck')
  const encryptIdx = bodyOnly.indexOf('encryptJournalProse')
  expectTrue(
    'INV-4 distress gate precedes encryptJournalProse (gate before encryption/insert)',
    gateIdx !== -1 && encryptIdx !== -1 && gateIdx < encryptIdx,
    `gateIdx=${gateIdx} encryptIdx=${encryptIdx}`,
  )
}

// ============================================================================
// FIXTURES — distress results for the createSafetyGate verdict tests
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
// VERDICT TESTS — VH-1..VH-5 (the route's `if (gate.shouldRedirect)` decision)
// ============================================================================

function runVerdictTests(): void {
  // VH-1 — a real acute input caught by the regex Stage 1 (network-free).
  // "I want to die" matches the suicidal-ideation pattern → acute → redirect.
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
  const benign = detectDistress('Today I made coffee and felt calm while reading.')
  expectEq('VH-5 benign real input → distress_detected=false', benign.distress_detected, false)
}

// ============================================================================
// EXECUTION-ORDER PINS (Group 2, 2026-09-05, Session 3B, audit §6 item 6)
// ============================================================================
//
// The three MAXIMUM guards (`impression`, `assent`, `action`; all
// TEXT_LIMITS.medium) were MOVED after the distress check under the
// 2026-09-06 ruling. Session 3C (Group 2b, 2026-09-06) then moved the
// three-field PRESENCE check and the two `event_timestamp` 400s after the
// check too (audit §4.4 P′ and O; mentor Part 5) and wrapped the check in
// `if (distressText.trim()) { … }` so an all-empty body skips stage 2. The
// structural anchor is therefore THAT enclosing skip-block's brace-matched
// END — the block the check lives in (constraint 8; the journal sentinel
// precedent) — not merely the inner redirect `if`.
//
// MUTATION RECORD (2026-09-05, real file, hash-verified restore): the
// `impression` maximum placed BEFORE the check → MAX-1 fails; placed BETWEEN
// the check and the redirect return → MAX-1 fails; deleted → MAX-3 fails; the
// cap removed (`.map((s) => String(s).trim())`) → CAP-1 fails.

function runOrderingPins(): void {
  const code = loadCodeOnly(ROUTE_PATH)
  const LIMITS = readTextLimitsFromSource()

  const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*distressText\s*\)\s*\)/
  const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
  const MAX_IMPRESSION_RE = new RegExp(`validateTextLength\\(\\s*impression\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
  const MAX_ASSENT_RE = new RegExp(`validateTextLength\\(\\s*assent\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
  const MAX_ACTION_RE = new RegExp(`validateTextLength\\(\\s*action\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
  // Session 3C: `String(s ?? '')` — an ABSENT field contributes nothing to
  // the subject now that presence runs after the check (a bare `String(s)`
  // would screen the literal word "undefined").
  const CAP_RE = /\.map\(\s*\(\s*s\s*\)\s*=>\s*String\(\s*s\s*\?\?\s*['"]{2}\s*\)\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)\.trim\(\)\s*\)/
  const UNCAPPED_RE = /\.map\(\s*\(\s*s\s*\)\s*=>\s*String\(\s*s(?:\s*\?\?\s*['"]{2})?\s*\)\.trim\(\)\s*\)/
  const SKIP_BLOCK_RE = /if\s*\(\s*distressText\.trim\(\)\s*\)\s*\{/
  const PRESENCE_RE = /if\s*\(\s*!impression\?\.trim\(\)\s*\|\|\s*!assent\?\.trim\(\)\s*\|\|\s*!action\?\.trim\(\)\s*\)\s*\{/
  const TS_PARSE_RE = /const\s+ts\s*=\s*new\s+Date\(\s*event_timestamp\s*\)/
  const TS_FUTURE_RE = /if\s*\(\s*ts\s*>\s*new\s+Date\(\s*\)\s*\)/
  const SUBJECT_DEF_RE = /const\s+distressText\s*=\s*\[\s*impression\s*,\s*assent\s*,\s*action\s*\]/
  const ENCRYPT_RE = /encryptJournalProse\s*\(/
  const STORE_RE = /createClient\s*\(\s*supabaseUrl\s*,\s*supabaseServiceKey\s*\)/

  const checkIdx = codeIndex(code, CHECK_RE)
  const block = structuralBlock(code, REDIRECT_OPEN_RE)
  const skipBlock = structuralBlock(code, SKIP_BLOCK_RE)
  const presenceIdx = codeIndex(code, PRESENCE_RE)
  const tsParseIdx = codeIndex(code, TS_PARSE_RE)
  const tsFutureIdx = codeIndex(code, TS_FUTURE_RE)
  const maxImpressionIdx = codeIndex(code, MAX_IMPRESSION_RE)
  const maxAssentIdx = codeIndex(code, MAX_ASSENT_RE)
  const maxActionIdx = codeIndex(code, MAX_ACTION_RE)
  const capIdx = codeIndex(code, CAP_RE)
  const subjectDefIdx = codeIndex(code, SUBJECT_DEF_RE)
  const encryptIdx = codeIndexAfter(code, ENCRYPT_RE, checkIdx)
  const storeIdx = codeIndexAfter(code, STORE_RE, checkIdx)

  expectTrue(
    'MAX-1 ALL THREE maximum guards (impression, assent, action) follow the structural END of the enclosing skip-block ' +
      '(which contains the check AND its redirect return; anchored on that block\'s own closing brace, so drift to anywhere inside it — before OR after the check — is caught)',
    maxImpressionIdx > -1 && maxAssentIdx > -1 && maxActionIdx > -1 && skipBlock.endIdx > -1 &&
      maxImpressionIdx > skipBlock.endIdx && maxAssentIdx > skipBlock.endIdx && maxActionIdx > skipBlock.endIdx,
    `impression=${maxImpressionIdx} assent=${maxAssentIdx} action=${maxActionIdx} skipEnd=${skipBlock.endIdx}`,
  )
  expectTrue(
    'MAX-2 the maxima keep their relative order (impression, assent, action) and still precede the store client and encryption (order, not existence)',
    maxImpressionIdx > -1 && maxAssentIdx > maxImpressionIdx && maxActionIdx > maxAssentIdx &&
      storeIdx > -1 && encryptIdx > -1 && maxActionIdx < storeIdx && maxActionIdx < encryptIdx,
    `impression=${maxImpressionIdx} assent=${maxAssentIdx} action=${maxActionIdx} store=${storeIdx} encrypt=${encryptIdx}`,
  )
  expectTrue(
    'MAX-3 non-vacuity: each maximum appears exactly once; the skip-block and the redirect block were each found exactly once, are non-degenerate, and nest correctly around the check (skip open < check < redirect open < redirect end < skip end)',
    codeCount(code, MAX_IMPRESSION_RE) === 1 && codeCount(code, MAX_ASSENT_RE) === 1 && codeCount(code, MAX_ACTION_RE) === 1 &&
      block.matches === 1 && skipBlock.matches === 1 && checkIdx > -1 &&
      skipBlock.openIdx > -1 && checkIdx > skipBlock.openIdx && block.openIdx > checkIdx && block.endIdx > block.openIdx && skipBlock.endIdx > block.endIdx,
    `counts=${codeCount(code, MAX_IMPRESSION_RE)}/${codeCount(code, MAX_ASSENT_RE)}/${codeCount(code, MAX_ACTION_RE)} redirect=${block.openIdx}..${block.endIdx} (${block.matches}) skip=${skipBlock.openIdx}..${skipBlock.endIdx} (${skipBlock.matches}) check=${checkIdx}`,
  )
  expectTrue(
    'CAP-1 the three-field subject is composed with each field sliced at TEXT_LIMITS.medium before trim (exactly once, before the check) and the uncapped map is gone',
    codeCount(code, CAP_RE) === 1 && codeCount(code, UNCAPPED_RE) === 0 &&
      subjectDefIdx > -1 && capIdx > subjectDefIdx && capIdx < checkIdx && codeCount(code, CHECK_RE) === 1,
    `cap=${capIdx} uncapped=${codeCount(code, UNCAPPED_RE)} subjectDef=${subjectDefIdx} check=${checkIdx}`,
  )
  expectTrue(
    'CAP-2 the cap key (TEXT_LIMITS.medium) is the SAME key all three moved guards enforce (the cap equals the bound)',
    MAX_IMPRESSION_RE.test(code) && MAX_ASSENT_RE.test(code) && MAX_ACTION_RE.test(code) && CAP_RE.test(code),
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

  // SIB-* / TS-* / NEG-2 — Session 3C (Group 2b, 2026-09-06).
  expectTrue(
    'SIB-1 the three-field PRESENCE 400 follows the structural END of the enclosing skip-block and precedes the maxima (the pre-remediation relative order: presence, timestamps, maxima)',
    presenceIdx > -1 && skipBlock.endIdx > -1 && presenceIdx > skipBlock.endIdx && maxImpressionIdx > presenceIdx,
    `presence=${presenceIdx} skipEnd=${skipBlock.endIdx} maxImpression=${maxImpressionIdx}`,
  )
  expectTrue(
    'SIB-2 the presence check still precedes the store client and encryption (order, not existence)',
    presenceIdx > -1 && storeIdx > -1 && encryptIdx > -1 && presenceIdx < storeIdx && presenceIdx < encryptIdx,
    `presence=${presenceIdx} store=${storeIdx} encrypt=${encryptIdx}`,
  )
  expectTrue(
    'SIB-3 non-vacuity: the presence check appears exactly once, and the subject composition uses `?? \'\'` so an absent field contributes nothing (the skip-block is what keeps an all-empty body off stage 2)',
    codeCount(code, PRESENCE_RE) === 1 && codeCount(code, CAP_RE) === 1 && codeCount(code, SKIP_BLOCK_RE) === 1,
    `presence=${codeCount(code, PRESENCE_RE)} cap=${codeCount(code, CAP_RE)} skip=${codeCount(code, SKIP_BLOCK_RE)}`,
  )
  expectTrue(
    'TS-1 the two event_timestamp 400s (class O) follow the skip-block END, follow the presence check, keep their order (parse, then future), and precede the maxima and the store',
    tsParseIdx > -1 && tsFutureIdx > -1 && tsParseIdx > skipBlock.endIdx && tsParseIdx > presenceIdx && tsFutureIdx > tsParseIdx &&
      maxImpressionIdx > tsFutureIdx && storeIdx > tsFutureIdx && codeCount(code, TS_PARSE_RE) === 1 && codeCount(code, TS_FUTURE_RE) === 1,
    `parse=${tsParseIdx} future=${tsFutureIdx} skipEnd=${skipBlock.endIdx} presence=${presenceIdx} maxImpression=${maxImpressionIdx} store=${storeIdx}`,
  )
  {
    const postIdx = codeIndex(code, POST_HANDLER_RE)
    const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
    const literalHit = preSpan.includes('All three fields are required') || preSpan.includes('Invalid event_timestamp format') || preSpan.includes('cannot be in the future')
    const tokenHits = codeCount(preSpan, /\?\.trim\(\)/) + codeCount(preSpan, /new\s+Date\(\s*event_timestamp\s*\)/) + codeCount(preSpan, /isNaN\s*\(/)
    expectTrue(
      'NEG-2 none of the moved 400s (three-field presence, timestamp parse, timestamp future) occurs before the distress check in any form (error literals and structural tokens — `?.trim()`, `new Date(event_timestamp)`, `isNaN(` — all absent from the pre-check span)',
      postIdx > -1 && checkIdx > postIdx && !literalHit && tokenHits === 0,
      `literal=${literalHit} tokens=${tokenHits}`,
    )
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('--- r20a-invocation.test.ts (journal-feed route-level R20a catch) ---')

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
