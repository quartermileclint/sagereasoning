/**
 * stoa-credential.test.ts — the ST4 credential-auth battery (2026-08-03).
 * Run: npx tsx website/src/lib/stoa/__tests__/stoa-credential.test.ts
 *
 * Pure-function battery over the two auth arms via the injectable validator
 * seam (StoaCredentialValidator) — no live DB, no env, no network. Covers:
 *   A. Transport extraction — Bearer accepted on both arms; X-Api-Key
 *      accepted ONLY on the presence arm, rejected on the declare arm
 *      (Bearer-only narrowing).
 *   B. Presence resolution — never throws, never gates; valid/invalid/absent
 *      credential all resolve cleanly.
 *   C. Declare resolution — the full failure taxonomy (no_token /
 *      invalid_token / no_owner / no_agent) plus the success shape,
 *      including the credentialRef `api_key:<id>` convention (E.5's
 *      precedent) and the non-vacuity pin that the validator is invoked
 *      with the 'consult' capability, never anything else.
 *
 * DISCLOSED LIMIT (PR19 review, 2026-08-03): every case here drives the
 * INJECTABLE StoaCredentialValidator seam — the real validatePracticeCredential
 * (hash → DB lookup → evaluatePracticeCredentialRow) is never exercised from
 * this file, so an integration-level mismatch between stoa-credential.ts and
 * practice-credential.ts (wrong capability literal, wrong argument order)
 * would not be caught here. practice-credential.ts's OWN battery
 * (practice-credential.test.ts) exercises evaluatePracticeCredentialRow
 * directly; TypeScript's structural typing on validatePracticeCredential's
 * signature is the remaining seam-correctness guarantee. A live-DB
 * end-to-end smoke is the ST5 activation walk's job (a TEST-environment
 * declare/read/tend/withdraw cycle), matching the discernment route's own
 * precedent of unit-testing the pure seam and smoke-testing the real one.
 */

import type { NextRequest } from 'next/server'
import {
  resolveStoaCredentialPresence,
  resolveStoaDeclareIdentity,
  type StoaCredentialValidator,
} from '../stoa-credential'
import type { PracticeCredentialResult, PracticeCredentialRow } from '@/lib/practice-credential'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    pass++
    console.log(`  PASS ${name}`)
  } else {
    fail++
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function fakeRequest(headers: Record<string, string>): NextRequest {
  const map = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return {
    headers: { get: (k: string) => map.get(k.toLowerCase()) ?? null },
  } as unknown as NextRequest
}

function mkRow(over: Partial<PracticeCredentialRow>): PracticeCredentialRow {
  return {
    id: 'row-1',
    is_active: true,
    purpose: 'unified_practice',
    capabilities: ['consult'],
    owner_user_id: 'owner-1',
    agent_id: 'sagereasoning:demo@v1',
    label: null,
    tier: 'free',
    suspended_reason: null,
    monthly_limit: null,
    daily_limit: null,
    max_chain_iterations: null,
    scope_downstream_identity_model: null,
    scope_path_posture: null,
    identity_type: null,
    install_id: null,
    install_scope: null,
    ...over,
  }
}

async function run() {
  // ============================================================================
  // A. Transport extraction — Bearer both arms; X-Api-Key presence-only
  // ============================================================================
  {
    console.log('§A transport extraction')
    let calls: Array<{ raw: string; cap: string }> = []
    const okValidator: StoaCredentialValidator = async (raw, cap) => {
      calls.push({ raw, cap })
      return { valid: true, row: mkRow({}), capabilities: ['consult'] } as PracticeCredentialResult
    }

    calls = []
    const bearerPresence = await resolveStoaCredentialPresence(
      fakeRequest({ authorization: 'Bearer sr_prac_abc123' }),
      okValidator,
    )
    check('A.1 presence accepts Bearer', bearerPresence !== null)
    check("A.2 presence invokes the validator with 'consult'", calls.length === 1 && calls[0].cap === 'consult')

    calls = []
    const apiKeyPresence = await resolveStoaCredentialPresence(
      fakeRequest({ 'x-api-key': 'sr_live_xyz789' }),
      okValidator,
    )
    check('A.3 presence accepts X-Api-Key (dual transport)', apiKeyPresence !== null, JSON.stringify(apiKeyPresence))
    check('A.4 presence extracted the X-Api-Key raw token', calls.length === 1 && calls[0].raw === 'sr_live_xyz789')

    calls = []
    const declareBearer = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_prac_abc123' }),
      okValidator,
    )
    check('A.5 declare accepts Bearer', declareBearer.ok === true)

    calls = []
    const declareApiKey = await resolveStoaDeclareIdentity(
      fakeRequest({ 'x-api-key': 'sr_live_xyz789' }),
      okValidator,
    )
    check(
      'A.6 declare REJECTS X-Api-Key (Bearer-only narrowing) — no_token, validator never invoked',
      declareApiKey.ok === false && declareApiKey.reason === 'no_token' && calls.length === 0,
      JSON.stringify(declareApiKey),
    )

    const unrecognisedPrefix = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer not_a_practice_credential' }),
      okValidator,
    )
    check(
      'A.7 an unrecognised prefix is rejected at the transport layer (no_token)',
      unrecognisedPrefix.ok === false && unrecognisedPrefix.reason === 'no_token',
    )

    const noHeader = await resolveStoaDeclareIdentity(fakeRequest({}), okValidator)
    check('A.8 no Authorization header at all → no_token', noHeader.ok === false && noHeader.reason === 'no_token')
  }

  // ============================================================================
  // B. Presence resolution — never throws, never gates
  // ============================================================================
  {
    console.log('§B presence resolution (never a gate)')
    const invalidValidator: StoaCredentialValidator = async () => ({
      valid: false,
      reason: 'invalid_token',
    })
    const throwingValidator: StoaCredentialValidator = async () => {
      throw new Error('simulated DB outage')
    }
    const okValidator: StoaCredentialValidator = async () => ({
      valid: true,
      row: mkRow({ agent_id: null }), // an owner-only credential presents no agent identity
      capabilities: ['consult'],
    })

    const invalidResult = await resolveStoaCredentialPresence(
      fakeRequest({ authorization: 'Bearer sr_live_bad' }),
      invalidValidator,
    )
    check('B.1 an invalid credential resolves to null (never an error to the caller)', invalidResult === null)

    const throwResult = await resolveStoaCredentialPresence(
      fakeRequest({ authorization: 'Bearer sr_live_x' }),
      throwingValidator,
    )
    check('B.2 a throwing validator resolves to null (fail-closed, never propagates)', throwResult === null)

    const noTokenResult = await resolveStoaCredentialPresence(fakeRequest({}))
    check('B.3 no credential at all resolves to null with the DEFAULT (real) validator never invoked', noTokenResult === null)

    const noAgentResult = await resolveStoaCredentialPresence(
      fakeRequest({ authorization: 'Bearer sr_live_ok' }),
      okValidator,
    )
    check(
      'B.4 a valid owner-only credential (no agent_id) still resolves presence, with agentId null',
      noAgentResult !== null && noAgentResult.agentId === null,
    )
  }

  // ============================================================================
  // C. Declare resolution — full failure taxonomy + success shape
  // ============================================================================
  {
    console.log('§C declare resolution (the identity floor, #13)')

    const suspendedValidator: StoaCredentialValidator = async () => ({
      valid: false,
      reason: 'suspended',
      suspendedReason: 'revoked',
    })
    const declareInvalid = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_prac_x' }),
      suspendedValidator,
    )
    check(
      'C.1 a suspended/invalid credential → invalid_token (collapsed, no reason leak)',
      declareInvalid.ok === false && declareInvalid.reason === 'invalid_token',
    )

    const noOwnerValidator: StoaCredentialValidator = async () => ({
      valid: true,
      row: mkRow({ owner_user_id: null }),
      capabilities: ['consult'],
    })
    const declareNoOwner = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_live_x' }),
      noOwnerValidator,
    )
    check(
      'C.2 an owner-less credential → no_owner (#13 — no accountable declarer)',
      declareNoOwner.ok === false && declareNoOwner.reason === 'no_owner',
    )

    const noAgentValidator: StoaCredentialValidator = async () => ({
      valid: true,
      row: mkRow({ agent_id: null }),
      capabilities: ['consult'],
    })
    const declareNoAgent = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_live_x' }),
      noAgentValidator,
    )
    check(
      'C.3 an owner-bound but agent-less credential → no_agent',
      declareNoAgent.ok === false && declareNoAgent.reason === 'no_agent',
    )

    const okValidator: StoaCredentialValidator = async () => ({
      valid: true,
      row: mkRow({ id: 'row-42', owner_user_id: 'owner-42', agent_id: 'sagereasoning:demo@v1' }),
      capabilities: ['consult'],
    })
    const declareOk = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_prac_ok' }),
      okValidator,
    )
    check(
      'C.4 owner+agent-bound valid credential → ok, identity taken from the CREDENTIAL row',
      declareOk.ok === true &&
        declareOk.agentId === 'sagereasoning:demo@v1' &&
        declareOk.ownerUserId === 'owner-42',
      JSON.stringify(declareOk),
    )
    check(
      'C.5 credentialRef follows the api_key:<id> convention (the trajectory/erasure precedent)',
      declareOk.ok === true && declareOk.credentialRef === 'api_key:row-42',
    )

    // Non-vacuity: the success branch really did read row.agent_id / row.owner_user_id,
    // not a hardcoded value — vary the row and confirm the identity varies with it.
    const variedValidator: StoaCredentialValidator = async () => ({
      valid: true,
      row: mkRow({ id: 'row-99', owner_user_id: 'owner-99', agent_id: 'acme:other@v2' }),
      capabilities: ['consult'],
    })
    const declareVaried = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_prac_ok' }),
      variedValidator,
    )
    check(
      'C.6 non-vacuity: a different row produces a different identity (not hardcoded)',
      declareVaried.ok === true &&
        declareVaried.agentId === 'acme:other@v2' &&
        declareVaried.credentialRef === 'api_key:row-99',
    )

    const throwingValidator: StoaCredentialValidator = async () => {
      throw new Error('simulated DB outage')
    }
    const declareThrow = await resolveStoaDeclareIdentity(
      fakeRequest({ authorization: 'Bearer sr_prac_x' }),
      throwingValidator,
    )
    check(
      'C.7 a throwing validator fails closed to invalid_token (never propagates, never a false ok)',
      declareThrow.ok === false && declareThrow.reason === 'invalid_token',
    )
  }


  console.log(`\nstoa-credential battery: ${pass} passed, ${fail} failed`)
  if (fail > 0) process.exit(1)
}

run().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
