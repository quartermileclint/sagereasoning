/**
 * session-decline-signal.ts — B5 (agent practice reminders): a sustained
 * decline in a measured dimension across consecutive DECLARED sessions.
 *
 * BINDING VERDICT (2026-07-29 mentor consultation, "B5 — Session Boundary and
 * the Adequacy of Inferred Evidence" — verbatim wins over this summary): an
 * INFERRED (timing-based) session boundary is never adequate evidence for the
 * "declining across sessions" claim — it can manufacture a multi-session
 * pattern out of one continuous session, or hide a real one. B5 requires a
 * POSITIVELY DECLARED session boundary and stays silent otherwise. This
 * closes the BD-2 deferral in practice-suggestion.ts (2026-07-28): the prior
 * blocker was that `EvaluatedAction` carried no session concept at all; the
 * declared `session_marker` field is that concept, supplied by the calling
 * agent — never inferred by this module.
 *
 * A calling agent declares, per consult, one of: 'session_open' (this consult
 * begins a new occasion of practice), 'session_close' (this consult ends the
 * current one), or 'mid_session' (within a continuous occasion). A caller
 * that never declares a marker gets B5 silence — the mentor's own framing:
 * "the tool does not infer the agent's structure; the agent declares it, and
 * the tool reads it."
 *
 * PURE (output-wise — the same convention trajectory-delta.ts uses):
 * `computeWindowSnapshot` internally reads the clock for its own
 * `computed_at` field, which this module never surfaces, so a fixed input
 * yields a byte-identical `SessionDeclineBlock` on replay.
 *
 * SESSION COMPLETION: a session is COMPLETE when a `session_open` row is
 * followed by either an explicit `session_close` or the next `session_open`
 * (the close is confirmatory, not required — an agent whose harness
 * terminates abruptly may never send one). Rows before the first declared
 * `session_open` belong to no session and are excluded. A trailing session
 * that never closes or is never superseded is NOT counted — it may still be
 * in progress, and counting it risks reading a mid-session dip as the
 * session's final state.
 *
 * EVIDENCE FLOOR: a session bucket must carry >= EVIDENCE_FLOOR (3, the same
 * constant trajectory-delta.ts uses) rows to be counted at all.
 * SESSION_DECLINE_THRESHOLD qualifying sessions are required before any
 * trend is computed — the conservative end of the mentor's "2-3 consecutive
 * sessions" range (a BUILD decision, not a mentor-fixed number — silence over
 * an uncertain magnitude, the pattern this whole arc follows).
 *
 * DECLINE RULE: over the last SESSION_DECLINE_THRESHOLD qualifying sessions
 * (chronological), a dimension reads 'declining' only when its rank is
 * NON-INCREASING session-over-session AND strictly lower in the final
 * session than the first. A plateau-then-drop counts; a dip-then-recovery
 * does not — the conservative reading of "sustained decline… never a
 * single-session dip".
 *
 * EXTRACTION-REGIME EXCLUSION (added 2026-08-01, agent-circles C1f — this
 * closes the named follow-up this header previously carried as an open gap).
 * Rows are segmented to the LATEST extraction regime before any session is
 * bucketed: rows inside a boundary band are dropped, and rows from earlier eras
 * are excluded, reusing trajectory-delta's `assignRegimeEra` and settled
 * boundaries rather than re-deriving them (ADR-014 §4's one-record rule). The
 * C1 first-circle correction is the first boundary this signal would actually
 * straddle, which is what made the gap material: a "sustained decline across
 * sessions" computed across that correction would be reading a VOCABULARY
 * change as a change in the practitioner, which mentor verdict Q9a forbids.
 * The segmentation counts ride on every basis object (`basis.regime`).
 *
 * MEASURE-ONLY: feeds B5's suggestion detector only; never a trust event,
 * never an S4 intervention-engine input, no recommendation field. WEIGHTS
 * BLOCKED, as everywhere else in this arc.
 */

import type { EvaluatedAction } from './trust-layer/types/evaluation'
import type {
  ProgressDimensionId,
  DimensionLevel,
} from './trust-layer/types/accreditation'
import { computeWindowSnapshot } from './trust-layer/evaluation-window/window-aggregator'
import {
  EVIDENCE_FLOOR,
  SETTLED_REGIME_BOUNDARIES,
  assignRegimeEra,
  type DeltaTrend,
  type RegimeBoundary,
  type SignalBasis,
} from './trajectory-delta'

/** The declared session-boundary vocabulary — supplied by the calling agent,
 *  never inferred here. */
export type SessionMarker = 'session_open' | 'session_close' | 'mid_session'

export const SESSION_MARKER_VALUES: readonly SessionMarker[] = [
  'session_open',
  'session_close',
  'mid_session',
]

/** How many trailing qualifying (evidence-floor-met) sessions the decline
 *  rule requires — the conservative end of the mentor's 2-3 range. */
export const SESSION_DECLINE_THRESHOLD = 3

const DIMENSION_LEVEL_RANK: Record<DimensionLevel, number> = {
  emerging: 0,
  developing: 1,
  established: 2,
  advanced: 3,
}

const DIMENSION_IDS: readonly ProgressDimensionId[] = [
  'passion_reduction',
  'judgement_quality',
  'disposition_stability',
  'oikeiosis_extension',
]

export interface SessionDeclineBasis extends SignalBasis {
  /** Qualifying (evidence-floor-met) declared sessions actually available. */
  qualifying_sessions: number
  /** Qualifying sessions required before a trend is computed. */
  threshold: number
  /** Agent-circles C1f (2026-08-01) — the extraction-regime segmentation this
   *  signal now applies (see `segmentRowsToLatestRegime`). `segment_used` is null
   *  when every row fell in a boundary band, i.e. nothing was computable. */
  regime: {
    segment_used: string | null
    rows_in_window: number
    rows_in_segment: number
    rows_excluded_earlier_eras: number
    rows_excluded_boundary_band: number
  }
}

/**
 * Agent-circles C1f (2026-08-01) — the regime-boundary exclusion this module's own
 * header previously disclosed as MISSING ("this module does not apply the
 * regime-boundary exclusion trajectory-delta.ts uses (ADR-014 §3.1) — a session
 * straddling an extraction-regime boundary is read as-is… a named follow-up should
 * this signal graduate past its dark build").
 *
 * The C1 first-circle correction creates the first boundary B5 would actually
 * straddle, which is what makes the gap material rather than theoretical: a
 * "sustained decline across sessions" computed across the correction would be
 * reading a VOCABULARY CHANGE as a change in the practitioner. Mentor Q9a is
 * explicit that examinations before and after the marker are read under different
 * vocabularies and that no re-interpretation across it is permitted.
 *
 * The rule is trajectory-delta's, reused rather than re-derived (ADR-014 §4's
 * one-record rule): drop rows inside a boundary band (the switch instant within
 * the day is unrecoverable), then keep only the LATEST era present. Rows and
 * markers are filtered together so the caller's index alignment is preserved.
 */
function segmentRowsToLatestRegime(
  actions: readonly EvaluatedAction[],
  markers: readonly (SessionMarker | null | undefined)[],
  boundaries: readonly RegimeBoundary[],
): {
  actions: EvaluatedAction[]
  markers: (SessionMarker | null | undefined)[]
  report: SessionDeclineBasis['regime']
} {
  const eras = actions.map((a) => assignRegimeEra(a.evaluated_at, boundaries).era)
  const bandCount = eras.filter((e) => e === 'boundary_band').length

  // The latest era present among non-band rows. Boundaries are ordered, so the
  // latest era is the one belonging to the highest-indexed boundary that any row
  // sits at/after; taking the era of the newest non-band row is equivalent and
  // needs no re-derivation of the ordering.
  let latest: string | null = null
  for (let i = actions.length - 1; i >= 0; i--) {
    if (eras[i] !== 'boundary_band') {
      latest = eras[i]
      break
    }
  }

  const keptActions: EvaluatedAction[] = []
  const keptMarkers: (SessionMarker | null | undefined)[] = []
  for (let i = 0; i < actions.length; i++) {
    if (eras[i] === 'boundary_band') continue
    if (eras[i] !== latest) continue
    keptActions.push(actions[i])
    keptMarkers.push(markers[i])
  }

  return {
    actions: keptActions,
    markers: keptMarkers,
    report: {
      segment_used: latest,
      rows_in_window: actions.length,
      rows_in_segment: keptActions.length,
      rows_excluded_earlier_eras: actions.length - bandCount - keptActions.length,
      rows_excluded_boundary_band: bandCount,
    },
  }
}

export interface SessionDeclineBlock {
  dimension_trends: Record<ProgressDimensionId, DeltaTrend>
  dimension_trends_basis: Record<ProgressDimensionId, SessionDeclineBasis>
  note: string
}

interface SessionBucket {
  rows: EvaluatedAction[]
}

/** Group oldest-first rows into COMPLETE declared sessions. PURE — never
 *  infers a boundary; a row with no marker (or a marker before any declared
 *  open) belongs to no session. */
function bucketCompleteSessions(
  actions: readonly EvaluatedAction[],
  markers: readonly (SessionMarker | null | undefined)[],
): SessionBucket[] {
  const buckets: SessionBucket[] = []
  let current: SessionBucket | null = null
  for (let i = 0; i < actions.length; i++) {
    const marker = markers[i]
    if (marker === 'session_open') {
      if (current !== null) buckets.push(current) // superseded, not lost
      current = { rows: [actions[i]] }
      continue
    }
    if (current === null) continue // before any declared open — excluded
    current.rows.push(actions[i])
    if (marker === 'session_close') {
      buckets.push(current)
      current = null
    }
  }
  return buckets // a trailing never-closed/superseded bucket is dropped
}

function makeBasis(
  actions: readonly EvaluatedAction[],
  qualifying: readonly SessionBucket[],
  regime: SessionDeclineBasis['regime'],
): SessionDeclineBasis {
  const nonEmpty = qualifying.reduce((n, b) => n + b.rows.length, 0)
  return {
    // `input_count` / `empty_count` describe the SEGMENT the signal actually
    // computed over, not the raw window — the raw window is reported separately
    // as regime.rows_in_window so neither number is silently conflated.
    input_count: actions.length,
    empty_count: actions.length - nonEmpty,
    baseline_non_empty: qualifying.length > 0 ? qualifying[0].rows.length : 0,
    current_non_empty:
      qualifying.length > 0 ? qualifying[qualifying.length - 1].rows.length : 0,
    floor: EVIDENCE_FLOOR,
    qualifying_sessions: qualifying.length,
    threshold: SESSION_DECLINE_THRESHOLD,
    regime,
  }
}

/**
 * Compute the B5 session-decline signal from a windowed read. PURE (see
 * header). `actions` and `markers` must be the SAME length, oldest-first,
 * index-aligned — a caller mismatch returns undefined rather than guessing.
 */
export function computeSessionDeclineSignal(
  actions: readonly EvaluatedAction[],
  markers: readonly (SessionMarker | null | undefined)[],
  boundaries: readonly RegimeBoundary[] = SETTLED_REGIME_BOUNDARIES,
): SessionDeclineBlock | undefined {
  if (actions.length !== markers.length) return undefined

  // C1f — segment to the latest extraction regime BEFORE bucketing, so a session
  // is never assembled from rows produced under two different vocabularies.
  const segmented = segmentRowsToLatestRegime(actions, markers, boundaries)

  const buckets = bucketCompleteSessions(segmented.actions, segmented.markers)
  const qualifying = buckets.filter((b) => b.rows.length >= EVIDENCE_FLOOR)
  const basis = makeBasis(segmented.actions, qualifying, segmented.report)

  if (qualifying.length < SESSION_DECLINE_THRESHOLD) {
    const trends = {} as Record<ProgressDimensionId, DeltaTrend>
    const bases = {} as Record<ProgressDimensionId, SessionDeclineBasis>
    for (const dim of DIMENSION_IDS) {
      trends[dim] = 'insufficient_extraction'
      bases[dim] = basis
    }
    return {
      dimension_trends: trends,
      dimension_trends_basis: bases,
      note:
        'B5 requires a POSITIVELY DECLARED session boundary (session_marker) and ' +
        `at least ${SESSION_DECLINE_THRESHOLD} qualifying (>= ${EVIDENCE_FLOOR}-row) ` +
        'consecutive declared sessions — never inferred from timing (the mentor\'s ' +
        `2026-07-29 verdict). ${qualifying.length} qualifying session(s) found.`,
    }
  }

  const trailing = qualifying.slice(-SESSION_DECLINE_THRESHOLD)
  const perSessionSnapshots = trailing.map((b) =>
    computeWindowSnapshot('agent-session-decline', b.rows, b.rows.length),
  )

  const trends = {} as Record<ProgressDimensionId, DeltaTrend>
  const bases = {} as Record<ProgressDimensionId, SessionDeclineBasis>
  for (const dim of DIMENSION_IDS) {
    const ranks = perSessionSnapshots.map(
      (snap) => DIMENSION_LEVEL_RANK[snap.dimension_detail[dim].level],
    )
    let nonIncreasing = true
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] > ranks[i - 1]) {
        nonIncreasing = false
        break
      }
    }
    const strictlyLower = ranks[ranks.length - 1] < ranks[0]
    trends[dim] = nonIncreasing && strictlyLower ? 'declining' : 'stable'
    bases[dim] = basis
  }

  return {
    dimension_trends: trends,
    dimension_trends_basis: bases,
    note:
      `Computed over the last ${SESSION_DECLINE_THRESHOLD} consecutive declared ` +
      `sessions (each >= ${EVIDENCE_FLOOR} rows). A dimension reads 'declining' ` +
      'only when its level is non-increasing session-over-session and strictly ' +
      'lower in the final session than the first.',
  }
}
