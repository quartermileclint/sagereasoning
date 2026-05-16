/**
 * atl-accreditation-writer.test.ts — write-path library functional tests.
 *
 * STATUS: Verified (2026-05-16, this session — write-path build).
 *
 * Run via:
 *   npx tsx --env-file=.env.local \
 *     website/src/lib/substrate/__tests__/atl-accreditation-writer.test.ts
 *
 * The --env-file is required: atl-accreditation-writer.ts imports from
 * atl-accreditation-store.ts, which imports supabase-server.ts, which
 * constructs a Supabase client at module load. The client is constructed but
 * never CALLED by this test — the writer's public functions accept an
 * optional deps parameter (DI seam), and the tests pass mock implementations
 * that capture invocation order, simulate failures, and assert log-event
 * field sets without a real DB round-trip. The end-to-end Supabase round-
 * trip is the route's verification surface (the founder's post-deploy URL
 * check per the Critical Change Protocol step 5).
 *
 * PR2 — build-to-wire verification immediate: this file invokes both public
 * functions (seedAccreditation + updateAccreditation) directly via the DI
 * seam, asserting the design's Decisions B + D + E + F + G in code:
 *
 *   - Decision B (hybrid trigger): the library auto-emits appendInitial-
 *     GradeHistory on seed and appendGradeHistory on update iff grade_-
 *     changed === true (SEED-1, UPDATE-1, UPDATE-2).
 *   - Decision D (two entry points): seedAccreditation and update-
 *     Accreditation are separate functions with separate call paths.
 *   - Decision E (two awaited writes; not transactional): upsert first,
 *     then history append (SEED-1, UPDATE-1, ATOMICITY-1).
 *   - Decision F (idempotent upsert): re-calling produces successful
 *     no-op-or-update (IDEMPOTENT-1).
 *   - Decision G (structured logging): one JSON event per call; field set
 *     matches the design's spec (SEED-2, UPDATE-3, SEED-3 error variant).
 *
 * COVERAGE
 *
 *   seedAccreditation
 *     SEED-1  Calls upsertAccreditationRecord then appendInitialGradeHistory,
 *             in that order. NO appendGradeHistory call.
 *     SEED-2  Success emits exactly one structured log event with call_type:
 *             'seed', outcome: 'ok', and the required field set.
 *     SEED-3  Failure (upsert throws) re-throws the error AND emits a
 *             structured log event with outcome: 'error' + error_message.
 *
 *   updateAccreditation
 *     UPDATE-1  With grade_changed: true + non-null trigger, calls upsert-
 *               AccreditationRecord then appendGradeHistory, in that order.
 *     UPDATE-2  With grade_changed: false, calls upsertAccreditationRecord
 *               ONLY — NO appendGradeHistory call.
 *     UPDATE-3  Success log event includes grade_changed, previous_grade,
 *               new_grade, trigger_reason fields (filled iff grade changed).
 *
 *   atomicity (Decision E)
 *     ATOMICITY-1  History append failure AFTER successful upsert re-throws
 *                  the history error; the upsert mock was called first
 *                  (invocation-order assertion proves state-ahead-of-history
 *                  is the failure mode, not the inverse).
 *
 *   idempotency (Decision F)
 *     IDEMPOTENT-1  Re-calling seedAccreditation with the same profile
 *                   produces a successful second call (the mock upsert
 *                   receives the second call; mock initial-history receives
 *                   a second call; no throw). Production semantics: the
 *                   real upsert's onConflict: 'agent_id' handles duplicate
 *                   state writes; grade_history acquires a visible duplicate
 *                   row (Decision F).
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  seedAccreditation,
  updateAccreditation,
  type AccreditationWriterDeps,
  type AtlWriteEvent,
} from '../atl-accreditation-writer'

import { createCarriedProfile, type CarriedProfile } from '../atl-wrapper'

import type {
  AccreditationRecord,
  GradeChangeEvent,
} from '../trust-layer/types/accreditation'

import type { TransitionResult } from '../trust-layer/grade-engine/grade-transition-engine'

import type {
  AccreditationRowOptions,
  GradeHistoryRowOptions,
} from '../atl-accreditation-store'

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
      : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`,
  )
}

// ============================================================================
// Mock factory — produces a fresh deps object with capturing mocks.
// ============================================================================

interface InvocationLog {
  readonly fn: 'upsert' | 'appendHistory' | 'appendInitial' | 'log'
  readonly args: unknown
}

interface MockDeps {
  readonly deps: AccreditationWriterDeps
  readonly invocations: InvocationLog[]
  readonly events: AtlWriteEvent[]
}

interface MockOptions {
  readonly upsertThrows?: Error
  readonly appendHistoryThrows?: Error
  readonly appendInitialThrows?: Error
}

function makeMockDeps(opts: MockOptions = {}): MockDeps {
  const invocations: InvocationLog[] = []
  const events: AtlWriteEvent[] = []

  const deps: AccreditationWriterDeps = {
    upsertAccreditationRecord: async (
      record: AccreditationRecord,
      options?: AccreditationRowOptions,
    ): Promise<void> => {
      invocations.push({ fn: 'upsert', args: { record, options } })
      if (opts.upsertThrows) throw opts.upsertThrows
    },
    appendGradeHistory: async (
      event: GradeChangeEvent,
      options?: GradeHistoryRowOptions,
    ): Promise<void> => {
      invocations.push({ fn: 'appendHistory', args: { event, options } })
      if (opts.appendHistoryThrows) throw opts.appendHistoryThrows
    },
    appendInitialGradeHistory: async (
      record: AccreditationRecord,
      options?: GradeHistoryRowOptions,
    ): Promise<void> => {
      invocations.push({ fn: 'appendInitial', args: { record, options } })
      if (opts.appendInitialThrows) throw opts.appendInitialThrows
    },
    logger: (event: AtlWriteEvent): void => {
      invocations.push({ fn: 'log', args: event })
      events.push(event)
    },
  }

  return { deps, invocations, events }
}

// ============================================================================
// Fixtures
// ============================================================================

function freshProfile(): CarriedProfile {
  return createCarriedProfile('agent_test_v1', {
    starting_grade: 'pre_progress',
    starting_proximity: 'reflexive',
    starting_dimensions: {
      passion_reduction: 'emerging',
      judgement_quality: 'emerging',
      disposition_stability: 'emerging',
      oikeiosis_extension: 'emerging',
    },
  })
}

/** A TransitionResult representing a no-grade-change update. */
function noChangeTransition(record: AccreditationRecord): TransitionResult {
  return {
    grade_changed: false,
    record,
    trigger: null,
    explanation: 'no transition; test fixture',
  }
}

/** A TransitionResult representing an upgrade (reflexive → habitual). */
function upgradeTransition(baseRecord: AccreditationRecord): TransitionResult {
  return {
    grade_changed: true,
    record: {
      ...baseRecord,
      typical_proximity: 'habitual',
      senecan_grade: 'grade_3',
      authority_level: 'guided',
    },
    trigger: {
      type: 'upgrade',
      from_grade: 'pre_progress',
      to_grade: 'grade_3',
      from_proximity: 'reflexive',
      to_proximity: 'habitual',
      evidence_summary: '55% at habitual or above. Direction: stable.',
    },
    explanation:
      'Agent upgraded from reflexive to habitual. test fixture explanation.',
  }
}

// ============================================================================
// Tests
// ============================================================================

async function main(): Promise<void> {
  // --------------------------------------------------------------------------
  // SEED-1  Calls upsert then appendInitial, in that order. NO appendHistory.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const mock = makeMockDeps()
    await seedAccreditation(profile, mock.deps)

    const nonLogInvocations = mock.invocations.filter((i) => i.fn !== 'log')
    assertEqual('SEED-1 two persistence calls (excluding log)', nonLogInvocations.length, 2)
    assertEqual('SEED-1 first call is upsert', nonLogInvocations[0].fn, 'upsert')
    assertEqual(
      'SEED-1 second call is appendInitial',
      nonLogInvocations[1].fn,
      'appendInitial',
    )
    const appendHistoryCalls = mock.invocations.filter(
      (i) => i.fn === 'appendHistory',
    )
    assertEqual(
      'SEED-1 NO appendGradeHistory call on seed',
      appendHistoryCalls.length,
      0,
    )
  }

  // --------------------------------------------------------------------------
  // SEED-2  Success emits exactly one structured log event with required fields.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const mock = makeMockDeps()
    await seedAccreditation(profile, mock.deps)

    assertEqual('SEED-2 exactly one log event emitted', mock.events.length, 1)
    const event = mock.events[0]
    assertEqual('SEED-2 event.kind === atl_write', event.kind, 'atl_write')
    assertEqual('SEED-2 event.call_type === seed', event.call_type, 'seed')
    assertEqual('SEED-2 event.agent_id matches', event.agent_id, 'agent_test_v1')
    assertEqual('SEED-2 event.outcome === ok', event.outcome, 'ok')
    assertEqual(
      'SEED-2 event.senecan_grade matches',
      event.senecan_grade,
      'pre_progress',
    )
    assertEqual(
      'SEED-2 event.actions_evaluated is a number',
      typeof event.actions_evaluated,
      'number',
    )
    assertEqual(
      'SEED-2 event.elapsed_ms is a number',
      typeof event.elapsed_ms,
      'number',
    )
    assert(
      'SEED-2 event.elapsed_ms is non-negative',
      event.elapsed_ms >= 0,
    )
    assertEqual(
      'SEED-2 event.error_message is undefined on success',
      event.error_message,
      undefined,
    )
  }

  // --------------------------------------------------------------------------
  // SEED-3  Failure re-throws AND emits an error log event.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const upsertError = new Error('upsertAccreditationRecord: Supabase upsert failed')
    const mock = makeMockDeps({ upsertThrows: upsertError })

    let thrown: unknown = null
    try {
      await seedAccreditation(profile, mock.deps)
    } catch (err) {
      thrown = err
    }
    assertEqual('SEED-3 error propagates to caller', thrown, upsertError)

    assertEqual('SEED-3 exactly one log event emitted', mock.events.length, 1)
    const event = mock.events[0]
    assertEqual('SEED-3 event.outcome === error', event.outcome, 'error')
    assertEqual(
      'SEED-3 event.error_message names the failure',
      event.error_message,
      upsertError.message,
    )

    // The upsert was attempted; appendInitial was NOT (the throw aborted the
    // call before the second await).
    const upsertCalls = mock.invocations.filter((i) => i.fn === 'upsert')
    const appendInitialCalls = mock.invocations.filter(
      (i) => i.fn === 'appendInitial',
    )
    assertEqual('SEED-3 upsert was attempted', upsertCalls.length, 1)
    assertEqual(
      'SEED-3 appendInitial was NOT attempted after upsert throw',
      appendInitialCalls.length,
      0,
    )
  }

  // --------------------------------------------------------------------------
  // UPDATE-1  With grade_changed=true, calls upsert then appendHistory.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const transition = upgradeTransition(profile.accreditation_record)
    const mock = makeMockDeps()
    await updateAccreditation(profile, transition, mock.deps)

    const nonLogInvocations = mock.invocations.filter((i) => i.fn !== 'log')
    assertEqual(
      'UPDATE-1 two persistence calls (excluding log)',
      nonLogInvocations.length,
      2,
    )
    assertEqual('UPDATE-1 first call is upsert', nonLogInvocations[0].fn, 'upsert')
    assertEqual(
      'UPDATE-1 second call is appendHistory',
      nonLogInvocations[1].fn,
      'appendHistory',
    )
    const appendInitialCalls = mock.invocations.filter(
      (i) => i.fn === 'appendInitial',
    )
    assertEqual(
      'UPDATE-1 NO appendInitialGradeHistory call on update',
      appendInitialCalls.length,
      0,
    )

    // The GradeChangeEvent built inline must carry the trigger's fields.
    const appendHistoryInvocation = mock.invocations.find(
      (i) => i.fn === 'appendHistory',
    )
    assert('UPDATE-1 appendHistory invocation captured', !!appendHistoryInvocation)
    if (appendHistoryInvocation) {
      const args = appendHistoryInvocation.args as {
        event: GradeChangeEvent
      }
      assertEqual(
        'UPDATE-1 event.event_type === grade_upgrade',
        args.event.event_type,
        'grade_upgrade',
      )
      assertEqual(
        'UPDATE-1 event.previous_grade === pre_progress',
        args.event.previous_grade,
        'pre_progress',
      )
      assertEqual(
        'UPDATE-1 event.new_grade === grade_3',
        args.event.new_grade,
        'grade_3',
      )
      assertEqual(
        'UPDATE-1 event.previous_proximity === reflexive',
        args.event.previous_proximity,
        'reflexive',
      )
      assertEqual(
        'UPDATE-1 event.new_proximity === habitual',
        args.event.new_proximity,
        'habitual',
      )
      assertEqual(
        'UPDATE-1 event.agent_id matches profile',
        args.event.agent_id,
        'agent_test_v1',
      )
    }
  }

  // --------------------------------------------------------------------------
  // UPDATE-2  With grade_changed=false, upsert only — NO appendHistory.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const transition = noChangeTransition(profile.accreditation_record)
    const mock = makeMockDeps()
    await updateAccreditation(profile, transition, mock.deps)

    const upsertCalls = mock.invocations.filter((i) => i.fn === 'upsert')
    const appendHistoryCalls = mock.invocations.filter(
      (i) => i.fn === 'appendHistory',
    )
    const appendInitialCalls = mock.invocations.filter(
      (i) => i.fn === 'appendInitial',
    )
    assertEqual('UPDATE-2 upsert called exactly once', upsertCalls.length, 1)
    assertEqual(
      'UPDATE-2 NO appendGradeHistory call when grade_changed=false',
      appendHistoryCalls.length,
      0,
    )
    assertEqual(
      'UPDATE-2 NO appendInitialGradeHistory call on update path',
      appendInitialCalls.length,
      0,
    )
  }

  // --------------------------------------------------------------------------
  // UPDATE-3  Success log event carries grade_changed + transition fields.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const transition = upgradeTransition(profile.accreditation_record)
    const mock = makeMockDeps()
    await updateAccreditation(profile, transition, mock.deps)

    assertEqual('UPDATE-3 exactly one log event emitted', mock.events.length, 1)
    const event = mock.events[0]
    assertEqual('UPDATE-3 event.call_type === update', event.call_type, 'update')
    assertEqual('UPDATE-3 event.outcome === ok', event.outcome, 'ok')
    assertEqual(
      'UPDATE-3 event.grade_changed === true',
      event.grade_changed,
      true,
    )
    assertEqual(
      'UPDATE-3 event.previous_grade === pre_progress',
      event.previous_grade,
      'pre_progress',
    )
    assertEqual('UPDATE-3 event.new_grade === grade_3', event.new_grade, 'grade_3')
    assertEqual(
      'UPDATE-3 event.trigger_reason === upgrade',
      event.trigger_reason,
      'upgrade',
    )

    // The no-grade-change variant must produce trigger_reason: null.
    const profile2 = freshProfile()
    const noChange = noChangeTransition(profile2.accreditation_record)
    const mock2 = makeMockDeps()
    await updateAccreditation(profile2, noChange, mock2.deps)
    const event2 = mock2.events[0]
    assertEqual(
      'UPDATE-3 grade_changed=false → event.grade_changed === false',
      event2.grade_changed,
      false,
    )
    assertEqual(
      'UPDATE-3 grade_changed=false → event.trigger_reason === null',
      event2.trigger_reason,
      null,
    )
  }

  // --------------------------------------------------------------------------
  // ATOMICITY-1  History append failure after upsert re-throws; upsert was first.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const transition = upgradeTransition(profile.accreditation_record)
    const histError = new Error('appendGradeHistory: Supabase insert failed')
    const mock = makeMockDeps({ appendHistoryThrows: histError })

    let thrown: unknown = null
    try {
      await updateAccreditation(profile, transition, mock.deps)
    } catch (err) {
      thrown = err
    }
    assertEqual('ATOMICITY-1 history error propagates to caller', thrown, histError)

    // Invocation order: upsert succeeded first, THEN appendHistory threw.
    // The state row is "written" (in the mock's invocation log); the audit
    // row is the failure. This proves Decision E's "state ahead of history"
    // failure mode is what fires, not the inverse.
    const persistenceInvocations = mock.invocations.filter(
      (i) => i.fn !== 'log',
    )
    assertEqual(
      'ATOMICITY-1 upsert was attempted',
      persistenceInvocations[0]?.fn,
      'upsert',
    )
    assertEqual(
      'ATOMICITY-1 appendHistory was attempted second',
      persistenceInvocations[1]?.fn,
      'appendHistory',
    )

    // Log event records the error.
    assertEqual('ATOMICITY-1 exactly one log event', mock.events.length, 1)
    assertEqual(
      'ATOMICITY-1 log event outcome === error',
      mock.events[0].outcome,
      'error',
    )
    assertEqual(
      'ATOMICITY-1 log event.error_message matches the throw',
      mock.events[0].error_message,
      histError.message,
    )
  }

  // --------------------------------------------------------------------------
  // IDEMPOTENT-1  Re-calling seedAccreditation produces a successful 2nd call.
  // --------------------------------------------------------------------------
  {
    const profile = freshProfile()
    const mock = makeMockDeps()

    // First call.
    await seedAccreditation(profile, mock.deps)
    // Second call with the same profile.
    await seedAccreditation(profile, mock.deps)

    // Both calls completed without throwing — the contract holds.
    const upsertCalls = mock.invocations.filter((i) => i.fn === 'upsert')
    const appendInitialCalls = mock.invocations.filter(
      (i) => i.fn === 'appendInitial',
    )
    assertEqual('IDEMPOTENT-1 upsert called twice', upsertCalls.length, 2)
    assertEqual(
      'IDEMPOTENT-1 appendInitial called twice',
      appendInitialCalls.length,
      2,
    )

    // Both log events report success.
    assertEqual('IDEMPOTENT-1 two log events emitted', mock.events.length, 2)
    assertEqual(
      'IDEMPOTENT-1 first event outcome === ok',
      mock.events[0].outcome,
      'ok',
    )
    assertEqual(
      'IDEMPOTENT-1 second event outcome === ok',
      mock.events[1].outcome,
      'ok',
    )
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('')
  console.log(
    `atl-accreditation-writer.test.ts — ${passCount} passed / ${failCount} failed`,
  )
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
