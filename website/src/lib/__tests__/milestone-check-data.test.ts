/**
 * milestone-check-data.test.ts — Phase 0 (human practice-reminders build plan §5).
 *
 * Run via: npx tsx src/lib/__tests__/milestone-check-data.test.ts
 * (bare — the module under test imports only types, so no Supabase chain, no --env-file.)
 *
 * Plain-assertion script (no Jest), per the repo idiom. EXIT 0 all pass / EXIT 1 any fail.
 *
 * WHY THIS EXISTS: before Phase 0 there was no test of any kind covering milestones,
 * and `POST /api/milestones` had no caller anywhere in the app — so none of the 25
 * milestones had ever been awarded to anyone. This suite pins the check-data
 * arithmetic the awarding now depends on, plus the wiring that fires it.
 *
 * COVERAGE
 *   GAP-1..GAP-9 (+4b/4c/4d, 7b..7e)  maxConsecutiveGapDays — the
 *                   `returning_practitioner` / `journal_return` measure
 *                   (max gap, NOT days-since-now; null-timestamp trap)
 *   P1-1..P1-7      isJournalPhase1Complete — days 1-7 set membership, not a count
 *   BLD-1..BLD-11   buildV3MilestoneCheckData — field population + the DESC contract
 *   E2E-1..E2E-11   end-to-end through the real checkNewMilestones
 *   INV-1..INV-13   source-grep wiring pins (the callers, and authFetch not fetch)
 *
 * MUTATION-VERIFIED (2026-07-26): nine mutations were applied to the source, the
 * suite re-run, and the mutation reverted — first-gap-instead-of-max, phase-1-as-a-
 * count, no-DESC-sort, journal-gap-always-null, bare-fetch GET, POST removed from
 * the display, score-flow POST deleted, dashboard POST deleted, and the null-guard
 * removed. All nine fail the suite. The first of those originally SURVIVED (every
 * fixture happened to put the largest gap first), which is why GAP-4b/4c/4d exist.
 *
 * NOT COVERED: the route's own DB fan-out (needs env + a live Supabase); covered by
 * the founder's browser walkthrough.
 *
 * REVISED (2026-07-27, Phase 3 — the stage-crossing trigger): INV-2 loosened
 * from an exact-adjacent-substring match to a bounded-span regex, because
 * score/page.tsx's milestone POST call now reads its response (via .then, to
 * resolve a newly-earned stage) rather than firing it and discarding the
 * result. The invariant itself — no rejection from this call reaches the
 * outer evaluation catch — is unchanged and still asserted.
 */

import * as fs from 'fs'
import * as path from 'path'

import {
  maxConsecutiveGapDays,
  isJournalPhase1Complete,
  buildV3MilestoneCheckData,
  JOURNAL_PHASE_1_DAYS,
  type EvaluationRow,
  type JournalRow,
} from '../milestone-check-data'
import { checkNewMilestones, MILESTONE_DEFINITIONS } from '../milestones'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
  }
}

const srcRoot = path.resolve(__dirname, '../..')
const read = (rel: string) => fs.readFileSync(path.join(srcRoot, rel), 'utf-8')

// Day N at midday UTC — midday avoids any accidental DST/boundary sensitivity.
const day = (n: number) => `2026-01-${String(n).padStart(2, '0')}T12:00:00.000Z`

const evalRow = (created_at: string, over: Partial<EvaluationRow> = {}): EvaluationRow => ({
  katorthoma_proximity: 'deliberate',
  passions_detected: [],
  created_at,
  ...over,
})

// =====================================================================
// A. maxConsecutiveGapDays
// =====================================================================

assert(maxConsecutiveGapDays([]) === null, 'GAP-1: no timestamps → null')
assert(maxConsecutiveGapDays([day(1)]) === null, 'GAP-2: a single timestamp → null (no gap exists)')
assert(maxConsecutiveGapDays([day(1), day(2)]) === 1, 'GAP-3: two adjacent days → 1')

// The load-bearing case: the largest gap wins, not the most recent one. A
// practitioner who returned after 10 days and has since practised daily still
// genuinely earned `returning_practitioner`.
assert(
  maxConsecutiveGapDays([day(1), day(11), day(12), day(13)]) === 10,
  'GAP-4: MAX gap wins, not the most recent gap (the retroactive catch-up case)'
)
assert(
  maxConsecutiveGapDays([day(13), day(12), day(11), day(1)]) === 10,
  'GAP-5: input order is irrelevant — DESC input yields the same max gap'
)

// GAP-4/GAP-5 alone are NOT sufficient: in both, the largest gap happens to be the
// FIRST one chronologically, so an implementation returning the first gap rather
// than the maximum passes them. Mutation testing caught exactly that (a "return the
// first gap" mutant survived the suite). These two put the maximum in the middle and
// at the end, so only a genuine max can pass.
assert(
  maxConsecutiveGapDays([day(1), day(2), day(20), day(21)]) === 18,
  'GAP-4b: the maximum gap in the MIDDLE is found (defeats a first-gap implementation)'
)
assert(
  maxConsecutiveGapDays([day(1), day(2), day(3), day(25)]) === 22,
  'GAP-4c: the maximum gap LAST is found (defeats a first-gap implementation)'
)
assert(
  maxConsecutiveGapDays([day(1), day(9), day(10), day(28)]) === 18,
  'GAP-4d: with two qualifying gaps (8 then 18) the larger wins'
)
assert(
  maxConsecutiveGapDays([day(1), day(2), day(3), day(4)]) === 1,
  'GAP-6: daily practice never reaches the 7-day threshold'
)
assert(
  maxConsecutiveGapDays(['not-a-date', day(1), day(9)]) === 8,
  'GAP-7: unparseable timestamps are dropped, never coerced to NaN'
)

// The null trap. `created_at` is nullable on action_evaluations_v3, and
// new Date(null).getTime() === 0 — FINITE, so a Number.isFinite filter alone
// lets it through and fabricates a ~20,000-day gap from 1970.
assert(
  maxConsecutiveGapDays([null as unknown as string, day(1), day(2)]) === 1,
  'GAP-7b: a null timestamp is dropped, not read as epoch 0 (would fake a 20,000-day gap)'
)
assert(
  maxConsecutiveGapDays([undefined as unknown as string, day(1), day(2)]) === 1,
  'GAP-7c: an undefined timestamp is dropped'
)
assert(
  maxConsecutiveGapDays(['', day(1), day(2)]) === 1,
  'GAP-7d: an empty-string timestamp is dropped'
)
// Non-vacuity: prove the trap is real, so GAP-7b cannot silently become pointless.
assert(
  Number.isFinite(new Date(null as unknown as string).getTime()),
  'GAP-7e: new Date(null) really is finite (the reason GAP-7b needs a type guard, not just isFinite)'
)
assert(
  maxConsecutiveGapDays(['not-a-date', day(1)]) === null,
  'GAP-8: dropping bad timestamps can legitimately fall below two → null'
)

// Explicitly pin that this is NOT days-since-now: a long-absent practitioner whose
// own history is dense must not read as "returned". Days-since-now would award
// `returning_practitioner` to someone who has not returned at all.
assert(
  maxConsecutiveGapDays([day(1), day(2)]) === 1,
  'GAP-9: two entries a day apart read as 1 regardless of how long ago they were'
)

// =====================================================================
// B. isJournalPhase1Complete
// =====================================================================

assert(JOURNAL_PHASE_1_DAYS.length === 7, 'P1-1: phase 1 is exactly seven days')
assert(
  JOURNAL_PHASE_1_DAYS.every((d, i) => d === i + 1),
  'P1-2: phase 1 is days 1..7 inclusive (journal-content.ts PHASES[0])'
)
assert(isJournalPhase1Complete([1, 2, 3, 4, 5, 6, 7]), 'P1-3: days 1-7 present → complete')
assert(
  !isJournalPhase1Complete([1, 2, 3, 5, 8, 9, 10]),
  'P1-4: seven entries that skip day 4 are NOT phase 1 (count is not the predicate)'
)
assert(!isJournalPhase1Complete([1, 2, 3, 4, 5, 6]), 'P1-5: six of seven → not complete')
assert(
  isJournalPhase1Complete([7, 6, 5, 4, 3, 2, 1, 12, 30]),
  'P1-6: order-insensitive, and later days do not interfere'
)
assert(!isJournalPhase1Complete([]), 'P1-7: no entries → not complete')

// =====================================================================
// C. buildV3MilestoneCheckData
// =====================================================================

{
  const built = buildV3MilestoneCheckData({
    earnedMilestoneIds: ['first_step'],
    hasBaseline: true,
    senecanGrade: 'grade_2',
    evaluations: [evalRow(day(1)), evalRow(day(20))], // deliberately ASC
    reflectionCount: 3,
    journalEntries: [
      { day_number: 1, created_at: day(1) },
      { day_number: 2, created_at: day(2) },
    ],
  })

  assert(built.earnedMilestoneIds.length === 1, 'BLD-1: earned ids pass through')
  assert(built.hasBaseline === true && built.senecanGrade === 'grade_2', 'BLD-2: baseline fields pass through')
  assert(built.reflectionCount === 3, 'BLD-3: reflection count passes through')
  assert(built.journalEntriesCompleted === 2, 'BLD-4: journal count is a plain row count')
  assert(built.journalPhase1Complete === false, 'BLD-5: two journal days is not phase 1')
  assert(built.daysSinceLastJournalEntry === 1, 'BLD-6: journal gap computed')
  assert(built.daysSinceLastAction === 19, 'BLD-7: evaluation gap computed from the max gap')

  // The ordering contract: checkNewMilestones' consistent_deliberate and
  // passion_reduction predicates slice(0,5) assuming DESC, but never sort. The
  // builder must guarantee it rather than inherit it from a query's .order().
  assert(
    built.evaluations[0].created_at === day(20) && built.evaluations[1].created_at === day(1),
    'BLD-8: evaluations are sorted created_at DESC even when supplied ASC'
  )
}

{
  const empty = buildV3MilestoneCheckData({
    earnedMilestoneIds: [],
    hasBaseline: false,
    evaluations: [],
    reflectionCount: 0,
    journalEntries: [],
  })
  assert(
    empty.daysSinceLastAction === null && empty.daysSinceLastJournalEntry === null,
    'BLD-9: a brand-new practitioner yields null gaps, never 0 (0 would be a claim)'
  )
  assert(
    empty.journalEntriesCompleted === 0 && empty.journalPhase1Complete === false,
    'BLD-10: empty journal is honestly zero / incomplete'
  )
  assert(checkNewMilestones(empty).length === 0, 'BLD-11: a brand-new practitioner earns nothing')
}

// =====================================================================
// D. End to end through the real checkNewMilestones
// =====================================================================

{
  // The journal milestones were unreachable before Phase 0 because the route
  // never populated these three fields at all.
  const journalEntries: JournalRow[] = Array.from({ length: 7 }, (_, i) => ({
    day_number: i + 1,
    created_at: day(i + 1),
  }))
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations: [],
      reflectionCount: 0,
      journalEntries,
    })
  )
  assert(ids.includes('first_page'), 'E2E-1: first_page now reachable')
  assert(ids.includes('examined_week'), 'E2E-2: examined_week now reachable')
  assert(ids.includes('foundation_layer'), 'E2E-3: foundation_layer now reachable')
  assert(!ids.includes('halfway_mark'), 'E2E-4: halfway_mark still correctly withheld at 7 entries')
}

{
  // journal_return: a 7+ day gap between journal entries.
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations: [],
      reflectionCount: 0,
      journalEntries: [
        { day_number: 1, created_at: day(1) },
        { day_number: 2, created_at: day(20) },
      ],
    })
  )
  assert(ids.includes('journal_return'), 'E2E-5: journal_return now reachable via the gap')
}

{
  // returning_practitioner via a HISTORIC gap the old two-most-recent computation
  // would have missed entirely — the exact retroactive-catch-up case.
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations: [evalRow(day(1)), evalRow(day(15)), evalRow(day(16)), evalRow(day(17))],
      reflectionCount: 0,
      journalEntries: [],
    })
  )
  assert(
    ids.includes('returning_practitioner'),
    'E2E-6: returning_practitioner fires on a historic gap (old code saw only the last pair → 1 day)'
  )
}

{
  // A stage milestone fires on an exact proximity level, single evaluation.
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations: [evalRow(day(3), { katorthoma_proximity: 'habitual' })],
      reflectionCount: 0,
      journalEntries: [],
    })
  )
  assert(ids.includes('stage_the_worn_path'), 'E2E-7: exact-level stage milestone fires')
  assert(!ids.includes('stage_the_crossroads'), 'E2E-8: a different stage does not fire')
  assert(!ids.includes('first_deliberate'), 'E2E-9: habitual does not reach the deliberate threshold')
}

{
  // Already-earned ids are never re-emitted.
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: ['first_page'],
      hasBaseline: false,
      evaluations: [],
      reflectionCount: 0,
      journalEntries: [{ day_number: 1, created_at: day(1) }],
    })
  )
  assert(!ids.includes('first_page'), 'E2E-10: an already-earned milestone is not re-awarded')
}

// The count the UI renders as "N of TOTAL". Pinned because the build plan and the
// decision log both say 24; the real figure is 25 (20 + the five brand-build stages).
assert(
  MILESTONE_DEFINITIONS.length === 25,
  `E2E-11: there are 25 milestone definitions (got ${MILESTONE_DEFINITIONS.length})`
)

// Independent-review fold (MEDIUM, 2026-07-29): consistent_deliberate and
// passion_reduction are the two predicates milestone-check-data.ts's own
// docstring names as depending on the DESC-sort contract BLD-8 guarantees —
// but until now nothing exercised checkNewMilestones' actual CONSUMPTION of
// that order (only that the builder sorts correctly). A `.slice(0,5)` →
// `.slice(-5)` mutant, or an inverted comparison, would have passed every
// prior assertion in this suite. Each pair below mirrors the other (a
// distractor at one end vs. the other) so an order-reversal OR a
// comparison-direction mutant is caught regardless of which way it's wrong.

{
  // consistent_deliberate: the 5 MOST RECENT evaluations are all deliberate+,
  // despite an older reflexive distractor — must fire.
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations: [
        evalRow(day(1), { katorthoma_proximity: 'reflexive' }), // oldest — distractor
        evalRow(day(2), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(3), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(4), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(5), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(6), { katorthoma_proximity: 'deliberate' }), // newest
      ],
      reflectionCount: 0,
      journalEntries: [],
    })
  )
  assert(
    ids.includes('consistent_deliberate'),
    'E2E-12: consistent_deliberate fires on the 5 MOST RECENT evaluations, ignoring an older distractor (defeats a slice(-5) mutant)',
  )
}
{
  // Mirror of E2E-12: the distractor is now the MOST RECENT evaluation, and
  // the 5 deliberate+ evaluations are the OLDEST ones — must NOT fire, since
  // the most recent 5 (which include the reflexive distractor) are not all
  // deliberate+.
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations: [
        evalRow(day(1), { katorthoma_proximity: 'deliberate' }), // oldest
        evalRow(day(2), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(3), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(4), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(5), { katorthoma_proximity: 'deliberate' }),
        evalRow(day(6), { katorthoma_proximity: 'reflexive' }), // newest — distractor
      ],
      reflectionCount: 0,
      journalEntries: [],
    })
  )
  assert(
    !ids.includes('consistent_deliberate'),
    'E2E-13: consistent_deliberate does NOT fire when the most recent evaluation breaks the streak, even with 5 older deliberate+ evaluations (the mirror of E2E-12 — defeats the opposite slice(-5) failure mode)',
  )
}

{
  // passion_reduction: the 5 MOST RECENT evaluations carry fewer passions
  // than the preceding 5 — a genuine reduction, must fire.
  const passion = { name: 'anxiety', root_passion: 'phobos' }
  const evaluations = [
    ...Array.from({ length: 5 }, (_, i) => evalRow(day(i + 1), { passions_detected: [passion, passion] })), // days 1-5 (older): 2 each
    ...Array.from({ length: 5 }, (_, i) => evalRow(day(i + 6), { passions_detected: [] })), // days 6-10 (recent): 0 each
  ]
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations,
      reflectionCount: 0,
      journalEntries: [],
    })
  )
  assert(
    ids.includes('passion_reduction'),
    'E2E-14: passion_reduction fires when the 5 MOST RECENT evaluations average fewer passions than the preceding 5 (defeats a slice(-5) or recent/older-swap mutant)',
  )
}
{
  // Mirror of E2E-14: passions have INCREASED (recent 5 carry more than the
  // preceding 5) — must NOT fire. Defeats both an order-reversal mutant and a
  // comparison-direction-inverted (`>` for `<`) mutant.
  const passion = { name: 'anxiety', root_passion: 'phobos' }
  const evaluations = [
    ...Array.from({ length: 5 }, (_, i) => evalRow(day(i + 1), { passions_detected: [] })), // days 1-5 (older): 0 each
    ...Array.from({ length: 5 }, (_, i) => evalRow(day(i + 6), { passions_detected: [passion, passion] })), // days 6-10 (recent): 2 each
  ]
  const ids = checkNewMilestones(
    buildV3MilestoneCheckData({
      earnedMilestoneIds: [],
      hasBaseline: false,
      evaluations,
      reflectionCount: 0,
      journalEntries: [],
    })
  )
  assert(
    !ids.includes('passion_reduction'),
    'E2E-15: passion_reduction does NOT fire when the most recent evaluations average MORE passions than the preceding 5 (the mirror of E2E-14)',
  )
}

// =====================================================================
// E. Wiring pins — the defect Phase 0 exists to fix was that nothing called POST.
//    Source-grep, because these live in client components a unit test cannot mount.
// =====================================================================

{
  const scoreSrc = read('app/score/page.tsx')
  assert(
    /authFetch\('\/api\/milestones',\s*\{\s*method:\s*'POST'\s*\}\)/.test(scoreSrc),
    'INV-1: the score flow POSTs /api/milestones'
  )
  // Phase 3 (the stage-crossing trigger, 2026-07-27) changed this call's
  // SHAPE: the response is now READ (via .then, to resolve a newly-earned
  // stage) rather than merely fired. The safety property this pin checks is
  // unchanged — no rejection reaches the outer evaluation catch — so it now
  // looks for a terminal .catch(() => {}) within a bounded span after the
  // call, rather than requiring it immediately adjacent. The span is
  // measured directly against the shipped file (406 chars as of the
  // simultaneous-crossing mentor-verdict fold, up from 314 chars at the
  // original Phase 3 build — re-measured, not left stale, each time the
  // surrounding comment grows) with headroom — tight enough to still fail if
  // the .catch is dropped or moved far away (INV-2b below proves this),
  // loose enough to survive a small comment edit.
  assert(
    /authFetch\('\/api\/milestones',\s*\{\s*method:\s*'POST'\s*\}\)[\s\S]{0,550}?\.catch\(\(\)\s*=>\s*\{\}\)/.test(scoreSrc),
    'INV-2: the score-flow POST chain terminates in its own .catch(() => {}) — never the outer evaluation catch — even though Phase 3 now reads the response via .then() first'
  )
  // INV-2b — non-vacuity companion, matching the file's own INV-9-for-INV-6
  // pattern: INV-2's regex must actually fail when the guard it checks is
  // genuinely absent, or a typo'd pattern would render it permanently,
  // silently green.
  assert(
    !/authFetch\('\/api\/milestones',\s*\{\s*method:\s*'POST'\s*\}\)[\s\S]{0,550}?\.catch\(\(\)\s*=>\s*\{\}\)/.test(
      "authFetch('/api/milestones', { method: 'POST' }).then(async (res) => { if (!res.ok) return })"
    ),
    'INV-2b: the INV-2 regex genuinely fails on a call with no terminal .catch (non-vacuity)'
  )
  // Updated 2026-08-23 (Class B route-change session): the evaluation save
  // moved from a direct `from('action_evaluations_v3').insert` in this file
  // to a server route, `POST /api/score/save` — the safety property this pin
  // checks (milestones are only checked AFTER the evaluation is actually
  // saved) is unchanged, so the marker now tracks the new save call instead.
  const insertIdx = scoreSrc.indexOf("authFetch('/api/score/save'")
  const postIdx = scoreSrc.indexOf("authFetch('/api/milestones'")
  assert(
    insertIdx > 0 && postIdx > insertIdx,
    'INV-3: the POST is placed after the action_evaluations_v3 save, not before'
  )

  const dashSrc = read('app/dashboard/page.tsx')
  assert(
    /authFetch\('\/api\/milestones',\s*\{\s*method:\s*'POST'\s*\}\)/.test(dashSrc),
    'INV-4: the dashboard load POSTs /api/milestones (retroactive catch-up)'
  )

  const displaySrc = read('components/MilestonesDisplay.tsx')
  assert(
    displaySrc.includes("from '@/lib/auth-fetch'"),
    'INV-5: MilestonesDisplay imports authFetch'
  )
  // The original defect: a bare fetch cannot authenticate, because
  // getAuthenticatedUser accepts `Authorization: Bearer` and nothing else.
  assert(
    !/[^h]fetch\(`?\/api\/milestones/.test(displaySrc),
    'INV-6: MilestonesDisplay makes no BARE fetch to /api/milestones (a bare fetch 401s)'
  )
  assert(
    !displaySrc.includes('user_id=${userId}'),
    'INV-7: the dead user_id query param is gone (the route derives the id from the JWT)'
  )
  assert(
    displaySrc.indexOf("method: 'POST'") < displaySrc.indexOf("authFetch('/api/milestones')") &&
      displaySrc.indexOf("method: 'POST'") > 0,
    'INV-8: MilestonesDisplay awards (POST) before reading (GET), so a new award is visible immediately'
  )

  // Non-vacuity: INV-6's regex must actually catch the pre-Phase-0 form, or a typo
  // would render it permanently, silently green.
  assert(
    /[^h]fetch\(`?\/api\/milestones/.test('const res = await fetch(`/api/milestones?user_id=${userId}`)'),
    'INV-9: the bare-fetch regex genuinely matches the pre-Phase-0 line (non-vacuity)'
  )

  const routeSrc = read('app/api/milestones/route.ts')
  assert(
    routeSrc.includes("from('journal_entries')"),
    'INV-10: the route now queries journal_entries'
  )
  assert(
    routeSrc.includes('buildV3MilestoneCheckData'),
    'INV-11: the route assembles check-data through the tested pure builder'
  )
  // Assert against the SELECT clauses, not the whole file — the route's comments
  // legitimately name the column while explaining why it is not read.
  const selectClauses = [...routeSrc.matchAll(/\.select\(\s*'([^']*)'/g)].map((m) => m[1])
  assert(selectClauses.length >= 5, `INV-12a: found the route's select clauses (got ${selectClauses.length})`)
  assert(
    selectClauses.every((c) => !c.includes('reflection_text')),
    'INV-12: no select clause reads reflection_text (intimate, R20a-screened prose)'
  )
  assert(
    selectClauses.some((c) => c.includes('day_number') && c.includes('created_at')),
    'INV-12b: the journal select reads day_number + created_at (the phase-1 and gap inputs)'
  )
  assert(
    routeSrc.includes('check_data_incomplete'),
    'INV-13: a failed source query is reported honestly, not silently under-awarded'
  )
}

// =====================================================================

console.log(`${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ✗ ${f}`)
  process.exit(1)
}
