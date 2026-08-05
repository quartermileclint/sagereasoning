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

// ST3 (2026-08-03): value-level pins over the new lib/stoa modules (memory:
// content-pins-assert-exported-values — source-substring pins are satisfiable
// by comments; these are not). All lazy-client modules; nothing connects.
import {
  STOA_SELF_DESCRIPTION,
  STOA_ETHIC,
  STOA_STALE_AFTER_DAYS,
} from '../stoa-copy'
import { STOA_SUGGESTED_TAGS } from '../stoa-tags'
import { computeStoaShelf, isShelfRelevant, STOA_SHELF_MAX } from '../stoa-shelf'
import {
  presentStoaEntry,
  presentOwnStoaEntry,
  assessStoaStaleness,
  filterStoaEntriesByQuery,
} from '../stoa-presentation'
import type { StoaEntry } from '../stoa-store'

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
    // ST3 addition (2026-08-03): the crisis-resources single source of truth,
    // consumed by stoa-r20a.ts for the mild support fold. Safety perimeter,
    // not the forbidden trust/practice class; data flows INTO the Stoa
    // response only (a static resource list) — nothing Stoa-derived flows
    // out through it.
    '@/lib/guardrails',
    // ST4 addition (2026-08-03): the UPC capability-checking chokepoint,
    // consumed by the new stoa-credential.ts for the agent-presence +
    // agent-declare auth arms. NOT the forbidden trust/practice class (see
    // practice-credential.ts's own module banner: no trust-core/kathekon/
    // practice-suggestion data flow — it is an auth primitive, same
    // single-purpose-import discipline as the K1 grammar allowance above).
    '@/lib/practice-credential',
    // ST4 addition: a TYPE-ONLY import (NextRequest) in stoa-credential.ts —
    // no runtime dependency, needed because that module reads request
    // headers directly (the presence/declare auth seam).
    'next/server',
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

  // A.5 (PR19 fold, 2026-08-03, HIGH — live-proven: a trust-core import
  // added to the mentor route passed ALL batteries green): the ROUTE LAYER
  // is where store, presentation, and response composition meet — the most
  // realistic #20 violation channel — and §A's lib-tree scan never saw it.
  // The serving surfaces are scanned against the FORBIDDEN class (not the
  // exact allowlist — routes legitimately import next/security/etc.).
  const SERVING_SURFACES = [
    join(SRC, 'app', 'api', 'stoa', 'entries', 'route.ts'),
    join(SRC, 'app', 'api', 'mentor', 'stoa', 'route.ts'),
    // ST4 addition (2026-08-03): the agent declare/tend/withdraw route.
    join(SRC, 'app', 'api', 'stoa', 'declare', 'route.ts'),
    join(SRC, 'app', 'stoa', 'page.tsx'),
    join(SRC, 'app', 'stoa', 'layout.tsx'),
  ]
  const servingForbidden: string[] = []
  let servingSpecs = 0
  for (const f of SERVING_SURFACES) {
    const specs = extractSpecifiers(readFileSync(f, 'utf8'))
    servingSpecs += specs.length
    for (const s of specs) {
      if (FORBIDDEN.some((k) => s.includes(k))) servingForbidden.push(`${f.replace(SRC, 'src')} → ${s}`)
    }
  }
  check('A.5a serving surfaces scanned with specifiers (non-vacuity)', servingSpecs >= 10, `found ${servingSpecs}`)
  check('A.5b no forbidden-class import on any serving surface (#20 at the route layer)',
    servingForbidden.length === 0, servingForbidden.join(', '))
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
    // ST3 additions (2026-08-03) — each deliberate, path-exact:
    // The two Stoa serving routes (they ARE the surface; they consume the
    // store and nothing else consumes them).
    join(SRC, 'app', 'api', 'stoa', 'entries', 'route.ts'),
    join(SRC, 'app', 'api', 'mentor', 'stoa', 'route.ts'),
    // The /stoa page — display-only imports of the canonical copy + the
    // suggested tag vocabulary (the content-pins lesson: copy lives as
    // exported values, imported, never duplicated).
    join(SRC, 'app', 'stoa', 'page.tsx'),
    // The R20a guard registry — names this route's flagSource ('stoa-store')
    // as a SAFETY assertion; no data flow.
    join(SRC, 'lib', '__tests__', 'r20a-invocation-guard.test.ts'),
    // The declaration route's own per-route R20a battery.
    join(SRC, 'app', 'api', 'mentor', 'stoa', '__tests__', 'r20a-invocation.test.ts'),
    // ST4 additions (2026-08-03): the agent declare/tend/withdraw route (the
    // agent-identity counterpart — it IS the surface) and the guard
    // registry's now-extended exclusion comment naming it by path.
    join(SRC, 'app', 'api', 'stoa', 'declare', 'route.ts'),
    // ST7 addition (2026-08-04, Q5c/Q13a trust-event wiring): the ONE
    // deliberately-opened boundary crossing — an admin-only, no-UI route
    // that reads a Stoa entry (getStoaEntryById) to emit a trust event
    // referencing it. This is the single file permitted to import BOTH
    // lib/stoa AND substrate/trust-core (see its own header + the §A
    // FORBIDDEN-class sweep below, which is NOT extended to cover this
    // route — the opening is intentional and one-directional: this route
    // may read the Stoa; the Stoa store still imports nothing from
    // trust-core, and no OTHER file outside this allowlist may reference
    // stoa_entries/stoa-store).
    join(SRC, 'app', 'api', 'admin', 'stoa-trust-flag', 'route.ts'),
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

// ============================================================================
// G. Tag vocabulary — domains, never qualities (#10, Q3c)
// ============================================================================
{
  console.log('§G tag-vocabulary deny-class (#10)')
  // The evaluative deny-class: any term that grades the DECLARER rather than
  // naming a domain of work/inquiry. The mentor's own examples of forbidden
  // tags head the list. Substring-matched case-insensitively so compounds
  // ("expert-advice") trip too.
  const EVALUATIVE_DENY = [
    'experienced', 'advanced', 'trusted', 'expert', 'senior', 'certified',
    'master', 'verified', 'vetted', 'elite', 'top-', 'best', 'leading',
    'premier', 'accredited', 'qualified', 'skilled', 'proficient', 'guru',
    'renowned', 'award',
  ]
  check('G.1 the seed vocabulary is non-trivial (non-vacuity)', STOA_SUGGESTED_TAGS.length >= 10,
    `found ${STOA_SUGGESTED_TAGS.length}`)
  const evaluativeHits = STOA_SUGGESTED_TAGS.filter((t) =>
    EVALUATIVE_DENY.some((d) => t.toLowerCase().includes(d)))
  check('G.2 no evaluative term in the seed vocabulary (#10)', evaluativeHits.length === 0,
    evaluativeHits.join(', '))
  // The mentor's three example DOMAIN tags are present (Q3c).
  const mentorExamples = ['stoic-ethics', 'agent-development', 'grief-processing']
  check("G.3 the mentor's three example domains are present",
    mentorExamples.every((t) => STOA_SUGGESTED_TAGS.includes(t)))
  // Deny-class self-test (non-vacuity): a poisoned vocabulary trips.
  const poisoned = [...STOA_SUGGESTED_TAGS, 'expert-mentoring']
  check('G.4 deny-class self-test: an evaluative tag would trip',
    poisoned.filter((t) => EVALUATIVE_DENY.some((d) => t.includes(d))).length === 1)

  // G.5 (PR19 fold, 2026-08-03, MEDIUM — 12/12 evaluative probes slipped the
  // deny-list: 'professional-mentoring', 'world-class-coaching', '10x-…',
  // 'seasoned-…', 'rockstar-…' …): the deny-list is belt; this EXACT
  // position-exact snapshot is the braces (the ST2 C.12 pattern) — ANY
  // vocabulary change goes red until deliberately made here too, forcing the
  // #10 domain-not-quality judgement at every addition.
  const SNAPSHOT = [
    'stoic-ethics', 'agent-development', 'grief-processing', 'daily-practice',
    'journaling', 'meditation', 'premeditatio', 'philosophy', 'stoic-physics',
    'stoic-logic', 'ai-ethics', 'research', 'software-engineering', 'writing',
    'teaching', 'mentoring', 'community-building', 'parenting',
  ]
  check('G.5 the seed vocabulary is EXACTLY the reviewed eighteen (snapshot pin)',
    STOA_SUGGESTED_TAGS.length === SNAPSHOT.length &&
      STOA_SUGGESTED_TAGS.every((t, i) => t === SNAPSHOT[i]),
    STOA_SUGGESTED_TAGS.join(', '))
}

// ============================================================================
// H. The passive shelf — declared content ONLY, filter never rank (#5)
// ============================================================================
{
  console.log('§H shelf pins (#5)')
  const shelfSrc = readFileSync(join(SRC, 'lib', 'stoa', 'stoa-shelf.ts'), 'utf8')
  const shelfCode = stripTsComments(shelfSrc)
  // Structural purity: the matcher performs no I/O and reads no ambient
  // state. Regex WIDENED at the PR19 fold (2026-08-03 — a live mutation via
  // globalThis.performance + Date.parse ran green under the old pattern);
  // the deny-list is belt, the H.11 access-set pin below is the braces.
  check('H.1 shelf module is pure (no fetch/env/client/clock/random)',
    !/fetch\s*\(|process\.env|createClient|new Date|Date\.now|Date\.parse|performance\.|Math\.random|globalThis/.test(shelfCode))
  // Signature pin — WEAK ALONE (function.length stops at the first defaulted
  // param; PR19-proven defeatable); retained as a tripwire, superseded in
  // force by H.11.
  check('H.2 computeStoaShelf takes exactly (own, candidates)', computeStoaShelf.length === 2)
  check('H.3 no .sort( in the shelf (filter, never rank)', !/\.sort\s*\(/.test(shelfCode))

  // Functional pins.
  function mk(id: string, over: Partial<StoaEntry>): StoaEntry {
    return {
      schema: 'stoa-entry-v1', id, ownerUserId: `u-${id}`, agentId: null,
      credentialRef: null, whatIBring: null, whatISeek: null,
      contactChannel: null, visibility: 'community', tags: [],
      declaredAt: '2026-08-01T00:00:00Z', renewedAt: null, status: 'active',
      removalGround: null, removalArtifactRef: null, ...over,
    }
  }
  const own = mk('own', {
    tags: ['journaling'],
    whatISeek: 'guidance structuring premeditatio exercises',
    whatIBring: 'premeditatio exercises guidance for beginners',
  })
  const tagMatch = mk('a', { tags: ['journaling', 'philosophy'] })
  const termMatch = mk('b', { whatIBring: 'I offer premeditatio exercises and help structuring a morning practice' })
  const inverseMatch = mk('c', { whatISeek: 'guidance structuring premeditatio exercises' , whatIBring: null })
  const noMatch = mk('d', { tags: ['parenting'], whatIBring: 'carpentry conversation' })
  check('H.4 shared domain tag matches', isShelfRelevant(own, tagMatch))
  check('H.5 seek↔bring term overlap matches', isShelfRelevant(own, termMatch))
  check('H.6 no-overlap candidate does not match', !isShelfRelevant(own, noMatch))
  // Inverse direction: own bring ↔ their seek.
  const own2 = mk('own2', { whatIBring: 'guidance structuring premeditatio exercises' })
  check('H.7 bring↔seek inverse direction matches', isShelfRelevant(own2, inverseMatch))
  // Order preservation + own-exclusion + cap.
  const candidates = [tagMatch, noMatch, termMatch, own, inverseMatch]
  const shelf = computeStoaShelf(own, candidates)
  check('H.8 own entry excluded from the shelf', !shelf.some((e) => e.id === 'own'))
  check('H.9 shelf preserves the given (recency) order',
    shelf.map((e) => e.id).join(',') === 'a,b,c', shelf.map((e) => e.id).join(','))
  const many = Array.from({ length: 10 }, (_, i) => mk(`m${i}`, { tags: ['journaling'] }))
  check(`H.10 shelf caps at ${STOA_SHELF_MAX}`, computeStoaShelf(own, many).length === STOA_SHELF_MAX)

  // H.11 (PR19 fold, 2026-08-03, the HIGH — a candidate.credentialRef-keyed
  // branch inside isShelfRelevant passed everything): the #5 ruling made
  // OBSERVABLE. Run the matcher against Proxy-wrapped entries that record
  // every property read, and assert the accessed set is EXACTLY the declared
  // content the ruling licenses (tags, whatISeek, whatIBring) — any read of
  // status / credentialRef / declaredAt / visibility or any other field goes
  // red, whatever the code shape. Regex-free, shape-independent.
  {
    const ALLOWED_READS = new Set(['tags', 'whatISeek', 'whatIBring'])
    const accessed = new Set<string>()
    function spy(entry: StoaEntry): StoaEntry {
      return new Proxy(entry, {
        get(target, prop) {
          if (typeof prop === 'string') accessed.add(prop)
          return target[prop as keyof StoaEntry]
        },
      })
    }
    // Exercise every matching branch: tag-hit, term-hit both directions, miss.
    isShelfRelevant(spy(own), spy(tagMatch))
    isShelfRelevant(spy(own), spy(termMatch))
    isShelfRelevant(spy(own2), spy(inverseMatch))
    isShelfRelevant(spy(own), spy(noMatch))
    const illicit = [...accessed].filter((p) => !ALLOWED_READS.has(p))
    check('H.11a the matcher read fields at all (non-vacuity)', accessed.size >= 2, [...accessed].join(', '))
    check('H.11b isShelfRelevant reads ONLY declared content (#5, access-set pin)',
      illicit.length === 0, `illicit reads: ${illicit.join(', ')}`)
    // computeStoaShelf may additionally read id (own-exclusion) — same pin,
    // wider allowance, still nothing behavioural.
    const shelfAccessed = new Set<string>()
    function spy2(entry: StoaEntry): StoaEntry {
      return new Proxy(entry, {
        get(target, prop) {
          if (typeof prop === 'string') shelfAccessed.add(prop)
          return target[prop as keyof StoaEntry]
        },
      })
    }
    computeStoaShelf(spy2(own), [spy2(tagMatch), spy2(noMatch), spy2(own)])
    const shelfIllicit = [...shelfAccessed].filter((p) => !ALLOWED_READS.has(p) && p !== 'id')
    check('H.11c computeStoaShelf reads only declared content + id (#5)',
      shelfIllicit.length === 0, `illicit reads: ${shelfIllicit.join(', ')}`)
  }
}

// ============================================================================
// I. Canonical copy — value-level pins (#22/#30, Q14/Q7)
// ============================================================================
{
  console.log('§I canonical copy pins (#22/#30)')
  // Mentor-verbatim (Q14) — asserted against the RECORD FILE itself (PR19
  // fold, 2026-08-03: the first draft compared the copy to a re-typed test
  // constant, which could never detect drift against the record and in fact
  // masked a one-byte apostrophe divergence — the record's apostrophe is
  // ASCII). The copy must appear as a byte-exact SUBSTRING of the binding
  // verbatim record.
  const RECORD_PATH = join(
    WEBSITE, '..', 'operations', 'connective-layer-2026-08',
    '2026-08-02-mentor-consultation-connective-layer-verbatim.md',
  )
  const recordSrc = readFileSync(RECORD_PATH, 'utf8')
  check('I.0 the binding record file exists and is non-trivial (non-vacuity)', recordSrc.length > 5000)
  check('I.1 the self-description is a byte-exact substring of the verbatim record (Q14)',
    recordSrc.includes(STOA_SELF_DESCRIPTION))
  // The ethic carries the Q7 kathekonta's load-bearing clauses.
  check('I.2 the ethic names the declaration-scoped consent',
    STOA_ETHIC.includes('individually, referencing the declaration, about the declared matters'))
  check('I.3 the ethic names bulk outreach as a violation of the space',
    STOA_ETHIC.includes('violation of the space, not a use of it'))
  check('I.4 the ethic binds humans and agents identically',
    STOA_ETHIC.includes('human or agent — identically'))
  check('I.5 the staleness threshold is the recorded 180 days', STOA_STALE_AFTER_DAYS === 180)
  // The page IMPORTS the canonical values (never re-types them).
  const pageSrc = readFileSync(join(SRC, 'app', 'stoa', 'page.tsx'), 'utf8')
  check('I.6 the page imports the canonical copy from stoa-copy',
    /STOA_SELF_DESCRIPTION/.test(pageSrc) && /STOA_ETHIC/.test(pageSrc) &&
      /from '@\/lib\/stoa\/stoa-copy'/.test(pageSrc))
  check('I.7 the page imports the suggested tags from stoa-tags',
    /STOA_SUGGESTED_TAGS/.test(pageSrc) && /from '@\/lib\/stoa\/stoa-tags'/.test(pageSrc))
  // PR19 fold: imported ≠ rendered — pin the JSX expressions too.
  check('I.8 the page RENDERS the canonical values as JSX expressions',
    /\{STOA_SELF_DESCRIPTION\}/.test(pageSrc) && /\{STOA_ETHIC\}/.test(pageSrc) &&
      /\{STOA_NOT_YET_OPEN\}/.test(pageSrc) && /\{STOA_NEAR_EMPTY_FRAMING\}/.test(pageSrc))
}

// ============================================================================
// J. No re-sort anywhere on the serving path (#8)
// ============================================================================
{
  console.log('§J no-resort pins (#8)')
  // PR19 fold (2026-08-03): the store + layout joined the set, and the
  // primitive class widened past `.sort(` — `toSorted` is the natural
  // "non-mutating sort" a well-meaning edit reaches for, and `.reverse()` /
  // an orderBy helper reorder just as well. (The store's own `.order(` DB
  // calls are §D's subject and do not match these patterns.)
  const RESORT = /\.sort\s*\(|toSorted\s*\(|\.reverse\s*\(|orderBy/
  const files: Array<[string, string]> = [
    ['entries route', join(SRC, 'app', 'api', 'stoa', 'entries', 'route.ts')],
    ['mentor route', join(SRC, 'app', 'api', 'mentor', 'stoa', 'route.ts')],
    // ST4 addition (2026-08-03): the agent declare route also reads
    // listStoaEntries for its own shelf — it must serve recency verbatim too.
    ['declare route', join(SRC, 'app', 'api', 'stoa', 'declare', 'route.ts')],
    ['page', join(SRC, 'app', 'stoa', 'page.tsx')],
    ['layout', join(SRC, 'app', 'stoa', 'layout.tsx')],
    ['presentation', join(SRC, 'lib', 'stoa', 'stoa-presentation.ts')],
    ['store', join(SRC, 'lib', 'stoa', 'stoa-store.ts')],
  ]
  let scanned = 0
  const sorters: string[] = []
  for (const [label, p] of files) {
    scanned++
    if (RESORT.test(stripTsComments(readFileSync(p, 'utf8')))) sorters.push(label)
  }
  check('J.1 all seven serving files exist and were scanned (non-vacuity)', scanned === 7)
  check('J.2 no re-sort primitive on any serving surface — recency served verbatim (#8)',
    sorters.length === 0, sorters.join(', '))
}

// ============================================================================
// K. Presentation honesty — what a viewer is never served
// ============================================================================
{
  console.log('§K presentation pins (Q4b + the ST1 raw-UUID lesson)')
  const human: StoaEntry = {
    schema: 'stoa-entry-v1', id: 'e1', ownerUserId: 'uuid-secret', agentId: null,
    credentialRef: null, whatIBring: 'x', whatISeek: null, contactChannel: null,
    visibility: 'community', tags: [], declaredAt: '2026-08-01T00:00:00Z',
    renewedAt: null, status: 'active', removalGround: null, removalArtifactRef: null,
  }
  const agent: StoaEntry = {
    ...human, id: 'e2', ownerUserId: null, agentId: 'sagereasoning:demo@v1',
    credentialRef: 'api_key:secret-ref',
  }
  const names = new Map([['uuid-secret', 'Marcus']])
  const hv = presentStoaEntry(human, names) as unknown as Record<string, unknown>
  const av = presentStoaEntry(agent, new Map()) as unknown as Record<string, unknown>
  check('K.1 human display identity is the display_name (Q4b)', hv.display_name === 'Marcus')
  check('K.2 unresolved human falls back to Practitioner (never email/UUID)',
    (presentStoaEntry(human, new Map()) as unknown as Record<string, unknown>).display_name === 'Practitioner')
  check('K.3 agent display identity is the K1 agent_id', av.display_name === 'sagereasoning:demo@v1')
  const servedKeys = Object.keys(hv)
  check('K.4 the raw owner UUID is never served (ST1 lesson)',
    !servedKeys.includes('owner_user_id') && !servedKeys.includes('ownerUserId') &&
      !JSON.stringify(hv).includes('uuid-secret'))
  check('K.5 the credential ref is never served',
    !JSON.stringify(av).includes('secret-ref'))
  check('K.6 status/removal fields are never served',
    !servedKeys.includes('status') && !servedKeys.includes('removal_ground'))
  check('K.7 declaration dates always served (#12)',
    hv.declared_at === '2026-08-01T00:00:00Z' && 'renewed_at' in hv)

  // K.11–K.13 (ST4, #19): the trust-record/accreditation links — agent
  // entries only, STATIC relative paths (no live probe — the design
  // election recorded in stoa-presentation.ts's header).
  check('K.11 agent entries carry trust_record_url + accreditation_url keyed on the agent_id',
    av.trust_record_url === '/api/trust-record/sagereasoning:demo@v1' &&
      av.accreditation_url === '/api/accreditation/sagereasoning:demo@v1',
    JSON.stringify({ t: av.trust_record_url, a: av.accreditation_url }))
  check('K.12 human entries carry NEITHER link (null, never omitted-but-truthy)',
    hv.trust_record_url === null && hv.accreditation_url === null)
  check('K.13 non-vacuity: a different agent_id changes both links (not hardcoded)', (() => {
    const agent2: StoaEntry = { ...agent, id: 'e4', agentId: 'acme:other@v2' }
    const av2 = presentStoaEntry(agent2, new Map()) as unknown as Record<string, unknown>
    return (
      av2.trust_record_url === '/api/trust-record/acme:other@v2' &&
      av2.accreditation_url === '/api/accreditation/acme:other@v2'
    )
  })())

  // K.8–K.10 (PR19 fold, 2026-08-03): the OWN-VIEW projection — the first
  // draft served the raw store row to its owner, contradicting the stated
  // invariant and leaking removal_artifact_ref to a removed party.
  const removed: StoaEntry = {
    ...human, id: 'e3', status: 'removed',
    removalGround: 'spam_flooding', removalArtifactRef: 'internal-artifact-ref',
  }
  const ov = presentOwnStoaEntry(removed) as unknown as Record<string, unknown>
  check('K.8 own view never carries the auth UUID / credential ref / artifact ref',
    !JSON.stringify(ov).includes('uuid-secret') &&
      !('ownerUserId' in ov) && !('credentialRef' in ov) &&
      !JSON.stringify(ov).includes('internal-artifact-ref'))
  check('K.9 own view keeps status + removal ground (honest to the practitioner)',
    ov.status === 'removed' && ov.removalGround === 'spam_flooding')
  check('K.10 own view keeps the content + dates',
    ov.whatIBring === 'x' && ov.declaredAt === '2026-08-01T00:00:00Z' && 'renewedAt' in ov)
}

// ============================================================================
// L. Functional coverage the PR19 review named missing (search + staleness)
// ============================================================================
{
  console.log('§L search-filter + staleness pins')
  function mkL(id: string, over: Partial<StoaEntry>): StoaEntry {
    return {
      schema: 'stoa-entry-v1', id, ownerUserId: `u-${id}`, agentId: null,
      credentialRef: null, whatIBring: null, whatISeek: null,
      contactChannel: null, visibility: 'community', tags: [],
      declaredAt: '2026-08-01T00:00:00Z', renewedAt: null, status: 'active',
      removalGround: null, removalArtifactRef: null,
    ...over }
  }
  const l1 = mkL('l1', { whatIBring: 'Premeditatio coaching' })
  const l2 = mkL('l2', { whatISeek: 'a premeditatio partner' })
  const l3 = mkL('l3', { tags: ['premeditatio'] })
  const l4 = mkL('l4', { whatIBring: 'carpentry' })
  const all = [l1, l2, l3, l4]
  const hits = filterStoaEntriesByQuery(all, 'PREMEDITATIO')
  check('L.1 search is case-insensitive over bring/seek/tags',
    hits.map((e) => e.id).join(',') === 'l1,l2,l3', hits.map((e) => e.id).join(','))
  check('L.2 search preserves the given order (filter, never rank)',
    filterStoaEntriesByQuery([l3, l1, l2], 'premeditatio').map((e) => e.id).join(',') === 'l3,l1,l2')
  check('L.3 empty/whitespace query is the identity', filterStoaEntriesByQuery(all, '  ') === all)
  check('L.4 the query never reads the contact channel',
    filterStoaEntriesByQuery([mkL('l5', { contactChannel: 'premeditatio@example.com' })], 'premeditatio').length === 0)

  // Staleness (#24): the 179/180 boundary + renewed-over-declared precedence.
  const DAY = 24 * 60 * 60 * 1000
  const base = Date.parse('2026-01-01T00:00:00Z')
  check('L.5 day 179 is not stale', assessStoaStaleness(new Date(base).toISOString(), null, base + 179 * DAY).stale === false)
  check('L.6 day 180 is stale', assessStoaStaleness(new Date(base).toISOString(), null, base + 180 * DAY).stale === true)
  check('L.7 renewal resets the clock (renewedAt precedence)',
    assessStoaStaleness(
      new Date(base).toISOString(),
      new Date(base + 100 * DAY).toISOString(),
      base + 200 * DAY,
    ).stale === false)
}

console.log(`\nstoa-boundary battery: ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
