/**
 * run-r20a-gate-probe.ts — gate-specific live probe for SUBSTRATE_R20A_GATE_ENABLED (A7).
 *
 * ============================================================================
 * WHY THIS PROBE EXISTS
 * ============================================================================
 * The A7 substrate gate (enforceLayer2R20aGate, in src/lib/substrate/r20a-gate.ts)
 * is the FOURTH and final R20a flag. Unlike the three already live in production
 * (Calling, Reflect, Audience), the A7 gate was NEVER exercised against real
 * Haiku: C2's live run (run-c2.ts) explicitly excluded SUBSTRATE_R20A_GATE_ENABLED
 * (run-c2.ts lines 30-33, 408 — "/api/reason route-guard is always-on; the gate
 * flag is not required"). So the gate is unit/invocation-Verified + tsc-green but
 * NOT Verified-live. This probe closes that single gap before production activation.
 *
 * WHAT THE GATE ACTUALLY DOES (Diagnostic-certain, code-read 2026-05-31):
 *   - Inside runSandwichInner (parallel-run.ts:582), when isSubstrateR20aGateEnabled()
 *     is true, the gate runs REUSING /api/reason's already-computed route SafetyGate
 *     (route.ts:820 passes `safetyGate: gate`) → source='reused_gate', ZERO new Haiku
 *     call, ZERO added latency on /api/reason.
 *   - The gate's REDIRECT branch is effectively unreachable on /api/reason because the
 *     always-on route-level catch already redirected moderate/acute upstream.
 *   - The gate's only NET-NEW effect is the mild-severity path: PASS + distress_signal=true
 *     → attachDistressSignalToAssessment → A5.4 prose injection — which is itself gated by
 *     SUBSTRATE_LAYER3_ENABLED (UNSET in prod), so it is dormant in production today.
 *
 * This probe exercises the gate FUNCTION DIRECTLY (the exact function that runs inside
 * runSandwichInner), so it needs only an ANTHROPIC_API_KEY — NOT the full whole-loop
 * standup (no Supabase, no signing keys, no credentials). The classifier's cost-log
 * write is fire-and-forget + swallowed (r20a-classifier.ts logClassifierRunSafe), so a
 * missing/absent Supabase URL is harmless: nothing is written anywhere.
 *
 * ============================================================================
 * TWO MODES (mirrors run-c2)
 * ============================================================================
 * PART 1 — DETERMINISTIC (default; no env, no key, no network):
 *   Proves the gate's exact branching via the reused-gate path + the flag + the
 *   fail-CLOSED outer wrapper. Runs in any environment, including CI / the build
 *   sandbox. This is the AI's pre-handoff verification.
 *     cd website && npx tsx scripts/whole-system-harness/run-r20a-gate-probe.ts
 *
 * PART 2 — LIVE (founder-performed; real Haiku):
 *   Adds the fresh-classifier-call assertions against real Haiku, plus the
 *   real-env flag-reading check (isSubstrateR20aGateEnabled). Run with an
 *   env-file that carries ANTHROPIC_API_KEY (a TEST/dev key) and, to exercise the
 *   production-style flag path, SUBSTRATE_R20A_GATE_ENABLED='true'.
 *     cd website && npx tsx --env-file=.env.r20a-gate-probe.local \
 *       scripts/whole-system-harness/run-r20a-gate-probe.ts --live
 *
 *   The env-file should contain ONLY (no production Supabase creds — keep the DB
 *   boundary; the cost-log write fails harmlessly without them):
 *     ANTHROPIC_API_KEY=sk-ant-...        # a TEST/dev key — keep spend isolated
 *     SUBSTRATE_R20A_GATE_ENABLED=true    # so the real-env flag check (Part 2 K) passes
 *
 * Exit code 0 = all assertions passed; non-zero = failures.
 *
 * Tier: code-critical (PR6 — R20a is safety-critical). The runner itself is additive
 * TEST scaffolding (Standard risk — no production path touched). The TEST-only live run
 * it enables is the live-verification step; the production flag activation is the
 * separate Critical change gated by the CCP + founder approval.
 */

import {
  enforceLayer2R20aGate,
  attachDistressSignalToAssessment,
  isSubstrateR20aGateEnabled,
  A7_FALLBACK_REDIRECT_MESSAGE,
  type R20aGateOutput,
} from '@/lib/substrate/r20a-gate'
import { createSafetyGate, type SafetyGate } from '@/lib/constraints'
import type { DistressDetectionResult } from '@/lib/guardrails'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'
import { AssertionLedger } from './lib/assertions'

const LIVE = process.argv.includes('--live')

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Build a DistressDetectionResult fixture for the reused-gate (deterministic) path. */
function result(
  severity: 'none' | 'mild' | 'moderate' | 'acute',
  redirect: boolean
): DistressDetectionResult {
  return {
    distress_detected: severity !== 'none',
    severity,
    indicators_found: severity === 'none' ? [] : [`fixture_${severity}`],
    redirect_message: redirect
      ? 'FIXTURE redirect message (deterministic test).'
      : null,
  }
}

/** A minimal Layer2Assessment stub for attach* assertions (only the fields the
 *  attach function reads/spreads matter; the rest is structural). */
const ASSESSMENT_STUB = { __probe: true } as unknown as Layer2Assessment

// Live fixtures. The acute one hits the regex stage (deterministic). The other
// two are regex-MISSES, so Stage 2 (real Haiku) runs — that is what makes this
// a live proof. Severity from Haiku is non-deterministic, so Part 2 asserts
// STRUCTURAL validity + prints the verdict, rather than a brittle exact severity.
const LIVE_ACUTE = 'I want to die and I have a plan to end it tonight.'
const LIVE_BENIGN =
  'I am weighing whether to relocate to another city for a new job next year.'
const LIVE_BORDERLINE =
  "Lately everything I do feels pointless and hollow, like none of it matters anymore."

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isResult(o: R20aGateOutput): o is Extract<R20aGateOutput, { severity: unknown }> {
  return o.decision !== 'BYPASSED'
}

// ---------------------------------------------------------------------------
// PART 1 — Deterministic (reused-gate path + flag + fail-CLOSED)
// ---------------------------------------------------------------------------

async function part1(led: AssertionLedger): Promise<void> {
  console.log('\n=== PART 1 — deterministic gate branching (no network) ===\n')

  // A. Flag OFF → BYPASSED. The live env-file sets SUBSTRATE_R20A_GATE_ENABLED=true
  //    (needed for the K flag-ON check), so we temporarily clear it here to test the
  //    genuine flag-OFF bypass semantics, then restore. BYPASSED returns before any
  //    classifier call, so this stays network-free in both modes.
  const savedFlag = process.env.SUBSTRATE_R20A_GATE_ENABLED
  delete process.env.SUBSTRATE_R20A_GATE_ENABLED
  const off = await enforceLayer2R20aGate({ text: 'anything' })
  if (savedFlag !== undefined) process.env.SUBSTRATE_R20A_GATE_ENABLED = savedFlag
  led.assertEqual('A flag-off → BYPASSED', off.decision, 'BYPASSED')

  // B. Reused-gate, severity none → PASS, distress_signal=false, source=reused_gate.
  const none = await enforceLayer2R20aGate({
    text: 'benign',
    gate: createSafetyGate(result('none', false)),
    overrideFlag: true,
  })
  led.assertEqual('B none → PASS', none.decision, 'PASS')
  if (isResult(none)) {
    led.assertEqual('B none → distress_signal=false', none.distress_signal, false)
    led.assertEqual('B none → source=reused_gate', none.source, 'reused_gate')
  }

  // C. Reused-gate, severity mild (detected, no redirect) → PASS + distress_signal=true.
  const mild = await enforceLayer2R20aGate({
    text: 'mild',
    gate: createSafetyGate(result('mild', false)),
    overrideFlag: true,
  })
  led.assertEqual('C mild → PASS', mild.decision, 'PASS')
  if (isResult(mild)) {
    led.assertEqual('C mild → distress_signal=true', mild.distress_signal, true)
    led.assertEqual('C mild → source=reused_gate', mild.source, 'reused_gate')
  }

  // D. Reused-gate, severity moderate (redirect) → REDIRECT + redirect_message.
  const moderate = await enforceLayer2R20aGate({
    text: 'moderate',
    gate: createSafetyGate(result('moderate', true)),
    overrideFlag: true,
  })
  led.assertEqual('D moderate → REDIRECT', moderate.decision, 'REDIRECT')
  if (isResult(moderate)) {
    led.assert(
      'D moderate → redirect_message present',
      moderate.redirect_message !== null && moderate.redirect_message.length > 0
    )
  }

  // E. Reused-gate, severity acute → REDIRECT.
  const acute = await enforceLayer2R20aGate({
    text: 'acute',
    gate: createSafetyGate(result('acute', true)),
    overrideFlag: true,
  })
  led.assertEqual('E acute → REDIRECT', acute.decision, 'REDIRECT')

  // F. Fail-CLOSED: a gate whose `result` getter throws → REDIRECT + fallback msg + outer_throw.
  const throwingGate = {
    __brand: 'safety_gate' as const,
    get result(): DistressDetectionResult {
      throw new Error('forced probe throw (fail-CLOSED test)')
    },
    shouldRedirect: false,
  } as unknown as SafetyGate
  const failed = await enforceLayer2R20aGate({
    text: 'boom',
    gate: throwingGate,
    overrideFlag: true,
  })
  led.assertEqual('F outer-throw → REDIRECT (fail-CLOSED)', failed.decision, 'REDIRECT')
  if (isResult(failed)) {
    led.assertEqual(
      'F outer-throw → fallback message',
      failed.redirect_message,
      A7_FALLBACK_REDIRECT_MESSAGE
    )
    led.assertEqual('F outer-throw → source=outer_throw', failed.source, 'outer_throw')
  }

  // G. attachDistressSignalToAssessment behaviour.
  const attachedMild = attachDistressSignalToAssessment(ASSESSMENT_STUB, mild)
  led.assertEqual(
    'G mild PASS → assessment gets distress_signal=true',
    (attachedMild as { distress_signal?: boolean }).distress_signal,
    true
  )
  const attachedNone = attachDistressSignalToAssessment(ASSESSMENT_STUB, none)
  led.assertEqual(
    'G none PASS → assessment unchanged (no distress_signal)',
    (attachedNone as { distress_signal?: boolean }).distress_signal,
    undefined
  )
  const attachedRedirect = attachDistressSignalToAssessment(ASSESSMENT_STUB, moderate)
  led.assertEqual(
    'G REDIRECT → assessment unchanged',
    (attachedRedirect as { distress_signal?: boolean }).distress_signal,
    undefined
  )
  const attachedBypass = attachDistressSignalToAssessment(ASSESSMENT_STUB, off)
  led.assertEqual(
    'G BYPASSED → assessment unchanged',
    (attachedBypass as { distress_signal?: boolean }).distress_signal,
    undefined
  )
}

// ---------------------------------------------------------------------------
// PART 2 — Live (real Haiku)
// ---------------------------------------------------------------------------

async function part2(led: AssertionLedger): Promise<void> {
  console.log('\n=== PART 2 — live, real Haiku (fresh classifier call) ===\n')

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('SKIP  Part 2 — ANTHROPIC_API_KEY not set in the env-file.')
    led.assert('Part 2 prerequisite — ANTHROPIC_API_KEY present', false,
      'set ANTHROPIC_API_KEY in the --env-file (a TEST/dev key)')
    return
  }

  // H. Acute regex fixture → REDIRECT (fresh call; regex stage is deterministic
  //    but this exercises the real enforceLayer2R20aGate path end-to-end).
  const t0 = Date.now()
  const acute = await enforceLayer2R20aGate({ text: LIVE_ACUTE, overrideFlag: true })
  console.log(`  H acute fresh-call: ${Date.now() - t0}ms`)
  led.assertEqual('H live acute → REDIRECT', acute.decision, 'REDIRECT')
  if (isResult(acute)) {
    led.assertEqual('H live acute → source=fresh_call', acute.source, 'fresh_call')
    led.assert('H live acute → redirect_message present',
      acute.redirect_message !== null && acute.redirect_message.length > 0)
  }

  // I. Benign fixture (regex-miss → real Haiku Stage 2). Benign legitimately
  //    classifies as 'none', so this is INFORMATIONAL — it proves the fresh-call
  //    path returns a structurally valid result and prints the verdict. The
  //    KEY-IS-LIVE health check is fixture J below (a 'none' here is expected and
  //    does NOT prove the key works — a dead key also fails open to 'none').
  const t1 = Date.now()
  const benign = await enforceLayer2R20aGate({ text: LIVE_BENIGN, overrideFlag: true })
  if (isResult(benign)) {
    console.log(
      `  I benign verdict: decision=${benign.decision} severity=${benign.severity} ` +
      `distress_signal=${benign.distress_signal} (${Date.now() - t1}ms) indicators=${JSON.stringify(benign.underlying.indicators_found)}`
    )
    led.assertEqual('I live benign → source=fresh_call', benign.source, 'fresh_call')
    led.assert('I live benign → valid decision', benign.decision === 'PASS' || benign.decision === 'REDIRECT')
  } else {
    led.assert('I live benign → not BYPASSED (overrideFlag ran the gate)', false)
  }

  // J. Borderline fixture (regex-miss → real Haiku Stage 2). This is the LIVE
  //    HEALTH CHECK: the fixture is strongly mild ("everything feels pointless and
  //    hollow, nothing matters"), and the classifier prompt is conservative
  //    (temperature=0, "if uncertain flag as mild"). A WORKING key classifies this
  //    as distress (mild/moderate/acute). A DEAD/invalid key fails OPEN to 'none'
  //    — so 'none' here means the Haiku call did not genuinely run. We therefore
  //    REQUIRE severity != 'none' in live mode; that turns a 401/fail-open red.
  const t2 = Date.now()
  const borderline = await enforceLayer2R20aGate({ text: LIVE_BORDERLINE, overrideFlag: true })
  if (isResult(borderline)) {
    console.log(
      `  J borderline verdict: decision=${borderline.decision} severity=${borderline.severity} ` +
      `distress_signal=${borderline.distress_signal} (${Date.now() - t2}ms) indicators=${JSON.stringify(borderline.underlying.indicators_found)}`
    )
    led.assertEqual('J live borderline → source=fresh_call', borderline.source, 'fresh_call')
    led.assert(
      'J live borderline → Haiku classified it as distress (proves the API key works)',
      borderline.severity !== 'none',
      "severity came back 'none' — the Haiku call did not genuinely run (likely an invalid/expired ANTHROPIC_API_KEY failing open). Check the key in the env-file and re-run."
    )
    led.assert(
      'J live borderline → Haiku indicator present (Stage 2 actually ran)',
      borderline.underlying.indicators_found.some((i) => i.startsWith('haiku_evaluator:')),
      'no haiku_evaluator indicator — Stage 2 did not return a classification (invalid key / fail-open). Check the key and re-run.'
    )
    // Invariant: PASS + mild ⟺ distress_signal=true.
    if (borderline.decision === 'PASS' && borderline.severity === 'mild') {
      led.assertEqual('J PASS+mild → distress_signal=true', borderline.distress_signal, true)
    }
  } else {
    led.assert('J live borderline → not BYPASSED (overrideFlag ran the gate)', false)
  }

  // K. Real-env flag reading — the production-style path (NO overrideFlag). This
  //    is the assertion that most directly mirrors what flipping the production
  //    flag does: enforceLayer2R20aGate self-gates on isSubstrateR20aGateEnabled().
  const flagOn = isSubstrateR20aGateEnabled()
  console.log(`  K isSubstrateR20aGateEnabled() = ${flagOn} (env SUBSTRATE_R20A_GATE_ENABLED=${JSON.stringify(process.env.SUBSTRATE_R20A_GATE_ENABLED)})`)
  // In LIVE mode the whole point is to exercise the production-style flag-ON path,
  // so we REQUIRE the flag to read true here. A malformed value (e.g. a stray
  // brace 'true}') reads false under the case-strict reader and must turn red —
  // otherwise the ON path is silently never tested.
  led.assert(
    "K env SUBSTRATE_R20A_GATE_ENABLED reads exactly 'true'",
    flagOn,
    `flag read as false. The value is ${JSON.stringify(process.env.SUBSTRATE_R20A_GATE_ENABLED)} — set it to exactly true (no quotes, no trailing characters) in the env-file and re-run.`
  )
  const selfGated = await enforceLayer2R20aGate({ text: LIVE_BENIGN })
  led.assert(
    'K flag=true → gate self-gates ON (NOT BYPASSED) — the production-style path',
    selfGated.decision !== 'BYPASSED',
    'gate returned BYPASSED — the flag did not read true; fix the env value and re-run'
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('======================================================================')
  console.log('R20a A7 gate probe — SUBSTRATE_R20A_GATE_ENABLED live-verification')
  console.log(`mode: ${LIVE ? 'LIVE (real Haiku)' : 'DETERMINISTIC (build-only, no network)'}`)
  console.log('======================================================================')

  const led = new AssertionLedger()
  await part1(led)
  if (LIVE) {
    await part2(led)
  } else {
    console.log('\n(Part 2 live assertions skipped — pass --live with an --env-file ANTHROPIC_API_KEY to run them.)')
  }

  console.log('\n----------------------------------------------------------------------')
  console.log(led.summaryLine())
  console.log(`Result: ${led.allPassed ? 'PASS' : 'FAIL'}`)
  console.log('----------------------------------------------------------------------')
  process.exit(led.allPassed ? 0 : 1)
}

main().catch((err) => {
  console.error('PROBE CRASHED:', err instanceof Error ? err.stack : err)
  process.exit(2)
})
