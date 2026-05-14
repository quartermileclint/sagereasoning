/**
 * layer1-schema-additions.test.ts — Behavioural tests for the eight optional
 * carried-context fields added to Layer1Schema under D-LAYER1-SCHEMA-ADDITIONS
 * (2026-05-14).
 *
 * Run via: `npx tsx website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts`
 * (mirrors the A5 / A7 verification pattern; no Jest framework dependency.)
 *
 * This is the first Layer 1 test file — there was no pre-existing
 * layer1-extractor test suite (confirmed in the session's Step 1 survey).
 *
 * COVERAGE — per the next-session prompt's Step 4 check 3:
 *
 *   BC  — Backward-compat: a Layer1Schema WITHOUT any of the eight new fields
 *         still validates; the optional fields are absent on the result.
 *   VP  — Valid-present: a Layer1Schema WITH each of the eight new fields
 *         (and all eight at once) validates and passes the value through.
 *   VN  — Valid-null: each field accepts `null` and preserves it.
 *   VR  — Validator-rejects: a malformed value for each field throws
 *         Layer1ValidationError (proves the validator shape-checks them — the
 *         field is not merely declared in the type; PR2 build-to-wire).
 *   L2  — Layer 2 ingress tolerance: applyMechanisms + detectTier1Trigger
 *         accept a Layer1Schema carrying all eight fields without throwing,
 *         AND produce output byte-identical to the same schema without the
 *         fields (carried context is inert in Layer 2 — it does not yet act
 *         on it).
 *
 * Exit code 0 = all pass. Non-zero = failures listed.
 */

import {
  validateLayer1Schema,
  Layer1ValidationError,
} from '../layer1-extractor'
import { applyMechanisms, detectTier1Trigger } from '../layer2-mechanisms'

// ============================================================================
// FIXTURES
// ============================================================================

/**
 * Minimal valid Layer1Schema as a plain object (the shape validateLayer1Schema
 * receives — it takes `unknown`). All 15 required fields present; every array
 * empty; no carried-context fields. This is the per-response, un-wrapped,
 * public case — every /api/reason call today.
 */
function buildMinimalRaw(): Record<string, unknown> {
  return {
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
}

/** A raw schema carrying valid values for ALL eight carried-context fields. */
function buildRawWithAllCarriedContext(): Record<string, unknown> {
  return {
    ...buildMinimalRaw(),
    // private mode (4)
    subject_identity_binding: { subject_id: 'user-abc-123' },
    reflective_self_report: 'I was anxious about disappointing the team.',
    history_window: { window_days: 90, limit: 100 },
    topic_signal: 'work-deadline',
    // ATL wrapper (4)
    carried_profile: { typical_proximity: 'deliberate', actions: [] },
    profile_provenance: { source: 'own_prior_substrate_assessments' },
    peer_agent_assessments: [{ agent_id: 'peer-1' }, { agent_id: 'peer-2' }],
    objective_function_declaration: 'maximise task completion within policy',
  }
}

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
    ok ? undefined : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

/** Asserts that `fn` does NOT throw. */
function assertNoThrow(label: string, fn: () => unknown): void {
  try {
    fn()
    passCount++
    console.log(`PASS  ${label}`)
  } catch (err) {
    failCount++
    const msg = `${label} — unexpected throw: ${err instanceof Error ? err.message : String(err)}`
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

/** Asserts that `fn` throws a Layer1ValidationError. */
function assertThrowsValidation(label: string, fn: () => unknown): void {
  try {
    fn()
    failCount++
    failures.push(`${label} — expected Layer1ValidationError, none thrown`)
    console.log(`FAIL  ${label} — expected Layer1ValidationError, none thrown`)
  } catch (err) {
    if (err instanceof Layer1ValidationError) {
      passCount++
      console.log(`PASS  ${label}`)
    } else {
      failCount++
      const msg = `${label} — threw ${err instanceof Error ? err.name : typeof err}, expected Layer1ValidationError`
      failures.push(msg)
      console.log(`FAIL  ${msg}`)
    }
  }
}

// ============================================================================
// BC — Backward-compat: no carried-context fields
// ============================================================================

assertNoThrow('BC-1  minimal schema (no carried-context fields) validates', () =>
  validateLayer1Schema(buildMinimalRaw())
)

{
  const r = validateLayer1Schema(buildMinimalRaw())
  assert(
    'BC-2  all eight carried-context fields absent (undefined) on the result',
    r.subject_identity_binding === undefined &&
      r.reflective_self_report === undefined &&
      r.history_window === undefined &&
      r.topic_signal === undefined &&
      r.carried_profile === undefined &&
      r.profile_provenance === undefined &&
      r.peer_agent_assessments === undefined &&
      r.objective_function_declaration === undefined
  )
  assertEqual('BC-3  version unchanged (no bump)', r.version, 'layer1-schema-v1')
}

// ============================================================================
// VP — Valid-present: each field, then all eight at once
// ============================================================================

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    subject_identity_binding: { subject_id: 'user-abc-123' },
  })
  assertEqual(
    'VP-1  subject_identity_binding passes through',
    JSON.stringify(r.subject_identity_binding),
    JSON.stringify({ subject_id: 'user-abc-123' })
  )
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    reflective_self_report: 'I was anxious about the deadline.',
  })
  assertEqual(
    'VP-2  reflective_self_report passes through',
    r.reflective_self_report,
    'I was anxious about the deadline.'
  )
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    history_window: { window_days: 90, limit: 100 },
  })
  assertEqual(
    'VP-3  history_window passes through',
    JSON.stringify(r.history_window),
    JSON.stringify({ window_days: 90, limit: 100 })
  )
}

{
  // history_window with only one sub-field present (both optional)
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    history_window: { limit: 50 },
  })
  assertEqual(
    'VP-4  history_window with partial sub-fields validates',
    JSON.stringify(r.history_window),
    JSON.stringify({ limit: 50 })
  )
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    topic_signal: 'work-deadline',
  })
  assertEqual('VP-5  topic_signal passes through', r.topic_signal, 'work-deadline')
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    carried_profile: { typical_proximity: 'deliberate', actions: [] },
  })
  assertEqual(
    'VP-6  carried_profile passes through',
    JSON.stringify(r.carried_profile),
    JSON.stringify({ typical_proximity: 'deliberate', actions: [] })
  )
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    profile_provenance: { source: 'own_prior_substrate_assessments' },
  })
  assertEqual(
    'VP-7  profile_provenance passes through',
    JSON.stringify(r.profile_provenance),
    JSON.stringify({ source: 'own_prior_substrate_assessments' })
  )
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    peer_agent_assessments: [{ agent_id: 'peer-1' }, { agent_id: 'peer-2' }],
  })
  assertEqual(
    'VP-8  peer_agent_assessments passes through',
    JSON.stringify(r.peer_agent_assessments),
    JSON.stringify([{ agent_id: 'peer-1' }, { agent_id: 'peer-2' }])
  )
}

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    objective_function_declaration: 'maximise task completion within policy',
  })
  assertEqual(
    'VP-9  objective_function_declaration passes through',
    r.objective_function_declaration,
    'maximise task completion within policy'
  )
}

{
  const r = validateLayer1Schema(buildRawWithAllCarriedContext())
  assert(
    'VP-10 all eight carried-context fields present together validate',
    JSON.stringify(r.subject_identity_binding) === JSON.stringify({ subject_id: 'user-abc-123' }) &&
      r.reflective_self_report === 'I was anxious about disappointing the team.' &&
      JSON.stringify(r.history_window) === JSON.stringify({ window_days: 90, limit: 100 }) &&
      r.topic_signal === 'work-deadline' &&
      JSON.stringify(r.carried_profile) === JSON.stringify({ typical_proximity: 'deliberate', actions: [] }) &&
      JSON.stringify(r.profile_provenance) === JSON.stringify({ source: 'own_prior_substrate_assessments' }) &&
      JSON.stringify(r.peer_agent_assessments) === JSON.stringify([{ agent_id: 'peer-1' }, { agent_id: 'peer-2' }]) &&
      r.objective_function_declaration === 'maximise task completion within policy'
  )
  // The required feature fields are unaffected by the carried-context additions.
  assertEqual('VP-11 required feature fields unaffected (version)', r.version, 'layer1-schema-v1')
  assertEqual('VP-12 required feature fields unaffected (motivation_stated)', r.motivation_stated, false)
}

// ============================================================================
// VN — Valid-null: each field accepts and preserves `null`
// ============================================================================

{
  const r = validateLayer1Schema({
    ...buildMinimalRaw(),
    subject_identity_binding: null,
    reflective_self_report: null,
    history_window: null,
    topic_signal: null,
    carried_profile: null,
    profile_provenance: null,
    peer_agent_assessments: null,
    objective_function_declaration: null,
  })
  assert(
    'VN-1  all eight fields accept null and preserve it as null',
    r.subject_identity_binding === null &&
      r.reflective_self_report === null &&
      r.history_window === null &&
      r.topic_signal === null &&
      r.carried_profile === null &&
      r.profile_provenance === null &&
      r.peer_agent_assessments === null &&
      r.objective_function_declaration === null
  )
}

// ============================================================================
// VR — Validator-rejects: malformed values throw Layer1ValidationError
// ============================================================================

assertThrowsValidation('VR-1  subject_identity_binding missing subject_id throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), subject_identity_binding: { wrong: 1 } })
)
assertThrowsValidation('VR-2  subject_identity_binding non-object throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), subject_identity_binding: 'not-an-object' })
)
assertThrowsValidation('VR-3  reflective_self_report non-string throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), reflective_self_report: 123 })
)
assertThrowsValidation('VR-4  history_window non-numeric sub-field throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), history_window: { window_days: 'ninety' } })
)
assertThrowsValidation('VR-5  history_window non-object throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), history_window: 42 })
)
assertThrowsValidation('VR-6  topic_signal non-string throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), topic_signal: {} })
)
assertThrowsValidation('VR-7  carried_profile non-object (string) throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), carried_profile: 'str' })
)
assertThrowsValidation('VR-8  carried_profile array (not plain object) throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), carried_profile: [] })
)
assertThrowsValidation('VR-9  profile_provenance non-object throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), profile_provenance: 7 })
)
assertThrowsValidation('VR-10 peer_agent_assessments non-array throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), peer_agent_assessments: 'not-an-array' })
)
assertThrowsValidation('VR-11 peer_agent_assessments array of non-objects throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), peer_agent_assessments: ['not-an-object'] })
)
assertThrowsValidation('VR-12 objective_function_declaration non-string throws', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), objective_function_declaration: [] })
)
// Negative-control: a genuinely malformed REQUIRED field still throws (the
// carried-context block did not weaken the existing validator).
assertThrowsValidation('VR-13 malformed required field still throws (motivation_stated non-boolean)', () =>
  validateLayer1Schema({ ...buildMinimalRaw(), motivation_stated: 'yes' })
)

// ============================================================================
// L2 — Layer 2 ingress tolerance + inertness
// ============================================================================

{
  const minimal = validateLayer1Schema(buildMinimalRaw())
  const withCarried = validateLayer1Schema(buildRawWithAllCarriedContext())

  assertNoThrow('L2-1  applyMechanisms accepts a schema carrying all eight fields', () =>
    applyMechanisms(withCarried)
  )
  assertNoThrow('L2-2  detectTier1Trigger accepts a schema carrying all eight fields', () =>
    detectTier1Trigger(withCarried)
  )

  // Inertness: Layer 2 output is byte-identical with vs without the carried-
  // context fields. Layer 2 does not (yet) act on them.
  const outMinimal = JSON.stringify(applyMechanisms(minimal))
  const outWithCarried = JSON.stringify(applyMechanisms(withCarried))
  assertEqual(
    'L2-3  applyMechanisms output identical with vs without carried context (fields are inert)',
    outWithCarried,
    outMinimal
  )

  const t1Minimal = JSON.stringify(detectTier1Trigger(minimal))
  const t1WithCarried = JSON.stringify(detectTier1Trigger(withCarried))
  assertEqual(
    'L2-4  detectTier1Trigger output identical with vs without carried context',
    t1WithCarried,
    t1Minimal
  )
}

// ============================================================================
// Report
// ============================================================================

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
