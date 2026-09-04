/**
 * assessment-contract-drift.test.ts -- the published assessment contract must
 * match the contract the routes actually enforce.
 *
 * WHY THIS EXISTS. On 2026-03-29 the public documents described the assessment
 * endpoints as 11 free / 37 paid / 7 phases with an example id of "SO-01". On
 * 2026-04-01 -- three days later -- the code moved to 14 free / 55 paid / 8
 * phases, and "SO-01" ceased to exist (the free ids became FD-01..FD-07 and
 * AM-01..AM-07). The documents were never updated, and the drift stood for
 * about five months until the 2026-09-05 count-discipline sweep.
 *
 * The consequence was not a wrong number in prose. Both routes hard-reject:
 * foundational requires exactly 14 responses, full requires exactly 55, and
 * both validate every id against their own set. An agent following the
 * published documentation received HTTP 400 on its first honest attempt.
 *
 * A written instruction not to hand-maintain these numbers would not have
 * helped -- the perimeter count went stale five times past exactly such an
 * instruction. So this file derives every number from source and asserts the
 * published surfaces agree.
 *
 * Rules served: R18 (honest public claims). Placement mirrors
 * r20a-invocation-guard.test.ts, which enforces the same discipline for the
 * R20a perimeter count.
 */

import * as fs from 'fs'
import * as path from 'path'
import { FREE_ASSESSMENT_IDS, V3_ASSESSMENT_PHASES } from '../agent-assessment'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

const websiteRoot = process.cwd()
const read = (rel: string): string => fs.readFileSync(path.join(websiteRoot, rel), 'utf-8')

// ---------------------------------------------------------------------------
// Derived truth. Nothing below is written by hand.
// ---------------------------------------------------------------------------

const FREE_COUNT = FREE_ASSESSMENT_IDS.length
const PHASE_COUNT = V3_ASSESSMENT_PHASES.length
const TOTAL_COUNT = (V3_ASSESSMENT_PHASES as ReadonlyArray<{ assessment_count: number }>)
  .reduce((n, p) => n + p.assessment_count, 0)

const foundationalSrc = read('src/app/api/assessment/foundational/route.ts')
const fullSrc = read('src/app/api/assessment/full/route.ts')

const gateOf = (src: string): number | null => {
  const m = src.match(/responses\.length\s*!==\s*(\d+)/)
  return m ? Number(m[1]) : null
}

// --- 1-4: the code agrees with itself -------------------------------------

assert(
  gateOf(foundationalSrc) === FREE_COUNT,
  `free route hard gate (${gateOf(foundationalSrc)}) equals FREE_ASSESSMENT_IDS.length (${FREE_COUNT})`
)

assert(
  FREE_ASSESSMENT_IDS.every((id) => /^(FD|AM)-\d{2}$/.test(id)),
  'free assessment ids all match the FD-/AM- vocabulary'
)

assert(
  gateOf(fullSrc) === TOTAL_COUNT,
  `paid route hard gate (${gateOf(fullSrc)}) equals the sum of phase assessment_count (${TOTAL_COUNT})`
)

assert(
  new RegExp(`across all ${PHASE_COUNT} phases`).test(fullSrc),
  `paid route self-doc states the derived phase count (${PHASE_COUNT})`
)

// --- 5-8: llms.txt ---------------------------------------------------------

const llms = read('public/llms.txt')

assert(
  new RegExp(`Foundational Alignment Check \\(${FREE_COUNT} assessments`).test(llms),
  `llms.txt free-tier heading states the derived free count (${FREE_COUNT})`
)

assert(
  new RegExp(`\\(${TOTAL_COUNT} assessments, all ${PHASE_COUNT} phases\\)`).test(llms),
  `llms.txt paid-tier heading states the derived counts (${TOTAL_COUNT} / ${PHASE_COUNT})`
)

assert(
  !/\b(11|37)\s+(free-tier\s+)?(self-)?assessment/i.test(llms) && !/all 37/.test(llms),
  'llms.txt carries no superseded assessment count (11 free / 37 paid)'
)

{
  // Every quoted assessment_id on the public surface must exist in the bank.
  // This is the check that catches SO-01, which no count assertion would.
  const known = new Set<string>(FREE_ASSESSMENT_IDS)
  const quoted = [...llms.matchAll(/"assessment_id":\s*"([A-Z]{2}-\d{2})"/g)].map((m) => m[1])
  const unknown = quoted.filter((id) => !known.has(id))
  assert(unknown.length === 0, `llms.txt quotes no unknown assessment_id -- found: ${JSON.stringify(unknown)}`)
}

// --- 9-10: agent-card.json -------------------------------------------------

const card = read('public/.well-known/agent-card.json')

assert(
  new RegExp(`all ${TOTAL_COUNT} assessments across ${PHASE_COUNT} phases`).test(card)
    && new RegExp(`Full ${TOTAL_COUNT}-assessment evaluation across ${PHASE_COUNT} phases`).test(card),
  `agent-card.json states the derived paid counts (${TOTAL_COUNT} / ${PHASE_COUNT})`
)

assert(
  new RegExp(`across ${FREE_COUNT} prompts`).test(card) && !/\b(11|37) (assessments|prompts|self-assessment)/.test(card),
  `agent-card.json states the derived free count (${FREE_COUNT}) and carries no superseded count`
)

// --- 11: skill-registry.ts (served via /api/skills, /api/marketplace, ...) --

{
  const registry = read('src/lib/skill-registry.ts')
  const known = new Set<string>(FREE_ASSESSMENT_IDS)
  const quoted = [...registry.matchAll(/assessment_id:\s*'([A-Z]{2}-\d{2})'/g)].map((m) => m[1])
  const unknown = quoted.filter((id) => !known.has(id))
  assert(unknown.length === 0, `skill-registry.ts quotes no unknown assessment_id -- found: ${JSON.stringify(unknown)}`)
}

// --- 12: non-vacuity -------------------------------------------------------
// Each matcher must fire on the real stale string it exists to catch, or these
// cases are comments with a green tick.

{
  const staleLlms = '**Free Tier — Foundational Alignment Check (11 assessments, Phases 1-2)**'
  assert(
    !new RegExp(`Foundational Alignment Check \\(${FREE_COUNT} assessments`).test(staleLlms),
    'non-vacuous: the free-count matcher does NOT accept the real 2026-03-29 stale heading'
  )

  const staleBody = '{ "agent_id": "x", "responses": [{ "assessment_id": "SO-01", "response": "y" }] }'
  const known = new Set<string>(FREE_ASSESSMENT_IDS)
  const quoted = [...staleBody.matchAll(/"assessment_id":\s*"([A-Z]{2}-\d{2})"/g)].map((m) => m[1])
  assert(
    quoted.length === 1 && quoted.filter((id) => !known.has(id)).length === 1,
    'non-vacuous: the unknown-id matcher fires on the real SO-01 example'
  )
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
}
