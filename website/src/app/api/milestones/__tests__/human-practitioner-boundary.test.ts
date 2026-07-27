/**
 * human-practitioner-boundary.test.ts — import-boundary guard for the
 * milestones / stage-crossing surface (practice reminders, human plan Phase 3
 * — the stage-crossing trigger), added because this session is the first to
 * touch `MilestonesDisplay.tsx` and `/stages/[slug]` with reminders-arc code;
 * neither had ANY boundary guard before.
 *
 * PURPOSE (mentor verdict D6, the family pattern): the human surface must NOT
 * import any part of the measured agent instrument — it must not touch
 * /api/reason or the signed assessment.
 *
 * WHY `score/page.tsx` IS NOT A TARGET FILE HERE, EVEN THOUGH THIS SESSION
 * EDITS IT TOO. `score/page.tsx` directly VALUE-imports `VIRTUE_EXPRESSIONS`,
 * `PROXIMITY_LEVELS` and `EVALUATIVE_DISCLAIMER` from `@/lib/stoic-brain` —
 * pre-dating the whole "Remaining Principles" import-boundary discipline this
 * family follows, and it is the product's core evaluation flow, not itself a
 * reminders-arc file. Retrofitting a full guard onto it is its OWN decision
 * (named as a carried-forward gap in the Phase 3 hand-off prompt, itself a
 * companion artefact of the Phase 2 close — precisely which prior record
 * named it, corrected here after the adversarial review checked the citation
 * rather than trusting it), out of scope here. What IS in scope, and checked
 * below in the "score/page.tsx wiring" section: this session's OWN two new
 * imports there are clean, and the one pre-existing stoic-brain import is
 * pinned to its EXACT current clause so a future addition to that statement
 * still fails.
 *
 * WHY THE STANDARD (not the stricter practice-status-family) FORBIDDEN LIST.
 * `practice-status`'s own guard additionally forbids `brand-display` and
 * `milestones` — a constraint specific to keeping THAT family decoupled from
 * both. This family's whole reason for existing is `milestones.ts` (the
 * award/read data) and `brand-display.ts` (STAGE_DISPLAY, PROXIMITY_COLORS) —
 * both legitimate, pre-existing, direct dependencies here.
 *
 * WHY `dashboard/page.tsx` IS NOT A TARGET FILE EITHER, though it renders
 * MilestonesDisplay. This session does not edit dashboard/page.tsx at all —
 * MilestonesDisplay owns all the new logic internally, and dashboard/page.tsx
 * already imported it before this session. Its own one-hop graph pulls in
 * several OTHER pre-existing files with their own (legitimate) stoic-brain
 * references — `baseline-assessment.ts`, `PracticeCalendar.tsx` — that this
 * session neither wrote nor is verifying. Guarding an untouched file's whole
 * pre-existing dependency tree is a separate decision from guarding what this
 * session actually built.
 *
 * Self-contained (no shared imports) so this PR reverts independently.
 * No API key, no network, no --env-file — it only reads source text.
 *
 * Run (from website/):
 *   npx tsx src/app/api/milestones/__tests__/human-practitioner-boundary.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/app/api/milestones/__tests__/ (5 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..', '..')

// The milestones / stage-crossing surface: the route, its data module, the
// new pure resolver, the three components it feeds (including
// StagePracticesList — extracted mid-session from MilestonesDisplay's and
// the Stage page's near-duplicated rendering, after the adversarial review
// found the ORIGINAL inline version's "no prerequisite gating" property was
// guarded only by a source-text pin a plausible refactor could defeat), and
// the page that renders a stage on its own (the dashboard renders a stage
// via MilestonesDisplay, already covered — see the header for why
// dashboard/page.tsx itself is not separately a target).
const TARGET_FILES = [
  'src/app/api/milestones/route.ts',
  'src/lib/milestones.ts',
  'src/lib/stage-crossing.ts',
  'src/components/MilestonesDisplay.tsx',
  'src/components/StageCrossingCard.tsx',
  'src/components/StagePracticesList.tsx',
  'src/app/stages/[slug]/page.tsx',
]

// Forbidden module-path substrings — matched against import/export specifiers.
// Deliberately the STANDARD list (see the header) — no `brand-display` or
// `milestones` entry, both legitimate here.
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
  'sage-reason-engine',
]

const FORBIDDEN_SYMBOLS = ['assessKathekon']

// No TARGET_FILE here has a direct (hop-zero) forbidden import — unlike
// score/page.tsx (handled separately below) and dashboard/page.tsx (out of
// scope, see the header), so there is no ALLOWED_PREEXISTING entry needed.

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

/**
 * If `source` references stoic-brain at all (directly, on a TARGET_FILE
 * itself, or a hop away on a shared helper — the same check either way),
 * every such import LINE must be TYPE-ONLY. `milestones.ts` and
 * `brand-display.ts` both carry exactly this shape (a `KatorthomaProximityLevel`
 * type reference); neither may ever become a VALUE import without this
 * failing first. Returns the exact specifiers found, so the caller can treat
 * them as THIS file's local exemption from the blanket forbidden-substring
 * sweep — verifying type-only IS the exemption's condition, not a bypass.
 */
function verifiedTypeOnlyStoicBrainSpecifiers(source: string, refs: ImportRef[], contextLabel: string): string[] {
  const specifiers = [...new Set(refs.filter((r) => r.specifier.includes('stoic-brain')).map((r) => r.specifier))]
  if (specifiers.length === 0) return []
  const sbLines = source.split('\n').filter((l) => /from\s+['"][^'"]*stoic-brain['"]/.test(l))
  assert(
    sbLines.length > 0 &&
      sbLines.every((l) => l.trimStart().startsWith('import type ') && (l.match(/\bimport\b/g) ?? []).length === 1),
    `${contextLabel}: every stoic-brain import line must be TYPE-ONLY (lines: ${sbLines.map((l) => l.trim()).join(' | ') || 'none found'})`
  )
  return specifiers
}

assert(fs.existsSync(path.join(websiteRoot, 'package.json')), `websiteRoot resolves to website/ (found package.json)`)

for (const rel of TARGET_FILES) {
  const full = path.join(websiteRoot, rel)
  assert(fs.existsSync(full), `${rel} (file exists)`)
  if (!fs.existsSync(full)) continue

  const source = fs.readFileSync(full, 'utf-8')
  const refs = extractImports(source)
  const sbAllow = verifiedTypeOnlyStoicBrainSpecifiers(source, refs, rel)
  checkImports(refs, rel, sbAllow)

  // One-hop follow of LOCAL imports — catches a shared helper that re-exports
  // a forbidden module.
  const dir = path.dirname(full)
  for (const { specifier } of refs) {
    const local = resolveLocal(specifier, dir)
    if (!local) continue
    const helperSource = fs.readFileSync(local, 'utf-8')
    const helperRel = path.relative(websiteRoot, local)
    const helperRefs = extractImports(helperSource)
    const helperSbAllow = verifiedTypeOnlyStoicBrainSpecifiers(helperSource, helperRefs, `${rel} → (one hop) ${helperRel}`)
    checkImports(helperRefs, `${rel} → (one hop) ${helperRel}`, helperSbAllow)
  }
}

// ─── The route's write contract — this whole family depends on it ───
//
// Not a claim that the route is read-only (it upserts on award, unlike its
// sibling routes' read-only pattern) — a contract pin instead: the field name
// `resolveNewlyEarnedStage` and every caller of the POST response reads.
{
  const routeSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/api/milestones/route.ts'), 'utf-8')
  assert(
    (routeSrc.match(/new_milestones:/g) ?? []).length >= 3,
    'api/milestones/route.ts: the POST response still names the field `new_milestones` on every return path (the success path, the zero-new path, and the fail-honest paths) — the contract every Phase 3 caller reads'
  )
}

// ─── MilestonesDisplay.tsx wiring — logic embedded in a stateful, fetch-driven
//     component that the render-suite pattern (renderToStaticMarkup with fully
//     resolved props) cannot reach, per the passion-log "Phase 2 wiring pins"
//     precedent. ───

{
  const displaySrc = fs.readFileSync(path.join(websiteRoot, 'src/components/MilestonesDisplay.tsx'), 'utf-8')

  assert(
    /import\s*\{[^}]*\bresolveNewlyEarnedStage\b[^}]*\}\s*from\s*'@\/lib\/stage-crossing'/.test(displaySrc),
    'MilestonesDisplay.tsx: resolveNewlyEarnedStage is imported from @/lib/stage-crossing, not re-implemented'
  )
  assert(
    /import\s+StageCrossingCard\s+from\s+'\.\/StageCrossingCard'/.test(displaySrc),
    'MilestonesDisplay.tsx: StageCrossingCard is imported from the shared component, not a local reimplementation'
  )
  assert(
    /postRes\.ok/.test(displaySrc) && /postData\?\.new_milestones/.test(displaySrc),
    'MilestonesDisplay.tsx: the award POST response is actually READ (ok-checked, json-parsed), not merely fired and discarded as it was before Phase 3'
  )
  // The mentor's simultaneous-crossing verdict (2026-07-27): the resolver now
  // takes the practitioner's most-recent-evaluation level as a REQUIRED
  // second argument (the current-condition signal) — never the highest of
  // whatever new_milestones reports. Pinned so a future edit cannot silently
  // drop it back to a one-argument call.
  assert(
    /resolveNewlyEarnedStage\(\s*postData\.new_milestones\s*,\s*mostRecentProximity\s*\)/.test(displaySrc),
    'MilestonesDisplay.tsx: resolveNewlyEarnedStage is called with BOTH the new_milestones list AND mostRecentProximity — the current-condition signal, never omitted'
  )
  assert(
    /\{stageCrossing\s*&&\s*<StageCrossingCard\s+stage=\{stageCrossing\.stage\}\s+isPlural=\{stageCrossing\.isPlural\}\s*\/>\}/.test(displaySrc),
    'MilestonesDisplay.tsx: the earn card renders conditionally on stageCrossing, never unconditionally, and passes BOTH stage and isPlural through'
  )
  // mostRecentProximity is a prop, not a fetch — this component must not
  // independently query evaluations (the PracticeSequenceModule/
  // DailyRhythmStrip precedent this codebase already follows: avoid doubling
  // a shared rate-limit bucket's consumption to re-fetch bytes the parent
  // already has).
  assert(
    /mostRecentProximity\s*:\s*ProximityLevel\s*\|\s*null/.test(displaySrc),
    'MilestonesDisplay.tsx: mostRecentProximity is typed as a required prop (ProximityLevel | null), not fetched internally'
  )
  assert(
    !/from\('action_evaluations_v3'\)/.test(displaySrc),
    'MilestonesDisplay.tsx: no direct query against action_evaluations_v3 — the current-condition signal comes from the parent, never re-fetched here'
  )

  // Item 3 — the stage-panel detail links, via StagePracticesList.
  //
  // FIRST DRAFT OF THIS PIN, RECORDED RATHER THAN QUIETLY REPLACED: the
  // original version checked (a) that the practices-XOR-note branches were
  // ONE connected source expression, and (b) that no `earnedIds.has(...)`
  // check gated the practice links — both as source-text regexes over
  // MilestonesDisplay.tsx's inline rendering. Adversarial review found BOTH
  // were defeatable: (a) survived this session's own mutation testing on
  // first write (M8 — an independent-substring check missed a mutation that
  // rendered the note ALONGSIDE practices rather than instead of them); (b)
  // a plausible, non-adversarial refactor (hoisting the earned-check into a
  // named variable a few lines above) would silently reintroduce gating
  // while leaving the literal substring `earnedIds.has(selectedMilestone)`
  // absent from the slice the negative check reads.
  //
  // FIX: the rendering was EXTRACTED to `StagePracticesList` — a component
  // whose own props carry no earned/selection concept at all (verified
  // independently in `stage-practices-list.test.tsx`'s S1 pin, and by this
  // suite's own TARGET_FILES sweep above, which follows its imports too). No
  // prerequisite gating is now true by construction for this render, not by
  // an absence-check that can go stale. What remains to verify HERE is only
  // that MilestonesDisplay actually delegates to it, with the right data.
  assert(
    /import\s+StagePracticesList\s+from\s+'\.\/StagePracticesList'/.test(displaySrc),
    'MilestonesDisplay.tsx: StagePracticesList is imported from the shared component, not a local reimplementation'
  )
  assert(
    /\{selectedStagePractices\s*&&\s*\(\s*<StagePracticesList\s+stagePractices=\{selectedStagePractices\}\s+variant="compact"\s*\/>/.test(displaySrc),
    'MilestonesDisplay.tsx: the detail panel delegates to StagePracticesList with the resolved stage and the compact variant — not a reimplemented inline render'
  )
  assert(
    !/selectedPractices\b/.test(displaySrc),
    'MilestonesDisplay.tsx: no local selectedPractices derivation survives — the practices-vs-note decision is made entirely inside StagePracticesList now, not duplicated here'
  )
}

// ─── score/page.tsx wiring (see the header for why this is NOT a full TARGET_FILE) ───

{
  const scoreSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/score/page.tsx'), 'utf-8')

  assert(
    /import\s*\{[^}]*\bresolveNewlyEarnedStage\b[^}]*\}\s*from\s*'@\/lib\/stage-crossing'/.test(scoreSrc),
    'score/page.tsx: resolveNewlyEarnedStage is imported from @/lib/stage-crossing (the locked resolver), not re-implemented'
  )
  assert(
    /import\s+StageCrossingCard\s+from\s+'@\/components\/StageCrossingCard'/.test(scoreSrc),
    'score/page.tsx: StageCrossingCard is imported from the shared component, not a page-local reimplementation'
  )

  // The mentor's simultaneous-crossing verdict (2026-07-27): the resolver now
  // takes the practitioner's most-recent-evaluation level as a REQUIRED
  // second argument. On THIS page the just-submitted evaluation IS that most
  // recent evaluation — `evalResult` (the local const), NEVER the `result`
  // React state (which would risk a stale read from inside this closure).
  assert(
    /resolveNewlyEarnedStage\(\s*data\.new_milestones\s*,\s*evalResult\.virtue_quality\.katorthoma_proximity\s*\)/.test(scoreSrc),
    'score/page.tsx: resolveNewlyEarnedStage is called with evalResult\'s own level (the local const, never the result React state) as the current-condition signal'
  )
  assert(
    !/resolveNewlyEarnedStage\([^)]*\bresult\.virtue_quality/.test(scoreSrc),
    'score/page.tsx: the resolver call never reads the `result` state variable — only the local evalResult const (stale-closure guard)'
  )
  assert(
    /\{stageCrossing\s*&&\s*<StageCrossingCard\s+stage=\{stageCrossing\.stage\}\s+isPlural=\{stageCrossing\.isPlural\}\s*\/>\}/.test(scoreSrc),
    'score/page.tsx: the earn card renders conditionally on stageCrossing, never unconditionally, and passes BOTH stage and isPlural through'
  )

  // HIGH-severity fix, source-grepped because it is interactive React state
  // no static render can exercise: found by adversarial review — a SECOND
  // evaluation in the same visit, without navigating away, re-rendered the
  // card from the FIRST evaluation's stage crossing (StageCrossingCard
  // unmounts/remounts as `result` cycles null->populated, resetting its
  // internal `dismissed` state, but its `stage` prop kept pointing at
  // whatever was last observed) — the exact stale-suggestion-card bug class
  // an earlier phase in this arc already found and fixed once, reproduced
  // here. `setStageCrossing(null)` must sit in the SAME reset block as the
  // other per-evaluation resets (`setResult(null)`, `setSaved(false)`, …),
  // not merely exist somewhere in the file.
  const evalResetStart = scoreSrc.indexOf('setResult(null)')
  assert(evalResetStart > 0, 'score/page.tsx: the per-evaluation reset block still exists at its expected marker (if restructured, update this pin)')
  // Span measured directly against the shipped file (612 chars, including the
  // explanatory comment above the reset call) with headroom, same discipline
  // as INV-2 in milestone-check-data.test.ts.
  assert(
    scoreSrc.slice(evalResetStart, evalResetStart + 800).includes('setStageCrossing(null)'),
    'score/page.tsx: stageCrossing is reset in the SAME block as the other per-evaluation state — a second evaluation in one visit must not resurface a stale crossing card'
  )

  // The ONE pre-existing stoic-brain import, pinned to its EXACT current
  // clause — a documented exception, not a blank cheque. A future addition to
  // this statement (a new name on the same line) must fail here first.
  const stoicBrainImport = extractImports(scoreSrc).find((r) => r.specifier === '@/lib/stoic-brain')
  assert(stoicBrainImport !== undefined, 'score/page.tsx: the pre-existing @/lib/stoic-brain import is still present (if this fails because it was REMOVED, this whole pin can be deleted)')
  if (stoicBrainImport) {
    const names = stoicBrainImport.clause
      .replace(/[{}\n]/g, ' ')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .sort()
    const expected = ['EVALUATIVE_DISCLAIMER', 'PROXIMITY_LEVELS', 'VIRTUE_EXPRESSIONS', 'type KatorthomaProximityLevel'].sort()
    assert(
      JSON.stringify(names) === JSON.stringify(expected),
      `score/page.tsx: the pre-existing stoic-brain import carries EXACTLY these four names (a new one is a NEW risk, not covered by this session's build) — expected ${JSON.stringify(expected)}, got ${JSON.stringify(names)}`
    )
  }

  // The rest of score/page.tsx's imports, checked against the same forbidden
  // list, with ONLY the pinned stoic-brain specifier exempted.
  checkImports(extractImports(scoreSrc), 'score/page.tsx', ['@/lib/stoic-brain'])
}

// ─── dashboard/page.tsx wiring — the mentor's simultaneous-crossing verdict
//     (2026-07-27) is the FIRST time this session touches dashboard/page.tsx
//     at all (one new line: the mostRecentProximity prop). See the file
//     header for why this remains a targeted wiring check rather than a full
//     TARGET_FILES member — its one-hop graph pulls in other pre-existing
//     files (baseline-assessment.ts, PracticeCalendar.tsx) with their own
//     stoic-brain references this session did not write and is not
//     verifying; the type-only checker above already confirmed
//     dashboard/page.tsx's OWN direct reference is safe. ───

{
  const dashSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/dashboard/page.tsx'), 'utf-8')
  assert(
    /mostRecentProximity=\{evaluations\[0\]\?\.katorthoma_proximity\s*\?\?\s*null\}/.test(dashSrc),
    'dashboard/page.tsx: MilestonesDisplay receives mostRecentProximity from the ALREADY-FETCHED evaluations[0] — not a new query, not omitted'
  )
  assert(
    !/from\('action_evaluations_v3'\)\.select[^;]*;[\s\S]{0,200}mostRecentProximity/.test(dashSrc),
    'dashboard/page.tsx: no SECOND query against action_evaluations_v3 was added to supply this prop (sanity — the existing evaluations state is reused)'
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
