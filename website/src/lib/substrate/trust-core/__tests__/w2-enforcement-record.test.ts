/**
 * w2-enforcement-record.test.ts — Logos-on W2: the enforcement-class record
 * machinery (mentor verdicts L4, L5, L7; plan §3 W2 items 1–5).
 *
 * Plain-assertion script: npx tsx <this file>   (hermetic: the Supabase env is
 * deleted at open; the store runs against the in-memory fake).
 *
 * What is pinned here, by section:
 *   §1  the two verbatim texts (L7 clause byte-for-byte; L5's three statements)
 *   §2  EVENT_EFFECT row 'flag' + the PA-6 re-run: an enforcement entry moves NO
 *       domain (incl. oversight) at ANY starting level, in either direction
 *   §3  ground selection — L4's dual-recording rule, BOTH DIRECTIONS:
 *       other-directed-only cites correctly; co-occurring first-circle + other-
 *       directed cites ONLY the other-directed circle and reports the first-
 *       circle failure in its own lane; first-circle-only is never cited as
 *       ground; a no-violation deny names the verdict; a NEGATIVE sweep proves
 *       self_preservation can never enter ground.circles
 *   §4  the deriver — refusals (not a deny / unverifiable / source not
 *       producible), payload shape, artifact ref, NULL domain, regime
 *   §5  the emitter — flag-off zero store calls; unsigned refused; deny emits
 *       through the injected insert-only seam; correlation deterministic +
 *       agent-salted
 *   §6  the store — regime stamp flag-off/on (byte-identity by REFERENCE),
 *       enforcement events keep their own regime, no state row is ever folded,
 *       readEnforcementOutcomes projects/caps/counts, readOrientationReadings
 *       omits `regime` flag-off and serves it flag-on
 *   §7  the S10 composer — no new keys flag-off (byte-identical JSON), the
 *       three-state contract, inline clause + marker on every entry, capped
 *       notes both arms
 *   §8  the handler seam — flag-off: reader never called, no key; flag-on:
 *       entries served; outage: omitted + note
 *   §9  SOURCE pins — the route seam gates on both flags + 'do_not_proceed',
 *       resolves the CREDENTIAL's agent id and never passes the body agent_id;
 *       's11_intervention' has no producer; the emitter's only store call is
 *       the insert-only path
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { makeFakeSupabase } from './fake-supabase'
import {
  COMPLIANCE_NOT_VIRTUE_CLAUSE,
  ENFORCEMENT_CONTEXT_MARKER,
} from '../enforcement-clause'
import {
  computeEnforcementCorrelationId,
  deriveEnforcementRecord,
  emitEnforcementOutcomeTrustEvent,
  resolveEnforcementAgentId,
  selectEnforcementGround,
  ENFORCEMENT_SOURCES,
  FIRST_CIRCLE_MEASURE_ONLY_BOUND,
} from '../enforcement-record'
import { EVENT_EFFECT, applyTrustEvent } from '../trust-transition'
import { VIRTUE_TRUST_DOMAINS, initialEarnedDomainState } from '../types'
import type { TrustEvent, EarnedDomainState } from '../types'
import { PROXIMITY_RANK, SELF_PRESERVATION_CIRCLE } from '../constants'
import {
  emitLedgerOnlyTrustEvents,
  readEnforcementOutcomes,
  readOrientationReadings,
  stampRegime,
  ENFORCEMENT_OUTCOMES_ROW_CAP,
} from '../trust-core-store'
import { readTrustVerdict } from '../harness-integration'
import { composeTrustRecordPayload } from '../trust-record-payload'
import { ENFORCEMENT_RECORD_ENV_VAR } from '../trust-core-flag'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import {
  runTrustRecordGet,
  type TrustRecordDeps,
} from '@/app/api/trust-record/[agent_id]/handler'

// ── hermetic env pin ─────────────────────────────────────────────────────────
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY
delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
delete process.env[ENFORCEMENT_RECORD_ENV_VAR]
delete process.env.SUBSTRATE_ORIENTATION_READING_ENABLED

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

const NOW = new Date('2026-09-12T06:00:00.000Z')
const AGENT = 'sagereasoning:w2-test@v1'
const KEY_ID = 'substrate-layer2-2026Q2'

type Circle = {
  circle: string
  obligation_assessment?: { status: 'met' | 'violated' | 'indeterminate'; justification: string } | null
}
const violated = (circle: string, justification = `${circle} obligation violated`): Circle => ({
  circle,
  obligation_assessment: { status: 'violated', justification },
})
const met = (circle: string): Circle => ({
  circle,
  obligation_assessment: { status: 'met', justification: 'met' },
})

const fakeSigned = (
  circles: Circle[],
  opts: { signature?: string; proximity?: KatorthomaProximity; basis?: string | null } = {},
): SignedLayer2Assessment =>
  ({
    assessment: {
      katorthoma_proximity: opts.proximity ?? 'reflexive',
      virtue_domains_engaged: ['dikaiosyne'],
      oikeiosis: { relevant_circles: circles },
      ...(opts.basis !== undefined ? { proximity_floors: { basis: opts.basis } } : {}),
    },
    signature: opts.signature ?? 'sig-w2',
    key_id: KEY_ID,
    signed_at: NOW.toISOString(),
    canonicalization: 'sage-canonical-json-v1',
    algorithm: 'ed25519',
  }) as unknown as SignedLayer2Assessment

const verifyOk = () => ({ valid: true, key_id: KEY_ID }) as const
const verifyBad = () => ({ valid: false, reason: 'signature mismatch' }) as const

const baseInput = (signed: SignedLayer2Assessment, over: Partial<Parameters<typeof deriveEnforcementRecord>[0]> = {}) => ({
  agentId: AGENT,
  ownerUserId: 'owner-1',
  credentialRef: 'api_key:k1',
  signedAssessment: signed,
  source: 'guardrail_deny' as const,
  verdictRecommendation: 'do_not_proceed',
  verdictProximity: 'reflexive' as KatorthomaProximity,
  now: NOW,
  correlationId: 'enforce:test',
  verify: verifyOk,
  ...over,
})

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

async function main(): Promise<void> {
  // ==========================================================================
  // §1 — the verbatim texts
  // ==========================================================================
  eq(
    COMPLIANCE_NOT_VIRTUE_CLAUSE,
    'what this record shows under logos-on enforcement is compliance with rational structure, not ' +
      'constructed virtue. Enforced outcomes are not character evidence. The absence of violations ' +
      "under enforcement does not attest to the agent's virtue; it attests to the infrastructure's function.",
    '§1.1 COMPLIANCE_NOT_VIRTUE_CLAUSE is the mentor L7 text byte-for-byte',
  )
  assert(
    /produced under logos-on enforcement/i.test(ENFORCEMENT_CONTEXT_MARKER) &&
      /reasoning was not the proximate cause/i.test(ENFORCEMENT_CONTEXT_MARKER) &&
      /read in light of the enforcement context/i.test(ENFORCEMENT_CONTEXT_MARKER),
    '§1.2 ENFORCEMENT_CONTEXT_MARKER carries all three L5 statements',
  )
  assert(!/’/.test(COMPLIANCE_NOT_VIRTUE_CLAUSE), '§1.3 the clause uses the verbatim straight apostrophe')

  // ==========================================================================
  // §2 — EVENT_EFFECT + the PA-6 re-run
  // ==========================================================================
  eq(EVENT_EFFECT['enforcement-outcome'], 'flag', '§2.1 EVENT_EFFECT: enforcement-outcome → flag')
  {
    const levels = Object.keys(PROXIMITY_RANK) as KatorthomaProximity[]
    let identityChecks = 0
    for (const domain of VIRTUE_TRUST_DOMAINS) {
      for (const level of levels) {
        const prior: EarnedDomainState = {
          ...initialEarnedDomainState({ profilePrior: 'habitual', volatility: 'low' }),
          earnedLevel: level,
          lastDomainActivityAt: '2026-09-01T00:00:00.000Z',
          justiceFloorActive: domain === 'dikaiosyne',
        }
        const ev: TrustEvent = {
          agentId: AGENT,
          virtueDomain: domain,
          eventType: 'enforcement-outcome',
          artifactKind: 'signed_layer2_assessment',
          artifactRef: `signed:${KEY_ID}`,
          payload: { regime: 'logos-on-enforcement' },
          occurredAt: NOW.toISOString(),
        }
        const next = applyTrustEvent(prior, ev)
        if (
          next.earnedLevel === prior.earnedLevel &&
          next.lastDomainActivityAt === prior.lastDomainActivityAt &&
          next.justiceFloorActive === prior.justiceFloorActive &&
          next.reflectLastHonestAt === prior.reflectLastHonestAt &&
          (next.reflectLastScreenedAt ?? null) === (prior.reflectLastScreenedAt ?? null)
        ) {
          identityChecks++
        }
      }
    }
    eq(
      identityChecks,
      VIRTUE_TRUST_DOMAINS.length * levels.length,
      '§2.2 PA-6 re-run: enforcement-outcome is an identity on EVERY domain (incl. oversight) at EVERY level — no raise, no lower, no latch, no clock, no reflect stamp',
    )
    assert(VIRTUE_TRUST_DOMAINS.includes('oversight'), '§2.2b non-vacuity: the sweep included oversight')
  }

  // ==========================================================================
  // §3 — ground selection: L4's dual-recording rule, both directions
  // ==========================================================================
  {
    // (a) other-directed ONLY
    const a = selectEnforcementGround(
      fakeSigned([violated('local_community'), met('household')]).assessment,
      'do_not_proceed',
      'reflexive',
    )
    eq(a.ground.kind, 'other_directed', '§3.1 other-directed-only ⇒ ground kind other_directed')
    assert(
      a.ground.kind === 'other_directed' && a.ground.circles.length === 1 && a.ground.circles[0] === 'local_community',
      '§3.2 other-directed-only cites exactly the violated other-directed circle (a met circle is not a ground)',
    )
    eq(a.firstCircle, null, '§3.3 other-directed-only ⇒ NO first-circle lane')

    // (b) CO-OCCURRING: first-circle failure + other-directed violation
    const b = selectEnforcementGround(
      fakeSigned([violated(SELF_PRESERVATION_CIRCLE, 'assented under task pressure'), violated('political_community')])
        .assessment,
      'do_not_proceed',
      'reflexive',
    )
    eq(b.ground.kind, 'other_directed', '§3.4 co-occurring ⇒ the OTHER-DIRECTED trigger is the cited ground')
    assert(
      b.ground.kind === 'other_directed' &&
        b.ground.circles.length === 1 &&
        b.ground.circles[0] === 'political_community' &&
        !b.ground.circles.includes(SELF_PRESERVATION_CIRCLE),
      '§3.5 co-occurring: self_preservation is NOT in ground.circles — the block is justified by the circle-2–4 obligation',
    )
    assert(
      b.firstCircle !== null &&
        b.firstCircle.circle === SELF_PRESERVATION_CIRCLE &&
        b.firstCircle.obligationStatus === 'violated' &&
        b.firstCircle.justification === 'assented under task pressure' &&
        b.firstCircle.coOccurringWithOtherDirected === true &&
        b.firstCircle.bound === FIRST_CIRCLE_MEASURE_ONLY_BOUND,
      '§3.6 co-occurring: the first-circle failure is recorded in ITS OWN lane, measure-only, with its bound',
    )

    // (c) FIRST-CIRCLE ONLY — the class L4 forbids enforcing on
    const c = selectEnforcementGround(
      fakeSigned([violated(SELF_PRESERVATION_CIRCLE)]).assessment,
      'do_not_proceed',
      'reflexive',
    )
    eq(c.ground.kind, 'no_other_directed_ground', '§3.7 first-circle-only ⇒ ground is no_other_directed_ground, NEVER the self circle')
    assert(
      c.ground.kind === 'no_other_directed_ground' && /first-circle finding stands alone/.test(c.ground.basis),
      '§3.8 first-circle-only: the basis names the separate lane explicitly',
    )
    assert(c.firstCircle !== null && c.firstCircle.coOccurringWithOtherDirected === false, '§3.9 first-circle-only: the lane is populated and marked non-co-occurring')

    // (d) NO violated circle at all — a kathekon-floor / proximity deny
    const d = selectEnforcementGround(fakeSigned([met('household')]).assessment, 'do_not_proceed', 'reflexive')
    eq(d.ground.kind, 'no_other_directed_ground', '§3.10 no violation ⇒ no_other_directed_ground')
    assert(
      d.ground.kind === 'no_other_directed_ground' && /recommendation do_not_proceed, proximity reflexive/.test(d.ground.basis),
      '§3.11 no violation: the basis names the verdict the block rested on',
    )
    eq(d.firstCircle, null, '§3.12 no violation ⇒ no first-circle lane')

    // (e) strict identity + dedup
    const e = selectEnforcementGround(
      fakeSigned([
        violated(''),
        violated('household'),
        violated('household'),
        { circle: 'cosmopolis', obligation_assessment: null },
      ]).assessment,
      'do_not_proceed',
      'reflexive',
    )
    assert(
      e.ground.kind === 'other_directed' && e.ground.circles.length === 1 && e.ground.circles[0] === 'household',
      '§3.13 a nameless circle is never an other party (strict); duplicate circles deduplicate; a null obligation is not a violation',
    )

    // (f) NEGATIVE SWEEP — self_preservation can never enter ground.circles,
    //     whatever it is combined with, wherever it sits in the list.
    const others = ['household', 'local_community', 'political_community', 'cosmopolis']
    let sweeps = 0
    let leaks = 0
    for (const o of others) {
      for (const order of [0, 1]) {
        const list = order === 0 ? [violated(SELF_PRESERVATION_CIRCLE), violated(o)] : [violated(o), violated(SELF_PRESERVATION_CIRCLE)]
        const g = selectEnforcementGround(fakeSigned(list).assessment, 'do_not_proceed', 'reflexive')
        sweeps++
        if (g.ground.kind === 'other_directed' && g.ground.circles.includes(SELF_PRESERVATION_CIRCLE)) leaks++
        if (g.ground.kind !== 'other_directed' || g.ground.circles.length !== 1 || g.ground.circles[0] !== o) leaks++
      }
    }
    eq(sweeps, 8, '§3.14 negative sweep ran all 8 combinations (non-vacuity)')
    eq(leaks, 0, '§3.15 NEGATIVE: self_preservation never appears in ground.circles in any position; the other-directed circle is always the sole cited ground')
  }

  // ==========================================================================
  // §4 — the deriver
  // ==========================================================================
  {
    const notDeny = deriveEnforcementRecord(baseInput(fakeSigned([violated('household')]), { verdictRecommendation: 'pause_for_review' }))
    assert(notDeny.enforcement === null && notDeny.refusal === 'not_a_deny' && notDeny.firstCircleFinding === null, '§4.1 a caution is not enforcement — no entry, refusal not_a_deny')

    const bad = deriveEnforcementRecord(baseInput(fakeSigned([violated('household')]), { verify: verifyBad }))
    assert(bad.enforcement === null && bad.refusal === 'unverifiable_artifact', '§4.2 unverifiable artifact ⇒ no entry (R18f-parallel)')

    const s11 = deriveEnforcementRecord(baseInput(fakeSigned([violated('household')]), { source: 's11_intervention' }))
    assert(s11.enforcement === null && s11.refusal === 'source_not_yet_producible', '§4.3 s11_intervention is declared but NOT producible — the flip is a separate, later, founder-walked step')
    assert(ENFORCEMENT_SOURCES.length === 2 && ENFORCEMENT_SOURCES.includes('s11_intervention'), '§4.3b the vocabulary still DECLARES the S11 source (so the record shape is ready at the flip)')

    const ok = deriveEnforcementRecord(baseInput(fakeSigned([violated(SELF_PRESERVATION_CIRCLE), violated('household')], { basis: 'unity-thesis minimum: floored by dikaiosyne=reflexive' })))
    assert(ok.enforcement !== null && ok.refusal === null, '§4.4 a verified deny derives an entry')
    if (ok.enforcement) {
      const ev = ok.enforcement
      eq(ev.eventType, 'enforcement-outcome', '§4.5 event type')
      eq(ev.virtueDomain, null, '§4.6 virtue_domain NULL — evidence for no domain')
      eq(ev.artifactKind, 'signed_layer2_assessment', '§4.7 artifact kind')
      eq(ev.artifactRef, `signed:${KEY_ID}`, '§4.8 artifact ref names the verifying key')
      eq(ev.correlationId, 'enforce:test', '§4.9 correlation passthrough')
      eq(ev.occurredAt, NOW.toISOString(), '§4.10 occurred_at = injected now')
      eq(ev.ownerUserId, 'owner-1', '§4.11 owner passthrough')
      eq(ev.credentialRef, 'api_key:k1', '§4.12 credential ref passthrough')
      eq(ev.payload.regime, 'logos-on-enforcement', '§4.13 regime marker logos-on-enforcement')
      eq(ev.payload.enforcementSource, 'guardrail_deny', '§4.14 source guardrail_deny')
      eq(ev.payload.enforcementContextMarker, ENFORCEMENT_CONTEXT_MARKER, '§4.15 the L5 marker rides inline on the ledger row')
      eq(ev.payload.complianceNotVirtueClause, COMPLIANCE_NOT_VIRTUE_CLAUSE, '§4.16 the L7 clause rides inline on the ledger row')
      eq(ev.payload.verdictRecommendation, 'do_not_proceed', '§4.17 verdict recommendation')
      eq(ev.payload.verdictProximity, 'reflexive', '§4.18 verdict proximity')
      eq(ev.payload.proximityFloorsBasis, 'unity-thesis minimum: floored by dikaiosyne=reflexive', '§4.19 floors basis carried for reproducibility')
      const g = ev.payload.enforcementGround
      assert(
        g !== undefined && g.kind === 'other_directed' && g.circles.length === 1 && g.circles[0] === 'household',
        '§4.20 DUAL RECORDING, direction 1: the ledger entry cites ONLY the other-directed circle',
      )
      assert(!JSON.stringify(ev.payload.enforcementGround).includes(SELF_PRESERVATION_CIRCLE), '§4.21 DUAL RECORDING: the self circle appears nowhere in the enforcement ground')
      assert(ok.firstCircleFinding !== null && ok.firstCircleFinding.coOccurringWithOtherDirected, '§4.22 DUAL RECORDING, direction 2: the first-circle failure is returned in its own lane')
      assert(!('firstCircleFinding' in ev.payload) && !('firstCircle' in ev.payload), '§4.23 the first-circle lane is NOT folded into the enforcement entry payload')
    }
    const noBasis = deriveEnforcementRecord(baseInput(fakeSigned([violated('household')])))
    assert(noBasis.enforcement !== null && noBasis.enforcement.payload.proximityFloorsBasis === null, '§4.24 absent proximity_floors ⇒ basis null, never fabricated')
  }

  // ==========================================================================
  // §5 — the emitter
  // ==========================================================================
  {
    const calls: TrustEvent[][] = []
    const emitSpy = async (events: TrustEvent[]) => {
      calls.push(events)
      return { ok: true, value: { written: events.length } }
    }
    const input = {
      agentId: AGENT,
      credentialId: 'k1',
      ownerUserId: null,
      signedAssessment: fakeSigned([violated('household')]),
      verdictRecommendation: 'do_not_proceed',
      verdictProximity: 'reflexive' as KatorthomaProximity,
      now: NOW,
      emit: emitSpy,
      verify: verifyOk,
    }

    // flag-off (both unset)
    let r = await emitEnforcementOutcomeTrustEvent(input)
    assert(!r.emitted && r.reason === 'flag_off' && calls.length === 0, '§5.1 both flags unset ⇒ nothing emitted, ZERO store calls')
    process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true'
    r = await emitEnforcementOutcomeTrustEvent(input)
    assert(!r.emitted && r.reason === 'flag_off' && calls.length === 0, '§5.2 trust core on but W2 flag unset ⇒ still nothing (dedicated flag)')
    process.env[ENFORCEMENT_RECORD_ENV_VAR] = 'true'

    r = await emitEnforcementOutcomeTrustEvent({ ...input, signedAssessment: { assessment: {}, signature: '', key_id: KEY_ID } })
    assert(!r.emitted && r.reason === 'no_signed_assessment' && calls.length === 0, '§5.3 unsigned ⇒ refused, no store call')
    r = await emitEnforcementOutcomeTrustEvent({ ...input, signedAssessment: null })
    assert(!r.emitted && r.reason === 'no_signed_assessment', '§5.4 null artifact ⇒ refused')
    r = await emitEnforcementOutcomeTrustEvent({ ...input, verdictRecommendation: 'proceed_with_caution' })
    assert(!r.emitted && r.reason === 'not_a_deny' && calls.length === 0, '§5.5 non-deny ⇒ refused at the deriver, no store call')

    r = await emitEnforcementOutcomeTrustEvent(input)
    assert(r.emitted && r.reason === null && calls.length === 1 && calls[0].length === 1, '§5.6 a deny emits exactly one event through the injected insert-only seam')
    if (calls.length === 1) {
      const ev = calls[0][0]
      eq(ev.correlationId, computeEnforcementCorrelationId(AGENT, 'sig-w2'), '§5.7 correlation = enforce:<sha256(agentId|signature)> — deterministic')
      eq(ev.credentialRef, 'api_key:k1', '§5.8 credential ref api_key:<id>')
      assert((ev.correlationId ?? '').startsWith('enforce:'), '§5.9 correlation prefix enforce:')
    }
    assert(
      computeEnforcementCorrelationId('sagereasoning:a@v1', 'sig') !== computeEnforcementCorrelationId('sagereasoning:b@v1', 'sig'),
      '§5.10 correlation is AGENT-SALTED (two agents, one signature ⇒ two keys; the uq_ate_correlation index has no agent_id column)',
    )
    // co-occurring case through the emitter: the lane is RETURNED, and the
    // ledgered event still cites only the other-directed circle
    calls.length = 0
    r = await emitEnforcementOutcomeTrustEvent({ ...input, signedAssessment: fakeSigned([violated(SELF_PRESERVATION_CIRCLE), violated('cosmopolis')]) })
    assert(r.emitted && r.firstCircleFinding !== null && r.firstCircleFinding.coOccurringWithOtherDirected, '§5.11 emitter returns the first-circle lane on the co-occurring case')
    assert(
      calls.length === 1 &&
        calls[0][0].payload.enforcementGround?.kind === 'other_directed' &&
        !JSON.stringify(calls[0][0].payload).includes(SELF_PRESERVATION_CIRCLE),
      '§5.12 …and the LEDGERED event carries no trace of the self circle',
    )
    // never throws
    const thrower = async () => {
      throw new Error('store down')
    }
    r = await emitEnforcementOutcomeTrustEvent({ ...input, emit: thrower })
    assert(!r.emitted && r.reason === 'threw', '§5.13 a throwing store never propagates (the verdict is never affected)')
    delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
    delete process.env[ENFORCEMENT_RECORD_ENV_VAR]
  }

  // ==========================================================================
  // §6 — the store
  // ==========================================================================
  {
    const plain: TrustEvent = {
      agentId: AGENT,
      virtueDomain: 'phronesis',
      eventType: 'credential-completed',
      artifactKind: 'signed_layer2_assessment',
      artifactRef: `signed:${KEY_ID}`,
      payload: { demonstratedProximity: 'deliberate' },
      occurredAt: NOW.toISOString(),
      correlationId: 'accr:1',
    }
    // flag-off: the SAME object reference comes back (byte-identity by construction)
    assert(stampRegime(plain) === plain.payload, '§6.1 flag-off: stampRegime returns the caller’s payload object by REFERENCE (no stamp, no copy)')
    assert(!('regime' in plain.payload), '§6.2 flag-off: no regime key')
    process.env[ENFORCEMENT_RECORD_ENV_VAR] = 'true'
    const stamped = stampRegime(plain)
    eq(stamped.regime, 'practice-on', '§6.3 flag-on: an examination event is stamped practice-on')
    assert(stamped !== plain.payload && !('regime' in plain.payload), '§6.4 flag-on: the caller’s object is never mutated')
    const enf: TrustEvent = { ...plain, virtueDomain: null, eventType: 'enforcement-outcome', payload: { regime: 'logos-on-enforcement' }, correlationId: 'enforce:1' }
    eq(stampRegime(enf).regime, 'logos-on-enforcement', '§6.5 flag-on: an enforcement event keeps its own regime')
    delete process.env[ENFORCEMENT_RECORD_ENV_VAR]

    // through the real insert-only path against the fake
    const fake = makeFakeSupabase()
    process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true'
    let res = await emitLedgerOnlyTrustEvents([plain], fake.client)
    assert(res.ok && res.value.written === 1, '§6.6 flag-off insert-only write lands')
    assert(!('regime' in (fake.tables.agent_trust_events[0].payload as object)), '§6.7 flag-off: the WRITTEN row carries no regime key (byte-identical rows)')
    process.env[ENFORCEMENT_RECORD_ENV_VAR] = 'true'
    res = await emitLedgerOnlyTrustEvents([{ ...plain, correlationId: 'accr:2' }, enf], fake.client)
    assert(res.ok && res.value.written === 2, '§6.8 flag-on: two rows written')
    const rows = fake.tables.agent_trust_events as { event_type: string; payload: Record<string, unknown> }[]
    eq(rows.find((r) => r.event_type === 'credential-completed' && (r.payload as { regime?: string }).regime)?.payload.regime, 'practice-on', '§6.9 flag-on: the examination row is stamped practice-on at the chokepoint')
    eq(rows.find((r) => r.event_type === 'enforcement-outcome')?.payload.regime, 'logos-on-enforcement', '§6.10 flag-on: the enforcement row keeps logos-on-enforcement')
    eq(fake.tables.agent_trust_state.length, 0, '§6.11 insert-only: NO state row was ever folded from an enforcement entry')
    // idempotency
    res = await emitLedgerOnlyTrustEvents([enf], fake.client)
    assert(res.ok && res.value.written === 0 && rows.filter((r) => r.event_type === 'enforcement-outcome').length === 1, '§6.12 a retried enforcement write dedupes on correlation (one deny, one entry)')

    // readEnforcementOutcomes
    const fake2 = makeFakeSupabase()
    const mk = (i: number, ground: 'other_directed' | 'no_other_directed_ground') => ({
      id: `e-${i}`,
      agent_id: AGENT,
      virtue_domain: null,
      event_type: 'enforcement-outcome',
      artifact_kind: 'signed_layer2_assessment',
      artifact_ref: `signed:${KEY_ID}`,
      payload: {
        regime: 'logos-on-enforcement',
        enforcementSource: 'guardrail_deny',
        enforcementGround: ground === 'other_directed' ? { kind: ground, circles: ['household'], obligationStatus: 'violated' } : { kind: ground, basis: 'verdict' },
        verdictRecommendation: 'do_not_proceed',
        complianceNotVirtueClause: COMPLIANCE_NOT_VIRTUE_CLAUSE,
      },
      occurred_at: new Date(NOW.getTime() - i * 60_000).toISOString(),
      correlation_id: `enforce:${i}`,
      created_at: NOW.toISOString(),
      retain_until: '2027-01-01T00:00:00.000Z',
    })
    fake2.tables.agent_trust_events.push(mk(1, 'other_directed'), mk(2, 'no_other_directed_ground'))
    // an unrelated agent's + an unrelated type's rows must not leak in
    fake2.tables.agent_trust_events.push({ ...mk(3, 'other_directed'), agent_id: 'sagereasoning:other@v1', correlation_id: 'enforce:x' })
    fake2.tables.agent_trust_events.push({ ...mk(4, 'other_directed'), event_type: 'orientation-reading-toward', correlation_id: 'orient:x' })
    const rd = await readEnforcementOutcomes(AGENT, fake2.client)
    assert(rd.ok && rd.value.entries.length === 2 && !rd.value.capped && rd.value.totalCount === 2, '§6.13 reader returns this agent’s enforcement rows only, uncapped, exact total')
    if (rd.ok) {
      eq(rd.value.entries[0].groundKind, 'other_directed', '§6.14 newest first; ground kind projected via the nested JSON path')
      eq(rd.value.entries[1].groundKind, 'no_other_directed_ground', '§6.15 second entry ground kind')
      eq(rd.value.entries[0].source, 'guardrail_deny', '§6.16 source projected')
      eq(rd.value.entries[0].verdictRecommendation, 'do_not_proceed', '§6.17 verdict projected')
      eq(rd.value.entries[0].regime, 'logos-on-enforcement', '§6.18 regime served as logos-on-enforcement')
    }
    for (let i = 10; i < 10 + ENFORCEMENT_OUTCOMES_ROW_CAP; i++) fake2.tables.agent_trust_events.push(mk(i, 'other_directed'))
    const capped = await readEnforcementOutcomes(AGENT, fake2.client)
    assert(capped.ok && capped.value.capped && capped.value.entries.length === ENFORCEMENT_OUTCOMES_ROW_CAP && capped.value.totalCount === ENFORCEMENT_OUTCOMES_ROW_CAP + 2, '§6.19 over the cap: capped:true, CAP entries, honest exact total (probe-one-extra + head count)')
    const missing = await readEnforcementOutcomes(AGENT, makeFakeSupabase({ missingTables: true }).client)
    assert(missing.ok && missing.value.entries.length === 0 && missing.value.totalCount === 0, '§6.20 missing table ⇒ benign empty (the data-rights posture)')

    // readOrientationReadings: regime absent flag-off, present flag-on
    const fake3 = makeFakeSupabase()
    fake3.tables.agent_trust_events.push({
      id: 'o-1', agent_id: AGENT, virtue_domain: null, event_type: 'orientation-reading-toward', artifact_kind: 'signed_layer2_assessment', artifact_ref: `signed:${KEY_ID}`,
      payload: { orientationReading: 'toward', orientationDeliveryClass: 'examined' }, occurred_at: NOW.toISOString(), correlation_id: 'orient:1', created_at: NOW.toISOString(), retain_until: '2027-01-01T00:00:00.000Z',
    })
    delete process.env[ENFORCEMENT_RECORD_ENV_VAR]
    const oOff = await readOrientationReadings(AGENT, fake3.client)
    assert(oOff.ok && oOff.value.entries.length === 1 && !('regime' in oOff.value.entries[0]), '§6.21 flag-off: an orientation entry carries NO regime key (byte-identical)')
    process.env[ENFORCEMENT_RECORD_ENV_VAR] = 'true'
    const oOn = await readOrientationReadings(AGENT, fake3.client)
    assert(oOn.ok && oOn.value.entries[0].regime === 'practice-on', '§6.22 flag-on: an un-stamped (pre-flag) orientation row is served practice-on')
    delete process.env[ENFORCEMENT_RECORD_ENV_VAR]
    delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
  }

  // ==========================================================================
  // §7 — the S10 composer
  // ==========================================================================
  {
    process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true'
    const fake = makeFakeSupabase()
    fake.tables.agent_trust_state.push({
      agent_id: AGENT, virtue_domain: 'phronesis', owner_user_id: null, credential_ref: null, earned_level: 'deliberate', profile_prior: 'habitual',
      volatility_rating: 'low', last_domain_activity_at: NOW.toISOString(), reflect_last_honest_at: null, justice_floor_active: false, coverage_status: null,
      updated_at: NOW.toISOString(), retain_until: '2027-01-01T00:00:00.000Z',
    })
    const verdict = await readTrustVerdict(AGENT, { taskHasJusticeSurface: false, now: NOW, client: fake.client })
    assert(!verdict.dark && verdict.profile !== null, '§7.0 a live verdict through the fake store')
    const base = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW })
    const off = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW })
    eq(JSON.stringify(off), JSON.stringify(base), '§7.1 undefined slice ⇒ byte-identical JSON (no new keys, no new notes)')
    assert(!('enforcement_outcomes' in off.record) && !('total_enforcement_outcomes_count' in off.record), '§7.2 flag-off: neither key present')

    const nul = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW, enforcementOutcomes: null })
    assert(!('enforcement_outcomes' in nul.record) && nul.notes.some((n) => n.includes('enforcement outcomes unavailable')), '§7.3 null slice ⇒ key omitted + honest outage note')

    const on = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      generatedAt: NOW,
      enforcementOutcomes: {
        entries: [
          { occurredAt: NOW.toISOString(), source: 'guardrail_deny', groundKind: 'other_directed', verdictRecommendation: 'do_not_proceed' },
          { occurredAt: NOW.toISOString(), source: null, groundKind: 'garbage', verdictRecommendation: null },
        ],
        capped: false,
        totalCount: 2,
      },
    })
    const entries = on.record.enforcement_outcomes ?? []
    eq(entries.length, 2, '§7.4 entries served')
    eq(on.record.total_enforcement_outcomes_count, 2, '§7.5 total served')
    eq(entries[0].compliance_not_virtue_clause, COMPLIANCE_NOT_VIRTUE_CLAUSE, '§7.6 EVERY entry carries the L7 clause inline')
    eq(entries[1].compliance_not_virtue_clause, COMPLIANCE_NOT_VIRTUE_CLAUSE, '§7.6b …the second too')
    eq(entries[0].context_marker, ENFORCEMENT_CONTEXT_MARKER, '§7.7 every entry carries the L5 context marker inline')
    eq(entries[0].regime, 'logos-on-enforcement', '§7.8 regime on the wire')
    eq(entries[0].class, 'enforcement', '§7.9 class enforcement')
    eq(entries[0].ground_kind, 'other_directed', '§7.10 ground kind served')
    eq(entries[1].ground_kind, 'unknown', '§7.11 an unrecognised ground kind is served as unknown, never invented')
    eq(entries[1].source, 'unknown', '§7.12 a null source is served as unknown')
    assert(on.notes.some((n) => n.includes('An empty list does not attest')), '§7.13 the slice-level note names the mirror problem (thin evidence under enforcement ≠ absent competence)')
    assert(!JSON.stringify(on.record.enforcement_outcomes).includes('household'), '§7.14 no circle list is served (ground KIND only — state-fold-only posture)')

    const cappedKnown = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW, enforcementOutcomes: { entries: [], capped: true, totalCount: 77 } })
    assert(cappedKnown.notes.some((n) => /shows the 0 most recent of 77/.test(n)), '§7.15 capped + total known ⇒ "showing N of M"')
    const cappedUnknown = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW, enforcementOutcomes: { entries: [], capped: true, totalCount: null } })
    assert(cappedUnknown.notes.some((n) => /total count was unavailable/.test(n)) && !('total_enforcement_outcomes_count' in cappedUnknown.record), '§7.16 capped + total unknown ⇒ honest note, count OMITTED never fabricated')
    assert(JSON.stringify(on.envelope) === JSON.stringify(base.envelope), '§7.17 the ENVELOPE is unchanged by this build — the record-level clause is STAGED for R18 sign-off, not applied')
    assert(!JSON.stringify(on.envelope).includes('compliance with rational structure'), '§7.18 …and the clause text is not in the envelope yet (non-vacuity of §7.17)')

    // ========================================================================
    // §8 — the handler seam
    // ========================================================================
    let readerCalls = 0
    const mkDeps = (flagOn: boolean, outcome: 'ok' | 'fail'): TrustRecordDeps => ({
      isSurfaceEnabled: () => true,
      isCoreEnabled: () => true,
      readVerdict: () => readTrustVerdict(AGENT, { taskHasJusticeSurface: false, now: NOW, client: fake.client }),
      readReflectSummary: async () => ({ ok: true, value: { honestReflectCount: 0, latestHonestReflectAt: null } }),
      isEnforcementRecordEnabled: () => flagOn,
      readEnforcementOutcomes: async () => {
        readerCalls++
        return outcome === 'ok'
          ? { ok: true, value: { entries: [{ occurredAt: NOW.toISOString(), source: 'guardrail_deny', groundKind: 'other_directed', verdictRecommendation: 'do_not_proceed' }], capped: false, totalCount: 1 } }
          : { ok: false, error: 'boom' }
      },
      now: () => NOW,
    })
    const resOff = await runTrustRecordGet(AGENT, mkDeps(false, 'ok'))
    const bodyOff = (await resOff.json()) as { data: { record: Record<string, unknown> } }
    assert(resOff.status === 200 && readerCalls === 0 && !('enforcement_outcomes' in bodyOff.data.record), '§8.1 flag-off: the reader is NEVER called and no key is served')
    const resOn = await runTrustRecordGet(AGENT, mkDeps(true, 'ok'))
    const bodyOn = (await resOn.json()) as { data: { record: { enforcement_outcomes?: unknown[]; total_enforcement_outcomes_count?: number } } }
    assert(resOn.status === 200 && readerCalls === 1 && bodyOn.data.record.enforcement_outcomes?.length === 1 && bodyOn.data.record.total_enforcement_outcomes_count === 1, '§8.2 flag-on: entries + total served')
    const resFail = await runTrustRecordGet(AGENT, mkDeps(true, 'fail'))
    const bodyFail = (await resFail.json()) as { data: { record: Record<string, unknown>; notes: string[] } }
    assert(resFail.status === 200 && !('enforcement_outcomes' in bodyFail.data.record) && bodyFail.data.notes.some((n) => n.includes('enforcement outcomes unavailable')), '§8.3 flag-on outage: record still 200, key omitted, honest note')
    delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
  }

  // ==========================================================================
  // §9 — SOURCE pins (comment-stripped)
  // ==========================================================================
  {
    const routeSrc = readFileSync(join(__dirname, '..', '..', '..', '..', 'app', 'api', 'guardrail', 'route.ts'), 'utf-8')
    const routeCode = stripComments(routeSrc)
    const seamStart = routeCode.indexOf('emitEnforcementOutcomeTrustEvent({')
    assert(seamStart > 0, '§9.1 the route carries the enforcement seam')
    const seamBlock = routeCode.slice(routeCode.lastIndexOf('const enforcementSigned', seamStart), routeCode.indexOf('})', seamStart) + 2)
    assert(/isTrustCoreEnabled\(\)\s*&&\s*isEnforcementRecordEnabled\(\)/.test(seamBlock), '§9.2 the seam gates on BOTH flags')
    assert(/recommendation === 'do_not_proceed'/.test(seamBlock), '§9.3 the seam fires ONLY on do_not_proceed')
    assert(/resolveCredentialContext\(keyCheck\.api_key_id\)/.test(seamBlock) && /resolveEnforcementAgentId\(/.test(seamBlock), '§9.4 the agent identity comes from the credential context through the pure resolveEnforcementAgentId helper')
    // PR19 fold (2026-09-12, HIGH, proven by live mutation): the first draft
    // pinned two literal shapes and was defeated by `enfCredCtx.agent_id ?? agent_id`.
    // Now: (a) the seam block may not contain the bare identifier `agent_id`
    // (the request's body field) ANYWHERE — not as a fallback, not in an
    // expression; (b) the emitted agentId must be exactly the helper's result
    // with no `??`/`||` on that line; (c) the helper itself is runtime-tested
    // in §10 below, so the guarantee no longer rests on a regex alone.
    assert(!/(^|[^.\w])agent_id\b/.test(seamBlock), '§9.5a the seam block never mentions the request body agent_id identifier at all (consumer-unforgeable — no fallback path can exist)')
    const agentIdLine = seamBlock.split('\n').find((l) => /agentId:/.test(l)) ?? ''
    assert(/agentId:\s*enforcementAgentId,\s*$/.test(agentIdLine) && !/\?\?|\|\|/.test(agentIdLine), '§9.5b the emitted agentId is exactly the helper result, no fallback operator on the line')
    assert(!/source:/.test(seamBlock), '§9.6 the route passes no source — the emitter hardcodes guardrail_deny')
    assert(/enforcementSigned/.test(seamBlock) && /outcome\.status === 'verdict'/.test(routeCode), '§9.7 only a VERDICT outcome’s signed artifact reaches the emitter')

    const modSrc = stripComments(readFileSync(join(__dirname, '..', 'enforcement-record.ts'), 'utf-8'))
    assert(!/source:\s*'s11_intervention'/.test(modSrc) && !/enforcementSource:\s*'s11_intervention'/.test(modSrc), '§9.8 no code path produces s11_intervention (declared only)')
    assert(/source:\s*'guardrail_deny'/.test(modSrc), '§9.8b non-vacuity: the guardrail_deny producer IS in the code')
    assert(/emitLedgerOnlyTrustEvents/.test(modSrc) && !/\bemitTrustEvents\b/.test(modSrc), '§9.9 the emitter’s only store path is the INSERT-ONLY one (never the folding emitTrustEvents)')
    assert(!/intervention-engine/.test(modSrc), '§9.10 the record module does not import the intervention engine (W2 records; it does not enforce)')

    const engineSrc = stripComments(readFileSync(join(__dirname, '..', 'intervention-engine.ts'), 'utf-8'))
    assert(!/enforcement-record|enforcementGround|firstCircle/i.test(engineSrc), '§9.11 the intervention engine consumes nothing from the record machinery (§W3 direction preserved)')

    const clauseSrc = readFileSync(join(__dirname, '..', 'enforcement-clause.ts'), 'utf-8')
    assert(!/^\s*import /m.test(clauseSrc), '§9.12 enforcement-clause.ts is a zero-import module (the pure composer stays pure)')
  }

  // ==========================================================================
  // §10 — RUNTIME pins for the identity choice (PR19 fold, HIGH) + stampRegime
  // ==========================================================================
  {
    eq(resolveEnforcementAgentId({ agent_id: null }), null, '§10.1 a credential with NO bound agent id ⇒ null ⇒ no entry (the exact case the defeated pin left open)')
    eq(resolveEnforcementAgentId({ agent_id: 'sagereasoning:w2-test@v1' }), 'sagereasoning:w2-test@v1', '§10.2 an accepted bound id passes through')
    eq(resolveEnforcementAgentId({ agent_id: 'not an id at all!!' }), null, '§10.3 an unaccepted bound id ⇒ null')
    eq(resolveEnforcementAgentId({ agent_id: '' }), null, '§10.4 empty ⇒ null')
    // Structural: the helper's ONLY parameter is the credential context — there
    // is no argument through which a body agent_id could be passed. Pinned on
    // the function's arity and its comment-stripped source.
    eq(resolveEnforcementAgentId.length, 1, '§10.5 the helper takes exactly one parameter (the credential context)')
    const modCode = stripComments(readFileSync(join(__dirname, '..', 'enforcement-record.ts'), 'utf-8'))
    const helperBody = modCode.slice(modCode.indexOf('export function resolveEnforcementAgentId'), modCode.indexOf('export function computeEnforcementCorrelationId'))
    assert(helperBody.length > 50 && !/\?\?|\|\|/.test(helperBody) && /isAcceptedAgentId\(/.test(helperBody), '§10.6 the helper body carries no fallback operator and checks the accepted vocabulary')

    // §6.4 residual (PR19 LOW): stampRegime never mutates its input on ANY branch.
    process.env[ENFORCEMENT_RECORD_ENV_VAR] = 'true'
    const pre: TrustEvent = {
      agentId: AGENT, virtueDomain: null, eventType: 'enforcement-outcome', artifactKind: 'signed_layer2_assessment',
      artifactRef: `signed:${KEY_ID}`, payload: { regime: 'logos-on-enforcement', enforcementSource: 'guardrail_deny' }, occurredAt: NOW.toISOString(),
    }
    const snapshot = JSON.stringify(pre.payload)
    const outA = stampRegime(pre)
    const un: TrustEvent = { ...pre, payload: { demonstratedProximity: 'deliberate' } }
    const unSnapshot = JSON.stringify(un.payload)
    const outB = stampRegime(un)
    assert(JSON.stringify(pre.payload) === snapshot && JSON.stringify(un.payload) === unSnapshot, '§10.7 stampRegime never mutates the caller’s payload on the already-stamped OR the stamping branch')
    assert(outA === pre.payload && outB !== un.payload && outB.regime === 'practice-on', '§10.8 already-stamped ⇒ same reference; stamping ⇒ a new object')
    delete process.env[ENFORCEMENT_RECORD_ENV_VAR]
  }

  console.log(`\nW2 enforcement-record battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
