/**
 * agent-assessment-history-store.test.ts — CI-5 trajectory persistence
 * (mechanism-correction M6, 2026-06-14).
 *
 * Plain-assertion script run with: npx tsx <this file>   (env-only; no Supabase
 * chain — every I/O fn takes an INJECTED fake client, so getAdminClient() is
 * never called and no real creds / --env-file are needed). Async sections run
 * inside main() (this project's tsx targets CJS — no top-level await).
 *
 * Proves: the flag reader (unset = no write, byte-identical); the pure mapper
 * (KG7 arrays direct; identity + structural projection); the awaited write keyed
 * to the credential (one row, correct identity); unique-violation tolerance
 * (benign no-op); fail-honest (never throws into the response); the credential
 * context lookup; and the R17c deletion + R17i export scoped to the operator.
 */

import type { EvaluatedAction } from '../trust-layer/types/evaluation'
import {
  TRAJECTORY_WRITE_ENV_VAR,
  isTrajectoryWriteEnabled,
  assessmentHistoryInputToRow,
  persistAssessmentHistory,
  resolveCredentialContext,
  deleteAssessmentHistoryForOwner,
  getAssessmentHistoryForOwner,
  type AssessmentHistoryInput,
} from '../agent-assessment-history-store'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

// ============================================================================
// A minimal fake Supabase query builder: chainable + thenable, capturing calls.
// ============================================================================

interface Capture {
  table: string
  op?: 'insert' | 'delete' | 'select'
  row?: Record<string, unknown>
  select?: string
  eq: Array<[string, unknown]>
  order?: [string, unknown]
  maybeSingle?: boolean
}

type Result = { data: unknown; error: unknown }

class FakeQuery {
  constructor(private cap: Capture, private result: Result) {}
  insert(row: Record<string, unknown>): this {
    this.cap.op = 'insert'
    this.cap.row = row
    return this
  }
  delete(): this {
    this.cap.op = 'delete'
    return this
  }
  select(sel?: string): this {
    if (this.cap.op === undefined) this.cap.op = 'select'
    this.cap.select = sel
    return this
  }
  eq(col: string, val: unknown): this {
    this.cap.eq.push([col, val])
    return this
  }
  order(col: string, opts: unknown): this {
    this.cap.order = [col, opts]
    return this
  }
  maybeSingle(): Promise<Result> {
    this.cap.maybeSingle = true
    return Promise.resolve(this.result)
  }
  // Make the builder awaitable (resolves to { data, error }).
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

const throwingClient = {
  from(): never {
    throw new Error('connection refused')
  },
} as unknown

// ============================================================================
// Fixtures
// ============================================================================

const sampleAction: EvaluatedAction = {
  receipt_id: 'rcpt_abc',
  agent_id: 'api_key:key-123',
  evaluated_at: '2026-06-14T00:00:00.000Z',
  proximity: 'deliberate',
  is_kathekon: true,
  kathekon_quality: 'strong',
  passions_detected: [{ root_passion: 'epithumia', sub_species: 'greed' }],
  virtue_domains_engaged: ['justice', 'wisdom'],
  oikeiosis_met: true,
  oikeiosis_stage: 'community',
  ruling_faculty_state: 'assenting',
  skill_id: 'api_reason',
  candidates_considered: 1,
}

const sampleInput: AssessmentHistoryInput = {
  correlationId: '550e8400-e29b-41d4-a716-446655440000',
  credentialRef: 'api_key:key-123',
  ownerUserId: 'owner-uuid',
  agentId: 'acme:bot@v1',
  depthTier: 'standard',
  surface: 'api_reason',
  action: sampleAction,
}

async function main(): Promise<void> {
  // ==========================================================================
  // 1. Flag reader — unset = byte-identical (no write)
  // ==========================================================================
  const priorFlag = process.env[TRAJECTORY_WRITE_ENV_VAR]
  delete process.env[TRAJECTORY_WRITE_ENV_VAR]
  assert(isTrajectoryWriteEnabled() === false, 'flag unset → false (no write, byte-identical)')
  process.env[TRAJECTORY_WRITE_ENV_VAR] = 'true'
  assert(isTrajectoryWriteEnabled() === true, "flag 'true' → true")
  process.env[TRAJECTORY_WRITE_ENV_VAR] = 'false'
  assert(isTrajectoryWriteEnabled() === false, "flag 'false' → false")
  process.env[TRAJECTORY_WRITE_ENV_VAR] = 'TRUE'
  assert(isTrajectoryWriteEnabled() === false, "flag 'TRUE' → false (exact match only)")
  if (priorFlag === undefined) delete process.env[TRAJECTORY_WRITE_ENV_VAR]
  else process.env[TRAJECTORY_WRITE_ENV_VAR] = priorFlag

  // ==========================================================================
  // 2. Pure mapper — KG7 + identity + structural projection
  // ==========================================================================
  const row = assessmentHistoryInputToRow(sampleInput)
  assert(row.correlation_id === '550e8400-e29b-41d4-a716-446655440000', 'mapper: correlation_id')
  assert(row.credential_ref === 'api_key:key-123', 'mapper: credential_ref')
  assert(row.owner_user_id === 'owner-uuid', 'mapper: owner_user_id')
  assert(row.agent_id === 'acme:bot@v1', 'mapper: agent_id (declared K1 identity)')
  assert(row.depth_tier === 'standard', 'mapper: depth_tier')
  assert(row.surface === 'api_reason', 'mapper: surface')
  assert(row.receipt_id === 'rcpt_abc', 'mapper: receipt_id from action')
  assert(row.proximity === 'deliberate', 'mapper: proximity')
  assert(row.is_kathekon === true, 'mapper: is_kathekon')
  assert(row.kathekon_quality === 'strong', 'mapper: kathekon_quality')
  assert(row.oikeiosis_met === true, 'mapper: oikeiosis_met')
  assert(row.oikeiosis_stage === 'community', 'mapper: oikeiosis_stage')
  assert(row.ruling_faculty_state === 'assenting', 'mapper: ruling_faculty_state')
  assert(row.skill_id === 'api_reason', 'mapper: skill_id')
  assert(row.candidates_considered === 1, 'mapper: candidates_considered')
  // KG7: passions_detected passed DIRECTLY (same ref → no JSON.stringify).
  assert(
    row.passions_detected === sampleAction.passions_detected,
    'mapper KG7: passions_detected is the array directly (same ref, no stringify)',
  )
  assert(Array.isArray(row.passions_detected), 'mapper KG7: passions_detected is an array')
  // virtue_domains_engaged spread into a FRESH text[] (not the same ref) but equal.
  assert(
    row.virtue_domains_engaged !== sampleAction.virtue_domains_engaged,
    'mapper: virtue_domains_engaged is a fresh array (text[])',
  )
  assert(
    JSON.stringify(row.virtue_domains_engaged) === JSON.stringify(['justice', 'wisdom']),
    'mapper: virtue_domains_engaged content preserved',
  )
  // Nullable identity tolerated.
  const nullIdRow = assessmentHistoryInputToRow({
    ...sampleInput,
    ownerUserId: null,
    agentId: null,
    depthTier: null,
  })
  assert(nullIdRow.owner_user_id === null, 'mapper: null owner_user_id tolerated')
  assert(nullIdRow.agent_id === null, 'mapper: null agent_id tolerated')
  assert(nullIdRow.depth_tier === null, 'mapper: null depth_tier tolerated')

  // ==========================================================================
  // 3. persistAssessmentHistory — one awaited write keyed to the credential
  // ==========================================================================
  {
    const { client, captures } = makeClient(() => ({ data: [{ id: 'new-id' }], error: null }))
    const res = await persistAssessmentHistory(sampleInput, client as never)
    assert(res.ok && res.value.inserted === 1, 'persist: happy → inserted 1')
    assert(captures.length === 1 && captures[0].table === 'agent_assessment_history', 'persist: writes to agent_assessment_history')
    assert(captures[0].op === 'insert', 'persist: is an INSERT')
    assert(captures[0].select === 'id', 'persist: selects id (awaited)')
    const inserted = captures[0].row as Record<string, unknown>
    assert(inserted.credential_ref === 'api_key:key-123', 'persist: row keyed to credential_ref')
    assert(inserted.owner_user_id === 'owner-uuid', 'persist: row carries owner_user_id')
    assert(inserted.agent_id === 'acme:bot@v1', 'persist: row carries declared agent_id')
    assert(inserted.correlation_id === '550e8400-e29b-41d4-a716-446655440000', 'persist: row carries correlation_id')
    assert(inserted.proximity === 'deliberate', 'persist: row carries the projection')
  }

  // unique_violation (23505) → benign no-op
  {
    const { client } = makeClient(() => ({ data: null, error: { code: '23505', message: 'dup key' } }))
    const res = await persistAssessmentHistory(sampleInput, client as never)
    assert(res.ok && res.value.inserted === 0, 'persist: unique_violation → benign no-op (inserted 0)')
  }

  // other error → ok:false, surfaced (never strands the response)
  {
    const { client } = makeClient(() => ({ data: null, error: { code: '23502', message: 'not null' } }))
    const res = await persistAssessmentHistory(sampleInput, client as never)
    assert(!res.ok, 'persist: other error → ok:false')
    assert(!res.ok && res.error.includes('persistAssessmentHistory'), 'persist: error labelled')
  }

  // thrown exception → caught, ok:false (never throws)
  {
    const res = await persistAssessmentHistory(sampleInput, throwingClient as never)
    assert(!res.ok, 'persist: thrown client error → ok:false (caught)')
    assert(!res.ok && res.error.includes('threw'), 'persist: thrown error labelled')
  }

  // ==========================================================================
  // 4. resolveCredentialContext — operator + declared agent from api_keys
  // ==========================================================================
  {
    const { client, captures } = makeClient(() => ({
      data: { owner_user_id: 'owner-uuid', agent_id: 'acme:bot@v1' },
      error: null,
    }))
    const ctx = await resolveCredentialContext('key-123', client as never)
    assert(ctx.owner_user_id === 'owner-uuid', 'resolve: owner_user_id')
    assert(ctx.agent_id === 'acme:bot@v1', 'resolve: agent_id')
    assert(captures[0].table === 'api_keys', 'resolve: reads api_keys')
    assert(captures[0].eq.length === 1 && captures[0].eq[0][0] === 'id' && captures[0].eq[0][1] === 'key-123', 'resolve: scoped by id')
    assert(captures[0].maybeSingle === true, 'resolve: maybeSingle')
  }

  // error → nulls (fail-honest; the write still lands with what it has)
  {
    const { client } = makeClient(() => ({ data: null, error: { message: 'boom' } }))
    const ctx = await resolveCredentialContext('key-123', client as never)
    assert(ctx.owner_user_id === null && ctx.agent_id === null, 'resolve: error → nulls (fail-honest)')
  }

  // no row → nulls
  {
    const { client } = makeClient(() => ({ data: null, error: null }))
    const ctx = await resolveCredentialContext('key-x', client as never)
    assert(ctx.owner_user_id === null && ctx.agent_id === null, 'resolve: no row → nulls')
  }

  // ==========================================================================
  // 5. R17c deletion — scoped to the operator (owner_user_id)
  // ==========================================================================
  {
    const { client, captures } = makeClient(() => ({ data: [{ id: 1 }, { id: 2 }], error: null }))
    const res = await deleteAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(res.ok && res.value.deleted === 2, 'delete: returns deleted count')
    assert(captures[0].op === 'delete', 'delete: is a DELETE')
    assert(captures[0].table === 'agent_assessment_history', 'delete: on agent_assessment_history')
    assert(captures[0].eq.length === 1 && captures[0].eq[0][0] === 'owner_user_id' && captures[0].eq[0][1] === 'owner-uuid', 'delete: scoped to owner_user_id (R17a isolation)')
  }

  {
    const { client } = makeClient(() => ({ data: null, error: { message: 'fail' } }))
    const res = await deleteAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(!res.ok, 'delete: error → ok:false')
  }

  // Missing table (Live route before the M6 migration) → benign success.
  {
    const { client } = makeClient(() => ({ data: null, error: { code: 'PGRST205', message: "Could not find the table 'public.agent_assessment_history' in the schema cache" } }))
    const res = await deleteAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(res.ok && res.value.deleted === 0, 'delete: missing table (PGRST205) → benign success (production-safe)')
  }
  {
    const { client } = makeClient(() => ({ data: null, error: { code: '42P01', message: 'relation "public.agent_assessment_history" does not exist' } }))
    const res = await deleteAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(res.ok && res.value.deleted === 0, 'delete: missing table (42P01) → benign success')
  }

  // ==========================================================================
  // 6. R17i export — scoped to the operator, ordered
  // ==========================================================================
  {
    const sampleRow = assessmentHistoryInputToRow(sampleInput)
    const { client, captures } = makeClient(() => ({ data: [sampleRow], error: null }))
    const res = await getAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(res.ok && res.value.length === 1, 'export: returns rows')
    assert(captures[0].select === '*', 'export: selects *')
    assert(captures[0].eq[0][0] === 'owner_user_id' && captures[0].eq[0][1] === 'owner-uuid', 'export: scoped to owner_user_id')
    assert(captures[0].order !== undefined && captures[0].order[0] === 'created_at', 'export: ordered by created_at')
  }

  {
    const { client } = makeClient(() => ({ data: null, error: { message: 'fail' } }))
    const res = await getAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(!res.ok, 'export: error → ok:false')
  }

  // Missing table (Live route before the M6 migration) → benign empty export.
  {
    const { client } = makeClient(() => ({ data: null, error: { code: 'PGRST205', message: 'schema cache miss' } }))
    const res = await getAssessmentHistoryForOwner('owner-uuid', client as never)
    assert(res.ok && res.value.length === 0, 'export: missing table → benign empty (production-safe)')
  }

  // ==========================================================================
  // Tally
  // ==========================================================================
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

void main()
