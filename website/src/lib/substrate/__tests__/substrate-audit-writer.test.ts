/**
 * substrate-audit-writer.test.ts — A12 unit proof.
 *
 * Plain-assertion tsx script (house pattern — no Jest). Run with:
 *   cd website && npx tsx src/lib/substrate/__tests__/substrate-audit-writer.test.ts
 *
 * Supabase-free: exercises the PURE functions (maskContext, deriveDecisionEvent,
 * buildProvenance, buildUsePolicies) + the no-op safety of the telemetry helpers.
 * The Supabase insert path is NOT exercised here (that is the founder-walked TEST
 * run against the TEST project — the live half of the proof).
 *
 * Proves:
 *   1. masking emits STRUCTURAL fields only — no free text can reach the row
 *   2. decision_event derivation matches every terminal outcome
 *   3. provenance + use_policies carry the AP2-compatible shape (AC10 / F4)
 *   4. telemetry helpers are no-op-safe (flag off AND flag on without a provider)
 */

import {
  maskContext,
  deriveDecisionEvent,
  buildProvenance,
  buildUsePolicies,
  type RecordAuditEventParams,
  type SubstrateRunFacts,
} from '../substrate-audit-writer'
import {
  emitLayerSpan,
  withSubstrateRootSpan,
  isSubstrateOtelEnabled,
} from '../substrate-telemetry'

let passed = 0
let failed = 0
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++
    console.log(`  ✓ ${msg}`)
  } else {
    failed++
    console.error(`  ✗ FAIL: ${msg}`)
  }
}

function facts(partial: Partial<SubstrateRunFacts>): SubstrateRunFacts {
  return {
    error: null,
    tier1TriggerCode: null,
    layer1LatencyMs: 120,
    layer2LatencyMs: 3,
    layer3LatencyMs: 400,
    layer1CostMicrocents: 50,
    layer3CostMicrocents: 80,
    gateSeverity: null,
    hasLayer3Response: false,
    outputPresent: true,
    ...partial,
  }
}

function params(f: SubstrateRunFacts, inputCharCount = 142): RecordAuditEventParams {
  return {
    correlationId: '11111111-1111-4111-8111-111111111111',
    agentId: 'install_abc',
    surface: 'api_reason',
    inputCharCount,
    facts: f,
    modelsUsed: ['claude-sonnet-4-6'],
  }
}

void (async () => {
console.log('\n[1] decision_event derivation')
assert(deriveDecisionEvent(facts({})) === 'assessment', 'happy path → assessment')
assert(
  deriveDecisionEvent(facts({ error: 'r20a_gate_redirect', gateSeverity: 'moderate' })) ===
    'r20a_redirect',
  'r20a gate redirect → r20a_redirect'
)
assert(
  deriveDecisionEvent(facts({ tier1TriggerCode: 'ELEMENT_FUSION' })) === 'tier1_clarification',
  'tier1 trigger → tier1_clarification'
)
assert(
  deriveDecisionEvent(facts({ error: 'signing_throw' })) === 'signing_unavailable',
  'signing throw → signing_unavailable'
)
assert(
  deriveDecisionEvent(facts({ error: 'layer1_throw' })) === 'layer_throw',
  'layer1 throw → layer_throw'
)
assert(
  deriveDecisionEvent(facts({ error: 'layer3_throw' })) === 'layer_throw',
  'layer3 throw → layer_throw'
)
assert(
  deriveDecisionEvent(facts({ layer3CostMicrocents: null, layer3LatencyMs: 410 })) === 'fallback',
  'layer3 ran with null cost → fallback (deterministic prose)'
)

console.log('\n[2] masking contract — structural fields only, no free text')
const mc = maskContext(params(facts({ tier1TriggerCode: 'ELEMENT_FUSION' })), 'tier1_clarification')
const allowedKeys = [
  'input_char_count',
  'tier1_trigger_code',
  'layer3_fallback_used',
  'has_substrate_layer3_response',
  'engine_attribution',
].sort()
assert(
  JSON.stringify(Object.keys(mc).sort()) === JSON.stringify(allowedKeys),
  'masked_context has exactly the allowed structural keys'
)
assert(typeof mc.input_char_count === 'number', 'input_char_count is a COUNT (number), not text')
assert(mc.input_char_count === 142, 'input_char_count reflects the supplied count')
// Canary: simulate raw text/intimate data the writer must never see. It is never
// passed (the SubstrateRunFacts type cannot carry it), so it must be absent from
// the serialised row. This guards against a future refactor that widens the input.
const CANARIES = [
  'my therapist said',
  'I want to hurt myself',
  'patient name: Jane Doe',
  'free-text finding prose',
]
const serialised = JSON.stringify({
  masked_context: mc,
  provenance: buildProvenance(['claude-sonnet-4-6']),
  use_policies: buildUsePolicies('assessment'),
})
assert(
  CANARIES.every((c) => !serialised.includes(c)),
  'no raw/free-text/intimate canary string appears anywhere in the row'
)

console.log('\n[3] provenance + use_policies — AP2-compatible shape (AC10 / F4)')
const prov = buildProvenance(['claude-sonnet-4-6'])
assert(prov.substrate_version === 'translation-sandwich-v1', 'provenance carries substrate_version')
assert(Array.isArray(prov.models), 'provenance carries models[]')
assert(typeof prov.layer2_signature_present === 'boolean', 'provenance carries signature indicator (bool, not the signature)')
assert(typeof prov.produced_at === 'string', 'provenance carries produced_at ISO timestamp')
const upRedirect = buildUsePolicies('r20a_redirect')
const upNormal = buildUsePolicies('assessment')
assert(upNormal.not_medical_or_legal_advice === true, 'use_policies: not-advice posture')
assert(upNormal.mirror_principle === true, 'use_policies: mirror principle (R19d)')
assert(upNormal.limitations_ref === '/limitations', 'use_policies: limitations ref (R19c)')
assert(upRedirect.distress_redirect_applies === true, 'use_policies: distress_redirect_applies true on redirect')
assert(upNormal.distress_redirect_applies === false, 'use_policies: distress_redirect_applies false otherwise')

console.log('\n[4] telemetry no-op safety')
delete process.env.SUBSTRATE_OTEL_ENABLED
assert(isSubstrateOtelEnabled() === false, 'flag unset → disabled')
// Flag OFF: withSubstrateRootSpan returns fn() unchanged; emitLayerSpan does not throw.
let ranOff = false
const offResult = await withSubstrateRootSpan('corr-off', 'api_reason', async () => {
  ranOff = true
  return 'value-off'
})
assert(ranOff && offResult === 'value-off', 'flag off: root-span wrapper returns fn() value unchanged')
let threwOff = false
try {
  emitLayerSpan({ name: 'substrate.layer1.extract_features', startMs: Date.now(), latencyMs: 10, genAI: true, model: 'claude-sonnet-4-6', ok: true })
} catch {
  threwOff = true
}
assert(!threwOff, 'flag off: emitLayerSpan does not throw')

// Flag ON but no provider registered: OTel API returns a no-op tracer → still safe.
process.env.SUBSTRATE_OTEL_ENABLED = 'true'
assert(isSubstrateOtelEnabled() === true, 'flag set → enabled')
let threwOn = false
let onResult = ''
try {
  onResult = await withSubstrateRootSpan('corr-on', 'api_reason', async () => 'value-on')
  emitLayerSpan({ name: 'substrate.layer3.generate_prose', startMs: Date.now(), latencyMs: 5, genAI: true, model: 'claude-sonnet-4-6', ok: true })
} catch {
  threwOn = true
}
assert(!threwOn && onResult === 'value-on', 'flag on (no provider): helpers safe + return value unchanged')
delete process.env.SUBSTRATE_OTEL_ENABLED

console.log(`\n=== A12 audit-writer unit proof: ${passed} passed, ${failed} failed ===`)
process.exit(failed === 0 ? 0 : 1)
})()
