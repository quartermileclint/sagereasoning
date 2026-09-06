/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/founder/hub/ring-proof. Created 2026-09-06 by Session 3C (Group 3,
 * audit §6 item 11) of the perimeter-ordering audit (operations/count-
 * discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md), executing
 * the 2026-09-06 length-guard ruling and the mentor's 2026-09-05 Part 5
 * extension (the `persona` enum is a class-O pre-check refusal on a body
 * whose screened text is present).
 *
 * Run: npx tsx src/app/api/founder/hub/ring-proof/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same coverage as the score-scenario battery (INV, PRES, ORD, MAX, CAP,
 * NEG-1) plus ENUM-* for the moved non-length 400 and NEG-2 — the
 * non-length class fence (Session 3C: a decoy re-add of a MOVED 400 before
 * the check must go red, matched on the quoted error literal AND the
 * structural token, on the comment-stripped source). This route's anchors:
 * the check screens `screenedMessage` (= messageInput sliced at
 * TEXT_LIMITS.medium), the moved minimum is `messageInput.trim().length < 5`,
 * the moved maximum is `validateTextLength(messageInput, …, medium)`, the
 * moved enum is the `persona` allowlist, and the first post-guard engine
 * touch is `loadRingFunctions()`.
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

const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*screenedMessage\s*\)\s*\)/
const ANY_CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const CAP_RE = /const\s+screenedMessage\s*=\s*messageInput\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const RAW_SUBJECT_RE = /detectDistressTwoStage\s*\(\s*(?:messageInput|message)(?:\.slice\([^)]*\))?\s*\)/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
// PRES-1/2 REVISED (PR19 fold, 2026-09-06, Session 3C Group 3): a typeof-only
// presence half let an empty string through to the classifier (Haiku invoked
// on ''). The guard is now `!messageInput || typeof messageInput !== 'string'`.
const TYPE_RE = new RegExp(`if\\s*\\(\\s*!messageInput\\s*\\|\\|\\s*typeof\\s+messageInput\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
const TYPEOF_ONLY_RE = /if\s*\(\s*typeof\s+messageInput\s*!==\s*['"][^'"]*['"]\s*\)\s*\{/
const MIN_GUARD_RE = /if\s*\(\s*messageInput\.trim\(\)\.length\s*<\s*5\s*\)/
const OLD_FUSED_RE = new RegExp(`typeof\\s+messageInput\\s*!==\\s*${QUOTED}\\s*\\|\\|\\s*messageInput\\.trim\\(\\)\\.length`)
const MAX_RE = new RegExp(`validateTextLength\\(\\s*messageInput\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const ENUM_RE = /if\s*\(\s*typeof\s+personaInput\s*!==\s*['"][^'"]*['"]\s*\|\|\s*!ALLOWED_PERSONAS\.includes\s*\(/
const RING_LOAD_RE = /loadRingFunctions\s*\(\s*\)/
const LLM_CALL_RE = /client\.messages\.create\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const typeIdx = codeIndex(code, TYPE_RE)
const minIdx = codeIndex(code, MIN_GUARD_RE)
const maxIdx = codeIndex(code, MAX_RE)
const enumIdx = codeIndex(code, ENUM_RE)
const capIdx = codeIndex(code, CAP_RE)
const ringIdx = codeIndexAfter(code, RING_LOAD_RE, checkIdx)
const llmIdx = codeIndexAfter(code, LLM_CALL_RE, checkIdx)

expectTrue(
  'INV-1 imports detectDistressTwoStage from @/lib/r20a-classifier and enforceDistressCheck from @/lib/constraints',
  /from\s+['"]@\/lib\/r20a-classifier['"]/.test(code) && /from\s+['"]@\/lib\/constraints['"]/.test(code),
)
expectTrue(
  'INV-2 exactly ONE awaited enforceDistressCheck(detectDistressTwoStage(...)) call site (AC5 pattern), and it is the capped one',
  codeCount(code, ANY_CHECK_RE) === 1 && codeCount(code, CHECK_RE) === 1 && /await\s+enforceDistressCheck\s*\(/.test(code),
  `any=${codeCount(code, ANY_CHECK_RE)} capped=${codeCount(code, CHECK_RE)}`,
)
expectTrue(
  'INV-3 the redirect returns the HUMAN wire shape (distress_detected) and never the developer form',
  codeCount(code, /distress_detected\s*:\s*true/) === 1 &&
    !/developer_note|suggested_user_message|flow_terminated/.test(code),
)
expectTrue(
  'PRES-1 the presence/type half (!messageInput || typeof !== string — a FALSY check, not typeof-only, per the PR19 fold) exists exactly once, the old fused type-or-minimum form is gone, and no typeof-only variant survives',
  codeCount(code, TYPE_RE) === 1 && codeCount(code, OLD_FUSED_RE) === 0 && codeCount(code, TYPEOF_ONLY_RE) === 0,
  `presence=${codeCount(code, TYPE_RE)} fused=${codeCount(code, OLD_FUSED_RE)} typeofOnly=${codeCount(code, TYPEOF_ONLY_RE)}`,
)
expectTrue(
  'PRES-2 the presence/type half precedes the distress check (an absent, empty, or non-string message has no text to screen)',
  typeIdx > -1 && checkIdx > -1 && typeIdx < checkIdx,
  `presence=${typeIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-1 the message MINIMUM (<5) follows the structural END of the redirect-return block ' +
    '(2026-09-06 ruling; anchored on the block\'s own closing brace, so drift to anywhere inside it — ' +
    'before OR after the check — is caught)',
  minIdx > -1 && block.endIdx > -1 && minIdx > block.endIdx,
  `min=${minIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'ORD-2 the minimum still precedes the ring load and the LLM call (order, not existence)',
  minIdx > -1 && ringIdx > -1 && llmIdx > -1 && minIdx < ringIdx && minIdx < llmIdx,
  `min=${minIdx} ring=${ringIdx} llm=${llmIdx}`,
)
expectTrue(
  'ORD-3 non-vacuity: the minimum appears exactly once, the redirect block was found exactly once and is non-degenerate',
  codeCount(code, MIN_GUARD_RE) === 1 && block.matches === 1 && block.openIdx > -1 && block.endIdx > block.openIdx,
  `minCount=${codeCount(code, MIN_GUARD_RE)} blockMatches=${block.matches} open=${block.openIdx} end=${block.endIdx}`,
)
expectTrue(
  'ORD-4 the anchored block IS the redirect block that follows the check (check < block open)',
  checkIdx > -1 && block.openIdx > checkIdx,
  `check=${checkIdx} open=${block.openIdx}`,
)
expectTrue(
  'ORD-5 the ring-load and LLM anchors were found (ORD-2 is not deciding on -1)',
  ringIdx > -1 && llmIdx > -1,
)
expectTrue(
  'ENUM-1 the persona enum 400 (class O, mentor Part 5) follows the structural END of the redirect-return block and precedes the minimum, the maximum and the ring load (the original relative order: persona, minimum, maximum)',
  enumIdx > -1 && block.endIdx > -1 && enumIdx > block.endIdx && minIdx > enumIdx && maxIdx > minIdx && enumIdx < ringIdx,
  `enum=${enumIdx} blockEnd=${block.endIdx} min=${minIdx} max=${maxIdx} ring=${ringIdx}`,
)
expectTrue(
  'ENUM-2 non-vacuity: the persona enum check appears exactly once, and the allowlist constant is still consulted',
  codeCount(code, ENUM_RE) === 1 && /ALLOWED_PERSONAS\s*=\s*\[/.test(code),
  `count=${codeCount(code, ENUM_RE)}`,
)
expectTrue(
  'MAX-1 the message MAXIMUM guard (TEXT_LIMITS.medium) follows the structural END of the redirect-return block',
  maxIdx > -1 && block.endIdx > -1 && maxIdx > block.endIdx,
  `max=${maxIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'MAX-2 the maximum follows the minimum and precedes the ring load and the LLM call',
  maxIdx > minIdx && minIdx > -1 && ringIdx > -1 && llmIdx > -1 && maxIdx < ringIdx && maxIdx < llmIdx,
  `max=${maxIdx} min=${minIdx} ring=${ringIdx} llm=${llmIdx}`,
)
expectTrue(
  'MAX-3 non-vacuity: the maximum appears exactly once',
  codeCount(code, MAX_RE) === 1,
  `count=${codeCount(code, MAX_RE)}`,
)
expectTrue(
  'CAP-1 the classifier receives screenedMessage (= messageInput.slice(0, TEXT_LIMITS.medium)), defined exactly once after the type check and before the check, and never the raw field',
  codeCount(code, CAP_RE) === 1 && capIdx > typeIdx && capIdx < checkIdx &&
    codeCount(code, CHECK_RE) === 1 && codeCount(code, RAW_SUBJECT_RE) === 0,
  `capCount=${codeCount(code, CAP_RE)} cap=${capIdx} type=${typeIdx} check=${checkIdx} raw=${codeCount(code, RAW_SUBJECT_RE)}`,
)
expectTrue(
  'CAP-2 the cap key (TEXT_LIMITS.medium) is the SAME key the moved maximum enforces (the cap equals the bound)',
  MAX_RE.test(code) && CAP_RE.test(code),
)
expectTrue(
  'CAP-3 TEXT_LIMITS.medium is the audit\'s M bound (5,000) as read from security.ts source',
  LIMITS.medium === 5000,
  `medium=${LIMITS.medium}`,
)

{
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
  expectTrue(
    'NEG-1 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check (the class fence)',
    postIdx > -1 && checkIdx > postIdx &&
      codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
    `post=${postIdx} check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
  )
  // NEG-2 — the NON-LENGTH class fence (Session 3C): the moved persona 400
  // must not be re-added before the check in ANY form — matched on its
  // quoted error literal (comment-stripped, UN-blanked source) AND on the
  // structural token `ALLOWED_PERSONAS.includes(` (string-blanked view).
  expectTrue(
    'NEG-2 the moved persona-enum 400 does not occur before the distress check in any form (its error literal and the allowlist-membership token are both absent from the pre-check span)',
    postIdx > -1 && checkIdx > postIdx &&
      !preSpan.includes('persona must be one of') &&
      codeCount(preSpan, /ALLOWED_PERSONAS\.includes\s*\(/) === 0,
    `literal=${preSpan.includes('persona must be one of')} token=${codeCount(preSpan, /ALLOWED_PERSONAS\.includes\s*\(/)}`,
  )
}

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
