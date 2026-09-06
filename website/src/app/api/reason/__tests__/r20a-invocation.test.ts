/**
 * r20a-invocation.test.ts — per-route EXECUTION-ORDER pins for /api/reason's
 * HUMAN path. Created 2026-09-05 by Session 3B (Group 2, item 10 — Election
 * B folded it into the sitting) of the perimeter-ordering audit
 * (operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-
 * AUDIT.md §6), executing the 2026-09-06 mentor ruling on the one
 * DUAL-AUDIENCE member whose human path was non-conformant (audit §4.5).
 *
 * Run: npx tsx src/app/api/reason/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * The sibling r20a-audience-rendering.test.ts covers the audience-correct
 * renderer; this file covers ORDER. The design (route comment at the
 * closure): the four text-length guards live in ONE closure
 * (`textLengthGuardError`) and are CALLED at TWO sites — the AGENT path at the
 * guards' original position (purpose (a): nothing moves for a credential),
 * the HUMAN path AFTER the R20a check and its redirect return. The audit's
 * sweep is per-handler and cannot see the audience split; these pins can.
 *
 * COVERAGE
 *   INV-1..2  — exactly one AC5 call site; the redirect block found once.
 *   ORD-1     — the closure holds each of the four guards exactly once.
 *   ORD-2     — the AGENT-path call precedes the check (the original site) and
 *               precedes the clarification TYPE check (original relative order).
 *   ORD-3     — the HUMAN-path call follows the structural END of the redirect
 *               block and precedes continuation-token validation + the engine.
 *   ORD-4     — the two call sites are keyed on the SAME determinant
 *               (`r20aAudience`), one `!==`, one `===`, each exactly once.
 *   ORD-5     — no bare guard survives outside the closure (a guard re-added
 *               inline before the check would re-open the harm).
 *   CAP-1..3  — the classifier receives `screenedInput` (= input.slice(0,
 *               TEXT_LIMITS.medium)) via the existing continuation composer,
 *               never raw `input`; the clarification answer is sliced at the
 *               same bound; TEXT_LIMITS.medium is the audit's M bound.
 *   R3-1..2   — Branch 2 (the masked-200 fallback) now calls logRouteError
 *               with the thrown cause and the real status (Election B).
 *
 * MUTATION RECORD (2026-09-05, real file, hash-verified restore): the
 * human-path call moved BEFORE the check → ORD-3 fails; moved BETWEEN the
 * check and the redirect return → ORD-3 fails; the human-path call deleted →
 * ORD-4 fails; a bare `validateTextLength(input, …)` re-added before the
 * check → ORD-1 + ORD-5 fail; the agent-path call moved after the check →
 * ORD-2 fails; the cap removed (raw `input` to the composer) → CAP-1 fails.
 *
 * NOT COVERED: end-to-end HTTP; byte-identity of the agent path is a PR19
 * reviewer dimension (an in-repo diff of the agent-path control flow), not a
 * textual pin. The founder-walked smoke: a session (Bearer JWT) with an
 * oversized distressed `input` → 200 with the crisis form; oversized benign →
 * 400 `Input exceeds maximum length`.
 */

import * as path from 'path'
import {
  loadCodeOnly,
  structuralBlock,
  codeIndex,
  codeIndexAfter,
  codeCount,
  readTextLimitsFromSource,
  QUOTED,
  BARE_LENGTH_GUARD_RE,
  VALIDATE_TEXT_LENGTH_CALL_RE,
  POST_HANDLER_RE,
} from '@/lib/__tests__/r20a-ordering-pin-helpers'

let passCount = 0
let failCount = 0
function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) {
    console.log(`PASS — ${name}`)
    passCount++
  } else {
    console.log(`FAIL — ${name}${hint ? `: ${hint}` : ''}`)
    failCount++
  }
}

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')
const code = loadCodeOnly(ROUTE_PATH)
const LIMITS = readTextLimitsFromSource()

const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*distressSubjectText\s*\)\s*\)/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
const CLOSURE_DEF_RE = /const\s+textLengthGuardError\s*=\s*\(\s*\)\s*:\s*string\s*\|\s*null\s*=>\s*\{/
const GUARD_INPUT_RE = new RegExp(`validateTextLength\\(\\s*input\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const GUARD_CONTEXT_RE = new RegExp(`validateTextLength\\(\\s*context\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const GUARD_DOMAIN_RE = new RegExp(`validateTextLength\\(\\s*domain_context\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const GUARD_CLARIFICATION_RE = new RegExp(`validateTextLength\\(\\s*clarification_response\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*,?\\s*\\)`)
const AGENT_CALL_RE = new RegExp(`if\\s*\\(\\s*r20aAudience\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{\\s*const\\s+agentLengthErr\\s*=\\s*textLengthGuardError\\s*\\(\\s*\\)`)
const HUMAN_CALL_RE = new RegExp(`if\\s*\\(\\s*r20aAudience\\s*===\\s*${QUOTED}\\s*\\)\\s*\\{\\s*const\\s+humanLengthErr\\s*=\\s*textLengthGuardError\\s*\\(\\s*\\)`)
const CLARIFICATION_TYPE_RE = new RegExp(`typeof\\s+clarification_response\\s*!==\\s*${QUOTED}`)
const TOKEN_VALIDATION_RE = /validateContinuationToken\s*\(\s*continuation_token\s*,\s*input\s*\)/
const ENGINE_RE = /runSandwich\s*\(\s*\{/
const SCREENED_INPUT_RE = /const\s+screenedInput\s*=\s*input\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const COMPOSER_SCREENED_RE = /composeContinuationDistressText\s*\(\s*screenedInput\s*,/
const COMPOSER_RAW_RE = /composeContinuationDistressText\s*\(\s*input\b/
const CLARIFICATION_CAP_RE = /clarification_response\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const SUBJECT_FALLBACK_RE = /:\s*screenedInput\s*\n?\s*const\s+gate\s*=/
const R3_LOG_RE = /logRouteError\s*\(\s*\{\s*route\s*:\s*['"][^'"]*['"]\s*,\s*method\s*:\s*['"][^'"]*['"]\s*,\s*error\s*:\s*sandwichResult\.error_cause/
const R3_STATUS_RE = /statusCode\s*:\s*200\s*,\s*isLlmOutage\s*:\s*isLlmOutage\s*\(\s*sandwichResult\.error_cause\s*\)/
const R3_CONTEXT_RE = /fallback_reason\s*:\s*sandwichResult\.error\s*,\s*masked_fallback\s*:\s*true/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const closureIdx = codeIndex(code, CLOSURE_DEF_RE)
const agentCallIdx = codeIndex(code, AGENT_CALL_RE)
const humanCallIdx = codeIndex(code, HUMAN_CALL_RE)
const clarificationTypeIdx = codeIndex(code, CLARIFICATION_TYPE_RE)
const tokenIdx = codeIndexAfter(code, TOKEN_VALIDATION_RE, checkIdx)
const engineIdx = codeIndexAfter(code, ENGINE_RE, checkIdx)
const screenedInputIdx = codeIndex(code, SCREENED_INPUT_RE)
const guardInputIdx = codeIndex(code, GUARD_INPUT_RE)

expectTrue(
  'INV-1 exactly ONE awaited route-level enforceDistressCheck(detectDistressTwoStage(distressSubjectText)) call site',
  codeCount(code, CHECK_RE) === 1 && /await\s+enforceDistressCheck\s*\(/.test(code),
  `count=${codeCount(code, CHECK_RE)}`,
)
expectTrue(
  'INV-2 the redirect-return block (if (gate.shouldRedirect) {) was found exactly once, is non-degenerate, and follows the check',
  block.matches === 1 && block.openIdx > checkIdx && block.endIdx > block.openIdx && checkIdx > -1,
  `matches=${block.matches} open=${block.openIdx} end=${block.endIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-1 the closure textLengthGuardError exists exactly once and holds each of the four guards (input, context, domain_context, clarification_response) exactly once, all inside it',
  codeCount(code, CLOSURE_DEF_RE) === 1 &&
    codeCount(code, GUARD_INPUT_RE) === 1 && codeCount(code, GUARD_CONTEXT_RE) === 1 &&
    codeCount(code, GUARD_DOMAIN_RE) === 1 && codeCount(code, GUARD_CLARIFICATION_RE) === 1 &&
    closureIdx > -1 && guardInputIdx > closureIdx &&
    codeIndex(code, GUARD_CLARIFICATION_RE) > closureIdx && codeIndex(code, GUARD_CLARIFICATION_RE) < agentCallIdx,
  `closure=${closureIdx} input=${guardInputIdx} counts=${codeCount(code, GUARD_INPUT_RE)}/${codeCount(code, GUARD_CONTEXT_RE)}/${codeCount(code, GUARD_DOMAIN_RE)}/${codeCount(code, GUARD_CLARIFICATION_RE)} agentCall=${agentCallIdx}`,
)
expectTrue(
  'ORD-2 the AGENT-path call sits at the guards\' original position: after the closure, BEFORE the clarification TYPE check and BEFORE the distress check (purpose (a): nothing moves for a credential)',
  agentCallIdx > closureIdx && closureIdx > -1 && clarificationTypeIdx > agentCallIdx && checkIdx > clarificationTypeIdx,
  `closure=${closureIdx} agentCall=${agentCallIdx} clarType=${clarificationTypeIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-3 the HUMAN-path call follows the structural END of the redirect-return block ' +
    '(2026-09-06 ruling; anchored on the block\'s own closing brace, so drift to anywhere inside it — ' +
    'before OR after the check — is caught) and precedes continuation-token validation and the engine',
  humanCallIdx > -1 && block.endIdx > -1 && humanCallIdx > block.endIdx &&
    tokenIdx > -1 && engineIdx > -1 && humanCallIdx < tokenIdx && humanCallIdx < engineIdx,
  `humanCall=${humanCallIdx} blockEnd=${block.endIdx} token=${tokenIdx} engine=${engineIdx}`,
)
expectTrue(
  'ORD-4 the two call sites key on the same determinant (r20aAudience), one !== and one ===, each exactly once',
  codeCount(code, AGENT_CALL_RE) === 1 && codeCount(code, HUMAN_CALL_RE) === 1 &&
    codeCount(code, /textLengthGuardError\s*\(\s*\)/) === 2,
  `agent=${codeCount(code, AGENT_CALL_RE)} human=${codeCount(code, HUMAN_CALL_RE)} calls=${codeCount(code, /textLengthGuardError\s*\(\s*\)/)}`,
)
expectTrue(
  'ORD-5 no bare length guard survives outside the closure: every validateTextLength( in the file is one of the four inside it',
  codeCount(code, /validateTextLength\s*\(/) === 4,
  `validateTextLength count=${codeCount(code, /validateTextLength\s*\(/)}`,
)
// ORD-6 / ORD-7 — PR19 folds 2026-09-06.
// ORD-6: the two call sites' audience LITERALS, read on the comment-stripped
// but UN-blanked source. QUOTED blanks string contents, so the AGENT_CALL_RE /
// HUMAN_CALL_RE pins key on the variable names and the operator only — a
// reviewer swapped both literals to 'agent_developer' (a valid R20aAudience
// member), which inverted BOTH paths (a signed-in practitioner hit the guards
// before the check again) and the battery stayed 12/12.
{
  const agentLiteralRe = /if\s*\(\s*r20aAudience\s*!==\s*'human_user'\s*\)\s*\{\s*const\s+agentLengthErr\s*=\s*textLengthGuardError\s*\(\s*\)/g
  const humanLiteralRe = /if\s*\(\s*r20aAudience\s*===\s*'human_user'\s*\)\s*\{\s*const\s+humanLengthErr\s*=\s*textLengthGuardError\s*\(\s*\)/g
  const agentN = (code.match(agentLiteralRe) ?? []).length
  const humanN = (code.match(humanLiteralRe) ?? []).length
  expectTrue(
    "ORD-6 the agent-path site reads `r20aAudience !== 'human_user'` and the human-path site `r20aAudience === 'human_user'` — the literal itself, exactly once each (unblanked source)",
    agentN === 1 && humanN === 1,
    `agentLiteral=${agentN} humanLiteral=${humanN}`,
  )
}
// ORD-7: the CLASS fence over the pre-check span, EXCLUDING the closure's own
// body (which legitimately holds the four guards) — a decoy `if (input.length
// > TEXT_LIMITS.medium) …` (or `> 5000`) placed before the check passed every
// positional pin green.
{
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const closure = structuralBlock(code, CLOSURE_DEF_RE)
  const spanOk = postIdx > -1 && closure.openIdx > postIdx && closure.endIdx > closure.openIdx && checkIdx > closure.endIdx
  const preSpan = spanOk ? code.slice(postIdx, closure.openIdx) + code.slice(closure.endIdx, checkIdx) : ''
  expectTrue(
    'ORD-7 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check outside the closure body — the class, not the instance',
    spanOk && closure.matches === 1 &&
      codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
    `post=${postIdx} closure=${closure.openIdx}..${closure.endIdx} (${closure.matches}) check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
  )
}
expectTrue(
  'CAP-1 the classifier subject is built from screenedInput (= input.slice(0, TEXT_LIMITS.medium)) on BOTH branches, never from raw input',
  codeCount(code, SCREENED_INPUT_RE) === 1 && screenedInputIdx > -1 && screenedInputIdx < checkIdx &&
    codeCount(code, COMPOSER_SCREENED_RE) === 1 && codeCount(code, COMPOSER_RAW_RE) === 0 &&
    SUBJECT_FALLBACK_RE.test(code),
  `screened=${codeCount(code, SCREENED_INPUT_RE)} composerScreened=${codeCount(code, COMPOSER_SCREENED_RE)} composerRaw=${codeCount(code, COMPOSER_RAW_RE)} fallback=${SUBJECT_FALLBACK_RE.test(code)}`,
)
expectTrue(
  'CAP-2 the clarification answer is sliced at the same bound before the composer (exactly once)',
  codeCount(code, CLARIFICATION_CAP_RE) === 1 && codeIndex(code, CLARIFICATION_CAP_RE) < checkIdx,
  `count=${codeCount(code, CLARIFICATION_CAP_RE)}`,
)
expectTrue(
  'CAP-3 TEXT_LIMITS.medium is the audit\'s M bound (5,000) as read from security.ts source — the cap equals the guard',
  LIMITS.medium === 5000,
  `medium=${LIMITS.medium}`,
)
// FLD-* — Session 3C (Group 2b, 2026-09-06): the `session_marker` and
// `loop_id` 400s (the audit's §4.4 class O on this route; mentor Part 5)
// moved after the redirect return on the HUMAN path via a dual-site closure
// of exactly the Group 2 length-guard shape. The agent path calls the same
// closure at the original site (purpose (a): nothing moves for a credential).
{
  const FIELD_CLOSURE_RE = /const\s+preSubstrateFieldGuardError\s*=\s*\(\s*\)\s*:\s*string\s*\|\s*null\s*=>\s*\{/
  const MARKER_MEMBERSHIP_RE = /SESSION_MARKER_VALUES\s+as\s+readonly\s+string\[\]\)\.includes\s*\(/
  const LOOP_VALIDATE_RE = /validateLoopId\s*\(\s*loop_id\s*\)/
  const MARKER_ASSIGN_RE = /validatedSessionMarker\s*=\s*session_marker\s+as\s+SessionMarker/
  const LOOP_ASSIGN_RE = /validatedLoopId\s*=\s*loopIdResult\.value/
  const AGENT_FIELD_CALL_RE = new RegExp(`if\\s*\\(\\s*r20aAudience\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{\\s*const\\s+agentFieldErr\\s*=\\s*preSubstrateFieldGuardError\\s*\\(\\s*\\)`)
  const HUMAN_FIELD_CALL_RE = new RegExp(`if\\s*\\(\\s*r20aAudience\\s*===\\s*${QUOTED}\\s*\\)\\s*\\{\\s*const\\s+humanFieldErr\\s*=\\s*preSubstrateFieldGuardError\\s*\\(\\s*\\)`)
  const fieldClosure = structuralBlock(code, FIELD_CLOSURE_RE)
  const agentFieldIdx = codeIndex(code, AGENT_FIELD_CALL_RE)
  const humanFieldIdx = codeIndex(code, HUMAN_FIELD_CALL_RE)
  const markerIdx = codeIndex(code, MARKER_MEMBERSHIP_RE)
  const loopIdx = codeIndex(code, LOOP_VALIDATE_RE)
  const inClosure = (i: number) => i > fieldClosure.openIdx && i < fieldClosure.endIdx
  expectTrue(
    'FLD-1 the closure preSubstrateFieldGuardError exists exactly once and holds the session_marker membership test, the loop_id validation and BOTH assignments exactly once each, all inside it, marker before loop_id (the original order)',
    fieldClosure.matches === 1 && fieldClosure.openIdx > -1 && fieldClosure.endIdx > fieldClosure.openIdx &&
      codeCount(code, MARKER_MEMBERSHIP_RE) === 1 && codeCount(code, LOOP_VALIDATE_RE) === 1 &&
      codeCount(code, MARKER_ASSIGN_RE) === 1 && codeCount(code, LOOP_ASSIGN_RE) === 1 &&
      inClosure(markerIdx) && inClosure(loopIdx) && loopIdx > markerIdx &&
      inClosure(codeIndex(code, MARKER_ASSIGN_RE)) && inClosure(codeIndex(code, LOOP_ASSIGN_RE)),
    `closure=${fieldClosure.openIdx}..${fieldClosure.endIdx} (${fieldClosure.matches}) marker=${markerIdx} loop=${loopIdx}`,
  )
  expectTrue(
    'FLD-2 the AGENT-path call sits at the validations\' original position: after the closure, after the clarification TYPE check, BEFORE the distress check',
    agentFieldIdx > fieldClosure.endIdx && fieldClosure.endIdx > -1 && agentFieldIdx > clarificationTypeIdx && checkIdx > agentFieldIdx,
    `agentField=${agentFieldIdx} closureEnd=${fieldClosure.endIdx} clarType=${clarificationTypeIdx} check=${checkIdx}`,
  )
  expectTrue(
    'FLD-3 the HUMAN-path call follows the structural END of the redirect-return block, follows the human-path LENGTH call (the pre-remediation relative order), and precedes continuation-token validation and the engine',
    humanFieldIdx > -1 && block.endIdx > -1 && humanFieldIdx > block.endIdx && humanFieldIdx > humanCallIdx &&
      tokenIdx > -1 && engineIdx > -1 && humanFieldIdx < tokenIdx && humanFieldIdx < engineIdx,
    `humanField=${humanFieldIdx} blockEnd=${block.endIdx} humanLength=${humanCallIdx} token=${tokenIdx} engine=${engineIdx}`,
  )
  {
    const agentLit = (code.match(/if\s*\(\s*r20aAudience\s*!==\s*'human_user'\s*\)\s*\{\s*const\s+agentFieldErr\s*=\s*preSubstrateFieldGuardError\s*\(\s*\)/g) ?? []).length
    const humanLit = (code.match(/if\s*\(\s*r20aAudience\s*===\s*'human_user'\s*\)\s*\{\s*const\s+humanFieldErr\s*=\s*preSubstrateFieldGuardError\s*\(\s*\)/g) ?? []).length
    expectTrue(
      "FLD-4 the two call sites key on r20aAudience with the LITERAL 'human_user' (one !==, one ===), exactly once each, and the closure is called exactly twice",
      agentLit === 1 && humanLit === 1 && codeCount(code, /preSubstrateFieldGuardError\s*\(\s*\)/) === 2,
      `agentLiteral=${agentLit} humanLiteral=${humanLit} calls=${codeCount(code, /preSubstrateFieldGuardError\s*\(\s*\)/)}`,
    )
  }
  {
    const postIdx = codeIndex(code, POST_HANDLER_RE)
    const spanOk = postIdx > -1 && fieldClosure.openIdx > postIdx && checkIdx > fieldClosure.endIdx && fieldClosure.endIdx > -1
    const preSpan = spanOk ? code.slice(postIdx, fieldClosure.openIdx) + code.slice(fieldClosure.endIdx, checkIdx) : ''
    expectTrue(
      'FLD-5 the non-length class fence: outside the closure body, neither validation occurs between the handler start and the distress check in any form (the two error literals, the membership test and validateLoopId( are all absent)',
      spanOk && !preSpan.includes('session_marker must be one of') &&
        codeCount(preSpan, MARKER_MEMBERSHIP_RE) === 0 && codeCount(preSpan, /validateLoopId\s*\(/) === 0 &&
        codeCount(preSpan, /SESSION_MARKER_VALUES/) === 0,
      `spanOk=${spanOk} literal=${preSpan.includes('session_marker must be one of')} membership=${codeCount(preSpan, MARKER_MEMBERSHIP_RE)} validate=${codeCount(preSpan, /validateLoopId\s*\(/)} values=${codeCount(preSpan, /SESSION_MARKER_VALUES/)}`,
    )
  }
}

expectTrue(
  'R3-1 Branch 2 (the masked-200 fallback) logs the thrown cause via logRouteError with the REAL status (200) and the outage classification',
  codeCount(code, R3_LOG_RE) === 1 && codeCount(code, R3_STATUS_RE) === 1,
  `log=${codeCount(code, R3_LOG_RE)} status=${codeCount(code, R3_STATUS_RE)}`,
)
expectTrue(
  'R3-2 the log context names the fallback reason and marks the row as a masked fallback (queryable distinct from a 500)',
  codeCount(code, R3_CONTEXT_RE) === 1 && codeIndex(code, R3_CONTEXT_RE) > engineIdx,
  `context=${codeCount(code, R3_CONTEXT_RE)}`,
)

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
