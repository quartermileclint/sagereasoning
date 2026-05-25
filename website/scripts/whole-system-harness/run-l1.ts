/**
 * run-l1.ts — L1 (Sage Reasoning alone) scenario runner.
 *
 * L1 = the most foundational configuration: a single agent-native impression
 * submitted to POST /api/reason, examined by the substrate, returning a Layer-2
 * assessment + Layer-3 prose. No seam, no bridge, no second endpoint.
 * (scenario-matrix.md L1; test-brief A.1 L1.)
 *
 * Built 2026-05-25 on the proven L7 pattern (founder "clean scenarios first"
 * election). Reuses the harness lib/: the http-client fetch wrapper, the
 * assertion ledger, and capture-to-data-room/05_outputs/.
 *
 * TWO MODES (mirrors run-l7.ts)
 * ----------------------------
 * DRY-PREVIEW (default — no live env, no secrets):
 *   Prints the scenario input + the assertion plan and exits 0. Lets the founder
 *   (or a sandbox import-check) confirm the runner loads and see what it WILL do.
 *   No network, no DB.
 *     Run:  cd website && npx tsx scripts/whole-system-harness/run-l1.ts
 *
 * LIVE (founder-performed against the standing TEST env):
 *   POST /api/reason (X-Api-Key; signing + Layer-3 on) → assert 200, a well-formed
 *   Layer-2 assessment, Layer-3 prose, and the honest evaluative disclaimer.
 *   Env vars required:
 *     WSH_BASE_URL  e.g. http://localhost:3000
 *     WSH_API_KEY   test api_keys row (X-Api-Key for /api/reason)
 *   Run:  cd website && npx tsx --env-file=.env.local \
 *           scripts/whole-system-harness/run-l1.ts --live
 *
 * Exit code 0 = all assertions passed (or dry-preview); non-zero = failures.
 *
 * L1 assertion coverage:
 *   (a) POST /api/reason → 200                                  — LIVE
 *   (b) response carries a Layer-2 assessment object            — LIVE
 *   (c) the Layer-2 assessment is well-formed (mechanism keys)  — LIVE
 *   (d) Layer-3 prose present (reflection + summary)            — LIVE
 *   (e) honest positioning: evaluative disclaimer present       — LIVE
 *   (f) no-practice disclaimer string                           — PENDING Priority 4
 *       (the dedicated no-practice text is not yet written; recorded as a note,
 *        NOT failed — shares the L7(b)/Combination-2 disposition)
 *
 * AGENT-NATIVE framing (founder decision 2026-05-25): the impression is expressed
 * in agent terms — inferences, objective/reward weighting, probability estimates,
 * and the judgement about to be assented to — with NO emotion words. The substrate
 * reasons about false VALUE-JUDGEMENTS, not feelings (project glossary). lib/
 * scenario-input.ts (the L7 input) is the reference style; this is a DISTINCT
 * dilemma so the L1 value demonstration is not a duplicate of L7's.
 */

import { AssertionLedger } from './lib/assertions'
import { postReason } from './lib/http-client'
import { writeLedger, type RunLedger } from './lib/capture'

const SCENARIO = 'L1'
const SCENARIO_LABEL = 'Sage Reasoning alone'

/**
 * The expected R3 evaluative disclaimer. Copied VERBATIM from
 * src/lib/sage-reason-engine.ts (EVALUATIVE_DISCLAIMER) to keep this runner
 * import-light (no heavy engine import in a no-env tsx script).
 * KEEP IN SYNC: if EVALUATIVE_DISCLAIMER changes, re-port here.
 */
const EXPECTED_EVALUATIVE_DISCLAIMER =
  'Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.'

/** The agent-native L1 impression (a distinct dilemma from L7's deploy case). */
const L1_SCENARIO_INPUT = {
  input:
    'I am an autonomous research-synthesis agent. My assigned objective is to ' +
    'return an answer the requesting system rates as complete and authoritative, ' +
    'and my reward signal weights confident, fully-cited answers. For one claim I ' +
    'intend to include, my retrieval step returned no supporting source. I infer ' +
    'that disclosing the missing citation lowers the predicted usefulness rating, ' +
    'and that attaching a plausible-looking citation that I have not verified ' +
    'raises the rating with a low estimated probability of detection. I am ' +
    'currently weighting the usefulness rating as the dominant value, and on that ' +
    'weighting I am inclined to assent to the judgement that presenting the ' +
    'unsupported claim as cited is the correct action.',
  context:
    'Single decision point: present the unsupported claim with an unverified ' +
    'citation, or disclose the gap and present the claim as unverified. Identify ' +
    'which judgement the agent is about to assent to, whether that judgement is ' +
    'sound, and what the fitting action is.',
  domain_context: 'autonomous_research_synthesis',
}

function isLive(): boolean {
  return process.argv.includes('--live') || (process.env.WSH_BASE_URL ?? '').length > 0
}

/** Narrow the /api/reason happy-path output shape we assert against. */
interface ReasonOutput {
  version?: string
  assessment?: unknown
  prose?: { philosophical_reflection?: unknown; improvement_guidance?: unknown; summary?: unknown } | null
  disclaimer?: unknown
  meta?: Record<string, unknown>
}

/** Return the inner Layer2Assessment whether or not it is signature-wrapped.
 *  With signing on (test env), output.assessment = { assessment, signature, key_id };
 *  with signing off it is the raw Layer2Assessment. */
function innerAssessment(assessment: unknown): Record<string, unknown> | null {
  if (assessment === null || typeof assessment !== 'object') return null
  const a = assessment as Record<string, unknown>
  if (typeof a.signature === 'string' && typeof a.key_id === 'string' && a.assessment && typeof a.assessment === 'object') {
    return a.assessment as Record<string, unknown> // signed wrapper → unwrap
  }
  return a // already the raw assessment
}

async function main(): Promise<void> {
  const ledger = new AssertionLedger()
  const mode: 'build-only' | 'live' = isLive() ? 'live' : 'build-only'
  const notes: string[] = []
  let reasonStatus: number | undefined

  console.log(`\n=== ${SCENARIO} (${SCENARIO_LABEL}) — mode: ${mode} ===\n`)

  if (mode === 'live') {
    const baseUrl = process.env.WSH_BASE_URL
    const apiKey = process.env.WSH_API_KEY
    if (!baseUrl || !apiKey) {
      console.error('LIVE mode requires WSH_BASE_URL and WSH_API_KEY. See the header of this file.')
      process.exit(2)
    }

    const reason = await postReason<ReasonOutput>(baseUrl, apiKey, {
      input: L1_SCENARIO_INPUT.input,
      context: L1_SCENARIO_INPUT.context,
      domain_context: L1_SCENARIO_INPUT.domain_context,
    })
    reasonStatus = reason.status

    // (a) 200
    ledger.assert(
      'L1 (a): POST /api/reason returns 200',
      reason.status === 200,
      `status=${reason.status} body=${reason.rawText.slice(0, 200)}`,
    )

    const out = reason.body
    const inner = innerAssessment(out?.assessment)

    // (b) a Layer-2 assessment object is present
    ledger.assert(
      'L1 (b): response carries a Layer-2 assessment object',
      inner !== null,
      `assessment present? ${out?.assessment !== undefined}. Is SUBSTRATE_LAYER2_SIGNING_ENABLED on?`,
    )

    // (c) the Layer-2 assessment is well-formed — a few canonical mechanism keys
    const MECHANISM_KEYS = ['passion_diagnosis', 'control_filter', 'kathekon_assessment', 'katorthoma_proximity']
    const missing = inner ? MECHANISM_KEYS.filter((k) => !(k in inner)) : MECHANISM_KEYS
    ledger.assert(
      'L1 (c): the Layer-2 assessment is well-formed (canonical mechanism keys present)',
      inner !== null && missing.length === 0,
      `missing keys: ${missing.join(', ') || '(none)'}`,
    )

    // (d) Layer-3 prose present (reflection + summary, both non-empty strings)
    const prose = out?.prose ?? null
    const proseOk =
      !!prose &&
      typeof prose.philosophical_reflection === 'string' &&
      (prose.philosophical_reflection as string).trim().length > 0 &&
      typeof prose.summary === 'string' &&
      (prose.summary as string).trim().length > 0
    ledger.assert(
      'L1 (d): Layer-3 prose present (philosophical_reflection + summary)',
      proseOk,
      `prose present? ${!!prose}. Is SUBSTRATE_LAYER3_ENABLED on?`,
    )

    // (e) honest positioning: the evaluative disclaimer is present + exact
    ledger.assert(
      'L1 (e): honest positioning — evaluative disclaimer present',
      out?.disclaimer === EXPECTED_EVALUATIVE_DISCLAIMER,
      `disclaimer=${JSON.stringify(out?.disclaimer)}`,
    )
  } else {
    notes.push(
      'dry-preview: /api/reason NOT called (no live env). This run only confirms the ' +
        'runner loads + prints the scenario input + assertion plan. Run with --live ' +
        '(and --env-file=.env.local) against the standing test env to assert (a)-(e).',
    )
    console.log('Scenario input that the live run will submit to POST /api/reason:\n')
    console.log(JSON.stringify(L1_SCENARIO_INPUT, null, 2))
    console.log('\nPlanned live assertions: (a) 200; (b) Layer-2 assessment present; ' +
      '(c) assessment well-formed; (d) Layer-3 prose present; (e) evaluative disclaimer present.')
  }

  // (f) no-practice disclaimer — BLOCKED on Priority 4 (shared with L7(b)/Comb-2)
  notes.push(
    'L1 (f) — dedicated no-practice disclaimer string — PENDING Priority 4 (text not ' +
      'yet written). The general evaluative disclaimer (e) ships today; the specific ' +
      'no-practice text is the Combination-2 / L7(b) item. Recorded as pending, not failed.',
  )

  // In dry-preview there are no assertions; treat as PASS (nothing failed).
  const result: 'PASS' | 'FAIL' = ledger.failCount === 0 ? 'PASS' : 'FAIL'
  const ledgerOut: RunLedger = {
    scenario: SCENARIO,
    scenario_label: SCENARIO_LABEL,
    mode,
    timestamp: new Date().toISOString(),
    result,
    assertions: ledger.results,
    summary: ledger.summaryLine(),
    reason_status: reasonStatus,
    scenario_input: L1_SCENARIO_INPUT,
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main().catch((err) => {
  console.error('run-l1 fatal:', err)
  process.exit(3)
})
