/**
 * practice-suggestion.test.ts — the agent practice-suggestion battery
 * (practice reminders, agent Phase A1; 2026-07-28).
 *
 * Plain-assertion script: npx tsx <this file>   (bare — the composer is pure;
 * the flag pins mutate process.env directly).
 *
 * The load-bearing pins, in order of what they protect:
 *   §1  Flag discipline (exact-string 'true'; the seam helper is the ONLY env
 *       read, and it returns undefined flag-off even on a snapshot that WOULD
 *       fire — the byte-identity guarantee at both seams).
 *   §2  The locked strings (asserted on the EXPORTED VALUES, never a source
 *       substring — a source check is satisfied by a comment or an identifier,
 *       the standing lesson): every line ends with SUGGESTION_QUESTION verbatim
 *       and opens with the record clause; NO line names a practice as a
 *       destination (the Step M question-form verdict, mechanically enforced).
 *   §3  ONE suggestion max + the precedence order B2 → B1 → B3 → B4 → B6, with
 *       multi-basis snapshots proving each rung outranks the next.
 *   §4  B2 (obligations) — every leg, incl. BD-4 (a self-only circle is NOT an
 *       obligation to another party) and BD-5 (weakest means actually weak).
 *   §5  B1 — BD-1b (kathekon-gated: the measured false-positive hold class is
 *       SILENT) and BD-1a (the fold's open loops are silent).
 *   §6  B3 / B4 — family reads off the root-qualified key prefix and off
 *       PersistingPassion.root_passion; other families never fire.
 *   §7  B5 is SILENT in v1 (BD-2) and `deepen_examination` is emitted by NO
 *       path — the deferral is asserted, not merely commented.
 *   §8  B7's PROTECTED SILENCE: no basis ⇒ undefined ⇒ the field is ABSENT
 *       (never present-and-null), and every floored/`insufficient_extraction`
 *       signal is skipped rather than degraded into a basis.
 *   §9  Purity + MEASURE: no recommendation key anywhere in the block; the
 *       module never imports the intervention engine (source-grep, mirroring
 *       the loop-fold's own guard); the COMPOSER reads no env; determinism.
 *   §10 Route wiring INV pins (source-grep — the established pattern for route
 *       code no unit render exercises), both seams.
 *   §11 unwrapAssessment across bare / signed / unusable input.
 *   §12 The framing note carries every clause the plan §4 requires.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import {
  composePracticeSuggestion,
  isPracticeSuggestionEnabled,
  practiceSuggestionFor,
  unwrapAssessment,
  PRACTICE_SUGGESTION_ENV_VAR,
  PRACTICE_SUGGESTION_FRAMING_NOTE,
  SUGGESTION_LINES,
  SUGGESTION_QUESTION,
  type PracticeSuggestionBasisCode,
  type PracticeSuggestionSnapshot,
} from '../practice-suggestion'
import type { TrajectoryDeltaBlock } from '../trajectory-delta'
import { EVIDENCE_FLOOR, SETTLED_REGIME_BOUNDARIES } from '../trajectory-delta'
import type { LoopFoldBlock } from '../trust-core/loop-fold'
import { NARROWED_ARM_BOUNDS } from '../trust-core/kathekon-engagement'
import type { LongitudinalIdentity } from '../longitudinal-identity'
import { buildWriteSuccessResponse } from '@/app/api/accreditation/[agent_id]/response-builders'

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

/** The code the snapshot produced, or null for honest silence. */
function codeOf(s: PracticeSuggestionSnapshot): PracticeSuggestionBasisCode | null {
  return composePracticeSuggestion(s)?.basis.code ?? null
}

// ============================================================================
// Fixtures
// ============================================================================

interface CircleSpec {
  circle?: string | null
  status?: 'met' | 'violated' | 'indeterminate' | null
}

interface AssessmentSpec {
  proximity?: string
  domains?: string[]
  circles?: CircleSpec[]
  passions?: string[]
  floors?: {
    base: string
    dikaiosyne: string | null
    andreia?: string | null
    sophrosyne?: string | null
    aggregate: string
  }
}

/** A Layer2Assessment-shaped object carrying exactly the fields the composer
 *  and the canonical kathekon predicate read. */
function assessment(spec: AssessmentSpec = {}): unknown {
  return {
    katorthoma_proximity: spec.proximity ?? 'deliberate',
    virtue_domains_engaged: spec.domains ?? [],
    oikeiosis: {
      relevant_circles: (spec.circles ?? []).map((c) => ({
        circle: c.circle === undefined ? 'local_community' : c.circle,
        ...(c.status !== undefined && c.status !== null
          ? { obligation_assessment: { status: c.status, justification: 'fixture' } }
          : {}),
      })),
      deliberation_notes: '',
    },
    passion_diagnosis: {
      passions_detected: (spec.passions ?? []).map((sub) => ({
        root_passion: 'phobos',
        sub_species: sub,
      })),
    },
    ...(spec.floors !== undefined
      ? {
          proximity_floors: {
            base: spec.floors.base,
            dikaiosyne: spec.floors.dikaiosyne,
            andreia: spec.floors.andreia ?? null,
            sophrosyne: spec.floors.sophrosyne ?? null,
            aggregate: spec.floors.aggregate,
            basis: 'fixture',
          },
        }
      : {}),
  }
}

/** The LIVE wire shape: Layer-2 signing is on in production, so the response
 *  `assessment` field is a SignedLayer2Assessment. */
function signed(bare: unknown): unknown {
  return { assessment: bare, signature: 'sig-fixture', key_id: 'test-key' }
}

const PAIR_IDENTITY: LongitudinalIdentity = {
  kind: 'owner_agent_pair',
  owner_user_id: 'owner-1',
  agent_id: 'sagereasoning:test-agent@v1',
  credential_ref: 'api_key:cred-1',
}

function basis(nonEmpty = 6): TrajectoryDeltaBlock['dimension_trends_basis']['passion_reduction'] {
  return {
    input_count: nonEmpty,
    empty_count: 0,
    baseline_non_empty: Math.floor(nonEmpty / 2),
    current_non_empty: Math.ceil(nonEmpty / 2),
    floor: EVIDENCE_FLOOR,
  }
}

/** A complete, TYPED delta block — a shape change breaks this fixture (the
 *  point: the composer's inputs are pinned to the real contract). */
function delta(overrides: Partial<TrajectoryDeltaBlock> = {}): TrajectoryDeltaBlock {
  const trend = { level: 'developing' as const, trend: 'stable' as const, indicators: [] }
  return {
    schema: 'agent-trajectory-delta-v1',
    vocabulary_note: 'fixture',
    identity: {
      window_scope: 'presenting_credential',
      canonical_identity: 'owner_agent_pair',
      agent_declared: true,
      rotation_note: null,
    },
    regime: {
      segment_used: 'post-s11b-recomposition',
      rows_in_window: 6,
      rows_in_segment: 6,
      rows_excluded_earlier_eras: 0,
      rows_excluded_boundary_band: 0,
      boundaries: SETTLED_REGIME_BOUNDARIES,
      note: 'fixture',
    },
    provenance: { n_supplied: 0, n_server: 6, n_unknown: 0, note: 'fixture' },
    computed_over: { baseline_rows: 3, current_rows: 3 },
    dimension_trends: {
      passion_reduction: trend,
      judgement_quality: trend,
      disposition_stability: trend,
      oikeiosis_extension: trend,
    },
    dimension_trends_basis: {
      passion_reduction: basis(),
      judgement_quality: basis(),
      disposition_stability: basis(),
      oikeiosis_extension: basis(),
    },
    passions_persisted_in_window: [],
    passions_persisted_basis: basis(),
    sub_species_frequency_deltas: {},
    sub_species_frequency_basis: basis(),
    kathekon_quality_trend: 'stable',
    kathekon_quality_basis: basis(),
    first_circle_obligation_trend: 'stable',
    first_circle_obligation_basis: { ...basis(), semantics: 'fixture' },
    domain_engagement_deltas: {},
    domain_engagement_basis: basis(),
    bounds: { mention_conversion: 'fixture' },
    ...overrides,
  }
}

const NO_LOOPS = {
  verdict: 'closed' as const,
  redirections: 0,
  closed: 0,
  open: 0,
  indeterminate: 0,
}

function domainFold(level: string): LoopFoldBlock['character']['domains'][string] {
  return {
    level: level as never,
    resolution: 'combined',
    conflict: false,
    open_loop: false,
    terminals: 1,
    basis: 'fixture',
  }
}

/** A complete, TYPED loop-fold block. */
function fold(overrides: {
  domains?: Record<string, ReturnType<typeof domainFold> | 'insufficient_extraction'>
  open?: number
}): LoopFoldBlock {
  return {
    schema: 'agent-loop-fold-v2',
    vocabulary_note: 'fixture',
    identity: PAIR_IDENTITY,
    identity_context: 'fixture',
    chain_scope: 'fixture',
    envelope: {
      scope: 'signed_ci4_loops_only',
      n_elements: 3,
      n_verified: 3,
      n_unverified_excluded: 0,
      n_verifier_unavailable: 0,
      n_malformed_excluded: 0,
      n_truncated_uninspected: 0,
      n_duplicate_excluded: 0,
      note: 'fixture',
    },
    ordering: { occurred_at_basis: 'submission_order', note: 'fixture' },
    regime: {
      write_era: 'post-s11b-recomposition',
      boundaries: SETTLED_REGIME_BOUNDARIES,
      attribution: 'fixture',
    },
    replay_bound: 'fixture',
    character: {
      loops: { ...NO_LOOPS, open: overrides.open ?? 0, redirections: overrides.open ?? 0 },
      domains: overrides.domains ?? {},
      domains_basis: {},
      n_dikaiosyne_level_excluded: 0,
      note: 'fixture',
    },
    self_regarding: { loops: NO_LOOPS, note: 'fixture' },
    instrument_calibration: { loops: NO_LOOPS, note: 'fixture' },
    n_no_domain: 0,
    measure_note: 'fixture',
    bounds: NARROWED_ARM_BOUNDS,
  }
}

/** The B2 archetype: an other-party circle carrying a violated obligation. */
const VIOLATED_OTHER = assessment({
  domains: ['dikaiosyne'],
  circles: [{ circle: 'local_community', status: 'violated' }],
})

/** The B1 archetype: kathekon-engaged via Arm 3 (proximity ≤ habitual) with NO
 *  justice surface, so B2 cannot pre-empt it. */
const ENGAGED_NO_JUSTICE = assessment({ proximity: 'habitual', domains: ['phronesis'] })

/** The MEASURED FALSE-POSITIVE hold class: a redirection whose verdict engaged
 *  no kathekon factor ("contrary; no kathekon factors detected"). */
const NOT_ENGAGED = assessment({ proximity: 'deliberate', domains: ['phronesis'] })

const ALL_CODES: PracticeSuggestionBasisCode[] = [
  'obligation_violated',
  'obligation_indeterminate',
  'first_circle_obligation_declining',
  'dikaiosyne_weakest_domain',
  'dikaiosyne_weakest_domain_chain',
  'examination_open_kathekon_engaged',
  'phobos_recurring',
  'phobos_new',
  'phobos_persisting',
  'epithumia_persisting',
  'self_only_circles',
]

/** BD-6 — the record's differentiated phobos mapping. Only these two are
 *  licensed to reach premeditatio; the other four are SILENT in v1. */
const PREMEDITATIO_PHOBOS = ['agonia', 'oknos']
const DECLINED_PHOBOS = ['deima', 'thorybos', 'thambos', 'aischyne']

const MODULE_SRC = readFileSync(join(__dirname, '../practice-suggestion.ts'), 'utf8')

// ============================================================================
// §1 — Flag discipline
// ============================================================================
{
  const firing: PracticeSuggestionSnapshot = { assessment: VIOLATED_OTHER }
  const prior = process.env[PRACTICE_SUGGESTION_ENV_VAR]

  delete process.env[PRACTICE_SUGGESTION_ENV_VAR]
  eq(isPracticeSuggestionEnabled(), false, '§1 unset ⇒ disabled')
  eq(practiceSuggestionFor(firing), undefined, '§1 unset ⇒ seam returns undefined on a FIRING snapshot')
  assert(
    composePracticeSuggestion(firing) !== undefined,
    '§1 the same snapshot DOES fire in the pure composer (the flag pin is non-vacuous)',
  )

  for (const bad of ['TRUE', 'True', '1', 'yes', '']) {
    process.env[PRACTICE_SUGGESTION_ENV_VAR] = bad
    eq(isPracticeSuggestionEnabled(), false, `§1 '${bad}' ⇒ disabled (exact-string 'true' only)`)
    eq(practiceSuggestionFor(firing), undefined, `§1 '${bad}' ⇒ seam returns undefined`)
  }

  process.env[PRACTICE_SUGGESTION_ENV_VAR] = 'true'
  eq(isPracticeSuggestionEnabled(), true, "§1 'true' ⇒ enabled")
  eq(
    practiceSuggestionFor(firing)?.basis.code,
    'obligation_violated',
    '§1 flag-on ⇒ the seam returns the composed suggestion',
  )
  // Flag-on but NO basis ⇒ still undefined (the silence survives the flag).
  eq(practiceSuggestionFor({}), undefined, '§1 flag-on + no basis ⇒ still undefined')

  eq(
    PRACTICE_SUGGESTION_ENV_VAR,
    'SUBSTRATE_PRACTICE_SUGGESTION_ENABLED',
    '§1 the flag name is the one the plan + activation walk name',
  )

  // THE NEVER-THROWS BOUNDARY (defense-in-depth, mirroring
  // computeLoopFoldAnnotation). Both seams call the helper on a SUCCESS path —
  // at the accreditation write, AFTER the row is committed and inside the try
  // whose catch returns 503. A behavioural pin, not a source-grep: this input
  // makes the PURE composer genuinely throw (asserted below, so the pin cannot
  // go vacuous if the composer is later hardened), and the helper must swallow
  // it and return undefined.
  //
  // Reachability is honestly bounded: the PR19 review established that
  // applyMechanisms builds these collections locally and calls .some/.filter on
  // them itself, so this shape cannot arrive from the live producer. The
  // boundary guards the asymmetry, not a live case.
  const THROWING: PracticeSuggestionSnapshot = {
    assessment: { katorthoma_proximity: 'deliberate', oikeiosis: { relevant_circles: 'not-an-array' } },
    examinationOpen: true,
  }
  let composerThrew = false
  try {
    composePracticeSuggestion(THROWING)
  } catch {
    composerThrew = true
  }
  assert(composerThrew, '§1 the throwing fixture genuinely throws in the pure composer (pin is non-vacuous)')
  process.env[PRACTICE_SUGGESTION_ENV_VAR] = 'true'
  let helperThrew = false
  let helperResult: unknown = 'unset'
  try {
    helperResult = practiceSuggestionFor(THROWING)
  } catch {
    helperThrew = true
  }
  assert(!helperThrew, '§1 the seam helper NEVER throws — a committed write can never be failed by this feature')
  eq(helperResult, undefined, '§1 …and it fails soft to undefined (no suggestion), not to a partial block')

  if (prior === undefined) delete process.env[PRACTICE_SUGGESTION_ENV_VAR]
  else process.env[PRACTICE_SUGGESTION_ENV_VAR] = prior
}

// ============================================================================
// §2 — The locked strings (asserted on EXPORTED VALUES)
// ============================================================================
{
  eq(
    SUGGESTION_QUESTION,
    'Before proceeding: is this the reasoning this action warrants?',
    '§2 the question clause is the Step M verdict’s proposed shape, verbatim',
  )
  for (const code of ALL_CODES) {
    const line = SUGGESTION_LINES[code]
    assert(typeof line === 'string' && line.length > 0, `§2 ${code} has a line`)
    assert(line.endsWith(SUGGESTION_QUESTION), `§2 ${code} ends with the question clause verbatim`)
    assert(line.startsWith('This record shows '), `§2 ${code} opens with the record clause`)
    // THE QUESTION-FORM VERDICT, mechanically: the line never names a practice
    // as a destination. The machine-readable `practice` field carries it.
    for (const token of [
      'examine_obligations',
      'reexamine_same_depth',
      'premeditatio',
      'reserve clause',
      'reserve_clause',
      'deepen',
      'calling',
      '/api/',
    ]) {
      assert(
        !line.toLowerCase().includes(token.toLowerCase()),
        `§2 ${code} does not name a practice/endpoint as a destination ('${token}')`,
      )
    }
    // No imperative hand-off — the agent is asked, never directed.
    for (const imperative of ['you should', 'run ', 'call ', 'perform ', 'go do']) {
      assert(
        !line.toLowerCase().includes(imperative),
        `§2 ${code} carries no imperative ('${imperative.trim()}')`,
      )
    }
  }
  eq(Object.keys(SUGGESTION_LINES).length, ALL_CODES.length, '§2 every locked code has exactly one line, no orphans')

  // PR19 fold: the token blacklist above is bypassable in plain English, so the
  // question form is ALSO enforced STRUCTURALLY — exactly two sentences, the
  // first describing the record, the second being the question verbatim. A line
  // that adds a third (instructional) sentence, or that replaces the record
  // clause with a directive, now fails regardless of vocabulary.
  for (const code of ALL_CODES) {
    const line = SUGGESTION_LINES[code]
    const head = line.slice(0, line.length - SUGGESTION_QUESTION.length).trim()
    assert(head.endsWith('.'), `§2 ${code}: the record clause is a complete sentence`)
    eq(
      (head.match(/\./g) ?? []).length,
      1,
      `§2 ${code}: exactly ONE record sentence before the question (no smuggled third clause)`,
    )
    assert(!/[?!]/.test(head), `§2 ${code}: the record clause asks nothing and exclaims nothing`)
    // The question is the ONLY question in the line.
    eq((line.match(/\?/g) ?? []).length, 1, `§2 ${code}: exactly one question mark, at the end`)
  }
}

// ============================================================================
// §3 — One suggestion max + the precedence order (B2 → B1 → B3 → B4 → B6)
// ============================================================================
{
  // Every rung armed at once: B2 (violated other-party circle) + B1 (open,
  // engaged) + B3 (phobos recurring) + B4 (epithumia persisting) + B6 is
  // pre-empted by the other-party circle anyway.
  const everything: PracticeSuggestionSnapshot = {
    assessment: signed(VIOLATED_OTHER),
    examinationOpen: true,
    delta: delta({
      sub_species_frequency_deltas: { 'phobos/agonia': 'recurring' },
      passions_persisted_in_window: [
        { root_passion: 'epithumia', sub_species: 'orge', occurrence_count: 4, occurrence_rate: 0.4 },
      ],
      first_circle_obligation_trend: 'declining',
    }),
  }
  const all = composePracticeSuggestion(everything)
  assert(all !== undefined, '§3 the fully-armed snapshot fires')
  eq(all?.basis.code, 'obligation_violated', '§3 B2 outranks everything (the Step M precedence reversal)')
  // ONE suggestion max — the block is a single object, not a list.
  assert(!Array.isArray(all), '§3 the suggestion is one object, never a menu')

  // B2 outranks B1 specifically — the reversal, isolated.
  eq(
    codeOf({ assessment: VIOLATED_OTHER, examinationOpen: true }),
    'obligation_violated',
    '§3 B2 outranks B1 (dikaiosyne is not subordinate to procedural completeness)',
  )
  // …and B1 DOES fire on its own, so the pin above is non-vacuous.
  eq(
    codeOf({ assessment: ENGAGED_NO_JUSTICE, examinationOpen: true }),
    'examination_open_kathekon_engaged',
    '§3 B1 fires alone (the B2-outranks pin is non-vacuous)',
  )

  // B1 outranks B3.
  eq(
    codeOf({
      assessment: ENGAGED_NO_JUSTICE,
      examinationOpen: true,
      delta: delta({ sub_species_frequency_deltas: { 'phobos/agonia': 'recurring' } }),
    }),
    'examination_open_kathekon_engaged',
    '§3 B1 outranks B3',
  )
  // B3 outranks B4.
  eq(
    codeOf({
      delta: delta({
        sub_species_frequency_deltas: { 'phobos/agonia': 'recurring' },
        passions_persisted_in_window: [
          { root_passion: 'epithumia', sub_species: 'orge', occurrence_count: 4, occurrence_rate: 0.4 },
        ],
      }),
    }),
    'phobos_recurring',
    '§3 B3 outranks B4',
  )
  // B4 outranks B6.
  eq(
    codeOf({
      assessment: assessment({ circles: [{ circle: 'self_preservation' }] }),
      delta: delta({
        passions_persisted_in_window: [
          { root_passion: 'epithumia', sub_species: 'orge', occurrence_count: 4, occurrence_rate: 0.4 },
        ],
      }),
    }),
    'epithumia_persisting',
    '§3 B4 outranks B6',
  )
  // …and B6 fires alone.
  eq(
    codeOf({ assessment: assessment({ circles: [{ circle: 'self_preservation' }] }) }),
    'self_only_circles',
    '§3 B6 fires alone (the B4-outranks pin is non-vacuous)',
  )
  // PR19 fold: B6 was never exercised with a MIXED circle set, so `every` could
  // become `some` and the rendered line ("no circle of concern beyond
  // self-preservation") would be FALSE of the record.
  eq(
    codeOf({
      assessment: assessment({
        circles: [{ circle: 'self_preservation' }, { circle: 'household' }],
      }),
    }),
    null,
    '§3 B6 does NOT fire on a MIXED circle set (every, not some — the line must stay true)',
  )
  eq(
    codeOf({
      assessment: assessment({
        circles: [{ circle: 'self_preservation' }, { circle: null }],
      }),
    }),
    null,
    '§3 B6 does NOT fire when a circle identity is unknown (strict)',
  )
  eq(
    codeOf({
      assessment: assessment({
        circles: [{ circle: 'self_preservation' }, { circle: 'self_preservation' }],
      }),
    }),
    'self_only_circles',
    '§3 B6 fires on MULTIPLE self circles (the mixed-set pin is non-vacuous)',
  )

  // PR19 fold: precedence was pinned for only ONE of B2's four legs, so B1 could
  // be hoisted above the weak-domain legs undetected — inverting the Step M
  // reversal on its commonest real input. Each B2 leg is now pinned against B1
  // INDIVIDUALLY, and each is shown to fire alone (non-vacuity).
  const B2_LEGS: [string, PracticeSuggestionSnapshot, PracticeSuggestionBasisCode][] = [
    ['violated circle', { assessment: VIOLATED_OTHER }, 'obligation_violated'],
    [
      'indeterminate circle',
      {
        assessment: assessment({
          domains: ['dikaiosyne'],
          circles: [{ circle: 'household', status: 'indeterminate' }],
        }),
      },
      'obligation_indeterminate',
    ],
    [
      'obligation trend',
      { delta: delta({ first_circle_obligation_trend: 'declining' }) },
      'first_circle_obligation_declining',
    ],
    [
      'weak domain (current)',
      {
        assessment: assessment({
          floors: { base: 'principled', dikaiosyne: 'habitual', aggregate: 'habitual' },
        }),
      },
      'dikaiosyne_weakest_domain',
    ],
    [
      'weak domain (chain)',
      {
        loopFold: fold({
          domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('principled') },
        }),
      },
      'dikaiosyne_weakest_domain_chain',
    ],
  ]
  for (const [label, snap, code] of B2_LEGS) {
    eq(codeOf(snap), code, `§3 B2 leg fires alone: ${label}`)
    // …and still wins when B1 is simultaneously armed.
    eq(
      codeOf({ ...snap, assessment: snap.assessment ?? ENGAGED_NO_JUSTICE, examinationOpen: true }),
      code,
      `§3 B2 leg OUTRANKS B1: ${label}`,
    )
  }
}

// ============================================================================
// §4 — B2, every leg
// ============================================================================
{
  eq(codeOf({ assessment: VIOLATED_OTHER }), 'obligation_violated', '§4 violated on a beyond-self circle')
  eq(
    codeOf({
      assessment: assessment({
        domains: ['dikaiosyne'],
        circles: [{ circle: 'cosmopolis', status: 'indeterminate' }],
      }),
    }),
    'obligation_indeterminate',
    '§4 indeterminate on a beyond-self circle',
  )
  // Violated outranks indeterminate within B2.
  eq(
    codeOf({
      assessment: assessment({
        domains: ['dikaiosyne'],
        circles: [
          { circle: 'household', status: 'indeterminate' },
          { circle: 'local_community', status: 'violated' },
        ],
      }),
    }),
    'obligation_violated',
    '§4 violated outranks indeterminate (the stronger adverse evidence first)',
  )
  // A met obligation is not adverse evidence.
  eq(
    codeOf({
      assessment: assessment({ domains: ['dikaiosyne'], circles: [{ circle: 'household', status: 'met' }] }),
    }),
    null,
    '§4 a met obligation is no basis',
  )

  // BD-4 — THE SELF CIRCLE ALONE IS NOT AN OBLIGATION TO ANOTHER PARTY.
  // (The 2026-07-19 ruling: dikaiosyne is other-directed.) The rendered line
  // would otherwise be literally false of the record. It falls THROUGH B2 to
  // B6, whose line ("no circle of concern beyond self-preservation") is exactly
  // true of this record — the fall-through is the correct routing, and every
  // rendered line stays true.
  const selfViolated = codeOf({
    assessment: assessment({
      domains: ['dikaiosyne'],
      circles: [{ circle: 'self_preservation', status: 'violated' }],
    }),
  })
  assert(
    selfViolated !== 'obligation_violated' && selfViolated !== 'obligation_indeterminate',
    '§4 BD-4: violated on the SELF circle alone is NOT a B2 obligation basis',
  )
  eq(selfViolated, 'self_only_circles', '§4 BD-4: it falls through to B6, whose line is true of the record')
  // …but it still reaches B1 when a loop is open (Arm 2 engages it) — the
  // correct routing for a self-regarding gap, and proof BD-4 suppresses the
  // suggestion rather than the signal.
  eq(
    codeOf({
      assessment: assessment({
        domains: ['dikaiosyne'],
        circles: [{ circle: 'self_preservation', status: 'violated' }],
      }),
      examinationOpen: true,
    }),
    'examination_open_kathekon_engaged',
    '§4 BD-4: the self-circle violation still routes to B1 (signal kept, line kept true)',
  )
  // A name-less circle never satisfies "another party" either (strict).
  eq(
    codeOf({
      assessment: assessment({ domains: ['dikaiosyne'], circles: [{ circle: null, status: 'violated' }] }),
    }),
    null,
    '§4 BD-4: an unknown-identity circle is not an identified other party',
  )

  // Leg 3 — the window trend.
  eq(
    codeOf({ delta: delta({ first_circle_obligation_trend: 'declining' }) }),
    'first_circle_obligation_declining',
    '§4 first_circle_obligation_trend declining',
  )
  for (const t of ['stable', 'improving', 'insufficient_extraction'] as const) {
    eq(
      codeOf({ delta: delta({ first_circle_obligation_trend: t }) }),
      null,
      `§4 first_circle_obligation_trend '${t}' is no basis`,
    )
  }

  // Leg 4a — dikaiosyne floored THIS examination to the weakest engaged domain.
  eq(
    codeOf({
      assessment: assessment({
        floors: { base: 'principled', dikaiosyne: 'habitual', aggregate: 'habitual' },
      }),
    }),
    'dikaiosyne_weakest_domain',
    '§4 dikaiosyne floored the aggregate below base and is jointly weakest',
  )
  // Not weakest: another domain floored lower, so the aggregate is below it.
  eq(
    codeOf({
      assessment: assessment({
        floors: {
          base: 'principled',
          dikaiosyne: 'deliberate',
          andreia: 'reflexive',
          aggregate: 'reflexive',
        },
      }),
    }),
    null,
    '§4 dikaiosyne is not the weakest when another domain floored lower',
  )
  // Nothing floored: aggregate === base.
  eq(
    codeOf({
      assessment: assessment({
        floors: { base: 'deliberate', dikaiosyne: 'deliberate', aggregate: 'deliberate' },
      }),
    }),
    null,
    '§4 no floor applied ⇒ no weak-domain basis',
  )
  // Not engaged at all.
  eq(
    codeOf({
      assessment: assessment({
        floors: { base: 'principled', dikaiosyne: null, andreia: 'habitual', aggregate: 'habitual' },
      }),
    }),
    null,
    '§4 dikaiosyne not engaged ⇒ no weak-domain basis',
  )
  // BD-5 — weakest must be actually WEAK: principled is above the ceiling.
  eq(
    codeOf({
      assessment: assessment({
        floors: { base: 'sage_like', dikaiosyne: 'principled', aggregate: 'principled' },
      }),
    }),
    null,
    '§4 BD-5: a principled dikaiosyne reading is not "weak" — silence',
  )

  // Leg 4b — the fold's per-domain levels.
  eq(
    codeOf({
      loopFold: fold({
        domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('principled') },
      }),
    }),
    'dikaiosyne_weakest_domain_chain',
    '§4 dikaiosyne strictly weakest across the submitted chain',
  )
  eq(
    codeOf({ loopFold: fold({ domains: { dikaiosyne: domainFold('habitual') } }) }),
    null,
    '§4 a dikaiosyne-only chain has no "weakest" — silence (strictness requires ≥2 evidenced domains)',
  )
  eq(
    codeOf({
      loopFold: fold({
        domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('habitual') },
      }),
    }),
    null,
    '§4 a tie is not strictly weakest — silence',
  )
  eq(
    codeOf({
      loopFold: fold({
        domains: { dikaiosyne: domainFold('principled'), phronesis: domainFold('sage_like') },
      }),
    }),
    null,
    '§4 BD-5 on the chain leg: principled is above the ceiling — silence',
  )
  eq(
    codeOf({
      loopFold: fold({
        domains: { dikaiosyne: 'insufficient_extraction', phronesis: domainFold('principled') },
      }),
    }),
    null,
    '§4 a floored dikaiosyne domain is skipped, never read as a level',
  )
  // A floored SIBLING is skipped in the comparison, not treated as weaker.
  // PR19 fold, then MUTATION-CORRECTED: the reviewer was right that this pin was
  // vacuous, and my first repair was ALSO vacuous — a floored entry is the STRING
  // 'insufficient_extraction', so reading its `.level` yields undefined and it can
  // never LOOK weaker. The skip guard's real outcome-bearing effect is on the
  // `others` COUNT (the ≥2-evidenced-domains requirement), which is what the pin
  // below actually tests. This first assertion is kept as a plain
  // positive-behaviour case, not as a guard-removal detector.
  eq(
    codeOf({
      loopFold: fold({
        domains: {
          dikaiosyne: domainFold('habitual'),
          phronesis: domainFold('principled'),
          sophrosyne: 'insufficient_extraction',
        },
      }),
    }),
    'dikaiosyne_weakest_domain_chain',
    '§4 a floored sibling domain is skipped in the comparison',
  )
  // THE OUTCOME-BEARING HALF: a floored sibling must not count toward the
  // ≥2-evidenced-domains requirement. dikaiosyne + ONLY floored siblings is a
  // one-evidenced-domain chain, where "weakest" is vacuous — it must be silent.
  // (Mutation-verified: counting floored siblings toward `others` makes this fire.)
  eq(
    codeOf({
      loopFold: fold({
        domains: {
          dikaiosyne: domainFold('habitual'),
          phronesis: 'insufficient_extraction',
          sophrosyne: 'insufficient_extraction',
        },
      }),
    }),
    null,
    '§4 floored siblings do NOT count toward the ≥2-evidenced-domains requirement',
  )
  // BD-5 BOUNDARY, FIRING DIRECTION: exactly AT the ceiling must still fire, so
  // `<=` cannot silently become `<`.
  eq(
    codeOf({
      assessment: assessment({
        floors: { base: 'principled', dikaiosyne: 'deliberate', aggregate: 'deliberate' },
      }),
    }),
    'dikaiosyne_weakest_domain',
    '§4 BD-5 boundary: dikaiosyne exactly AT the deliberate ceiling still fires',
  )
  eq(
    codeOf({
      loopFold: fold({
        domains: { dikaiosyne: domainFold('deliberate'), phronesis: domainFold('principled') },
      }),
    }),
    'dikaiosyne_weakest_domain_chain',
    '§4 BD-5 boundary (chain): exactly AT the ceiling still fires',
  )
}

// ============================================================================
// §5 — B1: BD-1b (kathekon gate) + BD-1a (fold-open silence)
// ============================================================================
{
  eq(
    codeOf({ assessment: ENGAGED_NO_JUSTICE, examinationOpen: true }),
    'examination_open_kathekon_engaged',
    '§5 a kathekon-engaged open examination fires',
  )
  // BD-1b — THE MEASURED FALSE-POSITIVE HOLD CLASS IS SILENT. The frozen
  // 130-record buffer classified 129/130 of these false_positive; the loop-fold
  // routes exactly this class to instrument_calibration, "never character data".
  eq(
    codeOf({ assessment: NOT_ENGAGED, examinationOpen: true }),
    null,
    '§5 BD-1b: an open loop whose verdict engaged NO kathekon factor is SILENT',
  )
  // Engagement without an open loop is not B1 either.
  eq(codeOf({ assessment: ENGAGED_NO_JUSTICE }), null, '§5 engaged but no open examination ⇒ no B1')
  eq(
    codeOf({ assessment: ENGAGED_NO_JUSTICE, examinationOpen: false }),
    null,
    '§5 examination_open false ⇒ no B1',
  )
  // Each of the remaining engagement arms reaches B1.
  eq(
    codeOf({ assessment: assessment({ proximity: 'reflexive' }), examinationOpen: true }),
    'examination_open_kathekon_engaged',
    '§5 Arm 3 (proximity ≤ habitual) reaches B1',
  )
  eq(
    codeOf({
      assessment: assessment({ proximity: 'deliberate', passions: ['agonia'] }),
      examinationOpen: true,
    }),
    'examination_open_kathekon_engaged',
    '§5 Arm 4 (sub-species passion) reaches B1',
  )

  // BD-1a — THE FOLD'S OPEN LOOPS ARE SILENT: the submitted-chain scope cannot
  // distinguish a genuinely dropped loop from one closed in an unsubmitted
  // consult, so no fold leg exists for B1.
  eq(
    codeOf({ loopFold: fold({ open: 3 }) }),
    null,
    '§5 BD-1a: loop_fold.character.loops.open > 0 alone is SILENT',
  )
  // Non-vacuity: the SAME fold with a weak-domain reading does fire, so the
  // silence above is B1's absence, not a dead fold path.
  eq(
    codeOf({
      loopFold: {
        ...fold({ open: 3 }),
        character: {
          ...fold({ open: 3 }).character,
          domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('principled') },
        },
      },
    }),
    'dikaiosyne_weakest_domain_chain',
    '§5 BD-1a pin is non-vacuous — the same fold fires on a different basis',
  )
}

// ============================================================================
// §6 — B3 / B4 families
// ============================================================================
{
  // The line must be TRUE of the record: 'new' is not 'recurring'.
  eq(
    codeOf({ delta: delta({ sub_species_frequency_deltas: { 'phobos/agonia': 'recurring' } }) }),
    'phobos_recurring',
    `§6 phobos 'recurring' fires the recurring basis`,
  )
  eq(
    codeOf({ delta: delta({ sub_species_frequency_deltas: { 'phobos/agonia': 'new' } }) }),
    'phobos_new',
    `§6 phobos 'new' fires the DISTINCT new basis (the line must not say "recurring")`,
  )
  assert(
    !SUGGESTION_LINES.phobos_new.includes('recurring'),
    '§6 the new-basis line does not claim recurrence',
  )
  for (const v of ['fading', 'stable'] as const) {
    eq(
      codeOf({ delta: delta({ sub_species_frequency_deltas: { 'phobos/agonia': v } }) }),
      null,
      `§6 phobos '${v}' is no basis`,
    )
  }

  // BD-6 — THE DIFFERENTIATED PHOBOS MAPPING. The binding record: "do not
  // generalise to the whole phobos family… agonia and oknos are the intended
  // targets and the generalisation to all phobos is an overreach."
  for (const sub of PREMEDITATIO_PHOBOS) {
    assert(
      codeOf({ delta: delta({ sub_species_frequency_deltas: { [`phobos/${sub}`]: 'recurring' } }) }) !== null,
      `§6 BD-6: '${sub}' IS a licensed premeditatio target (frequency leg)`,
    )
    assert(
      codeOf({
        delta: delta({
          passions_persisted_in_window: [
            { root_passion: 'phobos', sub_species: sub, occurrence_count: 5, occurrence_rate: 0.5 },
          ],
        }),
      }) !== null,
      `§6 BD-6: '${sub}' IS a licensed premeditatio target (persisting leg)`,
    )
  }
  for (const sub of DECLINED_PHOBOS) {
    eq(
      codeOf({ delta: delta({ sub_species_frequency_deltas: { [`phobos/${sub}`]: 'recurring' } }) }),
      null,
      `§6 BD-6: '${sub}' is SILENT — premeditatio is not its practice (frequency leg)`,
    )
    eq(
      codeOf({
        delta: delta({
          passions_persisted_in_window: [
            { root_passion: 'phobos', sub_species: sub, occurrence_count: 5, occurrence_rate: 0.5 },
          ],
        }),
      }),
      null,
      `§6 BD-6: '${sub}' is SILENT (persisting leg)`,
    )
  }
  // The narrowing must NOT leak into B4 through the shared helper: the record
  // confirms the WHOLE epithumia family.
  for (const sub of ['orge', 'philodoxia', 'eros', 'pothos']) {
    eq(
      codeOf({
        delta: delta({
          passions_persisted_in_window: [
            { root_passion: 'epithumia', sub_species: sub, occurrence_count: 5, occurrence_rate: 0.5 },
          ],
        }),
      }),
      'epithumia_persisting',
      `§6 BD-6 does not leak into B4: epithumia '${sub}' still fires`,
    )
  }
  // Other families never fire B3 off the frequency deltas.
  for (const root of ['lupe', 'epithumia', 'hedone']) {
    eq(
      codeOf({ delta: delta({ sub_species_frequency_deltas: { [`${root}/x`]: 'recurring' } }) }),
      null,
      `§6 '${root}' recurring does not fire B3 (family read off the key prefix)`,
    )
  }
  // A prefix that merely STARTS WITH the family name is not the family.
  eq(
    codeOf({ delta: delta({ sub_species_frequency_deltas: { 'phobos_x/agonia': 'recurring' } }) }),
    null,
    '§6 the family match is the exact key prefix, not startsWith',
  )
  eq(
    codeOf({ delta: delta({ sub_species_frequency_deltas: 'insufficient_extraction' }) }),
    null,
    '§6 a floored frequency record is skipped',
  )

  // Persisting passions.
  eq(
    codeOf({
      delta: delta({
        passions_persisted_in_window: [
          { root_passion: 'phobos', sub_species: 'agonia', occurrence_count: 5, occurrence_rate: 0.5 },
        ],
      }),
    }),
    'phobos_persisting',
    '§6 a persisting phobos fires B3',
  )
  eq(
    codeOf({
      delta: delta({
        passions_persisted_in_window: [
          { root_passion: 'epithumia', sub_species: 'orge', occurrence_count: 5, occurrence_rate: 0.5 },
        ],
      }),
    }),
    'epithumia_persisting',
    '§6 a persisting epithumia fires B4',
  )
  for (const root of ['lupe', 'hedone'] as const) {
    eq(
      codeOf({
        delta: delta({
          passions_persisted_in_window: [
            { root_passion: root, sub_species: 'x', occurrence_count: 5, occurrence_rate: 0.5 },
          ],
        }),
      }),
      null,
      `§6 a persisting '${root}' fires neither B3 nor B4 (not in the vetted table)`,
    )
  }
  eq(
    codeOf({ delta: delta({ passions_persisted_in_window: 'insufficient_extraction' }) }),
    null,
    '§6 a floored persisted record is skipped',
  )
  // The vetted B4 row is PERSISTING only — a recurring epithumia frequency
  // delta is deliberately not extended into B4.
  eq(
    codeOf({ delta: delta({ sub_species_frequency_deltas: { 'epithumia/orge': 'recurring' } }) }),
    null,
    '§6 B4 reads persistence only (the vetted row), not the frequency delta',
  )
}

// ============================================================================
// §7 — B5 is SILENT in v1 (BD-2)
// ============================================================================
{
  const declining = { level: 'developing' as const, trend: 'declining' as const, indicators: [] }
  eq(
    codeOf({
      delta: delta({
        dimension_trends: {
          passion_reduction: declining,
          judgement_quality: declining,
          disposition_stability: declining,
          oikeiosis_extension: declining,
        },
      }),
    }),
    null,
    '§7 BD-2: every dimension declining produces NO suggestion (the served label is a row-half comparison, not a multi-session pattern)',
  )
  // The vocabulary keeps the deferred row visible, but NO path emits it.
  const emitted = new Set<string>()
  const snapshots: PracticeSuggestionSnapshot[] = [
    { assessment: VIOLATED_OTHER },
    { assessment: assessment({ domains: ['dikaiosyne'], circles: [{ circle: 'household', status: 'indeterminate' }] }) },
    { delta: delta({ first_circle_obligation_trend: 'declining' }) },
    { assessment: assessment({ floors: { base: 'principled', dikaiosyne: 'habitual', aggregate: 'habitual' } }) },
    { loopFold: fold({ domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('principled') } }) },
    { assessment: ENGAGED_NO_JUSTICE, examinationOpen: true },
    { delta: delta({ sub_species_frequency_deltas: { 'phobos/agonia': 'recurring' } }) },
    { delta: delta({ sub_species_frequency_deltas: { 'phobos/oknos': 'new' } }) },
    { delta: delta({ passions_persisted_in_window: [{ root_passion: 'phobos', sub_species: 'agonia', occurrence_count: 5, occurrence_rate: 0.5 }] }) },
    { delta: delta({ passions_persisted_in_window: [{ root_passion: 'epithumia', sub_species: 'orge', occurrence_count: 5, occurrence_rate: 0.5 }] }) },
    { assessment: assessment({ circles: [{ circle: 'self_preservation' }] }) },
  ]
  for (const s of snapshots) {
    const out = composePracticeSuggestion(s)
    assert(out !== undefined, '§7 the reachability sweep exercises a firing snapshot')
    if (out !== undefined) emitted.add(out.practice)
  }
  assert(
    !emitted.has('deepen_examination'),
    '§7 BD-2: no path emits deepen_examination (the B5 row is deferred, not live)',
  )
  eq(emitted.size, 5, '§7 the sweep reaches five of the six locked practices (B5 deferred)')
  // Every locked basis code is reachable — no dead branch.
  const reached = new Set(snapshots.map((s) => codeOf(s)))
  for (const code of ALL_CODES) {
    assert(reached.has(code), `§7 basis '${code}' is reachable (no dead branch)`)
  }
}

// ============================================================================
// §8 — B7's protected silence + floors
// ============================================================================
{
  eq(composePracticeSuggestion({}), undefined, '§8 an empty snapshot yields no suggestion')
  eq(
    composePracticeSuggestion({ assessment: assessment(), delta: delta(), loopFold: fold({}) }),
    undefined,
    '§8 a clean record on all three inputs yields no suggestion (never filler)',
  )
  eq(
    composePracticeSuggestion({ assessment: signed(assessment()), delta: delta() }),
    undefined,
    '§8 a clean SIGNED assessment yields no suggestion',
  )
  // Absent, never present-and-null: undefined omits the key when spread.
  const body = { status: 'ok', ...(composePracticeSuggestion({}) !== undefined ? { suggestion: 1 } : {}) }
  assert(!('suggestion' in body), '§8 the field is ABSENT on silence, never present-and-null')
  // Unusable inputs are silent, never guessed.
  for (const junk of [undefined, null, 'nonsense', 42, {}, { assessment: {} }]) {
    eq(
      composePracticeSuggestion({ assessment: junk }),
      undefined,
      `§8 an unusable assessment (${JSON.stringify(junk)}) yields silence, never a guess`,
    )
  }
}

// ============================================================================
// §9 — Purity + MEASURE
// ============================================================================
{
  const out = composePracticeSuggestion({ assessment: VIOLATED_OTHER })
  const keys = new Set<string>()
  const walk = (v: unknown): void => {
    if (v === null || typeof v !== 'object') return
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      keys.add(k)
      walk(val)
    }
  }
  walk(out)
  for (const forbidden of ['recommendation', 'recommendedIntervention', 'action', 'verdict', 'score']) {
    assert(!keys.has(forbidden), `§9 no '${forbidden}' key anywhere in the block`)
  }
  assert(keys.has('framing_note'), '§9 the framing note rides on the block')
  eq(out?.schema, 'agent-practice-suggestion/v1', '§9 the block declares its schema')

  // PR19 fold: basis.signal and basis.observed are SERVED ON THE WIRE and had
  // ZERO assertions — the §2 question-form protections covered only `line`, so a
  // destination or a conclusion could be smuggled through the basis instead.
  const BASIS_SNAPSHOTS: [PracticeSuggestionBasisCode, PracticeSuggestionSnapshot][] = [
    ['obligation_violated', { assessment: VIOLATED_OTHER }],
    ['first_circle_obligation_declining', { delta: delta({ first_circle_obligation_trend: 'declining' }) }],
    [
      'dikaiosyne_weakest_domain',
      { assessment: assessment({ floors: { base: 'principled', dikaiosyne: 'habitual', aggregate: 'habitual' } }) },
    ],
    [
      'dikaiosyne_weakest_domain_chain',
      { loopFold: fold({ domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('principled') } }) },
    ],
    ['examination_open_kathekon_engaged', { assessment: ENGAGED_NO_JUSTICE, examinationOpen: true }],
    ['phobos_recurring', { delta: delta({ sub_species_frequency_deltas: { 'phobos/agonia': 'recurring' } }) }],
    ['phobos_new', { delta: delta({ sub_species_frequency_deltas: { 'phobos/oknos': 'new' } }) }],
    ['self_only_circles', { assessment: assessment({ circles: [{ circle: 'self_preservation' }] }) }],
  ]
  for (const [code, snap] of BASIS_SNAPSHOTS) {
    const b = composePracticeSuggestion(snap)?.basis
    assert(b !== undefined, `§9 basis present for ${code}`)
    if (b === undefined) continue
    eq(b.code, code, `§9 basis.code is the firing code (${code})`)
    assert(typeof b.signal === 'string' && b.signal.length > 0, `§9 ${code}: basis.signal names a field path`)
    assert(typeof b.observed === 'string', `§9 ${code}: basis.observed is a served value`)
    // The basis is DATA, not prose: it must not smuggle a destination or a
    // conclusion past the §2 line protections.
    for (const token of ['premeditatio', 'reserve clause', 'you should', 'recommend', 'must ']) {
      assert(
        !b.signal.toLowerCase().includes(token) && !b.observed.toLowerCase().includes(token),
        `§9 ${code}: basis carries no prose/destination ('${token}')`,
      )
    }
    assert(!b.observed.includes(' '), `§9 ${code}: basis.observed is a value, not a sentence`)
  }
  // 'new' must be reported honestly in observed, not relabelled.
  assert(
    composePracticeSuggestion({
      delta: delta({ sub_species_frequency_deltas: { 'phobos/oknos': 'new' } }),
    })?.basis.observed.endsWith('=new') === true,
    '§9 basis.observed reports the ACTUAL frequency value',
  )

  // The module never imports the intervention engine (mirrors the loop-fold's
  // own guard) nor emits trust events.
  assert(
    !MODULE_SRC.includes("from './trust-core/intervention-engine'") &&
      !MODULE_SRC.includes('intervention-engine'),
    '§9 the module never imports the intervention engine',
  )
  assert(!MODULE_SRC.includes('emitTrustEvents'), '§9 the module never emits trust events')
  assert(
    !MODULE_SRC.includes('supabase') && !MODULE_SRC.includes('getAdminClient'),
    '§9 the module holds no DB client (pure — no new reads)',
  )
  assert(
    !MODULE_SRC.includes('messages.create') && !MODULE_SRC.includes('anthropic'),
    '§9 the module makes no LLM call',
  )
  assert(
    MODULE_SRC.includes('kathekonSignalsFromAssessment') &&
      MODULE_SRC.includes('assessKathekonEngagement') &&
      MODULE_SRC.includes('SELF_PRESERVATION_CIRCLE'),
    '§9 the kathekon reading + circle vocabulary are the canonical shared ones (imported, not re-implemented)',
  )

  // The COMPOSER reads no env — only the seam helper does.
  // PR19 fold: the original slice covered ONLY the 18-line dispatcher, so a
  // detector function reading process.env was invisible to it. The slice is now
  // EVERYTHING ABOVE the seam helper — every detector, every reader, the
  // dispatcher — with the seam helper (the one legitimate env reader) excluded.
  const seamStart = MODULE_SRC.indexOf('export function practiceSuggestionFor')
  assert(seamStart > 0, '§9 the seam helper is locatable')
  const pureRegion = MODULE_SRC.slice(0, seamStart)
  const flagRegionEnd = MODULE_SRC.indexOf('// LOCKED VOCABULARY')
  assert(flagRegionEnd > 0, '§9 the flag region is locatable')
  // Everything after the flag declaration and before the seam helper is pure.
  const detectorsRegion = pureRegion.slice(flagRegionEnd)
  assert(
    !detectorsRegion.includes('process.env') &&
      !detectorsRegion.includes('isPracticeSuggestionEnabled('),
    '§9 NO detector or reader reads env (only the seam helper does)',
  )
  assert(
    !detectorsRegion.includes('Date.now') &&
      !detectorsRegion.includes('Math.random') &&
      !detectorsRegion.includes('new Date'),
    '§9 NO detector reads a clock or randomness',
  )
  // PR19 fold: the determinism pin below cannot detect a clock read (both calls
  // land in the same millisecond), so the clock is ALSO excluded module-wide by
  // source — the two together are what make determinism non-vacuous.
  assert(
    !MODULE_SRC.includes('Date.now') && !MODULE_SRC.includes('new Date'),
    '§9 the module reads no clock ANYWHERE (the determinism pin alone cannot see one)',
  )

  // Determinism: the same snapshot yields byte-identical JSON.
  const s: PracticeSuggestionSnapshot = { assessment: VIOLATED_OTHER, delta: delta() }
  eq(
    JSON.stringify(composePracticeSuggestion(s)),
    JSON.stringify(composePracticeSuggestion(s)),
    '§9 determinism — a fixed snapshot yields byte-identical output',
  )
  // The composer does not mutate its input. A FRESH snapshot: reusing `s` here
  // would compare post-call state to post-call state and pass vacuously
  // (mutation-proven — the pin survived a deliberate input-mutation mutant
  // until this was fixed).
  const untouched: PracticeSuggestionSnapshot = { assessment: VIOLATED_OTHER, delta: delta() }
  const before = JSON.stringify(untouched)
  composePracticeSuggestion(untouched)
  eq(JSON.stringify(untouched), before, '§9 the composer does not mutate the snapshot')
  eq(Object.keys(untouched).length, 2, '§9 the composer adds no key to the snapshot')

  // Endpoint hints only where the target is callable mid-task.
  eq(
    composePracticeSuggestion({ assessment: ENGAGED_NO_JUSTICE, examinationOpen: true })?.endpoint_hint,
    '/api/reason',
    '§9 B1 hints the CI-4 re-examination endpoint',
  )
  eq(
    composePracticeSuggestion({ assessment: assessment({ circles: [{ circle: 'self_preservation' }] }) })
      ?.endpoint_hint,
    '/api/calling',
    '§9 B6 hints the calling endpoint',
  )
  assert(
    !('endpoint_hint' in (composePracticeSuggestion({ assessment: VIOLATED_OTHER }) as object)),
    '§9 the mid-task examinations carry NO endpoint (no exit from the task)',
  )
}

// ============================================================================
// §10 — Route wiring INV pins (source-grep)
// ============================================================================
{
  const reasonSrc = readFileSync(join(__dirname, '../../../app/api/reason/route.ts'), 'utf8')
  assert(
    reasonSrc.includes('practiceSuggestionFor('),
    '§10 INV: /api/reason calls the flag-gated seam helper (never the pure composer directly)',
  )
  assert(
    !reasonSrc.includes('composePracticeSuggestion('),
    '§10 INV: /api/reason never bypasses the flag by calling the composer',
  )
  // BD-3: the attach is gated on an EMITTED practice block.
  assert(
    /output\.practice !== undefined[\s\S]{0,400}practiceSuggestionFor\(/.test(reasonSrc),
    '§10 INV: the suggestion rides only an emitted practice block (BD-3)',
  )
  // The shared frozen constant is SPREAD, never mutated.
  assert(
    reasonSrc.includes('{ ...PRACTICE_CYCLE_HINT, suggestion }'),
    '§10 INV: a NEW object is spread — the module-level PRACTICE_CYCLE_HINT is never mutated',
  )
  // The attach follows the trajectory overlay, so the delta is in hand.
  const trajIdx = reasonSrc.indexOf('meta.trajectory = trajectoryOverlay')
  const suggIdx = reasonSrc.indexOf('practiceSuggestionFor(')
  assert(trajIdx > 0 && suggIdx > trajIdx, '§10 INV: the suggestion attach follows the trajectory overlay')
  assert(
    /practiceSuggestionFor\(\{[\s\S]{0,400}delta: trajectoryOverlay\?\.delta/.test(reasonSrc),
    '§10 INV: the delta is taken from the overlay VARIABLE, not re-read from the output body',
  )

  // PR19 fold: the pins above are individually satisfiable while the seam is
  // mis-wired, and the reviewer showed the whole BODY could be deleted with the
  // battery green (the route is not importable in a unit test, so there is no
  // behavioural pin available). The seam is therefore LOCKED VERBATIM:
  // whitespace-normalised, it must equal exactly this. Any deletion, argument
  // swap, gating change, or mutation of the shared constant fails here.
  const EXPECTED_SEAM =
    `if (output.practice !== undefined) { ` +
    `const suggestion = practiceSuggestionFor({ ` +
    `assessment: output.assessment, ` +
    `examinationOpen: typeof output.examination_open === 'boolean' ? output.examination_open : undefined, ` +
    `delta: trajectoryOverlay?.delta, ` +
    `}) ` +
    `if (suggestion !== undefined) { ` +
    `output.practice = { ...PRACTICE_CYCLE_HINT, suggestion } ` +
    `} }`
  const norm = (s: string): string => s.replace(/\s+/g, ' ').trim()
  const seamStartIdx = reasonSrc.indexOf('if (output.practice !== undefined) {')
  assert(seamStartIdx > 0, '§10 INV: the seam block is present in the route')
  const seamEndMarker = reasonSrc.indexOf('return await respond({', seamStartIdx)
  assert(seamEndMarker > seamStartIdx, '§10 INV: the seam is followed by the response')
  const actualSeam = norm(reasonSrc.slice(seamStartIdx, seamEndMarker))
  eq(
    actualSeam,
    norm(EXPECTED_SEAM),
    '§10 INV: the /api/reason seam matches its locked form EXACTLY (deletion or mis-wiring fails here)',
  )

  const accredRouteSrc = readFileSync(
    join(__dirname, '../../../app/api/accreditation/[agent_id]/route.ts'),
    'utf8',
  )
  assert(
    accredRouteSrc.includes('practiceSuggestionFor({ loopFold: loopFoldAnnotation })'),
    '§10 INV: the accreditation route composes from the fold it already computed (no new read)',
  )
  // Composed AFTER the fold, and the fold is computed after the writer — so the
  // suggestion can never affect the write outcome.
  const foldIdx = accredRouteSrc.indexOf('loopFoldAnnotation = undefined')
  const accredSuggIdx = accredRouteSrc.indexOf('practiceSuggestionFor(')
  assert(
    foldIdx > 0 && accredSuggIdx > foldIdx,
    '§10 INV: the accreditation suggestion is composed after the fold (and so after the writer)',
  )
  assert(
    accredRouteSrc.includes('buildWriteSuccessResponse(') &&
      /buildWriteSuccessResponse\([\s\S]{0,200}practiceSuggestion,?\s*\)/.test(accredRouteSrc),
    '§10 INV: the suggestion is passed to the SUCCESS response builder only',
  )

  const buildersSrc = readFileSync(
    join(__dirname, '../../../app/api/accreditation/[agent_id]/response-builders.ts'),
    'utf8',
  )
  // Flag-off / no-basis ⇒ the practice field spreads exactly as before.
  assert(
    /practiceField\.practice !== undefined && suggestion !== undefined[\s\S]{0,200}: practiceField/.test(
      buildersSrc,
    ),
    '§10 INV: with no suggestion the builder spreads the unmodified CI-13 field (byte-identity)',
  )
  assert(
    buildersSrc.includes('{ ...practiceField.practice, suggestion }'),
    '§10 INV: the builder spreads a NEW practice object, never mutating the constant',
  )
}

// ============================================================================
// §11 — unwrapAssessment
// ============================================================================
{
  const bare = assessment()
  eq(unwrapAssessment(bare), bare as never, '§11 a bare assessment passes through')
  eq(unwrapAssessment(signed(bare)), bare as never, '§11 a signed envelope is unwrapped')
  for (const junk of [undefined, null, 'x', 7, [], {}, { assessment: {} }, { signature: 's' }]) {
    eq(unwrapAssessment(junk), undefined, `§11 unusable input ⇒ undefined (${JSON.stringify(junk)})`)
  }
  // Both wire shapes reach the SAME basis — signing state changes nothing.
  eq(
    codeOf({ assessment: VIOLATED_OTHER }),
    codeOf({ assessment: signed(VIOLATED_OTHER) }),
    '§11 signed and bare assessments compose identically',
  )
}

// ============================================================================
// §12 — The framing note carries every required clause
// ============================================================================
{
  const n = PRACTICE_SUGGESTION_FRAMING_NOTE.toLowerCase()
  for (const clause of [
    'advisory only',
    'channel law',
    'binds nothing',
    'never a trust-event source',
    'predicts nothing',
    'past tense',
    'one suggestion at most',
    'weights-tier use remains blocked',
  ]) {
    assert(n.includes(clause), `§12 the framing note states '${clause}'`)
  }
  assert(
    n.includes('not an input to any recommendation or gate'),
    '§12 the framing note states it is not an S4/gate input',
  )
  assert(n.includes('silence is honest'), '§12 the framing note states the silence is honest, never filler')
}

// ============================================================================
// §13 — SERIALIZED byte-identity at the accreditation seam (the real builder,
// not a simulation). The /api/reason seam is pinned structurally in §10 (its
// route module cannot be imported without a live env); there the guarantee is
// the same one proven in §1 — flag-off, practiceSuggestionFor returns
// undefined, so the mutation branch never runs and `output.practice` stays the
// identical frozen constant.
// ============================================================================
// Everything above is synchronous; this last block is async, so the summary
// rides at its end (one sequential chain — no interleaved async test blocks).
void (async () => {
  const priorHint = process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED
  const priorSugg = process.env[PRACTICE_SUGGESTION_ENV_VAR]

  const lc = { verdict: 'closed', redirections: 1, closed: 1, open: 0, indeterminate: 0 }
  const lf = fold({ domains: { dikaiosyne: domainFold('habitual'), phronesis: domainFold('principled') } })

  const bodyOf = async (r: { json: () => Promise<unknown> }): Promise<string> =>
    JSON.stringify(await r.json())

  {
    // The pre-A1 baseline: the builder called with NO third argument at all —
    // exactly the call the code made before this session.
    for (const hint of ['true', undefined]) {
      if (hint === undefined) delete process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED
      else process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED = hint

      const preA1 = await bodyOf(buildWriteSuccessResponse(lc, lf))
      const withUndefined = await bodyOf(buildWriteSuccessResponse(lc, lf, undefined))
      eq(
        withUndefined,
        preA1,
        `§13 flag-off (hint=${hint}) — passing undefined is byte-identical to the pre-A1 two-arg call`,
      )

      // And the A1 flag genuinely off ⇒ the route's own composition is undefined.
      delete process.env[PRACTICE_SUGGESTION_ENV_VAR]
      const routeComposed = practiceSuggestionFor({ loopFold: lf })
      eq(routeComposed, undefined, `§13 flag-off (hint=${hint}) — the route composes nothing`)
      eq(
        await bodyOf(buildWriteSuccessResponse(lc, lf, routeComposed)),
        preA1,
        `§13 flag-off (hint=${hint}) — the full route path is byte-identical`,
      )
    }

    // NON-VACUITY: with both flags on, the body genuinely CHANGES — otherwise
    // every pin above would pass on a dead seam.
    process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED = 'true'
    process.env[PRACTICE_SUGGESTION_ENV_VAR] = 'true'
    const onBody = await bodyOf(buildWriteSuccessResponse(lc, lf, practiceSuggestionFor({ loopFold: lf })))
    process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED = 'true'
    delete process.env[PRACTICE_SUGGESTION_ENV_VAR]
    const offBody = await bodyOf(buildWriteSuccessResponse(lc, lf))
    assert(onBody !== offBody, '§13 NON-VACUITY: flag-on genuinely changes the body')
    assert(
      onBody.includes('agent-practice-suggestion/v1') &&
        onBody.includes('dikaiosyne_weakest_domain_chain'),
      '§13 flag-on serves the suggestion inside the practice block',
    )
    const parsed = JSON.parse(onBody) as { practice?: { suggestion?: unknown; reflect_due?: string } }
    eq(parsed.practice?.reflect_due, 'TR-02', '§13 the CI-13 hint fields survive alongside the suggestion')
    assert(parsed.practice?.suggestion !== undefined, '§13 the suggestion rides INSIDE the practice block')

    // BD-3: A1 flag on but the CI-13 carrier off ⇒ no practice block at all.
    delete process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED
    process.env[PRACTICE_SUGGESTION_ENV_VAR] = 'true'
    const noCarrier = JSON.parse(
      await bodyOf(buildWriteSuccessResponse(lc, lf, practiceSuggestionFor({ loopFold: lf }))),
    ) as Record<string, unknown>
    assert(!('practice' in noCarrier), '§13 BD-3: no carrier ⇒ no practice block, no suggestion')
  }

  if (priorHint === undefined) delete process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED
  else process.env.SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED = priorHint
  if (priorSugg === undefined) delete process.env[PRACTICE_SUGGESTION_ENV_VAR]
  else process.env[PRACTICE_SUGGESTION_ENV_VAR] = priorSugg

  // ==========================================================================
  console.log(`practice-suggestion battery: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
})()
