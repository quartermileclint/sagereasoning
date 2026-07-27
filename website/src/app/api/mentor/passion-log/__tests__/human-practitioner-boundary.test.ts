/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the
 * passion-log human-practitioner surface (Gap 2), added at practice-reminders
 * Phase 2 (the in-session trigger), which made these routes suggestion
 * carriers. The surface predates the guard; the Phase 1 lesson stands — an
 * unguarded shipped file is how a forbidden import arrives later.
 *
 * PURPOSE (mentor verdict D6, the family pattern): the human surface must NOT
 * import any part of the measured agent instrument — it must not touch
 * /api/reason or the signed assessment. It reads each target file's source and
 * asserts none of its import statements reference a forbidden module, then
 * follows one hop of each file's LOCAL imports.
 *
 * ONE DOCUMENTED PRE-EXISTING EXCEPTION. `passion-classify/route.ts` has
 * imported `@/lib/context/stoic-brain-loader` since Gap 2 — the classifier's
 * READ-ONLY corpus-context loader (the same READ posture as the allowlisted
 * `stoic-brain` import on /logos; reading is permitted, editing is what the
 * byte-identity guards forbid). The specifier contains the substring
 * 'stoic-brain', so the standard forbidden list would flag it. It is
 * allowlisted EXACTLY (full specifier match, one file, counted) rather than by
 * weakening the list — a new import of anything stoic-brain-ish anywhere else
 * on this surface still fails.
 *
 * Phase 2 wiring pins ride at the bottom: the suggestion resolvers must come
 * from the zero-import practice-sequence module, the response spreads must be
 * conditional (absent field ⇒ honest silence, never `suggested_practice:
 * null`), and the original response fields must survive untouched (additive-
 * only).
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * Run (from website/):
 *   npx tsx src/app/api/mentor/passion-log/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/mentor/passion-log/__tests__/ (6 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')

// The passion-log surface: both routes (the log and its classifier — one save
// flow), the page, its layout, and the shared suggestion card the page mounts.
const TARGET_FILES = [
  'src/app/api/mentor/passion-log/route.ts',
  'src/app/api/mentor/passion-classify/route.ts',
  'src/app/passion-log/page.tsx',
  'src/app/passion-log/layout.tsx',
  'src/components/SuggestedPracticeCard.tsx',
]

// Forbidden module-path substrings — matched against import/export specifiers.
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
  'gate1-pre-decision',
  'false-hold-capture',
  'framing-core',
]

// The one pre-existing, exact-specifier allowlist entry (see the header).
const ALLOWED_PREEXISTING: Readonly<Record<string, readonly string[]>> = {
  'src/app/api/mentor/passion-classify/route.ts': ['@/lib/context/stoic-brain-loader'],
}

const FORBIDDEN_SYMBOLS = ['assessKathekon']

interface ImportRef { clause: string; specifier: string }

function extractImports(source: string): ImportRef[] {
  const refs: ImportRef[] = []
  const fromRe = /(?:import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(source)) !== null) refs.push({ clause: m[1], specifier: m[2] })
  const bareRe = /import\s+['"]([^'"]+)['"]/g
  while ((m = bareRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  return refs
}

function checkImports(refs: ImportRef[], contextLabel: string, allowlist: readonly string[]): void {
  for (const { clause, specifier } of refs) {
    const allowlisted = allowlist.includes(specifier)
    for (const bad of FORBIDDEN_SPECIFIER_SUBSTRINGS) {
      assert(
        allowlisted || !specifier.includes(bad),
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

assert(fs.existsSync(path.join(websiteRoot, 'package.json')), `websiteRoot resolves to website/ (found package.json)`)

let allowlistedSeen = 0

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)
  const allowlist = ALLOWED_PREEXISTING[rel] ?? []
  allowlistedSeen += refs.filter((r) => allowlist.includes(r.specifier)).length

  checkImports(refs, rel, allowlist)

  // One-hop follow of LOCAL imports — catches a shared helper that re-exports
  // a forbidden module. Two narrow, verified carve-outs:
  //
  //  1. An ALLOWLISTED hop-0 specifier is not followed: the exception covers
  //     the loader's own Gap-2-era subtree, which predates this surface's
  //     Phase 2 change — re-litigating it at hop one would just re-flag the
  //     same documented history under a different label.
  //
  //  2. `brand-display.ts` (the family's display module, built precisely so
  //     pages stay out of stoic-brain's VALUE graph) carries a `./stoic-brain`
  //     import that must be TYPE-ONLY — verified here, not assumed. A type
  //     vanishes at compile time; a VALUE import through the same helper
  //     still fails.
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    if (allowlist.includes(specifier)) continue
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRel = path.relative(websiteRoot, local)
    if (helperRel === 'src/lib/brand-display.ts') {
      // Line-form check, not clause-form: the import-extraction regex can be
      // confused by prose in the helper's own header comment ("import … from"
      // in a sentence), so the type-only property is asserted on the actual
      // source LINES that reference ./stoic-brain.
      const sbLines = helperSource
        .split('\n')
        .filter((l) => /from\s+['"][^'"]*stoic-brain['"]/.test(l))
      assert(
        sbLines.length > 0 &&
          sbLines.every(
            (l) =>
              l.trimStart().startsWith('import type ') &&
              // …and carries exactly ONE import statement: a second,
              // semicolon-joined `import { value } from './stoic-brain'` on
              // the same line would otherwise ride the type-only prefix
              // (found by the first-hand review's test-adequacy pass).
              (l.match(/\bimport\b/g) ?? []).length === 1
          ),
        `${rel} → (one hop) ${helperRel}: every stoic-brain import line must be TYPE-ONLY (a single 'import type …' statement) — a value import would put this page in the engine's runtime graph (lines: ${sbLines.map((l) => l.trim()).join(' | ') || 'none found'})`
      )
    }
    const helperRefs = extractImports(helperSource).filter(
      (r) => !(helperRel === 'src/lib/brand-display.ts' && r.specifier.includes('stoic-brain'))
    )
    checkImports(helperRefs, `${rel} → (one hop) ${helperRel}`, [])
  }
}

// The allowlist must stay EXACT: the one entry is seen exactly once, so a
// removed loader import (welcome — tighten the list) or a second use of the
// exception (never intended) both surface here.
assert(
  allowlistedSeen === 1,
  `the pre-existing stoic-brain-loader exception is used exactly once (saw ${allowlistedSeen}) — the allowlist documents history, it does not license growth`
)

// ─── Phase 2 wiring pins (the in-session trigger) ───

{
  const logSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/api/mentor/passion-log/route.ts'), 'utf-8')
  const classifySrc = fs.readFileSync(path.join(websiteRoot, 'src/app/api/mentor/passion-classify/route.ts'), 'utf-8')

  // The resolvers come from the zero-import mapping module — never a local
  // re-implementation (one locked table, plan §7).
  assert(
    /import\s*\{[\s\S]*?resolvePassionLogPattern[\s\S]*?\}\s*from\s*'@\/lib\/practice-sequence'/.test(logSrc),
    'passion-log route: the pattern resolver is imported from @/lib/practice-sequence (the locked mapping), not re-implemented'
  )
  assert(
    /import\s*\{[\s\S]*?resolvePassionClassification[\s\S]*?\}\s*from\s*'@\/lib\/practice-sequence'/.test(classifySrc),
    'passion-classify route: the full resolution is imported from @/lib/practice-sequence (the locked mapping), not re-implemented'
  )

  // Additive-only: the ORIGINAL response fields survive.
  assert(
    /success:\s*true,\s*\n\s*event:\s*data,/.test(logSrc),
    'passion-log route: the POST response still carries { success, event } — the suggestion is additive, not a reshape'
  )

  // The field is spread CONDITIONALLY — absent on silence, never null.
  assert(
    (logSrc.match(/\.\.\.\(suggested \? \{ suggested_practice: suggested \} : \{\}\)/g) ?? []).length === 1,
    'passion-log route: suggested_practice is conditionally spread exactly once (absent field = honest silence)'
  )
  assert(
    (classifySrc.match(/\.\.\.\(suggested \? \{ suggested_practice: suggested \} : \{\}\)/g) ?? []).length === 2,
    'passion-classify route: suggested_practice is conditionally spread on BOTH response paths (cached and fresh)'
  )
  assert(
    !logSrc.includes('suggested_practice: null') && !classifySrc.includes('suggested_practice: null'),
    'neither route ever sends suggested_practice: null — silence is an ABSENT field'
  )

  // 6b: the practitioner's reading comes from the STORED row; the classifier's
  // own `match` claim is never what decides the form (the resolver has no such
  // input — pin that no call site tries to pass one).
  assert(
    /practitionerReading:\s*event\.passion_type/.test(classifySrc),
    'passion-classify route: the practitioner reading is the stored row\'s passion_type (the record, not the request echo)'
  )
  assert(
    !/resolvePassionClassification\([\s\S]{0,400}?\bmatch\b[\s\S]{0,200}?\)/.test(classifySrc),
    'passion-classify route: the classifier\'s own match claim is NOT passed to the resolver — agreement is deterministic id equality inside the lib'
  )

  // The suggestion is never cached: the cache key is (description,
  // user_diagnosis) — not user- or event-specific — while the pattern row
  // reads this user's history. cacheSet must store the classification alone.
  assert(
    /cacheSet\(ck, classification\)/.test(classifySrc) && !/cacheSet\([^)]*suggested/.test(classifySrc),
    'passion-classify route: the cache stores the classification only — the suggestion is computed fresh per event'
  )

  // The suggestion is response-composition only: no new column is written.
  for (const src of [logSrc, classifySrc]) {
    assert(
      !/suggested_practice\s*:/.test(src.replace(/\.\.\.\(suggested \? \{ suggested_practice: suggested \} : \{\}\)/g, '')),
      'routes: suggested_practice appears ONLY in the conditional response spread — never in an insert/update payload'
    )
  }
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
