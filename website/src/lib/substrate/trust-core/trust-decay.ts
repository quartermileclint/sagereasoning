/**
 * trust-decay.ts — A3 decay, realised R6c-faithfully as ORDINAL proximity steps.
 *
 * Mentor A3 (binding): staleness is a function of deployer-rated function-type
 * VOLATILITY (low/moderate/high → decline ONSET at 12/6/3 months of DOMAIN
 * inactivity). The earned level then declines TOWARD the profile prior; it FLOORS
 * at the prior, never below (decay is loss of earned evidence, not negative
 * evidence — a trust-reducing EVENT may push below the prior, decay may not). An
 * active honest reflect practice DOUBLES the onset (the half-rate cap — "3 months
 * becomes 6"; slows decay, never stops it).
 *
 * REALISATION (R6c — the trust level is CATEGORICAL, not a numeric score, per
 * manifest R6c): the mentor fixes the onset + the floor + the half-rate cap, not
 * the exact curve; the R6c-faithful curve is ORDINAL — the earned level steps
 * DOWN one proximity rank per onset-period of continued inactivity, floored at
 * the prior.
 *
 * PURITY / HONESTY: `now` is injected. Decay is computed at READ time (E3
 * lazy-on-read); a trust read is a LIVE value, so reading `now()` here is
 * correct + honest — unlike the signed/reproducible trajectory overlay, which
 * must never read the clock. The battery injects a fixed `now` for determinism.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { Volatility } from './types'
import {
  DECAY_ONSET_MONTHS,
  MONTH_MS,
  PROXIMITY_RANK,
  REFLECT_ACTIVE_WINDOW_MS,
  REFLECT_MODULATION_FACTOR,
  SCREENED_REFLECT_MODULATION_FACTOR,
} from './constants'

export interface DecayInput {
  /** The earned proximity level (as of last_domain_activity_at). */
  earnedLevel: KatorthomaProximity
  /** The decay floor (never decays below this). */
  profilePrior: KatorthomaProximity
  /** ISO timestamp the earned level was last set, or null (no activity ⇒ no decay). */
  lastDomainActivityAt: string | null
  volatility: Volatility
  /** ISO timestamp of the last honest reflect completion, or null. */
  reflectLastHonestAt: string | null
  /** ISO timestamp of the last SCREENED reflect persist, or null (S9b G2 —
   *  quarter-rate modulation; the full signal above wins when both are active). */
  reflectLastScreenedAt?: string | null
  now: Date
}

export interface DecayResult {
  /** The decayed proximity rank (0–4), floored at the prior rank. */
  rank: number
  /** Ranks removed by decay on this read (0 if inactive / already at/below prior). */
  stepsApplied: number
  /** True when an active reflect practice slowed the decay. */
  reflectModulated: boolean
  /** True when the modulation applied was the SCREENED quarter-rate factor (a
   *  screened persist was active and no full reflect was — S9b G2). */
  screenedModulated?: boolean
}

/**
 * True when a reflect completion is recent enough to count as an active
 * reflection practice (within REFLECT_ACTIVE_WINDOW_MS of `now`).
 */
export function isReflectActive(
  reflectLastHonestAt: string | null,
  now: Date,
): boolean {
  if (reflectLastHonestAt === null) return false
  const t = Date.parse(reflectLastHonestAt)
  if (Number.isNaN(t)) return false
  return now.getTime() - t < REFLECT_ACTIVE_WINDOW_MS
}

/**
 * Compute the decayed proximity RANK per A3. Pure. Returns the rank + how many
 * steps decay removed + whether reflect modulation applied.
 */
export function decayEarnedRank(input: DecayInput): DecayResult {
  const earnedRank = PROXIMITY_RANK[input.earnedLevel]
  const priorRank = PROXIMITY_RANK[input.profilePrior]

  // Nothing to decay: the earned level is already at/below the prior (either a
  // fresh row at the prior, or an event pushed it below — decay does not raise
  // it back up, and there is no above-prior earned evidence to erode).
  if (earnedRank <= priorRank) {
    return { rank: earnedRank, stepsApplied: 0, reflectModulated: false }
  }

  // No activity timestamp ⇒ no decay clock (defensive; an above-prior earned
  // level always carries a last_domain_activity_at in practice).
  if (input.lastDomainActivityAt === null) {
    return { rank: earnedRank, stepsApplied: 0, reflectModulated: false }
  }

  const lastActivityMs = Date.parse(input.lastDomainActivityAt)
  if (Number.isNaN(lastActivityMs)) {
    return { rank: earnedRank, stepsApplied: 0, reflectModulated: false }
  }

  const inactivityMs = input.now.getTime() - lastActivityMs
  if (inactivityMs <= 0) {
    return { rank: earnedRank, stepsApplied: 0, reflectModulated: false }
  }

  const reflectActive = isReflectActive(input.reflectLastHonestAt, input.now)
  // S9b G2: a screened persist modulates at the QUARTER rate (onset × 4/3), but
  // only when no FULL reflect is active — the full factor wins, never stacks
  // (the mentor's cap: maximum modulation is the halving).
  const screenedActive =
    !reflectActive && isReflectActive(input.reflectLastScreenedAt ?? null, input.now)
  const modulationFactor = reflectActive
    ? REFLECT_MODULATION_FACTOR
    : screenedActive
      ? SCREENED_REFLECT_MODULATION_FACTOR
      : 1
  const onsetMonths = DECAY_ONSET_MONTHS[input.volatility] * modulationFactor
  const onsetMs = onsetMonths * MONTH_MS

  // Below the onset ⇒ no decline yet. At/after the onset ⇒ one rank per
  // onset-period of inactivity (floor(inactivity / onset)).
  const stepsDown = inactivityMs < onsetMs ? 0 : Math.floor(inactivityMs / onsetMs)
  const decayedRank = Math.max(priorRank, earnedRank - stepsDown)

  return {
    rank: decayedRank,
    stepsApplied: earnedRank - decayedRank,
    reflectModulated: reflectActive || screenedActive,
    screenedModulated: screenedActive,
  }
}
