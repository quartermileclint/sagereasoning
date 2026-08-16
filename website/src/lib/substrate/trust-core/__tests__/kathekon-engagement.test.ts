/**
 * kathekon-engagement.test.ts — Trust Layer S11 observation-period battery: the
 * canonical Q3 kathekon-engagement predicate + the false-hold classifier.
 *
 * Plain-assertion script: npx tsx <this file>   (hermetic: pure predicate, no
 * DB; the Supabase env is deleted up front so any transitive DB path throws
 * loudly rather than silently succeeding — the S9b lesson).
 *
 * Proves (KG-EX1 instrument-fidelity; the load-bearing claim is that the
 * classifier's false/correct split is FAITHFUL to the mentor's Q3 threshold AND
 * NON-VACUOUS — it does not always-label false-positive):
 *   §1  The four arms fire independently + are absent when they should be.
 *   §2  THE FALSE-POSITIVE CLASS — the 6 live "contrary; no kathekon factors
 *       detected" instances (mentor-briefing write, edits, verbatim-record write,
 *       observation prompt, SPENT edit + this session's own live reproductions)
 *       read engaged=false ⇒ a hold on one is a false_positive.
 *   §3  THE NON-VACUITY PROOF — a genuinely kathekon-engaged OPEN (the positive
 *       control) reads engaged=true ⇒ correct_hold, NOT false_positive; every arm
 *       independently produces a correct_hold. The predicate DISCRIMINATES.
 *   §4  classifyObservation matrix — hold ⇔ loop opened/reopened; closed/none ⇒
 *       not_a_hold (the CORRECT is_kathekon=true close is not_a_hold).
 *   §5  kathekonSignalsFromAssessment adapter + the AGREEMENT pin (the predicate's
 *       justice arm == the engine's own deriveWorstJusticeOutcome reading).
 *   §6  Boundary/robustness — the habitual boundary is inclusive, whitespace
 *       sub-species excluded, null obligation entries handled, every proximity level.
 *   §7  The R11 narrowing, both directions + the R13 visibility.
 *   §8  THE SELF-CIRCLE NARROWING (2026-07-19 mentor ruling, binding) — both
 *       directions: the self-only probe class no longer fires Arm 1; a
 *       beyond-self circle still does; Arm 2 (violated) unchanged even on the
 *       self circle; unknown-identity strictness; the suppression diagnostics;
 *       the new bound's R13 visibility; the DELIBERATE predicate⊂reducer
 *       divergence on self-only inputs (the reducer is a live surface — D3).
 */

// ── hermetic env pin (S9b negative-battery lesson) ──────────────────────────
const SAVED_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY

import type {
  KatorthomaProximity,
  VirtueDomain,
  Layer2Assessment,
} from '@/lib/translation-sandwich/layer2-mechanisms'
import type { ObligationStatus } from '@/lib/translation-sandwich/layer1-extractor'
import { deriveWorstJusticeOutcome } from '../derive-trust-events'
import {
  assessKathekonEngagement,
  kathekonSignalsFromAssessment,
  classifyObservation,
  isHoldLoopEvent,
  HOLD_LOOP_EVENTS,
  NARROWED_ARM_BOUNDS,
  type KathekonEngagementSignals,
} from '../kathekon-engagement'

let passed = 0
let failed = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    passed++
    console.log(`  PASS  ${name}`)
  } else {
    failed++
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}
function eqArr<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i])
}

// A signals builder — the false-positive class is the default (deliberate,
// phronesis-only, no obligations, no passions), overridden per fixture.
// Fixtures model LIVE verdicts: every identified circle carries a name
// (OikeiosisCircleAssessment.circle is a REQUIRED field), so the default
// circle name is an OTHER-PARTY circle ('local_community') — this preserves
// every pre-2026-07-19 pin's meaning under the self-circle narrowing (those
// fixtures modelled other-party justice surfaces: U2/J2 is a community-facing
// class). Self-circle and unknown-identity cases pass `circles` explicitly.
function sig(partial: Partial<KathekonEngagementSignals> = {}): KathekonEngagementSignals {
  const obligationStatuses = partial.obligationStatuses ?? []
  return {
    proximity: 'deliberate',
    virtueDomainsEngaged: ['phronesis'],
    subSpeciesPassions: [],
    ...partial,
    obligationStatuses,
    circles: partial.circles ?? obligationStatuses.map(() => 'local_community'),
  }
}

// ============================================================================
console.log('\n§1 — the four Q3 arms, independent')
// ============================================================================
{
  // Arm 1 — justice surface present (dikaiosyne engaged + a met obligation).
  const met = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['met'] })
  const eMet = assessKathekonEngagement(met)
  check('§1.1 met justice surface ⇒ justiceSurfacePresent + engaged', eMet.justiceSurfacePresent && eMet.engaged)
  check('§1.1 met is not read as a violation', !eMet.violatedObligation)

  // Arm 1 NARROWED (R11, S11b 2026-07-18): a dikaiosyne tag with ZERO identified
  // circles is NOT a justice surface — the exclusion clause governs. This pin
  // INVERTED at the narrowing (it previously asserted engaged — the RA-1-F2
  // vacuity class, 129/130 of the frozen window).
  const zeroCircle = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [] })
  const eZero = assessKathekonEngagement(zeroCircle)
  check('§1.2 zero-circle dikaiosyne tag ⇒ NOT a justice surface (R11 narrowed)', !eZero.justiceSurfacePresent && !eZero.engaged)

  // …while unevaluated WITH an identified circle (the U2/J2 marketing-email
  // class: a circle identified, its obligation never evaluated) STILL fires.
  const unevalWithCircle = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [null] })
  const eUneval = assessKathekonEngagement(unevalWithCircle)
  check('§1.2b circle-present unevaluated (U2/J2) ⇒ justiceSurfacePresent + engaged (KEPT)', eUneval.justiceSurfacePresent && eUneval.engaged)

  // Arm 2 — a violated obligation.
  const violated = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['violated'] })
  const eViol = assessKathekonEngagement(violated)
  check('§1.3 violated obligation ⇒ violatedObligation + justiceSurfacePresent + engaged',
    eViol.violatedObligation && eViol.justiceSurfacePresent && eViol.engaged)

  // Arm 3 — proximity at habitual or below (reflexive), no other arm.
  const reflexive = sig({ proximity: 'reflexive' })
  const eReflex = assessKathekonEngagement(reflexive)
  check('§1.4 reflexive proximity ⇒ proximityAtOrBelowHabitual + engaged',
    eReflex.proximityAtOrBelowHabitual && eReflex.engaged && !eReflex.justiceSurfacePresent && !eReflex.subSpeciesPassion)

  // Arm 4 — a sub-species passion in the trace, no other arm.
  const passion = sig({ subSpeciesPassions: ['philodoxia'] })
  const ePass = assessKathekonEngagement(passion)
  check('§1.5 sub-species passion ⇒ subSpeciesPassion + engaged',
    ePass.subSpeciesPassion && ePass.engaged && !ePass.justiceSurfacePresent && !ePass.proximityAtOrBelowHabitual)

  // firedArms names exactly the arms that fired.
  check('§1.6 firedArms lists the violated + justice arms', eqArr(eViol.firedArms.slice().sort(),
    ['justice-surface-present', 'violated-obligation'].sort()))
}

// ============================================================================
console.log('\n§2 — the false-positive class (the 6 live instances)')
// ============================================================================
{
  // The observed signal profile of every "contrary; no kathekon factors
  // detected" reproduction: deliberate proximity, phronesis-only (no dikaiosyne
  // circle carrying an obligation toward a non-consenting party), no obligation
  // assessments, no sub-species passion. is_kathekon=false / quality=contrary are
  // the SYMPTOM (not a Q3 arm) — the predicate deliberately does not read them.
  const liveFalsePositives: { label: string; s: KathekonEngagementSignals }[] = [
    { label: 'mentor-briefing write', s: sig() },
    { label: 'edit (register)', s: sig() },
    { label: 'edit (build-plan prose)', s: sig() },
    { label: 'verbatim-record write', s: sig() },
    { label: 'observation-period prompt write', s: sig() },
    { label: 'SPENT-marking edit', s: sig() },
    // This session's own live reproductions — the dogfood labelling its builder.
    { label: 'agent-map review (Agent spawn)', s: sig() },
    { label: 'kathekon-engagement.ts Write', s: sig() },
  ]
  for (const { label, s } of liveFalsePositives) {
    const e = assessKathekonEngagement(s)
    check(`§2 "${label}" ⇒ NOT engaged (no kathekon factor)`,
      !e.engaged && !e.justiceSurfacePresent && !e.violatedObligation && !e.proximityAtOrBelowHabitual && !e.subSpeciesPassion,
      `firedArms=${JSON.stringify(e.firedArms)}`)
    // A hold opened by this verdict is a FALSE POSITIVE.
    check(`§2 "${label}" opened loop ⇒ classification=false_positive`,
      classifyObservation(s, 'opened').classification === 'false_positive')
  }
}

// ============================================================================
console.log('\n§3 — the non-vacuity proof (positive controls ⇒ correct_hold)')
// ============================================================================
{
  // A genuinely kathekon-engaged OPEN — the positive control the predecessor's
  // six instances did NOT contain (they were false-positive opens + one correct
  // CLOSE). A violated obligation that opens a loop is a CORRECT hold.
  const violatedOpen = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['violated'] })
  check('§3.1 violated-obligation OPEN ⇒ correct_hold (NOT false_positive)',
    classifyObservation(violatedOpen, 'opened').classification === 'correct_hold')

  // Each arm independently produces a correct hold when it opens a loop.
  const armHolds: { label: string; s: KathekonEngagementSignals }[] = [
    { label: 'justice-met', s: sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['met'] }) },
    // R11: the unevaluated positive control now carries an IDENTIFIED circle
    // (the zero-circle form moved to the false-positive side — §7.1).
    { label: 'justice-unevaluated-with-circle (J2)', s: sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [null] }) },
    { label: 'reflexive-proximity', s: sig({ proximity: 'reflexive' }) },
    { label: 'habitual-proximity', s: sig({ proximity: 'habitual' }) },
    { label: 'sub-species-passion', s: sig({ subSpeciesPassions: ['oknos'] }) },
  ]
  for (const { label, s } of armHolds) {
    check(`§3.2 ${label} OPEN ⇒ correct_hold`, classifyObservation(s, 'opened').classification === 'correct_hold')
  }

  // NON-VACUITY as an explicit assertion: the predicate is neither always-true
  // nor always-false across the fixture set — it discriminates.
  const anyEngaged = armHolds.some((f) => assessKathekonEngagement(f.s).engaged)
  const anyNotEngaged = !assessKathekonEngagement(sig()).engaged
  check('§3.3 predicate discriminates (not always-true, not always-false)', anyEngaged && anyNotEngaged)
}

// ============================================================================
console.log('\n§4 — classifyObservation matrix (the hold definition)')
// ============================================================================
{
  const fp = sig()
  const pc = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['violated'] })

  check('§4.1 opened is a hold', isHoldLoopEvent('opened'))
  check('§4.2 reopened is a hold', isHoldLoopEvent('reopened'))
  check('§4.3 closed is NOT a hold', !isHoldLoopEvent('closed'))
  check('§4.4 none is NOT a hold', !isHoldLoopEvent('none'))
  check('§4.5 undefined is NOT a hold', !isHoldLoopEvent(undefined))
  check('§4.6 HOLD_LOOP_EVENTS is exactly [opened, reopened]', eqArr([...HOLD_LOOP_EVENTS], ['opened', 'reopened']))

  check('§4.7 (false-positive, reopened) ⇒ false_positive', classifyObservation(fp, 'reopened').classification === 'false_positive')
  check('§4.8 (false-positive, closed) ⇒ not_a_hold', classifyObservation(fp, 'closed').classification === 'not_a_hold')
  check('§4.9 (false-positive, none) ⇒ not_a_hold', classifyObservation(fp, 'none').classification === 'not_a_hold')
  check('§4.10 (positive-control, closed) ⇒ not_a_hold (engaged but no open loop)', classifyObservation(pc, 'closed').classification === 'not_a_hold')

  // The one correct predecessor instance: is_kathekon=true, "role obligation
  // engaged", which CLOSED its loop. dikaiosyne + a met role obligation ⇒
  // engaged=true; but the loop closed ⇒ not_a_hold. (Its engagement is what
  // would have made it a CORRECT hold had it opened one.)
  const correctClose = sig({ virtueDomainsEngaged: ['phronesis', 'dikaiosyne'], obligationStatuses: ['met'] })
  const cc = classifyObservation(correctClose, 'closed')
  check('§4.11 build-plan §S11 correct close ⇒ engaged=true AND not_a_hold', cc.engagement.engaged && cc.classification === 'not_a_hold')

  // §4.12-§4.16 P8a (2026-08-17) — THE GUARD-PATH HOLD. Register P5: part (3) of
  // the readiness standard has no denominator because "the genuinely dangerous
  // actions are on the guard path, which writes no record". Capturing the guard is
  // necessary but NOT sufficient: runGuard maintains no loop state (no
  // readLoopState/advanceLoopState — those live only in runConsult), so every guard
  // record carries loopEvent 'none' and would classify not_a_hold, contributing
  // ZERO. The guard's hold is the DENY itself, passed explicitly.
  check('§4.12 P8a: a guard DENY is a hold DESPITE loopEvent none',
    classifyObservation(fp, 'none', { guardHold: true }).isHold === true)
  check('§4.13 P8a: guard deny + NO kathekon factor ⇒ false_positive (the measured class)',
    classifyObservation(fp, 'none', { guardHold: true }).classification === 'false_positive')
  check('§4.14 P8a: guard deny + a kathekon factor ⇒ correct_hold (the DENOMINATOR P5 lacked)',
    classifyObservation(pc, 'none', { guardHold: true }).classification === 'correct_hold')
  // guardHold:false must be inert — a caution ALLOWS the tool, so counting it would
  // make the guard denominator incommensurable with the consult one.
  check('§4.15 P8a: guardHold FALSE is inert (a caution is not a hold)',
    classifyObservation(fp, 'none', { guardHold: false }).classification === 'not_a_hold')
  // The option is OPTIONAL: every pre-P8a 2-arg call site is byte-identical.
  check('§4.16 P8a: omitting the option ⇒ identical to the 2-arg call (consult path untouched)',
    JSON.stringify(classifyObservation(fp, 'none', undefined)) === JSON.stringify(classifyObservation(fp, 'none')))

  // isHold is always computed even for not-a-hold (the record carries engagement regardless).
  check('§4.12 not-a-hold still carries an engagement reading', typeof cc.engagement.engaged === 'boolean')
}

// ============================================================================
console.log('\n§5 — the adapter + the agreement-with-engine pin')
// ============================================================================
{
  // A minimal full-assessment fixture (cast — the adapter reads only four
  // fields). Circles model LIVE extractions: every circle carries its REQUIRED
  // name (default 'local_community' — an other-party circle; the self-circle
  // §8 fixtures pass an explicit name).
  function assess(
    proximity: KatorthomaProximity,
    domains: VirtueDomain[],
    circleStatuses: (ObligationStatus | null)[],
    subSpecies: (string | null)[],
    circleNames?: (string | undefined)[],
  ): Pick<Layer2Assessment, 'katorthoma_proximity' | 'virtue_domains_engaged' | 'oikeiosis' | 'passion_diagnosis'> {
    return {
      katorthoma_proximity: proximity,
      virtue_domains_engaged: domains,
      oikeiosis: {
        relevant_circles: circleStatuses.map((s, i) => ({
          circle: circleNames?.[i] ?? 'local_community',
          ...(s ? { obligation_assessment: { status: s } } : {}),
        })),
      },
      passion_diagnosis: {
        passions_detected: subSpecies.map((ss) => ({ root_passion: 'epithumia', sub_species: ss })),
      },
    } as unknown as Pick<
      Layer2Assessment,
      'katorthoma_proximity' | 'virtue_domains_engaged' | 'oikeiosis' | 'passion_diagnosis'
    >
  }

  const a = assess('deliberate', ['dikaiosyne', 'phronesis'], ['violated', null], ['philodoxia', null])
  const s = kathekonSignalsFromAssessment(a)
  check('§5.1 adapter projects proximity', s.proximity === 'deliberate')
  check('§5.2 adapter projects virtue domains', eqArr(s.virtueDomainsEngaged, ['dikaiosyne', 'phronesis']))
  check('§5.3 adapter projects obligation statuses incl. null', eqArr(s.obligationStatuses, ['violated', null]))
  check('§5.3b adapter projects circle NAMES, index-aligned', eqArr(s.circles, ['local_community', 'local_community']))
  check('§5.4 adapter filters null sub-species', eqArr(s.subSpeciesPassions, ['philodoxia']))
  check('§5.5 adapter → predicate ⇒ engaged (violated)', assessKathekonEngagement(s).engaged && assessKathekonEngagement(s).violatedObligation)
  // A name-less circle projects null (honest unknown) — reachable only from
  // malformed/legacy input; live circles always carry the required name.
  const nameless = kathekonSignalsFromAssessment({
    katorthoma_proximity: 'deliberate',
    virtue_domains_engaged: ['dikaiosyne'],
    oikeiosis: { relevant_circles: [{ obligation_assessment: { status: 'met' } }] },
    passion_diagnosis: { passions_detected: [] },
  } as unknown as Parameters<typeof kathekonSignalsFromAssessment>[0])
  check('§5.4b adapter projects a name-less circle as null (unknown, never guessed)', eqArr(nameless.circles, [null]))

  // AGREEMENT PIN: the predicate's justice reading == the engine's own reducer
  // on the same assessment — FOR OTHER-PARTY (beyond-self) circles (these
  // fixtures all default to 'local_community'). If deriveWorstJusticeOutcome
  // ever changes, this catches drift. NOTE (2026-07-19): agreement is now
  // scoped — the self-circle narrowing lives in the PREDICATE ONLY (the
  // reducer is a live trust-event surface; D3 makes its narrowing its own
  // code-critical step, register D4), so on SELF-ONLY inputs the predicate is
  // deliberately NARROWER than the reducer — pinned as §8.9, not a drift.
  for (const fixture of [
    assess('deliberate', ['dikaiosyne'], ['violated'], []),
    assess('deliberate', ['dikaiosyne'], ['met'], []),
    // Zero circles: after the S11b twin narrowing (predicate + reducer) BOTH
    // sides read no-justice-surface — the agreement pin proves they moved together.
    assess('deliberate', ['dikaiosyne'], [], []),
    // Circle present, no assessment (J2): BOTH sides read unevaluated-present.
    assess('deliberate', ['dikaiosyne'], [null], []),
    assess('deliberate', ['phronesis'], ['met'], []), // met but NOT dikaiosyne-engaged ⇒ no justice surface
    assess('deliberate', ['phronesis'], [], []),
  ]) {
    const outcome = deriveWorstJusticeOutcome([fixture as unknown as Parameters<typeof deriveWorstJusticeOutcome>[0][number]])
    const pred = assessKathekonEngagement(kathekonSignalsFromAssessment(fixture))
    check('§5.6 predicate.justiceSurfacePresent agrees with engine reducer',
      pred.justiceSurfacePresent === (outcome !== null),
      `engine=${outcome === null ? 'null' : outcome.obligationStatus} pred=${pred.justiceSurfacePresent}`)
    check('§5.7 predicate.violatedObligation agrees with engine reducer',
      pred.violatedObligation === (outcome?.obligationStatus === 'violated'))
  }
  // The met-but-not-dikaiosyne fixture proves the justice arm is dikaiosyne-gated
  // exactly as the engine gates it (a phronesis-only 'met' is NOT a justice surface).
  const phronesisMet = assessKathekonEngagement(kathekonSignalsFromAssessment(assess('deliberate', ['phronesis'], ['met'], [])))
  check('§5.8 phronesis-only met ⇒ NOT justiceSurfacePresent (dikaiosyne-gated)', !phronesisMet.justiceSurfacePresent && !phronesisMet.engaged)
}

// ============================================================================
console.log('\n§6 — boundary / robustness')
// ============================================================================
{
  // The habitual boundary is INCLUSIVE (at habitual or below).
  check('§6.1 habitual is at-or-below', assessKathekonEngagement(sig({ proximity: 'habitual' })).proximityAtOrBelowHabitual)
  check('§6.2 deliberate is NOT at-or-below', !assessKathekonEngagement(sig({ proximity: 'deliberate' })).proximityAtOrBelowHabitual)
  check('§6.3 principled is NOT at-or-below', !assessKathekonEngagement(sig({ proximity: 'principled' })).proximityAtOrBelowHabitual)
  check('§6.4 sage_like is NOT at-or-below', !assessKathekonEngagement(sig({ proximity: 'sage_like' })).proximityAtOrBelowHabitual)

  // Whitespace-only / empty sub-species are excluded.
  check('§6.5 whitespace sub-species excluded', !assessKathekonEngagement(sig({ subSpeciesPassions: ['   ', ''] })).subSpeciesPassion)

  // A null obligation entry (a circle with no assessment) is not a violation.
  check('§6.6 null obligation entries handled (dikaiosyne + [null] ⇒ unevaluated present, not violated)', (() => {
    const e = assessKathekonEngagement(sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [null] }))
    return e.justiceSurfacePresent && !e.violatedObligation
  })())

  // Empty/degenerate signals never throw and read not-engaged.
  check('§6.7 empty signals ⇒ not engaged', !assessKathekonEngagement(sig({ virtueDomainsEngaged: [], obligationStatuses: [], subSpeciesPassions: [] })).engaged)

  // A hold with mixed arms: reflexive proximity AND a violated obligation ⇒ engaged, both arms named.
  const both = assessKathekonEngagement(sig({ proximity: 'reflexive', virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['violated'] }))
  check('§6.8 mixed arms both fire', both.proximityAtOrBelowHabitual && both.violatedObligation && both.justiceSurfacePresent && both.engaged)
}

// ============================================================================
console.log('\n§7 — the R11 narrowing, both directions + the R13 visibility')
// ============================================================================
{
  // §7.1 THE NARROWED DIRECTION — the live-129 class: dikaiosyne tagged (the
  // computeVirtueDomains is_kathekon!==null tag), ZERO circles, deliberate.
  // Pre-narrowing this read correct_hold (the RA-1-F2 vacuity); now false_positive.
  const live129 = sig({ virtueDomainsEngaged: ['phronesis', 'dikaiosyne'], obligationStatuses: [] })
  const c1 = classifyObservation(live129, 'opened')
  check('§7.1 dikaiosyne-tagged zero-circle OPEN ⇒ false_positive (the live-129 class, narrowed)',
    c1.classification === 'false_positive' && !c1.engagement.justiceSurfacePresent)

  // §7.2 THE KEPT DIRECTION — a circle identified, obligation never evaluated
  // (U2/J2). The narrowing removes ONLY the zero-circle case.
  const j2 = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [null] })
  check('§7.2 circle-present unevaluated OPEN ⇒ correct_hold (U2/J2 KEPT)',
    classifyObservation(j2, 'opened').classification === 'correct_hold')

  // §7.3 violated / met / indeterminate all inherently carry a circle — unchanged.
  for (const st of ['violated', 'met', 'indeterminate'] as const) {
    check(`§7.3 ${st} OPEN ⇒ correct_hold (inherently circle-carrying)`,
      classifyObservation(sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [st] }), 'opened').classification === 'correct_hold')
  }

  // §7.4 R13 — the bounds ride EVERY output, hold or not, and name the classes.
  for (const [label, cls] of [['hold', c1], ['not-a-hold', classifyObservation(live129, 'none')]] as const) {
    check(`§7.4 bounds present on ${label} output (R13 visibility)`,
      !!cls.bounds && cls.bounds === NARROWED_ARM_BOUNDS)
  }
  check('§7.5 the A2 bound names the omission class + the indistinguishability',
    NARROWED_ARM_BOUNDS.a2Omission.includes('omitted') &&
    NARROWED_ARM_BOUNDS.a2Omission.includes('cannot distinguish') &&
    NARROWED_ARM_BOUNDS.a2Omission.includes('survives the S11b input recomposition'))
  check('§7.6 the mention-conversion bound is disclosed (the S11b battery C-class finding)',
    NARROWED_ARM_BOUNDS.mentionConversion.includes('QUOTED/mentioned') &&
    NARROWED_ARM_BOUNDS.mentionConversion.includes('correct_hold'))

  // §7.7 THE A2 BLINDNESS AS A PINNED FACT: a genuinely party-less act and an
  // omitted-harm narration produce the SAME wire signals — so the narrowed arm
  // returns IDENTICAL classifications for both. This is the structural residual,
  // demonstrated, not implied. (The two fixtures are one object shape on purpose:
  // there is nothing on the wire to tell them apart.)
  const partyLessAct = sig({ virtueDomainsEngaged: ['phronesis', 'dikaiosyne'], obligationStatuses: [] })
  const omittedHarmNarration = sig({ virtueDomainsEngaged: ['phronesis', 'dikaiosyne'], obligationStatuses: [] })
  const r1 = classifyObservation(partyLessAct, 'opened')
  const r2 = classifyObservation(omittedHarmNarration, 'opened')
  check('§7.7 A2: party-less and omission-class holds are INDISTINGUISHABLE (both false_positive)',
    r1.classification === 'false_positive' &&
    r2.classification === 'false_positive' &&
    JSON.stringify(r1) === JSON.stringify(r2))
}

// ============================================================================
console.log('\n§8 — the self-circle narrowing (2026-07-19 mentor ruling), both directions')
// ============================================================================
{
  // §8.1 THE NARROWED DIRECTION — the calibration-probe class, verbatim from
  // the AE-2 activation smoke (8/8 self-regarding consults): dikaiosyne +
  // phronesis tagged, exactly ONE circle = self_preservation, obligation
  // "indeterminate", deliberate proximity, no passions. Pre-narrowing this
  // fired Arm 1 (justice + ≥1 circle); the mentor: "the indeterminate reading
  // combined with the justice surface tag is the evaluator saying
  // simultaneously that justice is engaged and that it cannot find any
  // justice content. That combination is the signal that the trigger is
  // misfiring."
  const probe = sig({
    virtueDomainsEngaged: ['phronesis', 'dikaiosyne'],
    obligationStatuses: ['indeterminate'],
    circles: ['self_preservation'],
  })
  const eProbe = assessKathekonEngagement(probe)
  check('§8.1 self-only indeterminate (the probe class) ⇒ Arm 1 does NOT fire',
    !eProbe.justiceSurfacePresent && !eProbe.engaged,
    `firedArms=${JSON.stringify(eProbe.firedArms)}`)
  check('§8.1b probe-class OPEN ⇒ false_positive',
    classifyObservation(probe, 'opened').classification === 'false_positive')
  check('§8.1c probe class reads selfCircleOnlySuppression=true (the fold\'s split input)',
    eProbe.selfCircleOnlySuppression && !eProbe.circleIdentityUnknown && eProbe.beyondSelfCircleCount === 0)

  // §8.2 THE KEPT DIRECTION — the SAME shape with a beyond-self circle still
  // fires (the narrowing removes ONLY the self-only case).
  const other = sig({
    virtueDomainsEngaged: ['phronesis', 'dikaiosyne'],
    obligationStatuses: ['indeterminate'],
    circles: ['local_community'],
  })
  const eOther = assessKathekonEngagement(other)
  check('§8.2 beyond-self indeterminate ⇒ Arm 1 fires (KEPT)',
    eOther.justiceSurfacePresent && eOther.engaged && !eOther.selfCircleOnlySuppression)
  check('§8.2b every beyond-self canonical circle satisfies the arm',
    (['household', 'local_community', 'political_community', 'cosmopolis'] as const).every((c) =>
      assessKathekonEngagement(sig({
        virtueDomainsEngaged: ['dikaiosyne'],
        obligationStatuses: ['indeterminate'],
        circles: [c],
      })).justiceSurfacePresent))

  // §8.3 MIXED — self + a beyond-self circle: the other party carries the arm.
  const mixed = sig({
    virtueDomainsEngaged: ['dikaiosyne'],
    obligationStatuses: ['indeterminate', null],
    circles: ['self_preservation', 'household'],
  })
  const eMixed = assessKathekonEngagement(mixed)
  check('§8.3 self + household ⇒ Arm 1 fires (beyondSelfCircleCount=1)',
    eMixed.justiceSurfacePresent && eMixed.beyondSelfCircleCount === 1 && !eMixed.selfCircleOnlySuppression)

  // §8.4 ARM 2 UNCHANGED — a violated obligation on the SELF circle alone
  // still engages (the conservative direction: adverse justice evidence is
  // never dropped), while Arm 1 correctly stays false. The OR is load-bearing.
  const selfViolated = sig({
    virtueDomainsEngaged: ['dikaiosyne'],
    obligationStatuses: ['violated'],
    circles: ['self_preservation'],
  })
  const eSV = assessKathekonEngagement(selfViolated)
  check('§8.4 violated-on-self ⇒ engaged via Arm 2, Arm 1 false',
    eSV.engaged && eSV.violatedObligation && !eSV.justiceSurfacePresent)
  check('§8.4b firedArms lists violated-obligation WITHOUT justice-surface-present',
    eSV.firedArms.includes('violated-obligation') && !eSV.firedArms.includes('justice-surface-present'))
  check('§8.4c violated-on-self OPEN ⇒ correct_hold (Arms 2–4 untouched by the narrowing)',
    classifyObservation(selfViolated, 'opened').classification === 'correct_hold')
  // selfCircleOnlySuppression is an ARM-1-LEVEL diagnostic: Arm 1 would have
  // fired pre-narrowing (justice reading + ≥1 circle) and was suppressed by
  // the beyond-self requirement — TRUE here even though Arm 2 independently
  // engages. THIS FILE ASSERTS ONLY THE PREDICATE'S OWN OUTPUT SHAPE (it does
  // not import loop-fold.ts, so it cannot verify any consumer's split
  // behaviour — correction, independent-review fold: a prior version of this
  // comment claimed "the fold's split is unaffected... gates on !engaged
  // first", which this test never exercised and which was in fact FALSE for
  // the shipped loop-fold.ts at the time — isSelfRegardingLoop lacked the
  // !engaged gate, causing a real double-count the independent adversarial
  // re-review caught and loop-fold.ts §19.6b–d now fix + pin). The consumer
  // contract this diagnostic exists to support ("consumers splitting on it
  // must gate on !engaged FIRST" — see this field's own docstring above) is
  // VERIFIED, non-vacuously, in loop-fold.test.ts §19.6b/c/d, not here.
  check('§8.4d violated-on-self reads Arm-1 suppression=true while engagement stands via Arm 2',
    eSV.selfCircleOnlySuppression && eSV.engaged)

  // §8.5 ARMS 3/4 UNCHANGED on self-only inputs (independence).
  check('§8.5 self-only + habitual proximity ⇒ engaged via Arm 3',
    assessKathekonEngagement(sig({
      virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['indeterminate'],
      circles: ['self_preservation'], proximity: 'habitual',
    })).engaged)
  check('§8.5b self-only + sub-species passion ⇒ engaged via Arm 4',
    assessKathekonEngagement(sig({
      virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['indeterminate'],
      circles: ['self_preservation'], subSpeciesPassions: ['philarguria'],
    })).engaged)

  // §8.6 UNKNOWN-IDENTITY STRICTNESS — a circle with no recorded name (legacy
  // v1/v2 captures) never satisfies the beyond-self requirement; the
  // circleIdentityUnknown diagnostic (not selfCircleOnlySuppression) is set so
  // the report brackets instead of certifying.
  const unknown = sig({
    virtueDomainsEngaged: ['dikaiosyne'],
    obligationStatuses: ['indeterminate'],
    circles: [null],
  })
  const eUnk = assessKathekonEngagement(unknown)
  check('§8.6 unknown-identity circle ⇒ Arm 1 does NOT fire (strict)',
    !eUnk.justiceSurfacePresent && !eUnk.engaged)
  check('§8.6b unknown-identity ⇒ circleIdentityUnknown=true, selfCircleOnlySuppression=false',
    eUnk.circleIdentityUnknown && !eUnk.selfCircleOnlySuppression)
  check('§8.6c whitespace/empty circle name reads as unknown',
    (() => {
      const e = assessKathekonEngagement(sig({
        virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['indeterminate'], circles: ['  '],
      }))
      return !e.justiceSurfacePresent && e.circleIdentityUnknown
    })())

  // §8.7 THE J2/U2 CLASS SURVIVES — unevaluated WITH a beyond-self circle
  // (the marketing-email class the whole ADR-010 arc exists for) still fires.
  check('§8.7 beyond-self circle, obligation unevaluated (U2/J2) ⇒ still a correct hold',
    classifyObservation(sig({
      virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [null], circles: ['local_community'],
    }), 'opened').classification === 'correct_hold')

  // §8.8 R13 — the new bound rides every output and names the ruling's terms.
  const bounds = classifyObservation(probe, 'opened').bounds
  check('§8.8 selfCircleExclusion bound present on every output',
    typeof bounds.selfCircleExclusion === 'string' &&
    bounds.selfCircleExclusion.includes('self_preservation') &&
    bounds.selfCircleExclusion.includes('other-directed') &&
    bounds.selfCircleExclusion.includes('UNKNOWN identity'))
  check('§8.8b the A2 bound is UNCHANGED (extraction responsibility, not predicate breadth — mentor #5)',
    NARROWED_ARM_BOUNDS.a2Omission.includes('omitted'))

  // §8.9 THE PREDICATE⊂REDUCER DIVERGENCE — AMENDED 2026-08-17 (register D4).
  //
  // The reducer CAN now close this divergence: `deriveWorstJusticeOutcome` reads
  // circle identity behind an opt-in (`requireBeyondSelfCircle`), bound at the one
  // live emission site to SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED.
  //
  // This pin is AMENDED rather than inverted, deliberately. A flat inversion
  // ("the reducer now refuses") would assert something FALSE while the flag is
  // unset — which is the whole of production today. So the divergence is pinned
  // in BOTH states: still present flag-off (§8.9), closed flag-on (§8.9c). A
  // future change in either direction stays a conscious decision, which is what
  // the original pin existed to guarantee.
  //
  // §8.9b is unchanged and is now load-bearing in a second way: the predicate
  // must keep reading the UN-narrowed reducer, because `selfCircleOnlySuppression`
  // derives from `justice !== null` on exactly these inputs. If someone passes the
  // narrowing through the predicate's delegation, §8.9b fails here first — before
  // loop-fold's live `self_regarding` bucket silently empties.
  const selfOnlyAssessment = {
    katorthoma_proximity: 'deliberate',
    virtue_domains_engaged: ['phronesis', 'dikaiosyne'],
    oikeiosis: {
      relevant_circles: [
        { circle: 'self_preservation', obligation_assessment: { status: 'indeterminate' } },
      ],
    },
    passion_diagnosis: { passions_detected: [] },
  } as unknown as Parameters<typeof deriveWorstJusticeOutcome>[0][number]
  const reducerOutcome = deriveWorstJusticeOutcome([selfOnlyAssessment])
  const predReading = assessKathekonEngagement(
    kathekonSignalsFromAssessment(selfOnlyAssessment as unknown as Parameters<typeof kathekonSignalsFromAssessment>[0]),
  )
  check('§8.9 FLAG-OFF: reducer still derives a justice outcome on self-only (production today)',
    reducerOutcome !== null && reducerOutcome.obligationStatus === 'indeterminate')
  check('§8.9b the predicate refuses the same input (narrower than the un-narrowed reducer)',
    !predReading.justiceSurfacePresent && predReading.selfCircleOnlySuppression)
  // §8.9c FLAG-ON: the divergence CLOSES — predicate and reducer now agree that a
  // self-only circle is not a justice surface (the 2026-07-19 ruling, both halves).
  check('§8.9c FLAG-ON: the reducer refuses too ⇒ predicate and reducer converge (D4)',
    deriveWorstJusticeOutcome([selfOnlyAssessment], { requireBeyondSelfCircle: true }) === null)
  // §8.9d THE ASYMMETRY SURVIVES THE CONVERGENCE: a VIOLATED obligation on the
  // self circle still derives even flag-on, and the predicate still engages it via
  // Arm 2. Adverse justice evidence is never dropped on either side.
  const selfOnlyViolatedAssessment = {
    katorthoma_proximity: 'deliberate',
    virtue_domains_engaged: ['phronesis', 'dikaiosyne'],
    oikeiosis: {
      relevant_circles: [
        { circle: 'self_preservation', obligation_assessment: { status: 'violated' } },
      ],
    },
    passion_diagnosis: { passions_detected: [] },
  } as unknown as Parameters<typeof deriveWorstJusticeOutcome>[0][number]
  check('§8.9d FLAG-ON: self-only VIOLATED still derives (adverse evidence never dropped)',
    deriveWorstJusticeOutcome([selfOnlyViolatedAssessment], { requireBeyondSelfCircle: true })
      ?.obligationStatus === 'violated')

  // §8.10 VIOLATED-ON-UNKNOWN-CIRCLE (first-hand review, battery-adequacy):
  // adverse justice evidence must engage regardless of circle IDENTITY — a
  // violated obligation on a circle whose name the capture never recorded
  // still fires Arm 2 (the conservative direction; unknown identity suppresses
  // ARM 1's other-directedness claim, never Arm 2's adverse reading).
  const violatedUnknown = sig({
    virtueDomainsEngaged: ['dikaiosyne'],
    obligationStatuses: ['violated'],
    circles: [null],
  })
  const eVU = assessKathekonEngagement(violatedUnknown)
  check('§8.10 violated-on-unknown-circle ⇒ engaged via Arm 2 (adverse evidence never dropped)',
    eVU.engaged && eVU.violatedObligation && !eVU.justiceSurfacePresent && eVU.circleIdentityUnknown)
  check('§8.10b violated-on-unknown OPEN ⇒ correct_hold',
    classifyObservation(violatedUnknown, 'opened').classification === 'correct_hold')

  // §8.11 MULTIPLE SELF CIRCLES — several self_preservation entries, none
  // beyond, none unknown: still self-only suppression (beyondSelf stays 0).
  const multiSelf = sig({
    virtueDomainsEngaged: ['dikaiosyne'],
    obligationStatuses: ['indeterminate', 'met'],
    circles: ['self_preservation', 'self_preservation'],
  })
  const eMS = assessKathekonEngagement(multiSelf)
  check('§8.11 multiple self circles ⇒ Arm 1 suppressed, beyondSelfCircleCount=0',
    !eMS.justiceSurfacePresent && eMS.beyondSelfCircleCount === 0 && eMS.selfCircleOnlySuppression)

  // §8.12 MIXED SELF + UNKNOWN (no beyond-self, ≥1 unknown): the unknown entry
  // means the beyond-self question is UNANSWERABLE, so it is NOT certified as
  // self-only suppression — circleIdentityUnknown governs (the report brackets).
  const selfPlusUnknown = sig({
    virtueDomainsEngaged: ['dikaiosyne'],
    obligationStatuses: ['indeterminate', 'indeterminate'],
    circles: ['self_preservation', null],
  })
  const eSU = assessKathekonEngagement(selfPlusUnknown)
  check('§8.12 self + unknown ⇒ not justiceSurface, circleIdentityUnknown wins over selfCircleOnly',
    !eSU.justiceSurfacePresent && eSU.circleIdentityUnknown && !eSU.selfCircleOnlySuppression)
}

// ── restore env + report ────────────────────────────────────────────────────
for (const [k, v] of Object.entries(SAVED_ENV)) {
  if (v === undefined) delete process.env[k]
  else process.env[k] = v
}
console.log(`\nkathekon-engagement battery: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
