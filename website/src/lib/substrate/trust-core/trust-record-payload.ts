/**
 * trust-record-payload.ts — Trust Layer S10: the PURE composer for the public
 * trust-record read surface (GET /api/trust-record/{agent_id}).
 *
 * Composes the wire payload from a TrustVerdict (harness-integration Section E)
 * + the honest reflect summary. No I/O, no env, no clock beyond the injected
 * `generatedAt` — decay is already realized upstream (computeEffectiveDomain,
 * lazy-on-read E3), so this module serves DECAYED TRUTH, never stale rows.
 *
 * ── The honest-claims envelope (ADR-013 §8, as narrowed 2026-07-12) ──────────
 * TRUST_RECORD_ENVELOPE below is the R18 boundary this surface publishes inside.
 * It carries the PA-6 narrowing (reflect events are record-backed + screened-
 * examination-backed, honesty-gated, MODULATE-ONLY — never level-raising) and
 * the PA-10 disclosure (the stale-artifact replay class). The S10 battery locks
 * its load-bearing phrases against drift; the staged R18 docs quote it.
 *
 * ── What is deliberately NOT served (design decisions of record, S10) ────────
 * - The S4 intervention recommendation. The v1 public claim is per-domain
 *   levels + confidence + coverage + the envelope (build plan §S10); the
 *   recommendation is orchestrator-facing intervention machinery (MEASURE), and
 *   publishing it would read as SageReasoning advising third parties whether to
 *   proceed — beyond the v1 claim.
 * - The event ledger. Only the state fold is served: event payloads can carry
 *   passion sub-species detail (suppression watch) and per-write internals;
 *   the R17e-adjacent conservative posture is state-fold-only in v1.
 * - Any A5 confidence tier this build does not genuinely compute per verdict.
 *   The aggregate confidence weight is served with its honest basis: the
 *   STRUCTURAL + CONSERVATIVE read-time synthesis readTrustVerdict documents.
 *
 * Interop (founder election 4 — design-for, ship native): the shape is
 * VC-claims-mappable (subject / issuer / claims-per-domain / evidence basis)
 * and versioned for an A2A extension; NOTHING is published to any external
 * registry — `interop.published_externally` states it on the wire.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import {
  ORIENTATION_ENTRY_TEXT,
  ORIENTATION_NOT_ATTESTABLE_CLAUSE,
} from '@/lib/translation-sandwich/orientation-reading'
import type { TrustVerdict } from './harness-integration'
import type { EffectiveDomainTrust, VirtueTrustDomain } from './types'

// ============================================================================
// THE HONEST-CLAIMS ENVELOPE (ADR-013 §8; PA-6 narrowed; PA-10 disclosed)
// ============================================================================

export const TRUST_RECORD_ENVELOPE = {
  attests: [
    'Signed, reproducible examination artifacts (Ed25519-verifiable against GET /api/public-key) exist for the examination-derived trust events this record aggregates — the R18f-parallel rule: no examination-derived event is folded without a re-verified signed assessment. Reflect-path events are the disclosed exception: they are backed by the retained reflect-session record and, where the out-of-band screened examination ran, its deterministic completion against the agent’s verbatim reflection — honesty-gated, and modulate-only (they cannot raise any trust level).',
    'HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted text: examination before acting, justice structure over the affected circles named in the text, passion diagnosis, and proximity to right reason with per-domain floors.',
    'The decay and coverage state of each virtue domain, honestly marked: levels decay with domain inactivity toward the profile prior; sparse evidence and unevaluated domains are named, never papered over.',
    'The confidence basis of the aggregate: a structural, conservative read-time synthesis (signed artifacts; corroboration floored at "uncorroborated"; recency from the decay state) — the weakest contributing domain sets the aggregate confidence.',
  ],
  does_not_attest: [
    'Factual correctness. The instrument reads how a decision was reasoned, not whether it was factually right. It is not a fact-checker (the D3 scoping bound).',
    'Harms omitted from the submitted text. The corroboration check corroborates self-reports against the submitted text only; a cleanly-narrated account that omits a real harm scores high (the disclosed extraction-trust ceiling: the A2 self-report-omission class). At the delegation level, a genuinely uncatchable justice failure produces a developmental flag, not a detected violation (the A9 case-3 class).',
    'Freshness beyond the artifact record. A genuinely-earned signed assessment re-submitted inside later writes can sustain a domain at — never above — its once-demonstrated proximity (the disclosed stale-artifact replay class, PA-10; structural closure is scheduled with recency-tier confidence weighting at the S2 fold wiring).',
    'Reasoning quality beyond what the signed artifacts carry. No claim rests on agent self-report alone; a reflect history is a modulate-only record, not a verified pattern of honesty.',
    'Future behaviour. Trust here is evaluative and present-looking; it decays without exercise and is never a prediction or a guarantee.',
    'Fitness as a training signal. Weights-tier claims are blocked.',
    'Fifth-circle alignment: orientation_readings entries describe single examinations (each carries its own inline clause); the record cannot attest that the agent is fifth-circle-aligned (mentor Q6).',
  ],
  honest_limit:
    'This record is an attestation composed server-side from consumer-unforgeable trust events under a 90-day retention regime — not a cryptographic proof of the agent’s inner states, and not a certification of safety, ethics, or trustworthiness in any absolute sense (R18a). MEASURE mode: nothing in this record binds any decision; a human’s right to override is absolute regardless of any level shown here (R20c).',
} as const

// ============================================================================
// WIRE TYPES (sage-trust-record/v1)
// ============================================================================

export interface TrustRecordDomainView {
  domain: VirtueTrustDomain
  /** The LIVE level: earned, decayed toward the prior, justice-capped. */
  effective_level: KatorthomaProximity
  earned_level: KatorthomaProximity
  profile_prior: KatorthomaProximity
  decay_steps_applied: number
  reflect_modulated: boolean
  justice_capped: boolean
  coverage_status: string | null
  has_evidence: boolean
}

export interface TrustRecordAggregateView {
  /** Minimum-domain level across the evaluated CARDINAL domains (spec 6); null
   *  when no cardinal domain carries evidence. Categorical, never a score. */
  level: KatorthomaProximity | null
  limiting_domain: VirtueTrustDomain | null
  resolution: 'combined' | 'pause-escalate'
  any_conflict: boolean
  any_justice_capped: boolean
  coverage_gaps: VirtueTrustDomain[]
  /** The weakest contributing domain's S2 evidence weight (derived scalar; the
   *  LEVEL is the canonical output). */
  confidence_weight: number
  confidence_basis: string
  basis: string
}

export interface TrustRecordReflectView {
  /** Count of reflect-completed-honest events (honest BY CONSTRUCTION in the
   *  deriver). Served as a modulate-only record — see `class` + `note`. */
  honest_reflect_count: number
  latest_honest_reflect_at: string | null
  class: 'modulate-only'
  note: string
}

/**
 * Agent-circles C2c (2026-08-08) — one served orientation-reading entry. The
 * NAMED, BOUNDED exception to S10's state-fold-only posture (the C2c placement
 * ruling + scope §4.5; the reflect-summary cap precedent): a capped
 * recent-entries list composed from the three orientation-reading-* ledger
 * events. Every entry carries the not-attestable clause INLINE — "the entry is
 * the unit that will be read in isolation" (the ruling's structural addition).
 * The entry describes ONE examination's direction, never the agent's standing;
 * nothing here is an aggregation, a trend, or a score.
 */
export interface TrustRecordOrientationEntry {
  reading: 'toward' | 'away' | 'indeterminate'
  /** ORIENTATION_ENTRY_TEXT[reading] — the examination-not-agent template. */
  entry_text: string
  /** ORIENTATION_NOT_ATTESTABLE_CLAUSE, verbatim, EVERY entry. */
  not_attestable_clause: string
  occurred_at: string
}

export interface TrustRecordPayload {
  schema: 'sage-trust-record/v1'
  subject: { agent_id: string }
  issuer: 'https://www.sagereasoning.com'
  generated_at: string
  /** MEASURE until the S11 founder-walked ENFORCE activation — binds nothing. */
  mode: 'measure'
  record: {
    domains: TrustRecordDomainView[]
    aggregate: TrustRecordAggregateView
    unevaluated_cardinal_domains: string[]
    sparse: boolean
    reflect_record: TrustRecordReflectView | null
    /** C2c: ABSENT entirely while SUBSTRATE_ORIENTATION_READING_ENABLED is
     *  unset (byte-identical payload — the established optional-field
     *  pattern); flag-on, the capped recent-entries list (newest first). */
    orientation_readings?: TrustRecordOrientationEntry[]
    /** Mentor §6(b) ruling (2026-08-08, C2d sign-off): the TOTAL count of
     *  orientation-reading events, served alongside the capped list so a
     *  reader sees "showing 50 of 847" rather than inferring completeness —
     *  the honest-scope disclosure for the recency-ordered window. Present
     *  whenever orientation_readings is present AND the count read succeeded
     *  (omitted on a transient count failure — never fabricated). */
    total_orientation_readings_count?: number
  }
  envelope: typeof TRUST_RECORD_ENVELOPE
  evidence: {
    artifact_note: string
    retention: { window_days: 90; note: string }
  }
  interop: {
    design_shapes: string[]
    published_externally: false
    note: string
  }
  notes: string[]
}

export const REFLECT_MODULATE_ONLY_NOTE =
  'Reflect events modulate decay only (half-rate cap; screened at quarter-rate). ' +
  'They cannot raise any trust level and are not attested as a verified pattern of honesty.'

const ARTIFACT_NOTE =
  'Examination-derived trust events fold only from Ed25519-re-verified signed assessments ' +
  '(verify against GET /api/public-key). Reflect-path events are backed by the retained ' +
  'reflect-session record and the out-of-band screened examination where it ran — modulate-only.'

const RETENTION_NOTE =
  'Trust events and state sweep at retain_until (90 days); the record is erasable on request ' +
  '(R17 — owner deletion, credential erasure).'

const CONFIDENCE_BASIS =
  'Structural, conservative read-time synthesis: every folded event is R18f-re-verified ' +
  '(signature: signed); depth standard; corroboration floored at "uncorroborated" (the fold ' +
  'retains no per-verdict corroboration); recency from the decay state. The weakest ' +
  'contributing domain sets the aggregate confidence (mentor A5: the weakest dimension is the ceiling).'

const INTEROP_NOTE =
  'Design-for-interop, shipped native (founder election 4): the payload is W3C-VC-claims-mappable ' +
  '(subject/issuer/claims-per-domain/evidence-basis) and versioned as an A2A-extension-shaped schema. ' +
  'Nothing is published to any external registry or standard body at v1.'

// ============================================================================
// COMPOSER (pure)
// ============================================================================

function domainView(d: EffectiveDomainTrust): TrustRecordDomainView {
  return {
    domain: d.virtueDomain,
    effective_level: d.effectiveLevel,
    earned_level: d.earnedLevel,
    profile_prior: d.profilePrior,
    decay_steps_applied: d.decayStepsApplied,
    reflect_modulated: d.reflectModulated,
    justice_capped: d.justiceCapped,
    coverage_status: d.coverageStatus ?? null,
    has_evidence: d.hasEvidence,
  }
}

export interface ComposeTrustRecordInput {
  verdict: TrustVerdict
  reflectSummary: {
    honestReflectCount: number
    latestHonestReflectAt: string | null
    capped?: boolean
  } | null
  /** C2c (2026-08-08): the capped orientation-readings ledger slice.
   *  `undefined` ⇒ the orientation surface is dark (flag off) — the payload
   *  carries NO orientation_readings key at all (byte-identity). `null` ⇒ the
   *  flag is on but the read failed honestly — the field is omitted this read
   *  with an honest note (the reflect-summary outage posture). A value ⇒
   *  composed entries, each carrying the inline not-attestable clause, plus
   *  the mentor-§6(b) total count (null ⇒ count omitted, never fabricated). */
  orientationReadings?: {
    entries: { reading: string; occurredAt: string }[]
    capped: boolean
    totalCount?: number | null
  } | null
  /** Injected read time (the route passes new Date(); tests pin it). */
  generatedAt: Date
}

/**
 * Compose the public payload. PRECONDITION (enforced by the handler): the
 * verdict is not dark, its profile is non-null, and the profile is non-empty
 * (an empty profile is a 404 honest miss, composed nowhere).
 *
 * `reflectSummary` null ⇒ the summary read failed honestly upstream: the record
 * ships WITHOUT a reflect_record and with an honest note — a supplementary
 * field's outage never fabricates and never blocks the primary record.
 */
export function composeTrustRecordPayload(input: ComposeTrustRecordInput): TrustRecordPayload {
  const profile = input.verdict.profile
  if (!profile) {
    throw new Error('composeTrustRecordPayload requires a non-null profile (handler precondition)')
  }
  const aggregate = input.verdict.aggregate

  const notes: string[] = []
  if (input.reflectSummary === null) {
    notes.push('reflect summary unavailable (fail-honest) — reflect_record omitted this read')
  }
  if (input.reflectSummary?.capped) {
    notes.push(
      'honest_reflect_count is capped at the bounded read window (older events not counted — under-reporting, the safe direction)',
    )
  }
  // C2c: compose the orientation entries (flag-on only — `undefined` means the
  // surface is dark and the key must be absent entirely). Defensive filter to
  // the three known readings so a future vocabulary widening can never render
  // an entry with no template text.
  let orientationEntries: TrustRecordOrientationEntry[] | undefined
  if (input.orientationReadings === null) {
    notes.push(
      'orientation readings unavailable (fail-honest) — orientation_readings omitted this read',
    )
  } else if (input.orientationReadings !== undefined) {
    orientationEntries = input.orientationReadings.entries
      .filter(
        (e): e is { reading: 'toward' | 'away' | 'indeterminate'; occurredAt: string } =>
          e.reading === 'toward' || e.reading === 'away' || e.reading === 'indeterminate',
      )
      .map((e) => ({
        reading: e.reading,
        entry_text: ORIENTATION_ENTRY_TEXT[e.reading],
        not_attestable_clause: ORIENTATION_NOT_ATTESTABLE_CLAUSE,
        occurred_at: e.occurredAt,
      }))
    if (input.orientationReadings.capped) {
      // Mentor §6(b): the capped note names the total when available, so a
      // reader sees "showing N of M" rather than inferring completeness.
      const total = input.orientationReadings.totalCount
      notes.push(
        (typeof total === 'number'
          ? `orientation_readings shows the ${orientationEntries?.length ?? 0} most recent of ` +
            `${total} total readings (a recency window, not the full record); `
          : 'orientation_readings is capped at the bounded read window (older readings not ' +
            'listed; the total count was unavailable this read); ') +
          'each entry describes one examination only — see its inline not-attestable clause',
      )
    }
  }
  if (profile.unevaluatedCardinalDomains.length > 0) {
    notes.push(
      `unevaluated cardinal domain(s): ${profile.unevaluatedCardinalDomains.join(', ')} — ` +
        'no evidence has been folded for them; absence is a coverage gap, never a level',
    )
  }

  const aggregateView: TrustRecordAggregateView = aggregate
    ? {
        level: aggregate.level,
        limiting_domain: aggregate.limitingDomain,
        resolution: aggregate.resolution,
        any_conflict: aggregate.anyConflict,
        any_justice_capped: aggregate.anyJusticeCapped,
        coverage_gaps: aggregate.coverageGaps,
        confidence_weight: aggregate.aggregateConfidenceWeight,
        confidence_basis: CONFIDENCE_BASIS,
        basis: aggregate.basis,
      }
    : {
        level: null,
        limiting_domain: null,
        resolution: 'combined',
        any_conflict: false,
        any_justice_capped: false,
        coverage_gaps: [],
        confidence_weight: 0,
        confidence_basis: CONFIDENCE_BASIS,
        basis: 'no evaluated cardinal-domain evidence',
      }

  return {
    schema: 'sage-trust-record/v1',
    subject: { agent_id: profile.agentId },
    issuer: 'https://www.sagereasoning.com',
    generated_at: input.generatedAt.toISOString(),
    mode: 'measure',
    record: {
      domains: profile.domains.map(domainView),
      aggregate: aggregateView,
      unevaluated_cardinal_domains: [...profile.unevaluatedCardinalDomains],
      sparse: profile.sparse,
      reflect_record: input.reflectSummary
        ? {
            honest_reflect_count: input.reflectSummary.honestReflectCount,
            latest_honest_reflect_at: input.reflectSummary.latestHonestReflectAt,
            class: 'modulate-only',
            note: REFLECT_MODULATE_ONLY_NOTE,
          }
        : null,
      // C2c: attached ONLY when composed (spread-omitted otherwise — the key is
      // structurally absent flag-off, byte-identical payload). The mentor-§6(b)
      // total count rides alongside whenever the count read succeeded.
      ...(orientationEntries !== undefined ? { orientation_readings: orientationEntries } : {}),
      ...(orientationEntries !== undefined &&
      typeof input.orientationReadings?.totalCount === 'number'
        ? { total_orientation_readings_count: input.orientationReadings.totalCount }
        : {}),
    },
    envelope: TRUST_RECORD_ENVELOPE,
    evidence: {
      artifact_note: ARTIFACT_NOTE,
      retention: { window_days: 90, note: RETENTION_NOTE },
    },
    interop: {
      design_shapes: [
        'w3c-vc-claims-mapping (subject/issuer/claims/evidence)',
        'a2a-extension-shape (sage-trust-record/v1)',
        'otel-genai-shaped span refs in observability logs',
      ],
      published_externally: false,
      note: INTEROP_NOTE,
    },
    notes,
  }
}
