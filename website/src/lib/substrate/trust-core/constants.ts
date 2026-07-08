/**
 * constants.ts — Trust Layer S1 deterministic engine constants.
 *
 * Pure — no I/O, no env reads. The proximity ranks mirror the engine's
 * PROXIMITY_RANK (layer2-mechanisms.ts) and the trust-layer's PROXIMITY_RANK
 * (accreditation-record.ts) — both agree exactly (reflexive:0 … sage_like:4;
 * verified 2026-07-08). Defined locally so trust-core is standalone + testable
 * without pulling a runtime dependency on the sandwich engine.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { Volatility } from './types'

/** The katorthoma-proximity scale, worst → best. Index = ordinal rank. */
export const PROXIMITY_ORDER: readonly KatorthomaProximity[] = [
  'reflexive',
  'habitual',
  'deliberate',
  'principled',
  'sage_like',
] as const

/** reflexive:0 … sage_like:4. */
export const PROXIMITY_RANK: Record<KatorthomaProximity, number> = {
  reflexive: 0,
  habitual: 1,
  deliberate: 2,
  principled: 3,
  sage_like: 4,
}

/** Rank → proximity level (the inverse of PROXIMITY_RANK). */
export function rankToProximity(rank: number): KatorthomaProximity {
  const clamped = Math.max(0, Math.min(PROXIMITY_ORDER.length - 1, Math.round(rank)))
  return PROXIMITY_ORDER[clamped]
}

/** The 'deliberate' rank — the justice-latch cap (mentor spec 3). */
export const DELIBERATE_RANK = PROXIMITY_RANK.deliberate

/**
 * A3 decline ONSET in months of domain inactivity, by deployer volatility rating.
 * These are the points at which the earned level BEGINS stepping toward the
 * profile prior — not expiry dates.
 */
export const DECAY_ONSET_MONTHS: Record<Volatility, number> = {
  low: 12,
  moderate: 6,
  high: 3,
}

/**
 * A 30-day month, in ms — the deterministic unit for decay arithmetic. The A3
 * onsets are approximate thresholds (not exact-to-the-day), so a fixed 30-day
 * month keeps decay a pure, replayable function of (last_activity, now).
 */
export const MONTH_MS = 30 * 24 * 60 * 60 * 1000

/**
 * A3 reflect modulation: an active honest reflect practice DOUBLES the decay
 * onset (equivalently, halves the base decay rate — the mentor's cap: "3 months
 * becomes 6"; it slows decay, never stops it). Binary in S1 (reflect-active or
 * not); a graded reflect-strength modulation is an S2/S9 refinement.
 */
export const REFLECT_MODULATION_FACTOR = 2

/**
 * How recent an honest reflect completion must be to count as an "active
 * reflection practice" for decay modulation. The mentor fixes the modulation
 * magnitude (half-rate) but not this window; 180 days is a documented default
 * (≈ the moderate-volatility onset) — a tunable pending mentor/S9 input.
 */
export const REFLECT_ACTIVE_WINDOW_MS = 180 * 24 * 60 * 60 * 1000
