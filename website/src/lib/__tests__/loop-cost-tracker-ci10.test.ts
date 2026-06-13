/**
 * loop-cost-tracker-ci10.test.ts — CI-10 gate loop metering (FX-16).
 *
 * Run via:
 *   npx tsx website/src/lib/__tests__/loop-cost-tracker-ci10.test.ts
 *
 * No --env-file needed: exercises the pure metering primitives only
 * (createLoopAccumulator with the new 'api_guardrail' surface, addCall,
 * getState, buildLoopHeaders, estimateCallCostCents). The persistence path
 * (finalizeLoopResponse → recordLoopBilling → Supabase RPC) is proved in the
 * founder-walked TEST live leg, exactly as the original loop-cost-tracker.test.ts
 * defers it.
 *
 * COVERAGE
 *   C10-1  the accumulator accepts surface 'api_guardrail' (the new emitter)
 *   C10-2  addCall from real token usage accrues cost + call count + model
 *   C10-3  the gate's CI-8 cost math: estimateCallCostCents(haiku, in, out)/100
 *          yields a sane sub-cent USD figure (what meta.cost_usd reports)
 *   C10-4  buildLoopHeaders over the gate's state emits all six X-Loop-* headers
 *          with X-Anthropic-Cost-Cents reflecting the accrued cost
 *   C10-5  a cache-hit gate call (no addCall) → zero cost, headers report 0
 *          (the honest figure: no fresh LLM call was made)
 *
 * Exit code 0 = all pass.
 */

import {
  createLoopAccumulator,
  buildLoopHeaders,
  estimateCallCostCents,
} from '../loop-cost-tracker'

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

const HAIKU = 'claude-haiku-4-5-20251001'

// C10-1 — the new gate surface is accepted by the accumulator factory.
{
  const acc = createLoopAccumulator({ loopId: 'l1', apiKeyId: 'k1', surface: 'api_guardrail', agentId: 'agent_x' })
  assert('C10-1  accumulator accepts surface api_guardrail', acc.surface === 'api_guardrail')
}

// C10-2 — addCall accrues from real token usage (the gate's path).
{
  const acc = createLoopAccumulator({ loopId: 'l2', apiKeyId: 'k1', surface: 'api_guardrail', agentId: null })
  acc.addCall(HAIKU, 700, 300)
  const s = acc.getState()
  assert('C10-2a  anthropic_cost_cents > 0 after addCall', s.anthropic_cost_cents > 0, `cents=${s.anthropic_cost_cents}`)
  assert('C10-2b  internal_calls counted', s.internal_calls === 1)
  assert('C10-2c  total tokens accrued', s.total_input_tokens === 700 && s.total_output_tokens === 300)
  assert('C10-2d  model recorded', s.models_used.length === 1 && s.models_used[0] === HAIKU)
}

// C10-3 — the gate's CI-8 cost figure: cents/100 = USD, sane sub-cent value.
{
  const usd = estimateCallCostCents(HAIKU, 700, 300) / 100
  // (700/1M*$1 + 300/1M*$5) = $0.0007 + $0.0015 = $0.0022
  assert('C10-3  gate measured cost is a sane sub-cent USD', usd > 0 && usd < 0.01, `usd=${usd}`)
}

// C10-4 — headers over the gate's accumulator state.
{
  const acc = createLoopAccumulator({ loopId: 'l3', apiKeyId: 'k1', surface: 'api_guardrail', agentId: null })
  acc.addCall(HAIKU, 700, 300)
  const state = acc.getState()
  const h = buildLoopHeaders({ loopId: 'l3', state })
  const keys = ['X-Loop-Id', 'X-Loop-Cost-Cents', 'X-Anthropic-Cost-Cents', 'X-Overage-Fired', 'X-Overage-Cents', 'X-Loop-Internal-Calls']
  for (const k of keys) assert(`C10-4  header "${k}" present`, k in h)
  assert('C10-4  X-Anthropic-Cost-Cents reflects accrued cost', Number(h['X-Anthropic-Cost-Cents']) === Math.round(state.anthropic_cost_cents))
}

// C10-5 — a cache-hit gate call makes no addCall: zero cost is the honest figure.
{
  const acc = createLoopAccumulator({ loopId: 'l4', apiKeyId: 'k1', surface: 'api_guardrail', agentId: null })
  const state = acc.getState()
  const h = buildLoopHeaders({ loopId: 'l4', state })
  assert('C10-5a  no addCall → zero anthropic cost', state.anthropic_cost_cents === 0)
  assert('C10-5b  headers report zero anthropic cost', h['X-Anthropic-Cost-Cents'] === '0')
  assert('C10-5c  zero internal calls', h['X-Loop-Internal-Calls'] === '0')
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
