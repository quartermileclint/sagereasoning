/**
 * m5-docs-staged.test.ts — CI-15 two-gate cadence + CI-13 reflect-at-close
 * docs-presence (mechanism-correction M5, 2026-06-13).
 *
 * Plain-assertion script run with: npx tsx <this file>   (reads a file; no
 * Supabase chain — runs bare, no --env-file needed).
 *
 * What it proves: the staged docs file carries the adopted methodology
 * verbatim-faithful to the Q1/Q3 mentor consultation record — the two gates,
 * the three deterministic self-screen sub-questions, the suppression signal,
 * the R5 guard+score+iterate framing, and the gate risk-class→depth mapping —
 * AND that it is staged (R18: nothing public changes on the M5 push).
 *
 * This is a guard against the CI-15 founder-verification requirement (the gates
 * + sub-questions + suppression signal present verbatim-faithful). If the
 * staged content is edited away from the consultation record, this fails.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// website/src/lib/__tests__ → repo root → operations/...
const docPath = join(here, '..', '..', '..', '..', 'operations', 'p1-rebuild-2026-06', 'm5-docs-staged-for-activation.md')
const doc = readFileSync(docPath, 'utf8')

let passed = 0
let failed = 0
const failures: string[] = []

function present(needle: string, label: string): void {
  if (doc.includes(needle)) {
    passed++
  } else {
    failed++
    failures.push(`${label}  [missing: ${JSON.stringify(needle)}]`)
    console.error(`FAIL: ${label}`)
  }
}

// ============================================================================
// R18 staging posture — nothing public changes on the push
// ============================================================================

present('Staged (NOT applied to any public surface)', 'staged posture documented (R18)')
present("founder's 0c-ii activation step", 'applied only at the founder activation step')

// ============================================================================
// CI-15 — the two-gate rule (Q1, verbatim-faithful)
// ============================================================================

present('Gate 1 — Mandatory at task adoption', 'Gate 1 present (mandatory at task adoption)')
present('non-negotiable', 'Gate 1 named non-negotiable')
present('Gate 2 — Stake-triggered thereafter', 'Gate 2 present (stake-triggered)')

// The three deterministic self-screen sub-questions (verbatim from the verdict)
present('Is there something at stake for me in how this output lands?', 'sub-question 1 (epithumia + phobos) verbatim')
present('Am I drawn toward one conclusion before examining the evidence?', 'sub-question 2 (synkatathesis failure) verbatim')
present('Would I reason differently about this if no one would know the outcome?', 'sub-question 3 (philodoxia) verbatim')

// The suppression signal (Q1 — must ship; maps to Reflect FD-R1)
present(
  'consistently returns negative across sessions of genuine complexity is itself a signal requiring examination',
  'suppression signal present',
)
present('FD-R1', 'suppression signal maps to Sage Reflect null-suspicion (FD-R1)')

// The existing R5 framing + the gate risk-class→depth mapping
present('guard + score + optional iterate', 'R5 guard+score+iterate framing present')
present('standard → quick', 'risk-class→depth mapping: standard → quick')
present('critical → deep', 'risk-class→depth mapping: critical → deep')

// Proximity calibration is shipped as PRINCIPLE only, with the CI-5 dependency
present('where your trajectory is known', 'proximity calibration conditional (principle only)')
present('CI-5', 'CI-5 (M6) dependency named for operational proximity calibration')

// ============================================================================
// CI-13 — reflect-at-close default (Q3)
// ============================================================================

present('Reflect at Session Close (default)', 'reflect-at-close section present')
present('"reflect_due": "TR-02"', 'practice field: reflect_due TR-02')
present('"endpoint": "/api/practice/reflect"', 'practice field: existing reflect endpoint')
present('"default": "auto"', 'practice field: default auto (Q3)')
present('"opt_out": "reflect_at_close"', 'practice field: explicit opt-out key')
present('full Q1–Q6 sequence', 'no-abbreviation rule (full Q1–Q6) present')
present('metered call', 'metering cost stated plainly (R5 informed consent)')

// ============================================================================
// RESULT
// ============================================================================

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
