/**
 * orientation-trust-events.test.ts — the C1c battery (agent-circles, 2026-08-08).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic (Supabase env deleted up
 * front; the store legs run on the in-memory fake). Pins:
 *
 *   §1  deriveOrientationReadingEvent — R18f-parallel (unverifiable ⇒ null),
 *       the event shape (NULL domain, flag effect, signed_layer2_assessment
 *       artifact, correlation passthrough), the payload (reading/basis/bounds/
 *       capped observation spans/generativePrompt population).
 *   §2  EVENT_EFFECT — all three orientation types are 'flag', and folding one
 *       through applyTrustEvent changes NOTHING (the no-op reading pinned).
 *   §3  emitLedgerOnlyTrustEvents — INSERT-ONLY: ledger row lands,
 *       agent_trust_state is NEVER touched, idempotent under the unique index,
 *       loud + returned on failure (PA-7).
 *   §4  THE NULL-DOMAIN TRAP (the load-bearing pin): a non-reflect null-domain
 *       event pushed through the GENERIC emitTrustEvents must NOT stamp a
 *       reflect timestamp — applyReflectAcrossDomains refuses it loudly.
 *       NON-VACUOUS: the same leg proves a genuine reflect event DOES stamp
 *       (the guard discriminates, it does not disable).
 *   §5  emitOrientationReadingTrustEvent — flag-off ⇒ zero client calls;
 *       supplied extraction ⇒ refused before any DB touch; missing/empty
 *       signature ⇒ no-op.
 */

import { makeFakeSupabase } from './fake-supabase'
import {
  deriveOrientationReadingEvent,
} from '../derive-trust-events'
import { EVENT_EFFECT, applyTrustEvent } from '../trust-transition'
import {
  emitLedgerOnlyTrustEvents,
  emitTrustEvents,
  readOrientationReadings,
  ORIENTATION_READINGS_ROW_CAP,
} from '../trust-core-store'
import { emitOrientationReadingTrustEvent } from '../emission-hooks'
import { ORIENTATION_READING_BOUNDS } from '@/lib/translation-sandwich/orientation-reading'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type { TrustEvent, EarnedDomainState } from '../types'

// ── hermetic env pin ─────────────────────────────────────────────────────────
const SAVED_ENV: Record<string, string | undefined> = {
  SUBSTRATE_TRUST_CORE_ENABLED: process.env.SUBSTRATE_TRUST_CORE_ENABLED,
  SUBSTRATE_ORIENTATION_READING_ENABLED: process.env.SUBSTRATE_ORIENTATION_READING_ENABLED,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY
delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
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

const NOW = new Date('2026-08-08T10:00:00.000Z')

const fakeSigned = (signature = 'sig-abc'): SignedLayer2Assessment =>
  ({
    assessment: { katorthoma_proximity: 'deliberate', virtue_domains_engaged: ['phronesis'] },
    signature,
    key_id: 'substrate-layer2-2026Q2',
    signed_at: NOW.toISOString(),
    canonicalization: 'sage-canonical-json-v1',
    algorithm: 'ed25519',
  }) as unknown as SignedLayer2Assessment

const verifyOk = () => ({ valid: true, key_id: 'substrate-layer2-2026Q2' }) as const
const verifyBad = () => ({ valid: false, reason: 'signature mismatch' }) as const

const gObs = { observed: 'genuine_examination_markers' as const, evidence: 'weighed the impression' }
const hObs = { observed: 'habitual_output_markers' as const, evidence: 'the way I always do' }

async function main(): Promise<void> {
  // ==========================================================================
  // §1 deriver
  // ==========================================================================
  {
    // R18f-parallel: unverifiable ⇒ NO event, ever.
    const none = deriveOrientationReadingEvent({
      agentId: 'sagereasoning:orient-test@v1',
      ownerUserId: null,
      credentialRef: 'api_key:k1',
      signedAssessment: fakeSigned(),
      observations: [gObs],
      engagedCircles: ['household'],
      now: NOW,
      correlationId: 'orient:aaa',
      verify: verifyBad,
    })
    assert(none === null, '§1.1 unverifiable artifact ⇒ null (R18f-parallel)')

    const ev = deriveOrientationReadingEvent({
      agentId: 'sagereasoning:orient-test@v1',
      ownerUserId: 'owner-1',
      credentialRef: 'api_key:k1',
      signedAssessment: fakeSigned(),
      observations: [hObs],
      engagedCircles: ['local_community'],
      now: NOW,
      correlationId: 'orient:bbb',
      verify: verifyOk,
    })
    assert(ev !== null, '§1.2 verified ⇒ event')
    if (ev) {
      assert(ev.eventType === 'orientation-reading-away', '§1.3 event type carries the reading')
      assert(ev.virtueDomain === null, '§1.4 virtue_domain NULL (the ruling — agent-wide)')
      assert(ev.artifactKind === 'signed_layer2_assessment', '§1.5 artifact kind unchanged (scope §4.4)')
      assert(ev.artifactRef === 'signed:substrate-layer2-2026Q2', '§1.6 artifact ref names the verifying key')
      assert(ev.correlationId === 'orient:bbb', '§1.7 correlation passthrough')
      assert(ev.payload.orientationReading === 'away' && ev.payload.orientationBasis === 'habitual_output_markers_only', '§1.8 payload reading + basis')
      assert(ev.payload.orientationBounds === ORIENTATION_READING_BOUNDS, '§1.9 payload carries the bounds verbatim')
      assert(typeof ev.payload.generativePrompt === 'string' && (ev.payload.generativePrompt as string).startsWith('this action engaged circle 3'), '§1.10 away+circle ⇒ generativePrompt seed')
    }

    // toward ⇒ no generativePrompt; indeterminate-no-circles ⇒ none either.
    const toward = deriveOrientationReadingEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      signedAssessment: fakeSigned(), observations: [gObs], engagedCircles: ['household'],
      now: NOW, correlationId: 'orient:ccc', verify: verifyOk,
    })
    assert(toward !== null && toward.eventType === 'orientation-reading-toward' && toward.payload.generativePrompt === undefined, '§1.11 toward ⇒ no seed')

    const indet = deriveOrientationReadingEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      signedAssessment: fakeSigned(), observations: undefined, engagedCircles: [],
      now: NOW, correlationId: 'orient:ddd', verify: verifyOk,
    })
    assert(indet !== null && indet.eventType === 'orientation-reading-indeterminate' && indet.payload.orientationObservations === undefined, '§1.12 no observations ⇒ indeterminate, no spans in payload')

    // Span capping: a 400-char span is stored truncated to 300 + ellipsis.
    const longEv = deriveOrientationReadingEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      signedAssessment: fakeSigned(),
      observations: [{ observed: 'genuine_examination_markers', evidence: 'x'.repeat(400) }],
      engagedCircles: [], now: NOW, correlationId: 'orient:eee', verify: verifyOk,
    })
    const span = longEv?.payload.orientationObservations?.[0]?.evidence ?? ''
    assert(span.length === 301 && span.endsWith('…'), '§1.13 payload spans capped at 300')
  }

  // ==========================================================================
  // §2 EVENT_EFFECT — 'flag' × 3, and a fold is a genuine no-op
  // ==========================================================================
  {
    assert(EVENT_EFFECT['orientation-reading-toward'] === 'flag', "§2.1 toward → 'flag'")
    assert(EVENT_EFFECT['orientation-reading-away'] === 'flag', "§2.2 away → 'flag'")
    assert(EVENT_EFFECT['orientation-reading-indeterminate'] === 'flag', "§2.3 indeterminate → 'flag'")

    const prior: EarnedDomainState = {
      earnedLevel: 'deliberate', profilePrior: 'habitual', volatility: 'moderate',
      lastDomainActivityAt: '2026-08-01T00:00:00.000Z',
      reflectLastHonestAt: null, reflectLastScreenedAt: null,
      justiceFloorActive: false, coverageStatus: null,
    }
    const ev: TrustEvent = {
      agentId: 'a', virtueDomain: null, eventType: 'orientation-reading-away',
      artifactKind: 'signed_layer2_assessment', artifactRef: 'signed:k',
      payload: {}, occurredAt: NOW.toISOString(),
    }
    const next = applyTrustEvent(prior, ev)
    assert(JSON.stringify(next) === JSON.stringify(prior), '§2.4 folding an orientation event changes NOTHING (no level, no clock, no timestamps)')
  }

  // ==========================================================================
  // §3 emitLedgerOnlyTrustEvents — insert-only
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const ev: TrustEvent = {
      agentId: 'sagereasoning:orient-test@v1', virtueDomain: null,
      eventType: 'orientation-reading-toward',
      artifactKind: 'signed_layer2_assessment', artifactRef: 'signed:k',
      payload: { orientationReading: 'toward' }, occurredAt: NOW.toISOString(),
      correlationId: 'orient:fff',
    }
    const r1 = await emitLedgerOnlyTrustEvents([ev], fake.client)
    assert(r1.ok && r1.value.written === 1, '§3.1 ledger insert lands')
    assert(fake.tables.agent_trust_events.length === 1, '§3.2 one ledger row')
    assert(fake.tables.agent_trust_state.length === 0, '§3.3 agent_trust_state NEVER touched (insert-only — the reading cannot seed a public record)')

    // Idempotency under the unique index (COALESCE(NULL,'__agent_wide__')).
    const r2 = await emitLedgerOnlyTrustEvents([ev], fake.client)
    assert(r2.ok && r2.value.written === 0, '§3.4 duplicate correlation dedups (written 0)')
    assert(fake.tables.agent_trust_events.length === 1, '§3.5 still one row')

    // PA-7: a store failure is loud + returned.
    fake.failNext('insert', 'agent_trust_events', { message: 'transient' })
    const original = console.error
    const logged: string[] = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    const r3 = await emitLedgerOnlyTrustEvents(
      [{ ...ev, correlationId: 'orient:ggg' }],
      fake.client,
    )
    console.error = original
    assert(!r3.ok, '§3.6 failure returned (never swallowed)')
    assert(logged.some((l) => l.includes('[trust-core]') && l.includes('events lost')), '§3.7 failure logged loudly (PA-7)')

    // The S10 read composes from the ledger.
    const read = await readOrientationReadings('sagereasoning:orient-test@v1', fake.client)
    assert(read.ok && read.value.entries.length === 1 && read.value.entries[0].reading === 'toward', '§3.8 readOrientationReadings parses the reading from event_type')
    assert(read.ok && read.value.capped === false, '§3.9 capped false below the bound')
    assert(ORIENTATION_READINGS_ROW_CAP === 50, '§3.10 cap constant pinned (build-time parameter)')
  }

  // ==========================================================================
  // §4 THE NULL-DOMAIN TRAP — the generic path refuses; reflect still works
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    // Seed a state row so a reflect stamp would be observable.
    fake.tables.agent_trust_state.push({
      agent_id: 'trap-agent', virtue_domain: 'phronesis', earned_level: 'deliberate',
      profile_prior: 'habitual', volatility_rating: 'moderate',
      last_domain_activity_at: '2026-08-01T00:00:00.000Z',
      reflect_last_honest_at: null, justice_floor_active: false, coverage_status: null,
    })

    const orientEv: TrustEvent = {
      agentId: 'trap-agent', virtueDomain: null,
      eventType: 'orientation-reading-away',
      artifactKind: 'signed_layer2_assessment', artifactRef: 'signed:k',
      payload: {}, occurredAt: NOW.toISOString(), correlationId: 'orient:hhh',
    }
    const original = console.error
    const logged: string[] = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    const r = await emitTrustEvents([orientEv], fake.client)
    console.error = original
    assert(r.ok, '§4.1 the generic emitter still resolves (measure mode)')
    const stateRow = fake.tables.agent_trust_state[0]
    assert(stateRow.reflect_last_honest_at === null, '§4.2 THE TRAP IS CLOSED: no reflect timestamp stamped from an orientation event (no half-rate decay grant)')
    assert(logged.some((l) => l.includes('refusing a non-reflect null-domain event')), '§4.3 the refusal is loud')

    // NON-VACUITY: a genuine reflect event through the SAME path DOES stamp.
    const reflectEv: TrustEvent = {
      agentId: 'trap-agent', virtueDomain: null,
      eventType: 'reflect-completed-honest',
      artifactKind: 'reflect_completion', artifactRef: 'reflect:sess-1',
      payload: {}, occurredAt: NOW.toISOString(), correlationId: 'reflect:sess-1',
    }
    const r2 = await emitTrustEvents([reflectEv], fake.client)
    assert(r2.ok, '§4.4 reflect emission resolves')
    assert(
      fake.tables.agent_trust_state[0].reflect_last_honest_at === NOW.toISOString(),
      '§4.5 NON-VACUOUS: a genuine reflect event still stamps (the guard discriminates, it does not disable)',
    )
  }

  // ==========================================================================
  // §5 the emission hook — guard branches (hermetic: any DB touch would throw)
  // ==========================================================================
  {
    const baseInput = {
      agentId: 'sagereasoning:orient-test@v1',
      credentialId: 'k1',
      ownerUserId: null,
      signedAssessment: fakeSigned(),
      observations: [gObs],
      engagedCircles: ['household'],
      layer1Source: 'server' as const,
    }

    // Flag(s) off ⇒ zero client calls (no console.error = no DB-layer touch).
    const original = console.error
    let logged: string[] = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    await emitOrientationReadingTrustEvent(baseInput)
    console.error = original
    assert(logged.length === 0, '§5.1 both flags off ⇒ silent no-op (zero DB-layer touches)')

    process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true'
    logged = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    await emitOrientationReadingTrustEvent(baseInput)
    console.error = original
    assert(logged.length === 0, '§5.2 trust core alone ⇒ still a no-op (orientation flag required)')

    process.env.SUBSTRATE_ORIENTATION_READING_ENABLED = 'true'
    // supplied ⇒ refused BEFORE any DB touch (still silent — the guard returns).
    logged = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    await emitOrientationReadingTrustEvent({ ...baseInput, layer1Source: 'supplied' })
    console.error = original
    assert(logged.length === 0, '§5.3 supplied extraction ⇒ refused before any DB touch (the gaming gate)')

    // Empty signature ⇒ no-op before any DB touch.
    logged = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    await emitOrientationReadingTrustEvent({ ...baseInput, signedAssessment: { signature: '' } })
    console.error = original
    assert(logged.length === 0, '§5.4 empty signature ⇒ no-op')

    // Full path with both flags on: the hook uses the REAL Ed25519 verifier
    // (never injectable at the hook layer — the R18f discipline), so this
    // unverifiable fixture is refused by the deriver and the hook resolves as
    // a silent no-op BEFORE any store touch — the "no event without a
    // verifiable artifact" rule holding at the hook layer, and never a throw
    // to the caller (measure mode). The store-failure loudness itself is
    // proven directly at §3.6/§3.7.
    logged = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    let threw = false
    try {
      await emitOrientationReadingTrustEvent(baseInput)
    } catch {
      threw = true
    }
    console.error = original
    assert(!threw, '§5.5 the hook never throws to the caller (measure mode)')
    assert(logged.length === 0, '§5.6 an unverifiable artifact is a SILENT no-op at the hook (R18f — refused before any store touch)')

    delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
    delete process.env.SUBSTRATE_ORIENTATION_READING_ENABLED
  }

  // ── env restore ────────────────────────────────────────────────────────────
  for (const [k, v] of Object.entries(SAVED_ENV)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }

  console.log(`\norientation-trust-events battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n - ' + failures.join('\n - '))
    process.exit(1)
  }
}

void main()
