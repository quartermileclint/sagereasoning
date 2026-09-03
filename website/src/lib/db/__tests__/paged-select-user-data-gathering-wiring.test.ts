/**
 * paged-select-user-data-gathering-wiring.test.ts — EXECUTED source-pin
 * regression for the row-cap sweep remediation of `user-data-gathering.ts`
 * (backs GET /api/user/access, Art 15), 2026-09-03: the api_keys
 * credential-resolution read, the generic user_id-scoped table loop, and the
 * generic profile_id-scoped table loop — mirroring the identical fixes
 * already applied + wiring-tested in /api/user/export/route.ts.
 * `pagedRows`/`pagedRangeSelect`'s own correctness is proven by their
 * dedicated test files; this file proves each site here is actually wired
 * to them.
 *
 * Run: npx tsx src/lib/db/__tests__/paged-select-user-data-gathering-wiring.test.ts
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
  const src = readSrc('src/lib/user-data-gathering.ts')

  assert(
    /import \{ pagedRows, pagedRangeSelect \} from '@\/lib\/db\/paged-select'/.test(src),
    'imports both helpers'
  )

  // ── The api_keys credential-resolution read (stoa_agent_entries) ─────────
  assert(
    !/\.from\('api_keys'\)\s*\n?\s*\.select\('id'\)\s*\n?\s*\.eq\('owner_user_id', userId\)/.test(src),
    'the old unbounded stoa_agent_entries credential select is gone'
  )
  assert(
    /pagedRows<\{ id: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'api_keys',\s*\n?\s*'id',\s*\n?\s*'id',\s*\n?\s*\{ eqColumn: 'owner_user_id', eqValue: userId \}/.test(
      src
    ),
    'the stoa_agent_entries credential read is now pagedRows on api_keys, cursor id'
  )

  // ── The two generic loops ─────────────────────────────────────────────────
  const pagedRangeCalls = (src.match(/pagedRangeSelect\(/g) || []).length
  assert(
    pagedRangeCalls === 2,
    `exactly 2 pagedRangeSelect calls (the user_id loop + the profile_id loop) — saw ${pagedRangeCalls}`
  )
  assert(
    /pagedRangeSelect\(\s*\n?\s*supabaseAdmin,\s*\n?\s*table,\s*\n?\s*\(q\) => q\.eq\('user_id', userId\)\s*\n?\s*\)/.test(
      src
    ),
    "the user_id-scoped table loop is paged via pagedRangeSelect, filtered eq('user_id', userId)"
  )
  assert(
    /pagedRangeSelect\(\s*\n?\s*supabaseAdmin,\s*\n?\s*table,\s*\n?\s*\(q\) => q\.in\('profile_id', profileIds\)\s*\n?\s*\)/.test(
      src
    ),
    "the profile_id-scoped table loop is paged via pagedRangeSelect, filtered in('profile_id', profileIds)"
  )
  assert(
    (src.match(/= \{ rows: rows \|\| \[\], incomplete: true \}/g) || []).length === 2,
    'both generic loops surface an honest incomplete:true marker if the safety valve fires'
  )
  // (Deliberately not asserted: a broad "no .eq('user_id', userId) followed
  // by error.message.includes anywhere in the file" negative — the
  // deliberately-carried encrypted blocks (mentor_profiles,
  // mentor_baseline_appendix, realtime_journal_entries) legitimately still
  // use that exact shape, out of this fix's scope.)
  assert(
    !/for \(const \{ key, table \} of tables\) \{\s*\n\s*const \{ data: rows, error \} = await supabaseAdmin/.test(
      src
    ),
    'the old unbounded generic tables loop (raw supabaseAdmin call) is gone'
  )
  assert(
    !/\.select\('\*'\)\s*\n?\s*\.in\('profile_id', profileIds\)\s*\n?\s*\n?\s*if \(error && !error\.message\.includes/.test(
      src
    ),
    'the old unbounded per-table profile_id read is gone'
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
