/**
 * action-evaluations-v3-schema-drift.test.ts
 *
 * Run via: npx tsx src/lib/__tests__/action-evaluations-v3-schema-drift.test.ts
 * (bare — pure source parsing, no Supabase chain, no --env-file.)
 *
 * WHY THIS EXISTS
 *
 * On 2026-07-26 a production check returned `count = 0` on `action_evaluations_v3`:
 * NO human action evaluation had ever been saved. Root cause — the score page's
 * insert wrote two columns that exist on no schema for that table
 * (`action_description` and `evaluated_by`) while never supplying `action`, which
 * is declared NOT NULL. Every save since 2026-03-21 failed with PGRST204, and the
 * error was discarded (`if (!error) setSaved(true)` with no else branch), so a
 * totally broken write path was indistinguishable from a slow render.
 * `/api/practice-calendar` was selecting the same non-existent column.
 *
 * This is the SAME CLASS as the 2026-06-18 Sage Reflect completion 503 (an A1/PR7
 * column drift that existed in no migration, latent because the path was never
 * exercised) — which is why that fix shipped `reflect-completion-schema-drift.test.ts`.
 * This is its sibling for the human action-evaluation path.
 *
 * WHAT IT GUARDS: every column name any code writes to or reads from
 * `action_evaluations_v3` must exist in the schema of record. It cannot detect
 * drift in the LIVE database — only disagreement between the repo's code and the
 * repo's own migration. That is precisely the disagreement that caused this outage.
 *
 * Rules served: PR10 (root cause, not symptom); KG1; KG7 (JSONB columns are in the
 * asserted set); AC4 (invocation-level testing of a path unit tests cannot reach).
 *
 * UPDATED 2026-08-23 (Class B route-change session, RLS-vs-route-enforcement
 * survey row 19): the write path this test guards MOVED from a direct browser
 * insert in `src/app/score/page.tsx` to a server route,
 * `src/app/api/score/save/route.ts` — the score page now calls that route via
 * `authFetch` instead of inserting into `action_evaluations_v3` itself. The
 * read path in `src/app/dashboard/page.tsx` moved the same way, to
 * `src/app/api/action-evaluations/route.ts`. This test now tracks both new
 * files; the two client pages no longer appear in either check, which is the
 * correct outcome of the refactor, not a coverage loss (they no longer touch
 * the table at all — confirmed by grep before this test was updated).
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
  }
}

const websiteRoot = path.resolve(__dirname, '../..', '..')
const read = (rel: string) => fs.readFileSync(path.join(websiteRoot, rel), 'utf-8')

const TABLE = 'action_evaluations_v3'

// ---------------------------------------------------------------------
// 1. The schema of record — parse the CREATE TABLE column list.
// ---------------------------------------------------------------------

function schemaColumns(): string[] {
  const sql = read('supabase-v3-migration.sql')
  const start = sql.indexOf(`CREATE TABLE IF NOT EXISTS public.${TABLE} (`)
  assert(start >= 0, `SCHEMA-1: found the CREATE TABLE for ${TABLE}`)
  if (start < 0) return []

  // Read to the line that closes the statement (a lone ");" at column 0).
  const body = sql.slice(start)
  const end = body.indexOf('\n);')
  assert(end > 0, 'SCHEMA-2: found the end of the CREATE TABLE statement')

  const cols: string[] = []
  for (const raw of body.slice(0, end).split('\n').slice(1)) {
    const line = raw.trim()
    if (!line || line.startsWith('--')) continue
    // A column definition begins with an identifier followed by a type.
    const m = /^([a-z_][a-z0-9_]*)\s+[A-Za-z]/.exec(line)
    if (m && !['constraint', 'primary', 'unique', 'foreign', 'check'].includes(m[1])) {
      cols.push(m[1])
    }
  }
  return cols
}

const COLUMNS = schemaColumns()

assert(COLUMNS.length >= 20, `SCHEMA-3: parsed a plausible column count (got ${COLUMNS.length})`)
// Anchor a few known columns so a parser regression cannot silently yield a set
// that happens to contain whatever the code asks for.
for (const anchor of ['user_id', 'action', 'katorthoma_proximity', 'created_at', 'oikeiosis_context']) {
  assert(COLUMNS.includes(anchor), `SCHEMA-4[${anchor}]: the parsed schema contains '${anchor}'`)
}
// The two names that caused the outage must NOT be in the schema. If a future
// migration genuinely adds them, this test should be updated deliberately.
for (const ghost of ['action_description', 'evaluated_by']) {
  assert(!COLUMNS.includes(ghost), `SCHEMA-5[${ghost}]: '${ghost}' is NOT a column of ${TABLE}`)
}

// ---------------------------------------------------------------------
// 2. The write path — every key the score insert sends must exist.
// ---------------------------------------------------------------------

// The write path (moved 2026-08-23, see the UPDATED note above): a server
// route, not the client page. `.from('action_evaluations_v3')` and
// `.insert({` are on separate lines here (a chained call split across
// lines), so the marker search looks for `.insert({` within a short window
// after the `.from(...)` call rather than assuming adjacency.
const WRITE_PATH_FILE = 'src/app/api/score/save/route.ts'
{
  const src = read(WRITE_PATH_FILE)
  const fromMarker = `from('${TABLE}')`
  const fromAt = src.indexOf(fromMarker)
  assert(fromAt > 0, `WRITE-1: found the ${TABLE} .from(...) in ${WRITE_PATH_FILE}`)

  const insertMarker = '.insert({'
  const insertAt = fromAt > 0 ? src.indexOf(insertMarker, fromAt) : -1
  assert(
    insertAt > 0 && insertAt - fromAt < 100,
    `WRITE-1b: found .insert({ shortly after the ${TABLE} .from(...) in ${WRITE_PATH_FILE}`
  )

  if (insertAt > 0) {
    // Walk braces from the opening '{' of the object literal to its match.
    const objStart = insertAt + insertMarker.length - 1
    let depth = 0
    let objEnd = -1
    for (let i = objStart; i < src.length; i++) {
      if (src[i] === '{') depth++
      else if (src[i] === '}') {
        depth--
        if (depth === 0) { objEnd = i; break }
      }
    }
    assert(objEnd > objStart, 'WRITE-2: matched the insert object literal braces')

    const objSrc = src.slice(objStart + 1, objEnd)
    // Top-level keys only: `  key: ...` or shorthand `  key,` at one indent
    // level — any amount of leading whitespace, since the write path's own
    // indentation is not what this test is guarding (the schema is).
    const keys = [...objSrc.matchAll(/^\s+([a-z_][a-z0-9_]*)\s*[,:]/gm)].map((m) => m[1])

    assert(keys.length >= 10, `WRITE-3: parsed a plausible number of insert keys (got ${keys.length}: ${keys.join(',')})`)
    assert(keys.includes('action'), "WRITE-4: the insert supplies 'action' (declared NOT NULL — omitting it fails the write)")

    for (const k of keys) {
      assert(COLUMNS.includes(k), `WRITE-5[${k}]: insert key '${k}' exists on ${TABLE}`)
    }
  }
}

// The client page no longer touches the table at all — confirm that stays
// true, so a future regression re-adding a direct client insert is caught
// (rather than this test silently having nothing left to say about it).
{
  const src = read('src/app/score/page.tsx')
  assert(
    !src.includes(`from('${TABLE}')`),
    `WRITE-6: src/app/score/page.tsx no longer queries ${TABLE} directly (writes go through ${WRITE_PATH_FILE})`
  )
}

// ---------------------------------------------------------------------
// 3. The read paths — every selected column must exist.
// ---------------------------------------------------------------------

const READERS = [
  // Moved 2026-08-23 (Class B route-change session): the dashboard's own
  // direct select moved here, server-side, behind requireAuth.
  'src/app/api/action-evaluations/route.ts',
  'src/app/api/practice-calendar/route.ts',
  'src/app/api/milestones/route.ts',
]

let selectsChecked = 0
for (const rel of READERS) {
  const src = read(rel)
  const re = new RegExp(`from\\('${TABLE}'\\)[\\s\\S]{0,600}?\\.select\\(\\s*'([^']+)'`, 'g')
  for (const m of src.matchAll(re)) {
    selectsChecked++
    for (const col of m[1].split(',').map((c) => c.trim()).filter(Boolean)) {
      assert(COLUMNS.includes(col), `READ[${rel}]: selected column '${col}' exists on ${TABLE}`)
    }
  }
}
assert(selectsChecked >= 3, `READ-1: found a select on ${TABLE} in each reader (got ${selectsChecked})`)

// The dashboard page no longer touches the table at all — same regression
// guard as WRITE-6 above, for the read side.
{
  const src = read('src/app/dashboard/page.tsx')
  assert(
    !src.includes(`from('${TABLE}')`),
    `READ-2: src/app/dashboard/page.tsx no longer queries ${TABLE} directly (reads go through src/app/api/action-evaluations/route.ts)`
  )
}

// ---------------------------------------------------------------------
// 4. The silent-failure guard — the defect that let this hide for four months.
// ---------------------------------------------------------------------
{
  // The loud-failure UX still lives client-side — it now reacts to a failed
  // fetch to /api/score/save rather than a raw Supabase {error}, but the
  // console.error + setErrorMsg contract this guards is unchanged.
  //
  // WINDOW WIDENED 2026-08-31 (400 -> 1200): the branch legitimately grew when
  // it began surfacing the SERVER'S message (PR19 found the route justified
  // 400-on-breach on the ground that the practitioner can act on it, while this
  // page discarded the actionable text and showed a generic "try again"). The
  // window is a proximity heuristic, not the contract — what is being guarded is
  // that a failed save is never silently discarded, which the two assertions
  // below still state.
  const src = read('src/app/score/page.tsx')
  assert(
    /if \(error\) \{[\s\S]{0,1200}?setErrorMsg\(/.test(src),
    'LOUD-1: a failed evaluation save surfaces a message to the practitioner (never silently discarded)'
  )
  assert(
    /console\.error\('Failed to save evaluation:'/.test(src),
    'LOUD-2: a failed evaluation save is logged with the underlying error object'
  )
}

// ---------------------------------------------------------------------
// 5. Non-vacuity — prove the checks can actually fail.
// ---------------------------------------------------------------------
{
  assert(!COLUMNS.includes('a_column_that_does_not_exist'),
    'NV-1: the column set does not contain arbitrary names (parser is not returning a catch-all)')
  // The exact historical bug must be detectable by the WRITE-5 rule.
  assert(!COLUMNS.includes('action_description'),
    "NV-2: WRITE-5 would have caught the real bug — 'action_description' is not in the schema set")
}

// ---------------------------------------------------------------------
// 6. ENUM PARITY — the route's own copies of two DB CHECK vocabularies.
//
// Added 2026-08-31 with the R20a perimeter rebuild. The mentor ruled that
// katorthoma_proximity and kathekon_quality are EXCLUDED from distress
// screening because prose cannot persist in them — but the original ground for
// that ("there is a CHECK constraint") is a criterion enforced in a DIFFERENT
// FILE, which is the same shape of reasoning the ruling rejected for the
// seven-field scope. So the route now validates both enums ITSELF.
//
// That trade is only sound if the route's literal lists cannot drift from the
// constraints they mirror. Hand-maintained lists in this codebase HAVE drifted
// undetected — the R20a perimeter count itself drifted from 16 to 44 with an
// anti-drift instruction embedded in the very artifact that was drifting. These
// assertions are what stop the exclusion ground from quietly becoming false.
//
// If a future migration widens either CHECK, this goes red and the route must
// be updated in the same change.
// ---------------------------------------------------------------------
{
  const routeSrc = read(WRITE_PATH_FILE)
  const migrationSrc = read('supabase-v3-migration.sql')

  for (const [column, constName] of [
    ['katorthoma_proximity', 'KATORTHOMA_PROXIMITY_VALUES'],
    ['kathekon_quality', 'KATHEKON_QUALITY_VALUES'],
  ] as const) {
    const label = `ENUM-${column}`

    // Pull the CHECK vocabulary out of the migration.
    const checkRe = new RegExp(`${column}\\s+TEXT[^,]*?CHECK\\s*\\(\\s*${column}\\s+IN\\s*\\(([^)]*)\\)`, 'i')
    const checkMatch = checkRe.exec(migrationSrc)
    assert(checkMatch !== null, `${label}-1: the migration still declares a CHECK vocabulary for ${column}`)
    if (!checkMatch) continue
    const dbValues = checkMatch[1]
      .split(',')
      .map((v) => v.trim().replace(/^'|'$/g, ''))
      .filter(Boolean)
      .sort()

    // Pull the route's literal list.
    const constRe = new RegExp(`const ${constName} = \\[([^\\]]*)\\]`)
    const constMatch = constRe.exec(routeSrc)
    assert(constMatch !== null, `${label}-2: the route declares ${constName}`)
    if (!constMatch) continue
    const routeValues = constMatch[1]
      .split(',')
      .map((v) => v.trim().replace(/^'|'$/g, ''))
      .filter(Boolean)
      .sort()

    assert(dbValues.length > 0, `${label}-3: the parsed DB vocabulary is non-empty (parser non-vacuity)`)
    assert(
      JSON.stringify(routeValues) === JSON.stringify(dbValues),
      `${label}-4: the route's ${constName} matches the DB CHECK exactly ` +
        `(route: [${routeValues.join(', ')}] vs DB: [${dbValues.join(', ')}]) — ` +
        `a drift here silently falsifies the ruled exclusion ground for this field`
    )
    assert(
      routeSrc.includes(`${constName}.includes(`),
      `${label}-5: the route actually USES ${constName} to validate — a declared-but-unused list enforces nothing`
    )
  }
}

console.log(`${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exit(1)
}
