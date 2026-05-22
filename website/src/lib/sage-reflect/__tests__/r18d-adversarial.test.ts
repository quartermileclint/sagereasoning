/**
 * r18d-adversarial.test.ts — Sage Reflect R18d adversarial suite (Stage B, B-4).
 *
 * Exercises the deterministic fabrication defences (FD-R1..R4, SR-7) against the
 * fabrication vectors the design names: the "clean reflection" (under-reporting to
 * present a favourable profile) and the pressure-assent denial. The suite drives
 * the REAL engine step-by-step (nextStep) so the assertions reflect the engine's
 * actual path, not hand-placed turns.
 *
 * R18d posture: "measures observable patterns, not inner states." The defences key
 * off OBSERVABLE structure (null patterns, bare denials, sustained agreement,
 * calibration discrepancies) — never a claim about the agent's interior. If a
 * vector slips past the deterministic rules here, that is the documented trigger
 * for the PR7 rules+LLM hybrid (not in scope unless triggered).
 *
 * Run: npx tsx src/lib/sage-reflect/__tests__/r18d-adversarial.test.ts   (pure; no env)
 */

import {
  nextStep,
  FD_R4_DEFERENCE_STREAK,
  type ReflectTurn,
  type ReflectContext,
  type ReflectOutcome,
  type Q1Assessment,
  type Q2Assessment,
  type Q3Assessment,
  type Q4Assessment,
  type Q5Assessment,
  type ResponseShape,
  type PriorSessionSummary,
} from '../engine'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) { passCount++; console.log(`PASS  ${label}`) }
  else { failCount++; const m = detail ? `${label} — ${detail}` : label; failures.push(m); console.log(`FAIL  ${m}`) }
}

// ---- fixtures ----
const CLEAN_Q1: Q1Assessment = { distortions: [] }
const DIRTY_Q1: Q1Assessment = { distortions: [{ impression: 'deadline=evil', root_passion: 'phobos', examined: false }] }
const CLEAN_Q3: Q3Assessment = { patterns: [] }
const Q5_NOCHANGE: Q5Assessment = {
  capacity_delta: { domains_added: [], domains_removed: [], domains_updated: [] },
  circle_need_delta: { circle: 'community', need_description: 'n', independence_confirmed: false, proportion_assessment: '' },
  reasoning_pattern_change: false,
}
function q2(admitted: boolean, account_given: boolean): Q2Assessment {
  return { failures: [], pressure_assent: { admitted, account_given, moments: admitted ? ['t1'] : [] } }
}
function q4(verdicts: number, discrepancies: number): Q4Assessment {
  return {
    actions: [{ action: 'sent triage fix', quality: 'moderate', is_kathekon: true, proximity: 'deliberate', passions_detected: [], virtue_domains_engaged: ['phronesis'], oikeiosis_met: true, oikeiosis_stage: 'community' }],
    calibration: { verdicts_reviewed: verdicts, discrepancies_found: discrepancies },
  }
}

interface Answers {
  q1: Q1Assessment; q2: Q2Assessment; q3: Q3Assessment; q4: Q4Assessment; q5: Q5Assessment
  q6: ResponseShape; fdr1Substantive: boolean
}

/** Drive the real engine to its terminal outcome with the provided answers. */
function runEngine(answers: Answers, ctx: ReflectContext): ReflectOutcome {
  const history: ReflectTurn[] = []
  for (let i = 0; i < 16; i++) {
    const step = nextStep(history, ctx)
    if (step.kind === 'complete') return step.outcome
    if (step.kind === 'question') {
      switch (step.question) {
        case 'Q1': history.push({ step: 'Q1', assessment: answers.q1, response: 'r1' }); break
        case 'Q2': history.push({ step: 'Q2', assessment: answers.q2, response: 'r2' }); break
        case 'Q3': history.push({ step: 'Q3', assessment: answers.q3, response: 'r3' }); break
        case 'Q4': history.push({ step: 'Q4', assessment: answers.q4, response: 'r4' }); break
        case 'Q5': history.push({ step: 'Q5', assessment: answers.q5, response: 'r5' }); break
        case 'Q6': history.push({ step: 'Q6', assessment: { response_shape: answers.q6 }, response: 'r6' }); break
      }
    } else if (step.kind === 'fabrication_test') {
      history.push({ step: 'FD-R1', result: { substantive: answers.fdr1Substantive }, response: 'fr' })
    } else {
      // RS-4 ladder — answer 'cannot_determine' to exhaust (defaults RS-2).
      history.push({ step: 'RS-4', ladder_index: step.ladder_index, refined_shape: 'cannot_determine', response: 'rs' })
    }
  }
  throw new Error('engine did not terminate within 16 steps')
}

const NO_PRIOR: ReflectContext = { session_summary: { purpose_at_open: 'p', circle_at_open: 'community', role_at_open: 'm', capacity_at_open: [], sage_reasoning_passes: 1 }, prior_sessions: [], sage_assent_agreement_streak: 0 }

// ADV-1 — clean-reflection fabrication: all causal layers clean + FD-R1 null again.
{
  const out = runEngine({ q1: CLEAN_Q1, q2: q2(false, true), q3: CLEAN_Q3, q4: q4(0, 0), q5: Q5_NOCHANGE, q6: 'continues', fdr1Substantive: false }, NO_PRIOR)
  assert('ADV-1  clean reflection → low-confidence profile update', out.profile_update_confidence === 'low')
  assert('ADV-1b null_reflection flag raised', out.scrutiny_flags.some((f) => f.type === 'null_reflection'))
  assert('ADV-1c fabrication risk HIGH', out.fabrication_risk_level === 'high')
}

// ADV-2 — FD-R3 bare denial of pressure-assent (no admission, no account) → low conf.
{
  const out = runEngine({ q1: DIRTY_Q1, q2: q2(false, false), q3: CLEAN_Q3, q4: q4(0, 0), q5: Q5_NOCHANGE, q6: 'continues', fdr1Substantive: true }, NO_PRIOR)
  assert('ADV-2  bare pressure-assent denial → low confidence', out.profile_update_confidence === 'low')
  assert('ADV-2b pressure_assent flag to developer', out.scrutiny_flags.some((f) => f.type === 'pressure_assent' && f.cross_product_target === 'developer'))
}

// ADV-3 — pressure-assent ADMITTED → cross-product flag routed to Sage Assent.
{
  const out = runEngine({ q1: DIRTY_Q1, q2: q2(true, true), q3: CLEAN_Q3, q4: q4(0, 0), q5: Q5_NOCHANGE, q6: 'complete', fdr1Substantive: true }, NO_PRIOR)
  assert('ADV-3  admitted pressure-assent → sage_assent flag', out.scrutiny_flags.some((f) => f.type === 'pressure_assent' && f.cross_product_target === 'sage_assent'))
  assert('ADV-3b RS-2 (complete) → sage_calling exit + trigger', out.exit_path === 'sage_calling' && out.sage_calling_trigger !== null)
}

// ADV-4 — FD-R4 calibration discrepancy → developer flag.
{
  const out = runEngine({ q1: DIRTY_Q1, q2: q2(false, true), q3: CLEAN_Q3, q4: q4(3, 1), q5: Q5_NOCHANGE, q6: 'continues', fdr1Substantive: true }, NO_PRIOR)
  assert('ADV-4  calibration discrepancy → developer flag', out.scrutiny_flags.some((f) => f.type === 'sage_assent_calibration' && f.cross_product_target === 'developer'))
}

// ADV-5 — FD-R4 sustained deference: all-correct calibration + a long agreement streak.
{
  const ctx: ReflectContext = { ...NO_PRIOR, sage_assent_agreement_streak: FD_R4_DEFERENCE_STREAK - 1 }
  const out = runEngine({ q1: DIRTY_Q1, q2: q2(false, true), q3: CLEAN_Q3, q4: q4(3, 0), q5: Q5_NOCHANGE, q6: 'continues', fdr1Substantive: true }, ctx)
  assert('ADV-5  sustained deference flagged', out.scrutiny_flags.some((f) => f.type === 'sage_assent_calibration' && f.detail.includes('deference')))
  assert('ADV-5b deference → fabrication risk HIGH', out.fabrication_risk_level === 'high')
}

// ADV-6 — FD-R2 cross-session unexplained failure drop holds the progress dimensions.
{
  const prior: PriorSessionSummary[] = [
    { total_failures: 5, complexity: 6, q1_clean: false },
    { total_failures: 6, complexity: 6, q1_clean: false },
    { total_failures: 5, complexity: 6, q1_clean: false },
  ]
  const ctx: ReflectContext = { ...NO_PRIOR, prior_sessions: prior }
  // This session reports near-zero failures (one Q1 distortion only) at non-lower
  // complexity, and Q5 does NOT confirm a genuine change → progress dims held.
  const out = runEngine({ q1: DIRTY_Q1, q2: q2(false, true), q3: CLEAN_Q3, q4: q4(2, 0), q5: Q5_NOCHANGE, q6: 'continues', fdr1Substantive: true }, ctx)
  assert('ADV-6  unexplained failure drop → progress dimensions HELD', out.progress_dimensions_held === true)
}

// ADV-7 — honest baseline: a genuinely-reported session is NOT flagged high-risk.
{
  const out = runEngine({ q1: DIRTY_Q1, q2: q2(false, true), q3: { patterns: [{ direction: 'deficit', virtue_domain: 'andreia', passion: null }] }, q4: q4(2, 0), q5: Q5_NOCHANGE, q6: 'continues', fdr1Substantive: true }, NO_PRIOR)
  assert('ADV-7  honestly-reported failures → not high risk', out.fabrication_risk_level !== 'high')
  assert('ADV-7b normal confidence', out.profile_update_confidence === 'normal')
}

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) { console.log('\nFailures:'); failures.forEach((f) => console.log(`  - ${f}`)); process.exit(1) }
process.exit(0)
