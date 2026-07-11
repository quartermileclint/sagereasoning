/**
 * consumer-erasure.test.ts — CI-14 Step 7 lib invariants.
 *
 * Plain-assertion script run with: npx tsx <this file>   (no --env-file, no DB — the
 * fns reach the DB only through an INJECTED fake client; the pure classifier needs no
 * I/O). Async sections run inside main() (this project's tsx targets CJS — no
 * top-level await). Mirrors the agent-assessment-history-store test harness.
 *
 * Coverage:
 *   • classifyErasureTarget — the pure scope guard: owner_user_id IS NULL ⇒ erasable;
 *     owner present ⇒ refuse_operator; the consumer-erasure marker ⇒ already_erased;
 *     null row ⇒ not_found. KEYS OFF owner_user_id, NOT owner_kind (robust to the
 *     legacy-mint owner_kind drift — an 'operator'-labelled null-owner row is erasable).
 *   • eraseExternalConsumerCredential — the three-step erase: hard-delete trajectory →
 *     anonymise+revoke the husk → best-effort billing de-personalisation; the trajectory
 *     and anonymise steps are must-succeed (fail ⇒ ok:false, R17c verifiable); a billing
 *     failure is a WARNING, not fatal. KG7 (credential_provenance jsonb merged + passed
 *     as an object).
 */
import {
  classifyErasureTarget,
  eraseExternalConsumerCredential,
  CONSUMER_ERASURE_MARKER,
  type ErasureCredentialRow,
} from '../consumer-erasure'

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

// ── A minimal chainable fake Supabase client, per-table results ──────────────
type Result = { data: unknown; error: unknown }
interface Capture {
  table: string
  op?: 'select' | 'delete' | 'update'
  row?: Record<string, unknown>
  eq: Array<[string, unknown]>
  is?: [string, unknown]
  not?: [string, string, unknown]
  maybeSingle?: boolean
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
  update(row: Record<string, unknown>): this {
    this.cap.op = 'update'
    this.cap.row = row
    return this
  }
  eq(col: string, val: unknown): this {
    this.cap.eq.push([col, val])
    return this
  }
  is(col: string, val: unknown): this {
    this.cap.is = [col, val]
    return this
  }
  not(col: string, op: string, val: unknown): this {
    this.cap.not = [col, op, val]
    return this
  }
  maybeSingle(): Promise<Result> {
    this.cap.maybeSingle = true
    return Promise.resolve(this.result)
  }
  then<T>(resolve: (r: Result) => T): Promise<T> {
    return Promise.resolve(this.result).then(resolve)
  }
}
function makeClient(resultFor: (table: string) => Result): {
  client: unknown
  captures: Capture[]
} {
  const captures: Capture[] = []
  const client = {
    from(table: string): FakeQuery {
      const cap: Capture = { table, eq: [] }
      captures.push(cap)
      return new FakeQuery(cap, resultFor(table))
    },
  }
  return { client, captures }
}

function row(over: Partial<ErasureCredentialRow>): ErasureCredentialRow {
  return {
    id: 'cred-1',
    owner_user_id: null,
    owner_kind: 'external_consumer',
    is_active: true,
    suspended_reason: null,
    key_prefix: 'sr_prac_abcd',
    purpose: 'unified_practice',
    credential_provenance: null,
    agent_id: null,
    ...over,
  }
}

async function main(): Promise<void> {
  // ==========================================================================
  // 1. classifyErasureTarget — the pure scope guard
  // ==========================================================================
  assert(classifyErasureTarget(null) === 'not_found', 'classify: null row → not_found')
  assert(
    classifyErasureTarget(row({ owner_user_id: null })) === 'erasable',
    'classify: null owner → erasable',
  )
  assert(
    classifyErasureTarget(row({ owner_user_id: 'profile-uuid' })) === 'refuse_operator',
    'classify: owner present → refuse_operator (route to /api/user/delete)',
  )
  // The owner_kind-drift robustness case: a legacy-mint row mislabelled 'operator'
  // but with a NULL owner is STILL erasable (the guard keys off owner_user_id).
  assert(
    classifyErasureTarget(row({ owner_user_id: null, owner_kind: 'operator' })) === 'erasable',
    'classify: null owner + owner_kind=operator (legacy-mint drift) → STILL erasable',
  )
  // Inverse: owner present + owner_kind=external_consumer ⇒ still refuse (owner wins).
  assert(
    classifyErasureTarget(row({ owner_user_id: 'x', owner_kind: 'external_consumer' })) ===
      'refuse_operator',
    'classify: owner present even if owner_kind=external_consumer → refuse_operator',
  )
  // Idempotency: a husk already carrying the marker → already_erased.
  assert(
    classifyErasureTarget(row({ suspended_reason: CONSUMER_ERASURE_MARKER })) === 'already_erased',
    'classify: consumer-erasure marker → already_erased (idempotent)',
  )
  // A row revoked for ANOTHER reason (not erased) is still erasable.
  assert(
    classifyErasureTarget(row({ is_active: false, suspended_reason: 'admin_revocation' })) ===
      'erasable',
    'classify: revoked-for-other-reason (not erased) → still erasable',
  )

  // ==========================================================================
  // 2. eraseExternalConsumerCredential — happy path (all three steps succeed)
  // ==========================================================================
  {
    const { client, captures } = makeClient((table) => {
      if (table === 'agent_assessment_history') return { data: [{ id: 't1' }, { id: 't2' }], error: null }
      if (table === 'api_keys') return { data: [{ id: 'cred-1' }], error: null } // 1 row matched the owner-null guard
      if (table === 'loop_billing_events') return { data: [{ id: 'b1' }], error: null }
      return { data: null, error: null }
    })
    const res = await eraseExternalConsumerCredential(
      { id: 'cred-1', credential_provenance: { minted_by: 'admin/api-keys' }, agent_id: null },
      client as never,
    )
    assert(res.ok, 'erase: happy path → ok:true')
    if (res.ok) {
      assert(res.value.trajectory_deleted === 2, 'erase: reports trajectory_deleted count')
      assert(res.value.billing_depersonalised === 1, 'erase: reports billing_depersonalised count')
      assert(res.value.warnings.length === 0, 'erase: clean run → no warnings')
    }
    // Step order + scoping.
    const traj = captures.find((c) => c.table === 'agent_assessment_history')!
    assert(traj.op === 'delete' && traj.eq[0][0] === 'credential_ref' && traj.eq[0][1] === 'api_key:cred-1',
      'erase: trajectory hard-deleted by credential_ref (api_key:<id>)')
    const keys = captures.find((c) => c.table === 'api_keys')!
    assert(keys.op === 'update' && keys.eq[0][0] === 'id' && keys.eq[0][1] === 'cred-1',
      'erase: api_keys row updated by id')
    assert(keys.is?.[0] === 'owner_user_id' && keys.is?.[1] === null,
      'erase: anonymise UPDATE re-asserts owner_user_id IS NULL (atomic scope guard)')
    const u = keys.row as Record<string, unknown>
    assert(u.owner_email === null && u.label === '[erased]' && u.notes === null && u.agent_id === null,
      'erase: PII fields nulled (owner_email/label/notes/agent_id)')
    assert(u.is_active === false && u.suspended_reason === CONSUMER_ERASURE_MARKER,
      'erase: husk revoked + marked consumer_erasure')
    const prov = u.credential_provenance as Record<string, unknown>
    assert(prov.minted_by === 'admin/api-keys' && prov.erased_basis === 'consumer_erasure_by_token' && typeof prov.erased_at === 'string',
      'erase: KG7 provenance merged (original kept + erased_at/erased_basis added) as an object')
    const bill = captures.find((c) => c.table === 'loop_billing_events')!
    assert(bill.op === 'update' && (bill.row as Record<string, unknown>).agent_id === null &&
      bill.eq[0][0] === 'api_key_id' && bill.eq[0][1] === 'cred-1' && bill.not?.[0] === 'agent_id',
      'erase: billing de-personalised (agent_id nulled) scoped to api_key_id, only non-null agent_id rows')
  }

  // ==========================================================================
  // 3. eraseExternalConsumerCredential — failure modes
  // ==========================================================================
  // Trajectory delete fails (real error) ⇒ ok:false, anonymise NOT attempted.
  {
    const { client, captures } = makeClient((table) => {
      if (table === 'agent_assessment_history') return { data: null, error: { message: 'db down' } }
      return { data: null, error: null }
    })
    const res = await eraseExternalConsumerCredential({ id: 'cred-1', credential_provenance: null, agent_id: null }, client as never)
    assert(!res.ok, 'erase: trajectory failure → ok:false (R17c — no false deleted)')
    assert(!captures.some((c) => c.table === 'api_keys'), 'erase: trajectory failure → api_keys NOT touched (no partial anonymise)')
  }
  // Anonymise fails (DB error) ⇒ ok:false (trajectory already deleted, but surfaced).
  {
    const { client } = makeClient((table) => {
      if (table === 'agent_assessment_history') return { data: [{ id: 't1' }], error: null }
      if (table === 'api_keys') return { data: null, error: { message: 'update denied' } }
      return { data: null, error: null }
    })
    const res = await eraseExternalConsumerCredential({ id: 'cred-1', credential_provenance: null, agent_id: null }, client as never)
    assert(!res.ok && /anonymise/.test((res as { error: string }).error), 'erase: anonymise DB error → ok:false, surfaced')
  }
  // Atomic scope guard: the owner-null UPDATE matches 0 rows (row gained an owner / is
  // gone) ⇒ ok:false, NEVER a false "erased".
  {
    const { client } = makeClient((table) => {
      if (table === 'agent_assessment_history') return { data: [{ id: 't1' }], error: null }
      if (table === 'api_keys') return { data: [], error: null } // 0 rows matched owner-null
      return { data: null, error: null }
    })
    const res = await eraseExternalConsumerCredential({ id: 'cred-1', credential_provenance: null, agent_id: null }, client as never)
    assert(!res.ok && /not found as an erasable/.test((res as { error: string }).error),
      'erase: owner-null guard matches 0 rows → ok:false (no false erased)')
  }
  // Billing de-personalisation fails ⇒ STILL ok:true (best-effort) with a warning.
  {
    const { client } = makeClient((table) => {
      if (table === 'agent_assessment_history') return { data: [{ id: 't1' }], error: null }
      if (table === 'api_keys') return { data: [{ id: 'cred-1' }], error: null }
      if (table === 'loop_billing_events') return { data: null, error: { message: 'no such table' } }
      return { data: null, error: null }
    })
    const res = await eraseExternalConsumerCredential({ id: 'cred-1', credential_provenance: null, agent_id: null }, client as never)
    assert(res.ok, 'erase: billing failure → STILL ok:true (best-effort; personal data already gone)')
    if (res.ok) {
      assert(res.value.trajectory_deleted === 1, 'erase: billing failure → trajectory still reported deleted')
      assert(res.value.warnings.length === 1 && /billing/.test(res.value.warnings[0]),
        'erase: billing failure → surfaced as a non-fatal warning')
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

void main()
