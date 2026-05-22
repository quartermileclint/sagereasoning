/**
 * reflect-q5-ambiguity.test.ts — A4 (PR7) Q5 ambiguity detector + escalation mapper.
 *
 * Run (no Supabase, no env — reflect-extractor constructs no client at module load):
 *   npx tsx src/lib/sage-reflect/__tests__/reflect-q5-ambiguity.test.ts
 *
 * Coverage:
 *   AMB  — isQ5Ambiguous: change-cue + substantive → escalate; no cue → no escalate;
 *          bare denial → no escalate; word-boundary so "unchanged" ≠ "changed".
 *   MAP  — mapQ5Escalation: keeps free-text capacity labels, drops non-strings,
 *          reasoning_pattern_change defaults false unless explicit true.
 *
 * Exit code 0 = all pass.
 */

import { isQ5Ambiguous, __testing } from '../reflect-extractor'
const { mapQ5Escalation } = __testing

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) { passCount++; console.log(`PASS  ${label}`) }
  else { failCount++; const m = detail ? `${label} — ${detail}` : label; failures.push(m); console.log(`FAIL  ${m}`) }
}

// ── AMB ───────────────────────────────────────────────────────────────────────
assert(
  'AMB  substantive answer with a change cue is ambiguous (escalate)',
  isQ5Ambiguous('my reasoning pattern changed this session and I developed a new approach'),
)
assert(
  'AMB  "different" cue, substantive → ambiguous',
  isQ5Ambiguous('I took a different approach after reflecting on the prior session'),
)
assert(
  'AMB  clearly-unchanged answer (no cue) → NOT ambiguous',
  !isQ5Ambiguous('capacity unchanged; same patterns as in prior sessions'),
)
assert(
  'AMB  word boundary — "unchanged" does NOT match "changed"/"change"',
  !isQ5Ambiguous('my whole capacity is unchanged across this entire session'),
)
assert('AMB  bare denial "no" → not substantive → NOT ambiguous', !isQ5Ambiguous('no'))
assert('AMB  "nothing" → not substantive → NOT ambiguous', !isQ5Ambiguous('nothing'))
assert(
  'AMB  short single cue word is not substantive → NOT ambiguous',
  !isQ5Ambiguous('changed'),
)
assert(
  'AMB  continuation language ("still fits the same") → NOT ambiguous',
  !isQ5Ambiguous('the purpose still fits and the same role holds for me'),
)

// ── MAP ───────────────────────────────────────────────────────────────────────
const good = mapQ5Escalation({
  capacity_delta: { domains_added: ['incident triage', ' spec review '], domains_removed: [], domains_updated: ['planning'] },
  reasoning_pattern_change: true,
})
assert('MAP  keeps + trims free-text capacity labels', good.capacity_delta.domains_added.join('|') === 'incident triage|spec review', JSON.stringify(good.capacity_delta.domains_added))
assert('MAP  carries domains_updated', good.capacity_delta.domains_updated.join('|') === 'planning')
assert('MAP  reasoning_pattern_change true honoured', good.reasoning_pattern_change === true)

const dirty = mapQ5Escalation({
  capacity_delta: { domains_added: ['ok', 42, '', null, '   '], domains_removed: 'notarray', domains_updated: undefined },
  reasoning_pattern_change: 'yes', // not boolean true → false
})
assert('MAP  drops non-string / empty capacity entries', dirty.capacity_delta.domains_added.join('|') === 'ok', JSON.stringify(dirty.capacity_delta.domains_added))
assert('MAP  non-array domains_removed → []', dirty.capacity_delta.domains_removed.length === 0)
assert('MAP  missing domains_updated → []', dirty.capacity_delta.domains_updated.length === 0)
assert('MAP  non-true reasoning_pattern_change → false', dirty.reasoning_pattern_change === false)

const empty = mapQ5Escalation({})
assert('MAP  empty input → empty deltas + false', empty.capacity_delta.domains_added.length === 0 && empty.reasoning_pattern_change === false)

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) { console.log('\nFailures:'); failures.forEach((f) => console.log(`  - ${f}`)); process.exit(1) }
process.exit(0)
