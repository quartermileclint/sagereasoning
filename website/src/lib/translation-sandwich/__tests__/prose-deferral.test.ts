/**
 * prose-deferral.test.ts — M1 CI-1 orchestrator deferral behaviour + CI-17
 * structural assertions (no DB, no LLM — deliberately runs WITHOUT an
 * Anthropic key so any accidental LLM dependence fails loudly).
 *
 * Run via: `npx tsx website/src/lib/translation-sandwich/__tests__/prose-deferral.test.ts`
 * (plain-assertion script per CLAUDE.md conventions; no Jest; no --env-file.)
 *
 * COVERAGE:
 *   DF — Deferral path: flag on + deferProse → prose_deferred=true,
 *        output.prose === null, assessment present, NO Layer-3 work
 *        (latency/cost null), bare assessment exposed for retention.
 *   BI — Flag-unset identity: deferProse requested but flag UNSET → the
 *        legacy Layer-3 path runs (deterministic fallback prose here, because
 *        no Anthropic key is provisioned) and prose_deferred=false. Proves
 *        the flag is the structural gate, not the request field.
 *   FU — Flag on + 'full' (no defer request) → legacy path, prose present.
 *   T1 — Tier-1 precedence: a fused-elements schema halts at clarification
 *        BEFORE any deferral decision (deferral never bypasses intake).
 *   AC4 — Invocation assertions (grep-style source checks, the repo's AC4
 *        pattern): the orchestrator's deferral branch goes through
 *        shouldDeferProse with the assessment's distress_signal; the route
 *        passes deferProse, writes the pending row, and hands completion to
 *        waitUntil. (The mild-distress integration case needs the A7 gate +
 *        classifier — exercised in the Step-7 TEST leg, not here.)
 */

import * as fs from 'fs'
import * as path from 'path'
import { validateLayer1Schema } from '../layer1-extractor'
import { runSandwichForHarness, shouldDeferProse } from '../parallel-run'

// Force the no-LLM posture for this test file: Layer 3's LLM call must either
// not be attempted (deferral) or fail into the deterministic fallback (legacy).
const savedAnthropicKey = process.env.ANTHROPIC_API_KEY
delete process.env.ANTHROPIC_API_KEY

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

/** Minimal valid Layer1Schema (the layer1-schema-additions fixture shape). */
function buildMinimalRaw(): Record<string, unknown> {
  return {
    version: 'layer1-schema-v1',
    passions_present: [],
    control_filter_elements: [],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    kathekon_factors: [],
    urgency_indicators: [],
    causal_stage_evidence: [],
    eupatheia_candidates: [],
    stated_concern_targets: [],
    stated_equanimity_signals: [],
    motivation_stated: false,
    motivation_evidence: [],
    element_fusion_detected: { fused: false, fused_concerns: null },
    ambiguity_notes: [],
  }
}

async function main(): Promise<void> {
  const schema = validateLayer1Schema(buildMinimalRaw())
  const input = 'Decide whether to ship the change today or wait for review.'

  // ==========================================================================
  // DF — deferral path (flag on + requested + no distress signal)
  // ==========================================================================
  process.env.SUBSTRATE_L3_DEFER_ENABLED = 'true'
  const deferred = await runSandwichForHarness({
    input,
    preExtractedLayer1Schema: schema,
    deferProse: true,
  })

  assert('DF-1 prose_deferred === true', deferred.prose_deferred === true)
  assert('DF-2 error === null', deferred.error === null)
  const deferredOutput = deferred.output as Record<string, unknown> | null
  assert('DF-3 output present', deferredOutput !== null)
  assert('DF-4 output.prose === null (assessment-first shape)', deferredOutput?.prose === null)
  assert(
    'DF-5 output.assessment present (the immediate signed/bare assessment)',
    deferredOutput?.assessment !== null && deferredOutput?.assessment !== undefined
  )
  assert(
    'DF-6 NO Layer-3 work in the hot path (latency null)',
    deferred.layer3_latency_ms === null
  )
  assert(
    'DF-7 NO Layer-3 cost in the hot path (cost null)',
    deferred.layer3_cost_usd_microcents === null
  )
  assert(
    'DF-8 bare layer2_assessment exposed for post-response generation + retention',
    deferred.layer2_assessment !== null
  )
  const deferredMeta = deferredOutput?.meta as Record<string, unknown> | undefined
  assert(
    'DF-9 output meta carries layer3_latency_ms: null (honest meta)',
    deferredMeta !== undefined && deferredMeta.layer3_latency_ms === null
  )
  assert(
    'DF-10 extraction echoes the supplied schema (layer1_ms 0 path)',
    deferredOutput?.extraction === schema && deferred.layer1_latency_ms === 0
  )

  // ==========================================================================
  // BI — flag-unset identity: the request field alone cannot defer
  // ==========================================================================
  delete process.env.SUBSTRATE_L3_DEFER_ENABLED
  const flagOff = await runSandwichForHarness({
    input,
    preExtractedLayer1Schema: schema,
    deferProse: true, // requested — but the flag is the structural gate
  })

  assert('BI-1 prose_deferred === false when flag unset', flagOff.prose_deferred === false)
  const flagOffOutput = flagOff.output as Record<string, unknown> | null
  const flagOffProse = flagOffOutput?.prose as Record<string, unknown> | null | undefined
  assert(
    'BI-2 legacy Layer-3 path ran (prose present — deterministic fallback without a key)',
    flagOffProse !== null && flagOffProse !== undefined
  )
  assert(
    'BI-3 prose came from the deterministic fallback (no key provisioned)',
    (flagOffProse as { source?: string } | null | undefined)?.source === 'fallback'
  )
  assert(
    'BI-4 Layer-3 latency recorded (the path was taken)',
    flagOff.layer3_latency_ms !== null
  )

  // ==========================================================================
  // FU — flag on, no defer request → legacy path
  // ==========================================================================
  process.env.SUBSTRATE_L3_DEFER_ENABLED = 'true'
  const fullUnderFlag = await runSandwichForHarness({
    input,
    preExtractedLayer1Schema: schema,
    // deferProse omitted — the 'full' default
  })
  assert('FU-1 prose_deferred === false without a defer request', fullUnderFlag.prose_deferred === false)
  const fuProse = (fullUnderFlag.output as Record<string, unknown> | null)?.prose
  assert('FU-2 prose present on the full path', fuProse !== null && fuProse !== undefined)
  delete process.env.SUBSTRATE_L3_DEFER_ENABLED

  // ==========================================================================
  // T1 — Tier-1 clarification precedes any deferral decision
  // ==========================================================================
  process.env.SUBSTRATE_L3_DEFER_ENABLED = 'true'
  const fusedSchema = validateLayer1Schema({
    ...buildMinimalRaw(),
    element_fusion_detected: {
      fused: true,
      fused_concerns: ['shipping today', 'the reviewer relationship'],
    },
  })
  const tier1 = await runSandwichForHarness({
    input,
    preExtractedLayer1Schema: fusedSchema,
    deferProse: true,
  })
  assert('T1-1 Tier-1 trigger fired', tier1.tier1_trigger !== null)
  assert('T1-2 prose_deferred stays false on the Tier-1 path', tier1.prose_deferred === false)
  assert('T1-3 no bare assessment exposed (no examination completed)', tier1.layer2_assessment === null)
  delete process.env.SUBSTRATE_L3_DEFER_ENABLED

  // ==========================================================================
  // AC4 — invocation assertions (source greps; the repo's AC4 pattern)
  // ==========================================================================
  const orchestratorSrc = fs.readFileSync(
    path.join(__dirname, '..', 'parallel-run.ts'),
    'utf8'
  )
  assert(
    'AC4-1 orchestrator deferral decision goes through shouldDeferProse',
    orchestratorSrc.includes('const deferralActive = shouldDeferProse({')
  )
  assert(
    'AC4-2 the decision reads the assessment-attached distress_signal (election 5 guard)',
    orchestratorSrc.includes(
      'distressSignal: (layer2Assessment as { distress_signal?: boolean }).distress_signal'
    )
  )
  assert(
    'AC4-3 guard function structurally blocks distress deferral',
    shouldDeferProse({ deferRequested: true, flagEnabled: true, distressSignal: true }) === false
  )

  const routeSrc = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'app', 'api', 'reason', 'route.ts'),
    'utf8'
  )
  assert('AC4-4 route passes deferProse to runSandwich', routeSrc.includes('deferProse: deferRequested'))
  assert(
    'AC4-5 route writes the pending row BEFORE responding (awaited)',
    routeSrc.includes('await insertPendingNarrative({')
  )
  assert(
    'AC4-6 route hands deferred completion to waitUntil',
    routeSrc.includes('waitUntil(') && routeSrc.includes('completeNarrative({')
  )
  assert(
    'AC4-7 failed pending insert withdraws deferral (inline generation fallback — CI-17)',
    routeSrc.includes('await generateNarrativeForAssessment(bareAssessment)')
  )

  // ==========================================================================
  // Report
  // ==========================================================================
  if (savedAnthropicKey !== undefined) process.env.ANTHROPIC_API_KEY = savedAnthropicKey

  console.log(`\n${passCount} passed, ${failCount} failed`)
  if (failCount > 0) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Test runner threw:', err)
  process.exit(1)
})
