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

console.log(`\nstoa r20a-invocation: ${passCount} passed, ${failCount} failed`)
if (failCount > 0) process.exit(1)
