/**
 * resolve-passion-image.test.ts — regression battery for
 * brand-display.ts's resolvePassionImage, added 2026-08-02.
 *
 * WHY THIS EXISTS. The scoring engine's prompt places no constraint on
 * `passions_detected[].id` (a guarded file this module must not import or
 * edit — see brand-display.ts's module comment), so real production rows
 * carry opaque placeholders like "P1"/"P2" rather than a sub-species id.
 * `resolvePassionImage` is the display-layer fallback: it tries the id
 * directly, then scans `name`/`sub_species` for a known Greek id or English
 * label as a whole word.
 *
 * THE FIRST VERSION OF THIS FUNCTION SHIPPED WITH A KEY/VALUE SWAP that
 * silently defeated every one of the 6 real production action-evaluation rows
 * tested against it — caught only by testing against real data before wiring
 * it into any page, not by tsc or a build. Every fixture below is a VERBATIM
 * row (or the exact shape of one) read read-only from production on
 * 2026-08-02, specifically so a regression of that class fails loudly here
 * rather than silently in the UI.
 *
 * Run (from website/):
 *   npx tsx src/lib/__tests__/resolve-passion-image.test.ts
 */

import { resolvePassionImage, PASSION_IMAGE_MAP } from '../brand-display'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// ─── Real production action_evaluations_v3 rows (id is an opaque placeholder;
// the Greek sub-species id is embedded in `name`) ───
const REAL_ACTION_ROWS: Array<{ row: { id: string; name: string; root_passion: string }; expectId: string }> = [
  { row: { id: 'P1', name: 'epithumia — orge (frustrated impulse toward action)', root_passion: 'epithumia' }, expectId: 'orge' },
  { row: { id: 'P2', name: 'epithumia — pothos (longing to continue the project)', root_passion: 'epithumia' }, expectId: 'pothos' },
  { row: { id: 'P3', name: 'hedone — kelesis (the pull of a solution that flatters two desires at once)', root_passion: 'hedone' }, expectId: 'kelesis' },
  { row: { id: 'P4', name: 'phobos — oknos (reluctance to face the discomfort of waiting)', root_passion: 'phobos' }, expectId: 'oknos' },
  { row: { id: 'P1', name: "philedonia (love of one's own method / pleasure in correctness)", root_passion: 'epithumia' }, expectId: 'philedonia' },
  { row: { id: 'P2', name: 'philodoxia (attachment to being seen as the one who does it right)', root_passion: 'epithumia' }, expectId: 'philodoxia' },
]

for (const { row, expectId } of REAL_ACTION_ROWS) {
  const img = resolvePassionImage(row)
  assert(img === PASSION_IMAGE_MAP[expectId], `real action row (id='${row.id}') resolves to ${expectId}'s image — got ${img}`)
}

// ─── Real reflections rows (no id/name at all — `sub_species` only, sometimes
// the Greek id verbatim, sometimes an English word) ───
const REAL_REFLECTION_ROWS: Array<{ row: { sub_species: string; root_passion: string }; expectId: string }> = [
  { row: { sub_species: 'agonia', root_passion: 'fear' }, expectId: 'agonia' },
  { row: { sub_species: 'timidity', root_passion: 'fear' }, expectId: 'oknos' },
  { row: { sub_species: 'oknos', root_passion: 'aversion' }, expectId: 'oknos' },
]

for (const { row, expectId } of REAL_REFLECTION_ROWS) {
  const img = resolvePassionImage(row)
  assert(img === PASSION_IMAGE_MAP[expectId], `real reflection row (sub_species='${row.sub_species}') resolves to ${expectId}'s image — got ${img}`)
}

// ─── The direct-id path (works when the field happens to be a real sub-species id) ───
assert(resolvePassionImage({ id: 'orge' }) === PASSION_IMAGE_MAP.orge, 'a literal sub-species id in `id` resolves directly')
assert(resolvePassionImage({ id: 'ORGE' }) === PASSION_IMAGE_MAP.orge, 'the direct-id path is case-insensitive')

// ─── Negative controls — must resolve null, never a wrong image ───
assert(resolvePassionImage({ id: 'P9', name: 'a vague unrelated impulse' }) === null, 'nothing recognisable resolves to null, not a guess')
assert(resolvePassionImage({}) === null, 'an empty passion object resolves to null')
assert(resolvePassionImage({ id: '', name: '', sub_species: '' }) === null, 'empty-string fields resolve to null, not a crash')

// ─── Word-boundary discipline: a substring must not falsely match ───
// 'eros' must not match inside a longer word that happens to contain it.
assert(resolvePassionImage({ name: 'the heroes returned' }) === null, "'eros' does not falsely match inside 'heroes' (word-boundary discipline)")
// 'pity' must not match inside 'stupidity'.
assert(resolvePassionImage({ name: 'a moment of stupidity' }) === null, "'pity' does not falsely match inside 'stupidity'")

// ─── Every one of the 20 canonical ids resolves via its own English label ───
const ENGLISH_LABEL_BY_ID: Record<string, string> = {
  orge: 'anger', eros: 'erotic', pothos: 'longing', philedonia: 'pleasure',
  philoplousia: 'wealth', philodoxia: 'honour', kelesis: 'enchantment',
  epichairekakia: 'malicious', terpsis: 'amusement', deima: 'terror',
  oknos: 'timidity', aischyne: 'shame', thambos: 'dread', thorybos: 'panic',
  agonia: 'agony', eleos: 'pity', phthonos: 'envy', zelotypia: 'jealousy',
  penthos: 'grief', achos: 'anxiety',
}
assert(Object.keys(ENGLISH_LABEL_BY_ID).length === Object.keys(PASSION_IMAGE_MAP).length, 'NON-VACUITY: this test\'s English-label fixture covers every id PASSION_IMAGE_MAP has — if a passion is added to one without the other, this must fail rather than silently under-testing')
for (const [id, word] of Object.entries(ENGLISH_LABEL_BY_ID)) {
  const img = resolvePassionImage({ name: `Something about ${word} here` })
  assert(img === PASSION_IMAGE_MAP[id], `English label '${word}' resolves to ${id}'s image — got ${img}`)
}

// ─── SELF-TEST: assert() can fail ───
{
  const before = failed
  assert(false, '__probe__')
  const fired = failed === before + 1
  failed = before
  failures.pop()
  if (!fired) { failed++; failures.push('SELF-TEST: assert() did not register a known-false claim') }
  else passed++
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
}
