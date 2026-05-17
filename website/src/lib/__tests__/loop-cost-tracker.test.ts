/**
 * loop-cost-tracker.test.ts — Option D per-loop billing primitives test.
 *
 * Run via:
 *   npx tsx website/src/lib/__tests__/loop-cost-tracker.test.ts
 *
 * No --env-file needed: this test exercises ONLY the pure helpers
 * (estimateCallCostCents, createLoopAccumulator, computeLoopBill from
 * stripe.ts, extractLoopId, generateLoopId, buildLoopHeaders). The
 * persistence path (recordLoopBilling, finalizeLoopResponse) is exercised by
 * the post-deploy founder verification (Step 12) — those functions call
 * Supabase RPC + construct NextResponse, both better proved end-to-end than
 * in plain-tsx unit tests.
 *
 * COVERAGE
 *
 *   estimateCallCostCents
 *     EST-1  Haiku 4.5 — typical (2000 in, 200 out) ≈ $0.003 = 0.3 cents
 *     EST-2  Sonnet 4.6 — typical (2000 in, 500 out) ≈ $0.0135 = 1.35 cents
 *     EST-3  Zero tokens → 0 cents
 *     EST-4  Unknown model → 0 cents (warned-once; not thrown)
 *     EST-5  Aliased model name resolves (haiku-4-5 = claude-haiku-4-5)
 *     EST-6  Linearity — 2× tokens = 2× cost (within rounding)
 *
 *   computeLoopBill (Decision D worked examples from /adopted/billing-model-design.md)
 *     BILL-1  $0.005 Anthropic cost (typical) → bill $0.02, ratio 4.0×, no overage
 *     BILL-2  $0.010 Anthropic cost (threshold) → bill $0.02, ratio 2.0×, no overage
 *     BILL-3  $0.020 Anthropic cost → bill $0.04, ratio 2.0×, overage fired
 *     BILL-4  $0.030 Anthropic cost → bill $0.06, ratio 2.0×, overage fired
 *     BILL-5  $0 Anthropic cost (R20a redirect, early return) → bill $0.02 base only
 *     BILL-6  Float input rounds to integer cents at the comparison boundary
 *     BILL-7  R5 floor — total_cents / anthropic_cost is always ≥ 2× when > base
 *
 *   createLoopAccumulator (per-request scope; KG1 rule 4)
 *     ACC-1  Fresh accumulator starts at zero across all state fields
 *     ACC-2  addCall increments Anthropic cost from token counts
 *     ACC-3  addCall increments internal_calls + total tokens
 *     ACC-4  addCall deduplicates models_used (first occurrence wins)
 *     ACC-5  addPrecomputedCall increments cost directly without token-derive
 *     ACC-6  getState returns a defensive copy (caller cannot mutate models_used)
 *     ACC-7  Multiple addCalls accumulate correctly across mixed models
 *     ACC-8  Two accumulators are independent (no module-level state — KG1 rule 4)
 *
 *   extractLoopId (UUIDv4 header validation per Decision A)
 *     EX-1   Missing X-Loop-Id header → null (caller auto-generates)
 *     EX-2   Valid UUIDv4 → extracted, lowercased
 *     EX-3   Malformed UUID → null + warn (soft fallback per current shape)
 *     EX-4   Empty string → null
 *     EX-5   Mixed case UUIDv4 → extracted and lowercased
 *
 *   generateLoopId
 *     GEN-1  Returns a valid UUIDv4 (passes the regex)
 *     GEN-2  Two calls return different IDs (no collision in steady state)
 *
 *   buildLoopHeaders (Decision H — six X-Loop-* headers)
 *     HDR-1  loopId only — returns six headers, cost fields zeroed
 *     HDR-2  With state — X-Anthropic-Cost-Cents = rounded accumulator cost
 *     HDR-3  With bill fields — X-Loop-Cost-Cents, X-Overage-Fired, X-Overage-Cents reflect bill
 *     HDR-4  All six header keys present and named per Decision H
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  estimateCallCostCents,
  createLoopAccumulator,
  extractLoopId,
  generateLoopId,
  buildLoopHeaders,
} from '../loop-cost-tracker'
import { computeLoopBill, OPTION_D_BILLING } from '../stripe'

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
  assert(label, ok, ok ? undefined : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`)
}

function assertClose(label: string, actual: number, expected: number, epsilon = 0.01): void {
  const diff = Math.abs(actual - expected)
  const ok = diff < epsilon
  assert(label, ok, ok ? undefined : `expected≈${expected} (ε=${epsilon}), actual=${actual} (diff=${diff})`)
}

// ============================================================================
// estimateCallCostCents
// ============================================================================

// EST-1 Haiku typical: 2000 input + 200 output tokens at $1/$5 per million.
// Expected: (2000/1M × $1 + 200/1M × $5) × 100 cents = 0.2 + 0.1 = 0.3 cents
{
  const cost = estimateCallCostCents('claude-haiku-4-5-20251001', 2000, 200)
  assertClose('EST-1  Haiku 4.5 typical (2000 in, 200 out) ≈ 0.3 cents', cost, 0.3, 0.001)
}

// EST-2 Sonnet typical: 2000 input + 500 output at $3/$15 per million
// Expected: 0.6 + 0.75 = 1.35 cents
{
  const cost = estimateCallCostCents('claude-sonnet-4-6', 2000, 500)
  assertClose('EST-2  Sonnet 4.6 typical (2000 in, 500 out) ≈ 1.35 cents', cost, 1.35, 0.001)
}

// EST-3 Zero tokens → 0
assertEqual('EST-3  Zero tokens → 0 cents', estimateCallCostCents('claude-haiku-4-5', 0, 0), 0)

// EST-4 Unknown model → 0 (warn-once on stderr; non-throw)
assertEqual('EST-4  Unknown model → 0 cents', estimateCallCostCents('unknown-model-xyz', 1000, 100), 0)

// EST-5 Aliased model name resolves the same
{
  const a = estimateCallCostCents('claude-haiku-4-5', 1000, 100)
  const b = estimateCallCostCents('haiku-4-5', 1000, 100)
  assertEqual('EST-5  Aliased model name resolves identically', a, b)
}

// EST-6 Linearity — 2× tokens ≈ 2× cost
{
  const single = estimateCallCostCents('claude-sonnet-4-6', 1000, 100)
  const double = estimateCallCostCents('claude-sonnet-4-6', 2000, 200)
  assertClose('EST-6  Linearity — 2× tokens = 2× cost', double, single * 2, 0.0001)
}


// ============================================================================
// computeLoopBill — Decision D worked examples
// ============================================================================

// Cross-check OPTION_D_BILLING constants match the elected formula.
assertEqual('CONST-1  LOOP_BASE_RATE_CENTS = 2', OPTION_D_BILLING.LOOP_BASE_RATE_CENTS, 2)
assertEqual('CONST-2  OVERAGE_TRIGGER_RATIO = 0.5', OPTION_D_BILLING.OVERAGE_TRIGGER_RATIO, 0.5)
assertEqual('CONST-3  OVERAGE_RATE_MULTIPLIER = 2.0', OPTION_D_BILLING.OVERAGE_RATE_MULTIPLIER, 2.0)

// BILL-1  $0.005 Anthropic = 0.5 cents → below threshold (1 cent); bill = base = 2 cents
{
  const bill = computeLoopBill(0.5)
  assertEqual('BILL-1a  Typical loop — base = 2 cents', bill.base_cents, 2)
  assertEqual('BILL-1b  Typical loop — overage_cents = 0', bill.overage_cents, 0)
  assertEqual('BILL-1c  Typical loop — overage_fired = false', bill.overage_fired, false)
  assertEqual('BILL-1d  Typical loop — total_cents = 2', bill.total_cents, 2)
}

// BILL-2  $0.010 Anthropic = 1 cent (threshold) → no overage (excess = 0)
{
  const bill = computeLoopBill(1)
  assertEqual('BILL-2a  Threshold loop — overage_cents = 0', bill.overage_cents, 0)
  assertEqual('BILL-2b  Threshold loop — total_cents = 2', bill.total_cents, 2)
  assertEqual('BILL-2c  Threshold loop — overage_fired = false', bill.overage_fired, false)
}

// BILL-3  $0.020 Anthropic = 2 cents (above threshold by 1 cent)
//         → overage = 1 cent × 2 = 2 cents; total = 4 cents
{
  const bill = computeLoopBill(2)
  assertEqual('BILL-3a  Above threshold — overage_cents = 2', bill.overage_cents, 2)
  assertEqual('BILL-3b  Above threshold — total_cents = 4', bill.total_cents, 4)
  assertEqual('BILL-3c  Above threshold — overage_fired = true', bill.overage_fired, true)
  // Ratio = total / anthropic = 4 / 2 = 2.0× — at R5 floor
  assertEqual('BILL-3d  Above threshold — R5 ratio = 2.0×', bill.total_cents / 2, 2.0)
}

// BILL-4  $0.030 Anthropic = 3 cents (above threshold by 2 cents)
//         → overage = 2 cents × 2 = 4 cents; total = 6 cents; ratio 2.0×
{
  const bill = computeLoopBill(3)
  assertEqual('BILL-4a  Heavy loop — overage_cents = 4', bill.overage_cents, 4)
  assertEqual('BILL-4b  Heavy loop — total_cents = 6', bill.total_cents, 6)
  assertEqual('BILL-4c  Heavy loop — overage_fired = true', bill.overage_fired, true)
  assertEqual('BILL-4d  Heavy loop — R5 ratio = 2.0×', bill.total_cents / 3, 2.0)
}

// BILL-5  $0 Anthropic cost (R20a early return; no LLM call)
//         → bill = base = 2 cents (R9: work attempted)
{
  const bill = computeLoopBill(0)
  assertEqual('BILL-5a  Zero-cost loop — total_cents = 2', bill.total_cents, 2)
  assertEqual('BILL-5b  Zero-cost loop — overage_fired = false', bill.overage_fired, false)
}

// BILL-6  Float input rounds to integer cents at comparison
// 1.4 rounds to 1 (still threshold; no overage); 1.6 rounds to 2 (above; overage fires)
{
  assertEqual('BILL-6a  1.4 cents Anthropic → no overage (rounds to 1)', computeLoopBill(1.4).overage_fired, false)
  assertEqual('BILL-6b  1.6 cents Anthropic → overage fires (rounds to 2)', computeLoopBill(1.6).overage_fired, true)
}

// BILL-7  R5 floor — bill rises 2× as fast as Anthropic cost above threshold;
// total_cents/anthropic_cost asymptotes to 2× from above
{
  // 10 cents Anthropic: overage = (10-1) × 2 = 18; total = 20; ratio = 2.0×
  const bill10 = computeLoopBill(10)
  assertEqual('BILL-7a  10c Anthropic — total = 20c', bill10.total_cents, 20)
  // 100 cents Anthropic: overage = 99 × 2 = 198; total = 200; ratio = 2.0×
  const bill100 = computeLoopBill(100)
  assertEqual('BILL-7b  100c Anthropic — total = 200c', bill100.total_cents, 200)
  assertEqual('BILL-7c  R5 floor holds at scale — ratio = 2.0×', bill100.total_cents / 100, 2.0)
}


// ============================================================================
// createLoopAccumulator
// ============================================================================

// ACC-1 Fresh accumulator starts at zero across all state fields
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-000000000000',
    apiKeyId: 'test-key',
    surface: 'api_reason',
    agentId: null,
  })
  const state = acc.getState()
  assertEqual('ACC-1a  Fresh anthropic_cost_cents = 0', state.anthropic_cost_cents, 0)
  assertEqual('ACC-1b  Fresh internal_calls = 0', state.internal_calls, 0)
  assertEqual('ACC-1c  Fresh total_input_tokens = 0', state.total_input_tokens, 0)
  assertEqual('ACC-1d  Fresh total_output_tokens = 0', state.total_output_tokens, 0)
  assertEqual('ACC-1e  Fresh models_used = []', state.models_used.length, 0)
}

// ACC-2 + ACC-3 addCall increments cost from tokens + bumps internal_calls + tokens
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-000000000001',
    apiKeyId: 'test-key',
    surface: 'api_score_iterate',
    agentId: 'test-agent',
  })
  acc.addCall('claude-sonnet-4-6', 1000, 200)
  const s = acc.getState()
  assertClose('ACC-2  addCall increments cost', s.anthropic_cost_cents, estimateCallCostCents('claude-sonnet-4-6', 1000, 200), 0.0001)
  assertEqual('ACC-3a  addCall increments internal_calls', s.internal_calls, 1)
  assertEqual('ACC-3b  addCall increments input tokens', s.total_input_tokens, 1000)
  assertEqual('ACC-3c  addCall increments output tokens', s.total_output_tokens, 200)
}

// ACC-4 addCall deduplicates models_used
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-000000000002',
    apiKeyId: 'test-key',
    surface: 'api_reason',
  })
  acc.addCall('claude-sonnet-4-6', 100, 50)
  acc.addCall('claude-sonnet-4-6', 200, 100)  // same model
  acc.addCall('claude-haiku-4-5', 100, 50)    // different model
  const s = acc.getState()
  assertEqual('ACC-4a  Two distinct models recorded', s.models_used.length, 2)
  assert('ACC-4b  models_used contains Sonnet', s.models_used.includes('claude-sonnet-4-6'))
  assert('ACC-4c  models_used contains Haiku', s.models_used.includes('claude-haiku-4-5'))
}

// ACC-5 addPrecomputedCall increments cost directly without token-derive
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-000000000003',
    apiKeyId: 'test-key',
    surface: 'api_reason',
  })
  acc.addPrecomputedCall('claude-sonnet-4-6', 1.5)  // 1.5 cents direct
  const s = acc.getState()
  assertEqual('ACC-5a  addPrecomputedCall increments cost directly', s.anthropic_cost_cents, 1.5)
  assertEqual('ACC-5b  addPrecomputedCall increments internal_calls', s.internal_calls, 1)
  assertEqual('ACC-5c  addPrecomputedCall defaults tokens to 0', s.total_input_tokens, 0)
}

// ACC-6 getState returns defensive copy
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-000000000004',
    apiKeyId: 'test-key',
    surface: 'api_reason',
  })
  acc.addCall('claude-sonnet-4-6', 100, 50)
  const s1 = acc.getState()
  s1.models_used.push('mutated-by-caller')
  const s2 = acc.getState()
  assertEqual('ACC-6  Caller cannot mutate models_used via getState copy', s2.models_used.length, 1)
}

// ACC-7 Mixed-model accumulation
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-000000000005',
    apiKeyId: 'test-key',
    surface: 'api_score_iterate',
  })
  acc.addCall('claude-sonnet-4-6', 1000, 200)
  acc.addPrecomputedCall('claude-haiku-4-5', 0.5)
  acc.addCall('claude-sonnet-4-6', 500, 100)
  const s = acc.getState()
  assertEqual('ACC-7a  Three calls accumulated', s.internal_calls, 3)
  assertEqual('ACC-7b  Tokens accumulated (1500 in)', s.total_input_tokens, 1500)
  assertEqual('ACC-7c  Tokens accumulated (300 out)', s.total_output_tokens, 300)
  const expected = estimateCallCostCents('claude-sonnet-4-6', 1000, 200) + 0.5 + estimateCallCostCents('claude-sonnet-4-6', 500, 100)
  assertClose('ACC-7d  Cost accumulated across mixed call types', s.anthropic_cost_cents, expected, 0.001)
}

// ACC-8 Two accumulators independent (KG1 rule 4)
{
  const a = createLoopAccumulator({ loopId: '00000000-0000-4000-8000-00000000000a', apiKeyId: 'k1', surface: 'api_reason' })
  const b = createLoopAccumulator({ loopId: '00000000-0000-4000-8000-00000000000b', apiKeyId: 'k2', surface: 'api_reason' })
  a.addCall('claude-sonnet-4-6', 1000, 100)
  // b should be unaffected
  assertEqual('ACC-8  Accumulator b is independent of a (KG1 rule 4 — no module state)', b.getState().internal_calls, 0)
}


// ============================================================================
// extractLoopId
// ============================================================================

function mockRequest(headerName: string, headerValue: string | null): Request {
  const headers = new Headers()
  if (headerValue !== null) {
    headers.set(headerName, headerValue)
  }
  return new Request('https://example.com/test', { headers })
}

// EX-1 Missing header → null
assertEqual('EX-1  Missing X-Loop-Id → null (caller auto-generates)', extractLoopId(mockRequest('x-loop-id', null)), null)

// EX-2 Valid UUIDv4 → extracted, lowercased
{
  const valid = '550e8400-e29b-41d4-a716-446655440000'
  assertEqual('EX-2  Valid UUIDv4 → extracted', extractLoopId(mockRequest('x-loop-id', valid)), valid)
}

// EX-3 Malformed UUID → null (soft fallback)
assertEqual('EX-3  Malformed UUID → null + warn', extractLoopId(mockRequest('x-loop-id', 'not-a-uuid')), null)

// EX-4 Empty string → null
assertEqual('EX-4  Empty string → null', extractLoopId(mockRequest('x-loop-id', '')), null)

// EX-5 Mixed case → lowercased
{
  const mixed = '550E8400-E29B-41D4-A716-446655440000'
  assertEqual('EX-5  Mixed-case UUIDv4 → lowercased', extractLoopId(mockRequest('x-loop-id', mixed)), mixed.toLowerCase())
}


// ============================================================================
// generateLoopId
// ============================================================================

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
assert('GEN-1  generateLoopId returns valid UUIDv4', UUID_V4_RE.test(generateLoopId()))

{
  const a = generateLoopId()
  const b = generateLoopId()
  assert('GEN-2  Two calls return different IDs', a !== b)
}


// ============================================================================
// buildLoopHeaders
// ============================================================================

// HDR-1 loopId only → six headers; cost fields zeroed
{
  const h = buildLoopHeaders({ loopId: 'test-loop-id' })
  assertEqual('HDR-1a  X-Loop-Id present', h['X-Loop-Id'], 'test-loop-id')
  assertEqual('HDR-1b  X-Loop-Cost-Cents = 0', h['X-Loop-Cost-Cents'], '0')
  assertEqual('HDR-1c  X-Anthropic-Cost-Cents = 0', h['X-Anthropic-Cost-Cents'], '0')
  assertEqual('HDR-1d  X-Overage-Fired = false', h['X-Overage-Fired'], 'false')
  assertEqual('HDR-1e  X-Overage-Cents = 0', h['X-Overage-Cents'], '0')
  assertEqual('HDR-1f  X-Loop-Internal-Calls = 0', h['X-Loop-Internal-Calls'], '0')
}

// HDR-2 With state — X-Anthropic-Cost-Cents = rounded cost; X-Loop-Internal-Calls = call count
{
  const acc = createLoopAccumulator({
    loopId: '00000000-0000-4000-8000-00000000000c',
    apiKeyId: 'test-key',
    surface: 'api_reason',
  })
  acc.addPrecomputedCall('claude-sonnet-4-6', 0.7)  // 0.7 cents
  acc.addPrecomputedCall('claude-sonnet-4-6', 1.2)  // total 1.9 cents
  const state = acc.getState()
  const h = buildLoopHeaders({ loopId: 'test', state })
  assertEqual('HDR-2a  X-Anthropic-Cost-Cents rounds accumulator cost', h['X-Anthropic-Cost-Cents'], '2')
  assertEqual('HDR-2b  X-Loop-Internal-Calls = 2', h['X-Loop-Internal-Calls'], '2')
}

// HDR-3 With bill fields — cost reflects bill, not just accumulator
{
  const h = buildLoopHeaders({
    loopId: 'test',
    overageFired: true,
    overageCents: 4,
    totalCents: 6,
  })
  assertEqual('HDR-3a  X-Loop-Cost-Cents reflects total bill', h['X-Loop-Cost-Cents'], '6')
  assertEqual('HDR-3b  X-Overage-Fired = true', h['X-Overage-Fired'], 'true')
  assertEqual('HDR-3c  X-Overage-Cents = 4', h['X-Overage-Cents'], '4')
}

// HDR-4 All six headers per Decision H present
{
  const h = buildLoopHeaders({ loopId: 'test' })
  const expectedKeys = ['X-Loop-Id', 'X-Loop-Cost-Cents', 'X-Anthropic-Cost-Cents', 'X-Overage-Fired', 'X-Overage-Cents', 'X-Loop-Internal-Calls']
  for (const k of expectedKeys) {
    assert(`HDR-4  Header "${k}" present`, k in h)
  }
}


// ============================================================================
// Summary
// ============================================================================

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
