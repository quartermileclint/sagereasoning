/**
 * api-key-defaults.test.ts — M2 CI-6 mint-defaults drift assertions (no DB).
 *
 * Run via: `npx tsx website/src/lib/__tests__/api-key-defaults.test.ts`
 * (plain-assertion script per CLAUDE.md conventions; no Jest. No --env-file
 * needed — nothing in the import chain constructs a Supabase client at
 * module load.)
 *
 * COVERAGE:
 *   SC — API_KEY_FREE_TIER_DEFAULTS matches the DEFAULT clauses in the schema
 *        source of truth (/api/api-keys-schema.sql), parsed from the file
 *        itself so any future drift on either side fails here.
 *   RT — the admin mint route carries no literal 667 (the FX-12 drift triple
 *        667/50/20 is gone) and defaults from the shared constant.
 *   ST — the SELF-SERVICE mint route (/api/keys) inserts from the shared
 *        constant (folded 2026-07-07, closing the carried M2 100/100/1 vs
 *        30/1/1 decision) and the terms-page free-tier copy matches.
 *
 * The live mint behaviour (route returns 30/1/1 on a TEST mint) is exercised
 * in the M2 founder-walked TEST leg — deliberately NOT mocked here.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { API_KEY_FREE_TIER_DEFAULTS } from '../api-key-defaults'

let passCount = 0
let failCount = 0

function assert(name: string, condition: boolean) {
  if (condition) {
    passCount++
    console.log(`  ✓ ${name}`)
  } else {
    failCount++
    console.error(`  ✗ ${name}`)
  }
}

// ── SC — schema-source parity ────────────────────────────────────────────────
// website/src/lib/__tests__/ → repo root is four levels up.
const schemaPath = fileURLToPath(
  new URL('../../../../api/api-keys-schema.sql', import.meta.url)
)
const schemaSql = readFileSync(schemaPath, 'utf8')

function schemaDefault(column: string): number | null {
  const m = schemaSql.match(
    new RegExp(`${column}\\s+INTEGER\\s+DEFAULT\\s+(\\d+)`, 'i')
  )
  return m ? Number(m[1]) : null
}

console.log('SC — schema-source parity (api/api-keys-schema.sql)')
assert(
  'SC-1 monthly_limit default matches schema (30)',
  schemaDefault('monthly_limit') === API_KEY_FREE_TIER_DEFAULTS.monthly_limit
)
assert(
  'SC-2 daily_limit default matches schema (1)',
  schemaDefault('daily_limit') === API_KEY_FREE_TIER_DEFAULTS.daily_limit
)
assert(
  'SC-3 max_chain_iterations default matches schema (1)',
  schemaDefault('max_chain_iterations') ===
    API_KEY_FREE_TIER_DEFAULTS.max_chain_iterations
)
assert(
  'SC-4 adopted triple is 30/1/1',
  API_KEY_FREE_TIER_DEFAULTS.monthly_limit === 30 &&
    API_KEY_FREE_TIER_DEFAULTS.daily_limit === 1 &&
    API_KEY_FREE_TIER_DEFAULTS.max_chain_iterations === 1
)

// ── RT — route-source assertions ─────────────────────────────────────────────
const routePath = fileURLToPath(
  new URL('../../app/api/admin/api-keys/route.ts', import.meta.url)
)
const routeSrc = readFileSync(routePath, 'utf8')

console.log('RT — admin mint route (app/api/admin/api-keys/route.ts)')
assert('RT-1 no literal 667 remains anywhere on the route', !routeSrc.includes('667'))
assert(
  'RT-2 no drifted destructure defaults (= 667 / = 50 / = 20)',
  !/monthly_limit\s*=\s*667/.test(routeSrc) &&
    !/daily_limit\s*=\s*50/.test(routeSrc) &&
    !/max_chain_iterations\s*=\s*20/.test(routeSrc)
)
assert(
  'RT-3 route imports the shared defaults constant',
  routeSrc.includes("from '@/lib/api-key-defaults'")
)
assert(
  'RT-4 all three limit defaults read from the constant',
  /monthly_limit\s*=\s*API_KEY_FREE_TIER_DEFAULTS\.monthly_limit/.test(routeSrc) &&
    /daily_limit\s*=\s*API_KEY_FREE_TIER_DEFAULTS\.daily_limit/.test(routeSrc) &&
    /max_chain_iterations\s*=\s*API_KEY_FREE_TIER_DEFAULTS\.max_chain_iterations/.test(
      routeSrc
    )
)

// ── ST — self-service mint route + public copy (folded 2026-07-07) ──────────
const selfServicePath = fileURLToPath(
  new URL('../../app/api/keys/route.ts', import.meta.url)
)
const selfServiceSrc = readFileSync(selfServicePath, 'utf8')

console.log('ST — self-service mint route (app/api/keys/route.ts) + terms copy')
assert(
  'ST-1 no drifted literal insert limits (monthly_limit: 100 / daily_limit: 100)',
  !/monthly_limit:\s*100\b/.test(selfServiceSrc) &&
    !/daily_limit:\s*100\b/.test(selfServiceSrc)
)
assert(
  'ST-2 route imports the shared defaults constant',
  selfServiceSrc.includes("from '@/lib/api-key-defaults'")
)
assert(
  'ST-3 all three insert limits read from the constant',
  /monthly_limit:\s*API_KEY_FREE_TIER_DEFAULTS\.monthly_limit/.test(selfServiceSrc) &&
    /daily_limit:\s*API_KEY_FREE_TIER_DEFAULTS\.daily_limit/.test(selfServiceSrc) &&
    /max_chain_iterations:\s*API_KEY_FREE_TIER_DEFAULTS\.max_chain_iterations/.test(
      selfServiceSrc
    )
)
const termsSrc = readFileSync(
  fileURLToPath(new URL('../../app/terms/page.tsx', import.meta.url)),
  'utf8'
)
assert(
  'ST-4 terms-page free-tier copy matches the adopted monthly limit',
  termsSrc.includes(
    `${API_KEY_FREE_TIER_DEFAULTS.monthly_limit} calls per month`
  ) && !termsSrc.includes('100 calls per month')
)

console.log(`\n${passCount} passed, ${failCount} failed`)
if (failCount > 0) process.exit(1)
