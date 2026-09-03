/**
 * paged-select-c4-wiring.test.ts — EXECUTED source-pin regression for the C4
 * call sites of `pagedRows`/`pagedRangeSelect` (row-cap sweep remediation,
 * 2026-09-03, M5/M6): the two key-list reads in `user/delete/route.ts` that
 * DRIVE deletion (M6, highest priority per the report's own ordering), the
 * mirrored two key-list reads in `user/export/route.ts`, and that route's two
 * generic per-table export loops. `pagedRows`/`pagedRangeSelect`'s own
 * correctness is proven by their dedicated test files (16/0 and 17/0,
 * mutation-verified); this file proves each SITE is actually wired to them.
 *
 * Run: npx tsx src/lib/db/__tests__/paged-select-c4-wiring.test.ts
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
  // ── M6 — user/delete/route.ts (the deletion-driving reads) ───────────────
  {
    const src = readSrc('src/app/api/user/delete/route.ts')
    assert(/import \{ pagedRows \} from '@\/lib\/db\/paged-select'/.test(src), 'M6: user/delete imports pagedRows')
    assert(!/\.from\('api_keys'\)\s*\n?\s*\.select\('id'\)\s*\n?\s*\.eq\('owner_user_id', userId\)/.test(src), 'M6: the old unbounded Stoa credential-resolution select is gone')
    assert(/pagedRows<\{ id: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'api_keys',\s*\n?\s*'id',\s*\n?\s*'id',\s*\n?\s*\{ eqColumn: 'owner_user_id', eqValue: userId \}/.test(src), 'M6: the Stoa credential-resolution read is now pagedRows on api_keys, cursor id')
    assert(!/\.from\('api_keys'\)\s*\n?\s*\.select\('agent_id'\)\s*\n?\s*\.eq\('owner_user_id', userId\)\s*\n?\s*\.not\('agent_id', 'is', null\)/.test(src), 'M6: the old unbounded reflect-agent-resolution select is gone')
    assert(/pagedRows<\{ id: string; agent_id: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'api_keys',\s*\n?\s*'id',\s*\n?\s*'id, agent_id',\s*\n?\s*\{ eqColumn: 'owner_user_id', eqValue: userId, notNullColumn: 'agent_id' \}/.test(src), 'M6: the reflect-agent-resolution read is now pagedRows on api_keys, cursor id, notNull agent_id')
  }

  // ── M5 — user/export/route.ts (the api_keys resolution reads) ────────────
  {
    const src = readSrc('src/app/api/user/export/route.ts')
    assert(/import \{ pagedRows, pagedRangeSelect \} from '@\/lib\/db\/paged-select'/.test(src), 'M5: user/export imports both helpers')
    assert(!/\.from\('api_keys'\)\s*\n?\s*\.select\('id'\)\s*\n?\s*\.eq\('owner_user_id', userId\)\s*\n?\s*if \(credError\)/.test(src), 'M5: the old unbounded stoa_agent_entries credential select is gone')
    assert(/pagedRows<\{ id: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'api_keys',\s*\n?\s*'id',\s*\n?\s*'id',\s*\n?\s*\{ eqColumn: 'owner_user_id', eqValue: userId \}/.test(src), 'M5: the stoa_agent_entries credential read is now pagedRows on api_keys, cursor id')
    assert(/pagedRows<\{ id: string; agent_id: string \}>\(\s*\n?\s*supabaseAdmin,\s*\n?\s*'api_keys',\s*\n?\s*'id',\s*\n?\s*'id, agent_id',\s*\n?\s*\{ eqColumn: 'owner_user_id', eqValue: userId, notNullColumn: 'agent_id' \}/.test(src), 'M5: the sage_reflect_sessions agent-resolution read is now pagedRows on api_keys, cursor id')

    // The two generic export loops.
    const pagedRangeCalls = (src.match(/pagedRangeSelect\(/g) || []).length
    assert(pagedRangeCalls === 2, `M5: exactly 2 pagedRangeSelect calls (the user_id loop + the profile_id loop) — saw ${pagedRangeCalls}`)
    assert(/pagedRangeSelect\(\s*\n?\s*supabaseAdmin,\s*\n?\s*table,\s*\n?\s*\(q\) => q\.eq\('user_id', userId\),\s*\n?\s*select\s*\n?\s*\)/.test(src), "M5: the user_id-scoped table loop is paged via pagedRangeSelect, filtered eq('user_id', userId)")
    assert(/pagedRangeSelect\(\s*\n?\s*supabaseAdmin,\s*\n?\s*table,\s*\n?\s*\(q\) => q\.in\('profile_id', profileIds\)\s*\n?\s*\)/.test(src), "M5: the profile_id-scoped table loop is paged via pagedRangeSelect, filtered in('profile_id', profileIds)")
    assert((src.match(/= \{ rows: data \|\| \[\], incomplete: true \}/g) || []).length === 2, 'M5: both generic loops surface an honest incomplete:true marker if the safety valve fires')
    assert(!/\.select\(select\)\s*\n?\s*\.eq\('user_id', userId\)\s*\n?\s*\n?\s*if \(error && !error\.message\.includes/.test(src), 'M5: the old unbounded per-table user_id read is gone')
    assert(!/\.select\('\*'\)\s*\n?\s*\.in\('profile_id', profileIds\)\s*\n?\s*\n?\s*if \(error && !error\.message\.includes/.test(src), 'M5: the old unbounded per-table profile_id read is gone')
  }

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
