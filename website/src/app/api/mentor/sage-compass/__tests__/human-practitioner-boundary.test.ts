/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the sage-compass
 * human-practitioner surface (Remaining Principles #14).
 *
 * PURPOSE (mentor verdict D6): the human-surface work must have a clean file
 * boundary and must NOT import any part of the measured agent instrument — it must
 * not touch /api/reason or the signed assessment. This is battery-verified BEFORE
 * shipping (not after — the S10-ENV-1 / S10-ABUSE-1 lesson). The 7-day false-hold
 * observation window measures /api/reason; leaving this surface free of any
 * engine/substrate/harness import is what keeps it a human-only change.
 *
 * *** HONEST SCOPE OF THIS GUARANTEE — read before trusting it. ***
 * The quality gate calls getClient() from '@/lib/sage-reason-engine', which is
 * ALLOWED (the shipped /morning + /view-from-above precedent) and whose own imports
 * are clean. But that chain does carry a READ-ONLY reference to stoic-brain at the
 * SECOND hop (sage-reason-engine → reasoning-receipt → imports a type +
 * EVALUATIVE_DISCLAIMER from ./stoic-brain). This test follows ONE hop, so it does
 * NOT prove transitive import purity, and it must not be read as doing so.
 *
 * That is NOT a defect, and the reason matters: what protects the 7-day measurement
 * is the GIT BYTE-IDENTITY GUARD — this PR edits no file in the /api/reason import
 * graph — not import purity. Importing an unchanged module cannot perturb a
 * byte-identical engine. What this test DOES prove is the thing that could actually
 * go wrong: that this surface never reaches for the substrate engine, the trust
 * core, the false-hold classifier, the Gate-1 hooks, the reflect engine, the
 * proximity-domains scale, or stoic-brain's assessKathekon — directly or through a
 * shared helper one hop away.
 *
 * It also pins the #14 BINDING CONSTRAINT (mentor: "The distance is not a verdict"):
 * the distance must never be classified, scored, ranked, or graded. See the
 * "distance is never scored" section below, which asserts against the route source.
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * Run (from website/):
 *   npx tsx src/app/api/mentor/sage-compass/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/mentor/sage-compass/__tests__/ (6 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')

// The human-practitioner files guarded — the route + the page + the layout.
const TARGET_FILES = [
  'src/app/api/mentor/sage-compass/route.ts',
  'src/app/sage-compass/page.tsx',
  'src/app/sage-compass/layout.tsx',
]

const ROUTE_FILE = 'src/app/api/mentor/sage-compass/route.ts'

// Forbidden module-path substrings — matched against import/export specifiers.
// '/substrate' covers @/lib/substrate/* (which already includes trust-core,
// kathekon-engagement, emission-hooks, etc.); the remaining entries also catch a
// relative sibling import that omits '/substrate'.
//
// 'proximity-domains' is listed explicitly for #14: the engine's katorthoma
// proximity scale (reflexive → sage_like) is the one vocabulary this tool must
// never borrow, or the compass bearing would be mistaken for a score.
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
  'proximity-domains',
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
  // dynamic `import('<spec>')` / `await import('<spec>')` — a static import/export
  // regex alone misses this, so a forbidden module loaded dynamically would sail
  // through unchecked.
  const dynamicRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = dynamicRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
  // CommonJS `require('<spec>')` — same reasoning.
  const requireRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = requireRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1] })
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

let totalLocalHopsResolved = 0

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)

  // Direct imports of the target must be clean.
  checkImports(refs, rel)

  // One-hop follow of LOCAL imports — catches a shared helper that re-exports a
  // forbidden module. Not recursive (one hop only) — see the honest-scope note in
  // the header: this does not prove transitive purity, and does not claim to.
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    totalLocalHopsResolved++
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRel = path.relative(websiteRoot, local)
    checkImports(extractImports(helperSource), `${rel} → (one hop) ${helperRel}`)
  }
}

// Non-vacuity: resolveLocal silently `continue`s on anything it cannot resolve, so
// if every local import happened to fail resolution the one-hop layer above would
// assert nothing and still report green. Pin that the one-hop layer is genuinely
// exercised (the route imports @/lib/security, @/lib/model-config, and
// @/lib/sage-reason-engine — all local — so this must be > 0).
assert(
  totalLocalHopsResolved > 0,
  `at least one local (@/ or relative) import must actually resolve, or the one-hop follow-through is vacuous (resolved: ${totalLocalHopsResolved})`
)

// =====================================================================
// The #14 binding constraint — THE DISTANCE IS NOT A VERDICT.
// Mentor: "The distance is not a verdict. It is a developmental orientation."
// These assertions pin that the distance is never fed to the classifier and that
// the ONLY gated field is the complete expression.
// =====================================================================
{
  const routeFull = path.join(websiteRoot, ROUTE_FILE)
  const src = fs.existsSync(routeFull) ? fs.readFileSync(routeFull, 'utf-8') : ''
  assert(src.length > 0, `${ROUTE_FILE}: source is readable for the distance-not-a-verdict checks`)

  // 1. The classifier exists and is named for what it classifies (the expression).
  assert(
    /async function classifyExpression\s*\(/.test(src),
    `${ROUTE_FILE}: the gate is classifyExpression (it classifies the expression, not the distance)`
  )

  // 2. There is NO classifier/scorer/grader for the distance, under any name —
  //    whether declared as `function foo(...)` OR as an arrow/function-expression
  //    bound with const/let/var (`const foo = (...) => ...` / `const foo = function(...)`),
  //    which the earlier function-keyword-only form would silently miss.
  for (const verbFragment of [
    '[Cc]lassifyDistance',
    '[Ss]coreDistance',
    '[Gg]radeDistance',
    '[Rr]ankDistance',
    '[Aa]ssessDistance',
    '[Ee]valuateDistance',
  ]) {
    const declRe = new RegExp(`(?:function\\s+\\w*${verbFragment}|(?:const|let|var)\\s+\\w*${verbFragment}\\s*=)`)
    assert(
      !declRe.test(src),
      `${ROUTE_FILE}: must define no distance classifier/scorer/grader, function or arrow form (${declRe})`
    )
  }

  // 3. classifyExpression's SIGNATURE must not take the distance. This is the
  //    load-bearing pin: it is what structurally prevents the distance reaching the
  //    model. Extract the parameter list and assert 'distance' appears nowhere in it.
  const sigMatch = src.match(/async function classifyExpression\s*\(([\s\S]*?)\)\s*:\s*Promise</)
  assert(sigMatch !== null, `${ROUTE_FILE}: classifyExpression signature is parseable`)
  if (sigMatch) {
    assert(
      !/distance/i.test(sigMatch[1]),
      `${ROUTE_FILE}: classifyExpression must NOT take the distance as a parameter (found in: ${sigMatch[1].replace(/\s+/g, ' ').trim()})`
    )
  }

  // 3b. A signature-name check alone is not load-bearing on its own: a parameter
  //     could be renamed to something innocuous (e.g. `x`) while `parsed.distance`
  //     is still passed positionally at a call site — the signature regex above
  //     would pass while the distance genuinely reaches the model. Pin BOTH call
  //     sites' argument lists directly: neither may reference `distance` (as a
  //     bare identifier, a `.distance` property access, or a `distance:` key).
  const callSiteRe = /classifyExpression\(([\s\S]*?)\)/g
  let callMatch: RegExpExecArray | null
  let callSitesChecked = 0
  while ((callMatch = callSiteRe.exec(src)) !== null) {
    // Skip the declaration itself (`async function classifyExpression(...)`) —
    // only actual call expressions are invocations.
    const precedingText = src.slice(Math.max(0, callMatch.index - 20), callMatch.index)
    if (/function\s+$/.test(precedingText)) continue
    callSitesChecked++
    assert(
      !/\bdistance\b/i.test(callMatch[1]),
      `${ROUTE_FILE}: a classifyExpression call site must not pass 'distance' as an argument (args: ${callMatch[1].replace(/\s+/g, ' ').trim()})`
    )
  }
  // Both POST and PATCH call classifyExpression — if this ever finds zero call
  // sites, the check above is vacuous (nothing to assert over), so pin the count.
  assert(
    callSitesChecked === 2,
    `${ROUTE_FILE}: expected exactly 2 classifyExpression call sites (POST + PATCH), found ${callSitesChecked}`
  )

  // 4. The persisted quality column is the EXPRESSION's, and there is no distance
  //    quality/score column being written.
  assert(
    /expression_quality:\s*quality/.test(src),
    `${ROUTE_FILE}: persists expression_quality (the expression's classification)`
  )
  for (const badCol of ['distance_quality', 'distance_score', 'distance_grade', 'distance_rank']) {
    assert(
      !src.includes(badCol),
      `${ROUTE_FILE}: must not persist a computed distance judgement ('${badCol}')`
    )
  }

  // 5. distance_reading is PRACTITIONER-SELECTED capture: it must be parsed from the
  //    request body, never derived. Assert it is read off the body and that the
  //    vocabulary is the local far/some_way/close set — never the engine's proximity
  //    ranks (which would make a bearing look like a score).
  assert(
    /body\.distance_reading/.test(src),
    `${ROUTE_FILE}: distance_reading is read from the request body (practitioner-selected, not computed)`
  )
  assert(
    /const DISTANCE_READINGS = \['far', 'some_way', 'close'\] as const/.test(src),
    `${ROUTE_FILE}: distance_reading vocabulary is the local far/some_way/close set`
  )
  for (const engineRank of ['reflexive', 'habitual', 'sage_like', 'katorthoma', 'principled']) {
    assert(
      !src.includes(engineRank),
      `${ROUTE_FILE}: must not reuse the engine's proximity vocabulary ('${engineRank}') — a bearing is not a score`
    )
  }

  // 6. The virtue vocabulary is defined LOCALLY (not imported from the engine).
  assert(
    /const VIRTUES = \['wisdom', 'justice', 'courage', 'temperance'\] as const/.test(src),
    `${ROUTE_FILE}: the virtue vocabulary is defined locally in plain language`
  )

  // 7. No code coupling to the passion diagnosis (mentor's complementarity is prose only).
  assert(
    !src.includes('passion_events'),
    `${ROUTE_FILE}: the passion-diagnosis complementarity is prose, not a code coupling`
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
