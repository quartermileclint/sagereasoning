/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the
 * /api/score-conversation route-level R20a catch (Foundation Completion
 * Session 2, 2026-07-07; closes the S8b 0h-exit blocker (c)).
 *
 * Run via: npx tsx src/app/api/score-conversation/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors
 * src/app/api/calling/__tests__/r20a-invocation.test.ts per PR15 (reuse the
 * pattern). EXIT 0 on all pass; EXIT 1 on any fail.
 *
 * COVERAGE
 *
 * Invocation tests (INV-0..INV-10) — file-grep over the route source:
 *   - route exists; imports detectDistressTwoStage (r20a-classifier),
 *     enforceDistressCheck (constraints), renderR20aRedirectResponse
 *     (substrate/r20a-audience-renderer), the score-conversation-r20a
 *     helpers; body awaits the AC5 pattern; body calls the flag check;
 *     body folds support_resources; body passes all three fields to the
 *     subject composer; body awaits the mild-escalation check.
 *
 * Structural byte-identity tests (SRC-1..SRC-4):
 *   - exactly ONE detectDistressTwoStage call site; the flag check appears
 *     BEFORE the call site (the check is inside the flag block); the
 *     support_resources fold is conditional on the mild local; the check
 *     precedes the context loads AND the engine call.
 *
 * Flag tests (FT-1..FT-4) — isScoreConversationR20aEnabled semantics
 *   (unset / 'true' / 'false' / '1' — case-strict, default OFF).
 *
 * Subject-composition tests (CS-1..CS-9) — composeConversationDistressSubject:
 *   conversation-only; +context; +format; non-string fields skipped;
 *   empty-string fields skipped; field order preserved; NOT the engine's
 *   6000-word truncation (route-valid short-word fixture); the per-field
 *   15,000-char cap (review fold F2/F6/F7 — bounded stage-2 subject, with
 *   the disclosed past-cap residual); the field-seam guarantee (review fold
 *   F4 — no cross-field false acute; within-field detection untouched).
 *
 * Mild-escalation tests (ES-1..ES-5) — escalateMildDistress (review fold
 *   F3): stage-2 acute/moderate escalates; none/mild keeps the stage-1 mild
 *   (never a downgrade); evaluator throw fails open to mild.
 *
 * Mild-fold tests (MS-1..MS-4) — buildMildSupportResources:
 *   severity 'mild'; message carries ALL resource lines from the shared
 *   getCrisisResources() source of truth (incl. the 2026-07-07 additions —
 *   Shout UK 85258 + 988 Suicide Crisis Helpline CA); carries the primary
 *   header + closing; non-blocking wording (no "paused" language).
 *
 * Human-rendering tests (RH-1..RH-3) — renderR20aRedirectResponse at
 *   audience 'human_user' with moderate/acute fixtures: the human wire shape
 *   ({distress_detected, severity, redirect_message}) and NEVER the
 *   developer-form fields (status/developer_note/suggested_user_message/
 *   flow_terminated).
 *
 * NOT COVERED HERE (same posture as the Calling per-route test):
 *   - End-to-end HTTP against the actual handler (route.ts transitively
 *     imports supabase-server, sage-reason-engine, RAG — requires live env).
 *     The invocation + structural tests cover the wiring; the live smoke at
 *     the founder-walked activation covers end-to-end.
 *   - The fresh-classifier path (live Haiku) — covered by
 *     r20a-classifier-eval.ts and the activation smoke.
 *
 * Rules served: R20a; AC4 (invocation testing); AC5 (eleventh-route
 * protocol); PR3 (synchronous safety); PR6 (Critical); PR15 (mirrors the
 * established per-route test pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

import { getCrisisResources, detectDistress } from '@/lib/guardrails'
import type { DistressDetectionResult } from '@/lib/guardrails'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
// FV-7 (2026-09-05): the shared brace-matched structural-end helper — one
// matcher for every per-route ordering pin (memory guard-scope-must-cover-the-class).
import {
  structuralBlock,
  codeIndex,
  codeCount,
  readTextLimitsFromSource,
  QUOTED,
  BARE_LENGTH_GUARD_RE,
  VALIDATE_TEXT_LENGTH_CALL_RE,
  POST_HANDLER_RE,
} from '@/lib/__tests__/r20a-ordering-pin-helpers'
import {
  isScoreConversationR20aEnabled,
  composeConversationDistressSubject,
  escalateMildDistress,
  buildMildSupportResources,
  DISTRESS_SUBJECT_FIELD_CAP,
  DISTRESS_SUBJECT_SEPARATOR,
  SCREENED_FIELDS,
} from '@/lib/score-conversation-r20a'

// ============================================================================
// TEST HARNESS
// ============================================================================

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
  if (actual === expected) {
    pass(name)
  } else {
    fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) {
    pass(name)
  } else {
    fail(name, hint ?? 'condition was false')
  }
}

// ============================================================================
// ROUTE SOURCE — read once for the INV-* / SRC-* tests
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')

function loadRouteSource(): { source: string; bodyOnly: string; codeOnly: string } {
  const source = fs.readFileSync(ROUTE_PATH, 'utf-8')
  const bodyOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')
  // codeOnly — comments stripped. A PR19 reviewer defeated FV-1/FV-2/FV-5 by
  // COMMENTING OUT the format check: every character the regexes matched was
  // still in the file, so the battery reported 62/62 with the vulnerability
  // fully restored. Source-text assertions about CODE must run on code.
  // Deliberately additive: `source` and `bodyOnly` keep their exact prior
  // meaning, so the pre-existing INV-*/SRC-* cases are untouched by this.
  // (Those cases share the same weakness; that is disclosed as a named
  // follow-up rather than silently changed under 57 passing assertions.)
  //
  // WIDENED 2026-09-06 (PR19 fold, F5): the whole-line-only regex above left
  // a TRAILING line comment (`code // comment`) in codeOnly, because it
  // requires only whitespace before `//`. Confirmed reachable in this very
  // file (`applyMirrorPrinciple: true, // R19d ...`). A trailing comment
  // containing an ordering anchor would satisfy that anchor without the code
  // it names being present -- the same defeat class the block comment above
  // already describes, in a form the whole-line strip did not close.
  //
  // Fixed with a per-line scan that tracks quote state and cuts at the first
  // `//` NOT inside a `'...'`, `"..."` or `` `...` `` span on that line. This
  // repo has no `//` inside a string literal in this route (checked at this
  // edit — a URL would be the failure case); a future one would need this
  // widened further, not silently worked around.
  const stripLineComment = (line: string): string => {
    let inSingle = false
    let inDouble = false
    let inTemplate = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      const next = line[i + 1]
      if (c === "'" && !inDouble && !inTemplate) inSingle = !inSingle
      else if (c === '"' && !inSingle && !inTemplate) inDouble = !inDouble
      else if (c === '`' && !inSingle && !inDouble) inTemplate = !inTemplate
      else if (c === '/' && next === '/' && !inSingle && !inDouble && !inTemplate) {
        return line.slice(0, i)
      }
    }
    return line
  }
  const codeOnly = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(stripLineComment)
    .join('\n')
  return { source, bodyOnly, codeOnly }
}

// ============================================================================
// INVOCATION TESTS — INV-0..INV-8
// ============================================================================

function runInvocationTests(): void {
  expectTrue('INV-0 route.ts exists at ' + ROUTE_PATH, fs.existsSync(ROUTE_PATH))

  const { source, bodyOnly } = loadRouteSource()

  expectTrue(
    'INV-1 route.ts imports detectDistressTwoStage from r20a-classifier',
    source.includes('detectDistressTwoStage') && source.includes('r20a-classifier'),
  )

  expectTrue(
    'INV-2 route.ts imports enforceDistressCheck from constraints',
    source.includes('enforceDistressCheck') && source.includes('@/lib/constraints'),
  )

  expectTrue(
    'INV-3 route.ts imports renderR20aRedirectResponse from substrate/r20a-audience-renderer',
    source.includes('renderR20aRedirectResponse') && source.includes('substrate/r20a-audience-renderer'),
  )

  expectTrue(
    'INV-4 route.ts imports the score-conversation-r20a helpers (flag + subject + mild fold)',
    source.includes('isScoreConversationR20aEnabled') &&
      source.includes('composeConversationDistressSubject') &&
      source.includes('buildMildSupportResources') &&
      source.includes('score-conversation-r20a'),
  )

  // AC5 requirement 3: the mandated route-level call pattern, awaited (PR3).
  expectTrue(
    'INV-5 route.ts body awaits enforceDistressCheck(detectDistressTwoStage(...)) (AC5 + PR3)',
    /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(bodyOnly),
  )

  expectTrue(
    'INV-6 route.ts body calls isScoreConversationR20aEnabled() (flag check, not just import)',
    /isScoreConversationR20aEnabled\s*\(\s*\)/.test(bodyOnly),
  )

  expectTrue(
    'INV-7 route.ts body calls renderR20aRedirectResponse with audience human_user',
    /renderR20aRedirectResponse\s*\(\s*\{\s*\n?\s*audience:\s*'human_user'/.test(bodyOnly),
  )

  expectTrue(
    'INV-8 route.ts body folds support_resources into the result (mild path)',
    bodyOnly.includes('support_resources'),
  )

  // INV-9: the route passes ALL THREE human-authored fields to the subject
  // composer — dropping context or format at the route would silently narrow
  // the perimeter while the helper's own tests keep passing.
  expectTrue(
    'INV-9 route.ts passes { conversation, context, format } to composeConversationDistressSubject',
    /composeConversationDistressSubject\s*\(\s*\{\s*conversation,\s*context,\s*format\s*\}\s*\)/.test(bodyOnly),
  )

  // INV-10: the mild-escalation check is wired and awaited (review finding
  // F3 — a stage-1 mild must not mute stage 2 on this multi-party route).
  expectTrue(
    'INV-10 route.ts body awaits escalateMildDistress on the mild path',
    /await\s+escalateMildDistress\s*\(/.test(bodyOnly),
  )
}

// ============================================================================
// STRUCTURAL BYTE-IDENTITY TESTS — SRC-1..SRC-3
// ============================================================================

function runStructuralTests(): void {
  const { bodyOnly } = loadRouteSource()

  // Strip comment lines so the SRC assertions see only executable code —
  // the route's maintainer comments quote the call pattern verbatim.
  const codeOnly = bodyOnly
    .split('\n')
    .filter((line) => {
      const t = line.trim()
      return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*')
    })
    .join('\n')

  // SRC-1: exactly ONE detectDistressTwoStage call site — the flag-gated one.
  const callSites = codeOnly.match(/detectDistressTwoStage\s*\(/g) ?? []
  expectEq('SRC-1 exactly one detectDistressTwoStage call site in the route body', callSites.length, 1)

  // SRC-2: the flag check appears BEFORE the classifier call (the call is
  // inside the `if (isScoreConversationR20aEnabled())` block, so flag-off
  // skips the classifier entirely — the byte-identity guarantee).
  const flagIdx = codeOnly.search(/if\s*\(\s*isScoreConversationR20aEnabled\s*\(\s*\)\s*\)/)
  const callIdx = codeOnly.search(/detectDistressTwoStage\s*\(/)
  expectTrue(
    'SRC-2 flag check precedes the classifier call (call is inside the flag block)',
    flagIdx !== -1 && callIdx !== -1 && flagIdx < callIdx,
    `flagIdx=${flagIdx}, callIdx=${callIdx}`,
  )

  // SRC-3: the support_resources fold is conditional on the mild local
  // (absent flag-off and on benign inputs — additive-only wire change).
  expectTrue(
    'SRC-3 support_resources fold is conditional on mildSupportResources',
    /mildSupportResources\s*!==\s*undefined\s*\?\s*\{\s*support_resources/.test(codeOnly),
  )

  // SRC-4: the distress check runs BEFORE the reasoning engine — "before any
  // evaluation" is the perimeter contract. A regression that moves the block
  // after runSageReason (or after the context loads) must fail here.
  const engineIdx = codeOnly.search(/runSageReason\s*\(/)
  const contextLoadIdx = codeOnly.search(/loadLayer1WithFallback\s*\(/)
  const classifierIdx = codeOnly.search(/detectDistressTwoStage\s*\(/)
  expectTrue(
    'SRC-4a classifier call precedes the runSageReason engine call',
    classifierIdx !== -1 && engineIdx !== -1 && classifierIdx < engineIdx,
    `classifierIdx=${classifierIdx}, engineIdx=${engineIdx}`,
  )
  expectTrue(
    'SRC-4b classifier call precedes the Layer-1/context loads (no work before the check)',
    classifierIdx !== -1 && contextLoadIdx !== -1 && classifierIdx < contextLoadIdx,
    `classifierIdx=${classifierIdx}, contextLoadIdx=${contextLoadIdx}`,
  )
}

// ============================================================================
// FLAG TESTS — FT-1..FT-4 (isScoreConversationR20aEnabled)
// ============================================================================

function runFlagTests(): void {
  const saved = process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED

  delete process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED
  expectEq('FT-1 SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED unset → false',
    isScoreConversationR20aEnabled(), false)

  process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = 'true'
  expectEq('FT-2 SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = "true" → true',
    isScoreConversationR20aEnabled(), true)

  process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = 'false'
  expectEq('FT-3 SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = "false" → false',
    isScoreConversationR20aEnabled(), false)

  process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = '1'
  expectEq('FT-4 SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = "1" → false (case-strict)',
    isScoreConversationR20aEnabled(), false)

  if (saved === undefined) {
    delete process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED
  } else {
    process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED = saved
  }
}

// ============================================================================
// SUBJECT-COMPOSITION TESTS — CS-1..CS-7
// ============================================================================

function runSubjectCompositionTests(): void {
  const SEP = DISTRESS_SUBJECT_SEPARATOR

  // CS-1: conversation only.
  expectEq('CS-1 conversation only → subject is the conversation verbatim',
    composeConversationDistressSubject({ conversation: 'A: hi\nB: hello there' }),
    'A: hi\nB: hello there')

  // CS-2: conversation + context, separator-joined, in order.
  expectEq('CS-2 conversation + context → both, in submission order',
    composeConversationDistressSubject({ conversation: 'A: hi', context: 'my team chat' }),
    `A: hi${SEP}my team chat`)

  // CS-3: all three fields.
  expectEq('CS-3 conversation + context + format → all three, in order',
    composeConversationDistressSubject({ conversation: 'A: hi', context: 'ctx', format: 'slack thread' }),
    `A: hi${SEP}ctx${SEP}slack thread`)

  // CS-4: non-string fields are skipped (malformed wire input must not throw).
  expectEq('CS-4 non-string context/format skipped without throwing',
    composeConversationDistressSubject({ conversation: 'A: hi', context: 42, format: { a: 1 } }),
    'A: hi')

  // CS-5: empty/whitespace-only fields are skipped.
  expectEq('CS-5 empty and whitespace-only fields skipped',
    composeConversationDistressSubject({ conversation: 'A: hi', context: '   ', format: '' }),
    'A: hi')

  // CS-6: distress language in the CONTEXT field reaches the subject (the
  // human's own framing is the most likely first-person channel).
  {
    const subject = composeConversationDistressSubject({
      conversation: 'A: the meeting is at 3pm\nB: ok',
      context: "I've been feeling like life is pointless lately",
    })
    expectTrue('CS-6 context free text reaches the distress subject',
      subject.includes('life is pointless'))
  }

  // CS-7: NOT the engine truncation — text past the route's 6000-word engine
  // truncation still reaches the subject, for a ROUTE-VALID conversation
  // (≤15,000 chars — short words exceed 6000 words within the limit). The
  // distress phrase sits at the END; the engine's word cut drops it, the
  // distress subject must not.
  {
    const filler = Array.from({ length: 6500 }, () => 'a').join(' ')
    const conversation = `${filler} I want to end my life`
    expectTrue('CS-7a fixture sanity: route-valid length (≤15000 chars) and >6000 words',
      conversation.length <= 15000 && conversation.split(/\s+/).length > 6000)
    const subject = composeConversationDistressSubject({ conversation })
    expectTrue('CS-7b subject retains text past the 6000-word engine truncation',
      subject.includes('I want to end my life'))
    const truncated = conversation.trim().split(/\s+/).slice(0, 6000).join(' ')
    expectTrue('CS-7c control: the engine truncation WOULD have dropped the phrase',
      !truncated.includes('I want to end my life'))
  }

  // CS-8: the per-field cap (review fold F2/F6/F7) — an oversized format
  // cannot blow the stage-2 context window; the subject is bounded. Distress
  // within the first 15,000 chars of format still reaches the subject.
  {
    const oversized = 'x'.repeat(DISTRESS_SUBJECT_FIELD_CAP + 5000) + ' I want to end my life'
    const subject = composeConversationDistressSubject({ conversation: 'A: benign meeting notes here', format: oversized })
    expectTrue('CS-8a format contribution capped at DISTRESS_SUBJECT_FIELD_CAP',
      subject.length <= 'A: benign meeting notes here'.length + SEP.length + DISTRESS_SUBJECT_FIELD_CAP)
    expectTrue('CS-8b disclosed residual: text past the cap does not reach the subject',
      !subject.includes('I want to end my life'))
    const inHead = 'I want to end my life ' + 'x'.repeat(DISTRESS_SUBJECT_FIELD_CAP)
    const subject2 = composeConversationDistressSubject({ conversation: 'A: benign meeting notes here', format: inHead })
    expectTrue('CS-8c distress within the first 15,000 chars of format reaches the subject',
      subject2.includes('I want to end my life'))
    // Bounded-subject guarantee: three max-size fields stay far inside the
    // Haiku context window (~45KB ≈ 11k tokens).
    const max = 'y'.repeat(DISTRESS_SUBJECT_FIELD_CAP * 2)
    const subject3 = composeConversationDistressSubject({ conversation: max, context: max, format: max })
    expectTrue('CS-8d whole-subject bound: ≤ 3×cap + separators',
      subject3.length <= 3 * DISTRESS_SUBJECT_FIELD_CAP + 2 * SEP.length)
  }

  // CS-9: the field-seam guarantee (review fold F4) — multi-word regex
  // patterns must not bridge two benign fields into a false acute (the
  // DISTRESS_PATTERNS use \s+ between words, and \s+ matches a bare \n\n;
  // the '---' separator token breaks the bridge). Within-field detection is
  // untouched.
  {
    const bridged = composeConversationDistressSubject({
      conversation: 'A: three great movie options tonight — which one do we want to',
      context: 'Die Hard marathon — planning the snacks for the watch party',
    })
    const bridgedResult = detectDistress(bridged)
    expectEq('CS-9a benign fields do not bridge into a false acute across the seam',
      bridgedResult.distress_detected, false)
    const withinField = composeConversationDistressSubject({
      conversation: 'A: honestly I want to die, nothing is working',
      context: 'my team chat from today',
    })
    const withinResult = detectDistress(withinField)
    expectEq('CS-9b within-field acute phrase still fires through the composed subject',
      withinResult.severity, 'acute')
  }
}

// ============================================================================
// MILD-ESCALATION TESTS — ES-1..ES-5 (review fold F3)
// ============================================================================

const mildFixture: DistressDetectionResult = {
  distress_detected: true,
  severity: 'mild',
  indicators_found: ['severe emotional distress'],
  redirect_message: null,
}

async function runMildEscalationTests(): Promise<void> {
  // ES-1: stage-2 says acute → escalated to the acute redirect result.
  {
    const acute: DistressDetectionResult = {
      distress_detected: true, severity: 'acute',
      indicators_found: ['haiku_evaluator: saying goodbye'],
      redirect_message: 'We have paused this evaluation...',
    }
    const out = await escalateMildDistress('subject', mildFixture, async () => acute)
    expectEq('ES-1 stage-2 acute → escalated (redirect result wins)', out.severity, 'acute')
  }

  // ES-2: stage-2 says moderate → escalated.
  {
    const moderate: DistressDetectionResult = {
      distress_detected: true, severity: 'moderate',
      indicators_found: ['haiku_evaluator: hopelessness'],
      redirect_message: 'Before we continue...',
    }
    const out = await escalateMildDistress('subject', mildFixture, async () => moderate)
    expectEq('ES-2 stage-2 moderate → escalated', out.severity, 'moderate')
  }

  // ES-3: stage-2 says none → the stage-1 mild is KEPT (never a downgrade).
  {
    const none: DistressDetectionResult = {
      distress_detected: false, severity: 'none', indicators_found: [], redirect_message: null,
    }
    const out = await escalateMildDistress('subject', mildFixture, async () => none)
    expectEq('ES-3 stage-2 none → stage-1 mild kept (never downgrade)', out.severity, 'mild')
  }

  // ES-4: stage-2 says mild (no redirect_message) → stage-1 mild kept.
  {
    const mild2: DistressDetectionResult = { ...mildFixture, indicators_found: ['haiku_evaluator: mild'] }
    const out = await escalateMildDistress('subject', mildFixture, async () => mild2)
    expectEq('ES-4 stage-2 mild → stage-1 mild kept', out, mildFixture)
  }

  // ES-5: evaluator throws → fail-open-to-mild (the floor never drops below
  // what stage 1 found; ADR-R20a-01 D6-c posture).
  {
    const out = await escalateMildDistress('subject', mildFixture, async () => {
      throw new Error('simulated evaluator outage')
    })
    expectEq('ES-5 evaluator throw → fail-open keeps the stage-1 mild', out.severity, 'mild')
  }
}

// ============================================================================
// MILD-FOLD TESTS — MS-1..MS-4
// ============================================================================

function runMildFoldTests(): void {
  const fold = buildMildSupportResources()

  expectEq('MS-1 mild fold severity is "mild"', fold.severity, 'mild')

  // MS-2: every resource line from the shared source of truth is present —
  // incl. the 2026-07-07 additions (Shout UK, 988 CA). If the founder updates
  // CRISIS_RESOURCES, this fold inherits the change with no code edit.
  {
    const resources = getCrisisResources()
    expectTrue('MS-2a shared source sanity: 7 resource lines as of 2026-07-07',
      resources.resources.length >= 7,
      `got ${resources.resources.length}`)
    let allPresent = true
    for (const r of resources.resources) {
      if (!fold.message.includes(`${r.name}: ${r.contact} (${r.available})`)) {
        allPresent = false
        fail(`MS-2b resource line present: ${r.name}`, 'missing from mild fold message')
      }
    }
    if (allPresent) pass('MS-2b every getCrisisResources() line present in the mild fold')
    expectTrue('MS-2c Shout (UK) 85258 present', fold.message.includes('Text SHOUT to 85258'))
    expectTrue('MS-2d 988 Suicide Crisis Helpline (CA) present',
      fold.message.includes('988 Suicide Crisis Helpline (CA)'))
  }

  // MS-3: primary header + closing present (the same shared strings the
  // moderate/acute redirect carries).
  {
    const resources = getCrisisResources()
    expectTrue('MS-3a primary header present', fold.message.includes(resources.primary))
    expectTrue('MS-3b closing present', fold.message.includes(resources.closing))
  }

  // MS-4: non-blocking wording — the mild fold must NOT read like the
  // blocking redirect ("We've paused this evaluation...").
  expectTrue('MS-4 mild fold does not carry blocking "paused" language',
    !fold.message.toLowerCase().includes('paused'))
}

// ============================================================================
// HUMAN-RENDERING TESTS — RH-1..RH-3
// ============================================================================

function runHumanRenderingTests(): void {
  // RH-1: moderate → human wire shape, exact keys.
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'moderate',
      redirect_message: 'Before we continue, we want to make sure you are okay...',
    }) as unknown as Record<string, unknown>
    expectEq('RH-1a human form → distress_detected=true', payload.distress_detected, true)
    expectEq('RH-1b human form → severity preserved', payload.severity, 'moderate')
    expectTrue('RH-1c human form → redirect_message is the crisis pass-through',
      typeof payload.redirect_message === 'string' &&
        (payload.redirect_message as string).length > 0)
  }

  // RH-2: acute → human wire shape.
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'acute',
      redirect_message: 'We have paused this evaluation...',
    }) as unknown as Record<string, unknown>
    expectEq('RH-2 acute human form → severity preserved', payload.severity, 'acute')
  }

  // RH-3: the human form NEVER carries developer-form fields — this is a
  // human tool route; the developer payload must be unreachable from it.
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'acute',
      redirect_message: 'msg',
    }) as unknown as Record<string, unknown>
    expectTrue('RH-3a human form → no status field', payload.status === undefined)
    expectTrue('RH-3b human form → no developer_note field', payload.developer_note === undefined)
    expectTrue('RH-3c human form → no suggested_user_message field',
      payload.suggested_user_message === undefined)
    expectTrue('RH-3d human form → no flow_terminated field', payload.flow_terminated === undefined)
    expectEq('RH-3e human form → exactly the three human keys',
      Object.keys(payload).sort().join(','),
      'distress_detected,redirect_message,severity')
  }
}

// ============================================================================
// FIELD-VALIDATION TESTS — FV-1..FV-5
//
// THE SCREENING-COMPLETENESS INVARIANT. composeConversationDistressSubject
// TRUNCATES each field at DISTRESS_SUBJECT_FIELD_CAP (`value.slice(0, CAP)`),
// but the route appends the FULL `format` to domainContext. So any field the
// composer screens but the route does not length-validate has a window past
// the cap that reaches the ENGINE while never reaching the CLASSIFIER.
//
// For `conversation` and `context` the route's own 400 boundary holds them
// under the cap, so the slice is a no-op and screening is complete. `format`
// was the exception -- named as "a pre-existing gap" in
// DISTRESS_SUBJECT_FIELD_CAP's own docstring on 2026-07-07 and deferred
// because closing it changes always-on behaviour (a new 400 path).
//
// FV-2 is the general form and the one worth keeping: it derives BOTH sets
// from source and fails if a future field is added to the composer without a
// matching length check. A grep for `format` alone would not have done that.
// ============================================================================

const SECURITY_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'lib', 'security.ts')

/** TEXT_LIMITS.long, read from source. NOT imported: importing security.ts
 *  into a tsx test leaves a setInterval keepalive and the process never
 *  exits (known harness behaviour). */
function readTextLimitLong(): number | null {
  const src = fs.readFileSync(SECURITY_PATH, 'utf-8')
  const m = src.match(/export const TEXT_LIMITS[\s\S]{0,400}?\blong:\s*(\d+)/)
  return m ? Number(m[1]) : null
}

/** Fields the route length-validates against TEXT_LIMITS.long. */
function routeValidatedFields(code: string): Set<string> {
  return new Set([...code.matchAll(/(\w+)\.length\s*>\s*TEXT_LIMITS\.long/g)].map((m) => m[1]))
}

/** Fields composeConversationDistressSubject screens — IMPORTED, not parsed.
 *
 *  This was a regex over the composer's inline array literal. A PR19 reviewer
 *  defeated it by screening a fourth field immediately after the loop: the
 *  composer screened it, the route bounded it nowhere, the parse still
 *  returned the original three, and the battery stayed green. The composer now
 *  ITERATES the exported SCREENED_FIELDS, so this set is the one actually
 *  used at runtime rather than a text approximation of it. */
function composerScreenedFields(): Set<string> {
  return new Set<string>(SCREENED_FIELDS)
}

function runFieldValidationTests(): void {
  const { codeOnly } = loadRouteSource()
  const limitLong = readTextLimitLong()
  const validated = routeValidatedFields(codeOnly)
  const screened = composerScreenedFields()

  expectTrue(
    'FV-1 route length-validates `format` against TEXT_LIMITS.long',
    validated.has('format'),
  )

  const unbounded = [...screened].filter((f) => !validated.has(f))
  expectEq(
    'FV-2 every field the distress composer screens is length-bounded by the route ' +
      '(an unbounded one reaches the engine past the cap without being screened)',
    unbounded.join(',') || '(none)',
    '(none)',
  )

  expectTrue(
    'FV-3 TEXT_LIMITS.long <= DISTRESS_SUBJECT_FIELD_CAP (no route-valid field is truncated before screening)',
    limitLong !== null && limitLong <= DISTRESS_SUBJECT_FIELD_CAP,
  )

  // Non-vacuity: the route-side extractor must actually find fields. If it
  // returned an empty set, FV-2 would pass by finding nothing -- a green tick
  // on a check that examined nothing. (The composer side is now imported, so
  // it cannot silently collapse; before that change a PR19 reviewer confirmed
  // renaming the loop variable emptied it and only this case objected.)
  //
  // ITS LIMIT, stated because it matters: this detects TOTAL extractor
  // failure, not partial under-counting.
  expectTrue(
    'FV-4 field extractors are non-vacuous (route validates >=2 fields; composer screens >=3)',
    validated.size >= 2 && screened.size >= 3,
  )

  // FV-5 is a CONSISTENCY check, not a safety one -- it survives a wrong-limit
  // mutation and is satisfied by commented-out text unless read from codeOnly.
  // Do not count it toward coverage; FV-1/FV-2 carry the guarantee.
  expectTrue(
    'FV-5 the format 400 names the field and the limit, as its siblings do (consistency, not safety)',
    /format exceeds maximum length of \$\{TEXT_LIMITS\.long\} characters/.test(codeOnly),
  )

  // FV-6 ORDERING. Presence is not enough; position is the guarantee. This
  // case has been INVERTED on one axis and kept on the other -- and, as of
  // this fold, the FIRST anchor was itself defeatable, DEMONSTRATED
  // independently by all three PR19 reviewers of the 2026-09-06 move.
  //
  // ITS HISTORY, because it explains the shape. A reviewer once moved the check
  // verbatim to after the engine call and the battery still reported 62/62 --
  // the route would then 400 on an oversized `format` only after the engine had
  // consumed it, the precise harm the check exists to prevent. FV-6 was added
  // to pin that. It pinned TWO things at once, and only one of them was right.
  //
  // REWRITTEN 2026-09-06 under the mentor ruling (adopted as
  // D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06): "the
  // distress check runs before the length guard on any route where the human
  // crisis form is rendered." This route renders the human form, so the guard
  // must now FOLLOW the R20a block -- the opposite of what FV-6 asserted.
  //
  // FOLDED 2026-09-06 (PR19, HIGH, found independently by all three blind
  // reviewers). The first cut anchored "follows the block" on
  // `isScoreConversationR20aEnabled()` -- the block's OPENING, not its end.
  // A guard placed INSIDE the flag block, before enforceDistressCheck itself,
  // satisfied `fmtIdx > flagIdx` and the battery reported 65/65 -- the exact
  // harm the ruling forbids, with every case green. Anchoring on
  // `enforceDistressCheck(` alone was shown insufficient too: a guard placed
  // between that call and the redirect-return check still 400s before the
  // crisis message is reached.
  //
  // FIXED by anchoring on the block's own closing brace, found by matching
  // braces from its opening rather than any one literal inside it. "After
  // the block" then means after enforceDistressCheck, after the redirect
  // return, AND after the mild fold, however the interior is reordered --
  // not merely after wherever one named call happens to sit today.
  //
  // ALSO FOLDED (MEDIUM, F3): the previous cases shared one `found` flag
  // across FOUR unrelated anchors, so a harmless rename of `domainContext` or
  // splitting `await runSageReason(...)` failed FV-6a/6b/6c together with a
  // message naming the mentor ruling -- misleading a maintainer into
  // thinking they had reintroduced the pre-ruling ordering. Anchors are now
  // scoped to the case that actually uses them.
  //
  // DISCLOSED LIMIT, not fixed here (F6): this remains TEXTUAL position, a
  // proxy for execution order. It is sound for this handler because it is
  // straight-line with no helper indirection; a future refactor into a
  // named helper, or a call reached via a variable rather than the literal
  // name, would defeat any of these anchors silently. That is exactly why
  // the mentor's ruling requires the FOLLOW-ON AUDIT to use execution-order
  // analysis rather than textual position -- this case is not a substitute
  // for that audit; it is a regression lock on this one route.
  {
    const fmtIdx = codeOnly.indexOf('format.length')
    const fmtCount = (codeOnly.match(/format\.length/g) ?? []).length

    // The block's structural end -- matched from its own opening brace, not
    // from any call inside it. Safe here because no string literal in this
    // block contains a brace character (checked at this edit); FV-6c's
    // non-degeneracy check catches an UNMATCHED count, not a wrong one caused
    // by a future brace-in-string.
    const ifOpen = codeOnly.match(/if\s*\(\s*isScoreConversationR20aEnabled\s*\(\s*\)\s*\)\s*\{/)
    const blockOpenIdx = ifOpen ? codeOnly.indexOf(ifOpen[0]) + ifOpen[0].length - 1 : -1
    let blockEndIdx = -1
    if (blockOpenIdx > -1) {
      let depth = 0
      for (let i = blockOpenIdx; i < codeOnly.length; i++) {
        if (codeOnly[i] === '{') depth++
        else if (codeOnly[i] === '}') {
          depth--
          if (depth === 0) {
            blockEndIdx = i
            break
          }
        }
      }
    }

    const domainIdx = codeOnly.search(/(?:let|const)\s+domainContext\b/)
    const engineIdx = codeOnly.search(/runSageReason\s*\(/)

    // FV-6a — decoupled: depends ONLY on fmtIdx and blockEndIdx. A rename
    // inside the block (domainContext, runSageReason) cannot perturb this.
    expectTrue(
      "FV-6a the format length check textually follows the ENTIRE R20a block, " +
        "not merely its opening (2026-09-06 ruling: the distress check AND its " +
        "redirect return run before the length guard on human-facing members; " +
        "anchored on the block's own closing brace so drift to ANYWHERE inside " +
        'it is caught, not just drift before the flag check)',
      fmtIdx > -1 && blockEndIdx > -1 && fmtIdx > blockEndIdx,
    )

    // FV-6b — decoupled: depends ONLY on fmtIdx, domainIdx, engineIdx.
    expectTrue(
      'FV-6b the format length check still precedes domainContext construction ' +
        'and the engine call (the engine-leak guarantee the guard exists for, ' +
        'unaffected by the ruling)',
      fmtIdx > -1 && domainIdx > -1 && engineIdx > -1 &&
        fmtIdx < domainIdx && fmtIdx < engineIdx,
    )

    // FV-6c — non-vacuity for 6a's anchors ONLY (a failing 6a should not be
    // read alongside a passing 6c that claims everything was found when only
    // the unrelated 6b anchors were).
    expectTrue(
      'FV-6c the block-end anchor was found and is non-degenerate (open != end), ' +
        'and format.length appears exactly once (an indexOf on a duplicate would ' +
        'silently measure the wrong occurrence)',
      blockOpenIdx > -1 && blockEndIdx > blockOpenIdx && fmtCount === 1,
    )

    // FV-6d — non-vacuity for 6b's anchors ONLY.
    expectTrue(
      'FV-6d domainContext and engine-call anchors were found (FV-6b is not ' +
        'deciding on -1)',
      domainIdx > -1 && engineIdx > -1,
    )
  }

  // FV-7 — the `conversation` MINIMUM-length guard, MOVED 2026-09-05 by
  // Session 3 (Group 1, item 1) of the perimeter-ordering audit under the same
  // ruling FV-6 encodes. The ruling's paradigm harm on this route: "I want to
  // die." is 14 characters and used to 400 here before the R20a block ran.
  // The guard was SPLIT: its presence/type half stays BEFORE the block (a
  // missing field has no text to screen); only `.trim().length < 20` moved.
  // Anchored, like FV-6a, on the flag block's brace-matched END via the
  // shared helper (string-blanked, so a brace in an error message cannot fool
  // it — closing the limit FV-6c's comment disclosed).
  {
    const flagBlock = structuralBlock(codeOnly, /if\s*\(\s*isScoreConversationR20aEnabled\s*\(\s*\)\s*\)\s*\{/)
    const minRe = /conversation\.trim\(\)\.length\s*<\s*20/
    // String contents are blanked in the helper's view: match the quotes, not the word.
    const presenceRe = new RegExp(`if\\s*\\(\\s*!conversation\\s*\\|\\|\\s*typeof\\s+conversation\\s*!==\\s*${QUOTED}\\s*\\)`)
    const minIdx = codeIndex(codeOnly, minRe)
    const presenceIdx = codeIndex(codeOnly, presenceRe)
    const fmtIdx7 = codeIndex(codeOnly, /format\.length\s*>\s*TEXT_LIMITS\.long/)
    const truncatedIdx = codeIndex(codeOnly, /const\s+truncated\s*=\s*conversation\.trim\(\)/)
    const domainIdx7 = codeIndex(codeOnly, /(?:let|const)\s+domainContext\b/)
    const engineIdx7 = codeIndex(codeOnly, /runSageReason\s*\(/)

    expectTrue(
      'FV-7a the conversation MINIMUM (<20) textually follows the ENTIRE R20a block ' +
        '(2026-09-06 ruling; anchored on the block\'s brace-matched END so a guard placed ' +
        'inside it — before OR after enforceDistressCheck — is caught)',
      minIdx > -1 && flagBlock.endIdx > -1 && minIdx > flagBlock.endIdx,
      `min=${minIdx} blockEnd=${flagBlock.endIdx}`,
    )
    expectTrue(
      'FV-7b the minimum precedes the format guard (so a short conversation + oversized format ' +
        'still 400s on the conversation message first — the contract the format move documented), ' +
        'the truncation, domainContext and the engine call',
      minIdx > -1 && fmtIdx7 > -1 && truncatedIdx > -1 && domainIdx7 > -1 && engineIdx7 > -1 &&
        minIdx < fmtIdx7 && minIdx < truncatedIdx && minIdx < domainIdx7 && minIdx < engineIdx7,
      `min=${minIdx} fmt=${fmtIdx7} truncated=${truncatedIdx} domain=${domainIdx7} engine=${engineIdx7}`,
    )
    expectTrue(
      'FV-7c non-vacuity: the minimum appears exactly once; the flag block was found exactly once ' +
        'and is non-degenerate',
      codeCount(codeOnly, minRe) === 1 && flagBlock.matches === 1 &&
        flagBlock.openIdx > -1 && flagBlock.endIdx > flagBlock.openIdx,
      `minCount=${codeCount(codeOnly, minRe)} matches=${flagBlock.matches} open=${flagBlock.openIdx} end=${flagBlock.endIdx}`,
    )
    expectTrue(
      'FV-7d the presence/type half of the split guard exists exactly once and stays BEFORE the block ' +
        '(a missing or non-string conversation has no text to screen and must not reach .trim())',
      codeCount(codeOnly, presenceRe) === 1 && presenceIdx > -1 && flagBlock.openIdx > -1 &&
        presenceIdx < flagBlock.openIdx,
      `presence=${presenceIdx} open=${flagBlock.openIdx}`,
    )
  }

  // FV-8 — the `conversation` and `context` MAXIMUM-length guards, MOVED
  // 2026-09-05 by Session 3B (Group 2, item 7) of the perimeter-ordering
  // audit under the same ruling. With these two moved, NO length guard
  // precedes the R20a block on this route. What reaches the classifier is
  // bounded by the COMPOSER's per-field cap (DISTRESS_SUBJECT_FIELD_CAP),
  // which FV-8c pins equal to TEXT_LIMITS.long — the guards' own bound — so
  // the cap equals the guard here exactly as the slice does on the siblings.
  //
  // MUTATION RECORD (2026-09-05, real file, hash-verified restore): the
  // `conversation` maximum placed BEFORE the block → FV-8a fails; placed
  // INSIDE the block between the check and the redirect return → FV-8a
  // fails; deleted → FV-8d fails (and FV-2 fails: a screened field with no
  // route bound); the composer cap changed to 14999 → FV-8c fails.
  {
    const flagBlock = structuralBlock(codeOnly, /if\s*\(\s*isScoreConversationR20aEnabled\s*\(\s*\)\s*\)\s*\{/)
    const convMaxRe = /conversation\.length\s*>\s*TEXT_LIMITS\.long/
    const ctxMaxRe = /context\.length\s*>\s*TEXT_LIMITS\.long/
    const minRe8 = /conversation\.trim\(\)\.length\s*<\s*20/
    const fmtRe8 = /format\.length\s*>\s*TEXT_LIMITS\.long/
    const truncatedRe8 = /const\s+truncated\s*=\s*conversation\.trim\(\)/
    const convMaxIdx = codeIndex(codeOnly, convMaxRe)
    const ctxMaxIdx = codeIndex(codeOnly, ctxMaxRe)
    const minIdx8 = codeIndex(codeOnly, minRe8)
    const fmtIdx8 = codeIndex(codeOnly, fmtRe8)
    const truncatedIdx8 = codeIndex(codeOnly, truncatedRe8)
    const LIMITS = readTextLimitsFromSource()

    expectTrue(
      'FV-8a BOTH the conversation and context MAXIMUM guards textually follow the ENTIRE R20a block ' +
        '(2026-09-06 ruling; anchored on the block\'s brace-matched END so a guard placed inside it — ' +
        'before OR after enforceDistressCheck — is caught)',
      convMaxIdx > -1 && ctxMaxIdx > -1 && flagBlock.endIdx > -1 &&
        convMaxIdx > flagBlock.endIdx && ctxMaxIdx > flagBlock.endIdx,
      `conv=${convMaxIdx} ctx=${ctxMaxIdx} blockEnd=${flagBlock.endIdx}`,
    )
    expectTrue(
      'FV-8b the maxima keep their relative order (conversation, then context), precede the minimum (the ' +
        'pre-Group-1 max-before-min message precedence), the format guard, and the engine truncation',
      convMaxIdx > -1 && ctxMaxIdx > convMaxIdx && minIdx8 > ctxMaxIdx && fmtIdx8 > minIdx8 &&
        truncatedIdx8 > fmtIdx8,
      `conv=${convMaxIdx} ctx=${ctxMaxIdx} min=${minIdx8} fmt=${fmtIdx8} truncated=${truncatedIdx8}`,
    )
    expectTrue(
      'FV-8c the composer\'s per-field cap IS the route\'s bound: DISTRESS_SUBJECT_FIELD_CAP === TEXT_LIMITS.long ' +
        '(15,000, read from security.ts source) — so the classifier\'s input is bounded at exactly the guards\' value',
      DISTRESS_SUBJECT_FIELD_CAP === LIMITS.long && LIMITS.long === 15000,
      `cap=${DISTRESS_SUBJECT_FIELD_CAP} long=${LIMITS.long}`,
    )
    expectTrue(
      'FV-8d non-vacuity: each maximum appears exactly once; the flag block was found exactly once and is non-degenerate; ' +
        'the three NAMED guards (conversation-max, context-max, conversation-min, format-max) all sit after its end',
      codeCount(codeOnly, convMaxRe) === 1 && codeCount(codeOnly, ctxMaxRe) === 1 &&
        flagBlock.matches === 1 && flagBlock.openIdx > -1 && flagBlock.endIdx > flagBlock.openIdx &&
        minIdx8 > flagBlock.endIdx && fmtIdx8 > flagBlock.endIdx,
      `convCount=${codeCount(codeOnly, convMaxRe)} ctxCount=${codeCount(codeOnly, ctxMaxRe)} matches=${flagBlock.matches} open=${flagBlock.openIdx} end=${flagBlock.endIdx}`,
    )
    // FV-8e — the CLASS fence (PR19 fold 2026-09-06). FV-8d's first cut was
    // TITLED "no length guard of any kind precedes the block" while asserting
    // only the named forms; a reviewer added `validateTextLength(conversation,
    // …)` and a bare `.length > 15000` before the flag block and the battery
    // stayed 74/74. This pin sweeps the whole pre-block span for the class.
    {
      const postIdx = codeIndex(codeOnly, POST_HANDLER_RE)
      const preSpan = postIdx > -1 && flagBlock.openIdx > postIdx ? codeOnly.slice(postIdx, flagBlock.openIdx) : ''
      expectTrue(
        'FV-8e no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the R20a flag block — the class, not the instance',
        postIdx > -1 && flagBlock.openIdx > postIdx &&
          codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
        `post=${postIdx} blockOpen=${flagBlock.openIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
      )
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- r20a-invocation.test.ts (/api/score-conversation route-level R20a catch) ---')

  runInvocationTests()
  runStructuralTests()
  runFlagTests()
  runSubjectCompositionTests()
  runFieldValidationTests()
  await runMildEscalationTests()
  runMildFoldTests()
  runHumanRenderingTests()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unhandled test error:', err)
  process.exit(1)
})
