/**
 * suggested-practice-card.test.tsx — a BEHAVIOURAL test of what the in-session
 * suggestion card actually renders (practice reminders Phase 2, Step M), by
 * server-rendering it to markup and reading the result.
 *
 * WHY THIS EXISTS. The rules this feature turns on are rendering rules and the
 * copy IS the doorbell boundary:
 *
 *   - the card renders the pre-authored line VERBATIM and adds nothing —
 *     no heading, no framing, no verdict
 *   - the link goes exactly where the suggestion says (a typo'd href ships as
 *     a doorbell opening onto a 404 — the R1e lesson from the rhythm strip)
 *   - the SAME-TOOL case (the aischyne row: the log revisited, suggested from
 *     the log itself) renders the invitation line with NO navigation link —
 *     "a same-tool revisit renders as an invitation line on the entry, which
 *     is still a doorbell", not a loop
 *
 * A card that ignored `currentPracticeId` and always rendered the link would
 * pass every unit test in the sibling suite.
 *
 * Run (from website/):
 *   npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/suggested-practice-card.test.tsx
 */

import { renderToStaticMarkup } from 'react-dom/server'
import SuggestedPracticeCard from '../SuggestedPracticeCard'
import {
  resolvePassionClassification,
  resolveSageCompass,
  resolveViewFromAbove,
  type SuggestedPractice,
} from '@/lib/practice-sequence'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(cond: boolean, label: string) {
  if (cond) { passed++; console.log('  PASS  ' + label) }
  else { failed++; failures.push(label); console.error('  FAIL  ' + label) }
}

/**
 * Visible text only — so an assertion cannot be satisfied by a class name or a
 * URL. Also decodes the entities renderToStaticMarkup escapes (several lines
 * carry an apostrophe — "others' judgement" — which reaches the markup as
 * &#x27;; without decoding, a verbatim-line assertion would fail on exactly the
 * lines that most need pinning).
 */
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

// Real suggestions from the REAL resolvers — not hand-built fixtures — so the
// rendering is tested against exactly what the routes will send.
const agonia = resolvePassionClassification({ practitionerReading: 'agonia', engineReading: 'agonia' }) as SuggestedPractice
const aischyne = resolvePassionClassification({ practitionerReading: 'aischyne', engineReading: 'aischyne' }) as SuggestedPractice
const disclosure = resolvePassionClassification({ practitionerReading: 'penthos', engineReading: 'agonia' }) as SuggestedPractice
const logosRow = resolveSageCompass({ expressionQuality: 'vague', distanceReading: null, virtueEngaged: 'justice' }) as SuggestedPractice
const minimised = resolveViewFromAbove('minimised') as SuggestedPractice

assert(!!agonia && !!aischyne && !!disclosure && !!logosRow && !!minimised, 'S0: the resolver fixtures fire (sanity)')

// ─── The line renders verbatim, and the card adds nothing around it ───

{
  const html = renderToStaticMarkup(<SuggestedPracticeCard suggestion={agonia} currentPracticeId="passion-log" />)
  const t = textOf(html)
  assert(t.includes(agonia.line), 'S1a: the pre-authored line renders VERBATIM')
  assert(
    t.replace(agonia.line, '').replace('Preparing for Adversity →', '').trim() === '',
    'S1b: the card adds NOTHING beyond the line and the link — no heading, no framing, no verdict'
  )
  assert(html.includes(`href="${agonia.href}"`), 'S1c: the link goes exactly where the suggestion says (/premeditatio)')
  assert(t.includes('Preparing for Adversity'), 'S1d: the link is labelled with the practice\'s own live name')
}

// ─── The disclosure form renders both readings ───

{
  const t = textOf(renderToStaticMarkup(<SuggestedPracticeCard suggestion={disclosure} currentPracticeId="passion-log" />))
  assert(t.includes('You named this as Penthos (grief).'), 'S2a: the practitioner\'s reading is visible — never silently overruled')
  assert(t.includes('The engine read it as Agonia (anxiety).'), 'S2b: the engine\'s reading is visible — the disagreement named, not hidden')
  assert(t.includes('examining the difference'), 'S2c: the practice is framed as examining the GAP, not correcting the practitioner')
}

// ─── The same-tool case: an invitation line, not a navigation loop ───

{
  const html = renderToStaticMarkup(<SuggestedPracticeCard suggestion={aischyne} currentPracticeId="passion-log" />)
  assert(textOf(html).includes(aischyne.line), 'S3a: the aischyne invitation line renders')
  assert(!html.includes('href='), 'S3b: NO link when the target is the page the practitioner is already on — the revisit is an invitation, not a loop')
}
{
  // The same suggestion from a DIFFERENT tool (the score page) does link.
  const html = renderToStaticMarkup(<SuggestedPracticeCard suggestion={minimised} />)
  assert(html.includes('href="/passion-log"'), 'S3c: without a matching currentPracticeId the link renders normally')
}

// ─── The logos re-grounding row links to the named virtue's SECTION ───

{
  const html = renderToStaticMarkup(<SuggestedPracticeCard suggestion={logosRow} currentPracticeId="sage-compass" />)
  assert(html.includes('href="/logos#dikaiosyne"'), 'S4a: the row-11 link carries the virtue\'s section anchor, not the bare page (the Step M design note)')
  assert(textOf(html).includes('Logos'), 'S4b: labelled with the reading\'s own name')
}

// ─── Provenance rides as data, never as visible copy ───

{
  const html = renderToStaticMarkup(<SuggestedPracticeCard suggestion={agonia} />)
  assert(html.includes(`data-suggestion-basis="${agonia.basis}"`), 'S5a: the machine row key is on the element for tests and support')
  assert(!textOf(html).includes(agonia.basis), 'S5b: and never rendered as visible text — provenance is not prose')
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
