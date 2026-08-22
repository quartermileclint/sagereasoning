/**
 * score/save route.test.ts — source-parsing boundary test for the NEW
 * POST /api/score/save route (built 2026-08-23, Class B route-change
 * session, RLS-vs-route-enforcement survey row 19). Same convention as the
 * sibling action-evaluations test.
 *
 * Run: npx tsx src/app/api/score/save/__tests__/route.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string) {
  if (condition) passed++
  else { failed++; failures.push(label) }
}

const websiteRoot = path.resolve(__dirname, '../..', '..', '..', '..', '..')
const read = (rel: string) => fs.readFileSync(path.join(websiteRoot, rel), 'utf-8')

const ROUTE = 'src/app/api/score/save/route.ts'
const src = read(ROUTE)

// ─── Service-role only ───
assert(src.includes("import { supabaseAdmin } from '@/lib/supabase-server'"), 'SR-1: imports the shared service-role client')
assert(!src.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'), 'SR-2: never references the anon key')
assert(!/createClient\(/.test(src), 'SR-3: never constructs its own client')

// ─── Auth: user_id from the verified session, NEVER from the request body ───
assert(/requireAuth\(request\)/.test(src), 'AUTH-1: calls requireAuth')
assert(/if \(auth\.error\) return auth\.error/.test(src), 'AUTH-2: honours a failed auth')
assert(/const userId = auth\.user\.id/.test(src), 'AUTH-3: userId comes from the verified session')
// The critical integrity property: a caller cannot forge which user the row
// is attributed to by supplying their own user_id in the JSON body.
assert(!/const\s*\{[^}]*\buser_id\b[^}]*\}\s*=\s*body/.test(src), 'AUTH-4: user_id is never destructured from the request body')
assert(/user_id:\s*userId,/.test(src), 'AUTH-5: the insert sets user_id from the verified session, not from the body')

// ─── Rate limiting — shares /api/score\'s own bucket (same cadence, not an independent read) ───
assert(/RATE_LIMITS\.scoring/.test(src), 'RATE-1: uses the scoring bucket (fires once per cloud-mode evaluation, same cadence as /api/score itself)')

// ─── Required-field validation mirrors the client's previous insert contract ───
assert(/typeof action !== 'string' \|\| !action\.trim\(\)/.test(src), 'VALIDATE-1: action is required')
assert(/typeof katorthoma_proximity !== 'string'/.test(src), 'VALIDATE-2: katorthoma_proximity is required')
assert(/typeof is_kathekon !== 'boolean'/.test(src), 'VALIDATE-3: is_kathekon (boolean) is required')

// ─── The schema-drift regression class this table already survived once:
//     every insert key must be a real column. Reuse the same schema parse
//     the dedicated schema-drift test does, rather than re-implement it, so
//     this file cannot silently drift from that one's column list. ───
function schemaColumns(): string[] {
  const sql = read('supabase-v3-migration.sql')
  const start = sql.indexOf('CREATE TABLE IF NOT EXISTS public.action_evaluations_v3 (')
  const body = sql.slice(start)
  const end = body.indexOf('\n);')
  const cols: string[] = []
  for (const raw of body.slice(0, end).split('\n').slice(1)) {
    const line = raw.trim()
    if (!line || line.startsWith('--')) continue
    const m = /^([a-z_][a-z0-9_]*)\s+[A-Za-z]/.exec(line)
    if (m && !['constraint', 'primary', 'unique', 'foreign', 'check'].includes(m[1])) cols.push(m[1])
  }
  return cols
}
const COLUMNS = schemaColumns()
assert(COLUMNS.length >= 20, `SCHEMA-1: parsed a plausible column count (got ${COLUMNS.length})`)

const insertAt = src.indexOf(".insert({")
assert(insertAt > 0, 'WRITE-1: found the insert object literal')
if (insertAt > 0) {
  const objStart = insertAt + '.insert({'.length - 1
  let depth = 0
  let objEnd = -1
  for (let i = objStart; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') { depth--; if (depth === 0) { objEnd = i; break } }
  }
  const objSrc = src.slice(objStart + 1, objEnd)
  // PR19 fold (2026-08-23): comma-OR-colon, not colon-only — the real insert
  // uses shorthand syntax (`action,`, `katorthoma_proximity,`, `is_kathekon,`)
  // for exactly three keys, one of them the NOT-NULL column whose omission
  // caused the 2026-07-26 outage this whole test class exists to prevent. A
  // colon-only regex silently skips all three, so WRITE-3 below would never
  // have checked them — matches the sibling schema-drift test's (correct)
  // pattern, which is the only reason this gap did not already have a live
  // consequence.
  const keys = [...objSrc.matchAll(/^\s+([a-z_][a-z0-9_]*)\s*[,:]/gm)].map((m) => m[1])
  assert(keys.length >= 10, `WRITE-2: parsed a plausible number of insert keys (got ${keys.length})`)
  for (const k of keys) {
    assert(COLUMNS.includes(k), `WRITE-3[${k}]: insert key '${k}' exists on action_evaluations_v3`)
  }
  // Non-vacuity for the WRITE-2/3 fix itself: the three shorthand keys must
  // actually be found by the fixed regex (a colon-only regex would silently
  // report a smaller-but-still-plausible key count and never surface this).
  for (const shorthandKey of ['action', 'katorthoma_proximity', 'is_kathekon']) {
    assert(keys.includes(shorthandKey), `NV-SHORTHAND[${shorthandKey}]: the comma-or-colon regex catches this shorthand-syntax key`)
  }
}

// ─── PR19 fold: usage-binding, not just import-presence ───
// SR-1 only proves supabaseAdmin is imported; it does not prove the QUERY is
// actually chained off it (a mutation swapping in a different, anon-key
// client while leaving supabaseAdmin imported-but-unused would leave SR-1..3
// green). This positive assertion closes that gap, matching the stronger
// pattern already used in practice-calendar's service-role-boundary test.
assert(
  /supabaseAdmin\s*\n?\s*\.from\('action_evaluations_v3'\)/.test(src),
  'SR-5: the query is actually chained off supabaseAdmin, not merely imported'
)

console.log(`${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exit(1)
}
