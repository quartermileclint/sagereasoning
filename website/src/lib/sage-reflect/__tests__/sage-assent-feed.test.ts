/**
 * sage-assent-feed.test.ts — tests for the Sage Assent feed (Stage A, A-5; SR-4).
 *
 * Run (the module transitively imports sage-assent-accreditation-store → supabase-server,
 * which constructs a Supabase client at import; under mock deps it is never CALLED,
 * but the import needs real env, so run with --env-file per /CLAUDE.md):
 *   npx tsx --env-file=.env.local src/lib/sage-reflect/__tests__/sage-assent-feed.test.ts
 *
 * Coverage:
 *   MAP  — kathekonToEvaluatedAction / q4ToEvaluatedActions field mapping (SR-4).
 *   SEED — seedRecord conservative starting credential; the FK-ensure branch.
 *   FLOW — feedSageAssent orchestration order: ensure → persist → read → aggregate
 *          → grade-engine → upsert (engine's record, NOT hand-written) → SR-15.
 *   EXIST— existing accreditation → no seed; single final upsert.
 *   SR15 — per-domain proximity computed + upserted.
 *   ERR  — a failed store call propagates as {ok:false} and short-circuits.
 *   HYS  — the upserted grade is the engine's (a single feed does not move the grade).
 *
 * All deps are MOCKED — no live Supabase round-trip. The live round-trip is a
 * FOUNDER post-deploy smoke test in the Stage-B Critical session.
 */

import {
  feedSageAssent,
  kathekonToEvaluatedAction,
  q4ToEvaluatedActions,
  seedRecord,
  type SageAssentFeedDeps,
} from '../sage-assent-feed'
import type { Q4Assessment } from '../engine'
import type { EvaluatedAction } from '@/lib/substrate/trust-layer/types/evaluation'
import type { AccreditationRecord } from '@/lib/substrate/trust-layer/types/accreditation'

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

const q4: Q4Assessment = {
  actions: [
    {
      action: 'sent the summary',
      quality: 'moderate',
      is_kathekon: true,
      proximity: 'deliberate',
      passions_detected: [{ root_passion: 'epithumia', sub_species: 'haste' }],
      virtue_domains_engaged: ['phronesis', 'dikaiosyne'],
      oikeiosis_met: true,
      oikeiosis_stage: 'community',
    },
  ],
  calibration: { verdicts_reviewed: 2, discrepancies_found: 0 },
}

// Top-level await is not supported under tsx's CJS transform — run the suite in
// an async IIFE.
;(async () => {

// ============================================================================
// MAP
// ============================================================================
{
  const ea = kathekonToEvaluatedAction(q4.actions[0], 'agent_acme_v1', 'sess-9', 0, '2026-05-22T00:00:00.000Z')
  assert('MAP-1  receipt_id stable trace', ea.receipt_id === 'reflect_sess-9_q4_0')
  assert('MAP-2  kathekon_quality from quality', ea.kathekon_quality === 'moderate')
  assert('MAP-3  skill_id is sage_reflect', ea.skill_id === 'sage_reflect')
  assert('MAP-4  candidates_considered defaults to 1 (intuited)', ea.candidates_considered === 1)
  assert('MAP-5  proximity + is_kathekon carried', ea.proximity === 'deliberate' && ea.is_kathekon === true)
  assert('MAP-6  passions + virtue domains carried', ea.passions_detected.length === 1 && ea.virtue_domains_engaged.length === 2)
  const batch = q4ToEvaluatedActions(q4, 'agent_acme_v1', 'sess-9')
  assert('MAP-7  q4ToEvaluatedActions maps every action', batch.length === q4.actions.length)
}

// ============================================================================
// SEED
// ============================================================================
{
  const s = seedRecord('agent_new_v1')
  assert('SEED-1  conservative starting grade', s.senecan_grade === 'pre_progress' && s.typical_proximity === 'reflexive')
  assert('SEED-2  all dimensions emerging', Object.values(s.dimension_levels).every((d) => d === 'emerging'))
  assert('SEED-3  agent_id set + 0 actions', s.agent_id === 'agent_new_v1' && s.actions_evaluated === 0)
}

// ---- mock-deps factory -----------------------------------------------------
function makeDeps(existing: AccreditationRecord | null) {
  const calls: string[] = []
  const upserts: AccreditationRecord[] = []
  let persisted: readonly EvaluatedAction[] = []
  let proxArg: { agentId: string; aggregate: string | null } | null = null
  const deps: SageAssentFeedDeps = {
    lookupAccreditation: async () => {
      calls.push('lookup')
      return existing
    },
    upsertAccreditation: async (r) => {
      calls.push('upsert')
      upserts.push(r)
    },
    persistEvaluatedActions: async (a) => {
      calls.push('persist')
      persisted = a
      return { ok: true, value: { inserted: a.length } }
    },
    getRecentEvaluatedActions: async () => {
      calls.push('getRecent')
      return { ok: true, value: [...persisted] }
    },
    countLifetimeActions: async () => {
      calls.push('count')
      return { ok: true, value: persisted.length }
    },
    upsertProximityDomains: async (agentId, p) => {
      calls.push('proximity')
      proxArg = { agentId, aggregate: p.aggregate }
      return { ok: true, value: undefined }
    },
  }
  return { deps, calls, upserts, getProx: () => proxArg }
}

// ============================================================================
// FLOW — seed branch
// ============================================================================
{
  const m = makeDeps(null) // no existing accreditation → seed
  const res = await feedSageAssent({ agentId: 'agent_acme_v1', sessionId: 'sess-9', q4 }, m.deps)
  assert('FLOW-1  feed succeeds', res.ok === true)
  if (res.ok) {
    assert('FLOW-2  seeded_accreditation true', res.value.seeded_accreditation === true)
    assert('FLOW-3  one Q4 action persisted', res.value.evaluated_actions_persisted === 1)
    assert('FLOW-4  two upserts (seed + engine result)', m.upserts.length === 2)
    // Order: lookup → upsert(seed) → persist → getRecent → count → upsert(final) → proximity.
    assert('FLOW-5  ensure precedes persist', m.calls.indexOf('persist') > m.calls.indexOf('lookup'))
    assert('FLOW-6  persist precedes read-back', m.calls.indexOf('getRecent') > m.calls.indexOf('persist'))
    assert('FLOW-7  proximity write is last', m.calls[m.calls.length - 1] === 'proximity')
    // The final upserted record IS the engine's resulting record (not hand-written).
    const finalUpsert = m.upserts[m.upserts.length - 1]
    assert('FLOW-8  result grade == final upserted record grade (engine-decided)',
      res.value.senecan_grade === finalUpsert.senecan_grade && res.value.typical_proximity === finalUpsert.typical_proximity)
    // PR19 review fold (2026-07-28): the practice-reminders A2 addition threading
    // passions_persisting through to the caller had ZERO test coverage anywhere
    // in the repo — this pins field-identity against the REAL engine's resulting
    // record (not a hand-built mock), closing that gap at its root, dedicated
    // test file.
    assert(
      'FLOW-9  passions_persisting == the final upserted record\'s passions_persisting (exact identity, not merely non-undefined)',
      JSON.stringify(res.value.passions_persisting) === JSON.stringify(finalUpsert.passions_persisting),
      `result=${JSON.stringify(res.value.passions_persisting)} record=${JSON.stringify(finalUpsert.passions_persisting)}`,
    )
  }
}

// ============================================================================
// EXIST — existing accreditation, no seed
// ============================================================================
{
  const existing = seedRecord('agent_acme_v1')
  const m = makeDeps(existing)
  const res = await feedSageAssent({ agentId: 'agent_acme_v1', sessionId: 'sess-10', q4 }, m.deps)
  assert('EXIST-1  feed succeeds', res.ok === true)
  if (res.ok) {
    assert('EXIST-2  not seeded', res.value.seeded_accreditation === false)
    assert('EXIST-3  exactly one upsert (the engine result)', m.upserts.length === 1)
    assert('EXIST-4  no seed upsert before persist', m.calls.indexOf('persist') < m.calls.indexOf('upsert') || m.calls.filter((c) => c === 'upsert').length === 1)
  }
}

// ============================================================================
// SR15 — per-domain proximity
// ============================================================================
{
  const m = makeDeps(null)
  const res = await feedSageAssent({ agentId: 'agent_acme_v1', sessionId: 'sess-11', q4 }, m.deps)
  assert('SR15-1  feed succeeds', res.ok === true)
  if (res.ok) {
    // q4 has one action at 'deliberate' engaging phronesis + dikaiosyne → aggregate deliberate.
    assert('SR15-2  per-domain aggregate computed (deliberate)', res.value.per_domain_proximity.aggregate === 'deliberate')
    assert('SR15-3  per-domain upsert received the agent + aggregate', m.getProx()?.agentId === 'agent_acme_v1' && m.getProx()?.aggregate === 'deliberate')
  }
}

// ============================================================================
// HYS — hysteresis (a single feed does not move the seeded grade)
// ============================================================================
{
  const m = makeDeps(null)
  const res = await feedSageAssent({ agentId: 'agent_acme_v1', sessionId: 'sess-12', q4 }, m.deps)
  assert('HYS-1  single feed → grade unchanged from seed (min_actions not met)',
    res.ok === true && res.value.grade_changed === false && res.value.senecan_grade === 'pre_progress' && res.value.typical_proximity === 'reflexive')
}

// ============================================================================
// ERR — a store failure short-circuits
// ============================================================================
{
  const failingDeps: SageAssentFeedDeps = {
    lookupAccreditation: async () => seedRecord('agent_acme_v1'),
    upsertAccreditation: async () => {},
    persistEvaluatedActions: async () => ({ ok: false, error: 'simulated insert failure' }),
    getRecentEvaluatedActions: async () => ({ ok: true, value: [] }),
    countLifetimeActions: async () => ({ ok: true, value: 0 }),
    upsertProximityDomains: async () => ({ ok: true, value: undefined }),
  }
  const res = await feedSageAssent({ agentId: 'agent_acme_v1', sessionId: 'sess-13', q4 }, failingDeps)
  assert('ERR-1  persist failure propagates as {ok:false}', res.ok === false && !res.ok && res.error.includes('simulated insert failure'))
}

// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)

})()
