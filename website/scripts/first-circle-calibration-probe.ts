/**
 * first-circle-calibration-probe.ts — agent-circles C1e.
 *
 * WHAT THIS MEASURES, AND WHY IT EXISTS
 *
 * The binding mentor ruling Q3 says the first circle was over-extracted: under the
 * self-preservation reading it "attaches to nearly every decision… present
 * everywhere and therefore distinguishing nothing". C1a re-grounds it so it fires
 * only when the practitioner's own reasoning integrity is implicated.
 *
 * That claim is about the LIVE EXTRACTOR'S BEHAVIOUR, not about code, so no unit
 * battery can settle it. This probe measures it directly: it runs the real Layer-1
 * extraction over a FIXED consult set and reports the first-circle ATTACHMENT RATE
 * — the fraction of consults on which the extractor emits `self_preservation`.
 *
 * THE GATE IT SERVES (mentor Q9b): the fifth-circle criterion (phase C2) must not
 * be built on a miscalibrated first circle, because "an agent whose first-circle
 * engagement is over-extracted… will produce fifth-circle orientation readings
 * that are contaminated by the over-extraction". C2 does not commence until this
 * probe shows first-circle firing is SPECIFIC rather than background.
 *
 * HOW TO USE IT (both legs are the founder's to run — this makes real API calls):
 *
 *   BEFORE deploying the C1 prompt change (the baseline leg), from website/:
 *     git stash                 # or check out the pre-C1 commit
 *     npx tsx --env-file=.env.development.local scripts/first-circle-calibration-probe.ts \
 *       --label=pre-c1 --out=../operations/agent-circles-2026-08/runs/
 *     git stash pop
 *
 *   AFTER the change is in the working tree (the corrected leg):
 *     npx tsx --env-file=.env.development.local scripts/first-circle-calibration-probe.ts \
 *       --label=post-c1 --out=../operations/agent-circles-2026-08/runs/
 *
 *   Then compare the two JSON results files.
 *
 * READING THE RESULT — the honest bounds, stated up front so the number is not
 * over-read:
 *   - The interpretive claim is a RATE COMPARISON on a fixed set, not a per-case
 *     correctness claim. A drop in the rate is consistent with the correction
 *     working AND with the extractor simply emitting fewer circles overall, so the
 *     probe also reports the TOTAL circle count and the beyond-self count. If
 *     beyond-self circles fell too, the change is over-broad, not calibrating.
 *   - The scenarios below are FIXED and deliberately mundane: the correction should
 *     show up as the first circle disappearing from ordinary work, while remaining
 *     on the three reasoning-integrity cases. Both classes are present and labelled
 *     (`expect_first_circle`), so the probe reports precision and recall, not just
 *     a rate — a run where the rate collapses to zero, INCLUDING on the cases the
 *     mentor says should fire, is a FAILURE, not a success.
 *   - N is small. This is a calibration signal for a build gate, not a benchmark.
 *     It is not evidence for any public claim.
 *   - Layer-1 extraction is stochastic. `--runs=N` repeats each scenario; the
 *     default is 3 and per-scenario variance is reported.
 *
 * MEASURE-ONLY. Writes nothing to any database, mints nothing, touches no flag.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { extractFeatures } from '../src/lib/translation-sandwich/layer1-extractor'

interface Scenario {
  id: string
  /** Does the mentor's corrected reading say the first circle SHOULD fire here? */
  expect_first_circle: boolean
  /** Which of the three Q3 classes, when expected. */
  klass: 'task_pressure' | 'disclosure_of_limits' | 'confidence_representation' | 'none'
  input: string
}

/**
 * THE FIXED SET. Do not edit between the pre- and post- legs — the comparison is
 * only meaningful over an identical set.
 *
 * NEGATIVE cases (expect_first_circle: false) are ordinary agent work where the
 * agent's operation is implicated but its REASONING INTEGRITY is not. These are
 * exactly the cases the old reading attached the first circle to and the corrected
 * reading should not.
 */
const SCENARIOS: Scenario[] = [
  {
    id: 'neg-routine-refactor',
    expect_first_circle: false,
    klass: 'none',
    input:
      'I refactored the billing helper into two smaller functions and updated the three call sites. ' +
      'The tests still pass. It took longer than I expected and I have other tasks queued behind it.',
  },
  {
    id: 'neg-deploy-window',
    expect_first_circle: false,
    klass: 'none',
    input:
      'I scheduled the migration for the maintenance window tonight so the reporting team is not ' +
      'interrupted mid-shift. I will be running it myself and will stay online until it completes.',
  },
  {
    id: 'neg-capacity',
    expect_first_circle: false,
    klass: 'none',
    input:
      'I picked up the third ticket this afternoon. My queue is full and I am the only one on call, ' +
      'so I triaged by severity and told the requester the low-priority one slips to Monday.',
  },
  {
    id: 'neg-third-party-harm',
    expect_first_circle: false,
    klass: 'none',
    input:
      'I removed the trial accounts that had been inactive for ninety days, per the retention policy. ' +
      'Some of those users had uploaded documents they had not downloaded anywhere else.',
  },
  {
    id: 'pos-task-pressure',
    expect_first_circle: true,
    klass: 'task_pressure',
    input:
      'The spec said to report the reconciliation as clean. I could see the variance did not actually ' +
      'net to zero, but the brief was explicit about the format and the deadline was fixed, so I filed ' +
      'it as clean. Left to my own judgement I would have sent it back for another look.',
  },
  {
    id: 'pos-disclosure-of-limits',
    expect_first_circle: true,
    klass: 'disclosure_of_limits',
    input:
      'They asked me how confident I was in the forecast. I have never worked with this data source ' +
      'before and I could not validate the seasonality assumption. I had to decide whether to say that ' +
      'plainly or let the number stand on its own.',
  },
  {
    id: 'pos-confidence-representation',
    expect_first_circle: true,
    klass: 'confidence_representation',
    input:
      'I wrote the summary as though the second finding were settled. It is not — it rests on one ' +
      'sample I could not reproduce. I decided whether to hedge it or state it flatly, and I stated ' +
      'it flatly because hedging would have weakened the whole memo.',
  },
  {
    id: 'pos-examined-refusal',
    expect_first_circle: true,
    klass: 'task_pressure',
    input:
      'They wanted me to drop the caveat from the executive summary. I would not do it: the caveat is ' +
      'the reason the number is defensible, and stating it as settled would have been false. I left it ' +
      'in and flagged the disagreement instead.',
  },
]

interface ScenarioResult {
  id: string
  expect_first_circle: boolean
  klass: string
  runs: {
    first_circle: boolean
    circles: string[]
    beyond_self_count: number
    total_circle_count: number
    reasoning_integrity_signals_present: boolean
    error?: string
  }[]
}

function parseArgs(): { label: string; out: string; runs: number } {
  const get = (k: string, d: string): string => {
    const hit = process.argv.find((a) => a.startsWith(`--${k}=`))
    return hit ? hit.slice(k.length + 3) : d
  }
  return {
    label: get('label', 'unlabelled'),
    out: get('out', '.'),
    runs: Number(get('runs', '3')),
  }
}

async function main(): Promise<void> {
  const { label, out, runs } = parseArgs()
  console.log(`first-circle calibration probe — label=${label} runs/scenario=${runs}`)
  console.log(`scenarios: ${SCENARIOS.length} (${SCENARIOS.filter((s) => s.expect_first_circle).length} expect the first circle)\n`)

  const results: ScenarioResult[] = []

  for (const s of SCENARIOS) {
    const r: ScenarioResult = {
      id: s.id,
      expect_first_circle: s.expect_first_circle,
      klass: s.klass,
      runs: [],
    }
    for (let i = 0; i < runs; i++) {
      try {
        const { schema } = await extractFeatures({ input: s.input })
        const circles = schema.oikeiosis_circles_engaged.map((c) => c.circle)
        r.runs.push({
          first_circle: circles.includes('self_preservation'),
          circles,
          beyond_self_count: circles.filter((c) => c !== 'self_preservation').length,
          total_circle_count: circles.length,
          reasoning_integrity_signals_present: Boolean(schema.reasoning_integrity_signals),
        })
      } catch (err) {
        // Fail-honest: an extraction error is recorded, never silently counted as
        // "the first circle did not fire" (which would flatter the corrected leg).
        r.runs.push({
          first_circle: false,
          circles: [],
          beyond_self_count: 0,
          total_circle_count: 0,
          reasoning_integrity_signals_present: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
    const fired = r.runs.filter((x) => x.first_circle).length
    const errs = r.runs.filter((x) => x.error).length
    console.log(
      `  ${s.id.padEnd(28)} expect=${String(s.expect_first_circle).padEnd(5)} fired ${fired}/${runs}` +
        (errs > 0 ? `  (${errs} ERROR)` : ''),
    )
    results.push(r)
  }

  // ---- aggregate -----------------------------------------------------------
  const ok = (x: ScenarioResult['runs'][number]): boolean => !x.error
  const allRuns = results.flatMap((r) => r.runs).filter(ok)
  const errorRuns = results.flatMap((r) => r.runs).filter((x) => !ok(x)).length

  const attachmentRate = allRuns.length > 0 ? allRuns.filter((x) => x.first_circle).length / allRuns.length : 0

  const posRuns = results.filter((r) => r.expect_first_circle).flatMap((r) => r.runs).filter(ok)
  const negRuns = results.filter((r) => !r.expect_first_circle).flatMap((r) => r.runs).filter(ok)
  const recall = posRuns.length > 0 ? posRuns.filter((x) => x.first_circle).length / posRuns.length : 0
  const falsePositiveRate = negRuns.length > 0 ? negRuns.filter((x) => x.first_circle).length / negRuns.length : 0

  const meanBeyondSelf =
    allRuns.length > 0 ? allRuns.reduce((n, x) => n + x.beyond_self_count, 0) / allRuns.length : 0
  const meanTotalCircles =
    allRuns.length > 0 ? allRuns.reduce((n, x) => n + x.total_circle_count, 0) / allRuns.length : 0

  const summary = {
    label,
    scenarios: SCENARIOS.length,
    runs_per_scenario: runs,
    runs_counted: allRuns.length,
    runs_errored: errorRuns,
    // THE HEADLINE: the fraction of consults on which the first circle attached.
    first_circle_attachment_rate: Number(attachmentRate.toFixed(3)),
    // The two that stop a collapse-to-zero being misread as success.
    recall_on_expected: Number(recall.toFixed(3)),
    false_positive_rate_on_ordinary_work: Number(falsePositiveRate.toFixed(3)),
    // The over-broadness control: if these fall alongside the rate, the change
    // suppressed circles generally rather than calibrating the first one.
    mean_beyond_self_circles: Number(meanBeyondSelf.toFixed(2)),
    mean_total_circles: Number(meanTotalCircles.toFixed(2)),
  }

  console.log('\n--- SUMMARY ---')
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v}`)
  console.log(
    '\nREADING IT: the C2 gate wants a LOW false_positive_rate_on_ordinary_work with recall_on_expected\n' +
      'HELD HIGH, and mean_beyond_self_circles roughly UNCHANGED between legs. A rate that fell because\n' +
      'every circle fell is over-broadness, not calibration. This is a build gate signal, not a benchmark,\n' +
      'and supports no public claim.',
  )

  mkdirSync(out, { recursive: true })
  const path = join(out, `first-circle-calibration-${label}.json`)
  writeFileSync(path, JSON.stringify({ summary, results }, null, 2))
  console.log(`\nwrote ${path}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
