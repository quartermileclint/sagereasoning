/**
 * human-practitioner-boundary.test.ts — import-boundary + measurement-neutrality guard
 * for the Logos foundational module (Remaining Principles #12).
 *
 * PURPOSE (mentor verdict D6): the human-surface work must have a clean file boundary
 * and must NOT import any part of the measured agent instrument. Battery-verified
 * BEFORE shipping (not after — the S10-ENV-1 / S10-ABUSE-1 lesson).
 *
 * *** THIS TEST IS DELIBERATELY *NOT* A COPY OF THE /sage-compass ONE. ***
 * That test blanket-bans the 'stoic-brain' specifier. Correct for #14 — WRONG for #12.
 * The build plan explicitly PERMITS a read-only import of stoic-brain here (the shipped
 * /methodology + home-page precedent). So the rule for #12 is sharper, and inverted:
 *
 *     IMPORTING stoic-brain.ts read-only is PERMITTED (and allowlisted below).
 *     EDITING   stoic-brain.ts is FORBIDDEN — asserted against git, below.
 *
 * Why editing it is forbidden, precisely: stoic-brain.ts sits inside the /api/reason
 * import graph (route → sage-reason-engine → reasoning-receipt → stoic-brain) AND is
 * imported DIRECTLY by /api/guardrail/route.ts and lib/guardrail-sandwich.ts — the guard
 * channel of the running harness. A 7-day false-hold observation window is measuring both.
 * One edit breaks byte-identity on TWO measured surfaces and reclassifies #12 to must-wait.
 *
 * *** HONEST SCOPE OF THIS GUARANTEE — read before trusting it. ***
 * The import checks below follow ONE hop. They do NOT prove transitive import purity and
 * must not be read as doing so. What actually protects the measurement is the GIT
 * BYTE-IDENTITY GUARD (section C) — no file in the measured graph is edited. An unchanged
 * module cannot perturb a byte-identical engine, and /api/reason already imports
 * stoic-brain itself, so this page's import closure is a strict SUBSET of the engine's own
 * and adds ZERO new modules to that graph.
 *
 * Residuals this test does NOT close (named so no one reads more than is proven):
 *   - The git guard sees UNCOMMITTED edits only (status vs HEAD). The stoic-brain.ts
 *     content-hash pin (C2b) closes that for the one file this build's permission hinges
 *     on; the rest of the measured set relies on each session's own gates at commit time.
 *   - A dynamic import whose specifier is COMPUTED (string concatenation / template)
 *     cannot be resolved by regex scanning; a tripwire below flags any non-literal
 *     dynamic import in the target files, but a determined evasion is out of scope —
 *     this test guards against accidental coupling, not a hostile author.
 *   - Hops beyond ONE are unscanned (disclosed above).
 *
 * What this test DOES prove, and it is the thing that could actually go wrong:
 *   A. This surface never reaches for the substrate engine, trust core, false-hold
 *      classifier, Gate-1 hooks, reflect engine, or proximity scale — directly or through
 *      a shared helper one hop away — and never imports assessKathekon.
 *   B. The #12 BINDING CONSTRAINT: "not a tool but a prerequisite orientation" (mentor §12).
 *      The page stays STATIC — no form, no submission, no persistence, no LLM gate. A
 *      "mark as read" table would be the tool-shaped instinct the mentor warned against.
 *   C. stoic-brain.ts (and the whole measured set) is byte-unchanged, per git.
 *   D. The mentor's REQUIRED content is present — including the three background doctrines
 *      (sympatheia / heimarmene / pronoia), which the survey's consolidated findings direct
 *      "should be present in the logos foundational module". Their absence is a build defect.
 *   E. The test's own matching machinery is live (a self-test — an assertion that cannot
 *      fail is worse than no assertion; the #14 review found exactly that class of gap).
 *
 * Imports NOTHING outside this PR (it imports the content module it verifies — same PR,
 * reverts together; the module itself has zero imports, asserted in D7).
 * No API key, no network, no --env-file — it reads source text, values, and queries git.
 *
 * Run (from website/):
 *   npx tsx src/app/logos/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
// The content module under test — SAME PR, so the test still reverts with it. Importing
// it lets section D assert on the exported VALUES the page actually renders (a live
// mutation proved source-text matching was satisfiable by comments and identifiers).
import * as LOGOS from '../../../lib/logos-teaching'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/logos/__tests__/ (4 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..')
const repoRoot = path.resolve(websiteRoot, '..')

// The human-practitioner files guarded. NOTE: welcome/page.tsx is included because this
// PR edits it (the entry-point link) — an engine import could be introduced there too.
const TARGET_FILES = [
  'src/app/logos/page.tsx',
  'src/app/logos/layout.tsx',
  'src/lib/logos-teaching.ts',
  'src/app/welcome/page.tsx',
]

const PAGE_FILE = 'src/app/logos/page.tsx'
const CONTENT_FILE = 'src/lib/logos-teaching.ts'

// Forbidden module-path substrings — matched against import/export specifiers.
// 'stoic-brain' is deliberately ABSENT (permitted read-only, allowlisted in section A2).
// 'sage-reason-engine' / '@anthropic-ai/sdk' / 'model-config' ARE forbidden HERE even
// though the gated sibling tools legitimately import them: /logos has no gate and makes
// no LLM call, so for THIS surface the engine wrapper itself is a violation (re-review
// finding LOGOS-BT-3 — a direct runSageReason import previously passed every check).
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
  'proximity-domains',
  'gate1-pre-decision',
  'false-hold-capture',
  'framing-core',
  'sage-reason-engine',
  '@anthropic-ai/sdk',
  'model-config',
]

// Forbidden imported symbols. The plan forbids stoic-brain's assessKathekon specifically —
// this is what makes the permitted stoic-brain import safe rather than a loophole.
const FORBIDDEN_SYMBOLS = ['assessKathekon']

// The ONLY symbols this surface may take from stoic-brain. Anything else is a new coupling
// to the engine's vocabulary and must be a deliberate decision, not an accident.
const ALLOWED_STOIC_BRAIN_SYMBOLS = ['VIRTUE_DISPLAY']

interface ImportRef { clause: string; specifier: string }

function extractImports(source: string): ImportRef[] {
  const refs: ImportRef[] = []
  const fromRe = /(?:import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(source)) !== null) refs.push({ clause: m[1], specifier: m[2] })
  const bareRe = /import\s+['"]([^'"]+)['"]/g
  while ((m = bareRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  // dynamic import() and CommonJS require() — a static-only regex would let a forbidden
  // module loaded dynamically sail straight through.
  const dynamicRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = dynamicRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  const requireRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = requireRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  return refs
}

/** Named bindings inside an import clause, with `type` modifiers and aliases stripped. */
function namedBindings(clause: string): string[] {
  const brace = clause.match(/\{([\s\S]*)\}/)
  if (!brace) return []
  return brace[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
    .filter(Boolean)
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

// The static-page tokens that must not appear — used on the page AND (LOGOS-BT-2) on its
// one-hop local imports, so interactivity cannot arrive via an imported sibling component.
const STATIC_VIOLATION_TOKENS = ["'use client'", '"use client"', '<form', 'fetch(', "'POST'", '"POST"', 'createClient']

function scanStaticViolations(source: string, contextLabel: string): void {
  for (const tok of STATIC_VIOLATION_TOKENS) {
    assert(
      !source.includes(tok),
      `${contextLabel}: must carry no interactivity/persistence token (${tok}) — #12 is an orientation, not a tool`
    )
  }
}

// Recursively list directory names under a root (bounded depth — the api tree is shallow).
function listDirsRecursive(root: string, depth: number): string[] {
  if (depth <= 0 || !fs.existsSync(root)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const full = path.join(root, entry.name)
    out.push(full)
    out.push(...listDirsRecursive(full, depth - 1))
  }
  return out
}

// Sanity: correct roots.
assert(fs.existsSync(path.join(websiteRoot, 'package.json')), 'websiteRoot resolves to website/ (found package.json)')
assert(fs.existsSync(path.join(repoRoot, '.git')), 'repoRoot resolves to the git repository root')

// =====================================================================
// E. SELF-TEST — prove the matching machinery is live before trusting it.
// An assertion that cannot fail is worse than no assertion at all.
// =====================================================================
{
  const synthetic = [
    `import { assessKathekon } from '@/lib/stoic-brain'`,
    `import { computeProximity } from '@/lib/translation-sandwich/layer2-mechanisms'`,
    `const x = await import('@/lib/substrate/trust-core/kathekon-engagement')`,
    `const y = require('../../harness/gate1-pre-decision/framing-core')`,
  ].join('\n')

  const refs = extractImports(synthetic)
  assert(refs.length >= 4, `self-test: extractImports finds static + dynamic + require forms (found ${refs.length})`)

  const specifiers = refs.map((r) => r.specifier)
  assert(
    specifiers.some((s) => FORBIDDEN_SPECIFIER_SUBSTRINGS.some((bad) => s.includes(bad))),
    'self-test: a forbidden specifier in synthetic source IS matched by the forbidden list'
  )
  assert(
    refs.some((r) => FORBIDDEN_SYMBOLS.some((sym) => r.clause.includes(sym))),
    'self-test: a forbidden symbol (assessKathekon) in synthetic source IS matched'
  )
  assert(
    namedBindings(`{ VIRTUE_DISPLAY, type KatorthomaProximityLevel as K }`).join(',') ===
      'VIRTUE_DISPLAY,KatorthomaProximityLevel',
    'self-test: namedBindings strips `type` modifiers and `as` aliases'
  )
  // The static-violation scan must fire on a synthetic client form component.
  const staticProbe = `'use client'\nexport default function F(){return <form onSubmit={() => fetch('/x', {method:'POST'})} />}`
  assert(
    STATIC_VIOLATION_TOKENS.some((t) => staticProbe.includes(t)),
    'self-test: the static-violation token set matches a synthetic client form component'
  )
  // The non-literal dynamic-import tripwire must fire on a computed specifier.
  const NON_LITERAL_DYNAMIC_IMPORT = /\bimport\s*\(\s*(?!['"][^'"]*['"]\s*\))/
  assert(
    NON_LITERAL_DYNAMIC_IMPORT.test(`await import('@/lib/' + name)`),
    'self-test: the non-literal dynamic-import tripwire matches a computed specifier'
  )
  assert(
    !NON_LITERAL_DYNAMIC_IMPORT.test(`await import('@/lib/literal')`),
    'self-test: the non-literal dynamic-import tripwire ignores a string-literal specifier'
  )
}

// The tripwire used below (defined once; self-tested above).
const NON_LITERAL_DYNAMIC_IMPORT = /\bimport\s*\(\s*(?!['"][^'"]*['"]\s*\))/

// =====================================================================
// A. IMPORT BOUNDARY
// =====================================================================
let totalLocalHopsResolved = 0
let stoicBrainImportsSeen = 0

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)

  // A1 — direct imports must be clean.
  checkImports(refs, rel)

  // A2 — the PERMITTED stoic-brain import is allowlisted, not a loophole.
  for (const { clause, specifier } of refs) {
    if (!specifier.includes('stoic-brain')) continue
    stoicBrainImportsSeen++
    const names = namedBindings(clause)
    assert(names.length > 0, `${rel}: stoic-brain import uses a named clause (got '${clause.trim()}')`)
    for (const n of names) {
      assert(
        ALLOWED_STOIC_BRAIN_SYMBOLS.includes(n),
        `${rel}: stoic-brain import of '${n}' is not on the allowlist [${ALLOWED_STOIC_BRAIN_SYMBOLS.join(', ')}] — a new engine-vocabulary coupling must be a deliberate decision`
      )
    }
    assert(
      !/\*\s+as\s+/.test(clause),
      `${rel}: stoic-brain must not be namespace-imported (\`import * as\`) — that defeats the symbol allowlist`
    )
  }

  // A4 — no COMPUTED dynamic import anywhere in a target file (the regex scanners can only
  // see string-literal specifiers, so a non-literal one is flagged outright — LOGOS-BT-7).
  assert(
    !NON_LITERAL_DYNAMIC_IMPORT.test(source),
    `${rel}: no dynamic import() with a computed (non-literal) specifier — regex scanning cannot follow it`
  )

  // A3 — one-hop follow of LOCAL imports (catches a helper that re-exports a forbidden module).
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    totalLocalHopsResolved++
    const helperRel = path.relative(websiteRoot, local)
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRefs = extractImports(helperSource)
    checkImports(helperRefs, `${rel} → (one hop) ${helperRel}`)

    // LOGOS-BT-2: the static-page constraint must hold at one hop too, or interactivity
    // simply arrives as an imported sibling component (the "mark as read" the mentor
    // warned against, one file removed). Applied to the PAGE's and LAYOUT's local hops.
    if (rel === 'src/app/logos/page.tsx' || rel === 'src/app/logos/layout.tsx') {
      scanStaticViolations(helperSource, `${rel} → (one hop) ${helperRel}`)
    }

    // LOGOS-BT-6: a helper that imports stoic-brain gets the SAME A2 discipline the
    // target files get (named clause, allowlist, no namespace import) — otherwise a
    // one-hop helper can namespace-import stoic-brain and re-export anything.
    for (const { clause: hClause, specifier: hSpec } of helperRefs) {
      if (!hSpec.includes('stoic-brain')) continue
      const hNames = namedBindings(hClause)
      assert(hNames.length > 0, `${rel} → (one hop) ${helperRel}: stoic-brain import must use a named clause (got '${hClause.trim()}')`)
      for (const n of hNames) {
        assert(
          ALLOWED_STOIC_BRAIN_SYMBOLS.includes(n),
          `${rel} → (one hop) ${helperRel}: stoic-brain import of '${n}' is not on the allowlist`
        )
      }
      assert(!/\*\s+as\s+/.test(hClause), `${rel} → (one hop) ${helperRel}: stoic-brain must not be namespace-imported`)
    }
  }
}

// Non-vacuity: resolveLocal silently continues on anything it cannot resolve, so if every
// local import failed to resolve, the one-hop layer would assert nothing and still be green.
assert(
  totalLocalHopsResolved > 0,
  `at least one local import must actually resolve, or the one-hop follow-through is vacuous (resolved: ${totalLocalHopsResolved})`
)
// Non-vacuity for A2: the page genuinely imports stoic-brain, so the allowlist must have been
// exercised. If this hits 0, the allowlist above proved nothing.
assert(
  stoicBrainImportsSeen > 0,
  `the permitted stoic-brain import must actually be present, or the A2 allowlist check is vacuous (seen: ${stoicBrainImportsSeen})`
)

// =====================================================================
// B. THE #12 BINDING CONSTRAINT — "NOT A TOOL BUT A PREREQUISITE ORIENTATION"
// The page must stay static: nothing submitted, nothing persisted, nothing classified.
// =====================================================================
{
  const pageFull = path.join(websiteRoot, PAGE_FILE)
  const src = fs.existsSync(pageFull) ? fs.readFileSync(pageFull, 'utf-8') : ''
  assert(src.length > 0, `${PAGE_FILE}: source is readable for the static-page checks`)

  // B1 — a server component: no client directive, no client state.
  assert(!/['"]use client['"]/.test(src), `${PAGE_FILE}: must not be a client component ('use client')`)
  for (const hook of ['useState', 'useEffect', 'useReducer', 'useRef']) {
    assert(!new RegExp(`\\b${hook}\\s*\\(`).test(src), `${PAGE_FILE}: must not use client state (${hook})`)
  }

  // B2 — nothing is submitted: no form, no inputs, no network call.
  for (const el of ['<form', '<input', '<textarea', '<select', '<button']) {
    assert(!src.includes(el), `${PAGE_FILE}: must contain no submission UI ('${el}') — this is an orientation, not a tool`)
  }
  assert(!/\bfetch\s*\(/.test(src), `${PAGE_FILE}: must make no network call (fetch)`)
  for (const verb of ["'POST'", '"POST"', "'PATCH'", '"PATCH"']) {
    assert(!src.includes(verb), `${PAGE_FILE}: must issue no write request (${verb})`)
  }

  // B3 — no LLM gate. There is nothing to classify: nothing is submitted.
  for (const llm of ['getClient', 'anthropic', 'Anthropic', 'messages.create', 'MODEL_FAST']) {
    assert(!src.includes(llm), `${PAGE_FILE}: must make no LLM call ('${llm}') — nothing is submitted, so nothing is classified`)
  }

  // B4 — no persistence anywhere in this PR: no route, no table, no Supabase client.
  // A DIRECTORY SCAN, not a single exact path (LOGOS-BT-2: 'api/mentor/logos-progress'
  // or 'api/logos' would have escaped an exists() check on one hard-coded path).
  const logosApiDirs = listDirsRecursive(path.join(websiteRoot, 'src/app/api'), 4).filter((d) =>
    path.basename(d).toLowerCase().includes('logos')
  )
  assert(
    logosApiDirs.length === 0,
    `no logos-named route directory may exist under src/app/api — #12 is a static orientation, not a tool with a route (found: ${logosApiDirs.join(', ')})`
  )
  for (const rel of TARGET_FILES) {
    const full = path.join(websiteRoot, rel)
    if (!fs.existsSync(full)) continue
    const s = fs.readFileSync(full, 'utf-8')
    for (const persist of ['logos_entries', 'createClient', 'supabase', 'from(']) {
      assert(!s.includes(persist), `${rel}: must not persist anything ('${persist}') — nothing is submitted`)
    }
  }
}

// =====================================================================
// C. THE GIT BYTE-IDENTITY GUARD — the check that actually protects the
// 7-day observation window. Folded INTO the test so it cannot be forgotten.
// =====================================================================
{
  // The measured set: /api/reason AND its import graph (sage-reason-engine →
  // reasoning-receipt → stoic-brain), the guardrail/guard channel (route + shared
  // module — LOGOS-BT-1: the plan's canonical grep omits these, but this test's own
  // header names them as measured, so the test covers them), the translation sandwich,
  // the substrate + trust core, the enforce predicate, the Gate-1 hooks, the false-hold
  // capture, and the reflect engine.
  const GUARD_RE = /api\/reason|api\/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|translation-sandwich|\/substrate\/|trust-core|kathekon-engagement|false-hold|harness\/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain/i

  let statusOutput: string | null = null
  try {
    statusOutput = execFileSync('git', ['-C', repoRoot, 'status', '--short'], { encoding: 'utf-8' })
  } catch (err) {
    statusOutput = null
  }

  // Fail HONEST, never silently skip: an unrunnable guard is a failed guard.
  assert(statusOutput !== null, 'git byte-identity guard: `git status --short` must be runnable (an unrunnable guard is a failed guard, never a skip)')

  if (statusOutput !== null) {
    const offending = statusOutput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => GUARD_RE.test(l))

    assert(
      offending.length === 0,
      `git byte-identity guard: NO file in the measured set may be modified while the observation window runs. Offending: ${offending.join(' | ')}`
    )

    // Non-vacuity: the guard regex must actually match the paths it claims to guard, or a
    // typo would render the check above permanently, silently green. The last four probes
    // are the LOGOS-BT-1 additions (the guard channel + the /api/reason import chain).
    for (const probe of [
      ' M website/src/lib/stoic-brain.ts',
      ' M website/src/app/api/reason/route.ts',
      ' M website/src/lib/substrate/trust-core/kathekon-engagement.ts',
      ' M harness/gate1-pre-decision/claude-code/hooks/false-hold-capture.mjs',
      ' M website/src/app/api/guardrail/route.ts',
      ' M website/src/lib/guardrail-sandwich.ts',
      ' M website/src/lib/sage-reason-engine.ts',
      ' M website/src/lib/reasoning-receipt.ts',
    ]) {
      assert(GUARD_RE.test(probe), `git byte-identity guard: regex must match a real measured path (${probe.trim()})`)
    }
    // And must NOT match this PR's own files, or the guard would be unusable.
    for (const own of [
      '?? website/src/app/logos/page.tsx',
      '?? website/src/lib/logos-teaching.ts',
      ' M website/src/app/welcome/page.tsx',
    ]) {
      assert(!GUARD_RE.test(own), `git byte-identity guard: regex must NOT match this PR's own human-surface files (${own.trim()})`)
    }
  }

  // C2 — the explicit one: stoic-brain.ts is READ, never WRITTEN.
  let sbStatus: string | null = null
  try {
    sbStatus = execFileSync('git', ['-C', repoRoot, 'status', '--porcelain', '--', 'website/src/lib/stoic-brain.ts'], { encoding: 'utf-8' })
  } catch {
    sbStatus = null
  }
  assert(sbStatus !== null, 'stoic-brain freeze: git must be queryable for stoic-brain.ts')
  assert(
    sbStatus !== null && sbStatus.trim() === '',
    `stoic-brain.ts MUST be unmodified — importing it is permitted, editing it is forbidden (it is in the /api/reason graph AND imported directly by /api/guardrail). git says: '${(sbStatus ?? '').trim()}'`
  )

  // C2b — the CONTENT-HASH pin (LOGOS-BT-5). git status compares against HEAD, so a
  // COMMITTED edit to stoic-brain.ts would pass C2 silently. This pin freezes the file's
  // actual bytes for the observation window: any edit, committed or not, fails here.
  // WINDOW-SCOPED BY DESIGN: when a legitimate post-window edit to stoic-brain.ts lands
  // (e.g. alongside the stoic-brain.json 4.26→7.9 corpus fix), update this constant in
  // the same PR — the failure is the deliberate-decision checkpoint, not an accident.
  const STOIC_BRAIN_SHA256 = 'fa8895ec949b9f6d2f95b9e941a423a095e9c66abe600a1e13fa1b84469b4928'
  const sbBytes = fs.readFileSync(path.join(websiteRoot, 'src/lib/stoic-brain.ts'))
  const sbHash = createHash('sha256').update(sbBytes).digest('hex')
  assert(
    sbHash === STOIC_BRAIN_SHA256,
    `stoic-brain.ts content hash must match the window-frozen pin (got ${sbHash}) — a committed edit is still an edit; update the pin ONLY as a deliberate post-window decision`
  )
}

// =====================================================================
// D. THE MENTOR'S REQUIRED CONTENT — asserted against the module's EXPORTED VALUES.
// This section was first written as substring matching on the module SOURCE, and a live
// mutation defeated it TWICE: the 90-line header comment quoting the mentor satisfied
// 9 of 14 phrases (LOGOS-BT-4), and after comment-stripping the incidental code
// identifier `id: 'sympatheia'` still satisfied the doctrine check with the prose
// gutted. Importing the module and asserting on the exported values closes both — these
// checks now see exactly the strings the page renders. (The module is part of this same
// PR, so the test still reverts with it; nothing outside the PR is imported.)
// =====================================================================
{
  const contentFull = path.join(websiteRoot, CONTENT_FILE)
  const raw = fs.existsSync(contentFull) ? fs.readFileSync(contentFull, 'utf-8') : ''
  assert(raw.length > 0, `${CONTENT_FILE}: source is readable for the content checks`)

  // D1 — the foundational claim, EXACT, and its three rejections as substantive cards.
  assert(
    LOGOS.THE_CLAIM.statement === 'Virtue is grounded in reason.',
    `THE_CLAIM.statement is the mentor's foundational claim verbatim (got '${LOGOS.THE_CLAIM.statement}')`
  )
  const qualifier = LOGOS.THE_CLAIM.qualifier.toLowerCase()
  for (const rejection of ['social convention', 'divine command', 'felt preference']) {
    assert(qualifier.includes(rejection), `THE_CLAIM.qualifier names the rejected ground '${rejection}' (mentor §12)`)
  }
  assert(LOGOS.THE_REJECTIONS.length === 3, `THE_REJECTIONS carries exactly the three rejections (got ${LOGOS.THE_REJECTIONS.length})`)
  for (const r of LOGOS.THE_REJECTIONS) {
    assert(r.body.length > 200, `rejection '${r.id}' is argued, not asserted (body ${r.body.length} chars)`)
    assert(r.source.length > 10, `rejection '${r.id}' carries a primary-source citation`)
  }

  // D2 — the three background doctrines, each a NAMED entry with a substantive body
  // (survey consolidated findings: they "should be present in the logos foundational module").
  assert(LOGOS.BACKGROUND_DOCTRINES.length === 3, `BACKGROUND_DOCTRINES carries exactly three doctrines (got ${LOGOS.BACKGROUND_DOCTRINES.length})`)
  for (const doctrine of ['sympatheia', 'heimarmene', 'pronoia']) {
    const entry = LOGOS.BACKGROUND_DOCTRINES.find((d) => d.title.toLowerCase().includes(doctrine))
    assert(entry !== undefined, `BACKGROUND_DOCTRINES names '${doctrine}' in a TITLE — required by the mentor's consolidated findings`)
    assert((entry?.body.length ?? 0) > 200, `background doctrine '${doctrine}' has a substantive body (got ${entry?.body.length ?? 0} chars)`)
    assert((entry?.source.length ?? 0) > 10, `background doctrine '${doctrine}' carries a primary-source citation`)
  }
  assert(
    LOGOS.THE_IDENTITY_CLAIM.body.toLowerCase().includes('one thing under three names'),
    `THE_IDENTITY_CLAIM states the fate=logos=providence identity`
  )

  // D3 — the doctrine's three steps in the mentor's order, and the unity corollary.
  assert(LOGOS.DOCTRINE_STEPS.length === 3, `DOCTRINE_STEPS carries the mentor's three steps (got ${LOGOS.DOCTRINE_STEPS.length})`)
  assert(
    (LOGOS.DOCTRINE_STEPS[0].title + LOGOS.DOCTRINE_STEPS[0].body).toLowerCase().includes('rational order'),
    `step one states that there is a rational order`
  )
  assert(
    LOGOS.UNITY_OF_VIRTUE.body.toLowerCase().includes('inseparable'),
    `UNITY_OF_VIRTUE states the doctrine (DL 7.125 'inseparable')`
  )
  assert(
    LOGOS.UNITY_OF_VIRTUE.body.toLowerCase().includes('average'),
    `UNITY_OF_VIRTUE states the no-average consequence the engine implements`
  )

  // D4 — the calling-stage foundation in PROSE (value), with NO code coupling (raw text).
  assert(
    LOGOS.CALLING_FOUNDATION.body.toLowerCase().includes('calling stage'),
    `CALLING_FOUNDATION states the calling stage's philosophical foundation`
  )
  assert(
    !raw.includes('/api/calling') && !raw.includes('api/practice/reflect'),
    `${CONTENT_FILE}: the calling-stage link is PROSE ONLY — no code coupling to the calling/reflect routes`
  )

  // D5 — the moral-community argument, stated CONDITIONALLY. A page that asserted current
  // AI systems DO participate would be an overclaim this project does not make.
  assert(
    LOGOS.MORAL_COMMUNITY.body.toLowerCase().includes('moral community'),
    `MORAL_COMMUNITY states the moral-community consequence`
  )
  assert(
    LOGOS.MORAL_COMMUNITY.caveat.toLowerCase().includes('capable of genuine rational examination'),
    `MORAL_COMMUNITY.caveat keeps the claim CONDITIONAL (an agent *capable of* rational examination)`
  )

  // D6 — the honest note: we hand the reader a metaphysical commitment and say so.
  assert(
    LOGOS.HONEST_NOTE.body.toLowerCase().includes('you do not have to accept the cosmology'),
    `HONEST_NOTE says the cosmology is a commitment, not a hidden premise`
  )

  // D7 — the content module is engine-free by construction: it must have NO imports at all
  // (raw text — a commented-out import is refused too).
  const contentRefs = extractImports(raw)
  assert(
    contentRefs.length === 0,
    `${CONTENT_FILE}: must be a pure content module with ZERO imports (found: ${contentRefs.map((r) => r.specifier).join(', ')})`
  )

  // D8 — every practice derivation links a REAL live route (the page's whole job is to
  // make the coherence of the SHIPPED tools visible — a dead link is a build defect).
  assert(LOGOS.PRACTICE_DERIVATIONS.length === 8, `PRACTICE_DERIVATIONS covers the eight shipped surfaces (got ${LOGOS.PRACTICE_DERIVATIONS.length})`)
  for (const d of LOGOS.PRACTICE_DERIVATIONS) {
    const routePage = path.join(websiteRoot, 'src/app', d.href.replace(/^\//, ''), 'page.tsx')
    assert(fs.existsSync(routePage), `derivation '${d.title}' links a real live route (${d.href})`)
    assert(d.descent.length > 150, `derivation '${d.title}' is a substantive entailment, not a blurb (${d.descent.length} chars)`)
  }
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
