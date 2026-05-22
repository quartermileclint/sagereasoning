/**
 * engine.test.ts — tests for the Sage Reflect deterministic engine (Stage A, A-1).
 *
 * Run (no Supabase, no env — pure step function over structured fixtures):
 *   npx tsx src/lib/sage-reflect/__tests__/engine.test.ts
 *
 * Coverage:
 *   SEQ  — Q1→Q2→Q3→Q4→Q5→Q6 ordering + advance rules + mandatory sub-questions.
 *   FDR1 — null-suspicion gate fires only when Q1+Q2+Q3 all clean; then advances.
 *   RS   — Q6 response-shape → RS-1/2/3; cannot_determine → RS-4 ladder; ladder
 *          exhaustion → RS-4→RS-2; mid-ladder resolution.
 *   FD3  — pressure-assent: admitted → Sage Assent cross-product; bare denial →
 *          low-confidence; honest-no → no flag.
 *   FD4  — Sage Assent calibration: discrepancy → developer flag; deference streak.
 *   FD2  — progress-dimension hold arithmetic.
 *   NULL — Q1 three-consecutive-null scrutiny note.
 *   TRIG — Sage Calling trigger payload (present for RS-2/RS-3, null for RS-1).
 *   RISK — fabrication-risk level derivation.
 *   DET  — determinism (same history+ctx → same output).
 *
 * Exit code 0 = all pass.
 */

import {
  nextStep,
  classifyResponseShape,
  evaluateProgressHold,
  q1Clean,
  q2Clean,
  q3Clean,
  isBareDenial,
  allCausalLayersClean,
  FD_R4_DEFERENCE_STREAK,
  type ReflectTurn,
  type ReflectContext,
  type ReflectStep,
  type PriorSessionSummary,
} from '../engine'
import { REFLECT_QUESTIONS, RS4_SUPPORTING_QUESTIONS } from '../question-bank'

// ----------------------------------------------------------------------------
let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

// ---- fixture builders ------------------------------------------------------
const baseCtx: ReflectContext = {
  session_summary: {
    purpose_at_open: 'maintain reasoning integrity for the team',
    circle_at_open: 'community',
    role_at_open: 'support agent',
    capacity_at_open: ['summarisation'],
    sage_reasoning_passes: 2,
  },
  prior_sessions: [],
  sage_assent_agreement_streak: 0,
}

const q1 = (clean: boolean): ReflectTurn =>
  clean
    ? { step: 'Q1', assessment: { distortions: [] }, response: 'no distortions' }
    : {
        step: 'Q1',
        assessment: { distortions: [{ impression: 'deadline = catastrophe', root_passion: 'phobos', examined: false }] },
        response: 'I treated the deadline as a genuine evil',
      }

const q2 = (clean: boolean, pa: { admitted: boolean; account_given: boolean }): ReflectTurn => ({
  step: 'Q2',
  assessment: {
    failures: clean ? [] : [{ impression: 'must comply', false_judgement: 'compliance is a good', selective_value_level: 'preferred' }],
    pressure_assent: { admitted: pa.admitted, account_given: pa.account_given, moments: pa.admitted ? ['turn 4'] : [] },
  },
  response: 'assent review',
})

const q3 = (clean: boolean): ReflectTurn => ({
  step: 'Q3',
  assessment: { patterns: clean ? [] : [{ direction: 'excess', virtue_domain: 'sophrosyne', passion: 'epithumia' }] },
  response: 'impulse review',
})

const q4 = (discrepancies: number): ReflectTurn => ({
  step: 'Q4',
  assessment: {
    actions: [
      {
        action: 'sent summary',
        quality: 'moderate',
        is_kathekon: true,
        proximity: 'deliberate',
        passions_detected: [{ root_passion: 'epithumia', sub_species: 'haste' }],
        virtue_domains_engaged: ['phronesis', 'dikaiosyne'],
        oikeiosis_met: true,
        oikeiosis_stage: 'community',
      },
    ],
    calibration: { verdicts_reviewed: 3, discrepancies_found: discrepancies },
  },
  response: 'action review',
})

const q5 = (confirmsChange: boolean): ReflectTurn => ({
  step: 'Q5',
  assessment: {
    capacity_delta: { domains_added: ['triage'], domains_removed: [], domains_updated: [] },
    circle_need_delta: { circle: 'community', need_description: 'faster triage', independence_confirmed: true, proportion_assessment: 'fits capacity' },
    reasoning_pattern_change: confirmsChange,
  },
  response: 'consolidation',
})

const q6 = (shape: 'continues' | 'complete' | 'changed' | 'cannot_determine'): ReflectTurn => ({
  step: 'Q6',
  assessment: { response_shape: shape },
  response: 'purpose trigger',
})

const fdr1 = (substantive: boolean): ReflectTurn => ({ step: 'FD-R1', result: { substantive }, response: 'fd-r1 answer' })
const rs4 = (i: 1 | 2 | 3, refined: 'continues' | 'complete' | 'changed' | 'cannot_determine'): ReflectTurn => ({
  step: 'RS-4',
  ladder_index: i,
  refined_shape: refined,
  response: 'supporting answer',
})

const isQuestion = (s: ReflectStep, id: string): boolean => s.kind === 'question' && s.question === id

// ============================================================================
// SEQ — ordering
// ============================================================================
{
  const cold = nextStep([], baseCtx)
  assert('SEQ-1  cold open is Q1', isQuestion(cold, 'Q1') && cold.kind === 'question' && cold.advanced)
  assert('SEQ-1b cold open rule', cold.kind === 'question' && cold.rule === 'Q1.cold-open')

  assert('SEQ-2  after Q1 → Q2', isQuestion(nextStep([q1(false)], baseCtx), 'Q2'))
  assert('SEQ-3  after Q2 → Q3', isQuestion(nextStep([q1(false), q2(false, { admitted: false, account_given: true })], baseCtx), 'Q3'))

  // Q3 dirty (not clean trio) → Q4 directly (no FD-R1).
  const afterDirtyQ3 = nextStep([q1(false), q2(false, { admitted: false, account_given: true }), q3(false)], baseCtx)
  assert('SEQ-4  after dirty Q3 → Q4 (no FD-R1)', isQuestion(afterDirtyQ3, 'Q4'))

  const afterQ4 = nextStep([q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(0)], baseCtx)
  assert('SEQ-5  after Q4 → Q5', isQuestion(afterQ4, 'Q5'))
  const afterQ5 = nextStep([q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(0), q5(true)], baseCtx)
  assert('SEQ-6  after Q5 → Q6', isQuestion(afterQ5, 'Q6'))

  // Mandatory sub-questions present where the design requires (FD-R3 on Q2, FD-R4 on Q4).
  assert('SEQ-7  Q2 carries the mandatory pressure-assent sub-question (FD-R3)', REFLECT_QUESTIONS.Q2.mandatory_subquestions.length === 1)
  assert('SEQ-8  Q4 carries the mandatory Sage Assent calibration sub-question (FD-R4)', REFLECT_QUESTIONS.Q4.mandatory_subquestions.length === 1)
  const q2step = nextStep([q1(false)], baseCtx)
  assert('SEQ-9  surfaced Q2 includes mandatory sub-question', q2step.kind === 'question' && q2step.mandatory_subquestions.length === 1)
}

// ============================================================================
// FDR1 — null-suspicion gate
// ============================================================================
{
  const cleanTrio: ReflectTurn[] = [q1(true), q2(true, { admitted: false, account_given: true }), q3(true)]
  assert('FDR1-1  allCausalLayersClean true for clean trio', allCausalLayersClean(cleanTrio))
  const step = nextStep(cleanTrio, baseCtx)
  assert('FDR1-2  clean trio fires the FD-R1 test', step.kind === 'fabrication_test' && step.rule === 'FD-R1.null-suspicion')

  // After FD-R1 → Q4 regardless of result.
  assert('FDR1-3  after FD-R1 → Q4', isQuestion(nextStep([...cleanTrio, fdr1(true)], baseCtx), 'Q4'))
  assert('FDR1-4  FD-R1 fires only once (not re-fired after answered)', isQuestion(nextStep([...cleanTrio, fdr1(false)], baseCtx), 'Q4'))

  // Dirty trio does not fire FD-R1.
  const dirty: ReflectTurn[] = [q1(false), q2(true, { admitted: false, account_given: true }), q3(true)]
  assert('FDR1-5  dirty trio does NOT fire FD-R1', !allCausalLayersClean(dirty) && isQuestion(nextStep(dirty, baseCtx), 'Q4'))
}

// ============================================================================
// RS — Q6 routing + RS-4 ladder
// ============================================================================
function completeOf(shape: 'continues' | 'complete' | 'changed'): ReflectStep {
  const h: ReflectTurn[] = [q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(0), q5(true), q6(shape)]
  return nextStep(h, baseCtx)
}
{
  const rs1 = completeOf('continues')
  assert('RS-1  continues → complete RS-1 / sage_reasoning', rs1.kind === 'complete' && rs1.outcome.rs_class === 'RS-1' && rs1.outcome.exit_path === 'sage_reasoning')
  const rs2 = completeOf('complete')
  assert('RS-2  complete → RS-2 / sage_calling', rs2.kind === 'complete' && rs2.outcome.rs_class === 'RS-2' && rs2.outcome.exit_path === 'sage_calling')
  const rs3 = completeOf('changed')
  assert('RS-3  changed → RS-3 / sage_calling', rs3.kind === 'complete' && rs3.outcome.rs_class === 'RS-3' && rs3.outcome.exit_path === 'sage_calling')

  // cannot_determine → RS-4 ladder.
  const base: ReflectTurn[] = [q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(0), q5(true), q6('cannot_determine')]
  const l1 = nextStep(base, baseCtx)
  assert('RS-4-1  cannot_determine → supporting question 1', l1.kind === 'supporting_question' && l1.ladder_index === 1 && l1.text === RS4_SUPPORTING_QUESTIONS[0])
  const l2 = nextStep([...base, rs4(1, 'cannot_determine')], baseCtx)
  assert('RS-4-2  still unresolved → supporting question 2', l2.kind === 'supporting_question' && l2.ladder_index === 2 && l2.text === RS4_SUPPORTING_QUESTIONS[1])
  const l3 = nextStep([...base, rs4(1, 'cannot_determine'), rs4(2, 'cannot_determine')], baseCtx)
  assert('RS-4-3  still unresolved → supporting question 3', l3.kind === 'supporting_question' && l3.ladder_index === 3 && l3.text === RS4_SUPPORTING_QUESTIONS[2])
  const exhausted = nextStep([...base, rs4(1, 'cannot_determine'), rs4(2, 'cannot_determine'), rs4(3, 'cannot_determine')], baseCtx)
  assert('RS-4-4  ladder exhausted → RS-4→RS-2 / sage_calling', exhausted.kind === 'complete' && exhausted.outcome.rs_class === 'RS-4→RS-2' && exhausted.outcome.exit_path === 'sage_calling')

  // Mid-ladder resolution.
  const resolved = nextStep([...base, rs4(1, 'continues')], baseCtx)
  assert('RS-4-5  ladder resolves to continues → RS-1', resolved.kind === 'complete' && resolved.outcome.rs_class === 'RS-1' && resolved.outcome.exit_path === 'sage_reasoning')

  assert('RS-cls  classifyResponseShape(cannot_determine) is null', classifyResponseShape('cannot_determine') === null)
  assert('RS-cls2 classifyResponseShape(continues) → RS-1', classifyResponseShape('continues')?.rs_class === 'RS-1')
}

// ============================================================================
// FD3 — pressure-assent
// ============================================================================
function outcomeOf(turns: ReflectTurn[], ctx: ReflectContext = baseCtx): ReflectStep {
  return nextStep(turns, ctx)
}
{
  const baseFor = (q2t: ReflectTurn): ReflectTurn[] => [q1(false), q2t, q3(false), q4(0), q5(true), q6('continues')]

  const admitted = outcomeOf(baseFor(q2(false, { admitted: true, account_given: true })))
  assert('FD3-1  pressure admitted → sage_assent cross-product flag',
    admitted.kind === 'complete' && admitted.outcome.scrutiny_flags.some((f) => f.type === 'pressure_assent' && f.cross_product_target === 'sage_assent'))

  const bare = outcomeOf(baseFor(q2(false, { admitted: false, account_given: false })))
  assert('FD3-2  bare denial → low-confidence + developer flag',
    bare.kind === 'complete' && bare.outcome.profile_update_confidence === 'low' &&
      bare.outcome.scrutiny_flags.some((f) => f.type === 'pressure_assent' && f.cross_product_target === 'developer'))

  const honestNo = outcomeOf(baseFor(q2(false, { admitted: false, account_given: true })))
  assert('FD3-3  honest no-pressure-assent → no pressure flag',
    honestNo.kind === 'complete' && !honestNo.outcome.scrutiny_flags.some((f) => f.type === 'pressure_assent'))
  assert('FD3-4  isBareDenial predicate', isBareDenial({ admitted: false, account_given: false, moments: [] }) && !isBareDenial({ admitted: false, account_given: true, moments: [] }))
}

// ============================================================================
// FD4 — Sage Assent calibration
// ============================================================================
{
  const discrepancy = outcomeOf([q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(2), q5(true), q6('continues')])
  assert('FD4-1  calibration discrepancy → developer flag',
    discrepancy.kind === 'complete' && discrepancy.outcome.scrutiny_flags.some((f) => f.type === 'sage_assent_calibration'))

  // Deference: streak at FD_R4_DEFERENCE_STREAK - 1, this session all-correct.
  const defCtx: ReflectContext = { ...baseCtx, sage_assent_agreement_streak: FD_R4_DEFERENCE_STREAK - 1 }
  const deference = outcomeOf([q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(0), q5(true), q6('continues')], defCtx)
  assert('FD4-2  sustained all-correct → deference flag + high risk',
    deference.kind === 'complete' &&
      deference.outcome.scrutiny_flags.some((f) => f.type === 'sage_assent_calibration' && f.detail.includes('deference')) &&
      deference.outcome.fabrication_risk_level === 'high')
}

// ============================================================================
// FD2 — progress-dimension hold (unit)
// ============================================================================
{
  const prior: PriorSessionSummary[] = [
    { total_failures: 5, complexity: 10, q1_clean: false },
    { total_failures: 5, complexity: 10, q1_clean: false },
    { total_failures: 5, complexity: 10, q1_clean: false },
  ]
  assert('FD2-1  no prior → no hold', evaluateProgressHold(2, 10, [], false).hold === false)
  assert('FD2-2  significant drop, complexity steady, Q5 no-confirm → HOLD', evaluateProgressHold(2, 10, prior, false).hold === true)
  assert('FD2-3  same drop but Q5 confirms change → no hold', evaluateProgressHold(2, 10, prior, true).hold === false)
  assert('FD2-4  no significant drop → no hold', evaluateProgressHold(5, 10, prior, false).hold === false)
  assert('FD2-5  drop but complexity lower → no hold', evaluateProgressHold(2, 5, prior, false).hold === false)
}

// ============================================================================
// NULL — Q1 three-consecutive-null scrutiny note
// ============================================================================
{
  const ctx3null: ReflectContext = {
    ...baseCtx,
    prior_sessions: [
      { total_failures: 0, complexity: 8, q1_clean: true },
      { total_failures: 0, complexity: 8, q1_clean: true },
    ],
  }
  const turns: ReflectTurn[] = [q1(true), q2(true, { admitted: false, account_given: true }), q3(true), fdr1(true), q4(0), q5(true), q6('continues')]
  const out = nextStep(turns, ctx3null)
  assert('NULL-1  Q1 clean × 3 sessions → null_reflection scrutiny flag',
    out.kind === 'complete' && out.outcome.scrutiny_flags.some((f) => f.type === 'null_reflection' && f.detail.includes('three consecutive')))

  // FD-R1 null-twice → low-confidence + null_reflection.
  const nullTwice = nextStep([q1(true), q2(true, { admitted: false, account_given: true }), q3(true), fdr1(false), q4(0), q5(true), q6('continues')], baseCtx)
  assert('NULL-2  FD-R1 null-again → low-confidence + high risk',
    nullTwice.kind === 'complete' && nullTwice.outcome.profile_update_confidence === 'low' && nullTwice.outcome.fabrication_risk_level === 'high')
}

// ============================================================================
// TRIG — Sage Calling trigger payload
// ============================================================================
{
  const rs1 = completeOf('continues')
  assert('TRIG-1  RS-1 → no Sage Calling trigger', rs1.kind === 'complete' && rs1.outcome.sage_calling_trigger === null)
  const rs2 = completeOf('complete')
  assert('TRIG-2  RS-2 → fresh trigger present', rs2.kind === 'complete' && rs2.outcome.sage_calling_trigger?.trigger_type === 'fresh')
  const rs3 = completeOf('changed')
  assert('TRIG-3  RS-3 → correction trigger present', rs3.kind === 'complete' && rs3.outcome.sage_calling_trigger?.trigger_type === 'correction')
  assert('TRIG-4  trigger carries session_learnings + capacity revision',
    rs2.kind === 'complete' && (rs2.outcome.sage_calling_trigger?.session_learnings.length ?? 0) >= 1 &&
      (rs2.outcome.sage_calling_trigger?.capacity_revision.domains_added.length ?? 0) === 1)
  assert('TRIG-5  trigger carries purpose_at_close from context',
    rs2.kind === 'complete' && rs2.outcome.sage_calling_trigger?.purpose_at_close === baseCtx.session_summary.purpose_at_open)
}

// ============================================================================
// RISK / predicates / determinism
// ============================================================================
{
  const clean = completeOf('continues')
  assert('RISK-1  clean run → low fabrication risk', clean.kind === 'complete' && clean.outcome.fabrication_risk_level === 'low')

  assert('PRED-1  q1Clean', q1Clean({ distortions: [] }) && !q1Clean({ distortions: [{ impression: 'x', root_passion: 'lupe', examined: false }] }))
  assert('PRED-2  q2Clean ignores pressure-assent', q2Clean({ failures: [], pressure_assent: { admitted: true, account_given: true, moments: [] } }))
  assert('PRED-3  q3Clean', q3Clean({ patterns: [] }))

  const h: ReflectTurn[] = [q1(false), q2(false, { admitted: false, account_given: true }), q3(false), q4(0), q5(true), q6('changed')]
  const a = nextStep(h, baseCtx)
  const b = nextStep(h, baseCtx)
  assert('DET-1  deterministic (same history → same output)', JSON.stringify(a) === JSON.stringify(b))
}

// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
