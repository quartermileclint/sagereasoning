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
 * The daily-rhythm surfaces. NOT sequence steps — the journal and the action
 * evaluation recur alongside the sequence rather than sitting inside it, which
 * is how `/welcome` names them.
 *
 * Declared HERE rather than in the route so the schema-existence pin can reach
 * them. They were previously route-local, and so sat outside every pin — while
 * the pin's own label invoked the `action_evaluations_v3` drift lesson and then
 * failed to cover `action_evaluations_v3`. Found by the adversarial review.
 */
export const RHYTHM_TABLES: Readonly<Record<string, string>> = {
  journal: 'journal_entries',
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
 * signals actually indicate. This reading is a Step M confirmation item (§10) —
 * it is the plan's stated interpretation, not a settled mentor verdict.
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
