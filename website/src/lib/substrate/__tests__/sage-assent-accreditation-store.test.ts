/**
 * sage-assent-accreditation-store.test.ts — ATL badge persistence layer (Component 3)
 * functional tests + invariant checks.
 *
 * Run via:
 *   npx tsx --env-file=.env.local \
 *     website/src/lib/substrate/__tests__/sage-assent-accreditation-store.test.ts
 *
 * The --env-file is required: sage-assent-accreditation-store.ts imports
 * supabase-server.ts, which constructs a Supabase client at module load. The
 * client is constructed but never CALLED by this test — the pure mappers are
 * invoked directly, and the persistence seam is exercised via
 * handleAccreditationLookup with a FAKE lookupFn (no live DB). The live DB
 * round-trip is the spec-step-6b route's verification surface; this session
 * (step 6a) proves the persistence layer as library code (PR1).
 *
 * PR2 — build-to-wire verification immediate: this file invokes every PURE
 * exported function directly, exercises the persistence SEAM end-to-end with a
 * fake lookupFn, compile-time-checks that the real lookupAccreditationRecord is
 * assignable to handleAccreditationLookup's lookupFn slot, and confirms the
 * async store functions are present exports — all in the same session
 * sage-assent-accreditation-store.ts is written.
 *
 * COVERAGE
 *
 *   accreditationRecordToRow — pure mapper, domain → row
 *     REC2ROW-1  agent_id + scalar fields copied through
 *     REC2ROW-2  dimension_levels (nested) flattened to four columns
 *     REC2ROW-3  verification_url + disclaimer dropped (not columns)
 *     REC2ROW-4  KG7 — passions_persisting is the array itself, not stringified
 *     REC2ROW-5  tier + regressing_check_count default to 'free' / 0
 *     REC2ROW-6  tier + regressing_check_count opts are honoured
 *     REC2ROW-7  timestamp fields copied through
 *     REC2ROW-8  PURE — the input record is not mutated
 *
 *   rowToAccreditationRecord — pure mapper, row → domain
 *     ROW2REC-1  four columns re-nested into dimension_levels
 *     ROW2REC-2  verification_url reconstructed from VERIFICATION_BASE_URL
 *     ROW2REC-3  disclaimer reconstructed from ACCREDITATION_DISCLAIMER
 *     ROW2REC-4  passions_persisting read back as an array
 *     ROW2REC-5  KG7 guard — a malformed (string) JSONB value yields []
 *     ROW2REC-6  tier + regressing_check_count dropped (not record fields)
 *     ROW2REC-7  PURE — the input row is not mutated
 *
 *   round-trip
 *     RT-1  record → row → record is lossless (fresh record)
 *     RT-2  record → row → record is lossless (rich record — passions, actions)
 *     RT-3  the persisting-passion objects survive the round-trip intact
 *
 *   kathekon-aligned-alternative columns (Decision C, 2026-05-16)
 *     KATH-1  REC2ROW copies typical_kathekon_quality through to the row
 *     KATH-2  ROW2REC reads typical_kathekon_quality back into the record
 *     KATH-3  Default seed value is 'contrary' (conservative baseline)
 *     KATH-4  starting_kathekon_quality override is honoured by
 *             createAccreditationRecord
 *
 *   rowToStoreMetadata
 *     META-1  extracts tier + regressing_check_count (opts case)
 *     META-2  extracts the defaults case
 *
 *   gradeChangeEventToRow — pure mapper, GradeChangeEvent → row
 *     GCE-1  event_type copied through (upgrade)
 *     GCE-2  timestamp maps to occurred_at
 *     GCE-3  previous/new grade + proximity + authority + trigger count copied
 *     GCE-4  evidence_summary defaults to null
 *     GCE-5  evidence_summary opt is honoured
 *     GCE-6  a downgrade event maps event_type 'grade_downgrade'
 *
 *   buildInitialGradeHistoryRow — pure builder, fresh record → 'initial_grade'
 *     INIT-1  event_type is 'initial_grade'
 *     INIT-2  previous_grade / previous_proximity / previous_authority are null
 *     INIT-3  new_* fields taken from the record
 *     INIT-4  trigger_action_count is the record's actions_evaluated
 *     INIT-5  occurred_at is the record's created_at
 *     INIT-6  evidence_summary default null + opt override
 *
 *   persistence SEAM — lookupAccreditationRecord ⇄ handleAccreditationLookup
 *     SEAM-1  lookupAccreditationRecord is assignable to the lookupFn slot
 *     SEAM-2  ok — a found, non-expired record → status 'ok' + payload
 *     SEAM-3  not_found — a null lookup → status 'not_found'
 *     SEAM-4  error — an invalid agent_id → status 'error'
 *     SEAM-5  expired — a past expires_at → status 'expired' + payload
 *     SEAM-6  R3 — the served payload carries the disclaimer
 *
 *   async store exports present
 *     STORE-1  upsertAccreditationRecord is an exported function
 *     STORE-2  appendGradeHistory is an exported function
 *     STORE-3  appendInitialGradeHistory is an exported function
 *     STORE-4  lookupAccreditationRecord is an exported function
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  accreditationRecordToRow,
  rowToAccreditationRecord,
  rowToStoreMetadata,
  gradeChangeEventToRow,
  buildInitialGradeHistoryRow,
  lookupAccreditationRecord,
  upsertAccreditationRecord,
  appendGradeHistory,
  appendInitialGradeHistory,
} from '../sage-assent-accreditation-store'

import {
  createAccreditationRecord,
  buildGradeChangeEvent,
  ACCREDITATION_DISCLAIMER,
  VERIFICATION_BASE_URL,
} from '../trust-layer/accreditation/accreditation-record'

import { handleAccreditationLookup } from '../trust-layer/accreditation/public-endpoint'

import type {
  AccreditationRecord,
  DimensionScores,
  PersistingPassion,
} from '../trust-layer/types/accreditation'

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
// ============================================================================

let passCount = 0
let failCount = 0
const failures: string[] = []

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const ok = actual === expected
  assert(
    label,
    ok,
    ok
      ? undefined
      : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

/** Order-independent deep-equality via key-sorted JSON. */
function canonical(v: unknown): string {
  return JSON.stringify(v, (_k, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(
          Object.keys(val as Record<string, unknown>)
            .sort()
            .map((k) => [k, (val as Record<string, unknown>)[k]])
        )
      : val
  )
}

function assertDeepEqual(label: string, actual: unknown, expected: unknown): void {
  const a = canonical(actual)
  const e = canonical(expected)
  assert(label, a === e, a === e ? undefined : `expected=${e}, actual=${a}`)
}

// ============================================================================
// Fixtures
// ============================================================================

const ALL_EMERGING: DimensionScores = {
  passion_reduction: 'emerging',
  judgement_quality: 'emerging',
  disposition_stability: 'emerging',
  oikeiosis_extension: 'emerging',
}

const MIXED_DIMENSIONS: DimensionScores = {
  passion_reduction: 'established',
  judgement_quality: 'advanced',
  disposition_stability: 'developing',
  oikeiosis_extension: 'established',
}

const SAMPLE_PASSION: PersistingPassion = {
  root_passion: 'phobos',
  sub_species: 'agonia',
  occurrence_count: 12,
  occurrence_rate: 0.16,
}

/** A fresh wrapped agent's seeded credential — reflexive / pre_progress. */
function freshRecord(): AccreditationRecord {
  return createAccreditationRecord({
    agent_id: 'agent_acme_v3',
    starting_grade: 'pre_progress',
    starting_proximity: 'reflexive',
    starting_dimensions: ALL_EMERGING,
  })
}

/** A record at deliberate / grade_2 with mixed dimensions — used to build a
 *  GradeChangeEvent against freshRecord(). */
function deliberateRecord(): AccreditationRecord {
  return createAccreditationRecord({
    agent_id: 'agent_acme_v3',
    starting_grade: 'grade_2',
    starting_proximity: 'deliberate',
    starting_dimensions: MIXED_DIMENSIONS,
  })
}

/** A "rich" record — non-empty passions, non-zero actions, improving — to prove
 *  the round-trip carries real data, not just an empty baseline. */
function richRecord(): AccreditationRecord {
  return {
    ...deliberateRecord(),
    actions_evaluated: 73,
    direction_of_travel: 'improving',
    passions_persisting: [SAMPLE_PASSION],
  }
}

// ============================================================================
// Tests
// ============================================================================

async function main(): Promise<void> {
  // --------------------------------------------------------------------------
  // accreditationRecordToRow
  // --------------------------------------------------------------------------
  {
    const record = richRecord()
    const before = canonical(record)
    const row = accreditationRecordToRow(record)

    assertEqual('REC2ROW-1 agent_id copied', row.agent_id, record.agent_id)
    assertEqual('REC2ROW-1 senecan_grade copied', row.senecan_grade, record.senecan_grade)
    assertEqual('REC2ROW-1 typical_proximity copied', row.typical_proximity, record.typical_proximity)
    assertEqual('REC2ROW-1 authority_level copied', row.authority_level, record.authority_level)
    assertEqual('REC2ROW-1 direction_of_travel copied', row.direction_of_travel, record.direction_of_travel)
    assertEqual('REC2ROW-1 actions_evaluated copied', row.actions_evaluated, record.actions_evaluated)
    assertEqual('REC2ROW-1 evaluation_window_size copied', row.evaluation_window_size, record.evaluation_window_size)

    assertEqual('REC2ROW-2 passion_reduction flattened', row.passion_reduction, record.dimension_levels.passion_reduction)
    assertEqual('REC2ROW-2 judgement_quality flattened', row.judgement_quality, record.dimension_levels.judgement_quality)
    assertEqual('REC2ROW-2 disposition_stability flattened', row.disposition_stability, record.dimension_levels.disposition_stability)
    assertEqual('REC2ROW-2 oikeiosis_extension flattened', row.oikeiosis_extension, record.dimension_levels.oikeiosis_extension)

    assert('REC2ROW-3 verification_url dropped', !('verification_url' in row))
    assert('REC2ROW-3 disclaimer dropped', !('disclaimer' in row))

    assert('REC2ROW-4 KG7 passions_persisting is an array', Array.isArray(row.passions_persisting))
    assert('REC2ROW-4 KG7 passions_persisting is not a string', typeof row.passions_persisting !== 'string')
    assert('REC2ROW-4 KG7 array passed through by reference (no stringify, no copy)', row.passions_persisting === record.passions_persisting)

    assertEqual('REC2ROW-5 tier defaults to free', row.tier, 'free')
    assertEqual('REC2ROW-5 regressing_check_count defaults to 0', row.regressing_check_count, 0)

    const rowWithOpts = accreditationRecordToRow(record, { tier: 'paid', regressing_check_count: 3 })
    assertEqual('REC2ROW-6 tier opt honoured', rowWithOpts.tier, 'paid')
    assertEqual('REC2ROW-6 regressing_check_count opt honoured', rowWithOpts.regressing_check_count, 3)

    assertEqual('REC2ROW-7 grade_since copied', row.grade_since, record.grade_since)
    assertEqual('REC2ROW-7 last_evaluation copied', row.last_evaluation, record.last_evaluation)
    assertEqual('REC2ROW-7 expires_at copied', row.expires_at, record.expires_at)
    assertEqual('REC2ROW-7 created_at copied', row.created_at, record.created_at)
    assertEqual('REC2ROW-7 updated_at copied', row.updated_at, record.updated_at)

    assertEqual('REC2ROW-8 PURE — input record not mutated', canonical(record), before)
  }

  // --------------------------------------------------------------------------
  // rowToAccreditationRecord
  // --------------------------------------------------------------------------
  {
    const row = accreditationRecordToRow(richRecord(), { tier: 'paid', regressing_check_count: 4 })
    const before = canonical(row)
    const record = rowToAccreditationRecord(row)

    assertEqual('ROW2REC-1 passion_reduction re-nested', record.dimension_levels.passion_reduction, row.passion_reduction)
    assertEqual('ROW2REC-1 judgement_quality re-nested', record.dimension_levels.judgement_quality, row.judgement_quality)
    assertEqual('ROW2REC-1 disposition_stability re-nested', record.dimension_levels.disposition_stability, row.disposition_stability)
    assertEqual('ROW2REC-1 oikeiosis_extension re-nested', record.dimension_levels.oikeiosis_extension, row.oikeiosis_extension)

    assertEqual(
      'ROW2REC-2 verification_url reconstructed',
      record.verification_url,
      `${VERIFICATION_BASE_URL}/${row.agent_id}`
    )
    assertEqual('ROW2REC-3 disclaimer reconstructed', record.disclaimer, ACCREDITATION_DISCLAIMER)

    assert('ROW2REC-4 passions_persisting read as an array', Array.isArray(record.passions_persisting))
    assertEqual('ROW2REC-4 passions_persisting length preserved', record.passions_persisting.length, 1)

    // KG7 guard — a malformed JSONB value (a double-serialised string) must
    // yield [] rather than iterating characters.
    const malformedRow = {
      ...row,
      passions_persisting: '[{"root_passion":"phobos"}]' as unknown as PersistingPassion[],
    }
    const fromMalformed = rowToAccreditationRecord(malformedRow)
    assert('ROW2REC-5 KG7 guard — malformed string yields an array', Array.isArray(fromMalformed.passions_persisting))
    assertEqual('ROW2REC-5 KG7 guard — malformed string yields []', fromMalformed.passions_persisting.length, 0)

    assert('ROW2REC-6 tier not folded into the record', !('tier' in record))
    assert('ROW2REC-6 regressing_check_count not folded into the record', !('regressing_check_count' in record))

    assertEqual('ROW2REC-7 PURE — input row not mutated', canonical(row), before)
  }

  // --------------------------------------------------------------------------
  // round-trip
  // --------------------------------------------------------------------------
  {
    // CI-11 (2026-06-13): a record built by createAccreditationRecord carries no
    // K1 coverage fields; rowToAccreditationRecord folds the three columns to null
    // on read, so the canonical round-tripped record always carries them (the live
    // behaviour). The round-trip is lossless modulo this honest fold-to-null.
    const K1_NULL = {
      coverage_status: null,
      monitored_since: null,
      credential_basis: null,
    }
    const fresh = freshRecord()
    assertDeepEqual(
      'RT-1 fresh record round-trips losslessly',
      rowToAccreditationRecord(accreditationRecordToRow(fresh)),
      { ...fresh, ...K1_NULL }
    )

    const rich = richRecord()
    const rebuilt = rowToAccreditationRecord(accreditationRecordToRow(rich))
    assertDeepEqual('RT-2 rich record round-trips losslessly', rebuilt, { ...rich, ...K1_NULL })
    assertDeepEqual('RT-3 persisting-passion objects survive intact', rebuilt.passions_persisting, [SAMPLE_PASSION])
  }

  // --------------------------------------------------------------------------
  // kathekon-aligned alternative — Decision C (2026-05-16)
  // --------------------------------------------------------------------------
  {
    // KATH-1: REC2ROW copies typical_kathekon_quality through to the row.
    const record = freshRecord()
    const row = accreditationRecordToRow(record)
    assertEqual(
      'KATH-1 typical_kathekon_quality copied to row',
      row.typical_kathekon_quality,
      record.typical_kathekon_quality
    )

    // KATH-2: ROW2REC reads typical_kathekon_quality back into the record.
    const roundTripped = rowToAccreditationRecord(row)
    assertEqual(
      'KATH-2 typical_kathekon_quality read back from row',
      roundTripped.typical_kathekon_quality,
      row.typical_kathekon_quality
    )

    // KATH-3: Default seed value is 'contrary' (matches the migration's
    // server-side DEFAULT and the empty-window aggregation baseline).
    assertEqual(
      'KATH-3 default seed is contrary',
      record.typical_kathekon_quality,
      'contrary'
    )

    // KATH-4: starting_kathekon_quality override is honoured.
    const overridden = createAccreditationRecord({
      agent_id: 'agent_acme_v3',
      starting_grade: 'pre_progress',
      starting_proximity: 'reflexive',
      starting_dimensions: ALL_EMERGING,
      starting_kathekon_quality: 'strong',
    })
    assertEqual(
      'KATH-4 starting_kathekon_quality override honoured',
      overridden.typical_kathekon_quality,
      'strong'
    )
  }

  // --------------------------------------------------------------------------
  // rowToStoreMetadata
  // --------------------------------------------------------------------------
  {
    const rowWithOpts = accreditationRecordToRow(freshRecord(), { tier: 'paid', regressing_check_count: 5 })
    assertDeepEqual('META-1 extracts tier + regressing_check_count (opts)', rowToStoreMetadata(rowWithOpts), {
      tier: 'paid',
      regressing_check_count: 5,
    })

    const rowDefaults = accreditationRecordToRow(freshRecord())
    assertDeepEqual('META-2 extracts the defaults case', rowToStoreMetadata(rowDefaults), {
      tier: 'free',
      regressing_check_count: 0,
    })
  }

  // --------------------------------------------------------------------------
  // gradeChangeEventToRow
  // --------------------------------------------------------------------------
  {
    // reflexive (rank 0) → deliberate (rank 2): buildGradeChangeEvent → upgrade
    const upgrade = buildGradeChangeEvent('agent_acme_v3', freshRecord(), deliberateRecord(), 40)
    const row = gradeChangeEventToRow(upgrade)

    assertEqual('GCE-1 event_type copied (upgrade)', row.event_type, 'grade_upgrade')
    assertEqual('GCE-2 timestamp maps to occurred_at', row.occurred_at, upgrade.timestamp)
    assertEqual('GCE-3 agent_id copied', row.agent_id, upgrade.agent_id)
    assertEqual('GCE-3 previous_grade copied', row.previous_grade, upgrade.previous_grade)
    assertEqual('GCE-3 new_grade copied', row.new_grade, upgrade.new_grade)
    assertEqual('GCE-3 previous_proximity copied', row.previous_proximity, upgrade.previous_proximity)
    assertEqual('GCE-3 new_proximity copied', row.new_proximity, upgrade.new_proximity)
    assertEqual('GCE-3 previous_authority copied', row.previous_authority, upgrade.previous_authority)
    assertEqual('GCE-3 new_authority copied', row.new_authority, upgrade.new_authority)
    assertEqual('GCE-3 trigger_action_count copied', row.trigger_action_count, upgrade.trigger_action_count)
    assertEqual('GCE-4 evidence_summary defaults to null', row.evidence_summary, null)

    const rowWithNote = gradeChangeEventToRow(upgrade, { evidence_summary: '25 deliberate actions in window' })
    assertEqual('GCE-5 evidence_summary opt honoured', rowWithNote.evidence_summary, '25 deliberate actions in window')

    // deliberate (rank 2) → reflexive (rank 0): buildGradeChangeEvent → downgrade
    const downgrade = buildGradeChangeEvent('agent_acme_v3', deliberateRecord(), freshRecord(), 10)
    assertEqual('GCE-6 event_type copied (downgrade)', gradeChangeEventToRow(downgrade).event_type, 'grade_downgrade')
  }

  // --------------------------------------------------------------------------
  // buildInitialGradeHistoryRow
  // --------------------------------------------------------------------------
  {
    const record = richRecord()
    const row = buildInitialGradeHistoryRow(record)

    assertEqual('INIT-1 event_type is initial_grade', row.event_type, 'initial_grade')
    assertEqual('INIT-2 previous_grade is null', row.previous_grade, null)
    assertEqual('INIT-2 previous_proximity is null', row.previous_proximity, null)
    assertEqual('INIT-2 previous_authority is null', row.previous_authority, null)
    assertEqual('INIT-3 new_grade from record', row.new_grade, record.senecan_grade)
    assertEqual('INIT-3 new_proximity from record', row.new_proximity, record.typical_proximity)
    assertEqual('INIT-3 new_authority from record', row.new_authority, record.authority_level)
    assertEqual('INIT-4 trigger_action_count is actions_evaluated', row.trigger_action_count, record.actions_evaluated)
    assertEqual('INIT-5 occurred_at is created_at', row.occurred_at, record.created_at)
    assertEqual('INIT-6 evidence_summary defaults to null', row.evidence_summary, null)
    assertEqual(
      'INIT-6 evidence_summary opt honoured',
      buildInitialGradeHistoryRow(record, { evidence_summary: 'seeded at onboarding' }).evidence_summary,
      'seeded at onboarding'
    )
  }

  // --------------------------------------------------------------------------
  // persistence SEAM — lookupAccreditationRecord ⇄ handleAccreditationLookup
  // --------------------------------------------------------------------------
  {
    // SEAM-1 — compile-time: the real lookupAccreditationRecord must be
    // assignable to handleAccreditationLookup's injected lookupFn parameter.
    // This assignment only type-checks if the signatures match exactly.
    const seamCheck: Parameters<typeof handleAccreditationLookup>[1] = lookupAccreditationRecord
    assert('SEAM-1 lookupAccreditationRecord fits the lookupFn slot', typeof seamCheck === 'function')

    // A round-tripped record served through the seam (fake lookupFn — no live DB).
    const storedRecord = rowToAccreditationRecord(accreditationRecordToRow(freshRecord()))
    const okLookup = async () => storedRecord
    const nullLookup = async () => null

    const okResult = await handleAccreditationLookup('agent_acme_v3', okLookup)
    assertEqual('SEAM-2 found, non-expired record → status ok', okResult.status, 'ok')
    if (okResult.status === 'ok') {
      assertEqual('SEAM-2 payload carries the agent_id', okResult.data.agent_id, 'agent_acme_v3')
      assertEqual('SEAM-6 R3 — payload carries the disclaimer', okResult.data.disclaimer, ACCREDITATION_DISCLAIMER)
    }

    const notFound = await handleAccreditationLookup('agent_acme_v3', nullLookup)
    assertEqual('SEAM-3 null lookup → status not_found', notFound.status, 'not_found')

    const errored = await handleAccreditationLookup('not-an-agent', okLookup)
    assertEqual('SEAM-4 invalid agent_id → status error', errored.status, 'error')

    const expiredRecord: AccreditationRecord = {
      ...storedRecord,
      expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
    const expiredResult = await handleAccreditationLookup('agent_acme_v3', async () => expiredRecord)
    assertEqual('SEAM-5 past expires_at → status expired', expiredResult.status, 'expired')
  }

  // --------------------------------------------------------------------------
  // async store exports present (their live-DB round-trip is step 6b's
  // verification surface — see the test header)
  // --------------------------------------------------------------------------
  {
    assertEqual('STORE-1 upsertAccreditationRecord is a function', typeof upsertAccreditationRecord, 'function')
    assertEqual('STORE-2 appendGradeHistory is a function', typeof appendGradeHistory, 'function')
    assertEqual('STORE-3 appendInitialGradeHistory is a function', typeof appendInitialGradeHistory, 'function')
    assertEqual('STORE-4 lookupAccreditationRecord is a function', typeof lookupAccreditationRecord, 'function')
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('')
  console.log(`sage-assent-accreditation-store.test.ts — ${passCount} passed / ${failCount} failed`)
  if (failCount > 0) {
    console.log('')
    console.log('FAILURES:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('test harness crashed:', err)
  process.exit(1)
})
