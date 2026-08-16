/**
 * constants.ts — Trust Layer S1 deterministic engine constants.
 *
 * Pure — no I/O, no env reads. The proximity ranks mirror the engine's
 * PROXIMITY_RANK (layer2-mechanisms.ts) and the trust-layer's PROXIMITY_RANK
 * (accreditation-record.ts) — both agree exactly (reflexive:0 … sage_like:4;
 * verified 2026-07-08). Defined locally so trust-core is standalone + testable
 * without pulling a runtime dependency on the sandwich engine.
 */

import type { KatorthomaProximity, OikeiosisCircle } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { Volatility } from './types'

/** The innermost oikeiosis circle. Canonical home (2026-08-17, register D4): BOTH
 *  `kathekon-engagement.ts` (the predicate) and `derive-trust-events.ts` (the
 *  reducer) must test circle identity against the same literal, and the predicate
 *  already imports the reducer — so defining it in either would make the pair
 *  circular. It lives here, in the neutral module both already depend on;
 *  kathekon-engagement re-exports it under its established name so existing
 *  importers are unaffected.
 *
 *  Deliberately NOT consolidated with `layer2-mechanisms.ts:1575`'s identical
 *  local constant: that file is inside the `/api/reason` engine graph, and
 *  touching it for a tidy-up would trade a real measurement guarantee for
 *  cosmetics. Named here so the duplication stays a recorded decision. */
export const SELF_PRESERVATION_CIRCLE: OikeiosisCircle = 'self_preservation'

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
 * S9b G2 (the 2026-07-11 mentor verdicts, binding): a SCREENED reflection
 * "modulates at a quarter of the base decay rate — it contributes to the decay
 * modulator but less than a full reflection", where the full reflection's
 * maximum modulation is a HALVING of the base rate.
 *
 * Arithmetic of record: full modulation removes 1/2 of the base decay rate
 * (rate × 0.5 ⇒ onset × 2 = REFLECT_MODULATION_FACTOR). Screened modulation
 * removes 1/4 of the base decay rate (rate × 0.75 ⇒ onset × 4/3). The onset
 * multiplier is therefore 4/3 — strictly less modulation than full (2), strictly
 * more than none (1). When BOTH signals are active the FULL factor wins (the
 * mentor's cap: maximum modulation is the halving; the factors never stack).
 */
export const SCREENED_REFLECT_MODULATION_FACTOR = 4 / 3

/**
 * How recent an honest reflect completion must be to count as an "active
 * reflection practice" for decay modulation. The mentor fixes the modulation
 * magnitude (half-rate) but not this window; 180 days is a documented default
 * (≈ the moderate-volatility onset) — a tunable pending mentor/S9 input.
 */
export const REFLECT_ACTIVE_WINDOW_MS = 180 * 24 * 60 * 60 * 1000
