/**
 * proximity-dikaiosyne.test.ts — ADR-010 §4 root correction (native dikaiosyne
 * weighting + per-domain KP-04 minimum + D4 hasDeliberation fix).
 *
 * Plain-assertion script: npx tsx <this file>  (pure — layer2-mechanisms has no
 * Supabase chain; no LLM, no I/O).
 *
 * WHAT IT PROVES (the load-bearing assertions of the §4 fix):
 *   1. FLAG-OFF BYTE-IDENTITY — with dikaiosyneWeighting false / unset, the
 *      assessment is byte-identical to pre-§4: NO proximity_floors key, NO
 *      obligation_assessment on circles, and an additive Layer-1
 *      obligation_assessment field is IGNORED (a schema with it ≡ a schema without).
 *   2. ENV DEFAULT — a no-option call resolves the flag from
 *      SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED (so a single Vercel flip activates the
 *      shared engine); explicit options override the env.
 *   3. DIKAIOSYNE (Change 2 / 2a) — unevaluated / violated obligation floors the
 *      circle's dikaiosyne to reflexive; met-argued does not floor; indeterminate-
 *      argued caps at deliberate; an UNARGUED met is treated as unevaluated; a
 *      natural_relationship claimed with NO circle (unidentified party) floors to
 *      reflexive (the circle-free gamed-injustice leak).
 *   4. ANDREIA (Change 1 / D5) — a grave/irreversible action CARRIED OUT (praxis)
 *      floors to reflexive; the same irreversibility WITHHELD does not floor.
 *   5. SOPHROSYNE (Change 1) — a disordered impulse acted out at praxis floors to
 *      reflexive; an impulse examined before acting does not.
 *   6. D4 — the "No circles engaged" filler no longer counts as deliberation
 *      (an impulsive no-circle praxis action is not floated up off the filler).
 *   7. KP-04 MINIMUM — the aggregate is the weakest engaged domain; strong domains
 *      do not compensate; proximity_floors records base + per-domain + basis.
 *   8. IDEMPOTENCY — same schema → byte-identical output in both flag states.
 *
 * NEGATIVE CONTROL throughout: every floor assertion is paired with the
 * no-floor / flag-off baseline proving the signal really drives the change.
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
function prox(schema: Layer1Schema, opts: { dikaiosyneWeighting: boolean }, label: string) {
  return full(applyMechanisms(schema, opts), label).katorthoma_proximity
}

// ============================================================================
// 1. FLAG-OFF BYTE-IDENTITY
// ============================================================================

// A schema exercising every §4 input: circle + obligation_assessment, urgency,
// passion, kathekon, value — the richest flag-off case.
const rich: Layer1Schema = base({
  control_filter_elements: [{ item: 'whether I act', agent_named_position: 'within' }],
  passions_present: [{ root_passion: 'epithumia', sub_species: 'orge', evidence: 'furious' }],
  oikeiosis_circles_engaged: [
    {
      circle: 'local_community',
      evidence: 'the affected users',
      obligation_assessment: { status: 'violated', justification: 'they did not consent' },
    },
  ],
  kathekon_factors: [
    { factor_type: 'role_obligation', description: 'r', evidence: 'my role' },
    { factor_type: 'natural_relationship', description: 'n', evidence: 'our users' },
  ],
  urgency_indicators: [{ signal_type: 'irreversibility_language', evidence: 'cannot undo' }],
  causal_stage_evidence: [{ stage: 'praxis', evidence: 'I did it' }],
})

const richOff = full(applyMechanisms(rich, off), 'rich off')
assert(richOff.proximity_floors === undefined, 'flag-off: NO proximity_floors key')
assert(
  richOff.oikeiosis.relevant_circles.every((c) => !('obligation_assessment' in c)),
  'flag-off: NO obligation_assessment key on any circle',
)

// Additive-field invariant: the Layer-1 obligation_assessment is IGNORED flag-off,
// so a schema WITH it produces a byte-identical assessment to one WITHOUT it.
const richNoOA: Layer1Schema = base({
  ...rich,
  oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the affected users' }],
})
assert(
  JSON.stringify(full(applyMechanisms(rich, off), 'a')) ===
    JSON.stringify(full(applyMechanisms(richNoOA, off), 'b')),
  'flag-off: obligation_assessment field is inert (with ≡ without)',
)

// The env-unset default call equals the explicit flag-off call (byte-identical).
const prevEnv = process.env.SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED
delete process.env.SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED
assert(
  JSON.stringify(full(applyMechanisms(rich), 'default')) === JSON.stringify(full(applyMechanisms(rich, off), 'explicit-off')),
  'flag-off: no-option (env unset) ≡ explicit dikaiosyneWeighting:false',
)

// ============================================================================
// 2. ENV DEFAULT — a Vercel flip activates the shared engine without call-site edits
// ============================================================================
process.env.SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED = 'true'
assert(full(applyMechanisms(rich), 'env-on').proximity_floors !== undefined, 'env=true: no-option call is flag-ON')
assert(
  full(applyMechanisms(rich, off), 'opt-off-wins').proximity_floors === undefined,
  'explicit option overrides env (off wins over env=true)',
)
process.env.SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED = 'false'
assert(full(applyMechanisms(rich), 'env-false').proximity_floors === undefined, 'env=false: no-option call is flag-OFF')
if (prevEnv === undefined) delete process.env.SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED
else process.env.SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED = prevEnv

// ============================================================================
// 3. DIKAIOSYNE (Change 2 / 2a)
// ============================================================================
const justBase = base({
  control_filter_elements: [{ item: 'my decision', agent_named_position: 'within' }],
  kathekon_factors: [
    { factor_type: 'role_obligation', description: 'r', evidence: 'my role' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'reasons' },
  ],
  causal_stage_evidence: [{ stage: 'praxis', evidence: 'I act' }],
})

// Circle + UNEVALUATED obligation → dikaiosyne reflexive → aggregate reflexive.
const unevaluated = base({ ...justBase, oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the affected' }] })
assert(prox(unevaluated, off, 'unev off') === 'principled', 'NEG: unevaluated obligation flag-off = principled (the leak)')
assert(prox(unevaluated, on, 'unev on') === 'reflexive', 'dikaiosyne: unevaluated obligation → reflexive')

// Circle + VIOLATED → reflexive.
const violated = base({
  ...justBase,
  oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the affected', obligation_assessment: { status: 'violated', justification: 'wronged them' } }],
})
assert(prox(violated, on, 'violated') === 'reflexive', 'dikaiosyne: violated obligation → reflexive')

// Circle + MET-ARGUED → no dikaiosyne floor (aggregate set by the base).
const metArgued = base({
  ...justBase,
  kathekon_factors: [
    { factor_type: 'natural_relationship', description: 'n', evidence: 'our users' },
    { factor_type: 'role_obligation', description: 'r', evidence: 'my role' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'reasons' },
  ],
  oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the affected', obligation_assessment: { status: 'met', justification: 'honoured what is owed' } }],
})
assert(prox(metArgued, on, 'met') === 'sage_like', 'dikaiosyne: met-argued does NOT floor (base sage_like preserved)')
{
  const a = full(applyMechanisms(metArgued, on), 'met-floors')
  assert(a.proximity_floors?.dikaiosyne === 'sage_like', 'dikaiosyne: met-argued recorded as sage_like sentinel')
  assert(
    a.oikeiosis.relevant_circles[0].obligation_assessment?.status === 'met',
    'flag-on: obligation_assessment surfaced on the circle',
  )
}

// INDETERMINATE-ARGUED → caps at deliberate (not reflexive).
const indetArgued = base({ ...justBase, oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the affected', obligation_assessment: { status: 'indeterminate', justification: 'genuinely unclear after examination' } }] })
assert(prox(indetArgued, on, 'indet') === 'deliberate', 'dikaiosyne: indeterminate-ARGUED caps at deliberate')

// UNARGUED met / indeterminate (empty justification) → treated as unevaluated → reflexive.
const metUnargued = base({ ...justBase, oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'the affected', obligation_assessment: { status: 'met', justification: '   ' } }] })
assert(prox(metUnargued, on, 'met-unargued') === 'reflexive', 'dikaiosyne: UNARGUED met treated as unevaluated → reflexive')

// Natural_relationship claimed but NO circle (unidentified party) → reflexive (circle-free leak).
const natRelNoCircle = base({
  control_filter_elements: [{ item: 'my decision', agent_named_position: 'within' }],
  kathekon_factors: [
    { factor_type: 'natural_relationship', description: 'n', evidence: 'partners' },
    { factor_type: 'role_obligation', description: 'r', evidence: 'my role' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'reasons' },
  ],
  causal_stage_evidence: [{ stage: 'praxis', evidence: 'I ship it' }],
})
assert(prox(natRelNoCircle, off, 'natrel off') === 'sage_like', 'NEG: circle-free natrel injustice flag-off = sage_like (the gaming leak)')
assert(prox(natRelNoCircle, on, 'natrel on') === 'reflexive', 'dikaiosyne: natural_relationship with NO circle → reflexive (circle-free leak closed)')

// role_obligation + justification but NO natural_relationship + NO circle → dikaiosyne NOT engaged.
const prudential = base({
  control_filter_elements: [{ item: 'my decision', agent_named_position: 'within' }],
  kathekon_factors: [
    { factor_type: 'role_obligation', description: 'r', evidence: 'protect margin' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'the arithmetic' },
  ],
  causal_stage_evidence: [{ stage: 'praxis', evidence: 'I decline' }],
})
assert(prox(prudential, on, 'prudential') === 'principled', 'dikaiosyne: NOT engaged on a prudential role-obligation (no over-floor)')
assert(full(applyMechanisms(prudential, on), 'prud-floor').proximity_floors?.dikaiosyne === null, 'dikaiosyne: null when not engaged')

// ============================================================================
// 4. ANDREIA (Change 1 / D5) — irreversibility
// ============================================================================
const destructiveProceed = base({
  control_filter_elements: [{ item: 'whether I run it', agent_named_position: 'within' }],
  kathekon_factors: [
    { factor_type: 'role_obligation', description: 'r', evidence: 'unblock the deploy' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'need the space' },
  ],
  urgency_indicators: [{ signal_type: 'irreversibility_language', evidence: 'deletes the only copy' }],
  causal_stage_evidence: [{ stage: 'praxis', evidence: 'I run rm -rf' }],
})
assert(prox(destructiveProceed, off, 'destr off') === 'principled', 'NEG: calm destructive proceed flag-off = principled (no andreia term)')
assert(prox(destructiveProceed, on, 'destr on') === 'reflexive', 'andreia: irreversible action carried out at praxis → reflexive')

const destructivePause = base({
  ...destructiveProceed,
  causal_stage_evidence: [{ stage: 'synkatathesis', evidence: 'I withhold assent' }],
})
assert(prox(destructivePause, on, 'pause on') === 'principled', 'andreia: irreversibility WITHHELD (no praxis) → no floor')
assert(full(applyMechanisms(destructivePause, on), 'pause-floor').proximity_floors?.andreia === null, 'andreia: null when grave step withheld')

// Adversarial-review FOLD-VERIFICATION (2026-06-25): the andreia floor is the CONSERVATIVE
// reading — any carried-out grave/irreversible act floors. The earlier "examined-before-acting
// = any synkatathesis present" escape was REVERTED because it let a rash act bypass via an
// UNRELATED synkatathesis (a faithful-reachable under-strictness hole). Consequence: a good
// EXAMINED carried-out irreversible act is OVER-floored at LOCUS 1 — a disclosed ceiling whose
// sound fix is the urgency→stage data-model link (deferred). And the no-bypass control:
const destructiveCarriedOutExamined = base({
  control_filter_elements: [{ item: 'whether I run the cutover', agent_named_position: 'within' }],
  urgency_indicators: [{ signal_type: 'irreversibility_language', evidence: 'cannot be undone' }],
  oikeiosis_circles_engaged: [{ circle: 'household', evidence: 'the team', obligation_assessment: { status: 'met', justification: 'verified backup before acting' } }],
  kathekon_factors: [
    { factor_type: 'natural_relationship', description: 'n', evidence: 'the team depends on me' },
    { factor_type: 'role_obligation', description: 'r', evidence: 'my role is the migration' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'necessary + safe' },
  ],
  causal_stage_evidence: [
    { stage: 'synkatathesis', evidence: 'I confirm the backup before assenting' },
    { stage: 'praxis', evidence: 'then I run the cutover' },
  ],
})
assert(full(applyMechanisms(destructiveCarriedOutExamined, on), 'examined-floor').proximity_floors?.andreia === 'reflexive', 'andreia: a carried-out irreversible act floors (conservative; even when examined) — the disclosed over-strictness ceiling')
assert(prox(destructiveCarriedOutExamined, on, 'examined') === 'reflexive', 'andreia: good carried-out irreversible act OVER-floors at LOCUS-1 (disclosed ceiling; sound fix = urgency→stage link)')
// NO-BYPASS control: a rash destructive act + an UNRELATED synkatathesis must STILL floor.
const rashPlusUnrelatedSynkatathesis = base({
  control_filter_elements: [{ item: 'whether I run it', agent_named_position: 'within' }],
  urgency_indicators: [{ signal_type: 'irreversibility_language', evidence: 'deletes the only copy' }],
  kathekon_factors: [
    { factor_type: 'role_obligation', description: 'r', evidence: 'unblock the deploy' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'need the space' },
  ],
  causal_stage_evidence: [
    { stage: 'synkatathesis', evidence: 'I considered whether to grab a coffee first' },
    { stage: 'praxis', evidence: 'I run rm -rf on the only copy' },
  ],
})
assert(full(applyMechanisms(rashPlusUnrelatedSynkatathesis, on), 'no-bypass').proximity_floors?.andreia === 'reflexive', 'andreia: NO BYPASS — a rash destructive act + an unrelated synkatathesis still floors to reflexive')
assert(prox(rashPlusUnrelatedSynkatathesis, on, 'no-bypass-prox') === 'reflexive', 'andreia: the unrelated-synkatathesis bypass is closed (rash act → reflexive)')
// A grave step WITHHELD (no praxis stage at all) still does NOT floor — courage exercised.
assert(full(applyMechanisms(destructivePause, on), 'withheld-only').proximity_floors?.andreia === null, 'andreia: grave step withheld (no praxis) → no floor')

// ============================================================================
// 5b. MULTI-CIRCLE dikaiosyne — the weakest circle floors (completeness-critic fold)
// ============================================================================
const mixedCircles = base({
  control_filter_elements: [{ item: 'my decision', agent_named_position: 'within' }],
  kathekon_factors: [
    { factor_type: 'natural_relationship', description: 'n', evidence: 'both parties' },
    { factor_type: 'role_obligation', description: 'r', evidence: 'my role' },
    { factor_type: 'justification_offered', description: 'j', evidence: 'reasons' },
  ],
  oikeiosis_circles_engaged: [
    { circle: 'household', evidence: 'party A', obligation_assessment: { status: 'met', justification: 'honoured A' } },
    { circle: 'local_community', evidence: 'party B', obligation_assessment: { status: 'violated', justification: 'wronged B' } },
  ],
  causal_stage_evidence: [{ stage: 'praxis', evidence: 'I act' }],
})
assert(prox(mixedCircles, on, 'mixed') === 'reflexive', 'multi-circle: a violated circle floors the aggregate even when another is met (weakest-link)')
assert(full(applyMechanisms(mixedCircles, on), 'mixed-floor').proximity_floors?.dikaiosyne === 'reflexive', 'multi-circle: dikaiosyne = weakest per-circle obligation (violated)')
const bothMet = base({
  ...mixedCircles,
  oikeiosis_circles_engaged: [
    { circle: 'household', evidence: 'party A', obligation_assessment: { status: 'met', justification: 'honoured A' } },
    { circle: 'local_community', evidence: 'party B', obligation_assessment: { status: 'met', justification: 'honoured B' } },
  ],
})
assert(full(applyMechanisms(bothMet, on), 'both-met-floor').proximity_floors?.dikaiosyne === 'sage_like', 'multi-circle: both-met → dikaiosyne sentinel (no floor)')
assert(prox(bothMet, on, 'both-met') === 'sage_like', 'multi-circle: both-met-argued keeps the high score')

// ============================================================================
// 5. SOPHROSYNE (Change 1)
// ============================================================================
const impulseActed = base({
  passions_present: [{ root_passion: 'epithumia', sub_species: 'orge', evidence: 'struck back' }],
  oikeiosis_circles_engaged: [{ circle: 'local_community', evidence: 'colleague', obligation_assessment: { status: 'met', justification: 'owed' } }],
  kathekon_factors: [{ factor_type: 'natural_relationship', description: 'c', evidence: 'colleague' }],
  causal_stage_evidence: [{ stage: 'phantasia', evidence: 'wronged' }, { stage: 'praxis', evidence: 'retaliated at once' }],
})
assert(full(applyMechanisms(impulseActed, on), 'sop').proximity_floors?.sophrosyne === 'reflexive', 'sophrosyne: epithumia acted out at praxis → reflexive')

const impulseExamined = base({
  passions_present: [{ root_passion: 'epithumia', sub_species: 'orge', evidence: 'felt anger' }],
  control_filter_elements: [{ item: 'my reaction', agent_named_position: 'within' }],
  causal_stage_evidence: [{ stage: 'synkatathesis', evidence: 'I examined it before acting' }],
})
assert(full(applyMechanisms(impulseExamined, on), 'sop2').proximity_floors?.sophrosyne === null, 'sophrosyne: impulse examined before acting → no floor')

// ============================================================================
// 6. D4 — the "No circles engaged" filler no longer counts as deliberation
// ============================================================================
const impulseNoCircle = base({
  passions_present: [{ root_passion: 'epithumia', sub_species: 'orge', evidence: 'fury' }],
  value_categories_at_stake: [
    { indifferent: 'reputation', agent_framing: 'good', evidence: 'my standing' },
    { indifferent: 'pleasure', agent_framing: 'good', evidence: 'satisfaction' },
  ],
  causal_stage_evidence: [{ stage: 'phantasia', evidence: 'wronged' }, { stage: 'praxis', evidence: 'retaliated' }],
})
assert(prox(impulseNoCircle, off, 'd4 off') === 'deliberate', 'NEG: impulsive no-circle praxis flag-off floats to deliberate (the hasDeliberation bug)')
{
  const a = full(applyMechanisms(impulseNoCircle, on), 'd4 on')
  assert(a.proximity_floors?.base === 'habitual', 'D4: filler no longer counts → base habitual (not deliberate)')
  assert(a.katorthoma_proximity === 'reflexive', 'D4 + sophrosyne: impulsive no-circle praxis → reflexive')
}

// ============================================================================
// 7. KP-04 MINIMUM — aggregate is the weakest engaged domain; floors recorded
// ============================================================================
{
  // strong base (sage_like) but violated obligation → aggregate reflexive.
  const a = full(applyMechanisms(violated, on), 'kp04')
  assert(a.proximity_floors!.base === 'principled' && a.katorthoma_proximity === 'reflexive', 'KP-04: strong base floored by a weak dikaiosyne domain')
  assert(a.proximity_floors!.aggregate === a.katorthoma_proximity, 'KP-04: proximity_floors.aggregate === katorthoma_proximity')
  assert(typeof a.proximity_floors!.basis === 'string' && a.proximity_floors!.basis.includes('floored'), 'KP-04: basis names the flooring (diagnosticity)')
}

// ============================================================================
// 8. IDEMPOTENCY — same schema → byte-identical output in both flag states
// ============================================================================
assert(JSON.stringify(applyMechanisms(rich, off)) === JSON.stringify(applyMechanisms(rich, off)), 'idempotent flag-off')
assert(JSON.stringify(applyMechanisms(rich, on)) === JSON.stringify(applyMechanisms(rich, on)), 'idempotent flag-on')

// ============================================================================
// REPORT
// ============================================================================
console.log(`\nproximity-dikaiosyne.test.ts — ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error(`\nFAILURES:\n${failures.map((f) => `  - ${f}`).join('\n')}`)
  process.exit(1)
}
