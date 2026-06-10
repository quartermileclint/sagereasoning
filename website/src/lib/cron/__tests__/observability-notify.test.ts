/**
 * Plain-assertion test for the A13 cron notify logic (no Jest; run with tsx).
 *   cd website && npx tsx src/lib/cron/__tests__/observability-notify.test.ts
 * No Supabase import → plain `npx tsx` (no --env-file needed).
 */
import {
  shouldNotify,
  totalFired,
  formatSweepMessage,
  type EvaluatorOutcome,
} from '../observability-notify'

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

const clear: EvaluatorOutcome[] = [
  { name: 'cost-alerts', ok: true, httpStatus: 200, fired: 0, items: [] },
  { name: 'abuse', ok: true, httpStatus: 200, fired: 0, items: [] },
]
const oneFired: EvaluatorOutcome[] = [
  {
    name: 'cost-alerts',
    ok: true,
    httpStatus: 200,
    fired: 1,
    items: [{ type: 'per_identity_anomaly', scope: 'agent_x', severity: 'warning', message: 'spend 3.2× baseline', multiple: 3.2 }],
  },
  { name: 'abuse', ok: true, httpStatus: 200, fired: 0, items: [] },
]
const errored: EvaluatorOutcome[] = [
  { name: 'cost-alerts', ok: true, httpStatus: 200, fired: 0, items: [] },
  { name: 'abuse', ok: false, httpStatus: 503, fired: 0, items: [], error: 'disabled' },
]

console.log('observability-notify')

// shouldNotify
check('clear run does NOT notify', shouldNotify(clear, false) === false)
check('clear run notifies when isTest', shouldNotify(clear, true) === true)
check('a fire notifies', shouldNotify(oneFired, false) === true)
check('an evaluator error notifies', shouldNotify(errored, false) === true)

// totalFired
check('totalFired sums across evaluators', totalFired(oneFired) === 1)
check('totalFired is 0 on a clear run', totalFired(clear) === 0)

// formatSweepMessage
const testMsg = formatSweepMessage(clear, { isTest: true, dateIso: '2026-06-09' })
check('test message names DELIVERY TEST', testMsg.includes('DELIVERY TEST'))
check('test message explains the path', testMsg.toLowerCase().includes('delivery path works'))

const firedMsg = formatSweepMessage(oneFired, { isTest: false, dateIso: '2026-06-09' })
check('fired message names the detector', firedMsg.includes('per_identity_anomaly'))
check('fired message shows the multiple', firedMsg.includes('3.2×'))
check('fired message shows the scope', firedMsg.includes('agent_x'))
check('fired message points to the evaluators', firedMsg.includes('/api/abuse/evaluate'))

const errMsg = formatSweepMessage(errored, { isTest: false, dateIso: '2026-06-09' })
check('error message flags COULD NOT EVALUATE', errMsg.includes('COULD NOT EVALUATE'))
check('error message includes the HTTP status', errMsg.includes('HTTP 503'))

console.log(`\nobservability-notify: ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
