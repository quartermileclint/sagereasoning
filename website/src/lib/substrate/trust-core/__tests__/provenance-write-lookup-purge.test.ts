/**
 * provenance-write-lookup-purge.test.ts — slice 2 coverage for the
 * signature-keyed extraction-provenance ledger's write, lookup, and PR24
 * purge functions (round-6 mentor ruling, 2026-08-26).
 *
 * Plain-assertion script: npx tsx <this file>   (no --env-file, no DB — every
 * fn is exercised via an INJECTED fake client, mirroring
 * provenance-ledger-store.test.ts's own FakeQuery pattern, extended with
 * insert()/maybeSingle()/lt() for this slice's write/lookup/purge shapes).
 *
 * Coverage (slice-2 prompt Step 6 item 4):
 *   - persistProvenanceLedgerEntry: fresh insert; benign duplicate (23505);
 *     a real error surfaces ok:false; owner_user_id/agent_id set per the
 *     identity-kind branch (pair vs. credential); missing-signature callers
 *     are the ROUTE's job (not this fn's — this fn assumes a non-empty
 *     signature was already confirmed by the caller, so no separate case).
 *   - lookupProvenanceLedgerEntry: found / not-found / a real read error
 *     surfaces ok:false (fail-honest, NOT missing-table-benign — a distinct
 *     posture from the R17 delete/select helpers).
 *   - purgeExpiredProvenanceLedger / purgeExpiredProvenanceGaps: flag-off ⇒
 *     no-op (ZERO DB touch, not even a query); flag-on ⇒ missing-table-benign,
 *     real-error-surfaces, and reports the deleted count from a real delete.
 */
import {
  persistProvenanceLedgerEntry,
  lookupProvenanceLedgerEntry,
  purgeExpiredProvenanceLedger,
  purgeExpiredProvenanceGaps,
  PROVENANCE_LEDGER_ENV_VAR,
} from '../provenance-ledger-store'

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

type Result = { data: unknown; error: unknown }
interface Capture {
  table: string
  op?: 'select' | 'delete' | 'insert'
  eq: Array<[string, unknown]>
  lt: Array<[string, unknown]>
  insertedRow?: unknown
  calledMaybeSingle: boolean
}
class FakeQuery {
  constructor(private cap: Capture, private result: Result) {}
  select(): this {
    if (this.cap.op === undefined) this.cap.op = 'select'
    return this
  }
  delete(): this {
    this.cap.op = 'delete'
    return this
  }
  insert(row: unknown): this {
    this.cap.op = 'insert'
    this.cap.insertedRow = row
    return this
  }
  eq(col: string, val: unknown): this {
    this.cap.eq.push([col, val])
    return this
  }
  lt(col: string, val: unknown): this {
    this.cap.lt.push([col, val])
    return this
  }
  async maybeSingle(): Promise<Result> {
    this.cap.calledMaybeSingle = true
    return this.result
  }
  then<T>(resolve: (r: Result) => T): Promise<T> {
    return Promise.resolve(this.result).then(resolve)
  }
}
function makeClient(resultFor: (table: string, cap: Capture) => Result): {
  client: unknown
  captures: Capture[]
} {
  const captures: Capture[] = []
  const client = {
    from(table: string): FakeQuery {
      const cap: Capture = { table, eq: [], lt: [], calledMaybeSingle: false }
      captures.push(cap)
      return new FakeQuery(cap, resultFor(table, cap))
    },
  }
  return { client, captures }
}

async function main(): Promise<void> {
  // ==========================================================================
  // persistProvenanceLedgerEntry
  // ==========================================================================

  // 1. Fresh insert, owner_agent_pair branch — owner_user_id + agent_id set.
  {
    const { client, captures } = makeClient(() => ({ data: null, error: null }))
    const res = await persistProvenanceLedgerEntry(
      {
        signature: 'sig-abc',
        credentialRef: 'api_key:cred-1',
        ownerUserId: 'owner-1',
        agentId: 'sagereasoning:test@v1',
        layer1Source: 'server',
        recordedAt: new Date('2026-08-26T00:00:00Z'),
      },
      client as never,
    )
    assert(res.ok && res.value === 'inserted', 'fresh insert (pair): ok:true value:inserted')
    const cap = captures[0]
    assert(cap.table === 'agent_provenance_ledger' && cap.op === 'insert', 'wrote to the ledger table via insert()')
    const row = cap.insertedRow as Record<string, unknown>
    assert(row.identity_kind === 'owner_agent_pair', 'pair branch: identity_kind')
    assert(row.owner_user_id === 'owner-1', 'pair branch: owner_user_id set')
    assert(row.agent_id === 'sagereasoning:test@v1', 'pair branch: agent_id set')
    assert(row.credential_ref === 'api_key:cred-1', 'credential_ref always set')
    assert(row.layer1_source === 'server', 'layer1_source passed through')
    assert(row.recorded_at === '2026-08-26T00:00:00.000Z', 'recorded_at is the injected consult time, ISO string')
    assert(typeof row.signature_hash === 'string' && row.signature_hash !== 'sig-abc', 'signature_hash is a hash, not the raw signature')
  }

  // 2. Fresh insert, credential branch (owner-less) — owner_user_id null,
  //    agent_id STILL set from the raw input (the harness's own shape).
  {
    const { client, captures } = makeClient(() => ({ data: null, error: null }))
    const res = await persistProvenanceLedgerEntry(
      {
        signature: 'sig-harness',
        credentialRef: 'api_key:harness-consult',
        ownerUserId: null,
        agentId: 'sagereasoning:s9-loop@v1',
        layer1Source: 'server',
        recordedAt: new Date(),
      },
      client as never,
    )
    assert(res.ok, 'credential branch: insert ok')
    const row = captures[0].insertedRow as Record<string, unknown>
    assert(row.identity_kind === 'credential', 'credential branch: identity_kind')
    assert(row.owner_user_id === null, 'credential branch: owner_user_id null (the CHECK requires this)')
    assert(row.agent_id === 'sagereasoning:s9-loop@v1', 'credential branch: agent_id STILL carries the raw declared id')
  }

  // 3. Benign duplicate (23505) → ok:true, value:'already_recorded'.
  {
    const { client } = makeClient(() => ({ data: null, error: { code: '23505', message: 'duplicate key' } }))
    const res = await persistProvenanceLedgerEntry(
      {
        signature: 'sig-dup',
        credentialRef: 'api_key:cred-1',
        ownerUserId: 'owner-1',
        agentId: 'sagereasoning:test@v1',
        layer1Source: 'server',
        recordedAt: new Date(),
      },
      client as never,
    )
    assert(res.ok && res.value === 'already_recorded', 'insert-once: a 23505 conflict is a benign no-op')
  }

  // 4. A real error surfaces ok:false.
  {
    const { client } = makeClient(() => ({ data: null, error: { message: 'connection reset' } }))
    const res = await persistProvenanceLedgerEntry(
      {
        signature: 'sig-fail',
        credentialRef: 'api_key:cred-1',
        ownerUserId: 'owner-1',
        agentId: 'sagereasoning:test@v1',
        layer1Source: 'server',
        recordedAt: new Date(),
      },
      client as never,
    )
    assert(!res.ok, 'fail-honest: a real write error surfaces ok:false')
  }

  // ==========================================================================
  // lookupProvenanceLedgerEntry
  // ==========================================================================

  // 5. Found — the row's fields are returned verbatim.
  {
    const { client, captures } = makeClient(() => ({
      data: {
        identity_kind: 'owner_agent_pair',
        owner_user_id: 'owner-1',
        agent_id: 'sagereasoning:test@v1',
        layer1_source: 'server',
        recorded_at: '2026-08-20T00:00:00Z',
      },
      error: null,
    }))
    const res = await lookupProvenanceLedgerEntry('sig-abc', client as never)
    assert(res.ok, 'lookup found: ok:true')
    if (res.ok && res.value.found) {
      assert(res.value.entry.identity_kind === 'owner_agent_pair', 'lookup found: identity_kind returned')
      assert(res.value.entry.owner_user_id === 'owner-1', 'lookup found: owner_user_id returned')
      assert(res.value.entry.layer1_source === 'server', 'lookup found: layer1_source returned')
    } else {
      assert(false, 'lookup found: expected found:true')
    }
    assert(captures[0].calledMaybeSingle, 'lookup uses maybeSingle()')
    assert(captures[0].eq.some(([col]) => col === 'signature_hash'), 'lookup filters by signature_hash')
  }

  // 6. Not found — data null, no error → found:false.
  {
    const { client } = makeClient(() => ({ data: null, error: null }))
    const res = await lookupProvenanceLedgerEntry('sig-missing', client as never)
    assert(res.ok && res.value.found === false, 'lookup not found: ok:true, found:false')
  }

  // 7. A real error (INCLUDING a missing-table shape) surfaces ok:false —
  //    fail-honest, NOT coerced into found:false (SCOPE §5's "not fail-open"
  //    rule; deliberately DIFFERENT from the R17 delete/select helpers'
  //    missing-table-benign posture).
  {
    const { client } = makeClient(() => ({
      data: null,
      error: { code: '42P01', message: 'relation "agent_provenance_ledger" does not exist' },
    }))
    const res = await lookupProvenanceLedgerEntry('sig-x', client as never)
    assert(!res.ok, 'lookup: a missing-table error surfaces ok:false, NOT found:false (instrument failure ≠ lookup miss)')
  }
  {
    const { client } = makeClient(() => ({ data: null, error: { message: 'transient network error' } }))
    const res = await lookupProvenanceLedgerEntry('sig-y', client as never)
    assert(!res.ok, 'lookup: a real error surfaces ok:false')
  }

  // ==========================================================================
  // purgeExpiredProvenanceLedger / purgeExpiredProvenanceGaps
  // ==========================================================================

  const priorFlag = process.env[PROVENANCE_LEDGER_ENV_VAR]

  // 8. Flag OFF ⇒ ZERO DB touch (the client is never even called).
  {
    delete process.env[PROVENANCE_LEDGER_ENV_VAR]
    let clientCalled = false
    const client = {
      from(): never {
        clientCalled = true
        throw new Error('purge must not touch the DB when its flag is off')
      },
    }
    const ledgerRes = await purgeExpiredProvenanceLedger(client as never)
    const gapsRes = await purgeExpiredProvenanceGaps(client as never)
    assert(!clientCalled, 'flag off: neither purge touches the injected client at all')
    assert(ledgerRes.deleted === 0 && ledgerRes.error === null, 'flag off: purgeExpiredProvenanceLedger is a documented no-op')
    assert(gapsRes.deleted === 0 && gapsRes.error === null, 'flag off: purgeExpiredProvenanceGaps is a documented no-op')
  }

  // 9. Flag ON, missing table ⇒ benign { deleted: 0, error: null }.
  {
    process.env[PROVENANCE_LEDGER_ENV_VAR] = 'true'
    const { client } = makeClient(() => ({ data: null, error: { code: '42P01', message: 'does not exist' } }))
    const ledgerRes = await purgeExpiredProvenanceLedger(client as never)
    const gapsRes = await purgeExpiredProvenanceGaps(client as never)
    assert(ledgerRes.deleted === 0 && ledgerRes.error === null, 'flag on, missing table: ledger purge benign')
    assert(gapsRes.deleted === 0 && gapsRes.error === null, 'flag on, missing table: gaps purge benign')
  }

  // 10. Flag ON, a real error surfaces (never silently swallowed, never fail-closed).
  {
    process.env[PROVENANCE_LEDGER_ENV_VAR] = 'true'
    const { client } = makeClient(() => ({ data: null, error: { message: 'permission denied' } }))
    const ledgerRes = await purgeExpiredProvenanceLedger(client as never)
    assert(ledgerRes.deleted === 0 && typeof ledgerRes.error === 'string' && /permission denied/.test(ledgerRes.error), 'flag on, real error: surfaced')
  }

  // 11. Flag ON, expired rows genuinely deleted — reports the real count,
  //     and filters on retain_until (the age check).
  {
    process.env[PROVENANCE_LEDGER_ENV_VAR] = 'true'
    const { client, captures } = makeClient(() => ({ data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], error: null }))
    const ledgerRes = await purgeExpiredProvenanceLedger(client as never)
    assert(ledgerRes.deleted === 3, 'flag on: real delete reports the count')
    assert(captures[0].op === 'delete', 'purge deletes')
    assert(captures[0].lt.some(([col]) => col === 'retain_until'), 'purge filters on retain_until (age check)')
  }

  if (priorFlag === undefined) delete process.env[PROVENANCE_LEDGER_ENV_VAR]
  else process.env[PROVENANCE_LEDGER_ENV_VAR] = priorFlag

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

main()
