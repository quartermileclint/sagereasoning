/**
 * stage-crossing-card.test.tsx — a BEHAVIOURAL test of what the stage-crossing
 * earn card actually renders (practice reminders Phase 3, Step M), by
 * server-rendering it to markup and reading the result.
 *
 * REVISED 2026-07-27 for the mentor's simultaneous-crossing verdict
 * (`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-verdict-
 * verbatim.md`, binding): `isPlural` is now a REQUIRED prop — every existing
 * render call below is updated to pass it explicitly (`false` for the
 * single-crossing sections, which are otherwise unchanged) — and a new
 * section (E) covers the plural form the verdict introduced.
 *
 * WHY THIS EXISTS, following the SuggestedPracticeCard precedent exactly: the
 * rules this feature turns on are rendering rules, and a unit pin on the copy
 * strings alone cannot see whether the CARD actually uses them correctly —
 *
 *   - the card names the stage as a CONDITION ("This is ⟨Stage Name⟩"), never
 *     a grade — no "you have reached", no congratulation, anywhere in the DOM
 *   - the PLURAL form (isPlural=true) discloses the plurality and names the
 *     CURRENT condition — never both forms at once, never the wrong one
 *   - each listed practice renders its OWN doorbell + a link to its OWN href
 *     (a typo'd href ships as a doorbell opening onto a 404)
 *   - the single-signal orientation line renders ONLY when the crossing
 *     carries at least one practice — The Inner Fire (zero practices) must
 *     render its OWN note instead, and must NOT ALSO render the orientation
 *     line (which would contradict "no longer needs the scaffolding")
 *   - the Stage-page link is present and points at the right slug
 *   - the dismiss control is present (its CLICK behaviour is React state, not
 *     directly observable via static SSR — see the note at D3 below)
 *
 * Run (from website/):
 *   npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/stage-crossing-card.test.tsx
 */

import { renderToStaticMarkup } from 'react-dom/server'
import StageCrossingCard from '../StageCrossingCard'
import {
  STAGE_PRACTICES,
  STAGE_CROSSING_ORIENTATION_LINE,
  STAGE_CROSSING_COPY,
  STAGE_CROSSING_PLURALITY_LEAD,
  composeStageCrossingLine,
  composePluralStageCrossingLine,
} from '@/lib/practice-sequence'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(cond: boolean, label: string) {
  if (cond) { passed++; console.log('  PASS  ' + label) }
  else { failed++; failures.push(label); console.error('  FAIL  ' + label) }
}

/** Visible text only, entity-decoded — matches SuggestedPracticeCard's own test helper. */
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

const stormStage = STAGE_PRACTICES.find((s) => s.level === 'reflexive')!
const wornPathStage = STAGE_PRACTICES.find((s) => s.level === 'habitual')!
const fireStage = STAGE_PRACTICES.find((s) => s.level === 'sage_like')!

assert(!!stormStage && !!wornPathStage && !!fireStage, 'D0: the three fixture stages exist (sanity)')

// ─── D1. The condition-not-grade line, verbatim, and the "never a grade" property ───
//
// Looped over EVERY stage, not one fixture. Found by the adversarial review:
// a single-fixture check here would pass even if the card hardcoded ONE
// stage's name into the composed line regardless of which stage it was
// actually given (mutation-verified: `composeStageCrossingLine(stage.stageName)`
// -> `composeStageCrossingLine('The Worn Path')` in StageCrossingCard.tsx
// survived a Worn-Path-only D1, since fixture and hardcode coincided there).

for (const stage of STAGE_PRACTICES) {
  const html = renderToStaticMarkup(<StageCrossingCard stage={stage} isPlural={false} />)
  const t = textOf(html)
  assert(t.includes(composeStageCrossingLine(stage.stageName)), `D1a[${stage.level}]: the composed condition line renders verbatim for THIS stage's own name`)
  assert(!/you have reached|you reached|congratulations|well done|good job/i.test(t), `D1b[${stage.level}]: no achievement/grade language anywhere in the rendered card`)
  assert(!t.includes(STAGE_CROSSING_PLURALITY_LEAD), `D1c[${stage.level}]: isPlural=false never renders the plurality sentence`)
}

// ─── D2. Every practice for a two-practice stage: own doorbell, own href ───

{
  const html = renderToStaticMarkup(<StageCrossingCard stage={wornPathStage} isPlural={false} />)
  const t = textOf(html)
  assert(t.includes('Preparing for Adversity'), 'D2a: premeditatio\'s name renders')
  assert(t.includes('Prepare for a difficulty before it arrives.'), 'D2b: premeditatio\'s OWN doorbell renders')
  assert(html.includes('href="/premeditatio"'), 'D2c: premeditatio links to its own page')
  assert(t.includes('The Reserve Clause'), 'D2d: hupexairesis\'s name renders')
  assert(t.includes('Hold an intention with the reserve clause attached.'), 'D2e: hupexairesis\'s OWN doorbell renders')
  assert(html.includes('href="/hupexairesis"'), 'D2f: hupexairesis links to its own page')
}

// ─── D3. The dismiss control is present (click behaviour is React state — not
//     directly observable via renderToStaticMarkup, which never runs an event
//     loop; the underlying signal's one-shot property is unit-tested in
//     stage-crossing.test.ts, and the "never a client store" design is
//     documented in practice-sequence.ts's Phase 3 section header). ───

{
  const html = renderToStaticMarkup(<StageCrossingCard stage={stormStage} isPlural={false} />)
  assert(textOf(html).includes(STAGE_CROSSING_COPY.dismissLabel), 'D3: the dismiss control renders with its pinned label')
}

// ─── D4. The orientation line fires when there IS a practice to orient toward ───

for (const stage of STAGE_PRACTICES) {
  if (stage.practices.length === 0) continue
  const t = textOf(renderToStaticMarkup(<StageCrossingCard stage={stage} isPlural={false} />))
  assert(
    t.includes(STAGE_CROSSING_ORIENTATION_LINE),
    `D4[${stage.level}]: the orientation line renders for a crossing that carries at least one practice`
  )
}

// ─── D5. The Inner Fire: its OWN note renders, the orientation line does NOT
//     (it would contradict "no longer needs the scaffolding"), and no
//     practice link is rendered since it has none. ───

{
  assert(fireStage.practices.length === 0 && !!fireStage.note, 'D5a: fixture sanity — The Inner Fire has zero practices and a note')
  const html = renderToStaticMarkup(<StageCrossingCard stage={fireStage} isPlural={false} />)
  const t = textOf(html)
  assert(t.includes(fireStage.note as string), 'D5b: The Inner Fire\'s own note renders in place of practices')
  assert(!t.includes(STAGE_CROSSING_ORIENTATION_LINE), 'D5c: the orientation line does NOT render for The Inner Fire — it would contradict the note\'s own claim')
  assert(!html.includes('href="/passion-log"') && !html.includes('href="/morning"'), 'D5d: no practice links render for a zero-practice crossing')
}

// ─── D6. The Stage-page link, present and correctly slugged, on every stage ───

for (const stage of STAGE_PRACTICES) {
  const html = renderToStaticMarkup(<StageCrossingCard stage={stage} isPlural={false} />)
  assert(html.includes(`href="/stages/${stage.stageSlug}"`), `D6[${stage.level}]: the Stage-page link points at /stages/${stage.stageSlug}`)
  assert(textOf(html).includes(`Visit ${stage.stageName} →`), `D6b[${stage.level}]: the Stage-page link is labelled "Visit ${stage.stageName} →"`)
}

// ─── D7. Provenance rides as a data attribute, never as visible copy ───

{
  const html = renderToStaticMarkup(<StageCrossingCard stage={stormStage} isPlural={false} />)
  assert(html.includes(`data-stage-crossing="${stormStage.stageSlug}"`), 'D7a: the stage slug is on the element for tests and support')
  assert(!textOf(html).includes(stormStage.stageSlug), 'D7b: and never rendered as visible text')
}

// ═════════════════════════════════════════════════════════════════════════
// E. The PLURAL form (isPlural=true) — the mentor's simultaneous-crossing
//    verdict, 2026-07-27.
// ═════════════════════════════════════════════════════════════════════════

// E1 — the plural line, verbatim, per stage. Looped over every stage for the
// same reason D1 is: a single fixture would not catch a hardcoded name.

for (const stage of STAGE_PRACTICES) {
  const html = renderToStaticMarkup(<StageCrossingCard stage={stage} isPlural={true} />)
  const t = textOf(html)
  assert(t.includes(composePluralStageCrossingLine(stage.stageName)), `E1a[${stage.level}]: the plural condition line renders verbatim for THIS stage's own name`)
  assert(!/you have reached|you reached|congratulations|well done|good job|improved|declined/i.test(t), `E1b[${stage.level}]: no achievement/grade/directional language anywhere in the plural card — the plurality is descriptive, not evaluative`)
}

// E2 — the two forms are mutually exclusive: isPlural=true never ALSO renders
// the single-crossing line, and vice versa (already covered by D1c above,
// restated here from the plural side for symmetry).

for (const stage of STAGE_PRACTICES) {
  const pluralHtml = renderToStaticMarkup(<StageCrossingCard stage={stage} isPlural={true} />)
  const pluralText = textOf(pluralHtml)
  assert(
    !pluralText.includes(`Something has shifted in how you are meeting difficulty. This is ${stage.stageName}.`),
    `E2[${stage.level}]: isPlural=true never renders the single-crossing form's exact opening`
  )
}

// E3 — everything ELSE about the card (practices, orientation line, dismiss,
// Stage-page link, provenance) is UNCHANGED by isPlural — only the headline
// sentence differs. Spot-checked on a two-practice stage.

{
  const html = renderToStaticMarkup(<StageCrossingCard stage={wornPathStage} isPlural={true} />)
  const t = textOf(html)
  assert(t.includes('Preparing for Adversity') && t.includes('The Reserve Clause'), 'E3a: both practices still render in the plural form')
  assert(t.includes(STAGE_CROSSING_ORIENTATION_LINE), 'E3b: the orientation line still renders in the plural form (isPlural does not affect this gate)')
  assert(t.includes(STAGE_CROSSING_COPY.dismissLabel), 'E3c: the dismiss control still renders in the plural form')
  assert(html.includes(`href="/stages/${wornPathStage.stageSlug}"`), 'E3d: the Stage-page link still renders in the plural form')
}

// E4 — The Inner Fire in the plural case: still its own note, still no
// orientation-line leak, now via the plural headline.

{
  const html = renderToStaticMarkup(<StageCrossingCard stage={fireStage} isPlural={true} />)
  const t = textOf(html)
  assert(t.includes(composePluralStageCrossingLine('The Inner Fire')), 'E4a: the plural headline renders for The Inner Fire too')
  assert(t.includes(fireStage.note as string), 'E4b: The Inner Fire\'s own note still renders in the plural form')
  assert(!t.includes(STAGE_CROSSING_ORIENTATION_LINE), 'E4c: the orientation line still does not leak in the plural form')
}

// E5 — provenance: the plurality itself rides as a data attribute, not visible copy.

{
  const singleHtml = renderToStaticMarkup(<StageCrossingCard stage={stormStage} isPlural={false} />)
  const pluralHtml = renderToStaticMarkup(<StageCrossingCard stage={stormStage} isPlural={true} />)
  assert(singleHtml.includes('data-stage-crossing-plural="false"'), 'E5a: isPlural=false is reflected in the data attribute')
  assert(pluralHtml.includes('data-stage-crossing-plural="true"'), 'E5b: isPlural=true is reflected in the data attribute')
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
