/**
 * daily-rhythm-strip.test.tsx — a BEHAVIOURAL test of what the rhythm strip
 * actually renders, by server-rendering it to markup and reading the result.
 *
 * WHY THIS EXISTS. Phase 1 shipped with its honest-state contract pinned only
 * STRUCTURALLY — the pure fold was well covered, but nothing asserted that the
 * component then rendered those states differently, and the Phase 1 close named
 * that as an open gap. The rules this feature turns on are rendering rules:
 *
 *   - the doorbell appears for the NOT-YET state and no other
 *   - a failed read shows NO state, never "Not yet"
 *   - `days_absent` is computed and must never reach the page
 *
 * Every one of those is invisible to a test of the fold alone. A component that
 * ignored `state` entirely and printed the doorbell unconditionally would have
 * passed the whole Phase 4 unit suite.
 *
 * Run (from website/):
 *   npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/daily-rhythm-strip.test.tsx
 *
 * The extra tsconfig exists because the app's own `tsconfig.json` sets
 * `jsx: preserve` (Next.js does the transform at build time), which leaves esbuild
 * with no JSX runtime. The override sets `jsx: react-jsx` for this file alone; it
 * is inert for `next build`, which reads only `tsconfig.json`.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import DailyRhythmStrip from '../DailyRhythmStrip'
import { DAILY_RHYTHM_COPY, type DailyRhythmFold, type RhythmState } from '@/lib/practice-sequence'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(cond: boolean, label: string) {
  if (cond) { passed++; console.log('  PASS  ' + label) }
  else { failed++; failures.push(label); console.error('  FAIL  ' + label) }
}

/** Visible text only — so an assertion cannot be satisfied by a class name or a URL. */
function textOf(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function fold(
  morning: RhythmState,
  evening: RhythmState,
  returning = false,
  daysAbsent: number | null = null
): DailyRhythmFold {
  return {
    poles: [
      { id: 'morning', state: morning, last_used_at: null },
      { id: 'evening', state: evening, last_used_at: null },
    ],
    returning,
    days_absent: daysAbsent,
  }
}

const render = (f: DailyRhythmFold) => renderToStaticMarkup(<DailyRhythmStrip fold={f} />)

// ─── The doorbell appears for NOT-YET and nothing else ───

{
  const html = render(fold('not_yet_today', 'not_yet_today'))
  const t = textOf(html)
  assert(t.includes(DAILY_RHYTHM_COPY.morningDoorbell), 'R1a: not-yet renders the morning doorbell')
  assert(t.includes(DAILY_RHYTHM_COPY.eveningDoorbell), 'R1b: not-yet renders the evening doorbell')
  assert(t.includes(DAILY_RHYTHM_COPY.openLabel), 'R1c: and offers a way in')
  assert(!t.includes(DAILY_RHYTHM_COPY.doneLabel), 'R1d: and does not claim the thing is done')
  // The hrefs, asserted on the RAW markup — `textOf` strips attributes by
  // design, so R1c ("Open" is present) structurally cannot see where the link
  // goes. The adversarial review proved the gap: mutating the not-yet branch's
  // href to '/mornng' scored 358/0 and 43/0. J6 in the sibling suite proves the
  // CONSTANTS resolve to real pages, which is false assurance for this branch —
  // it says nothing about which branch uses them, and this is the branch the
  // doorbell actually renders in.
  assert(html.includes(`href="${DAILY_RHYTHM_COPY.morningHref}"`), 'R1e: the morning doorbell links where it says — a typo here ships as a doorbell opening onto a 404')
  assert(html.includes(`href="${DAILY_RHYTHM_COPY.eveningHref}"`), 'R1f: and so does the evening doorbell')
}
{
  const t = textOf(render(fold('done_today', 'done_today')))
  assert(t.includes(DAILY_RHYTHM_COPY.doneLabel), 'R2a: done renders the done state')
  assert(!t.includes(DAILY_RHYTHM_COPY.morningDoorbell), 'R2b: and NO morning doorbell — prompting someone to begin what they have finished is nagging, not scaffolding')
  assert(!t.includes(DAILY_RHYTHM_COPY.eveningDoorbell), 'R2c: and NO evening doorbell')
}

// ─── The unknown state renders as silence, and never as "not yet" ───

{
  const html = render(fold('unknown', 'unknown'))
  const t = textOf(html)
  assert(!t.includes(DAILY_RHYTHM_COPY.doneLabel), 'R3a: a failed read claims nothing was done')
  assert(!t.includes(DAILY_RHYTHM_COPY.morningDoorbell), 'R3b: and prompts nothing — it does not fall back to "not yet"')
  assert(t.includes(DAILY_RHYTHM_COPY.morningLabel), 'R3c: but the practice is still NAMED')
  assert(html.includes(`href="${DAILY_RHYTHM_COPY.morningHref}"`), 'R3d: and still reachable — a status outage must not take the door away')
  // Blank is honest but AMBIGUOUS on its own: the intro says a done thing
  // "simply says so", which invites reading silence as a no. The adversarial
  // review also established that the sibling module's outage banner provably
  // cannot cover a rhythm-only failure, so this strip has to say it itself.
  assert(t.includes(DAILY_RHYTHM_COPY.unavailableNote), 'R3e: and the outage is NAMED, so blankness is not read as "you did neither"')
}
{
  // One pole down, one fine — the partial case, which is the reachable one.
  const t = textOf(render(fold('done_today', 'unknown')))
  assert(t.includes(DAILY_RHYTHM_COPY.unavailableNote), 'R3f: a SINGLE unreadable pole is disclosed too, not only a total outage')
}
{
  const t = textOf(render(fold('done_today', 'not_yet_today')))
  assert(!t.includes(DAILY_RHYTHM_COPY.unavailableNote), 'R3g: and nothing is disclosed when both poles read cleanly')
}

// ─── Poles are independent (a mixed fold must not smear one state over both) ───

{
  const t = textOf(render(fold('done_today', 'not_yet_today')))
  assert(t.includes(DAILY_RHYTHM_COPY.doneLabel), 'R4a: mixed fold — the done pole says done')
  assert(t.includes(DAILY_RHYTHM_COPY.eveningDoorbell), 'R4b: mixed fold — the not-yet pole still rings')
  assert(!t.includes(DAILY_RHYTHM_COPY.morningDoorbell), 'R4c: mixed fold — and the done pole stays quiet')
}

// ─── The returning line ───

{
  const t = textOf(render(fold('not_yet_today', 'not_yet_today', true, 27)))
  assert(t.includes(DAILY_RHYTHM_COPY.returning), 'R5a: the returning line renders when returning is true')
}
{
  const t = textOf(render(fold('not_yet_today', 'not_yet_today', false, 3)))
  assert(!t.includes(DAILY_RHYTHM_COPY.returning), 'R5b: and is absent otherwise')
}
// `days_absent` is carried for testability and must never be shown — a day count
// is the lapsed-streak framing plan §11 forbids.
//
// Asserted against the RAW MARKUP, in EVERY state, in BOTH returning branches.
// The adversarial review found two holes in the earlier single assertion: it ran
// against `textOf`, which strips whole tags and so cannot see a count carried in
// an `aria-label`, `title` or `data-*` attribute (a screen reader would announce
// it); and it only covered returning=true, leaving the common case — every
// practitioner active within the fortnight — untested. Both are closed here.
for (const state of ['not_yet_today', 'done_today', 'unknown'] as RhythmState[]) {
  for (const returning of [true, false]) {
    const html = render(fold(state, state, returning, 4242))
    assert(
      !html.includes('4242'),
      `R6[${state}/returning=${returning}]: days_absent NEVER reaches the page — not as text, and not in an attribute`
    )
  }
}

// ─── The evening "via" note, which exists because the link under-describes it ───

{
  const t = textOf(render(fold('done_today', 'not_yet_today')))
  assert(t.includes(DAILY_RHYTHM_COPY.eveningVia), 'R7a: the not-yet evening pole explains that a reflection counts too')
}
{
  const t = textOf(render(fold('done_today', 'done_today')))
  assert(!t.includes(DAILY_RHYTHM_COPY.eveningVia), 'R7b: and does not repeat it once the review is done')
}
{
  // R7b alone does NOT pin what it appears to. It passes because the whole
  // not-yet branch is skipped when both poles are done — so a component that
  // attached the evening's note to EVERY pole would still satisfy it. Found by
  // mutation: `{copy.via && …}` → `{true && …}` survived R7a and R7b together.
  // The real property is that the note is per-pole, so it is counted, not
  // merely detected.
  const t = textOf(render(fold('not_yet_today', 'not_yet_today')))
  const occurrences = t.split(DAILY_RHYTHM_COPY.eveningVia).length - 1
  assert(occurrences === 1, `R7c: the via note belongs to the EVENING pole alone — expected exactly 1 occurrence with both poles not-yet, got ${occurrences}`)
}

// ─── No gamification reaches the rendered page (plan §11) ───

for (const state of ['not_yet_today', 'done_today', 'unknown'] as RhythmState[]) {
  const t = textOf(render(fold(state, state, true, 30))).toLowerCase()
  for (const bad of ['streak', 'congrat', 'well done', 'keep it up', '%', 'points', 'badge']) {
    assert(!t.includes(bad), `R8[${state}]: no gamification in the rendered output — '${bad}'`)
  }
}

// ─── Self-test: prove these assertions can actually fail ───

{
  const before = failed
  const realError = console.error
  console.error = () => {}
  assert(false, '(probe)')
  console.error = realError
  const fired = failed > before
  failed = before
  failures.length = Math.min(failures.length, before)
  assert(fired, 'SELF-TEST: assert() actually records a failure (this suite is not vacuous)')
}
{
  const t = textOf('<div class="streak">Hello <b>world</b></div>')
  assert(t === 'Hello world', 'SELF-TEST: textOf strips tags AND attributes, so a class name cannot satisfy a text assertion')
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
