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

const SCORE_PAGE = 'src/app/score/page.tsx'
{
  const src = read(SCORE_PAGE)
  const marker = `from('${TABLE}').insert({`
  const at = src.indexOf(marker)
  assert(at > 0, `WRITE-1: found the ${TABLE} insert in ${SCORE_PAGE}`)

  if (at > 0) {
    // Walk braces from the opening '{' of the object literal to its match.
    const objStart = at + marker.length - 1
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
    // Top-level keys only: `  key: ...` or shorthand `  key,` at one indent level.
    const keys = [...objSrc.matchAll(/^\s{10}([a-z_][a-z0-9_]*)\s*[,:]/gm)].map((m) => m[1])

    assert(keys.length >= 10, `WRITE-3: parsed a plausible number of insert keys (got ${keys.length}: ${keys.join(',')})`)
    assert(keys.includes('action'), "WRITE-4: the insert supplies 'action' (declared NOT NULL — omitting it fails the write)")

    for (const k of keys) {
      assert(COLUMNS.includes(k), `WRITE-5[${k}]: insert key '${k}' exists on ${TABLE}`)
    }
  }
}

// ---------------------------------------------------------------------
// 3. The read paths — every selected column must exist.
// ---------------------------------------------------------------------

const READERS = [
  'src/app/dashboard/page.tsx',
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

// ---------------------------------------------------------------------
// 4. The silent-failure guard — the defect that let this hide for four months.
// ---------------------------------------------------------------------
{
  const src = read(SCORE_PAGE)
  assert(
    /if \(error\) \{[\s\S]{0,400}?setErrorMsg\(/.test(src),
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

console.log(`${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exit(1)
}
