/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/mentor/ring/proof. Created 2026-09-06 by Session 3C (Group 3,
 * audit §6 item 11) of the perimeter-ordering audit (operations/count-
 * discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md), executing
 * the 2026-09-06 length-guard ruling and the mentor's 2026-09-05 Part 5
 * extension (the `hub_id` enum and the `bypass_pattern_cache` boolean are
 * class-O pre-check refusals on a body whose screened text is present).
 *
 * Run: npx tsx src/app/api/mentor/ring/proof/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same shape as the founder/hub/ring-proof battery. This route's anchors:
 * the check screens `screenedTaskDescription` (= taskDescription sliced at
 * TEXT_LIMITS.medium); the presence/type half `!taskDescription || typeof
 * !== 'string'` stays before the check; the moved minimum is
 * `taskDescription.trim().length < 5`; the moved maximum is
 * `validateTextLength(taskDescription, …, medium)`; the two moved class-O
 * 400s are the `hub_id` allowlist and the `bypass_pattern_cache` boolean;
 * the first post-guard engine touch is `loadRingFunctions()`.
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

const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*screenedTaskDescription\s*\)\s*\)/
const ANY_CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const CAP_RE = /const\s+screenedTaskDescription\s*=\s*taskDescription\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const RAW_SUBJECT_RE = /detectDistressTwoStage\s*\(\s*taskDescription(?:\.slice\([^)]*\))?\s*\)/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
const PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!taskDescription\\s*\\|\\|\\s*typeof\\s+taskDescription\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
const OLD_FUSED_RE = new RegExp(`typeof\\s+taskDescription\\s*!==\\s*${QUOTED}\\s*\\|\\|\\s*taskDescription\\.trim\\(\\)\\.length`)
const MIN_GUARD_RE = /if\s*\(\s*taskDescription\.trim\(\)\.length\s*<\s*5\s*\)/
const MAX_RE = new RegExp(`validateTextLength\\(\\s*taskDescription\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const HUB_ENUM_RE = /const\s+requestedHubId\s*:\s*unknown\s*=\s*body\?\.hub_id/
const HUB_MEMBERSHIP_RE = /VALID_PROOF_HUBS\s+as\s+readonly\s+string\[\]\)\.includes\s*\(/
const BYPASS_RE = /const\s+requestedBypass\s*:\s*unknown\s*=\s*body\?\.bypass_pattern_cache/
const BYPASS_TYPE_RE = /typeof\s+requestedBypass\s*===\s*['"][^'"]*['"]/
const RING_LOAD_RE = /loadRingFunctions\s*\(\s*\)/
const LLM_CALL_RE = /client\.messages\.create\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const presenceIdx = codeIndex(code, PRESENCE_RE)
const minIdx = codeIndex(code, MIN_GUARD_RE)
const maxIdx = codeIndex(code, MAX_RE)
const hubIdx = codeIndex(code, HUB_ENUM_RE)
const bypassIdx = codeIndex(code, BYPASS_RE)
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
  'PRES-1 the presence/type half (!taskDescription || typeof !== string) exists exactly once, and the old fused form (type-or-minimum in one condition) is gone',
  codeCount(code, PRESENCE_RE) === 1 && codeCount(code, OLD_FUSED_RE) === 0,
  `presence=${codeCount(code, PRESENCE_RE)} fused=${codeCount(code, OLD_FUSED_RE)}`,
)
expectTrue(
  'PRES-2 the presence/type half precedes the distress check (a missing field has no text to screen)',
  presenceIdx > -1 && checkIdx > -1 && presenceIdx < checkIdx,
  `presence=${presenceIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-1 the task_description MINIMUM (<5) follows the structural END of the redirect-return block ' +
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
  'MAX-1 the task_description MAXIMUM guard (TEXT_LIMITS.medium) follows the structural END of the redirect-return block',
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
  'ENUM-1 the hub_id enum 400 and the bypass_pattern_cache boolean 400 (class O, mentor Part 5) both follow the structural END of the redirect-return block, follow the maximum, keep their order (hub_id then bypass), and precede the ring load',
  hubIdx > -1 && bypassIdx > -1 && block.endIdx > -1 && hubIdx > block.endIdx && bypassIdx > hubIdx &&
    hubIdx > maxIdx && ringIdx > -1 && bypassIdx < ringIdx,
  `hub=${hubIdx} bypass=${bypassIdx} blockEnd=${block.endIdx} max=${maxIdx} ring=${ringIdx}`,
)
expectTrue(
  'ENUM-2 non-vacuity: each moved 400 appears exactly once (the hub_id read + allowlist membership; the bypass read + boolean typeof)',
  codeCount(code, HUB_ENUM_RE) === 1 && codeCount(code, HUB_MEMBERSHIP_RE) === 1 &&
    codeCount(code, BYPASS_RE) === 1 && codeCount(code, BYPASS_TYPE_RE) === 1,
  `hub=${codeCount(code, HUB_ENUM_RE)}/${codeCount(code, HUB_MEMBERSHIP_RE)} bypass=${codeCount(code, BYPASS_RE)}/${codeCount(code, BYPASS_TYPE_RE)}`,
)
expectTrue(
  'CAP-1 the classifier receives screenedTaskDescription (= taskDescription.slice(0, TEXT_LIMITS.medium)), defined exactly once after the presence check and before the check, and never the raw field',
  codeCount(code, CAP_RE) === 1 && capIdx > presenceIdx && capIdx < checkIdx &&
    codeCount(code, CHECK_RE) === 1 && codeCount(code, RAW_SUBJECT_RE) === 0,
  `capCount=${codeCount(code, CAP_RE)} cap=${capIdx} presence=${presenceIdx} check=${checkIdx} raw=${codeCount(code, RAW_SUBJECT_RE)}`,
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
  // NEG-2 — the NON-LENGTH class fence (Session 3C): neither moved 400 may
  // be re-added before the check in ANY form — matched on the quoted error
  // literals (comment-stripped, UN-blanked source) AND on the structural
  // tokens (the body reads and the membership/typeof tests).
  const literalHit = preSpan.includes('hub_id must be one of') || preSpan.includes('bypass_pattern_cache must be a boolean')
  const tokenHits = codeCount(preSpan, /body\?\.hub_id/) + codeCount(preSpan, HUB_MEMBERSHIP_RE) +
    codeCount(preSpan, /body\?\.bypass_pattern_cache/) + codeCount(preSpan, BYPASS_TYPE_RE)
  expectTrue(
    'NEG-2 neither moved class-O 400 (hub_id enum, bypass boolean) occurs before the distress check in any form (error literals and structural tokens both absent from the pre-check span)',
    postIdx > -1 && checkIdx > postIdx && !literalHit && tokenHits === 0,
    `literal=${literalHit} tokens=${tokenHits}`,
  )
}

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
