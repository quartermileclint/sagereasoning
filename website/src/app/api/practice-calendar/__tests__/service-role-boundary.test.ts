/**
 * service-role-boundary.test.ts — regression guard for the 2026-08-23 Class B
 * route-change: /api/practice-calendar switched from a user-JWT-forwarded
 * anon client to the shared service-role client. Both `userId` (via
 * requireAuth) and the explicit `.eq('user_id', userId)` on every query
 * predate this change; what changed is that the owner RLS policies on
 * action_evaluations_v3/reflections/journal_entries are no longer load-
 * bearing for this route. This test pins that the anon-forwarded pattern
 * does not silently return.
 *
 * Run: npx tsx src/app/api/practice-calendar/__tests__/service-role-boundary.test.ts
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

const websiteRoot = path.resolve(__dirname, '../..', '..', '..', '..')
const read = (rel: string) => fs.readFileSync(path.join(websiteRoot, rel), 'utf-8')

const ROUTE = 'src/app/api/practice-calendar/route.ts'
const srcRaw = read(ROUTE)

// Strip comments before scanning for code patterns — this file's own header
// comment above the fix quotes the exact `.eq('user_id', userId)` code
// pattern in prose, which would otherwise double-count against QUERY-1
// below (established convention: practice-calendar-api-contract.test.ts
// does the same for exactly this reason).
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}
const src = stripComments(srcRaw)

assert(src.includes("import { supabaseAdmin } from '@/lib/supabase-server'"), 'SR-1: imports the shared service-role client')
assert(/const supabase = supabaseAdmin/.test(src), 'SR-2: the query client IS supabaseAdmin (not re-wrapped or re-constructed)')
assert(!src.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'), 'SR-3: never references the anon key')
assert(!/createClient\(/.test(src), 'SR-4: never constructs its own client')
assert(!/Authorization:\s*request\.headers\.get/.test(src), 'SR-5: never forwards the caller Authorization header into a query client (the anon-JWT pattern this session removed)')

// The correctness-preserving property: every query still scopes explicitly
// to the verified userId — the fix removes a REDUNDANT dependency (RLS),
// not the actual scoping (which never depended on RLS to begin with, since
// every query already carried this filter).
const userIdFilterCount = [...src.matchAll(/\.eq\('user_id', userId\)/g)].length
assert(userIdFilterCount === 3, `QUERY-1: exactly 3 queries (action_evaluations_v3, reflections, journal_entries) still filter on userId explicitly (found ${userIdFilterCount})`)

for (const table of ['action_evaluations_v3', 'reflections', 'journal_entries']) {
  assert(src.includes(`from('${table}')`), `QUERY-2[${table}]: still queries ${table}`)
}

// Non-vacuity
{
  const decoy = "Authorization: request.headers.get('Authorization') || ''"
  assert(/Authorization:\s*request\.headers\.get/.test(decoy), 'NV-1: SR-5\'s check would catch a decoy forwarded-header pattern (non-vacuity)')
}

console.log(`${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exit(1)
}
