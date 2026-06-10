/**
 * Plain-assertion test for the A14 SLO stats (no Jest; run with tsx).
 *   cd website && npx tsx src/lib/slo/__tests__/slo-stats.test.ts
 * No Supabase import → plain `npx tsx` (no --env-file needed).
 */
import {
  totalLatencyMs,
  percentile,
  summariseLatency,
  buildSloHealth,
  type LatencyRow,
} from '../slo-stats'

let pass = 0
let fail = 0
function check(name: string, cond: boolean) {
  if (cond) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.log(`  ✗ ${name}`)
  }
}

console.log('slo-stats')

// totalLatencyMs
check('sums present layers', totalLatencyMs({ layer1_latency_ms: 100, layer2_latency_ms: 5, layer3_latency_ms: 200, occurred_at: 'x' }) === 305)
check('ignores null layers', totalLatencyMs({ layer1_latency_ms: 100, layer2_latency_ms: null, layer3_latency_ms: null, occurred_at: 'x' }) === 100)
check('all-null → null', totalLatencyMs({ layer1_latency_ms: null, layer2_latency_ms: null, layer3_latency_ms: null, occurred_at: 'x' }) === null)

// percentile (nearest-rank)
const ten = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
check('empty → null', percentile([], 95) === null)
check('p95 of 1..10 = 10', percentile(ten, 95) === 10)
check('p50 of 1..10 = 5', percentile(ten, 50) === 5)
check('p0 = min', percentile(ten, 0) === 1)
check('p100 = max', percentile(ten, 100) === 10)
check('single value', percentile([42], 95) === 42)

// summariseLatency
const rows: LatencyRow[] = [
  { layer1_latency_ms: 100, layer2_latency_ms: 0, layer3_latency_ms: 100, occurred_at: '2026-06-09T00:00:00Z' }, // 200
  { layer1_latency_ms: 300, layer2_latency_ms: 0, layer3_latency_ms: 200, occurred_at: '2026-06-09T00:00:00Z' }, // 500
  { layer1_latency_ms: 50, layer2_latency_ms: 0, layer3_latency_ms: 50, occurred_at: '2026-06-09T00:00:00Z' }, // 100
  { layer1_latency_ms: null, layer2_latency_ms: null, layer3_latency_ms: null, occurred_at: '2026-06-09T00:00:00Z' }, // dropped
]
const s = summariseLatency(rows)
check('count excludes the all-null row', s.count === 3)
check('max is the largest total', s.max_ms === 500)
check('p50 is the median total', s.p50_ms === 200)
check('empty rows → zero/null stats', summariseLatency([]).count === 0 && summariseLatency([]).p95_ms === null)

// buildSloHealth — window filtering + provisional posture
const now = Date.UTC(2026, 5, 9, 12, 0, 0) // 2026-06-09T12:00:00Z
const withOld: LatencyRow[] = [
  { layer1_latency_ms: 100, layer2_latency_ms: 0, layer3_latency_ms: 100, occurred_at: '2026-06-09T00:00:00Z' }, // recent
  { layer1_latency_ms: 100, layer2_latency_ms: 0, layer3_latency_ms: 100, occurred_at: '2026-01-01T00:00:00Z' }, // > 7d old
]
const h = buildSloHealth(withOld, now)
check('all_time counts every row', h.windows.all_time.count === 2)
check('last_7d excludes the old row', h.windows.last_7d.count === 1)
check('flagged provisional', h.provisional === true)
check('note warns about sparse data', h.note.toLowerCase().includes('sparse'))
check('surface defaults to api_reason', h.surface === 'api_reason')
check('targets carry the AC2/policy source', h.slo_targets.source.includes('AC2'))
check('quick target is 3000ms', h.slo_targets.reason_quick_haiku_p95_ms === 3000)

console.log(`\nslo-stats: ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
