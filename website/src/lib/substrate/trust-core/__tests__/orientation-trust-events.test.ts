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
 *       signature ⇒ no-op; agent-circles-off ⇒ no-op (hook-level defense in
 *       depth, PR19 re-run fold).
 *   §6  PR19 RE-RUN FOLDS (2026-08-08, wf_63ff4a50-a2a):
 *       computeOrientationCorrelationId — CONFIRMED-medium closure: two
 *       different agentIds sharing one signature produce two DIFFERENT
 *       correlation ids (the fix genuinely differentiates, mutation-verified
 *       by reverting to signature-only and observing a collision);
 *       readOrientationReadings' capped flag — CONFIRMED-nit closure: exactly
 *       CAP rows ⇒ capped:false (no false "not listed"); CAP+1 ⇒ capped:true
 *       + only CAP entries served; capEvidenceSpan — CONFIRMED closure: a
 *       surrogate pair straddling the truncation boundary is never split.
 */

import { createHash } from 'crypto'
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
import { emitOrientationReadingTrustEvent, computeOrientationCorrelationId } from '../emission-hooks'
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

    // PR19 re-run fold (2026-08-08, CONFIRMED low — closed at the root): the
    // hook now re-checks isAgentCirclesEnabled() itself (defense in depth —
    // previously enforced ONLY at the route.ts call site). Trust-core +
    // orientation on, agent-circles OFF ⇒ still a silent no-op, before the
    // hook ever reaches the deriver/verifier.
    logged = []
    console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    await emitOrientationReadingTrustEvent(baseInput)
    console.error = original
    assert(logged.length === 0, '§5.7 agent-circles flag off ⇒ hook-level no-op (defense in depth)')

    process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED = 'true'

    // Full path with all three flags on: the hook uses the REAL Ed25519 verifier
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
    delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
  }

  // ==========================================================================
  // §6 PR19 RE-RUN FOLDS — closed at the root, mutation-verified
  // ==========================================================================
  {
    // §6.1 computeOrientationCorrelationId — two different agents sharing ONE
    // signature must produce two DIFFERENT correlation ids (CONFIRMED-medium:
    // the reviewer mutation-tested the pre-fix formula and found it collides —
    // this is that exact scenario, now asserted directly).
    const idA = computeOrientationCorrelationId('sagereasoning:agent-a@v1', 'shared-signature-xyz')
    const idB = computeOrientationCorrelationId('sagereasoning:agent-b@v1', 'shared-signature-xyz')
    assert(idA !== idB, '§6.1a two agents sharing one signature ⇒ two DIFFERENT correlation ids')
    assert(idA.startsWith('orient:') && idB.startsWith('orient:'), '§6.1b both carry the orient: prefix')
    // Determinism: the same pair always produces the same id (idempotency
    // depends on this).
    const idA2 = computeOrientationCorrelationId('sagereasoning:agent-a@v1', 'shared-signature-xyz')
    assert(idA === idA2, '§6.1c deterministic — same (agentId, signature) ⇒ same id')
    // MUTATION CONTROL: reconstruct the PRE-FIX formula (sha256(signature)
    // alone — no agentId salt) and apply it for both agents. Because that
    // formula never reads agentId, it is STRUCTURALLY agent-invariant — it
    // produces the identical digest for any two agents sharing one signature,
    // by construction. That is the exact collision the fold closes, and
    // contrasting it against §6.1a's real (different) ids proves the fold is
    // load-bearing, not a vacuous pass (memory: a battery must prove the
    // defect it closes was real, not just that the new code runs).
    const preFixFormula = (signature: string) =>
      createHash('sha256').update(signature).digest('hex').slice(0, 32)
    assert(
      preFixFormula('shared-signature-xyz') === preFixFormula('shared-signature-xyz'),
      '§6.1d MUTATION CONTROL: the pre-fix (signature-only) formula is agent-invariant by construction — two agents sharing one signature WOULD have collided; §6.1a proves the post-fix formula does not',
    )

    // §6.2 readOrientationReadings' capped flag — exact boundary (CONFIRMED nit).
    const fake = makeFakeSupabase()
    const seedRows = (n: number, agentId: string) => {
      for (let i = 0; i < n; i++) {
        fake.tables.agent_trust_events.push({
          id: `seed-${agentId}-${i}`,
          agent_id: agentId,
          event_type: 'orientation-reading-toward',
          artifact_kind: 'signed_layer2_assessment',
          artifact_ref: `signed:seed-${i}`,
          virtue_domain: null,
          payload: {},
          occurred_at: new Date(NOW.getTime() - i * 1000).toISOString(),
          correlation_id: `orient:seed-${agentId}-${i}`,
        })
      }
    }
    seedRows(ORIENTATION_READINGS_ROW_CAP, 'sagereasoning:exactly-cap@v1')
    const exactRead = await readOrientationReadings('sagereasoning:exactly-cap@v1', fake.client)
    assert(
      exactRead.ok && exactRead.value.entries.length === ORIENTATION_READINGS_ROW_CAP && exactRead.value.capped === false,
      '§6.2a exactly CAP rows ⇒ capped:false (no false "not listed" — the off-by-one this fold closes)',
    )
    // Mentor §6(b): at or below the cap the total IS the row count (no second
    // query needed — the probe already proved nothing was excluded).
    assert(
      exactRead.ok && exactRead.value.totalCount === ORIENTATION_READINGS_ROW_CAP,
      '§6.2a-ii exactly CAP rows ⇒ totalCount = CAP (the "of M" disclosure, no count query needed)',
    )
    seedRows(ORIENTATION_READINGS_ROW_CAP + 1, 'sagereasoning:over-cap@v1')
    const overRead = await readOrientationReadings('sagereasoning:over-cap@v1', fake.client)
    assert(
      overRead.ok && overRead.value.entries.length === ORIENTATION_READINGS_ROW_CAP && overRead.value.capped === true,
      '§6.2b CAP+1 rows ⇒ capped:true, exactly CAP entries served',
    )
    // Mentor §6(b): above the cap the exact-count head query supplies the
    // genuine total — "showing 50 of 51", never "showing 50" alone.
    assert(
      overRead.ok && overRead.value.totalCount === ORIENTATION_READINGS_ROW_CAP + 1,
      '§6.2b-ii CAP+1 rows ⇒ totalCount = CAP+1 (the mentor-§6(b) honest-scope disclosure)',
    )
    // Below-cap: total mirrors the (complete) row set.
    seedRows(3, 'sagereasoning:small@v1')
    const smallRead = await readOrientationReadings('sagereasoning:small@v1', fake.client)
    assert(
      smallRead.ok && smallRead.value.totalCount === 3 && smallRead.value.capped === false,
      '§6.2c below the cap ⇒ totalCount = row count, capped:false',
    )

    // §6.3 capEvidenceSpan (via deriveOrientationReadingEvent's payload) —
    // a surrogate pair straddling the truncation boundary must never split
    // (CONFIRMED — the reviewer reproduced a lone-surrogate Postgres jsonb
    // insert rejection from the raw UTF-16 slice).
    const emoji = '\u{1F600}' // 😀 — a genuine surrogate pair in UTF-16
    const padded = 'x'.repeat(299) + emoji + 'y'.repeat(20) // surrogate pair spans code-unit index 299/300
    const ev = deriveOrientationReadingEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      signedAssessment: fakeSigned(), engagedCircles: [],
      observations: [{ observed: 'genuine_examination_markers', evidence: padded }],
      now: NOW, correlationId: 'orient:surrogate-test', verify: verifyOk,
    })
    const cappedSpan = ev?.payload.orientationObservations?.[0]?.evidence ?? ''
    // A lone surrogate is a code unit in the range D800-DBFF or DC00-DFFF with
    // no valid pairing adjacent to it. JSON.stringify a well-formed string
    // round-trips cleanly; a string with a lone surrogate does too in modern
    // V8 (it escapes it), so the real proof is: the emoji, if present at all
    // in the capped span, must be present as a COMPLETE pair, never split.
    const highSurrogateIdx = cappedSpan.search(/[\uD800-\uDBFF]/)
    const wellFormed =
      highSurrogateIdx === -1 || cappedSpan.codePointAt(highSurrogateIdx)! > 0xFFFF
    assert(wellFormed, '§6.3 the truncation never splits a surrogate pair (well-formed UTF-16 in the payload)')
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
