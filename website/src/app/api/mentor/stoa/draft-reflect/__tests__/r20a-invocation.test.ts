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
// Session 3D (2026-09-06): the shared structural helpers for the
// EXECUTION-ORDER pins (memory guard-scope-must-cover-the-class).
import {
  loadCodeOnly,
  structuralBlock,
  codeIndexAfter,
  codeCount,
  readTextLimitsFromSource,
  BARE_LENGTH_GUARD_RE,
  VALIDATE_TEXT_LENGTH_CALL_RE,
} from '@/lib/__tests__/r20a-ordering-pin-helpers'
import { STOA_DISTRESS_FIELD_CAP } from '@/lib/stoa/stoa-r20a'

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

// ============================================================================
// EXECUTION-ORDER PINS — Session 3D (2026-09-06), the R20a ordering
// restructure (audit §2.1 row 13; §3 constraint 6). The subject is composed
// from the RAW body before parseDraft; the parse's 400s run after the
// redirect return. Anchored on the call-site order inside the POST block:
// compose(raw) → the empty-subject skip → gate → parseDraft → the LLM call.
// ============================================================================
{
  const code = loadCodeOnly(ROUTE_PATH)
  const LIMITS = readTextLimitsFromSource()
  const h = structuralBlock(code, /export\s+async\s+function\s+POST\s*\([^)]*\)\s*\{/)
  const COMPOSE_RE = /const\s+subject\s*=\s*composeStoaDistressSubject\s*\(\s*\{/
  const RAW_FIELD_RE = (wire: string, key: string) => new RegExp(`${key}\\s*:\\s*String\\(\\s*body\\.${wire}\\s*\\?\\?\\s*['"]{2}\\s*\\)\\.slice\\(\\s*0\\s*,\\s*TEXT_LIMITS\\.short\\s*\\)`)
  const SKIP_RE = /if\s*\(\s*subject\.length\s*>\s*0\s*\)\s*\{/
  const GATE_RE = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(\s*subject\s*\)\s*\)/
  const PARSE_RE = /const\s+parsed\s*=\s*parseDraft\s*\(\s*body\s*\)/
  const LLM_RE = /requestDraftMirrorReading\s*\(\s*parsed\.draft\s*\)/
  const OLD_COMPOSE_RE = /composeStoaDistressSubject\s*\(\s*parsed\.draft\s*\)/
  const inBlock = (re: RegExp) => { const i = codeIndexAfter(code, re, h.openIdx); return i > -1 && i < h.endIdx ? i : -1 }
  const composeIdx = inBlock(COMPOSE_RE), skipIdx = inBlock(SKIP_RE), gateIdx = inBlock(GATE_RE), parseIdx = inBlock(PARSE_RE), llmIdx = inBlock(LLM_RE)
  // MUTATION FOLD (2026-09-06, in-build): anchoring the parse on the GATE
  // CALL was not enough — a mutation placing the parse BETWEEN the gate call
  // and its redirect return stayed green, and that is the harm itself. The
  // anchor is the enclosing skip-block's brace-matched END (which contains
  // the gate AND its redirect return), the arc's standing lesson.
  const skipBlock = structuralBlock(code, SKIP_RE)
  const span = h.openIdx > -1 && h.endIdx > h.openIdx ? code.slice(h.openIdx, h.endIdx) : ''
  const preCompose = composeIdx > -1 ? code.slice(h.openIdx, composeIdx) : ''
  const preGate = gateIdx > -1 ? code.slice(h.openIdx, gateIdx) : ''
  expectTrue('ORD-1 the POST block was found exactly once and is non-degenerate; compose, skip, gate, parse and LLM anchors each found inside it; the skip block was found exactly once, is non-degenerate, and nests the gate (skip open < gate < skip end)',
    h.matches === 1 && h.openIdx > -1 && h.endIdx > h.openIdx && composeIdx > -1 && skipIdx > -1 && gateIdx > -1 && parseIdx > -1 && llmIdx > -1 &&
      skipBlock.matches === 1 && skipBlock.openIdx > -1 && skipBlock.endIdx > skipBlock.openIdx && gateIdx > skipBlock.openIdx && gateIdx < skipBlock.endIdx,
    `block=${h.openIdx}..${h.endIdx} (${h.matches}) compose=${composeIdx} skip=${skipBlock.openIdx}..${skipBlock.endIdx} (${skipBlock.matches}) gate=${gateIdx} parse=${parseIdx} llm=${llmIdx}`)
  expectTrue('ORD-2 order: compose(raw body) < the skip block (which holds the gate AND its redirect return) < parseDraft < the mirror-reading LLM call — the parse follows the block\'s structural END, so a parse placed anywhere inside it, before OR after the gate call, is caught (mutation fold)',
    composeIdx > -1 && skipBlock.openIdx > composeIdx && skipBlock.endIdx > -1 && parseIdx > skipBlock.endIdx && llmIdx > parseIdx,
    `compose=${composeIdx} skipOpen=${skipBlock.openIdx} skipEnd=${skipBlock.endIdx} parse=${parseIdx} llm=${llmIdx}`)
  expectTrue('ORD-3 non-vacuity: compose, gate, parse and the LLM call each appear exactly once in the handler; the old parsed-draft composition is gone',
    codeCount(span, COMPOSE_RE) === 1 && codeCount(span, GATE_RE) === 1 && codeCount(span, PARSE_RE) === 1 && codeCount(span, LLM_RE) === 1 && codeCount(code, OLD_COMPOSE_RE) === 0,
    `counts=${codeCount(span, COMPOSE_RE)}/${codeCount(span, GATE_RE)}/${codeCount(span, PARSE_RE)}/${codeCount(span, LLM_RE)} old=${codeCount(code, OLD_COMPOSE_RE)}`)
  expectTrue('RAW-1 all three draft fields are composed from the raw body as String(body.x ?? \'\').slice(0, TEXT_LIMITS.short), exactly once each',
    codeCount(code, RAW_FIELD_RE('what_i_bring', 'whatIBring')) === 1 && codeCount(code, RAW_FIELD_RE('what_i_seek', 'whatISeek')) === 1 && codeCount(code, RAW_FIELD_RE('contact_channel', 'contactChannel')) === 1,
    `bring=${codeCount(code, RAW_FIELD_RE('what_i_bring', 'whatIBring'))} seek=${codeCount(code, RAW_FIELD_RE('what_i_seek', 'whatISeek'))} contact=${codeCount(code, RAW_FIELD_RE('contact_channel', 'contactChannel'))}`)
  expectTrue('RAW-2 the cap (TEXT_LIMITS.short) equals the composer\'s STOA_DISTRESS_FIELD_CAP and the guard\'s bound — read from source',
    LIMITS.short === STOA_DISTRESS_FIELD_CAP && LIMITS.short === 2000, `short=${LIMITS.short} cap=${STOA_DISTRESS_FIELD_CAP}`)
  expectTrue('NEG-1 no length guard of ANY form exists between the handler open and the subject composition (the class fence; the route\'s own empty-subject skip — subject.length > 0 — sits after the composition and is pinned by ORD-2 as the only such form before the gate)',
    composeIdx > -1 && codeCount(preCompose, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preCompose, BARE_LENGTH_GUARD_RE) === 0 &&
      codeCount(preGate, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preGate, BARE_LENGTH_GUARD_RE) === 1 && codeCount(preGate, SKIP_RE) === 1,
    `preCompose vtl=${codeCount(preCompose, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preCompose, BARE_LENGTH_GUARD_RE)}; preGate bare=${codeCount(preGate, BARE_LENGTH_GUARD_RE)} skip=${codeCount(preGate, SKIP_RE)}`)
  {
    const lits = ['must be text', 'Nothing to reflect on'].filter((l) => preGate.includes(l))
    const toks = codeCount(preGate, /parseDraft\s*\(/) + codeCount(preGate, /validateTextLength\s*\(/)
    // PR19 fold (2026-09-06): the RAW field-name fence, ported from the
    // sibling /api/mentor/stoa battery. Without it this check saw only two
    // literal messages and two helper tokens, so a decoy pre-gate guard
    // phrased with a FRESH error message and no helper call —
    // `if (body.what_i_bring !== undefined && typeof body.what_i_bring !== 'string') return 400` —
    // reopened the exact ordering defect the ruling closed and the battery
    // stayed 63/0 (demonstrated live by a reviewer). The stoa battery had
    // been hardened against this same class in-build and the fix was not
    // ported to its sibling: the instance was fixed, the CLASS was not
    // (memory `guard-scope-must-cover-the-class`). These are matched on the
    // RAW comment-stripped span, not the string-blanked view, because a
    // quoted key survives only there.
    //
    // The composition line itself necessarily names all three fields, so the
    // span for this fence ends at the composition, not at the gate.
    const NEG2_RAW_TOKENS: RegExp[] = [/\bwhat_i_bring\b/, /\bwhat_i_seek\b/, /\bcontact_channel\b/]
    const rawToks = composeIdx > -1 ? NEG2_RAW_TOKENS.filter((re) => re.test(preCompose)) : NEG2_RAW_TOKENS
    expectTrue('NEG-2 no rejection on a draft field occurs before the subject is composed and gated, in ANY form — parseDraft\'s error literals and its helper tokens are absent from the pre-gate span, AND no draft field is named at all in the span before the composition (the raw field-name fence, ported from the sibling battery after a decoy with a fresh message passed green)',
      gateIdx > -1 && composeIdx > -1 && lits.length === 0 && toks === 0 && rawToks.length === 0,
      `literals=${JSON.stringify(lits)} tokens=${toks} rawFieldNames=${rawToks.map((r) => r.source).join(',')}`)
  }
}

console.log(`\nstoa draft-reflect r20a-invocation: ${passCount} passed, ${failCount} failed`)
if (failCount > 0) process.exit(1)
