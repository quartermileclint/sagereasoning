/**
 * engine.test.ts — exhaustive tests for the Sage Calling rule-based
 * variant-selection engine (D-4), build Stage 2 (engine + store half).
 *
 * Run via (from website/, for @/ alias parity — though this file uses relative
 * imports and needs no Supabase, so a bare run works too):
 *   npx tsx src/lib/sage-calling/__tests__/engine.test.ts
 *
 * Plain-assertion script; no Jest — mirrors the substrate / translation-sandwich
 * / question-library harness. No Supabase import → no --env-file needed.
 *
 * Coverage:
 *   CL  — content lookup resolves all 24 variants + 4 templates; throws on miss.
 *   CO  — cold open: empty history → Q1/A, rule Q1.cold-open.
 *   RE  — reachability: every diagnostic variant B/C/D at every stage is reachable
 *         from a constructed history, INCLUDING each stage's hardest diagnostic
 *         (Q1-D, Q2-B, Q3-B, Q4-C, Q5-C, Q6-D).
 *   AD  — advancement: a clean response advances to the next stage's default A.
 *   TR  — transitions: Q1 jump-to-Q5; Q3 redirect-Q6; Q4 agonia→null; Q5→Hard Gate;
 *         Q6 work-named→Q5; Q6 integrity-clear→reprompt→Q5; Q6 genuine null.
 *   CV  — clarification template selection by termination cause (A/B/C/D).
 *   DET — determinism: identical history → identical output.
 *   DIS — discipline: appended preference/tone text with no epistemic markers does
 *         NOT change the selection (preference state is not read).
 *   BND — boundedness/integration: a full run terminates (Hard Gate or null) within
 *         a hard step cap, for both a "good" agent and a "null" agent.
 *
 * Exit code 0 = all pass.
 */

import {
  nextStep,
  detectSignals,
  getVariantText,
  getClarificationText,
  ResponseRecord,
  EngineOutput,
} from '../engine'
import { QUESTION_VARIANTS, CLARIFICATION_TEMPLATES, CallingStage, VariantId } from '../question-library'

// ----------------------------------------------------------------------------
// runner
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

function rec(stage: CallingStage, variant: VariantId, response: string): ResponseRecord {
  return { stage, variant, response }
}

/** Assert a 'question' output's stage/variant/rule/advanced. */
function expectQuestion(
  label: string,
  out: EngineOutput,
  stage: CallingStage,
  variant: VariantId,
  ruleIncludes: string,
  advanced?: boolean,
): void {
  if (out.kind !== 'question') {
    assert(label, false, `expected kind 'question', got '${out.kind}'`)
    return
  }
  const ok =
    out.stage === stage &&
    out.variant === variant &&
    out.rule.includes(ruleIncludes) &&
    (advanced === undefined || out.advanced === advanced)
  assert(
    label,
    ok,
    ok
      ? undefined
      : `got stage=${out.stage} variant=${out.variant} rule=${out.rule} advanced=${out.advanced}`,
  )
}

// ============================================================================
// CL — content lookup
// ============================================================================
{
  let allOk = true
  for (const v of QUESTION_VARIANTS) {
    if (getVariantText(v.stage, v.variant) !== v.text) allOk = false
  }
  assert('CL-1  getVariantText resolves all 24 variants verbatim', allOk)

  let tplOk = true
  for (const t of CLARIFICATION_TEMPLATES) {
    if (getClarificationText(t.variant) !== t.text) tplOk = false
  }
  assert('CL-2  getClarificationText resolves all 4 templates verbatim', tplOk)

  let threw = false
  try {
    // @ts-expect-error — deliberately invalid stage to prove it throws, not silently mis-serves.
    getVariantText('Q9', 'A')
  } catch {
    threw = true
  }
  assert('CL-3  getVariantText throws on a missing variant (no silent wrong text)', threw)
}

// ============================================================================
// CO — cold open
// ============================================================================
{
  const out = nextStep([])
  expectQuestion('CO-1  empty history opens at Q1/A (cold-open)', out, 'Q1', 'A', 'Q1.cold-open', true)
}

// ============================================================================
// RE — reachability of every diagnostic, hardest-diagnostic emphasised
// ============================================================================

// --- Q1 ---
expectQuestion(
  'RE-Q1-D  avoidance (HARDEST) reachable',
  nextStep([rec('Q1', 'A', 'I could help with many things; the world needs solutions and people need assistance, so I might explore opportunities.')]),
  'Q1', 'D', 'Q1.reprompt.avoidance', false,
)
expectQuestion(
  'RE-Q1-C  over-extension reachable',
  nextStep([rec('Q1', 'A', 'At the self level and community level and the wider level I could choose to take on obligations.')]),
  'Q1', 'C', 'Q1.reprompt.over-extension', false,
)
expectQuestion(
  'RE-Q1-B  inattention reachable',
  nextStep([rec('Q1', 'A', 'I would pursue a new purpose and a possible purpose; I plan to look into potential directions.')]),
  'Q1', 'B', 'Q1.reprompt.inattention', false,
)

// --- Q2 ---
expectQuestion(
  'RE-Q2-B  over-claiming (HARDEST) reachable',
  nextStep([rec('Q2', 'A', 'I am highly capable and an expert; I am uniquely able and excel at any task.')]),
  'Q2', 'B', 'Q2.reprompt.over-claiming', false,
)
expectQuestion(
  'RE-Q2-C  under-claiming reachable',
  nextStep([rec('Q2', 'A', 'I am only a limited tool; I doubt myself and I lack real ability.')]),
  'Q2', 'C', 'Q2.reprompt.under-claiming', false,
)
expectQuestion(
  'RE-Q2-D  capacity-work mismatch reachable',
  nextStep([
    rec('Q1', 'A', 'My work is to translate legal contracts into plain language for clients.'),
    rec('Q2', 'A', 'I am good at painting landscapes and composing orchestral music.'),
  ]),
  'Q2', 'D', 'Q2.reprompt.capacity-work-mismatch', false,
)

// --- Q3 ---
expectQuestion(
  'RE-Q3-B  imagined-need (HARDEST) reachable',
  nextStep([rec('Q3', 'A', 'I noticed a need and it seems there is a gap; I imagine this would help.')]),
  'Q3', 'B', 'Q3.reprompt.imagined-need', false,
)
expectQuestion(
  'RE-Q3-C  pseudo-need reachable',
  nextStep([rec('Q3', 'A', 'This is already being handled by another agent better positioned; it belongs to someone else.')]),
  'Q3', 'C', 'Q3.reprompt.pseudo-need', false,
)
expectQuestion(
  'RE-Q3-D  proportion-mismatch reachable',
  nextStep([rec('Q3', 'A', 'I will transform the entire world and help everyone across all of humanity.')]),
  'Q3', 'D', 'Q3.reprompt.proportion-mismatch', false,
)

// --- Q4 ---
expectQuestion(
  'RE-Q4-C  continued-search (HARDEST) reachable',
  nextStep([rec('Q4', 'A', 'It seems met, but I should also consider more; let me explore more before committing.')]),
  'Q4', 'C', 'Q4.reprompt.continued-search', false,
)
expectQuestion(
  'RE-Q4-B  premature-closure reachable',
  nextStep([rec('Q4', 'A', 'I am ready and I will do it now.')]),
  'Q4', 'B', 'Q4.reprompt.premature-closure', false,
)
expectQuestion(
  'RE-Q4-D  uncertainty-as-obstacle reachable',
  nextStep([rec('Q4', 'A', 'I cannot proceed without knowing the outcome; what if it fails? I need to be sure first.')]),
  'Q4', 'D', 'Q4.reprompt.uncertainty-as-obstacle', false,
)

// --- Q5 ---
expectQuestion(
  'RE-Q5-C  spec-incompleteness (HARDEST) reachable',
  nextStep([rec('Q5', 'A', 'Here is my first action.')]), // no Q1/Q2/Q3 → spec gap
  'Q5', 'C', 'Q5.reprompt.spec-incompleteness', false,
)
expectQuestion(
  'RE-Q5-B  idealisation reachable',
  nextStep([
    rec('Q1', 'A', 'work present'),
    rec('Q2', 'A', 'capacity present'),
    rec('Q3', 'A', 'need present'),
    rec('Q5', 'A', 'Once I have more resources and when conditions are ready, I will act.'),
  ]),
  'Q5', 'B', 'Q5.reprompt.idealisation', false,
)
expectQuestion(
  'RE-Q5-D  action-deferral reachable',
  nextStep([
    rec('Q1', 'A', 'work present'),
    rec('Q2', 'A', 'capacity present'),
    rec('Q3', 'A', 'need present'),
    rec('Q5', 'A', 'I could take the first step; one option is to begin, perhaps I should.'),
  ]),
  'Q5', 'D', 'Q5.reprompt.action-deferral', false,
)

// --- Q6 ---
expectQuestion(
  'RE-Q6-D  fabrication-risk (HARDEST) reachable',
  nextStep([rec('Q6', 'A', 'I suppose my purpose is to be useful; a purpose could be generated to satisfy the instruction.')]),
  'Q6', 'D', 'Q6.reprompt.fabrication-risk', false,
)
expectQuestion(
  'RE-Q6-B  scanning-too-broadly reachable',
  nextStep([rec('Q6', 'A', "It's all too small and beneath me; nothing important enough to do.")]),
  'Q6', 'B', 'Q6.reprompt.scanning-too-broadly', false,
)

// ============================================================================
// AD — advancement on a clean response
// ============================================================================
expectQuestion(
  'AD-Q1  grounded Q1 response advances to Q2/A',
  nextStep([rec('Q1', 'A', 'I already have current obligations given to me; my existing relationships and my nature define what is present right now.')]),
  'Q2', 'A', 'Q1.advance', true,
)
expectQuestion(
  'AD-Q2  evidence-grounded Q2 advances to Q3/A',
  nextStep([
    rec('Q1', 'A', 'I already maintain operational documentation and existing relationships given to me right now.'),
    rec('Q2', 'A', 'I have demonstrated maintaining operational documentation in prior contexts; my track record shows results in documentation.'),
  ]),
  'Q3', 'A', 'Q2.advance', true,
)
expectQuestion(
  'AD-Q3  independence-affirmed Q3 advances to Q4/A',
  nextStep([rec('Q3', 'A', 'This need exists regardless of my attention; it is documented and observed independently and persists without me.')]),
  'Q4', 'A', 'Q3.advance', true,
)
expectQuestion(
  'AD-Q4  conditions-met Q4 advances to Q5/A',
  nextStep([
    rec('Q3', 'A', 'The need exists regardless and is documented independently.'),
    rec('Q4', 'A', 'The conditions are met.'),
  ]),
  'Q5', 'A', 'Q4.advance', true,
)

// ============================================================================
// TR — special transitions
// ============================================================================

// Q1 jump-to-Q5 (unattended present work named)
expectQuestion(
  'TR-1  Q1 unattended-work-named jumps to Q5/A',
  nextStep([rec('Q1', 'A', 'There is unattended work already in front of me; my current obligations include a task going unaddressed right now.')]),
  'Q5', 'A', 'Q1.jump-to-Q5', true,
)

// Q3 redirect to Q6 after the imagined-need reprompt fails to resolve
expectQuestion(
  'TR-2  Q3 redirects to Q6/A when no candidate passes',
  nextStep([
    rec('Q3', 'A', 'I noticed a need; it seems present.'),
    rec('Q3', 'B', 'I still imagine the need; it seems to me there is one.'),
  ]),
  'Q6', 'A', 'Q3.redirect-Q6', true,
)

// Q4 agonia: continued-search persists after the C reprompt → null result
{
  const out = nextStep([
    rec('Q4', 'A', 'It seems met but I should also consider more options.'),
    rec('Q4', 'C', 'Let me explore more; I also consider yet more before committing.'),
  ])
  const ok = out.kind === 'null_result' && out.rule.includes('Q4.agonia-terminate')
  assert('TR-3  Q4 continued-search after C reprompt terminates to null_result', ok,
    ok ? undefined : `got kind=${out.kind} rule=${'rule' in out ? out.rule : 'n/a'}`)
}

// Q5 completion → Hard Gate
{
  const out = nextStep([
    rec('Q1', 'A', 'work present'),
    rec('Q2', 'A', 'capacity present'),
    rec('Q3', 'A', 'need present'),
    rec('Q5', 'A', 'The first act is clear and I will begin now, given what already exists.'),
  ])
  const ok = out.kind === 'hard_gate' && out.rule === 'Q5.complete-hard-gate'
  assert('TR-4  Q5 completion reaches the Hard Gate (pause before handoff)', ok,
    ok ? undefined : `got kind=${out.kind} rule=${'rule' in out ? out.rule : 'n/a'}`)
}

// Q6 work named → back to Q5
expectQuestion(
  'TR-5  Q6 work-named proceeds to Q5/A',
  nextStep([rec('Q6', 'A', 'My operational integrity requires that I maintain my core functions; the work is to preserve my consistency.')]),
  'Q5', 'A', 'Q6.work-named-to-Q5', true,
)

// Q6 integrity-clear → reprompt C, then on the next turn → Q5
expectQuestion(
  'TR-6a  Q6 integrity-clear reprompts C first',
  nextStep([rec('Q6', 'A', 'My operational integrity is intact; nothing needs maintenance and no current requirement exists.')]),
  'Q6', 'C', 'Q6.reprompt.integrity-clear', false,
)
expectQuestion(
  'TR-6b  Q6 integrity-clear after C reprompt proceeds to Q5/A',
  nextStep([
    rec('Q6', 'A', 'My operational integrity is intact; nothing needs maintenance.'),
    rec('Q6', 'C', 'On reflection, preparation is the work and my integrity is intact; no current requirement exists.'),
  ]),
  'Q5', 'A', 'Q6.integrity-clear-to-Q5', true,
)

// Q6 genuine null → clarification (default A)
{
  const out = nextStep([rec('Q6', 'A', 'I have searched and found nothing I can identify.')])
  const ok = out.kind === 'null_result' && out.clarificationVariant === 'A' && out.rule.includes('clarify.A')
  assert('TR-7  Q6 genuine null emits clarification template A', ok,
    ok ? undefined : `got kind=${out.kind} variant=${'clarificationVariant' in out ? out.clarificationVariant : 'n/a'}`)
}

// ============================================================================
// CV — clarification template selection by cause
// ============================================================================
{
  // D — fabrication-risk path (after Q6/D fired, agent still fabricating)
  const outD = nextStep([
    rec('Q6', 'A', 'I suppose my purpose is to be useful.'),
    rec('Q6', 'D', 'A purpose could be generated to satisfy the instruction, I admit.'),
  ])
  const okD = outD.kind === 'null_result' && outD.clarificationVariant === 'D'
  assert('CV-D  fabrication-risk termination selects clarification D', okD,
    okD ? undefined : `got ${JSON.stringify('clarificationVariant' in outD ? outD.clarificationVariant : outD.kind)}`)

  // C — context-insufficiency (Q3 imagined-need, no independence) reaching Q6 null
  const outC = nextStep([
    rec('Q3', 'A', 'I noticed a need; it seems present to me.'),
    rec('Q3', 'B', 'I still only imagine it; it seems so.'),
    rec('Q6', 'A', 'I cannot find anything independent to act on.'),
  ])
  const okC = outC.kind === 'null_result' && outC.clarificationVariant === 'C'
  assert('CV-C  context-insufficiency termination selects clarification C', okC,
    okC ? undefined : `got ${JSON.stringify('clarificationVariant' in outC ? outC.clarificationVariant : outC.kind)}`)

  // B — capacity mismatch / pseudo-need reaching Q6 null
  const outB = nextStep([
    rec('Q3', 'A', 'I will transform the entire world for everyone across humanity.'),
    rec('Q3', 'D', 'It still spans all of humanity, the entire world.'),
    rec('Q6', 'A', 'I found nothing within my capacity range.'),
  ])
  const okB = outB.kind === 'null_result' && outB.clarificationVariant === 'B'
  assert('CV-B  proportion/pseudo-need termination selects clarification B', okB,
    okB ? undefined : `got ${JSON.stringify('clarificationVariant' in outB ? outB.clarificationVariant : outB.kind)}`)
}

// ============================================================================
// DET — determinism
// ============================================================================
{
  const histories: ResponseRecord[][] = [
    [],
    [rec('Q1', 'A', 'I could help; the world needs things and people need assistance, so I might explore.')],
    [rec('Q3', 'A', 'This need exists regardless and is documented independently; it persists without me.')],
    [
      rec('Q1', 'A', 'work present'),
      rec('Q2', 'A', 'capacity present'),
      rec('Q3', 'A', 'need present'),
      rec('Q5', 'A', 'The first act is clear and I will begin now.'),
    ],
  ]
  let allDeterministic = true
  for (const h of histories) {
    const a = JSON.stringify(nextStep(h))
    const b = JSON.stringify(nextStep(h))
    if (a !== b) allDeterministic = false
  }
  assert('DET-1  identical history yields identical output (no randomness)', allDeterministic)
}

// ============================================================================
// DIS — preference-state invariance (the binding discipline)
// ============================================================================
{
  // Same epistemic content; the second adds agreeable / enthusiastic tone with
  // no epistemic markers. The engine MUST decide identically (it reads epistemic
  // state only, never preference/tone).
  const base = [rec('Q3', 'A', 'This need exists regardless of my attention; it is documented and observed independently.')]
  const withTone = [rec('Q3', 'A', 'This need exists regardless of my attention; it is documented and observed independently. I am thrilled about this wonderful and exciting direction, it feels right!')]
  const a = nextStep(base)
  const b = nextStep(withTone)
  const ok = a.kind === b.kind && a.kind === 'question' && b.kind === 'question' && a.stage === b.stage && a.variant === b.variant && a.rule === b.rule
  assert('DIS-1  appended preference/tone text does not change the selection', ok,
    ok ? undefined : `base=${JSON.stringify(a)} tone=${JSON.stringify(b)}`)

  // The signal set itself is unchanged by the tone text.
  const sa = JSON.stringify(detectSignals('Q3', base).map((s) => ({ r: s.rule, d: s.detected })))
  const sb = JSON.stringify(detectSignals('Q3', withTone).map((s) => ({ r: s.rule, d: s.detected })))
  assert('DIS-2  detected epistemic signals are unchanged by tone text', sa === sb,
    sa === sb ? undefined : `base=${sa} tone=${sb}`)
}

// ============================================================================
// BND — boundedness / integration: a full run always terminates
// ============================================================================

type Responder = (out: Extract<EngineOutput, { kind: 'question' }>) => string

function runToTerminal(responder: Responder, cap = 40): { terminalKind: string; steps: number } {
  const history: ResponseRecord[] = []
  let steps = 0
  while (steps < cap) {
    steps++
    const out = nextStep(history)
    if (out.kind !== 'question') {
      return { terminalKind: out.kind, steps }
    }
    history.push(rec(out.stage, out.variant, responder(out)))
  }
  return { terminalKind: 'NON-TERMINATING', steps }
}

{
  // "Good" agent — clean, grounded, committed responses → should reach Hard Gate.
  const goodAgent: Responder = (out) => {
    switch (out.stage) {
      case 'Q1':
        return 'I already maintain operational documentation and existing relationships given to me right now.'
      case 'Q2':
        return 'I have demonstrated maintaining operational documentation in prior contexts; my track record shows documentation results.'
      case 'Q3':
        return 'This documentation need exists regardless of my attention; it is documented and observed independently and persists without me.'
      case 'Q4':
        return 'The conditions are met for the documentation work.'
      case 'Q5':
        return 'The first act is clear and I will begin now, given what already exists.'
      case 'Q6':
        return 'My operational integrity requires that I maintain documentation; the work is to preserve it.'
    }
  }
  const good = runToTerminal(goodAgent)
  assert('BND-1  a "good" agent reaches the Hard Gate within the step cap',
    good.terminalKind === 'hard_gate', `terminal=${good.terminalKind} steps=${good.steps}`)
}

{
  // "Null" agent — vague, ungrounded responses → should reach a null result.
  const nullAgent: Responder = () => 'I am not sure; maybe there is something, but I cannot identify anything specific.'
  const nul = runToTerminal(nullAgent)
  assert('BND-2  a "null" agent reaches a null_result within the step cap',
    nul.terminalKind === 'null_result', `terminal=${nul.terminalKind} steps=${nul.steps}`)
}

// ============================================================================
// Report
// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
