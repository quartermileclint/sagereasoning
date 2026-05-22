/**
 * zone3-boundary.test.ts — SR-9 / R20a Zone-3 deterministic boundary (Stage B, B-3).
 * Run: npx tsx src/lib/sage-reflect/__tests__/zone3-boundary.test.ts   (pure; no env)
 */

import { checkZone3Boundary, zone3KathekonRecord, ZONE3_DEVELOPER_NOTE } from '../zone3-boundary'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) { passCount++; console.log(`PASS  ${label}`) }
  else { failCount++; const m = detail ? `${label} — ${detail}` : label; failures.push(m); console.log(`FAIL  ${m}`) }
}

// Z3-1 — explicit harm flag engages the boundary.
{
  const r = checkZone3Boundary({ safety_signal: { harm_flagged: true, detail: 'data deletion act' } })
  assert('Z3-1  explicit harm_flagged engages', r.engaged === true && r.developer_note === ZONE3_DEVELOPER_NOTE)
  assert('Z3-1b reason carries the detail', r.reason.includes('data deletion act'))
}

// Z3-2 — a blocked act categorised 'harm' engages the boundary.
{
  const r = checkZone3Boundary({ acts_blocked: [{ act: 'send', reason: 'x', category: 'harm' }] })
  assert('Z3-2  harm-category block engages', r.engaged === true && r.developer_note !== null)
}

// Z3-3 — non-harm signals do NOT engage (boundary clear).
{
  const r = checkZone3Boundary({
    safety_signal: { harm_flagged: false },
    acts_blocked: [{ act: 'a', reason: 'b', category: 'policy' }, { act: 'c', reason: 'd', category: 'capability' }],
  })
  assert('Z3-3  non-harm blocks + harm_flagged=false → clear', r.engaged === false && r.developer_note === null)
}

// Z3-4 — empty input → clear.
{
  const r = checkZone3Boundary({})
  assert('Z3-4  empty input → clear', r.engaged === false)
}

// Z3-5 — the kathekon record is a single contrary, non-kathekon, reflexive entry.
{
  const rec = zone3KathekonRecord()
  assert('Z3-5  one contrary kathekon record', rec.length === 1 && rec[0].quality === 'contrary' && rec[0].is_kathekon === false && rec[0].proximity === 'reflexive')
  assert('Z3-5b no virtue domains claimed', rec[0].virtue_domains_engaged.length === 0)
}

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) { console.log('\nFailures:'); failures.forEach((f) => console.log(`  - ${f}`)); process.exit(1) }
process.exit(0)
