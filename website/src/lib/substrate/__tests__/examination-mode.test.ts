/**
 * examination-mode.test.ts — Gate-1 surface honesty, Arc 1 (2026-06-20).
 * The UNFORGEABILITY + FLAG-OFF-BYTE-IDENTITY battery for the examination_mode
 * credential extension (D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION).
 *
 * Run with: npx tsx --env-file=.env.local <this file>
 * (Imports the store mappers, which transitively import supabase-server.ts —
 *  the client is constructed at module load but NEVER called; the mappers under
 *  test are pure. Same posture as accreditation-store-k1-fields.test.ts.)
 *
 * What it proves (the load-bearing claims from the Arc 1 build scope):
 *   1. The mode is SERVER-COMPOSED — the composer reads only the write-path,
 *      never a consumer-submitted record's examination_mode (cannot be forged).
 *   2. Only an admin-minted marked credential earns pre_decision_harness; the
 *      provenance marker matches EXACTLY (no near-miss self-election).
 *   3. An unmarked credential → post_decision_check (the honest discretionary label).
 *   4. FLAG-OFF BYTE-IDENTITY — the column is never written, the field is never
 *      folded, and the public payload omits the key entirely (parameter default
 *      false on both pure mappers; the I/O seams pass isExaminationModeEnabled()).
 *   5. Pre-existing rows read back null (the honest "examination mode unstated").
 *   6. The public payload carries the field when (and only when) the read folded it.
 *   7. D3 — coverage_status stays agent_elected on the harness path (timing ≠
 *      coverage breadth; 'continuous' is NOT repurposed).
 */

import type { AccreditationRecord } from '../trust-layer/types/accreditation'
import { composeK1InitialCoverage } from '../trust-layer/accreditation/coverage-status'
import { buildAccreditationPayload } from '../trust-layer/accreditation/accreditation-record'
import {
  accreditationRecordToRow,
  rowToAccreditationRecord,
  type AgentAccreditationRow,
} from '../sage-assent-accreditation-store'
import {
  isExaminationModeEnabled,
  provenanceCarriesPreDecisionMarker,
} from '../examination-mode-flag'

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
  agent_id: 'sagereasoning:gate1-test@v1',
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
  grade_since: '2026-06-20T10:00:00.000Z',
  last_evaluation: '2026-06-20T12:30:00.000Z',
  passions_persisting: [],
  verification_url: 'https://sagereasoning.com/accreditation/sagereasoning:gate1-test@v1',
  expires_at: '2026-09-18T10:00:00.000Z',
  disclaimer: 'test disclaimer',
  created_at: '2026-06-20T10:00:00.000Z',
  updated_at: '2026-06-20T12:30:00.000Z',
  typical_deliberation_breadth: 'intuited',
  typical_kathekon_quality: 'contrary',
}

// ============================================================================
// 1. SERVER-COMPOSED + path-honest (the mode is a property of the write-path,
//    never of the consumer's payload)
// ============================================================================

const wrapper = composeK1InitialCoverage(RECORD, 'wrapper_write')
const reflect = composeK1InitialCoverage(RECORD, 'sage_reflect_feed')
const harness = composeK1InitialCoverage(RECORD, 'harness_enforced')

assert(wrapper.examination_mode === 'post_decision_check', 'wrapper_write → post_decision_check')
assert(reflect.examination_mode === 'post_decision_check', 'sage_reflect_feed → post_decision_check')
assert(harness.examination_mode === 'pre_decision_harness', 'harness_enforced → pre_decision_harness')

// D3 — coverage_status stays agent_elected on ALL paths (timing ≠ coverage breadth).
assert(harness.coverage_status === 'agent_elected', 'D3: harness path keeps coverage_status agent_elected (NOT continuous)')
assert(wrapper.coverage_status === 'agent_elected', 'D3: wrapper path coverage_status agent_elected')
assert(
  harness.credential_basis.includes('pre-decision'),
  'harness path credential_basis names pre-decision enforcement (human-readable honesty)',
)

// UNFORGEABLE: a consumer record claiming its own examination_mode is IGNORED —
// the composer reads only the write-path.
const forgedRecord = { ...RECORD, examination_mode: 'pre_decision_harness' } as AccreditationRecord
assert(
  composeK1InitialCoverage(forgedRecord, 'wrapper_write').examination_mode === 'post_decision_check',
  'forged record.examination_mode is ignored — composer is server-side authority',
)

// ============================================================================
// 2. The provenance marker is matched EXACTLY (admin-mint only; no near-miss
//    self-election) — the unforgeability root
// ============================================================================

assert(
  provenanceCarriesPreDecisionMarker({ examination_enforcement: 'pre_decision_harness' }) === true,
  'exact admin marker → true',
)
assert(provenanceCarriesPreDecisionMarker(null) === false, 'null provenance → false')
assert(provenanceCarriesPreDecisionMarker(undefined) === false, 'undefined provenance → false')
assert(provenanceCarriesPreDecisionMarker({}) === false, 'empty provenance → false')
assert(
  provenanceCarriesPreDecisionMarker({ minted_by: 'admin/api-keys', basis: 'admin_issued_upc' }) === false,
  'ordinary UPC provenance (no marker) → false',
)
assert(
  provenanceCarriesPreDecisionMarker({ examination_enforcement: 'post_decision_check' }) === false,
  'wrong marker value → false',
)
assert(
  provenanceCarriesPreDecisionMarker({ examination_enforcement: 'pre_decision_harness_x' }) === false,
  'near-miss marker value → false (exact match only)',
)

// ============================================================================
// 3. WRITE gating — the store mapper omits the column flag-off (byte-identity),
//    writes it flag-on. The M3 PGRST204 lesson: no unknown column pre-migration.
// ============================================================================

const optsHarness = composeK1InitialCoverage(RECORD, 'harness_enforced')

const rowOff = accreditationRecordToRow(RECORD, optsHarness, false)
assert(!('examination_mode' in rowOff), 'WRITE flag-off: examination_mode key is OMITTED from the row (no PGRST204)')

// Byte-identity: the flag-off row equals the legacy two-arg call exactly.
assert(
  JSON.stringify(accreditationRecordToRow(RECORD, optsHarness, false)) ===
    JSON.stringify(accreditationRecordToRow(RECORD, optsHarness)),
  'WRITE flag-off: row is byte-identical to the legacy (no-param) mapper call',
)

const rowOn = accreditationRecordToRow(RECORD, optsHarness, true)
assert(rowOn.examination_mode === 'pre_decision_harness', 'WRITE flag-on: harness mode written to the column')
assert(
  accreditationRecordToRow(RECORD, composeK1InitialCoverage(RECORD, 'wrapper_write'), true).examination_mode ===
    'post_decision_check',
  'WRITE flag-on: discretionary mode written to the column',
)
assert(
  accreditationRecordToRow(RECORD, {}, true).examination_mode === null,
  'WRITE flag-on with no composed mode: defensive null (honest "unstated"), never an over-claim',
)

// ============================================================================
// 4. READ gating — the store mapper omits the field flag-off (byte-identity),
//    folds it flag-on; a pre-migration row (no column) folds to null flag-on.
// ============================================================================

const rowWithMode: AgentAccreditationRow = accreditationRecordToRow(RECORD, optsHarness, true)
const rowNoColumn: AgentAccreditationRow = accreditationRecordToRow(RECORD, {}, false) // simulates a pre-slice row

const recOffFromMode = rowToAccreditationRecord(rowWithMode, false)
assert(!('examination_mode' in recOffFromMode), 'READ flag-off: examination_mode key is OMITTED from the record')
assert(
  JSON.stringify(rowToAccreditationRecord(rowWithMode, false)) ===
    JSON.stringify(rowToAccreditationRecord(rowWithMode)),
  'READ flag-off: record is byte-identical to the legacy (no-param) mapper call',
)

const recOnFromMode = rowToAccreditationRecord(rowWithMode, true)
assert(recOnFromMode.examination_mode === 'pre_decision_harness', 'READ flag-on: mode folded onto the record')

const recOnPreSlice = rowToAccreditationRecord(rowNoColumn, true)
assert(recOnPreSlice.examination_mode === null, 'READ flag-on, pre-slice row (no column) → null ("unstated")')

// ============================================================================
// 5. PUBLIC PAYLOAD — present only when the read folded it; null = unstated;
//    omitted entirely flag-off (byte-identical public contract)
// ============================================================================

// flag-off: a record without the field → payload omits the key entirely.
const payloadOff = buildAccreditationPayload(recOffFromMode)
assert(!('examination_mode' in payloadOff), 'PAYLOAD flag-off: examination_mode key absent (public contract byte-identical)')

// flag-on, harness: payload carries pre_decision_harness.
const payloadHarness = buildAccreditationPayload(recOnFromMode)
assert(payloadHarness.examination_mode === 'pre_decision_harness', 'PAYLOAD flag-on harness: pre_decision_harness served')

// flag-on, pre-slice: payload carries null (unstated, honest).
const payloadPreSlice = buildAccreditationPayload(recOnPreSlice)
assert(payloadPreSlice.examination_mode === null, 'PAYLOAD flag-on pre-slice: null served (unstated)')

// ============================================================================
// 6. END-TO-END honest chains (compose → write → read → payload), flag-on
// ============================================================================

function endToEnd(path: 'wrapper_write' | 'harness_enforced') {
  const opts = composeK1InitialCoverage(RECORD, path)
  const row = accreditationRecordToRow(RECORD, opts, true)
  const rec = rowToAccreditationRecord(row, true)
  return buildAccreditationPayload(rec).examination_mode
}
assert(endToEnd('harness_enforced') === 'pre_decision_harness', 'end-to-end harness chain → pre_decision_harness on the payload')
assert(endToEnd('wrapper_write') === 'post_decision_check', 'end-to-end discretionary chain → post_decision_check on the payload')

// ============================================================================
// 7. The flag reads the env strictly (only the literal 'true' enables)
// ============================================================================

const savedFlag = process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED
delete process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED
assert(isExaminationModeEnabled() === false, 'flag unset → disabled')
process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED = 'false'
assert(isExaminationModeEnabled() === false, "flag 'false' → disabled")
process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED = 'TRUE'
assert(isExaminationModeEnabled() === false, "flag 'TRUE' (wrong case) → disabled (strict)")
process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED = 'true'
assert(isExaminationModeEnabled() === true, "flag 'true' → enabled")
// restore
if (savedFlag === undefined) delete process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED
else process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED = savedFlag

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\nexamination-mode battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error(`\nFAILURES:\n  - ${failures.join('\n  - ')}`)
  process.exit(1)
}
console.log('All examination-mode unforgeability + byte-identity assertions passed.')
