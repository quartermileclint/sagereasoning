/**
 * trajectory-delta.test.ts — AE-1: the shared practice-delta module + its seams
 * (ADR-014 §§3.1, 3.3, 4, 5; elections E-AE1-1 column / E-AE1-2 boundary split).
 *
 * Plain-assertion script: npx tsx <this file>   (bare — the store's admin
 * client is lazy; nothing here performs I/O).
 *
 * The load-bearing pins, in order of what they protect:
 *   §1  Evidence floors are NON-VACUOUS: a starved window (the frozen-buffer
 *       shape — sub-species empty, zero circles) emits the DISTINCT
 *       'insufficient_extraction', never a defaulted 'stable' and never a
 *       flattering 'advanced' level (the R13 anti-laundering guard).
 *   §2  Floor boundary arithmetic (≥3 non-empty per compared half).
 *   §3  Regime discipline: windows split at the S11b boundary; band rows are
 *       excluded + counted; deltas never compare across the boundary.
 *   §4  Frequency-delta classification (D17 vocabulary: fading/recurring/new/
 *       stable) + the always-present-enum trends.
 *   §5  Identity resolution + disclosures: the cross-tenant pair-join refusal;
 *       the rotation-truncation note; the identity floor.
 *   §6  Provenance mix (n_supplied/n_server/n_unknown).
 *   §7  Determinism + canonical vocabulary + the locked wording (mention-
 *       conversion bound; record-descriptive note).
 *   §8  Store seams: the flag; the PGRST204 write-key guard; the flag-gated
 *       select column; the depth_tier read addition.
 *   §9  Route wiring INV pins (source-grep — the established pattern) incl.
 *       the no-agent_id-keyed-read structural guard.
 *   §10 The M7 overlay is unchanged when no delta is attached (byte-identity
 *       of the flag-off shape).
 */

import { readFileSync } from 'fs'
import { join } from 'path'

import type { EvaluatedAction } from '../trust-layer/types/evaluation'
import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'
import type { TrajectoryWindow } from '../agent-assessment-history-store'
import {
  assessmentHistoryInputToRow,
  getTrajectoryWindow,
  isTrajectoryDeltaEnabled,
  trajectorySelectCols,
  TRAJECTORY_DELTA_ENV_VAR,
  type AssessmentHistoryInput,
} from '../agent-assessment-history-store'
import { computeTrajectoryOverlay } from '../trajectory-overlay'
import {
  computeTrajectoryDelta,
  SETTLED_REGIME_BOUNDARIES,
  EVIDENCE_FLOOR,
  VOCABULARY_NOTE,
  MENTION_CONVERSION_BOUND,
  type RegimeBoundary,
  type TrajectoryDeltaBlock,
} from '../trajectory-delta'
import {
  resolveLongitudinalIdentity,
  describeWindowScope,
  ROTATION_TRUNCATION_NOTE,
  type LongitudinalIdentity,
} from '../longitudinal-identity'

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

// ============================================================================
// Fixtures
// ============================================================================

const DAY = 86_400_000
const PRE = Date.parse('2026-07-10T00:00:00.000Z') // pre-S11b era
const POST = Date.parse('2026-07-20T00:00:00.000Z') // post-S11b era
const isoAt = (baseMs: number, offsetDays: number): string =>
  new Date(baseMs + offsetDays * DAY).toISOString()

function mkAction(
  evaluatedAt: string,
  o: Partial<EvaluatedAction> = {},
): EvaluatedAction {
  return {
    receipt_id: 'r',
    agent_id: 'api_key:k',
    evaluated_at: evaluatedAt,
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

function win(actions: EvaluatedAction[]): TrajectoryWindow {
  return { actions, windowDays: 90, maxInstances: 30, earliest: null, latest: null }
}

const PAIR_IDENTITY: LongitudinalIdentity = {
  kind: 'owner_agent_pair',
  owner_user_id: 'owner-1',
  agent_id: 'sagereasoning:test@v1',
  credential_ref: 'api_key:k1',
}

function delta(
  actions: EvaluatedAction[],
  opts: {
    identity?: LongitudinalIdentity
    boundaries?: readonly RegimeBoundary[]
    layer1Sources?: (('supplied' | 'server') | null | undefined)[]
  } = {},
): TrajectoryDeltaBlock {
  return computeTrajectoryDelta(win(actions), {
    identity: opts.identity ?? PAIR_IDENTITY,
    boundaries: opts.boundaries,
    layer1Sources: opts.layer1Sources,
  })
}

// All-post-era rows, n of them, one day apart.
function postRows(n: number, per?: (i: number) => Partial<EvaluatedAction>): EvaluatedAction[] {
  return Array.from({ length: n }, (_, i) => mkAction(isoAt(POST, i), per?.(i) ?? {}))
}

// ============================================================================
// §1 — Evidence floors are non-vacuous (the R13 anti-laundering pins)
// ============================================================================

{
  // The frozen-buffer shape: a starved window — no passions, no circles,
  // every row 'contrary'/deliberate (the live at-action false-positive class).
  const starved = postRows(20, () => ({
    kathekon_quality: 'contrary',
    is_kathekon: false,
  }))
  const d = delta(starved)

  assert(
    d.sub_species_frequency_deltas === 'insufficient_extraction',
    '§1 starved window: sub-species deltas read insufficient_extraction',
  )
  assert(
    d.passions_persisted_in_window === 'insufficient_extraction',
    '§1 starved window: persisted passions read insufficient_extraction',
  )
  assert(
    d.first_circle_obligation_trend === 'insufficient_extraction',
    '§1 starved window: obligation trend reads insufficient_extraction',
  )
  assert(
    d.domain_engagement_deltas === 'insufficient_extraction',
    '§1 starved window: domain deltas read insufficient_extraction',
  )
  // The anti-laundering core: passion_reduction must NOT read 'advanced' (the
  // level an all-empty-passions window computes) — it must be floored.
  assert(
    d.dimension_trends.passion_reduction === 'insufficient_extraction',
    '§1 starved window: passion_reduction is floored, never certified advanced',
  )
  assert(
    d.dimension_trends.oikeiosis_extension === 'insufficient_extraction',
    '§1 starved window: oikeiosis_extension is floored',
  )
  // NEVER a defaulted 'stable' anywhere a floor fired.
  assert(
    (d.sub_species_frequency_deltas as unknown) !== 'stable' &&
      (d.first_circle_obligation_trend as unknown) !== 'stable',
    '§1 starved window: no floored signal defaults to stable',
  )
  // Always-present enums still compute honestly (kathekon_quality/proximity
  // exist on every row — the floor is met; the readings are unflattering).
  assert(
    d.kathekon_quality_trend === 'stable',
    '§1 starved window: kathekon-quality trend computes (always-present enum) and reads stable',
  )
  assert(
    d.dimension_trends.judgement_quality !== 'insufficient_extraction' &&
      d.dimension_trends.disposition_stability !== 'insufficient_extraction',
    '§1 starved window: always-present-fed dimensions compute',
  )
  // Basis honesty: the reader can distinguish starvation from sparsity.
  assert(
    d.passions_persisted_basis.input_count === 20 &&
      d.passions_persisted_basis.empty_count === 20 &&
      d.passions_persisted_basis.floor === EVIDENCE_FLOOR,
    '§1 starved window: basis names 20 inputs / 20 empty / floor 3',
  )
}

// ============================================================================
// §2 — Floor boundary arithmetic (≥3 non-empty per compared half)
// ============================================================================

{
  // 8 rows; passions on 3 of the first 4 and 3 of the last 4 → floor met.
  const enough = postRows(8, (i) => ({
    passions_detected:
      i % 4 < 3 ? [{ root_passion: 'phobos', sub_species: 'anxiety' }] : [],
  }))
  const dEnough = delta(enough)
  assert(
    typeof dEnough.sub_species_frequency_deltas === 'object',
    '§2 floor met (3 per half): sub-species deltas compute',
  )
  assert(
    dEnough.sub_species_frequency_basis.baseline_non_empty === 3 &&
      dEnough.sub_species_frequency_basis.current_non_empty === 3,
    '§2 floor met: basis counts 3/3 non-empty halves',
  )

  // 8 rows; passions on only 2 per half → floored.
  const short = postRows(8, (i) => ({
    passions_detected:
      i % 4 < 2 ? [{ root_passion: 'phobos', sub_species: 'anxiety' }] : [],
  }))
  const dShort = delta(short)
  assert(
    dShort.sub_species_frequency_deltas === 'insufficient_extraction',
    '§2 floor unmet (2 per half): sub-species deltas floored',
  )

  // Tiny window (2 rows): everything below the floor.
  const tiny = postRows(2, () => ({
    passions_detected: [{ root_passion: 'phobos', sub_species: 'anxiety' }],
  }))
  const dTiny = delta(tiny)
  assert(
    dTiny.sub_species_frequency_deltas === 'insufficient_extraction' &&
      dTiny.kathekon_quality_trend === 'insufficient_extraction',
    '§2 two-row window: between-half signals floored (sparse history reads as such via basis)',
  )
  assert(
    dTiny.sub_species_frequency_basis.input_count === 2 &&
      dTiny.sub_species_frequency_basis.empty_count === 0,
    '§2 two-row window: basis distinguishes sparsity (2 inputs, 0 empty) from starvation',
  )
}

// ============================================================================
// §3 — Regime discipline (election E-AE1-2: boundary-date split)
// ============================================================================

{
  // 6 pre-era rows carrying a passion key that must NOT leak into the deltas,
  // 2 band rows (2026-07-18), 10 post-era rows.
  const preRows = Array.from({ length: 6 }, (_, i) =>
    mkAction(isoAt(PRE, i), {
      passions_detected: [{ root_passion: 'epithumia', sub_species: 'pre-era-only' }],
    }),
  )
  const bandRows = [
    mkAction('2026-07-18T06:00:00.000Z'),
    mkAction('2026-07-18T20:00:00.000Z'),
  ]
  const post = postRows(10, (i) => ({
    passions_detected:
      i < 8 ? [{ root_passion: 'phobos', sub_species: 'anxiety' }] : [],
  }))
  const d = delta([...preRows, ...bandRows, ...post])

  assert(
    d.regime.segment_used === 'post-s11b-recomposition',
    '§3 spanning window: the latest segment is used',
  )
  assert(
    d.regime.rows_in_window === 18 &&
      d.regime.rows_in_segment === 10 &&
      d.regime.rows_excluded_earlier_eras === 6 &&
      d.regime.rows_excluded_boundary_band === 2,
    '§3 spanning window: exclusion accounting is exact',
  )
  const subs = d.sub_species_frequency_deltas
  assert(
    typeof subs === 'object' && !('epithumia/pre-era-only' in subs),
    '§3 spanning window: pre-era keys never feed the deltas (no cross-regime comparison)',
  )
  assert(
    d.computed_over.baseline_rows === 5 && d.computed_over.current_rows === 5,
    '§3 spanning window: halves are of the segment, not the window',
  )

  // Entirely pre-boundary window: the pre era IS the (only) segment.
  const dPre = delta(preRows)
  assert(
    dPre.regime.segment_used === 'pre-s11b-recomposition' &&
      dPre.regime.rows_excluded_earlier_eras === 0,
    '§3 pre-only window: pre era used, nothing excluded',
  )

  // Entirely band window: nothing computable; everything floored + disclosed.
  const dBand = delta(bandRows)
  assert(
    dBand.regime.segment_used === null &&
      dBand.regime.rows_excluded_boundary_band === 2 &&
      dBand.kathekon_quality_trend === 'insufficient_extraction',
    '§3 band-only window: null segment, all signals floored',
  )

  // The settled boundary constant carries the S11b identifiers.
  assert(
    SETTLED_REGIME_BOUNDARIES.length === 1 &&
      SETTLED_REGIME_BOUNDARIES[0].note.includes('at-action-v1-lean') &&
      SETTLED_REGIME_BOUNDARIES[0].note.includes('at-action-v2-composed') &&
      SETTLED_REGIME_BOUNDARIES[0].band_start_iso === '2026-07-18T00:00:00.000Z',
    '§3 settled boundary: the S11b regime identifiers + date are encoded',
  )

  // Unsorted custom boundaries are sorted before assignment.
  const b1: RegimeBoundary = {
    band_start_iso: '2026-07-25T00:00:00.000Z',
    band_end_iso: '2026-07-26T00:00:00.000Z',
    from_era: 'mid',
    to_era: 'late',
    note: 'second change',
  }
  const b0: RegimeBoundary = {
    band_start_iso: '2026-07-18T00:00:00.000Z',
    band_end_iso: '2026-07-19T00:00:00.000Z',
    from_era: 'early',
    to_era: 'mid',
    note: 'first change',
  }
  const late = Array.from({ length: 4 }, (_, i) =>
    mkAction(isoAt(Date.parse('2026-07-27T00:00:00.000Z'), i)),
  )
  const dMulti = delta([...preRows, ...post, ...late], { boundaries: [b1, b0] })
  assert(
    dMulti.regime.segment_used === 'late' &&
      dMulti.regime.boundaries[0].from_era === 'early',
    '§3 multi-boundary: boundaries sorted; latest era wins',
  )
}

// ============================================================================
// §4 — Delta classification (D17 vocabulary) + trends
// ============================================================================

{
  // Sub-species: 'anxiety' fades (present baseline, absent current); 'anger'
  // is new (absent baseline, present current); 'dread' recurs (rate up);
  // 'habit' stable (same rate). 10 rows per half, all passion-bearing.
  const rows = postRows(20, (i) => {
    const half = i < 10 ? 'baseline' : 'current'
    const ps: { root_passion: string; sub_species: string }[] = []
    if (half === 'baseline') {
      ps.push({ root_passion: 'phobos', sub_species: 'anxiety' })
      if (i < 2) ps.push({ root_passion: 'phobos', sub_species: 'dread' })
      if (i < 5) ps.push({ root_passion: 'epithumia', sub_species: 'habit' })
    } else {
      if (i >= 15) ps.push({ root_passion: 'lupe', sub_species: 'anger' })
      if (i < 16) ps.push({ root_passion: 'phobos', sub_species: 'dread' })
      if (i < 15) ps.push({ root_passion: 'epithumia', sub_species: 'habit' })
    }
    return {
      passions_detected: ps as EvaluatedAction['passions_detected'],
      virtue_domains_engaged:
        half === 'baseline' ? ['phronesis'] : ['phronesis', 'dikaiosyne'],
      oikeiosis_met: half === 'baseline' ? false : true,
      oikeiosis_stage: 'local_community',
    }
  })
  const d = delta(rows)
  const subs = d.sub_species_frequency_deltas as Record<string, string>
  assert(subs['phobos/anxiety'] === 'fading', '§4 fading: present→absent')
  assert(subs['lupe/anger'] === 'new', '§4 new: absent→present')
  assert(subs['phobos/dread'] === 'recurring', '§4 recurring: rate up ≥ +0.15')
  assert(subs['epithumia/habit'] === 'stable', '§4 stable: rate unchanged')

  // Domain engagement: dikaiosyne newly engaged in the current half.
  const doms = d.domain_engagement_deltas as Record<string, string>
  assert(doms['dikaiosyne'] === 'new', '§4 domain new: dikaiosyne appears in current half')
  assert(doms['phronesis'] === 'stable', '§4 domain stable: phronesis constant')

  // Obligation trend: met-rate 0 → 1 across halves ⇒ improving.
  assert(
    d.first_circle_obligation_trend === 'improving',
    '§4 obligation trend: met-rate rise reads improving',
  )
  assert(
    d.first_circle_obligation_basis.semantics.includes('first'),
    '§4 obligation basis: first-circle semantics disclosed',
  )

  // Kathekon-quality trend: contrary-heavy → strong-heavy ⇒ improving.
  const q = postRows(12, (i) => ({
    kathekon_quality: i < 6 ? 'contrary' : 'strong',
  }))
  assert(
    delta(q).kathekon_quality_trend === 'improving',
    '§4 quality trend: contrary→strong reads improving',
  )
  const qDown = postRows(12, (i) => ({
    kathekon_quality: i < 6 ? 'strong' : 'contrary',
  }))
  assert(
    delta(qDown).kathekon_quality_trend === 'declining',
    '§4 quality trend: strong→contrary reads declining',
  )

  // Persisted passions surface (>20% aggregator rule) when the floor is met.
  const persisted = d.passions_persisted_in_window
  assert(
    Array.isArray(persisted) &&
      persisted.some((p) => `${p.root_passion}/${p.sub_species}` === 'epithumia/habit'),
    '§4 persisted passions: the aggregator material is surfaced, not re-derived',
  )
}

// ============================================================================
// §5 — Identity resolution + disclosures (ADR-014 §4)
// ============================================================================

{
  // The canonical pair.
  const pair = resolveLongitudinalIdentity({
    credentialRef: 'api_key:k1',
    ownerUserId: 'owner-1',
    agentId: 'sagereasoning:test@v1',
  })
  assert(pair.kind === 'owner_agent_pair', '§5 owner+agent resolves to the pair')

  // The cross-tenant guard: agent-declared but OWNER-LESS never yields an
  // agent-keyed identity (the live s9-loop consult credential's shape).
  const ownerless = resolveLongitudinalIdentity({
    credentialRef: 'api_key:k2',
    ownerUserId: null,
    agentId: 'sagereasoning:s9-loop@v1',
  })
  assert(
    ownerless.kind === 'credential' && ownerless.agent_declared === true,
    '§5 owner-less agent-declared: pair join refused (cross-tenant guard)',
  )

  // The identity floor (undeclared; subsumes install:).
  const floor = resolveLongitudinalIdentity({
    credentialRef: 'install:abc',
    ownerUserId: 'owner-2',
    agentId: null,
  })
  assert(
    floor.kind === 'credential' && floor.agent_declared === false,
    '§5 undeclared: credential is the identity floor',
  )

  // Disclosures.
  const pairScope = describeWindowScope(pair)
  assert(
    pairScope.rotation_note === ROTATION_TRUNCATION_NOTE &&
      pairScope.window_scope === 'presenting_credential',
    '§5 pair scope: rotation truncation disclosed',
  )
  assert(
    ROTATION_TRUNCATION_NOTE.includes('window truncated by credential rotation'),
    '§5 the ADR-014 §4 clause is locked verbatim-in-intent',
  )
  const ownerlessScope = describeWindowScope(ownerless)
  assert(
    ownerlessScope.rotation_note !== null,
    '§5 owner-less agent-declared scope: rotation truncation disclosed (gen-1→gen-2 class)',
  )
  const floorScope = describeWindowScope(floor)
  assert(
    floorScope.rotation_note === null && floorScope.canonical_identity === 'credential',
    '§5 identity-floor scope: no truncation note (a new credential is a new identity)',
  )

  // The block carries the disclosure.
  const d = delta(postRows(4), { identity: ownerless })
  assert(
    d.identity.rotation_note !== null && d.identity.agent_declared === true,
    '§5 delta block: identity disclosure rides every block',
  )
}

// ============================================================================
// §6 — Provenance mix (election E-AE1-1)
// ============================================================================

{
  const rows = postRows(6)
  const dUnknown = delta(rows)
  assert(
    dUnknown.provenance.n_unknown === 6 &&
      dUnknown.provenance.n_supplied === 0 &&
      dUnknown.provenance.n_server === 0,
    '§6 no layer1Sources: all rows read unknown (pre-column honesty)',
  )

  const dMixed = delta(rows, {
    layer1Sources: ['supplied', 'server', 'server', null, undefined, 'supplied'],
  })
  assert(
    dMixed.provenance.n_supplied === 2 &&
      dMixed.provenance.n_server === 2 &&
      dMixed.provenance.n_unknown === 2,
    '§6 mixed sources: counts exact; null/undefined read unknown',
  )

  // Counted over the SEGMENT: a pre-era supplied row must not count.
  const spanning = [
    mkAction(isoAt(PRE, 0)),
    ...postRows(4),
  ]
  const dSeg = delta(spanning, {
    layer1Sources: ['supplied', 'server', 'server', 'server', 'server'],
  })
  assert(
    dSeg.provenance.n_supplied === 0 && dSeg.provenance.n_server === 4,
    '§6 provenance is counted over the regime segment the deltas use',
  )
}

// ============================================================================
// §7 — Determinism, canonical vocabulary, locked wording
// ============================================================================

{
  const rows = postRows(12, (i) => ({
    proximity: (i < 6 ? 'habitual' : 'principled') as KatorthomaProximityLevel,
    passions_detected:
      i % 2 === 0 ? [{ root_passion: 'phobos', sub_species: 'anxiety' }] : [],
    oikeiosis_met: i % 3 === 0,
    oikeiosis_stage: 'family',
  }))
  const a = JSON.stringify(delta(rows))
  const b = JSON.stringify(delta(rows))
  assert(a === b, '§7 determinism: a fixed window yields a byte-identical block')
  assert(!a.includes('computed_at'), '§7 the aggregator clock is never surfaced')
  assert(!a.includes('regressing'), '§7 canonical vocabulary: no "regressing" leaks')

  const d = delta(rows)
  assert(
    d.vocabulary_note === VOCABULARY_NOTE &&
      VOCABULARY_NOTE.includes('past tense') &&
      VOCABULARY_NOTE.includes('predict'),
    '§7 record-descriptive note locked',
  )
  assert(
    d.bounds.mention_conversion === MENTION_CONVERSION_BOUND &&
      MENTION_CONVERSION_BOUND.includes('NARROWED_ARM_BOUNDS.mentionConversion') &&
      MENTION_CONVERSION_BOUND.includes('quoted party language'),
    '§7 the S11b mention-conversion bound rides the block verbatim-in-intent',
  )
  assert(d.schema === 'agent-trajectory-delta-v1', '§7 schema tag')
}

// ============================================================================
// §8 — Store seams: flag, PGRST204 write-key guard, select columns
// ============================================================================

{
  const baseInput: AssessmentHistoryInput = {
    correlationId: 'c1',
    credentialRef: 'api_key:k1',
    ownerUserId: 'owner-1',
    agentId: null,
    depthTier: 'standard',
    surface: 'api_reason',
    action: mkAction(isoAt(POST, 0)),
  }

  // The PGRST204 guard: NO layer1_source key unless supplied.
  const bare = assessmentHistoryInputToRow(baseInput)
  assert(
    !Object.prototype.hasOwnProperty.call(bare, 'layer1_source'),
    '§8 write row without layer1Source carries NO layer1_source key (PGRST204 guard)',
  )
  const stamped = assessmentHistoryInputToRow({ ...baseInput, layer1Source: 'supplied' })
  assert(
    stamped.layer1_source === 'supplied',
    '§8 write row with layer1Source carries the stamp',
  )

  // The flag.
  const prior = process.env[TRAJECTORY_DELTA_ENV_VAR]
  delete process.env[TRAJECTORY_DELTA_ENV_VAR]
  assert(isTrajectoryDeltaEnabled() === false, '§8 flag unset → disabled')
  const colsOff = trajectorySelectCols()
  assert(
    !colsOff.includes('layer1_source'),
    '§8 flag-off select: no layer1_source column queried (pre-migration safe)',
  )
  assert(
    colsOff.includes('depth_tier'),
    '§8 flag-off select: depth_tier is read unconditionally (AE-3 seam)',
  )
  assert(
    colsOff.startsWith(
      'correlation_id, credential_ref, agent_id, created_at, receipt_id, proximity',
    ),
    '§8 flag-off select: the M6/M7 base column list is intact',
  )
  process.env[TRAJECTORY_DELTA_ENV_VAR] = 'TRUE'
  assert(isTrajectoryDeltaEnabled() === false, '§8 flag is exact-match ("TRUE" ≠ true)')
  process.env[TRAJECTORY_DELTA_ENV_VAR] = 'true'
  assert(isTrajectoryDeltaEnabled() === true, '§8 flag "true" → enabled')
  assert(
    trajectorySelectCols().includes('layer1_source'),
    '§8 flag-on select: layer1_source column included',
  )
  if (prior === undefined) delete process.env[TRAJECTORY_DELTA_ENV_VAR]
  else process.env[TRAJECTORY_DELTA_ENV_VAR] = prior
}

// ============================================================================
// §9 — Route wiring + structural guards (INV source-grep pins)
// ============================================================================

{
  const routeSrc = readFileSync(
    join(__dirname, '../../../app/api/reason/route.ts'),
    'utf8',
  )
  assert(
    routeSrc.includes('if (isTrajectoryDeltaEnabled())') &&
      routeSrc.includes('trajectoryOverlay.delta = computeTrajectoryDelta('),
    '§9 INV: the delta attachment is guarded by the delta flag',
  )
  assert(
    routeSrc.includes('...(isTrajectoryDeltaEnabled()') &&
      routeSrc.includes(
        "layer1Source: (preExtractedLayer1Schema !== undefined",
      ),
    '§9 INV: the write stamp is flag-gated and uses TRUE provenance (both supplied paths)',
  )

  const storeSrc = readFileSync(
    join(__dirname, '../agent-assessment-history-store.ts'),
    'utf8',
  )
  assert(
    !storeSrc.includes(".eq('agent_id'"),
    '§9 structural: no longitudinal read is keyed on agent_id (cross-tenant guard)',
  )
  assert(
    storeSrc.includes(".eq('credential_ref', opts.credentialRef)"),
    '§9 structural: the windowed read stays credential-scoped (R17a)',
  )

  const deltaSrc = readFileSync(join(__dirname, '../trajectory-delta.ts'), 'utf8')
  const identitySrc = readFileSync(
    join(__dirname, '../longitudinal-identity.ts'),
    'utf8',
  )
  for (const [name, src] of [
    ['trajectory-delta', deltaSrc],
    ['longitudinal-identity', identitySrc],
  ] as const) {
    assert(
      !src.includes('process.env') &&
        !src.includes('Date.now') &&
        !src.includes('createClient') &&
        !src.includes('.from('),
      `§9 purity: ${name} reads no env/clock and performs no I/O`,
    )
  }
  // MEASURE is asserted on the OUTPUT (the module's own comments legitimately
  // name the words while forswearing them): no block ever carries a
  // recommendation/enforcement/verdict key or value.
  const measureProbe = JSON.stringify(delta(postRows(12)))
  assert(
    !measureProbe.includes('recommend') &&
      !measureProbe.includes('enforce') &&
      !measureProbe.includes('do_not_proceed') &&
      !measureProbe.includes('verdict'),
    '§9 MEASURE: no delta block carries a recommendation/enforcement surface',
  )
}

// ============================================================================
// §10 — The M7 overlay is unchanged when no delta is attached
// ============================================================================

{
  const rows = postRows(5)
  const overlay = computeTrajectoryOverlay(win(rows))
  assert(
    !('delta' in overlay) || overlay.delta === undefined,
    '§10 overlay without attachment carries no delta key',
  )
  assert(
    !JSON.stringify(overlay).includes('"delta"'),
    '§10 overlay JSON is byte-free of the delta key (flag-off wire shape)',
  )
  assert(
    overlay.schema === 'agent-trajectory-overlay-v1',
    '§10 overlay schema tag unchanged',
  )
}

// ============================================================================
// §11 — fail-honest on a missing COLUMN (the F1 fold: 42703/PGRST204 are
// NEVER missing-table-benign — a flag-before-migration misorder must surface
// ok:false, not a false-empty fresh-start window) + summary
// ============================================================================

// Minimal chainable fake supabase client whose terminal .limit() resolves to
// the injected { data, error }.
function fakeClient(
  result: { data: unknown; error: unknown },
): NonNullable<Parameters<typeof getTrajectoryWindow>[1]> {
  const chain = {
    select: () => chain,
    eq: () => chain,
    gte: () => chain,
    order: () => chain,
    limit: async () => result,
  }
  return { from: () => chain } as unknown as NonNullable<
    Parameters<typeof getTrajectoryWindow>[1]
  >
}

;(async () => {
  const colErr = await getTrajectoryWindow(
    { credentialRef: 'api_key:k1', nowMs: Date.parse('2026-07-20T00:00:00.000Z') },
    fakeClient({
      data: null,
      error: {
        code: '42703',
        message: 'column agent_assessment_history.layer1_source does not exist',
      },
    }),
  )
  assert(
    colErr.ok === false,
    '§11 a missing COLUMN surfaces ok:false (fail-honest), never a benign-empty window',
  )

  const pgrst204 = await getTrajectoryWindow(
    { credentialRef: 'api_key:k1', nowMs: Date.parse('2026-07-20T00:00:00.000Z') },
    fakeClient({
      data: null,
      error: {
        code: 'PGRST204',
        message:
          "Could not find the 'layer1_source' column of 'agent_assessment_history' in the schema cache",
      },
    }),
  )
  assert(
    pgrst204.ok === false,
    '§11 PGRST204 (column-in-schema-cache) surfaces ok:false — the standing memory class',
  )

  const tableErr = await getTrajectoryWindow(
    { credentialRef: 'api_key:k1', nowMs: Date.parse('2026-07-20T00:00:00.000Z') },
    fakeClient({
      data: null,
      error: {
        code: '42P01',
        message: 'relation "public.agent_assessment_history" does not exist',
      },
    }),
  )
  assert(
    tableErr.ok === true && tableErr.ok && tableErr.value.actions.length === 0,
    '§11 control: a genuinely missing TABLE stays benign-empty (pre-migration deployments)',
  )

  // Summary
  console.log(`\ntrajectory-delta.test.ts: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
})()
