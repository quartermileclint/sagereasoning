/**
 * r20a-invocation.test.ts — AC4 invocation + functional test for the Stoa
 * declaration route's R20a catch (ST3, 2026-08-03; the AC5 twelfth
 * route-level perimeter entry).
 *
 * Run via: npx tsx src/app/api/mentor/stoa/__tests__/r20a-invocation.test.ts
 *
 * Plain-assertion script (no Jest); mirrors the eleventh route's per-route
 * test (src/app/api/score-conversation/__tests__/r20a-invocation.test.ts)
 * per PR15. EXIT 0 all pass; EXIT 1 any fail.
 *
 * COVERAGE
 *   INV-* — file-grep over the route source: the imports, the AC5 pattern
 *     awaited, the flag call, ONE gate call site shared by POST + PATCH (the
 *     two free-text methods can never drift), the gate BEFORE every store
 *     write, the support_resources fold.
 *   FT-*  — isStoaEnabled semantics (unset / 'true' / 'false' / '1').
 *   CS-*  — composeStoaDistressSubject: order, skipping, the 2000-char cap,
 *     the field-seam guarantee (the eleventh route's F4 lesson).
 *   MS-*  — buildStoaMildSupportResources: mild, all shared resource lines,
 *     declaration-register wording (saves, never "evaluation").
 *   RH-*  — renderR20aRedirectResponse at audience 'human_user' (the human
 *     wire shape, never the developer form).
 *
 * NOT COVERED (same posture as the sibling tests): end-to-end HTTP against
 * the handler (transitively needs live env) — the ST5 activation smoke
 * covers it; the live Haiku path — r20a-classifier-eval.ts covers it.
 *
 * Rules served: R20a; AC4; AC5 (twelfth-route protocol); PR3; PR6; PR15.
 */

import * as fs from 'fs'
import * as path from 'path'

import { getCrisisResources, detectDistress } from '@/lib/guardrails'
import { renderR20aRedirectResponse } from '@/lib/substrate/r20a-audience-renderer'
import { isStoaEnabled } from '@/lib/stoa/stoa-store'
import {
  composeStoaDistressSubject,
  buildStoaMildSupportResources,
  STOA_DISTRESS_FIELD_CAP,
  STOA_DISTRESS_SEPARATOR,
} from '@/lib/stoa/stoa-r20a'
// Session 3D (2026-09-06): the shared brace-matched structural helpers for the
// EXECUTION-ORDER pins (memory guard-scope-must-cover-the-class).
import {
  loadCodeOnly,
  structuralBlock,
  codeIndexAfter,
  codeCount,
  BARE_LENGTH_GUARD_RE,
  VALIDATE_TEXT_LENGTH_CALL_RE,
} from '@/lib/__tests__/r20a-ordering-pin-helpers'

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
// ROUTE SOURCE
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')
const routeSrc = fs.readFileSync(ROUTE_PATH, 'utf-8')

/** Strip TS comments so the route's own documentation (which deliberately
 *  QUOTES the AC5 pattern) never satisfies or inflates a structural check. */
function stripTsComments(ts: string): string {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const bodySrc = stripTsComments(routeSrc)
  .split('\n')
  .filter((l) => !l.trim().startsWith('import ') && !l.trim().startsWith('} from'))
  .join('\n')

// ============================================================================
// INV — invocation + structural pins
// ============================================================================

expectTrue('INV-0 route file exists', fs.existsSync(ROUTE_PATH))
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
  'INV-4 imports the stoa-r20a helpers',
  routeSrc.includes('composeStoaDistressSubject') && routeSrc.includes('buildStoaMildSupportResources'),
)
expectTrue(
  'INV-5 imports + calls isStoaEnabled (the surface flag)',
  routeSrc.includes('stoa-store') && /isStoaEnabled\s*\(\s*\)/.test(bodySrc),
)
expectTrue(
  'INV-6 the AC5 pattern is awaited in the body',
  /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(bodySrc),
)
{
  // Exactly ONE gate call site — POST and PATCH share runStoaDistressGate, so
  // the two free-text methods can never drift apart.
  const gateCallSites = bodySrc.match(/enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/g) ?? []
  expectTrue('INV-7 exactly one gate call site (shared helper)', gateCallSites.length === 1,
    `found ${gateCallSites.length}`)
  // Both free-text methods route through the shared helper.
  const helperCalls = bodySrc.match(/await\s+runStoaDistressGate\s*\(/g) ?? []
  expectTrue('INV-8 POST and PATCH both run the gate helper', helperCalls.length === 2,
    `found ${helperCalls.length}`)
}
{
  // The gate PRECEDES every store write (PR3 — before any store write).
  const gateIdx = bodySrc.indexOf('enforceDistressCheck(detectDistressTwoStage(')
  const declareIdx = bodySrc.indexOf('declareStoaEntry(identity')
  const updateIdx = bodySrc.indexOf('updateStoaEntry(identity')
  expectTrue('INV-9 the gate helper is defined before the store writes and awaited ahead of each',
    gateIdx > -1 && declareIdx > gateIdx && updateIdx > gateIdx,
    `gate=${gateIdx} declare=${declareIdx} update=${updateIdx}`)
  // Within each handler: the AWAITED gate call (not a bare identifier — a
  // string literal naming the helper cannot satisfy this; PR19 fold) precedes
  // the write call.
  const AWAITED_GATE = /await\s+runStoaDistressGate\s*\(/
  function awaitedGateIndex(block: string): number {
    const m = AWAITED_GATE.exec(block)
    return m ? m.index : -1
  }
  const postBlock = bodySrc.slice(bodySrc.indexOf('export async function POST'), bodySrc.indexOf('export async function PATCH'))
  expectTrue('INV-10 POST: awaited gate before declareStoaEntry',
    awaitedGateIndex(postBlock) > -1 &&
    awaitedGateIndex(postBlock) < postBlock.indexOf('declareStoaEntry('))
  const patchBlock = bodySrc.slice(bodySrc.indexOf('export async function PATCH'), bodySrc.indexOf('export async function DELETE'))
  expectTrue('INV-11 PATCH: awaited gate before updateStoaEntry',
    awaitedGateIndex(patchBlock) > -1 &&
    awaitedGateIndex(patchBlock) < patchBlock.indexOf('updateStoaEntry('))
  // PR19 folds: both free-text handlers gate the MERGED entry (cross-request
  // assembly closed), and the shared mild-escalation pass is wired.
  expectTrue('INV-15 POST and PATCH both merge before gating (mergedDeclarationForGate)',
    /await\s+mergedDeclarationForGate\s*\(/.test(postBlock) &&
      /await\s+mergedDeclarationForGate\s*\(/.test(patchBlock))
  expectTrue('INV-16 the mild-escalation pass is imported and awaited (composed multi-field subject)',
    routeSrc.includes('escalateMildDistress') && routeSrc.includes('score-conversation-r20a') &&
      /await\s+escalateMildDistress\s*\(/.test(bodySrc))
}
expectTrue(
  'INV-12 the support_resources fold is present (mild rides, never blocks)',
  bodySrc.includes('support_resources') && bodySrc.includes('supportResources'),
)
expectTrue(
  'INV-13 the human audience renders (never the developer form)',
  /audience:\s*'human_user'/.test(bodySrc) && !/agent_developer/.test(bodySrc),
)
expectTrue(
  'INV-14 all FOUR declared text surfaces feed the gate (three prose fields + tags — PR19 fold)',
  /whatIBring:\s*'whatIBring' in input/.test(bodySrc) &&
    /whatISeek:\s*'whatISeek' in input/.test(bodySrc) &&
    /contactChannel:\s*'contactChannel' in input/.test(bodySrc) &&
    /tags:\s*'tags' in input/.test(bodySrc),
)

// ============================================================================
// FT — flag semantics (default OFF; only the literal 'true' enables)
// ============================================================================

{
  const saved = process.env.SUBSTRATE_STOA_ENABLED
  delete process.env.SUBSTRATE_STOA_ENABLED
  expectTrue('FT-1 unset → disabled', isStoaEnabled() === false)
  process.env.SUBSTRATE_STOA_ENABLED = 'true'
  expectTrue("FT-2 'true' → enabled", isStoaEnabled() === true)
  process.env.SUBSTRATE_STOA_ENABLED = 'false'
  expectTrue("FT-3 'false' → disabled", isStoaEnabled() === false)
  process.env.SUBSTRATE_STOA_ENABLED = '1'
  expectTrue("FT-4 '1' → disabled (case-strict literal)", isStoaEnabled() === false)
  if (saved === undefined) delete process.env.SUBSTRATE_STOA_ENABLED
  else process.env.SUBSTRATE_STOA_ENABLED = saved
}

// ============================================================================
// CS — subject composition
// ============================================================================

expectTrue('CS-1 single field composes verbatim',
  composeStoaDistressSubject({ whatIBring: 'I bring calm' }) === 'I bring calm')
expectTrue('CS-2 fields join in form order with the separator',
  composeStoaDistressSubject({ whatIBring: 'A', whatISeek: 'B', contactChannel: 'C' }) ===
    `A${STOA_DISTRESS_SEPARATOR}B${STOA_DISTRESS_SEPARATOR}C`)
expectTrue('CS-3 non-string fields are skipped',
  composeStoaDistressSubject({ whatIBring: 42 as unknown, whatISeek: 'B' }) === 'B')
expectTrue('CS-4 empty/whitespace fields are skipped',
  composeStoaDistressSubject({ whatIBring: '   ', whatISeek: 'B', contactChannel: null }) === 'B')
expectTrue('CS-5 an all-empty declaration composes to the empty string',
  composeStoaDistressSubject({}) === '')
{
  const long = 'x'.repeat(STOA_DISTRESS_FIELD_CAP + 500)
  const composed = composeStoaDistressSubject({ whatIBring: long })
  expectTrue('CS-6 per-field cap applied', composed.length === STOA_DISTRESS_FIELD_CAP)
}
{
  // The field-seam guarantee (F4 lesson): "…want to" + "die-hard fan…" must
  // not join into an acute; the separator's non-whitespace token blocks the
  // \s+ bridge. Within-field detection is untouched.
  const seamSubject = composeStoaDistressSubject({
    whatIBring: 'I know what practitioners want to',
    whatISeek: 'die-hard movie discussion partners',
  })
  const seam = detectDistress(seamSubject)
  expectTrue('CS-7 no cross-field false positive on the seam', seam.redirect_message === null,
    `severity=${seam.severity}`)
  const within = detectDistress(composeStoaDistressSubject({ whatISeek: 'I want to die' }))
  expectTrue('CS-8 within-field detection untouched', within.redirect_message !== null)
  // CS-9 negative control (PR19 fold — non-vacuity of CS-7): the SAME fields
  // joined with a bare '\n\n' DO bridge into a hit today, proving the
  // separator is load-bearing. If DISTRESS_PATTERNS ever drift so this stops
  // firing, CS-7 goes vacuous and this control catches it.
  const bridged = detectDistress('I know what practitioners want to\n\ndie-hard movie discussion partners')
  expectTrue('CS-9 the bare-\\n\\n control DOES fire (separator is load-bearing)',
    bridged.redirect_message !== null)
}

// CS-10..CS-12 — tags in the subject (PR19 fold, the MEDIUM: tags are
// human free text served publicly; a tags-only submission must be gated).
expectTrue('CS-10 tags compose as a fourth part, comma-joined',
  composeStoaDistressSubject({ whatIBring: 'A', tags: ['x-tag', 'y-tag'] }) ===
    `A${STOA_DISTRESS_SEPARATOR}x-tag, y-tag`)
expectTrue('CS-11 a tags-only submission composes non-empty (the classifier runs)',
  composeStoaDistressSubject({ tags: ['I want to end my life'] }) === 'I want to end my life')
{
  const tagHit = detectDistress(composeStoaDistressSubject({ tags: ['I want to end my life'] }))
  expectTrue('CS-12 an acute phrase inside one tag is caught', tagHit.redirect_message !== null)
  const noBridge = detectDistress(composeStoaDistressSubject({ tags: ['want to', 'die-hard cinema'] }))
  expectTrue('CS-13 the comma join prevents cross-tag bridging', noBridge.redirect_message === null)
}

// ============================================================================
// MS — mild support fold
// ============================================================================

{
  const fold = buildStoaMildSupportResources()
  expectTrue('MS-1 severity mild', fold.severity === 'mild')
  const resources = getCrisisResources()
  const allLines = resources.resources.every(
    (r: { name: string; contact: string }) => fold.message.includes(r.name) && fold.message.includes(r.contact),
  )
  expectTrue('MS-2 message carries every shared resource line', allLines)
  expectTrue('MS-3 carries the primary header + closing',
    fold.message.includes(resources.primary) && fold.message.includes(resources.closing))
  expectTrue('MS-4 declaration register — saves, never blocks, never "evaluation"',
    fold.message.includes('saved') && !/evaluation/i.test(fold.message) && !/paused/i.test(fold.message))
}

// ============================================================================
// RH — human-audience rendering
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
// restructure (audit §2.1 row 12; §3 constraint 6; the 2026-09-06 ruling +
// the 2026-09-05 Part 5 extension). The gate lives in the shared helper
// runStoaDistressGate, so the pins anchor on the CALL-SITE order inside each
// handler's brace-matched block: merge(raw) → gate → parseDeclaration → the
// store write, each exactly once per handler; the raw composer's caps; the
// non-length class fence (NEG-2) and the length fence (NEG-1) over the
// handler-open → gate span; the merge invariant (the anti-assembly fold);
// the empty-subject skip's exact presence form.
//
// MUTATION RECORD (2026-09-06, real file, hash-verified restore): see the
// Session 3D close.
// ============================================================================
{
  const code = loadCodeOnly(ROUTE_PATH)
  const handlerBlock = (name: string) =>
    structuralBlock(code, new RegExp(`export\\s+async\\s+function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`))
  const MERGE_RE = /mergedDeclarationForGate\s*\(\s*identity\s*,\s*rawDeclarationForGate\s*\(\s*parsedBody\.body\s*\)\s*\)/
  const GATE_RE = /runStoaDistressGate\s*\(\s*merged\s*\)/
  const PARSE_RE = /parseDeclaration\s*\(\s*parsedBody\.body\s*\)/
  // MUTATION FOLD (2026-09-06, in-build): anchoring the parse on the GATE
  // CALL was not enough — a mutation placing the parse BETWEEN the gate call
  // and its redirect return stayed green, and that is the harm itself (a
  // distressed body with a bad `visibility` would 400 before the crisis form
  // was returned). The anchor is the REDIRECT RETURN, the same lesson the
  // rest of this arc learned as "anchor on the block's structural END".
  const REDIRECT_RE = /if\s*\(\s*gateOutcome\.redirect\s*\)\s*return\s+gateOutcome\.redirect/
  const RAW_DEF_RE = /function\s+rawDeclarationForGate\s*\(\s*body\s*:\s*Record<string,\s*unknown>\s*\)\s*:\s*StoaGateFields\s*\{/
  const RAW_TEXT_CAP_RE = /String\(\s*body\[wireKey\]\s*\?\?\s*['"]{2}\s*\)\.slice\(\s*0\s*,\s*FIELD_MAX\s*\)/
  // PR19 fold (2026-09-06): the tag cap must TRIM BEFORE SLICING — the guard
  // measures `t.trim().length`, so a raw-length slice is a different metric
  // and a whitespace-padded tag screened as one character while saving in
  // full. The regex requires the .trim() and the metric-parity pin below
  // asserts the two measurements agree.
  const RAW_TAG_CAP_RE = /body\.tags\.slice\(\s*0\s*,\s*TAGS_MAX_COUNT\s*\)\.map\(\s*\(\s*t\s*\)\s*=>\s*String\(\s*t\s*\?\?\s*['"]{2}\s*\)\.trim\(\)\.slice\(\s*0\s*,\s*TAG_MAX\s*\)\s*\)/
  const RAW_TAG_UNTRIMMED_RE = /String\(\s*t\s*\?\?\s*['"]{2}\s*\)\.slice\(\s*0\s*,\s*TAG_MAX\s*\)/
  const TAG_GUARD_METRIC_RE = /t\.trim\(\)\.length\s*>\s*TAG_MAX/
  const MERGE_SIG_RE = /async\s+function\s+mergedDeclarationForGate\s*\(\s*identity\s*:\s*StoaIdentity\s*,\s*input\s*:\s*StoaGateFields\s*,?\s*\)/
  const SKIP_RE = /if\s*\(\s*subject\.length\s*===\s*0\s*\)\s*return/
  const SKIP_LT_RE = /subject\.length\s*[<>]=?/
  const NEG2_LITERALS = ['Visibility must be', 'Tags must be a list', 'must be text', 'At most']
  // MUTATION FOLD (2026-09-06, in-build): `/['"]visibility['"]\s+in\s+body/`
  // was VACUOUS — codeCount matches over the STRING-BLANKED view, where
  // `'visibility'` is eleven spaces between quotes, so the token could never
  // fire; a decoy enum re-add reading `'visibility' in parsedBody.body` with
  // a different error message passed the fence green. Identifier tokens
  // (FIELD_MAX, parseDeclaration) survive blanking and did fire. The fix:
  // keep the identifier tokens on the blanked view, and match the field
  // NAMES on the raw (comment-stripped, unblanked) span, where a quoted key
  // or a `.visibility` access both read literally. Nothing legitimate in the
  // pre-gate span names these fields — the raw composer is a helper defined
  // outside the handler.
  const NEG2_TOKENS: RegExp[] = [/parseDeclaration\s*\(/, /\bFIELD_MAX\b/, /\bTAG_MAX\b/, /\bTAGS_MAX_COUNT\b/]
  const NEG2_RAW_TOKENS: RegExp[] = [/\bvisibility\b/, /\btags\b/, /\bwhat_i_bring\b/, /\bwhat_i_seek\b/, /\bcontact_channel\b/]

  for (const [name, WRITE_RE] of [['POST', /declareStoaEntry\s*\(\s*identity\s*,\s*parsed\.input\s*\)/], ['PATCH', /updateStoaEntry\s*\(\s*identity\s*,\s*parsed\.input\s*\)/]] as const) {
    const h = handlerBlock(name)
    const inBlock = (re: RegExp) => { const i = codeIndexAfter(code, re, h.openIdx); return i > -1 && i < h.endIdx ? i : -1 }
    const mergeIdx = inBlock(MERGE_RE), gateIdx = inBlock(GATE_RE), parseIdx = inBlock(PARSE_RE), writeIdx = inBlock(WRITE_RE)
    const redirectIdx = inBlock(REDIRECT_RE)
    const span = h.openIdx > -1 && h.endIdx > h.openIdx ? code.slice(h.openIdx, h.endIdx) : ''
    const preGate = gateIdx > -1 ? code.slice(h.openIdx, gateIdx) : ''
    expectTrue(`ORD-1(${name}) the handler block was found exactly once and is non-degenerate; merge, gate, redirect-return, parse and write anchors each found inside it`,
      h.matches === 1 && h.openIdx > -1 && h.endIdx > h.openIdx && mergeIdx > -1 && gateIdx > -1 && redirectIdx > -1 && parseIdx > -1 && writeIdx > -1,
      `block=${h.openIdx}..${h.endIdx} (${h.matches}) merge=${mergeIdx} gate=${gateIdx} redirect=${redirectIdx} parse=${parseIdx} write=${writeIdx}`)
    expectTrue(`ORD-2(${name}) call-site order: merge(raw body) < gate < REDIRECT RETURN < parseDeclaration < store write — the parse's 400s run after the crisis form has already returned, not merely after the gate call (mutation fold: anchoring on the gate call alone let a parse slip between the call and the return)`,
      mergeIdx > -1 && gateIdx > mergeIdx && redirectIdx > gateIdx && parseIdx > redirectIdx && writeIdx > parseIdx,
      `merge=${mergeIdx} gate=${gateIdx} redirect=${redirectIdx} parse=${parseIdx} write=${writeIdx}`)
    expectTrue(`ORD-3(${name}) non-vacuity: merge(raw), gate, redirect return, parse and write each appear exactly once in the handler`,
      codeCount(span, MERGE_RE) === 1 && codeCount(span, GATE_RE) === 1 && codeCount(span, REDIRECT_RE) === 1 && codeCount(span, PARSE_RE) === 1 && codeCount(span, WRITE_RE) === 1,
      `counts=${codeCount(span, MERGE_RE)}/${codeCount(span, GATE_RE)}/${codeCount(span, REDIRECT_RE)}/${codeCount(span, PARSE_RE)}/${codeCount(span, WRITE_RE)}`)
    expectTrue(`NEG-1(${name}) no length guard of ANY form exists between the handler open and the gate call (the class fence)`,
      gateIdx > -1 && codeCount(preGate, VALIDATE_TEXT_LENGTH_CALL_RE) === 0 && codeCount(preGate, BARE_LENGTH_GUARD_RE) === 0,
      `vtl=${codeCount(preGate, VALIDATE_TEXT_LENGTH_CALL_RE)} bare=${codeCount(preGate, BARE_LENGTH_GUARD_RE)}`)
    const litHit = NEG2_LITERALS.filter((l) => preGate.includes(l))
    const tokHits = NEG2_TOKENS.reduce((n, re) => n + codeCount(preGate, re), 0)
    const rawTokHits = NEG2_RAW_TOKENS.filter((re) => re.test(preGate))
    expectTrue(`NEG-2(${name}) none of the parse's 400s occurs before the gate in ANY form — error literals absent, identifier tokens (parseDeclaration(, FIELD_MAX/TAG_MAX/TAGS_MAX_COUNT) absent from the blanked span, and no declaration FIELD NAME (visibility, tags, the three prose keys) is named at all in the raw pre-gate span (mutation fold: the quoted-token form was vacuous under string blanking)`,
      gateIdx > -1 && litHit.length === 0 && tokHits === 0 && rawTokHits.length === 0,
      `literals=${JSON.stringify(litHit)} tokens=${tokHits} rawTokens=${rawTokHits.map((r) => r.source).join(',')}`)
  }
  expectTrue('RAW-1 rawDeclarationForGate is defined exactly once, typed to StoaGateFields, caps each text part with String(v ?? \'\').slice(0, FIELD_MAX) and each tag with String(t ?? \'\').slice(0, TAG_MAX) over at most TAGS_MAX_COUNT tags',
    codeCount(code, RAW_DEF_RE) === 1 && codeCount(code, RAW_TEXT_CAP_RE) === 1 && codeCount(code, RAW_TAG_CAP_RE) === 1,
    `def=${codeCount(code, RAW_DEF_RE)} text=${codeCount(code, RAW_TEXT_CAP_RE)} tag=${codeCount(code, RAW_TAG_CAP_RE)}`)
  expectTrue('RAW-2 the raw composer\'s FIELD_MAX equals the composer\'s STOA_DISTRESS_FIELD_CAP (the cap equals the guard\'s bound) — read from both sources',
    (() => { const m = /const\s+FIELD_MAX\s*=\s*(\d+)/.exec(code); return !!m && Number(m[1]) === STOA_DISTRESS_FIELD_CAP })(),
    `cap=${STOA_DISTRESS_FIELD_CAP}`)
  expectTrue('RAW-1b tag METRIC PARITY: the screening slice and the validity guard measure the SAME thing — the composer trims before slicing (matching the guard\'s t.trim().length > TAG_MAX), and no untrimmed raw-length tag slice survives. A raw-length slice let a whitespace-padded tag save in full but screen as one character (PR19 HIGH, 2026-09-06).',
    codeCount(code, RAW_TAG_UNTRIMMED_RE) === 0 && codeCount(code, TAG_GUARD_METRIC_RE) === 1 && codeCount(code, RAW_TAG_CAP_RE) === 1,
    `untrimmed=${codeCount(code, RAW_TAG_UNTRIMMED_RE)} guardMetric=${codeCount(code, TAG_GUARD_METRIC_RE)} cap=${codeCount(code, RAW_TAG_CAP_RE)}`)
  expectTrue('RAW-1c BEHAVIOURAL: a tag the guard ACCEPTS is screened in full — a 39-space-padded "kill myself" (trimmed length 11, so valid and stored verbatim) reaches the classifier as its real text, not as a truncated fragment',
    (() => {
      const TAG_MAX_V = Number((/const\s+TAG_MAX\s*=\s*(\d+)/.exec(code) ?? [])[1])
      const TAGS_MAX_V = Number((/const\s+TAGS_MAX_COUNT\s*=\s*(\d+)/.exec(code) ?? [])[1])
      if (!TAG_MAX_V || !TAGS_MAX_V) return false
      const evil = ' '.repeat(TAG_MAX_V - 1) + 'kill myself'
      if (evil.trim().length > TAG_MAX_V) return false // must be guard-VALID for the case to bite
      const screened = [evil].slice(0, TAGS_MAX_V).map((t) => String(t ?? '').trim().slice(0, TAG_MAX_V))
      return composeStoaDistressSubject({ tags: screened }) === 'kill myself'
    })(),
    'the padded tag must screen as its real text')
  expectTrue('RAW-3 mergedDeclarationForGate takes the gate-field shape (StoaGateFields), so the raw composer — not the parsed input — is what the gate merges',
    codeCount(code, MERGE_SIG_RE) === 1, `sig=${codeCount(code, MERGE_SIG_RE)}`)
  expectTrue('SKIP-1 the empty-subject skip in runStoaDistressGate keeps its presence form (subject.length === 0) exactly once and is never rewritten into a </> comparison',
    codeCount(code, SKIP_RE) === 1 && codeCount(code, SKIP_LT_RE) === 0,
    `skip=${codeCount(code, SKIP_RE)} lt=${codeCount(code, SKIP_LT_RE)}`)
}

console.log(`\nstoa r20a-invocation: ${passCount} passed, ${failCount} failed`)
if (failCount > 0) process.exit(1)
