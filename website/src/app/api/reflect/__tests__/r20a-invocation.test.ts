/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/reflect. Created 2026-09-05 by Session 3 (Group 1, item 2) of the
 * perimeter-ordering audit (operations/count-discipline-2026-09/2026-09-05-
 * r20a-perimeter-ordering-AUDIT.md §6), executing the 2026-09-06 mentor
 * ruling: "the distress check runs before the length guard on any route where
 * the human crisis form is rendered."
 *
 * Run: npx tsx src/app/api/reflect/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Plain-assertion script (no Jest); EXIT 0 on all pass, EXIT 1 on any fail.
 * Mirrors the score-conversation battery's pattern (PR15) and pins on the
 * redirect block's brace-matched STRUCTURAL END via the shared helpers, not
 * on the block's opening — the defect three PR19 reviewers found in FV-6's
 * first cut.
 *
 * COVERAGE
 *   INV-1..3  — imports + exactly one AC5 call site + the human wire shape,
 *               never the developer form.
 *   PRES-1..2 — the presence/type half of the split guard stays BEFORE the
 *               check, exactly once (a missing field has no text to screen).
 *   ORD-1..5  — the `what_happened` MINIMUM (<10) sits AFTER the structural
 *               end of `if (gate.shouldRedirect) { … }` and BEFORE the first
 *               context load and the LLM call; non-vacuity of every anchor.
 *
 * MUTATION RECORD (2026-09-05, on a scratch copy, real tree untouched): the
 * minimum placed BEFORE the check → ORD-1 fails; placed BETWEEN the check and
 * the redirect return → ORD-1 fails (it is inside the anchored block's
 * predecessor, before its end); the minimum deleted → ORD-3 fails
 * (occurrence count 0); the presence half deleted → PRES-1 fails.
 *
 * NOT COVERED: end-to-end HTTP (route.ts imports supabase-server + the
 * Anthropic client — live env); the founder-walked smoke covers it: a
 * 14-character distressed `what_happened` → 200 with the crisis resources;
 * the same length benign → 400.
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

// --- Anchors (all evaluated on the string-blanked view; a mention inside a
// string literal or a comment can never satisfy one) ------------------------
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

// INV — invocation --------------------------------------------------------
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

// PRES — the presence/type half stayed before the check --------------------
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

// ORD — execution order ----------------------------------------------------
expectTrue(
  'ORD-1 the what_happened MINIMUM (<10) follows the structural END of the redirect-return block ' +
    '(2026-09-06 ruling: the distress check AND its crisis redirect run before the length guard; ' +
    'anchored on the block\'s own closing brace, so drift to anywhere inside it — before OR after ' +
    'the check — is caught)',
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
