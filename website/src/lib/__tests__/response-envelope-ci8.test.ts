/**
 * response-envelope-ci8.test.ts — CI-8 gate-meta cost honesty (FX-14).
 *
 * Run via:
 *   npx tsx website/src/lib/__tests__/response-envelope-ci8.test.ts
 *
 * No --env-file needed: buildEnvelope + estimateCostUsd are pure.
 *
 * CI-8: the gate must stop reporting the retired competitor-anchored $0.0025 as
 * a measured per-call cost. The fix is a `costUsd` override on buildEnvelope —
 * the gate passes its measured Anthropic cost (or null on a cache hit). The
 * competitor-anchored constant is intentionally RETAINED for the human-tool
 * routes that surface a customer price (fleet-wide price-vs-cost = open question).
 *
 * COVERAGE
 *   C8-1  estimateCostUsd haiku still returns the customer price 0.0025 (retained)
 *   C8-2  buildEnvelope WITHOUT costUsd → legacy estimate (non-gate callers unchanged)
 *   C8-3  buildEnvelope WITH a measured costUsd → meta.cost_usd is the override (NOT 0.0025)
 *   C8-4  buildEnvelope WITH costUsd:null → meta.cost_usd is null (honest omission)
 *   C8-5  isDeterministic + no costUsd → null (unchanged)
 *   C8-6  costUsd override wins even over isDeterministic
 *   C8-7  GATE shape: haiku model + measured costUsd + cost_basis extra →
 *         meta.cost_usd === measured (no 0.0025) AND meta.cost_basis present
 *
 * Exit code 0 = all pass.
 */

import { buildEnvelope, estimateCostUsd } from '../response-envelope'

let passCount = 0
let failCount = 0
const failures: string[] = []

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const ok = actual === expected
  if (ok) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = `${label} — expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

const HAIKU = 'claude-haiku-4-5-20251001'

// C8-1 — the customer-price constant is intentionally retained.
assertEqual('C8-1  estimateCostUsd(haiku) retains the customer price 0.0025', estimateCostUsd(HAIKU, 512), 0.0025)

// C8-2 — non-gate callers (no override) keep the legacy estimate.
{
  const env = buildEnvelope({ result: {}, endpoint: '/api/score-decision', model: HAIKU, startTime: Date.now(), maxTokens: 512 })
  assertEqual('C8-2  no override → legacy estimate (0.0025) preserved for non-gate callers', env.meta.cost_usd, 0.0025)
}

// C8-3 — a measured override wins; the stale price is gone.
{
  const env = buildEnvelope({ result: {}, endpoint: '/api/guardrail', model: HAIKU, startTime: Date.now(), maxTokens: 512, costUsd: 0.00331 })
  assertEqual('C8-3  measured costUsd override is reported (not 0.0025)', env.meta.cost_usd, 0.00331)
}

// C8-4 — null override = honest omission.
{
  const env = buildEnvelope({ result: {}, endpoint: '/api/guardrail', model: HAIKU, startTime: Date.now(), maxTokens: 512, costUsd: null })
  assertEqual('C8-4  costUsd:null → meta.cost_usd null (omitted)', env.meta.cost_usd, null)
}

// C8-5 — deterministic endpoints unchanged.
{
  const env = buildEnvelope({ result: {}, endpoint: '/api/context', model: HAIKU, startTime: Date.now(), maxTokens: 0, isDeterministic: true })
  assertEqual('C8-5  isDeterministic + no override → null', env.meta.cost_usd, null)
}

// C8-6 — override wins over isDeterministic.
{
  const env = buildEnvelope({ result: {}, endpoint: '/api/x', model: HAIKU, startTime: Date.now(), maxTokens: 0, isDeterministic: true, costUsd: 0.5 })
  assertEqual('C8-6  override beats isDeterministic', env.meta.cost_usd, 0.5)
}

// C8-7 — the gate's exact shape: measured cost + cost_basis note, no 0.0025.
{
  const env = buildEnvelope({
    result: { proceed: true },
    endpoint: '/api/guardrail',
    model: HAIKU,
    startTime: Date.now(),
    maxTokens: 512,
    costUsd: 0.00331,
    extra: { cost_basis: 'anthropic_usd_measured' },
  })
  assertEqual('C8-7a  gate meta.cost_usd is the measured value', env.meta.cost_usd, 0.00331)
  assertEqual('C8-7b  gate meta no longer reports 0.0025', env.meta.cost_usd === 0.0025, false)
  assertEqual('C8-7c  gate carries an honest cost_basis note', (env.meta as Record<string, unknown>).cost_basis, 'anthropic_usd_measured')
}

// C8-8 — REGRESSION PROXY for the six non-gate buildEnvelope callers (the score
// routes). The costUsd option is additive/optional; a no-override call must
// still produce the complete legacy meta shape with every required field, and
// cost_usd must remain the legacy estimate. This stands in for route-level
// integration coverage of /api/score, /api/score-decision, /api/score-scenario,
// /api/score-conversation, /api/score-document, /api/score-iterate (untouched).
{
  const env = buildEnvelope({ result: { ok: true }, endpoint: '/api/score-decision', model: HAIKU, startTime: Date.now() - 5, maxTokens: 512 })
  const m = env.meta as Record<string, unknown>
  const requiredKeys = ['endpoint', 'ai_model', 'ai_generated', 'latency_ms', 'cost_usd', 'is_deterministic', 'evaluated_at']
  for (const k of requiredKeys) {
    assertEqual(`C8-8  legacy envelope still carries "${k}"`, k in m, true)
  }
  assertEqual('C8-8  legacy cost_usd unchanged (0.0025)', m.cost_usd, 0.0025)
  assertEqual('C8-8  ai_generated still true', m.ai_generated, true)
  assertEqual('C8-8  is_deterministic still false', m.is_deterministic, false)
  assertEqual('C8-8  endpoint preserved', m.endpoint, '/api/score-decision')
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
