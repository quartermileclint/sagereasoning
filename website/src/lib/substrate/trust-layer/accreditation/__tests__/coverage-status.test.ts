/**
 * coverage-status.test.ts — CI-11 K1 first slice (mechanism-correction M3,
 * 2026-06-13).
 *
 * Plain-assertion script run with: npx tsx <this file>   (pure imports only —
 * no Supabase chain; runs bare, no --env-file needed).
 *
 * What it proves, against the K1 ADR
 * (/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md):
 *   1. The state vocabulary is VERBATIM the ADR's five states.
 *   2. composeK1InitialCoverage sets the honest initial values for a
 *      discretionary write: agent_elected (never continuous without the
 *      hook); monitored_since = the record's created_at (window start,
 *      stable across upserts); credential_basis follows the ADR template
 *      ("examined under <operator> from <t1> to <t2>; identity <id>") with
 *      the R19e clause on the wrapper path.
 *   3. The composer is deterministic and path-honest (wrapper vs reflect
 *      clause).
 *   4. buildAccreditationPayload carries the three fields; a record without
 *      them serves null (the honest pre-slice shape).
 */

import type { AccreditationRecord } from '../../types/accreditation'
import {
  VALID_COVERAGE_STATUSES,
  composeK1InitialCoverage,
} from '../coverage-status'
import { buildAccreditationPayload } from '../accreditation-record'

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
// FIXTURE
// ============================================================================

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
// 1. The K1 vocabulary — verbatim, all five, nothing else
// ============================================================================

assert(VALID_COVERAGE_STATUSES.length === 5, 'exactly five K1 states')
assert(VALID_COVERAGE_STATUSES[0] === 'continuous', 'state 1: continuous')
assert(VALID_COVERAGE_STATUSES[1] === 'suspended', 'state 2: suspended')
assert(
  VALID_COVERAGE_STATUSES[2] === 'resumed_unverified',
  'state 3: resumed_unverified',
)
assert(VALID_COVERAGE_STATUSES[3] === 'expired', 'state 4: expired')
assert(VALID_COVERAGE_STATUSES[4] === 'agent_elected', 'state 5: agent_elected')

// ============================================================================
// 2. Honest initial values — wrapper write path
// ============================================================================

const wrapper = composeK1InitialCoverage(RECORD, 'wrapper_write')

assert(
  wrapper.coverage_status === 'agent_elected',
  'wrapper write: status is agent_elected (discretionary submission — never continuous without the hook)',
)
assert(
  wrapper.monitored_since === RECORD.created_at,
  'wrapper write: monitored_since is the record created_at (window start)',
)
assert(
  wrapper.credential_basis.includes(
    'examined under unattributed operator from 2026-06-13T10:00:00.000Z to 2026-06-13T12:30:00.000Z',
  ),
  'wrapper write: basis follows the K1 ADR template (examined under <operator> from <t1> to <t2>)',
)
assert(
  wrapper.credential_basis.includes('identity sagereasoning:m3-test@v1'),
  'wrapper write: basis names the agent identity',
)
assert(
  wrapper.credential_basis.includes('coverage: agent_elected'),
  'wrapper write: basis names the coverage state',
)
assert(
  wrapper.credential_basis.includes('single-session credentialing per R19e'),
  'wrapper write: basis carries the R19e configuration-honesty clause',
)
assert(
  wrapper.credential_basis.includes('window self-reported by submitter'),
  'wrapper write: window is labelled self-reported (consumer-supplied timestamps are not presented as server-verified — R18f/R19 honesty)',
)
assert(
  !wrapper.credential_basis.includes('server-observed'),
  'wrapper write: window is NOT claimed server-observed',
)

// ============================================================================
// 3. Path honesty + determinism
// ============================================================================

const reflect = composeK1InitialCoverage(RECORD, 'sage_reflect_feed')

assert(
  reflect.coverage_status === 'agent_elected',
  'reflect feed: status is agent_elected (still discretionary submission)',
)
assert(
  reflect.credential_basis.includes('evidence via Sage Reflect session close'),
  'reflect feed: basis names the reflect evidence path',
)
assert(
  !reflect.credential_basis.includes('single-session credentialing per R19e'),
  'reflect feed: basis does NOT carry the wrapper path clause',
)
assert(
  reflect.credential_basis.includes('window server-observed'),
  'reflect feed: window is labelled server-observed (server-stamped timestamps)',
)
assert(
  !reflect.credential_basis.includes('self-reported'),
  'reflect feed: window is NOT labelled self-reported',
)

const again = composeK1InitialCoverage(RECORD, 'wrapper_write')
assert(
  JSON.stringify(again) === JSON.stringify(wrapper),
  'composer is deterministic (same record → identical output)',
)

// ============================================================================
// 4. Payload carriage
// ============================================================================

// Pre-slice record (no K1 fields) → payload serves null, never undefined.
const prePayload = buildAccreditationPayload(RECORD)
assert(prePayload.coverage_status === null, 'pre-slice record: payload coverage_status null')
assert(prePayload.monitored_since === null, 'pre-slice record: payload monitored_since null')
assert(prePayload.credential_basis === null, 'pre-slice record: payload credential_basis null')

// Record carrying K1 fields (as folded in by rowToAccreditationRecord) →
// payload serves them verbatim.
const k1Record: AccreditationRecord = {
  ...RECORD,
  coverage_status: wrapper.coverage_status,
  monitored_since: wrapper.monitored_since,
  credential_basis: wrapper.credential_basis,
}
const k1Payload = buildAccreditationPayload(k1Record)
assert(k1Payload.coverage_status === 'agent_elected', 'K1 record: payload coverage_status carried')
assert(
  k1Payload.monitored_since === '2026-06-13T10:00:00.000Z',
  'K1 record: payload monitored_since carried',
)
assert(
  k1Payload.credential_basis === wrapper.credential_basis,
  'K1 record: payload credential_basis carried verbatim',
)

// ============================================================================
// RESULT
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
