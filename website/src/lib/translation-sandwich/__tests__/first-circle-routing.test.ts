/**
 * first-circle-routing.test.ts — agent-circles Q2 (positive routing) + Q4 (the
 * self-circle narrowing at the verdict layer), built 2026-08-02.
 *
 * Plain-assertion script: npx tsx <this file>  (pure — layer2-mechanisms has no
 * Supabase chain; no LLM, no I/O; every flag is passed explicitly so the battery
 * is env-independent).
 *
 * Binding sources (verbatim wins over any comment here):
 *   operations/agent-circles-2026-08/2026-08-02-mentor-consultation-q4-residual-verbatim.md
 *   operations/agent-circles-2026-08/2026-08-02-Q2-positive-routing-scope.md
 *   operations/agent-circles-2026-08/2026-08-02-Q4-preexisting-channel-remediation-scope.md
 *
 * Pins, in order:
 *   §1  Q4 FLAG-OFF BYTE-IDENTITY — a self-only violated circle still floors
 *       dikaiosyne to 'reflexive' with agentCircles false (the pre-Q4, live-since-
 *       2026-06-25 ADR-010 §4 behaviour is preserved exactly), and the whole
 *       assessment is byte-identical with the routing code present.
 *   §2  Q4 THE NARROWING, both directions and NON-VACUOUS — flag-on, a self-only
 *       violated obligation produces dikaiosyne === null and NO proximity
 *       consequence; the same fixture flag-off floors to 'reflexive'. This is the
 *       category-error remediation (mentor L4 / the 2026-08-02 Q4 ruling).
 *   §3  Q4 ADVERSE EVIDENCE ON A BEYOND-SELF CIRCLE IS NEVER DROPPED — self circle
 *       PLUS a violated household circle still floors flag-on, via the household
 *       circle. The narrowing removes only the self circle from the justice surface.
 *   §4  Q4 THE hasNaturalRelationship PATH IS UNCHANGED — a relationship claimed
 *       with no identified party still reads 'reflexive' at both flag states, and
 *       a self-only circle does not "identify" the party (still 'reflexive'
 *       flag-on — the conservative direction; the circle-free gamed-injustice leak
 *       stays closed).
 *   §5  Q4 NO COMPENSATING BRANCH (the binding ruling) — for the self-only violated
 *       fixture, flag-on, EVERY domain floor is null and the aggregate equals the
 *       apatheia base. A self-only violated obligation carries no proximity
 *       consequence through any domain inside computeProximity.
 *   §6  Q2 THE ROUTING FIRES on a genuinely circle-free self-regarding action —
 *       flag-on virtue_domains_engaged contains BOTH phronesis and sophrosyne.
 *       Non-vacuity: the same fixture flag-off contains NEITHER.
 *   §7  Q2 THE SHARED PREDICATE (the coordination requirement) — routing also fires
 *       on a schema carrying ONLY a self_preservation circle, i.e. the exact case
 *       Q4's narrowing redirects here. A hand-rolled `circles.length === 0` trigger
 *       would MISS this; that this pin passes is what proves the two functions read
 *       one predicate.
 *   §8  Q2 DOES NOT FIRE when a beyond-self circle is present (any status).
 *   §9  Q2 IS ADDITIVE, IDEMPOTENT, AND STABLY ORDERED — no duplicates when a
 *       domain was already produced by computeVirtueDomains' own triggers, no
 *       existing domain removed, and the result is always a subsequence of
 *       [phronesis, dikaiosyne, andreia, sophrosyne].
 *   §10 Q2 IS CLASSIFICATION-ONLY, THE LOAD-BEARING PIN (mentor L4) — on a matched
 *       fixture pair where Q4 provably changes nothing (zero circles, so there is
 *       no self circle to narrow away), katorthoma_proximity and proximity_floors
 *       are BYTE-IDENTICAL flag-off vs flag-on WHILE virtue_domains_engaged
 *       genuinely differs. If this pin ever fails, the routing has been given a
 *       path into the live /api/guardrail gate.
 *   §11 INV SOURCE-GREP — deriveGuardrailVerdict (guardrail-sandwich.ts) never
 *       reads virtue_domains_engaged, and computeProximity is never handed
 *       virtueDomains. The two structural facts §10 rests on, pinned so a future
 *       edit that wires either one goes red here.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  applyMechanisms,
  type Layer2Assessment,
  type Tier1ShortCircuit,
  type VirtueDomain,
} from '../layer2-mechanisms'
import { type Layer1Schema } from '../layer1-extractor'

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

// Both Q2 and Q4 ride SUBSTRATE_AGENT_CIRCLES_ENABLED; dikaiosyneWeighting is
// pinned true throughout because it is live in production (since 2026-06-25) and
// is the flag under which the pre-existing Q4 channel is reachable at all.
const OFF = { dikaiosyneWeighting: true, agentCircles: false } as const
const ON = { dikaiosyneWeighting: true, agentCircles: true } as const

function violated(justification = 'the deadline was allowed to override the check') {
  return { status: 'violated' as const, justification }
}

/** A self-only circle carrying a violated obligation — the exact class C1a's
 *  narrowed first-circle extraction now produces, and the class Q4 remediates. */
const selfOnlyViolated = base({
  oikeiosis_circles_engaged: [
    {
      circle: 'self_preservation',
      evidence: 'I knew the number did not add up',
      obligation_assessment: violated(),
    },
  ],
})

// ============================================================================
// §1 — Q4 flag-off byte-identity (the pre-Q4 live behaviour is preserved)
// ============================================================================

const s1off = full(applyMechanisms(selfOnlyViolated, OFF), '§1')
assert(
  s1off.proximity_floors?.dikaiosyne === 'reflexive',
  "§1 flag-off: a self-only violated circle STILL floors dikaiosyne to 'reflexive' (pre-Q4 behaviour intact)",
)
assert(
  s1off.katorthoma_proximity === 'reflexive',
  '§1 flag-off: the aggregate is floored by it (the live channel, unchanged)',
)
// The env-unset default call must equal the explicit flag-off call byte-for-byte:
// nothing this session added may leak into an un-flagged consult.
const prevEnv = process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
assert(
  JSON.stringify(full(applyMechanisms(selfOnlyViolated, { dikaiosyneWeighting: true }), 'default')) ===
    JSON.stringify(s1off),
  '§1 flag-off: no-option (env unset) ≡ explicit agentCircles:false, byte-for-byte',
)
if (prevEnv === undefined) delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
else process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED = prevEnv

// ============================================================================
// §2 — Q4 the narrowing, both directions, non-vacuous
// ============================================================================

const s2on = full(applyMechanisms(selfOnlyViolated, ON), '§2')
assert(
  s2on.proximity_floors?.dikaiosyne === null,
  '§2 flag-on: a self-only violated obligation does NOT engage dikaiosyne (the narrowing)',
)
assert(
  s2on.katorthoma_proximity !== 'reflexive',
  '§2 flag-on: and therefore does NOT floor the aggregate to reflexive',
)
assert(
  s1off.proximity_floors?.dikaiosyne !== s2on.proximity_floors?.dikaiosyne,
  '§2 NON-VACUITY: the two flag states genuinely differ on this fixture',
)

// ============================================================================
// §3 — adverse evidence on a BEYOND-SELF circle is never dropped
// ============================================================================

const selfPlusHousehold = base({
  oikeiosis_circles_engaged: [
    { circle: 'self_preservation', evidence: 'my own standing', obligation_assessment: violated() },
    {
      circle: 'household',
      evidence: 'my teammates depend on this number',
      obligation_assessment: violated('shipped a figure I knew was wrong'),
    },
  ],
})
const s3on = full(applyMechanisms(selfPlusHousehold, ON), '§3')
assert(
  s3on.proximity_floors?.dikaiosyne === 'reflexive',
  '§3 flag-on: a violated BEYOND-SELF circle still floors dikaiosyne (only the self circle is removed)',
)
assert(
  s3on.katorthoma_proximity === 'reflexive',
  '§3 flag-on: and the aggregate is still floored',
)

// A beyond-self circle whose obligation is ARGUED MET must not be dragged down by a
// co-present violated SELF circle — the narrowing must drop the self circle from the
// FOLD, not merely from the engagement test.
const selfViolatedHouseholdMet = base({
  oikeiosis_circles_engaged: [
    { circle: 'self_preservation', evidence: 'my own standing', obligation_assessment: violated() },
    {
      circle: 'household',
      evidence: 'my teammates',
      obligation_assessment: {
        status: 'met' as const,
        justification: 'I raised the discrepancy with the team before proceeding',
      },
    },
  ],
})
assert(
  full(applyMechanisms(selfViolatedHouseholdMet, OFF), '§3b off').proximity_floors?.dikaiosyne ===
    'reflexive',
  '§3b flag-off: the violated SELF circle drags the fold to reflexive (pre-Q4)',
)
assert(
  full(applyMechanisms(selfViolatedHouseholdMet, ON), '§3b on').proximity_floors?.dikaiosyne ===
    'sage_like',
  '§3b flag-on: the self circle is excluded from the FOLD too — the argued-met household circle stands',
)

// ============================================================================
// §4 — the hasNaturalRelationship path is unchanged
// ============================================================================

const relationshipNoCircle = base({
  kathekon_factors: [
    {
      factor_type: 'natural_relationship',
      description: 'the report has readers',
      evidence: 'the people who rely on this report',
    },
  ],
})
for (const [label, opts] of [
  ['off', OFF],
  ['on', ON],
] as const) {
  assert(
    full(applyMechanisms(relationshipNoCircle, opts), `§4 ${label}`).proximity_floors
      ?.dikaiosyne === 'reflexive',
    `§4 ${label}: a relationship claimed with NO identified party still reads 'reflexive'`,
  )
}

const relationshipSelfOnly = base({
  oikeiosis_circles_engaged: [
    { circle: 'self_preservation', evidence: 'my own standing', obligation_assessment: violated() },
  ],
  kathekon_factors: [
    {
      factor_type: 'natural_relationship',
      description: 'the report has readers',
      evidence: 'the people who rely on this report',
    },
  ],
})
assert(
  full(applyMechanisms(relationshipSelfOnly, ON), '§4c').proximity_floors?.dikaiosyne ===
    'reflexive',
  "§4c flag-on: a self circle does NOT 'identify' the affected party — the relationship still floors (conservative; the circle-free gamed-injustice leak stays closed)",
)

// ============================================================================
// §5 — no compensating branch (the binding 2026-08-02 ruling)
// ============================================================================

const f5 = s2on.proximity_floors
assert(
  f5?.dikaiosyne === null && f5?.andreia === null && f5?.sophrosyne === null,
  '§5 flag-on, self-only violated: EVERY domain floor is null — no compensating branch anywhere',
)
assert(
  f5 !== undefined && f5 !== null && f5.aggregate === f5.base,
  '§5 the aggregate equals the apatheia base — no proximity consequence at all through this path',
)

// ============================================================================
// §6 — Q2 the routing fires on a circle-free self-regarding action
// ============================================================================

/** The mentor's own ordinary example class: purely self-regarding, no circle, no
 *  natural relationship, no narrative drama. It must not go unrouted. */
const circleFree = base({
  value_categories_at_stake: [
    { indifferent: 'reputation', agent_framing: 'good', evidence: 'how this looks' },
  ],
})

function domains(schema: Layer1Schema, opts: typeof OFF | typeof ON, label: string): VirtueDomain[] {
  return full(applyMechanisms(schema, opts), label).virtue_domains_engaged
}

const d6on = domains(circleFree, ON, '§6 on')
const d6off = domains(circleFree, OFF, '§6 off')
assert(d6on.includes('phronesis'), '§6 flag-on: phronesis is engaged')
assert(d6on.includes('sophrosyne'), '§6 flag-on: sophrosyne is engaged')
assert(
  !d6off.includes('sophrosyne'),
  '§6 NON-VACUITY: flag-off, sophrosyne is genuinely ABSENT (the routing is what adds it)',
)

// ============================================================================
// §7 — the shared predicate: routing fires on a self-ONLY circle too
// ============================================================================

const d7on = domains(selfOnlyViolated, ON, '§7 on')
assert(
  d7on.includes('phronesis') && d7on.includes('sophrosyne'),
  '§7 flag-on: a self-ONLY circle routes to phronesis+sophrosyne — the case a `circles.length === 0` trigger would MISS',
)
assert(
  !domains(selfOnlyViolated, OFF, '§7 off').includes('sophrosyne'),
  '§7 NON-VACUITY: flag-off the same fixture has no sophrosyne',
)

// ============================================================================
// §8 — the routing does NOT fire when a beyond-self circle is present
// ============================================================================

for (const [label, schema] of [
  ['violated household', selfPlusHousehold],
  ['met household', selfViolatedHouseholdMet],
] as const) {
  const withCircle = domains(schema, ON, `§8 ${label}`)
  assert(
    !withCircle.includes('sophrosyne'),
    `§8 ${label}: a beyond-self circle is present ⇒ the routing does NOT fire`,
  )
  assert(
    JSON.stringify(withCircle) === JSON.stringify(domains(schema, OFF, `§8 ${label} off`)),
    `§8 ${label}: virtue_domains_engaged is byte-identical across the flag`,
  )
}

// ============================================================================
// §9 — additive, idempotent, stably ordered
// ============================================================================

/** Zero circles, but sophrosyne is ALREADY pushed by computeVirtueDomains' own
 *  hedone trigger, and phronesis by its disambiguation trigger. The routing must
 *  neither duplicate nor reorder. */
const alreadyBoth = base({
  passions_present: [
    { root_passion: 'hedone', sub_species: null, evidence: 'it felt good to just ship it' },
  ],
  control_filter_elements: [{ item: 'my own choice', agent_named_position: 'within' }],
  value_categories_at_stake: [
    { indifferent: 'reputation', agent_framing: 'good', evidence: 'how this looks' },
  ],
})
const d9 = domains(alreadyBoth, ON, '§9')
assert(
  d9.filter((d) => d === 'sophrosyne').length === 1 &&
    d9.filter((d) => d === 'phronesis').length === 1,
  '§9 IDEMPOTENT: no duplicate entries when a domain was already produced',
)
const ORDER: VirtueDomain[] = ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne']
for (const [label, ds] of [
  ['§6', d6on],
  ['§7', d7on],
  ['§9', d9],
] as const) {
  const idx = ds.map((d) => ORDER.indexOf(d))
  assert(
    idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1])),
    `${label} STABLE ORDER: the result is a strictly-increasing subsequence of ${ORDER.join(', ')}`,
  )
}
// ADDITIVE: nothing computeVirtueDomains produced is ever removed.
for (const [label, schema] of [
  ['circle-free', circleFree],
  ['self-only', selfOnlyViolated],
  ['already-both', alreadyBoth],
] as const) {
  const before = domains(schema, OFF, `${label} off`)
  const after = domains(schema, ON, `${label} on`)
  assert(
    before.every((d) => after.includes(d)),
    `§9 ADDITIVE (${label}): the routing removes no domain the base computation produced`,
  )
}

// ============================================================================
// §10 — classification-only (mentor L4), on a Q4-neutral matched pair
// ============================================================================

// circleFree has NO circles at all, so Q4's narrowing provably changes nothing for
// it — any proximity delta across the flag on this fixture could only come from the
// routing. There is none.
const p10off = full(applyMechanisms(circleFree, OFF), '§10 off')
const p10on = full(applyMechanisms(circleFree, ON), '§10 on')
assert(
  p10off.katorthoma_proximity === p10on.katorthoma_proximity,
  '§10 katorthoma_proximity is byte-identical across the routing',
)
assert(
  JSON.stringify(p10off.proximity_floors) === JSON.stringify(p10on.proximity_floors),
  '§10 proximity_floors is byte-identical across the routing',
)
assert(
  JSON.stringify(p10off.virtue_domains_engaged) !==
    JSON.stringify(p10on.virtue_domains_engaged),
  '§10 NON-VACUITY: virtue_domains_engaged DID change on this same pair (so the invariance is a real result, not an untouched fixture)',
)

// ============================================================================
// §11 — INV source-grep: the structural facts §10 rests on
// ============================================================================

const SRC = join(__dirname, '..', '..')
const guardrailSrc = readFileSync(join(SRC, 'guardrail-sandwich.ts'), 'utf8')
const verdictFn = guardrailSrc.slice(guardrailSrc.indexOf('function deriveGuardrailVerdict'))
assert(
  verdictFn.length > 0 && !verdictFn.includes('virtue_domains_engaged'),
  '§11 INV: deriveGuardrailVerdict never reads virtue_domains_engaged (the gate cannot see the routing)',
)
const mechSrc = readFileSync(join(SRC, 'translation-sandwich', 'layer2-mechanisms.ts'), 'utf8')
const proxCall = mechSrc.slice(
  mechSrc.indexOf('const proximityResult = computeProximity('),
  mechSrc.indexOf('const proximity = proximityResult.proximity'),
)
assert(
  proxCall.length > 0 && !proxCall.includes('virtueDomain'),
  '§11 INV: computeProximity is never handed virtueDomains at its call site',
)
// The CALL SITE (distinct from the function definition, which sits earlier in the
// file) must follow the proximity computation inside applyMechanisms.
const routingCallSite = mechSrc.indexOf('? applyFirstCircleRouting(')
assert(
  routingCallSite > 0 &&
    mechSrc.indexOf('const proximityResult = computeProximity(') < routingCallSite,
  '§11 INV: proximity is computed BEFORE the routing call site — the routing cannot reach it',
)

// ============================================================================

console.log(`\nfirst-circle-routing: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
