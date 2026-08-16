/**
 * s10-trust-record-surface.test.ts — Trust Layer S10 battery: the public
 * trust-record read surface (composer + handler + envelope + riders).
 *
 * Plain-assertion script: npx tsx <this file>   (hermetic: the Supabase env is
 * DELETED up front so any un-injected DB path throws loudly — the S9b lesson:
 * pin the hermetic env explicitly, never inherit it).
 *
 * Proves (KG-EX1 instrument-fidelity; method-before-purpose guard — this
 * surface PUBLISHES the measurement, so the unit of analysis is the honesty of
 * the published claim):
 *   §1  isServableAgentId — permissive-superset guard (read-accepts ⊇ write-accepts).
 *   §2  DECAYED TRUTH through the REAL chain (fake store → readTrustVerdict →
 *       composer): a stale domain serves its decayed level (strict inequality —
 *       the vacuous-pass guard is the fresh-domain control equality); the
 *       justice latch caps + surfaces; the aggregate is the served minimum; the
 *       reflect record is modulate-only-labelled; NO recommendation and NO
 *       event-ledger fields ride the wire; the envelope's load-bearing phrases
 *       are locked (PA-6 narrowed reflect wording; PA-10 replay class; D3; A2;
 *       A9 case-3; no-future-behaviour; weights blocked; MEASURE).
 *   §3  Sparse honesty — unevaluated cardinal domains are NAMED, never leveled.
 *   §4  Handler legs — dark-503 with ZERO deps calls; core-dark 503; 400s; 404
 *       honest miss; 200 shape + cache headers; reflect-summary outage ⇒ null +
 *       honest note (never fabricated, never blocking); verdict-dark and
 *       profile-null ⇒ 503 no-store.
 *   §5  INV source-grep wiring pins (route thinness + rate limit + AC5 recorded
 *       decision + composer purity + flag name + the R17i rider wiring).
 */

import * as fs from 'fs'
import * as path from 'path'
import { makeFakeSupabase } from './fake-supabase'
import { readTrustVerdict } from '../harness-integration'
import { readHonestReflectSummary, readTrustProfile } from '../trust-core-store'
// Agent-circles C2c (2026-08-08) — the orientation-readings exception's pins.
import {
  ORIENTATION_ENTRY_TEXT,
  ORIENTATION_NOT_ATTESTABLE_CLAUSE,
  ORIENTATION_OBSERVED_ENTRY_TEXT,
  ORIENTATION_OBSERVED_NOT_ATTESTABLE_CLAUSE,
} from '@/lib/translation-sandwich/orientation-reading'
import { PROXIMITY_RANK } from '../constants'
import {
  composeTrustRecordPayload,
  REFLECT_MODULATE_ONLY_NOTE,
  TRUST_RECORD_ENVELOPE,
} from '../trust-record-payload'
import {
  isServableAgentId,
  runTrustRecordGet,
  type TrustRecordDeps,
} from '@/app/api/trust-record/[agent_id]/handler'

// ── hermetic env pin (S9b negative-battery lesson) ──────────────────────────
const SAVED_ENV: Record<string, string | undefined> = {
  SUBSTRATE_TRUST_CORE_ENABLED: process.env.SUBSTRATE_TRUST_CORE_ENABLED,
  SUBSTRATE_TRUST_READ_SURFACE_ENABLED: process.env.SUBSTRATE_TRUST_READ_SURFACE_ENABLED,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true' // readTrustVerdict's own gate
delete process.env.SUBSTRATE_TRUST_READ_SURFACE_ENABLED
delete process.env.NEXT_PUBLIC_SUPABASE_URL // any un-injected DB path throws loudly
delete process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function withStubbedConsoleError<T>(fn: () => Promise<T>): Promise<{ result: T; errors: string[] }> {
  // Serialized stub window (memory: async-test-console-stub-race — never overlap).
  const original = console.error
  const errors: string[] = []
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(' '))
  }
  try {
    const result = await fn()
    return { result, errors }
  } finally {
    console.error = original
  }
}

const NOW = new Date('2026-07-12T00:00:00.000Z')
const NOW_ISO = NOW.toISOString()
const FUTURE_ISO = new Date('2026-10-10T00:00:00.000Z').toISOString()
const MONTHS_15_AGO = new Date('2025-04-12T00:00:00.000Z').toISOString()

let rowN = 0
function stateRow(over: Record<string, unknown>): Record<string, unknown> {
  return {
    id: `sr-${++rowN}`,
    agent_id: 'test:agent@v1',
    virtue_domain: 'phronesis',
    owner_user_id: null,
    credential_ref: null,
    earned_level: 'deliberate',
    profile_prior: 'habitual',
    volatility_rating: 'high',
    last_domain_activity_at: NOW_ISO,
    reflect_last_honest_at: null,
    reflect_last_screened_at: null,
    justice_floor_active: false,
    coverage_status: null,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    retain_until: FUTURE_ISO,
    ...over,
  }
}

async function main(): Promise<void> {
  // ═══ §1 — isServableAgentId (permissive superset) ═════════════════════════
  assert(isServableAgentId('sagereasoning:s9-loop@v1'), 'S1-1 K1-canonical id servable')
  assert(isServableAgentId('agent_test_v1'), 'S1-2 legacy id servable')
  assert(isServableAgentId('sub-52363e99-aaaa'), 'S1-3 sub-spawn id servable')
  assert(!isServableAgentId(''), 'S1-4 empty rejected')
  assert(!isServableAgentId('has space'), 'S1-5 whitespace rejected')
  assert(!isServableAgentId('x'.repeat(201)), 'S1-6 oversize rejected')
  assert(!isServableAgentId('ctrl\u0007id'), 'S1-7 control char rejected')
  assert(!isServableAgentId('unicodé'), 'S1-8 non-ASCII rejected (no write path mints one)')

  // ═══ §2 — decayed truth through the REAL chain ════════════════════════════
  const fake = makeFakeSupabase()
  const AGENT = 'test:agent@v1'
  fake.tables.agent_trust_state.push(
    stateRow({ virtue_domain: 'phronesis', earned_level: 'deliberate' }),
    stateRow({
      virtue_domain: 'dikaiosyne',
      earned_level: 'sage_like',
      justice_floor_active: true,
    }),
    stateRow({
      virtue_domain: 'andreia',
      earned_level: 'principled',
      last_domain_activity_at: MONTHS_15_AGO,
      volatility_rating: 'high',
    }),
    stateRow({ virtue_domain: 'sophrosyne', earned_level: 'deliberate' }),
  )
  fake.tables.agent_trust_events.push(
    {
      id: 'ev-1',
      agent_id: AGENT,
      virtue_domain: null,
      event_type: 'reflect-completed-honest',
      artifact_kind: 'reflect_completion',
      artifact_ref: 'reflect:s-1',
      payload: {},
      occurred_at: '2026-07-01T00:00:00.000Z',
      correlation_id: 'reflect:s-1',
      created_at: NOW_ISO,
      retain_until: FUTURE_ISO,
    },
    {
      id: 'ev-2',
      agent_id: AGENT,
      virtue_domain: null,
      event_type: 'reflect-completed-honest',
      artifact_kind: 'reflect_completion',
      artifact_ref: 'reflect:s-2',
      payload: {},
      occurred_at: '2026-07-10T00:00:00.000Z',
      correlation_id: 'reflect:s-2',
      created_at: NOW_ISO,
      retain_until: FUTURE_ISO,
    },
  )

  const verdict = await readTrustVerdict(AGENT, { now: NOW, client: fake.client })
  assert(!verdict.dark, 'S2-0 verdict not dark (flag pinned on)')
  assert(verdict.profile !== null, 'S2-0b profile read through the fake store')
  const reflectRes = await readHonestReflectSummary(AGENT, fake.client)
  assert(reflectRes.ok, 'S2-0c reflect summary read ok')
  const payload = composeTrustRecordPayload({
    verdict,
    reflectSummary: reflectRes.ok ? reflectRes.value : null,
    generatedAt: NOW,
  })

  eq(payload.schema, 'sage-trust-record/v1', 'S2-1 schema id')
  eq(payload.subject.agent_id, AGENT, 'S2-2 subject')
  eq(payload.mode, 'measure', 'S2-3 MEASURE on the wire')
  eq(payload.generated_at, NOW_ISO, 'S2-4 generated_at pinned to injected now')
  eq(payload.record.domains.length, 4, 'S2-5 four domains served')

  const byDomain = new Map(payload.record.domains.map((d) => [d.domain, d]))
  const andreia = byDomain.get('andreia')!
  const phronesis = byDomain.get('phronesis')!
  const dikaiosyne = byDomain.get('dikaiosyne')!

  // THE decayed-truth pin (strict inequality) + the fresh-domain CONTROL —
  // together they prove the composer serves the decay chain, not stored rows,
  // and that the pin itself is non-vacuous.
  assert(
    PROXIMITY_RANK[andreia.effective_level] < PROXIMITY_RANK[andreia.earned_level],
    `S2-6 stale domain serves DECAYED level (effective ${andreia.effective_level} < earned ${andreia.earned_level})`,
  )
  assert(
    PROXIMITY_RANK[andreia.effective_level] >= PROXIMITY_RANK[andreia.profile_prior],
    'S2-7 decay floors at the profile prior, never below',
  )
  assert(andreia.decay_steps_applied > 0, 'S2-8 decay steps surfaced honestly')
  eq(phronesis.effective_level, phronesis.earned_level, 'S2-9 CONTROL: fresh domain undecayed')
  eq(phronesis.decay_steps_applied, 0, 'S2-10 CONTROL: fresh domain zero steps')

  // Justice latch: earned sage_like caps at deliberate + is SURFACED.
  eq(dikaiosyne.effective_level, 'deliberate', 'S2-11 justice latch caps at deliberate')
  eq(dikaiosyne.earned_level, 'sage_like', 'S2-12 earned level served verbatim beside the cap')
  assert(dikaiosyne.justice_capped, 'S2-13 justice_capped surfaced')
  assert(payload.record.aggregate.any_justice_capped, 'S2-14 aggregate carries the latch')

  // The aggregate is the minimum of the SERVED effective levels (self-consistency).
  const servedMin = payload.record.domains
    .filter((d) => d.has_evidence && d.domain !== 'oversight')
    .reduce((min, d) => (PROXIMITY_RANK[d.effective_level] < PROXIMITY_RANK[min.effective_level] ? d : min))
  eq(payload.record.aggregate.level, servedMin.effective_level, 'S2-15 aggregate = served minimum')
  eq(payload.record.aggregate.limiting_domain, servedMin.domain, 'S2-16 limiting domain matches')
  assert(
    payload.record.aggregate.confidence_weight >= 0 && payload.record.aggregate.confidence_weight <= 1,
    'S2-17 confidence weight a bounded scalar',
  )
  assert(
    payload.record.aggregate.confidence_basis.includes('uncorroborated'),
    'S2-18 confidence basis names the conservative corroboration floor',
  )

  // Reflect record: modulate-only, honest count, never a verified-pattern claim.
  assert(payload.record.reflect_record !== null, 'S2-19 reflect record present')
  eq(payload.record.reflect_record!.honest_reflect_count, 2, 'S2-20 honest count from events')
  eq(payload.record.reflect_record!.class, 'modulate-only', 'S2-21 modulate-only class')
  eq(payload.record.reflect_record!.note, REFLECT_MODULATE_ONLY_NOTE, 'S2-22 modulate-only note verbatim')

  // NO recommendation + NO event ledger on the wire (design decisions of record).
  const wire = JSON.stringify(payload)
  assert(!('recommendation' in (payload as unknown as Record<string, unknown>)), 'S2-23 no recommendation key')
  assert(!wire.includes('"recommendation"'), 'S2-24 no recommendation anywhere on the wire')
  assert(!wire.includes('"artifact_ref"'), 'S2-25 no event-ledger artifact refs on the wire')
  assert(!wire.includes('"correlation_id"'), 'S2-26 no correlation ids on the wire')
  assert(!wire.includes('"event_type"'), 'S2-27 no event rows on the wire')

  // Envelope phrase locks (drift breaks the battery, not the claim).
  const env = JSON.stringify(TRUST_RECORD_ENVELOPE)
  assert(env.includes('not a fact-checker'), 'S2-28 envelope: D3 fact-checking bound')
  assert(env.includes('omits a real harm'), 'S2-29 envelope: A2 self-report-omission class')
  assert(env.includes('A9 case-3'), 'S2-30 envelope: uncatchable delegation class')
  assert(env.includes('stale-artifact replay'), 'S2-31 envelope: PA-10 replay class disclosed')
  assert(env.includes('cannot raise any trust level'), 'S2-32 envelope: PA-6 narrowed reflect wording')
  assert(env.includes('never a prediction'), 'S2-33 envelope: no future-behaviour claim')
  assert(env.includes('Weights-tier claims are blocked'), 'S2-34 envelope: weights blocked')
  assert(env.includes('MEASURE'), 'S2-35 envelope: measure-mode disclosure')
  assert(env.includes('modulate-only'), 'S2-36 envelope: reflect modulate-only')
  // S2-39: Ruling Set B R-2 (2026-08-15). S2-37 below is strict reference
  // identity, so it passes by construction whenever the payload ships the same
  // (mutated) object — it cannot detect a missing envelope ITEM. This substring
  // pin is what actually holds the discriminative-range disclosure in place.
  assert(
    env.includes('Discriminative range'),
    'S2-39 envelope: discriminative-range item (Ruling Set B R-2)',
  )
  assert(
    env.includes('tested relapse-resistance rather than absence of perturbation'),
    'S2-40 envelope: discriminative range names the Senecan relapse-resistance criterion, not generic variance',
  )
  eq(payload.envelope, TRUST_RECORD_ENVELOPE, 'S2-37 the payload ships THE envelope object')
  eq(payload.interop.published_externally, false, 'S2-38 interop: nothing published externally')

  // ═══ §3 — sparse honesty ══════════════════════════════════════════════════
  const AGENT_B = 'test:sparse@v1'
  fake.tables.agent_trust_state.push(
    stateRow({ agent_id: AGENT_B, virtue_domain: 'dikaiosyne', earned_level: 'deliberate' }),
  )
  const verdictB = await readTrustVerdict(AGENT_B, { now: NOW, client: fake.client })
  const payloadB = composeTrustRecordPayload({ verdict: verdictB, reflectSummary: null, generatedAt: NOW })
  eq(payloadB.record.unevaluated_cardinal_domains.length, 3, 'S3-1 three unevaluated cardinals named')
  assert(
    payloadB.notes.some((n) => n.includes('unevaluated cardinal domain(s)')),
    'S3-2 coverage-gap note present',
  )
  assert(
    payloadB.notes.some((n) => n.includes('never a level')),
    'S3-3 absence-is-a-gap-not-a-level stated',
  )
  eq(payloadB.record.reflect_record, null, 'S3-4 null reflect summary ⇒ null record, never fabricated')
  assert(
    payloadB.notes.some((n) => n.includes('reflect summary unavailable')),
    'S3-5 reflect outage honestly noted',
  )

  // ═══ §4 — handler legs ════════════════════════════════════════════════════
  const bomb = (label: string) => () => {
    throw new Error(`${label} must not be called`)
  }
  const darkDeps: TrustRecordDeps = {
    isSurfaceEnabled: () => false,
    isCoreEnabled: bomb('isCoreEnabled') as unknown as () => boolean,
    readVerdict: bomb('readVerdict') as unknown as TrustRecordDeps['readVerdict'],
    readReflectSummary: bomb('readReflectSummary') as unknown as TrustRecordDeps['readReflectSummary'],
    now: () => NOW,
  }
  const resDark = await runTrustRecordGet('test:agent@v1', darkDeps)
  eq(resDark.status, 503, 'S4-1 flag-off ⇒ 503 (zero deps calls — bombs untripped)')
  const darkBody = (await resDark.json()) as { note?: string }
  assert(
    (darkBody.note ?? '').includes('SUBSTRATE_TRUST_READ_SURFACE_ENABLED'),
    'S4-2 dark 503 names the flag honestly',
  )
  eq(resDark.headers.get('Cache-Control'), 'no-store', 'S4-3 failure never cached')

  const coreDarkDeps: TrustRecordDeps = { ...darkDeps, isSurfaceEnabled: () => true, isCoreEnabled: () => false }
  const resCoreDark = await runTrustRecordGet('test:agent@v1', coreDarkDeps)
  eq(resCoreDark.status, 503, 'S4-4 core-dark ⇒ 503 (readVerdict bomb untripped)')

  const liveDeps: TrustRecordDeps = {
    isSurfaceEnabled: () => true,
    isCoreEnabled: () => true,
    // Mirrors the REAL_DEPS binding: strictStore on (the S10-ABUSE-1 fold).
    readVerdict: (id, opts) => readTrustVerdict(id, { ...opts, client: fake.client, strictStore: true }),
    readReflectSummary: (id) => readHonestReflectSummary(id, fake.client),
    now: () => NOW,
  }

  const res400 = await runTrustRecordGet('has space', liveDeps)
  eq(res400.status, 400, 'S4-5 malformed id ⇒ 400')
  const res400b = await runTrustRecordGet('x'.repeat(201), liveDeps)
  eq(res400b.status, 400, 'S4-6 oversize id ⇒ 400')

  const res404 = await runTrustRecordGet('test:unknown@v1', liveDeps)
  eq(res404.status, 404, 'S4-7 no rows ⇒ honest 404')
  const body404 = (await res404.json()) as { status: string; message: string }
  eq(body404.status, 'not_found', 'S4-8 404 discriminator')
  assert(body404.message.includes('No examined trust evidence'), 'S4-9 404 message honest (ENV-1 wording)')

  const res200 = await runTrustRecordGet(AGENT, liveDeps)
  eq(res200.status, 200, 'S4-10 record ⇒ 200')
  eq(res200.headers.get('Cache-Control'), 'public, max-age=300', 'S4-11 public 5-min cache')
  assert(
    /^[\x20-\x7E]+$/.test(res200.headers.get('X-Trust-Record-Disclaimer') ?? ''),
    'S4-11b header values are ByteString-safe ASCII (the em-dash class the battery caught in-build)',
  )
  const body200 = (await res200.json()) as { status: string; data: { schema: string }; documentation_url: string }
  eq(body200.status, 'ok', 'S4-12 ok discriminator')
  eq(body200.data.schema, 'sage-trust-record/v1', 'S4-13 payload rides under data')
  assert(body200.documentation_url.includes('limitations'), 'S4-14 documentation_url present')

  // Reflect-summary outage: 200 still served; honest note; error logged.
  {
    const failReflectDeps: TrustRecordDeps = {
      ...liveDeps,
      readReflectSummary: async () => ({ ok: false, error: 'injected outage' }),
    }
    const { result: resOut, errors } = await withStubbedConsoleError(() =>
      runTrustRecordGet(AGENT, failReflectDeps),
    )
    eq(resOut.status, 200, 'S4-15 reflect outage never blocks the record')
    const bodyOut = (await resOut.json()) as { data: { record: { reflect_record: unknown }; notes: string[] } }
    eq(bodyOut.data.record.reflect_record, null, 'S4-16 outage ⇒ null, never fabricated')
    assert(
      bodyOut.data.notes.some((n: string) => n.includes('reflect summary unavailable')),
      'S4-17 outage honestly noted on the wire',
    )
    assert(errors.some((e) => e.includes('[trust-record]')), 'S4-18 outage logged for the operator')
  }

  // Verdict-dark + profile-null ⇒ 503 no-store (fail-honest, vague message).
  {
    const verdictDarkDeps: TrustRecordDeps = {
      ...liveDeps,
      readVerdict: async () => ({
        schema: 'trust-verdict-v1',
        dark: true,
        profile: null,
        aggregate: null,
        recommendation: null,
        mode: 'measure',
        basis: 'dark',
      }),
    }
    const resVD = await runTrustRecordGet(AGENT, verdictDarkDeps)
    eq(resVD.status, 503, 'S4-19 verdict-dark ⇒ 503 (belt-and-braces)')

    const profileNullDeps: TrustRecordDeps = {
      ...liveDeps,
      readVerdict: async () => ({
        schema: 'trust-verdict-v1',
        dark: false,
        profile: null,
        aggregate: null,
        recommendation: null,
        mode: 'measure',
        basis: 'trust profile read failed (fail-honest): injected',
      }),
    }
    const { result: resPN, errors } = await withStubbedConsoleError(() =>
      runTrustRecordGet(AGENT, profileNullDeps),
    )
    eq(resPN.status, 503, 'S4-20 profile-null ⇒ 503 fail-honest')
    eq(resPN.headers.get('Cache-Control'), 'no-store', 'S4-21 failure never cached')
    const bodyPN = (await resPN.json()) as { message: string }
    assert(!bodyPN.message.includes('injected'), 'S4-22 failure message vague (no internals leaked)')
    assert(errors.some((e) => e.includes('profile read failed')), 'S4-23 basis logged for the operator')
  }

  // S10-ABUSE-1 fold: a missing-table-SHAPED transient error (the PostgREST
  // schema-cache stale class) must 503 no-store on THIS surface — never a false,
  // cacheable 404 claiming "no trust events have been folded".
  {
    fake.failNext('select', 'agent_trust_state', {
      code: 'PGRST205',
      message: "Could not find the table 'public.agent_trust_state' in the schema cache",
    })
    const { result: resStrict, errors } = await withStubbedConsoleError(() =>
      runTrustRecordGet(AGENT, liveDeps),
    )
    eq(resStrict.status, 503, 'S4-24 schema-cache stale ⇒ 503 under strict store (never a false 404)')
    eq(resStrict.headers.get('Cache-Control'), 'no-store', 'S4-25 the false-404 class is never cached')
    assert(errors.some((e) => e.includes('profile read failed')), 'S4-26 strict failure logged for the operator')
    // CONTROL — the DEFAULT (non-strict) read still folds the same error benign:
    // the data-rights callers' missing-table-before-migration contract, unchanged.
    fake.failNext('select', 'agent_trust_state', {
      code: 'PGRST205',
      message: "Could not find the table 'public.agent_trust_state' in the schema cache",
    })
    const defaultRes = await readTrustProfile(AGENT, NOW, fake.client)
    assert(
      defaultRes.ok && defaultRes.value.domains.length === 0,
      'S4-27 CONTROL: the default read keeps the benign fold (existing callers byte-identical)',
    )
  }

  // S10-ENV-1 fold: a DECLARATION-CLASS record-only event (the v1 harness_computed
  // calling acknowledgement) seeds a state row at the profile prior with
  // hasEvidence=false — such an agent must 404 (a 200 must imply examined
  // evidence), and a mixed profile must still 200 with the seeded domain served
  // honestly as has_evidence=false.
  {
    const AGENT_C = 'test:seeded-only@v1'
    fake.tables.agent_trust_state.push(
      stateRow({
        agent_id: AGENT_C,
        virtue_domain: 'dikaiosyne',
        earned_level: 'habitual', // == profile_prior ⇒ no evidence
        last_domain_activity_at: null,
      }),
    )
    const resSeeded = await runTrustRecordGet(AGENT_C, liveDeps)
    eq(resSeeded.status, 404, 'S4-30 seeded-only (no-evidence) profile ⇒ 404 (a 200 implies examined evidence)')
    const bodySeeded = (await resSeeded.json()) as { status: string; message: string }
    eq(bodySeeded.status, 'not_found', 'S4-31 seeded-only miss uses the not_found discriminator')
    assert(
      bodySeeded.message.includes('declaration-class'),
      'S4-32 404 message names the declaration-class bound honestly',
    )

    const AGENT_D = 'test:mixed@v1'
    fake.tables.agent_trust_state.push(
      stateRow({ agent_id: AGENT_D, virtue_domain: 'phronesis', earned_level: 'deliberate' }),
      stateRow({
        agent_id: AGENT_D,
        virtue_domain: 'oversight',
        earned_level: 'habitual',
        last_domain_activity_at: null,
      }),
    )
    const resMixed = await runTrustRecordGet(AGENT_D, liveDeps)
    eq(resMixed.status, 200, 'S4-33 mixed profile (evidence + seeded) still 200')
    const bodyMixed = (await resMixed.json()) as {
      data: { record: { domains: Array<{ domain: string; has_evidence: boolean }> } }
    }
    const oversightView = bodyMixed.data.record.domains.find((d) => d.domain === 'oversight')
    assert(
      oversightView !== undefined && oversightView.has_evidence === false,
      'S4-34 seeded domain served honestly as has_evidence=false beside the evidence domain',
    )
  }

  // S10-ABUSE-2 fold: the capped reflect summary surfaces HONESTLY on the wire.
  {
    const cappedPayload = composeTrustRecordPayload({
      verdict,
      reflectSummary: { honestReflectCount: 500, latestHonestReflectAt: NOW_ISO, capped: true },
      generatedAt: NOW,
    })
    assert(
      cappedPayload.notes.some((n) => n.includes('capped at the bounded read window')),
      'S4-28 capped reflect count carries an honest under-reporting note',
    )
    const uncapped = composeTrustRecordPayload({
      verdict,
      reflectSummary: { honestReflectCount: 2, latestHonestReflectAt: NOW_ISO, capped: false },
      generatedAt: NOW,
    })
    assert(
      !uncapped.notes.some((n) => n.includes('capped')),
      'S4-29 CONTROL: uncapped summary carries no cap note',
    )
  }

  // ═══ §5 — INV source-grep wiring pins ═════════════════════════════════════
  const websiteRoot = path.resolve(__dirname, '../../../../..')
  const read = (p: string) => fs.readFileSync(path.join(websiteRoot, p), 'utf-8')
  const composerSrc = read('src/lib/substrate/trust-core/trust-record-payload.ts')
  const handlerSrc = read('src/app/api/trust-record/[agent_id]/handler.ts')
  const routeSrc = read('src/app/api/trust-record/[agent_id]/route.ts')
  const flagSrc = read('src/lib/substrate/trust-core/trust-core-flag.ts')
  const exportRouteSrc = read('src/app/api/user/export/route.ts')
  const sessionStoreSrc = read('src/lib/sage-reflect/session-store.ts')

  assert(!composerSrc.includes('@supabase'), 'S5-1 composer pure: no supabase import')
  assert(!composerSrc.includes('process.env'), 'S5-2 composer pure: no env read')
  assert(
    handlerSrc.indexOf('deps.isSurfaceEnabled()') < handlerSrc.indexOf('deps.readVerdict('),
    'S5-3 handler dark-gates BEFORE any read',
  )
  assert(handlerSrc.includes('OUTSIDE the human-distress perimeter'), 'S5-4 handler carries the AC5 recorded decision')
  assert(routeSrc.includes('OUTSIDE the human-distress perimeter'), 'S5-5 route carries the AC5 recorded decision')
  assert(
    routeSrc.includes('checkRateLimit(request, RATE_LIMITS.publicAgent)'),
    'S5-6 route rate-limits at publicAgent (call form, not a comment match)',
  )
  {
    const exportNames = [...routeSrc.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)].map((m) => m[1])
    const allowed = new Set(['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE', 'PATCH'])
    assert(
      exportNames.length > 0 && exportNames.every((n) => allowed.has(n)),
      `S5-7 route exports only HTTP handlers (route-export rule; got ${exportNames.join(',')})`,
    )
    assert(!/export\s+const/.test(routeSrc), 'S5-8 route exports no consts (route-export rule)')
  }
  assert(
    flagSrc.includes("TRUST_READ_SURFACE_ENV_VAR = 'SUBSTRATE_TRUST_READ_SURFACE_ENABLED'"),
    'S5-9 flag name pinned',
  )
  // R17i rider wiring (the export fold + the store reader's honest shape).
  assert(exportRouteSrc.includes('getAgentSessionsForExport'), 'S5-10 export route wires the reflect reader')
  assert(exportRouteSrc.includes('sage_reflect_sessions'), 'S5-11 export key present')
  assert(
    exportRouteSrc.indexOf(".eq('owner_user_id', userId)") < exportRouteSrc.indexOf('getAgentSessionsForExport('),
    'S5-12 export scopes owner→agent_ids before reading sessions (the delete-path scoping)',
  )
  assert(
    sessionStoreSrc.includes('response_history_ciphertext, response_history_meta, ...plain'),
    'S5-13 export reader DROPS the raw ciphertext columns',
  )
  assert(
    sessionStoreSrc.includes('decryptPersistedState({') &&
      sessionStoreSrc.includes('decryption failed (fail-honest)'),
    'S5-14 export reader decrypts for the subject with an honest per-row failure marker',
  )
  // The two review folds, source-pinned so they cannot silently revert:
  assert(handlerSrc.includes('strictStore: true'), 'S5-15 REAL_DEPS carries strictStore (S10-ABUSE-1 fold)')
  {
    const storeSrc = read('src/lib/substrate/trust-core/trust-core-store.ts')
    assert(
      storeSrc.includes('.limit(HONEST_REFLECT_SUMMARY_ROW_CAP)') &&
        storeSrc.includes(".order('occurred_at', { ascending: false })"),
      'S5-16 reflect summary read is bounded + desc-ordered (S10-ABUSE-2 fold)',
    )
    assert(
      storeSrc.includes('!opts?.strictMissingTable &&'),
      'S5-17 strict mode gates the benign missing-table fold in readTrustProfile',
    )
  }

  // ═══ §6 — agent-circles C2c: the orientation_readings bounded exception ═══
  {
    // S6-1: the surface DARK case — no orientationReadings input ⇒ the key is
    // structurally ABSENT (byte-identity for every pre-C2 payload) and no
    // orientation note rides.
    const dark = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW })
    assert(!('orientation_readings' in dark.record), 'S6-1 no input ⇒ no orientation_readings key (flag-off byte-identity)')
    assert(!dark.notes.some((n) => n.includes('orientation')), 'S6-1b no orientation note flag-off')
    assert(
      !('total_orientation_readings_count' in dark.record),
      'S6-1c no total-count key flag-off (mentor §6(b) rides only with the list)',
    )

    // S6-2: entries compose with the template + the INLINE clause on EVERY entry.
    const composed = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      orientationReadings: {
        entries: [
          { reading: 'toward', occurredAt: '2026-08-08T09:00:00.000Z', deliveryClass: 'examined' },
          { reading: 'away', occurredAt: '2026-08-08T08:00:00.000Z', deliveryClass: 'examined' },
          { reading: 'indeterminate', occurredAt: '2026-08-08T07:00:00.000Z', deliveryClass: 'examined' },
          { reading: 'sideways', occurredAt: '2026-08-08T06:00:00.000Z', deliveryClass: 'examined' }, // unknown — filtered
        ],
        capped: false,
      },
      generatedAt: NOW,
    })
    const entries = composed.record.orientation_readings ?? []
    assert(entries.length === 3, 'S6-2 unknown reading vocabulary filtered (never a template-less entry)')
    assert(
      entries.every((e) => e.entry_text === ORIENTATION_ENTRY_TEXT[e.reading]),
      'S6-3 entry_text is the deterministic template (never generated)',
    )
    assert(
      entries.every((e) => e.not_attestable_clause === ORIENTATION_NOT_ATTESTABLE_CLAUSE),
      'S6-4 EVERY entry carries the not-attestable clause INLINE, verbatim (the placement ruling\'s structural addition)',
    )

    // S6-5: capped WITH a total (mentor §6(b)) ⇒ the "showing N of M" note +
    // the total_orientation_readings_count field.
    const capped = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      orientationReadings: {
        entries: [{ reading: 'toward', occurredAt: NOW_ISO, deliveryClass: 'examined' }],
        capped: true,
        totalCount: 847,
      },
      generatedAt: NOW,
    })
    assert(
      capped.record.total_orientation_readings_count === 847,
      'S6-5 the mentor-§6(b) total count rides the payload',
    )
    assert(
      capped.notes.some((n) => n.includes('most recent of 847 total readings')),
      'S6-5b the capped note says "showing N of M", never bare "showing N"',
    )
    // S6-5b2 (2026-08-12, curation-via-volume ruling fold): the composition-
    // effect sentence — verbatim-sourced from llms.txt's "Orientation
    // readings" section — rides in the SAME note as the total-count
    // disclosure, since the claim depends on the total being known.
    assert(
      capped.notes.some(
        (n) =>
          n.includes('could displace older away or indeterminate entries from the visible window') &&
          n.includes('does not prevent this composition effect'),
      ),
      'S6-5b2 the curation-via-volume composition-effect sentence is present when total is known',
    )
    // S6-5c: capped but the count read failed (totalCount null) ⇒ the field is
    // OMITTED (never fabricated) and the note honestly says the total was
    // unavailable.
    const cappedNoCount = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      orientationReadings: {
        entries: [{ reading: 'toward', occurredAt: NOW_ISO, deliveryClass: 'examined' }],
        capped: true,
        totalCount: null,
      },
      generatedAt: NOW,
    })
    assert(
      !('total_orientation_readings_count' in cappedNoCount.record),
      'S6-5c a failed count is omitted, never fabricated',
    )
    assert(
      cappedNoCount.notes.some((n) => n.includes('total count was unavailable')),
      'S6-5d the count outage is disclosed in the note',
    )

    // S6-6: flag-on read failure ⇒ field omitted + honest note (the reflect-
    // summary outage posture; never fabricated, never blocking).
    const failed = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      orientationReadings: null,
      generatedAt: NOW,
    })
    assert(!('orientation_readings' in failed.record), 'S6-6 failed read ⇒ field omitted')
    assert(
      failed.notes.some((n) => n.includes('orientation readings unavailable')),
      'S6-6b failed read ⇒ honest note',
    )

    // S6-7: handler back-compat — a pre-C2 deps object (no orientation fns)
    // still serves a 200 with no orientation field.
    const resOld = await runTrustRecordGet(AGENT, liveDeps)
    const oldBody = (await resOld.json()) as { data: { record: Record<string, unknown> } }
    assert(resOld.status === 200 && !('orientation_readings' in oldBody.data.record), 'S6-7 pre-C2 deps ⇒ 200, field absent (back-compat)')

    // S6-8: handler flag-on — the field rides, each entry claused.
    const orientDeps: TrustRecordDeps = {
      ...liveDeps,
      isOrientationEnabled: () => true,
      readOrientationReadings: async () => ({
        ok: true,
        value: {
          entries: [{ reading: 'away', occurredAt: NOW_ISO, deliveryClass: 'examined' }],
          capped: false,
        },
      }),
    }
    const resOn = await runTrustRecordGet(AGENT, orientDeps)
    const onBody = (await resOn.json()) as {
      data: { record: { orientation_readings?: { reading: string; not_attestable_clause: string }[] } }
    }
    assert(
      resOn.status === 200 &&
        onBody.data.record.orientation_readings?.length === 1 &&
        onBody.data.record.orientation_readings[0].not_attestable_clause === ORIENTATION_NOT_ATTESTABLE_CLAUSE,
      'S6-8 flag-on deps ⇒ served entries carry the inline clause',
    )

    // S6-8b (PR19 first-hand fold F-3): the ENV-1 evidence-gated 404 fires
    // BEFORE the orientation read — an agent with no examined evidence gets its
    // honest 404 without the orientation ledger ever being touched (orientation
    // events can never flip a 404, and a 404 response never leaks readings).
    const orient404Deps: TrustRecordDeps = {
      ...liveDeps,
      isOrientationEnabled: () => true,
      readOrientationReadings: (() => {
        throw new Error('readOrientationReadings must not be called on the 404 path')
      }) as unknown as TrustRecordDeps['readOrientationReadings'],
    }
    const res404Orient = await runTrustRecordGet('test:unknown@v1', orient404Deps)
    assert(res404Orient.status === 404, 'S6-8b ENV-1 404 precedes the orientation read (bomb untripped)')

    // S6-8c (2026-08-08 examined/observed fold, mentor ruling): composeTrustRecordPayload
    // selects the FIXED observed-class wording regardless of the underlying
    // reading — the examined class keeps the existing per-reading templates
    // (S6-2/S6-3 above already cover examined; this covers observed).
    const observedComposed = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      orientationReadings: {
        entries: [
          { reading: 'toward', occurredAt: '2026-08-08T09:00:00.000Z', deliveryClass: 'observed' },
          { reading: 'away', occurredAt: '2026-08-08T08:00:00.000Z', deliveryClass: 'observed' },
          { reading: 'indeterminate', occurredAt: '2026-08-08T07:00:00.000Z', deliveryClass: 'observed' },
        ],
        capped: false,
      },
      generatedAt: NOW,
    })
    const observedEntries = observedComposed.record.orientation_readings ?? []
    assert(observedEntries.length === 3, 'S6-8c-0 all three observed entries composed')
    assert(
      observedEntries.every((e) => e.class === 'observed'),
      'S6-8c-1 every entry carries class:\'observed\'',
    )
    assert(
      observedEntries.every((e) => e.entry_text === ORIENTATION_OBSERVED_ENTRY_TEXT),
      'S6-8c-2 EVERY observed entry uses the FIXED observed entry text, regardless of its underlying reading (toward/away/indeterminate all identical)',
    )
    assert(
      observedEntries.every((e) => e.not_attestable_clause === ORIENTATION_OBSERVED_NOT_ATTESTABLE_CLAUSE),
      'S6-8c-3 EVERY observed entry uses the FIXED observed not-attestable clause',
    )
    assert(
      observedEntries.every((e) => e.entry_text !== ORIENTATION_ENTRY_TEXT[e.reading]),
      'S6-8c-4 an observed entry NEVER uses the examined-class per-reading template (the two classes are never confused)',
    )
    // S6-8d: a MIXED batch (both classes in one read) composes each entry
    // independently — the class is per-entry, never a batch-wide default.
    const mixedComposed = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      orientationReadings: {
        entries: [
          { reading: 'toward', occurredAt: '2026-08-08T09:00:00.000Z', deliveryClass: 'examined' },
          { reading: 'toward', occurredAt: '2026-08-08T08:00:00.000Z', deliveryClass: 'observed' },
        ],
        capped: false,
      },
      generatedAt: NOW,
    })
    const mixedEntries = mixedComposed.record.orientation_readings ?? []
    assert(
      mixedEntries[0]?.class === 'examined' &&
        mixedEntries[0]?.entry_text === ORIENTATION_ENTRY_TEXT.toward &&
        mixedEntries[1]?.class === 'observed' &&
        mixedEntries[1]?.entry_text === ORIENTATION_OBSERVED_ENTRY_TEXT,
      'S6-8d a mixed batch composes each entry by its OWN class, independently (identical reading, different wording)',
    )

    // S6-9: handler flag-on + read outage ⇒ 200 still served (never blocks).
    const outageDeps: TrustRecordDeps = {
      ...liveDeps,
      isOrientationEnabled: () => true,
      readOrientationReadings: async () => ({ ok: false, error: 'boom' }),
    }
    const errSaved = console.error
    console.error = () => {}
    const resOutage = await runTrustRecordGet(AGENT, outageDeps)
    console.error = errSaved
    const outageBody = (await resOutage.json()) as { data: { record: Record<string, unknown>; notes?: string[] } }
    assert(
      resOutage.status === 200 && !('orientation_readings' in outageBody.data.record),
      'S6-9 orientation outage never blocks the record (200, field omitted)',
    )
  }

  // ── restore env ──────────────────────────────────────────────────────────
  for (const [k, v] of Object.entries(SAVED_ENV)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }

  console.log(`\nS10 trust-record-surface battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('FAILURES:\n' + failures.map((f) => `  - ${f}`).join('\n'))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('BATTERY CRASHED:', e)
  process.exit(1)
})
