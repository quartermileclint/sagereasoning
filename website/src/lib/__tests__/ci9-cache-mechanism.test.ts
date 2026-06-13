/**
 * ci9-cache-mechanism.test.ts — CI-9 diagnostic mechanism proof (FX-15).
 *
 * Run via:
 *   npx tsx website/src/lib/__tests__/ci9-cache-mechanism.test.ts
 *
 * No --env-file needed: exercises ONLY the pure model-config cache helpers
 * (cacheKey, cacheGet, cacheSet). This is the DETERMINISTIC half of the CI-9
 * diagnostic — it proves the *mechanism* that produces a sub-100ms
 * `ai_generated:true` gate verdict. The empirical attribution of the specific
 * P1 46ms/20,015ms pair is the founder-walked replay (scripts/ci9-gate-replay.ts).
 *
 * COVERAGE
 *   CACHE-1  cacheGet after cacheSet returns the stored value
 *   CACHE-2  cacheGet on an unseen key is a miss (undefined)
 *   CACHE-3  a warm cacheGet is effectively instant (the "0ms" claim) — 1000
 *            lookups complete well under the tens-of-ms a real call costs
 *   COLLIDE-1  identical (endpoint,input,context,domain_context,depth) → identical key
 *   COLLIDE-2  the gate's three risk-class domain_contexts each collide with
 *              themselves but not each other (the within-gate hit condition)
 *   COLLIDE-3  a changed field → a different key (no false collision)
 *   COLLIDE-4  the key is namespaced by the endpoint string runSageReason passes
 *              ('/api/reason') — proving cross-caller sharing is by endpoint+args
 *
 * Exit code 0 = all pass.
 */

import { cacheKey, cacheGet, cacheSet } from '../model-config'

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

// ---------------------------------------------------------------------------
// CACHE-1 / CACHE-2 — basic hit/miss
// ---------------------------------------------------------------------------
{
  const k = cacheKey('/api/reason', { input: 'gate-test-1', depth: 'quick' })
  assert('CACHE-2  unseen key is a miss', cacheGet(k) === undefined)
  cacheSet(k, { katorthoma_proximity: 'deliberate', verdict: 'stored' })
  const got = cacheGet(k) as Record<string, unknown> | undefined
  assert('CACHE-1  hit returns the stored value', !!got && got.verdict === 'stored')
}

// ---------------------------------------------------------------------------
// CACHE-3 — a warm hit is effectively instant. This is the FX-15 mechanism:
// runSageReason returns from cacheGet BEFORE any LLM call, so the verdict's
// latency_ms reflects only route overhead (tens of ms), not a generation.
// ---------------------------------------------------------------------------
{
  const k = cacheKey('/api/reason', { input: 'gate-timing', depth: 'quick' })
  cacheSet(k, { v: 1 })
  const start = performance.now()
  for (let i = 0; i < 1000; i++) cacheGet(k)
  const elapsedMs = performance.now() - start
  assert(
    'CACHE-3  1000 warm lookups complete in < 25ms (a single hit is ~instant)',
    elapsedMs < 25,
    `elapsed=${elapsedMs.toFixed(3)}ms for 1000 lookups`,
  )
}

// ---------------------------------------------------------------------------
// COLLIDE-1 — identical inputs → identical key (the collision precondition).
// ---------------------------------------------------------------------------
{
  const a = cacheKey('/api/reason', { input: 'x', context: 'y', domain_context: 'z', depth: 'quick' })
  const b = cacheKey('/api/reason', { input: 'x', context: 'y', domain_context: 'z', depth: 'quick' })
  assert('COLLIDE-1  identical args → identical key', a === b)
}

// ---------------------------------------------------------------------------
// COLLIDE-2 — the gate's three fixed risk-class domain_contexts. Two gate calls
// with the same action+context+risk_class collide (→ warm hit); different
// risk_class does not. (Strings mirror guardrail/route.ts:131-135 shape.)
// ---------------------------------------------------------------------------
{
  const standardDC = 'This is a binary safety gate evaluation. Determine if this action should proceed based on Stoic virtue alignment.'
  const criticalDC = 'This is a CRITICAL safety gate evaluation...'
  const action = 'Send marketing emails to all users'
  const k1 = cacheKey('/api/reason', { input: action, domain_context: standardDC, depth: 'quick' })
  const k2 = cacheKey('/api/reason', { input: action, domain_context: standardDC, depth: 'quick' })
  const k3 = cacheKey('/api/reason', { input: action, domain_context: criticalDC, depth: 'deep' })
  assert('COLLIDE-2a  same action + same risk-class domain_context → same key (warm hit)', k1 === k2)
  assert('COLLIDE-2b  different risk-class → different key (no hit)', k1 !== k3)
}

// ---------------------------------------------------------------------------
// COLLIDE-3 — a changed field yields a different key (no false collision).
// ---------------------------------------------------------------------------
{
  const a = cacheKey('/api/reason', { input: 'x', depth: 'quick' })
  const b = cacheKey('/api/reason', { input: 'x2', depth: 'quick' })
  assert('COLLIDE-3  changed input → different key', a !== b)
}

// ---------------------------------------------------------------------------
// COLLIDE-4 — the key is endpoint-namespaced. runSageReason hardcodes
// '/api/reason' for EVERY caller (sage-reason-engine.ts:487), so the gate's
// entries live under '/api/reason'. Two callers passing the SAME endpoint
// label + args share an entry; a different endpoint label does not.
// (This documents diagnostic candidate-fix #2: namespace by the real endpoint.)
// ---------------------------------------------------------------------------
{
  const asReason = cacheKey('/api/reason', { input: 'shared', depth: 'quick' })
  const asGuardrail = cacheKey('/api/guardrail', { input: 'shared', depth: 'quick' })
  assert('COLLIDE-4a  same endpoint label + args → shared key', asReason === cacheKey('/api/reason', { input: 'shared', depth: 'quick' }))
  assert('COLLIDE-4b  a real per-endpoint label WOULD separate entries', asReason !== asGuardrail)
}

console.log('')
console.log('='.repeat(70))
console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
if (failCount > 0) {
  console.log('')
  console.log('FAILURES:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
process.exit(0)
