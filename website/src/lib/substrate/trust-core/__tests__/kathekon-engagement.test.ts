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
function sig(partial: Partial<KathekonEngagementSignals> = {}): KathekonEngagementSignals {
  return {
    proximity: 'deliberate',
    virtueDomainsEngaged: ['phronesis'],
    obligationStatuses: [],
    subSpeciesPassions: [],
    ...partial,
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

  // Arm 1 — unevaluated justice surface (the marketing-email class: dikaiosyne
  // engaged but no obligation evaluated) is STILL a justice surface present.
  const uneval = sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [] })
  const eUneval = assessKathekonEngagement(uneval)
  check('§1.2 unevaluated justice surface ⇒ justiceSurfacePresent + engaged', eUneval.justiceSurfacePresent && eUneval.engaged)

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
    { label: 'justice-unevaluated', s: sig({ virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: [] }) },
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

  // isHold is always computed even for not-a-hold (the record carries engagement regardless).
  check('§4.12 not-a-hold still carries an engagement reading', typeof cc.engagement.engaged === 'boolean')
}

// ============================================================================
console.log('\n§5 — the adapter + the agreement-with-engine pin')
// ============================================================================
{
  // A minimal full-assessment fixture (cast — the adapter reads only four fields).
  function assess(
    proximity: KatorthomaProximity,
    domains: VirtueDomain[],
    circleStatuses: (ObligationStatus | null)[],
    subSpecies: (string | null)[],
  ): Pick<Layer2Assessment, 'katorthoma_proximity' | 'virtue_domains_engaged' | 'oikeiosis' | 'passion_diagnosis'> {
    return {
      katorthoma_proximity: proximity,
      virtue_domains_engaged: domains,
      oikeiosis: {
        relevant_circles: circleStatuses.map((s) =>
          s ? { obligation_assessment: { status: s } } : {},
        ),
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
  check('§5.4 adapter filters null sub-species', eqArr(s.subSpeciesPassions, ['philodoxia']))
  check('§5.5 adapter → predicate ⇒ engaged (violated)', assessKathekonEngagement(s).engaged && assessKathekonEngagement(s).violatedObligation)

  // AGREEMENT PIN: the predicate's justice reading == the engine's own reducer on
  // the same assessment. If deriveWorstJusticeOutcome ever changes, this catches drift.
  for (const fixture of [
    assess('deliberate', ['dikaiosyne'], ['violated'], []),
    assess('deliberate', ['dikaiosyne'], ['met'], []),
    assess('deliberate', ['dikaiosyne'], [], []),
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

// ── restore env + report ────────────────────────────────────────────────────
for (const [k, v] of Object.entries(SAVED_ENV)) {
  if (v === undefined) delete process.env[k]
  else process.env[k] = v
}
console.log(`\nkathekon-engagement battery: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
