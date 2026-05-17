/**
 * pass-through-fields.test.ts — Validator coverage for the six enterprise-
 * accountability pass-through fields. Plain-assertion script; no Jest.
 *
 * Run via: `npx tsx website/src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts`
 *
 * (No --env-file flag needed — this test does not import the Supabase server
 * client transitively, so the module-load Supabase URL check at
 * supabase-server.ts does not fire. Per CLAUDE.md "Running the substrate
 * test suite" section.)
 *
 * PR2 — build-to-wire verification immediate: this file invokes every
 * exported pass-through-fields function in the same session pass-through-
 * fields.ts is written.
 *
 * COVERAGE
 *
 *   normaliseOperationClass — Decision A
 *     OP-ENUM  every VALID_OPERATION_CLASSES value round-trips (10)
 *     OP-UNDEF / OP-NULL / OP-EMPTY → 'unknown' default (3)
 *     OP-FALLBACK  unrecognised string → 'unknown' soft-fallback (1)
 *
 *   normaliseIdentityModel — Decision B
 *     ID-ENUM  every VALID_IDENTITY_MODELS value round-trips (7)
 *     ID-UNDEF / ID-NULL / ID-EMPTY → 'unknown' default (3)
 *     ID-FALLBACK  unrecognised string → 'unknown' soft-fallback (1)
 *
 *   normalisePathPosture — Decision C
 *     PP-ENUM  every VALID_PATH_POSTURES value round-trips (4)
 *     PP-UNDEF / PP-NULL / PP-EMPTY → 'ambiguous' default (3)
 *     PP-FALLBACK  unrecognised string → 'ambiguous' soft-fallback (1)
 *     PP-NOT-UNKNOWN  semantic distinction: default is 'ambiguous', NOT
 *                     'unknown' (which isn't even in the enum) (1)
 *
 *   normaliseTargetVendor — Decision D vendor side
 *     TV-ENUM  every VALID_TARGET_VENDORS value round-trips (10)
 *     TV-UNDEF / TV-NULL / TV-EMPTY → 'none' default (3)
 *     TV-FALLBACK  unrecognised string → 'other' soft-fallback (1)
 *     TV-NONE-VS-OTHER  semantic distinction preserved: default 'none' for
 *                       absence vs 'other' for unknown vendor (1)
 *
 *   normaliseTargetDetail — Decision D detail side
 *     TD-VALID  short valid string passes through (1)
 *     TD-UNDEF / TD-NULL / TD-EMPTY → undefined (no default) (3)
 *     TD-AT-CAP  string exactly at MAX_TARGET_DETAIL_LENGTH passes through (1)
 *     TD-OVER-CAP  string longer than the cap is truncated to the cap (1)
 *     TD-NON-STRING  number / object / boolean → undefined (3)
 *
 *   normaliseOutcomeVerification — Decision E
 *     OV-ENUM  every VALID_OUTCOME_VERIFICATIONS value round-trips (4)
 *     OV-UNDEF / OV-NULL / OV-EMPTY → 'self_reported' default (3)
 *     OV-FALLBACK  unrecognised string → 'self_reported' soft-fallback (1)
 *
 *   normaliseReversibilitySignal — Decision F
 *     RS-ENUM  every VALID_REVERSIBILITY_SIGNALS value round-trips (4)
 *     RS-UNDEF / RS-NULL / RS-EMPTY → 'unknown' default (3)
 *     RS-FALLBACK  unrecognised string → 'unknown' soft-fallback (1)
 *
 *   CROSS-FIELD
 *     XF-EVAL  a complete EvaluatedAction with all 5 new fields type-checks
 *              + each field normalises independently
 *     XF-PROF  a complete CarriedProfile-like shape with both 2 new fields
 *              type-checks + each field normalises independently
 *     XF-BACK-COMPAT  an EvaluatedAction-like shape WITHOUT any new fields
 *                     type-checks + each undefined field defaults
 *                     correctly when read through the normalisers
 *     XF-VENDOR-DETAIL  paired (vendor, detail) round-trip: salesforce +
 *                       opportunities
 *     XF-VENDOR-DETAIL-2  paired round-trip: microsoft + outlook.calendar
 *
 *   INVARIANTS
 *     INV-PURE  all normalisers are deterministic — identical inputs →
 *               identical outputs across repeated calls (sampled)
 *
 * Expected: ~50 PASS lines. Exit code 0 = all pass.
 */

import {
  normaliseOperationClass,
  normaliseIdentityModel,
  normalisePathPosture,
  normaliseTargetVendor,
  normaliseTargetDetail,
  normaliseOutcomeVerification,
  normaliseReversibilitySignal,
  VALID_OPERATION_CLASSES,
  VALID_IDENTITY_MODELS,
  VALID_PATH_POSTURES,
  VALID_TARGET_VENDORS,
  VALID_OUTCOME_VERIFICATIONS,
  VALID_REVERSIBILITY_SIGNALS,
  MAX_TARGET_DETAIL_LENGTH,
} from '../pass-through-fields'

import type {
  OperationClass,
  DownstreamIdentityModel,
  PathPosture,
  TargetSystemVendor,
  OutcomeVerification,
  ReversibilitySignal,
} from '../../types/evaluation'

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

// Silence console.warn during soft-fallback tests so the test output stays
// readable. The validators DO call console.warn on unrecognised values; the
// tests don't need to see them.
const originalWarn = console.warn
function suppressWarnings(): void {
  console.warn = (): void => { /* noop */ }
}
function restoreWarnings(): void {
  console.warn = originalWarn
}

// ============================================================================
// normaliseOperationClass — Decision A
// ============================================================================

console.log('\n--- normaliseOperationClass — Decision A ---')

for (const value of VALID_OPERATION_CLASSES) {
  assertEqual(
    `OP-ENUM  '${value}' round-trips`,
    normaliseOperationClass(value),
    value
  )
}

assertEqual('OP-UNDEF  undefined → unknown', normaliseOperationClass(undefined), 'unknown')
assertEqual('OP-NULL   null → unknown',      normaliseOperationClass(null),      'unknown')
assertEqual('OP-EMPTY  empty → unknown',     normaliseOperationClass(''),        'unknown')

suppressWarnings()
assertEqual(
  "OP-FALLBACK  unrecognised 'create' → unknown",
  normaliseOperationClass('create'),
  'unknown'
)
restoreWarnings()

// ============================================================================
// normaliseIdentityModel — Decision B
// ============================================================================

console.log('\n--- normaliseIdentityModel — Decision B ---')

for (const value of VALID_IDENTITY_MODELS) {
  assertEqual(
    `ID-ENUM  '${value}' round-trips`,
    normaliseIdentityModel(value),
    value
  )
}

assertEqual('ID-UNDEF  undefined → unknown', normaliseIdentityModel(undefined), 'unknown')
assertEqual('ID-NULL   null → unknown',      normaliseIdentityModel(null),      'unknown')
assertEqual('ID-EMPTY  empty → unknown',     normaliseIdentityModel(''),        'unknown')

suppressWarnings()
assertEqual(
  "ID-FALLBACK  unrecognised 'oauth' → unknown",
  normaliseIdentityModel('oauth'),
  'unknown'
)
restoreWarnings()

// ============================================================================
// normalisePathPosture — Decision C
// ============================================================================

console.log('\n--- normalisePathPosture — Decision C ---')

for (const value of VALID_PATH_POSTURES) {
  assertEqual(
    `PP-ENUM  '${value}' round-trips`,
    normalisePathPosture(value),
    value
  )
}

assertEqual('PP-UNDEF  undefined → ambiguous', normalisePathPosture(undefined), 'ambiguous')
assertEqual('PP-NULL   null → ambiguous',      normalisePathPosture(null),      'ambiguous')
assertEqual('PP-EMPTY  empty → ambiguous',     normalisePathPosture(''),        'ambiguous')

suppressWarnings()
assertEqual(
  "PP-FALLBACK  unrecognised 'partner_api' → ambiguous",
  normalisePathPosture('partner_api'),
  'ambiguous'
)
// PP-NOT-UNKNOWN: 'unknown' isn't even in the enum — it must fall through to ambiguous
assertEqual(
  "PP-NOT-UNKNOWN  semantic distinction: 'unknown' → ambiguous (not retained)",
  normalisePathPosture('unknown'),
  'ambiguous'
)
restoreWarnings()

// ============================================================================
// normaliseTargetVendor — Decision D vendor side
// ============================================================================

console.log('\n--- normaliseTargetVendor — Decision D vendor side ---')

for (const value of VALID_TARGET_VENDORS) {
  assertEqual(
    `TV-ENUM  '${value}' round-trips`,
    normaliseTargetVendor(value),
    value
  )
}

assertEqual('TV-UNDEF  undefined → none', normaliseTargetVendor(undefined), 'none')
assertEqual('TV-NULL   null → none',      normaliseTargetVendor(null),      'none')
assertEqual('TV-EMPTY  empty → none',     normaliseTargetVendor(''),        'none')

suppressWarnings()
// TV-FALLBACK: unrecognised vendor goes to 'other', NOT 'none' (the meaningful
// semantic distinction is preserved by the soft-fallback)
assertEqual(
  "TV-FALLBACK  unrecognised 'jira_data_center' → other",
  normaliseTargetVendor('jira_data_center'),
  'other'
)
// TV-NONE-VS-OTHER: explicit test of the semantic distinction
assertEqual(
  "TV-NONE-VS-OTHER  absence='none', unknown='other'",
  normaliseTargetVendor(undefined) === 'none' &&
    normaliseTargetVendor('zoom') === 'other'
    ? 'distinct'
    : 'collapsed',
  'distinct'
)
restoreWarnings()

// ============================================================================
// normaliseTargetDetail — Decision D detail side
// ============================================================================

console.log('\n--- normaliseTargetDetail — Decision D detail side ---')

assertEqual('TD-VALID  short string passes through',
  normaliseTargetDetail('opportunities'),
  'opportunities')

assertEqual('TD-UNDEF  undefined → undefined', normaliseTargetDetail(undefined), undefined)
assertEqual('TD-NULL   null → undefined',      normaliseTargetDetail(null),      undefined)
assertEqual('TD-EMPTY  empty → undefined',     normaliseTargetDetail(''),        undefined)

// TD-AT-CAP: exactly at the length cap passes through unchanged
const atCap = 'a'.repeat(MAX_TARGET_DETAIL_LENGTH)
assertEqual('TD-AT-CAP  string at MAX length passes through',
  normaliseTargetDetail(atCap),
  atCap)

// TD-OVER-CAP: string longer than the cap is truncated
const overCap = 'a'.repeat(MAX_TARGET_DETAIL_LENGTH + 50)
const truncated = normaliseTargetDetail(overCap)
assertEqual('TD-OVER-CAP  over-cap string is truncated to MAX length',
  truncated?.length,
  MAX_TARGET_DETAIL_LENGTH)

assertEqual('TD-NON-STRING-NUM  number → undefined',  normaliseTargetDetail(42),        undefined)
assertEqual('TD-NON-STRING-OBJ  object → undefined',  normaliseTargetDetail({ x: 1 }),  undefined)
assertEqual('TD-NON-STRING-BOOL boolean → undefined', normaliseTargetDetail(true),      undefined)

// ============================================================================
// normaliseOutcomeVerification — Decision E
// ============================================================================

console.log('\n--- normaliseOutcomeVerification — Decision E ---')

for (const value of VALID_OUTCOME_VERIFICATIONS) {
  assertEqual(
    `OV-ENUM  '${value}' round-trips`,
    normaliseOutcomeVerification(value),
    value
  )
}

assertEqual('OV-UNDEF  undefined → self_reported', normaliseOutcomeVerification(undefined), 'self_reported')
assertEqual('OV-NULL   null → self_reported',      normaliseOutcomeVerification(null),      'self_reported')
assertEqual('OV-EMPTY  empty → self_reported',     normaliseOutcomeVerification(''),        'self_reported')

suppressWarnings()
assertEqual(
  "OV-FALLBACK  unrecognised 'verified' → self_reported",
  normaliseOutcomeVerification('verified'),
  'self_reported'
)
restoreWarnings()

// ============================================================================
// normaliseReversibilitySignal — Decision F
// ============================================================================

console.log('\n--- normaliseReversibilitySignal — Decision F ---')

for (const value of VALID_REVERSIBILITY_SIGNALS) {
  assertEqual(
    `RS-ENUM  '${value}' round-trips`,
    normaliseReversibilitySignal(value),
    value
  )
}

assertEqual('RS-UNDEF  undefined → unknown', normaliseReversibilitySignal(undefined), 'unknown')
assertEqual('RS-NULL   null → unknown',      normaliseReversibilitySignal(null),      'unknown')
assertEqual('RS-EMPTY  empty → unknown',     normaliseReversibilitySignal(''),        'unknown')

suppressWarnings()
assertEqual(
  "RS-FALLBACK  unrecognised 'undoable' → unknown",
  normaliseReversibilitySignal('undoable'),
  'unknown'
)
restoreWarnings()

// ============================================================================
// CROSS-FIELD — typed structural shapes for EvaluatedAction-like + CarriedProfile-like
// ============================================================================

console.log('\n--- CROSS-FIELD ---')

// XF-EVAL: a complete EvaluatedAction-like shape with all 5 new fields
type EvaluatedActionPassThrough = {
  readonly operation_class?: OperationClass
  readonly target_system_vendor?: TargetSystemVendor
  readonly target_system_detail?: string
  readonly outcome_verification?: OutcomeVerification
  readonly reversibility_signal?: ReversibilitySignal
}

const fullEval: EvaluatedActionPassThrough = {
  operation_class: 'write',
  target_system_vendor: 'salesforce',
  target_system_detail: 'opportunities',
  outcome_verification: 'system_confirmed',
  reversibility_signal: 'partially_reversible',
}

assert(
  'XF-EVAL  complete EvaluatedAction normalises every field independently',
  normaliseOperationClass(fullEval.operation_class) === 'write' &&
    normaliseTargetVendor(fullEval.target_system_vendor) === 'salesforce' &&
    normaliseTargetDetail(fullEval.target_system_detail) === 'opportunities' &&
    normaliseOutcomeVerification(fullEval.outcome_verification) === 'system_confirmed' &&
    normaliseReversibilitySignal(fullEval.reversibility_signal) === 'partially_reversible'
)

// XF-PROF: a complete CarriedProfile-like shape with both 2 new fields
type CarriedProfilePassThrough = {
  readonly downstream_identity_model?: DownstreamIdentityModel
  readonly path_posture?: PathPosture
}

const fullProf: CarriedProfilePassThrough = {
  downstream_identity_model: 'vendor_framework',
  path_posture: 'endorsed',
}

assert(
  'XF-PROF  complete CarriedProfile normalises every field independently',
  normaliseIdentityModel(fullProf.downstream_identity_model) === 'vendor_framework' &&
    normalisePathPosture(fullProf.path_posture) === 'endorsed'
)

// XF-BACK-COMPAT: an EvaluatedAction-like shape WITHOUT any new fields
const bareEval: EvaluatedActionPassThrough = {}

assert(
  'XF-BACK-COMPAT  bare EvaluatedAction (no pass-through fields) all default correctly',
  normaliseOperationClass(bareEval.operation_class) === 'unknown' &&
    normaliseTargetVendor(bareEval.target_system_vendor) === 'none' &&
    normaliseTargetDetail(bareEval.target_system_detail) === undefined &&
    normaliseOutcomeVerification(bareEval.outcome_verification) === 'self_reported' &&
    normaliseReversibilitySignal(bareEval.reversibility_signal) === 'unknown'
)

// XF-VENDOR-DETAIL: paired (vendor, detail) round-trip — salesforce + opportunities
assert(
  'XF-VENDOR-DETAIL  paired round-trip: salesforce + opportunities',
  normaliseTargetVendor('salesforce') === 'salesforce' &&
    normaliseTargetDetail('opportunities') === 'opportunities'
)

// XF-VENDOR-DETAIL-2: paired round-trip — microsoft + outlook.calendar
assert(
  'XF-VENDOR-DETAIL-2  paired round-trip: microsoft + outlook.calendar',
  normaliseTargetVendor('microsoft') === 'microsoft' &&
    normaliseTargetDetail('outlook.calendar') === 'outlook.calendar'
)

// ============================================================================
// INVARIANTS
// ============================================================================

console.log('\n--- INVARIANTS ---')

// INV-PURE: all normalisers are deterministic — identical inputs → identical
// outputs across repeated calls (sampled across the 7 normalisers)
assert(
  'INV-PURE  all normalisers are deterministic across repeated calls',
  normaliseOperationClass('write') === normaliseOperationClass('write') &&
    normaliseIdentityModel('delegated_user') === normaliseIdentityModel('delegated_user') &&
    normalisePathPosture('endorsed') === normalisePathPosture('endorsed') &&
    normaliseTargetVendor('salesforce') === normaliseTargetVendor('salesforce') &&
    normaliseTargetDetail('opportunities') === normaliseTargetDetail('opportunities') &&
    normaliseOutcomeVerification('system_confirmed') === normaliseOutcomeVerification('system_confirmed') &&
    normaliseReversibilitySignal('reversible') === normaliseReversibilitySignal('reversible')
)

// ============================================================================
// Report + exit
// ============================================================================

console.log(`\n--- Results: ${passCount} pass, ${failCount} fail ---`)
if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)
