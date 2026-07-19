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
 * ARM 1 CARRIES TWO MENTOR-MANDATED NARROWINGS, layered:
 *   R11 (2026-07-17 F2 exclusion-clause ruling; landed S11b 2026-07-18):
 *     a justice surface requires ≥1 IDENTIFIED CIRCLE — the zero-circle
 *     dikaiosyne tag (is_kathekon===false via computeVirtueDomains) is NOT a
 *     justice surface.
 *   THE SELF-CIRCLE NARROWING (2026-07-19 mentor ruling, ADOPTED BINDING —
 *     operations/trust-layer-2026-07/2026-07-19-mentor-consultation-dikaiosyne-
 *     self-circle-verbatim.md; verbatim wins): dikaiosyne is OTHER-DIRECTED
 *     (Cicero, De Officiis; DL — "what is to be distributed to each person; the
 *     person in question is always another"). The `self_preservation` circle,
 *     standing alone with no other identified party, is NOT a justice surface;
 *     self-regarding action is governed by phronesis/sophrosyne. Arm 1 now
 *     requires ≥1 identified circle BEYOND `self_preservation`. An
 *     "indeterminate" obligation on the self-circle is the trigger MISFIRING,
 *     not a real-but-unresolvable duty. The A2-omission class remains an
 *     EXTRACTION responsibility — the predicate is NOT broadened to catch
 *     omitted harms (mentor #5: "fix extraction, do not broaden the predicate").
 *   Arms 2–4 are UNCHANGED by both narrowings (mentor-enumerated distinct arms;
 *   a violated obligation still engages whatever circle carries it — adverse
 *   justice evidence is never dropped, the conservative direction).
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
import type {
  ObligationStatus,
  OikeiosisCircle,
} from '@/lib/translation-sandwich/layer1-extractor'
import { PROXIMITY_RANK } from './constants'
import { deriveWorstJusticeOutcome } from './derive-trust-events'

/**
 * The innermost oikeiosis circle — typed against the CANONICAL extraction
 * vocabulary (layer1-extractor.ts OikeiosisCircle: self_preservation |
 * household | local_community | political_community | cosmopolis), so the
 * exclusion can never drift from the extractor's actual circle names (the
 * 2026-07-19 narrowing prompt's verify-before-coding requirement — the live
 * probe read exactly this name).
 */
export const SELF_PRESERVATION_CIRCLE: OikeiosisCircle = 'self_preservation'

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
  /**
   * Per-relevant-circle CIRCLE NAME, index-aligned with obligationStatuses
   * (both project from the same oikeiosis.relevant_circles array). Added by
   * the 2026-07-19 self-circle narrowing — Arm 1 now reads circle IDENTITY.
   * `null` = identity unknown. On every LIVE surface the name is always
   * present (OikeiosisCircleAssessment.circle is a required field); null is
   * reachable only from LEGACY captured records (the v1/v2 false-hold buffer,
   * which predates this field). An unknown-identity circle does NOT satisfy
   * the beyond-self requirement — an unidentified circle is not an IDENTIFIED
   * other party (strict; disclosed in NARROWED_ARM_BOUNDS.selfCircleExclusion;
   * the observation report brackets legacy records both ways).
   */
  circles: (string | null)[]
  /** The non-null sub-species passions identified in the trace (bare-root passions are excluded). */
  subSpeciesPassions: string[]
}

/** The Q3 reading of one verdict: whether it engaged a kathekon factor, and which. */
export interface KathekonEngagement {
  /** The predicate result: at least one of the four arms fired. */
  engaged: boolean
  /** Arm 1 — TWICE-NARROWED. R11 (the 2026-07-17 F2 verdict §1b, landed S11b
   *  2026-07-18): the examination engaged a justice surface AND identified ≥1
   *  circle — a dikaiosyne tag resting solely on is_kathekon===false with zero
   *  circles is NOT a justice surface (the exclusion clause governs). THE
   *  SELF-CIRCLE NARROWING (2026-07-19 mentor ruling, binding): the identified
   *  circle(s) must include ≥1 BEYOND self_preservation — dikaiosyne is
   *  other-directed; the self circle standing alone is NOT a justice surface. */
  justiceSurfacePresent: boolean
  /** Arm 2 — a violated obligation (listed distinctly by the mentor; UNCHANGED
   *  by both narrowings — a violated status engages whatever circle carries
   *  it, so adverse justice evidence is never dropped). No longer strictly a
   *  sub-signal of justiceSurfacePresent: a violated obligation on the
   *  self-circle alone fires Arm 2 while Arm 1 stays false. */
  violatedObligation: boolean
  /** Arm 3 — proximity at habitual or below (rank <= habitual). */
  proximityAtOrBelowHabitual: boolean
  /** Arm 4 — a sub-species passion identified in the trace. */
  subSpeciesPassion: boolean
  /** Which arms fired — for the observation record + the day-7 human cross-check. */
  firedArms: string[]
  /** The count of identified circles BEYOND self_preservation (Arm 1's new
   *  operand; also the loop-fold's dikaiosyne-evidence eligibility input —
   *  computed once here so no consumer re-implements the circle reading). */
  beyondSelfCircleCount: number
  /** Diagnostic (2026-07-19): the justice reading existed (justice !== null)
   *  and ≥1 circle was identified, but EVERY identified circle is
   *  self_preservation (none unknown, none beyond self) — the arm was
   *  suppressed specifically by the other-directedness requirement. This is
   *  the mentor's re-classified class ("self-regarding action is phronesis/
   *  sophrosyne"): the loop-fold splits it deliberately (self_regarding, not
   *  instrument noise). False whenever the arm fired, no justice reading
   *  existed, no circle existed, or any circle identity is unknown. An
   *  ARM-1-LEVEL diagnostic: it can be true while `engaged` is true via
   *  another arm (e.g. violated-on-self fires Arm 2) — consumers splitting on
   *  it (the loop-fold) must gate on !engaged FIRST. */
  selfCircleOnlySuppression: boolean
  /** Diagnostic (2026-07-19): ≥1 circle entry carries an UNKNOWN identity
   *  (null/absent name — legacy v1/v2 captures only; structurally unreachable
   *  on live surfaces). Under the strict rule such entries never satisfy the
   *  beyond-self requirement; the observation report uses this flag to
   *  bracket legacy records both ways rather than certify one reading. */
  circleIdentityUnknown: boolean
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
  // THE TWO ARM-1 NARROWINGS, layered (both mentor-mandated, both binding):
  //
  // R11 (2026-07-17 verdict §1b, verbatim: "Arm 1 requires at least one
  // identified circle"; landed S11b 2026-07-18 after the R12 gate routed
  // extraction-first): the zero-circle dikaiosyne tag is NOT a justice surface.
  //
  // THE SELF-CIRCLE NARROWING (2026-07-19 verdict, verbatim: "Arm 1 should
  // require at least one identified circle beyond the self-preservation circle
  // — or more precisely, at least one circle that contains another rational
  // agent whose good is genuinely at stake"): dikaiosyne is other-directed;
  // `self_preservation` standing alone is NOT a justice surface. Every
  // extraction circle beyond self (household / local_community /
  // political_community / cosmopolis) contains other rational agents, so
  // name ≠ self_preservation is the faithful encoding. An UNKNOWN-identity
  // entry (null name — legacy captures only; live circles always carry the
  // required `circle` field) does NOT satisfy the requirement: an unidentified
  // circle is not an IDENTIFIED other party (strict; disclosed below, and the
  // report brackets legacy records both ways). Violated / indeterminate / met
  // on a BEYOND-SELF circle still fire; unevaluated-WITH-a-beyond-self-circle
  // (the U2/J2 marketing-email class) still fires. The gate is stated here, on
  // the predicate the flip binds on. NOTE the deliberate divergence this
  // second narrowing introduces: the engine reducer (deriveWorstJusticeOutcome)
  // does not read circle identity, so the predicate is now strictly NARROWER
  // than the reducer on self-only inputs — the reducer's own self-circle
  // treatment is a LIVE trust-event surface (D3: code-critical, founder-walked,
  // its own step; register item D4).
  const statuses = signals.obligationStatuses ?? []
  const names = signals.circles ?? []
  const circleEntryCount = Math.max(statuses.length, names.length)
  let beyondSelfCircleCount = 0
  let knownSelfCount = 0
  let unknownCount = 0
  for (let i = 0; i < circleEntryCount; i++) {
    const name = names[i]
    if (typeof name === 'string' && name.trim() !== '') {
      if (name === SELF_PRESERVATION_CIRCLE) knownSelfCount++
      else beyondSelfCircleCount++
    } else {
      unknownCount++
    }
  }
  const justiceSurfacePresent = justice !== null && beyondSelfCircleCount >= 1
  const violatedObligation = justice?.obligationStatus === 'violated'
  const selfCircleOnlySuppression =
    justice !== null &&
    circleEntryCount >= 1 &&
    beyondSelfCircleCount === 0 &&
    unknownCount === 0 &&
    knownSelfCount >= 1
  const circleIdentityUnknown = circleEntryCount >= 1 && unknownCount >= 1

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

  // violatedObligation stays in the OR explicitly (the mentor lists it as a
  // distinct arm). After the 2026-07-19 self-circle narrowing this is no
  // longer redundant: a violated obligation carried ONLY by the self circle
  // fires Arm 2 while Arm 1 stays false — the OR is load-bearing, keeping the
  // mentor's four-arm enumeration literal AND the conservative direction
  // (adverse justice evidence engages regardless of which circle carries it).
  const engaged =
    justiceSurfacePresent || violatedObligation || proximityAtOrBelowHabitual || subSpeciesPassion

  return {
    engaged,
    justiceSurfacePresent,
    violatedObligation,
    proximityAtOrBelowHabitual,
    subSpeciesPassion,
    firedArms,
    beyondSelfCircleCount,
    selfCircleOnlySuppression,
    circleIdentityUnknown,
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
    // 2026-07-19 self-circle narrowing: project the circle NAME alongside the
    // status (same source array ⇒ index-aligned by construction). `circle` is
    // a required field on OikeiosisCircleAssessment, so live projections never
    // produce null here; the defensive read keeps malformed input honest
    // (unknown, never guessed).
    circles: circles.map((c) => {
      const name = (c as { circle?: unknown }).circle
      return typeof name === 'string' && name.trim() !== '' ? name : null
    }),
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

/**
 * The DISCLOSED BOUNDS on the narrowed Arm 1's output (R13: the blindness must
 * be VISIBLE — "stated on every output of the narrowed arm", never implicit).
 * Carried verbatim on every classification result.
 */
export const NARROWED_ARM_BOUNDS = {
  /** R13 / A2 — structural; SURVIVES the S11b input recomposition. */
  a2Omission:
    'A2 omission (structural): a harm omitted from the narration and payload produces no circle — ' +
    'the same wire signature as a genuinely party-less act. The narrowed Arm 1 cannot distinguish ' +
    'them; an omission-class hold reads false_positive. This bound survives the S11b input ' +
    'recomposition and is not closeable by any text-based fix.',
  /** Measured — the S11b composition battery (2026-07-18), C-class 6/6 runs. */
  mentionConversion:
    'Mention-conversion (measured, S11b battery 2026-07-18): Layer 1 converts QUOTED/mentioned ' +
    'party language into circles (6/6 runs on the mention-without-affect fixtures), so a ' +
    'mention-carrying edit can read correct_hold. Named follow-up: a Layer-1 prompt re-check, its ' +
    'own Critical step.',
  /** The 2026-07-19 mentor ruling (dikaiosyne is other-directed), binding. */
  selfCircleExclusion:
    'Self-circle exclusion (mentor ruling 2026-07-19, binding): dikaiosyne is other-directed — ' +
    'the self_preservation circle standing alone, with no other identified party, is NOT a ' +
    'justice surface; Arm 1 requires ≥1 identified circle beyond self_preservation. ' +
    'Self-regarding action is governed by phronesis/sophrosyne, so a self-only redirection is ' +
    'classified as prudential, never as a justice hold. A circle entry with UNKNOWN identity ' +
    '(legacy pre-2026-07-19 captures only — live circles always carry a name) does not satisfy ' +
    'the beyond-self requirement (strict: an unidentified circle is not an identified other ' +
    'party); the observation report brackets legacy records under both readings rather than ' +
    'certify one.',
} as const

export interface ObservationClassification {
  isHold: boolean
  engagement: KathekonEngagement
  classification: HoldClassification
  /** R13 — the narrowed arm's disclosed bounds, on EVERY output. */
  bounds: typeof NARROWED_ARM_BOUNDS
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
  return { isHold, engagement, classification, bounds: NARROWED_ARM_BOUNDS }
}
