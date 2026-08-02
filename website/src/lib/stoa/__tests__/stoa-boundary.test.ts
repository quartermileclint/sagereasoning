/**
 * stoa-boundary.test.ts — the Stoa's structural-separation battery (ST2; grows
 * through ST3–ST5). Run: npx tsx website/src/lib/stoa/__tests__/stoa-boundary.test.ts
 *
 * Pins constraint #20 (Q6c) BOTH directions, #23 (Q8 sharpened), #24 (Q9),
 * #16 (Q5b), #8 (Q3a), and the data-rights-at-birth wiring:
 *   A. Import purity — stoa-store imports NOTHING outside an exact allowlist
 *      (one-hop; the ONE cross-boundary allowance is the K1 agent-id grammar).
 *   B. Reverse direction — no module outside the Stoa tree + the named
 *      data-rights surfaces references stoa_entries / stoa-store.
 *   C. Schema honesty — the migration carries no engagement column, no
 *      retain_until, exactly the three removal grounds, the XOR, RLS,
 *      revoke-first grants.
 *   D. Ordering — declaration recency is the ONLY sort key in the store.
 *   E. Data-rights wiring — all four surfaces call the store (INV source-grep
 *      pins, the house pattern).
 *   F. Non-vacuity self-tests — the scans demonstrably traverse real files
 *      (memory: a guard that stops guarding still prints 0 failed).
 *
 * SCOPE HONESTY (stated per the Remaining-Principles precedent; widened at the
 * PR19 fold 2026-08-03): pin A follows ONE hop over every non-test file in
 * lib/stoa/ — it does not prove transitive import purity. Pin B sweeps
 * website/src + website/scripts; it does NOT sweep harness/ or sdk/ (verified
 * clean by hand 2026-08-03 — re-check if a harness hook or script ever gains a
 * Stoa reference), and a grep sweep cannot see CONSTRUCTED references (a table
 * name assembled from parts) — realistic literal forms are covered. The fake
 * does not model the DB CHECKs (XOR/grounds/artifact) — those are guarded by
 * store validation + the migration's V7 behavioral probes.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    pass++
    console.log(`  PASS ${name}`)
  } else {
    fail++
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

// Resolve the website/ root from this file's location.
const HERE = __dirname // .../website/src/lib/stoa/__tests__
const WEBSITE = join(HERE, '..', '..', '..', '..')
const SRC = join(WEBSITE, 'src')
const STORE_PATH = join(SRC, 'lib', 'stoa', 'stoa-store.ts')
const MIGRATION_PATH = join(WEBSITE, 'supabase-stoa-entries-migration.sql')

const storeSrc = readFileSync(STORE_PATH, 'utf8')
const migrationSrc = readFileSync(MIGRATION_PATH, 'utf8')

/** Strip SQL line comments so comment prose (which deliberately NAMES the
 *  forbidden things, e.g. "no view counts") never false-trips the deny scans. */
function stripSqlComments(sql: string): string {
  return sql
    .split('\n')
    .map((l) => {
      const i = l.indexOf('--')
      return i >= 0 ? l.slice(0, i) : l
    })
    .join('\n')
}

/** Strip TS comments (line + block) for the same reason. */
function stripTsComments(ts: string): string {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

// ============================================================================
// A. Import purity — exact allowlist (one-hop)
// ============================================================================
/** Extract every module-dependency specifier from a TS source: static imports,
 *  re-exports (`export … from`), dynamic `import()`, and `require()` — a
 *  re-export or dynamic import is dependency-identical to an import (PR19 fold
 *  F1, 2026-08-03: the old `^import`-only regex was live-proven blind to
 *  `export … from`). */
function extractSpecifiers(src: string): string[] {
  const specs: string[] = []
  for (const re of [
    /^import[^'"]*['"]([^'"]+)['"]/gm,
    /^export[^'"\n]*from\s*['"]([^'"]+)['"]/gm,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]) {
    for (const m of src.matchAll(re)) specs.push(m[1])
  }
  return specs
}

{
  console.log('§A import purity (exact allowlist, every non-test stoa file)')
  const ALLOWLIST = [
    '@supabase/supabase-js',
    // The ONE allowlisted cross-boundary import: pure K1 identity GRAMMAR (a
    // format regex; zero data flow either direction). Anything else from the
    // substrate/trust-layer/practice trees is a #20 violation.
    '@/lib/substrate/trust-layer/accreditation/agent-id-vocabulary',
  ]
  // PR19 fold F2 (2026-08-03): scan EVERY non-test .ts under lib/stoa — a
  // future sibling module (helpers.ts) must meet the same allowlist, or a
  // forbidden edge could enter invisibly once ST3 routes import it. Intra-stoa
  // relative imports are permitted (they are scanned themselves).
  const stoaDir = join(SRC, 'lib', 'stoa')
  const stoaFiles = readdirSync(stoaDir)
    .filter((n) => /\.ts$/.test(n))
    .map((n) => join(stoaDir, n))
  check('A.0 the stoa tree has files to scan (non-vacuity)', stoaFiles.length >= 1, `found ${stoaFiles.length}`)
  let totalSpecs = 0
  const outside: string[] = []
  const FORBIDDEN = [
    'trust-core', // trust-core-store, emission-hooks, kathekon-engagement, loop-fold...
    'kathekon',
    'practice-suggestion',
    'milestones',
    'sage-reflect',
    'stoic-brain',
    'translation-sandwich',
    'intervention-engine',
    'sage-reason-engine',
    'agent-assessment-history',
  ]
  const forbiddenHits: string[] = []
  for (const f of stoaFiles) {
    const specs = extractSpecifiers(readFileSync(f, 'utf8'))
    totalSpecs += specs.length
    for (const s of specs) {
      if (s.startsWith('./') || s.startsWith('../')) continue // intra-stoa, scanned itself
      if (!ALLOWLIST.includes(s)) outside.push(`${f.replace(SRC, 'src')} → ${s}`)
      if (FORBIDDEN.some((k) => s.includes(k))) forbiddenHits.push(`${f.replace(SRC, 'src')} → ${s}`)
    }
  }
  check('A.1 specifiers found to scan (non-vacuity)', totalSpecs >= 2, `found ${totalSpecs}`)
  check('A.2 every external specifier is in the exact allowlist', outside.length === 0, outside.join(', '))
  check('A.3 no forbidden-class specifier anywhere in the stoa tree', forbiddenHits.length === 0, forbiddenHits.join(', '))
  // §F-style self-test: the extractor demonstrably catches every dependency
  // form (the vacuity the PR19 review live-proved in the old extractor).
  const synthetic = [
    `import { x } from '@/lib/substrate/trust-core/a'`,
    `export { y } from '@/lib/substrate/trust-core/b'`,
    `const z = () => import('@/lib/substrate/trust-core/c')`,
    `const w = require('@/lib/substrate/trust-core/d')`,
  ].join('\n')
  const caught = extractSpecifiers(synthetic)
  check('A.4 extractor self-test: import/export-from/dynamic/require all caught', caught.length === 4, `caught ${caught.length}: ${caught.join(', ')}`)
}

// ============================================================================
// B. Reverse direction — nothing outside the Stoa tree + the named data-rights
//    surfaces references the Stoa
// ============================================================================
{
  console.log('§B reverse-direction sweep')
  // The ONLY files permitted to reference stoa (the data-rights-at-birth set).
  const ALLOWED_REFERENCERS = new Set([
    join(SRC, 'app', 'api', 'user', 'delete', 'route.ts'),
    join(SRC, 'app', 'api', 'user', 'export', 'route.ts'),
    join(SRC, 'app', 'api', 'credential', 'erase', 'handler.ts'),
    join(SRC, 'lib', 'user-data-gathering.ts'),
    join(SRC, 'lib', 'consumer-erasure.ts'),
  ])
  const offenders: string[] = []
  let scanned = 0
  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      const st = statSync(p)
      if (st.isDirectory()) {
        if (name === 'node_modules' || name === '.next') continue
        // The Stoa's own tree may of course reference itself.
        if (p === join(SRC, 'lib', 'stoa')) continue
        walk(p)
      } else if (/\.(ts|tsx)$/.test(name)) {
        scanned++
        const body = readFileSync(p, 'utf8')
        if (/stoa_entries|stoa-store|lib\/stoa/.test(body) && !ALLOWED_REFERENCERS.has(p)) {
          offenders.push(p)
        }
      }
    }
  }
  walk(SRC)
  // PR19 fold F7 (2026-08-03): scripts/ too — a future report/cron script
  // reading stoa_entries into a practice signal must trip the sweep.
  walk(join(WEBSITE, 'scripts'))
  check('B.1 sweep traversed a real tree (non-vacuity)', scanned > 300, `scanned ${scanned}`)
  check(
    'B.2 no module outside the allowed set references the Stoa (#20 both directions)',
    offenders.length === 0,
    offenders.map((o) => o.replace(SRC, 'src')).join(', '),
  )
  // The five allowed referencers must ALL actually reference it (the wiring
  // exists — pin E covers the specific function names).
  const silent = [...ALLOWED_REFERENCERS].filter((p) => !/stoa/.test(readFileSync(p, 'utf8')))
  check('B.3 every allowed data-rights surface actually references the Stoa', silent.length === 0, silent.join(', '))
}

// ============================================================================
// C. Schema honesty — the migration's structural pins
// ============================================================================
{
  console.log('§C schema honesty (migration pins)')
  const sql = stripSqlComments(migrationSrc)

  // #23 (Q8 sharpened): no engagement column of any kind. The deny-list scans
  // COLUMN-DEFINITION identifiers in the comment-stripped SQL.
  const ENGAGEMENT_DENY = /\b(view_count|views|view_at|seen|last_seen|clicks?|click_count|engagement|impressions?|match_count|matched_at|visit|hits?)\b/i
  check('C.1 no engagement column (#23)', !ENGAGEMENT_DENY.test(sql))

  // #24 (Q9): standing declarations — no retain_until, ever.
  check('C.2 no retain_until (#24 — never swept, never expired)', !/retain_until/i.test(sql))

  // #16 (Q5b): exactly the three grounds, nothing else, in the CHECK.
  const groundsMatch = sql.match(/removal_ground IN\s*\(([^)]+)\)/i)
  const grounds = groundsMatch
    ? [...groundsMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort()
    : []
  check(
    'C.3 removal grounds are EXACTLY the three ruled (#16)',
    grounds.length === 3 &&
      grounds[0] === 'dishonesty_examined' &&
      grounds[1] === 'injustice_facilitation' &&
      grounds[2] === 'spam_flooding',
    grounds.join(', '),
  )
  check('C.4 the Q5b examined-artifact CHECK exists', /stoa_entries_dishonesty_requires_artifact/.test(sql))

  // #13: the identity XOR + agent-credential coupling.
  check('C.5 identity XOR CHECK present (#13)', /stoa_entries_identity_xor/.test(sql))
  check('C.6 agent-requires-credential CHECK present (#13)', /stoa_entries_agent_requires_credential/.test(sql))

  // #11: both partial uniques scoped to active.
  const ownerUniq = /stoa_entries_owner_active_uniq[\s\S]{0,200}?WHERE status = 'active'/.test(sql)
  const agentUniq = /stoa_entries_agent_active_uniq[\s\S]{0,200}?WHERE status = 'active'/.test(sql)
  check('C.7 one-entry partial uniques, active-scoped (#11)', ownerUniq && agentUniq)

  // RLS + revoke-first grants (the ST1 lesson).
  check('C.8 RLS enabled at creation', /ENABLE ROW LEVEL SECURITY/.test(sql))
  const revokeIdx = sql.indexOf('REVOKE ALL ON public.stoa_entries')
  const grantIdx = sql.indexOf('GRANT ALL ON public.stoa_entries')
  check('C.9 REVOKE-first, then the exact grant', revokeIdx > -1 && grantIdx > -1 && revokeIdx < grantIdx)
  check('C.10 no anon/authenticated grant anywhere', !/GRANT[^;]*\b(anon|authenticated)\b/.test(sql))

  // No practice-derived column (#18/#20).
  check('C.11 no practice-derived column (#18/#20)', !/\b(stage|tier|milestone|alignment|proximity|virtue|grade|score)\b/i.test(sql.match(/CREATE TABLE[\s\S]*?\);/)?.[0] ?? sql))

  // C.12 (PR19 fold F3, 2026-08-03 — live-proven: a 'popularity' column passed
  // both deny-lists): the deny-lists are belt; this exact column ALLOWLIST is
  // the braces. Parse the CREATE TABLE block's column identifiers and assert
  // they equal V1's documented sixteen — ANY new column (whatever its name)
  // goes red until deliberately added here AND to V1.
  const EXPECTED_COLUMNS = [
    'id', 'owner_user_id', 'agent_id', 'credential_ref', 'what_i_bring',
    'what_i_seek', 'contact_channel', 'visibility', 'tags', 'declared_at',
    'renewed_at', 'status', 'removal_ground', 'removal_artifact_ref',
    'created_at', 'updated_at',
  ]
  const createBlock = sql.match(/CREATE TABLE[\s\S]*?\n\);/)?.[0] ?? ''
  const colNames = createBlock
    .split('\n')
    .map((l) => l.match(/^\s{2}([a-z_]+)\s+(UUID|TEXT|TIMESTAMPTZ|BOOLEAN|INTEGER|BIGINT|JSONB|DOUBLE)/i))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => m[1])
    .filter((n) => n !== 'CONSTRAINT')
  check('C.12a column parse found the table (non-vacuity)', colNames.length >= 10, `parsed ${colNames.length}`)
  check(
    'C.12b the column set is EXACTLY the documented sixteen',
    colNames.length === EXPECTED_COLUMNS.length && colNames.every((c, i) => c === EXPECTED_COLUMNS[i]),
    `parsed: ${colNames.join(', ')}`,
  )
}

// ============================================================================
// D. Ordering — declaration recency is the ONLY sort key (#8)
// ============================================================================
{
  console.log('§D ordering pins (#8)')
  const code = stripTsComments(storeSrc)
  const orderCalls = [...code.matchAll(/\.order\(\s*'([^']+)'/g)].map((m) => m[1])
  check('D.1 the store contains .order() calls to pin (non-vacuity)', orderCalls.length >= 1, `found ${orderCalls.length}`)
  check(
    "D.2 EVERY .order() call keys declared_at — no other sort key exists",
    orderCalls.every((c) => c === 'declared_at'),
    orderCalls.join(', '),
  )
  // The serving list orders descending (newest declaration first).
  check('D.3 the list order is descending recency', /\.order\('declared_at',\s*\{\s*ascending:\s*false\s*\}\)/.test(code))
  // Renewal must not write declared_at (the float-to-top lever pin): the
  // update path's payload never contains declared_at.
  const updateFn = code.slice(code.indexOf('export async function updateStoaEntry'), code.indexOf('export async function renewStoaEntry'))
  check('D.4 updateStoaEntry never writes declared_at', updateFn.length > 100 && !/declared_at/.test(updateFn))
}

// ============================================================================
// E. Data-rights wiring pins (INV source-grep, the house pattern)
// ============================================================================
{
  console.log('§E data-rights wiring (at birth)')
  const del = readFileSync(join(SRC, 'app', 'api', 'user', 'delete', 'route.ts'), 'utf8')
  const exp = readFileSync(join(SRC, 'app', 'api', 'user', 'export', 'route.ts'), 'utf8')
  const gather = readFileSync(join(SRC, 'lib', 'user-data-gathering.ts'), 'utf8')
  const erasure = readFileSync(join(SRC, 'lib', 'consumer-erasure.ts'), 'utf8')
  const handler = readFileSync(join(SRC, 'app', 'api', 'credential', 'erase', 'handler.ts'), 'utf8')
  check('E.1 /api/user/delete calls deleteStoaDataForOwner', /deleteStoaDataForOwner\(userId\)/.test(del))
  check('E.2 delete compliance log names stoa_entries', /'stoa_entries'/.test(del))
  check('E.3 /api/user/export calls getStoaDataForOwner', /getStoaDataForOwner\(userId\)/.test(exp))
  check('E.4 the Art 15 access copy includes the Stoa', /getStoaDataForOwner\(userId\)/.test(gather))
  check('E.5 consumer-erasure calls deleteStoaDataForCredential', /deleteStoaDataForCredential\(credentialRef,\s*client\)/.test(erasure))
  check('E.6 erasure result carries stoa_deleted', /stoa_deleted/.test(erasure))
  check('E.7 the erase response + audit report the Stoa honestly', /stoa_rows_deleted/.test(handler) && /stoa_entries \(credential-scoped/.test(handler))
  // #24: the Stoa never enters a retention sweep — no purge function exists.
  check('E.8 the store defines NO purge/sweep function (#24)', !/purge|sweep/i.test(stripTsComments(storeSrc)))
  // PR19 fold F1 (2026-08-03, the HIGH): agent entries are owner-NULL by the
  // XOR, so account deletion must ALSO delete by the user's owned credential
  // refs, and the export/access copies must carry the agent entries.
  check('E.9 /api/user/delete has the agent arm (deleteStoaDataForCredential per owned credential)', /deleteStoaDataForCredential\(`api_key:\$\{id\}`\)/.test(del))
  check('E.10 export + access carry the agent entries (getStoaDataForCredentials)', /getStoaDataForCredentials\(refs\)/.test(exp) && /getStoaDataForCredentials\(refs\)/.test(gather))
}

console.log(`\nstoa-boundary battery: ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
