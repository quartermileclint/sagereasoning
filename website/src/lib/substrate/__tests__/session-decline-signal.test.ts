/**
 * session-decline-signal.test.ts — B5's declared-session decline detector.
 *
 * Plain-assertion script: npx tsx <this file> (bare — no I/O).
 *
 * Pins, in order:
 *   §1 No markers at all → insufficient_extraction (never inferred from
 *      timing; the mentor's 2026-07-29 binding verdict).
 *   §2 Fewer than SESSION_DECLINE_THRESHOLD qualifying sessions →
 *      insufficient_extraction, even with markers present.
 *   §3 Rows before the first session_open are excluded.
 *   §4 A session below EVIDENCE_FLOOR rows is not counted as qualifying.
 *   §5 A trailing session that never closes/is never superseded is dropped.
 *   §6 A genuine sustained decline (3 qualifying sessions, monotone
 *      non-increasing, strictly lower at the end) reads 'declining'.
 *   §7 A dip-then-recovery pattern does NOT read 'declining' (non-vacuous —
 *      the exact false-positive class the mentor named).
 *   §8 A mismatched actions/markers length returns undefined.
 */

import type { EvaluatedAction } from '../trust-layer/types/evaluation'
import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'
import {
  computeSessionDeclineSignal,
  SESSION_DECLINE_THRESHOLD,
  type SessionMarker,
} from '../session-decline-signal'
import { EVIDENCE_FLOOR, type RegimeBoundary } from '../trajectory-delta'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

function mkAction(o: Partial<EvaluatedAction> = {}): EvaluatedAction {
  return {
    receipt_id: 'r',
    agent_id: 'api_key:k',
    evaluated_at: '2026-07-29T00:00:00.000Z',
    proximity: 'deliberate' as KatorthomaProximityLevel,
    is_kathekon: true,
    kathekon_quality: 'moderate',
    passions_detected: [],
    virtue_domains_engaged: [],
    oikeiosis_met: null,
    oikeiosis_stage: null,
    ruling_faculty_state: '',
    skill_id: 'api_reason',
    candidates_considered: 1,
    ...o,
  }
}

/** A row that reads 'strong' on judgement_quality's own good-judgement rate
 *  (is_kathekon && strong|moderate) — used to build a controlled per-session
 *  rate that computeWindowSnapshot will rank consistently. */
function goodRow(): EvaluatedAction {
  return mkAction({ is_kathekon: true, kathekon_quality: 'strong' })
}
function badRow(): EvaluatedAction {
  return mkAction({ is_kathekon: false, kathekon_quality: 'contrary' })
}

/** Build N rows all sharing one marker, EXCEPT the first row of a session gets
 *  'session_open' and (optionally) the last gets 'session_close'. */
function session(
  rows: EvaluatedAction[],
  opts: { close?: boolean } = {},
): { actions: EvaluatedAction[]; markers: SessionMarker[] } {
  const markers: SessionMarker[] = rows.map((_, i) =>
    i === 0 ? 'session_open' : 'mid_session',
  )
  if (opts.close && markers.length > 0) markers[markers.length - 1] = 'session_close'
  return { actions: rows, markers }
}

function concat(
  sessions: { actions: EvaluatedAction[]; markers: SessionMarker[] }[],
): { actions: EvaluatedAction[]; markers: SessionMarker[] } {
  return {
    actions: sessions.flatMap((s) => s.actions),
    markers: sessions.flatMap((s) => s.markers),
  }
}

// ============================================================================
// §1 — no markers at all → insufficient_extraction (never inferred)
// ============================================================================
{
  const actions = Array.from({ length: 20 }, () => goodRow())
  const markers = actions.map(() => undefined)
  const block = computeSessionDeclineSignal(actions, markers)
  assert(block !== undefined, '§1 block is computed (not undefined) when no markers present')
  assert(
    Object.values(block!.dimension_trends).every((t) => t === 'insufficient_extraction'),
    '§1 every dimension reads insufficient_extraction with zero declared sessions',
  )
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 0,
    '§1 qualifying_sessions is 0',
  )
}

// ============================================================================
// §2 — fewer than SESSION_DECLINE_THRESHOLD qualifying sessions
// ============================================================================
{
  const s1 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s2 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const { actions, markers } = concat([s1, s2]) // only 2 qualifying, threshold is 3
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 2,
    '§2 exactly 2 qualifying sessions counted',
  )
  assert(
    Object.values(block!.dimension_trends).every((t) => t === 'insufficient_extraction'),
    '§2 below-threshold session count reads insufficient_extraction',
  )
}

// ============================================================================
// §3 — rows before the first session_open are excluded
// ============================================================================
{
  const preamble = Array.from({ length: 5 }, () => goodRow())
  const s1 = session([badRow(), badRow(), badRow()], { close: true })
  const s2 = session([badRow(), badRow(), badRow()], { close: true })
  const s3 = session([badRow(), badRow(), badRow()], { close: true })
  const { actions: sAct, markers: sMark } = concat([s1, s2, s3])
  const actions = [...preamble, ...sAct]
  const markers: (SessionMarker | undefined)[] = [
    ...preamble.map(() => undefined),
    ...sMark,
  ]
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 3,
    '§3 the 5 preamble rows never form a session (3 qualifying sessions, not more)',
  )
}

// ============================================================================
// §4 — a session below EVIDENCE_FLOOR is not counted as qualifying
// ============================================================================
{
  assert(EVIDENCE_FLOOR === 3, 'EVIDENCE_FLOOR sanity (session fixtures below assume 3)')
  const tooSmall = session([goodRow(), goodRow()], { close: true }) // 2 < floor
  const s2 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s3 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s4 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const { actions, markers } = concat([tooSmall, s2, s3, s4])
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 3,
    '§4 the 2-row session is excluded; 3 of 4 declared sessions qualify',
  )
}

// ============================================================================
// §5 — a trailing never-closed/never-superseded session is dropped
// ============================================================================
{
  const s1 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s2 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s3 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const trailing = session([goodRow(), goodRow(), goodRow()], { close: false }) // never closes
  const { actions, markers } = concat([s1, s2, s3, trailing])
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 3,
    '§5 the trailing open session is dropped (not counted as a 4th qualifying session)',
  )
}
{
  // A trailing session IS counted once superseded by a later session_open.
  const s1 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s2 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const s3 = session([goodRow(), goodRow(), goodRow()], { close: false }) // superseded, not closed
  const s4 = session([goodRow(), goodRow(), goodRow()], { close: true })
  const { actions, markers } = concat([s1, s2, s3, s4])
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 4,
    '§5b a session superseded by the next open counts as complete (4 qualifying)',
  )
}

// ============================================================================
// §6 — a genuine sustained decline reads 'declining'
// ============================================================================
{
  // Session 1: all good (advanced). Session 2: mixed (developing). Session 3:
  // all bad (emerging). Strictly non-increasing, strictly lower at the end.
  const s1 = session([goodRow(), goodRow(), goodRow(), goodRow()], { close: true })
  const s2 = session([goodRow(), badRow(), goodRow(), badRow()], { close: true })
  const s3 = session([badRow(), badRow(), badRow(), badRow()], { close: true })
  const { actions, markers } = concat([s1, s2, s3])
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends.judgement_quality === 'declining',
    `§6 a monotone 3-session decline reads 'declining' (got ${block!.dimension_trends.judgement_quality})`,
  )
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 3,
    '§6 exactly 3 qualifying sessions',
  )
}

// ============================================================================
// §7 — a dip-then-recovery does NOT read 'declining' (non-vacuous)
// ============================================================================
{
  // Session 1: all good. Session 2: all bad (the dip). Session 3: all good
  // again (the recovery). Not monotone non-increasing → must not fire.
  const s1 = session([goodRow(), goodRow(), goodRow(), goodRow()], { close: true })
  const s2 = session([badRow(), badRow(), badRow(), badRow()], { close: true })
  const s3 = session([goodRow(), goodRow(), goodRow(), goodRow()], { close: true })
  const { actions, markers } = concat([s1, s2, s3])
  const block = computeSessionDeclineSignal(actions, markers)
  assert(
    block!.dimension_trends.judgement_quality !== 'declining',
    `§7 a dip-then-recovery must not read 'declining' (got ${block!.dimension_trends.judgement_quality})`,
  )
}

// ============================================================================
// §8 — a mismatched actions/markers length returns undefined
// ============================================================================
{
  const actions = [goodRow(), goodRow()]
  const markers: SessionMarker[] = ['session_open']
  const block = computeSessionDeclineSignal(actions, markers)
  assert(block === undefined, '§8 mismatched lengths return undefined, never a guess')
}

// ============================================================================
// §9 — SESSION_DECLINE_THRESHOLD sanity (documents the build decision)
// ============================================================================
assert(SESSION_DECLINE_THRESHOLD === 3, 'SESSION_DECLINE_THRESHOLD is 3 (the conservative end of 2-3)')

// ============================================================================
// §10 — segmentRowsToLatestRegime (C1f) is genuinely non-vacuous (PR19 fold:
// zero prior test constructed a session straddling a regime boundary; a
// mutation gutting segmentation to a no-op passed all 9 sections above
// unchanged). Uses a SYNTHETIC boundary — never the real production dates —
// so this pin is independent of when it runs.
// ============================================================================
{
  const SYNTHETIC_BOUNDARY: readonly RegimeBoundary[] = [
    {
      band_start_iso: '2020-06-01T00:00:00.000Z',
      band_end_iso: '2020-06-02T00:00:00.000Z',
      from_era: 'test-era-old',
      to_era: 'test-era-new',
      note: 'synthetic boundary for §10 — not a real production regime change',
    },
  ]
  const oldRow = (proximity: KatorthomaProximityLevel) =>
    mkAction({ evaluated_at: '2020-05-01T00:00:00.000Z', proximity })
  const bandRow = (proximity: KatorthomaProximityLevel) =>
    mkAction({ evaluated_at: '2020-06-01T12:00:00.000Z', proximity })
  const newRow = (proximity: KatorthomaProximityLevel) =>
    mkAction({ evaluated_at: '2020-07-01T00:00:00.000Z', proximity })

  // A session entirely in the OLD era, one entirely IN the boundary band, and
  // two entirely in the NEW era (the second a genuine decline vs the first).
  const sOld = session(
    [oldRow('sage_like'), oldRow('sage_like'), oldRow('sage_like')],
    { close: true },
  )
  const sBand = session(
    [bandRow('sage_like'), bandRow('sage_like'), bandRow('sage_like')],
    { close: true },
  )
  const sNew1 = session(
    [newRow('sage_like'), newRow('sage_like'), newRow('sage_like')],
    { close: true },
  )
  const sNew2 = session(
    [newRow('reflexive'), newRow('reflexive'), newRow('reflexive')],
    { close: true },
  )
  const { actions, markers } = concat([sOld, sBand, sNew1, sNew2])
  const block = computeSessionDeclineSignal(actions, markers, SYNTHETIC_BOUNDARY)
  const basis = block!.dimension_trends_basis.judgement_quality

  assert(
    basis.regime.segment_used === 'test-era-new',
    `§10 the latest non-band era is selected (got ${basis.regime.segment_used})`,
  )
  assert(
    basis.regime.rows_excluded_boundary_band === 3,
    `§10 the 3 band rows are excluded and counted (got ${basis.regime.rows_excluded_boundary_band})`,
  )
  assert(
    basis.regime.rows_excluded_earlier_eras === 3,
    `§10 the 3 old-era rows are excluded and counted (got ${basis.regime.rows_excluded_earlier_eras})`,
  )
  assert(
    basis.regime.rows_in_segment === 6,
    `§10 only the 6 new-era rows enter the segment (got ${basis.regime.rows_in_segment})`,
  )
  assert(
    basis.qualifying_sessions === 2,
    `§10 NON-VACUITY: only 2 qualifying sessions (sOld and sBand dropped) — a no-op ` +
      `segmentation would report 4 (got ${basis.qualifying_sessions})`,
  )
  assert(
    block!.dimension_trends.judgement_quality !== 'declining',
    `§10 fewer than 3 qualifying sessions after segmentation ⇒ insufficient_extraction, ` +
      `never 'declining' (a no-op segmentation would see 4 sessions incl. the old-era one ` +
      `and could read a spurious decline) (got ${block!.dimension_trends.judgement_quality})`,
  )
}
{
  // CONTROL: the same rows with NO boundary supplied (default SETTLED_REGIME_
  // BOUNDARIES, which does not straddle 2020) all fall in one era and all 4
  // sessions qualify — proves §10's exclusions above are the boundary's doing,
  // not some other filter.
  const oldRow = (proximity: KatorthomaProximityLevel) =>
    mkAction({ evaluated_at: '2020-05-01T00:00:00.000Z', proximity })
  const s1 = session([oldRow('sage_like'), oldRow('sage_like'), oldRow('sage_like')], { close: true })
  const s2 = session([oldRow('sage_like'), oldRow('sage_like'), oldRow('sage_like')], { close: true })
  const s3 = session([oldRow('sage_like'), oldRow('sage_like'), oldRow('sage_like')], { close: true })
  const { actions, markers } = concat([s1, s2, s3])
  const block = computeSessionDeclineSignal(actions, markers, [])
  assert(
    block!.dimension_trends_basis.judgement_quality.qualifying_sessions === 3,
    '§10 CONTROL: with an EMPTY boundary list every row is one era, all 3 sessions qualify',
  )
}

console.log('')
console.log(`Total: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
if (failed > 0) {
  console.error('')
  console.error('Failures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
