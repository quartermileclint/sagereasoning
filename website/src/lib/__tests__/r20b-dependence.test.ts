/**
 * r20b-dependence.test.ts — A18c (R20b) detection unit test.
 *
 * Plain-assertion script (no Jest), run with tsx. Supabase-free — runs under a
 * bare `npx tsx`. Proves the deterministic threshold logic of
 * detectFrameworkDependence without any live data:
 *   - empty window           → present:false
 *   - low frequency          → present:false
 *   - high freq + shallow     → present:true   (the R20b pattern)
 *   - high freq + deep        → present:false  (healthy heavy user)
 *   - thresholds echoed
 *
 * Run: cd website && npx tsx src/lib/__tests__/r20b-dependence.test.ts
 */

import {
  detectFrameworkDependence,
  DEPENDENCE_DEFAULTS,
  type DependenceSignal,
} from '../r20b-dependence'

type Interaction = {
  id: string
  interaction_type: string
  description: string
  proximity_assessed: 'reflexive' | 'habitual' | 'deliberate' | 'principled' | 'sage_like' | null
  passions_detected: { passion: string; false_judgement: string }[]
  mechanisms_applied: string[]
  created_at: string
}

let passed = 0
let failed = 0
function assert(name: string, cond: boolean) {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.error(`  ✗ ${name}`)
  }
}

/** Build `n` interactions, `now`-dated, with the given description + proximity. */
function make(
  n: number,
  description: string,
  proximity: Interaction['proximity_assessed'],
): Interaction[] {
  const nowIso = new Date().toISOString()
  return Array.from({ length: n }, (_, i) => ({
    id: `i${i}`,
    interaction_type: 'reflection',
    description,
    proximity_assessed: proximity,
    passions_detected: [],
    mechanisms_applied: [],
    created_at: nowIso,
  }))
}

console.log('R20b detectFrameworkDependence:')

// 1. Empty window → not present.
{
  const s: DependenceSignal = detectFrameworkDependence([])
  assert('empty window → present:false', s.present === false)
  assert('empty window → window_count 0', s.window_count === 0)
  assert('empty window → null median', s.median_input_length === null)
}

// 2. Low frequency (below minFrequency) → not present, even if shallow+short.
{
  const s = detectFrameworkDependence(make(5, 'ok', 'reflexive'))
  assert('low frequency → present:false', s.present === false)
  assert('low frequency → count echoed', s.window_count === 5)
}

// 3. High frequency + shallow/short inputs → the R20b pattern → present.
{
  const s = detectFrameworkDependence(make(40, 'should I?', 'reflexive'))
  assert('high freq + shallow → present:true', s.present === true)
  assert('high freq + shallow → shallow_share 1', s.shallow_share === 1)
  assert('high freq + shallow → short median', (s.median_input_length ?? 999) <= DEPENDENCE_DEFAULTS.maxMedianLength)
}

// 4. High frequency + deep/long inputs → healthy heavy user → NOT present.
{
  const longDeliberate = 'A'.repeat(400)
  const s = detectFrameworkDependence(make(40, longDeliberate, 'deliberate'))
  assert('high freq + deep → present:false', s.present === false)
  assert('high freq + deep → low shallow_share', (s.shallow_share ?? 1) === 0)
  assert('high freq + deep → long median over bound', (s.median_input_length ?? 0) > DEPENDENCE_DEFAULTS.maxMedianLength)
}

// 5. Thresholds echoed for verification.
{
  const s = detectFrameworkDependence([])
  assert('thresholds: window_days', s.thresholds.window_days === DEPENDENCE_DEFAULTS.windowDays)
  assert('thresholds: min_frequency', s.thresholds.min_frequency === DEPENDENCE_DEFAULTS.minFrequency)
}

// 6. Custom options honoured (override frequency down → present).
{
  const s = detectFrameworkDependence(make(5, 'hi', 'habitual'), { minFrequency: 3 })
  assert('custom minFrequency honoured → present:true', s.present === true)
}

console.log(`\nR20b detection: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
