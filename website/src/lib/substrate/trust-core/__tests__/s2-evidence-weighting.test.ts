/**
 * s2-evidence-weighting.test.ts — Trust Layer S2 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>   (pure lib; reaches no Supabase
 * chain — the only external imports are type-only, run bare, no --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare):
 *   A5 confidence tiers —
 *     - the seven canonical exemplar tiers land EXACTLY where the mentor lists them;
 *     - all-max = tier 1; any single dimension weakened ⇒ strictly lower confidence;
 *     - the WEAKEST-DIMENSION-CEILING property (compound drops = the worst floor;
 *       strengthening a non-weakest dimension does not raise the tier);
 *     - unsigned caps at tier 6 regardless of the other dims; null ⇒ tier 7;
 *     - `contradicted` floored like uncorroborated (tier 3); ceiling dimension;
 *     - the derived weight scalar strictly decreasing across tiers 1..7.
 *   A2 domain distance + transfer —
 *     - distance = Σ|Δweights| (hand-checked); the mentor's data-analysis→comms example;
 *     - the zero-exercise boundary (cred never exercised d ⇒ τ_d = 0);
 *     - the deployer zero-floor (per-domain + total cutoff), DOMAIN-SCOPED;
 *     - the enforcement primitive credentialCanContribute.
 *   Composition (weighEvidence) —
 *     - THE LOAD-BEARING PROPERTY: a zeroed credential contributes 0 even at
 *       tier-1 credential + tier-1 confidence (can never reach a proceed);
 *     - the evidence-tier ordering; the justice-surface modifier (deficit lowers,
 *       never zeroes); monotonicity in every dimension (worse ⇒ lower-or-equal).
 */

import type { VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import {
  assessConfidence,
  PROFILE_PRIOR_CONFIDENCE,
  CONFIDENCE_TIER_WEIGHT,
  type VerdictQualityDimensions,
  type ConfidenceTier,
} from '../confidence-tiers'
import {
  domainDistance,
  computeCredentialTransfer,
  credentialCanContribute,
  weighEvidence,
  justiceSurfaceModifier,
  EVIDENCE_TIER_WEIGHT,
  JUSTICE_COVERAGE_DEFICIT_FACTOR,
  type FunctionTypeProfile,
  type EvidenceInput,
} from '../evidence-weighting'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}
function eq<T>(a: T, b: T, label: string): void {
  assert(a === b, `${label} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
}
function approx(a: number, b: number, label: string, tol = 1e-9): void {
  assert(Math.abs(a - b) < tol, `${label} (got ${a}, want ≈${b})`)
}

// Helper: a verdict dimensions object with sensible all-max defaults.
function dims(o: Partial<VerdictQualityDimensions> = {}): VerdictQualityDimensions {
  return { depth: 'deep', signature: 'signed', corroboration: 'corroborated', recency: 'recent', ...o }
}

// ============================================================================
// 1. A5 — the seven canonical exemplar tiers land exactly
// ============================================================================

eq(assessConfidence(dims()).tier, 1 as ConfidenceTier, 'A5 tier 1: deep+signed+corroborated+recent')
eq(assessConfidence(dims({ depth: 'standard' })).tier, 2, 'A5 tier 2: standard+signed+corroborated+recent')
eq(assessConfidence(dims({ corroboration: 'uncorroborated' })).tier, 3, 'A5 tier 3: deep+signed+UNcorroborated+recent')
eq(assessConfidence(dims({ depth: 'standard', corroboration: 'uncorroborated' })).tier, 3, 'A5 tier 3: standard+UNcorroborated (deep-OR-standard)')
eq(assessConfidence(dims({ recency: 'aged' })).tier, 4, 'A5 tier 4: deep+signed+corroborated+AGED')
eq(assessConfidence(dims({ depth: 'quick' })).tier, 5, 'A5 tier 5: QUICK+signed+corroborated+recent')
eq(assessConfidence(dims({ signature: 'unsigned' })).tier, 6, 'A5 tier 6: UNSIGNED (deep otherwise)')
eq(assessConfidence(null).tier, 7, 'A5 tier 7: profile-prior only (null)')
eq(PROFILE_PRIOR_CONFIDENCE.tier, 7, 'A5 PROFILE_PRIOR_CONFIDENCE = tier 7')

// ============================================================================
// 2. A5 — all-max = tier 1; any single drop is strictly lower confidence
// ============================================================================

;(() => {
  const base = assessConfidence(dims())
  eq(base.tier, 1, 'A5: all-max is tier 1')
  eq(base.ceilingDimension, 'none', 'A5: all-max ceiling = none')
  approx(base.weight, 1.0, 'A5: all-max weight = 1.0')

  const singles: [Partial<VerdictQualityDimensions>, string][] = [
    [{ depth: 'standard' }, 'standard'],
    [{ depth: 'quick' }, 'quick'],
    [{ corroboration: 'uncorroborated' }, 'uncorroborated'],
    [{ corroboration: 'contradicted' }, 'contradicted'],
    [{ recency: 'aged' }, 'aged'],
    [{ signature: 'unsigned' }, 'unsigned'],
  ]
  for (const [patch, name] of singles) {
    const a = assessConfidence(dims(patch))
    assert(a.tier > base.tier, `A5: single drop (${name}) strictly lower tier than all-max`)
    assert(a.weight < base.weight, `A5: single drop (${name}) strictly lower weight than all-max`)
  }
})()

// ============================================================================
// 3. A5 — the weakest-dimension-ceiling property (no compensation)
// ============================================================================

;(() => {
  // A quick verdict (tier 5) stays tier 5 even when corroboration AND recency also
  // drop — the weakest dimension (quick) sets the ceiling; adding lesser drops does
  // NOT lower it below its own floor, and strengthening them does NOT raise it.
  const quickAllElseBad = assessConfidence(dims({ depth: 'quick', corroboration: 'uncorroborated', recency: 'aged' }))
  eq(quickAllElseBad.tier, 5, 'A5 ceiling: quick+uncorroborated+aged stays tier 5 (quick is weakest)')
  eq(quickAllElseBad.ceilingDimension, 'depth', 'A5 ceiling: quick is the ceiling dimension')

  const quickAlone = assessConfidence(dims({ depth: 'quick' }))
  eq(quickAlone.tier, quickAllElseBad.tier, 'A5 ceiling: strengthening non-weakest dims cannot raise the tier')

  // standard + aged → recency (tier 4) is worse than standard (tier 2) ⇒ tier 4.
  const stdAged = assessConfidence(dims({ depth: 'standard', recency: 'aged' }))
  eq(stdAged.tier, 4, 'A5 ceiling: standard+aged → tier 4 (recency is the weakest)')
  eq(stdAged.ceilingDimension, 'recency', 'A5 ceiling: recency is the ceiling for standard+aged')

  // unsigned dominates everything (a hard gate): unsigned+quick+contradicted+aged → tier 6.
  const unsignedWorst = assessConfidence(dims({ signature: 'unsigned', depth: 'quick', corroboration: 'contradicted', recency: 'aged' }))
  eq(unsignedWorst.tier, 6, 'A5 ceiling: unsigned caps at tier 6 regardless of other dims')
  eq(unsignedWorst.ceilingDimension, 'signature', 'A5 ceiling: signature is the ceiling when unsigned')

  // unsigned but otherwise perfect → still tier 6 (signature cannot be compensated by depth).
  eq(assessConfidence(dims({ signature: 'unsigned' })).tier, 6, 'A5 ceiling: deep+unsigned still tier 6 (no depth compensation)')
})()

// ============================================================================
// 4. A5 — contradicted floored like uncorroborated; the single-drop severity order
// ============================================================================

;(() => {
  eq(assessConfidence(dims({ corroboration: 'contradicted' })).tier, 3, 'A5: contradicted → tier 3 (treated as not-corroborated)')
  eq(
    assessConfidence(dims({ corroboration: 'contradicted' })).tier,
    assessConfidence(dims({ corroboration: 'uncorroborated' })).tier,
    'A5: contradicted and uncorroborated land at the same confidence tier',
  )

  // The single-drop severity ordering, exactly as the mentor's tiers list it:
  // standard(2) < uncorroborated(3) < aged(4) < quick(5) < unsigned(6).
  const order = [
    assessConfidence(dims({ depth: 'standard' })).tier,
    assessConfidence(dims({ corroboration: 'uncorroborated' })).tier,
    assessConfidence(dims({ recency: 'aged' })).tier,
    assessConfidence(dims({ depth: 'quick' })).tier,
    assessConfidence(dims({ signature: 'unsigned' })).tier,
  ]
  for (let i = 1; i < order.length; i++) {
    assert(order[i] > order[i - 1], `A5: single-drop severity strictly increases at step ${i} (${order.join(',')})`)
  }
})()

// ============================================================================
// 5. A5 — the derived weight scalar is strictly decreasing across tiers 1..7
// ============================================================================

;(() => {
  for (let t = 2; t <= 7; t++) {
    assert(
      CONFIDENCE_TIER_WEIGHT[t as ConfidenceTier] < CONFIDENCE_TIER_WEIGHT[(t - 1) as ConfidenceTier],
      `A5: tier weight strictly decreasing at tier ${t}`,
    )
  }
  approx(CONFIDENCE_TIER_WEIGHT[1], 1.0, 'A5: tier-1 weight = 1.0')
  assert(CONFIDENCE_TIER_WEIGHT[7] > 0, 'A5: tier-7 weight > 0 (multiplier, never absolute zero)')
})()

// ============================================================================
// 6. A2 — domain distance = Σ|Δweights| (hand-checked)
// ============================================================================

function fn(functionType: string, w: Partial<Record<VirtueDomain, number>>): FunctionTypeProfile {
  return {
    functionType,
    domainWeights: { phronesis: 0, dikaiosyne: 0, andreia: 0, sophrosyne: 0, ...w },
  }
}

;(() => {
  const a = fn('A', { phronesis: 0.6, sophrosyne: 0.4 })
  const b = fn('B', { phronesis: 0.6, dikaiosyne: 0.5, sophrosyne: 0.1 })
  // |0.6-0.6| + |0-0.5| + |0-0| + |0.4-0.1| = 0 + 0.5 + 0 + 0.3 = 0.8
  approx(domainDistance(a, b), 0.8, 'A2: domainDistance = Σ|Δweights|')
  approx(domainDistance(a, a), 0, 'A2: distance to self = 0')
  approx(domainDistance(a, b), domainDistance(b, a), 'A2: distance is symmetric')
})()

// ============================================================================
// 7. A2 — per-dimension transfer reproduces the mentor's example + boundary
// ============================================================================

;(() => {
  // Mentor's example: data-analysis (phronesis + sophrosyne) → communication
  // (phronesis + dikaiosyne). phronesis SHARED ⇒ full transfer; dikaiosyne
  // DIVERGENT ⇒ reduced.
  const dataAnalysis = fn('data-analysis', { phronesis: 0.6, sophrosyne: 0.4, dikaiosyne: 0.1 })
  const communication = fn('communication', { phronesis: 0.6, dikaiosyne: 0.5, sophrosyne: 0.1 })
  const t = computeCredentialTransfer(dataAnalysis, communication)

  approx(t.perDomain.phronesis.factor, 1, 'A2: phronesis shared ⇒ full transfer (τ=1)')
  assert(t.perDomain.dikaiosyne.factor < 1 && t.perDomain.dikaiosyne.factor > 0, 'A2: dikaiosyne divergent ⇒ reduced transfer (0<τ<1)')
  // τ_dikaiosyne = 1 − |0.1−0.5|/(0.1+0.5) = 1 − 0.4/0.6 = 1/3.
  approx(t.perDomain.dikaiosyne.factor, 1 - 0.4 / 0.6, 'A2: dikaiosyne τ matches the normalised-difference formula')

  // Boundary: a credential that NEVER exercised a domain the task needs ⇒ τ=0.
  const neverJustice = fn('cred', { phronesis: 0.8, sophrosyne: 0.2 })
  const needsJustice = fn('task', { dikaiosyne: 0.7, phronesis: 0.3 })
  const t2 = computeCredentialTransfer(neverJustice, needsJustice)
  approx(t2.perDomain.dikaiosyne.factor, 0, 'A2 boundary: cred never exercised dikaiosyne ⇒ τ=0 for a task needing it')
  assert(!credentialCanContribute(t2, 'dikaiosyne'), 'A2 boundary: cannot contribute on an un-exercised required domain')
  assert(t2.perDomain.phronesis.factor > 0 && credentialCanContribute(t2, 'phronesis'), 'A2 boundary: still contributes on the shared phronesis domain (domain-scoped)')

  // Both weights equal ⇒ τ = 1.
  const same = computeCredentialTransfer(fn('x', { andreia: 0.5 }), fn('y', { andreia: 0.5 }))
  approx(same.perDomain.andreia.factor, 1, 'A2: equal weights ⇒ τ=1')
})()

// ============================================================================
// 8. A2 — the deployer zero-floor (per-domain + total cutoff), domain-scoped
// ============================================================================

;(() => {
  const cred = fn('cred', { phronesis: 0.9, dikaiosyne: 0.5, sophrosyne: 0.4 })
  const task = fn('task', { phronesis: 0.9, dikaiosyne: 0.1, sophrosyne: 0.4 })
  // Per-domain floor 0.5: dikaiosyne τ = 1 − 0.4/0.6 = 0.333 ≤ 0.5 ⇒ zeroed;
  // phronesis + sophrosyne τ=1 ⇒ kept.
  const t = computeCredentialTransfer(cred, task, { perDomainTransferFloor: 0.5 })
  assert(t.perDomain.dikaiosyne.zeroed && t.perDomain.dikaiosyne.factor === 0, 'A2 floor: weak dikaiosyne zeroed by per-domain floor')
  assert(!t.perDomain.phronesis.zeroed && credentialCanContribute(t, 'phronesis'), 'A2 floor: strong phronesis kept (domain-scoped)')
  assert(!credentialCanContribute(t, 'dikaiosyne'), 'A2 floor: zeroed dikaiosyne cannot contribute')

  // Total-distance cutoff zeroes EVERY domain (the whole credential = no credential).
  const far = computeCredentialTransfer(cred, task, { totalDistanceCutoff: 0.1 })
  for (const d of ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'] as VirtueDomain[]) {
    assert(far.perDomain[d].zeroed && !credentialCanContribute(far, d), `A2 total cutoff: ${d} zeroed (whole credential)`)
  }

  // Default thresholds (no floor): only an exact-zero τ is zeroed.
  const dflt = computeCredentialTransfer(cred, task)
  assert(!dflt.perDomain.dikaiosyne.zeroed && dflt.perDomain.dikaiosyne.factor > 0, 'A2 default: no per-domain floor ⇒ weak-but-nonzero τ kept')
})()

// ============================================================================
// 8b. A2 boundary fold (a2-enforcement review, medium) — a credential that never
//     exercised a domain must transfer ZERO on it even when the task's function
//     profile also weights it 0 and signals the justice surface via context; the
//     justice deficit must NOT rescue it.
// ============================================================================

;(() => {
  const cred = fn('cred', { phronesis: 0.9 }) // never exercised dikaiosyne
  const task = fn('task', { phronesis: 0.9 }) // task profile also 0 on dikaiosyne
  const transfer = computeCredentialTransfer(cred, task)
  approx(transfer.perDomain.dikaiosyne.factor, 0, 'A2 boundary: both-zero dikaiosyne ⇒ τ=0 (no spurious full match)')
  assert(!credentialCanContribute(transfer, 'dikaiosyne'), 'A2 boundary: cannot contribute on an un-exercised justice domain')
  const w = weighEvidence({
    tier: 'credential',
    confidence: assessConfidence(dims()),
    requiredDomain: 'dikaiosyne',
    transfer,
    justice: { taskHasJusticeSurface: true, credentialCoversJusticeEvaluation: false },
  })
  eq(w.weight, 0, 'A2 boundary: justice deficit does NOT rescue a zeroed credential on the justice domain')
})()

// ============================================================================
// 9. Composition — THE LOAD-BEARING enforcement property
// ============================================================================

;(() => {
  const cred = fn('cred', { phronesis: 0.9 })
  const task = fn('task', { dikaiosyne: 0.8, phronesis: 0.2 }) // cred never exercised dikaiosyne
  const transfer = computeCredentialTransfer(cred, task)
  const maxConfidence = assessConfidence(dims()) // tier 1, weight 1.0

  // A zeroed credential contributes 0 on the required domain EVEN at tier-1
  // credential + tier-1 confidence — it can never reach a proceed (mentor A2).
  const zeroed = weighEvidence({
    tier: 'credential',
    confidence: maxConfidence,
    requiredDomain: 'dikaiosyne',
    transfer,
  })
  eq(zeroed.weight, 0, 'ENFORCE: zeroed credential ⇒ weight 0 even at tier-1/tier-1')
  eq(zeroed.contributes, false, 'ENFORCE: zeroed credential ⇒ contributes false')
  eq(zeroed.components.a2ZeroFloorFired, true, 'ENFORCE: a2ZeroFloorFired flagged')

  // STRUCTURAL enforcement (compile-time): a credential source WITHOUT a transfer
  // is a TYPE ERROR — the A2 zero-floor cannot be bypassed by omitting the transfer.
  // The @ts-expect-error below FAILS tsc if the credential tier ever stops requiring
  // `transfer` (an unused-directive error), so this is a real regression lock. Not
  // executed (no runtime call), so no throw.
  // @ts-expect-error credential tier requires `transfer`
  const _mustHaveTransfer: EvidenceInput = { tier: 'credential', confidence: maxConfidence, requiredDomain: 'phronesis' }
  void _mustHaveTransfer
  assert(true, 'ENFORCE: credential tier requires a transfer at compile time (@ts-expect-error holds)')

  // The SAME credential contributes on the shared phronesis domain (domain-scoped).
  const shared = weighEvidence({
    tier: 'credential',
    confidence: maxConfidence,
    requiredDomain: 'phronesis',
    transfer,
  })
  assert(shared.weight > 0 && shared.contributes, 'ENFORCE: same credential contributes on the nonzero (phronesis) domain')

  // A deployer per-domain floor that zeroes phronesis blocks it too.
  const flooredTransfer = computeCredentialTransfer(cred, task, { perDomainTransferFloor: 0.99 })
  const blocked = weighEvidence({ tier: 'credential', confidence: maxConfidence, requiredDomain: 'phronesis', transfer: flooredTransfer })
  eq(blocked.weight, 0, 'ENFORCE: deployer floor zeroes phronesis ⇒ weight 0')
})()

// ============================================================================
// 10. Composition — evidence-tier ordering + justice modifier + monotonicity
// ============================================================================

;(() => {
  // Evidence-tier weights strictly decreasing: credential > behavioural > prior.
  assert(EVIDENCE_TIER_WEIGHT.credential > EVIDENCE_TIER_WEIGHT['behavioural-condition-matched'], 'tiers: credential > behavioural')
  assert(EVIDENCE_TIER_WEIGHT['behavioural-condition-matched'] > EVIDENCE_TIER_WEIGHT['profile-prior'], 'tiers: behavioural > profile-prior')

  const conf = assessConfidence(dims())
  // A full (non-zeroing) transfer on phronesis — isolates the tier/confidence effects.
  const FULL = computeCredentialTransfer(fn('c', { phronesis: 1 }), fn('t', { phronesis: 1 }))
  const credW = weighEvidence({ tier: 'credential', confidence: conf, requiredDomain: 'phronesis', transfer: FULL }).weight
  const behW = weighEvidence({ tier: 'behavioural-condition-matched', confidence: conf, requiredDomain: 'phronesis' }).weight
  const priorW = weighEvidence({ tier: 'profile-prior', confidence: conf, requiredDomain: 'phronesis' }).weight
  assert(credW > behW && behW > priorW, 'compose: weight strictly decreasing by evidence tier at equal confidence')

  // Justice-surface modifier: no surface ⇒ 1; covered ⇒ 1; uncovered ⇒ deficit (<1, >0).
  approx(justiceSurfaceModifier({ taskHasJusticeSurface: false, credentialCoversJusticeEvaluation: false }), 1, 'justice: no surface ⇒ 1')
  approx(justiceSurfaceModifier({ taskHasJusticeSurface: true, credentialCoversJusticeEvaluation: true }), 1, 'justice: surface + covered ⇒ 1')
  approx(justiceSurfaceModifier({ taskHasJusticeSurface: true, credentialCoversJusticeEvaluation: false }), JUSTICE_COVERAGE_DEFICIT_FACTOR, 'justice: surface + uncovered ⇒ deficit')

  // The justice deficit LOWERS but does not ZERO (contrast the A2 floor).
  const withDeficit = weighEvidence({
    tier: 'credential',
    confidence: conf,
    requiredDomain: 'phronesis',
    transfer: FULL,
    justice: { taskHasJusticeSurface: true, credentialCoversJusticeEvaluation: false },
  })
  assert(withDeficit.weight > 0 && withDeficit.weight < credW, 'compose: justice deficit lowers but does not zero')

  // Monotonicity in confidence: worse confidence tier ⇒ lower-or-equal weight.
  let prev = Infinity
  for (const patch of [{}, { depth: 'standard' as const }, { corroboration: 'uncorroborated' as const }, { recency: 'aged' as const }, { depth: 'quick' as const }, { signature: 'unsigned' as const }]) {
    const w = weighEvidence({ tier: 'credential', confidence: assessConfidence(dims(patch)), requiredDomain: 'phronesis', transfer: FULL }).weight
    assert(w <= prev + 1e-12, `compose: weight monotone non-increasing as confidence worsens (${JSON.stringify(patch)})`)
    prev = w
  }

  // Profile-prior-only source (tier-7 confidence) is a valid, low, nonzero contribution.
  const priorOnly = weighEvidence({ tier: 'profile-prior', confidence: PROFILE_PRIOR_CONFIDENCE, requiredDomain: 'phronesis' })
  assert(priorOnly.weight > 0 && priorOnly.weight < credW, 'compose: profile-prior tier-7 is a small nonzero contribution')
})()

// ============================================================================
// Summary
// ============================================================================

console.log(`\nS2 evidence-weighting battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFAILURES:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
