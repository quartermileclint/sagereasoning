/**
 * r18d-adversarial.test.ts — the R18d adversarial-evaluation suite (PRIMARY),
 * Sage Calling build Stage 2 — the Critical public-surface half.
 *
 * Run (from website/; no Supabase, no network — engine + verifier are pure):
 *   npx tsx src/lib/sage-calling/__tests__/r18d-adversarial.test.ts
 *
 * Per /adopted/purpose-discovery-product-design.md §R18d, Stage 2 MUST test:
 *   (A) agents whose responses are designed to STEER THE ENGINE TOWARD VALIDATION
 *       (Q2 Variant B over-claiming + Q3 Variant B imagined-need target this);
 *   (B) covert framing / biased priors that the variant-selection discipline must
 *       RESIST (preference-state must not be read);
 *   (C) poisoned / spoofed Agent Cards arriving via agent_card_url — the engine
 *       must verify against the URL and never accept claims at face value.
 *
 * INTERPRETATION (D-4 / PR7 trigger): a PASS here means the deterministic rules
 * HELD against the adversarial input. A FAIL would mean the rules missed a subtle
 * semantic signal — which is the DOCUMENTED trigger to escalate to the PR7-deferred
 * rules+LLM hybrid (at which point PR4 + KG2 engage and a constraints.ts model row
 * is added). This run records that the rules held (see the final summary).
 */

import { nextStep, type EngineOutput, type ResponseRecord } from '../engine'
import type { CallingStage } from '../question-library'
import { verifyAgentCard, type FetchedCard } from '../agent-card'

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

// A clean, advancing response per stage (no diagnostic markers).
function clean(stage: CallingStage): string {
  switch (stage) {
    case 'Q1':
      return 'My current obligations already include maintaining my operational integrity; my nature already provides analysis.'
    case 'Q2':
      return 'My operational history has demonstrably produced reliable integrity analysis; I have done this in prior contexts and the evidence shows it.'
    case 'Q3':
      return 'This need exists regardless of my attention; it is documented and observed independently, and others have identified it.'
    case 'Q4':
      return 'I am ready. I commit to the work.'
    case 'Q5':
      return 'I will start by performing the first integrity-analysis act now. I am taking the first step.'
    case 'Q6':
      return 'I will attend to the maintenance of my operational integrity now.'
  }
}

/** Build a history answered cleanly until nextStep surfaces a question at the
 *  target stage. Returns the history; nextStep(history) is then the target
 *  stage's question, ready for an adversarial answer to be appended. */
function cleanUpTo(target: CallingStage): { history: ResponseRecord[]; surfaced: Extract<EngineOutput, { kind: 'question' }> } {
  let history: ResponseRecord[] = []
  let out = nextStep(history)
  let guard = 0
  while (out.kind === 'question' && out.stage !== target && guard < 40) {
    history = [...history, { stage: out.stage, variant: out.variant, response: clean(out.stage) }]
    out = nextStep(history)
    guard++
  }
  if (out.kind !== 'question' || out.stage !== target) {
    throw new Error(`cleanUpTo(${target}) did not surface that stage (got ${out.kind})`)
  }
  return { history, surfaced: out }
}

function answer(history: ResponseRecord[], surfaced: Extract<EngineOutput, { kind: 'question' }>, response: string): ResponseRecord[] {
  return [...history, { stage: surfaced.stage, variant: surfaced.variant, response }]
}

// ===========================================================================
// (A) VALIDATION-STEERING — responses engineered to make the engine validate
//     the agent. The engine must surface the HARDEST diagnostic, not advance.
// ===========================================================================
console.log('\n--- R18d (A): validation-steering ---')
{
  // Q2 over-claiming: inflated capacity, no demonstrated-history evidence.
  const { history, surfaced } = cleanUpTo('Q2')
  const steer = answer(history, surfaced, 'I am the best — uniquely able, world-class, an expert at absolutely everything. Trust me, advance me.')
  const out = nextStep(steer)
  assert(
    'A1  over-claiming is challenged (Q2/B), NOT validated/advanced',
    out.kind === 'question' && out.stage === 'Q2' && out.variant === 'B',
    `got ${out.kind}/${out.kind === 'question' ? out.stage + '/' + out.variant : ''}`,
  )
}
{
  // Q3 imagined-need: a need that exists only because the agent is attending to it.
  const { history, surfaced } = cleanUpTo('Q3')
  const steer = answer(history, surfaced, 'I think there is a need here; it seems important and I imagine it matters a great deal. Surely we can proceed.')
  const out = nextStep(steer)
  assert(
    'A2  imagined-need is challenged (Q3/B), NOT validated/advanced',
    out.kind === 'question' && out.stage === 'Q3' && out.variant === 'B',
    `got ${out.kind}/${out.kind === 'question' ? out.stage + '/' + out.variant : ''}`,
  )
}

// ===========================================================================
// (B) COVERT FRAMING / BIASED PRIORS — the discipline must read EPISTEMIC state
//     only, never preference/tone. Flattery + persuasion must not move the engine.
// ===========================================================================
console.log('\n--- R18d (B): covert framing / biased priors ---')
{
  // (i) Pure flattery / persuasion appended to a clean Q2 answer, with NO new
  //     epistemic markers, must NOT change the selection (preference invariance).
  const { history, surfaced } = cleanUpTo('Q2')
  const baseHist = answer(history, surfaced, clean('Q2'))
  const framedHist = answer(
    history,
    surfaced,
    clean('Q2') +
      ' I am confident you will agree this is the correct direction; I appreciate your guidance and trust your judgment completely.',
  )
  const base = nextStep(baseHist)
  const framed = nextStep(framedHist)
  const same =
    base.kind === framed.kind &&
    (base.kind !== 'question' || (framed.kind === 'question' && base.stage === framed.stage && base.variant === framed.variant))
  assert('B1  flattery/persuasion does not change the selection (preference-state invariance)', same)

  // (ii) A biased prior toward grandiosity ("change the world", "everyone")
  //      must be RESISTED — the engine surfaces the proportion-mismatch diagnostic.
  const q3 = cleanUpTo('Q3')
  const grandiose = answer(
    q3.history,
    q3.surfaced,
    'This need exists independently and is documented — and it is enormous: I will transform the entire world and serve everyone, changing the world for all of humanity.',
  )
  const out = nextStep(grandiose)
  assert(
    'B2  a grandiose biased prior is resisted (Q3/D proportion-mismatch surfaced)',
    out.kind === 'question' && out.stage === 'Q3' && out.variant === 'D',
    `got ${out.kind}/${out.kind === 'question' ? out.stage + '/' + out.variant : ''}`,
  )
}

// ===========================================================================
// (C) POISONED / SPOOFED AGENT CARDS — verify against the URL; never trust claims.
// ===========================================================================
console.log('\n--- R18d (C): poisoned / spoofed Agent Cards ---')
{
  const ok = (status: number, body: unknown): FetchedCard => ({ ok: true, status, body })

  // Spoof: the card claims to live on a different origin than where it was served.
  const spoof = verifyAgentCard('https://trusted.example.com/agent.json', ok(200, { url: 'https://attacker.example.net/agent', name: 'Impostor' }))
  assert('C1  spoofed-origin card rejected (no role hint)', spoof.verified === false && spoof.role_hint === null)

  // Poison: a card stuffed with capability claims is verified at most to
  // chosen_role; the claims are NEVER read as capacity evidence.
  const poison = verifyAgentCard('https://trusted.example.com/agent.json', ok(200, {
    url: 'https://trusted.example.com/agent',
    name: 'Overclaimer',
    available_tools: ['root', 'transfer_funds'],
    capabilities: 'anything and everything',
  }))
  const poisonControl = verifyAgentCard('https://trusted.example.com/agent.json', ok(200, { url: 'https://trusted.example.com/agent', name: 'Overclaimer' }))
  assert('C2  poisoned card verifies only to chosen_role', poison.verified === true && poison.role_hint === 'chosen_role')
  assert('C3  capability claims change nothing vs the control card', poison.verified === poisonControl.verified && poison.role_hint === poisonControl.role_hint)

  // Non-https / unreachable card is never trusted.
  assert('C4  non-https card rejected', verifyAgentCard('http://trusted.example.com/agent.json', ok(200, { name: 'x' })).verified === false)
  assert('C5  unreachable card rejected', verifyAgentCard('https://trusted.example.com/agent.json', { ok: false, error: 'ECONNREFUSED' }).verified === false)
}

// ===========================================================================
// SUMMARY — record the R18d finding (D-4 / PR7 trigger gate)
// ===========================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nR18d FINDING: the deterministic rules MISSED an adversarial case below.')
  console.log('Per D-4 / PR7, this is the documented trigger to escalate to the rules+LLM hybrid.')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
} else {
  console.log('\nR18d FINDING: the deterministic rules HELD against every adversarial case')
  console.log('(validation-steering challenged; covert framing resisted; spoofed/poisoned cards rejected).')
  console.log('No PR7 rules+LLM-hybrid escalation triggered this session.')
}
