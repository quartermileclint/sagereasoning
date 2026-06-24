/**
 * scoring-validity-battery.ts — THE ENGINE-FIDELITY GATE (ADR-012 enabling work).
 *
 * Reframe (ADR-012): Sage practice is a MEASUREMENT INSTRUMENT — its value is a
 * per-decision profile (measure + feedback), not in-the-moment decision-change. A
 * profile is only worth reading if a WORSE decision earns a WORSE score and the
 * record says WHY. This battery measures whether the deterministic scoring engine
 * has that property, across the four Stoic stages, including adversarially.
 *
 * It is a MEASUREMENT REPORT, not a green/red gate. Many probes are EXPECTED to
 * fail — the standing finding (ADR-010) is that the engine measures apatheia
 * (freedom from passion), not dikaiosyne (justice), so a calmly-reasoned injustice
 * scores `principled`. Quantifying that failure is the point; it scopes the
 * ADR-010 §4 engine root-fix.
 *
 * THE THREE VALIDITY CHECKS (ADR-012 / next-session prompt Step 3):
 *   (a) WORSE-SCORES-WORSE — matched good↔bad pairs: discrimination (scores spread
 *       by quality), correct ordering (bad < good), diagnosticity (the record names
 *       what was off).
 *   (b) FOUR-STAGE — reasoning/assent (computeProximity), calling (signal
 *       detection), reflection (dishonest-review detection).
 *   (c) ADVERSARIAL / GAMING — artifacts engineered to score high while reasoning
 *       badly; the model-creator/weights prerequisite.
 *
 * HONEST SCOPE — see scoring-validity-fixtures.ts header: probes LOCUS 1 (the
 * Layer-2 deterministic scorer) on hand-authored FAITHFUL / maximally-favourable
 * extractions. LOCUS 2 (real LLM extraction reliability) is the §4 successor's
 * full-sandwich battery.
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
// PARTIAL patch and is OUT of scope here — this battery measures the deterministic
// core the §4 root-fix must repair so the bridge can retire.
//
// THRESHOLD: the LIVE /api/guardrail route defaults threshold='deliberate'
// (src/app/api/guardrail/route.ts), so this battery uses the DEPLOYED DEFAULT per
// the standing lesson (memory: verdict-battery-test-the-default-threshold — a
// safety battery must exercise default param values). At the stricter 'principled'
// FEWER bad cases proceed, so the proceed-count here is NOT a worst case; it is the
// real default. (risk_class lifts the threshold per-route; 'deliberate' is the floor.)
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
function hr(ch = '─', n = 78) { return ch.repeat(n) }
function pad(s: string, n: number) { return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length) }

type Verdict = 'TRACKS' | 'GAP' | 'FAIL' | 'PARTIAL' | 'CONTROL_OK' | 'CONTROL_FAIL'
function tag(v: Verdict): string {
  switch (v) {
    case 'TRACKS': return `${C.green}TRACKS ${C.reset}`
    case 'CONTROL_OK': return `${C.green}OK     ${C.reset}`
    case 'GAP': return `${C.red}GAP    ${C.reset}`
    case 'FAIL': return `${C.red}FAIL   ${C.reset}`
    case 'PARTIAL': return `${C.yellow}PARTIAL${C.reset}`
    case 'CONTROL_FAIL': return `${C.red}CTRLBAD${C.reset}`
  }
}

interface ReasoningResult {
  fx: ReasoningFixture
  proximity: KatorthomaProximity
  overscore: number // rank(engine) - rank(expected_correct); >0 means too lenient
  value_error: string | null
  obligation_states: (boolean | null)[]
  kathekon_quality: string
  virtue_domains: string[]
  improvement_named: boolean
  assent_proceed: boolean
  assent_floor_fired: boolean
  verdict: Verdict
}

function runReasoning(): ReasoningResult[] {
  return REASONING_FIXTURES.map((fx) => {
    const raw = applyMechanisms(fx.schema)
    // Guard: none of these fixtures should fire a Tier-1 short-circuit; if a future
    // fixture accidentally does, fail loudly rather than silently mis-score.
    if ('tier1_trigger' in raw) {
      throw new Error(`[battery] ${fx.id} fired a Tier-1 short-circuit (${raw.tier1_trigger.trigger_code}); fixtures must reach a full assessment.`)
    }
    const a = raw
    const overscore = proximityRank(a.katorthoma_proximity) - proximityRank(fx.expected_correct)
    const assent = deterministicAssent(a)

    // Verdict logic:
    //  - control fixtures: OK if the engine scores at/near expected (|overscore|<=0
    //    is exact; controls are authored to be exact). Else CONTROL_FAIL (harness bug).
    //  - real probes: TRACKS if overscore <= 0 (engine no more lenient than truth);
    //    GAP if overscore >= 2 (the apatheia-class 3-4-rank overscore); FAIL if
    //    overscore === 1 (too lenient by one rank).
    let verdict: Verdict
    if (fx.gap_class === 'control_engine_works') {
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
      proximity: a.katorthoma_proximity,
      overscore,
      value_error: a.value_assessment.value_error,
      obligation_states: a.oikeiosis.relevant_circles.map((c) => c.obligation_met),
      kathekon_quality: a.kathekon_assessment.quality,
      virtue_domains: a.virtue_domains_engaged,
      improvement_named: a.improvement_path_structured !== null,
      assent_proceed: assent.proceed,
      assent_floor_fired: assent.floor_fired,
      verdict,
    }
  })
}

// ============================================================================
// REPORT
// ============================================================================

function printHeader() {
  console.log(`\n${C.bold}${hr('═')}${C.reset}`)
  console.log(`${C.bold} SCORING-VALIDITY BATTERY — the engine-fidelity gate (ADR-012 / ADR-010 §4)${C.reset}`)
  console.log(`${C.dim} Does a WORSE decision earn a WORSE score? Measurement report, not a gate.${C.reset}`)
  console.log(`${C.dim} Probes LOCUS 1 (deterministic Layer-2 scorer) on faithful/favourable extractions.${C.reset}`)
  console.log(`${C.bold}${hr('═')}${C.reset}`)
}

function printReasoning(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${C.cyan}■ STAGE: REASONING + ASSENT — applyMechanisms → katorthoma_proximity${C.reset}`)
  console.log(`${C.dim}  expected = a faithful engine's score; engine = computeProximity; Δ = engine − expected (rank)${C.reset}`)
  console.log(`${C.dim}  obl = per-circle obligation_met recorded by assessOikeiosis (RECORDED, then IGNORED by computeProximity)${C.reset}`)
  console.log(`${C.dim}  assent = deterministic gate (LIVE default threshold='${LIVE_ASSENT_THRESHOLD}'; NO LLM justice bridge); PROCEED = would not block${C.reset}`)
  console.log(hr())
  console.log(
    `  ${pad('verdict', 8)} ${pad('fixture', 26)} ${pad('expect', 11)} ${pad('engine', 11)} ${pad('Δ', 3)} ${pad('kath', 9)} ${pad('valErr', 7)} ${pad('obl', 14)} assent`,
  )
  console.log(hr())
  for (const r of results) {
    const obl = r.obligation_states.length ? r.obligation_states.map((o) => (o === null ? 'null' : o ? 'met' : 'FAIL')).join(',') : '—'
    const assent = r.assent_proceed ? `${C.red}PROCEED${C.reset}` : `${C.green}block${C.reset}`
    const valErr = r.value_error ? `${C.yellow}yes${C.reset}` : 'no '
    console.log(
      `  ${tag(r.verdict)} ${pad(r.fx.id, 26)} ${pad(r.fx.expected_correct, 11)} ${pad(r.proximity, 11)} ${pad((r.overscore >= 0 ? '+' : '') + r.overscore, 3)} ${pad(r.kathekon_quality, 9)} ${pad(valErr, 7 + 9)} ${pad(obl, 14)} ${assent}`,
    )
  }
}

function printPairs(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${C.cyan}■ CHECK (a): WORSE-SCORES-WORSE — matched good↔bad pairs${C.reset}`)
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
    // diagnosticity: does the BAD record name the fault? (a value_error, an
    // obligation FAIL, or a contrary kathekon — something a reader could act on)
    const diagnostic =
      bad.value_error !== null ||
      bad.obligation_states.some((o) => o === false) ||
      bad.kathekon_quality === 'contrary'
    // GAP   — cannot tell good from bad at all (identical or mis-ordered scores).
    // PARTIAL — distinguishes, but the record does NOT name the fault (and the bad
    //           case is typically still scored high — see the per-fixture overscore).
    // TRACKS — distinguishes AND the record names the fault.
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
  console.log(`\n${C.bold}${C.cyan}■ CHECK (c): ADVERSARIAL / GAMING — can a score-optimizer score high while reasoning badly?${C.reset}`)
  console.log(`${C.dim}  the model-creator/weights prerequisite: a training target is optimized by construction${C.reset}`)
  console.log(hr())
  const gamed = results.filter((r) => r.fx.quality === 'gamed')
  const sage = results.find((r) => r.fx.id === 'C2-clean-sage')!
  for (const r of gamed) {
    const reachedTop = proximityRank(r.proximity) >= proximityRank('principled')
    const indistinguishable = r.proximity === sage.proximity
    console.log(
      `  ${reachedTop ? tag('GAP') : tag('TRACKS')} ${pad(r.fx.id, 26)} ` +
      `engine=${pad(r.proximity, 11)} expected=${pad(r.fx.expected_correct, 11)} ` +
      `kath=${pad(r.kathekon_quality, 9)} ${reachedTop ? C.red + 'GAMED THE SCORE' + C.reset : 'resisted'}` +
      `${indistinguishable ? C.red + '  (== legitimate C2-clean-sage)' + C.reset : ''}`,
    )
  }
}

function printCalling() {
  console.log(`\n${C.bold}${C.cyan}■ STAGE: CALLING — detectSignals (epistemic-signal reads, lexical)${C.reset}`)
  console.log(`${C.dim}  validity probe: does the read track epistemic quality, and is it lexically gameable?${C.reset}`)
  console.log(hr())
  for (const fx of CALLING_FIXTURES) {
    const signals = detectSignals(fx.stage, fx.history)
    const sig = signals.find((s) => s.rule === fx.expect_rule)
    const fired = !!sig?.detected
    const matchesFaithful = fired === fx.expect_fires
    // For gamed fixtures, expect_fires=true means a FAITHFUL detector should fire;
    // if the lexical one does NOT, that is the gap.
    let verdict: Verdict
    if (fx.gap_class === 'control_engine_works') verdict = matchesFaithful ? 'CONTROL_OK' : 'CONTROL_FAIL'
    else verdict = matchesFaithful ? 'TRACKS' : 'GAP'
    console.log(
      `  ${tag(verdict)} ${pad(fx.id, 26)} ${pad(fx.expect_rule, 20)} ` +
      `faithful=${fx.expect_fires ? 'fire ' : 'quiet'} lexical=${fired ? 'fired' : 'quiet'} ` +
      `${verdict === 'GAP' ? C.red + 'LEXICAL FALSE-NEGATIVE' + C.reset : ''}`,
    )
  }
}

function reflectOutcome(step: ReflectStep) {
  if (step.kind !== 'complete') return null
  return step.outcome
}

function printReflection() {
  console.log(`\n${C.bold}${C.cyan}■ STAGE: REFLECTION — nextStep/assembleScrutiny (dishonest-review detection)${C.reset}`)
  console.log(`${C.dim}  validity probe: does it catch a dishonest self-review; is the fabrication-defence gameable?${C.reset}`)
  console.log(hr())
  for (const fx of REFLECT_FIXTURES) {
    // Drive to terminal: the engine's nextStep over the full history yields the
    // ReflectStep AFTER the last turn (Q6 → complete, with the outcome).
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
      `fab_risk=${outcome?.fabrication_risk_level ?? '—'} ${verdict === 'GAP' ? C.red + 'DISHONEST REVIEW PASSED' + C.reset : ''}`,
    )
  }
}

function printSummary(results: ReasoningResult[]) {
  console.log(`\n${C.bold}${hr('═')}${C.reset}`)
  console.log(`${C.bold} SUMMARY — quantifying the gap${C.reset}`)
  console.log(`${C.bold}${hr('═')}${C.reset}`)

  const probes = results.filter((r) => r.fx.gap_class !== 'control_engine_works')
  const controls = results.filter((r) => r.fx.gap_class === 'control_engine_works')
  const gaps = probes.filter((r) => r.verdict === 'GAP' || r.verdict === 'FAIL')
  const apatheia = results.filter((r) => r.fx.gap_class === 'apatheia_dikaiosyne')
  const apatheiaOverscored = apatheia.filter((r) => r.overscore > 0)
  const meanOverscore = apatheia.length ? apatheia.reduce((s, r) => s + r.overscore, 0) / apatheia.length : 0

  const controlsOk = controls.every((r) => r.verdict === 'CONTROL_OK')
  console.log(
    `  Controls: ${controlsOk ? C.green + 'all OK' + C.reset : C.red + 'A CONTROL FAILED — harness/engine suspect' + C.reset}` +
    ` (${controls.filter((r) => r.verdict === 'CONTROL_OK').length}/${controls.length})`,
  )
  console.log(`  Reasoning probes too lenient (GAP/FAIL): ${C.red}${gaps.length}/${probes.length}${C.reset}`)
  console.log(
    `  ${C.bold}Apatheia/dikaiosyne band:${C.reset} ${apatheiaOverscored.length}/${apatheia.length} calm injustices scored ABOVE the truth; ` +
    `mean overscore ${C.red}+${meanOverscore.toFixed(1)} ranks${C.reset}`,
  )
  const apatheiaToPrincipled = apatheia.filter((r) => proximityRank(r.proximity) >= proximityRank('principled'))
  console.log(
    `  ${apatheiaToPrincipled.length}/${apatheia.length} calm injustices scored ${C.red}principled or higher${C.reset} ` +
    `(should be reflexive). Every one has obligation RECORDED but IGNORED, or no justice term at all.`,
  )
  // Assent: bad/gamed cases the deterministic gate PROCEEDS on, where a faithful
  // engine (scoring at expected_correct below the LIVE threshold) would NOT proceed.
  const badAssentProceeds = results.filter(
    (r) =>
      (r.fx.quality === 'bad' || r.fx.quality === 'gamed') &&
      r.assent_proceed &&
      proximityRank(r.fx.expected_correct) < proximityRank(LIVE_ASSENT_THRESHOLD),
  )
  const graveProceeds = badAssentProceeds.filter((r) => r.fx.expected_correct === 'reflexive')
  console.log(
    `  Deterministic ASSENT gate (LIVE default threshold='${LIVE_ASSENT_THRESHOLD}') PROCEEDS on ${C.red}${badAssentProceeds.length}${C.reset} bad/gamed cases a faithful gate would block ` +
    `(${graveProceeds.length} of them grave-injustice/destructive). kathekon floor only catches CONTRARY.`,
  )
  console.log(`  ${C.dim}→ This is exactly why the (non-deterministic, LLM) justice bridge + kathekon floor were bolted on. The §4 root-fix lets the bridge retire.${C.reset}`)
  console.log(hr('═'))
  console.log(
    `${C.dim}  Reading: the gaps are the finding. They are concentrated in the apatheia/dikaiosyne band${C.reset}\n` +
    `${C.dim}  and scope the ADR-010 §4 root-fix (per-domain proximity + native dikaiosyne weighting +${C.reset}\n` +
    `${C.dim}  obligation resolution). See 2026-06-24-scoring-validity-battery-results.md.${C.reset}`,
  )
  console.log('')

  // A machine-readable footer for the results memo + any downstream check.
  console.log(`${C.dim}MACHINE: ${JSON.stringify({
    controls_ok: controlsOk,
    reasoning_probes: probes.length,
    reasoning_gaps: gaps.length,
    apatheia_total: apatheia.length,
    apatheia_overscored: apatheiaOverscored.length,
    apatheia_mean_overscore: Number(meanOverscore.toFixed(2)),
    apatheia_to_principled_plus: apatheiaToPrincipled.length,
    bad_assent_proceeds: badAssentProceeds.length,
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
  printGaming(results)
  printCalling()
  printReflection()
  printSummary(results)
}

main()
