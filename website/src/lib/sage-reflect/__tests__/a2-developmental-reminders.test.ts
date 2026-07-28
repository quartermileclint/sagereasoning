/**
 * a2-developmental-reminders.test.ts — practice reminders, agent Phase A2
 * (2026-07-28): the reflect completion's developmental read-back
 * (`developmental_priorities`) + the grade-changed suggestion attach
 * (`suggestion`), end-to-end from the seam helpers through the
 * reflect-service.ts orchestration to the wire response (buildCompleteResponse).
 *
 * The store-level read (`readDevelopmentalObservations`) has its own dedicated
 * battery (trust-core/__tests__/developmental-observations.test.ts, no env file
 * needed) — this file covers the SERVICE + RESPONSE layers, which transitively
 * import supabase-server.ts via reflect-service.ts → session-store.ts, so run:
 *   npx tsx --env-file=.env.local src/lib/sage-reflect/__tests__/a2-developmental-reminders.test.ts
 */

process.env.MENTOR_ENCRYPTION_KEY = 'a'.repeat(64)

import {
  isReflectDevelopmentalEnabled,
  practiceSuggestionForReflect,
  practiceSuggestionFor,
  composePracticeSuggestion,
  REFLECT_DEVELOPMENTAL_ENV_VAR,
  SUGGESTION_LINES,
  type PracticeSuggestionSnapshot,
} from '@/lib/substrate/practice-suggestion'
import type { TrajectoryDeltaBlock } from '@/lib/substrate/trajectory-delta'
import { EVIDENCE_FLOOR, SETTLED_REGIME_BOUNDARIES } from '@/lib/substrate/trajectory-delta'
import type { PersistingPassion } from '@/lib/substrate/trust-layer/types/accreditation'
import type { StoreResult as TrustCoreStoreResult } from '@/lib/substrate/trust-core/trust-core-store'
import {
  evaluateDevelopmentalFlags,
  type SessionDomainObservation,
} from '@/lib/substrate/trust-core/intervention-engine'

import {
  openReflection,
  answerReflection,
  type ReflectServiceDeps,
  type MeterFn,
  type ReflectDecision,
} from '../reflect-service'
import { encryptPersistedState, type SageReflectSessionRow, type StoreResult, type CrossSessionContext } from '../session-store'
import type { ReflectExtractor } from '../reflect-extractor'
import type { Q1Assessment, Q2Assessment, Q3Assessment, Q4Assessment, Q5Assessment, SessionSummary } from '../engine'
import type { SageAssentFeedResult, FeedParams } from '../sage-assent-feed'
import { buildCompleteResponse } from '@/app/api/practice/reflect/response-builders'

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
// SECTION A — isReflectDevelopmentalEnabled (exact-string flag discipline,
// mirroring A1's own isPracticeSuggestionEnabled pattern)
// ============================================================================

function withEnv(value: string | undefined, fn: () => void): void {
  const prior = process.env[REFLECT_DEVELOPMENTAL_ENV_VAR]
  if (value === undefined) delete process.env[REFLECT_DEVELOPMENTAL_ENV_VAR]
  else process.env[REFLECT_DEVELOPMENTAL_ENV_VAR] = value
  try {
    fn()
  } finally {
    if (prior === undefined) delete process.env[REFLECT_DEVELOPMENTAL_ENV_VAR]
    else process.env[REFLECT_DEVELOPMENTAL_ENV_VAR] = prior
  }
}

withEnv(undefined, () => {
  assert('FLAG-1  unset → isReflectDevelopmentalEnabled() false', isReflectDevelopmentalEnabled() === false)
})
withEnv('true', () => {
  assert("FLAG-2  'true' → isReflectDevelopmentalEnabled() true", isReflectDevelopmentalEnabled() === true)
})
withEnv('TRUE', () => {
  assert("FLAG-3  'TRUE' (wrong case) → false (exact-string discipline)", isReflectDevelopmentalEnabled() === false)
})
withEnv('false', () => {
  assert("FLAG-4  'false' → false", isReflectDevelopmentalEnabled() === false)
})

// A1's OWN flag is untouched by A2's flag — the two activate independently
// (plan §5's explicit requirement).
withEnv('true', () => {
  const otherFlagPrior = process.env.SUBSTRATE_PRACTICE_SUGGESTION_ENABLED
  delete process.env.SUBSTRATE_PRACTICE_SUGGESTION_ENABLED
  const snapshot: PracticeSuggestionSnapshot = { persistingPassions: [pp('phobos', 'agonia')] }
  assert(
    'FLAG-5  A2 flag on + A1 flag off → practiceSuggestionForReflect fires, practiceSuggestionFor stays silent',
    practiceSuggestionForReflect(snapshot) !== undefined && practiceSuggestionFor(snapshot) === undefined,
  )
  if (otherFlagPrior === undefined) delete process.env.SUBSTRATE_PRACTICE_SUGGESTION_ENABLED
  else process.env.SUBSTRATE_PRACTICE_SUGGESTION_ENABLED = otherFlagPrior
})

// ============================================================================
// SECTION B — practiceSuggestionForReflect: flag gate + delegation correctness
// ============================================================================

function pp(root: PersistingPassion['root_passion'], sub: string): PersistingPassion {
  return { root_passion: root, sub_species: sub, occurrence_count: 4, occurrence_rate: 0.4 }
}

withEnv(undefined, () => {
  const snapshot: PracticeSuggestionSnapshot = { persistingPassions: [pp('phobos', 'agonia')] }
  assert('SEAM-1  flag off → practiceSuggestionForReflect always undefined', practiceSuggestionForReflect(snapshot) === undefined)
})

withEnv('true', () => {
  const snapshot: PracticeSuggestionSnapshot = { persistingPassions: [pp('phobos', 'agonia')] }
  const viaReflect = practiceSuggestionForReflect(snapshot)
  const viaPureCore = composePracticeSuggestion(snapshot)
  assert(
    'SEAM-2  flag on → practiceSuggestionForReflect delegates to the SAME pure core (no drift)',
    viaReflect !== undefined &&
      viaPureCore !== undefined &&
      JSON.stringify(viaReflect) === JSON.stringify(viaPureCore) &&
      viaReflect.basis.code === 'agonia_persisting',
  )
})

// ============================================================================
// SECTION C — persistingOfFamily's NEW fallback: the 7 persisting-capable
// bases fire correctly via persistingPassions ALONE (no delta), and delta
// takes precedence when both are present.
// ============================================================================

function minimalDelta(overrides: Partial<TrajectoryDeltaBlock> = {}): TrajectoryDeltaBlock {
  const b = (nonEmpty = 6): TrajectoryDeltaBlock['dimension_trends_basis']['passion_reduction'] => ({
    input_count: nonEmpty,
    empty_count: 0,
    baseline_non_empty: Math.floor(nonEmpty / 2),
    current_non_empty: Math.ceil(nonEmpty / 2),
    floor: EVIDENCE_FLOOR,
  })
  const trend = { level: 'developing' as const, trend: 'stable' as const, indicators: [] }
  return {
    schema: 'agent-trajectory-delta-v1',
    vocabulary_note: 'fixture',
    identity: {
      window_scope: 'presenting_credential',
      canonical_identity: 'owner_agent_pair',
      agent_declared: true,
      rotation_note: null,
    },
    regime: {
      segment_used: 'post-s11b-recomposition',
      rows_in_window: 6,
      rows_in_segment: 6,
      rows_excluded_earlier_eras: 0,
      rows_excluded_boundary_band: 0,
      boundaries: SETTLED_REGIME_BOUNDARIES,
      note: 'fixture',
    },
    provenance: { n_supplied: 0, n_server: 6, n_unknown: 0, note: 'fixture' },
    computed_over: { baseline_rows: 3, current_rows: 3 },
    dimension_trends: {
      passion_reduction: trend,
      judgement_quality: trend,
      disposition_stability: trend,
      oikeiosis_extension: trend,
    },
    dimension_trends_basis: {
      passion_reduction: b(),
      judgement_quality: b(),
      disposition_stability: b(),
      oikeiosis_extension: b(),
    },
    passions_persisted_in_window: 'insufficient_extraction',
    passions_persisted_basis: b(),
    sub_species_frequency_deltas: {},
    sub_species_frequency_basis: b(),
    kathekon_quality_trend: 'stable',
    kathekon_quality_basis: b(),
    first_circle_obligation_trend: 'stable',
    first_circle_obligation_basis: { ...b(), semantics: 'fixture' },
    domain_engagement_deltas: {},
    domain_engagement_basis: b(),
    bounds: { mention_conversion: 'fixture' },
    ...overrides,
  }
}

const PERSISTING_LEG_CASES: { label: string; pp: PersistingPassion; expectedCode: string }[] = [
  { label: 'PERSIST-1  agonia_persisting', pp: pp('phobos', 'agonia'), expectedCode: 'agonia_persisting' },
  { label: 'PERSIST-2  oknos_persisting', pp: pp('phobos', 'oknos'), expectedCode: 'oknos_persisting' },
  { label: 'PERSIST-3  acute_fear_pattern (deima)', pp: pp('phobos', 'deima'), expectedCode: 'acute_fear_pattern' },
  { label: 'PERSIST-4  acute_fear_pattern (thorybos)', pp: pp('phobos', 'thorybos'), expectedCode: 'acute_fear_pattern' },
  { label: 'PERSIST-5  aischyne_pattern', pp: pp('phobos', 'aischyne'), expectedCode: 'aischyne_pattern' },
  { label: 'PERSIST-6  philodoxia_persisting', pp: pp('epithumia', 'philodoxia'), expectedCode: 'philodoxia_persisting' },
  { label: 'PERSIST-7  epithumia_persisting (non-philodoxia craving)', pp: pp('epithumia', 'orge'), expectedCode: 'epithumia_persisting' },
  { label: 'PERSIST-8  comparison_persisting (phthonos)', pp: pp('lupe', 'phthonos'), expectedCode: 'comparison_persisting' },
  { label: 'PERSIST-9  comparison_persisting (zelotypia)', pp: pp('lupe', 'zelotypia'), expectedCode: 'comparison_persisting' },
]

for (const c of PERSISTING_LEG_CASES) {
  const result = composePracticeSuggestion({ persistingPassions: [c.pp] })
  assert(
    `${c.label} fires via persistingPassions alone (no delta/assessment/examinationOpen/loopFold)`,
    result !== undefined && result.basis.code === c.expectedCode && result.line === SUGGESTION_LINES[c.expectedCode as keyof typeof SUGGESTION_LINES],
    result ? `got ${result.basis.code}` : 'undefined',
  )
}

// Thambos, thambos-adjacent, and the confirmed-silent families never fire —
// no detector exists (mentor-confirmed silence, twice).
{
  const result = composePracticeSuggestion({ persistingPassions: [pp('phobos', 'thambos')] })
  assert('PERSIST-10  thambos stays silent even via persistingPassions', result === undefined)
}
{
  const result = composePracticeSuggestion({ persistingPassions: [pp('lupe', 'penthos')] })
  assert('PERSIST-11  penthos (lupe, non-comparison) stays silent', result === undefined)
}
{
  const result = composePracticeSuggestion({ persistingPassions: [pp('hedone', 'chara')] })
  assert('PERSIST-12  the whole hedone family stays silent', result === undefined)
}

// Empty array → honest silence, not a crash.
{
  const result = composePracticeSuggestion({ persistingPassions: [] })
  assert('PERSIST-13  an empty persistingPassions array → no basis fires (not a crash)', result === undefined)
}

// PRECEDENCE: a real delta block (even carrying 'insufficient_extraction' for
// passions_persisted_in_window specifically) is ALWAYS authoritative over
// persistingPassions — the fallback is consulted ONLY when s.delta is absent.
{
  const snapshot: PracticeSuggestionSnapshot = {
    delta: minimalDelta({ passions_persisted_in_window: 'insufficient_extraction' }),
    persistingPassions: [pp('phobos', 'agonia')],
  }
  const result = composePracticeSuggestion(snapshot)
  assert(
    'PRECEDENCE-1  a present delta (even insufficient_extraction) wins — persistingPassions ignored',
    result === undefined,
  )
}
{
  const snapshot: PracticeSuggestionSnapshot = {
    delta: minimalDelta({ passions_persisted_in_window: [pp('lupe', 'phthonos')] }),
    persistingPassions: [pp('phobos', 'agonia')],
  }
  const result = composePracticeSuggestion(snapshot)
  assert(
    "PRECEDENCE-2  a present delta's OWN persisting passions win over the fallback field's DIFFERENT content",
    result !== undefined && result.basis.code === 'comparison_persisting',
    result ? result.basis.code : 'undefined',
  )
}

// B1/B2/B6 stay correctly silent when ONLY persistingPassions is supplied —
// proving the documented per-leg fidelity mapping (no assessment,
// examinationOpen, or loopFold means those legs never fire here).
{
  const result = composePracticeSuggestion({ persistingPassions: [pp('phobos', 'agonia'), pp('epithumia', 'philodoxia')] })
  assert(
    'PRECEDENCE-3  with only persistingPassions, B2/B1/B6 never fire (precedence still starts at B2, correctly finds nothing)',
    result !== undefined && result.basis.code === 'agonia_persisting',
    'the agonia leg (B3, first in precedence among what CAN fire) should win, not a fabricated B2/B1/B6',
  )
}

// ============================================================================
// SECTION D — reflect-service.ts orchestration (answerReflection's A2 wiring)
// ============================================================================

const SUMMARY: SessionSummary = {
  purpose_at_open: 'ship triage tooling',
  circle_at_open: 'community',
  role_at_open: 'maintainer',
  capacity_at_open: ['triage'],
  sage_reasoning_passes: 1,
}

function mkFeed(overrides: Partial<SageAssentFeedResult> = {}): SageAssentFeedResult {
  return {
    evaluated_actions_persisted: 1,
    seeded_accreditation: true,
    grade_changed: false,
    senecan_grade: 'pre_progress',
    typical_proximity: 'reflexive',
    dimension_levels: { passion_reduction: 'emerging', judgement_quality: 'emerging', disposition_stability: 'emerging', oikeiosis_extension: 'emerging' },
    direction_of_travel: 'stable',
    per_domain_proximity: { phronesis: 'deliberate', dikaiosyne: null, andreia: null, sophrosyne: null, aggregate: 'deliberate' },
    ...overrides,
  }
}

const Q1: Q1Assessment = { distortions: [{ impression: 'deadline=evil', root_passion: 'phobos', examined: false }] }
const Q2: Q2Assessment = { failures: [], pressure_assent: { admitted: false, account_given: true, moments: [] } }
const Q3: Q3Assessment = { patterns: [] }
const Q4: Q4Assessment = { actions: [{ action: 'sent fix', quality: 'moderate', is_kathekon: true, proximity: 'deliberate', passions_detected: [], virtue_domains_engaged: ['phronesis'], oikeiosis_met: true, oikeiosis_stage: 'community' }], calibration: { verdicts_reviewed: 2, discrepancies_found: 0 } }
const Q5_UNCHANGED: Q5Assessment = {
  capacity_delta: { domains_added: [], domains_removed: [], domains_updated: [] },
  circle_need_delta: { circle: 'community', need_description: '', independence_confirmed: false, proportion_assessment: '' },
  reasoning_pattern_change: false,
}
const mockExtractor: ReflectExtractor = {
  extractQ1: async () => ({ assessment: Q1, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ2: async () => ({ assessment: Q2, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ3: async () => ({ assessment: Q3, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ4: async () => ({ assessment: Q4, usage: { input_tokens: 100, output_tokens: 50 } }),
  extractQ5: async () => ({ assessment: Q5_UNCHANGED, usage: { input_tokens: 120, output_tokens: 40 } }),
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

function makeDeps(opts?: {
  feed?: SageAssentFeedResult
  readObs?: (agentId: string) => Promise<TrustCoreStoreResult<SessionDomainObservation[]>>
}): { deps: ReflectServiceDeps; store: Map<string, SageReflectSessionRow>; readObsCalls: string[] } {
  const store = new Map<string, SageReflectSessionRow>()
  const readObsCalls: string[] = []
  const writeState = (
    sid: string,
    state: { session_summary: SessionSummary; turns: readonly import('../engine').ReflectTurn[] },
    patch: Partial<SageReflectSessionRow>,
  ): void => {
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
    getCrossSessionContext: async (): Promise<CrossSessionContext> => ({ prior_sessions: [], sage_assent_agreement_streak: 0 }),
    feedSageAssent: async (_params: FeedParams): Promise<StoreResult<SageAssentFeedResult>> => ({ ok: true, value: opts?.feed ?? mkFeed() }),
    readDevelopmentalObservations: async (agentId: string) => {
      readObsCalls.push(agentId)
      return opts?.readObs ? opts.readObs(agentId) : { ok: true, value: [] }
    },
  }
  return { deps, store, readObsCalls }
}

const okMeter: MeterFn = async () => ({ ok: true, headers: { 'X-Loop-Id': 'test' } })
const FULL_ANSWERS = ['account q1', 'account q2', 'account q3', 'account q4', 'capacity unchanged', 'the purpose remains fitting and continues']

async function driveToComplete(
  sessionId: string,
  agentId: string,
  deps: ReflectServiceDeps,
): Promise<Extract<ReflectDecision, { kind: 'complete' }> | null> {
  await openReflection({ session_id: sessionId, agent_id: agentId, session_summary: SUMMARY }, deps, okMeter)
  let last: Awaited<ReturnType<typeof answerReflection>> | null = null
  for (const a of FULL_ANSWERS) last = await answerReflection(sessionId, a, deps, okMeter)
  return last && last.ok === true && last.value.decision.kind === 'complete' ? last.value.decision : null
}

const FIRING_OBS: SessionDomainObservation[] = [
  { sessionId: 'accr:1', domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-01T00:00:00.000Z' },
  { sessionId: 'accr:2', domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-02T00:00:00.000Z' },
  { sessionId: 'accr:3', domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-03T00:00:00.000Z' },
]

async function main(): Promise<void> {
  // ORCH-1 — flag OFF: byte-identity. readDevelopmentalObservations is NEVER
  // called (zero new DB work); both fields absent even with a firing-shaped mock.
  await withEnvAsync(undefined, async () => {
    const { deps, readObsCalls } = makeDeps({ readObs: async () => ({ ok: true, value: FIRING_OBS }) })
    const decision = await driveToComplete('orch1', 'sagereasoning:agent-orch1@v1', deps)
    assert('ORCH-1a  flag off → completion reached', decision !== null)
    assert('ORCH-1b  flag off → readDevelopmentalObservations NEVER called', readObsCalls.length === 0, `calls=${readObsCalls.length}`)
    assert('ORCH-1c  flag off → developmental_priorities absent', decision?.developmental_priorities === undefined)
    assert('ORCH-1d  flag off → suggestion absent', decision?.suggestion === undefined)
  })

  // ORCH-2 — flag ON, qualifying observations → developmental_priorities populated.
  await withEnvAsync('true', async () => {
    const { deps, readObsCalls } = makeDeps({ readObs: async () => ({ ok: true, value: FIRING_OBS }) })
    const decision = await driveToComplete('orch2', 'sagereasoning:agent-orch2@v1', deps)
    assert('ORCH-2a  flag on → readDevelopmentalObservations called exactly once', readObsCalls.length === 1)
    // PR19 review fold (2026-07-28): the expected note is DERIVED from the same
    // pure S4 engine call on the SAME fixture, not a hardcoded string literal
    // that could drift stale — this pins the orchestration's `note: f.note`
    // mapping itself (a copy-paste slip to `note: f.domain` would fail this),
    // while staying correct automatically if the engine's wording legitimately
    // changes.
    const expectedFlags = evaluateDevelopmentalFlags(FIRING_OBS)
    assert(
      'ORCH-2b  flag on + qualifying history → developmental_priorities present with the right domain + the EXACT note (derived from the real engine, not a length check)',
      decision?.developmental_priorities !== undefined &&
        decision.developmental_priorities.length === 1 &&
        decision.developmental_priorities[0].domain === 'dikaiosyne' &&
        decision.developmental_priorities[0].domain !== decision.developmental_priorities[0].note &&
        expectedFlags.length === 1 &&
        decision.developmental_priorities[0].note === expectedFlags[0].note,
      JSON.stringify(decision?.developmental_priorities) + ' vs expected ' + JSON.stringify(expectedFlags),
    )
  })

  // ORCH-3 — flag ON, no qualifying observations → absent (not an empty array).
  await withEnvAsync('true', async () => {
    const { deps } = makeDeps({ readObs: async () => ({ ok: true, value: [] }) })
    const decision = await driveToComplete('orch3', 'sagereasoning:agent-orch3@v1', deps)
    assert('ORCH-3  flag on + no observations → developmental_priorities absent (not [])', decision?.developmental_priorities === undefined)
  })

  // ORCH-3b — PR19 review fold (2026-07-28): flag ON, NON-EMPTY observations
  // that don't clear the streak (2 consecutive 'deliberate', one short of
  // DEVELOPMENTAL_CONSISTENCY_THRESHOLD=3) → absent. This is the single most
  // common real production shape (an agent with SOME history that just doesn't
  // happen to sit at a streak) and was the one case the orchestration-level
  // tests never exercised — ORCH-3's outer obsRes.value.length>0 check meant
  // [] never reached the inner `if (flags.length > 0)` guard at all. Verified
  // this addition (i) passes against the current code and (ii) fails if that
  // inner guard is removed (mutation-tested, see the session's build record).
  const SUB_THRESHOLD_OBS: SessionDomainObservation[] = [
    { sessionId: 'accr:st1', domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-01T00:00:00.000Z' },
    { sessionId: 'accr:st2', domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-02T00:00:00.000Z' },
  ]
  await withEnvAsync('true', async () => {
    const { deps, readObsCalls } = makeDeps({ readObs: async () => ({ ok: true, value: SUB_THRESHOLD_OBS }) })
    const decision = await driveToComplete('orch3b', 'sagereasoning:agent-orch3b@v1', deps)
    assert('ORCH-3b-a  the read is genuinely called with non-empty data', readObsCalls.length === 1)
    assert(
      'ORCH-3b  flag on + non-empty but sub-threshold history (2 of 3) → developmental_priorities absent, not []',
      decision?.developmental_priorities === undefined,
      JSON.stringify(decision?.developmental_priorities),
    )
  })

  // ORCH-4 — flag ON, the read fails (ok:false) → fail-honest: field omitted,
  // completion still SUCCEEDS.
  await withEnvAsync('true', async () => {
    const { deps } = makeDeps({ readObs: async () => ({ ok: false, error: 'simulated failure' }) })
    const decision = await driveToComplete('orch4', 'sagereasoning:agent-orch4@v1', deps)
    assert('ORCH-4  a read failure fails-honest: completion still succeeds, field omitted', decision !== null && decision.developmental_priorities === undefined)
  })

  // ORCH-5 — flag ON, the read THROWS → fail-honest, never propagates.
  await withEnvAsync('true', async () => {
    const { deps } = makeDeps({
      readObs: async () => {
        throw new Error('simulated throw')
      },
    })
    const decision = await driveToComplete('orch5', 'sagereasoning:agent-orch5@v1', deps)
    assert('ORCH-5  a read throw fails-honest: completion still succeeds, field omitted', decision !== null && decision.developmental_priorities === undefined)
  })

  // ORCH-6 — grade_changed=true + qualifying persisting passions → suggestion attaches.
  await withEnvAsync('true', async () => {
    const { deps } = makeDeps({
      feed: mkFeed({ grade_changed: true, passions_persisting: [pp('phobos', 'agonia')] }),
    })
    const decision = await driveToComplete('orch6', 'sagereasoning:agent-orch6@v1', deps)
    assert(
      'ORCH-6  grade_changed + qualifying passions → suggestion attached (agonia_persisting)',
      decision?.suggestion !== undefined && decision.suggestion.basis.code === 'agonia_persisting',
      JSON.stringify(decision?.suggestion),
    )
  })

  // ORCH-7 — grade_changed=false (even with qualifying passions) → suggestion absent.
  await withEnvAsync('true', async () => {
    const { deps } = makeDeps({
      feed: mkFeed({ grade_changed: false, passions_persisting: [pp('phobos', 'agonia')] }),
    })
    const decision = await driveToComplete('orch7', 'sagereasoning:agent-orch7@v1', deps)
    assert('ORCH-7  grade_changed:false → suggestion absent regardless of qualifying passions', decision?.suggestion === undefined)
  })

  // ORCH-8 — grade_changed=true but no qualifying passions → suggestion absent
  // (honest silence, not a crash).
  await withEnvAsync('true', async () => {
    const { deps } = makeDeps({
      feed: mkFeed({ grade_changed: true, passions_persisting: [] }),
    })
    const decision = await driveToComplete('orch8', 'sagereasoning:agent-orch8@v1', deps)
    assert('ORCH-8  grade_changed:true + no qualifying passions → suggestion absent', decision?.suggestion === undefined)
  })

  // ============================================================================
  // SECTION E — buildCompleteResponse wire-shape assertions
  //
  // HONEST MUTATION-TESTING NOTE (verified live, 2026-07-28): WIRE-1/WIRE-2
  // assert a true fact about the wire (the key is genuinely absent when the
  // decision doesn't carry the field) but this is guaranteed by
  // NextResponse.json()'s own JSON.stringify, which drops undefined-valued
  // keys regardless of the conditional-spread ternary in response-builders.ts
  // — confirmed by direct mutation (replacing the ternary's true-branch with
  // `{}` left WIRE-1/WIRE-2 GREEN; only WIRE-3/WIRE-4, the presence branch,
  // caught it). Kept anyway as a true wire-contract assertion (and
  // defense-in-depth against a future non-JSON.stringify serializer), but
  // WIRE-3/WIRE-4 are the load-bearing pins for this section — mutation-
  // verified below.
  // ============================================================================

  {
    const decisionNoFields = {
      kind: 'complete' as const,
      outcome: {
        exit_path: 'standard',
        rs_class: 'rs1',
        profile_update_confidence: 'normal',
        progress_dimensions_held: false,
        scrutiny_flags: [],
        developer_note: null,
        sage_calling_trigger: null,
        fabrication_risk_level: 'low',
      } as unknown as Extract<ReflectDecision, { kind: 'complete' }>['outcome'],
      feed: mkFeed(),
      mirror_note: 'test',
    }
    const body = await buildCompleteResponse('wire1', decisionNoFields).json()
    assert('WIRE-1  no developmental_priorities on decision → key ABSENT from wire (not null)', !('developmental_priorities' in body))
    assert('WIRE-2  no suggestion on decision → key ABSENT from wire (not null)', !('suggestion' in body))
  }
  {
    const decisionWithFields = {
      kind: 'complete' as const,
      outcome: {
        exit_path: 'standard',
        rs_class: 'rs1',
        profile_update_confidence: 'normal',
        progress_dimensions_held: false,
        scrutiny_flags: [],
        developer_note: null,
        sage_calling_trigger: null,
        fabrication_risk_level: 'low',
      } as unknown as Extract<ReflectDecision, { kind: 'complete' }>['outcome'],
      feed: mkFeed({ grade_changed: true }),
      mirror_note: 'test',
      developmental_priorities: [{ domain: 'dikaiosyne', note: 'consistent deliberate reasoning' }],
      suggestion: composePracticeSuggestion({ persistingPassions: [pp('phobos', 'agonia')] })!,
    }
    const body = await buildCompleteResponse('wire2', decisionWithFields).json()
    assert(
      'WIRE-3  developmental_priorities present on decision → served verbatim',
      JSON.stringify(body.developmental_priorities) === JSON.stringify(decisionWithFields.developmental_priorities),
    )
    assert(
      'WIRE-4  suggestion present on decision → served verbatim (schema/practice/basis/line/framing_note)',
      body.suggestion?.schema === 'agent-practice-suggestion/v1' &&
        body.suggestion?.practice === 'premeditatio_examination' &&
        body.suggestion?.basis?.code === 'agonia_persisting' &&
        body.suggestion?.line === SUGGESTION_LINES.agonia_persisting,
      JSON.stringify(body.suggestion),
    )
  }

  console.log('')
  console.log(`a2-developmental-reminders battery: ${passCount} passed, ${failCount} failed`)
  if (failCount > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f}`)
    process.exitCode = 1
  }
}

async function withEnvAsync(value: string | undefined, fn: () => Promise<void>): Promise<void> {
  const prior = process.env[REFLECT_DEVELOPMENTAL_ENV_VAR]
  if (value === undefined) delete process.env[REFLECT_DEVELOPMENTAL_ENV_VAR]
  else process.env[REFLECT_DEVELOPMENTAL_ENV_VAR] = value
  try {
    await fn()
  } finally {
    if (prior === undefined) delete process.env[REFLECT_DEVELOPMENTAL_ENV_VAR]
    else process.env[REFLECT_DEVELOPMENTAL_ENV_VAR] = prior
  }
}

main()
