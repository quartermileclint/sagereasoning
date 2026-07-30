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
import { EVIDENCE_FLOOR } from '../trajectory-delta'

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

console.log('')
console.log(`Total: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
if (failed > 0) {
  console.error('')
  console.error('Failures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
