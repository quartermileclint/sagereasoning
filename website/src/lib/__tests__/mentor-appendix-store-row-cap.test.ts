/**
 * mentor-appendix-store-row-cap.test.ts — EXECUTED regression pin for the
 * row-cap fix (row-cap sweep 2026-09-02/-03) applied to
 * mentor-appendix-store.ts's listAppendixRounds.
 *
 * mentor-appendix-store.ts imports supabaseAdmin from supabase-server.ts,
 * which constructs a real Supabase client at module load — there is no
 * lightweight way to substitute a fake client via tsx without a mocking
 * framework this codebase's test scripts don't use. This is therefore a
 * source-pin wiring test (per the batch's stated fallback), not a
 * functional fake-client test: it proves listAppendixRounds genuinely
 * calls pagedRows with the correct table/cursor/filter, and that the
 * caller-visible newest-first order contract is restored after the
 * paginated (ascending-by-id) read. Mutation-verified: reverting the fix
 * makes this test fail for the right reason (see the session record).
 *
 * Run: npx tsx --env-file=.env.local src/lib/__tests__/mentor-appendix-store-row-cap.test.ts
 * (supabaseAdmin construction needs real env vars at import time even
 * though it is never called by this test.)
 */

import { readFileSync } from 'fs'
import { join } from 'path'

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

const source = readFileSync(
  join(__dirname, '..', 'mentor-appendix-store.ts'),
  'utf8'
)

// 1. pagedRows is imported from the shared helper.
assert(
  /import\s*\{\s*pagedRows\s*\}\s*from\s*'@\/lib\/db\/paged-select'/.test(
    source
  ),
  'imports pagedRows from @/lib/db/paged-select'
)

// 2. Isolate the listAppendixRounds function body.
const fnMatch = source.match(
  /export async function listAppendixRounds\([\s\S]*?\n\}/
)
assert(!!fnMatch, 'listAppendixRounds function is present and matchable')
const fnBody = fnMatch ? fnMatch[0] : ''

// 3. It calls pagedRows (not a raw .select('*') without pagination) against
//    the correct table, cursor column, and eq filter.
assert(
  /pagedRows<StoredAppendixRow>\(\s*supabaseAdmin,\s*'mentor_baseline_appendix',\s*'id',\s*'\*',/.test(
    fnBody
  ),
  'calls pagedRows(supabaseAdmin, "mentor_baseline_appendix", "id", "*", …)'
)
assert(
  /eqColumn:\s*'user_id',\s*eqValue:\s*userId/.test(fnBody),
  'scopes the paged read to eqColumn: user_id, eqValue: userId'
)

// 4. No leftover unbounded .select('*') query still directly on
//    supabaseAdmin.from('mentor_baseline_appendix') inside this function
//    (i.e. the old unbounded call site was actually replaced, not just
//    supplemented).
assert(
  !/supabaseAdmin\s*\n?\s*\.from\('mentor_baseline_appendix'\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.eq\('user_id', userId\)\s*\n?\s*\.order\(/.test(
    fnBody
  ),
  'the old unbounded .select("*").eq(...).order(...) chain is gone from listAppendixRounds'
)

// 5. Order-preservation: the function re-sorts by submitted_at descending
//    after the (ascending-by-id) paged read, so callers relying on
//    "newest first" (mentor-context-private.ts's rounds.slice(0, maxRounds))
//    see unchanged behavior despite the new underlying query strategy.
assert(
  /\.sort\(\s*\(a,\s*b\)\s*=>\s*\n?\s*b\.submitted_at\.localeCompare\(a\.submitted_at\)\s*\n?\s*\)/.test(
    fnBody
  ),
  're-sorts the paged rows by submitted_at descending (newest first) after the paginated read'
)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('Failures:', failures)
  process.exit(1)
}
