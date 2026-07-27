/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the WHOLE
 * oikeiosis human-practitioner surface: the existing quarterly diagnostic
 * (Gap 5) AND the new circle-extension practice (Remaining Principles #6 + #15).
 *
 * PURPOSE (mentor verdict D6): the human-surface work must have a clean file
 * boundary and must NOT import any part of the measured agent instrument — it must
 * not touch /api/reason or the signed assessment. This is battery-verified BEFORE
 * shipping (not after — the S10-ENV-1 / S10-ABUSE-1 lesson). The 7-day false-hold
 * observation window measures /api/reason; leaving this surface free of any
 * engine/substrate/harness import is what keeps it a human-only change and leaves
 * the measurement byte-identical. This test is net-new — the /oikeiosis surface
 * previously had no boundary guard — so it doubles as a standing guard the live
 * surface lacked. It guards the existing quarterly route too, so a later edit
 * cannot silently leak a forbidden module into either half.
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
 *   npx tsx src/app/api/mentor/oikeiosis/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/mentor/oikeiosis/__tests__/ (6 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')

// The human-practitioner files guarded — the existing quarterly route + the new
// circle-extension route + the shared page + the shared layout.
const TARGET_FILES = [
  'src/app/api/mentor/oikeiosis/route.ts',
  'src/app/api/mentor/oikeiosis/extension/route.ts',
  'src/app/oikeiosis/page.tsx',
  'src/app/oikeiosis/layout.tsx',
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
  'sage-reflect',
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

// ─── Phase 2 wiring pins (the in-session trigger, Step M) ───
{
  const quarterlySrc = fs.readFileSync(path.join(websiteRoot, 'src/app/api/mentor/oikeiosis/route.ts'), 'utf-8')
  const extensionSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/api/mentor/oikeiosis/extension/route.ts'), 'utf-8')
  assert(
    /import \{ resolveOikeiosisQuarterly \} from '@\/lib\/practice-sequence'/.test(quarterlySrc),
    'quarterly route: the suggestion resolver is imported from @/lib/practice-sequence (the locked mapping), not re-implemented'
  )
  assert(
    (quarterlySrc.match(/\.\.\.\(suggested \? \{ suggested_practice: suggested \} : \{\}\)/g) ?? []).length === 1,
    'quarterly route: suggested_practice is conditionally spread exactly once — absent field = honest silence'
  )
  assert(!quarterlySrc.includes('suggested_practice: null'), 'quarterly route: never suggested_practice: null — silence is an ABSENT field')
  // The EXTENSION route is gate-free and carries NO vetted row (Step M) — it
  // must stay suggestion-free, so a silence decision cannot decay into a
  // wired suggestion without this pin being changed deliberately.
  assert(
    !extensionSrc.includes('suggested_practice') && !extensionSrc.includes('practice-sequence'),
    'extension route: gate-free, no vetted row — deliberately suggestion-free (Step M)'
  )
  // Never persisted (BD-12): strip every known-good spread occurrence, then
  // require zero remaining mentions of suggested_practice in the QUARTERLY
  // route (would catch a stray field written directly into a DB call). Found
  // by the independent adversarial review: passion-log had this pin, the
  // other five did not.
  assert(
    !/suggested_practice\s*:/.test(
      quarterlySrc.replace(/\.\.\.\(suggested \? \{ suggested_practice: suggested \} : \{\}\)/g, '')
    ),
    'quarterly route: suggested_practice appears ONLY in the conditional response spread — never in an insert payload'
  )
}

// ─── Stale-suggestion regression lock (independent adversarial review) ───
//
// An independent review found that `suggestion` state was cleared ONLY inside
// handleSubmit; the quarterly form (unlike the other five wired pages) has no
// resetForm()/startEdit() at all — "Reflect", "Cancel", and "+ New quarterly
// reflection" each toggle showForm inline, and none cleared the suggestion.
// Fixed by clearing it in all three inline handlers; pinned here so a future
// edit to any of them cannot silently drop it.
{
  const pageSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/oikeiosis/page.tsx'), 'utf-8')
  const clearAndOpen = (pageSrc.match(/\{ setSuggestion\(null\); setShowForm\(true\) \}/g) ?? []).length
  const clearAndClose = (pageSrc.match(/\{ setSuggestion\(null\); setShowForm\(false\) \}/g) ?? []).length
  assert(
    clearAndOpen === 2,
    `page: BOTH quarterly-form-opening triggers ("Reflect" + "+ New quarterly reflection") clear the stale suggestion before opening (found ${clearAndOpen}, expected 2)`
  )
  assert(
    clearAndClose === 1,
    `page: the quarterly-form Cancel button clears the stale suggestion (found ${clearAndClose}, expected 1)`
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
