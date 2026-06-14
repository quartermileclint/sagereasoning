/**
 * practice-cycle-hint.test.ts — CI-13 reflect-at-close default hint
 * (mechanism-correction M5, 2026-06-13).
 *
 * Plain-assertion script run with: npx tsx <this file>   (env-only; no Supabase
 * chain — runs bare, no --env-file needed).
 *
 * What it proves:
 *   1. FLAG UNSET (the deployed default): practiceCycleHintField() is {} — the
 *      `practice` field is ABSENT, so consult + accreditation-write responses
 *      are byte-identical to pre-M5.
 *   2. FLAG ON: the field carries the exact Q3 contract shape — reflect_due
 *      TR-02, the existing /api/practice/reflect endpoint, default 'auto', and
 *      the explicit opt-out config key 'reflect_at_close'.
 */

import {
  isPracticeCycleHintEnabled,
  practiceCycleHintField,
  PRACTICE_CYCLE_HINT,
  PRACTICE_CYCLE_HINT_ENV_VAR,
} from '../practice-cycle-hint'

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
// 1. FLAG UNSET / 'false' — byte-identity (no `practice` field)
// ============================================================================

delete process.env[PRACTICE_CYCLE_HINT_ENV_VAR]
assert(isPracticeCycleHintEnabled() === false, 'flag unset: reader false')
assert(Object.keys(practiceCycleHintField()).length === 0, 'flag unset: practiceCycleHintField() is {} (field absent → byte-identical)')
assert(practiceCycleHintField().practice === undefined, 'flag unset: no practice key')

process.env[PRACTICE_CYCLE_HINT_ENV_VAR] = 'false'
assert(isPracticeCycleHintEnabled() === false, "flag 'false': reader false")
assert(Object.keys(practiceCycleHintField()).length === 0, "flag 'false': field absent")

// ============================================================================
// 2. FLAG ON — the Q3 contract shape
// ============================================================================

process.env[PRACTICE_CYCLE_HINT_ENV_VAR] = 'true'
assert(isPracticeCycleHintEnabled() === true, "flag 'true': reader true")

const field = practiceCycleHintField()
assert(field.practice !== undefined, "flag 'true': practice field present")
assert(field.practice === PRACTICE_CYCLE_HINT, "flag 'true': field carries the canonical hint object")

assert(PRACTICE_CYCLE_HINT.reflect_due === 'TR-02', 'reflect_due === TR-02 (a completed pass at session close)')
assert(PRACTICE_CYCLE_HINT.endpoint === '/api/practice/reflect', 'endpoint points at the existing reflect route (SR-13, full Q1–Q6)')
assert(PRACTICE_CYCLE_HINT.default === 'auto', "default === 'auto' (Q3: auto-fire at session close is the default)")
assert(PRACTICE_CYCLE_HINT.opt_out === 'reflect_at_close', "opt_out names the explicit opt-out config key 'reflect_at_close'")

// The shape is exactly the four documented keys — no abbreviation/extra surface.
assert(
  JSON.stringify(Object.keys(PRACTICE_CYCLE_HINT).sort()) ===
    JSON.stringify(['default', 'endpoint', 'opt_out', 'reflect_due']),
  'hint has exactly the four documented keys',
)

// Clean up env.
delete process.env[PRACTICE_CYCLE_HINT_ENV_VAR]

// ============================================================================
// RESULT
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
