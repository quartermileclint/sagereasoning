/**
 * stage-practices-list.test.tsx — a BEHAVIOURAL test of what
 * StagePracticesList actually renders (practice reminders Phase 3), by
 * server-rendering it to markup and reading the result.
 *
 * WHY THIS EXISTS. This component was extracted specifically so "no
 * prerequisite gating" (Step M verdict 2) is true BY CONSTRUCTION — it has no
 * access to earned-state at all. That structural claim is only worth
 * something if the component actually renders every stage's practices
 * correctly and the XOR-with-note behaviour genuinely holds; this suite
 * checks both, across ALL FIVE stages (not one representative fixture — a
 * per-stage loop is what would have caught the sibling StageCrossingCard
 * suite's own single-fixture gap, found by this session's adversarial
 * review and fixed alongside this file).
 *
 * Run (from website/):
 *   npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/stage-practices-list.test.tsx
 */

import { renderToStaticMarkup } from 'react-dom/server'
import * as fs from 'fs'
import * as path from 'path'
import StagePracticesList from '../StagePracticesList'
import { STAGE_PRACTICES } from '@/lib/practice-sequence'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(cond: boolean, label: string) {
  if (cond) { passed++; console.log('  PASS  ' + label) }
  else { failed++; failures.push(label); console.error('  FAIL  ' + label) }
}

function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

const PRACTICE_NAMES: Record<string, string> = {
  'view-from-above': 'The View From Above',
  oikeiosis: 'Expanding Your Circle of Concern',
  premeditatio: 'Preparing for Adversity',
  hupexairesis: 'The Reserve Clause',
  'sage-compass': 'The Sage Compass',
  morning: 'Morning Preparation',
  'passion-log': 'Passion Log',
}

// Every stage that HAS practices, both variants — a full parameterised sweep,
// not one representative fixture.

for (const stage of STAGE_PRACTICES.filter((s) => s.practices.length > 0)) {
  for (const variant of ['full', 'compact'] as const) {
    const html = renderToStaticMarkup(<StagePracticesList stagePractices={stage} variant={variant} />)
    const t = textOf(html)

    for (const practiceId of stage.practices) {
      assert(html.includes(`href="/${practiceId}"`), `P1[${stage.level}/${variant}]: links to /${practiceId}`)
      assert(t.includes(PRACTICE_NAMES[practiceId]), `P2[${stage.level}/${variant}]: ${practiceId}'s own name renders`)
    }
    assert(!t.includes(stage.note ?? ' NO_NOTE '), `P3[${stage.level}/${variant}]: the note does NOT render when practices exist (XOR)`)
  }
}

// Doorbells render on 'full', not on 'compact' (the deliberate visual difference).

{
  const wornPath = STAGE_PRACTICES.find((s) => s.level === 'habitual')!
  const fullHtml = renderToStaticMarkup(<StagePracticesList stagePractices={wornPath} variant="full" />)
  const compactHtml = renderToStaticMarkup(<StagePracticesList stagePractices={wornPath} variant="compact" />)
  assert(textOf(fullHtml).includes('Prepare for a difficulty before it arrives.'), 'V1: full variant renders the doorbell line')
  assert(!textOf(compactHtml).includes('Prepare for a difficulty before it arrives.'), 'V2: compact variant omits the doorbell line (a deliberate density difference, not a bug)')
  assert(compactHtml.includes('→'), 'V3: compact variant still carries the arrow affordance in its link label')
}

// The Inner Fire: zero practices, a note — the note renders on both variants
// and nothing else. The one real zero-practices case in current data.

{
  const fireStage = STAGE_PRACTICES.find((s) => s.level === 'sage_like')!
  assert(fireStage.practices.length === 0 && !!fireStage.note, 'N0: fixture sanity')
  for (const variant of ['full', 'compact'] as const) {
    const html = renderToStaticMarkup(<StagePracticesList stagePractices={fireStage} variant={variant} />)
    assert(textOf(html) === fireStage.note, `N1[${variant}]: renders ONLY the note text, nothing else`)
    assert(!html.includes('href='), `N2[${variant}]: no practice links render for a zero-practice stage`)
  }
}

// A synthetic zero-practices, zero-note input (unreachable via real
// STAGE_PRACTICES data today, since D12 in practice-sequence.test.ts pins
// practices-XOR-note as a standing invariant — this guards the component's
// OWN defensive branch in case that invariant is ever weakened).

{
  const synthetic = { level: 'reflexive' as const, stageName: 'Synthetic', stageSlug: 'synthetic', practices: [], note: null }
  const html = renderToStaticMarkup(<StagePracticesList stagePractices={synthetic} variant="full" />)
  assert(html === '', 'N3: a genuinely empty stage (no practices, no note) renders nothing at all')
}

// STRUCTURAL property: the component's prop signature carries no
// earned/selection state. A source-level pin, not a render one — the
// property under test is an ABSENCE (no such prop exists to gate on), which
// is what makes it structural.

{
  const src = fs.readFileSync(path.join(__dirname, '..', 'StagePracticesList.tsx'), 'utf-8')
  const start = src.indexOf('export default function StagePracticesList(')
  const propsBlock = src.slice(start, src.indexOf(') {', start))
  assert(
    !/earned|selectedMilestone|isEarned/i.test(propsBlock),
    "S1: StagePracticesList's own prop signature mentions no earned/selection concept — gating here would require a visible signature change"
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
