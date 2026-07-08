/**
 * handler.test.ts — POST /api/credential/erase invariant tests (CI-14 Step 7).
 *
 * Plain-assertion script run with: npx tsx <this file>   (no --env-file, no DB — the
 * handler reaches the DB / security only through INJECTED deps, so every branch is
 * exercised with no Supabase client and no network). Async sections run inside main()
 * (CJS — no top-level await). Mirrors the trajectory-retention-sweep route test.
 *
 * Coverage: flag-off ⇒ 503; bad JSON ⇒ 400; missing confirm ⇒ 400; token mode with no
 * sr_ Bearer ⇒ 401; admin mode (credential_id) not-admin ⇒ 403; not_found ⇒ 404;
 * operator (owner present) ⇒ 409 refused; already-erased ⇒ 200 idempotent; erasable ⇒
 * 200 erased (with counts + retained_by_law + compliance logged); erase failure ⇒ 500
 * (R17c — no false "deleted"). Plus mode routing (token→lookupByToken; id→lookupById +
 * admin gate) and the scope guard keying off owner_user_id.
 */
import type { NextRequest } from 'next/server'
import { runConsumerErasure, type EraseDeps } from '../handler'
import type { ErasureCredentialRow } from '@/lib/consumer-erasure'
import type { StoreResult } from '@/lib/substrate/agent-assessment-history-store'
import type { ErasureResult } from '@/lib/consumer-erasure'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(cond: boolean, label: string): void {
  if (cond) passed++
  else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

function makeReq(body: unknown, auth: string | null): NextRequest {
  return {
    headers: {
      get(name: string): string | null {
        return name.toLowerCase() === 'authorization' ? auth : null
      },
    },
    json: async () => {
      if (body === '__throw__') throw new Error('bad json')
      return body
    },
  } as unknown as NextRequest
}

function extRow(over: Partial<ErasureCredentialRow>): ErasureCredentialRow {
  return {
    id: 'cred-1',
    owner_user_id: null,
    owner_kind: 'external_consumer',
    is_active: true,
    suspended_reason: null,
    key_prefix: 'sr_prac_abcd',
    purpose: 'unified_practice',
    credential_provenance: null,
    ...over,
  }
}

interface Spy {
  deps: EraseDeps
  calls: { authenticateAdmin: number; lookupByToken: string[]; lookupById: string[]; erase: number; log: number }
}
function makeDeps(over: Partial<EraseDeps>): Spy {
  const calls = { authenticateAdmin: 0, lookupByToken: [] as string[], lookupById: [] as string[], erase: 0, log: 0 }
  const deps: EraseDeps = {
    isEnabled: () => true,
    authenticateAdmin: async () => {
      calls.authenticateAdmin++
      return true
    },
    lookupByToken: async (t: string) => {
      calls.lookupByToken.push(t)
      return { row: extRow({}), error: null }
    },
    lookupById: async (id: string) => {
      calls.lookupById.push(id)
      return { row: extRow({ id }), error: null }
    },
    erase: async (): Promise<StoreResult<ErasureResult>> => {
      calls.erase++
      return { ok: true, value: { trajectory_deleted: 2, trust_deleted: 0, billing_depersonalised: 1, warnings: [] } }
    },
    logCompliance: async () => {
      calls.log++
    },
    ...over,
  }
  return { deps, calls }
}

async function main(): Promise<void> {
  // 1. Flag OFF ⇒ 503, no work.
  {
    const { deps, calls } = makeDeps({ isEnabled: () => false })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_x'), deps)
    assert(res.status === 503, 'flag off → 503')
    assert(calls.lookupByToken.length === 0 && calls.erase === 0, 'flag off → no lookup/erase')
  }

  // 2. Bad JSON ⇒ 400.
  {
    const { deps } = makeDeps({})
    const res = await runConsumerErasure(makeReq('__throw__', 'Bearer sr_prac_x'), deps)
    assert(res.status === 400, 'bad JSON → 400')
  }

  // 3. Missing / wrong confirm ⇒ 400.
  {
    const { deps, calls } = makeDeps({})
    const res = await runConsumerErasure(makeReq({ confirm: 'nope' }, 'Bearer sr_prac_x'), deps)
    assert(res.status === 400, 'wrong confirm → 400')
    assert(calls.erase === 0, 'wrong confirm → no erase')
  }

  // 4. Token mode, no sr_ Bearer ⇒ 401.
  {
    const { deps } = makeDeps({})
    const noAuth = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, null), deps)
    assert(noAuth.status === 401, 'token mode, no Authorization → 401')
    const notSr = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer abc123'), deps)
    assert(notSr.status === 401, 'token mode, non-sr_ Bearer → 401')
  }

  // 5. Admin mode (credential_id), not admin ⇒ 403.
  {
    const { deps, calls } = makeDeps({ authenticateAdmin: async () => false })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE', credential_id: 'cred-9' }, 'Bearer jwt'), deps)
    assert(res.status === 403, 'admin mode, not admin → 403')
    assert(calls.lookupById.length === 0, 'admin mode, not admin → no lookup')
  }

  // 6. not_found ⇒ 404 (token resolves to no row, NO error).
  {
    const { deps } = makeDeps({ lookupByToken: async () => ({ row: null, error: null }) })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_unknown'), deps)
    assert(res.status === 404, 'unknown token (clean miss) → 404 not_found')
    const body = await res.json()
    assert(body.status === 'not_found', '404 body status not_found (honest negative)')
  }

  // 6b. lookup DB ERROR ⇒ 503 retryable (NOT a false 404 not_found).
  {
    const { deps, calls } = makeDeps({ lookupByToken: async () => ({ row: null, error: 'db down' }) })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_x'), deps)
    assert(res.status === 503, 'lookup DB error → 503 retryable (not a false 404)')
    const body = await res.json()
    assert(body.status === 'lookup_error', '503 body status lookup_error (R17/R18f honesty — no false negative)')
    assert(calls.erase === 0, 'lookup error → erase never called')
  }

  // 7. refuse_operator ⇒ 409 (owner_user_id present) — TOKEN mode.
  {
    const { deps, calls } = makeDeps({ lookupByToken: async () => ({ row: extRow({ owner_user_id: 'profile-uuid' }), error: null }) })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_op'), deps)
    assert(res.status === 409, 'operator credential (token mode) → 409 refused')
    const body = await res.json()
    assert(body.reason === 'operator_credential', '409 body names operator_credential (route to /api/user/delete)')
    assert(calls.erase === 0, 'operator credential → erase NEVER called (no operator-data deletion via token path)')
  }

  // 7b. refuse_operator ⇒ 409 — ADMIN id-mode supplying an OPERATOR credential_id.
  //     The single most safety-critical branch: a privileged caller CANNOT erase
  //     operator data (both modes converge on the same owner_user_id scope guard).
  {
    const { deps, calls } = makeDeps({
      authenticateAdmin: async () => true,
      lookupById: async (id) => ({ row: extRow({ id, owner_user_id: 'op-profile' }), error: null }),
    })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE', credential_id: 'op-cred' }, 'Bearer admin-jwt'), deps)
    assert(res.status === 409, 'admin id-mode on an OPERATOR credential → 409 refused')
    const body = await res.json()
    assert(body.reason === 'operator_credential', 'admin-mode operator → reason operator_credential')
    assert(calls.erase === 0, 'admin-mode operator → erase NEVER called (privileged caller cannot delete operator data)')
  }

  // 8. already_erased ⇒ 200 idempotent.
  {
    const { deps, calls } = makeDeps({
      lookupByToken: async () => ({ row: extRow({ suspended_reason: 'consumer_erasure' }), error: null }),
    })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_done'), deps)
    assert(res.status === 200, 'already-erased → 200')
    const body = await res.json()
    assert(body.status === 'already_erased', '200 body status already_erased (idempotent)')
    assert(calls.erase === 0, 'already-erased → erase not re-run')
  }

  // 9. erasable ⇒ 200 erased, with counts + retained_by_law + compliance logged.
  {
    const { deps, calls } = makeDeps({})
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_live'), deps)
    assert(res.status === 200, 'erasable → 200')
    const body = await res.json()
    assert(body.status === 'erased', '200 body status erased')
    assert(body.credential_ref === 'api_key:cred-1', 'erased body carries credential_ref')
    assert(body.trajectory_rows_deleted === 2 && body.billing_rows_depersonalised === 1, 'erased body reports counts')
    assert(body.credential === 'anonymised_and_revoked', 'erased body states the husk was anonymised+revoked')
    assert(Array.isArray(body.retained_by_law) && body.retained_by_law.length >= 1, 'erased body lists retained-by-law children (honest)')
    assert(calls.erase === 1 && calls.log === 1, 'erasable → erase once + compliance logged once')
    assert(calls.lookupByToken[0] === 'sr_prac_live', 'token mode → lookupByToken with the raw token')
  }

  // 10. erase failure ⇒ 500, no false "deleted".
  {
    const { deps } = makeDeps({ erase: async () => ({ ok: false, error: 'trajectory: db down' }) })
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE' }, 'Bearer sr_prac_fail'), deps)
    assert(res.status === 500, 'erase failure → 500')
    const body = await res.json()
    assert(body.status === 'error' && !/erased|deleted":/.test(JSON.stringify(body)) , 'erase failure → status error, no false deleted (R17c honesty)')
  }

  // 11. Admin mode happy path ⇒ uses lookupById, gated by admin auth.
  {
    const { deps, calls } = makeDeps({})
    const res = await runConsumerErasure(makeReq({ confirm: 'ERASE', credential_id: 'cred-77' }, 'Bearer admin-jwt'), deps)
    assert(res.status === 200, 'admin mode happy path → 200')
    assert(calls.authenticateAdmin === 1, 'admin mode → admin authenticated')
    assert(calls.lookupById[0] === 'cred-77', 'admin mode → lookupById with the supplied credential_id')
    assert(calls.lookupByToken.length === 0, 'admin mode → token lookup NOT used')
    const body = await res.json()
    assert(body.credential_ref === 'api_key:cred-77', 'admin mode → erases the supplied credential')
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

void main()
