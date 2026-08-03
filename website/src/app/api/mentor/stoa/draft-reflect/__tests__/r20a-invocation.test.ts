/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the Stoa
 * draft-reflect route's R20a catch (ST6, 2026-08-03; the AC5 thirteenth
 * route-level perimeter entry) + the ST6 no-persistence and mirror-register
 * boundary pins (Q12).
 *
 * Run via: npx tsx src/app/api/mentor/stoa/draft-reflect/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest); mirrors the twelfth route's per-route
 * test (src/app/api/mentor/stoa/__tests__/r20a-invocation.test.ts) per PR15.
 * EXIT 0 all pass; EXIT 1 any fail.
 *
 * COVERAGE
 *   INV-* — file-grep over the route source: the imports, the AC5 pattern
 *     awaited, both flags, the gate BEFORE the mirror-reading LLM call.
 *   FT-*  — isStoaDraftReflectEnabled semantics (unset / 'true' / 'false' /
 *     '1'), mirroring the twelfth route's flag-semantics test exactly.
 *   NP-*  — NO PERSISTENCE (ST6 founder election): the route + its library
 *     module import no DB/store client of any kind.
 *   MR-*  — MIRROR REGISTER (Q12): the system prompt forbids score/grade/
 *     rank/verdict vocabulary; the response shape carries no such field.
 *   RH-*  — renderR20aRedirectResponse at audience 'human_user' (the human
 *     wire shape, never the developer form) — reused check, same as the
 *     twelfth route's.
 *
 * NOT COVERED (same posture as the sibling tests): end-to-end HTTP against
 * the handler (transitively needs live env) — an activation smoke would
 * cover it, per the twelfth route's ST5 precedent; the live Sonnet path.
 *
 * Rules served: R20a; AC4; AC5 (thirteenth-route protocol); PR3; PR6; PR15.
 */

import * as fs from 'fs'
import * as path from 'path'

import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import { isStoaDraftReflectEnabled } from '@/lib/stoa/stoa-draft-reflect'

let passCount = 0
let failCount = 0

function pass(name: string): void {
  console.log(`PASS — ${name}`)
  passCount++
}
function fail(name: string, message: string): void {
  console.log(`FAIL — ${name}: ${message}`)
  failCount++
}
function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) pass(name)
  else fail(name, hint ?? 'condition was false')
}

// ============================================================================
// ROUTE + LIBRARY SOURCE
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')
const LIB_PATH = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'lib', 'stoa', 'stoa-draft-reflect.ts')
const routeSrc = fs.readFileSync(ROUTE_PATH, 'utf-8')
const libSrc = fs.readFileSync(LIB_PATH, 'utf-8')

/** Strip TS comments so documentation quoting the AC5 pattern (or the
 *  forbidden-vocabulary list, in the system prompt's own comment) never
 *  satisfies or inflates a structural check. */
function stripTsComments(ts: string): string {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const bodySrc = stripTsComments(routeSrc)
  .split('\n')
  .filter((l) => !l.trim().startsWith('import ') && !l.trim().startsWith('} from'))
  .join('\n')

// Comment-stripped whole-file sources — NP/MR import-boundary checks must
// ignore documentation prose (which deliberately NAMES the forbidden tokens
// to explain why they're absent), same discipline as the guard registry's
// own stripComments lesson (memory: guard-needs-a-non-vacuity-floor).
const routeSrcNoComments = stripTsComments(routeSrc)
const libSrcNoComments = stripTsComments(libSrc)

// ============================================================================
// INV — invocation + structural pins
// ============================================================================

expectTrue('INV-0 route file exists', fs.existsSync(ROUTE_PATH))
expectTrue('INV-0b library file exists', fs.existsSync(LIB_PATH))
expectTrue(
  'INV-1 imports detectDistressTwoStage from r20a-classifier',
  routeSrc.includes('detectDistressTwoStage') && routeSrc.includes('r20a-classifier'),
)
expectTrue(
  'INV-2 imports enforceDistressCheck from constraints',
  routeSrc.includes('enforceDistressCheck') && routeSrc.includes('constraints'),
)
expectTrue(
  'INV-3 imports renderR20aRedirectResponse from the audience renderer',
  routeSrc.includes('renderR20aRedirectResponse') && routeSrc.includes('r20a-audience-renderer'),
)
expectTrue(
  'INV-4 imports composeStoaDistressSubject (reused, PR15 — never re-implemented)',
  routeSrc.includes('composeStoaDistressSubject') && routeSrc.includes('stoa-r20a'),
)
expectTrue(
  'INV-5 imports + calls BOTH flags (isStoaEnabled AND isStoaDraftReflectEnabled)',
  routeSrc.includes('stoa-store') &&
    /isStoaEnabled\s*\(\s*\)/.test(bodySrc) &&
    routeSrc.includes('stoa-draft-reflect') &&
    /isStoaDraftReflectEnabled\s*\(\s*\)/.test(bodySrc),
)
expectTrue(
  'INV-6 the AC5 pattern is awaited in the body',
  /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(bodySrc),
)
expectTrue(
  'INV-7 the mild-escalation pass is imported and awaited (PR15, reused)',
  routeSrc.includes('escalateMildDistress') && routeSrc.includes('score-conversation-r20a') &&
    /await\s+escalateMildDistress\s*\(/.test(bodySrc),
)
{
  // The gate PRECEDES the mirror-reading LLM call (PR3 — before any LLM
  // spend, mirroring the twelfth route's "before any store write").
  const gateIdx = bodySrc.indexOf('enforceDistressCheck(detectDistressTwoStage(')
  const readingIdx = bodySrc.indexOf('requestDraftMirrorReading(')
  expectTrue('INV-8 the gate precedes requestDraftMirrorReading',
    gateIdx > -1 && readingIdx > gateIdx, `gate=${gateIdx} reading=${readingIdx}`)
  expectTrue('INV-9 requestDraftMirrorReading is awaited',
    /await\s+requestDraftMirrorReading\s*\(/.test(bodySrc))
}
expectTrue(
  'INV-10 the support_resources fold is present (mild rides, never blocks)',
  bodySrc.includes('support_resources') && bodySrc.includes('supportResources'),
)
expectTrue(
  'INV-11 the human audience renders (never the developer form)',
  /audience:\s*'human_user'/.test(bodySrc) && !/agent_developer/.test(bodySrc),
)

// ============================================================================
// FT — flag semantics (default OFF; only the literal 'true' enables)
// ============================================================================

{
  const saved = process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED
  delete process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED
  expectTrue('FT-1 unset → disabled', isStoaDraftReflectEnabled() === false)
  process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED = 'true'
  expectTrue("FT-2 'true' → enabled", isStoaDraftReflectEnabled() === true)
  process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED = 'false'
  expectTrue("FT-3 'false' → disabled", isStoaDraftReflectEnabled() === false)
  process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED = '1'
  expectTrue("FT-4 '1' → disabled (case-strict literal)", isStoaDraftReflectEnabled() === false)
  if (saved === undefined) delete process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED
  else process.env.SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED = saved
}
expectTrue(
  'FT-5 the route requires BOTH flags (an AND, not an OR — checked in one guard clause)',
  /!isStoaEnabled\(\)\s*\|\|\s*!isStoaDraftReflectEnabled\(\)/.test(bodySrc),
)

// ============================================================================
// NP — no persistence (ST6 founder election): no DB/store client anywhere
// ============================================================================

const FORBIDDEN_IMPORT_TOKENS = ['supabase-js', 'stoa-store\'', 'stoa-store"', 'createClient', 'supabase-server']
for (const token of FORBIDDEN_IMPORT_TOKENS) {
  // isStoaEnabled IS imported from stoa-store (a read-only flag check, not a
  // write path) — allow that one named import, forbid everything else the
  // module exports (declareStoaEntry / updateStoaEntry / withdrawStoaEntry /
  // readStoaEntryForIdentity / listStoaEntries).
  if (token === 'stoa-store\'' || token === 'stoa-store"') continue
  expectTrue(`NP-1 route.ts never imports ${token}`, !routeSrcNoComments.includes(token), 'found forbidden import token')
  expectTrue(`NP-1b stoa-draft-reflect.ts never imports ${token}`, !libSrcNoComments.includes(token), 'found forbidden import token')
}
expectTrue(
  'NP-2 route.ts imports ONLY isStoaEnabled from stoa-store (no write function)',
  /import\s*\{\s*isStoaEnabled\s*\}\s*from\s*['"]@\/lib\/stoa\/stoa-store['"]/.test(routeSrc),
)
const FORBIDDEN_WRITE_FUNCTIONS = ['declareStoaEntry', 'updateStoaEntry', 'withdrawStoaEntry', 'readStoaEntryForIdentity', 'listStoaEntries']
for (const fn of FORBIDDEN_WRITE_FUNCTIONS) {
  expectTrue(`NP-3 route.ts never calls ${fn}`, !routeSrc.includes(fn))
}
expectTrue('NP-4 route.ts never mentions .from( (no table access)', !bodySrc.includes('.from('))
expectTrue('NP-5 library module never mentions .from( (no table access)', !libSrc.includes('.from('))

// ============================================================================
// MR — mirror register (Q12): no verdict/score/grade vocabulary can leak
// ============================================================================

// Matches MR-2's system-prompt-forbidden vocabulary exactly (PR19 fold, ST6
// independent review — MR-1 was narrower than MR-2's own list, so a field
// literally named `level:`/`proximity:`/`virtue:` on the response could ship
// while MR-2 still reported the system prompt "forbids" that exact word).
const FORBIDDEN_VERDICT_WORDS = [
  'proximity_rank', 'katorthoma', 'virtue_domain', 'grade', 'verdict', 'score:',
  'level:', 'proximity:', 'virtue:', 'score', 'level', 'proximity', 'virtue',
]
for (const word of FORBIDDEN_VERDICT_WORDS) {
  expectTrue(`MR-1 route.ts response shape never carries "${word}"`, !bodySrc.toLowerCase().includes(word.toLowerCase()))
}
expectTrue(
  'MR-2 the system prompt explicitly forbids score/level/proximity/virtue vocabulary',
  libSrc.includes('"score"') && libSrc.includes('"level"') && libSrc.includes('"proximity"') && libSrc.includes('"virtue"'),
)
expectTrue(
  'MR-3 the system prompt explicitly forbids scoring/grading/ranking/classifying',
  /Never scores, grades, ranks, or classifies/i.test(libSrc),
)
expectTrue(
  'MR-4 the response shape carries reflection + disclaimer only (no id/declared_at — never a row shape)',
  bodySrc.includes('reflection: result.reading.reflection') &&
    !bodySrc.includes('declared_at') &&
    !/\bid:\s/.test(bodySrc),
)
expectTrue(
  'MR-5 the module never imports the translation-sandwich engine (no full evaluative pass)',
  !libSrcNoComments.includes('runSageReason') &&
    !libSrcNoComments.includes('translation-sandwich') &&
    !libSrcNoComments.includes('/api/reason'),
)
{
  // Scoped to the catch block SPECIFICALLY (PR19 fold, ST6 independent
  // review — a whole-file `includes` was satisfied by an unrelated
  // `ok: false, error:` in the empty-response-text branch, so a mutation
  // fabricating a plausible reflection inside the catch would have passed).
  const catchIdx = libSrcNoComments.indexOf('catch (err)')
  expectTrue('MR-6a the catch block exists', catchIdx > -1)
  const catchBlock = libSrcNoComments.slice(catchIdx)
  expectTrue(
    'MR-6b the catch block returns an honest failure, never a fabricated ok:true reading',
    /ok:\s*false,\s*error:/.test(catchBlock) && !/ok:\s*true/.test(catchBlock),
  )
  expectTrue('MR-6c the route surfaces the outage as a 502', bodySrc.includes('status: 502'))
}

// ============================================================================
// RH — human-audience rendering (reused check, same as the twelfth route)
// ============================================================================

for (const severity of ['moderate', 'acute'] as const) {
  const payload = renderR20aRedirectResponse({
    audience: 'human_user',
    severity,
    redirect_message: 'test redirect',
  }) as unknown as Record<string, unknown>
  expectTrue(`RH-1(${severity}) the human wire shape`,
    payload.distress_detected === true &&
      payload.severity === severity &&
      payload.redirect_message === 'test redirect')
  expectTrue(`RH-2(${severity}) never the developer form`,
    !('status' in payload) && !('developer_note' in payload) &&
      !('suggested_user_message' in payload) && !('flow_terminated' in payload))
}

console.log(`\nstoa draft-reflect r20a-invocation: ${passCount} passed, ${failCount} failed`)
if (failCount > 0) process.exit(1)
