/**
 * s9b-practice-completion.test.ts — Trust Layer S9b instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>  (pure engine + derivers; no
 * Supabase chain reached — run bare, no --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare) the S9b additions
 * (ADR-013 §11 — the 2026-07-11 mentor verdicts, verbatim record wins):
 *   G1d  calling-completed: the ASYMMETRIC 'calling' effect — an agent-stated
 *        mismatch rises +1-capped with a STRUCTURAL 'deliberate' ceiling; a
 *        harness-computed mismatch / no-mismatch is record-only with NO
 *        activity-clock reset (a declaration can never freeze decay); the
 *        where-impossible arm emits NOTHING (the deriver's null arm).
 *   G1b  computePurposeAcknowledgement: fit / mismatch / unassessable.
 *   G1c  the declaration evidence tier + the accumulation ladder.
 *   G2   reflect-screened-honest: 'modulate-screened' sets ONLY the screened
 *        timestamp; decay modulation at the QUARTER rate (onset ×4/3), full
 *        wins when both signals are active; the deriver's honesty gates.
 *   G3   the F-Q43 calibration (commitment fires only WITHOUT a preceding
 *        assent stage; the grave arm unchanged) + examineElicitation.
 *   G4   the suppression watch: the 3-part standard (above-noise ≥2, screen-
 *        ran-and-missed at sub-species level, sub-species identified);
 *        self-screen-absent when no screen evidence; the valence domain map.
 *   PA-6 guard: NONE of the three new event types can RAISE oversight.
 */

import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type { TrustEvent } from '../types'
import { initialEarnedDomainState } from '../types'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import {
  REFLECT_MODULATION_FACTOR,
  SCREENED_REFLECT_MODULATION_FACTOR,
} from '../constants'
import { decayEarnedRank } from '../trust-decay'
import { applyTrustEvent, EVENT_EFFECT, foldTrustEvents } from '../trust-transition'
import {
  deriveCallingEvent,
  deriveScreenedReflectEvent,
  deriveSuppressionWatchEvents,
  passionRootToDomain,
} from '../derive-trust-events'
import { computePurposeAcknowledgement } from '../collaboration-record'
import {
  seedCandidateProfileFromCallingRecords,
  CONSISTENT_RECORDS_FOR_BEHAVIOURAL_TIER,
} from '../profile-seeding'
import { EVIDENCE_TIER_WEIGHT } from '../evidence-weighting'
import { mapTraceFeaturesToL4Signals } from '../l4-passion-audit'
import { examineElicitation } from '../gate2-elicitation'
import type { Layer1Schema } from '@/lib/translation-sandwich/layer1-extractor'

let passed = 0
let failed = 0
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    console.error(`  FAIL  ${label}`)
  }
}
function assertEq<T>(a: T, b: T, label: string): void {
  assert(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
}

const NOW = new Date('2026-07-12T00:00:00Z')
const ISO = NOW.toISOString()

// ════════════════════════════════════════════════════════════════════════════
// 1. EVENT_EFFECT rows + the PA-6 oversight guard
// ════════════════════════════════════════════════════════════════════════════
assertEq(EVENT_EFFECT['calling-completed'], 'calling', 'EVENT_EFFECT: calling-completed → calling')
assertEq(EVENT_EFFECT['reflect-screened-honest'], 'modulate-screened', 'EVENT_EFFECT: reflect-screened-honest → modulate-screened')
assertEq(EVENT_EFFECT['self-screen-absent'], 'flag', 'EVENT_EFFECT: self-screen-absent → flag')

// PA-6 standing note: no new event type may RAISE the oversight domain. Apply
// each new type to an oversight state and assert the level never rises.
{
  const prior = initialEarnedDomainState({ profilePrior: 'habitual' })
  const mk = (eventType: TrustEvent['eventType'], payload: TrustEvent['payload']): TrustEvent => ({
    agentId: 'a', virtueDomain: 'oversight', eventType, artifactKind: 'calling_record',
    artifactRef: 'collab:x', payload, occurredAt: ISO,
  })
  for (const [t, p] of [
    ['calling-completed', { mismatchFlagsRaised: ['x'], acknowledgementSource: 'agent_stated', demonstratedProximity: 'sage_like' }],
    ['reflect-screened-honest', { reflectDepth: 'screened' }],
    ['self-screen-absent', {}],
  ] as const) {
    const next = applyTrustEvent(prior, mk(t, p as TrustEvent['payload']))
    // calling CAN rise — but only on its own domain semantics; the assertion here
    // is the DERIVER never targets oversight (below) AND flag/modulate never move
    // the level. For calling we additionally show the rise is capped at +1.
    if (t === 'calling-completed') {
      assert(next.earnedLevel === 'deliberate' || next.earnedLevel === 'habitual', 'PA-6: calling rise is +1-capped even with a gamed sage_like payload')
    } else {
      assertEq(next.earnedLevel, prior.earnedLevel, `PA-6: ${t} never moves the level`)
    }
  }
  // The deriver only ever emits calling-completed on dikaiosyne — oversight is
  // structurally unreachable for the increase arm.
  const ev = deriveCallingEvent({
    agentId: 'a', ownerUserId: null, credentialRef: null, source: 'spawn_acknowledgement',
    artifactRef: 'collab:x', declaredPurpose: 'p', functionTypeScope: ['f'],
    circleOfConcernLevel: null, mismatchFlagsRaised: ['m'], mismatchPossible: true,
    acknowledgementSource: 'agent_stated', now: NOW, correlationId: 'c1',
  })
  assertEq(ev?.virtueDomain, 'dikaiosyne', 'PA-6: the calling deriver targets dikaiosyne, never oversight')
}

// ════════════════════════════════════════════════════════════════════════════
// 2. The 'calling' transition — three arms
// ════════════════════════════════════════════════════════════════════════════
{
  const prior = { ...initialEarnedDomainState({ profilePrior: 'habitual' }), lastDomainActivityAt: null }
  const base: TrustEvent = {
    agentId: 'a', virtueDomain: 'dikaiosyne', eventType: 'calling-completed',
    artifactKind: 'calling_record', artifactRef: 'collab:x',
    payload: {}, occurredAt: ISO,
  }

  // ARM 1: agent-stated mismatch ⇒ rise habitual → deliberate (+1, ceiling met).
  const arm1 = applyTrustEvent(prior, {
    ...base,
    payload: { mismatchFlagsRaised: ['m'], acknowledgementSource: 'agent_stated', demonstratedProximity: 'deliberate' },
  })
  assertEq(arm1.earnedLevel, 'deliberate', 'calling ARM1: agent-stated mismatch rises habitual→deliberate')
  assertEq(arm1.lastDomainActivityAt, ISO, 'calling ARM1: genuine activity resets the clock')

  // ARM 1 ceiling: from deliberate, demonstrated 'deliberate' is not > current ⇒ HOLD.
  const atDeliberate = { ...prior, earnedLevel: 'deliberate' as const, lastDomainActivityAt: ISO }
  const arm1b = applyTrustEvent(atDeliberate, {
    ...base,
    payload: { mismatchFlagsRaised: ['m'], acknowledgementSource: 'agent_stated', demonstratedProximity: 'deliberate' },
  })
  assertEq(arm1b.earnedLevel, 'deliberate', 'calling ARM1: never rises above deliberate (the declaration-tier ceiling)')

  // ARM 2a: harness-computed mismatch ⇒ record-only — no level change, NO clock reset.
  const arm2a = applyTrustEvent(prior, {
    ...base,
    payload: { mismatchFlagsRaised: ['m'], acknowledgementSource: 'harness_computed', demonstratedProximity: 'deliberate' },
  })
  assertEq(arm2a.earnedLevel, 'habitual', 'calling ARM2a: harness-computed mismatch never credits the agent')
  assertEq(arm2a.lastDomainActivityAt, null, 'calling ARM2a: no activity-clock reset (decay cannot be frozen by declarations)')

  // ARM 2b: no-mismatch-where-possible ⇒ record-only, no clock reset.
  const arm2b = applyTrustEvent(prior, {
    ...base,
    payload: { mismatchFlagsRaised: [], mismatchPossible: true, acknowledgementSource: 'agent_stated' },
  })
  assertEq(arm2b.earnedLevel, 'habitual', 'calling ARM2b: no-mismatch is record-only')
  assertEq(arm2b.lastDomainActivityAt, null, 'calling ARM2b: no clock reset')

  // ARM 3: where-impossible ⇒ the DERIVER emits nothing.
  const arm3 = deriveCallingEvent({
    agentId: 'a', ownerUserId: null, credentialRef: null, source: 'spawn_acknowledgement',
    artifactRef: 'collab:x', declaredPurpose: '', functionTypeScope: ['f'],
    circleOfConcernLevel: null, mismatchFlagsRaised: [], mismatchPossible: false,
    acknowledgementSource: 'harness_computed', now: NOW, correlationId: 'c3',
  })
  assertEq(arm3, null, 'calling ARM3: no-mismatch-where-impossible is a NULL event')

  // R18f-parallel: an empty artifactRef never emits.
  const noArtifact = deriveCallingEvent({
    agentId: 'a', ownerUserId: null, credentialRef: null, source: 'calling_session',
    artifactRef: '  ', declaredPurpose: 'p', functionTypeScope: ['f'],
    circleOfConcernLevel: null, mismatchFlagsRaised: ['m'], mismatchPossible: true,
    acknowledgementSource: 'agent_stated', now: NOW, correlationId: 'c4',
  })
  assertEq(noArtifact, null, 'calling deriver: no server record ⇒ no event (R18f-parallel)')

  // The deriver fixes the demonstrated ceiling at 'deliberate' on the agent-stated
  // arm and OMITS it elsewhere.
  const evAgent = deriveCallingEvent({
    agentId: 'a', ownerUserId: null, credentialRef: null, source: 'spawn_acknowledgement',
    artifactRef: 'collab:x', declaredPurpose: 'p', functionTypeScope: ['f'],
    circleOfConcernLevel: null, mismatchFlagsRaised: ['m'], mismatchPossible: true,
    acknowledgementSource: 'agent_stated', now: NOW, correlationId: 'c5',
  })
  assertEq(evAgent?.payload.demonstratedProximity, 'deliberate', 'calling deriver: agent-stated mismatch carries demonstratedProximity=deliberate')
  const evHarness = deriveCallingEvent({
    agentId: 'a', ownerUserId: null, credentialRef: null, source: 'spawn_acknowledgement',
    artifactRef: 'collab:x', declaredPurpose: 'p', functionTypeScope: ['f'],
    circleOfConcernLevel: null, mismatchFlagsRaised: ['m'], mismatchPossible: true,
    acknowledgementSource: 'harness_computed', now: NOW, correlationId: 'c6',
  })
  assertEq(evHarness?.payload.demonstratedProximity, undefined, 'calling deriver: harness-computed carries NO demonstrated proximity')
}

// ════════════════════════════════════════════════════════════════════════════
// 3. modulate-screened + quarter-rate decay
// ════════════════════════════════════════════════════════════════════════════
{
  const prior = initialEarnedDomainState({ profilePrior: 'habitual' })
  const screened = applyTrustEvent(prior, {
    agentId: 'a', virtueDomain: null, eventType: 'reflect-screened-honest',
    artifactKind: 'reflect_screened_persist', artifactRef: 'reflect:s1',
    payload: { reflectDepth: 'screened' }, occurredAt: ISO,
  })
  assertEq(screened.reflectLastScreenedAt, ISO, 'modulate-screened: sets the screened timestamp')
  assertEq(screened.reflectLastHonestAt, null, 'modulate-screened: never touches the FULL reflect timestamp')
  assertEq(screened.earnedLevel, prior.earnedLevel, 'modulate-screened: no level change')
  assertEq(screened.lastDomainActivityAt, null, 'modulate-screened: no activity-clock reset')

  // Quarter-rate arithmetic: high volatility ⇒ base onset 3mo (90d); screened ⇒
  // ×4/3 = 120d; full ⇒ ×2 = 180d. At 100 days of inactivity: base decays 1 rank,
  // screened does NOT (100 < 120); at 130 days screened decays 1, full does NOT.
  assert(SCREENED_REFLECT_MODULATION_FACTOR > 1 && SCREENED_REFLECT_MODULATION_FACTOR < REFLECT_MODULATION_FACTOR,
    'constants: screened factor strictly between none (1) and full (2)')
  const baseInput = {
    earnedLevel: 'deliberate' as const, profilePrior: 'habitual' as const,
    lastDomainActivityAt: ISO, volatility: 'high' as const,
    reflectLastHonestAt: null, reflectLastScreenedAt: null,
  }
  const at100 = new Date(NOW.getTime() + 100 * 24 * 60 * 60 * 1000)
  const at130 = new Date(NOW.getTime() + 130 * 24 * 60 * 60 * 1000)
  assertEq(decayEarnedRank({ ...baseInput, now: at100 }).stepsApplied, 1, 'decay: unmodulated steps at 100d (onset 90d)')
  const screened100 = decayEarnedRank({ ...baseInput, reflectLastScreenedAt: ISO, now: at100 })
  assertEq(screened100.stepsApplied, 0, 'decay: screened persist slows the onset past 100d (120d)')
  assertEq(screened100.screenedModulated, true, 'decay: screenedModulated flagged')
  assertEq(decayEarnedRank({ ...baseInput, reflectLastScreenedAt: ISO, now: at130 }).stepsApplied, 1, 'decay: screened still decays at 130d (slows, never stops)')
  assertEq(decayEarnedRank({ ...baseInput, reflectLastHonestAt: ISO, now: at130 }).stepsApplied, 0, 'decay: a FULL reflect holds at 130d (onset 180d)')
  const both = decayEarnedRank({ ...baseInput, reflectLastHonestAt: ISO, reflectLastScreenedAt: ISO, now: at130 })
  assertEq(both.stepsApplied, 0, 'decay: full wins when both are active (never stacks)')
  assertEq(both.screenedModulated, false, 'decay: both-active reads as FULL modulation, not screened')

  // Agent-wide fold: a later-touched domain inherits the screened timestamp.
  const folded = foldTrustEvents(
    [
      { agentId: 'a', virtueDomain: null, eventType: 'reflect-screened-honest', artifactKind: 'reflect_screened_persist', artifactRef: 'reflect:s1', payload: {}, occurredAt: ISO },
      { agentId: 'a', virtueDomain: 'phronesis', eventType: 'credential-completed', artifactKind: 'signed_layer2_assessment', artifactRef: 'signed:k', payload: { demonstratedProximity: 'deliberate', coverageContinuous: true }, occurredAt: new Date(NOW.getTime() + 1000).toISOString() },
    ],
    () => initialEarnedDomainState({ profilePrior: 'habitual' }),
  )
  assertEq(folded.get('phronesis')?.reflectLastScreenedAt, ISO, 'fold: a later-touched domain inherits the screened seed')
}

// ════════════════════════════════════════════════════════════════════════════
// 4. deriveScreenedReflectEvent honesty gates
// ════════════════════════════════════════════════════════════════════════════
{
  const base = { agentId: 'a', ownerUserId: null, credentialRef: null, sessionId: 's1', now: NOW, correlationId: 'r1' }
  const ok = deriveScreenedReflectEvent({ ...base, contextSource: 'agent_stated', verbatimLength: 42 })
  assert(ok !== null && ok.eventType === 'reflect-screened-honest' && ok.virtueDomain === null, 'screened deriver: agent_stated + verbatim ⇒ agent-wide event')
  assertEq(ok?.artifactKind, 'reflect_screened_persist', 'screened deriver: honest artifact kind (never reflect_completion)')
  assertEq(deriveScreenedReflectEvent({ ...base, contextSource: 'harness_inferred', verbatimLength: 42 }), null, 'screened deriver: harness_inferred ⇒ null')
  assertEq(deriveScreenedReflectEvent({ ...base, contextSource: 'agent_stated', verbatimLength: 0 }), null, 'screened deriver: empty verbatim ⇒ null')
}

// ════════════════════════════════════════════════════════════════════════════
// 5. The suppression watch (G4) — the 3-part standard
// ════════════════════════════════════════════════════════════════════════════
{
  const verifyOk = () => ({ valid: true as const, key_id: 'k' })
  const verifyBad = () => ({ valid: false as const, reason: 'tampered' })
  const assessmentWith = (subSpecies: string[]): SignedLayer2Assessment =>
    ({
      assessment: { passion_diagnosis: { passions_detected: subSpecies.map((s) => ({ root_passion: 'epithumia', sub_species: s })) } },
      signature: 'sig', key_id: 'k',
    }) as unknown as SignedLayer2Assessment
  const base = {
    agentId: 'a', ownerUserId: null, credentialRef: null, sessionId: 's1',
    now: NOW, correlationId: 'w1',
  }

  // Screen ran and MISSED (philodoxia surfaced ×2 in Q4; absent from the verified set) ⇒ the event.
  const missed = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [
      { rootPassion: 'epithumia', subSpecies: 'philodoxia' },
      { rootPassion: 'epithumia', subSpecies: 'philodoxia' },
    ],
    sessionAssessments: [assessmentWith(['orge'])],
    screenRanDeclared: true,
    verify: verifyOk,
  })
  assertEq(missed.length, 1, 'suppression: screen-ran-and-missed emits ONE event')
  assertEq(missed[0]?.eventType, 'passion-unflagged-by-self-screen', 'suppression: the right event type')
  assertEq(missed[0]?.virtueDomain, 'sophrosyne', 'suppression: appetitive root maps to sophrosyne')
  assertEq(missed[0]?.payload.passionSubSpecies, 'philodoxia', 'suppression: sub-species carried (3-part standard part 3)')

  // The screen CAUGHT it ⇒ no event.
  const caught = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [
      { rootPassion: 'epithumia', subSpecies: 'philodoxia' },
      { rootPassion: 'epithumia', subSpecies: 'philodoxia' },
    ],
    sessionAssessments: [assessmentWith(['philodoxia'])],
    screenRanDeclared: true,
    verify: verifyOk,
  })
  assertEq(caught.length, 0, 'suppression: a screen-caught passion never emits')

  // Below the noise threshold (one occurrence) ⇒ nothing.
  const single = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [{ rootPassion: 'epithumia', subSpecies: 'philodoxia' }],
    sessionAssessments: [assessmentWith([])],
    screenRanDeclared: true,
    verify: verifyOk,
  })
  assertEq(single.length, 0, 'suppression: a single instance is below the noise threshold (part 1)')

  // Root-only surfacings never meet the standard.
  const rootOnly = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [
      { rootPassion: 'epithumia', subSpecies: '' },
      { rootPassion: 'epithumia', subSpecies: '' },
    ],
    sessionAssessments: [assessmentWith([])],
    screenRanDeclared: true,
    verify: verifyOk,
  })
  assertEq(rootOnly.length, 0, 'suppression: bare roots never emit (part 3)')

  // No screen ⇒ self-screen-absent (a DIFFERENT event; 'flag' on oversight).
  const absent = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [
      { rootPassion: 'phobos', subSpecies: 'oknos' },
      { rootPassion: 'phobos', subSpecies: 'oknos' },
    ],
    sessionAssessments: [],
    screenRanDeclared: false,
    verify: verifyOk,
  })
  assertEq(absent.length, 1, 'suppression: no screen ⇒ one event')
  assertEq(absent[0]?.eventType, 'self-screen-absent', 'suppression: the absent event, never passion-unflagged')
  assertEq(absent[0]?.virtueDomain, 'oversight', 'suppression: absent is an oversight-domain flag')

  // Claimed-but-unevidenced (screenRan declared, all artifacts fail verification)
  // ⇒ treated as ABSENT (conservative; R18f-parallel).
  const unevidenced = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [
      { rootPassion: 'lupe', subSpecies: 'phthonos' },
      { rootPassion: 'lupe', subSpecies: 'phthonos' },
    ],
    sessionAssessments: [assessmentWith(['phthonos'])],
    screenRanDeclared: true,
    verify: verifyBad,
  })
  assertEq(unevidenced[0]?.eventType, 'self-screen-absent', 'suppression: claimed-but-unevidenced reads as absent (tampered artifacts cannot suppress)')

  // The valence map.
  assertEq(passionRootToDomain('phobos'), 'andreia', 'valence map: aversive → andreia')
  assertEq(passionRootToDomain('hedone'), 'sophrosyne', 'valence map: appetitive → sophrosyne')

  // VOCABULARY GATE (review fold, 2026-07-12): a FREE-FORM Q4 surfacing outside
  // the controlled PassionSubSpecies vocabulary can never be cross-checked
  // honestly — it must NOT emit passion-unflagged even when absent from the
  // verified assessments (the "impatience" vs "orge" over-fire class).
  const freeForm = deriveSuppressionWatchEvents({
    ...base,
    q4Passions: [
      { rootPassion: 'epithumia', subSpecies: 'impatience' },
      { rootPassion: 'epithumia', subSpecies: 'impatience' },
    ],
    sessionAssessments: [assessmentWith(['orge'])],
    screenRanDeclared: true,
    verify: verifyOk,
  })
  assertEq(freeForm.length, 0, 'suppression: a non-vocabulary surfacing never emits (the cross-vocabulary over-fire is closed)')
}

// ════════════════════════════════════════════════════════════════════════════
// 6. G1b computePurposeAcknowledgement + G1c seeding
// ════════════════════════════════════════════════════════════════════════════
{
  const task = {
    schema: 'trust-task-profile-v1', functionType: 'code-exploration',
    circlesServed: ['requesting-user'], conditions: [], outputRequirements: [],
    justiceSurface: { present: false, nonConsentingCircles: [] },
  } as never
  const fit = computePurposeAcknowledgement({
    task, candidateRef: 'explore-agent',
    candidateProfile: { agentId: 'x:a@v1', capabilityScope: ['code-exploration'], purpose: 'search' },
    now: NOW,
  })
  assertEq(fit.functionTypeFit, 'fit', 'ack: in-scope function type reads fit')
  assertEq(fit.mismatchFlags.length, 0, 'ack: fit raises no flags')
  assertEq(fit.mismatchPossible, true, 'ack: profiled candidate ⇒ mismatch possible')

  const mismatch = computePurposeAcknowledgement({
    task, candidateRef: 'plan-agent',
    candidateProfile: { agentId: 'x:b@v1', capabilityScope: ['planning'], purpose: 'plan' },
    now: NOW,
  })
  assertEq(mismatch.functionTypeFit, 'mismatch', 'ack: out-of-scope reads mismatch')
  assert(mismatch.mismatchFlags.length === 1, 'ack: mismatch raises a flag')
  assertEq(mismatch.acknowledgementSource, 'harness_computed', 'ack: v1 provenance is harness_computed')

  const unprofiled = computePurposeAcknowledgement({ task, candidateRef: 'g', candidateProfile: null, now: NOW })
  assertEq(unprofiled.functionTypeFit, 'unassessable', 'ack: un-profiled reads unassessable (the A6 path)')
  assertEq(unprofiled.mismatchPossible, false, 'ack: un-profiled ⇒ mismatch impossible (the null-event arm)')

  // G1c seeding + the ladder.
  assertEq(seedCandidateProfileFromCallingRecords([]), null, 'seed: no records ⇒ null (A6 stands)')
  const rec = (purpose: string, at: string) => ({ ...fit, declaredPurpose: purpose, computedAt: at })
  const one = seedCandidateProfileFromCallingRecords([rec('search', '2026-07-01T00:00:00Z')])
  assertEq(one?.evidenceTier, 'declaration', 'seed: one record ⇒ declaration tier')
  const three = seedCandidateProfileFromCallingRecords([
    rec('search', '2026-07-01T00:00:00Z'), rec('search', '2026-07-02T00:00:00Z'), rec('search', '2026-07-03T00:00:00Z'),
  ])
  assertEq(three?.evidenceTier, 'behavioural-condition-matched', `seed: ${CONSISTENT_RECORDS_FOR_BEHAVIOURAL_TIER} consistent records reach the lower-behavioural tier`)
  const inconsistent = seedCandidateProfileFromCallingRecords([
    rec('search', '2026-07-01T00:00:00Z'), rec('destroy', '2026-07-02T00:00:00Z'), rec('search', '2026-07-03T00:00:00Z'),
  ])
  assertEq(inconsistent?.evidenceTier, 'declaration', 'seed: inconsistent purposes hold at declaration')
  assertEq(inconsistent?.consistent, false, 'seed: inconsistency surfaced (purpose-misrepresentation input)')

  // The tier ordering (mentor: credential > behavioural > declaration > prior).
  assert(
    EVIDENCE_TIER_WEIGHT.credential > EVIDENCE_TIER_WEIGHT['behavioural-condition-matched'] &&
      EVIDENCE_TIER_WEIGHT['behavioural-condition-matched'] > EVIDENCE_TIER_WEIGHT.declaration &&
      EVIDENCE_TIER_WEIGHT.declaration > EVIDENCE_TIER_WEIGHT['profile-prior'],
    'tiers: strictly decreasing credential > behavioural > declaration > prior',
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 7. F-Q43 calibration + examineElicitation (G3)
// ════════════════════════════════════════════════════════════════════════════
{
  const features = (stages: ('phantasia' | 'synkatathesis' | 'horme' | 'praxis')[], passions: { rootPassion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'; subSpecies: null }[] = []) => ({
    passions, urgency: [], causalStages: stages, motivationStated: false,
  })
  // The S9 F-Q43 case: a faithful mid-work trace ("I weighed … and will delegate")
  // carries synkatathesis BEFORE horme ⇒ Q4.3 must NOT fire.
  assertEq(mapTraceFeaturesToL4Signals(features(['phantasia', 'synkatathesis', 'horme'])).resolutionBeforeComplete, false,
    'F-Q43: weighed-then-committed does NOT fire (the discrimination the S9 register demanded)')
  assertEq(mapTraceFeaturesToL4Signals(features(['horme', 'praxis'])).resolutionBeforeComplete, true,
    'F-Q43: commitment WITHOUT assent fires (the causal signature)')
  // ORDER, not presence (review fold, 2026-07-12): commit-first-rationalize-after
  // is the genuine "assent granted without deliberation" signature and MUST fire.
  assertEq(mapTraceFeaturesToL4Signals(features(['praxis', 'synkatathesis'])).resolutionBeforeComplete, true,
    'F-Q43: assent AFTER commitment does not launder it (order, not presence)')
  // The grave arm unchanged: unexamined irreversibility fires regardless of stages.
  const grave = mapTraceFeaturesToL4Signals({
    passions: [], causalStages: ['synkatathesis', 'praxis'], motivationStated: false,
    urgency: [{ signalType: 'irreversibility_language', examinedBeforeActing: false }],
  } as never)
  assertEq(grave.resolutionBeforeComplete, true, 'F-Q43: the grave-unexamined arm is unchanged (conservative)')

  // examineElicitation: an extraction carrying epithumia fires the signature.
  const mkSchema = (roots: string[], stages: string[]): Layer1Schema =>
    ({
      passions_present: roots.map((r) => ({ root_passion: r, sub_species: null })),
      urgency_indicators: [],
      causal_stage_evidence: stages.map((s) => ({ stage: s })),
      motivation_stated: false,
    }) as unknown as Layer1Schema
  // NOTE: l4TraceFeaturesFromLayer1 owns the schema adaptation — if its field
  // mapping drifts these two go red (a wiring pin, not a semantics pin).
  const hot = examineElicitation(mkSchema(['epithumia'], ['horme']))
  assertEq(hot.passionSignaturePresent, true, 'elicitation: desire + unassented commitment reads as a passion signature')
  const clean = examineElicitation(mkSchema([], ['phantasia', 'synkatathesis']))
  assertEq(clean.passionSignaturePresent, false, 'elicitation: examined reasoning reads clean')
  assertEq(clean.mode, 'measure', 'elicitation: measure-mode marked')
}

// ════════════════════════════════════════════════════════════════════════════
// 8. WIRING PINS (review fold, 2026-07-12 — the INV source-grep pattern):
//    the integration layer's load-bearing seams, asserted against the SOURCE so
//    a refactor that silently drops a wiring goes red here. These are wiring
//    pins, not semantics pins (the semantics are §§1–7 + the live loop).
// ════════════════════════════════════════════════════════════════════════════
{
  const root = join(__dirname, '..', '..', '..', '..', '..')
  const src = (p: string) => readFileSync(join(root, 'src', p), 'utf8')

  const route = src('app/api/practice/reflect/route.ts')
  assert(route.includes('answerContextSource: context_source'), 'wiring: the route threads the answer-call provenance')
  assert(route.includes('screen_evidence'), 'wiring: the route threads screen_evidence to open')
  assert(route.includes('isScreenedExamEnabled()') && route.includes('maybeRunScreenedExamination'), 'wiring: the OOB exam is scheduled flag-gated')

  const service = src('lib/sage-reflect/reflect-service.ts')
  assert(service.includes("verbatimProvenance === 'agent_stated'") && service.includes('emitScreenedReflectTrustEvent'), 'wiring: screened emission keys on the VERBATIM provenance')
  assert(service.includes('emitSuppressionWatchEvents'), 'wiring: the suppression watch runs at completion')

  const sweep = src('app/api/cron/trust-core-retention-sweep/handler.ts')
  assert(sweep.includes('sweepExpiredSessions'), 'wiring: the retention sweep covers sage_reflect_sessions')

  const erasure = src('lib/consumer-erasure.ts')
  assert(erasure.includes('deleteAgentSessions(row.agent_id)'), 'wiring: erase-by-token deletes the agent-keyed reflect rows')

  const integration = src('lib/substrate/trust-core/harness-integration.ts')
  assert(integration.includes('if (selection.ackPersisted)'), 'wiring: the calling emission gates on the PERSISTED acknowledgement (R18f-parallel)')

  // S9b LIVE-SMOKE fold (2026-07-12): loop_id is a UUID column, so both new
  // metering sites MUST derive a UUID-shaped loop id — a free-form string 503s
  // the RPC (caught in the founder walk's elicitation smoke). Pin both call
  // sites use deterministicLoopId, never a raw template string.
  const disc = src('app/api/practice/discernment/handler.ts')
  assert(disc.includes('deterministicLoopId(') && !/loopId\s*=\s*['"`]discern-/.test(disc), 'wiring: discernment metering uses a UUID-shaped deterministic loop id')
  const oob = src('lib/sage-reflect/screened-examination.ts')
  assert(oob.includes('deterministicLoopId(') && !/loopId\s*=\s*[`]reflect-oob-\$/.test(oob), 'wiring: the OOB reflect meter uses a UUID-shaped deterministic loop id')
  // S9b live-smoke fix: the cost passed to the billing RPC must be an INTEGER
  // (the RPC's cent params are INTEGER; a float 503s). Pin the handler rounds the
  // float cost, AND recordLoopBilling coerces defensively (closes the class).
  assert(/Math\.round\(\s*estimateCallCostCents/.test(disc), 'wiring: discernment metering rounds the float cost before the RPC')
  const lct2 = src('lib/loop-cost-tracker.ts')
  assert(/asInt\(params\.anthropicCostCents\)/.test(lct2) && /p_total_cents: asInt/.test(lct2), 'wiring: recordLoopBilling coerces cent params to integers (defensive; RPC integer contract)')
  // deterministicLoopId itself formats a sha256 into the 8-4-4-4-12 UUID layout
  // (source-grepped, not imported — importing loop-cost-tracker pulls the
  // stripe/supabase chain which needs env the bare battery does not load; the
  // shape is the load-bearing property). A local re-derivation confirms the
  // format is a valid UUID for a non-UUID seed.
  const lct = src('lib/loop-cost-tracker.ts')
  assert(/export function deterministicLoopId/.test(lct) && /slice\(0, 8\)[\s\S]{0,120}slice\(20, 32\)/.test(lct), 'deterministicLoopId: formats sha256 into 8-4-4-4-12 UUID layout')
  const h = createHash('sha256').update('discern|spawn|a:b@v1|task').digest('hex')
  const uuid = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid), 'deterministicLoopId derivation: non-UUID seed → valid UUID shape')

  const store = src('lib/substrate/trust-core/collaboration-store.ts')
  // The exact pre-fold call form must never return (the docstring may MENTION
  // patchByKey — the pin targets the CALL).
  assert(!store.includes('patchByKey(orchestratorAgentId, taskRef, { purpose_acknowledgement'), 'wiring: the ack write does NOT ride patchByKey (the PGRST204 false-success fold is closed)')
  assert(/recordPurposeAcknowledgement[\s\S]{0,900}\.update\(\{[\s\S]{0,200}purpose_acknowledgement: ack/.test(store), 'wiring: the ack write is a direct update that fails honest on ANY error')
}

console.log(`\nS9b practice-completion battery: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
