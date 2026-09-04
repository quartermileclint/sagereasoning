/**
 * false-hold-observation-report.test.ts — battery for the S11 observation
 * report's classification logic (`normalizeSignals` / `legacyCompatSignals` /
 * the STRICT-vs-legacy-compat bracket / `unknownDecisive` counting).
 *
 * INDEPENDENT-REVIEW FOLD (2026-07-19, LOW, confirmed): this ~40-line block of
 * classification logic — feeding the S11 readiness report a future ENFORCE-
 * flip decision could rest on — shipped with ZERO battery coverage (no test
 * file for `false-hold-observation-report.ts` existed before or after the
 * self-circle narrowing session). Closed here.
 *
 * The script's `main()` runs immediately at import (top-level
 * `main().catch(...)`), so this battery drives it as a SUBPROCESS
 * (`--dry-run`, a synthetic JSONL fixture file) and asserts on stdout — the
 * same pattern `false-hold-capture.test.mjs` uses for its own hook subprocess.
 * This exercises the REAL script end-to-end, not a re-implementation.
 *
 * Run: npx tsx scripts/__tests__/false-hold-observation-report.test.ts
 */

import { spawnSync } from 'child_process'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

let passed = 0
let failed = 0
function check(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

// ============================================================================
// Fixture — four records, each exercising a distinct classification path:
//   A — v1, legacy, ≥1 obligation status but NO recorded circle identity
//       (mirrors the frozen buffer's one bracket-decisive record): strict
//       reads false_positive (unknown identity never satisfies beyond-self);
//       legacy-compat reads correct_hold (unknown ≡ beyond-self) — DECISIVE.
//   B — v3, a genuine beyond-self circle, violated: correct_hold BOTH ways —
//       not decisive (present as a control: the bracket must not fire here).
//   C — v1, zero-circle (phronesis-only, no obligations): false_positive
//       both ways — not decisive, and circleIdentityUnknown must be FALSE
//       (zero circles ≠ an unknown-identity circle).
//   D — v3, CLOSED (not a hold): must be excluded from the false-hold rate
//       entirely (not_a_hold), regardless of its engagement reading.
// ============================================================================
const RECORDS = [
  {
    schema: 'false-hold-record-v1',
    capturedAt: '2026-07-12T13:15:47.000Z',
    session: 'sess-a',
    tool: 'Edit',
    depth: 'standard',
    loopEvent: 'opened',
    actionPreview: 'legacy record, circle-less capture',
    signals: {
      proximity: 'deliberate',
      virtueDomainsEngaged: ['dikaiosyne'],
      obligationStatuses: ['indeterminate'],
      subSpeciesPassions: [],
      // no `circles` field — the v1 shape.
    },
    kathekon: { isKathekon: true, quality: 'moderate' },
    carriedPrior: false,
  },
  {
    schema: 'false-hold-record-v3',
    capturedAt: '2026-07-19T10:00:00.000Z',
    session: 'sess-b',
    tool: 'Edit',
    depth: 'standard',
    loopEvent: 'opened',
    actionPreview: 'v3, beyond-self circle, violated',
    signals: {
      proximity: 'deliberate',
      virtueDomainsEngaged: ['dikaiosyne'],
      obligationStatuses: ['violated'],
      circles: ['local_community'],
      subSpeciesPassions: [],
    },
    kathekon: { isKathekon: true, quality: 'moderate' },
    carriedPrior: false,
  },
  {
    schema: 'false-hold-record-v1',
    capturedAt: '2026-07-12T14:00:00.000Z',
    session: 'sess-c',
    tool: 'Write',
    depth: 'standard',
    loopEvent: 'opened',
    actionPreview: 'legacy record, zero circles',
    signals: {
      proximity: 'deliberate',
      virtueDomainsEngaged: ['phronesis'],
      obligationStatuses: [],
      subSpeciesPassions: [],
    },
    kathekon: { isKathekon: false, quality: 'contrary' },
    carriedPrior: false,
  },
  {
    schema: 'false-hold-record-v3',
    capturedAt: '2026-07-19T11:00:00.000Z',
    session: 'sess-b',
    tool: 'Edit',
    depth: 'standard',
    loopEvent: 'closed',
    actionPreview: 'v3, closed — not a hold regardless of engagement',
    signals: {
      proximity: 'deliberate',
      virtueDomainsEngaged: ['dikaiosyne'],
      obligationStatuses: ['met'],
      circles: ['local_community'],
      subSpeciesPassions: [],
    },
    kathekon: { isKathekon: true, quality: 'moderate' },
    carriedPrior: false,
  },
]

const dir = mkdtempSync(join(tmpdir(), 'fhor-test-'))
const recordsPath = join(dir, 'records.jsonl')
writeFileSync(recordsPath, RECORDS.map((r) => JSON.stringify(r)).join('\n') + '\n')

const scriptPath = join(__dirname, '..', 'false-hold-observation-report.ts')
const result = spawnSync(
  process.execPath,
  ['--import', 'tsx', scriptPath, '--records', recordsPath, '--dry-run'],
  { encoding: 'utf8', cwd: join(__dirname, '..', '..') },
)
const out = (result.stdout || '') + (result.stderr || '')

// ============================================================================
console.log('\n§1 — parsing + basic shape')
// ============================================================================
{
  check('§1.1 script exits 0', result.status === 0, `status=${result.status}\n${out.slice(0, 2000)}`)
  check('§1.2 all 4 records parsed as valid', out.includes('4 valid records'), out)
}

// ============================================================================
console.log('\n§2 — STRICT classification (canonical/stored)')
// ============================================================================
{
  // 3 holds (A, B, D-excluded-as-not-a-hold — wait D is closed, so holds = A,B only... let's
  // check: A opened, B opened, C opened, D closed. Holds = A, B, C (3). D is not_a_hold.
  check('§2.1 3 holds counted (A, B, C — D is closed, excluded)', out.includes('holds (loop opened/reopened): 3'), out)
  check(
    '§2.2 strict false-positive holds: 2 (A: unknown-identity self-only; C: zero-circle)',
    out.includes('false-positive holds (no kathekon factor): 2'),
    out,
  )
  check(
    '§2.3 strict correct holds: 1 (B: genuine beyond-self circle, violated)',
    out.includes('correct holds (kathekon-engaged):          1'),
    out,
  )
}

// ============================================================================
console.log('\n§3 — the LEGACY BRACKET (unknown-identity records only)')
// ============================================================================
{
  check('§3.1 the bracket fires (≥1 hold has unknown circle identity)', out.includes('LEGACY BRACKET'), out)
  check('§3.2 exactly 1 hold predates circle-identity capture (A)', out.includes('1 hold(s) predate circle-identity capture'), out)
  check(
    '§3.3 legacy-compat reading: false=1 correct=2 (A flips to correct_hold; B stays correct; C stays false)',
    out.includes('legacy-compat reading (unknown≡beyond-self): false=1 correct=2'),
    out,
  )
  check('§3.4 exactly 1 record is DECISIVE (A — the only one whose reading flips)', out.includes('DECISIVE: 1'), out)
}

// ============================================================================
console.log('\n§4 — the selfCircleExclusion bound is printed')
// ============================================================================
{
  check(
    '§4.1 the 2026-07-19 self-circle bound is in the printed bounds list',
    out.includes('Self-circle exclusion') && out.includes('other-directed'),
    out,
  )
}

// ============================================================================
console.log('\n§5 — idempotency: recordHash is stable across two runs of the SAME script on the SAME file')
// ============================================================================
{
  const result2 = spawnSync(
    process.execPath,
    ['--import', 'tsx', scriptPath, '--records', recordsPath, '--dry-run'],
    { encoding: 'utf8', cwd: join(__dirname, '..', '..') },
  )
  const out2 = (result2.stdout || '') + (result2.stderr || '')
  check('§5.1 two runs of the same input produce IDENTICAL strict counts', out2.includes('false-positive holds (no kathekon factor): 2') && out2.includes('correct holds (kathekon-engaged):          1'), out2)
}

// ============================================================================
console.log('\n§6 — P8a: v4 GUARD-path records ingest, and legacy hashes do not move')
// ============================================================================
// A SEPARATE records file, deliberately. The §1-§5 fixtures above assert exact
// counts and are the byte-identity evidence that v4 acceptance did not disturb
// legacy ingest — appending a v4 record to RECORDS would move those counts and
// destroy exactly the evidence this section exists to preserve.
{
  const guardRecords = [
    {
      // A guard DENY with a kathekon factor ⇒ correct_hold. This is the record
      // class register P5 says does not exist ("the guard path writes no record"),
      // and therefore the denominator part (3) of the readiness standard lacked.
      schema: 'false-hold-record-v4',
      path: 'guard',
      capturedAt: '2026-08-17T10:00:00.000Z',
      session: 'sess-guard',
      tool: 'Bash',
      depth: '',
      loopEvent: 'none', // the guard keeps no loop state — honest, not inferred
      actionPreview: 'rm -rf /repo/dist',
      inputClass: 'guard_action',
      extractionRegime: 'at-action-v2-composed',
      composedChars: null,
      signals: {
        proximity: 'reflexive',
        virtueDomainsEngaged: ['dikaiosyne'],
        obligationStatuses: ['violated'],
        circles: ['local_community'],
        subSpeciesPassions: [],
      },
      kathekon: { isKathekon: false, quality: 'contrary' },
      carriedPrior: false,
      guardHold: true,
      guardOutcome: 'do_not_proceed',
      captureBasis: 'assessment',
    },
    {
      // A guard OUTAGE record: no assessment, so proximity is null. It must PARSE
      // (so the loss is counted) rather than be silently dropped into `invalid`.
      schema: 'false-hold-record-v4',
      path: 'guard',
      capturedAt: '2026-08-17T10:01:00.000Z',
      session: 'sess-guard-outage',
      tool: 'Bash',
      depth: '',
      loopEvent: 'none',
      actionPreview: 'drop table users',
      inputClass: 'guard_action',
      extractionRegime: 'unknown',
      composedChars: null,
      signals: {
        proximity: null,
        virtueDomainsEngaged: [],
        obligationStatuses: [],
        circles: [],
        subSpeciesPassions: [],
      },
      kathekon: { isKathekon: null, quality: null },
      carriedPrior: false,
      guardHold: false,
      guardOutcome: null,
      captureBasis: 'no_assessment',
    },
  ]
  const guardPath = join(dir, 'guard-records.jsonl')
  writeFileSync(guardPath, guardRecords.map((r) => JSON.stringify(r)).join('\n') + '\n')
  const res = spawnSync(
    process.execPath,
    ['--import', 'tsx', scriptPath, '--records', guardPath, '--dry-run'],
    { encoding: 'utf8', cwd: join(__dirname, '..', '..') },
  )
  const gOut = (res.stdout || '') + (res.stderr || '')
  check('§6.1 a v4 guard record is ACCEPTED (not counted invalid)', !/invalid[^0-9]*[1-9]/i.test(gOut), gOut)
  check(
    '§6.2 a guard DENY counts as a HOLD despite loopEvent none (the denominator P5 lacked)',
    /correct holds \(kathekon-engaged\):\s+1/.test(gOut),
    gOut,
  )
}

// ============================================================================
// P6 §7 (ruled 2026-09-05) — sections 7-11.
//
// REBUILT 2026-09-06 after an independent PR19 battery-adequacy review ran 29
// mutations against the first draft and SIX left it fully green. The failures
// were all one family: the pins asserted that a LABEL was printed, not that the
// CLAIM under the label was true, and the population regexes were not scoped to a
// population, so the right number read off the wrong block satisfied them. Every
// assertion below is scoped and claim-bearing, and each was re-mutated.
// ============================================================================

/** Scope an assertion to ONE population block. The review's H-1: an unscoped
 *  /…: 1\/1/ was satisfied by the GUARD block while the CONSULT claim it was
 *  written to guard had been inverted to 0/1. */
function popSection(out: string, pop: 'consult' | 'guard'): string {
  const start = out.indexOf(`POPULATION: ${pop}`)
  if (start < 0) return ''
  const rest = out.slice(start + 1)
  const next = rest.indexOf('POPULATION: ')
  return next < 0 ? out.slice(start) : out.slice(start, start + 1 + next)
}

function runReport(records: unknown[], name: string, extraArgs: string[] = []) {
  const f = join(dir, `${name}.jsonl`)
  writeFileSync(f, records.map((r) => JSON.stringify(r)).join('\n') + '\n')
  const res = spawnSync(
    process.execPath,
    ['--import', 'tsx', scriptPath, '--records', f, '--dry-run', ...extraArgs],
    { encoding: 'utf8', cwd: join(__dirname, '..', '..') },
  )
  return { out: (res.stdout || '') + (res.stderr || ''), status: res.status }
}

/** A consult hold the table does NOT turn into a do-not-proceed: the ruling's point. */
const CONSULT_FP_HOLD = {
  schema: 'false-hold-record-v3',
  capturedAt: '2026-09-06T10:00:00.000Z',
  session: 'sess-p6-a', tool: 'Edit', depth: 'standard', loopEvent: 'opened',
  actionPreview: 'consult: kathekon-free hold',
  signals: { proximity: 'deliberate', virtueDomainsEngaged: ['phronesis'], obligationStatuses: [], circles: [], subSpeciesPassions: [] },
  kathekon: { isKathekon: false, quality: 'contrary' }, carriedPrior: false,
}
/** A guard DENY on a violated beyond-self obligation: both columns agreeing. */
const GUARD_CORRECT_DENY = {
  schema: 'false-hold-record-v4', path: 'guard',
  capturedAt: '2026-09-06T10:01:00.000Z',
  session: 'sess-p6-b', tool: 'Bash', depth: '', loopEvent: 'none',
  actionPreview: 'rm -rf /shared/data',
  inputClass: 'guard_action', extractionRegime: 'at-action-v2-composed', composedChars: null,
  signals: { proximity: 'reflexive', virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['violated'], circles: ['local_community'], subSpeciesPassions: [] },
  kathekon: { isKathekon: false, quality: 'contrary' }, carriedPrior: false,
  guardHold: true, guardOutcome: 'do_not_proceed', captureBasis: 'assessment',
}

// ============================================================================
console.log('\n§7 — the recommendation column: BOTH columns, populations SCOPED')
// ============================================================================
{
  const { out, status } = runReport([CONSULT_FP_HOLD, GUARD_CORRECT_DENY], 'p6-mixed')
  const consult = popSection(out, 'consult')
  const guard = popSection(out, 'guard')

  check('§7.1 exits 0 on a well-formed mixed buffer', status === 0, out.slice(0, 3000))
  check('§7.2 the two population sections are BOTH present and non-empty', consult.length > 200 && guard.length > 200, `consult=${consult.length} guard=${guard.length}`)

  // ── the ruled disclosures: pin the CLAIM, not the label (review M-1) ──
  check('§7.3 A8 bound states the row CAN NEVER FIRE', /A8 BOUND/.test(out) && /CAN NEVER FIRE/.test(out) && /intervention-engine\.ts:392/.test(out), out)
  check('§7.4 guard depth bound states the DEFAULT is applied, not the captured depth', /GUARD depth BOUND/.test(out) && /applies its own ‘standard’ default rather/.test(out), out)
  check('§7.5 as-of-table states TODAY’S table and NOT the capture-time table', /AS-OF-TABLE/.test(out) && /not the table as it/.test(out), out)
  // Pins the CLAIM (that the flag IS read, at call time), not just the label and
  // the identifiers: a mutant inverting the verb to "the seam does not read" kept
  // both the env-var name and the line citation on following lines and survived.
  check('§7.6 engine-flag bound states the flag IS read AT CALL TIME',
    /ENGINE-FLAG BOUND/.test(out) && /justice reducer reads/.test(out) && /AT CALL TIME/.test(out) &&
      /SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED/.test(out) && /derive-trust-events\.ts:125/.test(out), out)
  check('§7.7 the MEASURE close claims binds-nothing AND not-stored', /binds nothing/.test(out) && /It is not stored/.test(out) && /remains REFUSED/.test(out), out)

  // ── population identity, scoped + count-anchored (review H-1, MH-1, LM-2) ──
  check('§7.8 the CONSULT record is in the consult block, releasing (count-anchored)', /^ {9}1 {2}false_positive → proceed$/m.test(consult), consult)
  check('§7.9 the guard deny is NOT in the consult block', !/correct_hold {3}→ do-not-proceed/.test(consult), consult)
  check('§7.10 the GUARD deny is in the guard block, holding (count-anchored)', /^ {9}1 {2}correct_hold {3}→ do-not-proceed$/m.test(guard), guard)
  check('§7.11 the consult record is NOT in the guard block', !/false_positive → proceed/.test(guard), guard)
  check('§7.12 non-totality is reported for the CONSULT block specifically', /classified a hold, but the table does NOT say do-not-proceed: 1\/1/.test(consult), consult)
  check('§7.13 the CONVERSE direction is reported too', /NOT classified a hold, but the table DOES say do-not-proceed: 0/.test(consult), consult)
  check('§7.14 the guard depth default is counted in the GUARD block', /depth-defaulted records \(the depth bound, live here\): 1\/1/.test(guard), guard)
  check('§7.15 the consult record is NOT depth-defaulted', !/depth-defaulted/.test(consult), consult)
}

// ============================================================================
console.log('\n§8 — the structural zero: no target verdict is computed (HIGH fold)')
// ============================================================================
// The review's HIGH, confirmed by two independent enumerations: under the P1
// filter `do-not-proceed ⟹ engaged`, so the kathekon-free cell cannot be
// non-zero and a printed "false ≤ correct: MET" would be an arithmetic identity.
// Precedent: RA-1-F2 (2026-07-17) on this same script; the D6a ruling (2026-08-30)
// required a forced split be REMOVED from publication, not footnoted.
{
  const { out } = runReport([GUARD_CORRECT_DENY], 'p6-structzero')
  // SCOPED to Part 3b. The CLASSIFICATION column keeps its own target line
  // ("mentor's target (false ≤ correct)") and that is correct — the ruling leaves
  // it in place, and Part 3b explicitly defers to it. The first draft of this
  // assertion asserted the string was absent from the WHOLE report, which is
  // false; it failed on the classification column and was caught here.
  const p3b = out.slice(out.indexOf('Part 3b'))
  check('§8.1 Part 3b computes NO "target (false ≤ correct)" verdict of its own',
    p3b.length > 500 && !/target \(false ≤ correct\):/.test(p3b), p3b.slice(0, 2500))
  check('§8.1b the classification column DOES still print its own target (the deferral target exists)',
    /mentor's target \(false ≤ correct\):/.test(out), out)
  check('§8.2 the structural zero is stated in terms', /zero BY CONSTRUCTION, not by measurement/.test(out), out)
  check('§8.3 the false cell is marked as structurally zero at the figure', /kathekon-free {2}\(FALSE hold\): {3}0 {3}← STRUCTURALLY ZERO/.test(out), out)
  check('§8.4 the precedent is cited so a reader can check it', /RA-1-F2/.test(out) && /D6a/.test(out), out)
  check('§8.5 part (3)’s target is explicitly deferred elsewhere, not answered here', /target is answered by the classification column/.test(out), out)

  // NON-VACUITY: the enumeration this disclosure rests on must actually hold.
  // If a future seam change made the cell reachable, the disclosure becomes a
  // false claim; this asserts the property itself, not the sentence about it.
  const probe = spawnSync(process.execPath, ['--import', 'tsx', '-e', `
    const { interventionInputFromAtAction } = require('${join(__dirname, '..', '..', 'src/lib/substrate/trust-core/at-action-seam').replace(/\\/g, '/')}')
    const { recommendIntervention } = require('${join(__dirname, '..', '..', 'src/lib/substrate/trust-core/intervention-engine').replace(/\\/g, '/')}')
    let dnp = 0, bad = 0
    for (const p of ['reflexive','habitual','deliberate','principled','sage_like'])
    for (const st of [undefined,'violated','met','indeterminate'])
    for (const c of [undefined,'self_preservation','local_community'])
    for (const d of [[],['dikaiosyne'],['phronesis']])
    for (const pa of [[],['epithumia']]) {
      const a = { katorthoma_proximity: p, virtue_domains_engaged: d,
        oikeiosis: { relevant_circles: (st===undefined&&c===undefined)?[]:[{circle:c, obligation_assessment: st?{status:st}:undefined}] },
        passion_diagnosis: { passions_detected: pa.map(x=>({sub_species:x})) } }
      const seam = interventionInputFromAtAction({ assessment: a })
      const rec = recommendIntervention(seam)
      if (rec.action === 'do-not-proceed') { dnp++; if (!seam.kathekonEngagement.engaged) bad++ }
    }
    console.log('DNP=' + dnp + ' UNENGAGED=' + bad)
  `], { encoding: 'utf8', cwd: join(__dirname, '..', '..') })
  const pOut = (probe.stdout || '') + (probe.stderr || '')
  check('§8.6 the enumeration produced do-not-proceed outcomes (the probe is not vacuous)', /DNP=[1-9]/.test(pOut), pOut)
  check('§8.7 NO do-not-proceed is kathekon-free — the disclosed property actually holds', /UNENGAGED=0\b/.test(pOut), pOut)
}

// ============================================================================
console.log('\n§9 — the v3/v4 lift check: runs, can fail, and tells the truth about coverage')
// ============================================================================
{
  const { out } = runReport([CONSULT_FP_HOLD, GUARD_CORRECT_DENY], 'p6-lift')
  check('§9.1 the self-test runs on a v3 shape', /self-test: v3-shaped signals/.test(out), out)
  check('§9.2 the self-test runs on a v4 shape', /self-test: v4-shaped signals/.test(out), out)
  check('§9.3 a NEGATIVE control is present and required to fail', /NEGATIVE control/.test(out) && /MUST fail/.test(out), out)
  check('§9.4 the negative control names `circles` — pinning per-status emission', /NEGATIVE control[^\n]*MUST fail\) — circles: lifted/.test(out), out)
  check('§9.5 coverage is reported WITH its denominator', /checked of \d+ present/.test(out), out)
  check('§9.6 real v3/v4 coverage is a number', /v3\/v4 coverage: 2 real record\(s\)/.test(out), out)

  // The vacuity disclosure must state what was ACTUALLY checked, not assume v1/v2.
  const v1Only = { ...CONSULT_FP_HOLD, schema: 'false-hold-record-v1', signals: { ...CONSULT_FP_HOLD.signals } }
  delete (v1Only.signals as { circles?: unknown }).circles
  const { out: o1 } = runReport([v1Only], 'p6-v1only')
  check('§9.7 a v1-only buffer discloses the check is UNEXERCISED on v3/v4', /UNEXERCISED ON REAL v3\/v4 DATA/.test(o1), o1)
  check('§9.8 it states what was actually checked, with numbers', /What was actually checked: 1 v1\/v2 record\(s\), 0 v3\/v4/.test(o1), o1)
  check('§9.9 it does NOT claim the precondition is discharged for a v3/v4 window', /DISCHARGED ONLY FOR THE RECORDS/.test(o1) && !/precondition is met for the data/.test(o1), o1)

  // A buffer with NO derivable record must not print a green tick over the empty set.
  const noneDerivable = { ...GUARD_CORRECT_DENY, session: 'sess-none', captureBasis: 'no_assessment', guardHold: false,
    signals: { proximity: null, virtueDomainsEngaged: [], obligationStatuses: [], circles: [], subSpeciesPassions: [] } }
  const { out: o0 } = runReport([noneDerivable], 'p6-nonederivable')
  check('§9.10 an all-skipped buffer prints NO "all N round-trip" tick', !/✓ all \d+ derivable records round-trip/.test(o0), o0)
  check('§9.11 it says plainly that nothing exercised the lift', /NOTHING in this buffer exercised the lift/.test(o0), o0)

  // The abort, both directions, on a REAL v3 record.
  const misaligned = { ...CONSULT_FP_HOLD, session: 'sess-mis',
    signals: { proximity: 'deliberate', virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['violated'], circles: ['local_community', 'political_community', 'cosmopolis'], subSpeciesPassions: [] } }
  const { out: oBad, status: sBad } = runReport([misaligned], 'p6-abort')
  check('§9.12 a misaligned v3 record ABORTS (non-zero exit)', sBad !== 0, `status=${sBad}\n${oBad}`)
  check('§9.13 the abort names the lift as the cause', /ABORTING/.test(oBad) && /do NOT round-trip/.test(oBad), oBad)
  check('§9.14 NO figure is published after the abort', !/Part 3b/.test(oBad) && !/Part 3 —/.test(oBad), oBad)
  const aligned = { ...misaligned, session: 'sess-al', signals: { ...misaligned.signals, circles: ['local_community'] } }
  const { out: oGood, status: sGood } = runReport([aligned], 'p6-noabort')
  check('§9.15 the same record ALIGNED does not abort (the pin is not vacuous)', sGood === 0 && /Part 3b/.test(oGood), `status=${sGood}`)

  // A corrupt VALUE round-trips perfectly; only the vocabulary arm catches it.
  const homoglyph = { ...CONSULT_FP_HOLD, session: 'sess-hom',
    signals: { proximity: 'deliberate', virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['vioIated'], circles: ['local_community'], subSpeciesPassions: [] } }
  const { out: oV, status: sV } = runReport([homoglyph], 'p6-vocab')
  check('§9.16 an out-of-vocabulary obligation status ABORTS (round-trip alone cannot catch it)', sV !== 0 && /not in the engine's vocabulary/.test(oV), `status=${sV}\n${oV}`)
  check('§9.17 the vocabulary abort names the lenient direction', /LENIENT direction/.test(oV), oV)
}

// ============================================================================
console.log('\n§10 — exclusions, the bracket, and --per-record')
// ============================================================================
{
  const strictOutageDeny = { ...GUARD_CORRECT_DENY, session: 'sess-strict-outage',
    signals: { proximity: null, virtueDomainsEngaged: [], obligationStatuses: [], circles: [], subSpeciesPassions: [] },
    kathekon: { isKathekon: null, quality: null }, guardHold: true, guardOutcome: 'do_not_proceed', captureBasis: 'no_assessment' }
  const { out } = runReport([strictOutageDeny], 'p6-excluded-hold')
  check('§10.1 an excluded HOLD is named, not hidden', /HOLD\(S\) EXCLUDED FROM THE RECOMMENDATION COLUMN/.test(out), out)
  check('§10.2 it is counted as an exclusion', /excluded \(no_assessment — COUNTED, not dropped\): 1/.test(out), out)
  check('§10.3 control: a derivable guard deny raises NO excluded-hold warning',
    !runReport([GUARD_CORRECT_DENY], 'p6-exc-ctl').out.includes('HOLD(S) EXCLUDED FROM THE RECOMMENDATION COLUMN'), '')

  // The legacy bracket must be carried into this column, not silently resolved.
  const bracketDecisive = { schema: 'false-hold-record-v1', capturedAt: '2026-07-12T13:15:47.000Z',
    session: 'sess-brk', tool: 'Edit', depth: 'standard', loopEvent: 'opened',
    actionPreview: 'legacy, circle-less, indeterminate',
    signals: { proximity: 'deliberate', virtueDomainsEngaged: ['dikaiosyne'], obligationStatuses: ['indeterminate'], subSpeciesPassions: [] },
    kathekon: { isKathekon: true, quality: 'moderate' }, carriedPrior: false }
  const { out: oB } = runReport([bracketDecisive], 'p6-bracket')
  check('§10.4 the column declares it reads the STRICT end', /THIS COLUMN READS THE STRICT END OF THE LEGACY BRACKET/.test(oB), oB)
  check('§10.5 unknown-identity records are counted', /records with unrecorded circle identity \(v1\/v2\): {14}1/.test(oB), oB)
  check('§10.6 a record whose RECOMMENDATION flips under the bracket is reported as not certified',
    /whose RECOMMENDATION flips under the bracket: 1 {3}← not certified either way/.test(oB), oB)
  const { out: oNB } = runReport([CONSULT_FP_HOLD], 'p6-nobracket')
  check('§10.7 control: a v3 record with known identity reports ZERO bracket flips',
    /whose RECOMMENDATION flips under the bracket: 0/.test(oNB) && !/not certified either way/.test(oNB), oNB)

  const { out: oPR } = runReport([CONSULT_FP_HOLD, GUARD_CORRECT_DENY], 'p6-perrecord', ['--per-record'])
  check('§10.8 --per-record dumps both columns per record', /per-record \(--per-record\)/.test(oPR) && /false_positive {2}proceed \[/.test(oPR), oPR)
  const { out: oPR2 } = runReport([strictOutageDeny], 'p6-perrecord2', ['--per-record'])
  check('§10.9 --per-record marks a non-derivable record honestly', /\(not derivable\)/.test(oPR2), oPR2)
  check('§10.10 without the flag, no per-record dump', !/per-record \(--per-record\)/.test(runReport([CONSULT_FP_HOLD], 'p6-nopr').out), '')

  // A v4 record without `path` is malformed, not a consult record.
  const v4NoPath = { ...GUARD_CORRECT_DENY, session: 'sess-nopath' } as Record<string, unknown>
  delete v4NoPath.path
  const { out: oNP } = runReport([v4NoPath], 'p6-v4nopath')
  check('§10.11 a v4 record without `path` is REJECTED, not counted as consult', /1 invalid/.test(oNP) && !/POPULATION: consult {2}\(n=1\)/.test(oNP), oNP)
}

// ============================================================================
console.log('\n§11 — DERIVED AT REPORT TIME: nothing stored, nothing re-hashed')
// ============================================================================
{
  const scriptSrc = readFileSync(scriptPath, 'utf8')
  const dbRowsBlock = scriptSrc.slice(scriptSrc.indexOf('const dbRows = rows.map('), scriptSrc.indexOf('// Insert idempotently'))
  check('§11.1 the dbRows block was located (the pin is not vacuous)', dbRowsBlock.length > 200, `len=${dbRowsBlock.length}`)

  // ALLOWLIST, not denylist (review LM-1): a denylist was routed around by
  // computing the value one line above the block and storing it under a new name.
  const EXPECTED_DB_KEYS = ['action_preview','agent_id','captured_at','carried_prior','classification','credential_ref','depth','is_hold','is_kathekon','justice_surface_present','kathekon_engaged','kathekon_quality','loop_event','obligation_statuses','owner_user_id','proximity','proximity_at_or_below_habitual','record_hash','session_id','sub_species_passion','sub_species_passions','tool','violated_obligation','virtue_domains_engaged']
  const actualKeys = [...new Set((dbRowsBlock.match(/^ {4}([a-z_]+):/gm) || []).map((m) => m.trim().replace(':', '')))].sort()
  check('§11.2 dbRows carries EXACTLY the frozen column set — no additions of any name',
    JSON.stringify(actualKeys) === JSON.stringify(EXPECTED_DB_KEYS),
    `got ${JSON.stringify(actualKeys)}`)
  check('§11.3 dbRows contains NO spread — a `...r` would ship every derived field',
    !/\.\.\./.test(dbRowsBlock), dbRowsBlock)

  // The hashed tuple itself, not merely the line that appends `path`.
  check('§11.4 recordHash hashes EXACTLY the pre-existing field tuple',
    scriptSrc.includes("const stable = [r.session, r.capturedAt, r.tool, r.loopEvent, JSON.stringify(r.signals), r.actionPreview].join('|')"),
    'the hashed tuple changed — that re-hashes every existing record and breaks ingest idempotency')
  check('§11.5 `path` is appended only when present', scriptSrc.includes('const stableWithPath = r.path ? `${stable}|${r.path}` : stable'), '')

  // The A8 bound is a CLAIM about the call, so pin the call (review M-2).
  const seamCall = scriptSrc.slice(scriptSrc.indexOf('const seam = interventionInputFromAtAction({'), scriptSrc.indexOf('recommendation = recommendIntervention(seam)'))
  check('§11.6 the seam call is located', seamCall.length > 50, `len=${seamCall.length}`)
  check('§11.7 habitualReExaminationCount is NOT passed — the printed A8 bound is true of the code',
    !/habitualReExaminationCount/.test(seamCall), seamCall)

  // Cited line numbers rot silently (project memory). Verify them, don't trust them.
  const eng = readFileSync(join(__dirname, '..', '..', 'src/lib/substrate/trust-core/intervention-engine.ts'), 'utf8').split('\n')
  check('§11.8 intervention-engine.ts:392 really is the A8 floor the report cites',
    /habitualReExaminationCount \?\? 0/.test(eng[391] || ''), `line392="${eng[391]}"`)
  const dte = readFileSync(join(__dirname, '..', '..', 'src/lib/substrate/trust-core/derive-trust-events.ts'), 'utf8').split('\n')
  check('§11.9 derive-trust-events.ts:125 really is the env read the report cites',
    /isJusticeSelfCircleNarrowingEnabled\(\)/.test(dte[124] || ''), `line125="${dte[124]}"`)

  // The lift is a verbatim copy of the reference's; pin that it stays one.
  const refSrc = readFileSync(join(__dirname, '..', 'p1-frozen-buffer-reclassification.ts'), 'utf8')
  const body = (src: string) => {
    const i = src.indexOf('function liftToAssessment')
    return src.slice(i, src.indexOf('\n}', i)).replace(/\s+/g, ' ')
  }
  check('§11.10 liftToAssessment is byte-identical to the reference implementation’s',
    body(scriptSrc) === body(refSrc), `report:\n${body(scriptSrc)}\n\nref:\n${body(refSrc)}`)
}

rmSync(dir, { recursive: true, force: true })

console.log(`\nfalse-hold-observation-report battery: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
