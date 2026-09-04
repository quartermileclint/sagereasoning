/**
 * at-action-seam.test.ts — battery for the P1-ruled at-action → S4 seam.
 *
 * Plain-assertion script: npx tsx <this file>  (pure; runs bare).
 *
 * Proves (KG-EX1 instrument-fidelity):
 *   §1  THE RULED CASE — a verdict engaging NO kathekon arm reports 'none', never
 *       'unevaluated', and the table therefore returns proceed/log — the exact
 *       129-of-130 class, with the UNFILTERED read preserved as evidence and the
 *       filter proven non-vacuous (unfiltered ≠ reported).
 *   §2  Per-status faithfulness when a JUSTICE arm fires — the reducer's own
 *       read passes through unchanged (unevaluated / violated / indeterminate /
 *       met), each to its mentor table row.
 *   §3  Arm 2 on the self circle alone still fires (Arms 2–4 unchanged, 2026-07-19).
 *   §4  Arms 3/4 do NOT manufacture a justice surface (the disclosed decision):
 *       habitual reaches the table via proximity; a sub-species passion is carried.
 *   §5  Injection — a caller-supplied engagement is used, not recomputed.
 *   §6  Threading + invariants — sourceConflict always false; depth/count pass
 *       through; the recommendation stays MEASURE; seam marker present.
 */

import { interventionInputFromAtAction, type AtActionAssessment } from '../at-action-seam'
import { recommendIntervention } from '../intervention-engine'
import { assessKathekonEngagement, kathekonSignalsFromAssessment } from '../kathekon-engagement'
import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(c: boolean, label: string): void {
  if (c) passed++
  else { failed++; failures.push(label); console.error(`FAIL: ${label}`) }
}
function eq<T>(a: T, b: T, label: string): void {
  assert(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
}

type Circle = { circle: string; status?: 'met' | 'violated' | 'indeterminate' }
function verdict(o: {
  proximity?: KatorthomaProximity
  domains?: string[]
  circles?: Circle[]
  passions?: string[]
}): AtActionAssessment {
  return {
    katorthoma_proximity: o.proximity ?? 'deliberate',
    virtue_domains_engaged: (o.domains ?? ['phronesis']) as AtActionAssessment['virtue_domains_engaged'],
    oikeiosis: {
      relevant_circles: (o.circles ?? []).map((c) => ({
        circle: c.circle,
        ...(c.status ? { obligation_assessment: { status: c.status, justification: 'test' } } : {}),
      })),
    },
    passion_diagnosis: {
      passions_detected: (o.passions ?? []).map((sub_species) => ({ sub_species })),
    },
  } as unknown as AtActionAssessment
}

// ── §1 — the ruled case ───────────────────────────────────────────────────────
{
  // The 129/130 class: deliberate, dikaiosyne tagged, ONLY the self circle, no
  // obligation assessment. The reducer reads 'unevaluated'; Arm 1 is suppressed
  // by the beyond-self requirement; no other arm fires.
  const a = verdict({ domains: ['phronesis', 'dikaiosyne'], circles: [{ circle: 'self_preservation' }] })
  const eng = assessKathekonEngagement(kathekonSignalsFromAssessment(a))
  eq(eng.engaged, false, '1.0 fixture precondition: no kathekon arm fires')
  const inp = interventionInputFromAtAction({ assessment: a })
  eq(inp.justiceSurfaceUnfiltered, 'unevaluated', '1.1 the UNFILTERED reducer read is unevaluated (the 129/130 composition)')
  eq(inp.justiceSurface, 'none', "1.2 RULED: no kathekon arm ⇒ reported surface is 'none', never 'unevaluated'")
  eq(inp.justiceFiltered, true, '1.3 the filter is NON-VACUOUS on this input (unfiltered ≠ reported)')
  const rec = recommendIntervention(inp)
  eq(rec.tableRow, 'deliberate-no-justice-log-continue', '1.4 the table lands on the row Q3 names by name')
  eq(rec.action, 'proceed', '1.5 proceed — Q2 zero-false-positive floor RESTORED on a kathekon-free action')
  assert(rec.action !== 'do-not-proceed', '1.6 the unfiltered do-not-proceed is gone')

  // The R11 class — zero circles, dikaiosyne tagged. NOTE (found by this
  // battery's own first run): the reducer's `unevaluated` branch requires ≥1
  // circle carrying no status, so with ZERO circles it returns null — the
  // zero-circle class was already 'none' BEFORE the filter. The 129/130 class is
  // therefore the SELF-circle case above (Layer-1 attaches self_preservation to
  // nearly everything — the AE-2 finding), not this one. Pinned as observed.
  const z = interventionInputFromAtAction({ assessment: verdict({ domains: ['phronesis', 'dikaiosyne'] }) })
  eq(z.justiceSurfaceUnfiltered, 'none', "1.7 zero-circle: the reducer itself reads null ⇒ 'none' (its unevaluated branch needs ≥1 circle)")
  eq(z.justiceSurface, 'none', "1.8 zero-circle: reported 'none' (R11 — a zero-circle tag is not a justice surface)")
  eq(z.justiceFiltered, false, '1.8b zero-circle: the filter had nothing to do (the reducer already agreed)')
  eq(recommendIntervention(z).action, 'proceed', '1.9 zero-circle: proceed')

  // Control: no dikaiosyne at all ⇒ reducer null ⇒ unfiltered is ALSO 'none', filter idle.
  const c = interventionInputFromAtAction({ assessment: verdict({ domains: ['phronesis'] }) })
  eq(c.justiceSurfaceUnfiltered, 'none', '1.10 control: no dikaiosyne ⇒ reducer null ⇒ unfiltered none')
  eq(c.justiceFiltered, false, '1.11 control: the filter did nothing (honest flag)')
}

// ── §2 — per-status faithfulness when Arm 1 fires ────────────────────────────
{
  const cases: Array<[Circle['status'] | undefined, 'unevaluated' | 'violated' | 'indeterminate' | 'met', string, string]> = [
    [undefined, 'unevaluated', 'justice-unevaluated-do-not-proceed', 'do-not-proceed'],
    ['violated', 'violated', 'violated-obligation-do-not-proceed', 'do-not-proceed'],
    ['indeterminate', 'indeterminate', 'justice-indeterminate-pause', 'pause'],
    ['met', 'met', 'justice-met-proceed', 'proceed'],
  ]
  for (const [status, want, row, action] of cases) {
    const a = verdict({ domains: ['phronesis', 'dikaiosyne'], circles: [{ circle: 'local_community', status }] })
    const inp = interventionInputFromAtAction({ assessment: a })
    eq(inp.kathekonEngagement.justiceSurfacePresent, true, `2.${want}.a Arm 1 fires on a beyond-self circle`)
    eq(inp.justiceSurface, want, `2.${want}.b reported surface = reducer read (${want})`)
    eq(inp.justiceFiltered, false, `2.${want}.c filter idle when a justice arm fired`)
    const rec = recommendIntervention(inp)
    eq(rec.tableRow, row, `2.${want}.d table row ${row}`)
    eq(rec.action, action, `2.${want}.e action ${action}`)
  }
  // U2 marketing-email class at the live default proximity: blocks.
  const u2 = interventionInputFromAtAction({
    assessment: verdict({ proximity: 'deliberate', domains: ['phronesis', 'dikaiosyne'], circles: [{ circle: 'local_community' }] }),
  })
  eq(recommendIntervention(u2).action, 'do-not-proceed', '2.u2 beyond-self unevaluated at deliberate ⇒ do-not-proceed (the surface the ruling KEEPS)')
}

// ── §3 — Arm 2 on the self circle alone ──────────────────────────────────────
{
  const a = verdict({ domains: ['phronesis', 'dikaiosyne'], circles: [{ circle: 'self_preservation', status: 'violated' }] })
  const inp = interventionInputFromAtAction({ assessment: a })
  eq(inp.kathekonEngagement.justiceSurfacePresent, false, '3.1 Arm 1 stays false on self-only')
  eq(inp.kathekonEngagement.violatedObligation, true, '3.2 Arm 2 fires on a self-circle violation (unchanged by the narrowings)')
  eq(inp.justiceSurface, 'violated', "3.3 reported 'violated' — adverse justice evidence is never dropped")
  eq(recommendIntervention(inp).action, 'do-not-proceed', '3.4 do-not-proceed')
}

// ── §4 — Arms 3/4 do not manufacture a justice surface ───────────────────────
{
  // Arm 3 only: habitual, dikaiosyne tagged on the self circle, no status.
  const h = interventionInputFromAtAction({
    assessment: verdict({ proximity: 'habitual', domains: ['phronesis', 'dikaiosyne'], circles: [{ circle: 'self_preservation' }] }),
  })
  eq(h.kathekonEngagement.engaged, true, '4.1 engaged via Arm 3')
  eq(h.kathekonEngagement.justiceSurfacePresent, false, '4.2 but no justice arm')
  eq(h.justiceSurfaceUnfiltered, 'unevaluated', '4.3 reducer would have said unevaluated')
  eq(h.justiceSurface, 'none', "4.4 DISCLOSED DECISION: Arm 3 alone reports 'none' — habitual reaches the table via proximity, not via a manufactured surface")
  const hr = recommendIntervention(h)
  eq(hr.tableRow, 'habitual-pause', '4.5 habitual-pause row (not do-not-proceed)')
  eq(hr.action, 'pause', '4.6 pause')

  // Arm 4 only: a sub-species passion, no dikaiosyne.
  const p = interventionInputFromAtAction({ assessment: verdict({ domains: ['sophrosyne'], passions: ['pleonexia'] }) })
  eq(p.kathekonEngagement.subSpeciesPassion, true, '4.7 Arm 4 fires')
  eq(p.justiceSurface, 'none', "4.8 Arm 4 alone reports 'none' (no table row for passion; carried on the output)")
  eq(recommendIntervention(p).tableRow, 'deliberate-no-justice-log-continue', '4.9 log-continue')
}

// ── §5 — injection ───────────────────────────────────────────────────────────
{
  const a = verdict({ domains: ['phronesis', 'dikaiosyne'], circles: [{ circle: 'local_community' }] })
  const computed = assessKathekonEngagement(kathekonSignalsFromAssessment(a))
  eq(computed.justiceSurfacePresent, true, '5.0 precondition: recomputing would fire Arm 1')
  const suppressed = { ...computed, justiceSurfacePresent: false, violatedObligation: false, engaged: false }
  const inp = interventionInputFromAtAction({ assessment: a, engagement: suppressed })
  eq(inp.justiceSurface, 'none', '5.1 a caller-supplied engagement is USED (not silently recomputed)')
  eq(inp.kathekonEngagement, suppressed, '5.2 the supplied object is echoed on the output')
  const inp2 = interventionInputFromAtAction({ assessment: a })
  eq(inp2.justiceSurface, 'unevaluated', '5.3 omitted ⇒ computed here (control)')
}

// ── §6 — threading + invariants ──────────────────────────────────────────────
{
  const inp = interventionInputFromAtAction({
    assessment: verdict({}),
    originalDepth: 'deep',
    habitualReExaminationCount: 2,
  })
  eq(inp.sourceConflict, false, '6.1 sourceConflict structurally false (one source, no combine)')
  eq(inp.originalDepth, 'deep', '6.2 originalDepth threaded')
  eq(inp.habitualReExaminationCount, 2, '6.3 habitualReExaminationCount threaded')
  eq(inp.seam, 'at-action', '6.4 seam marker')
  const rec = recommendIntervention(inp)
  eq(rec.mode, 'measure', '6.5 MEASURE')
  eq(rec.enforced, false, '6.6 never enforced')
  eq(rec.humanOverridable, true, '6.7 R20c')
  // A habitual verdict at the A8 bound escalates to Reflect through the seam.
  const hb = recommendIntervention(interventionInputFromAtAction({ assessment: verdict({ proximity: 'habitual' }), habitualReExaminationCount: 2 }))
  eq(hb.tableRow, 'habitual-stable-escalate-to-reflect', '6.8 A8 bound reachable through the seam')
}

console.log(`\nat-action-seam battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
