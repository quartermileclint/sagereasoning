/**
 * session-store-export-paging.test.ts — EXECUTED source-pin regression for the
 * row-cap fix on `getAgentSessionsForExport` (row-cap sweep 2026-09-02/-03).
 *
 * getAgentSessionsForExport previously ran an unbounded
 * `.from(SESSIONS).select('*').eq('agent_id', agent_id)`, which PostgREST
 * silently truncates at its confirmed 1,000-row server cap with no error — an
 * agent with more than 1,000 reflect sessions would get a silently-incomplete
 * Article 15/20 export. It now reads via the shared `pagedRows` helper
 * (proven exhaustive + fail-honest by `paged-select.test.ts`), keyset-paged
 * by the genuine `id` primary key, filtered on `agent_id`.
 *
 * `getAdminClient` in session-store.ts constructs its Supabase client lazily
 * at first I/O call with no injection seam, so a functional fake-client test
 * of `getAgentSessionsForExport` itself is impractical without threading a
 * client parameter through the whole module. This is a source-pin wiring
 * test instead — it proves the call site is wired correctly, matching the
 * project's established fallback pattern (paged-select-wiring.test.ts).
 *
 * Mutation-verified: reverting the fix (restoring the old bare
 * `.select('*').eq('agent_id', agent_id)` call, dropping the pagedRows
 * import) makes this test fail for the right reason; restoring the fix makes
 * it pass again.
 *
 * Run: npx tsx src/lib/sage-reflect/__tests__/session-store-export-paging.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

const src = fs.readFileSync(
  path.resolve(__dirname, '../session-store.ts'),
  'utf-8',
)

assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'session-store imports pagedRows')

// The old unbounded read must be gone (this exact shape, not just the string
// '.select(' which appears elsewhere in the file for other tables/purposes).
assert(
  !/const \{ data, error \} = await admin\.from\(SESSIONS\)\.select\('\*'\)\.eq\('agent_id', agent_id\)$/m.test(src),
  'the old unbounded getAgentSessionsForExport read is gone',
)

// The new call: pagedRows<SageReflectSessionRow>(admin, SESSIONS, 'id', '*', { eqColumn: 'agent_id', eqValue: agent_id })
assert(
  /const \{ rows: data, error \} = await pagedRows<SageReflectSessionRow>\(admin, SESSIONS, 'id', '\*', \{\s*\n\s*eqColumn: 'agent_id',\s*\n\s*eqValue: agent_id,\s*\n\s*\}\)/.test(src),
  'getAgentSessionsForExport now reads via pagedRows on SESSIONS, cursor id, eq-filtered on agent_id',
)

// The function itself must be the one wired (not merely present anywhere in the file).
const fnStart = src.indexOf('export async function getAgentSessionsForExport')
const fnBody = src.slice(fnStart, src.indexOf('\n}\n', fnStart))
assert(fnBody.includes('pagedRows<SageReflectSessionRow>'), 'the pagedRows call is inside getAgentSessionsForExport itself, not elsewhere in the file')
assert(fnBody.includes("eqColumn: 'agent_id'"), 'the agent_id filter is preserved inside the function body')

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('Failures:', failures)
  process.exit(1)
}
