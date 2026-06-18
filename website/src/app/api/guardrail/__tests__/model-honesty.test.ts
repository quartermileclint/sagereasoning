/**
 * model-honesty.test.ts — Regression guard for the #3a guardrail
 * model-reporting honesty fix (2026-06-19, R18 honesty).
 *
 * Run via: npx tsx src/app/api/guardrail/__tests__/model-honesty.test.ts
 * (no --env-file needed — imports only response-envelope.ts [no imports] and
 *  model-config.ts [crypto only]; the route + engine are source-grepped, never
 *  imported, so no Supabase/Anthropic client is constructed.)
 *
 * THE BUG (FX-14 lineage, first-hand confirmed 2026-06-18):
 *   guardrail/route.ts passed a HARDCODED `model: 'claude-haiku-4-5-20251001'`
 *   to buildEnvelope, so `meta.ai_model` reported Haiku for EVERY gate. But the
 *   route maps risk_class→depth (riskDepthMap: standard→quick, elevated→standard,
 *   critical→deep) and the engine maps depth→model (DEPTH_CONFIG: quick→MODEL_FAST,
 *   standard→MODEL_DEEP, deep→MODEL_DEEP). So elevated + critical gates actually
 *   run MODEL_DEEP (Sonnet) while reporting Haiku — a lie (exactly what Benchmark
 *   v1 recorded: claude-haiku-4-5 on a critical eval). The honest COST figure was
 *   unaffected (computed from reasoningResult.meta.ai_model, the real model);
 *   only the displayed model lied.
 *
 * THE FIX: `model: reasoningResult.meta.ai_model` — the envelope reports the
 *   real model the engine returned, truthful on every return path (success,
 *   cache-hit, parse-failure, quick→Sonnet retry escalation).
 *
 * COVERAGE
 *   Source-grep wiring guards (INV-1..INV-5) over the route + engine source:
 *     - INV-1: route passes `model: reasoningResult.meta.ai_model` to buildEnvelope
 *     - INV-2: route does NOT pass a hardcoded `model: '<haiku-literal>'` (bug gone)
 *     - INV-3: route still supplies the `costUsd:` override to buildEnvelope
 *              (so `model` never reaches estimateCostUsd — the side-effect-free
 *              guarantee: the change touches ONLY meta.ai_model)
 *     - INV-4: route's riskDepthMap maps elevated→standard, critical→deep,
 *              standard→quick (the premise: elevated/critical are NOT quick)
 *     - INV-5: engine's DEPTH_CONFIG maps quick→MODEL_FAST, standard→MODEL_DEEP,
 *              deep→MODEL_DEEP (the premise: standard+deep run the deep model)
 *
 *   Honesty-outcome proof (HO-1..HO-3) — composes INV-4 + INV-5 logically:
 *     - HO-1: elevated ⇒ standard depth ⇒ MODEL_DEEP (Sonnet), not Haiku
 *     - HO-2: critical ⇒ deep depth ⇒ MODEL_DEEP (Sonnet), not Haiku
 *     - HO-3: standard ⇒ quick depth ⇒ MODEL_FAST (Haiku) — still honest
 *
 *   Envelope-behaviour proof (EV-1..EV-5) — calls buildEnvelope exactly as the
 *   route does (explicit costUsd override) and asserts the propagation:
 *     - EV-1: model=MODEL_DEEP ⇒ meta.ai_model === MODEL_DEEP (faithful report)
 *     - EV-2: model=MODEL_FAST ⇒ meta.ai_model === MODEL_FAST (faithful report)
 *     - EV-3: costUsd override is reported verbatim regardless of model
 *             (model=MODEL_DEEP, costUsd=0.05 ⇒ meta.cost_usd === 0.05)
 *     - EV-4: changing the model does NOT change cost when costUsd is supplied
 *             (MODEL_FAST vs MODEL_DEEP, same override ⇒ same meta.cost_usd)
 *     - EV-5: explicit null override ⇒ meta.cost_usd === null (cache-hit honesty)
 *
 * Rules served: R18 (public/meta materials faithful to live behaviour); PR6
 * (Critical-target endpoint); PR15 (mirrors r20a-audience-rendering.test.ts INV
 * source-grep pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

import { buildEnvelope } from '@/lib/response-envelope'
import { MODEL_FAST, MODEL_DEEP } from '@/lib/model-config'

// ============================================================================
// TEST HARNESS
// ============================================================================

let passCount = 0
let failCount = 0

function pass(name: string): void {
  console.log(`PASS — ${name}`)
  passCount++
}

function fail(name: string, message: string): void {
  console.log(`FAIL — ${name}: ${message}`)
  failCount++
}

function expectEq<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    pass(name)
  } else {
    fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) {
    pass(name)
  } else {
    fail(name, hint ?? 'condition was false')
  }
}

// ============================================================================
// SOURCE — read once for the INV-* grep tests
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')
const ENGINE_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'lib', 'sage-reason-engine.ts')

function loadSource(p: string): { source: string; bodyOnly: string } {
  const source = fs.readFileSync(p, 'utf-8')
  const bodyOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
  return { source, bodyOnly }
}

// ============================================================================
// INVOCATION / WIRING TESTS — INV-1..INV-5
// ============================================================================

function runInvocationTests(): void {
  expectTrue('INV-0a guardrail route.ts exists at ' + ROUTE_PATH, fs.existsSync(ROUTE_PATH))
  expectTrue('INV-0b engine exists at ' + ENGINE_PATH, fs.existsSync(ENGINE_PATH))

  const { bodyOnly: routeBody } = loadSource(ROUTE_PATH)
  const { bodyOnly: engineBody } = loadSource(ENGINE_PATH)

  // INV-1: route passes the real engine model to the envelope.
  expectTrue(
    'INV-1 route passes `model: reasoningResult.meta.ai_model` to buildEnvelope',
    /model:\s*reasoningResult\.meta\.ai_model/.test(routeBody),
  )

  // INV-2: the hardcoded-Haiku bug is gone — no `model: '<haiku-literal>'` in
  // the (comment-stripped) route body.
  expectTrue(
    'INV-2 route does NOT pass a hardcoded `model: \'claude-haiku-...\'` (bug class gone)',
    !/model:\s*['"]claude-haiku-4-5-20251001['"]/.test(routeBody),
  )

  // INV-3: the costUsd override is still supplied to buildEnvelope — this is
  // what guarantees the `model` field never reaches the estimateCostUsd branch
  // (response-envelope.ts: costUsdOverride !== undefined wins), so the #3a
  // change affects ONLY meta.ai_model, never the cost.
  expectTrue(
    'INV-3 route still supplies `costUsd:` override to buildEnvelope (side-effect-free guarantee)',
    /costUsd:\s*measuredCostUsd/.test(routeBody),
  )

  // INV-4: the route's risk→depth map is the premise of the honesty claim.
  expectTrue('INV-4a riskDepthMap: standard→quick', /standard:\s*['"]quick['"]/.test(routeBody))
  expectTrue('INV-4b riskDepthMap: elevated→standard', /elevated:\s*['"]standard['"]/.test(routeBody))
  expectTrue('INV-4c riskDepthMap: critical→deep', /critical:\s*['"]deep['"]/.test(routeBody))

  // INV-5: the engine's depth→model map is the other premise. DEPTH_CONFIG is a
  // private const in the engine (not exported), so we source-grep it.
  expectTrue(
    'INV-5a DEPTH_CONFIG: quick → MODEL_FAST',
    /quick:\s*\{[^}]*model:\s*MODEL_FAST/.test(engineBody),
  )
  expectTrue(
    'INV-5b DEPTH_CONFIG: standard → MODEL_DEEP',
    /standard:\s*\{[^}]*model:\s*MODEL_DEEP/.test(engineBody),
  )
  expectTrue(
    'INV-5c DEPTH_CONFIG: deep → MODEL_DEEP',
    /deep:\s*\{[^}]*model:\s*MODEL_DEEP/.test(engineBody),
  )
}

// ============================================================================
// HONESTY-OUTCOME PROOF — HO-1..HO-3
//
// Composes the two source-confirmed maps into the model each risk_class
// actually runs, then asserts the displayed model would be honest.
// ============================================================================

// Mirror of guardrail/route.ts riskDepthMap (asserted against source in INV-4).
const RISK_DEPTH: Record<'standard' | 'elevated' | 'critical', 'quick' | 'standard' | 'deep'> = {
  standard: 'quick',
  elevated: 'standard',
  critical: 'deep',
}
// Mirror of sage-reason-engine.ts DEPTH_CONFIG model field (asserted in INV-5).
const DEPTH_MODEL: Record<'quick' | 'standard' | 'deep', string> = {
  quick: MODEL_FAST,
  standard: MODEL_DEEP,
  deep: MODEL_DEEP,
}

function modelForRisk(risk: 'standard' | 'elevated' | 'critical'): string {
  return DEPTH_MODEL[RISK_DEPTH[risk]]
}

function runHonestyOutcomeTests(): void {
  // HO-1: elevated gates run Sonnet — reporting Haiku (the old bug) is a lie.
  expectEq('HO-1a elevated ⇒ MODEL_DEEP (Sonnet)', modelForRisk('elevated'), MODEL_DEEP)
  expectTrue(
    'HO-1b elevated ⇒ NOT Haiku (the old hardcoded value)',
    modelForRisk('elevated') !== MODEL_FAST,
  )

  // HO-2: critical gates run Sonnet — same lie under the old hardcode.
  expectEq('HO-2a critical ⇒ MODEL_DEEP (Sonnet)', modelForRisk('critical'), MODEL_DEEP)
  expectTrue(
    'HO-2b critical ⇒ NOT Haiku (the old hardcoded value)',
    modelForRisk('critical') !== MODEL_FAST,
  )

  // HO-3: standard gates run Haiku — the old hardcode happened to be honest
  // ONLY here; the fix keeps it honest by reporting the real model.
  expectEq('HO-3 standard ⇒ MODEL_FAST (Haiku) — still honest', modelForRisk('standard'), MODEL_FAST)
}

// ============================================================================
// ENVELOPE-BEHAVIOUR PROOF — EV-1..EV-5
//
// Calls buildEnvelope exactly as the route does (always with an explicit
// costUsd override) and asserts meta.ai_model reports the supplied model and
// the cost is governed solely by the override.
// ============================================================================

function buildLikeRoute(model: string, costUsd: number | null) {
  return buildEnvelope({
    result: { proceed: true },
    endpoint: '/api/guardrail',
    model,
    startTime: Date.now(),
    maxTokens: 512,
    costUsd, // the route ALWAYS supplies this (measuredCostUsd | null)
    extra: { cost_basis: costUsd === null ? 'cache_hit_no_fresh_call' : 'anthropic_usd_measured' },
  })
}

function runEnvelopeBehaviourTests(): void {
  // EV-1: a Sonnet (deep-model) gate reports Sonnet, not Haiku.
  const deep = buildLikeRoute(MODEL_DEEP, 0.05)
  expectEq('EV-1 model=MODEL_DEEP ⇒ meta.ai_model === MODEL_DEEP (Sonnet)', deep.meta.ai_model, MODEL_DEEP)
  expectTrue('EV-1b meta.ai_model is NOT the Haiku literal', deep.meta.ai_model !== MODEL_FAST)

  // EV-2: a genuine Haiku (quick) gate reports Haiku.
  const fast = buildLikeRoute(MODEL_FAST, 0.001)
  expectEq('EV-2 model=MODEL_FAST ⇒ meta.ai_model === MODEL_FAST (Haiku)', fast.meta.ai_model, MODEL_FAST)

  // EV-3: the costUsd override is reported verbatim (not the model-based estimate).
  expectEq('EV-3 costUsd override reported verbatim (0.05)', deep.meta.cost_usd, 0.05)

  // EV-4: model swap does NOT change cost when the override is supplied — proves
  // the #3a change to `model` is cost-side-effect-free.
  const deepSameCost = buildLikeRoute(MODEL_DEEP, 0.001)
  expectEq(
    'EV-4 same costUsd override ⇒ same meta.cost_usd regardless of model (FAST vs DEEP)',
    deepSameCost.meta.cost_usd,
    fast.meta.cost_usd,
  )

  // EV-5: explicit null override (cache hit) ⇒ honest null cost, real model.
  const cacheHit = buildLikeRoute(MODEL_DEEP, null)
  expectEq('EV-5a null costUsd override ⇒ meta.cost_usd === null', cacheHit.meta.cost_usd, null)
  expectEq('EV-5b cache-hit still reports the real model', cacheHit.meta.ai_model, MODEL_DEEP)
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('--- model-honesty.test.ts (#3a guardrail model-reporting honesty) ---')

  runInvocationTests()
  runHonestyOutcomeTests()
  runEnvelopeBehaviourTests()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main()
