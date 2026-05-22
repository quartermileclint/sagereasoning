/**
 * proximity-domains.test.ts — tests for the SR-15 per-domain proximity (A-4).
 *
 * Run (pure; no env):
 *   npx tsx src/lib/sage-reflect/__tests__/proximity-domains.test.ts
 *
 * Coverage: weakest-link per domain; KP-04 aggregate = lowest non-null domain;
 * unengaged domain → null; empty actions → all null; canonical domain set.
 */

import { computePerDomainProximity, VIRTUE_DOMAINS } from '../proximity-domains'
import type { KathekonAssessment, VirtueDomain } from '../engine'
import type { KatorthomaProximityLevel } from '@/lib/substrate/trust-layer/types/accreditation'

let passCount = 0
let failCount = 0
const failures: string[] = []
function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

function action(proximity: KatorthomaProximityLevel, domains: VirtueDomain[]): KathekonAssessment {
  return {
    action: 'a',
    quality: 'moderate',
    is_kathekon: true,
    proximity,
    passions_detected: [],
    virtue_domains_engaged: domains,
    oikeiosis_met: null,
    oikeiosis_stage: null,
  }
}

// ============================================================================
{
  // phronesis engaged at deliberate AND habitual → weakest = habitual.
  // dikaiosyne engaged at principled only → principled.
  // andreia, sophrosyne unengaged → null.
  const p = computePerDomainProximity([
    action('deliberate', ['phronesis', 'dikaiosyne']),
    action('habitual', ['phronesis']),
    action('principled', ['dikaiosyne']),
  ])
  assert('PD-1  phronesis = weakest engaging action (habitual)', p.phronesis === 'habitual', `got ${p.phronesis}`)
  assert('PD-2  dikaiosyne = weakest engaging action (deliberate)', p.dikaiosyne === 'deliberate', `got ${p.dikaiosyne}`)
  assert('PD-3  andreia unengaged → null', p.andreia === null)
  assert('PD-4  sophrosyne unengaged → null', p.sophrosyne === null)
  // KP-04 aggregate = lowest non-null domain = habitual (phronesis).
  assert('PD-5  KP-04 aggregate = lowest non-null domain', p.aggregate === 'habitual', `got ${p.aggregate}`)
}

{
  // All four domains engaged at varying levels; aggregate = lowest.
  const p = computePerDomainProximity([
    action('sage_like', ['phronesis']),
    action('principled', ['dikaiosyne']),
    action('deliberate', ['andreia']),
    action('reflexive', ['sophrosyne']),
  ])
  assert('PD-6  each single-domain proximity preserved',
    p.phronesis === 'sage_like' && p.dikaiosyne === 'principled' && p.andreia === 'deliberate' && p.sophrosyne === 'reflexive')
  assert('PD-7  KP-04 aggregate = reflexive (the weakest cardinal domain)', p.aggregate === 'reflexive')
}

{
  const empty = computePerDomainProximity([])
  assert('PD-8  empty actions → all domains null',
    empty.phronesis === null && empty.dikaiosyne === null && empty.andreia === null && empty.sophrosyne === null)
  assert('PD-9  empty actions → aggregate null', empty.aggregate === null)
}

{
  assert('PD-10 canonical domain set is the four cardinals',
    VIRTUE_DOMAINS.length === 4 && ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'].every((d) => VIRTUE_DOMAINS.includes(d as VirtueDomain)))
}

// ============================================================================
console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
