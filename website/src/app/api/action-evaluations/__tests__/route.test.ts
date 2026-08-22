/**
 * action-evaluations route.test.ts — source-parsing boundary test for the
 * NEW GET /api/action-evaluations route (built 2026-08-23, Class B
 * route-change session, RLS-vs-route-enforcement survey row 19).
 *
 * WHY SOURCE-PARSING, NOT A LIVE CALL: this project's own established
 * convention for boundary tests that must run without a DB connection or a
 * dev server (see action-evaluations-v3-schema-drift.test.ts,
 * practice-calendar-api-contract.test.ts). This route has no client-facing
 * component to mount, so a pure text read is the whole surface worth
 * guarding: that it authenticates server-side, that it never uses the
 * anon/browser client, and that user_id comes from the verified session, not
 * a request param.
 *
 * Run: npx tsx src/app/api/action-evaluations/__tests__/route.test.ts
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

const ROUTE = 'src/app/api/action-evaluations/route.ts'
const src = read(ROUTE)

// ─── Service-role only — never the anon key, never a client-forwarded JWT ───
assert(src.includes("import { supabaseAdmin } from '@/lib/supabase-server'"), 'SR-1: imports the shared service-role client')
assert(!src.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'), 'SR-2: never references the anon key')
assert(!/createClient\(/.test(src), 'SR-3: never constructs its own client (uses the shared supabaseAdmin)')
assert(!/Authorization:\s*request\.headers\.get/.test(src), 'SR-4: never forwards the caller Authorization header into a query client')
// PR19 fold (2026-08-23): SR-1 only proves supabaseAdmin is imported, not
// that the query is chained off it — a mutation swapping in a different
// (anon-key) client while leaving supabaseAdmin imported-but-unused would
// leave every check above green. This positive usage-binding assertion
// closes that gap (matches practice-calendar's service-role-boundary test).
assert(
  /supabaseAdmin\s*\n?\s*\.from\('action_evaluations_v3'\)/.test(src),
  'SR-5: the query is actually chained off supabaseAdmin, not merely imported'
)

// ─── Auth: server-verified, never trusted from the query string or body ───
assert(/requireAuth\(request\)/.test(src), 'AUTH-1: calls requireAuth')
assert(/if \(auth\.error\) return auth\.error/.test(src), 'AUTH-2: honours a failed auth (never falls through)')
assert(/const userId = auth\.user\.id/.test(src), 'AUTH-3: userId comes from the verified session')
assert(!/searchParams\.get\('user_id'\)/.test(src), 'AUTH-4: never reads a user_id from the query string')

// ─── Rate limiting — a read, not a scoring call (matches the milestones/practice-status precedent) ───
assert(/RATE_LIMITS\.analytics/.test(src), 'RATE-1: uses the analytics bucket, not scoring (this is a read, fired on every dashboard mount)')

// ─── The query itself scopes to the verified user, every time ───
assert(/\.eq\('user_id', userId\)/.test(src), 'QUERY-1: filters on the server-verified userId')
assert(src.includes("from('action_evaluations_v3')"), 'QUERY-2: queries the correct table')

// ─── Response shape the dashboard actually expects ───
assert(/NextResponse\.json\(\{ evaluations: data \|\| \[\] \}\)/.test(src), 'RESP-1: returns { evaluations: [...] } (never a bare array or a raw Supabase result)')

// ─── Non-vacuity: the negative checks above must be able to fail ───
{
  const decoyWithAnon = "const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!\nconst supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!"
  assert(decoyWithAnon.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'), 'NV-1: SR-2\'s check would catch a decoy anon-key reference (non-vacuity)')
  const decoyForwarded = "Authorization: request.headers.get('Authorization') || ''"
  assert(/Authorization:\s*request\.headers\.get/.test(decoyForwarded), 'NV-2: SR-4\'s check would catch a decoy forwarded-header pattern (non-vacuity)')
}

console.log(`${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exit(1)
}
