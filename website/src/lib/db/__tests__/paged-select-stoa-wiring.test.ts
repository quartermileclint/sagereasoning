/**
 * paged-select-stoa-wiring.test.ts — EXECUTED source-pin regression for the
 * two `stoa-store.ts` call sites (row-cap sweep remediation, 2026-09-03):
 * `getStoaDataForCredentials` (an unbounded `.in('credential_ref', ...)`
 * select, now `pagedRangeSelect`) and `getStoaDataForOwner` (an unbounded
 * `.eq('owner_user_id', ...)` select on the confirmed unique `id` primary
 * key, now `pagedRows`). Both feed the R17i export path
 * (`/api/user/export` + `/api/credential/erase`'s Art 15/20 copies) —
 * a truncated read here silently presents an incomplete GDPR export as
 * complete. `pagedRows`/`pagedRangeSelect`'s own correctness is proven by
 * their dedicated test files; this file proves each SITE is wired to them.
 *
 * Mutation-verified: reverting the stoa-store.ts fix (restoring the bare
 * `.select('*').in(...)` / `.select('*').eq(...)` calls) makes the relevant
 * assertions below fail for the right reason — confirmed by hand during
 * this session, then the fix was restored.
 *
 * Run: npx tsx src/lib/db/__tests__/paged-select-stoa-wiring.test.ts
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

const root = path.resolve(__dirname, '../../../..')

function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(root, relPath), 'utf-8')
}

async function main() {
  const src = readSrc('src/lib/stoa/stoa-store.ts')

  assert(
    /import \{ pagedRows, pagedRangeSelect \} from '@\/lib\/db\/paged-select'/.test(src),
    'stoa-store imports both paged-select helpers',
  )

  // ── getStoaDataForCredentials — pagedRangeSelect, .in('credential_ref', ...) ──
  assert(
    !/\.from\(TABLE\)\s*\n?\s*\.select\('\*'\)\s*\n?\s*\.in\('credential_ref', credentialRefs\)/.test(src),
    'getStoaDataForCredentials: the old unbounded .in() select is gone',
  )
  assert(
    /const \{ rows, error \} = await pagedRangeSelect<unknown>\(\s*\n?\s*client,\s*\n?\s*TABLE,\s*\n?\s*\(q\) => q\.in\('credential_ref', credentialRefs\),\s*\n?\s*'\*',\s*\n?\s*\)/.test(
      src,
    ),
    'getStoaDataForCredentials: now reads via pagedRangeSelect filtered on credential_ref',
  )

  // ── getStoaDataForOwner — pagedRows, cursor 'id', eqColumn owner_user_id ──
  assert(
    !/\.from\(TABLE\)\.select\('\*'\)\.eq\('owner_user_id', ownerUserId\)/.test(src),
    'getStoaDataForOwner: the old unbounded .eq() select is gone',
  )
  assert(
    /const \{ rows, error \} = await pagedRows<unknown>\(client, TABLE, 'id', '\*', \{\s*\n?\s*eqColumn: 'owner_user_id',\s*\n?\s*eqValue: ownerUserId,\s*\n?\s*\}\)/.test(
      src,
    ),
    "getStoaDataForOwner: now reads via pagedRows, cursor 'id', eqColumn owner_user_id",
  )

  // Both sites keep the missing-table-benign discipline (R17i must still
  // succeed pre-migration) — pagedRangeSelect/pagedRows surface a plain
  // string `error`, not the {code,message} shape the pre-fix callers
  // passed straight through, so isMissingTableError must be re-wrapped.
  assert(
    (src.match(/isMissingTableError\(\{ message: error \}\)/g) || []).length === 2,
    'both fixed sites re-wrap the paged-select string error into { message } before isMissingTableError',
  )

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('Failures:')
    for (const f of failures) console.log('  - ' + f)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('harness error:', err)
  process.exit(1)
})
