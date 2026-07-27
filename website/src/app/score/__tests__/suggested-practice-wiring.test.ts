/**
 * suggested-practice-wiring.test.ts — a source pin on the ONE call site that
 * wires row 13 (practice reminders Phase 2, Step M) into `/score`.
 *
 * WHY THIS EXISTS. `/score` is the one page among the seven Phase-2-wired
 * surfaces with NO server route to carry a `suggested_practice` response field
 * (the save is a client-side Supabase insert with no `/api/mentor/*` involved)
 * — so the suggestion is computed CLIENT-SIDE, at result render, directly from
 * the already-fetched evaluation. That call site sits in no
 * `human-practitioner-boundary` suite anywhere (this page legitimately imports
 * `stoic-brain` VALUES — PROXIMITY_COLORS, VIRTUE_EXPRESSIONS, etc. — and
 * predates the boundary-guard family entirely, so folding it into that family
 * would be a much larger, out-of-scope change). An independent adversarial
 * review named this a genuine, if disclosed, coverage gap: neither
 * `resolveScoreEvaluation`'s own unit tests (K14a-e in
 * `practice-sequence.test.ts`) nor `SuggestedPracticeCard`'s own render suite
 * exercise the actual WIRING — the one line that pipes the real evaluation
 * result into the real resolver and into the real component.
 *
 * This file closes exactly that gap, narrowly: it pins the call site's source
 * text (the resolver receives `passion_diagnosis.passions_detected.length` and
 * nothing else — never the passions array itself, never a hand-summed count;
 * a silent switch to a different count would slip past every other test) and
 * the render guard (the card is skipped entirely when the resolver returns
 * null — no card, no fallback, no visible placeholder).
 *
 * Self-contained (no shared imports) so it reverts independently.
 *
 * Run (from website/):
 *   npx tsx src/app/score/__tests__/suggested-practice-wiring.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

const websiteRoot = path.resolve(__dirname, '..', '..', '..', '..')
const pageFile = path.join(websiteRoot, 'src/app/score/page.tsx')

assert(fs.existsSync(pageFile), 'src/app/score/page.tsx exists')
const src = fs.readFileSync(pageFile, 'utf-8')

// The import: the resolver from the locked mapping, the card from the shared component.
assert(
  /import \{ resolveScoreEvaluation \} from '@\/lib\/practice-sequence'/.test(src),
  'the resolver is imported from @/lib/practice-sequence (the locked mapping), not re-implemented'
)
assert(
  /import SuggestedPracticeCard from '@\/components\/SuggestedPracticeCard'/.test(src),
  'the shared card component is imported, not a page-local reimplementation'
)

// The call site: EXACTLY passions_detected.length — never the array itself
// (which would silently change the resolver's contract from a count to an
// object), never a hand-summed alternative, never a different field.
assert(
  /const suggested = resolveScoreEvaluation\(result\.passion_diagnosis\.passions_detected\.length\)/.test(src),
  'the call site passes result.passion_diagnosis.passions_detected.length — the exact count the resolver expects, read from the real evaluation result'
)
assert(
  !/resolveScoreEvaluation\(result\.passion_diagnosis\.passions_detected\)/.test(src),
  'the call site does NOT pass the passions array itself (a type-shape regression the resolver would not catch, since it only checks Number.isFinite)'
)

// The render guard: absent on null, never a fallback/placeholder card.
assert(
  /return suggested \? <SuggestedPracticeCard suggestion=\{suggested\}\s*\/> : null/.test(src),
  'the card renders ONLY when the resolver fires; a null resolution renders nothing (honest silence, not a placeholder)'
)

// currentPracticeId is deliberately OMITTED here (unlike the six gated tool
// pages): row 13 always targets the passion log FROM the score page, which is
// never the practitioner's "current" practice tool in this app — there is no
// same-tool case to suppress a link for.
assert(
  !/<SuggestedPracticeCard suggestion=\{suggested\} currentPracticeId=/.test(src),
  'no currentPracticeId is passed — /score has no same-tool suggestion case (unlike the six gated tool pages)'
)

// The call is scoped inside the results block (gated on `result &&`), never
// reachable before an evaluation exists.
const resultGateIdx = src.indexOf('{result && proximityLevel && proximityDisplay && (')
const suggestionCallIdx = src.indexOf('const suggested = resolveScoreEvaluation(')
assert(
  resultGateIdx !== -1 && suggestionCallIdx !== -1 && suggestionCallIdx > resultGateIdx,
  'the suggestion call site sits INSIDE the { result && ... } results block — unreachable before an evaluation exists'
)

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
