/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/mentor/private/reflect. Created 2026-09-05 by Session 3 (Group 1,
 * item 3 — same shape as /api/reflect, moved together) of the perimeter-
 * ordering audit (operations/count-discipline-2026-09/2026-09-05-r20a-
 * perimeter-ordering-AUDIT.md §6), executing the 2026-09-06 mentor ruling.
 * EXTENDED 2026-09-05 by Session 3B (Group 2, item 5) with the MAX-* and
 * CAP-* pins for the two maximum guards.
 *
 * Run: npx tsx src/app/api/mentor/private/reflect/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same coverage and mutation record as the /api/reflect battery (INV-1..3,
 * PRES-1..2, ORD-1..5, MAX-1..3, CAP-1..3). One route-specific note: the
 * `bypass_pattern_cache` boolean 400 sits between the presence half and the
 * check by design — it is class O in the audit (not a length guard; §4.4 —
 * now a ruled Group 2b item, its own sitting) and is deliberately NOT pinned
 * either way here.
 *
 * NOT COVERED: end-to-end HTTP; this route is founder-only (FOUNDER_USER_ID),
 * so the founder-walked smoke is the only live caller.
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
const PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!what_happened\\s*\\|\\|\\s*typeof\\s+what_happened\\s*!==\\s*${QUOTED}\\s*\\)`)
const MIN_GUARD_RE = /what_happened\.trim\(\)\.length\s*<\s*10/
const MAX_WH_RE = new RegExp(`validateTextLength\\(\\s*what_happened\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const MAX_HIR_RE = new RegExp(`validateTextLength\\(\\s*how_i_responded\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const CAP_WH_RE = /const\s+screenedWhatHappened\s*=\s*what_happened\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
// PR19 fold 2026-09-06: the non-string coercion must PRECEDE the slice.
const CAP_HIR_RE = /const\s+screenedHowIResponded\s*=\s*String\(\s*how_i_responded\s*\|\|\s*['"]{2}\s*\)\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const SUBJECT_RE = /detectDistressTwoStage\s*\(\s*combinedInput\s*\)/
const CONTEXT_LOAD_RE = /getStoicBrainContextForMechanisms\s*\(/
const LLM_CALL_RE = /client\.messages\.create\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const presenceIdx = codeIndex(code, PRESENCE_RE)
const minIdx = codeIndex(code, MIN_GUARD_RE)
const maxWhIdx = codeIndex(code, MAX_WH_RE)
const maxHirIdx = codeIndex(code, MAX_HIR_RE)
const capWhIdx = codeIndex(code, CAP_WH_RE)
const capHirIdx = codeIndex(code, CAP_HIR_RE)
// Anchored AFTER the check: the same loader/client may occur earlier on another path.
const contextIdx = codeIndexAfter(code, CONTEXT_LOAD_RE, checkIdx)
const llmIdx = codeIndexAfter(code, LLM_CALL_RE, checkIdx)

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
  'PRES-1 the presence/type half (!what_happened || typeof !== string) exists exactly once',
  codeCount(code, PRESENCE_RE) === 1,
  `count=${codeCount(code, PRESENCE_RE)}`,
)
expectTrue(
  'PRES-2 the presence/type half precedes the distress check (a missing field has no text to screen)',
  presenceIdx > -1 && checkIdx > -1 && presenceIdx < checkIdx,
  `presence=${presenceIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-1 the what_happened MINIMUM (<10) follows the structural END of the redirect-return block ' +
    '(2026-09-06 ruling; anchored on the block\'s own closing brace, so drift to anywhere inside it — ' +
    'before OR after the check — is caught)',
  minIdx > -1 && block.endIdx > -1 && minIdx > block.endIdx,
  `min=${minIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'ORD-2 the minimum still precedes the first context load and the LLM call (order, not existence)',
  minIdx > -1 && contextIdx > -1 && llmIdx > -1 && minIdx < contextIdx && minIdx < llmIdx,
  `min=${minIdx} context=${contextIdx} llm=${llmIdx}`,
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
  'ORD-5 the context-load and LLM anchors were found (ORD-2 is not deciding on -1)',
  contextIdx > -1 && llmIdx > -1,
)
expectTrue(
  'MAX-1 BOTH maximum guards (what_happened, how_i_responded; TEXT_LIMITS.medium) follow the structural END of the redirect-return block',
  maxWhIdx > -1 && maxHirIdx > -1 && block.endIdx > -1 && maxWhIdx > block.endIdx && maxHirIdx > block.endIdx,
  `wh=${maxWhIdx} hir=${maxHirIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'MAX-2 the maxima keep their relative order (what_happened, then how_i_responded), precede the moved minimum, and precede the first context load and the LLM call',
  maxWhIdx > -1 && maxHirIdx > maxWhIdx && minIdx > maxHirIdx && contextIdx > -1 && llmIdx > -1 &&
    maxHirIdx < contextIdx && maxHirIdx < llmIdx,
  `wh=${maxWhIdx} hir=${maxHirIdx} min=${minIdx} context=${contextIdx} llm=${llmIdx}`,
)
expectTrue(
  'MAX-3 non-vacuity: each maximum appears exactly once',
  codeCount(code, MAX_WH_RE) === 1 && codeCount(code, MAX_HIR_RE) === 1,
  `whCount=${codeCount(code, MAX_WH_RE)} hirCount=${codeCount(code, MAX_HIR_RE)}`,
)
{
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
  expectTrue(
    'NEG-1 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check (PR19 fold 2026-09-06 — the class fence)',
    postIdx > -1 && checkIdx > postIdx &&
      codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
    `post=${postIdx} check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
  )
}
expectTrue(
  'CAP-1 both fields are sliced at TEXT_LIMITS.medium into screened locals BEFORE the check (exactly once each), and the check reads combinedInput',
  codeCount(code, CAP_WH_RE) === 1 && codeCount(code, CAP_HIR_RE) === 1 &&
    capWhIdx > presenceIdx && capWhIdx < checkIdx && capHirIdx > presenceIdx && capHirIdx < checkIdx &&
    codeCount(code, SUBJECT_RE) === 1,
  `capWh=${capWhIdx} capHir=${capHirIdx} presence=${presenceIdx} check=${checkIdx} subject=${codeCount(code, SUBJECT_RE)}`,
)
expectTrue(
  'CAP-2 combinedInput is composed from the SCREENED locals, never from the raw fields (comment-stripped raw source; template contents are blanked in the helper view)',
  /const\s+combinedInput\s*=\s*`\$\{screenedWhatHappened\}\s\$\{screenedHowIResponded\}`/.test(code) &&
    !/combinedInput\s*=\s*`\$\{what_happened\}/.test(code),
)
expectTrue(
  'CAP-3 TEXT_LIMITS.medium is the audit\'s M bound (5,000) as read from security.ts source — the cap equals the guard',
  LIMITS.medium === 5000,
  `medium=${LIMITS.medium}`,
)

// BYP-* / NEG-2 — Session 3C (Group 2b, 2026-09-06): the
// `bypass_pattern_cache` boolean 400 (the audit's §4.4 class O; mentor Part
// 5) moved after the redirect return, below the moved minimum (restoring the
// pre-remediation relative order max, max, min, boolean).
{
  const BYPASS_RE = /const\s+requestedBypass\s*:\s*unknown\s*=\s*body\?\.bypass_pattern_cache/
  const BYPASS_TYPE_RE = /typeof\s+requestedBypass\s*===\s*['"][^'"]*['"]/
  const bypassIdx = codeIndex(code, BYPASS_RE)
  expectTrue(
    'BYP-1 the bypass_pattern_cache boolean 400 follows the structural END of the redirect-return block and follows the moved minimum',
    bypassIdx > -1 && block.endIdx > -1 && bypassIdx > block.endIdx && bypassIdx > minIdx,
    `bypass=${bypassIdx} blockEnd=${block.endIdx} min=${minIdx}`,
  )
  expectTrue(
    'BYP-2 it still precedes the first context load and the LLM call (order, not existence)',
    bypassIdx > -1 && contextIdx > -1 && llmIdx > -1 && bypassIdx < contextIdx && bypassIdx < llmIdx,
    `bypass=${bypassIdx} context=${contextIdx} llm=${llmIdx}`,
  )
  expectTrue(
    'BYP-3 non-vacuity: the body read and the boolean typeof test each appear exactly once',
    codeCount(code, BYPASS_RE) === 1 && codeCount(code, BYPASS_TYPE_RE) === 1,
    `read=${codeCount(code, BYPASS_RE)} typeof=${codeCount(code, BYPASS_TYPE_RE)}`,
  )
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
  expectTrue(
    'NEG-2 the moved boolean 400 does not occur before the distress check in any form (its error literal, the body read and the requestedBypass identifier are all absent from the pre-check span)',
    postIdx > -1 && checkIdx > postIdx && !preSpan.includes('bypass_pattern_cache must be a boolean') &&
      codeCount(preSpan, /body\?\.bypass_pattern_cache/) === 0 && codeCount(preSpan, /requestedBypass/) === 0,
    `literal=${preSpan.includes('bypass_pattern_cache must be a boolean')} read=${codeCount(preSpan, /body\?\.bypass_pattern_cache/)} ident=${codeCount(preSpan, /requestedBypass/)}`,
  )
}

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
