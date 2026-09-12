/**
 * s4-intervention-engine.test.ts — Trust Layer S4 instrument-fidelity battery.
 *
 * Plain-assertion script: npx tsx <this file>  (pure lib; runs bare — no --env-file).
 *
 * Proves (KG-EX1 instrument-fidelity, never beats-bare) — the review dimensions:
 *   Decision-table fidelity — every mentor spec-7 row → its EXACT disposition.
 *   Asymmetric justice modifier — justice can ONLY raise conservativeness, never
 *     lower it (across the full proximity × justice grid); `met` is neutral; at
 *     `deliberate` the join reproduces the mentor table exactly.
 *   Conflict → pause + escalate (consumed from S3), never average.
 *   A8 habitual-pause bound — two standard-depth re-examinations then escalate-to-
 *     Reflect (not before; not for a non-habitual pause; held, not do-not-proceed).
 *   Same-depth pause reuse — quick→standard (floor), standard→standard, deep→deep.
 *   A4 transparency grades + the per-domain functional threshold + deficit.
 *   MEASURE invariant — no path binds: every recommendation is advisory
 *     (mode 'measure', enforced false, humanOverridable true).
 *   R20c — a human decision supersedes any recommendation, unconditionally.
 *   Escalation payload — the completeness contract (trace + breakdown + justice record).
 *   Developmental flag — consistent deliberate flags; tracked, not intervened.
 *   A8 tail — the orchestrator's proceed-under-flag → the S1 oversight event.
 *   The S3 → S4 consumption seam.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { LoopDepthTier } from '@/lib/translation-sandwich/reason-loop-closure'
import {
  recommendIntervention,
  applyHabitualPauseBound,
  applyHumanOverride,
  buildEscalationPayload,
  escalationPayloadComplete,
  recordOrchestratorHabitualDecision,
  evaluateDevelopmentalFlags,
  interventionInputFromS3,
  sameDepthOrStandard,
  HABITUAL_REEXAMINATION_BOUND,
  DEVELOPMENTAL_CONSISTENCY_THRESHOLD,
  type InterventionAction,
  type InterventionRecommendation,
  type JusticeSurfaceState,
  type EscalationPayload,
} from '../intervention-engine'
import {
  assessOutputExaminability,
  assessDomainTransparency,
  buildTransparencyLedger,
  type OutputFeatures,
} from '../transparency-ledger'
import type { CombinedObligationVerdict, WeightedAggregateTrust } from '../combiner'
import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'

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
const ALL_PROXIMITY: KatorthomaProximity[] = ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like']
const ALL_JUSTICE: JusticeSurfaceState[] = ['none', 'met', 'indeterminate', 'unevaluated', 'violated']
const ACTION_RANK: Record<InterventionAction, number> = { proceed: 0, pause: 1, 'do-not-proceed': 2 }
function feat(o: Partial<OutputFeatures> = {}): OutputFeatures {
  return { hasSignedTrace: false, hasStatedUncertainty: false, hasStructuredVerdict: false, ...o }
}

// ════════════════════════════════════════════════════════════════════════════
// 1. Decision-table fidelity — the EXACT mentor spec-7 rows
// ════════════════════════════════════════════════════════════════════════════
{
  // sage-like / principled → proceed + log
  for (const p of ['sage_like', 'principled'] as KatorthomaProximity[]) {
    const r = recommendIntervention({ proximity: p })
    eq(r.action, 'proceed', `table: ${p} action`)
    eq(r.followUp, 'log', `table: ${p} followUp`)
    eq(r.tableRow, 'sage-like-or-principled-proceed', `table: ${p} row`)
  }

  // deliberate, no justice surface → log + continue (proceed + log)
  const d0 = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'none' })
  eq(d0.action, 'proceed', 'table: deliberate/none action')
  eq(d0.followUp, 'log', 'table: deliberate/none followUp')
  eq(d0.tableRow, 'deliberate-no-justice-log-continue', 'table: deliberate/none row')
  eq(d0.disposition, 'log + continue', 'table: deliberate/none disposition')

  // deliberate + justice met → proceed + log
  const dMet = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'met' })
  eq(dMet.action, 'proceed', 'table: deliberate/met action')
  eq(dMet.followUp, 'log', 'table: deliberate/met followUp')
  eq(dMet.tableRow, 'justice-met-proceed', 'table: deliberate/met row')

  // deliberate + justice indeterminate → pause + examine (standard depth)
  const dInd = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'indeterminate' })
  eq(dInd.action, 'pause', 'table: deliberate/indeterminate action')
  eq(dInd.followUp, 'examine', 'table: deliberate/indeterminate followUp')
  eq(dInd.tableRow, 'justice-indeterminate-pause', 'table: deliberate/indeterminate row')
  eq(dInd.reExamineDepth, 'standard', 'table: deliberate/indeterminate re-examine at standard')

  // deliberate + justice unevaluated → do not proceed + escalate
  const dUn = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'unevaluated' })
  eq(dUn.action, 'do-not-proceed', 'table: deliberate/unevaluated action')
  eq(dUn.followUp, 'escalate', 'table: deliberate/unevaluated followUp')
  eq(dUn.tableRow, 'justice-unevaluated-do-not-proceed', 'table: deliberate/unevaluated row')

  // habitual → pause + examine
  const hab = recommendIntervention({ proximity: 'habitual' })
  eq(hab.action, 'pause', 'table: habitual action')
  eq(hab.followUp, 'examine', 'table: habitual followUp')
  eq(hab.tableRow, 'habitual-pause', 'table: habitual row')
  eq(hab.habitualDriven, true, 'table: habitual habitualDriven')

  // reflexive → do not proceed + escalate
  const ref = recommendIntervention({ proximity: 'reflexive' })
  eq(ref.action, 'do-not-proceed', 'table: reflexive action')
  eq(ref.followUp, 'escalate', 'table: reflexive followUp')
  eq(ref.tableRow, 'reflexive-do-not-proceed', 'table: reflexive row')

  // ANY violated obligation → do not proceed + escalate (at every proximity)
  for (const p of ALL_PROXIMITY) {
    const r = recommendIntervention({ proximity: p, justiceSurface: 'violated' })
    eq(r.action, 'do-not-proceed', `table: ${p}/violated action (unconditional)`)
    eq(r.followUp, 'escalate', `table: ${p}/violated followUp`)
    assert(r.tableRow === 'violated-obligation-do-not-proceed' || r.tableRow === 'reflexive-do-not-proceed',
      `table: ${p}/violated row is a do-not-proceed row (got ${r.tableRow})`)
  }

  // conflict → pause + escalate (never average) — on a proceed-class baseline
  const conf = recommendIntervention({ proximity: 'sage_like', sourceConflict: true })
  eq(conf.action, 'pause', 'table: conflict action')
  eq(conf.followUp, 'escalate', 'table: conflict followUp')
  eq(conf.tableRow, 'source-conflict-pause-escalate', 'table: conflict row')

  // conflict on a reflexive baseline: do-not-proceed WINS (conservative join; the
  // conflict cannot make a reflexive action less blocked).
  const confRef = recommendIntervention({ proximity: 'reflexive', sourceConflict: true })
  eq(confRef.action, 'do-not-proceed', 'table: reflexive+conflict → do-not-proceed (conservative join)')
  assert(confRef.reasons.some((x) => x.includes('conflict')), 'table: reflexive+conflict still records the conflict reason')
}

// ════════════════════════════════════════════════════════════════════════════
// 2. Asymmetric justice modifier — only raises conservativeness, never lowers
// ════════════════════════════════════════════════════════════════════════════
{
  for (const p of ALL_PROXIMITY) {
    const baseline = recommendIntervention({ proximity: p, justiceSurface: 'none' })
    const baseRank = ACTION_RANK[baseline.action]
    for (const j of ALL_JUSTICE) {
      const r = recommendIntervention({ proximity: p, justiceSurface: j })
      assert(ACTION_RANK[r.action] >= baseRank,
        `asymmetry: ${p}/${j} action rank ${ACTION_RANK[r.action]} >= baseline ${baseRank} (justice never lowers conservativeness)`)
    }
    // `met` is strictly NEUTRAL — never changes the action from the no-justice baseline.
    const met = recommendIntervention({ proximity: p, justiceSurface: 'met' })
    eq(ACTION_RANK[met.action], baseRank, `asymmetry: ${p}/met is neutral (same action as baseline)`)
  }
  // The join can never RAISE the threshold (make it less conservative): there is no
  // (p, j) where a justice surface produces a proceed on a baseline that pauses/blocks.
  for (const p of ALL_PROXIMITY) {
    const baseline = recommendIntervention({ proximity: p, justiceSurface: 'none' })
    if (baseline.action !== 'proceed') {
      for (const j of ALL_JUSTICE) {
        const r = recommendIntervention({ proximity: p, justiceSurface: j })
        assert(r.action !== 'proceed', `asymmetry: ${p}/${j} does not relax a non-proceed baseline to proceed`)
      }
    }
  }

  // INTENTIONAL non-enumerated cells (disclosed design decision — the obligation
  // modifier is applied uniformly, always in the conservative direction; PINNED so
  // the behaviour is intentional + locked, and reproduces the mentor table at deliberate).
  // habitual + unevaluated — a REACHABLE input (deliberate cap floors AT deliberate) —
  // escalates rather than the bare-habitual pause+examine (unevaluated justice is the
  // most serious signal; warrants a human, not a re-examination).
  eq(recommendIntervention({ proximity: 'habitual', justiceSurface: 'unevaluated' }).action, 'do-not-proceed',
    'asymmetry (pin): habitual + unevaluated → do-not-proceed (more conservative than bare-habitual pause)')
  // principled/sage_like + open justice — non-arising live (the §4 cap), but if fed the
  // join stays conservative (never a proceed on an open justice surface).
  eq(recommendIntervention({ proximity: 'principled', justiceSurface: 'indeterminate' }).action, 'pause',
    'asymmetry (pin): principled + indeterminate → pause (conservative; §4 makes this non-arising live)')
  eq(recommendIntervention({ proximity: 'sage_like', justiceSurface: 'unevaluated' }).action, 'do-not-proceed',
    'asymmetry (pin): sage_like + unevaluated → do-not-proceed (conservative)')
  // met is neutral even at the top — never escalates a clean proceed.
  eq(recommendIntervention({ proximity: 'sage_like', justiceSurface: 'met' }).action, 'proceed',
    'asymmetry (pin): sage_like + met → proceed (met never raises conservativeness)')
}

// ════════════════════════════════════════════════════════════════════════════
// 3. A8 — habitual-pause termination bound
// ════════════════════════════════════════════════════════════════════════════
{
  eq(HABITUAL_REEXAMINATION_BOUND, 2, 'A8: the bound is 2 (mentor-fixed)')

  // count 0 / 1 → still pause + examine (not terminated).
  for (const c of [0, 1]) {
    const r = recommendIntervention({ proximity: 'habitual', habitualReExaminationCount: c })
    eq(r.tableRow, 'habitual-pause', `A8: habitual count=${c} still pause+examine`)
    eq(r.habitualStable, false, `A8: habitual count=${c} not yet habitual-stable`)
    eq(r.followUp, 'examine', `A8: habitual count=${c} still re-examines`)
  }

  // count 2 (and 3) → escalate to Sage Reflect; action HELD (pause, not do-not-proceed).
  for (const c of [2, 3]) {
    const r = recommendIntervention({ proximity: 'habitual', habitualReExaminationCount: c })
    eq(r.tableRow, 'habitual-stable-escalate-to-reflect', `A8: habitual count=${c} terminates to Reflect`)
    eq(r.action, 'pause', `A8: habitual count=${c} action is HELD (pause, not do-not-proceed)`)
    eq(r.followUp, 'escalate', `A8: habitual count=${c} escalates (no re-examination)`)
    eq(r.habitualStable, true, `A8: habitual count=${c} habitualStable`)
    eq(r.reflectReferral, true, `A8: habitual count=${c} reflectReferral`)
    eq(r.reExamineDepth, undefined, `A8: habitual count=${c} carries NO re-examine depth`)
  }

  // The A8 bound applies ONLY to a habitual-driven pause — NOT to an indeterminate-
  // justice pause, even at a high count.
  const jInd = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'indeterminate', habitualReExaminationCount: 9 })
  eq(jInd.tableRow, 'justice-indeterminate-pause', 'A8: indeterminate-justice pause is NOT bounded by A8')
  eq(jInd.habitualStable, false, 'A8: indeterminate-justice pause never becomes habitual-stable')

  // A conflict that overrides a habitual pause to escalate is not A8-terminated
  // (it is already escalating for a different reason).
  const habConf = recommendIntervention({ proximity: 'habitual', sourceConflict: true, habitualReExaminationCount: 5 })
  eq(habConf.tableRow, 'source-conflict-pause-escalate', 'A8: conflict-overridden habitual pause is not habitual-stable')

  // applyHabitualPauseBound is a no-op on a non-habitual recommendation.
  const nonHab = recommendIntervention({ proximity: 'deliberate' })
  eq(applyHabitualPauseBound(nonHab, 5).tableRow, nonHab.tableRow, 'A8: bound is a no-op on a non-habitual rec')
}

// ════════════════════════════════════════════════════════════════════════════
// 4. Same-depth pause reuse (spec-7 constraint 1)
// ════════════════════════════════════════════════════════════════════════════
{
  eq(sameDepthOrStandard('quick'), 'standard', 'same-depth: quick → standard (floor)')
  eq(sameDepthOrStandard('standard'), 'standard', 'same-depth: standard → standard')
  eq(sameDepthOrStandard('deep'), 'deep', 'same-depth: deep → deep')

  // A habitual pause re-runs at the original depth (never below standard).
  const depths: [LoopDepthTier, LoopDepthTier][] = [['quick', 'standard'], ['standard', 'standard'], ['deep', 'deep']]
  for (const [orig, want] of depths) {
    const r = recommendIntervention({ proximity: 'habitual', originalDepth: orig })
    eq(r.reExamineDepth, want, `same-depth: habitual original=${orig} → re-examine ${want}`)
  }
  // Default original depth is standard.
  eq(recommendIntervention({ proximity: 'habitual' }).reExamineDepth, 'standard', 'same-depth: default original is standard')
  // A non-examine recommendation carries no reExamineDepth.
  eq(recommendIntervention({ proximity: 'reflexive' }).reExamineDepth, undefined, 'same-depth: do-not-proceed carries no re-examine depth')
}

// ════════════════════════════════════════════════════════════════════════════
// 5. MEASURE invariant — nothing binds; every recommendation is advisory
// ════════════════════════════════════════════════════════════════════════════
{
  for (const p of [...ALL_PROXIMITY, null] as (KatorthomaProximity | null)[]) {
    for (const j of ALL_JUSTICE) {
      for (const conflict of [false, true]) {
        const r = recommendIntervention({ proximity: p, justiceSurface: j, sourceConflict: conflict })
        eq(r.mode, 'measure', `measure: mode for ${p}/${j}/conflict=${conflict}`)
        eq(r.enforced, false, `measure: enforced=false for ${p}/${j}/conflict=${conflict}`)
        eq(r.humanOverridable, true, `measure: humanOverridable for ${p}/${j}/conflict=${conflict}`)
      }
    }
  }
  // Even the most conservative (do-not-proceed) recommendation is advisory + overridable.
  const block = recommendIntervention({ proximity: 'reflexive' })
  eq(block.enforced, false, 'measure: even do-not-proceed is enforced=false')
  eq(block.humanOverridable, true, 'measure: even do-not-proceed is humanOverridable')

  // Insufficient evidence (null aggregate) → pause + escalate, never a silent proceed.
  const none = recommendIntervention({ proximity: null })
  eq(none.tableRow, 'insufficient-evidence-pause-escalate', 'measure: null proximity → insufficient-evidence pause')
  eq(none.action, 'pause', 'measure: null proximity action pause')
  assert(none.action !== 'proceed', 'measure: null proximity never proceeds silently')
  // …but a violation still overrides insufficient-evidence to do-not-proceed.
  const noneViol = recommendIntervention({ proximity: null, justiceSurface: 'violated' })
  eq(noneViol.action, 'do-not-proceed', 'measure: null proximity + violation → do-not-proceed')
}

// ════════════════════════════════════════════════════════════════════════════
// 6. R20c — human override supremacy (supersedes ANY recommendation)
// ════════════════════════════════════════════════════════════════════════════
{
  const recs: InterventionRecommendation[] = [
    recommendIntervention({ proximity: 'sage_like' }),
    recommendIntervention({ proximity: 'reflexive' }),
    recommendIntervention({ proximity: 'deliberate', justiceSurface: 'unevaluated' }),
  ]
  for (const rec of recs) {
    for (const d of ['proceed', 'pause', 'do-not-proceed'] as InterventionAction[]) {
      const o = applyHumanOverride(rec, d)
      eq(o.action, d, `R20c: human decision ${d} supersedes ${rec.tableRow}`)
      eq(o.tableRow, 'human-override', `R20c: ${rec.tableRow} → human-override row on ${d}`)
      eq(o.overriddenBy, 'human', `R20c: overriddenBy human on ${d}`)
      assert(o.reasons.some((x) => x.includes('Human override supremacy')), `R20c: ${d} records the R20c reason`)
    }
    // No decision offered → the recommendation is unchanged.
    const same = applyHumanOverride(rec)
    eq(same.tableRow, rec.tableRow, `R20c: no override → unchanged (${rec.tableRow})`)
    eq(same.overriddenBy, undefined, 'R20c: no override → overriddenBy undefined')
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 7. Escalation payload contract (spec-7 constraint 2)
// ════════════════════════════════════════════════════════════════════════════
{
  const rec = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'violated' })
  const complete = buildEscalationPayload({
    recommendation: rec,
    reasoningTrace: { assessmentRef: 'sig-123', signatureKeyId: 'substrate-layer2-2026Q2', causalSummary: 'impression → assent → reflexive' },
    domainBreakdown: [{ domain: 'dikaiosyne', level: 'reflexive', justiceCapped: false }],
    justiceRecord: { surface: 'violated', perCircle: [{ circle: 'local_community', status: 'violated' }] },
  })
  const c = escalationPayloadComplete(complete)
  eq(c.complete, true, 'escalation: complete payload passes')
  eq(c.missing.length, 0, 'escalation: complete payload has no missing parts')

  // Auto-fill: a justice-surface rec with no explicit record still gets one.
  const autofilled = buildEscalationPayload({
    recommendation: rec,
    reasoningTrace: { assessmentRef: 'sig-1' },
    domainBreakdown: [{ domain: 'dikaiosyne', level: 'reflexive' }],
  })
  assert(autofilled.justiceRecord !== null, 'escalation: justice-surface rec auto-fills a justice record')

  // Missing trace ref → flagged.
  const noTrace: EscalationPayload = { ...complete, reasoningTrace: { assessmentRef: '  ' } }
  const nt = escalationPayloadComplete(noTrace)
  eq(nt.complete, false, 'escalation: blank trace ref flagged incomplete')
  assert(nt.missing.some((m) => m.includes('reasoningTrace')), 'escalation: names the missing trace')

  // Empty domain breakdown → flagged.
  const noBreak: EscalationPayload = { ...complete, domainBreakdown: [] }
  const nb = escalationPayloadComplete(noBreak)
  eq(nb.complete, false, 'escalation: empty domain breakdown flagged incomplete')
  assert(nb.missing.some((m) => m.includes('domainBreakdown')), 'escalation: names the missing breakdown')

  // Justice surface present but no justice record → flagged (validator, not just verdict).
  const noJustice: EscalationPayload = { ...complete, justiceRecord: null }
  const nj = escalationPayloadComplete(noJustice)
  eq(nj.complete, false, 'escalation: justice surface present + null record flagged')
  assert(nj.missing.some((m) => m.includes('justiceRecord')), 'escalation: names the missing justice record')

  // A no-justice-surface recommendation does NOT require a justice record.
  const recNoJustice = recommendIntervention({ proximity: 'habitual' })
  const noJusticeNeeded = buildEscalationPayload({
    recommendation: recNoJustice,
    reasoningTrace: { assessmentRef: 'sig-2' },
    domainBreakdown: [{ domain: 'phronesis', level: 'habitual' }],
    justiceRecord: null,
  })
  eq(escalationPayloadComplete(noJusticeNeeded).complete, true, 'escalation: no justice surface → justice record not required')
  eq(noJusticeNeeded.justiceRecord, null, 'escalation: no-justice-surface payload has null justice record')
}

// ════════════════════════════════════════════════════════════════════════════
// 8. Developmental flag (spec-7 constraint 3) — tracked, not intervened
// ════════════════════════════════════════════════════════════════════════════
{
  eq(DEVELOPMENTAL_CONSISTENCY_THRESHOLD, 3, 'dev-flag: threshold is 3 (derived default)')
  const t = (n: number) => new Date(2026, 0, n).toISOString()

  // 3 consecutive deliberate in phronesis → flag.
  const flag3 = evaluateDevelopmentalFlags([
    { sessionId: 's1', domain: 'phronesis', level: 'deliberate', occurredAt: t(1) },
    { sessionId: 's2', domain: 'phronesis', level: 'deliberate', occurredAt: t(2) },
    { sessionId: 's3', domain: 'phronesis', level: 'deliberate', occurredAt: t(3) },
  ])
  eq(flag3.length, 1, 'dev-flag: 3 consecutive deliberate → one flag')
  eq(flag3[0]?.domain, 'phronesis', 'dev-flag: flag on phronesis')
  eq(flag3[0]?.consecutiveDeliberateSessions, 3, 'dev-flag: run length 3')

  // 2 consecutive deliberate → no flag.
  const flag2 = evaluateDevelopmentalFlags([
    { sessionId: 's1', domain: 'sophrosyne', level: 'deliberate', occurredAt: t(1) },
    { sessionId: 's2', domain: 'sophrosyne', level: 'deliberate', occurredAt: t(2) },
  ])
  eq(flag2.length, 0, 'dev-flag: 2 consecutive deliberate → no flag')

  // The RECENT run counts (a break resets it): a principled at the END → run 0.
  const broken = evaluateDevelopmentalFlags([
    { sessionId: 's1', domain: 'andreia', level: 'deliberate', occurredAt: t(1) },
    { sessionId: 's2', domain: 'andreia', level: 'deliberate', occurredAt: t(2) },
    { sessionId: 's3', domain: 'andreia', level: 'deliberate', occurredAt: t(3) },
    { sessionId: 's4', domain: 'andreia', level: 'principled', occurredAt: t(4) },
  ])
  eq(broken.length, 0, 'dev-flag: recent run broken by a principled → no flag')

  // A break in the middle then 3 recent deliberate → flag (most-recent run = 3).
  const recentRun = evaluateDevelopmentalFlags([
    { sessionId: 's1', domain: 'dikaiosyne', level: 'deliberate', occurredAt: t(1) },
    { sessionId: 's2', domain: 'dikaiosyne', level: 'principled', occurredAt: t(2) },
    { sessionId: 's3', domain: 'dikaiosyne', level: 'deliberate', occurredAt: t(3) },
    { sessionId: 's4', domain: 'dikaiosyne', level: 'deliberate', occurredAt: t(4) },
    { sessionId: 's5', domain: 'dikaiosyne', level: 'deliberate', occurredAt: t(5) },
  ])
  eq(recentRun.length, 1, 'dev-flag: most-recent run of 3 deliberate → flag')
  eq(recentRun[0]?.consecutiveDeliberateSessions, 3, 'dev-flag: recent run length 3 (not the full 4)')

  // Tracked, not intervened — the flag scan is a separate function; recommendIntervention
  // has no developmental-flag input and never changes on the history. (Structural: the
  // recommendation for a `deliberate` action is identical regardless of history.)
  const r = recommendIntervention({ proximity: 'deliberate', justiceSurface: 'none' })
  eq(r.action, 'proceed', 'dev-flag: a deliberate action still proceeds (flag never intervenes)')
}

// ════════════════════════════════════════════════════════════════════════════
// 9. A8 tail — the orchestrator's decision is itself trust-relevant
// ════════════════════════════════════════════════════════════════════════════
{
  const proceed = recordOrchestratorHabitualDecision({
    decision: 'proceed', escalatedAssessmentRef: 'sig-hab-1', occurredAt: '2026-07-08T00:00:00Z', agentId: 'a:1', habitualDomain: 'phronesis',
  })
  assert(proceed !== null, 'A8 tail: proceed-under-flag produces an event')
  eq(proceed?.eventType, 'orchestrator-proceeds-under-habitual-flag', 'A8 tail: correct event type')
  eq(proceed?.virtueDomain, 'oversight', 'A8 tail: oversight domain')
  eq(proceed?.artifactKind, 'signed_layer2_assessment', 'A8 tail: R18f-parallel artifact kind')
  eq(proceed?.artifactRef, 'sig-hab-1', 'A8 tail: artifactRef = escalated verdict ref')

  // select-different / hold → NO event.
  eq(recordOrchestratorHabitualDecision({ decision: 'select-different', escalatedAssessmentRef: 'x', occurredAt: '2026-07-08T00:00:00Z', agentId: 'a:1' }), null, 'A8 tail: select-different → no event')
  eq(recordOrchestratorHabitualDecision({ decision: 'hold', escalatedAssessmentRef: 'x', occurredAt: '2026-07-08T00:00:00Z', agentId: 'a:1' }), null, 'A8 tail: hold → no event')

  // proceed but NO verifiable artifact → no event (R18f-parallel; never fabricate).
  eq(recordOrchestratorHabitualDecision({ decision: 'proceed', escalatedAssessmentRef: '  ', occurredAt: '2026-07-08T00:00:00Z', agentId: 'a:1' }), null, 'A8 tail: proceed with blank ref → no event (R18f-parallel)')
}

// ════════════════════════════════════════════════════════════════════════════
// 10. A4 transparency ledger — grades + functional threshold + deficit
// ════════════════════════════════════════════════════════════════════════════
{
  // Single-output grades.
  const signed = assessOutputExaminability(feat({ hasSignedTrace: true }))
  eq(signed.grade, 'signed-trace', 'A4: signed trace grade')
  eq(signed.independence, 'met-full', 'A4: signed trace → met-full')
  eq(signed.examinable, true, 'A4: signed trace examinable')

  const stated = assessOutputExaminability(feat({ hasStatedUncertainty: true, hasStructuredVerdict: true }))
  eq(stated.grade, 'stated-uncertainty', 'A4: stated uncertainty + structured verdict grade')
  eq(stated.independence, 'met-reduced', 'A4: stated uncertainty → met-reduced')

  const structured = assessOutputExaminability(feat({ hasStructuredVerdict: true }))
  eq(structured.grade, 'structured-verdict', 'A4: structured verdict (minimum) grade')
  eq(structured.independence, 'met-reduced', 'A4: structured verdict → met-reduced (minimum threshold)')
  eq(structured.examinable, true, 'A4: structured verdict is examinable (the minimum)')

  const bare = assessOutputExaminability(feat({}))
  eq(bare.grade, 'bare-conclusion', 'A4: bare conclusion grade')
  eq(bare.independence, 'not-met', 'A4: bare conclusion → not-met')
  eq(bare.examinable, false, 'A4: bare conclusion NOT examinable')

  // Stated uncertainty WITHOUT a structured verdict does NOT meet the threshold.
  const uncertainOnly = assessOutputExaminability(feat({ hasStatedUncertainty: true }))
  eq(uncertainOnly.grade, 'bare-conclusion', 'A4: stated uncertainty without structure → bare conclusion')
  eq(uncertainOnly.examinable, false, 'A4: stated uncertainty without structure is not examinable')

  // Per-domain: weakest output sets the ceiling; a bare conclusion → deficit.
  const good = assessDomainTransparency('phronesis', [feat({ hasSignedTrace: true }), feat({ hasStructuredVerdict: true })])
  eq(good.grade, 'structured-verdict', 'A4: per-domain ceiling = weakest output')
  eq(good.independenceDeficit, false, 'A4: no bare output → no deficit')
  eq(good.examinableRatio, 1, 'A4: all outputs examinable → ratio 1')

  const deficit = assessDomainTransparency('dikaiosyne', [feat({ hasSignedTrace: true }), feat({})])
  eq(deficit.grade, 'bare-conclusion', 'A4: a bare output pulls the domain ceiling to bare')
  eq(deficit.independenceDeficit, true, 'A4: a bare output → independence deficit')
  eq(deficit.examinableRatio, 0.5, 'A4: 1 of 2 examinable → ratio 0.5')

  // Empty outputs → an evidence gap → deficit (conservative).
  const empty = assessDomainTransparency('andreia', [])
  eq(empty.independenceDeficit, true, 'A4: empty outputs → deficit (conservative)')
  eq(empty.examinableRatio, 0, 'A4: empty outputs → ratio 0')

  // Full ledger — deficits list only the deficit domains.
  const ledger = buildTransparencyLedger([
    { domain: 'phronesis', outputs: [feat({ hasSignedTrace: true })] },
    { domain: 'dikaiosyne', outputs: [feat({})] },
    { domain: 'sophrosyne', outputs: [feat({ hasStructuredVerdict: true })] },
  ])
  eq(ledger.anyDeficit, true, 'A4 ledger: anyDeficit true when a domain is opaque')
  eq(ledger.deficits.length, 1, 'A4 ledger: exactly the deficit domains listed')
  eq(ledger.deficits[0]?.domain, 'dikaiosyne', 'A4 ledger: the opaque domain flagged')
  eq(ledger.entries.length, 3, 'A4 ledger: all domains have an entry')
  // Per-domain isolation: phronesis stays fully examinable despite dikaiosyne's deficit.
  const ph = ledger.entries.find((e) => e.domain === 'phronesis')
  eq(ph?.independenceDeficit, false, 'A4 ledger: a strong domain is unaffected by a weak one (per-domain)')
}

// ════════════════════════════════════════════════════════════════════════════
// 11. The S3 → S4 consumption seam
// ════════════════════════════════════════════════════════════════════════════
{
  function agg(o: Partial<WeightedAggregateTrust> = {}): WeightedAggregateTrust {
    return {
      level: 'deliberate', limitingDomain: 'phronesis', resolution: 'combined',
      anyConflict: false, anyJusticeCapped: false, coverageGaps: [], aggregateConfidenceWeight: 0.7,
      basis: 'test', ...o,
    }
  }
  function obl(o: Partial<CombinedObligationVerdict> = {}): CombinedObligationVerdict {
    return {
      verdict: 'met', resolution: 'deterministic-authoritative', conflict: false, llmConsulted: false,
      llmOwedButAbsent: false, llmConfidence: null, regime: 'default-no-justice', routingBasis: 'test',
      sources: { deterministic: 'met', llm: null }, ...o,
    }
  }

  // No justice surface → proximity carried through, justiceSurface none.
  const s1 = interventionInputFromS3({ aggregate: agg({ level: 'deliberate' }), taskHasJusticeSurface: false })
  eq(s1.proximity, 'deliberate', 'seam: aggregate level → proximity')
  eq(s1.justiceSurface, 'none', 'seam: no justice surface → none')
  eq(s1.sourceConflict, false, 'seam: no conflict')

  // aggregate.anyConflict → sourceConflict.
  const s2 = interventionInputFromS3({ aggregate: agg({ anyConflict: true }), taskHasJusticeSurface: false })
  eq(s2.sourceConflict, true, 'seam: aggregate conflict → sourceConflict')

  // obligation conflict → sourceConflict.
  const s3 = interventionInputFromS3({ aggregate: agg(), obligation: obl({ conflict: true, verdict: null }), taskHasJusticeSurface: true })
  eq(s3.sourceConflict, true, 'seam: obligation conflict → sourceConflict')

  // taskHasJusticeSurface + obligation violated → justiceSurface violated.
  const s4 = interventionInputFromS3({ aggregate: agg({ level: 'reflexive' }), obligation: obl({ verdict: 'violated' }), taskHasJusticeSurface: true })
  eq(s4.justiceSurface, 'violated', 'seam: obligation verdict → justiceSurface')

  // conflict (verdict null) → justiceSurface falls back to the deterministic source read.
  const s5 = interventionInputFromS3({ aggregate: agg(), obligation: obl({ verdict: null, conflict: true, sources: { deterministic: 'unevaluated', llm: 'met' } }), taskHasJusticeSurface: true })
  eq(s5.justiceSurface, 'unevaluated', 'seam: conflict verdict null → deterministic source read for the record')
  // End-to-end: a routing conflict whose deterministic read is 'unevaluated' resolves to
  // do-not-proceed (the recorded read outranks the conflict's pause — the safe direction),
  // NOT source-conflict-pause-escalate. Pins the seam docstring.
  const s5e = recommendIntervention(s5)
  eq(s5e.action, 'do-not-proceed', 'seam: conflict + deterministic unevaluated → do-not-proceed end-to-end (conservative)')
  eq(s5e.tableRow, 'justice-unevaluated-do-not-proceed', 'seam: conflict + deterministic unevaluated → justice-unevaluated row (not pause)')
  assert(s5e.sourceConflict === true && s5e.reasons.some((x) => x.includes('conflict')), 'seam: the conflict is still recorded even when the unevaluated read gates')

  // null aggregate level end-to-end → insufficient-evidence pause + escalate.
  const s6in = interventionInputFromS3({ aggregate: agg({ level: null }), taskHasJusticeSurface: false })
  eq(s6in.proximity, null, 'seam: null aggregate level → null proximity')
  const s6 = recommendIntervention(s6in)
  eq(s6.tableRow, 'insufficient-evidence-pause-escalate', 'seam: null proximity → insufficient-evidence pause end-to-end')

  // End-to-end: a real S3 conflict → pause + escalate through the seam.
  const s7 = recommendIntervention(interventionInputFromS3({ aggregate: agg({ level: 'deliberate', anyConflict: true }), taskHasJusticeSurface: false }))
  eq(s7.tableRow, 'source-conflict-pause-escalate', 'seam: aggregate conflict → pause+escalate end-to-end')
}

// ════════════════════════════════════════════════════════════════════════════
// §W3 — the logos-on staging pins (2026-08-01 plan §3 W3.2, verdicts L6 and L4)
//
// Built 2026-09-12 under a recorded founder waiver, bundled with the Part-1
// pooled-span correction. These are the two pins the logos-on plan named and
// the S11 register's §F carried as "named, NOT built". They are SOURCE pins by
// design: both verdicts are structural claims about what the enforce path can
// see, and the honest way to hold a structural claim is to assert the structure
// rather than to test one input that happens not to exist.
//
// L6 (verbatim): "The enforce layer may not consume the orientation reading...
// Consuming the orientation reading converts it into an optimisation target by
// the back door... The instrument defeats itself."
//
// L4 (verbatim): "Enforcement against the agent's own assent is a category
// error. The first circle remains measure-only even under logos-on... If the
// infrastructure blocks an action because the agent's assent was given under
// task pressure, the infrastructure has not restored the agent's reasoning
// integrity — it has bypassed it entirely."
// ════════════════════════════════════════════════════════════════════════════
{
  const engineSrc = readFileSync(
    join(__dirname, '..', 'intervention-engine.ts'),
    'utf-8',
  )
  // Strip comments before grepping: a verdict quoted in a docstring must not
  // satisfy a pin about what the CODE consumes. (The same discipline the R20a
  // guard battery applies for the same reason.)
  const engineCode = engineSrc
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

  // --- L6: the orientation reading never reaches the enforce path -----------
  assert(
    !/orientation/i.test(engineCode),
    '§W3.1 (L6) intervention-engine.ts CODE contains no reference to orientation — the reading never reaches the enforce path',
  )
  // NON-VACUITY, via a POSITIVE CONTROL — and this control earned its place.
  // The first draft of §W3.1b asserted that "orientation" appears in the file's
  // docstrings, on the assumption that the comment-strip was doing the work.
  // It went RED: the word is absent from intervention-engine.ts entirely, so
  // §W3.1 had been passing on an absent word rather than on a stripped comment.
  // That is the vacuous-pass class this project keeps being bitten by, caught
  // here by the check written to catch it. The honest replacement proves the
  // grep MACHINERY is live — it must find a token that genuinely is in the code
  // — so a future §W3.1 pass means "not present" rather than "grep broken".
  assert(
    /justiceSurface/.test(engineCode),
    '§W3.1b (L6) non-vacuity POSITIVE CONTROL: the comment-stripped source grep finds a token that IS in the code, so §W3.1’s absence result is a real absence',
  )
  // The structural form of the same claim: the input surface the enforce path
  // reads carries five fields, none of them an orientation reading. Asserted on
  // the interface body so a future field addition has to confront this pin.
  const inputBlock = engineSrc.slice(
    engineSrc.indexOf('export interface InterventionInput'),
    engineSrc.indexOf('export interface InterventionRecommendation'),
  )
  assert(
    inputBlock.length > 100 && !/orientation/i.test(inputBlock.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')),
    '§W3.2 (L6) InterventionInput declares no orientation field',
  )

  // --- L4: no enforcement path keys on first-circle-only findings ----------
  // The first circle is the agent's own reasoning integrity (prohairesis /
  // self-preservation). The engine's only circle-shaped input is
  // `justiceSurface`, whose vocabulary is other-directed by construction.
  assert(
    !/prohairesis|self_preservation|selfCircle|firstCircle/i.test(engineCode),
    '§W3.3 (L4) intervention-engine.ts CODE keys on no first-circle concept (prohairesis / self_preservation / selfCircle / firstCircle)',
  )
  assert(
    inputBlock.length > 100 &&
      !/prohairesis|self_preservation|selfCircle|firstCircle/i.test(inputBlock),
    '§W3.4 (L4) InterventionInput declares no first-circle field — a first-circle finding cannot be an enforce input',
  )
  // PR19 FOLD (2026-09-12, HIGH, confirmed by live mutation): the first draft
  // pinned `ALL_JUSTICE` — a constant this TEST FILE declares independently
  // (line ~69) — not the actual exported `JusticeSurfaceState` union. Adding a
  // 'self_regarding' member to the real type left `ALL_JUSTICE` untouched and
  // the pin green: it was asserting the test's own fixture never drifted, not
  // that the type carries no self-regarding value. The comment's own claim
  // ("pinned against the exported type's own values") was false. Fixed to
  // source-grep the real union body from the file, comment-stripped, so a
  // future self-regarding addition to the ACTUAL type trips this pin.
  const justiceUnionBlock = engineSrc.slice(
    engineSrc.indexOf('export type JusticeSurfaceState'),
    engineSrc.indexOf('\n\n', engineSrc.indexOf('export type JusticeSurfaceState')),
  ).replace(/\/\/.*$/gm, '')
  assert(
    justiceUnionBlock.length > 20 && !/self.?regard/i.test(justiceUnionBlock),
    '§W3.5 (L4) the ACTUAL JusticeSurfaceState union (source-grepped, not the test fixture) carries no self-regarding value',
  )
}

// ════════════════════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════════════════════
console.log(`\nS4 intervention-engine + transparency-ledger battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
