/**
 * reflect-service.test.ts — Sage Reflect orchestration wiring (Stage B, B-1).
 *
 * Proves the engine ↔ store ↔ extractor ↔ Zone-3 ↔ Sage-Assent-feed wiring in
 * ISOLATION with DEPENDENCY-INJECTED mocks — no live LLM, no live Supabase. The
 * mock store uses the REAL encryptPersistedState/decryptPersistedState round-trip
 * (R17b), so the state-resume path is exercised for real; a throwaway
 * MENTOR_ENCRYPTION_KEY is set before import. The module transitively imports
 * supabase-server (constructed-but-never-called under mocks), so run with:
 *   npx tsx --env-file=.env.local src/lib/sage-reflect/__tests__/reflect-service.test.ts
 */

process.env.MENTOR_ENCRYPTION_KEY = 'a'.repeat(64)

import { openReflection, answerReflection, type ReflectServiceDeps, type MeterFn } from '../reflect-service'
import { encryptPersistedState, type SageReflectSessionRow, type StoreResult } from '../session-store'
import type { ReflectExtractor } from '../reflect-extractor'
import type { Q1Assessment, Q2Assessment, Q3Assessment, Q4Assessment, SessionSummary } from '../engine'
import type { SageAssentFeedResult, FeedParams } from '../sage-assent-feed'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) { passCount++; console.log(`PASS  ${label}`) }
  else { failCount++; const m = detail ? `${label} — ${detail}` : label; failures.push(m); console.log(`FAIL  ${m}`) }
}

const SUMMARY: SessionSummary = { purpose_at_open: 'ship triage tooling', circle_at_open: 'community', role_at_open: 'maintainer', capacity_at_open: ['triage'], sage_reasoning_passes: 1 }

const MOCK_FEED: SageAssentFeedResult = {
  evaluated_actions_persisted: 1,
  seeded_accreditation: true,
  grade_changed: false,
  senecan_grade: 'pre_progress',
  typical_proximity: 'reflexive',
  dimension_levels: { passion_reduction: 'emerging', judgement_quality: 'emerging', disposition_stability: 'emerging', oikeiosis_extension: 'emerging' },
  direction_of_travel: 'stable',
  per_domain_proximity: { phronesis: 'deliberate', dikaiosyne: null, andreia: null, sophrosyne: null, aggregate: 'deliberate' },
}

// Mock extractor: ignores text, returns fixed assessments (Q1 DIRTY so FD-R1 stays
// off the path; Q4 carries one action so the feed has evidence).
const Q1: Q1Assessment = { distortions: [{ impression: 'deadline=evil', root_passion: 'phobos', examined: false }] }
const Q2: Q2Assessment = { failures: [], pressure_assent: { admitted: false, account_given: true, moments: [] } }
const Q3: Q3Assessment = { patterns: [] }
const Q4: Q4Assessment = { actions: [{ action: 'sent fix', quality: 'moderate', is_kathekon: true, proximity: 'deliberate', passions_detected: [], virtue_domains_engaged: ['phronesis'], oikeiosis_met: true, oikeiosis_stage: 'community' }], calibration: { verdicts_reviewed: 2, discrepancies_found: 0 } }
const mockExtractor: ReflectExtractor = {
  extractQ1: async () => ({ assessment: Q1, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ2: async () => ({ assessment: Q2, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ3: async () => ({ assessment: Q3, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ4: async () => ({ assessment: Q4, usage: { input_tokens: 100, output_tokens: 50 } }),
}

function baseRow(session_id: string, agent_id: string): SageReflectSessionRow {
  return {
    id: `id_${session_id}`, session_id, agent_id, current_step: 'Q1',
    response_history_ciphertext: null, response_history_meta: null,
    phantasia_distortion_log: [], synkatathesis_failure_log: [], horme_pattern_log: [], kathekon_quality_log: [], circle_need_log: [],
    exit_path: null, rs_class: null, profile_update_confidence: 'normal', fabrication_risk_level: 'low',
    progress_dimensions_held: false, scrutiny_flags: [], developer_note: null, sage_calling_trigger: null,
    started_at: 'now', completed_at: null, created_at: 'now',
  }
}

function makeDeps(): { deps: ReflectServiceDeps; store: Map<string, SageReflectSessionRow>; feedCalls: FeedParams[] } {
  const store = new Map<string, SageReflectSessionRow>()
  const feedCalls: FeedParams[] = []
  const writeState = (sid: string, state: { session_summary: SessionSummary; turns: readonly import('../engine').ReflectTurn[] }, patch: Partial<SageReflectSessionRow>): void => {
    const row = store.get(sid)
    if (!row) return
    const enc = encryptPersistedState(state)
    store.set(sid, { ...row, response_history_ciphertext: enc.ciphertext, response_history_meta: enc.meta, ...patch })
  }
  const deps: ReflectServiceDeps = {
    extractor: mockExtractor,
    getSession: async (sid): Promise<StoreResult<SageReflectSessionRow | null>> => ({ ok: true, value: store.get(sid) ?? null }),
    createSession: async (sid, aid): Promise<StoreResult<SageReflectSessionRow>> => { const row = baseRow(sid, aid); store.set(sid, row); return { ok: true, value: row } },
    persistProgress: async (sid, step, state): Promise<StoreResult<void>> => { writeState(sid, state, { current_step: step }); return { ok: true, value: undefined } },
    persistCompletion: async (sid, state): Promise<StoreResult<void>> => { writeState(sid, state, { current_step: 'complete', completed_at: 'now' }); return { ok: true, value: undefined } },
    persistZone3Block: async (sid, state, log, note): Promise<StoreResult<void>> => { writeState(sid, state, { current_step: 'complete', completed_at: 'now', developer_note: note, kathekon_quality_log: log }); return { ok: true, value: undefined } },
    feedSageAssent: async (params): Promise<StoreResult<SageAssentFeedResult>> => { feedCalls.push(params); return { ok: true, value: MOCK_FEED } },
  }
  return { deps, store, feedCalls }
}

const okMeter: MeterFn = async () => ({ ok: true, headers: { 'X-Loop-Id': 'test' } })
const failMeter: MeterFn = async () => ({ ok: false })

// ============================================================================
async function run(): Promise<void> {
  // SVC-1 — OPEN (no harm) surfaces Q1.
  {
    const { deps, store } = makeDeps()
    const r = await openReflection({ session_id: 's1', agent_id: 'a1', session_summary: SUMMARY }, deps, okMeter)
    assert('SVC-1  open → Q1 question', r.ok === true && r.value.decision.kind === 'question' && r.value.decision.kind === 'question' && r.value.decision.question === 'Q1')
    assert('SVC-1b session row created at Q1', store.get('s1')?.current_step === 'Q1')
  }

  // SVC-2 — full Q1→Q6 pass → complete + feed called once with the Q4 evidence.
  {
    const { deps, store, feedCalls } = makeDeps()
    await openReflection({ session_id: 's2', agent_id: 'a2', session_summary: SUMMARY }, deps, okMeter)
    const answers = ['account q1', 'account q2', 'account q3', 'account q4', 'capacity unchanged', 'the purpose remains fitting and continues']
    let last: Awaited<ReturnType<typeof answerReflection>> | null = null
    for (const a of answers) { last = await answerReflection('s2', a, deps, okMeter) }
    assert('SVC-2  final decision is complete', !!last && last.ok === true && last.value.decision.kind === 'complete')
    if (last && last.ok && last.value.decision.kind === 'complete') {
      assert('SVC-2b exit_path sage_reasoning (RS-1 continues)', last.value.decision.outcome.exit_path === 'sage_reasoning')
      assert('SVC-2c mirror note present (R19d)', last.value.decision.mirror_note.includes('next step is always available'))
      assert('SVC-2d feed result attached', last.value.decision.feed?.senecan_grade === 'pre_progress')
    }
    assert('SVC-2e Sage Assent fed exactly once with the Q4 evidence', feedCalls.length === 1 && feedCalls[0].q4.actions.length === 1)
    assert('SVC-2f session persisted complete', store.get('s2')?.current_step === 'complete')
  }

  // SVC-3 — Zone-3 boundary at open: harm-flagged → blocked, NOT reflected, no feed.
  {
    const { deps, store, feedCalls } = makeDeps()
    const r = await openReflection({ session_id: 's3', agent_id: 'a3', session_summary: SUMMARY, safety_signal: { harm_flagged: true, detail: 'deleted prod data' } }, deps, okMeter)
    assert('SVC-3  harm-flagged open → zone3_blocked', r.ok === true && r.value.decision.kind === 'zone3_blocked')
    assert('SVC-3b session marked complete with developer note', store.get('s3')?.current_step === 'complete' && (store.get('s3')?.developer_note ?? '').length > 0)
    assert('SVC-3c contrary kathekon recorded', store.get('s3')?.kathekon_quality_log[0]?.quality === 'contrary')
    assert('SVC-3d Sage Assent NOT fed on a Zone-3 block', feedCalls.length === 0)
  }

  // SVC-4 — answer a non-existent session → not_found.
  {
    const { deps } = makeDeps()
    const r = await answerReflection('missing', 'x', deps, okMeter)
    assert('SVC-4  answer missing session → not_found', r.ok === false && r.code === 'not_found')
  }

  // SVC-5 — answer a completed session → conflict.
  {
    const { deps, store } = makeDeps()
    await openReflection({ session_id: 's5', agent_id: 'a5', session_summary: SUMMARY }, deps, okMeter)
    const row = store.get('s5')!; store.set('s5', { ...row, current_step: 'complete' })
    const r = await answerReflection('s5', 'x', deps, okMeter)
    assert('SVC-5  answer completed session → conflict', r.ok === false && r.code === 'conflict')
  }

  // SVC-6 — meter failure aborts BEFORE persist (state does not advance — retryable).
  {
    const { deps, store } = makeDeps()
    await openReflection({ session_id: 's6', agent_id: 'a6', session_summary: SUMMARY }, deps, okMeter)
    const before = store.get('s6')?.current_step
    const r = await answerReflection('s6', 'account q1', deps, failMeter)
    assert('SVC-6  meter failure → server error', r.ok === false && r.code === 'server')
    assert('SVC-6b state NOT advanced (still at Q1; safely retryable)', store.get('s6')?.current_step === before && before === 'Q1')
  }

  console.log(`\n${passCount} pass / ${failCount} fail`)
  if (failCount > 0) { console.log('\nFailures:'); failures.forEach((f) => console.log(`  - ${f}`)); process.exit(1) }
  process.exit(0)
}

run()
