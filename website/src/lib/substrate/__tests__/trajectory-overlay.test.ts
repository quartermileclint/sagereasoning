/**
 * trajectory-overlay.test.ts — CI-5 read half (mechanism-correction M7, 2026-06-14).
 *
 * Plain-assertion script: npx tsx <this file>   (bare — pure module, no Supabase
 * chain; only type-only imports cross the store boundary so getAdminClient() is
 * never reached).
 *
 * Proves the overlay is HONEST (D17 bands; single_snapshot on sparse evidence;
 * kathekon rate a documented lower bound) and DETERMINISTIC (a fixed window →
 * byte-identical overlay; the aggregator's computed_at is NEVER surfaced; the
 * evidence span is clock-free, from the rows' own timestamps).
 */

import type { EvaluatedAction } from '../trust-layer/types/evaluation'
import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'
import type { TrajectoryWindow } from '../agent-assessment-history-store'
import { computeTrajectoryOverlay } from '../trajectory-overlay'

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
// Fixtures
// ============================================================================

function mkAction(
  proximity: KatorthomaProximityLevel,
  o: Partial<EvaluatedAction> = {},
): EvaluatedAction {
  return {
    receipt_id: 'r',
    agent_id: 'api_key:k',
    evaluated_at: '2026-06-14T00:00:00.000Z',
    proximity,
    is_kathekon: true,
    kathekon_quality: 'strong',
    passions_detected: [],
    virtue_domains_engaged: [],
    oikeiosis_met: null,
    oikeiosis_stage: null,
    ruling_faculty_state: '',
    skill_id: 'api_reason',
    candidates_considered: 1,
    ...o,
  }
}

function win(
  actions: EvaluatedAction[],
  earliest: string | null = null,
  latest: string | null = null,
): TrajectoryWindow {
  return { actions, windowDays: 90, maxInstances: 30, earliest, latest }
}

function repeat(p: KatorthomaProximityLevel, n: number): EvaluatedAction[] {
  return Array.from({ length: n }, () => mkAction(p))
}

// Day arithmetic for span fixtures.
const DAY = 86_400_000
const base = Date.parse('2026-06-14T00:00:00.000Z')
const iso = (offsetDays: number): string => new Date(base + offsetDays * DAY).toISOString()

// ============================================================================
// 1. Empty window — no prior instances (fresh credential)
// ============================================================================

{
  const o = computeTrajectoryOverlay(win([]))
  assert(o.schema === 'agent-trajectory-overlay-v1', 'empty: schema tag')
  assert(o.prior_instances === 0, 'empty: prior_instances 0')
  assert(o.evidence === 'single_snapshot', 'empty: single_snapshot (no trajectory yet)')
  assert(o.confidence_weighted === 'low', 'empty: confidence low')
  assert(o.direction_of_travel === 'stable', 'empty: direction stable')
  assert(o.typical_proximity === 'reflexive', 'empty: typical_proximity reflexive (default)')
  assert(o.kathekon_compliance_rate === 0, 'empty: kathekon rate 0')
  assert(o.evidence_span_days === 0, 'empty: span 0')
  assert(o.window_days === 90 && o.max_instances === 30, 'empty: window params echoed')
  assert(o.kathekon_rate_basis === 'lower_bound', 'empty: kathekon basis flagged lower_bound')
}

// ============================================================================
// 2. Sparse evidence — single_snapshot until ≥2 prior; low until ≥3
// ============================================================================

{
  const o1 = computeTrajectoryOverlay(win([mkAction('deliberate')], iso(0), iso(0)))
  assert(o1.prior_instances === 1, '1 prior: count 1')
  assert(o1.evidence === 'single_snapshot', '1 prior: single_snapshot')
  assert(o1.confidence_weighted === 'low', '1 prior: low')

  const o2 = computeTrajectoryOverlay(win(repeat('deliberate', 2), iso(0), iso(1)))
  assert(o2.evidence === 'windowed', '2 prior: windowed (≥2)')
  assert(o2.confidence_weighted === 'low', '2 prior: still low (<3)')

  const o3 = computeTrajectoryOverlay(win(repeat('deliberate', 3), iso(0), iso(2)))
  assert(o3.confidence_weighted === 'medium', '3 prior: medium')

  const o9 = computeTrajectoryOverlay(win(repeat('deliberate', 9), iso(0), iso(8)))
  assert(o9.confidence_weighted === 'medium', '9 prior: medium')
}

// ============================================================================
// 3. High confidence requires ≥10 AND a ≥60-day longitudinal spread
// ============================================================================

{
  const wide = computeTrajectoryOverlay(win(repeat('deliberate', 12), iso(0), iso(73)))
  assert(wide.confidence_weighted === 'high', '12 prior + 73d span: high')
  assert(wide.evidence_span_days === 73, '12 prior: span surfaced (73d)')

  const narrow = computeTrajectoryOverlay(win(repeat('deliberate', 12), iso(0), iso(13)))
  assert(narrow.confidence_weighted === 'medium', '12 prior + 13d span: medium (sub-60-day)')

  // Exactly 60 days → high (boundary inclusive).
  const edge = computeTrajectoryOverlay(win(repeat('deliberate', 10), iso(0), iso(60)))
  assert(edge.confidence_weighted === 'high', '10 prior + exactly 60d: high (≥60 inclusive)')
}

// ============================================================================
// 4. direction_of_travel — aggregator honesty (stable until ≥10; then real)
// ============================================================================

{
  const fewStable = computeTrajectoryOverlay(win(repeat('principled', 5), iso(0), iso(4)))
  assert(fewStable.direction_of_travel === 'stable', '<10 actions: direction stable (honest)')

  // 12 rising: first 6 reflexive, last 6 deliberate → improving.
  const rising = [...repeat('reflexive', 6), ...repeat('deliberate', 6)]
  const up = computeTrajectoryOverlay(win(rising, iso(0), iso(70)))
  assert(up.direction_of_travel === 'improving', '12 rising: improving')

  // 12 falling: first 6 deliberate, last 6 reflexive → regressing.
  const falling = [...repeat('deliberate', 6), ...repeat('reflexive', 6)]
  const down = computeTrajectoryOverlay(win(falling, iso(0), iso(70)))
  assert(down.direction_of_travel === 'regressing', '12 falling: regressing')
}

// ============================================================================
// 5. typical_proximity + proximity_distribution
// ============================================================================

{
  const o = computeTrajectoryOverlay(
    win([...repeat('deliberate', 8), ...repeat('reflexive', 2)], iso(0), iso(9)),
  )
  // 80% deliberate-or-above ≥ 0.6 threshold → typical 'deliberate'.
  assert(o.typical_proximity === 'deliberate', 'typical_proximity: 80% deliberate → deliberate')
  assert(o.proximity_distribution.deliberate === 8, 'distribution: 8 deliberate')
  assert(o.proximity_distribution.reflexive === 2, 'distribution: 2 reflexive')
  assert(o.proximity_distribution.sage_like === 0, 'distribution: 0 sage_like')
}

// ============================================================================
// 6. kathekon_compliance_rate is a documented LOWER BOUND
// ============================================================================

{
  // 6 kathekon + 4 not (or undecidable) → rate 0.6.
  const mixed = [
    ...repeat('deliberate', 6),
    ...Array.from({ length: 4 }, () => mkAction('reflexive', { is_kathekon: false })),
  ]
  const o = computeTrajectoryOverlay(win(mixed, iso(0), iso(9)))
  assert(Math.abs(o.kathekon_compliance_rate - 0.6) < 1e-9, 'kathekon rate: 6/10 = 0.6')
  assert(o.kathekon_rate_basis === 'lower_bound', 'kathekon basis: lower_bound (false = not-appropriate OR undecidable)')
}

// ============================================================================
// 7. DETERMINISM — fixed window → byte-identical overlay; no computed_at leak
// ============================================================================

{
  const actions = [...repeat('deliberate', 7), ...repeat('principled', 5)]
  const w = win(actions, iso(0), iso(65))
  const a = computeTrajectoryOverlay(w)
  const b = computeTrajectoryOverlay(w)
  assert(JSON.stringify(a) === JSON.stringify(b), 'determinism: same window → byte-identical overlay')
  assert(!JSON.stringify(a).includes('computed_at'), 'determinism: computed_at NEVER surfaced (the aggregator clock read is stripped)')
  // Two independently constructed but equal windows also agree.
  const w2 = win([...repeat('deliberate', 7), ...repeat('principled', 5)], iso(0), iso(65))
  assert(
    JSON.stringify(computeTrajectoryOverlay(w2)) === JSON.stringify(a),
    'determinism: equal windows → equal overlays',
  )
}

// ============================================================================
// Tally
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
