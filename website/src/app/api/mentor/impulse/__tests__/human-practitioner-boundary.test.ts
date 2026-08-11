/**
 * human-practitioner-boundary.test.ts — import-boundary guard, corpus drift pin,
 * and binding-constraint pins for the /impulse human-practitioner surface
 * (the primal-impulse examination tool, S7).
 *
 * PURPOSE: the human-surface work must have a clean file boundary and must NOT
 * import any part of the measured agent instrument — it must not touch
 * /api/reason, /api/guardrail, or the signed assessment. Battery-verified
 * BEFORE shipping.
 *
 * *** HONEST SCOPE OF THIS GUARANTEE — read before trusting it. ***
 * The gate calls getClient() from '@/lib/sage-reason-engine', which is ALLOWED
 * (the shipped /morning, /view-from-above and /sage-compass precedent) and
 * whose own imports are clean — but that chain does carry a READ-ONLY
 * reference to stoic-brain at the SECOND hop (sage-reason-engine →
 * reasoning-receipt → imports a type + EVALUATIVE_DISCLAIMER from
 * ./stoic-brain). This test follows ONE hop, so it does NOT prove transitive
 * import purity and must not be read as doing so.
 *
 * That is NOT a defect, and the reason matters: what protects the measurement
 * is the GIT BYTE-IDENTITY GUARD — this PR edits no file in the /api/reason or
 * /api/guardrail import graph — not import purity. Importing an unchanged
 * module cannot perturb a byte-identical engine. What this test DOES prove is
 * the thing that could actually go wrong: that this surface never reaches for
 * the substrate engine, the trust core, the false-hold classifier, the Gate-1
 * hooks, the reflect engine, the proximity-domains scale, or stoic-brain —
 * directly or through a shared helper one hop away.
 *
 * *** THE ONE DELIBERATE EXCEPTION. *** Unlike every sibling, this tool is
 * INSIDE the R20a distress perimeter (mentor ruling B3), which REQUIRES it to
 * import '@/lib/substrate/r20a-audience-renderer' — the shared crisis-rendering
 * surface every perimeter route uses (its own only import is a type-only
 * import from ./r20a-gate). That exact specifier is allowlisted below; every
 * other '/substrate' path stays forbidden, and a positive pin asserts the
 * allowlist is not silently widened.
 *
 * WHAT ELSE THIS PINS:
 *   - THE CORPUS DRIFT PIN (mentor ruling C12): the local passion vocabulary
 *     is a SUBSET of the committed corpus, verified by reading stoic-brain.ts
 *     AS TEXT — this test imports nothing from it.
 *   - THE BINDING CONSTRAINT: the CORRECT JUDGEMENT (step 5) is never
 *     classified, scored, or graded — pinned at the classifier's signature AND
 *     at both call sites' argument lists, because a pin that checks only a
 *     parameter NAME is defeated by a rename-and-pass-positionally (the
 *     /sage-compass lesson).
 *   - The R20a wiring (AC5) and its flag-gated, byte-identical-when-off shape.
 *   - `mode` is derived server-side, never read from the request body.
 *   - Traits are cited BY NAME, never by number (the research is unnumbered).
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * Run (from website/):
 *   npx tsx src/app/api/mentor/impulse/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/mentor/impulse/__tests__/ (6 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..', '..')

const ROUTE_FILE = 'src/app/api/mentor/impulse/route.ts'
const R20A_FILE = 'src/app/api/mentor/impulse/r20a.ts'
const VOCAB_FILE = 'src/app/api/mentor/impulse/vocabulary.ts'
const PAGE_FILE = 'src/app/impulse/page.tsx'
const LAYOUT_FILE = 'src/app/impulse/layout.tsx'

// The human-practitioner files guarded — route + its two colocated modules +
// the page + the layout. (Two more than the siblings guard, because this tool
// carries its R20a helpers and its local vocabulary in its own directory.)
const TARGET_FILES = [ROUTE_FILE, R20A_FILE, VOCAB_FILE, PAGE_FILE, LAYOUT_FILE]

// Forbidden module-path substrings — matched against import/export specifiers.
// '/substrate' covers @/lib/substrate/* (which already includes trust-core,
// kathekon-engagement, emission-hooks, etc.); the remaining entries also catch
// a relative sibling import that omits '/substrate'.
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

/**
 * The ONE allowlisted substrate specifier — EXACT match, not a substring.
 * Required by the B3 perimeter ruling; see the header. Anything else matching
 * '/substrate' fails, and PIN-ALLOWLIST below asserts this list stays at one.
 */
const PERMITTED_SUBSTRATE_SPECIFIERS = ['@/lib/substrate/r20a-audience-renderer']

// Forbidden imported symbols (stoic-brain's assessKathekon specifically).
const FORBIDDEN_SYMBOLS = ['assessKathekon']

/**
 * TYPE-ONLY HOPS — disclosed, not hidden.
 *
 * At the ONE-HOP stage this tool necessarily reaches shared perimeter
 * infrastructure it is REQUIRED to reuse (PR15) and does not own. One of those
 * modules carries a reference to a forbidden module — but as an `import type`,
 * which TypeScript ERASES at compile time. A type-only reference emits no
 * runtime import and therefore cannot create the coupling this guard exists to
 * prevent.
 *
 * So the rule is split rather than blanket-exempted:
 *   - a forbidden VALUE import at one hop still FAILS;
 *   - a forbidden TYPE-ONLY import at one hop is permitted, but ONLY if it is
 *     registered here, and the observed set is asserted to EQUAL this register
 *     (PIN-TYPE-ONLY below). A new one surfaces loudly instead of being
 *     absorbed.
 *
 * DIRECT imports in TARGET_FILES are NOT covered by this relaxation — this
 * tool's own files may not reference a forbidden module at all, type or value.
 * That matters: importing stoic-brain's sub-species TYPE would re-couple the
 * local vocabulary the C12 drift pin exists to keep independent.
 */
const EXPECTED_TYPE_ONLY_HOPS: readonly { module: string; specifier: string; reason: string }[] = [
  {
    module: 'src/lib/guardrails.ts',
    specifier: './stoic-brain',
    reason:
      "`import type { KatorthomaProximityLevel }` — erased at compile, no runtime import. guardrails.ts is the crisis-resource source of truth (CRISIS_RESOURCES/getCrisisResources) that the B3 perimeter ruling requires this tool to reuse rather than duplicate.",
  },
]

const observedTypeOnlyHops: { module: string; specifier: string }[] = []

interface ImportRef { clause: string; specifier: string; typeOnly: boolean }

function extractImports(source: string): ImportRef[] {
  const refs: ImportRef[] = []
  // `import <clause> from '<spec>'` and `export <clause> from '<spec>'`
  const fromRe = /(?:import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(source)) !== null) {
    // Conservative: ONLY the unambiguous leading-`type` form counts as
    // type-only. A mixed clause (`import { type A, B }`) carries a value
    // binding and is treated as a value import.
    refs.push({ clause: m[1], specifier: m[2], typeOnly: /^type\s/.test(m[1].trim()) })
  }
  // side-effect `import '<spec>'`
  const bareRe = /import\s+['"]([^'"]+)['"]/g
  while ((m = bareRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1], typeOnly: false })
  // dynamic `import('<spec>')` — a static regex alone misses this, so a
  // forbidden module loaded dynamically would sail through unchecked.
  const dynamicRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = dynamicRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1], typeOnly: false })
  // CommonJS `require('<spec>')` — same reasoning.
  const requireRe = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  while ((m = requireRe.exec(source)) !== null) refs.push({ clause: '', specifier: m[1], typeOnly: false })
  return refs
}

/**
 * @param moduleRel  repo-relative path of the file whose imports these are
 * @param isOneHop   true when checking a module this tool does not own; only
 *                   then is the registered type-only relaxation available
 */
function checkImports(
  refs: ImportRef[],
  contextLabel: string,
  moduleRel: string,
  isOneHop: boolean
): void {
  totalImportRefsSeen += refs.length
  for (const { clause, specifier, typeOnly } of refs) {
    const allowlisted = PERMITTED_SUBSTRATE_SPECIFIERS.includes(specifier)
    for (const bad of FORBIDDEN_SPECIFIER_SUBSTRINGS) {
      totalForbiddenPairsEvaluated++
      if (!specifier.includes(bad)) continue
      if (allowlisted) continue
      if (isOneHop && typeOnly) {
        observedTypeOnlyHops.push({ module: moduleRel, specifier })
        continue
      }
      assert(
        false,
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
assert(fs.existsSync(path.join(websiteRoot, 'package.json')), 'websiteRoot resolves to website/ (found package.json)')

let totalLocalHopsResolved = 0
let totalImportRefsSeen = 0
let totalForbiddenPairsEvaluated = 0

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)

  // Direct imports of the target must be clean — STRICTLY: this tool's own
  // files may not reference a forbidden module at all, type or value.
  checkImports(refs, rel, rel, /* isOneHop */ false)

  // One-hop follow of LOCAL imports — catches a shared helper that re-exports
  // a forbidden module. Not recursive — see the honest-scope note in the
  // header: this does not prove transitive purity, and does not claim to.
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    totalLocalHopsResolved++
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRel = path.relative(websiteRoot, local)
    checkImports(extractImports(helperSource), `${rel} → (one hop) ${helperRel}`, helperRel, /* isOneHop */ true)
  }
}

// PIN-TYPE-ONLY: the set of forbidden-module references reached at one hop and
// permitted because they are TYPE-ONLY must EQUAL the register above — not
// merely be a subset of it. A new one (or a disappeared one) fails, so the
// relaxation can never quietly widen.
{
  const observed = [...new Set(observedTypeOnlyHops.map((h) => `${h.module} → ${h.specifier}`))].sort()
  const expected = [...new Set(EXPECTED_TYPE_ONLY_HOPS.map((h) => `${h.module} → ${h.specifier}`))].sort()
  assert(
    observed.join(' | ') === expected.join(' | '),
    `type-only one-hop register must match exactly.\n    expected: ${expected.join(' | ') || '(none)'}\n    observed: ${observed.join(' | ') || '(none)'}`
  )
}

// Non-vacuity: resolveLocal silently `continue`s on anything it cannot
// resolve, so if every local import failed resolution the one-hop layer would
// assert nothing and still report green. Pin that it is genuinely exercised.
assert(
  totalLocalHopsResolved > 0,
  `at least one local (@/ or relative) import must actually resolve, or the one-hop follow-through is vacuous (resolved: ${totalLocalHopsResolved})`
)

// NON-VACUITY FLOORS for the forbidden-specifier guard itself. Unlike the
// earlier form, checkImports now asserts ONLY on an actual match — which is
// correct (it removes ~800 vacuous passes) but means a broken extractImports
// would make the whole guard silently stop guarding while still reporting
// green. Count the traversal, not just the failures (memory:
// guard-needs-a-non-vacuity-floor).
assert(
  totalImportRefsSeen >= 20,
  `the import extractor must actually find imports across the target + one-hop files (found ${totalImportRefsSeen}); a broken regex would make the forbidden-specifier guard silently vacuous`
)
assert(
  totalForbiddenPairsEvaluated >= totalImportRefsSeen * FORBIDDEN_SPECIFIER_SUBSTRINGS.length,
  `every (import, forbidden-module) pair must be evaluated (evaluated ${totalForbiddenPairsEvaluated}, expected >= ${totalImportRefsSeen * FORBIDDEN_SPECIFIER_SUBSTRINGS.length})`
)

// PIN-ALLOWLIST: the substrate carve-out must stay exactly one specifier. If a
// future change adds a second, this fails and forces the decision to be made
// deliberately rather than by widening a list in passing.
assert(
  PERMITTED_SUBSTRATE_SPECIFIERS.length === 1 &&
    PERMITTED_SUBSTRATE_SPECIFIERS[0] === '@/lib/substrate/r20a-audience-renderer',
  `the substrate allowlist must remain exactly ['@/lib/substrate/r20a-audience-renderer'] (found: ${JSON.stringify(PERMITTED_SUBSTRATE_SPECIFIERS)})`
)

// PIN-ALLOWLIST-USED: and the carve-out must be genuinely EXERCISED — if the
// route stopped importing the renderer, the allowlist check above would pass
// vacuously while the perimeter's human rendering had silently gone missing.
{
  const routeSrc = fs.readFileSync(path.join(websiteRoot, ROUTE_FILE), 'utf-8')
  assert(
    routeSrc.includes("from '@/lib/substrate/r20a-audience-renderer'"),
    `${ROUTE_FILE}: must import the allowlisted crisis renderer (or the allowlist is vacuous)`
  )
}

// =====================================================================
// THE CORPUS DRIFT PIN (mentor ruling C12)
//
// "Accept the duplication and add a drift pin. The boundary test reads
//  stoic-brain.ts as text — imports nothing — and asserts the local IDs are a
//  subset. Silent drift is the risk; the pin catches it without coupling."
//
// stoic-brain.ts is imported directly by api/guardrail/route.ts and
// guardrail-sandwich.ts. READING it here is fine; a red pin must NEVER be
// "fixed" by editing it.
// =====================================================================
{
  const corpusPath = path.join(websiteRoot, 'src/lib/stoic-brain.ts')
  assert(fs.existsSync(corpusPath), 'drift pin: stoic-brain.ts is readable as text')
  const corpus = fs.readFileSync(corpusPath, 'utf-8')

  // Bound the read to the ROOT_PASSIONS block, so EUPATHEIAI's sub_species and
  // every other id in the file stay out of the comparison set.
  const start = corpus.indexOf('export const ROOT_PASSIONS')
  const end = corpus.indexOf('export const EUPATHEIAI')
  assert(start !== -1 && end !== -1 && start < end, 'drift pin: the ROOT_PASSIONS block is locatable in the corpus')

  const block = corpus.slice(start, end)
  const ROOT_IDS = ['epithumia', 'hedone', 'phobos', 'lupe']
  const allIds = [...block.matchAll(/id:\s*'([a-z_]+)'/g)].map((m) => m[1])
  const corpusSubSpecies = new Set(allIds.filter((id) => !ROOT_IDS.includes(id)))

  // Non-vacuity FIRST: a regex that silently matched nothing would make the
  // subset check below trivially fail (safe) — but a regex that matched only
  // SOME would make it fail confusingly. Pin the extraction itself.
  assert(
    corpusSubSpecies.size >= 20,
    `drift pin: extraction found ${corpusSubSpecies.size} sub-species in the corpus; expected at least 20 (the extraction regex may have broken)`
  )
  // And pin that all four roots were seen, i.e. the block really is the whole
  // ROOT_PASSIONS constant and not a truncated slice.
  for (const root of ROOT_IDS) {
    assert(block.includes(`id: '${root}'`), `drift pin: the ROOT_PASSIONS slice contains the root '${root}'`)
  }

  // THE PIN ITSELF: every locally-declared sub-species id exists in the corpus.
  // Read from the local vocabulary AS TEXT too, so this test imports neither file.
  const vocabSrc = fs.readFileSync(path.join(websiteRoot, VOCAB_FILE), 'utf-8')
  const localBlockStart = vocabSrc.indexOf('export const PASSION_SUB_SPECIES')
  const localBlockEnd = vocabSrc.indexOf('export const SUB_SPECIES_IDS')
  assert(
    localBlockStart !== -1 && localBlockEnd !== -1 && localBlockStart < localBlockEnd,
    'drift pin: the local PASSION_SUB_SPECIES block is locatable'
  )
  const localIds = [
    ...vocabSrc.slice(localBlockStart, localBlockEnd).matchAll(/\{\s*id:\s*'([a-z_]+)'/g),
  ].map((m) => m[1])

  assert(
    localIds.length === 20,
    `drift pin: the local vocabulary declares ${localIds.length} sub-species; expected 20 (the S7 scope document's "25" is wrong — counted first-hand in ROOT_PASSIONS: epithumia 6, hedone 3, phobos 6, lupe 5)`
  )

  for (const id of localIds) {
    assert(
      corpusSubSpecies.has(id),
      `drift pin: local sub-species '${id}' is NOT in the committed corpus — R7 source fidelity: no invented sub-species. Fix the LOCAL vocabulary, never stoic-brain.ts.`
    )
  }

  // Disclosure pin (not a subset requirement): if the corpus ever GROWS, this
  // goes red so a human decides whether the new sub-species belongs in the
  // tool, rather than the divergence going unnoticed.
  assert(
    corpusSubSpecies.size === 20,
    `drift pin (disclosure): the corpus now holds ${corpusSubSpecies.size} sub-species, not 20 — decide deliberately whether /impulse's local vocabulary should carry the new one(s). The subset guarantee above still holds; this pin exists so the divergence is not silent.`
  )

  // The migration's CHECK must admit exactly the local vocabulary — a schema
  // that drifted from the code would 400/500 a legitimate selection.
  const migration = fs.readFileSync(path.join(websiteRoot, 'supabase-impulse-migration.sql'), 'utf-8')
  const checkStart = migration.indexOf('CHECK (sub_species IN (')
  assert(checkStart !== -1, 'drift pin: the migration carries a sub_species CHECK')
  const checkBlock = migration.slice(checkStart, migration.indexOf('))', checkStart))
  for (const id of localIds) {
    assert(
      checkBlock.includes(`'${id}'`),
      `drift pin: the migration's sub_species CHECK omits '${id}' — schema and vocabulary have drifted`
    )
  }
}

// =====================================================================
// THE BINDING CONSTRAINT — STEP 5 IS NEVER CLASSIFIED
//
// The correct judgement is the practitioner's own philosophy. Nothing here
// classifies, scores, ranks, or grades it. These pins are the structural
// guarantee, and they are deliberately BOTH signature-level AND call-site
// level: a signature-name check alone is defeated by renaming the parameter
// and passing the value positionally (the /sage-compass lesson).
// =====================================================================
{
  const src = fs.readFileSync(path.join(websiteRoot, ROUTE_FILE), 'utf-8')
  assert(src.length > 0, `${ROUTE_FILE}: source is readable for the never-classified checks`)

  // Every field that must never reach the classifier, in both wire and local
  // spellings.
  const FORBIDDEN_GATE_INPUTS = [
    'correct_judgement', 'correctJudgement',
    'false_belief', 'falseBelief',
    'sub_species', 'subSpecies',
    'counterfactual',
    'cooperation_ground', 'cooperationGround',
    'impulse_exceeded', 'impulseExceeded',
    'impulse_note', 'impulseNote',
  ]

  // 1. The classifier exists and is named for what it classifies.
  assert(
    /async function classifyImpressionSpecificity\s*\(/.test(src),
    `${ROUTE_FILE}: the gate is classifyImpressionSpecificity (it classifies the impression, nothing else)`
  )

  // 2. There is NO classifier/scorer/grader for any other field, under any
  //    name — declared as `function foo(...)` OR bound with const/let/var.
  for (const subject of ['Judgement', 'Judgment', 'Belief', 'SubSpecies', 'Counterfactual', 'Ground', 'Impulse']) {
    for (const verb of ['[Cc]lassify', '[Ss]core', '[Gg]rade', '[Rr]ank', '[Aa]ssess', '[Ee]valuate']) {
      const declRe = new RegExp(`(?:function\\s+${verb}\\w*${subject}|(?:const|let|var)\\s+${verb}\\w*${subject}\\s*=)`)
      assert(
        !declRe.test(src),
        `${ROUTE_FILE}: must define no ${verb}${subject} classifier/scorer/grader, function or arrow form`
      )
    }
  }

  // 3. THE SIGNATURE. classifyImpressionSpecificity must take only the trait
  //    and the impression — no forbidden field may appear in its parameters.
  const sigMatch = src.match(/async function classifyImpressionSpecificity\s*\(([\s\S]*?)\)\s*:\s*Promise</)
  assert(sigMatch !== null, `${ROUTE_FILE}: classifyImpressionSpecificity signature is parseable`)
  if (sigMatch) {
    for (const bad of FORBIDDEN_GATE_INPUTS) {
      assert(
        !sigMatch[1].includes(bad),
        `${ROUTE_FILE}: classifyImpressionSpecificity must NOT take '${bad}' as a parameter (found in: ${sigMatch[1].replace(/\s+/g, ' ').trim()})`
      )
    }
    // Exactly two parameters — a third would be a new input to justify.
    const params = sigMatch[1].split(',').filter((p) => p.trim().length > 0)
    assert(
      params.length === 2,
      `${ROUTE_FILE}: classifyImpressionSpecificity must take exactly 2 parameters (trait, impression); found ${params.length}`
    )
  }

  // 3b. THE CALL SITES. A parameter could be renamed to something innocuous
  //     while `parsed.correct_judgement` is still passed positionally — the
  //     signature regex would pass while step 5 genuinely reached the model.
  //     Pin BOTH call sites' argument lists directly.
  const callSiteRe = /classifyImpressionSpecificity\(([\s\S]*?)\)/g
  let callMatch: RegExpExecArray | null
  let callSitesChecked = 0
  while ((callMatch = callSiteRe.exec(src)) !== null) {
    // Skip the declaration itself — only actual call expressions are invocations.
    const preceding = src.slice(Math.max(0, callMatch.index - 20), callMatch.index)
    if (/function\s+$/.test(preceding)) continue
    callSitesChecked++
    for (const bad of FORBIDDEN_GATE_INPUTS) {
      assert(
        !callMatch[1].includes(bad),
        `${ROUTE_FILE}: a classifyImpressionSpecificity call site must not pass '${bad}' (args: ${callMatch[1].replace(/\s+/g, ' ').trim()})`
      )
    }
  }
  // Both POST and PATCH call it — zero call sites would make the check vacuous.
  assert(
    callSitesChecked === 2,
    `${ROUTE_FILE}: expected exactly 2 classifyImpressionSpecificity call sites (POST + PATCH), found ${callSitesChecked}`
  )

  // 4. The persisted quality column is the IMPRESSION's, and no other field
  //    has a computed quality/score column written anywhere.
  assert(
    /impression_specificity:\s*quality/.test(src),
    `${ROUTE_FILE}: persists impression_specificity (the impression's classification)`
  )
  for (const badCol of [
    'judgement_quality', 'judgment_quality', 'judgement_score', 'judgement_grade',
    'belief_quality', 'belief_score',
    'counterfactual_quality', 'counterfactual_score',
    'ground_quality', 'impulse_quality', 'impulse_score',
  ]) {
    assert(!src.includes(badCol), `${ROUTE_FILE}: must not persist a computed judgement ('${badCol}')`)
  }
  // The migration must not carry such a column either.
  {
    const migration = fs.readFileSync(path.join(websiteRoot, 'supabase-impulse-migration.sql'), 'utf-8')
    for (const badCol of ['judgement_quality', 'judgment_quality', 'belief_quality', 'counterfactual_quality']) {
      assert(!migration.includes(badCol), `migration: must not define a computed judgement column ('${badCol}')`)
    }
  }

  // 5. The engine's proximity vocabulary is never reused — an examination is
  //    not an engine score, and the two must not be confusable.
  for (const engineRank of ['reflexive', 'habitual', 'sage_like', 'katorthoma', 'principled']) {
    assert(
      !src.includes(engineRank),
      `${ROUTE_FILE}: must not reuse the engine's proximity vocabulary ('${engineRank}')`
    )
  }

  // 6. No code coupling to the passion diagnosis (mentor ruling B2 — the link
  //    to /passion-log is page prose only).
  //
  //    NOTE the comment-strip: these files DOCUMENT the no-coupling rule, and
  //    naming the table while forbidding it is exactly right in prose. A raw
  //    -source check would fail on its own correct documentation — the same
  //    comment-satisfiability class as the ST3 fold, cutting the other way.
  //    The check must therefore see CODE only.
  for (const rel of [ROUTE_FILE, VOCAB_FILE, PAGE_FILE]) {
    const code = fs
      .readFileSync(path.join(websiteRoot, rel), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
    assert(!code.includes('passion_events'), `${rel}: no CODE coupling to passion_events (B2)`)
  }
  {
    const pageSrc = fs.readFileSync(path.join(websiteRoot, PAGE_FILE), 'utf-8')
    // B2's other half: the relationship IS stated — as a prose link, in the
    // rendered copy (checked on the JSX, not on a comment).
    const pageCode = pageSrc
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
    assert(
      pageCode.includes('/passion-log'),
      `${PAGE_FILE}: the conceptual link to /passion-log is rendered in the page copy (B2's other half)`
    )
  }
}

// =====================================================================
// `mode` IS DERIVED SERVER-SIDE, NEVER READ FROM THE REQUEST BODY
//
// If a client could supply `mode`, it could submit a trait/mode pair the
// vocabulary does not license — e.g. a reciprocity trait in diagnostic mode,
// which the DB CHECK would then reject as a 500-grade error instead of the
// shape simply being impossible.
// =====================================================================
{
  const src = fs.readFileSync(path.join(websiteRoot, ROUTE_FILE), 'utf-8')
  assert(
    !/body\.mode/.test(src),
    `${ROUTE_FILE}: 'mode' must never be read from the request body — it is derived from the trait`
  )
  assert(
    /modeForTrait\(/.test(src),
    `${ROUTE_FILE}: 'mode' is derived via modeForTrait() (the vocabulary's own mapping)`
  )
}

// =====================================================================
// R20a WIRING (AC5) — the fourteenth route-level perimeter entry
//
// The full AC5 pattern is asserted centrally in
// src/lib/__tests__/r20a-invocation-guard.test.ts; these pins are the
// tool-local half, and they exist because this tool's perimeter membership is
// a DEPARTURE from family precedent that a future reader could mistake for an
// error and "clean up".
// =====================================================================
{
  const src = fs.readFileSync(path.join(websiteRoot, ROUTE_FILE), 'utf-8')
  const r20aSrc = fs.readFileSync(path.join(websiteRoot, R20A_FILE), 'utf-8')

  // Strip comments before the CALL-site checks: this route's own
  // documentation quotes the AC5 pattern verbatim, and a raw-source check
  // would be comment-satisfiable (the ST3 fold's lesson — a live mutation
  // proved exactly this class).
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

  assert(
    /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(code),
    `${ROUTE_FILE}: awaits the AC5-mandated enforceDistressCheck(detectDistressTwoStage(...)) pattern`
  )
  // BOTH write paths — a revision carries the same free text as a create.
  assert(
    (code.match(/enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/g) ?? []).length === 2,
    `${ROUTE_FILE}: the perimeter check runs on BOTH write paths (POST + PATCH)`
  )
  assert(
    (code.match(/isImpulseR20aEnabled\s*\(\s*\)/g) ?? []).length === 2,
    `${ROUTE_FILE}: both perimeter blocks are flag-gated (byte-identical when the flag is unset)`
  )
  // EVERY redirect call site must render the HUMAN audience — not merely one
  // of them. An existence check (`.test(...)`) passes while a SECOND call site
  // renders the developer form, which on a cookie-session route would emit a
  // developer payload to a person in distress. Mutation-proven: flipping one
  // of the two call sites left an existence check green.
  const redirectCallSites = (code.match(/renderR20aRedirectResponse\s*\(/g) ?? []).length
  const humanAudienceUses = (code.match(/audience:\s*'human_user'/g) ?? []).length
  assert(
    redirectCallSites === 2,
    `${ROUTE_FILE}: expected exactly 2 renderR20aRedirectResponse call sites (POST + PATCH), found ${redirectCallSites}`
  )
  assert(
    humanAudienceUses === redirectCallSites,
    `${ROUTE_FILE}: EVERY redirect must render the human audience (${humanAudienceUses} human_user vs ${redirectCallSites} call sites) — this is a cookie-session route and the developer form must be unreachable`
  )
  for (const otherAudience of ["'developer'", "'agent'", "'api_consumer'"]) {
    assert(
      !code.includes(`audience: ${otherAudience}`),
      `${ROUTE_FILE}: must never render audience ${otherAudience} — this is a human surface`
    )
  }
  assert(
    (code.match(/await\s+escalateMildDistress\s*\(/g) ?? []).length === 2,
    `${ROUTE_FILE}: the mild-escalation check is awaited on both write paths`
  )

  // ORDERING: the check must precede the gate's LLM call on both paths — the
  // whole point of "before any LLM call". Compare first occurrences.
  const firstCheck = code.search(/enforceDistressCheck\s*\(/)
  const firstGateCall = code.search(/await classifyImpressionSpecificity\s*\(/)
  assert(
    firstCheck !== -1 && firstGateCall !== -1 && firstCheck < firstGateCall,
    `${ROUTE_FILE}: the distress check precedes the gate's LLM call (firstCheck=${firstCheck}, firstGate=${firstGateCall})`
  )

  // The flag defaults OFF and is case-strict.
  assert(
    /process\.env\.SUBSTRATE_IMPULSE_R20A_ENABLED === 'true'/.test(r20aSrc),
    `${R20A_FILE}: the flag defaults OFF and only the literal 'true' enables it`
  )

  // AC5 requires the DEPARTURE and its REASON to be recorded in the route.
  // Not decoration: every sibling records the opposite decision.
  assert(
    /B3/.test(src) && /departure/i.test(src),
    `${ROUTE_FILE}: records the AC5 departure from family precedent and cites the ruling (B3)`
  )
  assert(
    /B3/.test(r20aSrc) && /departure/i.test(r20aSrc),
    `${R20A_FILE}: records the AC5 departure from family precedent and cites the ruling (B3)`
  )
}

// =====================================================================
// TRAITS ARE CITED BY NAME, NEVER BY NUMBER
//
// The research is unnumbered — it has no list markers, no numerals, and runs
// as continuous prose. The synthesis's own "the eleventh trait" for
// behavioural flexibility was wrong (it is ninth by order of appearance). A
// number in user-facing copy would reproduce that error class.
// =====================================================================
{
  const vocabSrc = fs.readFileSync(path.join(websiteRoot, VOCAB_FILE), 'utf-8')
  const pageSrc = fs.readFileSync(path.join(websiteRoot, PAGE_FILE), 'utf-8')

  // All eleven committed traits are declared (C13 extensibility: the
  // vocabulary is wider than the wired set, so a new pathway needs no schema
  // change).
  const traitIds = [...vocabSrc.matchAll(/\{\s*id:\s*'([a-z_]+)',\s*name:/g)].map((m) => m[1])
  assert(
    traitIds.length >= 11,
    `${VOCAB_FILE}: all eleven committed traits are declared (found ${traitIds.length} id/name pairs in the trait block)`
  )

  // The page renders trait NAMES via traitName(), never a positional label.
  assert(
    /traitName\(/.test(pageSrc),
    `${PAGE_FILE}: renders trait names via traitName() (cite by name, never by number)`
  )
  // No user-facing ordinal for a trait.
  for (const ordinal of ['eleventh trait', 'ninth trait', 'trait #', 'Trait 1', 'Trait #']) {
    assert(
      !pageSrc.includes(ordinal),
      `${PAGE_FILE}: must not label a trait by number ('${ordinal}') — the research is unnumbered`
    )
  }

  // The reciprocity mode renders the MENTOR'S OWN questions, not re-authored
  // ones (B4: "build to it verbatim, do not re-author").
  assert(
    vocabSrc.includes('or in expected return?') &&
      vocabSrc.includes('if the expected return were removed?'),
    `${VOCAB_FILE}: carries the mentor's two reciprocity questions verbatim (B4)`
  )
  assert(
    /RECIPROCITY_QUESTIONS\.ground/.test(pageSrc) &&
      /RECIPROCITY_QUESTIONS\.counterfactual/.test(pageSrc),
    `${PAGE_FILE}: renders the mentor's reciprocity questions from the vocabulary, not re-typed prose`
  )

  // The reciprocity mode must NOT carry a sub-species — forcing it into that
  // shape would invent a sub-species (R7) or drop the pathway (B4).
  const reciprocityPathway = vocabSrc.slice(
    vocabSrc.indexOf("traitIds: ['reciprocity']"),
    vocabSrc.indexOf('] as const', vocabSrc.indexOf("traitIds: ['reciprocity']"))
  )
  assert(
    /narrowedSubSpecies:\s*\[\]/.test(reciprocityPathway),
    'vocabulary: the reciprocity pathway carries NO sub-species (B4 — it is not a passion sub-species)'
  )
}

// =====================================================================
// THE REFRAME IS VISIBLE AT THE POINT OF USE
//
// The mentor's requirement is that the practice NAME this explicitly: a
// practitioner who notices the impulse "is not failing — they are generating
// examination material." A tool that elicits shame without saying this is a
// materially different tool.
// =====================================================================
{
  const pageSrc = fs.readFileSync(path.join(websiteRoot, PAGE_FILE), 'utf-8')
  assert(
    /is not failing/.test(pageSrc) && /examination material/.test(pageSrc),
    `${PAGE_FILE}: states the reframe in the page's own copy ("is not failing" / "examination material")`
  )
  // SupportFooter is rendered in the LAYOUT (the shipped pattern), not the page.
  const layoutSrc = fs.readFileSync(path.join(websiteRoot, LAYOUT_FILE), 'utf-8')
  assert(
    /SupportFooter/.test(layoutSrc),
    `${LAYOUT_FILE}: renders SupportFooter (R20a §4 crisis exit)`
  )
  assert(
    !/SupportFooter/.test(pageSrc),
    `${PAGE_FILE}: does NOT render SupportFooter — it belongs in the layout (the shipped pattern)`
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
