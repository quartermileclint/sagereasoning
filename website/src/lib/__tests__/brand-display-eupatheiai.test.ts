/**
 * Eupatheiai brand-display battery.
 *
 * The eupatheiai surfaces (glossary, /score, /passion-log) make a DOCTRINAL
 * claim to the user: "this passion's rational counterpart is X". A silent drift
 * between brand-display's table and the canonical corpus would therefore show a
 * false philosophical claim, not merely a wrong picture. This battery pins:
 *
 *   1. every eupatheia image exists on disk at the path the UI requests;
 *   2. the set matches stoic-brain's EUPATHEIAI exactly — no invented feeling;
 *   3. replacesRoot agrees with stoic-brain's own `replaces` prose (the claim is
 *      the corpus's, not brand-display's);
 *   4. lupe resolves to NOTHING — distress has no eupatheia. That absence is the
 *      doctrine, so it is asserted, not left to chance;
 *   5. an unknown root resolves to null rather than a plausible wrong answer;
 *   6. /passion-log's page-local PASSION_FAMILIES agrees with stoic-brain for all
 *      20 sub-species — that table is what the counterpart lookup rides on there.
 *
 * Run: npx tsx src/lib/__tests__/brand-display-eupatheiai.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { EUPATHEIA_DISPLAY, EUPATHEIA_IMAGE_MAP, getEupatheiaForRoot } from '../brand-display'
import { ROOT_PASSIONS, EUPATHEIAI } from '../stoic-brain'

let passed = 0
const failures: string[] = []
function assert(cond: boolean, msg: string) {
  if (cond) passed++
  else failures.push(msg)
}

const webRoot = path.resolve(__dirname, '../../..')

// --- 1. images exist on disk at the exact path the UI requests -------------
for (const e of EUPATHEIA_DISPLAY) {
  const onDisk = path.join(webRoot, 'public', decodeURIComponent(e.image))
  assert(fs.existsSync(onDisk), `${e.id}: image not on disk at ${onDisk}`)
}
assert(new Set(EUPATHEIA_DISPLAY.map(e => e.image)).size === EUPATHEIA_DISPLAY.length,
  'eupatheia images must be distinct — two feelings sharing an image is a display bug')

// --- 2. the set matches the canonical corpus exactly -----------------------
assert(EUPATHEIA_DISPLAY.length === EUPATHEIAI.length,
  `count mismatch: brand-display has ${EUPATHEIA_DISPLAY.length}, stoic-brain has ${EUPATHEIAI.length}`)
for (const e of EUPATHEIA_DISPLAY) {
  assert(EUPATHEIAI.some(x => x.id === e.id), `${e.id} is not a stoic-brain eupatheia`)
}
assert(Object.keys(EUPATHEIA_IMAGE_MAP).length === EUPATHEIA_DISPLAY.length,
  'EUPATHEIA_IMAGE_MAP must cover every eupatheia')

// --- 3. replacesRoot agrees with the corpus's own prose --------------------
for (const e of EUPATHEIA_DISPLAY) {
  assert(ROOT_PASSIONS.some(r => r.id === e.replacesRoot),
    `${e.id}.replacesRoot '${e.replacesRoot}' is not a ROOT_PASSIONS id`)
  const doctrine = EUPATHEIAI.find(x => x.id === e.id)
  assert(!!doctrine && doctrine.replaces.startsWith(e.replacesRoot),
    `${e.id}: replacesRoot '${e.replacesRoot}' contradicts stoic-brain replaces '${doctrine?.replaces}'`)
}

// --- 4 + 5. lupe is silent; unknowns are silent; everything else resolves ---
assert(getEupatheiaForRoot('lupe') === null,
  'lupe MUST have no counterpart — distress has no eupatheia (the absence is the doctrine)')
assert(getEupatheiaForRoot('not_a_root') === null,
  'an unknown root must return null, never a plausible wrong counterpart')
for (const r of ROOT_PASSIONS) {
  if (r.id === 'lupe') continue
  assert(getEupatheiaForRoot(r.id) !== null, `root '${r.id}' must resolve to a counterpart`)
}

// --- 6. /passion-log's local family table agrees with the corpus -----------
{
  const src = fs.readFileSync(path.join(webRoot, 'src/app/passion-log/page.tsx'), 'utf-8')
  const start = src.indexOf('const PASSION_FAMILIES')
  const end = src.indexOf('const PASSION_LABELS')
  assert(start !== -1 && end > start,
    'could not locate PASSION_FAMILIES in passion-log/page.tsx — this check must not silently pass')
  const block = src.slice(start, end)

  const canonicalRoot: Record<string, string> = {}
  for (const r of ROOT_PASSIONS) for (const s of r.sub_species) canonicalRoot[s.id] = r.id

  let seen = 0
  for (const m of block.matchAll(/(\w+):\s*\{[\s\S]*?types:\s*\[([^\]]*)\]/g)) {
    const family = m[1]
    const types = m[2].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean)
    for (const t of types) {
      seen++
      assert(canonicalRoot[t] === family,
        `passion-log places '${t}' under '${family}' but stoic-brain says '${canonicalRoot[t] ?? 'UNKNOWN'}' — ` +
        `the counterpart shown on /passion-log would be doctrinally wrong`)
    }
  }
  // Non-vacuity: a regex that matched nothing would make the loop above silently green.
  assert(seen === Object.keys(canonicalRoot).length,
    `expected to check all ${Object.keys(canonicalRoot).length} sub-species, only saw ${seen} — the parse is not covering the table`)
}

// --- non-vacuity floor: prove assert() can actually fail -------------------
{
  const before = failures.length
  assert(getEupatheiaForRoot('lupe') !== null, '__probe__')
  const probeFired = failures.length === before + 1 && failures[failures.length - 1] === '__probe__'
  failures.pop()
  if (!probeFired) failures.push('NON-VACUITY: assert() did not register a known-false claim — this battery is not guarding anything')
  else passed++
}

console.log(
  `roots -> counterparts: ` +
  ROOT_PASSIONS.map(r => `${r.id}->${getEupatheiaForRoot(r.id)?.id ?? 'none'}`).join(', ')
)
console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
}
