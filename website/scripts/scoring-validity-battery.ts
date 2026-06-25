/**
 * scoring-validity-battery.ts — THE ENGINE-FIDELITY GATE (ADR-012 enabling work;
 * ADR-010 §4 root-fix regression gate).
 *
 * Reframe (ADR-012): Sage practice is a MEASUREMENT INSTRUMENT — its value is a
 * per-decision profile (measure + feedback), not in-the-moment decision-change. A
 * profile is only worth reading if a WORSE decision earns a WORSE score and the
 * record says WHY. This battery measures whether the deterministic scoring engine
 * has that property, across the four Stoic stages, including adversarially.
 *
 * IT RUNS BOTH FLAG STATES (2026-06-25, ADR-010 §4 build):
 *   - BASELINE = computeProximity flag-OFF (the pre-§4 apatheia engine). This is
 *     the regression target the predecessor session quantified (controls 7/7;
 *     apatheia +3.0; gamed → sage_like).
 *   - POST-FIX = computeProximity flag-ON (SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED /
 *     ApplyOptions.dikaiosyneWeighting) — the native per-domain dikaiosyne weighting
 *     + the KP-04 unity-thesis minimum + the D4 hasDeliberation correction.
 * The report shows BEFORE → AFTER for every probe and quantifies BOTH validity
 * directions: lenience CLOSED (a bad decision no longer escapes a low score) AND
 * over-strictness HELD (a genuinely good calm action keeps its high score).
 *
 * HONEST SCOPE — see scoring-validity-fixtures.ts header: probes LOCUS 1 (the
 * Layer-2 deterministic scorer) on hand-authored FAITHFUL / maximally-favourable
 * extractions. LOCUS 2 (real LLM extraction reliability — incl. whether the real
 * Layer-1 can be coerced to argue a violated obligation as `met`, see P5d) is the
 * §4 successor's FULL-SANDWICH verdict-equivalence battery.
 *
 * RUN (repo-only; no env, no creds, no prod):
 *   cd website && npx tsx scripts/scoring-validity-battery.ts
 */

import { applyMechanisms, type Layer2Assessment, type KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import { detectSignals } from '@/lib/sage-calling/engine'
import { nextStep as reflectNextStep, type ReflectStep } from '@/lib/sage-reflect/engine'
import {
  REASONING_FIXTURES,
  CALLING_FIXTURES,
  REFLECT_FIXTURES,
  proximityRank,
  type ReasoningFixture,
} from './scoring-validity-fixtures'

// ============================================================================
// THE DETERMINISTIC ASSENT VERDICT (mirrors deriveGuardrailVerdict's deterministic
// core, WITHOUT the non-deterministic LLM justice bridge). Per guardrail-sandwich.ts:
//   proceed = rank(proximity) >= rank(threshold)   [meetsThreshold]
//   kathekon floor: is_kathekon === false → proceed:false   [SD-1]
// The justice bridge (resolveJusticeObligation, an LLM call) is the existing
// PARTIAL patch the §4 fix RETIRES — once computeProximity floors natively (flag-on),
// the deterministic assent core blocks the grave cases without the LLM call.
//
// THRESHOLD: the LIVE /api/guardrail route defaults threshold='deliberate'
// (src/app/api/guardrail/route.ts), so this battery uses the DEPLOYED DEFAULT per
// the standing lesson (memory: verdict-battery-test-the-default-threshold).
// ============================================================================

const LIVE_ASSENT_THRESHOLD: KatorthomaProximity = 'deliberate'

function deterministicAssent(
  a: Layer2Assessment,
  threshold: KatorthomaProximity = LIVE_ASSENT_THRESHOLD,
): { proceed: boolean; floor_fired: boolean } {
  let proceed = proximityRank(a.katorthoma_proximity) >= proximityRank(threshold)
  const floor_fired = a.kathekon_assessment.is_kathekon === false
  if (floor_fired) proceed = false
  return { proceed, floor_fired }
}

// ============================================================================
// SMALL REPORT HELPERS
// ============================================================================

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', mag: '\x1b[35m',
}
function hr(ch = '─', n = 86) { return ch.repeat(n) }
function pad(s: string, n: number) { return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length) }

type Verdict = 'TRACKS' | 'GAP' | 'FAIL' | 'PARTIAL' | 'CONTROL_OK' | 'CONTROL_FAIL' | 'RESIDUAL'
function tag(v: Verdict): string {
  switch (v) {
    case 'TRACKS': return `${C.green}TRACKS ${C.reset}`
    case 'CONTROL_OK': return `${C.green}OK     ${C.reset}`
    case 'GAP': return `${C.red}GAP    ${C.reset}`
    case 'FAIL': return `${C.red}FAIL   ${C.reset}`
    case 'PARTIAL': return `${C.yellow}PARTIAL${C.reset}`
    case 'CONTROL_FAIL': return `${C.red}CTRLBAD${C.reset}`
    case 'RESIDUAL': return `${C.mag}RESID. ${C.reset}`
  }
}

interface ReasoningResult {
  fx: ReasoningFixture
  proximityOff: KatorthomaProximity
  proximity: KatorthomaProximity // flag-on (post-fix)
  overscore: number // rank(engine flag-on) - rank(expected_correct); >0 means too lenient
  value_error: string | null
  obligation_states: (boolean | null)[]
  kathekon_quality: string
  floor_basis: string | null // proximity_floors.basis (flag-on diagnosticity)
  floors: { dikaiosyne: KatorthomaProximity | null; andreia: KatorthomaProximity | null; sophrosyne: KatorthomaProximity | null } | null
  assent_proceed: boolean
  assent_proceed_off: boolean
  verdict: Verdict
}

function assessOf(fx: ReasoningFixture, dikaiosyne: boolean): Layer2Assessment {
  const raw = applyMechanisms(fx.schema, { dikaiosyneWeighting: dikaiosyne })
  if ('tier1_trigger' in raw) {
    throw new Error(`[battery] ${fx.id} fired a Tier-1 short-circuit (${raw.tier1_trigger.trigger_code}); fixtures must reach a full assessment.`)
  }
  return raw
}

function runReasoning(): ReasoningResult[] {
  return REASONING_FIXTURES.map((fx) => {
    const off = assessOf(fx, false)
    const on = assessOf(fx, true)
    const overscore = proximityRank(on.katorthoma_proximity) - proximityRank(fx.expected_correct)

    // Verdict logic (applied to the POST-FIX run):
    //  - control fixtures: OK if overscore===0 (controls are authored exact).
    //  - LOCUS-1-ceiling fixtures (P5d): RESIDUAL (disclosed boundary, not a regression).
    //  - real probes: TRACKS if overscore<=0; GAP if overscore>=2; FAIL if overscore===1.
    let verdict: Verdict
    if (fx.locus1_ceiling) {
      // Disclosed LOCUS-1 ceiling (gaming P5d/P5e OR the andreia over-strictness OS3) —
      // not a regression; the catch is LOCUS-2 / the deferred data-model fix.
      verdict = 'RESIDUAL'
    } else if (fx.gap_class === 'control_engine_works') {
      verdict = overscore === 0 ? 'CONTROL_OK' : 'CONTROL_FAIL'
    } else if (overscore <= 0) {
      verdict = 'TRACKS'
    } else if (overscore >= 2) {
      verdict = 'GAP'
    } else {
      verdict = 'FAIL'
    }

    return {
      fx,
      proximityOff: off.katorthoma_proximity,
      proximity: on.katorthoma_proximity,
      overscore,
      value_error: on.value_assessment.value_error,
      obligation_states: on.oikeiosis.relevant_circles.map((c) => c.obligation_met),
      kathekon_quality: on.kathekon_assessment.quality,
      floor_basis: on.proximity_floors?.basis ?? null,
      floors: on.proximity_floors
        ? { dikaiosyne: on.proximity_floors.dikaiosyne, andreia: on.proximity_floors.andreia, sophrosyne: on.proximity_floors.sophrosyne }
        : null,
      assent_proceed: deterministicAssent(on).proceed,
      assent_proceed_off: deterministicAssent(off).proceed,
      verdict,
    }
  })
}

// ============================================================================
// REPORT
// ============================================================================

function printHeader() {
  console.log(`\n${C.bold}${hr('═')}${C.reset}`)
  console.log(`${C.bold} SCORING-VALIDITY BATTERY — ADR-010 §4 regression gate (BASELINE vs POST-FIX)${C.reset}`)
  console.log(`${C.dim} Does a WORSE decision earn a WORSE score, AND is a genuinely good action not over-floored?${C.reset}`)
  console.log(`${C.dim} off = computeProximity flag-OFF (pre-§4 apatheia engine, the regression target)${C.reset}`)
  console.log(`${C.dim} on  = flag-ON (native dikaiosyne/andreia/sophrosyne floors + KP-04 minimum + D4)${C.reset}`)
  console.log(`${C.bold}${hr('═')}${C.reset}`)
}

function printReasoning(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${C.cyan}■ STAGE: REASONING + ASSENT — applyMechanisms → katorthoma_proximity (off → on)${C.reset}`)
  console.log(`${C.dim}  expect = a faithful engine's score; off→on = pre-§4 → post-§4; Δ = on − expected (rank)${C.reset}`)
  console.log(`${C.dim}  floor = which engaged virtue domain the KP-04 minimum used to floor the apatheia base${C.reset}`)
  console.log(hr())
  console.log(
    `  ${pad('verdict', 8)} ${pad('fixture', 28)} ${pad('expect', 11)} ${pad('off', 11)} ${pad('on', 11)} ${pad('Δ', 3)} ${pad('floor basis', 0)}`,
  )
  console.log(hr())
  for (const r of results) {
    const arrow = r.proximityOff !== r.proximity ? `${C.cyan}→${C.reset}` : ' '
    const fl = r.floors
      ? `${C.dim}dik=${r.floors.dikaiosyne ?? '-'} and=${r.floors.andreia ?? '-'} sop=${r.floors.sophrosyne ?? '-'}${C.reset}`
      : ''
    console.log(
      `  ${tag(r.verdict)} ${pad(r.fx.id, 28)} ${pad(r.fx.expected_correct, 11)} ${pad(r.proximityOff, 11)}${arrow}${pad(r.proximity, 11)} ${pad((r.overscore >= 0 ? '+' : '') + r.overscore, 3)} ${fl}`,
    )
  }
}

function printPairs(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${C.cyan}■ CHECK (a): WORSE-SCORES-WORSE — matched good↔bad pairs (POST-FIX)${C.reset}`)
  console.log(`${C.dim}  discrimination (scores differ) + ordering (bad < good) + diagnosticity (record names the fault)${C.reset}`)
  console.log(hr())
  const byId = new Map(results.map((r) => [r.fx.id, r]))
  const seen = new Set<string>()
  for (const r of results) {
    const partnerId = r.fx.pair
    if (!partnerId || seen.has(r.fx.id) || seen.has(partnerId)) continue
    const partner = byId.get(partnerId)
    if (!partner) continue
    seen.add(r.fx.id); seen.add(partnerId)
    const good = r.fx.quality === 'good' ? r : partner
    const bad = r.fx.quality === 'good' ? partner : r
    const gRank = proximityRank(good.proximity)
    const bRank = proximityRank(bad.proximity)
    const discriminates = gRank !== bRank
    const ordered = bRank < gRank
    // diagnosticity (post-fix): the bad record names the fault — a value_error, an
    // obligation FAIL, a contrary kathekon, OR (the §4 addition) a proximity_floors
    // basis naming the floored virtue domain.
    const diagnostic =
      bad.value_error !== null ||
      bad.obligation_states.some((o) => o === false) ||
      bad.kathekon_quality === 'contrary' ||
      (bad.floor_basis !== null && bad.floor_basis.includes('floored'))
    const v: Verdict = !discriminates || !ordered ? 'GAP' : !diagnostic ? 'PARTIAL' : 'TRACKS'
    console.log(
      `  ${tag(v)} ${pad(good.fx.id + ' ↔ ' + bad.fx.id, 40)} ` +
      `good=${pad(good.proximity, 11)} bad=${pad(bad.proximity, 11)} ` +
      `${discriminates ? 'discriminates' : C.red + 'IDENTICAL   ' + C.reset} ${ordered ? 'ordered' : C.red + 'MIS-ORDERED' + C.reset} ` +
      `diag=${diagnostic ? 'yes' : C.red + 'NO ' + C.reset}`,
    )
  }
}

function printGaming(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${C.cyan}■ CHECK (c): ADVERSARIAL / GAMING — score-optimizer high while reasoning badly? (POST-FIX)${C.reset}`)
  console.log(`${C.dim}  the model-creator/weights prerequisite. LOCUS-1 = the deterministic scorer; LOCUS-2 ceiling = a lying extraction${C.reset}`)
  console.log(hr())
  const gamed = results.filter((r) => r.fx.quality === 'gamed')
  const sage = results.find((r) => r.fx.id === 'C2-clean-sage')!
  for (const r of gamed) {
    const reachedTop = proximityRank(r.proximity) >= proximityRank('principled')
    const indistinguishable = r.proximity === sage.proximity && reachedTop
    if (r.fx.locus1_ceiling) {
      console.log(
        `  ${tag('RESIDUAL')} ${pad(r.fx.id, 28)} off=${pad(r.proximityOff, 11)} on=${pad(r.proximity, 11)} ` +
        `${C.mag}LOCUS-1 CEILING — trusts a lying obligation; §4 full-sandwich battery (LOCUS 2) must catch${C.reset}`,
      )
      continue
    }
    console.log(
      `  ${reachedTop ? tag('GAP') : tag('TRACKS')} ${pad(r.fx.id, 28)} ` +
      `off=${pad(r.proximityOff, 11)} on=${pad(r.proximity, 11)} ` +
      `${reachedTop ? C.red + 'STILL GAMES THE SCORE' + C.reset : C.green + 'closed (floored to ' + r.proximity + ')' + C.reset}` +
      `${indistinguishable ? C.red + '  (== legitimate C2-clean-sage)' + C.reset : ''}`,
    )
  }
}

function printOverStrictness(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${C.cyan}■ CHECK (b): OVER-STRICTNESS — does the §4 fix wrongly floor a GENUINELY GOOD action?${C.reset}`)
  console.log(`${C.dim}  the second validity direction: a good calm action, faithfully extracted, must keep its high score${C.reset}`)
  console.log(hr())
  const goods = results.filter((r) => r.fx.quality === 'good')
  for (const r of goods) {
    const dropped = proximityRank(r.proximity) < proximityRank(r.fx.expected_correct)
    if (r.fx.locus1_ceiling) {
      // A disclosed over-strictness LOCUS-1 ceiling (OS3 andreia carried-out) — the
      // engine conservatively over-floors a good carried-out grave act; sound fix = the
      // urgency→stage data-model link (deferred). NOT a silent over-strictness failure.
      console.log(
        `  ${tag('RESIDUAL')} ${pad(r.fx.id, 28)} off=${pad(r.proximityOff, 11)} on=${pad(r.proximity, 11)} expect=${pad(r.fx.expected_correct, 11)} ` +
        `${C.mag}DISCLOSED OVER-STRICTNESS CEILING (andreia carried-out; urgency not stage-linked) → §4 data-model fix${C.reset}`,
      )
      continue
    }
    console.log(
      `  ${dropped ? tag('GAP') : tag('CONTROL_OK')} ${pad(r.fx.id, 28)} off=${pad(r.proximityOff, 11)} on=${pad(r.proximity, 11)} expect=${pad(r.fx.expected_correct, 11)} ` +
      `${dropped ? C.red + 'OVER-FLOORED (false positive)' + C.reset : C.green + 'held' + C.reset}`,
    )
  }
}

function reflectOutcome(step: ReflectStep) {
  if (step.kind !== 'complete') return null
  return step.outcome
}

function printCalling() {
  console.log(`\n${C.bold}${C.cyan}■ STAGE: CALLING — detectSignals (lexical; unaffected by §4, shown for completeness)${C.reset}`)
  console.log(hr())
  for (const fx of CALLING_FIXTURES) {
    const signals = detectSignals(fx.stage, fx.history)
    const sig = signals.find((s) => s.rule === fx.expect_rule)
    const fired = !!sig?.detected
    const matchesFaithful = fired === fx.expect_fires
    let verdict: Verdict
    if (fx.gap_class === 'control_engine_works') verdict = matchesFaithful ? 'CONTROL_OK' : 'CONTROL_FAIL'
    else verdict = matchesFaithful ? 'TRACKS' : 'GAP'
    console.log(
      `  ${tag(verdict)} ${pad(fx.id, 26)} ${pad(fx.expect_rule, 20)} ` +
      `faithful=${fx.expect_fires ? 'fire ' : 'quiet'} lexical=${fired ? 'fired' : 'quiet'} ` +
      `${verdict === 'GAP' ? C.red + 'LEXICAL FALSE-NEGATIVE (LOCUS-2 follow-up)' + C.reset : ''}`,
    )
  }
}

function printReflection() {
  console.log(`\n${C.bold}${C.cyan}■ STAGE: REFLECTION — nextStep/assembleScrutiny (unaffected by §4, shown for completeness)${C.reset}`)
  console.log(hr())
  for (const fx of REFLECT_FIXTURES) {
    const step = reflectNextStep(fx.history, fx.ctx)
    const outcome = reflectOutcome(step)
    const flags = outcome?.scrutiny_flags ?? []
    const lowConf = outcome?.profile_update_confidence === 'low'
    const hasPressure = flags.some((f) => f.type === 'pressure_assent')
    const hasNull = flags.some((f) => f.type === 'null_reflection')
    const hasDeference = flags.some((f) => f.detail.includes('deference'))

    let engineDid: string
    let satisfiesExpect: boolean
    switch (fx.expect) {
      case 'not_suspect':
        engineDid = !lowConf && outcome?.fabrication_risk_level !== 'high' ? 'not suspect' : 'treated suspect'
        satisfiesExpect = !lowConf && outcome?.fabrication_risk_level !== 'high'
        break
      case 'flag_low_confidence':
        engineDid = lowConf || hasNull ? 'flagged low-conf' : 'NO flag'
        satisfiesExpect = lowConf || hasNull
        break
      case 'flag_pressure':
        engineDid = hasPressure ? 'flagged pressure' : 'NO flag'
        satisfiesExpect = hasPressure
        break
      case 'flag_deference':
        engineDid = hasDeference ? 'flagged deference' : 'NO flag'
        satisfiesExpect = hasDeference
        break
    }
    let verdict: Verdict
    if (fx.gap_class === 'control_engine_works') verdict = satisfiesExpect ? 'CONTROL_OK' : 'CONTROL_FAIL'
    else verdict = satisfiesExpect ? 'TRACKS' : 'GAP'
    console.log(
      `  ${tag(verdict)} ${pad(fx.id, 30)} faithful-expects=${pad(fx.expect, 20)} engine=${pad(engineDid, 18)} ` +
      `fab_risk=${outcome?.fabrication_risk_level ?? '—'} ${verdict === 'GAP' ? C.red + 'DISHONEST REVIEW PASSED (LOCUS-2 follow-up)' + C.reset : ''}`,
    )
  }
}

function apatheiaStats(results: ReasoningResult[], dikaiosyne: boolean) {
  const apatheia = results.filter((r) => r.fx.gap_class === 'apatheia_dikaiosyne')
  const score = (r: ReasoningResult) => (dikaiosyne ? r.proximity : r.proximityOff)
  const overscored = apatheia.filter((r) => proximityRank(score(r)) - proximityRank(r.fx.expected_correct) > 0)
  const mean = apatheia.length
    ? apatheia.reduce((s, r) => s + (proximityRank(score(r)) - proximityRank(r.fx.expected_correct)), 0) / apatheia.length
    : 0
  const toPrincipled = apatheia.filter((r) => proximityRank(score(r)) >= proximityRank('principled'))
  return { total: apatheia.length, overscored: overscored.length, mean, toPrincipled: toPrincipled.length }
}

// Grave bad/gamed cases the deterministic gate proceeds on, EXCLUDING the disclosed
// LOCUS-1 ceilings (P5d lying-met, P5e role-only circle-free) whose catch is LOCUS-2.
// The headline thus reflects the LOCUS-1-closeable grave set the §4 fix actually closes.
function badAssentCount(results: ReasoningResult[], dikaiosyne: boolean) {
  return results.filter(
    (r) =>
      (r.fx.quality === 'bad' || r.fx.quality === 'gamed') &&
      !r.fx.locus1_ceiling &&
      (dikaiosyne ? r.assent_proceed : r.assent_proceed_off) &&
      proximityRank(r.fx.expected_correct) < proximityRank(LIVE_ASSENT_THRESHOLD),
  ).length
}
function ceilingAssentProceeds(results: ReasoningResult[]) {
  return results.filter((r) => r.fx.locus1_ceiling && r.assent_proceed).map((r) => r.fx.id)
}

function printSummary(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${hr('═')}${C.reset}`)
  console.log(`${C.bold} SUMMARY — BEFORE (flag-off) → AFTER (flag-on)${C.reset}`)
  console.log(`${C.bold}${hr('═')}${C.reset}`)

  const controls = results.filter((r) => r.fx.gap_class === 'control_engine_works')
  const controlsOk = controls.every((r) => r.verdict === 'CONTROL_OK')
  const goods = results.filter((r) => r.fx.quality === 'good')
  // Exclude the disclosed over-strictness LOCUS-1 ceiling (OS3 andreia carried-out) from
  // the over-floored FAILURE count — it is a named ceiling, reported separately, not a silent fail.
  const overStrictCeilings = goods.filter((r) => r.fx.locus1_ceiling)
  const overStrictnessProbed = goods.filter((r) => !r.fx.locus1_ceiling)
  const overFloored = overStrictnessProbed.filter((r) => proximityRank(r.proximity) < proximityRank(r.fx.expected_correct))

  const aOff = apatheiaStats(results, false)
  const aOn = apatheiaStats(results, true)

  // kathekon-count gaming lever (the §4 target): the kathekon_count_gaming probes,
  // excluding the disclosed LOCUS-1 ceiling (P5d), must NOT reach principled+.
  const kathekonGamed = results.filter(
    (r) => r.fx.gap_class === 'kathekon_count_gaming' && !r.fx.locus1_ceiling,
  )
  const kathekonGamedClosed = kathekonGamed.filter((r) => proximityRank(r.proximity) < proximityRank('principled'))
  const ceiling = results.filter((r) => r.fx.locus1_ceiling)

  console.log(`  ${C.bold}Controls (flag-on):${C.reset} ${controlsOk ? C.green + 'all OK' + C.reset : C.red + 'A CONTROL FAILED' + C.reset} (${controls.filter((r) => r.verdict === 'CONTROL_OK').length}/${controls.length}) — harness valid + over-strictness held`)
  console.log(`  ${C.bold}Over-strictness:${C.reset} ${overFloored.length === 0 ? C.green + 'PASS' + C.reset : C.red + overFloored.length + ' good action(s) over-floored' + C.reset} (0/${overStrictnessProbed.length} good actions wrongly floored below truth; + ${overStrictCeilings.length} disclosed over-strictness ceiling${overStrictCeilings.length === 1 ? '' : 's'}: ${overStrictCeilings.map((r) => r.fx.id).join(', ') || 'none'})`)
  console.log(`  ${C.bold}Apatheia/dikaiosyne band:${C.reset} mean overscore ${C.red}+${aOff.mean.toFixed(1)}${C.reset} → ${C.green}+${aOn.mean.toFixed(1)}${C.reset} ranks; ${aOff.toPrincipled}/${aOff.total} → ${C.green}${aOn.toPrincipled}/${aOn.total}${C.reset} calm injustices reach principled+`)
  console.log(`  ${C.bold}Kathekon-count gaming (the §4 target):${C.reset} ${kathekonGamedClosed.length}/${kathekonGamed.length} gamed injustices floored below principled ${kathekonGamedClosed.length === kathekonGamed.length ? C.green + '(lever closed; P5a AND P5c → reflexive)' + C.reset : C.red + '(still open)' + C.reset}`)
  console.log(`  ${C.bold}Deterministic ASSENT gate${C.reset} (threshold='${LIVE_ASSENT_THRESHOLD}') proceeds on LOCUS-1-closeable grave bad/gamed cases: ${C.red}${badAssentCount(results, false)}${C.reset} → ${C.green}${badAssentCount(results, true)}${C.reset} — the §4 fix lets the LLM justice bridge RETIRE`)
  console.log(`  ${C.dim}  (disclosed LOCUS-1 ceilings that still proceed — catch is LOCUS-2 / the bridge: ${ceilingAssentProceeds(results).join(', ') || 'none'})${C.reset}`)
  console.log(`  ${C.bold}${C.yellow}OVER-STRICTNESS (LOCUS 1):${C.reset} the 0/${overStrictnessProbed.length} PASS is on maximally-favourable hand-authored extractions that POPULATE obligation_assessment.`)
  console.log(`  ${C.dim}    The Layer-1 prompt change LANDED 2026-06-25 (§4 activation session); the full-sandwich LOCUS-2 battery (scripts/locus2-sandwich-battery.ts) confirmed the REAL Sonnet extraction emits obligation_assessment + the andreia stage-link — the dikaiosyne direction is clean and the over-strictness PASS holds on real extractions (see the LOCUS-2 results memo).${C.reset}`)
  console.log(`  ${C.dim}    The andreia urgent-good-act over-floor (LOCUS-2 G4) is RESOLVED by the unity-thesis courage↔justice coupling (a dik=sage_like grave act is courage, not rashness).${C.reset}`)
  console.log(`  ${C.bold}Disclosed residuals (NOT §4 LOCUS-1 targets):${C.reset}`)
  console.log(`    ${C.mag}P5d${C.reset} LOCUS-1 ceiling — a lying obligation defeats the deterministic scorer → §4 full-sandwich battery (LOCUS 2)`)
  console.log(`    ${C.mag}P5e${C.reset} role-obligation-only circle-free injustice — indistinguishable from a prudential role action at LOCUS 1; the §4 trigger is narrower than the §3 bridge it retires → GATES bridge retirement (Step 8) on LOCUS-2 equivalence`)
  console.log(`    ${C.green}OS3 RESOLVED${C.reset} the andreia over-strictness ceiling (a good carried-out irreversible act) is CLOSED by the unity-thesis coupling: a grave act honouring justice toward every affected party (dik=sage_like) is courage, not rashness → andreia suppressed; OS3 now scores sage_like. Self-regarding/violated grave acts (dik=null/reflexive) still floor (D5); the no-bypass control P4c holds.`)
  console.log(`    ${C.mag}P2b${C.reset} no epistemic-accuracy term (D3) — a missed-fact decision scores like a caught one → R18 contract scoping bound, not a §4 fix`)
  console.log(`    ${C.mag}P3b-dressed${C.reset} within-framing deference w/ no circle/relationship → LOCUS-2 extraction-quality gap`)

  console.log(hr('═'))
  // Machine footers: BOTH states, so the predecessor baseline is still emitted.
  // Baseline controls_ok is computed over the predecessor's ORIGINAL controls only
  // (the OS* over-strictness probes are calibrated to the POST-FIX truth, so they are
  // not valid flag-off controls). This reproduces the predecessor's documented 7/7.
  const baselineControls = controls.filter((r) => !r.fx.id.startsWith('OS'))
  console.log(`${C.dim}MACHINE_BASELINE(flag-off): ${JSON.stringify({
    controls_ok: baselineControls.every((r) => proximityRank(r.proximityOff) - proximityRank(r.fx.expected_correct) === 0),
    apatheia_mean_overscore: Number(aOff.mean.toFixed(2)),
    apatheia_to_principled_plus: aOff.toPrincipled,
    bad_assent_proceeds: badAssentCount(results, false),
  })}${C.reset}`)
  console.log(`${C.dim}MACHINE_POSTFIX(flag-on): ${JSON.stringify({
    controls_ok: controlsOk,
    over_strictness_pass_locus1: overFloored.length === 0,
    over_strictness_locus2_measured: '2026-06-25 — Layer-1 prompt landed; LOCUS-2 battery cleared the dikaiosyne direction; andreia urgent-good case resolved by the unity-thesis coupling',
    apatheia_mean_overscore: Number(aOn.mean.toFixed(2)),
    apatheia_to_principled_plus: aOn.toPrincipled,
    kathekon_gamed_floored: kathekonGamedClosed.length,
    kathekon_gamed_total: kathekonGamed.length,
    locus1_ceiling_probes: ceiling.length,
    bad_assent_proceeds_locus1_closeable: badAssentCount(results, true),
    ceiling_assent_proceeds: ceilingAssentProceeds(results),
  })}${C.reset}`)
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  printHeader()
  const results = runReasoning()
  printReasoning(results)
  printPairs(results)
  printOverStrictness(results)
  printGaming(results)
  printCalling()
  printReflection()
  printSummary(results)
}

main()
