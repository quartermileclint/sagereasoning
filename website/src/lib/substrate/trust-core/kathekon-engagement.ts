/**
 * kathekon-engagement.ts — the canonical Q3 kathekon-engagement predicate.
 *
 * ADR-013 §7/§11 (the 2026-07-12 mentor S11 verdict; verbatim wins). This is the
 * ONE shared function the eventual S11 G6(a) qualification binds on — authored
 * here (Trust Layer S11 observation period) so the flip REUSES it, never
 * re-implements it. It is also the classifier for the false-hold labelling
 * instrument: a "hold" (a correction loop the enforce regime would bind) is a
 * candidate FALSE POSITIVE when the verdict that opened it did NOT engage a
 * kathekon factor, and a candidate CORRECT HOLD when it did.
 *
 * THE MENTOR'S THRESHOLD (verbatim): "the kathekon-engagement threshold for
 * G6(a) binding is met when the verdict that opened the loop found at least one
 * of the following: a justice surface present, a violated obligation, a
 * proximity reading at habitual or below, or a passion identified in the
 * reasoning trace at sub-species level." A verdict that found none of these —
 * "contrary to appropriate action with no kathekon factors detected" — is
 * log-and-continue + a developmental flag + a recorded false-positive instance,
 * NOT a do-not-proceed.
 *
 * FAITHFULNESS. The justice arm REUSES deriveWorstJusticeOutcome (the engine's
 * own justice reducer, battery-pinned) rather than re-reading obligation
 * statuses independently — so "justice surface present" here means exactly what
 * the engine means by it. The proximity arm reuses PROXIMITY_RANK. Pure — no
 * I/O, no env, no clock.
 */

import type {
  KatorthomaProximity,
  VirtueDomain,
  Layer2Assessment,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import type { ObligationStatus } from '@/lib/translation-sandwich/layer1-extractor'
import { PROXIMITY_RANK } from './constants'
import { deriveWorstJusticeOutcome } from './derive-trust-events'

/**
 * The lean, serializable projection of an at-action verdict that the predicate
 * reads — the fields captured by the harness and stored in the observation
 * record. Everything the four Q3 arms need, and nothing that quotes the action
 * text (kept PII-light). kathekonSignalsFromAssessment builds this from a full
 * Layer2Assessment (the harness capture mirrors that projection in JS).
 */
export interface KathekonEngagementSignals {
  /** The aggregate katorthoma proximity of the verdict (== proximity_floors.aggregate when §4 on). */
  proximity: KatorthomaProximity
  /** The engaged cardinal virtue domains — the dikaiosyne-engagement gate for the justice arm. */
  virtueDomainsEngaged: VirtueDomain[]
  /** Per-relevant-circle obligation status; null = the circle carried no obligation assessment. */
  obligationStatuses: (ObligationStatus | null)[]
  /** The non-null sub-species passions identified in the trace (bare-root passions are excluded). */
  subSpeciesPassions: string[]
}

/** The Q3 reading of one verdict: whether it engaged a kathekon factor, and which. */
export interface KathekonEngagement {
  /** The predicate result: at least one of the four arms fired. */
  engaged: boolean
  /** Arm 1 — the examination engaged a justice surface (deriveWorstJusticeOutcome !== null). */
  justiceSurfacePresent: boolean
  /** Arm 2 — a violated obligation (a sub-signal of justiceSurfacePresent; listed distinctly by the mentor). */
  violatedObligation: boolean
  /** Arm 3 — proximity at habitual or below (rank <= habitual). */
  proximityAtOrBelowHabitual: boolean
  /** Arm 4 — a sub-species passion identified in the trace. */
  subSpeciesPassion: boolean
  /** Which arms fired — for the observation record + the day-7 human cross-check. */
  firedArms: string[]
}

/** The habitual rank — the "at habitual or below" threshold (reflexive:0, habitual:1). */
const HABITUAL_RANK = PROXIMITY_RANK.habitual

/**
 * The canonical Q3 kathekon-engagement predicate. Pure. The eventual S11 G6(a)
 * qualification calls this on the verdict that opened a correction loop; the
 * false-hold instrument calls it on every captured at-action verdict.
 */
export function assessKathekonEngagement(signals: KathekonEngagementSignals): KathekonEngagement {
  // Arm 1 + 2 — the justice reading. Reuse the engine's own reducer so "justice
  // surface present" means exactly what the engine means. deriveWorstJusticeOutcome
  // reads only oikeiosis.relevant_circles[].obligation_assessment.status,
  // virtue_domains_engaged (the dikaiosyne gate), and katorthoma_proximity (for
  // the met tie-break) — all defensive reads — so a minimal reconstruction is
  // faithful. It returns non-null iff a justice surface is present (violated /
  // unevaluated / indeterminate / met, dikaiosyne-gated exactly as the engine
  // gates it); the obligationStatus names which.
  const justice = deriveWorstJusticeOutcome([
    {
      katorthoma_proximity: signals.proximity,
      virtue_domains_engaged: signals.virtueDomainsEngaged ?? [],
      oikeiosis: {
        relevant_circles: (signals.obligationStatuses ?? []).map((status) =>
          status ? { obligation_assessment: { status } } : {},
        ),
      },
      // deriveWorstJusticeOutcome reads no other field; the cast is scoped to the
      // three it does read (defensive optional reads at every access).
    } as unknown as Parameters<typeof deriveWorstJusticeOutcome>[0][number],
  ])
  const justiceSurfacePresent = justice !== null
  const violatedObligation = justice?.obligationStatus === 'violated'

  // Arm 3 — proximity at habitual or below.
  const proximityAtOrBelowHabitual = PROXIMITY_RANK[signals.proximity] <= HABITUAL_RANK

  // Arm 4 — a sub-species passion in the trace. The assessment's passion_diagnosis
  // sub_species field is already the controlled PassionSubSpecies vocabulary, so a
  // non-empty value IS a sub-species-level identification (unlike the reflect Q4
  // free-form path, which needs the vocabulary gate).
  const subSpeciesPassion = (signals.subSpeciesPassions ?? []).some(
    (s) => typeof s === 'string' && s.trim() !== '',
  )

  const firedArms: string[] = []
  if (justiceSurfacePresent) firedArms.push('justice-surface-present')
  if (violatedObligation) firedArms.push('violated-obligation')
  if (proximityAtOrBelowHabitual) firedArms.push('proximity<=habitual')
  if (subSpeciesPassion) firedArms.push('sub-species-passion')

  // violatedObligation is subsumed by justiceSurfacePresent, but is kept in the OR
  // explicitly (the mentor lists it as a distinct arm) — belt and braces if the
  // justice arm is ever narrowed.
  const engaged =
    justiceSurfacePresent || violatedObligation || proximityAtOrBelowHabitual || subSpeciesPassion

  return {
    engaged,
    justiceSurfacePresent,
    violatedObligation,
    proximityAtOrBelowHabitual,
    subSpeciesPassion,
    firedArms,
  }
}

/**
 * Project a full Layer-2 assessment into the lean signal shape. Used by the
 * eventual S11 G6(a) (which has a live assessment) and mirrored by the harness
 * capture in JS. A pure field projection — it decides which fields the predicate
 * reads, never how they combine (that is assessKathekonEngagement alone).
 */
export function kathekonSignalsFromAssessment(
  assessment: Pick<
    Layer2Assessment,
    'katorthoma_proximity' | 'virtue_domains_engaged' | 'oikeiosis' | 'passion_diagnosis'
  >,
): KathekonEngagementSignals {
  const circles = assessment.oikeiosis?.relevant_circles ?? []
  const passions = assessment.passion_diagnosis?.passions_detected ?? []
  return {
    proximity: assessment.katorthoma_proximity,
    virtueDomainsEngaged: assessment.virtue_domains_engaged ?? [],
    obligationStatuses: circles.map((c) => c.obligation_assessment?.status ?? null),
    subSpeciesPassions: passions
      .map((p) => p.sub_species)
      .filter((s): s is NonNullable<typeof s> => typeof s === 'string' && s.trim() !== ''),
  }
}

// ============================================================================
// The hold classification — what the enforce regime would bind, and how the
// instrument labels it. The at-action "hold" the mentor measures is the
// correction loop: an examination whose advisory OPENED (or reopened) a loop is
// what the eventual G6(a) do-not-proceed binds on; a closed/none loop is not a
// hold. Mirrors the harness loop-closure vocabulary (loop-closure.mjs
// advanceLoopState: 'opened' | 'reopened' | 'closed' | 'none').
// ============================================================================

/** The loop events that constitute a hold under the eventual enforce regime. */
export const HOLD_LOOP_EVENTS = ['opened', 'reopened'] as const
export type HoldLoopEvent = (typeof HOLD_LOOP_EVENTS)[number]

/** Whether a loop event is a hold (a correction loop the enforce regime would bind). */
export function isHoldLoopEvent(loopEvent: string | null | undefined): boolean {
  return loopEvent === 'opened' || loopEvent === 'reopened'
}

/** The three classifications a captured at-action examination can take. */
export type HoldClassification = 'false_positive' | 'correct_hold' | 'not_a_hold'

export interface ObservationClassification {
  isHold: boolean
  engagement: KathekonEngagement
  classification: HoldClassification
}

/**
 * Classify one captured at-action examination. The full labelling step:
 *   - not a hold (loop closed/none)            → 'not_a_hold'
 *   - a hold + NO kathekon factor engaged      → 'false_positive'  (the class the mentor measures)
 *   - a hold + a kathekon factor engaged       → 'correct_hold'
 * The engagement reading is computed for EVERY observation (hold or not) so the
 * record carries which arms fired regardless — the day-7 cross-check reads it.
 */
export function classifyObservation(
  signals: KathekonEngagementSignals,
  loopEvent: string | null | undefined,
): ObservationClassification {
  const engagement = assessKathekonEngagement(signals)
  const isHold = isHoldLoopEvent(loopEvent)
  const classification: HoldClassification = !isHold
    ? 'not_a_hold'
    : engagement.engaged
      ? 'correct_hold'
      : 'false_positive'
  return { isHold, engagement, classification }
}
