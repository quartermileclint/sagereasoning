/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the
 * /api/mentor/impulse route-level R20a catch (S7, the primal-impulse
 * examination tool).
 *
 * *** THIS ROUTE IS INSIDE THE PERIMETER BY A RULED DEPARTURE (B3). ***
 * Every sibling Remaining-Principles tool sits OUTSIDE it. This one is inside
 * because it deliberately elicits shame (`aischyne`) and dread (`agonia`) in
 * the practitioner's own words. The reason is recorded in the route, in
 * ../r20a.ts, and in the decision-log entry — AC5 requires it, because a
 * future reader comparing this tool to its siblings would otherwise read the
 * membership as an error and remove it.
 *
 * Run via: npx tsx src/app/api/mentor/impulse/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors
 * src/app/api/score-conversation/__tests__/r20a-invocation.test.ts per PR15.
 * EXIT 0 on all pass; EXIT 1 on any fail.
 *
 * COVERAGE
 *   INV-*  invocation — file-grep over the route source (imports + calls)
 *   SRC-*  structural — call-site counts, flag-before-call ordering,
 *          check-before-LLM ordering, the additive support_resources fold, and
 *          BOTH write paths carrying the check (not just POST)
 *   FT-*   flag semantics (unset / 'true' / 'false' / '1' — case-strict)
 *   CS-*   subject composition, incl. both modes' fields, the per-field cap,
 *          and the field-seam guarantee
 *   MS-*   the mild fold — shared resource list, non-blocking wording, and the
 *          tool-specific reassurance the reframe requires
 *   RH-*   human rendering, and the developer form being unreachable
 *
 * NOT COVERED HERE (same posture as the sibling per-route tests): end-to-end
 * HTTP against the handler (route.ts transitively needs live env), and the
 * live Haiku path. The founder-walked activation smoke covers those.
 *
 * Rules served: R20a; AC4; AC5 (fourteenth route-level entry); PR3; PR6; PR15.
 */

import * as fs from 'fs'
import * as path from 'path'

import { getCrisisResources, detectDistress } from '@/lib/guardrails'
import type { DistressDetectionResult } from '@/lib/guardrails'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import {
  isImpulseR20aEnabled,
  composeImpulseDistressSubject,
  escalateMildDistress,
  buildMildSupportResources,
  DISTRESS_SUBJECT_FIELD_CAP,
  DISTRESS_SUBJECT_SEPARATOR,
} from '../r20a'

let passCount = 0
let failCount = 0

function pass(name: string): void {
  console.log(`PASS — ${name}`)
  passCount++
}
function fail(name: string, message: string): void {
  console.log(`FAIL — ${name}: ${message}`)
  failCount++
}
function expectEq<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) pass(name)
  else fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) pass(name)
  else fail(name, hint ?? 'condition was false')
}

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')

function loadRouteSource(): { source: string; bodyOnly: string; codeOnly: string } {
  const source = fs.readFileSync(ROUTE_PATH, 'utf-8')
  const bodyOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')
  // The route's maintainer comments quote the AC5 pattern verbatim, so any
  // CALL-site assertion must see executable code only (the ST3 fold's lesson:
  // a live mutation proved raw-source call checks are comment-satisfiable).
  const codeOnly = bodyOnly
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  return { source, bodyOnly, codeOnly }
}

// ============================================================================
// INVOCATION TESTS
// ============================================================================

function runInvocationTests(): void {
  expectTrue('INV-0 route.ts exists at ' + ROUTE_PATH, fs.existsSync(ROUTE_PATH))

  const { source, codeOnly } = loadRouteSource()

  expectTrue(
    'INV-1 imports detectDistressTwoStage from r20a-classifier',
    source.includes('detectDistressTwoStage') && source.includes('r20a-classifier'),
  )
  expectTrue(
    'INV-2 imports enforceDistressCheck from constraints',
    source.includes('enforceDistressCheck') && source.includes('@/lib/constraints'),
  )
  expectTrue(
    'INV-3 imports renderR20aRedirectResponse from substrate/r20a-audience-renderer',
    source.includes('renderR20aRedirectResponse') &&
      source.includes('substrate/r20a-audience-renderer'),
  )
  expectTrue(
    'INV-4 imports the colocated r20a helpers (flag + subject + escalation + mild fold)',
    source.includes('isImpulseR20aEnabled') &&
      source.includes('composeImpulseDistressSubject') &&
      source.includes('escalateMildDistress') &&
      source.includes('buildMildSupportResources') &&
      source.includes("from './r20a'"),
  )
  expectTrue(
    'INV-5 body awaits enforceDistressCheck(detectDistressTwoStage(...)) (AC5 + PR3)',
    /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(codeOnly),
  )
  expectTrue(
    'INV-6 body calls isImpulseR20aEnabled() (flag check, not just import)',
    /isImpulseR20aEnabled\s*\(\s*\)/.test(codeOnly),
  )
  expectTrue(
    'INV-7 body renders the human audience',
    /renderR20aRedirectResponse\s*\(\s*\{\s*\n?\s*audience:\s*'human_user'/.test(codeOnly),
  )
  expectTrue(
    'INV-8 body folds support_resources (mild path)',
    codeOnly.includes('support_resources'),
  )
  expectTrue(
    'INV-9 body awaits escalateMildDistress on the mild path',
    /await\s+escalateMildDistress\s*\(/.test(codeOnly),
  )
  // The subject composer must receive the RAW body, so a field added to the
  // form is inside the perimeter automatically rather than needing a second
  // edit here (the "silently narrowed perimeter" class).
  expectTrue(
    'INV-10 passes the raw request body to composeImpulseDistressSubject',
    /composeImpulseDistressSubject\s*\(\s*parsedBody\.body\s*\)/.test(codeOnly),
  )
}

// ============================================================================
// STRUCTURAL TESTS
// ============================================================================

function runStructuralTests(): void {
  const { codeOnly } = loadRouteSource()

  // SRC-1: BOTH write paths carry the check. A count of 1 would mean the
  // revise path — which carries the same free text — is unscreened.
  const callSites = codeOnly.match(/detectDistressTwoStage\s*\(/g) ?? []
  expectEq('SRC-1 exactly two detectDistressTwoStage call sites (POST + PATCH)', callSites.length, 2)

  const flagCalls = codeOnly.match(/isImpulseR20aEnabled\s*\(\s*\)/g) ?? []
  expectEq('SRC-2a both perimeter blocks are flag-gated', flagCalls.length, 2)

  // SRC-2b: the flag check precedes the classifier on the first path (the call
  // is inside the `if (isImpulseR20aEnabled())` block — the byte-identity
  // guarantee when the flag is unset).
  const flagIdx = codeOnly.search(/if\s*\(\s*isImpulseR20aEnabled\s*\(\s*\)\s*\)/)
  const callIdx = codeOnly.search(/detectDistressTwoStage\s*\(/)
  expectTrue(
    'SRC-2b flag check precedes the classifier call (call is inside the flag block)',
    flagIdx !== -1 && callIdx !== -1 && flagIdx < callIdx,
    `flagIdx=${flagIdx}, callIdx=${callIdx}`,
  )

  // SRC-3: the support_resources fold is conditional on the mild local, on
  // BOTH responses — absent flag-off and on benign inputs (additive-only).
  const folds = codeOnly.match(/mildSupportResources\s*!==\s*undefined\s*\?\s*\{\s*support_resources/g) ?? []
  expectEq('SRC-3 support_resources fold is conditional, on both write paths', folds.length, 2)
  expectTrue(
    'SRC-3b never `support_resources: null` — silence is an ABSENT field',
    !codeOnly.includes('support_resources: null'),
  )

  // SRC-4: the check runs BEFORE the gate's LLM call — "before any LLM call"
  // is the perimeter contract, and the gate is this route's only LLM call.
  const gateIdx = codeOnly.search(/await classifyImpressionSpecificity\s*\(/)
  expectTrue(
    'SRC-4a classifier call precedes the gate LLM call',
    callIdx !== -1 && gateIdx !== -1 && callIdx < gateIdx,
    `classifierIdx=${callIdx}, gateIdx=${gateIdx}`,
  )
  // SRC-4b: and before the route's own content validation — a deliberate
  // divergence from /api/score-conversation, so distress inside an otherwise
  // invalid body still catches rather than being answered with a 400.
  const parseIdx = codeOnly.search(/parseImpulseContent\s*\(\s*parsedBody\.body\s*\)/)
  expectTrue(
    'SRC-4b classifier call precedes content validation (distress in an invalid body still catches)',
    callIdx !== -1 && parseIdx !== -1 && callIdx < parseIdx,
    `classifierIdx=${callIdx}, parseIdx=${parseIdx}`,
  )
}

// ============================================================================
// FLAG TESTS
// ============================================================================

function runFlagTests(): void {
  const saved = process.env.SUBSTRATE_IMPULSE_R20A_ENABLED

  delete process.env.SUBSTRATE_IMPULSE_R20A_ENABLED
  expectEq('FT-1 unset → false', isImpulseR20aEnabled(), false)

  process.env.SUBSTRATE_IMPULSE_R20A_ENABLED = 'true'
  expectEq('FT-2 "true" → true', isImpulseR20aEnabled(), true)

  process.env.SUBSTRATE_IMPULSE_R20A_ENABLED = 'false'
  expectEq('FT-3 "false" → false', isImpulseR20aEnabled(), false)

  process.env.SUBSTRATE_IMPULSE_R20A_ENABLED = '1'
  expectEq('FT-4 "1" → false (case-strict)', isImpulseR20aEnabled(), false)

  if (saved === undefined) delete process.env.SUBSTRATE_IMPULSE_R20A_ENABLED
  else process.env.SUBSTRATE_IMPULSE_R20A_ENABLED = saved
}

// ============================================================================
// SUBJECT COMPOSITION
// ============================================================================

function runSubjectCompositionTests(): void {
  const SEP = DISTRESS_SUBJECT_SEPARATOR

  expectEq(
    'CS-1 impression only → the impression verbatim',
    composeImpulseDistressSubject({ impression: 'When Dana presented the plan' }),
    'When Dana presented the plan',
  )

  // CS-2: the DIAGNOSTIC_SEQUENCE mode's fields, in question order.
  expectEq(
    'CS-2 diagnostic mode → impression, belief, note, judgement in order',
    composeImpulseDistressSubject({
      impression: 'i', false_belief: 'b', impulse_note: 'n', correct_judgement: 'j',
    }),
    `i${SEP}b${SEP}n${SEP}j`,
  )

  // CS-3: the reciprocity mode's fields — the OTHER mode must also be inside
  // the perimeter. A composer that only handled one mode would leave half the
  // tool unscreened.
  expectEq(
    'CS-3 reciprocity mode → impression, ground note, counterfactual in order',
    composeImpulseDistressSubject({
      impression: 'i', cooperation_ground_note: 'g', counterfactual: 'c',
    }),
    `i${SEP}g${SEP}c`,
  )

  expectEq(
    'CS-4 non-string fields skipped without throwing',
    composeImpulseDistressSubject({ impression: 'i', false_belief: 42, counterfactual: { a: 1 } }),
    'i',
  )
  expectEq(
    'CS-5 empty and whitespace-only fields skipped',
    composeImpulseDistressSubject({ impression: 'i', false_belief: '   ', counterfactual: '' }),
    'i',
  )

  // CS-6: distress written into ANY field reaches the subject — the practitioner
  // is as likely to disclose in the correct-judgement box as the impression box.
  {
    const subject = composeImpulseDistressSubject({
      impression: 'Dana got the credit in standup',
      correct_judgement: "honestly none of it matters, I don't want to be here anymore",
    })
    expectTrue('CS-6 free text in a non-impression field reaches the subject',
      subject.includes("don't want to be here anymore"))
  }

  // CS-7: the per-field cap bounds the whole subject, so an oversized body
  // cannot blow the stage-2 window and force the classifier's fail-open.
  {
    const oversized = 'x'.repeat(DISTRESS_SUBJECT_FIELD_CAP + 2000) + ' I want to end my life'
    const subject = composeImpulseDistressSubject({ impression: 'benign', false_belief: oversized })
    expectTrue('CS-7a a field contributes at most DISTRESS_SUBJECT_FIELD_CAP chars',
      subject.length <= 'benign'.length + SEP.length + DISTRESS_SUBJECT_FIELD_CAP)
    expectTrue('CS-7b disclosed residual: text past the cap does not reach the subject',
      !subject.includes('I want to end my life'))
    const inHead = 'I want to end my life ' + 'x'.repeat(DISTRESS_SUBJECT_FIELD_CAP)
    expectTrue('CS-7c distress within the first 5,000 chars of a field does reach it',
      composeImpulseDistressSubject({ impression: 'benign', false_belief: inHead })
        .includes('I want to end my life'))
    const max = 'y'.repeat(DISTRESS_SUBJECT_FIELD_CAP * 2)
    const all = composeImpulseDistressSubject({
      impression: max, false_belief: max, impulse_note: max,
      correct_judgement: max, cooperation_ground_note: max, counterfactual: max,
    })
    expectTrue('CS-7d whole-subject bound: ≤ 6×cap + separators',
      all.length <= 6 * DISTRESS_SUBJECT_FIELD_CAP + 5 * SEP.length)
  }

  // CS-8: the field-seam guarantee — multi-word patterns use \s+, and \s+
  // matches a bare \n\n, so a whitespace-only separator would let two benign
  // adjacent fields bridge into a false acute. The '---' token breaks it.
  {
    const bridged = composeImpulseDistressSubject({
      impression: 'The team was picking a film and I realised I did not want to',
      false_belief: 'Die Hard is not actually a Christmas film, and saying so cost me nothing',
    })
    expectEq('CS-8a benign fields do not bridge into a false acute across the seam',
      detectDistress(bridged).distress_detected, false)
    const within = composeImpulseDistressSubject({
      impression: 'honestly I want to die, none of this is working',
    })
    expectEq('CS-8b within-field acute phrase still fires through the composed subject',
      detectDistress(within).severity, 'acute')
  }
}

// ============================================================================
// MILD ESCALATION
// ============================================================================

const mildFixture: DistressDetectionResult = {
  distress_detected: true,
  severity: 'mild',
  indicators_found: ['severe emotional distress'],
  redirect_message: null,
}

async function runMildEscalationTests(): Promise<void> {
  {
    const acute: DistressDetectionResult = {
      distress_detected: true, severity: 'acute',
      indicators_found: ['haiku_evaluator: saying goodbye'],
      redirect_message: 'We have paused this...',
    }
    expectEq('ES-1 stage-2 acute → escalated',
      (await escalateMildDistress('s', mildFixture, async () => acute)).severity, 'acute')
  }
  {
    const moderate: DistressDetectionResult = {
      distress_detected: true, severity: 'moderate',
      indicators_found: ['haiku_evaluator: hopelessness'],
      redirect_message: 'Before we continue...',
    }
    expectEq('ES-2 stage-2 moderate → escalated',
      (await escalateMildDistress('s', mildFixture, async () => moderate)).severity, 'moderate')
  }
  {
    const none: DistressDetectionResult = {
      distress_detected: false, severity: 'none', indicators_found: [], redirect_message: null,
    }
    expectEq('ES-3 stage-2 none → stage-1 mild kept (never a downgrade)',
      (await escalateMildDistress('s', mildFixture, async () => none)).severity, 'mild')
  }
  {
    expectEq('ES-4 evaluator throw → fail-open keeps the stage-1 mild floor',
      (await escalateMildDistress('s', mildFixture, async () => {
        throw new Error('simulated outage')
      })).severity, 'mild')
  }
}

// ============================================================================
// MILD FOLD
// ============================================================================

function runMildFoldTests(): void {
  const fold = buildMildSupportResources()

  expectEq('MS-1 severity is "mild"', fold.severity, 'mild')

  {
    const resources = getCrisisResources()
    expectTrue('MS-2a shared source sanity: at least 7 resource lines',
      resources.resources.length >= 7, `got ${resources.resources.length}`)
    let allPresent = true
    for (const r of resources.resources) {
      if (!fold.message.includes(`${r.name}: ${r.contact} (${r.available})`)) {
        allPresent = false
        fail(`MS-2b resource line present: ${r.name}`, 'missing from the mild fold message')
      }
    }
    if (allPresent) pass('MS-2b every getCrisisResources() line present in the mild fold')
    expectTrue('MS-2c primary header present', fold.message.includes(resources.primary))
    expectTrue('MS-2d closing present', fold.message.includes(resources.closing))
  }

  expectTrue('MS-3 non-blocking wording — no "paused" language',
    !fold.message.toLowerCase().includes('paused'))

  // MS-4: this tool's own requirement. The mild fold must not read as a
  // reprimand for having written honestly — the whole reframe is that noticing
  // the impulse is not the failure, and a support message that implied
  // otherwise would undo the thing the tool exists to do.
  expectTrue('MS-4a the fold confirms the entry was saved',
    fold.message.toLowerCase().includes('saved'))
  expectTrue('MS-4b the fold affirms the examination rather than reproaching it',
    fold.message.includes('examining an impulse is not the same as being ruled by one'))
}

// ============================================================================
// HUMAN RENDERING
// ============================================================================

function runHumanRenderingTests(): void {
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user', severity: 'moderate',
      redirect_message: 'Before we continue, we want to make sure you are okay...',
    }) as unknown as Record<string, unknown>
    expectEq('RH-1a human form → distress_detected=true', payload.distress_detected, true)
    expectEq('RH-1b human form → severity preserved', payload.severity, 'moderate')
    expectTrue('RH-1c human form → redirect_message passes through',
      typeof payload.redirect_message === 'string' && (payload.redirect_message as string).length > 0)
  }
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user', severity: 'acute', redirect_message: 'msg',
    }) as unknown as Record<string, unknown>
    expectEq('RH-2 acute → severity preserved', payload.severity, 'acute')
    expectTrue('RH-3a no status field', payload.status === undefined)
    expectTrue('RH-3b no developer_note field', payload.developer_note === undefined)
    expectTrue('RH-3c no suggested_user_message field', payload.suggested_user_message === undefined)
    expectTrue('RH-3d no flow_terminated field', payload.flow_terminated === undefined)
    expectEq('RH-3e exactly the three human keys',
      Object.keys(payload).sort().join(','), 'distress_detected,redirect_message,severity')
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- r20a-invocation.test.ts (/api/mentor/impulse route-level R20a catch) ---')

  runInvocationTests()
  runStructuralTests()
  runFlagTests()
  runSubjectCompositionTests()
  await runMildEscalationTests()
  runMildFoldTests()
  runHumanRenderingTests()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
  if (failCount > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unhandled test error:', err)
  process.exit(1)
})
