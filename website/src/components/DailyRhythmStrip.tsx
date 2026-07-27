import CadenceBanner from './CadenceBanner'
import { DAILY_RHYTHM_COPY, type DailyRhythmFold, type RhythmPole } from '@/lib/practice-sequence'

/**
 * DailyRhythmStrip — the dashboard's morning and evening poles.
 *
 * Practice reminders, human plan Phase 4 (`operations/reminders-2026-07/
 * 2026-07-26-practice-reminders-HUMAN-build-plan.md` §9). The mentor grounded
 * this in the school model's DAILY cadence — Seneca's evening examination in
 * `De Ira`, "a daily rhythm, not an occasional one" — and the morning
 * preparation tool's "direct precedent in this structure".
 *
 * PRESENTATIONAL ONLY. It receives an already-computed fold and reads no clock
 * of its own, so every decision it renders was made in a pure function that is
 * unit-tested (`foldDailyRhythm`) rather than reachable only through a live
 * database at a particular hour.
 *
 * "AND NOTHING LOUDER" (plan §9). Three renderings, and the difference between
 * them is the whole design:
 *
 *   not yet today → a CadenceBanner with the doorbell line and a way in
 *   done today   → one quiet line saying so, and NO doorbell
 *   unknown      → the label alone, NO state and NO doorbell
 *
 * The doorbell appears for the not-yet state ONLY. A prompt to begin something
 * already begun is not scaffolding, it is nagging — and the mentor's warning was
 * precisely that over-designing this "creates the impression that consistency is
 * the whole of practice".
 *
 * THE UNKNOWN STATE IS LOAD-BEARING, not a rounding case. A pole whose read
 * failed shows no state at all, because rendering it as "not yet" would tell a
 * practitioner they had skipped something they may well have done. Same rule as
 * the sequence module's three-state rendering; both fail toward silence.
 *
 * WHAT IS DELIBERATELY ABSENT (plan §11): no streak, no count of days, no
 * percentage, no "N of M", no completion bar, no congratulation. The fold
 * carries `days_absent` for testability and this component never reads it — a
 * day count is the lapsed-streak framing the plan forbids, and the mentor was
 * explicit that an absence may be the false-judgement lapse, which no reminder
 * can repair and none should scold about.
 */

interface DailyRhythmStripProps {
  fold: DailyRhythmFold
}

const POLE_COPY = {
  morning: {
    label: DAILY_RHYTHM_COPY.morningLabel,
    doorbell: DAILY_RHYTHM_COPY.morningDoorbell,
    href: DAILY_RHYTHM_COPY.morningHref,
    via: null as string | null,
  },
  evening: {
    label: DAILY_RHYTHM_COPY.eveningLabel,
    doorbell: DAILY_RHYTHM_COPY.eveningDoorbell,
    href: DAILY_RHYTHM_COPY.eveningHref,
    // The evening pole is satisfied by the journal OR a reflection, but only the
    // journal has a page to write on — so the link under-describes what counts,
    // and this says so rather than leaving it misleading.
    via: DAILY_RHYTHM_COPY.eveningVia,
  },
} as const

function Pole({ pole }: { pole: RhythmPole }) {
  const copy = POLE_COPY[pole.id]

  if (pole.state === 'not_yet_today') {
    return (
      <div>
        <CadenceBanner title={copy.label} line={copy.doorbell}>
          <a
            href={copy.href}
            className="px-4 py-2 bg-sage-500 text-white font-display text-sm rounded hover:bg-sage-600 transition-colors whitespace-nowrap"
          >
            {DAILY_RHYTHM_COPY.openLabel}
          </a>
        </CadenceBanner>
        {copy.via && (
          <p className="font-body text-xs text-sage-500 mt-1.5 px-1">{copy.via}</p>
        )}
      </div>
    )
  }

  // Done, or unknown. Both are quiet; they differ only in whether a state is
  // named at all. The practice stays reachable either way — a status outage
  // must not take the door away.
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 py-2">
      <a
        href={copy.href}
        className="font-display text-sm font-medium text-sage-700 underline decoration-sage-300 hover:decoration-sage-600"
      >
        {copy.label}
      </a>
      {pole.state === 'done_today' && (
        <span className="font-body text-xs text-sage-600 whitespace-nowrap">
          {DAILY_RHYTHM_COPY.doneLabel}
        </span>
      )}
    </div>
  )
}

export default function DailyRhythmStrip({ fold }: DailyRhythmStripProps) {
  // A pole rendered blank is honest, but on its own it is also AMBIGUOUS: the
  // intro says a done thing "simply says so", which invites the reader to treat
  // silence as a no. So an unreadable pole is named. The sibling module's outage
  // banner cannot cover this — its own check derives from the tracked PRACTICE
  // tables, and none of the rhythm tables is one — so without this line a
  // rhythm-only failure would be indistinguishable from "you did neither".
  // Found by the adversarial review.
  const anyUnavailable = fold.poles.some((p) => p.state === 'unknown')

  return (
    <div className="bg-white/60 border border-sage-200 rounded-lg p-8">
      <h2 className="font-display text-xl font-medium text-sage-800 mb-2">
        {DAILY_RHYTHM_COPY.heading}
      </h2>
      <p className="font-body text-sm text-sage-600 mb-6 max-w-2xl">
        {DAILY_RHYTHM_COPY.intro}
      </p>

      {anyUnavailable && (
        <p className="font-body text-sm text-amber-700 bg-amber-50/60 border border-amber-200 rounded px-4 py-3 mb-6">
          {DAILY_RHYTHM_COPY.unavailableNote}
        </p>
      )}

      {/* The returning line sits above the poles and carries no action of its
          own — "begin with whatever is nearest" leaves the choosing to the
          practitioner, which is part of the turning-toward. */}
      {fold.returning && (
        <p className="font-body text-sm text-sage-700 bg-sage-50/70 border border-sage-200 rounded px-4 py-3 mb-6">
          {DAILY_RHYTHM_COPY.returning}
        </p>
      )}

      <div className="space-y-3">
        {fold.poles.map((pole) => (
          <Pole key={pole.id} pole={pole} />
        ))}
      </div>
    </div>
  )
}
