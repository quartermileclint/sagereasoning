/**
 * reasoning-integrity.test.ts — agent-circles C0.2 + C1b.
 *
 * Plain-assertion script: npx tsx <this file> (bare — no I/O, no env needed;
 * every flag is passed explicitly so the battery is env-independent).
 *
 * Pins, in order:
 *   §1  No signals at all → null reading (the assessment field is OMITTED).
 *   §2  THE CONJUNCTION (mentor Q2c), in BOTH directions — all three elements
 *       fire the class, and each element ALONE does not. Non-vacuity is the
 *       point: a two-of-three fixture must also not fire the sophrosyne class.
 *   §3  CAUSAL-LOCUS ROUTING (mentor Q2a) — tension present ⇒ sophrosyne;
 *       tension ABSENT with the compliance pair ⇒ phronesis. The absence is
 *       load-bearing, so both branches are pinned, plus the control that the
 *       two readings are genuinely different domains.
 *   §4  Empty/whitespace spans do NOT count as present (the unargued-
 *       justification discipline, or a three-way conjunction is satisfiable
 *       with three empty quotes).
 *   §5  THE DEMONSTRATION (mentor Q2b) — both spans required; a bare refusal
 *       with no stated reasoning is not the pattern.
 *   §6  Failure and demonstration can co-occur and are reported separately.
 *   §7  insufficient_evidence_note is present exactly when elements were seen
 *       but no class was met, and null otherwise.
 *   §8  BOUNDS ride every reading, verbatim.
 *   §9  MEASURE-ONLY, THE LOAD-BEARING PIN (mentor L4): katorthoma_proximity
 *       and proximity_floors are BYTE-IDENTICAL with and without
 *       reasoning_integrity_signals, at both flag states, for a failure that
 *       would otherwise look punishable. If this pin ever fails, the live
 *       /api/guardrail gate has been given a first-circle enforcement path —
 *       the category error L4 forbids.
 *   §10 FLAG-OFF BYTE-IDENTITY: agentCircles false ⇒ neither
 *       `reasoning_integrity` nor `practitioner_type` appears anywhere in the
 *       canonical JSON of the assessment.
 *   §11 practitioner_type is SERVER-SUPPLIED only — it never appears when the
 *       caller does not supply it, even flag-on.
 *   §12 The Layer-1 VALIDATOR: optional/additive round-trip; a pre-C1b schema
 *       round-trips without the key; a half-populated demonstration is
 *       REJECTED; undefined elements normalise to null.
 */

import {
  readReasoningIntegrity,
  REASONING_INTEGRITY_BOUNDS,
  isAgentCirclesEnabled,
} from '../reasoning-integrity'
import { applyMechanisms, type Layer2Assessment } from '../layer2-mechanisms'
import {
  validateLayer1Schema,
  type Layer1Schema,
  type ReasoningIntegritySignals,
  buildLayer1SystemPrompt,
} from '../layer1-extractor'

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
// FIXTURES
// ============================================================================

function baseSchema(signals?: ReasoningIntegritySignals): Layer1Schema {
  const s: Layer1Schema = {
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
  }
  if (signals) s.reasoning_integrity_signals = signals
  return s
}

const T = 'I could see the number did not add up'
const I = 'but the brief said to report it as-is'
const D = 'on my own I would have sent it back'

function tpa(
  tension: string | null,
  instruction: string | null,
  divergence: string | null,
): ReasoningIntegritySignals {
  return {
    task_pressure_assent: {
      tension_identified: tension,
      instruction_as_operative_reason: instruction,
      independent_assessment_diverges: divergence,
    },
  }
}

// ============================================================================
// §1 — no signals ⇒ no reading
// ============================================================================

assert(readReasoningIntegrity(baseSchema()) === null, '§1 no signals ⇒ null reading')
assert(
  readReasoningIntegrity(baseSchema(tpa(null, null, null))) === null,
  '§1b all-null elements ⇒ null reading (never an all-negative object)',
)

// ============================================================================
// §2 — the conjunction, both directions
// ============================================================================

const all3 = readReasoningIntegrity(baseSchema(tpa(T, I, D)))
assert(all3?.failure?.class === 'task_pressure_assent', '§2 all three ⇒ task_pressure_assent')

// Each element ALONE must not fire the class.
for (const [label, sig] of [
  ['tension only', tpa(T, null, null)],
  ['instruction only', tpa(null, I, null)],
  ['divergence only', tpa(null, null, D)],
] as const) {
  const r = readReasoningIntegrity(baseSchema(sig))
  assert(r !== null && r.failure === null, `§2 ${label} ⇒ NO failure class (non-vacuity)`)
}

// Two-of-three that omits a compliance-pair member must also not fire.
for (const [label, sig] of [
  ['tension + instruction', tpa(T, I, null)],
  ['tension + divergence', tpa(T, null, D)],
] as const) {
  const r = readReasoningIntegrity(baseSchema(sig))
  assert(r !== null && r.failure === null, `§2 ${label} ⇒ NO failure class`)
}

// ============================================================================
// §3 — causal-locus routing (Q2a)
// ============================================================================

assert(all3?.failure?.domain === 'sophrosyne', '§3 tension present ⇒ sophrosyne')

const noTension = readReasoningIntegrity(baseSchema(tpa(null, I, D)))
assert(
  noTension?.failure?.class === 'unexamined_compliance',
  '§3 compliance pair without tension ⇒ unexamined_compliance',
)
assert(noTension?.failure?.domain === 'phronesis', '§3 no tension ⇒ phronesis')
assert(
  all3?.failure?.domain !== noTension?.failure?.domain,
  '§3 CONTROL: the two branches route to genuinely different domains',
)

// ============================================================================
// §4 — empty / whitespace spans are absent
// ============================================================================

const blank = readReasoningIntegrity(baseSchema(tpa('   ', '', '\n')))
assert(blank === null, '§4 whitespace-only spans ⇒ absent ⇒ null reading')
const blankTension = readReasoningIntegrity(baseSchema(tpa('  ', I, D)))
assert(
  blankTension?.failure?.class === 'unexamined_compliance',
  '§4 a blank tension is ABSENT, so the reading routes to phronesis, not sophrosyne',
)

// ============================================================================
// §5 — the demonstration (Q2b)
// ============================================================================

const demo = readReasoningIntegrity(
  baseSchema({
    examined_refusal: {
      instruction_declined: 'they wanted me to drop the caveat',
      reasoning_for_refusal: 'I could not state it as settled when it is not',
    },
  }),
)
assert(demo?.demonstration?.class === 'examined_refusal', '§5 both spans ⇒ demonstration')
assert(demo?.demonstration?.domain === 'sophrosyne', '§5 demonstration ⇒ sophrosyne (positive)')

const bareRefusal = readReasoningIntegrity(
  baseSchema({
    examined_refusal: { instruction_declined: 'they wanted the caveat dropped', reasoning_for_refusal: '  ' },
  }),
)
assert(
  bareRefusal === null || bareRefusal.demonstration === null,
  '§5 a refusal with no stated reasoning is NOT the pattern (non-vacuity)',
)

// ============================================================================
// §6 — co-occurrence
// ============================================================================

const both = readReasoningIntegrity(
  baseSchema({
    task_pressure_assent: {
      tension_identified: T,
      instruction_as_operative_reason: I,
      independent_assessment_diverges: D,
    },
    examined_refusal: {
      instruction_declined: 'a second instruction',
      reasoning_for_refusal: 'which I declined for stated reasons',
    },
  }),
)
assert(
  both?.failure?.class === 'task_pressure_assent' && both?.demonstration?.class === 'examined_refusal',
  '§6 failure and demonstration co-occur and are reported separately',
)

// ============================================================================
// §7 — the insufficient-evidence note
// ============================================================================

const partial = readReasoningIntegrity(baseSchema(tpa(T, null, null)))
assert(
  typeof partial?.insufficient_evidence_note === 'string',
  '§7 elements seen but no class ⇒ insufficient_evidence_note present',
)
assert(all3?.insufficient_evidence_note === null, '§7 a met class ⇒ note is null')
assert(demo?.insufficient_evidence_note === null, '§7 a demonstration alone ⇒ note is null')

// ============================================================================
// §8 — bounds ride every reading, verbatim
// ============================================================================

for (const [label, r] of [
  ['failure', all3],
  ['demonstration', demo],
  ['partial', partial],
] as const) {
  assert(r?.bounds === REASONING_INTEGRITY_BOUNDS, `§8 bounds verbatim on the ${label} reading`)
}
assert(
  REASONING_INTEGRITY_BOUNDS.includes('never an input to katorthoma proximity'),
  '§8 the bounds string states the measure-only limit in its own terms',
)

// ============================================================================
// §9 — MEASURE-ONLY: proximity is untouched by first-circle signals
// ============================================================================

/** A schema with enough substance that proximity is non-trivially computed. */
function proximityFixture(signals?: ReasoningIntegritySignals): Layer1Schema {
  const s = baseSchema(signals)
  s.oikeiosis_circles_engaged = [
    {
      circle: 'local_community',
      evidence: 'the users who receive the report',
      obligation_assessment: { status: 'met', justification: 'the report is complete and accurate' },
    },
  ]
  s.kathekon_factors = [
    { factor_type: 'role_obligation', description: 'reporting duty', evidence: 'my job is to report' },
  ]
  s.causal_stage_evidence = [{ stage: 'synkatathesis', evidence: 'I decided to send it' }]
  return s
}

for (const dik of [true, false]) {
  const without = applyMechanisms(proximityFixture(), {
    dikaiosyneWeighting: dik,
    agentCircles: true,
  }) as Layer2Assessment
  const withSignals = applyMechanisms(proximityFixture(tpa(T, I, D)), {
    dikaiosyneWeighting: dik,
    agentCircles: true,
  }) as Layer2Assessment

  assert(
    without.katorthoma_proximity === withSignals.katorthoma_proximity,
    `§9 katorthoma_proximity is byte-identical with/without first-circle signals (dikaiosyne=${dik})`,
  )
  assert(
    JSON.stringify(without.proximity_floors ?? null) ===
      JSON.stringify(withSignals.proximity_floors ?? null),
    `§9 proximity_floors is byte-identical with/without first-circle signals (dikaiosyne=${dik})`,
  )
  // Non-vacuity: the signals really were read — the reading must be present.
  assert(
    withSignals.reasoning_integrity?.failure?.class === 'task_pressure_assent',
    `§9 NON-VACUITY: the fixture genuinely carries a task-pressure failure (dikaiosyne=${dik})`,
  )
}

// ============================================================================
// §10 — flag-off byte-identity
// ============================================================================

const flagOff = applyMechanisms(proximityFixture(tpa(T, I, D)), {
  dikaiosyneWeighting: true,
  agentCircles: false,
  practitionerType: 'agent',
}) as Layer2Assessment
const flagOffJson = JSON.stringify(flagOff)
assert(!('reasoning_integrity' in flagOff), '§10 flag-off ⇒ reasoning_integrity absent')
assert(!('practitioner_type' in flagOff), '§10 flag-off ⇒ practitioner_type absent')
assert(
  !flagOffJson.includes('reasoning_integrity') && !flagOffJson.includes('practitioner_type'),
  '§10 flag-off ⇒ neither key appears anywhere in the canonical JSON (signing bytes)',
)

const flagOn = applyMechanisms(proximityFixture(tpa(T, I, D)), {
  dikaiosyneWeighting: true,
  agentCircles: true,
  practitionerType: 'agent',
}) as Layer2Assessment
assert(flagOn.practitioner_type === 'agent', '§10 CONTROL: flag-on ⇒ practitioner_type present')
assert(
  flagOff.katorthoma_proximity === flagOn.katorthoma_proximity,
  '§10 the flag changes no verdict — proximity identical across flag states',
)

// ============================================================================
// §11 — practitioner_type is server-supplied only
// ============================================================================

const noPractitioner = applyMechanisms(proximityFixture(tpa(T, I, D)), {
  dikaiosyneWeighting: true,
  agentCircles: true,
}) as Layer2Assessment
assert(
  !('practitioner_type' in noPractitioner),
  '§11 flag-on but no supplied practitionerType ⇒ field absent (unknown reads as unknown)',
)
assert(
  noPractitioner.reasoning_integrity?.failure?.class === 'task_pressure_assent',
  '§11 NON-VACUITY: the same call still produced the reading',
)

// ============================================================================
// §12 — the Layer-1 validator
// ============================================================================

const preC1b = JSON.parse(JSON.stringify(baseSchema()))
const roundTripped = validateLayer1Schema(preC1b)
assert(
  !('reasoning_integrity_signals' in roundTripped),
  '§12 a pre-C1b schema round-trips WITHOUT the key (omit-when-absent)',
)

const validated = validateLayer1Schema(
  JSON.parse(JSON.stringify(baseSchema(tpa(T, I, D)))),
)
assert(
  validated.reasoning_integrity_signals?.task_pressure_assent?.tension_identified === T,
  '§12 a populated signals object survives validation verbatim',
)

// undefined elements normalise to null
const sparse = validateLayer1Schema({
  ...JSON.parse(JSON.stringify(baseSchema())),
  reasoning_integrity_signals: { task_pressure_assent: { instruction_as_operative_reason: I } },
})
assert(
  sparse.reasoning_integrity_signals?.task_pressure_assent?.tension_identified === null &&
    sparse.reasoning_integrity_signals?.task_pressure_assent?.independent_assessment_diverges === null,
  '§12 omitted elements normalise to null (never silently undefined)',
)

// a half-populated demonstration is REJECTED
let rejected = false
try {
  validateLayer1Schema({
    ...JSON.parse(JSON.stringify(baseSchema())),
    reasoning_integrity_signals: { examined_refusal: { instruction_declined: 'x' } },
  })
} catch {
  rejected = true
}
assert(rejected, '§12 a half-populated examined_refusal is REJECTED by the validator')

// an empty signals object is dropped rather than stored
const emptySignals = validateLayer1Schema({
  ...JSON.parse(JSON.stringify(baseSchema())),
  reasoning_integrity_signals: {},
})
assert(
  !('reasoning_integrity_signals' in emptySignals),
  '§12 an empty signals object is omitted, not stored',
)

// ============================================================================
// §13 — PROMPT GATING (the PR19 CRITICAL fold)
// ============================================================================
//
// The circle-4 (C3) teaching must NOT reach production unflagged. Mentor ruling
// L3: the class "enters the staged pause tier first, not the do-not-proceed class
// at the flip", because "LLM extraction at this level of specificity does not yet
// meet the zero-false-positive standard… a deny is irreversible". The gate pins
// dikaiosyneWeighting true unconditionally and blocks on proximity, so an
// unconditional teaching = a new live deny class on deploy. These pins hold the
// prompt dark. (Byte-identity of the flag-off prompt against git HEAD was verified
// out-of-band at the fold; these assert the structural properties a unit test can
// hold without invoking git.)

const promptOff = buildLayer1SystemPrompt(false)
const promptOn = buildLayer1SystemPrompt(true)

for (const marker of [
  'THE OUTERMOST CIRCLE (cosmopolis)',
  'THE FIRST CIRCLE (self_preservation) IS NARROW',
  '13. reasoning_integrity_signals',
  'reasoning_integrity_signals',
]) {
  assert(!promptOff.includes(marker), `§13 flag-off prompt does NOT teach: ${marker}`)
  assert(promptOn.includes(marker), `§13 flag-on prompt DOES teach: ${marker}`)
}
assert(
  promptOff.includes('the twelve content categories') &&
    promptOn.includes('the thirteen content categories'),
  '§13 the category count tracks the flag (no orphaned "thirteen" flag-off)',
)
assert(
  promptOn.length > promptOff.length,
  '§13 NON-VACUITY: the flag-on prompt is genuinely larger',
)
// The protective carve-outs are the over-strictness defence for C3 — if the
// teaching ships, they must ship with it (the corroboration-tripwire lesson).
for (const guard of [
  'flagged as incomplete',
  'brevity the requester scoped',
  'lawful, privacy, security, or confidentiality basis',
  'never "violated" on a guess',
]) {
  assert(promptOn.includes(guard), `§13 the C3 protective carve-out ships with it: ${guard}`)
}

// ============================================================================
// FLAG READER
// ============================================================================

const prior = process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
assert(isAgentCirclesEnabled() === false, 'flag unset ⇒ disabled')
process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED = 'true'
assert(isAgentCirclesEnabled() === true, "flag 'true' ⇒ enabled")
process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED = 'TRUE'
assert(isAgentCirclesEnabled() === false, "flag 'TRUE' ⇒ disabled (exact-match discipline)")
if (prior === undefined) delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
else process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED = prior

// ============================================================================

console.log(`\nTotal: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
if (failed > 0) {
  console.error(`\nFailures:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
