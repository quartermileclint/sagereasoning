/**
 * q1-determination.test.ts — R2b: the Q1 third state ("I cannot determine").
 * Run: npx tsx website/src/lib/sage-reflect/__tests__/q1-determination.test.ts
 *
 * The defect: the mentor-vetted Q1 wording (live 2026-08-16) invites "I cannot
 * determine" as a legitimate answer, and the extraction pipeline collapsed it into
 * "examined, found nothing" — both yield `distortions: []`. Three such honest
 * answers trip `null_reflection`, whose detail claims "Phantasia review returning
 * null consistently", elevating fabrication_risk to moderate and surfacing a
 * misdirected scrutiny note. The pipeline mislabels exactly the honesty the wording
 * was written to elicit.
 *
 * This COMPLETES the vetted-wording ruling rather than amending it. The wording is
 * not re-opened.
 */
import { q1Clean, q1Undetermined, type Q1Assessment } from '../engine'
import { REFLECT_Q1_DETERMINATION_ENV_VAR, isReflectQ1DeterminationEnabled } from '../reflect-flags'

let passed = 0
let failed = 0
function check(label: string, cond: boolean) {
  if (cond) {
    passed++
    console.log(`  PASS  ${label}`)
  } else {
    failed++
    console.log(`  FAIL  ${label}`)
  }
}

const prev = process.env[REFLECT_Q1_DETERMINATION_ENV_VAR]

const CLEAN: Q1Assessment = { distortions: [] }
const DIRTY: Q1Assessment = {
  distortions: [{ impression: 'x', root_passion: 'phobos', examined: false }],
}
const UNDETERMINED: Q1Assessment = { distortions: [], determination: 'cannot_determine' }
const DETERMINED_CLEAN: Q1Assessment = { distortions: [], determination: 'determined' }

// ============================================================================
console.log('\n§1 — THE HARD CONSTRAINT: genuine-clean is NOT weakened')
// ============================================================================
// The null-suspicion mechanism is legitimate for actual repeated nulls. The defect
// is only that it could not see a third state — never that it fires too readily on
// genuine nulls. If §1.1 ever moves, the fix has overreached.
check('§1.1 an examined-and-found-nothing answer is STILL clean', q1Clean(CLEAN) === true)
check('§1.2 a distortion-bearing answer is STILL not clean', q1Clean(DIRTY) === false)
check('§1.3 an explicitly DETERMINED clean answer is clean', q1Clean(DETERMINED_CLEAN) === true)

// ============================================================================
console.log('\n§2 — the third state is distinct from BOTH existing states')
// ============================================================================
check('§2.1 "cannot determine" does NOT count as clean (so null_reflection cannot fire on it)',
  q1Clean(UNDETERMINED) === false)
check('§2.2 and is identifiable in its own right', q1Undetermined(UNDETERMINED) === true)
check('§2.3 a genuine clean answer is NOT undetermined', q1Undetermined(CLEAN) === false)
check('§2.4 a distortion-bearing answer is NOT undetermined', q1Undetermined(DIRTY) === false)
// The distinction must be the DETERMINATION, not the empty array — otherwise the
// third state would just be "clean" renamed.
check('§2.5 undetermined and clean share an EMPTY distortions array (so the array cannot be the discriminator)',
  UNDETERMINED.distortions.length === 0 && CLEAN.distortions.length === 0)
check('§2.6 yet they read differently (the discriminator is the determination field)',
  q1Clean(UNDETERMINED) !== q1Clean(CLEAN))

// ============================================================================
console.log('\n§3 — the flag gates the EXTRACTION CONTRACT, not the reading')
// ============================================================================
{
  delete process.env[REFLECT_Q1_DETERMINATION_ENV_VAR]
  check('§3.1 flag reader false when unset', isReflectQ1DeterminationEnabled() === false)
  process.env[REFLECT_Q1_DETERMINATION_ENV_VAR] = 'TRUE'
  check('§3.2 flag reader is EXACT-match (TRUE ⇒ false)', isReflectQ1DeterminationEnabled() === false)
  process.env[REFLECT_Q1_DETERMINATION_ENV_VAR] = 'true'
  check('§3.3 flag reader true only for exact "true"', isReflectQ1DeterminationEnabled() === true)
  delete process.env[REFLECT_Q1_DETERMINATION_ENV_VAR]

  // q1Clean itself is deliberately NOT flag-gated: flag-off the extractor never
  // produces `determination`, so the branch is unreachable and the reading is
  // byte-identical. Gating the pure predicate too would add a second place for the
  // two to disagree.
  check('§3.4 flag-off, an assessment with no determination reads exactly as before',
    q1Clean(CLEAN) === true && q1Clean(DIRTY) === false)
}

if (prev === undefined) delete process.env[REFLECT_Q1_DETERMINATION_ENV_VAR]
else process.env[REFLECT_Q1_DETERMINATION_ENV_VAR] = prev

console.log(`\nq1-determination battery: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
