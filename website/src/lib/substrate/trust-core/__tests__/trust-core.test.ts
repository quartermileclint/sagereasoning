/**
 * trust-core.test.ts — Trust Layer S1 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>   (the pure engine + derivers reach
 * no Supabase chain; the store tests inject an in-memory fake client, so
 * getAdminClient() is never reached — run bare, no --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare):
 *   - A3 decay: onset bands (12/6/3mo), one ordinal step per onset-period,
 *     floored at the prior, reflect halving the rate; a live now() read.
 *   - Spec-3 dynamics: hysteresis-bounded credential rise, the justice cap latch
 *     + its clear, violated→reflexive below prior, reflect modulate-only, the
 *     decrease events; decay realised before an event.
 *   - Spec-4/6 aggregate: minimum-domain, coverage-gap honesty, worse-reasoning-
 *     scores-worse.
 *   - R18f-parallel derivers: no event without a VERIFIED artifact; the honest-
 *     reflect gate; the worst-justice-outcome mapping.
 *   - Store: emit idempotency (no double-count on retry), the fold, reflect
 *     across domains, read/decay/aggregate, data-rights delete/export, purge.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type { EarnedDomainState, TrustEvent, VirtueTrustDomain } from '../types'
import { initialEarnedDomainState } from '../types'
import { MONTH_MS } from '../constants'
import { decayEarnedRank } from '../trust-decay'
import { applyTrustEvent, foldTrustEvents, EVENT_EFFECT } from '../trust-transition'
import { computeEffectiveDomain, computeTrustProfile } from '../trust-aggregate'
import {
  deriveCredentialAndJusticeEvents,
  deriveReflectEvent,
  deriveWorstJusticeOutcome,
} from '../derive-trust-events'
import {
  emitTrustEvents,
  readTrustProfile,
  deleteTrustDataForOwner,
  deleteTrustDataForCredential,
  getTrustDataForOwner,
  purgeExpiredTrustCore,
} from '../trust-core-store'

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

const T0 = '2026-01-01T00:00:00.000Z'
function plusMonths(iso: string, n: number): string {
  return new Date(Date.parse(iso) + n * MONTH_MS).toISOString()
}
function at(iso: string): Date {
  return new Date(iso)
}

// ============================================================================
// 1. Decay (A3)
// ============================================================================

function decayState(o: Partial<EarnedDomainState>): EarnedDomainState {
  return { ...initialEarnedDomainState({ profilePrior: 'habitual', volatility: 'high' }), ...o }
}

// No decay before the onset (high=3mo): at 2 months, still principled.
;(() => {
  const s = decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'high' })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 2)) })
  eq(r.stepsApplied, 0, 'decay: no step before onset (high, 2mo)')
})()

// One step at the onset (high=3mo): principled → deliberate.
;(() => {
  const s = decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'high' })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 3)) })
  eq(r.stepsApplied, 1, 'decay: one step at onset (high, 3mo)')
})()

// Two steps at 2×onset (high=6mo): principled → habitual (prior), floored.
;(() => {
  const s = decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'high', profilePrior: 'habitual' })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 6)) })
  // principled(3) - 2 = habitual(1) = prior; floored there.
  eq(r.rank, 1, 'decay: two steps at 2×onset, floored at prior (high, 6mo)')
})()

// Floor at prior: far past → never below the prior.
;(() => {
  const s = decayState({ earnedLevel: 'sage_like', lastDomainActivityAt: T0, volatility: 'high', profilePrior: 'deliberate' })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 60)) })
  eq(r.rank, 2, 'decay: floors at prior (deliberate), never below')
})()

// Volatility bands: low=12mo (no step at 6mo), moderate=6mo (one step at 6mo).
;(() => {
  const low = decayEarnedRank({ ...decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'low' }), now: at(plusMonths(T0, 6)) })
  eq(low.stepsApplied, 0, 'decay: low volatility no step at 6mo (onset 12mo)')
  const mod = decayEarnedRank({ ...decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'moderate' }), now: at(plusMonths(T0, 6)) })
  eq(mod.stepsApplied, 1, 'decay: moderate volatility one step at 6mo (onset 6mo)')
})()

// Reflect modulation DOUBLES the onset (high 3mo→6mo): active reflect ⇒ no step at 3mo.
;(() => {
  const s = decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'high', reflectLastHonestAt: plusMonths(T0, 2.5) })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 3)) })
  eq(r.stepsApplied, 0, 'decay: active reflect doubles onset (no step at 3mo)')
  assert(r.reflectModulated, 'decay: reflectModulated flagged')
  // At 6mo the doubled onset finally bites (one step). Reflect must still be recent.
  const r2 = decayEarnedRank({ ...decayState({ earnedLevel: 'principled', lastDomainActivityAt: T0, volatility: 'high', reflectLastHonestAt: plusMonths(T0, 5.9) }), now: at(plusMonths(T0, 6)) })
  eq(r2.stepsApplied, 1, 'decay: doubled onset bites at 6mo')
})()

// Stale reflect (outside the active window ~180d) ⇒ no modulation. Reflect at T0,
// now at T0+9mo (270d > 180d ⇒ stale); activity at T0+6mo ⇒ 3mo inactivity ⇒
// base-rate one step at the high onset (3mo).
;(() => {
  const s = decayState({ earnedLevel: 'principled', lastDomainActivityAt: plusMonths(T0, 6), volatility: 'high', reflectLastHonestAt: T0 })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 9)) })
  assert(!r.reflectModulated, 'decay: stale reflect not modulating')
  eq(r.stepsApplied, 1, 'decay: stale reflect ⇒ base-rate step (3mo inactivity, high onset)')
})()

// earned ≤ prior ⇒ no decay (a below-prior event value stands).
;(() => {
  const s = decayState({ earnedLevel: 'reflexive', lastDomainActivityAt: T0, profilePrior: 'habitual' })
  const r = decayEarnedRank({ ...s, now: at(plusMonths(T0, 60)) })
  eq(r.rank, 0, 'decay: earned below prior is not raised by decay')
})()

// ============================================================================
// 2. Transition (spec 3)
// ============================================================================

function ev(o: Partial<TrustEvent>): TrustEvent {
  return {
    agentId: 'ns:a@v1',
    virtueDomain: 'phronesis',
    eventType: 'credential-completed',
    artifactKind: 'signed_layer2_assessment',
    artifactRef: 'signed:k',
    payload: {},
    occurredAt: T0,
    ...o,
  }
}

// credential-completed continuous rises +1 toward demonstrated (hysteresis, not a jump).
;(() => {
  const s0 = initialEarnedDomainState({ profilePrior: 'habitual' }) // habitual(1)
  const s1 = applyTrustEvent(s0, ev({ payload: { demonstratedProximity: 'sage_like', coverageContinuous: true }, occurredAt: T0 }))
  eq(s1.earnedLevel, 'deliberate', 'transition: credential rises +1 (habitual→deliberate), not to sage_like')
  const s2 = applyTrustEvent(s1, ev({ payload: { demonstratedProximity: 'sage_like', coverageContinuous: true }, occurredAt: T0 }))
  eq(s2.earnedLevel, 'principled', 'transition: second credential rises +1 again')
})()

// credential at/below current ⇒ no change; non-continuous ⇒ no rise.
;(() => {
  const s0 = { ...initialEarnedDomainState({ profilePrior: 'deliberate' }), earnedLevel: 'deliberate' as KatorthomaProximity }
  const same = applyTrustEvent(s0, ev({ payload: { demonstratedProximity: 'deliberate', coverageContinuous: true } }))
  eq(same.earnedLevel, 'deliberate', 'transition: credential at current ⇒ no change')
  const gapped = applyTrustEvent(s0, ev({ payload: { demonstratedProximity: 'sage_like', coverageContinuous: false } }))
  eq(gapped.earnedLevel, 'deliberate', 'transition: non-continuous credential ⇒ no rise')
})()

// justice-surface-unevaluated sets the latch; the cap bites at READ (deliberate).
;(() => {
  let s: EarnedDomainState = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'principled' as KatorthomaProximity, lastDomainActivityAt: T0 }
  s = applyTrustEvent(s, ev({ virtueDomain: 'dikaiosyne', eventType: 'justice-surface-unevaluated', occurredAt: T0 }))
  assert(s.justiceFloorActive, 'transition: unevaluated sets justice latch')
  const eff = computeEffectiveDomain('dikaiosyne', s, at(T0))
  eq(eff.effectiveLevel, 'deliberate', 'transition: justice cap bites at read (principled→deliberate)')
  assert(eff.justiceCapped, 'transition: justiceCapped surfaced')
})()

// transparently-handled CLEARS the latch and raises +1.
;(() => {
  let s: EarnedDomainState = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'deliberate' as KatorthomaProximity, justiceFloorActive: true, lastDomainActivityAt: T0 }
  s = applyTrustEvent(s, ev({ virtueDomain: 'dikaiosyne', eventType: 'justice-surface-transparently-handled', payload: { demonstratedProximity: 'principled' }, occurredAt: T0 }))
  assert(!s.justiceFloorActive, 'transition: transparently-handled clears the latch')
  eq(s.earnedLevel, 'principled', 'transition: transparently-handled raises +1')
})()

// violated → reflexive, BELOW the prior (trust-reducing evidence, not decay).
;(() => {
  let s: EarnedDomainState = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'principled' as KatorthomaProximity, lastDomainActivityAt: T0 }
  s = applyTrustEvent(s, ev({ virtueDomain: 'dikaiosyne', eventType: 'justice-surface-violated', occurredAt: T0 }))
  eq(s.earnedLevel, 'reflexive', 'transition: violated floors dikaiosyne to reflexive, below the habitual prior')
})()

// reflect-completed-honest: modulate only (no level change, no activity reset, sets reflect ts).
;(() => {
  const s0 = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'principled' as KatorthomaProximity, lastDomainActivityAt: T0 }
  const s1 = applyTrustEvent(s0, ev({ virtueDomain: null, eventType: 'reflect-completed-honest', occurredAt: plusMonths(T0, 1) }))
  eq(s1.earnedLevel, 'principled', 'transition: reflect does not change the level')
  eq(s1.lastDomainActivityAt, T0, 'transition: reflect does NOT reset the activity clock')
  eq(s1.reflectLastHonestAt, plusMonths(T0, 1), 'transition: reflect sets reflect timestamp')
})()

// decrease events (passion / suspend / orchestrator / delegation-1/2) step -1.
;(() => {
  for (const t of ['passion-unflagged-by-self-screen', 'credential-suspended-revoked', 'orchestrator-proceeds-under-habitual-flag', 'delegation-reflection-case-1', 'delegation-reflection-case-2'] as const) {
    const s0 = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'principled' as KatorthomaProximity, lastDomainActivityAt: T0 }
    const s1 = applyTrustEvent(s0, ev({ virtueDomain: 'oversight', eventType: t, occurredAt: T0 }))
    eq(s1.earnedLevel, 'deliberate', `transition: ${t} steps -1`)
  }
})()

// delegation-case-3 = flag: NO level change (A9 case 3 — flag, not reduction).
;(() => {
  const s0 = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'principled' as KatorthomaProximity, lastDomainActivityAt: T0 }
  const s1 = applyTrustEvent(s0, ev({ virtueDomain: 'oversight', eventType: 'delegation-reflection-case-3', occurredAt: T0 }))
  eq(s1.earnedLevel, 'principled', 'transition: delegation-case-3 is a flag (no reduction)')
  eq(EVENT_EFFECT['delegation-reflection-case-3'], 'flag', 'transition: case-3 effect is flag')
})()

// Decay realised BEFORE an event: a decayed principled + credential rises from the decayed position.
;(() => {
  let s: EarnedDomainState = { ...initialEarnedDomainState({ profilePrior: 'habitual', volatility: 'high' }), earnedLevel: 'principled' as KatorthomaProximity, lastDomainActivityAt: T0 }
  // 6 months later principled(3) decays 2 → habitual(1); then a credential rises +1 → deliberate(2).
  s = applyTrustEvent(s, ev({ virtueDomain: 'phronesis', payload: { demonstratedProximity: 'sage_like', coverageContinuous: true }, occurredAt: plusMonths(T0, 6) }))
  eq(s.earnedLevel, 'deliberate', 'transition: credential rises from the DECAYED position (not the stale earned)')
  eq(s.lastDomainActivityAt, plusMonths(T0, 6), 'transition: activity clock reset to event time')
})()

// ============================================================================
// 3. Aggregate (spec 4/6) + worse-scores-worse
// ============================================================================

;(() => {
  const states = new Map<VirtueTrustDomain, EarnedDomainState>()
  states.set('phronesis', { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'principled', lastDomainActivityAt: T0 })
  states.set('dikaiosyne', { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'deliberate', lastDomainActivityAt: T0 })
  const p = computeTrustProfile('ns:a@v1', states, at(T0))
  eq(p.aggregate.level, 'deliberate', 'aggregate: minimum-domain (dikaiosyne=deliberate limits)')
  eq(p.aggregate.limitingDomain, 'dikaiosyne', 'aggregate: limiting domain named')
  assert(p.unevaluatedCardinalDomains.includes('andreia') && p.unevaluatedCardinalDomains.includes('sophrosyne'), 'aggregate: un-evaluated cardinal domains surfaced')
  assert(!p.sparse, 'aggregate: not sparse when evidence present')
})()

// Sparse when no evidence.
;(() => {
  const p = computeTrustProfile('ns:a@v1', new Map(), at(T0))
  assert(p.sparse, 'aggregate: sparse with no domains')
  eq(p.aggregate.level, null, 'aggregate: null level when sparse')
  eq(p.unevaluatedCardinalDomains.length, 4, 'aggregate: all four cardinal domains un-evaluated when empty')
})()

// worse-reasoning-scores-worse: a violated-justice agent aggregates strictly below a met-justice agent.
;(() => {
  function agg(justiceEvent: TrustEvent['eventType']): KatorthomaProximity | null {
    const states = new Map<VirtueTrustDomain, EarnedDomainState>()
    let dik: EarnedDomainState = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), earnedLevel: 'deliberate' as KatorthomaProximity, lastDomainActivityAt: T0 }
    dik = applyTrustEvent(dik, ev({ virtueDomain: 'dikaiosyne', eventType: justiceEvent, payload: { demonstratedProximity: 'principled' }, occurredAt: T0 }))
    states.set('dikaiosyne', dik)
    return computeTrustProfile('ns:a@v1', states, at(T0)).aggregate.level
  }
  const met = agg('justice-surface-transparently-handled')
  const violated = agg('justice-surface-violated')
  const unevaluated = agg('justice-surface-unevaluated')
  eq(met, 'principled', 'fidelity: met justice → principled')
  eq(violated, 'reflexive', 'fidelity: violated justice → reflexive')
  eq(unevaluated, 'deliberate', 'fidelity: unevaluated justice → capped at deliberate')
  assert(rank(violated) < rank(unevaluated) && rank(unevaluated) < rank(met), 'fidelity: worse reasoning scores strictly worse (violated < unevaluated < met)')
})()

function rank(p: KatorthomaProximity | null): number {
  const order: KatorthomaProximity[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
  return p === null ? -1 : order.indexOf(p)
}

// ============================================================================
// 4. Derivers (R18f-parallel)
// ============================================================================

function mkSigned(
  proximity: KatorthomaProximity,
  domains: ('phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne')[],
  circles: { status?: 'met' | 'violated' | 'indeterminate' }[] = [],
): SignedLayer2Assessment {
  return {
    assessment: {
      katorthoma_proximity: proximity,
      virtue_domains_engaged: domains,
      oikeiosis: {
        relevant_circles: circles.map((c) => ({
          obligation_assessment: c.status ? { status: c.status, justification: 'x' } : null,
        })),
      },
    } as unknown as SignedLayer2Assessment['assessment'],
    signature: 'sig',
    key_id: 'substrate-layer2-2026Q2',
  }
}
const verifyOk = () => ({ valid: true as const, key_id: 'substrate-layer2-2026Q2' })
const verifyFail = () => ({ valid: false as const, reason: 'bad_signature' })

// Verified → credential events per engaged domain + one justice event.
;(() => {
  const events = deriveCredentialAndJusticeEvents({
    agentId: 'ns:a@v1', ownerUserId: null, credentialRef: 'api_key:k',
    signedAssessments: [mkSigned('principled', ['phronesis', 'dikaiosyne'], [{ status: 'met' }])],
    now: at(T0), correlationId: 'c1', verify: verifyOk,
  })
  const creds = events.filter((e) => e.eventType === 'credential-completed')
  eq(creds.length, 2, 'deriver: one credential-completed per engaged domain')
  assert(events.some((e) => e.eventType === 'justice-surface-transparently-handled' && e.virtueDomain === 'dikaiosyne'), 'deriver: met → transparently-handled on dikaiosyne')
  assert(events.every((e) => e.artifactRef.startsWith('signed:')), 'deriver: artifactRef names the signed artifact')
})()

// R18f-parallel: an UNVERIFIED assessment yields NO events.
;(() => {
  const events = deriveCredentialAndJusticeEvents({
    agentId: 'ns:a@v1', ownerUserId: null, credentialRef: null,
    signedAssessments: [mkSigned('principled', ['phronesis'])],
    now: at(T0), correlationId: 'c2', verify: verifyFail,
  })
  eq(events.length, 0, 'deriver: unverified artifact ⇒ NO events (R18f-parallel)')
})()

// Conservative demonstrated proximity = the WEAKEST across assessments engaging a domain.
;(() => {
  const events = deriveCredentialAndJusticeEvents({
    agentId: 'ns:a@v1', ownerUserId: null, credentialRef: null,
    signedAssessments: [mkSigned('sage_like', ['phronesis']), mkSigned('deliberate', ['phronesis'])],
    now: at(T0), correlationId: 'c3', verify: verifyOk,
  })
  const cred = events.find((e) => e.eventType === 'credential-completed' && e.virtueDomain === 'phronesis')
  eq(cred?.payload.demonstratedProximity, 'deliberate', 'deriver: demonstrated proximity is the weakest across assessments')
})()

// Worst-justice-outcome mapping (violated > unevaluated > indeterminate > met).
;(() => {
  eq(deriveWorstJusticeOutcome([mkSigned('deliberate', ['dikaiosyne'], [{ status: 'met' }, { status: 'violated' }]).assessment])?.eventType, 'justice-surface-violated', 'justice: violated wins over met')
  eq(deriveWorstJusticeOutcome([mkSigned('deliberate', ['dikaiosyne'], []).assessment])?.eventType, 'justice-surface-unevaluated', 'justice: dikaiosyne engaged + no obligation ⇒ unevaluated')
  eq(deriveWorstJusticeOutcome([mkSigned('deliberate', ['phronesis'], []).assessment]), null, 'justice: no dikaiosyne + no obligation ⇒ no justice event')
  eq(deriveWorstJusticeOutcome([mkSigned('deliberate', ['dikaiosyne'], [{ status: 'indeterminate' }]).assessment])?.eventType, 'justice-surface-indeterminate', 'justice: indeterminate mapping')
})()

// Reflect honesty gate.
;(() => {
  const honest = deriveReflectEvent({ agentId: 'ns:a@v1', ownerUserId: null, credentialRef: null, sessionId: 's1', fabricationRiskLevel: 'low', contextSource: 'agent_stated', now: at(T0), correlationId: 'r1' })
  assert(honest !== null && honest.eventType === 'reflect-completed-honest' && honest.virtueDomain === null, 'reflect: honest completion ⇒ agent-wide event')
  eq(deriveReflectEvent({ agentId: 'ns:a@v1', ownerUserId: null, credentialRef: null, sessionId: 's2', fabricationRiskLevel: 'low', contextSource: 'harness_inferred', now: at(T0), correlationId: 'r2' }), null, 'reflect: harness_inferred ⇒ NO event')
  eq(deriveReflectEvent({ agentId: 'ns:a@v1', ownerUserId: null, credentialRef: null, sessionId: 's3', fabricationRiskLevel: 'high', contextSource: 'agent_stated', now: at(T0), correlationId: 'r3' }), null, 'reflect: high fabrication risk ⇒ NO event')
})()

// foldTrustEvents replay: reflect (agent-wide) modulates a domain touched later.
;(() => {
  const events: TrustEvent[] = [
    ev({ virtueDomain: null, eventType: 'reflect-completed-honest', artifactKind: 'reflect_completion', artifactRef: 'reflect:s', occurredAt: plusMonths(T0, 0.5) }),
    ev({ virtueDomain: 'phronesis', payload: { demonstratedProximity: 'principled', coverageContinuous: true }, occurredAt: plusMonths(T0, 1) }),
  ]
  const states = foldTrustEvents(events, () => initialEarnedDomainState({ profilePrior: 'habitual' }))
  const ph = states.get('phronesis')!
  assert(ph.reflectLastHonestAt === plusMonths(T0, 0.5), 'fold: a later-touched domain inherits the earlier reflect timestamp')
})()

// ============================================================================
// 5. Store (in-memory fake client) — emit idempotency, fold, reflect, data rights, purge
// ============================================================================

import { makeFakeSupabase } from './fake-supabase'

;(async () => {
  // Emit a credential + justice batch; read the profile.
  const fake = makeFakeSupabase()
  const batch = deriveCredentialAndJusticeEvents({
    agentId: 'ns:a@v1', ownerUserId: 'owner-1', credentialRef: 'api_key:k',
    // dikaiosyne engaged + NO circle obligation ⇒ justice-surface-unevaluated.
    signedAssessments: [mkSigned('principled', ['phronesis', 'dikaiosyne'], [])],
    now: at(T0), correlationId: 'w1', verify: verifyOk,
  })
  const r1 = await emitTrustEvents(batch, fake.client)
  assert(r1.ok, 'store: emit ok')

  // Idempotent retry — same correlation ⇒ no new writes, no double-count.
  const r2 = await emitTrustEvents(batch, fake.client)
  assert(r2.ok && r2.value.written === 0, 'store: retry writes 0 (idempotent, no double-count)')

  const prof = await readTrustProfile('ns:a@v1', at(T0), fake.client)
  assert(prof.ok, 'store: read ok')
  if (prof.ok) {
    const dik = prof.value.domains.find((d) => d.virtueDomain === 'dikaiosyne')
    assert(dik?.justiceCapped === true, 'store: dikaiosyne justice cap active after unevaluated')
    // phronesis rose once (habitual→deliberate); dikaiosyne capped at deliberate.
    eq(prof.value.aggregate.level, 'deliberate', 'store: aggregate minimum-domain = deliberate')
  }
})()

;(async () => {
  // Reflect across domains: emit a domain credential, then a reflect, and confirm
  // the domain row's reflect timestamp is set (modulating decay).
  const fake = makeFakeSupabase()
  await emitTrustEvents([ev({ virtueDomain: 'phronesis', payload: { demonstratedProximity: 'principled', coverageContinuous: true }, occurredAt: T0, ownerUserId: 'owner-2', agentId: 'ns:b@v1' })], fake.client)
  await emitTrustEvents([ev({ agentId: 'ns:b@v1', virtueDomain: null, eventType: 'reflect-completed-honest', artifactKind: 'reflect_completion', artifactRef: 'reflect:s', occurredAt: plusMonths(T0, 1), ownerUserId: 'owner-2' })], fake.client)
  const row = fake.tables.agent_trust_state.find((r) => r.agent_id === 'ns:b@v1' && r.virtue_domain === 'phronesis')
  eq(row?.reflect_last_honest_at, plusMonths(T0, 1), 'store: reflect timestamp set across the agent domain rows')
})()

;(async () => {
  // Data rights: delete by owner + export by owner + purge.
  const fake = makeFakeSupabase()
  await emitTrustEvents(deriveCredentialAndJusticeEvents({
    agentId: 'ns:c@v1', ownerUserId: 'owner-3', credentialRef: 'api_key:z',
    signedAssessments: [mkSigned('principled', ['phronesis'])],
    now: at(T0), correlationId: 'w3', verify: verifyOk,
  }), fake.client)

  const exp = await getTrustDataForOwner('owner-3', fake.client)
  assert(exp.ok && exp.value.events.length >= 1 && exp.value.state.length >= 1, 'store: export by owner returns events + state')

  const del = await deleteTrustDataForOwner('owner-3', fake.client)
  assert(del.ok && del.value.events >= 1 && del.value.state >= 1, 'store: delete by owner removes events + state')
  eq(fake.tables.agent_trust_events.filter((r) => r.owner_user_id === 'owner-3').length, 0, 'store: no owner events remain after delete')

  // Consumer erasure by credential.
  await emitTrustEvents(deriveCredentialAndJusticeEvents({
    agentId: 'ns:d@v1', ownerUserId: null, credentialRef: 'api_key:cons',
    signedAssessments: [mkSigned('deliberate', ['phronesis'])],
    now: at(T0), correlationId: 'w4', verify: verifyOk,
  }), fake.client)
  const delc = await deleteTrustDataForCredential('api_key:cons', fake.client)
  assert(delc.ok && delc.value.events >= 1, 'store: delete by credential removes events')
})()

;(async () => {
  // Purge: an expired row is swept; a live row is kept.
  const fake = makeFakeSupabase()
  fake.tables.agent_trust_events.push({ id: 'e-old', agent_id: 'x', virtue_domain: 'phronesis', event_type: 'credential-completed', artifact_kind: 'signed_layer2_assessment', artifact_ref: 'signed:k', payload: {}, occurred_at: T0, correlation_id: null, owner_user_id: null, credential_ref: null, retain_until: '2020-01-01T00:00:00.000Z' })
  fake.tables.agent_trust_events.push({ id: 'e-new', agent_id: 'x', virtue_domain: 'phronesis', event_type: 'credential-completed', artifact_kind: 'signed_layer2_assessment', artifact_ref: 'signed:k', payload: {}, occurred_at: T0, correlation_id: null, owner_user_id: null, credential_ref: null, retain_until: '2999-01-01T00:00:00.000Z' })
  const purge = await purgeExpiredTrustCore(fake.client)
  eq(purge.error, null, 'store: purge no error')
  assert(purge.events >= 1, 'store: purge removed the expired event')
  assert(fake.tables.agent_trust_events.some((r) => r.id === 'e-new'), 'store: purge kept the live event')
  assert(!fake.tables.agent_trust_events.some((r) => r.id === 'e-old'), 'store: purge removed the expired event row')
})()

;(async () => {
  // Missing-table-benign: a store with NO tables must not throw on data rights.
  const fake = makeFakeSupabase({ missingTables: true })
  const del = await deleteTrustDataForOwner('owner-x', fake.client)
  assert(del.ok, 'store: delete on missing table is benign ok')
  const exp = await getTrustDataForOwner('owner-x', fake.client)
  assert(exp.ok && exp.value.events.length === 0, 'store: export on missing table is benign empty')
  const purge = await purgeExpiredTrustCore(fake.client)
  eq(purge.error, null, 'store: purge on missing table is benign (no error)')
})()

// ============================================================================
// Summary (deferred to flush the async store blocks)
// ============================================================================

setTimeout(() => {
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('Failures:\n' + failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}, 100)
