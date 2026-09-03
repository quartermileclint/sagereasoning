/**
 * discernment-observability-wiring.test.ts — EXECUTED source-pin regression
 * for the 503-rate diagnosis fix (2026-09-03, standing-queue item), which
 * added `logRouteError`/`isLlmOutage` to both catch blocks in
 * `handler.ts` — closing the gap that made the reflections-examination arc's
 * 63 identical "http 503 — service error" `ELICIT-OUTAGE` events undiagnosable
 * from a DB query (only raw Vercel function logs carried the cause, which a
 * repo session cannot read).
 *
 * No injectable seam exists for `logRouteError` (it is a direct module import
 * fired inside a catch block, not part of `DiscernmentRouteDeps`, matching
 * every other LLM-calling route in this codebase — e.g. `api/reflect/route.ts`).
 * Constructing a full NextRequest + auth + elicit-throws round trip to observe
 * the call would require substantially more test scaffolding than this
 * additive, already-proven library call (`logRouteError`/`isLlmOutage`, both
 * shipped and exercised at `api/reflect/route.ts` already) warrants — so this
 * follows the session's established fallback for exactly this shape: a
 * source-pin wiring test, mutation-verified.
 *
 * Run: npx tsx src/app/api/practice/discernment/__tests__/discernment-observability-wiring.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

const src = fs.readFileSync(path.join(__dirname, '..', 'handler.ts'), 'utf-8')

async function main() {
  assert(/import \{ logRouteError \} from '@\/lib\/observability-store'/.test(src), '§1-1 imports logRouteError')
  assert(/import \{ isLlmOutage \} from '@\/lib\/llm-outage'/.test(src), '§1-2 imports isLlmOutage')

  // The client-facing response shape must be UNCHANGED (R4 reflect posture —
  // this fix adds server-side observability, it does not change what an
  // untrusted caller sees).
  const serviceErrorReturns = (src.match(/json\(\{ error: 'service error' \}, 503\)/g) || []).length
  assert(serviceErrorReturns === 2, `§2-1 exactly 2 unchanged 'service error' 503 returns remain (saw ${serviceErrorReturns})`)

  // Both catch blocks call logRouteError with the correct route + statusCode
  // + the isLlmOutage classification, before returning the unchanged response.
  const logCallCount = (src.match(/logRouteError\(\{/g) || []).length
  assert(logCallCount === 2, `§3-1 exactly 2 logRouteError call sites (one per catch block) (saw ${logCallCount})`)

  const postCatchMatch = /export async function runDiscernmentPost[\s\S]*?catch \(e\) \{([\s\S]*?)\n  \}\n\}/.exec(src)
  assert(postCatchMatch !== null, '§4-1 the POST handler catch block is found')
  const postCatchBody = postCatchMatch ? postCatchMatch[1] : ''
  assert(/route: '\/api\/practice\/discernment'/.test(postCatchBody), "§4-2 POST catch logs route '/api/practice/discernment'")
  assert(/method: 'POST'/.test(postCatchBody), "§4-3 POST catch logs method 'POST'")
  assert(/statusCode: 503/.test(postCatchBody), '§4-4 POST catch logs statusCode 503')
  assert(/isLlmOutage: outage/.test(postCatchBody), '§4-5 POST catch classifies via isLlmOutage before logging')
  assert(/context: \{ phase:/.test(postCatchBody), '§4-6 POST catch attaches the phase (PII-free) as context')

  const getCatchMatch = /export async function runDiscernmentGet[\s\S]*?catch \(e\) \{([\s\S]*?)\n  \}\n\}/.exec(src)
  assert(getCatchMatch !== null, '§5-1 the GET handler catch block is found')
  const getCatchBody = getCatchMatch ? getCatchMatch[1] : ''
  assert(/route: '\/api\/practice\/discernment'/.test(getCatchBody), "§5-2 GET catch logs route '/api/practice/discernment'")
  assert(/method: 'GET'/.test(getCatchBody), "§5-3 GET catch logs method 'GET'")
  assert(/statusCode: 503/.test(getCatchBody), '§5-4 GET catch logs statusCode 503')
  assert(/isLlmOutage: isLlmOutage\(e\)/.test(getCatchBody), '§5-5 GET catch classifies via isLlmOutage before logging')

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('Failures:')
    for (const f of failures) console.log('  - ' + f)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('harness error:', err)
  process.exit(1)
})
