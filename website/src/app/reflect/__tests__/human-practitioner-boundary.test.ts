/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the
 * Evening Review human-practitioner surface (`/reflect`, 2026-08-02).
 *
 * PURPOSE. Same discipline as every sibling practice page (/morning,
 * /view-from-above, /sage-compass, /oikeiosis): the human surface must not
 * import any part of the measured agent instrument. The false-hold observation
 * window measures /api/reason and /api/guardrail; keeping this page free of
 * engine/substrate/harness imports is what makes it a human-only change.
 *
 * SCOPE — deliberately the PAGE and LAYOUT only, and this differs from the
 * sibling tests, which also cover their `/api/mentor/<tool>` route. There is no
 * new route here: `/reflect` posts to the PRE-EXISTING `POST /api/reflect`,
 * which legitimately imports `stoic-brain` (for the proximity level type),
 * `reasoning-receipt` and the Anthropic SDK. Listing it as a target would assert
 * a discipline it never had and has no reason to adopt — it is not in the
 * /api/reason import graph, and editing it does not trip the byte-identity
 * guard. What matters, and what is pinned below, is that the PAGE never reaches
 * those modules: it holds only `what_happened` / `how_i_responded` and reads the
 * reply.
 *
 * NOTE on `sage-reflect`: forbidden here exactly as it is on /morning. The
 * evening/morning pairing is conceptual — `sage-reflect` is the AGENT-side
 * reflect engine and sits inside the guarded set. `/api/reflect` (this page's
 * route) is a different thing despite the similar name.
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * Run (from website/):
 *   npx tsx src/app/reflect/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/reflect/__tests__/ (4 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..')

const TARGET_FILES = [
  'src/app/reflect/page.tsx',
  'src/app/reflect/layout.tsx',
]

const FORBIDDEN_SPECIFIER_SUBSTRINGS = [
  '/substrate',
  'translation-sandwich',
  'trust-core',
  'kathekon-engagement',
  'layer1-extractor',
  'layer2-mechanisms',
  'emission-hooks',
  'examination-mode',
  'sage-reflect',        // the agent-side reflect engine — inside the guarded set
  'stoic-brain',         // also reached at one hop by brand-display; hence literal images
  'sage-reason-engine',
  'reasoning-receipt',
  'guardrail-sandwich',
  'gate1-pre-decision',
  'false-hold-capture',
  'framing-core',
  '@anthropic-ai/sdk',   // the page must never call a model directly
]

const FORBIDDEN_SYMBOLS = ['assessKathekon']

interface ImportRef { clause: string; specifier: string }

function extractImports(source: string): ImportRef[] {
  const refs: ImportRef[] = []
  const fromRe = /(?:import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(source)) !== null) refs.push({ clause: m[1], specifier: m[2] })
  const bareRe = /import\s+['"]([^'"]+)['"]/g
  while ((m = bareRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  // DYNAMIC import() and require() with a string-literal specifier. The
  // adversarial review caught this gap directly: neither fromRe nor bareRe can
  // match `import(...)` (bareRe requires whitespace before the quote, which a
  // call has none of), so `import('@/lib/stoic-brain')` slipped past silently —
  // verified by mutation, 140/0 unchanged before this fix. Matches the /logos
  // boundary test's own A4/LOGOS-BT-7 precedent below.
  const dynamicRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = dynamicRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  const requireRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = requireRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  return refs
}

// A COMPUTED dynamic import (e.g. `import('@/lib/' + name)`) has no string
// literal for the regexes above to see. Rather than silently pass, flag any
// dynamic import whose specifier is not a bare string literal — the same
// tripwire the /logos test carries, LOGOS-BT-7.
const NON_LITERAL_DYNAMIC_IMPORT = /\bimport\s*\(\s*(?!['"][^'"]*['"]\s*\))/

function checkImports(refs: ImportRef[], contextLabel: string): void {
  for (const { clause, specifier } of refs) {
    for (const bad of FORBIDDEN_SPECIFIER_SUBSTRINGS) {
      assert(
        !specifier.includes(bad),
        `${contextLabel}: import specifier '${specifier}' must not reference forbidden module '${bad}'`
      )
    }
    for (const sym of FORBIDDEN_SYMBOLS) {
      assert(!clause.includes(sym), `${contextLabel}: import of forbidden symbol '${sym}' (from '${specifier}')`)
    }
  }
}

function resolveLocal(specifier: string, fromDir: string): string | null {
  let base: string
  if (specifier.startsWith('@/')) base = path.join(websiteRoot, 'src', specifier.slice(2))
  else if (specifier.startsWith('.')) base = path.resolve(fromDir, specifier)
  else return null
  for (const cand of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
    if (fs.existsSync(cand)) return cand
  }
  return null
}

assert(fs.existsSync(path.join(websiteRoot, 'package.json')), 'websiteRoot resolves to website/ (found package.json)')

// NON-VACUITY FLOOR. A guard that stops traversing still prints "0 failed", so
// count the files and imports actually inspected and assert the traversal ran.
// (The standing lesson from the /logos boundary test.)
let filesInspected = 0
let importsInspected = 0

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue
  filesInspected++

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)
  importsInspected += refs.length
  checkImports(refs, rel)
  assert(
    !NON_LITERAL_DYNAMIC_IMPORT.test(source),
    `${rel}: no dynamic import() with a computed (non-literal) specifier — regex scanning cannot follow it`
  )

  // One hop through LOCAL imports — catches a shared helper that would leak a
  // forbidden module. This is the hop that makes `brand-display` unusable here:
  // it type-imports `stoic-brain`, which is why the page uses literal image
  // paths and a literal proximity→Stage table instead.
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    const helperSource = fs.readFileSync(local, 'utf-8')
    checkImports(extractImports(helperSource), `${rel} → (one hop) ${path.relative(websiteRoot, local)}`)
  }
}

assert(filesInspected === TARGET_FILES.length, `NON-VACUITY: every target file was inspected (${filesInspected}/${TARGET_FILES.length})`)
assert(importsInspected > 0, `NON-VACUITY: imports were actually extracted and checked (${importsInspected} found) — a broken regex would leave this suite silently green`)

// ─── The page must not persist or call a model itself ───
{
  const page = fs.readFileSync(path.join(websiteRoot, 'src/app/reflect/page.tsx'), 'utf-8')
  // It writes ONLY through the authenticated route. A direct table write would
  // bypass /api/reflect's R20a distress check, which is the enforced safety floor
  // for this surface.
  assert(!page.includes(".from('reflections')"), 'the page never writes `reflections` directly — the only write path is POST /api/reflect, which carries the R20a distress gate')
  assert(!page.includes('messages.create'), 'the page never calls a model directly')
  assert(page.includes("'/api/reflect'"), 'the page does post to /api/reflect (so the assertions above are about a real write path, not an absent one)')
}

// ─── The page is inside the R20a-adjacent crisis-exit convention ───
{
  const layout = fs.readFileSync(path.join(websiteRoot, 'src/app/reflect/layout.tsx'), 'utf-8')
  assert(layout.includes('SupportFooter'), 'the layout carries SupportFooter — the always-visible crisis exit every sibling practice page has, and which matters most on a page that asks about a hard day at night')
}

// ─── These files are outside the measured set by construction ───
{
  // The repo-wide git byte-identity guard lives in
  // src/app/logos/__tests__/human-practitioner-boundary.test.ts and asserts that
  // NO measured file is modified. This is the static half of that claim, scoped
  // to this PR's own files: their PATHS cannot match the measured-set regex, so
  // no edit here can ever perturb the observation window.
  const GUARD_RE = /api\/reason|api\/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|translation-sandwich|\/substrate\/|trust-core|kathekon-engagement|false-hold|harness\/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain/i
  for (const rel of TARGET_FILES) {
    assert(!GUARD_RE.test(rel), `${rel} is outside the measured set (its path cannot match the byte-identity guard)`)
  }
  // Non-vacuity: the regex must actually match something, or the loop above is
  // a permanently-green no-op.
  assert(GUARD_RE.test('src/app/api/reason/route.ts'), 'NON-VACUITY: the guard regex genuinely matches a measured path')
  assert(GUARD_RE.test('src/lib/stoic-brain.ts'), 'NON-VACUITY: …and stoic-brain, the one this page most nearly reached')
}

// ─── SELF-TEST: the dynamic-import extractors actually catch what they claim ───
{
  const dynamicImportOfForbidden = extractImports("const x = await import('@/lib/stoic-brain')")
  assert(
    dynamicImportOfForbidden.some((r) => r.specifier === '@/lib/stoic-brain'),
    'SELF-TEST: extractImports catches a dynamic import() of a forbidden module'
  )
  const requireOfForbidden = extractImports("const x = require('@/lib/stoic-brain')")
  assert(
    requireOfForbidden.some((r) => r.specifier === '@/lib/stoic-brain'),
    'SELF-TEST: extractImports catches a require() of a forbidden module'
  )
  assert(
    NON_LITERAL_DYNAMIC_IMPORT.test(`await import('@/lib/' + name)`),
    'SELF-TEST: the non-literal tripwire fires on a computed specifier'
  )
  assert(
    !NON_LITERAL_DYNAMIC_IMPORT.test(`await import('@/lib/literal')`),
    'SELF-TEST: …and does not false-positive on a literal one'
  )
}

// ─── SELF-TEST: assert() can fail ───
{
  const before = failed
  assert(false, '__probe__')
  const fired = failed === before + 1
  failed = before
  failures.pop()
  if (!fired) {
    failed++
    failures.push('SELF-TEST: assert() did not record a known-false claim — this suite is not guarding anything')
  } else {
    passed++
  }
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
}
