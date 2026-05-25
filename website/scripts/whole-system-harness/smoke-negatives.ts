/**
 * smoke-negatives.ts — Step-7 NEGATIVE smoke test (Combination 1, R18f).
 *
 * Completes the standup checklist's Step 7. With the positive control green
 * (L7 genuine→200), this confirms the gate DISCRIMINATES on the SAME env — a
 * forgery is rejected, not accepted — which is what makes the positive result
 * trustworthy. Two cases against POST /api/accreditation/[agent_id]:
 *   (i)  no `provenance`     → expect 422 (bad_provenance)
 *   (ii) forged `provenance` → expect 403 (no_examination)
 *
 * Neither case hits the seed-vs-existing 409: the provenance gate runs BEFORE
 * that check, so these can run against an agent that already has an
 * accreditation row (no teardown needed for the negatives).
 *
 * Reuses the harness http-client + assertions + the synthetic fixture (whose
 * signature is fake → structurally valid but won't verify → no_examination).
 * createCarriedProfile is dynamically imported (pure) only here, so build-only
 * tooling stays env-free.
 *
 * Usage (dev server up against the TEST env):
 *   export WSH_BASE_URL=http://localhost:3000
 *   export WSH_AGENT_ID=wsh-test-agent-L7
 *   export WSH_ASSENT_TOKEN=<sr_assent_ token>
 *   npx tsx scripts/whole-system-harness/smoke-negatives.ts
 *
 * Exit 0 = both negatives behaved as specified; non-zero = a failure.
 */

import { AssertionLedger } from './lib/assertions'
import { postAccreditation } from './lib/http-client'
import { SYNTHETIC_SIGNED_ASSESSMENT } from './lib/fixtures'

async function main(): Promise<void> {
  const baseUrl = process.env.WSH_BASE_URL
  const agentId = process.env.WSH_AGENT_ID ?? 'wsh-test-agent-L7'
  const assentToken = process.env.WSH_ASSENT_TOKEN
  if (!baseUrl || !assentToken) {
    console.error('smoke-negatives requires WSH_BASE_URL and WSH_ASSENT_TOKEN (and optionally WSH_AGENT_ID).')
    process.exit(2)
  }

  console.log(`\n=== Step-7 negative smoke test (Combination 1) — agent: ${agentId} ===\n`)

  const ledger = new AssertionLedger()
  // createCarriedProfile is pure (no supabase); dynamic-import keeps this script's
  // static graph env-free. The negatives need a structurally valid write body so
  // they reach the provenance gate (validateWriteBody runs first).
  const { createCarriedProfile } = await import('../../src/lib/substrate/sage-assent-wrapper')
  const profile = createCarriedProfile(agentId)

  // (i) no provenance → 422 bad_provenance
  const noProv = await postAccreditation(baseUrl, assentToken, agentId, { kind: 'seed', profile })
  ledger.assert(
    'Comb1 (i): write with NO provenance → 422 (bad_provenance)',
    noProv.status === 422,
    `status=${noProv.status} body=${noProv.rawText.slice(0, 180)}`
  )

  // (ii) forged provenance → 403 no_examination
  // The synthetic fixture is structurally valid { assessment, signature, key_id }
  // but carries a fake signature, so verifyLayer2Signature fails → no_examination.
  const forged = await postAccreditation(baseUrl, assentToken, agentId, {
    kind: 'seed',
    profile,
    provenance: { signed_assessments: [SYNTHETIC_SIGNED_ASSESSMENT] },
  })
  ledger.assert(
    'Comb1 (ii): write with FORGED provenance → 403 (no_examination)',
    forged.status === 403,
    `status=${forged.status} body=${forged.rawText.slice(0, 180)}`
  )

  console.log(`\n${ledger.summaryLine()}`)
  const result: 'PASS' | 'FAIL' = ledger.allPassed ? 'PASS' : 'FAIL'
  console.log(`Result: ${result}`)
  console.log(
    result === 'PASS'
      ? 'Gate discriminates: genuine→200 (L7) AND forgery→403 / no-provenance→422 on the same env.'
      : 'A negative did not behave as specified — see the status codes above.'
  )
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('smoke-negatives fatal:', err)
  process.exit(3)
})
