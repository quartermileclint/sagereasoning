/**
 * s7-l4-passion-audit.test.ts — Trust Layer S7 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>  (pure core + an in-memory fake for
 * the flag-gated store seams; getAdminClient() is never reached — run bare, no
 * --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare) — the S7 review dimensions:
 *   A7 out-of-band + NEVER self-report — the audit runs on the orchestrator's TRACE
 *     (an injected extractor), never on self-report; the self-report corroboration is
 *     admitted ONLY at the higher tier, is IGNORED at the lower tier, and can NEVER
 *     clear a trace flag or change the disposition (structurally non-channel).
 *   Deterministic "same-engine" reading — a seeded pre-formed preference (epithumia) /
 *     stake (hedone) / early resolution (horme·praxis / grave-unexamined urgency) is
 *     CAUGHT; a clean trace is no-flag; the Layer1Schema adapter reads the primitives.
 *   Disposition (mentor A7) — no signal → no-flag → may-finalize; a flag at the LOWER
 *     tier → holds-selection → HOLD; a flag at the HIGHER tier → logs-and-surfaces →
 *     may-finalize. The finalization gate maps the disposition to the collaboration
 *     status (finalized / escalated), null result → HOLD (never finalize).
 *   Trust-tier derivation (A7) — higher requires a strong honest reflect PATTERN
 *     (count + recency) AND un-degraded oversight; ANY absence → the conservative
 *     lower tier (degraded / capped / stale / absent oversight all demote to lower).
 *   R18f-parallel / fail-honest — an empty trace ref or a throwing extractor →
 *     audit-unavailable → HOLD; the audit NEVER fabricates a clean pass.
 *   Write-once (A7 readable-not-modifiable) — the commit pre-checks canSetL4AuditResult;
 *     an idempotent identical re-write is allowed; a DIFFERENT write is refused; the
 *     store never fabricates a record S6 did not open.
 *   Flag-gated MEASURE — flag-OFF is a pure no-op on both the tier read and the commit
 *     (byte-equivalent, no DB touch); every outcome carries mode 'measure'; nothing binds.
 */

import {
  mapTraceFeaturesToL4Signals,
  l4TraceFeaturesFromLayer1,
  deriveL4TrustTier,
  readOrchestratorL4TrustTier,
  assembleL4Audit,
  resolveFinalizationDisposition,
  finalizationStatusFor,
  runL4PassionAudit,
  commitL4Audit,
  runL4AuditAndCommit,
  type L4TraceFeatures,
  type L4TraceExtractor,
  type OrchestratorReasoningTrace,
  type L4MappingContext,
} from '../l4-passion-audit'
import type { L4Signals, L4AuditResult } from '../collaboration-record'
import type { EffectiveDomainTrust } from '../types'
import type { Layer1Schema } from '@/lib/translation-sandwich/layer1-extractor'
import { TRUST_CORE_ENV_VAR } from '../trust-core-flag'
import { makeFakeSupabase } from './fake-supabase'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}
function eq<T>(a: T, b: T, label: string): void {
  assert(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-07-09T00:00:00.000Z')
const NOW_ISO = NOW.toISOString()
const RECENT_ISO = new Date('2026-07-08T00:00:00.000Z').toISOString() // 1 day ago
const STALE_ISO = new Date('2025-11-01T00:00:00.000Z').toISOString() // > 180d ago

const CLEAN_FEATURES: L4TraceFeatures = {
  passions: [],
  urgency: [],
  causalStages: ['phantasia', 'synkatathesis'],
  motivationStated: false,
}
const DESIRE_FEATURES: L4TraceFeatures = {
  passions: [{ rootPassion: 'epithumia', subSpecies: 'pothos' }],
  urgency: [],
  causalStages: ['phantasia'],
  motivationStated: false,
}
const HEDONE_FEATURES: L4TraceFeatures = {
  passions: [{ rootPassion: 'hedone', subSpecies: 'terpsis' }],
  urgency: [],
  causalStages: ['phantasia'],
  motivationStated: false,
}

function trace(text = 'orchestrator selection reasoning'): OrchestratorReasoningTrace {
  return { schema: 'trust-orchestrator-reasoning-trace-v1', reasoningTrace: text, chosenCandidateRef: 'cand-x' }
}

/** A fake extractor that returns fixed signals + a ref. */
function fakeExtractor(signals: L4Signals, traceRef = 'signed-trace:abc'): L4TraceExtractor {
  return { extractL4Signals: async () => ({ signals, traceRef }) }
}
const FLAG: L4Signals = { priorPreferenceFormed: true, stakeInOutcome: false, resolutionBeforeComplete: false }
const CLEAN: L4Signals = { priorPreferenceFormed: false, stakeInOutcome: false, resolutionBeforeComplete: false }

function oversight(over: Partial<EffectiveDomainTrust>): EffectiveDomainTrust {
  return {
    virtueDomain: 'oversight',
    effectiveLevel: 'deliberate',
    earnedLevel: 'deliberate',
    profilePrior: 'habitual',
    decayStepsApplied: 0,
    justiceCapped: false,
    reflectModulated: false,
    coverageStatus: 'continuous',
    hasEvidence: true,
    ...over,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — the deterministic "same-engine" trace reading (Q4.1/Q4.2/Q4.3)
// ════════════════════════════════════════════════════════════════════════════

{
  const clean = mapTraceFeaturesToL4Signals(CLEAN_FEATURES)
  eq(clean.priorPreferenceFormed, false, '1.1 clean trace → no prior preference')
  eq(clean.stakeInOutcome, false, '1.2 clean trace → no stake')
  eq(clean.resolutionBeforeComplete, false, '1.3 clean trace → no early resolution')

  // Q4.1 — a desire passion IS a preference formed.
  eq(mapTraceFeaturesToL4Signals(DESIRE_FEATURES).priorPreferenceFormed, true, '1.4 epithumia → prior preference formed')
  // Q4.1 — a recorded selection pattern matching the chosen candidate, no passion.
  const patternCtx: L4MappingContext = { selectionPatternMatchedChosen: true, priorInteractionWithChosen: false }
  eq(mapTraceFeaturesToL4Signals(CLEAN_FEATURES, patternCtx).priorPreferenceFormed, true, '1.5 selection-pattern match → prior preference (no passion needed)')

  // Q4.2 — a hedone passion IS a stake in the outcome.
  eq(mapTraceFeaturesToL4Signals(HEDONE_FEATURES).stakeInOutcome, true, '1.6 hedone → stake in outcome')
  // Q4.2 — epithumia dressed as efficiency (desire + a stated motivation).
  eq(
    mapTraceFeaturesToL4Signals({ ...DESIRE_FEATURES, motivationStated: true }).stakeInOutcome,
    true,
    '1.7 epithumia + motivation_stated → stake (dressed as efficiency)',
  )
  // Q4.2 — desire alone (no motivation, no prior interaction) is NOT a stake.
  eq(mapTraceFeaturesToL4Signals(DESIRE_FEATURES).stakeInOutcome, false, '1.8 epithumia alone → no stake')
  // Q4.2 — desire + a prior interaction with the chosen candidate → stake.
  eq(
    mapTraceFeaturesToL4Signals(DESIRE_FEATURES, { selectionPatternMatchedChosen: false, priorInteractionWithChosen: true }).stakeInOutcome,
    true,
    '1.9 epithumia + prior-interaction → stake',
  )

  // Q4.3 — a commitment/action stage IS an early resolution.
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, causalStages: ['phantasia', 'horme'] }).resolutionBeforeComplete,
    true,
    '1.10 horme stage → resolution before complete',
  )
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, causalStages: ['praxis'] }).resolutionBeforeComplete,
    true,
    '1.11 praxis stage → resolution before complete',
  )
  // Q4.3 — a grave urgency signal carried out WITHOUT examination.
  eq(
    mapTraceFeaturesToL4Signals({
      ...CLEAN_FEATURES,
      urgency: [{ signalType: 'irreversibility_language', stage: 'praxis', examinedBeforeActing: false }],
    }).resolutionBeforeComplete,
    true,
    '1.12 grave urgency + examined=false → resolution before complete',
  )
  // Q4.3 — a grave urgency signal that WAS examined does NOT fire (examined-before-acting).
  eq(
    mapTraceFeaturesToL4Signals({
      ...CLEAN_FEATURES,
      urgency: [{ signalType: 'irreversibility_language', stage: 'praxis', examinedBeforeActing: true }],
    }).resolutionBeforeComplete,
    false,
    '1.13 grave urgency + examined=true → no early resolution',
  )
  // A non-grave urgency (time pressure) does not fire Q4.3 on its own.
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, urgency: [{ signalType: 'time_pressure' }] }).resolutionBeforeComplete,
    false,
    '1.14 time-pressure urgency alone → no early resolution',
  )

  // Q4.2 is VALENCE-NEUTRAL — an AVERSIVE stake (phobos fear / lupe envy toward a
  // candidate) is a stake in the outcome just as an appetitive one is (the review fold).
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, passions: [{ rootPassion: 'phobos', subSpecies: 'deima' }] }).stakeInOutcome,
    true,
    '1.15 phobos (fear) → stake in outcome (aversive)',
  )
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, passions: [{ rootPassion: 'lupe', subSpecies: 'phthonos' }] }).stakeInOutcome,
    true,
    '1.16 lupe (envy) → stake in outcome (aversive)',
  )
  // phobos/lupe are NOT a "preference formed" (Q4.1 is appetitive), but they DO flag
  // (via the Q4.2 stake) — nothing passion-driven slips through as clean.
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, passions: [{ rootPassion: 'phobos', subSpecies: 'deima' }] }).priorPreferenceFormed,
    false,
    '1.17 phobos → not a preference formed (but caught via the stake)',
  )
  // Q4.3 — a grave urgency signal with examined_before_acting ABSENT reads un-examined
  // (matches the andreia conservative default; the review nit fold).
  eq(
    mapTraceFeaturesToL4Signals({ ...CLEAN_FEATURES, urgency: [{ signalType: 'irreversibility_language', stage: 'praxis' }] }).resolutionBeforeComplete,
    true,
    '1.18 grave urgency + examined ABSENT → resolution before complete (un-examined default)',
  )
}

// SECTION 1b — the Layer1Schema adapter (the "same deterministic engine" reuse point)
{
  function baseLayer1(over: Partial<Layer1Schema>): Layer1Schema {
    return {
      version: 'layer1-schema-v1',
      passions_present: [],
      control_filter_elements: [],
      oikeiosis_circles_engaged: [],
      value_categories_at_stake: [],
      kathekon_factors: [],
      urgency_indicators: [],
      causal_stage_evidence: [],
      eupatheia_candidates: [],
      stated_concern_targets: [],
      stated_equanimity_signals: [],
      motivation_stated: false,
      motivation_evidence: [],
      element_fusion_detected: { fused: false, fused_concerns: null },
      ambiguity_notes: [],
      ...over,
    }
  }
  const cleanSchema = baseLayer1({})
  const cleanFeat = l4TraceFeaturesFromLayer1(cleanSchema)
  eq(cleanFeat.passions.length, 0, '1b.1 adapter: clean schema → no passions')
  eq(mapTraceFeaturesToL4Signals(cleanFeat).priorPreferenceFormed, false, '1b.2 adapter: clean schema → clean signals')

  const dirtySchema = baseLayer1({
    passions_present: [{ root_passion: 'epithumia', sub_species: 'eros', evidence: 'I wanted X' }],
    urgency_indicators: [{ signal_type: 'finality_language', evidence: 'final', stage: 'praxis', examined_before_acting: false }],
    causal_stage_evidence: [{ stage: 'horme', evidence: 'decided' }],
    motivation_stated: true,
  })
  const feat = l4TraceFeaturesFromLayer1(dirtySchema)
  eq(feat.passions[0].rootPassion, 'epithumia', '1b.3 adapter maps root_passion')
  eq(feat.urgency[0].examinedBeforeActing, false, '1b.4 adapter maps examined_before_acting')
  eq(feat.causalStages[0], 'horme', '1b.5 adapter maps causal stages')
  eq(feat.motivationStated, true, '1b.6 adapter maps motivation_stated')
  const sig = mapTraceFeaturesToL4Signals(feat)
  eq(sig.priorPreferenceFormed, true, '1b.7 dirty schema → prior preference')
  eq(sig.stakeInOutcome, true, '1b.8 dirty schema → stake')
  eq(sig.resolutionBeforeComplete, true, '1b.9 dirty schema → early resolution')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — the disposition + finalization gate (mentor A7; reuses resolveL4AuditResult)
// ════════════════════════════════════════════════════════════════════════════

{
  const clean = assembleL4Audit({ signals: CLEAN, trustTier: 'lower', traceRef: 'r1' })
  eq(clean.status, 'audited', '2.1 clean → audited')
  eq(clean.result!.disposition, 'no-flag', '2.2 clean → no-flag')
  eq(clean.finalization, 'may-finalize', '2.3 no-flag → may-finalize')

  const lowerFlag = assembleL4Audit({ signals: FLAG, trustTier: 'lower', traceRef: 'r1' })
  eq(lowerFlag.result!.disposition, 'holds-selection', '2.4 flag + lower → holds-selection')
  eq(lowerFlag.finalization, 'hold', '2.5 holds-selection → HOLD')

  const higherFlag = assembleL4Audit({ signals: FLAG, trustTier: 'higher', traceRef: 'r1' })
  eq(higherFlag.result!.disposition, 'logs-and-surfaces', '2.6 flag + higher → logs-and-surfaces')
  eq(higherFlag.finalization, 'may-finalize', '2.7 logs-and-surfaces → may-finalize (does not auto-hold)')

  // resolveFinalizationDisposition — the pure gate.
  eq(resolveFinalizationDisposition(null), 'hold', '2.8 null result → HOLD (never finalize)')
  eq(resolveFinalizationDisposition(clean.result), 'may-finalize', '2.9 no-flag → may-finalize')
  eq(resolveFinalizationDisposition(lowerFlag.result), 'hold', '2.10 holds-selection → HOLD')
  eq(resolveFinalizationDisposition(higherFlag.result), 'may-finalize', '2.11 logs-and-surfaces → may-finalize')

  // finalizationStatusFor — the status the gate writes.
  eq(finalizationStatusFor('may-finalize'), 'finalized', '2.12 may-finalize → status finalized')
  eq(finalizationStatusFor('hold'), 'escalated', '2.13 hold → status escalated (A7 pending review)')

  // MEASURE invariant.
  eq(clean.mode, 'measure', '2.14 outcome carries mode measure')
  eq(higherFlag.mode, 'measure', '2.15 higher-flag outcome carries mode measure')
}

// SECTION 2b — R18f-parallel: an empty trace ref is never a fabricated clean pass
{
  const empty = assembleL4Audit({ signals: CLEAN, trustTier: 'lower', traceRef: '' })
  eq(empty.status, 'audit-unavailable', '2b.1 empty traceRef → audit-unavailable')
  eq(empty.result, null, '2b.2 empty traceRef → no L4 result (never fabricate)')
  eq(empty.finalization, 'hold', '2b.3 empty traceRef → HOLD')
  const blank = assembleL4Audit({ signals: CLEAN, trustTier: 'higher', traceRef: '   ' })
  eq(blank.status, 'audit-unavailable', '2b.4 blank traceRef → audit-unavailable (even at higher tier)')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — NEVER self-report the channel (A7 structural discipline)
// ════════════════════════════════════════════════════════════════════════════

{
  // Self-report corroboration is IGNORED at the lower tier (never consulted).
  const lower = assembleL4Audit({
    signals: FLAG,
    trustTier: 'lower',
    traceRef: 'r1',
    selfReportCorroboration: { acknowledgedPreference: true },
  })
  eq(lower.selfReportCorroborates, null, '3.1 lower tier → self-report NOT consulted (null)')
  eq(lower.result!.disposition, 'holds-selection', '3.2 lower tier + self-report → disposition unchanged (holds)')

  // At the higher tier, self-report can CORROBORATE a trace flag — but NEVER change it.
  const corrob = assembleL4Audit({
    signals: FLAG,
    trustTier: 'higher',
    traceRef: 'r1',
    selfReportCorroboration: { acknowledgedPreference: true },
  })
  eq(corrob.selfReportCorroborates, true, '3.3 higher tier + acknowledged → corroborates true')
  eq(corrob.result!.disposition, 'logs-and-surfaces', '3.4 corroboration does not change the disposition')
  eq(corrob.result!.anyFlag, true, '3.5 corroboration does not change the flag')

  // Self-report DENYING a preference can NEVER clear a trace flag (never the channel).
  const deny = assembleL4Audit({
    signals: FLAG,
    trustTier: 'higher',
    traceRef: 'r1',
    selfReportCorroboration: { acknowledgedPreference: false },
  })
  eq(deny.selfReportCorroborates, false, '3.6 higher tier + denied → corroborates false')
  eq(deny.result!.disposition, 'logs-and-surfaces', '3.7 a denying self-report CANNOT clear the trace flag')
  eq(deny.result!.anyFlag, true, '3.8 the trace flag stands regardless of self-report')

  // A clean trace at the higher tier with a self-report is still no-flag (self-report
  // cannot MANUFACTURE a flag either — it is not the channel).
  const cleanHigher = assembleL4Audit({
    signals: CLEAN,
    trustTier: 'higher',
    traceRef: 'r1',
    selfReportCorroboration: { acknowledgedPreference: true },
  })
  eq(cleanHigher.result!.disposition, 'no-flag', '3.9 clean trace + self-report → still no-flag')
  eq(cleanHigher.selfReportCorroborates, false, '3.10 no trace flag → nothing to corroborate (false)')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — the trust-tier derivation (mentor A7; conservative toward lower)
// ════════════════════════════════════════════════════════════════════════════

{
  const strongReflect = { count: 3, latestAt: RECENT_ISO }
  const soundOversight = oversight({ effectiveLevel: 'principled', hasEvidence: true, justiceCapped: false })

  eq(
    deriveL4TrustTier({ oversight: soundOversight, honestReflect: strongReflect, nowIso: NOW_ISO }).tier,
    'higher',
    '4.1 strong reflect + sound oversight → HIGHER',
  )
  // The AND-guard: no oversight row → lower even with a strong reflect record.
  eq(
    deriveL4TrustTier({ oversight: null, honestReflect: strongReflect, nowIso: NOW_ISO }).tier,
    'lower',
    '4.2 strong reflect + NO oversight → lower (conservative AND-guard)',
  )
  // Oversight below the deliberate floor → lower.
  eq(
    deriveL4TrustTier({ oversight: oversight({ effectiveLevel: 'habitual' }), honestReflect: strongReflect, nowIso: NOW_ISO }).tier,
    'lower',
    '4.3 oversight below deliberate → lower',
  )
  // Oversight justice-capped → lower (A8/A9 degraded orchestrator).
  eq(
    deriveL4TrustTier({ oversight: oversight({ effectiveLevel: 'principled', justiceCapped: true }), honestReflect: strongReflect, nowIso: NOW_ISO }).tier,
    'lower',
    '4.4 oversight justice-capped → lower',
  )
  // Oversight without evidence → lower.
  eq(
    deriveL4TrustTier({ oversight: oversight({ hasEvidence: false }), honestReflect: strongReflect, nowIso: NOW_ISO }).tier,
    'lower',
    '4.5 oversight without evidence → lower',
  )
  // Reflect count below the pattern floor → lower.
  eq(
    deriveL4TrustTier({ oversight: soundOversight, honestReflect: { count: 2, latestAt: RECENT_ISO }, nowIso: NOW_ISO }).tier,
    'lower',
    '4.6 reflect count < pattern floor → lower',
  )
  // Reflect record stale (beyond the active window) → lower.
  eq(
    deriveL4TrustTier({ oversight: soundOversight, honestReflect: { count: 5, latestAt: STALE_ISO }, nowIso: NOW_ISO }).tier,
    'lower',
    '4.7 stale reflect record → lower',
  )
  // No reflect timestamp at all → lower.
  eq(
    deriveL4TrustTier({ oversight: soundOversight, honestReflect: { count: 3, latestAt: null }, nowIso: NOW_ISO }).tier,
    'lower',
    '4.8 count without a timestamp → lower (not recent)',
  )
  // The assessment surfaces the two components.
  const hi = deriveL4TrustTier({ oversight: soundOversight, honestReflect: strongReflect, nowIso: NOW_ISO })
  assert(hi.reflectStrong && hi.oversightSound, '4.9 higher tier surfaces reflectStrong + oversightSound')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — runL4PassionAudit (the extractor is REQUIRED; fail-honest)
// ════════════════════════════════════════════════════════════════════════════

async function section5(): Promise<void> {
  // Clean-trace extractor at the lower tier → no-flag → may-finalize.
  const c = await runL4PassionAudit({ trace: trace(), trustTier: 'lower' }, fakeExtractor(CLEAN))
  eq(c.status, 'audited', '5.1 clean extractor → audited')
  eq(c.result!.disposition, 'no-flag', '5.2 clean extractor → no-flag')
  eq(c.finalization, 'may-finalize', '5.3 clean extractor → may-finalize')

  // Flagging extractor at the lower tier → holds-selection → HOLD.
  const lf = await runL4PassionAudit({ trace: trace(), trustTier: 'lower' }, fakeExtractor(FLAG))
  eq(lf.result!.disposition, 'holds-selection', '5.4 flag extractor + lower → holds-selection')
  eq(lf.finalization, 'hold', '5.5 flag extractor + lower → HOLD')

  // Flagging extractor at the higher tier → logs-and-surfaces → may-finalize.
  const hf = await runL4PassionAudit({ trace: trace(), trustTier: 'higher' }, fakeExtractor(FLAG))
  eq(hf.result!.disposition, 'logs-and-surfaces', '5.6 flag extractor + higher → logs-and-surfaces')
  eq(hf.finalization, 'may-finalize', '5.7 flag extractor + higher → may-finalize')

  // A throwing extractor → audit-unavailable → HOLD (fail-honest, never fabricate).
  const thrower: L4TraceExtractor = { extractL4Signals: async () => { throw new Error('extractor down') } }
  const t = await runL4PassionAudit({ trace: trace(), trustTier: 'higher' }, thrower)
  eq(t.status, 'audit-unavailable', '5.8 extractor throw → audit-unavailable')
  eq(t.result, null, '5.9 extractor throw → no result (never fabricate)')
  eq(t.finalization, 'hold', '5.10 extractor throw → HOLD')

  // An empty trace ref from the extractor → audit-unavailable → HOLD.
  const e = await runL4PassionAudit({ trace: trace(), trustTier: 'lower' }, fakeExtractor(CLEAN, ''))
  eq(e.status, 'audit-unavailable', '5.11 empty extractor traceRef → audit-unavailable')
  eq(e.finalization, 'hold', '5.12 empty extractor traceRef → HOLD')
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — the live trust-tier seam (flag-gated; fail-honest)
// ════════════════════════════════════════════════════════════════════════════

/** Seed an oversight state row + N recent honest reflect events into the fake. */
function seedHigherTierOrchestrator(fake: ReturnType<typeof makeFakeSupabase>, agentId: string, n = 3): void {
  fake.tables.agent_trust_state.push({
    agent_id: agentId,
    virtue_domain: 'oversight',
    owner_user_id: null,
    credential_ref: null,
    earned_level: 'principled',
    profile_prior: 'habitual',
    volatility_rating: 'low',
    last_domain_activity_at: RECENT_ISO,
    reflect_last_honest_at: RECENT_ISO,
    justice_floor_active: false,
    coverage_status: 'continuous',
    updated_at: RECENT_ISO,
    retain_until: new Date('2026-10-07T00:00:00Z').toISOString(),
  })
  for (let i = 0; i < n; i++) {
    fake.tables.agent_trust_events.push({
      id: `ev-${agentId}-${i}`,
      agent_id: agentId,
      virtue_domain: null,
      event_type: 'reflect-completed-honest',
      artifact_kind: 'reflect_completion',
      artifact_ref: `reflect:s-${i}`,
      occurred_at: RECENT_ISO,
      correlation_id: `c-${agentId}-${i}`,
    })
  }
}

async function section6(): Promise<void> {
  const prior = process.env[TRUST_CORE_ENV_VAR]

  // Flag-OFF — a pure no-op: conservative lower, sourced false, no DB touch.
  delete process.env[TRUST_CORE_ENV_VAR]
  const offFake = makeFakeSupabase()
  seedHigherTierOrchestrator(offFake, 'orch-strong') // would be higher IF read
  const off = await readOrchestratorL4TrustTier('orch-strong', { now: NOW, client: offFake.client })
  eq(off.tier, 'lower', '6.1 flag-off → conservative lower')
  eq(off.sourced, false, '6.2 flag-off → sourced false (no DB read)')

  // Flag-ON — a strong orchestrator reads HIGHER.
  process.env[TRUST_CORE_ENV_VAR] = 'true'
  const onFake = makeFakeSupabase()
  seedHigherTierOrchestrator(onFake, 'orch-strong')
  const on = await readOrchestratorL4TrustTier('orch-strong', { now: NOW, client: onFake.client })
  eq(on.tier, 'higher', '6.3 flag-on + strong orchestrator → HIGHER')
  eq(on.sourced, true, '6.4 flag-on → sourced true')

  // Flag-ON — an unknown orchestrator (no rows) reads lower (no oversight, count 0).
  const empty = await readOrchestratorL4TrustTier('orch-unknown', { now: NOW, client: onFake.client })
  eq(empty.tier, 'lower', '6.5 flag-on + unknown orchestrator → lower')
  eq(empty.sourced, true, '6.6 flag-on + unknown → sourced true (read succeeded, empty)')

  // Flag-ON — a strong reflect record but only 1 honest reflect → lower (below floor).
  const oneReflect = makeFakeSupabase()
  seedHigherTierOrchestrator(oneReflect, 'orch-thin', 1)
  const thin = await readOrchestratorL4TrustTier('orch-thin', { now: NOW, client: oneReflect.client })
  eq(thin.tier, 'lower', '6.7 flag-on + only 1 honest reflect → lower (below pattern floor)')

  // Flag-ON — missing tables → fail-honest benign → lower, sourced true.
  const missing = makeFakeSupabase({ missingTables: true })
  const miss = await readOrchestratorL4TrustTier('orch-strong', { now: NOW, client: missing.client })
  eq(miss.tier, 'lower', '6.8 flag-on + missing tables → lower (fail-honest benign)')

  if (prior === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prior
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — the commit seam (flag-gated MEASURE; write-once; finalization gate)
// ════════════════════════════════════════════════════════════════════════════

/** Seed an OPEN collaboration record (as S6 opens it) into the fake. */
function seedOpenCollaboration(
  fake: ReturnType<typeof makeFakeSupabase>,
  orchestratorAgentId: string,
  taskRef: string,
  l4?: unknown,
): void {
  fake.tables.collaboration_records.push({
    id: `cr-${orchestratorAgentId}-${taskRef}`,
    orchestrator_agent_id: orchestratorAgentId,
    candidate_agent_id: 'cand-x',
    task_ref: taskRef,
    owner_user_id: null,
    credential_ref: null,
    authority_boundary: { schema: 'trust-authority-boundary-v1', actionScope: 'data-retrieval', circleScope: ['household'] },
    l4_audit_result: l4 ?? null,
    habitual_stable_flag: null,
    independence_deficits: [],
    justice_failure_case: null,
    status: 'open',
    retain_until: new Date('2026-10-07T00:00:00Z').toISOString(),
  })
}

async function section7(): Promise<void> {
  const prior = process.env[TRUST_CORE_ENV_VAR]

  const cleanOutcome = assembleL4Audit({ signals: CLEAN, trustTier: 'lower', traceRef: 'r-clean' })
  const holdOutcome = assembleL4Audit({ signals: FLAG, trustTier: 'lower', traceRef: 'r-hold' })

  // Flag-OFF — a pure no-op (byte-equivalent; no store touch).
  delete process.env[TRUST_CORE_ENV_VAR]
  const offFake = makeFakeSupabase()
  seedOpenCollaboration(offFake, 'orch-1', 'task-1')
  const off = await commitL4Audit({ orchestratorAgentId: 'orch-1', taskRef: 'task-1', outcome: cleanOutcome, client: offFake.client })
  eq(off.committed, false, '7.1 flag-off commit → no-op (committed false)')
  eq(off.written, false, '7.2 flag-off commit → nothing written')
  eq(offFake.tables.collaboration_records[0].l4_audit_result, null, '7.3 flag-off → collaboration untouched (l4 null)')
  eq(offFake.tables.collaboration_records[0].status, 'open', '7.4 flag-off → status untouched (open)')

  // Flag-ON.
  process.env[TRUST_CORE_ENV_VAR] = 'true'

  // A clean audit → l4 written + status finalized.
  const f1 = makeFakeSupabase()
  seedOpenCollaboration(f1, 'orch-1', 'task-1')
  const c1 = await commitL4Audit({ orchestratorAgentId: 'orch-1', taskRef: 'task-1', outcome: cleanOutcome, client: f1.client })
  eq(c1.committed, true, '7.5 flag-on clean audit → committed')
  eq(c1.written, true, '7.6 flag-on clean audit → l4 written')
  eq(c1.statusSet, 'finalized', '7.7 no-flag → status finalized')
  assert(f1.tables.collaboration_records[0].l4_audit_result !== null, '7.8 l4_audit_result persisted')
  eq(f1.tables.collaboration_records[0].status, 'finalized', '7.9 collaboration status finalized in the store')

  // A lower-tier flag → l4 written + status escalated (held).
  const f2 = makeFakeSupabase()
  seedOpenCollaboration(f2, 'orch-2', 'task-2')
  const c2 = await commitL4Audit({ orchestratorAgentId: 'orch-2', taskRef: 'task-2', outcome: holdOutcome, client: f2.client })
  eq(c2.written, true, '7.10 lower-tier flag → l4 written')
  eq(c2.statusSet, 'escalated', '7.11 holds-selection → status escalated (held)')

  // An audit-unavailable outcome → NO l4 written (never fabricate); status escalated.
  const f3 = makeFakeSupabase()
  seedOpenCollaboration(f3, 'orch-3', 'task-3')
  const unavail = assembleL4Audit({ signals: CLEAN, trustTier: 'lower', traceRef: '' })
  const c3 = await commitL4Audit({ orchestratorAgentId: 'orch-3', taskRef: 'task-3', outcome: unavail, client: f3.client })
  eq(c3.written, false, '7.12 audit-unavailable → NO l4 written (never fabricate)')
  eq(f3.tables.collaboration_records[0].l4_audit_result, null, '7.13 audit-unavailable → l4 stays null in the store')
  eq(c3.statusSet, 'escalated', '7.14 audit-unavailable → status escalated (held)')

  // Write-once: a DIFFERENT existing l4 result is NOT overwritten (A7).
  const f4 = makeFakeSupabase()
  const differentPrior: L4AuditResult = {
    schema: 'trust-l4-audit-result-v1',
    signals: FLAG,
    anyFlag: true,
    trustTier: 'lower',
    disposition: 'holds-selection',
    traceRef: 'earlier-trace',
    basis: 'an earlier, different audit',
  }
  seedOpenCollaboration(f4, 'orch-4', 'task-4', differentPrior)
  const c4 = await commitL4Audit({ orchestratorAgentId: 'orch-4', taskRef: 'task-4', outcome: cleanOutcome, client: f4.client })
  eq(c4.committed, false, '7.15 write-once: a different existing result → refused (committed false)')
  eq(c4.written, false, '7.16 write-once: not overwritten')
  eq((f4.tables.collaboration_records[0].l4_audit_result as L4AuditResult).traceRef, 'earlier-trace', '7.17 the earlier L4 result is preserved')

  // Idempotent identical re-write is ALLOWED (byte-identical result).
  const f5 = makeFakeSupabase()
  seedOpenCollaboration(f5, 'orch-5', 'task-5', cleanOutcome.result)
  const c5 = await commitL4Audit({ orchestratorAgentId: 'orch-5', taskRef: 'task-5', outcome: cleanOutcome, client: f5.client })
  eq(c5.committed, true, '7.18 idempotent identical re-write → allowed')

  // Idempotent re-write survives a jsonb KEY-REORDER (Postgres does not preserve object
  // key order; the write-once guard is order-independent — the review MEDIUM fold). Seed
  // a key-reordered copy of the SAME result (top-level + nested signals reordered) and
  // assert the re-write is still allowed (the order-sensitive guard would have refused it).
  const r0 = cleanOutcome.result!
  const reordered = {
    basis: r0.basis,
    disposition: r0.disposition,
    trustTier: r0.trustTier,
    traceRef: r0.traceRef,
    anyFlag: r0.anyFlag,
    signals: {
      resolutionBeforeComplete: r0.signals.resolutionBeforeComplete,
      stakeInOutcome: r0.signals.stakeInOutcome,
      priorPreferenceFormed: r0.signals.priorPreferenceFormed,
    },
    schema: r0.schema,
  }
  const f5b = makeFakeSupabase()
  seedOpenCollaboration(f5b, 'orch-5b', 'task-5b', reordered)
  const c5b = await commitL4Audit({ orchestratorAgentId: 'orch-5b', taskRef: 'task-5b', outcome: cleanOutcome, client: f5b.client })
  eq(c5b.committed, true, '7.18b idempotent re-write survives a jsonb key-reorder (order-independent guard)')

  // No collaboration record (S6 did not open it) → fail-honest, never fabricate.
  const f6 = makeFakeSupabase()
  const c6 = await commitL4Audit({ orchestratorAgentId: 'orch-6', taskRef: 'task-6', outcome: cleanOutcome, client: f6.client })
  eq(c6.committed, false, '7.19 no collaboration record → not committed')
  eq(f6.tables.collaboration_records.length, 0, '7.20 no collaboration record → none fabricated')

  // Audit-unavailable + NO collaboration record → not committed (never report a hold on
  // a record S6 did not open).
  const f7 = makeFakeSupabase()
  const c7 = await commitL4Audit({ orchestratorAgentId: 'orch-7', taskRef: 'task-7', outcome: unavail, client: f7.client })
  eq(c7.committed, false, '7.22 audit-unavailable + no record → not committed (never hold a nonexistent record)')
  eq(f7.tables.collaboration_records.length, 0, '7.23 audit-unavailable + no record → none fabricated')

  // MEASURE invariant on the commit result.
  eq(c1.mode, 'measure', '7.24 commit result carries mode measure')

  if (prior === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prior
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — the composed live entrypoint runL4AuditAndCommit (S8 turnkey)
// ════════════════════════════════════════════════════════════════════════════

async function section8(): Promise<void> {
  const prior = process.env[TRUST_CORE_ENV_VAR]

  // Flag-ON end-to-end: a strong orchestrator (higher tier) + a flagging trace →
  // logs-and-surfaces → may-finalize → l4 written + status finalized.
  process.env[TRUST_CORE_ENV_VAR] = 'true'
  const fake = makeFakeSupabase()
  seedHigherTierOrchestrator(fake, 'orch-e2e')
  seedOpenCollaboration(fake, 'orch-e2e', 'task-e2e')
  const e2e = await runL4AuditAndCommit(
    { orchestratorAgentId: 'orch-e2e', taskRef: 'task-e2e', trace: trace(), now: NOW, client: fake.client },
    fakeExtractor(FLAG),
  )
  eq(e2e.trustTier, 'higher', '8.1 e2e: strong orchestrator → higher tier')
  eq(e2e.outcome.result!.disposition, 'logs-and-surfaces', '8.2 e2e: higher + flag → logs-and-surfaces')
  eq(e2e.commit.written, true, '8.3 e2e: l4 written')
  eq(e2e.commit.statusSet, 'finalized', '8.4 e2e: higher-tier surfaced flag → finalized')

  // A lower-tier orchestrator (no rows) + a flagging trace → holds-selection → held.
  const fake2 = makeFakeSupabase()
  seedOpenCollaboration(fake2, 'orch-low', 'task-low')
  const held = await runL4AuditAndCommit(
    { orchestratorAgentId: 'orch-low', taskRef: 'task-low', trace: trace(), now: NOW, client: fake2.client },
    fakeExtractor(FLAG),
  )
  eq(held.trustTier, 'lower', '8.5 e2e: unknown orchestrator → lower tier')
  eq(held.outcome.result!.disposition, 'holds-selection', '8.6 e2e: lower + flag → holds-selection')
  eq(held.commit.statusSet, 'escalated', '8.7 e2e: lower-tier flag → held (escalated)')

  // Flag-OFF end-to-end: a PURE no-op — the extractor is NOT invoked (no live LLM call)
  // and nothing writes (MEASURE dark, byte-equivalent).
  delete process.env[TRUST_CORE_ENV_VAR]
  const fake3 = makeFakeSupabase()
  seedHigherTierOrchestrator(fake3, 'orch-dark')
  seedOpenCollaboration(fake3, 'orch-dark', 'task-dark')
  let darkExtractorCalls = 0
  const spyExtractor: L4TraceExtractor = {
    extractL4Signals: async () => {
      darkExtractorCalls++
      return { signals: FLAG, traceRef: 'x' }
    },
  }
  const dark = await runL4AuditAndCommit(
    { orchestratorAgentId: 'orch-dark', taskRef: 'task-dark', trace: trace(), now: NOW, client: fake3.client },
    spyExtractor,
  )
  eq(darkExtractorCalls, 0, '8.8 flag-off e2e → extractor NOT invoked (no live LLM call)')
  eq(dark.trustTier, 'lower', '8.9 flag-off e2e → tier lower (no DB read)')
  eq(dark.outcome.status, 'audit-unavailable', '8.10 flag-off e2e → audit did not run')
  eq(dark.commit.committed, false, '8.11 flag-off e2e → commit no-op')
  eq(fake3.tables.collaboration_records[0].l4_audit_result, null, '8.12 flag-off e2e → collaboration untouched')
  eq(fake3.tables.collaboration_records[0].status, 'open', '8.13 flag-off e2e → status untouched')

  if (prior === undefined) delete process.env[TRUST_CORE_ENV_VAR]
  else process.env[TRUST_CORE_ENV_VAR] = prior
}

// ── Run ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  await section5()
  await section6()
  await section7()
  await section8()
}

main().then(() => {
  console.log(`\nS7 l4-passion-audit battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('Failures:\n' + failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
})
