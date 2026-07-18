/**
 * trajectory-delta.ts — the ONE shared practice-delta module (ADR-014 §§3.1,
 * 3.3, 4, 5; build slice AE-1).
 *
 * WHAT THIS IS: the per-mechanism progression-delta layer for agents — D17's
 * delta vocabulary applied to the live trajectory record. It SURFACES what the
 * trust-layer aggregator already computes and the overlay discards (the four
 * progress-dimension details; persisting passions) and ADDS the between-half
 * per-mechanism deltas derivable from persisted columns (sub-species frequency;
 * kathekon-quality trend; first-circle obligation trend; domain-engagement
 * frequency). It is the single computation behind EVERY delta projection
 * (meta.trajectory now; the reflect completion block later, gated on
 * reflect-store owner-scoping — ADR-014's one-record rule: three stores exist,
 * three trend derivations must not).
 *
 * PURE — no I/O, no env reads, no clock. A fixed window yields a byte-identical
 * delta block on replay (regime boundaries are constants; time is read from the
 * rows' own evaluated_at). PR15: reuses computeWindowSnapshot for everything it
 * already computes; re-implements nothing the aggregator owns. The aggregator's
 * `computed_at` (its one clock read) is NEVER surfaced (the overlay precedent).
 *
 * THE HONESTY GUARDS (ADR-014 §3.1 — all binding, all structural here):
 *
 *  • PER-SIGNAL EVIDENCE FLOORS, never a defaulted 'stable'. Each signal
 *    computes ONLY when its feeding field was non-empty in ≥3 rows
 *    (EVIDENCE_FLOOR — D17's own domain-match minimum) in each compared half;
 *    otherwise it emits the DISTINCT value 'insufficient_extraction'. Over the
 *    live at-action distribution the feeding fields are STARVED, not sparse
 *    (frozen buffer: sub-species empty 125/125; zero circles 129/130) — D17's
 *    "default to stable with the flag" is not honest enough here; `stable` over
 *    starvation reads as a finding. This is the R13 generalisation encoded: a
 *    trajectory over starved extractions is a clean trend line over noise, and
 *    this module makes the starvation visible rather than laundering it. The
 *    same floor deliberately withholds flattering dimension levels a starved
 *    window would otherwise read (an all-empty-passions window is NOT certified
 *    'advanced' passion_reduction — calm and starved are indistinguishable in
 *    the record, so neither is certified).
 *
 *  • EVERY SIGNAL CARRIES A `*_basis` naming its input and empty-field counts
 *    (the overlay's honesty pattern — kathekon_rate_basis / evidence).
 *
 *  • NO SIGNAL WITHOUT A FEEDING COLUMN. Causal-stage progression, per-circle
 *    obligation statuses beyond the first-circle boolean, Senecan-grade
 *    movement, risk-flag patterns are NOT here — they need the row-widening
 *    decision (a schema change, its own founder-walked step), not read-side
 *    improvisation.
 *
 *  • REGIME DISCIPLINE (AE-1 election E-AE1-2, boundary-date split): delta
 *    computations REFUSE to compare across an extraction-regime boundary.
 *    Windows are segmented at the configured boundary dates (the settled S11b
 *    recomposition boundary below); rows inside a boundary's uncertainty band
 *    are EXCLUDED and counted; deltas compute within the LATEST segment only,
 *    with every exclusion disclosed. Splitting can only WITHHOLD comparisons —
 *    it never manufactures one — so mislabeling risk collapses to conservatism.
 *    (The harness capture records carry the per-record `extractionRegime` mark
 *    — false-hold-record-v2; server trajectory rows carry none, and a durable
 *    per-row mark would need a harness→server transmission channel — a
 *    request-shape change deliberately NOT taken here.)
 *
 *  • PROVENANCE-MIX DISCLOSURE (election E-AE1-1): the block reports
 *    n_supplied / n_server / n_unknown from the rows' `layer1_source` (the
 *    elected nullable column; pre-column and pre-flag rows read unknown). An
 *    l1_supply-capable caller could otherwise author its own fine-grained trend
 *    invisibly.
 *
 *  • VOCABULARY: record-descriptive, past-tense (ADR-013 §8 — evaluative,
 *    never predictive). Deltas describe what the record shows across the
 *    compared halves ("faded/recurred within this window"); they forecast
 *    nothing. The R18 docs for this block restate WEIGHTS BLOCKED — a
 *    per-mechanism improvement gradient is exactly the shape of a training
 *    reward, and no such use is licensed.
 *
 *  • THE S11B MENTION-CONVERSION BOUND rides every circle-fed signal
 *    (NARROWED_ARM_BOUNDS.mentionConversion — Layer 1 converts QUOTED party
 *    language into circles, 6/6 battery runs): the first-circle obligation
 *    trend and the circle-derived component of domain engagement are bounded by
 *    it, and the block says so.
 *
 * MEASURE-ONLY: no recommendation field; not an input to the S4 intervention
 * engine; never a trust-event or decrease source. Nothing here binds (ENFORCE
 * remains S11, refused on readiness).
 */

import type {
  EvaluatedAction,
  KathekonQuality,
} from './trust-layer/types/evaluation'
import type {
  PersistingPassion,
  ProgressDimensionId,
  DimensionLevel,
} from './trust-layer/types/accreditation'
import { computeWindowSnapshot } from './trust-layer/evaluation-window/window-aggregator'
import type { TrajectoryWindow } from './agent-assessment-history-store'
import {
  toCanonicalDirectionOfTravel,
  type CanonicalDirectionOfTravel,
} from './direction-of-travel'
import {
  describeWindowScope,
  type LongitudinalIdentity,
  type WindowScopeDisclosure,
} from './longitudinal-identity'

// ============================================================================
// VOCABULARY (D17; progression-delta.md §"Delta vocabulary")
// ============================================================================

/** Per-signal trend in D17's vocabulary, canonical form — plus the ADR-014
 *  distinct starvation value (NEVER a defaulted 'stable'). */
export type DeltaTrend =
  | 'improving'
  | 'stable'
  | 'declining'
  | 'insufficient_extraction'

/** Per-key frequency delta in D17's vocabulary
 *  (dominant_sub_species_frequency_delta): 'fading' = the pattern weakened or
 *  disappeared across the halves; 'recurring' = it strengthened or returned;
 *  'new' = absent in the baseline half, present in the current half;
 *  'stable' = present at a similar rate in both. Record-descriptive. */
export type FrequencyDelta = 'fading' | 'recurring' | 'new' | 'stable'

/** D17's domain-match minimum, applied per signal per compared half. */
export const EVIDENCE_FLOOR = 3

/** Derived monotone conveniences (the mentor/D17 fix ORDERINGS, not
 *  magnitudes — the S2/S3 precedent; tunable, pinned by the battery):
 *  rate-delta threshold for frequency classification and the met-rate trend
 *  (mirrors the aggregator's ±0.1 rate convention), and the rank-delta
 *  threshold for the kathekon-quality trend (mirrors the aggregator's 0.3
 *  rank convention on direction_of_travel). */
export const FREQUENCY_RATE_DELTA = 0.15
export const MET_RATE_DELTA = 0.1
export const QUALITY_RANK_DELTA = 0.3

const KATHEKON_QUALITY_RANK: Record<KathekonQuality, number> = {
  contrary: 0,
  marginal: 1,
  moderate: 2,
  strong: 3,
}

// ============================================================================
// EXTRACTION-REGIME BOUNDARIES (election E-AE1-2 — boundary-date split)
// ============================================================================

export interface RegimeBoundary {
  /** Inclusive start of the uncertainty band (ISO). Rows with
   *  band_start_iso <= evaluated_at < band_end_iso are EXCLUDED (the exact
   *  switch instant within the day is unknowable from the record). */
  band_start_iso: string
  /** Exclusive end of the uncertainty band (ISO). */
  band_end_iso: string
  /** Era label for rows before the band. */
  from_era: string
  /** Era label for rows at/after the band end. */
  to_era: string
  /** What changed, with the settled regime identifiers named. */
  note: string
}

/** The settled extraction-regime boundaries (ADR-014 §3.1; S11b settlement —
 *  regime identifiers `at-action-v1-lean` → `at-action-v2-composed`, exported
 *  from harness/.../action-composer.mjs and stamped on harness capture records
 *  as `extractionRegime`, false-hold-record-v2). Server trajectory rows carry
 *  no per-row mark, so the split is by boundary DATE with a one-day
 *  uncertainty band. Append-only: a future regime change adds an entry. */
export const SETTLED_REGIME_BOUNDARIES: readonly RegimeBoundary[] = [
  {
    band_start_iso: '2026-07-18T00:00:00.000Z',
    band_end_iso: '2026-07-19T00:00:00.000Z',
    from_era: 'pre-s11b-recomposition',
    to_era: 'post-s11b-recomposition',
    note:
      'S11b examined-input recomposition, settled once 2026-07-18 ' +
      '(at-action-v1-lean → at-action-v2-composed; ' +
      'D-TRUST-LAYER-S11B-RECOMPOSITION-NARROWING-REDUCER-CAP-FIX). Rows on ' +
      'the boundary day are excluded — the switch instant within the day is ' +
      'not recoverable from the record.',
  },
]

// ============================================================================
// BLOCK SHAPE
// ============================================================================

/** The per-signal evidence basis (ADR-014 §3.1 — every signal carries one). */
export interface SignalBasis {
  /** Rows in the regime segment feeding this signal. */
  input_count: number
  /** Segment rows whose feeding field was EMPTY for this signal. */
  empty_count: number
  /** Non-empty feeding rows in the baseline (earlier) half. */
  baseline_non_empty: number
  /** Non-empty feeding rows in the current (later) half. */
  current_non_empty: number
  /** The floor each compared half must meet (EVIDENCE_FLOOR). */
  floor: number
}

export interface DimensionTrendDelta {
  level: DimensionLevel
  /** First-half-vs-second-half trend within the segment, canonical vocabulary. */
  trend: CanonicalDirectionOfTravel
  /** The aggregator's record-descriptive indicators for the level read. */
  indicators: string[]
}

export interface RegimeSegmentationReport {
  /** Era label of the segment the deltas were computed over — null when every
   *  row fell in a boundary band (nothing computable). */
  segment_used: string | null
  rows_in_window: number
  rows_in_segment: number
  rows_excluded_earlier_eras: number
  rows_excluded_boundary_band: number
  boundaries: readonly RegimeBoundary[]
  note: string
}

export interface ProvenanceMixReport {
  n_supplied: number
  n_server: number
  n_unknown: number
  note: string
}

/** The delta block — a projection of the ONE record (ADR-014 §4). Additive on
 *  meta.trajectory when SUBSTRATE_TRAJECTORY_DELTA_ENABLED is on; absent
 *  otherwise (byte-identity). */
export interface TrajectoryDeltaBlock {
  schema: 'agent-trajectory-delta-v1'
  /** Record-descriptive framing, locked by the battery. */
  vocabulary_note: string
  identity: WindowScopeDisclosure
  regime: RegimeSegmentationReport
  provenance: ProvenanceMixReport
  /** Halving of the segment (oldest-first): baseline = first half, current =
   *  second half — the aggregator's own trend convention. */
  computed_over: {
    baseline_rows: number
    current_rows: number
  }
  /** The four progress-dimension details the aggregator computes and the
   *  overlay discards — level + within-segment trend — floored per dimension
   *  by its feeding field (a starved window certifies nothing). */
  dimension_trends: Record<
    ProgressDimensionId,
    DimensionTrendDelta | 'insufficient_extraction'
  >
  dimension_trends_basis: Record<ProgressDimensionId, SignalBasis>
  /** Passions that persisted across the segment (aggregator's >20% rule),
   *  floored on passion-bearing rows. */
  passions_persisted_in_window: PersistingPassion[] | 'insufficient_extraction'
  passions_persisted_basis: SignalBasis
  /** Per sub-species key ('root/sub'), the between-half frequency delta. */
  sub_species_frequency_deltas:
    | Record<string, FrequencyDelta>
    | 'insufficient_extraction'
  sub_species_frequency_basis: SignalBasis
  kathekon_quality_trend: DeltaTrend
  kathekon_quality_basis: SignalBasis
  /** First-circle obligation met-rate trend — DISCLOSED first-circle
   *  semantics (the row stores only the primary circle's boolean). */
  first_circle_obligation_trend: DeltaTrend
  first_circle_obligation_basis: SignalBasis & { semantics: string }
  /** Per virtue-domain, the between-half engagement-frequency delta. */
  domain_engagement_deltas:
    | Record<string, FrequencyDelta>
    | 'insufficient_extraction'
  domain_engagement_basis: SignalBasis
  /** The S11b bound riding every circle-fed signal. */
  bounds: {
    mention_conversion: string
  }
}

/** Locked wording (battery-pinned). Record-descriptive; never predictive. */
export const VOCABULARY_NOTE =
  'Deltas describe what this window’s record showed across its compared ' +
  'halves (past tense); they evaluate the record and predict nothing. ' +
  'insufficient_extraction means the feeding field did not meet the evidence ' +
  'floor in this window — starved extraction or too little history; the ' +
  'signal’s *_basis counts (input/empty per half) distinguish which. It is ' +
  'never a defaulted “stable”.'

/** The S11b NARROWED_ARM_BOUNDS.mentionConversion bound, carried verbatim in
 *  intent (battery-pinned): EVERY circle-fed signal inherits it. */
export const MENTION_CONVERSION_BOUND =
  'S11b validation bound (NARROWED_ARM_BOUNDS.mentionConversion): Layer 1 ' +
  'converts quoted party language into circles (6/6 runs), so circle-fed ' +
  'signals (first_circle_obligation_trend; the oikeiosis_extension dimension ' +
  'trend; the circle-derived component of domain engagement, e.g. dikaiosyne) ' +
  'may count mentioned-but-unaffected parties. Bounded, not tuned away.'

// ============================================================================
// REGIME SEGMENTATION (pure)
// ============================================================================

type RowAssignment =
  | { kind: 'era'; era: string }
  | { kind: 'band' }

function assignEra(
  evaluatedAtIso: string,
  boundaries: readonly RegimeBoundary[],
): RowAssignment {
  const t = Date.parse(evaluatedAtIso)
  // Boundaries are ordered ascending by band_start_iso (asserted by callers of
  // the exported API via sortBoundaries below).
  let era = boundaries.length > 0 ? boundaries[0].from_era : 'unsegmented'
  for (const b of boundaries) {
    const start = Date.parse(b.band_start_iso)
    const end = Date.parse(b.band_end_iso)
    if (t >= start && t < end) return { kind: 'band' }
    if (t >= end) era = b.to_era
  }
  return { kind: 'era', era }
}

function sortBoundaries(
  boundaries: readonly RegimeBoundary[],
): readonly RegimeBoundary[] {
  return [...boundaries].sort(
    (a, b) => Date.parse(a.band_start_iso) - Date.parse(b.band_start_iso),
  )
}

/** The shared era-assignment read (AE-2 — ADR-014 §4's one-record rule: regime
 *  handling is SHARED machinery, never re-derived per surface). Assign one ISO
 *  timestamp to its extraction-regime era against the settled boundaries:
 *  the era label, or 'boundary_band' when the timestamp falls inside a
 *  boundary's one-day uncertainty band. Pure. */
export function assignRegimeEra(
  iso: string,
  boundaries: readonly RegimeBoundary[] = SETTLED_REGIME_BOUNDARIES,
): { era: string } | { era: 'boundary_band' } {
  const a = assignEra(iso, sortBoundaries(boundaries))
  return a.kind === 'band' ? { era: 'boundary_band' } : { era: a.era }
}

interface Segmentation {
  segmentRows: EvaluatedAction[]
  /** layer1_source values aligned with segmentRows. */
  segmentSources: ('supplied' | 'server' | null)[]
  report: RegimeSegmentationReport
}

function segmentByRegime(
  actions: EvaluatedAction[],
  sources: ('supplied' | 'server' | null)[],
  boundaries: readonly RegimeBoundary[],
): Segmentation {
  const sorted = sortBoundaries(boundaries)
  const assignments = actions.map((a) => assignEra(a.evaluated_at, sorted))

  // The segment used = the era of the NEWEST non-band row (actions are
  // oldest-first). Null when every row is band-excluded (or the window is
  // empty).
  let segmentEra: string | null = null
  for (let i = assignments.length - 1; i >= 0; i--) {
    const a = assignments[i]
    if (a.kind === 'era') {
      segmentEra = a.era
      break
    }
  }

  const segmentRows: EvaluatedAction[] = []
  const segmentSources: ('supplied' | 'server' | null)[] = []
  let excludedEarlier = 0
  let excludedBand = 0
  for (let i = 0; i < actions.length; i++) {
    const a = assignments[i]
    if (a.kind === 'band') {
      excludedBand++
    } else if (segmentEra !== null && a.era === segmentEra) {
      segmentRows.push(actions[i])
      segmentSources.push(sources[i] ?? null)
    } else {
      excludedEarlier++
    }
  }

  return {
    segmentRows,
    segmentSources,
    report: {
      segment_used: segmentEra,
      rows_in_window: actions.length,
      rows_in_segment: segmentRows.length,
      rows_excluded_earlier_eras: excludedEarlier,
      rows_excluded_boundary_band: excludedBand,
      boundaries: sorted,
      note:
        'Delta computations never compare across an extraction-regime ' +
        'boundary (ADR-014 §3.1); rows from earlier eras and boundary-band ' +
        'days are excluded and counted here.',
    },
  }
}

// ============================================================================
// FLOORED SIGNALS (pure helpers)
// ============================================================================

function makeBasis(
  segment: EvaluatedAction[],
  baseline: EvaluatedAction[],
  current: EvaluatedAction[],
  nonEmpty: (a: EvaluatedAction) => boolean,
): SignalBasis {
  const emptyCount = segment.filter((a) => !nonEmpty(a)).length
  return {
    input_count: segment.length,
    empty_count: emptyCount,
    baseline_non_empty: baseline.filter(nonEmpty).length,
    current_non_empty: current.filter(nonEmpty).length,
    floor: EVIDENCE_FLOOR,
  }
}

function meetsFloorBothHalves(basis: SignalBasis): boolean {
  return (
    basis.baseline_non_empty >= basis.floor &&
    basis.current_non_empty >= basis.floor
  )
}

function meetsFloorSegment(basis: SignalBasis): boolean {
  return basis.input_count - basis.empty_count >= basis.floor
}

/** Between-half frequency deltas for a keyed occurrence field. The rate
 *  denominator is the half's FULL row count (the aggregator's occurrence_rate
 *  convention); the floor gates on non-empty feeding rows per half. */
function frequencyDeltas(
  baseline: EvaluatedAction[],
  current: EvaluatedAction[],
  keysOf: (a: EvaluatedAction) => string[],
): Record<string, FrequencyDelta> {
  const rate = (rows: EvaluatedAction[]): Map<string, number> => {
    const counts = new Map<string, number>()
    for (const row of rows) {
      // A key occurring twice in one row still counts once per row (rate =
      // rows bearing the key / rows in half).
      for (const key of new Set(keysOf(row))) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    const rates = new Map<string, number>()
    for (const [k, c] of counts) rates.set(k, rows.length > 0 ? c / rows.length : 0)
    return rates
  }

  const baseRates = rate(baseline)
  const currRates = rate(current)
  const allKeys = [...new Set([...baseRates.keys(), ...currRates.keys()])].sort()

  const out: Record<string, FrequencyDelta> = {}
  for (const key of allKeys) {
    const b = baseRates.get(key) ?? 0
    const c = currRates.get(key) ?? 0
    if (b === 0 && c > 0) out[key] = 'new'
    else if (b > 0 && c === 0) out[key] = 'fading'
    else if (c <= b - FREQUENCY_RATE_DELTA) out[key] = 'fading'
    else if (c >= b + FREQUENCY_RATE_DELTA) out[key] = 'recurring'
    else out[key] = 'stable'
  }
  return out
}

function passionKeys(a: EvaluatedAction): string[] {
  return a.passions_detected.map((p) => `${p.root_passion}/${p.sub_species}`)
}

function hasPassions(a: EvaluatedAction): boolean {
  return a.passions_detected.length > 0
}

function hasDomains(a: EvaluatedAction): boolean {
  return a.virtue_domains_engaged.length > 0
}

function hasObligation(a: EvaluatedAction): boolean {
  return a.oikeiosis_met !== null
}

/** The feeding-field predicate per progress dimension (the starvation floor's
 *  ground): passion_reduction feeds on passions_detected; oikeiosis_extension
 *  on the first-circle fields; judgement_quality / disposition_stability on
 *  always-present enums (kathekon_quality / proximity). */
const DIMENSION_FEED: Record<
  ProgressDimensionId,
  (a: EvaluatedAction) => boolean
> = {
  passion_reduction: hasPassions,
  judgement_quality: () => true,
  disposition_stability: () => true,
  oikeiosis_extension: hasObligation,
}

// ============================================================================
// THE SHARED DELTA COMPUTATION (pure)
// ============================================================================

export interface TrajectoryDeltaOptions {
  identity: LongitudinalIdentity
  /** Override for tests; defaults to the settled boundaries. */
  boundaries?: readonly RegimeBoundary[]
  /** layer1_source per window row, aligned with window.actions (oldest-first).
   *  Undefined / missing entries read as null (unknown). */
  layer1Sources?: (('supplied' | 'server') | null | undefined)[]
}

/**
 * Compute the practice-delta block from a windowed trajectory read. PURE — a
 * fixed window yields a byte-identical block (no clock, no randomness; keyed
 * records are built in sorted key order).
 */
export function computeTrajectoryDelta(
  window: TrajectoryWindow,
  opts: TrajectoryDeltaOptions,
): TrajectoryDeltaBlock {
  const sources: ('supplied' | 'server' | null)[] = window.actions.map(
    (_, i) => opts.layer1Sources?.[i] ?? null,
  )
  const seg = segmentByRegime(
    window.actions,
    sources,
    opts.boundaries ?? SETTLED_REGIME_BOUNDARIES,
  )
  const rows = seg.segmentRows
  const half = Math.floor(rows.length / 2)
  const baseline = rows.slice(0, half)
  const current = rows.slice(half)

  // --- provenance mix (over the SEGMENT the deltas are computed on) ---
  let nSupplied = 0
  let nServer = 0
  let nUnknown = 0
  for (const s of seg.segmentSources) {
    if (s === 'supplied') nSupplied++
    else if (s === 'server') nServer++
    else nUnknown++
  }
  const provenance: ProvenanceMixReport = {
    n_supplied: nSupplied,
    n_server: nServer,
    n_unknown: nUnknown,
    note:
      'layer1_source per row: supplied = a caller-provided Layer-1 ' +
      'extraction (l1_supply); server = server-side extraction; unknown = ' +
      'rows written before the layer1_source column/stamping existed. A ' +
      'supplied extraction is the caller’s own reading of its action.',
  }

  // --- the aggregator's discarded material (PR15 — reuse, never re-derive).
  // total_lifetime = segment length: this module performs NO extra query and
  // never claims a lifetime it did not count (the overlay precedent). The
  // snapshot's computed_at is never read.
  const snapshot = computeWindowSnapshot(
    'agent-trajectory-delta',
    rows,
    rows.length,
  )

  // --- dimension trends, starvation-floored per dimension ---
  const dimensionIds: ProgressDimensionId[] = [
    'passion_reduction',
    'judgement_quality',
    'disposition_stability',
    'oikeiosis_extension',
  ]
  const dimensionTrends = {} as Record<
    ProgressDimensionId,
    DimensionTrendDelta | 'insufficient_extraction'
  >
  const dimensionBasis = {} as Record<ProgressDimensionId, SignalBasis>
  for (const dim of dimensionIds) {
    const basis = makeBasis(rows, baseline, current, DIMENSION_FEED[dim])
    dimensionBasis[dim] = basis
    if (!meetsFloorSegment(basis)) {
      dimensionTrends[dim] = 'insufficient_extraction'
      continue
    }
    const detail = snapshot.dimension_detail[dim]
    dimensionTrends[dim] = {
      level: detail.level,
      trend: toCanonicalDirectionOfTravel(detail.trend),
      indicators: [...detail.indicators],
    }
  }

  // --- persisting passions (aggregator's >20% rule), passion-floored ---
  const passionsBasis = makeBasis(rows, baseline, current, hasPassions)
  const passionsPersisted: PersistingPassion[] | 'insufficient_extraction' =
    meetsFloorSegment(passionsBasis)
      ? snapshot.persisting_passions.map((p) => ({ ...p }))
      : 'insufficient_extraction'

  // --- sub-species frequency deltas (between halves) ---
  const subSpeciesBasis = makeBasis(rows, baseline, current, hasPassions)
  const subSpeciesDeltas:
    | Record<string, FrequencyDelta>
    | 'insufficient_extraction' = meetsFloorBothHalves(subSpeciesBasis)
    ? frequencyDeltas(baseline, current, passionKeys)
    : 'insufficient_extraction'

  // --- kathekon-quality trend (always-present enum; rank average) ---
  const qualityBasis = makeBasis(rows, baseline, current, () => true)
  let qualityTrend: DeltaTrend = 'insufficient_extraction'
  if (meetsFloorBothHalves(qualityBasis)) {
    const avg = (xs: EvaluatedAction[]): number =>
      xs.reduce((acc, a) => acc + KATHEKON_QUALITY_RANK[a.kathekon_quality], 0) /
      xs.length
    const diff = avg(current) - avg(baseline)
    qualityTrend =
      diff > QUALITY_RANK_DELTA
        ? 'improving'
        : diff < -QUALITY_RANK_DELTA
          ? 'declining'
          : 'stable'
  }

  // --- first-circle obligation trend (met-rate over non-null rows) ---
  const obligationBasis = makeBasis(rows, baseline, current, hasObligation)
  let obligationTrend: DeltaTrend = 'insufficient_extraction'
  if (meetsFloorBothHalves(obligationBasis)) {
    const metRate = (xs: EvaluatedAction[]): number => {
      const assessed = xs.filter(hasObligation)
      if (assessed.length === 0) return 0
      return assessed.filter((a) => a.oikeiosis_met === true).length / assessed.length
    }
    const diff = metRate(current) - metRate(baseline)
    obligationTrend =
      diff > MET_RATE_DELTA
        ? 'improving'
        : diff < -MET_RATE_DELTA
          ? 'declining'
          : 'stable'
  }

  // --- domain-engagement frequency deltas (between halves) ---
  const domainBasis = makeBasis(rows, baseline, current, hasDomains)
  const domainDeltas:
    | Record<string, FrequencyDelta>
    | 'insufficient_extraction' = meetsFloorBothHalves(domainBasis)
    ? frequencyDeltas(baseline, current, (a) => a.virtue_domains_engaged)
    : 'insufficient_extraction'

  return {
    schema: 'agent-trajectory-delta-v1',
    vocabulary_note: VOCABULARY_NOTE,
    identity: describeWindowScope(opts.identity),
    regime: seg.report,
    provenance,
    computed_over: {
      baseline_rows: baseline.length,
      current_rows: current.length,
    },
    dimension_trends: dimensionTrends,
    dimension_trends_basis: dimensionBasis,
    passions_persisted_in_window: passionsPersisted,
    passions_persisted_basis: passionsBasis,
    sub_species_frequency_deltas: subSpeciesDeltas,
    sub_species_frequency_basis: subSpeciesBasis,
    kathekon_quality_trend: qualityTrend,
    kathekon_quality_basis: qualityBasis,
    first_circle_obligation_trend: obligationTrend,
    first_circle_obligation_basis: {
      ...obligationBasis,
      semantics:
        'first-circle only: the trajectory row stores the PRIMARY relevant ' +
        'circle’s obligation boolean (the Layer-2 engine’s own convention); ' +
        'per-circle obligation statuses are not persisted and are NOT ' +
        'improvised here.',
    },
    domain_engagement_deltas: domainDeltas,
    domain_engagement_basis: domainBasis,
    bounds: {
      mention_conversion: MENTION_CONVERSION_BOUND,
    },
  }
}
