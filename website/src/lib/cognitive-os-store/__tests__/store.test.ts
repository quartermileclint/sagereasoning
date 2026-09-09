/**
 * store.test.ts - the Cognitive OS table step: store, migration and R17 wiring.
 *
 * Run: npx tsx src/lib/cognitive-os-store/__tests__/store.test.ts
 *
 * ---------------------------------------------------------------------------
 * WHY THIS LIVES IN `cognitive-os-store/` AND NOT IN `cognitive-os/`
 * ---------------------------------------------------------------------------
 * The Phase-1 library carries THREE purity guards over every .ts file in
 * `src/lib/cognitive-os/` (cognitive-os.test.ts §9.PURE x2 and §12.C9): no
 * `process.env`, no wall clock or randomness, and EVERY import must be a
 * relative sibling. §12.C9 is not a style rule - it was HARDENED after a PR19
 * MEDIUM found the original C9 "no executor" check defeated by import aliasing,
 * and it is what structurally guarantees the library cannot reach a network
 * client.
 *
 * A persistence layer necessarily breaks all three: it reads env, reads a
 * clock, and imports the Supabase client. Putting it inside the library would
 * have meant RELAXING that guard, which would weaken the very constraint the Q11
 * ruling turns on. So the layer sits OUTSIDE the library instead, and the guard
 * is left byte-untouched. The pure library stays pure; nothing in it imports
 * anything here.
 *
 * Caught by the Phase-1 battery going 149/0 -> 146/3 when the store was first
 * written in the wrong directory. Recorded because the guard doing its job is
 * the reason this file is where it is.
 *
 * WHAT THIS BATTERY IS FOR. The table step's load-bearing properties are not
 * "the code compiles" - they are:
 *   §1  the migration encodes the rulings STRUCTURALLY (no score column, ordinal
 *       confidence, the Q1 EXECUTE constraint, service-role-only RLS)
 *   §2  missing-table is benign but missing-COLUMN never is
 *   §3  erasure is verified by query and reports honestly, never by a capped
 *       returned representation
 *   §4  every list read that drives behaviour is paged
 *   §5  the four R17 surfaces are actually wired (source-grep pins)
 *   §6  the sweep is flag-gated and does no DB work when dark
 *   §7  the Q9 boundary cannot silently stop being machine-enforced
 *
 * §7 is the one a future session is most likely to break, so it reads the
 * migration FILE rather than trusting a comment.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  isMissingTableError,
  getCognitiveDataForOwner,
  deleteCognitiveDataForOwner,
  deleteCognitiveDataForCredential,
  purgeExpiredCognitive,
  CONTEXTS_TABLE,
  EVENTS_TABLE,
  CLAIMS_TABLE,
  BELIEF_STATES_TABLE,
  CHILD_TABLES,
} from '../store'
import { isCognitiveOsSweepEnabled } from '../sweep-flag'

/** This tsx/cjs setup does not support top-level await, so the async sections
 *  are queued here and run SEQUENTIALLY by the runner at the foot of the file.
 *  Sequential, not parallel, on purpose: each section drives a shared fake
 *  client and interleaving them would make a failure unattributable. */
const SECTIONS: (() => Promise<void>)[] = []

let passed = 0
let failed = 0
function assert(cond: boolean, msg: string): void {
  if (cond) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${msg}`)
  }
}

const repoRoot = path.resolve(__dirname, '../../../../..')
const websiteRoot = path.join(repoRoot, 'website')
const MIGRATION = path.join(websiteRoot, 'supabase-cognitive-os-core-migration.sql')
const sql = fs.readFileSync(MIGRATION, 'utf8')

/** The migration with every `--` comment line removed. Used where a pin must
 *  assert about EXECUTABLE SQL: the header prose legitimately discusses the very
 *  things some pins forbid (it records the SECURITY DEFINER cross-check, for
 *  instance), so scanning raw text produces false failures. */
const executableSql = sql
  .split('\n')
  .filter((l) => !l.trimStart().startsWith('--'))
  .join('\n')

/** Just the CREATE TABLE bodies, comments stripped - i.e. the COLUMN
 *  DEFINITIONS and nothing else. Deliberately excludes `COMMENT ON ... IS '...'`
 *  statements, whose string literals mention absent columns BY NAME in order to
 *  document their absence. A pin that scanned those would fail on a migration
 *  that is exactly right, which is worse than no pin: it teaches the next
 *  session to relax it. */
function createTableBodies(source: string): string {
  const bodies: string[] = []
  const re = /CREATE TABLE IF NOT EXISTS public\.\w+\s*\(/g
  // The match object is unused: only `re.lastIndex` is needed, and binding the
  // result would be an unread variable (TS6133 under `tsc --noEmit`).
  while (re.exec(source) !== null) {
    let depth = 1
    let i = re.lastIndex
    while (i < source.length && depth > 0) {
      if (source[i] === '(') depth++
      else if (source[i] === ')') depth--
      i++
    }
    bodies.push(source.slice(re.lastIndex, i - 1))
  }
  return bodies
    .join('\n')
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('--'))
    .join('\n')
}

const tableBodies = createTableBodies(sql)

/** ONE table's body, comments stripped.
 *
 * PR19 fold (2026-09-09, HIGH): the per-table pins previously searched from
 * ANY occurrence of the table's NAME within a character window. All four names
 * co-occur in the §PRE block's `table_name IN (...)` list, so every per-table
 * pin latched onto the FIRST table's columns and passed even when a later
 * table's column was deleted outright — mutation-proven. A pin must be anchored
 * in the body it claims to be about. */
function tableBody(name: string): string {
  const re = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${name}\\s*\\(`)
  const m = re.exec(sql)
  if (!m) return ''
  let depth = 1
  let i = m.index + m[0].length
  const start = i
  while (i < sql.length && depth > 0) {
    if (sql[i] === '(') depth++
    else if (sql[i] === ')') depth--
    i++
  }
  return sql
    .slice(start, i - 1)
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('--'))
    .join('\n')
}
const STORE_PATH = path.join(websiteRoot, 'src/lib/cognitive-os-store/store.ts')
const storeSrc = fs.readFileSync(STORE_PATH, 'utf8')
/** Re-read on demand, so a pin cannot silently assert against stale content. */
function storeSrcNow(): string {
  return fs.readFileSync(STORE_PATH, 'utf8')
}

// ============================================================================
// §1  THE MIGRATION ENCODES THE RULINGS STRUCTURALLY
// ============================================================================

// Non-vacuity floor: if the migration ever stops being readable, every §1 pin
// below would pass trivially against an empty string. Assert the traversal.
assert(sql.length > 5000, '§1.0 migration file is present and substantial (non-vacuity floor)')
assert(
  /CREATE TABLE IF NOT EXISTS public\.cognitive_contexts/.test(sql),
  '§1.0b migration actually creates the tables (the pins below are not matching prose)',
)

for (const t of ['cognitive_contexts', 'cognitive_events', 'cognitive_claims', 'cognitive_belief_states']) {
  assert(
    new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${t}\\b`).test(sql),
    `§1.1 ${t} is created`,
  )
  assert(
    new RegExp(`ALTER TABLE public\\.${t}\\s+ENABLE ROW LEVEL SECURITY`).test(sql),
    `§1.2 ${t} has RLS enabled`,
  )
  for (const role of ['PUBLIC', 'anon', 'authenticated']) {
    assert(
      new RegExp(`REVOKE ALL ON public\\.${t}\\s+FROM ${role};`).test(sql),
      `§1.3 ${t} revokes ALL from ${role}`,
    )
  }
  assert(
    new RegExp(`GRANT ALL ON public\\.${t}\\s+TO service_role;`).test(sql),
    `§1.4 ${t} grants to service_role`,
  )
  // Anchored in THIS table's own body — see tableBody's header for why a
  // character-window search from the table's name was vacuous.
  const body = tableBody(t)
  assert(body.length > 100, `§1.5a ${t}'s body was located (non-vacuity floor)`)
  assert(
    /retain_until\s+TIMESTAMPTZ NOT NULL/.test(body),
    `§1.5 ${t} carries retain_until IN ITS OWN DEFINITION`,
  )
  assert(
    /context_id|owner_user_id/.test(body),
    `§1.5b ${t}'s body carries an ownership path (root or FK)`,
  )
}

// The 2026-08-16 lesson: a policy whose NAME says service role while its SQL
// says USING (true) with no TO clause applies to EVERY role. The safe shape is
// ZERO policies plus explicit REVOKEs. Assert no policy is created at all.
assert(
  !/CREATE\s+POLICY/i.test(sql),
  '§1.6 migration creates ZERO policies (the founder_conversations defect shape is unreachable)',
)

// Q1 hard constraint, structural.
assert(
  /CHECK \(event_type <> 'EXECUTE' OR external_executor IS NOT NULL\)/.test(sql),
  '§1.7 EXECUTE cannot be stored without naming an external executor (Q1)',
)

// C3: confidence is ordinal TEXT, never cardinal.
assert(
  /confidence\s+TEXT NOT NULL CHECK \(confidence IN \(/.test(sql),
  '§1.8 confidence is a TEXT enum, so a cardinal [0,1] cannot be stored (C3)',
)
for (const rank of ['unsupported', 'weak', 'moderate', 'strong', 'established', 'not_yet_assessed']) {
  assert(sql.includes(`'${rank}'`), `§1.9 confidence CHECK admits ${rank}`)
}

// The band is present exactly when confidence is measured.
assert(
  /CHECK \(\(confidence = 'not_yet_assessed'\) = \(uncertainty_lower IS NULL\)\)/.test(sql),
  '§1.10 uncertainty band present iff confidence measured',
)

// Append-only history, and DELETE deliberately still available for R17c.
assert(
  /BEFORE UPDATE ON public\.cognitive_events/.test(sql),
  '§1.11 cognitive_events forbids UPDATE by trigger',
)
assert(
  !/BEFORE DELETE ON public\.cognitive_events/.test(sql),
  '§1.12 DELETE is NOT forbidden - erasure and the sweep need it',
)

// The trigger function must NOT be SECURITY DEFINER: a table-level REVOKE is
// invisible to one, which is the mentor_profiles RPC defect of 2026-08-16.
assert(
  !/SECURITY DEFINER/i.test(executableSql),
  '§1.13 migration creates NO SECURITY DEFINER function',
)
// ...and the header must still RECORD that the cross-check was run, so a future
// session knows it was considered rather than forgotten.
assert(
  /SECURITY DEFINER cross-check RUN/i.test(sql),
  '§1.13b the header records that the SECURITY DEFINER sweep was actually run',
)

// PR19 fold, TWO independent reviewers (2026-09-09), HIGH.
//
// The header previously quoted a NARROWER grep than the one that produced its
// numbers, so re-running the command as written returned a different answer.
// This project has shipped that exact defect before — see the corrected header
// of supabase-practice-family-rls-lockdown-migration.sql, itself a post-PR19
// correction of a miscounted SECURITY DEFINER sweep. Twice is a class.
//
// PR25: "a verification claim in a code comment carries its check." So this pin
// RE-RUNS the sweep rather than asserting that a sentence about it exists. A
// fabricated or stale count cannot survive it.
{
  assert(
    /--include="\*\.sql"/.test(sql),
    '§1.13c the header records the REPRODUCIBLE repo-wide command, not a narrower one',
  )

  const sqlFiles: string[] = []
  const skipDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build'])
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name))
      } else if (entry.name.endsWith('.sql')) {
        sqlFiles.push(path.join(dir, entry.name))
      }
    }
  }
  walk(repoRoot)

  assert(sqlFiles.length > 20, '§1.13d the .sql sweep actually traversed the repo (non-vacuity floor)')

  const definerFiles = sqlFiles.filter((f) =>
    /SECURITY DEFINER/i.test(fs.readFileSync(f, 'utf8')),
  )
  assert(
    definerFiles.length > 0,
    '§1.13e the sweep finds the SECURITY DEFINER files that DO exist (proves it can find them)',
  )

  // THE LOAD-BEARING RESULT: no OTHER SECURITY DEFINER file names a cognitive_
  // table. A table-level REVOKE is invisible to a SECURITY DEFINER function, so
  // this is the check that makes the RLS lockdown meaningful rather than nominal.
  const offenders = definerFiles.filter(
    (f) => !f.endsWith('supabase-cognitive-os-core-migration.sql') &&
      /\bcognitive_\w+/.test(fs.readFileSync(f, 'utf8')),
  )
  assert(
    offenders.length === 0,
    `§1.13f NO SECURITY DEFINER function touches a cognitive_ table (found: ${offenders.join(', ')})`,
  )
}

// Ownership root: identity required, children cascade.
assert(
  /CHECK \(owner_user_id IS NOT NULL OR credential_ref IS NOT NULL\)/.test(sql),
  '§1.14 every context is reachable by at least one R17 path',
)
assert(
  (sql.match(/REFERENCES public\.cognitive_contexts\(context_id\) ON DELETE CASCADE/g) ?? []).length === 3,
  '§1.15 all THREE child tables FK to the ownership root with CASCADE',
)
assert(
  /owner_user_id\s+UUID REFERENCES public\.profiles\(id\) ON DELETE CASCADE/.test(sql),
  '§1.16 the ownership root cascades from profiles',
)

// The four migration sections the founder walk depends on.
for (const section of ['§PRE', '§APPLY', '§VERIFY', '§INVERSE']) {
  assert(sql.includes(section), `§1.17 migration carries the ${section} section`)
}

// ============================================================================
// §2  MISSING TABLE IS BENIGN; MISSING COLUMN NEVER IS
// ============================================================================

assert(isMissingTableError({ code: '42P01' }), '§2.1 42P01 (undefined_table) is benign')
assert(isMissingTableError({ code: 'PGRST205' }), '§2.2 PGRST205 is benign')
assert(
  isMissingTableError({ message: 'relation "cognitive_events" does not exist' }),
  '§2.3 a does-not-exist message is benign',
)

// THE HAZARD. PGRST204 is an unknown COLUMN and its message contains "schema
// cache", so an unhardened regex folds it in as benign - turning a schema drift
// into a false "erased, 0 rows" on a path whose whole job is erasure.
assert(
  !isMissingTableError({ code: 'PGRST204', message: "Could not find the 'foo' column of 'cognitive_claims' in the schema cache" }),
  '§2.4 PGRST204 (missing COLUMN) is NEVER benign, despite matching "schema cache"',
)
assert(
  !isMissingTableError({ code: '42703', message: 'column "foo" does not exist' }),
  '§2.5 42703 (undefined_column) is NEVER benign, despite matching "does not exist"',
)
assert(
  !isMissingTableError({ message: 'column "bar" of relation "cognitive_claims" does not exist' }),
  '§2.6 a column-mentioning message is never benign even with no code',
)
assert(!isMissingTableError(null), '§2.7 null is not an error')
assert(
  !isMissingTableError({ code: '23505', message: 'duplicate key value' }),
  '§2.8 a real constraint violation is not benign',
)

// ============================================================================
// §3  ERASURE IS VERIFIED BY QUERY AND REPORTS HONESTLY
// ============================================================================

/** A minimal PostgREST double. Records every call so the pins can assert what
 *  the store actually asked the database, not merely what it returned. */
type Row = Record<string, unknown>
interface Scripted {
  counts?: Record<string, number[]>
  rows?: Record<string, Row[]>
  errorOn?: Record<string, { code?: string; message?: string }>
}
function fakeClient(script: Scripted) {
  const calls: { table: string; op: string; column?: string; value?: unknown; head?: boolean }[] = []
  const countCursor: Record<string, number> = {}
  const client = {
    from(table: string) {
      const builder = {
        _op: 'select',
        _head: false,
        _column: undefined as string | undefined,
        _value: undefined as unknown,
        select(_cols: string, opts?: { count?: string; head?: boolean }) {
          this._head = opts?.head === true
          return this
        },
        delete() {
          this._op = 'delete'
          return this
        },
        eq(column: string, value: unknown) {
          this._column = column
          this._value = value
          return this.settle()
        },
        lt(column: string, value: unknown) {
          this._column = column
          this._value = value
          return this.settle()
        },
        gt() {
          return this
        },
        order() {
          return this
        },
        not() {
          return this
        },
        limit() {
          return this.settle()
        },
        settle() {
          const self = this
          return {
            ...self,
            then(resolve: (v: unknown) => void) {
              calls.push({ table, op: self._op, column: self._column, value: self._value, head: self._head })
              const err = script.errorOn?.[`${table}:${self._op}`]
              if (err) return resolve({ data: null, count: null, error: err })
              if (self._head) {
                const seq = script.counts?.[table] ?? [0]
                const i = countCursor[table] ?? 0
                countCursor[table] = i + 1
                return resolve({ data: null, count: seq[Math.min(i, seq.length - 1)], error: null })
              }
              return resolve({ data: script.rows?.[table] ?? [], count: null, error: null })
            },
          }
        },
      }
      return builder
    },
  }
  return { client: client as never, calls }
}

SECTIONS.push(async () => {
  // A context with 2 events. Pre-count 2, post-count 0 => deleted 2, honest.
  const { client, calls } = fakeClient({
    rows: { [CONTEXTS_TABLE]: [{ context_id: 'ctx-1' }] },
    counts: {
      [EVENTS_TABLE]: [2, 0],
      [CLAIMS_TABLE]: [0],
      [BELIEF_STATES_TABLE]: [0],
      [CONTEXTS_TABLE]: [1, 0],
    },
  })
  const r = await deleteCognitiveDataForCredential('api_key:c1', client)
  assert(r.ok, '§3.1 credential erasure succeeds')
  if (r.ok) {
    assert(r.value.events === 2, '§3.2 event count comes from the exact pre-count, not a capped representation')
    assert(r.value.contexts === 1, '§3.3 the context row itself is counted')
  }
  // The count call must be a HEAD count: a returned representation is capped at
  // 1,000 rows, so counting it would under-report a large erasure as success.
  assert(
    calls.some((c) => c.table === EVENTS_TABLE && c.head === true),
    '§3.4 counts are taken with head:true (not subject to the 1,000-row cap)',
  )
  // Children before the parent.
  const firstCtxDelete = calls.findIndex((c) => c.table === CONTEXTS_TABLE && c.op === 'delete')
  const firstEvtDelete = calls.findIndex((c) => c.table === EVENTS_TABLE && c.op === 'delete')
  assert(
    firstEvtDelete !== -1 && firstEvtDelete < firstCtxDelete,
    '§3.5 children are deleted before the parent',
  )
})

SECTIONS.push(async () => {
  // THE DISHONEST-SUCCESS CASE: rows survive the delete. Must be an ERROR, never
  // a quiet partial success — "erasure is verified by query, never inferred".
  const { client } = fakeClient({
    rows: { [CONTEXTS_TABLE]: [{ context_id: 'ctx-1' }] },
    counts: {
      [EVENTS_TABLE]: [5, 3], // 3 survive
      [CLAIMS_TABLE]: [0],
      [BELIEF_STATES_TABLE]: [0],
      [CONTEXTS_TABLE]: [1, 0],
    },
  })
  const r = await deleteCognitiveDataForCredential('api_key:c1', client)
  assert(!r.ok, '§3.6 a delete that leaves rows behind FAILS rather than reporting success')
  if (!r.ok) {
    assert(/NOT complete/.test(r.error), '§3.7 the error says erasure is incomplete')
  }
})

SECTIONS.push(async () => {
  // Missing table => benign empty, on every path.
  const missing = { code: '42P01', message: 'relation does not exist' }
  const del = await deleteCognitiveDataForCredential(
    'api_key:c1',
    fakeClient({ errorOn: { [`${CONTEXTS_TABLE}:select`]: missing } }).client,
  )
  assert(del.ok, '§3.8 credential erasure before the migration is benign success')

  const exp = await getCognitiveDataForOwner(
    'user-1',
    [],
    fakeClient({ errorOn: { [`${CONTEXTS_TABLE}:select`]: missing } }).client,
  )
  assert(exp.ok, '§3.9 export before the migration is benign success')
  if (exp.ok) {
    assert(exp.value.contexts.length === 0, '§3.10 and returns nothing rather than erroring')
  }

  // A missing COLUMN must NOT be benign on the same paths.
  const colErr = { code: 'PGRST204', message: "Could not find the 'x' column in the schema cache" }
  const badDel = await deleteCognitiveDataForCredential(
    'api_key:c1',
    fakeClient({ errorOn: { [`${CONTEXTS_TABLE}:select`]: colErr } }).client,
  )
  assert(!badDel.ok, '§3.11 a schema-drift COLUMN error fails honestly, never a false "erased"')
})

SECTIONS.push(async () => {
  // The owner path must query BOTH arms: owner_user_id AND each credential_ref.
  const { client, calls } = fakeClient({
    rows: { [CONTEXTS_TABLE]: [] },
    counts: { [CONTEXTS_TABLE]: [0] },
  })
  const r = await deleteCognitiveDataForOwner('user-1', ['api_key:a', 'api_key:b'], client)
  assert(r.ok, '§3.12 owner deletion succeeds')
  assert(
    calls.some((c) => c.column === 'owner_user_id' && c.value === 'user-1'),
    '§3.13 arm 1: contexts owned directly are queried',
  )
  assert(
    calls.some((c) => c.column === 'credential_ref' && c.value === 'api_key:a') &&
      calls.some((c) => c.column === 'credential_ref' && c.value === 'api_key:b'),
    '§3.14 arm 2: EVERY owned credential is queried (the Stoa PR19 HIGH)',
  )
})

// ============================================================================
// §4  ROW-CAP DISCIPLINE
// ============================================================================

assert(
  storeSrc.includes("import { pagedRows }"),
  '§4.1 the store uses the paged-select helper',
)
// A raw .select('*') without paging on a behaviour-driving read is the defect
// class the 2026-09 sweep closed. The only bare selects here must be head counts.
{
  const bareSelects = storeSrc.match(/\.select\('\*'\)(?!\s*,)/g) ?? []
  assert(bareSelects.length === 0, '§4.2 no unpaged .select(\'*\') read (head counts pass an options object)')
}
assert(
  (storeSrc.match(/count: 'exact', head: true/g) ?? []).length >= 2,
  '§4.3 counts use exact+head so they are not capped',
)
assert(
  !/\.delete\(\)[\s\S]{0,80}\.select\(/.test(storeSrc),
  '§4.4 deletion counts never come from a capped DELETE...RETURNING representation',
)

// ============================================================================
// §5  THE FOUR R17 SURFACES ARE ACTUALLY WIRED
// ============================================================================

const wirings: [string, string, string][] = [
  ['src/app/api/user/delete/route.ts', 'deleteCognitiveDataForOwner', 'R17c account deletion'],
  ['src/app/api/user/export/route.ts', 'getCognitiveDataForOwner', 'R17i Art 20 export'],
  ['src/lib/user-data-gathering.ts', 'getCognitiveDataForOwner', 'R17i Art 15 access'],
  ['src/lib/consumer-erasure.ts', 'deleteCognitiveDataForCredential', 'R17c credential erasure'],
]
for (const [file, symbol, what] of wirings) {
  const src = fs.readFileSync(path.join(websiteRoot, file), 'utf8')
  assert(src.includes(symbol), `§5.1 ${what}: ${file} calls ${symbol}`)
  // Wired, not merely imported.
  const afterImports = src.split('\n').filter((l) => !l.trimStart().startsWith('import')).join('\n')
  assert(afterImports.includes(symbol), `§5.2 ${what}: ${symbol} is CALLED, not only imported`)
}

// Erasure that happened but was not REPORTED is the PA-8 defect. Both the
// compliance ledger and the response must carry the count.
{
  const eraseHandler = fs.readFileSync(
    path.join(websiteRoot, 'src/app/api/credential/erase/handler.ts'),
    'utf8',
  )
  assert(
    /tables_cleared:[\s\S]*?cognitive_contexts/.test(eraseHandler),
    '§5.3 the compliance ledger names the cognitive-os tables (the PA-8 lesson)',
  )
  assert(
    /cognitive_rows_deleted: result\.value\.cognitive_deleted/.test(eraseHandler),
    '§5.4 the erase response reports the count',
  )
  const deleteRoute = fs.readFileSync(path.join(websiteRoot, 'src/app/api/user/delete/route.ts'), 'utf8')
  assert(
    /tables_cleared:[\s\S]*?'cognitive_contexts'/.test(deleteRoute),
    '§5.5 account deletion names the cognitive-os tables in its compliance log',
  )
  // The two-arm requirement, at the CALL SITE: passing no credential refs would
  // silently orphan every agent-created context.
  assert(
    /deleteCognitiveDataForOwner\(userId, cogCredentialRefs\)/.test(deleteRoute),
    '§5.6 account deletion passes the resolved credential refs (arm 2 is live)',
  )
}

// ============================================================================
// §6  THE SWEEP IS FLAG-GATED AND DARK BY DEFAULT
// ============================================================================

{
  const before = process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED
  delete process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED
  assert(!isCognitiveOsSweepEnabled(), '§6.1 unset => sweep dark')
  process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED = 'false'
  assert(!isCognitiveOsSweepEnabled(), "§6.2 'false' => sweep dark")
  process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED = 'TRUE'
  assert(!isCognitiveOsSweepEnabled(), '§6.3 only the exact string "true" enables it')
  process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED = 'true'
  assert(isCognitiveOsSweepEnabled(), '§6.4 "true" => sweep enabled')
  if (before === undefined) delete process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED
  else process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED = before
}

SECTIONS.push(async () => {
  // Fail-honest: a purge error is REPORTED, never thrown and never fail-closed.
  const { client } = fakeClient({
    counts: { [EVENTS_TABLE]: [3], [CLAIMS_TABLE]: [0], [BELIEF_STATES_TABLE]: [0], [CONTEXTS_TABLE]: [0] },
    errorOn: { [`${EVENTS_TABLE}:delete`]: { code: '42501', message: 'permission denied' } },
  })
  const r = await purgeExpiredCognitive(client)
  assert(r.error !== null, '§6.5 a failed purge is reported in `error`')
  assert(typeof r.deleted === 'number', '§6.6 the sweep still returns its cron shape (never throws)')
})

SECTIONS.push(async () => {
  // Children swept before contexts, so a parent is never removed while its
  // children are still being counted.
  const { client, calls } = fakeClient({
    counts: { [EVENTS_TABLE]: [0], [CLAIMS_TABLE]: [0], [BELIEF_STATES_TABLE]: [0], [CONTEXTS_TABLE]: [0] },
  })
  await purgeExpiredCognitive(client)
  const order = calls.map((c) => c.table)
  assert(
    order.indexOf(EVENTS_TABLE) < order.indexOf(CONTEXTS_TABLE),
    '§6.7 the sweep visits children before the ownership root',
  )
  assert(
    calls.every((c) => c.column === undefined || c.column === 'retain_until'),
    '§6.8 the sweep filters on retain_until only (never a blanket delete)',
  )
})

assert(CHILD_TABLES.length === 3, '§6.9 three child tables are known to the store')
assert(!(CHILD_TABLES as readonly string[]).includes(CONTEXTS_TABLE), '§6.10 the root is not a child of itself')

// ============================================================================
// §7  THE Q9 BOUNDARY CANNOT SILENTLY STOP BEING MACHINE-ENFORCED
// ============================================================================
//
// ⚠ READ THIS BEFORE "FIXING" A FAILURE HERE.
//
// The R17 export returns WHOLE ROWS. That is safe for exactly one reason: the
// core slice persists NO Cognitive OS scalar, so there is nothing at rest that
// Q9 forbids returning through an API route a consumer can call.
//
// If a later slice adds a score column, THIS PIN FAILS. That failure is the
// system working. The correct response is NOT to relax the pin - it is to make
// the export an explicit projection that strips the score, and only then to
// narrow this pin to the columns that remain safe. Relaxing it would leave Q9
// enforced by a comment, which is precisely what the ruling forbids.

{
  // Column definitions only, so prose in the header cannot satisfy or trip this.
  assert(tableBodies.length > 1000, '§7.0 the CREATE TABLE bodies were located (non-vacuity floor)')
  assert(
    /confidence\s+TEXT NOT NULL/.test(tableBodies),
    '§7.0b the extractor really returned column definitions, not prose',
  )
  assert(
    !/COMMENT ON TABLE/.test(tableBodies),
    '§7.0c the extractor excludes COMMENT ON literals (which name absent columns to document them)',
  )

  const columnLines = tableBodies

  for (const forbidden of [
    'epistemic_debt_score',
    'identity_coherence_score',
    'debt_score',
    'coherence_score',
    'identity_relevance',
    'interpretive_context',
  ]) {
    assert(
      !new RegExp(`\\b${forbidden}\\b`).test(columnLines),
      `§7.1 NO ${forbidden} column is defined (Q9 / Q-R7 / C6)`,
    )
  }

  // And the debt COMPONENTS are present - the positive half. Without this, a
  // migration that persisted no debt at all would pass §7.1 vacuously.
  for (const component of [
    'debt_unresolved_claims',
    'debt_unsupported_assumptions',
    'debt_contradictions',
    'debt_stale_evidence',
    'debt_pending_revisions',
  ]) {
    assert(columnLines.includes(component), `§7.2 the debt component ${component} IS persisted`)
  }

  // The migration's own VERIFY step must check for score columns on the live DB,
  // not only here: a schema can drift without this file changing.
  assert(
    /information_schema\.columns[\s\S]{0,600}debt_score/.test(sql),
    '§7.3 §VERIFY queries the live schema for score columns too',
  )
}

// The export call sites must not have quietly switched to a projection that
// drops rows, nor added a score. Assert the reason is recorded where a future
// editor will see it.
for (const file of ['src/app/api/user/export/route.ts', 'src/lib/user-data-gathering.ts']) {
  const src = fs.readFileSync(path.join(websiteRoot, file), 'utf8')
  assert(
    /score column/i.test(src),
    `§7.4 ${file} records WHY whole rows are safe, at the call site`,
  )
}

// ============================================================================
// §8  PR19 REGRESSION PINS - one per upheld independent-review finding
// ============================================================================
// Three reviewers, three dimensions, 2026-09-09. Every finding below was
// verified first-hand at source before folding; none was taken on trust.

{
  // §8.1 (dim 3, HIGH) - the Art 15 access path returned ok with a SILENTLY
  // incomplete copy when credential resolution failed, and its comment claimed
  // the opposite. "Resolution failed" and "no credentials" must not render alike.
  const gathering = fs.readFileSync(path.join(websiteRoot, 'src/lib/user-data-gathering.ts'), 'utf8')
  assert(
    /let cognitiveCredentialRefsError: string \| null = null/.test(gathering),
    '§8.1a the access path carries the credential-resolution ERROR, not only the list',
  )
  assert(
    /cognitiveCredentialRefsError = credError/.test(gathering),
    '§8.1b the error is captured on the failure branch',
  )
  assert(
    /if \(cognitiveCredentialRefsError !== null\)[\s\S]{0,400}?data\.cognitive_os = \{[\s\S]{0,200}?error:/.test(gathering),
    '§8.1c a resolution failure REPORTS rather than returning a partial copy as complete',
  )
  // Non-vacuity: the guarded call must still exist on the success branch.
  assert(
    /getCognitiveDataForOwner\(userId, cognitiveCredentialRefs\)/.test(gathering),
    '§8.1d the success branch still performs the two-arm read',
  )

  // §8.2 (dim 3, LOW/MED) - the sweep reported a PRE-delete count, which
  // overstates its own work if a concurrent erasure removed some counted rows.
  assert(
    /recount \$\{table\} after purge|recount \${table} after purge/.test(storeSrcNow()) ||
      /recount .* after purge/.test(storeSrcNow()),
    '§8.2a the sweep RE-COUNTS after deleting',
  )
  assert(
    /counts\[table\] = expired - left/.test(storeSrcNow()),
    '§8.2b the sweep reports what was actually removed, not what was expired',
  )
  assert(
    /retention NOT enforced/.test(storeSrcNow()),
    '§8.2c a sweep that leaves expired rows behind says so',
  )

  // §8.3 (dim 3, NIT) - the delete route deliberately diverges from its
  // siblings; the divergence must stay EXPLAINED, not drift back to silent.
  const deleteRoute2 = fs.readFileSync(path.join(websiteRoot, 'src/app/api/user/delete/route.ts'), 'utf8')
  assert(
    /DELIBERATE DIVERGENCE/.test(deleteRoute2),
    '§8.3 the erasure-vs-disclosure asymmetry is stated where it is made',
  )

  // §8.4 (dim 1 + dim 2, HIGH) - the migration's SECURITY DEFINER evidence must
  // reproduce. The executing form of this is §1.13d-f above; this pin guards the
  // narrower failure the reviewers actually found: a quoted command that cannot
  // produce the quoted number.
  assert(
    !/grep -rn "SECURITY DEFINER" supabase\/migrations\/ operations\/migrations\/\s*\n-- returns/.test(sql),
    '§8.4 the header no longer quotes a command that cannot produce its own numbers',
  )
}

// ============================================================================

void (async () => {
  for (const section of SECTIONS) await section()
  console.log(`\ncognitive-os store + table step: ${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
})()
