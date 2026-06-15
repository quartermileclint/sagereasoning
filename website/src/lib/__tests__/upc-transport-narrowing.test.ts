/**
 * upc-transport-narrowing.test.ts — CI-14 Step 6c: the route-level X-Api-Key
 * transport regression test (deferred from the dark-build's adversarial review,
 * per practice-credential.test.ts:242-245).
 *
 * WHAT IT LOCKS (constraint 7 — the per-capability transport narrowing travels
 * with the capability, NOT the prefix):
 *   - The write-class surfaces (accreditation_write / calling / reflect) read the
 *     credential from `Authorization: Bearer` ONLY — never X-Api-Key — so the
 *     consolidation does not silently widen the write attack surface.
 *   - The unified `sr_prac_` prefix is accepted on those surfaces ONLY when the
 *     UPC flag is ON (flag-off byte-identical: sr_assent_ only).
 *   - The consult/l1_supply surface (/api/reason via security.ts extractRawKey)
 *     DOES accept BOTH transports (Authorization Bearer AND X-Api-Key) — the
 *     asymmetry that proves the narrowing is per-capability, not global.
 *
 * WHY SOURCE-LEVEL (the r20a-invocation.test.ts idiom): at the route level every
 * auth rejection collapses to 401, so transport-reject (no_token, pre-DB) and
 * DB-reject (invalid_token) are status-indistinguishable. The genuine BEHAVIOURAL
 * proof needs a VALID credential and is the Step-6b LIVE leg-B replay
 * (operations/p1-rebuild-2026-06/ci14-step6-legb-replay-proof.md): the one UPC
 * via X-Api-Key on /api/calling → 401, the SAME UPC via Bearer → 200. This file
 * is the regression-LOCK against a future edit that re-introduces X-Api-Key
 * acceptance on a write surface (which the live test can't guard between runs).
 *
 * Pure file-read assertions — runs with bare `npx tsx` (no --env-file, no route
 * import, no Supabase, no security.ts keepalive).
 *
 * Run: npx tsx website/src/lib/__tests__/upc-transport-narrowing.test.ts
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(name: string, cond: boolean): void {
  if (cond) passed++
  else { failed++; failures.push(name) }
}

const SRC = join(__dirname, '..', '..')
const read = (rel: string): string => readFileSync(join(SRC, rel), 'utf8')

const calling = read('app/api/calling/route.ts')
const reflect = read('app/api/practice/reflect/route.ts')
const accreditation = read('app/api/accreditation/[agent_id]/route.ts')
const security = read('lib/security.ts')

// X-Api-Key read pattern (the credential transport we must NOT see in write routes).
const X_API_KEY_READ = /headers\.get\(\s*['"]x-api-key['"]\s*\)/i

for (const [label, src] of [
  ['calling', calling],
  ['reflect', reflect],
  ['accreditation', accreditation],
] as const) {
  // 1. Reads the credential from the Authorization header (Bearer transport).
  assert(`${label}: reads Authorization header`, /headers\.get\(\s*['"]authorization['"]\s*\)/i.test(src))

  // 2. THE LOCK — never reads x-api-key (no X-Api-Key acceptance on a write surface).
  assert(`${label}: does NOT read x-api-key (Bearer-only, constraint 7)`, !X_API_KEY_READ.test(src))

  // 3. sr_prac_ acceptance is flag-gated (isUpcCapabilityAuthEnabled gates the UPC prefix).
  assert(`${label}: sr_prac_ acceptance gated by isUpcCapabilityAuthEnabled`,
    src.includes('UNIFIED_PRACTICE_CREDENTIAL_PREFIX') && src.includes('isUpcCapabilityAuthEnabled'))

  // 4. The legacy sr_assent_ Bearer prefix is still accepted (back-compat).
  assert(`${label}: legacy sr_assent_ Bearer prefix still accepted`,
    src.includes('Bearer sr_assent_') || src.includes('SAGE_ASSENT_WRITE_TOKEN_PREFIX'))

  // 5. The Bearer prefix check precedes (sits above) the DB validator call — so an
  //    X-Api-Key-only request is refused BEFORE any credential DB lookup.
  const prefixIdx = src.search(/assentPrefixOk|Bearer sr_assent_/)
  const validateIdx = src.search(/validateSageAssentWriteToken\(/)
  assert(`${label}: transport prefix check precedes the DB validator`,
    prefixIdx !== -1 && validateIdx !== -1 && prefixIdx < validateIdx)
}

// ── /api/reason consult/l1 — the ASYMMETRY: BOTH transports accepted ────────────
// security.ts extractRawKey must read BOTH authorization AND x-api-key, and accept
// sr_prac_ on BOTH (flag-gated) — proving the narrowing is per-capability.
assert('reason/extractRawKey: reads Authorization header', /headers\.get\(\s*['"]authorization['"]\s*\)/i.test(security))
assert('reason/extractRawKey: ALSO reads x-api-key (consult/l1 not Bearer-only)', X_API_KEY_READ.test(security))
assert('reason/extractRawKey: accepts sr_prac_ on both transports, flag-gated',
  security.includes('UNIFIED_PRACTICE_CREDENTIAL_PREFIX') && security.includes('isUpcCapabilityAuthEnabled'))

// ── validateApiKeyUpc: the consult requirement maps to 403 insufficient_capability ─
// (The DETERMINATION is unit-locked in practice-credential.test.ts:246; here we lock
//  the wrapper's status MAPPING so a non-consult credential is a 403, not a 401.)
assert('validateApiKeyUpc: insufficient_capability → 403',
  /insufficient_capability/.test(security) &&
  /consult capability/i.test(security) &&
  /status:\s*403/.test(security))

console.log('')
console.log(`Total: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
