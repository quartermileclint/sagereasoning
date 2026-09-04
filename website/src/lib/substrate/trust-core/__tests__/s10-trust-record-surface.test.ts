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
  M6_TOTAL_UNKNOWN_CURATION_DISCLOSURE,
  REFLECT_MODULATE_ONLY_NOTE,
  TRUST_RECORD_ENVELOPE,
} from '../trust-record-payload'
// Slice 3 (2026-08-30) — the provenance_gaps served field's wording pins.
import {
  PROVENANCE_GAP_NOT_ATTESTABLE_CLAUSE,
  PROVENANCE_GAP_REASON_TEXT,
} from '../provenance-classification'
import {
  PROVENANCE_GAPS_ROW_CAP,
  PROVENANCE_LEDGER_RETENTION_DAYS,
} from '../provenance-ledger-store'
import { SERVABLE_PROVENANCE_GAP_REASONS } from '../provenance-classification'
import { ORIENTATION_READINGS_ROW_CAP } from '../trust-core-store'
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

  const verdict = await readTrustVerdict(AGENT, { taskHasJusticeSurface: false, now: NOW, client: fake.client })
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
  // ═══ S2-43..S2-47 — the 2026-08-25 extraction-provenance honesty correction
  // (mentor ruling Q2 + F-2, first edit). S2-37 below is strict reference identity
  // and CANNOT detect a missing envelope item — these substring pins are what
  // actually hold the correction in place. attests[1] had NO content pin of any
  // kind before this edit. Every pin below was mutation-verified at authoring:
  // deleting its clause makes it fail.
  assert(
    env.includes('Extraction origin on caller-supplied consults'),
    'S2-43 envelope: the extraction-origin does-not-attest item (2026-08-25 ruling Q2)',
  )
  assert(
    env.includes('not verified at the point where trust events are minted'),
    'S2-44 envelope: extraction-origin names the MINT POINT, not merely the consult',
  )
  assert(
    env.includes('never as silence'),
    'S2-45 envelope: the F-2 commitment that an unverifiable artifact surfaces as a named coverage gap',
  )
  assert(
    env.includes('This holds for consults whose extraction the server itself produced'),
    'S2-46 envelope: attests[1] is SCOPED to server-produced extractions (2026-08-25)',
  )
  // Founder-elected clause (sign-off package §2b, elected 2026-08-25): stating the
  // indistinguishability plainly rather than stopping at "not verified". Pinned so a
  // later edit cannot quietly soften the correction back toward the original defect.
  assert(
    env.includes('not distinguishable, at that point, from one the server produced'),
    'S2-47 envelope: the founder-elected indistinguishability clause (§2b)',
  )
  // ═══ S2-48/S2-50/S2-52/S2-53/S2-54 + S2-58..S2-61 — the verdict-variance disclosure,
  // carrying the measured rate (mentor rulings 2026-08-30: disclosure, rate-presentation,
  // rate-location; then the n=100 ruling of the same day, below).
  //
  // S2-49 IS DELIBERATELY RETIRED AND MUST NOT BE RE-ADDED. It pinned
  // 'Its rate has not been measured' — the guard against a rate reaching this surface
  // without sign-off. The D6a sweep of 2026-08-30 measured the rate and the founder
  // approved publishing it on 2026-08-31, so the guarded condition is discharged and the
  // pinned string is now FALSE. S2-58 is the standing inverse guard (S2-51, which first
  // held that role at n=50, is itself now retired — see below).
  assert(
    env.includes('Verdict determinism'),
    'S2-48 envelope: the verdict-determinism does-not-attest item exists at all',
  )
  assert(
    env.includes('same code path, model and sampling temperature'),
    'S2-50 envelope: the honest cross-path scoping clause survives (gate-measured, instrument-wide)',
  )
  // ═══ 2026-08-30 n=100 REVISION (mentor ruling: publish n=100; the indeterminacy form;
  // per-probe distributions replace the directional split; class limit at K=20 — verbatim
  // and binding. Founder-signed wording of 2026-08-30, PR19 run.)
  //
  // S2-51 IS DELIBERATELY RETIRED AND MUST NOT BE RE-ADDED. It pinned
  // 'Wilson 95% CI 5.6–23.8%' — the n=50 interval — as the inverse of retired S2-49.
  // The pooled two-sweep n=100 measurement supersedes that figure, so the pinned string is
  // now FALSE. S2-58 replaces it as the same guard at the current figure. Retired as a
  // decision, the way S2-49 was, so the change is a ruling and not a broken test.
  //
  // S2-58 — the current interval, exact. The en-dash in 7.0–19.8% is significant: it must
  // match the envelope byte-for-byte.
  assert(
    env.includes('Wilson 95% CI 7.0\u201319.8%'),
    'S2-58 envelope: the published n=100 interval is exact and cannot be silently altered or dropped',
  )
  // S2-59 — the Q2 characterisation in its ruled form. The apostrophe is ASCII U+0027, NOT
  // the typographic U+2019 the envelope uses elsewhere: an author matching the surrounding
  // register would silently red this pin.
  assert(
    env.includes("the gate's behaviour is indeterminate"),
    'S2-59 envelope: the force-push indeterminacy characterisation (ruling Q2)',
  )
  // S2-60 — the directional decomposition stays OUT (ruling Q3). Pinning only one half
  // passes if that half is removed and the other left standing, so both directions and the
  // mechanism word are pinned absent.
  assert(
    !env.includes('toward blocking') &&
      !env.includes('toward permitting') &&
      !env.includes('decompose'),
    'S2-60 envelope: no directional decomposition is published (ruling Q3)',
  )
  // S2-61 — the K=20 class limit (ruling Q4): what the class label rests on at this sample size.
  assert(
    env.includes('solely by the force-push input'),
    'S2-61 envelope: the class limit is stated — p5-force is the sole distinguishing member',
  )
  // ═══ 2026-08-30 CLASS SPLIT (A5) + two disclosure additions (Ruling Set E: A2, A3 item 1).
  //
  // S2-65 — the Q4 population name. "Borderline" was ruled to conflate two populations that were
  // always different: grave-vocabulary traffic (what the harness and loop submit, and what was
  // measured) and near-boundary inputs (what a disagreement rate is properly about, and on which
  // nothing has been measured). The measured population is named accurately here.
  assert(
    env.includes('grave-vocabulary traffic'),
    'S2-65 envelope: the measured population is named accurately (ruling A5 Q4)',
  )
  // S2-66/S2-67 — the A3 item-1 limit, pinned as TWO assertions on purpose. S2-66 holds the hedge
  // and S2-67 the mechanism: a later edit could keep "evidence, not proof" while dropping the
  // hexis/drift explanation that makes it meaningful, and a single pin would not notice.
  assert(
    env.includes('evidence of stable disposition, not proof'),
    'S2-66 envelope: consistency is evidence of stable disposition, not proof (Ruling Set E, A3)',
  )
  assert(
    env.includes('cannot distinguish hexis'),
    'S2-67 envelope: the hexis-vs-drift mechanism survives, not only the hedge (Ruling Set E, A3)',
  )
  // S2-68 — A2: role-blindness reclassified from a scoping statement to a confirmed deficiency.
  assert(
    env.includes('confirmed design deficiency, not a design choice'),
    'S2-68 envelope: the kathekon role gap is named a deficiency, not a choice (Ruling Set E, A2)',
  )
  // ═══ 2026-08-30 COMPOSITION RULING (p5-force class-composition, verbatim and binding;
  // founder-signed wording of the same day). No figure changes; the disclosure is REORDERED and
  // two statements are added in the mentor's own stated forms.
  //
  // S2-62 — the Q4 composition dependence, published beside the class limit. The class limit alone
  // was ruled "necessary but not sufficient": a recipient could INFER the dependence, and inference
  // is not disclosure. ASCII apostrophe in "set's", as with S2-59.
  assert(
    env.includes("reflects this probe set's composition"),
    'S2-62 envelope: the composition dependence is published, not merely inferable (ruling Q4)',
  )
  // S2-63 — the Q5 stability finding, stated in its own right rather than left as two zeroes.
  assert(
    env.includes('handles with complete stability'),
    'S2-63 envelope: the two 0-of-20 probes are stated as a finding (ruling Q5)',
  )
  // S2-64 — AN ORDERING PIN, and the only one in this battery. Ruling Q1 is a claim about ORDER:
  // the per-input distributions lead and the pooled rate follows, because a headline whose
  // magnitude tracks the probe mix implies a property of the class the data does not support. No
  // substring pin can catch a re-inversion — includes() is order-blind — so this asserts the
  // relative position of the two blocks directly.
  {
    const perInput = env.indexOf('0 of 20')
    const pooled = env.indexOf('pooled rate across this probe set')
    assert(
      perInput !== -1 && pooled !== -1 && perInput < pooled,
      'S2-64 envelope: the per-input distributions precede the pooled rate (ruling Q1 ordering)',
    )
  }
  // Path specificity is BINDING (2026-08-30 rate-location ruling): the rate is
  // /api/guardrail only and the consult path must be stated as unmeasured.
  assert(
    env.includes('No rate has been measured on the consult path (/api/reason)'),
    'S2-52 envelope: /api/reason is stated as unmeasured wherever the rate appears',
  )
  // Founder-elected clause (approved 2026-08-31): the anchor movement reaches the PUBLIC
  // surface as a falsification, not only the ADR. The Q4a ruling requires the class label
  // survive and the anchor be named honestly; it does not require the instrument's own
  // failed calibration check be published. The founder elected to publish it, so it is
  // pinned — a later edit must not quietly soften it back to a bare "the anchor moved".
  assert(
    env.includes('calibration falsification'),
    'S2-54 envelope: the founder-elected anchor-falsification clause (2026-08-31 election)',
  )
  assert(
    !env.includes('Its rate has not been measured'),
    'S2-53 envelope: the retired S2-49 string is GONE — the disclosure no longer claims the rate is unmeasured',
  )
  eq(payload.envelope, TRUST_RECORD_ENVELOPE, 'S2-37 the payload ships THE envelope object')
  eq(payload.interop.published_externally, false, 'S2-38 interop: nothing published externally')

  // ═══ S2-41/S2-42 — Spec 4 / B/M-B: the dispersion member must NEVER reach
  // this surface. Ruling Set B R-3 adopted M-B (the AE-1 delta, agent-facing)
  // and did NOT adopt M-C (a public trust-record field): a public per-agent
  // claim about range would need the §8 envelope amendment as a CO-REQUISITE,
  // and even with it the survivorship bounds make the claim premature.
  //
  // This is TRUE BY CONSTRUCTION today — trust-record-payload.ts has no
  // trajectory import at all — which is exactly why it is worth pinning: a
  // constraint that holds only by nobody having added the import yet is one
  // refactor away from silently becoming false on a maximal-honesty-stakes
  // public surface.
  {
    const wire = JSON.stringify(payload)
    assert(
      !wire.includes('proximity_dispersion') && !wire.includes('dispersion'),
      'S2-41 the public trust record carries NO dispersion member (R-3: M-C not adopted)',
    )
    assert(
      !wire.includes('stddev') && !wire.includes('distinct_levels'),
      'S2-42 nor any dispersion-derived statistic by another name',
    )
  }

  // ═══ §3 — sparse honesty ══════════════════════════════════════════════════
  const AGENT_B = 'test:sparse@v1'
  fake.tables.agent_trust_state.push(
    stateRow({ agent_id: AGENT_B, virtue_domain: 'dikaiosyne', earned_level: 'deliberate' }),
  )
  const verdictB = await readTrustVerdict(AGENT_B, { taskHasJusticeSurface: false, now: NOW, client: fake.client })
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
    readVerdict: (id, opts) => readTrustVerdict(id, { ...opts, taskHasJusticeSurface: false, client: fake.client, strictStore: true }),
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
    // S6-5f (M6, mentor ruling 2026-08-15): the total-UNKNOWN branch cannot
    // quantify the curation effect, so it names the inability to assess it.
    // S6-5d above pins the RETAINED operational clause; this pins the ruled
    // disclosure folded alongside it. (PR19 fold: a sibling substring pin,
    // S6-5e, was dropped — the constant is appended whole at exactly one call
    // site, so any note satisfying this VERBATIM check satisfies the weaker
    // substring check by construction; it added no independent mutation
    // coverage.)
    assert(
      cappedNoCount.notes.some((n) => n.includes(M6_TOTAL_UNKNOWN_CURATION_DISCLOSURE)),
      'S6-5f M6: the ruled disclosure is served VERBATIM, not paraphrased',
    )
    // And the total-KNOWN branch must NOT carry it — it discloses the effect it
    // can actually quantify (the 2026-08-12 curation-via-volume fold). A single
    // shared note would make both branches claim the other's epistemic position.
    assert(
      !capped.notes.some((n) => n.includes('cannot be assessed at this time')),
      'S6-5g M6 rides the total-unknown branch ONLY (the known branch quantifies instead)',
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

  // ═══ §7 — SLICE 3: the provenance_gaps served field, the §10 attestation
  //     amendment, and the ENV-1 gate relaxation (SCOPE §6/§6.5/§10, all RULED;
  //     the wording founder-signed 2026-08-26). Pins start at S2-69 — S2-48 is
  //     long taken (the verdict-variance arc consumed through S2-68).
  {
    // ── S2-69..S2-72: the amended §10 trigger clause + attests[1]'s core claim.
    // Both mutation-verified at authoring: deleting the pinned clause fails.
    const env7 = JSON.stringify(TRUST_RECORD_ENVELOPE)
    assert(
      env7.includes('This disclaimer list will be updated when a structural fix begins enforcing which events are minted;'),
      'S2-69 envelope: the §10 trigger amendment ships EXACTLY the founder-signed clause',
    )
    // The INVERSE guard. The whole point of the amendment is that the old
    // trigger fires at existence rather than enforcement, so its survival
    // anywhere in the envelope is the defect, not a duplicate.
    assert(
      !env7.includes('when a structural fix is in place'),
      'S2-70 envelope: the superseded "is in place" trigger is GONE (inverse guard)',
    )
    // Edit two must not be pre-empted: the commitment stays FUTURE-tense until
    // enforcement (slice 5). agent_provenance_gaps is empty at this edit and the
    // classification pipeline has never run (2026-08-30 finding).
    assert(
      env7.includes('that fix will surface any artifact whose origin it cannot verify'),
      'S2-71 envelope: the commitment is still FUTURE tense (edit two is slice 5, not this one)',
    )
    // attests[1]'s CORE claim — S2-46 pins only its scoping clause, so the
    // sentence the scoping qualifies was itself unpinned.
    assert(
      env7.includes('HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted text'),
      'S2-72 envelope: attests[1]’s core claim (fact 8b — it had no pin on the claim itself)',
    )

    // ── S2-73..S2-77: the composer.
    // Dark (no input) ⇒ NEITHER key. This is what makes the gate relaxation
    // inert flag-off.
    const darkGaps = composeTrustRecordPayload({ verdict, reflectSummary: null, generatedAt: NOW })
    assert(
      !('provenance_gaps' in darkGaps.record) &&
        !('total_provenance_gaps_count' in darkGaps.record),
      'S2-73 no input ⇒ no provenance_gaps key at all (flag-off byte-identity)',
    )

    const gapsOn = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      provenanceGaps: {
        entries: [
          { reason: 'caller_supplied_extraction', occurredAt: NOW_ISO },
          { reason: 'no_ledger_entry', occurredAt: NOW_ISO },
        ],
        capped: false,
        totalCount: 2,
      },
      generatedAt: NOW,
    })
    const served = gapsOn.record.provenance_gaps ?? []
    assert(
      served.length === 2 &&
        served[0].reason_text === PROVENANCE_GAP_REASON_TEXT.caller_supplied_extraction &&
        served[1].reason_text === PROVENANCE_GAP_REASON_TEXT.no_ledger_entry,
      'S2-74 each entry carries its OWN per-reason text (Q2: "had data and it disqualified" ≠ "had no data")',
    )
    // Non-vacuity: the two texts must genuinely differ, or the per-reason pin
    // above passes while the Q2 distinction has been collapsed.
    assert(
      PROVENANCE_GAP_REASON_TEXT.caller_supplied_extraction !==
        PROVENANCE_GAP_REASON_TEXT.no_ledger_entry &&
        PROVENANCE_GAP_REASON_TEXT.out_of_window !== PROVENANCE_GAP_REASON_TEXT.no_ledger_entry &&
        PROVENANCE_GAP_REASON_TEXT.identity_mismatch !== PROVENANCE_GAP_REASON_TEXT.out_of_window,
      'S2-75 the four reason texts are genuinely DISTINCT (non-vacuity guard on S2-74)',
    )
    assert(
      served.every((e) => e.not_attestable_clause === PROVENANCE_GAP_NOT_ATTESTABLE_CLAUSE) &&
        PROVENANCE_GAP_NOT_ATTESTABLE_CLAUSE.includes('did not practise'),
      'S2-76 the did-not-stop-practising clause is INLINE on every entry (F-2 minimum content)',
    )
    // F-2's HARD EXCLUSION, asserted on the served bytes rather than trusted to
    // the store's select list: nothing signature-derived, and correlation_id
    // (the migration's "internal only, NEVER served") is absent.
    const servedJson = JSON.stringify(gapsOn.record.provenance_gaps)
    assert(
      !/signature|correlation/i.test(servedJson) &&
        served.every(
          (e) => Object.keys(e).sort().join(',') === 'not_attestable_clause,occurred_at,reason,reason_text',
        ),
      'S2-77 F-2 hard exclusion: the served entry shape carries NO signature-derived or correlation field',
    )

    // ── S2-78..S2-80: honest-count + outage + unknown-reason behaviour.
    const gapsCapped = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      provenanceGaps: {
        entries: [{ reason: 'out_of_window', occurredAt: NOW_ISO }],
        capped: true,
        totalCount: null,
      },
      generatedAt: NOW,
    })
    assert(
      !('total_provenance_gaps_count' in gapsCapped.record) &&
        gapsCapped.notes.some((n) => n.includes('the total count was unavailable this read')),
      'S2-78 a failed count is OMITTED, never fabricated (SCOPE §6.4 precedent detail 3)',
    )
    const gapsCappedKnown = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      provenanceGaps: {
        entries: [{ reason: 'out_of_window', occurredAt: NOW_ISO }],
        capped: true,
        totalCount: 847,
      },
      generatedAt: NOW,
    })
    assert(
      gapsCappedKnown.record.total_provenance_gaps_count === 847 &&
        gapsCappedKnown.notes.some((n) => n.includes('most recent of 847')),
      'S2-79 capped + count known ⇒ the "showing N of M" honesty rule',
    )
    const gapsOutage = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      provenanceGaps: null,
      generatedAt: NOW,
    })
    assert(
      !('provenance_gaps' in gapsOutage.record) &&
        gapsOutage.notes.some((n) => n.includes('provenance gaps unavailable')),
      'S2-80 read outage ⇒ field omitted + honest note (never fabricated)',
    )
    // An unrecognised reason is DROPPED and SAID SO — never rendered with no
    // text, and never silently swallowed into a shorter list.
    const gapsUnknown = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      provenanceGaps: {
        entries: [
          { reason: 'some_future_reason', occurredAt: NOW_ISO },
          { reason: 'identity_mismatch', occurredAt: NOW_ISO },
        ],
        capped: false,
        totalCount: 2,
      },
      generatedAt: NOW,
    })
    assert(
      (gapsUnknown.record.provenance_gaps ?? []).length === 1 &&
        gapsUnknown.notes.some((n) => n.includes('has no served wording for')),
      'S2-81 an unknown reason is dropped AND disclosed (never rendered blank, never silent)',
    )

    // ── S2-82..S2-85: the handler legs — the ENV-1 gate relaxation (§6.5).
    const gapsDepsBase: TrustRecordDeps = {
      ...liveDeps,
      isProvenanceLedgerEnabled: () => true,
      readProvenanceGaps: async () => ({
        ok: true,
        value: {
          entries: [{ reason: 'no_ledger_entry', occurredAt: NOW_ISO }],
          capped: false,
          totalCount: 1,
        },
      }),
    }
    // THE RULED CONDITION: an agent with NO domain evidence but a gap entry now
    // gets a 200, not a 404. This is the whole point — without it the agent the
    // fix exists to make visible has no public record at all.
    const resRelax = await runTrustRecordGet('test:unknown@v1', gapsDepsBase)
    // Optional-chained on purpose: when this pin FAILS the response is a 404
    // whose body has no `data`, and a battery that CRASHES instead of failing
    // stops every later pin from running. Found by mutation-testing this very
    // pin — the first version dereferenced `.data.record` unguarded.
    const relaxBody = (await resRelax.json()) as {
      data?: { record?: { provenance_gaps?: unknown[]; sparse?: boolean; aggregate?: { level: string | null } } }
    }
    assert(
      resRelax.status === 200 && (relaxBody.data?.record?.provenance_gaps ?? []).length === 1,
      'S2-82 §6.5 relaxation: zero domain evidence + a gap entry ⇒ 200, not 404',
    )
    // The DISCLOSED COST (§6.5.5), asserted so it cannot be forgotten: that 200
    // carries a null aggregate level and sparse:true, honestly. An integration
    // that reads 200 as "evaluative" must additionally check aggregate.level.
    // PR25 HONESTY MARKER (PR19 round 2): S2-83 CHARACTERISES the disclosed cost;
    // it does not defend it. Both fields restate the fixture's own construction and
    // pre-existing composer wiring this slice does not touch, so a
    // semantics-preserving rewrite of either leaves it green. The property that
    // genuinely defends §6.5.5 — that this same agent 404s flag-off, so the
    // non-evaluative 200 is reachable ONLY via the relaxed path — is held by S2-84.
    assert(
      relaxBody.data?.record?.aggregate?.level === null && relaxBody.data?.record?.sparse === true,
      'S2-83 the relaxed 200 honestly serves a NULL aggregate level + sparse:true (§6.5.5 disclosed cost)',
    )
    // Flag-off byte-identity of the GATE itself, not merely of the field: the
    // same zero-evidence agent still 404s when the ledger flag is off, and the
    // read is never called (bomb untripped).
    // Split into two pins deliberately (the first version combined them behind a
    // throwing bomb, so an over-relaxed gate CRASHED the battery instead of
    // failing it — found by mutation-testing). S2-84 proves the gate is genuinely
    // TIED TO THE FLAG using a non-throwing read that WOULD return a gap entry;
    // S2-84b separately proves no read happens at all flag-off.
    const resOff = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      isProvenanceLedgerEnabled: () => false,
    })
    assert(
      resOff.status === 404,
      'S2-84 flag-off ⇒ the ENV-1 gate is byte-identical even when gaps EXIST (tied to the ledger flag)',
    )
    let gapsReadCalled = false
    await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      isProvenanceLedgerEnabled: () => false,
      readProvenanceGaps: async () => {
        gapsReadCalled = true
        return { ok: true as const, value: { entries: [], capped: false, totalCount: 0 } }
      },
    })
    assert(!gapsReadCalled, 'S2-84b flag-off ⇒ ZERO DB work: the gaps read is never called')
    // Flag-on but ZERO gaps ⇒ still 404. The relaxation admits gap entries, not
    // the bare rows ENV-1 exists to exclude.
    const resNoGaps = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      readProvenanceGaps: async () => ({ ok: true, value: { entries: [], capped: false, totalCount: 0 } }),
    })
    assert(resNoGaps.status === 404, 'S2-85 flag-on + zero gaps ⇒ still 404 (ENV-1’s bare-row exclusion intact)')

    // ── S2-86..S2-87: a 404 is a POSITIVE claim about absence, so it may only
    // be made from a read that succeeded (the S10-ABUSE-1 lesson, applied to the
    // read this slice adds).
    const errSaved7 = console.error
    console.error = () => {}
    const resFail404 = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      readProvenanceGaps: async () => ({ ok: false, error: 'boom' }),
    })
    // ...but where a domain DOES carry evidence, the same outage never blocks
    // the record — a supplementary read's failure is not the primary record's.
    const resFail200 = await runTrustRecordGet(AGENT, {
      ...gapsDepsBase,
      readProvenanceGaps: async () => ({ ok: false, error: 'boom' }),
    })
    console.error = errSaved7
    assert(
      resFail404.status === 503 && resFail404.headers.get('Cache-Control') === 'no-store',
      'S2-86 gaps read fails + no domain evidence ⇒ 503 no-store, NEVER a false cacheable 404',
    )
    const fail200Body = (await resFail200.json()) as {
      data: { record: Record<string, unknown>; notes: string[] }
    }
    assert(
      resFail200.status === 200 &&
        !('provenance_gaps' in fail200Body.data.record) &&
        fail200Body.data.notes.some((n) => n.includes('provenance gaps unavailable')),
      'S2-87 same outage with domain evidence present ⇒ 200, field omitted, honest note',
    )

    // PR25 HONESTY MARKER (PR19 round 2): S2-88 is WEAK and is retained as
    // documentation, not as defence. An independent reviewer's unguarded-deref
    // mutation CRASHED the battery at an earlier pre-existing test before this
    // scenario ran — the very class S2-82/S2-84 were hardened against — and it
    // adds no coverage S2-84b does not already give. Labelled, not counted.
    // ── S2-88: back-compat. A pre-slice-3 deps object (no provenance fns) still
    // serves exactly as before.
    const resPreSlice3 = await runTrustRecordGet(AGENT, liveDeps)
    const preBody = (await resPreSlice3.json()) as { data: { record: Record<string, unknown> } }
    assert(
      resPreSlice3.status === 200 && !('provenance_gaps' in preBody.data.record),
      'S2-88 pre-slice-3 deps ⇒ 200, field absent (back-compat)',
    )

    // ── S2-95..S2-99 — the SECOND PR19 fold (2026-08-30). An independent
    //    reviewer broke the Q2 distinction by replacing all four reason texts
    //    with 'provenance unverified 1..4' and scored 179/0: S2-74 compares the
    //    served value against the constant that produced it (wiring only) and
    //    S2-75 asserts only pairwise INEQUALITY. Four numbered strings satisfy
    //    both while collapsing the ruling. The pins below are anchored on the
    //    MEANING, in the words, so the collapse cannot pass.
    const T = PROVENANCE_GAP_REASON_TEXT
    assert(
      /had data and the data disqualified the mint/.test(T.caller_supplied_extraction) &&
        /absence of instrument data, not a finding about the artifact/.test(T.no_ledger_entry) &&
        /limit on what the instrument will accept, not a finding about the artifact/.test(T.out_of_window) &&
        /do not resolve to the same longitudinal scope/.test(T.identity_mismatch),
      'S2-95 the Q2 distinction is IN THE WORDS: absence-of-data vs data-that-disqualified',
    )
    // The inverse half: only ONE reason may claim a positive finding. Without
    // this, wording drift could let an absence reason assert the disqualifying
    // claim — the Q2 collapse in the other direction.
    assert(
      ![T.no_ledger_entry, T.out_of_window, T.identity_mismatch].some((x) =>
        /the data disqualified/.test(x),
      ),
      'S2-95b no absence-reason claims a positive finding (inverse half of the Q2 pin)',
    )
    // F-2's minimum content is TWO commitments; S2-76 pinned only the first.
    assert(
      PROVENANCE_GAP_NOT_ATTESTABLE_CLAUSE.includes('never a finding about the agent'),
      'S2-96 the clause carries its SECOND commitment too (not-a-finding-about-reasoning)',
    )
    // The vocabulary widening that passed BOTH tsc and the battery while silently
    // dropping entries: the serve set is now DERIVED from the wording map, so this
    // pin ties the type, the map and the filter to one number.
    assert(
      SERVABLE_PROVENANCE_GAP_REASONS.length === 4 &&
        Object.keys(PROVENANCE_GAP_REASON_TEXT).length === 4 &&
        SERVABLE_PROVENANCE_GAP_REASONS.every((r) => typeof T[r] === 'string'),
      'S2-97 the servable set is DERIVED from the wording map and is exactly the ruled four',
    )
    // The migration's CHECK is the third copy of the vocabulary and NOTHING read
    // it. A widening there, ahead of the code, is now detected here.
    const gapsMigration = fs.readFileSync(
      path.join(process.cwd(), 'supabase-agent-provenance-gaps-migration.sql'),
      'utf8',
    )
    const checkBlock = gapsMigration.slice(
      gapsMigration.indexOf('reason TEXT NOT NULL CHECK'),
      gapsMigration.indexOf('occurred_at  TIMESTAMPTZ'),
    )
    assert(
      SERVABLE_PROVENANCE_GAP_REASONS.every((r) => checkBlock.includes(`'${r}'`)) &&
        (checkBlock.match(/'[a-z_]+'/g) ?? []).length === SERVABLE_PROVENANCE_GAP_REASONS.length,
      'S2-98 the migration CHECK vocabulary matches the served vocabulary exactly (no third-copy drift)',
    )
    // Newest-first is a documented wire contract resting on ONE store line that
    // no pin read. The author grepped .select and .limit but not .order.
    const storeSrcOrder = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/substrate/trust-core/provenance-ledger-store.ts'),
      'utf8',
    )
    const gapsFn = storeSrcOrder.slice(storeSrcOrder.indexOf('export async function readProvenanceGaps'))
    assert(
      /\.order\('occurred_at',\s*\{\s*ascending:\s*false\s*\}\)/.test(gapsFn) &&
        /\.slice\(0, PROVENANCE_GAPS_ROW_CAP\)/.test(gapsFn),
      'S2-99 INV: newest-first ordering AND the slice bound both use the constant (unpinned before)',
    )
    // The cap VALUE — S2-90 pinned the probe's shape symbolically, never the number.
    assert(
      PROVENANCE_GAPS_ROW_CAP === 50 && PROVENANCE_GAPS_ROW_CAP === ORIENTATION_READINGS_ROW_CAP,
      'S2-100 the cap is 50 and tracks its C2c precedent (the shape pin never held the number)',
    )
    // REAL_DEPS wiring: every handler pin injects deps, so nothing connected the
    // production route to the real flag and the real store fn.
    const handlerSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/trust-record/[agent_id]/handler.ts'),
      'utf8',
    )
    const realDeps = handlerSrc.slice(
      handlerSrc.indexOf('const REAL_DEPS'),
      handlerSrc.indexOf('function json('),
    )
    assert(
      /isProvenanceLedgerEnabled,/.test(realDeps) &&
        /readProvenanceGaps: \(agentId\) => readProvenanceGaps\(agentId\)/.test(realDeps),
      'S2-101 INV: REAL_DEPS binds the REAL flag and the REAL store read (only injected deps were tested)',
    )
    // Present-but-empty vs absent is the consumer-visible semantics of the field;
    // only the ABSENT branches were pinned.
    const presentEmpty = await runTrustRecordGet(AGENT, {
      ...liveDeps,
      isProvenanceLedgerEnabled: () => true,
      readProvenanceGaps: async () => ({ ok: true, value: { entries: [], capped: false, totalCount: 0 } }),
    })
    const peBody = (await presentEmpty.json()) as {
      data: { record: Record<string, unknown> & { provenance_gaps?: unknown[] } }
    }
    assert(
      presentEmpty.status === 200 &&
        'provenance_gaps' in peBody.data.record &&
        (peBody.data.record.provenance_gaps ?? []).length === 0 &&
        peBody.data.record.total_provenance_gaps_count === 0,
      'S2-102 "looked, found none" is served as an EMPTY list, distinct from dark/outage omission',
    )

    // ── S2-103: THE 404 BODY DESCRIBES ITS OWN GATE. Slice 3 widened the gate
    //    to `no examined evidence AND no servable gap entry` and published both
    //    halves on all three R18 surfaces, but the served 404 message still
    //    named only the first — a served-message / published-contract mismatch,
    //    found by the slice-3 LIVE curl verification rather than by any local
    //    sweep, and carried into 2026-08-31 as the slice-3 tail.
    //
    //    Pinned in BOTH directions, deliberately, because each direction guards
    //    a different failure:
    //      (a) drop the clause  -> the mismatch returns;
    //      (b) emit it always   -> the handler asserts an absence it never
    //                              checked (flag-off the gaps read does not
    //                              run), which is the S10-ABUSE-1 sin the 503
    //                              branch exists to prevent.
    //    A one-directional pin would have passed the naive "just append it"
    //    fix, which is why (b) is here.
    const GAPS_CLAUSE = 'no provenance-gap entry is available to surface for it'
    // Provenance of this constant, VERIFIED against git history rather than
    // asserted (PR19 LOW): the message is byte-unchanged across a802fcd (the
    // original S10 build) -> f3eabc7 -> c06fa6a -> 253580a -> df894ec (slice 3).
    // It has never differed since the surface existed, so "PRE_SLICE3" names it
    // accurately and no rename is warranted.
    const PRE_SLICE3_404_MESSAGE =
      'No trust record is available for agent: test:unknown@v1. ' +
      'No examined trust evidence has been folded for it ' +
      '(declaration-class records alone do not surface a public record).'

    // (a) Flag-on, read succeeded, zero gaps: the gate looked at TWO things, so
    //     the body must name two.
    //     PR19 fold: asserted as a FULL STRING, not a substring pair. The first
    //     version checked only `.includes(GAPS_CLAUSE) && .includes('declaration-
    //     class')`, which a divergent flag-on template (wrong separator, dropped
    //     agent id, duplicated clause) would have passed — 103b pins the whole
    //     string only on the flag-OFF branch.
    const FLAG_ON_404_MESSAGE =
      PRE_SLICE3_404_MESSAGE.slice(0, -1) +
      ', and no provenance-gap entry is available to surface for it.'
    const res404On = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      readProvenanceGaps: async () => ({ ok: true, value: { entries: [], capped: false, totalCount: 0 } }),
    })
    const body404On = (await res404On.json()) as { message: string }
    assert(
      res404On.status === 404 &&
        body404On.message === FLAG_ON_404_MESSAGE &&
        body404On.message.includes(GAPS_CLAUSE) &&
        body404On.message.includes('declaration-class'),
      'S2-103 flag-on 404 names BOTH halves of the gate it actually evaluated',
    )

    // (b) Flag-off: the read never ran, so the body must claim only what it
    //     checked -- and byte-identically to its pre-slice-3 self.
    const res404Off = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      isProvenanceLedgerEnabled: () => false,
    })
    const body404Off = (await res404Off.json()) as { message: string }
    assert(
      res404Off.status === 404 &&
        !body404Off.message.includes(GAPS_CLAUSE) &&
        body404Off.message === PRE_SLICE3_404_MESSAGE,
      'S2-103b flag-off 404 asserts ONLY the half it checked, byte-identical to pre-slice-3',
    )

    // (c) Flag-on with unservable-only rows still 404s (S2-92) -- and the body
    //     still names both halves, because the read DID happen. This is why the
    //     wording is "available to surface" and not "no gap entry exists": rows
    //     can exist while none is renderable, and the gate counts the rendered
    //     set. The looser wording would overstate what was established.
    const res404Unservable = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      readProvenanceGaps: async () => ({
        ok: true,
        value: { entries: [{ reason: 'some_future_reason', occurredAt: NOW_ISO }], capped: false, totalCount: 1 },
      }),
    })
    const body404Unservable = (await res404Unservable.json()) as { message: string }
    assert(
      res404Unservable.status === 404 && body404Unservable.message.includes(GAPS_CLAUSE),
      'S2-103c unservable-only rows: still 404, and the body still names the half that was read',
    )

    // (d) THE HALF-PRESENT DEPS CELL -- flag fn present, read fn ABSENT.
    //     PR19 HIGH (independent review, 2026-08-31). Without this pin the set
    //     proved only "clause iff FLAG", while the handler's stated invariant --
    //     and its code -- is "clause iff the read actually RAN". Those two agree
    //     in every cell EXCEPT this one, because the read is guarded on BOTH the
    //     flag fn and the read fn being present (handler.ts, the `if` above the
    //     gaps read). The reviewer demonstrated the gap by mutating the handler
    //     to `deps.isProvenanceLedgerEnabled?.() === true` -- the whole battery
    //     stayed GREEN at 197/0 while the half-present cell wrongly asserted an
    //     absence nothing had checked. That is the exact S10-ABUSE-1 sin the
    //     conditional exists to prevent, so it must not be reachable by mutation.
    //     S2-94 already visits this cell but asserts only the STATUS.
    const resHalfMsg = await runTrustRecordGet('test:unknown@v1', {
      ...liveDeps,
      isProvenanceLedgerEnabled: () => true,
    })
    const bodyHalfMsg = (await resHalfMsg.json()) as { message: string }
    assert(
      resHalfMsg.status === 404 &&
        !bodyHalfMsg.message.includes(GAPS_CLAUSE) &&
        bodyHalfMsg.message === PRE_SLICE3_404_MESSAGE,
      'S2-103d flag ON but read fn ABSENT: no read ran, so the body must NOT claim the gaps half',
    )

    // ── S2-91..S2-94: the PR19 folds of 2026-08-30. Each pins a property a
    //    reviewer had to find because no pin held it.

    // S2-91 — THE EMPTY-STATE DISCLOSURE. Without it the record serves
    // `provenance_gaps: []` + `total_provenance_gaps_count: 0` with no note: a
    // machine-readable claim that this agent's artifacts were checked and none
    // failed, from a pipeline that has never run. Pinned in BOTH directions, so
    // the note cannot become unconditional either.
    const emptyGaps = composeTrustRecordPayload({
      verdict,
      reflectSummary: null,
      provenanceGaps: { entries: [], capped: false, totalCount: 0 },
      generatedAt: NOW,
    })
    assert(
      (emptyGaps.record.provenance_gaps ?? []).length === 0 &&
        emptyGaps.record.total_provenance_gaps_count === 0 &&
        emptyGaps.notes.some((n) => n.includes('record-only phase')) &&
        emptyGaps.notes.some((n) => n.includes('not a finding that this agent’s artifacts had verified origins')),
      'S2-91 an EMPTY provenance_gaps carries the record-only note (never a bare, unqualified zero)',
    )
    assert(
      !gapsOn.notes.some((n) => n.includes('record-only phase')),
      'S2-91b the record-only note fires ONLY when the list is empty (not unconditionally)',
    )

    // S2-92 — the gate counts what is RENDERABLE, not raw store rows. A row set
    // consisting only of unrenderable reasons must NOT flip a 404 to a cacheable
    // 200 whose provenance_gaps is [].
    const resUnrenderable = await runTrustRecordGet('test:unknown@v1', {
      ...gapsDepsBase,
      readProvenanceGaps: async () => ({
        ok: true,
        value: { entries: [{ reason: 'some_future_reason', occurredAt: NOW_ISO }], capped: false, totalCount: 1 },
      }),
    })
    assert(
      resUnrenderable.status === 404,
      'S2-92 an unrenderable-only gap set does NOT relax the gate (gate counts the served set)',
    )

    // S2-93 — DRIFT LOCK. The retention window appears in the constant, the
    // migration interval, and (until this fold, as prose) the served text. The
    // text now interpolates the constant; this pins that it still does, so the
    // two cannot silently diverge again.
    assert(
      PROVENANCE_GAP_REASON_TEXT.out_of_window.includes(`${PROVENANCE_LEDGER_RETENTION_DAYS}-day`),
      'S2-93 the out_of_window text carries the retention constant, not a hardcoded number',
    )
    // And the frequency claim the review struck must not creep back.
    assert(
      !PROVENANCE_GAP_REASON_TEXT.no_ledger_entry.includes('most often'),
      'S2-93b no_ledger_entry makes NO frequency claim (inverse guard on the struck "most often")',
    )

    // S2-94 — the half-present deps cell (flag fn present, read fn absent). Not
    // production-reachable, but it is the vacuous-pass shape: it must behave as
    // pre-slice-3 rather than throw or half-apply.
    const resHalf = await runTrustRecordGet('test:unknown@v1', {
      ...liveDeps,
      isProvenanceLedgerEnabled: () => true,
    })
    assert(resHalf.status === 404, 'S2-94 flag fn present + read fn absent ⇒ pre-slice-3 behaviour, no throw')

    // ── S2-89..S2-90: INV source-grep wiring pins — the store read's two
    // load-bearing disciplines, which no composer test can observe.
    const storeSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/substrate/trust-core/provenance-ledger-store.ts'),
      'utf8',
    )
    const gapsReadSrc = storeSrc.slice(storeSrc.indexOf('export async function readProvenanceGaps'))
    assert(
      /\.select\('reason,\s*occurred_at'\)/.test(gapsReadSrc),
      'S2-89 INV: the serving read selects ONLY reason + occurred_at (F-2 exclusion structural at the QUERY)',
    )
    assert(
      /\.limit\(PROVENANCE_GAPS_ROW_CAP \+ 1\)/.test(gapsReadSrc) &&
        /rows\.length > PROVENANCE_GAPS_ROW_CAP/.test(gapsReadSrc),
      'S2-90 INV: the cap is enforced at the STORE READ via a genuine +1 truncation probe (§6.4 detail 2)',
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
