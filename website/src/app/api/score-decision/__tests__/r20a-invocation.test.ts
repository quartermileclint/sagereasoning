/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/score-decision. Created 2026-09-05 by Session 3B (Group 2, item 8)
 * of the perimeter-ordering audit (operations/count-discipline-2026-09/
 * 2026-09-05-r20a-perimeter-ordering-AUDIT.md §6), executing the 2026-09-06
 * mentor ruling.
 *
 * Run: npx tsx src/app/api/score-decision/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same coverage and mutation record as the /api/score battery (INV-1..3,
 * PRES-1..2, MAX-1..3, CAP-1..3), with this route's anchors: the screened
 * field is `decision` (S bound), `context` is bounded at M but not screened,
 * and the first post-guard anchors are the `options` array checks and the
 * RAG block loader. The `options` count checks are class O in the audit
 * (array counts on a non-text field; §4.4) and are not pinned either way.
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

const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
const PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!decision\\s*\\|\\|\\s*typeof\\s+decision\\s*!==\\s*${QUOTED}\\s*\\|\\|\\s*decision\\.trim\\(\\)\\.length\\s*===\\s*0\\s*\\)`)
const MAX_DECISION_RE = new RegExp(`validateTextLength\\(\\s*decision\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.short\\s*\\)`)
const MAX_CONTEXT_RE = new RegExp(`validateTextLength\\(\\s*context\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
// Named local before the check, not inline — keeps the sweep's check→redirect
// window at 0 bound lines (see the /api/score battery's note).
const CAP_RE = /const\s+screenedDecision\s*=\s*decision\.slice\(\s*0\s*,\s*TEXT_LIMITS\.short\s*\)/
const SUBJECT_RE = /detectDistressTwoStage\s*\(\s*screenedDecision\s*\)/
const RAW_SUBJECT_RE = /detectDistressTwoStage\s*\(\s*decision(?:\.slice\([^)]*\))?\s*\)/
const OPTIONS_CHECK_RE = /Array\.isArray\s*\(\s*options\s*\)/
const CONTEXT_LOAD_RE = /loadLayer1BlockWithFallback\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const presenceIdx = codeIndex(code, PRESENCE_RE)
const maxDecisionIdx = codeIndex(code, MAX_DECISION_RE)
const maxContextIdx = codeIndex(code, MAX_CONTEXT_RE)
const optionsIdx = codeIndexAfter(code, OPTIONS_CHECK_RE, checkIdx)
const contextLoadIdx = codeIndexAfter(code, CONTEXT_LOAD_RE, checkIdx)

expectTrue(
  'INV-1 imports detectDistressTwoStage from @/lib/r20a-classifier and enforceDistressCheck from @/lib/constraints',
  /from\s+['"]@\/lib\/r20a-classifier['"]/.test(code) && /from\s+['"]@\/lib\/constraints['"]/.test(code),
)
expectTrue(
  'INV-2 exactly ONE awaited enforceDistressCheck(detectDistressTwoStage(...)) call site (AC5 pattern)',
  codeCount(code, CHECK_RE) === 1 && /await\s+enforceDistressCheck\s*\(/.test(code),
)
expectTrue(
  'INV-3 the redirect returns the HUMAN wire shape (distress_detected) and never the developer form',
  codeCount(code, /distress_detected\s*:\s*true/) === 1 &&
    !/developer_note|suggested_user_message|flow_terminated/.test(code),
)
expectTrue(
  'PRES-1 the decision presence/type check exists exactly once',
  codeCount(code, PRESENCE_RE) === 1,
  `count=${codeCount(code, PRESENCE_RE)}`,
)
expectTrue(
  'PRES-2 the presence/type check precedes the distress check (the check needs a string)',
  presenceIdx > -1 && checkIdx > -1 && presenceIdx < checkIdx,
  `presence=${presenceIdx} check=${checkIdx}`,
)
expectTrue(
  'MAX-1 BOTH maximum guards (decision, context) follow the structural END of the redirect-return block',
  maxDecisionIdx > -1 && maxContextIdx > -1 && block.endIdx > -1 &&
    maxDecisionIdx > block.endIdx && maxContextIdx > block.endIdx,
  `decision=${maxDecisionIdx} context=${maxContextIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'MAX-2 the maxima keep their relative order (decision, then context) and still precede the options checks and the first RAG/context load',
  maxDecisionIdx > -1 && maxContextIdx > maxDecisionIdx && optionsIdx > -1 && contextLoadIdx > -1 &&
    maxContextIdx < optionsIdx && maxContextIdx < contextLoadIdx,
  `decision=${maxDecisionIdx} context=${maxContextIdx} options=${optionsIdx} load=${contextLoadIdx}`,
)
expectTrue(
  'MAX-3 non-vacuity: each maximum appears exactly once; the redirect block was found exactly once, is non-degenerate, and follows the check',
  codeCount(code, MAX_DECISION_RE) === 1 && codeCount(code, MAX_CONTEXT_RE) === 1 &&
    block.matches === 1 && block.openIdx > checkIdx && block.endIdx > block.openIdx,
  `decisionCount=${codeCount(code, MAX_DECISION_RE)} contextCount=${codeCount(code, MAX_CONTEXT_RE)} matches=${block.matches} open=${block.openIdx} end=${block.endIdx} check=${checkIdx}`,
)
expectTrue(
  'CAP-1 the classifier receives screenedDecision (= decision.slice(0, TEXT_LIMITS.short)), defined exactly once after the presence check and before the check, and never the raw field',
  codeCount(code, CAP_RE) === 1 && codeIndex(code, CAP_RE) > presenceIdx && codeIndex(code, CAP_RE) < checkIdx &&
    codeCount(code, SUBJECT_RE) === 1 && codeCount(code, RAW_SUBJECT_RE) === 0,
  `capCount=${codeCount(code, CAP_RE)} cap=${codeIndex(code, CAP_RE)} presence=${presenceIdx} check=${checkIdx} subject=${codeCount(code, SUBJECT_RE)} raw=${codeCount(code, RAW_SUBJECT_RE)}`,
)
expectTrue(
  'CAP-2 the cap key (TEXT_LIMITS.short) is the SAME key the moved decision guard enforces (the cap equals the bound)',
  /validateTextLength\(\s*decision\s*,[^)]*TEXT_LIMITS\.short\s*\)/.test(code) && CAP_RE.test(code),
)
expectTrue(
  'CAP-3 TEXT_LIMITS.short is the audit\'s S bound (2,000) as read from security.ts source',
  LIMITS.short === 2000,
  `short=${LIMITS.short}`,
)

{
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
  expectTrue(
    'NEG-1 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check (PR19 fold 2026-09-06 — the class fence: a decoy guard in another form passed every positional pin)',
    postIdx > -1 && checkIdx > postIdx &&
      codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
    `post=${postIdx} check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
  )
}

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
