/**
 * provenance-ledger-store.test.ts — slice 1 coverage for the R17 data-rights
 * seam of the signature-keyed extraction-provenance ledger.
 *
 * Plain-assertion script run with: npx tsx <this file>   (no --env-file, no DB —
 * the fns reach the DB only through an INJECTED fake client). A minimal
 * chainable fake, mirroring consumer-erasure.test.ts's own fake, since this
 * store's call shapes (delete().eq().select('id'); select('*').eq()) are a
 * strict subset of that one's.
 *
 * Coverage:
 *   • deleteProvenanceDataForOwner / deleteProvenanceDataForCredential — both
 *     tables touched, counts summed, missing-table-benign on either or both.
 *   • getProvenanceDataForOwner — both tables exported, missing-table-benign.
 *   • A real (non-missing-table) error on EITHER table surfaces ok:false —
 *     fail-honest, never silently dropped.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  deleteProvenanceDataForOwner,
  deleteProvenanceDataForCredential,
  getProvenanceDataForOwner,
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
  op?: 'select' | 'delete'
  eq: Array<[string, unknown]>
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
  eq(col: string, val: unknown): this {
    this.cap.eq.push([col, val])
    return this
  }
  then<T>(resolve: (r: Result) => T): Promise<T> {
    return Promise.resolve(this.result).then(resolve)
  }
}
function makeClient(resultFor: (table: string) => Result): { client: unknown; captures: Capture[] } {
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

async function main(): Promise<void> {
  // ==========================================================================
  // 1. deleteProvenanceDataForOwner — both tables touched, counts summed
  // ==========================================================================
  {
    const { client, captures } = makeClient((table) => {
      if (table === 'agent_provenance_ledger') return { data: [{ id: 'l1' }, { id: 'l2' }], error: null }
      if (table === 'agent_provenance_gaps') return { data: [{ id: 'g1' }], error: null }
      return { data: null, error: null }
    })
    const res = await deleteProvenanceDataForOwner('owner-1', client as never)
    assert(res.ok, 'delete-by-owner: ok:true')
    if (res.ok) {
      assert(res.value.ledger === 2, 'delete-by-owner: ledger count')
      assert(res.value.gaps === 1, 'delete-by-owner: gaps count')
    }
    const ledgerCap = captures.find((c) => c.table === 'agent_provenance_ledger')!
    assert(
      ledgerCap.op === 'delete' && ledgerCap.eq[0][0] === 'owner_user_id' && ledgerCap.eq[0][1] === 'owner-1',
      'delete-by-owner: ledger deleted by owner_user_id',
    )
    const gapsCap = captures.find((c) => c.table === 'agent_provenance_gaps')!
    assert(
      gapsCap.op === 'delete' && gapsCap.eq[0][0] === 'owner_user_id' && gapsCap.eq[0][1] === 'owner-1',
      'delete-by-owner: gaps deleted by owner_user_id',
    )
  }

  // ==========================================================================
  // 2. deleteProvenanceDataForCredential — same shape, keyed on credential_ref
  // ==========================================================================
  {
    const { client, captures } = makeClient((table) => {
      if (table === 'agent_provenance_ledger') return { data: [{ id: 'l1' }], error: null }
      if (table === 'agent_provenance_gaps') return { data: [], error: null }
      return { data: null, error: null }
    })
    const res = await deleteProvenanceDataForCredential('api_key:cred-1', client as never)
    assert(res.ok && res.value.ledger === 1 && res.value.gaps === 0, 'delete-by-credential: counts')
    const ledgerCap = captures.find((c) => c.table === 'agent_provenance_ledger')!
    assert(ledgerCap.eq[0][0] === 'credential_ref' && ledgerCap.eq[0][1] === 'api_key:cred-1', 'delete-by-credential: keyed on credential_ref')
  }

  // ==========================================================================
  // 3. getProvenanceDataForOwner — both tables exported
  // ==========================================================================
  {
    const { client } = makeClient((table) => {
      if (table === 'agent_provenance_ledger') return { data: [{ id: 'l1' }], error: null }
      if (table === 'agent_provenance_gaps') return { data: [{ id: 'g1' }, { id: 'g2' }], error: null }
      return { data: null, error: null }
    })
    const res = await getProvenanceDataForOwner('owner-2', client as never)
    assert(res.ok, 'export-by-owner: ok:true')
    if (res.ok) {
      assert(res.value.ledger.length === 1, 'export-by-owner: ledger rows returned')
      assert(res.value.gaps.length === 2, 'export-by-owner: gaps rows returned')
    }
  }

  // ==========================================================================
  // 4. Missing-table-benign — both tables absent (pre-migration state, the
  //    slice-1 end state) never breaks delete or export.
  // ==========================================================================
  {
    const MISSING = { data: null, error: { code: '42P01', message: 'relation does not exist' } }
    const { client } = makeClient(() => MISSING)
    const del = await deleteProvenanceDataForOwner('owner-3', client as never)
    assert(del.ok && del.value.ledger === 0 && del.value.gaps === 0, 'missing-table-benign: delete-by-owner ok, zero counts')
    const delc = await deleteProvenanceDataForCredential('api_key:x', client as never)
    assert(delc.ok && delc.value.ledger === 0 && delc.value.gaps === 0, 'missing-table-benign: delete-by-credential ok, zero counts')
    const exp = await getProvenanceDataForOwner('owner-3', client as never)
    assert(exp.ok && exp.value.ledger.length === 0 && exp.value.gaps.length === 0, 'missing-table-benign: export ok, empty')
  }

  // ==========================================================================
  // 5. Fail-honest — a REAL (non-missing-table) error on EITHER table surfaces
  //    ok:false; never silently dropped.
  // ==========================================================================
  {
    const { client } = makeClient((table) => {
      if (table === 'agent_provenance_ledger') return { data: null, error: { message: 'transient network error' } }
      return { data: null, error: null }
    })
    const del = await deleteProvenanceDataForOwner('owner-4', client as never)
    assert(!del.ok, 'fail-honest: a real ledger error surfaces ok:false (delete)')
    const exp = await getProvenanceDataForOwner('owner-4', client as never)
    assert(!exp.ok, 'fail-honest: a real ledger error surfaces ok:false (export)')
  }
  {
    // The ledger succeeds but the SECOND table (gaps) fails — must still
    // surface ok:false, not silently report only the first table's count.
    const { client } = makeClient((table) => {
      if (table === 'agent_provenance_ledger') return { data: [{ id: 'l1' }], error: null }
      if (table === 'agent_provenance_gaps') return { data: null, error: { message: 'transient network error' } }
      return { data: null, error: null }
    })
    const del = await deleteProvenanceDataForOwner('owner-5', client as never)
    assert(!del.ok, 'fail-honest: a real gaps error surfaces ok:false even when ledger succeeded first')
  }

  // ==========================================================================
  // 6. F-2's hard exclusion (SCOPE §4.1/§6.4), pinned STRUCTURALLY against the
  //    migration's own CREATE TABLE text — a standing drift guard (PR19 fold,
  //    2026-08-26 review) so a slice-2/3 ALTER TABLE can never silently add a
  //    signature/artifact-detail column to agent_provenance_gaps without this
  //    test failing. Text-based (mirrors the project's stoic-brain.ts C12 drift
  //    pin pattern) since no live DB exists to introspect in this harness.
  // ==========================================================================
  {
    const sql = readFileSync(
      join(__dirname, '../../../../../supabase-agent-provenance-gaps-migration.sql'),
      'utf-8',
    )
    const createStart = sql.indexOf('CREATE TABLE IF NOT EXISTS public.agent_provenance_gaps')
    assert(createStart !== -1, 'F-2 pin: found the agent_provenance_gaps CREATE TABLE block')
    const createEnd = sql.indexOf('\n);', createStart)
    const block = sql.slice(createStart, createEnd)
    const columnLines = block
      .split('\n')
      .filter((line) => !line.trim().startsWith('--')) // strip comment-only lines
    const leaksSignature = columnLines.some((line) => /signature/i.test(line))
    assert(!leaksSignature, 'F-2 pin: no signature-derived column exists on agent_provenance_gaps')
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error('  - ' + f)
    process.exit(1)
  }
}

main()
