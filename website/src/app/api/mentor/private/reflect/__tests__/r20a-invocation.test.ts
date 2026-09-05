/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/mentor/private/reflect. Created 2026-09-05 by Session 3 (Group 1,
 * item 3 — same shape as /api/reflect, moved together) of the perimeter-
 * ordering audit (operations/count-discipline-2026-09/2026-09-05-r20a-
 * perimeter-ordering-AUDIT.md §6), executing the 2026-09-06 mentor ruling.
 *
 * Run: npx tsx src/app/api/mentor/private/reflect/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same coverage and mutation record as the /api/reflect battery (INV-1..3,
 * PRES-1..2, ORD-1..5). One route-specific note: the `bypass_pattern_cache`
 * boolean 400 sits between the presence half and the check by design — it is
 * class O in the audit (not a length guard; §4.4, a mentor question) and is
 * deliberately NOT pinned either way here.
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
  QUOTED,
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

const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
const PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!what_happened\\s*\\|\\|\\s*typeof\\s+what_happened\\s*!==\\s*${QUOTED}\\s*\\)`)
const MIN_GUARD_RE = /what_happened\.trim\(\)\.length\s*<\s*10/
const CONTEXT_LOAD_RE = /getStoicBrainContextForMechanisms\s*\(/
const LLM_CALL_RE = /client\.messages\.create\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const presenceIdx = codeIndex(code, PRESENCE_RE)
const minIdx = codeIndex(code, MIN_GUARD_RE)
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

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
