/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/support/agent/proof. Created 2026-09-06 by Session 3C (Group 3,
 * audit §6 item 11) of the perimeter-ordering audit (operations/count-
 * discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md), executing
 * the 2026-09-06 length-guard ruling and the mentor's 2026-09-05 Part 5
 * extension (the `channel`/`priority` enums are class-O pre-check refusals
 * on a body whose screened text is present).
 *
 * Run: npx tsx src/app/api/support/agent/proof/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same shape as the founder/hub/ring-proof battery. This route's anchors:
 * the check screens `combinedInput` composed from `screenedSubject`
 * (= subject.slice(0, TEXT_LIMITS.short)) and `screenedMessage`
 * (= message.slice(0, TEXT_LIMITS.medium)) — each field capped at ITS OWN
 * bound; the three TYPE halves stay before the check; the moved minima are
 * `subject` <3, `customer` <2, `message` <5; the moved enums are `channel`
 * and `priority`; the moved maxima are `subject` (short) and `message`
 * (medium); the first post-guard engine touch is `loadRingFunctions()`.
 * `customer` is bounded by its minimum but is NOT screened (the subject is
 * subject + message — unchanged).
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

const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*combinedInput\s*\)\s*\)/
const ANY_CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const CAP_SUBJECT_RE = /const\s+screenedSubject\s*=\s*subject\.slice\(\s*0\s*,\s*TEXT_LIMITS\.short\s*\)/
const CAP_MESSAGE_RE = /const\s+screenedMessage\s*=\s*message\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
// PRES REVISED (PR19 fold, 2026-09-06, Session 3C Group 3): typeof-only on
// `subject`/`message` let empty strings through to the classifier (Haiku
// invoked on whitespace via combinedInput). Both are now FALSY checks;
// `customer` correctly stays typeof-only (never part of the screened
// subject — combinedInput is subject + message only).
const TYPE_SUBJECT_RE = new RegExp(`if\\s*\\(\\s*!subject\\s*\\|\\|\\s*typeof\\s+subject\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
const TYPE_CUSTOMER_RE = new RegExp(`if\\s*\\(\\s*typeof\\s+customer\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
const TYPE_MESSAGE_RE = new RegExp(`if\\s*\\(\\s*!message\\s*\\|\\|\\s*typeof\\s+message\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
const SUBJECT_TYPEOF_ONLY_RE = /if\s*\(\s*typeof\s+subject\s*!==\s*['"][^'"]*['"]\s*\)\s*\{/
const MESSAGE_TYPEOF_ONLY_RE = /if\s*\(\s*typeof\s+message\s*!==\s*['"][^'"]*['"]\s*\)\s*\{/
const OLD_FUSED_RE = new RegExp(`typeof\\s+(?:subject|customer|message)\\s*!==\\s*${QUOTED}\\s*\\|\\|\\s*(?:subject|customer|message)\\.trim\\(\\)\\.length`)
const MIN_SUBJECT_RE = /if\s*\(\s*subject\.trim\(\)\.length\s*<\s*3\s*\)/
const MIN_CUSTOMER_RE = /if\s*\(\s*customer\.trim\(\)\.length\s*<\s*2\s*\)/
const MIN_MESSAGE_RE = /if\s*\(\s*message\.trim\(\)\.length\s*<\s*5\s*\)/
const ENUM_CHANNEL_RE = /!ALLOWED_CHANNELS\.includes\s*\(/
const ENUM_PRIORITY_RE = /!ALLOWED_PRIORITIES\.includes\s*\(/
const MAX_SUBJECT_RE = new RegExp(`validateTextLength\\(\\s*subject\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.short\\s*\\)`)
const MAX_MESSAGE_RE = new RegExp(`validateTextLength\\(\\s*message\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const RING_LOAD_RE = /loadRingFunctions\s*\(\s*\)/
const LLM_CALL_RE = /client\.messages\.create\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const typeSubjectIdx = codeIndex(code, TYPE_SUBJECT_RE)
const typeCustomerIdx = codeIndex(code, TYPE_CUSTOMER_RE)
const typeMessageIdx = codeIndex(code, TYPE_MESSAGE_RE)
const minSubjectIdx = codeIndex(code, MIN_SUBJECT_RE)
const minCustomerIdx = codeIndex(code, MIN_CUSTOMER_RE)
const minMessageIdx = codeIndex(code, MIN_MESSAGE_RE)
const enumChannelIdx = codeIndex(code, ENUM_CHANNEL_RE)
const enumPriorityIdx = codeIndex(code, ENUM_PRIORITY_RE)
const maxSubjectIdx = codeIndex(code, MAX_SUBJECT_RE)
const maxMessageIdx = codeIndex(code, MAX_MESSAGE_RE)
const capSubjectIdx = codeIndex(code, CAP_SUBJECT_RE)
const capMessageIdx = codeIndex(code, CAP_MESSAGE_RE)
const ringIdx = codeIndexAfter(code, RING_LOAD_RE, checkIdx)
const llmIdx = codeIndexAfter(code, LLM_CALL_RE, checkIdx)

expectTrue(
  'INV-1 imports detectDistressTwoStage from @/lib/r20a-classifier and enforceDistressCheck from @/lib/constraints',
  /from\s+['"]@\/lib\/r20a-classifier['"]/.test(code) && /from\s+['"]@\/lib\/constraints['"]/.test(code),
)
expectTrue(
  'INV-2 exactly ONE awaited enforceDistressCheck(detectDistressTwoStage(...)) call site (AC5 pattern), and it reads combinedInput',
  codeCount(code, ANY_CHECK_RE) === 1 && codeCount(code, CHECK_RE) === 1 && /await\s+enforceDistressCheck\s*\(/.test(code),
  `any=${codeCount(code, ANY_CHECK_RE)} combined=${codeCount(code, CHECK_RE)}`,
)
expectTrue(
  'INV-3 the redirect returns the HUMAN wire shape (distress_detected) and never the developer form',
  codeCount(code, /distress_detected\s*:\s*true/) === 1 &&
    !/developer_note|suggested_user_message|flow_terminated/.test(code),
)
expectTrue(
  'PRES-1 the three presence/type halves each exist exactly once — subject and message as FALSY checks (!x || typeof !== string, per the PR19 fold), customer as typeof-only (correctly, since it is never screened) — and the old fused type-or-minimum forms, and both typeof-only variants of subject/message, are gone',
  codeCount(code, TYPE_SUBJECT_RE) === 1 && codeCount(code, TYPE_CUSTOMER_RE) === 1 && codeCount(code, TYPE_MESSAGE_RE) === 1 &&
    codeCount(code, OLD_FUSED_RE) === 0 && codeCount(code, SUBJECT_TYPEOF_ONLY_RE) === 0 && codeCount(code, MESSAGE_TYPEOF_ONLY_RE) === 0,
  `types=${codeCount(code, TYPE_SUBJECT_RE)}/${codeCount(code, TYPE_CUSTOMER_RE)}/${codeCount(code, TYPE_MESSAGE_RE)} fused=${codeCount(code, OLD_FUSED_RE)} typeofOnly=${codeCount(code, SUBJECT_TYPEOF_ONLY_RE)}/${codeCount(code, MESSAGE_TYPEOF_ONLY_RE)}`,
)
expectTrue(
  'PRES-2 the three TYPE halves precede the distress check (a non-string carries no text to screen)',
  typeSubjectIdx > -1 && typeCustomerIdx > -1 && typeMessageIdx > -1 && checkIdx > -1 &&
    typeSubjectIdx < checkIdx && typeCustomerIdx < checkIdx && typeMessageIdx < checkIdx,
  `subject=${typeSubjectIdx} customer=${typeCustomerIdx} message=${typeMessageIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-1 ALL THREE minima (subject <3, customer <2, message <5) follow the structural END of the redirect-return block ' +
    '(2026-09-06 ruling; anchored on the block\'s own closing brace, so drift to anywhere inside it — ' +
    'before OR after the check — is caught)',
  minSubjectIdx > -1 && minCustomerIdx > -1 && minMessageIdx > -1 && block.endIdx > -1 &&
    minSubjectIdx > block.endIdx && minCustomerIdx > block.endIdx && minMessageIdx > block.endIdx,
  `subject=${minSubjectIdx} customer=${minCustomerIdx} message=${minMessageIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'ORD-2 the minima keep their order (subject, customer, message) and still precede the ring load and the LLM call (order, not existence)',
  minCustomerIdx > minSubjectIdx && minMessageIdx > minCustomerIdx &&
    ringIdx > -1 && llmIdx > -1 && minMessageIdx < ringIdx && minMessageIdx < llmIdx,
  `subject=${minSubjectIdx} customer=${minCustomerIdx} message=${minMessageIdx} ring=${ringIdx} llm=${llmIdx}`,
)
expectTrue(
  'ORD-3 non-vacuity: each minimum appears exactly once, the redirect block was found exactly once and is non-degenerate',
  codeCount(code, MIN_SUBJECT_RE) === 1 && codeCount(code, MIN_CUSTOMER_RE) === 1 && codeCount(code, MIN_MESSAGE_RE) === 1 &&
    block.matches === 1 && block.openIdx > -1 && block.endIdx > block.openIdx,
  `counts=${codeCount(code, MIN_SUBJECT_RE)}/${codeCount(code, MIN_CUSTOMER_RE)}/${codeCount(code, MIN_MESSAGE_RE)} blockMatches=${block.matches} open=${block.openIdx} end=${block.endIdx}`,
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
  'ENUM-1 the channel and priority enum 400s (class O, mentor Part 5) follow the structural END of the redirect-return block, follow the three minima, keep their order (channel then priority), and precede the maxima and the ring load (the original relative order)',
  enumChannelIdx > -1 && enumPriorityIdx > -1 && block.endIdx > -1 && enumChannelIdx > block.endIdx &&
    enumChannelIdx > minMessageIdx && enumPriorityIdx > enumChannelIdx && maxSubjectIdx > enumPriorityIdx && enumPriorityIdx < ringIdx,
  `channel=${enumChannelIdx} priority=${enumPriorityIdx} blockEnd=${block.endIdx} minMessage=${minMessageIdx} maxSubject=${maxSubjectIdx} ring=${ringIdx}`,
)
expectTrue(
  'ENUM-2 non-vacuity: each enum membership test appears exactly once',
  codeCount(code, ENUM_CHANNEL_RE) === 1 && codeCount(code, ENUM_PRIORITY_RE) === 1,
  `channel=${codeCount(code, ENUM_CHANNEL_RE)} priority=${codeCount(code, ENUM_PRIORITY_RE)}`,
)
expectTrue(
  'MAX-1 BOTH maximum guards (subject at TEXT_LIMITS.short, message at TEXT_LIMITS.medium) follow the structural END of the redirect-return block',
  maxSubjectIdx > -1 && maxMessageIdx > -1 && block.endIdx > -1 && maxSubjectIdx > block.endIdx && maxMessageIdx > block.endIdx,
  `subject=${maxSubjectIdx} message=${maxMessageIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'MAX-2 the maxima keep their order (subject, then message) and precede the ring load and the LLM call',
  maxMessageIdx > maxSubjectIdx && maxSubjectIdx > -1 && ringIdx > -1 && llmIdx > -1 && maxMessageIdx < ringIdx && maxMessageIdx < llmIdx,
  `subject=${maxSubjectIdx} message=${maxMessageIdx} ring=${ringIdx} llm=${llmIdx}`,
)
expectTrue(
  'MAX-3 non-vacuity: each maximum appears exactly once',
  codeCount(code, MAX_SUBJECT_RE) === 1 && codeCount(code, MAX_MESSAGE_RE) === 1,
  `subject=${codeCount(code, MAX_SUBJECT_RE)} message=${codeCount(code, MAX_MESSAGE_RE)}`,
)
expectTrue(
  'CAP-1 both screened fields are sliced at THEIR OWN bound into locals (subject at short, message at medium) exactly once each, after the type checks and before the check, and combinedInput is composed from the screened locals — never from the raw fields',
  codeCount(code, CAP_SUBJECT_RE) === 1 && codeCount(code, CAP_MESSAGE_RE) === 1 &&
    capSubjectIdx > typeMessageIdx && capSubjectIdx < checkIdx && capMessageIdx > typeMessageIdx && capMessageIdx < checkIdx &&
    /const\s+combinedInput\s*=\s*`\$\{screenedSubject\}\\n\\n\$\{screenedMessage\}`/.test(code) &&
    !/combinedInput\s*=\s*`\$\{subject\}/.test(code),
  `capSubject=${capSubjectIdx} capMessage=${capMessageIdx} typeMessage=${typeMessageIdx} check=${checkIdx}`,
)
expectTrue(
  'CAP-2 each cap key is the SAME key its field\'s moved maximum enforces (short ↔ subject, medium ↔ message)',
  MAX_SUBJECT_RE.test(code) && CAP_SUBJECT_RE.test(code) && MAX_MESSAGE_RE.test(code) && CAP_MESSAGE_RE.test(code),
)
expectTrue(
  'CAP-3 TEXT_LIMITS.short is the audit\'s S bound (2,000) and TEXT_LIMITS.medium its M bound (5,000), as read from security.ts source',
  LIMITS.short === 2000 && LIMITS.medium === 5000,
  `short=${LIMITS.short} medium=${LIMITS.medium}`,
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
  const literalHit = preSpan.includes('channel must be one of') || preSpan.includes('priority must be one of')
  const tokenHits = codeCount(preSpan, /ALLOWED_CHANNELS\.includes\s*\(/) + codeCount(preSpan, /ALLOWED_PRIORITIES\.includes\s*\(/)
  expectTrue(
    'NEG-2 neither moved enum 400 (channel, priority) occurs before the distress check in any form (error literals and allowlist-membership tokens both absent from the pre-check span)',
    postIdx > -1 && checkIdx > postIdx && !literalHit && tokenHits === 0,
    `literal=${literalHit} tokens=${tokenHits}`,
  )
}

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
