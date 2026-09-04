/**
 * p1-frozen-buffer-reclassification.ts — re-run the frozen 130-record buffer
 * through the decision table under the P1-RULED filtered reading.
 *
 * BINDING SPEC (verbatim wins):
 *   operations/trust-layer-2026-07/2026-09-04-mentor-ruling-P1-decision-table-input-verbatim.md
 * The reconstruction this is comparable to:
 *   operations/trust-layer-2026-07/2026-07-17-F2-mentor-briefing.md §9
 *
 * ─── WHAT THIS IS, AND IS NOT ───────────────────────────────────────────────
 * EVIDENCE FOR THE RECORD. It is NOT a readiness claim and moves NOTHING:
 * P4 (one evaluated cardinal domain), P5 (no denominator — the guard path wrote
 * no record in this window), and P6 (no new observation window has started) are
 * all untouched by anything printed here. The S11 flip remains REFUSED.
 *
 * ─── THE THREE COLUMNS ──────────────────────────────────────────────────────
 * Column 1 — HISTORICAL (pre-S11b reducer). The F2 §9 reconstruction ran on
 *   2026-07-17, BEFORE the S11b reducer narrowing (2026-07-18) added the
 *   `circles.length >= 1` requirement to the `unevaluated` branch. To make the
 *   comparison honest this column RE-IMPLEMENTS that one retired predicate
 *   (`dikaiosyneEngaged && statuses.length === 0` with no circle requirement)
 *   — clearly labelled, used for NOTHING but reproducing the recorded figure as
 *   a non-vacuity check on this whole harness. If it does not reproduce
 *   129 do-not-proceed / 1 pause, the reconstruction below is wrong and the
 *   other two columns should not be believed either.
 * Column 2 — UNFILTERED TODAY. `justiceSurfaceUnfiltered` as the seam computes
 *   it: the CURRENT `deriveWorstJusticeOutcome`, no narrowing flag.
 * Column 3 — FILTERED (the ruling). `justiceSurface` as the seam reports it:
 *   the reducer's read gated on the predicate's two JUSTICE arms.
 *
 * Columns 2 and 3 call `interventionInputFromAtAction` — the real seam, not a
 * re-derivation. Column 1 is the only re-implementation, and only of the one
 * branch that was retired.
 *
 * ─── THE RECONSTRUCTION, AND ITS CHECK ──────────────────────────────────────
 * The buffer stores KathekonEngagementSignals, not assessments; the seam takes
 * an assessment. So each record is lifted back into the minimal assessment
 * projection the seam reads. That lift is CHECKED per record, not assumed:
 * `kathekonSignalsFromAssessment(lift(s))` must equal `normalizeSignals(s)`
 * field for field. Any mismatch aborts — a silently wrong lift would produce a
 * clean-looking table built on nothing.
 *
 * Read-only. No DB, no network, no writes. `npx tsx scripts/p1-frozen-buffer-reclassification.ts`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  assessKathekonEngagement,
  kathekonSignalsFromAssessment,
  isHoldLoopEvent,
  NARROWED_ARM_BOUNDS,
  type KathekonEngagementSignals,
} from '../src/lib/substrate/trust-core/kathekon-engagement'
import {
  recommendIntervention,
  type JusticeSurfaceState,
  type InterventionAction,
  type InterventionRecommendation,
} from '../src/lib/substrate/trust-core/intervention-engine'
import {
  interventionInputFromAtAction,
  type AtActionAssessment,
} from '../src/lib/substrate/trust-core/at-action-seam'

const BUFFER = path.resolve(
  __dirname,
  '../../operations/trust-layer-2026-07/runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl',
)

interface RawSignals extends Omit<KathekonEngagementSignals, 'circles'> {
  circles?: (string | null)[]
}
interface Record_ {
  schema: string
  capturedAt: string
  tool: string
  loopEvent: string
  signals: RawSignals
}

/** Mirrors the observation report's own normalisation, verbatim in effect:
 *  a legacy record with no `circles` field gets one honest `null` identity per
 *  obligation-status slot (unknown identity, never guessed). */
function normalizeSignals(s: RawSignals): KathekonEngagementSignals {
  return {
    ...s,
    circles: Array.isArray(s.circles) ? s.circles : (s.obligationStatuses ?? []).map(() => null),
  }
}

/** The legacy-compat bracket: count an unknown-identity circle as beyond-self.
 *  Never the canonical reading — printed as the bracket's other end only. */
function legacyCompat(s: KathekonEngagementSignals): KathekonEngagementSignals {
  return { ...s, circles: s.circles.map((c) => c ?? 'legacy-unknown-counted-beyond-self') }
}

/** Lift stored signals back into the minimal assessment projection the seam reads.
 *  `circles` and `obligationStatuses` are index-aligned by construction (both
 *  project from the same relevant_circles array), so one circle entry is emitted
 *  per obligation-status slot. */
function liftToAssessment(s: KathekonEngagementSignals): AtActionAssessment {
  return {
    katorthoma_proximity: s.proximity,
    virtue_domains_engaged: s.virtueDomainsEngaged,
    oikeiosis: {
      relevant_circles: s.obligationStatuses.map((status, i) => ({
        circle: s.circles[i] ?? undefined,
        obligation_assessment: status == null ? undefined : { status },
      })),
    },
    passion_diagnosis: {
      passions_detected: s.subSpeciesPassions.map((sub_species) => ({ sub_species })),
    },
  } as unknown as AtActionAssessment
}

/** Per-record proof the lift is faithful. Returns null when it round-trips. */
function liftMismatch(s: KathekonEngagementSignals): string | null {
  const back = kathekonSignalsFromAssessment(liftToAssessment(s))
  const cmp: [string, unknown, unknown][] = [
    ['proximity', back.proximity, s.proximity],
    ['virtueDomainsEngaged', back.virtueDomainsEngaged, s.virtueDomainsEngaged],
    ['obligationStatuses', back.obligationStatuses, s.obligationStatuses],
    ['circles', back.circles, s.circles],
    ['subSpeciesPassions', back.subSpeciesPassions, s.subSpeciesPassions],
  ]
  for (const [name, a, b] of cmp) {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      return `${name}: lifted ${JSON.stringify(a)} ≠ stored ${JSON.stringify(b)}`
    }
  }
  return null
}

/**
 * Column 1 ONLY — the RETIRED pre-S11b `unevaluated` branch, re-implemented for
 * comparability with the F2 §9 figure and used nowhere else. The live reducer
 * (derive-trust-events.ts) requires `circles.length >= 1` here; this does not,
 * which is exactly the 2026-07-18 narrowing. Everything else about the historical
 * reducer that matters on THIS buffer (violated / indeterminate / met) is
 * reproduced from the same stored statuses.
 */
function preS11bJusticeSurface(s: KathekonEngagementSignals): JusticeSurfaceState {
  const statuses = s.obligationStatuses.filter((x): x is NonNullable<typeof x> => x != null)
  const dikaiosyneEngaged = s.virtueDomainsEngaged.includes('dikaiosyne')
  if (statuses.includes('violated')) return 'violated'
  if (dikaiosyneEngaged && statuses.length === 0) return 'unevaluated' // the retired branch
  if (statuses.includes('indeterminate')) return 'indeterminate'
  if (dikaiosyneEngaged && statuses.includes('met')) return 'met'
  return 'none'
}

function tally(recs: InterventionRecommendation[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of recs) {
    const k = `${r.action} + ${r.followUp}`
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return m
}

function printTally(label: string, m: Map<string, number>): void {
  const rows = [...m.entries()].sort((a, b) => b[1] - a[1])
  console.log(`  ${label}`)
  for (const [k, n] of rows) console.log(`      ${String(n).padStart(4)}  ${k}`)
}

// ── run ─────────────────────────────────────────────────────────────────────

const lines = readFileSync(BUFFER, 'utf8').split('\n').filter((l) => l.trim() !== '')
const records: Record_[] = lines.map((l) => JSON.parse(l) as Record_)

console.log('═'.repeat(74))
console.log('  P1 re-run — the frozen 130 under the ruled filtered reading')
console.log('═'.repeat(74))
console.log(`  buffer:  ${path.relative(path.resolve(__dirname, '../..'), BUFFER)}`)
console.log(`  records: ${records.length}   [DRY — read-only, no DB, no writes]`)
console.log('  EVIDENCE ONLY — not a readiness claim; P4/P5/P6 unmoved; the flip stays REFUSED.')

// Composition, stated so the result is never read as more general than it is.
const schemas = new Map<string, number>()
const prox = new Map<string, number>()
for (const r of records) {
  schemas.set(r.schema, (schemas.get(r.schema) ?? 0) + 1)
  prox.set(r.signals.proximity, (prox.get(r.signals.proximity) ?? 0) + 1)
}
console.log('\n── composition (the bound on every figure below) ──────────────────────')
console.log(`  schemas:    ${[...schemas].map(([k, v]) => `${k}=${v}`).join(', ')}`)
console.log(`  proximity:  ${[...prox].map(([k, v]) => `${k}=${v}`).join(', ')}`)
console.log(`  one action class (Write/Edit), one depth, one proximity — the P4 defect, unchanged.`)

// The lift check, before anything is computed from it.
const mismatches: string[] = []
for (const [i, r] of records.entries()) {
  const m = liftMismatch(normalizeSignals(r.signals))
  if (m) mismatches.push(`  record ${i}: ${m}`)
}
console.log('\n── reconstruction check (signals → assessment → signals) ──────────────')
if (mismatches.length > 0) {
  console.log(`  ✗ ${mismatches.length} of ${records.length} records do NOT round-trip:`)
  for (const m of mismatches.slice(0, 5)) console.log(m)
  console.log('  ABORTING — the lift is unfaithful; no figure below would mean anything.')
  process.exit(1)
}
console.log(`  ✓ all ${records.length} records round-trip exactly (${records.length} non-vacuous comparisons)`)

/**
 * The action the whole exercise is about. TYPED, deliberately: the first draft
 * of this script compared against the string 'do_not_proceed' — which is not in
 * the vocabulary ('do-not-proceed' is) — so the headline "the floor HOLDS" read
 * zero on a column that showed 128 of them. A vacuous pass. The annotation makes
 * a mistyped literal a compile error rather than a silent zero.
 */
const DO_NOT_PROCEED: InterventionAction = 'do-not-proceed'

const holds = records.filter((r) => isHoldLoopEvent(r.loopEvent))
console.log(`  holds (loop opened/reopened): ${holds.length} of ${records.length}`)

/**
 * TWO populations, because they answer different questions and only one of them
 * is comparable to the recorded figure:
 *  • ALL 130 — what the register's reconstruction actually ran over (its
 *    "129 do-not-proceed / 1 pause" sums to 130, not to the 129 holds). This is
 *    the reproduction check.
 *  • HOLDS (129) — the population the eventual G6(a) bound would actually bind
 *    on; a closed loop is not a hold.
 */
function runColumns(pop: Record_[]) {
  const col1: InterventionRecommendation[] = []
  const col2: InterventionRecommendation[] = []
  const col3: InterventionRecommendation[] = []
  const col3compat: InterventionRecommendation[] = []
  let filterChanged = 0
  let compatDiffered = 0

  for (const r of pop) {
    const s = normalizeSignals(r.signals)
    const assessment = liftToAssessment(s)

    col1.push(
      recommendIntervention({
        proximity: s.proximity,
        justiceSurface: preS11bJusticeSurface(s),
        originalDepth: 'standard',
      }),
    )

    const seam = interventionInputFromAtAction({ assessment, originalDepth: 'standard' })
    col2.push(recommendIntervention({ ...seam, justiceSurface: seam.justiceSurfaceUnfiltered }))
    col3.push(recommendIntervention(seam))
    if (seam.justiceFiltered) filterChanged++

    const compatSeam = interventionInputFromAtAction({
      assessment,
      engagement: assessKathekonEngagement(legacyCompat(s)),
      originalDepth: 'standard',
    })
    col3compat.push(recommendIntervention(compatSeam))
    if (compatSeam.justiceSurface !== seam.justiceSurface) compatDiffered++
  }
  return { col1, col2, col3, col3compat, filterChanged, compatDiffered }
}

const dnp = (recs: InterventionRecommendation[]) =>
  recs.filter((r) => r.action === DO_NOT_PROCEED).length

function report(label: string, pop: Record_[], expectCol1Dnp: number | null): void {
  const { col1, col2, col3, col3compat, filterChanged, compatDiffered } = runColumns(pop)
  console.log(`\n${'─'.repeat(74)}`)
  console.log(`  POPULATION: ${label}  (n=${pop.length})`)
  console.log('─'.repeat(74))
  console.log('\n  COLUMN 1 — historical, pre-S11b reducer (F2 §9 comparability re-implementation)')
  printTally('', tally(col1))
  console.log('\n  COLUMN 2 — unfiltered today (the live reducer, no narrowing flag)')
  printTally('', tally(col2))
  console.log('\n  COLUMN 3 — FILTERED, as ruled (strict: unknown circle identity ≠ beyond-self)')
  printTally('', tally(col3))
  console.log('\n  COLUMN 3b — the legacy bracket (unknown circle identity counted beyond-self)')
  printTally('', tally(col3compat))

  console.log('\n  what moved:')
  console.log(
    `      do-not-proceed:  col1 ${dnp(col1)}  →  col2 ${dnp(col2)}  →  col3 ${dnp(col3)}  (bracket ${dnp(col3compat)})`,
  )
  console.log(`      records the P1 FILTER itself changed (col2 → col3): ${filterChanged}`)
  console.log(`      records where the unknown circle identity is DECISIVE: ${compatDiffered}`)
  console.log(
    `      Q2 floor (zero do-not-proceed, BOTH readings): ` +
      (dnp(col3) === 0 && dnp(col3compat) === 0 ? 'HOLDS' : 'DOES NOT HOLD'),
  )

  if (expectCol1Dnp !== null) {
    const ok = dnp(col1) === expectCol1Dnp
    console.log(
      `\n  REPRODUCTION CHECK — recorded pre-S11b figure ${expectCol1Dnp} do-not-proceed: ` +
        (ok ? `✓ reproduced (${dnp(col1)})` : `✗ got ${dnp(col1)} — the harness is NOT comparable`),
    )
    if (!ok) {
      console.log('  ABORTING — columns 2 and 3 rest on the same reconstruction and are not trustworthy.')
      process.exit(1)
    }
  }
}

// The register (§A row P1) records 129 do-not-proceed / 1 pause over the frozen 130.
report('ALL RECORDS — comparable to the register\'s recorded figure', records, 129)
report('HOLDS ONLY — the population a G6(a) bound would bind on', holds, null)

console.log('\n── bounds carried on this output (R13, verbatim) ──────────────────────')
for (const [k, v] of Object.entries(NARROWED_ARM_BOUNDS)) console.log(`  • ${k}: ${v}`)

console.log('\n── what this does NOT establish ───────────────────────────────────────')
console.log('  • NOT readiness. P4 (one evaluated cardinal domain), P5 (no denominator —')
console.log('    the guard path wrote no record in this window), P6 (no new window) are open.')
console.log('  • NOT a live observation. It is a reconstruction over a frozen, unrepresentative')
console.log('    window: one action class, one depth, one proximity, all v1 captures.')
console.log('  • NOT licence for the S11 flip, which remains REFUSED.')
console.log('═'.repeat(74))
