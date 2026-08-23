/**
 * ruling-faculty-deliberation.test.ts — the D4-COMPLETION fix (2026-08-23).
 *
 * Plain-assertion script: npx tsx <this file>  (pure — layer2-mechanisms has no
 * Supabase chain; no LLM, no I/O).
 *
 * WHAT IT PROVES
 *
 * D4 replaced the legacy `deliberation_notes.length > 0` presence proxy with the
 * SUBSTANTIVE-note predicate `hasGenuineDeliberation` — but wired it into the
 * proximity reading ONLY, leaving `ruling_faculty_state` on the old proxy. This
 * battery covers the completion of that fix, and is `computeRulingFacultyState`'s
 * FIRST coverage of any kind: before this file, no test in the repo asserted any
 * of the function's seven output strings.
 *
 *   1. THE EQUIVALENCE THEOREM — `assessOikeiosis` pushes a deliberation note iff
 *      (i) some circle carries a tension, (ii) some circle's Cicero verdict is
 *      balanced, or (iii) NO circles were engaged. (i)∨(ii) is exactly
 *      `hasGenuineDeliberation`, so over any oikeiosis this module produces:
 *          legacyProxy  ≡  genuineDeliberation ∨ zeroCircles
 *      Asserted empirically over the whole fixture matrix, with a NON-VACUITY
 *      FLOOR: the matrix must actually contain all three cells, or the theorem
 *      check proves nothing.
 *   2. THE FIX IS WIRED — on every zero-circle fixture (the sole divergence class)
 *      `ruling_faculty_state` now takes a NOT-deliberating branch. Each such
 *      assertion is paired with its own non-vacuity check (legacy true AND genuine
 *      false — i.e. this fixture really did read differently before the fix) and
 *      names the pre-fix string it replaces.
 *   3. IDENTICAL-BEHAVIOUR CONTROLS — where circles ARE engaged, legacy ≡ genuine,
 *      so the fix provably cannot have moved anything. Both sub-cases pinned:
 *      circles WITH substantive notes, and circles WITHOUT.
 *   4. ALL SEVEN BRANCHES — every branch of computeRulingFacultyState is reachable
 *      through applyMechanisms and the seven strings are mutually distinct.
 *   5. FLAG-INDEPENDENCE — `ruling_faculty_state` is identical under
 *      dikaiosyneWeighting off and on, for every fixture. The call site sits
 *      outside computeProximity's `!dikaiosyne` branch and always did; the fix is
 *      unflagged and this pins that it stayed that way.
 *   6. FLAG-OFF PROXIMITY NEGATIVE CONTROL — computeProximity's `!dikaiosyne`
 *      branch STILL uses the raw legacy proxy, deliberately (it is the
 *      byte-identical pre-§4 path). Pinned by exact values: this assertion goes
 *      RED if a later session "tidies" that branch onto the predicate too.
 *   7. DETERMINISM — same schema in, byte-identical assessment out.
 *
 * Driven END-TO-END through `applyMechanisms`, never by calling the internal
 * function directly: the defect being fixed was at a CALL SITE, and only an
 * end-to-end route can catch a call-site mistake.
 */

import type { Layer1Schema } from '../layer1-extractor'
import { applyMechanisms, type Layer2Assessment, type Tier1ShortCircuit } from '../layer2-mechanisms'

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

function full(x: Layer2Assessment | Tier1ShortCircuit, label: string): Layer2Assessment {
  if ('tier1_trigger' in x) {
    throw new Error(`${label}: unexpected Tier-1 short-circuit ${x.tier1_trigger.trigger_code}`)
  }
  return x
}

function base(overrides: Partial<Layer1Schema>): Layer1Schema {
  return {
    version: 'layer1-schema-v1',
    passions_present: [],
    control_filter_elements: [],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    kathekon_factors: [],
    urgency_indicators: [],
    causal_stage_evidence: [],
    eupatheia_candidates: [],
    stated_concern_targets: [],
    stated_equanimity_signals: [],
    motivation_stated: false,
    motivation_evidence: [],
    element_fusion_detected: { fused: false, fused_concerns: null },
    ambiguity_notes: [],
    ...overrides,
  }
}

const off = { dikaiosyneWeighting: false } as const
const on = { dikaiosyneWeighting: true } as const

/** The seven strings computeRulingFacultyState can emit, in branch order. */
const RFS = {
  overwhelmed: 'Overwhelmed — multiple passions under time pressure; ruling faculty agitated.',
  agitated: 'Agitated — multiple passions at present; examination interrupted.',
  examining: 'Examining — single passion engaged; ruling faculty actively interrogating impressions.',
  stableExamining:
    'Stable, examining — no passions present; ruling faculty deliberating without distortion.',
  disengaged: 'Disengaged — no passions, no deliberation; ruling faculty at rest.',
  unsettled: 'Unsettled — multiple ambiguities in interpretation; ruling faculty unable to resolve.',
  engaged: 'Engaged — ruling faculty active but no dominant pattern.',
} as const

/** An INDEPENDENT restatement of the predicate, deliberately re-derived here from
 *  the assessment's own published oikeiosis rather than imported — a check, not a
 *  tautology. Reads the same two substantive-note sources assessOikeiosis reads. */
function genuineDeliberation(a: Layer2Assessment): boolean {
  return a.oikeiosis.relevant_circles.some(
    (c) => c.tension !== null || c.cicero_verdict === 'balanced_neither_decisive'
  )
}
/** The legacy presence proxy, as computeRulingFacultyState was called with it. */
function legacyProxy(a: Layer2Assessment): boolean {
  return a.oikeiosis.deliberation_notes.length > 0
}

const ANGER = { root_passion: 'epithumia', sub_species: 'orge', evidence: 'I was angry' } as const
const DREAD = { root_passion: 'phobos', sub_species: 'agonia', evidence: 'I dreaded it' } as const

// ---------------------------------------------------------------------------
// FIXTURE MATRIX — the three oikeiosis shapes × the ruling-faculty input space.
//
// `local_community` alone gives honourability 2 / advantageousness 2 (equal, both
// < 3) ⇒ cicero_verdict 'balanced_neither_decisive' ⇒ a SUBSTANTIVE note, with no
// kathekon factor or high-axia indifferent present to bump either grade.
// `self_preservation` alone gives 1 / 3 ⇒ 'advantageous_prevails', and a single
// circle can carry no tension ⇒ NO note at all.
// Neither Tier-1 detector can fire on these: SCOPE_AMBIGUITY needs a praxis/horme
// stage AND an other-referent marker, TEMPORAL_AMBIGUITY needs both past and
// future temporal markers in the stage evidence.
// ---------------------------------------------------------------------------

type Fx = { label: string; schema: Layer1Schema; expect: string }

const ZERO_CIRCLE: Fx[] = [
  { label: 'zero-circle · 0 passions · 0 ambiguities', schema: base({}), expect: RFS.disengaged },
  {
    label: 'zero-circle · 1 passion · 0 ambiguities',
    schema: base({ passions_present: [ANGER] }),
    expect: RFS.engaged,
  },
  {
    label: 'zero-circle · 0 passions · 2 ambiguities',
    schema: base({ ambiguity_notes: ['which deadline', 'whose call'] }),
    expect: RFS.engaged,
  },
  {
    label: 'zero-circle · 1 passion · 3 ambiguities',
    schema: base({ passions_present: [ANGER], ambiguity_notes: ['a', 'b', 'c'] }),
    expect: RFS.unsettled,
  },
]

const CIRCLES_WITH_DELIBERATION: Fx[] = [
  {
    label: 'balanced Cicero verdict · 0 passions',
    schema: base({ oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the users' }] }),
    expect: RFS.stableExamining,
  },
  {
    label: 'balanced Cicero verdict · 1 passion',
    schema: base({
      oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the users' }],
      passions_present: [ANGER],
    }),
    expect: RFS.examining,
  },
  {
    label: 'cross-circle tension · 0 passions',
    schema: base({
      oikeiosis_circles_engaged: [
        { circle: 'household', evidence: 'torn between family and the release' },
        { circle: 'local_community', evidence: 'the team' },
      ],
    }),
    expect: RFS.stableExamining,
  },
  {
    // PR19 fold — TENSION-ONLY. The fixture above is NOT tension-only: its
    // `local_community` circle grades h=2/a=2, so it independently yields a
    // balanced Cicero verdict, and every assertion it carries is satisfied by
    // that second disjunct alone. Deleting `c.tension !== null` from
    // hasGenuineDeliberation therefore survived the whole battery at 101/0 — a
    // 50% mutation of the predicate this fix wires in, and one that ALSO governs
    // the live flag-on proximity path. Here `household` (h=3/a=2 →
    // honourable_prevails) and `self_preservation` (h=1/a=3 →
    // advantageous_prevails) are both un-balanced, so the note can only come
    // from the tension. Pinned non-vacuously below.
    label: 'cross-circle tension ONLY · 0 passions (no balanced verdict anywhere)',
    schema: base({
      oikeiosis_circles_engaged: [
        { circle: 'household', evidence: 'torn between family and the release' },
        { circle: 'self_preservation', evidence: 'my own standing' },
      ],
    }),
    expect: RFS.stableExamining,
  },
]

const CIRCLES_WITHOUT_DELIBERATION: Fx[] = [
  {
    label: 'self_preservation alone · 0 passions · 0 ambiguities',
    schema: base({
      oikeiosis_circles_engaged: [{ circle: 'self_preservation', evidence: 'my own standing' }],
    }),
    expect: RFS.disengaged,
  },
  {
    label: 'self_preservation alone · 1 passion · 0 ambiguities',
    schema: base({
      oikeiosis_circles_engaged: [{ circle: 'self_preservation', evidence: 'my own standing' }],
      passions_present: [ANGER],
    }),
    expect: RFS.engaged,
  },
]

/** Passion-dominant branches: reached before `hasDeliberation` is ever consulted,
 *  so they must read the SAME string with and without engaged circles. */
const PASSION_DOMINANT: Array<{ label: string; withCircles: Layer1Schema; without: Layer1Schema; expect: string }> = [
  {
    label: '2 passions + 2 urgency signals → Overwhelmed',
    withCircles: base({
      passions_present: [ANGER, DREAD],
      urgency_indicators: [
        { signal_type: 'time_pressure', evidence: 'it had to go out' },
        { signal_type: 'imminent_deadline', evidence: 'by close of business' },
      ],
      oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the users' }],
    }),
    without: base({
      passions_present: [ANGER, DREAD],
      urgency_indicators: [
        { signal_type: 'time_pressure', evidence: 'it had to go out' },
        { signal_type: 'imminent_deadline', evidence: 'by close of business' },
      ],
    }),
    expect: RFS.overwhelmed,
  },
  {
    label: '2 passions, no urgency → Agitated',
    withCircles: base({
      passions_present: [ANGER, DREAD],
      oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the users' }],
    }),
    without: base({ passions_present: [ANGER, DREAD] }),
    expect: RFS.agitated,
  },
  {
    // PR19 fold — OFF-DIAGONAL for the Overwhelmed guard
    // (`urgencyCount >= 2 && passionCount >= 2`). Without these, only the
    // 2-and-2 diagonal was pinned, so weakening either conjunct went undetected.
    label: '2 passions + only 1 urgency signal → Agitated, not Overwhelmed',
    withCircles: base({
      passions_present: [ANGER, DREAD],
      urgency_indicators: [{ signal_type: 'time_pressure', evidence: 'it had to go out' }],
      oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the users' }],
    }),
    without: base({
      passions_present: [ANGER, DREAD],
      urgency_indicators: [{ signal_type: 'time_pressure', evidence: 'it had to go out' }],
    }),
    expect: RFS.agitated,
  },
]


const ALL: Fx[] = [...ZERO_CIRCLE, ...CIRCLES_WITH_DELIBERATION, ...CIRCLES_WITHOUT_DELIBERATION]

// ============================================================================
// 1. THE EQUIVALENCE THEOREM (+ NON-VACUITY FLOOR)
//    legacyProxy ≡ genuineDeliberation ∨ zeroCircles, over the whole matrix.
// ============================================================================
{
  let cellGenuine = 0
  let cellCirclesNoNote = 0
  let cellZeroCircle = 0
  let checked = 0

  for (const fx of ALL) {
    for (const opts of [off, on]) {
      const a = full(applyMechanisms(fx.schema, opts), fx.label)
      const zero = a.oikeiosis.relevant_circles.length === 0
      const genuine = genuineDeliberation(a)
      const legacy = legacyProxy(a)
      assert(
        legacy === (genuine || zero),
        `theorem: legacyProxy ≡ genuine ∨ zeroCircles — ${fx.label} (${opts.dikaiosyneWeighting ? 'on' : 'off'})`
      )
      checked++
      if (genuine) cellGenuine++
      else if (!zero) cellCirclesNoNote++
      else cellZeroCircle++
    }
  }

  // NON-VACUITY FLOOR — a theorem check over a matrix missing a cell proves nothing.
  // PR19 fold: `checked === ALL.length * 2` was NOT a floor. Both sides derive from the
  // same array with no early exit, so it was true by construction and an EMPTY matrix
  // would have passed it 0 === 0. A floor has to be a literal the matrix can fall below.
  assert(ALL.length >= 10, `theorem floor: the fixture matrix is populated (${ALL.length} >= 10)`)
  assert(checked === ALL.length * 2, `theorem: every fixture traversed in both flag states (${checked})`)
  assert(cellGenuine > 0, `theorem non-vacuity: matrix contains genuine-deliberation cases (${cellGenuine})`)
  assert(
    cellCirclesNoNote > 0,
    `theorem non-vacuity: matrix contains circles-but-no-substantive-note cases (${cellCirclesNoNote})`
  )
  assert(cellZeroCircle > 0, `theorem non-vacuity: matrix contains zero-circle cases (${cellZeroCircle})`)
}

// ============================================================================
// 2. THE FIX IS WIRED — the zero-circle class is the SOLE divergence class, and
//    ruling_faculty_state now takes a NOT-deliberating branch there.
// ============================================================================
{
  const preFixWouldHaveBeen: Record<string, string> = {
    'zero-circle · 0 passions · 0 ambiguities': RFS.stableExamining,
    'zero-circle · 1 passion · 0 ambiguities': RFS.examining,
    'zero-circle · 0 passions · 2 ambiguities': RFS.stableExamining,
    'zero-circle · 1 passion · 3 ambiguities': RFS.examining,
  }

  for (const fx of ZERO_CIRCLE) {
    const a = full(applyMechanisms(fx.schema, on), fx.label)

    // NON-VACUITY: this fixture must genuinely be in the divergence class, or the
    // assertion below is satisfied by an input the fix never touched.
    assert(
      legacyProxy(a) === true && genuineDeliberation(a) === false,
      `divergence non-vacuity: ${fx.label} — legacy proxy true, genuine false (the filler-note class)`
    )
    assert(
      a.oikeiosis.deliberation_notes === 'No circles engaged in this snapshot.',
      `divergence: ${fx.label} — the note really is the filler`
    )
    assert(
      a.ruling_faculty_state === fx.expect,
      `FIX: ${fx.label} → "${fx.expect.slice(0, 32)}…" (pre-fix: "${preFixWouldHaveBeen[fx.label].slice(0, 32)}…")`
    )
    assert(
      a.ruling_faculty_state !== preFixWouldHaveBeen[fx.label],
      `FIX: ${fx.label} — no longer reports the pre-fix deliberating branch`
    )
  }
}

// ============================================================================
// 3. IDENTICAL-BEHAVIOUR CONTROLS — where circles are engaged, legacy ≡ genuine,
//    so the fix cannot have moved anything. Both sub-cases pinned.
// ============================================================================
for (const fx of [...CIRCLES_WITH_DELIBERATION, ...CIRCLES_WITHOUT_DELIBERATION]) {
  const a = full(applyMechanisms(fx.schema, on), fx.label)
  assert(
    a.oikeiosis.relevant_circles.length > 0,
    `control: ${fx.label} — circles are actually engaged (non-vacuity)`
  )
  // PR19 fold — DECAY GUARD on the tension-only fixture. If a future edit lets a
  // balanced Cicero verdict creep into this fixture, it silently stops covering the
  // `tension !== null` disjunct and the coverage this fold added rots away in silence.
  if (fx.label.includes('tension ONLY')) {
    assert(
      a.oikeiosis.relevant_circles.every((c) => c.cicero_verdict !== 'balanced_neither_decisive'),
      'tension-only non-vacuity: NO circle carries a balanced verdict (else the second disjunct covers for the first)'
    )
    assert(
      a.oikeiosis.relevant_circles.some((c) => c.tension !== null),
      'tension-only non-vacuity: a tension is actually present'
    )
    assert(
      a.oikeiosis.deliberation_notes.startsWith('Tension between'),
      'tension-only: the note is sourced from the tension alone (also pins the non-emptiness lemma for that push)'
    )
  }
  assert(
    legacyProxy(a) === genuineDeliberation(a),
    `control: ${fx.label} — legacy ≡ genuine, so the fix is a no-op here`
  )
  assert(a.ruling_faculty_state === fx.expect, `control: ${fx.label} → "${fx.expect.slice(0, 32)}…"`)
}

// Passion-dominant branches are reached before hasDeliberation is consulted:
// identical with and without circles.
for (const fx of PASSION_DOMINANT) {
  const withC = full(applyMechanisms(fx.withCircles, on), fx.label).ruling_faculty_state
  const withoutC = full(applyMechanisms(fx.without, on), fx.label).ruling_faculty_state
  assert(withC === fx.expect, `passion-dominant: ${fx.label} (circles engaged)`)
  assert(withoutC === fx.expect, `passion-dominant: ${fx.label} (no circles)`)
  assert(withC === withoutC, `passion-dominant: ${fx.label} — deliberation input is irrelevant here`)
}

// ============================================================================
// 3b. THE OVERWHELMED GUARD's PASSION CONJUNCT (PR19 fold)
//     `urgencyCount >= 2 && passionCount >= 2`. Two urgency signals with only ONE
//     passion must NOT read Overwhelmed. This case is deliberately NOT in
//     PASSION_DOMINANT: with one passion the deliberation input is consulted, so it
//     legitimately differs with and without circles — which pins the guard twice over.
// ============================================================================
{
  const oneP2U = (circles: Layer1Schema['oikeiosis_circles_engaged']) =>
    base({
      passions_present: [ANGER],
      urgency_indicators: [
        { signal_type: 'time_pressure', evidence: 'it had to go out' },
        { signal_type: 'imminent_deadline', evidence: 'by close of business' },
      ],
      oikeiosis_circles_engaged: circles,
    })
  const zero = full(applyMechanisms(oneP2U([]), on), '1p2u zero-circle')
  const withC = full(
    applyMechanisms(oneP2U([{ circle: 'local_community', evidence: 'the users' }]), on),
    '1p2u with-circle'
  )
  assert(zero.ruling_faculty_state !== RFS.overwhelmed, 'Overwhelmed guard: 1 passion + 2 urgency is NOT Overwhelmed (zero-circle)')
  assert(withC.ruling_faculty_state !== RFS.overwhelmed, 'Overwhelmed guard: 1 passion + 2 urgency is NOT Overwhelmed (with circle)')
  assert(zero.ruling_faculty_state === RFS.engaged, 'Overwhelmed guard: 1p+2u, no deliberation → Engaged')
  assert(withC.ruling_faculty_state === RFS.examining, 'Overwhelmed guard: 1p+2u, genuine deliberation → Examining')
}

// ============================================================================
// 4. ALL SEVEN BRANCHES reachable + mutually distinct
// ============================================================================
{
  const observed = new Set<string>()
  for (const fx of ALL) observed.add(full(applyMechanisms(fx.schema, on), fx.label).ruling_faculty_state)
  for (const fx of PASSION_DOMINANT) {
    observed.add(full(applyMechanisms(fx.withCircles, on), fx.label).ruling_faculty_state)
  }
  const all = Object.values(RFS)
  assert(new Set(all).size === 7, 'branches: the seven declared strings are mutually distinct')
  for (const s of all) {
    assert(observed.has(s), `branches: reachable through applyMechanisms — "${s.slice(0, 40)}…"`)
  }
  assert(observed.size === 7, `branches: exactly seven distinct outputs observed (${observed.size})`)
}

// ============================================================================
// 5. FLAG-INDEPENDENCE — ruling_faculty_state is identical off vs on, always.
//    The call site sits OUTSIDE computeProximity's `!dikaiosyne` branch and
//    always did; the D4-completion fix is unflagged, and this pins that.
// ============================================================================
{
  let compared = 0
  for (const fx of ALL) {
    const a = full(applyMechanisms(fx.schema, off), fx.label).ruling_faculty_state
    const b = full(applyMechanisms(fx.schema, on), fx.label).ruling_faculty_state
    assert(a === b, `flag-independence: ${fx.label} — same ruling_faculty_state off and on`)
    compared++
  }
  // PR19 fold: same vacuity as above — pin a literal the matrix can fall below.
  assert(compared >= 10, `flag-independence floor: enough fixtures compared (${compared} >= 10)`)
}

// ============================================================================
// 6. FLAG-OFF PROXIMITY NEGATIVE CONTROL — computeProximity's `!dikaiosyne`
//    branch STILL reads the raw legacy proxy. That branch is the byte-identical
//    pre-§4 path and is deliberately NOT part of this fix. Pinned by exact
//    values: this goes RED if a later change narrows that branch too.
// ============================================================================
{
  const impulsiveNoCircle = base({
    passions_present: [{ root_passion: 'epithumia', sub_species: 'orge', evidence: 'I lashed out' }],
    causal_stage_evidence: [{ stage: 'praxis', evidence: 'I sent it' }],
    value_categories_at_stake: [
      { indifferent: 'reputation', agent_framing: 'good', evidence: 'my standing' },
    ],
  })
  const offA = full(applyMechanisms(impulsiveNoCircle, off), 'flag-off proximity control')
  const onA = full(applyMechanisms(impulsiveNoCircle, on), 'flag-on proximity control')

  assert(
    offA.oikeiosis.relevant_circles.length === 0 && legacyProxy(offA) === true,
    'flag-off control non-vacuity: the fixture is in the divergence class'
  )
  assert(
    offA.katorthoma_proximity === 'deliberate',
    "flag-off proximity: still floats on the legacy filler proxy → 'deliberate' (pre-§4 path preserved)"
  )
  assert(
    onA.katorthoma_proximity === 'reflexive',
    "flag-on proximity: the D4-corrected predicate governs → 'reflexive'"
  )
  assert(
    offA.katorthoma_proximity !== onA.katorthoma_proximity,
    'flag-off proximity: demonstrably a different path from flag-on (the two branches did not converge)'
  )
  // …while ruling_faculty_state is the SAME in both, because it is flag-independent.
  assert(
    offA.ruling_faculty_state === onA.ruling_faculty_state &&
      offA.ruling_faculty_state === RFS.engaged,
    'flag-off control: ruling_faculty_state is flag-independent even where proximity is not'
  )
}

// ============================================================================
// 7. DETERMINISM
// ============================================================================
for (const fx of ALL) {
  assert(
    JSON.stringify(applyMechanisms(fx.schema, on)) === JSON.stringify(applyMechanisms(fx.schema, on)),
    `determinism (on): ${fx.label}`
  )
  assert(
    JSON.stringify(applyMechanisms(fx.schema, off)) === JSON.stringify(applyMechanisms(fx.schema, off)),
    `determinism (off): ${fx.label}`
  )
}

// ============================================================================
// REPORT
// ============================================================================
console.log(`\nruling-faculty-deliberation.test.ts — ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error(`\nFAILURES:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
