/**
 * r20a-invocation.test.ts — per-route R20a invocation + EXECUTION-ORDER pins
 * for /api/score-scenario. Created 2026-09-05 by Session 3 (Group 1, item 4)
 * of the perimeter-ordering audit (operations/count-discipline-2026-09/
 * 2026-09-05-r20a-perimeter-ordering-AUDIT.md §6), executing the 2026-09-06
 * mentor ruling. EXTENDED 2026-09-05 by Session 3B (Group 2, item 8) with the
 * MAX-* and CAP-* pins for the two maximum guards.
 *
 * Run: npx tsx src/app/api/score-scenario/__tests__/r20a-invocation.test.ts
 * (redirect to a file, then read it — memory `tsx-tests-setinterval-keepalive-hang`)
 *
 * Same coverage and mutation record as the /api/reflect battery (INV-1..3,
 * PRES-1..2, ORD-1..5, MAX-1..3, CAP-1..3), with this route's own anchors:
 * the check screens `response` ONLY, the moved minimum is
 * `response.trim().length < 5`, the moved maxima are `scenario` and
 * `response` (both TEXT_LIMITS.medium; only `response`'s move changes what
 * reaches the classifier), and the first post-guard load is the RAG block
 * (`loadLayer1BlockWithFallback`). The `scenario` presence check is a
 * P′-class check on a DIFFERENT field from the screened one — audit §4.4,
 * ruled by the mentor's 2026-09-05 Part 5 and MOVED after the redirect
 * return by Session 3C (Group 2b, 2026-09-06): pinned by SIB-1..3 + NEG-2
 * (the non-length class fence — a decoy re-add before the check must go red,
 * matched on the quoted error literal AND the structural token).
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

// The cap is a NAMED local defined before the check (not inline on the check
// line) so the audit's rev-2 sweep keeps its check→redirect window at 0 bound
// lines. 2026-09-05, caught by the sweep in-build.
const CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*screenedResponse\s*\)\s*\)/
const ANY_CHECK_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
const CAP_RE = /const\s+screenedResponse\s*=\s*response\.slice\(\s*0\s*,\s*TEXT_LIMITS\.medium\s*\)/
const RAW_SUBJECT_RE = /detectDistressTwoStage\s*\(\s*response(?:\.slice\([^)]*\))?\s*\)/
const REDIRECT_OPEN_RE = /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/
const PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!response\\s*\\|\\|\\s*typeof\\s+response\\s*!==\\s*${QUOTED}\\s*\\)`)
const MIN_GUARD_RE = /response\.trim\(\)\.length\s*<\s*5/
const MAX_SCENARIO_RE = new RegExp(`validateTextLength\\(\\s*scenario\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const MAX_RESPONSE_RE = new RegExp(`validateTextLength\\(\\s*response\\s*,\\s*${QUOTED}\\s*,\\s*TEXT_LIMITS\\.medium\\s*\\)`)
const CONTEXT_LOAD_RE = /loadLayer1BlockWithFallback\s*\(/
const LLM_CALL_RE = /client\.messages\.create\s*\(/

const checkIdx = codeIndex(code, CHECK_RE)
const block = structuralBlock(code, REDIRECT_OPEN_RE)
const presenceIdx = codeIndex(code, PRESENCE_RE)
const minIdx = codeIndex(code, MIN_GUARD_RE)
const maxScenarioIdx = codeIndex(code, MAX_SCENARIO_RE)
const maxResponseIdx = codeIndex(code, MAX_RESPONSE_RE)
// Anchored AFTER the check: the same loader/client may occur earlier on another path.
const contextIdx = codeIndexAfter(code, CONTEXT_LOAD_RE, checkIdx)
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
  'PRES-1 the presence/type half (!response || typeof !== string) exists exactly once',
  codeCount(code, PRESENCE_RE) === 1,
  `count=${codeCount(code, PRESENCE_RE)}`,
)
expectTrue(
  'PRES-2 the presence/type half precedes the distress check (the check needs a string; a missing field has no text to screen)',
  presenceIdx > -1 && checkIdx > -1 && presenceIdx < checkIdx,
  `presence=${presenceIdx} check=${checkIdx}`,
)
expectTrue(
  'ORD-1 the response MINIMUM (<5) follows the structural END of the redirect-return block ' +
    '(2026-09-06 ruling; anchored on the block\'s own closing brace, so drift to anywhere inside it — ' +
    'before OR after the check — is caught)',
  minIdx > -1 && block.endIdx > -1 && minIdx > block.endIdx,
  `min=${minIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'ORD-2 the minimum still precedes the first RAG/context load and the LLM call (order, not existence)',
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
  'MAX-1 BOTH maximum guards (scenario, response; TEXT_LIMITS.medium) follow the structural END of the redirect-return block',
  maxScenarioIdx > -1 && maxResponseIdx > -1 && block.endIdx > -1 &&
    maxScenarioIdx > block.endIdx && maxResponseIdx > block.endIdx,
  `scenario=${maxScenarioIdx} response=${maxResponseIdx} blockEnd=${block.endIdx}`,
)
expectTrue(
  'MAX-2 the maxima keep their relative order (scenario, then response), precede the moved minimum, and precede the first RAG/context load and the LLM call',
  maxScenarioIdx > -1 && maxResponseIdx > maxScenarioIdx && minIdx > maxResponseIdx &&
    contextIdx > -1 && llmIdx > -1 && maxResponseIdx < contextIdx && maxResponseIdx < llmIdx,
  `scenario=${maxScenarioIdx} response=${maxResponseIdx} min=${minIdx} context=${contextIdx} llm=${llmIdx}`,
)
expectTrue(
  'MAX-3 non-vacuity: each maximum appears exactly once',
  codeCount(code, MAX_SCENARIO_RE) === 1 && codeCount(code, MAX_RESPONSE_RE) === 1,
  `scenarioCount=${codeCount(code, MAX_SCENARIO_RE)} responseCount=${codeCount(code, MAX_RESPONSE_RE)}`,
)
expectTrue(
  'CAP-1 the classifier receives screenedResponse (= response.slice(0, TEXT_LIMITS.medium)), defined exactly once after the presence check and before the check, and never the raw field',
  codeCount(code, CAP_RE) === 1 && codeIndex(code, CAP_RE) > presenceIdx && codeIndex(code, CAP_RE) < checkIdx &&
    codeCount(code, CHECK_RE) === 1 && codeCount(code, RAW_SUBJECT_RE) === 0,
  `capCount=${codeCount(code, CAP_RE)} cap=${codeIndex(code, CAP_RE)} presence=${presenceIdx} check=${checkIdx} raw=${codeCount(code, RAW_SUBJECT_RE)}`,
)
expectTrue(
  'CAP-2 the cap key (TEXT_LIMITS.medium) is the SAME key the moved response guard enforces (the cap equals the bound)',
  /validateTextLength\(\s*response\s*,[^)]*TEXT_LIMITS\.medium\s*\)/.test(code) && CAP_RE.test(code),
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
    'NEG-1 no length guard of ANY form (validateTextLength( or a .length </>/<=/>= comparison) exists between the handler start and the distress check (PR19 fold 2026-09-06 — the class fence: a decoy guard in another form passed every positional pin)',
    postIdx > -1 && checkIdx > postIdx &&
      codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preSpan, BARE_LENGTH_GUARD_RE) === 0,
    `post=${postIdx} check=${checkIdx} vtl=${codeCount(preSpan, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preSpan, BARE_LENGTH_GUARD_RE)}`,
  )
}

// SIB-* / NEG-2 — Session 3C (Group 2b, 2026-09-06): the `scenario`
// presence/type 400 (the audit's §4.4 P′ class; mentor Part 5) moved after
// the redirect return.
{
  const SCENARIO_PRESENCE_RE = new RegExp(`if\\s*\\(\\s*!scenario\\s*\\|\\|\\s*typeof\\s+scenario\\s*!==\\s*${QUOTED}\\s*\\)\\s*\\{`)
  const sibIdx = codeIndex(code, SCENARIO_PRESENCE_RE)
  expectTrue(
    'SIB-1 the scenario PRESENCE/TYPE 400 (a sibling of the screened field) follows the structural END of the redirect-return block',
    sibIdx > -1 && block.endIdx > -1 && sibIdx > block.endIdx,
    `sib=${sibIdx} blockEnd=${block.endIdx}`,
  )
  expectTrue(
    'SIB-2 the sibling presence check precedes the scenario MAXIMUM (which needs the string), the response guards, and the first RAG/context load and LLM call',
    sibIdx > -1 && maxScenarioIdx > sibIdx && maxResponseIdx > sibIdx && minIdx > sibIdx && contextIdx > -1 && llmIdx > -1 && sibIdx < contextIdx && sibIdx < llmIdx,
    `sib=${sibIdx} maxScenario=${maxScenarioIdx} maxResponse=${maxResponseIdx} min=${minIdx} context=${contextIdx} llm=${llmIdx}`,
  )
  expectTrue(
    'SIB-3 non-vacuity: the sibling presence check appears exactly once',
    codeCount(code, SCENARIO_PRESENCE_RE) === 1,
    `count=${codeCount(code, SCENARIO_PRESENCE_RE)}`,
  )
  const postIdx = codeIndex(code, POST_HANDLER_RE)
  const preSpan = postIdx > -1 && checkIdx > postIdx ? code.slice(postIdx, checkIdx) : ''
  expectTrue(
    'NEG-2 the moved scenario 400 does not occur before the distress check in any form (its error literal, the `!scenario` presence token and a `typeof scenario` test are all absent from the pre-check span; the response presence check legitimately remains)',
    postIdx > -1 && checkIdx > postIdx && !preSpan.includes('scenario is required') &&
      codeCount(preSpan, /!scenario\b/) === 0 && codeCount(preSpan, /typeof\s+scenario\b/) === 0,
    `literal=${preSpan.includes('scenario is required')} presence=${codeCount(preSpan, /!scenario\b/)} typeof=${codeCount(preSpan, /typeof\s+scenario\b/)}`,
  )
}

const total = passCount + failCount
console.log('---')
console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)
if (failCount > 0) process.exit(1)
