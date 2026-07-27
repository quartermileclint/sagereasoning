/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the
 * morning-preparation human-practitioner surface (Remaining Principles #8).
 *
 * PURPOSE (mentor verdict D6): the human-surface PR must have a clean file
 * boundary and must NOT import any part of the measured agent instrument — it must
 * not touch /api/reason or the signed assessment, and (the #8-specific trap) must
 * NOT couple to the reflect engine (sage-reflect). This is battery-verified BEFORE
 * shipping (not after — the S10-ENV-1 / S10-ABUSE-1 lesson). The 7-day false-hold
 * observation window measures /api/reason; leaving this surface free of any
 * engine/substrate/harness/reflect import is what keeps it a human-only change and
 * leaves the measurement byte-identical.
 *
 * It reads each target file's source and asserts none of its import statements
 * reference a forbidden module (the substrate engine, the trust core, the
 * false-hold classifier, the Gate-1 hooks, the reflect engine, or stoic-brain's
 * assessKathekon). It also follows one hop of each file's LOCAL imports (relative
 * or @/-aliased) to catch a shared helper that would leak a forbidden module.
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * Run (from website/):
 *   npx tsx src/app/api/mentor/morning/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/mentor/morning/__tests__/ (6 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')

// The human-practitioner files this PR adds — all guarded (route + page + layout).
const TARGET_FILES = [
  'src/app/api/mentor/morning/route.ts',
  'src/app/morning/page.tsx',
  'src/app/morning/layout.tsx',
]

// Forbidden module-path substrings — matched against import/export specifiers.
// '/substrate' covers @/lib/substrate/*, ../substrate/*, ./substrate/* (which
// already includes trust-core, kathekon-engagement, emission-hooks, etc.); the
// remaining entries also catch a relative sibling import that omits '/substrate'.
const FORBIDDEN_SPECIFIER_SUBSTRINGS = [
  '/substrate',
  'translation-sandwich', // layer1-extractor / layer2-mechanisms / corroboration / signer all live here
  'trust-core',
  'kathekon-engagement',
  'layer1-extractor',
  'layer2-mechanisms',
  'emission-hooks',
  'examination-mode',
  'sage-reflect', // the #8-specific trap: the evening engine; the pairing is conceptual only
  'stoic-brain',
  'gate1-pre-decision',
  'false-hold-capture',
  'framing-core',
]

// Forbidden imported symbols (the plan forbids stoic-brain's assessKathekon specifically).
const FORBIDDEN_SYMBOLS = ['assessKathekon']

interface ImportRef { clause: string; specifier: string }

function extractImports(source: string): ImportRef[] {
  const refs: ImportRef[] = []
  // `import <clause> from '<spec>'` and `export <clause> from '<spec>'`
  const fromRe = /(?:import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(source)) !== null) refs.push({ clause: m[1], specifier: m[2] })
  // side-effect `import '<spec>'`
  const bareRe = /import\s+['"]([^'"]+)['"]/g
  while ((m = bareRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  return refs
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

// Sanity: correct root.
assert(fs.existsSync(path.join(websiteRoot, 'package.json')), `websiteRoot resolves to website/ (found package.json)`)

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)

  // Direct imports of the target must be clean.
  checkImports(refs, rel)

  // One-hop follow of LOCAL imports — catches a shared helper that re-exports a
  // forbidden module. Not recursive (one hop only).
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRel = path.relative(websiteRoot, local)
    checkImports(extractImports(helperSource), `${rel} → (one hop) ${helperRel}`)
  }
}

// ─── Phase 2 non-wiring pin (the in-session trigger, Step M row 14) ───
//
// The morning tool's every vetted row is SILENCE ("a second suggestion on top
// of [the retry prompt] would be noise") and anchor A2 is a DEFERRED anchor —
// "the tool should not be changed to fit the mapping." The route therefore
// deliberately carries NO suggestion machinery; this pin keeps that silence a
// decision rather than letting it decay into a wired suggestion unnoticed.
{
  const src = fs.readFileSync(path.join(websiteRoot, 'src/app/api/mentor/morning/route.ts'), 'utf-8')
  assert(
    !src.includes('suggested_practice') && !src.includes('practice-sequence'),
    'morning route: deliberately suggestion-free — every vetted row is silence (Step M row 14; A2 deferred)'
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
