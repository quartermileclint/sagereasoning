/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the
 * practice-status surface (practice reminders, human plan Phase 1 — the
 * SEQUENCE trigger).
 *
 * PURPOSE (mentor verdict D6, and the family precedent): a human-surface PR must
 * have a clean file boundary and must NOT import any part of the measured agent
 * instrument. Verified BEFORE shipping, never after (the S10-ENV-1 / S10-ABUSE-1
 * lesson).
 *
 * THIS SUITE ADDS TWO GUARDS THE SIBLING SUITES DO NOT HAVE, both specific to
 * what Phase 1 builds:
 *
 *   1. A ZERO-IMPORT assertion on `src/lib/practice-sequence.ts`. The sibling
 *      suites follow ONE hop, and `practice-sequence.ts` is imported directly by
 *      `/welcome` — which is itself a guarded target of the LOGOS suite. So
 *      anything `practice-sequence.ts` imported would sit at hop TWO from
 *      `/welcome`, outside that guard's reach. Rather than rely on a
 *      forbidden-list that cannot see that far, this asserts the module imports
 *      NOTHING AT ALL. A zero-import module cannot leak anything, at any depth.
 *
 *      Worth stating precisely, because the Phase 1 session prompt overstated
 *      it: a `/welcome → practice-sequence → brand-display → stoic-brain` chain
 *      does NOT fail the logos guard — mutation-verified, 249 passed / 0 failed.
 *      `stoic-brain` is allowlisted there rather than forbidden, and although
 *      that suite's symbol allowlist DOES also run on one-hop helpers
 *      (LOGOS-BT-6 — an earlier draft of this header wrongly said it did not),
 *      it never fires, because the hop-one specifier is `brand-display`; the
 *      `brand-display → stoic-brain` edge sits at hop two. The constraint that
 *      actually binds is plan §11 — "no reminder code imports substrate/
 *      trust-core/stoic-brain" — so this suite enforces it directly instead of
 *      assuming another suite does.
 *
 *   2. A READ-ONLY assertion on the route. `/api/mentor/practice-status` reads
 *      existing rows and nothing else. A future edit that adds a write would be
 *      a different risk classification (KG1) and must not slip in silently.
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * NOTE ON REACH, stated rather than implied: like its siblings this follows ONE
 * hop of local imports. It does not prove transitive import purity, and does not
 * need to — the guarantee protecting the observation window is the git
 * byte-identity guard (no file in the /api/reason graph is edited), not import
 * purity. See CLAUDE.md, "HONEST IMPORT NOTE".
 *
 * Run (from website/):
 *   npx tsx src/app/api/mentor/practice-status/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/mentor/practice-status/__tests__/ (6 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')

// The human-practitioner files this PR adds or touches on the server side.
const TARGET_FILES = [
  'src/app/api/mentor/practice-status/route.ts',
  'src/lib/practice-sequence.ts',
  // The dashboard module. It is the third file this change ships and it was
  // guarded by NO suite at all until the adversarial review pointed that out —
  // an unguarded shipped file is exactly how a forbidden import arrives later.
  'src/components/PracticeSequenceModule.tsx',
  // Phase 4 — the daily rhythm. Added here for the same reason: both ship, both
  // sit in the practice surface, and an unguarded file is where a forbidden
  // import arrives later. CadenceBanner is also imported by /premeditatio and
  // /oikeiosis, so it now sits in three guarded graphs at once.
  'src/components/DailyRhythmStrip.tsx',
  'src/components/CadenceBanner.tsx',
]

// The module that must import NOTHING (see the header, guard 1).
const ZERO_IMPORT_FILE = 'src/lib/practice-sequence.ts'

// The route file — read-only, no LLM (see the header, guard 2).
const ROUTE_FILE = 'src/app/api/mentor/practice-status/route.ts'

// Forbidden module-path substrings — matched against import/export specifiers.
// '/substrate' covers @/lib/substrate/* and relative forms. 'stoic-brain' and
// 'brand-display' are BOTH forbidden here: brand-display is the exact module
// plan §6 suggested importing a type from, and taking it would put stoic-brain
// at hop two from /welcome. 'milestones' likewise (it imports brand-display).
const FORBIDDEN_SPECIFIER_SUBSTRINGS = [
  '/substrate',
  'translation-sandwich',
  'trust-core',
  'kathekon-engagement',
  'layer1-extractor',
  'layer2-mechanisms',
  'emission-hooks',
  'examination-mode',
  'sage-reflect',
  'stoic-brain',
  'brand-display',
  'proximity-domains',
  'gate1-pre-decision',
  'false-hold-capture',
  'framing-core',
  'sage-reason-engine',
  '@anthropic-ai/sdk',
  'model-config',
]

const FORBIDDEN_SYMBOLS = ['assessKathekon']

interface ImportRef { clause: string; specifier: string }

function extractImports(source: string): ImportRef[] {
  const refs: ImportRef[] = []
  // `import <clause> from '<spec>'` and `export <clause> from '<spec>'`.
  // The separators are `\s*` and the clause is anchored on a brace/star/name,
  // NOT `\s+` — a minified or brace-first import (`import{X}from'./y'`) has no
  // whitespace at all and slipped straight past an earlier `\s+` version of this
  // pattern. A scanner that a formatter can defeat is not a guard.
  const fromRe = /(?:import|export)\s*((?:type\s+)?[{*][\s\S]*?|[A-Za-z_$][\w$]*[\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(source)) !== null) refs.push({ clause: m[1], specifier: m[2] })
  // side-effect `import '<spec>'`
  const bareRe = /import\s*['"]([^'"]+)['"]/g
  while ((m = bareRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  // dynamic `import('<spec>')`
  const dynRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = dynRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  // `require('<spec>')`
  const reqRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = reqRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  return refs
}

/** Strip comments only — string literals survive. Use when the thing being
 *  asserted IS a string literal (e.g. a column name in a query). */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/** Strip comments AND string literals so scanners cannot be fooled by prose.
 *  Use when asserting the ABSENCE of code — a banned call must not be waved
 *  through just because the same characters appear inside a doc comment. */
function stripCommentsAndStrings(source: string): string {
  return stripComments(source)
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
}

/** Run a probe expected to FAIL, with its console noise suppressed, and report
 *  whether it did. Keeps deliberate self-test failures out of the run output,
 *  where they read as real failures to anyone skimming. Synchronous only. */
function producedFailure(probe: () => void): boolean {
  const before = failed
  const realError = console.error
  console.error = () => {}
  try { probe() } finally { console.error = realError }
  const fired = failed > before
  failed = before
  failures.length = Math.min(failures.length, before)
  return fired
}

function checkImports(refs: ImportRef[], contextLabel: string): void {
  for (const { clause, specifier } of refs) {
    for (const bad of FORBIDDEN_SPECIFIER_SUBSTRINGS) {
      assert(
        !specifier.includes(bad),
        `${contextLabel}: import specifier '${specifier}' must not reference forbidden module '${bad}'`
      )
    }
    for (const sym of FORBIDDEN_SYMBOLS) {
      assert(
        !clause.includes(sym),
        `${contextLabel}: import of forbidden symbol '${sym}' (from '${specifier}')`
      )
    }
  }
}

// Resolve a LOCAL import specifier to a source file, or null for external packages.
function resolveLocal(specifier: string, fromDir: string): string | null {
  let base: string
  if (specifier.startsWith('@/')) base = path.join(websiteRoot, 'src', specifier.slice(2))
  else if (specifier.startsWith('.')) base = path.resolve(fromDir, specifier)
  else return null // node_module / external package
  for (const cand of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
    if (fs.existsSync(cand)) return cand
  }
  return null
}

// Sanity: correct root. An unrunnable guard is a failed guard, never a skip.
assert(fs.existsSync(path.join(websiteRoot, 'package.json')), 'websiteRoot resolves to website/ (found package.json)')

/** Counts local imports the one-hop traversal actually followed (see A3-FLOOR). */
let localHopsResolved = 0

// ─── A. Import-boundary guards over every target ───

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)

  // A1 — direct imports must be clean.
  checkImports(refs, rel)

  // A2 — no COMPUTED dynamic import (a non-literal specifier is invisible to a
  // regex scanner, so it is flagged outright — the LOGOS-BT-7 lesson).
  assert(
    !/\bimport\s*\(\s*[^'")\s]/.test(stripCommentsAndStrings(source)),
    `${rel}: no dynamic import() with a computed (non-literal) specifier — regex scanning cannot follow it`
  )

  // A3 — one-hop follow of LOCAL imports (catches a helper that re-exports a
  // forbidden module). Not recursive; see the header note on reach.
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    localHopsResolved++
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRel = path.relative(websiteRoot, local)
    checkImports(extractImports(helperSource), `${rel} → (one hop) ${helperRel}`)
  }
}

// A3-FLOOR — the one-hop traversal must actually traverse something. Without
// this, `resolveLocal` returning null for every specifier would silently drop
// ~45% of this suite's assertions (152 of 341, measured) while still reporting
// "0 failed" — a guard that has quietly stopped guarding is worse than none,
// because it still reads as green. Found by the adversarial review.
assert(
  localHopsResolved >= 2,
  `A3-FLOOR: the one-hop traversal resolved ${localHopsResolved} local import(s); it must resolve at least 2, or the hop checks are silently vacuous`
)

// ─── B. The ZERO-IMPORT guard on practice-sequence.ts ───

{
  const full = path.join(websiteRoot, ZERO_IMPORT_FILE)
  assert(fs.existsSync(full), `${ZERO_IMPORT_FILE} (file exists)`)
  if (fs.existsSync(full)) {
    const source = fs.readFileSync(full, 'utf-8')
    const refs = extractImports(source)

    assert(
      refs.length === 0,
      `${ZERO_IMPORT_FILE}: must import NOTHING — not even \`import type\`. It is imported directly by /welcome, which is a guarded target of the logos suite; anything imported here sits at hop two and is outside that guard's reach. Found: ${refs.map((r) => r.specifier).join(', ') || '(none)'}`
    )

    // Belt and braces on the raw text, independent of the regex extractor above:
    // a stray import keyword at the start of a line would be caught here even if
    // extractImports somehow missed its shape.
    const stripped = stripCommentsAndStrings(source)
    assert(
      !/^\s*import\b/m.test(stripped),
      `${ZERO_IMPORT_FILE}: no line may begin with \`import\` (raw-text check, independent of the import extractor)`
    )
    assert(
      !/\brequire\s*\(/.test(stripped),
      `${ZERO_IMPORT_FILE}: no require() calls`
    )

    // It is data + pure functions: no I/O, no clock, no env, no randomness. A
    // clock here would make the sequence non-deterministic and untestable.
    for (const banned of ['process.env', 'Date.now(', 'Math.random(', 'fetch(', 'createClient(']) {
      assert(
        !stripped.includes(banned),
        `${ZERO_IMPORT_FILE}: must not use '${banned}' — this module is data plus pure functions`
      )
    }
  }
}

// ─── C. The route is READ-ONLY and makes no LLM call ───

{
  const full = path.join(websiteRoot, ROUTE_FILE)
  assert(fs.existsSync(full), `${ROUTE_FILE} (file exists)`)
  if (fs.existsSync(full)) {
    const stripped = stripCommentsAndStrings(fs.readFileSync(full, 'utf-8'))

    for (const write of ['.insert(', '.update(', '.upsert(', '.delete(', '.rpc(']) {
      assert(
        !stripped.includes(write),
        `${ROUTE_FILE}: must be READ-ONLY — found '${write}'. A write here changes the risk classification (KG1) and must be a deliberate decision, not a drift.`
      )
    }

    for (const llm of ['messages.create', 'getClient(', 'MODEL_FAST', 'MODEL_DEEP']) {
      assert(
        !stripped.includes(llm),
        `${ROUTE_FILE}: must make no LLM call — found '${llm}'`
      )
    }

    // Authenticated and rate-limited, like every sibling tool route.
    assert(stripped.includes('requireAuth'), `${ROUTE_FILE}: authenticates via requireAuth`)
    assert(stripped.includes('checkRateLimit'), `${ROUTE_FILE}: rate-limits via checkRateLimit`)

    // Every read is user-scoped. An unscoped read would cross tenants — the most
    // serious thing that could go wrong here, so it is pinned STRUCTURALLY:
    // every `.from(` must be matched by a `.eq('user_id'`. A count comparison
    // catches a second query added later without scoping, which a mere
    // `includes()` would not. Comments are stripped but string literals are NOT
    // (the column name IS a string literal) — hence stripComments, not
    // stripCommentsAndStrings. An earlier draft of this check used the latter
    // and could never pass, which is why it is written out here.
    const codeOnly = stripComments(fs.readFileSync(full, 'utf-8'))
    // `Array.from(` is not a table read. Subtracted explicitly rather than by
    // loosening the pattern — a looser regex would also stop catching the thing
    // this pin exists for.
    const fromCount =
      (codeOnly.match(/\.from\(/g) ?? []).length - (codeOnly.match(/Array\.from\(/g) ?? []).length
    const scopedCount = (codeOnly.match(/\.eq\('user_id',/g) ?? []).length
    assert(fromCount > 0, `${ROUTE_FILE}: performs at least one table read`)
    assert(
      scopedCount === fromCount,
      `${ROUTE_FILE}: EVERY table read is scoped to the authenticated user's id (${fromCount} .from( call(s), ${scopedCount} .eq('user_id' scope(s)) — an unscoped read would cross tenants`
    )

    // Next.js rejects non-handler exports from a route file at `next build`, and
    // neither tsc nor tsx catches it (the standing nextjs-route-export-validation
    // lesson). Only HTTP verbs and the allowed route config may be exported.
    const ALLOWED_ROUTE_EXPORTS = new Set([
      'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
      'dynamic', 'revalidate', 'runtime', 'preferredRegion', 'maxDuration', 'fetchCache', 'dynamicParams',
    ])
    const exportRe = /export\s+(?:async\s+)?(?:function|const|let|var)\s+([A-Za-z0-9_$]+)/g
    let em: RegExpExecArray | null
    let sawGet = false
    while ((em = exportRe.exec(stripped)) !== null) {
      const name = em[1]
      if (name === 'GET') sawGet = true
      assert(
        ALLOWED_ROUTE_EXPORTS.has(name),
        `${ROUTE_FILE}: exports '${name}', which Next.js rejects at \`next build\` (route files may export only handlers + route config). Move it to a sibling module.`
      )
    }
    assert(sawGet, `${ROUTE_FILE}: exports a GET handler`)
  }
}

// ─── C2. The route → client response contract ───
//
// There is NO compile-time edge between the two sides. The route builds its body
// as an untyped object literal, and the client declares every field optional and
// CASTS the payload rather than validating it — so renaming a key on either side
// is silent. The adversarial review proved it: renaming `rhythm` to
// `rhythm_sources` in the route made the entire Phase 4 strip vanish for every
// practitioner while `tsc --noEmit` exited 0 and all ten suites stayed green
// (358/0, 43/0, and all eight boundary suites). The failure is invisible because
// an absent key degrades to rendering nothing, which is byte-identical to the
// deliberate loading state.
//
// The gap is inherited rather than introduced — `next_in_sequence` and
// `next_basis` have been equally unpinned since Phase 1 — so all four keys are
// pinned here, at both ends.
{
  const routeSrc = fs.readFileSync(path.join(websiteRoot, ROUTE_FILE), 'utf-8')
  const clientRel = 'src/components/PracticeSequenceModule.tsx'
  const clientSrc = fs.readFileSync(path.join(websiteRoot, clientRel), 'utf-8')

  const RESPONSE_KEYS = ['practices', 'next_in_sequence', 'next_basis', 'rhythm']

  // The route's JSON body, isolated so a mention elsewhere in the file cannot
  // satisfy the assertion.
  const bodyMatch = routeSrc.match(/return NextResponse\.json\(\{([\s\S]*?)\}\)/)
  assert(!!bodyMatch, `C2-BODY: ${ROUTE_FILE} returns a NextResponse.json({...}) body this test can inspect`)
  const body = bodyMatch ? bodyMatch[1] : ''

  // Parse the body's KEY NAMES, rather than grepping for each name anywhere in
  // it. A first attempt did the latter and was defeated by the very mutation it
  // was written to catch: renaming the key to `rhythm_sources: rhythm` leaves the
  // word `rhythm` in the body as the VALUE, so a substring test still passed.
  // Splitting into entries and taking the part before ':' reads the key itself.
  const bodyKeys = body
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, '').trim())
    .join(' ')
    .split(',')
    .map((entry) => entry.split(':')[0].trim())
    .filter((k) => /^[A-Za-z_$][\w$]*$/.test(k))

  const gotKeys = JSON.stringify([...bodyKeys].sort())
  const wantKeys = JSON.stringify([...RESPONSE_KEYS].sort())
  assert(
    gotKeys === wantKeys,
    `C2-ROUTE: the response body's keys are exactly ${RESPONSE_KEYS.join(', ')} — renaming or dropping one deletes the feature silently, with tsc and every suite still green (got ${gotKeys})`
  )

  for (const key of RESPONSE_KEYS) {
    assert(
      new RegExp(`\\b${key}\\b`).test(clientSrc),
      `C2-CLIENT[${key}]: ${clientRel} reads '${key}' — both ends are pinned, because pinning one end alone still permits a silent divergence`
    )
  }
}

// ─── D. Self-test: the machinery is live, not vacuous ───

{
  // The forbidden-import scanner must actually fire on a real violation.
  assert(
    producedFailure(() => checkImports(extractImports("import { PROXIMITY_COLORS } from '@/lib/brand-display'\n"), '(probe)')),
    'self-test: checkImports() flags a forbidden brand-display import (the scanner is live)'
  )
  assert(
    producedFailure(() => checkImports(extractImports("import { assessKathekon } from './x'\n"), '(probe)')),
    'self-test: checkImports() flags a forbidden SYMBOL even from an innocuous specifier'
  )
  assert(
    !producedFailure(() => checkImports(extractImports("import { NextResponse } from 'next/server'\n"), '(probe)')),
    'self-test: checkImports() does NOT flag a legitimate import (no false positives)'
  )

  // And the extractor must see each import shape it claims to cover.
  assert(extractImports("import x from 'a'").length === 1, 'self-test: extractor sees a default import')
  assert(extractImports("import type { X } from 'a'").length === 1, 'self-test: extractor sees a type-only import')
  assert(extractImports("import 'a'").length === 1, 'self-test: extractor sees a side-effect import')
  assert(extractImports("const m = require('a')").length === 1, 'self-test: extractor sees require()')
  assert(extractImports("await import('a')").length === 1, 'self-test: extractor sees a dynamic import')
  assert(extractImports("export { X } from 'a'").length === 1, 'self-test: extractor sees a re-export')

  // WHITESPACE-FREE forms. A minifier or a brace-first style produces these, and
  // an earlier `\s+`-anchored pattern missed every one of them — a scanner a
  // formatter can defeat is not a guard. Found by the adversarial review.
  assert(extractImports("import{X}from'a'").length === 1, 'self-test: extractor sees a whitespace-free named import')
  assert(extractImports("import*as X from'a'").length === 1, 'self-test: extractor sees a whitespace-free namespace import')
  assert(extractImports("import type{X}from'a'").length === 1, 'self-test: extractor sees a whitespace-free type import')
  assert(extractImports("import'a'").length === 1, 'self-test: extractor sees a whitespace-free side-effect import')
  assert(extractImports("export{X}from'a'").length === 1, 'self-test: extractor sees a whitespace-free re-export')
  assert(extractImports("require('a')").length === 1, 'self-test: extractor sees a bare require()')
  assert(
    producedFailure(() => checkImports(extractImports("import{PROXIMITY_COLORS}from'@/lib/brand-display'"), '(probe)')),
    'self-test: a WHITESPACE-FREE forbidden import is still caught end-to-end'
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
