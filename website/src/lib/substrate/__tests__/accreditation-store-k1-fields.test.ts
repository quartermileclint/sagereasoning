/**
 * accreditation-store-k1-fields.test.ts — CI-11 store-mapper authority proof
 * (mechanism-correction M3, 2026-06-13).
 *
 * Run with: npx tsx --env-file=.env.local <this file>
 * (The store module transitively imports supabase-server.ts, which constructs
 * a client at module load — the client is constructed but never CALLED; this
 * test exercises the PURE mappers only. Same posture as
 * sage-assent-accreditation-writer.test.ts per CLAUDE.md.)
 *
 * What it proves (the K1 server-side-authority invariant):
 *   1. accreditationRecordToRow takes the K1 fields EXCLUSIVELY from its
 *      options — a consumer-submitted record claiming coverage_status:
 *      'continuous' writes NULL columns unless the server composed values.
 *   2. With composed options, the row carries them verbatim.
 *   3. rowToAccreditationRecord folds the columns back into the record so
 *      the public payload can serve them; NULL columns fold to null.
 */

import type { AccreditationRecord } from '../trust-layer/types/accreditation'
import {
  accreditationRecordToRow,
  rowToAccreditationRecord,
  upsertAccreditationRecord,
  type AgentAccreditationRow,
} from '../sage-assent-accreditation-store'
import { composeK1InitialCoverage } from '../trust-layer/accreditation/coverage-status'

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

const RECORD: AccreditationRecord = {
  agent_id: 'sagereasoning:m3-test@v1',
  senecan_grade: 'pre_progress',
  typical_proximity: 'reflexive',
  authority_level: 'supervised',
  dimension_levels: {
    passion_reduction: 'emerging',
    judgement_quality: 'emerging',
    disposition_stability: 'emerging',
    oikeiosis_extension: 'emerging',
  },
  direction_of_travel: 'stable',
  evaluation_window_size: 100,
  actions_evaluated: 12,
  grade_since: '2026-06-13T10:00:00.000Z',
  last_evaluation: '2026-06-13T12:30:00.000Z',
  passions_persisting: [],
  verification_url: 'https://sagereasoning.com/accreditation/sagereasoning:m3-test@v1',
  expires_at: '2026-09-11T10:00:00.000Z',
  disclaimer: 'test disclaimer',
  created_at: '2026-06-13T10:00:00.000Z',
  updated_at: '2026-06-13T12:30:00.000Z',
  typical_deliberation_breadth: 'intuited',
  typical_kathekon_quality: 'contrary',
}

// ============================================================================
// 1. A consumer-forged record cannot claim its own coverage
// ============================================================================

const forged: AccreditationRecord = {
  ...RECORD,
  coverage_status: 'continuous', // the forgery — only the hook can earn this
  monitored_since: '2020-01-01T00:00:00.000Z',
  credential_basis: 'forged basis',
}

const rowWithoutOpts = accreditationRecordToRow(forged)
assert(
  rowWithoutOpts.coverage_status === null,
  'forged record, no opts: coverage_status writes NULL (record ignored)',
)
assert(
  rowWithoutOpts.monitored_since === null,
  'forged record, no opts: monitored_since writes NULL',
)
assert(
  rowWithoutOpts.credential_basis === null,
  'forged record, no opts: credential_basis writes NULL',
)

// ============================================================================
// 2. Server-composed options are the authority
// ============================================================================

const composed = composeK1InitialCoverage(RECORD, 'wrapper_write')
const rowWithOpts = accreditationRecordToRow(forged, composed)
assert(
  rowWithOpts.coverage_status === 'agent_elected',
  'composed opts: coverage_status agent_elected (forged continuous overridden)',
)
assert(
  rowWithOpts.monitored_since === RECORD.created_at,
  'composed opts: monitored_since from the composer, not the forgery',
)
assert(
  rowWithOpts.credential_basis === composed.credential_basis,
  'composed opts: credential_basis verbatim from the composer',
)

// ============================================================================
// 3. Read-side fold-back
// ============================================================================

const readBack = rowToAccreditationRecord(rowWithOpts)
assert(
  readBack.coverage_status === 'agent_elected',
  'read: coverage_status folded into the record',
)
assert(
  readBack.monitored_since === RECORD.created_at,
  'read: monitored_since folded into the record',
)
assert(
  readBack.credential_basis === composed.credential_basis,
  'read: credential_basis folded into the record',
)

// Pre-slice rows (NULL columns) fold to null — the honest unstated state.
const preSliceRow: AgentAccreditationRow = {
  ...rowWithOpts,
  coverage_status: null,
  monitored_since: null,
  credential_basis: null,
}
const preSliceRecord = rowToAccreditationRecord(preSliceRow)
assert(preSliceRecord.coverage_status === null, 'pre-slice row: folds to null')
assert(preSliceRecord.monitored_since === null, 'pre-slice row: monitored_since null')
assert(preSliceRecord.credential_basis === null, 'pre-slice row: credential_basis null')

// ============================================================================
// 4. CI-12 chokepoint guard — upsertAccreditationRecord refuses an unreadable
//    agent_id BEFORE any DB call (write-accepted ⇒ read-accepted by
//    construction; covers the Sage Reflect feed + any future write path). The
//    guard runs ahead of the Supabase call, so an invalid id throws the
//    vocabulary error without ever touching the client.
// ============================================================================

async function assertGuard(): Promise<void> {
  const bad: AccreditationRecord = { ...RECORD, agent_id: 'p1-comparison-leg-b-agent' }
  let threw = false
  let message = ''
  try {
    await upsertAccreditationRecord(bad)
  } catch (e) {
    threw = true
    message = e instanceof Error ? e.message : String(e)
  }
  assert(threw, 'store guard: upsert of an unreadable agent_id throws before the DB call')
  assert(
    message.includes('unreadable agent_id') && message.includes('Invalid agent_id format'),
    'store guard: throw names the vocabulary failure',
  )

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

void assertGuard()
