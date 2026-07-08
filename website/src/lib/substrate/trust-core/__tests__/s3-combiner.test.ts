/**
 * s3-combiner.test.ts — Trust Layer S3 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>   (pure lib; the only runtime import
 * beyond the S3 lib is `analyseLoopClosure` from the CI-4 gate, which is
 * self-contained/pure — no Supabase chain, runs bare, no --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare) — the review dimensions:
 *   A1 routing on the corroboration key —
 *     - default (no justice) → deterministic authoritative, LLM never a source;
 *     - justice pre-corroboration → LLM second-reads (normal); agree→stands, conflict→pause;
 *     - justice post-corroboration CORROBORATED → deterministic authoritative, LLM NOT a source;
 *     - justice post-corroboration UNCORROBORATED/CONTRADICTED → LLM supplementary, low-confidence;
 *     - LLM owed-but-absent (dark) → deterministic stands, honestly flagged;
 *     - deterministic 'unevaluated' vs any LLM → conflict → pause.
 *   Conflict → pause, NEVER average —
 *     - A1: conflict ⇒ verdict null (no merged value);
 *     - B: cross-session conflict ⇒ level = conservative MIN ∈ inputs (never a mean);
 *     - C: any domain conflict ⇒ aggregate pause, level = categorical min ∈ inputs.
 *   Per-domain isolation —
 *     - B: a verdict never leaves its domain; changing/removing domain X never changes Y;
 *     - C: changing domain X's source never changes Y's contributing level/weight.
 *   The A2 zeroed-source → no-coverage handoff —
 *     - C: a required domain whose credential is zeroed is a coverage gap: level falls
 *       to min(effective,prior) (never the credential uplift) + aggregate confidence 0
 *       (a zero-confidence credential can never contribute to a proceed — mentor A2).
 *   Within-session supersession (CI-4 reuse, locked to analyseLoopClosure) —
 *     - a re-examination at ≥ depth supersedes; only terminals survive; an
 *       insufficient-depth or missing re-examination leaves the redirection open.
 *   Worse evidence → lower-or-equal aggregate (monotonicity) —
 *     - lower effective level / lower evidence weight / zero a credential ⇒ aggregate
 *       lower-or-equal (level and/or confidence).
 *   Spec-6 aggregate = minimum-domain (reuses computeAggregate), categorical.
 */

import type { VirtueDomain } from '@/lib/translation-sandwich/layer2-mechanisms'
import { analyseLoopClosure } from '@/app/api/accreditation/[agent_id]/loop-closure-gate'
import {
  routeObligationField,
  combineVerificationResults,
  computeWeightedAggregate,
  type ObligationRoutingInput,
  type VerificationVerdict,
  type DomainTrustSource,
} from '../combiner'
import { assessConfidence, type VerdictQualityDimensions } from '../confidence-tiers'
import {
  computeCredentialTransfer,
  weighEvidence,
  type FunctionTypeProfile,
  type WeightedEvidence,
} from '../evidence-weighting'
import { PROXIMITY_RANK } from '../constants'
import { computeAggregate } from '../trust-aggregate'
import type { EffectiveDomainTrust, VirtueTrustDomain } from '../types'

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

// Helpers ---------------------------------------------------------------------
function dims(o: Partial<VerdictQualityDimensions> = {}): VerdictQualityDimensions {
  return { depth: 'deep', signature: 'signed', corroboration: 'corroborated', recency: 'recent', ...o }
}
const CONF1 = assessConfidence(dims()) // tier 1
function fn(functionType: string, w: Partial<Record<VirtueDomain, number>>): FunctionTypeProfile {
  return { functionType, domainWeights: { phronesis: 0, dikaiosyne: 0, andreia: 0, sophrosyne: 0, ...w } }
}
/** A contributing credential evidence on `req` (cred + task both exercise `req`). */
function credEvidence(
  req: VirtueDomain,
  opts: { confidence?: ReturnType<typeof assessConfidence>; floor?: number } = {},
): WeightedEvidence {
  const transfer = computeCredentialTransfer(
    fn('cred', { [req]: 0.8, phronesis: 0.5 }),
    fn('task', { [req]: 0.8, phronesis: 0.5 }),
    opts.floor !== undefined ? { perDomainTransferFloor: opts.floor } : {},
  )
  return weighEvidence({ tier: 'credential', confidence: opts.confidence ?? CONF1, requiredDomain: req, transfer })
}
/** A ZEROED credential evidence on `req` (cred exercised a DIFFERENT domain, never
 *  `req` ⇒ τ_req = 0 ⇒ the A2 zero-floor fires). */
function zeroedCredEvidence(req: VirtueDomain): WeightedEvidence {
  const other: VirtueDomain = req === 'sophrosyne' ? 'andreia' : 'sophrosyne'
  const transfer = computeCredentialTransfer(fn('cred', { [other]: 0.9 }), fn('task', { [req]: 0.8 }))
  return weighEvidence({ tier: 'credential', confidence: CONF1, requiredDomain: req, transfer })
}
function verdict(o: Partial<VerificationVerdict> & Pick<VerificationVerdict, 'domain' | 'level' | 'occurredAt'>): VerificationVerdict {
  return { sessionId: o.sessionId ?? 's', markers: o.markers ?? {}, confidence: o.confidence ?? CONF1, ...o }
}
function src(o: Partial<DomainTrustSource> & Pick<DomainTrustSource, 'domain' | 'effectiveLevel' | 'evidence'>): DomainTrustSource {
  return { required: true, profilePrior: 'habitual', ...o }
}

// ============================================================================
// 1. A1 — default task (no justice surface): deterministic authoritative
// ============================================================================
;(() => {
  const base: ObligationRoutingInput = {
    taskHasJusticeSurface: false,
    corroborationAvailable: true,
    deterministic: 'met',
    llm: 'violated', // even a CONFLICTING LLM verdict is never a source on a default task
  }
  const r = routeObligationField(base)
  eq(r.regime, 'default-no-justice', 'A1 default: regime')
  eq(r.verdict, 'met', 'A1 default: deterministic verdict stands')
  eq(r.resolution, 'deterministic-authoritative', 'A1 default: authoritative')
  eq(r.llmConsulted, false, 'A1 default: LLM never consulted (no parallel LLM)')
  eq(r.conflict, false, 'A1 default: no conflict even with a divergent LLM value')
})()

// ============================================================================
// 2. A1 — justice PRE-corroboration: LLM second-reads (normal confidence)
// ============================================================================
;(() => {
  const pre = (llm: 'met' | 'violated' | 'indeterminate' | null): ObligationRoutingInput => ({
    taskHasJusticeSurface: true,
    corroborationAvailable: false,
    deterministic: 'met',
    llm,
  })
  const agree = routeObligationField(pre('met'))
  eq(agree.regime, 'justice-pre-corroboration', 'A1 pre: regime')
  eq(agree.llmConsulted, true, 'A1 pre: LLM consulted')
  eq(agree.llmConfidence, 'normal', 'A1 pre: LLM normal confidence')
  eq(agree.verdict, 'met', 'A1 pre: agree ⇒ deterministic stands')
  eq(agree.conflict, false, 'A1 pre: agree ⇒ no conflict')

  const conflict = routeObligationField(pre('violated'))
  eq(conflict.conflict, true, 'A1 pre: disagree ⇒ conflict')
  eq(conflict.resolution, 'pause-escalate', 'A1 pre: conflict ⇒ pause-escalate')
  eq(conflict.verdict, null, 'A1 pre: conflict ⇒ verdict NULL (never averaged)')

  const owed = routeObligationField(pre(null))
  eq(owed.llmConsulted, false, 'A1 pre: absent LLM ⇒ not consulted')
  eq(owed.llmOwedButAbsent, true, 'A1 pre: absent LLM ⇒ flagged owed-but-absent')
  eq(owed.llmConfidence, null, 'A1 pre: absent LLM ⇒ llmConfidence null (not a source, per the field contract)')
  eq(owed.verdict, 'met', 'A1 pre: absent LLM ⇒ deterministic stands (measure mode)')
  eq(owed.conflict, false, 'A1 pre: absent LLM ⇒ no fabricated conflict')

  // Owed-but-absent on a post-corroboration uncorroborated justice field: still null.
  const owedPost = routeObligationField({
    taskHasJusticeSurface: true, corroborationAvailable: true, fieldCorroboration: 'uncorroborated', deterministic: 'met', llm: null,
  })
  eq(owedPost.llmOwedButAbsent, true, 'A1 post-uncorroborated: absent LLM ⇒ owed-but-absent')
  eq(owedPost.llmConfidence, null, 'A1 post-uncorroborated: absent LLM ⇒ llmConfidence null (not a source)')
})()

// ============================================================================
// 3. A1 — justice POST-corroboration, CORROBORATED field: LLM NOT a source
// ============================================================================
;(() => {
  const r = routeObligationField({
    taskHasJusticeSurface: true,
    corroborationAvailable: true,
    fieldCorroboration: 'corroborated',
    deterministic: 'met',
    llm: 'violated', // a CONFLICTING LLM verdict must NOT be routed on a corroborated field
  })
  eq(r.regime, 'justice-post-corroboration-corroborated', 'A1 post-corroborated: regime')
  eq(r.llmConsulted, false, 'A1 post-corroborated: LLM not a source (role narrowed away)')
  eq(r.verdict, 'met', 'A1 post-corroborated: deterministic authoritative')
  eq(r.conflict, false, 'A1 post-corroborated: no conflict (single source by design)')
  eq(r.sources.llm, 'violated', 'A1 post-corroborated: the injected LLM value is recorded for transparency')
})()

// ============================================================================
// 4. A1 — justice POST-corroboration, UNCORROBORATED / CONTRADICTED: LLM supplementary (low)
// ============================================================================
;(() => {
  for (const fc of ['uncorroborated', 'contradicted'] as const) {
    const agree = routeObligationField({
      taskHasJusticeSurface: true, corroborationAvailable: true, fieldCorroboration: fc, deterministic: 'violated', llm: 'violated',
    })
    eq(agree.regime, 'justice-post-corroboration-uncorroborated', `A1 post-${fc}: regime (routes like uncorroborated)`)
    eq(agree.llmConsulted, true, `A1 post-${fc}: LLM supplementary`)
    eq(agree.llmConfidence, 'low', `A1 post-${fc}: explicit LOW confidence`)
    eq(agree.verdict, 'violated', `A1 post-${fc}: agree ⇒ deterministic stands`)

    const conflict = routeObligationField({
      taskHasJusticeSurface: true, corroborationAvailable: true, fieldCorroboration: fc, deterministic: 'met', llm: 'violated',
    })
    eq(conflict.conflict, true, `A1 post-${fc}: disagree ⇒ conflict`)
    eq(conflict.resolution, 'pause-escalate', `A1 post-${fc}: conflict ⇒ pause`)
    eq(conflict.verdict, null, `A1 post-${fc}: conflict ⇒ verdict NULL`)
    eq(conflict.llmConfidence, 'low', `A1 post-${fc}: conflict still marks LLM low-confidence`)
  }
})()

// ============================================================================
// 5. A1 — deterministic 'unevaluated' vs any LLM value ⇒ conflict ⇒ pause
// ============================================================================
;(() => {
  const r = routeObligationField({
    taskHasJusticeSurface: true, corroborationAvailable: false, deterministic: 'unevaluated', llm: 'met',
  })
  eq(r.conflict, true, "A1 unevaluated: deterministic 'unevaluated' vs LLM 'met' ⇒ conflict")
  eq(r.resolution, 'pause-escalate', 'A1 unevaluated: ⇒ pause (never proceed on unevaluated)')
  eq(r.verdict, null, 'A1 unevaluated: ⇒ verdict null')
})()

// ============================================================================
// 6. Section B — within-session supersession, LOCKED to analyseLoopClosure
// ============================================================================
;(() => {
  // Fully-marked, sufficient-depth re-examination ⇒ CLOSED; original superseded.
  const closedChain: VerificationVerdict[] = [
    verdict({ domain: 'phronesis', level: 'habitual', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'S', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'standard' } }),
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-07-01T01:00:00Z', sessionId: 'S', markers: { ref: 'B', depth_tier: 'standard', prior_feedback_ref: 'A' } }),
  ]
  const closureVerdict = analyseLoopClosure(closedChain.map((v) => ({
    assessment: { improvement_path_structured: v.issuedRedirection ? {} : null, examination: v.markers },
  })))
  eq(closureVerdict.verdict, 'closed', 'B lock: analyseLoopClosure says CLOSED for a same-depth re-exam')
  const combinedClosed = combineVerificationResults(closedChain)
  eq(combinedClosed.length, 1, 'B: closed chain ⇒ 1 domain result')
  eq(combinedClosed[0].terminals.length, 1, 'B: original A superseded ⇒ only terminal B survives')
  eq(combinedClosed[0].level, 'principled', 'B: terminal (B) level authoritative, not the superseded A')
  eq(combinedClosed[0].openLoop, false, 'B: closed chain ⇒ no open loop')

  // Insufficient-depth re-examination (standard < deep) ⇒ UNCLOSED; A NOT superseded.
  const openChain: VerificationVerdict[] = [
    verdict({ domain: 'andreia', level: 'reflexive', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'T', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'deep' } }),
    verdict({ domain: 'andreia', level: 'principled', occurredAt: '2026-07-01T01:00:00Z', sessionId: 'T', markers: { ref: 'B', depth_tier: 'standard', prior_feedback_ref: 'A' } }),
  ]
  const openClosure = analyseLoopClosure(openChain.map((v) => ({
    assessment: { improvement_path_structured: v.issuedRedirection ? {} : null, examination: v.markers },
  })))
  eq(openClosure.verdict, 'unclosed', 'B lock: analyseLoopClosure says UNCLOSED for standard-re-exam of a deep redirection')
  const combinedOpen = combineVerificationResults(openChain)
  eq(combinedOpen[0].terminals.length, 2, 'B: insufficient-depth re-exam ⇒ A NOT superseded (both terminals)')
  eq(combinedOpen[0].openLoop, true, 'B: unclosed chain ⇒ open loop surfaced')

  // A lone redirection with no re-examination ⇒ open loop, single terminal.
  const lone: VerificationVerdict[] = [
    verdict({ domain: 'sophrosyne', level: 'deliberate', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'U', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'standard' } }),
  ]
  const combinedLone = combineVerificationResults(lone)
  eq(combinedLone[0].openLoop, true, 'B: redirection with no re-exam ⇒ open loop')
  eq(combinedLone[0].terminals.length, 1, 'B: lone redirection ⇒ its own terminal')

  // FIDELITY FIX: a redirection with a ref but NO depth_tier is INDETERMINATE per
  // CI-4 — closure cannot be verified, so it is NOT superseded (evidence kept), and
  // analyseLoopClosure agrees (unclosed ⇒ open loop). The conservative direction.
  const depthlessChain: VerificationVerdict[] = [
    verdict({ domain: 'phronesis', level: 'habitual', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'W', issuedRedirection: true, markers: { ref: 'A' } }),
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-07-01T01:00:00Z', sessionId: 'W', markers: { ref: 'B', depth_tier: 'standard', prior_feedback_ref: 'A' } }),
  ]
  const depthlessClosure = analyseLoopClosure(depthlessChain.map((v) => ({
    assessment: { improvement_path_structured: v.issuedRedirection ? {} : null, examination: v.markers },
  })))
  eq(depthlessClosure.verdict, 'unclosed', 'B lock: analyseLoopClosure says UNCLOSED for a depth-less redirection (indeterminate)')
  const combinedDepthless = combineVerificationResults(depthlessChain)
  eq(combinedDepthless[0].terminals.length, 2, 'B fidelity: depth-less redirection NOT superseded (evidence kept)')
  eq(combinedDepthless[0].openLoop, true, 'B fidelity: depth-less redirection ⇒ open loop (matches analyseLoopClosure)')

  // QUICK-tier consistency (locks DEPTH_RANK.quick, which the standard/deep chains
  // above never exercise): a quick re-exam of a quick redirection ⇒ CLOSED + superseded.
  const quickChain: VerificationVerdict[] = [
    verdict({ domain: 'sophrosyne', level: 'habitual', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'Q', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'quick' } }),
    verdict({ domain: 'sophrosyne', level: 'deliberate', occurredAt: '2026-07-01T01:00:00Z', sessionId: 'Q', markers: { ref: 'B', depth_tier: 'quick', prior_feedback_ref: 'A' } }),
  ]
  const quickClosure = analyseLoopClosure(quickChain.map((v) => ({
    assessment: { improvement_path_structured: v.issuedRedirection ? {} : null, examination: v.markers },
  })))
  eq(quickClosure.verdict, 'closed', 'B lock: analyseLoopClosure CLOSED for a quick-re-exam of a quick redirection')
  const combinedQuick = combineVerificationResults(quickChain)
  eq(combinedQuick[0].terminals.length, 1, 'B lock (quick tier): A superseded ⇒ only terminal B survives')
  eq(combinedQuick[0].level, 'deliberate', 'B lock (quick tier): terminal B authoritative')
})()

// ============================================================================
// 7. Section B — cross-session weighted recency + conflict (never average)
// ============================================================================
;(() => {
  // No conflict: recent deliberate, older principled, 1-rank gap ⇒ take the recent.
  const noConflict = combineVerificationResults([
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-06-25T00:00:00Z', sessionId: 'a' }),
    verdict({ domain: 'phronesis', level: 'deliberate', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'b' }),
  ])
  eq(noConflict[0].conflict, false, 'B recency: 1-rank drift ⇒ no conflict')
  eq(noConflict[0].level, 'deliberate', 'B recency: most-recent authoritative (weighted recency)')

  // Conflict: recent reflexive vs still-material older principled (3-rank gap) ⇒ pause.
  const conflict = combineVerificationResults([
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-06-25T00:00:00Z', sessionId: 'a' }),
    verdict({ domain: 'phronesis', level: 'reflexive', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'b' }),
  ])
  eq(conflict[0].conflict, true, 'B recency: 3-rank reversal between material terminals ⇒ conflict')
  eq(conflict[0].resolution, 'pause-escalate', 'B recency: conflict ⇒ pause')
  eq(conflict[0].level, 'reflexive', 'B recency: conflict ⇒ CONSERVATIVE min ∈ inputs')
  assert(conflict[0].level !== 'deliberate', 'B recency: conflict level is NOT the arithmetic mean (never average)')

  // Stale old verdict decayed below the material floor ⇒ no conflict (recency dominates).
  const stale = combineVerificationResults([
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2020-01-01T00:00:00Z', sessionId: 'a' }),
    verdict({ domain: 'phronesis', level: 'reflexive', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'b' }),
  ])
  eq(stale[0].conflict, false, 'B recency: a stale (decayed) old verdict does not trigger a conflict')
  eq(stale[0].level, 'reflexive', 'B recency: recency dominates a decayed old verdict')
})()

// ============================================================================
// 8. Section B — per-domain isolation (structural)
// ============================================================================
;(() => {
  const both = combineVerificationResults([
    verdict({ domain: 'phronesis', level: 'reflexive', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'a' }),
    verdict({ domain: 'dikaiosyne', level: 'principled', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'a' }),
  ])
  const ph = both.find((d) => d.domain === 'phronesis')!
  const dk = both.find((d) => d.domain === 'dikaiosyne')!
  eq(ph.level, 'reflexive', 'B isolation: phronesis keeps its own level')
  eq(dk.level, 'principled', 'B isolation: dikaiosyne keeps its own level (no bleed from phronesis)')

  // Removing the phronesis verdict leaves dikaiosyne's result byte-identical.
  const dkOnly = combineVerificationResults([
    verdict({ domain: 'dikaiosyne', level: 'principled', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'a' }),
  ])
  eq(dkOnly.length, 1, 'B isolation: removing phronesis ⇒ only dikaiosyne remains')
  eq(JSON.stringify(dkOnly[0]), JSON.stringify(dk), 'B isolation: dikaiosyne result unchanged by removing another domain')
})()

// ============================================================================
// 8b. Section B — per-domain isolation REGRESSIONS (review folds; NON-vacuous)
// ============================================================================
;(() => {
  // FOLD (domain-blind supersession — the unsafe bleed): one examination A engages
  // phronesis + dikaiosyne (dikaiosyne = reflexive justice violation); a PARTIAL
  // re-examination B re-covers ONLY phronesis. B must supersede A's phronesis but
  // must NOT erase A's dikaiosyne=reflexive (which B never re-examined).
  const partialReExam: VerificationVerdict[] = [
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'S', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'standard' } }),
    verdict({ domain: 'dikaiosyne', level: 'reflexive', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'S', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'standard' } }),
    verdict({ domain: 'phronesis', level: 'sage_like', occurredAt: '2026-07-01T01:00:00Z', sessionId: 'S', markers: { ref: 'B', depth_tier: 'standard', prior_feedback_ref: 'A' } }),
  ]
  const combinedPartial = combineVerificationResults(partialReExam)
  const phR = combinedPartial.find((d) => d.domain === 'phronesis')!
  const dkR = combinedPartial.find((d) => d.domain === 'dikaiosyne')
  eq(phR.level, 'sage_like', 'B isolation: phronesis re-exam B supersedes A (phronesis authoritative)')
  assert(dkR !== undefined, 'B isolation FOLD: the un-re-examined dikaiosyne verdict is NOT erased by a phronesis re-exam')
  eq(dkR!.level, 'reflexive', 'B isolation FOLD: the dikaiosyne justice-violation floor survives (never bleeds away)')

  // A FULL re-examination (B re-covers BOTH domains) supersedes both — identical to
  // examination-level (per-domain scoping only differs on partial re-exams).
  const fullReExam: VerificationVerdict[] = [
    ...partialReExam,
    verdict({ domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-01T01:00:00Z', sessionId: 'S', markers: { ref: 'B', depth_tier: 'standard', prior_feedback_ref: 'A' } }),
  ]
  const combinedFull = combineVerificationResults(fullReExam)
  eq(combinedFull.find((d) => d.domain === 'dikaiosyne')!.level, 'deliberate', 'B isolation: a FULL re-exam supersedes dikaiosyne too (== examination-level)')

  // FOLD (openLoop bleed): phronesis leaves a redirection UNCLOSED; dikaiosyne (same
  // session, no redirection) must NOT inherit openLoop. Removing phronesis must not
  // change dikaiosyne's openLoop.
  const openBleed: VerificationVerdict[] = [
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'x', issuedRedirection: true, markers: { ref: 'A', depth_tier: 'standard' } }),
    verdict({ domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'x', markers: { ref: 'B' } }),
  ]
  const bleedResult = combineVerificationResults(openBleed)
  eq(bleedResult.find((d) => d.domain === 'phronesis')!.openLoop, true, 'B isolation FOLD: phronesis (unclosed redirection) ⇒ its own openLoop true')
  eq(bleedResult.find((d) => d.domain === 'dikaiosyne')!.openLoop, false, 'B isolation FOLD: dikaiosyne openLoop NOT set by phronesis open loop (no cross-domain bleed)')
  const dkAlone = combineVerificationResults([openBleed[1]])
  eq(dkAlone[0].openLoop, bleedResult.find((d) => d.domain === 'dikaiosyne')!.openLoop, 'B isolation FOLD: removing phronesis does not change dikaiosyne openLoop (non-vacuous)')
})()

// ============================================================================
// 9. Section C — spec-6 aggregate = minimum-domain (reuses computeAggregate), categorical
// ============================================================================
;(() => {
  const sources: DomainTrustSource[] = [
    src({ domain: 'phronesis', effectiveLevel: 'principled', evidence: credEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'deliberate', evidence: credEvidence('dikaiosyne') }),
  ]
  const agg = computeWeightedAggregate(sources)
  eq(agg.level, 'deliberate', 'C: aggregate = minimum-domain level')
  eq(agg.limitingDomain, 'dikaiosyne', 'C: limiting domain is the weakest')
  eq(agg.resolution, 'combined', 'C: no conflict ⇒ combined')

  // Matches computeAggregate on the equivalent EffectiveDomainTrust (S1 core reuse).
  const equiv: EffectiveDomainTrust[] = sources.map((s) => ({
    virtueDomain: s.domain as VirtueTrustDomain, effectiveLevel: s.effectiveLevel, earnedLevel: s.effectiveLevel,
    profilePrior: 'habitual', decayStepsApplied: 0, justiceCapped: false, reflectModulated: false, coverageStatus: null, hasEvidence: true,
  }))
  eq(agg.level, computeAggregate(equiv).level, 'C: aggregate LEVEL matches the reused computeAggregate core')

  // Categorical — the level is a proximity literal, never a number/mean.
  assert(typeof agg.level === 'string' && agg.level in PROXIMITY_RANK, 'C: aggregate level is categorical (a proximity literal)')
})()

// ============================================================================
// 10. Section C — the A2 zeroed-source → no-coverage handoff (load-bearing)
// ============================================================================
;(() => {
  // phronesis: a credential that never exercised phronesis (zeroed), demonstrating
  // a HIGH effective level via that credential — must NOT lift the aggregate.
  const sources: DomainTrustSource[] = [
    src({ domain: 'phronesis', effectiveLevel: 'principled', profilePrior: 'habitual', evidence: zeroedCredEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'deliberate', evidence: credEvidence('dikaiosyne') }),
  ]
  const agg = computeWeightedAggregate(sources)
  assert(agg.coverageGaps.includes('phronesis'), 'C A2: zeroed credential ⇒ phronesis is a coverage gap')
  eq(agg.aggregateConfidenceWeight, 0, 'C A2: a required coverage gap ⇒ aggregate confidence 0 (no confident proceed)')
  // Level fell back to min(principled, habitual)=habitual for phronesis ⇒ aggregate min = habitual (NOT principled).
  eq(agg.level, 'habitual', 'C A2: zeroed credential falls to the profile prior, never the credential uplift')
  assert(PROXIMITY_RANK[agg.level!] < PROXIMITY_RANK['principled'], 'C A2: a zeroed credential can never lift the aggregate to its demonstrated level')

  // The S2 primitive itself: the zeroed credential's own evidence weight is 0.
  eq(zeroedCredEvidence('phronesis').weight, 0, 'C A2: the zeroed credential evidence weight is 0 (S2 enforcement)')
})()

// ============================================================================
// 11. Section C — per-domain isolation (changing X never changes Y's contribution)
// ============================================================================
;(() => {
  const y = src({ domain: 'dikaiosyne', effectiveLevel: 'deliberate', evidence: credEvidence('dikaiosyne') })
  const withStrongX = computeWeightedAggregate([src({ domain: 'phronesis', effectiveLevel: 'sage_like', evidence: credEvidence('phronesis') }), y])
  const withWeakX = computeWeightedAggregate([src({ domain: 'phronesis', effectiveLevel: 'reflexive', evidence: credEvidence('phronesis') }), y])
  // dikaiosyne's own contributing level is deliberate in BOTH — only the min (limiting) changes.
  eq(withStrongX.level, 'deliberate', 'C isolation: strong-X aggregate limited by dikaiosyne (unchanged)')
  eq(withWeakX.level, 'reflexive', 'C isolation: weak-X aggregate limited by phronesis; dikaiosyne contribution unchanged')
  // dikaiosyne is never re-valued by X — the limiting domain flips, but Y's value is constant.
  assert(withStrongX.limitingDomain === 'dikaiosyne' && withWeakX.limitingDomain === 'phronesis', 'C isolation: only the minimum flips; Y is not re-valued')
})()

// ============================================================================
// 12. Section C — monotonicity: worse evidence ⇒ lower-or-equal aggregate
// ============================================================================
;(() => {
  const baseline = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'principled', evidence: credEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'principled', evidence: credEvidence('dikaiosyne') }),
  ])

  // (a) Lower phronesis effective level ⇒ aggregate LEVEL lower-or-equal.
  const lowerLevel = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'habitual', evidence: credEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'principled', evidence: credEvidence('dikaiosyne') }),
  ])
  assert(PROXIMITY_RANK[lowerLevel.level!] <= PROXIMITY_RANK[baseline.level!], 'C monotone: lower effective level ⇒ aggregate level lower-or-equal')

  // (b) Lower a domain's S2 confidence ⇒ aggregate CONFIDENCE lower-or-equal.
  const lowerConf = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'principled', evidence: credEvidence('phronesis', { confidence: assessConfidence(dims({ depth: 'quick' })) }) }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'principled', evidence: credEvidence('dikaiosyne') }),
  ])
  assert(lowerConf.aggregateConfidenceWeight <= baseline.aggregateConfidenceWeight + 1e-12, 'C monotone: lower confidence ⇒ aggregate confidence lower-or-equal')

  // (c) Zero a required credential ⇒ level lower-or-equal AND confidence 0.
  const zeroed = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'principled', profilePrior: 'habitual', evidence: zeroedCredEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'principled', evidence: credEvidence('dikaiosyne') }),
  ])
  assert(PROXIMITY_RANK[zeroed.level!] <= PROXIMITY_RANK[baseline.level!], 'C monotone: zeroing a credential ⇒ aggregate level lower-or-equal (never higher)')
  eq(zeroed.aggregateConfidenceWeight, 0, 'C monotone: zeroing a required credential ⇒ aggregate confidence 0')
})()

// ============================================================================
// 13. Section C — conflict ⇒ pause, categorical min ∈ inputs (never average)
// ============================================================================
;(() => {
  const agg = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'principled', evidence: credEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'reflexive', evidence: credEvidence('dikaiosyne'), conflict: true }),
  ])
  eq(agg.anyConflict, true, 'C conflict: a conflicting domain ⇒ anyConflict')
  eq(agg.resolution, 'pause-escalate', 'C conflict: ⇒ pause-escalate')
  eq(agg.level, 'reflexive', 'C conflict: level is still the categorical min ∈ inputs')
  assert(agg.level === 'reflexive' || agg.level === 'principled', 'C conflict: level ∈ input levels (never a mean)')
})()

// ============================================================================
// 14. Section C — justice cap + no-required-flag fallback (S1 behaviour preserved)
// ============================================================================
;(() => {
  // Justice cap surfaces through the reused core.
  const capped = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'principled', evidence: credEvidence('phronesis'), justiceCapped: true }),
  ])
  eq(capped.anyJusticeCapped, true, 'C: justice cap surfaced via the reused computeAggregate')

  // No source flagged required ⇒ aggregate over all sources (S1 fallback).
  const allSources = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'deliberate', required: false, evidence: credEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'principled', required: false, evidence: credEvidence('dikaiosyne') }),
  ])
  eq(allSources.level, 'deliberate', 'C: no required flag ⇒ minimum over all sources (S1 fallback)')

  // Empty ⇒ null.
  eq(computeWeightedAggregate([]).level, null, 'C: no sources ⇒ level null')
})()

// ============================================================================
// 15. End-to-end composition — obligation conflict ⇒ dikaiosyne conflict ⇒ aggregate pause
// ============================================================================
;(() => {
  const obligation = routeObligationField({
    taskHasJusticeSurface: true, corroborationAvailable: true, fieldCorroboration: 'uncorroborated', deterministic: 'met', llm: 'violated',
  })
  eq(obligation.resolution, 'pause-escalate', 'E2E: obligation-field conflict pauses')
  // The caller propagates the obligation pause onto the dikaiosyne domain source.
  const agg = computeWeightedAggregate([
    src({ domain: 'phronesis', effectiveLevel: 'principled', evidence: credEvidence('phronesis') }),
    src({ domain: 'dikaiosyne', effectiveLevel: 'deliberate', evidence: credEvidence('dikaiosyne'), conflict: obligation.conflict }),
  ])
  eq(agg.resolution, 'pause-escalate', 'E2E: the obligation-field pause propagates to the aggregate')

  // Full B→C composition: combine per-domain verdicts, then aggregate.
  const combined = combineVerificationResults([
    verdict({ domain: 'phronesis', level: 'principled', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'x' }),
    verdict({ domain: 'dikaiosyne', level: 'deliberate', occurredAt: '2026-07-01T00:00:00Z', sessionId: 'x' }),
  ])
  const aggFromCombined = computeWeightedAggregate(
    combined.map((d) => src({ domain: d.domain, effectiveLevel: d.level, evidence: credEvidence(d.domain as VirtueDomain), conflict: d.conflict })),
  )
  eq(aggFromCombined.level, 'deliberate', 'E2E: B→C composition yields the minimum-domain aggregate')
})()

// ============================================================================
// Summary
// ============================================================================
console.log(`\nS3 combiner battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFAILURES:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
