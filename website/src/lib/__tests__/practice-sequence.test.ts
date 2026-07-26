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
assert(ALL_TABLES_READ.length === 10, `C6-COUNT: the route reads 10 tables (got ${ALL_TABLES_READ.length}) — 8 practice sources + 2 rhythm`)
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
  ['journal_entries', 'action_evaluations_v3'],
  'C8: the daily-rhythm tables are the journal and the action evaluation — not sequence steps, but read by the same route and so covered by C6'
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

const ALL_COPY = [
  ...PRACTICE_SEQUENCE.map((s) => `${s.name} ${s.doorbell}`),
  ...Object.values(PRACTICE_MODULE_COPY),
  ...Object.values(WELCOME_SEQUENCE_COPY),
  ...STAGE_PRACTICES.map((s) => s.note ?? ''),
].join(' ').toLowerCase()

for (const banned of ['streak', 'badge', 'points', 'leaderboard', 'level up', 'completion', 'completed', '100%', 'you have unlocked', 'congratulations', 'well done']) {
  assert(!ALL_COPY.includes(banned), `H1: no gamification language — '${banned}' must not appear in any user-visible string`)
}
assert(!/\b\d+\s*%/.test(ALL_COPY), 'H2: no percentages in any user-visible string')
assert(!/\b\d+\s+of\s+\d+\b/.test(ALL_COPY), 'H3: no "N of M" completion framing')

// ─── Self-test: the assertion machinery is live ───

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
