/**
 * practice-sequence.ts — the canonical order in which the human practice tools
 * are introduced, the stage↔practice mapping, and every user-visible string
 * either surface renders.
 *
 * Practice reminders, human plan Phase 1 (the SEQUENCE trigger) —
 * `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §6.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE HAS ZERO IMPORTS — INCLUDING ZERO `import type`.
 *
 * `/welcome` is a guarded TARGET_FILES entry of
 * `src/app/logos/__tests__/human-practitioner-boundary.test.ts`, and that test
 * follows exactly ONE hop of a target's local imports. This module is imported
 * directly by `/welcome`, so anything IT imports is at hop two — outside the
 * guard's reach. Taking `KatorthomaProximityLevel` from `./brand-display` (which
 * is what plan §6 suggests, and which `brand-display` gets from `./stoic-brain`
 * as a type-only import) would therefore create a `/welcome → practice-sequence →
 * brand-display → stoic-brain` chain that the guard cannot see.
 *
 * VERIFIED BY MUTATION, and worth stating precisely because the Phase 1 session
 * prompt overstated it: such a chain does NOT actually fail the logos guard.
 * Adding that import here and running that suite yields 249 passed, 0 failed.
 *
 * The mechanism, stated correctly — an earlier draft of this comment got the
 * REASON wrong while the conclusion held, and the adversarial review caught it:
 * `stoic-brain` is deliberately absent from that suite's
 * FORBIDDEN_SPECIFIER_SUBSTRINGS, being allowlisted read-only. Its symbol
 * allowlist DOES also run on one-hop helpers (LOGOS-BT-6), so the earlier claim
 * that it "runs only against a target's own imports" was false. It simply never
 * fires here, because the specifier at hop one is `brand-display`, not
 * `stoic-brain` — the `brand-display → stoic-brain` edge is at hop TWO, past the
 * traversal's reach.
 *
 * So the guard passes it either way. That is exactly the reason not to lean on
 * the guard: the constraint that binds is plan §11 — "no reminder code imports
 * substrate/trust-core/stoic-brain" — which holds whether or not a test happens
 * to catch a violation.
 *
 * So the proximity-level union is declared LOCALLY below, on the `/sage-compass`
 * precedent (which declares its own virtue vocabulary rather than importing the
 * engine's) and the `logos-teaching.ts` precedent (a zero-import content module).
 * `PROXIMITY_LEVEL_ORDER` is pinned against the engine's canonical order by the
 * accompanying test, so a local copy cannot silently drift.
 *
 * WHAT THIS FILE IS NOT. No I/O, no clock, no env, no React, no DB client. It is
 * data plus three pure functions. `PRACTICE_SOURCE_TABLES` holds table NAMES as
 * plain strings — a string is not an import, and keeping the names beside the
 * steps is what lets the test pin that every tracked step has a source and every
 * source belongs to a step.
 *
 * COPY DISCIPLINE (plan §11). Every user-visible string in this system is
 * pre-authored here, doorbell-voiced, and exported so the test can pin it as a
 * VALUE. Source-substring pins are not sufficient — a comment or an identifier
 * satisfies them (the standing `content pins assert exported values` lesson).
 *
 * THE LANGUAGE RULE (plan §1 constraint 1, mentor verbatim): "reminders that
 * prompt the practitioner to begin are appropriate scaffolding. Reminders that
 * tell the practitioner what to think, how to feel, or what conclusion to reach
 * are doing the work instead of them." — "The alarm is a doorbell, not a door."
 * Every `doorbell` below names what the practice is and invites a beginning, and
 * then stops. None of them names a conclusion.
 */

// ─── Local vocabularies (see the header: deliberately not imported) ───

/**
 * The five katorthoma-proximity levels, in ladder order. A LOCAL declaration of
 * the engine's vocabulary — never imported. The accompanying test pins this
 * against the canonical order so the copy cannot drift unnoticed.
 */
export type ProximityLevel =
  | 'reflexive'
  | 'habitual'
  | 'deliberate'
  | 'principled'
  | 'sage_like'

export const PROXIMITY_LEVEL_ORDER: readonly ProximityLevel[] = [
  'reflexive',
  'habitual',
  'deliberate',
  'principled',
  'sage_like',
]

export type PracticeId =
  | 'logos'
  | 'morning'
  | 'passion-log'
  | 'view-from-above'
  | 'oikeiosis'
  | 'premeditatio'
  | 'hupexairesis'
  | 'sage-compass'

// ─── The sequence ───

export interface PracticeStep {
  id: PracticeId
  /**
   * Position in the mentor's introduction order. Two steps SHARE an ordinal when
   * the mentor pairs them — "view from above + oikeiosis" is one step of the
   * sequence, met together, not two consecutive ones.
   */
  step: number
  /** The page's live H1, verbatim, so the link and the destination agree. */
  name: string
  href: string
  /** One line inviting a beginning. A doorbell, not a door. */
  doorbell: string
  /**
   * False for the prerequisite orientation only. `/logos` is a reading, not a
   * recording — there is no row anywhere that proves someone read it, so it is
   * never marked done. Claiming otherwise would be a fabricated status.
   */
  tracked: boolean
}

/**
 * The canonical order (plan §1 constraint 4, mentor verbatim):
 * dichotomy of control first — "not a named tool on your list but it is the
 * prerequisite for all of them" — then morning preparation → passion log →
 * view from above + oikeiosis → premeditatio → hupexairesis → sage compass.
 *
 * "A beginner handed all eight tools simultaneously will either pick one
 * arbitrarily or be paralysed by the choice. The sequence removes that friction
 * without removing the work."
 *
 * Step 0 is `/logos`, which already derives the dichotomy of control
 * (`logos-teaching.ts`) and is already fronted by `/welcome`'s "Start with why".
 */
export const PRACTICE_SEQUENCE: readonly PracticeStep[] = [
  {
    id: 'logos',
    step: 0,
    name: 'Logos',
    href: '/logos',
    doorbell: 'Begin here — this is the ground the other practices stand on.',
    tracked: false,
  },
  {
    id: 'morning',
    step: 1,
    name: 'Morning Preparation',
    href: '/morning',
    doorbell: 'Begin the day by naming what it will ask of you.',
    tracked: true,
  },
  {
    id: 'passion-log',
    step: 2,
    name: 'Passion Log',
    href: '/passion-log',
    doorbell: 'Log what you noticed, while you still remember noticing it.',
    tracked: true,
  },
  {
    id: 'view-from-above',
    step: 3,
    name: 'The View From Above',
    href: '/view-from-above',
    doorbell: 'Set a concern you are carrying against a wider frame.',
    tracked: true,
  },
  {
    id: 'oikeiosis',
    step: 3,
    name: 'Expanding Your Circle of Concern',
    href: '/oikeiosis',
    doorbell: 'Take a decision out to a wider circle than you began from.',
    tracked: true,
  },
  {
    id: 'premeditatio',
    step: 4,
    name: 'Preparing for Adversity',
    href: '/premeditatio',
    doorbell: 'Prepare for a difficulty before it arrives.',
    tracked: true,
  },
  {
    id: 'hupexairesis',
    step: 5,
    name: 'The Reserve Clause',
    href: '/hupexairesis',
    doorbell: 'Hold an intention with the reserve clause attached.',
    tracked: true,
  },
  {
    id: 'sage-compass',
    step: 6,
    name: 'The Sage Compass',
    href: '/sage-compass',
    doorbell: 'Take a bearing before a decision you find difficult.',
    tracked: true,
  },
]

/** The steps a practitioner's own rows can actually evidence. */
export const TRACKED_PRACTICE_SEQUENCE: readonly PracticeStep[] =
  PRACTICE_SEQUENCE.filter((s) => s.tracked)

/**
 * Where each tracked practice's rows live. Table NAMES only — plain strings, not
 * imports. A practice counts as met if ANY of its tables holds a row for the
 * practitioner: `/oikeiosis` carries two distinct surfaces (the quarterly
 * reflection diagnostic and the circle-extension practice) and either is a
 * genuine use of that page.
 *
 * Every table below is `(user_id, created_at)`-shaped, verified against its
 * migration. `journal_entries` is deliberately NOT here — the journal is not a
 * sequence step; it is named separately on `/welcome` as part of the daily
 * rhythm.
 */
export const PRACTICE_SOURCE_TABLES: Readonly<Record<string, readonly string[]>> = {
  morning: ['morning_preparation_entries'],
  'passion-log': ['passion_events'],
  'view-from-above': ['view_from_above_entries'],
  oikeiosis: ['oikeiosis_reflections', 'circle_extension_entries'],
  premeditatio: ['premeditatio_entries'],
  hupexairesis: ['reserve_clause_entries'],
  'sage-compass': ['sage_compass_entries'],
}

/**
 * The daily-rhythm surfaces. NOT sequence steps — the journal, the reflection
 * and the action evaluation recur alongside the sequence rather than sitting
 * inside it, which is how `/welcome` names them.
 *
 * Declared HERE rather than in the route so the schema-existence pin can reach
 * them. They were previously route-local, and so sat outside every pin — while
 * the pin's own label invoked the `action_evaluations_v3` drift lesson and then
 * failed to cover `action_evaluations_v3`. Found by the adversarial review.
 *
 * `reflections` was added for Phase 4 (the daily rhythm). The evening pole is
 * "journal OR reflection" per plan §9, and before this the route read only
 * `journal_entries` — so a practitioner who had reflected but not journalled
 * would have been told, wrongly, that they had not done the evening review.
 *
 * ONE HONEST ASYMMETRY, verified 2026-07-27 and recorded rather than smoothed
 * over: no page available to an ORDINARY practitioner writes `reflections`.
 * `/api/reflections` is GET-only and `/reflections` is a read-only history view;
 * rows arrive via `/api/reflect` (the API skill surface) and
 * `/api/mentor/private/reflect`. The latter IS reachable from a browser, at
 * `/private-mentor` — but it is FOUNDER_USER_ID-gated, so for everyone else the
 * claim holds without qualification. (The unqualified phrasing was corrected
 * after the adversarial review pointed out the founder-only exception.)
 *
 * The table is therefore right to COUNT toward the evening pole — a row in it
 * genuinely is an evening review — but the pole must LINK to `/journal`, the
 * only surface an ordinary practitioner at a browser can record one on.
 */
export const RHYTHM_TABLES: Readonly<Record<string, string>> = {
  journal: 'journal_entries',
  reflections: 'reflections',
  evaluations: 'action_evaluations_v3',
}

// ─── The stage ↔ practice mapping ───

export interface StagePractices {
  level: ProximityLevel
  stageName: string
  stageSlug: string
  practices: readonly PracticeId[]
  /** Non-null only where the mentor gave a line instead of a set of tools. */
  note: string | null
}

/**
 * Plan §1, mentor verbatim: The Storm → morning preparation + passion log ·
 * The Crossroads → view from above + oikeiosis · The Worn Path → premeditatio +
 * hupexairesis · The Clear Summit → sage compass · The Inner Fire → "no longer
 * needs the scaffolding in the same way."
 *
 * Level↔stage names and slugs match `milestones.ts`'s STAGE_MILESTONE_BY_LEVEL
 * and `brand-display.ts`'s STAGE_DISPLAY exactly — verified against the source,
 * and confirmed live on 2026-07-26 when a `deliberate` evaluation awarded
 * `stage_the_crossroads` and no other stage milestone.
 *
 * THE NON-LINEARITY IS DELIBERATE AND IS NOT A BUG (plan §1, "a nuance recorded,
 * not smoothed over"): premeditatio + hupexairesis sit 4th/5th in the
 * introduction sequence but belong to The Worn Path, 2nd on the proximity
 * ladder. The stages are CONDITIONS, not a corridor. The sequence is only the
 * no-signal default; the stage mapping serves whichever stage the practitioner's
 * signals actually indicate.
 *
 * THIS READING IS NOW A SETTLED, BINDING MENTOR VERDICT (Step M, 2026-07-27;
 * verbatim record `operations/reminders-2026-07/2026-07-27-step-M-mentor-
 * verdicts-verbatim.md`): "the two orderings were answering different questions
 * and were never intended to agree" — the mapping stands exactly as given, and
 * the apparent difficulty inversion "dissolves when you read the stages as
 * conditions rather than rungs."
 */
export const STAGE_PRACTICES: readonly StagePractices[] = [
  {
    level: 'reflexive',
    stageName: 'The Storm',
    stageSlug: 'the-storm',
    practices: ['morning', 'passion-log'],
    note: null,
  },
  {
    level: 'habitual',
    stageName: 'The Worn Path',
    stageSlug: 'the-worn-path',
    practices: ['premeditatio', 'hupexairesis'],
    note: null,
  },
  {
    level: 'deliberate',
    stageName: 'The Crossroads',
    stageSlug: 'the-crossroads',
    practices: ['view-from-above', 'oikeiosis'],
    note: null,
  },
  {
    level: 'principled',
    stageName: 'The Clear Summit',
    stageSlug: 'the-clear-summit',
    practices: ['sage-compass'],
    note: null,
  },
  {
    level: 'sage_like',
    stageName: 'The Inner Fire',
    stageSlug: 'the-inner-fire',
    practices: [],
    note: 'This stage no longer needs the scaffolding in the same way.',
  },
]

// ─── Pure helpers ───

export function practiceById(id: string): PracticeStep | null {
  return PRACTICE_SEQUENCE.find((s) => s.id === id) ?? null
}

export function stagePracticesFor(level: string): StagePractices | null {
  return STAGE_PRACTICES.find((s) => s.level === level) ?? null
}

/**
 * The first TRACKED step the practitioner has no rows for, or null once every
 * tracked practice has been met at least once.
 *
 * Untracked steps are skipped deliberately: `/logos` can never be marked met, so
 * including it would pin "next" to the prerequisite forever and the affordance
 * would never advance.
 *
 * Order-stable and set-based — takes an iterable of met ids, tolerates unknown
 * ids, and never mutates its argument.
 */
export function nextInSequence(metPracticeIds: Iterable<string>): PracticeStep | null {
  const met = new Set(metPracticeIds)
  return TRACKED_PRACTICE_SEQUENCE.find((s) => !met.has(s.id)) ?? null
}

// ─── The status fold (pure — the route supplies the rows, this decides meaning) ───

/** One table's read, as the route obtained it. */
export interface TableRead {
  status: 'ok' | 'unavailable'
  last_used_at: string | null
  count: number | null
}

export interface PracticeStatus {
  id: PracticeId
  step: number
  tracked: boolean
  status: 'ok' | 'unavailable'
  /** null when untracked, and null when the read failed — never a guessed false. */
  met: boolean | null
  last_used_at: string | null
  count: number | null
}

export type NextBasis = 'first_unmet' | 'all_met' | 'indeterminate'

export interface PracticeStatusFold {
  practices: PracticeStatus[]
  next_in_sequence: PracticeId | null
  next_basis: NextBasis
}

/** The later of two ISO timestamps, tolerating nulls and unparseable values. */
function laterOf(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  const ta = Date.parse(a)
  const tb = Date.parse(b)
  if (!Number.isFinite(ta)) return b
  if (!Number.isFinite(tb)) return a
  return ta >= tb ? a : b
}

/**
 * Turn per-table reads into per-practice meaning. Pure, so every honesty
 * decision below is directly testable rather than reachable only through a live
 * database — the Phase 0 `milestone-check-data.ts` precedent.
 *
 * TWO RULES CARRY THE HONESTY, and both fail toward silence rather than a claim:
 *
 *  1. UNAVAILABLE IS CONTAGIOUS WITHIN A PRACTICE. If any one of a practice's
 *     tables failed to read, that practice is `unavailable` and `met` is null —
 *     never false. The answer might have been in the table that failed, and
 *     telling a practitioner they have not done something they may well have
 *     done is a fabricated status, not a blank one. (`/oikeiosis` reads two
 *     tables, so this is reachable in practice, not theoretical.)
 *
 *  2. `next_in_sequence` ANSWERS ONLY WHEN THE ANSWER IS KNOWABLE. Walking the
 *     tracked steps in order, an `unavailable` step reached before any
 *     definitively-unmet one makes the result `indeterminate` — because the true
 *     next step might be that unavailable one. Skipping past it to the next
 *     known-unmet step would point the practitioner one practice too far along.
 */
export function foldPracticeStatuses(
  readByTable: Readonly<Record<string, TableRead>>
): PracticeStatusFold {
  const practices: PracticeStatus[] = PRACTICE_SEQUENCE.map((step) => {
    if (!step.tracked) {
      return { id: step.id, step: step.step, tracked: false, status: 'ok', met: null, last_used_at: null, count: null }
    }

    const sources = PRACTICE_SOURCE_TABLES[step.id] ?? []
    const rows = sources.map((t) => readByTable[t]).filter((r): r is TableRead => !!r)
    const unavailable =
      sources.length === 0 || rows.length !== sources.length || rows.some((r) => r.status === 'unavailable')

    if (unavailable) {
      return { id: step.id, step: step.step, tracked: true, status: 'unavailable', met: null, last_used_at: null, count: null }
    }

    const lastUsed = rows.reduce<string | null>((acc, r) => laterOf(acc, r.last_used_at), null)
    return {
      id: step.id,
      step: step.step,
      tracked: true,
      status: 'ok',
      met: lastUsed !== null,
      last_used_at: lastUsed,
      count: rows.reduce((acc, r) => acc + (r.count ?? 0), 0),
    }
  })

  const byId = new Map(practices.map((p) => [p.id, p]))

  let next: PracticeId | null = null
  let basis: NextBasis = 'all_met'
  for (const step of TRACKED_PRACTICE_SEQUENCE) {
    const p = byId.get(step.id)
    if (!p || p.status === 'unavailable') { basis = 'indeterminate'; break }
    if (!p.met) { next = step.id; basis = 'first_unmet'; break }
  }

  return { practices, next_in_sequence: next, next_basis: basis }
}

// ─── The daily rhythm (Phase 4) — pure, with the clock INJECTED ───

/**
 * What evidences each pole.
 *
 * The morning pole is the `morning` practice, read from the sequence fold the
 * route already returns. The evening pole is "journal OR reflection" (plan §9)
 * — either is a genuine evening review, so a row in either satisfies it.
 *
 * `evaluations` (`action_evaluations_v3`) is deliberately NOT an evening key.
 * Scoring an action happens when an action arises, not as an evening
 * examination; plan §9 names the evening pole as the journal or the reflection
 * and nothing else. It IS counted for the absence check below, because someone
 * who scored an action yesterday is plainly not absent.
 *
 * These are RHYTHM KEYS, not table names — they index the `rhythm` block of the
 * route's response, which is the shape the client actually holds.
 */
export const MORNING_PRACTICE_ID: PracticeId = 'morning'
export const EVENING_RHYTHM_KEYS: readonly string[] = ['journal', 'reflections']

/**
 * Days of total silence across EVERY practice surface before the returning line
 * is offered. Two weeks: long enough that it is not commenting on a busy week,
 * short enough to still be a turning-toward rather than an epitaph.
 */
export const RETURNING_ABSENCE_DAYS = 14

export type RhythmPoleId = 'morning' | 'evening'

/**
 * Three states, and `unknown` is load-bearing. A pole whose read failed shows NO
 * state at all — never "not yet". Telling a practitioner they have not done the
 * evening review when the table simply would not answer is a fabricated status,
 * and it is the one failure that would make this strip feel like a supervisor.
 * Same rule as the sequence module's `met: null`; both fail toward silence.
 */
export type RhythmState = 'done_today' | 'not_yet_today' | 'unknown'

export interface RhythmPole {
  id: RhythmPoleId
  state: RhythmState
  last_used_at: string | null
}

export interface DailyRhythmFold {
  poles: RhythmPole[]
  /** True only when every surface has been silent for RETURNING_ABSENCE_DAYS+. */
  returning: boolean
  /**
   * Exposed so the threshold is directly testable. **Deliberately not rendered
   * anywhere** — a day count is exactly the lapsed-streak framing plan §11
   * forbids, and the mentor was explicit that a reminder cannot repair the
   * false-judgement lapse it would be scolding about.
   */
  days_absent: number | null
}

/**
 * The UTC-ms of a moment's LOCAL calendar date at midnight.
 *
 * Why not compare UTC dates: "today" has to mean the practitioner's today. A UTC
 * comparison rolls the day at a moment that is not local midnight, and it fails
 * in BOTH hemispheres, in opposite directions:
 *
 *   WEST of Greenwich, an entry written at 9pm local is already tomorrow in UTC,
 *   so the evening pole would flip to "not yet" at the very moment they finished
 *   the evening review.
 *
 *   EAST of Greenwich, the UTC date does not roll until mid-morning local, so a
 *   pole would stay "done" into the next local day and the doorbell would go
 *   silent on a morning the practice had not yet been done.
 *
 * (An earlier version of this comment named only the east, and named it for the
 * west's failure. The adversarial review caught it; the code was right either
 * way, since a local comparison is correct in both.)
 *
 * `getFullYear/getMonth/getDate` read local components; the `Date.UTC` wrapper
 * turns them into a value that subtracts to exact whole days regardless of any
 * DST shift in between — and never constructs a local midnight, which is what
 * breaks in zones whose DST transition lands at midnight.
 */
function localMidnightUtcMs(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

function localDayDiff(from: Date, to: Date): number {
  return Math.round((localMidnightUtcMs(to) - localMidnightUtcMs(from)) / 86_400_000)
}

/** One source's contribution: did it answer, and when was it last used. */
interface RhythmSource {
  status: 'ok' | 'unavailable'
  last_used_at: string | null
}

/**
 * Reduce a set of sources to a single reading. `complete` is false if ANY source
 * is missing or unavailable — a source we asked for and did not get back is a
 * failure, not an empty result, and the answer might have been in exactly the
 * one that failed.
 */
function reduceSources(sources: readonly (RhythmSource | undefined)[]): {
  complete: boolean
  latest: string | null
} {
  const present = sources.filter((s): s is RhythmSource => !!s)
  const complete =
    sources.length > 0 && present.length === sources.length && present.every((s) => s.status === 'ok')
  const latest = present.reduce<string | null>((acc, s) => laterOf(acc, s.last_used_at), null)
  return { complete, latest }
}

/** The state of one pole, given its reduced sources and the current moment. */
function poleState(
  id: RhythmPoleId,
  reduced: { complete: boolean; latest: string | null },
  now: Date
): RhythmPole {
  if (!reduced.complete) return { id, state: 'unknown', last_used_at: null }

  // Never having done it at all is an honest "not yet today" — it is, after all,
  // not done today. Only an unreadable value is unknown.
  if (reduced.latest === null) return { id, state: 'not_yet_today', last_used_at: null }

  const t = Date.parse(reduced.latest)
  if (!Number.isFinite(t)) return { id, state: 'unknown', last_used_at: null }

  const sameDay = localMidnightUtcMs(new Date(t)) === localMidnightUtcMs(now)
  return { id, state: sameDay ? 'done_today' : 'not_yet_today', last_used_at: reduced.latest }
}

/**
 * The input this fold consumes is exactly the route's own response — the folded
 * per-practice statuses and the `rhythm` block — rather than the raw per-table
 * reads.
 *
 * That is deliberate. The response IS what the client holds, so folding from it
 * needs no new field on the route and leaves one fold rather than two parallel
 * ones drifting apart. For the absence check the folded practice statuses are
 * equivalent to the raw tables anyway: a practice is `unavailable` if any of its
 * tables failed (the contagious rule), so "every practice answered" and "every
 * table answered" are the same claim.
 */
export interface DailyRhythmInput {
  /**
   * Typed to the three fields this fold actually reads, rather than to the full
   * `PracticeStatus`. The route's own fold satisfies it structurally, and so
   * does the client's narrower view of the same payload — so neither caller
   * needs a cast, and the signature does not overstate what is consumed.
   */
  practices: readonly { id: string; status: 'ok' | 'unavailable'; last_used_at: string | null }[]
  rhythm: Readonly<Record<string, RhythmSource>>
}

/**
 * Turn the route's response into the two poles of the daily rhythm, plus the
 * returning-after-absence signal.
 *
 * PURE, and the clock is a PARAMETER. This module must stay clock-free — its
 * boundary suite bans `Date.now(` outright — and injecting `now` is also what
 * makes "today" and the 14-day threshold testable without stubbing globals or
 * waiting for midnight.
 *
 * THREE HONESTY RULES, all failing toward silence:
 *
 *  1. A pole with any unavailable or missing source is `unknown`, never
 *     `not_yet_today`.
 *  2. A pole whose latest timestamp will not parse is `unknown` too — a value
 *     we cannot read is not evidence that nothing happened.
 *  3. The returning line requires COMPLETE knowledge of every surface AND at
 *     least one past entry somewhere. A practitioner who has never done
 *     anything is new, not returning, and telling them "it has been a while"
 *     on their first visit would be both false and discouraging.
 */
export function foldDailyRhythm(input: DailyRhythmInput, now: Date): DailyRhythmFold {
  const practiceById = new Map(input.practices.map((p) => [p.id, p]))

  const morning = practiceById.get(MORNING_PRACTICE_ID)
  const poles: RhythmPole[] = [
    poleState('morning', reduceSources([morning]), now),
    poleState('evening', reduceSources(EVENING_RHYTHM_KEYS.map((k) => input.rhythm[k])), now),
  ]

  // Every surface the practitioner could have touched: every TRACKED practice
  // plus every rhythm key. Untracked steps are excluded because `/logos` is a
  // reading with no row anywhere — it can never evidence activity, and counting
  // it as a missing source would make the absence check permanently incomplete
  // and the returning line unreachable.
  const activitySources: (RhythmSource | undefined)[] = [
    ...TRACKED_PRACTICE_SEQUENCE.map((s) => practiceById.get(s.id)),
    ...Object.keys(RHYTHM_TABLES).map((k) => input.rhythm[k]),
  ]
  const activity = reduceSources(activitySources)

  let returning = false
  let daysAbsent: number | null = null

  if (activity.complete && activity.latest !== null) {
    const t = Date.parse(activity.latest)
    if (Number.isFinite(t)) {
      daysAbsent = localDayDiff(new Date(t), now)
      returning = daysAbsent >= RETURNING_ABSENCE_DAYS
    }
  }

  return { poles, returning, days_absent: daysAbsent }
}

// ─── Pre-authored copy (pinned as exported values, never as source substrings) ───

/**
 * The dashboard "Your practice" module. States, never commands; no percentages,
 * no completion framing, no streaks (plan §11). `allMet` is a return-to line,
 * not a congratulation — the mirror principle: "the reminder reflects the time
 * back to the practitioner. It does not reflect the quality of what they do with
 * it."
 */
export const PRACTICE_MODULE_COPY = {
  heading: 'Your practice',
  intro:
    'The practices in the order they are usually met. The order is a default, not a rule — nothing here is locked.',
  nextLabel: 'Where to go next',
  metLabel: 'Met',
  notYetLabel: 'Not yet',
  untrackedNote: 'A reading, not a record — open it whenever you like.',
  allMet:
    'You have met every practice here at least once. Return to whichever one the day asks for.',
  loadFailed:
    'Your practice status could not be loaded just now. The practices themselves are all still open below.',
} as const

/**
 * The dashboard's daily rhythm strip (Phase 4) — the school model's DAILY
 * cadence, which the mentor grounded in Seneca's evening examination in
 * `De Ira`: "before sleep, review the day's actions, ask where you fell short,
 * where you did well, what you would do differently. This was a daily rhythm,
 * not an occasional one."
 *
 * STATES, NOT COMMANDS. A pole that is done shows only that it is done; the
 * doorbell line appears for the not-yet state ALONE. `morningDoorbell` is the
 * mentor's own sanctioned example, verbatim: "*it is time for morning
 * preparation* is not doing the practice — it is removing the friction of
 * remembering to begin. The alarm is a doorbell, not a door."
 *
 * `eveningDoorbell` invites the looking-back and stops there. It deliberately
 * does not say what to look for — naming where you fell short would be the
 * alarm reaching the conclusion the examination is meant to reach.
 *
 * `eveningVia` exists because of a real asymmetry: the evening pole is
 * satisfied by the journal OR a reflection, but only the journal has a page a
 * practitioner can write on (see RHYTHM_TABLES). Saying so is more honest than
 * a link that silently under-describes what counts.
 */
export const DAILY_RHYTHM_COPY = {
  heading: 'Today',
  intro: 'The two poles of the daily rhythm. Where a thing is done, it simply says so.',
  morningLabel: 'Morning preparation',
  morningDoorbell: 'It is time for morning preparation.',
  morningHref: '/morning',
  eveningLabel: 'Evening review',
  eveningDoorbell: 'Before sleep, look back over the day.',
  eveningHref: '/journal',
  eveningVia: 'The journal or a reflection — either one is the evening review.',
  doneLabel: 'Done today',
  openLabel: 'Open',
  /**
   * Shown when a pole could not be read. Added after the adversarial review
   * found two things: the intro's "where a thing is done, it simply says so"
   * silently turns the unknown state's deliberate silence into a NEGATIVE claim
   * (nothing said ⇒ not done), and the sibling module's outage banner provably
   * cannot cover this case — its `allUnavailable` derives only from the tracked
   * PRACTICE tables, none of which are the rhythm tables, so a rhythm-only read
   * failure leaves it silent.
   *
   * It names the outage and stops. It does not guess at what the practitioner
   * did, which is the whole reason the state is blank in the first place.
   */
  unavailableNote: 'One of these could not be read just now, so it is left blank rather than guessed at.',
  /**
   * Shown once when every surface has been silent for RETURNING_ABSENCE_DAYS+.
   * It invites and stops. No guilt, no count of days missed, no broken streak —
   * the mentor was explicit that an absence may be the false-judgement lapse,
   * which "is not a discovery an alarm can deliver", and a line that scolds
   * would be the alarm presuming to diagnose which lapse this was.
   *
   * MENTOR-CONFIRMED AS DRAFTED (Step M, 2026-07-27; verbatim record
   * `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md`):
   * "It is the right line" — "the phrase *when you turn toward it* does the
   * work"; the 14-day threshold is defensible ("do not over-engineer the
   * number"); "whatever is nearest" is kept because "the practitioner knows
   * themselves better than the system does at the moment of return". One
   * optional refinement was offered, explicitly either/or: "begin with whatever
   * feels most honest right now" — the founder may elect it any time (change
   * this constant + its verbatim pin together).
   */
  returning:
    'It has been a while. The practice is here when you turn toward it — begin with whatever is nearest.',
} as const

/**
 * `/welcome`'s ordered path (founder election E2). The freedom note is SOFTENED,
 * not deleted — the mentor's sequence "removes that friction without removing
 * the work", and the practitioner is never locked out of anything.
 */
export const WELCOME_SEQUENCE_COPY = {
  heading: 'Where to start',
  intro:
    'If you are not sure where to begin, this is the order these practices are usually met in. It is a default, not a rule — nothing is locked, and you can go straight to whatever you need today.',
  prerequisiteNote:
    'Everything below assumes one idea: that some things are up to you and some are not. That is what the logos page above sets out, and it is why the practices cohere rather than sitting side by side as techniques.',
  dailyRhythmHeading: 'The daily rhythm',
  dailyRhythm:
    'Alongside the sequence, two things recur: score an action as one arises, and keep the journal in the evening. The morning declares the intention; the evening looks at whether it held.',
  toolsHeading: 'The practices, in sequence',
} as const
