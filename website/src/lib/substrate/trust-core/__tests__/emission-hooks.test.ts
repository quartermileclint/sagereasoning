/**
 * emission-hooks.test.ts — the F-1 register closure (Trust Layer S10 rider,
 * 2026-07-12; audit register `fix_before_s10` item F-1: "the emission hooks
 * have no unit test").
 *
 * Plain-assertion script: npx tsx <this file>   (HERMETIC BY CONSTRUCTION: the
 * Supabase env vars are DELETED up front, so ANY path that touches the DB layer
 * throws inside the hook — the legs below turn that into the two proofs F-1
 * names):
 *
 *   LEG A — flag OFF ⇒ ZERO client calls. With no Supabase env, any identity
 *   resolution or store call would throw and be caught+logged by the hook's
 *   total catch. A flag-off invocation that completes with NO console.error is
 *   therefore a structural proof that no DB-layer code ran (byte-identity for
 *   the two live call sites — accreditation write + reflect completion).
 *
 *   LEG B — flag ON + store failure ⇒ NO throw to the caller + LOGGED. The
 *   missing env makes the first DB-layer touch throw (getAdminClient's guard);
 *   the hook must resolve normally (a trust-write failure must never 500 a live
 *   route — measure mode) and must log with the '[trust-core]' prefix (PA-7's
 *   log-and-continue contract at the hook layer).
 *
 *   LEG C — flag ON + pre-conditions unmet (provenance not enforced / empty
 *   assessments / dishonest reflect) ⇒ silent no-op BEFORE any DB touch.
 *
 * All console.error stub windows are SERIALIZED (memory:
 * async-test-console-stub-race).
 */

import {
  emitAccreditationTrustEvents,
  emitReflectTrustEvent,
  emitScreenedReflectTrustEvent,
  emitSuppressionWatchEvents,
} from '../emission-hooks'

// ── hermetic env pin ─────────────────────────────────────────────────────────
const SAVED_ENV: Record<string, string | undefined> = {
  SUBSTRATE_TRUST_CORE_ENABLED: process.env.SUBSTRATE_TRUST_CORE_ENABLED,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

async function captureErrors(fn: () => Promise<void>): Promise<{ threw: boolean; errors: string[] }> {
  const original = console.error
  const errors: string[] = []
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(' '))
  }
  let threw = false
  try {
    await fn()
  } catch {
    threw = true
  } finally {
    console.error = original
  }
  return { threw, errors }
}

const ENFORCED_BODY = {
  provenance: { signed_assessments: [{ signature: 'sig-abc', key_id: 'k1', assessment: {} }] },
}

async function main(): Promise<void> {
  // ═══ LEG A — flag OFF ⇒ zero DB-layer work, zero logs, zero throws ════════
  delete process.env.SUBSTRATE_TRUST_CORE_ENABLED

  {
    const { threw, errors } = await captureErrors(() =>
      emitAccreditationTrustEvents({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        provenanceEnforced: true,
        rawBody: ENFORCED_BODY,
      }),
    )
    assert(!threw, 'A1 accreditation hook flag-off never throws')
    assert(errors.length === 0, `A2 accreditation hook flag-off touches NOTHING (no logs; got ${errors.length})`)
  }
  {
    const { threw, errors } = await captureErrors(() =>
      emitReflectTrustEvent({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        sessionId: 's-1',
        fabricationRiskLevel: 'low',
        contextSource: 'agent_stated',
      }),
    )
    assert(!threw, 'A3 reflect hook flag-off never throws')
    assert(errors.length === 0, 'A4 reflect hook flag-off touches NOTHING (no logs)')
  }
  {
    const { threw, errors } = await captureErrors(() =>
      emitScreenedReflectTrustEvent({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        sessionId: 's-1',
        contextSource: 'agent_stated',
        verbatimLength: 100,
      }),
    )
    assert(!threw, 'A5 screened hook flag-off never throws')
    assert(errors.length === 0, 'A6 screened hook flag-off touches NOTHING (no logs)')
  }
  {
    const { threw, errors } = await captureErrors(() =>
      emitSuppressionWatchEvents({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        sessionId: 's-1',
        q4Passions: [{ root: 'epithumia', subSpecies: 'philodoxia' } as never],
        sessionAssessments: [],
        screenRanDeclared: true,
      }),
    )
    assert(!threw, 'A7 suppression hook flag-off never throws')
    assert(errors.length === 0, 'A8 suppression hook flag-off touches NOTHING (no logs)')
  }

  // ═══ LEG B — flag ON + store failure ⇒ no throw + logged ══════════════════
  process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true'

  {
    // The first DB-layer touch (identity resolution's getAdminClient default
    // param) throws on the deleted env; the hook's total catch must absorb it.
    const { threw, errors } = await captureErrors(() =>
      emitAccreditationTrustEvents({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        provenanceEnforced: true,
        rawBody: ENFORCED_BODY,
      }),
    )
    assert(!threw, 'B1 accreditation hook store-failure never throws to the route')
    assert(
      errors.some((e) => e.includes('[trust-core] emitAccreditationTrustEvents error:')),
      'B2 accreditation hook store-failure LOGGED with the [trust-core] prefix',
    )
  }
  {
    // credentialId null skips identity resolution; the derived honest reflect
    // event reaches emitTrustEvents, whose DB-layer touch throws on the deleted
    // env — the hook must absorb + log.
    const { threw, errors } = await captureErrors(() =>
      emitReflectTrustEvent({
        agentId: 'test:agent@v1',
        credentialId: null,
        sessionId: 's-1',
        fabricationRiskLevel: 'low',
        contextSource: 'agent_stated',
      }),
    )
    assert(!threw, 'B3 reflect hook store-failure never throws to the route')
    assert(
      errors.some((e) => e.includes('[trust-core]')),
      'B4 reflect hook store-failure LOGGED with the [trust-core] prefix',
    )
  }

  // ═══ LEG C — flag ON + pre-conditions unmet ⇒ silent no-op before any DB ══
  {
    const { threw, errors } = await captureErrors(() =>
      emitAccreditationTrustEvents({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        provenanceEnforced: false, // R18f-parallel: unenforced write ⇒ no event
        rawBody: ENFORCED_BODY,
      }),
    )
    assert(!threw && errors.length === 0, 'C1 unenforced write ⇒ silent no-op BEFORE any DB touch')
  }
  {
    const { threw, errors } = await captureErrors(() =>
      emitAccreditationTrustEvents({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        provenanceEnforced: true,
        rawBody: { provenance: { signed_assessments: [] } }, // nothing to derive from
      }),
    )
    assert(!threw && errors.length === 0, 'C2 empty assessments ⇒ silent no-op BEFORE any DB touch')
  }
  {
    const { threw, errors } = await captureErrors(() =>
      emitSuppressionWatchEvents({
        agentId: 'test:agent@v1',
        credentialId: 'cred-1',
        sessionId: 's-1',
        q4Passions: [], // nothing surfaced ⇒ no signal either way
        sessionAssessments: [],
        screenRanDeclared: true,
      }),
    )
    assert(!threw && errors.length === 0, 'C3 empty Q4 ⇒ silent no-op BEFORE any DB touch')
  }

  // ── restore env ──────────────────────────────────────────────────────────
  for (const [k, v] of Object.entries(SAVED_ENV)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }

  console.log(`\nemission-hooks battery (F-1 closure): ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n' + failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('BATTERY CRASHED:', e)
  process.exit(1)
})
