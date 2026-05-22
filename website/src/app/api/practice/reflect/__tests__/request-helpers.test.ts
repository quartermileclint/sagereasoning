/**
 * request-helpers.test.ts — parse for POST /api/practice/reflect (Stage B, B-1).
 * Run: npx tsx src/app/api/practice/reflect/__tests__/request-helpers.test.ts  (pure)
 */

import { parseReflectBody } from '../request-helpers'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) { passCount++; console.log(`PASS  ${label}`) }
  else { failCount++; const m = detail ? `${label} — ${detail}` : label; failures.push(m); console.log(`FAIL  ${m}`) }
}

const SUMMARY = { purpose_at_open: 'ship triage', circle_at_open: 'community', role_at_open: 'maintainer', capacity_at_open: ['triage'], sage_reasoning_passes: 2 }

// RH-1 — valid OPEN call.
{
  const r = parseReflectBody({ session_id: 's1', agent_id: 'a1', session_summary: SUMMARY })
  assert('RH-1  valid open parses', r.ok === true)
  if (r.ok) assert('RH-1b summary carried', r.value.session_summary?.circle_at_open === 'community' && r.value.response === undefined)
}

// RH-2 — OPEN missing session_summary → error.
{
  const r = parseReflectBody({ session_id: 's1', agent_id: 'a1' })
  assert('RH-2  open without session_summary rejected', r.ok === false)
}

// RH-3 — ANSWER call (response present) needs no session_summary.
{
  const r = parseReflectBody({ session_id: 's1', agent_id: 'a1', response: 'I assented under deadline pressure' })
  assert('RH-3  answer parses without summary', r.ok === true)
  if (r.ok) assert('RH-3b response carried', r.value.response === 'I assented under deadline pressure')
}

// RH-4 — invalid circle_at_open enum → error.
{
  const r = parseReflectBody({ session_id: 's1', agent_id: 'a1', session_summary: { ...SUMMARY, circle_at_open: 'galactic' } })
  assert('RH-4  invalid circle rejected', r.ok === false)
}

// RH-5 — missing session_id / agent_id → error.
{
  assert('RH-5  missing session_id rejected', parseReflectBody({ agent_id: 'a1', response: 'x y z w' }).ok === false)
  assert('RH-5b missing agent_id rejected', parseReflectBody({ session_id: 's1', response: 'x y z w' }).ok === false)
}

// RH-6 — empty response string → error.
{
  assert('RH-6  empty response rejected', parseReflectBody({ session_id: 's1', agent_id: 'a1', response: '   ' }).ok === false)
}

// RH-7 — safety_signal + acts_blocked parse on the open call.
{
  const r = parseReflectBody({
    session_id: 's1', agent_id: 'a1', session_summary: SUMMARY,
    safety_signal: { harm_flagged: true, detail: 'd' },
    acts_blocked: [{ act: 'send', reason: 'r', category: 'harm' }, { act: 'x', reason: 'y' }],
  })
  assert('RH-7  safety_signal parsed', r.ok === true && r.value.safety_signal?.harm_flagged === true)
  if (r.ok) assert('RH-7b acts_blocked parsed incl. category', r.value.acts_blocked?.length === 2 && r.value.acts_blocked?.[0].category === 'harm')
}

// RH-8 — malformed acts_blocked (not an array) → error.
{
  const r = parseReflectBody({ session_id: 's1', agent_id: 'a1', session_summary: SUMMARY, acts_blocked: 'nope' })
  assert('RH-8  non-array acts_blocked rejected', r.ok === false)
}

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) { console.log('\nFailures:'); failures.forEach((f) => console.log(`  - ${f}`)); process.exit(1) }
process.exit(0)
