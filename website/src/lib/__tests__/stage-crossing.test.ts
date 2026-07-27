/**
 * stage-crossing.test.ts — resolveNewlyEarnedStage (Phase 3, the
 * stage-crossing trigger).
 *
 * REVISED 2026-07-27 for the mentor's simultaneous-crossing verdict
 * (`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-verdict-
 * verbatim.md`, binding): the resolver no longer picks the highest-ranked
 * newly-earned stage. It now requires the practitioner's most-recent-
 * evaluation level as a second input, and names ONLY that stage — never the
 * highest ever reached — returning it together with an `isPlural` flag when
 * more than one stage was newly earned at once.
 *
 * Self-contained (no shared imports beyond the module under test and the two
 * canonical sources it is held to), so this PR reverts independently.
 *
 * Run (from website/):
 *   npx tsx src/lib/__tests__/stage-crossing.test.ts
 */

import { resolveNewlyEarnedStage } from '../stage-crossing'
import { STAGE_PRACTICES } from '../practice-sequence'
import { MILESTONE_DEFINITIONS } from '../milestones'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  assert(a === e, `${label} (expected ${e}, got ${a})`)
}

const stormId = MILESTONE_DEFINITIONS.find((m) => m.pageSlug === 'the-storm')!.id
const wornPathId = MILESTONE_DEFINITIONS.find((m) => m.pageSlug === 'the-worn-path')!.id
const crossroadsId = MILESTONE_DEFINITIONS.find((m) => m.pageSlug === 'the-crossroads')!.id
const summitId = MILESTONE_DEFINITIONS.find((m) => m.pageSlug === 'the-clear-summit')!.id
const fireId = MILESTONE_DEFINITIONS.find((m) => m.pageSlug === 'the-inner-fire')!.id

const stormStage = STAGE_PRACTICES.find((s) => s.level === 'reflexive')!
const wornPathStage = STAGE_PRACTICES.find((s) => s.level === 'habitual')!
const crossroadsStage = STAGE_PRACTICES.find((s) => s.level === 'deliberate')!
const summitStage = STAGE_PRACTICES.find((s) => s.level === 'principled')!
const fireStage = STAGE_PRACTICES.find((s) => s.level === 'sage_like')!

// ─── A. No current-condition signal → silence, regardless of new_milestones ───

assertEqual(resolveNewlyEarnedStage([crossroadsId], null), null, 'A1: a null mostRecentEvaluationLevel is silence even with a genuine new crossing — never a guess')
assertEqual(resolveNewlyEarnedStage([], null), null, 'A2: empty ids + null level is silence')
assertEqual(resolveNewlyEarnedStage([], 'deliberate'), null, 'A3: a level with no new milestones at all is silence — nothing to disclose')
assertEqual(resolveNewlyEarnedStage(['first_step', 'grade_3_reached'], 'deliberate'), null, 'A4: non-stage ids only, even with a real level, resolve to null')
assertEqual(resolveNewlyEarnedStage(['not_a_real_milestone_id'], 'deliberate'), null, 'A5: an unknown id is tolerated, resolves to null, never throws')

// ─── B. The ordinary single-crossing case — the crossing IS the current level ───

for (const [id, level, stage] of [
  [stormId, 'reflexive', stormStage],
  [wornPathId, 'habitual', wornPathStage],
  [crossroadsId, 'deliberate', crossroadsStage],
  [summitId, 'principled', summitStage],
  [fireId, 'sage_like', fireStage],
] as const) {
  assertEqual(
    resolveNewlyEarnedStage([id], level),
    { stage, isPlural: false },
    `B1[${level}]: a single newly-earned crossing matching the current level resolves to {stage, isPlural:false}`
  )
}

// ─── C. THE BOUND VERDICT: the NAMED stage is the CURRENT level, never the highest ───

assertEqual(
  resolveNewlyEarnedStage([stormId, crossroadsId], 'reflexive'),
  { stage: stormStage, isPlural: true },
  'C1: two crossings at once, current level is the LOWER one (Storm) — the card names Storm, not the higher Crossroads. This is the exact case the mentor verdict rejected the old "highest wins" logic over.'
)
assertEqual(
  resolveNewlyEarnedStage([stormId, fireId], 'sage_like'),
  { stage: fireStage, isPlural: true },
  'C2: two crossings at once, current level is the HIGHER one (Inner Fire) — names Inner Fire correctly (this is not "always pick the lowest" either; it tracks the actual current condition either direction)'
)
assertEqual(
  resolveNewlyEarnedStage([stormId, wornPathId, crossroadsId, summitId, fireId], 'habitual'),
  { stage: wornPathStage, isPlural: true },
  'C3: all five newly earned at once, current level is the MIDDLE one (Worn Path) — names Worn Path, ignoring both the higher and lower crossings entirely'
)
assertEqual(
  resolveNewlyEarnedStage([summitId, summitId], 'principled'),
  { stage: summitStage, isPlural: false },
  'C4: a duplicated id is deduplicated in effect — isPlural is about DISTINCT crossings, not array length (defensive; the live route is idempotent and should never actually produce this)'
)

// ─── D. The current level must ALSO be among today's genuinely-new crossings ───
// (the further-conservative build decision, beyond the verdict's literal words)

assertEqual(
  resolveNewlyEarnedStage([stormId], 'deliberate'),
  null,
  "D1: the practitioner's current level (deliberate) is NOT among the newly-earned ids (only Storm is new) — silence, not a stale or mismatched claim"
)
assertEqual(
  resolveNewlyEarnedStage([stormId, fireId], 'deliberate'),
  null,
  'D2: same property with a plural new-crossing set — the current level still is not one of them, so silence, not a fallback to some other newly-earned stage'
)

// ─── E. Mixed stage + non-stage ids — the realistic shape of a catch-up response ───

assertEqual(
  resolveNewlyEarnedStage(['first_step', crossroadsId, 'grade_3_reached', 'passion_awareness'], 'deliberate'),
  { stage: crossroadsStage, isPlural: false },
  'E1: non-stage ids interspersed with a single stage id are ignored, not mistaken for a plurality'
)
assertEqual(
  resolveNewlyEarnedStage(['first_step', stormId, crossroadsId, 'passion_awareness'], 'reflexive'),
  { stage: stormStage, isPlural: true },
  'E2: non-stage ids interspersed with TWO stage ids still correctly detect the plurality and name the current one'
)

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
