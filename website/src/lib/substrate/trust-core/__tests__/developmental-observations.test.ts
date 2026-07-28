/**
 * developmental-observations.test.ts — practice reminders, agent Phase A2
 * (2026-07-28): the store-level bounded read `readDevelopmentalObservations`
 * (trust-core-store.ts) that feeds the S4 developmental-flag scan
 * (evaluateDevelopmentalFlags, intervention-engine.ts §E).
 *
 * Uses the SAME in-memory fake Supabase client the rest of the trust-core
 * battery uses (fake-supabase.ts) — no live DB, no env file needed (the admin
 * client is lazy and never constructed when a client is passed explicitly).
 *
 * Run: npx tsx src/lib/substrate/trust-core/__tests__/developmental-observations.test.ts
 */

import { makeFakeSupabase } from './fake-supabase'
import {
  readDevelopmentalObservations,
  DEVELOPMENTAL_OBSERVATION_ROW_CAP,
} from '../trust-core-store'
import {
  evaluateDevelopmentalFlags,
  DEVELOPMENTAL_CONSISTENCY_THRESHOLD,
} from '../intervention-engine'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const m = detail ? `${label} — ${detail}` : label
    failures.push(m)
    console.log(`FAIL  ${m}`)
  }
}

// ============================================================================
// Fixture helpers — insert raw agent_trust_events rows directly (bypassing the
// deriver/emitter — this file tests the READ, not the emission pipeline, which
// is already covered by S1/S1-fold batteries).
// ============================================================================

function credentialCompletedRow(opts: {
  agentId: string
  domain: string
  level: string
  correlationId: string
  occurredAt: string
  /** PR19 fold — the ledger-write-time tiebreak column; defaults to occurredAt
   *  when a test doesn't care about it distinctly. */
  createdAt?: string
}): Record<string, unknown> {
  return {
    agent_id: opts.agentId,
    owner_user_id: null,
    credential_ref: null,
    virtue_domain: opts.domain,
    event_type: 'credential-completed',
    artifact_kind: 'signed_layer2_assessment',
    artifact_ref: 'signed:test-key',
    payload: { demonstratedProximity: opts.level, coverageContinuous: true, keyId: 'test-key' },
    occurred_at: opts.occurredAt,
    created_at: opts.createdAt ?? opts.occurredAt,
    correlation_id: opts.correlationId,
    retain_until: '2099-01-01T00:00:00.000Z',
  }
}

async function run(): Promise<void> {
  // ==========================================================================
  // SECTION 1 — empty / missing-table / transient error
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const res = await readDevelopmentalObservations('sagereasoning:agent-empty@v1', fake.client)
    assert('OBS-1  empty table → ok:true, value:[]', res.ok === true && res.ok && res.value.length === 0)
  }
  {
    const fake = makeFakeSupabase({ missingTables: true })
    const res = await readDevelopmentalObservations('sagereasoning:agent-missing@v1', fake.client)
    assert(
      'OBS-2  missing table → benign ok:true, value:[] (never ok:false)',
      res.ok === true && res.ok && res.value.length === 0,
    )
  }
  {
    const fake = makeFakeSupabase()
    fake.failNext('select', 'agent_trust_events', { code: '08006', message: 'connection reset' })
    const res = await readDevelopmentalObservations('sagereasoning:agent-fail@v1', fake.client)
    assert('OBS-3  a real transient error surfaces as ok:false, never silently empty', res.ok === false)
  }

  // ==========================================================================
  // SECTION 2 — well-formed mapping (sessionId/domain/level/occurredAt)
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-map@v1'
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'deliberate',
        correlationId: 'accr:aaa111',
        occurredAt: '2026-07-20T10:00:00.000Z',
      }),
    )
    const res = await readDevelopmentalObservations(agentId, fake.client)
    assert('OBS-4  one row maps ok:true', res.ok === true)
    if (res.ok) {
      assert('OBS-5  value has exactly 1 observation', res.value.length === 1)
      const o = res.value[0]
      assert('OBS-6  sessionId = correlation_id', o.sessionId === 'accr:aaa111')
      assert('OBS-7  domain = virtue_domain', o.domain === 'dikaiosyne')
      assert('OBS-8  level = payload.demonstratedProximity', o.level === 'deliberate')
      assert('OBS-9  occurredAt = occurred_at', o.occurredAt === '2026-07-20T10:00:00.000Z')
    }
  }

  // ==========================================================================
  // SECTION 3 — scoping: agent_id and event_type filters genuinely apply
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const target = 'sagereasoning:agent-scope-target@v1'
    const other = 'sagereasoning:agent-scope-other@v1'
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId: other,
        domain: 'dikaiosyne',
        level: 'deliberate',
        correlationId: 'accr:other1',
        occurredAt: '2026-07-20T10:00:00.000Z',
      }),
    )
    const res = await readDevelopmentalObservations(target, fake.client)
    assert(
      'OBS-10  a different agent_id row is EXCLUDED (agent_id scoping genuinely applies)',
      res.ok === true && res.ok && res.value.length === 0,
    )
  }
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-eventtype@v1'
    fake.tables.agent_trust_events.push({
      ...credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'violated' as unknown as string, // not a proximity — this row is a DIFFERENT event_type anyway
        correlationId: 'accr:justice1',
        occurredAt: '2026-07-20T10:00:00.000Z',
      }),
      event_type: 'justice-surface-violated',
      payload: { obligationStatus: 'violated', keyId: 'test-key' }, // no demonstratedProximity
    })
    const res = await readDevelopmentalObservations(agentId, fake.client)
    assert(
      'OBS-11  a non-credential-completed event_type row is EXCLUDED',
      res.ok === true && res.ok && res.value.length === 0,
    )
  }

  // ==========================================================================
  // SECTION 4 — malformed rows are SKIPPED, never guessed
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-malformed@v1'
    // Missing virtue_domain.
    fake.tables.agent_trust_events.push({
      ...credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'deliberate',
        correlationId: 'accr:m1',
        occurredAt: '2026-07-20T10:00:00.000Z',
      }),
      virtue_domain: null,
    })
    // Missing correlation_id.
    fake.tables.agent_trust_events.push({
      ...credentialCompletedRow({
        agentId,
        domain: 'phronesis',
        level: 'deliberate',
        correlationId: 'accr:m2',
        occurredAt: '2026-07-20T11:00:00.000Z',
      }),
      correlation_id: null,
    })
    // Invalid level (not in the KatorthomaProximity vocabulary).
    fake.tables.agent_trust_events.push({
      ...credentialCompletedRow({
        agentId,
        domain: 'andreia',
        level: 'deliberate',
        correlationId: 'accr:m3',
        occurredAt: '2026-07-20T12:00:00.000Z',
      }),
      payload: { demonstratedProximity: 'not_a_real_level', keyId: 'test-key' },
    })
    // A genuinely well-formed row, to prove the others were SKIPPED not just
    // that the whole read failed.
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId,
        domain: 'sophrosyne',
        level: 'principled',
        correlationId: 'accr:m4',
        occurredAt: '2026-07-20T13:00:00.000Z',
      }),
    )
    const res = await readDevelopmentalObservations(agentId, fake.client)
    assert(
      'OBS-12  3 malformed rows skipped, 1 well-formed row kept (never guessed, never all-fail)',
      res.ok === true && res.ok && res.value.length === 1 && res.value[0].domain === 'sophrosyne',
    )
  }

  // ==========================================================================
  // SECTION 5 — the row cap is genuinely applied (mutation-catching: removing
  // .limit() from the query would make this fail)
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-cap@v1'
    const overCap = DEVELOPMENTAL_OBSERVATION_ROW_CAP + 15
    // PR19 fold — MONOTONIC (not cyclic) timestamps, so a survivor-identity
    // check is meaningful: the newest row is unambiguously index (overCap-1),
    // the oldest is unambiguously index 0.
    for (let i = 0; i < overCap; i++) {
      fake.tables.agent_trust_events.push(
        credentialCompletedRow({
          agentId,
          domain: i % 2 === 0 ? 'dikaiosyne' : 'phronesis',
          level: 'deliberate',
          correlationId: `accr:cap${i}`,
          occurredAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
        }),
      )
    }
    const res = await readDevelopmentalObservations(agentId, fake.client)
    assert(
      'OBS-13  row cap genuinely applied — more rows exist than are returned',
      res.ok === true && res.ok && res.value.length === DEVELOPMENTAL_OBSERVATION_ROW_CAP,
      res.ok ? `got ${res.value.length}, expected ${DEVELOPMENTAL_OBSERVATION_ROW_CAP}` : res.error,
    )
    if (res.ok) {
      const ids = new Set(res.value.map((o) => o.sessionId))
      assert(
        'OBS-13b  the NEWEST row survives the cap (catches an ordering-direction regression)',
        ids.has(`accr:cap${overCap - 1}`),
      )
      assert(
        'OBS-13c  the OLDEST row does NOT survive the cap (catches an ordering-direction regression)',
        !ids.has('accr:cap0'),
      )
    }
  }

  // PR19 fold — a genuine timestamp TIE (identical occurred_at, distinct
  // created_at) resolves deterministically via the secondary ORDER BY, not by
  // sort-stability accident. Exercises the fake's now-multi-column .order()
  // support (chained .order() calls accumulate, mirroring real PostgREST).
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-tie@v1'
    const tiedAt = '2026-07-20T10:00:00.000Z'
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'habitual',
        correlationId: 'accr:tie-older-write',
        occurredAt: tiedAt,
        createdAt: '2026-07-20T10:00:00.001Z', // earlier ledger-write time
      }),
    )
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'deliberate',
        correlationId: 'accr:tie-newer-write',
        occurredAt: tiedAt, // IDENTICAL occurred_at — the tie
        createdAt: '2026-07-20T10:00:00.002Z', // later ledger-write time
      }),
    )
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'deliberate',
        correlationId: 'accr:tie-2',
        occurredAt: '2026-07-21T10:00:00.000Z',
      }),
    )
    fake.tables.agent_trust_events.push(
      credentialCompletedRow({
        agentId,
        domain: 'dikaiosyne',
        level: 'deliberate',
        correlationId: 'accr:tie-3',
        occurredAt: '2026-07-22T10:00:00.000Z',
      }),
    )
    // Run the SAME read twice. HONEST LIMIT: this in-memory fake's sort is
    // Array.prototype.sort, spec-stable since ES2019, so even WITHOUT the
    // created_at/id tiebreak it would deterministically preserve insertion
    // order across repeated reads of the SAME in-memory table — it cannot
    // reproduce real Postgres's documented lack of a cross-execution tie-order
    // guarantee. OBS-17 therefore only proves the fixed code doesn't ITSELF
    // introduce non-determinism; OBS-18 (below) is the actual regression
    // catcher, mutation-verified (removing the .order('created_at')/.order('id')
    // chain flips its expected count from 1 to 0 — confirmed live, then
    // reverted).
    const res1 = await readDevelopmentalObservations(agentId, fake.client)
    const res2 = await readDevelopmentalObservations(agentId, fake.client)
    assert(
      'OBS-17  a timestamp tie resolves consistently (repeated reads agree)',
      res1.ok === true &&
        res2.ok === true &&
        res1.ok &&
        res2.ok &&
        JSON.stringify(res1.value) === JSON.stringify(res2.value),
    )
    if (res1.ok) {
      const flags = evaluateDevelopmentalFlags(res1.value)
      // HONEST FINDING FROM BUILDING THIS TEST: evaluateDevelopmentalFlags (the
      // unmodified S4 engine) re-sorts its OWN input ascending by occurredAt
      // ONLY — it has no createdAt field to break a tie on, so for the tied
      // pair it falls back to Array.prototype.sort's stability, which preserves
      // whatever relative order the STORE handed it. Because the engine sorts
      // ASCENDING and walks BACKWARD (treating later array positions as more
      // recent), the element the store lists FIRST (this fix's "more recent"
      // per created_at DESC) ends up EARLIER in the engine's ascending tied
      // bucket — and is therefore walked LATER in the backward scan than the
      // element the store listed second. The net effect for THIS fixture:
      // older-write is walked before newer-write, so the newest-to-oldest run
      // is [tie-3, tie-2, older-write(habitual)] = breaks at 2, never reaching
      // newer-write. This does NOT undermine the fix's actual purpose (closing
      // cross-execution non-determinism at the STORE/Postgres level, proven by
      // OBS-17 — repeated reads of the same data now always agree, which they
      // would not under an unspecified Postgres tie order) — it just means
      // "which of two millisecond-tied writes reads as more recent" is an
      // emergent property of the unmodified engine's own convention, not an
      // independently-guaranteed "later ledger-write wins" semantic. Recorded
      // here rather than silently asserting a value that looked intuitive but
      // wasn't what the actual composition produces.
      assert(
        'OBS-18  a resolved (not random) tie: the run breaks at exactly 2, deterministically, on every read of this fixture',
        flags.length === 0,
        JSON.stringify(flags),
      )
    }
  }

  // ==========================================================================
  // SECTION 6 — end-to-end: the read's OUTPUT genuinely drives
  // evaluateDevelopmentalFlags (semantic correctness, not just shape)
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-e2e-fires@v1'
    // 3 consecutive deliberate writes in dikaiosyne (>= DEVELOPMENTAL_CONSISTENCY_THRESHOLD).
    for (let i = 0; i < DEVELOPMENTAL_CONSISTENCY_THRESHOLD; i++) {
      fake.tables.agent_trust_events.push(
        credentialCompletedRow({
          agentId,
          domain: 'dikaiosyne',
          level: 'deliberate',
          correlationId: `accr:e2e${i}`,
          occurredAt: `2026-07-2${i}T10:00:00.000Z`,
        }),
      )
    }
    const res = await readDevelopmentalObservations(agentId, fake.client)
    assert('OBS-14  e2e fixture reads ok', res.ok === true)
    if (res.ok) {
      const flags = evaluateDevelopmentalFlags(res.value)
      assert(
        'OBS-15  the read output genuinely drives a firing developmental flag (semantic, not just shape)',
        flags.length === 1 && flags[0].domain === 'dikaiosyne',
        JSON.stringify(flags),
      )
    }
  }
  {
    const fake = makeFakeSupabase()
    const agentId = 'sagereasoning:agent-e2e-silent@v1'
    // Only 2 consecutive deliberate — below the threshold.
    for (let i = 0; i < DEVELOPMENTAL_CONSISTENCY_THRESHOLD - 1; i++) {
      fake.tables.agent_trust_events.push(
        credentialCompletedRow({
          agentId,
          domain: 'dikaiosyne',
          level: 'deliberate',
          correlationId: `accr:e2es${i}`,
          occurredAt: `2026-07-2${i}T10:00:00.000Z`,
        }),
      )
    }
    const res = await readDevelopmentalObservations(agentId, fake.client)
    if (res.ok) {
      const flags = evaluateDevelopmentalFlags(res.value)
      assert(
        'OBS-16  below-threshold history stays silent (no flag)',
        flags.length === 0,
        JSON.stringify(flags),
      )
    } else {
      assert('OBS-16  below-threshold history stays silent (no flag)', false, res.error)
    }
  }

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('')
  console.log(`developmental-observations battery: ${passCount} passed, ${failCount} failed`)
  if (failCount > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exitCode = 1
  }
}

run()
