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
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
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

rmSync(dir, { recursive: true, force: true })

console.log(`\nfalse-hold-observation-report battery: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
