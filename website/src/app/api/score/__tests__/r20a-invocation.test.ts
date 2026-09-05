/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/score. Created 2026-09-05 by Session 3B (Group 2, item 8) of the
 * perimeter-ordering audit (operations/count-discipline-2026-09/2026-09-05-
 * r20a-perimeter-ordering-AUDIT.md §6), executing the 2026-09-06 mentor
 * ruling: "the distress check runs before the length guard on any route where
 * the human crisis form is rendered."
 *
 * Run: npx tsx src/app/api/score/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Plain-assertion script (no Jest); EXIT 0 on all pass, EXIT 1 on any fail.
 * Pins on the redirect block's brace-matched STRUCTURAL END via the shared
 * helpers (never on the block's opening — the defect three PR19 reviewers
 * found in FV-6's first cut).
 *
 * COVERAGE
 *   INV-1..3  — imports + exactly one AC5 call site + the human wire shape.
 *   PRES-1..2 — the `action` presence check stays BEFORE the check.
 *   MAX-1..3  — the `action` (short) and `context` (medium) MAXIMUM guards sit
 *               AFTER the structural end of `if (gate.shouldRedirect) { … }`
 *               and BEFORE domainContext + the first RAG/context load;
 *               non-vacuity of every anchor; the guards' relative order kept.
 *   CAP-1..3  — the classifier receives `action.slice(0, TEXT_LIMITS.short)`
 *               (exactly once, at the check) and TEXT_LIMITS.short is the
 *               audit's S bound (2,000), so the cap equals the guard.
 *
 * MUTATION RECORD (2026-09-05, real file, hash-verified restore): the
 * `action` maximum placed BEFORE the check → MAX-1 fails; placed BETWEEN the
 * check and the redirect return → MAX-1 fails; deleted → MAX-3 fails; the cap
 * removed (`detectDistressTwoStage(action)`) → CAP-1 fails.
 *
 * NOT COVERED: end-to-end HTTP (live env). The founder-walked smoke covers it:
 * an oversized distressed `action` → 200 with the crisis resources; an
 * oversized benign `action` → 400 `exceeds maximum length`.
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
const PRESENCE_RE = /if\s*\(\s*!action\s*\|\|\s*action\.trim\(\)\.length\s*===\s*0\s*\)/
const MAX_ACTION_RE = new RegExp(`validateTextLength\\(\\s*action\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.short\\s*\\)`)
const MAX_CONTEXT_RE = new RegExp(`validateTextLength\\(\\s*context\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
// The cap is a NAMED local defined before the check (not inline on the check
// line) so the audit's rev-2 sweep keeps its check→redirect window at 0 bound
// lines — a cap argument on the check line reads as a bound there (the
// founder/hub :1255 class the audit reconciles by hand). 2026-09-05, caught
// by the sweep in-build.
const CAP_RE = /const\s+screenedAction\s*=\s*action\.slice\(\s*0\s*,\s*TEXT_LIMITS\.short\s*\)/
const SUBJECT_RE = /detectDistressTwoStage\s*\(\s*screenedAction\s*\)/
const RAW_SUBJECT_RE = /detectDistressTwoStage\s*\(\s*action(?:\.slice\([^)]*\))?\s*\)/
const DOMAIN_RE = /(?:let|const)\s+domainContext\b/
const CONTEXT_LOAD_RE = /loadLayer1WithFallback\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const presenceIdx = codeIndex(code, PRESENCE_RE)
const maxActionIdx = codeIndex(code, MAX_ACTION_RE)
const maxContextIdx = codeIndex(code, MAX_CONTEXT_RE)
const capIdx = codeIndex(code, CAP_RE)
const domainIdx = codeIndexAfter(code, DOMAIN_RE, checkIdx)
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
  'PRES-1 the action presence check exists exactly once',
  codeCount(code, PRESENCE_RE) === 1,
  `count=${codeCount(code, PRESENCE_RE)}`,
)
expectTrue(
  'PRES-2 the presence check precedes the distress check (a missing field has no text to screen)',
  presenceIdx > -1 && checkIdx > -1 && presenceIdx < checkIdx,
  `presence=${presenceIdx} check=${checkIdx}`,
)
expectTrue(
  'MAX-1 BOTH maximum guards (action, context) follow the structural END of the redirect-return block ' +
    '(2026-09-06 ruling; anchored on the block\'s own closing brace, so drift to anywhere inside it — ' +
    'before OR after the check — is caught)',
  maxActionIdx > -1 && maxContextIdx > -1 && block.endIdx > -1 &&
    maxActionIdx > block.endIdx && maxContextIdx > block.endIdx,
  `action=${maxActionIdx} context=${maxContextIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'MAX-2 the maxima keep their relative order (action, then context) and still precede domainContext and the first context/RAG load (order, not existence)',
  maxActionIdx > -1 && maxContextIdx > maxActionIdx && domainIdx > -1 && contextLoadIdx > -1 &&
    maxContextIdx < domainIdx && maxContextIdx < contextLoadIdx,
  `action=${maxActionIdx} context=${maxContextIdx} domain=${domainIdx} load=${contextLoadIdx}`,
)
expectTrue(
  'MAX-3 non-vacuity: each maximum appears exactly once; the redirect block was found exactly once, is non-degenerate, and follows the check',
  codeCount(code, MAX_ACTION_RE) === 1 && codeCount(code, MAX_CONTEXT_RE) === 1 &&
    block.matches === 1 && block.openIdx > checkIdx && block.endIdx > block.openIdx,
  `actionCount=${codeCount(code, MAX_ACTION_RE)} contextCount=${codeCount(code, MAX_CONTEXT_RE)} matches=${block.matches} open=${block.openIdx} end=${block.endIdx} check=${checkIdx}`,
)
expectTrue(
  'CAP-1 the classifier receives screenedAction (= action.slice(0, TEXT_LIMITS.short)), defined exactly once after the presence check and before the check, and never the raw field',
  codeCount(code, CAP_RE) === 1 && capIdx > presenceIdx && capIdx < checkIdx &&
    codeCount(code, SUBJECT_RE) === 1 && codeCount(code, RAW_SUBJECT_RE) === 0,
  `capCount=${codeCount(code, CAP_RE)} cap=${capIdx} presence=${presenceIdx} check=${checkIdx} subject=${codeCount(code, SUBJECT_RE)} raw=${codeCount(code, RAW_SUBJECT_RE)}`,
)
expectTrue(
  'CAP-2 the cap key (TEXT_LIMITS.short) is the SAME key the moved action guard enforces (the cap equals the bound)',
  /validateTextLength\(\s*action\s*,[^)]*TEXT_LIMITS\.short\s*\)/.test(code) && CAP_RE.test(code),
)
expectTrue(
  'CAP-3 TEXT_LIMITS.short is the audit\'s S bound (2,000) as read from security.ts source — a silent redefinition fails here',
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
