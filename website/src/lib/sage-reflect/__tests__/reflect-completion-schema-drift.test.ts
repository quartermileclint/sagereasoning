/**
 * reflect-completion-schema-drift.test.ts — guard against code-vs-schema drift on
 * the Sage Reflect COMPLETION write path.
 *
 * WHY THIS EXISTS (Sage Practice Benchmark v1, 2026-06-16):
 *   persistCompletion() spreads deriveCrossSessionScalars() (A1/PR7) into its
 *   UPDATE — writing `complexity` + `calibration_all_correct`, two columns that
 *   existed in NO migration. PostgREST rejected the UPDATE (PGRST204) → the route
 *   mapped it to 503 — on EVERY reflection completion, for EVERY agent. It was
 *   LATENT because reflect-completion was never exercised in production until the
 *   benchmark hit it. Fixed by supabase-sage-reflect-a1-columns-migration.sql.
 *
 * WHAT THIS GUARDS:
 *   Every column key the completion row-builders EMIT must exist in a migration
 *   .sql for its table. A future builder column added without a companion
 *   migration fails HERE (in CI, deterministically) instead of 503-ing in prod.
 *   This test reads the ACTUAL migration SQL (not a hand-maintained list), so it
 *   stays correct as migrations evolve, and it calls the REAL pure row-builders,
 *   so it stays correct as the builders evolve. It would have caught the original
 *   bug (complexity / calibration_all_correct absent from any migration).
 *
 * SCOPE — the three reflect-OWNED completion-write tables (the exact 503 locus +
 *   the two the benchmark asked to check):
 *     • sage_reflect_sessions          (persistCompletion)
 *     • evaluated_actions              (persistEvaluatedActions → evaluatedActionToRow)
 *     • sage_reflect_proximity_domains (upsertProximityDomains)
 *   agent_accreditation (also written at completion via feedSageAssent) is OUT of
 *   this guard on purpose: its store imports supabase-server (would force
 *   --env-file) and it is covered by the M3/ATL accreditation suite. It is
 *   confirmed migration-clean as of 2026-06-18 (K1 coverage columns LIVE since
 *   M3-CI-11, 2026-06-15).
 *
 * Run (PURE — pure builders + reads local .sql; NO env, NO DB I/O). From website/:
 *   npx tsx src/lib/sage-reflect/__tests__/reflect-completion-schema-drift.test.ts
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  buildLogs,
  deriveCompletionFields,
  deriveCrossSessionScalars,
  proximityDomainsToRow,
} from '../session-store'
import { evaluatedActionToRow } from '../evaluated-actions-store'

// ============================================================================
// Test harness (repo plain-assertion style)
// ============================================================================
let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

// ============================================================================
// Migration-SQL column extractor — reads the real .sql; no hand-maintained list.
// Parses CREATE TABLE column defs (identifier + known type) and ALTER TABLE … ADD
// COLUMN statements scoped to the target table. Ignores CHECK/constraint lines,
// comments, and the trailing VERIFY SELECTs (none match column-def or ADD COLUMN).
// ============================================================================
const SQL_TYPES =
  'uuid|text|integer|int|smallint|bigint|boolean|bool|jsonb|json|timestamptz|timestamp|date|numeric|real|double precision'

function readMigration(file: string): string {
  const path = join(process.cwd(), file)
  try {
    return readFileSync(path, 'utf8')
  } catch {
    throw new Error(
      `Cannot read migration ${file} at ${path}. Run this test from website/ ` +
        `(npx tsx src/lib/sage-reflect/__tests__/reflect-completion-schema-drift.test.ts).`,
    )
  }
}

/** Column names declared in the CREATE TABLE body for `table`. */
function extractCreateColumns(sql: string, table: string): string[] {
  const re = new RegExp(
    `CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?${table}\\s*\\(`,
    'i',
  )
  const m = re.exec(sql)
  if (!m) return []
  // Scan from the opening paren to its matching close, collecting the body.
  let depth = 0
  let started = false
  let body = ''
  for (let i = m.index + m[0].length - 1; i < sql.length; i++) {
    const ch = sql[i]
    if (ch === '(') {
      depth++
      if (depth === 1) {
        started = true
        continue // skip the outer '('
      }
    } else if (ch === ')') {
      depth--
      if (depth === 0) break // stop before the outer ')'
    }
    if (started) body += ch
  }
  const colRe = new RegExp(`^([a-z_][a-z0-9_]*)\\s+(?:${SQL_TYPES})\\b`, 'i')
  const cols: string[] = []
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('--')) continue
    const cm = colRe.exec(line)
    if (cm) cols.push(cm[1].toLowerCase())
  }
  return cols
}

/** Column names added by ALTER TABLE … ADD COLUMN statements targeting `table`. */
function extractAlterAddColumns(sql: string, table: string): string[] {
  const cols: string[] = []
  const stmtRe = new RegExp(`ALTER\\s+TABLE\\s+(?:public\\.)?${table}\\b[\\s\\S]*?;`, 'gi')
  let s: RegExpExecArray | null
  while ((s = stmtRe.exec(sql)) !== null) {
    const addRe = /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_][a-z0-9_]*)/gi
    let a: RegExpExecArray | null
    while ((a = addRe.exec(s[0])) !== null) cols.push(a[1].toLowerCase())
  }
  return cols
}

/** Union of CREATE + ALTER-ADD columns for `table` across the given migration files. */
function schemaColumns(table: string, files: string[]): Set<string> {
  const cols = new Set<string>()
  for (const file of files) {
    const sql = readMigration(file)
    for (const c of extractCreateColumns(sql, table)) cols.add(c)
    for (const c of extractAlterAddColumns(sql, table)) cols.add(c)
  }
  return cols
}

/** Assert every written column exists in the schema; report the drift if not. */
function assertNoDrift(table: string, written: string[], schema: Set<string>): void {
  assert(`SCHEMA  ${table}: migration parse found columns`, schema.size > 0, 'parser found 0 columns — check file/table name')
  const missing = written.filter((c) => !schema.has(c))
  assert(
    `DRIFT   ${table}: all ${written.length} written columns exist in a migration`,
    missing.length === 0,
    missing.length ? `NOT in any migration → would PGRST204/503 in prod: ${missing.join(', ')}` : undefined,
  )
}

// ============================================================================
// 1. sage_reflect_sessions — persistCompletion() write set
//    (4 literal keys) ∪ buildLogs ∪ deriveCompletionFields ∪ deriveCrossSessionScalars
// ============================================================================
{
  const outcome = {
    exit_path: 'sage_reasoning',
    rs_class: 'RS-1',
    profile_update_confidence: 'normal',
    fabrication_risk_level: 'low',
    progress_dimensions_held: false,
    scrutiny_flags: [],
    developer_note: null,
    sage_calling_trigger: null,
  } as unknown as Parameters<typeof deriveCompletionFields>[0]

  const state = { turns: [] } as unknown as Parameters<typeof deriveCrossSessionScalars>[0]

  const written = [
    // persistCompletion literal keys (session-store.ts persistCompletion UPDATE)
    'current_step',
    'response_history_ciphertext',
    'response_history_meta',
    'completed_at',
    ...Object.keys(buildLogs([])),
    ...Object.keys(deriveCompletionFields(outcome)),
    ...Object.keys(deriveCrossSessionScalars(state)),
  ]

  const schema = schemaColumns('sage_reflect_sessions', [
    'supabase-sage-reflect-migration.sql',
    'supabase-sage-reflect-a1-columns-migration.sql',
    'supabase-sage-reflect-a1-cross-session-migration.sql',
  ])

  assertNoDrift('sage_reflect_sessions', written, schema)

  // Named tripwires for the EXACT 2026-06-16 bug (defence in depth — these must
  // never silently drop out of either the builder or the schema).
  assert('REGRESSION  deriveCrossSessionScalars still emits complexity + calibration_all_correct',
    Object.keys(deriveCrossSessionScalars(state)).includes('complexity') &&
      Object.keys(deriveCrossSessionScalars(state)).includes('calibration_all_correct'))
  assert('REGRESSION  complexity is migrated', schema.has('complexity'))
  assert('REGRESSION  calibration_all_correct is migrated', schema.has('calibration_all_correct'))
}

// ============================================================================
// 2. evaluated_actions — persistEvaluatedActions() → evaluatedActionToRow()
// ============================================================================
{
  const action = {
    agent_id: 'agent:test',
    receipt_id: 'sr_rcpt_test',
    proximity: 'habitual',
    is_kathekon: true,
    kathekon_quality: 'strong',
    passions_detected: [],
    virtue_domains_engaged: [],
    oikeiosis_met: null,
    oikeiosis_stage: null,
    ruling_faculty_state: 'calm',
    skill_id: 'sage-reason',
    candidates_considered: 0,
    evaluated_at: '2026-06-18T00:00:00.000Z',
  } as unknown as Parameters<typeof evaluatedActionToRow>[0]

  const written = Object.keys(evaluatedActionToRow(action))
  const schema = schemaColumns('evaluated_actions', ['supabase-evaluated-actions-migration.sql'])
  assertNoDrift('evaluated_actions', written, schema)
}

// ============================================================================
// 3. sage_reflect_proximity_domains — upsertProximityDomains() →
//    proximityDomainsToRow() ∪ { updated_at } (the literal the upsert adds)
// ============================================================================
{
  const prox = {
    phronesis: null,
    dikaiosyne: null,
    andreia: null,
    sophrosyne: null,
    aggregate: null,
  } as unknown as Parameters<typeof proximityDomainsToRow>[1]

  const written = [
    ...Object.keys(proximityDomainsToRow('agent:test', prox)),
    'updated_at', // upsertProximityDomains spreads { ...row, updated_at } (session-store.ts:636)
  ]
  const schema = schemaColumns('sage_reflect_proximity_domains', ['supabase-sage-reflect-migration.sql'])
  assertNoDrift('sage_reflect_proximity_domains', written, schema)
}

// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
