/**
 * r20a-classifier-session-id.test.ts — R2b item 5.
 * Run: npx tsx website/src/lib/__tests__/r20a-classifier-session-id.test.ts
 *
 * THE SINK HAD ZERO TEST COVERAGE before this file: a repo-wide grep for
 * `logClassifierRun`, `r20a-cost-tracker` or `writeClassifierDownMarker` across
 * every *.test.ts returned nothing. That absence is why a free-form session id
 * reaching a UUID column survived unnoticed on two live surfaces.
 *
 * What is pinned here is the SHAPING, which is pure and env-gated. The insert
 * itself is not exercised (it needs a Supabase admin client); the shaping is the
 * whole of the fix.
 */
import {
  shapeClassifierSessionId,
  isClassifierSessionIdShapingEnabled,
  CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR,
} from '../r20a-cost-tracker'

let passed = 0
let failed = 0
function check(label: string, cond: boolean, extra?: string) {
  if (cond) {
    passed++
    console.log(`  PASS  ${label}`)
  } else {
    failed++
    console.log(`  FAIL  ${label}${extra ? ` — ${extra}` : ''}`)
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const prev = process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR]

// ============================================================================
console.log('\n§1 — FLAG OFF: byte-identical to the pre-fix expression `v || null`')
// ============================================================================
{
  delete process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR]
  check('§1.1 flag reader false when unset', isClassifierSessionIdShapingEnabled() === false)
  // The exact live-failing value: /api/practice/reflect builds `reflect-<uuid>`.
  const live = 'reflect-3f2504e0-4f89-11d3-9a0c-0305e82c3301'
  check('§1.2 flag off ⇒ a free-form id passes through UNCHANGED (still fails at the DB, as today)',
    shapeClassifierSessionId(live) === live)
  check('§1.3 flag off ⇒ null stays null', shapeClassifierSessionId(null) === null)
  check('§1.4 flag off ⇒ empty string becomes null (the `v || null` semantic)',
    shapeClassifierSessionId('') === null)
  check('§1.5 flag off ⇒ undefined becomes null', shapeClassifierSessionId(undefined) === null)
}

// ============================================================================
console.log('\n§2 — FLAG ON: free-form ids become UUID-shaped, deterministically')
// ============================================================================
{
  process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR] = 'TRUE'
  check('§2.1 flag reader is EXACT-match (TRUE ⇒ false)', isClassifierSessionIdShapingEnabled() === false)
  process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR] = 'true'
  check('§2.2 flag reader true only for exact "true"', isClassifierSessionIdShapingEnabled() === true)

  const live = 'reflect-3f2504e0-4f89-11d3-9a0c-0305e82c3301'
  const shaped = shapeClassifierSessionId(live)
  check('§2.3 the reflect-path id is shaped into valid UUID layout (the column accepts it)',
    typeof shaped === 'string' && UUID_RE.test(shaped), String(shaped))
  check('§2.4 shaping is DETERMINISTIC (same id ⇒ same UUID ⇒ rows stay correlatable)',
    shapeClassifierSessionId(live) === shaped)
  check('§2.5 different ids do NOT collide',
    shapeClassifierSessionId('reflect-aaa') !== shapeClassifierSessionId('reflect-bbb'))

  // The /api/calling instance — unrecorded anywhere before this session.
  const calling = 'calling-session-xyz'
  check('§2.6 the /api/calling free-form id is shaped too (the chokepoint defends both)',
    UUID_RE.test(shapeClassifierSessionId(calling) as string))

  // An id ALREADY in UUID shape must pass through untouched — otherwise a
  // well-formed caller would silently lose its real, joinable id.
  const real = '3f2504e0-4f89-11d3-9a0c-0305e82c3301'
  check('§2.7 an already-valid UUID passes through UNCHANGED (no gratuitous rewrite)',
    shapeClassifierSessionId(real) === real)
  check('§2.8 null still maps to null flag-on', shapeClassifierSessionId(null) === null)
}

// ============================================================================
console.log('\n§3 — non-vacuity: the pre-fix value would genuinely have been rejected')
// ============================================================================
{
  // If this assertion ever fails, §2.3 proves nothing — the "broken" input would
  // already have been valid and there was no defect to fix.
  const live = 'reflect-3f2504e0-4f89-11d3-9a0c-0305e82c3301'
  check('§3.1 the live free-form id is NOT valid UUID layout (so the column genuinely rejects it)',
    !UUID_RE.test(live))
  check('§3.2 and the shaped form IS (so the fix genuinely changes the outcome)',
    UUID_RE.test(shapeClassifierSessionId(live) as string))
}

if (prev === undefined) delete process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR]
else process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR] = prev

console.log(`\nr20a classifier session-id battery: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
