/**
 * practice-sequence.test.ts — the Phase 1 sequence data + pure helpers.
 *
 * WHAT THIS PINS, and why each pin exists rather than being decorative:
 *
 *  A. The mentor's order, verbatim (plan §1 constraint 4), including the
 *     view-from-above + oikeiosis PAIRING as a shared ordinal.
 *  B. The tracked/untracked split — exactly one untracked step, `/logos`, first.
 *     `/logos` is a reading with no row anywhere, so it can never be marked met;
 *     asserting that keeps a future edit from inventing a status for it.
 *  C. Source-table completeness in BOTH directions, so a practice can never be
 *     added without a table (silently never met) or a table orphaned.
 *  D. The stage↔practice mapping, cross-checked against the CANONICAL vocabulary
 *     imported from brand-display. `practice-sequence.ts` may not import that
 *     module (it is in /welcome's graph), so it declares its own copy — and this
 *     test is where the copy is held to the original. A test file is not in any
 *     guarded import graph, so importing the canonical source HERE is free.
 *  E. `nextInSequence` behaviour, including the untracked-skip and the
 *     no-mutation property.
 *  F. Every user-visible string, asserted as an EXPORTED VALUE. Source-substring
 *     matching is not sufficient: a comment or an identifier satisfies it (the
 *     standing `content pins assert exported values` lesson).
 *  G. Every href resolves to a real page on disk — a typo'd href would otherwise
 *     ship as a doorbell that opens onto a 404.
 *  H. The no-gamification rule (plan §11) over the copy itself.
 *
 * Run (from website/):
 *   npx tsx src/lib/__tests__/practice-sequence.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  PRACTICE_SEQUENCE,
  TRACKED_PRACTICE_SEQUENCE,
  PRACTICE_SOURCE_TABLES,
  RHYTHM_TABLES,
  PROXIMITY_LEVEL_ORDER,
  STAGE_PRACTICES,
  PRACTICE_MODULE_COPY,
  WELCOME_SEQUENCE_COPY,
  nextInSequence,
  practiceById,
  stagePracticesFor,
  foldPracticeStatuses,
  // Phase 4 — the daily rhythm.
  foldDailyRhythm,
  DAILY_RHYTHM_COPY,
  RETURNING_ABSENCE_DAYS,
  MORNING_PRACTICE_ID,
  EVENING_RHYTHM_KEYS,
  type DailyRhythmInput,
} from '../practice-sequence'
// The CANONICAL stage vocabulary. Imported here ON PURPOSE — see note D above.
import { STAGE_DISPLAY } from '../brand-display'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  assert(a === e, `${label} (expected ${e}, got ${a})`)
}

const websiteRoot = path.resolve(__dirname, '..', '..', '..')

// ─── A. The mentor's order ───

assertEqual(
  PRACTICE_SEQUENCE.map((s) => s.id),
  ['logos', 'morning', 'passion-log', 'view-from-above', 'oikeiosis', 'premeditatio', 'hupexairesis', 'sage-compass'],
  'A1: the sequence is the mentor order — logos, morning, passion log, view-from-above + oikeiosis, premeditatio, hupexairesis, sage compass'
)

assertEqual(
  PRACTICE_SEQUENCE.map((s) => s.step),
  [0, 1, 2, 3, 3, 4, 5, 6],
  'A2: step ordinals — view-from-above and oikeiosis SHARE ordinal 3 (the mentor pairs them; they are one step met together, not two)'
)

assert(
  PRACTICE_SEQUENCE.every((s, i) => i === 0 || s.step >= PRACTICE_SEQUENCE[i - 1].step),
  'A3: ordinals are non-decreasing in array order'
)

assertEqual(
  PRACTICE_SEQUENCE.filter((s) => s.step === 3).map((s) => s.id),
  ['view-from-above', 'oikeiosis'],
  'A4: exactly the paired two share ordinal 3'
)

assert(new Set(PRACTICE_SEQUENCE.map((s) => s.id)).size === PRACTICE_SEQUENCE.length, 'A5: practice ids are unique')
assert(new Set(PRACTICE_SEQUENCE.map((s) => s.href)).size === PRACTICE_SEQUENCE.length, 'A6: hrefs are unique')
assert(PRACTICE_SEQUENCE.length === 8, 'A7: eight steps — the prerequisite plus the seven practices')

// ─── B. The tracked / untracked split ───

const untracked = PRACTICE_SEQUENCE.filter((s) => !s.tracked)
assertEqual(untracked.map((s) => s.id), ['logos'], 'B1: exactly one untracked step, and it is /logos')
assert(PRACTICE_SEQUENCE[0].id === 'logos' && !PRACTICE_SEQUENCE[0].tracked, 'B2: /logos is first and untracked')
assert(TRACKED_PRACTICE_SEQUENCE.length === 7, 'B3: seven tracked practices')
assert(TRACKED_PRACTICE_SEQUENCE.every((s) => s.tracked), 'B4: TRACKED_PRACTICE_SEQUENCE contains only tracked steps')
assertEqual(
  TRACKED_PRACTICE_SEQUENCE.map((s) => s.id),
  PRACTICE_SEQUENCE.filter((s) => s.tracked).map((s) => s.id),
  'B5: TRACKED_PRACTICE_SEQUENCE preserves sequence order'
)

// ─── C. Source-table completeness, both directions ───

for (const step of TRACKED_PRACTICE_SEQUENCE) {
  const tables = PRACTICE_SOURCE_TABLES[step.id]
  assert(Array.isArray(tables) && tables.length > 0, `C1[${step.id}]: has at least one source table (a tracked practice with none could never be met)`)
}
assert(
  PRACTICE_SOURCE_TABLES['logos'] === undefined,
  'C2: the untracked step has NO source table entry'
)
assertEqual(
  Object.keys(PRACTICE_SOURCE_TABLES).sort(),
  TRACKED_PRACTICE_SEQUENCE.map((s) => s.id).sort(),
  'C3: source-table keys are exactly the tracked practice ids — no orphan tables, no missing ones'
)
assertEqual(
  PRACTICE_SOURCE_TABLES['oikeiosis'],
  ['oikeiosis_reflections', 'circle_extension_entries'],
  'C4: /oikeiosis reads BOTH its surfaces — the quarterly reflection and the circle-extension practice'
)
assert(
  Object.values(PRACTICE_SOURCE_TABLES).flat().every((t) => /^[a-z][a-z0-9_]*$/.test(t)),
  'C5: every source table is a plain snake_case identifier (a table NAME, never an import)'
)

// EVERY table the route reads must be declared by a repo migration — the
// practice sources AND the two daily-rhythm tables. Two corrections here, both
// from the adversarial review:
//   (a) the earlier version iterated only the practice sources, so the two
//       RHYTHM_TABLES were uncovered — while this pin's own label invokes the
//       action_evaluations_v3 drift lesson and then did not cover
//       action_evaluations_v3. That is the lesson failing on its own example.
//   (b) migrations live in TWO places. Globbing only `website/supabase-*.sql`
//       missed `api/migrations/`, which is where journal_entries is declared —
//       and led an earlier comment here to assert, falsely, that journal_entries
//       was declared nowhere. A search scoped to one directory is not evidence
//       of absence.
const repoRoot = path.resolve(websiteRoot, '..')
const migrationSql = [
  ...fs
    .readdirSync(websiteRoot)
    .filter((f) => f.startsWith('supabase-') && f.endsWith('.sql'))
    .map((f) => path.join(websiteRoot, f)),
  ...['api/migrations', 'supabase/migrations']
    .map((d) => path.join(repoRoot, d))
    .filter((d) => fs.existsSync(d))
    .flatMap((d) => fs.readdirSync(d).filter((f) => f.endsWith('.sql')).map((f) => path.join(d, f))),
]
  .map((p) => fs.readFileSync(p, 'utf-8'))
  .join('\n')

const ALL_TABLES_READ = [
  ...Object.values(PRACTICE_SOURCE_TABLES).flat(),
  ...Object.values(RHYTHM_TABLES),
]
assert(ALL_TABLES_READ.length === 11, `C6-COUNT: the route reads 11 tables (got ${ALL_TABLES_READ.length}) — 8 practice sources + 3 rhythm`)
for (const table of ALL_TABLES_READ) {
  assert(
    new RegExp(`CREATE TABLE (IF NOT EXISTS )?(public\\.)?${table}\\b`).test(migrationSql),
    `C6[${table}]: declared by a repo migration (the action_evaluations_v3 drift lesson — a table this code reads must exist in the schema of record)`
  )
}
assert(
  !Object.values(PRACTICE_SOURCE_TABLES).flat().includes('journal_entries'),
  'C7: journal_entries is NOT a sequence source — the journal recurs as part of the daily rhythm rather than sitting inside the sequence. (It IS declared, at api/migrations/add-journal-entries-table.sql; it is simply not a sequence step.)'
)
assertEqual(
  Object.values(RHYTHM_TABLES),
  ['journal_entries', 'reflections', 'action_evaluations_v3'],
  'C8: the daily-rhythm tables are the journal, the reflection and the action evaluation — not sequence steps, but read by the same route and so covered by C6'
)
assert(
  Object.prototype.hasOwnProperty.call(RHYTHM_TABLES, 'reflections'),
  'C8b: `reflections` is a rhythm source. Phase 4 (plan §9) makes the evening pole "journal OR reflection"; without this table a practitioner who reflected but did not journal would be told, wrongly, that the evening review was not done'
)

// ─── D. The stage ↔ practice mapping, held to the canonical vocabulary ───

assertEqual(
  PROXIMITY_LEVEL_ORDER,
  STAGE_DISPLAY.map((s) => s.id),
  'D1: the LOCAL proximity-level order matches the canonical STAGE_DISPLAY order (anti-drift pin on the local copy)'
)
assertEqual(
  STAGE_PRACTICES.map((s) => s.level),
  STAGE_DISPLAY.map((s) => s.id),
  'D2: stage entries are in canonical ladder order'
)
assertEqual(
  STAGE_PRACTICES.map((s) => s.stageName),
  STAGE_DISPLAY.map((s) => s.name),
  'D3: stage NAMES match the canonical STAGE_DISPLAY exactly'
)
assertEqual(
  STAGE_PRACTICES.map((s) => s.stageSlug),
  STAGE_DISPLAY.map((s) => s.slug),
  'D4: stage SLUGS match the canonical STAGE_DISPLAY exactly (these are real /stages/<slug> routes)'
)

// The mentor's mapping, verbatim (plan §1).
assertEqual(stagePracticesFor('reflexive')?.practices, ['morning', 'passion-log'], 'D5: The Storm → morning preparation + passion log')
assertEqual(stagePracticesFor('habitual')?.practices, ['premeditatio', 'hupexairesis'], 'D6: The Worn Path → premeditatio + hupexairesis')
assertEqual(stagePracticesFor('deliberate')?.practices, ['view-from-above', 'oikeiosis'], 'D7: The Crossroads → view from above + oikeiosis')
assertEqual(stagePracticesFor('principled')?.practices, ['sage-compass'], 'D8: The Clear Summit → sage compass')
assertEqual(stagePracticesFor('sage_like')?.practices, [], 'D9: The Inner Fire maps to NO tools')

assert(
  stagePracticesFor('sage_like')?.note === 'This stage no longer needs the scaffolding in the same way.',
  'D10: The Inner Fire carries the mentor line in place of tools'
)
assert(
  STAGE_PRACTICES.filter((s) => s.note !== null).length === 1,
  'D11: exactly one stage carries a note'
)
assert(
  STAGE_PRACTICES.every((s) => (s.practices.length === 0) === (s.note !== null)),
  'D12: a stage has practices XOR a note — never both, never neither'
)

// The non-linearity the plan names explicitly: premeditatio + hupexairesis sit
// 4th/5th in the introduction sequence but belong to the SECOND stage. If this
// pin ever fails, the "stages are conditions, not a corridor" reading has been
// quietly flattened.
{
  const wornPath = stagePracticesFor('habitual')!.practices
  const seqPos = (id: string) => PRACTICE_SEQUENCE.findIndex((s) => s.id === id)
  assert(
    seqPos(wornPath[0]) > seqPos(stagePracticesFor('deliberate')!.practices[0]),
    'D13: the sequence/stage NON-LINEARITY is preserved — The Worn Path (2nd stage) maps to practices introduced AFTER The Crossroads (3rd stage) practices. The stages are conditions, not a corridor.'
  )
}

for (const stage of STAGE_PRACTICES) {
  for (const id of stage.practices) {
    assert(practiceById(id) !== null, `D14[${stage.level}]: mapped practice '${id}' exists in the sequence`)
    assert(practiceById(id)?.tracked === true, `D15[${stage.level}]: mapped practice '${id}' is a tracked practice, not the prerequisite`)
  }
}
assert(stagePracticesFor('nonsense') === null, 'D16: an unknown level returns null, never a default stage')

// ─── E. nextInSequence ───

assert(nextInSequence([])?.id === 'morning', 'E1: a brand-new practitioner is pointed at morning preparation — the first TRACKED step')
assert(nextInSequence(['morning'])?.id === 'passion-log', 'E2: advances to the next unmet step')
assert(
  nextInSequence(['morning', 'passion-log'])?.id === 'view-from-above',
  'E3: the paired step is entered at view-from-above'
)
assert(
  nextInSequence(['morning', 'passion-log', 'view-from-above'])?.id === 'oikeiosis',
  'E4: within the pair, oikeiosis follows view-from-above'
)
assert(
  nextInSequence(TRACKED_PRACTICE_SEQUENCE.map((s) => s.id)) === null,
  'E5: null once every tracked practice has been met'
)
assert(
  nextInSequence(['logos'])?.id === 'morning',
  'E6: /logos is SKIPPED — it can never be met, so including it would pin "next" to the prerequisite forever'
)
assert(
  nextInSequence(['morning', 'unknown-tool', 'not-a-practice'])?.id === 'passion-log',
  'E7: unknown ids are tolerated and ignored'
)
assert(
  nextInSequence(new Set(['morning']))?.id === 'passion-log',
  'E8: accepts any iterable, not just an array'
)
{
  const arg = ['morning']
  nextInSequence(arg)
  assertEqual(arg, ['morning'], 'E9: does not mutate its argument')
}
{
  // Order-independence: the answer depends on the SET of met practices, not the
  // order they are supplied in.
  const a = nextInSequence(['passion-log', 'morning'])?.id
  const b = nextInSequence(['morning', 'passion-log'])?.id
  assert(a === b && a === 'view-from-above', 'E10: the answer is set-based, not order-dependent')
}
assert(practiceById('logos')?.href === '/logos', 'E11: practiceById resolves the prerequisite')
assert(practiceById('nope') === null, 'E12: practiceById returns null for an unknown id, never a default')

// ─── E2. foldPracticeStatuses — the honesty rules ───

const ALL_TABLES = Object.values(PRACTICE_SOURCE_TABLES).flat()
const ok = (last: string | null, count = last ? 1 : 0) => ({ status: 'ok' as const, last_used_at: last, count })
const down = () => ({ status: 'unavailable' as const, last_used_at: null, count: null })
const readsWhere = (overrides: Record<string, ReturnType<typeof ok> | ReturnType<typeof down>> = {}) =>
  Object.fromEntries(ALL_TABLES.map((t) => [t, overrides[t] ?? ok(null)]))

{
  // A brand-new practitioner: everything readable, nothing used.
  const f = foldPracticeStatuses(readsWhere())
  assert(f.next_in_sequence === 'morning', 'E2-1: brand-new practitioner → next is morning')
  assert(f.next_basis === 'first_unmet', 'E2-2: basis is first_unmet')
  assert(f.practices.every((p) => !p.tracked || p.met === false), 'E2-3: every tracked practice reads not-met')
  assert(f.practices.find((p) => p.id === 'logos')?.met === null, 'E2-4: the untracked prerequisite has met === null, never false')
  assert(f.practices.length === PRACTICE_SEQUENCE.length, 'E2-5: one entry per sequence step')
}
{
  // Everything met.
  const f = foldPracticeStatuses(readsWhere(Object.fromEntries(ALL_TABLES.map((t) => [t, ok('2026-07-01T00:00:00Z')]))))
  assert(f.next_in_sequence === null, 'E2-6: all met → no next step')
  assert(f.next_basis === 'all_met', 'E2-7: basis is all_met')
}
{
  // THE CONTAGION RULE. One of oikeiosis's two tables is down. oikeiosis must be
  // `unavailable` with met === null — never `false`, which would tell the
  // practitioner they have not used a page they may well have used.
  const f = foldPracticeStatuses(readsWhere({ circle_extension_entries: down() }))
  const oik = f.practices.find((p) => p.id === 'oikeiosis')!
  assert(oik.status === 'unavailable', 'E2-8: a practice with ANY failed source table is unavailable')
  assert(oik.met === null, 'E2-9: met is null on an unavailable practice — NEVER false (a fabricated status is worse than a blank one)')
  assert(oik.last_used_at === null, 'E2-10: no timestamp is reported for an unavailable practice')
  // Its sibling, read from the same request, is unaffected.
  assert(f.practices.find((p) => p.id === 'view-from-above')?.status === 'ok', 'E2-11: one failed table degrades only its own practice')
}
{
  // THE INDETERMINATE RULE. morning is met; passion-log's table is down;
  // view-from-above is unmet. Walking past the failure to view-from-above would
  // point the practitioner one practice too far along.
  const f = foldPracticeStatuses(readsWhere({
    morning_preparation_entries: ok('2026-07-01T00:00:00Z'),
    passion_events: down(),
  }))
  assert(f.next_basis === 'indeterminate', 'E2-12: an unavailable step reached before any unmet one makes next INDETERMINATE')
  assert(f.next_in_sequence === null, 'E2-13: no next step is named when the answer is not knowable')
}
{
  // A failure AFTER the first unmet step does not make the answer unknowable —
  // the first unmet step is still the first unmet step.
  const f = foldPracticeStatuses(readsWhere({ sage_compass_entries: down() }))
  assert(f.next_in_sequence === 'morning', 'E2-14: a failure LATER in the sequence does not obscure an earlier unmet step')
  assert(f.next_basis === 'first_unmet', 'E2-15: basis stays first_unmet')
}
{
  // A missing table key is treated as a failed read, not as "no rows".
  const partial = { ...readsWhere() }
  delete (partial as Record<string, unknown>)['morning_preparation_entries']
  const f = foldPracticeStatuses(partial)
  assert(f.practices.find((p) => p.id === 'morning')?.status === 'unavailable', 'E2-16: a MISSING read is unavailable, not an implied zero')
  assert(f.next_basis === 'indeterminate', 'E2-17: a missing read makes next indeterminate')
}
{
  // last_used_at across a practice's two tables is the LATER of them.
  const f = foldPracticeStatuses(readsWhere({
    oikeiosis_reflections: ok('2026-01-01T00:00:00Z'),
    circle_extension_entries: ok('2026-06-01T00:00:00Z'),
  }))
  const oik = f.practices.find((p) => p.id === 'oikeiosis')!
  assert(oik.met === true, 'E2-18: a row in EITHER oikeiosis surface counts as met')
  assert(oik.last_used_at === '2026-06-01T00:00:00Z', 'E2-19: last_used_at is the LATER of the two surfaces')
  assert(oik.count === 2, 'E2-20: counts sum across a practice\'s surfaces')
}
{
  // THE MIRROR OF E2-19, and the reason it exists. Every two-timestamp fixture
  // originally placed the LATER value in the second fold position, so a mutant
  // returning "whatever came last" passed all 193 assertions. This is the Phase 0
  // lesson recurring exactly — a fixture set that shares a property tests only
  // that property. Here the later value is FIRST, so "last wins" now fails.
  const f = foldPracticeStatuses(readsWhere({
    oikeiosis_reflections: ok('2026-06-01T00:00:00Z'),
    circle_extension_entries: ok('2026-01-01T00:00:00Z'),
  }))
  assert(
    f.practices.find((p) => p.id === 'oikeiosis')?.last_used_at === '2026-06-01T00:00:00Z',
    'E2-19b: last_used_at is the later value when the later one comes FIRST (kills a "last wins" mutant that E2-19 alone cannot)'
  )
}
{
  // An unparseable timestamp does not win, and does not crash the fold.
  const f = foldPracticeStatuses(readsWhere({
    oikeiosis_reflections: ok('not-a-date'),
    circle_extension_entries: ok('2026-06-01T00:00:00Z'),
  }))
  assert(
    f.practices.find((p) => p.id === 'oikeiosis')?.last_used_at === '2026-06-01T00:00:00Z',
    'E2-21: an unparseable timestamp never displaces a real one'
  )
}
{
  // The MIRROR of E2-21. With the unparseable value SECOND, the comparison takes
  // the `!Number.isFinite(tb)` branch — which no test executed at all until this
  // one, so inverting that guard survived the whole suite.
  const f = foldPracticeStatuses(readsWhere({
    oikeiosis_reflections: ok('2026-06-01T00:00:00Z'),
    circle_extension_entries: ok('not-a-date'),
  }))
  assert(
    f.practices.find((p) => p.id === 'oikeiosis')?.last_used_at === '2026-06-01T00:00:00Z',
    'E2-21b: an unparseable SECOND timestamp never displaces a real first one (covers the !Number.isFinite(tb) branch)'
  )
}
{
  // Both unparseable: the fold must not crash, and must not invent a date.
  const f = foldPracticeStatuses(readsWhere({
    oikeiosis_reflections: ok('not-a-date'),
    circle_extension_entries: ok('also-not-a-date'),
  }))
  const oik = f.practices.find((p) => p.id === 'oikeiosis')!
  assert(oik.met === true, 'E2-21c: rows exist, so the practice is met even when no timestamp parses')
  assert(typeof oik.last_used_at === 'string', 'E2-21d: a value is carried through rather than fabricated or nulled')
}
{
  // The fold agrees with the standalone helper whenever every read succeeded.
  const f = foldPracticeStatuses(readsWhere({ morning_preparation_entries: ok('2026-07-01T00:00:00Z') }))
  const met = f.practices.filter((p) => p.tracked && p.met).map((p) => p.id)
  assert(
    f.next_in_sequence === (nextInSequence(met)?.id ?? null),
    'E2-22: the fold and nextInSequence() agree — one definition of "next", not two'
  )
}

// ─── F. Copy, pinned as exported values ───

for (const step of PRACTICE_SEQUENCE) {
  assert(typeof step.doorbell === 'string' && step.doorbell.trim().length > 0, `F1[${step.id}]: has a doorbell line`)
  assert(!step.doorbell.includes('\n'), `F2[${step.id}]: the doorbell is ONE line — a doorbell, not a door`)
  assert(step.doorbell.trim().endsWith('.'), `F3[${step.id}]: the doorbell is a complete sentence`)
  assert(step.doorbell.length <= 90, `F4[${step.id}]: the doorbell stays short (${step.doorbell.length} chars) — it invites a beginning and stops`)
  assert(typeof step.name === 'string' && step.name.trim().length > 0, `F5[${step.id}]: has a name`)
  assert(step.href.startsWith('/'), `F6[${step.id}]: href is a site-root path`)
}

// The exact doorbell strings. Changing one is a copy decision, not a refactor.
assertEqual(
  PRACTICE_SEQUENCE.map((s) => s.doorbell),
  [
    'Begin here — this is the ground the other practices stand on.',
    'Begin the day by naming what it will ask of you.',
    'Log what you noticed, while you still remember noticing it.',
    'Set a concern you are carrying against a wider frame.',
    'Take a decision out to a wider circle than you began from.',
    'Prepare for a difficulty before it arrives.',
    'Hold an intention with the reserve clause attached.',
    'Take a bearing before a decision you find difficult.',
  ],
  'F7: the doorbell lines, verbatim'
)

// Names match the live H1 of each page — the link and the destination agree.
assertEqual(
  PRACTICE_SEQUENCE.map((s) => s.name),
  ['Logos', 'Morning Preparation', 'Passion Log', 'The View From Above', 'Expanding Your Circle of Concern', 'Preparing for Adversity', 'The Reserve Clause', 'The Sage Compass'],
  'F8: practice names are each page\'s live H1, verbatim'
)

for (const [key, value] of Object.entries(PRACTICE_MODULE_COPY)) {
  assert(typeof value === 'string' && value.trim().length > 0, `F9[${key}]: dashboard module copy is a non-empty string`)
}
for (const [key, value] of Object.entries(WELCOME_SEQUENCE_COPY)) {
  assert(typeof value === 'string' && value.trim().length > 0, `F10[${key}]: welcome copy is a non-empty string`)
}
assert(PRACTICE_MODULE_COPY.heading === 'Your practice', 'F11: the dashboard module heading')
assert(
  PRACTICE_MODULE_COPY.allMet.includes('Return to whichever one the day asks for'),
  'F12: the all-met line REFUSES closure — it returns the practitioner to the practice rather than congratulating them (the mirror principle)'
)
assert(
  WELCOME_SEQUENCE_COPY.intro.includes('a default, not a rule'),
  'F13: /welcome softens the freedom note rather than deleting it (election E2) — the order is a default, not a rule'
)

// EXACT pins on every copy key. Previously 11 of these 14 carried only the
// F9/F10 "non-empty string" loops, so a completion-framing rewrite
// (`'Not yet'` → `'Incomplete'`) passed all 193 assertions — the H1 banlist has
// `completion` but not `incomplete`. A non-empty-string assertion is not a copy
// pin. Found by the adversarial review; every string is now load-bearing.
assertEqual(
  PRACTICE_MODULE_COPY,
  {
    heading: 'Your practice',
    intro:
      'The practices in the order they are usually met. The order is a default, not a rule — nothing here is locked.',
    nextLabel: 'Where to go next',
    metLabel: 'Met',
    notYetLabel: 'Not yet',
    untrackedNote: 'A reading, not a record — open it whenever you like.',
    allMet:
      'You have met every practice here at least once. Return to whichever one the day asks for.',
    loadFailed:
      'Your practice status could not be loaded just now. The practices themselves are all still open below.',
  },
  'F14: the dashboard module copy, verbatim — every key, not merely non-empty'
)
assertEqual(
  WELCOME_SEQUENCE_COPY,
  {
    heading: 'Where to start',
    intro:
      'If you are not sure where to begin, this is the order these practices are usually met in. It is a default, not a rule — nothing is locked, and you can go straight to whatever you need today.',
    prerequisiteNote:
      'Everything below assumes one idea: that some things are up to you and some are not. That is what the logos page above sets out, and it is why the practices cohere rather than sitting side by side as techniques.',
    dailyRhythmHeading: 'The daily rhythm',
    dailyRhythm:
      'Alongside the sequence, two things recur: score an action as one arises, and keep the journal in the evening. The morning declares the intention; the evening looks at whether it held.',
    toolsHeading: 'The practices, in sequence',
  },
  'F15: the /welcome sequence copy, verbatim — every key'
)

// ─── G. Every href resolves to a real page ───

for (const step of PRACTICE_SEQUENCE) {
  const pagePath = path.join(websiteRoot, 'src', 'app', step.href.replace(/^\//, ''), 'page.tsx')
  assert(fs.existsSync(pagePath), `G1[${step.id}]: ${step.href} resolves to a real page (${path.relative(websiteRoot, pagePath)})`)
}
for (const stage of STAGE_PRACTICES) {
  const pagePath = path.join(websiteRoot, 'src', 'app', 'stages', '[slug]', 'page.tsx')
  assert(fs.existsSync(pagePath), `G2[${stage.level}]: the /stages/<slug> route exists for '${stage.stageSlug}'`)
}

// ─── G2. /welcome's local STAGES literals ───
//
// /welcome cannot import brand-display (one-hop stoic-brain rule), so it carries
// its own literal copy of the five stage names, slugs and image paths. This diff
// turned those tiles into <a href={`/stages/${slug}`}> — making the slug
// load-bearing for navigation — while a comment above them claimed they were
// "pinned against the canonical STAGE_DISPLAY by the practice-sequence unit
// suite". They were not: nothing read welcome/page.tsx's literals at all, and a
// mutation to 'the-crossroadz' passed 783 assertions across all three suites.
// A comment asserting "a test covers this" is load-bearing for a future
// maintainer's decision not to look, so the pin now genuinely exists.
{
  const welcomeSrc = fs.readFileSync(path.join(websiteRoot, 'src', 'app', 'welcome', 'page.tsx'), 'utf-8')
  const stagesBlock = welcomeSrc.slice(welcomeSrc.indexOf('const STAGES ='), welcomeSrc.indexOf(']', welcomeSrc.indexOf('const STAGES =')))
  assert(stagesBlock.length > 0, 'G2-0: /welcome declares a STAGES array (if this fails, the array was renamed and this pin needs updating)')

  const slugs = [...stagesBlock.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
  const names = [...stagesBlock.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])

  assertEqual(slugs, STAGE_DISPLAY.map((s) => s.slug), 'G2-1: /welcome\'s stage SLUGS match the canonical STAGE_DISPLAY — each one is a live /stages/<slug> URL, and a stale one renders "Unknown stage." at HTTP 200, not a 404')
  assertEqual(names, STAGE_DISPLAY.map((s) => s.name), 'G2-2: /welcome\'s stage NAMES match the canonical STAGE_DISPLAY')

  for (const slug of slugs) {
    assert(
      STAGE_PRACTICES.some((s) => s.stageSlug === slug),
      `G2-3[${slug}]: /welcome's slug also matches this module's own STAGE_PRACTICES copy`
    )
  }
}

// ─── H. No gamification (plan §11) ───

// EVERY user-visible string surface belongs in here. DAILY_RHYTHM_COPY was
// missing until the adversarial review found it: the Phase 4 copy sat outside
// H1/H2/H3 entirely, and its own J5 banlist was strictly weaker (it checks the
// phrase 'you have completed', which a bare 'completed' does not match). Proven
// by mutation — `doneLabel: 'Done today'` → `'2 of 2 completed today'` scored
// 358 passed, 0 failed. That single string is simultaneously N-of-M framing and
// completion framing, both named in plan §11, and it would have rendered on the
// dashboard for any practitioner with both poles done. A guard that looks like
// it covers the feature and does not is worse than no guard.
const ALL_COPY = [
  ...PRACTICE_SEQUENCE.map((s) => `${s.name} ${s.doorbell}`),
  ...Object.values(PRACTICE_MODULE_COPY),
  ...Object.values(WELCOME_SEQUENCE_COPY),
  ...Object.values(DAILY_RHYTHM_COPY),
  ...STAGE_PRACTICES.map((s) => s.note ?? ''),
].join(' ').toLowerCase()

for (const banned of ['streak', 'badge', 'points', 'leaderboard', 'level up', 'completion', 'completed', '100%', 'you have unlocked', 'congratulations', 'well done']) {
  assert(!ALL_COPY.includes(banned), `H1: no gamification language — '${banned}' must not appear in any user-visible string`)
}
assert(!/\b\d+\s*%/.test(ALL_COPY), 'H2: no percentages in any user-visible string')
assert(!/\b\d+\s+of\s+\d+\b/.test(ALL_COPY), 'H3: no "N of M" completion framing')

// ─── Self-test: the assertion machinery is live ───

// ─── I. Phase 4 — the daily rhythm fold ───
//
// The clock is INJECTED, so every case below is deterministic and none of them
// needs a stubbed global or a particular time of day to run.
//
// TIMEZONE NOTE: fixtures are built with the LOCAL `Date` constructor and
// serialised through `toISOString()`. Parsed back and read with local getters
// they return the same local wall-clock time, so these assertions hold in any
// timezone the suite is run in — which matters, because the thing under test is
// precisely a local-day comparison.

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString()
const NOW = new Date(2026, 6, 27, 10, 0, 0) // local 2026-07-27, 10am

const OK = (ts: string | null) => ({ status: 'ok' as const, last_used_at: ts })
const DOWN = { status: 'unavailable' as const, last_used_at: null }

/**
 * All practices ok and silent since `ts`, unless overridden.
 *
 * Built from PRACTICE_SEQUENCE, not TRACKED_PRACTICE_SEQUENCE, so the fixture
 * MATCHES THE ROUTE. `foldPracticeStatuses` does not omit untracked steps — it
 * short-circuits them to `{status:'ok', met:null, last_used_at:null}` — and the
 * route returns that array verbatim, so the client always holds 8 entries
 * including `logos`. The earlier fixture had 7 and no logos entry, which made
 * I17 pass for a fixture-specific reason and told a maintainer a consequence
 * that could not occur. Found by the adversarial review.
 */
function rhythmInput(over: {
  practices?: Record<string, { status: 'ok' | 'unavailable'; last_used_at: string | null }>
  rhythm?: Record<string, { status: 'ok' | 'unavailable'; last_used_at: string | null }>
  base?: string | null
} = {}): DailyRhythmInput {
  const base = over.base === undefined ? null : over.base
  const practices = PRACTICE_SEQUENCE.map((s) => ({
    id: s.id,
    ...(over.practices?.[s.id] ?? (s.tracked ? OK(base) : OK(null))),
  }))
  const rhythm: Record<string, { status: 'ok' | 'unavailable'; last_used_at: string | null }> = {}
  for (const key of Object.keys(RHYTHM_TABLES)) rhythm[key] = over.rhythm?.[key] ?? OK(base)
  return { practices, rhythm }
}

const poleOf = (f: ReturnType<typeof foldDailyRhythm>, id: 'morning' | 'evening') =>
  f.poles.find((p) => p.id === id)!

// --- Wiring pins. Both of these failure modes are SILENT: the pole would simply
// --- be `unknown` forever, which renders as nothing at all and so looks fine.
assert(
  TRACKED_PRACTICE_SEQUENCE.some((s) => s.id === MORNING_PRACTICE_ID),
  'I0a: MORNING_PRACTICE_ID names a TRACKED practice — otherwise the morning pole has no source and is permanently unknown, which renders as silence and hides itself'
)
assert(
  EVENING_RHYTHM_KEYS.every((k) => Object.prototype.hasOwnProperty.call(RHYTHM_TABLES, k)),
  'I0b: every EVENING_RHYTHM_KEY is a real rhythm key — a renamed key would orphan the evening pole into permanent unknown'
)
assertEqual(
  [...EVENING_RHYTHM_KEYS],
  ['journal', 'reflections'],
  'I0c: the evening pole is journal OR reflection (plan §9)'
)
assert(
  !EVENING_RHYTHM_KEYS.includes('evaluations'),
  'I0d: scoring an action is NOT the evening review — it happens when an action arises. It still counts for the absence check, but it must not satisfy the evening pole'
)

// --- Basic states.
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 27, 8) }), NOW)
  assertEqual(poleOf(f, 'morning').state, 'done_today', 'I1a: an entry earlier today reads as done today')
  assertEqual(poleOf(f, 'evening').state, 'done_today', 'I1b: likewise the evening pole')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 26, 20) }), NOW)
  assertEqual(poleOf(f, 'morning').state, 'not_yet_today', 'I2a: yesterday is not today')
  assertEqual(poleOf(f, 'evening').state, 'not_yet_today', 'I2b: likewise the evening pole')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: null }), NOW)
  assertEqual(poleOf(f, 'morning').state, 'not_yet_today', 'I3a: never done at all is an honest "not yet today" — it is, after all, not done today')
  assertEqual(poleOf(f, 'morning').last_used_at, null, 'I3b: and carries no timestamp')
}

// --- The unknown state, in every direction that can produce it.
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 26), practices: { morning: DOWN } }), NOW)
  assertEqual(poleOf(f, 'morning').state, 'unknown', 'I4: a failed morning read is unknown, never "not yet" — telling a practitioner they skipped something they may have done is a fabricated status')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 26), rhythm: { journal: DOWN } }), NOW)
  assertEqual(poleOf(f, 'evening').state, 'unknown', 'I5: unavailable is contagious within the evening pole — journal down')
}
{
  // The MIRROR of I5. Without it, a fold that checked only the first source
  // would pass I5 and still be broken.
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 26), rhythm: { reflections: DOWN } }), NOW)
  assertEqual(poleOf(f, 'evening').state, 'unknown', 'I6: unavailable is contagious within the evening pole — reflections down (the mirror of I5)')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 26), rhythm: { journal: OK('not-a-date') , reflections: OK(null) } }), NOW)
  assertEqual(poleOf(f, 'evening').state, 'unknown', 'I7: an unreadable timestamp is unknown — a value we cannot parse is not evidence that nothing happened')
}

// --- A source that is ABSENT, not merely unavailable. The sibling fold pins this
// --- (E2-16/E2-17: "a MISSING read is unavailable, not an implied zero") and this
// --- one did not, because rhythmInput always populates every key. The adversarial
// --- review proved the gap: deleting the `present.length === sources.length`
// --- clause from reduceSources scored 358 passed / 0 failed. Reachable in
// --- practice — the client casts the payload without validating it, so a rolled
// --- back route, or any future route emitting a partial rhythm block, hands this
// --- fold an absent key.
{
  const input = rhythmInput({ base: at(2026, 7, 27, 9) })
  const rhythm = { ...input.rhythm } as Record<string, { status: 'ok' | 'unavailable'; last_used_at: string | null }>
  delete rhythm.reflections // a pre-Phase-4-shaped payload
  const f = foldDailyRhythm({ practices: input.practices, rhythm }, NOW)
  assertEqual(poleOf(f, 'evening').state, 'unknown', 'I7b: an ABSENT rhythm key makes the pole unknown — never a state invented from the keys that happened to arrive')
}
{
  const input = rhythmInput({ base: at(2026, 7, 27, 9) })
  const f = foldDailyRhythm(
    { practices: input.practices.filter((p) => p.id !== 'morning'), rhythm: input.rhythm },
    NOW
  )
  assertEqual(poleOf(f, 'morning').state, 'unknown', 'I7c: an ABSENT morning practice makes that pole unknown')
  assert(!f.returning, 'I7d: and an absent practice withholds the returning line — the missing source might have held recent activity')
  assertEqual(f.days_absent, null, 'I7e: and leaves days absent unknowable rather than guessed')
}

// --- I0d asserts over the CONSTANT. This asserts over the BEHAVIOUR, because a
// --- label that says "must not satisfy the evening pole" should be pinned by
// --- something that would notice if it did.
{
  const f = foldDailyRhythm(
    rhythmInput({
      base: null,
      rhythm: { journal: OK(null), reflections: OK(null), evaluations: OK(at(2026, 7, 27, 12, )) },
    }),
    NOW
  )
  assertEqual(poleOf(f, 'evening').state, 'not_yet_today', 'I0e: scoring an action TODAY does not make the evening review done — the dashboard must not claim the evening examination happened at lunchtime')
}

// --- Journal OR reflection, in BOTH directions. This pair is the whole point of
// --- Phase 4's table change: before it, the second case was impossible to satisfy.
{
  const f = foldDailyRhythm(
    rhythmInput({ base: null, rhythm: { journal: OK(at(2026, 7, 27, 21)), reflections: OK(null) } }),
    NOW
  )
  assertEqual(poleOf(f, 'evening').state, 'done_today', 'I8: the journal alone satisfies the evening pole')
}
{
  const f = foldDailyRhythm(
    rhythmInput({ base: null, rhythm: { journal: OK(null), reflections: OK(at(2026, 7, 27, 21)) } }),
    NOW
  )
  assertEqual(poleOf(f, 'evening').state, 'done_today', 'I9: a REFLECTION alone satisfies the evening pole — the regression Phase 4 exists to fix; before `reflections` was a rhythm source this case reported "not yet"')
}

// --- Order independence, written as an explicit MIRROR PAIR.
// --- The Phase 1 lesson, recurring: two fixtures that both put the later value
// --- in the same position let a "last wins" mutant pass everything.
{
  const older = at(2026, 7, 24)
  const today = at(2026, 7, 27, 9)
  const a = foldDailyRhythm(rhythmInput({ base: null, rhythm: { journal: OK(today), reflections: OK(older) } }), NOW)
  const b = foldDailyRhythm(rhythmInput({ base: null, rhythm: { journal: OK(older), reflections: OK(today) } }), NOW)
  assertEqual(poleOf(a, 'evening').state, 'done_today', 'I10a: later value FIRST — the pole takes the later of its sources')
  assertEqual(poleOf(b, 'evening').state, 'done_today', 'I10b: later value SECOND — the mirror, so a positional bug cannot hide')
  assertEqual(poleOf(a, 'evening').last_used_at, today, 'I10c: and reports the later timestamp, order-independently (first)')
  assertEqual(poleOf(b, 'evening').last_used_at, today, 'I10d: and reports the later timestamp, order-independently (second)')
}

// --- The local-day boundary. The named requirement: an entry must read as
// --- "today" for the practitioner who wrote it, on THEIR calendar.
//
// THIS BLOCK PINS ITS OWN TIMEZONE, and that is the whole point of it.
// Found by adversarial review: under `TZ=UTC` a local-day comparison and a UTC-day
// comparison are MATHEMATICALLY IDENTICAL, so every assertion here passes even
// after reintroducing the exact bug the design exists to prevent — mutating
// `localMidnightUtcMs` to use `getUTCFullYear/getUTCMonth/getUTCDate` scored
// 358 passed, 0 failed under TZ=UTC. The suite only caught it because the
// author's machine happens to be UTC+10; CI containers and Vercel builds default
// to UTC, so the pin would have gone quietly vacuous the moment it left this Mac.
//
// So the zone is set explicitly, BOTH SIDES of Greenwich are exercised (the two
// hemispheres fail a UTC comparison in opposite directions — one flips to
// "not yet" mid-evening, the other stays "done" into the next local morning),
// and the block asserts that the zone actually took effect rather than trusting
// that it did.
{
  const originalTz = process.env.TZ

  for (const [zone, expectedSign] of [
    ['Australia/Brisbane', 'east (+10)'],
    ['America/Los_Angeles', 'west (−7/−8)'],
  ] as const) {
    process.env.TZ = zone
    const offset = new Date(2026, 6, 27).getTimezoneOffset()
    assert(offset !== 0, `I11-TZ[${zone}]: the timezone actually took effect (offset ${offset}, ${expectedSign}) — if this ever reads 0 the assertions below are vacuous`)

    // Built HERE, after the zone is set, so the fixtures are local to it.
    const evening = (ts: string) => rhythmInput({ base: ts })

    const f1 = foldDailyRhythm(evening(at(2026, 7, 27, 21)), new Date(2026, 6, 27, 23, 30))
    assertEqual(poleOf(f1, 'evening').state, 'done_today', `I11a[${zone}]: a 9pm LOCAL entry still reads as today at 11:30pm local`)

    const f2 = foldDailyRhythm(evening(at(2026, 7, 27, 23)), new Date(2026, 6, 28, 0, 30))
    assertEqual(poleOf(f2, 'evening').state, 'not_yet_today', `I11b[${zone}]: and rolls over at LOCAL midnight, not UTC midnight`)

    const f3 = foldDailyRhythm(evening(at(2026, 7, 27, 8)), new Date(2026, 6, 27, 18, 0))
    assertEqual(poleOf(f3, 'evening').state, 'done_today', `I11c[${zone}]: an 8am entry is still today at 6pm — the case that discriminates in BOTH hemispheres, because a UTC comparison puts the entry and the moment on different UTC dates either way`)
  }

  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
}

// --- Returning after absence.
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 13) }), NOW)
  assertEqual(f.days_absent, 14, 'I12a: days absent counts local calendar days')
  assert(f.returning, 'I12b: exactly at the threshold, the returning line is offered')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 14) }), NOW)
  assertEqual(f.days_absent, 13, 'I13a: one day short of the threshold')
  assert(!f.returning, 'I13b: and the line is withheld — the boundary is tested from BOTH sides')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: null }), NOW)
  assert(!f.returning, 'I14a: a practitioner who has never done anything is NEW, not returning — "it has been a while" on a first visit would be false and discouraging')
  assertEqual(f.days_absent, null, 'I14b: and there is no absence to measure')
}
{
  const f = foldDailyRhythm(rhythmInput({ base: at(2026, 7, 1), practices: { 'sage-compass': DOWN } }), NOW)
  assert(!f.returning, 'I15a: one unavailable surface withholds the returning line — the missing table might have held recent activity')
  assertEqual(f.days_absent, null, 'I15b: and days absent is unknowable, not guessed')
}
{
  // Long-silent practices, but a recent action evaluation. `evaluations` is not
  // an evening source, but it IS activity — someone who scored an action
  // yesterday is plainly not absent.
  const f = foldDailyRhythm(
    rhythmInput({ base: at(2026, 7, 1), rhythm: { evaluations: OK(at(2026, 7, 26)) } }),
    NOW
  )
  assert(!f.returning, 'I16: a recent action evaluation counts as activity for the absence check even though it does not satisfy the evening pole')
}
{
  // The untracked prerequisite is excluded from the activity scan. Its earlier
  // rationale was wrong twice over — `/logos` DOES appear in the practice
  // statuses, and with status 'ok', so merely including it would be harmless
  // today. The exclusion is nonetheless load-bearing, and this pins the reason
  // it is: `/logos` is a reading with no row anywhere, so it can never evidence
  // activity, and the moment the sibling fold reports it as anything other than
  // 'ok' an activity scan that included it would be permanently incomplete and
  // the returning line permanently unreachable. The fixture below makes exactly
  // that case, so the pin is non-vacuous rather than an artefact.
  const base = rhythmInput({ base: at(2026, 7, 1) })
  const withUnknownLogos = {
    practices: base.practices.map((p) => (p.id === 'logos' ? { ...p, status: 'unavailable' as const } : p)),
    rhythm: base.rhythm,
  }
  assert(
    foldDailyRhythm(withUnknownLogos, NOW).returning,
    'I17: an untracked step is excluded from the activity scan even when IT is unreadable — a reading can never evidence activity, so it must never be able to withhold the returning line'
  )
  assert(
    foldDailyRhythm(base, NOW).returning,
    'I17b: and the ordinary production-shaped payload (8 practices, logos ok) still reaches the returning line'
  )
}

// ─── J. Phase 4 copy, pinned as EXPORTED VALUES ───

assertEqual(RETURNING_ABSENCE_DAYS, 14, 'J1: the absence threshold is two weeks (plan §9)')
assertEqual(
  DAILY_RHYTHM_COPY.morningDoorbell,
  'It is time for morning preparation.',
  'J2: the morning doorbell is the mentor\'s own sanctioned example, verbatim — "it is time for morning preparation is not doing the practice — it is removing the friction of remembering to begin"'
)
assert(
  DAILY_RHYTHM_COPY.returning.includes('begin with whatever is nearest'),
  'J3: the returning line invites and stops, leaving the choosing to the practitioner (DRAFT pending Step M)'
)
// A VERBATIM whole-object pin, replacing a per-key non-empty-string loop.
//
// The loop was not a copy pin, and the adversarial review proved it: rewriting
// eveningDoorbell to 'Before sleep, name where you fell short and feel the
// weight of it.' scored 358 passed / 0 failed. That rewrite tells the
// practitioner both what to conclude and how to feel — the exact violation of
// constraint 1 that this file's own docstring says the string is written to
// avoid. The render suite cannot catch it either, because every assertion there
// compares against DAILY_RHYTHM_COPY by REFERENCE and so follows any change.
//
// This file already carries the lesson at F14: "a non-empty-string assertion is
// not a copy pin." Constraint 1 is the change's primary binding constraint, so
// its copy gets the strongest available pin — changing any of these strings now
// requires changing this test too, deliberately.
assertEqual(
  { ...DAILY_RHYTHM_COPY },
  {
    heading: 'Today',
    intro: 'The two poles of the daily rhythm. Where a thing is done, it simply says so.',
    morningLabel: 'Morning preparation',
    morningDoorbell: 'It is time for morning preparation.',
    morningHref: '/morning',
    eveningLabel: 'Evening review',
    eveningDoorbell: 'Before sleep, look back over the day.',
    eveningHref: '/journal',
    eveningVia: 'The journal or a reflection — either one is the evening review.',
    doneLabel: 'Done today',
    openLabel: 'Open',
    unavailableNote: 'One of these could not be read just now, so it is left blank rather than guessed at.',
    returning:
      'It has been a while. The practice is here when you turn toward it — begin with whatever is nearest.',
  },
  'J4: DAILY_RHYTHM_COPY verbatim — every doorbell invites a beginning and then STOPS; none names a conclusion, a feeling, or a verdict (plan §1 constraint 1)'
)

// No gamification (plan §11), asserted over the copy itself rather than trusting
// the components to abstain.
const FORBIDDEN_COPY = ['streak', '%', 'congrat', 'well done', 'keep it up', 'you have completed', 'points', 'badge']
for (const [key, value] of Object.entries(DAILY_RHYTHM_COPY)) {
  for (const bad of FORBIDDEN_COPY) {
    assert(
      !String(value).toLowerCase().includes(bad),
      `J5[${key}]: no gamification vocabulary — '${bad}' would make this a score rather than a mirror`
    )
  }
}

// Both rhythm hrefs must open onto a real page.
for (const href of [DAILY_RHYTHM_COPY.morningHref, DAILY_RHYTHM_COPY.eveningHref]) {
  const pageFile = path.join(websiteRoot, 'src/app', href.replace(/^\//, ''), 'page.tsx')
  assert(fs.existsSync(pageFile), `J6[${href}]: resolves to a real page — a typo'd href ships as a doorbell that opens onto a 404`)
}

/** Run a probe expected to FAIL, with its console noise suppressed, and report
 *  whether it did. Keeps deliberate self-test failures out of the run output,
 *  where they read as real failures to anyone skimming. Synchronous only. */
function producedFailure(probe: () => void): boolean {
  const before = failed
  const realError = console.error
  console.error = () => {}
  try { probe() } finally { console.error = realError }
  const fired = failed > before
  failed = before
  failures.length = Math.min(failures.length, before)
  return fired
}

assert(producedFailure(() => assert(false, '(probe)')), 'SELF-TEST: assert() actually records a failure (the suite is not vacuous)')
assert(!producedFailure(() => assert(true, '(probe)')), 'SELF-TEST: assert() does not record a failure for a true condition')
assert(producedFailure(() => assertEqual([1, 2], [1, 3], '(probe)')), 'SELF-TEST: assertEqual() actually compares deeply')
assert(!producedFailure(() => assertEqual({ a: [1] }, { a: [1] }, '(probe)')), 'SELF-TEST: assertEqual() passes on structural equality')

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
