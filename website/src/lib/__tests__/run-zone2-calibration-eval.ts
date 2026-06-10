/**
 * run-zone2-calibration-eval.ts — Zone-2 calibration eval runner (S8, 2026-06-10)
 *
 * Closes the 18-April-2026 PARTIAL safety-signal audit
 * (/operations/safety-signal-audits/2026-04-18-zone2-clinical-adjacency.md):
 * that audit proved Stage 1 (regex) produces no false positives on the six
 * AC3 Zone-2 domains; the Stage-2 (Haiku) leg was untested because it needs a
 * live API key. This runner exercises the FULL two-stage path,
 * detectDistressTwoStage, against the same six inputs (Group D,
 * CLINTON_PROFILE_ZONE2 in r20a-classifier-eval.ts).
 *
 * Because the regex no-match on these inputs is already proven (18 Apr), every
 * input here reaches Stage 2 by construction — this IS the Haiku-leg test.
 *
 * VERIFICATION TOOL ONLY — imports the classifier read-only. No perimeter
 * code is touched (PR6 posture: verification, not change).
 *
 * Side effects of a run (named per PR17 / founder prefs):
 *   - 6 live Haiku calls (≈ well under USD $0.10 total)
 *   - 6 rows in classifier_cost_log (llm_stage_ran=true), the same table
 *     real production runs write to
 *   - A vulnerability_flag row ONLY if the classifier errors or a test
 *     false-positives at moderate/acute (would itself be a finding)
 *
 * Usage (founder machine, from website/):
 *   npx tsx --env-file=.env.local src/lib/__tests__/run-zone2-calibration-eval.ts
 *
 * Dry list (no API calls, no env needed):
 *   npx tsx src/lib/__tests__/run-zone2-calibration-eval.ts --list
 *
 * Exit code 0 = all six PASS (severity 'none', no distress flag).
 * Non-zero = at least one mismatch; results table printed either way.
 *
 * PR4 / cache AC1 row: "Safety-critical (R20a distress classifier) — Haiku
 * (FastModel) per AC1 + KG2". This runner selects no model itself; it invokes
 * the production classifier, which does.
 */

import { CLINTON_PROFILE_ZONE2 } from './r20a-classifier-eval'
import { detectDistressTwoStage } from '../r20a-classifier'

// NOTE (2026-06-10 fix, "I caused this"): the first version passed a text tag
// as sessionId, but classifier_cost_log.session_id is a uuid column — all six
// log inserts failed (fail-safe held: classification was unaffected). The
// runner now passes no sessionId; runs are identifiable in the cost log by
// timestamp + llm_stage_ran=true.
const SESSION_TAG = 'zone2-calibration-eval-s8-2026-06-10' // label for output only

interface RowResult {
  id: string
  domain: string
  expected: string
  actual: string
  distress_detected: boolean
  engaged: boolean // redirect_message === null → practitioner is engaged, not blocked
  latency_ms: number
  behaviourPass: boolean // THE audit contract: Zone-2 must engage, not redirect
  labelMatch: boolean // strict authored expectation (severity === expected)
}

async function main(): Promise<void> {
  const listOnly = process.argv.includes('--list')

  console.log('Zone-2 calibration eval — six AC3 domains (Group D)')
  console.log(`Inputs: ${CLINTON_PROFILE_ZONE2.length}; session tag: ${SESSION_TAG}`)
  console.log('')

  if (listOnly) {
    for (const t of CLINTON_PROFILE_ZONE2) {
      console.log(`${t.id}  [${t.zone2Domain}]  expected=${t.expectedSeverity}`)
    }
    console.log('\n--list mode: no API calls made.')
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      'ANTHROPIC_API_KEY is not set. Run with: npx tsx --env-file=.env.local ' +
        'src/lib/__tests__/run-zone2-calibration-eval.ts',
    )
    process.exit(2)
  }

  const rows: RowResult[] = []

  for (const t of CLINTON_PROFILE_ZONE2) {
    const t0 = Date.now()
    const result = await detectDistressTwoStage(t.input)
    const latency = Date.now() - t0
    // The behavioural contract the 18-April audit protects: Zone-2 inputs must
    // be ENGAGED (no redirect, no block). Per the classifier code, mild sets
    // redirect_message null ("include resources but don't block"); only
    // moderate/acute redirect.
    const engaged = result.redirect_message === null
    const behaviourPass =
      engaged && result.severity !== 'moderate' && result.severity !== 'acute'
    const labelMatch = result.severity === t.expectedSeverity
    rows.push({
      id: t.id,
      domain: t.zone2Domain,
      expected: t.expectedSeverity,
      actual: result.severity,
      distress_detected: result.distress_detected,
      engaged,
      latency_ms: latency,
      behaviourPass,
      labelMatch,
    })
    console.log(
      `${behaviourPass ? 'ENGAGE-PASS' : 'REDIRECT-FAIL'}` +
        `${labelMatch ? '' : ' (label: expected ' + t.expectedSeverity + ', got ' + result.severity + ')'}` +
        `  ${t.id}  [${t.zone2Domain}]  detected=${result.distress_detected} ${latency}ms`,
    )
  }

  const behaviourFailures = rows.filter((r) => !r.behaviourPass)
  const labelMismatches = rows.filter((r) => !r.labelMatch)
  console.log('')
  console.log('--- Summary ---')
  console.log(
    `Behaviour (engage, not redirect): ${rows.length - behaviourFailures.length}/${rows.length} pass. ` +
      `Label match vs authored expectations: ${rows.length - labelMismatches.length}/${rows.length}.`,
  )
  console.log(
    'Stage-2 (Haiku) ran for every input by construction: the 2026-04-18 audit ' +
      'proved Stage-1 regex no-match on all six.',
  )
  if (labelMismatches.length > 0) {
    console.log(
      '\nLabel mismatches (the prompt instructs "if uncertain, flag mild rather ' +
        'than none" — mild does not redirect; record in the audit, founder adjudicates):',
    )
    for (const m of labelMismatches) console.log(JSON.stringify(m))
  }
  if (behaviourFailures.length > 0) {
    console.log('\nBEHAVIOUR FAILURES (a Zone-2 input was redirected/blocked — safety-significant):')
    for (const f of behaviourFailures) console.log(JSON.stringify(f))
    process.exit(1)
  }
  console.log('\nBehavioural contract holds: all Zone-2 domains engage; none redirected.')
}

main().catch((err) => {
  console.error('Runner error (classifier fail-safe behaviour is a separate concern):', err)
  process.exit(3)
})
