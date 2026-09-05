/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/reflect. Created 2026-09-05 by Session 3 (Group 1, item 2) of the
 * perimeter-ordering audit (operations/count-discipline-2026-09/2026-09-05-
 * r20a-perimeter-ordering-AUDIT.md §6), executing the 2026-09-06 mentor
 * ruling: "the distress check runs before the length guard on any route where
 * the human crisis form is rendered." EXTENDED 2026-09-05 by Session 3B
 * (Group 2, item 5) with the MAX-* and CAP-* pins for the two maximum guards.
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
 *   MAX-1..3  — (Group 2) the `what_happened` and `how_i_responded` MAXIMUM
 *               guards (both TEXT_LIMITS.medium) sit AFTER the block's END,
 *               BEFORE the minimum and the first context load; non-vacuity.
 *   CAP-1..3  — (Group 2) the classifier's combinedInput is built from the
 *               two fields sliced at TEXT_LIMITS.medium, never the raw
 *               fields; TEXT_LIMITS.medium is the audit's M bound (5,000).
 *
 * MUTATION RECORD (2026-09-05, Group 1, on a scratch copy): the minimum
 * placed BEFORE the check → ORD-1 fails; placed BETWEEN the check and the
 * redirect return → ORD-1 fails; the minimum deleted → ORD-3 fails; the
 * presence half deleted → PRES-1 fails. (Group 2, real file, hash-verified
 * restore): the `what_happened` maximum placed BEFORE the check → MAX-1
 * fails; placed BETWEEN the check and the redirect return → MAX-1 fails;
 * deleted → MAX-3 fails; the cap removed (raw `what_happened` in
 * combinedInput) → CAP-1 fails.
 *
 * NOT COVERED: end-to-end HTTP (route.ts imports supabase-server + the
 * Anthropic client — live env); the founder-walked smoke covers it: a
 * 14-character distressed `what_happened` → 200 with the crisis resources;
 * the same length benign → 400; an oversized distressed `what_happened` →
 * 200 with the crisis resources; oversized benign → 400.
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

// --- Anchors (all evaluated on the string-blanked view; a mention inside a
// string literal or a comment can never satisfy one) ------------------------
const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
const PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!what_happened\\s*\\|\\|\\s*typeof\\s+what_happened\\s*!==\\s*${QUOTED}\\s*\\)`)
const MIN_GUARD_RE = /what_happened\.trim\(\)\.length\s*<\s*10/
const MAX_WH_RE = new RegExp(`validateTextLength\\(\\s*what_happened\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const MAX_HIR_RE = new RegExp(`validateTextLength\\(\\s*how_i_responded\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const CAP_WH_RE = /const\s+screenedWhatHappened\s*=\s*what_happened\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
// PR19 fold 2026-09-06: the non-string coercion must PRECEDE the slice
// (String(x || '').slice(...)), so an array cannot bypass the bound.
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

// ORD — execution order (the Group 1 minimum) --------------------------------
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

// MAX — execution order (the Group 2 maxima) ---------------------------------
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

// NEG — the CLASS fence (PR19 fold 2026-09-06: a decoy `if (x.length > …)`
// re-added before the check passed every positional pin green) -------------
{
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
  expectTrue(
    'NEG-1 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check — the class, not the instance',
    postIdx > -1 && checkIdx > postIdx &&
      codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
    `post=${postIdx} check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
  )
}

// CAP — the screening cap ------------------------------------------------------
expectTrue(
  'CAP-1 both fields are sliced at TEXT_LIMITS.medium into screened locals BEFORE the check (exactly once each), and the check reads combinedInput',
  codeCount(code, CAP_WH_RE) === 1 && codeCount(code, CAP_HIR_RE) === 1 &&
    capWhIdx > presenceIdx && capWhIdx < checkIdx && capHirIdx > presenceIdx && capHirIdx < checkIdx &&
    codeCount(code, SUBJECT_RE) === 1,
  `capWh=${capWhIdx} capHir=${capHirIdx} presence=${presenceIdx} check=${checkIdx} subject=${codeCount(code, SUBJECT_RE)}`,
)
expectTrue(
  'CAP-2 combinedInput is composed from the SCREENED locals, never from the raw fields (template-literal contents are string-blanked by the helpers, so this pin reads the comment-stripped raw source)',
  /const\s+combinedInput\s*=\s*`\$\{screenedWhatHappened\}\s\$\{screenedHowIResponded\}`/.test(code) &&
    !/combinedInput\s*=\s*`\$\{what_happened\}/.test(code),
)
expectTrue(
  'CAP-3 TEXT_LIMITS.medium is the audit\'s M bound (5,000) as read from security.ts source — the cap equals the guard',
  LIMITS.medium === 5000,
  `medium=${LIMITS.medium}`,
)

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
