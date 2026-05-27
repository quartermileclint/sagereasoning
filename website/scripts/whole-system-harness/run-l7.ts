/**
 * run-l7.ts — the L7 single-loop proof entry point (PR1 single-loop proof).
 *
 * L7 = Reasoning + Assent (no Reflect). The genuine→200 centrepiece + the
 * Seam 2 bridge tsx step. Built FIRST, before L1–L6 + the negatives (PR1).
 *
 * TWO MODES
 * ---------
 * BUILD-ONLY (default — this session's scope; no live env, no secrets):
 *   Runs the Seam 2 bridge tsx step against a synthetic SignedLayer2Assessment
 *   fixture and writes a run ledger. No network, no DB. Proves (i) the harness
 *   scaffolding is import-clean and (ii) the bridge mapping + receipt_id
 *   derivation hold.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l7.ts
 *
 * LIVE (founder-performed once the TEST env is standing — Step 7 positive
 * control = 200; see data-room/04_test_brief/test-env-standup-checklist.md):
 *   Drives the real loop:
 *     POST /api/reason (X-Api-Key; signing on)
 *       → take output.assessment = { assessment, signature, key_id }
 *       → POST /api/accreditation/[agent_id] (Bearer sr_assent_) with
 *         { kind:'seed', profile: createCarriedProfile(agent_id),
 *           provenance: { signed_assessments: [ <that object> ] } }
 *       → expect 200 (genuine→200)
 *     then the bridge tsx step on the same signed assessment.
 *   Env vars required:
 *     WSH_BASE_URL      e.g. http://localhost:3000
 *     WSH_API_KEY       test api_keys row (X-Api-Key for /api/reason)
 *     WSH_ASSENT_TOKEN  test sr_assent_ token (Bearer for /api/accreditation)
 *     WSH_AGENT_ID      test agent_id the sr_assent_ token is bound to
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-l7.ts --live
 *
 * Exit code 0 = all assertions passed; non-zero = failures (CI-style).
 *
 * L7 assertion coverage:
 *   (a) genuine→200 credential write   — LIVE only (deferred in build-only)
 *   (b) no-practice disclaimer string  — RESOLVED 2026-05-27: disclaimer text
 *                                         authored (R19e) + asserted across all
 *                                         four surfaces by run-comb2.ts
 *                                         (L7 shares this property with Comb 2)
 *   (c) bridge: receipt_id === 'rcpt_' + SHA-256(signature) — BOTH modes
 */

import { AssertionLedger } from './lib/assertions'
import { runBridgeStep } from './lib/bridge-step'
import { SYNTHETIC_SIGNED_ASSESSMENT } from './lib/fixtures'
import { L7_SCENARIO_INPUT } from './lib/scenario-input'
import { writeLedger, type RunLedger } from './lib/capture'
import type { SignedLayer2Assessment } from '../../src/lib/translation-sandwich/layer2-signer'

const TEST_AGENT_ID = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'
const SKILL_ID = 'whole-system-harness:L7'

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  let reasonStatus: number | undefined
  let accreditationStatus: number | undefined
  let signed: SignedLayer2Assessment | null = null

  console.log(`\n=== L7 single-loop proof — mode: ${mode} ===\n`)

  if (mode === 'live') {
    // -------- LIVE: founder-performed against the standing TEST env --------
    const baseUrl = process.env.WSH_BASE_URL
    const apiKey = process.env.WSH_API_KEY
    const assentToken = process.env.WSH_ASSENT_TOKEN
    if (!baseUrl || !apiKey || !assentToken) {
      console.error(
        'LIVE mode requires WSH_BASE_URL, WSH_API_KEY, WSH_ASSENT_TOKEN ' +
          '(and optionally WSH_AGENT_ID). See the header of this file.'
      )
      process.exit(2)
    }

    const { postReason, postAccreditation, getPublicKey } = await import('./lib/http-client')
    // createCarriedProfile is pure (no supabase) but lives in the wrapper
    // module; dynamic-import it so build-only never loads it. KG1: the harness
    // still writes no DB rows itself — the write happens via the HTTP endpoint.
    const { createCarriedProfile } = await import('../../src/lib/substrate/sage-assent-wrapper')

    // 0) confirm the env serves the TEST key (guards the "false 403" trap)
    const pk = await getPublicKey<{ key_id?: string }>(baseUrl)
    notes.push(`/api/public-key → ${pk.status}; key_id=${pk.body?.key_id ?? 'n/a'} (expect the test key)`)

    // 1) POST /api/reason → signed assessment at output.assessment
    const reason = await postReason<{ assessment?: SignedLayer2Assessment }>(baseUrl, apiKey, {
      input: L7_SCENARIO_INPUT.input,
      context: L7_SCENARIO_INPUT.context,
      domain_context: L7_SCENARIO_INPUT.domain_context,
    })
    reasonStatus = reason.status
    ledger.assert(
      'L7 step 1: POST /api/reason returns 200',
      reason.status === 200,
      `status=${reason.status} body=${reason.rawText.slice(0, 200)}`
    )
    const signedFromReason = reason.body?.assessment ?? null
    ledger.assert(
      'L7 step 1: response carries a signed assessment { assessment, signature, key_id }',
      !!signedFromReason &&
        typeof signedFromReason.signature === 'string' &&
        signedFromReason.signature.length > 0 &&
        typeof signedFromReason.key_id === 'string' &&
        typeof signedFromReason.assessment === 'object',
      'Is SUBSTRATE_LAYER2_SIGNING_ENABLED=true in the test env?'
    )
    signed = signedFromReason

    // 2) genuine→200 credential write (kind:'seed' + profile + provenance)
    if (signed) {
      const profile = createCarriedProfile(TEST_AGENT_ID)
      const writeBody = {
        kind: 'seed' as const,
        profile,
        provenance: { signed_assessments: [signed] },
      }
      const accred = await postAccreditation(baseUrl, assentToken, TEST_AGENT_ID, writeBody)
      accreditationStatus = accred.status
      ledger.assert(
        'L7 step 2 (a): genuine credential write returns 200',
        accred.status === 200,
        `status=${accred.status} — 403 no_examination on GENUINE input means the ` +
          `public key does not match the signing key ("false 403"); regenerate the ` +
          `test key-pair together (checklist Step 3). body=${accred.rawText.slice(0, 200)}`
      )
    } else {
      ledger.assert(
        'L7 step 2 (a): genuine credential write returns 200',
        false,
        'skipped — no signed assessment from /api/reason'
      )
    }
  } else {
    // -------- BUILD-ONLY: bridge tsx step against a synthetic fixture --------
    notes.push(
      'build-only: /api/reason + /api/accreditation NOT called (no live env). ' +
        'The bridge step uses a synthetic SignedLayer2Assessment fixture.'
    )
    notes.push(
      'L7 assertion (a) genuine→200 and the /api/public-key check are DEFERRED ' +
        'to the founder live run (test env not yet standing).'
    )
    signed = SYNTHETIC_SIGNED_ASSESSMENT
  }

  // 3) Seam 2 BRIDGE tsx step — runs in BOTH modes -------------------------
  let evaluatedAction: unknown
  let receiptId: string | undefined
  if (signed) {
    const stepResult = runBridgeStep(
      signed,
      {
        agent_id: TEST_AGENT_ID,
        evaluated_at: new Date().toISOString(),
        skill_id: SKILL_ID,
        candidates_considered: 1,
      },
      ledger
    )
    evaluatedAction = stepResult.evaluatedAction
    receiptId = stepResult.evaluatedAction.receipt_id
  }

  // L7 assertion (b): no-practice disclaimer — RESOLVED 2026-05-27
  notes.push(
    'L7 assertion (b) — no-practice disclaimer string — RESOLVED 2026-05-27: ' +
      'the disclaimer text is authored (R19e, founder-approved) and asserted on ' +
      'all four surfaces by run-comb2.ts, which L7 shares this property with.'
  )

  const result: 'PASS' | 'FAIL' = ledger.allPassed ? 'PASS' : 'FAIL'
  const ledgerOut: RunLedger = {
    scenario: 'L7',
    mode,
    timestamp: new Date().toISOString(),
    result,
    assertions: ledger.results,
    summary: ledger.summaryLine(),
    reason_status: reasonStatus,
    accreditation_status: accreditationStatus,
    receipt_id: receiptId,
    evaluated_action: evaluatedAction,
    scenario_input: L7_SCENARIO_INPUT,
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('run-l7 fatal:', err)
  process.exit(3)
})
