/**
 * r20b-dependence.ts — Framework-dependence detection (R20b)
 *
 * Implements the *detection* half of R20b ("Independence, not dependence",
 * manifest line 227): read a practitioner's recent interaction history and
 * decide whether a dependence usage-pattern is present ("running every trivial
 * decision through evaluation"). The *coaching* half lives in the mentor route
 * that consumes this signal (A18c single-endpoint proof: /api/mentor/private/
 * reflect).
 *
 * DESIGN (ADR /drafts/adr/2026-06-07-r20b-framework-dependence-detection.md):
 *   - DETERMINISTIC. No LLM call, no model-selection risk (KG2/PR4 N/A).
 *   - PURE. No I/O — the caller loads InteractionRecord[] and passes it in.
 *     Read-only over existing data; never writes; never throws.
 *   - SEPARATE from the R20a distress perimeter. This reads usage *history*;
 *     it does NOT classify the current input for distress and does NOT touch
 *     detectDistressTwoStage / Zone 2-3 / enforceDistressCheck (PR6 boundary).
 *   - DIAGNOSTIC, not punitive (R6d): the signal only ever invites coaching;
 *     it never blocks, rate-limits, or degrades any evaluation.
 *   - HONEST (R19/R20b): the pattern it detects is over-reliance; the coaching
 *     it enables points the practitioner toward needing the tool LESS.
 *
 * THRESHOLD: dependence is present only when BOTH hold —
 *   1. frequency is high (>= minFrequency interactions in the window), AND
 *   2. the recent window skews trivial — a short median input length OR a high
 *      share of reflexive/habitual proximity (the triviality proxy).
 * High frequency alone is healthy daily practice; high frequency *of trivial
 * evaluations* is the R20b pattern. Both gates guard against false positives.
 * The defaults are conservative starting values, tunable as constants below.
 */

import type { InteractionRecord } from '@/lib/sage-mentor-ring-bridge'

/** The structured detection result. Surfaced (diagnostic) on the route response. */
export interface DependenceSignal {
  /** True when the dependence usage-pattern is present (frequency-high AND trivial). */
  present: boolean
  /** Human-readable explanation of the verdict (diagnostic; never shown raw to the user). */
  reason: string
  /** Interaction count in the window. */
  window_count: number
  /** Median trimmed `description` length in the window (null when window empty). */
  median_input_length: number | null
  /** Share (0..1) of window interactions at reflexive/habitual proximity (null when empty). */
  shallow_share: number | null
  /** The thresholds actually applied (echoed for verification). */
  thresholds: {
    window_days: number
    min_frequency: number
    max_median_length: number
    min_shallow_share: number
  }
}

/** Per-call overrides. All optional; defaults below. */
export interface DependenceOptions {
  windowDays?: number
  minFrequency?: number
  maxMedianLength?: number
  minShallowShare?: number
}

/**
 * Conservative starting thresholds. Tunable. Rationale:
 *   - windowDays 7: a recent week is enough to see a sustained pattern.
 *   - minFrequency 25: sustained multiple-per-day evaluation over the week.
 *   - maxMedianLength 120: short inputs as a triviality proxy (chars).
 *   - minShallowShare 0.6: most evaluations at the reflexive/habitual end.
 */
export const DEPENDENCE_DEFAULTS = {
  windowDays: 7,
  minFrequency: 25,
  maxMedianLength: 120,
  minShallowShare: 0.6,
} as const

/** Proximity levels treated as "shallow" for the triviality proxy. */
const SHALLOW_LEVELS: ReadonlySet<string> = new Set(['reflexive', 'habitual'])

/** Median of a numeric array; null for empty input. Pure. */
function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Detect the R20b framework-dependence usage-pattern over a window of
 * interaction records. Pure, deterministic, never throws.
 *
 * The caller is expected to pass records already scoped to the practitioner +
 * hub (e.g. via loadMentorInteractionsAsRecords). This function re-applies the
 * time window defensively from `created_at` so it is correct for any caller.
 */
export function detectFrameworkDependence(
  interactions: InteractionRecord[],
  options?: DependenceOptions,
): DependenceSignal {
  const windowDays = options?.windowDays ?? DEPENDENCE_DEFAULTS.windowDays
  const minFrequency = options?.minFrequency ?? DEPENDENCE_DEFAULTS.minFrequency
  const maxMedianLength =
    options?.maxMedianLength ?? DEPENDENCE_DEFAULTS.maxMedianLength
  const minShallowShare =
    options?.minShallowShare ?? DEPENDENCE_DEFAULTS.minShallowShare

  const thresholds = {
    window_days: windowDays,
    min_frequency: minFrequency,
    max_median_length: maxMedianLength,
    min_shallow_share: minShallowShare,
  }

  // Defensive window re-application. Records with an unparseable created_at are
  // kept (the loader already scoped them), rather than silently dropped.
  const cutoffMs = Date.now() - windowDays * 24 * 60 * 60 * 1000
  const inWindow = interactions.filter((i) => {
    const t = Date.parse(i.created_at)
    return Number.isFinite(t) ? t >= cutoffMs : true
  })

  const window_count = inWindow.length

  if (window_count === 0) {
    return {
      present: false,
      reason: 'no interactions in window',
      window_count,
      median_input_length: null,
      shallow_share: null,
      thresholds,
    }
  }

  const lengths = inWindow.map((i) =>
    typeof i.description === 'string' ? i.description.trim().length : 0,
  )
  const median_input_length = median(lengths)

  const shallowCount = inWindow.filter(
    (i) => i.proximity_assessed !== null && SHALLOW_LEVELS.has(i.proximity_assessed),
  ).length
  const shallow_share = shallowCount / window_count

  const frequencyHigh = window_count >= minFrequency
  const trivialByLength =
    median_input_length !== null && median_input_length <= maxMedianLength
  const trivialByShallow = shallow_share >= minShallowShare
  const trivial = trivialByLength || trivialByShallow

  const present = frequencyHigh && trivial

  const reason = present
    ? `high-frequency shallow usage: ${window_count} interactions in ${windowDays}d` +
      (trivialByLength ? `, median input ${median_input_length} chars` : '') +
      (trivialByShallow
        ? `, ${Math.round(shallow_share * 100)}% reflexive/habitual`
        : '')
    : `below dependence threshold (count ${window_count}/${minFrequency}; frequency_high=${frequencyHigh}; trivial=${trivial})`

  return {
    present,
    reason,
    window_count,
    median_input_length,
    shallow_share,
    thresholds,
  }
}
