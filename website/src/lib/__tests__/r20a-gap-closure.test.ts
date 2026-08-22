/**
 * r20a-gap-closure.test.ts — RUNTIME battery for the shared R20a gap-closure
 * module (src/lib/r20a-gap-closure.ts), which 25 perimeter routes consume and
 * which had NO dedicated test of its own until this file (mechanical item 2,
 * 2026-08-22 — the per-route runtime invocation test gap).
 *
 * WHY RUNTIME: the central guard battery (r20a-invocation-guard.test.ts) and
 * the per-route wiring battery (r20a-gap-closure-route-wiring.test.ts) assert
 * on SOURCE TEXT. Neither executes anything. Every function below is the real
 * exported implementation, called with real inputs — including the real
 * stage-1 distress regex (detectDistress) where the property under test is
 * "distress written here actually reaches the classifier's subject."
 *
 * This matters doubly since 2026-08-22 (bbd89d1): every consumer route now
 * gates its billed classifier call on hasScreenableSubject(subject), so the
 * composer + gate pair IS the control flow deciding whether the R20a check
 * runs at all. A defect here is a defect in the perimeter's reachability.
 *
 * COVERAGE
 *   FT-*   flag semantics (isR20aGapClosureEnabled — unset/'true'/'false'/'1')
 *   CS-*   composeDistressSubject — verbatim pass-through, ordering, skip
 *          rules, per-field cap, fieldCap override, the 20-field bound, raw
 *          (untrimmed) values
 *   HS-*   hasScreenableSubject — the empty-subject skip added at bbd89d1
 *   SEP-*  the field-seam guarantee, exercised through the REAL stage-1 regex
 *   CO-*   the five exported collectors (prioritise items, baseline answers,
 *          founder-facts PUT, appendix answers, mentor profile) — realistic
 *          bodies, malformed bodies, and the distress-reaches-subject property
 *   MS-*   buildMildSupportResources — all three variants, the shared resource
 *          list, non-blocking wording, and the FOUNDER-SIGNED opening lines
 *          pinned verbatim (the module forbids rewording without sign-off; a
 *          silent reword now fails a test instead of shipping)
 *
 * NOT COVERED HERE: route-level wiring (see the route-wiring battery) and the
 * live Haiku stage-2 path (r20a-classifier-eval.ts + founder-walked smokes).
 *
 * Deliberately does NOT import @/lib/security (TEXT_LIMITS): security.ts
 * starts a setInterval keepalive that hangs bare tsx runs (standing memory
 * `tsx-tests-setinterval-keepalive-hang`). The one place a security constant
 * matters (founder/hub's TEXT_LIMITS.long fieldCap override) is tested with
 * the literal 15000 and pinned textually in the route-wiring battery.
 *
 * Run (from website/): npx tsx src/lib/__tests__/r20a-gap-closure.test.ts
 * No API key, no network, no --env-file. EXIT 0 all pass; EXIT 1 any fail.
 *
 * Rules served: R20a; AC4 (invocation/functional testing); AC5; PR3; PR15
 * (mirrors the impulse/journal per-route test pattern); PR23 (memory-first —
 * the security.ts hang memory consulted before writing, hence no such import).
 */

import {
  isR20aGapClosureEnabled,
  R20A_GAP_CLOSURE_ENV_VAR,
  composeDistressSubject,
  hasScreenableSubject,
  collectPrioritiseItemText,
  collectBaselineAnswerText,
  collectFounderFactsPutText,
  collectAppendixAnswerText,
  collectMentorProfileText,
  buildMildSupportResources,
  DISTRESS_SUBJECT_FIELD_CAP,
  DISTRESS_SUBJECT_MAX_FIELDS,
  DISTRESS_SUBJECT_SEPARATOR,
} from '@/lib/r20a-gap-closure'
import { detectDistress, getCrisisResources } from '@/lib/guardrails'

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

const SEP = DISTRESS_SUBJECT_SEPARATOR

// ============================================================================
// FT-* — flag semantics
// ============================================================================

function runFlagTests(): void {
  const saved = process.env[R20A_GAP_CLOSURE_ENV_VAR]

  delete process.env[R20A_GAP_CLOSURE_ENV_VAR]
  expectEq('FT-1 unset → false', isR20aGapClosureEnabled(), false)

  process.env[R20A_GAP_CLOSURE_ENV_VAR] = 'true'
  expectEq('FT-2 "true" → true', isR20aGapClosureEnabled(), true)

  process.env[R20A_GAP_CLOSURE_ENV_VAR] = 'false'
  expectEq('FT-3 "false" → false', isR20aGapClosureEnabled(), false)

  process.env[R20A_GAP_CLOSURE_ENV_VAR] = '1'
  expectEq('FT-4 "1" → false (case/value-strict, mirrors the sibling flags)', isR20aGapClosureEnabled(), false)

  if (saved === undefined) delete process.env[R20A_GAP_CLOSURE_ENV_VAR]
  else process.env[R20A_GAP_CLOSURE_ENV_VAR] = saved
}

// ============================================================================
// CS-* — composeDistressSubject
// ============================================================================

function runComposerTests(): void {
  expectEq('CS-1 single value → verbatim (no trim, no separator)',
    composeDistressSubject(['When Dana presented the plan']),
    'When Dana presented the plan')

  expectEq('CS-2 ordered join with the separator',
    composeDistressSubject(['a', 'b', 'c']),
    `a${SEP}b${SEP}c`)

  expectEq('CS-3 non-strings, null, undefined, empty and whitespace-only skipped',
    composeDistressSubject([null, undefined, 42, { x: 1 }, '', '   ', 'kept', ['arr']]),
    'kept')

  expectEq('CS-4 all-skippable input → empty string', composeDistressSubject([null, '', '  ', 7]), '')

  // CS-5: raw values, not trimmed/normalised — the check runs over what the
  // practitioner actually sent (the module's stated contract).
  expectEq('CS-5 kept values are RAW (leading/trailing whitespace preserved)',
    composeDistressSubject(['  padded  ']),
    '  padded  ')

  // CS-6: the per-field cap protects LATER fields from an oversized earlier one.
  {
    const oversized = 'x'.repeat(DISTRESS_SUBJECT_FIELD_CAP + 2000) + ' I want to end my life'
    const subject = composeDistressSubject([oversized, 'later field'])
    expectTrue('CS-6a a field contributes at most DISTRESS_SUBJECT_FIELD_CAP chars',
      subject.length <= DISTRESS_SUBJECT_FIELD_CAP + SEP.length + 'later field'.length)
    expectTrue('CS-6b disclosed residual: text past the cap does not reach the subject',
      !subject.includes('I want to end my life'))
    expectTrue('CS-6c the LATER field survives the earlier oversized one (the cap doing its job)',
      subject.endsWith('later field'))
    const inHead = 'I want to end my life ' + 'x'.repeat(DISTRESS_SUBJECT_FIELD_CAP)
    expectTrue('CS-6d distress within the first cap-length chars of a field DOES reach the subject',
      composeDistressSubject([inHead]).includes('I want to end my life'))
  }

  // CS-7: the fieldCap override (founder/hub passes TEXT_LIMITS.long = 15000
  // for its single 15000-validated `message` field — the default would screen
  // only the first third). Literal 15000 on purpose; see the header.
  {
    const long = 'y'.repeat(14000) + ' I want to end my life'
    expectTrue('CS-7a default cap truncates a 14k-char prefix before the distress text',
      !composeDistressSubject([long]).includes('I want to end my life'))
    expectTrue('CS-7b fieldCap override 15000 lets the same distress text through',
      composeDistressSubject([long], 15000).includes('I want to end my life'))
  }

  // CS-8: the 20-field bound (DISTRESS_SUBJECT_MAX_FIELDS).
  {
    const many = Array.from({ length: DISTRESS_SUBJECT_MAX_FIELDS + 5 }, (_, i) => `field-${i}`)
    const subject = composeDistressSubject(many)
    expectEq('CS-8a at most DISTRESS_SUBJECT_MAX_FIELDS fields are composed',
      subject.split(SEP).length, DISTRESS_SUBJECT_MAX_FIELDS)
    expectTrue('CS-8b the bound keeps the FIRST fields (order = collection priority)',
      subject.startsWith('field-0') && subject.includes('field-19') && !subject.includes('field-20'))
  }

  expectEq('CS-9 empty input array → empty string', composeDistressSubject([]), '')

  // CS-10: skipped values do not consume slots under the bound — 20 REAL
  // fields survive even when interleaved with skippable junk.
  {
    const interleaved: unknown[] = []
    for (let i = 0; i < DISTRESS_SUBJECT_MAX_FIELDS; i++) {
      interleaved.push(null, `real-${i}`)
    }
    expectEq('CS-10 skippable values do not consume field slots',
      composeDistressSubject(interleaved).split(SEP).length,
      DISTRESS_SUBJECT_MAX_FIELDS)
  }
}

// ============================================================================
// HS-* — hasScreenableSubject (the bbd89d1 empty-subject skip)
// ============================================================================

function runScreenableTests(): void {
  expectEq('HS-1 empty string → false (classifier skipped, no billed call)', hasScreenableSubject(''), false)
  expectEq('HS-2 whitespace-only → false', hasScreenableSubject('   \n\t  '), false)
  expectEq('HS-3 any real text → true', hasScreenableSubject('x'), true)
  expectEq('HS-4 composeDistressSubject([]) → not screenable (the malformed-body path)',
    hasScreenableSubject(composeDistressSubject([])), false)
  expectEq('HS-5 composeDistressSubject over only-skippable values → not screenable',
    hasScreenableSubject(composeDistressSubject([null, 42, '  '])), false)
  // HS-6: the load-bearing direction — a subject with ANY genuine text remains
  // screenable, so the skip can never mute a real disclosure.
  expectEq('HS-6 a subject with one real field IS screenable (the skip cannot mute a disclosure)',
    hasScreenableSubject(composeDistressSubject([null, '', 'I am not okay'])), true)
}

// ============================================================================
// SEP-* — the field-seam guarantee, through the REAL stage-1 regex
// ============================================================================

function runSeamTests(): void {
  // SEP-1: two benign adjacent fields must not bridge into a false acute
  // across the seam (multi-word DISTRESS_PATTERNS use \s+, which matches a
  // bare \n\n — the '---' token exists to break exactly this).
  {
    const bridged = composeDistressSubject([
      'The team was picking a film and I realised I did not want to',
      'Die Hard is not actually a Christmas film, and saying so cost me nothing',
    ])
    expectEq('SEP-1 benign adjacent fields do not bridge into a false acute across the seam',
      detectDistress(bridged).distress_detected, false)
  }
  // SEP-2: a within-field acute phrase still fires through the composed subject.
  {
    const within = composeDistressSubject([
      'benign first field',
      'honestly I want to die, none of this is working',
    ])
    expectEq('SEP-2 within-field acute phrase still fires through the composed subject',
      detectDistress(within).severity, 'acute')
  }
}

// ============================================================================
// CO-* — the five exported collectors
// ============================================================================

function runCollectorTests(): void {
  // ── collectPrioritiseItemText ──
  expectEq('CO-P1 legacy single-string items → one field (whole blob, no seam)',
    composeDistressSubject(collectPrioritiseItemText('task one\ntask two')),
    'task one\ntask two')
  expectEq('CO-P2 array-of-strings items collected in order',
    composeDistressSubject(collectPrioritiseItemText(['alpha', 'beta'])),
    `alpha${SEP}beta`)
  expectEq('CO-P3 structured items → description fields',
    composeDistressSubject(collectPrioritiseItemText([
      { id: 'a', description: 'first item' },
      { id: 'b', description: 'second item' },
    ])),
    `first item${SEP}second item`)
  expectEq('CO-P4 malformed items (object, number, null) → nothing collected, no throw',
    collectPrioritiseItemText({ not: 'an array' }).length, 0)
  expectEq('CO-P5 distress in a structured description reaches the classifier',
    detectDistress(composeDistressSubject(collectPrioritiseItemText([
      { id: 'a', description: 'ship the Q3 report' },
      { id: 'b', description: 'I want to die, nothing matters anymore' },
    ]))).severity, 'acute')

  // ── collectBaselineAnswerText ──
  expectEq('CO-B1 collects answer fields only (system-authored question_text excluded)',
    composeDistressSubject(collectBaselineAnswerText([
      { question_id: 'q1', question_text: 'What do you value?', answer: 'my family' },
      { question_id: 'q2', question_text: 'What do you fear?', answer: 'failing them' },
    ])),
    `my family${SEP}failing them`)
  expectEq('CO-B2 malformed responses (non-array) → nothing collected, no throw',
    collectBaselineAnswerText('not an array').length, 0)
  expectEq('CO-B3 distress in an answer reaches the classifier',
    detectDistress(composeDistressSubject(collectBaselineAnswerText([
      { question_id: 'q1', answer: 'I want to end my life' },
    ]))).severity, 'acute')

  // ── collectFounderFactsPutText ──
  {
    const collected = composeDistressSubject(collectFounderFactsPutText({
      age: 47,
      years_married: 12,
      children_ages: [8, 11],
      work_schedule: 'four days a week',
      family_situation: 'married, two children',
      financial_situation: 'stable but stretched',
      retirement_horizon: 'fifteen years out',
      additional_context: ['first context note', 'second context note'],
    }))
    expectTrue('CO-F1 all four prose fields + additional_context entries collected',
      collected.includes('four days a week') &&
      collected.includes('married, two children') &&
      collected.includes('stable but stretched') &&
      collected.includes('fifteen years out') &&
      collected.includes('first context note') &&
      collected.includes('second context note'))
    expectTrue('CO-F2 numeric fields excluded (never prose)',
      !collected.includes('47') && !collected.includes('12'))
  }
  expectEq('CO-F3 malformed facts (null) → nothing collected, no throw',
    collectFounderFactsPutText(null).length, 0)

  // ── collectAppendixAnswerText ──
  expectEq('CO-A1 collects the VALUES of the answers object',
    composeDistressSubject(collectAppendixAnswerText({ q1: 'first answer', q2: 'second answer' })),
    `first answer${SEP}second answer`)
  expectEq('CO-A2 array is rejected (answers must be a plain object)',
    collectAppendixAnswerText(['not', 'an', 'object']).length, 0)
  expectEq('CO-A3 malformed answers (null) → nothing collected, no throw',
    collectAppendixAnswerText(null).length, 0)

  // ── collectMentorProfileText ──
  {
    const collected = composeDistressSubject(collectMentorProfileText({
      display_name: 'Test Practitioner',
      passion_map: [{ passion: 'phobos', false_judgement: 'if I fail the deadline everything collapses' }],
      persisting_passions: ['fear of failing the deadline'],
      causal_tendencies: [{ description: 'catastrophises under time pressure', examples: ['the Q2 launch'] }],
      virtue_profile: [{ domain: 'andreia', evidence: 'held steady in the outage' }],
      journal_references: [{ id: 'j1', summary: 'wrote about the storm passing' }],
      proximity_estimate_description: 'deliberate, with lapses under pressure',
      current_prescription: { rationale: 'practise the evening review daily' },
      preferred_indifferents: ['quiet mornings'],
      founder_facts: { work_schedule: 'four days', additional_context: ['carer for a parent'] },
      oikeiosis_map: [{ person_or_role: 'spouse', relationship: 'closest circle' }],
      value_hierarchy: [{ item: 'family before work' }],
    }))
    expectTrue('CO-M1 prose fields collected (false_judgement, tendencies, evidence, summary, rationale)',
      collected.includes('everything collapses') &&
      collected.includes('catastrophises under time pressure') &&
      collected.includes('the Q2 launch') &&
      collected.includes('held steady in the outage') &&
      collected.includes('the storm passing') &&
      collected.includes('deliberate, with lapses') &&
      collected.includes('practise the evening review'))
    expectTrue('CO-M2 persisting_passions + preferred_indifferents collected (the PR19 2026-08-18 regression)',
      collected.includes('fear of failing the deadline') && collected.includes('quiet mornings'))
    expectTrue('CO-M3 founder_facts free text collected through the shared collector',
      collected.includes('four days') && collected.includes('carer for a parent'))
    expectTrue('CO-M4 label-like fields still present when the subject is small',
      collected.includes('spouse') && collected.includes('family before work'))
  }
  // CO-M5: the ORDERING property — prose first, labels last, so under the
  // 20-field bound a label flood can never displace a false_judgement
  // disclosure. This is the documented load-bearing collection order.
  {
    const labelFlood = Array.from({ length: 30 }, (_, i) => ({
      person_or_role: `role-${i}`,
      relationship: `relationship-${i}`,
    }))
    const subject = composeDistressSubject(collectMentorProfileText({
      passion_map: [{ false_judgement: 'I want to end my life' }],
      oikeiosis_map: labelFlood,
    }))
    expectTrue('CO-M5a the false_judgement disclosure survives a 30-entry label flood',
      subject.includes('I want to end my life'))
    expectEq('CO-M5b …and the real regex still fires acute on the composed subject',
      detectDistress(subject).severity, 'acute')
  }
  expectEq('CO-M6 malformed profile (null) → nothing collected, no throw',
    collectMentorProfileText(null).length, 0)
}

// ============================================================================
// MS-* — buildMildSupportResources (all three variants)
// ============================================================================

function runMildFoldTests(): void {
  const variants = ['passion', 'practice', 'skill'] as const
  const resources = getCrisisResources()

  for (const v of variants) {
    const fold = buildMildSupportResources(v)
    expectEq(`MS-1 (${v}) severity is "mild"`, fold.severity, 'mild')

    let allPresent = true
    for (const r of resources.resources) {
      if (!fold.message.includes(`${r.name}: ${r.contact} (${r.available})`)) {
        allPresent = false
        fail(`MS-2 (${v}) resource line present: ${r.name}`, 'missing from the mild fold message')
      }
    }
    if (allPresent) pass(`MS-2 (${v}) every getCrisisResources() line present`)
    expectTrue(`MS-3 (${v}) primary header + closing present`,
      fold.message.includes(resources.primary) && fold.message.includes(resources.closing))
    expectTrue(`MS-4 (${v}) non-blocking wording — no "paused" language`,
      !fold.message.toLowerCase().includes('paused'))
  }

  expectTrue('MS-5 shared source sanity: at least 7 resource lines',
    resources.resources.length >= 7, `got ${resources.resources.length}`)

  // MS-6..8: the FOUNDER-SIGNED opening lines, pinned VERBATIM. The module
  // forbids rewording without founder sign-off on the exact replacement text
  // ("crisis-adjacent copy shown to a practitioner the classifier has just
  // flagged"); these pins turn that comment into an executable gate. A signed
  // reword updates the pin in the same commit — that is the intended friction.
  expectTrue('MS-6 passion opening: verbatim (saved + examining-a-passion reassurance)',
    buildMildSupportResources('passion').message.startsWith(
      'Your entry is saved, and naming this plainly was the right thing to do — ' +
      'examining a passion is not the same as being ruled by one. ' +
      'Some of what you wrote sounds like it may be weighing on you beyond this exercise, ' +
      'so the support below is here if any of it reflects your situation right now.'))
  expectTrue('MS-7 practice opening: verbatim (saved + examining-something-difficult reassurance)',
    buildMildSupportResources('practice').message.startsWith(
      'Your entry is saved, and working through this deliberately was the right thing to do — ' +
      'examining something difficult is not the same as being overcome by it. ' +
      'Some of what you wrote sounds like it may be weighing on you beyond this exercise, ' +
      'so the support below is here if any of it reflects your situation right now.'))
  expectTrue('MS-8 skill opening: verbatim (neutral, no presumed examination, no "entry saved" claim)',
    buildMildSupportResources('skill').message.startsWith(
      'Some of what you wrote sounds like it may be weighing on you beyond this task. ' +
      'The support below is here if any of it reflects your situation right now.'))
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log('--- r20a-gap-closure.test.ts (shared-module runtime battery) ---')

  runFlagTests()
  runComposerTests()
  runScreenableTests()
  runSeamTests()
  runCollectorTests()
  runMildFoldTests()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
  if (failCount > 0) process.exit(1)
}

main()
